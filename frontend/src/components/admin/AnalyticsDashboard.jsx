import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  Eye, Users, Calculator, Mail, TrendingUp, Monitor, Smartphone, Tablet,
  Download, ArrowUpRight, ArrowDownRight, FileText
} from 'lucide-react';

const COLORS = ['#C8A96A', '#04151F', '#6B7280', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const PAGE_LABELS = {
  '/': 'Startseite',
  '/blog': 'Blog',
  '/contact': 'Kontakt',
  '/team': 'Team',
  '/investment': 'Investment Dashboard',
  '/investment/rechner': 'ROI-Rechner',
  '/investment/vergleich': 'Standort-Vergleich',
  '/immobilien/budva': 'Budva',
  '/immobilien/niksic': 'Nikšić',
  '/immobilien/podgorica': 'Podgorica',
  '/immobilien/skadar-lake': 'Škadarsee',
  '/immobilien/zabljak': 'Žabljak',
  '/serbia-executive': 'Serbien Executive',
  '/infrastruktur-radar': 'Infrastruktur Radar',
  '/impressum': 'Impressum',
  '/datenschutz': 'Datenschutz',
};

const getPageLabel = (path) => {
  if (PAGE_LABELS[path]) return PAGE_LABELS[path];
  if (path.startsWith('/blog/')) return 'Artikel: ' + path.split('/blog/')[1];
  if (path.startsWith('/investment/standort/')) return 'Standort: ' + path.split('/standort/')[1];
  return path;
};

const DEVICE_ICONS = {
  desktop: Monitor,
  mobile: Smartphone,
  tablet: Tablet
};

const DEVICE_LABELS = { desktop: 'Desktop', mobile: 'Mobile', tablet: 'Tablet' };

const AnalyticsDashboard = ({ credentials }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(30);

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/analytics/overview?days=${period}`,
        { headers: { 'Authorization': 'Basic ' + btoa(`${credentials.username}:${credentials.password}`) } }
      );
      if (res.ok) {
        const result = await res.json();
        setData(result);
      }
    } catch (err) {
      console.error('Analytics fetch failed:', err);
    }
    setLoading(false);
  };

  const exportLeadsCSV = () => {
    if (!data?.recent_leads?.length) return;
    const headers = ['Name', 'E-Mail', 'Telefon', 'Quelle', 'Exposé', 'Datum'];
    const rows = data.recent_leads.map(l => [
      l.name, l.email, l.phone || '', l.source, l.expose_name || '', l.submitted_at || ''
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `euroadria-leads-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-3 border-ea-gold border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-20 text-ea-dark/50">
        Keine Daten verfügbar. Die Analytics werden ab sofort gesammelt.
      </div>
    );
  }

  const totalDevices = data.devices.reduce((a, d) => a + d.count, 0) || 1;

  return (
    <div className="space-y-6" data-testid="analytics-dashboard">
      {/* Period Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-ea-dark">Analytics Dashboard</h2>
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setPeriod(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === d 
                  ? 'bg-ea-dark text-white' 
                  : 'bg-gray-100 text-ea-dark/70 hover:bg-gray-200'
              }`}
              data-testid={`period-${d}`}
            >
              {d} Tage
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          icon={Eye}
          label="Seitenaufrufe"
          value={data.total_views.toLocaleString('de-DE')}
          color="bg-blue-50 text-blue-600"
          testId="kpi-views"
        />
        <KPICard
          icon={Users}
          label="Leads"
          value={data.total_leads}
          subtitle={`${data.conversion_rate}% Conversion`}
          color="bg-green-50 text-green-600"
          testId="kpi-leads"
        />
        <KPICard
          icon={Calculator}
          label="ROI-Rechner"
          value={data.calculator_usage}
          subtitle="Berechnungen"
          color="bg-amber-50 text-amber-600"
          testId="kpi-calculator"
        />
        <KPICard
          icon={Mail}
          label="Kontaktanfragen"
          value={data.total_contacts}
          color="bg-purple-50 text-purple-600"
          testId="kpi-contacts"
        />
      </div>

      {/* Traffic Chart */}
      {data.daily_views.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-ea-dark mb-4">Seitenaufrufe (letzte {period} Tage)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.daily_views}>
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 11, fill: '#6B7280' }}
                  tickFormatter={(v) => { const d = new Date(v); return `${d.getDate()}.${d.getMonth()+1}.`; }}
                />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }}
                  labelFormatter={(v) => { const d = new Date(v); return `${d.getDate()}.${d.getMonth()+1}.${d.getFullYear()}`; }}
                />
                <Line type="monotone" dataKey="views" stroke="#C8A96A" strokeWidth={2.5} dot={{ r: 3, fill: '#C8A96A' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Two-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-ea-dark mb-4">Top Seiten</h3>
          {data.top_pages.length > 0 ? (
            <div className="space-y-3">
              {data.top_pages.map((page, i) => {
                const maxViews = data.top_pages[0]?.views || 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-bold text-ea-dark/40 w-5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm text-ea-dark truncate">{getPageLabel(page.path)}</span>
                        <span className="text-sm font-semibold text-ea-dark ml-2">{page.views}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div 
                          className="bg-ea-gold rounded-full h-1.5 transition-all" 
                          style={{ width: `${(page.views / maxViews) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-ea-dark/40 text-sm">Noch keine Daten</p>
          )}
        </div>

        {/* Device & Traffic Sources */}
        <div className="space-y-6">
          {/* Devices */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-ea-dark mb-4">Geräte</h3>
            {data.devices.length > 0 ? (
              <div className="flex items-center gap-6">
                <div className="w-32 h-32 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={data.devices} dataKey="count" nameKey="device" cx="50%" cy="50%" innerRadius={30} outerRadius={55}>
                        {data.devices.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 flex-1">
                  {data.devices.map((d, i) => {
                    const Icon = DEVICE_ICONS[d.device] || Monitor;
                    const pct = Math.round((d.count / totalDevices) * 100);
                    return (
                      <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }}></div>
                          <Icon className="w-4 h-4 text-ea-dark/50" />
                          <span className="text-sm text-ea-dark">{DEVICE_LABELS[d.device] || d.device}</span>
                        </div>
                        <span className="text-sm font-semibold text-ea-dark">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-ea-dark/40 text-sm">Noch keine Daten</p>
            )}
          </div>

          {/* Traffic Sources */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-semibold text-ea-dark mb-4">Traffic-Quellen</h3>
            {data.referrers.length > 0 ? (
              <div className="space-y-2.5">
                {data.referrers.map((r, i) => {
                  const maxRef = data.referrers[0]?.count || 1;
                  return (
                    <div key={i} className="flex items-center gap-3">
                      <span className="text-sm text-ea-dark w-24 truncate">{r.source}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div className="bg-ea-dark rounded-full h-2" style={{ width: `${(r.count / maxRef) * 100}%` }}></div>
                      </div>
                      <span className="text-xs font-semibold text-ea-dark/60 w-8 text-right">{r.count}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-ea-dark/40 text-sm">Noch keine externen Quellen</p>
            )}
          </div>
        </div>
      </div>

      {/* Leads by Source */}
      {data.lead_sources.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-base font-semibold text-ea-dark mb-4">Leads nach Exposé</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.lead_sources.map(l => ({ ...l, label: l.source.replace('_expose', '').replace('_', ' ') }))}>
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#6B7280' }} />
                <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #e5e7eb', fontSize: '13px' }} />
                <Bar dataKey="count" fill="#C8A96A" radius={[6, 6, 0, 0]} name="Leads" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Leads Table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h3 className="text-base font-semibold text-ea-dark">Letzte Leads</h3>
          {data.recent_leads.length > 0 && (
            <button
              onClick={exportLeadsCSV}
              className="flex items-center gap-2 px-4 py-2 bg-ea-dark text-white text-sm font-medium rounded-lg hover:bg-ea-dark/90 transition-all"
              data-testid="export-leads-csv"
            >
              <Download className="w-4 h-4" />
              CSV Export
            </button>
          )}
        </div>
        {data.recent_leads.length > 0 ? (
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2.5 text-ea-dark/50 font-medium">Name</th>
                  <th className="text-left py-2.5 text-ea-dark/50 font-medium">E-Mail</th>
                  <th className="text-left py-2.5 text-ea-dark/50 font-medium hidden sm:table-cell">Telefon</th>
                  <th className="text-left py-2.5 text-ea-dark/50 font-medium">Exposé</th>
                  <th className="text-left py-2.5 text-ea-dark/50 font-medium hidden md:table-cell">Datum</th>
                </tr>
              </thead>
              <tbody>
                {data.recent_leads.map((lead, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-2.5 font-medium text-ea-dark">{lead.name}</td>
                    <td className="py-2.5 text-ea-dark/70">{lead.email}</td>
                    <td className="py-2.5 text-ea-dark/70 hidden sm:table-cell">{lead.phone || '-'}</td>
                    <td className="py-2.5">
                      <span className="bg-ea-gold/10 text-ea-dark text-xs px-2 py-1 rounded-full">
                        {lead.expose_name || lead.source}
                      </span>
                    </td>
                    <td className="py-2.5 text-ea-dark/50 text-xs hidden md:table-cell">
                      {lead.submitted_at ? new Date(lead.submitted_at).toLocaleDateString('de-DE') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-ea-dark/40">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>Noch keine Leads gesammelt</p>
          </div>
        )}
      </div>
    </div>
  );
};

const KPICard = ({ icon: Icon, label, value, subtitle, color, testId }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm" data-testid={testId}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <p className="text-2xl font-bold text-ea-dark">{value}</p>
    <p className="text-sm text-ea-dark/50 mt-0.5">{label}</p>
    {subtitle && <p className="text-xs text-ea-dark/40 mt-1">{subtitle}</p>}
  </div>
);

export default AnalyticsDashboard;
