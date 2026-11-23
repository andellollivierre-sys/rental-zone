import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import BookingForm from './components/BookingForm';
import AdminDashboard from './components/AdminDashboard';
import OurBouncer from './components/OurBouncer';
import HowItWorks from './components/HowItWorks';
import FAQ from './components/FAQ';
import Contact from './components/Contact';

export default function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.hash || '#home');
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
    { href: '#our-bouncer', label: 'The Bouncer' },
    { href: '#how-it-works', label: 'How It Works' },
    { href: '#faq', label: 'FAQs' },
    { href: '#contact', label: 'Contact' },
  ];
  const isActive = (href) => currentRoute === href || (href === '#home' && currentRoute === '');

  return (
    <div className="trz-site">
      <div className="trz-announcement">
        <span>THE RENTAL ZONE TT</span>
        <span>Party-ready fun, delivered to your yard</span>
        <a href="https://wa.me/18682810670?text=Hi%20The%20Rental%20Zone%2C%20I%20have%20a%20question." target="_blank" rel="noopener noreferrer">Chat with us ↗</a>
      </div>
      <header className="trz-header">
        <a className="trz-brand" href="/#home" aria-label="The Rental Zone home">
          <img src="https://lh3.googleusercontent.com/d/1zK7oIDhE4G-hDWsoq9C527Y-EcXWiQRV" alt="The Rental Zone logo" />
          <span><strong>The Rental Zone</strong><small>PARTY RENTALS · TRINIDAD</small></span>
        </a>
        <nav className="trz-nav" aria-label="Main navigation">
          {navLinks.map((link) => <a key={link.href} className={isActive(link.href) ? 'is-active' : ''} href={link.href}>{link.label}</a>)}
          <a className="trz-nav__book" href="/#booking">Check dates <span>↗</span></a>
        </nav>
        <button className="trz-menu-toggle" type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen} aria-label={menuOpen ? 'Close menu' : 'Open menu'}>{menuOpen ? '×' : '☰'}</button>
        {menuOpen && <nav className="trz-mobile-nav" aria-label="Mobile navigation">
          {navLinks.map((link) => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>)}
          <a className="trz-nav__book" href="/#booking" onClick={() => setMenuOpen(false)}>Check dates ↗</a>
        </nav>}
      </header>

      <main className={currentRoute === '#home' || currentRoute === '' ? 'trz-main trz-main--home' : 'trz-main'}>
        {currentRoute === '#admin' ? <AdminDashboard /> :
          currentRoute === '#booking' ? <BookingForm /> :
          currentRoute === '#our-bouncer' ? <OurBouncer /> :
          currentRoute === '#how-it-works' ? <HowItWorks /> :
          currentRoute === '#faq' ? <FAQ /> :
          currentRoute === '#contact' ? <Contact /> : <LandingPage />}
      </main>

      <footer className="trz-footer">
        <div className="trz-footer__top">
          <a className="trz-brand trz-brand--footer" href="/#home">
            <img src="https://lh3.googleusercontent.com/d/1zK7oIDhE4G-hDWsoq9C527Y-EcXWiQRV" alt="" />
            <span><strong>The Rental Zone</strong><small>MAKE THE DAY A BIG DEAL.</small></span>
          </a>
          <p>Big smiles. Easy bookings. Fun delivered.</p>
          <a href="https://www.instagram.com/therentalzonett/" target="_blank" rel="noopener noreferrer">Follow on Instagram ↗</a>
        </div>
        <div className="trz-footer__bottom"><span>© {new Date().getFullYear()} The Rental Zone TT. All rights reserved.</span><a href="/#booking">Plan your event →</a></div>
      </footer>
    </div>
  );
}
