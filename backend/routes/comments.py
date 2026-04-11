"""Comments endpoints (public + admin moderation)."""
from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from typing import Optional
from datetime import datetime, timezone
import uuid

from core import db, verify_admin
from models import CommentCreate, CommentResponse
from emails import send_notification_email

router = APIRouter()


@router.get("/comments/article/{article_id}")
async def get_approved_comments(article_id: int):
    """Get all approved comments for an article (Public), including replies"""
    comments = await db.comments.find(
        {"articleId": article_id, "status": "approved"},
        {"_id": 0, "email": 0}
    ).sort("createdAt", 1).to_list(200)
    return comments


@router.get("/comments/slug/{article_slug}")
async def get_approved_comments_by_slug(article_slug: str):
    """Get all approved comments for an article by slug (Public), including replies"""
    comments = await db.comments.find(
        {"articleSlug": article_slug, "status": "approved"},
        {"_id": 0, "email": 0}
    ).sort("createdAt", 1).to_list(200)
    return comments


@router.post("/comments")
async def create_comment(comment: CommentCreate, background_tasks: BackgroundTasks):
    """Create a new comment. Auto-approves if the email has a previously approved comment."""
    article = await db.articles.find_one({"id": comment.articleId}, {"title": 1})
    article_title = article.get("title", "Unknown Article") if article else "Unknown Article"

    # Auto-approve: check if this email already has an approved comment
    previously_approved = await db.comments.find_one(
        {"email": comment.email, "status": "approved"}
    )
    auto_approved = previously_approved is not None

    comment_id = str(uuid.uuid4())
    comment_dict = {
        "id": comment_id,
        **comment.model_dump(),
        "status": "approved" if auto_approved else "pending",
        "createdAt": datetime.now(timezone.utc).isoformat()
    }

    await db.comments.insert_one(comment_dict)

    # Create lead from comment (if email not already in leads)
    existing_lead = await db.leads.find_one({"email": comment.email})
    if not existing_lead:
        lead_dict = {
            "id": str(uuid.uuid4()),
            "name": comment.name,
            "email": comment.email,
            "source": "blog_comment",
            "expose_name": article_title,
            "submitted_at": datetime.now(timezone.utc).isoformat()
        }
        await db.leads.insert_one(lead_dict)

    if not auto_approved:
        background_tasks.add_task(send_notification_email, comment_dict, article_title)

    status_msg = "approved" if auto_approved else "pending"
    return {"message": "Comment submitted", "id": comment_id, "status": status_msg, "autoApproved": auto_approved}


@router.post("/comments/{comment_id}/like")
async def like_comment(comment_id: str):
    """Toggle like on a comment (uses localStorage on frontend to prevent duplicates)"""
    result = await db.comments.update_one(
        {"id": comment_id},
        {"$inc": {"likes": 1}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    doc = await db.comments.find_one({"id": comment_id}, {"_id": 0, "likes": 1})
    return {"likes": doc.get("likes", 0)}


@router.get("/admin/comments")
async def get_all_comments(status: Optional[str] = None, admin: str = Depends(verify_admin)):
    """Get all comments with optional status filter (Admin only)"""
    query = {}
    if status:
        query["status"] = status

    comments = await db.comments.find(query, {"_id": 0}).sort("createdAt", -1).to_list(500)

    for comment in comments:
        article = await db.articles.find_one({"id": comment.get("articleId")}, {"title": 1})
        comment["articleTitle"] = article.get("title", "Unknown") if article else "Unknown"

    return comments


@router.get("/admin/comments/stats")
async def get_comments_stats(admin: str = Depends(verify_admin)):
    """Get comment statistics (Admin only)"""
    total = await db.comments.count_documents({})
    pending = await db.comments.count_documents({"status": "pending"})
    approved = await db.comments.count_documents({"status": "approved"})
    rejected = await db.comments.count_documents({"status": "rejected"})

    return {"total": total, "pending": pending, "approved": approved, "rejected": rejected}


@router.put("/admin/comments/{comment_id}/approve")
async def approve_comment(comment_id: str, admin: str = Depends(verify_admin)):
    """Approve a comment (Admin only)"""
    result = await db.comments.update_one({"id": comment_id}, {"$set": {"status": "approved"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment approved", "id": comment_id}


@router.put("/admin/comments/{comment_id}/reject")
async def reject_comment(comment_id: str, admin: str = Depends(verify_admin)):
    """Reject a comment (Admin only)"""
    result = await db.comments.update_one({"id": comment_id}, {"$set": {"status": "rejected"}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment rejected", "id": comment_id}


@router.delete("/admin/comments/{comment_id}")
async def delete_comment(comment_id: str, admin: str = Depends(verify_admin)):
    """Delete a comment (Admin only)"""
    result = await db.comments.delete_one({"id": comment_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment deleted", "id": comment_id}
