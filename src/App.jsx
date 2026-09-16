import React, { useState, useEffect } from 'react';
import BookingForm from './components/BookingForm';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  const [isAdmin, setIsAdmin] = useState(window.location.hash === '#admin');

  useEffect(() => {
    const handleHashChange = () => {
      setIsAdmin(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', overflowX: 'hidden' }}>
      {/* Mobile-optimized sticky navigation bar */}
      <nav style={{ 
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
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <img 
            src="https://lh3.googleusercontent.com/d/1zK7oIDhE4G-hDWsoq9C527Y-EcXWiQRV" 
            alt="The Rental Zone Logo" 
            style={{ width: '36px', height: '36px', minWidth: '36px', borderRadius: '50%', objectFit: 'cover' }} 
          />
          <span style={{ fontWeight: 'bold', fontSize: '15px', color: '#f8fafc', whiteSpace: 'nowrap' }}>
            The Rental Zone
          </span>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <a href="#" style={{ 
            color: !isAdmin ? '#38bdf8' : '#94a3b8', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            padding: '4px 0'
          }}>
            Booking
          </a>
          <a href="#admin" style={{ 
            color: isAdmin ? '#38bdf8' : '#94a3b8', 
            textDecoration: 'none', 
            fontWeight: 'bold',
            padding: '4px 0'
          }}>
            Admin
          </a>
        </div>
      </nav>

      {/* Main Content Container */}
      <main style={{ width: '100%', maxWidth: '800px', margin: '0 auto' }}>
        {isAdmin ? <AdminDashboard /> : <BookingForm />}
      </main>
    </div>
  );
}
