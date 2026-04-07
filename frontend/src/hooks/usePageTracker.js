import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Detect TikTok via JavaScript bridge objects that TikTok injects.
 * On iOS, TikTok uses a standard Safari UA but injects JS bridges.
 */
function isTikTokBrowser() {
  try {
    if (typeof window === 'undefined') return false;
    if (window.TikTokJSBridge) return true;
    if (window.TtWebViewBridge) return true;
    if (window.__tgWebview) return true;
    if (window.TikTokWebview) return true;
    // Check navigator for TikTok hints
    const ua = (navigator.userAgent || '').toLowerCase();
    if (ua.includes('tiktok') || ua.includes('bytedancewebview') || ua.includes('musical_ly')) return true;
    if (ua.includes('bytedance') || ua.includes('bytedancewebview')) return true;
    return false;
  } catch (e) {
    return false;
  }
}

/**
 * Detect traffic source from JS bridge objects, User-Agent,
 * platform click-IDs, UTM params, and document.referrer.
 */
function detectTrafficSource(search, userAgent, referrer) {
  const params = new URLSearchParams(search);
  const ua = (userAgent || '').toLowerCase();

  // 1) Explicit utm_source always wins
  const utmSource = params.get('utm_source');
  if (utmSource) return utmSource;

  // 2) Platform click-IDs injected by ad platforms
  if (params.get('fbclid'))    return 'facebook';
  if (params.get('ttclid'))    return 'tiktok';
  if (params.get('gclid'))     return 'google-ads';
  if (params.get('twclid'))    return 'twitter';
  if (params.get('msclkid'))   return 'bing-ads';
  if (params.get('li_fat_id')) return 'linkedin';

  // 3) TikTok JS bridge detection (iOS hides UA)
  if (isTikTokBrowser()) return 'tiktok';

  // 4) In-App browser detection via User-Agent
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

  // 5) Referrer-based detection
  if (referrer) {
    const ref = referrer.toLowerCase();
    if (ref.includes('tiktok'))    return 'tiktok';
    if (ref.includes('google'))    return 'google';
    if (ref.includes('bing'))      return 'bing';
    if (ref.includes('facebook') || ref.includes('fb.com')) return 'facebook';
    if (ref.includes('instagram') || ref.includes('l.instagram')) return 'instagram';
    if (ref.includes('youtube'))   return 'youtube';
    if (ref.includes('linkedin'))  return 'linkedin';
    if (ref.includes('twitter') || ref.includes('x.com') || ref.includes('t.co')) return 'twitter';
    if (ref.includes('reddit'))    return 'reddit';
    if (ref.includes('whatsapp') || ref.includes('wa.me')) return 'whatsapp';
    if (ref.includes('telegram') || ref.includes('t.me')) return 'telegram';
    if (ref.includes('euroadria')) return '';
    return ref;
  }

  // 6) Nothing found = truly direct
  return '';
}

const usePageTracker = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) return;

    // Small delay to let TikTok inject its JS bridges
    const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams(location.search);
        const userAgent = navigator.userAgent || '';
        const referrer = document.referrer || '';

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
    }, 500);

    return () => clearTimeout(timer);
  }, [location.pathname, location.search]);
};

export default usePageTracker;
