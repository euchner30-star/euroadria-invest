import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const usePageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;

    const trackView = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const utmSource = params.get('utm_source') || '';
        const utmMedium = params.get('utm_medium') || '';
        const utmCampaign = params.get('utm_campaign') || '';

        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/track/pageview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: location.pathname,
            referrer: document.referrer || '',
            user_agent: navigator.userAgent,
            utm_source: utmSource,
            utm_medium: utmMedium,
            utm_campaign: utmCampaign
          })
        });
      } catch (err) {
        // Silent fail
      }
    };

    trackView();
  }, [location.pathname, location.search]);
};

export default usePageTracker;
