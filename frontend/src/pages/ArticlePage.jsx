import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { articlesApi, getRelatedArticles } from '../services/api';
import { Clock, Calendar, User, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { DueDiligenceBox, ExpertTipBox, LeadMagnetBox } from '../components/ArticleComponents';
import ShareButtons from '../components/ShareButtons';
import CommentsSection from '../components/CommentsSection';
import SEO from '../components/SEO';

const ArticlePage = () => {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    const fetchArticle = async () => {
      try {
        setLoading(true);
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
  }, [slug]);

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
    <div className="min-h-screen pt-32 pb-20 px-6 bg-white">
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
          className="inline-flex items-center space-x-2 text-ea-dark/70 hover:text-ea-gold transition-colors mb-8 group"
          data-testid="back-to-blog-button"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Zurück zum Blog</span>
        </Link>

        {/* Article Header */}
        <article className="bg-white border border-gray-200 rounded-2xl p-8 md:p-12 shadow-sm">
          {/* Category Badge */}
          <div className="inline-block bg-ea-light border border-ea-gold/20 text-sm text-ea-dark px-4 py-2 rounded-lg mb-6 font-medium">
            {article.category}
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-ea-dark mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-ea-dark/60 mb-8 pb-8 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-ea-gold" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-ea-gold" />
              <span>{new Date(article.date).toLocaleDateString('de-DE', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-ea-gold" />
              <span>{article.readTime} Lesezeit</span>
            </div>
          </div>

          {/* Featured Image */}
          <div className="relative h-96 rounded-xl overflow-hidden mb-10">
            <img
              src={article.image}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Article Excerpt */}
          <p className="text-xl text-ea-dark/80 leading-relaxed mb-8 font-light italic border-l-4 border-ea-gold pl-6">
            {article.excerpt}
          </p>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none">
            <div 
              className="text-ea-dark/80 leading-relaxed space-y-6"
              dangerouslySetInnerHTML={{ __html: article.content.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />') }}
            />
          </div>

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

          {/* Lead Magnet */}
          <LeadMagnetBox />

          {/* Share Buttons */}
          <ShareButtons 
            title={article.title}
            url={window.location.href}
            excerpt={article.excerpt}
          />

          {/* CTA Section */}
          <div className="mt-12 p-8 bg-ea-light rounded-xl border border-ea-gold/20">
            <h3 className="text-2xl font-semibold text-ea-dark mb-3">
              Interessiert an Investment-Möglichkeiten?
            </h3>
            <p className="text-ea-dark/70 mb-6">
              Lassen Sie sich von unseren Experten beraten und entdecken Sie exklusive Opportunities.
            </p>
            <Link
              to="/contact"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-ea-dark text-white font-semibold rounded-lg hover:bg-ea-navy transition-all"
              data-testid="article-cta-button"
            >
              <span>Kostenlose Beratung anfragen</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </article>

        {/* Comments Section */}
        <CommentsSection articleId={article.id} articleSlug={article.slug} />

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl md:text-3xl font-semibold text-ea-dark mb-8">
              Ähnliche <span className="text-ea-gold">Beiträge</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="group"
                >
                  <article className="bg-white border border-gray-200 rounded-2xl h-full overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    </div>
                    <div className="p-5">
                      <span className="text-xs text-ea-gold font-medium">{related.category}</span>
                      <h3 className="text-lg font-semibold text-ea-dark mt-2 mb-2 group-hover:text-ea-gold transition-colors line-clamp-2">
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
