import re
from datetime import UTC, datetime

from werkzeug.security import check_password_hash, generate_password_hash

USERNAME_RE = re.compile(r"^[A-Za-z0-9_]{3,30}$")
EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def row_to_dict(row):
    if row is None:
        return None
    return dict(row)


# --- Users ---

def create_user(conn, username, email, password):
    username = username.strip()
    email = email.strip().lower()
    password_hash = generate_password_hash(password)
    cur = conn.execute(
        "INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)",
        (username, email, password_hash),
    )
    conn.commit()
    return cur.lastrowid


def get_user_by_username(conn, username):
    row = conn.execute(
        "SELECT * FROM users WHERE username = ? COLLATE NOCASE",
        (username.strip(),),
    ).fetchone()
    return row_to_dict(row)


def get_user_by_id(conn, user_id):
    row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
    return row_to_dict(row)


def verify_password(user, password):
    return check_password_hash(user["password_hash"], password)


def validate_username(username):
    if not USERNAME_RE.match(username.strip()):
        return "Username must be 3-30 letters, digits, or underscores."
    return None


def validate_email(email):
    if not EMAIL_RE.match(email.strip()):
        return "Please enter a valid email address."
    return None


def validate_password(password):
    if len(password) < 8:
        return "Password must be at least 8 characters."
    return None


def username_exists(conn, username):
    return (
        conn.execute(
            "SELECT 1 FROM users WHERE username = ? COLLATE NOCASE",
            (username.strip(),),
        ).fetchone()
        is not None
    )


def email_exists(conn, email):
    return (
        conn.execute(
            "SELECT 1 FROM users WHERE email = ?",
            (email.strip().lower(),),
        ).fetchone()
        is not None
    )


# --- Posts ---

def validate_title(title):
    t = title.strip()
    if not t:
        return "Title cannot be empty."
    if len(t) > 200:
        return "Title must be at most 200 characters."
    return None


def validate_body(body):
    b = body.strip()
    if not b:
        return "Body cannot be empty."
    if len(b) > 20000:
        return "Body must be at most 20000 characters."
    return None


def create_post(conn, author_id, title, body):
    cur = conn.execute(
        "INSERT INTO posts (author_id, title, body) VALUES (?, ?, ?)",
        (author_id, title.strip(), body.strip()),
    )
    conn.commit()
    return cur.lastrowid


def update_post(conn, post_id, title, body):
    conn.execute(
        "UPDATE posts SET title = ?, body = ?, updated_at = ? WHERE id = ?",
        (title.strip(), body.strip(), datetime.now(UTC).strftime("%Y-%m-%d %H:%M:%S"), post_id),
    )
    conn.commit()


def delete_post(conn, post_id):
    conn.execute("DELETE FROM posts WHERE id = ?", (post_id,))
    conn.commit()


def get_post(conn, post_id):
    row = conn.execute(
        """SELECT posts.*, users.username AS author
           FROM posts JOIN users ON posts.author_id = users.id
           WHERE posts.id = ?""",
        (post_id,),
    ).fetchone()
    return row_to_dict(row)


def list_posts(conn, limit=None):
    sql = """SELECT posts.*, users.username AS author
             FROM posts JOIN users ON posts.author_id = users.id
             ORDER BY posts.created_at DESC, posts.id DESC"""
    if limit:
        sql += f" LIMIT {int(limit)}"
    rows = conn.execute(sql).fetchall()
    return [row_to_dict(r) for r in rows]


def search_posts(conn, query):
    q = query.strip()[:100]
    escaped = q.replace("\\", "\\\\").replace("%", "\\%").replace("_", "\\_")
    pattern = f"%{escaped}%"
    rows = conn.execute(
        """SELECT posts.*, users.username AS author
           FROM posts JOIN users ON posts.author_id = users.id
           WHERE posts.title LIKE ? ESCAPE '\\' COLLATE NOCASE
              OR posts.body LIKE ? ESCAPE '\\' COLLATE NOCASE
           ORDER BY posts.created_at DESC, posts.id DESC""",
        (pattern, pattern),
    ).fetchall()
    return [row_to_dict(r) for r in rows]


def word_truncate(text, max_words=25):
    words = text.split()
    if len(words) <= max_words:
        return text
    return " ".join(words[:max_words]) + "..."


def preview_body(body, max_chars=150):
    text = body.strip()
    words = text.split()
    result = []
    length = 0
    for word in words:
        add = len(word) + (1 if result else 0)
        if length + add > max_chars:
            break
        result.append(word)
        length += add
    if len(result) < len(words):
        return " ".join(result) + "..."
    return text


# --- Comments ---

def validate_comment(body):
    if not isinstance(body, str):
        return "Comment must be text."
    b = body.strip()
    if not b:
        return "Comment cannot be empty."
    if len(b) > 2000:
        return "Comment must be at most 2000 characters."
    return None


def create_comment(conn, post_id, user_id, body):
    cur = conn.execute(
        "INSERT INTO comments (post_id, user_id, body) VALUES (?, ?, ?)",
        (post_id, user_id, body.strip()),
    )
    conn.commit()
    return cur.lastrowid


def get_comment(conn, comment_id):
    row = conn.execute(
        """SELECT comments.*, users.username AS author
           FROM comments JOIN users ON comments.user_id = users.id
           WHERE comments.id = ?""",
        (comment_id,),
    ).fetchone()
    return row_to_dict(row)


def list_comments(conn, post_id):
    rows = conn.execute(
        """SELECT comments.*, users.username AS author
           FROM comments JOIN users ON comments.user_id = users.id
           WHERE comments.post_id = ?
           ORDER BY comments.created_at ASC, comments.id ASC""",
        (post_id,),
    ).fetchall()
    return [row_to_dict(r) for r in rows]


# --- Reactions ---

def get_reaction_counts(conn, post_id):
    rows = conn.execute(
        "SELECT kind, COUNT(*) AS cnt FROM reactions WHERE post_id = ? GROUP BY kind",
        (post_id,),
    ).fetchall()
    counts = {"like": 0, "dislike": 0}
    for row in rows:
        counts[row["kind"]] = row["cnt"]
    return counts


def get_user_reaction(conn, post_id, user_id):
    row = conn.execute(
        "SELECT kind FROM reactions WHERE post_id = ? AND user_id = ?",
        (post_id, user_id),
    ).fetchone()
    return row["kind"] if row else None


def toggle_reaction(conn, post_id, user_id, kind):
    existing = conn.execute(
        "SELECT id, kind FROM reactions WHERE post_id = ? AND user_id = ?",
        (post_id, user_id),
    ).fetchone()
    if existing:
        if existing["kind"] == kind:
            conn.execute("DELETE FROM reactions WHERE id = ?", (existing["id"],))
            conn.commit()
            return None
        conn.execute(
            "UPDATE reactions SET kind = ? WHERE id = ?",
            (kind, existing["id"]),
        )
        conn.commit()
        return kind
    conn.execute(
        "INSERT INTO reactions (post_id, user_id, kind) VALUES (?, ?, ?)",
        (post_id, user_id, kind),
    )
    conn.commit()
    return kind
