import { supabase } from '../supabaseClient';

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

// Parse and cache attribution parameters once per session in sessionStorage
export function getAttributionData() {
  if (typeof window === 'undefined') {
    return { source: 'direct', utmSource: null, utmMedium: null, utmCampaign: null, utmContent: null, utmTerm: null, referrer: null, device: 'desktop', isTest: false };
  }

  const cached = sessionStorage.getItem('trz_attribution');
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch {
      // fall through to recalculate if cache is invalid
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  
  // Check existing test/admin mechanisms
  const isTest = 
    urlParams.get('test') === 'true' || 
    urlParams.get('is_test') === '1' || 
    localStorage.getItem('dev_mode') === 'true' || 
    localStorage.getItem('is_admin') === 'true' || 
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1';

  const utmSource = urlParams.get('utm_source');
  const utmMedium = urlParams.get('utm_medium');
  const utmCampaign = urlParams.get('utm_campaign');
  const utmContent = urlParams.get('utm_content');
  const utmTerm = urlParams.get('utm_term');
  const referrer = document.referrer || null;

  // Determine source priority: utm_source -> referrer domain -> 'direct'
  let source = 'direct';
  if (utmSource) {
    source = utmSource.toLowerCase();
  } else if (referrer) {
    try {
      const refUrl = new URL(referrer);
      if (!refUrl.hostname.includes(window.location.hostname)) {
        source = refUrl.hostname;
      }
    } catch {
      // invalid URL format in referrer, keep default
    }
  }

  // Correct device detection ordering: tablets (iPad/tablet) checked before mobile
  const ua = navigator.userAgent || '';
  let device = 'desktop';
  if (/tablet|ipad/i.test(ua)) {
    device = 'tablet';
  } else if (/android|iphone|ipod|mobile/i.test(ua)) {
    device = 'mobile';
  }

  const attr = {
    source,
    utmSource,
    utmMedium,
    utmCampaign,
    utmContent,
    utmTerm,
    referrer,
    device,
    isTest
  };

  sessionStorage.setItem('trz_attribution', JSON.stringify(attr));
  return attr;
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
      event: eventName,
      page: window.location.pathname || '/',
      page_duration_seconds: additionalData.page_duration_seconds || 0,
      source: attr.source,
      utm_source: attr.utmSource,
      utm_medium: attr.utmMedium,
      utm_campaign: attr.utmCampaign,
      utm_content: attr.utmContent,
      utm_term: attr.utmTerm,
      referrer: attr.referrer,
      device: attr.device,
      popup_type: additionalData.popup_type || null,
      booking_id: additionalData.booking_id || null,
      is_test: attr.isTest
    };

    // Restore required debug log format
    console.log(`[TRZ TRACK]\n${shortCode}\n${eventName}\n${payload.page}\n${payload.source}\n${payload.device}`);

    // Non-blocking database insertion into visitor_events
    supabase
      .from('visitor_events')
      .insert([payload])
      .then(({ error }) => {
        if (error) {
          console.warn('[TRZ TRACK] Supabase write warning:', error.message);
        }
      })
      .catch((err) => {
        console.warn('[TRZ TRACK] Network warning:', err);
      });

  } catch (err) {
    // Ensure tracking failures NEVER block execution or UI navigation
    console.warn('[TRZ TRACK] Execution error caught silently:', err);
  }
}
