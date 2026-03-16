// EuroAdria API Service
// Handles all communication with the backend API

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

// Article API
export const articlesApi = {
  // Get all articles with optional filters (full data)
  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.cluster) params.append('cluster', filters.cluster);
    if (filters.featured !== undefined) params.append('featured', filters.featured);
    if (filters.category) params.append('category', filters.category);
    if (filters.limit) params.append('limit', filters.limit);
    
    const queryString = params.toString();
    const url = `${API_BASE_URL}/api/articles${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    return response.json();
  },

  // Paginated lightweight list for blog page (no content field)
  getList: async ({ page = 1, limit = 12, cluster = null, search = null } = {}) => {
    const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    if (cluster && cluster !== 'All') params.append('cluster', cluster);
    if (search) params.append('search', search);
    
    const response = await fetch(`${API_BASE_URL}/api/articles/list?${params}`);
    if (!response.ok) {
      throw new Error('Failed to fetch articles');
    }
    return response.json();
  },

  // Get article by slug
  getBySlug: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/api/articles/${slug}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch article');
    }
    return response.json();
  },

  // Get article by ID
  getById: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/articles/id/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch article');
    }
    return response.json();
  },

  // Get featured articles
  getFeatured: async (limit = 6) => {
    return articlesApi.getAll({ featured: true, limit });
  },

  // Get clusters
  getClusters: async () => {
    const response = await fetch(`${API_BASE_URL}/api/clusters`);
    if (!response.ok) {
      throw new Error('Failed to fetch clusters');
    }
    return response.json();
  },

  // Get categories
  getCategories: async () => {
    const response = await fetch(`${API_BASE_URL}/api/categories`);
    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }
    return response.json();
  }
};

// Admin API (protected)
export const adminApi = {
  // Verify admin credentials
  verify: async (username, password) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/verify`, {
      headers: {
        'Authorization': 'Basic ' + btoa(`${username}:${password}`)
      }
    });
    return response.ok;
  },

  // Create article
  createArticle: async (article, credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      },
      body: JSON.stringify(article)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create article');
    }
    return response.json();
  },

  // Update article
  updateArticle: async (articleId, updates, credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/articles/${articleId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      },
      body: JSON.stringify(updates)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update article');
    }
    return response.json();
  },

  // Delete article
  deleteArticle: async (articleId, credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/articles/${articleId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      }
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to delete article');
    }
    return response.json();
  }
};

// Helper to get related articles
export const getRelatedArticles = async (articleIds) => {
  const articles = [];
  for (const id of articleIds) {
    try {
      const article = await articlesApi.getById(id);
      if (article) {
        articles.push(article);
      }
    } catch (e) {
      console.error(`Failed to fetch related article ${id}:`, e);
    }
  }
  return articles;
};

// Comments API (public for reading approved, protected for submission)
export const commentsApi = {
  // Get approved comments for an article by ID
  getByArticle: async (articleId) => {
    const response = await fetch(`${API_BASE_URL}/api/comments/article/${articleId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return response.json();
  },

  // Get approved comments for an article by slug
  getBySlug: async (articleSlug) => {
    const response = await fetch(`${API_BASE_URL}/api/comments/slug/${articleSlug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return response.json();
  },

  // Create a new comment (requires moderation)
  create: async (commentData) => {
    const response = await fetch(`${API_BASE_URL}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(commentData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to submit comment');
    }
    return response.json();
  },

  // Admin: Get all comments (with optional status filter)
  getAll: async (credentials, status = null) => {
    const url = status 
      ? `${API_BASE_URL}/api/admin/comments?status=${status}`
      : `${API_BASE_URL}/api/admin/comments`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch comments');
    }
    return response.json();
  },

  // Admin: Approve a comment
  approve: async (commentId, credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/comments/${commentId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      }
    });
    if (!response.ok) {
      throw new Error('Failed to approve comment');
    }
    return response.json();
  },

  // Admin: Reject a comment
  reject: async (commentId, credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/comments/${commentId}/reject`, {
      method: 'PUT',
      headers: {
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      }
    });
    if (!response.ok) {
      throw new Error('Failed to reject comment');
    }
    return response.json();
  },

  // Admin: Delete a comment
  delete: async (commentId, credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/comments/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete comment');
    }
    return response.json();
  }
};

// Regions API
export const regionsApi = {
  // Get all regions (public)
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/regions`);
    if (!response.ok) {
      throw new Error('Failed to fetch regions');
    }
    return response.json();
  },

  // Get region by slug (public)
  getBySlug: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/api/regions/${slug}`);
    if (!response.ok) {
      throw new Error('Failed to fetch region');
    }
    return response.json();
  },

  // Admin: Get all regions
  getAdminRegions: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/regions`, {
      headers: {
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch regions');
    }
    return response.json();
  },

  // Admin: Create region
  create: async (regionData, credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/regions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      },
      body: JSON.stringify(regionData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create region');
    }
    return response.json();
  },

  // Admin: Update region
  update: async (slug, regionData, credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/regions/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      },
      body: JSON.stringify(regionData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update region');
    }
    return response.json();
  },

  // Admin: Delete region
  delete: async (slug, credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/regions/${slug}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete region');
    }
    return response.json();
  },

  // Admin: Add apartment to region
  addApartment: async (slug, apartmentData, credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/regions/${slug}/apartments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      },
      body: JSON.stringify(apartmentData)
    });
    if (!response.ok) {
      throw new Error('Failed to add apartment');
    }
    return response.json();
  },

  // Admin: Remove apartment from region
  removeApartment: async (slug, apartmentId, credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/regions/${slug}/apartments/${apartmentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      }
    });
    if (!response.ok) {
      throw new Error('Failed to remove apartment');
    }
    return response.json();
  }
};

// Pages CMS API
export const pagesApi = {
  // Get all pages (public)
  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/pages`);
    if (!response.ok) {
      throw new Error('Failed to fetch pages');
    }
    return response.json();
  },

  // Get page by slug (public)
  getBySlug: async (slug) => {
    const response = await fetch(`${API_BASE_URL}/api/pages/${slug}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch page');
    }
    return response.json();
  },

  // Admin: Get all pages including defaults
  getAdminPages: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/pages`, {
      headers: {
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      }
    });
    if (!response.ok) {
      throw new Error('Failed to fetch pages');
    }
    return response.json();
  },

  // Admin: Create page
  create: async (pageData, credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/pages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      },
      body: JSON.stringify(pageData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to create page');
    }
    return response.json();
  },

  // Admin: Update page
  update: async (slug, pageData, credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/pages/${slug}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      },
      body: JSON.stringify(pageData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to update page');
    }
    return response.json();
  },

  // Admin: Delete page (reset to default)
  delete: async (slug, credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/admin/pages/${slug}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
      }
    });
    if (!response.ok) {
      throw new Error('Failed to delete page');
    }
    return response.json();
  }
};

export default { articlesApi, adminApi, commentsApi, regionsApi, pagesApi, getRelatedArticles };
