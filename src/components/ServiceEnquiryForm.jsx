import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const SERVICES = [
  { key: 'bouncy-castle', label: 'Spider-Man Bouncy Castle' },
  { key: 'pressure-washer', label: 'Pressure Washer Rental' },
  { key: 'generator', label: 'Generator Rental' },
  { key: 'catering', label: 'Food Catering' },
  { key: 'dj-sound', label: 'DJ & Sound Services' },
  { key: 'tents-tables-chairs', label: 'Tents, Tables & Chairs' },
  { key: 'event-package', label: 'Event Package / Multiple Services' }
];

const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '12px 13px',
  border: '1px solid #cbd5e1', borderRadius: 10, fontSize: 14,
  color: '#0f172a', background: '#fff'
};
const labelStyle = { display: 'block', marginBottom: 6, fontSize: 12, fontWeight: 800, color: '#334155' };

export default function ServiceEnquiryForm({ initialService = 'catering' }) {
  const [form, setForm] = useState({
    service_key: initialService,
    customer_name: '',
    phone: '',
    email: '',
    event_date: '',
    event_start_time: '',
    event_location: '',
    event_type: '',
    guest_count: '',
    service_details: '',
    catering_style: '',
    dietary_requirements: '',
    budget: '',
    delivery_required: true
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const selected = SERVICES.find((item) => item.key === form.service_key) || SERVICES[0];
  const isCatering = form.service_key === 'catering' || form.service_key === 'event-package';
  const isOwnedRental = ['bouncy-castle', 'pressure-washer'].includes(form.service_key);

  const change = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const params = new URLSearchParams(window.location.search);
      const payload = {
        service_key: form.service_key,
        service_name: selected.label,
        customer_name: form.customer_name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        event_date: form.event_date || null,
        event_start_time: form.event_start_time || null,
        event_location: form.event_location.trim(),
        event_type: form.event_type.trim() || null,
        guest_count: form.guest_count ? Number(form.guest_count) : null,
        service_details: form.service_details.trim() || null,
        catering_style: form.catering_style || null,
        dietary_requirements: form.dietary_requirements.trim() || null,
        budget: form.budget ? Number(form.budget) : null,
        delivery_required: form.delivery_required,
        traffic_source: params.get('utm_source') || params.get('traffic_source') || 'direct',
        utm_medium: params.get('utm_medium') || null,
        utm_campaign: params.get('utm_campaign') || null,
        utm_content: params.get('utm_content') || null,
        click_id: params.get('fbclid') || params.get('gclid') || params.get('click_id') || null,
        referrer: document.referrer || null,
        landing_page: window.location.pathname + window.location.search,
        is_test: params.get('test') === 'true' || params.get('is_test') === '1' || params.get('trz_test') === '1'
      };

      const { error } = await supabase.from('service_enquiries').insert(payload);
      if (error) throw error;

      setMessage('Enquiry received. The Rental Zone will contact you to confirm the details and next steps. No payment has been taken.');
      setForm((current) => ({
        ...current, customer_name: '', phone: '', email: '', event_date: '',
        event_start_time: '', event_location: '', event_type: '', guest_count: '',
        service_details: '', catering_style: '', dietary_requirements: '', budget: ''
      }));
    } catch (error) {
      setMessage('We could not submit your enquiry. Please try again or contact us on WhatsApp. ' + (error.message || ''));
    } finally {
      setSaving(false);
    }
  };

  return (
    <section id="service-enquiry-form" style={{ marginTop: 24, padding: 18, borderRadius: 18, background: '#fff', border: '1px solid #dbe3ee', boxShadow: '0 8px 24px rgba(15,23,42,.06)' }}>
      <div style={{ marginBottom: 16 }}>
        <span style={{ color: '#0369a1', fontSize: 10, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>One enquiry · handled by The Rental Zone</span>
        <h2 style={{ margin: '7px 0 5px', color: '#0f172a', fontSize: 24, fontWeight: 950 }}>Tell us what you need</h2>
        <p style={{ margin: 0, color: '#64748b', fontSize: 13, lineHeight: 1.55 }}>Send your requirements to us first. We will check our rental availability or contact the relevant service provider, then come back to you with the details and a quotation where needed.</p>
      </div>

      <form onSubmit={submit} style={{ display: 'grid', gap: 13 }}>
        <div>
          <label style={labelStyle}>What service do you need? *</label>
          <select value={form.service_key} onChange={(e) => change('service_key', e.target.value)} required style={inputStyle}>
            {SERVICES.map((item) => <option key={item.key} value={item.key}>{item.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 12 }}>
          <div><label style={labelStyle}>Your name *</label><input required value={form.customer_name} onChange={(e) => change('customer_name', e.target.value)} autoComplete="name" style={inputStyle} placeholder="Full name" /></div>
          <div><label style={labelStyle}>WhatsApp / phone *</label><input required value={form.phone} onChange={(e) => change('phone', e.target.value)} autoComplete="tel" style={inputStyle} placeholder="e.g. 868..." /></div>
        </div>
        <div><label style={labelStyle}>Email (optional)</label><input type="email" value={form.email} onChange={(e) => change('email', e.target.value)} autoComplete="email" style={inputStyle} placeholder="you@example.com" /></div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
          <div><label style={labelStyle}>Event / rental date *</label><input required type="date" min={new Date().toISOString().slice(0,10)} value={form.event_date} onChange={(e) => change('event_date', e.target.value)} style={inputStyle} /></div>
          <div><label style={labelStyle}>Start / serving time</label><input type="time" value={form.event_start_time} onChange={(e) => change('event_start_time', e.target.value)} style={inputStyle} /></div>
        </div>
        <div><label style={labelStyle}>Event or delivery location *</label><input required value={form.event_location} onChange={(e) => change('event_location', e.target.value)} style={inputStyle} placeholder="Area, town and any useful directions" /></div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 12 }}>
          <div><label style={labelStyle}>Event type</label><input value={form.event_type} onChange={(e) => change('event_type', e.target.value)} style={inputStyle} placeholder="Birthday, family day..." /></div>
          <div><label style={labelStyle}>Number of guests / people</label><input type="number" min="1" value={form.guest_count} onChange={(e) => change('guest_count', e.target.value)} style={inputStyle} placeholder="e.g. 50" /></div>
        </div>

        {isCatering && <>
          <div><label style={labelStyle}>Catering format</label><select value={form.catering_style} onChange={(e) => change('catering_style', e.target.value)} style={inputStyle}><option value="">Select if known</option><option>Buffet</option><option>Individual meals / boxes</option><option>Snacks and refreshments</option><option>On-site cooking / serving</option><option>Not sure yet</option></select></div>
          <div><label style={labelStyle}>Dietary needs / food preferences</label><input value={form.dietary_requirements} onChange={(e) => change('dietary_requirements', e.target.value)} style={inputStyle} placeholder="Vegetarian, allergies, halal, menu preferences..." /></div>
        </>}

        <div><label style={labelStyle}>{isCatering ? 'Menu, package or food requirements' : 'What exactly do you need?'}</label><textarea rows="4" value={form.service_details} onChange={(e) => change('service_details', e.target.value)} style={{ ...inputStyle, resize: 'vertical' }} placeholder={isCatering ? 'Tell us the food you have in mind, number of meals, serving arrangements and anything else...' : 'Quantity, rental duration, equipment, package or other details...'} /></div>
        <div><label style={labelStyle}>Your budget (optional, TT$)</label><input type="number" min="0" step="0.01" value={form.budget} onChange={(e) => change('budget', e.target.value)} style={inputStyle} placeholder="Optional" /></div>

        {!isOwnedRental && <label style={{ display: 'flex', alignItems: 'flex-start', gap: 9, color: '#334155', fontSize: 12, lineHeight: 1.45 }}>
          <input type="checkbox" checked={form.delivery_required} onChange={(e) => change('delivery_required', e.target.checked)} style={{ marginTop: 2 }} />
          Delivery / setup is required (we will confirm availability and any cost)
        </label>}

        <div style={{ padding: 12, borderRadius: 10, background: '#f1f5f9', color: '#475569', fontSize: 11, lineHeight: 1.5 }}>
          {isOwnedRental
            ? 'This form sends an enquiry only. We will confirm availability and the rental details. Payment is handled separately under the agreed rental terms.'
            : 'This is a quotation request, not a confirmed booking. We will contact the supplier, confirm availability and pricing, then send you the quotation. No payment is collected here.'}
        </div>

        <button type="submit" disabled={saving} style={{ width: '100%', border: 0, borderRadius: 11, padding: '14px 16px', background: saving ? '#64748b' : '#0f172a', color: '#fff', fontWeight: 900, fontSize: 14, cursor: saving ? 'wait' : 'pointer' }}>
          {saving ? 'Sending enquiry...' : 'Send enquiry to The Rental Zone'}
        </button>
        {message && <p role="status" style={{ margin: 0, padding: 12, borderRadius: 10, background: message.startsWith('Enquiry received') ? '#ecfdf5' : '#fff7ed', color: message.startsWith('Enquiry received') ? '#166534' : '#9a3412', fontSize: 12, lineHeight: 1.5 }}>{message}</p>}
      </form>
    </section>
  );
}
