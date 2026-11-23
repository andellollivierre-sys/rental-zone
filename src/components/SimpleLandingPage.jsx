import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { trackTrzEvent } from '../utils/trzTracker';

export default function SimpleLandingPage() {
  const [offer, setOffer] = useState(null);
  useEffect(() => {
    let active = true;
    supabase.from('promotional_offers').select('offer_active, offer_price, offer_hours, offer_ends_at').order('id', { ascending: true }).limit(1).maybeSingle()
      .then(({ data, error }) => {
        if (!active) return;
        if (error) console.error('Promotion lookup:', error);
        const valid = data?.offer_active && (!data.offer_ends_at || new Date(data.offer_ends_at).getTime() > Date.now());
        setOffer(valid ? data : null);
      });
    trackTrzEvent('simple_homepage_view');
    return () => { active = false; };
  }, []);
  const promoActive = Boolean(offer);
  const price = promoActive ? Number(offer.offer_price || 650) : 650;
  const hours = promoActive ? Number(offer.offer_hours || 2) : 2;
  const money = (value) => Number.isInteger(value) ? String(value) : Number(value).toFixed(2);
  const book = (source) => {
    trackTrzEvent('simple_homepage_booking_click', { source });
    if (promoActive) {
      sessionStorage.setItem('trz_promo_intent', 'true');
      trackTrzEvent('clicked_promotional_offer', { offer_price: price, offer_hours: hours, offer_ends_at: offer?.offer_ends_at || null });
    }
    window.location.hash = '#booking';
    window.scrollTo({ top: 0, behavior: 'instant' });
  };
  return <div className="simple-home">
    <section className="simple-hero">
      <p className="simple-eyebrow">THE RENTAL ZONE TT · TRINIDAD</p>
      <h1>Make your next event<br/><span>a little more fun.</span></h1>
      <p className="simple-lead">Bring the Spider-Man Combo Bouncer to your celebration. We deliver and set it up.</p>
      <button className="simple-primary" onClick={() => book('hero')}>Check availability</button>
      <div className="simple-photo"><img src="/featured%20image.jpg" alt="Spider-Man Combo Bouncer"/></div>
      <p className="simple-caption">Spider-Man Combo Bouncer · Bounce, climb and slide</p>
    </section>
    <section className="simple-price" aria-label="Rental pricing">
      <p className="simple-eyebrow">STRAIGHTFORWARD PRICING</p>
      {promoActive && <div className="simple-promo"><span>Current special</span><strong>{hours} hours · TT${money(price)}</strong></div>}
      <div className="simple-packages">
        <div><span>2 hours</span><strong>TT$650</strong></div>
        <div><span>3 hours</span><strong>TT$900</strong></div>
        <div><span>8 hours</span><strong>TT$1,800</strong></div>
      </div>
      <p className="simple-payment">No deposit required. Payment is due on delivery.</p>
      <button className="simple-primary simple-wide" onClick={() => book('pricing')}>Book this bouncer</button>
    </section>
    <section className="simple-details">
      <h2>Good to know</h2>
      <p><strong>Size:</strong> 26 ft × 13 ft × 13 ft</p>
      <p><strong>Capacity:</strong> Up to 8 children</p>
      <p><strong>Setup:</strong> Flat, clear space and a standard power outlet required</p>
      <p><strong>Use:</strong> Dry use only</p>
    </section>
    <section className="simple-contact">
      <h2>Have a date in mind?</h2><p>Send an enquiry and we’ll confirm availability.</p>
      <button className="simple-primary" onClick={() => book('bottom')}>Check availability</button>
      <a href="https://wa.me/18682810670?text=Hi%20The%20Rental%20Zone%2C%20I%27d%20like%20to%20ask%20about%20the%20bouncy%20castle." target="_blank" rel="noopener noreferrer">Or message us on WhatsApp</a>
    </section>
  </div>;
}
