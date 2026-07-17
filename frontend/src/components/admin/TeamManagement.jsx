import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit3, Trash2, X, DollarSign, Check, Download, Shield, UserCheck } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const ROLES = [
  { value: 'member', label: 'Full Access', desc: 'Sees all leads' },
  { value: 'teamleader', label: 'Team Leader', desc: 'Sees own + team leads, earns team commission' },
  { value: 'restricted', label: 'Restricted', desc: 'Only assigned leads' },
];

export default function TeamManagement({ credentials }) {
  const [members, setMembers] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editMember, setEditMember] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'restricted', commission_rate: 3.0 });
  const [saving, setSaving] = useState(false);
  const [commModels, setCommModels] = useState([]);
  const [showModels, setShowModels] = useState(false);

  const authHeader = { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [mRes, cRes, cmRes] = await Promise.all([
        fetch(`${API}/api/admin/team-members`, { headers: authHeader }),
        fetch(`${API}/api/admin/commissions`, { headers: authHeader }),
        fetch(`${API}/api/admin/commission-models`, { headers: authHeader }),
      ]);
      if (mRes.ok) setMembers(await mRes.json());
      if (cRes.ok) setCommissions(await cRes.json());
      if (cmRes.ok) setCommModels(await cmRes.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const createMember = async () => {
    if (!form.name || !form.email || !form.password) return;
    setSaving(true);
    const res = await fetch(`${API}/api/admin/team-members`, {
      method: 'POST',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setShowAdd(false);
      setForm({ name: '', email: '', password: '', role: 'restricted', commission_rate: 3.0 });
      fetchData();
    } else {
      const err = await res.json();
      alert(err.detail || 'Error');
    }
    setSaving(false);
  };

  const updateMember = async () => {
    if (!editMember) return;
    setSaving(true);
    await fetch(`${API}/api/admin/team-members/${editMember.email}`, {
      method: 'PUT',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editMember.name,
        role: editMember.role,
        commission_rate: editMember.commission_rate,
        reports_to: editMember.reports_to || null,
        teamleader_commission_rate: editMember.teamleader_commission_rate || 0,
      })
    });
    setEditMember(null);
    fetchData();
    setSaving(false);
  };

  const deleteMember = async (email, name) => {
    if (!window.confirm(`"${name}" wirklich löschen?`)) return;
    await fetch(`${API}/api/admin/team-members/${email}`, { method: 'DELETE', headers: authHeader });
    fetchData();
  };

  const confirmCommission = async (leadId) => {
    await fetch(`${API}/api/admin/leads/${leadId}/confirm-commission`, { method: 'PUT', headers: authHeader });
    fetchData();
  };

  const saveCommModels = async () => {
    setSaving(true);
    await fetch(`${API}/api/admin/commission-models`, {
      method: 'PUT',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify(commModels.filter(m => m.property_type && m.commission_rate > 0))
    });
    setSaving(false);
  };

  const exportCommissionsCSV = () => {
    if (!commissions.length) return;
    const headers = ['Member', 'Email', 'Lead', 'Property Value', 'Property Type', 'Location', 'Commission', 'Status', 'Confirmed'];
    const rows = commissions.map(c => [
      c.member_name, c.member_email, c.lead_name, c.property_value, c.property_type, c.property_location,
      c.commission_amount, c.status, c.confirmed ? 'Yes' : 'No'
    ]);
    const csv = '\uFEFF' + [headers, ...rows].map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `euroadria-commissions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-ea-gold border-t-transparent rounded-full animate-spin" /></div>;

  const totalPending = commissions.filter(c => c.status === 'won' && !c.confirmed).reduce((s, c) => s + (c.commission_amount || 0), 0);
  const totalConfirmed = commissions.filter(c => c.confirmed).reduce((s, c) => s + (c.commission_amount || 0), 0);
  const totalAll = commissions.reduce((s, c) => s + (c.commission_amount || 0), 0);

  return (
    <div className="space-y-6" data-testid="team-management">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-3"><Users className="w-5 h-5 text-blue-600" /></div>
          <p className="text-2xl font-bold text-ea-dark">{members.length}</p>
          <p className="text-sm text-ea-dark/50">Team Members</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3"><DollarSign className="w-5 h-5 text-amber-600" /></div>
          <p className="text-2xl font-bold text-ea-dark">{totalAll.toLocaleString('de-DE')} €</p>
          <p className="text-sm text-ea-dark/50">Total Commissions</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center mb-3"><DollarSign className="w-5 h-5 text-yellow-600" /></div>
          <p className="text-2xl font-bold text-yellow-600">{totalPending.toLocaleString('de-DE')} €</p>
          <p className="text-sm text-ea-dark/50">Pending</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center mb-3"><Check className="w-5 h-5 text-green-600" /></div>
          <p className="text-2xl font-bold text-green-600">{totalConfirmed.toLocaleString('de-DE')} €</p>
          <p className="text-sm text-ea-dark/50">Confirmed</p>
        </div>
      </div>

      {/* Team Members */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-ea-dark">Team Members</h3>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2 bg-ea-dark text-white text-sm font-medium rounded-lg hover:bg-ea-dark/90 transition-all" data-testid="add-member-btn">
            <Plus className="w-4 h-4" /> New Member
          </button>
        </div>

        {/* Add Member Form */}
        {showAdd && (
          <div className="bg-gray-50 rounded-xl p-5 mb-5 border border-gray-200" data-testid="add-member-form">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-ea-dark">New Team Member</h4>
              <button onClick={() => setShowAdd(false)} className="text-ea-dark/30 hover:text-ea-dark/60"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold" data-testid="new-member-name" />
              <input type="email" placeholder="Email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold" data-testid="new-member-email" />
              <input type="password" placeholder="Password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold" data-testid="new-member-password" />
              <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))} className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold" data-testid="new-member-role">
                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label} – {r.desc}</option>)}
              </select>
            </div>
            <button onClick={createMember} disabled={saving || !form.name || !form.email || !form.password} className="px-6 py-2 bg-ea-dark text-white text-sm font-bold rounded-lg hover:bg-ea-dark/90 disabled:opacity-40" data-testid="create-member-btn">
              {saving ? 'Creating...' : 'Create Member'}
            </button>
          </div>
        )}

        {/* Edit Member Modal */}
        {editMember && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditMember(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl" onClick={e => e.stopPropagation()} data-testid="edit-member-modal">
              <div className="flex items-center justify-between mb-5">
                <h4 className="text-lg font-bold text-ea-dark">Edit {editMember.name}</h4>
                <button onClick={() => setEditMember(null)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-ea-dark/40" /></button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-ea-dark/50 mb-1 block">Name</label>
                  <input type="text" value={editMember.name} onChange={e => setEditMember(p => ({ ...p, name: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold" data-testid="edit-member-name" />
                </div>
                <div>
                  <label className="text-xs text-ea-dark/50 mb-1 block">Role</label>
                  <select value={editMember.role} onChange={e => setEditMember(p => ({ ...p, role: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold" data-testid="edit-member-role">
                    {ROLES.map(r => <option key={r.value} value={r.value}>{r.label} – {r.desc}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-ea-dark/50 mb-1 block">Reports to (Team Leader)</label>
                  <select value={editMember.reports_to || ''} onChange={e => setEditMember(p => ({ ...p, reports_to: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold" data-testid="edit-member-reports-to">
                    <option value="">No Team Leader</option>
                    {members.filter(m => m.email !== editMember.email && m.role === 'teamleader').map(m => (
                      <option key={m.email} value={m.email}>{m.name}</option>
                    ))}
                  </select>
                </div>
                {editMember.role === 'teamleader' && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <label className="text-xs text-amber-700 font-bold mb-1 block">Team Leader Commission Rate (%)</label>
                    <p className="text-xs text-amber-600/70 mb-2">Commission earned on every deal closed by team members</p>
                    <input type="number" step="0.1" value={editMember.teamleader_commission_rate || 0} onChange={e => setEditMember(p => ({ ...p, teamleader_commission_rate: parseFloat(e.target.value) }))} className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400" data-testid="edit-member-tl-commission" />
                  </div>
                )}
                <div>
                  <label className="text-xs text-ea-dark/50 mb-1 block">Default Commission Rate (%)</label>
                  <input type="number" step="0.1" value={editMember.commission_rate || 3} onChange={e => setEditMember(p => ({ ...p, commission_rate: parseFloat(e.target.value) }))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold" data-testid="edit-member-commission" />
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => setEditMember(null)} className="flex-1 py-2 text-ea-dark/50 text-sm rounded-lg border border-gray-200 hover:bg-gray-50">Cancel</button>
                  <button onClick={updateMember} disabled={saving} className="flex-1 py-2 bg-ea-dark text-white text-sm font-bold rounded-lg hover:bg-ea-dark/90 disabled:opacity-40" data-testid="save-member-btn">{saving ? '...' : 'Save'}</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Members Table */}
        <div className="space-y-3">
          {members.map(m => (
            <div key={m.email} className="flex items-center justify-between bg-gray-50 rounded-xl px-5 py-4 group" data-testid={`member-${m.email}`}>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-ea-dark/10 flex items-center justify-center">
                  <span className="text-ea-dark font-bold text-sm">{m.name?.charAt(0) || '?'}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-ea-dark">{m.name}</p>
                  <p className="text-xs text-ea-dark/40">{m.email}</p>
                  {m.reports_to && <p className="text-xs text-amber-600">↳ reports to {members.find(x => x.email === m.reports_to)?.name || m.reports_to}</p>}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${m.role === 'teamleader' ? 'bg-amber-50 text-amber-700' : m.role === 'restricted' ? 'bg-orange-50 text-orange-600' : 'bg-green-50 text-green-600'}`}>
                    {m.role === 'teamleader' ? 'Team Leader' : m.role === 'restricted' ? 'Restricted' : 'Full Access'}
                  </span>
                  {m.role === 'teamleader' && m.teamleader_commission_rate > 0 && (
                    <span className="ml-1 text-xs text-amber-600 font-medium">{m.teamleader_commission_rate}%</span>
                  )}
                </div>
                <div className="text-right hidden sm:block">
                  <p className="text-xs text-ea-dark/40">{m.assigned_leads || 0} Leads · {m.won_deals || 0} Won</p>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setEditMember({ ...m })} className="p-2 rounded-lg text-ea-dark/30 hover:text-ea-dark hover:bg-gray-200 transition-all" data-testid={`edit-member-${m.email}`}>
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteMember(m.email, m.name)} className="p-2 rounded-lg text-red-300 hover:text-red-600 hover:bg-red-50 transition-all" data-testid={`delete-member-${m.email}`}>
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          {members.length === 0 && <p className="text-center text-ea-dark/30 py-8">No team members yet</p>}
        </div>
      </div>

      {/* Product Commission Models */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-ea-dark">Commission Rates per Product</h3>
          <button onClick={() => setShowModels(!showModels)} className="text-sm text-ea-gold hover:text-ea-dark transition-all font-medium" data-testid="toggle-commission-models">
            {showModels ? 'Hide' : 'Configure'}
          </button>
        </div>
        {!showModels ? (
          <div className="flex flex-wrap gap-2">
            {commModels.length > 0 ? commModels.map((m, i) => (
              <span key={i} className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 text-ea-dark">
                {m.property_type}: <strong className="text-ea-gold">{m.commission_rate}%</strong>
              </span>
            )) : <p className="text-sm text-ea-dark/30">No product commission models configured yet</p>}
          </div>
        ) : (
          <div className="space-y-3" data-testid="commission-models-editor">
            {commModels.map((m, i) => (
              <div key={i} className="flex items-center gap-3">
                <input type="text" value={m.property_type} onChange={e => setCommModels(prev => prev.map((p, idx) => idx === i ? { ...p, property_type: e.target.value } : p))} placeholder="Product Type" className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold" data-testid={`cm-type-${i}`} />
                <div className="flex items-center gap-1">
                  <input type="number" step="0.1" value={m.commission_rate} onChange={e => setCommModels(prev => prev.map((p, idx) => idx === i ? { ...p, commission_rate: parseFloat(e.target.value) || 0 } : p))} className="w-20 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-right focus:outline-none focus:border-ea-gold" data-testid={`cm-rate-${i}`} />
                  <span className="text-ea-dark/40 text-sm">%</span>
                </div>
                <button onClick={() => setCommModels(prev => prev.filter((_, idx) => idx !== i))} className="p-2 text-red-300 hover:text-red-500 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
            <div className="flex gap-2">
              <button onClick={() => setCommModels(prev => [...prev, { property_type: '', commission_rate: 3, description: '' }])} className="flex items-center gap-1 text-sm text-ea-gold hover:text-ea-dark transition-all" data-testid="add-commission-model">
                <Plus className="w-4 h-4" /> Add Product Type
              </button>
              <button onClick={saveCommModels} disabled={saving} className="ml-auto px-5 py-2 bg-ea-dark text-white text-sm font-bold rounded-lg hover:bg-ea-dark/90 disabled:opacity-40" data-testid="save-commission-models">
                {saving ? 'Saving...' : 'Save Models'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Commissions Table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-ea-dark">All Commissions</h3>
          {commissions.length > 0 && (
            <button onClick={exportCommissionsCSV} className="flex items-center gap-2 px-4 py-2 bg-ea-dark text-white text-sm font-medium rounded-lg hover:bg-ea-dark/90 transition-all" data-testid="export-commissions-btn">
              <Download className="w-4 h-4" /> CSV Export
            </button>
          )}
        </div>
        {commissions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 text-ea-dark/50 font-medium">Member</th>
                  <th className="text-left py-2.5 text-ea-dark/50 font-medium">Lead</th>
                  <th className="text-left py-2.5 text-ea-dark/50 font-medium">Property</th>
                  <th className="text-right py-2.5 text-ea-dark/50 font-medium">Value</th>
                  <th className="text-right py-2.5 text-ea-dark/50 font-medium">Commission</th>
                  <th className="text-center py-2.5 text-ea-dark/50 font-medium">Status</th>
                  <th className="text-center py-2.5 text-ea-dark/50 font-medium w-20">Action</th>
                </tr>
              </thead>
              <tbody>
                {commissions.map((c, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5">
                      <p className="text-ea-dark font-medium">{c.member_name}</p>
                    </td>
                    <td className="py-2.5 text-ea-dark/70">{c.lead_name}</td>
                    <td className="py-2.5 text-ea-dark/50 text-xs">{c.property_type} {c.property_location ? `· ${c.property_location}` : ''}</td>
                    <td className="py-2.5 text-right text-ea-dark font-medium">{(c.property_value || 0).toLocaleString('de-DE')} €</td>
                    <td className="py-2.5 text-right font-bold text-ea-gold">{(c.commission_amount || 0).toLocaleString('de-DE')} €</td>
                    <td className="py-2.5 text-center">
                      {c.confirmed
                        ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">Confirmed</span>
                        : c.status === 'won'
                          ? <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-600">Pending</span>
                          : <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-ea-dark/40">{c.status}</span>
                      }
                    </td>
                    <td className="py-2.5 text-center">
                      {c.status === 'won' && !c.confirmed && (
                        <button
                          onClick={() => confirmCommission(c.lead_id || '')}
                          className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-all"
                          data-testid={`confirm-commission-${i}`}
                        >
                          Confirm
                        </button>
                      )}
                      {c.confirmed && <Check className="w-4 h-4 text-green-500 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-ea-dark/30 py-8">No commissions yet. Assign leads to team members and set property values.</p>
        )}
      </div>
    </div>
  );
}
