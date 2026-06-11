import secrets
from functools import wraps

from flask import abort, request, session


def generate_csrf_token():
    if "csrf_token" not in session:
        session["csrf_token"] = secrets.token_hex(32)
    return session["csrf_token"]


def validate_csrf_token():
    token = session.get("csrf_token")
    if not token:
        return False
    provided = request.form.get("csrf_token") or request.headers.get("X-CSRF-Token")
    if not provided:
        return False
    return secrets.compare_digest(token, provided)


def csrf_protect(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        from flask import current_app

        if current_app.config.get("DISABLE_CSRF"):
            return f(*args, **kwargs)
        if not validate_csrf_token():
            if request.path.startswith("/api/"):
                return {"ok": False, "error": "Invalid or missing CSRF token."}, 400
            abort(400)
        return f(*args, **kwargs)

    return decorated
