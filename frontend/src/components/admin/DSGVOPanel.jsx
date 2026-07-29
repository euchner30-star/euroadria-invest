import React, { useState } from 'react';
import { Search, Shield, Trash2, Download, AlertTriangle, ChevronDown, ChevronUp, User, Mail, Phone, FileText, Clock, MessageSquare } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const SECTION_ICONS = {
  leads: { icon: User, label: 'Leads / Anfragen' },
  newsletter: { icon: Mail, label: 'Newsletter' },
  contact_submissions: { icon: MessageSquare, label: 'Kontaktformular' },
  emails_received: { icon: Mail, label: 'Erhaltene E-Mails' },
  email_tracking: { icon: Clock, label: 'E-Mail Tracking (Opens)' },
  download_links: { icon: Download, label: 'Download-Links' },
  notes: { icon: FileText, label: 'Notizen' },
  crm_deals: { icon: FileText, label: 'CRM Deals' },
  comments: { icon: MessageSquare, label: 'Kommentare' },
  team_member: { icon: User, label: 'Team-Mitglied' },
};

export default function DSGVOPanel({ credentials }) {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleted, setDeleted] = useState(null);
  const [expanded, setExpanded] = useState({});

  const authHeader = { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) };

  const lookup = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setResult(null);
    setDeleted(null);
    try {
      const res = await fetch(`${API}/api/admin/dsgvo/lookup?email=${encodeURIComponent(email.trim())}`, { headers: authHeader });
      if (res.ok) setResult(await res.json());
    } catch {}
    setLoading(false);
  };

  const deleteAll = async () => {
    if (!window.confirm(`ACHTUNG: Alle Daten für "${email}" werden UNWIDERRUFLICH gelöscht. Fortfahren?`)) return;
    if (!window.confirm('Sind Sie WIRKLICH sicher? Dies kann nicht rückgängig gemacht werden.')) return;
    setDeleting(true);
    try {
      const res = await fetch(`${API}/api/admin/dsgvo/delete?email=${encodeURIComponent(email.trim())}`, { method: 'DELETE', headers: authHeader });
      if (res.ok) {
        const data = await res.json();
        setDeleted(data);
        setResult(null);
      }
    } catch {}
    setDeleting(false);
  };

  const exportJSON = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dsgvo-auskunft-${email.replace('@', '_at_')}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6" data-testid="dsgvo-panel">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
          <Shield className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-ea-dark">DSGVO / Datenschutz</h2>
          <p className="text-sm text-ea-dark/40">Auskunftsrecht & Recht auf Löschung</p>
        </div>
      </div>

      {/* Backup */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-base font-semibold text-ea-dark">Datenbank-Backup</h3>
            <p className="text-sm text-ea-dark/40">Komplettes Backup aller Daten als JSON herunterladen.</p>
          </div>
          <button
            onClick={() => {
              const a = document.createElement('a');
              a.href = `${API}/api/admin/backup`;
              a.setAttribute('download', '');
              const auth = btoa(`${credentials.username}:${credentials.password}`);
              fetch(`${API}/api/admin/backup`, { headers: { 'Authorization': `Basic ${auth}` } })
                .then(r => r.blob())
                .then(blob => {
                  const url = URL.createObjectURL(blob);
                  a.href = url;
                  a.download = `euroadria-backup-${new Date().toISOString().split('T')[0]}.json`;
                  a.click();
                  URL.revokeObjectURL(url);
                });
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-ea-dark text-white text-sm font-bold rounded-lg hover:bg-ea-dark/90 transition-all"
            data-testid="backup-btn"
          >
            <Download className="w-4 h-4" /> Backup herunterladen
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-semibold text-ea-dark mb-3">Personenbezogene Daten abfragen</h3>
        <p className="text-sm text-ea-dark/50 mb-4">E-Mail eingeben um alle gespeicherten Daten dieser Person anzuzeigen.</p>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ea-dark/30" />
            <input
              type="email"
              placeholder="email@beispiel.de"
              value={email}
              onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && lookup()}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#C8A96A]"
              data-testid="dsgvo-email-input"
            />
          </div>
          <button
            onClick={lookup}
            disabled={!email.trim() || loading}
            className="px-6 py-3 bg-ea-dark text-white text-sm font-bold rounded-lg hover:bg-ea-dark/90 disabled:opacity-40 transition-all"
            data-testid="dsgvo-lookup-btn"
          >
            {loading ? 'Suche...' : 'Daten abfragen'}
          </button>
        </div>
      </div>

      {/* Deleted confirmation */}
      {deleted && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h3 className="text-green-700 font-bold mb-2">Löschung durchgeführt</h3>
          <p className="text-green-600 text-sm mb-3">{deleted.total_deleted} Datensätze für <strong>{deleted.email}</strong> gelöscht.</p>
          {Object.entries(deleted.deleted || {}).map(([key, count]) => (
            <p key={key} className="text-green-600/70 text-xs">• {SECTION_ICONS[key]?.label || key}: {count} Einträge gelöscht</p>
          ))}
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="text-base font-semibold text-ea-dark">Ergebnis für: <span className="text-[#C8A96A]">{result.email}</span></h3>
                <p className="text-sm text-ea-dark/50 mt-1">
                  {result.total_records > 0
                    ? `${result.total_records} Datensätze in ${result.collections_with_data.length} Bereichen gefunden`
                    : 'Keine Daten zu dieser E-Mail gefunden'
                  }
                </p>
              </div>
              {result.total_records > 0 && (
                <div className="flex gap-2">
                  <button onClick={exportJSON} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-xs font-medium rounded-lg hover:bg-blue-100 transition-all" data-testid="dsgvo-export">
                    <Download className="w-3.5 h-3.5" /> JSON Export
                  </button>
                  <button onClick={deleteAll} disabled={deleting} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 text-xs font-medium rounded-lg hover:bg-red-100 transition-all disabled:opacity-40" data-testid="dsgvo-delete">
                    <Trash2 className="w-3.5 h-3.5" /> {deleting ? 'Löscht...' : 'Alle Daten löschen'}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Data sections */}
          {Object.entries(result.data).map(([key, value]) => {
            const config = SECTION_ICONS[key] || { icon: FileText, label: key };
            const Icon = config.icon;
            const items = Array.isArray(value) ? value : [value];
            const isOpen = expanded[key];

            return (
              <div key={key} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setExpanded(p => ({ ...p, [key]: !p[key] }))}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-[#C8A96A]" />
                    <span className="font-semibold text-sm text-ea-dark">{config.label}</span>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-ea-dark/50">{items.length}</span>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-ea-dark/30" /> : <ChevronDown className="w-4 h-4 text-ea-dark/30" />}
                </button>
                {isOpen && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-3 max-h-96 overflow-y-auto">
                    {items.map((item, i) => (
                      <div key={i} className="bg-white rounded-lg border border-gray-100 p-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {Object.entries(item).filter(([k]) => k !== '_id' && k !== 'password').map(([k, v]) => (
                            <div key={k} className="text-xs">
                              <span className="text-ea-dark/40 font-medium">{k}:</span>{' '}
                              <span className="text-ea-dark">{typeof v === 'object' ? JSON.stringify(v) : String(v || '–')}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Warning */}
          {result.total_records > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-700">Hinweis zur Löschung</p>
                <p className="text-xs text-amber-600 mt-1">Bei "Alle Daten löschen" werden sämtliche Datensätze dieser Person unwiderruflich aus der Datenbank entfernt. Dies umfasst Leads, E-Mails, Notizen, Newsletter-Anmeldungen und Tracking-Daten. Erstellen Sie vorher einen JSON-Export als Nachweis.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
