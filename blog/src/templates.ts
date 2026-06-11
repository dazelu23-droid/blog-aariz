import { escapeHtml } from "./utils";

interface User {
  username: string;
  id?: number;
}

interface Post {
  id: number;
  title: string;
  body: string;
  author: string;
  author_id?: number;
  created_at: string;
  updated_at?: string | null;
  preview?: string;
}

interface Comment {
  id: number;
  author: string;
  body: string;
  created_at: string;
}

function nav(user: User | null, csrf: string): string {
  const auth = user
    ? `<a href="/new" class="nav-link">New Post</a>
       <span class="nav-user">${escapeHtml(user.username)}</span>
       <form action="/logout" method="post" class="logout-form">
         <input type="hidden" name="csrf_token" value="${escapeHtml(csrf)}">
         <button type="submit" class="btn btn-ghost" id="logout-btn">Log out</button>
       </form>`
    : `<a href="/login" class="nav-link">Log in</a>
       <a href="/signup" class="btn btn-primary">Sign up</a>`;
  return `<header class="site-header" id="site-header">
    <div class="container header-inner">
      <a href="/" class="logo">Blog Aariz</a>
      <nav class="nav" aria-label="Main navigation">
        <a href="/" class="nav-link">Home</a>
        <a href="/search" class="nav-link">Search</a>
        ${auth}
        <button type="button" class="theme-toggle" id="theme-toggle" aria-label="Toggle theme">
          <span class="theme-icon" id="theme-icon">🌙</span>
        </button>
      </nav>
    </div>
  </header>`;
}

function layout(title: string, content: string, user: User | null, csrf: string, extraScripts = ""): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="/style.css">
  <script src="/theme.js" defer></script>
  ${extraScripts}
</head>
<body>
  ${nav(user, csrf)}
  <main class="main-content"><div class="container">${content}</div></main>
  <footer class="site-footer"><div class="container footer-inner"><p>&copy; 2026 Blog Aariz</p></div></footer>
</body>
</html>`;
}

export function renderIndex(posts: Post[], user: User | null, csrf: string): string {
  const list = posts.length
    ? `<div class="post-list" id="post-list">${posts
        .map(
          (p) => `<article class="post-card" id="post-card-${p.id}">
        <a href="/post/${p.id}" class="post-card-link">
          <h2 class="post-title">${escapeHtml(p.title)}</h2>
          <p class="post-preview">${escapeHtml(p.preview || "")}</p>
          <div class="post-meta">
            <span class="post-author">${escapeHtml(p.author)}</span>
            <time class="post-date">${escapeHtml(p.created_at)}</time>
          </div>
        </a>
      </article>`,
        )
        .join("")}</div>`
    : `<p class="empty-state" id="empty-posts">No posts yet. Be the first to write one!</p>`;
  const content = `<section class="hero-banner">
    <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80" alt="A cozy desk with a laptop and coffee" class="hero-img">
    <div class="hero-text"><h1>Welcome to Blog Aariz</h1><p>Stories, ideas, and everyday discoveries.</p></div>
  </section>
  <h1 class="page-title">Latest Posts</h1>${list}`;
  return layout("Home — Blog Aariz", content, user, csrf);
}

export function renderPost(
  post: Post,
  comments: Comment[],
  counts: { like: number; dislike: number },
  userReaction: string | null,
  user: User | null,
  csrf: string,
): string {
  const actions =
    user && user.id === post.author_id
      ? `<div class="post-actions">
      <a href="/edit/${post.id}" class="btn btn-secondary" id="edit-btn">Edit</a>
      <form action="/delete/${post.id}" method="post" class="delete-form">
        <input type="hidden" name="csrf_token" value="${escapeHtml(csrf)}">
        <button type="submit" class="btn btn-danger" id="delete-btn">Delete</button>
      </form>
    </div>`
      : "";
  const commentList = comments
    .map(
      (c) => `<li class="comment" id="comment-${c.id}">
      <span class="comment-author">${escapeHtml(c.author)}</span>
      <time class="comment-date">${escapeHtml(c.created_at)}</time>
      <p class="comment-body">${escapeHtml(c.body)}</p>
    </li>`,
    )
    .join("");
  const commentForm = user
    ? `<form class="comment-form" id="comment-form">
      <label for="comment-body">Add a comment</label>
      <textarea id="comment-body" name="body" rows="3" maxlength="2000" required></textarea>
      <button type="submit" class="btn btn-primary" id="comment-submit">Post comment</button>
    </form>`
    : `<p class="comment-login-hint"><a href="/login?next=/post/${post.id}">Log in</a> to leave a comment.</p>`;
  const content = `<article class="post-detail" id="post-detail" data-post-id="${post.id}">
    <header class="post-header">
      <h1 class="post-title" id="post-title">${escapeHtml(post.title)}</h1>
      <div class="post-meta">
        <span class="post-author" id="post-author">${escapeHtml(post.author)}</span>
        <time class="post-date">${escapeHtml(post.created_at)}</time>
        ${post.updated_at ? `<span class="post-edited" id="post-edited">(edited)</span>` : ""}
      </div>
    </header>
    <div class="post-body" id="post-body">${escapeHtml(post.body)}</div>
    ${actions}
    <section class="reactions" id="reactions">
      <button type="button" class="reaction-btn${userReaction === "like" ? " active" : ""}" id="like-btn" data-kind="like">👍 <span id="like-count">${counts.like}</span></button>
      <button type="button" class="reaction-btn${userReaction === "dislike" ? " active" : ""}" id="dislike-btn" data-kind="dislike">👎 <span id="dislike-count">${counts.dislike}</span></button>
    </section>
    <section class="comments-section" id="comments-section">
      <h2>Comments</h2>
      <ul class="comment-list" id="comment-list">${commentList}</ul>
      ${commentForm}
    </section>
  </article>
  <meta name="csrf-token" content="${escapeHtml(csrf)}">`;
  return layout(`${post.title} — Blog Aariz`, content, user, csrf, '<script src="/post.js" defer></script>');
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
  return layout("Log in — Blog Aariz", content, user, csrf);
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
  return layout("Sign up — Blog Aariz", content, user, csrf);
}

export function renderEdit(post: Post | null, errors: string[], title: string, body: string, user: User | null, csrf: string): string {
  const errs = errors.length ? `<ul class="form-errors" id="form-errors">${errors.map((e) => `<li>${escapeHtml(e)}</li>`).join("")}</ul>` : "";
  const action = post ? `/edit/${post.id}` : "/new";
  const content = `<div class="form-card" id="edit-form-card">
    <h1>${post ? "Edit Post" : "New Post"}</h1>${errs}
    <form method="post" action="${action}" class="post-form" id="post-form">
      <input type="hidden" name="csrf_token" value="${escapeHtml(csrf)}">
      <div class="form-group"><label for="title">Title</label>
        <input type="text" id="title" name="title" value="${escapeHtml(title)}" maxlength="200" required></div>
      <div class="form-group"><label for="body">Body</label>
        <textarea id="body" name="body" rows="12" maxlength="20000" required>${escapeHtml(body)}</textarea></div>
      <button type="submit" class="btn btn-primary" id="post-submit">${post ? "Save changes" : "Publish"}</button>
    </form>
  </div>`;
  return layout(`${post ? "Edit" : "New"} Post — Blog Aariz`, content, user, csrf);
}

export function renderSearch(posts: Post[], query: string, empty: boolean, user: User | null, csrf: string): string {
  const list = empty
    ? `<p class="empty-state" id="search-prompt">Enter a search term to find posts.</p>`
    : posts.length
      ? `<div class="post-list" id="post-list">${posts
          .map(
            (p) => `<article class="post-card" id="post-card-${p.id}">
          <a href="/post/${p.id}" class="post-card-link">
            <h2 class="post-title">${escapeHtml(p.title)}</h2>
            <p class="post-preview">${escapeHtml(p.preview || "")}</p>
            <div class="post-meta"><span class="post-author">${escapeHtml(p.author)}</span>
              <time class="post-date">${escapeHtml(p.created_at)}</time></div>
          </a></article>`,
          )
          .join("")}</div>`
      : `<p class="empty-state">No posts found.</p>`;
  const content = `<h1 class="page-title">Search</h1>
    <form action="/search" method="get" class="search-form" id="search-form">
      <label for="search-input" class="visually-hidden">Search posts</label>
      <input type="search" id="search-input" name="q" value="${escapeHtml(query)}" placeholder="Search posts..." maxlength="100">
      <button type="submit" class="btn btn-primary" id="search-submit">Search</button>
    </form>${list}`;
  return layout("Search — Blog Aariz", content, user, csrf);
}

export function renderError(code: number, message: string, user: User | null, csrf: string): string {
  const content = `<div class="error-page" id="error-${code}">
    <h1>${code} — ${escapeHtml(message)}</h1>
    <a href="/" class="btn btn-primary">Go home</a>
  </div>`;
  return layout(`${code} — Blog Aariz`, content, user, csrf);
}
