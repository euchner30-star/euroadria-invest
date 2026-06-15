"""Site settings (downloads, homepage, legal pages, PDF generator)."""
from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, File
from fastapi.responses import Response, StreamingResponse
from datetime import datetime, timezone
import io
import os
import base64

from core import db, verify_admin
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

pdfmetrics.registerFont(TTFont('LiberationSans', '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSans-Bold', '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSans-Oblique', '/usr/share/fonts/truetype/liberation/LiberationSans-Italic.ttf'))
pdfmetrics.registerFont(TTFont('LiberationSans-BoldOblique', '/usr/share/fonts/truetype/liberation/LiberationSans-BoldItalic.ttf'))
pdfmetrics.registerFontFamily('LiberationSans',
    normal='LiberationSans',
    bold='LiberationSans-Bold',
    italic='LiberationSans-Oblique',
    boldItalic='LiberationSans-BoldOblique'
)

router = APIRouter()

# ── Download Settings ───────────────────────────────────────────────────

SETTINGS_FIXED_KEYS = [
    "praxisleitfaden_url",
    "budva_expose_url",
    "niksic_expose_url",
    "podgorica_expose_url",
    "skadar_lake_expose_url",
    "zabljak_expose_url"
]


@router.get("/settings/downloads")
async def get_download_settings():
    settings = await db.site_settings.find_one({"key": "downloads"}, {"_id": 0})
    if not settings:
        result = {k: "" for k in SETTINGS_FIXED_KEYS}
        result["custom_exposes"] = []
        return result
    result = {k: settings.get(k, "") for k in SETTINGS_FIXED_KEYS}
    result["custom_exposes"] = settings.get("custom_exposes", [])
    return result


@router.put("/admin/settings/downloads")
async def update_download_settings(settings: dict, admin: str = Depends(verify_admin)):
    update_data = {k: settings.get(k, "") for k in SETTINGS_FIXED_KEYS}
    update_data["custom_exposes"] = settings.get("custom_exposes", [])
    update_data["key"] = "downloads"
    await db.site_settings.update_one({"key": "downloads"}, {"$set": update_data}, upsert=True)
    result = {k: update_data[k] for k in SETTINGS_FIXED_KEYS}
    result["custom_exposes"] = update_data["custom_exposes"]
    return result


@router.post("/admin/settings/upload-pdf-file")
async def upload_pdf_file_to_db(file: UploadFile = File(...), pdf_key: str = "praxisleitfaden", admin: str = Depends(verify_admin)):
    """Upload a PDF file and store in MongoDB. Uses chunks for large files (>10MB)."""
    import base64
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Nur PDF-Dateien erlaubt")
    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="Datei zu gross (max 20MB)")
    
    pdf_b64 = base64.b64encode(content).decode("utf-8")
    
    # MongoDB 16MB doc limit: if base64 > 14MB, split into chunks
    if len(pdf_b64) > 14 * 1024 * 1024:
        chunk_size = 10 * 1024 * 1024  # 10MB chunks
        chunks = [pdf_b64[i:i+chunk_size] for i in range(0, len(pdf_b64), chunk_size)]
        
        # Delete old chunks
        await db.pdf_chunks.delete_many({"pdf_key": f"pdf_{pdf_key}"})
        
        # Store chunks
        for idx, chunk in enumerate(chunks):
            await db.pdf_chunks.insert_one({
                "pdf_key": f"pdf_{pdf_key}",
                "chunk_index": idx,
                "data": chunk
            })
        
        # Store metadata (without base64)
        await db.site_settings.update_one(
            {"key": f"pdf_{pdf_key}"},
            {"$set": {
                "key": f"pdf_{pdf_key}",
                "filename": file.filename,
                "chunked": True,
                "chunk_count": len(chunks),
                "size": len(content),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        # Remove old base64 field if exists
        await db.site_settings.update_one(
            {"key": f"pdf_{pdf_key}"},
            {"$unset": {"base64": ""}}
        )
    else:
        # Small file: store inline as before
        await db.site_settings.update_one(
            {"key": f"pdf_{pdf_key}"},
            {"$set": {
                "key": f"pdf_{pdf_key}",
                "filename": file.filename,
                "base64": pdf_b64,
                "chunked": False,
                "size": len(content),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
    return {"success": True, "filename": file.filename, "size": len(content), "pdf_key": pdf_key}


@router.get("/pdf/{pdf_key}")
async def serve_pdf(pdf_key: str):
    """Stream a stored PDF. Used by Resend path attachments to avoid loading into app memory."""
    full_key = f"pdf_{pdf_key}"
    pdf_doc = await db.site_settings.find_one({"key": full_key}, {"_id": 0})
    if not pdf_doc:
        raise HTTPException(status_code=404, detail="PDF not found")

    if pdf_doc.get("chunked"):
        chunks = await db.pdf_chunks.find({"pdf_key": full_key}, {"_id": 0}).sort("chunk_index", 1).to_list(100)
        full_b64 = "".join([c["data"] for c in chunks])
    else:
        full_b64 = pdf_doc.get("base64", "")

    if not full_b64:
        raise HTTPException(status_code=404, detail="PDF data empty")

    pdf_bytes = base64.b64decode(full_b64)
    del full_b64
    filename = pdf_doc.get("filename", "document.pdf")
    return Response(content=pdf_bytes, media_type="application/pdf",
                    headers={"Content-Disposition": f'inline; filename="{filename}"'})


@router.get("/admin/settings/pdf-status")
async def get_pdf_status(admin: str = Depends(verify_admin)):
    """Return upload status for all stored PDFs."""
    statuses = {}
    async for doc in db.site_settings.find({"key": {"$regex": "^pdf_"}}, {"_id": 0, "base64": 0}):
        key = doc["key"].replace("pdf_", "")
        statuses[key] = {
            "filename": doc.get("filename", ""),
            "size": doc.get("size", 0),
            "updated_at": doc.get("updated_at", ""),
        }
    return statuses



@router.delete("/admin/settings/cleanup-pdf-duplicates")
async def cleanup_pdf_duplicates(admin: str = Depends(verify_admin)):
    """Remove duplicate/orphaned PDF data to free memory. Deletes usca-specific key (both pages use us_strategy_brief now)."""
    results = {}
    # Remove usca-specific PDF (both pages now share pdf_us_strategy_brief)
    r1 = await db.site_settings.delete_many({"key": "pdf_usca_strategy_brief"})
    r2 = await db.pdf_chunks.delete_many({"pdf_key": "pdf_usca_strategy_brief"})
    results["usca_deleted"] = {"metadata": r1.deleted_count, "chunks": r2.deleted_count}
    
    # List remaining PDFs
    remaining = []
    async for doc in db.site_settings.find({"key": {"$regex": "^pdf_"}}, {"_id": 0, "base64": 0}):
        remaining.append({"key": doc["key"], "filename": doc.get("filename"), "size_kb": doc.get("size", 0) // 1024})
    results["remaining_pdfs"] = remaining
    return results


# ── Tracking / GTM Settings ─────────────────────────────────────────────

@router.get("/settings/tracking")
async def get_tracking_settings():
    """Get tracking pixel IDs (public, needed for frontend to load GTM)."""
    doc = await db.site_settings.find_one({"key": "tracking"}, {"_id": 0})
    return {"gtm_id": (doc or {}).get("gtm_id", "")}


@router.put("/admin/settings/tracking")
async def update_tracking_settings(data: dict, admin: str = Depends(verify_admin)):
    """Update tracking settings (GTM ID, etc.)."""
    gtm_id = data.get("gtm_id", "").strip()
    await db.site_settings.update_one(
        {"key": "tracking"},
        {"$set": {"key": "tracking", "gtm_id": gtm_id}},
        upsert=True
    )
    return {"gtm_id": gtm_id}


# ── Homepage Settings ───────────────────────────────────────────────────

HOMEPAGE_DEFAULTS = {
    "hero_title": "Firmengründung, Aufenthalt & Investments in Montenegro und Serbien",
    "hero_subtitle": "EuroAdria ist Ihre Brücke zu erfolgreichen Investitionen, rechtssicherer Auswanderung und internationaler Unternehmensstrukturierung, sowohl in der Adria-Region als auch in Asien. Wir sind Ihr Trusted Advisor für alle unternehmerischen und privaten Vorhaben im Ausland.",
    "hero_cta_text": "Jetzt Beratung anfragen",
    "testimonial_image": "",
    "testimonial_image_position": 50,
    "testimonial_quote": "Dank EuroAdria konnte ich meine Firmengründung in Montenegro schnell, sicher und komplett stressfrei umsetzen. Ich habe mich bestens betreut gefühlt und kann EuroAdria jedem Unternehmer und Investor wärmstens empfehlen.",
    "testimonial_author": "Maximilian R., Unternehmer aus Deutschland",
    "stats_image": "https://images.unsplash.com/photo-1517048676732-d65bc937f952",
    "stats_image_position": 50,
    "cta_title": "Bereit für Ihre Investition?",
    "cta_subtitle": "Vereinbaren Sie ein unverbindliches Erstgespräch mit unseren Experten und entdecken Sie die Möglichkeiten am Balkan.",
    "trust_items": [
        {"title": "Vertrauenswürdig", "desc": "Bekannt aus n-tv & RTL (Anzeige)"},
        {"title": "Rendite-Fokus", "desc": "Zweistellige Zielrenditen"},
        {"title": "Expertise", "desc": "15+ Jahre Erfahrung"},
        {"title": "Sicherheit", "desc": "Asset Protection"}
    ]
}


@router.get("/settings/homepage")
async def get_homepage_settings():
    settings = await db.site_settings.find_one({"key": "homepage"}, {"_id": 0})
    if not settings:
        return HOMEPAGE_DEFAULTS
    result = {}
    for k, v in HOMEPAGE_DEFAULTS.items():
        saved = settings.get(k)
        if saved is None or saved == "":
            result[k] = v
        else:
            result[k] = saved
    return result


@router.put("/admin/settings/homepage")
async def update_homepage_settings(settings: dict, admin: str = Depends(verify_admin)):
    update_data = {}
    for k in HOMEPAGE_DEFAULTS:
        if k in settings:
            update_data[k] = settings[k]
        else:
            update_data[k] = HOMEPAGE_DEFAULTS[k]
    update_data["key"] = "homepage"
    await db.site_settings.update_one({"key": "homepage"}, {"$set": update_data}, upsert=True)
    return {k: update_data[k] for k in HOMEPAGE_DEFAULTS}


# ── Legal Pages ─────────────────────────────────────────────────────────

@router.get("/settings/legal/{page_type}")
async def get_legal_page(page_type: str):
    if page_type not in ("impressum", "datenschutz", "agb"):
        raise HTTPException(status_code=404, detail="Page not found")
    doc = await db.site_settings.find_one({"key": f"legal_{page_type}"}, {"_id": 0})
    if not doc or not doc.get("content"):
        return {"content": ""}
    return {"content": doc["content"]}


@router.put("/admin/settings/legal/{page_type}")
async def update_legal_page(page_type: str, data: dict, admin: str = Depends(verify_admin)):
    if page_type not in ("impressum", "datenschutz", "agb"):
        raise HTTPException(status_code=404, detail="Page not found")
    content = data.get("content", "")
    await db.site_settings.update_one(
        {"key": f"legal_{page_type}"},
        {"$set": {"key": f"legal_{page_type}", "content": content}},
        upsert=True
    )
    return {"content": content}


# ── PDF Generator ────────────────────────────────────────────────────────

def _get_inline_html(element):
    """Convert a BeautifulSoup element's children to reportlab-compatible inline HTML."""
    from bs4 import NavigableString, Tag
    result = ''
    for child in element.children:
        if isinstance(child, NavigableString):
            text = str(child)
            text = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
            result += text
        elif isinstance(child, Tag):
            tag = child.name.lower()
            if tag in ('strong', 'b'):
                result += f'<b>{_get_inline_html(child)}</b>'
            elif tag in ('em', 'i'):
                result += f'<i>{_get_inline_html(child)}</i>'
            elif tag == 'u':
                result += f'<u>{_get_inline_html(child)}</u>'
            elif tag == 'a':
                href = child.get('href', '')
                result += f'<a href="{href}" color="#C8A96A">{_get_inline_html(child)}</a>'
            elif tag == 'br':
                result += '<br/>'
            elif tag in ('span', 'font'):
                size_attr = child.get('size', '')
                inner = _get_inline_html(child)
                if size_attr and int(size_attr) <= 2:
                    result += f'<font size="7">{inner}</font>'
                else:
                    result += inner
            else:
                result += _get_inline_html(child)
    return result


from reportlab.platypus import Flowable as _Flowable


class _GoldAccentHeading(_Flowable):
    """Heading with a gold accent bar on the left."""
    def __init__(self, text, style, accent_color, bar_width=3, bar_gap=6):
        _Flowable.__init__(self)
        from reportlab.platypus import Paragraph
        self.para = Paragraph(text, style)
        self.accent_color = accent_color
        self.bar_width = bar_width
        self.bar_gap = bar_gap
        self._height = 0

    def wrap(self, aw, ah):
        w, h = self.para.wrap(aw - self.bar_width - self.bar_gap, ah)
        self._height = h + 2
        return aw, self._height

    def draw(self):
        self.canv.saveState()
        self.canv.setFillColor(self.accent_color)
        self.canv.roundRect(0, 0, self.bar_width, self._height, 1, fill=1, stroke=0)
        self.para.drawOn(self.canv, self.bar_width + self.bar_gap, 0)
        self.canv.restoreState()


class _HighlightBox(_Flowable):
    """Content in a rounded box with subtle background."""
    def __init__(self, flowables, bg_color, border_color=None, padding=10):
        _Flowable.__init__(self)
        self.flowables = flowables
        self.bg_color = bg_color
        self.border_color = border_color
        self.padding = padding
        self._height = 0

    def wrap(self, aw, ah):
        self.width = aw
        total_h = 0
        inner_w = aw - 2 * self.padding
        for f in self.flowables:
            _, h = f.wrap(inner_w, ah)
            total_h += h
        self._height = total_h + 2 * self.padding
        return aw, self._height

    def draw(self):
        self.canv.saveState()
        self.canv.setFillColor(self.bg_color)
        if self.border_color:
            self.canv.setStrokeColor(self.border_color)
            self.canv.setLineWidth(0.5)
            self.canv.roundRect(0, 0, self.width, self._height, 6, fill=1, stroke=1)
        else:
            self.canv.roundRect(0, 0, self.width, self._height, 6, fill=1, stroke=0)
        self.canv.restoreState()
        cy = self._height - self.padding
        inner_w = self.width - 2 * self.padding
        for f in self.flowables:
            _, h = f.wrap(inner_w, self._height)
            cy -= h
            f.drawOn(self.canv, self.padding, cy)


def _html_to_flowables(html_content, styles, colors):
    """Convert HTML from WYSIWYG editor to reportlab flowables."""
    from bs4 import BeautifulSoup, NavigableString, Tag
    from reportlab.platypus import Paragraph, Spacer
    from reportlab.lib.units import mm

    if not html_content or not html_content.strip():
        return []

    soup = BeautifulSoup(html_content, 'html.parser')
    elements = []

    def process_element(el):
        if isinstance(el, NavigableString):
            text = str(el).strip()
            if text:
                safe = text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')
                elements.append(Paragraph(safe, styles['EA_Body']))
                elements.append(Spacer(1, 2 * mm))
        elif isinstance(el, Tag):
            tag = el.name.lower()

            if tag == 'h1':
                elements.append(Spacer(1, 5 * mm))
                heading = _GoldAccentHeading(
                    _get_inline_html(el), styles['EA_H1'],
                    colors['gold'], bar_width=4, bar_gap=8
                )
                elements.append(heading)
                elements.append(Spacer(1, 4 * mm))
            elif tag == 'h2':
                elements.append(Spacer(1, 4 * mm))
                heading = _GoldAccentHeading(
                    _get_inline_html(el), styles['EA_H2'],
                    colors['gold'], bar_width=3, bar_gap=6
                )
                elements.append(heading)
                elements.append(Spacer(1, 3 * mm))
            elif tag == 'h3':
                elements.append(Spacer(1, 3 * mm))
                h3_text = f'<font color="#C8A96A" name="LiberationSans-Bold">\u2014</font>\u00a0\u00a0{_get_inline_html(el)}'
                elements.append(Paragraph(h3_text, styles['EA_H3']))
                elements.append(Spacer(1, 2 * mm))
            elif tag == 'p':
                inline = _get_inline_html(el)
                if inline.strip():
                    elements.append(Paragraph(inline, styles['EA_Body']))
                    elements.append(Spacer(1, 2.5 * mm))
            elif tag == 'ul':
                items = el.find_all('li', recursive=False)
                bullet_flows = []
                for li in items:
                    bt = f'<font color="#C8A96A" name="LiberationSans-Bold">\u2013</font>\u00a0\u00a0{_get_inline_html(li)}'
                    bullet_flows.append(Paragraph(bt, styles['EA_Bullet']))
                    bullet_flows.append(Spacer(1, 2 * mm))
                if bullet_flows:
                    box = _HighlightBox(bullet_flows, colors['card_bg'], colors['card_border'], padding=12)
                    elements.append(box)
                    elements.append(Spacer(1, 3 * mm))
            elif tag == 'ol':
                items = el.find_all('li', recursive=False)
                ol_flows = []
                for i, li in enumerate(items, 1):
                    nt = f'<font color="#C8A96A"><b>{i}.</b></font>\u00a0\u00a0{_get_inline_html(li)}'
                    ol_flows.append(Paragraph(nt, styles['EA_Bullet']))
                    ol_flows.append(Spacer(1, 2 * mm))
                if ol_flows:
                    box = _HighlightBox(ol_flows, colors['card_bg'], colors['card_border'], padding=12)
                    elements.append(box)
                    elements.append(Spacer(1, 3 * mm))
            elif tag == 'blockquote':
                q_flows = [Paragraph(_get_inline_html(el), styles['EA_Quote'])]
                box = _HighlightBox(q_flows, colors['quote_bg'], colors['gold'], padding=12)
                elements.append(Spacer(1, 2 * mm))
                elements.append(box)
                elements.append(Spacer(1, 3 * mm))
            elif tag == 'br':
                elements.append(Spacer(1, 2 * mm))
            elif tag in ('div', 'section', 'article', 'main'):
                if el.get('data-pagebreak') == 'true':
                    from reportlab.platypus import PageBreak
                    elements.append(PageBreak())
                else:
                    for child in el.children:
                        process_element(child)
            elif tag == 'hr':
                from reportlab.platypus.flowables import HRFlowable
                elements.append(Spacer(1, 3 * mm))
                elements.append(HRFlowable(width="60%", thickness=1, color=colors['gold']))
                elements.append(Spacer(1, 3 * mm))
            elif tag in ('style', 'script'):
                pass
            else:
                inline = _get_inline_html(el)
                if inline.strip():
                    elements.append(Paragraph(inline, styles['EA_Body']))
                    elements.append(Spacer(1, 2 * mm))

    for element in soup.children:
        process_element(element)

    return elements


@router.post("/admin/generate-pdf")
async def generate_branded_pdf(request: Request, admin: str = Depends(verify_admin)):
    from reportlab.lib.pagesizes import A4
    from reportlab.lib.units import mm
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.enums import TA_CENTER, TA_LEFT
    from reportlab.platypus.flowables import HRFlowable

    data = await request.json()
    title = data.get("title", "Dokument")
    subtitle = data.get("subtitle", "")
    content_html = data.get("content", "")
    preview = data.get("preview", False)

    buffer = io.BytesIO()

    colors = {
        'white': HexColor('#FFFFFF'),
        'gold': HexColor('#C8A96A'),
        'gold_light': HexColor('#F5EFE0'),
        'dark': HexColor('#04151F'),
        'gray': HexColor('#6B7280'),
        'text': HexColor('#374151'),
        'light_bg': HexColor('#F9FAFB'),
        'card_bg': HexColor('#F0ECE2'),
        'card_border': HexColor('#D4C9B0'),
        'quote_bg': HexColor('#FFFBF0'),
        'border': HexColor('#E5E7EB'),
    }

    page_w, page_h = A4

    def page_template(canvas, doc):
        canvas.saveState()
        # White background
        canvas.setFillColor(colors['white'])
        canvas.rect(0, 0, page_w, page_h, fill=1, stroke=0)

        # ── Header ──
        canvas.setFillColor(colors['white'])
        canvas.rect(0, page_h - 28 * mm, page_w, 28 * mm, fill=1, stroke=0)
        # Gold line under header
        canvas.setStrokeColor(colors['gold'])
        canvas.setLineWidth(2)
        canvas.line(0, page_h - 28 * mm, page_w, page_h - 28 * mm)
        # Subtle gold gradient dot (decorative)
        canvas.setFillColor(colors['gold'])
        canvas.circle(page_w - 20 * mm, page_h - 14 * mm, 2, fill=1, stroke=0)
        canvas.setFillColor(HexColor('#D4BC82'))
        canvas.circle(page_w - 25 * mm, page_h - 14 * mm, 1.2, fill=1, stroke=0)

        # Logo
        try:
            logo_path = '/app/frontend/public/euroadria-logo.png'
            if not os.path.exists(logo_path):
                logo_path = '/tmp/euroadria-logo.png'
                if not os.path.exists(logo_path):
                    import requests as _req
                    r = _req.get('https://euroadria.me/euroadria-logo.png', timeout=5)
                    if r.ok:
                        with open(logo_path, 'wb') as f:
                            f.write(r.content)
            if os.path.exists(logo_path):
                canvas.drawImage(logo_path, 15 * mm, page_h - 24 * mm,
                                 width=18 * mm, height=18 * mm,
                                 preserveAspectRatio=True, mask='auto')
        except Exception:
            pass
        canvas.setFont('LiberationSans-Bold', 11)
        canvas.setFillColor(colors['dark'])
        canvas.drawString(36 * mm, page_h - 16 * mm, "EUROADRIA CORPORATE SOLUTIONS")
        canvas.setFont('LiberationSans', 7.5)
        canvas.setFillColor(colors['gold'])
        canvas.drawString(36 * mm, page_h - 21 * mm, "Beratung & Angebotsplattform")

        # ── Footer ──
        canvas.setFillColor(colors['light_bg'])
        canvas.rect(0, 0, page_w, 16 * mm, fill=1, stroke=0)
        canvas.setStrokeColor(colors['gold'])
        canvas.setLineWidth(1)
        canvas.line(15 * mm, 16 * mm, page_w - 15 * mm, 16 * mm)
        # Footer text
        canvas.setFont('LiberationSans', 6.5)
        canvas.setFillColor(colors['gray'])
        canvas.drawString(15 * mm, 10 * mm,
                          "EuroAdria Corporate Solutions  |  euroadria.me  |  office@euroadria.me")
        canvas.drawRightString(page_w - 15 * mm, 10 * mm, f"Seite {doc.page}")
        canvas.setFillColor(colors['gold'])
        canvas.setFont('LiberationSans', 5.5)
        canvas.drawCentredString(page_w / 2, 4 * mm,
                                 "Vertraulich \u2014 Nur f\u00fcr den pers\u00f6nlichen Gebrauch bestimmt")
        canvas.restoreState()

    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            leftMargin=18 * mm, rightMargin=18 * mm,
                            topMargin=36 * mm, bottomMargin=22 * mm)

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle('EA_Title', parent=styles['Title'],
                              fontSize=20, textColor=colors['dark'],
                              spaceAfter=2 * mm, fontName='LiberationSans-Bold',
                              alignment=TA_CENTER, leading=26))
    styles.add(ParagraphStyle('EA_Subtitle', parent=styles['Normal'],
                              fontSize=10, textColor=colors['gold'],
                              spaceAfter=4 * mm, fontName='LiberationSans',
                              alignment=TA_CENTER, leading=14))
    styles.add(ParagraphStyle('EA_H1', parent=styles['Heading1'],
                              fontSize=15, textColor=colors['dark'],
                              fontName='LiberationSans-Bold',
                              spaceAfter=1 * mm, spaceBefore=0, leading=20))
    styles.add(ParagraphStyle('EA_H2', parent=styles['Heading2'],
                              fontSize=12.5, textColor=colors['dark'],
                              fontName='LiberationSans-Bold',
                              spaceAfter=1 * mm, spaceBefore=0, leading=17))
    styles.add(ParagraphStyle('EA_H3', parent=styles['Heading3'],
                              fontSize=10.5, textColor=colors['dark'],
                              fontName='LiberationSans-Bold',
                              spaceAfter=1 * mm, spaceBefore=0, leading=15))
    styles.add(ParagraphStyle('EA_Body', parent=styles['Normal'],
                              fontSize=9.5, textColor=colors['text'],
                              fontName='LiberationSans',
                              leading=15, spaceAfter=0))
    styles.add(ParagraphStyle('EA_Bullet', parent=styles['Normal'],
                              fontSize=9.5, textColor=colors['text'],
                              fontName='LiberationSans',
                              leading=15, leftIndent=22, firstLineIndent=-14, spaceAfter=0))
    styles.add(ParagraphStyle('EA_Quote', parent=styles['Normal'],
                              fontSize=9.5, textColor=colors['gray'],
                              fontName='LiberationSans-Oblique',
                              leading=15, leftIndent=4, spaceAfter=0))
    styles.add(ParagraphStyle('EA_Date', parent=styles['Normal'],
                              fontSize=8, textColor=colors['gray'],
                              fontName='LiberationSans',
                              alignment=TA_CENTER, spaceAfter=4 * mm))

    story = []

    # ── Title block ──
    story.append(Spacer(1, 4 * mm))
    story.append(Paragraph(title, styles['EA_Title']))
    if subtitle:
        story.append(Paragraph(subtitle, styles['EA_Subtitle']))
    now = datetime.now(timezone.utc).strftime('%d.%m.%Y')
    story.append(Paragraph(f"Erstellt am {now}", styles['EA_Date']))

    # Gold separator
    story.append(HRFlowable(width="40%", thickness=1.5, color=colors['gold'],
                             spaceAfter=6 * mm, spaceBefore=2 * mm))

    # ── Content ──
    content_elements = _html_to_flowables(content_html, styles, colors)
    story.extend(content_elements)

    doc.build(story, onFirstPage=page_template, onLaterPages=page_template)

    pdf_bytes = buffer.getvalue()
    buffer.close()

    safe_title = "".join(c if (c.isascii() and c.isalnum()) or c in (' ', '-', '_') else '' for c in title).strip().replace(' ', '_')
    filename = f"EuroAdria_{safe_title}_{now.replace('.', '-')}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'{"inline" if preview else "attachment"}; filename="{filename}"'
        }
    )
