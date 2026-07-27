import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Save, X, Package, TrendingUp, Users, ChevronDown, ChevronUp } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const CATEGORIES = ['Relocation', 'Immobilien', 'Consulting', 'Service', 'Premium'];

export default function ProductCatalog({ credentials }) {
  const [products, setProducts] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'Service', commission_tiers: [{ min_sales: 0, rate: 10 }] });

  const authHeader = { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) };

  const fetchAll = async () => {
    setLoading(true);
    const [prods, members] = await Promise.all([
      fetch(`${API}/api/admin/products`, { headers: authHeader }).then(r => r.ok ? r.json() : []),
      fetch(`${API}/api/admin/team-members`, { headers: authHeader }).then(r => r.ok ? r.json() : []),
    ]);
    setProducts(prods);
    setTeamMembers(members);
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const resetForm = () => {
    setForm({ name: '', description: '', price: '', category: 'Service', commission_tiers: [{ min_sales: 0, rate: 10 }] });
    setEditId(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    const body = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price) || 0,
      category: form.category,
      commission_tiers: form.commission_tiers.filter(t => t.rate > 0),
    };

    const url = editId ? `${API}/api/admin/products/${editId}` : `${API}/api/admin/products`;
    const method = editId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method, headers: { ...authHeader, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    if (res.ok) { resetForm(); fetchAll(); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    await fetch(`${API}/api/admin/products/${id}`, { method: 'DELETE', headers: authHeader });
    fetchAll();
  };

  const startEdit = (p) => {
    setForm({
      name: p.name, description: p.description || '', price: p.price || '',
      category: p.category || 'Service',
      commission_tiers: p.commission_tiers?.length ? p.commission_tiers : [{ min_sales: 0, rate: 10 }],
    });
    setEditId(p._id);
    setShowForm(true);
  };

  const addTier = () => {
    const lastTier = form.commission_tiers[form.commission_tiers.length - 1];
    setForm(f => ({
      ...f,
      commission_tiers: [...f.commission_tiers, { min_sales: (lastTier?.min_sales || 0) + 5, rate: (lastTier?.rate || 10) + 2 }],
    }));
  };

  const updateTier = (idx, field, value) => {
    setForm(f => ({
      ...f,
      commission_tiers: f.commission_tiers.map((t, i) => i === idx ? { ...t, [field]: parseFloat(value) || 0 } : t),
    }));
  };

  const removeTier = (idx) => {
    if (form.commission_tiers.length <= 1) return;
    setForm(f => ({ ...f, commission_tiers: f.commission_tiers.filter((_, i) => i !== idx) }));
  };

  const toggleAssign = async (productId, email) => {
    const product = products.find(p => p._id === productId);
    if (!product) return;
    const current = product.assigned_to || [];
    const updated = current.includes(email) ? current.filter(e => e !== email) : [...current, email];
    await fetch(`${API}/api/admin/products/${productId}/assign`, {
      method: 'PUT',
      headers: { ...authHeader, 'Content-Type': 'application/json' },
      body: JSON.stringify({ emails: updated }),
    });
    fetchAll();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-[#C8A96A] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6" data-testid="product-catalog">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ea-dark">Produkte & Provisionen</h2>
          <p className="text-sm text-ea-dark/40">{products.length} products defined</p>
        </div>
        <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-[#C8A96A] text-[#04151F] text-sm font-bold rounded-lg hover:bg-[#C8A96A]/90 transition-all" data-testid="add-product-btn">
          <Plus className="w-4 h-4" /> New Product
        </button>
      </div>

      {/* Create/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4" data-testid="product-form">
          <h3 className="text-base font-bold text-ea-dark">{editId ? 'Edit Product' : 'New Product'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input type="text" placeholder="Product Name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="product-name-input" />
            <input type="number" placeholder="Price (EUR)" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="product-price-input" />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="product-category-select">
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <input type="text" placeholder="Description (optional)" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]" />

          {/* Commission Tiers */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-ea-dark">Provisionsstaffeln</label>
              <button onClick={addTier} className="text-xs text-[#C8A96A] hover:text-[#C8A96A]/70 font-medium">+ Add Tier</button>
            </div>
            <div className="space-y-2">
              {form.commission_tiers.map((tier, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                  <span className="text-xs text-ea-dark/40 w-16 shrink-0">Ab {tier.min_sales === 0 ? 'Start' : `${tier.min_sales} Sales`}</span>
                  <div className="flex items-center gap-2 flex-1">
                    <label className="text-xs text-ea-dark/40">Min Sales:</label>
                    <input type="number" value={tier.min_sales} onChange={e => updateTier(i, 'min_sales', e.target.value)} className="w-20 bg-white border border-gray-200 rounded px-2 py-1 text-sm text-center" />
                    <label className="text-xs text-ea-dark/40 ml-2">Rate:</label>
                    <input type="number" step="0.5" value={tier.rate} onChange={e => updateTier(i, 'rate', e.target.value)} className="w-20 bg-white border border-gray-200 rounded px-2 py-1 text-sm text-center" />
                    <span className="text-sm text-ea-dark/60">%</span>
                  </div>
                  {form.commission_tiers.length > 1 && (
                    <button onClick={() => removeTier(i)} className="text-red-400 hover:text-red-600"><X className="w-4 h-4" /></button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2 bg-[#04151F] text-white text-sm font-bold rounded-lg hover:bg-[#04151F]/90 transition-all" data-testid="product-save-btn">
              <Save className="w-4 h-4" /> {editId ? 'Update' : 'Create'}
            </button>
            <button onClick={resetForm} className="px-5 py-2 text-sm text-ea-dark/50 hover:text-ea-dark">Cancel</button>
          </div>
        </div>
      )}

      {/* Product Cards */}
      {products.length === 0 ? (
        <div className="text-center py-20 text-ea-dark/30">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No products yet. Create your first product above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map(p => (
            <div key={p._id} className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 transition-all overflow-hidden" data-testid={`product-card-${p._id}`}>
              <div className="flex items-center gap-4 p-4 cursor-pointer" onClick={() => setExpandedId(expandedId === p._id ? null : p._id)}>
                <div className="w-10 h-10 rounded-lg bg-[#C8A96A]/10 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-[#C8A96A]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-ea-dark text-sm">{p.name}</h3>
                    <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-ea-dark/50">{p.category}</span>
                    {!p.active && <span className="text-xs px-2 py-0.5 bg-red-50 text-red-500 rounded-full">Inactive</span>}
                  </div>
                  {p.description && <p className="text-xs text-ea-dark/40 truncate mt-0.5">{p.description}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-ea-dark">{p.price?.toLocaleString('de-DE')} €</p>
                  <p className="text-xs text-[#C8A96A]">
                    {p.commission_tiers?.length > 1 ? `${p.commission_tiers[0].rate}% – ${p.commission_tiers[p.commission_tiers.length - 1].rate}%` : `${p.commission_tiers?.[0]?.rate || 0}%`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={e => { e.stopPropagation(); startEdit(p); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit3 className="w-4 h-4 text-ea-dark/40" /></button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(p._id); }} className="p-1.5 rounded-lg hover:bg-red-50"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  {expandedId === p._id ? <ChevronUp className="w-4 h-4 text-ea-dark/30" /> : <ChevronDown className="w-4 h-4 text-ea-dark/30" />}
                </div>
              </div>

              {/* Expanded: Tiers + Assignment */}
              {expandedId === p._id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-4">
                  {/* Tiers */}
                  <div>
                    <h4 className="text-xs font-semibold text-ea-dark/40 mb-2 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> PROVISIONSSTAFFELN</h4>
                    <div className="flex gap-2 flex-wrap">
                      {(p.commission_tiers || []).map((t, i) => (
                        <div key={i} className="bg-white rounded-lg px-4 py-2 border border-gray-200 text-center">
                          <p className="text-lg font-bold text-[#C8A96A]">{t.rate}%</p>
                          <p className="text-xs text-ea-dark/40">{t.min_sales === 0 ? 'Start' : `ab ${t.min_sales} Sales`}</p>
                          {p.price > 0 && <p className="text-xs text-ea-dark/60 font-medium mt-1">{(p.price * t.rate / 100).toLocaleString('de-DE')} €</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Team Assignment */}
                  <div>
                    <h4 className="text-xs font-semibold text-ea-dark/40 mb-2 flex items-center gap-1"><Users className="w-3 h-3" /> ZUGEWIESEN AN</h4>
                    <div className="flex flex-wrap gap-2">
                      {teamMembers.map(m => {
                        const assigned = (p.assigned_to || []).includes(m.email);
                        return (
                          <button key={m.email} onClick={() => toggleAssign(p._id, m.email)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${assigned ? 'bg-[#C8A96A] text-[#04151F]' : 'bg-gray-100 text-ea-dark/40 hover:bg-gray-200'}`}
                            data-testid={`assign-${p._id}-${m.email}`}
                          >
                            {m.name}
                          </button>
                        );
                      })}
                      {(p.assigned_to || []).length === 0 && <span className="text-xs text-ea-dark/30 italic">All team members (no restriction)</span>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
