import React from 'react';

const wa = (message) => 'https://wa.me/18682810670?text=' + encodeURIComponent(message);

const items = [
  {
    title: 'DJ & Sound Services',
    tag: 'Event partner',
    image: 'https://images.unsplash.com/photo-1755428201027-5add2402efed?auto=format&fit=crop&w=1200&q=80',
    alt: 'DJ performing at a music event',
    description: 'Music and sound options for birthdays, family gatherings and celebrations.',
    note: 'Provider, package and availability confirmed on enquiry',
    action: 'Enquire about a DJ',
    href: wa('Hi The Rental Zone, I am planning an event and would like to enquire about DJ and sound services.')
  },
  {
    title: 'Food Catering',
    tag: 'Event partner',
    image: 'https://images.unsplash.com/photo-1773040835762-ace903c83f36?auto=format&fit=crop&w=1200&q=80',
    alt: 'Food being served at a catered buffet',
    description: 'Catering options to help take care of food for your guests.',
    note: 'Menus, pricing and availability confirmed on enquiry',
    action: 'Enquire about catering',
    href: wa('Hi The Rental Zone, I am planning an event and would like to enquire about food catering.')
  },
  {
    title: 'Tables, Chairs & Tents',
    tag: 'Other event rentals',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    alt: 'Event venue arranged for a celebration',
    description: 'Ask about additional equipment and setup items for your event.',
    note: 'Examples only — supplier and availability not yet confirmed',
    action: 'Ask about event rentals',
    href: wa('Hi The Rental Zone, I would like to ask about tables, chairs, tents and other event rentals.')
  }
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
  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <span style={styles.eyebrow}>The Rental Zone · More Services</span>
        <h1 style={{ margin: '14px 0 9px', maxWidth: 520, fontSize: 'clamp(28px,6vw,40px)', lineHeight: 1.08, fontWeight: 950, letterSpacing: -1 }}>
          More than a bouncy castle.
        </h1>
        <p style={{ margin: 0, maxWidth: 520, color: '#dbeafe', fontSize: 14, lineHeight: 1.65 }}>
          Explore additional rentals and event services. Send one enquiry and we’ll help you check the options.
        </p>
        <a href={wa('Hi The Rental Zone, I am planning an event and would like help with the services I need.')} target="_blank" rel="noopener noreferrer" style={{ ...styles.button, display: 'inline-block', marginTop: 17, background: '#38bdf8', color: '#082f49' }}>
          Tell us about your event →
        </a>
      </section>

      <h2 style={{ margin: '25px 0 5px', fontSize: 22, fontWeight: 900 }}>Explore services</h2>
      <p style={{ margin: 0, color: '#64748b', fontSize: 13, lineHeight: 1.55 }}>
        Choose a category to enquire. We’ll confirm the provider, details and availability before you commit.
      </p>

      <div style={styles.grid}>
        {items.map((item) => (
          <article key={item.title} style={styles.card}>
            <img src={item.image} alt={item.alt} loading="lazy" style={{ width: '100%', height: 155, objectFit: 'cover', display: 'block', background: '#e2e8f0' }} />
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ color: '#2563eb', fontSize: 10, fontWeight: 900, letterSpacing: .8, textTransform: 'uppercase' }}>{item.tag}</span>
              <h3 style={{ margin: '6px 0 7px', fontSize: 18, fontWeight: 900 }}>{item.title}</h3>
              <p style={{ margin: '0 0 10px', color: '#475569', fontSize: 13, lineHeight: 1.55 }}>{item.description}</p>
              <p style={{ margin: '0 0 13px', color: '#64748b', fontSize: 11, lineHeight: 1.45 }}>{item.note}</p>
              <a href={item.href} target="_blank" rel="noopener noreferrer" style={styles.button}>{item.action} →</a>
            </div>
          </article>
        ))}
      </div>

      <section style={{ marginTop: 20, padding: 16, borderRadius: 14, background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
        <strong style={{ fontSize: 15 }}>Need a generator or pressure washer?</strong>
        <p style={{ margin: '5px 0 11px', color: '#475569', fontSize: 12, lineHeight: 1.5 }}>Those equipment rentals are featured on our homepage.</p>
        <a href="#home" style={{ color: '#1d4ed8', fontSize: 13, fontWeight: 850, textDecoration: 'none' }}>Back to homepage →</a>
      </section>

      <p style={{ margin: '15px 3px 0', color: '#64748b', fontSize: 10, lineHeight: 1.5, textAlign: 'center' }}>
        DJ, catering and additional event-rental providers are enquiry categories, not confirmed bookings. Images are illustrative previews.
      </p>
    </div>
  );
}
