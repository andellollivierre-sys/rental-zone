import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const ADMIN_EMAIL = 'andell.ollivierre@gmail.com'; 

export default function AdminDashboard() {
  // Authentication states
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  // Dashboard states
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('date-asc');

  // Package lookup reference
  const packages = {
    '2 Hours': { price: 650, deposit: 100 },
    '3 Hours': { price: 900, deposit: 100 },
    'Full Day / 8 Hours': { price: 1800, deposit: 100 }
  };

  // Check auth session on load
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch bookings only when authenticated
  useEffect(() => {
    if (session) {
      fetchBookings();
    }
  }, [session]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError(null);
    
    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setLoginError('Access denied. Unauthorized account.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setLoginError(error.message);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('event_date', { ascending: true });
    
    if (!error) setBookings(data || []);
    setLoading(false);
  };

  const updateStatus = async (id, newStatus, currentBooking) => {
    setActionMessage('');

    if (newStatus === 'Confirmed') {
      const { data: confirmedBookings, error: fetchError } = await supabase
        .from('bookings')
        .select('*')
        .eq('event_date', currentBooking.event_date)
        .eq('status', 'Confirmed')
        .neq('id', id);

      if (!fetchError && confirmedBookings) {
        const hasConflict = confirmedBookings.some((b) => {
          return currentBooking.start_time < b.end_time && currentBooking.end_time > b.start_time;
        });

        if (hasConflict) {
          setActionMessage(`❌ Cannot confirm: Time conflict with another confirmed booking on ${currentBooking.event_date}!`);
          return false;
        }
      }
    }

    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      console.error('Error updating status:', error.message);
      setActionMessage('❌ Failed to update booking status.');
      return false;
    } else {
      fetchBookings();
      return true;
    }
  };

  const handleConfirmAndMessage = async (booking) => {
    const success = await updateStatus(booking.id, 'Confirmed', booking);
    if (!success) return;

    // Format the phone number (removes dashes/spaces/letters, ensures clean numbers)
    const cleanPhone = (booking.phone || '').replace(/[^0-9]/g, '');
    
    // Create custom confirmation message
    const message = encodeURIComponent(
      `Hi ${booking.customer_name}! 🎉 Your deposit has been verified, and your booking for The Rental Zone LTD on ${booking.event_date} (${booking.start_time} - ${booking.end_time}) is now fully CONFIRMED! We look forward to bringing the fun.`
    );

    // Open WhatsApp Web/App with the pre-filled message
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'Confirmed':
        return { background: '#dcfce7', color: '#166534' };
      case 'Completed':
        return { background: '#e0f2fe', color: '#0369a1' };
      case 'Cancelled':
        return { background: '#fee2e2', color: '#991b1b' };
      default:
        return { background: '#fef3c7', color: '#d97706' };
    }
  };

  // If session is checking, show loading indicator
  if (authLoading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'system-ui' }}>Loading portal...</div>;
  }

  // If user logged in with a different email, lock them out instantly
  if (session && session.user?.email?.toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
    supabase.auth.signOut();
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'system-ui' }}>
        <h2 style={{ color: '#dc2626' }}>⛔ Access Denied</h2>
        <p>This admin dashboard is strictly restricted to the owner.</p>
        <button onClick={() => window.location.reload()} style={{ marginTop: '10px', padding: '8px 16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Back to Login</button>
      </div>
    );
  }

  // If not logged in at all, show login form
  if (!session) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh', fontFamily: 'system-ui, sans-serif' }}>
        <form onSubmit={handleLogin} style={{ background: 'white', padding: '30px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '100%', maxWidth: '360px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#0f172a', textAlign: 'center' }}>🔒 Owner Admin Login</h2>
          <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '20px', textAlign: 'center' }}>Enter your credentials to view management controls.</p>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 'bold', color: '#475569', marginBottom: '4px' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }}
            />
          </div>

          <button 
            type="submit" 
            style={{ width: '100%', background: '#2563eb', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Sign In
          </button>

          {loginError && <p style={{ color: '#dc2626', fontSize: '12px', marginTop: '12px', textAlign: 'center' }}>{loginError}</p>}
        </form>
      </div>
    );
  }

  // Analytics calculations
  const totalBookingsCount = bookings.length;
  const confirmedCount = bookings.filter(b => (b.status || 'Pending') === 'Confirmed').length;
  const pendingCount = bookings.filter(b => (b.status || 'Pending') === 'Pending' || b.status === 'Pending Deposit').length;
  
  const totalRevenuePipeline = bookings.reduce((sum, booking) => {
    if (booking.status === 'Cancelled') return sum;
    const pkgName = booking.package_type || '2 Hours';
    const pkgInfo = packages[pkgName] || { price: 650 };
    return sum + (booking.total_price || pkgInfo.price);
  }, 0);

  const confirmedRevenue = bookings.reduce((sum, booking) => {
    if (booking.status === 'Confirmed' || booking.status === 'Completed') {
      const pkgName = booking.package_type || '2 Hours';
      const pkgInfo = packages[pkgName] || { price: 650 };
      return sum + (booking.total_price || pkgInfo.price);
    }
    return sum;
  }, 0);

  // Filter logic
  const filteredBookings = bookings.filter(b => {
    const bookingStatus = b.status || 'Pending';
    if (statusFilter === 'All') return true;
    if (statusFilter === 'Pending') {
      return bookingStatus === 'Pending' || bookingStatus === 'Pending Deposit';
    }
    return bookingStatus.toLowerCase() === statusFilter.toLowerCase();
  });

  // Sort logic
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'date-asc') {
      return new Date(a.event_date) - new Date(b.event_date);
    } else if (sortBy === 'date-desc') {
      return new Date(b.event_date) - new Date(a.event_date);
    } else if (sortBy === 'name') {
      return (a.customer_name || '').localeCompare(b.customer_name || '');
    }
    return 0;
  });

  // Render full dashboard when successfully logged in as the owner
  return (
    <div style={{ padding: '24px 16px', maxWidth: '800px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ color: '#0f172a', margin: 0, fontSize: '20px' }}>🛡️ Rental Zone Admin Dashboard</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={fetchBookings} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
            Refresh
          </button>
          <button onClick={() => supabase.auth.signOut()} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
            Sign Out
          </button>
        </div>
      </div>

      {/* Analytics Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: 'white', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Confirmed Revenue</span>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#166534', marginTop: '2px' }}>TT${confirmedRevenue}</div>
        </div>
        <div style={{ background: 'white', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Pipeline Total</span>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>TT${totalRevenuePipeline}</div>
        </div>
        <div style={{ background: 'white', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Active / Confirmed</span>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>
            {confirmedCount} <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748b' }}>/ {totalBookingsCount}</span>
          </div>
        </div>
        <div style={{ background: 'white', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.02)' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Pending Deposits</span>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#d97706', marginTop: '2px' }}>{pendingCount}</div>
        </div>
      </div>

      {/* Control Bar: Filters & Sorting */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', background: 'white', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        
        {/* Status Filter Dropdown */}
        <div style={{ flex: '1', minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
            Filter Status
          </label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Deposit</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>

        {/* Date / Name Sorting Dropdown */}
        <div style={{ flex: '1', minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>
            Sort By
          </label>
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
          >
            <option value="date-asc">Event Date (Earliest First)</option>
            <option value="date-desc">Event Date (Latest First)</option>
            <option value="name">Client Name (A-Z)</option>
          </select>
        </div>

      </div>

      {actionMessage && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px' }}>
          {actionMessage}
        </div>
      )}

      {loading ? (
        <p style={{ color: '#64748b' }}>Loading bookings...</p>
      ) : sortedBookings.length === 0 ? (
        <p style={{ color: '#64748b' }}>No bookings match this filter.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {sortedBookings.map((booking) => {
            const pkgName = booking.package_type || '2 Hours';
            const pkgInfo = packages[pkgName] || { price: 650, deposit: 100 };
            const totalPrice = booking.total_price || pkgInfo.price;
            const balanceDue = booking.balance_due !== null && booking.balance_due !== undefined ? booking.balance_due : (totalPrice - pkgInfo.deposit);

            return (
              <div key={booking.id} style={{ background: 'white', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: '#0f172a', fontSize: '15px' }}>{booking.customer_name}</span>
                  <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: 'bold', ...getStatusBadgeStyle(booking.status) }}>
                    {booking.status || 'Pending'}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px', color: '#475569', fontSize: '13px', marginBottom: '12px' }}>
                  <div>📞 <b>Phone:</b> {booking.phone}</div>
                  <div>📅 <b>Date:</b> {booking.event_date}</div>
                  <div>⏰ <b>Time:</b> {booking.start_time} - {booking.end_time} ({pkgName})</div>
                  <div>📍 <b>Address:</b> {booking.address}</div>
                  <div>💰 <b>Total:</b> TT${totalPrice} (Bal: TT${balanceDue})</div>
                  {booking.notes && <div>📝 <b>Notes:</b> {booking.notes}</div>}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  {booking.status !== 'Confirmed' && (
                    <button onClick={() => handleConfirmAndMessage(booking)} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Confirm & WhatsApp Client
                    </button>
                  )}
                  {booking.status !== 'Completed' && (
                    <button onClick={() => updateStatus(booking.id, 'Completed', booking)} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Mark Completed
                    </button>
                  )}
                  {booking.status !== 'Cancelled' && (
                    <button onClick={() => updateStatus(booking.id, 'Cancelled', booking)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
