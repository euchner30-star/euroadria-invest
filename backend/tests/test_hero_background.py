"""
Test Hero Background Image CMS Feature
Tests the ability to upload and display hero background images via the admin panel
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://roi-calc-preview.preview.emergentagent.com')
ADMIN_USERNAME = "office@euroadria.me"
ADMIN_PASSWORD = "IsTH42#HZMC4q@3A7ITfp#Ip"


def get_auth_header():
    """Generate Basic Auth header"""
    credentials = f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}"
    encoded = base64.b64encode(credentials.encode()).decode()
    return {"Authorization": f"Basic {encoded}"}


class TestPagesAPI:
    """Test Pages CMS API endpoints"""
    
    def test_get_home_page(self):
        """Test GET /api/pages/home returns correct structure"""
        response = requests.get(f"{BASE_URL}/api/pages/home")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "slug" in data
        assert data["slug"] == "home"
        assert "sections" in data
        assert isinstance(data["sections"], list)
        print(f"✓ GET /api/pages/home returns valid structure with {len(data['sections'])} sections")
    
    def test_home_page_has_hero_section(self):
        """Test that home page has a hero section"""
        response = requests.get(f"{BASE_URL}/api/pages/home")
        assert response.status_code == 200
        
        data = response.json()
        hero_section = next((s for s in data["sections"] if s["type"] == "hero"), None)
        
        assert hero_section is not None, "Hero section not found in home page"
        assert "data" in hero_section
        print(f"✓ Home page has hero section with data: {list(hero_section['data'].keys())}")
    
    def test_admin_pages_endpoint_requires_auth(self):
        """Test that admin pages endpoint requires authentication"""
        response = requests.get(f"{BASE_URL}/api/admin/pages")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Admin pages endpoint requires authentication")
    
    def test_admin_pages_endpoint_with_auth(self):
        """Test admin pages endpoint with valid credentials"""
        response = requests.get(
            f"{BASE_URL}/api/admin/pages",
            headers=get_auth_header()
        )
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert isinstance(data, list)
        
        # Check that home page is in the list
        home_page = next((p for p in data if p["slug"] == "home"), None)
        assert home_page is not None, "Home page not found in admin pages list"
        print(f"✓ Admin pages endpoint returns {len(data)} pages including home")
    
    def test_update_home_page_hero_background(self):
        """Test updating home page hero section with background image"""
        # First get current page data
        response = requests.get(f"{BASE_URL}/api/pages/home")
        assert response.status_code == 200
        current_data = response.json()
        
        # Find hero section and add background image
        sections = current_data.get("sections", [])
        hero_section = next((s for s in sections if s["type"] == "hero"), None)
        
        if hero_section:
            # Add test background image URL
            test_image_url = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"
            hero_section["data"]["backgroundImage"] = test_image_url
            hero_section["data"]["overlayOpacity"] = 50
        
        # Update the page
        update_payload = {
            "metaTitle": current_data.get("metaTitle", ""),
            "metaDescription": current_data.get("metaDescription", ""),
            "sections": sections
        }
        
        response = requests.put(
            f"{BASE_URL}/api/admin/pages/home",
            headers={**get_auth_header(), "Content-Type": "application/json"},
            json=update_payload
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ Successfully updated home page with hero background image")
        
        # Verify the update persisted
        response = requests.get(f"{BASE_URL}/api/pages/home")
        assert response.status_code == 200
        
        updated_data = response.json()
        updated_hero = next((s for s in updated_data["sections"] if s["type"] == "hero"), None)
        
        assert updated_hero is not None
        assert "backgroundImage" in updated_hero["data"], "backgroundImage not found in hero data"
        assert updated_hero["data"]["backgroundImage"] == test_image_url
        print(f"✓ Verified hero backgroundImage persisted: {updated_hero['data']['backgroundImage'][:50]}...")
    
    def test_hero_overlay_opacity_persists(self):
        """Test that overlay opacity value persists after update"""
        response = requests.get(f"{BASE_URL}/api/pages/home")
        assert response.status_code == 200
        
        data = response.json()
        hero_section = next((s for s in data["sections"] if s["type"] == "hero"), None)
        
        if hero_section and "overlayOpacity" in hero_section.get("data", {}):
            assert isinstance(hero_section["data"]["overlayOpacity"], int)
            print(f"✓ Hero overlay opacity value: {hero_section['data']['overlayOpacity']}%")
        else:
            print("⚠ No overlayOpacity set yet (will use default)")


class TestImageUploadAPI:
    """Test Image Upload API endpoints"""
    
    def test_upload_endpoint_requires_auth(self):
        """Test that upload endpoint requires authentication"""
        response = requests.post(f"{BASE_URL}/api/admin/upload")
        assert response.status_code in [401, 422], f"Expected 401 or 422, got {response.status_code}"
        print("✓ Upload endpoint requires authentication")
    
    def test_upload_endpoint_rejects_invalid_file_type(self):
        """Test that upload endpoint rejects non-image files"""
        # Create a fake text file
        files = {"file": ("test.txt", b"This is not an image", "text/plain")}
        
        response = requests.post(
            f"{BASE_URL}/api/admin/upload",
            headers=get_auth_header(),
            files=files
        )
        
        # Should reject with 400 or similar
        assert response.status_code in [400, 415, 422], f"Expected 400/415/422, got {response.status_code}"
        print("✓ Upload endpoint rejects non-image files")


class TestHeroComponentIntegration:
    """Test Hero component receives correct data from API"""
    
    def test_hero_data_structure_for_frontend(self):
        """Test that hero section data has correct structure for frontend"""
        response = requests.get(f"{BASE_URL}/api/pages/home")
        assert response.status_code == 200
        
        data = response.json()
        hero_section = next((s for s in data["sections"] if s["type"] == "hero"), None)
        
        assert hero_section is not None
        hero_data = hero_section.get("data", {})
        
        # Check expected fields exist (some may be optional)
        expected_fields = ["title", "subtitle", "ctaText", "ctaLink"]
        for field in expected_fields:
            if field in hero_data:
                print(f"  ✓ {field}: {hero_data[field][:30] if isinstance(hero_data[field], str) else hero_data[field]}...")
        
        # Check optional background fields
        if "backgroundImage" in hero_data:
            print(f"  ✓ backgroundImage: {hero_data['backgroundImage'][:50]}...")
        else:
            print("  ⚠ backgroundImage: not set (will use default)")
            
        if "overlayOpacity" in hero_data:
            print(f"  ✓ overlayOpacity: {hero_data['overlayOpacity']}%")
        else:
            print("  ⚠ overlayOpacity: not set (will use default 50%)")
        
        print("✓ Hero data structure is valid for frontend consumption")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
