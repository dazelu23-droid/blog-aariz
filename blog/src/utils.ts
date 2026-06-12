export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function safeNextUrl(next: string | null | undefined): string | null {
  if (!next) return null;
  if (!next.startsWith("/")) return null;
  if (next.startsWith("//")) return null;
  if (next.includes("\\")) return null;
  return next;
}

export function previewBody(body: string, maxChars = 150): string {
  const text = body.trim();
  const words = text.split(/\s+/);
  let result: string[] = [];
  let length = 0;
  for (const word of words) {
    const add = word.length + (result.length ? 1 : 0);
    if (length + add > maxChars) break;
    result.push(word);
    length += add;
  }
  if (result.length < words.length) return result.join(" ") + "...";
  return text;
}

const USERNAME_RE = /^[A-Za-z0-9_]{3,30}$/;
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function validateUsername(u: string): string | null {
  if (!USERNAME_RE.test(u.trim())) return "Username must be 3-30 letters, digits, or underscores.";
  return null;
}

export function validateEmail(e: string): string | null {
  if (!EMAIL_RE.test(e.trim())) return "Please enter a valid email address.";
  return null;
}

export function validatePassword(p: string): string | null {
  if (p.length < 8) return "Password must be at least 8 characters.";
  return null;
}

export function validateTitle(t: string): string | null {
  const s = t.trim();
  if (!s) return "Title cannot be empty.";
  if (s.length > 200) return "Title must be at most 200 characters.";
  return null;
}

export function validateBody(b: string): string | null {
  const s = b.trim();
  if (!s) return "Body cannot be empty.";
  if (s.length > 20000) return "Body must be at most 20000 characters.";
  return null;
}

export function validateComment(body: unknown): string | null {
  if (typeof body !== "string") return "Comment must be text.";
  const b = body.trim();
  if (!b) return "Comment cannot be empty.";
  if (b.length > 2000) return "Comment must be at most 2000 characters.";
  return null;
}

export function validateRating(stars: unknown): string | null {
  const n = Number(stars);
  if (!Number.isInteger(n) || n < 1 || n > 5) return "Rating must be between 1 and 5 stars.";
  return null;
}

export function escapeLike(q: string): string {
  return q.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

export const SECURITY_HEADERS: Record<string, string> = {
  "Content-Security-Policy": "default-src 'self'; img-src 'self' https://images.unsplash.com; media-src 'self'; style-src 'self' 'unsafe-inline'",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
};
