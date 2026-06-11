def test_home_returns_200(client):
    resp = client.get("/")
    assert resp.status_code == 200


def test_security_headers(client):
    resp = client.get("/")
    assert resp.headers.get("Content-Security-Policy") == "default-src 'self'"
    assert resp.headers.get("X-Content-Type-Options") == "nosniff"
    assert resp.headers.get("X-Frame-Options") == "DENY"
