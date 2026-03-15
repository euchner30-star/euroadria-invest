"""
Backend API tests for Comments endpoints.
Tests the comments functionality used by the Serbia Executive page and blog articles.
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestCommentsAPI:
    """Test suite for Comments API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test data with unique identifiers"""
        self.test_id = str(uuid.uuid4())[:8]
        self.test_article_id = 9999  # Special ID for Serbia Executive page
        self.test_article_slug = "serbia-executive-access"
        
    def test_get_comments_for_article_returns_empty_array(self):
        """Test GET /api/comments/article/{article_id} returns empty array when no approved comments"""
        # Use a unique article ID to ensure no existing comments
        unique_article_id = 99999 + int(uuid.uuid4().int % 10000)
        
        response = requests.get(f"{BASE_URL}/api/comments/article/{unique_article_id}")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_create_comment_returns_success(self):
        """Test POST /api/comments creates comment with pending status"""
        comment_data = {
            "articleId": self.test_article_id,
            "articleSlug": self.test_article_slug,
            "name": f"TEST_User_{self.test_id}",
            "email": "test@example.com",
            "content": f"TEST_Comment content for testing {self.test_id}"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/comments",
            json=comment_data
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "id" in data
        assert data["message"] == "Comment submitted for moderation"
        
        # Store the comment ID for cleanup
        self.created_comment_id = data["id"]
    
    def test_create_comment_with_missing_fields_fails(self):
        """Test POST /api/comments with missing required fields returns error"""
        # Missing required fields
        incomplete_data = {
            "articleId": self.test_article_id,
            "name": f"TEST_User_{self.test_id}"
            # Missing articleSlug, email, content
        }
        
        response = requests.post(
            f"{BASE_URL}/api/comments",
            json=incomplete_data
        )
        
        # Should return 422 for validation error
        assert response.status_code == 422
    
    def test_get_approved_comments_excludes_pending(self):
        """Test GET /api/comments/article/{id} only returns approved comments, not pending"""
        # Create a test comment (will be pending)
        comment_data = {
            "articleId": self.test_article_id,
            "articleSlug": self.test_article_slug,
            "name": f"TEST_PendingUser_{self.test_id}",
            "email": "pending@example.com",
            "content": f"TEST_Pending comment {self.test_id}"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/comments",
            json=comment_data
        )
        assert create_response.status_code == 200
        
        # Now fetch approved comments
        get_response = requests.get(f"{BASE_URL}/api/comments/article/{self.test_article_id}")
        assert get_response.status_code == 200
        
        comments = get_response.json()
        # The just-created comment should NOT appear (it's pending, not approved)
        for comment in comments:
            assert comment.get("name") != f"TEST_PendingUser_{self.test_id}"


class TestCommentsAdminAPI:
    """Test suite for Admin Comments API endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup admin credentials and test data"""
        self.admin_username = os.environ.get('ADMIN_USERNAME', 'admin')
        self.admin_password = os.environ.get('ADMIN_PASSWORD', 'euroadria2025')
        self.auth = (self.admin_username, self.admin_password)
        self.test_id = str(uuid.uuid4())[:8]
    
    def test_admin_get_all_comments(self):
        """Test GET /api/admin/comments returns all comments for admin"""
        response = requests.get(
            f"{BASE_URL}/api/admin/comments",
            auth=self.auth
        )
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
    
    def test_admin_get_comments_stats(self):
        """Test GET /api/admin/comments/stats returns statistics"""
        response = requests.get(
            f"{BASE_URL}/api/admin/comments/stats",
            auth=self.auth
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify stats structure
        assert "total" in data
        assert "pending" in data
        assert "approved" in data
        assert "rejected" in data
        
        # All values should be integers
        assert isinstance(data["total"], int)
        assert isinstance(data["pending"], int)
        assert isinstance(data["approved"], int)
        assert isinstance(data["rejected"], int)
    
    def test_admin_approve_comment_workflow(self):
        """Test full workflow: create comment, approve it via admin, verify it appears"""
        # Step 1: Create a comment
        comment_data = {
            "articleId": 9999,
            "articleSlug": "serbia-executive-access",
            "name": f"TEST_ApproveUser_{self.test_id}",
            "email": "approve@example.com",
            "content": f"TEST_Comment to approve {self.test_id}"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/comments",
            json=comment_data
        )
        assert create_response.status_code == 200
        comment_id = create_response.json()["id"]
        
        # Step 2: Approve the comment
        approve_response = requests.put(
            f"{BASE_URL}/api/admin/comments/{comment_id}/approve",
            auth=self.auth
        )
        assert approve_response.status_code == 200
        assert approve_response.json()["message"] == "Comment approved"
        
        # Step 3: Verify comment appears in public list
        get_response = requests.get(f"{BASE_URL}/api/comments/article/9999")
        assert get_response.status_code == 200
        comments = get_response.json()
        
        # Find our approved comment
        approved_comment = None
        for comment in comments:
            if comment.get("name") == f"TEST_ApproveUser_{self.test_id}":
                approved_comment = comment
                break
        
        assert approved_comment is not None, "Approved comment should appear in public list"
        assert approved_comment["content"] == f"TEST_Comment to approve {self.test_id}"
        
        # Step 4: Cleanup - delete the comment
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/comments/{comment_id}",
            auth=self.auth
        )
        assert delete_response.status_code == 200
    
    def test_admin_reject_comment(self):
        """Test rejecting a comment"""
        # Create a comment
        comment_data = {
            "articleId": 9999,
            "articleSlug": "serbia-executive-access",
            "name": f"TEST_RejectUser_{self.test_id}",
            "email": "reject@example.com",
            "content": f"TEST_Comment to reject {self.test_id}"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/comments",
            json=comment_data
        )
        assert create_response.status_code == 200
        comment_id = create_response.json()["id"]
        
        # Reject the comment
        reject_response = requests.put(
            f"{BASE_URL}/api/admin/comments/{comment_id}/reject",
            auth=self.auth
        )
        assert reject_response.status_code == 200
        assert reject_response.json()["message"] == "Comment rejected"
        
        # Verify it doesn't appear in public list
        get_response = requests.get(f"{BASE_URL}/api/comments/article/9999")
        comments = get_response.json()
        
        for comment in comments:
            assert comment.get("name") != f"TEST_RejectUser_{self.test_id}"
        
        # Cleanup
        requests.delete(
            f"{BASE_URL}/api/admin/comments/{comment_id}",
            auth=self.auth
        )
    
    def test_admin_delete_comment(self):
        """Test deleting a comment"""
        # Create a comment
        comment_data = {
            "articleId": 9999,
            "articleSlug": "serbia-executive-access",
            "name": f"TEST_DeleteUser_{self.test_id}",
            "email": "delete@example.com",
            "content": f"TEST_Comment to delete {self.test_id}"
        }
        
        create_response = requests.post(
            f"{BASE_URL}/api/comments",
            json=comment_data
        )
        assert create_response.status_code == 200
        comment_id = create_response.json()["id"]
        
        # Delete the comment
        delete_response = requests.delete(
            f"{BASE_URL}/api/admin/comments/{comment_id}",
            auth=self.auth
        )
        assert delete_response.status_code == 200
        assert delete_response.json()["message"] == "Comment deleted"
        
        # Verify it's gone - trying to delete again should return 404
        second_delete = requests.delete(
            f"{BASE_URL}/api/admin/comments/{comment_id}",
            auth=self.auth
        )
        assert second_delete.status_code == 404
    
    def test_admin_auth_required(self):
        """Test that admin endpoints require authentication"""
        # Try without auth
        response = requests.get(f"{BASE_URL}/api/admin/comments")
        assert response.status_code == 401
        
        # Try with wrong credentials
        response = requests.get(
            f"{BASE_URL}/api/admin/comments",
            auth=("wrong", "credentials")
        )
        assert response.status_code == 401
    
    def test_admin_filter_comments_by_status(self):
        """Test filtering comments by status"""
        # Test filtering by pending
        response = requests.get(
            f"{BASE_URL}/api/admin/comments?status=pending",
            auth=self.auth
        )
        assert response.status_code == 200
        comments = response.json()
        
        # All returned comments should be pending
        for comment in comments:
            assert comment.get("status") == "pending"
