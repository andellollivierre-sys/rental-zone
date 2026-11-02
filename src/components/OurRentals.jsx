import React, { useEffect, useState } from 'react';

const CART_KEY = 'trz_shared_booking_cart';

const readCart = () => {
  try {
    const value = JSON.parse(localStorage.getItem(CART_KEY) || '{}');
    return {
      bouncer: value.bouncer === true,
      packageType: ['2_hours', '3_hours', 'full_day'].includes(value.packageType) ? value.packageType : '3_hours',
      bubbleMachine: value.bubbleMachine === true
    };
  } catch {
    return { bouncer: false, packageType: '3_hours', bubbleMachine: false };
  }
};

const money = (amount) => `TT$${Number(amount).toLocaleString('en-TT')}`;

export default function OurRentals() {
  const [cart, setCart] = useState(readCart);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart]);

  const bouncerPrices = { '2_hours': 650, '3_hours': 900, full_day: 1800 };
  const bubblePrice = cart.bouncer && cart.bubbleMachine ? 200 : 0;
  const subtotal = (cart.bouncer ? bouncerPrices[cart.packageType] : 0) + bubblePrice;
  const itemCount = Number(cart.bouncer) + Number(cart.bubbleMachine);

  const updateCart = (changes) => {
    setCart((current) => ({ ...current, ...changes }));
  };

  const continueToBooking = () => {
    if (!cart.bouncer) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    window.location.hash = '#booking';
  };

  return (
    <div style={{ width: '100%', padding: '30px 18px 44px', boxSizing: 'border-box', fontFamily: 'system-ui, sans-serif', color: '#0f172a' }}>
      <header style={{ marginBottom: 22 }}>
        <p style={{ margin: '0 0 8px', color: '#0284c7', fontWeight: 900, fontSize: 12, letterSpacing: '0.08em', textTransform: 'uppercase' }}>The Rental Zone TT</p>
        <h1 style={{ margin: 0, fontSize: 'clamp(32px, 7vw, 44px)', lineHeight: 1.05, fontWeight: 950, letterSpacing: '-0.04em' }}>Our Rentals</h1>
        <p style={{ margin: '12px 0 0', color: '#64748b', fontSize: 16, lineHeight: 1.6 }}>Choose your rental and build one booking request. Your request is reviewed before it is confirmed.</p>
      </header>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: 16 }}>
        <article style={{ border: cart.bouncer ? '2px solid #0284c7' : '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 5px 18px rgba(15,23,42,0.06)' }}>
          <div style={{ height: 210, background: '#f1f5f9' }}><img src="/featured image.jpg" alt="Spider-Man Combo Bouncer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
          <div style={{ padding: 18 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 21, fontWeight: 900 }}>Spider-Man Combo Bouncer</h2>
            <p style={{ margin: '0 0 12px', color: '#475569', fontSize: 14, lineHeight: 1.55 }}>Bounce area, climbing section and attached slide. 26 × 13 × 13 ft. Up to 8 children.</p>
            <label htmlFor="trz-duration" style={{ display: 'block', fontSize: 13, fontWeight: 800, marginBottom: 6 }}>Choose rental duration</label>
            <select id="trz-duration" value={cart.packageType} onChange={(e) => updateCart({ packageType: e.target.value })} style={{ width: '100%', padding: 11, borderRadius: 9, border: '1px solid #cbd5e1', background: '#fff', marginBottom: 12 }}>
              <option value="2_hours">2 hours — TT$650</option>
              <option value="3_hours">3 hours — TT$900</option>
              <option value="full_day">Full day / 8 hours — TT$1,800</option>
            </select>
            <button type="button" onClick={() => updateCart({ bouncer: !cart.bouncer })} style={{ width: '100%', padding: 13, border: 0, borderRadius: 10, background: cart.bouncer ? '#0f172a' : '#0284c7', color: '#fff', fontWeight: 850, cursor: 'pointer' }}>{cart.bouncer ? 'Remove from My Booking' : 'Add to My Booking'}</button>
          </div>
        </article>

        <article style={{ border: cart.bubbleMachine ? '2px solid #0284c7' : '1px solid #e2e8f0', borderRadius: 18, overflow: 'hidden', background: '#fff', boxShadow: '0 5px 18px rgba(15,23,42,0.06)' }}>
          <div style={{ height: 210, background: '#f1f5f9' }}><img src="https://bouncycastlenetwork-res.cloudinary.com/image/upload/f_auto%2Cq_auto%2Cc_limit%2Cw_900/aa6f1ad7b094ff9dfda6d260a87e54b1" alt="Bubble machine producing bubbles" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div>
          <div style={{ padding: 18 }}>
            <h2 style={{ margin: '0 0 8px', fontSize: 21, fontWeight: 900 }}>Bubble Machine</h2>
            <p style={{ margin: '0 0 12px', color: '#475569', fontSize: 14, lineHeight: 1.55 }}>Add bubbles to your bouncer booking. Bubble liquid is included.</p>
            <p style={{ margin: '0 0 16px', color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>Standalone hire: TT$250 / 3 hours. Bouncer booking add-on: TT$200 / 3 hours.</p>
            <button type="button" onClick={() => updateCart({ bubbleMachine: !cart.bubbleMachine })} style={{ width: '100%', padding: 13, border: 0, borderRadius: 10, background: cart.bubbleMachine ? '#0f172a' : '#0284c7', color: '#fff', fontWeight: 850, cursor: 'pointer' }}>{cart.bubbleMachine ? 'Remove from My Booking' : 'Add as Bouncer Extra'}</button>
            {!cart.bouncer && <p style={{ color: '#92400e', fontSize: 12, lineHeight: 1.45, marginBottom: 0 }}>Standalone booking is not enabled in this online request flow yet. Contact us for standalone hire.</p>}
          </div>
        </article>
      </section>

      <aside style={{ position: 'sticky', bottom: 10, zIndex: 5, marginTop: 22, padding: 18, borderRadius: 16, background: '#0f172a', color: '#fff', boxShadow: '0 8px 28px rgba(15,23,42,.22)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, color: '#bae6fd', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em' }}>My Booking · {itemCount} {itemCount === 1 ? 'item' : 'items'}</div>
            <div style={{ fontSize: 22, fontWeight: 900, marginTop: 3 }}>{money(subtotal)}</div>
            <div style={{ fontSize: 11, color: '#cbd5e1' }}>Delivery calculated at checkout</div>
          </div>
          <button type="button" disabled={!cart.bouncer} onClick={continueToBooking} style={{ padding: '12px 16px', border: 0, borderRadius: 10, background: cart.bouncer ? '#38bdf8' : '#475569', color: '#082f49', fontWeight: 900, cursor: cart.bouncer ? 'pointer' : 'not-allowed' }}>Continue to Booking</button>
        </div>
        {cart.bouncer && <div style={{ marginTop: 12, paddingTop: 10, borderTop: '1px solid #334155', fontSize: 13, color: '#e2e8f0' }}>Spider-Man Bouncer · {cart.packageType === '2_hours' ? '2 hours' : cart.packageType === '3_hours' ? '3 hours' : '8 hours'} — {money(bouncerPrices[cart.packageType])}{cart.bubbleMachine ? `\nBubble Machine add-on — ${money(200)}` : ''}</div>}
        {!cart.bouncer && <p style={{ margin: '10px 0 0', fontSize: 12, color: '#cbd5e1' }}>Add the bouncer to continue with an online booking request.</p>}
      </aside>
    </div>
  );
}
