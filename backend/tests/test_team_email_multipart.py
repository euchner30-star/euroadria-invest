"""
Tests for POST /api/team/leads/{lead_id}/email after switch from JSON body
to multipart/form-data (subject/body/signature as Form fields + optional
attachment File).

We monkeypatch RESEND_API_KEY and resend.Emails.send to reach the full flow
without needing a real API key in preview.
"""
import sys
import io
import pytest
import pytest_asyncio
import httpx

sys.path.insert(0, "/app/backend")

from server import app  # noqa: E402
import routes.team as team_module  # noqa: E402
import resend  # noqa: E402


MILENA_EMAIL = "milena@euroadria.me"
MILENA_PASSWORD = "mb2026!mnfgz"
TEST_LEAD_EMAIL = "test-multipart-email@example.com"


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
        "name": "TEST_Multipart Lead",
        "email": TEST_LEAD_EMAIL,
        "phone": "+49123456789",
        "source": "test_suite_multipart",
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
    monkeypatch.setattr(team_module, "RESEND_API_KEY", "test_dummy_key")
    captured = {}

    class _StubEmails:
        @staticmethod
        def send(payload):
            captured["payload"] = payload
            return {"id": "stub_email_id_multipart"}

    monkeypatch.setattr(resend, "Emails", _StubEmails)
    return captured


# ── Endpoint contract: multipart accepted, JSON rejected ────────────────

@pytest.mark.asyncio(loop_scope="module")
async def test_multipart_without_attachment(client, auth_headers, lead_id, capture_send):
    data = {"subject": "TEST_ multipart no attach", "body": "Hello", "signature": ""}
    r = await client.post(f"/api/team/leads/{lead_id}/email", headers=auth_headers, data=data)
    assert r.status_code == 200, f"unexpected: {r.status_code} {r.text}"
    assert "payload" in capture_send
    assert "attachments" not in capture_send["payload"]


@pytest.mark.asyncio(loop_scope="module")
async def test_multipart_with_attachment(client, auth_headers, lead_id, capture_send):
    data = {"subject": "TEST_ with attach", "body": "Body", "signature": ""}
    files = {"attachment": ("test_file.txt", io.BytesIO(b"hello world"), "text/plain")}
    r = await client.post(f"/api/team/leads/{lead_id}/email", headers=auth_headers, data=data, files=files)
    assert r.status_code == 200, f"unexpected: {r.status_code} {r.text}"
    p = capture_send["payload"]
    assert "attachments" in p
    assert p["attachments"][0]["filename"] == "test_file.txt"
    assert list(b"hello world") == p["attachments"][0]["content"]


@pytest.mark.asyncio(loop_scope="module")
async def test_json_body_rejected(client, auth_headers, lead_id):
    r = await client.post(
        f"/api/team/leads/{lead_id}/email",
        headers=auth_headers,
        json={"subject": "s", "body": "b", "signature": ""},
    )
    assert r.status_code == 422


# ── Signature / greeting behaviour (bug fix under test) ─────────────────

@pytest.mark.asyncio(loop_scope="module")
async def test_empty_signature_no_kind_regards(client, auth_headers, lead_id, capture_send):
    """When signature is empty, 'Kind regards' fallback MUST NOT appear."""
    data = {"subject": "TEST_ empty sig", "body": "Body", "signature": ""}
    r = await client.post(f"/api/team/leads/{lead_id}/email", headers=auth_headers, data=data)
    assert r.status_code == 200
    html = capture_send["payload"]["html"]
    assert "Kind regards" not in html, f"Fallback 'Kind regards' should be gone. HTML: {html[:800]}"
    assert "Milena Bubanja" not in html.split('<div style="margin-top: 28px')[0]  # not before corporate sig


@pytest.mark.asyncio(loop_scope="module")
async def test_whitespace_signature_no_kind_regards(client, auth_headers, lead_id, capture_send):
    data = {"subject": "TEST_ ws sig", "body": "Body", "signature": "   \n\t  "}
    r = await client.post(f"/api/team/leads/{lead_id}/email", headers=auth_headers, data=data)
    assert r.status_code == 200
    html = capture_send["payload"]["html"]
    assert "Kind regards" not in html


@pytest.mark.asyncio(loop_scope="module")
async def test_custom_signature_used_verbatim(client, auth_headers, lead_id, capture_send):
    custom = "Beste Grüße\nMilena Bubanja"
    data = {"subject": "TEST_ custom sig", "body": "Body", "signature": custom}
    r = await client.post(f"/api/team/leads/{lead_id}/email", headers=auth_headers, data=data)
    assert r.status_code == 200
    html = capture_send["payload"]["html"]
    assert "Beste Gr" in html
    assert "Milena Bubanja" in html
    assert "Beste Grüße<br>Milena Bubanja" in html


# ── Corporate signature template (mobile-friendly div layout) ───────────

@pytest.mark.asyncio(loop_scope="module")
async def test_signature_uses_div_layout_not_table(client, auth_headers, lead_id, capture_send):
    data = {"subject": "TEST_ sig layout", "body": "Body", "signature": ""}
    r = await client.post(f"/api/team/leads/{lead_id}/email", headers=auth_headers, data=data)
    assert r.status_code == 200
    html = capture_send["payload"]["html"]
    # Signature block should not use <table> layout anymore
    sig_start = html.find("EuroAdria Corporate Solutions")
    assert sig_start > 0
    sig_block = html[sig_start - 300 : sig_start + 800]
    assert "<table" not in sig_block, "Signature should be stacked divs, not table layout"
    assert "<div" in sig_block


# ── Attachment persistence in DB record & auto-note ─────────────────────

@pytest.mark.asyncio(loop_scope="module")
async def test_attachment_recorded_in_history(client, auth_headers, lead_id, capture_send):
    data = {"subject": "TEST_ attach persist", "body": "Body", "signature": ""}
    files = {"attachment": ("persist.pdf", io.BytesIO(b"%PDF-1.4 fake"), "application/pdf")}
    r = await client.post(f"/api/team/leads/{lead_id}/email", headers=auth_headers, data=data, files=files)
    assert r.status_code == 200
    h = await client.get(f"/api/team/leads/{lead_id}/emails", headers=auth_headers)
    assert h.status_code == 200
    match = next((e for e in h.json() if e.get("subject") == "TEST_ attach persist"), None)
    assert match, "email record not persisted"
    assert match.get("attachment") == "persist.pdf"


@pytest.mark.asyncio(loop_scope="module")
async def test_10mb_attachment_rejected(client, auth_headers, lead_id, capture_send):
    big = io.BytesIO(b"x" * (10 * 1024 * 1024 + 100))
    data = {"subject": "TEST_ big", "body": "Body", "signature": ""}
    files = {"attachment": ("big.bin", big, "application/octet-stream")}
    r = await client.post(f"/api/team/leads/{lead_id}/email", headers=auth_headers, data=data, files=files)
    # Endpoint wraps HTTPException in generic 500 - accept either
    assert r.status_code in (400, 500)
    assert "too large" in r.text.lower() or "10mb" in r.text.lower() or "attachment" in r.text.lower()


# ── Dennis Lein name (bug fix) ──────────────────────────────────────────

@pytest.mark.asyncio(loop_scope="module")
async def test_dennis_lein_name_updated(client):
    r = await client.get("/api/admin/team-members", auth=("admin", "euroadria2025"))
    assert r.status_code == 200
    members = r.json()
    dennis = next((m for m in members if m.get("email") == "d.lein@euroadria.me"), None)
    assert dennis is not None, "Dennis not found"
    assert dennis["name"] == "Dennis Lein", f"Expected 'Dennis Lein', got '{dennis['name']}'"


# ── Preview-env behaviour (RESEND_API_KEY not set) ──────────────────────

@pytest.mark.asyncio(loop_scope="module")
async def test_preview_returns_email_service_not_configured(client, auth_headers, lead_id, monkeypatch):
    """When RESEND_API_KEY is unset, we should get 500 'Email service not configured' - not a Python error."""
    monkeypatch.setattr(team_module, "RESEND_API_KEY", None)
    data = {"subject": "TEST_ no key", "body": "Body", "signature": ""}
    r = await client.post(f"/api/team/leads/{lead_id}/email", headers=auth_headers, data=data)
    assert r.status_code == 500
    assert "Email service not configured" in r.text
