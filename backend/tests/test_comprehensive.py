"""
Comprehensive API tests for EuroAdria platform
Tests: Health, Articles, Investment, Admin Auth, Settings
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://roi-calc-preview.preview.emergentagent.com')

# Admin credentials
ADMIN_USER = "admin"
ADMIN_PASS = "euroadria2025"


class TestHealthAndBasic:
    """Health check and basic API tests"""
    
    def test_health_endpoint(self):
        """Test /api/health returns ok"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print(f"Health check passed: {data}")
    
    def test_root_endpoint(self):
        """Test /api/ returns Hello World"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        print(f"Root endpoint passed: {data}")


class TestArticlesAPI:
    """Article endpoints tests"""
    
    def test_get_articles_list(self):
        """Test /api/articles/list returns paginated articles"""
        response = requests.get(f"{BASE_URL}/api/articles/list")
        assert response.status_code == 200
        data = response.json()
        assert "articles" in data
        assert "total" in data
        assert "page" in data
        print(f"Articles list: {data['total']} total articles")
    
    def test_get_articles(self):
        """Test /api/articles returns all articles"""
        response = requests.get(f"{BASE_URL}/api/articles")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Articles: {len(data)} articles found")
    
    def test_get_clusters(self):
        """Test /api/clusters returns categories"""
        response = requests.get(f"{BASE_URL}/api/clusters")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Clusters: {len(data)} clusters found")
    
    def test_get_categories(self):
        """Test /api/categories returns categories"""
        response = requests.get(f"{BASE_URL}/api/categories")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Categories: {len(data)} categories found")


class TestInvestmentAPI:
    """Investment endpoints tests"""
    
    def test_get_locations(self):
        """Test /api/locations returns locations"""
        response = requests.get(f"{BASE_URL}/api/locations")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) > 0  # Should have seeded locations
        print(f"Locations: {len(data)} locations found")
    
    def test_get_infrastructure(self):
        """Test /api/infrastructure returns projects"""
        response = requests.get(f"{BASE_URL}/api/infrastructure")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Infrastructure: {len(data)} projects found")
    
    def test_get_zones(self):
        """Test /api/zones returns zones"""
        response = requests.get(f"{BASE_URL}/api/zones")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Zones: {len(data)} zones found")
    
    def test_roi_calculator(self):
        """Test /api/calculator/roi"""
        payload = {
            "purchase_price": 150000,
            "renovation_cost": 10000,
            "additional_costs": 5000,
            "monthly_rent": 800,
            "vacancy_rate": 5,
            "monthly_costs": 100
        }
        response = requests.post(f"{BASE_URL}/api/calculator/roi", json=payload)
        assert response.status_code == 200
        data = response.json()
        # Check for expected ROI calculator response fields
        assert "annual_cashflow" in data or "roi_percent" in data or "break_even_years" in data
        print(f"ROI Calculator response: {data}")


class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_verify_success(self):
        """Test admin verification with correct credentials"""
        response = requests.get(
            f"{BASE_URL}/api/admin/verify",
            auth=(ADMIN_USER, ADMIN_PASS)
        )
        assert response.status_code == 200
        data = response.json()
        assert data.get("valid") == True or data.get("authenticated") == True
        print(f"Admin auth success: {data}")
    
    def test_admin_verify_unauthorized(self):
        """Test admin verification without credentials"""
        response = requests.get(f"{BASE_URL}/api/admin/verify")
        assert response.status_code == 401
        print("Admin auth unauthorized test passed")
    
    def test_admin_verify_wrong_credentials(self):
        """Test admin verification with wrong credentials"""
        response = requests.get(
            f"{BASE_URL}/api/admin/verify",
            auth=("wrong", "credentials")
        )
        assert response.status_code == 401
        print("Admin auth wrong credentials test passed")


class TestSettingsAPI:
    """Settings endpoints tests"""
    
    def test_get_downloads(self):
        """Test /api/settings/downloads returns download URLs"""
        response = requests.get(f"{BASE_URL}/api/settings/downloads")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"Downloads settings: {list(data.keys())}")
    
    def test_get_homepage(self):
        """Test /api/settings/homepage returns homepage content"""
        response = requests.get(f"{BASE_URL}/api/settings/homepage")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"Homepage settings: {list(data.keys())[:5]}...")


class TestRegionsAPI:
    """Regions endpoints tests"""
    
    def test_get_regions(self):
        """Test /api/regions returns regions"""
        response = requests.get(f"{BASE_URL}/api/regions")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Regions: {len(data)} regions found")


class TestEventsAPI:
    """Events endpoints tests"""
    
    def test_get_events(self):
        """Test /api/events returns events"""
        response = requests.get(f"{BASE_URL}/api/events")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"Events: {len(data)} events found")


class TestPDFGenerator:
    """PDF Generator endpoint tests"""
    
    def test_generate_pdf_success(self):
        """Test PDF generation with valid content"""
        payload = {
            "title": "Test Document",
            "subtitle": "Test Subtitle",
            "content": "<h1>Test Heading</h1><p>Test paragraph content.</p>"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/generate-pdf",
            json=payload,
            auth=(ADMIN_USER, ADMIN_PASS)
        )
        assert response.status_code == 200
        assert response.headers.get("content-type") == "application/pdf"
        assert response.content[:4] == b"%PDF"
        print(f"PDF generated successfully, size: {len(response.content)} bytes")
    
    def test_generate_pdf_unauthorized(self):
        """Test PDF generation without auth"""
        payload = {"title": "Test", "content": "<p>Test</p>"}
        response = requests.post(f"{BASE_URL}/api/admin/generate-pdf", json=payload)
        assert response.status_code == 401
        print("PDF generation unauthorized test passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
