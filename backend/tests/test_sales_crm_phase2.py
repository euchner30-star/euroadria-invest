"""Sales CRM Phase 2 backend tests.

Covers:
- Team CRUD:      POST/PUT/DELETE /api/admin/team-members, GET returns assigned_leads/won_deals
- Commissions:    GET  /api/admin/commissions returns flat list across all members
- Confirm:        PUT  /api/admin/leads/{id}/confirm-commission
- Commission rate persisted per team member
"""

import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
AUTH = ("admin", "euroadria2025")
TEST_EMAIL = f"test_phase2_{int(time.time())}@example.com"
TEST_LEAD_EMAIL = f"test_phase2_lead_{int(time.time())}@example.com"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.auth = AUTH
    s.headers.update({"Content-Type": "application/json"})
    yield s
    # cleanup
    try:
        s.delete(f"{BASE_URL}/api/admin/team-members/{TEST_EMAIL}")
    except Exception:
        pass


@pytest.fixture(scope="module")
def created_lead_id(session):
    """Create a manual lead for commission testing."""
    r = session.post(
        f"{BASE_URL}/api/admin/leads",
        json={"name": "TEST_Phase2 Lead", "email": TEST_LEAD_EMAIL, "source": "TestPhase2"},
    )
    assert r.status_code in (200, 201), r.text
    lead = r.json()
    lead_id = lead.get("_id") or lead.get("lead_id")
    yield lead_id
    # cleanup
    try:
        session.delete(f"{BASE_URL}/api/admin/leads/{lead_id}")
    except Exception:
        pass


# ── Team CRUD ─────────────────────────────────────────────────────────


class TestTeamCRUD:
    def test_create_team_member(self, session):
        r = session.post(
            f"{BASE_URL}/api/admin/team-members",
            json={
                "email": TEST_EMAIL,
                "name": "TEST Phase2 Member",
                "password": "TestPass2026!",
                "role": "restricted",
                "commission_rate": 3.5,
            },
        )
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("success") is True
        assert data.get("email") == TEST_EMAIL

    def test_create_duplicate_returns_409(self, session):
        r = session.post(
            f"{BASE_URL}/api/admin/team-members",
            json={
                "email": TEST_EMAIL,
                "name": "Duplicate",
                "password": "x",
                "role": "member",
            },
        )
        assert r.status_code == 409, r.text

    def test_list_team_members_includes_stats(self, session):
        r = session.get(f"{BASE_URL}/api/admin/team-members")
        assert r.status_code == 200
        members = r.json()
        assert isinstance(members, list)
        # Password must NOT be returned
        for m in members:
            assert "password" not in m
            assert "assigned_leads" in m
            assert "won_deals" in m
            assert isinstance(m["assigned_leads"], int)
            assert isinstance(m["won_deals"], int)
        found = next((m for m in members if m["email"] == TEST_EMAIL), None)
        assert found is not None
        assert found["name"] == "TEST Phase2 Member"
        assert found["role"] == "restricted"
        assert found["commission_rate"] == 3.5

    def test_update_team_member(self, session):
        r = session.put(
            f"{BASE_URL}/api/admin/team-members/{TEST_EMAIL}",
            json={"name": "TEST Phase2 Updated", "role": "member", "commission_rate": 4.2},
        )
        assert r.status_code == 200, r.text

        # verify persistence
        r2 = session.get(f"{BASE_URL}/api/admin/team-members")
        found = next((m for m in r2.json() if m["email"] == TEST_EMAIL), None)
        assert found is not None
        assert found["name"] == "TEST Phase2 Updated"
        assert found["role"] == "member"
        assert found["commission_rate"] == 4.2

    def test_update_unknown_member_returns_404(self, session):
        r = session.put(
            f"{BASE_URL}/api/admin/team-members/nonexistent_TEST@example.com",
            json={"name": "X"},
        )
        assert r.status_code == 404

    def test_set_commission_rate_endpoint(self, session):
        r = session.put(
            f"{BASE_URL}/api/admin/team-members/{TEST_EMAIL}/commission",
            json={"commission_rate": 5.5},
        )
        assert r.status_code == 200
        assert r.json().get("commission_rate") == 5.5

    def test_delete_team_member(self, session):
        # Create a separate throwaway member for delete
        temp_email = f"test_del_{int(time.time())}@example.com"
        c = session.post(
            f"{BASE_URL}/api/admin/team-members",
            json={"email": temp_email, "name": "Del", "password": "x"},
        )
        assert c.status_code == 200
        d = session.delete(f"{BASE_URL}/api/admin/team-members/{temp_email}")
        assert d.status_code == 200
        # verify gone
        r2 = session.get(f"{BASE_URL}/api/admin/team-members")
        assert not any(m["email"] == temp_email for m in r2.json())

    def test_delete_unknown_member_returns_404(self, session):
        r = session.delete(f"{BASE_URL}/api/admin/team-members/nonexistent_TEST@example.com")
        assert r.status_code == 404


# ── Commissions & Confirm ─────────────────────────────────────────────


class TestCommissions:
    def test_get_commissions_returns_list(self, session):
        r = session.get(f"{BASE_URL}/api/admin/commissions")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)

    def test_confirm_commission_full_flow(self, session, created_lead_id):
        # Assign lead to milena (existing member)
        r = session.put(
            f"{BASE_URL}/api/admin/leads/{created_lead_id}/assign",
            json={"assigned_to": "milena@euroadria.me"},
        )
        assert r.status_code == 200

        # Set property_value, commission_amount and status=won via team endpoint.
        # Team API uses JWT bearer via /api/team/login
        login = requests.post(
            f"{BASE_URL}/api/team/login",
            json={"email": "milena@euroadria.me", "password": "mb2026!mnfgz"},
        )
        assert login.status_code == 200, login.text
        token = login.json().get("access_token") or login.json().get("token")
        assert token, login.text
        upd = requests.put(
            f"{BASE_URL}/api/team/leads/{created_lead_id}",
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
            json={
                "status": "won",
                "property_value": 300000,
                "commission_amount": 9000,
                "property_type": "Apartment",
                "property_location": "Budva",
            },
        )
        assert upd.status_code == 200, upd.text

        # Verify appears in /admin/commissions
        r2 = session.get(f"{BASE_URL}/api/admin/commissions")
        assert r2.status_code == 200
        commissions = r2.json()
        my = [c for c in commissions if c.get("lead_email") == TEST_LEAD_EMAIL]
        assert len(my) == 1, f"commission not found: {commissions}"
        entry = my[0]
        assert entry["commission_amount"] == 9000
        assert entry["property_value"] == 300000
        assert entry["status"] == "won"
        assert entry["confirmed"] is False
        # BUG check: lead_id should be returned so frontend can call confirm
        assert "lead_id" in entry, (
            "BUG: /api/admin/commissions response does not include 'lead_id'. "
            "Frontend Confirm button will fail because it calls confirm-commission with c.lead_id."
        )

        # Confirm the commission
        conf = session.put(
            f"{BASE_URL}/api/admin/leads/{created_lead_id}/confirm-commission"
        )
        assert conf.status_code == 200
        assert conf.json().get("success") is True

        # Verify confirmed=True in commissions
        r3 = session.get(f"{BASE_URL}/api/admin/commissions")
        my2 = [c for c in r3.json() if c.get("lead_email") == TEST_LEAD_EMAIL]
        assert my2 and my2[0]["confirmed"] is True

    def test_confirm_commission_unknown_lead_returns_404(self, session):
        # 24-hex non-existent ObjectId
        r = session.put(f"{BASE_URL}/api/admin/leads/000000000000000000000000/confirm-commission")
        assert r.status_code == 404


# ── Auth ─────────────────────────────────────────────────────────────


class TestAuth:
    def test_team_members_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/admin/team-members")
        assert r.status_code == 401

    def test_commissions_requires_auth(self):
        r = requests.get(f"{BASE_URL}/api/admin/commissions")
        assert r.status_code == 401
