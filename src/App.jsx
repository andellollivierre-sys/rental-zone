import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import BookingForm from './components/BookingForm';
import AdminDashboard from './components/AdminDashboard';
import OurBouncer from './components/OurBouncer';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import Contact from './components/Contact';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(
    window.location.hash || '#home'
  );
  const [menuOpen, setMenuOpen] = useState(false);

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
    { href: '#booking', label: 'Booking' },
    { href: '#our-bouncer', label: 'Our Bouncer' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#faq', label: 'FAQ' },
    { href: '#contact', label: 'Contact' },
    { href: '#admin', label: 'Admin' },
  ];

  const isActive = (href) =>
    currentRoute === href || (href === '#home' && currentRoute === '');

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
        {currentRoute === '#admin' ? (
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

      {/* Professional Company Footer */}
      <footer
        style={{
          background: '#0f172a',
          color: '#94a3b8',
          padding: '20px',
          textAlign: 'center',
          fontSize: '13px',
          fontFamily: 'system-ui, sans-serif',
          borderTop: '1px solid #1e293b',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          marginTop: 'auto',
        }}
      >
        <div>
          © {new Date().getFullYear()} The Rental Zone LTD. All rights
          reserved.
        </div>

        <div>
          <a
            href="https://www.instagram.com/therentalzonett/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#38bdf8',
              textDecoration: 'none',
              fontWeight: 'bold',
            }}
          >
            Connect on Instagram
          </a>
        </div>
      </footer>
    </div>
  );
}
