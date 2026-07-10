import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Eye, Users, Calculator, Mail, TrendingUp, Monitor, Smartphone, Tablet,
  Download, ArrowUpRight, ArrowDownRight, FileText, Share2, Megaphone, RotateCcw, AlertTriangle, Trash2,
  MessageSquare, Plus, X, Phone, MapPin, Clock, Target, Send, Upload
} from 'lucide-react';

const COLORS = ['#C8A96A', '#04151F', '#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const PAGE_LABELS = {
  '/': 'Homepage',
  '/blog': 'Blog',
  '/contact': 'Contact',
  '/team': 'Team',
  '/investment': 'Investment Dashboard',
  '/investment/rechner': 'ROI Calculator',
  '/investment/vergleich': 'Location Comparison',
  '/immobilien/budva': 'Budva',
  '/immobilien/niksic': 'Nikšić',
  '/immobilien/podgorica': 'Podgorica',
  '/immobilien/skadar-lake': 'Škadarsee',
  '/immobilien/zabljak': 'Žabljak',
  '/serbia-executive': 'Serbien Executive',
  '/infrastruktur-radar': 'Infrastruktur Radar',
  '/impressum': 'Impressum',
  '/datenschutz': 'Datenschutz',
};

const getPageLabel = (path) => {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith('/blog/')) return 'Artikel: ' + path.split('/blog/')[1];
  if (path.startsWith('/investment/standort/')) return 'Standort: ' + path.split('/standort/')[1];
  return path;
};

const DEVICE_ICONS = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet
};

const DEVICE_LABELS = { desktop: 'Desktop', mobile: 'Mobile', tablet: 'Tablet' };

const AnalyticsDashboard = ({ credentials }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [loadingLead, setLoadingLead] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [allLeads, setAllLeads] = useState(null);
  const [loadingAllLeads, setLoadingAllLeads] = useState(false);
  const [leadSearch, setLeadSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmails, setSentEmails] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLabel, setImportLabel] = useState('Facebook Campaign');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', source: 'Manual', interest: '', country: '', city: '' });
  const [addingLead, setAddingLead] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);

  useEffect(() => {
    fetchAnalytics();
    fetchTeamMembers();
  }, [period]);

  const fetchTeamMembers = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/team-members`, {
        headers: { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) }
      });
      if (res.ok) setTeamMembers(await res.json());
    } catch {}
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/analytics/overview?days=${period}`,
        { headers: { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) } }
      );
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Analytics fetch failed:', err);
    }
    setLoading(false);
  };

  const resetAnalytics = async () => {
    setResetting(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/analytics/reset`,
        { method: 'DELETE', headers: { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) } }
      );
      if (res.ok) {
        setShowResetModal(false);
        fetchAnalytics();
      }
    } catch (err) {
      console.error('Analytics reset failed:', err);
    }
    setResetting(false);
  };

  const exportLeadsCSV = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/leads`, {
        headers: { 'Authorization': 'Basic ' + btoa('admin:euroadria2025') }
      });
      if (!res.ok) return;
      const allLeads = await res.json();
      if (!allLeads?.length) return;
      const headers = ['Name', 'Email', 'Phone', 'Source', 'Expose', 'Country', 'State', 'City', 'Interest', 'Timeline', 'Contact Method', 'Date'];
      const rows = allLeads.map(l => [
        l.name, l.email, l.phone || '', l.source || '', l.expose_name || '',
        l.country || '', l.state || '', l.city || '', l.interest || '', l.timeline || '', l.contact_method || '',
        l.submitted_at ? new Date(l.submitted_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''
      ]);
      const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `euroadria-leads-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) { console.error('CSV export failed:', err); }
  };

  const openLeadDetail = async (leadId) => {
    setLoadingLead(true);
    setNewNote('');
    setShowEmailComposer(false);
    setEmailSubject('');
    setEmailBody('');
    setSentEmails([]);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/leads/${leadId}`,
        { headers: { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) } }
      );
      if (res.ok) {
        const lead = await res.json();
        setSelectedLead(lead);
        loadSentEmails(leadId);
      }
    } catch (err) {
      console.error('Lead detail fetch failed:', err);
    }
    setLoadingLead(false);
  };

  const addAdminNote = async () => {
    if (!newNote.trim() || !selectedLead) return;
    setSavingNote(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/leads/${selectedLead._id}/notes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
          },
          body: JSON.stringify({ text: newNote.trim() })
        }
      );
      if (res.ok) {
        const note = await res.json();
        setSelectedLead(prev => ({ ...prev, notes: [note, ...(prev.notes || [])] }));
        setNewNote('');
      }
    } catch (err) {
      console.error('Note save failed:', err);
    }
    setSavingNote(false);
  };

  const sendAdminEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim() || !selectedLead) return;
    setSendingEmail(true);
    setEmailSent(false);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/leads/${selectedLead._id}/email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
          },
          body: JSON.stringify({ subject: emailSubject, body: emailBody })
        }
      );
      if (res.ok) {
        setEmailSent(true);
        setSelectedLead(prev => ({
          ...prev,
          notes: [{ _id: Date.now(), text: `Email sent: "${emailSubject}"`, author: 'Admin (Holger)', created_at: new Date().toISOString() }, ...(prev.notes || [])]
        }));
        setSentEmails(prev => [{ subject: emailSubject, body: emailBody, sent_at: new Date().toISOString() }, ...prev]);
        setTimeout(() => { setShowEmailComposer(false); setEmailSubject(''); setEmailBody(''); setEmailSent(false); }, 1500);
      } else {
        const err = await res.json();
        alert(err.detail || 'Email konnte nicht gesendet werden');
      }
    } catch { alert('Verbindungsfehler'); }
    setSendingEmail(false);
  };

  const loadSentEmails = async (leadId) => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/leads/${leadId}/emails`,
        { headers: { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) } }
      );
      if (res.ok) setSentEmails(await res.json());
    } catch {}
  };

  const importCSV = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportResult(null);
    try {
      const formData = new FormData();
      formData.append('file', importFile);
      formData.append('source_label', importLabel);
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/leads/import`, {
        method: 'POST',
        headers: { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) },
        body: formData
      });
      if (res.ok) {
        const result = await res.json();
        setImportResult(result);
        if (result.imported > 0) {
          fetchAnalytics();
          if (allLeads) loadAllLeads();
        }
      } else {
        const err = await res.json();
        setImportResult({ error: err.detail || 'Import failed' });
      }
    } catch { setImportResult({ error: 'Connection error' }); }
    setImporting(false);
  };

  const addManualLead = async () => {
    if (!newLead.name.trim() || !newLead.email.trim()) return;
    setAddingLead(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
        },
        body: JSON.stringify(newLead)
      });
      if (res.ok) {
        setShowAddLead(false);
        setNewLead({ name: '', email: '', phone: '', source: 'Manual', interest: '', country: '', city: '' });
        fetchAnalytics();
        if (allLeads) loadAllLeads();
      } else {
        const err = await res.json();
        alert(err.detail || 'Error');
      }
    } catch { alert('Connection error'); }
    setAddingLead(false);
  };

  const assignLead = async (leadId, memberEmail) => {
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/leads/${leadId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`)
        },
        body: JSON.stringify({ assigned_to: memberEmail || null })
      });
      setSelectedLead(prev => prev ? { ...prev, assigned_to: memberEmail || null, assigned_to_name: teamMembers.find(m => m.email === memberEmail)?.name || null } : prev);
    } catch {}
  };

  const loadAllLeads = async () => {
    setLoadingAllLeads(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/leads`, {
        headers: { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) }
      });
      if (res.ok) {
        const leads = await res.json();
        setAllLeads(leads);
      }
    } catch (err) { console.error('Load all leads failed:', err); }
    setLoadingAllLeads(false);
  };

  const deleteLeadFromList = async (leadId, leadName) => {
    if (!window.confirm(`Lead "${leadName}" wirklich löschen?`)) return;
    try {
      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/admin/leads/${leadId}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) }
      });
      setAllLeads(prev => prev.filter(l => l._id !== leadId));
      setData(prev => prev ? { ...prev, recent_leads: prev.recent_leads.filter(l => l.lead_id !== leadId) } : prev);
    } catch (e) { alert('Fehler beim Löschen'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-ea-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-ea-dark/50">
        No data available. Analytics will be collected from now on.
      </div>
    );
  }

  const totalDevices = data.devices.reduce((a, d) => a + d.count, 0) || 1;

  return (
    <div className="space-y-6" data-testid="analytics-dashboard">
      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="reset-analytics-modal">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-ea-dark">Analytics zurücksetzen?</h3>
            </div>
            <p className="text-sm text-ea-dark/60 mb-6">
              All page views, contact requests and tracking data will be permanently deleted. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gray-100 text-ea-dark/70 hover:bg-gray-200 transition-all"
                data-testid="reset-analytics-cancel"
              >
                Abbrechen
              </button>
              <button
                onClick={resetAnalytics}
                disabled={resetting}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-50"
                data-testid="reset-analytics-confirm"
              >
                {resetting ? 'Wird gelöscht...' : 'Ja, alles löschen'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Leads Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="import-leads-modal" onClick={() => setShowImportModal(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-ea-gold/10 flex items-center justify-center">
                  <Upload className="w-5 h-5 text-ea-gold" />
                </div>
                <h3 className="text-lg font-bold text-ea-dark">Leads importieren</h3>
              </div>
              <button onClick={() => setShowImportModal(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-ea-dark/40" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-ea-dark/60 mb-1 block">CSV-Datei</label>
                <input
                  type="file"
                  accept=".csv"
                  onChange={e => setImportFile(e.target.files[0])}
                  className="w-full text-sm text-ea-dark file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-ea-gold/10 file:text-ea-dark file:font-medium file:cursor-pointer hover:file:bg-ea-gold/20"
                  data-testid="import-file-input"
                />
                <p className="text-xs text-ea-dark/30 mt-1">Spalten: Email, Name/Vorname/Nachname, Telefonnummer</p>
              </div>
              <div>
                <label className="text-sm text-ea-dark/60 mb-1 block">Quelle / Label</label>
                <input
                  type="text"
                  value={importLabel}
                  onChange={e => setImportLabel(e.target.value)}
                  placeholder="z.B. Facebook Campaign"
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold"
                  data-testid="import-label-input"
                />
              </div>
              <button
                onClick={importCSV}
                disabled={!importFile || importing}
                className="w-full py-2.5 bg-ea-dark text-white font-bold text-sm rounded-lg hover:bg-ea-dark/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                data-testid="import-submit-btn"
              >
                {importing ? 'Importiere...' : <><Upload className="w-4 h-4" /> Leads importieren</>}
              </button>
              {importResult && !importResult.error && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm" data-testid="import-result">
                  <p className="text-green-700 font-semibold">{importResult.imported} Leads importiert</p>
                  {importResult.skipped > 0 && <p className="text-green-600/70">{importResult.skipped} übersprungen (Duplikat oder keine Email)</p>}
                  {importResult.errors?.length > 0 && <p className="text-red-500">{importResult.errors.length} Fehler</p>}
                </div>
              )}
              {importResult?.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">{importResult.error}</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      {showAddLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="add-lead-modal" onClick={() => setShowAddLead(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-ea-dark">Lead hinzufügen</h3>
              </div>
              <button onClick={() => setShowAddLead(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-ea-dark/40" /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-ea-dark/50 mb-1 block">Name *</label>
                  <input type="text" value={newLead.name} onChange={e => setNewLead(p => ({ ...p, name: e.target.value }))} placeholder="Max Mustermann" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="add-lead-name" />
                </div>
                <div>
                  <label className="text-xs text-ea-dark/50 mb-1 block">Email *</label>
                  <input type="email" value={newLead.email} onChange={e => setNewLead(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="add-lead-email" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-ea-dark/50 mb-1 block">Telefon</label>
                  <input type="text" value={newLead.phone} onChange={e => setNewLead(p => ({ ...p, phone: e.target.value }))} placeholder="+49..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="add-lead-phone" />
                </div>
                <div>
                  <label className="text-xs text-ea-dark/50 mb-1 block">Quelle</label>
                  <input type="text" value={newLead.source} onChange={e => setNewLead(p => ({ ...p, source: e.target.value }))} placeholder="Manual" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="add-lead-source" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-ea-dark/50 mb-1 block">Land</label>
                  <input type="text" value={newLead.country} onChange={e => setNewLead(p => ({ ...p, country: e.target.value }))} placeholder="Germany" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="add-lead-country" />
                </div>
                <div>
                  <label className="text-xs text-ea-dark/50 mb-1 block">Stadt</label>
                  <input type="text" value={newLead.city} onChange={e => setNewLead(p => ({ ...p, city: e.target.value }))} placeholder="Berlin" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="add-lead-city" />
                </div>
              </div>
              <div>
                <label className="text-xs text-ea-dark/50 mb-1 block">Interesse</label>
                <input type="text" value={newLead.interest} onChange={e => setNewLead(p => ({ ...p, interest: e.target.value }))} placeholder="Real Estate in Montenegro" className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold" data-testid="add-lead-interest" />
              </div>
              <button
                onClick={addManualLead}
                disabled={!newLead.name.trim() || !newLead.email.trim() || addingLead}
                className="w-full py-2.5 bg-ea-dark text-white font-bold text-sm rounded-lg hover:bg-ea-dark/90 transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                data-testid="add-lead-submit"
              >
                {addingLead ? 'Wird gespeichert...' : <><Plus className="w-4 h-4" /> Lead speichern</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lead Detail Modal */}
      {loadingLead && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-ea-gold border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      {selectedLead && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" data-testid="lead-detail-modal" onClick={() => setSelectedLead(null)}>
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-xl max-h-[85vh] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-bold text-ea-dark" data-testid="lead-detail-name">{selectedLead.name}</h3>
                <p className="text-sm text-ea-dark/50">{selectedLead.email}</p>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-2 rounded-lg hover:bg-gray-100 transition-all" data-testid="lead-detail-close">
                <X className="w-5 h-5 text-ea-dark/50" />
              </button>
            </div>

            {/* Body */}
            <div className="overflow-y-auto flex-1 p-6 space-y-5">
              {/* Lead Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {selectedLead.phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-ea-dark/40" />
                    <span className="text-ea-dark">{selectedLead.phone}</span>
                  </div>
                )}
                {(selectedLead.country || selectedLead.city) && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-ea-dark/40" />
                    <span className="text-ea-dark">{[selectedLead.city, selectedLead.state, selectedLead.country].filter(Boolean).join(', ')}</span>
                  </div>
                )}
                {selectedLead.timeline && (
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-ea-dark/40" />
                    <span className="text-ea-dark">{selectedLead.timeline}</span>
                  </div>
                )}
                {selectedLead.interest && (
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-ea-dark/40" />
                    <span className="text-ea-dark">{selectedLead.interest}</span>
                  </div>
                )}
                {selectedLead.contact_method && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-ea-dark/40" />
                    <span className="text-ea-dark">Bevorzugt: {selectedLead.contact_method}</span>
                  </div>
                )}
                {(selectedLead.expose_name || selectedLead.source) && (
                  <div className="flex items-center gap-2 text-sm">
                    <FileText className="w-4 h-4 text-ea-dark/40" />
                    <span className="bg-ea-gold/10 text-ea-dark text-xs px-2 py-1 rounded-full">{selectedLead.expose_name || selectedLead.source}</span>
                  </div>
                )}
              </div>

              {/* Email Status */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3">
                <Mail className="w-4 h-4 text-ea-dark/40" />
                <span className="text-sm text-ea-dark/60">Email Status:</span>
                {selectedLead.email_opened
                  ? <span className="text-green-600 text-sm font-medium">Geöffnet{selectedLead.email_open_count > 1 ? ` (${selectedLead.email_open_count}x)` : ''}</span>
                  : <span className="text-ea-dark/30 text-sm">Nicht geöffnet</span>
                }
              </div>

              {/* Email Composer */}
              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-semibold text-ea-dark flex items-center gap-2">
                    <Send className="w-4 h-4 text-ea-gold" /> Email senden
                  </h4>
                  {!showEmailComposer ? (
                    <button
                      onClick={() => setShowEmailComposer(true)}
                      className="px-3 py-1.5 bg-ea-gold text-ea-dark text-xs font-bold rounded-lg hover:bg-ea-gold/80 transition-all"
                      data-testid="admin-email-compose-btn"
                    >
                      Neue Email
                    </button>
                  ) : (
                    <button onClick={() => { setShowEmailComposer(false); setEmailSubject(''); setEmailBody(''); }} className="text-ea-dark/30 hover:text-ea-dark/60">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {showEmailComposer && (
                  <div className="space-y-2" data-testid="admin-email-composer">
                    <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-ea-dark/40">
                      An: <span className="text-ea-dark/70">{selectedLead.email}</span>
                    </div>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                      placeholder="Subject"
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold"
                      data-testid="admin-email-subject"
                    />
                    <textarea
                      value={emailBody}
                      onChange={e => setEmailBody(e.target.value)}
                      placeholder="Message..."
                      rows={4}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold resize-none"
                      data-testid="admin-email-body"
                    />
                    <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-ea-dark/30">
                      Signatur: Holger Kuhlmann, CEO & Founder + EuroAdria Corporate
                    </div>
                    <button
                      onClick={sendAdminEmail}
                      disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
                      className={`w-full py-2 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                        emailSent ? 'bg-green-500 text-white' : 'bg-ea-dark text-white hover:bg-ea-dark/90 disabled:opacity-40'
                      }`}
                      data-testid="admin-email-send-btn"
                    >
                      {emailSent ? 'Gesendet!' : sendingEmail ? 'Wird gesendet...' : <><Send className="w-3.5 h-3.5" /> Senden</>}
                    </button>
                  </div>
                )}
                {!showEmailComposer && sentEmails.length > 0 && (
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {sentEmails.map((em, i) => (
                      <div key={em._id || i} className="bg-gray-50 rounded-lg px-3 py-2 flex items-center justify-between" data-testid={`admin-sent-email-${i}`}>
                        <div>
                          <p className="text-sm text-ea-dark font-medium">{em.subject}</p>
                          <p className="text-xs text-ea-dark/30">{em.sent_by || 'Admin'}</p>
                        </div>
                        <span className="text-xs text-ea-dark/30">{em.sent_at ? new Date(em.sent_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                      </div>
                    ))}
                  </div>
                )}
                {!showEmailComposer && sentEmails.length === 0 && (
                  <p className="text-xs text-ea-dark/30 text-center py-2">Keine Emails gesendet</p>
                )}
              </div>

              {/* Notes Section */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4 text-ea-gold" />
                  <h4 className="text-sm font-semibold text-ea-dark">Notizen ({selectedLead.notes?.length || 0})</h4>
                </div>

                {/* Add Note */}
                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={newNote}
                    onChange={e => setNewNote(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addAdminNote()}
                    placeholder="Notiz hinzufügen..."
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-ea-dark focus:outline-none focus:border-ea-gold"
                    data-testid="lead-note-input"
                  />
                  <button
                    onClick={addAdminNote}
                    disabled={!newNote.trim() || savingNote}
                    className="px-4 py-2 bg-ea-dark text-white text-sm font-medium rounded-lg hover:bg-ea-dark/90 transition-all disabled:opacity-40 flex items-center gap-1.5"
                    data-testid="lead-note-save"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    {savingNote ? '...' : 'Speichern'}
                  </button>
                </div>

                {/* Notes List */}
                {selectedLead.notes?.length > 0 ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedLead.notes.map((note, idx) => (
                      <div key={note._id || idx} className="bg-gray-50 rounded-lg px-4 py-3" data-testid={`lead-note-${idx}`}>
                        <p className="text-sm text-ea-dark">{note.text}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs font-medium text-ea-gold">{note.author}</span>
                          <span className="text-xs text-ea-dark/30">
                            {note.created_at ? new Date(note.created_at).toLocaleString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ea-dark/30 text-center py-4">Noch keine Notizen vorhanden</p>
                )}
              </div>
            </div>

            {/* Footer with Assignment */}
            <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between gap-3">
              <span className="text-xs text-ea-dark/30">
                Lead vom {selectedLead.submitted_at ? new Date(selectedLead.submitted_at).toLocaleDateString('de-DE') : '-'}
              </span>
              <div className="flex items-center gap-2">
                {selectedLead.status && (
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-blue-50 text-blue-600">{selectedLead.status}</span>
                )}
                <select
                  value={selectedLead.assigned_to || ''}
                  onChange={e => assignLead(selectedLead._id, e.target.value)}
                  className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-2 py-1.5 text-ea-dark focus:outline-none focus:border-ea-gold"
                  data-testid="lead-assign-select"
                >
                  <option value="">Nicht zugewiesen</option>
                  {teamMembers.map(m => (
                    <option key={m.email} value={m.email}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Period Selector + Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-ea-dark">Analytics Dashboard</h2>
        <div className="flex items-center gap-2">
          {[7, 30, 90, 365, 0].map(d => (
            <button
              key={d}
              onClick={() => setPeriod(d || 9999)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === (d || 9999) 
                  ? 'bg-ea-dark text-white' 
                  : 'bg-gray-100 text-ea-dark/70 hover:bg-gray-200'
              }`}
              data-testid={`period-${d || 'all'}`}
            >
              {d === 0 ? 'All Time' : `${d} Days`}
            </button>
          ))}
          <button
            onClick={() => setShowResetModal(true)}
            className="ml-2 flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-all"
            data-testid="reset-analytics-button"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Zurücksetzen
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Eye}
          label="Page Views"
          value={data.total_views.toLocaleString('de-DE')}
          color="bg-blue-50 text-blue-600"
          testId="kpi-views"
        />
        <KPICard
          icon={Users}
          label="Leads"
          value={data.total_leads}
          subtitle={`${data.conversion_rate}% Conversion`}
          color="bg-green-50 text-green-600"
          testId="kpi-leads"
        />
        <KPICard
          icon={Calculator}
          label="ROI-Rechner"
          value={data.calculator_usage}
          subtitle="Berechnungen"
          color="bg-amber-50 text-amber-600"
          testId="kpi-calculator"
        />
        <KPICard
          icon={Mail}
          label="Kontaktanfragen"
          value={data.total_contacts}
          color="bg-purple-50 text-purple-600"
          testId="kpi-contacts"
        />
      </div>

      {/* Traffic Chart */}
      {data.daily_views.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-ea-dark mb-4">Page Views (last {period} days)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.daily_views}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}.${d.getMonth()+1}.`; }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                  labelFormatter={(v) => { const d = new Date(v); return `${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`; }}
                />
                <Line type="monotone" dataKey="views" stroke="#C8A96A" strokeWidth={2.5} dot={{ r: 3, fill: '#C8A96A' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-ea-dark mb-4">Top Seiten</h3>
          {data.top_pages.length > 0 ? (
            <div className="space-y-3">
              {data.top_pages.map((page, i) => {
                const maxViews = data.top_pages[0]?.views || 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-ea-dark/40 w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-ea-dark truncate">{getPageLabel(page.path)}</span>
                        <span className="text-sm font-semibold text-ea-dark ml-2">{page.views}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div 
                          className="bg-ea-gold rounded-full h-1.5 transition-all" 
                          style={{ width: `${(page.views / maxViews) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-ea-dark/40 text-sm">Noch keine Daten</p>
          )}
        </div>

        {/* Device & Traffic Sources */}
        <div className="space-y-6">
          {/* Devices */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-ea-dark mb-4">Geräte</h3>
            {data.devices.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.devices} dataKey="count" nameKey="device" cx="50%" cy="50%" innerRadius={30} outerRadius={55}>
                        {data.devices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 flex-1">
                  {data.devices.map((d, i) => {
                    const Icon = DEVICE_ICONS[d.device] || Monitor;
                    const pct = Math.round((d.count / totalDevices) * 100);
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                          <Icon className="w-4 h-4 text-ea-dark/50" />
                          <span className="text-sm text-ea-dark">{DEVICE_LABELS[d.device] || d.device}</span>
                        </div>
                        <span className="text-sm font-semibold text-ea-dark">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-ea-dark/40 text-sm">Noch keine Daten</p>
            )}
          </div>

          {/* Traffic Sources */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-ea-dark mb-4">Traffic-Quellen</h3>
            {data.referrers.length > 0 ? (
              <div className="space-y-2.5">
                {data.referrers.map((r, i) => {
                  const maxRef = data.referrers[0]?.count || 1;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm text-ea-dark w-24 truncate">{r.source}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-ea-dark rounded-full h-2" style={{ width: `${(r.count / maxRef) * 100}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold text-ea-dark/60 w-8 text-right">{r.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-ea-dark/40 text-sm">Noch keine externen Quellen</p>
            )}
          </div>
        </div>
      </div>

      {/* Leads by Source */}
      {data.lead_sources.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-ea-dark mb-4">Leads by Expose</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.lead_sources.map(l => ({ ...l, label: l.source.replace('_expose', '').replace('_', ' ') }))}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                <Bar dataKey="count" fill="#C8A96A" radius={[6, 6, 0, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* UTM Kampagnen Tracking */}
      {(data.utm_sources?.length > 0 || data.utm_campaigns?.length > 0) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* UTM Sources Overview */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Share2 className="w-4 h-4 text-ea-gold" />
              <h3 className="text-base font-semibold text-ea-dark">Traffic by UTM Source</h3>
            </div>
            <p className="text-xs text-ea-dark/40 mb-4">Visitors with utm_source parameter (e.g. TikTok, Instagram)</p>
            {data.utm_sources?.length > 0 ? (
              <div className="space-y-3">
                {data.utm_sources.map((u, i) => {
                  const maxCount = data.utm_sources[0]?.count || 1;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-ea-dark w-24 truncate capitalize">{u.source}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                        <div className="bg-ea-gold rounded-full h-2.5 transition-all" style={{ width: `${(u.count / maxCount) * 100}%` }}></div>
                      </div>
                      <span className="text-sm font-bold text-ea-dark w-10 text-right">{u.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-ea-dark/40 text-sm">Noch keine UTM-Daten</p>
            )}
          </div>

          {/* UTM Campaigns Detail */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-ea-gold" />
              <h3 className="text-base font-semibold text-ea-dark">Kampagnen-Details</h3>
            </div>
            <p className="text-xs text-ea-dark/40 mb-4">Aufschlüsselung nach Quelle, Medium und Kampagne</p>
            {data.utm_campaigns?.length > 0 ? (
              <div className="overflow-x-auto -mx-6 px-6">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left py-2 text-ea-dark/50 font-medium">Quelle</th>
                      <th className="text-left py-2 text-ea-dark/50 font-medium">Medium</th>
                      <th className="text-left py-2 text-ea-dark/50 font-medium">Kampagne</th>
                      <th className="text-right py-2 text-ea-dark/50 font-medium">Besuche</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.utm_campaigns.map((c, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                        <td className="py-2 font-medium text-ea-dark capitalize">{c.source}</td>
                        <td className="py-2 text-ea-dark/70">{c.medium}</td>
                        <td className="py-2 text-ea-dark/70">{c.campaign}</td>
                        <td className="py-2 text-right font-semibold text-ea-dark">{c.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-ea-dark/40 text-sm">Noch keine Kampagnendaten</p>
            )}
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-semibold text-ea-dark">
            {allLeads ? `Alle Leads (${allLeads.length})` : 'Recent Leads'}
          </h3>
          <div className="flex items-center gap-2">
            {!allLeads ? (
              <button
                onClick={loadAllLeads}
                disabled={loadingAllLeads}
                className="flex items-center gap-2 px-4 py-2 bg-ea-gold/10 text-ea-dark text-sm font-medium rounded-lg hover:bg-ea-gold/20 transition-all disabled:opacity-50"
                data-testid="load-all-leads"
              >
                <Users className="w-4 h-4" />
                {loadingAllLeads ? 'Laden...' : 'Alle Leads anzeigen'}
              </button>
            ) : (
              <button
                onClick={() => { setAllLeads(null); setLeadSearch(''); setSourceFilter('all'); }}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-ea-dark/70 text-sm font-medium rounded-lg hover:bg-gray-200 transition-all"
                data-testid="show-recent-leads"
              >
                Nur aktuelle
              </button>
            )}
            <button
              onClick={() => setShowAddLead(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-700 text-sm font-medium rounded-lg hover:bg-green-100 transition-all"
              data-testid="add-lead-btn"
            >
              <Plus className="w-4 h-4" />
              Lead
            </button>
            <button
              onClick={() => { setShowImportModal(true); setImportResult(null); setImportFile(null); }}
              className="flex items-center gap-2 px-4 py-2 bg-ea-gold/10 text-ea-dark text-sm font-medium rounded-lg hover:bg-ea-gold/20 transition-all"
              data-testid="import-leads-btn"
            >
              <Upload className="w-4 h-4" />
              Import
            </button>
            <button
              onClick={exportLeadsCSV}
              className="flex items-center gap-2 px-4 py-2 bg-ea-dark text-white text-sm font-medium rounded-lg hover:bg-ea-dark/90 transition-all"
              data-testid="export-leads-csv"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
          </div>
        </div>

        {/* Search bar + Source Filter (only when all leads loaded) */}
        {allLeads && (
          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={leadSearch}
              onChange={e => setLeadSearch(e.target.value)}
              placeholder="Suche nach Name, Email, Telefon..."
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-ea-dark focus:outline-none focus:border-ea-gold"
              data-testid="lead-search-input"
            />
            <select
              value={sourceFilter}
              onChange={e => setSourceFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-ea-dark focus:outline-none focus:border-ea-gold"
              data-testid="lead-source-filter"
            >
              <option value="all">Alle Quellen</option>
              {[...new Set(allLeads.map(l => l.source).filter(Boolean))].sort().map(s => (
                <option key={s} value={s}>{s} ({allLeads.filter(l => l.source === s).length})</option>
              ))}
            </select>
          </div>
        )}

        {(() => {
          const leadsToShow = allLeads
            ? allLeads.filter(l => {
                if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
                if (!leadSearch.trim()) return true;
                const q = leadSearch.toLowerCase();
                return (l.name || '').toLowerCase().includes(q)
                  || (l.email || '').toLowerCase().includes(q)
                  || (l.phone || '').toLowerCase().includes(q);
              })
            : data.recent_leads;

          return leadsToShow.length > 0 ? (
            <div className="overflow-x-auto -mx-6 px-6" style={{ maxHeight: allLeads ? '600px' : 'none', overflowY: allLeads ? 'auto' : 'visible' }}>
              {allLeads && leadSearch && (
                <p className="text-xs text-ea-dark/40 mb-2">{leadsToShow.length} Ergebnis{leadsToShow.length !== 1 ? 'se' : ''}</p>
              )}
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-white">
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2.5 text-ea-dark/50 font-medium">Name</th>
                    <th className="text-left py-2.5 text-ea-dark/50 font-medium">Email</th>
                    <th className="text-left py-2.5 text-ea-dark/50 font-medium hidden sm:table-cell">Phone</th>
                    <th className="text-left py-2.5 text-ea-dark/50 font-medium">Expose</th>
                    <th className="text-left py-2.5 text-ea-dark/50 font-medium">Email Status</th>
                    <th className="text-left py-2.5 text-ea-dark/50 font-medium hidden md:table-cell">Date</th>
                    <th className="text-right py-2.5 text-ea-dark/50 font-medium w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {leadsToShow.map((lead, i) => {
                    const leadId = lead.lead_id || lead._id;
                    return (
                      <tr key={leadId || i} className="border-b border-gray-50 hover:bg-ea-gold/5 group cursor-pointer transition-colors" onClick={() => openLeadDetail(leadId)} data-testid={`lead-row-${i}`}>
                        <td className="py-2.5 font-medium text-ea-dark">{lead.name}</td>
                        <td className="py-2.5 text-ea-dark/70">{lead.email}</td>
                        <td className="py-2.5 text-ea-dark/70 hidden sm:table-cell">{lead.phone || '-'}</td>
                        <td className="py-2.5">
                          <span className="bg-ea-gold/10 text-ea-dark text-xs px-2 py-1 rounded-full">
                            {lead.expose_name || lead.source || '-'}
                          </span>
                        </td>
                        <td className="py-2.5">
                          {lead.email_opened
                            ? <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                Opened{lead.email_open_count > 1 ? ` (${lead.email_open_count}x)` : ''}
                              </span>
                            : <span className="text-ea-dark/30 text-xs">Not opened</span>
                          }
                        </td>
                        <td className="py-2.5 text-ea-dark/50 text-xs hidden md:table-cell">
                          {lead.submitted_at ? new Date(lead.submitted_at).toLocaleDateString('de-DE') : '-'}
                        </td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteLeadFromList(leadId, lead.name);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-all"
                            data-testid={`delete-lead-${i}`}
                            title="Lead löschen"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-ea-dark/40">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p>{leadSearch ? 'Keine Treffer' : 'Noch keine Leads gesammelt'}</p>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

const KPICard = ({ icon: Icon, label, value, subtitle, color, testId }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm" data-testid={testId}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <p className="text-2xl font-bold text-ea-dark">{value}</p>
    <p className="text-sm text-ea-dark/50 mt-0.5">{label}</p>
    {subtitle && <p className="text-xs text-ea-dark/40 mt-1">{subtitle}</p>}
  </div>
);

// UTM Link Generator
const UTMLinkGenerator = () => {
  const [articleUrl, setArticleUrl] = useState('');
  const [source, setSource] = useState('instagram');
  const [campaign, setCampaign] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [copied, setCopied] = useState(false);

  const sources = [
    { value: 'instagram', label: 'Instagram' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'linkedin', label: 'LinkedIn' },
    { value: 'twitter', label: 'Twitter/X' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'whatsapp', label: 'WhatsApp' },
    { value: 'telegram', label: 'Telegram' },
    { value: 'reddit', label: 'Reddit' },
    { value: 'quora', label: 'Quora' },
    { value: 'newsletter', label: 'Newsletter' },
  ];

  const generateLink = () => {
    let base = articleUrl.trim();
    if (!base) return;
    if (!base.startsWith('http')) base = 'https://euroadria.me' + (base.startsWith('/') ? '' : '/') + base;
    const url = new URL(base);
    url.searchParams.set('utm_source', source);
    url.searchParams.set('utm_medium', 'social');
    if (campaign.trim()) url.searchParams.set('utm_campaign', campaign.trim());
    setGeneratedLink(url.toString());
    setCopied(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm" data-testid="utm-link-generator">
      <div className="flex items-center space-x-3 mb-5">
        <div className="w-10 h-10 bg-ea-gold/10 rounded-xl flex items-center justify-center">
          <Share2 className="w-5 h-5 text-ea-gold" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ea-dark">Link-Generator</h3>
          <p className="text-xs text-ea-dark/50">Tracking-Links fuer Social Media erstellen</p>
        </div>
      </div>
      <div className="space-y-3">
        <input
          type="text"
          value={articleUrl}
          onChange={(e) => setArticleUrl(e.target.value)}
          placeholder="Seiten-URL z.B. /blog/artikel-name oder https://euroadria.me/blog/..."
          className="w-full bg-ea-light border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-ea-dark focus:outline-none focus:border-ea-gold"
          data-testid="utm-url-input"
        />
        <div className="grid grid-cols-2 gap-3">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="bg-ea-light border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-ea-dark focus:outline-none focus:border-ea-gold"
            data-testid="utm-source-select"
          >
            {sources.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <input
            type="text"
            value={campaign}
            onChange={(e) => setCampaign(e.target.value)}
            placeholder="Kampagne (optional)"
            className="bg-ea-light border border-gray-200 rounded-lg px-4 py-2.5 text-sm text-ea-dark focus:outline-none focus:border-ea-gold"
            data-testid="utm-campaign-input"
          />
        </div>
        <button
          onClick={generateLink}
          disabled={!articleUrl.trim()}
          className="w-full py-2.5 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all disabled:opacity-40 text-sm"
          data-testid="utm-generate-btn"
        >
          Link generieren
        </button>
        {generatedLink && (
          <div className="bg-ea-light border border-ea-gold/30 rounded-lg p-3">
            <p className="text-xs text-ea-dark/50 mb-1">Tracking-Link:</p>
            <p className="text-sm text-ea-dark break-all font-mono mb-2">{generatedLink}</p>
            <button
              onClick={copyLink}
              className={'w-full py-2 rounded-lg text-sm font-semibold transition-all ' + (copied ? 'bg-green-100 text-green-700' : 'bg-ea-gold text-ea-dark hover:bg-ea-gold/80')}
              data-testid="utm-copy-btn"
            >
              {copied ? 'Kopiert!' : 'Link kopieren'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
export { UTMLinkGenerator };
