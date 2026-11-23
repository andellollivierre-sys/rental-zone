import React, { useState, useEffect } from 'react';
import LandingExperience from './components/LandingExperience';
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
  const [testMode, setTestMode] = useState(new URLSearchParams(window.location.search).get('test') === 'true' || new URLSearchParams(window.location.search).get('is_test') === '1' || new URLSearchParams(window.location.search).get('trz_test') === '1' || sessionStorage.getItem('trz_test_mode') === 'true');
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('test') === 'true' || params.get('is_test') === '1' || params.get('trz_test') === '1') { sessionStorage.setItem('trz_test_mode', 'true'); setTestMode(true); }
  }, []);
  const endTestSession = () => {
    sessionStorage.removeItem('trz_test_mode');
    const params = new URLSearchParams(window.location.search);
    params.delete('test'); params.delete('is_test'); params.delete('trz_test');
    const query = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (query ? '?' + query : '') + window.location.hash);
    setTestMode(false); window.location.reload();
  };
  useEffect(() => {
    const handleHashChange = () => { setCurrentRoute(window.location.hash || '#home'); setMenuOpen(false); window.scrollTo({ top: 0, behavior: 'instant' }); };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);
  const navLinks = [
    { href: '#our-bouncer', label: 'Bouncy Castle' },
    { href: '#event-services', label: 'Equipment & Services' },
    { href: '#how-it-works', label: 'How it works' },
    { href: '#faq', label: 'FAQs' },
    { href: '#contact', label: 'Contact' }
  ];
  const renderPage = () => {
    if (currentRoute === '#admin') return <AdminDashboard/>;
    if (currentRoute === '#booking') return <BookingForm/>;
    if (currentRoute === '#our-bouncer') return <OurBouncer/>;
    if (currentRoute === '#event-services') return <EventServices/>;
    if (currentRoute === '#how-it-works') return <HowItWorks/>;
    if (currentRoute === '#faq') return <FAQ/>;
    if (currentRoute === '#contact') return <Contact/>;
    return <LandingExperience/>;
  };
  const isHome = currentRoute === '#home' || currentRoute === '';
  const isAdmin = currentRoute === '#admin';
  return <div className="rz7-app">
    <header className="rz7-header">
      <a href="#home" className="rz7-brand" aria-label="The Rental Zone home"><img src="https://lh3.googleusercontent.com/d/1zK7oIDhE4G-hDWsoq9C527Y-EcXWiQRV" alt=""/><span><strong>THE RENTAL ZONE</strong><small>MAKE THE DAY A BIG DEAL.</small></span></a>
      <nav className="rz7-nav" aria-label="Main navigation"><a href="#home" className={isHome ? 'active' : ''}>Home</a>{navLinks.map(link => <a key={link.href} href={link.href} className={currentRoute === link.href ? 'active' : ''}>{link.label}</a>)}</nav>
      <a className="rz7-header-cta" href="#booking">Book / Enquire <b>↗</b></a>
      <button className="rz7-menu-toggle" type="button" onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen}><span/><span/></button>
      {menuOpen && <nav className="rz7-mobile-nav" aria-label="Mobile navigation"><a href="#home" onClick={() => setMenuOpen(false)}>Home</a>{navLinks.map(link => <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label} ↗</a>)}<a href="#booking" onClick={() => setMenuOpen(false)}>Book / Enquire ↗</a></nav>}
    </header>
    {testMode && <div className="rz7-test-banner"><span>TEST SESSION — activity and booking submissions are isolated from live records.</span><button type="button" onClick={endTestSession}>End test</button></div>}
    <main className={isHome ? 'rz7-main rz7-main-home' : 'rz7-main'}>{isHome ? renderPage() : <div className={isAdmin ? 'rz7-route rz7-admin-route' : 'rz7-route'}>{renderPage()}</div>}</main>
    <footer className="rz7-footer"><div className="rz7-footer-top"><div><a href="#home" className="rz7-footer-brand">THE RENTAL ZONE<span>TT</span></a><p>Party rentals, equipment hire and event services in Trinidad.</p></div><div><strong>EXPLORE</strong><a href="#our-bouncer">Spider-Man Combo Bouncer</a><a href="#event-services">Equipment & Services</a><a href="#how-it-works">How it works</a></div><div><strong>CONTACT</strong><a href="https://wa.me/18682810670" target="_blank" rel="noopener noreferrer">WhatsApp ↗</a><a href="https://www.instagram.com/therentalzonett/" target="_blank" rel="noopener noreferrer">Instagram ↗</a><a href="#contact">Contact page</a></div></div><div className="rz7-footer-bottom"><span>© {new Date().getFullYear()} The Rental Zone TT</span><a href="#admin">Admin access</a></div></footer>
  </div>;
}
