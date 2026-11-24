import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { trackTrzEvent } from '../utils/trzTracker';
import AvailabilityDatePicker from './AvailabilityDatePicker';

const PACKAGES = {
  '2_hours': { label: '2 Hours', hours: 2 },
  '3_hours': { label: '3 Hours', hours: 3 },
  full_day: { label: '8 Hours', hours: 8 }
};

const DELIVERY_ZONES = {
  'Free delivery': { fee: 0, areas: ['Chaguanas', 'Cunupia', 'Charlieville', 'Endeavour', 'Freeport', 'Carapichaima', 'Couva'] },
  'Zone 1': { fee: 100, areas: ['Tunapuna', 'St. Augustine', 'San Juan', 'Port of Spain', 'Arima'] },
  'Zone 2': { fee: 150, areas: ['Diego Martin', 'Marabella', 'San Fernando', 'Gasparillo', 'Princes Town', 'Sangre Grande'] },
  'Zone 3': { fee: 200, areas: ['Penal', 'Debe', 'Siparia', 'Point Fortin', 'Rio Claro'] },
  'Custom quote': { fee: null, areas: ['Mayaro', 'Toco', 'Other / Not listed'] }
};

const calculateEndTime = (startTime, hours) => {
  if (!startTime) return null;
  const [hour, minute] = startTime.split(':').map(Number);
  const total = hour * 60 + minute + hours * 60;
  if (total >= 1440) return null;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export default function AvailabilityCheckModal({
  onClose,
  promoIsActive,
  publicHours,
  publicPrice
}) {
  const today = new Date();
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const [eventDate, setEventDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [packageType, setPackageType] = useState(promoIsActive ? 'promotion' : '3_hours');
  const [deliveryArea, setDeliveryArea] = useState('');
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const selectedPackage = packageType === 'promotion'
    ? { label: `${publicHours} Hours promotional offer`, hours: Number(publicHours) }
    : PACKAGES[packageType];

  const handleCheck = async (event) => {
    event.preventDefault();
    setError('');
    setResult(null);

    const endTime = calculateEndTime(startTime, selectedPackage?.hours);
    if (!endTime) {
      setError('Choose a start time that allows the full rental to finish before midnight.');
      return;
    }

    setChecking(true);
    trackTrzEvent('availability_check_started', {
      event_date: eventDate,
      start_time: startTime,
      package_type: packageType,
      rental_hours: selectedPackage.hours
    });

    try {
      const { data, error: queryError } = await supabase
        .from('bookings')
        .select('start_time, end_time')
        .eq('event_date', eventDate)
        .eq('status', 'Confirmed');

      if (queryError) throw queryError;

      const conflicts = (data || []).filter((booking) => {
        const bookedStart = String(booking.start_time).slice(0, 5);
        const bookedEnd = String(booking.end_time).slice(0, 5);
        return startTime < bookedEnd && endTime > bookedStart;
      });

      if (conflicts.length) {
        setResult({ available: false, status: 'unavailable', conflicts });
        trackTrzEvent('availability_check_unavailable', {
          event_date: eventDate,
          start_time: startTime,
          end_time: endTime,
          conflicting_slots: conflicts.length
        });
        return;
      }

      const availabilityStatus = (data || []).length ? 'limited' : 'available';
      const selection = {
        event_date: eventDate,
        availability_status: availabilityStatus,
        start_time: startTime,
        package_type: packageType,
        delivery_area: deliveryArea,
        rental_hours: selectedPackage.hours,
        checked_at: new Date().toISOString()
      };

      sessionStorage.setItem('trz_availability_selection', JSON.stringify(selection));
      if (packageType === 'promotion') {
        sessionStorage.setItem('trz_promo_intent', 'true');
      } else {
        sessionStorage.removeItem('trz_promo_intent');
      }

      trackTrzEvent(availabilityStatus === 'limited' ? 'availability_check_limited' : 'availability_check_available', {
        event_date: eventDate,
        start_time: startTime,
        end_time: endTime,
        package_type: packageType,
        rental_hours: selectedPackage.hours,
        availability_status: availabilityStatus
      });

      window.location.hash = '#booking';
    } catch (err) {
      console.error('Availability check failed:', err);
      setError('We could not confirm availability right now. Please try again in a moment or contact us on WhatsApp.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 12000, background: 'rgba(15,23,42,.72)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 14 }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="availability-title"
        onClick={(event) => event.stopPropagation()}
        style={{ width: '100%', maxWidth: 460, maxHeight: '92vh', overflowY: 'auto', background: '#fff', borderRadius: 18, padding: 22, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <h2 id="availability-title" style={{ margin: 0, fontSize: 22, color: '#0f172a' }}>Check Castle Availability</h2>
          <button type="button" onClick={onClose} aria-label="Close availability check" style={{ border: 0, background: '#f1f5f9', borderRadius: 999, width: 34, height: 34, fontSize: 22, cursor: 'pointer' }}>×</button>
        </div>
        <p style={{ color: '#64748b', fontSize: 14, lineHeight: 1.5 }}>Choose your event date, start time and rental length. We’ll check confirmed bookings before you continue.</p>

        <form onSubmit={handleCheck} style={{ display: 'grid', gap: 13 }}>
          <AvailabilityDatePicker
            label="Event date"
            value={eventDate}
            minDate={minDate}
            startTime={startTime}
            rentalHours={selectedPackage?.hours}
            onChange={(nextDate) => { setEventDate(nextDate); setResult(null); }}
          />
          <label style={{ display: 'grid', gap: 5, fontSize: 13, fontWeight: 700, color: '#334155' }}>
            Preferred start time
            <input type="time" required value={startTime} onChange={(e) => { setStartTime(e.target.value); setResult(null); }} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 9, fontSize: 16 }} />
          </label>
          <label style={{ display: 'grid', gap: 5, fontSize: 13, fontWeight: 700, color: '#334155' }}>
            Rental duration
            <select required value={packageType} onChange={(e) => { setPackageType(e.target.value); setResult(null); }} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 9, fontSize: 15, background: '#fff' }}>
              {promoIsActive && <option value="promotion">{publicHours} Hours — Promotional offer (TT${publicPrice})</option>}
              <option value="2_hours">2 Hours — TT$650</option>
              <option value="3_hours">3 Hours — TT$900</option>
              <option value="full_day">8 Hours — TT$1,800</option>
            </select>
          </label>
          <label style={{ display: 'grid', gap: 5, fontSize: 13, fontWeight: 700, color: '#334155' }}>
            Delivery area
            <select required value={deliveryArea} onChange={(e) => { setDeliveryArea(e.target.value); setResult(null); }} style={{ padding: 12, border: '1px solid #cbd5e1', borderRadius: 9, fontSize: 15, background: '#fff' }}>
              <option value="">Choose your area</option>
              {Object.entries(DELIVERY_ZONES).map(([zone, config]) => (
                <optgroup
                  key={zone}
                  label={zone + (config.fee === null ? ' — Custom quote' : ` — TT${config.fee}`)}
                >
                  {config.areas.map((area) => (
                    <option key={area} value={area}>{area}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </label>

          {result?.available === false && (
            <div role="status" style={{ padding: 12, borderRadius: 10, background: '#fff7ed', border: '1px solid #fdba74', color: '#9a3412', fontSize: 14 }}>
              <strong>That time is already booked.</strong>
              <div style={{ marginTop: 6 }}>Confirmed bookings: {result.conflicts.map((slot) => `${String(slot.start_time).slice(0, 5)}–${String(slot.end_time).slice(0, 5)}`).join(', ')}. Try another start time or date.</div>
            </div>
          )}
          {error && <div role="alert" style={{ padding: 11, borderRadius: 9, background: '#fef2f2', color: '#b91c1c', fontSize: 13 }}>{error}</div>}

          <button type="submit" disabled={checking} style={{ border: 0, borderRadius: 10, padding: 14, background: checking ? '#94a3b8' : '#2563eb', color: '#fff', fontWeight: 800, fontSize: 15, cursor: checking ? 'wait' : 'pointer' }}>
            {checking ? 'Checking availability…' : 'Check Availability'}
          </button>
        </form>
        <p style={{ margin: '12px 0 0', color: '#64748b', fontSize: 11, lineHeight: 1.4 }}>Availability is checked against confirmed bookings. Your time is not reserved until your booking is confirmed.</p>
      </section>
    </div>
  );
}
