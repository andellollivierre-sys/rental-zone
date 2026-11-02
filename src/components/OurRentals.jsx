import React from 'react';

const rentals = [
  {
    title: 'Spider-Man Combo Bouncer',
    description: 'A complete party setup with a bounce area, climbing section and attached dry slide.',
    detail: '2 hours: TT$650 • 3 hours: TT$900 • Full day: TT$1,800',
    image: '/featured image.jpg',
    imageAlt: 'Spider-Man Combo Bouncer',
    href: '#our-bouncer',
    action: 'View Bouncer Details'
  },
  {
    title: 'Bubble Machine',
    description: 'Add a stream of bubbles to your event or rent the machine on its own.',
    detail: 'Standalone: TT$250 for 3 hours • Bouncer add-on: TT$200 for 3 hours. Bubble liquid included.',
    image: 'https://bouncycastlenetwork-res.cloudinary.com/image/upload/f_auto%2Cq_auto%2Cc_limit%2Cw_900/aa6f1ad7b094ff9dfda6d260a87e54b1',
    imageAlt: 'Bubble machine producing bubbles',
    href: '#booking',
    action: 'Enquire / Book'
  }
];

export default function OurRentals() {
  return (
    <div style={{ width: '100%', padding: '30px 18px 44px', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif', color: '#0f172a' }}>
      <header style={{ marginBottom: 24 }}>
        <p style={{ margin: '0 0 8px', color: '#0284c7', fontWeight: 900, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>The Rental Zone TT</p>
        <h1 style={{ margin: 0, fontSize: 'clamp(32px, 7vw, 44px)', lineHeight: 1.05, fontWeight: 950, letterSpacing: '-0.04em' }}>Our Rentals</h1>
        <p style={{ margin: '12px 0 0', color: '#64748b', fontSize: 16, lineHeight: 1.6 }}>Explore the rentals available for your next party or event.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 16 }}>
        {rentals.map((item) => (
          <article key={item.title} style={{ border: '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', background: '#ffffff', boxShadow: '0 5px 18px rgba(15,23,42,0.06)' }}>
            <div style={{ width: '100%', height: 210, background: '#f1f5f9', overflow: 'hidden' }}>
              <img
                src={item.image}
                alt={item.imageAlt}
                loading="lazy"
                style={{ display: 'block', width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ padding: 18 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 21, fontWeight: 900 }}>{item.title}</h2>
              <p style={{ margin: '0 0 10px', color: '#475569', fontSize: 14, lineHeight: 1.55 }}>{item.description}</p>
              <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>{item.detail}</p>
              <a href={item.href} style={{ display: 'block', textAlign: 'center', padding: '12px 14px', borderRadius: 11, background: '#0284c7', color: '#ffffff', textDecoration: 'none', fontWeight: 850, fontSize: 14 }}>{item.action}</a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
