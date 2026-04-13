import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { useToast } from '../components/Toast';
import ConfirmModal from '../components/ConfirmModal';
import { Package, TrendingUp, Croissant, Carrot, Milk, Beef, Fish, ShoppingBag, UtensilsCrossed, Utensils, Zap, Clock, Store, MapPin, Search, FileText, CheckCircle, XCircle, LayoutDashboard, Receipt, User, Edit, Trash2, PartyPopper } from 'lucide-react';

const CATEGORIES = ['BAKERY', 'PRODUCE', 'DAIRY', 'MEAT', 'SEAFOOD', 'PANTRY', 'PREPARED', 'OTHER'];
const CATEGORY_ICON = { BAKERY: <Croissant size={14} />, PRODUCE: <Carrot size={14} />, DAIRY: <Milk size={14} />, MEAT: <Beef size={14} />, SEAFOOD: <Fish size={14} />, PANTRY: <ShoppingBag size={14} />, PREPARED: <UtensilsCrossed size={14} />, OTHER: <Utensils size={14} /> };

const DEMO_PRODUCTS = [
  { _id: 'p1', name: 'Sourdough Loaf', category: 'BAKERY', price: 45, originalPrice: 130, quantity: 8, status: 'AVAILABLE', expiryDate: new Date().toISOString() },
  { _id: 'p2', name: 'Organic Veg Basket', category: 'PRODUCE', price: 80, originalPrice: 180, quantity: 12, status: 'AVAILABLE' },
  { _id: 'p3', name: 'Croissant Box', category: 'BAKERY', price: 80, originalPrice: 220, quantity: 4, status: 'AVAILABLE', expiryDate: new Date().toISOString() },
  { _id: 'p4', name: 'Artisan Cheddar', category: 'DAIRY', price: 120, originalPrice: 280, quantity: 0, status: 'SOLD_OUT' },
];

const DEMO_STORE_ORDERS = [
  { _id: 'o1', user: { name: 'Priya S.' }, items: [{ name: 'Sourdough Loaf', quantity: 2 }], totalPrice: 90, status: 'PENDING', createdAt: new Date().toISOString() },
  { _id: 'o2', user: { name: 'Raj M.' }, items: [{ name: 'Croissant Box' }], totalPrice: 80, status: 'CONFIRMED', createdAt: new Date(Date.now() - 3600000).toISOString() },
  { _id: 'o3', user: { name: 'Anita K.' }, items: [{ name: 'Organic Veg Basket' }], totalPrice: 80, status: 'COMPLETED', createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const STATUS_BADGE = {
  PENDING: { cls: 'badge-amber', label: <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> Pending</span> },
  CONFIRMED: { cls: 'badge-blue', label: <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><CheckCircle size={12} /> Confirmed</span> },
  COMPLETED: { cls: 'badge-green', label: <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><PartyPopper size={12} /> Completed</span> },
  CANCELLED: { cls: 'badge-gray', label: <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><XCircle size={12} /> Cancelled</span> },
};

function ProductForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState(initial || { name: '', description: '', price: '', originalPrice: '', quantity: '', unit: 'item', category: 'BAKERY', expiryDate: '' });
  const [imageFile, setImageFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    Object.keys(form).forEach(key => {
      if (form[key] !== null && form[key] !== undefined) formData.append(key, form[key]);
    });
    if (imageFile) formData.append('image', imageFile);
    await onSave(formData, form._id); // pass id if exists
    setSaving(false);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-card">
        <div className="flex justify-between items-center mb-6 border-bottom" style={{ borderBottom: '1px solid var(--primary)', paddingBottom: 16 }}>
          <h2 className="title-lg" style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>{initial?._id ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onCancel} className="btn-ghost" style={{ padding: '4px 12px', border: '1px solid var(--outline-variant)', background: 'transparent' }}>✕</button>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20, textAlign: 'left' }}>
          <div className="input-group"><label className="input-label">Product Name *</label><input required className="input" value={form.name} onChange={e => set('name', e.target.value)} /></div>
          <div className="input-group">
            <label className="input-label">Product Image</label>
            <input type="file" accept="image/*" className="input" onChange={e => setImageFile(e.target.files[0])} style={{ padding: '8px' }} />
            {initial?.imageUrl && !imageFile && <div style={{ marginTop: 8 }}><img src={initial.imageUrl?.startsWith('http') ? initial.imageUrl : `http://localhost:5000${initial.imageUrl}`} alt="Current" height={60} style={{ borderRadius: 8, border: '1px solid var(--outline-variant)' }} /></div>}
          </div>
          <div className="input-group"><label className="input-label">Description</label><textarea className="input" value={form.description} onChange={e => set('description', e.target.value)} rows={2} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="input-group"><label className="input-label">Sale Price (₹) *</label><input required type="number" className="input" value={form.price} onChange={e => set('price', e.target.value)} /></div>
            <div className="input-group"><label className="input-label">Original Price (₹)</label><input type="number" className="input" value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)} /></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <div className="input-group"><label className="input-label">Quantity *</label><input required type="number" className="input" value={form.quantity} onChange={e => set('quantity', e.target.value)} /></div>
            <div className="input-group">
              <label className="input-label">Unit</label>
              <select className="input" value={form.unit} onChange={e => set('unit', e.target.value)}>
                <option value="item">items</option>
                <option value="kg">kg</option>
                <option value="grams">grams</option>
                <option value="liters">liters</option>
                <option value="loaves">loaves</option>
                <option value="boxes">boxes</option>
                <option value="portions">portions</option>
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Category *</label>
              <select required className="input" value={form.category} onChange={e => set('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="input-group"><label className="input-label">Expiry Date</label><input type="date" className="input" value={form.expiryDate ? form.expiryDate.split('T')[0] : ''} onChange={e => set('expiryDate', e.target.value)} /></div>
          <div className="flex gap-4 mt-6 pt-4" style={{ borderTop: '1px solid var(--outline-variant)' }}>
            <button type="button" onClick={onCancel} className="btn btn-ghost flex-1" style={{ justifyContent: 'center' }}>Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary flex-1" style={{ justifyContent: 'center' }}>
              {saving ? 'Saving…' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function StoreOwnerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [storeOrders, setStoreOrders] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showEditStore, setShowEditStore] = useState(false);
  const [storeForm, setStoreForm] = useState({ name: '', city: '', description: '', address: '' });
  const [confirmState, setConfirmState] = useState(null);

  const handleUpdateStore = async (e) => {
    e.preventDefault();
    try {
      if (store?._id) {
        const { data } = await api.put(`/stores/${store._id}`, storeForm);
        setStore(data);
      } else {
        const { data } = await api.post('/stores', storeForm);
        setStore(data);
      }
      setShowEditStore(false);
      toast.success('Store profile updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Store update failed');
    }
  };

  useEffect(() => {
    Promise.all([
      api.get('/stores/my').then(r => {
        const list = r.data;
        if (Array.isArray(list) && list.length > 0) setStore(list[0]);
      }).catch(() => { }),
      api.get('/products').then(r => setProducts(r.data.products || r.data || [])).catch(() => setProducts(DEMO_PRODUCTS)),
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (store?._id) {
      api.get(`/orders/store/${store._id}`)
        .then(r => setStoreOrders(r.data.orders || r.data || []))
        .catch(() => setStoreOrders(DEMO_STORE_ORDERS));
    } else if (!loading) {
      setStoreOrders(DEMO_STORE_ORDERS);
    }
  }, [store, loading]);

  const displayProducts = products.length > 0 ? products : DEMO_PRODUCTS;
  const displayOrders = storeOrders.length > 0 ? storeOrders : DEMO_STORE_ORDERS;

  const handleSaveProduct = async (formData, id) => {
    try {
      if (id) {
        const { data } = await api.put(`/products/${id}`, formData);
        setProducts(ps => ps.map(p => p._id === id ? data : p));
        toast.success('Product updated successfully!');
      } else {
        if (!store?._id) {
          toast.warning('Set up your Store Identity (Profile tab) before adding products.');
          return;
        }
        formData.append('storeId', store._id);
        const { data } = await api.post('/products', formData);
        setProducts(ps => [...ps, data.product || data]);
        toast.success('Product added to inventory!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save product');
    }
    setShowForm(false); setEditProduct(null);
  };

  const handleDeleteProduct = (id) => {
    setConfirmState({
      message: 'Delete this product? This action cannot be undone.',
      confirmLabel: 'Delete Product',
      onConfirm: async () => {
        try { await api.delete(`/products/${id}`); } catch { }
        setProducts(ps => ps.filter(p => p._id !== id));
        toast.success('Product removed from inventory.');
      },
    });
  };

  const handleStatusUpdate = async (orderId, status) => {
    try { await api.put(`/orders/${orderId}/status`, { status }); } catch { }
    setStoreOrders(os => os.map(o => o._id === orderId ? { ...o, status } : o));
  };

  const navItems = [
    { id: 'dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { id: 'products', icon: <Package size={18} />, label: 'Inventory' },
    { id: 'orders', icon: <Receipt size={18} />, label: 'Incoming Orders' },
    { id: 'profile', icon: <Store size={18} />, label: 'Store Profile' },
  ];

  const activeOrders = displayOrders.filter(o => o.status === 'PENDING' || o.status === 'CONFIRMED').length;
  const revenue = displayOrders.filter(o => o.status !== 'CANCELLED').reduce((s, o) => s + (o.totalPrice || 0), 0);
  const statsRow = [
    { icon: <Package size={28} strokeWidth={1.5} />, value: displayProducts.length, label: 'Products Listed', change: 'Total active listings' },
    { icon: <Receipt size={28} strokeWidth={1.5} />, value: activeOrders, label: 'Active Orders', change: 'Pending + Confirmed' },
    { icon: <TrendingUp size={28} strokeWidth={1.5} />, value: `₹${revenue.toFixed(0)}`, label: 'Revenue Total', change: 'All completed orders' },
    { icon: <CheckCircle size={28} strokeWidth={1.5} />, value: displayOrders.filter(o => o.status === 'COMPLETED').length, label: 'Orders Fulfilled', change: 'Successfully completed' },
  ];

  return (
    <div className="dashboard-layout">
      {confirmState && (
        <ConfirmModal
          {...confirmState}
          onCancel={() => setConfirmState(null)}
        />
      )}
      {showForm && (
        <ProductForm
          initial={editProduct}
          onSave={handleSaveProduct}
          onCancel={() => { setShowForm(false); setEditProduct(null); }}
        />
      )}

      {/* Sidebar - Editorial */}
      <aside className="sidebar">
        <div style={{ padding: '0 20px 24px', borderBottom: '1px solid var(--outline-variant)', marginBottom: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'transparent', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', marginBottom: 12 }}><Store size={20} strokeWidth={1.5} /></div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--on-surface)' }}>{store?.name || user?.name || 'My Store'}</div>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--on-surface-variant)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>{store?.city || 'Partner Merchant'}</div>
          {store?.isVerified && <span className="badge badge-green mt-3">✓ Verified</span>}
        </div>

        <div className="sidebar-section-title">Store Management</div>
        {navItems.map(item => (
          <button key={item.id} className={`sidebar-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
            <span className="sidebar-icon">{item.icon}</span>{item.label}
          </button>
        ))}
      </aside>

      <main className="dashboard-main">
        {activeTab === 'dashboard' && (
          <>
            <div style={{ borderBottom: '1px solid var(--primary)', paddingBottom: 24, marginBottom: 32, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <div>
                <h2 className="display-sm" style={{ color: 'var(--primary)' }}>Merchant Dashboard</h2>
                <p className="body-md mt-2" style={{ fontStyle: 'italic', color: 'var(--on-surface-variant)' }}>Manage your inventory and incoming orders.</p>
              </div>
              <button className="btn btn-primary btn-sm" onClick={() => { setEditProduct(null); setShowForm(true); }}>+ Add Product</button>
            </div>

            {/* Stats - Grid matching editorial */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 0, border: '1px solid var(--primary)', marginBottom: 40 }}>
              {statsRow.map((s, i) => (
                <div key={i} style={{ padding: '24px', borderRight: i < 3 ? '1px solid var(--primary)' : 'none', background: 'var(--surface)' }}>
                  <div style={{ marginBottom: 12, color: 'var(--primary)' }}>{s.icon}</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{s.value}</div>
                  <div className="label-sm" style={{ marginTop: 8, color: 'var(--on-surface-variant)' }}>{s.label}</div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', marginTop: 4, fontStyle: 'italic', color: 'var(--on-surface-variant)' }}>{s.change}</div>
                </div>
              ))}
            </div>

            {/* Quick products */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="title-lg">Recent Inventory</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setActiveTab('products')} style={{ border: 'none' }}>View All →</button>
              </div>
              <div className="table-container">
                <table className="table">
                  <thead><tr><th>Product</th><th>Category</th><th>Sale Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {displayProducts.slice(0, 4).map(p => {
                      const disc = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
                      return (
                        <tr key={p._id}>
                          <td><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{p.name}</div></td>
                          <td><span className="badge badge-gray" style={{ background: 'transparent', display: 'inline-flex', alignItems: 'center', gap: 4 }}>{CATEGORY_ICON[p.category]} {p.category}</span></td>
                          <td>
                            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary)' }}>₹{p.price}</span>
                            {disc > 0 && <span className="badge badge-discount ml-2">{disc}% OFF</span>}
                          </td>
                          <td>
                            <div style={{ minWidth: 80 }}>
                              <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: 4, color: 'var(--on-surface-variant)', letterSpacing: '0.5px' }}>{p.quantity} {p.unit || 'item'}{(p.quantity !== 1 && (!p.unit || p.unit === 'item')) ? 's' : ''} left</div>
                              <div className="progress-bar" style={{ height: 2 }}><div className="progress-bar-fill" style={{ width: `${Math.min(100, (p.quantity / 20) * 100)}%` }} /></div>
                            </div>
                          </td>
                          <td><span className={`badge ${p.status === 'AVAILABLE' ? 'badge-green' : 'badge-gray'}`}>{p.status}</span></td>
                          <td>
                            <div className="flex gap-2">
                              <button onClick={() => { setEditProduct(p); setShowForm(true); }} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} aria-label="Edit"><Edit size={16} strokeWidth={1.5} /></button>
                              <button onClick={() => handleDeleteProduct(p._id)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', borderColor: 'transparent' }} aria-label="Delete"><Trash2 size={16} strokeWidth={1.5} /></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <>
            <div style={{ borderBottom: '1px solid var(--primary)', paddingBottom: 24, marginBottom: 32, display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
              <h2 className="display-sm" style={{ color: 'var(--primary)' }}>Inventory</h2>
              <button className="btn btn-primary" onClick={() => { setEditProduct(null); setShowForm(true); }}>+ Add New Product</button>
            </div>

            <div className="table-container">
              <table className="table">
                <thead><tr><th>Product</th><th>Category</th><th>Original</th><th>Sale Price</th><th>Stock</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {displayProducts.map(p => {
                    const disc = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;
                    const expiresIsToday = p.expiryDate && new Date(p.expiryDate).toDateString() === new Date().toDateString();
                    return (
                      <tr key={p._id}>
                        <td><div style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{p.name}</div></td>
                        <td><span className="badge badge-gray" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>{CATEGORY_ICON[p.category]} {p.category}</span></td>
                        <td style={{ color: 'var(--outline-variant)', textDecoration: 'line-through', fontFamily: 'var(--font-ui)', fontSize: '0.85rem' }}>₹{p.originalPrice || '—'}</td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>₹{p.price}</span>
                          {disc > 0 && <div><span className="badge badge-discount" style={{ marginTop: 4 }}>{disc}% OFF</span></div>}
                        </td>
                        <td>
                          <div style={{ minWidth: 80 }}>
                            <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.7rem', textTransform: 'uppercase', marginBottom: 4, color: 'var(--on-surface-variant)', letterSpacing: '0.5px' }}>{p.quantity} {p.unit || 'item'}{(p.quantity !== 1 && (!p.unit || p.unit === 'item')) ? 's' : ''} rem.</div>
                            <div className="progress-bar" style={{ height: 2 }}><div className="progress-bar-fill" style={{ width: `${Math.min(100, (p.quantity / 20) * 100)}%` }} /></div>
                          </div>
                        </td>
                        <td>
                          {p.expiryDate ? (
                            <span className={`badge ${expiresIsToday ? 'badge-red' : 'badge-amber'}`}>
                              {expiresIsToday ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Zap size={10} /> Today</span> : new Date(p.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                            </span>
                          ) : '—'}
                        </td>
                        <td><span className={`badge ${p.status === 'AVAILABLE' ? 'badge-green' : 'badge-gray'}`}>{p.status}</span></td>
                        <td>
                          <div className="flex gap-2">
                            <button onClick={() => { setEditProduct(p); setShowForm(true); }} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} aria-label="Edit"><Edit size={16} strokeWidth={1.5} /></button>
                            <button onClick={() => handleDeleteProduct(p._id)} className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', borderColor: 'transparent' }} aria-label="Delete"><Trash2 size={16} strokeWidth={1.5} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'orders' && (
          <>
            <div style={{ borderBottom: '1px solid var(--primary)', paddingBottom: 24, marginBottom: 32 }}>
              <h2 className="display-sm" style={{ color: 'var(--primary)' }}>Incoming Orders</h2>
            </div>

            <div className="table-container">
              <table className="table">
                <thead><tr><th>Order ID</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th><th>Update</th></tr></thead>
                <tbody>
                  {displayOrders.map(o => {
                    const badge = STATUS_BADGE[o.status] || STATUS_BADGE.PENDING;
                    return (
                      <tr key={o._id}>
                        <td><span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '0.8rem', letterSpacing: '1px' }}>#{o._id.slice(-6).toUpperCase()}</span></td>
                        <td style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>{o.user?.name || 'Customer'}</td>
                        <td style={{ fontStyle: 'italic', color: 'var(--on-surface-variant)' }}>
                          {o.items?.map(i => `${i.quantity} ${i.unit || 'item'}${(i.quantity !== 1 && (!i.unit || i.unit === 'item')) ? 's' : ''} ${i.name || i.product?.name}`).filter(Boolean).join(', ') || '—'}
                        </td>
                        <td><span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary)' }}>₹{o.totalPrice?.toFixed(2)}</span></td>
                        <td><span className={`badge ${badge.cls}`}>{badge.label}</span></td>
                        <td style={{ fontSize: '0.8125rem' }}>
                          {new Date(o.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td>
                          <select
                            className="input" style={{ padding: '4px 8px', fontSize: '0.75rem', fontFamily: 'var(--font-ui)', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                            value={o.status}
                            onChange={e => handleStatusUpdate(o._id, e.target.value)}
                            disabled={o.status === 'COMPLETED' || o.status === 'CANCELLED'}
                          >
                            {['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTab === 'profile' && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ borderBottom: '1px solid var(--primary)', paddingBottom: 24, marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <h2 className="display-sm" style={{ color: 'var(--primary)' }}>Store Identity</h2>
              <button className="btn btn-primary btn-sm" onClick={() => {
                setStoreForm({ name: store?.name || '', city: store?.city || '', description: store?.description || '', address: store?.address || '' });
                setShowEditStore(true);
              }}>Edit Store</button>
            </div>

            <div className="editorial-box" style={{ padding: '40px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, paddingBottom: 32, borderBottom: '1px solid var(--outline-variant)' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'transparent', border: '1px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Store size={40} strokeWidth={1} />
                </div>
                <div>
                  <div className="display-sm" style={{ lineHeight: 1 }}>{store?.name || user?.name || 'Local Store'}</div>
                  <div className="body-md mt-1" style={{ fontStyle: 'italic', color: 'var(--on-surface-variant)' }}>{store?.city || 'City Location'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {[['Store Name', store?.name || user?.name], ['City', store?.city || '—'], ['Description', store?.description || '—']].map(([k, v], idx) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: idx !== 2 ? '1px solid var(--outline-variant)' : 'none' }}>
                    <span className="label-sm" style={{ color: 'var(--on-surface-variant)' }}>{k}</span>
                    <span className="body-md" style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{v || '—'}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {showEditStore && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="flex justify-between items-center mb-6" style={{ borderBottom: '1px solid var(--primary)', paddingBottom: 16 }}>
              <h2 className="title-lg" style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)', fontStyle: 'italic' }}>Edit Store Profile</h2>
              <button onClick={() => setShowEditStore(false)} className="btn-ghost" style={{ padding: '4px 12px', border: '1px solid var(--outline-variant)', background: 'transparent' }}>✕</button>
            </div>
            <form onSubmit={handleUpdateStore} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="input-group">
                <label className="input-label">Store Name *</label>
                <input required className="input" value={storeForm.name} onChange={e => setStoreForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">City *</label>
                <input required className="input" value={storeForm.city} onChange={e => setStoreForm(f => ({ ...f, city: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Address *</label>
                <input required className="input" value={storeForm.address} onChange={e => setStoreForm(f => ({ ...f, address: e.target.value }))} />
              </div>
              <div className="input-group">
                <label className="input-label">Description</label>
                <textarea className="input" value={storeForm.description} onChange={e => setStoreForm(f => ({ ...f, description: e.target.value }))} rows={2} />
              </div>
              <div className="flex gap-4 mt-6 pt-4" style={{ borderTop: '1px solid var(--outline-variant)' }}>
                <button type="button" onClick={() => setShowEditStore(false)} className="btn btn-ghost flex-1" style={{ justifyContent: 'center' }}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1" style={{ justifyContent: 'center' }}>Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
