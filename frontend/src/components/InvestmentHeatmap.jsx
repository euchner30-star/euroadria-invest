import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Euro, Percent, TrendingUp, MapPin } from 'lucide-react';

const VIEWS = [
  { key: 'price', label: 'Preis/m²', icon: Euro, unit: '€/m²', format: v => `${v.toLocaleString('de-DE')} €` },
  { key: 'yield', label: 'Mietrendite', icon: Percent, unit: '%', format: v => `${v.toFixed(1)}%` },
  { key: 'growth', label: 'Wachstum', icon: TrendingUp, unit: '%/Jahr', format: v => `${v.toFixed(1)}%` },
];

const getColor = (value, min, max, view) => {
  const ratio = max === min ? 0.5 : (value - min) / (max - min);
  if (view === 'price') {
    // Lower price = green, higher = red
    const r = Math.round(40 + ratio * 200);
    const g = Math.round(200 - ratio * 150);
    const b = Math.round(80 - ratio * 40);
    return `rgb(${r}, ${g}, ${b})`;
  }
  // Higher yield/growth = green, lower = orange
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

const InvestmentHeatmap = ({ locations }) => {
  const [activeView, setActiveView] = useState('price');
  const [hoveredLoc, setHoveredLoc] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const montenegroLocs = useMemo(() => 
    locations.filter(l => l.country === 'Montenegro'), [locations]);
  
  const serbiaLocs = useMemo(() => 
    locations.filter(l => l.country === 'Serbien'), [locations]);

  const allValues = useMemo(() => 
    locations.map(l => getValue(l, activeView)), [locations, activeView]);
  
  const minVal = Math.min(...allValues);
  const maxVal = Math.max(...allValues);

  const viewConfig = VIEWS.find(v => v.key === activeView);

  // Map boundaries for positioning
  const MNE_BOUNDS = { lat: { min: 41.85, max: 43.55 }, lng: { min: 18.45, max: 20.35 } };
  const SRB_BOUNDS = { lat: { min: 42.2, max: 46.2 }, lng: { min: 18.8, max: 23.0 } };

  const getPosition = (loc, bounds, mapWidth, mapHeight) => {
    const x = ((loc.longitude - bounds.lng.min) / (bounds.lng.max - bounds.lng.min)) * mapWidth;
    const y = mapHeight - ((loc.latitude - bounds.lat.min) / (bounds.lat.max - bounds.lat.min)) * mapHeight;
    return { x: Math.max(20, Math.min(mapWidth - 20, x)), y: Math.max(20, Math.min(mapHeight - 20, y)) };
  };

  const handleMouseEnter = (loc, e) => {
    setHoveredLoc(loc);
    const rect = e.currentTarget.closest('.heatmap-container')?.getBoundingClientRect();
    if (rect) {
      setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top - 10 });
    }
  };

  const renderMap = (locs, bounds, title, width, height) => (
    <div className="relative">
      <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
        <MapPin className="w-4 h-4 text-ea-gold" />
        {title}
      </h3>
      <div className="relative bg-white/5 border border-white/10 rounded-2xl overflow-hidden" style={{ width: '100%', height }}>
        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          {[...Array(5)].map((_, i) => (
            <React.Fragment key={i}>
              <line x1={`${(i + 1) * 16.6}%`} y1="0" x2={`${(i + 1) * 16.6}%`} y2="100%" stroke="white" strokeWidth="0.5" />
              <line x1="0" y1={`${(i + 1) * 20}%`} x2="100%" y2={`${(i + 1) * 20}%`} stroke="white" strokeWidth="0.5" />
            </React.Fragment>
          ))}
        </svg>
        
        {locs.map(loc => {
          const pos = getPosition(loc, bounds, 100, 100);
          const value = getValue(loc, activeView);
          const color = getColor(value, minVal, maxVal, activeView);
          const size = 14 + (value - minVal) / (maxVal - minVal || 1) * 16;
          
          return (
            <Link
              key={loc.city}
              to={`/investment/standort/${encodeURIComponent(loc.city)}`}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
              onMouseEnter={(e) => handleMouseEnter(loc, e)}
              onMouseLeave={() => setHoveredLoc(null)}
              data-testid={`heatmap-${loc.city.toLowerCase()}`}
            >
              {/* Pulse animation */}
              <div
                className="absolute rounded-full animate-ping opacity-20"
                style={{ 
                  width: size + 10, height: size + 10, 
                  backgroundColor: color,
                  left: -5, top: -5
                }}
              />
              {/* Dot */}
              <div 
                className="rounded-full border-2 border-white/30 shadow-lg transition-all duration-200 group-hover:scale-150 group-hover:border-ea-gold"
                style={{ 
                  width: size, height: size, 
                  backgroundColor: color,
                  boxShadow: `0 0 ${size}px ${color}40`
                }}
              />
              {/* Label */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-6 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs font-semibold text-white bg-ea-dark/90 px-2 py-0.5 rounded">
                  {loc.city}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="heatmap-container relative" data-testid="investment-heatmap">
      {/* View Selector */}
      <div className="flex flex-wrap gap-2 mb-6">
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
            {view.label}
          </button>
        ))}
      </div>

      {/* Maps Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {renderMap(montenegroLocs, MNE_BOUNDS, 'Montenegro', 100, 320)}
        {renderMap(serbiaLocs, SRB_BOUNDS, 'Serbien', 100, 320)}
      </div>

      {/* Tooltip */}
      {hoveredLoc && (
        <div 
          className="absolute z-50 pointer-events-none bg-ea-dark/95 border border-ea-gold/30 rounded-xl p-4 shadow-2xl backdrop-blur min-w-[220px]"
          style={{ left: tooltipPos.x + 15, top: tooltipPos.y - 60 }}
        >
          <p className="text-white font-bold text-base mb-1">{hoveredLoc.city}</p>
          <p className="text-ea-light/50 text-xs mb-3">{hoveredLoc.country}</p>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-ea-light/60">Preis/m²</span>
              <span className="text-white font-medium">{hoveredLoc.price_per_m2.toLocaleString('de-DE')} €</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ea-light/60">Mietrendite</span>
              <span className="text-green-400 font-medium">{hoveredLoc.rental_yield}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ea-light/60">Wachstum/Jahr</span>
              <span className="text-ea-gold font-medium">+{hoveredLoc.price_growth}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-ea-light/60">Investment Score</span>
              <span className="text-white font-bold">{hoveredLoc.investment_score}</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-4 flex items-center justify-between text-xs text-ea-light/50">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(minVal, minVal, maxVal, activeView) }} />
          <span>{activeView === 'price' ? 'Günstiger' : 'Niedriger'}</span>
        </div>
        <span className="text-ea-light/30">Kreise zeigen {viewConfig?.label} • Klick für Details</span>
        <div className="flex items-center gap-2">
          <span>{activeView === 'price' ? 'Teurer' : 'Höher'}</span>
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getColor(maxVal, minVal, maxVal, activeView) }} />
        </div>
      </div>
    </div>
  );
};

export default InvestmentHeatmap;
