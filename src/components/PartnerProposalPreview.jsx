import React, { useEffect } from 'react';

const serviceGroups = [
  {
    id: 'rentals',
    number: '01',
    eyebrow: 'YOUR RENTAL BUSINESS',
    title: 'Make your rental inventory easy to discover.',
    description:
      'Give customers one clear place to explore the equipment and rental options you offer, understand the basics, and send an enquiry for their event date.',
    examples: ['Event equipment', 'Tents and canopies', 'Tables and chairs'],
    note: 'Illustrative categories only. Your actual inventory, photos, prices and service areas would be confirmed with you before publishing.',
    icon: '⌂',
    tone: 'blue'
  },
  {
    id: 'food',
    number: '02',
    eyebrow: 'YOUR FOOD BUSINESS',
    title: 'Put your food services in front of event customers.',
    description:
      'Show customers the food options you provide, the type of events you serve, and how to request a menu or catering quote.',
    examples: ['Catering and buffet options', 'Food trays and finger foods', 'Meal packages for events'],
    note: 'Illustrative categories only. Menus, portions, prices, lead times and availability would be confirmed with you before publishing.',
    icon: '✳',
    tone: 'orange'
  }
];

const journey = [
  ['01', 'Customer discovers', 'A customer finds your rental or food services through The Rental Zone website and advertising.'],
  ['02', 'Enquiry is recorded', 'We capture the customer, event date, location and what they are interested in. An enquiry is not yet a booking.'],
  ['03', 'Availability and quote', 'We check with you, confirm availability and agree the customer quote and your price.'],
  ['04', 'Booking is confirmed', 'The customer accepts and you confirm that you can fulfil the job. The booking is recorded as confirmed.'],
  ['05', 'Event is completed', 'The delivery or service is carried out. Completion is checked and recorded after the event.'],
  ['06', 'Payments are reconciled', 'Customer payments, your agreed payout and The Rental Zone’s agreed earnings are recorded separately.']
];

export default function PartnerProposalPreview() {
  useEffect(() => {
    const previousTitle = document.title;
    const robots = document.createElement('meta');
    robots.name = 'robots';
    robots.content = 'noindex, nofollow';
    robots.dataset.partnerProposal = 'true';
    document.head.appendChild(robots);
    document.title = 'Partnership Proposal Preview | The Rental Zone TT';

    return () => {
      robots.remove();
      document.title = previousTitle;
    };
  }, []);

  return (
    <div className="partner-proposal">
      <style>{`
        .partner-proposal { --pp-ink:#102033; --pp-muted:#607084; --pp-line:#e2e8f0; color:var(--pp-ink); font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif; background:#f6f8fb; padding:22px 18px 56px; }
        .pp-shell { max-width:1040px; margin:0 auto; }
        .pp-topline { display:flex; align-items:center; justify-content:space-between; gap:14px; padding:5px 0 24px; }
        .pp-brand { display:flex; align-items:center; gap:10px; color:var(--pp-ink); font-weight:850; letter-spacing:-.02em; }
        .pp-brand-mark { width:38px; height:38px; border-radius:12px; display:grid; place-items:center; background:#102033; color:#fff; font-size:19px; }
        .pp-status { border:1px solid #f2d49b; background:#fff8e9; color:#86530b; border-radius:999px; padding:7px 11px; font-size:10px; letter-spacing:.09em; font-weight:900; white-space:nowrap; }
        .pp-hero { position:relative; overflow:hidden; border-radius:24px; padding:clamp(28px,6vw,66px); color:#fff; background:radial-gradient(circle at 85% 18%,rgba(42,151,209,.32),transparent 32%),linear-gradient(130deg,#0d1b2b 0%,#153958 58%,#17536c 100%); }
        .pp-hero:after { content:""; position:absolute; width:330px; height:330px; border:1px solid rgba(255,255,255,.12); border-radius:50%; right:-130px; bottom:-190px; box-shadow:0 0 0 35px rgba(255,255,255,.035),0 0 0 75px rgba(255,255,255,.025); }
        .pp-kicker { display:inline-flex; align-items:center; gap:8px; color:#9bd8f4; font-size:11px; font-weight:900; letter-spacing:.16em; }
        .pp-kicker:before { content:""; width:22px; height:2px; background:#56c5ee; }
        .pp-hero h1 { max-width:740px; margin:20px 0 16px; font-size:clamp(34px,6vw,62px); line-height:1.02; letter-spacing:-.055em; }
        .pp-hero p { max-width:650px; margin:0; color:#d2e1eb; font-size:clamp(15px,2vw,18px); line-height:1.75; }
        .pp-hero-foot { margin-top:32px; display:flex; align-items:center; gap:12px; color:#c0d5e3; font-size:12px; font-weight:700; }
        .pp-hero-foot span { display:inline-block; width:7px; height:7px; border-radius:50%; background:#7dd3a7; box-shadow:0 0 0 5px rgba(125,211,167,.13); }
        .pp-section { padding:54px 0 0; }
        .pp-section-head { max-width:700px; margin-bottom:22px; }
        .pp-section-head small { color:#2879a4; font-size:10px; font-weight:950; letter-spacing:.16em; }
        .pp-section-head h2 { margin:9px 0 10px; font-size:clamp(25px,4vw,36px); line-height:1.12; letter-spacing:-.04em; }
        .pp-section-head p { margin:0; color:var(--pp-muted); font-size:14px; line-height:1.75; }
        .pp-service-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:16px; }
        .pp-service { overflow:hidden; border:1px solid var(--pp-line); border-radius:20px; background:#fff; box-shadow:0 12px 35px rgba(16,32,51,.045); }
        .pp-service-top { min-height:165px; padding:23px; display:flex; justify-content:space-between; align-items:flex-start; }
        .pp-service.blue .pp-service-top { background:linear-gradient(135deg,#e4f1fb,#f3f8fc); }
        .pp-service.orange .pp-service-top { background:linear-gradient(135deg,#fff0e4,#fff8f0); }
        .pp-service-num { color:#71869a; font-size:11px; font-weight:900; letter-spacing:.1em; }
        .pp-service-icon { width:48px; height:48px; display:grid; place-items:center; border-radius:15px; background:#fff; color:#1c6c99; font-size:27px; box-shadow:0 5px 15px rgba(16,32,51,.08); }
        .pp-service.orange .pp-service-icon { color:#b75d28; }
        .pp-service-body { padding:24px; }
        .pp-service-body small { color:#2879a4; font-size:10px; font-weight:950; letter-spacing:.14em; }
        .pp-service.orange .pp-service-body small { color:#b75d28; }
        .pp-service-body h3 { margin:9px 0 10px; font-size:22px; line-height:1.15; letter-spacing:-.035em; }
        .pp-service-body p { margin:0; color:var(--pp-muted); font-size:13px; line-height:1.75; }
        .pp-example-label { margin:22px 0 10px; color:#52667a; font-size:10px; font-weight:900; letter-spacing:.1em; text-transform:uppercase; }
        .pp-chips { display:flex; flex-wrap:wrap; gap:8px; }
        .pp-chip { border:1px solid #e4eaf0; border-radius:999px; padding:8px 11px; color:#31475c; background:#f8fafc; font-size:11px; font-weight:750; }
        .pp-note { margin-top:18px !important; padding-top:14px; border-top:1px solid #edf1f5; font-size:11px !important; color:#7a8795 !important; }
        .pp-journey { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:12px; }
        .pp-step { min-height:155px; border:1px solid var(--pp-line); border-radius:16px; padding:19px; background:#fff; }
        .pp-step-num { color:#2480aa; font-size:11px; font-weight:950; letter-spacing:.1em; }
        .pp-step h3 { margin:12px 0 7px; font-size:15px; letter-spacing:-.02em; }
        .pp-step p { margin:0; color:var(--pp-muted); font-size:12px; line-height:1.65; }
        .pp-value-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .pp-value { padding:23px; border-radius:18px; background:#102033; color:#fff; }
        .pp-value.alt { background:#e9f2f8; color:#102033; }
        .pp-value h3 { margin:0 0 12px; font-size:18px; }
        .pp-value ul { margin:0; padding-left:18px; display:grid; gap:9px; color:#d3e0e9; font-size:12px; line-height:1.55; }
        .pp-value.alt ul { color:#52667a; }
        .pp-terms { border:1px solid #dce6ee; border-radius:20px; padding:25px; background:#fff; }
        .pp-terms h3 { margin:0 0 8px; font-size:19px; }
        .pp-terms p { margin:0; color:var(--pp-muted); font-size:13px; line-height:1.75; }
        .pp-term-points { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:10px 18px; margin-top:19px; }
        .pp-term { display:flex; gap:9px; align-items:flex-start; color:#41566b; font-size:12px; line-height:1.6; }
        .pp-term b { color:#16805d; font-size:14px; }
        .pp-close { margin-top:48px; padding:30px; border-radius:22px; background:linear-gradient(120deg,#e6f2f9,#f2f7fa); text-align:center; }
        .pp-close h2 { margin:0 0 9px; font-size:25px; letter-spacing:-.035em; }
        .pp-close p { max-width:640px; margin:0 auto; color:#5b7084; font-size:13px; line-height:1.75; }
        .pp-footer { padding:24px 0 0; text-align:center; color:#8a98a6; font-size:10px; letter-spacing:.04em; }
        @media(max-width:720px) { .pp-service-grid,.pp-value-grid { grid-template-columns:1fr; } .pp-journey { grid-template-columns:repeat(2,minmax(0,1fr)); } .pp-topline { align-items:flex-start; flex-direction:column; } .pp-term-points { grid-template-columns:1fr; } }
        @media(max-width:420px) { .partner-proposal { padding:14px 12px 38px; } .pp-journey { grid-template-columns:1fr; } .pp-service-top { min-height:120px; } .pp-service-body { padding:20px; } }
      `}</style>

      <div className="pp-shell">
        <div className="pp-topline">
          <div className="pp-brand">
            <div className="pp-brand-mark">RZ</div>
            <span>THE RENTAL ZONE <span style={{ color: '#6b879c', fontWeight: 650 }}>TT</span></span>
          </div>
          <span className="pp-status">PRIVATE PROPOSAL · NOT LIVE</span>
        </div>

        <header className="pp-hero">
          <div className="pp-kicker">A PARTNERSHIP OPPORTUNITY</div>
          <h1>More customers for your rentals and food services.</h1>
          <p>
            A simple way to bring your two businesses in front of more event customers through The Rental Zone — with one clear place to discover your services, enquire and follow the booking from start to finish.
          </p>
          <div className="pp-hero-foot"><span /> A concept prepared for discussion — not a live listing or booking page.</div>
        </header>

        <section className="pp-section">
          <div className="pp-section-head">
            <small>01 / YOUR BUSINESSES, PRESENTED CLEARLY</small>
            <h2>Two services. One easier way for customers to find them.</h2>
            <p>
              We would present your rental services and food services as two clear parts of your offer. Customers can explore what they need without confusing the two businesses or mixing up their prices and availability.
            </p>
          </div>
          <div className="pp-service-grid">
            {serviceGroups.map((group) => (
              <article className={`pp-service ${group.tone}`} key={group.id}>
                <div className="pp-service-top">
                  <span className="pp-service-num">{group.number} / SERVICE CATEGORY</span>
                  <span className="pp-service-icon" aria-hidden="true">{group.icon}</span>
                </div>
                <div className="pp-service-body">
                  <small>{group.eyebrow}</small>
                  <h3>{group.title}</h3>
                  <p>{group.description}</p>
                  <div className="pp-example-label">Possible listing examples</div>
                  <div className="pp-chips">
                    {group.examples.map((example) => <span className="pp-chip" key={example}>{example}</span>)}
                  </div>
                  <p className="pp-note">{group.note}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="pp-section">
          <div className="pp-section-head">
            <small>02 / HOW CUSTOMERS WOULD MOVE THROUGH THE SYSTEM</small>
            <h2>From first enquiry to completed event.</h2>
            <p>
              Every request gets tracked. We can see what is still an enquiry, what has become a confirmed booking, and what has actually been completed.
            </p>
          </div>
          <div className="pp-journey">
            {journey.map(([number, title, description]) => (
              <article className="pp-step" key={number}>
                <div className="pp-step-num">{number}</div>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="pp-section">
          <div className="pp-section-head">
            <small>03 / A CLEAR WORKING ARRANGEMENT</small>
            <h2>Know what came in, what was delivered and what was earned.</h2>
            <p>
              The aim is to make the partnership accountable. Each job has its own record, so enquiries, confirmed work, completed events and payments do not get mixed together.
            </p>
          </div>
          <div className="pp-value-grid">
            <div className="pp-value">
              <h3>What The Rental Zone can coordinate</h3>
              <ul>
                <li>Promote the agreed services through its website and advertising.</li>
                <li>Receive and record customer enquiries.</li>
                <li>Coordinate availability, quotes and booking updates with you.</li>
                <li>Track event completion and follow up on outstanding details.</li>
              </ul>
            </div>
            <div className="pp-value alt">
              <h3>What you can see and confirm</h3>
              <ul>
                <li>Which customer requested your service and for what date.</li>
                <li>Which quote and provider price were agreed.</li>
                <li>Whether the booking was accepted and the event completed.</li>
                <li>What was collected, what is due to you and what was paid.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="pp-section">
          <div className="pp-terms">
            <h3>Before anything goes live, we agree the details together.</h3>
            <p>
              This preview does not set prices, guarantee bookings or commit either business to a payment arrangement. We would first confirm the actual services, inventory, menus, photos, service areas, availability, responsibilities and how The Rental Zone is compensated.
            </p>
            <div className="pp-term-points">
              <div className="pp-term"><b>✓</b><span>Approved products, menus, descriptions and photos.</span></div>
              <div className="pp-term"><b>✓</b><span>Customer pricing and provider payout agreed in advance.</span></div>
              <div className="pp-term"><b>✓</b><span>Who handles customer communication and payments.</span></div>
              <div className="pp-term"><b>✓</b><span>How cancellations, refunds and event completion are handled.</span></div>
            </div>
          </div>
        </section>

        <section className="pp-close">
          <h2>Let's shape the right setup for your businesses.</h2>
          <p>
            This is the starting point for a conversation. Once the details are agreed, we can prepare your real listings and build the booking workflow around the way you actually operate.
          </p>
        </section>

        <footer className="pp-footer">THE RENTAL ZONE TT · PARTNER PROPOSAL PREVIEW · NOT A LIVE OFFER</footer>
      </div>
    </div>
  );
}
