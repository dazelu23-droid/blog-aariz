import sqlite3

from flask import Blueprint, current_app, g, redirect, render_template, request, url_for

from auth.utils import login_user, logout_user, safe_next_url
from csrf import csrf_protect
from db import get_db
from models import (
    create_user,
    email_exists,
    get_user_by_username,
    validate_email,
    validate_password,
    validate_username,
    verify_password,
    username_exists,
)

bp = Blueprint("auth", __name__)


@bp.route("/signup", methods=["GET"])
def signup():
    return render_template("signup.html")


@bp.route("/signup", methods=["POST"])
@csrf_protect
def signup_post():
    username = request.form.get("username", "")
    email = request.form.get("email", "")
    password = request.form.get("password", "")
    errors = []

    err = validate_username(username)
    if err:
        errors.append(err)
    err = validate_email(email)
    if err:
        errors.append(err)
    err = validate_password(password)
    if err:
        errors.append(err)

    conn = get_db(current_app)
    try:
        if not errors and username_exists(conn, username):
            errors.append("That username is already taken.")
        if not errors and email_exists(conn, email):
            errors.append("That email is already registered.")

        if errors:
            return render_template("signup.html", errors=errors, username=username, email=email), 400

        try:
            create_user(conn, username, email, password)
        except sqlite3.IntegrityError:
            return render_template(
                "signup.html",
                errors=["That username is already taken."],
                username=username,
                email=email,
            ), 400
    finally:
        conn.close()

    return redirect(url_for("auth.login"))


@bp.route("/login", methods=["GET"])
def login():
    return render_template("login.html", next=request.args.get("next", ""))


@bp.route("/login", methods=["POST"])
@csrf_protect
def login_post():
    username = request.form.get("username", "")
    password = request.form.get("password", "")
    next_url = request.form.get("next", "")

    conn = get_db(current_app)
    try:
        user = get_user_by_username(conn, username)
        if user is None or not verify_password(user, password):
            return render_template(
                "login.html",
                errors=["Invalid username or password."],
                username=username,
                next=next_url,
            ), 400
    finally:
        conn.close()

    login_user(user["id"], user["username"])
    dest = safe_next_url(next_url) or url_for("posts.index")
    return redirect(dest)


@bp.route("/logout", methods=["POST"])
@csrf_protect
def logout():
    logout_user()
    return redirect(url_for("posts.index"))
