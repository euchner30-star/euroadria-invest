"""Translation endpoints (Argos offline + MyMemory fallback)."""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timezone
import hashlib
import requests as http_requests

from core import db
from models import TranslateRequest, TranslateBatchRequest

router = APIRouter()

# Try to import argostranslate (available in dev, not on Render)
_argos_available = False
_argos_de_en = None
_argos_en_de = None

try:
    from argostranslate import package as argos_package, translate as argos_translate
    installed = argos_translate.get_installed_languages()
    lang_codes = {l.code: l for l in installed}
    if "de" in lang_codes and "en" in lang_codes:
        _argos_de_en = lang_codes["de"].get_translation(lang_codes["en"])
        _argos_en_de = lang_codes["en"].get_translation(lang_codes["de"])
        if _argos_de_en and _argos_en_de:
            _argos_available = True
except Exception:
    pass


def _translate_text_argos(text: str, source: str, target: str) -> str:
    if source == "de" and target == "en" and _argos_de_en:
        return _argos_de_en.translate(text)
    elif source == "en" and target == "de" and _argos_en_de:
        return _argos_en_de.translate(text)
    return text


def _translate_text_api(text: str, source: str, target: str) -> str:
    """Fallback: use MyMemory free API (EU-based, DSGVO-friendly)"""
    import re

    if len(text) <= 450:
        try:
            resp = http_requests.get(
                "https://api.mymemory.translated.net/get",
                params={"q": text, "langpair": f"{source}|{target}"},
                timeout=10
            )
            if resp.ok:
                data = resp.json()
                translated = data.get("responseData", {}).get("translatedText", "")
                if translated and translated.upper() != text.upper():
                    return translated
        except Exception:
            pass
        return text

    html_pattern = r'(<(?:p|h[1-6]|li|div|blockquote|td|th|caption|figcaption)[^>]*>)(.*?)(</(?:p|h[1-6]|li|div|blockquote|td|th|caption|figcaption)>)'

    def translate_chunk(chunk):
        if not chunk or not chunk.strip():
            return chunk
        clean = re.sub(r'<[^>]+>', '', chunk).strip()
        if not clean:
            return chunk
        if len(clean) <= 450:
            try:
                resp = http_requests.get(
                    "https://api.mymemory.translated.net/get",
                    params={"q": clean, "langpair": f"{source}|{target}"},
                    timeout=10
                )
                if resp.ok:
                    data = resp.json()
                    tr = data.get("responseData", {}).get("translatedText", "")
                    if tr and tr.upper() != clean.upper():
                        return chunk.replace(clean, tr)
            except Exception:
                pass
            return chunk
        sentences = re.split(r'(?<=[.!?])\s+', clean)
        translated_sentences = []
        for sent in sentences:
            if len(sent) > 450:
                translated_sentences.append(sent)
                continue
            try:
                resp = http_requests.get(
                    "https://api.mymemory.translated.net/get",
                    params={"q": sent, "langpair": f"{source}|{target}"},
                    timeout=10
                )
                if resp.ok:
                    data = resp.json()
                    tr = data.get("responseData", {}).get("translatedText", "")
                    translated_sentences.append(tr if tr and tr.upper() != sent.upper() else sent)
                else:
                    translated_sentences.append(sent)
            except Exception:
                translated_sentences.append(sent)
        translated_text = " ".join(translated_sentences)
        return chunk.replace(clean, translated_text)

    matches = list(re.finditer(html_pattern, text, re.DOTALL | re.IGNORECASE))
    if matches:
        result = text
        for match in reversed(matches):
            full = match.group(0)
            inner = match.group(2)
            translated_inner = translate_chunk(inner)
            if translated_inner != inner:
                result = result[:match.start()] + match.group(1) + translated_inner + match.group(3) + result[match.end():]
        return result

    parts = re.split(r'\n\n+', text)
    translated_parts = []
    for part in parts:
        translated_parts.append(translate_chunk(part))
    return "\n\n".join(translated_parts)


async def _get_or_translate(text: str, source: str, target: str) -> str:
    """Translate text with MongoDB caching. Used by other modules."""
    if not text or not text.strip():
        return text
    if source == target:
        return text

    text_hash = hashlib.md5(f"{text}:{source}:{target}".encode()).hexdigest()

    cached = await db.translations.find_one(
        {"hash": text_hash}, {"_id": 0, "translated": 1}
    )
    if cached:
        return cached["translated"]

    if _argos_available:
        translated = _translate_text_argos(text, source, target)
    else:
        translated = _translate_text_api(text, source, target)

    if translated and translated != text:
        await db.translations.update_one(
            {"hash": text_hash},
            {"$set": {
                "hash": text_hash,
                "original": text,
                "translated": translated,
                "source": source,
                "target": target,
                "createdAt": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )

    return translated


@router.post("/translate")
async def translate_text(req: TranslateRequest):
    translated = await _get_or_translate(req.text, req.source, req.target)
    return {"translatedText": translated, "source": req.source, "target": req.target}


@router.post("/translate/batch")
async def translate_batch(req: TranslateBatchRequest):
    results = []
    for text in req.texts[:50]:
        translated = await _get_or_translate(text, req.source, req.target)
        results.append(translated)
    return {"translations": results, "source": req.source, "target": req.target}


@router.get("/translate/article/{slug}")
async def translate_article(slug: str, target: str = "en"):
    article = await db.articles.find_one({"slug": slug}, {"_id": 0})
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    source = "de"
    if target == source:
        return article

    for field in ["title", "excerpt", "content"]:
        if article.get(field):
            article[field] = await _get_or_translate(article[field], source, target)

    if article.get("expertTip"):
        for f in ["title", "content"]:
            if article["expertTip"].get(f):
                article["expertTip"][f] = await _get_or_translate(article["expertTip"][f], source, target)

    if article.get("dueDiligenceBox"):
        if article["dueDiligenceBox"].get("title"):
            article["dueDiligenceBox"]["title"] = await _get_or_translate(article["dueDiligenceBox"]["title"], source, target)
        if article["dueDiligenceBox"].get("items"):
            items = []
            for item in article["dueDiligenceBox"]["items"]:
                items.append(await _get_or_translate(item, source, target))
            article["dueDiligenceBox"]["items"] = items

    return article
