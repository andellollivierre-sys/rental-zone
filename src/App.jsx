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

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash || '#home');
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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
      {/* Mobile-optimized sticky navigation bar */}
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: '#0f172a',
          color: 'white',
          padding: '10px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '14px',
          fontFamily: 'system-ui, sans-serif',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
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

        <div
          style={{
            display: 'flex',
            gap: '20px',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
          }}
        >
          <a
            href="#home"
            style={{
              color:
                currentRoute === '#home' || currentRoute === ''
                  ? '#38bdf8'
                  : '#94a3b8',
              textDecoration: 'none',
              fontWeight: 'bold',
              padding: '4px 0',
            }}
          >
            Home
          </a>

          <a
            href="#booking"
            style={{
              color:
                currentRoute === '#booking' ? '#38bdf8' : '#94a3b8',
              textDecoration: 'none',
              fontWeight: 'bold',
              padding: '4px 0',
            }}
          >
            Booking
          </a>

          <a
            href="#our-bouncer"
            style={{
              color:
                currentRoute === '#our-bouncer' ? '#38bdf8' : '#94a3b8',
              textDecoration: 'none',
              fontWeight: 'bold',
              padding: '4px 0',
            }}
          >
            Our Bouncer
          </a>

          <a
            href="#how-it-works"
            style={{
              color:
                currentRoute === '#how-it-works'
                  ? '#38bdf8'
                  : '#94a3b8',
              textDecoration: 'none',
              fontWeight: 'bold',
              padding: '4px 0',
            }}
          >
            How It Works
          </a>

          <a
            href="#faq"
            style={{
              color:
                currentRoute === '#faq' ? '#38bdf8' : '#94a3b8',
              textDecoration: 'none',
              fontWeight: 'bold',
              padding: '4px 0',
            }}
          >
            FAQ
          </a>

          <a
            href="#contact"
            style={{
              color:
                currentRoute === '#contact' ? '#38bdf8' : '#94a3b8',
              textDecoration: 'none',
              fontWeight: 'bold',
              padding: '4px 0',
            }}
          >
            Contact
          </a>

          <a
            href="#admin"
            style={{
              color:
                currentRoute === '#admin' ? '#38bdf8' : '#94a3b8',
              textDecoration: 'none',
              fontWeight: 'bold',
              padding: '4px 0',
            }}
          >
            Admin
          </a>
        </div>
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
