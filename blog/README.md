# Blog Aariz

A personal blog built with Flask and SQLite. Signed-in users can write posts; visitors can read, comment, and react.

## Features

- Sign up / log in / log out (username-based, case-insensitive)
- Create, edit, delete posts (author only)
- Comments and like/dislike reactions (JSON API)
- Case-insensitive search with escaped wildcards
- Light/dark theme toggle (localStorage)
- CSRF protection on all POST requests

## Local development

```bash
cd blog
pip install -r requirements.txt
python app.py
```

Visit http://127.0.0.1:5001

## Tests

```bash
cd blog
pytest -v
```

## Deploy

### Cloudflare Tunnel (quick)

```bash
export SECRET_KEY=$(python -c "import secrets; print(secrets.token_hex(32))")
export COOKIE_SECURE=1
python app.py
cloudflared tunnel --url http://localhost:5001
```

Never run with `flask --debug` behind a public tunnel.

### Cloudflare Workers + D1 (always-on)

See the project root `SKILL.md` and `wrangler.jsonc` for Workers deployment.

## Future work

- Rate limiting
- Email verification
