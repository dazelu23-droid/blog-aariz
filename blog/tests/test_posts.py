import re

from conftest import signup_and_login


def _csrf(client, path="/new"):
    resp = client.get(path)
    return re.search(r'name="csrf_token" value="([^"]+)"', resp.data.decode()).group(1)


def test_create_edit_delete_post(auth_client, app):
    token = _csrf(auth_client)
    resp = auth_client.post("/new", data={
        "csrf_token": token,
        "title": "My Title",
        "body": "My body content here.",
    })
    assert resp.status_code == 302
    post_id = int(resp.headers["Location"].rstrip("/").split("/")[-1])

    resp = auth_client.get(f"/post/{post_id}")
    assert resp.status_code == 200
    assert b"My Title" in resp.data

    token = _csrf(auth_client, f"/edit/{post_id}")
    resp = auth_client.post(f"/edit/{post_id}", data={
        "csrf_token": token,
        "title": "Updated Title",
        "body": "Updated body.",
    })
    assert resp.status_code == 302

    resp = auth_client.get(f"/post/{post_id}")
    assert b"(edited)" in resp.data

    token = _csrf(auth_client, f"/edit/{post_id}")
    resp = auth_client.post(f"/delete/{post_id}", data={"csrf_token": token})
    assert resp.status_code == 302


def test_non_author_gets_403(client, app, post_id):
    signup_and_login(client, "bob", "bob@example.com", "password123")
    resp = client.get(f"/edit/{post_id}")
    assert resp.status_code == 403


def test_unknown_post_404(client):
    resp = client.get("/post/99999")
    assert resp.status_code == 404


def test_empty_title_rejected(auth_client):
    token = _csrf(auth_client)
    resp = auth_client.post("/new", data={
        "csrf_token": token,
        "title": "   ",
        "body": "Some body",
    })
    assert resp.status_code == 400


def test_guest_cannot_create(client):
    resp = client.post("/new", data={"title": "T", "body": "B"}, follow_redirects=False)
    assert resp.status_code == 302
