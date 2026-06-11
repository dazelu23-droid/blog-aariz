from conftest import signup_and_login


def test_empty_search_shows_prompt(client):
    resp = client.get("/search")
    assert resp.status_code == 200
    assert b"Enter a search term" in resp.data


def test_search_finds_posts(client, app):
    signup_and_login(client)
    import re
    token = re.search(
        r'name="csrf_token" value="([^"]+)"',
        client.get("/new").data.decode(),
    ).group(1)
    client.post("/new", data={
        "csrf_token": token,
        "title": "Python Tips",
        "body": "Learn Python programming today.",
    })
    resp = client.get("/search?q=python")
    assert resp.status_code == 200
    assert b"Python Tips" in resp.data


def test_search_wildcard_literal(client, app):
    signup_and_login(client)
    import re
    token = re.search(
        r'name="csrf_token" value="([^"]+)"',
        client.get("/new").data.decode(),
    ).group(1)
    client.post("/new", data={
        "csrf_token": token,
        "title": "100% Complete",
        "body": "A post about percentages.",
    })
    resp = client.get("/search?q=%")
    assert b"100% Complete" in resp.data
