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

  // Package lookup reference with reserves mapped
  const packages = {
    '2 Hours': { price: 650, deposit: 100, cogs: 35, maintenance: 10 },
    '3 Hours': { price: 900, deposit: 100, cogs: 45, maintenance: 15 },
    'Full Day / 8 Hours': { price: 1800, deposit: 100, cogs: 220, maintenance: 40 }
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

    const cleanPhone = (booking.phone || '').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hi ${booking.customer_name}! 🎉 Your deposit has been verified, and your booking for The Rental Zone LTD on ${booking.event_date} (${booking.start_time} - ${booking.end_time}) is now fully CONFIRMED! We look forward to bringing the fun.`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  // Financial Split Logic triggered when marked as Completed
  const handleMarkCompleted = async (booking) => {
    setActionMessage('');
    const pkgName = booking.package_type || '2 Hours';
    const pkgInfo = packages[pkgName] || { price: 650, deposit: 100, cogs: 35, maintenance: 10 };
    
    const totalPrice = booking.total_price || pkgInfo.price;
    const cogs = pkgInfo.cogs;
    const maintenance = pkgInfo.maintenance;
    const ownerDraw = totalPrice - (cogs + maintenance);

    const financialSplit = {
      gross_collected: totalPrice,
      security_deposit: pkgInfo.deposit,
      taxable_revenue: totalPrice,
      cogs_reserve: cogs,
      maintenance_reserve: maintenance,
      tax_provision: 0.00, // Startup grace period rule active
      owner_draw: ownerDraw
    };

    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: 'Completed',
        ...financialSplit
      })
      .eq('id', booking.id);

    if (error) {
      console.error('Error completing booking:', error.message);
      setActionMessage('❌ Failed to update booking and financial ledger.');
    } else {
      fetchBookings();
      setActionMessage(`✅ Job marked Completed & financial split logged for ${booking.customer_name}!`);
    }
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

  if (authLoading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontFamily: 'system-ui' }}>Loading portal...</div>;
  }

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

  // Confirmed Revenue Calculation (summing total price of Confirmed bookings)
  const confirmedRevenue = bookings.reduce((sum, booking) => {
    if (booking.status === 'Confirmed') {
      const pkgName = booking.package_type || '2 Hours';
      const pkgInfo = packages[pkgName] || { price: 650 };
      return sum + (booking.total_price || pkgInfo.price);
    }
    return sum;
  }, 0);

  // Realized Financial Totals from Completed Jobs
  const completedBookings = bookings.filter(b => b.status === 'Completed');
  const realizedRevenue = completedBookings.reduce((sum, b) => sum + (b.gross_collected || 0), 0);
  const totalMaintenanceReserve = completedBookings.reduce((sum, b) => sum + (b.maintenance_reserve || 0), 0);
  const totalCogsReserve = completedBookings.reduce((sum, b) => sum + (b.cogs_reserve || 0), 0);
  const totalOwnerDraw = completedBookings.reduce((sum, b) => sum + (b.owner_draw || 0), 0);

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

  return (
    <div style={{ padding: '24px 16px', maxWidth: '850px', margin: '0 auto', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ color: '#0f172a', margin: 0, fontSize: '20px' }}>🛡️ Rental Zone Admin & Ledger</h2>
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: 'white', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Confirmed Revenue</span>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#166534', marginTop: '2px' }}>TT${confirmedRevenue}</div>
        </div>
        <div style={{ background: 'white', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Pipeline Total</span>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0f172a', marginTop: '2px' }}>TT${totalRevenuePipeline}</div>
        </div>
        <div style={{ background: 'white', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Active / Confirmed</span>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>
            {confirmedCount} <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#64748b' }}>/ {totalBookingsCount}</span>
          </div>
        </div>
        <div style={{ background: 'white', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Pending Deposits</span>
          <div style={{ fontSize: '18px', fontWeight: '800', color: '#d97706', marginTop: '2px' }}>{pendingCount}</div>
        </div>
      </div>

      {/* Trinidad Compliant Accounting Split Box (Realized from Completed Jobs) */}
      <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 10px 0', textTransform: 'uppercase' }}>
          📊 Realized Financial Ledger ({completedBookings.length} Completed Jobs)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', fontSize: '13px' }}>
          <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Realized Revenue</span>
            <strong style={{ color: '#0f172a', fontSize: '15px' }}>TT${realizedRevenue}</strong>
          </div>
          <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Maintenance Reserve</span>
            <strong style={{ color: '#0284c7', fontSize: '15px' }}>TT${totalMaintenanceReserve}</strong>
          </div>
          <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Operations / Fuel (COGS)</span>
            <strong style={{ color: '#d97706', fontSize: '15px' }}>TT${totalCogsReserve}</strong>
          </div>
          <div style={{ background: 'white', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>Owner Take-Home Draw</span>
            <strong style={{ color: '#166534', fontSize: '15px' }}>TT${totalOwnerDraw}</strong>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Sorting */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px', background: 'white', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
        <div style={{ flex: '1', minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Filter Status</label>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
            <option value="All">All Statuses</option>
            <option value="Pending">Pending Deposit</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <div style={{ flex: '1', minWidth: '150px' }}>
          <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
            <option value="date-asc">Event Date (Earliest First)</option>
            <option value="date-desc">Event Date (Latest First)</option>
            <option value="name">Client Name (A-Z)</option>
          </select>
        </div>
      </div>

      {actionMessage && (
        <div style={{ background: '#f1f5f9', color: '#0f172a', padding: '10px 12px', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', border: '1px solid #cbd5e1' }}>
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
                  {booking.status === 'Completed' && booking.owner_draw !== undefined && (
                    <div style={{ color: '#166534', gridColumn: '1 / -1' }}>
                      💼 <b>Ledger Split:</b> Owner Draw: TT${booking.owner_draw} | Maint: TT${booking.maintenance_reserve} | COGS: TT${booking.cogs_reserve}
                    </div>
                  )}
                  {booking.notes && <div style={{ gridColumn: '1 / -1' }}>📝 <b>Notes:</b> {booking.notes}</div>}
                </div>

                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  {booking.status !== 'Confirmed' && (
                    <button onClick={() => handleConfirmAndMessage(booking)} style={{ background: '#22c55e', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Confirm & WhatsApp Client
                    </button>
                  )}
                  {booking.status !== 'Completed' && (
                    <button onClick={() => handleMarkCompleted(booking)} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                      Mark Completed & Split Ledger
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
