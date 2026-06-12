import { DEFAULT_MUSIC_SLUG } from "./music";
import { escapeHtml } from "./utils";

const SITE_NAME = "Home Builds";

interface LayoutOpts {
  musicSlug?: string;
  searchQuery?: string;
  extraScripts?: string;
}

interface User {
  username: string;
  id?: number;
}

export interface HomeTypeSummary {
  id: number;
  slug: string;
  name: string;
  description: string;
  hero_image_url: string;
  origin_name: string | null;
  build_rank: number;
  avg_rating: number;
  rating_count: number;
  comment_count: number;
}

export interface HomeImage {
  id: number;
  url: string;
  alt: string;
}

export interface HomeTypeDetail {
  id: number;
  slug: string;
  name: string;
  description: string;
  hero_image_url: string;
  origin_name: string | null;
  build_rank: number;
}

export interface CommentNode {
  id: number;
  author: string;
  body: string;
  created_at: string;
  parent_id: number | null;
  likes: number;
  dislikes: number;
  user_reaction: string | null;
  replies: CommentNode[];
}

function originBadge(origin: string | null | undefined): string {
  if (!origin) return "";
  return `<span class="origin-badge" title="Derived from ${escapeHtml(origin)}">Derived from ${escapeHtml(origin)}</span>`;
}

function buildRankBadge(rank: number): string {
  const label = rank === 1 ? "#1 most built" : rank <= 5 ? `#${rank} among most built` : `#${rank} by build frequency`;
  return `<span class="build-rank${rank <= 5 ? " build-rank-top" : ""}">${label}</span>`;
}

function homeCard(
  h: HomeTypeSummary,
  opts: { desc?: boolean; compact?: boolean } = {},
): string {
  const searchText = escapeHtml(`${h.name} ${h.description} ${h.origin_name || ""}`.toLowerCase());
  const desc = opts.desc !== false && !opts.compact
    ? `<p class="home-card-desc">${escapeHtml(h.description.slice(0, 120))}${h.description.length > 120 ? "…" : ""}</p>`
    : "";
  const meta = opts.compact
    ? `<div class="home-card-meta">${starsHtml(h.avg_rating)} <span class="rating-text">${h.avg_rating.toFixed(1)}</span></div>`
    : `<div class="home-card-meta">
              ${starsHtml(h.avg_rating)}
              <span class="rating-text">${h.rating_count ? `${h.avg_rating.toFixed(1)} (${h.rating_count})` : "No ratings yet"}</span>
              <span class="comment-count">${h.comment_count} comment${h.comment_count === 1 ? "" : "s"}</span>
            </div>`;
  return `<article class="home-card" id="home-card-${h.slug}" data-search="${searchText}" data-music-slug="${escapeHtml(h.slug)}">
        <a href="/home/${escapeHtml(h.slug)}" class="home-card-link" data-music-slug="${escapeHtml(h.slug)}">
          <img src="${escapeHtml(h.hero_image_url)}" alt="${escapeHtml(h.name)} home" class="home-card-img" loading="lazy">
          <div class="home-card-body">
            ${buildRankBadge(h.build_rank)}
            <h2 class="home-card-title">${escapeHtml(h.name)}</h2>
            ${originBadge(h.origin_name)}
            ${desc}
            ${meta}
          </div>
        </a>
      </article>`;
}

function starsHtml(avg: number, size = "sm"): string {
  const full = Math.round(avg);
  const cls = size === "lg" ? "stars stars-lg" : "stars";
  let out = `<span class="${cls}" aria-label="${avg.toFixed(1)} out of 5 stars">`;
  for (let i = 1; i <= 5; i++) {
    out += `<span class="star${i <= full ? " filled" : ""}">★</span>`;
  }
  out += "</span>";
  return out;
}

function nav(user: User | null, csrf: string, searchQuery = ""): string {
  const auth = user
    ? `<span class="nav-user">${escapeHtml(user.username)}</span>
       <form action="/logout" method="post" class="logout-form">
         <input type="hidden" name="csrf_token" value="${escapeHtml(csrf)}">
         <button type="submit" class="btn btn-ghost" id="logout-btn">Log out</button>
       </form>`
    : `<a href="/login" class="nav-link">Log in</a>
       <a href="/signup" class="btn btn-primary">Sign up</a>`;
  return `<div class="site-top" id="site-top">
    <header class="site-header" id="site-header">
      <div class="container header-inner">
        <a href="/" class="logo">${SITE_NAME}</a>
        <nav class="nav" aria-label="Main navigation">
          <a href="/" class="nav-link">Home</a>
          ${auth}
          <button type="button" class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
            <span class="theme-icon" id="theme-icon">🌙</span>
          </button>
        </nav>
      </div>
    </header>
    <div class="sticky-search-bar" id="sticky-search-bar">
      <div class="container">
        <form action="/search" method="get" class="sticky-search-form" id="sticky-search-form" role="search">
          <label for="sticky-search-input" class="visually-hidden">Search home styles</label>
          <input type="search" id="sticky-search-input" name="q" value="${escapeHtml(searchQuery)}" placeholder="Search 50 home styles by name, style, or origin…" maxlength="100" autocomplete="off">
          <button type="submit" class="btn btn-primary">Search</button>
        </form>
      </div>
    </div>
  </div>`;
}

function layout(title: string, content: string, user: User | null, csrf: string, opts: LayoutOpts = {}): string {
  const musicSlug = opts.musicSlug || DEFAULT_MUSIC_SLUG;
  const searchQuery = opts.searchQuery ?? "";
  const extraScripts = opts.extraScripts || "";
  const hasGrid = content.includes('id="home-grid"');
  const scripts = `${extraScripts}${hasGrid ? '<script src="/search.js" defer></script>' : ""}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Explore 50 popular home build styles — sorted by how often they are built, with photos, ratings, and reviews.">
  <meta name="home-music-slug" content="${escapeHtml(musicSlug)}">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/style.css">
  <script src="/theme.js" defer></script>
  <script src="/music.js" defer></script>
  ${scripts}
</head>
<body>
  <button type="button" class="music-toggle" id="music-toggle" aria-label="Unmute music" title="Play lofi music">
    <span id="music-icon">🔇</span>
  </button>
  <audio id="lofi-player" loop preload="metadata"></audio>
  ${nav(user, csrf, searchQuery)}
  <main class="main-content"><div class="container">${content}</div></main>
  <footer class="site-footer"><div class="container footer-inner">
    <p>&copy; 2026 ${SITE_NAME}</p>
    <p class="audio-credit">Music: <a href="https://github.com/btahir/open-lofi" rel="noopener noreferrer">Open Lo-Fi</a> (CC0, free to use)</p>
  </div></footer>
</body>
</html>`;
}

function renderComment(c: CommentNode, depth: number): string {
  const replyForm = depth < 2
    ? `<button type="button" class="btn btn-ghost btn-sm reply-toggle" data-comment-id="${c.id}">Reply</button>
       <form class="reply-form hidden" id="reply-form-${c.id}" data-parent-id="${c.id}">
         <textarea rows="2" maxlength="2000" placeholder="Write a reply..." required></textarea>
         <button type="submit" class="btn btn-primary btn-sm">Post reply</button>
       </form>`
    : "";
  const replies = c.replies.map((r) => renderComment(r, depth + 1)).join("");
  return `<li class="comment${depth > 0 ? " comment-reply" : ""}" id="comment-${c.id}" data-comment-id="${c.id}">
    <div class="comment-header">
      <span class="comment-author">${escapeHtml(c.author)}</span>
      <time class="comment-date">${escapeHtml(c.created_at)}</time>
    </div>
    <p class="comment-body">${escapeHtml(c.body)}</p>
    <div class="comment-actions">
      <button type="button" class="reaction-btn comment-like${c.user_reaction === "like" ? " active" : ""}" data-comment-id="${c.id}" data-kind="like">👍 <span class="like-count">${c.likes}</span></button>
      <button type="button" class="reaction-btn comment-dislike${c.user_reaction === "dislike" ? " active" : ""}" data-comment-id="${c.id}" data-kind="dislike">👎 <span class="dislike-count">${c.dislikes}</span></button>
      ${replyForm}
    </div>
    ${replies ? `<ul class="comment-replies">${replies}</ul>` : ""}
  </li>`;
}

export function renderIndex(homes: HomeTypeSummary[], user: User | null, csrf: string): string {
  const grid = homes.length
    ? `<div class="home-grid" id="home-grid">${homes.map((h) => homeCard(h)).join("")}</div>
       <p class="search-no-results hidden" id="search-no-results">No home styles match your search.</p>`
    : `<p class="empty-state">Loading home styles…</p>`;
  const content = `<section class="hero-banner">
    <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80" alt="Beautiful modern home exterior" class="hero-img">
    <div class="hero-text"><h1>Find Your Perfect Home Style</h1><p>50 build types ranked by how often they are built — with photos, ratings, and reviews.</p></div>
  </section>
  <h1 class="page-title">Home Styles by Build Frequency</h1>
  <p class="page-subtitle">Most commonly built styles appear first.</p>${grid}`;
  return layout(`Home — ${SITE_NAME}`, content, user, csrf, { musicSlug: DEFAULT_MUSIC_SLUG });
}

export function renderHomeType(
  home: HomeTypeDetail,
  images: HomeImage[],
  avgRating: number,
  ratingCount: number,
  userRating: number | null,
  comments: CommentNode[],
  user: User | null,
  csrf: string,
): string {
  const gallery = images
    .map(
      (img) => `<figure class="gallery-item">
      <img src="${escapeHtml(img.url)}" alt="${escapeHtml(img.alt)}" loading="lazy">
      <figcaption>${escapeHtml(img.alt)}</figcaption>
    </figure>`,
    )
    .join("");

  const ratingStars = user
    ? `<div class="rating-input" id="rating-input" data-user-rating="${userRating || ""}">
      <p class="rating-label">Your rating:</p>
      <div class="star-picker" role="group" aria-label="Rate this home style">
        ${[1, 2, 3, 4, 5]
          .map(
            (n) =>
              `<button type="button" class="star-btn${userRating && n <= userRating ? " active" : ""}" data-stars="${n}" aria-label="${n} stars">★</button>`,
          )
          .join("")}
      </div>
    </div>`
    : `<p class="rating-login-hint"><a href="/login?next=/home/${escapeHtml(home.slug)}">Log in</a> to rate this style.</p>`;

  const commentForm = user
    ? `<form class="comment-form" id="comment-form">
      <label for="comment-body">Share your thoughts</label>
      <textarea id="comment-body" name="body" rows="3" maxlength="2000" required placeholder="What do you think of ${escapeHtml(home.name)} homes?"></textarea>
      <button type="submit" class="btn btn-primary" id="comment-submit">Post comment</button>
    </form>`
    : `<p class="comment-login-hint"><a href="/login?next=/home/${escapeHtml(home.slug)}">Log in</a> to leave a comment.</p>`;

  const commentList = comments.map((c) => renderComment(c, 0)).join("");

  const content = `<article class="home-detail" id="home-detail" data-home-slug="${escapeHtml(home.slug)}">
    <a href="/" class="back-link">← All home styles</a>
    <header class="home-header">
      <img src="${escapeHtml(home.hero_image_url)}" alt="${escapeHtml(home.name)} home" class="home-hero-img">
      <div class="home-header-text">
        <h1 class="home-title">${escapeHtml(home.name)}</h1>
        ${buildRankBadge(home.build_rank)}
        ${originBadge(home.origin_name)}
        <div class="home-rating-summary">
          ${starsHtml(avgRating, "lg")}
          <span class="rating-text">${ratingCount ? `${avgRating.toFixed(1)} average from ${ratingCount} rating${ratingCount === 1 ? "" : "s"}` : "Not rated yet"}</span>
        </div>
      </div>
    </header>
    <p class="home-description">${escapeHtml(home.description)}</p>
    <section class="gallery-section">
      <h2>Example Homes</h2>
      <div class="gallery-grid">${gallery}</div>
    </section>
    <section class="rating-section">
      <h2>Rate This Style</h2>
      ${ratingStars}
    </section>
    <section class="comments-section" id="comments-section">
      <h2>Comments &amp; Discussion</h2>
      <ul class="comment-list" id="comment-list">${commentList}</ul>
      ${commentList ? "" : `<p class="empty-comments" id="empty-comments">No comments yet. Be the first!</p>`}
      ${commentForm}
    </section>
  </article>
  <meta name="csrf-token" content="${escapeHtml(csrf)}">`;
  return layout(`${home.name} — ${SITE_NAME}`, content, user, csrf, {
    musicSlug: home.slug,
    extraScripts: '<script src="/home.js" defer></script>',
  });
}

export function renderLogin(errors: string[], username: string, next: string, user: User | null, csrf: string): string {
  const errs = errors.length ? `<ul class="form-errors" id="form-errors">${errors.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}</ul>` : "";
  const content = `<div class="form-card" id="login-form-card">
    <h1>Log in</h1>${errs}
    <form method="post" action="/login" class="auth-form" id="login-form">
      <input type="hidden" name="csrf_token" value="${escapeHtml(csrf)}">
      <input type="hidden" name="next" value="${escapeHtml(next)}">
      <div class="form-group"><label for="username">Username</label>
        <input type="text" id="username" name="username" value="${escapeHtml(username)}" required></div>
      <div class="form-group"><label for="password">Password</label>
        <input type="password" id="password" name="password" required></div>
      <button type="submit" class="btn btn-primary" id="login-submit">Log in</button>
    </form>
    <p class="form-hint">Don't have an account? <a href="/signup">Sign up</a></p>
  </div>`;
  return layout(`Log in — ${SITE_NAME}`, content, user, csrf);
}

export function renderSignup(errors: string[], username: string, email: string, user: User | null, csrf: string): string {
  const errs = errors.length ? `<ul class="form-errors" id="form-errors">${errors.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}</ul>` : "";
  const content = `<div class="form-card" id="signup-form-card">
    <h1>Sign up</h1>${errs}
    <form method="post" action="/signup" class="auth-form" id="signup-form">
      <input type="hidden" name="csrf_token" value="${escapeHtml(csrf)}">
      <div class="form-group"><label for="username">Username</label>
        <input type="text" id="username" name="username" value="${escapeHtml(username)}" required pattern="[A-Za-z0-9_]{3,30}"></div>
      <div class="form-group"><label for="email">Email</label>
        <input type="email" id="email" name="email" value="${escapeHtml(email)}" required></div>
      <div class="form-group"><label for="password">Password</label>
        <input type="password" id="password" name="password" required minlength="8"></div>
      <button type="submit" class="btn btn-primary" id="signup-submit">Sign up</button>
    </form>
    <p class="form-hint">Already have an account? <a href="/login">Log in</a></p>
  </div>`;
  return layout(`Sign up — ${SITE_NAME}`, content, user, csrf);
}

export function renderSearch(homes: HomeTypeSummary[], query: string, empty: boolean, user: User | null, csrf: string): string {
  const list = empty
    ? `<p class="empty-state" id="search-prompt">Use the search bar above to find home styles.</p>`
    : homes.length
      ? `<div class="home-grid" id="home-grid">${homes.map((h) => homeCard(h, { compact: true })).join("")}</div>
         <p class="search-no-results hidden" id="search-no-results">No home styles match your search.</p>`
      : `<p class="empty-state">No home styles found for "${escapeHtml(query)}".</p>`;
  const content = `<h1 class="page-title">Search Results</h1>
    ${query ? `<p class="page-subtitle">Showing results for “${escapeHtml(query)}” (sorted by build frequency)</p>` : ""}${list}`;
  return layout(`Search — ${SITE_NAME}`, content, user, csrf, { searchQuery: query });
}

export function renderError(code: number, message: string, user: User | null, csrf: string): string {
  const content = `<div class="error-page" id="error-${code}">
    <h1>${code} — ${escapeHtml(message)}</h1>
    <a href="/" class="btn btn-primary">Go home</a>
  </div>`;
  return layout(`${code} — ${SITE_NAME}`, content, user, csrf);
}
