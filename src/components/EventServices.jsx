import React from 'react';

const WHATSAPP = 'https://wa.me/18682810670?text=';

const services = [
  {
    number: '01',
    icon: '🏰',
    title: 'Bouncy Castle Rentals',
    type: 'The Rental Zone',
    description: 'Bring the fun to birthdays, family days and children’s events with our Spider-Man Combo Bouncer.',
    detail: 'Our own rental service',
    action: 'Book the bouncy castle',
    href: '#booking',
    featured: true,
  },
  {
    number: '02',
    icon: '🎧',
    title: 'DJ & Sound Services',
    type: 'Event partner category',
    description: 'Explore DJ and sound options to keep your guests entertained, from intimate gatherings to larger celebrations.',
    detail: 'Provider and availability confirmed on enquiry',
    action: 'Enquire about a DJ',
    href: WHATSAPP + encodeURIComponent('Hi The Rental Zone, I am planning an event and would like information about DJ and sound services.'),
  },
  {
    number: '03',
    icon: '🍽️',
    title: 'Food Catering',
    type: 'Event partner category',
    description: 'Make feeding your guests easier with catering options for birthdays, family gatherings and special occasions.',
    detail: 'Menus, pricing and availability confirmed on enquiry',
    action: 'Enquire about catering',
    href: WHATSAPP + encodeURIComponent('Hi The Rental Zone, I am planning an event and would like information about food catering.'),
  },
  {
    number: '04',
    icon: '🎪',
    title: 'Other Event Rentals',
    type: 'More options',
    description: 'Looking for tables, chairs, tents, coolers or other event essentials? Tell us what you need.',
    detail: 'Examples only — availability is not yet confirmed',
    action: 'Ask about other rentals',
    href: WHATSAPP + encodeURIComponent('Hi The Rental Zone, I am planning an event and would like to ask about other event rentals such as tables, chairs or tents.'),
  },
];

const styles = {
  page: { padding: '22px 16px 34px', color: '#0f172a', fontFamily: 'system-ui, sans-serif' },
  hero: { position: 'relative', overflow: 'hidden', padding: '30px 22px', borderRadius: '22px', color: '#fff', background: 'linear-gradient(135deg, #0f172a 0%, #172554 58%, #075985 100%)', boxShadow: '0 16px 36px rgba(15,23,42,.18)' },
  eyebrow: { display: 'inline-block', padding: '6px 10px', borderRadius: '999px', background: 'rgba(125,211,252,.14)', color: '#bae6fd', fontSize: '10px', fontWeight: 900, letterSpacing: '1px', textTransform: 'uppercase' },
  heroTitle: { margin: '15px 0 10px', maxWidth: '560px', fontSize: 'clamp(29px, 6vw, 42px)', lineHeight: 1.08, fontWeight: 950, letterSpacing: '-1px' },
  heroText: { margin: 0, maxWidth: '520px', color: '#dbeafe', fontSize: '14px', lineHeight: 1.7 },
  sectionTitle: { margin: '28px 0 7px', fontSize: '22px', lineHeight: 1.2, fontWeight: 900 },
  muted: { color: '#64748b', fontSize: '13px', lineHeight: 1.65 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '14px', marginTop: '17px' },
  card: { display: 'flex', flexDirection: 'column', padding: '19px', border: '1px solid #e2e8f0', borderRadius: '17px', background: '#fff', boxShadow: '0 5px 18px rgba(15,23,42,.05)' },
  icon: { display: 'grid', placeItems: 'center', width: '50px', height: '50px', marginBottom: '15px', borderRadius: '14px', background: '#eff6ff', fontSize: '27px' },
  label: { color: '#2563eb', fontSize: '10px', fontWeight: 900, letterSpacing: '.8px', textTransform: 'uppercase' },
  cardTitle: { margin: '7px 0 8px', fontSize: '19px', fontWeight: 900 },
  cardText: { margin: '0 0 14px', color: '#475569', fontSize: '13px', lineHeight: 1.65, flex: 1 },
  detail: { margin: '0 0 14px', color: '#64748b', fontSize: '11px', lineHeight: 1.45 },
  button: { display: 'block', padding: '12px 13px', borderRadius: '10px', background: '#0f172a', color: '#fff', textAlign: 'center', textDecoration: 'none', fontSize: '13px', fontWeight: 850 },
};

export default function EventServices() {
  return (
    <div style={styles.page}>
      <section style={styles.hero}>
        <span style={styles.eyebrow}>The Rental Zone · Event Services</span>
        <h1 style={styles.heroTitle}>Plan the event.<br />Find the services.</h1>
        <p style={styles.heroText}>
          From bouncy castle fun to DJs, catering and other event rentals, start with one enquiry and let us help you organise the pieces.
        </p>
        <a href={WHATSAPP + encodeURIComponent('Hi The Rental Zone, I am planning an event and would like help finding the services I need.')} style={{ ...styles.button, display: 'inline-block', marginTop: '19px', background: '#38bdf8', color: '#082f49' }}>
          Tell us about your event →
        </a>
      </section>

      <section aria-labelledby="event-services-list">
        <h2 id="event-services-list" style={styles.sectionTitle}>Explore event services</h2>
        <p style={{ ...styles.muted, margin: 0 }}>
          Choose what you need. We’ll confirm the details and availability before you make a booking.
        </p>
        <div style={styles.grid}>
          {services.map((service) => (
            <article key={service.number} style={{ ...styles.card, borderColor: service.featured ? '#93c5fd' : '#e2e8f0' }}>
              <div style={{ ...styles.icon, background: service.featured ? '#dbeafe' : '#f1f5f9' }} aria-hidden="true">{service.icon}</div>
              <div style={styles.label}>{service.type}</div>
              <h3 style={styles.cardTitle}>{service.title}</h3>
              <p style={styles.cardText}>{service.description}</p>
              <p style={styles.detail}>{service.detail}</p>
              <a href={service.href} target={service.href.startsWith('https://') ? '_blank' : undefined} rel={service.href.startsWith('https://') ? 'noopener noreferrer' : undefined} style={{ ...styles.button, background: service.featured ? '#1d4ed8' : '#0f172a' }}>
                {service.action} →
              </a>
            </article>
          ))}
        </div>
      </section>

      <section style={{ marginTop: '24px', padding: '19px', borderRadius: '16px', background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: '17px', fontWeight: 900 }}>How it works</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '13px' }}>
          <div><strong style={{ display: 'block', fontSize: '13px' }}>1. Send your enquiry</strong><span style={styles.muted}>Tell us the service, date and location.</span></div>
          <div><strong style={{ display: 'block', fontSize: '13px' }}>2. We check options</strong><span style={styles.muted}>We confirm which providers and services are available.</span></div>
          <div><strong style={{ display: 'block', fontSize: '13px' }}>3. Confirm directly</strong><span style={styles.muted}>Review the details and agree on pricing before booking.</span></div>
        </div>
      </section>

      <p style={{ margin: '16px 4px 0', color: '#64748b', fontSize: '11px', lineHeight: 1.6, textAlign: 'center' }}>
        Partner categories are a preview. DJ, catering and other-rental providers, prices and availability are not yet confirmed. The Rental Zone’s bouncy castle is our own listed service.
      </p>
    </div>
  );
}
