"""Newsletter endpoints (Brevo integration)."""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone
import requests as http_requests

from core import db, logger, verify_admin, BREVO_API_KEY, BREVO_LIST_ID
from models import NewsletterSubscribe

router = APIRouter()


def brevo_request(method: str, endpoint: str, data: dict = None):
    """Make a request to Brevo API"""
    url = f"https://api.brevo.com/v3/{endpoint}"
    headers = {"api-key": BREVO_API_KEY, "content-type": "application/json"}
    if method == "GET":
        r = http_requests.get(url, headers=headers, params=data)
    elif method == "POST":
        r = http_requests.post(url, headers=headers, json=data)
    elif method == "PUT":
        r = http_requests.put(url, headers=headers, json=data)
    else:
        raise ValueError(f"Unsupported method: {method}")
    return r


@router.post("/newsletter/subscribe")
async def newsletter_subscribe(sub: NewsletterSubscribe):
    """Subscribe to newsletter via Brevo"""
    if not BREVO_API_KEY:
        raise HTTPException(status_code=500, detail="Newsletter nicht konfiguriert")

    payload = {
        "email": sub.email,
        "updateEnabled": True,
        "listIds": [BREVO_LIST_ID],
    }
    if sub.name:
        payload["attributes"] = {"VORNAME": sub.name}

    r = brevo_request("POST", "contacts", payload)

    if r.status_code in (200, 201, 204):
        existing = await db.newsletter_subscribers.find_one({"email": sub.email})
        is_new = existing is None

        await db.newsletter_subscribers.update_one(
            {"email": sub.email},
            {"$set": {"email": sub.email, "name": sub.name or "", "subscribed_at": datetime.now(timezone.utc).isoformat(), "active": True}},
            upsert=True
        )

        if is_new:
            await db.leads.insert_one({
                "name": sub.name or "",
                "email": sub.email,
                "source": "newsletter",
                "expose_name": "Newsletter-Anmeldung",
                "type": "newsletter",
                "submitted_at": datetime.now(timezone.utc).isoformat()
            })

        # Send welcome email ONLY for new subscribers
        if is_new:
            try:
                welcome_html = f"""
            <html>
            <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
                <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="background: #ffffff; padding: 28px 32px; text-align: center; border-bottom: 2px solid #C8A96A;">
                        <img src="https://euroadria.me/euroadria-logo.png" alt="EuroAdria" style="height: 50px;">
                    </div>
                    <div style="padding: 32px; color: #333; font-size: 15px; line-height: 1.7;">
                        <h2 style="color: #04151F; font-size: 22px; margin-bottom: 16px;">Willkommen bei EuroAdria Corporate Solutions!</h2>
                        <p>Hallo{(' ' + sub.name) if sub.name else ''},</p>
                        <p>vielen Dank für Ihre Anmeldung zum EuroAdria Newsletter!
                        Sie erhalten ab sofort exklusive Investment-Insights, Marktanalysen
                        und Neuigkeiten zu Immobilien-Projekten am Balkan.</p>
                        <p style="margin-top: 20px;">
                            <a href="https://euroadria.me" style="display: inline-block; background: #C8A96A; color: #04151F; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold;">Zur Plattform</a>
                        </p>
                    </div>
                    <div style="padding: 16px 32px; background: #f8f8f8; border-top: 1px solid #eee; border-bottom: 1px solid #eee;">
                        <p style="color: #999; font-size: 12px; margin: 0; text-align: center;">
                            Sie erhalten diese E-Mail, weil Sie sich für den EuroAdria Newsletter angemeldet haben.<br>
                            Sie können sich jederzeit mit einem Klick
                            <a href="https://euroadria.me/newsletter/abmelden?email={sub.email}" style="color: #C8A96A;">hier abmelden</a>
                            , unkompliziert und sofort wirksam.
                        </p>
                    </div>
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
                                        Web: <a href="https://www.euroadria.me" style="color: #C8A96A; text-decoration: none;">www.euroadria.me</a><br>
                                        Investment: <a href="https://euroadria.me" style="color: #C8A96A; text-decoration: none;">euroadria.me</a>
                                    </p>
                                    <p style="margin: 0; font-size: 10px; color: #999; line-height: 1.5;">
                                        Company registration no.: 22147382 | Tax ID (PIB): 115356237<br>
                                        Director: Milena Bubanja
                                    </p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </body>
            </html>
            """
                brevo_request("POST", "smtp/email", {
                    "to": [{"email": sub.email, "name": sub.name or sub.email}],
                    "sender": {"email": "office@euroadria.me", "name": "EuroAdria"},
                    "subject": "Willkommen beim EuroAdria Newsletter!",
                    "htmlContent": welcome_html
                })
            except Exception as e:
                logger.error(f"Welcome email failed: {e}")

        return {"success": True, "message": "Erfolgreich zum Newsletter angemeldet!" if is_new else "Sie sind bereits angemeldet!"}

    elif r.status_code == 400 and "already exist" in r.text.lower():
        return {"success": True, "message": "Sie sind bereits angemeldet!"}
    else:
        logger.error(f"Brevo subscribe error: {r.status_code} {r.text}")
        raise HTTPException(status_code=400, detail="Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.")


@router.post("/newsletter/unsubscribe")
async def newsletter_unsubscribe(data: dict):
    """Unsubscribe from newsletter"""
    email = data.get("email", "")
    if not email:
        raise HTTPException(status_code=400, detail="E-Mail erforderlich")

    if BREVO_API_KEY:
        try:
            brevo_request("POST", f"contacts/lists/{BREVO_LIST_ID}/contacts/remove", {"emails": [email]})
        except Exception as e:
            logger.error(f"Brevo unsubscribe error: {e}")

    await db.newsletter_subscribers.update_one(
        {"email": email},
        {"$set": {"active": False, "unsubscribed_at": datetime.now(timezone.utc).isoformat()}}
    )

    return {"success": True, "message": "Sie wurden erfolgreich abgemeldet."}


@router.get("/admin/newsletter/subscribers")
async def get_newsletter_subscribers(admin: str = Depends(verify_admin)):
    """Get all newsletter subscribers"""
    r = brevo_request("GET", f"contacts/lists/{BREVO_LIST_ID}/contacts?limit=500")
    brevo_contacts = []
    if r.ok:
        data = r.json()
        brevo_contacts = [{"email": c["email"], "name": c.get("attributes", {}).get("VORNAME", ""), "subscribed": True} for c in data.get("contacts", [])]

    local_count = await db.newsletter_subscribers.count_documents({"active": True})

    return {
        "subscribers": brevo_contacts,
        "total": len(brevo_contacts),
        "local_count": local_count
    }


@router.delete("/admin/newsletter/subscribers/{email}")
async def admin_delete_subscriber(email: str, admin: str = Depends(verify_admin)):
    """Admin: Delete a newsletter subscriber"""
    from urllib.parse import unquote
    email = unquote(email)

    if BREVO_API_KEY:
        try:
            brevo_request("POST", f"contacts/lists/{BREVO_LIST_ID}/contacts/remove", {"emails": [email]})
        except Exception as e:
            logger.error(f"Brevo remove error: {e}")

    await db.newsletter_subscribers.delete_one({"email": email})

    return {"success": True, "message": f"{email} wurde gelöscht."}


@router.post("/admin/newsletter/send")
async def send_newsletter(data: dict, admin: str = Depends(verify_admin)):
    """Send a newsletter campaign via Brevo"""
    if not BREVO_API_KEY:
        raise HTTPException(status_code=500, detail="Brevo nicht konfiguriert")

    subject = data.get("subject", "")
    content = data.get("content", "")

    if not subject or not content:
        raise HTTPException(status_code=400, detail="Betreff und Inhalt sind erforderlich")

    html_body = f"""
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px; margin: 0;">
        <div style="max-width: 640px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="background: #ffffff; padding: 28px 32px; text-align: center; border-bottom: 2px solid #C8A96A;">
                <img src="https://euroadria.me/euroadria-logo.png" alt="EuroAdria" style="height: 50px;">
            </div>
            <div style="padding: 32px; color: #333; font-size: 15px; line-height: 1.7;">
                {content}
            </div>
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
                                Web: <a href="https://www.euroadria.me" style="color: #C8A96A; text-decoration: none;">www.euroadria.me</a><br>
                                Investment: <a href="https://euroadria.me" style="color: #C8A96A; text-decoration: none;">euroadria.me</a>
                            </p>
                            <p style="margin: 0; font-size: 10px; color: #999; line-height: 1.5;">
                                Company registration no.: 22147382 | Tax ID (PIB): 115356237<br>
                                Director: Milena Bubanja
                            </p>
                        </td>
                    </tr>
                </table>
            </div>
            <div style="background: #04151F; padding: 16px 32px; text-align: center;">
                <p style="color: #888; font-size: 11px; margin: 0;">
                    <a href="{{{{unsubscribe}}}}" style="color: #C8A96A;">Newsletter abbestellen</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    campaign_data = {
        "name": f"Newsletter: {subject} ({datetime.now(timezone.utc).strftime('%d.%m.%Y')})",
        "sender": {"email": "office@euroadria.me", "name": "EuroAdria"},
        "subject": subject,
        "htmlContent": html_body,
        "recipients": {"listIds": [BREVO_LIST_ID]},
        "type": "classic"
    }

    r = brevo_request("POST", "emailCampaigns", campaign_data)

    if not r.ok:
        logger.error(f"Brevo campaign create error: {r.status_code} {r.text}")
        raise HTTPException(status_code=400, detail=f"Kampagne konnte nicht erstellt werden: {r.text}")

    campaign_id = r.json().get("id")

    r2 = brevo_request("POST", f"emailCampaigns/{campaign_id}/sendNow", {})

    if r2.status_code in (200, 204):
        await db.newsletter_campaigns.insert_one({
            "campaign_id": campaign_id,
            "subject": subject,
            "sent_at": datetime.now(timezone.utc).isoformat(),
            "list_id": BREVO_LIST_ID
        })
        return {"success": True, "campaign_id": campaign_id, "message": "Newsletter wurde versendet!"}
    else:
        logger.error(f"Brevo send error: {r2.status_code} {r2.text}")
        raise HTTPException(status_code=400, detail=f"Newsletter konnte nicht gesendet werden: {r2.text}")
