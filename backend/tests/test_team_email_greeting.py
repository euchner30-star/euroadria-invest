"""
Unit tests verifying the default 'Kind regards, {member_name}' greeting logic
in POST /api/team/leads/{lead_id}/email (routes/team.py lines 233-238).

RESEND_API_KEY is not set in the preview environment, so the live endpoint
returns 500 before reaching the signature branch. This test file imports the
ASGI app in-process and:
  - monkeypatches routes.team.RESEND_API_KEY -> dummy value
  - monkeypatches resend.Emails.send -> stub that captures the outgoing HTML

We use httpx.AsyncClient + ASGITransport (single event loop shared with the
motor client) to avoid the "Event loop is closed" issue that arises from
starlette.TestClient's per-test loop.
"""
import sys
import pytest
import pytest_asyncio
import httpx

sys.path.insert(0, "/app/backend")

from server import app  # noqa: E402
import routes.team as team_module  # noqa: E402
import resend  # noqa: E402


MILENA_EMAIL = "milena@euroadria.me"
MILENA_PASSWORD = "mb2026!mnfgz"
TEST_LEAD_EMAIL = "test-greeting-logic@example.com"


# ── Fixtures ────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"


@pytest_asyncio.fixture(scope="module", loop_scope="module")
async def client():
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as ac:
        yield ac


@pytest_asyncio.fixture(scope="module", loop_scope="module")
async def token(client):
    await client.get("/api/team/seed")
    r = await client.post(
        "/api/team/login",
        json={"email": MILENA_EMAIL, "password": MILENA_PASSWORD},
    )
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest_asyncio.fixture(scope="module", loop_scope="module")
async def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture(scope="module", loop_scope="module")
async def lead_id(client, auth_headers):
    payload = {
        "name": "TEST_GreetingLogic Lead",
        "email": TEST_LEAD_EMAIL,
        "phone": "+49123456789",
        "source": "test_suite_greeting",
        "interest": "Test",
        "timeline": "Immediate",
        "contact_method": "email",
    }
    r = await client.post("/api/leads", json=payload)
    assert r.status_code in (200, 201), f"lead create: {r.status_code} {r.text}"
    r2 = await client.get("/api/team/leads", headers=auth_headers)
    assert r2.status_code == 200
    lid = None
    for l in r2.json():
        if l.get("email") == TEST_LEAD_EMAIL:
            lid = l["_id"]
            break
    assert lid, "created lead id not found"
    return lid


@pytest.fixture
def capture_send(monkeypatch):
    """Patch RESEND_API_KEY + resend.Emails.send to capture outgoing HTML."""
    monkeypatch.setattr(team_module, "RESEND_API_KEY", "test_dummy_key")

    captured = {}

    class _StubEmails:
        @staticmethod
        def send(payload):
            captured["payload"] = payload
            return {"id": "stub_email_id_123"}

    monkeypatch.setattr(resend, "Emails", _StubEmails)
    return captured


# ── Default greeting (the bug fix under test) ───────────────────────────

@pytest.mark.asyncio(loop_scope="module")
async def test_empty_signature_uses_default_kind_regards_milena(client, auth_headers, lead_id, capture_send):
    r = await client.post(
        f"/api/team/leads/{lead_id}/email",
        headers=auth_headers,
        json={"subject": "TEST_ default greeting", "body": "Hallo,\nDies ist ein Test.", "signature": ""},
    )
    assert r.status_code == 200, f"unexpected: {r.status_code} {r.text}"
    assert "payload" in capture_send, "resend.Emails.send was not called"
    html = capture_send["payload"]["html"]
    assert "Kind regards,<br>Milena Bubanja" in html, (
        f"Default greeting missing. HTML snippet: {html[:1500]}"
    )
    assert "TEST_SIG_CUSTOM" not in html


@pytest.mark.asyncio(loop_scope="module")
async def test_null_signature_uses_default_greeting(client, auth_headers, lead_id, capture_send):
    r = await client.post(
        f"/api/team/leads/{lead_id}/email",
        headers=auth_headers,
        json={"subject": "TEST_ null signature", "body": "Nachricht."},
    )
    assert r.status_code == 200, f"unexpected: {r.status_code} {r.text}"
    html = capture_send["payload"]["html"]
    assert "Kind regards,<br>Milena Bubanja" in html


@pytest.mark.asyncio(loop_scope="module")
async def test_whitespace_only_signature_uses_default_greeting(client, auth_headers, lead_id, capture_send):
    r = await client.post(
        f"/api/team/leads/{lead_id}/email",
        headers=auth_headers,
        json={"subject": "TEST_ whitespace sig", "body": "Nachricht.", "signature": "   \n\t  "},
    )
    assert r.status_code == 200, f"unexpected: {r.status_code} {r.text}"
    html = capture_send["payload"]["html"]
    assert "Kind regards,<br>Milena Bubanja" in html


# ── Custom signature branch ─────────────────────────────────────────────

@pytest.mark.asyncio(loop_scope="module")
async def test_custom_signature_used_verbatim(client, auth_headers, lead_id, capture_send):
    custom = "Mit freundlichen Grüßen,\nMilena Bubanja\n+382 68 559 776\nTEST_SIG_CUSTOM"
    r = await client.post(
        f"/api/team/leads/{lead_id}/email",
        headers=auth_headers,
        json={"subject": "TEST_ custom sig", "body": "Hallo.", "signature": custom},
    )
    assert r.status_code == 200, f"unexpected: {r.status_code} {r.text}"
    html = capture_send["payload"]["html"]
    assert "Mit freundlichen Gr" in html
    assert "TEST_SIG_CUSTOM" in html
    assert "+382 68 559 776" in html
    # Default fallback must NOT be present when a custom signature is used
    assert "Kind regards,<br>Milena Bubanja" not in html


@pytest.mark.asyncio(loop_scope="module")
async def test_custom_signature_converts_newlines_to_br(client, auth_headers, lead_id, capture_send):
    custom = "Line1\nLine2\nLine3"
    r = await client.post(
        f"/api/team/leads/{lead_id}/email",
        headers=auth_headers,
        json={"subject": "TEST_ newline sig", "body": "Body.", "signature": custom},
    )
    assert r.status_code == 200
    html = capture_send["payload"]["html"]
    assert "Line1<br>Line2<br>Line3" in html


# ── Payload / persistence sanity ────────────────────────────────────────

@pytest.mark.asyncio(loop_scope="module")
async def test_from_reply_to_and_subject(client, auth_headers, lead_id, capture_send):
    r = await client.post(
        f"/api/team/leads/{lead_id}/email",
        headers=auth_headers,
        json={"subject": "TEST_ Payload Shape", "body": "b"},
    )
    assert r.status_code == 200
    p = capture_send["payload"]
    assert p["subject"] == "TEST_ Payload Shape"
    assert p["reply_to"] == MILENA_EMAIL
    assert MILENA_EMAIL in p["from"]
    assert "Milena Bubanja" in p["from"]
    assert p["to"] == [TEST_LEAD_EMAIL]


@pytest.mark.asyncio(loop_scope="module")
async def test_email_record_persisted(client, auth_headers, lead_id, capture_send):
    subj = "TEST_ Persistence Check"
    r = await client.post(
        f"/api/team/leads/{lead_id}/email",
        headers=auth_headers,
        json={"subject": subj, "body": "persisted body"},
    )
    assert r.status_code == 200
    h = await client.get(f"/api/team/leads/{lead_id}/emails", headers=auth_headers)
    assert h.status_code == 200
    subjects = [e.get("subject") for e in h.json()]
    assert subj in subjects
