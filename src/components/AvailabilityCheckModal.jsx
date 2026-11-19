import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { trackTrzEvent } from '../utils/trzTracker';

const PACKAGES = {
  '2_hours': { hours: 2 },
  '3_hours': { hours: 3 },
  full_day: { hours: 8 }
};

const TRANSPORT_ZONES = {
  'Free delivery': { fee: 0, areas: ['Chaguanas', 'Cunupia', 'Charlieville', 'Endeavour', 'Freeport', 'Carapichaima', 'Couva'] },
  'Zone 1': { fee: 100, areas: ['Tunapuna', 'St. Augustine', 'San Juan', 'Port of Spain', 'Arima'] },
  'Zone 2': { fee: 150, areas: ['Diego Martin', 'Marabella', 'San Fernando', 'Gasparillo', 'Princes Town', 'Sangre Grande'] },
  'Zone 3': { fee: 200, areas: ['Penal', 'Debe', 'Siparia', 'Point Fortin', 'Rio Claro'] },
  'Custom quote': { fee: null, areas: ['Mayaro', 'Toco', 'Other / Not listed'] }
};

const endTimeFor = (start, hours) => {
  const [h, m] = start.split(':').map(Number);
  const total = h * 60 + m + hours * 60;
  if (total >= 1440) return null;
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
};

export default function AvailabilityCheckModal({ onClose, promoIsActive, publicHours, publicPrice }) {
  const now = new Date();
  const minDate = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(promoIsActive ? 'promotion' : '3_hours');
  const [area, setArea] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [available, setAvailable] = useState(false);
  const hours = duration === 'promotion' ? Number(publicHours) : PACKAGES[duration]?.hours;
  const end = time && Number.isFinite(hours) ? endTimeFor(time, hours) : null;

  const check = async (e) => {
    e.preventDefault();
    setMessage('');
    setAvailable(false);
    if (!date || !time || !area) {
      setMessage('Choose your event date, start time and delivery area.');
      return;
    }
    if (!end) {
      setMessage('Choose a start time that allows the rental to finish before midnight.');
      return;
    }
    setBusy(true);
    trackTrzEvent('availability_check_started', { event_date: date, start_time: time, rental_hours: hours });
    try {
      const { data, error } = await supabase.from('bookings').select('start_time,end_time').eq('event_date', date).eq('status', 'Confirmed');
      if (error) throw error;
      const conflicts = (data || []).filter((b) => time < String(b.end_time).slice(0,5) && end > String(b.start_time).slice(0,5));
      if (conflicts.length) {
        setMessage('That time is already booked. Choose another time or date.');
        trackTrzEvent('availability_check_unavailable', { event_date: date, conflicting_slots: conflicts.length });
        return;
      }
      sessionStorage.setItem('trz_availability_selection', JSON.stringify({ event_date: date, start_time: time, package_type: duration, delivery_area: area, rental_hours: hours, checked_at: new Date().toISOString() }));
      if (duration === 'promotion') sessionStorage.setItem('trz_promo_intent','true');
      else sessionStorage.removeItem('trz_promo_intent');
      setAvailable(true);
      trackTrzEvent('availability_check_available', { event_date: date, start_time: time, end_time: end, rental_hours: hours });
    } catch (err) {
      console.error('Availability check failed:', err);
      setMessage('We could not verify availability. Please try again or contact us.');
    } finally {
      setBusy(false);
    }
  };

  return <div role="presentation" onClick={onClose} style={{position:'fixed',inset:0,zIndex:12000,background:'rgba(15,23,42,.75)',display:'grid',placeItems:'center',padding:14}}>
    <section role="dialog" aria-modal="true" aria-labelledby="availability-title" onClick={e=>e.stopPropagation()} style={{background:'#fff',borderRadius:18,padding:22,width:'100%',maxWidth:460,maxHeight:'92vh',overflowY:'auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h2 id="availability-title">Check Castle Availability</h2><button type="button" onClick={onClose} aria-label="Close">×</button></div>
      <p>Choose your event date, start time, rental duration and delivery area.</p>
      <form onSubmit={check} style={{display:'grid',gap:12}}>
        <label>Event date<input required type="date" min={minDate} value={date} onChange={e=>{setDate(e.target.value);setAvailable(false);}} /></label>
        <label>Start time<input required type="time" value={time} onChange={e=>{setTime(e.target.value);setAvailable(false);}} /></label>
        <label>Rental duration<select value={duration} onChange={e=>{setDuration(e.target.value);setAvailable(false);}}>
          {promoIsActive && <option value="promotion">{publicHours} Hours — TT$${publicPrice} promotion</option>}
          <option value="2_hours">2 Hours</option><option value="3_hours">3 Hours</option><option value="full_day">8 Hours</option>
        </select></label>
        <label>Delivery Area / Community
          <select required value={area} onChange={e=>{setArea(e.target.value);setAvailable(false);}} style={{display:'block',width:'100%',padding:10,border:'1px solid #cbd5e1',borderRadius:8,background:'#fff'}}>
            <option value="">Select your area</option>
            {Object.entries(TRANSPORT_ZONES).map(([zone, config]) => (
              <optgroup key={zone} label={zone + (config.fee === null ? ' — Quote required' : ` — TT$${config.fee}`)}>
                {config.areas.map((name) => <option key={name} value={name}>{name} — {config.fee === null ? 'Quote required' : `TT${config.fee}`}</option>)}
              </optgroup>
            ))}
          </select>
        </label>
        {message && <p role="alert" style={{color:'#b91c1c'}}>{message}</p>}
        {available && <div role="status" style={{background:'#ecfdf5',padding:12,borderRadius:8,color:'#065f46'}}>This time appears available. Continue to complete your booking.</div>}
        {!available ? <button disabled={busy} type="submit">{busy?'Checking…':'Check Availability'}</button> : <button type="button" onClick={()=>{onClose();window.location.hash='#booking';}}>Continue to Booking</button>}
      </form>
      <small>Availability is not reserved until your booking is confirmed.</small>
    </section>
  </div>;
}
