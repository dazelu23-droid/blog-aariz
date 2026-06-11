from functools import wraps

from flask import g, redirect, request, session, url_for

from db import get_db


def safe_next_url(next_url):
    if not next_url:
        return None
    if not next_url.startswith("/"):
        return None
    if next_url.startswith("//"):
        return None
    if "\\" in next_url:
        return None
    return next_url


def login_user(user_id, username):
    session.clear()
    session["user_id"] = user_id
    session["username"] = username


def logout_user():
    session.clear()


def current_user():
    return getattr(g, "user", None)


def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if g.user is None:
            return redirect(url_for("auth.login", next=request.path))
        return f(*args, **kwargs)

    return decorated


def load_user(app):
    @app.before_request
    def _load_user():
        g.user = None
        user_id = session.get("user_id")
        if user_id:
            conn = get_db(app)
            try:
                from models import get_user_by_id

                g.user = get_user_by_id(conn, user_id)
            finally:
                conn.close()
