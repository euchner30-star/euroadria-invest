import pytest
import requests
import uuid
from conftest import BASE_URL, ADMIN_USERNAME, ADMIN_PASSWORD
import base64

# Test data
TEST_REGION_SLUG = "podgorica"
TEST_REGION_DATA = {
    "slug": "podgorica",
    "title": "TEST_Podgorica Investment Region",
    "subtitle": "Hauptstadt & Business-Hub",
    "investmentScore": 90,
    "priceRange": "€1.500-3.000/m²",
    "potential": "+35-55%",
    "timeHorizon": "2-5 Jahre",
    "content": "<p>Test content for Podgorica region</p>",
    "bulletPoints": [{"text": "Internationaler Flughafen"}, {"text": "KCCG Klinisches Zentrum"}],
    "imageUrls": [],
    "apartments": []
}

def get_auth_headers():
    credentials = base64.b64encode(f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}".encode()).decode()
    return {"Authorization": f"Basic {credentials}", "Content-Type": "application/json"}


class TestRegionsPublicAPI:
    """Test public regions API endpoints"""

    def test_get_all_regions_returns_list(self):
        """GET /api/regions should return list of regions"""
        response = requests.get(f"{BASE_URL}/api/regions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_get_region_by_slug_not_found(self):
        """GET /api/regions/{slug} should return 404 for non-existent region"""
        response = requests.get(f"{BASE_URL}/api/regions/nonexistent-region-{uuid.uuid4()}")
        assert response.status_code == 404


class TestRegionsAdminAPI:
    """Test admin regions API endpoints"""

    def test_admin_get_regions_unauthorized(self):
        """GET /api/admin/regions without auth should return 401"""
        response = requests.get(f"{BASE_URL}/api/admin/regions")
        assert response.status_code == 401

    def test_admin_get_regions_authorized(self):
        """GET /api/admin/regions with auth should return list"""
        response = requests.get(f"{BASE_URL}/api/admin/regions", headers=get_auth_headers())
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_admin_create_region(self):
        """POST /api/admin/regions should create a new region"""
        # First delete if exists
        requests.delete(f"{BASE_URL}/api/admin/regions/{TEST_REGION_SLUG}", headers=get_auth_headers())
        
        # Create new region
        response = requests.post(
            f"{BASE_URL}/api/admin/regions",
            headers=get_auth_headers(),
            json=TEST_REGION_DATA
        )
        assert response.status_code == 200
        data = response.json()
        assert data["slug"] == TEST_REGION_SLUG
        assert data["title"] == TEST_REGION_DATA["title"]
        assert data["investmentScore"] == 90
        assert "id" in data
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/regions/{TEST_REGION_SLUG}", headers=get_auth_headers())

    def test_admin_create_region_duplicate_slug_fails(self):
        """POST /api/admin/regions with duplicate slug should return 400"""
        # First delete if exists and create
        requests.delete(f"{BASE_URL}/api/admin/regions/{TEST_REGION_SLUG}", headers=get_auth_headers())
        requests.post(f"{BASE_URL}/api/admin/regions", headers=get_auth_headers(), json=TEST_REGION_DATA)
        
        # Try to create again with same slug
        response = requests.post(
            f"{BASE_URL}/api/admin/regions",
            headers=get_auth_headers(),
            json=TEST_REGION_DATA
        )
        assert response.status_code == 400
        assert "already exists" in response.json().get("detail", "")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/regions/{TEST_REGION_SLUG}", headers=get_auth_headers())

    def test_admin_update_region(self):
        """PUT /api/admin/regions/{slug} should update region"""
        # Create region first
        requests.delete(f"{BASE_URL}/api/admin/regions/{TEST_REGION_SLUG}", headers=get_auth_headers())
        requests.post(f"{BASE_URL}/api/admin/regions", headers=get_auth_headers(), json=TEST_REGION_DATA)
        
        # Update
        update_data = {"investmentScore": 95, "title": "TEST_Updated Podgorica Title"}
        response = requests.put(
            f"{BASE_URL}/api/admin/regions/{TEST_REGION_SLUG}",
            headers=get_auth_headers(),
            json=update_data
        )
        assert response.status_code == 200
        data = response.json()
        assert data["investmentScore"] == 95
        assert data["title"] == "TEST_Updated Podgorica Title"
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/regions/{TEST_REGION_SLUG}", headers=get_auth_headers())

    def test_admin_delete_region(self):
        """DELETE /api/admin/regions/{slug} should delete region"""
        # Create region first
        requests.delete(f"{BASE_URL}/api/admin/regions/{TEST_REGION_SLUG}", headers=get_auth_headers())
        requests.post(f"{BASE_URL}/api/admin/regions", headers=get_auth_headers(), json=TEST_REGION_DATA)
        
        # Delete
        response = requests.delete(
            f"{BASE_URL}/api/admin/regions/{TEST_REGION_SLUG}",
            headers=get_auth_headers()
        )
        assert response.status_code == 200
        assert response.json()["slug"] == TEST_REGION_SLUG
        
        # Verify deleted
        verify_response = requests.get(f"{BASE_URL}/api/regions/{TEST_REGION_SLUG}")
        assert verify_response.status_code == 404

    def test_admin_delete_region_not_found(self):
        """DELETE /api/admin/regions/{slug} for non-existent region should return 404"""
        response = requests.delete(
            f"{BASE_URL}/api/admin/regions/nonexistent-{uuid.uuid4()}",
            headers=get_auth_headers()
        )
        assert response.status_code == 404


class TestRegionApartmentsAPI:
    """Test region apartments API endpoints"""

    def test_admin_add_apartment_to_region(self):
        """POST /api/admin/regions/{slug}/apartments should add apartment"""
        # Create region first
        requests.delete(f"{BASE_URL}/api/admin/regions/{TEST_REGION_SLUG}", headers=get_auth_headers())
        requests.post(f"{BASE_URL}/api/admin/regions", headers=get_auth_headers(), json=TEST_REGION_DATA)
        
        # Add apartment
        apartment_data = {
            "title": "TEST_Luxury Apartment Podgorica",
            "description": "Beautiful apartment in city center",
            "price": "€150,000",
            "size": "75m²",
            "imageUrl": "https://example.com/image.jpg",
            "features": ["Balcony", "Parking"],
            "isAvailable": True
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/regions/{TEST_REGION_SLUG}/apartments",
            headers=get_auth_headers(),
            json=apartment_data
        )
        assert response.status_code == 200
        data = response.json()
        assert "apartment" in data
        assert data["apartment"]["title"] == apartment_data["title"]
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/regions/{TEST_REGION_SLUG}", headers=get_auth_headers())

    def test_admin_add_apartment_to_nonexistent_region(self):
        """POST /api/admin/regions/{slug}/apartments for non-existent region should return 404"""
        apartment_data = {
            "title": "TEST Apartment",
            "description": "Test",
            "price": "€100,000",
            "size": "50m²",
            "imageUrl": "https://example.com/image.jpg"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/regions/nonexistent-{uuid.uuid4()}/apartments",
            headers=get_auth_headers(),
            json=apartment_data
        )
        assert response.status_code == 404


class TestRegionDataIntegrity:
    """Test region data integrity - CREATE → GET → UPDATE → GET → DELETE → GET"""

    def test_full_region_lifecycle(self):
        """Test complete region CRUD lifecycle"""
        region_slug = f"test-region-{uuid.uuid4().hex[:8]}"
        region_data = {
            "slug": region_slug,
            "title": f"TEST_Region {region_slug}",
            "subtitle": "Test subtitle",
            "investmentScore": 85,
            "priceRange": "€1.000-2.000/m²",
            "potential": "+40-60%",
            "timeHorizon": "3-5 Jahre",
            "content": "<p>Test content</p>",
            "bulletPoints": [{"text": "Point 1"}],
            "imageUrls": [],
            "apartments": []
        }
        
        # CREATE
        create_response = requests.post(
            f"{BASE_URL}/api/admin/regions",
            headers=get_auth_headers(),
            json=region_data
        )
        assert create_response.status_code == 200
        created_region = create_response.json()
        assert created_region["slug"] == region_slug
        region_id = created_region["id"]
        
        # GET - verify persisted
        get_response = requests.get(f"{BASE_URL}/api/regions/{region_slug}")
        assert get_response.status_code == 200
        fetched_region = get_response.json()
        assert fetched_region["slug"] == region_slug
        assert fetched_region["investmentScore"] == 85
        
        # UPDATE
        update_data = {"investmentScore": 92, "subtitle": "Updated subtitle"}
        update_response = requests.put(
            f"{BASE_URL}/api/admin/regions/{region_slug}",
            headers=get_auth_headers(),
            json=update_data
        )
        assert update_response.status_code == 200
        
        # GET - verify update persisted
        get_updated_response = requests.get(f"{BASE_URL}/api/regions/{region_slug}")
        assert get_updated_response.status_code == 200
        updated_region = get_updated_response.json()
        assert updated_region["investmentScore"] == 92
        assert updated_region["subtitle"] == "Updated subtitle"
        
        # DELETE
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/regions/{region_slug}",
            headers=get_auth_headers()
        )
        assert delete_response.status_code == 200
        
        # GET - verify deleted
        get_deleted_response = requests.get(f"{BASE_URL}/api/regions/{region_slug}")
        assert get_deleted_response.status_code == 404
