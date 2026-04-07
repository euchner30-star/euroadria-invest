import React, { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import {
  Users, DollarSign, TrendingUp, Target, ArrowRight, Plus, Edit2, Trash2, Save,
  Loader2, GripVertical, Phone, Mail, Calendar, ChevronDown, X, AlertCircle, Check
} from 'lucide-react';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const fmt = (v) => new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', minimumFractionDigits: 0 }).format(v || 0);

const SOURCE_LABELS = {
  kontaktformular: 'Kontaktformular', google: 'Google', instagram: 'Instagram',
  linkedin: 'LinkedIn', tiktok: 'TikTok', direct: 'Direkt', referral: 'Empfehlung',
  expose_download: 'Exposé', website: 'Website', facebook: 'Facebook'
};

// ========================
// KPI Card Component
// ========================
const KPI = ({ label, value, sub, icon: Icon, color = 'text-ea-gold' }) => (
  <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5" data-testid={`kpi-${label.toLowerCase().replace(/\s/g, '-')}`}>
    <div className="flex items-center justify-between mb-1 sm:mb-2">
      <span className="text-[10px] sm:text-xs font-medium text-ea-dark/40 uppercase tracking-wider truncate mr-1">{label}</span>
      {Icon && <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${color} shrink-0`} />}
    </div>
    <p className="text-base sm:text-2xl font-bold text-ea-dark truncate">{value}</p>
    {sub && <p className="text-[10px] sm:text-xs text-ea-dark/50 mt-1 truncate">{sub}</p>}
  </div>
);

// ========================
// PIPELINE KANBAN VIEW
// ========================
export const PipelineView = ({ credentials }) => {
  const [stages, setStages] = useState([]);
  const [deals, setDeals] = useState([]);
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewLead, setShowNewLead] = useState(false);
  const [editDeal, setEditDeal] = useState(null);
  const [migrating, setMigrating] = useState(false);
  const authHeader = 'Basic ' + btoa(`${credentials.username}:${credentials.password}`);

  const fetchAll = useCallback(async () => {
    try {
      const [stagesRes, dealsRes, leadsRes] = await Promise.all([
        fetch(`${API_URL}/api/admin/crm/stages`, { headers: { Authorization: authHeader } }),
        fetch(`${API_URL}/api/admin/crm/deals`, { headers: { Authorization: authHeader } }),
        fetch(`${API_URL}/api/admin/crm/leads`, { headers: { Authorization: authHeader } })
      ]);
      setStages(await stagesRes.json());
      setDeals(await dealsRes.json());
      setLeads(await leadsRes.json());
    } catch (err) {
      console.error('CRM fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, [authHeader]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const moveDeal = async (dealId, newStage) => {
    await fetch(`${API_URL}/api/admin/crm/deals/${dealId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify({ stage: newStage })
    });
    fetchAll();
  };

  const updateDealValue = async (dealId, value, notes) => {
    await fetch(`${API_URL}/api/admin/crm/deals/${dealId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify({ deal_value: parseFloat(value) || 0, notes: notes || null })
    });
    setEditDeal(null);
    fetchAll();
  };

  const deleteDeal = async (dealId) => {
    if (!window.confirm('Deal wirklich löschen?')) return;
    await fetch(`${API_URL}/api/admin/crm/deals/${dealId}`, {
      method: 'DELETE', headers: { Authorization: authHeader }
    });
    fetchAll();
  };

  const migrateLeads = async () => {
    setMigrating(true);
    try {
      const res = await fetch(`${API_URL}/api/admin/crm/migrate`, {
        method: 'POST', headers: { Authorization: authHeader }
      });
      const data = await res.json();
      alert(`${data.migrated} Leads migriert. Gesamt: ${data.total_crm_leads}`);
      fetchAll();
    } catch (err) {
      console.error('Migration failed:', err);
    } finally {
      setMigrating(false);
    }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-ea-gold animate-spin" /></div>;

  const activeStages = stages.filter(s => s.id !== 'lost');

  return (
    <div className="space-y-6" data-testid="pipeline-view">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg sm:text-xl font-bold text-ea-dark">Sales Pipeline</h2>
        <div className="flex gap-2">
          <button onClick={migrateLeads} disabled={migrating}
            className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-gray-100 text-ea-dark/70 rounded-lg text-[10px] sm:text-xs font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
            data-testid="migrate-leads-btn">
            {migrating ? <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" /> : <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            <span className="hidden sm:inline">Alte Leads importieren</span>
            <span className="sm:hidden">Import</span>
          </button>
          <button onClick={() => setShowNewLead(true)}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-ea-gold text-ea-dark font-semibold rounded-lg text-xs sm:text-sm hover:bg-ea-gold/80 transition-all"
            data-testid="add-lead-btn">
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Neuer Lead</span><span className="sm:hidden">Neu</span>
          </button>
        </div>
      </div>

      {/* New Lead Form */}
      {showNewLead && <NewLeadForm authHeader={authHeader} onClose={() => setShowNewLead(false)} onCreated={fetchAll} />}

      {/* Kanban Board */}
      <div className="overflow-x-auto pb-4 -mx-2 px-2">
        <div className="flex gap-3 sm:gap-4 min-w-max">
          {activeStages.map(stage => {
            const stageDeals = deals.filter(d => d.stage === stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + (d.deal_value || 0), 0);
            return (
              <div key={stage.id} className="w-56 sm:w-72 shrink-0" data-testid={`stage-${stage.id}`}>
                {/* Stage Header */}
                <div className="flex items-center justify-between mb-2 sm:mb-3 px-1">
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
                    <span className="font-semibold text-xs sm:text-sm text-ea-dark truncate">{stage.name}</span>
                    <span className="bg-gray-100 text-ea-dark/50 text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full font-medium shrink-0">{stageDeals.length}</span>
                  </div>
                  <span className="text-[10px] sm:text-xs text-ea-dark/40 shrink-0 ml-1">{stage.probability}%</span>
                </div>
                {stageValue > 0 && (
                  <p className="text-xs text-ea-dark/40 mb-2 px-1">{fmt(stageValue)}</p>
                )}

                {/* Deal Cards */}
                <div className="space-y-2 min-h-[80px] bg-gray-50 rounded-xl p-2">
                  {stageDeals.map(deal => (
                    <DealCard
                      key={deal.id}
                      deal={deal}
                      stages={activeStages}
                      currentStage={stage}
                      onMove={moveDeal}
                      onEdit={() => setEditDeal(deal)}
                      onDelete={() => deleteDeal(deal.id)}
                    />
                  ))}
                  {stageDeals.length === 0 && (
                    <p className="text-xs text-ea-dark/30 text-center py-6">Keine Deals</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Edit Deal Modal */}
      {editDeal && (
        <EditDealModal deal={editDeal} onSave={updateDealValue} onClose={() => setEditDeal(null)} />
      )}

      {/* Lost Deals */}
      {deals.filter(d => d.stage === 'lost').length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h3 className="text-sm font-semibold text-ea-dark/40 mb-3">Verloren ({deals.filter(d => d.stage === 'lost').length})</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {deals.filter(d => d.stage === 'lost').map(deal => (
              <div key={deal.id} className="bg-gray-50 border border-gray-100 rounded-lg p-3 opacity-60 hover:opacity-90 transition-opacity flex items-center justify-between group">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ea-dark truncate">{deal.lead?.name || 'Unbekannt'}</p>
                  <p className="text-xs text-ea-dark/40">{fmt(deal.deal_value)}</p>
                </div>
                <button onClick={() => deleteDeal(deal.id)}
                  className="p-1.5 text-ea-dark/20 hover:text-red-500 transition-colors shrink-0 sm:opacity-0 sm:group-hover:opacity-100"
                  data-testid={`delete-lost-${deal.id}`}>
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ========================
// DEAL CARD
// ========================
const DealCard = ({ deal, stages, currentStage, onMove, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);
  const lead = deal.lead || {};
  const currentIdx = stages.findIndex(s => s.id === currentStage.id);
  const nextStage = stages[currentIdx + 1];
  const prevStage = currentIdx > 0 ? stages[currentIdx - 1] : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all relative group"
      data-testid={`deal-card-${deal.id}`}>
      <div className="flex items-start justify-between mb-2">
        <div className="min-w-0">
          <p className="font-semibold text-sm text-ea-dark truncate">{lead.name || 'Unbekannt'}</p>
          <p className="text-xs text-ea-dark/40">{SOURCE_LABELS[lead.lead_source] || lead.lead_source}</p>
        </div>
        <button onClick={() => setShowActions(!showActions)} className="p-1 text-ea-dark/30 hover:text-ea-dark transition-colors">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center justify-between mb-2">
        <span className="text-lg font-bold text-ea-dark">{fmt(deal.deal_value)}</span>
        {deal.expected_revenue > 0 && deal.expected_revenue !== deal.deal_value && (
          <span className="text-xs text-ea-gold font-medium">{fmt(deal.expected_revenue)} erw.</span>
        )}
      </div>

      {lead.email && (
        <div className="flex items-center gap-1.5 text-xs text-ea-dark/40 mb-1">
          <Mail className="w-3 h-3" /> {lead.email}
        </div>
      )}
      {lead.phone && (
        <div className="flex items-center gap-1.5 text-xs text-ea-dark/40 mb-1">
          <Phone className="w-3 h-3" /> {lead.phone}
        </div>
      )}
      {deal.notes && (
        <p className="text-xs text-ea-dark/50 mt-2 bg-gray-50 rounded p-2 line-clamp-2">{deal.notes}</p>
      )}

      {/* Quick Actions */}
      {showActions && (
        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-1.5">
          {prevStage && (
            <button onClick={() => onMove(deal.id, prevStage.id)}
              className="flex-1 text-xs py-1.5 rounded bg-gray-100 text-ea-dark/60 hover:bg-gray-200 transition-colors truncate px-1">
              {prevStage.name}
            </button>
          )}
          {nextStage && (
            <button onClick={() => onMove(deal.id, nextStage.id)}
              className="flex-1 text-xs py-1.5 rounded bg-ea-gold/10 text-ea-gold font-medium hover:bg-ea-gold/20 transition-colors truncate px-1">
              {nextStage.name}
            </button>
          )}
          <button onClick={onEdit} className="p-1.5 text-ea-dark/40 hover:text-ea-gold transition-colors">
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onMove(deal.id, 'lost')} className="p-1.5 text-ea-dark/40 hover:text-red-500 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};

// ========================
// NEW LEAD FORM
// ========================
const NewLeadForm = ({ authHeader, onClose, onCreated }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', lead_source: 'direct', tool_used: '' });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!form.name || !form.email) return;
    setSaving(true);
    await fetch(`${API_URL}/api/admin/crm/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: authHeader },
      body: JSON.stringify(form)
    });
    setSaving(false);
    onCreated();
    onClose();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5 shadow-sm space-y-3 sm:space-y-4" data-testid="new-lead-form">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-ea-dark text-sm sm:text-base">Neuer Lead</h3>
        <button onClick={onClose} className="text-ea-dark/40 hover:text-ea-dark"><X className="w-4 h-4" /></button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
        <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          placeholder="Name *" className="border border-gray-200 rounded-lg px-3 py-2 sm:py-2.5 text-sm focus:outline-none focus:border-ea-gold" data-testid="lead-name-input" />
        <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
          placeholder="E-Mail *" className="border border-gray-200 rounded-lg px-3 py-2 sm:py-2.5 text-sm focus:outline-none focus:border-ea-gold" data-testid="lead-email-input" />
        <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
          placeholder="Telefon" className="border border-gray-200 rounded-lg px-3 py-2 sm:py-2.5 text-sm focus:outline-none focus:border-ea-gold" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
        <select value={form.lead_source} onChange={e => setForm(f => ({ ...f, lead_source: e.target.value }))}
          className="border border-gray-200 rounded-lg px-3 py-2 sm:py-2.5 text-sm focus:outline-none focus:border-ea-gold">
          <option value="direct">Direkt</option>
          <option value="google">Google</option>
          <option value="instagram">Instagram</option>
          <option value="linkedin">LinkedIn</option>
          <option value="facebook">Facebook</option>
          <option value="tiktok">TikTok</option>
          <option value="referral">Empfehlung</option>
          <option value="kontaktformular">Kontaktformular</option>
        </select>
        <input value={form.tool_used} onChange={e => setForm(f => ({ ...f, tool_used: e.target.value }))}
          placeholder="Tool (z.B. ROI Rechner, Blog)" className="border border-gray-200 rounded-lg px-3 py-2 sm:py-2.5 text-sm focus:outline-none focus:border-ea-gold" />
      </div>
      <button onClick={handleSubmit} disabled={saving || !form.name || !form.email}
        className="flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-ea-gold text-ea-dark font-semibold rounded-lg text-xs sm:text-sm hover:bg-ea-gold/80 disabled:opacity-50 transition-all"
        data-testid="save-lead-btn">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Lead erstellen
      </button>
    </div>
  );
};

// ========================
// EDIT DEAL MODAL
// ========================
const EditDealModal = ({ deal, onSave, onClose }) => {
  const [value, setValue] = useState(deal.deal_value || 0);
  const [notes, setNotes] = useState(deal.notes || '');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" data-testid="edit-deal-modal">
      <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-ea-dark">Deal bearbeiten</h3>
          <button onClick={onClose}><X className="w-5 h-5 text-ea-dark/40" /></button>
        </div>
        <p className="text-sm text-ea-dark/60">{deal.lead?.name} — {deal.lead?.email}</p>
        <div>
          <label className="block text-sm font-medium text-ea-dark mb-1">Deal-Wert (EUR)</label>
          <input type="number" value={value} onChange={e => setValue(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold"
            data-testid="deal-value-input" />
        </div>
        <div>
          <label className="block text-sm font-medium text-ea-dark mb-1">Notizen</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold resize-none" />
        </div>
        <div className="flex gap-2">
          <button onClick={() => onSave(deal.id, value, notes)}
            className="flex items-center gap-2 px-5 py-2.5 bg-ea-gold text-ea-dark font-semibold rounded-lg text-sm hover:bg-ea-gold/80 transition-all"
            data-testid="save-deal-btn">
            <Save className="w-4 h-4" /> Speichern
          </button>
          <button onClick={onClose} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm text-ea-dark/60 hover:bg-gray-50">
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
};

// ========================
// REVENUE DASHBOARD
// ========================
export const RevenueDashboard = ({ credentials }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const authHeader = 'Basic ' + btoa(`${credentials.username}:${credentials.password}`);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/crm/stats`, { headers: { Authorization: authHeader } });
        if (res.ok) setStats(await res.json());
      } catch (err) {
        console.error('Stats fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [authHeader]);

  if (loading) return <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-ea-gold animate-spin" /></div>;
  if (!stats) return <div className="text-center py-16 text-ea-dark/50">Keine Daten</div>;

  const COLORS = ['#c8a96a', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#F97316', '#6B7280'];

  const sourceData = Object.entries(stats.by_source || {}).map(([key, val]) => ({
    name: SOURCE_LABELS[key] || key, value: val
  }));

  const stageData = Object.entries(stats.by_stage || {}).map(([key, val]) => {
    const stageDef = [
      { id: 'new_lead', name: 'Neuer Lead' }, { id: 'qualified', name: 'Qualifiziert' },
      { id: 'call_scheduled', name: 'Termin' }, { id: 'consultation_done', name: 'Erstgespräch' },
      { id: 'offer_sent', name: 'Angebot' }, { id: 'negotiation', name: 'Verhandlung' },
      { id: 'won', name: 'Gewonnen' }, { id: 'lost', name: 'Verloren' }
    ].find(s => s.id === key);
    return { name: stageDef?.name || key, count: val.count, value: val.value, expected: val.expected };
  });

  return (
    <div className="space-y-6" data-testid="revenue-dashboard">
      <h2 className="text-lg sm:text-xl font-bold text-ea-dark">Revenue Dashboard</h2>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
        <KPI label="Leads" value={stats.total_leads} icon={Users} />
        <KPI label="Aktive Deals" value={stats.active_deals} icon={Target} color="text-blue-500" />
        <KPI label="Pipeline-Wert" value={fmt(stats.pipeline_value)} icon={DollarSign} />
        <KPI label="Erw. Revenue" value={fmt(stats.expected_revenue)} icon={TrendingUp} sub={`Gewonnen: ${fmt(stats.won_revenue)}`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        <KPI label="Gewonnene Deals" value={stats.won_deals} sub={fmt(stats.won_revenue)} color="text-green-500" />
        <KPI label="Verlorene Deals" value={stats.lost_deals} color="text-red-500" />
        <KPI label="Conversion Rate" value={`${stats.conversion_rate}%`} icon={TrendingUp}
          sub={`${stats.won_deals} von ${stats.total_leads} Leads`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Revenue by Stage */}
        {stageData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5">
            <h3 className="font-semibold text-ea-dark text-xs sm:text-sm mb-3 sm:mb-4">Pipeline nach Phase</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={stageData} margin={{ top: 5, right: 5, left: -15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" height={50} interval={0} />
                <YAxis tick={{ fontSize: 9 }} width={45} />
                <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="value" fill="#c8a96a" radius={[4, 4, 0, 0]} name="Deal-Wert" />
                <Bar dataKey="expected" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Erw. Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Leads by Source */}
        {sourceData.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-5">
            <h3 className="font-semibold text-ea-dark text-xs sm:text-sm mb-3 sm:mb-4">Leads nach Quelle</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%"
                  outerRadius={65} innerRadius={35} paddingAngle={2} label={false}>
                  {sourceData.map((_, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3 px-1">
              {sourceData.map((entry, idx) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-xs text-ea-dark/70">{entry.name}: <strong>{entry.value}</strong></span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {stats.total_leads === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <AlertCircle className="w-10 h-10 text-ea-dark/20 mx-auto mb-3" />
          <p className="text-ea-dark/50">Noch keine CRM-Daten vorhanden.</p>
          <p className="text-ea-dark/40 text-sm mt-1">Erstellen Sie einen Lead oder importieren Sie bestehende Leads in der Pipeline-Ansicht.</p>
        </div>
      )}
    </div>
  );
};
