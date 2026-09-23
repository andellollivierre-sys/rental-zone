import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import FunnelAnalytics from './FunnelAnalytics';

const ADMIN_EMAIL = 'andell.ollivierre@gmail.com'; 

export default function AdminDashboard() {
  // Authentication states
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);

  // Dashboard & Analytics states
  const [bookings, setBookings] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');
  const [activeTab, setActiveTab] = useState('bookings'); // 'bookings', 'analytics', or 'funnel'

  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
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

  // Fetch dashboard data only when authenticated
  useEffect(() => {
    if (session) {
      fetchDashboardData();
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

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [bookingsRes, visitorsRes] = await Promise.all([
        supabase.from('bookings').select('*').order('event_date', { ascending: true }),
        supabase.from('page_visits').select('*').order('visited_at', { ascending: false })
      ]);

      if (bookingsRes.error) throw bookingsRes.error;
      if (visitorsRes.error) throw visitorsRes.error;

      setBookings(bookingsRes.data || []);
      setVisitors(visitorsRes.data || []);
    } catch (err) {
      console.error('Error fetching dashboard metrics:', err);
    } finally {
      setLoading(false);
    }
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
      fetchDashboardData();
      return true;
    }
  };

  const handleConfirmAndMessage = async (booking) => {
    const success = await updateStatus(booking.id, 'Confirmed', booking);
    if (!success) return;

    const cleanPhone = (booking.phone || '').replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Hi ${booking.customer_name || booking.client_name || 'Valued Client'}! 🎉 Your deposit has been verified, and your booking for The Rental Zone LTD on ${booking.event_date} (${booking.start_time} - ${booking.end_time}) is now fully CONFIRMED! We look forward to bringing the fun.`
    );

    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

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
      tax_provision: 0.00,
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
      fetchDashboardData();
      setActionMessage(`✅ Job marked Completed & financial split logged for ${booking.customer_name || booking.client_name || 'Client'}!`);
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

  // Analytics & Filtering calculations (using LIVE non-test data for accurate analytics)
  const liveVisitors = visitors.filter(v => !v.is_test);
  const liveBookings = bookings.filter(b => !b.is_test);

  const totalVisitorsCount = liveVisitors.length;
  const totalBookingsCount = liveBookings.length;
  
  const conversionRate = totalVisitorsCount > 0 
    ? ((totalBookingsCount / totalVisitorsCount) * 100).toFixed(1) 
    : '0.0';

  const confirmedCount = liveBookings.filter(b => (b.status || 'Pending') === 'Confirmed').length;
  const pendingCount = liveBookings.filter(b => (b.status || 'Pending') === 'Pending' || b.status === 'Pending Deposit').length;
  
  const pipelineTotal = liveBookings.reduce((sum, booking) => {
    if (booking.status === 'Cancelled') return sum;
    const pkgName = booking.package_type || '2 Hours';
    const pkgInfo = packages[pkgName] || { price: 650 };
    return sum + (booking.total_price || pkgInfo.price);
  }, 0);

  const confirmedRevenue = liveBookings.reduce((sum, booking) => {
    if (booking.status === 'Confirmed') {
      const pkgName = booking.package_type || '2 Hours';
      const pkgInfo = packages[pkgName] || { price: 650 };
      return sum + (booking.total_price || pkgInfo.price);
    }
    return sum;
  }, 0);

  const completedBookings = liveBookings.filter(b => b.status === 'Completed');
  const realizedRevenue = completedBookings.reduce((sum, b) => sum + (b.gross_collected || 0), 0);
  const totalMaintenanceReserve = completedBookings.reduce((sum, b) => sum + (b.maintenance_reserve || 0), 0);
  const totalCogsReserve = completedBookings.reduce((sum, b) => sum + (b.cogs_reserve || 0), 0);
  const totalOwnerDraw = completedBookings.reduce((sum, b) => sum + (b.owner_draw || 0), 0);

  // Aggregations
  const trafficBreakdown = liveVisitors.reduce((acc, visit) => {
    const source = visit.traffic_source || 'direct';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  const deviceBreakdown = {};
  liveBookings.forEach(b => {
    const dev = b.device_type || 'Unknown';
    deviceBreakdown[dev] = (deviceBreakdown[dev] || 0) + 1;
  });

  // Filter and sort bookings view
  const filteredBookings = bookings.filter(b => {
    const bookingStatus = b.status || 'Pending';
    if (statusFilter === 'Pending' && bookingStatus !== 'Pending' && bookingStatus !== 'Pending Deposit') return false;
    if (statusFilter !== 'All' && statusFilter !== 'Pending' && bookingStatus.toLowerCase() !== statusFilter.toLowerCase()) return false;
    if (sourceFilter !== 'All' && (b.traffic_source || 'direct').toLowerCase() !== sourceFilter.toLowerCase()) return false;
    return true;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (sortBy === 'date-asc') {
      return new Date(a.event_date || 0) - new Date(b.event_date || 0);
    } else if (sortBy === 'date-desc') {
      return new Date(b.event_date || 0) - new Date(a.event_date || 0);
    } else if (sortBy === 'name') {
      return (a.customer_name || a.client_name || '').localeCompare(b.customer_name || b.client_name || '');
    }
    return 0;
  });

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#64748b' }}>
        Loading live analytics and bookings...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '16px', fontFamily: 'system-ui, sans-serif', color: '#0f172a', boxSizing: 'border-box', maxWidth: '900px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🛡️ Rental Zone Admin & Ledger
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={fetchDashboardData}
            style={{ background: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Refresh
          </button>
          <button 
            onClick={() => supabase.auth.signOut()} 
            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
          >
            Sign Out
          </button>
        </div>
      </div>

      {actionMessage && (
        <div style={{ padding: '10px 14px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', marginBottom: '16px', fontSize: '13px', fontWeight: 'bold', color: '#0f172a' }}>
          {actionMessage}
        </div>
      )}

      {/* Top Metrics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        
        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
            Confirmed Revenue
          </span>
          <span style={{ fontSize: '22px', fontWeight: '800', color: '#16a34a' }}>
            TT${confirmedRevenue}
          </span>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
            Pipeline Total
          </span>
          <span style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a' }}>
            TT${pipelineTotal}
          </span>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
            Active / Confirmed
          </span>
          <span style={{ fontSize: '22px', fontWeight: '800', color: '#2563eb' }}>
            {confirmedCount} <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 'normal' }}>/ {totalBookingsCount}</span>
          </span>
        </div>

        <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <span style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
            Pending Deposits
          </span>
          <span style={{ fontSize: '22px', fontWeight: '800', color: '#d97706' }}>
            {pendingCount}
          </span>
        </div>

      </div>

      {/* Realized Financial Ledger Summary Box */}
      <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', marginBottom: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: '#0f172a', margin: '0 0 12px 0', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
          📊 Realized Financial Ledger ({completedBookings.length} Completed Jobs)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b', fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Realized Revenue</span>
            <strong style={{ color: '#0f172a', fontSize: '16px' }}>TT${realizedRevenue}</strong>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b', fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Maintenance Reserve</span>
            <strong style={{ color: '#0284c7', fontSize: '16px' }}>TT${totalMaintenanceReserve}</strong>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b', fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Operations / Fuel (COGS)</span>
            <strong style={{ color: '#d97706', fontSize: '16px' }}>TT${totalCogsReserve}</strong>
          </div>
          <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <span style={{ color: '#64748b', fontSize: '11px', display: 'block', textTransform: 'uppercase', fontWeight: 'bold' }}>Owner Take-Home Draw</span>
            <strong style={{ color: '#166534', fontSize: '16px' }}>TT${totalOwnerDraw}</strong>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px' }}>
        <button 
          onClick={() => setActiveTab('bookings')} 
          style={{ background: activeTab === 'bookings' ? '#0f172a' : '#f1f5f9', color: activeTab === 'bookings' ? 'white' : '#475569', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
        >
          📋 Bookings & Management
        </button>
        <button 
          onClick={() => setActiveTab('analytics')} 
          style={{ background: activeTab === 'analytics' ? '#0f172a' : '#f1f5f9', color: activeTab === 'analytics' ? 'white' : '#475569', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
        >
          📊 Traffic & Analytics
        </button>
        <button 
          onClick={() => setActiveTab('funnel')} 
          style={{ background: activeTab === 'funnel' ? '#0f172a' : '#f1f5f9', color: activeTab === 'funnel' ? 'white' : '#475569', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}
        >
          📉 Funnel & Drop-Offs
        </button>
      </div>

      {/* CONDITIONAL TAB VIEW */}
      {activeTab === 'analytics' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '10px' }}>
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Total Visitors</span>
              <span style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a' }}>{totalVisitorsCount}</span>
            </div>
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Total Bookings</span>
              <span style={{ fontSize: '24px', fontWeight: '800', color: '#2563eb' }}>{totalBookingsCount}</span>
            </div>
            <div style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>Conversion Rate</span>
              <span style={{ fontSize: '24px', fontWeight: '800', color: '#16a34a' }}>{conversionRate}%</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '14px', textTransform: 'uppercase' }}>
                🌐 Traffic Sources
              </h3>
              {Object.keys(trafficBreakdown).length === 0 ? (
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>No visitor traffic recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(trafficBreakdown).map(([source, count]) => (
                    <div key={source} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: '600', fontSize: '14px', color: '#334155' }}>{source}</span>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>{count} visits</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#0f172a', marginBottom: '14px', textTransform: 'uppercase' }}>
                📱 Device Types
              </h3>
              {Object.keys(deviceBreakdown).length === 0 ? (
                <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>No device data recorded yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {Object.entries(deviceBreakdown).map(([device, count]) => (
                    <div key={device} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px', color: '#334155' }}>{device}</span>
                      <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#0f172a' }}>{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : activeTab === 'funnel' ? (
        <FunnelAnalytics />
      ) : (
        /* --- BOOKINGS & MANAGEMENT VIEW --- */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Control Bar: Filters & Sorting */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', background: 'white', padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ flex: '1', minWidth: '140px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Filter Status</label>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                <option value="All">All Statuses</option>
                <option value="Pending">Pending Deposit</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '140px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Traffic Source</label>
              <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                <option value="All">All Sources</option>
                <option value="direct">Direct / Organic</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="google">Google Ads</option>
              </select>
            </div>
            <div style={{ flex: '1', minWidth: '140px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px', textTransform: 'uppercase' }}>Sort By</label>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}>
                <option value="date-asc">Event Date (Earliest First)</option>
                <option value="date-desc">Event Date (Latest First)</option>
                <option value="name">Customer Name</option>
              </select>
            </div>
          </div>

          {/* Bookings Section */}
          <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '20px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#0f172a', marginBottom: '14px' }}>
              📝 Manage Bookings ({sortedBookings.length})
            </h3>
            {sortedBookings.length === 0 ? (
              <p style={{ fontSize: '13px', color: '#64748b', margin: 0 }}>No bookings match the selected filters.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {sortedBookings.map((booking) => {
                  const currentStatus = booking.status || 'Pending';
                  const badgeBg = currentStatus === 'Confirmed' ? '#dcfce7' : currentStatus === 'Completed' ? '#e0f2fe' : currentStatus === 'Cancelled' ? '#fee2e2' : '#fef3c7';
                  const badgeColor = currentStatus === 'Confirmed' ? '#166534' : currentStatus === 'Completed' ? '#0369a1' : currentStatus === 'Cancelled' ? '#991b1b' : '#d97706';
                  
                  const pkgName = booking.package_type || '2 Hours';
                  const pkgInfo = packages[pkgName] || { price: 650, deposit: 100 };
                  const totalPrice = booking.total_price || pkgInfo.price;
                  const balance = totalPrice - pkgInfo.deposit;

                  return (
                    <div key={booking.id || booking.created_at} style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '15px', color: '#0f172a' }}>
                            {booking.customer_name || booking.client_name || 'Unnamed Client'}
                          </div>
                          <div style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                            📞 <strong>Phone:</strong> {booking.phone || 'No phone'} &nbsp;&nbsp;&nbsp; 📅 <strong>Date:</strong> {booking.event_date || 'Date not set'}
                          </div>
                          <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                            ⏰ <strong>Time:</strong> {booking.start_time || '??'} - {booking.end_time || '??'} ({pkgName})
                          </div>
                          <div style={{ fontSize: '13px', color: '#475569', marginTop: '2px' }}>
                            📍 <strong>Address:</strong> {booking.address || 'Not specified'} &nbsp;&nbsp;&nbsp; 💰 <strong>Total:</strong> TT${totalPrice} (Bal: TT${balance}) &nbsp;&nbsp;&nbsp; 📢 <strong>Source:</strong> {booking.traffic_source || 'direct'}
                          </div>
                        </div>
                        <div>
                          <span style={{ background: badgeBg, color: badgeColor, padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', textTransform: 'uppercase' }}>
                            {currentStatus}
                          </span>
                        </div>
                      </div>

                      {/* Management Action Buttons */}
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                        {currentStatus !== 'Confirmed' && (
                          <button 
                            onClick={() => handleConfirmAndMessage(booking)}
                            style={{ background: '#16a34a', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            ✅ Verify & WhatsApp Confirm
                          </button>
                        )}
                        {currentStatus !== 'Completed' && (
                          <button 
                            onClick={() => handleMarkCompleted(booking)}
                            style={{ background: '#0284c7', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            🏁 Mark Completed & Split Ledger
                          </button>
                        )}
                        {currentStatus !== 'Cancelled' && (
                          <button 
                            onClick={() => updateStatus(booking.id, 'Cancelled', booking)}
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                          >
                            ❌ Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
