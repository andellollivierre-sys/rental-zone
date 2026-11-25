import React, { useState } from 'react';

const ITEMS = {
  pressure_washer: {
    name: 'Pressure Washer',
    detail: 'For driveways, vehicles, walls and outdoor cleaning',
    questions: [
      { label: 'What do you need to clean?', placeholder: 'e.g. driveway, house exterior, vehicle' },
      { label: 'Approximate size of the area', placeholder: 'e.g. 2-car driveway' }
    ]
  },
  generator: {
    name: 'Generator',
    detail: 'For backup power, events and work sites',
    questions: [
      { label: 'What do you need to power?', placeholder: 'e.g. lights, sound system, appliances' },
      { label: 'What equipment will be connected?', placeholder: 'List the items if known' }
    ]
  }
};

export default function BookingPreview() {
  const [item, setItem] = useState('pressure_washer');
  const [sent, setSent] = useState(false);
  const selected = ITEMS[item];

  if (sent) {
    return (
      <section style={{ padding: '28px 20px', fontFamily: 'system-ui, sans-serif', color: '#0f172a' }}>
        <div style={{ maxWidth: 560, margin: '0 auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 28, textAlign: 'center' }}>
          <div style={{ fontSize: 36 }}>✓</div>
          <h2 style={{ margin: '10px 0 6px' }}>Preview request complete</h2>
          <p style={{ color: '#64748b' }}>This is a design preview. Nothing has been sent or saved.</p>
          <button onClick={() => setSent(false)} style={{ marginTop: 12, padding: '12px 18px', border: 0, borderRadius: 9, background: '#0f172a', color: '#fff', fontWeight: 700 }}>Back to form</button>
        </div>
      </section>
    );
  }

  const field = { width: '100%', boxSizing: 'border-box', padding: '12px 13px', border: '1px solid #cbd5e1', borderRadius: 9, background: '#fff', color: '#0f172a', font: 'inherit' };
  const label = { display: 'block', marginBottom: 7, fontSize: 13, fontWeight: 700, color: '#334155' };

  return (
    <section style={{ padding: '26px 16px 40px', fontFamily: 'system-ui, sans-serif', color: '#0f172a' }}>
      <div style={{ maxWidth: 620, margin: '0 auto' }}>
        <div style={{ marginBottom: 20 }}>
          <p style={{ color: '#0d9488', fontWeight: 800, fontSize: 12, letterSpacing: 1, margin: '0 0 7px' }}>EQUIPMENT RENTAL</p>
          <h1 style={{ fontSize: 28, lineHeight: 1.15, margin: '0 0 8px' }}>Book equipment</h1>
          <p style={{ margin: 0, color: '#64748b', lineHeight: 1.5 }}>Choose what you need and tell us when and where. We’ll confirm availability and the rental price with you.</p>
        </div>

        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 18, boxShadow: '0 8px 24px rgba(15,23,42,.05)' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={label}>1. Select equipment</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {Object.entries(ITEMS).map(([key, value]) => (
                <button key={key} type="button" onClick={() => setItem(key)} style={{ textAlign: 'left', padding: 14, borderRadius: 11, border: item === key ? '2px solid #0d9488' : '1px solid #cbd5e1', background: item === key ? '#f0fdfa' : '#fff', cursor: 'pointer', color: '#0f172a' }}>
                  <span style={{ display: 'block', fontWeight: 800, marginBottom: 5 }}>{value.name}</span>
                  <span style={{ display: 'block', color: '#64748b', fontSize: 12, lineHeight: 1.4 }}>{value.detail}</span>
                  <span style={{ display: 'block', color: '#0d9488', fontSize: 12, fontWeight: 800, marginTop: 10 }}>{item === key ? 'SELECTED ✓' : 'SELECT'}</span>
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 18, marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, margin: '0 0 14px' }}>2. Rental details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={label}>Preferred date</label><input type="date" style={field} /></div>
              <div><label style={label}>Preferred start time</label><input type="time" style={field} /></div>
            </div>
            <div style={{ marginTop: 13 }}><label style={label}>How long do you need it?</label><input placeholder="e.g. 1 day, 2 days, or not sure" style={field} /></div>
            {selected.questions.map((q) => <div key={q.label} style={{ marginTop: 13 }}><label style={label}>{q.label}</label><input placeholder={q.placeholder} style={field} /></div>)}
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 18, marginBottom: 18 }}>
            <h3 style={{ fontSize: 16, margin: '0 0 14px' }}>3. Delivery location</h3>
            <div><label style={label}>Address / area</label><input placeholder="Where should we deliver?" style={field} /></div>
            <p style={{ color: '#64748b', fontSize: 12, margin: '8px 0 0' }}>Delivery fee, if applicable, will be confirmed with your quote.</p>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 18 }}>
            <h3 style={{ fontSize: 16, margin: '0 0 14px' }}>4. Your contact details</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div><label style={label}>Full name</label><input placeholder="Your name" style={field} /></div>
              <div><label style={label}>Phone / WhatsApp</label><input placeholder="Your number" style={field} /></div>
            </div>
            <div style={{ marginTop: 13 }}><label style={label}>Anything else we should know? (optional)</label><textarea rows="3" placeholder="Access instructions or other details" style={{ ...field, resize: 'vertical' }} /></div>
          </div>

          <button type="button" onClick={() => setSent(true)} style={{ width: '100%', marginTop: 20, padding: 14, border: 0, borderRadius: 10, background: '#0f766e', color: '#fff', fontSize: 15, fontWeight: 800, cursor: 'pointer' }}>Request this booking</button>
          <p style={{ textAlign: 'center', color: '#64748b', fontSize: 12, lineHeight: 1.5, margin: '12px 4px 0' }}>Submitting a request does not confirm the booking. The Rental Zone will check that this specific item is available and contact you with the price and delivery details.</p>
        </div>
      </div>
    </section>
  );
}
