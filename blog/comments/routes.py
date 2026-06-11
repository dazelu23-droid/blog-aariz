from flask import Blueprint, current_app, g, jsonify, request

from csrf import csrf_protect
from db import get_db
from models import create_comment, get_comment, get_post, validate_comment

bp = Blueprint("comments", __name__, url_prefix="/api")


@bp.route("/post/<int:post_id>/comment", methods=["POST"])
@csrf_protect
def add_comment(post_id):
    if g.user is None:
        return jsonify({"ok": False, "error": "Please log in first."}), 401

    data = request.get_json(silent=True) or {}
    body = data.get("body", "")

    err = validate_comment(body)
    if err:
        return jsonify({"ok": False, "error": err}), 400

    conn = get_db(current_app)
    try:
        post = get_post(conn, post_id)
        if post is None:
            return jsonify({"ok": False, "error": "Post not found."}), 404
        comment_id = create_comment(conn, post_id, g.user["id"], body)
        comment = get_comment(conn, comment_id)
    finally:
        conn.close()

    return jsonify({
        "ok": True,
        "comment": {
            "id": comment["id"],
            "post_id": comment["post_id"],
            "body": comment["body"],
            "created_at": comment["created_at"],
            "author": comment["author"],
        },
    }), 201
