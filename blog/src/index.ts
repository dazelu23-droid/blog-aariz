import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import {
  createSession,
  hashPassword,
  timingSafeEqual,
  verifyPassword,
  verifySession,
} from "./auth";
import { ensureHomeData } from "./db";
import {
  renderError,
  renderHomeType,
  renderIndex,
  renderLogin,
  renderSearch,
  renderSignup,
  type CommentNode,
  type HomeImage,
  type HomeTypeDetail,
  type HomeTypeSummary,
} from "./templates";
import {
  escapeLike,
  safeNextUrl,
  SECURITY_HEADERS,
  validateComment,
  validateEmail,
  validatePassword,
  validateRating,
  validateUsername,
} from "./utils";

type Bindings = {
  DB: D1Database;
  ASSETS: Fetcher;
  SECRET_KEY?: string;
};

type Session = { userId: number; username: string; csrf: string };

const app = new Hono<{ Bindings: Bindings }>();

function secret(c: { env: Bindings }): string {
  return c.env.SECRET_KEY || "dev";
}

function htmlResponse(html: string, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(html, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", ...SECURITY_HEADERS, ...headers },
  });
}

function jsonResponse(data: unknown, status = 200): Response {
  return Response.json(data, { status, headers: SECURITY_HEADERS });
}

function redirectResponse(url: string, setCookieHeader?: string): Response {
  const headers: Record<string, string> = { Location: url, ...SECURITY_HEADERS };
  if (setCookieHeader) headers["Set-Cookie"] = setCookieHeader;
  return new Response(null, { status: 302, headers });
}

async function getSession(c: { req: { header: (n: string) => string | undefined }; env: Bindings }): Promise<Session | null> {
  const raw = getCookie(c as never, "session");
  if (!raw) return null;
  return verifySession(raw, secret(c));
}

function sessionCookie(value: string, secure: boolean): string {
  const flags = `Path=/; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}; Max-Age=604800`;
  return `session=${value}; ${flags}`;
}

async function getGuestCsrf(c: { env: Bindings }): Promise<string> {
  const existing = getCookie(c as never, "guest_csrf");
  if (existing) return existing;
  return [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function withCsrf(
  c: { req: { header: (n: string) => string | undefined }; env: Bindings },
  session: Session | null,
): Promise<{ csrf: string; setGuestCookie: boolean }> {
  const guestCsrf = await getGuestCsrf(c);
  const csrf = session?.csrf || guestCsrf;
  const setGuestCookie = !session && !getCookie(c as never, "guest_csrf");
  return { csrf, setGuestCookie };
}

function attachGuestCookie(resp: Response, guestCsrf: string): Response {
  resp.headers.append("Set-Cookie", `guest_csrf=${guestCsrf}; Path=/; SameSite=Lax; Max-Age=604800`);
  return resp;
}

async function requireCsrf(
  c: { req: { header: (n: string) => string | undefined }; env: Bindings },
  session: Session | null,
): Promise<boolean> {
  const guestCsrf = await getGuestCsrf(c);
  const csrfVal = session?.csrf || guestCsrf;
  const token = c.req.header("X-CSRF-Token");
  if (!token || !timingSafeEqual(csrfVal, token)) return false;
  return true;
}

async function fetchHomeSummaries(db: D1Database): Promise<HomeTypeSummary[]> {
  const { results } = await db
    .prepare(
      `SELECT ht.id, ht.slug, ht.name, ht.description, ht.hero_image_url,
              COALESCE(AVG(r.stars), 0) AS avg_rating,
              COUNT(DISTINCT r.id) AS rating_count,
              COUNT(DISTINCT hc.id) AS comment_count
       FROM home_types ht
       LEFT JOIN ratings r ON r.home_type_id = ht.id
       LEFT JOIN home_comments hc ON hc.home_type_id = ht.id
       GROUP BY ht.id
       ORDER BY ht.sort_order ASC, ht.id ASC`,
    )
    .all();
  return (results as Record<string, unknown>[]).map((row) => ({
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: String(row.description),
    hero_image_url: String(row.hero_image_url),
    avg_rating: Number(row.avg_rating) || 0,
    rating_count: Number(row.rating_count) || 0,
    comment_count: Number(row.comment_count) || 0,
  }));
}

async function fetchCommentTree(
  db: D1Database,
  homeTypeId: number,
  userId: number | null,
): Promise<CommentNode[]> {
  const { results } = await db
    .prepare(
      `SELECT hc.*, u.username AS author FROM home_comments hc
       JOIN users u ON hc.user_id = u.id
       WHERE hc.home_type_id = ?
       ORDER BY hc.created_at ASC, hc.id ASC`,
    )
    .bind(homeTypeId)
    .all();

  const rows = results as {
    id: number;
    parent_id: number | null;
    author: string;
    body: string;
    created_at: string;
  }[];

  const reactionMap = new Map<number, { likes: number; dislikes: number; user_reaction: string | null }>();
  if (rows.length) {
    const ids = rows.map((r) => r.id);
    const placeholders = ids.map(() => "?").join(",");
    const { results: reactions } = await db
      .prepare(`SELECT comment_id, kind, COUNT(*) AS cnt FROM comment_reactions WHERE comment_id IN (${placeholders}) GROUP BY comment_id, kind`)
      .bind(...ids)
      .all();
    for (const id of ids) reactionMap.set(id, { likes: 0, dislikes: 0, user_reaction: null });
    for (const r of reactions as { comment_id: number; kind: string; cnt: number }[]) {
      const entry = reactionMap.get(r.comment_id)!;
      if (r.kind === "like") entry.likes = r.cnt;
      else entry.dislikes = r.cnt;
    }
    if (userId) {
      const { results: userReactions } = await db
        .prepare(`SELECT comment_id, kind FROM comment_reactions WHERE user_id = ? AND comment_id IN (${placeholders})`)
        .bind(userId, ...ids)
        .all();
      for (const r of userReactions as { comment_id: number; kind: string }[]) {
        reactionMap.get(r.comment_id)!.user_reaction = r.kind;
      }
    }
  }

  const nodes = new Map<number, CommentNode>();
  for (const row of rows) {
    const rx = reactionMap.get(row.id) || { likes: 0, dislikes: 0, user_reaction: null };
    nodes.set(row.id, {
      id: row.id,
      author: row.author,
      body: row.body,
      created_at: row.created_at,
      parent_id: row.parent_id,
      likes: rx.likes,
      dislikes: rx.dislikes,
      user_reaction: rx.user_reaction,
      replies: [],
    });
  }

  const roots: CommentNode[] = [];
  for (const node of nodes.values()) {
    if (node.parent_id && nodes.has(node.parent_id)) {
      nodes.get(node.parent_id)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

app.get("/style.css", async (c) => c.env.ASSETS.fetch(c.req.raw));
app.get("/theme.js", async (c) => c.env.ASSETS.fetch(c.req.raw));
app.get("/home.js", async (c) => c.env.ASSETS.fetch(c.req.raw));

app.get("/", async (c) => {
  await ensureHomeData(c.env.DB);
  const session = await getSession(c);
  const { csrf, setGuestCookie } = await withCsrf(c, session);
  const homes = await fetchHomeSummaries(c.env.DB);
  const user = session ? { id: session.userId, username: session.username } : null;
  const resp = htmlResponse(renderIndex(homes, user, csrf));
  if (setGuestCookie) attachGuestCookie(resp, csrf);
  return resp;
});

app.get("/home/:slug", async (c) => {
  await ensureHomeData(c.env.DB);
  const session = await getSession(c);
  const { csrf } = await withCsrf(c, session);
  const slug = c.req.param("slug");

  const home = (await c.env.DB.prepare("SELECT * FROM home_types WHERE slug = ?").bind(slug).first()) as HomeTypeDetail | null;
  if (!home) {
    const user = session ? { id: session.userId, username: session.username } : null;
    return htmlResponse(renderError(404, "Home style not found", user, csrf), 404);
  }

  const { results: images } = await c.env.DB
    .prepare("SELECT id, url, alt FROM home_images WHERE home_type_id = ? ORDER BY sort_order ASC, id ASC")
    .bind(home.id)
    .all();

  const ratingRow = (await c.env.DB
    .prepare("SELECT COALESCE(AVG(stars), 0) AS avg_rating, COUNT(*) AS rating_count FROM ratings WHERE home_type_id = ?")
    .bind(home.id)
    .first()) as { avg_rating: number; rating_count: number };

  let userRating: number | null = null;
  if (session) {
    const ur = (await c.env.DB.prepare("SELECT stars FROM ratings WHERE home_type_id = ? AND user_id = ?").bind(home.id, session.userId).first()) as { stars: number } | null;
    userRating = ur?.stars ?? null;
  }

  const comments = await fetchCommentTree(c.env.DB, home.id, session?.userId ?? null);
  const user = session ? { id: session.userId, username: session.username } : null;
  return htmlResponse(
    renderHomeType(
      home,
      images as HomeImage[],
      Number(ratingRow.avg_rating) || 0,
      Number(ratingRow.rating_count) || 0,
      userRating,
      comments,
      user,
      csrf,
    ),
  );
});

app.get("/signup", async (c) => {
  const session = await getSession(c);
  const { csrf, setGuestCookie } = await withCsrf(c, session);
  const user = session ? { id: session.userId, username: session.username } : null;
  const resp = htmlResponse(renderSignup([], "", "", user, csrf));
  if (setGuestCookie) attachGuestCookie(resp, csrf);
  return resp;
});

app.post("/signup", async (c) => {
  const session = await getSession(c);
  const { csrf } = await withCsrf(c, session);
  const body = await c.req.parseBody();
  if (!timingSafeEqual(csrf, String(body.csrf_token || ""))) return htmlResponse("Bad Request", 400);

  const username = String(body.username || "");
  const email = String(body.email || "").toLowerCase();
  const password = String(body.password || "");
  const errors: string[] = [];
  const uErr = validateUsername(username);
  if (uErr) errors.push(uErr);
  const eErr = validateEmail(email);
  if (eErr) errors.push(eErr);
  const pErr = validatePassword(password);
  if (pErr) errors.push(pErr);

  if (!errors.length) {
    const exists = await c.env.DB.prepare("SELECT 1 FROM users WHERE username = ? COLLATE NOCASE").bind(username.trim()).first();
    if (exists) errors.push("That username is already taken.");
    const emailExists = await c.env.DB.prepare("SELECT 1 FROM users WHERE email = ?").bind(email).first();
    if (emailExists) errors.push("That email is already registered.");
  }

  const user = session ? { id: session.userId, username: session.username } : null;
  if (errors.length) return htmlResponse(renderSignup(errors, username, email, user, csrf), 400);

  const hash = await hashPassword(password);
  try {
    await c.env.DB.prepare("INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)")
      .bind(username.trim(), email, hash).run();
  } catch {
    return htmlResponse(renderSignup(["That username is already taken."], username, email, user, csrf), 400);
  }
  return redirectResponse("/login");
});

app.get("/login", async (c) => {
  const session = await getSession(c);
  const { csrf, setGuestCookie } = await withCsrf(c, session);
  const next = c.req.query("next") || "";
  const user = session ? { id: session.userId, username: session.username } : null;
  const resp = htmlResponse(renderLogin([], "", next, user, csrf));
  if (setGuestCookie) attachGuestCookie(resp, csrf);
  return resp;
});

app.post("/login", async (c) => {
  const guestCsrf = await getGuestCsrf(c);
  const body = await c.req.parseBody();
  if (!timingSafeEqual(guestCsrf, String(body.csrf_token || ""))) return htmlResponse("Bad Request", 400);

  const username = String(body.username || "");
  const password = String(body.password || "");
  const next = String(body.next || "");

  const row = await c.env.DB.prepare("SELECT * FROM users WHERE username = ? COLLATE NOCASE").bind(username.trim()).first() as Record<string, unknown> | null;
  if (!row || !(await verifyPassword(password, String(row.password_hash)))) {
    return htmlResponse(renderLogin(["Invalid username or password."], username, next, null, guestCsrf), 400);
  }

  const { cookie } = await createSession(Number(row.id), String(row.username), secret(c));
  const dest = safeNextUrl(next) || "/";
  const secure = c.req.url.startsWith("https");
  return redirectResponse(dest, sessionCookie(cookie, secure));
});

app.post("/logout", async (c) => {
  const session = await getSession(c);
  if (!session) return htmlResponse("Bad Request", 400);
  const body = await c.req.parseBody();
  if (!timingSafeEqual(session.csrf, String(body.csrf_token || ""))) return htmlResponse("Bad Request", 400);
  deleteCookie(c, "session");
  return redirectResponse("/");
});

app.get("/search", async (c) => {
  await ensureHomeData(c.env.DB);
  const session = await getSession(c);
  const { csrf } = await withCsrf(c, session);
  const q = c.req.query("q") || "";
  const user = session ? { id: session.userId, username: session.username } : null;

  if (!q.trim()) return htmlResponse(renderSearch([], q, true, user, csrf));

  const pattern = `%${escapeLike(q.trim().slice(0, 100))}%`;
  const { results } = await c.env.DB
    .prepare(
      `SELECT ht.id, ht.slug, ht.name, ht.description, ht.hero_image_url,
              COALESCE(AVG(r.stars), 0) AS avg_rating,
              COUNT(DISTINCT r.id) AS rating_count,
              COUNT(DISTINCT hc.id) AS comment_count
       FROM home_types ht
       LEFT JOIN ratings r ON r.home_type_id = ht.id
       LEFT JOIN home_comments hc ON hc.home_type_id = ht.id
       WHERE ht.name LIKE ? ESCAPE '\\' COLLATE NOCASE OR ht.description LIKE ? ESCAPE '\\' COLLATE NOCASE
       GROUP BY ht.id
       ORDER BY ht.sort_order ASC`,
    )
    .bind(pattern, pattern)
    .all();

  const homes = (results as Record<string, unknown>[]).map((row) => ({
    id: Number(row.id),
    slug: String(row.slug),
    name: String(row.name),
    description: String(row.description),
    hero_image_url: String(row.hero_image_url),
    avg_rating: Number(row.avg_rating) || 0,
    rating_count: Number(row.rating_count) || 0,
    comment_count: Number(row.comment_count) || 0,
  }));
  return htmlResponse(renderSearch(homes, q, false, user, csrf));
});

app.post("/api/home/:slug/rate", async (c) => {
  const session = await getSession(c);
  if (!session) return jsonResponse({ ok: false, error: "Please log in first." }, 401);
  if (!(await requireCsrf(c, session))) return jsonResponse({ ok: false, error: "Invalid or missing CSRF token." }, 400);

  const data = await c.req.json().catch(() => ({})) as { stars?: unknown };
  const err = validateRating(data.stars);
  if (err) return jsonResponse({ ok: false, error: err }, 400);

  const home = await c.env.DB.prepare("SELECT id FROM home_types WHERE slug = ?").bind(c.req.param("slug")).first() as { id: number } | null;
  if (!home) return jsonResponse({ ok: false, error: "Home style not found." }, 404);

  const stars = Number(data.stars);
  const existing = await c.env.DB.prepare("SELECT id FROM ratings WHERE home_type_id = ? AND user_id = ?").bind(home.id, session.userId).first();
  if (existing) {
    await c.env.DB.prepare("UPDATE ratings SET stars = ? WHERE home_type_id = ? AND user_id = ?").bind(stars, home.id, session.userId).run();
  } else {
    await c.env.DB.prepare("INSERT INTO ratings (home_type_id, user_id, stars) VALUES (?, ?, ?)").bind(home.id, session.userId, stars).run();
  }

  const ratingRow = (await c.env.DB
    .prepare("SELECT COALESCE(AVG(stars), 0) AS avg_rating, COUNT(*) AS rating_count FROM ratings WHERE home_type_id = ?")
    .bind(home.id)
    .first()) as { avg_rating: number; rating_count: number };

  return jsonResponse({
    ok: true,
    stars,
    avg_rating: Number(ratingRow.avg_rating) || 0,
    rating_count: Number(ratingRow.rating_count) || 0,
  });
});

app.post("/api/home/:slug/comment", async (c) => {
  const session = await getSession(c);
  if (!session) return jsonResponse({ ok: false, error: "Please log in first." }, 401);
  if (!(await requireCsrf(c, session))) return jsonResponse({ ok: false, error: "Invalid or missing CSRF token." }, 400);

  const data = await c.req.json().catch(() => ({})) as { body?: unknown };
  const err = validateComment(data.body);
  if (err) return jsonResponse({ ok: false, error: err }, 400);

  const home = await c.env.DB.prepare("SELECT id FROM home_types WHERE slug = ?").bind(c.req.param("slug")).first() as { id: number } | null;
  if (!home) return jsonResponse({ ok: false, error: "Home style not found." }, 404);

  const result = await c.env.DB.prepare("INSERT INTO home_comments (home_type_id, user_id, body) VALUES (?, ?, ?)")
    .bind(home.id, session.userId, String(data.body).trim()).run();

  const comment = await c.env.DB.prepare(
    `SELECT hc.*, u.username AS author FROM home_comments hc JOIN users u ON hc.user_id = u.id WHERE hc.id = ?`,
  ).bind(result.meta.last_row_id).first() as Record<string, unknown>;

  return jsonResponse({
    ok: true,
    comment: {
      id: comment.id,
      author: comment.author,
      body: comment.body,
      created_at: comment.created_at,
      parent_id: null,
      likes: 0,
      dislikes: 0,
      user_reaction: null,
      replies: [],
    },
  }, 201);
});

app.post("/api/comment/:id/reply", async (c) => {
  const session = await getSession(c);
  if (!session) return jsonResponse({ ok: false, error: "Please log in first." }, 401);
  if (!(await requireCsrf(c, session))) return jsonResponse({ ok: false, error: "Invalid or missing CSRF token." }, 400);

  const data = await c.req.json().catch(() => ({})) as { body?: unknown };
  const err = validateComment(data.body);
  if (err) return jsonResponse({ ok: false, error: err }, 400);

  const parent = await c.env.DB.prepare("SELECT * FROM home_comments WHERE id = ?").bind(c.req.param("id")).first() as { id: number; home_type_id: number; parent_id: number | null } | null;
  if (!parent) return jsonResponse({ ok: false, error: "Comment not found." }, 404);
  if (parent.parent_id) return jsonResponse({ ok: false, error: "Cannot reply to a reply." }, 400);

  const result = await c.env.DB.prepare("INSERT INTO home_comments (home_type_id, user_id, parent_id, body) VALUES (?, ?, ?, ?)")
    .bind(parent.home_type_id, session.userId, parent.id, String(data.body).trim()).run();

  const comment = await c.env.DB.prepare(
    `SELECT hc.*, u.username AS author FROM home_comments hc JOIN users u ON hc.user_id = u.id WHERE hc.id = ?`,
  ).bind(result.meta.last_row_id).first() as Record<string, unknown>;

  return jsonResponse({
    ok: true,
    comment: {
      id: comment.id,
      author: comment.author,
      body: comment.body,
      created_at: comment.created_at,
      parent_id: parent.id,
      likes: 0,
      dislikes: 0,
      user_reaction: null,
      replies: [],
    },
  }, 201);
});

app.post("/api/comment/:id/react", async (c) => {
  const session = await getSession(c);
  if (!session) return jsonResponse({ ok: false, error: "Please log in first." }, 401);
  if (!(await requireCsrf(c, session))) return jsonResponse({ ok: false, error: "Invalid or missing CSRF token." }, 400);

  const data = await c.req.json().catch(() => ({})) as { kind?: string };
  if (data.kind !== "like" && data.kind !== "dislike") {
    return jsonResponse({ ok: false, error: "Reaction must be 'like' or 'dislike'." }, 400);
  }

  const comment = await c.env.DB.prepare("SELECT id FROM home_comments WHERE id = ?").bind(c.req.param("id")).first();
  if (!comment) return jsonResponse({ ok: false, error: "Comment not found." }, 404);

  const commentId = c.req.param("id");
  const existing = await c.env.DB.prepare("SELECT id, kind FROM comment_reactions WHERE comment_id = ? AND user_id = ?")
    .bind(commentId, session.userId).first() as { id: number; kind: string } | null;

  let reaction: string | null = data.kind;
  if (existing) {
    if (existing.kind === data.kind) {
      await c.env.DB.prepare("DELETE FROM comment_reactions WHERE id = ?").bind(existing.id).run();
      reaction = null;
    } else {
      await c.env.DB.prepare("UPDATE comment_reactions SET kind = ? WHERE id = ?").bind(data.kind, existing.id).run();
    }
  } else {
    await c.env.DB.prepare("INSERT INTO comment_reactions (comment_id, user_id, kind) VALUES (?, ?, ?)")
      .bind(commentId, session.userId, data.kind).run();
  }

  const counts = { like: 0, dislike: 0 };
  const { results } = await c.env.DB.prepare(
    "SELECT kind, COUNT(*) AS cnt FROM comment_reactions WHERE comment_id = ? GROUP BY kind",
  ).bind(commentId).all();
  for (const r of results as { kind: string; cnt: number }[]) counts[r.kind as "like" | "dislike"] = r.cnt;

  return jsonResponse({ ok: true, reaction, counts });
});

app.all("*", async (c) => {
  const asset = await c.env.ASSETS.fetch(c.req.raw);
  if (asset.status !== 404) return asset;
  const session = await getSession(c);
  const csrf = session?.csrf || (await getGuestCsrf(c));
  return htmlResponse(renderError(404, "Not Found", session ? { id: session.userId, username: session.username } : null, csrf), 404);
});

export default app;
