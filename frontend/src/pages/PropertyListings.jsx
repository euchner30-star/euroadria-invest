import React, { useState, useEffect } from 'react';
import { MapPin, Maximize, BedDouble, Bath, Filter, Search, ChevronLeft, ChevronRight, Download, Phone, MessageSquare, X, Building2 } from 'lucide-react';
import { useParams, Link, useSearchParams } from 'react-router-dom';

const API = process.env.REACT_APP_BACKEND_URL;

const PROPERTY_TYPES = ['All', 'Apartment', 'House', 'Villa', 'Land', 'Commercial', 'Hotel'];

function PropertyCard({ property }) {
  const [imgIdx, setImgIdx] = useState(0);
  const images = property.images || [];

  return (
    <Link to={`/properties/${property._id}`} className="block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#C8A96A]/40 hover:shadow-lg transition-all group" data-testid={`property-card-${property._id}`}>
      {/* Image */}
      <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
        {images.length > 0 ? (
          <img src={`${API}/api/properties/img/${images[imgIdx] || property.cover_image}`} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Building2 className="w-12 h-12 text-gray-200" /></div>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {images.slice(0, 5).map((_, i) => (
              <div key={i} className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm ${property.status === 'available' ? 'bg-green-500/90 text-white' : property.status === 'reserved' ? 'bg-yellow-500/90 text-white' : 'bg-red-500/90 text-white'}`}>
            {property.status === 'available' ? 'Available' : property.status === 'reserved' ? 'Reserved' : 'Sold'}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm">{property.property_type}</span>
        </div>
      </div>
      {/* Info */}
      <div className="p-4">
        <p className="text-xs text-[#C8A96A] font-medium flex items-center gap-1 mb-1"><MapPin className="w-3 h-3" />{property.location}{property.address ? ` · ${property.address}` : ''}</p>
        <h3 className="text-base font-bold text-[#04151F] mb-2 line-clamp-1">{property.title}</h3>
        <div className="flex items-center gap-4 text-xs text-[#04151F]/50 mb-3">
          {property.area_sqm > 0 && <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" />{property.area_sqm} m²</span>}
          {property.rooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{property.rooms} Rooms</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{property.bathrooms} Bath</span>}
        </div>
        <p className="text-lg font-bold text-[#04151F]">{property.price?.toLocaleString('de-DE')} <span className="text-sm font-normal text-[#04151F]/40">EUR</span></p>
      </div>
    </Link>
  );
}

function InquiryForm({ property, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSending(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    const res = await fetch(`${API}/api/properties/${property._id}/inquiry`, { method: 'POST', body: fd });
    if (res.ok) setSent(true);
    setSending(false);
  };

  if (sent) return (
    <div className="text-center py-8">
      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
      </div>
      <h3 className="text-lg font-bold text-[#04151F] mb-1">Inquiry Sent!</h3>
      <p className="text-sm text-[#04151F]/50">We'll get back to you shortly.</p>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-3" data-testid="property-inquiry-form">
      <h4 className="text-base font-bold text-[#04151F]">Request Information</h4>
      <p className="text-xs text-[#04151F]/50">{property.title}</p>
      <input required type="text" placeholder="Your Name *" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="inquiry-name" />
      <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="inquiry-email" />
      <input type="tel" placeholder="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="inquiry-phone" />
      <textarea placeholder="Your message..." rows={3} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#C8A96A] resize-none" data-testid="inquiry-message" />
      <button type="submit" disabled={sending} className="w-full py-2.5 bg-[#C8A96A] text-[#04151F] font-bold text-sm rounded-lg hover:bg-[#d4b87a] transition-all disabled:opacity-50" data-testid="inquiry-submit">
        {sending ? 'Sending...' : 'Send Inquiry'}
      </button>
    </form>
  );
}

// ── Formatted Description Renderer ─────────────────────────────────────
function FormattedDescription({ text }) {
  if (!text) return null;

  const lines = text.split('\n');
  const blocks = [];
  let currentBullets = [];

  const flushBullets = () => {
    if (currentBullets.length > 0) {
      blocks.push({ type: 'bullets', items: [...currentBullets] });
      currentBullets = [];
    }
  };

  const isHeading = (line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length > 80) return false;
    if (trimmed.startsWith('•') || trimmed.startsWith('·') || trimmed.startsWith('-') || trimmed.startsWith('📍')) return false;
    // Short standalone lines that look like section titles
    const nextIdx = lines.indexOf(line) + 1;
    const words = trimmed.split(/\s+/).length;
    if (words <= 6 && !trimmed.endsWith('.') && !trimmed.endsWith(',')) return true;
    return false;
  };

  const isBullet = (line) => {
    const t = line.trim();
    return t.startsWith('•') || t.startsWith('·') || t.startsWith('- ') || t.startsWith('📍');
  };

  const cleanBullet = (line) => {
    return line.trim().replace(/^[•·📍]\s*/, '').replace(/^-\s+/, '');
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (!trimmed) {
      flushBullets();
      return;
    }

    if (isBullet(trimmed)) {
      currentBullets.push(cleanBullet(trimmed));
      return;
    }

    flushBullets();

    // Check if this is a heading: short line followed by content
    if (isHeading(line) && i > 0) {
      blocks.push({ type: 'heading', text: trimmed });
    } else {
      // Merge consecutive paragraph lines
      const lastBlock = blocks[blocks.length - 1];
      if (lastBlock?.type === 'paragraph') {
        lastBlock.text += ' ' + trimmed;
      } else {
        blocks.push({ type: 'paragraph', text: trimmed });
      }
    }
  });

  flushBullets();

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        if (block.type === 'heading') {
          return (
            <h3 key={i} className="text-base font-bold text-[#04151F] pt-3 pb-1 border-l-2 border-[#C8A96A] pl-3">
              {block.text}
            </h3>
          );
        }
        if (block.type === 'bullets') {
          return (
            <div key={i} className="bg-[#04151F]/[0.02] rounded-xl p-4 space-y-2.5">
              {block.items.map((item, j) => (
                <div key={j} className="flex items-start gap-2.5 text-sm text-[#04151F]/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#C8A96A] mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          );
        }
        return (
          <p key={i} className="text-sm text-[#04151F]/70 leading-relaxed">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}

// ── Property Detail Page ───────────────────────────────────────────────
export function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [showInquiry, setShowInquiry] = useState(false);
  const [similar, setSimilar] = useState([]);
  const [similarLabel, setSimilarLabel] = useState('');

  useEffect(() => {
    setLoading(true);
    setSimilar([]);
    setActiveImg(0);
    fetch(`${API}/api/properties/${id}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        setProperty(d);
        setLoading(false);
        if (d?.location) {
          fetch(`${API}/api/properties?status=available&location=${encodeURIComponent(d.location)}`)
            .then(r => r.ok ? r.json() : [])
            .then(all => {
              const sameLocation = all.filter(p => p._id !== d._id).slice(0, 3);
              if (sameLocation.length > 0) {
                setSimilar(sameLocation);
                setSimilarLabel(d.location);
              } else {
                // Fallback: show other available properties
                fetch(`${API}/api/properties?status=available`)
                  .then(r => r.ok ? r.json() : [])
                  .then(others => {
                    setSimilar(others.filter(p => p._id !== d._id).slice(0, 3));
                    setSimilarLabel('');
                  });
              }
            });
        }
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-3 border-[#C8A96A] border-t-transparent rounded-full animate-spin" /></div>;
  if (!property) return <div className="min-h-screen flex items-center justify-center text-[#04151F]/50">Property not found</div>;

  const images = property.images || [];
  const whatsappMsg = encodeURIComponent(`Hi, I'm interested in: ${property.title} (${property.location}) - ${property.price?.toLocaleString('de-DE')} EUR`);

  return (
    <div className="min-h-screen bg-white" data-testid="property-detail-page">
      {/* Image Gallery */}
      <div className="relative bg-gray-100 h-[50vh] sm:h-[60vh]">
        {images.length > 0 ? (
          <img src={`${API}/api/properties/img/${images[activeImg]}`} alt={property.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Building2 className="w-16 h-16 text-gray-200" /></div>
        )}
        {images.length > 1 && (
          <>
            <button onClick={() => setActiveImg(i => i > 0 ? i - 1 : images.length - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all"><ChevronLeft className="w-5 h-5" /></button>
            <button onClick={() => setActiveImg(i => i < images.length - 1 ? i + 1 : 0)} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all"><ChevronRight className="w-5 h-5" /></button>
          </>
        )}
        <div className="absolute bottom-4 right-4 text-white/70 text-xs bg-black/40 backdrop-blur-sm px-2 py-1 rounded">{images.length > 0 ? `${activeImg + 1} / ${images.length}` : ''}</div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 px-4 sm:px-8 py-3 overflow-x-auto">
          {images.map((imgId, i) => (
            <button key={imgId} onClick={() => setActiveImg(i)} className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-[#C8A96A]' : 'border-transparent opacity-60 hover:opacity-100'}`}>
              <img src={`${API}/api/properties/img/${imgId}`} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left: Details */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${property.status === 'available' ? 'bg-green-50 text-green-600' : property.status === 'reserved' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'}`}>{property.status}</span>
              <span className="text-xs text-[#04151F]/40">{property.property_type}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#04151F] mb-2">{property.title}</h1>
            <p className="text-sm text-[#C8A96A] flex items-center gap-1 mb-6"><MapPin className="w-4 h-4" />{property.location}{property.address ? ` · ${property.address}` : ''}</p>

            <div className="text-3xl font-bold text-[#04151F] mb-6">{property.price?.toLocaleString('de-DE')} <span className="text-lg font-normal text-[#04151F]/40">EUR</span></div>

            <div className="flex gap-6 mb-8 pb-6 border-b border-gray-100">
              {property.area_sqm > 0 && <div className="text-center"><p className="text-2xl font-bold text-[#04151F]">{property.area_sqm}</p><p className="text-xs text-[#04151F]/40">m²</p></div>}
              {property.rooms > 0 && <div className="text-center"><p className="text-2xl font-bold text-[#04151F]">{property.rooms}</p><p className="text-xs text-[#04151F]/40">Rooms</p></div>}
              {property.bathrooms > 0 && <div className="text-center"><p className="text-2xl font-bold text-[#04151F]">{property.bathrooms}</p><p className="text-xs text-[#04151F]/40">Bathrooms</p></div>}
              {property.area_sqm > 0 && property.price > 0 && <div className="text-center"><p className="text-2xl font-bold text-[#04151F]">{Math.round(property.price / property.area_sqm).toLocaleString('de-DE')}</p><p className="text-xs text-[#04151F]/40">EUR/m²</p></div>}
            </div>

            {property.description && (
              <div className="mb-8" data-testid="property-description">
                <h2 className="text-lg font-bold text-[#04151F] mb-4">Description</h2>
                <FormattedDescription text={property.description} />
              </div>
            )}

            {property.features?.length > 0 && (
              <div className="mb-8">
                <h2 className="text-lg font-bold text-[#04151F] mb-3">Features</h2>
                <div className="flex flex-wrap gap-2">
                  {property.features.map(f => (
                    <span key={f} className="text-xs bg-[#C8A96A]/10 text-[#04151F] px-3 py-1.5 rounded-full">{f}</span>
                  ))}
                </div>
              </div>
            )}

            {property.pdf_expose_id && (
              <a href={`${API}/api/properties/pdf/${property._id}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#04151F] text-white text-sm font-medium rounded-lg hover:bg-[#04151F]/90 transition-all mb-8" data-testid="download-expose">
                <Download className="w-4 h-4" /> Download Exposé (PDF)
              </a>
            )}

            {/* Back to listings */}
            <div className="pt-4 border-t border-gray-100">
              <Link to="/properties" className="inline-flex items-center gap-2 text-sm text-[#C8A96A] hover:text-[#04151F] font-medium transition-colors" data-testid="back-to-properties">
                <ChevronLeft className="w-4 h-4" /> Back to all properties
              </Link>
            </div>
          </div>

          {/* Right: Inquiry */}
          <div className="lg:w-96 shrink-0">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm sticky top-24">
              <InquiryForm property={property} />
              <div className="mt-4 pt-4 border-t border-gray-100">
                <a href={`https://wa.me/38268559776?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#25D366] text-white font-bold text-sm rounded-lg hover:bg-[#20bd5a] transition-all" data-testid="whatsapp-btn">
                  <MessageSquare className="w-4 h-4" /> WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Properties */}
      {similar.length > 0 && (
        <div className="border-t border-gray-100 bg-gray-50" data-testid="similar-properties">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
            <h2 className="text-xl font-bold text-[#04151F] mb-2">
              {similarLabel ? `Ähnliche Objekte in ${similarLabel}` : 'Weitere Investmentmöglichkeiten'}
            </h2>
            <p className="text-sm text-[#04151F]/40 mb-8">
              {similarLabel ? 'Weitere Investmentmöglichkeiten in derselben Region' : 'Entdecken Sie weitere Premium-Immobilien'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similar.map(p => <PropertyCard key={p._id} property={p} />)}
            </div>
            <div className="mt-8 text-center">
              <Link to={similarLabel ? `/properties?location=${encodeURIComponent(similarLabel)}` : '/properties'} className="inline-flex items-center gap-2 px-6 py-2.5 border border-[#C8A96A] text-[#C8A96A] text-sm font-medium rounded-lg hover:bg-[#C8A96A] hover:text-[#04151F] transition-all" data-testid="view-all-location">
                {similarLabel ? `Alle Objekte in ${similarLabel} ansehen` : 'Alle Immobilien ansehen'}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Property Listings Page ─────────────────────────────────────────────
export default function PropertyListings() {
  const [searchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState(searchParams.get('location') || '');
  const [priceRange, setPriceRange] = useState('');

  useEffect(() => {
    let url = `${API}/api/properties?status=available`;
    if (locationFilter) url += `&location=${locationFilter}`;
    if (typeFilter !== 'All') url += `&property_type=${typeFilter}`;
    fetch(url).then(r => r.ok ? r.json() : []).then(d => { setProperties(d); setLoading(false); });
  }, [typeFilter, locationFilter]);

  const filtered = properties.filter(p => {
    if (priceRange === 'under100k') return p.price < 100000;
    if (priceRange === '100k-250k') return p.price >= 100000 && p.price <= 250000;
    if (priceRange === '250k-500k') return p.price >= 250000 && p.price <= 500000;
    if (priceRange === 'over500k') return p.price > 500000;
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50" data-testid="property-listings-page">
      {/* Hero */}
      <div className="bg-[#04151F] pt-24 pb-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Investment Properties</h1>
          <p className="text-white/50 text-sm mb-8 max-w-xl mx-auto">Discover premium real estate opportunities across Montenegro and the Balkans</p>
          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)} className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="filter-location">
              <option value="" style={{ color: '#333' }}>All Locations</option>
              {['Budva', 'Sveti Stefan', 'Pržno', 'Tivat', 'Kotor', 'Herceg Novi', 'Bar', 'Ulcinj', 'Podgorica', 'Nikšić', 'Žabljak'].map(l => <option key={l} value={l} style={{ color: '#333' }}>{l}</option>)}
            </select>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="filter-type">
              {PROPERTY_TYPES.map(t => <option key={t} value={t} style={{ color: '#333' }}>{t === 'All' ? 'All Types' : t}</option>)}
            </select>
            <select value={priceRange} onChange={e => setPriceRange(e.target.value)} className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#C8A96A]" data-testid="filter-price">
              <option value="" style={{ color: '#333' }}>All Prices</option>
              <option value="under100k" style={{ color: '#333' }}>Under 100.000 €</option>
              <option value="100k-250k" style={{ color: '#333' }}>100.000 – 250.000 €</option>
              <option value="250k-500k" style={{ color: '#333' }}>250.000 – 500.000 €</option>
              <option value="over500k" style={{ color: '#333' }}>Over 500.000 €</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <p className="text-sm text-[#04151F]/40 mb-6">{filtered.length} {filtered.length === 1 ? 'property' : 'properties'} found</p>
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-[#C8A96A] border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(p => <PropertyCard key={p._id} property={p} />)}
          </div>
        ) : (
          <div className="text-center py-20 text-[#04151F]/30">
            <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No properties match your filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
