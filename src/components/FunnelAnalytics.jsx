import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function FunnelAnalytics() {
  const [loading, setLoading] = useState(true);
  const [funnelData, setFunnelData] = useState({
    viewedForm: 0,
    selectedPackage: 0,
    submittedBooking: 0,
    totalRevenue: 0
  });
  const [sourceBreakdown, setSourceBreakdown] = useState([]);

  useEffect(() => {
    fetchFunnelAnalytics();
  }, []);

  const fetchFunnelAnalytics = async () => {
    setLoading(true);
    try {
      // 1. Fetch current production funnel tracking events
      const { data: events, error: eventsError } = await supabase
        .from('visitor_events')
        .select('session_id, event, source, is_test, created_at')
        .eq('is_test', false)
        .in('event', [
          'viewed_booking_page',
          'package_selected',
          'booking_submitted'
        ]);

      if (eventsError) throw eventsError;

      const safeEvents = events || [];

      // Track unique production sessions per funnel step
      const viewedSessions = new Set();
      const selectedSessions = new Set();
      const submittedSessions = new Set();

      safeEvents.forEach((ev) => {
        if (!ev.session_id) return;

        if (ev.event === 'viewed_booking_page') {
          viewedSessions.add(ev.session_id);
        }

        if (ev.event === 'package_selected') {
          selectedSessions.add(ev.session_id);
        }

        if (ev.event === 'booking_submitted') {
          submittedSessions.add(ev.session_id);
        }
      });

      const viewedCount = viewedSessions.size;
      const selectedPkgCount = selectedSessions.size;
      const submittedCount = submittedSessions.size;

      // 2. Fetch bookings safely
      const { data: bookings, error: bookingsError } = await supabase
        .from('bookings')
        .select('*');

      const safeBookings = bookingsError ? [] : (bookings || []);

      // Keep production revenue separate from test bookings
      const liveBookings = safeBookings.filter((booking) => !booking.is_test);

      const totalRev = liveBookings.reduce(
        (sum, b) => sum + (b.total_price || 0),
        0
      );

      // Group production bookings by traffic source
      const sources = {};

      liveBookings.forEach((b) => {
        const src = b.traffic_source || 'direct';

        if (!sources[src]) {
          sources[src] = {
            count: 0,
            revenue: 0
          };
        }

        sources[src].count += 1;
        sources[src].revenue += b.total_price || 0;
      });

      const sourceArray = Object.keys(sources).map((key) => ({
        source: key,
        count: sources[key].count,
        revenue: sources[key].revenue
      }));

      setFunnelData({
        viewedForm: viewedCount,
        selectedPackage: selectedPkgCount,
        submittedBooking: submittedCount,
        totalRevenue: totalRev
      });

      setSourceBreakdown(sourceArray);

    } catch (err) {
      console.error('Error fetching funnel analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate drop-off percentages safely
  const viewToSelectDropoff = funnelData.viewedForm > 0
    ? Math.round(((funnelData.viewedForm - funnelData.selectedPackage) / funnelData.viewedForm) * 100)
    : 0;

  const selectToSubmitDropoff = funnelData.selectedPackage > 0
    ? Math.round(((funnelData.selectedPackage - funnelData.submittedBooking) / funnelData.selectedPackage) * 100)
    : 0;

  const overallConversion = funnelData.viewedForm > 0
    ? ((funnelData.submittedBooking / funnelData.viewedForm) * 100).toFixed(1)
    : 0;

  if (loading) {
    return <div style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Loading funnel metrics...</div>;
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: '#0f172a', margin: 0, fontSize: '20px' }}>📊 Booking Funnel & Drop-Off Analytics</h2>
        <button onClick={fetchFunnelAnalytics} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px' }}>
          🔄 Refresh
        </button>
      </div>

      {/* High-level Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '24px' }}>
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Total Form Views</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>{funnelData.viewedForm}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Completed Bookings</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#22c55e', marginTop: '4px' }}>{funnelData.submittedBooking}</div>
        </div>
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Conversion Rate</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2563eb', marginTop: '4px' }}>{overallConversion}%</div>
        </div>
        <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 'bold' }}>Pipeline Revenue</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0f172a', marginTop: '4px' }}>TT${funnelData.totalRevenue}</div>
        </div>
      </div>

      {/* Funnel Step Drop-Off Visualizer */}
      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>📉 Where Users Drop Off</h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Step 1 */}
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>
              <span>1️⃣ Viewed Booking Form</span>
              <span>{funnelData.viewedForm} users</span>
            </div>
          </div>

          {/* Dropoff indicator 1 */}
          <div style={{ paddingLeft: '20px', fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>
            ⬇️ {viewToSelectDropoff}% dropped off without selecting a package
          </div>

          {/* Step 2 */}
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>
              <span>2️⃣ Selected Package / Started Details</span>
              <span>{funnelData.selectedPackage} users</span>
            </div>
          </div>

          {/* Dropoff indicator 2 */}
          <div style={{ paddingLeft: '20px', fontSize: '13px', color: '#dc2626', fontWeight: '600' }}>
            ⬇️ {selectToSubmitDropoff}% dropped off before hitting submit/WhatsApp
          </div>

          {/* Step 3 */}
          <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', borderLeft: '4px solid #22c55e' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 'bold', color: '#334155' }}>
              <span>3️⃣ Completed Booking Submission</span>
              <span>{funnelData.submittedBooking} bookings</span>
            </div>
          </div>

        </div>
      </div>

      {/* Traffic Source Breakdown */}
      <div style={{ background: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <h3 style={{ fontSize: '16px', color: '#1e293b', margin: '0 0 16px 0' }}>🌐 Traffic Source Performance</h3>
        {sourceBreakdown.length === 0 ? (
          <p style={{ fontSize: '13px', color: '#64748b' }}>No booking source data recorded yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b' }}>
                  <th style={{ padding: '8px' }}>Source / UTM</th>
                  <th style={{ padding: '8px' }}>Bookings</th>
                  <th style={{ padding: '8px' }}>Revenue Generated</th>
                </tr>
              </thead>
              <tbody>
                {sourceBreakdown.map((item, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 'bold', color: '#1e293b' }}>{item.source}</td>
                    <td style={{ padding: '10px 8px' }}>{item.count}</td>
                    <td style={{ padding: '10px 8px', color: '#166534', fontWeight: '600' }}>TT${item.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
