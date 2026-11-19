import { createHmac } from 'node:crypto';
import { supabase } from '../src/supabaseClient.js';
import { isAllowedRequestHost } from '../server/hostSecurity.js';

const RATE_WINDOW_MS = 60 * 1000;
const RATE_LIMIT = 60;
const rateBuckets = new Map();

function isRateLimited(ipHash) {
  const now = Date.now();
  const key = ipHash || 'unknown';
  let bucket = rateBuckets.get(key);

  if (!bucket || now - bucket.startedAt >= RATE_WINDOW_MS) {
    bucket = { startedAt: now, count: 0 };
    rateBuckets.set(key, bucket);
  }

  bucket.count += 1;

  // Keep this in-memory guard bounded on warm serverless instances.
  if (rateBuckets.size > 5000) {
    for (const [bucketKey, value] of rateBuckets) {
      if (now - value.startedAt >= RATE_WINDOW_MS) rateBuckets.delete(bucketKey);
    }
  }

  return bucket.count > RATE_LIMIT;
}

const ALLOWED_EVENTS = new Set([
  'session_started', 'viewed_landing_page', 'promotional_popup_opened',
  'promotional_offer_viewed', 'popup_opened', 'dismiss_intent_popup_close_btn',
  'page_exit', 'clicked_view_price', 'clicked_view_size', 'whatsapp_clicked',
  'clicked_promotional_offer', 'clicked_check_availability',
  'viewed_booking_page', 'promo_booking_selected', 'booking_started',
  'package_selected', 'date_selected', 'booking_submitted',
  'contact_view', 'contact_book_click', 'contact_special_click',
  'dismiss_intent_popup_backdrop', 'faq_view', 'how_it_works_view',
  'our_bouncer_view', 'our_bouncer_2h_click', 'our_bouncer_3h_click',
  'our_bouncer_book_click', 'our_bouncer_bottom_book_click',
  'our_bouncer_full_day_click', 'our_bouncer_special_click',
  'promo_booking_expired', 'promo_booking_submitted', 'promotional_offer_expired',
  'click_featured_image_zoom', 'clicked_book_now',
  'share_copy_link_clicked', 'share_copy_link_completed',
  'share_facebook_clicked', 'share_native_clicked',
  'share_native_completed', 'share_native_failed',
  'share_whatsapp_clicked', 'share_x_clicked',
  'whatsapp_channel_clicked'
]);

function getClientIp(req) {
  // Vercel supplies x-real-ip from the connection; do not trust a browser body value.
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) return realIp.trim();

  // Fallback for supported proxy paths. Only the first address is used.
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  return null;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAllowedRequestHost(req)) {
    return res.status(403).json({ error: 'Host or origin not allowed' });
  }

  const secret = process.env.TRZ_IP_HASH_SECRET;
  if (!secret) return res.status(503).json({ error: 'Tracking is not configured' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (!ALLOWED_EVENTS.has(body.event)) {
    return res.status(400).json({ error: 'Invalid event' });
  }

  const ip = getClientIp(req);
  const ipHash = ip
    ? createHmac('sha256', secret).update(ip).digest('hex')
    : null;

  if (isRateLimited(ipHash)) {
    res.setHeader('Retry-After', '60');
    return res.status(429).json({ error: 'Too many tracking events' });
  }

  const payload = {
    session_id: typeof body.session_id === 'string' ? body.session_id.slice(0, 100) : null,
    tracking_code: typeof body.tracking_code === 'string' ? body.tracking_code.slice(0, 30) : null,
    visitor_id: typeof body.visitor_id === 'string' ? body.visitor_id.slice(0, 80) : null,
    event: body.event,
    page: typeof body.page === 'string' ? body.page.slice(0, 500) : '/',
    page_duration_seconds: Number.isFinite(Number(body.page_duration_seconds))
      ? Math.max(0, Math.min(86400, Math.floor(Number(body.page_duration_seconds))))
      : 0,
    source: typeof body.source === 'string' ? body.source.slice(0, 100) : 'direct',
    utm_source: typeof body.utm_source === 'string' ? body.utm_source.slice(0, 200) : null,
    utm_medium: typeof body.utm_medium === 'string' ? body.utm_medium.slice(0, 200) : null,
    utm_campaign: typeof body.utm_campaign === 'string' ? body.utm_campaign.slice(0, 300) : null,
    utm_content: typeof body.utm_content === 'string' ? body.utm_content.slice(0, 300) : null,
    utm_term: typeof body.utm_term === 'string' ? body.utm_term.slice(0, 300) : null,
    click_id: typeof body.click_id === 'string' ? body.click_id.slice(0, 500) : null,
    referrer: typeof body.referrer === 'string' ? body.referrer.slice(0, 1000) : null,
    device: typeof body.device === 'string' ? body.device.slice(0, 30) : null,
    popup_type: typeof body.popup_type === 'string' ? body.popup_type.slice(0, 100) : null,
    booking_id: typeof body.booking_id === 'string' ? body.booking_id : null,
    is_test: body.is_test === true,
    ip_hash: ipHash
  };

  const { error } = await supabase.from('visitor_events').insert([payload]);
  if (error) {
    console.error('[TRZ TRACK] Insert failed:', error.message);
    return res.status(500).json({ error: 'Could not save visitor event' });
  }

  return res.status(204).end();
}
