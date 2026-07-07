"""
Tests for the double-logo bug fix.
- wrap_email() now accepts include_footer parameter (default True).
- team.py POST /api/team/leads/{lead_id}/email must call wrap_email(include_footer=False).
- SIGNATURE_HTML_TEMPLATE in team.py must contain the full corporate signature block.
- send_contact_email/send_notification_email still use wrap_email w/ default footer.
"""
import os
import sys
import inspect
import requests
import pytest

# Make backend importable
sys.path.insert(0, "/app/backend")

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://roi-calc-preview.preview.emergentagent.com").rstrip("/")
TEAM_EMAIL = "milena@euroadria.me"
TEAM_PASSWORD = "mb2026!mnfgz"


# ── Unit tests: wrap_email include_footer flag ──────────────────────────
class TestWrapEmailFooterFlag:
    def _get_wrap_email(self):
        from emails import wrap_email
        return wrap_email

    def test_wrap_email_signature_has_include_footer_param(self):
        wrap_email = self._get_wrap_email()
        sig = inspect.signature(wrap_email)
        assert "include_footer" in sig.parameters, "wrap_email must accept include_footer kwarg"
        # default must be True
        assert sig.parameters["include_footer"].default is True, "include_footer default must be True"

    def test_wrap_email_default_includes_footer(self):
        wrap_email = self._get_wrap_email()
        html = wrap_email("<p>hello</p>")
        # Footer markers
        assert "Tel.:" in html, "Default wrap_email() should include footer (Tel.:)"
        assert "+382 68 559 776" in html, "Default wrap_email() should include footer phone"
        assert "office@euroadria.me" in html
        assert "Marka Miljanova 12" in html

    def test_wrap_email_include_footer_true_explicit(self):
        wrap_email = self._get_wrap_email()
        html = wrap_email("<p>hello</p>", include_footer=True)
        assert "Tel.:" in html
        assert "+382 68 559 776" in html

    def test_wrap_email_include_footer_false_excludes_footer(self):
        wrap_email = self._get_wrap_email()
        html = wrap_email("<p>hello</p>", include_footer=False)
        # Footer content must be absent
        assert "Tel.:" not in html, "include_footer=False must remove Tel.: line"
        assert "+382 68 559 776" not in html, "include_footer=False must remove phone number"
        assert "Marka Miljanova 12" not in html, "include_footer=False must remove address block"
        assert "EuroAdria Corporate Solutions | euroadria.me" not in html, "dark strip footer must be removed"
        # But the header/logo (top of email) must still be present exactly once
        assert "euroadria-logo.png" in html
        assert html.count("euroadria-logo.png") == 1, (
            f"When footer is disabled, only header logo should remain (count=1). "
            f"Got count={html.count('euroadria-logo.png')}"
        )

    def test_wrap_email_lang_and_tracking(self):
        wrap_email = self._get_wrap_email()
        html_en = wrap_email("body", lang="en", lead_id="abc123", include_footer=False)
        assert "Advisory" in html_en
        assert "/api/t/abc123.png" in html_en
        html_de = wrap_email("body", lang="de", include_footer=True)
        assert "Beratung" in html_de


# ── SIGNATURE_HTML_TEMPLATE content checks ─────────────────────────────
class TestSignatureTemplate:
    def _get_template(self):
        from routes.team import SIGNATURE_HTML_TEMPLATE
        return SIGNATURE_HTML_TEMPLATE

    def test_signature_contains_logo(self):
        tpl = self._get_template()
        assert "euroadria-logo.png" in tpl

    def test_signature_contains_company_name(self):
        tpl = self._get_template()
        assert "EuroAdria Corporate Solutions" in tpl

    def test_signature_contains_website_link(self):
        tpl = self._get_template()
        assert "euroadria.me" in tpl

    def test_signature_contains_montaris_info(self):
        tpl = self._get_template()
        assert "Montaris" in tpl
        assert "Co. d.o.o." in tpl

    def test_signature_contains_novi_sad_address(self):
        tpl = self._get_template()
        assert "Novi Sad" in tpl
        assert "Marka Miljanova 12" in tpl
        assert "21000" in tpl

    def test_signature_contains_reg_numbers(self):
        tpl = self._get_template()
        assert "22147382" in tpl  # Reg no.
        assert "115356237" in tpl  # PIB

    def test_signature_contains_office_podgorica(self):
        tpl = self._get_template()
        assert "PODGORICA" in tpl
        assert "Studentska" in tpl

    def test_signature_contains_office_dusseldorf(self):
        tpl = self._get_template()
        # Template uses HTML entity: D&Uuml;SSELDORF (Podgorica line) and D&uuml;sseldorf
        assert "SSELDORF" in tpl or "sseldorf" in tpl
        assert "Speditionsstra" in tpl
        assert "40221" in tpl


# ── Team email endpoint uses include_footer=False ──────────────────────
class TestSendLeadEmailUsesNoFooter:
    def test_send_lead_email_source_passes_include_footer_false(self):
        """Static source inspection: ensure team.py calls wrap_email with include_footer=False."""
        import routes.team as team_mod
        source = inspect.getsource(team_mod.send_lead_email)
        assert "wrap_email(" in source
        assert "include_footer=False" in source, (
            "send_lead_email must call wrap_email(..., include_footer=False) to avoid double logo"
        )


# ── Other email functions still use default footer ─────────────────────
class TestOtherEmailFunctionsUseFooter:
    def test_send_contact_email_uses_default_footer(self):
        import emails as em
        src = inspect.getsource(em.send_contact_email)
        # Should call wrap_email(content) without include_footer=False
        assert "wrap_email(content" in src
        assert "include_footer=False" not in src, (
            "send_contact_email should NOT pass include_footer=False - it needs full footer"
        )

    def test_send_notification_email_uses_default_footer(self):
        import emails as em
        src = inspect.getsource(em.send_notification_email)
        assert "wrap_email(content" in src
        assert "include_footer=False" not in src, (
            "send_notification_email should NOT pass include_footer=False - it needs full footer"
        )

    def test_followup_email_uses_default_footer(self):
        import emails as em
        src = inspect.getsource(em.followup_email_loop)
        assert "wrap_email(content" in src
        assert "include_footer=False" not in src


# ── Integration: hit the actual endpoint via HTTP ──────────────────────
class TestSendLeadEmailEndpoint:
    @pytest.fixture(scope="class")
    def token(self):
        resp = requests.post(
            f"{BASE_URL}/api/team/login",
            json={"email": TEAM_EMAIL, "password": TEAM_PASSWORD},
            timeout=15,
        )
        if resp.status_code != 200:
            pytest.skip(f"Team login failed: {resp.status_code} {resp.text}")
        return resp.json()["token"]

    @pytest.fixture(scope="class")
    def any_lead_id(self, token):
        resp = requests.get(
            f"{BASE_URL}/api/team/leads",
            headers={"Authorization": f"Bearer {token}"},
            timeout=15,
        )
        if resp.status_code != 200:
            pytest.skip(f"Cannot fetch leads: {resp.status_code}")
        leads = resp.json()
        if not leads:
            pytest.skip("No leads available for send-email endpoint test")
        # Prefer leads that have an email
        for lead in leads:
            if lead.get("email"):
                return lead["_id"]
        return leads[0]["_id"]

    def test_unauthorized_without_token(self):
        # Use any 24-char hex placeholder to satisfy route; auth check happens first
        placeholder = "0" * 24
        resp = requests.post(
            f"{BASE_URL}/api/team/leads/{placeholder}/email",
            json={"subject": "x", "body": "y"},
            timeout=15,
        )
        assert resp.status_code in (401, 403), f"Expected 401/403, got {resp.status_code}"

    def test_send_email_endpoint_returns_500_no_python_error(self, token, any_lead_id):
        """RESEND_API_KEY not configured in preview -> endpoint should return 500
        with graceful HTTPException detail (NOT a python ImportError/TypeError)."""
        resp = requests.post(
            f"{BASE_URL}/api/team/leads/{any_lead_id}/email",
            headers={"Authorization": f"Bearer {token}"},
            json={"subject": "TEST_footer_fix", "body": "hello", "signature": "-Milena"},
            timeout=20,
        )
        # Acceptable: 500 (missing key) OR 200 (if resend actually configured) OR 400 (lead has no email)
        assert resp.status_code in (200, 400, 500), f"Unexpected status: {resp.status_code} {resp.text}"
        # It should return JSON with a 'detail' key, not a python traceback
        try:
            data = resp.json()
        except Exception:
            pytest.fail(f"Endpoint returned non-JSON body: {resp.text[:400]}")
        if resp.status_code == 500:
            detail = str(data.get("detail", "")).lower()
            # Should be the graceful "not configured" or a resend send failure message,
            # NOT a Python ImportError / NameError / TypeError
            forbidden = ["importerror", "nameerror", "typeerror", "attributeerror", "traceback"]
            for bad in forbidden:
                assert bad not in detail, f"Endpoint raised Python error: {detail}"
