import json
import re


def _csrf(client, path="/login"):
    resp = client.get(path)
    return re.search(r'name="csrf_token" value="([^"]+)"', resp.data.decode()).group(1)


def test_react_toggle(auth_client, post_id):
    token = _csrf(auth_client)
    resp = auth_client.post(
        f"/api/post/{post_id}/react",
        data=json.dumps({"kind": "like"}),
        content_type="application/json",
        headers={"X-CSRF-Token": token},
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["reaction"] == "like"
    assert data["counts"]["like"] == 1

    resp = auth_client.post(
        f"/api/post/{post_id}/react",
        data=json.dumps({"kind": "like"}),
        content_type="application/json",
        headers={"X-CSRF-Token": token},
    )
    data = resp.get_json()
    assert data["reaction"] is None
    assert data["counts"]["like"] == 0


def test_react_switch(auth_client, post_id):
    token = _csrf(auth_client)
    auth_client.post(
        f"/api/post/{post_id}/react",
        data=json.dumps({"kind": "like"}),
        content_type="application/json",
        headers={"X-CSRF-Token": token},
    )
    resp = auth_client.post(
        f"/api/post/{post_id}/react",
        data=json.dumps({"kind": "dislike"}),
        content_type="application/json",
        headers={"X-CSRF-Token": token},
    )
    data = resp.get_json()
    assert data["reaction"] == "dislike"
    assert data["counts"]["like"] == 0
    assert data["counts"]["dislike"] == 1


def test_bad_kind(auth_client, post_id):
    token = _csrf(auth_client)
    resp = auth_client.post(
        f"/api/post/{post_id}/react",
        data=json.dumps({"kind": "love"}),
        content_type="application/json",
        headers={"X-CSRF-Token": token},
    )
    assert resp.status_code == 400
