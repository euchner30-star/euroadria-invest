import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { articlesApi } from '../services/api';
import { Clock, ArrowRight, Search, Loader2, ChevronRight, RefreshCw } from 'lucide-react';
import SEO from '../components/SEO';
import { useLanguage } from '../context/LanguageContext';

// Lazy-loaded image component
const LazyImage = ({ src, alt, className, imagePosition }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = React.useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`${className} bg-ea-light`}>
      {isInView && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ objectPosition: `center ${imagePosition ?? 50}%` }}
          onLoad={() => setIsLoaded(true)}
          loading="lazy"
        />
      )}
      {!isLoaded && isInView && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-ea-gold/50 animate-spin" />
        </div>
      )}
    </div>
  );
};

const BlogPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCluster, setSelectedCluster] = useState('All');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    hasMore: false
  });
  const [clusterCounts, setClusterCounts] = useState({});
  const [categories, setCategories] = useState([]);
  const { lang, t } = useLanguage();

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch cluster counts on mount
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/clusters`);
        if (response.ok) {
          const data = await response.json();
          const counts = {};
          data.forEach(c => { counts[c.name || c.id] = c.count; });
          setClusterCounts(counts);
          setCategories(data.map(c => ({ id: c.name || c.id, name: c.name || c.id, count: c.count })));
        }
      } catch (err) {
        console.error('Failed to fetch cluster counts');
      }
    };
    fetchCounts();
  }, []);

  // Fetch articles with pagination
  const fetchArticles = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const data = await articlesApi.getList({
        page,
        limit: 12,
        cluster: selectedCluster !== 'All' ? selectedCluster : null,
        search: debouncedSearch || null
      });

      if (append) {
        setArticles(prev => [...prev, ...data.articles]);
      } else {
        setArticles(data.articles);
      }

      setPagination({
        page: data.page,
        totalPages: data.totalPages,
        total: data.total,
        hasMore: data.hasMore
      });

      setError(null);
    } catch (err) {
      console.error('Failed to fetch articles:', err);
      setError(lang === 'en' ? 'Articles could not be loaded.' : 'Artikel konnten nicht geladen werden.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [selectedCluster, debouncedSearch, lang]);

  // Initial fetch and when filters change
  useEffect(() => {
    fetchArticles(1, false);
  }, [fetchArticles]);

  // Load more handler
  const handleLoadMore = () => {
    if (pagination.hasMore && !loadingMore) {
      fetchArticles(pagination.page + 1, true);
    }
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [selectedCluster, debouncedSearch]);

  return (
    <div className="min-h-screen pt-28 pb-20 px-6 bg-white" data-testid="blog-page">
      <SEO 
        title="Blog & Insights"
        description="Tiefgehende Analysen, Marktberichte und praktische Guides für erfolgreiche Investments an der Adria."
        url="/blog"
      />
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-semibold text-ea-dark mb-4">
            Insights
          </h1>
          <p className="text-ea-dark/70 text-lg max-w-3xl mx-auto">
            {lang === 'en' ? 'In-depth analyses, market reports and practical guides for successful investments on the Adriatic' : 'Tiefgehende Analysen, Marktberichte und praktische Guides für erfolgreiche Investments an der Adria'}
          </p>
        </div>

        {/* Theme Clusters Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setSelectedCluster('All')}
              data-testid="cluster-filter-all"
              className={`px-4 py-2 rounded-lg text-sm transition-all font-medium ${
                selectedCluster === 'All'
                  ? 'bg-ea-dark text-white'
                  : 'bg-ea-light text-ea-dark hover:bg-ea-gold/20'
              }`}
            >
              {lang === 'en' ? 'All' : 'Alle'} ({pagination.total || Object.values(clusterCounts).reduce((a, b) => a + b, 0)})
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCluster(cat.id)}
                data-testid={`cluster-filter-${cat.id}`}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  selectedCluster === cat.id
                    ? 'bg-ea-dark text-white font-medium'
                    : 'bg-ea-light text-ea-dark hover:bg-ea-gold/20'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-ea-dark/40" />
            <input
              type="text"
              placeholder={lang === 'en' ? 'Search articles...' : 'Artikel durchsuchen...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="blog-search-input"
              className="w-full bg-ea-light border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-ea-dark placeholder-ea-dark/40 focus:outline-none focus:border-ea-gold focus:ring-2 focus:ring-ea-gold/20 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-ea-dark/40 hover:text-ea-dark"
              >
                x
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 text-ea-gold animate-spin" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center mb-12">
            <p className="text-red-600">{error}</p>
            <button
              onClick={() => fetchArticles(1, false)}
              className="mt-4 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
            >
              {lang === 'en' ? 'Try again' : 'Erneut versuchen'}
            </button>
          </div>
        )}

        {/* Articles Grid */}
        {!loading && !error && (
          <>
            {articles.length === 0 ? (
              <div className="bg-ea-light border border-gray-200 rounded-xl p-12 text-center">
                <p className="text-ea-dark/70 text-lg">
                  {debouncedSearch 
                    ? (lang === 'en' ? 'No articles found. Try a different search term.' : 'Keine Artikel gefunden. Versuchen Sie einen anderen Suchbegriff.')
                    : (lang === 'en' ? 'No articles in this category.' : 'Keine Artikel in dieser Kategorie.')}
                </p>
              </div>
            ) : (
              <>
                {/* Results Info */}
                <div className="flex items-center justify-between mb-6">
                  <p className="text-ea-dark/50 text-sm">
                    {pagination.total} {lang === 'en' ? 'articles found' : 'Artikel gefunden'}
                    {debouncedSearch && ` ${lang === 'en' ? 'for' : 'für'} "${debouncedSearch}"`}
                  </p>
                  {articles.length < pagination.total && (
                    <p className="text-ea-dark/50 text-sm">
                      {lang === 'en' ? `Showing ${articles.length} of ${pagination.total}` : `Zeige ${articles.length} von ${pagination.total}`}
                    </p>
                  )}
                </div>

                {/* Articles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                  {articles.map((article) => (
                    <Link
                      key={article.id}
                      to={`/blog/${article.slug}`}
                      className="block group"
                      data-testid={`article-card-${article.slug}`}
                    >
                      <article className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                        <div className="relative h-44 overflow-hidden">
                          <LazyImage
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full relative"
                            imagePosition={article.imagePosition}
                          />
                          <div className="absolute top-3 left-3">
                            <span className="bg-white/90 backdrop-blur-sm text-xs text-ea-dark px-2.5 py-1 rounded-full font-medium">
                              {article.category}
                            </span>
                          </div>
                        </div>
                        <div className="p-5">
                          <div className="flex items-center space-x-2 mb-2 text-xs text-ea-dark/50">
                            <span>{article.date}</span>
                            <span>-</span>
                            <Clock className="w-3 h-3" />
                            <span>{article.readTime}</span>
                          </div>
                          <h3 className="text-base font-semibold text-ea-dark mb-2 group-hover:text-ea-gold transition-colors line-clamp-2">
                            {article.title}
                          </h3>
                          <div className="flex items-center text-ea-gold text-sm font-medium">
                            <span>{lang === 'en' ? 'Read' : 'Lesen'}</span>
                            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>

                {/* Load More Button */}
                {pagination.hasMore && (
                  <div className="text-center">
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="px-8 py-4 bg-ea-dark text-white font-semibold rounded-xl hover:bg-ea-navy transition-all flex items-center gap-3 mx-auto disabled:opacity-50"
                      data-testid="load-more-button"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          {lang === 'en' ? 'Loading...' : 'Lade...'}
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-5 h-5" />
                          {lang === 'en' ? 'Load more articles' : 'Weitere Artikel laden'}
                          <span className="text-white/70 text-sm">
                            ({pagination.total - articles.length} {lang === 'en' ? 'remaining' : 'verbleibend'})
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* All Loaded Message */}
                {!pagination.hasMore && articles.length > 12 && (
                  <div className="text-center py-8">
                    <p className="text-ea-dark/50">
                      {lang === 'en' ? `All ${pagination.total} articles loaded` : `Alle ${pagination.total} Artikel geladen`}
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
