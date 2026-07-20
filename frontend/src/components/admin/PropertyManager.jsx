import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X, Image, Upload, FileText, Eye, EyeOff, Star, MapPin, Building2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Land', 'Commercial', 'Hotel', 'Other'];
const LOCATIONS = ['Budva', 'Podgorica', 'Tivat', 'Bar', 'Kotor', 'Herceg Novi', 'Nikšić', 'Ulcinj', 'Cetinje', 'Novi Sad', 'Belgrade'];
const STATUSES = ['available', 'reserved', 'sold'];
const FEATURES_OPTIONS = ['Sea View', 'Pool', 'Parking', 'Balcony', 'Garden', 'Furnished', 'Air Conditioning', 'Elevator', 'New Build', 'Renovation Needed'];

export default function PropertyManager({ credentials }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editProp, setEditProp] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: '', area_sqm: '', rooms: '', bathrooms: '', property_type: 'Apartment', location: '', address: '', features: '', status: 'available', published: true });
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadingPdf, setUploadingPdf] = useState(false);

  const authHeader = { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/api/admin/properties`, { headers: authHeader });
      if (res.ok) setProperties(await res.json());
    } catch {}
    setLoading(false);
  };

  useEffect(() => { fetchProperties(); }, []);

  const createProperty = async () => {
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => { if (v !== '' && v !== null) fd.append(k, v); });
    const res = await fetch(`${API}/api/admin/properties`, { method: 'POST', headers: authHeader, body: fd });
    if (res.ok) {
      const prop = await res.json();
      setShowCreate(false);
      setForm({ title: '', description: '', price: '', area_sqm: '', rooms: '', bathrooms: '', property_type: 'Apartment', location: '', address: '', features: '', status: 'available', published: true });
      setEditProp(prop);
      fetchProperties();
    } else { const err = await res.json(); alert(err.detail || 'Error'); }
    setSaving(false);
  };

  const updateProperty = async () => {
    if (!editProp) return;
    setSaving(true);
    const fd = new FormData();
    ['title', 'description', 'price', 'area_sqm', 'rooms', 'bathrooms', 'property_type', 'location', 'address', 'status', 'published'].forEach(k => {
      if (editProp[k] !== null && editProp[k] !== undefined) fd.append(k, editProp[k]);
    });
    if (editProp.features) fd.append('features', Array.isArray(editProp.features) ? editProp.features.join(', ') : editProp.features);
    await fetch(`${API}/api/admin/properties/${editProp._id}`, { method: 'PUT', headers: authHeader, body: fd });
    fetchProperties();
    setSaving(false);
  };

  const deleteProperty = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    await fetch(`${API}/api/admin/properties/${id}`, { method: 'DELETE', headers: authHeader });
    if (editProp?._id === id) setEditProp(null);
    fetchProperties();
  };

  const uploadImages = async (files) => {
    if (!editProp || !files.length) return;
    setUploadingImages(true);
    const fd = new FormData();
    for (const f of files) fd.append('files', f);
    const res = await fetch(`${API}/api/admin/properties/${editProp._id}/images`, { method: 'POST', headers: authHeader, body: fd });
    if (res.ok) {
      const data = await res.json();
      setEditProp(prev => ({ ...prev, images: data.image_ids, cover_image: prev.cover_image || data.image_ids[0] }));
      fetchProperties();
    }
    setUploadingImages(false);
  };

  const deleteImage = async (imageId) => {
    await fetch(`${API}/api/admin/properties/${editProp._id}/images/${imageId}`, { method: 'DELETE', headers: authHeader });
    setEditProp(prev => ({ ...prev, images: prev.images.filter(i => i !== imageId), cover_image: prev.cover_image === imageId ? (prev.images.filter(i => i !== imageId)[0] || null) : prev.cover_image }));
    fetchProperties();
  };

  const setCover = async (imageId) => {
    await fetch(`${API}/api/admin/properties/${editProp._id}/cover/${imageId}`, { method: 'PUT', headers: authHeader });
    setEditProp(prev => ({ ...prev, cover_image: imageId }));
    fetchProperties();
  };

  const uploadPdf = async (file) => {
    if (!editProp || !file) return;
    setUploadingPdf(true);
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch(`${API}/api/admin/properties/${editProp._id}/pdf`, { method: 'POST', headers: authHeader, body: fd });
    if (res.ok) {
      const data = await res.json();
      setEditProp(prev => ({ ...prev, pdf_expose_id: data.pdf_id }));
      fetchProperties();
    }
    setUploadingPdf(false);
  };

  const toggleFeature = (feature) => {
    const current = Array.isArray(editProp.features) ? editProp.features : [];
    setEditProp(prev => ({
      ...prev,
      features: current.includes(feature) ? current.filter(f => f !== feature) : [...current, feature]
    }));
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-ea-gold border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6" data-testid="property-manager">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-ea-dark">Property Listings</h2>
          <p className="text-sm text-ea-dark/50">{properties.length} properties · {properties.filter(p => p.published).length} published</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2.5 bg-ea-dark text-white text-sm font-medium rounded-lg hover:bg-ea-dark/90 transition-all" data-testid="create-property-btn">
          <Plus className="w-4 h-4" /> Add Property
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()} data-testid="create-property-modal">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-ea-dark">New Property</h3>
              <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-ea-dark/40" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold" data-testid="prop-title" />
              <div className="grid grid-cols-2 gap-3">
                <select value={form.property_type} onChange={e => setForm(p => ({ ...p, property_type: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold" data-testid="prop-type">
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold" data-testid="prop-location">
                  <option value="">Location...</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input type="number" placeholder="Price (EUR)" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold" data-testid="prop-price" />
                <input type="number" placeholder="Area m²" value={form.area_sqm} onChange={e => setForm(p => ({ ...p, area_sqm: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold" data-testid="prop-area" />
                <input type="number" placeholder="Rooms" value={form.rooms} onChange={e => setForm(p => ({ ...p, rooms: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold" data-testid="prop-rooms" />
              </div>
              <textarea placeholder="Description" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-ea-gold resize-none" data-testid="prop-desc" />
              <button onClick={createProperty} disabled={saving || !form.title} className="w-full py-2.5 bg-ea-dark text-white font-bold text-sm rounded-lg hover:bg-ea-dark/90 disabled:opacity-40" data-testid="prop-create-submit">
                {saving ? 'Creating...' : 'Create & Add Images'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Properties List */}
        <div className={`${editProp ? 'w-1/3' : 'w-full'} space-y-3 transition-all`}>
          {properties.map(p => (
            <div key={p._id} onClick={() => setEditProp(p)} className={`bg-white border rounded-xl p-4 cursor-pointer transition-all hover:border-ea-gold/50 ${editProp?._id === p._id ? 'border-ea-gold ring-2 ring-ea-gold/20' : 'border-gray-200'}`} data-testid={`property-card-${p._id}`}>
              <div className="flex gap-3">
                {p.cover_image ? (
                  <img src={`${API}/api/properties/img/${p.cover_image}`} alt="" className="w-20 h-20 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-20 h-20 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><Building2 className="w-6 h-6 text-gray-300" /></div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-ea-dark truncate">{p.title}</h4>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${p.status === 'available' ? 'bg-green-50 text-green-600' : p.status === 'reserved' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>{p.status}</span>
                  </div>
                  <p className="text-xs text-ea-dark/40 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{p.location} · {p.property_type}</p>
                  <p className="text-sm font-bold text-ea-gold mt-1">{p.price?.toLocaleString('de-DE')} €</p>
                  <p className="text-xs text-ea-dark/30">{p.area_sqm} m² · {p.rooms} rooms · {p.images?.length || 0} photos{!p.published ? ' · Draft' : ''}</p>
                </div>
              </div>
            </div>
          ))}
          {properties.length === 0 && <p className="text-center text-ea-dark/30 py-12">No properties yet. Click "Add Property" to start.</p>}
        </div>

        {/* Edit Panel */}
        {editProp && (
          <div className="w-2/3 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-4 max-h-[85vh] overflow-y-auto" data-testid="property-edit-panel">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-ea-dark">{editProp.title}</h3>
              <div className="flex items-center gap-2">
                <button onClick={() => deleteProperty(editProp._id, editProp.title)} className="p-2 rounded-lg text-red-300 hover:text-red-600 hover:bg-red-50"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => setEditProp(null)} className="p-2 rounded-lg hover:bg-gray-100"><X className="w-5 h-5 text-ea-dark/40" /></button>
              </div>
            </div>

            {/* Images */}
            <div className="mb-5">
              <h4 className="text-sm font-semibold text-ea-dark mb-3 flex items-center gap-2"><Image className="w-4 h-4 text-ea-gold" /> Photos ({editProp.images?.length || 0})</h4>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {(editProp.images || []).map(imgId => (
                  <div key={imgId} className="relative group rounded-lg overflow-hidden aspect-square">
                    <img src={`${API}/api/properties/img/${imgId}`} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1">
                      <button onClick={() => setCover(imgId)} className={`p-1.5 rounded-full ${editProp.cover_image === imgId ? 'bg-ea-gold text-white' : 'bg-white/80 text-ea-dark hover:bg-ea-gold hover:text-white'}`} title="Set as cover"><Star className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteImage(imgId)} className="p-1.5 rounded-full bg-white/80 text-red-500 hover:bg-red-500 hover:text-white" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    {editProp.cover_image === imgId && <div className="absolute top-1 left-1 bg-ea-gold text-white text-[9px] font-bold px-1.5 py-0.5 rounded">Cover</div>}
                  </div>
                ))}
                <label className="aspect-square rounded-lg border-2 border-dashed border-gray-200 hover:border-ea-gold flex flex-col items-center justify-center cursor-pointer transition-all">
                  {uploadingImages ? <div className="w-5 h-5 border-2 border-ea-gold border-t-transparent rounded-full animate-spin" /> : <><Upload className="w-5 h-5 text-gray-300 mb-1" /><span className="text-[10px] text-gray-300">Add Photos</span></>}
                  <input type="file" multiple accept="image/*" className="hidden" onChange={e => uploadImages(Array.from(e.target.files))} data-testid="upload-images-input" />
                </label>
              </div>
            </div>

            {/* Details Form */}
            <div className="space-y-3 mb-5">
              <input type="text" value={editProp.title} onChange={e => setEditProp(p => ({ ...p, title: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:border-ea-gold" data-testid="edit-prop-title" />
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-ea-dark/40 mb-1 block">Price (EUR)</label>
                  <input type="number" value={editProp.price || ''} onChange={e => setEditProp(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold" data-testid="edit-prop-price" />
                </div>
                <div>
                  <label className="text-xs text-ea-dark/40 mb-1 block">Area m²</label>
                  <input type="number" value={editProp.area_sqm || ''} onChange={e => setEditProp(p => ({ ...p, area_sqm: parseFloat(e.target.value) || 0 }))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold" />
                </div>
                <div>
                  <label className="text-xs text-ea-dark/40 mb-1 block">Rooms</label>
                  <input type="number" value={editProp.rooms || ''} onChange={e => setEditProp(p => ({ ...p, rooms: parseInt(e.target.value) || 0 }))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <select value={editProp.property_type} onChange={e => setEditProp(p => ({ ...p, property_type: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold">
                  {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <select value={editProp.location || ''} onChange={e => setEditProp(p => ({ ...p, location: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold">
                  <option value="">Location...</option>
                  {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
                <select value={editProp.status} onChange={e => setEditProp(p => ({ ...p, status: e.target.value }))} className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold">
                  {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
              <input type="text" placeholder="Address" value={editProp.address || ''} onChange={e => setEditProp(p => ({ ...p, address: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold" />
              <textarea value={editProp.description || ''} onChange={e => setEditProp(p => ({ ...p, description: e.target.value }))} rows={4} placeholder="Description..." className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-ea-gold resize-none" data-testid="edit-prop-desc" />

              {/* Features */}
              <div>
                <label className="text-xs text-ea-dark/40 mb-2 block">Features</label>
                <div className="flex flex-wrap gap-1.5">
                  {FEATURES_OPTIONS.map(f => (
                    <button key={f} onClick={() => toggleFeature(f)} className={`text-xs px-2.5 py-1 rounded-full transition-all ${(editProp.features || []).includes(f) ? 'bg-ea-gold/20 text-ea-dark font-medium border border-ea-gold/30' : 'bg-gray-50 text-ea-dark/40 border border-gray-200 hover:border-ea-gold/30'}`}>{f}</button>
                  ))}
                </div>
              </div>

              {/* Published Toggle */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={editProp.published} onChange={e => setEditProp(p => ({ ...p, published: e.target.checked }))} className="w-4 h-4 accent-ea-gold" />
                <span className="text-sm text-ea-dark flex items-center gap-1.5">{editProp.published ? <><Eye className="w-4 h-4 text-green-500" /> Published</> : <><EyeOff className="w-4 h-4 text-ea-dark/30" /> Draft</>}</span>
              </label>
            </div>

            {/* PDF Exposé */}
            <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="text-sm font-semibold text-ea-dark mb-2 flex items-center gap-2"><FileText className="w-4 h-4 text-ea-gold" /> PDF Exposé</h4>
              {editProp.pdf_expose_id ? (
                <div className="flex items-center gap-3">
                  <a href={`${API}/api/properties/pdf/${editProp._id}`} target="_blank" rel="noopener noreferrer" className="text-sm text-ea-gold hover:underline">View PDF</a>
                  <label className="text-xs text-ea-dark/40 hover:text-ea-gold cursor-pointer">Replace<input type="file" accept=".pdf" className="hidden" onChange={e => uploadPdf(e.target.files[0])} /></label>
                </div>
              ) : (
                <label className="flex items-center gap-2 text-sm text-ea-dark/40 hover:text-ea-gold cursor-pointer">
                  {uploadingPdf ? <div className="w-4 h-4 border-2 border-ea-gold border-t-transparent rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                  Upload PDF Exposé
                  <input type="file" accept=".pdf" className="hidden" onChange={e => uploadPdf(e.target.files[0])} data-testid="upload-pdf-input" />
                </label>
              )}
            </div>

            {/* Save */}
            <button onClick={updateProperty} disabled={saving} className="w-full py-2.5 bg-ea-dark text-white font-bold text-sm rounded-lg hover:bg-ea-dark/90 disabled:opacity-40" data-testid="save-property-btn">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
