import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, total, savings, storeId } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: '', note: '' });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [success, setSuccess] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!form.address.trim()) e.address = 'Pickup address / note is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handlePlaceOrder = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!validate()) return;
    setPlacing(true);
    try {
      const orderItems = items.map(i => ({ product: i.product._id, quantity: i.quantity }));
      const res = await api.post('/orders', {
        store: storeId,
        items: orderItems,
        note: form.note,
      });
      clearCart();
      setSuccess(res.data.order || res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Order placement failed. Please try again.');
    } finally {
      setPlacing(false);
    }
  };

  if (success) {
    return (
      <div className="modal-overlay">
        <div className="modal-card animate-fade-up">
          <div style={{ fontSize: '4rem', marginBottom: 16 }}>🎉</div>
          <h2 className="title-lg mb-2">Order Placed!</h2>
          <p className="body-md text-muted mb-6" style={{ lineHeight: 1.7 }}>
            Your rescue order #{success._id?.slice(-6).toUpperCase() || 'SUCCESS'} has been confirmed. Head to the store to pick it up!
          </p>
          <div style={{ background: 'rgba(136,217,130,0.1)', border: '1px solid rgba(136,217,130,0.2)', borderRadius: 12, padding: '16px', marginBottom: 24 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--primary)', fontSize: '1.1rem', marginBottom: 4 }}>🌍 Your Impact</div>
            <p style={{ fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>You rescued food worth ₹{(total + savings).toFixed(2)} and saved ₹{savings.toFixed(2)}!</p>
          </div>
          <div className="flex gap-3 justify-center">
            <Link to="/dashboard" className="btn btn-primary">View Orders</Link>
            <Link to="/browse" className="btn btn-outline">Browse More</Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 40 }}>
        <div style={{ fontSize: '5rem' }}>🛒</div>
        <h2 className="title-lg">Your cart is empty</h2>
        <p className="body-md text-muted">Discover amazing deals and rescue some food!</p>
        <Link to="/browse" className="btn btn-primary mt-4">Browse Deals</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 68px)' }}>
      <h1 className="title-lg mb-6">🛒 Your Cart</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: 32, alignItems: 'start' }}>
        {/* LEFT — Cart Items */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map(({ product, quantity }) => {
            const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
            const expires = product.expiryDate && new Date(product.expiryDate).toDateString() === new Date().toDateString();
            return (
              <div key={product._id} className="card p-4" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--surface-highest)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', flexShrink: 0 }}>
                  {{ 'BAKERY': '🥖', 'PRODUCE': '🥦', 'DAIRY': '🧀', 'MEAT': '🥩', 'SEAFOOD': '🐟', 'PANTRY': '🛒', 'PREPARED': '🍱' }[product.category] || '🍽️'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div>
                      <div className="title-sm truncate">{product.name}</div>
                      <div className="body-md text-muted" style={{ fontSize: '0.8125rem' }}>{product.store?.name || 'Store'}</div>
                      {expires && <span className="badge badge-red mt-2" style={{ fontSize: '0.6875rem' }}>⚡ Expires Today</span>}
                    </div>
                    <button onClick={() => removeItem(product._id)} className="btn btn-ghost btn-icon btn-sm" title="Remove" style={{ flexShrink: 0 }}>✕</button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, flexWrap: 'wrap', gap: 8 }}>
                    <div className="qty-stepper">
                      <button onClick={() => updateQty(product._id, quantity - 1)}>−</button>
                      <span>{quantity}</span>
                      <button onClick={() => updateQty(product._id, Math.min(quantity + 1, product.quantity))}>+</button>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, color: 'var(--primary)', fontSize: '1.1rem' }}>₹{(product.price * quantity).toFixed(2)}</span>
                      {discount > 0 && <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)', textDecoration: 'line-through' }}>₹{(product.originalPrice * quantity).toFixed(2)}</div>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Order Summary */}
          <div className="card p-6 mt-2">
            <h3 className="title-sm mb-4">Order Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="flex justify-between body-md"><span className="text-muted">Subtotal</span><span>₹{(total + savings).toFixed(2)}</span></div>
              <div className="flex justify-between body-md"><span className="text-muted">Your Savings 🌱</span><span style={{ color: 'var(--primary)', fontWeight: 700 }}>−₹{savings.toFixed(2)}</span></div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700 }}>Total</span>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.5rem', color: 'var(--on-surface)' }}>₹{total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT — Checkout Form */}
        <div className="glass-card p-6" style={{ position: 'sticky', top: 88 }}>
          <h3 className="title-sm mb-6">Checkout Details</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Your Name</label>
              <input className={`input ${errors.name ? 'error' : ''}`} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Priya Sharma" />
              {errors.name && <span className="input-error-msg">⚠ {errors.name}</span>}
            </div>
            <div className="input-group">
              <label className="input-label">Phone</label>
              <input className={`input ${errors.phone ? 'error' : ''}`} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+91 98765 43210" />
              {errors.phone && <span className="input-error-msg">⚠ {errors.phone}</span>}
            </div>
            <div className="input-group">
              <label className="input-label">Pickup Note / Address</label>
              <input className={`input ${errors.address ? 'error' : ''}`} value={form.address} onChange={e => set('address', e.target.value)} placeholder="I'll pick up at 6pm" />
              {errors.address && <span className="input-error-msg">⚠ {errors.address}</span>}
            </div>

            <div style={{ background: 'rgba(136,217,130,0.08)', border: '1px solid rgba(136,217,130,0.15)', borderRadius: 12, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '1.3rem' }}>🏪</span>
              <div>
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>Cash on Pickup</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>Pay at the store when you collect your order</div>
              </div>
            </div>

            <div className="input-group">
              <label className="input-label">Note to Store (optional)</label>
              <textarea className="input" value={form.note} onChange={e => set('note', e.target.value)} placeholder="Any special requests?" rows={3} />
            </div>
          </div>

          <button
            className="btn btn-secondary w-full mt-6"
            style={{ justifyContent: 'center', fontSize: '1rem', padding: '16px', fontFamily: 'var(--font-display)', fontWeight: 700 }}
            onClick={handlePlaceOrder}
            disabled={placing}
          >
            {placing ? '⏳ Placing Order…' : '🎯 Place Rescue Order'}
          </button>

          {!user && (
            <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: 12 }}>
              <Link to="/auth" style={{ color: 'var(--primary)' }}>Sign in</Link> to place your order
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
