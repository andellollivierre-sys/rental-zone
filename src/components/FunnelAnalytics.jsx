import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

const EVENT_LABELS = {
  session_started: 'Sessions started',
  viewed_landing_page: 'Landing-page views',
  viewed_booking_page: 'Booking-page views',
  clicked_view_price: 'Price clicks',
  clicked_check_availability: 'Availability clicks',
  booking_started: 'Booking started',
  package_selected: 'Package selected',
  date_selected: 'Date selected',
  booking_submitted: 'Booking submitted',
  promo_booking_submitted: 'Promo booking submitted',
  whatsapp_clicked: 'WhatsApp clicks',
};

const money = (value) =>
  `TT$${Number(value || 0).toLocaleString('en-TT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const uniqueSessions = (events, names) =>
  new Set(
    events
      .filter((event) => names.includes(event.event) && event.session_id)
      .map((event) => event.session_id)
  ).size;

const sourceName = (event) => {
  const raw = String(
    event.utm_source ||
    event.source ||
    event.referrer ||
    'direct'
  ).toLowerCase();

  if (raw.includes('facebook') || raw === 'fb' || raw === 'l.facebook.com') {
    return 'Facebook';
  }
  if (raw.includes('instagram') || raw === 'ig') return 'Instagram';
  if (raw.includes('google')) return 'Google';
  if (raw.includes('blogger')) return 'Blogger';
  if (raw.includes('youtube')) return 'YouTube';
  if (raw === 'direct' || raw === 'unknown') return 'Direct / unknown';

  try {
    if (raw.startsWith('http')) return new URL(raw).hostname;
  } catch {
    // Keep the original source label if it is not a valid URL.
  }

  return raw.charAt(0).toUpperCase() + raw.slice(1);
};

function Metric({ label, value, note }) {
  return (
    <div style={{
      background: '#fff',
      padding: 16,
      borderRadius: 12,
      border: '1px solid #e2e8f0',
      minWidth: 0,
    }}>
      <div style={{ color: '#64748b', fontSize: 12, fontWeight: 700 }}>
        {label}
      </div>
      <div style={{
        color: '#0f172a',
        fontSize: 23,
        fontWeight: 750,
        marginTop: 6,
        overflowWrap: 'anywhere',
      }}>
        {value}
      </div>
      {note && (
        <div style={{ color: '#64748b', fontSize: 11, marginTop: 5 }}>
          {note}
        </div>
      )}
    </div>
  );
}

function DataTable({ headers, rows, emptyMessage }) {
  if (!rows.length) {
    return <p style={{ color: '#64748b', fontSize: 13 }}>{emptyMessage}</p>;
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 13,
        textAlign: 'left',
      }}>
        <thead>
          <tr>
            {headers.map((header) => (
              <th key={header} style={{
                padding: '10px 8px',
                color: '#64748b',
                borderBottom: '2px solid #e2e8f0',
                whiteSpace: 'nowrap',
              }}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.join('-')}-${index}`}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} style={{
                  padding: '10px 8px',
                  color: '#334155',
                  borderBottom: '1px solid #f1f5f9',
                  overflowWrap: 'anywhere',
                }}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function FunnelAnalytics() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [bookingWarning, setBookingWarning] = useState('');

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');
    setBookingWarning('');

    try {
      const [eventResult, bookingResult] = await Promise.all([
        supabase
          .from('visitor_events')
          .select(
            'session_id,visitor_id,ip_hash,event,source,utm_source,utm_medium,utm_campaign,referrer,device,is_test,created_at'
          )
          .eq('is_test', false)
          .order('created_at', { ascending: false }),

        supabase.from('bookings').select('*'),
      ]);

      if (eventResult.error) throw eventResult.error;

      setEvents(eventResult.data || []);

      if (bookingResult.error) {
        setBookings([]);
        setBookingWarning(
          `Booking records could not be loaded: ${bookingResult.error.message}`
        );
      } else {
        setBookings(
          (bookingResult.data || []).filter((booking) => !booking.is_test)
        );
      }
    } catch (err) {
      setError(err?.message || 'Unable to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const landingSessions = uniqueSessions(events, [
    'session_started',
    'viewed_landing_page',
  ]);
  const bookingPageSessions = uniqueSessions(events, ['viewed_booking_page']);
  const startedSessions = uniqueSessions(events, ['booking_started']);
  const packageSessions = uniqueSessions(events, ['package_selected']);
  const submittedSessions = uniqueSessions(events, [
    'booking_submitted',
    'promo_booking_submitted',
  ]);
  const availabilitySessions = uniqueSessions(events, [
    'clicked_check_availability',
  ]);
  const whatsappSessions = uniqueSessions(events, ['whatsapp_clicked']);

  const eventCounts = Object.entries(
    events.reduce((result, event) => {
      result[event.event] = result[event.event] || {
        events: 0,
        sessions: new Set(),
      };
      result[event.event].events += 1;
      if (event.session_id) result[event.event].sessions.add(event.session_id);
      return result;
    }, {})
  )
    .map(([name, data]) => ({
      name,
      label: EVENT_LABELS[name] || name.replaceAll('_', ' '),
      count: data.events,
      sessions: data.sessions.size,
    }))
    .sort((a, b) => b.count - a.count);

  const sourceGroups = events.reduce((result, event) => {
    const source = sourceName(event);
    if (!result[source]) {
      result[source] = {
        sessions: new Set(),
        landing: new Set(),
        booking: new Set(),
        started: new Set(),
        submitted: new Set(),
        campaigns: new Set(),
        mediums: new Set(),
      };
    }

    const group = result[source];
    if (event.session_id) {
      group.sessions.add(event.session_id);
      if (event.event === 'viewed_landing_page' || event.event === 'session_started') {
        group.landing.add(event.session_id);
      }
      if (event.event === 'viewed_booking_page') group.booking.add(event.session_id);
      if (event.event === 'booking_started') group.started.add(event.session_id);
      if (
        event.event === 'booking_submitted' ||
        event.event === 'promo_booking_submitted'
      ) {
        group.submitted.add(event.session_id);
      }
    }

    if (event.utm_campaign) group.campaigns.add(event.utm_campaign);
    if (event.utm_medium) group.mediums.add(event.utm_medium);

    return result;
  }, {});

  const sourceRows = Object.entries(sourceGroups)
    .map(([source, group]) => [
      source,
      group.sessions.size,
      group.landing.size,
      group.booking.size,
      group.started.size,
      group.submitted.size,
      [...group.mediums].join(', ') || '—',
      [...group.campaigns].join(', ') || '—',
    ])
    .sort((a, b) => b[1] - a[1]);

  // Group recorded events by persistent browser ID. IP hashes are secondary clues only.
  const visitorGroups = events.reduce((result, event) => {
    if (!event.visitor_id) return result;

    if (!result[event.visitor_id]) {
      result[event.visitor_id] = {
        sessions: new Set(),
        ipHashes: new Set(),
        eventCount: 0,
        firstSeen: event.created_at,
        lastSeen: event.created_at,
      };
    }

    const visitor = result[event.visitor_id];
    visitor.eventCount += 1;
    if (event.session_id) visitor.sessions.add(event.session_id);
    if (event.ip_hash) visitor.ipHashes.add(event.ip_hash);

    const eventTime = new Date(event.created_at).getTime();
    if (eventTime < new Date(visitor.firstSeen).getTime()) {
      visitor.firstSeen = event.created_at;
    }
    if (eventTime > new Date(visitor.lastSeen).getTime()) {
      visitor.lastSeen = event.created_at;
    }
    return result;
  }, {});

  // Compact, stable four-digit dashboard alias; original IDs remain in Supabase.
  const shortVisitorCode = (value) => {
    if (!value) return '—';
    let hash = 2166136261;
    for (const character of String(value)) {
      hash ^= character.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return `HTRZ-${String((hash >>> 0) % 10000).padStart(4, '0')}`;
  };

  const formatSeen = (value) =>
    value
      ? new Date(value).toLocaleString('en-TT', {
          dateStyle: 'medium',
          timeStyle: 'short',
        })
      : '—';

  const visitorRows = Object.entries(visitorGroups)
    .map(([visitorId, visitor]) => [
      shortVisitorCode(visitorId),
      String(visitor.sessions.size),
      String(visitor.eventCount),
      [...visitor.ipHashes].map(shortVisitorCode).join(', ') || '—',
      formatSeen(visitor.firstSeen),
      formatSeen(visitor.lastSeen),
    ])
    .sort((a, b) => Number(b[1]) - Number(a[1]));

  const bookingStatuses = bookings.reduce((result, booking) => {
    const status = String(
      booking.status || booking.booking_status || 'Status not recorded'
    );
    if (!result[status]) result[status] = { count: 0, value: 0 };
    result[status].count += 1;
    result[status].value += Number(booking.total_price || 0);
    return result;
  }, {});

  const recordedBookingValue = bookings.reduce(
    (sum, booking) => sum + Number(booking.total_price || 0),
    0
  );

  const panelStyle = {
    background: '#fff',
    padding: 18,
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    marginBottom: 18,
  };

  if (loading) {
    return (
      <div style={{ padding: 20, color: '#64748b' }}>
        Loading analytics data…
      </div>
    );
  }

  return (
    <div style={{
      padding: 16,
      maxWidth: 1100,
      margin: '0 auto',
      fontFamily: 'system-ui, sans-serif',
      color: '#0f172a',
      background: '#f8fafc',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
        flexWrap: 'wrap',
        marginBottom: 18,
      }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 21 }}>
            Rental Zone — Performance
          </h2>
          <p style={{ color: '#64748b', fontSize: 12, margin: '5px 0 0' }}>
            Recorded non-test tracking events and booking records
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          style={{
            background: '#e2e8f0',
            border: 0,
            borderRadius: 7,
            padding: '9px 13px',
            cursor: 'pointer',
          }}
        >
          Refresh data
        </button>
      </div>

      {error && (
        <div role="alert" style={{
          ...panelStyle,
          color: '#b91c1c',
          borderColor: '#fecaca',
        }}>
          Could not load tracking data: {error}
        </div>
      )}

      {bookingWarning && (
        <div role="alert" style={{
          ...panelStyle,
          color: '#92400e',
          borderColor: '#fde68a',
        }}>
          {bookingWarning}
        </div>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
        gap: 12,
        marginBottom: 20,
      }}>
        <Metric label="Recorded visitor sessions" value={landingSessions} />
        <Metric label="Booking-page sessions" value={bookingPageSessions} />
        <Metric label="Booking starts" value={startedSessions} />
        <Metric label="Package selections" value={packageSessions} />
        <Metric
          label="Submission sessions"
          value={submittedSessions}
          note="Unique sessions across submission event types"
        />
        <Metric label="Availability-click sessions" value={availabilitySessions} />
        <Metric label="WhatsApp-click sessions" value={whatsappSessions} />
        <Metric
          label="Recorded booking value"
          value={money(recordedBookingValue)}
          note={`${bookings.length} non-test booking records; not proof of money collected`}
        />
      </div>

      <section style={panelStyle}>
        <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>
          Booking journey
        </h3>
        <p style={{ margin: '0 0 14px', color: '#64748b', fontSize: 12 }}>
          These are unique session counts, not verified individual people.
          Events may occur in different sessions and are not guaranteed to form
          a perfectly sequential funnel.
        </p>
        <DataTable
          headers={['Stage', 'Unique sessions']}
          rows={[
            ['Landing page / session start', landingSessions],
            ['Viewed booking page', bookingPageSessions],
            ['Started booking', startedSessions],
            ['Selected package', packageSessions],
            ['Submitted booking form', submittedSessions],
          ].map((row) => row.map(String))}
          emptyMessage="No funnel events recorded."
        />
      </section>

      <section style={panelStyle}>
        <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>
          Traffic source performance
        </h3>
        <p style={{ margin: '0 0 14px', color: '#64748b', fontSize: 12 }}>
          Sources are inferred from recorded attribution fields. Direct / unknown
          traffic can include unattributed visits; campaign labels depend on
          the tracking tags present.
        </p>
        <DataTable
          headers={[
            'Source',
            'Sessions',
            'Landing',
            'Booking page',
            'Started',
            'Submitted',
            'Medium',
            'Campaign',
          ]}
          rows={sourceRows.map((row) => row.map(String))}
          emptyMessage="No source attribution data recorded."
        />
      </section>

      <section style={panelStyle}>
        <h3 style={{ margin: '0 0 6px', fontSize: 16 }}>
          Repeat visitor IDs
        </h3>
        <p style={{ margin: '0 0 14px', color: '#64748b', fontSize: 12 }}>
          Visitor ID is the primary repeat-browser match. IP hash is a secondary
          network clue, not proof of a person's identity. Different people can
          share an IP address, and one person can have different IDs across
          browsers or devices. Older events without visitor IDs are not listed.
        </p>
        <DataTable
          headers={[
            'Visitor ID',
            'Sessions',
            'Events',
            'IP hash code(s)',
            'First seen',
            'Last seen',
          ]}
          rows={visitorRows}
          emptyMessage="No visitor IDs recorded yet."
        />
        <p style={{ color: '#64748b', fontSize: 11, marginBottom: 0 }}>
          Short HTRZ codes are stable dashboard labels for repeat matching.
          Full identifiers remain in Supabase; raw IP addresses are not displayed
          or stored by this tracking system.
        </p>
      </section>

      <section style={panelStyle}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>
          Booking records by status
        </h3>
        <DataTable
          headers={['Recorded status', 'Records', 'Recorded value']}
          rows={Object.entries(bookingStatuses)
            .sort((a, b) => b[1].count - a[1].count)
            .map(([status, data]) => [
              status,
              String(data.count),
              money(data.value),
            ])}
          emptyMessage="No non-test booking records found, or booking data could not be loaded."
        />
        <p style={{ color: '#64748b', fontSize: 12, marginBottom: 0 }}>
          Values come from the stored total_price field. They do not confirm
          deposits, payments, completed rentals, or profit.
        </p>
      </section>

      <section style={panelStyle}>
        <h3 style={{ margin: '0 0 12px', fontSize: 16 }}>
          All recorded event types
        </h3>
        <DataTable
          headers={['Event', 'Event count', 'Unique sessions']}
          rows={eventCounts.map((item) => [
            item.label,
            String(item.count),
            String(item.sessions),
          ])}
          emptyMessage="No non-test events found."
        />
      </section>

      <p style={{ color: '#64748b', fontSize: 11 }}>
        Data shown is limited to records returned by Supabase and marked
        is_test = false for visitor events. Tracking may miss visitors or
        include automated traffic. Use this dashboard to identify patterns,
        not as proof that every session represents a genuine customer.
      </p>
    </div>
  );
}
