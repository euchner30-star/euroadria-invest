import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Detect traffic source from User-Agent (in-app browsers),
 * platform click-IDs (fbclid, ttclid, gclid...), UTM params,
 * and document.referrer — in that priority order.
 */
function detectTrafficSource(search, userAgent, referrer) {
  const params = new URLSearchParams(search);
  const ua = (userAgent || '').toLowerCase();

  // 1) Explicit utm_source always wins
  const utmSource = params.get('utm_source');
  if (utmSource) return utmSource;

  // 2) Platform click-IDs injected by ad platforms
  if (params.get('fbclid'))  return 'facebook';
  if (params.get('ttclid'))  return 'tiktok';
  if (params.get('gclid'))   return 'google-ads';
  if (params.get('twclid'))  return 'twitter';
  if (params.get('msclkid')) return 'bing-ads';
  if (params.get('li_fat_id')) return 'linkedin';

  // 3) In-App browser detection via User-Agent
  if (ua.includes('tiktok') || ua.includes('bytedancewebview') || ua.includes('musical_ly'))
    return 'tiktok';
  if (ua.includes('instagram'))
    return 'instagram';
  if (ua.includes('fban') || ua.includes('fbav') || ua.includes('fb_iab'))
    return 'facebook';
  if (ua.includes('linkedin'))
    return 'linkedin';
  if (ua.includes('twitter'))
    return 'twitter';
  if (ua.includes('snapchat'))
    return 'snapchat';
  if (ua.includes('pinterest'))
    return 'pinterest';

  // 4) Referrer-based detection (classic browser with referrer header)
  if (referrer) {
    const ref = referrer.toLowerCase();
    if (ref.includes('google'))    return 'google';
    if (ref.includes('bing'))      return 'bing';
    if (ref.includes('facebook') || ref.includes('fb.com')) return 'facebook';
    if (ref.includes('instagram') || ref.includes('l.instagram')) return 'instagram';
    if (ref.includes('tiktok'))    return 'tiktok';
    if (ref.includes('youtube'))   return 'youtube';
    if (ref.includes('linkedin'))  return 'linkedin';
    if (ref.includes('twitter') || ref.includes('x.com') || ref.includes('t.co')) return 'twitter';
    if (ref.includes('reddit'))    return 'reddit';
    if (ref.includes('whatsapp') || ref.includes('wa.me')) return 'whatsapp';
    if (ref.includes('telegram') || ref.includes('t.me')) return 'telegram';
    if (ref.includes('euroadria')) return '';  // internal navigation, ignore
    return ref;  // unknown external referrer, store raw
  }

  // 5) Nothing found → truly direct traffic
  return '';
}

const usePageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;

    const trackView = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const userAgent = navigator.userAgent || '';
        const referrer = document.referrer || '';

        // Smart source detection
        const detectedSource = detectTrafficSource(location.search, userAgent, referrer);

        await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/track/pageview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: location.pathname,
            referrer: referrer,
            user_agent: userAgent,
            utm_source: detectedSource || params.get('utm_source') || '',
            utm_medium: params.get('utm_medium') || '',
            utm_campaign: params.get('utm_campaign') || ''
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
