from flask import Blueprint, current_app, g, jsonify, request

from csrf import csrf_protect
from db import get_db
from models import get_post, get_reaction_counts, toggle_reaction

bp = Blueprint("reactions", __name__, url_prefix="/api")


@bp.route("/post/<int:post_id>/react", methods=["POST"])
@csrf_protect
def react(post_id):
    if g.user is None:
        return jsonify({"ok": False, "error": "Please log in first."}), 401

    data = request.get_json(silent=True) or {}
    kind = data.get("kind", "")
    if kind not in ("like", "dislike"):
        return jsonify({"ok": False, "error": "Reaction must be 'like' or 'dislike'."}), 400

    conn = get_db(current_app)
    try:
        post = get_post(conn, post_id)
        if post is None:
            return jsonify({"ok": False, "error": "Post not found."}), 404
        reaction = toggle_reaction(conn, post_id, g.user["id"], kind)
        counts = get_reaction_counts(conn, post_id)
    finally:
        conn.close()

    return jsonify({"ok": True, "reaction": reaction, "counts": counts})
