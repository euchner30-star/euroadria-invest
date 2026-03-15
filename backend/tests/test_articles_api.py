"""
Backend API tests for EuroAdria CMS
Tests article CRUD operations and cluster/category endpoints
"""
import pytest
import requests

class TestPublicArticlesAPI:
    """Tests for public article endpoints"""
    
    def test_get_all_articles(self, api_client, base_url):
        """Test GET /api/articles returns articles list"""
        response = api_client.get(f"{base_url}/api/articles")
        assert response.status_code == 200
        articles = response.json()
        assert isinstance(articles, list)
        assert len(articles) >= 15  # Should have 15+ pillar articles
        
        # Verify article structure
        first_article = articles[0]
        assert "id" in first_article
        assert "title" in first_article
        assert "slug" in first_article
        assert "cluster" in first_article
        assert "category" in first_article
        assert "content" in first_article
    
    def test_get_articles_by_cluster(self, api_client, base_url):
        """Test filtering articles by cluster"""
        response = api_client.get(f"{base_url}/api/articles?cluster=A")
        assert response.status_code == 200
        articles = response.json()
        assert isinstance(articles, list)
        assert len(articles) >= 1
        
        # All articles should be cluster A
        for article in articles:
            assert article["cluster"] == "A"
    
    def test_get_featured_articles(self, api_client, base_url):
        """Test filtering featured articles"""
        response = api_client.get(f"{base_url}/api/articles?featured=true")
        assert response.status_code == 200
        articles = response.json()
        assert isinstance(articles, list)
        assert len(articles) >= 1
        
        # All should be featured
        for article in articles:
            assert article["featured"] is True
    
    def test_get_article_by_slug(self, api_client, base_url):
        """Test GET /api/articles/{slug} returns single article"""
        slug = "balkans-vs-eu-investing-reality-check"
        response = api_client.get(f"{base_url}/api/articles/{slug}")
        assert response.status_code == 200
        
        article = response.json()
        assert article["slug"] == slug
        assert article["title"] == "Balkan vs. EU Investment: Der ultimative Risiko-Rendite-Realitätscheck 2025"
        assert article["cluster"] == "A"
        assert "content" in article
        assert len(article["content"]) > 100  # Has substantial content
    
    def test_get_nonexistent_article_returns_404(self, api_client, base_url):
        """Test GET /api/articles/{slug} returns 404 for nonexistent slug"""
        response = api_client.get(f"{base_url}/api/articles/nonexistent-slug-xyz")
        assert response.status_code == 404
    
    def test_get_article_by_id(self, api_client, base_url):
        """Test GET /api/articles/id/{article_id}"""
        response = api_client.get(f"{base_url}/api/articles/id/101")
        assert response.status_code == 200
        
        article = response.json()
        assert article["id"] == 101
        assert "title" in article


class TestClustersAndCategoriesAPI:
    """Tests for clusters and categories endpoints"""
    
    def test_get_clusters(self, api_client, base_url):
        """Test GET /api/clusters returns cluster list with counts"""
        response = api_client.get(f"{base_url}/api/clusters")
        assert response.status_code == 200
        
        clusters = response.json()
        assert isinstance(clusters, list)
        assert len(clusters) == 6  # A, B, C, D, E, F
        
        # Verify structure
        cluster_ids = [c["cluster"] for c in clusters]
        assert set(cluster_ids) == {"A", "B", "C", "D", "E", "F"}
        
        for cluster in clusters:
            assert "cluster" in cluster
            assert "count" in cluster
            assert cluster["count"] >= 1
    
    def test_get_categories(self, api_client, base_url):
        """Test GET /api/categories returns categories with counts"""
        response = api_client.get(f"{base_url}/api/categories")
        assert response.status_code == 200
        
        categories = response.json()
        assert isinstance(categories, list)
        assert len(categories) >= 1
        
        # Verify structure
        for category in categories:
            assert "category" in category
            assert "count" in category


class TestAdminAPI:
    """Tests for admin protected endpoints"""
    
    def test_admin_verify_with_valid_credentials(self, api_client, base_url, auth_headers):
        """Test admin verification with valid credentials"""
        response = api_client.get(f"{base_url}/api/admin/verify", headers=auth_headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data["authenticated"] is True
        assert data["username"] == "admin"
    
    def test_admin_verify_with_invalid_credentials(self, api_client, base_url):
        """Test admin verification rejects invalid credentials"""
        import base64
        invalid_creds = base64.b64encode("admin:wrongpassword".encode()).decode()
        headers = {"Authorization": f"Basic {invalid_creds}"}
        
        response = api_client.get(f"{base_url}/api/admin/verify", headers=headers)
        assert response.status_code == 401
    
    def test_admin_endpoint_requires_auth(self, api_client, base_url):
        """Test admin endpoints require authentication"""
        response = api_client.post(f"{base_url}/api/admin/articles", json={
            "cluster": "A",
            "title": "Test",
            "slug": "test",
            "excerpt": "Test",
            "content": "Test",
            "image": "https://example.com/img.jpg",
            "category": "Test",
            "date": "2025-01-01",
            "readTime": "5 min",
            "author": "Test"
        })
        assert response.status_code == 401


class TestArticleCRUD:
    """Tests for article CRUD operations via admin API"""
    
    def test_create_update_delete_article(self, api_client, base_url, auth_headers):
        """Test full CRUD cycle for an article"""
        import time
        test_slug = f"test-article-{int(time.time())}"
        
        # CREATE
        create_data = {
            "cluster": "A",
            "title": "TEST_Article Title for Testing",
            "slug": test_slug,
            "excerpt": "This is a test article excerpt",
            "content": "This is the test article content. It should be long enough.",
            "image": "https://images.unsplash.com/photo-1517048676732-d65bc937f952",
            "category": "Makro & Strategie",
            "date": "2025-03-14",
            "readTime": "5 min",
            "featured": False,
            "author": "Test Author"
        }
        
        response = api_client.post(f"{base_url}/api/admin/articles", 
                                   json=create_data, 
                                   headers=auth_headers)
        assert response.status_code == 200
        created = response.json()
        article_id = created["id"]
        assert created["title"] == "TEST_Article Title for Testing"
        assert created["slug"] == test_slug
        
        # VERIFY CREATE - GET by slug
        response = api_client.get(f"{base_url}/api/articles/{test_slug}")
        assert response.status_code == 200
        fetched = response.json()
        assert fetched["title"] == "TEST_Article Title for Testing"
        
        # UPDATE
        update_data = {"title": "TEST_Updated Article Title"}
        response = api_client.put(f"{base_url}/api/admin/articles/{article_id}",
                                  json=update_data,
                                  headers=auth_headers)
        assert response.status_code == 200
        updated = response.json()
        assert updated["title"] == "TEST_Updated Article Title"
        
        # VERIFY UPDATE - GET again
        response = api_client.get(f"{base_url}/api/articles/{test_slug}")
        assert response.status_code == 200
        fetched = response.json()
        assert fetched["title"] == "TEST_Updated Article Title"
        
        # DELETE
        response = api_client.delete(f"{base_url}/api/admin/articles/{article_id}",
                                     headers=auth_headers)
        assert response.status_code == 200
        
        # VERIFY DELETE - should return 404
        response = api_client.get(f"{base_url}/api/articles/{test_slug}")
        assert response.status_code == 404
    
    def test_create_duplicate_slug_fails(self, api_client, base_url, auth_headers):
        """Test that creating article with existing slug fails"""
        # Use existing slug
        create_data = {
            "cluster": "A",
            "title": "Duplicate Test",
            "slug": "balkans-vs-eu-investing-reality-check",  # Already exists
            "excerpt": "Test",
            "content": "Test content",
            "image": "https://example.com/img.jpg",
            "category": "Makro & Strategie",
            "date": "2025-01-01",
            "readTime": "5 min",
            "author": "Test"
        }
        
        response = api_client.post(f"{base_url}/api/admin/articles",
                                   json=create_data,
                                   headers=auth_headers)
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"].lower()
