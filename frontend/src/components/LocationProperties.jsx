import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, BedDouble, Building2 } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function LocationProperties({ location, en }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/properties?location=${encodeURIComponent(location)}&status=available`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { setProperties(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [location]);

  if (loading) return <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-ea-gold border-t-transparent rounded-full animate-spin" /></div>;

  if (properties.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" data-testid="location-properties">
      {properties.map(p => (
        <Link to={`/properties/${p._id}`} key={p._id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-ea-gold/40 hover:shadow-lg transition-all group" data-testid={`loc-property-${p._id}`}>
          <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
            {p.cover_image ? (
              <img src={`${API}/api/properties/img/${p.cover_image}`} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Building2 className="w-10 h-10 text-gray-200" /></div>
            )}
            <div className="absolute top-3 left-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-green-500/90 text-white backdrop-blur-sm">Available</span>
            </div>
            <div className="absolute top-3 right-3">
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm">{p.property_type}</span>
            </div>
          </div>
          <div className="p-4">
            <h3 className="text-base font-bold text-ea-dark mb-1 line-clamp-1">{p.title}</h3>
            <div className="flex items-center gap-4 text-xs text-ea-dark/50 mb-2">
              {p.area_sqm > 0 && <span className="flex items-center gap-1"><Maximize className="w-3.5 h-3.5" />{p.area_sqm} m²</span>}
              {p.rooms > 0 && <span className="flex items-center gap-1"><BedDouble className="w-3.5 h-3.5" />{p.rooms} {en ? 'Rooms' : 'Zimmer'}</span>}
            </div>
            <p className="text-lg font-bold text-ea-dark">{p.price_on_request ? <span className="text-[#C8A96A]">Price on Request</span> : <>{p.price?.toLocaleString('de-DE')} <span className="text-sm font-normal text-ea-dark/40">EUR</span></>}</p>
          </div>
        </Link>
      ))}
      <Link to={`/properties?location=${encodeURIComponent(location)}`} className="bg-ea-light border border-dashed border-ea-gold/30 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:border-ea-gold/60 transition-all">
        <MapPin className="w-8 h-8 text-ea-gold mb-3" />
        <p className="text-ea-dark font-semibold mb-1">{en ? 'View All Properties' : 'Alle Immobilien ansehen'}</p>
        <p className="text-ea-dark/40 text-xs">{en ? `in ${location}` : `in ${location}`}</p>
      </Link>
    </div>
  );
}
