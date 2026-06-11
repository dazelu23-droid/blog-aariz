import re


def _csrf(client, path="/signup"):
    resp = client.get(path)
    return re.search(r'name="csrf_token" value="([^"]+)"', resp.data.decode()).group(1)


def test_signup_login_logout(client):
    token = _csrf(client)
    resp = client.post("/signup", data={
        "csrf_token": token,
        "username": "alice",
        "email": "alice@example.com",
        "password": "password123",
    })
    assert resp.status_code == 302
    assert "/login" in resp.headers["Location"]

    token = _csrf(client, "/login")
    resp = client.post("/login", data={
        "csrf_token": token,
        "username": "alice",
        "password": "password123",
    })
    assert resp.status_code == 302

    token = _csrf(client, "/login")
    resp = client.post("/logout", data={"csrf_token": token})
    assert resp.status_code == 302
    assert resp.headers["Location"].endswith("/")


def test_duplicate_username_case_insensitive(client):
    token = _csrf(client)
    client.post("/signup", data={
        "csrf_token": token,
        "username": "Alice",
        "email": "alice@example.com",
        "password": "password123",
    })
    token = _csrf(client)
    resp = client.post("/signup", data={
        "csrf_token": token,
        "username": "alice",
        "email": "bob@example.com",
        "password": "password123",
    })
    assert resp.status_code == 400


def test_wrong_password(client):
    token = _csrf(client)
    client.post("/signup", data={
        "csrf_token": token,
        "username": "alice",
        "email": "alice@example.com",
        "password": "password123",
    })
    token = _csrf(client, "/login")
    resp = client.post("/login", data={
        "csrf_token": token,
        "username": "alice",
        "password": "wrongpass",
    })
    assert resp.status_code == 400


def test_protected_route_redirects_guest(client):
    resp = client.get("/new")
    assert resp.status_code == 302
    assert "/login?next=/new" in resp.headers["Location"]


def test_open_redirect_blocked(client):
    token = _csrf(client)
    client.post("/signup", data={
        "csrf_token": token,
        "username": "alice",
        "email": "alice@example.com",
        "password": "password123",
    })
    token = _csrf(client, "/login")
    resp = client.post("/login", data={
        "csrf_token": token,
        "username": "alice",
        "password": "password123",
        "next": "//evil.com",
    })
    assert resp.status_code == 302
    assert "evil.com" not in resp.headers["Location"]
