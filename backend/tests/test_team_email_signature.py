"""
Team CRM: Email sending, signature CRUD, and email history tests.
Endpoints under test:
  POST /api/team/login          (JWT)
  GET  /api/team/signature
  PUT  /api/team/signature
  POST /api/team/leads/{id}/email
  GET  /api/team/leads/{id}/emails
"""
import os
import pytest
import requests
import time

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://roi-calc-preview.preview.emergentagent.com").rstrip("/")

MILENA_EMAIL = "milena@euroadria.me"
MILENA_PASSWORD = "mb2026!mnfgz"


# ── Fixtures ────────────────────────────────────────────────────────────

@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def team_token(api):
    # Ensure seeded
    api.get(f"{BASE_URL}/api/team/seed", timeout=10)
    r = api.post(f"{BASE_URL}/api/team/login", json={"email": MILENA_EMAIL, "password": MILENA_PASSWORD}, timeout=10)
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 0
    return data["token"]


@pytest.fixture(scope="module")
def auth_headers(team_token):
    return {"Authorization": f"Bearer {team_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def test_lead_id(api, auth_headers):
    """Create a TEST_ lead so we can test email endpoints even if DB is empty."""
    payload = {
        "name": "TEST_EmailFeature Lead",
        "email": "test-email-feature@example.com",
        "phone": "+49123456789",
        "source": "test_suite",
        "interest": "Test",
        "timeline": "Immediate",
        "contact_method": "email",
    }
    r = requests.post(f"{BASE_URL}/api/leads", json=payload, timeout=10)
    # /api/leads may return 200 or 201, tolerate both
    assert r.status_code in (200, 201), f"Lead create failed: {r.status_code} {r.text}"
    body = r.json()
    lead_id = body.get("id") or body.get("_id") or body.get("lead_id")
    # If /api/leads doesn't return an id, fetch via team endpoint
    if not lead_id:
        r2 = requests.get(f"{BASE_URL}/api/team/leads", headers={"Authorization": auth_headers["Authorization"]}, timeout=10)
        assert r2.status_code == 200
        for l in r2.json():
            if l.get("email") == payload["email"]:
                lead_id = l["_id"]
                break
    assert lead_id, "Could not determine created lead id"
    yield lead_id
    # Cleanup handled by admin lead deletion if needed - skipping to avoid basic auth here


# ── Signature CRUD ──────────────────────────────────────────────────────

class TestSignature:
    def test_get_signature_returns_object(self, auth_headers):
        r = requests.get(f"{BASE_URL}/api/team/signature", headers=auth_headers, timeout=10)
        assert r.status_code == 200
        data = r.json()
        assert "signature" in data
        assert isinstance(data["signature"], str)

    def test_put_signature_saves(self, auth_headers):
        new_sig = "TEST_SIG Mit freundlichen Grüßen,\nMilena Bubanja\n+382 68 559 776"
        r = requests.put(
            f"{BASE_URL}/api/team/signature",
            headers=auth_headers,
            json={"signature": new_sig},
            timeout=10,
        )
        assert r.status_code == 200
        assert r.json().get("success") is True

        # Verify persistence via GET
        r2 = requests.get(f"{BASE_URL}/api/team/signature", headers=auth_headers, timeout=10)
        assert r2.status_code == 200
        assert r2.json().get("signature") == new_sig

    def test_signature_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/team/signature", timeout=10)
        assert r.status_code in (401, 403)


# ── Email endpoint ──────────────────────────────────────────────────────

class TestSendEmail:
    def test_email_requires_auth(self, test_lead_id):
        r = requests.post(
            f"{BASE_URL}/api/team/leads/{test_lead_id}/email",
            json={"subject": "x", "body": "y"},
            timeout=10,
        )
        assert r.status_code in (401, 403)

    def test_email_missing_subject_422(self, auth_headers, test_lead_id):
        # Missing 'subject' -> Pydantic validation should return 422
        r = requests.post(
            f"{BASE_URL}/api/team/leads/{test_lead_id}/email",
            headers=auth_headers,
            json={"body": "no subject"},
            timeout=10,
        )
        assert r.status_code == 422

    def test_email_missing_body_422(self, auth_headers, test_lead_id):
        r = requests.post(
            f"{BASE_URL}/api/team/leads/{test_lead_id}/email",
            headers=auth_headers,
            json={"subject": "only subject"},
            timeout=10,
        )
        assert r.status_code == 422

    def test_email_nonexistent_lead_404(self, auth_headers):
        fake_id = "507f1f77bcf86cd799439011"
        r = requests.post(
            f"{BASE_URL}/api/team/leads/{fake_id}/email",
            headers=auth_headers,
            json={"subject": "hi", "body": "hi"},
            timeout=15,
        )
        # Endpoint checks lead existence first, before Resend
        assert r.status_code == 404

    def test_email_send_response(self, auth_headers, test_lead_id):
        """
        Depending on Resend API key configuration this returns either 200 (success)
        or 500 (email service not configured / Resend rejected). Endpoint must
        respond and be authenticated - not crash.
        """
        r = requests.post(
            f"{BASE_URL}/api/team/leads/{test_lead_id}/email",
            headers=auth_headers,
            json={"subject": "TEST_ Testbetreff", "body": "TEST_ Nachrichtentext\nZweite Zeile", "signature": "TEST_SIG"},
            timeout=30,
        )
        assert r.status_code in (200, 500), f"Unexpected status: {r.status_code} - {r.text}"
        if r.status_code == 200:
            body = r.json()
            assert body.get("success") is True
            assert "message" in body


# ── Email history ───────────────────────────────────────────────────────

class TestEmailHistory:
    def test_history_returns_list(self, auth_headers, test_lead_id):
        r = requests.get(
            f"{BASE_URL}/api/team/leads/{test_lead_id}/emails",
            headers=auth_headers,
            timeout=10,
        )
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # If prior send test succeeded, verify the record
        for e in data:
            assert "subject" in e
            assert "body" in e
            assert "sent_by" in e
            # ObjectID should be a string, not embedded object
            assert isinstance(e.get("_id"), str)

    def test_history_requires_auth(self, test_lead_id):
        r = requests.get(f"{BASE_URL}/api/team/leads/{test_lead_id}/emails", timeout=10)
        assert r.status_code in (401, 403)
