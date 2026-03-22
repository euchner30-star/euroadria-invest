import React, { useState } from 'react';
import { Calculator, Euro, Percent, TrendingUp, Clock, Building } from 'lucide-react';
import { investmentApi } from '../../services/api';
import SEO from '../../components/SEO';

const ROICalculator = () => {
  const [inputs, setInputs] = useState({
    purchase_price: 150000,
    renovation_costs: 10000,
    additional_costs: 5000,
    monthly_rent: 800,
    vacancy_rate: 5,
    running_costs_monthly: 100
  });
  
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0
    }));
  };

  const calculateROI = async () => {
    setLoading(true);
    try {
      const data = await investmentApi.calculateROI(inputs);
      setResult(data);
    } catch (err) {
      console.error('Calculation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
  };

  return (
    <>
      <SEO 
        title="ROI-Rechner für Immobilien | EuroAdria"
        description="Berechnen Sie die Rendite Ihrer Immobilieninvestition in Montenegro und Serbien."
      />
      
      <div className="min-h-screen bg-gradient-to-b from-ea-dark via-ea-navy to-ea-dark pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <p className="text-ea-gold text-sm font-bold tracking-widest uppercase mb-4">
              Investment Tools
            </p>
            <h1 className="text-4xl font-bold text-white mb-4">
              ROI-Rechner für Immobilien
            </h1>
            <p className="text-ea-light/70 max-w-xl mx-auto">
              Berechnen Sie jährlichen Cashflow, ROI und Break-Even-Zeitpunkt für Ihre Immobilieninvestition
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <Calculator className="w-5 h-5 text-ea-gold" />
                <h2 className="text-xl font-bold text-white">Eingaben</h2>
              </div>

              <div className="space-y-5">
                {/* Purchase Price */}
                <div>
                  <label className="block text-ea-light/70 text-sm mb-2">Kaufpreis</label>
                  <div className="relative">
                    <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ea-gold" />
                    <input
                      type="number"
                      value={inputs.purchase_price}
                      onChange={(e) => handleInputChange('purchase_price', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white focus:border-ea-gold focus:outline-none"
                      data-testid="roi-purchase-price"
                    />
                  </div>
                </div>

                {/* Renovation Costs */}
                <div>
                  <label className="block text-ea-light/70 text-sm mb-2">Renovierungskosten</label>
                  <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ea-gold" />
                    <input
                      type="number"
                      value={inputs.renovation_costs}
                      onChange={(e) => handleInputChange('renovation_costs', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white focus:border-ea-gold focus:outline-none"
                      data-testid="roi-renovation-costs"
                    />
                  </div>
                </div>

                {/* Additional Costs */}
                <div>
                  <label className="block text-ea-light/70 text-sm mb-2">Nebenkosten (Notar, Makler, etc.)</label>
                  <div className="relative">
                    <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-ea-gold" />
                    <input
                      type="number"
                      value={inputs.additional_costs}
                      onChange={(e) => handleInputChange('additional_costs', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white focus:border-ea-gold focus:outline-none"
                      data-testid="roi-additional-costs"
                    />
                  </div>
                </div>

                {/* Monthly Rent */}
                <div>
                  <label className="block text-ea-light/70 text-sm mb-2">Monatliche Miete</label>
                  <div className="relative">
                    <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-green-400" />
                    <input
                      type="number"
                      value={inputs.monthly_rent}
                      onChange={(e) => handleInputChange('monthly_rent', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white focus:border-ea-gold focus:outline-none"
                      data-testid="roi-monthly-rent"
                    />
                  </div>
                </div>

                {/* Vacancy Rate */}
                <div>
                  <label className="block text-ea-light/70 text-sm mb-2">Leerstandsrate (%)</label>
                  <div className="relative">
                    <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-400" />
                    <input
                      type="number"
                      value={inputs.vacancy_rate}
                      onChange={(e) => handleInputChange('vacancy_rate', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white focus:border-ea-gold focus:outline-none"
                      min="0"
                      max="100"
                      data-testid="roi-vacancy-rate"
                    />
                  </div>
                </div>

                {/* Running Costs */}
                <div>
                  <label className="block text-ea-light/70 text-sm mb-2">Monatliche Kosten (Verwaltung, Instandhaltung)</label>
                  <div className="relative">
                    <Euro className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400" />
                    <input
                      type="number"
                      value={inputs.running_costs_monthly}
                      onChange={(e) => handleInputChange('running_costs_monthly', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-10 py-3 text-white focus:border-ea-gold focus:outline-none"
                      data-testid="roi-running-costs"
                    />
                  </div>
                </div>

                <button
                  onClick={calculateROI}
                  disabled={loading}
                  className="w-full bg-ea-gold text-ea-dark font-bold py-4 rounded-xl hover:bg-ea-gold/80 transition-all disabled:opacity-50"
                  data-testid="roi-calculate-btn"
                >
                  {loading ? 'Berechne...' : 'ROI Berechnen'}
                </button>
              </div>
            </div>

            {/* Results Section */}
            <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-6">
              <div className="flex items-center space-x-2 mb-6">
                <TrendingUp className="w-5 h-5 text-ea-gold" />
                <h2 className="text-xl font-bold text-white">Ergebnis</h2>
              </div>

              {result ? (
                <div className="space-y-4">
                  {/* Total Investment */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-ea-light/60 text-sm mb-1">Gesamtinvestition</p>
                    <p className="text-2xl font-bold text-white">{formatCurrency(result.total_investment)}</p>
                  </div>

                  {/* Annual Cashflow */}
                  <div className="bg-green-500/10 rounded-xl p-4 border border-green-500/20">
                    <p className="text-green-400/80 text-sm mb-1">Jährlicher Cashflow</p>
                    <p className="text-2xl font-bold text-green-400">{formatCurrency(result.annual_cashflow)}</p>
                    <p className="text-green-400/60 text-xs mt-1">
                      {formatCurrency(result.annual_cashflow / 12)} / Monat
                    </p>
                  </div>

                  {/* ROI Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-ea-gold/10 rounded-xl p-4 border border-ea-gold/20">
                      <p className="text-ea-gold/80 text-sm mb-1">ROI</p>
                      <p className="text-2xl font-bold text-ea-gold">{result.roi_percent}%</p>
                    </div>
                    <div className="bg-blue-500/10 rounded-xl p-4 border border-blue-500/20">
                      <p className="text-blue-400/80 text-sm mb-1">Netto-Rendite</p>
                      <p className="text-2xl font-bold text-blue-400">{result.net_yield_percent}%</p>
                    </div>
                  </div>

                  {/* Break-Even */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center space-x-2 mb-2">
                      <Clock className="w-4 h-4 text-ea-light/60" />
                      <p className="text-ea-light/60 text-sm">Break-Even-Zeitpunkt</p>
                    </div>
                    <p className="text-2xl font-bold text-white">
                      {result.break_even_years === Infinity ? '∞' : `${result.break_even_years} Jahre`}
                    </p>
                  </div>

                  {/* Income Breakdown */}
                  <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                    <p className="text-ea-light/60 text-sm mb-3">Einnahmen-Aufschlüsselung</p>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-ea-light/70">Brutto-Mieteinnahmen</span>
                        <span className="text-white">{formatCurrency(result.gross_rental_income)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-ea-light/70">Nach Leerstand ({inputs.vacancy_rate}%)</span>
                        <span className="text-yellow-400">-{formatCurrency(result.gross_rental_income * inputs.vacancy_rate / 100)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-ea-light/70">Laufende Kosten</span>
                        <span className="text-red-400">-{formatCurrency(inputs.running_costs_monthly * 12)}</span>
                      </div>
                      <div className="border-t border-white/10 pt-2 mt-2 flex justify-between">
                        <span className="text-white font-medium">Netto-Mieteinnahmen</span>
                        <span className="text-green-400 font-bold">{formatCurrency(result.net_rental_income)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center py-12">
                  <div>
                    <Calculator className="w-16 h-16 text-ea-light/20 mx-auto mb-4" />
                    <p className="text-ea-light/50">
                      Geben Sie Ihre Investitionsdaten ein und klicken Sie auf "ROI Berechnen"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-ea-gold/10 border border-ea-gold/20 rounded-2xl p-6">
            <h3 className="text-ea-gold font-bold mb-3">Hinweise zur Berechnung</h3>
            <ul className="text-ea-light/70 text-sm space-y-2">
              <li>• <strong>ROI</strong> = Jährlicher Cashflow / Gesamtinvestition × 100</li>
              <li>• <strong>Netto-Rendite</strong> = Netto-Mieteinnahmen / Kaufpreis × 100</li>
              <li>• <strong>Break-Even</strong> = Gesamtinvestition / Jährlicher Cashflow</li>
              <li>• Die Berechnung berücksichtigt keine Steuern, Finanzierungskosten oder Wertsteigerung</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
};

export default ROICalculator;
