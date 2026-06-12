CREATE TABLE IF NOT EXISTS home_types (
    id INTEGER PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    hero_image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS home_images (
    id INTEGER PRIMARY KEY,
    home_type_id INTEGER NOT NULL REFERENCES home_types(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    alt TEXT NOT NULL,
    sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS ratings (
    id INTEGER PRIMARY KEY,
    home_type_id INTEGER NOT NULL REFERENCES home_types(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    stars INTEGER NOT NULL CHECK (stars >= 1 AND stars <= 5),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(home_type_id, user_id)
);

CREATE TABLE IF NOT EXISTS home_comments (
    id INTEGER PRIMARY KEY,
    home_type_id INTEGER NOT NULL REFERENCES home_types(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    parent_id INTEGER REFERENCES home_comments(id) ON DELETE CASCADE,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS comment_reactions (
    id INTEGER PRIMARY KEY,
    comment_id INTEGER NOT NULL REFERENCES home_comments(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id),
    kind TEXT NOT NULL CHECK (kind IN ('like', 'dislike')),
    UNIQUE(comment_id, user_id)
);
