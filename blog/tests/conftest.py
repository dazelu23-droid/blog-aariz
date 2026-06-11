import os
import tempfile

import pytest

from app import create_app
from db import get_db, init_db
from models import create_post, create_user


@pytest.fixture
def app():
    db_fd, db_path = tempfile.mkstemp(suffix=".db")
    os.close(db_fd)
    application = create_app({
        "TESTING": True,
        "DATABASE": db_path,
        "SECRET_KEY": "test-secret",
        "WTF_CSRF_ENABLED": False,
    })
    application.config["DISABLE_CSRF"] = True
    yield application
    os.unlink(db_path)


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def csrf_app():
    db_fd, db_path = tempfile.mkstemp(suffix=".db")
    os.close(db_fd)
    application = create_app({
        "TESTING": True,
        "DATABASE": db_path,
        "SECRET_KEY": "test-secret",
    })
    application.config["DISABLE_CSRF"] = False
    yield application
    os.unlink(db_path)


@pytest.fixture
def csrf_client(csrf_app):
    return csrf_app.test_client()


def _get_csrf(client):
    resp = client.get("/login")
    import re
    match = re.search(r'name="csrf_token" value="([^"]+)"', resp.data.decode())
    return match.group(1) if match else ""


@pytest.fixture
def csrf_token(csrf_client):
    return _get_csrf(csrf_client)


def signup_and_login(client, username="alice", email="alice@example.com", password="password123"):
    with client.session_transaction() as sess:
        pass
    resp = client.get("/signup")
    import re
    token = re.search(r'name="csrf_token" value="([^"]+)"', resp.data.decode()).group(1)
    client.post("/signup", data={
        "csrf_token": token,
        "username": username,
        "email": email,
        "password": password,
    }, follow_redirects=True)
    resp = client.get("/login")
    token = re.search(r'name="csrf_token" value="([^"]+)"', resp.data.decode()).group(1)
    client.post("/login", data={
        "csrf_token": token,
        "username": username,
        "password": password,
    }, follow_redirects=True)


@pytest.fixture
def auth_client(client):
    signup_and_login(client)
    return client


@pytest.fixture
def post_id(app):
    conn = get_db(app)
    try:
        uid = create_user(conn, "postauthor", "author@example.com", "password123")
        pid = create_post(conn, uid, "Test Post", "This is a test post body.")
    finally:
        conn.close()
    return pid
