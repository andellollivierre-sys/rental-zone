import React from 'react';

export default function LandingPage() {
  // Array of your gallery image IDs from Google Drive
  const galleryImages = [
    'https://lh3.googleusercontent.com/d/1R2HYZpIU2W0SVUAXHVKhqWh1EJjwStn_',
    'https://lh3.googleusercontent.com/d/1imAswvDpkNZh7hccA3KdISmGaWMbOEh4',
    'https://lh3.googleusercontent.com/d/1sWW7mmAEO5KEiuu9DYUXGhIvBpIX0qc4',
    'https://lh3.googleusercontent.com/d/1DY5NuxIhalDnKKbS8H5RjYulB9PnfZzz',
    'https://lh3.googleusercontent.com/d/10dR2By9pZeSMDU3C07zgkLpx-a352u8G',
    'https://lh3.googleusercontent.com/d/1MZ0rSORuTHYgMdNT0yCxAT7jDkrjrohH'
  ];

  return (
    <div style={{ width: '100%', padding: '0 0 16px 0', fontFamily: 'system-ui, sans-serif', color: '#0f172a', boxSizing: 'border-box', maxWidth: '600px', margin: '0 auto' }}>
      
      {/* Header / Navbar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#0f172a', color: 'white', borderBottomLeftRadius: '12px', borderBottomRightRadius: '12px', marginBottom: '16px' }}>
        {/* Brand / Logo Section */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
          <div style={{ width: '26px', height: '26px', borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '10px', fontWeight: '800' }}>
            TRZ
          </div>
          <span style={{ fontSize: '13px', letterSpacing: '-0.2px' }}>The Rental Zone</span>
        </div>

        {/* Navigation Links */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '13px' }}>
          <a href="#home" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold' }}>Home</a>
          <a href="#booking" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Booking</a>
          <a href="#admin" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Admin</a>
        </div>
      </div>

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

        {/* Featured Inventory Card (Spider-Man Focus) */}
        <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)', marginBottom: '30px' }}>
          <div style={{ height: '240px', background: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
            
            {/* Badge */}
            <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: '10' }}>
              <span style={{ background: '#2563eb', color: 'white', fontSize: '11px', padding: '5px 10px', borderRadius: '6px', fontWeight: 'bold' }}>
                Featured Inventory
              </span>
            </div>

            {/* Main Featured Photo from Google Drive */}
            <img 
              src="https://lh3.googleusercontent.com/d/1FeDBro65spVaWCMeeEtLRBKtSyTWOLGK" 
              alt="Spider-Man Bouncy Castle" 
              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
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
              <div key={index} style={{ height: '140px', borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', background: '#f8fafc' }}>
                <img 
                  src={imgUrl} 
                  alt={`Rental Zone Gallery ${index + 1}`} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
