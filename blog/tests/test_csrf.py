import json
import re


def test_post_without_csrf_returns_400(csrf_client):
    resp = csrf_client.post("/signup", data={
        "username": "alice",
        "email": "alice@example.com",
        "password": "password123",
    })
    assert resp.status_code == 400


def test_api_without_csrf_returns_400_json(csrf_client, csrf_app):
    from conftest import signup_and_login
    signup_and_login(csrf_client)
    from db import get_db
    from models import create_post
    conn = get_db(csrf_app)
    try:
        user = conn.execute("SELECT id FROM users WHERE username = 'alice'").fetchone()
        pid = create_post(conn, user["id"], "T", "B")
    finally:
        conn.close()
    resp = csrf_client.post(
        f"/api/post/{pid}/comment",
        data=json.dumps({"body": "Hi"}),
        content_type="application/json",
    )
    assert resp.status_code == 400
    data = resp.get_json()
    assert data["ok"] is False
