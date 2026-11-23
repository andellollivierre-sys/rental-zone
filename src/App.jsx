import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import BookingForm from './components/BookingForm';
import AdminDashboard from './components/AdminDashboard';
import OurBouncer from './components/OurBouncer';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import Contact from './components/Contact';
import EventServices from './components/EventServices';
import './full-site-overhaul.css';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#home');
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
      window.scrollTo({ top: 0, behavior: 'instant' });
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navLinks = [
    { href: '#home', label: 'Home' },
    { href: '#our-bouncer', label: 'Bouncy Castle' },
    { href: '#event-services', label: 'More Rentals' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#faq', label: 'FAQs' },
    { href: '#contact', label: 'Contact' }
  ];
  const isActive = (href) => currentRoute === href || (href === '#home' && currentRoute === '');

  const renderPage = () => {
    if (currentRoute === '#admin') return <AdminDashboard />;
    if (currentRoute === '#booking') return <BookingForm />;
    if (currentRoute === '#our-bouncer') return <OurBouncer />;
    if (currentRoute === '#event-services') return <EventServices />;
    if (currentRoute === '#how-it-works') return <HowItWorks />;
    if (currentRoute === '#faq') return <FAQ />;
    if (currentRoute === '#contact') return <Contact />;
    return <LandingPage />;
  };

  const isHome = currentRoute === '#home' || currentRoute === '';
  const isAdmin = currentRoute === '#admin';

  return (
    <div className="trz-app">
      <div className="trz-utility-bar">
        <div className="trz-utility-inner">
          <span>THE RENTAL ZONE TT <i /> PARTY RENTALS · EQUIPMENT · EVENT SERVICES</span>
          <a href="https://wa.me/18682810670?text=Hi%20The%20Rental%20Zone%2C%20I%20have%20an%20enquiry." target="_blank" rel="noopener noreferrer">WhatsApp enquiries <b>↗</b></a>
        </div>
      </div>

      <header className="trz-site-header">
        <div className="trz-header-inner">
          <a className="trz-brand" href="#home" aria-label="The Rental Zone home">
            <img src="https://lh3.googleusercontent.com/d/1zK7oIDhE4G-hDWsoq9C527Y-EcXWiQRV" alt="The Rental Zone logo" />
            <span><strong>The Rental Zone</strong><small>MAKE THE DAY A BIG DEAL.</small></span>
          </a>

          <nav className="trz-desktop-nav" aria-label="Main navigation">
            {navLinks.map((link) => (
              <a key={link.href} className={isActive(link.href) ? 'is-active' : ''} href={link.href}>{link.label}</a>
            ))}
          </nav>

          <a className="trz-header-book" href="#booking">Book / Enquire <span>↗</span></a>

          <button className="trz-mobile-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}>
            <span /><span /><span />
          </button>
        </div>

        {menuOpen && (
          <nav className="trz-mobile-nav" aria-label="Mobile navigation">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className={isActive(link.href) ? 'is-active' : ''} onClick={() => setMenuOpen(false)}>{link.label}<span>↗</span></a>
            ))}
            <a className="trz-mobile-book" href="#booking" onClick={() => setMenuOpen(false)}>Book / Enquire ↗</a>
          </nav>
        )}
      </header>

      {testMode && (
        <div className="trz-test-banner">
          <span>TEST SESSION — activity and booking submissions are isolated from live records.</span>
          <button type="button" onClick={endTestSession}>End test</button>
        </div>
      )}

      <main className={isHome ? 'trz-content-area trz-content-home' : 'trz-content-area'}>
        {isHome ? renderPage() : (
          <div className={isAdmin ? 'trz-route-panel trz-admin-panel' : 'trz-route-panel'}>
            {renderPage()}
          </div>
        )}
      </main>

      <footer className="trz-site-footer">
        <div className="trz-footer-main">
          <div className="trz-footer-brand">
            <a className="trz-brand trz-brand-footer" href="#home">
              <img src="https://lh3.googleusercontent.com/d/1zK7oIDhE4G-hDWsoq9C527Y-EcXWiQRV" alt="" />
              <span><strong>The Rental Zone</strong><small>MAKE THE DAY A BIG DEAL.</small></span>
            </a>
            <p>Party rentals, equipment and event service enquiries — brought together in one place.</p>
          </div>
          <div className="trz-footer-links"><strong>Explore</strong><a href="#our-bouncer">Bouncy Castle</a><a href="#event-services">More Rentals & Services</a><a href="#how-it-works">How It Works</a></div>
          <div className="trz-footer-links"><strong>Get in touch</strong><a href="https://wa.me/18682810670" target="_blank" rel="noopener noreferrer">WhatsApp</a><a href="https://www.instagram.com/therentalzonett/" target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href="#contact">Contact page</a></div>
        </div>
        <div className="trz-footer-bottom">
          <span>© {new Date().getFullYear()} The Rental Zone TT. All rights reserved.</span>
          <a href="#admin">Admin access</a>
        </div>
      </footer>
    </div>
  );
}
