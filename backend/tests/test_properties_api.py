"""Comprehensive tests for /api/properties endpoints (public + admin CRUD, images, PDF, inquiry)."""
import os
import io
import pytest
import requests
from requests.auth import HTTPBasicAuth

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://roi-calc-preview.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_AUTH = HTTPBasicAuth("admin", "euroadria2025")


# 1x1 pixel PNG
PNG_BYTES = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4"
    "890000000d49444154789c6300010000000500010d0a2db40000000049454e44ae426082"
)
# minimal PDF
PDF_BYTES = b"%PDF-1.4\n1 0 obj<< /Type /Catalog /Pages 2 0 R >>endobj\n2 0 obj<< /Type /Pages /Count 0 /Kids [] >>endobj\ntrailer<< /Root 1 0 R >>\n%%EOF"


@pytest.fixture(scope="module")
def created_property_id():
    """Create a TEST_ property and return its _id. Cleanup after all tests run."""
    resp = requests.post(
        f"{API}/admin/properties",
        auth=ADMIN_AUTH,
        data={
            "title": "TEST_Sea View Villa",
            "description": "Testing property for automated tests",
            "price": 250000,
            "area_sqm": 120,
            "rooms": 3,
            "bathrooms": 2,
            "property_type": "Villa",
            "location": "Budva",
            "address": "Test Street 1",
            "features": "Sea View,Pool,Parking",
            "status": "available",
            "published": "true",
        },
    )
    assert resp.status_code == 200, f"Create failed: {resp.status_code} {resp.text}"
    body = resp.json()
    assert "_id" in body
    pid = body["_id"]
    yield pid
    # cleanup
    requests.delete(f"{API}/admin/properties/{pid}", auth=ADMIN_AUTH)


# ── Admin CRUD ──────────────────────────────────────────────────────────

class TestAdminCRUD:
    def test_create_property_returns_id_and_fields(self):
        resp = requests.post(
            f"{API}/admin/properties",
            auth=ADMIN_AUTH,
            data={
                "title": "TEST_CRUD Apartment",
                "price": 100000,
                "area_sqm": 60,
                "rooms": 2,
                "property_type": "Apartment",
                "location": "Podgorica",
                "features": "Balcony,Parking",
                "published": "true",
            },
        )
        assert resp.status_code == 200
        b = resp.json()
        assert b["_id"] and isinstance(b["_id"], str)
        assert b["title"] == "TEST_CRUD Apartment"
        assert b["price"] == 100000
        assert b["property_type"] == "Apartment"
        assert b["features"] == ["Balcony", "Parking"]
        assert b["currency"] == "EUR"

        # cleanup
        requests.delete(f"{API}/admin/properties/{b['_id']}", auth=ADMIN_AUTH)

    def test_create_requires_admin_auth(self):
        r = requests.post(f"{API}/admin/properties", data={"title": "TEST_no_auth"})
        assert r.status_code in (401, 403)

    def test_update_and_persistence(self, created_property_id):
        r = requests.put(
            f"{API}/admin/properties/{created_property_id}",
            auth=ADMIN_AUTH,
            data={"title": "TEST_Sea View Villa Updated", "price": 260000, "status": "reserved"},
        )
        assert r.status_code == 200
        # GET back
        g = requests.get(f"{API}/properties/{created_property_id}")
        assert g.status_code == 200
        j = g.json()
        assert j["title"] == "TEST_Sea View Villa Updated"
        assert j["price"] == 260000
        assert j["status"] == "reserved"

        # Reset for downstream tests (status must be available for public GET list)
        requests.put(
            f"{API}/admin/properties/{created_property_id}",
            auth=ADMIN_AUTH,
            data={"status": "available", "title": "TEST_Sea View Villa"},
        )

    def test_update_empty_returns_400(self, created_property_id):
        r = requests.put(
            f"{API}/admin/properties/{created_property_id}",
            auth=ADMIN_AUTH,
            data={},
        )
        assert r.status_code == 400

    def test_admin_list_includes_property(self, created_property_id):
        r = requests.get(f"{API}/admin/properties", auth=ADMIN_AUTH)
        assert r.status_code == 200
        ids = [p["_id"] for p in r.json()]
        assert created_property_id in ids

    def test_delete_property_removes_it(self):
        # Create + delete
        c = requests.post(
            f"{API}/admin/properties",
            auth=ADMIN_AUTH,
            data={"title": "TEST_ToDelete", "price": 1, "property_type": "Land", "location": "Bar"},
        )
        pid = c.json()["_id"]
        d = requests.delete(f"{API}/admin/properties/{pid}", auth=ADMIN_AUTH)
        assert d.status_code == 200
        # verify 404 after delete
        g = requests.get(f"{API}/properties/{pid}")
        assert g.status_code == 404


# ── Public listing ──────────────────────────────────────────────────────

class TestPublicListing:
    def test_list_returns_published_only(self, created_property_id):
        r = requests.get(f"{API}/properties")
        assert r.status_code == 200
        arr = r.json()
        assert isinstance(arr, list)
        for p in arr:
            assert p.get("published") is True

    def test_filter_by_location(self, created_property_id):
        r = requests.get(f"{API}/properties", params={"location": "Budva"})
        assert r.status_code == 200
        for p in r.json():
            assert "budva" in p["location"].lower()

    def test_filter_by_property_type(self, created_property_id):
        r = requests.get(f"{API}/properties", params={"property_type": "Villa"})
        assert r.status_code == 200
        for p in r.json():
            assert p["property_type"] == "Villa"

    def test_filter_price_range(self, created_property_id):
        r = requests.get(f"{API}/properties", params={"min_price": 100000, "max_price": 500000})
        assert r.status_code == 200
        for p in r.json():
            assert 100000 <= p["price"] <= 500000

    def test_get_by_id(self, created_property_id):
        r = requests.get(f"{API}/properties/{created_property_id}")
        assert r.status_code == 200
        d = r.json()
        assert d["_id"] == created_property_id

    def test_get_nonexistent_returns_404(self):
        r = requests.get(f"{API}/properties/507f1f77bcf86cd799439011")
        assert r.status_code == 404


# ── Image upload / serve ────────────────────────────────────────────────

class TestImageFlow:
    def test_upload_image_and_serve(self, created_property_id):
        r = requests.post(
            f"{API}/admin/properties/{created_property_id}/images",
            auth=ADMIN_AUTH,
            files=[("files", ("test.png", io.BytesIO(PNG_BYTES), "image/png"))],
        )
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["success"] is True
        assert len(body["image_ids"]) >= 1
        img_id = body["image_ids"][-1]

        # Serve image back
        s = requests.get(f"{API}/properties/img/{img_id}")
        assert s.status_code == 200
        assert s.headers["content-type"].startswith("image/")
        assert len(s.content) == len(PNG_BYTES)

        # Verify cover_image set on first upload
        g = requests.get(f"{API}/properties/{created_property_id}")
        assert g.json().get("cover_image") is not None
        assert img_id in g.json().get("images", [])

    def test_serve_nonexistent_image_returns_404(self):
        r = requests.get(f"{API}/properties/img/507f1f77bcf86cd799439011")
        assert r.status_code == 404


# ── PDF upload / serve ──────────────────────────────────────────────────

class TestPDFFlow:
    def test_upload_pdf_and_serve(self, created_property_id):
        r = requests.post(
            f"{API}/admin/properties/{created_property_id}/pdf",
            auth=ADMIN_AUTH,
            files={"file": ("expose.pdf", io.BytesIO(PDF_BYTES), "application/pdf")},
        )
        assert r.status_code == 200, r.text
        assert r.json()["success"] is True
        assert r.json()["pdf_id"]

        # Fetch it
        g = requests.get(f"{API}/properties/pdf/{created_property_id}")
        assert g.status_code == 200
        assert g.headers["content-type"] == "application/pdf"
        assert g.content.startswith(b"%PDF-")


# ── Inquiry → Lead ──────────────────────────────────────────────────────

class TestInquiry:
    def test_inquiry_creates_lead(self, created_property_id):
        unique_email = f"test_inquiry_{created_property_id[:6]}@example.com"
        r = requests.post(
            f"{API}/properties/{created_property_id}/inquiry",
            data={
                "name": "TEST_Inquiry User",
                "email": unique_email,
                "phone": "+491234567890",
                "message": "I am interested in this property",
            },
        )
        assert r.status_code == 200, r.text
        assert r.json()["success"] is True

        # Verify lead was created via admin leads list
        leads = requests.get(f"{API}/admin/leads", auth=ADMIN_AUTH)
        assert leads.status_code == 200
        emails = [ln.get("email") for ln in leads.json()]
        assert unique_email in emails

    def test_inquiry_on_missing_property_404(self):
        r = requests.post(
            f"{API}/properties/507f1f77bcf86cd799439011/inquiry",
            data={"name": "X", "email": "x@x.com"},
        )
        assert r.status_code == 404
