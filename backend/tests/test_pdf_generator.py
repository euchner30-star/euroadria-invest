"""
PDF Generator API Tests
Tests for POST /api/admin/generate-pdf endpoint
"""
import pytest
import requests
import os
import base64

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_USER = "admin"
ADMIN_PASS = "euroadria2025"

@pytest.fixture
def auth_header():
    """Generate Basic Auth header for admin"""
    credentials = base64.b64encode(f"{ADMIN_USER}:{ADMIN_PASS}".encode()).decode()
    return {"Authorization": f"Basic {credentials}"}

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session


class TestPDFGeneratorAPI:
    """PDF Generator endpoint tests"""
    
    def test_generate_pdf_success(self, api_client, auth_header):
        """Test successful PDF generation with all fields"""
        response = api_client.post(
            f"{BASE_URL}/api/admin/generate-pdf",
            headers=auth_header,
            json={
                "title": "B2B Partnerprogramm Montenegro",
                "subtitle": "Investmentmöglichkeiten für Unternehmer",
                "content": "<h1>Überschrift</h1><p>Test paragraph content</p><ul><li>Item 1</li><li>Item 2</li></ul>"
            }
        )
        
        # Status code assertion
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        # Content-Type assertion
        assert response.headers.get('Content-Type') == 'application/pdf', \
            f"Expected application/pdf, got {response.headers.get('Content-Type')}"
        
        # PDF validity check - must start with %PDF-
        pdf_content = response.content
        assert pdf_content[:5] == b'%PDF-', "PDF content should start with %PDF-"
        
        # Check Content-Disposition header for filename
        content_disp = response.headers.get('Content-Disposition', '')
        assert 'attachment' in content_disp, "Should have attachment disposition"
        assert 'EuroAdria_' in content_disp, "Filename should start with EuroAdria_"
        
        print(f"✓ PDF generated successfully, size: {len(pdf_content)} bytes")
    
    def test_generate_pdf_with_title_only(self, api_client, auth_header):
        """Test PDF generation with only title (no subtitle)"""
        response = api_client.post(
            f"{BASE_URL}/api/admin/generate-pdf",
            headers=auth_header,
            json={
                "title": "Test Document",
                "subtitle": "",
                "content": "<p>Simple content</p>"
            }
        )
        
        assert response.status_code == 200
        assert response.headers.get('Content-Type') == 'application/pdf'
        assert response.content[:5] == b'%PDF-'
        print("✓ PDF with title only generated successfully")
    
    def test_generate_pdf_with_complex_html(self, api_client, auth_header):
        """Test PDF generation with complex HTML content"""
        complex_html = """
        <h1>Main Heading</h1>
        <p>Introduction paragraph with <strong>bold</strong> and <em>italic</em> text.</p>
        <h2>Section 1</h2>
        <p>Content for section 1.</p>
        <ul>
            <li>Bullet point 1</li>
            <li>Bullet point 2</li>
            <li>Bullet point 3</li>
        </ul>
        <h3>Subsection</h3>
        <ol>
            <li>Numbered item 1</li>
            <li>Numbered item 2</li>
        </ol>
        <blockquote>This is a quote block</blockquote>
        <p>Final paragraph with a <a href="https://example.com">link</a>.</p>
        """
        
        response = api_client.post(
            f"{BASE_URL}/api/admin/generate-pdf",
            headers=auth_header,
            json={
                "title": "Complex Document Test",
                "subtitle": "Testing all HTML elements",
                "content": complex_html
            }
        )
        
        assert response.status_code == 200
        assert response.headers.get('Content-Type') == 'application/pdf'
        assert response.content[:5] == b'%PDF-'
        print(f"✓ Complex HTML PDF generated, size: {len(response.content)} bytes")
    
    def test_generate_pdf_empty_content(self, api_client, auth_header):
        """Test PDF generation with empty content - should still work with default title"""
        response = api_client.post(
            f"{BASE_URL}/api/admin/generate-pdf",
            headers=auth_header,
            json={
                "title": "",
                "subtitle": "",
                "content": ""
            }
        )
        
        # Backend uses default title "Dokument" when empty
        assert response.status_code == 200
        assert response.headers.get('Content-Type') == 'application/pdf'
        print("✓ Empty content PDF generated (uses default title)")
    
    def test_generate_pdf_unauthorized(self, api_client):
        """Test PDF generation without auth - should fail"""
        response = api_client.post(
            f"{BASE_URL}/api/admin/generate-pdf",
            json={
                "title": "Test",
                "content": "<p>Test</p>"
            }
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Unauthorized request correctly rejected")
    
    def test_generate_pdf_wrong_credentials(self, api_client):
        """Test PDF generation with wrong credentials"""
        wrong_auth = base64.b64encode(b"admin:wrongpassword").decode()
        response = api_client.post(
            f"{BASE_URL}/api/admin/generate-pdf",
            headers={"Authorization": f"Basic {wrong_auth}"},
            json={
                "title": "Test",
                "content": "<p>Test</p>"
            }
        )
        
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Wrong credentials correctly rejected")
    
    def test_generate_pdf_special_characters_in_title(self, api_client, auth_header):
        """Test PDF generation with special characters in title"""
        response = api_client.post(
            f"{BASE_URL}/api/admin/generate-pdf",
            headers=auth_header,
            json={
                "title": "Spezial: Ümläute & Sönderzeichen!",
                "subtitle": "Test für Ä, Ö, Ü, ß",
                "content": "<p>Inhalt mit Umlauten: äöüß</p>"
            }
        )
        
        assert response.status_code == 200
        assert response.headers.get('Content-Type') == 'application/pdf'
        assert response.content[:5] == b'%PDF-'
        print("✓ Special characters handled correctly")


class TestAdminVerify:
    """Admin verification endpoint tests"""
    
    def test_admin_verify_success(self, api_client, auth_header):
        """Test admin verification with correct credentials"""
        response = api_client.get(
            f"{BASE_URL}/api/admin/verify",
            headers=auth_header
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data.get('authenticated') == True
        assert data.get('username') == 'admin'
        print("✓ Admin verification successful")
    
    def test_admin_verify_unauthorized(self, api_client):
        """Test admin verification without credentials"""
        response = api_client.get(f"{BASE_URL}/api/admin/verify")
        
        assert response.status_code == 401
        print("✓ Unauthorized admin verify correctly rejected")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
