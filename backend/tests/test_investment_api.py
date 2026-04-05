"""
Investment Intelligence API Tests
Tests for Locations, Infrastructure, and Zones CRUD operations
"""
import pytest
import requests
import os
from base64 import b64encode

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://roi-calc-preview.preview.emergentagent.com')

# Admin credentials from test_credentials.md
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "euroadria2025"

def get_auth_header():
    """Generate Basic Auth header"""
    credentials = f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}"
    encoded = b64encode(credentials.encode()).decode()
    return {"Authorization": f"Basic {encoded}"}


class TestHealthCheck:
    """Health check tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        print(f"Health check: {data}")


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_verify_valid_credentials(self):
        """Test admin verification with valid credentials"""
        response = requests.get(
            f"{BASE_URL}/api/admin/verify",
            headers=get_auth_header()
        )
        assert response.status_code == 200
        print("Admin auth: Valid credentials accepted")
    
    def test_admin_verify_invalid_credentials(self):
        """Test admin verification with invalid credentials"""
        bad_creds = b64encode(b"wrong:wrong").decode()
        response = requests.get(
            f"{BASE_URL}/api/admin/verify",
            headers={"Authorization": f"Basic {bad_creds}"}
        )
        assert response.status_code == 401
        print("Admin auth: Invalid credentials rejected")


class TestLocationsAPI:
    """Locations (Standorte) API tests"""
    
    def test_get_all_locations(self):
        """Test GET /api/locations returns list of locations"""
        response = requests.get(f"{BASE_URL}/api/locations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Locations count: {len(data)}")
        
        # Verify expected count (22 locations per requirements)
        assert len(data) >= 20, f"Expected at least 20 locations, got {len(data)}"
        
        # Verify location structure
        if data:
            loc = data[0]
            required_fields = ["city", "country", "price_per_m2", "rental_yield", 
                             "tourism_growth", "population_growth", "price_growth",
                             "infrastructure_score", "investment_score"]
            for field in required_fields:
                assert field in loc, f"Missing field: {field}"
            print(f"First location: {loc['city']} - Score: {loc['investment_score']}")
    
    def test_get_single_location(self):
        """Test GET /api/locations/{city} returns specific location"""
        response = requests.get(f"{BASE_URL}/api/locations/Podgorica")
        assert response.status_code == 200
        data = response.json()
        assert data["city"] == "Podgorica"
        assert "investment_score" in data
        assert "related_articles" in data
        print(f"Podgorica details: Score={data['investment_score']}, Price/m2={data['price_per_m2']}")
    
    def test_location_not_found(self):
        """Test GET /api/locations/{city} returns 404 for non-existent city"""
        response = requests.get(f"{BASE_URL}/api/locations/NonExistentCity12345")
        assert response.status_code == 404


class TestInfrastructureAPI:
    """Infrastructure (Infrastruktur) API tests"""
    
    def test_get_all_infrastructure(self):
        """Test GET /api/infrastructure returns list of projects"""
        response = requests.get(f"{BASE_URL}/api/infrastructure")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Infrastructure projects count: {len(data)}")
        
        # Verify expected count (14 projects per requirements)
        assert len(data) >= 10, f"Expected at least 10 infrastructure projects, got {len(data)}"
        
        # Verify project structure
        if data:
            proj = data[0]
            required_fields = ["project_name", "type", "status", "latitude", "longitude",
                             "impact_radius_km"]
            for field in required_fields:
                assert field in proj, f"Missing field: {field}"
            print(f"First project: {proj['project_name']} - Type: {proj['type']}, Status: {proj['status']}")
    
    def test_infrastructure_project_types(self):
        """Test infrastructure projects have valid types"""
        response = requests.get(f"{BASE_URL}/api/infrastructure")
        assert response.status_code == 200
        data = response.json()
        
        valid_types = ["road", "rail", "airport", "port", "clinic"]
        for proj in data:
            assert proj["type"] in valid_types, f"Invalid type: {proj['type']}"
        print(f"All {len(data)} projects have valid types")


class TestZonesAPI:
    """Opportunity Zones (Zonen) API tests"""
    
    def test_get_all_zones(self):
        """Test GET /api/zones returns list of zones"""
        response = requests.get(f"{BASE_URL}/api/zones")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Zones count: {len(data)}")
        
        # Verify expected count (8 zones per requirements)
        assert len(data) >= 5, f"Expected at least 5 zones, got {len(data)}"
        
        # Verify zone structure
        if data:
            zone = data[0]
            required_fields = ["name", "country", "center_lat", "center_lng", 
                             "radius_km", "color", "investment_focus"]
            for field in required_fields:
                assert field in zone, f"Missing field: {field}"
            print(f"First zone: {zone['name']} - Country: {zone['country']}, Color: {zone['color']}")


class TestAdminLocationsCRUD:
    """Admin CRUD operations for Locations"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_city = "TEST_TestCity_12345"
        self.test_location = {
            "city": self.test_city,
            "country": "Montenegro",
            "latitude": 42.5,
            "longitude": 19.3,
            "price_per_m2": 1500,
            "rental_yield": 6.0,
            "tourism_growth": 10,
            "population_growth": 1.5,
            "price_growth": 12,
            "infrastructure_score": 75,
            "description": "Test location for automated testing",
            "opportunities": ["Test opportunity"],
            "risks": ["Test risk"],
            "use_cases": ["residential", "tourism"],
            "time_horizon": "medium"
        }
        yield
        # Cleanup: Delete test location if exists
        requests.delete(
            f"{BASE_URL}/api/admin/locations/{self.test_city}",
            headers=get_auth_header()
        )
    
    def test_create_location(self):
        """Test POST /api/admin/locations creates new location"""
        response = requests.post(
            f"{BASE_URL}/api/admin/locations",
            json=self.test_location,
            headers={**get_auth_header(), "Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        assert data["city"] == self.test_city
        assert "investment_score" in data
        print(f"Created location: {data['city']} with score {data['investment_score']}")
    
    def test_update_location(self):
        """Test PUT /api/admin/locations/{city} updates location"""
        # First create
        requests.post(
            f"{BASE_URL}/api/admin/locations",
            json=self.test_location,
            headers={**get_auth_header(), "Content-Type": "application/json"}
        )
        
        # Then update
        update_data = {
            "price_per_m2": 2000,
            "rental_yield": 7.0,
            "description": "Updated test description"
        }
        response = requests.put(
            f"{BASE_URL}/api/admin/locations/{self.test_city}",
            json=update_data,
            headers={**get_auth_header(), "Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        data = response.json()
        assert data["price_per_m2"] == 2000
        assert data["rental_yield"] == 7.0
        print(f"Updated location: price_per_m2={data['price_per_m2']}, rental_yield={data['rental_yield']}")
    
    def test_delete_location(self):
        """Test DELETE /api/admin/locations/{city} deletes location"""
        # First create
        requests.post(
            f"{BASE_URL}/api/admin/locations",
            json=self.test_location,
            headers={**get_auth_header(), "Content-Type": "application/json"}
        )
        
        # Then delete
        response = requests.delete(
            f"{BASE_URL}/api/admin/locations/{self.test_city}",
            headers=get_auth_header()
        )
        assert response.status_code == 200, f"Delete failed: {response.text}"
        
        # Verify deleted
        get_response = requests.get(f"{BASE_URL}/api/locations/{self.test_city}")
        assert get_response.status_code == 404
        print(f"Deleted location: {self.test_city}")


class TestAdminInfrastructureCRUD:
    """Admin CRUD operations for Infrastructure"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_project = {
            "project_name": "TEST_TestProject_12345",
            "type": "road",
            "latitude": 42.5,
            "longitude": 19.3,
            "impact_radius_km": 15,
            "status": "planned",
            "description": "Test infrastructure project",
            "completion_year": 2030,
            "investment_eur": 50000000
        }
        self.created_id = None
        yield
        # Cleanup
        if self.created_id:
            requests.delete(
                f"{BASE_URL}/api/admin/infrastructure/{self.created_id}",
                headers=get_auth_header()
            )
    
    def test_create_infrastructure(self):
        """Test POST /api/admin/infrastructure creates new project"""
        response = requests.post(
            f"{BASE_URL}/api/admin/infrastructure",
            json=self.test_project,
            headers={**get_auth_header(), "Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        assert data["project_name"] == self.test_project["project_name"]
        assert "id" in data
        self.created_id = data["id"]
        print(f"Created infrastructure: {data['project_name']} with id {data['id']}")
    
    def test_update_infrastructure(self):
        """Test PUT /api/admin/infrastructure/{id} updates project"""
        # First create
        create_response = requests.post(
            f"{BASE_URL}/api/admin/infrastructure",
            json=self.test_project,
            headers={**get_auth_header(), "Content-Type": "application/json"}
        )
        self.created_id = create_response.json()["id"]
        
        # Then update
        update_data = {
            "status": "construction",
            "completion_year": 2028,
            "investment_eur": 75000000
        }
        response = requests.put(
            f"{BASE_URL}/api/admin/infrastructure/{self.created_id}",
            json=update_data,
            headers={**get_auth_header(), "Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        data = response.json()
        assert data["status"] == "construction"
        assert data["completion_year"] == 2028
        print(f"Updated infrastructure: status={data['status']}, year={data['completion_year']}")


class TestAdminZonesCRUD:
    """Admin CRUD operations for Zones"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data"""
        self.test_zone = {
            "name": "TEST_TestZone_12345",
            "country": "Montenegro",
            "description": "Test opportunity zone",
            "center_lat": 42.5,
            "center_lng": 19.3,
            "radius_km": 10,
            "color": "#ff0000",
            "investment_focus": ["tourism", "residential"],
            "expected_growth": 15
        }
        self.created_id = None
        yield
        # Cleanup
        if self.created_id:
            requests.delete(
                f"{BASE_URL}/api/admin/zones/{self.created_id}",
                headers=get_auth_header()
            )
    
    def test_create_zone(self):
        """Test POST /api/admin/zones creates new zone"""
        response = requests.post(
            f"{BASE_URL}/api/admin/zones",
            json=self.test_zone,
            headers={**get_auth_header(), "Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Create failed: {response.text}"
        data = response.json()
        assert data["name"] == self.test_zone["name"]
        assert "id" in data
        self.created_id = data["id"]
        print(f"Created zone: {data['name']} with id {data['id']}")
    
    def test_update_zone(self):
        """Test PUT /api/admin/zones/{id} updates zone"""
        # First create
        create_response = requests.post(
            f"{BASE_URL}/api/admin/zones",
            json=self.test_zone,
            headers={**get_auth_header(), "Content-Type": "application/json"}
        )
        self.created_id = create_response.json()["id"]
        
        # Then update
        update_data = {
            "color": "#00ff00",
            "expected_growth": 20,
            "investment_focus": ["tourism", "logistics"]
        }
        response = requests.put(
            f"{BASE_URL}/api/admin/zones/{self.created_id}",
            json=update_data,
            headers={**get_auth_header(), "Content-Type": "application/json"}
        )
        assert response.status_code == 200, f"Update failed: {response.text}"
        data = response.json()
        assert data["color"] == "#00ff00"
        assert data["expected_growth"] == 20
        print(f"Updated zone: color={data['color']}, growth={data['expected_growth']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
