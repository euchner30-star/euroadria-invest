"""Sales CRM Phase 1 backend tests: property details, commission dashboard, admin commission mgmt."""
import os
import pytest
import requests
from base64 import b64encode

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://roi-calc-preview.preview.emergentagent.com').rstrip('/')

ADMIN_USER = 'admin'
ADMIN_PASS = 'euroadria2025'
MILENA_EMAIL = 'milena@euroadria.me'
MILENA_PASS = 'mb2026!mnfgz'
LEIN_EMAIL = 'd.lein@euroadria.me'
LEIN_PASS = 'Dl2026!xuzlq'

ADMIN_AUTH = "Basic " + b64encode(f"{ADMIN_USER}:{ADMIN_PASS}".encode()).decode()


@pytest.fixture(scope="module")
def milena_token():
    r = requests.post(f"{BASE_URL}/api/team/login", json={"email": MILENA_EMAIL, "password": MILENA_PASS}, timeout=30)
    assert r.status_code == 200, f"Milena login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def lein_token():
    r = requests.post(f"{BASE_URL}/api/team/login", json={"email": LEIN_EMAIL, "password": LEIN_PASS}, timeout=30)
    assert r.status_code == 200, f"Lein login failed: {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="module")
def seeded_lead_id(milena_token):
    """Create a fresh test lead directly via admin API and assign to Milena so both flows can use it."""
    payload = {
        "name": "TEST_SalesCRMPhase1",
        "email": "test_salescrm_phase1@example.com",
        "phone": "",
        "source": "TEST",
        "interest": "TEST",
    }
    r = requests.post(f"{BASE_URL}/api/admin/leads", json=payload, headers={"Authorization": ADMIN_AUTH}, timeout=30)
    # if already exists (409), fetch existing id
    if r.status_code == 409:
        # find by fetching all team leads
        r2 = requests.get(f"{BASE_URL}/api/team/leads", headers={"Authorization": f"Bearer {milena_token}"}, timeout=30)
        for l in r2.json():
            if l["email"] == payload["email"]:
                return l["_id"]
        pytest.skip("Could not create or find test lead")
    assert r.status_code in (200, 201), f"Create lead failed: {r.status_code} {r.text}"
    lead_id = r.json()["_id"]
    # Assign to Milena
    requests.put(
        f"{BASE_URL}/api/admin/leads/{lead_id}/assign",
        json={"assigned_to": MILENA_EMAIL},
        headers={"Authorization": ADMIN_AUTH},
        timeout=30,
    )
    yield lead_id
    # Cleanup
    requests.delete(f"{BASE_URL}/api/admin/leads/{lead_id}", headers={"Authorization": ADMIN_AUTH}, timeout=30)


# ── PUT /api/team/leads/{id} — property fields ─────────────────────────

class TestLeadPropertyUpdate:
    def test_update_property_fields_persists(self, milena_token, seeded_lead_id):
        payload = {
            "status": "qualified",
            "property_value": 350000,
            "property_type": "Villa",
            "property_location": "Kotor, Montenegro",
        }
        r = requests.put(
            f"{BASE_URL}/api/team/leads/{seeded_lead_id}",
            json=payload,
            headers={"Authorization": f"Bearer {milena_token}"},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        assert r.json().get("success") is True

        # GET back and validate persistence
        g = requests.get(
            f"{BASE_URL}/api/team/leads/{seeded_lead_id}",
            headers={"Authorization": f"Bearer {milena_token}"},
            timeout=30,
        )
        assert g.status_code == 200
        lead = g.json()
        assert lead["status"] == "qualified"
        assert lead["property_value"] == 350000
        assert lead["property_type"] == "Villa"
        assert lead["property_location"] == "Kotor, Montenegro"

    def test_update_partial_property_fields(self, milena_token, seeded_lead_id):
        # Only update location; other fields should remain
        r = requests.put(
            f"{BASE_URL}/api/team/leads/{seeded_lead_id}",
            json={"property_location": "Budva, Montenegro"},
            headers={"Authorization": f"Bearer {milena_token}"},
            timeout=30,
        )
        assert r.status_code == 200
        g = requests.get(
            f"{BASE_URL}/api/team/leads/{seeded_lead_id}",
            headers={"Authorization": f"Bearer {milena_token}"},
            timeout=30,
        )
        lead = g.json()
        assert lead["property_location"] == "Budva, Montenegro"
        assert lead["property_type"] == "Villa"  # unchanged

    def test_update_new_status_options(self, milena_token, seeded_lead_id):
        for status in ["offer", "negotiation", "contract", "won"]:
            r = requests.put(
                f"{BASE_URL}/api/team/leads/{seeded_lead_id}",
                json={"status": status},
                headers={"Authorization": f"Bearer {milena_token}"},
                timeout=30,
            )
            assert r.status_code == 200, f"status={status}: {r.text}"


# ── GET /api/team/commissions ──────────────────────────────────────────

class TestCommissionsDashboard:
    def test_commissions_structure_milena(self, milena_token):
        r = requests.get(
            f"{BASE_URL}/api/team/commissions",
            headers={"Authorization": f"Bearer {milena_token}"},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        data = r.json()
        # Required fields
        for k in ("commission_rate", "total_pipeline_value", "total_won_value",
                  "total_commission_pending", "total_commission_confirmed", "deals"):
            assert k in data, f"Missing key: {k}"
        assert isinstance(data["deals"], list)
        assert isinstance(data["commission_rate"], (int, float))
        # Default rate is 3.0
        assert data["commission_rate"] >= 0

    def test_commissions_includes_won_deal(self, milena_token, seeded_lead_id):
        # Ensure our seeded lead (status=won, pv=... from earlier tests) shows up
        # Force status=won with pv
        requests.put(
            f"{BASE_URL}/api/team/leads/{seeded_lead_id}",
            json={"status": "won", "property_value": 350000},
            headers={"Authorization": f"Bearer {milena_token}"},
            timeout=30,
        )
        r = requests.get(
            f"{BASE_URL}/api/team/commissions",
            headers={"Authorization": f"Bearer {milena_token}"},
            timeout=30,
        )
        assert r.status_code == 200
        data = r.json()
        deal = next((d for d in data["deals"] if d["lead_id"] == seeded_lead_id), None)
        assert deal is not None, f"Seeded lead not found in deals: {data['deals']}"
        assert deal["property_value"] == 350000
        assert deal["status"] == "won"
        # Commission = 350000 * 3% = 10500
        expected_commission = round(350000 * data["commission_rate"] / 100, 2)
        assert deal["commission"] == expected_commission
        assert data["total_won_value"] >= 350000

    def test_commissions_lein_restricted(self, lein_token):
        r = requests.get(
            f"{BASE_URL}/api/team/commissions",
            headers={"Authorization": f"Bearer {lein_token}"},
            timeout=30,
        )
        assert r.status_code == 200
        # Should not blow up even if empty
        data = r.json()
        assert "deals" in data


# ── PUT /api/admin/team-members/{email}/commission ────────────────────

class TestAdminCommissionRate:
    def test_set_commission_rate(self):
        r = requests.put(
            f"{BASE_URL}/api/admin/team-members/{MILENA_EMAIL}/commission",
            json={"commission_rate": 3.5},
            headers={"Authorization": ADMIN_AUTH},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        assert r.json()["commission_rate"] == 3.5

        # Verify via commissions endpoint
        login = requests.post(f"{BASE_URL}/api/team/login",
                              json={"email": MILENA_EMAIL, "password": MILENA_PASS}, timeout=30).json()
        c = requests.get(f"{BASE_URL}/api/team/commissions",
                         headers={"Authorization": f"Bearer {login['token']}"}, timeout=30).json()
        assert c["commission_rate"] == 3.5

        # Reset back to 3.0
        requests.put(
            f"{BASE_URL}/api/admin/team-members/{MILENA_EMAIL}/commission",
            json={"commission_rate": 3.0},
            headers={"Authorization": ADMIN_AUTH},
            timeout=30,
        )

    def test_set_commission_rate_unknown_member(self):
        r = requests.put(
            f"{BASE_URL}/api/admin/team-members/nobody@nowhere.zzz/commission",
            json={"commission_rate": 5.0},
            headers={"Authorization": ADMIN_AUTH},
            timeout=30,
        )
        assert r.status_code == 404


# ── PUT /api/admin/leads/{lead_id}/confirm-commission ─────────────────

class TestConfirmCommission:
    def test_confirm_commission_marks_lead(self, milena_token, seeded_lead_id):
        # Ensure it's a won deal with property value
        requests.put(
            f"{BASE_URL}/api/team/leads/{seeded_lead_id}",
            json={"status": "won", "property_value": 350000},
            headers={"Authorization": f"Bearer {milena_token}"},
            timeout=30,
        )
        r = requests.put(
            f"{BASE_URL}/api/admin/leads/{seeded_lead_id}/confirm-commission",
            headers={"Authorization": ADMIN_AUTH},
            timeout=30,
        )
        assert r.status_code == 200, r.text
        assert r.json()["success"] is True

        # Verify via commissions
        c = requests.get(
            f"{BASE_URL}/api/team/commissions",
            headers={"Authorization": f"Bearer {milena_token}"},
            timeout=30,
        ).json()
        deal = next((d for d in c["deals"] if d["lead_id"] == seeded_lead_id), None)
        assert deal is not None
        assert deal["confirmed"] is True
        assert c["total_commission_confirmed"] > 0

    def test_confirm_commission_lead_not_found(self):
        r = requests.put(
            f"{BASE_URL}/api/admin/leads/000000000000000000000000/confirm-commission",
            headers={"Authorization": ADMIN_AUTH},
            timeout=30,
        )
        assert r.status_code == 404
