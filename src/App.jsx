import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import BookingForm from './components/BookingForm';
import AdminDashboard from './components/AdminDashboard';
import OurBouncer from './components/OurBouncer';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import EventServices from './components/EventServices';
import EmailLeadCapturePreview from './components/EmailLeadCapturePreview';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(
    window.location.hash || '#home'
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const [testMode, setTestMode] = useState(
    new URLSearchParams(window.location.search).get('test') === 'true' ||
    new URLSearchParams(window.location.search).get('is_test') === '1' ||
    new URLSearchParams(window.location.search).get('trz_test') === '1' ||
    sessionStorage.getItem('trz_test_mode') === 'true'
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('test') === 'true' || params.get('is_test') === '1' || params.get('trz_test') === '1') {
      sessionStorage.setItem('trz_test_mode', 'true');
      setTestMode(true);
    }
  }, []);

  const endTestSession = () => {
    sessionStorage.removeItem('trz_test_mode');
    const params = new URLSearchParams(window.location.search);
    params.delete('test');
    params.delete('is_test');
    params.delete('trz_test');
    const query = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
    setTestMode(false);
    window.location.reload();
  };

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#home');
      setMenuOpen(false);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#booking', label: 'Bouncy Castle Booking' },
    { href: '#our-bouncer', label: 'Our Bouncer' },
    { href: '#event-services', label: 'Rentals & Services' },
    { href: '/articles/', label: 'Guides' },
    { href: '#how-it-works', label: 'Bouncy Castle Booking Guide' },
    { href: '#faq', label: 'Bouncy Castle FAQs' },
    { href: '#contact', label: 'Contact' },
    { href: '#admin', label: 'Admin' },
  ];

  const isActive = (href) =>
    currentRoute === href || (href === '#home' && currentRoute === '');
  const isHomePage = currentRoute === '#home' || currentRoute === '';

  if (currentRoute === '#email-offer-preview') {
    return <EmailLeadCapturePreview />;
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#f8fafc',
        overflowX: 'hidden',
      }}
    >
      <style>
        {`
          .trz-desktop-nav {
            display: flex;
          }

          .trz-mobile-menu-button {
            display: none;
          }

          .trz-mobile-menu {
            display: none;
          }

          @media (max-width: 768px) {
            .trz-desktop-nav {
              display: none !important;
            }

            .trz-mobile-menu-button {
              display: flex !important;
            }

            .trz-mobile-menu {
              display: flex;
            }
          }
        `}
      </style>

      {/* Responsive sticky navigation */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#0f172a',
          color: 'white',
          padding: '10px 20px',
          fontSize: '14px',
          fontFamily: 'system-ui, sans-serif',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minHeight: '36px',
          }}
        >
          {/* Logo + business name */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              minWidth: 0,
            }}
          >
            <img
              src="https://lh3.googleusercontent.com/d/1zK7oIDhE4G-hDWsoq9C527Y-EcXWiQRV"
              alt="The Rental Zone Logo"
              style={{
                width: '36px',
                height: '36px',
                minWidth: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
              }}
            />

            <span
              style={{
                fontWeight: 'bold',
                fontSize: '15px',
                color: '#f8fafc',
                whiteSpace: 'nowrap',
              }}
            >
              The Rental Zone
            </span>
          </div>

          {/* Desktop navigation */}
          <div
            className="trz-desktop-nav"
            style={{
              gap: '20px',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                style={{
                  color: isActive(link.href) ? '#38bdf8' : '#94a3b8',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  padding: '4px 0',
                  whiteSpace: 'nowrap',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Mobile hamburger button */}
          <button
            className="trz-mobile-menu-button"
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={menuOpen}
            style={{
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '42px',
              height: '42px',
              padding: 0,
              border: '1px solid #334155',
              borderRadius: '8px',
              background: menuOpen ? '#1e293b' : 'transparent',
              color: '#f8fafc',
              fontSize: '25px',
              lineHeight: 1,
              cursor: 'pointer',
            }}
          >
            {menuOpen ? '×' : '☰'}
          </button>
        </div>

        {/* Mobile menu drawer */}
        {menuOpen && (
          <div
            className="trz-mobile-menu"
            style={{
              flexDirection: 'column',
              marginTop: '10px',
              paddingTop: '8px',
              paddingBottom: '4px',
              borderTop: '1px solid #1e293b',
            }}
          >
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  color: isActive(link.href) ? '#38bdf8' : '#e2e8f0',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  padding: '12px 8px',
                  borderBottom: '1px solid #1e293b',
                }}
              >
                {link.label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {testMode && (
        <div style={{ position: 'sticky', top: 56, zIndex: 49, background: '#7c2d12', color: '#fff7ed', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', fontSize: '13px', fontWeight: 700 }}>
          <span>🧪 TEST SESSION — activity and booking submissions are isolated from live records.</span>
          <button onClick={endTestSession} style={{ background: '#fff7ed', color: '#7c2d12', border: 0, borderRadius: 6, padding: '7px 10px', fontWeight: 800, whiteSpace: 'nowrap' }}>End Test</button>
        </div>
      )}

      {/* Main Content Router */}
      <main
        style={{
          width: '100%',
          maxWidth: '800px',
          margin: '0 auto',
          flex: '1',
          paddingBottom: '40px',
        }}
      >
        {currentRoute === '#event-services' ? (
          <EventServices />
        ) : currentRoute === '#admin' ? (
          <AdminDashboard />
        ) : currentRoute === '#booking' ? (
          <BookingForm />
        ) : currentRoute === '#our-bouncer' ? (
          <OurBouncer />
        ) : currentRoute === '#how-it-works' ? (
          <HowItWorks />
        ) : currentRoute === '#faq' ? (
          <FAQ />
        ) : currentRoute === '#contact' ? (
          <Contact />
        ) : (
          <LandingPage />
        )}
      </main>

      {/* Executive company footer */}
      <footer
        style={{
          marginTop: 'auto',
          background: '#0b1220',
          color: '#cbd5e1',
          borderTop: '1px solid #243247',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            padding: '44px 24px 22px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '38px',
              justifyContent: 'space-between',
              paddingBottom: '34px',
            }}
          >
            <div style={{ flex: '2 1 250px', minWidth: 0, maxWidth: '390px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <img
                  src="https://lh3.googleusercontent.com/d/1zK7oIDhE4G-hDWsoq9C527Y-EcXWiQRV"
                  alt="The Rental Zone logo"
                  style={{ width: '46px', height: '46px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ color: '#f8fafc', fontSize: '17px', fontWeight: 800, letterSpacing: '0.01em' }}>THE RENTAL ZONE TT</div>
                  <div style={{ color: '#94a3b8', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '3px' }}>Rentals &amp; Event Services</div>
                </div>
              </div>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: 1.75, margin: '0 0 20px' }}>
                Straightforward rental solutions for celebrations, equipment needs and event support in Trinidad &amp; Tobago.
              </p>
              <a
                href="https://wa.me/18682810670"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '9px',
                  padding: '11px 15px',
                  borderRadius: '7px',
                  background: '#e2e8f0',
                  color: '#0f172a',
                  textDecoration: 'none',
                  fontSize: '13px',
                  fontWeight: 800,
                }}
              >
                Enquire on WhatsApp <span aria-hidden="true">↗</span>
              </a>
            </div>

            <div style={{ flex: '1 1 145px' }}>
              <h3 style={{ color: '#f8fafc', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '4px 0 17px' }}>Explore</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  ['Home', '#home'],
                  ['Bouncy Castle Booking', '#booking'],
                  ['Our Bouncer', '#our-bouncer'],
                  ['Rentals & Services', '#event-services'],
                ].map(([label, href]) => (
                  <a key={href} href={href} style={{ color: '#a8b5c7', textDecoration: 'none', fontSize: '13px' }}>{label}</a>
                ))}
              </div>
            </div>

            <div style={{ flex: '1 1 145px' }}>
              <h3 style={{ color: '#f8fafc', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '4px 0 17px' }}>Information</h3>
              <div style={{ display: 'grid', gap: '12px' }}>
                {[
                  ['Booking Guide', '#how-it-works'],
                  ['Bouncy Castle FAQs', '#faq'],
                  ['Rental Guides', '/articles/'],
                  ['Contact', '#contact'],
                ].map(([label, href]) => (
                  <a key={href} href={href} style={{ color: '#a8b5c7', textDecoration: 'none', fontSize: '13px' }}>{label}</a>
                ))}
              </div>
            </div>

            <div style={{ flex: '1 1 165px' }}>
              <h3 style={{ color: '#f8fafc', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '4px 0 17px' }}>Get in touch</h3>
              <div style={{ color: '#a8b5c7', fontSize: '13px', lineHeight: 1.8 }}>
                <div style={{ color: '#f8fafc', fontWeight: 700, marginBottom: '4px' }}>Trinidad &amp; Tobago</div>
                <div>WhatsApp: +1 (868) 281-0670</div>
                <a href="https://www.instagram.com/therentalzonett/" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', color: '#cbd5e1', textDecoration: 'none', marginTop: '10px' }}>Instagram ↗</a>
              </div>
            </div>
          </div>

          <div
            style={{
              borderTop: '1px solid #243247',
              paddingTop: '18px',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '10px',
              color: '#718096',
              fontSize: '12px',
            }}
          >
            <span>© {new Date().getFullYear()} The Rental Zone TT. All rights reserved.</span>
            <span>Clear options. Simple enquiries. Reliable service.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
