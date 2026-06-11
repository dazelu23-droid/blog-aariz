from flask import Blueprint, current_app, g, redirect, render_template, request, url_for

from auth.utils import current_user, login_required
from csrf import csrf_protect
from db import get_db
from models import (
    create_post,
    delete_post,
    get_post,
    get_reaction_counts,
    get_user_reaction,
    list_comments,
    list_posts,
    preview_body,
    update_post,
    validate_body,
    validate_title,
)

bp = Blueprint("posts", __name__)


@bp.route("/")
def index():
    conn = get_db(current_app)
    try:
        posts = list_posts(conn)
        for post in posts:
            post["preview"] = preview_body(post["body"])
    finally:
        conn.close()
    return render_template("index.html", posts=posts)


@bp.route("/post/<int:post_id>")
def detail(post_id):
    conn = get_db(current_app)
    try:
        post = get_post(conn, post_id)
        if post is None:
            return render_template("404.html"), 404
        comments = list_comments(conn, post_id)
        counts = get_reaction_counts(conn, post_id)
        user_reaction = None
        if g.user:
            user_reaction = get_user_reaction(conn, post_id, g.user["id"])
    finally:
        conn.close()
    return render_template(
        "post.html",
        post=post,
        comments=comments,
        counts=counts,
        user_reaction=user_reaction,
    )


@bp.route("/new", methods=["GET"])
@login_required
def new():
    return render_template("edit.html", post=None)


@bp.route("/new", methods=["POST"])
@login_required
@csrf_protect
def new_post():
    title = request.form.get("title", "")
    body = request.form.get("body", "")
    errors = []
    err = validate_title(title)
    if err:
        errors.append(err)
    err = validate_body(body)
    if err:
        errors.append(err)
    if errors:
        return render_template("edit.html", post=None, errors=errors, title=title, body=body), 400

    conn = get_db(current_app)
    try:
        post_id = create_post(conn, g.user["id"], title, body)
    finally:
        conn.close()
    return redirect(url_for("posts.detail", post_id=post_id))


@bp.route("/edit/<int:post_id>", methods=["GET"])
@login_required
def edit(post_id):
    conn = get_db(current_app)
    try:
        post = get_post(conn, post_id)
        if post is None:
            return render_template("404.html"), 404
        if post["author_id"] != g.user["id"]:
            return render_template("403.html"), 403
    finally:
        conn.close()
    return render_template("edit.html", post=post)


@bp.route("/edit/<int:post_id>", methods=["POST"])
@login_required
@csrf_protect
def edit_post(post_id):
    conn = get_db(current_app)
    try:
        post = get_post(conn, post_id)
        if post is None:
            return render_template("404.html"), 404
        if post["author_id"] != g.user["id"]:
            return render_template("403.html"), 403

        title = request.form.get("title", "")
        body = request.form.get("body", "")
        errors = []
        err = validate_title(title)
        if err:
            errors.append(err)
        err = validate_body(body)
        if err:
            errors.append(err)
        if errors:
            return render_template("edit.html", post=post, errors=errors, title=title, body=body), 400

        update_post(conn, post_id, title, body)
    finally:
        conn.close()
    return redirect(url_for("posts.detail", post_id=post_id))


@bp.route("/delete/<int:post_id>", methods=["POST"])
@login_required
@csrf_protect
def delete(post_id):
    conn = get_db(current_app)
    try:
        post = get_post(conn, post_id)
        if post is None:
            return render_template("404.html"), 404
        if post["author_id"] != g.user["id"]:
            return render_template("403.html"), 403
        delete_post(conn, post_id)
    finally:
        conn.close()
    return redirect(url_for("posts.index"))
