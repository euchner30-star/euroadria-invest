import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Euro, Percent, TrendingUp, MapPin, ExternalLink } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { useLanguage } from '../context/LanguageContext';
import 'leaflet/dist/leaflet.css';

const VIEWS = [
  { key: 'price', label: 'Preis/m\u00B2', icon: Euro, unit: '\u20AC/m\u00B2', format: v => `${v.toLocaleString('de-DE')} \u20AC` },
  { key: 'yield', label: 'Mietrendite', icon: Percent, unit: '%', format: v => `${v.toFixed(1)}%` },
  { key: 'growth', label: 'Wachstum', icon: TrendingUp, unit: '%/Jahr', format: v => `${v.toFixed(1)}%` },
];

const getColor = (value, min, max, view) => {
  const ratio = max === min ? 0.5 : (value - min) / (max - min);
  if (view === 'price') {
    const r = Math.round(40 + ratio * 200);
    const g = Math.round(200 - ratio * 150);
    const b = Math.round(80 - ratio * 40);
    return `rgb(${r}, ${g}, ${b})`;
  }
  const r = Math.round(240 - ratio * 200);
  const g = Math.round(80 + ratio * 140);
  const b = Math.round(40 + ratio * 20);
  return `rgb(${r}, ${g}, ${b})`;
};

const getValue = (loc, view) => {
  if (view === 'price') return loc.price_per_m2;
  if (view === 'yield') return loc.rental_yield;
  return loc.price_growth;
};

const FitBounds = ({ locations }) => {
  const map = useMap();
  useEffect(() => {
    if (locations.length > 0) {
      const bounds = locations.map(l => [l.latitude, l.longitude]);
      map.fitBounds(bounds, { padding: [30, 30], maxZoom: 9 });
    }
  }, [locations, map]);
  return null;
};

const CountryMap = ({ locs, title, allMin, allMax, activeView, getRadius }) => {
  if (locs.length === 0) return null;

  const avgLat = locs.reduce((s, l) => s + l.latitude, 0) / locs.length;
  const avgLng = locs.reduce((s, l) => s + l.longitude, 0) / locs.length;

  return (
    <div>
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-ea-gold" />
        {title}
      </h3>
      <div className="rounded-2xl overflow-hidden border border-white/10" style={{ height: '380px' }}>
        <MapContainer
          center={[avgLat, avgLng]}
          zoom={7}
          className="w-full h-full"
          scrollWheelZoom={true}
          zoomControl={true}
          style={{ background: '#0a1628' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          <FitBounds locations={locs} />

          {locs.map(loc => {
            const value = getValue(loc, activeView);
            const color = getColor(value, allMin, allMax, activeView);
            const radius = getRadius(value);

            return (
              <CircleMarker
                key={`${loc.city}-${activeView}`}
                center={[loc.latitude, loc.longitude]}
                radius={radius}
                pathOptions={{
                  fillColor: color,
                  fillOpacity: 0.85,
                  color: 'rgba(255,255,255,0.4)',
                  weight: 2,
                }}
              >
                <Popup className="ea-popup">
                  <div className="min-w-[200px]" style={{ fontFamily: 'inherit' }}>
                    <p className="font-bold text-base mb-0.5">{loc.city}</p>
                    <p className="text-gray-500 text-xs mb-2">{loc.country}</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price/m²</span>
                        <span className="font-semibold">{loc.price_per_m2.toLocaleString('de-DE')} €</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Rental Yield</span>
                        <span className="font-semibold text-green-600">{loc.rental_yield}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Growth/Year</span>
                        <span className="font-semibold text-amber-600">+{loc.price_growth}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Investment Score</span>
                        <span className="font-bold">{loc.investment_score}</span>
                      </div>
                    </div>
                    <Link
                      to={`/investment/standort/${encodeURIComponent(loc.city)}`}
                      className="mt-3 flex items-center justify-center gap-1 bg-[#04151F] text-white text-xs font-medium py-2 px-3 rounded-lg hover:bg-[#0a2540] transition-colors no-underline"
                    >
                      Details <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
};

const InvestmentHeatmap = ({ locations }) => {
  const [activeView, setActiveView] = useState('price');
  const { lang } = useLanguage();
  const en = lang === 'en';

  const montenegroLocs = useMemo(() =>
    locations.filter(l => l.country === 'Montenegro'), [locations]);

  const serbiaLocs = useMemo(() =>
    locations.filter(l => l.country === 'Serbia'), [locations]);

  const allValues = useMemo(() =>
    locations.map(l => getValue(l, activeView)), [locations, activeView]);

  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);
  const viewConfig = VIEWS.find(v => v.key === activeView);

  const getRadius = (value) => {
    const ratio = maxVal === minVal ? 0.5 : (value - minVal) / (maxVal - minVal);
    return 8 + ratio * 14;
  };

  const viewLabels = en 
    ? { price: 'Price/m²', yield: 'Rental Yield', growth: 'Growth' }
    : { price: 'Preis/m²', yield: 'Mietrendite', growth: 'Wachstum' };

  return (
    <div className="heatmap-container relative" data-testid="investment-heatmap">
      {/* View Selector */}
      <div className="flex flex-wrap gap-2 mb-4">
        {VIEWS.map(view => (
          <button
            key={view.key}
            onClick={() => setActiveView(view.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeView === view.key
                ? 'bg-ea-gold text-ea-dark'
                : 'bg-white/5 text-ea-light/70 hover:bg-white/10 border border-white/10'
            }`}
            data-testid={`heatmap-view-${view.key}`}
          >
            <view.icon className="w-4 h-4" />
            {viewLabels[view.key]}
          </button>
        ))}
      </div>

      {/* Two Maps Side by Side */}
      <div className="grid lg:grid-cols-2 gap-6">
        <CountryMap
          locs={montenegroLocs}
          title="Montenegro"
          allMin={minVal}
          allMax={maxVal}
          activeView={activeView}
          getRadius={getRadius}
        />
        <CountryMap
          locs={serbiaLocs}
          title={en ? 'Serbia' : 'Serbien'}
          allMin={minVal}
          allMax={maxVal}
          activeView={activeView}
          getRadius={getRadius}
        />
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between text-xs text-ea-light/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(minVal, minVal, maxVal, activeView) }} />
          <span>{activeView === 'price' ? (en ? 'Cheaper' : 'Günstiger') : (en ? 'Lower' : 'Niedriger')}</span>
        </div>
        <span className="text-ea-light/30">{en ? `Circles show ${viewLabels[activeView]} · Click for details` : `Kreise zeigen ${viewLabels[activeView]} · Klick für Details`}</span>
        <div className="flex items-center gap-2">
          <span>{activeView === 'price' ? (en ? 'More expensive' : 'Teurer') : (en ? 'Higher' : 'Höher')}</span>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(maxVal, minVal, maxVal, activeView) }} />
        </div>
      </div>
    </div>
  );
};

export default InvestmentHeatmap;
