"""Site settings (downloads, homepage, legal pages, PDF generator)."""
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response
from datetime import datetime, timezone
import io
import os

from core import db, verify_admin

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
        {"title": "Vertrauenswürdig", "desc": "Referenziert in n-tv & RTL"},
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
                result += _get_inline_html(child)
            else:
                result += _get_inline_html(child)
    return result


def _html_to_flowables(html_content, styles):
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
                elements.append(Spacer(1, 4 * mm))
                elements.append(Paragraph(_get_inline_html(el), styles['EA_H1']))
                elements.append(Spacer(1, 3 * mm))
            elif tag == 'h2':
                elements.append(Spacer(1, 3 * mm))
                elements.append(Paragraph(_get_inline_html(el), styles['EA_H2']))
                elements.append(Spacer(1, 2 * mm))
            elif tag == 'h3':
                elements.append(Spacer(1, 2 * mm))
                elements.append(Paragraph(_get_inline_html(el), styles['EA_H3']))
                elements.append(Spacer(1, 2 * mm))
            elif tag == 'p':
                inline = _get_inline_html(el)
                if inline.strip():
                    elements.append(Paragraph(inline, styles['EA_Body']))
                    elements.append(Spacer(1, 2 * mm))
            elif tag == 'ul':
                for li in el.find_all('li', recursive=False):
                    bullet_text = f"\u2022\u00a0\u00a0{_get_inline_html(li)}"
                    elements.append(Paragraph(bullet_text, styles['EA_Bullet']))
                elements.append(Spacer(1, 2 * mm))
            elif tag == 'ol':
                for i, li in enumerate(el.find_all('li', recursive=False), 1):
                    num_text = f"{i}.\u00a0\u00a0{_get_inline_html(li)}"
                    elements.append(Paragraph(num_text, styles['EA_Bullet']))
                elements.append(Spacer(1, 2 * mm))
            elif tag == 'blockquote':
                elements.append(Paragraph(_get_inline_html(el), styles['EA_Quote']))
                elements.append(Spacer(1, 2 * mm))
            elif tag == 'br':
                elements.append(Spacer(1, 2 * mm))
            elif tag in ('div', 'section', 'article', 'main'):
                for child in el.children:
                    process_element(child)
            elif tag == 'hr':
                from reportlab.platypus.flowables import HRFlowable
                from reportlab.lib.colors import HexColor
                elements.append(Spacer(1, 3 * mm))
                elements.append(HRFlowable(width="100%", thickness=1, color=HexColor('#E5E7EB')))
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

    buffer = io.BytesIO()

    ea_white = HexColor('#FFFFFF')
    ea_gold = HexColor('#C8A96A')
    ea_dark = HexColor('#04151F')
    ea_gray = HexColor('#888888')
    ea_light_bg = HexColor('#F8F9FA')
    ea_border = HexColor('#E5E7EB')
    ea_text = HexColor('#333333')

    page_w, page_h = A4

    def page_template(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(ea_white)
        canvas.rect(0, 0, page_w, page_h, fill=1, stroke=0)
        # Header
        canvas.setFillColor(ea_white)
        canvas.rect(0, page_h - 28 * mm, page_w, 28 * mm, fill=1, stroke=0)
        canvas.setStrokeColor(ea_gold)
        canvas.setLineWidth(2)
        canvas.line(0, page_h - 28 * mm, page_w, page_h - 28 * mm)
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
        canvas.setFont('Helvetica-Bold', 11)
        canvas.setFillColor(ea_dark)
        canvas.drawString(36 * mm, page_h - 16 * mm, "EUROADRIA CORPORATE SOLUTIONS")
        canvas.setFont('Helvetica', 7.5)
        canvas.setFillColor(ea_gold)
        canvas.drawString(36 * mm, page_h - 21 * mm, "Beratung & Angebotsplattform")
        # Footer
        canvas.setFillColor(ea_light_bg)
        canvas.rect(0, 0, page_w, 14 * mm, fill=1, stroke=0)
        canvas.setStrokeColor(ea_border)
        canvas.setLineWidth(0.5)
        canvas.line(0, 14 * mm, page_w, 14 * mm)
        canvas.setFont('Helvetica', 6.5)
        canvas.setFillColor(ea_gray)
        canvas.drawString(15 * mm, 8 * mm,
                          "EuroAdria Corporate Solutions | euroadria.me | office@euroadria.me")
        canvas.drawRightString(page_w - 15 * mm, 8 * mm, f"Seite {doc.page}")
        canvas.setFillColor(ea_gold)
        canvas.setFont('Helvetica', 5.5)
        canvas.drawCentredString(page_w / 2, 3.5 * mm,
                                 "Vertraulich \u2014 Nur f\u00fcr den pers\u00f6nlichen Gebrauch bestimmt")
        canvas.restoreState()

    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            leftMargin=15 * mm, rightMargin=15 * mm,
                            topMargin=34 * mm, bottomMargin=20 * mm)

    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle('EA_Title', parent=styles['Title'],
                              fontSize=22, textColor=ea_dark,
                              spaceAfter=2 * mm, fontName='Helvetica-Bold',
                              alignment=TA_CENTER))
    styles.add(ParagraphStyle('EA_Subtitle', parent=styles['Normal'],
                              fontSize=10, textColor=ea_gold,
                              spaceAfter=4 * mm, fontName='Helvetica',
                              alignment=TA_CENTER))
    styles.add(ParagraphStyle('EA_H1', parent=styles['Heading1'],
                              fontSize=16, textColor=ea_dark,
                              fontName='Helvetica-Bold',
                              spaceAfter=1 * mm, spaceBefore=2 * mm,
                              borderColor=ea_gold, borderWidth=0,
                              borderPadding=0))
    styles.add(ParagraphStyle('EA_H2', parent=styles['Heading2'],
                              fontSize=13, textColor=ea_dark,
                              fontName='Helvetica-Bold',
                              spaceAfter=1 * mm, spaceBefore=1 * mm))
    styles.add(ParagraphStyle('EA_H3', parent=styles['Heading3'],
                              fontSize=11, textColor=ea_gold,
                              fontName='Helvetica-Bold',
                              spaceAfter=1 * mm, spaceBefore=1 * mm))
    styles.add(ParagraphStyle('EA_Body', parent=styles['Normal'],
                              fontSize=9.5, textColor=ea_text,
                              fontName='Helvetica',
                              leading=14, spaceAfter=1 * mm))
    styles.add(ParagraphStyle('EA_Bullet', parent=styles['Normal'],
                              fontSize=9.5, textColor=ea_text,
                              fontName='Helvetica',
                              leading=14, leftIndent=12,
                              spaceAfter=1 * mm))
    styles.add(ParagraphStyle('EA_Quote', parent=styles['Normal'],
                              fontSize=9.5, textColor=ea_gray,
                              fontName='Helvetica-Oblique',
                              leading=14, leftIndent=15,
                              borderColor=ea_gold, borderWidth=1,
                              borderPadding=(5, 5, 5, 10),
                              spaceAfter=1 * mm))
    styles.add(ParagraphStyle('EA_Date', parent=styles['Normal'],
                              fontSize=8, textColor=ea_gray,
                              fontName='Helvetica',
                              alignment=TA_CENTER, spaceAfter=6 * mm))

    story = []

    # Title
    story.append(Spacer(1, 6 * mm))
    story.append(Paragraph(title, styles['EA_Title']))

    # Subtitle
    if subtitle:
        story.append(Paragraph(subtitle, styles['EA_Subtitle']))

    # Date
    now = datetime.now(timezone.utc).strftime('%d.%m.%Y')
    story.append(Paragraph(f"Erstellt am {now}", styles['EA_Date']))

    # Gold separator line
    story.append(HRFlowable(width="100%", thickness=1.5, color=ea_gold,
                             spaceAfter=6 * mm, spaceBefore=2 * mm))

    # Content from WYSIWYG editor
    content_elements = _html_to_flowables(content_html, styles)
    story.extend(content_elements)

    doc.build(story, onFirstPage=page_template, onLaterPages=page_template)

    pdf_bytes = buffer.getvalue()
    buffer.close()

    safe_title = "".join(c if c.isalnum() or c in (' ', '-', '_') else '' for c in title).strip().replace(' ', '_')
    filename = f"EuroAdria_{safe_title}_{now.replace('.', '-')}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
