// EuroAdria API Service
// Handles all communication with the backend API

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || '';

// Article API
export const articlesApi = {
  // Get all articles with optional filters
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

export default { articlesApi, adminApi, getRelatedArticles };
