import React, { useState } from 'react';
import ServiceEnquiryForm from './ServiceEnquiryForm';

const items = [
  { key:'bouncy-castle', title:'Spider-Man Bouncy Castle', tag:'Our rental', image:'/featured image.jpg', alt:'Spider-Man combo bouncy castle', description:'Bounce, climb and slide for birthdays and family events.', note:'2 hours TT$650 · 8 hours TT$1,800', action:'Enquire about the bouncy castle', delivery:'Delivery included where confirmed.' },
  { key:'pressure-washer', title:'Pressure Washer Rental', tag:'Our equipment', image:'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=1200&q=80', alt:'Pressure washing equipment', description:'Rent a pressure washer for your cleaning project.', note:'TT$250 per day', action:'Enquire about pressure washer', delivery:'Customer collection and return.' },
  { key:'generator', title:'Generator Rental', tag:'Supplier arranged', image:'https://images.unsplash.com/photo-1473341304170-97105b4a2f06?auto=format&fit=crop&w=1200&q=80', alt:'Portable generator equipment', description:'Ask us to arrange a generator for your event or power needs.', note:'Price and availability confirmed by quotation', action:'Request generator quotation', delivery:'Delivery can be arranged and confirmed.' },
  { key:'catering', title:'Food Catering', tag:'Catering partner', image:'https://images.unsplash.com/photo-1773040835762-ace903c83f36?auto=format&fit=crop&w=1200&q=80', alt:'Food being served at a catered buffet', description:'Tell us your menu ideas, guest count and serving requirements.', note:'Menu, supplier pricing and availability confirmed first', action:'Request catering quotation', delivery:'Serving and delivery arrangements confirmed by quote.' },
  { key:'dj-sound', title:'DJ & Sound Services', tag:'Event partner', image:'https://images.unsplash.com/photo-1755428201027-5add2402efed?auto=format&fit=crop&w=1200&q=80', alt:'DJ performing at a music event', description:'Music and sound options for birthdays and celebrations.', note:'Provider, package and availability confirmed on enquiry', action:'Request DJ quotation', delivery:'Details confirmed with provider.' },
  { key:'tents-tables-chairs', title:'Tents, Tables & Chairs', tag:'Rental partner', image:'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80', alt:'Event venue arranged for a celebration', description:'Ask about additional equipment and setup items for your event.', note:'Supplier, quantity and availability confirmed first', action:'Enquire about event rentals', delivery:'Delivery and setup confirmed by quotation.' },
  { key:'event-package', title:'Plan My Event', tag:'Multiple services', image:'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80', alt:'Decorated event celebration space', description:'Need several services? Tell us what you are planning and we will coordinate the enquiries.', note:'One enquiry to The Rental Zone', action:'Build my event enquiry', delivery:'We confirm each service separately.' }
];

const styles = {
  page: { padding: '20px 16px 34px', color: '#0f172a', fontFamily: 'system-ui, sans-serif' },
  hero: { padding: '28px 21px', borderRadius: 20, color: '#fff', background: 'linear-gradient(135deg,#0f172a 0%,#172554 58%,#075985 100%)', boxShadow: '0 14px 30px rgba(15,23,42,.16)' },
  eyebrow: { display: 'inline-block', padding: '6px 10px', borderRadius: 99, background: 'rgba(125,211,252,.16)', color: '#bae6fd', fontSize: 10, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 13, marginTop: 16 },
  card: { overflow: 'hidden', border: '1px solid #e2e8f0', borderRadius: 16, background: '#fff', boxShadow: '0 5px 18px rgba(15,23,42,.05)', display: 'flex', flexDirection: 'column' },
  button: { display: 'block', marginTop: 'auto', padding: '11px 12px', borderRadius: 9, background: '#0f172a', color: '#fff', textAlign: 'center', textDecoration: 'none', fontSize: 12, fontWeight: 850 }
};

export default function EventServices() {
  const [selected, setSelected] = useState('catering');
  const choose = (key) => {
    setSelected(key);
    window.setTimeout(() => document.getElementById('service-enquiry-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0);
  };

  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <span style={styles.eyebrow}>The Rental Zone · Rentals & Event Services</span>
        <h1 style={{ margin: '14px 0 9px', maxWidth: 560, fontSize: 'clamp(28px,6vw,40px)', lineHeight: 1.08, fontWeight: 950, letterSpacing: -1 }}>
          One place to organise your event.
        </h1>
        <p style={{ margin: 0, maxWidth: 560, color: '#dbeafe', fontSize: 14, lineHeight: 1.65 }}>
          Choose what you need and send your requirements directly to The Rental Zone. We check our own rentals or contact the right service provider before coming back with availability and a quote.
        </p>
        <button onClick={() => choose('event-package')} style={{ ...styles.button, display: 'inline-block', marginTop: 17, border: 0, background: '#38bdf8', color: '#082f49', cursor: 'pointer' }}>
          Tell us about your event ↓
        </button>
      </section>

      <h2 style={{ margin: '25px 0 5px', fontSize: 22, fontWeight: 900 }}>Explore rentals & services</h2>
      <p style={{ margin: 0, color: '#64748b', fontSize: 13, lineHeight: 1.55 }}>
        Your enquiry comes to us first. Partner services are not booked or charged through this form.
      </p>

      <div style={styles.grid}>
        {items.map((item) => (
          <article key={item.key} style={styles.card}>
            <img src={item.image} alt={item.alt} loading="lazy" style={{ width: '100%', height: 155, objectFit: 'cover', display: 'block', background: '#e2e8f0' }} />
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ color: '#2563eb', fontSize: 10, fontWeight: 900, letterSpacing: .8, textTransform: 'uppercase' }}>{item.tag}</span>
              <h3 style={{ margin: '6px 0 7px', fontSize: 18, fontWeight: 900 }}>{item.title}</h3>
              <p style={{ margin: '0 0 10px', color: '#475569', fontSize: 13, lineHeight: 1.55 }}>{item.description}</p>
              <p style={{ margin: '0 0 7px', color: '#0f172a', fontSize: 12, fontWeight: 850 }}>{item.note}</p>
              <p style={{ margin: '0 0 13px', color: '#64748b', fontSize: 11, lineHeight: 1.45 }}>{item.delivery}</p>
              <button type="button" onClick={() => choose(item.key)} style={{ ...styles.button, border: 0, cursor: 'pointer' }}>{item.action} →</button>
            </div>
          </article>
        ))}
      </div>

      <ServiceEnquiryForm key={selected} initialService={selected} />

      <p style={{ margin: '15px 3px 0', color: '#64748b', fontSize: 10, lineHeight: 1.5, textAlign: 'center' }}>
        Sending an enquiry does not confirm availability, a booking or a payment. We will contact you after checking the details.
      </p>
    </div>
  );
}
