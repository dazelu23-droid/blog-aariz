import json
import re


def _csrf(client, path="/login"):
    resp = client.get(path)
    return re.search(r'name="csrf_token" value="([^"]+)"', resp.data.decode()).group(1)


def test_add_comment(auth_client, post_id):
    token = _csrf(auth_client)
    resp = auth_client.post(
        f"/api/post/{post_id}/comment",
        data=json.dumps({"body": "Nice post!"}),
        content_type="application/json",
        headers={"X-CSRF-Token": token},
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["ok"] is True
    assert data["comment"]["body"] == "Nice post!"


def test_comment_guest_401(client, post_id):
    token = _csrf(client)
    resp = client.post(
        f"/api/post/{post_id}/comment",
        data=json.dumps({"body": "Hi"}),
        content_type="application/json",
        headers={"X-CSRF-Token": token},
    )
    assert resp.status_code == 401


def test_comment_empty_400(auth_client, post_id):
    token = _csrf(auth_client)
    resp = auth_client.post(
        f"/api/post/{post_id}/comment",
        data=json.dumps({"body": "   "}),
        content_type="application/json",
        headers={"X-CSRF-Token": token},
    )
    assert resp.status_code == 400


def test_comment_unknown_post(auth_client):
    token = _csrf(auth_client)
    resp = auth_client.post(
        "/api/post/99999/comment",
        data=json.dumps({"body": "Hi"}),
        content_type="application/json",
        headers={"X-CSRF-Token": token},
    )
    assert resp.status_code == 404
