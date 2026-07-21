"""Tests for /api/locations CRUD and /properties visibility."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://roi-calc-preview.preview.emergentagent.com").rstrip("/")
ADMIN_AUTH = ("admin", "euroadria2025")

TEST_PREFIX = "TEST_LOC_"


@pytest.fixture(scope="module")
def cleanup_test_locations():
    yield
    # cleanup after tests
    r = requests.get(f"{BASE_URL}/api/admin/locations", auth=ADMIN_AUTH, timeout=10)
    if r.ok:
        for loc in r.json():
            if loc["name"].startswith(TEST_PREFIX):
                requests.delete(f"{BASE_URL}/api/admin/locations/{loc['_id']}", auth=ADMIN_AUTH, timeout=10)


# ── Public GET /api/locations ───────────────────────────────────────────

def test_get_locations_public_returns_list():
    r = requests.get(f"{BASE_URL}/api/locations", timeout=10)
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data, list)
    # seeded 18 locations
    assert len(data) >= 1
    # Validate shape
    first = data[0]
    assert "_id" in first
    assert "name" in first
    assert isinstance(first["_id"], str)


def test_get_locations_sorted_by_name():
    r = requests.get(f"{BASE_URL}/api/locations", timeout=10)
    assert r.status_code == 200
    names = [l["name"] for l in r.json()]
    assert names == sorted(names, key=str.lower) or names == sorted(names)


# ── Admin GET /api/admin/locations ──────────────────────────────────────

def test_admin_get_locations_requires_auth():
    r = requests.get(f"{BASE_URL}/api/admin/locations", timeout=10)
    assert r.status_code == 401


def test_admin_get_locations_success():
    r = requests.get(f"{BASE_URL}/api/admin/locations", auth=ADMIN_AUTH, timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1


# ── POST /api/admin/locations ───────────────────────────────────────────

def test_admin_add_location_requires_auth():
    r = requests.post(f"{BASE_URL}/api/admin/locations", data={"name": "SomeNew"}, timeout=10)
    assert r.status_code == 401


def test_admin_add_location_success_and_persistence(cleanup_test_locations):
    unique_name = f"{TEST_PREFIX}CityA"
    r = requests.post(
        f"{BASE_URL}/api/admin/locations",
        auth=ADMIN_AUTH,
        data={"name": unique_name},
        timeout=10,
    )
    assert r.status_code == 200, r.text
    data = r.json()
    assert data["success"] is True
    assert data["name"] == unique_name
    assert "_id" in data
    loc_id = data["_id"]

    # Verify listed in GET /api/locations
    r2 = requests.get(f"{BASE_URL}/api/locations", timeout=10)
    assert r2.status_code == 200
    names = [l["name"] for l in r2.json()]
    assert unique_name in names


def test_admin_add_location_duplicate_returns_409(cleanup_test_locations):
    unique_name = f"{TEST_PREFIX}DupCity"
    r1 = requests.post(f"{BASE_URL}/api/admin/locations", auth=ADMIN_AUTH, data={"name": unique_name}, timeout=10)
    assert r1.status_code == 200
    r2 = requests.post(f"{BASE_URL}/api/admin/locations", auth=ADMIN_AUTH, data={"name": unique_name}, timeout=10)
    assert r2.status_code == 409, r2.text


# ── DELETE /api/admin/locations/{id} ────────────────────────────────────

def test_admin_delete_location_requires_auth():
    r = requests.delete(f"{BASE_URL}/api/admin/locations/000000000000000000000000", timeout=10)
    assert r.status_code == 401


def test_admin_delete_location_success_and_removal(cleanup_test_locations):
    unique_name = f"{TEST_PREFIX}DelCity"
    # Create
    r1 = requests.post(f"{BASE_URL}/api/admin/locations", auth=ADMIN_AUTH, data={"name": unique_name}, timeout=10)
    assert r1.status_code == 200
    loc_id = r1.json()["_id"]

    # Delete
    r2 = requests.delete(f"{BASE_URL}/api/admin/locations/{loc_id}", auth=ADMIN_AUTH, timeout=10)
    assert r2.status_code == 200
    assert r2.json()["success"] is True

    # Verify not in listing
    r3 = requests.get(f"{BASE_URL}/api/locations", timeout=10)
    names = [l["name"] for l in r3.json()]
    assert unique_name not in names


# ── /properties page accessibility (proxy via GET /api/properties) ─────

def test_properties_endpoint_returns_list():
    r = requests.get(f"{BASE_URL}/api/properties", timeout=10)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)


def test_properties_page_route_html_accessible():
    r = requests.get(f"{BASE_URL}/properties", timeout=15)
    # SPA - should return HTML 200
    assert r.status_code == 200
    assert "text/html" in r.headers.get("content-type", "").lower()
