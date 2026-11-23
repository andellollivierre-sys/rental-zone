import React from 'react';
import { trackTrzEvent } from '../utils/trzTracker';

const WHATSAPP = 'https://wa.me/18682810670';
const messageLink = (message) => `${WHATSAPP}?text=${encodeURIComponent(message)}`;

const items = [
  {
    key: 'bouncy-castle',
    title: 'Spider-Man Bouncy Castle',
    tag: 'Our rental',
    image: '/featured image.jpg',
    alt: 'Spider-Man combo bouncy castle',
    description: 'Bounce, climb and slide for birthdays and family events.',
    note: 'View our bouncy castle page for prices and booking.',
    detail: 'Our existing bouncy castle page and booking process stay unchanged.',
    href: '#our-bouncer',
    action: 'View bouncy castle',
    kind: 'internal'
  },
  {
    key: 'pressure-washer',
    title: 'Pressure Washer Rental',
    tag: 'Our equipment',
    image: 'https://a-ipower.com/cdn/shop/products/PWF2701SH_R_3QTR_L_2000_2000.png?v=1630521306',
    alt: 'Pressure washing equipment',
    description: 'Rent a pressure washer for your cleaning project.',
    note: 'TT$300 per day',
    detail: 'Customer collects and returns the equipment.',
    message: "Hi, I'd like to rent the pressure washer at TT$300 per day. Is it available, and when can I collect it?",
    action: 'Check availability & arrange rental',
    kind: 'whatsapp'
  },
  {
    key: 'generator',
    title: 'Generator Rental',
    tag: 'Supplier arranged',
    image: 'https://res-de.togroup.com/stc/home_product/emtop/userfiles/1/images/photo/20241011190136894/EGGRD2822.jpg',
    alt: 'Portable generator equipment',
    description: 'We can check with our supplier and arrange a generator for your needs.',
    note: 'TT$400 per day',
    detail: 'We arrange availability and delivery through our supplier.',
    message: "Hi, I'd like to arrange a generator rental at TT$400 per day. Can you check availability and delivery?",
    action: 'Check availability & arrange rental',
    kind: 'whatsapp'
  },
  {
    key: 'catering',
    title: 'Food Catering',
    tag: 'Catering partner',
    image: 'https://images.unsplash.com/photo-1773040835762-ace903c83f36?auto=format&fit=crop&w=1200&q=80',
    alt: 'Food being served at a catered buffet',
    description: 'Catering options for birthdays, family events and gatherings.',
    note: 'Ask for menu options and a quotation',
    detail: 'Pricing depends on your menu, guest count and service requirements.',
    message: "Hi, I'm enquiring about food catering. Can you help with options and a quotation?",
    action: 'WhatsApp to enquire',
    kind: 'whatsapp'
  },
  {
    key: 'dj-sound',
    title: 'DJ & Sound Services',
    tag: 'Event partner',
    image: 'https://images.unsplash.com/photo-1755428201027-5add2402efed?auto=format&fit=crop&w=1200&q=80',
    alt: 'DJ performing at a music event',
    description: 'Music and sound options for birthdays and celebrations.',
    note: 'Ask for availability and pricing',
    detail: 'Packages and pricing depend on your event requirements.',
    message: "Hi, I'm enquiring about DJ and sound services. Can you share availability and pricing?",
    action: 'WhatsApp to enquire',
    kind: 'whatsapp'
  },
  {
    key: 'tents-tables-chairs',
    title: 'Tents, Tables & Chairs',
    tag: 'Rental partner',
    image: 'https://images.pexels.com/photos/8392460/pexels-photo-8392460.jpeg?auto=compress&cs=tinysrgb&w=1200',
    alt: 'Outdoor event tent with tables and chairs arranged underneath',
    description: 'Additional equipment and setup items for your event.',
    note: 'Ask for availability and pricing',
    detail: 'Quotation depends on quantities, location and setup requirements.',
    message: "Hi, I'm enquiring about tents, tables and chairs. Can you help with availability and pricing?",
    action: 'WhatsApp to enquire',
    kind: 'whatsapp'
  },
  {
    key: 'decor',
    title: 'Event Décor',
    tag: 'Event partner',
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80',
    alt: 'Decorated event celebration space',
    description: 'Décor ideas and styling for your celebration or special event.',
    note: 'Ask for options and a quotation',
    detail: 'Pricing depends on the theme, venue and décor requirements.',
    message: "Hi, I'm enquiring about event décor. Can you share options, availability and pricing?",
    action: 'WhatsApp to enquire',
    kind: 'whatsapp'
  },
  {
    key: 'event-package',
    title: 'Plan My Event',
    tag: 'Multiple services',
    image: 'https://storage.yandexcloud.net/wedding-article/abfb8fa3-c8f7-44cb-8e66-043c0e923282',
    alt: 'Event planning workspace with schedule and design references',
    description: 'Need more than one service? Start with us and we will help coordinate the enquiries.',
    note: 'One conversation with The Rental Zone',
    detail: 'Tell us what you are planning and we will take it from there.',
    message: "Hi, I'm planning an event and would like help coordinating a few services.",
    action: 'WhatsApp to plan my event',
    kind: 'whatsapp'
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
        <span style={styles.eyebrow}>The Rental Zone · Rentals & Event Services</span>
        <h1 style={{ margin: '14px 0 9px', maxWidth: 560, fontSize: 'clamp(28px,6vw,40px)', lineHeight: 1.08, fontWeight: 950, letterSpacing: -1 }}>
          One place to organise your event.
        </h1>
        <p style={{ margin: 0, maxWidth: 560, color: '#dbeafe', fontSize: 14, lineHeight: 1.65 }}>
          See prices where available. For services arranged through our partners, contact The Rental Zone and we will check the options and get back to you.
        </p>
      </section>

      <h2 style={{ margin: '25px 0 5px', fontSize: 22, fontWeight: 900 }}>Explore rentals & services</h2>
      <p style={{ margin: 0, color: '#64748b', fontSize: 13, lineHeight: 1.55 }}>
        The bouncy castle keeps its existing page and booking process. For other services, WhatsApp us directly.
      </p>

      <div style={styles.grid}>
        {items.map((item) => (
          <article key={item.key} style={styles.card}>
            <img src={item.image} alt={item.alt} loading="lazy" style={{ width: '100%', height: 180, objectFit: (item.key === 'pressure-washer' || item.key === 'generator') ? 'contain' : 'cover', display: 'block', background: (item.key === 'pressure-washer' || item.key === 'generator') ? '#f8fafc' : '#e2e8f0', padding: (item.key === 'pressure-washer' || item.key === 'generator') ? 8 : 0, boxSizing: 'border-box' }} />
            <div style={{ padding: 14, display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ color: '#2563eb', fontSize: 10, fontWeight: 900, letterSpacing: .8, textTransform: 'uppercase' }}>{item.tag}</span>
              <h3 style={{ margin: '6px 0 7px', fontSize: 18, fontWeight: 900 }}>{item.title}</h3>
              <p style={{ margin: '0 0 10px', color: '#475569', fontSize: 13, lineHeight: 1.55 }}>{item.description}</p>
              <p style={{ margin: '0 0 7px', color: '#0f172a', fontSize: 12, fontWeight: 850 }}>{item.note}</p>
              <p style={{ margin: '0 0 13px', color: '#64748b', fontSize: 11, lineHeight: 1.45 }}>{item.detail}</p>
              <a
                href={item.kind === 'internal' ? item.href : messageLink(item.message)}
                target={item.kind === 'internal' ? undefined : '_blank'}
                rel={item.kind === 'internal' ? undefined : 'noopener noreferrer'}
                onClick={() => {
                  if (item.kind === 'whatsapp') {
                    trackTrzEvent('whatsapp_clicked', { service_name: item.title });
                  }
                }}
                style={styles.button}
              >
                {item.action} →
              </a>
            </div>
          </article>
        ))}
      </div>

      <p style={{ margin: '15px 3px 0', color: '#64748b', fontSize: 10, lineHeight: 1.5, textAlign: 'center' }}>
        Partner-service availability and prices are confirmed before a booking is accepted.
      </p>
    </div>
  );
}
