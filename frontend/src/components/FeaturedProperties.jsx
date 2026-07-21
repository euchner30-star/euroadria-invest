import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Maximize, BedDouble, ArrowRight, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

const API = process.env.REACT_APP_BACKEND_URL;

export default function FeaturedProperties({ lang = 'en' }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/api/properties?status=available`)
      .then(r => r.ok ? r.json() : [])
      .then(d => { setProperties(d.slice(0, 6)); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading || properties.length === 0) return null;

  const en = lang === 'en';

  return (
    <section className="py-20 bg-white" data-testid="featured-properties-section">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-block bg-ea-gold/10 border border-ea-gold/30 text-sm text-ea-dark px-4 py-2 rounded-full mb-4 font-medium">
              {en ? 'Real Estate' : 'Immobilien'}
            </div>
            <h2 className="text-3xl md:text-4xl font-semibold text-ea-dark">
              {en ? <>Premium <span className="text-ea-gold">Investment Properties</span></> : <>Premium <span className="text-ea-gold">Investment Immobilien</span></>}
            </h2>
            <p className="text-ea-dark/60 mt-3 max-w-xl text-base">
              {en
                ? 'Handpicked real estate opportunities across Montenegro. From coastal apartments to luxury villas.'
                : 'Handverlesene Immobilien-Möglichkeiten in Montenegro. Von Küsten-Apartments bis Luxus-Villen.'}
            </p>
          </div>
          <Link
            to="/properties"
            className="inline-flex items-center gap-2 px-6 py-3 bg-ea-dark text-white font-semibold text-sm rounded-xl hover:bg-ea-dark/90 transition-all shrink-0"
            data-testid="view-all-properties-btn"
          >
            {en ? 'View All Properties' : 'Alle Immobilien'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Property Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => (
            <Link
              key={p._id}
              to={`/properties/${p._id}`}
              className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-ea-gold/40 hover:shadow-xl transition-all duration-300"
              data-testid={`featured-property-${p._id}`}
            >
              {/* Image */}
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                {p.cover_image ? (
                  <img
                    src={`${API}/api/properties/img/${p.cover_image}`}
                    alt={p.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                    <Building2 className="w-12 h-12 text-gray-200" />
                  </div>
                )}
                {/* Location Badge */}
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-ea-dark flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-ea-gold" />
                    {p.location}
                  </span>
                </div>
                {/* Type Badge */}
                <div className="absolute top-3 right-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full bg-black/40 text-white backdrop-blur-sm">
                    {p.property_type}
                  </span>
                </div>
                {/* Price Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 pt-8">
                  <p className="text-white text-xl font-bold">
                    {p.price_on_request ? 'Price on Request' : p.price > 0 ? `${p.price.toLocaleString('de-DE')} €` : 'On Request'}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-bold text-ea-dark mb-2 line-clamp-1 group-hover:text-ea-gold transition-colors">
                  {p.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-ea-dark/50">
                  {p.area_sqm > 0 && (
                    <span className="flex items-center gap-1">
                      <Maximize className="w-3.5 h-3.5" />
                      {p.area_sqm} m²
                    </span>
                  )}
                  {p.rooms > 0 && (
                    <span className="flex items-center gap-1">
                      <BedDouble className="w-3.5 h-3.5" />
                      {p.rooms} {en ? 'Rooms' : 'Zimmer'}
                    </span>
                  )}
                  {p.area_sqm > 0 && p.price > 0 && !p.price_on_request && (
                    <span className="text-ea-gold font-medium">
                      {Math.round(p.price / p.area_sqm).toLocaleString('de-DE')} €/m²
                    </span>
                  )}
                </div>
                {p.features?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {p.features.slice(0, 3).map(f => (
                      <span key={f} className="text-[10px] bg-ea-gold/10 text-ea-dark/60 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        {properties.length >= 3 && (
          <div className="text-center mt-12">
            <Link
              to="/properties"
              className="inline-flex items-center gap-2 text-ea-gold font-semibold hover:text-ea-dark transition-colors"
            >
              {en ? `Discover all ${properties.length}+ properties` : `Alle ${properties.length}+ Immobilien entdecken`}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
