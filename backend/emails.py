"""
Email functions: notification emails, contact confirmations, follow-up automation.
Uses Resend SDK.
"""
import resend
from datetime import datetime, timezone, timedelta
from core import db, logger, RESEND_API_KEY, NOTIFICATION_EMAIL


async def send_notification_email(comment_data: dict, article_title: str):
    """Send email notification for new comment using Resend"""
    if not RESEND_API_KEY:
        logger.warning("Resend API key not configured - skipping comment email notification")
        return

    try:
        resend.api_key = RESEND_API_KEY

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #002147; color: #ffffff; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #001233; padding: 30px; border-radius: 10px; border: 1px solid #D4AF37;">
                <h2 style="color: #D4AF37; margin-bottom: 20px;">Neuer Kommentar eingegangen</h2>
                <p style="color: #ffffff; margin-bottom: 10px;"><strong>Artikel:</strong> {article_title}</p>
                <p style="color: #ffffff; margin-bottom: 10px;"><strong>Name:</strong> {comment_data['name']}</p>
                <p style="color: #ffffff; margin-bottom: 10px;"><strong>E-Mail:</strong> {comment_data['email']}</p>
                <p style="color: #ffffff; margin-bottom: 20px;"><strong>Kommentar:</strong></p>
                <div style="background-color: #002147; padding: 15px; border-radius: 5px; border-left: 3px solid #D4AF37;">
                    <p style="color: #ffffff; margin: 0;">{comment_data['content']}</p>
                </div>
                <p style="color: #888888; margin-top: 30px; font-size: 12px;">
                    Dieser Kommentar wartet auf Freigabe im Admin-Panel.
                </p>
                <a href="https://euroadria.me/admin"
                   style="display: inline-block; margin-top: 20px; padding: 12px 24px; background-color: #D4AF37; color: #002147; text-decoration: none; border-radius: 5px; font-weight: bold;">
                    Zum Admin-Panel
                </a>
            </div>
        </body>
        </html>
        """

        resend.Emails.send({
            "from": "EuroAdria Corporate Solutions <noreply@euroadria.me>",
            "to": [NOTIFICATION_EMAIL],
            "subject": f"Neuer Kommentar auf EuroAdria: {article_title[:50]}",
            "html": html_content
        })

        logger.info(f"Notification email sent for comment by {comment_data['name']}")
    except Exception as e:
        logger.error(f"Failed to send notification email: {e}")


async def send_contact_email(contact_data: dict):
    """Send email notification for contact form submission using Resend"""
    if not RESEND_API_KEY:
        logger.warning("Resend API key not configured - skipping contact email")
        return False

    try:
        resend.api_key = RESEND_API_KEY
        logger.info(f"Attempting to send contact email with key: {RESEND_API_KEY[:8]}... from noreply@euroadria.me to {NOTIFICATION_EMAIL}")

        html_content = f"""
        <html>
        <body style="font-family: Arial, sans-serif; background-color: #0A1628; padding: 20px;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #1a2744; border-radius: 10px; padding: 30px;">
                <h2 style="color: #c8a96a; margin-bottom: 20px;">Neue Kontaktanfrage</h2>
                <div style="background-color: #0A1628; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <p style="color: #ffffff; margin-bottom: 10px;"><strong>Name:</strong> {contact_data['name']}</p>
                    <p style="color: #ffffff; margin-bottom: 10px;"><strong>E-Mail:</strong> {contact_data['email']}</p>
                    <p style="color: #ffffff; margin-bottom: 10px;"><strong>Telefon:</strong> {contact_data.get('phone', 'Nicht angegeben')}</p>
                    <p style="color: #ffffff; margin-bottom: 10px;"><strong>Betreff:</strong> {contact_data['subject']}</p>
                </div>
                <div style="background-color: #0A1628; padding: 20px; border-radius: 8px;">
                    <p style="color: #c8a96a; margin-bottom: 10px;"><strong>Nachricht:</strong></p>
                    <p style="color: #ffffff; white-space: pre-wrap;">{contact_data['message']}</p>
                </div>
                <hr style="border-color: #c8a96a; margin: 20px 0;">
                <p style="color: #888; font-size: 12px;">Diese Nachricht wurde über das Kontaktformular auf euroadria.me gesendet.</p>
            </div>
        </body>
        </html>
        """

        params = {
            "from": "EuroAdria Kontakt <noreply@euroadria.me>",
            "to": [NOTIFICATION_EMAIL],
            "subject": f"Neue Kontaktanfrage: {contact_data['subject']}",
            "html": html_content,
            "reply_to": contact_data['email']
        }

        email = resend.Emails.send(params)
        logger.info(f"Contact email sent successfully, id: {getattr(email, 'id', 'unknown')}")
        return True
    except Exception as e:
        logger.error(f"RESEND FAILED: {type(e).__name__}: {e}")
        return False


async def followup_email_loop():
    """Check every hour for leads that need a 3-day follow-up email"""
    import asyncio
    await asyncio.sleep(60)  # Wait 1 min after startup
    while True:
        try:
            three_days_ago = (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
            four_days_ago = (datetime.now(timezone.utc) - timedelta(days=4)).isoformat()

            # Find leads from ~3 days ago that haven't received follow-up
            leads = await db.crm_leads.find({
                "created_at": {"$gte": four_days_ago, "$lte": three_days_ago},
                "follow_up_sent": {"$ne": True},
                "lead_source": {"$in": ["expose_download", "simulation_pdf", "kontaktformular"]}
            }, {"_id": 0}).to_list(50)

            if leads and RESEND_API_KEY:
                resend.api_key = RESEND_API_KEY
                for lead in leads:
                    try:
                        name = lead.get("name", "Investor")
                        email = lead.get("email", "")
                        if not email:
                            continue

                        followup_html = f"""
                        <html>
                        <body style="margin:0;padding:0;background-color:#04151F;font-family:Arial,Helvetica,sans-serif;">
                            <div style="max-width:600px;margin:0 auto;background-color:#04151F;">
                                <div style="background-color:#071E2D;padding:24px 30px;border-bottom:2px solid #C8A96A;">
                                    <span style="color:#FFFFFF;font-size:16px;font-weight:bold;letter-spacing:0.5px;">EUROADRIA CORPORATE SOLUTIONS</span><br/>
                                    <span style="color:#C8A96A;font-size:11px;">Beratung & Angebotsplattform</span>
                                </div>
                                <div style="padding:32px 30px;">
                                    <h1 style="color:#FFFFFF;font-size:22px;margin:0 0 16px 0;">Hallo {name},</h1>
                                    <p style="color:#D0D8E0;font-size:14px;line-height:22px;margin:0 0 20px 0;">
                                        vor ein paar Tagen haben Sie unsere Investment-Analyse genutzt. Haben Sie noch Fragen zu den Ergebnissen oder zur Marktsituation in der Adria-Region?
                                    </p>
                                    <div style="background-color:#0D2A3D;border-radius:8px;padding:20px;border-left:3px solid #C8A96A;margin-bottom:24px;">
                                        <p style="color:#C8A96A;font-size:13px;font-weight:bold;margin:0 0 8px 0;">Was wir für Sie tun können:</p>
                                        <p style="color:#D0D8E0;font-size:13px;line-height:20px;margin:0;">
                                            &#8226; Persönliche Analyse Ihrer Investment-Strategie<br/>
                                            &#8226; Aktuelle Marktdaten und Standort-Empfehlungen<br/>
                                            &#8226; Rechtliche und steuerliche Beratung vor Ort
                                        </p>
                                    </div>
                                    <p style="color:#D0D8E0;font-size:14px;line-height:22px;margin:0 0 24px 0;">
                                        Buchen Sie jetzt ein <strong style="color:#C8A96A;">kostenloses 15-Minuten-Gespräch</strong> mit einem unserer Experten — unverbindlich und vertraulich.
                                    </p>
                                    <table cellpadding="0" cellspacing="0" border="0" width="100%">
                                        <tr>
                                            <td align="center" style="padding:8px 0 24px 0;">
                                                <a href="https://euroadria.me/kontakt" style="display:inline-block;background-color:#C8A96A;color:#04151F;font-size:14px;font-weight:bold;text-decoration:none;padding:14px 32px;border-radius:6px;">
                                                    Kostenloses Beratungsgespräch buchen
                                                </a>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="color:#5A6A78;font-size:11px;margin:0;">
                                        Sie erhalten diese E-Mail, weil Sie unsere Investment-Tools auf euroadria.me genutzt haben.
                                        Falls Sie keine weiteren E-Mails wünschen, antworten Sie einfach mit "Abmelden".
                                    </p>
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
                            "to": [email],
                            "subject": f"{name}, haben Sie noch Fragen zu Ihrer Investment-Analyse?",
                            "html": followup_html,
                            "reply_to": NOTIFICATION_EMAIL
                        })

                        await db.crm_leads.update_one(
                            {"id": lead["id"]},
                            {"$set": {"follow_up_sent": True, "follow_up_at": datetime.now(timezone.utc).isoformat()}}
                        )
                        logger.info(f"Follow-up email sent to {email}")
                    except Exception as e:
                        logger.error(f"Follow-up email failed for {email}: {e}")

                if leads:
                    logger.info(f"Follow-up check: {len(leads)} emails processed")
        except Exception as e:
            logger.error(f"Follow-up loop error: {e}")

        await asyncio.sleep(3600)  # Check every hour
