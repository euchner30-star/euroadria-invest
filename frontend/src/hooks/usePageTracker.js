import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    // Don't track admin pages
    if (location.pathname.startsWith('/admin')) return;

    const trackView = async () => {
      try {
        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/track/pageview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: location.pathname,
            referrer: document.referrer || '',
            user_agent: navigator.userAgent
          })
        });
      } catch (err) {
        // Silent fail - tracking should never break the app
      }
    };

    trackView();
  }, [location.pathname]);
};

export default usePageTracker;
