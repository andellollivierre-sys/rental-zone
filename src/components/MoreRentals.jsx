import React, { useMemo, useState } from 'react';

const rentalCategories = [
  { id: 'all', label: 'All Rentals' },
  { id: 'party-equipment', label: 'Party Equipment' },
  { id: 'event-extras', label: 'Event Extras' },
  { id: 'entertainment', label: 'Entertainment' }
];

// Add confirmed rental items here when names, prices, photos and availability are supplied.
// No unconfirmed products or prices are displayed to customers.
const rentalItems = [];

const comingSoon = [
  {
    id: 'party-equipment',
    title: 'Party Equipment',
    description: 'More equipment options for your celebration.'
  },
  {
    id: 'event-extras',
    title: 'Event Extras',
    description: 'Useful additions to help complete your event setup.'
  },
  {
    id: 'entertainment',
    title: 'Entertainment',
    description: 'More ways to keep guests entertained.'
  }
];

const money = (amount) =>
  new Intl.NumberFormat('en-TT', {
    style: 'currency',
    currency: 'TTD',
    maximumFractionDigits: 0
  }).format(amount);

export default function MoreRentals() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  const visibleItems = useMemo(() => {
    if (activeCategory === 'all') return rentalItems;
    return rentalItems.filter((item) => item.category === activeCategory);
  }, [activeCategory]);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const addToCart = (item) => {
    setCart((current) => {
      const existing = current.find((entry) => entry.id === item.id);
      if (existing) {
        return current.map((entry) =>
          entry.id === item.id
            ? { ...entry, quantity: entry.quantity + 1 }
            : entry
        );
      }
      return [...current, { ...item, quantity: 1 }];
    });
  };

  const changeQuantity = (id, amount) => {
    setCart((current) =>
      current
        .map((item) =>
          item.id === id
            ? { ...item, quantity: item.quantity + amount }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  return (
    <div className="more-rentals-page">
      <style>{`
        .more-rentals-page {
          color: #0f172a;
          font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          padding: 28px 18px 48px;
        }
        .mr-hero {
          background: linear-gradient(135deg, #0f172a 0%, #172554 100%);
          color: #fff;
          border-radius: 18px;
          padding: 30px 24px;
          margin-bottom: 22px;
        }
        .mr-eyebrow {
          color: #7dd3fc;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
          margin: 0 0 8px;
        }
        .mr-hero h1 {
          margin: 0;
          font-size: clamp(28px, 6vw, 40px);
          line-height: 1.1;
        }
        .mr-hero p {
          color: #cbd5e1;
          max-width: 540px;
          line-height: 1.6;
          margin: 12px 0 0;
          font-size: 15px;
        }
        .mr-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin: 22px 0 16px;
        }
        .mr-toolbar h2 {
          margin: 0;
          font-size: 21px;
        }
        .mr-cart-button {
          border: 0;
          border-radius: 999px;
          background: #0f172a;
          color: white;
          padding: 11px 16px;
          font-weight: 750;
          cursor: pointer;
        }
        .mr-categories {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding: 2px 0 12px;
          scrollbar-width: thin;
        }
        .mr-category {
          border: 1px solid #cbd5e1;
          border-radius: 999px;
          background: white;
          color: #334155;
          padding: 9px 14px;
          white-space: nowrap;
          font-weight: 700;
          cursor: pointer;
        }
        .mr-category.active {
          background: #0f172a;
          color: white;
          border-color: #0f172a;
        }
        .mr-empty {
          border: 1px dashed #cbd5e1;
          border-radius: 16px;
          background: #f8fafc;
          padding: 28px 20px;
          text-align: center;
          margin: 8px 0 28px;
        }
        .mr-empty-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          margin: 0 auto 12px;
          border-radius: 14px;
          background: #e0f2fe;
          color: #0369a1;
          font-size: 23px;
        }
        .mr-empty h3 {
          margin: 0 0 7px;
          font-size: 18px;
        }
        .mr-empty p {
          color: #64748b;
          margin: 0;
          line-height: 1.55;
          font-size: 14px;
        }
        .mr-section-title {
          margin: 28px 0 13px;
          font-size: 20px;
        }
        .mr-coming-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
        }
        .mr-coming-card {
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 16px;
          background: white;
          min-height: 130px;
        }
        .mr-coming-card span {
          display: inline-block;
          border-radius: 999px;
          background: #f1f5f9;
          color: #475569;
          padding: 5px 9px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: .06em;
          text-transform: uppercase;
        }
        .mr-coming-card h3 {
          margin: 12px 0 6px;
          font-size: 16px;
        }
        .mr-coming-card p {
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
          margin: 0;
        }
        .mr-product-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }
        .mr-product {
          border: 1px solid #e2e8f0;
          border-radius: 15px;
          overflow: hidden;
          background: white;
        }
        .mr-product img {
          width: 100%;
          aspect-ratio: 16 / 10;
          object-fit: cover;
          display: block;
          background: #f1f5f9;
        }
        .mr-product-body { padding: 14px; }
        .mr-product-body h3 { margin: 0 0 6px; font-size: 17px; }
        .mr-product-body p { color: #64748b; font-size: 13px; line-height: 1.5; }
        .mr-product-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-top: 12px;
        }
        .mr-add-button {
          border: 0;
          border-radius: 9px;
          background: #0284c7;
          color: white;
          padding: 10px 13px;
          font-weight: 750;
          cursor: pointer;
        }
        .mr-cart-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: rgba(15, 23, 42, .55);
          display: flex;
          justify-content: flex-end;
        }
        .mr-cart-panel {
          background: white;
          width: min(420px, 100%);
          height: 100%;
          overflow-y: auto;
          padding: 22px;
          box-shadow: -8px 0 30px rgba(0,0,0,.15);
        }
        .mr-cart-head, .mr-cart-line, .mr-cart-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .mr-cart-head h2 { margin: 0; }
        .mr-close {
          border: 0;
          background: #f1f5f9;
          border-radius: 50%;
          width: 36px;
          height: 36px;
          font-size: 20px;
          cursor: pointer;
        }
        .mr-cart-line {
          padding: 15px 0;
          border-bottom: 1px solid #e2e8f0;
          align-items: flex-start;
        }
        .mr-qty {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 8px;
        }
        .mr-qty button {
          width: 28px;
          height: 28px;
          border: 1px solid #cbd5e1;
          border-radius: 7px;
          background: white;
          cursor: pointer;
        }
        .mr-cart-total {
          padding-top: 18px;
          margin-top: 8px;
          border-top: 2px solid #e2e8f0;
          font-weight: 800;
        }
        @media (max-width: 620px) {
          .more-rentals-page { padding: 18px 14px 36px; }
          .mr-hero { padding: 24px 19px; }
          .mr-coming-grid { grid-template-columns: 1fr; }
          .mr-product-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <section className="mr-hero">
        <p className="mr-eyebrow">The Rental Zone TT</p>
        <h1>More Rentals</h1>
        <p>
          Looking for more than the bouncy castle? Explore additional rental
          options for your event and build your rental selection in one place.
        </p>
      </section>

      <div className="mr-toolbar">
        <h2>Explore rental options</h2>
        <button className="mr-cart-button" onClick={() => setCartOpen(true)}>
          Rental Cart ({cartCount})
        </button>
      </div>

      <div className="mr-categories" aria-label="Rental categories">
        {rentalCategories.map((category) => (
          <button
            key={category.id}
            className={`mr-category ${activeCategory === category.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(category.id)}
            type="button"
          >
            {category.label}
          </button>
        ))}
      </div>

      {visibleItems.length > 0 ? (
        <div className="mr-product-grid">
          {visibleItems.map((item) => (
            <article className="mr-product" key={item.id}>
              {item.image && <img src={item.image} alt={item.name} />}
              <div className="mr-product-body">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="mr-product-footer">
                  <strong>{money(item.price)}{item.duration ? ` / ${item.duration}` : ''}</strong>
                  <button className="mr-add-button" onClick={() => addToCart(item)}>
                    Add to Cart
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <section className="mr-empty">
          <div className="mr-empty-icon" aria-hidden="true">＋</div>
          <h3>More rental options are being added</h3>
          <p>
            Our additional rental catalogue is being prepared. The bouncy castle
            remains available through the main booking page.
          </p>
        </section>
      )}

      <h2 className="mr-section-title">Coming Soon</h2>
      <div className="mr-coming-grid">
        {comingSoon.map((category) => (
          <article className="mr-coming-card" key={category.id}>
            <span>Coming Soon</span>
            <h3>{category.title}</h3>
            <p>{category.description}</p>
          </article>
        ))}
      </div>

      {cartOpen && (
        <div className="mr-cart-overlay" onClick={() => setCartOpen(false)}>
          <aside
            className="mr-cart-panel"
            role="dialog"
            aria-modal="true"
            aria-label="Rental cart"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mr-cart-head">
              <h2>Your Rental Cart</h2>
              <button className="mr-close" onClick={() => setCartOpen(false)} aria-label="Close cart">×</button>
            </div>
            {cart.length === 0 ? (
              <div className="mr-empty">
                <h3>Your cart is empty</h3>
                <p>When additional rentals are available, you can add them here before continuing.</p>
              </div>
            ) : (
              <>
                {cart.map((item) => (
                  <div className="mr-cart-line" key={item.id}>
                    <div>
                      <strong>{item.name}</strong>
                      <div className="mr-qty">
                        <button onClick={() => changeQuantity(item.id, -1)} aria-label={`Remove one ${item.name}`}>−</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => changeQuantity(item.id, 1)} aria-label={`Add one ${item.name}`}>＋</button>
                      </div>
                    </div>
                    <strong>{money(item.price * item.quantity)}</strong>
                  </div>
                ))}
                <div className="mr-cart-total">
                  <span>Estimated rental total</span>
                  <span>{money(cartTotal)}</span>
                </div>
                <p style={{ color: '#64748b', fontSize: 13, lineHeight: 1.5 }}>
                  This is a selection summary only. Rental dates and availability must be confirmed before a booking is accepted.
                </p>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
