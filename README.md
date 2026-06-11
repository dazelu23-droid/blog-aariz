# Blog Aariz

A full-featured personal blog built per `task-11.md`.

## Project structure

| Path | Description |
|------|-------------|
| `blog/` | Flask app (local dev + tests) and Cloudflare Workers port |
| `task-11.md` | Design spec and grading contracts |
| `SKILL.md` | Cloudflare Workers + D1 deploy runbook |

The original static HTML site remains in the repo root for reference.

## Quick start (local)

```bash
cd blog
pip install -r requirements.txt
python app.py
```

Open http://127.0.0.1:5001

## Tests

```bash
cd blog
pytest -v
```

All 25 tests cover auth, posts, comments, reactions, search, CSRF, theme, and security headers.

## Deploy

### Live now (Cloudflare Tunnel)

The blog can be exposed via a quick tunnel while your machine is running:

```bash
cd blog
python app.py
cloudflared tunnel --url http://localhost:5001
```

### Always-on (Cloudflare Workers + D1)

See `SKILL.md` and `blog/wrangler.jsonc`. After `npx wrangler login`:

```bash
cd blog
npm install
npx wrangler d1 create blog-aariz-db
# paste database_id into wrangler.jsonc
npx wrangler d1 execute blog-aariz-db --remote --file=schema.sql -y
npx wrangler deploy
openssl rand -hex 32 | npx wrangler secret put SECRET_KEY
```

Live at `https://blog-aariz.<your-subdomain>.workers.dev`
