"""
Regression tests for Sveti Stefan property + PDF exposé flow.
Covers: /api/properties (all/by location), /api/properties/pdf/{id}, /api/properties/{id}
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://roi-calc-preview.preview.emergentagent.com").rstrip("/")

SVETI_STEFAN_ID = "6a5f5cd5f3b13d9e661f027b"
BUDVA_ID = "6a5e4c6b671354f252e7d19e"


# ── /api/properties listing ───────────────────────────────────────────

def test_list_all_properties_returns_at_least_2():
    r = requests.get(f"{BASE_URL}/api/properties", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 2, f"Expected at least 2 properties, got {len(data)}"

    titles = {p["title"] for p in data}
    assert any("Sveti Stefan" in p.get("location", "") for p in data), "Sveti Stefan property missing"
    assert any("Budva" == p.get("location") for p in data), "Budva property missing"


def test_list_by_location_sveti_stefan_returns_villa():
    r = requests.get(f"{BASE_URL}/api/properties", params={"location": "Sveti Stefan"}, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert len(data) >= 1
    prop = next((p for p in data if p["_id"] == SVETI_STEFAN_ID), None)
    assert prop is not None, "Šipkov Krš villa not returned for location=Sveti Stefan"
    assert prop["location"] == "Sveti Stefan"
    assert "Šipkov" in prop["title"] or "ipkov" in prop["title"]
    assert prop["property_type"] == "Villa"
    assert prop["published"] is True
    assert prop.get("pdf_expose_id"), "pdf_expose_id must be set"


def test_list_by_location_budva_returns_apartment():
    r = requests.get(f"{BASE_URL}/api/properties", params={"location": "Budva"}, timeout=15)
    assert r.status_code == 200
    data = r.json()
    prop = next((p for p in data if p["_id"] == BUDVA_ID), None)
    assert prop is not None, "Budva apartment not returned for location=Budva"
    assert prop["location"] == "Budva"
    assert prop["price"] == 185000.0


def test_list_by_location_unknown_returns_empty():
    r = requests.get(f"{BASE_URL}/api/properties", params={"location": "NoSuchPlace"}, timeout=15)
    assert r.status_code == 200
    assert r.json() == []


# ── /api/properties/{id} detail ───────────────────────────────────────

def test_get_property_by_id_sveti_stefan():
    r = requests.get(f"{BASE_URL}/api/properties/{SVETI_STEFAN_ID}", timeout=15)
    assert r.status_code == 200
    p = r.json()
    assert p["_id"] == SVETI_STEFAN_ID
    assert p["location"] == "Sveti Stefan"
    assert p["pdf_expose_id"] is not None
    assert p["published"] is True
    assert p["property_type"] == "Villa"
    assert isinstance(p.get("features"), list)


def test_get_property_by_id_invalid_returns_400_or_404():
    r = requests.get(f"{BASE_URL}/api/properties/notarealid", timeout=15)
    assert r.status_code in (400, 404)


# ── /api/properties/pdf/{id} ──────────────────────────────────────────

def test_serve_pdf_sveti_stefan_returns_pdf_bytes():
    r = requests.get(f"{BASE_URL}/api/properties/pdf/{SVETI_STEFAN_ID}", timeout=60)
    assert r.status_code == 200, f"Expected 200, got {r.status_code}: {r.text[:200]}"
    assert r.headers.get("content-type", "").startswith("application/pdf")
    # PDF magic bytes
    assert r.content[:4] == b"%PDF", f"Not a PDF file, got: {r.content[:20]}"
    # Sveti Stefan PDF was reported ~7.9MB — accept anything between 100KB and 20MB
    assert 100_000 < len(r.content) < 20_000_000, f"Unexpected PDF size: {len(r.content)}"
    # Content-Disposition should include filename
    cd = r.headers.get("content-disposition", "")
    assert "filename" in cd


def test_serve_pdf_budva_no_pdf_returns_404():
    r = requests.get(f"{BASE_URL}/api/properties/pdf/{BUDVA_ID}", timeout=15)
    assert r.status_code == 404


def test_serve_pdf_invalid_id_returns_400_or_404():
    r = requests.get(f"{BASE_URL}/api/properties/pdf/notarealid", timeout=15)
    assert r.status_code in (400, 404)


# ── /api/properties filter combinations ───────────────────────────────

def test_filter_property_type_villa():
    r = requests.get(f"{BASE_URL}/api/properties", params={"property_type": "Villa"}, timeout=15)
    assert r.status_code == 200
    for p in r.json():
        assert p["property_type"] == "Villa"


def test_filter_by_status_available():
    r = requests.get(f"{BASE_URL}/api/properties", params={"status": "available"}, timeout=15)
    assert r.status_code == 200
    for p in r.json():
        assert p["status"] == "available"
