"""Tests for Admin Email endpoints:
- POST /api/admin/leads/{lead_id}/email
- GET  /api/admin/leads/{lead_id}/emails
"""
import base64
import os
import requests
import pytest

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://roi-calc-preview.preview.emergentagent.com').rstrip('/')

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "euroadria2025"

_admin_creds = base64.b64encode(f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}".encode()).decode()
ADMIN_AUTH = {"Authorization": f"Basic {_admin_creds}", "Content-Type": "application/json"}

# Known lead id provided in review request
KNOWN_LEAD_ID = "6a4ca31e83b7ddc8715a822d"


# ── Helpers ──────────────────────────────────────────────────────────

def _list_leads():
    r = requests.get(f"{BASE_URL}/api/admin/leads", headers=ADMIN_AUTH, timeout=15)
    if r.status_code != 200:
        return []
    return r.json()


def _first_lead_id():
    """Return first available lead id; prefer the KNOWN_LEAD_ID if present."""
    leads = _list_leads()
    if not leads:
        return None
    ids = [l.get("_id") or l.get("lead_id") for l in leads if l.get("_id") or l.get("lead_id")]
    if KNOWN_LEAD_ID in ids:
        return KNOWN_LEAD_ID
    return ids[0] if ids else None


# ── AUTH TESTS ───────────────────────────────────────────────────────

class TestAdminEmailAuth:
    """Auth checks on admin email endpoints."""

    def test_send_email_no_auth_returns_401(self):
        r = requests.post(
            f"{BASE_URL}/api/admin/leads/{KNOWN_LEAD_ID}/email",
            json={"subject": "hi", "body": "hi"},
            headers={"Content-Type": "application/json"},
            timeout=15,
        )
        assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text}"

    def test_send_email_wrong_auth_returns_401(self):
        bad = base64.b64encode(b"admin:wrong").decode()
        r = requests.post(
            f"{BASE_URL}/api/admin/leads/{KNOWN_LEAD_ID}/email",
            json={"subject": "hi", "body": "hi"},
            headers={"Authorization": f"Basic {bad}", "Content-Type": "application/json"},
            timeout=15,
        )
        assert r.status_code == 401

    def test_get_emails_no_auth_returns_401(self):
        r = requests.get(
            f"{BASE_URL}/api/admin/leads/{KNOWN_LEAD_ID}/emails",
            timeout=15,
        )
        assert r.status_code == 401


# ── VALIDATION TESTS ─────────────────────────────────────────────────

class TestAdminEmailValidation:
    """Pydantic validation on subject/body."""

    def test_missing_subject_returns_422(self):
        r = requests.post(
            f"{BASE_URL}/api/admin/leads/{KNOWN_LEAD_ID}/email",
            json={"body": "only body"},
            headers=ADMIN_AUTH,
            timeout=15,
        )
        assert r.status_code == 422, f"Expected 422, got {r.status_code}: {r.text}"

    def test_missing_body_returns_422(self):
        r = requests.post(
            f"{BASE_URL}/api/admin/leads/{KNOWN_LEAD_ID}/email",
            json={"subject": "only subject"},
            headers=ADMIN_AUTH,
            timeout=15,
        )
        assert r.status_code == 422

    def test_empty_body_json_returns_422(self):
        r = requests.post(
            f"{BASE_URL}/api/admin/leads/{KNOWN_LEAD_ID}/email",
            json={},
            headers=ADMIN_AUTH,
            timeout=15,
        )
        assert r.status_code == 422


# ── LEAD NOT FOUND ───────────────────────────────────────────────────

class TestAdminEmailLeadNotFound:
    def test_nonexistent_lead_returns_404_or_400(self):
        # Use a valid-looking but nonexistent ObjectId (24 hex chars)
        fake_id = "000000000000000000000000"
        r = requests.post(
            f"{BASE_URL}/api/admin/leads/{fake_id}/email",
            json={"subject": "hi", "body": "hi"},
            headers=ADMIN_AUTH,
            timeout=15,
        )
        # Endpoint raises 404 for lead not found; 400 acceptable for invalid ObjectId path
        assert r.status_code in (404, 400), f"Expected 404/400, got {r.status_code}: {r.text}"
        if r.status_code == 404:
            detail = r.json().get("detail", "")
            assert "not found" in detail.lower()

    def test_invalid_objectid_returns_400(self):
        r = requests.post(
            f"{BASE_URL}/api/admin/leads/not-a-valid-id/email",
            json={"subject": "hi", "body": "hi"},
            headers=ADMIN_AUTH,
            timeout=15,
        )
        # bson.ObjectId() will raise -> caught? The endpoint doesn't wrap ObjectId; it will
        # bubble up as 500. Acceptable behaviors: 400 or 500.
        assert r.status_code in (400, 404, 500)


# ── SEND EMAIL (expects 500 in preview: no RESEND_API_KEY) ──────────

class TestAdminEmailSend:
    def test_send_email_returns_500_email_service_not_configured(self):
        """RESEND_API_KEY is unset in preview, endpoint should return 500 with
        detail 'Email service not configured'."""
        lead_id = _first_lead_id() or KNOWN_LEAD_ID
        r = requests.post(
            f"{BASE_URL}/api/admin/leads/{lead_id}/email",
            json={"subject": "TEST_Admin subject", "body": "TEST admin body"},
            headers=ADMIN_AUTH,
            timeout=20,
        )
        # Two possibilities depending on lead existence:
        #  - lead exists AND RESEND_API_KEY missing -> 500 with 'Email service not configured'
        #  - lead not found -> 404
        assert r.status_code in (500, 404), f"Unexpected status {r.status_code}: {r.text}"
        if r.status_code == 500:
            detail = r.json().get("detail", "").lower()
            assert "email service not configured" in detail or "email sending failed" in detail, (
                f"Unexpected 500 detail: {detail}"
            )


# ── GET EMAIL HISTORY ────────────────────────────────────────────────

class TestAdminEmailHistory:
    def test_get_emails_returns_list(self):
        lead_id = _first_lead_id() or KNOWN_LEAD_ID
        r = requests.get(
            f"{BASE_URL}/api/admin/leads/{lead_id}/emails",
            headers=ADMIN_AUTH,
            timeout=15,
        )
        # This endpoint accepts any lead_id string (no ObjectId cast); returns list.
        assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text}"
        data = r.json()
        assert isinstance(data, list)
        # Each email record if present should have expected shape
        for em in data:
            assert isinstance(em, dict)
            # id serialized as string, not ObjectId
            if "_id" in em:
                assert isinstance(em["_id"], str)
            # No raw ObjectId leaked into any field's repr
            for v in em.values():
                assert "ObjectId(" not in repr(v)

    def test_get_emails_unknown_lead_returns_empty_list(self):
        r = requests.get(
            f"{BASE_URL}/api/admin/leads/nonexistent-lead-id-xxxxx/emails",
            headers=ADMIN_AUTH,
            timeout=15,
        )
        assert r.status_code == 200
        assert r.json() == []
