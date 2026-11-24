import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';

const pad = (value) => String(value).padStart(2, '0');

function toDateKey(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function getEndTime(startTime, hours) {
  if (!startTime || !Number.isFinite(Number(hours))) return null;
  const [hour, minute] = startTime.split(':').map(Number);
  const total = hour * 60 + minute + Number(hours) * 60;
  if (total >= 1440) return null;
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

function getDayStatus(bookings, startTime, rentalHours) {
  if (!bookings.length) return 'available';
  const endTime = getEndTime(startTime, rentalHours);
  if (!startTime || !endTime) return 'limited';
  const overlaps = bookings.some((booking) => {
    const bookedStart = String(booking.start_time).slice(0, 5);
    const bookedEnd = String(booking.end_time).slice(0, 5);
    return startTime < bookedEnd && endTime > bookedStart;
  });
  return overlaps ? 'unavailable' : 'limited';
}

const STATUS_STYLES = {
  available: { background: '#dcfce7', color: '#166534', border: '#86efac', label: 'Available' },
  limited: { background: '#fef3c7', color: '#92400e', border: '#fcd34d', label: 'Limited' },
  unavailable: { background: '#fee2e2', color: '#991b1b', border: '#fca5a5', label: 'Not available' },
  unknown: { background: '#f1f5f9', color: '#64748b', border: '#cbd5e1', label: 'Checking' }
};

export default function AvailabilityDatePicker({ value, onChange, startTime, rentalHours, minDate, label = 'Event date' }) {
  const today = toDateKey(new Date());
  const earliestDate = minDate || today;
  const selectedDate = value ? new Date(`${value}T12:00:00`) : null;
  const [visibleMonth, setVisibleMonth] = useState(() => selectedDate || new Date());
  const [bookingsByDate, setBookingsByDate] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const monthStart = `${year}-${pad(month + 1)}-01`;
  const monthEnd = toDateKey(new Date(year, month + 1, 0));

  useEffect(() => {
    let active = true;
    const loadMonth = async () => {
      setLoading(true);
      setLoadError(false);
      const { data, error } = await supabase
        .from('bookings')
        .select('event_date, start_time, end_time')
        .eq('status', 'Confirmed')
        .gte('event_date', monthStart)
        .lte('event_date', monthEnd);

      if (!active) return;
      if (error) {
        setBookingsByDate({});
        setLoadError(true);
      } else {
        const grouped = (data || []).reduce((result, booking) => {
          if (!result[booking.event_date]) result[booking.event_date] = [];
          result[booking.event_date].push(booking);
          return result;
        }, {});
        setBookingsByDate(grouped);
      }
      setLoading(false);
    };
    loadMonth();
    return () => { active = false; };
  }, [monthStart, monthEnd]);

  const days = useMemo(() => {
    const firstWeekday = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
      ...Array(firstWeekday).fill(null),
      ...Array.from({ length: daysInMonth }, (_, index) => index + 1)
    ];
  }, [year, month]);

  const monthLabel = visibleMonth.toLocaleDateString('en-TT', { month: 'long', year: 'numeric' });
  const changeMonth = (offset) => setVisibleMonth(new Date(year, month + offset, 1));

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#334155' }}>{label}</label>
      <div style={{ border: '1px solid #cbd5e1', borderRadius: 12, padding: 12, background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
          <button type="button" onClick={() => changeMonth(-1)} disabled={year === new Date(earliestDate + 'T12:00:00').getFullYear() && month <= new Date(earliestDate + 'T12:00:00').getMonth()} aria-label="Previous month" style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>‹</button>
          <strong style={{ color: '#0f172a', fontSize: 14 }}>{monthLabel}</strong>
          <button type="button" onClick={() => changeMonth(1)} aria-label="Next month" style={{ border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: 8, padding: '6px 10px', cursor: 'pointer' }}>›</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4, marginBottom: 4 }}>
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => <div key={day + index} style={{ textAlign: 'center', color: '#64748b', fontSize: 11, fontWeight: 700, padding: 4 }}>{day}</div>)}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: 4 }}>
          {days.map((day, index) => {
            if (!day) return <div key={`blank-${index}`} />;
            const date = new Date(year, month, day);
            const dateKey = toDateKey(date);
            const isPast = dateKey < earliestDate;
            const status = loadError ? 'unknown' : getDayStatus(bookingsByDate[dateKey] || [], startTime, rentalHours);
            const style = STATUS_STYLES[status];
            const isSelected = value === dateKey;
            return (
              <button
                key={dateKey}
                type="button"
                disabled={isPast || loading || loadError}
                onClick={() => onChange(dateKey)}
                aria-label={`${dateKey}: ${style.label}`}
                aria-pressed={isSelected}
                title={style.label}
                style={{
                  minWidth: 0,
                  padding: '9px 2px',
                  borderRadius: 8,
                  border: isSelected ? '2px solid #0f172a' : `1px solid ${style.border}`,
                  background: style.background,
                  color: style.color,
                  fontSize: 13,
                  fontWeight: isSelected ? 900 : 700,
                  opacity: isPast ? 0.35 : 1,
                  cursor: isPast || loading || loadError ? 'not-allowed' : 'pointer'
                }}
              >
                {day}
              </button>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12, fontSize: 11, color: '#475569' }}>
          {['available', 'limited', 'unavailable'].map((status) => (
            <span key={status} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: STATUS_STYLES[status].background, border: `1px solid ${STATUS_STYLES[status].border}` }} />
              {STATUS_STYLES[status].label}
            </span>
          ))}
        </div>
        {loading && <p role="status" style={{ margin: '8px 0 0', color: '#64748b', fontSize: 11 }}>Loading confirmed bookings…</p>}
        {loadError && <p role="alert" style={{ margin: '8px 0 0', color: '#b91c1c', fontSize: 11 }}>Availability colours could not load. Try again shortly.</p>}
        {value && <p style={{ margin: '8px 0 0', color: '#334155', fontSize: 12 }}>Selected: <strong>{value}</strong> · {STATUS_STYLES[loadError ? 'unknown' : getDayStatus(bookingsByDate[value] || [], startTime, rentalHours)].label}</p>}
      </div>
    </div>
  );
}
