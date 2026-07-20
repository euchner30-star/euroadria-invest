import React, { useState, useEffect, useCallback } from 'react';
import { LogOut, Search, ChevronDown, ChevronUp, Phone, Mail, MapPin, Clock, Target, MessageSquare, Plus, Trash2, Edit3, User, Calendar, DollarSign, Filter, Send, X, Settings, TrendingUp, Building } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const STATUSES = [
  { value: 'new', label: 'New', color: 'bg-blue-500' },
  { value: 'contacted', label: 'Contacted', color: 'bg-yellow-500' },
  { value: 'qualified', label: 'Qualified', color: 'bg-purple-500' },
  { value: 'offer', label: 'Offer', color: 'bg-cyan-500' },
  { value: 'negotiation', label: 'Negotiation', color: 'bg-orange-500' },
  { value: 'contract', label: 'Contract', color: 'bg-indigo-500' },
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
  const [propertyValue, setPropertyValue] = useState(lead.property_value || '');
  const [propertyType, setPropertyType] = useState(lead.property_type || '');
  const [propertyLocation, setPropertyLocation] = useState(lead.property_location || '');
  const [commissionAmount, setCommissionAmount] = useState(lead.commission_amount || '');
  const [commissionModels, setCommissionModels] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load commission models
    fetch(`${API}/api/team/commission-models`)
      .then(r => r.ok ? r.json() : {})
      .then(d => setCommissionModels(d));
  }, []);
  const [showEmailComposer, setShowEmailComposer] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [signature, setSignature] = useState('');
  const [sendingEmail, setSendingEmail] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentEmails, setSentEmails] = useState([]);
  const [showSignatureEdit, setShowSignatureEdit] = useState(false);
  const [signatureDraft, setSignatureDraft] = useState('');

  useEffect(() => {
    // Load signature
    fetch(`${API}/api/team/signature`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.signature) setSignature(d.signature); });
    // Load sent emails
    fetch(`${API}/api/team/leads/${lead._id}/emails`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => setSentEmails(d));
  }, [lead._id, token]);

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
      body: JSON.stringify({
        status,
        lead_value: leadValue ? parseFloat(leadValue) : null,
        property_value: propertyValue ? parseFloat(propertyValue) : null,
        property_type: propertyType || null,
        property_location: propertyLocation || null,
      })
    });
    setSaving(false);
    onUpdate();
  };

  const sendEmail = async () => {
    if (!emailSubject.trim() || !emailBody.trim()) return;
    setSendingEmail(true);
    setEmailSent(false);
    try {
      const res = await fetch(`${API}/api/team/leads/${lead._id}/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ subject: emailSubject, body: emailBody, signature })
      });
      if (res.ok) {
        setEmailSent(true);
        setNotes(prev => [{ _id: Date.now(), text: `Email sent: "${emailSubject}"`, author: 'System', created_at: new Date().toISOString() }, ...prev]);
        setSentEmails(prev => [{ subject: emailSubject, body: emailBody, sent_at: new Date().toISOString(), to: lead.email }, ...prev]);
        setTimeout(() => { setShowEmailComposer(false); setEmailSubject(''); setEmailBody(''); setEmailSent(false); }, 1500);
      } else {
        const err = await res.json();
        alert(err.detail || 'Email could not be sent');
      }
    } catch { alert('Connection error'); }
    setSendingEmail(false);
  };

  const saveSignature = async () => {
    await fetch(`${API}/api/team/signature`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ signature: signatureDraft })
    });
    setSignature(signatureDraft);
    setShowSignatureEdit(false);
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

      {/* Deal & Property Details */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Edit3 className="w-4 h-4 text-[#C8A96A]" /> Deal Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-white/40 text-xs mb-1 block">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2.5 bg-[#0a2230] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="lead-status-select">
              {STATUSES.map(s => <option key={s.value} value={s.value} style={{ background: '#0a2230', color: '#fff' }}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">Property Value (EUR)</label>
            <input type="number" value={propertyValue} onChange={(e) => {
              const newVal = e.target.value;
              setPropertyValue(newVal);
              const rate = commissionModels[propertyType];
              if (rate && newVal > 0) {
                setCommissionAmount(Math.round(newVal * rate / 100));
              }
            }} placeholder="e.g. 250000" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="property-value-input" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-white/40 text-xs mb-1 block">Property Type</label>
            <select value={propertyType} onChange={(e) => {
              const newType = e.target.value;
              setPropertyType(newType);
              // Auto-calculate commission if model exists
              const rate = commissionModels[newType];
              if (rate && propertyValue > 0) {
                setCommissionAmount(Math.round(propertyValue * rate / 100));
              }
            }} className="w-full px-3 py-2.5 bg-[#0a2230] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="property-type-select">
              <option value="" style={{ background: '#0a2230', color: '#fff' }}>Select...</option>
              {['Apartment', 'House', 'Villa', 'Land', 'Commercial', 'Hotel', 'Other'].map(t => (
                <option key={t} value={t} style={{ background: '#0a2230', color: '#fff' }}>{t}{commissionModels[t] ? ` (${commissionModels[t]}%)` : ''}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">Property Location</label>
            <input type="text" value={propertyLocation} onChange={(e) => setPropertyLocation(e.target.value)} placeholder="e.g. Budva, Montenegro" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="property-location-input" />
          </div>
          <div>
            <label className="text-white/40 text-xs mb-1 block">Lead Value (EUR)</label>
            <input type="number" value={leadValue} onChange={(e) => setLeadValue(e.target.value)} placeholder="0" className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="lead-value-input" />
          </div>
        </div>
        {/* Commission Display (read-only, set by Admin) */}
        {(lead.commission_amount > 0 || commissionAmount > 0) && (
          <div className="bg-[#C8A96A]/10 border border-[#C8A96A]/20 rounded-lg p-4 mb-4">
            <label className="text-[#C8A96A] text-xs font-bold mb-1 block">Commission (set by Admin)</label>
            <p className="text-white text-lg font-bold">{(lead.commission_amount || 0).toLocaleString('de-DE')} €</p>
            {lead.commission_confirmed && <p className="text-green-400 text-xs mt-1">✓ Confirmed</p>}
          </div>
        )}
        <button onClick={saveChanges} disabled={saving} className="w-full py-2.5 bg-[#C8A96A] text-[#04151F] font-bold rounded-lg text-sm hover:bg-[#d4b87a] transition-all disabled:opacity-50" data-testid="lead-save-btn">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Email Composer */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-bold flex items-center gap-2"><Mail className="w-4 h-4 text-[#C8A96A]" /> Email</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowSignatureEdit(true); setSignatureDraft(signature); }}
              className="text-white/30 hover:text-white/60 transition-all p-1.5 rounded-lg hover:bg-white/5"
              title="Edit signature"
              data-testid="email-signature-edit-btn"
            >
              <Settings className="w-4 h-4" />
            </button>
            {!showEmailComposer ? (
              <button
                onClick={() => setShowEmailComposer(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[#C8A96A] text-[#04151F] text-sm font-bold rounded-lg hover:bg-[#d4b87a] transition-all"
                data-testid="email-compose-btn"
              >
                <Send className="w-4 h-4" />
                Send Email
              </button>
            ) : (
              <button
                onClick={() => { setShowEmailComposer(false); setEmailSubject(''); setEmailBody(''); }}
                className="text-white/30 hover:text-white/60 transition-all"
                data-testid="email-compose-close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Signature Editor Modal */}
        {showSignatureEdit && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowSignatureEdit(false)}>
            <div className="bg-[#0a2230] border border-white/10 rounded-xl p-6 max-w-lg w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-white font-bold">Personal Greeting</h4>
                <button onClick={() => setShowSignatureEdit(false)} className="text-white/30 hover:text-white/60"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-white/40 text-xs mb-3">This text appears above the EuroAdria corporate signature with logo.</p>
              <textarea
                value={signatureDraft}
                onChange={e => setSignatureDraft(e.target.value)}
                placeholder={"Kind regards,\nMilena Bubanja\nSenior Investment Advisor"}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/20 text-sm focus:outline-none focus:border-[#C8A96A] resize-none"
                data-testid="signature-textarea"
              />
              {/* Company signature preview */}
              <div className="mt-4 bg-white/[0.03] border border-white/5 rounded-lg p-4">
                <p className="text-white/20 text-[10px] uppercase tracking-wider mb-2">Corporate signature (auto-attached)</p>
                <div className="flex items-start gap-3">
                  <img src="/euroadria-logo.png" alt="" className="w-20 opacity-50" onError={e => e.target.style.display='none'} />
                  <div className="text-white/30 text-xs leading-relaxed">
                    <p className="font-bold text-white/50">EuroAdria Corporate Solutions</p>
                    <p className="text-[#C8A96A]/50 text-[10px]">euroadria.me</p>
                    <p className="mt-1">a brand of Montaris & Co. d.o.o.</p>
                    <p>Novi Sad | Podgorica | Düsseldorf</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <button onClick={() => setShowSignatureEdit(false)} className="flex-1 py-2.5 text-white/50 text-sm rounded-lg border border-white/10 hover:bg-white/5 transition-all">Cancel</button>
                <button onClick={saveSignature} className="flex-1 py-2.5 bg-[#C8A96A] text-[#04151F] font-bold text-sm rounded-lg hover:bg-[#d4b87a] transition-all" data-testid="signature-save-btn">Save</button>
              </div>
            </div>
          </div>
        )}

        {/* Compose Form */}
        {showEmailComposer && (
          <div className="space-y-3" data-testid="email-composer">
            <div className="bg-white/5 rounded-lg px-4 py-2.5 text-white/40 text-sm">
              An: <span className="text-white/70">{lead.email}</span>
            </div>
            <input
              type="text"
              value={emailSubject}
              onChange={e => setEmailSubject(e.target.value)}
              placeholder="Subject"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#C8A96A]"
              data-testid="email-subject-input"
            />
            <textarea
              value={emailBody}
              onChange={e => setEmailBody(e.target.value)}
              placeholder="Write your message..."
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#C8A96A] resize-none"
              data-testid="email-body-textarea"
            />
            {/* Signature Preview */}
            <div className="bg-white/[0.03] border border-white/5 rounded-lg px-4 py-3">
              {signature && (
                <p className="text-white/50 text-sm whitespace-pre-line mb-3">{signature}</p>
              )}
              <div className="border-t border-[#C8A96A]/30 pt-3 flex items-start gap-3">
                <img src="/euroadria-logo.png" alt="" className="w-16 opacity-40" onError={e => e.target.style.display='none'} />
                <div className="text-white/30 text-xs leading-relaxed">
                  <p className="font-bold text-white/40 text-sm">EuroAdria Corporate Solutions</p>
                  <p className="text-[#C8A96A]/40 text-[10px]">euroadria.me</p>
                  <p className="mt-1">a brand of Montaris & Co. d.o.o.</p>
                  <p>Novi Sad | Podgorica | Düsseldorf</p>
                  <p>Marka Miljanova 12, 21000 Novi Sad</p>
                </div>
              </div>
            </div>
            <button
              onClick={sendEmail}
              disabled={sendingEmail || !emailSubject.trim() || !emailBody.trim()}
              className={`w-full py-3 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 ${
                emailSent
                  ? 'bg-green-500 text-white'
                  : 'bg-[#C8A96A] text-[#04151F] hover:bg-[#d4b87a] disabled:opacity-40'
              }`}
              data-testid="email-send-btn"
            >
              {emailSent ? (
                <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Sent!</>
              ) : sendingEmail ? 'Sending...' : (
                <><Send className="w-4 h-4" /> Send Email</>
              )}
            </button>
          </div>
        )}

        {/* Sent Emails History */}
        {!showEmailComposer && sentEmails.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {sentEmails.map((em, i) => (
              <details key={em._id || i} className="bg-white/5 rounded-lg group" data-testid={`sent-email-${i}`}>
                <summary className="px-4 py-3 flex items-center justify-between cursor-pointer list-none hover:bg-white/10 rounded-lg transition-all">
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{em.subject}</p>
                    <p className="text-white/30 text-xs">{em.sent_at ? new Date(em.sent_at).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : ''}</p>
                  </div>
                  <svg className="w-4 h-4 text-white/20 shrink-0 ml-2 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                </summary>
                <div className="px-4 pb-3 pt-1 border-t border-white/5">
                  <p className="text-white/60 text-sm whitespace-pre-line leading-relaxed">{em.body}</p>
                </div>
              </details>
            ))}
          </div>
        )}
        {!showEmailComposer && sentEmails.length === 0 && (
          <p className="text-white/20 text-sm text-center py-3">No emails sent yet</p>
        )}
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
  const [commissions, setCommissions] = useState(null);
  const [showAddLead, setShowAddLead] = useState(false);
  const [newLead, setNewLead] = useState({ name: '', email: '', phone: '', source: '', interest: '' });
  const [addingLead, setAddingLead] = useState(false);

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

  const fetchCommissions = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/api/team/commissions`, { headers: { 'Authorization': `Bearer ${token}` } });
      if (res.ok) setCommissions(await res.json());
    } catch {}
  }, [token]);

  const addTeamLead = async () => {
    if (!newLead.name.trim() || !newLead.email.trim()) return;
    setAddingLead(true);
    try {
      const res = await fetch(`${API}/api/team/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newLead)
      });
      if (res.ok) {
        setShowAddLead(false);
        setNewLead({ name: '', email: '', phone: '', source: '', interest: '' });
        fetchLeads();
      } else {
        const err = await res.json();
        alert(err.detail || 'Error');
      }
    } catch { alert('Connection error'); }
    setAddingLead(false);
  };

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API}/api/team/me`, { headers: { 'Authorization': `Bearer ${token}` } })
      .then(r => {
        if (!r.ok) throw new Error('unauthorized');
        return r.json();
      })
      .then(d => { setUser(d); fetchLeads(); fetchCommissions(); })
      .catch(() => { setLoading(false); });
  }, [token, fetchLeads]);

  const handleLogin = (data) => {
    localStorage.setItem('team_token', data.token);
    setToken(data.token);
    setUser(data);
    fetchLeads();
    fetchCommissions();
  };

  const logout = () => {
    localStorage.removeItem('team_token');
    setToken(null);
    setUser(null);
  };

  // Auto-logout after 30 min inactivity
  useEffect(() => {
    if (!user) return;
    let timer;
    const TIMEOUT = 30 * 60 * 1000;
    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        logout();
        alert('Session expired due to inactivity');
      }, TIMEOUT);
    };
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(e => window.addEventListener(e, resetTimer));
    resetTimer();
    return () => {
      clearTimeout(timer);
      events.forEach(e => window.removeEventListener(e, resetTimer));
    };
  }, [user]);

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
            <button onClick={() => setShowAddLead(true)} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C8A96A] text-[#04151F] text-sm font-bold rounded-lg hover:bg-[#d4b87a] transition-all" data-testid="team-add-lead-btn">
              <Plus className="w-4 h-4" /> Lead
            </button>
            <span className="text-white/60 text-sm flex items-center gap-1.5"><User className="w-4 h-4" /> {user.name}</span>
            <button onClick={logout} className="text-white/30 hover:text-white/60 transition-all" data-testid="team-logout"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Add Lead Modal */}
        {showAddLead && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setShowAddLead(false)}>
            <div className="bg-[#0a2230] border border-white/10 rounded-xl p-6 max-w-md w-full" onClick={e => e.stopPropagation()} data-testid="team-add-lead-modal">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-white font-bold text-lg">Add New Lead</h3>
                <button onClick={() => setShowAddLead(false)} className="text-white/30 hover:text-white/60"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/40 text-xs mb-1 block">Name *</label>
                    <input type="text" value={newLead.name} onChange={e => setNewLead(p => ({ ...p, name: e.target.value }))} placeholder="Full Name" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="team-new-lead-name" />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1 block">Email *</label>
                    <input type="email" value={newLead.email} onChange={e => setNewLead(p => ({ ...p, email: e.target.value }))} placeholder="email@example.com" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="team-new-lead-email" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-white/40 text-xs mb-1 block">Phone</label>
                    <input type="text" value={newLead.phone} onChange={e => setNewLead(p => ({ ...p, phone: e.target.value }))} placeholder="+49..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="team-new-lead-phone" />
                  </div>
                  <div>
                    <label className="text-white/40 text-xs mb-1 block">Interest</label>
                    <input type="text" value={newLead.interest} onChange={e => setNewLead(p => ({ ...p, interest: e.target.value }))} placeholder="e.g. Villa in Budva" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="team-new-lead-interest" />
                  </div>
                </div>
                <button
                  onClick={addTeamLead}
                  disabled={!newLead.name.trim() || !newLead.email.trim() || addingLead}
                  className="w-full py-2.5 bg-[#C8A96A] text-[#04151F] font-bold text-sm rounded-lg hover:bg-[#d4b87a] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                  data-testid="team-new-lead-submit"
                >
                  {addingLead ? 'Saving...' : <><Plus className="w-4 h-4" /> Add Lead</>}
                </button>
              </div>
            </div>
          </div>
        )}

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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {[
                { label: 'Total Leads', value: leads.length, icon: Target },
                { label: 'New', value: leads.filter(l => !l.status || l.status === 'new').length, icon: Clock },
                { label: 'In Pipeline', value: leads.filter(l => ['contacted', 'qualified', 'offer', 'negotiation', 'contract'].includes(l.status)).length, icon: Filter },
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

            {/* Commission Overview */}
            {commissions && (commissions.total_pipeline_value > 0 || commissions.deals?.length > 0) && (
              <div className="bg-gradient-to-r from-[#C8A96A]/10 to-transparent border border-[#C8A96A]/20 rounded-xl p-5 mb-6">
                <h3 className="text-[#C8A96A] font-bold text-sm mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Commission Overview</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <p className="text-white/40 text-xs">Pipeline Value</p>
                    <p className="text-white font-bold text-lg">{commissions.total_pipeline_value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Won Value</p>
                    <p className="text-green-400 font-bold text-lg">{commissions.total_won_value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Commission Pending</p>
                    <p className="text-yellow-400 font-bold text-lg">{commissions.total_commission_pending.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</p>
                  </div>
                  <div>
                    <p className="text-white/40 text-xs">Commission Confirmed</p>
                    <p className="text-green-400 font-bold text-lg">{commissions.total_commission_confirmed.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</p>
                  </div>
                </div>
                {/* Team Leader Bonus */}
                {commissions.total_team_commission > 0 && (
                  <div className="mt-3 bg-amber-500/10 border border-amber-500/20 rounded-lg p-3 flex items-center justify-between">
                    <span className="text-amber-400 text-sm font-medium">Team Leader Bonus ({commissions.teamleader_rate}%)</span>
                    <span className="text-white font-bold text-lg">{commissions.total_team_commission.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</span>
                  </div>
                )}
                {commissions.deals?.length > 0 && (
                  <div className="mt-4 space-y-2 max-h-48 overflow-y-auto">
                    {commissions.deals.map((d, i) => (
                      <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                        <div className="flex items-center gap-3">
                          <Building className="w-4 h-4 text-white/30" />
                          <div>
                            <p className="text-white text-sm font-medium">{d.name}</p>
                            <p className="text-white/30 text-xs">{d.property_type} {d.property_location ? `· ${d.property_location}` : ''} {d.type === 'team' ? <span className="text-amber-400">· Team Deal</span> : ''}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white text-sm font-bold">{d.property_value.toLocaleString('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}</p>
                          <p className={`text-xs font-medium ${d.confirmed ? 'text-green-400' : d.status === 'won' ? 'text-yellow-400' : 'text-white/30'}`}>
                            {d.confirmed ? `✓ ${d.commission.toLocaleString('de-DE')} €` : d.status === 'won' ? `⏳ ${d.commission.toLocaleString('de-DE')} €` : d.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input type="text" placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="team-search" />
              </div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-3 bg-[#0a2230] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="team-status-filter">
                <option value="all" style={{ background: '#0a2230', color: '#fff' }}>All Statuses</option>
                {STATUSES.map(s => <option key={s.value} value={s.value} style={{ background: '#0a2230', color: '#fff' }}>{s.label}</option>)}
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
                        { field: 'property_value', label: 'Value' },
                        { field: 'status', label: 'Status' },
                        { field: 'interest', label: 'Interest' },
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
                      <tr><td colSpan={6} className="text-center text-white/30 py-12">No leads found</td></tr>
                    )}
                    {filteredLeads.map((lead) => (
                      <tr key={lead._id} onClick={() => setSelectedLead(lead)} className="border-b border-white/5 hover:bg-white/5 cursor-pointer transition-all" data-testid={`lead-row-${lead._id}`}>
                        <td className="px-4 py-3">
                          <p className="text-white font-medium">{lead.name}</p>
                          {lead.country && <p className="text-white/30 text-xs">{[lead.city, lead.country].filter(Boolean).join(', ')}</p>}
                        </td>
                        <td className="px-4 py-3 text-white/60">{lead.email}</td>
                        <td className="px-4 py-3">
                          {lead.property_value
                            ? <span className="text-[#C8A96A] font-medium">{Number(lead.property_value).toLocaleString('de-DE')} €</span>
                            : <span className="text-white/20">-</span>
                          }
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={lead.status || 'new'} /></td>
                        <td className="px-4 py-3 text-white/60">{lead.interest || lead.source || '-'}</td>
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
