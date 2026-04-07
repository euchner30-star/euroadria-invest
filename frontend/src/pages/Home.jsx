import React, { useState, useEffect } from 'react';
import Hero from '../components/Hero';
import { Link } from 'react-router-dom';
import { articlesApi, pagesApi } from '../services/api';
import { ArrowRight, Clock, Shield, TrendingUp, Award, Loader2, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO';
import FAQSection from '../components/FAQSection';
import MediaBadge from '../components/MediaBadge';
import YouTubeSlider from '../components/YouTubeSlider';
import TrustBar from '../components/TrustBar';
import NewsletterSignup from '../components/NewsletterSignup';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [heroData, setHeroData] = useState({});
  const [homeContent, setHomeContent] = useState({});
  const { lang, t } = useLanguage();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const pageData = await pagesApi.getBySlug('home');
        if (pageData && pageData.sections) {
          const heroSection = pageData.sections.find(s => s.type === 'hero');
          if (heroSection && heroSection.data) {
            setHeroData(heroSection.data);
          }
        }
        
        // Fetch homepage content settings
        const API_URL = process.env.REACT_APP_BACKEND_URL;
        const homeRes = await fetch(`${API_URL}/api/settings/homepage`);
        if (homeRes.ok) {
          const homeData = await homeRes.json();
          setHomeContent(homeData);
        }
        
        const articlesData = await articlesApi.getFeatured(3);
        setFeaturedArticles(articlesData);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <main className="min-h-screen bg-white" itemScope itemType="https://schema.org/WebPage">
      <SEO 
        title="Investment & Business Beratung für Adria & Balkan"
        description="Premium Investment & Lifestyle Partner für die Adria-Region. Forensische Due Diligence, Firmengründung Montenegro, Serbien Investments. Für DACH-Investoren mit 8-15% Zielrendite."
        url="/"
        faq={[
          {
            question: "Was macht EuroAdria Corporate Solutions?",
            answer: "EuroAdria Corporate Solutions ist ein Premium Investment Advisor für DACH-Investoren in der Adria-Region. Wir bieten forensische Due Diligence, Firmengründung in Montenegro (9% Körperschaftssteuer), und exklusiven Zugang zu Off-Market Investments in Montenegro und Serbien."
          },
          {
            question: "Warum Balkan statt EU für Investments?",
            answer: "Der Balkan bietet strukturierte Wachstumsinvestments mit 8-15% Zielrendite, während EU-Märkte nur 4-6% bieten. Montenegro erwartet 60-80% Wertsteigerung vor dem EU-Beitritt 2028. Serbien bietet bis zu 50% staatliche Investitionsförderung."
          }
        ]}
      />
      <Hero 
        backgroundImage={heroData.backgroundImage} 
        overlayOpacity={heroData.overlayOpacity}
        backgroundImagePosition={heroData.backgroundImagePosition}
        title={lang === 'en' ? t('hero.title') : homeContent.hero_title}
        subtitle={lang === 'en' ? t('hero.subtitle') : homeContent.hero_subtitle}
        ctaText={lang === 'en' ? t('hero.cta') : homeContent.hero_cta_text}
      />

      <TrustBar />

      {/* Balkan vs EU Section - GEO-optimiert mit Fakten */}
      <section className="py-20 bg-ea-light" itemScope itemType="https://schema.org/Article">
        <div className="max-w-7xl mx-auto px-6">
          <article className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-block bg-ea-gold/10 border border-ea-gold/30 text-sm text-ea-dark px-4 py-2 rounded-full mb-4 font-medium">
                  {lang === 'en' ? 'Alpha Potential' : 'Alpha-Potenzial'}
                </div>
                <h2 className="text-3xl md:text-4xl font-semibold text-ea-dark mb-6 leading-tight" itemProp="headline">
                  {lang === 'en' ? <>Why the <span className="text-ea-gold">Balkans</span> instead of the EU?</> : <>Warum <span className="text-ea-gold">Balkan</span> statt EU?</>}
                </h2>
                <p className="text-ea-dark/70 text-lg leading-relaxed mb-6" itemProp="description">
                  {lang === 'en' 
                    ? <>According to the World Bank, Montenegro ranks 50th in the Ease of Doing Business Index. With only <strong>9% corporate tax</strong> (lowest in Europe) and the expected <strong>EU accession in 2028</strong>, the region offers unique convergence arbitrage.</>
                    : <>Laut Weltbank rangiert Montenegro auf Platz 50 im Ease of Doing Business Index. Mit nur <strong>9% Körperschaftssteuer</strong> (niedrigste in Europa) und dem erwarteten <strong>EU-Beitritt 2028</strong> bietet die Region einzigartige Konvergenz-Arbitrage.</>
                  }
                </p>
                <ul className="space-y-4 mb-8">
                  {(lang === 'en' ? [
                    'Montenegro: 9% corporate tax, Euro as currency',
                    'Serbia: Up to 50% state investment subsidies',
                    '60-80% appreciation potential before EU accession',
                    'Forensic due diligence per FATF standards'
                  ] : [
                    'Montenegro: 9% Körperschaftssteuer, Euro als Währung',
                    'Serbien: Bis zu 50% staatliche Investitionsförderung',
                    '60-80% Wertsteigerungspotenzial vor EU-Beitritt',
                    'Forensische Due Diligence nach FATF-Standards'
                  ]).map((point, idx) => (
                    <li key={idx} className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-ea-gold flex-shrink-0 mt-0.5" />
                      <span className="text-ea-dark/70">{point}</span>
                    </li>
                  ))}
                </ul>
                <Link 
                  to="/blog" 
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all"
                  data-testid="balkan-section-cta"
                >
                  <span>{lang === 'en' ? 'Read Full Analysis' : 'Komplette Analyse lesen'}</span>
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
              <figure className="relative">
                <img
                  src={homeContent.stats_image || "https://images.unsplash.com/photo-1517048676732-d65bc937f952"}
                  alt="Investment-Beratung für Balkan-Märkte - EuroAdria Corporate Solutions Team Meeting"
                  className="rounded-xl shadow-lg"
                  style={{ objectPosition: `center ${homeContent.stats_image_position ?? 50}%` }}
                  itemProp="image"
                />
                <figcaption className="absolute -bottom-6 -left-6 bg-white border border-gray-200 rounded-xl p-6 shadow-lg max-w-xs">
                  <div className="text-3xl font-bold text-ea-gold mb-2">60-80%</div>
                  <div className="text-ea-dark/70 text-sm">
                    {lang === 'en' ? 'Expected appreciation in Montenegro before EU accession (Source: EuroAdria Corporate Solutions Market Analysis)' : 'Erwartete Wertsteigerung in Montenegro vor EU-Beitritt (Quelle: EuroAdria Corporate Solutions Marktanalyse)'}
                  </div>
                </figcaption>
              </figure>
            </div>
          </article>
        </div>
      </section>

      {/* Featured Articles */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-semibold text-ea-dark mb-4">
              {lang === 'en' ? <>Current <span className="text-ea-gold">Insights</span></> : <>Aktuelle <span className="text-ea-gold">Insights</span></>}
            </h2>
            <p className="text-ea-dark/70 text-lg max-w-2xl mx-auto">
              {lang === 'en' ? 'Exclusive analyses, market reports and investment strategies for the Adriatic region' : 'Exklusive Analysen, Marktberichte und Investment-Strategien für die Adria-Region'}
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="w-10 h-10 text-ea-gold animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {featuredArticles.map((article) => (
                <Link
                  key={article.id}
                  to={`/blog/${article.slug}`}
                  className="group"
                  data-testid={`featured-article-${article.slug}`}
                >
                  <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/90 backdrop-blur-sm text-xs text-ea-dark px-3 py-1.5 rounded-full font-medium">
                          {article.category}
                        </span>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center space-x-2 text-xs text-ea-dark/50 mb-3">
                        <Clock className="w-3 h-3" />
                        <span>{article.readTime}</span>
                      </div>
                      <h3 className="text-lg font-semibold text-ea-dark mb-2 group-hover:text-ea-gold transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-ea-dark/70 text-sm line-clamp-2 mb-4">
                        {article.excerpt}
                      </p>
                      <div className="flex items-center text-ea-gold text-sm font-medium">
                        <span>{lang === 'en' ? 'Read More' : 'Weiterlesen'}</span>
                        <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center">
            <Link
              to="/blog"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all"
              data-testid="view-all-articles-button"
            >
              <span>{lang === 'en' ? 'View All Articles' : 'Alle Artikel ansehen'}</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-ea-light border-y border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {(lang === 'en' ? [
              { title: 'Trustworthy', desc: 'Referenced in n-tv, RTL, Focus & more' },
              { title: 'Return Focus', desc: 'Double-digit target returns' },
              { title: 'Expertise', desc: '15+ years experience' },
              { title: 'Security', desc: 'Asset Protection' }
            ] : (homeContent.trust_items || [
              { title: 'Vertrauenswürdig', desc: 'Referenziert in n-tv, RTL, Focus & mehr' },
              { title: 'Rendite-Fokus', desc: 'Zweistellige Zielrenditen' },
              { title: 'Expertise', desc: '15+ Jahre Erfahrung' },
              { title: 'Sicherheit', desc: 'Asset Protection' }
            ])).map((item, idx) => {
              const icons = [Shield, TrendingUp, Award, Shield];
              const Icon = icons[idx % icons.length];
              return (
                <div key={idx} className="text-center">
                  <div className="w-14 h-14 bg-ea-gold/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-7 h-7 text-ea-gold" />
                  </div>
                  <h3 className="text-ea-dark font-semibold mb-1">{item.title}</h3>
                  <p className="text-ea-dark/50 text-sm">{item.desc}</p>
                </div>
              );
            })}
          </div>
          
          {/* Media References */}
          <div className="mt-12 flex justify-center">
            <MediaBadge />
          </div>
        </div>
      </section>

      {/* YouTube Video Slider */}
      <YouTubeSlider />

      {/* Testimonial Section */}
      <section className="py-20 bg-ea-dark relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-no-repeat opacity-30"
          style={{
            backgroundImage: homeContent.testimonial_image ? `url(${homeContent.testimonial_image})` : 'none',
            backgroundPosition: `center ${homeContent.testimonial_image_position ?? 50}%`
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-6">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-6 h-6 text-ea-gold" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.746,1.464l3.11,6.3L22.81,8.776a.831.831,0,0,1,.461,1.418l-5.033,4.9,1.188,6.926a.832.832,0,0,1-1.207.877L12,19.632,5.78,22.9a.833.833,0,0,1-1.207-.878L5.761,15.1l-5.033-4.9a.831.831,0,0,1,.461-1.418L8.143,7.765l3.11-6.3A.833.833,0,0,1,12.746,1.464Z"/>
              </svg>
            ))}
          </div>
          <blockquote className="text-xl md:text-2xl text-ea-light font-semibold leading-relaxed mb-6">
            „{lang === 'en' 
              ? 'Thanks to EuroAdria Corporate Solutions, I was able to set up my company in Montenegro quickly, safely, and completely stress-free. I felt extremely well looked after and can warmly recommend EuroAdria Corporate Solutions to every entrepreneur and investor.'
              : (homeContent.testimonial_quote || 'Dank EuroAdria Corporate Solutions konnte ich meine Firmengründung in Montenegro schnell, sicher und komplett stressfrei umsetzen. Ich habe mich bestens betreut gefühlt und kann EuroAdria Corporate Solutions jedem Unternehmer und Investor wärmstens empfehlen.')
            }"
          </blockquote>
          <p className="text-ea-light/70">
            {lang === 'en' 
              ? 'Maximilian R., Entrepreneur from Germany'
              : (homeContent.testimonial_author || 'Maximilian R., Unternehmer aus Deutschland')
            }
          </p>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-ea-dark mb-6">
            {lang === 'en' 
              ? <>Ready for Your <span className="text-ea-gold">Investment</span>?</>
              : (homeContent.cta_title || <>Bereit für Ihre <span className="text-ea-gold">Investition</span>?</>)
            }
          </h2>
          <p className="text-ea-dark/70 text-lg mb-8 max-w-2xl mx-auto">
            {lang === 'en' ? t('home.ctaSubtitle') : (homeContent.cta_subtitle || t('home.ctaSubtitle'))}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/contact"
              className="px-8 py-4 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all"
              data-testid="cta-consultation-button"
            >
              {t('home.ctaButton')}
            </Link>
            <Link
              to="/serbia-executive"
              className="px-8 py-4 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all flex items-center gap-2"
              data-testid="cta-serbia-button"
            >
              <Shield className="w-5 h-5" />
              Serbia Executive Access
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <NewsletterSignup variant="section" />
        </div>
      </section>

      {/* FAQ Section - AEO optimiert */}
      <FAQSection />
    </main>
  );
};

export default Home;
