"""
Test Reddit/Quora Traffic Source Tracking
Tests the fix for Reddit/Quora UTM normalization in analytics pipelines.
"""
import pytest
import requests
import os
import time

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
ADMIN_USER = "admin"
ADMIN_PASS = "euroadria2025"


class TestRedditQuoraTracking:
    """Test Reddit and Quora traffic source tracking in analytics"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Reset analytics before each test class"""
        # Reset analytics to start fresh
        response = requests.delete(
            f"{BASE_URL}/api/admin/analytics/reset",
            auth=(ADMIN_USER, ADMIN_PASS)
        )
        assert response.status_code == 200, f"Failed to reset analytics: {response.text}"
        print(f"Analytics reset: {response.json()}")
        yield
    
    def _track_pageview(self, utm_source="", utm_medium="", utm_campaign="", referrer=""):
        """Helper to track a pageview"""
        payload = {
            "path": "/test-page",
            "referrer": referrer,
            "user_agent": "Mozilla/5.0 Test Agent",
            "utm_source": utm_source,
            "utm_medium": utm_medium,
            "utm_campaign": utm_campaign
        }
        response = requests.post(f"{BASE_URL}/api/track/pageview", json=payload)
        return response
    
    def _get_analytics(self, days=1):
        """Helper to get analytics overview"""
        response = requests.get(
            f"{BASE_URL}/api/admin/analytics/overview?days={days}",
            auth=(ADMIN_USER, ADMIN_PASS)
        )
        return response
    
    def _find_source_in_referrers(self, referrers, source_name):
        """Find a source in the referrers list"""
        for r in referrers:
            if r.get("source") == source_name:
                return r
        return None
    
    def _find_source_in_utm_sources(self, utm_sources, source_name):
        """Find a source in the utm_sources list"""
        for u in utm_sources:
            if u.get("source") == source_name:
                return u
        return None

    # ============ Reddit UTM Source Tests ============
    
    def test_reddit_lowercase_utm_source(self):
        """POST /api/track/pageview with utm_source=reddit should be categorized as 'Reddit'"""
        # Track pageview with lowercase reddit
        response = self._track_pageview(utm_source="reddit", utm_medium="cpc", utm_campaign="test")
        assert response.status_code == 200, f"Track failed: {response.text}"
        
        # Get analytics
        analytics = self._get_analytics()
        assert analytics.status_code == 200, f"Analytics failed: {analytics.text}"
        
        data = analytics.json()
        referrers = data.get("referrers", [])
        utm_sources = data.get("utm_sources", [])
        
        print(f"Referrers: {referrers}")
        print(f"UTM Sources: {utm_sources}")
        
        # Check referrers contains Reddit
        reddit_ref = self._find_source_in_referrers(referrers, "Reddit")
        assert reddit_ref is not None, f"Reddit not found in referrers. Got: {referrers}"
        assert reddit_ref["count"] >= 1, f"Reddit count should be >= 1, got {reddit_ref['count']}"
        
        # Check utm_sources contains Reddit
        reddit_utm = self._find_source_in_utm_sources(utm_sources, "Reddit")
        assert reddit_utm is not None, f"Reddit not found in utm_sources. Got: {utm_sources}"
        print("PASS: utm_source=reddit correctly categorized as 'Reddit'")
    
    def test_reddit_uppercase_utm_source(self):
        """POST /api/track/pageview with utm_source=Reddit (uppercase) should also be 'Reddit'"""
        response = self._track_pageview(utm_source="Reddit", utm_medium="social", utm_campaign="test")
        assert response.status_code == 200
        
        analytics = self._get_analytics()
        assert analytics.status_code == 200
        
        data = analytics.json()
        referrers = data.get("referrers", [])
        
        print(f"Referrers: {referrers}")
        
        reddit_ref = self._find_source_in_referrers(referrers, "Reddit")
        assert reddit_ref is not None, f"Reddit (uppercase) not found in referrers. Got: {referrers}"
        print("PASS: utm_source=Reddit (uppercase) correctly categorized as 'Reddit'")
    
    def test_reddit_referrer_detection(self):
        """POST /api/track/pageview with referrer containing 'reddit.com' should be 'Reddit'"""
        response = self._track_pageview(referrer="https://www.reddit.com/r/investing/comments/abc123")
        assert response.status_code == 200
        
        analytics = self._get_analytics()
        assert analytics.status_code == 200
        
        data = analytics.json()
        referrers = data.get("referrers", [])
        
        print(f"Referrers: {referrers}")
        
        reddit_ref = self._find_source_in_referrers(referrers, "Reddit")
        assert reddit_ref is not None, f"Reddit (from referrer) not found. Got: {referrers}"
        print("PASS: referrer=reddit.com correctly categorized as 'Reddit'")
    
    def test_reddit_out_referrer_detection(self):
        """POST /api/track/pageview with referrer containing 'out.reddit.com' should be 'Reddit'"""
        response = self._track_pageview(referrer="https://out.reddit.com/t3_abc123?url=https://example.com")
        assert response.status_code == 200
        
        analytics = self._get_analytics()
        assert analytics.status_code == 200
        
        data = analytics.json()
        referrers = data.get("referrers", [])
        
        print(f"Referrers: {referrers}")
        
        reddit_ref = self._find_source_in_referrers(referrers, "Reddit")
        assert reddit_ref is not None, f"Reddit (from out.reddit.com) not found. Got: {referrers}"
        print("PASS: referrer=out.reddit.com correctly categorized as 'Reddit'")

    # ============ Quora UTM Source Tests ============
    
    def test_quora_lowercase_utm_source(self):
        """POST /api/track/pageview with utm_source=quora should be categorized as 'Quora'"""
        response = self._track_pageview(utm_source="quora", utm_medium="answer", utm_campaign="test")
        assert response.status_code == 200
        
        analytics = self._get_analytics()
        assert analytics.status_code == 200
        
        data = analytics.json()
        referrers = data.get("referrers", [])
        utm_sources = data.get("utm_sources", [])
        
        print(f"Referrers: {referrers}")
        print(f"UTM Sources: {utm_sources}")
        
        quora_ref = self._find_source_in_referrers(referrers, "Quora")
        assert quora_ref is not None, f"Quora not found in referrers. Got: {referrers}"
        
        quora_utm = self._find_source_in_utm_sources(utm_sources, "Quora")
        assert quora_utm is not None, f"Quora not found in utm_sources. Got: {utm_sources}"
        print("PASS: utm_source=quora correctly categorized as 'Quora'")
    
    def test_quora_referrer_detection(self):
        """POST /api/track/pageview with referrer containing 'quora.com' should be 'Quora'"""
        response = self._track_pageview(referrer="https://www.quora.com/What-is-the-best-investment")
        assert response.status_code == 200
        
        analytics = self._get_analytics()
        assert analytics.status_code == 200
        
        data = analytics.json()
        referrers = data.get("referrers", [])
        
        print(f"Referrers: {referrers}")
        
        quora_ref = self._find_source_in_referrers(referrers, "Quora")
        assert quora_ref is not None, f"Quora (from referrer) not found. Got: {referrers}"
        print("PASS: referrer=quora.com correctly categorized as 'Quora'")


class TestOGRedirectRefParam:
    """Test OG redirect with ?ref= parameter for Reddit/Quora"""
    
    def test_og_redirect_ref_rd(self):
        """GET /api/og/blog/{slug}?ref=rd should redirect with utm_source=reddit"""
        slug = "skadar-lake-montenegro-naturwunder"
        response = requests.get(
            f"{BASE_URL}/api/og/blog/{slug}?ref=rd",
            allow_redirects=False
        )
        assert response.status_code == 200, f"OG endpoint failed: {response.status_code}"
        
        html = response.text
        print(f"OG HTML (first 500 chars): {html[:500]}")
        
        # Check that the redirect URL contains utm_source=reddit
        assert "utm_source=reddit" in html, f"utm_source=reddit not found in OG HTML"
        assert "utm_medium=social" in html, f"utm_medium=social not found in OG HTML"
        print("PASS: ?ref=rd correctly converts to utm_source=reddit")
    
    def test_og_redirect_ref_reddit_full(self):
        """GET /api/og/blog/{slug}?ref=reddit should redirect with utm_source=reddit"""
        slug = "skadar-lake-montenegro-naturwunder"
        response = requests.get(
            f"{BASE_URL}/api/og/blog/{slug}?ref=reddit",
            allow_redirects=False
        )
        assert response.status_code == 200
        
        html = response.text
        print(f"OG HTML (first 500 chars): {html[:500]}")
        
        # ref=reddit should fallback to utm_source=reddit (raw value)
        assert "utm_source=reddit" in html, f"utm_source=reddit not found in OG HTML"
        print("PASS: ?ref=reddit correctly converts to utm_source=reddit")
    
    def test_og_redirect_ref_qu(self):
        """GET /api/og/blog/{slug}?ref=qu should redirect with utm_source=quora"""
        slug = "skadar-lake-montenegro-naturwunder"
        response = requests.get(
            f"{BASE_URL}/api/og/blog/{slug}?ref=qu",
            allow_redirects=False
        )
        assert response.status_code == 200
        
        html = response.text
        print(f"OG HTML (first 500 chars): {html[:500]}")
        
        assert "utm_source=quora" in html, f"utm_source=quora not found in OG HTML"
        print("PASS: ?ref=qu correctly converts to utm_source=quora")


class TestCombinedTrackingFlow:
    """Test combined tracking flow - multiple sources in one analytics view"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Reset analytics before test"""
        response = requests.delete(
            f"{BASE_URL}/api/admin/analytics/reset",
            auth=(ADMIN_USER, ADMIN_PASS)
        )
        assert response.status_code == 200
        yield
    
    def test_multiple_sources_tracked_correctly(self):
        """Track multiple sources and verify all are categorized correctly"""
        # Track Reddit (lowercase)
        r1 = requests.post(f"{BASE_URL}/api/track/pageview", json={
            "path": "/test1", "referrer": "", "user_agent": "Test",
            "utm_source": "reddit", "utm_medium": "cpc", "utm_campaign": "test1"
        })
        assert r1.status_code == 200
        
        # Track Reddit (uppercase)
        r2 = requests.post(f"{BASE_URL}/api/track/pageview", json={
            "path": "/test2", "referrer": "", "user_agent": "Test",
            "utm_source": "Reddit", "utm_medium": "social", "utm_campaign": "test2"
        })
        assert r2.status_code == 200
        
        # Track Quora
        r3 = requests.post(f"{BASE_URL}/api/track/pageview", json={
            "path": "/test3", "referrer": "", "user_agent": "Test",
            "utm_source": "quora", "utm_medium": "answer", "utm_campaign": "test3"
        })
        assert r3.status_code == 200
        
        # Track from Reddit referrer
        r4 = requests.post(f"{BASE_URL}/api/track/pageview", json={
            "path": "/test4", "referrer": "https://reddit.com/r/test", "user_agent": "Test",
            "utm_source": "", "utm_medium": "", "utm_campaign": ""
        })
        assert r4.status_code == 200
        
        # Track from Quora referrer
        r5 = requests.post(f"{BASE_URL}/api/track/pageview", json={
            "path": "/test5", "referrer": "https://quora.com/question", "user_agent": "Test",
            "utm_source": "", "utm_medium": "", "utm_campaign": ""
        })
        assert r5.status_code == 200
        
        # Get analytics
        analytics = requests.get(
            f"{BASE_URL}/api/admin/analytics/overview?days=1",
            auth=(ADMIN_USER, ADMIN_PASS)
        )
        assert analytics.status_code == 200
        
        data = analytics.json()
        referrers = data.get("referrers", [])
        utm_sources = data.get("utm_sources", [])
        
        print(f"Total views: {data.get('total_views')}")
        print(f"Referrers: {referrers}")
        print(f"UTM Sources: {utm_sources}")
        
        # Find Reddit and Quora in referrers
        reddit_count = 0
        quora_count = 0
        for r in referrers:
            if r.get("source") == "Reddit":
                reddit_count = r.get("count", 0)
            elif r.get("source") == "Quora":
                quora_count = r.get("count", 0)
        
        # Reddit should have 3 (2 UTM + 1 referrer)
        assert reddit_count >= 3, f"Expected Reddit count >= 3, got {reddit_count}"
        # Quora should have 2 (1 UTM + 1 referrer)
        assert quora_count >= 2, f"Expected Quora count >= 2, got {quora_count}"
        
        print(f"PASS: Reddit count={reddit_count}, Quora count={quora_count}")


class TestWhatsAppTelegramTracking:
    """Test WhatsApp and Telegram tracking (also added in the fix)"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Reset analytics before test"""
        response = requests.delete(
            f"{BASE_URL}/api/admin/analytics/reset",
            auth=(ADMIN_USER, ADMIN_PASS)
        )
        assert response.status_code == 200
        yield
    
    def test_whatsapp_utm_source(self):
        """Test WhatsApp UTM source tracking"""
        response = requests.post(f"{BASE_URL}/api/track/pageview", json={
            "path": "/test", "referrer": "", "user_agent": "Test",
            "utm_source": "whatsapp", "utm_medium": "chat", "utm_campaign": "share"
        })
        assert response.status_code == 200
        
        analytics = requests.get(
            f"{BASE_URL}/api/admin/analytics/overview?days=1",
            auth=(ADMIN_USER, ADMIN_PASS)
        )
        data = analytics.json()
        referrers = data.get("referrers", [])
        
        whatsapp_found = any(r.get("source") == "WhatsApp" for r in referrers)
        assert whatsapp_found, f"WhatsApp not found in referrers: {referrers}"
        print("PASS: WhatsApp tracking works")
    
    def test_telegram_utm_source(self):
        """Test Telegram UTM source tracking"""
        response = requests.post(f"{BASE_URL}/api/track/pageview", json={
            "path": "/test", "referrer": "", "user_agent": "Test",
            "utm_source": "telegram", "utm_medium": "chat", "utm_campaign": "share"
        })
        assert response.status_code == 200
        
        analytics = requests.get(
            f"{BASE_URL}/api/admin/analytics/overview?days=1",
            auth=(ADMIN_USER, ADMIN_PASS)
        )
        data = analytics.json()
        referrers = data.get("referrers", [])
        
        telegram_found = any(r.get("source") == "Telegram" for r in referrers)
        assert telegram_found, f"Telegram not found in referrers: {referrers}"
        print("PASS: Telegram tracking works")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
