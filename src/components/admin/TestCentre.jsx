import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const TEST_SITE = 'https://rental-zone-3x6mluei4-anoli.vercel.app';

export default function TestCentre({ session }) {
  const [tests, setTests] = useState([]);
  const [testEvents, setTestEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [eventMessage, setEventMessage] = useState('');

  const loadTests = useCallback(async () => {
    if (!session?.user) return;
    setLoading(true);
    const [bookingResult, eventResult] = await Promise.all([
      supabase.from('test_bookings').select('*')
        .eq('is_test', true).order('created_at', { ascending: false }).limit(50),
      supabase.from('visitor_events')
        .select('id,event,page,session_id,tracking_code,source,device,created_at,is_test')
        .eq('is_test', true).order('created_at', { ascending: false }).limit(100)
    ]);
    if (bookingResult.error) setMessage('Could not load test bookings: ' + bookingResult.error.message);
    else { setTests(bookingResult.data || []); setMessage(''); }
    if (eventResult.error) {
      setEventMessage('Could not load test tracking events: ' + eventResult.error.message);
      setTestEvents([]);
    } else {
      setTestEvents(eventResult.data || []);
      setEventMessage('');
    }
    setLoading(false);
  }, [session]);

  useEffect(() => { loadTests(); }, [loadTests]);

  const openTest = (hash = '#home') => {
    const url = new URL(TEST_SITE);
    url.searchParams.set('test', 'true');
    url.hash = hash;
    window.open(url.toString(), '_blank', 'noopener,noreferrer');
  };

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 18, fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ background: '#0f172a', color: 'white', borderRadius: 14, padding: 20 }}>
        <div style={{ color: '#a5b4fc', fontSize: 12, fontWeight: 800, letterSpacing: 1 }}>OWNER QA WORKSPACE</div>
        <h2 style={{ margin: '8px 0', fontSize: 22 }}>🧪 Live Website Test Centre</h2>
        <p style={{ color: '#cbd5e1', fontSize: 13, lineHeight: 1.6, margin: '0 0 16px' }}>Test the preview build as a customer while remaining signed in as admin. Test bookings, notifications and tracking are visibly labelled and reported separately. Production is not changed.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <button onClick={() => openTest('#home')} style={{ background: '#4f46e5', color: 'white', border: 0, borderRadius: 8, padding: '11px 14px', fontWeight: 800, cursor: 'pointer' }}>Open Website Preview ↗</button>
          <button onClick={() => openTest('#booking')} style={{ background: '#059669', color: 'white', border: 0, borderRadius: 8, padding: '11px 14px', fontWeight: 800, cursor: 'pointer' }}>Test Checkout + Add-ons ↗</button>
        </div>
      </div>
      <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: 14, color: '#9a3412', fontSize: 13, lineHeight: 1.6 }}>
        <strong>Safety rules</strong>
        <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
          <li>Test booking writes only to <code>test_bookings</code>.</li>
          <li>Discord booking alerts are delivered with a clear <strong>[TEST — DO NOT PROCESS]</strong> label.</li>
          <li>WhatsApp opens a prefilled message labelled <strong>[TEST — DO NOT PROCESS]</strong>; it is not sent automatically.</li>
          <li>Real booking, availability and finance records are not changed by test submissions.</li>
          <li>Test visits and actions carry <code>is_test=true</code> and are excluded from live analytics.</li>
        </ul>
      </div>
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>Test Tracking & Page Activity</h3>
          <span style={{ background: '#ffedd5', color: '#9a3412', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 800 }}>TEST EVENTS ONLY</span>
        </div>
        {eventMessage && <p style={{ color: '#b91c1c', fontSize: 13 }}>{eventMessage}</p>}
        {!loading && testEvents.length === 0 && <p style={{ color: '#64748b', fontSize: 13 }}>No test tracking events recorded yet.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
          {testEvents.map((item) => (
            <article key={item.id} style={{ border: '1px solid #fed7aa', background: '#fff7ed', borderRadius: 9, padding: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ color: '#9a3412', fontSize: 13 }}>{String(item.event || 'event').replaceAll('_', ' ')}</strong>
                <span style={{ color: '#9a3412', fontSize: 11, fontWeight: 800 }}>TEST</span>
              </div>
              <div style={{ color: '#475569', fontSize: 12, marginTop: 4 }}>Page: {item.page || 'Not recorded'} · {item.source || 'direct'} · {item.device || 'unknown'}</div>
              <div style={{ color: '#64748b', fontSize: 11, marginTop: 3 }}>{item.tracking_code || 'No tracking code'} · {new Date(item.created_at).toLocaleString()}</div>
            </article>
          ))}
        </div>
      </div>
      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 12, padding: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
          <h3 style={{ margin: 0, color: '#0f172a' }}>Test Booking History</h3>
          <button onClick={loadTests} disabled={loading} style={{ background: '#e2e8f0', border: 0, borderRadius: 7, padding: '8px 11px', cursor: 'pointer' }}>{loading ? 'Refreshing…' : '↻ Refresh'}</button>
        </div>
        {message && <p style={{ color: '#b91c1c', fontSize: 13 }}>{message}</p>}
        {!loading && tests.length === 0 && <p style={{ color: '#64748b', fontSize: 13 }}>No test bookings yet. Run a booking test to create the first record.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
          {tests.map((item) => (
            <article key={item.id} style={{ border: '1px solid #e2e8f0', borderRadius: 9, padding: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ color: '#0f172a' }}>{item.customer_name || 'Unnamed test'} · {item.package_type || 'Package not set'}</strong>
                <span style={{ background: '#ffedd5', color: '#9a3412', borderRadius: 20, padding: '3px 8px', fontSize: 11, fontWeight: 800 }}>TEST ONLY</span>
              </div>
              <div style={{ color: '#475569', fontSize: 12, marginTop: 6 }}>{item.event_date || 'No date'} · {item.start_time || '--'}–{item.end_time || '--'} · TT${Number(item.total_price || 0).toLocaleString('en-TT')}</div>
              <div style={{ color: '#64748b', fontSize: 11, marginTop: 4 }}>{new Date(item.created_at).toLocaleString()} · {item.address || 'No address'}</div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
