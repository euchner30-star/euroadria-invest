import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { articlesApi, getRelatedArticles } from '../services/api';
import { Clock, Calendar, User, ArrowLeft, ArrowRight, Loader2, Shield, Download } from 'lucide-react';
import { DueDiligenceBox, ExpertTipBox, LeadMagnetBox } from '../components/ArticleComponents';
import ShareButtons from '../components/ShareButtons';
import CommentsSection from '../components/CommentsSection';
import SEO from '../components/SEO';
import { parseContentToHTML } from '../utils/contentParser';
import { useLanguage } from '../context/LanguageContext';

const API_URL = process.env.REACT_APP_BACKEND_URL;

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { lang, t } = useLanguage();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchArticle = async () => {
      try {
        setLoading(true);
        
        if (lang === 'en') {
          // Fetch translated article from backend
          try {
            const res = await fetch(`${API_URL}/api/translate/article/${slug}?target=en`);
            if (res.ok) {
              const translatedData = await res.json();
              setArticle(translatedData);
              if (translatedData.relatedArticles && translatedData.relatedArticles.length > 0) {
                const related = await getRelatedArticles(translatedData.relatedArticles.slice(0, 3));
                setRelatedArticles(related);
              }
              return;
            }
          } catch (_) {}
        }

        // Default: fetch original German article
        const data = await articlesApi.getBySlug(slug);
        if (!data) {
          setNotFound(true);
          return;
        }
        setArticle(data);
        
        if (data.relatedArticles && data.relatedArticles.length > 0) {
          const related = await getRelatedArticles(data.relatedArticles.slice(0, 3));
          setRelatedArticles(related);
        }
      } catch (err) {
        console.error('Failed to fetch article:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    
    fetchArticle();
  }, [slug, lang]);

  if (notFound) {
    return <Navigate to="/blog" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-32 pb-20 px-6 flex justify-center items-center bg-white">
        <Loader2 className="w-12 h-12 text-ea-gold animate-spin" />
      </div>
    );
  }

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen pt-24 md:pt-32 pb-20 px-4 md:px-6 bg-white">
      <SEO 
        title={article.title}
        description={article.excerpt}
        image={article.image}
        url={`/blog/${article.slug}`}
        type="article"
        article={{
          date: article.date,
          author: article.author,
          category: article.category
        }}
      />
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center space-x-2 text-ea-dark/70 hover:text-ea-gold transition-colors mb-6 md:mb-8 group text-sm md:text-base"
          data-testid="back-to-blog-button"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
          <span>{lang === 'en' ? 'Back to Blog' : 'Zurück zum Blog'}</span>
        </Link>

        {/* Article Header */}
        <article className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-5 md:p-8 lg:p-12 shadow-sm">
          {/* Category Badge */}
          <div className="inline-block bg-ea-light border border-ea-gold/20 text-xs md:text-sm text-ea-dark px-3 py-1.5 md:px-4 md:py-2 rounded-lg mb-4 md:mb-6 font-medium">
            {article.category}
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-ea-dark mb-4 md:mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm text-ea-dark/60 mb-6 md:mb-8 pb-6 md:pb-8 border-b border-gray-200">
            <div className="flex items-center space-x-1.5 md:space-x-2">
              <User className="w-3.5 h-3.5 md:w-4 md:h-4 text-ea-gold" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center space-x-1.5 md:space-x-2">
              <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4 text-ea-gold" />
              <span>{new Date(article.date).toLocaleDateString(lang === 'en' ? 'en-GB' : 'de-DE', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center space-x-1.5 md:space-x-2">
              <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-ea-gold" />
              <span>{article.readTime} {lang === 'en' ? 'read time' : 'Lesezeit'}</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative h-48 md:h-72 lg:h-96 rounded-lg md:rounded-xl overflow-hidden mb-6 md:mb-10">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
              style={{ objectPosition: `center ${article.imagePosition ?? 50}%` }}
            />
          </div>

          {/* Article Excerpt */}
          <p className="text-base md:text-xl text-ea-dark/80 leading-relaxed mb-6 md:mb-8 font-light italic border-l-4 border-ea-gold pl-4 md:pl-6">
            {article.excerpt}
          </p>

          {/* Article Content - Semantic HTML */}
          <section className="prose prose-sm md:prose-lg max-w-none" itemProp="articleBody">
            <div 
              className="text-ea-dark/80 leading-relaxed space-y-4 md:space-y-6 text-sm md:text-base"
              dangerouslySetInnerHTML={{ __html: parseContentToHTML(article.content) }}
            />
          </section>

          {/* Serbia Executive CTA - Internal Linking for GEO */}
          {(article.cluster === 'serbien-balkan' || article.content.toLowerCase().includes('serbien')) && (
            <aside className="my-8 p-6 bg-ea-navy rounded-xl border border-ea-gold/20">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-ea-gold/20 rounded-lg">
                  <Shield className="w-6 h-6 text-ea-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Serbia Executive Access</h3>
                  <p className="text-ea-light/80 text-sm mb-4">
                    {lang === 'en' ? 'Exclusive access to Serbian government contacts, infrastructure projects, and investment incentives.' : 'Exklusiver Zugang zu serbischen Regierungskontakten, Infrastrukturprojekten und Investment-Incentives.'}
                  </p>
                  <Link 
                    to="/serbia-executive" 
                    className="inline-flex items-center gap-2 text-ea-gold hover:text-ea-gold/80 font-medium text-sm"
                  >
                    {lang === 'en' ? 'Learn more' : 'Mehr erfahren'} <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </aside>
          )}

          {/* Due Diligence Box */}
          {article.dueDiligenceBox && (
            <DueDiligenceBox 
              title={article.dueDiligenceBox.title}
              content={article.dueDiligenceBox.content}
            />
          )}

          {/* Expert Tip Box */}
          {article.expertTip && (
            <ExpertTipBox
              author={article.expertTip.author}
              title={article.expertTip.title}
              content={article.expertTip.content}
            />
          )}

          {/* Download / Expose Button */}
          {article.downloadUrl && (
            <div className="my-8 md:my-10 p-5 md:p-8 bg-ea-navy rounded-xl border border-ea-gold/20" data-testid="article-download-section">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-ea-gold/20 rounded-lg">
                  <Download className="w-6 h-6 text-ea-gold" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">{t('blog.downloadExpose')}</h3>
                  <p className="text-ea-light/70 text-sm">{t('blog.downloadDesc')}</p>
                </div>
                <a
                  href={article.downloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 bg-ea-gold text-ea-dark font-semibold rounded-lg hover:bg-ea-gold/80 transition-all text-sm md:text-base whitespace-nowrap"
                  data-testid="article-download-button"
                >
                  <Download className="w-4 h-4" />
                  <span>{t('blog.downloadPdf')}</span>
                </a>
              </div>
            </div>
          )}

          {/* Lead Magnet */}
          <LeadMagnetBox />

          {/* Share Buttons */}
          <ShareButtons 
            title={article.title}
            url={window.location.href}
            excerpt={article.excerpt}
          />

          {/* CTA Section */}
          <div className="mt-8 md:mt-12 p-5 md:p-8 bg-ea-light rounded-xl border border-ea-gold/20">
            <h3 className="text-xl md:text-2xl font-semibold text-ea-dark mb-2 md:mb-3">
              {lang === 'en' ? 'Interested in investment opportunities?' : 'Interessiert an Investment-Möglichkeiten?'}
            </h3>
            <p className="text-ea-dark/70 mb-4 md:mb-6 text-sm md:text-base">
              {lang === 'en' ? 'Let our experts advise you and discover exclusive opportunities.' : 'Lassen Sie sich von unseren Experten beraten und entdecken Sie exklusive Opportunities.'}
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center space-x-2 px-5 py-2.5 md:px-6 md:py-3 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all text-sm md:text-base"
              data-testid="article-cta-button"
            >
              <span>{lang === 'en' ? 'Request free consultation' : 'Kostenlose Beratung anfragen'}</span>
              <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </div>
        </article>

        {/* Comments Section */}
        <CommentsSection articleId={article.id} articleSlug={article.slug} />

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 md:mt-16">
            <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-ea-dark mb-6 md:mb-8">
              {lang === 'en' ? <>Related <span className="text-ea-gold">Articles</span></> : <>Ähnliche <span className="text-ea-gold">Beiträge</span></>}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="group"
                >
                  <article className="bg-white border border-gray-200 rounded-xl md:rounded-2xl h-full overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-32 md:h-40 overflow-hidden">
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-4 md:p-5">
                      <span className="text-xs text-ea-gold font-medium">{related.category}</span>
                      <h3 className="text-base md:text-lg font-semibold text-ea-dark mt-1.5 md:mt-2 mb-1.5 md:mb-2 group-hover:text-ea-gold transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-ea-dark/50">
                        <Clock className="w-3 h-3" />
                        <span>{related.readTime}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticlePage;
