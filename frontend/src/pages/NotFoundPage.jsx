import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-ea-light" data-testid="not-found-page">
      <div className="text-center px-6 max-w-lg">
        <div className="text-8xl font-bold text-ea-gold/30 mb-4">404</div>
        <h1 className="text-2xl sm:text-3xl font-bold text-ea-dark mb-3">
          Seite nicht gefunden
        </h1>
        <p className="text-ea-dark/60 mb-8 text-sm sm:text-base">
          Die angeforderte Seite existiert nicht oder wurde verschoben.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ea-dark text-white rounded-lg hover:bg-ea-navy transition-colors text-sm font-medium"
            data-testid="back-home-btn"
          >
            <ArrowLeft className="w-4 h-4" />
            Zur Startseite
          </Link>
          <Link
            to="/blog"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ea-gold/10 text-ea-dark border border-ea-gold/30 rounded-lg hover:bg-ea-gold/20 transition-colors text-sm font-medium"
            data-testid="browse-blog-btn"
          >
            <Search className="w-4 h-4" />
            Blog durchsuchen
          </Link>
        </div>
      </div>
    </div>
  );
}
