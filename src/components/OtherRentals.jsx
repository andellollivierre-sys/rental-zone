import React from 'react';

const PARTNER_PHOTO_PATHS = {
  catering: null, // Add the real partner photo path when supplied
  rentals: null, // Add the real partner photo path when supplied
  dj: null // Add the real partner photo path when supplied
};

const whatsapp = (message, partner = 'general') =>
  `https://wa.me/18682810670?text=${encodeURIComponent(message)}&utm_source=other-rentals&utm_content=${encodeURIComponent(partner)}`;

const featuredGroups = [
  {
    id: 'catering',
    eyebrow: 'SOPHIE’S CATERING · COOKED WITH LOVE',
    title: 'Catering Services',
    description: 'Make hosting easier with food and refreshments for celebrations, family gatherings and corporate events.',
    partner: 'Sophie’s Catering Services',
    icon: '🍽️',
    photoPath: PARTNER_PHOTO_PATHS.catering,
    headerClass: 'or-brand-catering',
    items: [
      { name: 'Buffet & Meal Service', detail: 'A range of menu options for your guest list.' },
      { name: 'Finger Foods & Appetizers', detail: 'Easy-to-serve bites for parties and receptions.' },
      { name: 'Dessert & Refreshment Tables', detail: 'A sweet finish and refreshment options for your event.' }
    ]
  },
  {
    id: 'rentals',
    eyebrow: 'ANDREW NOEL · EVENT RENTALS',
    title: 'Events & Equipment Rentals',
    description: 'The practical essentials to help transform a venue, yard or outdoor space into an event-ready setting.',
    partner: 'Andrew Noel',
    icon: '🎪',
    photoPath: PARTNER_PHOTO_PATHS.rentals,
    headerClass: 'or-brand-rentals',
    items: [
      { name: 'Tables & Chairs', detail: 'Guest seating and table arrangements in different styles.' },
      { name: 'Tents & Canopies', detail: 'Covered space options for outdoor occasions.' },
      { name: 'Linens & Table Settings', detail: 'Finishing touches for a coordinated event setup.' }
    ]
  },
  {
    id: 'dj',
    eyebrow: 'ANDREW NOEL · DJ SERVICES',
    title: 'DJ & Event Entertainment',
    description: 'Bring the celebration to life with DJ services for parties, family celebrations and special events.',
    partner: 'Andrew Noel',
    icon: '🎧',
    photoPath: PARTNER_PHOTO_PATHS.dj,
    headerClass: 'or-brand-dj',
    items: [
      { name: 'DJ Bookings', detail: 'Music and entertainment for your event.' },
      { name: 'Music Selection', detail: 'Discuss the music and atmosphere you want for your occasion.' },
      { name: 'Event Schedule', detail: 'Coordinate performance timing around your programme.' }
    ]
  }
];

export default function OtherRentals() {
  return (
    <div className="other-rentals-page">
      <style>{`
        .other-rentals-page { color: #0f172a; font-family: system-ui, sans-serif; padding: 0 0 42px; }
        .or-hero { padding: 54px 22px 46px; text-align: center; background: linear-gradient(135deg,#eff6ff 0%,#f8fafc 55%,#ecfeff 100%); border-bottom: 1px solid #e2e8f0; }
        .or-kicker { display: inline-flex; align-items: center; border-radius: 999px; padding: 7px 13px; background: #dbeafe; color: #075985; font-size: 11px; font-weight: 800; letter-spacing: .11em; }
        .or-hero h1 { margin: 17px auto 12px; max-width: 650px; font-size: clamp(32px,6vw,46px); line-height: 1.08; letter-spacing: -.04em; }
        .or-hero p { max-width: 570px; margin: 0 auto; color: #475569; font-size: 16px; line-height: 1.7; }
        .or-hero-actions { display: flex; justify-content: center; flex-wrap: wrap; gap: 10px; margin-top: 24px; }
        .or-button { display: inline-flex; justify-content: center; align-items: center; min-height: 46px; padding: 0 20px; border-radius: 10px; text-decoration: none; font-weight: 800; font-size: 14px; transition: transform .18s ease, box-shadow .18s ease; }
        .or-button:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(15,23,42,.13); }
        .or-button-primary { color: white; background: #2563eb; }
        .or-button-secondary { color: #0f172a; background: white; border: 1px solid #cbd5e1; }
        .or-section { padding: 38px 20px 8px; }
        .or-section-heading { margin-bottom: 20px; }
        .or-section-heading span { color: #2563eb; font-size: 11px; font-weight: 900; letter-spacing: .12em; }
        .or-section-heading h2 { margin: 7px 0 7px; font-size: 27px; letter-spacing: -.025em; }
        .or-section-heading p { margin: 0; color: #64748b; line-height: 1.6; font-size: 14px; }
        .or-feature-grid { display: grid; grid-template-columns: repeat(3,minmax(0,1fr)); gap: 18px; }
        .or-feature-card { overflow: hidden; border: 1px solid #e2e8f0; border-radius: 17px; background: white; box-shadow: 0 8px 24px rgba(15,23,42,.055); }
        .or-partner-header { height: 150px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 9px; color: white; text-align: center; }
        .or-partner-header-icon { font-size: 27px; line-height: 1; }
        .or-partner-header-name { font-size: 14px; font-weight: 850; letter-spacing: .02em; }
        .or-partner-photo { width: 100%; height: 150px; object-fit: cover; display: block; }
        .or-brand-catering { background: linear-gradient(135deg,#7c2d12,#c2410c); }
        .or-brand-rentals { background: linear-gradient(135deg,#1e3a8a,#2563eb); }
        .or-brand-dj { background: linear-gradient(135deg,#312e81,#7c3aed); }
        .or-feature-body { padding: 18px; }
        .or-eyebrow { color: #2563eb; font-size: 10px; font-weight: 900; letter-spacing: .12em; }
        .or-feature-body h3 { margin: 6px 0 8px; font-size: 21px; letter-spacing: -.02em; }
        .or-feature-body > p { margin: 0 0 15px; color: #64748b; font-size: 13px; line-height: 1.6; min-height: 62px; }
        .or-item-list { display: grid; gap: 10px; margin: 0 0 18px; padding: 0; list-style: none; }
        .or-item-list li { padding-top: 10px; border-top: 1px solid #f1f5f9; }
        .or-item-list strong { display: block; font-size: 13px; }
        .or-item-list small { display: block; margin-top: 3px; color: #64748b; font-size: 11px; line-height: 1.45; }
        .or-quote { width: 100%; box-sizing: border-box; }
        .or-bottom-cta { margin: 34px 20px 0; padding: 27px 20px; border-radius: 18px; background: #0f172a; color: white; text-align: center; }
        .or-bottom-cta h2 { margin: 0 0 8px; font-size: 24px; }
        .or-bottom-cta p { max-width: 490px; margin: 0 auto 18px; color: #cbd5e1; font-size: 13px; line-height: 1.6; }
        .or-bottom-cta .or-button { background: #22c55e; color: #052e16; }
        @media (max-width: 620px) {
          .or-hero { padding: 42px 18px 36px; }
          .or-feature-grid { grid-template-columns: 1fr; }
          .or-partner-header, .or-partner-photo { height: 165px; }
          .or-feature-body > p { min-height: 0; }
                }
      `}</style>

      <header className="or-hero">
        <span className="or-kicker">MORE WAYS TO MAKE YOUR EVENT SPECIAL</span>
        <h1>More Than Rentals.<br />Everything for Your Event.</h1>
        <p>Explore Andrew Noel’s event planning, DJ and rental services, alongside Sophie’s Catering Services — Cooked with Love. Find more of what you need for your event in one place.</p>
        <div className="or-hero-actions">
          <a className="or-button or-button-primary" href={whatsapp('Hi The Rental Zone, I would like information about your Other Rentals and event services.', 'general')}>Enquire About Services</a>
          <a className="or-button or-button-secondary" href="#other-rental-categories">Explore Services</a>
        </div>
      </header>

      <section className="or-section" id="other-rental-categories">
        <div className="or-section-heading">
          <span>EXPLORE THE COLLECTION</span>
          <h2>Services & Event Essentials</h2>
          <p>Explore the services and sample offerings below. Product photos, packages and availability can be confirmed directly with the provider.</p>
        </div>
        <div className="or-feature-grid">
          {featuredGroups.map((group) => (
            <article className="or-feature-card" key={group.id}>
              {group.photoPath ? (
                <img className="or-partner-photo" src={group.photoPath} alt={`${group.partner} partner-provided work`} loading="lazy" />
              ) : (
                <div className={`or-partner-header ${group.headerClass}`} aria-label={`${group.partner} service listing`}>
                  <span className="or-partner-header-icon" aria-hidden="true">{group.icon}</span>
                  <span className="or-partner-header-name">{group.partner}</span>
                </div>
              )}
              <div className="or-feature-body">
                <span className="or-eyebrow">{group.eyebrow}</span>
                <h3>{group.title}</h3>
                <p>{group.description}</p>
                <ul className="or-item-list">
                  {group.items.map((item) => (
                    <li key={item.name}>
                      <strong>{item.name}</strong>
                      <small>{item.detail}</small>
                    </li>
                  ))}
                </ul>
                <a className="or-button or-button-primary or-quote" href={whatsapp(`Hi, I'd like a quote for ${group.id === 'dj' ? 'DJ services' : group.id === 'catering' ? 'catering services' : 'event rentals'}.`, group.id)}>Request a Quote</a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="or-bottom-cta">
        <h2>Looking for Something Specific?</h2>
        <p>Tell us what you're planning and what you need. We'll help direct your enquiry to the right service provider.</p>
        <a className="or-button" href={whatsapp('Hi The Rental Zone, I am planning an event and would like to ask about your other rental and event services.', 'general')}>Contact Us on WhatsApp</a>
      </section>
    </div>
  );
}
