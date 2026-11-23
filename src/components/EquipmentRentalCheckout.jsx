import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const WHATSAPP = 'https://wa.me/18682810670';

const PRODUCTS = {
  'pressure-washer': {
    key: 'pressure-washer',
    name: 'Pressure Washer Rental',
    rate: 'TT$300 per day',
    intro: 'Send your rental details. We will confirm availability and the collection or delivery arrangement before accepting the booking.',
    defaultDelivery: false,
    deliveryLabel: 'Collection / return',
    taskLabel: 'What do you plan to clean?',
    taskPlaceholder: 'e.g. driveway, walls, vehicle, patio',
    extraLabel: 'Cleaning requirements or other notes'
  },
  generator: {
    key: 'generator',
    name: 'Generator Rental',
    rate: 'TT$400 per day',
    intro: 'Tell us when and where you need the generator. We will check supplier availability and confirm the delivery and rental details with you.',
    defaultDelivery: true,
    deliveryLabel: 'Supplier delivery',
    taskLabel: 'What will the generator power?',
    taskPlaceholder: 'e.g. lights, sound system, appliances, equipment',
    extraLabel: 'Power requirements, access details or other notes'
  }
};

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '12px 13px',
  border: '1px solid #cbd5e1', borderRadius: 10, background: '#fff',
  color: '#0f172a', fontSize: 14
};
const labelStyle = {
  display: 'block', marginBottom: 6, color: '#334155',
  fontSize: 12, fontWeight: 800
};

export default function EquipmentRentalCheckout({ product }) {
  const config = PRODUCTS[product];
  const [form, setForm] = useState({
    customer_name: '', phone: '', email: '', event_date: '',
    duration_days: '1', event_start_time: '', event_location: '',
    delivery: config?.defaultDelivery ? 'delivery' : 'collection',
    purpose: '', notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!config) return <div style={{ padding: 24 }}>Equipment rental not found.</div>;

  const update = (key, value) => setForm(current => ({ ...current, [key]: value }));
  const testMode = new URLSearchParams(window.location.search).get('test') === 'true' ||
    new URLSearchParams(window.location.search).get('is_test') === '1' ||
    new URLSearchParams(window.location.search).get('trz_test') === '1' ||
    sessionStorage.getItem('trz_test_mode') === 'true';

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.customer_name.trim() || !form.phone.trim() || !form.event_date || !form.event_location.trim()) {
      setError('Complete your name, phone number, rental date and location.');
      return;
    }
    const days = Number(form.duration_days);
    if (!Number.isInteger(days) || days < 1 || days > 30) {
      setError('Choose a rental duration from 1 to 30 days.');
      return;
    }

    setSubmitting(true);
    const params = new URLSearchParams(window.location.search);
    const deliveryRequired = config.key === 'generator' || form.delivery === 'delivery';
    const details = [
      'Rental duration: ' + days + (days === 1 ? ' day' : ' days'),
      'Arrangement: ' + (deliveryRequired ? (config.key === 'generator' ? 'Supplier delivery requested' : 'Delivery requested; confirm availability') : 'Customer collection and return'),
      'Purpose: ' + (form.purpose.trim() || 'Not provided'),
      'Additional notes: ' + (form.notes.trim() || 'None')
    ].join('\n');

    const payload = {
      service_key: config.key,
      service_name: config.name,
      customer_name: form.customer_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
      event_date: form.event_date,
      event_start_time: form.event_start_time || null,
      event_location: form.event_location.trim(),
      event_type: 'Equipment rental',
      service_details: details,
      delivery_required: deliveryRequired,
      status: 'New',
      is_test: testMode,
      traffic_source: params.get('utm_source') || 'direct',
      utm_medium: params.get('utm_medium') || null,
      utm_campaign: params.get('utm_campaign') || null,
      utm_content: params.get('utm_content') || null,
      click_id: params.get('gclid') || params.get('fbclid') || null,
      referrer: document.referrer || null,
      landing_page: window.location.href
    };

    const { error: insertError } = await supabase.from('service_enquiries').insert(payload);
    setSubmitting(false);
    if (insertError) {
      setError('We could not submit the request. Please try again or contact us on WhatsApp. (' + insertError.message + ')');
      return;
    }
    setSubmitted(true);
  };

  if (submitted) {
    const message = 'Hi, I just submitted a ' + config.name + ' request on The Rental Zone website. Please follow up with me to confirm availability and the rental details.';
    return (
      <section style={{ padding: '28px 18px', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
        <div style={{ maxWidth: 560, margin: '24px auto', padding: 24, borderRadius: 18, border: '1px solid #bbf7d0', background: '#f0fdf4', textAlign: 'center' }}>
          <div style={{ fontSize: 34 }}>✓</div>
          <h1 style={{ margin: '10px 0', fontSize: 25, fontWeight: 950 }}>Request received</h1>
          <p style={{ color: '#475569', fontSize: 14, lineHeight: 1.6 }}>Your {config.name.toLowerCase()} request has been sent to The Rental Zone. This is not a confirmed booking. We will contact you to confirm availability, delivery or collection, and the final details.</p>
          <a href={WHATSAPP + '?text=' + encodeURIComponent(message)} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 12, padding: '12px 17px', borderRadius: 10, background: '#0f172a', color: '#fff', textDecoration: 'none', fontWeight: 850 }}>Continue on WhatsApp</a>
          <p style={{ marginTop: 18, fontSize: 12 }}><a href="#event-services" style={{ color: '#2563eb' }}>Back to rentals & services</a></p>
        </div>
      </section>
    );
  }

  return (
    <section style={{ padding: '22px 16px 34px', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <a href="#event-services" style={{ color: '#2563eb', fontSize: 12, fontWeight: 800, textDecoration: 'none' }}>← Back to rentals & services</a>
        <div style={{ marginTop: 14, padding: '23px 20px', borderRadius: 18, color: '#fff', background: 'linear-gradient(135deg,#0f172a,#172554 65%,#075985)' }}>
          <span style={{ color: '#bae6fd', fontSize: 10, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>The Rental Zone · Rental request</span>
          <h1 style={{ margin: '10px 0 7px', fontSize: 29, lineHeight: 1.1, fontWeight: 950 }}>{config.name}</h1>
          <p style={{ margin: 0, color: '#dbeafe', fontSize: 13, lineHeight: 1.6 }}>{config.intro}</p>
          <div style={{ marginTop: 12, fontSize: 14, fontWeight: 900 }}>{config.rate}</div>
        </div>

        <form onSubmit={submit} style={{ marginTop: 16, padding: 18, border: '1px solid #e2e8f0', borderRadius: 16, background: '#fff', boxShadow: '0 5px 18px rgba(15,23,42,.05)' }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 18, fontWeight: 900 }}>Your contact details</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            <div><label style={labelStyle}>Full name *</label><input required autoComplete="name" value={form.customer_name} onChange={e => update('customer_name', e.target.value)} style={inputStyle} placeholder="Your name" /></div>
            <div><label style={labelStyle}>Phone / WhatsApp number *</label><input required type="tel" autoComplete="tel" value={form.phone} onChange={e => update('phone', e.target.value)} style={inputStyle} placeholder="Your contact number" /></div>
            <div><label style={labelStyle}>Email (optional)</label><input type="email" autoComplete="email" value={form.email} onChange={e => update('email', e.target.value)} style={inputStyle} placeholder="you@example.com" /></div>
          </div>

          <h2 style={{ margin: '23px 0 14px', fontSize: 18, fontWeight: 900 }}>Rental details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 12 }}>
            <div><label style={labelStyle}>Rental start date *</label><input required type="date" min={new Date().toISOString().slice(0,10)} value={form.event_date} onChange={e => update('event_date', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Duration (days) *</label><input required type="number" min="1" max="30" step="1" value={form.duration_days} onChange={e => update('duration_days', e.target.value)} style={inputStyle} /></div>
            <div><label style={labelStyle}>Preferred start time (optional)</label><input type="time" value={form.event_start_time} onChange={e => update('event_start_time', e.target.value)} style={inputStyle} /></div>
          </div>

          {config.key === 'pressure-washer' && (
            <div style={{ marginTop: 13 }}>
              <label style={labelStyle}>Collection / delivery arrangement</label>
              <select value={form.delivery} onChange={e => update('delivery', e.target.value)} style={inputStyle}>
                <option value="collection">I will collect and return it</option>
                <option value="delivery">I would like to request delivery (to be confirmed)</option>
              </select>
            </div>
          )}
          {config.key === 'generator' && (
            <div style={{ marginTop: 13, padding: 12, borderRadius: 10, background: '#eff6ff', color: '#1e3a8a', fontSize: 12, lineHeight: 1.5 }}>
              Supplier delivery is arranged after availability and location are checked.
            </div>
          )}

          <div style={{ marginTop: 13 }}><label style={labelStyle}>Location / delivery address *</label><input required value={form.event_location} onChange={e => update('event_location', e.target.value)} style={inputStyle} placeholder="Community, town and address" /></div>
          <div style={{ marginTop: 13 }}><label style={labelStyle}>{config.taskLabel}</label><input value={form.purpose} onChange={e => update('purpose', e.target.value)} style={inputStyle} placeholder={config.taskPlaceholder} /></div>
          <div style={{ marginTop: 13 }}><label style={labelStyle}>{config.extraLabel}</label><textarea rows="3" value={form.notes} onChange={e => update('notes', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Add any details that will help us arrange the rental." /></div>

          {error && <p role="alert" style={{ margin: '13px 0 0', padding: 10, borderRadius: 8, background: '#fef2f2', color: '#b91c1c', fontSize: 12 }}>{error}</p>}
          <button type="submit" disabled={submitting} style={{ width: '100%', marginTop: 17, padding: 14, border: 0, borderRadius: 10, background: submitting ? '#64748b' : '#0f172a', color: '#fff', fontSize: 14, fontWeight: 900, cursor: submitting ? 'wait' : 'pointer' }}>{submitting ? 'Sending request…' : 'Submit rental request'}</button>
          <p style={{ margin: '11px 0 0', color: '#64748b', fontSize: 11, lineHeight: 1.5, textAlign: 'center' }}>No payment is taken here. Your request is not a confirmed booking until The Rental Zone contacts you and confirms the arrangements.</p>
        </form>
      </div>
    </section>
  );
}
