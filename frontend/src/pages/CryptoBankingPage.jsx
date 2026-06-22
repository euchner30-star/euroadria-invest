import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, ArrowRight, Globe, Lock, Landmark, 
  CreditCard, Building2, BarChart3, ChevronRight
} from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';

const CryptoBankingPage = () => {
  const { lang } = useLanguage();
  const en = lang === 'en';
  return (
    <div className="min-h-screen bg-white" data-testid="crypto-banking-page">
      <SEO 
        title="Crypto-Banking & Treasury in Serbia"
        description="International liquidity and data sovereignty, securely structured outside EU regulations. Crypto banking, treasury and non-resident accounts in Serbia."
        url="/serbia-executive/crypto-banking"
        faq={[
          {
            question: "Why is Serbia attractive for crypto banking?",
            answer: "Serbia is not part of the CRS (Common Reporting Standard) and independent of EU restrictions like MiCA. This enables strategic discretion and data sovereignty with full legality."
          },
          {
            question: "Can you legally convert cryptocurrencies to fiat in Serbia?",
            answer: "Yes, through licensed crypto service providers registered with the Serbian National Bank, crypto assets can be legally converted to fiat (Dinar/EUR) and deposited into non-resident bank accounts."
          }
        ]}
      />

      {/* Hero */}
      <section className="relative pt-28 pb-20 bg-ea-dark overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-ea-gold rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-20 w-96 h-96 bg-ea-gold rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center space-x-2 bg-ea-gold/20 border border-ea-gold/40 rounded-full px-4 py-2 mb-6">
              <Lock className="w-4 h-4 text-ea-gold" />
              <span className="text-ea-gold text-sm font-medium">Serbia Executive Access</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              {en ? <>International Liquidity and <span className="text-ea-gold">Data Sovereignty</span></> : <>Internationale Liquidität und <span className="text-ea-gold">Datensouveränität</span></>}
            </h1>
            <p className="text-lg md:text-xl text-ea-light/80 mb-4 leading-relaxed max-w-3xl">
              {en ? 'Strategic guidance for entrepreneurs and investors in building robust crypto, treasury, and banking structures in Serbia.' : 'Strategische Begleitung für Unternehmer und Investoren beim Aufbau belastbarer Krypto-, Treasury- und Banking-Strukturen in Serbien.'}
            </p>
            <p className="text-base text-ea-light/60 mb-8 max-w-3xl">
              {en ? 'Fully legal, orchestrated through licensed partners, and strategically advantageous — positioned outside restrictive EU frameworks.' : 'Vollständig legal, orchestriert über lizenzierte Partner und strategisch vorteilhaft außerhalb der restriktiven EU-Rahmenwerke positioniert.'}
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#solutions" className="px-6 py-3 bg-ea-gold text-white font-semibold rounded-lg hover:bg-ea-gold/80 transition-all flex items-center gap-2" data-testid="crypto-cta">
                <Shield className="w-5 h-5" />
                {en ? 'Request Executive Assessment' : 'Executive Assessment anfragen'}
              </a>
              <Link to="/serbia-executive/crypto-compliance" className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-lg hover:bg-white/20 transition-all flex items-center gap-2">
                {en ? 'Compliance & Quality Filter' : 'Compliance & Qualitätsfilter'}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Advantage */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ea-dark mb-4">
              {en ? <>The Strategic <span className="text-ea-gold">Location Advantage</span></> : <>Der strategische <span className="text-ea-gold">Standortvorteil</span></>}
            </h2>
            <p className="text-ea-dark/70 text-lg max-w-3xl mx-auto">
              {en ? 'Regulatory arbitrage instead of gray zones. The European space is becoming increasingly restrictive through MiCA and DAC8. Serbia offers a legal alternative.' : 'Regulatorische Arbitrage statt Grauzone. Der europäische Raum wird durch MiCA und DAC8 zunehmend restriktiver. Serbien bietet eine legale Alternative.'}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-ea-gold/10 rounded-xl flex items-center justify-center mb-5">
                <Shield className="w-7 h-7 text-ea-gold" />
              </div>
              <h3 className="text-xl font-bold text-ea-dark mb-3">No CRS</h3>
              <p className="text-ea-dark/60 text-sm font-medium text-ea-gold mb-3">Common Reporting Standard</p>
              <p className="text-ea-dark/70 leading-relaxed">
                Serbia is not part of the CRS. There is no automatic exchange 
                of tax-relevant financial information. Maximum strategic 
                discretion and data sovereignty.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-ea-gold/10 rounded-xl flex items-center justify-center mb-5">
                <Globe className="w-7 h-7 text-ea-gold" />
              </div>
              <h3 className="text-xl font-bold text-ea-dark mb-3">Independent from EU Restrictions</h3>
              <p className="text-ea-dark/60 text-sm font-medium text-ea-gold mb-3">No MiCA Regulation</p>
              <p className="text-ea-dark/70 leading-relaxed">
                Neither MiCA regulations nor restrictions on stablecoin trading 
                (such as the EU listing ban for USDT). Serbia as an efficient bridge 
                between East and West.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-14 h-14 bg-ea-gold/10 rounded-xl flex items-center justify-center mb-5">
                <Landmark className="w-7 h-7 text-ea-gold" />
              </div>
              <h3 className="text-xl font-bold text-ea-dark mb-3">Reporting Advantage</h3>
              <p className="text-ea-dark/60 text-sm font-medium text-ea-gold mb-3">Corporate Treasury</p>
              <p className="text-ea-dark/70 leading-relaxed">
                Unlike cross-border fiat loans, crypto-based 
                credits to Serbian subsidiaries do not need to be reported 
                to the National Bank of Serbia.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Operative Solutions */}
      <section id="solutions" className="py-20 px-6 bg-ea-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-ea-dark mb-4">
              Operative <span className="text-ea-gold">Solutions</span>
            </h2>
            <p className="text-ea-dark/70 text-lg max-w-3xl mx-auto">
              We leverage these geographic advantages for the long-term, 
              bankable buildup of your liquidity.
            </p>
          </div>

          <div className="space-y-8">
            {/* Solution 1 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm">
              <div className="grid md:grid-cols-[auto_1fr] gap-8">
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-ea-dark rounded-xl flex items-center justify-center">
                    <CreditCard className="w-8 h-8 text-ea-gold" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-ea-gold/10 text-ea-gold text-xs font-bold px-3 py-1 rounded-full">01</span>
                    <h3 className="text-xl font-bold text-ea-dark">Fiat-Crypto Bridge & Non-Resident Banking</h3>
                  </div>
                  <p className="text-ea-dark/70 leading-relaxed">
                    We guide the legal conversion of your crypto assets into fiat (Dinar/EUR) and 
                    orchestrate the deposit into a non-resident bank account at our partner bank 
                    in Belgrade. You then receive access to a global debit card for 
                    unrestricted, efficient payments outside typical banking bottlenecks.
                  </p>
                </div>
              </div>
            </div>

            {/* Solution 2 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm">
              <div className="grid md:grid-cols-[auto_1fr] gap-8">
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-ea-dark rounded-xl flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-ea-gold" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-ea-gold/10 text-ea-gold text-xs font-bold px-3 py-1 rounded-full">02</span>
                    <h3 className="text-xl font-bold text-ea-dark">Capital Extraction Through Real Assets</h3>
                  </div>
                  <p className="text-ea-dark/70 leading-relaxed mb-3">
                    You convert crypto capital into tangible assets. By purchasing real estate 
                    (generating rental income) or acquiring liquid securities (such as US T-Bills 
                    via Serbian brokers), you create an entirely new, clean fiat source of funds 
                    from real estate transactions instead of crypto trading.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <span className="text-xs bg-ea-gold/10 text-ea-gold font-medium px-3 py-1 rounded-full">Real Estate</span>
                    <span className="text-xs bg-ea-gold/10 text-ea-gold font-medium px-3 py-1 rounded-full">Securities</span>
                    <span className="text-xs bg-ea-gold/10 text-ea-gold font-medium px-3 py-1 rounded-full">Source of Funds</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Solution 3 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 md:p-10 shadow-sm">
              <div className="grid md:grid-cols-[auto_1fr] gap-8">
                <div className="flex items-start">
                  <div className="w-16 h-16 bg-ea-dark rounded-xl flex items-center justify-center">
                    <BarChart3 className="w-8 h-8 text-ea-gold" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-ea-gold/10 text-ea-gold text-xs font-bold px-3 py-1 rounded-full">03</span>
                    <h3 className="text-xl font-bold text-ea-dark">Corporate Treasury for Unlimited Payment Processing</h3>
                  </div>
                  <p className="text-ea-dark/70 leading-relaxed">
                    Companies blocked by major global exchanges due to their jurisdiction 
                    (or "over-compliance") receive seamless onboarding with us. 
                    You can swap fiat into stablecoins for fast, 
                    global payments outside the traditional banking system.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Link to="/serbia-executive/crypto-compliance" className="inline-flex items-center gap-2 px-8 py-4 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-dark/90 transition-all" data-testid="to-compliance-btn">
              Compliance & Executive Assessment
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CryptoBankingPage;
