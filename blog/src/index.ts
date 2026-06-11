import { Hono } from "hono";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import {
  createSession,
  hashPassword,
  timingSafeEqual,
  verifyPassword,
  verifySession,
} from "./auth";
import {
  renderEdit,
  renderError,
  renderIndex,
  renderLogin,
  renderPost,
  renderSearch,
  renderSignup,
} from "./templates";
import {
  escapeLike,
  previewBody,
  safeNextUrl,
  SECURITY_HEADERS,
  validateBody,
  validateComment,
  validateEmail,
  validatePassword,
  validateTitle,
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

async function ensureCsrf(c: { req: { header: (n: string) => string | undefined; parseBody: () => Promise<Record<string, string>>; path: string; json: () => Promise<unknown> }; env: Bindings }, session: Session | null): Promise<boolean> {
  if (!session) {
    const guestCsrf = getCookie(c as never, "guest_csrf");
    const provided = c.req.header("X-CSRF-Token") || (await c.req.parseBody().catch(() => ({})) as Record<string, string>)?.csrf_token;
    if (!guestCsrf || !provided || !timingSafeEqual(guestCsrf, String(provided))) return false;
    return true;
  }
  const provided = c.req.header("X-CSRF-Token") || (await c.req.parseBody().catch(() => ({})) as Record<string, string>)?.csrf_token;
  if (!provided || !timingSafeEqual(session.csrf, String(provided))) return false;
  return true;
}

async function getGuestCsrf(c: { env: Bindings }): Promise<string> {
  const existing = getCookie(c as never, "guest_csrf");
  if (existing) return existing;
  const csrf = [...crypto.getRandomValues(new Uint8Array(32))].map((b) => b.toString(16).padStart(2, "0")).join("");
  return csrf;
}

async function userFromSession(c: { env: Bindings; req: { header: (n: string) => string | undefined } }): Promise<{ id: number; username: string } | null> {
  const session = await getSession(c);
  if (!session) return null;
  return { id: session.userId, username: session.username };
}

app.get("/style.css", async (c) => c.env.ASSETS.fetch(c.req.raw));
app.get("/theme.js", async (c) => c.env.ASSETS.fetch(c.req.raw));
app.get("/post.js", async (c) => c.env.ASSETS.fetch(c.req.raw));

app.get("/", async (c) => {
  const session = await getSession(c);
  const guestCsrf = await getGuestCsrf(c);
  const csrf = session?.csrf || guestCsrf;
  const { results } = await c.env.DB.prepare(
    `SELECT posts.*, users.username AS author FROM posts
     JOIN users ON posts.author_id = users.id
     ORDER BY posts.created_at DESC, posts.id DESC`,
  ).all();
  const posts = (results as Record<string, unknown>[]).map((p) => ({
    ...p,
    preview: previewBody(String(p.body)),
  })) as { id: number; title: string; body: string; author: string; created_at: string; preview: string }[];
  const user = session ? { id: session.userId, username: session.username } : null;
  const resp = htmlResponse(renderIndex(posts, user, csrf));
  if (!session && !getCookie(c, "guest_csrf")) {
    resp.headers.append("Set-Cookie", `guest_csrf=${guestCsrf}; Path=/; SameSite=Lax; Max-Age=604800`);
  }
  return resp;
});

app.get("/signup", async (c) => {
  const session = await getSession(c);
  const guestCsrf = await getGuestCsrf(c);
  const csrf = session?.csrf || guestCsrf;
  const user = session ? { id: session.userId, username: session.username } : null;
  const resp = htmlResponse(renderSignup([], "", "", user, csrf));
  if (!session && !getCookie(c, "guest_csrf")) {
    resp.headers.append("Set-Cookie", `guest_csrf=${guestCsrf}; Path=/; SameSite=Lax; Max-Age=604800`);
  }
  return resp;
});

app.post("/signup", async (c) => {
  const session = await getSession(c);
  const guestCsrf = await getGuestCsrf(c);
  const csrf = session?.csrf || guestCsrf;
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
  const guestCsrf = await getGuestCsrf(c);
  const csrf = session?.csrf || guestCsrf;
  const next = c.req.query("next") || "";
  const user = session ? { id: session.userId, username: session.username } : null;
  const resp = htmlResponse(renderLogin([], "", next, user, csrf));
  if (!session && !getCookie(c, "guest_csrf")) {
    resp.headers.append("Set-Cookie", `guest_csrf=${guestCsrf}; Path=/; SameSite=Lax; Max-Age=604800`);
  }
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

  const { cookie, csrf } = await createSession(Number(row.id), String(row.username), secret(c));
  const dest = safeNextUrl(next) || "/";
  const secure = c.req.url.startsWith("https");
  return redirectResponse(dest, sessionCookie(cookie, secure));
});

app.post("/logout", async (c) => {
  const session = await getSession(c);
  if (!session || !(await ensureCsrf(c, session))) return htmlResponse("Bad Request", 400);
  const resp = redirectResponse("/");
  deleteCookie(c, "session");
  return resp;
});

app.get("/new", async (c) => {
  const session = await getSession(c);
  if (!session) return redirectResponse(`/login?next=/new`);
  const user = { id: session.userId, username: session.username };
  return htmlResponse(renderEdit(null, [], "", "", user, session.csrf));
});

app.post("/new", async (c) => {
  const session = await getSession(c);
  if (!session) return redirectResponse("/login?next=/new");
  const body = await c.req.parseBody();
  if (!timingSafeEqual(session.csrf, String(body.csrf_token || ""))) return htmlResponse("Bad Request", 400);

  const title = String(body.title || "");
  const postBody = String(body.body || "");
  const errors: string[] = [];
  const tErr = validateTitle(title);
  if (tErr) errors.push(tErr);
  const bErr = validateBody(postBody);
  if (bErr) errors.push(bErr);
  const user = { id: session.userId, username: session.username };
  if (errors.length) return htmlResponse(renderEdit(null, errors, title, postBody, user, session.csrf), 400);

  const result = await c.env.DB.prepare("INSERT INTO posts (author_id, title, body) VALUES (?, ?, ?)")
    .bind(session.userId, title.trim(), postBody.trim()).run();
  return redirectResponse(`/post/${result.meta.last_row_id}`);
});

app.get("/post/:id", async (c) => {
  const id = c.req.param("id");
  const session = await getSession(c);
  const guestCsrf = await getGuestCsrf(c);
  const csrf = session?.csrf || guestCsrf;
  const post = await c.env.DB.prepare(
    `SELECT posts.*, users.username AS author FROM posts JOIN users ON posts.author_id = users.id WHERE posts.id = ?`,
  ).bind(id).first() as Record<string, unknown> | null;
  if (!post) return htmlResponse(renderError(404, "Not Found", null, csrf), 404);

  const { results: comments } = await c.env.DB.prepare(
    `SELECT comments.*, users.username AS author FROM comments JOIN users ON comments.user_id = users.id
     WHERE comments.post_id = ? ORDER BY comments.created_at ASC, comments.id ASC`,
  ).bind(id).all();

  const counts = { like: 0, dislike: 0 };
  const { results: reactionRows } = await c.env.DB.prepare(
    "SELECT kind, COUNT(*) AS cnt FROM reactions WHERE post_id = ? GROUP BY kind",
  ).bind(id).all();
  for (const r of reactionRows as { kind: string; cnt: number }[]) counts[r.kind as "like" | "dislike"] = r.cnt;

  let userReaction: string | null = null;
  if (session) {
    const r = await c.env.DB.prepare("SELECT kind FROM reactions WHERE post_id = ? AND user_id = ?").bind(id, session.userId).first() as { kind: string } | null;
    userReaction = r?.kind || null;
  }

  const user = session ? { id: session.userId, username: session.username } : null;
  return htmlResponse(renderPost(post as never, comments as never, counts, userReaction, user, csrf));
});

app.get("/edit/:id", async (c) => {
  const session = await getSession(c);
  if (!session) return redirectResponse(`/login?next=/edit/${c.req.param("id")}`);
  const post = await c.env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(c.req.param("id")).first() as Record<string, unknown> | null;
  if (!post) return htmlResponse(renderError(404, "Not Found", { id: session.userId, username: session.username }, session.csrf), 404);
  if (Number(post.author_id) !== session.userId) return htmlResponse(renderError(403, "Forbidden", { id: session.userId, username: session.username }, session.csrf), 403);
  const user = { id: session.userId, username: session.username };
  return htmlResponse(renderEdit(post as never, [], String(post.title), String(post.body), user, session.csrf));
});

app.post("/edit/:id", async (c) => {
  const session = await getSession(c);
  if (!session) return redirectResponse(`/login?next=/edit/${c.req.param("id")}`);
  const post = await c.env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(c.req.param("id")).first() as Record<string, unknown> | null;
  if (!post) return htmlResponse(renderError(404, "Not Found", { id: session.userId, username: session.username }, session.csrf), 404);
  if (Number(post.author_id) !== session.userId) return htmlResponse(renderError(403, "Forbidden", { id: session.userId, username: session.username }, session.csrf), 403);

  const body = await c.req.parseBody();
  if (!timingSafeEqual(session.csrf, String(body.csrf_token || ""))) return htmlResponse("Bad Request", 400);
  const title = String(body.title || "");
  const postBody = String(body.body || "");
  const errors: string[] = [];
  const tErr = validateTitle(title);
  if (tErr) errors.push(tErr);
  const bErr = validateBody(postBody);
  if (bErr) errors.push(bErr);
  const user = { id: session.userId, username: session.username };
  if (errors.length) return htmlResponse(renderEdit(post as never, errors, title, postBody, user, session.csrf), 400);

  const now = new Date().toISOString().slice(0, 19).replace("T", " ");
  await c.env.DB.prepare("UPDATE posts SET title = ?, body = ?, updated_at = ? WHERE id = ?")
    .bind(title.trim(), postBody.trim(), now, c.req.param("id")).run();
  return redirectResponse(`/post/${c.req.param("id")}`);
});

app.post("/delete/:id", async (c) => {
  const session = await getSession(c);
  if (!session) return redirectResponse(`/login?next=/post/${c.req.param("id")}`);
  const post = await c.env.DB.prepare("SELECT * FROM posts WHERE id = ?").bind(c.req.param("id")).first() as Record<string, unknown> | null;
  if (!post) return htmlResponse(renderError(404, "Not Found", { id: session.userId, username: session.username }, session.csrf), 404);
  if (Number(post.author_id) !== session.userId) return htmlResponse(renderError(403, "Forbidden", { id: session.userId, username: session.username }, session.csrf), 403);
  const body = await c.req.parseBody();
  if (!timingSafeEqual(session.csrf, String(body.csrf_token || ""))) return htmlResponse("Bad Request", 400);
  await c.env.DB.prepare("DELETE FROM posts WHERE id = ?").bind(c.req.param("id")).run();
  return redirectResponse("/");
});

app.get("/search", async (c) => {
  const session = await getSession(c);
  const guestCsrf = await getGuestCsrf(c);
  const csrf = session?.csrf || guestCsrf;
  const q = c.req.query("q") || "";
  const user = session ? { id: session.userId, username: session.username } : null;

  if (!q.trim()) return htmlResponse(renderSearch([], q, true, user, csrf));

  const pattern = `%${escapeLike(q.trim().slice(0, 100))}%`;
  const { results } = await c.env.DB.prepare(
    `SELECT posts.*, users.username AS author FROM posts JOIN users ON posts.author_id = users.id
     WHERE posts.title LIKE ? ESCAPE '\\' COLLATE NOCASE OR posts.body LIKE ? ESCAPE '\\' COLLATE NOCASE
     ORDER BY posts.created_at DESC, posts.id DESC`,
  ).bind(pattern, pattern).all();
  const posts = (results as Record<string, unknown>[]).map((p) => ({
    ...p,
    preview: previewBody(String(p.body)),
  }));
  return htmlResponse(renderSearch(posts as never, q, false, user, csrf));
});

app.post("/api/post/:id/comment", async (c) => {
  const session = await getSession(c);
  const guestCsrf = await getGuestCsrf(c);
  const csrfVal = session?.csrf || guestCsrf;
  const token = c.req.header("X-CSRF-Token");
  if (!token || !timingSafeEqual(csrfVal, token)) {
    return jsonResponse({ ok: false, error: "Invalid or missing CSRF token." }, 400);
  }
  if (!session) return jsonResponse({ ok: false, error: "Please log in first." }, 401);

  const data = await c.req.json().catch(() => ({})) as { body?: unknown };
  const err = validateComment(data.body);
  if (err) return jsonResponse({ ok: false, error: err }, 400);

  const post = await c.env.DB.prepare("SELECT id FROM posts WHERE id = ?").bind(c.req.param("id")).first();
  if (!post) return jsonResponse({ ok: false, error: "Post not found." }, 404);

  const result = await c.env.DB.prepare("INSERT INTO comments (post_id, user_id, body) VALUES (?, ?, ?)")
    .bind(c.req.param("id"), session.userId, String(data.body).trim()).run();
  const comment = await c.env.DB.prepare(
    `SELECT comments.*, users.username AS author FROM comments JOIN users ON comments.user_id = users.id WHERE comments.id = ?`,
  ).bind(result.meta.last_row_id).first() as Record<string, unknown>;

  return jsonResponse({
    ok: true,
    comment: {
      id: comment.id,
      post_id: comment.post_id,
      body: comment.body,
      created_at: comment.created_at,
      author: comment.author,
    },
  }, 201);
});

app.post("/api/post/:id/react", async (c) => {
  const session = await getSession(c);
  const guestCsrf = await getGuestCsrf(c);
  const csrfVal = session?.csrf || guestCsrf;
  const token = c.req.header("X-CSRF-Token");
  if (!token || !timingSafeEqual(csrfVal, token)) {
    return jsonResponse({ ok: false, error: "Invalid or missing CSRF token." }, 400);
  }
  if (!session) return jsonResponse({ ok: false, error: "Please log in first." }, 401);

  const data = await c.req.json().catch(() => ({})) as { kind?: string };
  if (data.kind !== "like" && data.kind !== "dislike") {
    return jsonResponse({ ok: false, error: "Reaction must be 'like' or 'dislike'." }, 400);
  }

  const postId = c.req.param("id");
  const post = await c.env.DB.prepare("SELECT id FROM posts WHERE id = ?").bind(postId).first();
  if (!post) return jsonResponse({ ok: false, error: "Post not found." }, 404);

  const existing = await c.env.DB.prepare("SELECT id, kind FROM reactions WHERE post_id = ? AND user_id = ?")
    .bind(postId, session.userId).first() as { id: number; kind: string } | null;

  let reaction: string | null = data.kind;
  if (existing) {
    if (existing.kind === data.kind) {
      await c.env.DB.prepare("DELETE FROM reactions WHERE id = ?").bind(existing.id).run();
      reaction = null;
    } else {
      await c.env.DB.prepare("UPDATE reactions SET kind = ? WHERE id = ?").bind(data.kind, existing.id).run();
    }
  } else {
    await c.env.DB.prepare("INSERT INTO reactions (post_id, user_id, kind) VALUES (?, ?, ?)")
      .bind(postId, session.userId, data.kind).run();
  }

  const counts = { like: 0, dislike: 0 };
  const { results } = await c.env.DB.prepare(
    "SELECT kind, COUNT(*) AS cnt FROM reactions WHERE post_id = ? GROUP BY kind",
  ).bind(postId).all();
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
