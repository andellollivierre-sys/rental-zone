// Helper to generate a short human-readable tracking code (e.g. TRZ-8492)
function generateShortCode() {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `TRZ-${result}`;
}

// Initialize or retrieve authoritative session ID and short code from sessionStorage
export function getVisitorId() {
  if (typeof window === 'undefined') return null;
  let visitorId = localStorage.getItem('trz_visitor_id');
  if (!visitorId) {
    visitorId = crypto.randomUUID ? crypto.randomUUID() : 'visitor_' + Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem('trz_visitor_id', visitorId);
  }
  return visitorId;
}

export function getSessionData() {
  if (typeof window === 'undefined') return { sessionId: 'ssr', shortCode: 'TRZ-0000' };

  let sessionId = sessionStorage.getItem('trz_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID ? crypto.randomUUID() : 'sess_' + Math.random().toString(36).substring(2, 15);
    sessionStorage.setItem('trz_session_id', sessionId);
  }

  let shortCode = sessionStorage.getItem('trz_short_code');
  if (!shortCode) {
    shortCode = generateShortCode();
    sessionStorage.setItem('trz_short_code', shortCode);
  }

  return { sessionId, shortCode };
}

// Check and guard session_started to prevent duplicate fires across React mounts
export function shouldFireSessionStarted() {
  if (typeof window === 'undefined') return false;
  const started = sessionStorage.getItem('trz_session_started');
  if (!started) {
    sessionStorage.setItem('trz_session_started', 'true');
    return true;
  }
  return false;
}

// Preserve first identifiable source and the latest visit source separately.
function classifyTraffic(params, referrer) {
  const utmSource = params.get('utm_source');
  const utmMedium = params.get('utm_medium');
  const utmCampaign = params.get('utm_campaign');
  const clickId = params.get('gclid') || params.get('gbraid') || params.get('wbraid') || params.get('fbclid') || params.get('msclkid') || null;

  // ChatGPT may appear as a UTM source on the inbound link or inside
  // a same-site referrer URL after an intermediate redirect.
  let referrerUtmSource = '';
  try {
    referrerUtmSource = referrer ? (new URL(referrer).searchParams.get('utm_source') || '').toLowerCase() : '';
  } catch {}

  const normalizedUtmSource = (utmSource || '').toLowerCase();
  if (['chatgpt.com', 'chatgpt'].includes(normalizedUtmSource) ||
      ['chatgpt.com', 'chatgpt'].includes(referrerUtmSource)) {
    return {
      source: 'chatgpt',
      medium: (utmMedium || 'referral').toLowerCase(),
      campaign: utmCampaign,
      clickId
    };
  }

  if (utmSource) {
    return {
      source: utmSource.toLowerCase(),
      medium: (utmMedium || (clickId ? 'paid' : 'referral')).toLowerCase(),
      campaign: utmCampaign,
      clickId
    };
  }
  if (params.has('gclid') || params.has('gbraid') || params.has('wbraid')) {
    return { source: 'google', medium: 'cpc', campaign: null, clickId };
  }
  if (params.has('fbclid')) {
    return { source: 'facebook', medium: 'paid_social', campaign: null, clickId };
  }
  if (params.has('msclkid')) {
    return { source: 'bing', medium: 'cpc', campaign: null, clickId };
  }

  let hostname = '';
  try { hostname = referrer ? new URL(referrer).hostname.toLowerCase() : ''; } catch {}
  if (hostname === 'google.com' || hostname.endsWith('.google.com') || hostname === 'google.tt') {
    return { source: 'google', medium: 'organic', campaign: null, clickId: null };
  }
  if (hostname.includes('bing.com')) return { source: 'bing', medium: 'organic', campaign: null, clickId: null };
  if (hostname.includes('facebook.com') || hostname === 'fb.com' || hostname === 'l.facebook.com') {
    return { source: 'facebook', medium: 'organic_social', campaign: null, clickId: null };
  }
  if (hostname.includes('instagram.com')) return { source: 'instagram', medium: 'organic_social', campaign: null, clickId: null };
  if (hostname.includes('tiktok.com')) return { source: 'tiktok', medium: 'organic_social', campaign: null, clickId: null };
  if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return { source: 'youtube', medium: 'organic_video', campaign: null, clickId: null };
  if (hostname) return { source: hostname.replace(/^www\\./, ''), medium: 'referral', campaign: null, clickId: null };
  return { source: 'direct', medium: 'none', campaign: null, clickId: null };
}

export function getAttributionData() {
  if (typeof window === 'undefined') {
    return { source: 'direct', medium: 'none', campaign: null, clickId: null, firstTouch: { source: 'direct', medium: 'none', campaign: null, clickId: null, referrer: null, landingPage: '/' }, referrer: null, device: 'desktop', isTest: false };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const referrer = document.referrer || null;
  const current = classifyTraffic(urlParams, referrer);
  const landingPage = window.location.pathname + window.location.search;
  const isTest =
    urlParams.get('test') === 'true' ||
    urlParams.get('is_test') === '1' ||
    localStorage.getItem('dev_mode') === 'true' ||
    localStorage.getItem('is_admin') === 'true' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  let firstTouch = null;
  try { firstTouch = JSON.parse(localStorage.getItem('trz_first_touch') || 'null'); } catch {}
  if (!firstTouch || (firstTouch.source === 'direct' && current.source !== 'direct')) {
    if (current.source !== 'direct' || !firstTouch) {
      firstTouch = {
        source: current.source,
        medium: current.medium,
        campaign: current.campaign,
        clickId: current.clickId,
        referrer,
        landingPage,
        capturedAt: new Date().toISOString()
      };
      localStorage.setItem('trz_first_touch', JSON.stringify(firstTouch));
    }
  }

  const lastTouch = {
    source: current.source,
    medium: current.medium,
    campaign: current.campaign,
    clickId: current.clickId,
    referrer,
    landingPage,
    capturedAt: new Date().toISOString()
  };
  sessionStorage.setItem('trz_last_touch', JSON.stringify(lastTouch));

  const ua = navigator.userAgent || '';
  let device = 'desktop';
  if (/tablet|ipad/i.test(ua)) device = 'tablet';
  else if (/android|iphone|ipod|mobile/i.test(ua)) device = 'mobile';

  return {
    source: current.source,
    medium: current.medium,
    campaign: current.campaign,
    clickId: current.clickId,
    utmSource: current.source,
    utmMedium: current.medium,
    utmCampaign: current.campaign,
    utmContent: urlParams.get('utm_content'),
    firstTouch: firstTouch || lastTouch,
    referrer,
    device,
    isTest
  };
}

// Reusable page duration timer supporting active time tracking and visibility handling
export function createPageTimer() {
  let startTime = performance.now();
  let accumulatedSeconds = 0;
  let isHidden = false;

  const handleVisibility = () => {
    if (document.hidden) {
      accumulatedSeconds += Math.floor((performance.now() - startTime) / 1000);
      isHidden = true;
    } else {
      startTime = performance.now();
      isHidden = false;
    }
  };

  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', handleVisibility);
  }

  return {
    getSeconds() {
      if (!isHidden) {
        accumulatedSeconds += Math.floor((performance.now() - startTime) / 1000);
        startTime = performance.now();
      }
      return accumulatedSeconds;
    },
    cleanup() {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility);
      }
    }
  };
}

// Core non-blocking event tracker sending data exclusively to public.visitor_events
export async function trackTrzEvent(eventName, additionalData = {}) {
  try {
    const { sessionId, shortCode } = getSessionData();
    const attr = getAttributionData();

    const payload = {
      session_id: sessionId,
      tracking_code: shortCode,
      visitor_id: getVisitorId(),
      event: eventName,
      page: window.location.pathname || '/',
      page_duration_seconds: additionalData.page_duration_seconds || 0,
      source: attr.source,
      utm_source: attr.utmSource,
      utm_medium: attr.utmMedium,
      utm_campaign: attr.utmCampaign,
      utm_content: attr.utmContent,
      utm_term: null,
      click_id: attr.clickId,
      referrer: attr.referrer,
      device: attr.device,
      popup_type: additionalData.popup_type || null,
      booking_id: additionalData.booking_id || null,
      is_test: attr.isTest
    };

    // Restore required debug log format
    console.log(`[TRZ TRACK]\n${shortCode}\n${eventName}\n${payload.page}\n${payload.source}\n${payload.device}`);

    // Send events through the server endpoint so the server can derive
    // a privacy-preserving IP fingerprint. Never collect/store raw IPs.
    fetch('/api/trz-track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify(payload)
    }).then((response) => {
      if (!response.ok) {
        console.warn('[TRZ TRACK] Server write warning:', response.status);
      }
    }).catch((err) => {
      console.warn('[TRZ TRACK] Network warning:', err);
    });

  } catch (err) {
    // Ensure tracking failures NEVER block execution or UI navigation
    console.warn('[TRZ TRACK] Execution error caught silently:', err);
  }
}
