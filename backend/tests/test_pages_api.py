"""
Backend API tests for Pages CMS endpoints - focusing on Team page functionality
Tests the fix for team member images not displaying from CMS
"""
import pytest
import requests
import os
import uuid
from datetime import datetime

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Admin credentials
ADMIN_USERNAME = 'admin'
ADMIN_PASSWORD = 'euroadria2025'

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def auth_headers():
    """Auth headers for admin endpoints"""
    import base64
    credentials = base64.b64encode(f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}".encode()).decode()
    return {"Authorization": f"Basic {credentials}"}


class TestPagesAPIPublic:
    """Test public pages API endpoints"""
    
    def test_get_all_pages(self, api_client):
        """GET /api/pages returns list of pages"""
        response = api_client.get(f"{BASE_URL}/api/pages")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_get_team_page_returns_data(self, api_client):
        """GET /api/pages/team returns team page with correct structure"""
        response = api_client.get(f"{BASE_URL}/api/pages/team")
        assert response.status_code == 200
        
        data = response.json()
        assert data['slug'] == 'team'
        assert 'title' in data
        assert 'sections' in data
    
    def test_team_page_has_team_members_section(self, api_client):
        """Team page includes team members section with members data"""
        response = api_client.get(f"{BASE_URL}/api/pages/team")
        assert response.status_code == 200
        
        data = response.json()
        sections = data.get('sections', [])
        
        # Find team-members section
        team_section = None
        for section in sections:
            if section.get('type') == 'team':
                team_section = section
                break
        
        assert team_section is not None, "Team page should have a 'team' type section"
        assert 'data' in team_section
        assert 'members' in team_section['data']
        
        members = team_section['data']['members']
        assert len(members) >= 2, "Team page should have at least 2 members"
    
    def test_team_members_have_images(self, api_client):
        """Team members have image paths defined"""
        response = api_client.get(f"{BASE_URL}/api/pages/team")
        data = response.json()
        
        # Find team section
        team_section = next((s for s in data.get('sections', []) if s.get('type') == 'team'), None)
        assert team_section is not None
        
        members = team_section['data']['members']
        for member in members:
            assert 'image' in member, f"Member {member.get('name', 'unknown')} should have an image"
            assert member['image'], f"Member {member.get('name', 'unknown')} image should not be empty"
            # Image should be a path starting with /
            assert member['image'].startswith('/'), f"Image path should start with /"
    
    def test_team_member_images_are_accessible(self, api_client):
        """Team member images are accessible (return 200)"""
        response = api_client.get(f"{BASE_URL}/api/pages/team")
        data = response.json()
        
        team_section = next((s for s in data.get('sections', []) if s.get('type') == 'team'), None)
        assert team_section is not None
        
        members = team_section['data']['members']
        for member in members:
            image_url = f"{BASE_URL}{member['image']}"
            img_response = api_client.head(image_url)
            assert img_response.status_code == 200, f"Image {member['image']} for {member['name']} should be accessible"
    
    def test_get_nonexistent_page_returns_404(self, api_client):
        """GET /api/pages/nonexistent returns 404"""
        response = api_client.get(f"{BASE_URL}/api/pages/nonexistent-page-12345")
        assert response.status_code == 404
    
    def test_get_home_page_returns_default(self, api_client):
        """GET /api/pages/home returns home page data"""
        response = api_client.get(f"{BASE_URL}/api/pages/home")
        assert response.status_code == 200
        
        data = response.json()
        assert data['slug'] == 'home'
        assert 'sections' in data


class TestPagesAPIAdmin:
    """Test admin pages API endpoints"""
    
    def test_get_admin_pages_requires_auth(self, api_client):
        """GET /api/admin/pages requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/admin/pages")
        assert response.status_code == 401
    
    def test_get_admin_pages_with_auth(self, api_client, auth_headers):
        """GET /api/admin/pages returns pages list when authenticated"""
        response = api_client.get(f"{BASE_URL}/api/admin/pages", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)
        # Should include default pages
        slugs = [p['slug'] for p in data]
        assert 'team' in slugs or any('team' in str(p) for p in data)
    
    def test_update_team_page_requires_auth(self, api_client):
        """PUT /api/admin/pages/team requires authentication"""
        response = api_client.put(
            f"{BASE_URL}/api/admin/pages/team",
            json={"title": "Test"}
        )
        assert response.status_code == 401
    
    def test_update_team_page_with_auth(self, api_client, auth_headers):
        """PUT /api/admin/pages/team updates page data"""
        # First get current data
        current = api_client.get(f"{BASE_URL}/api/pages/team").json()
        
        # Update with new title
        unique_marker = f"TEST_{uuid.uuid4().hex[:8]}"
        update_data = {
            "title": f"Test Title {unique_marker}",
            "sections": current.get('sections', [])
        }
        
        response = api_client.put(
            f"{BASE_URL}/api/admin/pages/team",
            headers=auth_headers,
            json=update_data
        )
        assert response.status_code == 200
        
        # Verify update
        updated = api_client.get(f"{BASE_URL}/api/pages/team").json()
        assert unique_marker in updated['title']
        
        # Restore original title
        restore_data = {
            "title": "Über uns",
            "sections": current.get('sections', [])
        }
        api_client.put(
            f"{BASE_URL}/api/admin/pages/team",
            headers=auth_headers,
            json=restore_data
        )


class TestImageUploadAPI:
    """Test image upload API endpoint"""
    
    def test_upload_requires_auth(self, api_client):
        """POST /api/admin/upload requires authentication"""
        # Create a minimal test image
        files = {'file': ('test.jpg', b'\xff\xd8\xff\xe0' + b'\x00' * 100, 'image/jpeg')}
        response = api_client.post(f"{BASE_URL}/api/admin/upload", files=files)
        assert response.status_code == 401
    
    def test_upload_with_invalid_file_type(self, api_client, auth_headers):
        """POST /api/admin/upload rejects invalid file types"""
        # Remove Content-Type header for file upload
        headers = {k: v for k, v in auth_headers.items()}
        
        files = {'file': ('test.txt', b'Hello World', 'text/plain')}
        response = requests.post(
            f"{BASE_URL}/api/admin/upload",
            headers=headers,
            files=files
        )
        assert response.status_code == 400
    
    def test_list_uploads_requires_auth(self, api_client):
        """GET /api/admin/uploads requires authentication"""
        response = api_client.get(f"{BASE_URL}/api/admin/uploads")
        assert response.status_code == 401
    
    def test_list_uploads_with_auth(self, api_client, auth_headers):
        """GET /api/admin/uploads returns list when authenticated"""
        response = api_client.get(f"{BASE_URL}/api/admin/uploads", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)


class TestTeamDataIntegrity:
    """Test team data integrity after the fix"""
    
    def test_holger_image_exists(self, api_client):
        """Holger Kuhlmann's image path points to existing file"""
        response = api_client.get(f"{BASE_URL}/api/pages/team")
        data = response.json()
        
        team_section = next((s for s in data.get('sections', []) if s.get('type') == 'team'), None)
        members = team_section['data']['members']
        
        holger = next((m for m in members if 'holger' in m.get('id', '').lower() or 'holger' in m.get('name', '').lower()), None)
        assert holger is not None, "Holger should be in team members"
        
        # Check image is accessible
        img_response = api_client.head(f"{BASE_URL}{holger['image']}")
        assert img_response.status_code == 200, f"Holger's image {holger['image']} should be accessible"
    
    def test_milena_image_exists(self, api_client):
        """Milena Bubanja's image path points to existing file"""
        response = api_client.get(f"{BASE_URL}/api/pages/team")
        data = response.json()
        
        team_section = next((s for s in data.get('sections', []) if s.get('type') == 'team'), None)
        members = team_section['data']['members']
        
        milena = next((m for m in members if 'milena' in m.get('id', '').lower() or 'milena' in m.get('name', '').lower()), None)
        assert milena is not None, "Milena should be in team members"
        
        # Check image is accessible
        img_response = api_client.head(f"{BASE_URL}{milena['image']}")
        assert img_response.status_code == 200, f"Milena's image {milena['image']} should be accessible"
    
    def test_team_page_structure_complete(self, api_client):
        """Team page has all required sections"""
        response = api_client.get(f"{BASE_URL}/api/pages/team")
        data = response.json()
        
        # Check required fields
        assert 'slug' in data
        assert 'title' in data
        assert 'sections' in data
        
        section_types = [s.get('type') for s in data['sections']]
        
        # Should have hero section
        assert 'hero' in section_types, "Team page should have a hero section"
        
        # Should have team section
        assert 'team' in section_types, "Team page should have a team section"
