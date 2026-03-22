import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  MapPin, Euro, Percent, TrendingUp, Building2, Target, 
  CheckCircle, AlertTriangle, ArrowLeft, ExternalLink, Clock
} from 'lucide-react';
import { investmentApi } from '../../services/api';
import SEO from '../../components/SEO';

const LocationProfile = () => {
  const { city } = useParams();
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        const data = await investmentApi.getLocation(decodeURIComponent(city));
        if (!data) {
          setError('Standort nicht gefunden');
        } else {
          setLocation(data);
        }
      } catch (err) {
        setError('Fehler beim Laden des Standorts');
      } finally {
        setLoading(false);
      }
    };
    fetchLocation();
  }, [city]);

  if (loading) {
    return (
      <div className="min-h-screen bg-ea-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ea-gold"></div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen bg-ea-dark flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">{error}</h1>
          <Link to="/investment" className="text-ea-gold hover:underline">
            Zurück zum Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const ScoreColor = (score) => {
    if (score >= 75) return 'text-green-400 bg-green-500/20';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20';
    return 'text-orange-400 bg-orange-500/20';
  };

  const TimeHorizonLabel = {
    short: { label: 'Kurzfristig (0-3 Jahre)', color: 'text-green-400 bg-green-500/20' },
    medium: { label: 'Mittelfristig (3-7 Jahre)', color: 'text-yellow-400 bg-yellow-500/20' },
    long: { label: 'Langfristig (7+ Jahre)', color: 'text-orange-400 bg-orange-500/20' }
  };

  const horizon = TimeHorizonLabel[location.time_horizon] || TimeHorizonLabel.medium;

  return (
    <>
      <SEO 
        title={`${location.city} Investment Profil | EuroAdria`}
        description={location.description || `Investment-Analyse für ${location.city}, ${location.country}`}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-ea-dark via-ea-navy to-ea-dark">
        {/* Hero */}
        <div className="relative pt-24 pb-12 px-4 border-b border-white/10">
          <div className="max-w-5xl mx-auto">
            <Link 
              to="/investment"
              className="inline-flex items-center space-x-2 text-ea-light/60 hover:text-ea-gold mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Zurück zum Dashboard</span>
            </Link>

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <MapPin className="w-6 h-6 text-ea-gold" />
                  <span className="text-ea-light/60">{location.country}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-white">{location.city}</h1>
              </div>

              <div className="flex items-center space-x-4">
                <div className={`px-4 py-2 rounded-xl ${horizon.color}`}>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium">{horizon.label}</span>
                  </div>
                </div>
                <div className={`px-6 py-3 rounded-xl ${ScoreColor(location.investment_score)}`}>
                  <p className="text-xs opacity-70">Investment-Score</p>
                  <p className="text-3xl font-bold">{location.investment_score}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-12">
          {/* Description */}
          {location.description && (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 mb-8">
              <p className="text-ea-light/80 text-lg leading-relaxed">{location.description}</p>
            </div>
          )}

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
              <div className="flex items-center space-x-2 mb-2">
                <Euro className="w-5 h-5 text-ea-gold" />
                <span className="text-ea-light/60 text-sm">Preis/m²</span>
              </div>
              <p className="text-2xl font-bold text-white">€{location.price_per_m2.toLocaleString()}</p>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
              <div className="flex items-center space-x-2 mb-2">
                <Percent className="w-5 h-5 text-green-400" />
                <span className="text-ea-light/60 text-sm">Mietrendite</span>
              </div>
              <p className="text-2xl font-bold text-green-400">{location.rental_yield}%</p>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <span className="text-ea-light/60 text-sm">Tourismuswachstum</span>
              </div>
              <p className="text-2xl font-bold text-blue-400">+{location.tourism_growth}%</p>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-5">
              <div className="flex items-center space-x-2 mb-2">
                <Building2 className="w-5 h-5 text-purple-400" />
                <span className="text-ea-light/60 text-sm">Preiswachstum</span>
              </div>
              <p className="text-2xl font-bold text-purple-400">+{location.price_growth}%</p>
            </div>
          </div>

          {/* Infrastructure & Score Details */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Building2 className="w-5 h-5 text-ea-gold" />
                <h2 className="text-xl font-bold text-white">Infrastruktur</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-ea-light/60">Basis-Score</span>
                    <span className="text-white">{location.infrastructure_score}</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-orange-400 rounded-full transition-all"
                      style={{ width: `${location.infrastructure_score}%` }}
                    />
                  </div>
                </div>

                {location.infrastructure_boost > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                    <p className="text-green-400 font-medium">
                      +{location.infrastructure_boost} Punkte durch nahe Infrastrukturprojekte
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-ea-light/60 text-sm mb-2">Bevölkerungswachstum</p>
                  <p className={`font-bold ${location.population_growth >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {location.population_growth >= 0 ? '+' : ''}{location.population_growth}% p.a.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-4">
                <Target className="w-5 h-5 text-ea-gold" />
                <h2 className="text-xl font-bold text-white">Score-Berechnung</h2>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-ea-light/70">Infrastruktur (30%)</span>
                  <span className="text-white font-medium">{Math.round((location.infrastructure_score + (location.infrastructure_boost || 0)) * 0.3)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-ea-light/70">Tourismuswachstum (25%)</span>
                  <span className="text-white font-medium">{Math.round(Math.min(location.tourism_growth * 5, 100) * 0.25)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-ea-light/70">Mietrendite (25%)</span>
                  <span className="text-white font-medium">{Math.round(Math.min(location.rental_yield * 10, 100) * 0.25)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-ea-light/70">Preiswachstum (20%)</span>
                  <span className="text-white font-medium">{Math.round(Math.min(location.price_growth * 5, 100) * 0.20)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-ea-gold/10 rounded-xl border border-ea-gold/20">
                  <span className="text-ea-gold font-bold">Gesamt-Score</span>
                  <span className="text-ea-gold font-bold text-xl">{location.investment_score}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Opportunities & Risks */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Opportunities */}
            {location.opportunities?.length > 0 && (
              <div className="bg-green-500/5 backdrop-blur border border-green-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-bold text-white">Chancen</h2>
                </div>
                <ul className="space-y-3">
                  {location.opportunities.map((opp, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-ea-light/80">{opp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risks */}
            {location.risks?.length > 0 && (
              <div className="bg-orange-500/5 backdrop-blur border border-orange-500/20 rounded-2xl p-6">
                <div className="flex items-center space-x-2 mb-4">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  <h2 className="text-xl font-bold text-white">Risiken</h2>
                </div>
                <ul className="space-y-3">
                  {location.risks.map((risk, i) => (
                    <li key={i} className="flex items-start space-x-3">
                      <AlertTriangle className="w-4 h-4 text-orange-400 mt-0.5 flex-shrink-0" />
                      <span className="text-ea-light/80">{risk}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Use Cases */}
          {location.use_cases?.length > 0 && (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Geeignet für</h2>
              <div className="flex flex-wrap gap-3">
                {location.use_cases.map((uc) => (
                  <span 
                    key={uc}
                    className="px-4 py-2 bg-ea-gold/10 text-ea-gold border border-ea-gold/20 rounded-xl capitalize"
                  >
                    {uc === 'residential' ? 'Wohnen' :
                     uc === 'tourism' ? 'Tourismus' :
                     uc === 'logistics' ? 'Logistik' :
                     uc === 'relocation' ? 'Relocation' : uc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Related Articles */}
          {location.related_articles?.length > 0 && (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Verwandte Artikel</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {location.related_articles.map((article) => (
                  <Link
                    key={article.id}
                    to={`/blog/${article.slug}`}
                    className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all group"
                  >
                    {article.image && (
                      <img 
                        src={article.image} 
                        alt={article.title}
                        className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium group-hover:text-ea-gold transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-ea-light/50 text-sm mt-1 line-clamp-2">{article.excerpt}</p>
                      )}
                    </div>
                    <ExternalLink className="w-4 h-4 text-ea-light/40 group-hover:text-ea-gold flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              to="/investment/rechner"
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-ea-gold text-ea-dark font-bold rounded-xl hover:bg-ea-gold/80 transition-all"
            >
              <Euro className="w-5 h-5" />
              <span>ROI berechnen</span>
            </Link>
            <Link
              to={`/investment/vergleich`}
              className="flex-1 flex items-center justify-center space-x-2 px-6 py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-all"
            >
              <Target className="w-5 h-5" />
              <span>Standorte vergleichen</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationProfile;
