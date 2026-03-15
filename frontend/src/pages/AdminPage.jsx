import React, { useState, useEffect } from 'react';
import { adminApi, articlesApi } from '../services/api';
import { 
  LogIn, LogOut, Plus, Edit2, Trash2, Save, X, 
  FileText, Loader2, AlertCircle, Check 
} from 'lucide-react';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [saveStatus, setSaveStatus] = useState({ type: '', message: '' });

  // Check for stored credentials
  useEffect(() => {
    const stored = sessionStorage.getItem('adminCredentials');
    if (stored) {
      const creds = JSON.parse(stored);
      setCredentials(creds);
      verifyStoredCredentials(creds);
    }
  }, []);

  const verifyStoredCredentials = async (creds) => {
    try {
      const valid = await adminApi.verify(creds.username, creds.password);
      if (valid) {
        setIsAuthenticated(true);
        fetchArticles(creds);
      } else {
        sessionStorage.removeItem('adminCredentials');
      }
    } catch {
      sessionStorage.removeItem('adminCredentials');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLoginError('');

    try {
      const valid = await adminApi.verify(credentials.username, credentials.password);
      if (valid) {
        setIsAuthenticated(true);
        sessionStorage.setItem('adminCredentials', JSON.stringify(credentials));
        fetchArticles(credentials);
      } else {
        setLoginError('Ungültige Zugangsdaten');
      }
    } catch (err) {
      setLoginError('Anmeldung fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCredentials({ username: '', password: '' });
    sessionStorage.removeItem('adminCredentials');
    setArticles([]);
  };

  const fetchArticles = async (creds) => {
    setArticlesLoading(true);
    try {
      const data = await articlesApi.getAll();
      setArticles(data);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setArticlesLoading(false);
    }
  };

  const handleSaveArticle = async (articleData) => {
    setSaveStatus({ type: 'loading', message: 'Speichern...' });
    try {
      if (isCreating) {
        await adminApi.createArticle(articleData, credentials);
        setSaveStatus({ type: 'success', message: 'Artikel erstellt!' });
      } else {
        await adminApi.updateArticle(editingArticle.id, articleData, credentials);
        setSaveStatus({ type: 'success', message: 'Artikel aktualisiert!' });
      }
      fetchArticles(credentials);
      setEditingArticle(null);
      setIsCreating(false);
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
    }
  };

  const handleDeleteArticle = async (articleId) => {
    if (!window.confirm('Artikel wirklich löschen?')) return;
    
    try {
      await adminApi.deleteArticle(articleId, credentials);
      fetchArticles(credentials);
      setSaveStatus({ type: 'success', message: 'Artikel gelöscht!' });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
    }
  };

  // Login Form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6" data-testid="admin-login-page">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-display font-bold text-white mb-4">
              Admin <span className="text-gold">Login</span>
            </h1>
            <p className="text-white/70">Melden Sie sich an, um Artikel zu verwalten</p>
          </div>

          <div className="glass-card p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-white/80 text-sm mb-2">Benutzername</label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50"
                  placeholder="admin"
                  data-testid="admin-username-input"
                  required
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">Passwort</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-gold/50"
                  placeholder="••••••••"
                  data-testid="admin-password-input"
                  required
                />
              </div>

              {loginError && (
                <div className="flex items-center space-x-2 text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{loginError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-gold w-full flex items-center justify-center space-x-2"
                data-testid="admin-login-button"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    <span>Anmelden</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Article Editor Form
  if (editingArticle || isCreating) {
    const article = editingArticle || {
      cluster: 'A',
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      category: 'Makro & Strategie',
      date: new Date().toISOString().split('T')[0],
      readTime: '10 min',
      featured: false,
      author: '',
      relatedArticles: [],
      dueDiligenceBox: { title: '', content: '' },
      expertTip: { author: '', title: '', content: '' }
    };

    return (
      <div className="min-h-screen pt-32 pb-20 px-6" data-testid="admin-editor">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-display font-bold text-white">
              {isCreating ? 'Neuer Artikel' : 'Artikel bearbeiten'}
            </h1>
            <button
              onClick={() => { setEditingArticle(null); setIsCreating(false); }}
              className="text-white/70 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <ArticleForm
            initialData={article}
            onSave={handleSaveArticle}
            onCancel={() => { setEditingArticle(null); setIsCreating(false); }}
            saveStatus={saveStatus}
          />
        </div>
      </div>
    );
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen pt-32 pb-20 px-6" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-display font-bold text-white mb-2">
              Admin <span className="text-gold">Dashboard</span>
            </h1>
            <p className="text-white/70">Verwalten Sie Ihre Blog-Artikel</p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsCreating(true)}
              className="btn-gold flex items-center space-x-2"
              data-testid="create-article-button"
            >
              <Plus className="w-5 h-5" />
              <span>Neuer Artikel</span>
            </button>
            <button
              onClick={handleLogout}
              className="glass-card px-4 py-2 text-white/70 hover:text-white transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {saveStatus.message && (
          <div className={`glass-card p-4 mb-6 flex items-center space-x-2 ${
            saveStatus.type === 'success' ? 'border-green-500/30' : 
            saveStatus.type === 'error' ? 'border-red-500/30' : ''
          }`}>
            {saveStatus.type === 'success' && <Check className="w-5 h-5 text-green-400" />}
            {saveStatus.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            {saveStatus.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin text-gold" />}
            <span className={
              saveStatus.type === 'success' ? 'text-green-400' : 
              saveStatus.type === 'error' ? 'text-red-400' : 'text-white'
            }>{saveStatus.message}</span>
          </div>
        )}

        {/* Articles List */}
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5 text-gold" />
              <span className="text-white font-medium">Artikel ({articles.length})</span>
            </div>
          </div>

          {articlesLoading ? (
            <div className="p-8 flex justify-center">
              <Loader2 className="w-8 h-8 text-gold animate-spin" />
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {articles.map((article) => (
                <div 
                  key={article.id} 
                  className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                  data-testid={`article-row-${article.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs text-gold font-medium bg-gold/10 px-2 py-1 rounded">
                        {article.cluster}
                      </span>
                      {article.featured && (
                        <span className="text-xs text-white bg-white/10 px-2 py-1 rounded">
                          Featured
                        </span>
                      )}
                    </div>
                    <h3 className="text-white font-medium mt-2 truncate">{article.title}</h3>
                    <p className="text-white/50 text-sm">{article.category} • {article.date}</p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setEditingArticle(article)}
                      className="p-2 text-white/70 hover:text-gold transition-colors"
                      data-testid={`edit-article-${article.id}`}
                    >
                      <Edit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteArticle(article.id)}
                      className="p-2 text-white/70 hover:text-red-400 transition-colors"
                      data-testid={`delete-article-${article.id}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Article Form Component
const ArticleForm = ({ initialData, onSave, onCancel, saveStatus }) => {
  const [formData, setFormData] = useState(initialData);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Remove id from formData for creation
    const { id, ...dataToSave } = formData;
    onSave(dataToSave);
  };

  const categories = [
    'Makro & Strategie',
    'Recht & Compliance',
    'Montenegro Regionen',
    'Serbien & Balkan',
    'Lifestyle & Relocation',
    'Business Setup'
  ];

  const clusters = [
    { id: 'A', name: 'Makro & Strategie' },
    { id: 'B', name: 'Recht & Compliance' },
    { id: 'C', name: 'Montenegro Regionen' },
    { id: 'D', name: 'Serbien & Balkan' },
    { id: 'E', name: 'Lifestyle & Relocation' },
    { id: 'F', name: 'Business Setup' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="glass-card p-6 space-y-6">
        <h3 className="text-xl font-bold text-gold">Grundinformationen</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Cluster</label>
            <select
              value={formData.cluster}
              onChange={(e) => handleChange('cluster', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
            >
              {clusters.map(c => (
                <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Kategorie</label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-2">Titel *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
            required
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-2">Slug (URL) *</label>
          <input
            type="text"
            value={formData.slug}
            onChange={(e) => handleChange('slug', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
            placeholder="mein-artikel-slug"
            required
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-2">Kurzfassung *</label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => handleChange('excerpt', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 h-24"
            required
          />
        </div>

        <div>
          <label className="block text-white/80 text-sm mb-2">Inhalt (Markdown) *</label>
          <textarea
            value={formData.content}
            onChange={(e) => handleChange('content', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 h-64 font-mono text-sm"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Bild-URL *</label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => handleChange('image', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
              required
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Autor *</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => handleChange('author', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Datum</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Lesezeit</label>
            <input
              type="text"
              value={formData.readTime}
              onChange={(e) => handleChange('readTime', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
              placeholder="10 min"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleChange('featured', e.target.checked)}
                className="w-5 h-5 rounded bg-white/5 border-white/10 text-gold focus:ring-gold"
              />
              <span className="text-white/80">Featured</span>
            </label>
          </div>
        </div>
      </div>

      {/* Due Diligence Box */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-xl font-bold text-gold">Due Diligence Box</h3>
        <div>
          <label className="block text-white/80 text-sm mb-2">Titel</label>
          <input
            type="text"
            value={formData.dueDiligenceBox?.title || ''}
            onChange={(e) => handleNestedChange('dueDiligenceBox', 'title', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
          />
        </div>
        <div>
          <label className="block text-white/80 text-sm mb-2">Inhalt</label>
          <textarea
            value={formData.dueDiligenceBox?.content || ''}
            onChange={(e) => handleNestedChange('dueDiligenceBox', 'content', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 h-24"
          />
        </div>
      </div>

      {/* Expert Tip */}
      <div className="glass-card p-6 space-y-4">
        <h3 className="text-xl font-bold text-gold">Experten-Tipp</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-white/80 text-sm mb-2">Autor</label>
            <input
              type="text"
              value={formData.expertTip?.author || ''}
              onChange={(e) => handleNestedChange('expertTip', 'author', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
            />
          </div>
          <div>
            <label className="block text-white/80 text-sm mb-2">Titel</label>
            <input
              type="text"
              value={formData.expertTip?.title || ''}
              onChange={(e) => handleNestedChange('expertTip', 'title', e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50"
            />
          </div>
        </div>
        <div>
          <label className="block text-white/80 text-sm mb-2">Inhalt</label>
          <textarea
            value={formData.expertTip?.content || ''}
            onChange={(e) => handleNestedChange('expertTip', 'content', e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-gold/50 h-24"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="glass-card px-6 py-3 text-white/70 hover:text-white transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={saveStatus.type === 'loading'}
          className="btn-gold flex items-center space-x-2"
        >
          {saveStatus.type === 'loading' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>Speichern</span>
        </button>
      </div>
    </form>
  );
};

export default AdminPage;
