import React, { useState } from 'react';

const equipment = [
  {
    id: 'bouncer',
    name: 'Spider-Man Bouncy Castle',
    description: 'Bounce, climbing wall and slide',
    image: '/1795605347909.jpg',
    note: 'Existing castle packages will be shown here.'
  },
  {
    id: 'washer',
    name: 'Pressure Washer',
    description: 'A-iPower PWF2701SH',
    image: '/1795604636353.jpg',
    note: 'Rental duration and price to be confirmed.'
  },
  {
    id: 'generator',
    name: 'EMTOP Generator',
    description: 'EGGRD2822 · 3000W',
    image: '/1795605347909.jpg',
    note: 'Rental duration and price to be confirmed.'
  }
];

export default function BookingPreview() {
  const [selected, setSelected] = useState('bouncer');
  const [date, setDate] = useState('');
  const [duration, setDuration] = useState('');
  const [time, setTime] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [showSummary, setShowSummary] = useState(false);
  const item = equipment.find((entry) => entry.id === selected);

  const fieldStyle = {
    width: '100%', boxSizing: 'border-box', padding: '13px 14px',
    border: '1px solid #cbd5e1', borderRadius: 10, background: '#fff',
    color: '#0f172a', fontSize: 15, marginTop: 7
  };
  const labelStyle = { display: 'block', color: '#334155', fontSize: 13, fontWeight: 700, marginTop: 17 };

  return (
    <div style={{ padding: '28px 18px 44px', color: '#0f172a', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', marginBottom: 25 }}>
        <div style={{ color: '#0284c7', fontWeight: 800, fontSize: 12, letterSpacing: 1.5 }}>THE RENTAL ZONE TT</div>
        <h1 style={{ fontSize: 29, lineHeight: 1.15, margin: '9px 0 8px' }}>Book your rental</h1>
        <p style={{ color: '#64748b', margin: 0, fontSize: 14 }}>Choose your equipment and send us your booking request.</p>
      </div>

      <section style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 18, boxShadow: '0 8px 24px rgba(15,23,42,.05)' }}>
        <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 800, letterSpacing: 1 }}>STEP 1</div>
        <h2 style={{ fontSize: 19, margin: '5px 0 14px' }}>What would you like to rent?</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10 }}>
          {equipment.map((entry) => (
            <button key={entry.id} type="button" onClick={() => { setSelected(entry.id); setShowSummary(false); }}
              style={{ textAlign: 'left', padding: 13, borderRadius: 12, border: selected === entry.id ? '2px solid #0284c7' : '1px solid #cbd5e1', background: selected === entry.id ? '#f0f9ff' : '#fff', cursor: 'pointer', color: '#0f172a' }}>
              <div style={{ fontWeight: 800, fontSize: 14 }}>{entry.name}</div>
              <div style={{ color: '#64748b', fontSize: 12, marginTop: 5 }}>{entry.description}</div>
              {selected === entry.id && <div style={{ color: '#0369a1', fontWeight: 800, fontSize: 11, marginTop: 9 }}>SELECTED</div>}
            </button>
          ))}
        </div>

        <div style={{ background: '#f8fafc', borderRadius: 10, padding: 12, marginTop: 14, fontSize: 13, color: '#475569' }}>
          <strong style={{ color: '#0f172a' }}>Selected: {item.name}</strong><br />{item.note}
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 20, paddingTop: 17 }}>
          <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 800, letterSpacing: 1 }}>STEP 2</div>
          <h2 style={{ fontSize: 19, margin: '5px 0 2px' }}>When do you need it?</h2>
          <label style={labelStyle}>Rental date
            <input type="date" value={date} onChange={(e) => { setDate(e.target.value); setShowSummary(false); }} style={fieldStyle} />
          </label>
          <label style={labelStyle}>Rental duration
            <select value={duration} onChange={(e) => { setDuration(e.target.value); setShowSummary(false); }} style={fieldStyle}>
              <option value="">Select rental duration</option>
              {selected === 'bouncer' ? <>
                <option value="2 Hours">2 Hours</option>
                <option value="3 Hours">3 Hours</option>
                <option value="Full Day / 8 Hours">Full Day / 8 Hours</option>
              </> : <>
                <option value="To be confirmed">To be confirmed with the team</option>
              </>}
            </select>
          </label>
          <label style={labelStyle}>Preferred start time
            <input type="time" value={time} onChange={(e) => { setTime(e.target.value); setShowSummary(false); }} style={fieldStyle} />
          </label>
        </div>

        <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 20, paddingTop: 17 }}>
          <div style={{ fontSize: 12, color: '#0284c7', fontWeight: 800, letterSpacing: 1 }}>STEP 3</div>
          <h2 style={{ fontSize: 19, margin: '5px 0 2px' }}>Your contact details</h2>
          <label style={labelStyle}>Full name
            <input value={name} onChange={(e) => { setName(e.target.value); setShowSummary(false); }} placeholder="Your name" style={fieldStyle} />
          </label>
          <label style={labelStyle}>Phone / WhatsApp
            <input type="tel" value={phone} onChange={(e) => { setPhone(e.target.value); setShowSummary(false); }} placeholder="Your contact number" style={fieldStyle} />
          </label>
          <label style={labelStyle}>Delivery location
            <textarea value={address} onChange={(e) => { setAddress(e.target.value); setShowSummary(false); }} placeholder="Where should we deliver?" rows={3} style={{ ...fieldStyle, resize: 'vertical' }} />
          </label>
        </div>

        <button type="button" disabled={!date || !duration || !time || !name.trim() || !phone.trim() || !address.trim()}
          onClick={() => setShowSummary(true)}
          style={{ width: '100%', border: 0, borderRadius: 11, padding: 15, marginTop: 22, background: '#0284c7', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer', opacity: (!date || !duration || !time || !name.trim() || !phone.trim() || !address.trim()) ? .45 : 1 }}>
          Preview booking summary
        </button>
        <p style={{ fontSize: 11, color: '#94a3b8', textAlign: 'center', margin: '11px 0 0' }}>Preview only — this does not submit or reserve a booking.</p>
      </section>

      {showSummary && <section style={{ marginTop: 16, background: '#ecfeff', border: '1px solid #a5f3fc', borderRadius: 14, padding: 17 }}>
        <h2 style={{ margin: '0 0 10px', fontSize: 18 }}>Booking request preview</h2>
        <div style={{ fontSize: 14, lineHeight: 1.8, color: '#164e63' }}>
          <strong>{item.name}</strong><br />Date: {date}<br />Duration: {duration}<br />Start time: {time}<br />Name: {name}<br />Phone: {phone}<br />Location: {address}
        </div>
        <p style={{ color: '#0e7490', fontSize: 12, marginBottom: 0 }}>Next step in the finished system: check availability for this equipment, then send the request to the admin dashboard for confirmation.</p>
      </section>}
    </div>
  );
}
