import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TrendingUp, MapPin, Building2, Target, ArrowUpRight, 
  Percent, Euro, BarChart3, Layers
} from 'lucide-react';
import { investmentApi } from '../../services/api';
import SEO from '../../components/SEO';
import InvestmentHeatmap from '../../components/InvestmentHeatmap';
import T from '../../components/T';
import { useLanguage } from '../../context/LanguageContext';


const InvestmentDashboard = () => {
  const [stats, setStats] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { lang } = useLanguage();
  const en = lang === 'en';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsData, locsData] = await Promise.all([
          investmentApi.getDashboardStats(),
          investmentApi.getLocations()
        ]);
        setStats(statsData);
        setLocations(locsData);
      } catch (err) {
        console.error('Failed to fetch stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ea-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ea-gold"></div>
      </div>
    );
  }

  const ScoreColor = (score) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  return (
    
    <>
      <SEO 
        title="Investment Dashboard | EuroAdria Corporate Solutions"
        description="Übersicht der Top-Investmentstandorte in Montenegro und Serbien mit aktuellen Kennzahlen."
      />
      
      <div className="min-h-screen bg-gradient-to-b from-ea-dark via-ea-navy to-ea-dark">
        {/* Hero */}
        <div className="relative pt-24 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-ea-gold text-sm font-bold tracking-widest uppercase mb-4">
              Investment Intelligence
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Balkan Investment Dashboard
            </h1>
            <p className="text-ea-light/70 text-lg max-w-2xl mx-auto">
              {en ? 'Data-driven analysis of the best investment locations in Montenegro and Serbia' : 'Datengetriebene Analyse der besten Investmentstandorte in Montenegro und Serbien'}
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 pb-16">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
              <div className="flex items-center space-x-3 mb-2">
                <MapPin className="w-5 h-5 text-ea-gold" />
                <span className="text-ea-light/60 text-sm">{en ? 'Locations' : 'Standorte'}</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.total_locations || 0}</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
              <div className="flex items-center space-x-3 mb-2">
                <Building2 className="w-5 h-5 text-ea-gold" />
                <span className="text-ea-light/60 text-sm">{en ? 'Infrastructure' : 'Infrastruktur'}</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.total_infrastructure || 0}</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
              <div className="flex items-center space-x-3 mb-2">
                <Target className="w-5 h-5 text-ea-gold" />
                <span className="text-ea-light/60 text-sm">Opportunity Zones</span>
              </div>
              <p className="text-3xl font-bold text-white">{stats?.total_zones || 0}</p>
            </div>
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
              <div className="flex items-center space-x-3 mb-2">
                <Layers className="w-5 h-5 text-ea-gold" />
                <span className="text-ea-light/60 text-sm">Länder</span>
              </div>
              <p className="text-3xl font-bold text-white">2</p>
              <p className="text-xs text-ea-light/40 mt-1">Montenegro & Serbien</p>
            </div>
          </div>

          {/* Investment Heatmap */}
          {locations.length > 0 && (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex items-center space-x-2 mb-6">
                <BarChart3 className="w-5 h-5 text-ea-gold" />
                <h2 className="text-xl font-bold text-white">Investment Heatmap</h2>
              </div>
              <InvestmentHeatmap locations={locations} />
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Top Investment Scores */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="w-5 h-5 text-ea-gold" />
                <h2 className="text-xl font-bold text-white">Top Investment-Score</h2>
              </div>
              <div className="space-y-3">
                {stats?.top_investment?.slice(0, 5).map((loc, i) => (
                  <Link 
                    key={loc.city} 
                    to={`/investment/standort/${encodeURIComponent(loc.city)}`}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-ea-gold/20 flex items-center justify-center text-ea-gold text-sm font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-white font-medium group-hover:text-ea-gold transition-colors">{loc.city}</p>
                        <p className="text-ea-light/50 text-xs">{loc.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-bold ${ScoreColor(loc.investment_score)}`}>
                        {loc.investment_score}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-ea-light/40 group-hover:text-ea-gold transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Highest Yield */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Percent className="w-5 h-5 text-green-400" />
                <h2 className="text-xl font-bold text-white">Höchste Mietrendite</h2>
              </div>
              <div className="space-y-3">
                {stats?.highest_yield?.slice(0, 5).map((loc, i) => (
                  <Link 
                    key={loc.city} 
                    to={`/investment/standort/${encodeURIComponent(loc.city)}`}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 text-sm font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-white font-medium group-hover:text-ea-gold transition-colors">{loc.city}</p>
                        <p className="text-ea-light/50 text-xs">{loc.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-green-400">{loc.rental_yield}%</span>
                      <ArrowUpRight className="w-4 h-4 text-ea-light/40 group-hover:text-ea-gold transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Strongest Growth */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h2 className="text-xl font-bold text-white">Stärkstes Preiswachstum</h2>
              </div>
              <div className="space-y-3">
                {stats?.strongest_growth?.slice(0, 5).map((loc, i) => (
                  <Link 
                    key={loc.city} 
                    to={`/investment/standort/${encodeURIComponent(loc.city)}`}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-sm font-bold">
                        {i + 1}
                      </span>
                      <div>
                        <p className="text-white font-medium group-hover:text-ea-gold transition-colors">{loc.city}</p>
                        <p className="text-ea-light/50 text-xs">{loc.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-blue-400">+{loc.price_growth}%</span>
                      <ArrowUpRight className="w-4 h-4 text-ea-light/40 group-hover:text-ea-gold transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* New Infrastructure Projects */}
          <div className="mt-8 bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <Building2 className="w-5 h-5 text-ea-gold" />
                <h2 className="text-xl font-bold text-white">Aktuelle Infrastrukturprojekte</h2>
              </div>
              <Link to="/infrastruktur-radar" className="text-ea-gold text-sm hover:underline flex items-center space-x-1">
                <span>Zur Karte</span>
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats?.new_infrastructure?.map((proj) => (
                <div key={proj.id} className="bg-white/5 rounded-xl p-4 border border-white/5">
                  <div className="flex items-start justify-between mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      proj.status === 'construction' ? 'bg-yellow-500/20 text-yellow-400' :
                      proj.status === 'planned' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {proj.status === 'construction' ? 'Im Bau' : 
                       proj.status === 'planned' ? 'Geplant' : proj.status}
                    </span>
                    <span className="text-ea-light/40 text-xs">{proj.type}</span>
                  </div>
                  <h3 className="text-white font-medium mb-1">{proj.project_name}</h3>
                  {proj.completion_year && (
                    <p className="text-ea-light/50 text-sm">Fertigstellung: {proj.completion_year}</p>
                  )}
                  {proj.investment_eur && (
                    <p className="text-ea-gold text-sm font-medium mt-2">
                      <Euro className="w-3 h-3 inline mr-1" />
                      {proj.investment_eur >= 1000000000
                        ? `${(proj.investment_eur / 1000000000).toLocaleString('de-DE', { minimumFractionDigits: proj.investment_eur % 1000000000 === 0 ? 0 : 1, maximumFractionDigits: 1 })} Mrd.`
                        : `${(proj.investment_eur / 1000000).toFixed(0)} Mio.`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <Link 
              to="/investment/vergleich"
              className="bg-gradient-to-r from-ea-gold/20 to-ea-gold/5 border border-ea-gold/30 rounded-2xl p-6 hover:border-ea-gold/50 transition-all group"
            >
              <BarChart3 className="w-8 h-8 text-ea-gold mb-3" />
              <h3 className="text-white font-bold text-lg mb-1">{en ? 'Location Comparison' : 'Standortvergleich'}</h3>
              <p className="text-ea-light/60 text-sm">{en ? 'Compare multiple cities by investment metrics' : 'Vergleichen Sie mehrere Städte nach Investment-Kennzahlen'}</p>
            </Link>
            <Link 
              to="/investment/rechner"
              className="bg-gradient-to-r from-green-500/20 to-green-500/5 border border-green-500/30 rounded-2xl p-6 hover:border-green-500/50 transition-all group"
            >
              <Euro className="w-8 h-8 text-green-400 mb-3" />
              <h3 className="text-white font-bold text-lg mb-1">ROI-Rechner</h3>
              <p className="text-ea-light/60 text-sm">Berechnen Sie die Rendite Ihrer Immobilieninvestition</p>
            </Link>
            <Link 
              to="/infrastruktur-radar"
              className="bg-gradient-to-r from-blue-500/20 to-blue-500/5 border border-blue-500/30 rounded-2xl p-6 hover:border-blue-500/50 transition-all group"
            >
              <MapPin className="w-8 h-8 text-blue-400 mb-3" />
              <h3 className="text-white font-bold text-lg mb-1">Infrastruktur-Karte</h3>
              <p className="text-ea-light/60 text-sm">{en ? 'Interactive map of all locations and projects' : 'Interaktive Karte aller Standorte und Projekte'}</p>
            </Link>
          </div>
        </div>
      </div>
    </>
    
  );
};

export default InvestmentDashboard;
