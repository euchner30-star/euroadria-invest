"""
Test suite for EuroAdria Translation System (DE/EN)
Tests the /api/translate endpoints and translation functionality
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://roi-calc-preview.preview.emergentagent.com').rstrip('/')


class TestTranslateEndpoint:
    """Tests for /api/translate endpoint"""
    
    def test_translate_german_to_english(self):
        """Test basic German to English translation"""
        response = requests.post(
            f"{BASE_URL}/api/translate",
            json={"text": "Hallo Welt", "source": "de", "target": "en"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "translatedText" in data
        assert data["source"] == "de"
        assert data["target"] == "en"
        # Check translation is reasonable
        assert "hello" in data["translatedText"].lower() or "world" in data["translatedText"].lower()
        print(f"Translated 'Hallo Welt' -> '{data['translatedText']}'")
    
    def test_translate_english_to_german(self):
        """Test basic English to German translation"""
        response = requests.post(
            f"{BASE_URL}/api/translate",
            json={"text": "Hello World", "source": "en", "target": "de"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "translatedText" in data
        assert data["source"] == "en"
        assert data["target"] == "de"
        print(f"Translated 'Hello World' -> '{data['translatedText']}'")
    
    def test_translate_longer_text(self):
        """Test translation of longer text"""
        text = "Firmengründung, Aufenthalt und Investments in Montenegro"
        response = requests.post(
            f"{BASE_URL}/api/translate",
            json={"text": text, "source": "de", "target": "en"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "translatedText" in data
        # Check that translation contains expected keywords
        translated = data["translatedText"].lower()
        assert "montenegro" in translated
        print(f"Translated longer text -> '{data['translatedText']}'")
    
    def test_translate_same_language(self):
        """Test that same source/target returns original text"""
        text = "Test text"
        response = requests.post(
            f"{BASE_URL}/api/translate",
            json={"text": text, "source": "en", "target": "en"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["translatedText"] == text
    
    def test_translate_empty_text(self):
        """Test that empty text returns empty"""
        response = requests.post(
            f"{BASE_URL}/api/translate",
            json={"text": "", "source": "de", "target": "en"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["translatedText"] == ""


class TestTranslateBatchEndpoint:
    """Tests for /api/translate/batch endpoint"""
    
    def test_batch_translate(self):
        """Test batch translation of multiple texts"""
        texts = ["Hallo", "Investition", "Immobilien"]
        response = requests.post(
            f"{BASE_URL}/api/translate/batch",
            json={"texts": texts, "source": "de", "target": "en"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "translations" in data
        assert len(data["translations"]) == len(texts)
        assert data["source"] == "de"
        assert data["target"] == "en"
        print(f"Batch translated: {texts} -> {data['translations']}")
    
    def test_batch_translate_empty_list(self):
        """Test batch translation with empty list"""
        response = requests.post(
            f"{BASE_URL}/api/translate/batch",
            json={"texts": [], "source": "de", "target": "en"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["translations"] == []


class TestTranslateArticleEndpoint:
    """Tests for /api/translate/article/{slug} endpoint"""
    
    def test_translate_article_not_found(self):
        """Test that non-existent article returns 404"""
        response = requests.get(
            f"{BASE_URL}/api/translate/article/non-existent-article?target=en"
        )
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()


class TestHealthEndpoint:
    """Test health endpoint to verify API is running"""
    
    def test_health_check(self):
        """Test that health endpoint returns ok"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        print(f"Health check: {data}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
