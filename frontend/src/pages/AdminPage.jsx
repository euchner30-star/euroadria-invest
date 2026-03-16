import React, { useState, useEffect } from 'react';
import { adminApi, articlesApi, commentsApi, regionsApi, pagesApi } from '../services/api';
import { 
  LogIn, LogOut, Plus, Edit2, Trash2, Save, X, 
  FileText, Loader2, AlertCircle, Check, MessageSquare,
  CheckCircle, XCircle, Clock, Mail, User, HelpCircle, MapPin, Building2, Image as ImageIcon,
  Layout, Users, Home, Phone, Globe
} from 'lucide-react';
import SEO from '../components/SEO';
import WYSIWYGEditor, { FormField, generateSlug, htmlToCleanContent, contentToHtml } from '../components/admin/WYSIWYGEditor';
import ImageUploader, { ImageGalleryUploader } from '../components/admin/ImageUploader';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Active Tab: 'articles', 'comments', 'regions', or 'pages'
  const [activeTab, setActiveTab] = useState('articles');
  
  // Articles State
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  
  // Comments State
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentsFilter, setCommentsFilter] = useState('pending');
  const [commentsStats, setCommentsStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
  
  // Regions State
  const [regions, setRegions] = useState([]);
  const [regionsLoading, setRegionsLoading] = useState(false);
  const [editingRegion, setEditingRegion] = useState(null);
  const [isCreatingRegion, setIsCreatingRegion] = useState(false);

  // Pages CMS State
  const [pages, setPages] = useState([]);
  const [pagesLoading, setPagesLoading] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  
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
        fetchComments(creds);
        fetchCommentsStats(creds);
        fetchRegions(creds);
        fetchPages(creds);
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
        fetchComments(credentials);
        fetchCommentsStats(credentials);
        fetchRegions(credentials);
        fetchPages(credentials);
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
    setComments([]);
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

  const fetchComments = async (creds, status = null) => {
    setCommentsLoading(true);
    try {
      const data = await commentsApi.getAll(creds, status);
      setComments(data);
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    } finally {
      setCommentsLoading(false);
    }
  };

  const fetchCommentsStats = async (creds) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/comments/stats`, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${creds.username}:${creds.password}`)
        }
      });
      if (response.ok) {
        const stats = await response.json();
        setCommentsStats(stats);
      }
    } catch (err) {
      console.error('Failed to fetch comment stats:', err);
    }
  };

  const fetchRegions = async (creds) => {
    setRegionsLoading(true);
    try {
      const data = await regionsApi.getAdminRegions(creds);
      setRegions(data);
    } catch (err) {
      console.error('Failed to fetch regions:', err);
    } finally {
      setRegionsLoading(false);
    }
  };

  const handleSaveRegion = async (regionData) => {
    setSaveStatus({ type: 'loading', message: 'Speichern...' });
    try {
      if (isCreatingRegion) {
        await regionsApi.create(regionData, credentials);
        setSaveStatus({ type: 'success', message: 'Region erstellt!' });
      } else {
        await regionsApi.update(editingRegion.slug, regionData, credentials);
        setSaveStatus({ type: 'success', message: 'Region aktualisiert!' });
      }
      fetchRegions(credentials);
      setEditingRegion(null);
      setIsCreatingRegion(false);
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
    }
  };

  const handleDeleteRegion = async (slug) => {
    if (!window.confirm('Region wirklich löschen?')) return;
    
    try {
      await regionsApi.delete(slug, credentials);
      fetchRegions(credentials);
      setSaveStatus({ type: 'success', message: 'Region gelöscht!' });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
    }
  };

  // Pages CMS Functions
  const fetchPages = async (creds) => {
    setPagesLoading(true);
    try {
      const data = await pagesApi.getAdminPages(creds);
      setPages(data);
    } catch (err) {
      console.error('Failed to fetch pages:', err);
    } finally {
      setPagesLoading(false);
    }
  };

  const handleSavePage = async (pageData) => {
    setSaveStatus({ type: 'loading', message: 'Speichern...' });
    try {
      await pagesApi.update(editingPage.slug, pageData, credentials);
      setSaveStatus({ type: 'success', message: 'Seite gespeichert!' });
      fetchPages(credentials);
      setEditingPage(null);
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
    }
  };

  const handleResetPage = async (slug) => {
    if (!window.confirm('Seite auf Standard zurücksetzen?')) return;
    
    try {
      await pagesApi.delete(slug, credentials);
      fetchPages(credentials);
      setSaveStatus({ type: 'success', message: 'Seite zurückgesetzt!' });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
    }
  };

  const handleApproveComment = async (commentId) => {
    try {
      await commentsApi.approve(commentId, credentials);
      fetchComments(credentials, commentsFilter === 'all' ? null : commentsFilter);
      fetchCommentsStats(credentials);
      setSaveStatus({ type: 'success', message: 'Kommentar freigegeben!' });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: 'Fehler beim Freigeben' });
    }
  };

  const handleRejectComment = async (commentId) => {
    try {
      await commentsApi.reject(commentId, credentials);
      fetchComments(credentials, commentsFilter === 'all' ? null : commentsFilter);
      fetchCommentsStats(credentials);
      setSaveStatus({ type: 'success', message: 'Kommentar abgelehnt!' });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: 'Fehler beim Ablehnen' });
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Kommentar wirklich löschen?')) return;
    try {
      await commentsApi.delete(commentId, credentials);
      fetchComments(credentials, commentsFilter === 'all' ? null : commentsFilter);
      fetchCommentsStats(credentials);
      setSaveStatus({ type: 'success', message: 'Kommentar gelöscht!' });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: 'Fehler beim Löschen' });
    }
  };

  useEffect(() => {
    if (isAuthenticated && activeTab === 'comments') {
      fetchComments(credentials, commentsFilter === 'all' ? null : commentsFilter);
    }
  }, [commentsFilter, activeTab, isAuthenticated]);

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
        <SEO 
          title="Admin Login"
          description="EuroAdria Admin-Bereich"
          url="/admin"
          noindex={true}
        />
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-semibold font-bold text-ea-dark mb-4">
              Admin <span className="text-ea-gold">Login</span>
            </h1>
            <p className="text-ea-dark/70">Melden Sie sich an, um Artikel zu verwalten</p>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-ea-dark/80 text-sm mb-2">Benutzername</label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-white/40 focus:outline-none focus:border-ea-gold"
                  placeholder="admin"
                  data-testid="admin-username-input"
                  required
                />
              </div>
              <div>
                <label className="block text-ea-dark/80 text-sm mb-2">Passwort</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark placeholder-white/40 focus:outline-none focus:border-ea-gold"
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
                className="px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all w-full flex items-center justify-center space-x-2"
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
            <h1 className="text-3xl font-semibold font-bold text-ea-dark">
              {isCreating ? 'Neuer Artikel' : 'Artikel bearbeiten'}
            </h1>
            <button
              onClick={() => { setEditingArticle(null); setIsCreating(false); }}
              className="text-ea-dark/70 hover:text-ea-dark transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <ArticleForm
            initialData={article}
            onSave={handleSaveArticle}
            onCancel={() => { setEditingArticle(null); setIsCreating(false); }}
            saveStatus={saveStatus}
            credentials={credentials}
          />
        </div>
      </div>
    );
  }

  // Region Editor Form
  if (editingRegion || isCreatingRegion) {
    const region = editingRegion || {
      slug: '',
      title: '',
      subtitle: '',
      investmentScore: 80,
      priceRange: '€1.000-2.000/m²',
      potential: '+30-50%',
      timeHorizon: '3-5 Jahre',
      content: '',
      bulletPoints: [],
      imageUrls: [],
      apartments: []
    };

    return (
      <div className="min-h-screen pt-32 pb-20 px-6" data-testid="admin-region-editor">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-semibold font-bold text-ea-dark">
              {isCreatingRegion ? 'Neue Region' : 'Region bearbeiten'}
            </h1>
            <button
              onClick={() => { setEditingRegion(null); setIsCreatingRegion(false); }}
              className="text-ea-dark/70 hover:text-ea-dark transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <RegionForm
            initialData={region}
            onSave={handleSaveRegion}
            onCancel={() => { setEditingRegion(null); setIsCreatingRegion(false); }}
            saveStatus={saveStatus}
            isCreating={isCreatingRegion}
            credentials={credentials}
          />
        </div>
      </div>
    );
  }

  // Page Editor
  if (editingPage) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6" data-testid="admin-page-editor">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-semibold font-bold text-ea-dark">
                {editingPage.title} <span className="text-ea-gold">bearbeiten</span>
              </h1>
              <p className="text-ea-dark/50">/{editingPage.slug}</p>
            </div>
            <button
              onClick={() => setEditingPage(null)}
              className="text-ea-dark/70 hover:text-ea-dark transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <PageEditor
            page={editingPage}
            onSave={handleSavePage}
            onCancel={() => setEditingPage(null)}
            saveStatus={saveStatus}
            credentials={credentials}
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
            <h1 className="text-4xl font-semibold font-bold text-ea-dark mb-2">
              Admin <span className="text-ea-gold">Dashboard</span>
            </h1>
            <p className="text-ea-dark/70">Verwalten Sie Artikel, Kommentare und Regionen</p>
          </div>
          <div className="flex items-center space-x-4">
            {activeTab === 'articles' && (
              <button
                onClick={() => setIsCreating(true)}
                className="px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all flex items-center space-x-2"
                data-testid="create-article-button"
              >
                <Plus className="w-5 h-5" />
                <span>Neuer Artikel</span>
              </button>
            )}
            {activeTab === 'regions' && (
              <button
                onClick={() => setIsCreatingRegion(true)}
                className="px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all flex items-center space-x-2"
                data-testid="create-region-button"
              >
                <Plus className="w-5 h-5" />
                <span>Neue Region</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-2 text-ea-dark/70 hover:text-ea-dark transition-colors flex items-center space-x-2"
            >
              <LogOut className="w-5 h-5" />
              <span>Abmelden</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {saveStatus.message && (
          <div className={`bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6 flex items-center space-x-2 ${
            saveStatus.type === 'success' ? 'border-green-500/30' : 
            saveStatus.type === 'error' ? 'border-red-500/30' : ''
          }`}>
            {saveStatus.type === 'success' && <Check className="w-5 h-5 text-green-400" />}
            {saveStatus.type === 'error' && <AlertCircle className="w-5 h-5 text-red-400" />}
            {saveStatus.type === 'loading' && <Loader2 className="w-5 h-5 animate-spin text-ea-gold" />}
            <span className={
              saveStatus.type === 'success' ? 'text-green-400' : 
              saveStatus.type === 'error' ? 'text-red-400' : 'text-ea-dark'
            }>{saveStatus.message}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === 'articles'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-articles"
          >
            <FileText className="w-5 h-5" />
            <span>Artikel ({articles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === 'comments'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-comments"
          >
            <MessageSquare className="w-5 h-5" />
            <span>Kommentare</span>
            {commentsStats.pending > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-ea-dark text-xs rounded-full">
                {commentsStats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('regions')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === 'regions'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-regions"
          >
            <MapPin className="w-5 h-5" />
            <span>Regionen ({regions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === 'pages'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-pages"
          >
            <Layout className="w-5 h-5" />
            <span>Seiten ({pages.length})</span>
          </button>
        </div>

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-ea-gold" />
                <span className="text-ea-dark font-medium">Artikel ({articles.length})</span>
              </div>
            </div>

            {articlesLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-8 h-8 text-ea-gold animate-spin" />
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {articles.map((article) => (
                  <div 
                    key={article.id} 
                    className="p-4 flex items-center justify-between hover:bg-ea-light transition-colors"
                    data-testid={`article-row-${article.id}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-ea-gold font-medium bg-ea-gold/10 px-2 py-1 rounded">
                          {article.cluster}
                        </span>
                        {article.featured && (
                          <span className="text-xs text-ea-dark bg-white/10 px-2 py-1 rounded">
                            Featured
                          </span>
                        )}
                      </div>
                      <h3 className="text-ea-dark font-medium mt-2 truncate">{article.title}</h3>
                      <p className="text-ea-dark/50 text-sm">{article.category} • {article.date}</p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => setEditingArticle(article)}
                        className="p-2 text-ea-dark/70 hover:text-ea-gold transition-colors"
                        data-testid={`edit-article-${article.id}`}
                      >
                        <Edit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteArticle(article.id)}
                        className="p-2 text-ea-dark/70 hover:text-red-400 transition-colors"
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
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div className="space-y-6">
            {/* Comments Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center">
                <p className="text-3xl font-bold text-ea-dark">{commentsStats.total}</p>
                <p className="text-ea-dark/60 text-sm">Gesamt</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center border-yellow-500/30">
                <p className="text-3xl font-bold text-yellow-400">{commentsStats.pending}</p>
                <p className="text-ea-dark/60 text-sm">Ausstehend</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center border-green-500/30">
                <p className="text-3xl font-bold text-green-400">{commentsStats.approved}</p>
                <p className="text-ea-dark/60 text-sm">Freigegeben</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 text-center border-red-500/30">
                <p className="text-3xl font-bold text-red-400">{commentsStats.rejected}</p>
                <p className="text-ea-dark/60 text-sm">Abgelehnt</p>
              </div>
            </div>

            {/* Comments Filter */}
            <div className="flex space-x-2">
              {['pending', 'approved', 'rejected', 'all'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCommentsFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm transition-all ${
                    commentsFilter === filter
                      ? 'bg-ea-gold/20 text-ea-gold border border-ea-gold'
                      : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
                  }`}
                  data-testid={`filter-${filter}`}
                >
                  {filter === 'pending' && 'Ausstehend'}
                  {filter === 'approved' && 'Freigegeben'}
                  {filter === 'rejected' && 'Abgelehnt'}
                  {filter === 'all' && 'Alle'}
                </button>
              ))}
            </div>

            {/* Comments List */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-ea-gold" />
                <span className="text-ea-dark font-medium">
                  {commentsFilter === 'pending' && 'Ausstehende Kommentare'}
                  {commentsFilter === 'approved' && 'Freigegebene Kommentare'}
                  {commentsFilter === 'rejected' && 'Abgelehnte Kommentare'}
                  {commentsFilter === 'all' && 'Alle Kommentare'}
                </span>
              </div>

              {commentsLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-8 h-8 text-ea-gold animate-spin" />
                </div>
              ) : comments.length === 0 ? (
                <div className="p-8 text-center text-ea-dark/50">
                  Keine Kommentare in dieser Kategorie.
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {comments.map((comment) => (
                    <div 
                      key={comment.id} 
                      className="p-5 hover:bg-ea-light transition-colors"
                      data-testid={`comment-row-${comment.id}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          {/* Comment Header */}
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="w-10 h-10 rounded-full bg-ea-gold/20 flex items-center justify-center">
                              <span className="text-ea-gold font-bold">
                                {comment.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <span className="text-ea-dark font-medium">{comment.name}</span>
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  comment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                  comment.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                  'bg-red-500/20 text-red-400'
                                }`}>
                                  {comment.status === 'pending' && 'Ausstehend'}
                                  {comment.status === 'approved' && 'Freigegeben'}
                                  {comment.status === 'rejected' && 'Abgelehnt'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3 text-ea-dark/50 text-xs">
                                <span className="flex items-center space-x-1">
                                  <Mail className="w-3 h-3" />
                                  <span>{comment.email}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Clock className="w-3 h-3" />
                                  <span>{new Date(comment.createdAt).toLocaleString('de-DE')}</span>
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Article Reference */}
                          <p className="text-ea-dark/50 text-xs mb-2">
                            Artikel: <span className="text-ea-gold">{comment.articleTitle}</span>
                          </p>
                          
                          {/* Comment Content */}
                          <p className="text-ea-dark/80 bg-ea-light p-3 rounded-lg">{comment.content}</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 ml-4">
                          {comment.status === 'pending' && (
                            <>
                              <button
                                onClick={() => handleApproveComment(comment.id)}
                                className="p-2 text-ea-dark/70 hover:text-green-400 transition-colors"
                                title="Freigeben"
                                data-testid={`approve-comment-${comment.id}`}
                              >
                                <CheckCircle className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => handleRejectComment(comment.id)}
                                className="p-2 text-ea-dark/70 hover:text-red-400 transition-colors"
                                title="Ablehnen"
                                data-testid={`reject-comment-${comment.id}`}
                              >
                                <XCircle className="w-5 h-5" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="p-2 text-ea-dark/70 hover:text-red-400 transition-colors"
                            title="Löschen"
                            data-testid={`delete-comment-${comment.id}`}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Regions Tab */}
        {activeTab === 'regions' && (
          <div className="space-y-6">
            {/* Regions Overview */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-5 h-5 text-ea-gold" />
                  <span className="text-ea-dark font-medium">Regionen-Landingpages ({regions.length})</span>
                </div>
              </div>

              {regionsLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-8 h-8 text-ea-gold animate-spin" />
                </div>
              ) : regions.length === 0 ? (
                <div className="p-8 text-center">
                  <MapPin className="w-12 h-12 text-ea-gold/30 mx-auto mb-3" />
                  <p className="text-ea-dark/50 mb-4">Noch keine Regionen erstellt.</p>
                  <button
                    onClick={() => setIsCreatingRegion(true)}
                    className="px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all inline-flex items-center space-x-2"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Erste Region erstellen</span>
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {regions.map((region) => (
                    <div 
                      key={region.slug} 
                      className="p-4 flex items-center justify-between hover:bg-ea-light transition-colors"
                      data-testid={`region-row-${region.slug}`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className="text-lg font-semibold text-ea-gold">{region.investmentScore}/100</span>
                          <span className="text-xs bg-ea-gold/10 text-ea-gold px-2 py-1 rounded">
                            Score
                          </span>
                        </div>
                        <h3 className="text-ea-dark font-medium">{region.title}</h3>
                        <p className="text-ea-dark/50 text-sm">{region.subtitle} • {region.priceRange}</p>
                        <p className="text-ea-dark/40 text-xs mt-1">
                          /{region.slug} • {region.apartments?.length || 0} Apartments
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => setEditingRegion(region)}
                          className="p-2 text-ea-dark/70 hover:text-ea-gold transition-colors"
                          data-testid={`edit-region-${region.slug}`}
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteRegion(region.slug)}
                          className="p-2 text-ea-dark/70 hover:text-red-400 transition-colors"
                          data-testid={`delete-region-${region.slug}`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Predefined Regions Info */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-ea-dark font-semibold mb-4 flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-ea-gold" />
                <span>Vordefinierte Regionen</span>
              </h3>
              <p className="text-ea-dark/70 text-sm mb-4">
                Diese 5 Regionen haben bereits statische Landingpages. Erstellen Sie hier 
                Einträge, um die Inhalte über das CMS zu verwalten:
              </p>
              <div className="grid grid-cols-5 gap-3">
                {['skadar-lake', 'zabljak', 'budva', 'niksic', 'podgorica'].map((slug) => {
                  const exists = regions.find(r => r.slug === slug);
                  return (
                    <div 
                      key={slug}
                      className={`p-3 rounded-lg text-center text-sm ${
                        exists 
                          ? 'bg-green-500/10 text-green-600 border border-green-500/30' 
                          : 'bg-ea-light text-ea-dark/50 border border-dashed border-gray-300'
                      }`}
                    >
                      <span className="capitalize">{slug.replace('-', ' ')}</span>
                      {exists && <CheckCircle className="w-4 h-4 inline ml-1" />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div className="space-y-6">
            {/* Pages Overview */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Layout className="w-5 h-5 text-ea-gold" />
                  <span className="text-ea-dark font-medium">Seiten-Editor ({pages.length})</span>
                </div>
              </div>

              {pagesLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-8 h-8 text-ea-gold animate-spin" />
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {pages.map((page) => {
                    const pageIcons = {
                      'home': Home,
                      'team': Users,
                      'contact': Phone
                    };
                    const PageIcon = pageIcons[page.slug] || Globe;
                    
                    return (
                      <div 
                        key={page.slug} 
                        className="p-4 flex items-center justify-between hover:bg-ea-light transition-colors"
                        data-testid={`page-row-${page.slug}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-ea-gold/10 rounded-lg flex items-center justify-center">
                            <PageIcon className="w-5 h-5 text-ea-gold" />
                          </div>
                          <div>
                            <h3 className="text-ea-dark font-medium">{page.title}</h3>
                            <p className="text-ea-dark/50 text-sm">
                              /{page.slug} • {page.sections?.length || 0} Sektionen
                              {page.isDefault && (
                                <span className="ml-2 text-xs bg-ea-light px-2 py-0.5 rounded">Standard</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setEditingPage(page)}
                            className="px-4 py-2 bg-ea-gold text-ea-dark text-sm font-medium rounded-lg hover:bg-ea-gold/80 transition-colors flex items-center space-x-2"
                            data-testid={`edit-page-${page.slug}`}
                          >
                            <Edit2 className="w-4 h-4" />
                            <span>Bearbeiten</span>
                          </button>
                          {!page.isDefault && (
                            <button
                              onClick={() => handleResetPage(page.slug)}
                              className="p-2 text-ea-dark/50 hover:text-red-400 transition-colors"
                              title="Auf Standard zurücksetzen"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Help Info */}
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <h3 className="text-ea-dark font-semibold mb-4 flex items-center space-x-2">
                <HelpCircle className="w-5 h-5 text-ea-gold" />
                <span>Seiten-Editor Hilfe</span>
              </h3>
              <div className="text-ea-dark/70 text-sm space-y-2">
                <p>• <strong>Home:</strong> Hero-Bereich, Info-Cards, Call-to-Actions</p>
                <p>• <strong>Über uns:</strong> Team-Mitglieder, Beschreibungstexte</p>
                <p>• <strong>Kontakt:</strong> Kontaktdaten, Öffnungszeiten</p>
                <p>• Alle Änderungen werden live auf der Website angezeigt.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Article Form Component
const ArticleForm = ({ initialData, onSave, onCancel, saveStatus, credentials }) => {
  const [formData, setFormData] = useState(initialData);
  const [editorContent, setEditorContent] = useState(contentToHtml(initialData.content || ''));

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from title
    if (field === 'title') {
      const newSlug = generateSlug(value);
      setFormData(prev => ({ ...prev, slug: newSlug }));
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value }
    }));
  };

  const handleEditorChange = (html) => {
    setEditorContent(html);
    // Convert HTML to clean content for storage
    const cleanContent = htmlToCleanContent(html);
    setFormData(prev => ({ ...prev, content: cleanContent }));
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

  // Tooltip helper component
  const Tooltip = ({ text }) => (
    <div className="relative group inline-flex items-center ml-1">
      <HelpCircle className="w-4 h-4 text-ea-dark/40 hover:text-ea-gold cursor-help" />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-ea-dark text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 max-w-xs">
        {text}
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-6">
        <h3 className="text-xl font-bold text-ea-gold flex items-center">
          Grundinformationen
          <Tooltip text="Diese Felder sind wichtig für SEO und die Darstellung auf der Website." />
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="flex items-center text-ea-dark/80 text-sm mb-2">
              Cluster
              <Tooltip text="Wähle das Thema des Artikels. Beeinflusst die Kategorie-Filter im Blog." />
            </label>
            <select
              value={formData.cluster}
              onChange={(e) => handleChange('cluster', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            >
              {clusters.map(c => (
                <option key={c.id} value={c.id}>{c.id} - {c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex items-center text-ea-dark/80 text-sm mb-2">
              Kategorie
              <Tooltip text="Wird als Badge auf der Artikel-Karte angezeigt." />
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="flex items-center text-ea-dark/80 text-sm mb-2">
            Titel *
            <Tooltip text="SEO-Tipp: 50-60 Zeichen sind optimal. Der Titel erscheint in Google-Suchergebnissen." />
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            placeholder="z.B. Firmengründung in Montenegro: Der ultimative Guide 2025"
            required
          />
          <p className="text-xs text-ea-dark/50 mt-1">{formData.title?.length || 0}/60 Zeichen</p>
        </div>

        <div>
          <label className="flex items-center text-ea-dark/80 text-sm mb-2">
            Slug (URL) *
            <Tooltip text="Wird automatisch aus dem Titel generiert. Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt." />
          </label>
          <div className="flex items-center gap-2">
            <span className="text-ea-dark/50 text-sm">/blog/</span>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => handleChange('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
              className="flex-1 bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
              placeholder="wird-automatisch-generiert"
              required
            />
          </div>
          <p className="text-xs text-ea-gold mt-1">✓ Slug wird automatisch aus dem Titel generiert</p>
        </div>

        <div>
          <label className="flex items-center text-ea-dark/80 text-sm mb-2">
            Kurzfassung *
            <Tooltip text="Erscheint in der Vorschau und als Meta-Description für SEO. 150-160 Zeichen optimal." />
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => handleChange('excerpt', e.target.value)}
            className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold h-24"
            placeholder="Eine prägnante Zusammenfassung des Artikels für die Vorschau..."
            required
          />
          <p className="text-xs text-ea-dark/50 mt-1">{formData.excerpt?.length || 0}/160 Zeichen</p>
        </div>

        <div>
          <label className="flex items-center text-ea-dark/80 text-sm mb-2">
            Inhalt *
            <Tooltip text="Nutze die Toolbar für Formatierung. H1 nur 1x verwenden (Hauptüberschrift)!" />
          </label>
          <WYSIWYGEditor
            value={editorContent}
            onChange={handleEditorChange}
            placeholder="Beginne hier zu schreiben... Markiere Text und wähle eine Formatierung aus der Toolbar."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <ImageUploader
              label="Artikel-Bild *"
              currentImage={formData.image}
              onImageUploaded={(url) => handleChange('image', url || '')}
              credentials={credentials}
            />
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Autor *</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => handleChange('author', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Datum</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleChange('date', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            />
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Lesezeit</label>
            <input
              type="text"
              value={formData.readTime}
              onChange={(e) => handleChange('readTime', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
              placeholder="10 min"
            />
          </div>
          <div className="flex items-end">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={(e) => handleChange('featured', e.target.checked)}
                className="w-5 h-5 rounded bg-ea-light border-gray-200 text-ea-gold focus:ring-gold"
              />
              <span className="text-ea-dark/80">Featured</span>
            </label>
          </div>
        </div>
      </div>

      {/* Due Diligence Box */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-ea-gold">Due Diligence Box</h3>
        <div>
          <label className="block text-ea-dark/80 text-sm mb-2">Titel</label>
          <input
            type="text"
            value={formData.dueDiligenceBox?.title || ''}
            onChange={(e) => handleNestedChange('dueDiligenceBox', 'title', e.target.value)}
            className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
          />
        </div>
        <div>
          <label className="block text-ea-dark/80 text-sm mb-2">Inhalt</label>
          <textarea
            value={formData.dueDiligenceBox?.content || ''}
            onChange={(e) => handleNestedChange('dueDiligenceBox', 'content', e.target.value)}
            className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold h-24"
          />
        </div>
      </div>

      {/* Expert Tip */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-ea-gold">Experten-Tipp</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Autor</label>
            <input
              type="text"
              value={formData.expertTip?.author || ''}
              onChange={(e) => handleNestedChange('expertTip', 'author', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            />
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Titel</label>
            <input
              type="text"
              value={formData.expertTip?.title || ''}
              onChange={(e) => handleNestedChange('expertTip', 'title', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            />
          </div>
        </div>
        <div>
          <label className="block text-ea-dark/80 text-sm mb-2">Inhalt</label>
          <textarea
            value={formData.expertTip?.content || ''}
            onChange={(e) => handleNestedChange('expertTip', 'content', e.target.value)}
            className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold h-24"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 text-ea-dark/70 hover:text-ea-dark transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={saveStatus.type === 'loading'}
          className="px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all flex items-center space-x-2"
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

// Region Form Component
const RegionForm = ({ initialData, onSave, onCancel, saveStatus, isCreating, credentials }) => {
  const [formData, setFormData] = useState(initialData);
  const [bulletPointInput, setBulletPointInput] = useState('');

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const addBulletPoint = () => {
    if (bulletPointInput.trim()) {
      setFormData(prev => ({
        ...prev,
        bulletPoints: [...(prev.bulletPoints || []), { text: bulletPointInput.trim() }]
      }));
      setBulletPointInput('');
    }
  };

  const removeBulletPoint = (index) => {
    setFormData(prev => ({
      ...prev,
      bulletPoints: prev.bulletPoints.filter((_, i) => i !== index)
    }));
  };

  // Pre-defined slugs for Montenegro regions
  const predefinedSlugs = [
    { slug: 'skadar-lake', name: 'Skadar-Lake' },
    { slug: 'zabljak', name: 'Žabljak' },
    { slug: 'budva', name: 'Budva' },
    { slug: 'niksic', name: 'Nikšić' },
    { slug: 'podgorica', name: 'Podgorica' },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Info */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-ea-gold flex items-center space-x-2">
          <MapPin className="w-5 h-5" />
          <span>Basis-Informationen</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Slug (URL-Pfad) *</label>
            {isCreating ? (
              <select
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
                required
              >
                <option value="">Region auswählen...</option>
                {predefinedSlugs.map(({ slug, name }) => (
                  <option key={slug} value={slug}>{name} (/immobilien/{slug})</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.slug}
                disabled
                className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-ea-dark/50"
              />
            )}
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Investment-Score (0-100) *</label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.investmentScore}
              onChange={(e) => handleChange('investmentScore', parseInt(e.target.value) || 0)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-ea-dark/80 text-sm mb-2">Titel *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            placeholder="z.B. Investieren in Podgorica"
            required
          />
        </div>

        <div>
          <label className="block text-ea-dark/80 text-sm mb-2">Untertitel *</label>
          <input
            type="text"
            value={formData.subtitle}
            onChange={(e) => handleChange('subtitle', e.target.value)}
            className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            placeholder="z.B. Hauptstadt & Business-Hub"
            required
          />
        </div>
      </div>

      {/* Investment Metrics */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-ea-gold">Investment-Kennzahlen</h3>
        
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Preisrange</label>
            <input
              type="text"
              value={formData.priceRange}
              onChange={(e) => handleChange('priceRange', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
              placeholder="€1.500-3.000/m²"
            />
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Wertsteigerung</label>
            <input
              type="text"
              value={formData.potential}
              onChange={(e) => handleChange('potential', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
              placeholder="+35-55%"
            />
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Zeithorizont</label>
            <input
              type="text"
              value={formData.timeHorizon}
              onChange={(e) => handleChange('timeHorizon', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
              placeholder="2-5 Jahre"
            />
          </div>
        </div>
      </div>

      {/* Content (WYSIWYG) */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-ea-gold">Haupttext (WYSIWYG)</h3>
        <WYSIWYGEditor
          value={formData.content}
          onChange={(content) => handleChange('content', content)}
        />
      </div>

      {/* Bullet Points */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-ea-gold">Vorteile / Quick-Facts</h3>
        
        <div className="flex space-x-2">
          <input
            type="text"
            value={bulletPointInput}
            onChange={(e) => setBulletPointInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBulletPoint())}
            className="flex-1 bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            placeholder="z.B. Flughafen in 20 Min. erreichbar"
          />
          <button
            type="button"
            onClick={addBulletPoint}
            className="px-4 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {formData.bulletPoints?.length > 0 && (
          <ul className="space-y-2">
            {formData.bulletPoints.map((bp, index) => (
              <li key={index} className="flex items-center justify-between bg-ea-light p-3 rounded-lg">
                <span className="text-ea-dark">{bp.text}</span>
                <button
                  type="button"
                  onClick={() => removeBulletPoint(index)}
                  className="text-ea-dark/50 hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Image Gallery */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-ea-gold flex items-center space-x-2">
          <ImageIcon className="w-5 h-5" />
          <span>Bilder-Galerie</span>
        </h3>
        
        <ImageGalleryUploader
          images={formData.imageUrls || []}
          onImagesChange={(urls) => handleChange('imageUrls', urls)}
          credentials={credentials}
          maxImages={10}
        />
      </div>

      {/* Apartments Info */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <h3 className="text-xl font-bold text-ea-gold flex items-center space-x-2">
          <Building2 className="w-5 h-5" />
          <span>Apartment-Listings</span>
        </h3>
        <p className="text-ea-dark/70 text-sm mt-2">
          Apartments können nach dem Speichern der Region über die API hinzugefügt werden.
          Aktuell: {formData.apartments?.length || 0} Apartments
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 text-ea-dark/70 hover:text-ea-dark transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={saveStatus.type === 'loading'}
          className="px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all flex items-center space-x-2"
        >
          {saveStatus.type === 'loading' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>Region speichern</span>
        </button>
      </div>
    </form>
  );
};

// Page Editor Component - Full CMS for all pages
const PageEditor = ({ page, onSave, onCancel, saveStatus, credentials }) => {
  const [pageData, setPageData] = useState(page);
  const [activeSection, setActiveSection] = useState(page.sections?.[0]?.id || null);

  const handleMetaChange = (field, value) => {
    setPageData(prev => ({ ...prev, [field]: value }));
  };

  const handleSectionChange = (sectionId, field, value) => {
    setPageData(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, [field]: value } : s
      )
    }));
  };

  const handleSectionDataChange = (sectionId, dataField, value) => {
    setPageData(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === sectionId ? { ...s, data: { ...s.data, [dataField]: value } } : s
      )
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(pageData);
  };

  const currentSection = pageData.sections?.find(s => s.id === activeSection);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* SEO Fields */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-ea-gold flex items-center space-x-2">
          <Globe className="w-5 h-5" />
          <span>SEO & Meta-Daten</span>
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Meta-Titel (Google)</label>
            <input
              type="text"
              value={pageData.metaTitle || ''}
              onChange={(e) => handleMetaChange('metaTitle', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
              placeholder="Titel für Google-Suche"
            />
            <p className="text-xs text-ea-dark/40 mt-1">{(pageData.metaTitle || '').length}/60 Zeichen</p>
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">URL-Pfad</label>
            <input
              type="text"
              value={`/${pageData.slug}`}
              disabled
              className="w-full bg-gray-100 border border-gray-200 rounded-lg px-4 py-3 text-ea-dark/50"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-ea-dark/80 text-sm mb-2">Meta-Beschreibung (Google)</label>
          <textarea
            value={pageData.metaDescription || ''}
            onChange={(e) => handleMetaChange('metaDescription', e.target.value)}
            rows={2}
            className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold resize-none"
            placeholder="Kurzbeschreibung für Google-Vorschau"
          />
          <p className="text-xs text-ea-dark/40 mt-1">{(pageData.metaDescription || '').length}/160 Zeichen</p>
        </div>
      </div>

      {/* Section Tabs */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          {pageData.sections?.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => setActiveSection(section.id)}
              className={`px-6 py-4 text-sm font-medium whitespace-nowrap transition-colors ${
                activeSection === section.id
                  ? 'bg-ea-gold/10 text-ea-gold border-b-2 border-ea-gold'
                  : 'text-ea-dark/70 hover:text-ea-dark hover:bg-ea-light'
              }`}
            >
              {section.type === 'hero' && 'Hero-Bereich'}
              {section.type === 'cards' && (section.title || 'Info-Cards')}
              {section.type === 'team' && 'Team'}
              {section.type === 'text' && (section.title || 'Text')}
              {section.type === 'contact' && 'Kontakt-Info'}
            </button>
          ))}
        </div>

        {/* Section Editor */}
        <div className="p-6">
          {currentSection && (
            <SectionEditor
              section={currentSection}
              onChange={(field, value) => handleSectionChange(currentSection.id, field, value)}
              onDataChange={(field, value) => handleSectionDataChange(currentSection.id, field, value)}
              credentials={credentials}
            />
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="bg-white border border-gray-200 rounded-xl shadow-sm px-6 py-3 text-ea-dark/70 hover:text-ea-dark transition-colors"
        >
          Abbrechen
        </button>
        <button
          type="submit"
          disabled={saveStatus.type === 'loading'}
          className="px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all flex items-center space-x-2"
        >
          {saveStatus.type === 'loading' ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          <span>Seite speichern</span>
        </button>
      </div>
    </form>
  );
};

// Section Editor - renders different editors based on section type
const SectionEditor = ({ section, onChange, onDataChange, credentials }) => {
  const data = section.data || {};

  // Hero Section Editor
  if (section.type === 'hero') {
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-ea-dark">Hero-Bereich</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Haupttitel (H1)</label>
            <input
              type="text"
              value={data.title || ''}
              onChange={(e) => onDataChange('title', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            />
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Untertitel</label>
            <input
              type="text"
              value={data.subtitle || ''}
              onChange={(e) => onDataChange('subtitle', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">CTA Button Text</label>
            <input
              type="text"
              value={data.ctaText || ''}
              onChange={(e) => onDataChange('ctaText', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
              placeholder="z.B. Jetzt Beratung anfragen"
            />
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">CTA Link</label>
            <input
              type="text"
              value={data.ctaLink || ''}
              onChange={(e) => onDataChange('ctaLink', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
              placeholder="/contact"
            />
          </div>
        </div>
      </div>
    );
  }

  // Cards Section Editor (Info-Cards)
  if (section.type === 'cards') {
    const cards = data.cards || [];
    
    const updateCard = (cardId, field, value) => {
      const newCards = cards.map(c => c.id === cardId ? { ...c, [field]: value } : c);
      onDataChange('cards', newCards);
    };

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-ea-dark">{section.title || 'Info-Cards'}</h4>
          <input
            type="text"
            value={section.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            className="bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold"
            placeholder="Sektions-Titel"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {cards.map((card, idx) => (
            <div key={card.id || idx} className="bg-ea-light rounded-lg p-4 space-y-3">
              <input
                type="text"
                value={card.title}
                onChange={(e) => updateCard(card.id, 'title', e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-ea-dark font-medium focus:outline-none focus:border-ea-gold"
                placeholder="Titel"
              />
              <textarea
                value={card.description}
                onChange={(e) => updateCard(card.id, 'description', e.target.value)}
                rows={2}
                className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-ea-dark text-sm focus:outline-none focus:border-ea-gold resize-none"
                placeholder="Beschreibung"
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Team Section Editor
  if (section.type === 'team') {
    const members = data.members || [];
    
    const updateMember = (memberId, field, value) => {
      const newMembers = members.map(m => m.id === memberId ? { ...m, [field]: value } : m);
      onDataChange('members', newMembers);
    };

    return (
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-ea-dark">Team-Mitglieder</h4>
        
        {members.map((member, idx) => (
          <div key={member.id || idx} className="bg-ea-light rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-6">
              <div className="w-32 flex-shrink-0">
                <ImageUploader
                  label="Foto"
                  currentImage={member.image}
                  onImageUploaded={(url) => updateMember(member.id, 'image', url || '')}
                  credentials={credentials}
                />
              </div>
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-ea-dark/80 text-xs mb-1">Name</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold"
                    />
                  </div>
                  <div>
                    <label className="block text-ea-dark/80 text-xs mb-1">Titel/Position</label>
                    <input
                      type="text"
                      value={member.title}
                      onChange={(e) => updateMember(member.id, 'title', e.target.value)}
                      className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-ea-dark/80 text-xs mb-1">Beschreibung</label>
                  <textarea
                    value={member.description}
                    onChange={(e) => updateMember(member.id, 'description', e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-ea-dark text-sm focus:outline-none focus:border-ea-gold resize-none"
                  />
                </div>
                <div>
                  <label className="block text-ea-dark/80 text-xs mb-1">E-Mail</label>
                  <input
                    type="email"
                    value={member.email || ''}
                    onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                    className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold"
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Text Section Editor (WYSIWYG)
  if (section.type === 'text') {
    return (
      <div className="space-y-4">
        <div>
          <label className="block text-ea-dark/80 text-sm mb-2">Sektions-Titel</label>
          <input
            type="text"
            value={section.title || ''}
            onChange={(e) => onChange('title', e.target.value)}
            className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
          />
        </div>
        <div>
          <label className="block text-ea-dark/80 text-sm mb-2">Inhalt (WYSIWYG)</label>
          <WYSIWYGEditor
            value={section.content || ''}
            onChange={(content) => onChange('content', content)}
          />
        </div>
      </div>
    );
  }

  // Contact Section Editor
  if (section.type === 'contact') {
    return (
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-ea-dark">Kontakt-Informationen</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">E-Mail</label>
            <input
              type="email"
              value={data.email || ''}
              onChange={(e) => onDataChange('email', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            />
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Telefon</label>
            <input
              type="tel"
              value={data.phone || ''}
              onChange={(e) => onDataChange('phone', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            />
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Adresse</label>
            <input
              type="text"
              value={data.address || ''}
              onChange={(e) => onDataChange('address', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            />
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Öffnungszeiten</label>
            <input
              type="text"
              value={data.hours || ''}
              onChange={(e) => onDataChange('hours', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-ea-dark/50 text-center py-8">
      Unbekannter Sektionstyp: {section.type}
    </div>
  );
};

export default AdminPage;
