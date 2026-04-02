import React, { useState, useEffect } from 'react';
import { adminApi, articlesApi, commentsApi, regionsApi, pagesApi, settingsApi, investmentApi } from '../services/api';
import { 
  LogIn, LogOut, Plus, Edit2, Trash2, Save, X, 
  FileText, Loader2, AlertCircle, Check, MessageSquare,
  CheckCircle, XCircle, Clock, Mail, User, HelpCircle, MapPin, Building2, Image as ImageIcon,
  Layout, Users, Home, Phone, Globe, Download, TrendingUp, BarChart3, Shield, Send
} from 'lucide-react';
import SEO from '../components/SEO';
import WYSIWYGEditor, { FormField, generateSlug, htmlToCleanContent, contentToHtml } from '../components/admin/WYSIWYGEditor';
import ImageUploader, { ImageGalleryUploader } from '../components/admin/ImageUploader';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import NewsletterAdmin from '../components/admin/NewsletterAdmin';

const AdminPage = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Active Tab: 'dashboard', 'articles', 'comments', 'regions', 'pages', 'downloads', 'investment', 'homepage', 'legal'
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Homepage Content State
  const [homepageContent, setHomepageContent] = useState({});
  const [homepageSaving, setHomepageSaving] = useState(false);

  // Legal Pages State
  const [impressumContent, setImpressumContent] = useState('');
  const [datenschutzContent, setDatenschutzContent] = useState('');
  const [legalSaving, setLegalSaving] = useState(false);
  const [activeLegalPage, setActiveLegalPage] = useState('impressum');

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

  // Downloads State
  const [downloadSettings, setDownloadSettings] = useState({
    praxisleitfaden_url: '',
    budva_expose_url: '',
    niksic_expose_url: '',
    podgorica_expose_url: '',
    skadar_lake_expose_url: '',
    zabljak_expose_url: '',
    custom_exposes: []
  });
  const [downloadsSaving, setDownloadsSaving] = useState(false);

  // Investment Data State
  const [investLocations, setInvestLocations] = useState([]);
  const [investLoading, setInvestLoading] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationFormData, setLocationFormData] = useState({
    city: '', country: 'Montenegro', region: '', latitude: 0, longitude: 0,
    population: 0, price_per_m2: 0, rental_yield: 0, price_growth: 0,
    investment_score: 0, description: '', highlights: []
  });
  
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
        fetchDownloadSettings();
        fetchInvestLocations();
        fetchHomepageContent();
        fetchLegalContent('impressum');
        fetchLegalContent('datenschutz');
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
        fetchDownloadSettings();
        fetchInvestLocations();
        fetchHomepageContent();
        fetchLegalContent('impressum');
        fetchLegalContent('datenschutz');
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

  // Download Settings Functions
  const fetchDownloadSettings = async () => {
    try {
      const data = await settingsApi.getDownloads();
      setDownloadSettings(data);
    } catch (err) {
      console.error('Failed to fetch download settings:', err);
    }
  };

  const handleSaveDownloads = async () => {
    setDownloadsSaving(true);
    try {
      await settingsApi.updateDownloads(downloadSettings, credentials);
      setSaveStatus({ type: 'success', message: 'Download-URLs gespeichert!' });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
    } finally {
      setDownloadsSaving(false);
    }
  };

  // Homepage Content Functions
  const HOMEPAGE_DEFAULTS = {
    hero_title: 'Firmengründung, Aufenthalt & Investments in Montenegro und Serbien',
    hero_subtitle: 'EuroAdria ist Ihre Brücke zu erfolgreichen Investitionen, rechtssicherer Auswanderung und internationaler Unternehmensstrukturierung, sowohl in der Adria-Region als auch in Asien. Wir sind Ihr Trusted Advisor für alle unternehmerischen und privaten Vorhaben im Ausland.',
    hero_cta_text: 'Jetzt Beratung anfragen',
    testimonial_image: '',
    testimonial_image_position: 50,
    testimonial_quote: 'Dank EuroAdria konnte ich meine Firmengründung in Montenegro schnell, sicher und komplett stressfrei umsetzen.',
    testimonial_author: 'Maximilian R., Unternehmer aus Deutschland',
    stats_image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952',
    stats_image_position: 50,
    cta_title: 'Bereit für Ihre Investition?',
    cta_subtitle: 'Vereinbaren Sie ein unverbindliches Erstgespräch mit unseren Experten und entdecken Sie die Möglichkeiten am Balkan.',
    trust_items: [
      { title: 'Vertrauenswürdig', desc: 'Referenziert in n-tv & RTL' },
      { title: 'Rendite-Fokus', desc: 'Zweistellige Zielrenditen' },
      { title: 'Expertise', desc: '15+ Jahre Erfahrung' },
      { title: 'Sicherheit', desc: 'Asset Protection' }
    ]
  };

  const fetchHomepageContent = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/settings/homepage`);
      if (res.ok) {
        const data = await res.json();
        setHomepageContent({ ...HOMEPAGE_DEFAULTS, ...data });
      } else {
        setHomepageContent(HOMEPAGE_DEFAULTS);
      }
    } catch (err) {
      console.error('Failed to fetch homepage content:', err);
      setHomepageContent(HOMEPAGE_DEFAULTS);
    }
  };

  const handleSaveHomepage = async () => {
    setHomepageSaving(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/settings/homepage`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) },
        body: JSON.stringify(homepageContent)
      });
      if (res.ok) {
        const saved = await res.json();
        setHomepageContent(saved);
        setSaveStatus({ type: 'success', message: 'Homepage-Inhalte gespeichert!' });
        setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
      }
    } catch (err) { setSaveStatus({ type: 'error', message: err.message }); }
    finally { setHomepageSaving(false); }
  };

  // Legal Pages Functions
  const fetchLegalContent = async (pageType) => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/settings/legal/${pageType}`);
      if (res.ok) {
        const data = await res.json();
        if (pageType === 'impressum') setImpressumContent(data.content || '');
        else setDatenschutzContent(data.content || '');
      }
    } catch (err) {
      console.error(`Failed to fetch ${pageType}:`, err);
    }
  };

  const handleSaveLegal = async (pageType) => {
    setLegalSaving(true);
    const content = pageType === 'impressum' ? impressumContent : datenschutzContent;
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/settings/legal/${pageType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        setSaveStatus({ type: 'success', message: `${pageType === 'impressum' ? 'Impressum' : 'Datenschutz'} gespeichert!` });
        setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
      }
    } catch (err) { setSaveStatus({ type: 'error', message: err.message }); }
    finally { setLegalSaving(false); }
  };


  // Investment Location Functions
  const fetchInvestLocations = async () => {
    setInvestLoading(true);
    try {
      const data = await investmentApi.getLocations();
      setInvestLocations(data);
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    } finally {
      setInvestLoading(false);
    }
  };

  const handleSaveLocation = async () => {
    try {
      if (editingLocation) {
        await investmentApi.updateLocation(editingLocation, locationFormData, credentials);
      } else {
        await investmentApi.createLocation(locationFormData, credentials);
      }
      fetchInvestLocations();
      setEditingLocation(null);
      setLocationFormData({ city: '', country: 'Montenegro', region: '', latitude: 0, longitude: 0, population: 0, price_per_m2: 0, rental_yield: 0, price_growth: 0, investment_score: 0, description: '', highlights: [] });
      setSaveStatus({ type: 'success', message: 'Standort gespeichert!' });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
    }
  };

  const handleEditLocation = (loc) => {
    setEditingLocation(loc.city);
    setLocationFormData({
      city: loc.city, country: loc.country, region: loc.region || '',
      latitude: loc.latitude || 0, longitude: loc.longitude || 0,
      population: loc.population || 0, price_per_m2: loc.price_per_m2 || 0,
      rental_yield: loc.rental_yield || 0, price_growth: loc.price_growth || 0,
      investment_score: loc.investment_score || 0, description: loc.description || '',
      highlights: loc.highlights || []
    });
  };

  const handleDeleteLocation = async (city) => {
    if (!window.confirm(`Standort "${city}" wirklich löschen?`)) return;
    try {
      await investmentApi.deleteLocation(city, credentials);
      fetchInvestLocations();
      setSaveStatus({ type: 'success', message: 'Standort gelöscht!' });
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
      expertTip: { author: '', title: '', content: '' },
      downloadUrl: '',
      sortOrder: 0
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
    <div className="min-h-screen pt-24 sm:pt-32 pb-20 px-4 sm:px-6" data-testid="admin-dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <img src="/euroadria-logo.png" alt="EuroAdria" className="h-10 mb-2" />
            <h1 className="text-2xl sm:text-4xl font-semibold font-bold text-ea-dark mb-1 sm:mb-2">
              Admin <span className="text-ea-gold">Dashboard</span>
            </h1>
            <p className="text-ea-dark/70 text-sm sm:text-base">Verwalten Sie Artikel, Kommentare und Regionen</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {activeTab === 'articles' && (
              <button
                onClick={() => setIsCreating(true)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all flex items-center space-x-2 text-sm sm:text-base"
                data-testid="create-article-button"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Neuer Artikel</span>
              </button>
            )}
            {activeTab === 'regions' && (
              <button
                onClick={() => setIsCreatingRegion(true)}
                className="px-4 sm:px-6 py-2 sm:py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all flex items-center space-x-2 text-sm sm:text-base"
                data-testid="create-region-button"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Neue Region</span>
              </button>
            )}
            <button
              onClick={handleLogout}
              className="bg-white border border-gray-200 rounded-xl shadow-sm px-3 sm:px-4 py-2 text-ea-dark/70 hover:text-ea-dark transition-colors flex items-center space-x-2 text-sm sm:text-base"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
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
        <div className="flex gap-2 sm:gap-4 mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base shrink-0 ${
              activeTab === 'dashboard'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-dashboard"
          >
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Dashboard</span>
          </button>
          <button
            onClick={() => setActiveTab('articles')}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base shrink-0 ${
              activeTab === 'articles'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-articles"
          >
            <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Artikel ({articles.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base shrink-0 ${
              activeTab === 'comments'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-comments"
          >
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Kommentare</span>
            {commentsStats.pending > 0 && (
              <span className="ml-1 px-2 py-0.5 bg-red-500 text-ea-dark text-xs rounded-full">
                {commentsStats.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('regions')}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base shrink-0 ${
              activeTab === 'regions'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-regions"
          >
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Regionen ({regions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base shrink-0 ${
              activeTab === 'pages'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-pages"
          >
            <Layout className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Seiten ({pages.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('downloads')}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base shrink-0 ${
              activeTab === 'downloads'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-downloads"
          >
            <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Downloads</span>
          </button>
          <button
            onClick={() => setActiveTab('homepage')}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base shrink-0 ${
              activeTab === 'homepage'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-homepage"
          >
            <Layout className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Homepage</span>
          </button>
          <button
            onClick={() => setActiveTab('investment')}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base shrink-0 ${
              activeTab === 'investment'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-investment"
          >
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Investment ({investLocations.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('legal')}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base shrink-0 ${
              activeTab === 'legal'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-legal"
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Rechtliches</span>
          </button>
          <button
            onClick={() => setActiveTab('newsletter')}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base shrink-0 ${
              activeTab === 'newsletter'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-newsletter"
          >
            <Send className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Newsletter</span>
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <AnalyticsDashboard credentials={credentials} />
        )}

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
                      <p className="text-ea-dark/50 text-sm">{article.category} • {article.date} • Pos: {article.sortOrder ?? 0}</p>
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 text-center">
                <p className="text-2xl sm:text-3xl font-bold text-ea-dark">{commentsStats.total}</p>
                <p className="text-ea-dark/60 text-xs sm:text-sm">Gesamt</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 text-center border-yellow-500/30">
                <p className="text-2xl sm:text-3xl font-bold text-yellow-400">{commentsStats.pending}</p>
                <p className="text-ea-dark/60 text-xs sm:text-sm">Ausstehend</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 text-center border-green-500/30">
                <p className="text-2xl sm:text-3xl font-bold text-green-400">{commentsStats.approved}</p>
                <p className="text-ea-dark/60 text-xs sm:text-sm">Freigegeben</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 text-center border-red-500/30">
                <p className="text-2xl sm:text-3xl font-bold text-red-400">{commentsStats.rejected}</p>
                <p className="text-ea-dark/60 text-xs sm:text-sm">Abgelehnt</p>
              </div>
            </div>

            {/* Comments Filter */}
            <div className="flex space-x-2 overflow-x-auto scrollbar-hide pb-1">
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

        {/* Downloads Tab */}
        {activeTab === 'downloads' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Download className="w-5 h-5 text-ea-gold" />
                  <h2 className="text-lg sm:text-xl font-bold text-ea-dark">Download-URLs verwalten</h2>
                </div>
                <button
                  onClick={handleSaveDownloads}
                  disabled={downloadsSaving}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all disabled:opacity-50 w-full sm:w-auto"
                  data-testid="save-downloads-btn"
                >
                  {downloadsSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Speichern</span>
                </button>
              </div>
              <p className="text-ea-dark/60 text-sm mb-6">
                Hinterlegen Sie hier die externen Download-Links (Google Drive, Dropbox, etc.). 
                Wenn eine URL eingetragen ist, wird der Button direkt zum Download verlinkt.
              </p>

              {/* Praxisleitfaden */}
              <div className="mb-6 p-4 bg-ea-light rounded-xl">
                <label className="block text-ea-dark font-semibold mb-1">Praxisleitfaden PDF</label>
                <p className="text-ea-dark/50 text-xs mb-2">Erscheint auf Artikel-Seiten und Team-Seite ("Jetzt kostenlos herunterladen")</p>
                <input
                  type="url"
                  value={downloadSettings.praxisleitfaden_url || ''}
                  onChange={(e) => setDownloadSettings(prev => ({ ...prev, praxisleitfaden_url: e.target.value }))}
                  placeholder="https://drive.google.com/file/d/..."
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
                  data-testid="downloads-praxisleitfaden-url"
                />
              </div>

              <h3 className="text-lg font-semibold text-ea-dark mb-4 border-b border-gray-200 pb-2">Immobilien-Exposés</h3>

              {/* Feste Immobilien Exposés */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'budva_expose_url', label: 'Budva Exposé', page: '/immobilien/budva' },
                  { key: 'niksic_expose_url', label: 'Nikšić Exposé', page: '/immobilien/niksic' },
                  { key: 'podgorica_expose_url', label: 'Podgorica Exposé', page: '/immobilien/podgorica' },
                  { key: 'skadar_lake_expose_url', label: 'Škadarsee Exposé', page: '/immobilien/skadar-lake' },
                  { key: 'zabljak_expose_url', label: 'Žabljak Exposé', page: '/immobilien/zabljak' }
                ].map(({ key, label, page }) => (
                  <div key={key} className="p-4 bg-ea-light rounded-xl">
                    <label className="block text-ea-dark font-semibold mb-1">{label}</label>
                    <p className="text-ea-dark/50 text-xs mb-2">Seite: {page}</p>
                    <input
                      type="url"
                      value={downloadSettings[key] || ''}
                      onChange={(e) => setDownloadSettings(prev => ({ ...prev, [key]: e.target.value }))}
                      placeholder="https://drive.google.com/file/d/..."
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
                      data-testid={`downloads-${key}`}
                    />
                  </div>
                ))}
              </div>

              {/* Eigene Exposés */}
              <h3 className="text-lg font-semibold text-ea-dark mt-8 mb-4 border-b border-gray-200 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span>Eigene Exposés</span>
                <button
                  onClick={() => setDownloadSettings(prev => ({
                    ...prev,
                    custom_exposes: [...(prev.custom_exposes || []), { name: '', url: '', description: '' }]
                  }))}
                  className="flex items-center space-x-1 px-4 py-2 bg-ea-gold text-ea-dark text-sm font-semibold rounded-lg hover:bg-ea-gold/80 transition-all"
                  data-testid="add-custom-expose-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Neues Exposé</span>
                </button>
              </h3>

              {(!downloadSettings.custom_exposes || downloadSettings.custom_exposes.length === 0) ? (
                <p className="text-ea-dark/40 text-sm py-4 text-center">Noch keine eigenen Exposés angelegt. Klicken Sie auf "Neues Exposé" um eines hinzuzufügen.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {downloadSettings.custom_exposes.map((expose, idx) => (
                    <div key={idx} className="p-4 bg-ea-light rounded-xl relative">
                      <button
                        onClick={() => setDownloadSettings(prev => ({
                          ...prev,
                          custom_exposes: prev.custom_exposes.filter((_, i) => i !== idx)
                        }))}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-600 transition-colors"
                        data-testid={`remove-custom-expose-${idx}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="mb-3">
                        <label className="block text-ea-dark font-semibold text-sm mb-1">Name</label>
                        <input
                          type="text"
                          value={expose.name || ''}
                          onChange={(e) => {
                            const updated = [...downloadSettings.custom_exposes];
                            updated[idx] = { ...updated[idx], name: e.target.value };
                            setDownloadSettings(prev => ({ ...prev, custom_exposes: updated }));
                          }}
                          placeholder="z.B. Tivat Exposé"
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-ea-dark focus:outline-none focus:border-ea-gold text-sm"
                          data-testid={`custom-expose-name-${idx}`}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="block text-ea-dark font-semibold text-sm mb-1">Beschreibung <span className="font-normal text-ea-dark/40">(optional)</span></label>
                        <input
                          type="text"
                          value={expose.description || ''}
                          onChange={(e) => {
                            const updated = [...downloadSettings.custom_exposes];
                            updated[idx] = { ...updated[idx], description: e.target.value };
                            setDownloadSettings(prev => ({ ...prev, custom_exposes: updated }));
                          }}
                          placeholder="z.B. Premium-Standort an der Küste"
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-ea-dark focus:outline-none focus:border-ea-gold text-sm"
                          data-testid={`custom-expose-desc-${idx}`}
                        />
                      </div>
                      <div>
                        <label className="block text-ea-dark font-semibold text-sm mb-1">Download-URL</label>
                        <input
                          type="url"
                          value={expose.url || ''}
                          onChange={(e) => {
                            const updated = [...downloadSettings.custom_exposes];
                            updated[idx] = { ...updated[idx], url: e.target.value };
                            setDownloadSettings(prev => ({ ...prev, custom_exposes: updated }));
                          }}
                          placeholder="https://drive.google.com/file/d/..."
                          className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-ea-dark focus:outline-none focus:border-ea-gold text-sm"
                          data-testid={`custom-expose-url-${idx}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}


        {/* Homepage Tab */}
        {activeTab === 'homepage' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Layout className="w-5 h-5 text-ea-gold" />
                  <h2 className="text-lg sm:text-xl font-bold text-ea-dark">Homepage-Inhalte bearbeiten</h2>
                </div>
                <button
                  onClick={handleSaveHomepage}
                  disabled={homepageSaving}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all disabled:opacity-50 w-full sm:w-auto"
                  data-testid="save-homepage-btn"
                >
                  <Save className="w-5 h-5" />
                  <span>{homepageSaving ? 'Speichern...' : 'Speichern'}</span>
                </button>
              </div>

              {/* Hero Section */}
              <h3 className="text-lg font-semibold text-ea-dark mb-4 border-b border-gray-200 pb-2">Hero-Bereich (Startbild)</h3>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-ea-dark font-semibold text-sm mb-1">Überschrift</label>
                  <input
                    type="text"
                    value={homepageContent.hero_title || ''}
                    onChange={(e) => setHomepageContent(p => ({ ...p, hero_title: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
                    data-testid="homepage-hero-title"
                  />
                </div>
                <div>
                  <label className="block text-ea-dark font-semibold text-sm mb-1">Untertitel</label>
                  <textarea
                    rows={3}
                    value={homepageContent.hero_subtitle || ''}
                    onChange={(e) => setHomepageContent(p => ({ ...p, hero_subtitle: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
                    data-testid="homepage-hero-subtitle"
                  />
                </div>
                <div>
                  <label className="block text-ea-dark font-semibold text-sm mb-1">Button-Text</label>
                  <input
                    type="text"
                    value={homepageContent.hero_cta_text || ''}
                    onChange={(e) => setHomepageContent(p => ({ ...p, hero_cta_text: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
                    data-testid="homepage-hero-cta"
                  />
                </div>
              </div>

              {/* Testimonial Section */}
              <h3 className="text-lg font-semibold text-ea-dark mb-4 border-b border-gray-200 pb-2">Kundenbewertung</h3>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-ea-dark font-semibold text-sm mb-1">Hintergrundbild-URL</label>
                  <input
                    type="url"
                    value={homepageContent.testimonial_image || ''}
                    onChange={(e) => setHomepageContent(p => ({ ...p, testimonial_image: e.target.value }))}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
                    data-testid="homepage-testimonial-image"
                  />
                  {homepageContent.testimonial_image && (
                    <div className="mt-2 space-y-3">
                      <div className="rounded-lg overflow-hidden h-32 bg-ea-light relative">
                        <img 
                          src={homepageContent.testimonial_image} 
                          alt="Vorschau" 
                          className="w-full h-full object-cover opacity-50"
                          style={{ objectPosition: `center ${homepageContent.testimonial_image_position ?? 50}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">Vorschau, Position: {homepageContent.testimonial_image_position ?? 50}%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-ea-dark font-semibold text-sm mb-1">Bildposition (vertikal verschieben)</label>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-ea-dark/50 w-10">Oben</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={homepageContent.testimonial_image_position ?? 50}
                            onChange={(e) => setHomepageContent(p => ({ ...p, testimonial_image_position: parseInt(e.target.value) }))}
                            className="flex-1 accent-[#C8A96A]"
                            data-testid="homepage-testimonial-position"
                          />
                          <span className="text-xs text-ea-dark/50 w-10 text-right">Unten</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-ea-dark font-semibold text-sm mb-1">Zitat</label>
                  <textarea
                    rows={3}
                    value={homepageContent.testimonial_quote || ''}
                    onChange={(e) => setHomepageContent(p => ({ ...p, testimonial_quote: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
                    data-testid="homepage-testimonial-quote"
                  />
                </div>
                <div>
                  <label className="block text-ea-dark font-semibold text-sm mb-1">Autor</label>
                  <input
                    type="text"
                    value={homepageContent.testimonial_author || ''}
                    onChange={(e) => setHomepageContent(p => ({ ...p, testimonial_author: e.target.value }))}
                    placeholder="z.B. Max Müller, Unternehmer aus Deutschland"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
                    data-testid="homepage-testimonial-author"
                  />
                </div>
              </div>

              {/* Stats Image Section (60-80%) */}
              <h3 className="text-lg font-semibold text-ea-dark mb-4 border-b border-gray-200 pb-2">Statistik-Bild (60-80% Sektion)</h3>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-ea-dark font-semibold text-sm mb-1">Bild-URL</label>
                  <input
                    type="url"
                    value={homepageContent.stats_image || ''}
                    onChange={(e) => setHomepageContent(p => ({ ...p, stats_image: e.target.value }))}
                    placeholder="https://images.unsplash.com/... oder imgBB-Link"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
                    data-testid="homepage-stats-image"
                  />
                  {homepageContent.stats_image && (
                    <div className="mt-2 space-y-3">
                      <div className="rounded-lg overflow-hidden h-32 bg-ea-light relative">
                        <img 
                          src={homepageContent.stats_image} 
                          alt="Vorschau Statistik-Bild" 
                          className="w-full h-full object-cover opacity-50"
                          style={{ objectPosition: `center ${homepageContent.stats_image_position ?? 50}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="bg-black/60 text-white text-xs px-3 py-1 rounded-full">Vorschau, Position: {homepageContent.stats_image_position ?? 50}%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-ea-dark font-semibold text-sm mb-1">Bildposition (vertikal verschieben)</label>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-ea-dark/50 w-10">Oben</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={homepageContent.stats_image_position ?? 50}
                            onChange={(e) => setHomepageContent(p => ({ ...p, stats_image_position: parseInt(e.target.value) }))}
                            className="flex-1 accent-[#C8A96A]"
                            data-testid="homepage-stats-position"
                          />
                          <span className="text-xs text-ea-dark/50 w-10 text-right">Unten</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* CTA Section */}
              <h3 className="text-lg font-semibold text-ea-dark mb-4 border-b border-gray-200 pb-2">Call-to-Action Bereich</h3>
              <div className="space-y-4 mb-8">
                <div>
                  <label className="block text-ea-dark font-semibold text-sm mb-1">Titel</label>
                  <input
                    type="text"
                    value={homepageContent.cta_title || ''}
                    onChange={(e) => setHomepageContent(p => ({ ...p, cta_title: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
                    data-testid="homepage-cta-title"
                  />
                </div>
                <div>
                  <label className="block text-ea-dark font-semibold text-sm mb-1">Untertitel</label>
                  <textarea
                    rows={2}
                    value={homepageContent.cta_subtitle || ''}
                    onChange={(e) => setHomepageContent(p => ({ ...p, cta_subtitle: e.target.value }))}
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
                    data-testid="homepage-cta-subtitle"
                  />
                </div>
              </div>

              {/* Trust Indicators */}
              <h3 className="text-lg font-semibold text-ea-dark mb-4 border-b border-gray-200 pb-2">Vertrauens-Badges</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {(homepageContent.trust_items || [{title:'',desc:''},{title:'',desc:''},{title:'',desc:''},{title:'',desc:''}]).map((item, idx) => (
                  <div key={idx} className="p-4 bg-ea-light rounded-xl">
                    <label className="block text-ea-dark font-semibold text-sm mb-1">Badge {idx + 1}, Titel</label>
                    <input
                      type="text"
                      value={item.title || ''}
                      onChange={(e) => {
                        const updated = [...(homepageContent.trust_items || [{title:'',desc:''},{title:'',desc:''},{title:'',desc:''},{title:'',desc:''}])];
                        updated[idx] = { ...updated[idx], title: e.target.value };
                        setHomepageContent(p => ({ ...p, trust_items: updated }));
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-ea-dark focus:outline-none focus:border-ea-gold text-sm mb-2"
                      data-testid={`homepage-trust-title-${idx}`}
                    />
                    <label className="block text-ea-dark font-semibold text-sm mb-1">Beschreibung</label>
                    <input
                      type="text"
                      value={item.desc || ''}
                      onChange={(e) => {
                        const updated = [...(homepageContent.trust_items || [{title:'',desc:''},{title:'',desc:''},{title:'',desc:''},{title:'',desc:''}])];
                        updated[idx] = { ...updated[idx], desc: e.target.value };
                        setHomepageContent(p => ({ ...p, trust_items: updated }));
                      }}
                      className="w-full bg-white border border-gray-200 rounded-lg px-4 py-2 text-ea-dark focus:outline-none focus:border-ea-gold text-sm"
                      data-testid={`homepage-trust-desc-${idx}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Investment Tab */}
        {activeTab === 'investment' && (
          <div className="space-y-6">
            {/* Location Editor */}
            {editingLocation !== null ? (
              <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-bold text-ea-dark">
                    {editingLocation ? `${editingLocation} bearbeiten` : 'Neuer Standort'}
                  </h2>
                  <button onClick={() => { setEditingLocation(null); }} className="text-ea-dark/50 hover:text-ea-dark">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-ea-dark/70 mb-1">Stadt</label>
                    <input type="text" value={locationFormData.city} onChange={e => setLocationFormData(p => ({...p, city: e.target.value}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-city" />
                  </div>
                  <div>
                    <label className="block text-sm text-ea-dark/70 mb-1">Land</label>
                    <select value={locationFormData.country} onChange={e => setLocationFormData(p => ({...p, country: e.target.value}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-country">
                      <option value="Montenegro">Montenegro</option>
                      <option value="Serbien">Serbien</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-ea-dark/70 mb-1">Region</label>
                    <input type="text" value={locationFormData.region} onChange={e => setLocationFormData(p => ({...p, region: e.target.value}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-region" />
                  </div>
                  <div>
                    <label className="block text-sm text-ea-dark/70 mb-1">Preis/m² (EUR)</label>
                    <input type="number" value={locationFormData.price_per_m2 || ''} onChange={e => setLocationFormData(p => ({...p, price_per_m2: parseFloat(e.target.value) || 0}))} onBlur={e => { if(!e.target.value) setLocationFormData(p => ({...p, price_per_m2: 0})); }} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-price" />
                  </div>
                  <div>
                    <label className="block text-sm text-ea-dark/70 mb-1">Mietrendite (%)</label>
                    <input type="number" step="0.1" value={locationFormData.rental_yield || ''} onChange={e => setLocationFormData(p => ({...p, rental_yield: parseFloat(e.target.value) || 0}))} onBlur={e => { if(!e.target.value) setLocationFormData(p => ({...p, rental_yield: 0})); }} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-yield" />
                  </div>
                  <div>
                    <label className="block text-sm text-ea-dark/70 mb-1">Preiswachstum (%/Jahr)</label>
                    <input type="number" step="0.1" value={locationFormData.price_growth || ''} onChange={e => setLocationFormData(p => ({...p, price_growth: parseFloat(e.target.value) || 0}))} onBlur={e => { if(!e.target.value) setLocationFormData(p => ({...p, price_growth: 0})); }} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-growth" />
                  </div>
                  <div>
                    <label className="block text-sm text-ea-dark/70 mb-1">Investment Score (0-100)</label>
                    <input type="number" value={locationFormData.investment_score || ''} onChange={e => setLocationFormData(p => ({...p, investment_score: parseFloat(e.target.value) || 0}))} onBlur={e => { if(!e.target.value) setLocationFormData(p => ({...p, investment_score: 0})); }} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-score" />
                  </div>
                  <div>
                    <label className="block text-sm text-ea-dark/70 mb-1">Bevölkerung</label>
                    <input type="number" value={locationFormData.population || ''} onChange={e => setLocationFormData(p => ({...p, population: parseInt(e.target.value) || 0}))} onBlur={e => { if(!e.target.value) setLocationFormData(p => ({...p, population: 0})); }} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-population" />
                  </div>
                  <div>
                    <label className="block text-sm text-ea-dark/70 mb-1">Breitengrad</label>
                    <input type="number" step="0.01" value={locationFormData.latitude || ''} onChange={e => setLocationFormData(p => ({...p, latitude: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" />
                  </div>
                  <div>
                    <label className="block text-sm text-ea-dark/70 mb-1">Längengrad</label>
                    <input type="number" step="0.01" value={locationFormData.longitude || ''} onChange={e => setLocationFormData(p => ({...p, longitude: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm text-ea-dark/70 mb-1">Beschreibung</label>
                  <textarea value={locationFormData.description} onChange={e => setLocationFormData(p => ({...p, description: e.target.value}))} rows={3} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-description" />
                </div>
                <div className="mt-4 flex gap-3">
                  <button onClick={handleSaveLocation} className="flex items-center gap-2 px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all" data-testid="save-location-btn">
                    <Save className="w-4 h-4" /> Speichern
                  </button>
                  <button onClick={() => setEditingLocation(null)} className="px-6 py-3 bg-gray-100 text-ea-dark rounded-lg hover:bg-gray-200 transition-all">
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-ea-gold" />
                    <h2 className="text-lg sm:text-xl font-bold text-ea-dark">Investment-Standorte</h2>
                  </div>
                  <button
                    onClick={() => { setEditingLocation(''); setLocationFormData({ city: '', country: 'Montenegro', region: '', latitude: 0, longitude: 0, population: 0, price_per_m2: 0, rental_yield: 0, price_growth: 0, investment_score: 0, description: '', highlights: [] }); }}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all w-full sm:w-auto"
                    data-testid="add-location-btn"
                  >
                    <Plus className="w-4 h-4" /> Neuer Standort
                  </button>
                </div>

                {investLoading ? (
                  <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-ea-gold" /></div>
                ) : (
                  <div className="grid gap-3">
                    {investLocations.sort((a, b) => (b.investment_score || 0) - (a.investment_score || 0)).map(loc => (
                      <div key={loc.city} className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 flex items-start sm:items-center justify-between gap-2" data-testid={`invest-loc-${loc.city.toLowerCase()}`}>
                        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0 ${loc.investment_score >= 80 ? 'bg-green-500' : loc.investment_score >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`}>
                            {Math.round(loc.investment_score)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="font-bold text-ea-dark text-sm sm:text-base truncate">{loc.city}</h3>
                              <span className="text-xs text-ea-dark/40 shrink-0">{loc.country}</span>
                            </div>
                            <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs sm:text-sm text-ea-dark/60 mt-0.5">
                              <span>{loc.price_per_m2?.toLocaleString('de-DE')} €/m²</span>
                              <span>{loc.rental_yield}% Rendite</span>
                              <span>+{loc.price_growth}%/Jahr</span>
                              {loc.population > 0 && <span>{loc.population?.toLocaleString('de-DE')} Einwohner</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleEditLocation(loc)} className="p-2 text-ea-dark/50 hover:text-ea-gold transition-all" data-testid={`edit-invest-${loc.city.toLowerCase()}`}>
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteLocation(loc.city)} className="p-2 text-ea-dark/50 hover:text-red-500 transition-all">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

        {/* Legal Tab */}
        {activeTab === 'legal' && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-ea-gold" />
                  <h2 className="text-lg sm:text-xl font-bold text-ea-dark">Rechtliche Seiten bearbeiten</h2>
                </div>
                <button
                  onClick={() => handleSaveLegal(activeLegalPage)}
                  disabled={legalSaving}
                  className="flex items-center justify-center space-x-2 px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all disabled:opacity-50 w-full sm:w-auto"
                  data-testid="save-legal-btn"
                >
                  <Save className="w-5 h-5" />
                  <span>{legalSaving ? 'Speichern...' : 'Speichern'}</span>
                </button>
              </div>

              {/* Sub-Tabs for Impressum / Datenschutz */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveLegalPage('impressum')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeLegalPage === 'impressum'
                      ? 'bg-ea-dark text-white'
                      : 'bg-gray-100 text-ea-dark/70 hover:bg-gray-200'
                  }`}
                  data-testid="legal-tab-impressum"
                >
                  Impressum
                </button>
                <button
                  onClick={() => setActiveLegalPage('datenschutz')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeLegalPage === 'datenschutz'
                      ? 'bg-ea-dark text-white'
                      : 'bg-gray-100 text-ea-dark/70 hover:bg-gray-200'
                  }`}
                  data-testid="legal-tab-datenschutz"
                >
                  Datenschutz
                </button>
              </div>

              {/* Editor */}
              {activeLegalPage === 'impressum' && (
                <div>
                  <label className="block text-ea-dark font-semibold text-sm mb-2">Impressum-Inhalt (HTML)</label>
                  <WYSIWYGEditor
                    key="impressum-editor"
                    value={impressumContent}
                    onChange={setImpressumContent}
                    placeholder="Impressum-Text hier eingeben..."
                  />
                </div>
              )}
              {activeLegalPage === 'datenschutz' && (
                <div>
                  <label className="block text-ea-dark font-semibold text-sm mb-2">Datenschutz-Inhalt (HTML)</label>
                  <WYSIWYGEditor
                    key="datenschutz-editor"
                    value={datenschutzContent}
                    onChange={setDatenschutzContent}
                    placeholder="Datenschutzerkl&auml;rung hier eingeben..."
                  />
                </div>
              )}

              <p className="text-ea-dark/40 text-xs mt-4">
                Tipp: Nutze die Toolbar f&uuml;r &Uuml;berschriften, Listen und Links. Der Inhalt wird als HTML gespeichert und auf der &ouml;ffentlichen Seite angezeigt.
              </p>
            </div>
          </div>
        )}

        {/* Newsletter Tab */}
        {activeTab === 'newsletter' && (
          <NewsletterAdmin credentials={credentials} />
        )}

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
            {formData.image && (
              <div className="mt-2 space-y-2">
                <div className="rounded-lg overflow-hidden h-32 relative">
                  <img 
                    src={formData.image} 
                    alt="Vorschau" 
                    className="w-full h-full object-cover"
                    style={{ objectPosition: `center ${formData.imagePosition ?? 50}%` }}
                  />
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    Position: {formData.imagePosition ?? 50}%
                  </div>
                </div>
                <div>
                  <label className="block text-ea-dark/80 text-xs mb-1">Bildposition (vertikal)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-ea-dark/40">Oben</span>
                    <input type="range" min="0" max="100" value={formData.imagePosition ?? 50}
                      onChange={(e) => handleChange('imagePosition', parseInt(e.target.value))}
                      className="flex-1 accent-[#C8A96A]" />
                    <span className="text-xs text-ea-dark/40">Unten</span>
                  </div>
                </div>
              </div>
            )}
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
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Sortierung</label>
            <input
              type="number"
              value={formData.sortOrder ?? ''}
              onChange={(e) => handleChange('sortOrder', e.target.value === '' ? '' : parseInt(e.target.value))}
              onBlur={(e) => { if (e.target.value === '') handleChange('sortOrder', 0); }}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
              data-testid="article-sort-order"
              min="0"
            />
            <p className="text-xs text-ea-dark/50 mt-1">0 = ganz oben, höhere Zahl = weiter unten</p>
          </div>
        </div>
      </div>

      {/* Download URL / Exposé */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
        <h3 className="text-xl font-bold text-ea-gold flex items-center">
          Download / Exposé
          <Tooltip text="Externer Link zu einem PDF-Exposé (z.B. Google Drive, Dropbox). Wird als Download-Button im Artikel angezeigt." />
        </h3>
        <div>
          <label className="block text-ea-dark/80 text-sm mb-2">Download URL</label>
          <input
            type="url"
            value={formData.downloadUrl || ''}
            onChange={(e) => handleChange('downloadUrl', e.target.value)}
            placeholder="https://drive.google.com/file/d/... oder https://dropbox.com/..."
            className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            data-testid="article-download-url-input"
          />
          <p className="text-xs text-ea-dark/50 mt-1">Leer lassen, wenn kein Download verfügbar ist.</p>
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
        
        {/* Background Image */}
        <div>
          <label className="block text-ea-dark/80 text-sm mb-2">Hintergrundbild</label>
          <ImageUploader
            currentImage={data.backgroundImage}
            onImageUploaded={(url) => onDataChange('backgroundImage', url)}
            credentials={credentials}
            label="Hero-Hintergrund"
          />
          {data.backgroundImage && (
            <div className="mt-2 space-y-3">
              <div className="relative rounded-lg overflow-hidden h-32">
                <img 
                  src={data.backgroundImage} 
                  alt="Hero Background" 
                  className="w-full h-full object-cover"
                  style={{ objectPosition: `center ${data.backgroundImagePosition ?? 50}%` }}
                />
                <button
                  type="button"
                  onClick={() => onDataChange('backgroundImage', '')}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">Position: {data.backgroundImagePosition ?? 50}%</div>
              </div>
              <div>
                <label className="block text-ea-dark/80 text-sm mb-1">Bildposition (vertikal)</label>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-ea-dark/50 w-10">Oben</span>
                  <input type="range" min="0" max="100" value={data.backgroundImagePosition ?? 50}
                    onChange={(e) => onDataChange('backgroundImagePosition', parseInt(e.target.value))}
                    className="flex-1 accent-[#C8A96A]" />
                  <span className="text-xs text-ea-dark/50 w-10 text-right">Unten</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Overlay Opacity */}
        <div>
          <label className="block text-ea-dark/80 text-sm mb-2">Overlay-Stärke: {data.overlayOpacity || 60}%</label>
          <input
            type="range"
            min="0"
            max="100"
            value={data.overlayOpacity || 60}
            onChange={(e) => onDataChange('overlayOpacity', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

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
        
        {/* Tagline */}
        <div>
          <label className="block text-ea-dark/80 text-sm mb-2">Tagline (über dem Titel)</label>
          <input
            type="text"
            value={data.tagline || ''}
            onChange={(e) => onDataChange('tagline', e.target.value)}
            className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
            placeholder="z.B. EuroAdria Corporate Solutions"
          />
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
        
        {/* Secondary CTA */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Zweiter Button Text (optional)</label>
            <input
              type="text"
              value={data.secondaryCtaText || ''}
              onChange={(e) => onDataChange('secondaryCtaText', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
              placeholder="z.B. Mehr erfahren"
            />
          </div>
          <div>
            <label className="block text-ea-dark/80 text-sm mb-2">Zweiter Button Link</label>
            <input
              type="text"
              value={data.secondaryCtaLink || ''}
              onChange={(e) => onDataChange('secondaryCtaLink', e.target.value)}
              className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold"
              placeholder="/investment"
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
