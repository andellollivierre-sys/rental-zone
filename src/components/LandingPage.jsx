import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import {
  trackTrzEvent,
  shouldFireSessionStarted,
  createPageTimer
} from '../utils/trzTracker';

export default function LandingPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showSpaceModal, setShowSpaceModal] = useState(false);

  const pageExitSent = useRef(false);

  // Helper function for detailed visitor tracking.
  // Tracking is intentionally fire-and-forget so it never blocks UI/navigation.
  const trackButtonClick = (eventName, additionalData = {}) => {
    trackTrzEvent(eventName, additionalData);
  };

  // Visitor Tracking Hook with Unique Page Visit Control
  // Detailed funnel tracking now goes through trzTracker.js -> visitor_events.
  useEffect(() => {
    let pageTimer = null;
    let pageExitHandler = null;
    let popupTimer = null;

    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const logVisitor = async () => {
      try {
        if (localStorage.getItem('ignore_visits') === 'true') {
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          return; // Skip page visit logging if admin is logged in
        }

        // 1. Log Unique Page Visit
        const pageVisitLogged = sessionStorage.getItem('page_visit_logged');

        if (!pageVisitLogged) {
          const params = new URLSearchParams(window.location.search);
          const utmSource = params.get('utm_source') || params.get('traffic_source') || 'direct';
          const utmCampaign = params.get('utm_campaign') || 'none';
          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          const deviceType = isMobile ? 'Mobile' : 'Desktop';
          const isTest = params.get('test') === 'true' || window.location.hostname === 'localhost';

          await supabase.from('page_visits').insert([
            {
              traffic_source: utmSource.toLowerCase(),
              utm_campaign: utmCampaign,
              device_type: deviceType,
              is_test: isTest,
              landing_page: window.location.pathname
            }
          ]);

          sessionStorage.setItem('page_visit_logged', 'true');

          if ("Notification" in window && Notification.permission === "granted" && !isTest) {
            new Notification("🎉 New Unique Visitor!", {
              body: `Source: ${utmSource.toUpperCase()} (${deviceType})`,
              icon: '/favicon.ico'
            });
          }
        }
      } catch (err) {
        console.error('Visitor tracking error:', err);
      }
    };

    logVisitor();

    // Start the authoritative clean tracking session.
    if (shouldFireSessionStarted()) {
      trackTrzEvent('session_started');
    }

    // Confirm that the landing page actually mounted/rendered.
    const viewedLandingLogged = sessionStorage.getItem('trz_viewed_landing_page');

    if (!viewedLandingLogged) {
      sessionStorage.setItem('trz_viewed_landing_page', 'true');
      trackTrzEvent('viewed_landing_page');
    }

    // Active/visible page-duration tracking.
    pageTimer = createPageTimer();

    pageExitHandler = () => {
      if (pageExitSent.current) {
        return;
      }

      pageExitSent.current = true;

      trackTrzEvent('page_exit', {
        page_duration_seconds: pageTimer.getSeconds()
      });
    };

    window.addEventListener('pagehide', pageExitHandler);

    // Immediate Trigger for Intent Popup (Once per session)
    const hasSeenPopup = sessionStorage.getItem('seen_booking_popup');

    if (!hasSeenPopup) {
      popupTimer = setTimeout(() => {
        setShowBookingPopup(true);
        sessionStorage.setItem('seen_booking_popup', 'true');

        trackTrzEvent('popup_opened', {
          popup_type: 'initial_intent'
        });
      }, 0);
    }

    return () => {
      if (popupTimer) {
        clearTimeout(popupTimer);
      }

      if (pageExitHandler) {
        window.removeEventListener('pagehide', pageExitHandler);
      }

      if (pageTimer) {
        pageTimer.cleanup();
      }
    };
  }, []);

  const handleIntentSelect = (intentKey, targetDestination) => {
    setShowBookingPopup(false);

    const intentEvents = {
      availability: 'clicked_check_availability',
      prices: 'clicked_view_price',
      space: 'clicked_view_size'
    };

    const eventName = intentEvents[intentKey];

    if (eventName) {
      trackButtonClick(eventName, {
        popup_type: 'initial_intent'
      });
    }

    // Modal popups or route navigation
    if (intentKey === 'prices') {
      setShowSpaceModal(false);
      setShowPriceModal(true);
    } else if (intentKey === 'space') {
      setShowPriceModal(false);
      setShowSpaceModal(true);
    } else if (targetDestination) {
      if (targetDestination.startsWith('/#')) {
        window.location.hash = targetDestination.replace('/#', '#');
      } else if (targetDestination.startsWith('/')) {
        window.location.href = targetDestination;
      } else {
        const el = document.querySelector(targetDestination);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.hash = targetDestination;
        }
      }
    }
  };

  const galleryImages = [
    '/image 1.png',
    '/image 2.png',
    '/image 3.jpg'
  ];

  const featuredImage = '/featured image.jpg';

  const faqs = [
    {
      q: "What are the space and clearance requirements?",
      a: "The Spider-Man unit measures 26ft long x 13ft wide x 13ft high. You need a flat, clean surface (grass or smooth pavement) with clear overhead space free of low tree branches or wires."
    },
    {
      q: "What do I need to provide on setup day?",
      a: "A standard household electrical outlet within 100 feet of the setup area to power the blower continuously. If power isn't close to the yard, a reliable generator is required."
    },
    {
      q: "How does the deposit process work?",
      a: "To officially lock in your date, a TT$100 deposit is required. Your date is not secured until the deposit transfer and receipt screenshot are verified. The remaining balance is due upon delivery."
    },
    {
      q: "What is your weather and cancellation policy?",
      a: "Safety comes first. If severe weather (heavy tropical downpours or high wind warnings) makes setup unsafe, we will work with you to reschedule your booking for the next available date."
    }
  ];

  return (
    <div style={{ width: '100%', padding: '16px 0', fontFamily: 'system-ui, sans-serif', color: '#0f172a', boxSizing: 'border-box', maxWidth: '800px', margin: '0 auto' }}>
      
      <div style={{ padding: '0 16px' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', padding: '12px 10px 32px 10px' }}>
          <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '5px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Premier Party Rentals in Trinidad
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: '800', marginTop: '14px', marginBottom: '12px', color: '#0f172a', lineHeight: '1.25' }}>
            Bring The Ultimate Fun <br /> To Your Next Event!
          </h1>
          <p style={{ color: '#475569', fontSize: '14px', maxWidth: '100%', margin: '0 auto 20px auto', lineHeight: '1.5', padding: '0 10px' }}>
            Safe, clean, high-energy bouncy castles delivered straight to your yard. Secure your date with zero upfront risk.
          </p>
          <a 
            href="/#booking"
            onClick={() => trackButtonClick('clicked_book_now')}
            style={{ 
              display: 'block',
              width: '100%',
              maxWidth: '320px',
              margin: '0 auto',
              background: '#2563eb', 
              color: 'white', 
              fontWeight: 'bold', 
              padding: '14px 0', 
              borderRadius: '12px', 
              border: 'none',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              fontSize: '15px',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            Check Availability & Book
          </a>
        </div>

        {/* Featured Inventory Card */}
        <div id="pricing" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', marginBottom: '30px' }}>
          <div style={{ height: '240px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: '10' }}>
              <span style={{ background: '#2563eb', color: 'white', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', fontWeight: 'bold' }}>
                Featured Inventory
              </span>
            </div>
            <img 
              src={featuredImage} 
              alt="Spider-Man Bouncy Castle" 
              style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }} 
              onClick={() => {
                trackButtonClick('click_featured_image_zoom');
                setSelectedImage(featuredImage);
              }}
              title="Click to zoom image"
            />
          </div>
          
          <div style={{ padding: '20px' }}>
            <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 6px 0' }}>
              🕷️ Spider-Man Bouncy Castle
            </h3>
            <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 16px 0', lineHeight: '1.4' }}>
              Combination + Slide • 26x13x13ft • Up to 8 Kids. High-durability vinyl, fully cleaned and sanitized before every setup.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px', borderTop: '1px solid #f1f5f9' }}>
              <div>
                <span style={{ display: 'block', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 'bold' }}>Starting at</span>
                <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '17px' }}>TT$650</span>
              </div>
              <a 
                href="/#booking"
                onClick={() => trackButtonClick('clicked_book_now')}
                style={{ background: '#0f172a', color: 'white', fontSize: '13px', fontWeight: 'bold', padding: '10px 18px', borderRadius: '8px', border: 'none', cursor: 'pointer', textDecoration: 'none', display: 'inline-block' }}
              >
                Select & Book
              </a>
            </div>
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '12px', textAlign: 'center' }}>
            📸 Event & Unit Gallery
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {galleryImages.map((imgUrl, index) => (
              <div 
                key={index} 
                style={{ height: '140px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }} 
                onClick={() => {
                  trackButtonClick(`click_gallery_image_${index + 1}`);
                  setSelectedImage(imgUrl);
                }}
              >
                <img 
                  src={imgUrl} 
                  alt={`Rental Zone Gallery ${index + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  title="Click to zoom image"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Q&A / Guidelines Section */}
        <div id="space-reqs" style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#0f172a', marginBottom: '16px', textAlign: 'center' }}>
            📋 Setup Guidelines & FAQ
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {faqs.map((item, idx) => (
              <div key={idx} style={{ paddingBottom: '12px', borderBottom: idx < faqs.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#1e293b', margin: '0 0 4px 0' }}>
                  {idx + 1}. {item.q}
                </h4>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0', lineHeight: '1.4' }}>
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* INTENT SELECTION POPUP MODAL */}
      {showBookingPopup && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => {
            trackButtonClick('dismiss_intent_popup_backdrop');
            setShowBookingPopup(false);
          }}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '28px 24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => {
                trackButtonClick('dismiss_intent_popup_close_btn');
                setShowBookingPopup(false);
              }}
              style={{
                position: 'absolute',
                top: '14px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              &times;
            </button>

            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Welcome to The Rental Zone
            </span>

            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '16px 0 8px 0' }}>
              What would you like to find out?
            </h3>

            <p style={{ fontSize: '13px', color: '#64748b', lineHeight: '1.4', margin: '0 0 20px 0' }}>
              Select an option below so we can guide you to the right information:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => handleIntentSelect('availability', '/#booking')}
                style={{
                  width: '100%',
                  background: '#2563eb',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>📅 Check Availability & Book</span>
                <span style={{ fontSize: '16px' }}>→</span>
              </button>

              <button
                onClick={() => handleIntentSelect('prices')}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: '600',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>🏷️ See Prices & Packages</span>
                <span style={{ fontSize: '16px' }}>→</span>
              </button>

              <button
                onClick={() => handleIntentSelect('space')}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: '600',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <span>📐 See Size & Space Requirements</span>
                <span style={{ fontSize: '16px' }}>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRICE & PACKAGES INFORMATION POPUP */}
      {showPriceModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowPriceModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowPriceModal(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              &times;
            </button>

            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Pricing & Packages
            </span>

            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '12px 0 6px 0' }}>
              🕷️ Spider-Man Bouncy Castle
            </h3>

            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0', margin: '14px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                <div>
                  <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '15px', display: 'block' }}>Starting Rate</span>
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600' }}>(Includes 2 Hours)</span>
                </div>
                <span style={{ fontSize: '20px', fontWeight: '800', color: '#2563eb' }}>TT$650</span>
              </div>
              <ul style={{ paddingLeft: '18px', margin: '8px 0 0 0', fontSize: '13px', color: '#475569', lineHeight: '1.5' }}>
                <li>Starting cost for 2 hours of bounce time</li>
                <li>Fully sanitized & heavy-duty vinyl construction</li>
                <li>TT$100 refundable/deductible deposit secures your date</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '18px' }}>
              <a
                href="/#booking"
                onClick={() => {
                  trackButtonClick('clicked_book_now');
                  setShowPriceModal(false);
                }}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#2563eb',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '12px 0',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                📅 Check Availability & Book Now
              </a>

              {/* CROSS-NAVIGATION BUTTON TO SIZE & SPACE */}
              <button
                onClick={() => {
                  trackButtonClick('click_price_modal_switch_to_space');
                  handleIntentSelect('space');
                }}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: '600',
                  padding: '10px 0',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                📐 Check Size & Yard Requirements
              </button>

              <a
                href="https://wa.me/18682810670?text=Hi%20Rental%20Zone,%20I%20have%20a%20question%20about%20prices."
                target="_blank"
                rel="noreferrer"
                onClick={() => trackButtonClick('whatsapp_clicked')}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#25d366',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '12px 0',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                💬 Have Questions? Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* SIZE & SPACE REQUIREMENTS INFORMATION POPUP */}
      {showSpaceModal && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(0, 0, 0, 0.75)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowSpaceModal(false)}
        >
          <div 
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '420px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowSpaceModal(false)}
              style={{
                position: 'absolute',
                top: '14px',
                right: '16px',
                background: '#f1f5f9',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                fontSize: '18px',
                fontWeight: 'bold',
                color: '#64748b',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              &times;
            </button>

            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
              Size & Space Specs
            </span>

            <h3 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: '12px 0 10px 0' }}>
              📐 Clearance & Dimensions
            </h3>

            {/* Spider-Man Image Overlay Card */}
            <div style={{ position: 'relative', borderRadius: '12px', overflow: 'hidden', border: '1px solid #cbd5e1', marginBottom: '14px' }}>
              <img 
                src={featuredImage} 
                alt="Spider-Man Bouncy Castle Specs" 
                style={{ width: '100%', height: '180px', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'rgba(15, 23, 42, 0.85)',
                color: 'white',
                padding: '8px 12px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: '14px',
                letterSpacing: '0.5px'
              }}>
                26ft Long × 13ft Wide × 13ft High
              </div>
            </div>

            <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.5', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <p style={{ margin: '0 0 6px 0' }}><strong>Requirements:</strong></p>
              <ul style={{ paddingLeft: '18px', margin: 0 }}>
                <li>Flat, clean grass or smooth pavement.</li>
                <li>Clear overhead clearance (no low branches or wires).</li>
                <li>Standard household outlet within 100ft.</li>
              </ul>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '18px' }}>
              <a
                href="/#booking"
                onClick={() => {
                  trackButtonClick('clicked_book_now');
                  setShowSpaceModal(false);
                }}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#2563eb',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '12px 0',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                📅 Fits My Space – Proceed to Book
              </a>

              {/* CROSS-NAVIGATION BUTTON TO PRICE & PACKAGES */}
              <button
                onClick={() => {
                  trackButtonClick('click_space_modal_switch_to_price');
                  handleIntentSelect('prices');
                }}
                style={{
                  width: '100%',
                  background: '#f8fafc',
                  color: '#0f172a',
                  fontWeight: '600',
                  padding: '10px 0',
                  borderRadius: '10px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  cursor: 'pointer',
                  textAlign: 'center'
                }}
              >
                🏷️ Check Price & Packages
              </button>

              <a
                href="https://wa.me/18682810670?text=Hi%20Rental%20Zone,%20I%20have%20a%20question%20about%20yard%20space%20requirements."
                target="_blank"
                rel="noreferrer"
                onClick={() => trackButtonClick('whatsapp_clicked')}
                style={{
                  display: 'block',
                  textAlign: 'center',
                  background: '#25d366',
                  color: 'white',
                  fontWeight: 'bold',
                  padding: '12px 0',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '14px'
                }}
              >
                💬 Unsure About Space? Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal Popup for Images */}
      {selectedImage && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowBookingPopup(false)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '900px',
              width: '100%',
              maxHeight: '90vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              style={{
                position: 'absolute',
                top: '-45px',
                right: '0',
                color: 'white',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onClick={() => setSelectedImage(null)}
            >
              &times;
            </button>
            <img 
              src={selectedImage} 
              alt="Enlarged view" 
              style={{
                maxWidth: '100%',
                maxHeight: '85vh',
                objectFit: 'contain',
                borderRadius: '8px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
              }}
            />
          </div>
        </div>
      )}

    </div>
  );
}
