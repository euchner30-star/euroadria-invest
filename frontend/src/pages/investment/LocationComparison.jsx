import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, Plus, X, MapPin, Euro, Percent, TrendingUp, 
  Building2, ArrowUpRight, CheckCircle2
} from 'lucide-react';
import { investmentApi } from '../../services/api';
import SEO from '../../components/SEO';

const LocationComparison = () => {
  const [allLocations, setAllLocations] = useState([]);
  const [selectedCities, setSelectedCities] = useState([]);
  const [comparison, setComparison] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSelector, setShowSelector] = useState(false);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const data = await investmentApi.getLocations();
        setAllLocations(data);
        // Pre-select top 3
        if (data.length >= 3) {
          setSelectedCities([data[0].city, data[1].city, data[2].city]);
        }
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLocations();
  }, []);

  useEffect(() => {
    const compareSelected = async () => {
      if (selectedCities.length < 2) {
        setComparison([]);
        return;
      }
      try {
        const data = await investmentApi.compareLocations(selectedCities);
        setComparison(data);
      } catch (err) {
        console.error('Comparison failed:', err);
      }
    };
    compareSelected();
  }, [selectedCities]);

  const addCity = (city) => {
    if (selectedCities.length < 5 && !selectedCities.includes(city)) {
      setSelectedCities([...selectedCities, city]);
    }
    setShowSelector(false);
  };

  const removeCity = (city) => {
    setSelectedCities(selectedCities.filter(c => c !== city));
  };

  const ScoreColor = (score) => {
    if (score >= 75) return 'text-green-400';
    if (score >= 60) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getBestValue = (field, higherIsBetter = true) => {
    if (comparison.length === 0) return null;
    const values = comparison.map(loc => loc[field]);
    return higherIsBetter ? Math.max(...values) : Math.min(...values);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ea-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-ea-gold"></div>
      </div>
    );
  }

  return (
    <>
      <SEO 
        title="Standortvergleich | EuroAdria Investment"
        description="Vergleichen Sie Investmentstandorte in Montenegro und Serbien nach Preis, Rendite und Wachstum."
      />
      
      <div className="min-h-screen bg-gradient-to-b from-ea-dark via-ea-navy to-ea-dark py-16 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-ea-gold text-sm font-bold tracking-widest uppercase mb-4">
              Investment Tools
            </p>
            <h1 className="text-4xl font-bold text-white mb-4">
              Standortvergleich
            </h1>
            <p className="text-ea-light/70 max-w-xl mx-auto">
              Vergleichen Sie bis zu 5 Städte nach Investment-Kennzahlen
            </p>
          </div>

          {/* City Selector */}
          <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white font-bold">Ausgewählte Städte ({selectedCities.length}/5)</h2>
              {selectedCities.length < 5 && (
                <button
                  onClick={() => setShowSelector(!showSelector)}
                  className="flex items-center space-x-2 px-4 py-2 bg-ea-gold/20 text-ea-gold rounded-xl hover:bg-ea-gold/30 transition-all"
                  data-testid="add-city-btn"
                >
                  <Plus className="w-4 h-4" />
                  <span>Stadt hinzufügen</span>
                </button>
              )}
            </div>

            {/* Selected Cities Pills */}
            <div className="flex flex-wrap gap-3">
              {selectedCities.map(city => (
                <div 
                  key={city}
                  className="flex items-center space-x-2 px-4 py-2 bg-ea-gold/10 border border-ea-gold/30 rounded-xl"
                >
                  <MapPin className="w-4 h-4 text-ea-gold" />
                  <span className="text-white">{city}</span>
                  <button
                    onClick={() => removeCity(city)}
                    className="text-ea-light/50 hover:text-red-400 transition-colors"
                    data-testid={`remove-${city}`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* City Dropdown */}
            {showSelector && (
              <div className="mt-4 bg-ea-dark/80 border border-white/10 rounded-xl max-h-64 overflow-y-auto">
                {allLocations
                  .filter(loc => !selectedCities.includes(loc.city))
                  .map(loc => (
                    <button
                      key={loc.city}
                      onClick={() => addCity(loc.city)}
                      className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors border-b border-white/5 last:border-0"
                      data-testid={`select-${loc.city}`}
                    >
                      <div className="flex items-center space-x-3">
                        <MapPin className="w-4 h-4 text-ea-gold" />
                        <span className="text-white">{loc.city}</span>
                        <span className="text-ea-light/50 text-sm">({loc.country})</span>
                      </div>
                      <span className={`font-bold ${ScoreColor(loc.investment_score)}`}>
                        {loc.investment_score}
                      </span>
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Comparison Table */}
          {comparison.length >= 2 ? (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full" data-testid="comparison-table">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-ea-light/60 font-medium">Kennzahl</th>
                      {comparison.map(loc => (
                        <th key={loc.city} className="p-4 text-center min-w-[160px]">
                          <Link 
                            to={`/investment/standort/${encodeURIComponent(loc.city)}`}
                            className="text-white font-bold hover:text-ea-gold transition-colors"
                          >
                            {loc.city}
                          </Link>
                          <p className="text-ea-light/50 text-xs font-normal">{loc.country}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {/* Investment Score */}
                    <tr className="border-b border-white/5 bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-ea-gold" />
                          <span className="text-white font-medium">Investment-Score</span>
                        </div>
                      </td>
                      {comparison.map(loc => (
                        <td key={loc.city} className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <span className={`text-xl font-bold ${ScoreColor(loc.investment_score)}`}>
                              {loc.investment_score}
                            </span>
                            {loc.investment_score === getBestValue('investment_score') && (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Price per m2 */}
                    <tr className="border-b border-white/5">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Euro className="w-4 h-4 text-ea-gold" />
                          <span className="text-white font-medium">Preis/m²</span>
                        </div>
                      </td>
                      {comparison.map(loc => (
                        <td key={loc.city} className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="text-white">€{loc.price_per_m2.toLocaleString()}</span>
                            {loc.price_per_m2 === getBestValue('price_per_m2', false) && (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Rental Yield */}
                    <tr className="border-b border-white/5 bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Percent className="w-4 h-4 text-green-400" />
                          <span className="text-white font-medium">Mietrendite</span>
                        </div>
                      </td>
                      {comparison.map(loc => (
                        <td key={loc.city} className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="text-green-400 font-bold">{loc.rental_yield}%</span>
                            {loc.rental_yield === getBestValue('rental_yield') && (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Tourism Growth */}
                    <tr className="border-b border-white/5">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium">Tourismuswachstum</span>
                        </div>
                      </td>
                      {comparison.map(loc => (
                        <td key={loc.city} className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="text-blue-400">+{loc.tourism_growth}%</span>
                            {loc.tourism_growth === getBestValue('tourism_growth') && (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Price Growth */}
                    <tr className="border-b border-white/5 bg-white/5">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 text-purple-400" />
                          <span className="text-white font-medium">Preiswachstum</span>
                        </div>
                      </td>
                      {comparison.map(loc => (
                        <td key={loc.city} className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="text-purple-400">+{loc.price_growth}%</span>
                            {loc.price_growth === getBestValue('price_growth') && (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Infrastructure Score */}
                    <tr className="border-b border-white/5">
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <Building2 className="w-4 h-4 text-orange-400" />
                          <span className="text-white font-medium">Infrastruktur-Score</span>
                        </div>
                      </td>
                      {comparison.map(loc => (
                        <td key={loc.city} className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <span className="text-orange-400">{loc.infrastructure_score}</span>
                            {loc.infrastructure_boost > 0 && (
                              <span className="text-green-400 text-xs">+{loc.infrastructure_boost}</span>
                            )}
                            {loc.infrastructure_score === getBestValue('infrastructure_score') && (
                              <CheckCircle2 className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>

                    {/* Actions */}
                    <tr>
                      <td className="p-4 text-ea-light/60">Details</td>
                      {comparison.map(loc => (
                        <td key={loc.city} className="p-4 text-center">
                          <Link
                            to={`/investment/standort/${encodeURIComponent(loc.city)}`}
                            className="inline-flex items-center space-x-1 px-4 py-2 bg-ea-gold/20 text-ea-gold rounded-lg hover:bg-ea-gold/30 transition-all"
                          >
                            <span>Profil</span>
                            <ArrowUpRight className="w-4 h-4" />
                          </Link>
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-12 text-center">
              <BarChart3 className="w-16 h-16 text-ea-light/20 mx-auto mb-4" />
              <p className="text-ea-light/50 text-lg">
                Wählen Sie mindestens 2 Städte zum Vergleichen aus
              </p>
            </div>
          )}

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-green-400" />
              <span className="text-ea-light/60">Bester Wert</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-green-400 text-xs">+X</span>
              <span className="text-ea-light/60">Infrastruktur-Boost durch nahe Projekte</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LocationComparison;
