import { createHmac } from 'node:crypto';
import { supabase } from '../src/supabaseClient.js';

const ALLOWED_EVENTS = new Set([
  'session_started', 'viewed_landing_page', 'viewed_booking_page',
  'booking_form_viewed', 'booking_started', 'booking_submit_attempted',
  'booking_submitted', 'promo_booking_submitted', 'promo_booking_selected',
  'promo_booking_expired', 'package_selected', 'date_selected',
  'availability_check_started', 'availability_check_completed_open',
  'availability_check_completed_busy', 'availability_check_failed',
  'page_exit', 'clicked_view_price', 'clicked_view_size', 'whatsapp_clicked',
  'clicked_promotional_offer', 'clicked_check_availability', 'clicked_book_now',
  'popup_opened', 'popup_closed', 'promotional_popup_opened',
  'promotional_popup_closed', 'promotional_popup_cta_clicked',
  'promotional_popup_expired', 'promotional_offer_viewed',
  'promotional_offer_expired', 'dismiss_intent_popup_close_btn',
  'dismiss_intent_popup_backdrop', 'click_featured_image_zoom',
  'click_price_modal_switch_to_space', 'click_space_modal_switch_to_price',
  'share_whatsapp_clicked', 'share_facebook_clicked', 'share_x_clicked',
  'share_copy_link_clicked', 'share_copy_link_completed',
  'share_native_clicked', 'share_native_completed', 'share_native_failed',
  'whatsapp_channel_clicked', 'contact_view', 'contact_book_click',
  'contact_special_click', 'our_bouncer_view', 'our_bouncer_book_click',
  'our_bouncer_2h_click', 'our_bouncer_3h_click',
  'our_bouncer_full_day_click', 'our_bouncer_special_click',
  'our_bouncer_bottom_book_click', 'how_it_works_view',
  'how_it_works_book_click', 'how_it_works_special_click', 'faq_view',
  'faq_book_click', 'faq_special_click',
  'bubble_machine_addon_selected', 'booking_submit_blocked_invalid_package',
  'booking_submit_blocked_invalid_time', 'booking_submit_blocked_time_conflict',
  'booking_submit_blocked_delivery_details', 'booking_submit_blocked_delivery_area',
  'booking_submit_failed_database', 'booking_form_abandoned_no_interaction',
  'contact_link_clicked_phone', 'contact_link_clicked_whatsapp',
  'contact_link_clicked_email', 'contact_link_clicked_facebook',
  'contact_link_clicked_instagram', 'contact_link_clicked_tiktok'
]);

function isAllowedEvent(eventName) {
  if (typeof eventName !== 'string') return false;
  return ALLOWED_EVENTS.has(eventName) ||
    /^click_gallery_image_\d+$/.test(eventName) ||
    /^navigation_clicked_(home|booking|our_bouncer|how_it_works|faq|contact)$/.test(eventName) ||
    /^booking_package_selected_(2_hours|3_hours|full_day|promotion)$/.test(eventName) ||
    /^booking_delivery_zone_selected_(free_delivery|zone_1|zone_2|zone_3|custom_quote)$/.test(eventName) ||
    /^booking_field_(focused|started|completed|left_empty|invalid|skipped)_(customer_name|phone|package_type|event_date|start_time|delivery_area|address|notes)$/.test(eventName) ||
    /^booking_form_abandoned_after_(customer_name|phone|package_type|event_date|start_time|delivery_area|address|notes|unknown)$/.test(eventName);
}

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

  const host = String(req.headers.host || '').toLowerCase();
  const origin = req.headers.origin;
  const allowedHost =
    host === 'rental-zone-taupe.vercel.app' ||
    (host.startsWith('rental-zone-') && host.endsWith('.vercel.app'));

  if (!allowedHost) return res.status(403).json({ error: 'Host not allowed' });

  if (origin) {
    try {
      const originHost = new URL(origin).hostname.toLowerCase();
      const allowedOrigin =
        originHost === 'rental-zone-taupe.vercel.app' ||
        (originHost.startsWith('rental-zone-') && originHost.endsWith('.vercel.app'));
      if (!allowedOrigin) return res.status(403).json({ error: 'Origin not allowed' });
    } catch {
      return res.status(400).json({ error: 'Invalid origin' });
    }
  }

  const secret = process.env.TRZ_IP_HASH_SECRET;
  if (!secret) return res.status(503).json({ error: 'Tracking is not configured' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  if (!isAllowedEvent(body.event)) {
    return res.status(400).json({ error: 'Invalid event' });
  }

  const ip = getClientIp(req);
  const ipHash = ip
    ? createHmac('sha256', secret).update(ip).digest('hex')
    : null;

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
