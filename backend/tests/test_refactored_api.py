"""
Comprehensive API tests for EuroAdria refactored backend.
Tests all endpoints after the monolithic server.py was split into modular route files.
"""
import pytest
import requests
import os
from base64 import b64encode

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "euroadria2025"


def get_auth_header():
    """Get HTTP Basic Auth header for admin endpoints"""
    credentials = b64encode(f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}".encode()).decode()
    return {"Authorization": f"Basic {credentials}"}


class TestHealthAndRoot:
    """Test health check and root endpoints"""
    
    def test_health_check(self):
        """GET /api/health - should return status ok and db connected"""
        response = requests.get(f"{BASE_URL}/api/health", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "db" in data
        print(f"✓ Health check passed: {data}")
    
    def test_root_endpoint(self):
        """GET /api/ - root endpoint returns Hello World"""
        response = requests.get(f"{BASE_URL}/api/", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data["message"] == "Hello World"
        print(f"✓ Root endpoint passed: {data}")


class TestLocationsEndpoints:
    """Test investment locations endpoints"""
    
    def test_get_all_locations(self):
        """GET /api/locations - returns list of locations"""
        response = requests.get(f"{BASE_URL}/api/locations", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Locations returned: {len(data)} locations")
        # Verify structure of first location if exists
        if data:
            loc = data[0]
            assert "city" in loc
            assert "country" in loc
            assert "investment_score" in loc
    
    def test_get_single_location(self):
        """GET /api/locations/Podgorica - returns single location"""
        response = requests.get(f"{BASE_URL}/api/locations/Podgorica", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert data["city"].lower() == "podgorica"
        assert "investment_score" in data
        assert "infrastructure_boost" in data
        print(f"✓ Single location passed: {data['city']}")


class TestInfrastructureEndpoints:
    """Test infrastructure projects endpoints"""
    
    def test_get_infrastructure(self):
        """GET /api/infrastructure - returns infrastructure projects"""
        response = requests.get(f"{BASE_URL}/api/infrastructure", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Infrastructure projects returned: {len(data)} projects")


class TestZonesEndpoints:
    """Test opportunity zones endpoints"""
    
    def test_get_zones(self):
        """GET /api/zones - returns opportunity zones"""
        response = requests.get(f"{BASE_URL}/api/zones", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Opportunity zones returned: {len(data)} zones")


class TestCalculatorEndpoints:
    """Test ROI calculator and simulation endpoints"""
    
    def test_roi_calculation(self):
        """POST /api/calculator/roi - ROI calculation"""
        payload = {
            "purchase_price": 200000,
            "monthly_rent": 1200,
            "renovation_costs": 10000,
            "additional_costs_percent": 5,
            "running_costs_percent": 15,
            "vacancy_rate": 5
        }
        response = requests.post(f"{BASE_URL}/api/calculator/roi", json=payload, timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "roi_percent" in data
        assert "net_yield_percent" in data
        assert "annual_cashflow" in data
        print(f"✓ ROI calculation passed: roi_percent={data['roi_percent']:.2f}%")
    
    def test_investment_simulation(self):
        """POST /api/calculator/simulation - Investment simulation"""
        payload = {
            "purchase_price": 200000,
            "monthly_rent": 1200,
            "renovation_costs": 10000,
            "additional_costs_percent": 5,
            "running_costs_percent": 15,
            "vacancy_rate": 5,
            "rent_increase_percent": 3,
            "appreciation_percent": 5,
            "holding_period": 10,
            "equity_percent": 100,
            "mortgage_rate": 4,
            "discount_rate": 5
        }
        response = requests.post(f"{BASE_URL}/api/calculator/simulation", json=payload, timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "irr_percent" in data
        assert "npv" in data
        assert "total_profit" in data
        assert "yearly_data" in data
        assert len(data["yearly_data"]) == 10
        print(f"✓ Simulation passed: IRR={data['irr_percent']:.2f}%, NPV={data['npv']:.0f}")
    
    def test_expose_pdf_generation(self):
        """POST /api/calculator/expose-pdf - PDF generation returns PDF bytes"""
        payload = {
            "purchase_price": 200000,
            "monthly_rent": 1200,
            "renovation_costs": 10000,
            "additional_costs_percent": 5,
            "running_costs_percent": 15,
            "vacancy_rate": 5,
            "rent_increase_percent": 3,
            "appreciation_percent": 5,
            "holding_period": 10,
            "equity_percent": 100,
            "mortgage_rate": 4,
            "discount_rate": 5
        }
        response = requests.post(f"{BASE_URL}/api/calculator/expose-pdf", json=payload, timeout=30)
        assert response.status_code == 200
        assert response.headers.get("content-type") == "application/pdf"
        assert len(response.content) > 1000  # PDF should be substantial
        print(f"✓ PDF generation passed: {len(response.content)} bytes")


class TestArticlesEndpoints:
    """Test articles and blog endpoints"""
    
    def test_get_articles(self):
        """GET /api/articles - returns articles list"""
        response = requests.get(f"{BASE_URL}/api/articles", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Articles returned: {len(data)} articles")
    
    def test_get_articles_list_paginated(self):
        """GET /api/articles/list - paginated articles"""
        response = requests.get(f"{BASE_URL}/api/articles/list?page=1&limit=5", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "articles" in data
        assert "total" in data
        assert "page" in data
        assert "totalPages" in data
        print(f"✓ Paginated articles: {len(data['articles'])} of {data['total']} total")
    
    def test_get_clusters(self):
        """GET /api/clusters - article clusters"""
        response = requests.get(f"{BASE_URL}/api/clusters", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Clusters returned: {len(data)} clusters")
    
    def test_get_categories(self):
        """GET /api/categories - article categories"""
        response = requests.get(f"{BASE_URL}/api/categories", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Categories returned: {len(data)} categories")


class TestSitemapEndpoint:
    """Test sitemap generation"""
    
    def test_sitemap_xml(self):
        """GET /api/sitemap.xml - dynamic sitemap XML"""
        response = requests.get(f"{BASE_URL}/api/sitemap.xml", timeout=10)
        assert response.status_code == 200
        assert "application/xml" in response.headers.get("content-type", "")
        assert "<?xml" in response.text
        assert "<urlset" in response.text
        assert "euroadria.me" in response.text
        print(f"✓ Sitemap XML generated: {len(response.text)} chars")


class TestRegionsEndpoints:
    """Test regions endpoints"""
    
    def test_get_regions(self):
        """GET /api/regions - public regions"""
        response = requests.get(f"{BASE_URL}/api/regions", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Regions returned: {len(data)} regions")


class TestPagesEndpoints:
    """Test CMS pages endpoints"""
    
    def test_get_pages(self):
        """GET /api/pages - CMS pages"""
        response = requests.get(f"{BASE_URL}/api/pages", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Pages returned: {len(data)} pages")
    
    def test_get_home_page(self):
        """GET /api/pages/home - home page with defaults"""
        response = requests.get(f"{BASE_URL}/api/pages/home", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "title" in data or "slug" in data
        print(f"✓ Home page returned")


class TestEventsEndpoints:
    """Test events endpoints"""
    
    def test_get_events(self):
        """GET /api/events - events list"""
        response = requests.get(f"{BASE_URL}/api/events", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Events returned: {len(data)} events")
    
    def test_get_leistungen_content(self):
        """GET /api/leistungen-content - Leistungen CMS content"""
        response = requests.get(f"{BASE_URL}/api/leistungen-content", timeout=10)
        assert response.status_code == 200
        data = response.json()
        # Should return content or empty object
        assert isinstance(data, (dict, list))
        print(f"✓ Leistungen content returned")


class TestSettingsEndpoints:
    """Test site settings endpoints"""
    
    def test_get_homepage_settings(self):
        """GET /api/settings/homepage - homepage settings"""
        response = requests.get(f"{BASE_URL}/api/settings/homepage", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "hero_title" in data
        assert "hero_subtitle" in data
        print(f"✓ Homepage settings returned")
    
    def test_get_download_settings(self):
        """GET /api/settings/downloads - download settings"""
        response = requests.get(f"{BASE_URL}/api/settings/downloads", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"✓ Download settings returned")
    
    def test_get_legal_impressum(self):
        """GET /api/settings/legal/impressum - legal page"""
        response = requests.get(f"{BASE_URL}/api/settings/legal/impressum", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "content" in data
        print(f"✓ Impressum legal page returned")


class TestDashboardEndpoints:
    """Test dashboard endpoints"""
    
    def test_get_dashboard_stats(self):
        """GET /api/dashboard/stats - dashboard statistics"""
        response = requests.get(f"{BASE_URL}/api/dashboard/stats", timeout=10)
        assert response.status_code == 200
        data = response.json()
        assert "total_locations" in data
        assert "total_infrastructure" in data
        assert "total_zones" in data
        print(f"✓ Dashboard stats: {data['total_locations']} locations, {data['total_infrastructure']} infra projects")


class TestYouTubeEndpoint:
    """Test YouTube API endpoint"""
    
    def test_get_youtube_latest(self):
        """GET /api/youtube/latest - YouTube API endpoint"""
        response = requests.get(f"{BASE_URL}/api/youtube/latest", timeout=15)
        # May return 200 with videos or 500/502 if API key issue
        if response.status_code == 200:
            data = response.json()
            assert "videos" in data
            assert "channelUrl" in data
            print(f"✓ YouTube videos returned: {len(data['videos'])} videos")
        else:
            print(f"⚠ YouTube API returned {response.status_code} (may be API key issue)")
            # Don't fail test - YouTube API may have quota issues
            pytest.skip("YouTube API unavailable")


class TestTranslateEndpoints:
    """Test translation endpoints"""
    
    def test_translate_text(self):
        """POST /api/translate - translation endpoint"""
        payload = {
            "text": "Hallo Welt",
            "source": "de",
            "target": "en"
        }
        response = requests.post(f"{BASE_URL}/api/translate", json=payload, timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert "translatedText" in data
        print(f"✓ Translation: '{payload['text']}' -> '{data['translatedText']}'")
    
    def test_translate_batch(self):
        """POST /api/translate/batch - batch translation"""
        payload = {
            "texts": ["Hallo", "Welt", "Test"],
            "source": "de",
            "target": "en"
        }
        response = requests.post(f"{BASE_URL}/api/translate/batch", json=payload, timeout=20)
        assert response.status_code == 200
        data = response.json()
        assert "translations" in data
        assert len(data["translations"]) == 3
        print(f"✓ Batch translation: {len(data['translations'])} texts translated")


class TestAdminAuthEndpoints:
    """Test admin authentication and protected endpoints"""
    
    def test_admin_verify(self):
        """GET /api/admin/verify - admin authentication (Basic Auth)"""
        response = requests.get(
            f"{BASE_URL}/api/admin/verify",
            headers=get_auth_header(),
            timeout=10
        )
        assert response.status_code == 200
        print(f"✓ Admin verify passed")
    
    def test_admin_verify_unauthorized(self):
        """GET /api/admin/verify - should fail without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/verify", timeout=10)
        assert response.status_code == 401
        print(f"✓ Admin verify correctly rejects unauthorized")


class TestCRMEndpoints:
    """Test CRM pipeline endpoints"""
    
    def test_get_crm_stages(self):
        """GET /api/admin/crm/stages - CRM pipeline stages"""
        response = requests.get(
            f"{BASE_URL}/api/admin/crm/stages",
            headers=get_auth_header(),
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ CRM stages returned: {len(data)} stages")
    
    def test_get_crm_leads(self):
        """GET /api/admin/crm/leads - CRM leads list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/crm/leads",
            headers=get_auth_header(),
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ CRM leads returned: {len(data)} leads")
    
    def test_get_crm_deals(self):
        """GET /api/admin/crm/deals - CRM deals list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/crm/deals",
            headers=get_auth_header(),
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ CRM deals returned: {len(data)} deals")
    
    def test_get_crm_stats(self):
        """GET /api/admin/crm/stats - CRM statistics"""
        response = requests.get(
            f"{BASE_URL}/api/admin/crm/stats",
            headers=get_auth_header(),
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert "total_leads" in data
        assert "active_deals" in data
        assert "pipeline_value" in data
        print(f"✓ CRM stats: {data['total_leads']} leads, {data['active_deals']} active deals")


class TestAnalyticsEndpoints:
    """Test analytics endpoints"""
    
    def test_get_analytics_overview(self):
        """GET /api/admin/analytics/overview?days=30 - analytics dashboard"""
        response = requests.get(
            f"{BASE_URL}/api/admin/analytics/overview?days=30",
            headers=get_auth_header(),
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"✓ Analytics overview returned")


class TestCommentsEndpoints:
    """Test comments endpoints"""
    
    def test_get_admin_comments(self):
        """GET /api/admin/comments - admin comments list"""
        response = requests.get(
            f"{BASE_URL}/api/admin/comments",
            headers=get_auth_header(),
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin comments returned: {len(data)} comments")
    
    def test_get_comments_stats(self):
        """GET /api/admin/comments/stats - comment statistics"""
        response = requests.get(
            f"{BASE_URL}/api/admin/comments/stats",
            headers=get_auth_header(),
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, dict)
        print(f"✓ Comments stats returned")


class TestAdminRegionsAndPages:
    """Test admin regions and pages endpoints"""
    
    def test_get_admin_regions(self):
        """GET /api/admin/regions - admin regions"""
        response = requests.get(
            f"{BASE_URL}/api/admin/regions",
            headers=get_auth_header(),
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Admin regions returned: {len(data)} regions")
    
    def test_get_admin_pages(self):
        """GET /api/admin/pages - admin pages with defaults"""
        response = requests.get(
            f"{BASE_URL}/api/admin/pages",
            headers=get_auth_header(),
            timeout=10
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # Should include default pages (home, team, contact)
        slugs = [p.get("slug") for p in data]
        assert "home" in slugs or any("home" in str(p) for p in data)
        print(f"✓ Admin pages returned: {len(data)} pages")


class TestContactAndLeadEndpoints:
    """Test contact form and lead capture endpoints"""
    
    def test_contact_form_submission(self):
        """POST /api/contact - contact form submission (test with valid data)"""
        payload = {
            "name": "TEST_User",
            "email": "test@example.com",
            "phone": "+49123456789",
            "subject": "Test Anfrage",
            "message": "Dies ist eine Testanfrage vom automatisierten Test.",
            "service": "Sonstiges"
        }
        response = requests.post(f"{BASE_URL}/api/contact", json=payload, timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        assert "message" in data
        print(f"✓ Contact form submission passed: {data['message']}")
    
    def test_lead_capture(self):
        """POST /api/leads - lead capture endpoint"""
        payload = {
            "name": "TEST_Lead",
            "email": "testlead@example.com",
            "phone": "+49123456789",
            "source": "test_automation",
            "expose_name": "Test Exposé"
        }
        response = requests.post(f"{BASE_URL}/api/leads", json=payload, timeout=15)
        assert response.status_code == 200
        data = response.json()
        assert data["success"] == True
        print(f"✓ Lead capture passed")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
