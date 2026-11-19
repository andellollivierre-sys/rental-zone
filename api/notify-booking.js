import { isAllowedRequestHost } from '../server/hostSecurity.js';

const MAX_LENGTHS = {
  customer_name: 120,
  phone: 40,
  address: 300,
  delivery_area: 100,
  delivery_zone: 80,
  event_date: 20,
  start_time: 10,
  end_time: 10,
  package_name: 100,
  traffic_source: 100,
  booking_id: 100
};

function readText(body, key, required = false) {
  const value = body[key];
  if (value == null && !required) return '';
  if (typeof value !== 'string') throw new Error(`Invalid ${key}`);
  const cleaned = value.trim();
  if (required && !cleaned) throw new Error(`Missing ${key}`);
  return cleaned.slice(0, MAX_LENGTHS[key] || 100);
}

function readNumber(body, key, fallback = 0) {
  const value = body[key];
  if (value == null && fallback !== null) return fallback;
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0 || number > 1000000) {
    throw new Error(`Invalid ${key}`);
  }
  return number;
}

function bookingMessage(body) {
  const isTest = body.isTest === true;
  const customerName = readText(body, 'customer_name', true);
  const phone = readText(body, 'phone', true);
  const address = readText(body, 'address', true);
  const deliveryArea = readText(body, 'delivery_area', true);
  const deliveryZone = readText(body, 'delivery_zone', true);
  const eventDate = readText(body, 'event_date', true);
  const startTime = readText(body, 'start_time', true);
  const endTime = readText(body, 'end_time', true);
  const packageName = readText(body, 'package_name', true);
  const trafficSource = readText(body, 'traffic_source') || 'direct';
  const bookingId = readText(body, 'booking_id', true);
  const deliveryFee = body.delivery_fee == null
    ? null
    : readNumber(body, 'delivery_fee', null);
  const packagePrice = readNumber(body, 'package_price');
  const total = readNumber(body, 'total');
  const isPromotional = body.is_promotional === true;
  const quotePending = body.transport_quote_pending === true;
  const regularValue = readNumber(body, 'promotion_regular_value');
  const savings = readNumber(body, 'promotion_savings');

  return (
    `${isTest ? '🧪 **[TEST — DO NOT PROCESS] TEST BOOKING SUBMITTED**' : '🚨 **NEW BOOKING SUBMITTED!**'}\n` +
    `👤 **Client:** ${customerName}\n` +
    `📞 **Phone:** ${phone}\n` +
    `📍 **Address:** ${address}, ${deliveryArea}\n` +
    `🚚 **Delivery, Setup & Collection:** ${deliveryZone} - ${deliveryFee === null ? 'QUOTE REQUIRED' : `TT${deliveryFee}`}\n` +
    `📅 **Date:** ${eventDate} (${startTime} - ${endTime})\n` +
    `📦 **Package:** ${packageName} (TT${packagePrice})\n` +
    `💰 **Total:** TT${total}${quotePending ? ' (transport quote pending)' : ''}\n` +
    `${isPromotional ? `🔥 **PROMOTION:** Normal value TT$${regularValue} | Savings TT$${savings}\n` : ''}` +
    `💵 **Payment:** Due on Delivery\n` +
    `🌐 **Source:** ${trafficSource}\n` +
    (isTest ? `🧪 **TEST RECORD ONLY — Booking ID: ${bookingId} — Not a customer order.**` : '')
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!isAllowedRequestHost(req)) {
    return res.status(403).json({ error: 'Host or origin not allowed' });
  }

  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return res.status(503).json({ error: 'Notifications are not configured' });

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  let content;

  try {
    if (body.type === 'booking_page_view') {
      content = body.isTest === true
        ? '🧪 **[TEST] Booking page opened in the live website test session. No real customer booking.**'
        : '👀 **A prospect just opened the Booking Form page!**';
    } else if (body.type === 'booking_submitted') {
      content = bookingMessage(body);
    } else {
      return res.status(400).json({ error: 'Invalid notification type' });
    }
  } catch (error) {
    return res.status(400).json({ error: error.message || 'Invalid notification data' });
  }

  try {
    const discordResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });

    if (!discordResponse.ok) {
      console.error('[TRZ NOTIFY] Discord returned status:', discordResponse.status);
      return res.status(502).json({ error: 'Notification delivery failed' });
    }

    return res.status(204).end();
  } catch (error) {
    console.error('[TRZ NOTIFY] Discord request failed:', error.message);
    return res.status(502).json({ error: 'Notification delivery failed' });
  }
}
