import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Clock, CheckCircle, PartyPopper, XCircle, Package, Scale, Coins, Globe, LayoutDashboard, ShoppingCart, User, Leaf } from 'lucide-react';

const STATUS_BADGE = {
  PENDING:   { cls: 'badge-amber', label: <span style={{display: 'flex', alignItems: 'center', gap: 4}}><Clock size={12} /> Pending</span> },
  CONFIRMED: { cls: 'badge-blue',  label: <span style={{display: 'flex', alignItems: 'center', gap: 4}}><CheckCircle size={12} /> Confirmed</span> },
  COMPLETED: { cls: 'badge-green', label: <span style={{display: 'flex', alignItems: 'center', gap: 4}}><PartyPopper size={12} /> Completed</span> },
  CANCELLED: { cls: 'badge-gray',  label: <span style={{display: 'flex', alignItems: 'center', gap: 4}}><XCircle size={12} /> Cancelled</span> },
};

const DEMO_ORDERS = [
  { _id: 'ord001', store: { name: 'The Artisan Oven' }, items: [{ name: 'Sourdough Loaf', quantity: 2 }], totalPrice: 90, status: 'COMPLETED', createdAt: new Date(Date.now() - 2 * 86400000).toISOString() },
  { _id: 'ord002', store: { name: 'Green Leaf Kitchen' }, items: [{ name: 'Organic Spinach', quantity: 3 }], totalPrice: 60, status: 'CONFIRMED', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { _id: 'ord003', store: { name: 'Le Petit Sucre' }, items: [{ name: 'Croissant Box' }], totalPrice: 80, status: 'PENDING', createdAt: new Date().toISOString() },
  { _id: 'ord004', store: { name: 'Desi Dairy' }, items: [{ name: 'Aged Cheddar' }], totalPrice: 120, status: 'CANCELLED', createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
];



export default function ConsumerDashboard() {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [avatarFile, setAvatarFile] = useState(null);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      if (profileForm.name) formData.append('name', profileForm.name);
      if (profileForm.phone) formData.append('phone', profileForm.phone);
      if (avatarFile) formData.append('avatar', avatarFile);

      const { data } = await api.put('/auth/profile', formData);
      updateProfile(data);
      setShowEditProfile(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  useEffect(() => {
    api.get('/orders/me')
      .then(r => setOrders(r.data.orders || r.data || []))
      .catch(() => setOrders(DEMO_ORDERS))
      .finally(() => setLoading(false));
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (!confirm('Cancel this order? The items will be restocked.')) return;
    try {
      const { data } = await api.patch(`/orders/${orderId}/cancel`);
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: data.status } : o));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not cancel order.');
    }
  };

  const displayOrders = orders.length > 0 ? orders : DEMO_ORDERS;

  // Compute real stats from actual orders
  const realOrders = orders.length > 0 ? orders : [];
  const totalOrders = realOrders.length;
  const moneySaved = realOrders.reduce((sum, o) => {
    const orig = o.items?.reduce((s, i) => s + ((i.originalPrice || i.price || 0) * (i.quantity || 1)), 0) || 0;
    const paid = o.totalPrice || 0;
    return sum + Math.max(0, orig - paid);
  }, 0);
  const kgRescued = realOrders.reduce((sum, o) => sum + (o.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 0), 0);
  const co2Saved = Math.round(kgRescued * 2.5);

  const realStats = [
    { icon: <Package size={28} strokeWidth={1.5} />, value: totalOrders, label: 'Orders Placed', change: totalOrders === 0 ? 'No orders yet' : `${totalOrders} total` },
    { icon: <Scale size={28} strokeWidth={1.5} />, value: `${kgRescued} kg`, label: 'Food Rescued', change: kgRescued === 0 ? 'Start rescuing!' : `${kgRescued} items rescued` },
    { icon: <Coins size={28} strokeWidth={1.5} />, value: `₹${moneySaved.toFixed(0)}`, label: 'Money Saved', change: moneySaved === 0 ? 'Savings appear here' : `Total savings` },
    { icon: <Globe size={28} strokeWidth={1.5} />, value: `${co2Saved} kg`, label: 'CO₂ Prevented', change: co2Saved === 0 ? 'Make an impact!' : `~2.5kg per item` },
  ];
  const kgGoal = 50;
  const progressPct = Math.min(100, Math.round((kgRescued / kgGoal) * 100));
  const impactLevel = kgRescued < 10 ? 'Food Rookie' : kgRescued < 30 ? 'Food Rescuer' : kgRescued < 50 ? 'Food Guardian' : 'Eco Hero';
  const kgToNext = kgRescued < 10 ? 10 - kgRescued : kgRescued < 30 ? 30 - kgRescued : kgRescued < 50 ? 50 - kgRescued : 0;

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} strokeWidth={1.5} />, label: 'Dashboard' },
    { id: 'orders',    icon: <Package size={18} strokeWidth={1.5} />, label: 'My Orders' },
    { id: 'browse',    icon: <ShoppingCart size={18} strokeWidth={1.5} />, label: 'Browse', link: '/browse' },
    { id: 'profile',   icon: <User size={18} strokeWidth={1.5} />, label: 'Profile' },
  ];

  return (
    <div className="dashboard-layout">
      {/* Sidebar - Editorial */}
      <aside className="sidebar">
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--outline-variant)', marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', marginBottom: 12, border: '1px solid var(--primary)', fontFamily: 'var(--font-display)', fontWeight: 700 }}>
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--on-surface)' }}>{user?.name || 'Consumer'}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--on-surface-variant)', letterSpacing: '0.5px' }}>{user?.email || 'user@example.com'}</div>
          <div style={{ marginTop: 12 }}><span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Leaf size={12} strokeWidth={1.5} /> Food Rescuer</span></div>
        </div>
        
        <div className="sidebar-section-title">Menu</div>
        {navItems.map(item => (
          <button
            key={item.id}
            className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => { if (item.link) navigate(item.link); else setActiveTab(item.id); }}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </aside>

      <main className="dashboard-main">
        {activeTab === 'dashboard' && (
          <>
            <div style={{ borderBottom: '1px solid var(--primary)', paddingBottom: 24, marginBottom: 32, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div>
                <h2 className="display-sm" style={{ color: 'var(--primary)' }}>Welcome back, {user?.name?.split(' ')[0] || 'Rescuer'}!</h2>
                <p className="body-md mt-2" style={{ fontStyle: 'italic', color: 'var(--on-surface-variant)' }}>Here is your food rescue impact diary.</p>
              </div>
              <Link to="/browse" className="btn btn-outline btn-sm">Find Deals →</Link>
            </div>

            {/* Stats - Grid matching editorial */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid var(--primary)', marginBottom: 40 }}>
              {realStats.map((s, i) => (
                <div key={i} style={{ padding: '24px', borderRight: i < 3 ? '1px solid var(--primary)' : 'none', background: 'var(--surface)' }}>
                  <div style={{ marginBottom: 12, color: 'var(--primary)' }}>{s.icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{s.value}</div>
                  <div className="label-sm" style={{ marginTop: 8, color: 'var(--on-surface-variant)' }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', marginTop: 4, fontStyle: 'italic', color: 'var(--on-surface-variant)' }}>{s.change}</div>
                </div>
              ))}
            </div>

            {/* Impact bar */}
            <div className="editorial-box" style={{ padding: '32px', marginBottom: 40, display: 'flex', gap: 32, background: 'var(--surface-low)' }}>
              <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'transparent', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Leaf size={40} strokeWidth={1} style={{ color: 'var(--primary)' }} /></div>
              <div style={{ flex: 1 }}>
                 <div className="title-md" style={{ color: 'var(--primary)', marginBottom: 4 }}>Impact Level: {impactLevel}</div>
                 <div className="body-md mb-3" style={{ fontStyle: 'italic', color: 'var(--on-surface-variant)' }}>
                   {kgRescued === 0 ? 'Place your first order to start your impact journey!' : kgToNext > 0 ? `${kgRescued}kg rescued — ${kgToNext}kg to reach next level!` : '🎉 You have reached Eco Hero status!'}
                 </div>
                 <div className="progress-bar" style={{ background: 'var(--surface-high)' }}>
                   <div className="progress-bar-fill" style={{ width: `${progressPct}%` }} />
                 </div>
                 <div className="label-sm mt-2" style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--on-surface)' }}>
                   <span>{kgRescued} kg rescued</span><span>{kgGoal} kg goal</span>
                 </div>
              </div>
            </div>

            {/* Recent orders */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="title-lg">Recent Orders</h3>
              </div>
              {loading ? <div className="loading-spinner" /> : (
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Store</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayOrders.slice(0, 5).map(order => {
                        const badge = STATUS_BADGE[order.status] || STATUS_BADGE.PENDING;
                        return (
                          <tr key={order._id}>
                            <td><span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>#{order._id.slice(-6).toUpperCase()}</span></td>
                            <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{order.store?.name || '—'}</td>
                            <td style={{ fontStyle: 'italic', color: 'var(--on-surface-variant)' }}>
                              {order.items?.map(i => `${i.quantity} ${i.unit || 'item'}${(i.quantity !== 1 && (!i.unit || i.unit === 'item')) ? 's' : ''} ${i.name || i.product?.name}`).filter(Boolean).join(', ') || '—'}
                            </td>
                            <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary)' }}>₹{order.totalPrice?.toFixed(2)}</span></td>
                            <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                            <td style={{ fontSize: '0.8125rem' }}>
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <div style={{ borderBottom: '1px solid var(--primary)', paddingBottom: 24, marginBottom: 32 }}>
              <h2 className="display-sm" style={{ color: 'var(--primary)' }}>Order History</h2>
            </div>
            {loading ? <div className="loading-spinner" /> : (
              <div className="table-container">
                <table className="table">
                  <thead>
                    <tr>
                       <th>Order ID</th><th>Store</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th></th>
                     </tr>
                  </thead>
                  <tbody>
                      {displayOrders.map(order => {
                        const badge = STATUS_BADGE[order.status] || STATUS_BADGE.PENDING;
                        return (
                          <tr key={order._id}>
                            <td><span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>#{order._id.slice(-6).toUpperCase()}</span></td>
                            <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{order.store?.name || '—'}</td>
                            <td style={{ fontStyle: 'italic', color: 'var(--on-surface-variant)' }}>
                              {order.items?.map(i => `${i.quantity} ${i.unit || 'item'}${(i.quantity !== 1 && (!i.unit || i.unit === 'item')) ? 's' : ''} ${i.name || i.product?.name}`).filter(Boolean).join(', ') || '—'}
                            </td>
                            <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary)' }}>₹{order.totalPrice?.toFixed(2)}</span></td>
                            <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                            <td style={{ fontSize: '0.8125rem' }}>
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td>
                              {order.status === 'PENDING' && (
                                <button
                                  className="btn btn-ghost btn-sm"
                                  style={{ fontSize: '0.75rem', color: 'var(--error, #c62828)', border: '1px solid currentColor', padding: '4px 10px' }}
                                  onClick={() => handleCancelOrder(order._id)}
                                >
                                  Cancel
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'profile' && (
          <div style={{ maxWidth: 600 }}>
             <div style={{ borderBottom: '1px solid var(--primary)', paddingBottom: 24, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 className="display-sm" style={{ color: 'var(--primary)' }}>Profile Details</h2>
              <button className="btn btn-primary btn-sm" onClick={() => { setProfileForm({ name: user?.name || '', phone: user?.phone || '' }); setShowEditProfile(true); }}>Edit Profile</button>
            </div>
            
            <div className="editorial-box" style={{ padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid var(--outline-variant)' }}>
                {user?.avatarUrl ? (
                  <img src={`http://localhost:5000${user.avatarUrl}`} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--outline-variant)', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--surface-low)', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontFamily: 'var(--font-display)', color: 'var(--primary)', fontWeight: 800 }}>
                    {user?.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <div>
                  <div className="display-sm" style={{ lineHeight: 1 }}>{user?.name || 'Consumer'}</div>
                  <div className="body-md mt-1" style={{ fontStyle: 'italic', color: 'var(--on-surface-variant)' }}>{user?.email}</div>
                  <span className="badge badge-green mt-3" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Leaf size={12} strokeWidth={1.5} /> Rescuer Badge</span>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[['Full Name', user?.name], ['Email Address', user?.email], ['Phone Number', user?.phone || 'Not set'], ['Account Type', user?.role]].map(([k, v], idx) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: idx !== 3 ? '1px solid var(--outline-variant)' : 'none' }}>
                    <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>{k}</span>
                    <span className="body-md" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{v || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {showEditProfile && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="flex justify-between items-center mb-6" style={{ borderBottom: '1px solid var(--primary)', paddingBottom: 16 }}>
              <h2 className="title-lg" style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Edit Profile</h2>
              <button onClick={() => setShowEditProfile(false)} className="btn-ghost" style={{ padding: '4px 12px', border: '1px solid var(--outline-variant)', background: 'transparent' }}>✕</button>
            </div>
            <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="input-group">
                <label className="input-label">Name</label>
                <input required className="input" value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Profile Image (Avatar)</label>
                <input type="file" accept="image/*" className="input" onChange={e => setAvatarFile(e.target.files[0])} style={{ padding: '8px' }} />
              </div>
              <div className="input-group">
                <label className="input-label">Phone</label>
                <input className="input" value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div className="flex gap-4 mt-6 pt-4" style={{ borderTop: '1px solid var(--outline-variant)' }}>
                <button type="button" onClick={() => setShowEditProfile(false)} className="btn btn-ghost flex-1" style={{ justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1" style={{ justifyContent: 'center' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
