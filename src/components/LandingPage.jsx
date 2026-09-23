import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Make sure this path matches your project structure

export default function LandingPage() {
  const [selectedImage, setSelectedImage] = useState(null);

  // Visitor Tracking Hook with Browser Push Notifications & Funnel Logging
  useEffect(() => {
    // Request permission for browser notifications on first load
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    const logVisitor = async () => {
      try {
        // 1. Hard stop if manual admin ignore flag is set in localStorage
        if (localStorage.getItem('ignore_visits') === 'true') {
          return;
        }

        // 2. Check if an admin/user session is currently active
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          return; // Skip logging if admin is browsing/testing logged in
        }

        const params = new URLSearchParams(window.location.search);
        const utmSource = params.get('utm_source') || params.get('traffic_source') || 'direct';
        const utmCampaign = params.get('utm_campaign') || 'none';
        
        // Detect mobile vs desktop
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        const deviceType = isMobile ? 'Mobile' : 'Desktop';
        
        // Check for admin/test flag
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

        // --- Log Funnel Event (Viewed Form) Safely ---
        let sessionId = sessionStorage.getItem('rental_session_id');
        if (!sessionId) {
          sessionId = 'sess_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
          sessionStorage.setItem('rental_session_id', sessionId);
        }

        const funnelLogged = sessionStorage.getItem('funnel_viewed_logged');
        if (!funnelLogged) {
          await supabase.from('booking_funnel_events').insert([
            {
              session_id: sessionId,
              step_name: 'viewed_form'
            }
          ]);
          sessionStorage.setItem('funnel_viewed_logged', 'true');
        }
        // ---------------------------------------------

        // 3. Trigger Native Browser Push Notification for Real Visitors
        if ("Notification" in window && Notification.permission === "granted" && !isTest) {
          new Notification("🎉 New Page Visitor!", {
            body: `Source: ${utmSource.toUpperCase()} (${deviceType})`,
            icon: '/favicon.ico'
          });
        }

      } catch (err) {
        // Fail silently so it never breaks the user experience
        console.error('Visitor tracking error:', err);
      }
    };

    logVisitor();
  }, []);

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
            Safe, clean, high-energy bouncy castles delivered straight to your yard. Secure your date in seconds.
          </p>
          <a 
            href="#booking" 
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
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
              fontSize: '15px',
              textAlign: 'center'
            }}
          >
            Book Your Date Now
          </a>
        </div>

        {/* Featured Inventory Card */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', marginBottom: '30px' }}>
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
              onClick={() => setSelectedImage(featuredImage)}
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
                href="#booking" 
                style={{ background: '#0f172a', color: 'white', fontSize: '13px', fontWeight: 'bold', padding: '10px 18px', borderRadius: '8px', textDecoration: 'none' }}
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
              <div key={index} style={{ height: '140px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc', cursor: 'pointer' }} onClick={() => setSelectedImage(imgUrl)}>
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
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.03)' }}>
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

      {/* Lightbox Modal Popup */}
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
          onClick={() => setSelectedImage(null)}
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
