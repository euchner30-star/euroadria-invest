import { Component } from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[70vh] flex items-center justify-center bg-ea-light" data-testid="error-boundary">
          <div className="text-center px-6 max-w-lg">
            <div className="w-16 h-16 rounded-full bg-ea-gold/10 flex items-center justify-center mx-auto mb-6">
              <RefreshCw className="w-8 h-8 text-ea-gold" />
            </div>
            <h1 className="text-2xl font-bold text-ea-dark mb-3">
              Etwas ist schiefgelaufen
            </h1>
            <p className="text-ea-dark/60 mb-8 text-sm">
              Bitte laden Sie die Seite neu oder kehren Sie zur Startseite zurueck.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ea-dark text-white rounded-lg hover:bg-ea-navy transition-colors text-sm font-medium"
                data-testid="reload-btn"
              >
                <RefreshCw className="w-4 h-4" />
                Seite neu laden
              </button>
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-ea-gold/10 text-ea-dark border border-ea-gold/30 rounded-lg hover:bg-ea-gold/20 transition-colors text-sm font-medium"
                data-testid="error-home-btn"
              >
                <ArrowLeft className="w-4 h-4" />
                Zur Startseite
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
