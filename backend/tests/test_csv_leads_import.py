"""
Backend tests for CSV Lead Import feature (POST /api/admin/leads/import).

Covers:
  1. Auth: endpoint requires HTTP Basic (admin/euroadria2025).
  2. GET /api/admin/leads returns Facebook Campaign leads (should include 53).
  3. Semicolon-delimited CSV with German columns (E-Mail, Vorname, Nachname, Telefonnummer)
     is auto-detected and imported.
  4. Duplicate emails are skipped on re-import.
  5. Response shape: {imported, skipped, errors, total_rows}.
  6. Fresh import inserts leads with correct `source` label.
  7. Bad file type is rejected (400).

Cleanup:
  All TEST_* emails created during tests are deleted via DELETE /api/admin/leads/{id}.
"""
import os
import io
import uuid
import pytest
import requests
from requests.auth import HTTPBasicAuth

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://roi-calc-preview.preview.emergentagent.com").rstrip("/")
ADMIN_USER = "admin"
ADMIN_PASS = "euroadria2025"


# ── Fixtures ────────────────────────────────────────────────────────────
@pytest.fixture(scope="module")
def auth():
    return HTTPBasicAuth(ADMIN_USER, ADMIN_PASS)


@pytest.fixture(scope="module")
def api():
    s = requests.Session()
    s.auth = HTTPBasicAuth(ADMIN_USER, ADMIN_PASS)
    return s


@pytest.fixture(scope="module")
def fresh_emails():
    """Generate a set of unique TEST_ emails for a fresh import batch."""
    suffix = uuid.uuid4().hex[:8]
    return [
        f"TEST_csvimport_{suffix}_{i}@example.com" for i in range(3)
    ]


@pytest.fixture(scope="module")
def fresh_csv_semicolon(fresh_emails):
    """German CSV with semicolon delimiter (matches Facebook export format)."""
    rows = [
        "E-Mail;Vorname;Nachname;Telefonnummer",
        f"{fresh_emails[0]};Max;Müller;491701234501",
        f"{fresh_emails[1]};Anna;Schäfer;491701234502",
        f"{fresh_emails[2]};Björn;Wagner;491701234503",
    ]
    return "\n".join(rows).encode("utf-8")


@pytest.fixture(scope="module", autouse=True)
def cleanup_after_all(api):
    """After the module runs, delete any TEST_ leads we created."""
    yield
    try:
        r = api.get(f"{BASE_URL}/api/admin/leads", timeout=30)
        if r.ok:
            for lead in r.json():
                email = (lead.get("email") or "").lower()
                if email.startswith("test_csvimport_"):
                    lid = lead.get("_id") or lead.get("lead_id")
                    if lid:
                        api.delete(f"{BASE_URL}/api/admin/leads/{lid}", timeout=15)
    except Exception:
        pass


# ── Sanity / Auth ───────────────────────────────────────────────────────
class TestAuthAndSanity:
    def test_import_requires_auth(self):
        r = requests.post(
            f"{BASE_URL}/api/admin/leads/import",
            files={"file": ("t.csv", b"email\na@b.c\n", "text/csv")},
            data={"source_label": "unauth"},
            timeout=15,
        )
        assert r.status_code == 401, f"Expected 401, got {r.status_code}: {r.text[:200]}"

    def test_admin_leads_get_reachable(self, api):
        r = api.get(f"{BASE_URL}/api/admin/leads", timeout=30)
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ── Facebook Campaign leads present ─────────────────────────────────────
class TestFacebookCampaignLeadsExist:
    def test_facebook_campaign_leads_count(self, api):
        r = api.get(f"{BASE_URL}/api/admin/leads", timeout=30)
        assert r.status_code == 200
        leads = r.json()
        fb = [l for l in leads if (l.get("source") or "") == "Facebook Campaign"]
        # Per review request: 53 leads pre-imported with source='Facebook Campaign'
        assert len(fb) >= 53, (
            f"Expected at least 53 leads with source='Facebook Campaign', found {len(fb)}."
        )

    def test_facebook_lead_shape(self, api):
        r = api.get(f"{BASE_URL}/api/admin/leads", timeout=30)
        fb = [l for l in r.json() if (l.get("source") or "") == "Facebook Campaign"]
        if not fb:
            pytest.skip("no Facebook Campaign leads")
        sample = fb[0]
        assert "email" in sample and sample["email"]
        assert "name" in sample
        # imported flag should be true for CSV-imported leads
        assert sample.get("imported") is True or "import_date" in sample


# ── Fresh CSV import (semicolon, German columns) ────────────────────────
class TestFreshImportSemicolonGermanColumns:
    def test_import_fresh_semicolon_csv(self, api, fresh_csv_semicolon, fresh_emails):
        files = {"file": ("facebook.csv", fresh_csv_semicolon, "text/csv")}
        data = {"source_label": "TEST_FreshImport"}
        r = api.post(f"{BASE_URL}/api/admin/leads/import", files=files, data=data, timeout=30)
        assert r.status_code == 200, f"got {r.status_code}: {r.text[:300]}"
        body = r.json()
        # Response shape assertions
        for key in ("imported", "skipped", "errors", "total_rows"):
            assert key in body, f"missing key {key} in response: {body}"
        assert body["imported"] == 3, f"Expected 3 imported, got {body}"
        assert body["skipped"] == 0
        assert body["total_rows"] == 3

    def test_imported_leads_persisted_with_source_label(self, api, fresh_emails):
        r = api.get(f"{BASE_URL}/api/admin/leads", timeout=30)
        assert r.status_code == 200
        # emails are lower-cased on import
        by_email = {(l.get("email") or "").lower(): l for l in r.json() if l.get("email")}
        for em in fresh_emails:
            assert em.lower() in by_email, f"{em} not found after import"
            lead = by_email[em.lower()]
            assert lead["source"] == "TEST_FreshImport"
            # phone should have '+' prefix (backend prepends if missing)
            assert (lead.get("phone") or "").startswith("+"), f"phone not normalized: {lead.get('phone')}"

    def test_german_name_mapped(self, api, fresh_emails):
        r = api.get(f"{BASE_URL}/api/admin/leads", timeout=30)
        by_email = {(l.get("email") or "").lower(): l for l in r.json() if l.get("email")}
        lead = by_email.get(fresh_emails[0].lower())
        assert lead is not None
        # Vorname + Nachname → combined into name
        assert "Max" in (lead.get("name") or "")
        assert "Müller" in (lead.get("name") or "")


# ── Duplicate detection ─────────────────────────────────────────────────
class TestDuplicateDetection:
    def test_reimport_same_csv_skips_all(self, api, fresh_csv_semicolon):
        # Re-upload the exact same file — every email is already present
        files = {"file": ("facebook.csv", fresh_csv_semicolon, "text/csv")}
        data = {"source_label": "TEST_FreshImport"}
        r = api.post(f"{BASE_URL}/api/admin/leads/import", files=files, data=data, timeout=30)
        assert r.status_code == 200
        body = r.json()
        assert body["imported"] == 0, f"Expected 0 imported on re-upload, got {body}"
        assert body["skipped"] == 3
        assert body["total_rows"] == 3


# ── Bad input handling ──────────────────────────────────────────────────
class TestBadInput:
    def test_non_csv_extension_rejected(self, api):
        files = {"file": ("data.txt", b"email\na@b.c\n", "text/plain")}
        data = {"source_label": "TEST_Bad"}
        r = api.post(f"{BASE_URL}/api/admin/leads/import", files=files, data=data, timeout=15)
        assert r.status_code == 400

    def test_missing_email_column_all_skipped(self, api):
        csv = b"Vorname;Nachname\nMax;Muster\n"
        files = {"file": ("noemail.csv", csv, "text/csv")}
        data = {"source_label": "TEST_NoEmailCol"}
        r = api.post(f"{BASE_URL}/api/admin/leads/import", files=files, data=data, timeout=15)
        assert r.status_code == 200
        body = r.json()
        assert body["imported"] == 0
        assert body["skipped"] >= 1
