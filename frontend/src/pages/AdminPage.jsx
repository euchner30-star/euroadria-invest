import React, { useState, useEffect } from 'react';
import { adminApi, articlesApi, commentsApi, regionsApi, pagesApi, settingsApi, investmentApi } from '../services/api';
import { 
  LogIn, LogOut, Plus, Edit2, Trash2, Save, X, 
  FileText, Loader2, AlertCircle, Check, MessageSquare,
  CheckCircle, XCircle, Clock, Mail, User, HelpCircle, MapPin, Building2, Image as ImageIcon,
  Layout, Users, Home, Phone, Globe, Download, TrendingUp, BarChart3, Shield, Send, Eye, Upload, Calendar
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
  const [agbContent, setAgbContent] = useState('');
  const [legalSaving, setLegalSaving] = useState(false);
  const [activeLegalPage, setActiveLegalPage] = useState('impressum');

  // Articles State
  const [articles, setArticles] = useState([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [editingArticle, setEditingArticle] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showBulkImport, setShowBulkImport] = useState(false);
  const [bulkImportFile, setBulkImportFile] = useState(null);
  const [bulkImporting, setBulkImporting] = useState(false);
  const [bulkImportResult, setBulkImportResult] = useState(null);
  
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
  const [investSubTab, setInvestSubTab] = useState('locations');
  const [investLocations, setInvestLocations] = useState([]);
  const [investLoading, setInvestLoading] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [locationFormData, setLocationFormData] = useState({
    city: '', country: 'Montenegro', latitude: 0, longitude: 0,
    price_per_m2: 0, rental_yield: 0, tourism_growth: 0, population_growth: 0,
    price_growth: 0, infrastructure_score: 0, description: '',
    opportunities: [], risks: [], use_cases: [], time_horizon: 'medium'
  });

  // Infrastructure State
  const [infraProjects, setInfraProjects] = useState([]);
  const [infraLoading, setInfraLoading] = useState(false);
  const [editingInfra, setEditingInfra] = useState(null);
  const [infraFormData, setInfraFormData] = useState({
    project_name: '', type: 'road', latitude: 0, longitude: 0,
    impact_radius_km: 10, status: 'planned', description: '',
    completion_year: 2026, investment_eur: 0
  });

  // Zones State
  const [zones, setZones] = useState([]);
  const [zonesLoading, setZonesLoading] = useState(false);
  const [editingZone, setEditingZone] = useState(null);
  const [zoneFormData, setZoneFormData] = useState({
    name: '', country: 'Montenegro', description: '',
    center_lat: 0, center_lng: 0, radius_km: 10,
    color: '#c8a96a', investment_focus: [], expected_growth: 0
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
        fetchInfraProjects();
        fetchZones();
        fetchHomepageContent();
        fetchLegalContent('impressum');
        fetchLegalContent('datenschutz');
        fetchLegalContent('agb');
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
        fetchInfraProjects();
        fetchZones();
        fetchHomepageContent();
        fetchLegalContent('impressum');
        fetchLegalContent('datenschutz');
        fetchLegalContent('agb');
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
      { title: 'Vertrauenswürdig', desc: 'Referenziert in n-tv, RTL, Focus & mehr' },
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
        else if (pageType === 'datenschutz') setDatenschutzContent(data.content || '');
        else if (pageType === 'agb') setAgbContent(data.content || '');
      }
    } catch (err) {
      console.error(`Failed to fetch ${pageType}:`, err);
    }
  };

  const handleSaveLegal = async (pageType) => {
    setLegalSaving(true);
    const content = pageType === 'impressum' ? impressumContent : pageType === 'datenschutz' ? datenschutzContent : agbContent;
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/settings/legal/${pageType}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) },
        body: JSON.stringify({ content })
      });
      if (res.ok) {
        const labels = { impressum: 'Impressum', datenschutz: 'Datenschutz', agb: 'AGB' };
        setSaveStatus({ type: 'success', message: `${labels[pageType]} gespeichert!` });
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

  const defaultLocationForm = {
    city: '', country: 'Montenegro', latitude: 0, longitude: 0,
    price_per_m2: 0, rental_yield: 0, tourism_growth: 0, population_growth: 0,
    price_growth: 0, infrastructure_score: 0, description: '',
    opportunities: [], risks: [], use_cases: [], time_horizon: 'medium'
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
      setLocationFormData({...defaultLocationForm});
      setSaveStatus({ type: 'success', message: 'Standort gespeichert!' });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
    }
  };

  const handleEditLocation = (loc) => {
    setEditingLocation(loc.city);
    setLocationFormData({
      city: loc.city, country: loc.country || 'Montenegro',
      latitude: loc.latitude || 0, longitude: loc.longitude || 0,
      price_per_m2: loc.price_per_m2 || 0, rental_yield: loc.rental_yield || 0,
      tourism_growth: loc.tourism_growth || 0, population_growth: loc.population_growth || 0,
      price_growth: loc.price_growth || 0, infrastructure_score: loc.infrastructure_score || 0,
      description: loc.description || '',
      opportunities: loc.opportunities || [], risks: loc.risks || [],
      use_cases: loc.use_cases || [], time_horizon: loc.time_horizon || 'medium'
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

  // Infrastructure Functions
  const fetchInfraProjects = async () => {
    setInfraLoading(true);
    try {
      const data = await investmentApi.getInfrastructure();
      setInfraProjects(data);
    } catch (err) {
      console.error('Failed to fetch infrastructure:', err);
    } finally {
      setInfraLoading(false);
    }
  };

  const defaultInfraForm = {
    project_name: '', type: 'road', latitude: 0, longitude: 0,
    impact_radius_km: 10, status: 'planned', description: '',
    completion_year: 2026, investment_eur: 0
  };

  const handleSaveInfra = async () => {
    try {
      if (editingInfra) {
        await investmentApi.updateInfrastructure(editingInfra, infraFormData, credentials);
      } else {
        await investmentApi.createInfrastructure(infraFormData, credentials);
      }
      fetchInfraProjects();
      setEditingInfra(null);
      setInfraFormData({...defaultInfraForm});
      setSaveStatus({ type: 'success', message: 'Projekt gespeichert!' });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
    }
  };

  const handleEditInfra = (proj) => {
    setEditingInfra(proj.id);
    setInfraFormData({
      project_name: proj.project_name || '', type: proj.type || 'road',
      latitude: proj.latitude || 0, longitude: proj.longitude || 0,
      impact_radius_km: proj.impact_radius_km || 10, status: proj.status || 'planned',
      description: proj.description || '', completion_year: proj.completion_year || 2026,
      investment_eur: proj.investment_eur || 0
    });
  };

  const handleDeleteInfra = async (id, name) => {
    if (!window.confirm(`Projekt "${name}" wirklich löschen?`)) return;
    try {
      await investmentApi.deleteInfrastructure(id, credentials);
      fetchInfraProjects();
      setSaveStatus({ type: 'success', message: 'Projekt gelöscht!' });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
    }
  };

  // Zones Functions
  const fetchZones = async () => {
    setZonesLoading(true);
    try {
      const data = await investmentApi.getZones();
      setZones(data);
    } catch (err) {
      console.error('Failed to fetch zones:', err);
    } finally {
      setZonesLoading(false);
    }
  };

  const defaultZoneForm = {
    name: '', country: 'Montenegro', description: '',
    center_lat: 0, center_lng: 0, radius_km: 10,
    color: '#c8a96a', investment_focus: [], expected_growth: 0
  };

  const handleSaveZone = async () => {
    try {
      if (editingZone) {
        await investmentApi.updateZone(editingZone, zoneFormData, credentials);
      } else {
        await investmentApi.createZone(zoneFormData, credentials);
      }
      fetchZones();
      setEditingZone(null);
      setZoneFormData({...defaultZoneForm});
      setSaveStatus({ type: 'success', message: 'Zone gespeichert!' });
      setTimeout(() => setSaveStatus({ type: '', message: '' }), 3000);
    } catch (err) {
      setSaveStatus({ type: 'error', message: err.message });
    }
  };

  const handleEditZone = (zone) => {
    setEditingZone(zone.id);
    setZoneFormData({
      name: zone.name || '', country: zone.country || 'Montenegro',
      description: zone.description || '',
      center_lat: zone.center_lat || 0, center_lng: zone.center_lng || 0,
      radius_km: zone.radius_km || 10, color: zone.color || '#c8a96a',
      investment_focus: zone.investment_focus || [], expected_growth: zone.expected_growth || 0
    });
  };

  const handleDeleteZone = async (id, name) => {
    if (!window.confirm(`Zone "${name}" wirklich löschen?`)) return;
    try {
      await investmentApi.deleteZone(id, credentials);
      fetchZones();
      setSaveStatus({ type: 'success', message: 'Zone gelöscht!' });
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

  const handleBulkImport = async () => {
    if (!bulkImportFile) return;
    setBulkImporting(true);
    setBulkImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', bulkImportFile);
      const API_URL = process.env.REACT_APP_BACKEND_URL;
      const response = await fetch(`${API_URL}/api/admin/articles/bulk-import`, {
        method: 'POST',
        headers: {
          'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
        },
        body: formData
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Import fehlgeschlagen');
      setBulkImportResult({ type: 'success', message: data.message, articles: data.articles, skipped: data.skipped || [], skipped_count: data.skipped_count || 0 });
      fetchArticles(credentials);
      setBulkImportFile(null);
    } catch (err) {
      setBulkImportResult({ type: 'error', message: err.message });
    } finally {
      setBulkImporting(false);
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBulkImport(true)}
                  className="px-4 sm:px-5 py-2 sm:py-3 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-dark/80 transition-all flex items-center space-x-2 text-sm sm:text-base"
                  data-testid="bulk-import-button"
                >
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Bulk Import</span>
                </button>
                <button
                  onClick={() => setIsCreating(true)}
                  className="px-4 sm:px-6 py-2 sm:py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all flex items-center space-x-2 text-sm sm:text-base"
                  data-testid="create-article-button"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Neuer Artikel</span>
                </button>
              </div>
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
            <span>Investment ({investLocations.length + infraProjects.length + zones.length})</span>
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
          <button
            onClick={() => setActiveTab('events')}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base shrink-0 ${
              activeTab === 'events'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-events"
          >
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Events</span>
          </button>
          <button
            onClick={() => setActiveTab('leistungen')}
            className={`flex items-center space-x-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all whitespace-nowrap text-sm sm:text-base shrink-0 ${
              activeTab === 'leistungen'
                ? 'bg-ea-gold text-ea-dark font-semibold'
                : 'bg-white border border-gray-200 rounded-xl shadow-sm text-ea-dark/70 hover:text-ea-dark'
            }`}
            data-testid="tab-leistungen"
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>Leistungen</span>
          </button>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <AnalyticsDashboard credentials={credentials} />
        )}

        {/* Bulk Import Modal */}
        {showBulkImport && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="bulk-import-modal">
            <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Upload className="w-6 h-6 text-ea-gold" />
                  <h2 className="text-xl font-bold text-ea-dark">Artikel Bulk Import</h2>
                </div>
                <button onClick={() => { setShowBulkImport(false); setBulkImportResult(null); setBulkImportFile(null); }} className="p-2 hover:bg-gray-100 rounded-lg">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-ea-light/50 border border-ea-gold/20 rounded-xl p-4">
                  <p className="text-sm font-semibold text-ea-dark mb-2">Unterstützte Formate:</p>
                  <ul className="text-sm text-ea-dark/70 space-y-1">
                    <li><strong>Excel (.xlsx)</strong> — Eine Zeile pro Artikel</li>
                    <li><strong>CSV (.csv)</strong> — Semikolon oder Komma getrennt</li>
                    <li><strong>Word (.docx)</strong> — Überschrift 1 = neuer Artikel</li>
                  </ul>
                  <p className="text-sm font-semibold text-ea-dark mt-3 mb-1">Erwartete Spalten (Excel/CSV):</p>
                  <p className="text-xs text-ea-dark/60 font-mono">Titel | Kategorie | Excerpt | Content | Bild | Autor | Lesezeit | Download-URL</p>
                  <p className="text-xs text-ea-dark/50 mt-1">Nur "Titel" ist Pflicht. Rest wird automatisch gefüllt.</p>
                  <p className="text-sm font-semibold text-ea-dark mt-3 mb-1">Word-Format:</p>
                  <p className="text-xs text-ea-dark/60">Jede <strong>Überschrift 1</strong> startet einen neuen Artikel. Optional: <strong>[Kategorie] Titel</strong> für Zuordnung.</p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-ea-gold transition-colors">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.docx"
                    onChange={(e) => { setBulkImportFile(e.target.files[0]); setBulkImportResult(null); }}
                    className="hidden"
                    id="bulk-import-file"
                    data-testid="bulk-import-file-input"
                  />
                  <label htmlFor="bulk-import-file" className="cursor-pointer">
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    {bulkImportFile ? (
                      <p className="text-ea-dark font-medium">{bulkImportFile.name}</p>
                    ) : (
                      <p className="text-gray-500">Datei auswählen (.xlsx, .csv, .docx)</p>
                    )}
                  </label>
                </div>

                {bulkImportResult && (
                  <div className={`p-4 rounded-xl ${bulkImportResult.type === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2 mb-2">
                      {bulkImportResult.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      )}
                      <p className={`font-semibold ${bulkImportResult.type === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                        {bulkImportResult.message}
                      </p>
                    </div>
                    {bulkImportResult.articles?.length > 0 && (
                      <div className="mt-2 max-h-32 overflow-y-auto">
                        <p className="text-xs font-semibold text-green-700 mb-1">Importiert:</p>
                        {bulkImportResult.articles.map((a, i) => (
                          <p key={i} className="text-xs text-green-700 py-0.5">
                            {a.title} <span className="text-green-500">({a.category})</span>
                          </p>
                        ))}
                      </div>
                    )}
                    {bulkImportResult.skipped?.length > 0 && (
                      <div className="mt-3 max-h-32 overflow-y-auto border-t border-yellow-200 pt-2">
                        <p className="text-xs font-semibold text-yellow-700 mb-1">Übersprungen ({bulkImportResult.skipped_count} Duplikate):</p>
                        {bulkImportResult.skipped.map((s, i) => (
                          <p key={i} className="text-xs text-yellow-700 py-0.5">
                            {s.title} <span className="text-yellow-500">— {s.reason}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleBulkImport}
                  disabled={!bulkImportFile || bulkImporting}
                  className="w-full py-3 bg-ea-gold text-ea-dark font-bold rounded-xl hover:bg-ea-gold/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                  data-testid="bulk-import-submit"
                >
                  {bulkImporting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Importiere...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-5 h-5" />
                      <span>Artikel importieren</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
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
            {/* Sub-tab navigation */}
            <div className="flex gap-2 border-b border-gray-200 pb-3">
              {[
                { key: 'locations', label: 'Standorte', icon: MapPin, count: investLocations.length },
                { key: 'infrastructure', label: 'Infrastruktur', icon: Building2, count: infraProjects.length },
                { key: 'zones', label: 'Zonen', icon: Globe, count: zones.length }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setInvestSubTab(tab.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    investSubTab === tab.key
                      ? 'bg-ea-gold text-ea-dark'
                      : 'text-ea-dark/60 hover:text-ea-dark hover:bg-gray-100'
                  }`}
                  data-testid={`invest-subtab-${tab.key}`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  <span className="text-xs opacity-70">({tab.count})</span>
                </button>
              ))}
            </div>

            {/* Status Message */}
            {saveStatus.message && (
              <div className={`p-3 rounded-lg text-sm font-medium ${saveStatus.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {saveStatus.message}
              </div>
            )}

            {/* ===== LOCATIONS SUB-TAB ===== */}
            {investSubTab === 'locations' && (
              <>
                {editingLocation !== null ? (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-bold text-ea-dark">
                        {editingLocation ? `${editingLocation} bearbeiten` : 'Neuer Standort'}
                      </h2>
                      <button onClick={() => setEditingLocation(null)} className="text-ea-dark/50 hover:text-ea-dark"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Stadt *</label>
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
                        <label className="block text-sm text-ea-dark/70 mb-1">Preis/m² (EUR)</label>
                        <input type="number" value={locationFormData.price_per_m2 || ''} onChange={e => setLocationFormData(p => ({...p, price_per_m2: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-price" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Mietrendite (%)</label>
                        <input type="number" step="0.1" value={locationFormData.rental_yield || ''} onChange={e => setLocationFormData(p => ({...p, rental_yield: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-yield" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Tourismus-Wachstum (%)</label>
                        <input type="number" step="0.1" value={locationFormData.tourism_growth || ''} onChange={e => setLocationFormData(p => ({...p, tourism_growth: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-tourism" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Bevölkerungswachstum (%)</label>
                        <input type="number" step="0.1" value={locationFormData.population_growth || ''} onChange={e => setLocationFormData(p => ({...p, population_growth: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-popgrowth" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Preiswachstum (%/Jahr)</label>
                        <input type="number" step="0.1" value={locationFormData.price_growth || ''} onChange={e => setLocationFormData(p => ({...p, price_growth: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-growth" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Infrastruktur-Score (0-100)</label>
                        <input type="number" value={locationFormData.infrastructure_score || ''} onChange={e => setLocationFormData(p => ({...p, infrastructure_score: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-infrascore" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Zeithorizont</label>
                        <select value={locationFormData.time_horizon} onChange={e => setLocationFormData(p => ({...p, time_horizon: e.target.value}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-horizon">
                          <option value="short">Kurzfristig</option>
                          <option value="medium">Mittelfristig</option>
                          <option value="long">Langfristig</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Breitengrad</label>
                        <input type="number" step="0.0001" value={locationFormData.latitude || ''} onChange={e => setLocationFormData(p => ({...p, latitude: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-lat" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Längengrad</label>
                        <input type="number" step="0.0001" value={locationFormData.longitude || ''} onChange={e => setLocationFormData(p => ({...p, longitude: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-lng" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm text-ea-dark/70 mb-1">Beschreibung</label>
                      <textarea value={locationFormData.description} onChange={e => setLocationFormData(p => ({...p, description: e.target.value}))} rows={3} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-description" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Chancen (kommagetrennt)</label>
                        <input type="text" value={(locationFormData.opportunities || []).join(', ')} onChange={e => setLocationFormData(p => ({...p, opportunities: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}))} placeholder="Flughafen, Tourismus, Hafen" className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-opportunities" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Risiken (kommagetrennt)</label>
                        <input type="text" value={(locationFormData.risks || []).join(', ')} onChange={e => setLocationFormData(p => ({...p, risks: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}))} placeholder="Hohe Preise, Saisonalität" className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="loc-risks" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm text-ea-dark/70 mb-1">Nutzungsarten</label>
                      <div className="flex flex-wrap gap-2">
                        {['tourism', 'residential', 'logistics', 'relocation'].map(uc => (
                          <button key={uc} type="button"
                            onClick={() => setLocationFormData(p => ({
                              ...p, use_cases: p.use_cases.includes(uc) ? p.use_cases.filter(u => u !== uc) : [...p.use_cases, uc]
                            }))}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                              locationFormData.use_cases.includes(uc) ? 'bg-ea-gold text-ea-dark' : 'bg-gray-100 text-ea-dark/60 hover:bg-gray-200'
                            }`}
                            data-testid={`loc-usecase-${uc}`}
                          >
                            {uc === 'tourism' ? 'Tourismus' : uc === 'residential' ? 'Wohnen' : uc === 'logistics' ? 'Logistik' : 'Umzug'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button onClick={handleSaveLocation} className="flex items-center gap-2 px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all" data-testid="save-location-btn">
                        <Save className="w-4 h-4" /> Speichern
                      </button>
                      <button onClick={() => setEditingLocation(null)} className="px-6 py-3 bg-gray-100 text-ea-dark rounded-lg hover:bg-gray-200 transition-all">Abbrechen</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h2 className="text-lg font-bold text-ea-dark">Investment-Standorte</h2>
                      <button
                        onClick={() => { setEditingLocation(''); setLocationFormData({...defaultLocationForm}); }}
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
                          <div key={loc.id || loc.city} className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 flex items-start sm:items-center justify-between gap-2" data-testid={`invest-loc-${loc.city.toLowerCase()}`}>
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm shrink-0 ${loc.investment_score >= 80 ? 'bg-green-500' : loc.investment_score >= 60 ? 'bg-yellow-500' : 'bg-orange-500'}`}>
                                {Math.round(loc.investment_score || 0)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h3 className="font-bold text-ea-dark text-sm sm:text-base truncate">{loc.city}</h3>
                                  <span className="text-xs text-ea-dark/40 shrink-0">{loc.country}</span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded ${loc.time_horizon === 'short' ? 'bg-green-100 text-green-700' : loc.time_horizon === 'long' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {loc.time_horizon === 'short' ? 'Kurzfristig' : loc.time_horizon === 'long' ? 'Langfristig' : 'Mittelfristig'}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs sm:text-sm text-ea-dark/60 mt-0.5">
                                  <span>{loc.price_per_m2?.toLocaleString('de-DE')} EUR/m²</span>
                                  <span>{loc.rental_yield}% Rendite</span>
                                  <span>+{loc.price_growth}%/Jahr</span>
                                  <span>Infra: {loc.infrastructure_score}/100</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleEditLocation(loc)} className="p-2 text-ea-dark/50 hover:text-ea-gold transition-all" data-testid={`edit-invest-${loc.city.toLowerCase()}`}>
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteLocation(loc.city)} className="p-2 text-ea-dark/50 hover:text-red-500 transition-all" data-testid={`delete-invest-${loc.city.toLowerCase()}`}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {investLocations.length === 0 && !investLoading && (
                          <p className="text-center text-ea-dark/50 py-8">Keine Standorte vorhanden.</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ===== INFRASTRUCTURE SUB-TAB ===== */}
            {investSubTab === 'infrastructure' && (
              <>
                {editingInfra !== null ? (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-bold text-ea-dark">
                        {editingInfra ? 'Projekt bearbeiten' : 'Neues Infrastrukturprojekt'}
                      </h2>
                      <button onClick={() => setEditingInfra(null)} className="text-ea-dark/50 hover:text-ea-dark"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-ea-dark/70 mb-1">Projektname *</label>
                        <input type="text" value={infraFormData.project_name} onChange={e => setInfraFormData(p => ({...p, project_name: e.target.value}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="infra-name" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Typ</label>
                        <select value={infraFormData.type} onChange={e => setInfraFormData(p => ({...p, type: e.target.value}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="infra-type">
                          <option value="road">Straße</option>
                          <option value="rail">Bahn</option>
                          <option value="airport">Flughafen</option>
                          <option value="port">Hafen</option>
                          <option value="clinic">Klinik</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Status</label>
                        <select value={infraFormData.status} onChange={e => setInfraFormData(p => ({...p, status: e.target.value}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="infra-status">
                          <option value="planned">Geplant</option>
                          <option value="construction">Im Bau</option>
                          <option value="modernization">Modernisierung</option>
                          <option value="built">Fertiggestellt</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Fertigstellung (Jahr)</label>
                        <input type="number" value={infraFormData.completion_year || ''} onChange={e => setInfraFormData(p => ({...p, completion_year: parseInt(e.target.value) || null}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="infra-year" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Investition (EUR)</label>
                        <input type="number" value={infraFormData.investment_eur || ''} onChange={e => setInfraFormData(p => ({...p, investment_eur: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="infra-invest" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Wirkungsradius (km)</label>
                        <input type="number" step="0.1" value={infraFormData.impact_radius_km || ''} onChange={e => setInfraFormData(p => ({...p, impact_radius_km: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="infra-radius" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Breitengrad</label>
                        <input type="number" step="0.0001" value={infraFormData.latitude || ''} onChange={e => setInfraFormData(p => ({...p, latitude: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="infra-lat" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Längengrad</label>
                        <input type="number" step="0.0001" value={infraFormData.longitude || ''} onChange={e => setInfraFormData(p => ({...p, longitude: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="infra-lng" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm text-ea-dark/70 mb-1">Beschreibung</label>
                      <textarea value={infraFormData.description} onChange={e => setInfraFormData(p => ({...p, description: e.target.value}))} rows={3} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="infra-description" />
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button onClick={handleSaveInfra} className="flex items-center gap-2 px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all" data-testid="save-infra-btn">
                        <Save className="w-4 h-4" /> Speichern
                      </button>
                      <button onClick={() => setEditingInfra(null)} className="px-6 py-3 bg-gray-100 text-ea-dark rounded-lg hover:bg-gray-200 transition-all">Abbrechen</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h2 className="text-lg font-bold text-ea-dark">Infrastrukturprojekte</h2>
                      <button
                        onClick={() => { setEditingInfra(''); setInfraFormData({...defaultInfraForm}); }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all w-full sm:w-auto"
                        data-testid="add-infra-btn"
                      >
                        <Plus className="w-4 h-4" /> Neues Projekt
                      </button>
                    </div>
                    {infraLoading ? (
                      <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-ea-gold" /></div>
                    ) : (
                      <div className="grid gap-3">
                        {infraProjects.map(proj => {
                          const typeLabels = { road: 'Straße', rail: 'Bahn', airport: 'Flughafen', port: 'Hafen', clinic: 'Klinik' };
                          const statusLabels = { planned: 'Geplant', construction: 'Im Bau', modernization: 'Modernisierung', built: 'Fertig' };
                          const statusColors = { planned: 'bg-blue-100 text-blue-700', construction: 'bg-yellow-100 text-yellow-700', modernization: 'bg-purple-100 text-purple-700', built: 'bg-green-100 text-green-700' };
                          return (
                            <div key={proj.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 flex items-start sm:items-center justify-between gap-2" data-testid={`infra-project-${proj.id}`}>
                              <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-ea-dark/10 flex items-center justify-center shrink-0">
                                  <Building2 className="w-5 h-5 text-ea-dark/60" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3 className="font-bold text-ea-dark text-sm sm:text-base truncate">{proj.project_name}</h3>
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-ea-dark/60">{typeLabels[proj.type] || proj.type}</span>
                                    <span className={`text-xs px-1.5 py-0.5 rounded ${statusColors[proj.status] || 'bg-gray-100 text-gray-700'}`}>{statusLabels[proj.status] || proj.status}</span>
                                  </div>
                                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs sm:text-sm text-ea-dark/60 mt-0.5">
                                    {proj.investment_eur > 0 && <span>{(proj.investment_eur / 1000000).toFixed(0)} Mio. EUR</span>}
                                    {proj.completion_year && <span>Fertig: {proj.completion_year}</span>}
                                    <span>Radius: {proj.impact_radius_km} km</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={() => handleEditInfra(proj)} className="p-2 text-ea-dark/50 hover:text-ea-gold transition-all" data-testid={`edit-infra-${proj.id}`}>
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteInfra(proj.id, proj.project_name)} className="p-2 text-ea-dark/50 hover:text-red-500 transition-all" data-testid={`delete-infra-${proj.id}`}>
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                        {infraProjects.length === 0 && !infraLoading && (
                          <p className="text-center text-ea-dark/50 py-8">Keine Infrastrukturprojekte vorhanden.</p>
                        )}
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ===== ZONES SUB-TAB ===== */}
            {investSubTab === 'zones' && (
              <>
                {editingZone !== null ? (
                  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h2 className="text-lg sm:text-xl font-bold text-ea-dark">
                        {editingZone ? 'Zone bearbeiten' : 'Neue Investitionszone'}
                      </h2>
                      <button onClick={() => setEditingZone(null)} className="text-ea-dark/50 hover:text-ea-dark"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      <div className="sm:col-span-2">
                        <label className="block text-sm text-ea-dark/70 mb-1">Name *</label>
                        <input type="text" value={zoneFormData.name} onChange={e => setZoneFormData(p => ({...p, name: e.target.value}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="zone-name" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Land</label>
                        <select value={zoneFormData.country} onChange={e => setZoneFormData(p => ({...p, country: e.target.value}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="zone-country">
                          <option value="Montenegro">Montenegro</option>
                          <option value="Serbien">Serbien</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Farbe</label>
                        <div className="flex items-center gap-2">
                          <input type="color" value={zoneFormData.color} onChange={e => setZoneFormData(p => ({...p, color: e.target.value}))} className="w-10 h-10 rounded border border-gray-200 cursor-pointer" data-testid="zone-color" />
                          <input type="text" value={zoneFormData.color} onChange={e => setZoneFormData(p => ({...p, color: e.target.value}))} className="flex-1 bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold text-sm" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Erwartetes Wachstum (%)</label>
                        <input type="number" step="0.1" value={zoneFormData.expected_growth || ''} onChange={e => setZoneFormData(p => ({...p, expected_growth: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="zone-growth" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Radius (km)</label>
                        <input type="number" step="0.1" value={zoneFormData.radius_km || ''} onChange={e => setZoneFormData(p => ({...p, radius_km: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="zone-radius" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Zentrum Breitengrad</label>
                        <input type="number" step="0.0001" value={zoneFormData.center_lat || ''} onChange={e => setZoneFormData(p => ({...p, center_lat: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="zone-lat" />
                      </div>
                      <div>
                        <label className="block text-sm text-ea-dark/70 mb-1">Zentrum Längengrad</label>
                        <input type="number" step="0.0001" value={zoneFormData.center_lng || ''} onChange={e => setZoneFormData(p => ({...p, center_lng: parseFloat(e.target.value) || 0}))} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="zone-lng" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm text-ea-dark/70 mb-1">Beschreibung</label>
                      <textarea value={zoneFormData.description} onChange={e => setZoneFormData(p => ({...p, description: e.target.value}))} rows={3} className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="zone-description" />
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm text-ea-dark/70 mb-1">Investitionsfokus (kommagetrennt)</label>
                      <input type="text" value={(zoneFormData.investment_focus || []).join(', ')} onChange={e => setZoneFormData(p => ({...p, investment_focus: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}))} placeholder="Tourismus, Logistik, Luxus" className="w-full bg-ea-light border border-gray-200 rounded-lg px-3 py-2 text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="zone-focus" />
                    </div>
                    <div className="mt-4 flex gap-3">
                      <button onClick={handleSaveZone} className="flex items-center gap-2 px-6 py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all" data-testid="save-zone-btn">
                        <Save className="w-4 h-4" /> Speichern
                      </button>
                      <button onClick={() => setEditingZone(null)} className="px-6 py-3 bg-gray-100 text-ea-dark rounded-lg hover:bg-gray-200 transition-all">Abbrechen</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <h2 className="text-lg font-bold text-ea-dark">Investitionszonen</h2>
                      <button
                        onClick={() => { setEditingZone(''); setZoneFormData({...defaultZoneForm}); }}
                        className="flex items-center justify-center gap-2 px-4 py-2 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all w-full sm:w-auto"
                        data-testid="add-zone-btn"
                      >
                        <Plus className="w-4 h-4" /> Neue Zone
                      </button>
                    </div>
                    {zonesLoading ? (
                      <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-ea-gold" /></div>
                    ) : (
                      <div className="grid gap-3">
                        {zones.map(zone => (
                          <div key={zone.id} className="bg-white border border-gray-200 rounded-xl shadow-sm p-3 sm:p-4 flex items-start sm:items-center justify-between gap-2" data-testid={`zone-item-${zone.id}`}>
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-1 min-w-0">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg shrink-0 border-2" style={{ backgroundColor: zone.color + '20', borderColor: zone.color }}>
                                <div className="w-full h-full rounded-md flex items-center justify-center">
                                  <Globe className="w-5 h-5" style={{ color: zone.color }} />
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="font-bold text-ea-dark text-sm sm:text-base truncate">{zone.name}</h3>
                                  <span className="text-xs text-ea-dark/40">{zone.country}</span>
                                </div>
                                <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-xs sm:text-sm text-ea-dark/60 mt-0.5">
                                  {zone.expected_growth > 0 && <span>+{zone.expected_growth}% Wachstum</span>}
                                  <span>Radius: {zone.radius_km} km</span>
                                  {zone.investment_focus?.length > 0 && <span>{zone.investment_focus.join(', ')}</span>}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={() => handleEditZone(zone)} className="p-2 text-ea-dark/50 hover:text-ea-gold transition-all" data-testid={`edit-zone-${zone.id}`}>
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteZone(zone.id, zone.name)} className="p-2 text-ea-dark/50 hover:text-red-500 transition-all" data-testid={`delete-zone-${zone.id}`}>
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {zones.length === 0 && !zonesLoading && (
                          <p className="text-center text-ea-dark/50 py-8">Keine Investitionszonen vorhanden.</p>
                        )}
                      </div>
                    )}
                  </>
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
                <button
                  onClick={() => setActiveLegalPage('agb')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    activeLegalPage === 'agb'
                      ? 'bg-ea-dark text-white'
                      : 'bg-gray-100 text-ea-dark/70 hover:bg-gray-200'
                  }`}
                  data-testid="legal-tab-agb"
                >
                  AGB
                </button>
              </div>

              {/* Editor */}
              {activeLegalPage === 'impressum' && (
                <div>
                  <label className="block text-ea-dark font-semibold text-sm mb-2">Impressum-Inhalt</label>
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
                  <label className="block text-ea-dark font-semibold text-sm mb-2">Datenschutz-Inhalt</label>
                  <WYSIWYGEditor
                    key="datenschutz-editor"
                    value={datenschutzContent}
                    onChange={setDatenschutzContent}
                    placeholder="Datenschutzerkl&auml;rung hier eingeben..."
                  />
                </div>
              )}
              {activeLegalPage === 'agb' && (
                <div>
                  <label className="block text-ea-dark font-semibold text-sm mb-2">AGB-Inhalt</label>
                  <WYSIWYGEditor
                    key="agb-editor"
                    value={agbContent}
                    onChange={setAgbContent}
                    placeholder="Allgemeine Gesch&auml;ftsbedingungen hier eingeben..."
                  />
                </div>
              )}

              <p className="text-ea-dark/40 text-xs mt-4">
                Tipp: Nutze die Toolbar f&uuml;r &Uuml;berschriften, Listen und Links. Der Inhalt wird als HTML gespeichert und auf der &ouml;ffentlichen Seite angezeigt.
              </p>
            </div>

            {/* Live Preview */}
            <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4 sm:p-8">
              <div className="flex items-center space-x-2 mb-6">
                <Eye className="w-5 h-5 text-ea-gold" />
                <h2 className="text-lg sm:text-xl font-bold text-ea-dark">
                  Vorschau: {activeLegalPage === 'impressum' ? 'Impressum' : activeLegalPage === 'datenschutz' ? 'Datenschutz' : 'AGB'}
                </h2>
              </div>
              <div className="border border-gray-100 rounded-xl p-6 bg-gray-50/50">
                <div className="text-center mb-8">
                  <p className="text-ea-gold text-xs font-semibold tracking-wider uppercase mb-2">Rechtliches</p>
                  <h3 className="font-semibold text-2xl text-ea-dark">
                    {activeLegalPage === 'impressum' ? 'Impressum' : activeLegalPage === 'datenschutz' ? 'Datenschutzerkl\u00e4rung' : 'Allgemeine Gesch\u00e4ftsbedingungen'}
                  </h3>
                </div>
                <div 
                  className="legal-preview"
                  dangerouslySetInnerHTML={{ __html: activeLegalPage === 'impressum' ? impressumContent : activeLegalPage === 'datenschutz' ? datenschutzContent : agbContent }}
                />
                <style>{`
                  .legal-preview h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #04151F;
                    margin-top: 2rem;
                    margin-bottom: 0.75rem;
                    padding-bottom: 0.5rem;
                    border-bottom: 2px solid #C8A96A;
                  }
                  .legal-preview h2:first-child { margin-top: 0; }
                  .legal-preview h3 {
                    font-size: 1rem;
                    font-weight: 600;
                    color: #04151F;
                    margin-top: 1.25rem;
                    margin-bottom: 0.5rem;
                  }
                  .legal-preview p {
                    color: rgba(4, 21, 31, 0.7);
                    line-height: 1.8;
                    margin-bottom: 0.75rem;
                    font-size: 0.875rem;
                  }
                  .legal-preview ul, .legal-preview ol {
                    color: rgba(4, 21, 31, 0.7);
                    line-height: 1.8;
                    margin-bottom: 0.75rem;
                    padding-left: 1.5rem;
                    font-size: 0.875rem;
                  }
                  .legal-preview li { margin-bottom: 0.25rem; }
                  .legal-preview a { color: #C8A96A; text-decoration: underline; }
                  .legal-preview strong { color: #04151F; }
                `}</style>
                {!(activeLegalPage === 'impressum' ? impressumContent : datenschutzContent) && (
                  <p className="text-ea-dark/30 text-center text-sm italic">Noch kein Inhalt eingegeben. Schreiben Sie oben im Editor.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Newsletter Tab */}
        {activeTab === 'newsletter' && (
          <NewsletterAdmin credentials={credentials} />
        )}

        {/* Events Tab */}
        {activeTab === 'events' && (
          <EventsAdmin credentials={credentials} />
        )}

        {/* Leistungen CMS Tab */}
        {activeTab === 'leistungen' && (
          <LeistungenAdmin credentials={credentials} />
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
          {/* Live Preview */}
          <details className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
            <summary className="flex items-center gap-2 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium text-ea-dark">
              <Eye className="w-4 h-4 text-ea-gold" />
              Vorschau anzeigen
            </summary>
            <div className="p-6 bg-white">
              <div className="article-preview" dangerouslySetInnerHTML={{ __html: editorContent }} />
              <style>{`
                .article-preview h1 { font-size: 1.75rem; font-weight: 700; color: #04151F; margin-bottom: 1rem; }
                .article-preview h2 { font-size: 1.35rem; font-weight: 600; color: #04151F; margin-top: 2rem; margin-bottom: 0.75rem; padding-bottom: 0.5rem; border-bottom: 2px solid #C8A96A; }
                .article-preview h3 { font-size: 1.1rem; font-weight: 600; color: #04151F; margin-top: 1.5rem; margin-bottom: 0.5rem; }
                .article-preview p { color: rgba(4,21,31,0.7); line-height: 1.8; margin-bottom: 0.75rem; }
                .article-preview ul, .article-preview ol { color: rgba(4,21,31,0.7); line-height: 1.8; margin-bottom: 0.75rem; padding-left: 1.5rem; }
                .article-preview li { margin-bottom: 0.25rem; }
                .article-preview a { color: #C8A96A; text-decoration: underline; }
                .article-preview strong { color: #04151F; }
                .article-preview img { max-width: 100%; border-radius: 8px; margin: 1rem 0; }
                .article-preview blockquote { border-left: 3px solid #C8A96A; padding-left: 1rem; color: rgba(4,21,31,0.6); font-style: italic; margin: 1rem 0; }
              `}</style>
            </div>
          </details>
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
            placeholder="z.B. Due Diligence Checkliste: Immobilienkauf"
          />
        </div>
        <div>
          <label className="block text-ea-dark/80 text-sm mb-2">Checkliste (ein Punkt pro Zeile)</label>
          <textarea
            value={
              formData.dueDiligenceBox?.content
                ? formData.dueDiligenceBox.content
                    .replace(/<ul>|<\/ul>/g, '')
                    .replace(/<li>/g, '')
                    .replace(/<\/li>/g, '\n')
                    .replace(/✅\s?/g, '')
                    .trim()
                : ''
            }
            onChange={(e) => {
              const lines = e.target.value.split('\n').filter(l => l.trim());
              const html = lines.length > 0 
                ? '<ul>' + lines.map(l => `<li>${l.trim()}</li>`).join('') + '</ul>'
                : '';
              handleNestedChange('dueDiligenceBox', 'content', html);
            }}
            className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-3 text-ea-dark focus:outline-none focus:border-ea-gold h-32"
            placeholder="Grundbucheintrag prüfen&#10;Baugenehmigung verifizieren&#10;Steuerliche Struktur klären&#10;Lokalen Anwalt beauftragen"
          />
          <p className="text-xs text-ea-dark/50 mt-1">Jede Zeile wird automatisch ein Checkpunkt mit goldenem Haken.</p>
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
        <details className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
          <summary className="flex items-center gap-2 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium text-ea-dark">
            <Eye className="w-4 h-4 text-ea-gold" />
            Vorschau anzeigen
          </summary>
          <div className="p-6 bg-white">
            <div className="article-preview" dangerouslySetInnerHTML={{ __html: formData.content }} />
          </div>
        </details>
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
          <details className="mt-4 border border-gray-200 rounded-xl overflow-hidden">
            <summary className="flex items-center gap-2 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors text-sm font-medium text-ea-dark">
              <Eye className="w-4 h-4 text-ea-gold" />
              Vorschau anzeigen
            </summary>
            <div className="p-6 bg-white">
              <div className="article-preview" dangerouslySetInnerHTML={{ __html: section.content || '' }} />
            </div>
          </details>
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

// Leistungen CMS Admin Component
const LeistungenAdmin = ({ credentials }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const API_URL = process.env.REACT_APP_BACKEND_URL || '';
  const authHeader = 'Basic ' + btoa(`${credentials.username}:${credentials.password}`);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`${API_URL}/api/leistungen-content`);
        if (res.ok) setContent(await res.json());
      } catch (err) {
        console.error('Failed to fetch:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchContent();
  }, [API_URL]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/leistungen-content`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
        body: JSON.stringify(content)
      });
      if (res.ok) {
        setContent(await res.json());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      console.error('Failed to save:', err);
    } finally {
      setSaving(false);
    }
  };

  const updateService = (idx, field, value) => {
    setContent(prev => ({
      ...prev,
      services: prev.services.map((s, i) => i === idx ? { ...s, [field]: value } : s)
    }));
  };

  const updateServicePoint = (sIdx, pIdx, value) => {
    setContent(prev => ({
      ...prev,
      services: prev.services.map((s, i) =>
        i === sIdx ? { ...s, points: s.points.map((p, j) => j === pIdx ? value : p) } : s
      )
    }));
  };

  const updateRiskItem = (section, idx, field, value) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        items: prev[section].items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
      }
    }));
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-ea-gold animate-spin" /></div>;
  if (!content) return <div className="text-center py-16 text-ea-dark/50">Fehler beim Laden</div>;

  const sections = [
    { key: 'hero', label: 'Hero-Bereich' },
    { key: 'services', label: 'Leistungen (4)' },
    { key: 'legal_risks', label: 'Rechtsrisiken' },
    { key: 'compliance_risks', label: 'Compliance' },
    { key: 'guarantee', label: 'Garantie' },
    { key: 'cta', label: 'CTA' }
  ];

  return (
    <div className="space-y-6" data-testid="leistungen-admin">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ea-dark">Leistungen-Seite bearbeiten</h2>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all text-sm disabled:opacity-50"
          data-testid="leistungen-save-btn">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? 'Gespeichert!' : 'Speichern'}
        </button>
      </div>

      {/* Section Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {sections.map(s => (
          <button key={s.key} onClick={() => setActiveSection(s.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              activeSection === s.key ? 'bg-ea-dark text-white' : 'bg-gray-100 text-ea-dark/60 hover:bg-gray-200'
            }`}>
            {s.label}
          </button>
        ))}
      </div>

      {/* Hero */}
      {activeSection === 'hero' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-ea-dark">Hero-Bereich</h3>
          <InputField label="Tagline" value={content.hero?.tagline} onChange={v => setContent(p => ({...p, hero: {...p.hero, tagline: v}}))} />
          <TextareaField label="Beschreibung" value={content.hero?.description} onChange={v => setContent(p => ({...p, hero: {...p.hero, description: v}}))} />
        </div>
      )}

      {/* Services */}
      {activeSection === 'services' && (
        <div className="space-y-6">
          {content.services?.map((service, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4" data-testid={`admin-service-${idx}`}>
              <h3 className="font-semibold text-ea-dark flex items-center gap-2">
                <span className="bg-ea-gold/10 text-ea-gold w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold">{idx + 1}</span>
                {service.title}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Titel" value={service.title} onChange={v => updateService(idx, 'title', v)} />
                <InputField label="Tagline" value={service.tagline} onChange={v => updateService(idx, 'tagline', v)} />
              </div>
              <TextareaField label="Beschreibung" value={service.description} onChange={v => updateService(idx, 'description', v)} />
              <div>
                <label className="block text-sm font-medium text-ea-dark mb-1">Bild-URL (optional)</label>
                <input value={service.image || ''} onChange={e => updateService(idx, 'image', e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold"
                  placeholder="https://i.ibb.co/..." data-testid={`service-image-${idx}`} />
                {service.image && (
                  <img src={service.image} alt="Vorschau" className="mt-2 h-20 w-auto rounded-lg object-cover border border-gray-200" />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-ea-dark mb-2">Stichpunkte</label>
                {service.points?.map((point, pIdx) => (
                  <input key={pIdx} value={point} onChange={e => updateServicePoint(idx, pIdx, e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:border-ea-gold"
                    placeholder={`Punkt ${pIdx + 1}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legal Risks */}
      {activeSection === 'legal_risks' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-ea-dark">Überschriften</h3>
            <TextareaField label="Beschreibung" value={content.legal_risks?.description} onChange={v => setContent(p => ({...p, legal_risks: {...p.legal_risks, description: v}}))} />
            <InputField label="Fazit" value={content.legal_risks?.conclusion} onChange={v => setContent(p => ({...p, legal_risks: {...p.legal_risks, conclusion: v}}))} />
          </div>
          {content.legal_risks?.items?.map((item, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-ea-dark">{item.problem}</h3>
              <InputField label="Problem" value={item.problem} onChange={v => updateRiskItem('legal_risks', idx, 'problem', v)} />
              <TextareaField label="Risiko" value={item.risk} onChange={v => updateRiskItem('legal_risks', idx, 'risk', v)} />
              <TextareaField label="Lösung" value={item.solution} onChange={v => updateRiskItem('legal_risks', idx, 'solution', v)} />
            </div>
          ))}
        </div>
      )}

      {/* Compliance Risks */}
      {activeSection === 'compliance_risks' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-ea-dark">Überschriften</h3>
            <TextareaField label="Beschreibung" value={content.compliance_risks?.description} onChange={v => setContent(p => ({...p, compliance_risks: {...p.compliance_risks, description: v}}))} />
            <InputField label="Fazit" value={content.compliance_risks?.conclusion} onChange={v => setContent(p => ({...p, compliance_risks: {...p.compliance_risks, conclusion: v}}))} />
          </div>
          {content.compliance_risks?.items?.map((item, idx) => (
            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-ea-dark">{item.problem}</h3>
              <InputField label="Problem" value={item.problem} onChange={v => updateRiskItem('compliance_risks', idx, 'problem', v)} />
              <TextareaField label="Risiko" value={item.risk} onChange={v => updateRiskItem('compliance_risks', idx, 'risk', v)} />
              <TextareaField label="Lösung" value={item.solution} onChange={v => updateRiskItem('compliance_risks', idx, 'solution', v)} />
            </div>
          ))}
        </div>
      )}

      {/* Guarantee */}
      {activeSection === 'guarantee' && (
        <div className="space-y-6">
          <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-ea-dark">Überschriften</h3>
            <InputField label="Untertitel" value={content.guarantee?.subtitle} onChange={v => setContent(p => ({...p, guarantee: {...p.guarantee, subtitle: v}}))} />
          </div>
          {['buyer', 'owner'].map(key => (
            <div key={key} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
              <h3 className="font-semibold text-ea-dark">{key === 'buyer' ? 'Vor dem Kauf' : 'Nach dem Kauf'}</h3>
              <InputField label="Label" value={content.guarantee?.[key]?.label} onChange={v => setContent(p => ({...p, guarantee: {...p.guarantee, [key]: {...p.guarantee[key], label: v}}}))} />
              <InputField label="Titel" value={content.guarantee?.[key]?.title} onChange={v => setContent(p => ({...p, guarantee: {...p.guarantee, [key]: {...p.guarantee[key], title: v}}}))} />
              <TextareaField label="Beschreibung" value={content.guarantee?.[key]?.description} onChange={v => setContent(p => ({...p, guarantee: {...p.guarantee, [key]: {...p.guarantee[key], description: v}}}))} />
              <TextareaField label="Highlight" value={content.guarantee?.[key]?.highlight} onChange={v => setContent(p => ({...p, guarantee: {...p.guarantee, [key]: {...p.guarantee[key], highlight: v}}}))} />
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      {activeSection === 'cta' && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-ea-dark">Call-to-Action</h3>
          <InputField label="Titel" value={content.cta?.title} onChange={v => setContent(p => ({...p, cta: {...p.cta, title: v}}))} />
          <TextareaField label="Beschreibung" value={content.cta?.description} onChange={v => setContent(p => ({...p, cta: {...p.cta, description: v}}))} />
          <InputField label="Button-Text" value={content.cta?.button_text} onChange={v => setContent(p => ({...p, cta: {...p.cta, button_text: v}}))} />
        </div>
      )}
    </div>
  );
};

// Reusable field components for LeistungenAdmin
const InputField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-ea-dark mb-1">{label}</label>
    <input value={value || ''} onChange={e => onChange(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold" />
  </div>
);

const TextareaField = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-ea-dark mb-1">{label}</label>
    <textarea value={value || ''} onChange={e => onChange(e.target.value)} rows={3}
      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold resize-none" />
  </div>
);

// Events Admin Component
const EventsAdmin = ({ credentials }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const API_URL = process.env.REACT_APP_BACKEND_URL || '';
  const authHeader = 'Basic ' + btoa(`${credentials.username}:${credentials.password}`);

  const emptyEvent = {
    title: '', description: '', date: '', time: '', location: '', type: 'Event', image: '', link: '', status: 'upcoming'
  };

  const [form, setForm] = useState(emptyEvent);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/events`);
      if (res.ok) setEvents(await res.json());
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleSave = async () => {
    if (!form.title || !form.date) return;
    setSaving(true);
    try {
      const url = editing
        ? `${API_URL}/api/admin/events/${editing}`
        : `${API_URL}/api/admin/events`;
      const method = editing ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setEditing(null);
        setCreating(false);
        setForm(emptyEvent);
        fetchEvents();
      }
    } catch (err) {
      console.error('Failed to save event:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Event wirklich löschen?')) return;
    try {
      await fetch(`${API_URL}/api/admin/events/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': authHeader }
      });
      fetchEvents();
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const startEdit = (event) => {
    setEditing(event.id);
    setCreating(false);
    setForm({
      title: event.title || '',
      description: event.description || '',
      date: event.date || '',
      time: event.time || '',
      location: event.location || '',
      type: event.type || 'Event',
      image: event.image || '',
      link: event.link || '',
      status: event.status || 'upcoming'
    });
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-ea-gold animate-spin" /></div>;

  return (
    <div className="space-y-6" data-testid="events-admin">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-ea-dark">Events verwalten</h2>
        {!creating && !editing && (
          <button
            onClick={() => { setCreating(true); setEditing(null); setForm(emptyEvent); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all text-sm"
            data-testid="create-event-btn"
          >
            <Plus className="w-4 h-4" /> Neues Event
          </button>
        )}
      </div>

      {/* Form */}
      {(creating || editing) && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4" data-testid="event-form">
          <h3 className="font-semibold text-ea-dark">{editing ? 'Event bearbeiten' : 'Neues Event erstellen'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ea-dark mb-1">Titel *</label>
              <input value={form.title} onChange={(e) => setForm(f => ({...f, title: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold"
                placeholder="z.B. Investoren-Webinar Montenegro" data-testid="event-title-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ea-dark mb-1">Typ</label>
              <select value={form.type} onChange={(e) => setForm(f => ({...f, type: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold">
                <option value="Event">Event</option>
                <option value="Webinar">Webinar</option>
                <option value="Workshop">Workshop</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-ea-dark mb-1">Datum *</label>
              <input type="date" value={form.date} onChange={(e) => setForm(f => ({...f, date: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold"
                data-testid="event-date-input" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ea-dark mb-1">Uhrzeit</label>
              <input type="time" value={form.time} onChange={(e) => setForm(f => ({...f, time: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ea-dark mb-1">Ort</label>
              <input value={form.location} onChange={(e) => setForm(f => ({...f, location: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold"
                placeholder="z.B. Online oder Podgorica, Montenegro" />
            </div>
            <div>
              <label className="block text-sm font-medium text-ea-dark mb-1">Status</label>
              <select value={form.status} onChange={(e) => setForm(f => ({...f, status: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold">
                <option value="upcoming">Kommend</option>
                <option value="past">Vergangen</option>
                <option value="cancelled">Abgesagt</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ea-dark mb-1">Beschreibung</label>
            <textarea value={form.description} onChange={(e) => setForm(f => ({...f, description: e.target.value}))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold resize-none" rows="3"
              placeholder="Kurze Beschreibung des Events..." />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ea-dark mb-1">Bild-URL</label>
              <input value={form.image} onChange={(e) => setForm(f => ({...f, image: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold"
                placeholder="https://i.ibb.co/..." data-testid="event-image-input" />
              {form.image && (
                <img src={form.image} alt="Vorschau" className="mt-2 h-24 w-auto rounded-lg object-cover border border-gray-200" />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-ea-dark mb-1">Anmelde-Link (extern)</label>
              <input value={form.link} onChange={(e) => setForm(f => ({...f, link: e.target.value}))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold"
                placeholder="https://..." />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} disabled={saving || !form.title || !form.date}
              className="flex items-center gap-2 px-5 py-2.5 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all text-sm disabled:opacity-50"
              data-testid="event-save-btn">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Speichern
            </button>
            <button onClick={() => { setEditing(null); setCreating(false); setForm(emptyEvent); }}
              className="px-5 py-2.5 border border-gray-200 text-ea-dark/70 rounded-lg hover:bg-gray-50 transition-all text-sm">
              Abbrechen
            </button>
          </div>
        </div>
      )}

      {/* Event List */}
      {events.length === 0 && !creating ? (
        <div className="text-center py-12 text-ea-dark/50">
          <Calendar className="w-10 h-10 mx-auto mb-3 text-ea-dark/30" />
          <p>Noch keine Events vorhanden.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map(event => (
            <div key={event.id} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between gap-4" data-testid={`admin-event-${event.id}`}>
              <div className="flex items-center gap-4 min-w-0">
                {event.image && (
                  <img src={event.image} alt="" className="w-16 h-12 rounded-lg object-cover shrink-0 border border-gray-100" />
                )}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-semibold text-ea-dark text-sm truncate">{event.title}</h4>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      event.status === 'upcoming' ? 'bg-green-100 text-green-700' :
                      event.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                    }`}>{event.status === 'upcoming' ? 'Kommend' : event.status === 'cancelled' ? 'Abgesagt' : 'Vergangen'}</span>
                  </div>
                  <div className="text-xs text-ea-dark/50 flex items-center gap-3">
                    <span>{event.date}</span>
                    {event.time && <span>{event.time} Uhr</span>}
                    <span className="text-ea-gold font-medium">{event.type}</span>
                    {event.location && <span>{event.location}</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => startEdit(event)} className="p-2 text-ea-dark/50 hover:text-ea-gold transition-colors" data-testid={`edit-event-${event.id}`}>
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(event.id)} className="p-2 text-ea-dark/50 hover:text-red-500 transition-colors" data-testid={`delete-event-${event.id}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
