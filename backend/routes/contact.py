"""Contact form & Lead capture endpoints."""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
import uuid
import base64
import resend

from core import db, logger, verify_admin, RESEND_API_KEY, NOTIFICATION_EMAIL
from models import ContactForm, LeadForm
from emails import send_contact_email, wrap_email

router = APIRouter()


@router.post("/contact")
async def submit_contact_form(form: ContactForm):
    """Handle contact form submissions"""
    contact_dict = form.model_dump()
    contact_dict["submitted_at"] = datetime.now(timezone.utc).isoformat()
    contact_dict["status"] = "new"

    # Store in database
    await db.contact_submissions.insert_one(contact_dict)

    # Auto-create CRM lead + deal
    existing_crm = await db.crm_leads.find_one({"email": contact_dict.get("email", "")})
    if existing_crm:
        await db.crm_deals.insert_one({
            "id": str(uuid.uuid4())[:8],
            "lead_id": existing_crm["id"],
            "stage": "new_lead",
            "deal_value": 0,
            "probability": 10,
            "expected_revenue": 0,
            "assigned_to": None,
            "notes": f"Betreff: {contact_dict.get('subject', 'Allgemein')}",
            "created_at": contact_dict["submitted_at"],
            "updated_at": contact_dict["submitted_at"]
        })
        if existing_crm.get("status") == "lost":
            await db.crm_leads.update_one({"id": existing_crm["id"]}, {"$set": {"status": "new"}})
    else:
        crm_lead_id = str(uuid.uuid4())[:8]
        await db.crm_leads.insert_one({
            "id": crm_lead_id,
            "name": contact_dict.get("name", ""),
            "email": contact_dict.get("email", ""),
            "phone": contact_dict.get("phone"),
            "lead_source": "kontaktformular",
            "utm_source": None, "utm_medium": None, "utm_campaign": None,
            "entry_page": None,
            "tool_used": "contact_form",
            "status": "new",
            "created_at": contact_dict["submitted_at"]
        })
        await db.crm_deals.insert_one({
            "id": str(uuid.uuid4())[:8],
            "lead_id": crm_lead_id,
            "stage": "new_lead",
            "deal_value": 0,
            "probability": 10,
            "expected_revenue": 0,
            "assigned_to": None,
            "notes": f"Betreff: {contact_dict.get('subject', 'Allgemein')}",
            "created_at": contact_dict["submitted_at"],
            "updated_at": contact_dict["submitted_at"]
        })

    # Send email notification to admin
    email_sent = await send_contact_email(contact_dict)

    # Send branded confirmation email to the customer
    if RESEND_API_KEY:
        try:
            resend.api_key = RESEND_API_KEY
            customer_name = contact_dict.get('name', '')
            content = f"""
            <h2 style="color: #04151F; margin: 0 0 8px 0;">Vielen Dank, {customer_name}!</h2>
            <p style="color: #555; font-size: 14px; margin: 0 0 24px 0;">Wir haben Ihre Anfrage erhalten und melden uns zeitnah bei Ihnen.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 3px solid #C8A96A; margin-bottom: 24px;">
                <p style="color: #C8A96A; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 1px;">Ihre Anfrage</p>
                <p style="color: #04151F; font-size: 16px; margin: 0 0 8px 0; font-weight: bold;">{contact_dict.get('subject', 'Allgemein')}</p>
                <p style="color: #555; font-size: 13px; margin: 0; line-height: 20px;">{contact_dict.get('message', '')[:300]}{'...' if len(contact_dict.get('message', '')) > 300 else ''}</p>
            </div>
            <p style="color: #333; font-size: 14px; line-height: 22px; margin: 0 0 24px 0;">
                Unser Team wird sich innerhalb von 24 Stunden bei Ihnen melden. In der Zwischenzeit können Sie unsere aktuellen Marktanalysen und Investment-Tools nutzen.
            </p>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td align="center" style="padding: 8px 0 24px 0;">
                    <a href="https://euroadria.me/investment/simulation" style="display: inline-block; background-color: #C8A96A; color: #04151F; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 6px;">Investment-Simulator starten</a>
                </td></tr>
            </table>
            """
            resend.Emails.send({
                "from": "EuroAdria Corporate Solutions <noreply@euroadria.me>",
                "to": [contact_dict['email']],
                "subject": f"Ihre Anfrage bei EuroAdria — {contact_dict.get('subject', 'Wir melden uns!')}",
                "html": wrap_email(content),
                "reply_to": NOTIFICATION_EMAIL
            })
        except Exception as e:
            logger.error(f"Contact confirmation email failed: {e}")

    return {
        "success": True,
        "message": "Vielen Dank für Ihre Nachricht! Wir melden uns zeitnah bei Ihnen.",
        "email_sent": email_sent
    }


@router.post("/leads")
async def capture_lead(lead: LeadForm):
    """Capture lead data before Exposé download"""
    lead_dict = lead.model_dump()
    lead_dict["submitted_at"] = datetime.now(timezone.utc).isoformat()
    lead_dict["type"] = "expose_download"

    await db.leads.insert_one(lead_dict)

    # Auto-create CRM lead + deal
    existing_crm = await db.crm_leads.find_one({"email": lead_dict.get("email", "")})
    if existing_crm:
        await db.crm_deals.insert_one({
            "id": str(uuid.uuid4())[:8],
            "lead_id": existing_crm["id"],
            "stage": "new_lead",
            "deal_value": 0, "probability": 10, "expected_revenue": 0,
            "assigned_to": None,
            "notes": f"Exposé: {lead_dict.get('expose_name', lead_dict.get('source', ''))}",
            "created_at": lead_dict["submitted_at"],
            "updated_at": lead_dict["submitted_at"]
        })
        if existing_crm.get("status") == "lost":
            await db.crm_leads.update_one({"id": existing_crm["id"]}, {"$set": {"status": "new"}})
    else:
        crm_lead_id = str(uuid.uuid4())[:8]
        await db.crm_leads.insert_one({
            "id": crm_lead_id,
            "name": lead_dict.get("name", ""),
            "email": lead_dict.get("email", ""),
            "phone": lead_dict.get("phone"),
            "lead_source": "expose_download",
            "utm_source": None, "utm_medium": None, "utm_campaign": None,
            "entry_page": None,
            "tool_used": lead_dict.get("expose_name", lead_dict.get("source", "expose")),
            "status": "new",
            "created_at": lead_dict["submitted_at"]
        })
        await db.crm_deals.insert_one({
            "id": str(uuid.uuid4())[:8],
            "lead_id": crm_lead_id,
            "stage": "new_lead",
            "deal_value": 0, "probability": 10, "expected_revenue": 0,
            "assigned_to": None,
            "notes": f"Exposé: {lead_dict.get('expose_name', lead_dict.get('source', ''))}",
            "created_at": lead_dict["submitted_at"],
            "updated_at": lead_dict["submitted_at"]
        })

    # Send email notification
    email_sent = False
    if RESEND_API_KEY:
        try:
            resend.api_key = RESEND_API_KEY
            content = f"""
            <h2 style="color: #04151F; margin: 0 0 20px 0;">Neuer Exposé-Download Lead</h2>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 3px solid #C8A96A; margin-bottom: 20px;">
                <p style="margin: 0 0 8px; color: #333;"><strong>Name:</strong> {lead_dict['name']}</p>
                <p style="margin: 0 0 8px; color: #333;"><strong>E-Mail:</strong> {lead_dict['email']}</p>
                <p style="margin: 0 0 8px; color: #333;"><strong>Telefon:</strong> {lead_dict.get('phone', 'Nicht angegeben')}</p>
                <p style="margin: 0; color: #333;"><strong>Exposé:</strong> {lead_dict.get('expose_name', lead_dict['source'])}</p>
            </div>
            <p style="color: #888; font-size: 12px;">Dieser Lead wurde über den Exposé-Download auf euroadria.me generiert.</p>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td align="center" style="padding: 8px 0;">
                    <a href="https://euroadria.me/admin" style="display: inline-block; background-color: #C8A96A; color: #04151F; font-size: 14px; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 6px;">Im CRM anzeigen</a>
                </td></tr>
            </table>
            """
            resend.Emails.send({
                "from": "EuroAdria Leads <noreply@euroadria.me>",
                "to": [NOTIFICATION_EMAIL],
                "subject": f"Neuer Lead: {lead_dict.get('expose_name', lead_dict['source'])} - {lead_dict['name']}",
                "html": wrap_email(content),
                "reply_to": lead_dict['email']
            })
            email_sent = True

            # Send branded confirmation email to the lead (with PDF attachment if available)
            lead_name = lead_dict.get('name', 'Investor')
            expose_name = lead_dict.get('expose_name', 'Investment Exposé')
            is_praxisleitfaden = lead_dict.get('source', '') == 'praxisleitfaden'
            is_whitepaper = lead_dict.get('source', '') == 'whitepaper'
            is_us_brief = lead_dict.get('source', '') == 'us_strategy_brief'

            if is_praxisleitfaden or is_whitepaper or is_us_brief:
                doc_title = "Strategischer Plan 2026: Markteintritt &amp; Investitionssicherheit Westbalkan" if is_whitepaper else ("Montenegro Strategy Brief 2026" if is_us_brief else "Strategischer Plan 2026: Markteintritt &amp; Investitionssicherheit Westbalkan")
                doc_desc = "Dieses vertrauliche Whitepaper enthält 16 Seiten geballtes Expertenwissen zu Steuerstruktur, Gesellschaftsrecht, Banking, forensischer Immobilienstrategie und operativer Markteintrittsplanung für den Westbalkan." if is_whitepaper else ("A practical guide for Americans and Canadians exploring relocation and investment in Montenegro. Covering the 2028 EU accession window, tax optimization, real estate due diligence, and compliance." if is_us_brief else "Dieses vertrauliche Dokument enthält geballtes Expertenwissen zu Due Diligence, Steuerstruktur, Banking und rechtlichen Rahmenbedingungen für Ihren Markteintritt auf dem Westbalkan.")
                content = f"""
            <h2 style="color: #04151F; margin: 0 0 8px 0;">Vielen Dank, {lead_name}!</h2>
            <p style="color: #555; font-size: 14px; margin: 0 0 24px 0;">Ihr {'Whitepaper' if is_whitepaper else 'Praxisleitfaden'} ist als PDF im Anhang dieser E-Mail beigefügt.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 3px solid #C8A96A; margin-bottom: 24px;">
                <p style="color: #C8A96A; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 1px;">Ihr Dokument</p>
                <p style="color: #04151F; font-size: 16px; margin: 0; font-weight: bold;">{doc_title}</p>
            </div>
            <p style="color: #333; font-size: 14px; line-height: 22px; margin: 0 0 20px 0;">
                {doc_desc}
            </p>
            <p style="color: #333; font-size: 14px; line-height: 22px; margin: 0 0 24px 0;">
                Möchten Sie die Strategie mit einem unserer Experten besprechen? Wir beraten Sie gerne persönlich und unverbindlich.
            </p>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td align="center" style="padding: 8px 0 24px 0;">
                    <a href="https://euroadria.me/kontakt" style="display: inline-block; background-color: #C8A96A; color: #04151F; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 6px;">Kostenlose Beratung anfragen</a>
                </td></tr>
            </table>
            <p style="color: #999; font-size: 11px; margin: 0;">
                <strong style="color: #C8A96A;">Hinweis:</strong> Dieses Dokument ist vertraulich und nur für den persönlichen Gebrauch bestimmt.
            </p>
            """
            else:
                content = f"""
            <h2 style="color: #04151F; margin: 0 0 8px 0;">Vielen Dank, {lead_name}!</h2>
            <p style="color: #555; font-size: 14px; margin: 0 0 24px 0;">Ihr persönliches Investment Exposé wurde erstellt.</p>
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 3px solid #C8A96A; margin-bottom: 24px;">
                <p style="color: #C8A96A; font-size: 12px; margin: 0 0 6px 0; text-transform: uppercase; letter-spacing: 1px;">Ihr Download</p>
                <p style="color: #04151F; font-size: 16px; margin: 0; font-weight: bold;">{expose_name}</p>
            </div>
            <p style="color: #333; font-size: 14px; line-height: 22px; margin: 0 0 20px 0;">
                Sie haben soeben Ihr personalisiertes Investment Exposé heruntergeladen. Dieses Dokument enthält eine detaillierte 10-Jahres-Prognose basierend auf Ihren individuellen Eingaben.
            </p>
            <p style="color: #333; font-size: 14px; line-height: 22px; margin: 0 0 24px 0;">
                Möchten Sie die Analyse mit einem unserer Experten besprechen? Wir beraten Sie gerne persönlich und unverbindlich.
            </p>
            <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr><td align="center" style="padding: 8px 0 24px 0;">
                    <a href="https://euroadria.me/kontakt" style="display: inline-block; background-color: #C8A96A; color: #04151F; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 6px;">Kostenlose Beratung anfragen</a>
                </td></tr>
            </table>
            <p style="color: #999; font-size: 11px; margin: 0;">
                <strong style="color: #C8A96A;">Hinweis:</strong> Die im Expose dargestellten Zahlen dienen ausschliesslich zu Informationszwecken und stellen keine Anlageberatung dar.
            </p>
            """

            # Build email payload
            email_payload = {
                "from": "EuroAdria Corporate Solutions <noreply@euroadria.me>",
                "to": [lead_dict['email']],
                "subject": f"Your Strategy Brief — EuroAdria" if is_us_brief else (f"Ihr Whitepaper — EuroAdria" if is_whitepaper else (f"Ihr Praxisleitfaden — EuroAdria" if is_praxisleitfaden else f"Ihr Investment Exposé — {expose_name}")),
                "html": wrap_email(content),
                "reply_to": NOTIFICATION_EMAIL
            }

            # Attach PDF for Praxisleitfaden or Whitepaper downloads (from MongoDB)
            if is_praxisleitfaden or is_whitepaper or is_us_brief:
                try:
                    pdf_key = "pdf_us_strategy_brief" if is_us_brief else ("pdf_whitepaper" if is_whitepaper else "pdf_praxisleitfaden")
                    pdf_doc = await db.site_settings.find_one({"key": pdf_key}, {"_id": 0})
                    if pdf_doc:
                        # Reassemble chunked PDFs
                        if pdf_doc.get("chunked"):
                            chunks = await db.pdf_chunks.find({"pdf_key": pdf_key}, {"_id": 0}).sort("chunk_index", 1).to_list(100)
                            full_b64 = "".join([c["data"] for c in chunks])
                        else:
                            full_b64 = pdf_doc.get("base64", "")
                        
                        if full_b64:
                            email_payload["attachments"] = [{
                                "filename": pdf_doc.get("filename", "EuroAdria-Strategy-Brief.pdf" if is_us_brief else ("EuroAdria-Whitepaper.pdf" if is_whitepaper else "EuroAdria-Praxisleitfaden.pdf")),
                                "content": full_b64,
                                "content_type": "application/pdf"
                            }]
                            logger.info(f"PDF attachment added from MongoDB ({pdf_doc.get('size', 0)} bytes)")
                        else:
                            logger.warning(f"No PDF data found in MongoDB for {pdf_key}")
                    else:
                        logger.warning(f"No PDF found in MongoDB for {pdf_key}")
                except Exception as pdf_err:
                    logger.error(f"Failed to attach PDF: {pdf_err}")

            resend.Emails.send(email_payload)
        except Exception as e:
            logger.error(f"Failed to send lead email: {e}")

    return {"success": True, "email_sent": email_sent}


@router.get("/admin/leads")
async def get_leads(admin: str = Depends(verify_admin)):
    """Get all collected leads (Admin only)"""
    leads = await db.leads.find({}, {"_id": 0}).sort("submitted_at", -1).to_list(500)
    return leads
