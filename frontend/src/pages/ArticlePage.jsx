import React, { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { articlesApi, getRelatedArticles } from '../services/api';
import { Clock, Calendar, User, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { DueDiligenceBox, ExpertTipBox, LeadMagnetBox } from '../components/ArticleComponents';
import ShareButtons from '../components/ShareButtons';
import CommentsSection from '../components/CommentsSection';

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
        
        // Fetch related articles
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
      <div className="min-h-screen pt-32 pb-20 px-6 flex justify-center items-center">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  if (!article) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <div className="min-h-screen pt-32 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Link
          to="/blog"
          className="inline-flex items-center space-x-2 text-white/70 hover:text-gold transition-colors mb-8 group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Zurück zum Blog</span>
        </Link>

        {/* Article Header */}
        <article className="glass-card p-8 md:p-12">
          {/* Category Badge */}
          <div className="inline-block glass-card text-sm text-gold px-4 py-2 mb-6 font-medium border border-gold/20">
            {article.category}
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
            {article.title}
          </h1>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 text-sm text-white/60 mb-8 pb-8 border-b border-white/10">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gold" />
              <span>{article.author}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gold" />
              <span>{new Date(article.date).toLocaleDateString('de-DE', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gold" />
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          </div>

          {/* Article Excerpt */}
          <p className="text-xl text-white/90 leading-relaxed mb-8 font-light italic border-l-4 border-gold pl-6">
            {article.excerpt}
          </p>

          {/* Article Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            <div 
              className="text-white/80 leading-relaxed space-y-6"
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
          <div className="mt-12 p-8 glass-card-strong rounded-xl border border-gold/20">
            <h3 className="text-2xl font-bold text-white mb-3">
              Interessiert an Investment-Möglichkeiten?
            </h3>
            <p className="text-white/70 mb-6">
              Lassen Sie sich von unseren Experten beraten und entdecken Sie exklusive Opportunities.
            </p>
            <Link
              to="/contact"
              className="btn-gold inline-flex items-center space-x-2"
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
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-8">
              Ähnliche <span className="text-gold">Beiträge</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((related) => (
                <Link
                  key={related.id}
                  to={`/blog/${related.slug}`}
                  className="group"
                >
                  <article className="glass-card-hover h-full overflow-hidden">
                    <div className="relative h-40 overflow-hidden">
                      <img
                        src={related.image}
                        alt={related.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>
                    <div className="p-5">
                      <span className="text-xs text-gold font-medium">{related.category}</span>
                      <h3 className="text-lg font-bold text-white mt-2 mb-2 group-hover:text-gold transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-xs text-white/50">
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