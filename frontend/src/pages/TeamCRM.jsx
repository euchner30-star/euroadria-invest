import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Search, ChevronDown, ChevronUp, Phone, Mail, MapPin, Clock, Target, MessageSquare, Plus, Trash2, Edit3, User, Calendar, DollarSign, Filter } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
  { value: 'qualified', label: 'Qualified', color: 'bg-purple-500' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { value: 'won', label: 'Won', color: 'bg-green-500' },
  { value: 'lost', label: 'Lost', color: 'bg-red-500' },
];

function StatusBadge({ status }) {
  const s = STATUSES.find(st => st.value === status) || STATUSES[0];
  return <span className={`${s.color} text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider`}>{s.label}</span>;
}

function TeamLogin({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/team/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('team_token', data.token);
        onLogin(data);
      } else {
        setError('Invalid credentials');
      }
    } catch { setError('Connection error'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#04151F] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/euroadria-logo-white.png" alt="EuroAdria" className="h-12 mx-auto mb-4" />
          <h1 className="text-white text-xl font-bold">Team Portal</h1>
          <p className="text-white/40 text-sm mt-1">Lead Management System</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4" data-testid="team-login-form">
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#C8A96A]" data-testid="team-login-email" />
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-[#C8A96A]" data-testid="team-login-password" />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button type="submit" disabled={loading} className="w-full py-3 bg-[#C8A96A] text-[#04151F] font-bold rounded-lg hover:bg-[#d4b87a] transition-all disabled:opacity-50" data-testid="team-login-submit">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

function LeadDetail({ lead, token, onBack, onUpdate }) {
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState(lead.notes || []);
  const [status, setStatus] = useState(lead.status || 'new');
  const [leadValue, setLeadValue] = useState(lead.lead_value || '');
  const [saving, setSaving] = useState(false);

  const addNote = async () => {
    if (!noteText.trim()) return;
    const res = await fetch(`${API}/api/team/leads/${lead._id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ text: noteText })
    });
    if (res.ok) {
      const note = await res.json();
      setNotes([note, ...notes]);
      setNoteText('');
    }
  };

  const deleteNote = async (noteId) => {
    await fetch(`${API}/api/team/leads/${lead._id}/notes/${noteId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    setNotes(notes.filter(n => n._id !== noteId));
  };

  const saveChanges = async () => {
    setSaving(true);
    await fetch(`${API}/api/team/leads/${lead._id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status, lead_value: leadValue ? parseFloat(leadValue) : null })
    });
    setSaving(false);
    onUpdate();
  };

  return (
    <div className="max-w-4xl mx-auto" data-testid="lead-detail">
      <button onClick={onBack} className="text-[#C8A96A] text-sm mb-6 hover:underline flex items-center gap-1" data-testid="lead-detail-back">
        &larr; Back to Leads
      </button>

      {/* Header */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-white text-2xl font-bold">{lead.name}</h2>
            <div className="flex flex-wrap gap-4 mt-3 text-white/60 text-sm">
              {lead.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {lead.email}</span>}
              {lead.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4" /> {lead.phone}</span>}
              {(lead.city || lead.country) && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {[lead.city, lead.state, lead.country].filter(Boolean).join(', ')}</span>}
            </div>
          </div>
          <StatusBadge status={status} />
        </div>
        {lead.email_opened && (
          <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
            <Mail className="w-4 h-4" />
            <span>Email opened{lead.email_opened_at ? ` on ${new Date(lead.email_opened_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}` : ''}</span>
            {lead.email_open_count > 1 && <span className="text-green-400/60">({lead.email_open_count}x)</span>}
          </div>
        )}

        {/* Quick info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {lead.interest && <div className="bg-white/5 rounded-lg p-3"><p className="text-white/40 text-xs mb-1">Interest</p><p className="text-white text-sm font-medium">{lead.interest}</p></div>}
          {lead.timeline && <div className="bg-white/5 rounded-lg p-3"><p className="text-white/40 text-xs mb-1">Timeline</p><p className="text-white text-sm font-medium">{lead.timeline}</p></div>}
          {lead.contact_method && <div className="bg-white/5 rounded-lg p-3"><p className="text-white/40 text-xs mb-1">Contact Pref.</p><p className="text-white text-sm font-medium">{lead.contact_method}</p></div>}
          {lead.source && <div className="bg-white/5 rounded-lg p-3"><p className="text-white/40 text-xs mb-1">Source</p><p className="text-white text-sm font-medium">{lead.source}</p></div>}
        </div>
      </div>

      {/* Status & Value Editor */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Edit3 className="w-4 h-4 text-[#C8A96A]" /> Update Lead</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-white/40 text-xs mb-1 block">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#C8A96A]" style={{ colorScheme: 'dark' }} data-testid="lead-status-select">
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">Lead Value (EUR)</label>
            <input type="number" value={leadValue} onChange={(e) => setLeadValue(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="lead-value-input" />
          </div>
          <div className="flex items-end">
            <button onClick={saveChanges} disabled={saving} className="w-full py-2.5 bg-[#C8A96A] text-[#04151F] font-bold rounded-lg text-sm hover:bg-[#d4b87a] transition-all disabled:opacity-50" data-testid="lead-save-btn">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-[#C8A96A]" /> Notes & Activity</h3>
        <div className="flex gap-2 mb-4">
          <input type="text" value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Add a note about this lead..." className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#C8A96A]" onKeyDown={(e) => e.key === 'Enter' && addNote()} data-testid="note-input" />
          <button onClick={addNote} className="px-4 py-3 bg-[#C8A96A] text-[#04151F] rounded-lg hover:bg-[#d4b87a] transition-all" data-testid="note-add-btn">
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {notes.length === 0 && <p className="text-white/30 text-sm text-center py-6">No notes yet. Add the first one above.</p>}
          {notes.map((note) => (
            <div key={note._id} className="bg-white/5 rounded-lg p-4 group">
              <div className="flex justify-between items-start">
                <p className="text-white text-sm leading-relaxed">{note.text}</p>
                <button onClick={() => deleteNote(note._id)} className="text-white/20 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all ml-2 shrink-0" data-testid={`note-delete-${note._id}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <p className="text-white/30 text-xs mt-2">{note.author} - {new Date(note.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [filteredLeads, setFilteredLeads] = useState([]);
  const [selectedLead, setSelectedLead] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState('submitted_at');
  const [sortDir, setSortDir] = useState('desc');
  const [token, setToken] = useState(() => localStorage.getItem('team_token'));

  const fetchLeads = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/team/leads`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setLeads(data);
      } else if (res.status === 401) {
        localStorage.removeItem('team_token');
        setToken(null);
        setUser(null);
      }
    } catch {}
    setLoading(false);
  }, [token]);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/api/team/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => {
        if (!r.ok) throw new Error('unauthorized');
        return r.json();
      })
      .then(d => { setUser(d); fetchLeads(); })
      .catch(() => { setLoading(false); });
  }, [token, fetchLeads]);

  const handleLogin = (data) => {
    localStorage.setItem('team_token', data.token);
    setToken(data.token);
    setUser(data);
    fetchLeads();
  };

  const logout = () => {
    localStorage.removeItem('team_token');
    setToken(null);
    setUser(null);
  };

  useEffect(() => {
    let filtered = leads;
    if (search) {
      const s = search.toLowerCase();
      filtered = filtered.filter(l =>
        (l.name || '').toLowerCase().includes(s) ||
        (l.email || '').toLowerCase().includes(s) ||
        (l.phone || '').includes(s) ||
        (l.country || '').toLowerCase().includes(s) ||
        (l.city || '').toLowerCase().includes(s) ||
        (l.interest || '').toLowerCase().includes(s)
      );
    }
    if (statusFilter !== 'all') {
      filtered = filtered.filter(l => (l.status || 'new') === statusFilter);
    }
    filtered.sort((a, b) => {
      const av = a[sortField] || '';
      const bv = b[sortField] || '';
      return sortDir === 'asc' ? (av > bv ? 1 : -1) : (av < bv ? 1 : -1);
    });
    setFilteredLeads(filtered);
  }, [leads, search, statusFilter, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  if (loading) return <div className="min-h-screen bg-[#04151F] flex items-center justify-center"><div className="w-8 h-8 border-2 border-[#C8A96A] border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return <TeamLogin onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#04151F]" data-testid="team-dashboard">
      {/* Top bar */}
      <div className="bg-[#04151F] border-b border-white/10 px-4 sm:px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src="/euroadria-logo-white.png" alt="EuroAdria" className="h-8" />
            <span className="text-white/30 text-sm hidden sm:block">Team CRM</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-white/60 text-sm flex items-center gap-1.5"><User className="w-4 h-4" /> {user.name}</span>
            <button onClick={logout} className="text-white/30 hover:text-white/60 transition-all" data-testid="team-logout"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {selectedLead ? (
          <LeadDetail
            lead={selectedLead}
            token={token}
            onBack={() => { setSelectedLead(null); fetchLeads(); }}
            onUpdate={fetchLeads}
          />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Total Leads', value: leads.length, icon: Target },
                { label: 'New', value: leads.filter(l => !l.status || l.status === 'new').length, icon: Clock },
                { label: 'Qualified', value: leads.filter(l => l.status === 'qualified').length, icon: Filter },
                { label: 'Won', value: leads.filter(l => l.status === 'won').length, icon: DollarSign },
              ].map(s => (
                <div key={s.label} className="bg-white/5 border border-white/10 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <s.icon className="w-4 h-4 text-[#C8A96A]" />
                    <span className="text-white/40 text-xs">{s.label}</span>
                  </div>
                  <p className="text-white text-2xl font-bold">{s.value}</p>
                </div>
              ))}
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="team-search" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#C8A96A]" style={{ colorScheme: 'dark' }} data-testid="team-status-filter">
                <option value="all">All Statuses</option>
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {/* Lead Table */}
            <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      {[
                        { field: 'name', label: 'Name' },
                        { field: 'email', label: 'Email' },
                        { field: 'phone', label: 'Phone' },
                        { field: 'interest', label: 'Interest' },
                        { field: 'status', label: 'Status' },
                        { field: 'email_opened', label: 'Email' },
                        { field: 'submitted_at', label: 'Date' },
                      ].map(col => (
                        <th key={col.field} className="text-left text-white/40 font-medium px-4 py-3 cursor-pointer hover:text-white/60 select-none" onClick={() => toggleSort(col.field)}>
                          <span className="flex items-center gap-1">
                            {col.label}
                            {sortField === col.field && (sortDir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                          </span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeads.length === 0 && (
                      <tr><td colSpan={7} className="text-center text-white/30 py-12">No leads found</td></tr>
                    )}
                    {filteredLeads.map((lead) => (
                      <tr key={lead._id} onClick={() => setSelectedLead(lead)} className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-all" data-testid={`lead-row-${lead._id}`}>
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">{lead.name}</p>
                          {lead.country && <p className="text-white/30 text-xs">{[lead.city, lead.country].filter(Boolean).join(', ')}</p>}
                        </td>
                        <td className="px-4 py-3 text-white/60">{lead.email}</td>
                        <td className="px-4 py-3 text-white/60">{lead.phone || '-'}</td>
                        <td className="px-4 py-3 text-white/60">{lead.interest || lead.source || '-'}</td>
                        <td className="px-4 py-3"><StatusBadge status={lead.status || 'new'} /></td>
                        <td className="px-4 py-3">
                          {lead.email_opened
                            ? <span className="text-green-400 text-xs font-medium flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Opened</span>
                            : <span className="text-white/20 text-xs">Not opened</span>
                          }
                        </td>
                        <td className="px-4 py-3 text-white/40">{lead.submitted_at ? new Date(lead.submitted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="border-t border-white/10 px-4 py-3">
                <p className="text-white/30 text-xs">{filteredLeads.length} of {leads.length} leads</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
