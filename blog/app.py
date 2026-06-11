import os

from flask import Flask, g

from auth import bp as auth_bp
from auth.utils import load_user
from comments import bp as comments_bp
from csrf import generate_csrf_token
from db import init_db
from posts import bp as posts_bp
from reactions import bp as reactions_bp
from search import bp as search_bp

SECURITY_HEADERS = {
    "Content-Security-Policy": "default-src 'self'",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
}


def create_app(test_config=None):
    app = Flask(__name__)

    app.config.from_mapping(
        SECRET_KEY=os.environ.get("SECRET_KEY", "dev"),
        DATABASE=os.environ.get("DATABASE", "blog.db"),
    )
    if test_config:
        app.config.update(test_config)

    cookie_secure = os.environ.get("COOKIE_SECURE", "0") == "1"
    app.config.update(
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=cookie_secure,
    )

    init_db(app)
    load_user(app)

    app.register_blueprint(auth_bp)
    app.register_blueprint(posts_bp)
    app.register_blueprint(comments_bp)
    app.register_blueprint(reactions_bp)
    app.register_blueprint(search_bp)

    @app.context_processor
    def inject_csrf():
        return {"csrf_token": generate_csrf_token}

    @app.context_processor
    def inject_user():
        from auth.utils import current_user

        return {"current_user": current_user()}

    @app.after_request
    def set_security_headers(response):
        for key, value in SECURITY_HEADERS.items():
            response.headers[key] = value
        return response

    return app


if __name__ == "__main__":
    application = create_app()
    application.run(host="127.0.0.1", port=5001, debug=False)
