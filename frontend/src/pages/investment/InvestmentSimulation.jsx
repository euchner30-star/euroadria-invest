import React, { useState, useCallback, useTransition, useEffect } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from 'recharts';
import { Calculator, TrendingUp, Download, AlertTriangle, Info, Loader2, ChevronDown, ChevronUp, MapPin, Shield, Banknote, Mail } from 'lucide-react';
import SEO from '../../components/SEO';
import { simulationApi, investmentApi } from '../../services/api';

const DEFAULT_PARAMS = {
  purchase_price: 250000,
  renovation_costs: 30000,
  additional_costs_percent: 5,
  monthly_rent: 1200,
  vacancy_rate: 5,
  running_costs_percent: 15,
  rent_increase_percent: 3,
  appreciation_percent: 4,
  discount_rate: 4,
  holding_period: 10,
  equity_percent: 100,
  mortgage_rate: 3.5,
  apply_tax: false,
  tax_rate: 9,
  exit_costs_percent: 3
};

const SLIDER_CONFIG = {
  purchase_price: { min: 50000, max: 2000000, step: 10000, label: 'Kaufpreis', unit: 'EUR', format: v => `${(v/1000).toFixed(0)}k` },
  renovation_costs: { min: 0, max: 200000, step: 5000, label: 'Renovierung', unit: 'EUR', format: v => `${(v/1000).toFixed(0)}k` },
  additional_costs_percent: { min: 0, max: 15, step: 0.5, label: 'Nebenkosten', unit: '%' },
  monthly_rent: { min: 200, max: 10000, step: 50, label: 'Monatsmiete', unit: 'EUR' },
  vacancy_rate: { min: 0, max: 30, step: 1, label: 'Leerstand', unit: '%' },
  running_costs_percent: { min: 0, max: 40, step: 1, label: 'Betriebskosten', unit: '%' },
  rent_increase_percent: { min: -2, max: 10, step: 0.5, label: 'Mietsteigerung/Jahr', unit: '%' },
  appreciation_percent: { min: -5, max: 20, step: 0.5, label: 'Wertsteigerung/Jahr', unit: '%' },
  discount_rate: { min: 0, max: 15, step: 0.5, label: 'Diskontierungszins', unit: '%' },
  holding_period: { min: 1, max: 30, step: 1, label: 'Haltedauer', unit: 'Jahre' },
  equity_percent: { min: 10, max: 100, step: 5, label: 'Eigenkapital', unit: '%' },
  mortgage_rate: { min: 0, max: 10, step: 0.25, label: 'Hypothekenzins', unit: '%' },
  tax_rate: { min: 0, max: 30, step: 1, label: 'Steuersatz', unit: '%' },
  exit_costs_percent: { min: 0, max: 10, step: 0.5, label: 'Verkaufskosten', unit: '%' }
};

const fmt = (val, type = 'eur') => {
  if (type === 'eur') return `${val?.toLocaleString('de-DE', { maximumFractionDigits: 0 })} EUR`;
  if (type === 'pct') return `${val?.toFixed(2)}%`;
  return val;
};

const Slider = ({ paramKey, value, onChange }) => {
  const cfg = SLIDER_CONFIG[paramKey];
  const displayVal = cfg.format ? cfg.format(value) : `${value}${cfg.unit === '%' ? '%' : ''}`;

  return (
    <div className="group" data-testid={`slider-${paramKey}`}>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-xs font-medium text-white/60">{cfg.label}</label>
        <span className="text-xs font-bold text-ea-gold tabular-nums">
          {cfg.unit === 'EUR' ? fmt(value) : `${value} ${cfg.unit}`}
        </span>
      </div>
      <input
        type="range"
        min={cfg.min} max={cfg.max} step={cfg.step}
        value={value}
        onChange={e => onChange(paramKey, parseFloat(e.target.value))}
        className="w-full h-1.5 bg-white/10 rounded-full appearance-none cursor-pointer
                   [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                   [&::-webkit-slider-thumb]:bg-ea-gold [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer
                   [&::-webkit-slider-thumb]:shadow-[0_0_8px_rgba(200,169,106,0.4)]
                   hover:[&::-webkit-slider-thumb]:scale-125 [&::-webkit-slider-thumb]:transition-transform"
      />
    </div>
  );
};

const KPICard = ({ label, value, sub, positive }) => (
  <div className="bg-white/[0.04] border border-white/[0.08] rounded-xl p-4 text-center" data-testid={`kpi-${label.toLowerCase().replace(/\s/g, '-')}`}>
    <p className="text-[11px] text-white/40 uppercase tracking-wider mb-1">{label}</p>
    <p className={`text-xl sm:text-2xl font-bold tabular-nums ${positive === true ? 'text-green-400' : positive === false ? 'text-red-400' : 'text-white'}`}>
      {value}
    </p>
    {sub && <p className="text-[11px] text-white/30 mt-0.5">{sub}</p>}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-ea-dark/95 border border-ea-gold/20 rounded-lg px-3 py-2 shadow-xl backdrop-blur">
      <p className="text-ea-gold text-xs font-bold mb-1">Jahr {label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs text-white/80">
          <span style={{ color: p.color }}>{p.name}:</span> {fmt(p.value)}
        </p>
      ))}
    </div>
  );
};

export default function InvestmentSimulation() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [locations, setLocations] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [marketInfo, setMarketInfo] = useState(null);

  useEffect(() => {
    investmentApi.getLocations().then(data => {
      setLocations(data.sort((a, b) => (b.investment_score || 0) - (a.investment_score || 0)));
    }).catch(() => {});
  }, []);

  const handleCitySelect = (city) => {
    setSelectedCity(city);
    if (!city) {
      setMarketInfo(null);
      return;
    }
    const loc = locations.find(l => l.city === city);
    if (!loc) return;

    // Realistische Werte aus Marktdaten ableiten
    const avgSize = 60; // Durchschnittliche Wohnungsgröße m²
    const purchasePrice = Math.round(loc.price_per_m2 * avgSize / 1000) * 1000;
    const monthlyRent = Math.round((loc.rental_yield / 100) * purchasePrice / 12 / 10) * 10;

    setMarketInfo({
      city: loc.city,
      country: loc.country,
      score: loc.investment_score,
      price_m2: loc.price_per_m2,
      yield: loc.rental_yield,
      growth: loc.price_growth
    });

    startTransition(() => {
      setParams(prev => ({
        ...prev,
        purchase_price: purchasePrice,
        monthly_rent: monthlyRent,
        appreciation_percent: Math.min(loc.price_growth, 15),
        rent_increase_percent: Math.min(Math.round(loc.price_growth * 0.4 * 10) / 10, 8)
      }));
    });
  };

  const handleChange = useCallback((key, value) => {
    startTransition(() => {
      setParams(prev => ({ ...prev, [key]: value }));
    });
  }, []);

  const runSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await simulationApi.runSimulation(params);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = async () => {
    setPdfLoading(true);
    try {
      const blob = await simulationApi.downloadExposePdf(params);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'Investment_Expose.pdf';
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('PDF-Download fehlgeschlagen');
    } finally {
      setPdfLoading(false);
    }
  };

  const chartData = result?.yearly_data?.map(y => ({
    year: `${y.year}`,
    cashflow: y.cashflow,
    kumuliert: y.cumulative_cashflow,
    immobilienwert: y.property_value,
    eigenkapital: y.equity_value
  })) || [];

  const basicSliders = ['purchase_price', 'renovation_costs', 'monthly_rent', 'rent_increase_percent', 'appreciation_percent', 'holding_period'];
  const advancedSliders = ['additional_costs_percent', 'vacancy_rate', 'running_costs_percent', 'discount_rate', 'equity_percent', 'mortgage_rate', 'exit_costs_percent'];
  const showMortgage = params.equity_percent < 100;

  return (
    <>
      <SEO
        title="Investment-Simulation | IRR & Cashflow-Prognose"
        description="Berechnen Sie IRR, NPV und kumulierten Cashflow Ihrer Immobilieninvestition mit unserer professionellen 10-Jahres-Simulation."
      />
      <div className="min-h-screen bg-gradient-to-b from-ea-dark via-ea-navy to-ea-dark pt-28 sm:pt-24 pb-16 px-4">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-ea-gold text-sm font-bold tracking-widest uppercase mb-3">Investment Intelligence</p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
              Investment-<span className="text-ea-gold">Simulation</span>
            </h1>
            <p className="text-white/50 max-w-2xl mx-auto text-sm sm:text-base">
              10-Jahres-Prognose mit IRR, NPV und kumuliertem Cashflow. Passen Sie die Parameter an und sehen Sie sofort die Auswirkungen.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* LEFT: Sliders */}
            <div className="lg:col-span-4 space-y-4">
              <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5">
                <h2 className="text-white font-bold text-sm uppercase tracking-wider mb-5 flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-ea-gold" /> Parameter
                </h2>

                {/* City Selector */}
                <div className="mb-5 pb-5 border-b border-white/[0.06]">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-white/60 mb-2">
                    <MapPin className="w-3.5 h-3.5 text-ea-gold" /> Standort wählen
                  </label>
                  <select
                    value={selectedCity}
                    onChange={e => handleCitySelect(e.target.value)}
                    className="w-full bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 py-2.5 text-white text-sm
                               focus:outline-none focus:border-ea-gold/50 appearance-none cursor-pointer"
                    data-testid="city-selector"
                  >
                    <option value="" className="bg-ea-dark">Manuelle Eingabe</option>
                    {locations.map(loc => (
                      <option key={loc.city} value={loc.city} className="bg-ea-dark">
                        {loc.city} ({loc.country}) — Score {Math.round(loc.investment_score)}
                      </option>
                    ))}
                  </select>
                  {marketInfo && (
                    <div className="mt-2.5 p-2.5 bg-ea-gold/[0.06] border border-ea-gold/[0.12] rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-ea-gold text-xs font-bold">{marketInfo.city}</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          marketInfo.score >= 80 ? 'bg-green-500/20 text-green-400' :
                          marketInfo.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-orange-500/20 text-orange-400'
                        }`}>Score {Math.round(marketInfo.score)}</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[10px] text-white/40">
                        <div><span className="text-white/60 font-medium">{marketInfo.price_m2?.toLocaleString('de-DE')}</span> EUR/m²</div>
                        <div><span className="text-white/60 font-medium">{marketInfo.yield}%</span> Rendite</div>
                        <div><span className="text-white/60 font-medium">+{marketInfo.growth}%</span>/Jahr</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {basicSliders.map(key => (
                    <Slider key={key} paramKey={key} value={params[key]} onChange={handleChange} />
                  ))}
                </div>

                {/* Advanced Toggle */}
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center gap-2 text-xs text-white/40 hover:text-ea-gold mt-5 transition-colors"
                  data-testid="toggle-advanced"
                >
                  {showAdvanced ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  Erweiterte Parameter
                </button>

                {showAdvanced && (
                  <div className="space-y-4 mt-4 pt-4 border-t border-white/[0.06]">
                    {advancedSliders.map(key => (
                      <Slider key={key} paramKey={key} value={params[key]} onChange={handleChange} />
                    ))}

                    {/* Tax Toggle */}
                    <div className="pt-3 border-t border-white/[0.06]">
                      <button
                        onClick={() => handleChange('apply_tax', !params.apply_tax)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border transition-all ${
                          params.apply_tax
                            ? 'bg-ea-gold/10 border-ea-gold/30 text-ea-gold'
                            : 'bg-white/[0.04] border-white/[0.08] text-white/50'
                        }`}
                        data-testid="toggle-tax"
                      >
                        <span className="flex items-center gap-2 text-xs font-medium">
                          <Shield className="w-3.5 h-3.5" />
                          Netto nach Steuern (MNE {params.tax_rate}%)
                        </span>
                        <div className={`w-9 h-5 rounded-full flex items-center px-0.5 transition-colors ${
                          params.apply_tax ? 'bg-ea-gold' : 'bg-white/20'
                        }`}>
                          <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                            params.apply_tax ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </div>
                      </button>
                      {params.apply_tax && (
                        <div className="mt-3">
                          <Slider paramKey="tax_rate" value={params.tax_rate} onChange={handleChange} />
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Run Button */}
                <button
                  onClick={runSimulation}
                  disabled={loading}
                  className="w-full mt-6 py-3.5 bg-ea-gold text-ea-dark font-bold rounded-xl
                             hover:bg-ea-gold/90 disabled:opacity-50 transition-all
                             flex items-center justify-center gap-2 text-sm"
                  data-testid="run-simulation-btn"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                  {loading ? 'Berechne...' : 'Simulation starten'}
                </button>

                {error && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <p className="text-xs text-red-400">{error}</p>
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT: Results */}
            <div className="lg:col-span-8 space-y-5">
              {!result ? (
                <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-12 text-center">
                  <Calculator className="w-12 h-12 text-white/10 mx-auto mb-4" />
                  <p className="text-white/30 text-sm">
                    Passen Sie die Parameter an und klicken Sie auf "Simulation starten"
                  </p>
                </div>
              ) : (
                <>
                  {/* KPI Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <KPICard label="IRR" value={fmt(result.irr_percent, 'pct')} sub="Internal Rate of Return" positive={result.irr_percent > params.discount_rate} />
                    <KPICard label="EK-ROI" value={fmt(result.equity_roi_percent, 'pct')} sub={`${params.holding_period} Jahre Eigenkapital-ROI`} positive={result.equity_roi_percent > 0} />
                    <KPICard label="NPV" value={fmt(result.npv)} sub={`Diskontiert @ ${params.discount_rate}%`} positive={result.npv > 0} />
                    <KPICard label="Gesamtgewinn" value={fmt(result.total_profit)} sub={`Break-Even: Jahr ${result.break_even_year || '–'}`} positive={result.total_profit > 0} />
                  </div>

                  {/* Investment Summary */}
                  <div className={`grid gap-3 ${result.tax_applied || result.exit_costs > 0 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'}`}>
                    <KPICard label="Investition" value={fmt(result.total_investment)} />
                    <KPICard label="Endwert" value={fmt(result.final_property_value)} positive={result.value_appreciation > 0} />
                    {result.exit_costs > 0 && (
                      <KPICard label="Exit-Kosten" value={fmt(result.exit_costs)} sub={`${params.exit_costs_percent}% Maklergebühr`} positive={false} />
                    )}
                    <KPICard label="Netto-Wertzuwachs" value={fmt(result.value_appreciation)} positive={result.value_appreciation > 0} />
                  </div>

                  {/* Tax & Financing Summary */}
                  {(result.tax_applied || result.debt_amount > 0) && (
                    <div className={`grid gap-3 ${result.tax_applied && result.debt_amount > 0 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'}`}>
                      {result.tax_applied && (
                        <KPICard label="Gezahlte Steuer" value={fmt(result.total_tax_paid)} sub={`MNE Pauschal ${result.tax_rate_used}%`} positive={false} />
                      )}
                      {result.debt_amount > 0 && (
                        <>
                          <KPICard label="Eigenkapital" value={fmt(result.equity_invested)} sub={`${params.equity_percent}% der Investition`} />
                          <KPICard label="Fremdkapital" value={fmt(result.debt_amount)} sub={`${params.mortgage_rate}% Hypothekenzins`} />
                          <KPICard label="Ges. Cashflow" value={fmt(result.total_cashflow)} sub="Nach Hypothek & Steuer" positive={result.total_cashflow > 0} />
                        </>
                      )}
                    </div>
                  )}

                  {/* Lead-Gen: Financing CTA */}
                  {showMortgage && result && (
                    <div className="bg-gradient-to-r from-ea-gold/[0.08] to-ea-gold/[0.03] border border-ea-gold/20 rounded-2xl p-5 sm:p-6" data-testid="financing-cta">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <Banknote className="w-6 h-6 text-ea-gold shrink-0 mt-0.5" />
                          <div>
                            <h3 className="text-white font-bold text-sm mb-1">Finanzierung für dieses Objekt anfragen</h3>
                            <p className="text-white/50 text-xs leading-relaxed">
                              Benötigtes Fremdkapital: <strong className="text-white/70">{fmt(result.debt_amount)}</strong> bei {params.mortgage_rate}% Zins.
                              Unsere Partner-Banken in Montenegro bieten exklusive Konditionen für ausländische Investoren.
                            </p>
                          </div>
                        </div>
                        <a
                          href={`/kontakt?betreff=Finanzierungsanfrage&betrag=${encodeURIComponent(fmt(result.debt_amount))}`}
                          className="shrink-0 flex items-center gap-2 px-5 py-3 bg-ea-gold text-ea-dark font-bold rounded-xl
                                     hover:bg-ea-gold/90 transition-all text-sm whitespace-nowrap"
                          data-testid="financing-request-btn"
                        >
                          <Mail className="w-4 h-4" />
                          Jetzt anfragen
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Cumulative Cashflow Chart */}
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 sm:p-6">
                    <h3 className="text-white font-bold text-sm mb-4">Kumulierter Cashflow & Immobilienwert</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="gradCf" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#C8A96A" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#C8A96A" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="gradVal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#34D399" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)' }} />
                        <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                        <Area type="monotone" dataKey="kumuliert" name="Kum. Cashflow" stroke="#C8A96A" fill="url(#gradCf)" strokeWidth={2} />
                        <Area type="monotone" dataKey="eigenkapital" name="Eigenkapital" stroke="#34D399" fill="url(#gradVal)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Annual Cashflow Bar Chart */}
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-4 sm:p-6">
                    <h3 className="text-white font-bold text-sm mb-4">Jährlicher Cashflow</h3>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="year" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                        <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar dataKey="cashflow" name="Cashflow" fill="#C8A96A" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Data Table */}
                  <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl overflow-hidden">
                    <div className="p-4 sm:p-5 flex items-center justify-between">
                      <h3 className="text-white font-bold text-sm">Jahresübersicht</h3>
                      <button
                        onClick={downloadPdf}
                        disabled={pdfLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-ea-gold/10 border border-ea-gold/20 text-ea-gold
                                   rounded-lg text-xs font-semibold hover:bg-ea-gold/20 transition-all disabled:opacity-50"
                        data-testid="download-pdf-btn"
                      >
                        {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                        PDF Exposé
                      </button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs" data-testid="simulation-table">
                        <thead>
                          <tr className="border-t border-white/[0.06]">
                            <th className="px-3 py-2.5 text-left text-white/40 font-medium">Jahr</th>
                            <th className="px-3 py-2.5 text-right text-white/40 font-medium">Bruttomiete</th>
                            <th className="px-3 py-2.5 text-right text-white/40 font-medium">Netto-Miete</th>
                            {result.tax_applied && (
                              <th className="px-3 py-2.5 text-right text-white/40 font-medium">Steuer ({result.tax_rate_used}%)</th>
                            )}
                            {result.debt_amount > 0 && (
                              <th className="px-3 py-2.5 text-right text-white/40 font-medium">Annuität</th>
                            )}
                            <th className="px-3 py-2.5 text-right text-white/40 font-medium">Cashflow</th>
                            <th className="px-3 py-2.5 text-right text-white/40 font-medium">Kum. CF</th>
                            <th className="px-3 py-2.5 text-right text-white/40 font-medium">Immobilienwert</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.yearly_data.map(y => (
                            <tr key={y.year} className="border-t border-white/[0.04] hover:bg-white/[0.02]">
                              <td className="px-3 py-2 text-white/60 font-medium">{y.year}</td>
                              <td className="px-3 py-2 text-right text-white/50 tabular-nums">{fmt(y.gross_rent)}</td>
                              <td className="px-3 py-2 text-right text-white/50 tabular-nums">{fmt(y.net_rental_income)}</td>
                              {result.tax_applied && (
                                <td className="px-3 py-2 text-right text-red-400/60 tabular-nums">-{fmt(y.tax_amount)}</td>
                              )}
                              {result.debt_amount > 0 && (
                                <td className="px-3 py-2 text-right text-orange-400/60 tabular-nums">-{fmt(y.mortgage_payment)}</td>
                              )}
                              <td className={`px-3 py-2 text-right font-medium tabular-nums ${y.cashflow >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                {fmt(y.cashflow)}
                              </td>
                              <td className={`px-3 py-2 text-right tabular-nums ${y.cumulative_cashflow >= 0 ? 'text-green-400/70' : 'text-red-400/70'}`}>
                                {fmt(y.cumulative_cashflow)}
                              </td>
                              <td className="px-3 py-2 text-right text-ea-gold/70 tabular-nums">{fmt(y.property_value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Legal Disclaimer */}
                  <div className="bg-amber-500/[0.06] border border-amber-500/20 rounded-2xl p-4 sm:p-5">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">Wichtiger Hinweis — Keine Anlageberatung</h3>
                        <p className="text-white/50 text-xs leading-relaxed">
                          Diese Simulation dient ausschließlich zu <strong className="text-white/70">Informations- und Veranschaulichungszwecken</strong> und stellt
                          keine Anlageberatung, Kaufempfehlung oder Renditegarantie dar. Alle dargestellten Zahlen, Prognosen und Ergebnisse basieren
                          auf den vom Benutzer eingegebenen Annahmen und vereinfachten Modellen.
                          <strong className="text-white/70"> Tatsächliche Ergebnisse können erheblich abweichen.</strong>
                        </p>
                        <p className="text-white/40 text-[11px] mt-2 leading-relaxed">
                          Insbesondere können Faktoren wie Steuern, Finanzierungskonditionen, Währungsrisiken, politische Veränderungen,
                          Marktvolatilität, Instandhaltungskosten und unvorhergesehene Ereignisse die tatsächliche Rendite wesentlich beeinflussen.
                          Konsultieren Sie vor jeder Investitionsentscheidung einen qualifizierten und unabhängigen Finanzberater.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Formulas */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="w-4 h-4 text-white/30" />
                      <h3 className="text-white/40 font-medium text-xs uppercase tracking-wider">Berechnungsgrundlagen</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-white/30 leading-relaxed">
                      <div>
                        <p><strong className="text-white/50">IRR:</strong> Interner Zinsfuß, bei dem der Barwert aller Cashflows = 0</p>
                        <p><strong className="text-white/50">NPV:</strong> Barwert = &Sigma; CF(t) / (1+r)<sup>t</sup></p>
                      </div>
                      <div>
                        <p><strong className="text-white/50">EK-ROI:</strong> (Gesamtgewinn / Eigenkapital) &times; 100</p>
                        <p><strong className="text-white/50">Wertsteigerung:</strong> V(t) = V(0) &times; (1+g)<sup>t</sup></p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
