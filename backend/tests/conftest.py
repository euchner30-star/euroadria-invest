import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', 'https://page-builder-dev-1.preview.emergentagent.com').rstrip('/')

ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "euroadria2025"

@pytest.fixture
def api_client():
    """Shared requests session"""
    session = requests.Session()
    session.headers.update({"Content-Type": "application/json"})
    return session

@pytest.fixture
def auth_headers():
    """Return basic auth headers for admin"""
    import base64
    credentials = base64.b64encode(f"{ADMIN_USERNAME}:{ADMIN_PASSWORD}".encode()).decode()
    return {"Authorization": f"Basic {credentials}"}

@pytest.fixture
def base_url():
    """Return base URL"""
    return BASE_URL
