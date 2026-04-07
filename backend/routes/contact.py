"""Contact form & Lead capture endpoints."""
from fastapi import APIRouter, Depends
from datetime import datetime, timezone
import uuid
import resend

from core import db, logger, verify_admin, RESEND_API_KEY, NOTIFICATION_EMAIL
from models import ContactForm, LeadForm
from emails import send_contact_email

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
            confirmation_html = f"""
            <html>
            <body style="margin:0;padding:0;background-color:#04151F;font-family:Arial,Helvetica,sans-serif;">
                <div style="max-width:600px;margin:0 auto;background-color:#04151F;">
                    <div style="background-color:#071E2D;padding:24px 30px;border-bottom:2px solid #C8A96A;">
                        <span style="color:#FFFFFF;font-size:16px;font-weight:bold;letter-spacing:0.5px;">EUROADRIA CORPORATE SOLUTIONS</span><br/>
                        <span style="color:#C8A96A;font-size:11px;">Beratung & Angebotsplattform</span>
                    </div>
                    <div style="padding:32px 30px;">
                        <h1 style="color:#FFFFFF;font-size:22px;margin:0 0 8px 0;">Vielen Dank, {customer_name}!</h1>
                        <p style="color:#8896A3;font-size:14px;margin:0 0 24px 0;">Wir haben Ihre Anfrage erhalten und melden uns zeitnah bei Ihnen.</p>
                        <div style="background-color:#0D2A3D;border-radius:8px;padding:20px;border-left:3px solid #C8A96A;margin-bottom:24px;">
                            <p style="color:#C8A96A;font-size:12px;margin:0 0 6px 0;text-transform:uppercase;letter-spacing:1px;">Ihre Anfrage</p>
                            <p style="color:#FFFFFF;font-size:16px;margin:0 0 8px 0;font-weight:bold;">{contact_dict.get('subject', 'Allgemein')}</p>
                            <p style="color:#D0D8E0;font-size:13px;margin:0;line-height:20px;">{contact_dict.get('message', '')[:300]}{'...' if len(contact_dict.get('message', '')) > 300 else ''}</p>
                        </div>
                        <p style="color:#D0D8E0;font-size:14px;line-height:22px;margin:0 0 24px 0;">
                            Unser Team wird sich innerhalb von 24 Stunden bei Ihnen melden. In der Zwischenzeit können Sie unsere aktuellen Marktanalysen und Investment-Tools nutzen.
                        </p>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td align="center" style="padding:8px 0 24px 0;">
                                    <a href="https://euroadria.me/investment/simulation" style="display:inline-block;background-color:#C8A96A;color:#04151F;font-size:14px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:6px;">
                                        Investment-Simulator starten
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div style="background-color:#071E2D;padding:20px 30px;border-top:1px solid #1A3040;">
                        <p style="color:#8896A3;font-size:11px;margin:0 0 4px 0;">EuroAdria Corporate Solutions</p>
                        <p style="color:#5A6A78;font-size:10px;margin:0;">euroadria.me | office@euroadria.me | +382 68 559 776</p>
                    </div>
                </div>
            </body>
            </html>
            """
            resend.Emails.send({
                "from": "EuroAdria Corporate Solutions <noreply@euroadria.me>",
                "to": [contact_dict['email']],
                "subject": f"Ihre Anfrage bei EuroAdria — {contact_dict.get('subject', 'Wir melden uns!')}",
                "html": confirmation_html,
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
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #0A1628; padding: 20px;">
                <div style="max-width: 600px; margin: 0 auto; background-color: #1a2744; border-radius: 10px; padding: 30px;">
                    <h2 style="color: #c8a96a; margin-bottom: 20px;">Neuer Exposé-Download Lead</h2>
                    <div style="background-color: #0A1628; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                        <p style="color: #ffffff; margin-bottom: 10px;"><strong>Name:</strong> {lead_dict['name']}</p>
                        <p style="color: #ffffff; margin-bottom: 10px;"><strong>E-Mail:</strong> {lead_dict['email']}</p>
                        <p style="color: #ffffff; margin-bottom: 10px;"><strong>Telefon:</strong> {lead_dict.get('phone', 'Nicht angegeben')}</p>
                        <p style="color: #ffffff; margin-bottom: 10px;"><strong>Exposé:</strong> {lead_dict.get('expose_name', lead_dict['source'])}</p>
                    </div>
                    <hr style="border-color: #c8a96a; margin: 20px 0;">
                    <p style="color: #888; font-size: 12px;">Dieser Lead wurde über den Exposé-Download auf euroadria.me generiert.</p>
                </div>
            </body>
            </html>
            """
            resend.Emails.send({
                "from": "EuroAdria Leads <noreply@euroadria.me>",
                "to": [NOTIFICATION_EMAIL],
                "subject": f"Neuer Lead: {lead_dict.get('expose_name', lead_dict['source'])} - {lead_dict['name']}",
                "html": html_content,
                "reply_to": lead_dict['email']
            })
            email_sent = True

            # Send branded confirmation email to the lead
            lead_name = lead_dict.get('name', 'Investor')
            confirmation_html = f"""
            <html>
            <body style="margin:0;padding:0;background-color:#04151F;font-family:Arial,Helvetica,sans-serif;">
                <div style="max-width:600px;margin:0 auto;background-color:#04151F;">
                    <div style="background-color:#071E2D;padding:24px 30px;border-bottom:2px solid #C8A96A;">
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td>
                                    <span style="color:#FFFFFF;font-size:16px;font-weight:bold;letter-spacing:0.5px;">EUROADRIA CORPORATE SOLUTIONS</span><br/>
                                    <span style="color:#C8A96A;font-size:11px;">Beratung & Angebotsplattform</span>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div style="padding:32px 30px;">
                        <h1 style="color:#FFFFFF;font-size:22px;margin:0 0 8px 0;">Vielen Dank, {lead_name}!</h1>
                        <p style="color:#8896A3;font-size:14px;margin:0 0 24px 0;">Ihr persönliches Investment Exposé wurde erstellt.</p>
                        <div style="background-color:#0D2A3D;border-radius:8px;padding:20px;border-left:3px solid #C8A96A;margin-bottom:24px;">
                            <p style="color:#C8A96A;font-size:12px;margin:0 0 6px 0;text-transform:uppercase;letter-spacing:1px;">Ihr Download</p>
                            <p style="color:#FFFFFF;font-size:16px;margin:0;font-weight:bold;">{lead_dict.get('expose_name', 'Investment Exposé')}</p>
                        </div>
                        <p style="color:#D0D8E0;font-size:14px;line-height:22px;margin:0 0 24px 0;">
                            Sie haben soeben Ihr personalisiertes Investment Exposé heruntergeladen. Dieses Dokument enthält eine detaillierte 10-Jahres-Prognose basierend auf Ihren individuellen Eingaben.
                        </p>
                        <p style="color:#D0D8E0;font-size:14px;line-height:22px;margin:0 0 24px 0;">
                            Möchten Sie die Analyse mit einem unserer Experten besprechen? Wir beraten Sie gerne persönlich und unverbindlich.
                        </p>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr>
                                <td align="center" style="padding:8px 0 24px 0;">
                                    <a href="https://euroadria.me/kontakt" style="display:inline-block;background-color:#C8A96A;color:#04151F;font-size:14px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:6px;">
                                        Kostenlose Beratung anfragen
                                    </a>
                                </td>
                            </tr>
                        </table>
                        <div style="border-top:1px solid #1A3040;padding-top:20px;">
                            <p style="color:#8896A3;font-size:12px;line-height:18px;margin:0;">
                                <strong style="color:#C8A96A;">Hinweis:</strong> Die im Exposé dargestellten Zahlen dienen ausschließlich zu Informationszwecken und stellen keine Anlageberatung dar.
                            </p>
                        </div>
                    </div>
                    <div style="background-color:#071E2D;padding:20px 30px;border-top:1px solid #1A3040;">
                        <p style="color:#8896A3;font-size:11px;margin:0 0 4px 0;">EuroAdria Corporate Solutions</p>
                        <p style="color:#5A6A78;font-size:10px;margin:0;">euroadria.me | office@euroadria.me</p>
                    </div>
                </div>
            </body>
            </html>
            """
            resend.Emails.send({
                "from": "EuroAdria Corporate Solutions <noreply@euroadria.me>",
                "to": [lead_dict['email']],
                "subject": f"Ihr Investment Exposé — {lead_dict.get('expose_name', 'EuroAdria')}",
                "html": confirmation_html,
                "reply_to": NOTIFICATION_EMAIL
            })
        except Exception as e:
            logger.error(f"Failed to send lead email: {e}")

    return {"success": True, "email_sent": email_sent}


@router.get("/admin/leads")
async def get_leads(admin: str = Depends(verify_admin)):
    """Get all collected leads (Admin only)"""
    leads = await db.leads.find({}, {"_id": 0}).sort("submitted_at", -1).to_list(500)
    return leads
