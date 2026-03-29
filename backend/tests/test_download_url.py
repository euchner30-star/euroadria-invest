"""
Test suite for downloadUrl field in Articles API
Tests the new Download/Exposé feature for linking external PDFs
"""
import pytest
import requests
import os
from base64 import b64encode

# Use localhost since REACT_APP_BACKEND_URL is empty
BASE_URL = "http://localhost:8001"

# Admin credentials
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "euroadria2025"

def get_auth_header():
    """Generate Basic Auth header"""
    credentials = f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}"
    encoded = b64encode(credentials.encode()).decode()
    return {"Authorization": f"Basic {encoded}"}


class TestDownloadUrlBackend:
    """Test downloadUrl field in Article CRUD operations"""
    
    def test_get_existing_article_with_download_url(self):
        """GET /api/articles/{slug} - Article with downloadUrl returns the field"""
        response = requests.get(f"{BASE_URL}/api/articles/test-expose-download")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        
        data = response.json()
        assert "downloadUrl" in data, "downloadUrl field should be present in response"
        assert data["downloadUrl"] is not None, "downloadUrl should not be None for test article"
        assert "drive.google.com" in data["downloadUrl"] or "dropbox" in data["downloadUrl"] or data["downloadUrl"].startswith("http"), \
            f"downloadUrl should be a valid URL, got: {data['downloadUrl']}"
        
        print(f"✓ Article with downloadUrl returned correctly: {data['downloadUrl']}")
    
    def test_create_article_with_download_url(self):
        """POST /api/admin/articles - Create article with downloadUrl"""
        headers = get_auth_header()
        headers["Content-Type"] = "application/json"
        
        article_data = {
            "cluster": "A",
            "title": "TEST_Download URL Article",
            "slug": "test-download-url-article",
            "excerpt": "Test article with download URL",
            "content": "This is test content for download URL feature.",
            "image": "https://example.com/test-image.jpg",
            "category": "Makro & Strategie",
            "date": "2026-01-15",
            "readTime": "5 min",
            "featured": False,
            "author": "Test Author",
            "relatedArticles": [],
            "downloadUrl": "https://drive.google.com/file/d/test-pdf-123"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/articles",
            json=article_data,
            headers=headers
        )
        
        # Handle case where article already exists
        if response.status_code == 400 and "already exists" in response.text:
            # Delete and retry
            requests.delete(f"{BASE_URL}/api/admin/articles/999", headers=headers)
            # Get the article by slug to find its ID
            get_resp = requests.get(f"{BASE_URL}/api/articles/test-download-url-article")
            if get_resp.status_code == 200:
                article_id = get_resp.json().get("id")
                requests.delete(f"{BASE_URL}/api/admin/articles/{article_id}", headers=headers)
            response = requests.post(
                f"{BASE_URL}/api/admin/articles",
                json=article_data,
                headers=headers
            )
        
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "downloadUrl" in data, "Response should include downloadUrl field"
        assert data["downloadUrl"] == "https://drive.google.com/file/d/test-pdf-123", \
            f"downloadUrl mismatch: {data.get('downloadUrl')}"
        
        # Verify persistence with GET
        get_response = requests.get(f"{BASE_URL}/api/articles/test-download-url-article")
        assert get_response.status_code == 200
        get_data = get_response.json()
        assert get_data["downloadUrl"] == "https://drive.google.com/file/d/test-pdf-123"
        
        print(f"✓ Article created with downloadUrl: {data['downloadUrl']}")
        
        # Cleanup
        if "id" in data:
            requests.delete(f"{BASE_URL}/api/admin/articles/{data['id']}", headers=headers)
    
    def test_create_article_without_download_url(self):
        """POST /api/admin/articles - Create article without downloadUrl (should be null)"""
        headers = get_auth_header()
        headers["Content-Type"] = "application/json"
        
        article_data = {
            "cluster": "B",
            "title": "TEST_No Download URL Article",
            "slug": "test-no-download-url-article",
            "excerpt": "Test article without download URL",
            "content": "This article has no download link.",
            "image": "https://example.com/test-image2.jpg",
            "category": "Recht & Compliance",
            "date": "2026-01-15",
            "readTime": "3 min",
            "featured": False,
            "author": "Test Author",
            "relatedArticles": []
            # Note: downloadUrl is intentionally omitted
        }
        
        response = requests.post(
            f"{BASE_URL}/api/admin/articles",
            json=article_data,
            headers=headers
        )
        
        # Handle case where article already exists
        if response.status_code == 400 and "already exists" in response.text:
            get_resp = requests.get(f"{BASE_URL}/api/articles/test-no-download-url-article")
            if get_resp.status_code == 200:
                article_id = get_resp.json().get("id")
                requests.delete(f"{BASE_URL}/api/admin/articles/{article_id}", headers=headers)
            response = requests.post(
                f"{BASE_URL}/api/admin/articles",
                json=article_data,
                headers=headers
            )
        
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
        
        data = response.json()
        # downloadUrl should be None or not present when not provided
        download_url = data.get("downloadUrl")
        assert download_url is None or download_url == "", \
            f"downloadUrl should be None/empty when not provided, got: {download_url}"
        
        print(f"✓ Article created without downloadUrl (null/empty as expected)")
        
        # Cleanup
        if "id" in data:
            requests.delete(f"{BASE_URL}/api/admin/articles/{data['id']}", headers=headers)
    
    def test_update_article_add_download_url(self):
        """PUT /api/admin/articles/{id} - Add downloadUrl to existing article"""
        headers = get_auth_header()
        headers["Content-Type"] = "application/json"
        
        # First create an article without downloadUrl
        create_data = {
            "cluster": "C",
            "title": "TEST_Update Download URL Article",
            "slug": "test-update-download-url",
            "excerpt": "Test article for update",
            "content": "Content here.",
            "image": "https://example.com/img.jpg",
            "category": "Montenegro Regionen",
            "date": "2026-01-15",
            "readTime": "4 min",
            "featured": False,
            "author": "Test Author",
            "relatedArticles": []
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/articles",
            json=create_data,
            headers=headers
        )
        
        if create_response.status_code == 400 and "already exists" in create_response.text:
            get_resp = requests.get(f"{BASE_URL}/api/articles/test-update-download-url")
            if get_resp.status_code == 200:
                article_id = get_resp.json().get("id")
                requests.delete(f"{BASE_URL}/api/admin/articles/{article_id}", headers=headers)
            create_response = requests.post(
                f"{BASE_URL}/api/admin/articles",
                json=create_data,
                headers=headers
            )
        
        assert create_response.status_code in [200, 201], f"Create failed: {create_response.text}"
        article_id = create_response.json()["id"]
        
        # Now update with downloadUrl
        update_data = {
            "downloadUrl": "https://dropbox.com/s/test-expose-pdf"
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/admin/articles/{article_id}",
            json=update_data,
            headers=headers
        )
        
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        updated_data = update_response.json()
        assert updated_data["downloadUrl"] == "https://dropbox.com/s/test-expose-pdf", \
            f"downloadUrl not updated correctly: {updated_data.get('downloadUrl')}"
        
        # Verify with GET
        get_response = requests.get(f"{BASE_URL}/api/articles/test-update-download-url")
        assert get_response.status_code == 200
        assert get_response.json()["downloadUrl"] == "https://dropbox.com/s/test-expose-pdf"
        
        print(f"✓ Article updated with downloadUrl successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/articles/{article_id}", headers=headers)
    
    def test_update_article_remove_download_url(self):
        """PUT /api/admin/articles/{id} - Remove downloadUrl (set to empty)"""
        headers = get_auth_header()
        headers["Content-Type"] = "application/json"
        
        # Create article with downloadUrl
        create_data = {
            "cluster": "D",
            "title": "TEST_Remove Download URL Article",
            "slug": "test-remove-download-url",
            "excerpt": "Test article for removal",
            "content": "Content here.",
            "image": "https://example.com/img.jpg",
            "category": "Serbien & Balkan",
            "date": "2026-01-15",
            "readTime": "4 min",
            "featured": False,
            "author": "Test Author",
            "relatedArticles": [],
            "downloadUrl": "https://example.com/initial-pdf.pdf"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/admin/articles",
            json=create_data,
            headers=headers
        )
        
        if create_response.status_code == 400 and "already exists" in create_response.text:
            get_resp = requests.get(f"{BASE_URL}/api/articles/test-remove-download-url")
            if get_resp.status_code == 200:
                article_id = get_resp.json().get("id")
                requests.delete(f"{BASE_URL}/api/admin/articles/{article_id}", headers=headers)
            create_response = requests.post(
                f"{BASE_URL}/api/admin/articles",
                json=create_data,
                headers=headers
            )
        
        assert create_response.status_code in [200, 201]
        article_id = create_response.json()["id"]
        
        # Update to remove downloadUrl (set to empty string)
        update_data = {
            "downloadUrl": ""
        }
        
        update_response = requests.put(
            f"{BASE_URL}/api/admin/articles/{article_id}",
            json=update_data,
            headers=headers
        )
        
        assert update_response.status_code == 200, f"Update failed: {update_response.text}"
        
        # Note: The API might keep empty string or convert to null
        # Both are acceptable for "no download URL"
        updated_data = update_response.json()
        download_url = updated_data.get("downloadUrl")
        assert download_url in [None, ""], f"downloadUrl should be empty/null after removal, got: {download_url}"
        
        print(f"✓ Article downloadUrl removed successfully")
        
        # Cleanup
        requests.delete(f"{BASE_URL}/api/admin/articles/{article_id}", headers=headers)
    
    def test_admin_auth_required_for_article_creation(self):
        """POST /api/admin/articles - Should require authentication"""
        article_data = {
            "cluster": "A",
            "title": "Unauthorized Article",
            "slug": "unauthorized-article",
            "excerpt": "Should fail",
            "content": "Content",
            "image": "https://example.com/img.jpg",
            "category": "Makro & Strategie",
            "date": "2026-01-15",
            "readTime": "5 min",
            "featured": False,
            "author": "Test",
            "relatedArticles": [],
            "downloadUrl": "https://example.com/pdf"
        }
        
        # No auth header
        response = requests.post(
            f"{BASE_URL}/api/admin/articles",
            json=article_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}"
        print("✓ Admin authentication required for article creation")
    
    def test_admin_auth_required_for_article_update(self):
        """PUT /api/admin/articles/{id} - Should require authentication"""
        update_data = {"downloadUrl": "https://example.com/hack.pdf"}
        
        response = requests.put(
            f"{BASE_URL}/api/admin/articles/101",
            json=update_data,
            headers={"Content-Type": "application/json"}
        )
        
        assert response.status_code == 401, f"Expected 401 Unauthorized, got {response.status_code}"
        print("✓ Admin authentication required for article update")


class TestArticleListWithDownloadUrl:
    """Test that downloadUrl is included in article list endpoints"""
    
    def test_get_all_articles_includes_download_url(self):
        """GET /api/articles - Should include downloadUrl in response"""
        response = requests.get(f"{BASE_URL}/api/articles")
        
        assert response.status_code == 200
        
        articles = response.json()
        assert len(articles) > 0, "Should have at least one article"
        
        # Find the test article with downloadUrl
        test_article = next((a for a in articles if a.get("slug") == "test-expose-download"), None)
        
        if test_article:
            assert "downloadUrl" in test_article, "downloadUrl field should be in article list response"
            print(f"✓ Article list includes downloadUrl field")
        else:
            print("⚠ Test article not found in list, but endpoint works")
    
    def test_get_article_by_id_includes_download_url(self):
        """GET /api/articles/id/{id} - Should include downloadUrl"""
        response = requests.get(f"{BASE_URL}/api/articles/id/101")
        
        assert response.status_code == 200
        
        data = response.json()
        assert "downloadUrl" in data, "downloadUrl should be in article by ID response"
        print(f"✓ Article by ID includes downloadUrl: {data.get('downloadUrl')}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
