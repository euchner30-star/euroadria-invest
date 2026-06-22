import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, CheckCircle, Send, ArrowLeft, Lock, 
  FileText, AlertTriangle, Scale
} from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const CryptoCompliancePage = () => {
  const { lang } = useLanguage();
  const en = lang === 'en';
  const [form, setForm] = useState({
    name: '', company: '', email: '', phone: '', volume: '', message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          subject: `Crypto Executive Assessment${form.company ? ', ' + form.company : ''}`,
          message: `Unternehmen: ${form.company || '-'}\nVolumen: ${form.volume || '-'}\n\n${form.message || 'No further message.'}`
        })
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Fehler:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white" data-testid="crypto-compliance-page">
      <SEO 
        title="Compliance & Executive Assessment - Crypto-Banking Serbien"
        description="Compliance by Design: 100% licensed crypto transactions via registered service providers in Serbia. Executive Assessment for your customized implementation roadmap."
        url="/serbia-executive/crypto-compliance"
        faq={[
          {
            question: "Wie wird Compliance bei Crypto-Banking in Serbien sichergestellt?",
            answer: "All transactions are exclusively processed through official crypto service providers registered with the Serbian National Bank. Proof of Funds is mandatory, and no funds of criminal origin are accepted."
          },
          {
            question: "Was ist ein Executive Assessment?",
            answer: "As part of a paid strategic pre-assessment, we analyze your business model, clarify risk and feasibility factors, and create your concrete implementation roadmap for crypto banking in Serbia."
          }
        ]}
      />

      {/* Hero */}
      <section className="relative pt-28 pb-16 bg-ea-dark">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <Link to="/serbia-executive/crypto-banking" className="inline-flex items-center gap-2 text-ea-gold hover:text-ea-gold/80 transition-colors mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Overview
          </Link>
          <div className="max-w-3xl">
            <div className="inline-flex items-center space-x-2 bg-ea-gold/20 border border-ea-gold/40 rounded-full px-4 py-2 mb-6">
              <Scale className="w-4 h-4 text-ea-gold" />
              <span className="text-ea-gold text-sm font-medium">Compliance by Design</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
              Diskretion erfordert <span className="text-ea-gold">höchste Compliance</span>
            </h1>
            <p className="text-lg text-ea-light/80 leading-relaxed">
              Wie wir arbeiten (und wie nicht): Wir bieten keine Grauzonen-Konstrukte. 
              Serbien ist kein rechtsfreier Raum. Das System funktioniert nur, weil wir es 
              legally secure and transparent towards local authorities.
            </p>
          </div>
        </div>
      </section>

      {/* Compliance Pillars */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-white border-2 border-ea-gold/30 rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-5">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-ea-dark mb-3">100 % Lizenziert</h3>
              <p className="text-ea-dark/70 leading-relaxed">
                All transactions (purchase, sale, custody) are exclusively processed through official, 
                von der serbischen Nationalbank registrierte Krypto-Dienstleister abgewickelt.
              </p>
            </div>

            <div className="bg-white border-2 border-ea-gold/30 rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-5">
                <FileText className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-ea-dark mb-3">Proof of Funds ist Pflicht</h3>
              <p className="text-ea-dark/70 leading-relaxed">
                We work exclusively with clients who can 
                document a clean source of funds. Transparency is the foundation of every collaboration.
              </p>
            </div>

            <div className="bg-white border-2 border-ea-gold/30 rounded-2xl p-8 shadow-sm">
              <div className="w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center mb-5">
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-ea-dark mb-3">Klare Grenzen</h3>
              <p className="text-ea-dark/70 leading-relaxed">
                We do not support funds of criminal origin and do not offer 
                structures for mere concealment. We also do not provide tax or 
                Rechtsberatung im eigenen Namen.
              </p>
            </div>
          </div>

          {/* Promise Box */}
          <div className="bg-ea-dark rounded-2xl p-8 md:p-12 text-center">
            <Lock className="w-12 h-12 text-ea-gold mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Unser Versprechen</h3>
            <p className="text-ea-light/80 text-lg max-w-2xl mx-auto leading-relaxed">
              Sie erhalten kein wackeliges Konstrukt, sondern ein <strong className="text-ea-gold">belastbares System</strong>, 
              that local banks and audit authorities immediately understand.
            </p>
          </div>
        </div>
      </section>

      {/* Executive Assessment Form */}
      <section id="assessment" className="py-20 px-6 bg-ea-light">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-ea-gold/10 border border-ea-gold/30 rounded-full px-4 py-2 mb-4">
              <Shield className="w-4 h-4 text-ea-gold" />
              <span className="text-ea-gold text-sm font-medium">Vertrauliche Anfrage</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-ea-dark mb-4">
              Executive <span className="text-ea-gold">Assessment</span>
            </h2>
            <p className="text-ea-dark/70 max-w-2xl mx-auto">
              Building these structures requires customized planning. As part of our 
              strategic pre-assessment, we analyze your business model and create your 
              konkrete Umsetzungs-Roadmap.
            </p>
          </div>

          {submitted ? (
            <div className="bg-ea-gold/10 border border-ea-gold/30 rounded-2xl p-8 text-center">
              <CheckCircle className="w-16 h-16 text-ea-gold mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-ea-dark mb-2">Anfrage erhalten</h3>
              <p className="text-ea-dark/70">
                Vielen Dank. Wir melden uns innerhalb von 24 Stunden bei Ihnen 
                zur Terminvereinbarung.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-6" data-testid="assessment-form">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-ea-dark/80 mb-2">Name *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm(p => ({...p, name: e.target.value}))} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ea-gold/20 focus:border-ea-gold transition-colors" placeholder="Ihr Name" data-testid="assess-name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ea-dark/80 mb-2">Unternehmen</label>
                  <input type="text" value={form.company} onChange={(e) => setForm(p => ({...p, company: e.target.value}))} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ea-gold/20 focus:border-ea-gold transition-colors" placeholder="Ihr Unternehmen" data-testid="assess-company" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ea-dark/80 mb-2">E-Mail *</label>
                  <input type="email" required value={form.email} onChange={(e) => setForm(p => ({...p, email: e.target.value}))} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ea-gold/20 focus:border-ea-gold transition-colors" placeholder="ihre@email.de" data-testid="assess-email" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ea-dark/80 mb-2">Telefon</label>
                  <input type="tel" value={form.phone} onChange={(e) => setForm(p => ({...p, phone: e.target.value}))} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ea-gold/20 focus:border-ea-gold transition-colors" placeholder="+49..." data-testid="assess-phone" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ea-dark/80 mb-2">Geschätztes Volumen</label>
                <select value={form.volume} onChange={(e) => setForm(p => ({...p, volume: e.target.value}))} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ea-gold/20 focus:border-ea-gold transition-colors bg-white" data-testid="assess-volume">
                  <option value="">Please select...</option>
                  <option value="100k-500k">100.000 bis 500.000 Euro</option>
                  <option value="500k-1m">500.000 bis 1.000.000 Euro</option>
                  <option value="1m-5m">1.000.000 bis 5.000.000 Euro</option>
                  <option value="5m+">Über 5.000.000 Euro</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-ea-dark/80 mb-2">Message</label>
                <textarea rows={4} value={form.message} onChange={(e) => setForm(p => ({...p, message: e.target.value}))} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-ea-gold/20 focus:border-ea-gold transition-colors resize-none" 
                  placeholder="Beschreiben Sie kurz Ihr Anliegen und Geschäftsmodell..." data-testid="assess-message" />
              </div>
              <button type="submit" disabled={submitting} className="w-full py-4 bg-ea-gold text-white font-semibold rounded-lg hover:bg-ea-gold/80 transition-all flex items-center justify-center gap-2 disabled:opacity-70" data-testid="assess-submit">
                {submitting ? 'Wird gesendet...' : <><Send className="w-5 h-5" />Eignung prüfen & Gespräch anfordern</>}
              </button>
              <p className="text-gray-400 text-xs text-center">
                Alle Anfragen werden vertraulich behandelt. Ihre Daten werden nicht an Dritte weitergegeben.
              </p>
            </form>
          )}
        </div>
      </section>
    </div>
  );
};

export default CryptoCompliancePage;
