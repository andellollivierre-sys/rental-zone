import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { trackTrzEvent } from '../utils/trzTracker';
import AvailabilityCheckModal from './AvailabilityCheckModal';

export default function LandingExperience() {
  const [showAvailability, setShowAvailability] = useState(false);
  const [offer, setOffer] = useState(null);
  const [offerEnds, setOfferEnds] = useState(null);
  useEffect(() => {
    let active = true;
    supabase.from('promotional_offers').select('offer_active, offer_price, offer_hours, offer_ends_at')
      .order('id', { ascending: true }).limit(1).maybeSingle()
      .then(({ data, error }) => { if (!active) return; if (error) console.error(error); setOffer(data || null); });
    return () => { active = false; };
  }, []);
  const promoIsActive = Boolean(offer?.offer_active) && (!offer?.offer_ends_at || new Date(offer.offer_ends_at).getTime() > Date.now());
  const promoPrice = Number(offer?.offer_price || 650);
  const promoHours = Number(offer?.offer_hours || 2);
  const promoSavings = Math.max(0, promoHours * 325 - promoPrice);
  useEffect(() => {
    if (!promoIsActive || !offer?.offer_ends_at) { setOfferEnds(null); return undefined; }
    const update = () => { const n = Math.max(0, Math.ceil((new Date(offer.offer_ends_at).getTime() - Date.now()) / 1000)); setOfferEnds(n); if (!n) setOffer(null); };
    update(); const timer = setInterval(update, 1000); return () => clearInterval(timer);
  }, [promoIsActive, offer?.offer_ends_at]);
  const openAvailability = (source) => { trackTrzEvent('homepage_availability_click', { source }); setShowAvailability(true); };
  const money = (n) => Number.isInteger(n) ? String(n) : Number(n).toFixed(2);
  const countdown = (n) => n === null ? '—' : [Math.floor(n / 3600), Math.floor((n % 3600) / 60), n % 60].map(v => String(v).padStart(2, '0')).join(':');

  return <div className="rz7-home">
    <section className="rz7-opening">
      <div className="rz7-opening-copy">
        <div className="rz7-overline"><span/> THE RENTAL ZONE TT <i/> TRINIDAD & TOBAGO</div>
        <h1>Good gear.<br/><em>Big days.</em></h1>
        <p className="rz7-intro">From party attractions to practical equipment, find what you need and make one straightforward enquiry.</p>
        <div className="rz7-opening-actions"><button onClick={() => openAvailability('opening')}>Check bouncer availability <b>↗</b></button><a href="#rz7-catalogue">Browse rentals ↓</a></div>
        <div className="rz7-opening-note"><b>01</b> Choose an item <b>02</b> Send your details <b>03</b> Confirm with us</div>
      </div>
      <div className="rz7-opening-art">
        <img src="/featured%20image.jpg" alt="Spider-Man Combo Bouncer at The Rental Zone"/>
        <div className="rz7-image-index"><span>FEATURED RENTAL</span><b>01 / 03</b></div>
        <div className="rz7-image-caption"><div><small>PARTY RENTAL</small><strong>Spider-Man Combo Bouncer</strong><span>Bounce · Climb · Slide</span></div><a href="#our-bouncer">↗</a></div>
      </div>
      <div className="rz7-side-index">RENTALS <span>—</span> EQUIPMENT <span>—</span> EVENTS</div>
    </section>

    <section className="rz7-proofline">
      <div><strong>TRINIDAD</strong><span>Local rental enquiries</span></div><div><strong>NO DEPOSIT</strong><span>For the bouncer booking</span></div><div><strong>PAY ON DELIVERY</strong><span>For the bouncer booking</span></div><div><strong>DIRECT CONTACT</strong><span>We confirm availability</span></div>
    </section>

    <section className="rz7-catalogue" id="rz7-catalogue">
      <div className="rz7-section-top"><div><span className="rz7-kicker">THE CATALOGUE / 01</span><h2>What do you<br/><em>need to rent?</em></h2></div><p>Start with the item or service. Each section takes you to the relevant details and enquiry route.</p></div>
      <div className="rz7-catalogue-list">
        <a href="#our-bouncer" className="rz7-catalogue-row"><span className="rz7-row-no">01</span><div className="rz7-row-image"><img src="/featured%20image.jpg" alt="Spider-Man Combo Bouncer"/></div><div className="rz7-row-copy"><small>PARTY RENTAL</small><h3>Spider-Man Combo Bouncer</h3><p>A bounce area, climbing wall and dry slide in one attraction.</p></div><div className="rz7-row-meta"><strong>From TT$650</strong><span>Explore rental ↗</span></div></a>
        <a href="#event-services" className="rz7-catalogue-row"><span className="rz7-row-no">02</span><div className="rz7-row-image"><img src="https://res-de.togroup.com/stc/home_product/emtop/userfiles/1/images/photo/20241011190136894/EGGRD2822.jpg" alt="Portable generator"/></div><div className="rz7-row-copy"><small>EQUIPMENT HIRE</small><h3>Generator Rental</h3><p>Power support for events, work and temporary setups.</p></div><div className="rz7-row-meta"><strong>Request availability</strong><span>View details ↗</span></div></a>
        <a href="#event-services" className="rz7-catalogue-row"><span className="rz7-row-no">03</span><div className="rz7-row-image"><img src="https://a-ipower.com/cdn/shop/products/PWF2701SH_R_3QTR_L_2000_2000.png?v=1630521306" alt="Pressure washer"/></div><div className="rz7-row-copy"><small>EQUIPMENT HIRE</small><h3>Pressure Washer</h3><p>A practical rental for outdoor cleaning jobs.</p></div><div className="rz7-row-meta"><strong>Request availability</strong><span>View details ↗</span></div></a>
        <a href="#event-services" className="rz7-catalogue-row rz7-row-services"><span className="rz7-row-no">04</span><div className="rz7-row-symbol"><span>EVENT</span><b>+</b><span>SUPPORT</span></div><div className="rz7-row-copy"><small>EVENT SERVICES</small><h3>Build out your event</h3><p>Explore additional event services and request a quote.</p></div><div className="rz7-row-meta"><strong>Custom enquiries</strong><span>Explore services ↗</span></div></a>
      </div>
    </section>

    <section className="rz7-product">
      <div className="rz7-product-visual"><img src="/featured%20image.jpg" alt="Spider-Man Combo Bouncer"/><span>THE FEATURED SETUP / 01</span></div>
      <div className="rz7-product-info"><span className="rz7-kicker">MADE FOR THE MAIN EVENT</span><h2>One rental.<br/><em>Three ways to play.</em></h2><p>The Spider-Man Combo Bouncer brings the bounce, climb and slide together in one setup for your celebration.</p>
        <div className="rz7-spec-grid"><div><small>FOOTPRINT</small><strong>26 × 13 ft</strong></div><div><small>HEIGHT</small><strong>13 ft</strong></div><div><small>CAPACITY</small><strong>Up to 8 children</strong></div><div><small>USE</small><strong>Dry use only</strong></div></div>
        <a href="#our-bouncer" className="rz7-text-action">See full details and requirements ↗</a><button className="rz7-dark-button" onClick={() => openAvailability('featured-product')}>Check date availability <b>↗</b></button>
      </div>
    </section>

    <section className="rz7-rates">
      <div className="rz7-section-top"><div><span className="rz7-kicker">SIMPLE PACKAGE PRICING / 02</span><h2>Choose your<br/><em>party time.</em></h2></div><p>These packages apply to the Spider-Man Combo Bouncer. Confirm your date before making plans.</p></div>
      {promoIsActive && <div className="rz7-promo"><div><small>LIVE PROMOTIONAL OFFER</small><strong>{promoHours} hours · TT$\{money(promoPrice)}</strong><span>Save TT$\{money(promoSavings)}{offerEnds !== null ? ' · Ends in ' + countdown(offerEnds) : ''}</span></div><button onClick={() => openAvailability('promotion')}>Claim offer ↗</button></div>}
      <div className="rz7-rate-table">
        <button onClick={() => openAvailability('package-2-hours')}><span>01 / QUICK CELEBRATION</span><strong>2 hours</strong><b>TT$650</b><i>Check availability ↗</i></button>
        <button onClick={() => openAvailability('package-3-hours')}><span>02 / MORE PARTY TIME</span><strong>3 hours</strong><b>TT$900</b><i>Check availability ↗</i></button>
        <button onClick={() => openAvailability('package-8-hours')}><span>03 / ALL-DAY EVENT</span><strong>8 hours</strong><b>TT$1,800</b><i>Check availability ↗</i></button>
      </div><p className="rz7-rate-footnote">No deposit required. Payment is due on delivery.</p>
    </section>

    <section className="rz7-process"><div className="rz7-process-heading"><span className="rz7-kicker">HOW RENTING WORKS / 03</span><h2>Clear steps.<br/><em>No guesswork.</em></h2></div><div className="rz7-process-steps"><article><span>01</span><h3>Choose</h3><p>Select the rental or service that fits what you need.</p></article><article><span>02</span><h3>Enquire</h3><p>Send your date, location and the details we need.</p></article><article><span>03</span><h3>Confirm</h3><p>We contact you to confirm availability and arrangements.</p></article></div></section>

    <section className="rz7-bottom"><div><span className="rz7-kicker">LET’S GET IT SORTED</span><h2>Your next event<br/>starts <em>here.</em></h2><p>Tell us what you need. We’ll help you take the next step.</p></div><div className="rz7-bottom-actions"><button onClick={() => openAvailability('bottom-cta')}>Check bouncer availability ↗</button><a href="https://wa.me/18682810670?text=Hi%20The%20Rental%20Zone%2C%20I%27d%20like%20to%20make%20an%20enquiry." target="_blank" rel="noopener noreferrer">Message us on WhatsApp ↗</a></div></section>
    {showAvailability && <AvailabilityCheckModal onClose={() => setShowAvailability(false)} promoIsActive={promoIsActive} publicHours={promoHours} publicPrice={promoPrice}/>}
  </div>;
}
