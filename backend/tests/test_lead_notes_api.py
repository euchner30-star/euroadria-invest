"""Tests for the Lead Detail + Notes admin API.

Endpoints under test:
    GET  /api/admin/leads/{lead_id}           -> lead detail incl. notes[]
    POST /api/admin/leads/{lead_id}/notes     -> add admin note (author='Admin (Holger)')
    DELETE /api/admin/leads/{lead_id}         -> delete lead (used in the UI row action)
    GET  /api/admin/leads                     -> list of leads (used to source lead_id)
"""

import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://roi-calc-preview.preview.emergentagent.com").rstrip("/")
ADMIN_USER = "admin"
ADMIN_PASS = "euroadria2025"
AUTH = (ADMIN_USER, ADMIN_PASS)


# ── Helpers ──────────────────────────────────────────────────────────────
def _api(path: str) -> str:
    return f"{BASE_URL}{path}"


@pytest.fixture(scope="module")
def any_lead_id():
    """Fetch existing leads and return the first lead_id (from _id)."""
    r = requests.get(_api("/api/admin/leads"), auth=AUTH, timeout=30)
    assert r.status_code == 200, f"GET /api/admin/leads failed: {r.status_code} {r.text[:200]}"
    leads = r.json()
    assert isinstance(leads, list) and len(leads) > 0, "No leads found in DB to test against"
    # Try known ID first, else fallback to any lead in the list
    known = "6a3c02362410b0fd1dd810e0"
    for lead in leads:
        lid = lead.get("_id") or lead.get("lead_id") or lead.get("id")
        if lid == known:
            return known
    lid = leads[0].get("_id") or leads[0].get("lead_id") or leads[0].get("id")
    assert lid, "Lead in list has no id field"
    return lid


# ── Auth ─────────────────────────────────────────────────────────────────
class TestAdminAuth:
    def test_admin_leads_requires_auth(self):
        r = requests.get(_api("/api/admin/leads"), timeout=15)
        assert r.status_code == 401

    def test_lead_detail_requires_auth(self, any_lead_id):
        r = requests.get(_api(f"/api/admin/leads/{any_lead_id}"), timeout=15)
        assert r.status_code == 401


# ── Lead Detail ──────────────────────────────────────────────────────────
class TestLeadDetail:
    def test_get_lead_detail_returns_notes_array(self, any_lead_id):
        r = requests.get(_api(f"/api/admin/leads/{any_lead_id}"), auth=AUTH, timeout=30)
        assert r.status_code == 200, r.text[:300]
        data = r.json()
        # Basic shape
        assert data.get("_id") == any_lead_id
        assert "notes" in data, "Response must include notes array"
        assert isinstance(data["notes"], list)
        # Notes must have _id serialized as string (no ObjectId leaks)
        for n in data["notes"]:
            assert isinstance(n.get("_id"), str)

    def test_get_lead_detail_bad_id(self):
        r = requests.get(_api("/api/admin/leads/not-a-valid-objectid"), auth=AUTH, timeout=15)
        # Route catches invalid ObjectId and returns 400
        assert r.status_code in (400, 404), r.text[:300]

    def test_get_lead_detail_nonexistent(self):
        # Valid ObjectId format but not present
        fake_id = "0" * 24
        r = requests.get(_api(f"/api/admin/leads/{fake_id}"), auth=AUTH, timeout=15)
        # 404 (not found) or 400 (bson error) both acceptable
        assert r.status_code in (400, 404)


# ── Notes Create ─────────────────────────────────────────────────────────
class TestAddNote:
    def test_create_note_appears_in_detail(self, any_lead_id):
        unique_text = f"TEST_note_{uuid.uuid4().hex[:8]}"
        payload = {"text": unique_text}
        r = requests.post(
            _api(f"/api/admin/leads/{any_lead_id}/notes"),
            json=payload, auth=AUTH, timeout=30
        )
        assert r.status_code in (200, 201), r.text[:300]
        note = r.json()
        # Field assertions
        assert note.get("text") == unique_text
        assert note.get("author") == "Admin (Holger)"
        assert note.get("lead_id") == any_lead_id
        assert isinstance(note.get("_id"), str)
        assert note.get("created_at"), "created_at missing"

        # Verify persistence via detail endpoint
        time.sleep(0.3)
        d = requests.get(_api(f"/api/admin/leads/{any_lead_id}"), auth=AUTH, timeout=30)
        assert d.status_code == 200
        detail = d.json()
        found = [n for n in detail.get("notes", []) if n.get("text") == unique_text]
        assert found, "Newly created note not returned in lead detail notes[]"
        assert found[0].get("author") == "Admin (Holger)"

    def test_create_note_on_nonexistent_lead(self):
        fake_id = "0" * 24
        r = requests.post(
            _api(f"/api/admin/leads/{fake_id}/notes"),
            json={"text": "TEST_should_fail"}, auth=AUTH, timeout=15
        )
        assert r.status_code in (400, 404)


# ── Leads List ───────────────────────────────────────────────────────────
class TestLeadsList:
    def test_admin_leads_list(self):
        r = requests.get(_api("/api/admin/leads"), auth=AUTH, timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_analytics_overview_has_recent_leads_with_lead_id(self):
        r = requests.get(_api("/api/admin/analytics/overview?days=365"), auth=AUTH, timeout=30)
        assert r.status_code == 200
        data = r.json()
        assert "recent_leads" in data
        for lead in data["recent_leads"]:
            # Frontend depends on lead.lead_id for row click / delete
            assert "lead_id" in lead, "recent_leads item must contain lead_id (string form of _id)"
            assert isinstance(lead["lead_id"], str)
