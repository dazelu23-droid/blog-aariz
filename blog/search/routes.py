from flask import Blueprint, current_app, render_template, request

from db import get_db
from models import list_posts, preview_body, search_posts

bp = Blueprint("search", __name__)


@bp.route("/search")
def search():
    q = request.args.get("q", "")
    conn = get_db(current_app)
    try:
        if not q.strip():
            posts = []
            empty = True
        else:
            posts = search_posts(conn, q)
            for post in posts:
                post["preview"] = preview_body(post["body"])
            empty = False
    finally:
        conn.close()
    return render_template("search.html", posts=posts, query=q, empty=empty)
