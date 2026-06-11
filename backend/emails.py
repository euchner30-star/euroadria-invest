"""
Email functions: notification emails, contact confirmations, follow-up automation.
Uses Resend SDK. All emails use the unified light EuroAdria branding.
"""
import resend
from datetime import datetime, timezone, timedelta
from core import db, logger, RESEND_API_KEY, NOTIFICATION_EMAIL


FOOTER_HTML = """
<div style="padding: 24px 32px; border-top: 1px solid #e5e7eb; background: #fafafa;">
    <table style="width: 100%;">
        <tr>
            <td style="vertical-align: top; padding-right: 20px; width: 130px;">
                <img src="https://euroadria.me/euroadria-logo.png" alt="EuroAdria" style="width: 110px;">
            </td>
            <td style="vertical-align: top; font-size: 12px; color: #555; line-height: 1.6;">
                <p style="margin: 0 0 2px; font-size: 14px; font-weight: bold; color: #04151F;">EuroAdria Corporate Solutions</p>
                <p style="margin: 0 0 8px; font-size: 11px; color: #888;">a brand of <strong style="color: #333;">Montaris &amp; Co. d.o.o.</strong></p>
                <p style="margin: 0 0 8px; color: #555;">Montaris &amp; Co. d.o.o.<br>Marka Miljanova 12<br>21000 Novi Sad, Serbia</p>
                <p style="margin: 0 0 8px;">
                    Tel.: <a href="tel:+38268559776" style="color: #C8A96A; text-decoration: none;">+382 68 559 776</a><br>
                    E-Mail: <a href="mailto:office@euroadria.me" style="color: #C8A96A; text-decoration: none;">office@euroadria.me</a><br>
                    Web: <a href="https://www.euroadria.me" style="color: #C8A96A; text-decoration: none;">www.euroadria.me</a>
                </p>
            </td>
        </tr>
    </table>
</div>
<div style="background: #04151F; padding: 16px 32px; text-align: center;">
    <p style="color: #888; font-size: 11px; margin: 0;">EuroAdria Corporate Solutions | euroadria.me</p>
</div>
"""


def wrap_email(content: str, lang: str = "de") -> str:
    """Wrap email content in the unified light EuroAdria template."""
    tagline = "Advisory &amp; Investment Platform" if lang == "en" else "Beratung &amp; Angebotsplattform"
    return f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: #ffffff; padding: 28px 32px; text-align: center; border-bottom: 2px solid #C8A96A;">
                <img src="https://euroadria.me/euroadria-logo.png" alt="EuroAdria" style="height: 50px; margin-bottom: 8px;"><br>
                <span style="font-size: 14px; font-weight: bold; color: #04151F; letter-spacing: 1.5px;">EUROADRIA CORPORATE SOLUTIONS</span><br>
                <span style="font-size: 11px; color: #C8A96A; letter-spacing: 0.5px;">{tagline}</span>
            </div>
            <div style="padding: 32px; color: #333; font-size: 15px; line-height: 1.7;">
                {content}
            </div>
            {FOOTER_HTML}
        </div>
    </body>
    </html>
    """


async def send_notification_email(comment_data: dict, article_title: str):
    """Send email notification for new comment using Resend"""
    if not RESEND_API_KEY:
        logger.warning("Resend API key not configured - skipping comment email notification")
        return

    try:
        resend.api_key = RESEND_API_KEY

        content = f"""
        <h2 style="color: #04151F; margin: 0 0 20px 0;">Neuer Kommentar eingegangen</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 3px solid #C8A96A; margin-bottom: 20px;">
            <p style="margin: 0 0 8px; color: #333;"><strong>Artikel:</strong> {article_title}</p>
            <p style="margin: 0 0 8px; color: #333;"><strong>Name:</strong> {comment_data['name']}</p>
            <p style="margin: 0; color: #333;"><strong>E-Mail:</strong> {comment_data['email']}</p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #C8A96A; font-weight: bold; margin: 0 0 8px;">Kommentar:</p>
            <p style="color: #333; margin: 0;">{comment_data['content']}</p>
        </div>
        <p style="color: #888; font-size: 13px;">Dieser Kommentar wartet auf Freigabe im Admin-Panel.</p>
        <table cellpadding="0" cellspacing="0" border="0" width="100%">
            <tr><td align="center" style="padding: 8px 0;">
                <a href="https://euroadria.me/admin" style="display: inline-block; background-color: #C8A96A; color: #04151F; font-size: 14px; font-weight: bold; text-decoration: none; padding: 12px 28px; border-radius: 6px;">Zum Admin-Panel</a>
            </td></tr>
        </table>
        """

        resend.Emails.send({
            "from": "EuroAdria Corporate Solutions <noreply@euroadria.me>",
            "to": [NOTIFICATION_EMAIL],
            "subject": f"Neuer Kommentar auf EuroAdria: {article_title[:50]}",
            "html": wrap_email(content)
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

        content = f"""
        <h2 style="color: #04151F; margin: 0 0 20px 0;">Neue Kontaktanfrage</h2>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 3px solid #C8A96A; margin-bottom: 20px;">
            <p style="margin: 0 0 8px; color: #333;"><strong>Name:</strong> {contact_data['name']}</p>
            <p style="margin: 0 0 8px; color: #333;"><strong>E-Mail:</strong> {contact_data['email']}</p>
            <p style="margin: 0 0 8px; color: #333;"><strong>Telefon:</strong> {contact_data.get('phone', 'Nicht angegeben')}</p>
            <p style="margin: 0; color: #333;"><strong>Betreff:</strong> {contact_data['subject']}</p>
        </div>
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p style="color: #C8A96A; font-weight: bold; margin: 0 0 8px;">Nachricht:</p>
            <p style="color: #333; margin: 0; white-space: pre-wrap;">{contact_data['message']}</p>
        </div>
        <p style="color: #888; font-size: 12px;">Diese Nachricht wurde über das Kontaktformular auf euroadria.me gesendet.</p>
        """

        resend.Emails.send({
            "from": "EuroAdria Kontakt <noreply@euroadria.me>",
            "to": [NOTIFICATION_EMAIL],
            "subject": f"Neue Kontaktanfrage: {contact_data['subject']}",
            "html": wrap_email(content),
            "reply_to": contact_data['email']
        })
        logger.info(f"Contact email sent successfully")
        return True
    except Exception as e:
        logger.error(f"RESEND FAILED: {type(e).__name__}: {e}")
        return False


async def followup_email_loop():
    """Check every hour for leads that need a 3-day follow-up email"""
    import asyncio
    await asyncio.sleep(60)
    while True:
        try:
            three_days_ago = (datetime.now(timezone.utc) - timedelta(days=3)).isoformat()
            four_days_ago = (datetime.now(timezone.utc) - timedelta(days=4)).isoformat()

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

                        content = f"""
                        <h2 style="color: #04151F; margin: 0 0 16px 0;">Hallo {name},</h2>
                        <p style="color: #333; margin: 0 0 20px 0;">
                            vor ein paar Tagen haben Sie unsere Investment-Analyse genutzt. Haben Sie noch Fragen zu den Ergebnissen oder zur Marktsituation in der Adria-Region?
                        </p>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 3px solid #C8A96A; margin-bottom: 24px;">
                            <p style="color: #C8A96A; font-weight: bold; margin: 0 0 8px;">Was wir für Sie tun können:</p>
                            <p style="color: #333; margin: 0; line-height: 24px;">
                                &#8226; Persönliche Analyse Ihrer Investment-Strategie<br>
                                &#8226; Aktuelle Marktdaten und Standort-Empfehlungen<br>
                                &#8226; Rechtliche und steuerliche Beratung vor Ort
                            </p>
                        </div>
                        <p style="color: #333; margin: 0 0 24px 0;">
                            Buchen Sie jetzt ein <strong style="color: #C8A96A;">kostenloses 15-Minuten-Gespräch</strong> mit einem unserer Experten — unverbindlich und vertraulich.
                        </p>
                        <table cellpadding="0" cellspacing="0" border="0" width="100%">
                            <tr><td align="center" style="padding: 8px 0 24px 0;">
                                <a href="https://euroadria.me/kontakt" style="display: inline-block; background-color: #C8A96A; color: #04151F; font-size: 14px; font-weight: bold; text-decoration: none; padding: 14px 32px; border-radius: 6px;">Kostenloses Beratungsgespräch buchen</a>
                            </td></tr>
                        </table>
                        <p style="color: #999; font-size: 11px; margin: 0;">
                            Sie erhalten diese E-Mail, weil Sie unsere Investment-Tools auf euroadria.me genutzt haben.
                            Falls Sie keine weiteren E-Mails wünschen, antworten Sie einfach mit "Abmelden".
                        </p>
                        """

                        resend.Emails.send({
                            "from": "EuroAdria Corporate Solutions <noreply@euroadria.me>",
                            "to": [email],
                            "subject": f"{name}, haben Sie noch Fragen zu Ihrer Investment-Analyse?",
                            "html": wrap_email(content),
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

        await asyncio.sleep(3600)
