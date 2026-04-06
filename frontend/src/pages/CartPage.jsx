import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { ShoppingCart, PartyPopper, Globe, Croissant, Carrot, Milk, Beef, Fish, ShoppingBag, UtensilsCrossed, Utensils, Store, Leaf, CheckCircle, Loader, Zap, X } from 'lucide-react';

const CATEGORY_ICON = {
  BAKERY: <Croissant size={32} strokeWidth={1.5} />, PRODUCE: <Carrot size={32} strokeWidth={1.5} />,
  DAIRY: <Milk size={32} strokeWidth={1.5} />, MEAT: <Beef size={32} strokeWidth={1.5} />,
  SEAFOOD: <Fish size={32} strokeWidth={1.5} />, PANTRY: <ShoppingBag size={32} strokeWidth={1.5} />,
  PREPARED: <UtensilsCrossed size={32} strokeWidth={1.5} />, OTHER: <Utensils size={32} strokeWidth={1.5} />,
};

export default function CartPage() {
  const { items, removeItem, updateQty, clearCart, clearStoreCart, total, savings } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '', address: '', note: '' });
  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(null); // storeId currently placing
  const [placedOrders, setPlacedOrders] = useState([]); // list of placed order objects

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.phone.trim()) e.phone = 'Phone is required';
    if (!form.address.trim()) e.address = 'Pickup address / note is required';
    setErrors(e);
    return !Object.keys(e).length;
  };

  // Group items by store
  const storeGroups = items.reduce((acc, item) => {
    const storeId = item.product.store?._id || item.product.store;
    const storeName = item.product.store?.name || 'Unknown Store';
    if (!acc[storeId]) acc[storeId] = { storeId, storeName, items: [] };
    acc[storeId].items.push(item);
    return acc;
  }, {});

  const handlePlaceStoreOrder = async (storeId, storeItems) => {
    if (!user) { navigate('/auth'); return; }
    if (!validate()) return;
    setPlacing(storeId);
    try {
      const orderItems = storeItems.map(i => ({ productId: i.product._id, quantity: i.quantity }));
      const storeTotal = storeItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
      const storeOrigTotal = storeItems.reduce((s, i) => s + (i.product.originalPrice || i.product.price) * i.quantity, 0);
      const storeSavings = storeOrigTotal - storeTotal;

      const res = await api.post('/orders', { storeId, items: orderItems, note: form.note });
      clearStoreCart(storeId);
      setPlacedOrders(prev => [...prev, {
        ...(res.data.order || res.data),
        _storeName: storeGroups[storeId]?.storeName,
        _capturedTotal: storeTotal,
        _capturedSavings: storeSavings,
      }]);
    } catch (err) {
      alert(err.response?.data?.message || 'Order placement failed. Please try again.');
    } finally {
      setPlacing(null);
    }
  };

  const handlePlaceAllOrders = async () => {
    if (!user) { navigate('/auth'); return; }
    if (!validate()) return;
    for (const [storeId, group] of Object.entries(storeGroups)) {
      await handlePlaceStoreOrder(storeId, group.items);
    }
  };

  if (items.length === 0 && placedOrders.length === 0) {
    return (
      <div style={{ minHeight: 'calc(100vh - 68px)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 40 }}>
        <div style={{ color: 'var(--outline-variant)' }}><ShoppingCart size={80} strokeWidth={1.5} /></div>
        <h2 className="title-lg">Your cart is empty</h2>
        <p className="body-md text-muted">Discover amazing deals and rescue some food!</p>
        <Link to="/browse" className="btn btn-primary mt-4">Browse Deals</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: 'calc(100vh - 68px)' }}>
      <h1 className="title-lg mb-6" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <ShoppingCart size={28} /> Your Cart
        {Object.keys(storeGroups).length > 1 && (
          <span className="badge badge-green" style={{ fontSize: '0.75rem', marginLeft: 8 }}>
            {Object.keys(storeGroups).length} stores
          </span>
        )}
      </h1>

      {/* Placed orders success banners */}
      {placedOrders.map(order => (
        <div key={order._id} style={{ background: 'rgba(136,217,130,0.1)', border: '1px solid rgba(136,217,130,0.25)', borderRadius: 12, padding: '16px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <PartyPopper size={28} style={{ color: 'var(--primary)', flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--primary)' }}>
              Order #{order._id?.slice(-6).toUpperCase()} placed from {order._storeName}!
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>
              You rescued food worth ₹{((order._capturedTotal || 0) + (order._capturedSavings || 0)).toFixed(2)} and saved ₹{(order._capturedSavings || 0).toFixed(2)}
            </div>
          </div>
        </div>
      ))}

      {items.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 32, alignItems: 'start' }}>
          {/* LEFT — Store-grouped cart items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {Object.values(storeGroups).map(({ storeId, storeName, items: storeItems }) => {
              const storeTotal = storeItems.reduce((s, i) => s + i.product.price * i.quantity, 0);
              const storeOrigTotal = storeItems.reduce((s, i) => s + (i.product.originalPrice || i.product.price) * i.quantity, 0);
              const storeSavings = storeOrigTotal - storeTotal;

              return (
                <div key={storeId}>
                  {/* Store header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, paddingBottom: 10, borderBottom: '2px solid var(--primary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Store size={20} style={{ color: 'var(--primary)' }} />
                      <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>{storeName}</span>
                    </div>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--on-surface-variant)' }}>{storeItems.length} item{storeItems.length > 1 ? 's' : ''}</span>
                  </div>

                  {/* Items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {storeItems.map(({ product, quantity }) => {
                      const discount = product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0;
                      const expires = product.expiryDate && new Date(product.expiryDate).toDateString() === new Date().toDateString();
                      return (
                        <div key={product._id} className="card p-4" style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                          <div style={{ width: 64, height: 64, borderRadius: 12, background: 'var(--surface-highest)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
                            {product.imageUrl ? (
                              <img src={`http://localhost:5000${product.imageUrl}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (CATEGORY_ICON[product.category] || <Utensils size={32} strokeWidth={1.5} />)}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                              <div>
                                <div className="title-sm truncate">{product.name}</div>
                                {expires && <span className="badge badge-red mt-2" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.6875rem' }}><Zap size={10} /> Expires Today</span>}
                              </div>
                              <button onClick={() => removeItem(product._id)} className="btn btn-ghost btn-icon btn-sm" title="Remove" style={{ flexShrink: 0 }}><X size={16} /></button>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10, flexWrap: 'wrap', gap: 8 }}>
                              <div className="qty-stepper">
                                <button onClick={() => updateQty(product._id, quantity - 1)}>−</button>
                                <span style={{ fontSize: '0.875rem' }}>{quantity} <span style={{ fontSize: '0.7rem', color: 'var(--on-surface-variant)' }}>{product.unit || 'item'}{(quantity !== 1 && (!product.unit || product.unit === 'item')) ? 's' : ''}</span></span>
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
                  </div>

                  {/* Per-store subtotal + order button */}
                  <div style={{ marginTop: 12, padding: '14px 16px', background: 'var(--surface-low)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem' }}>₹{storeTotal.toFixed(2)}</div>
                      {storeSavings > 0 && <div style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}><Leaf size={12} /> Saving ₹{storeSavings.toFixed(2)}</div>}
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handlePlaceStoreOrder(storeId, storeItems)}
                      disabled={placing === storeId}
                      style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      {placing === storeId ? <><Loader className="spin" size={16} /> Placing…</> : <><CheckCircle size={16} /> Order from {storeName}</>}
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Grand total */}
            <div className="card p-6" style={{ marginTop: 4 }}>
              <h3 className="title-sm mb-4">Grand Total</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="flex justify-between body-md"><span className="text-muted">Subtotal</span><span>₹{(total + savings).toFixed(2)}</span></div>
                <div className="flex justify-between body-md"><span className="text-muted" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>Your Savings <Leaf size={16} color="var(--primary)" /></span><span style={{ color: 'var(--primary)', fontWeight: 700 }}>−₹{savings.toFixed(2)}</span></div>
                <div style={{ borderTop: '1px solid var(--outline-variant)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                <Store size={28} color="var(--primary)" />
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

            {Object.keys(storeGroups).length > 1 && (
              <button
                className="btn btn-secondary w-full mt-6"
                style={{ justifyContent: 'center', fontSize: '1rem', padding: '14px', fontFamily: 'var(--font-display)', fontWeight: 700 }}
                onClick={handlePlaceAllOrders}
                disabled={placing !== null}
              >
                {placing ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Loader className="spin" size={20} /> Placing Orders…</span>
                ) : (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={20} /> Place All Orders ({Object.keys(storeGroups).length} stores)</span>
                )}
              </button>
            )}

            {!user && (
              <p style={{ textAlign: 'center', fontSize: '0.8125rem', color: 'var(--on-surface-variant)', marginTop: 12 }}>
                <Link to="/auth" style={{ color: 'var(--primary)' }}>Sign in</Link> to place your order
              </p>
            )}

            {placedOrders.length > 0 && items.length === 0 && (
              <div className="flex gap-3 justify-center mt-6">
                <Link to="/dashboard" className="btn btn-primary">View Orders</Link>
                <Link to="/browse" className="btn btn-outline">Browse More</Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* All orders placed, cart empty */}
      {items.length === 0 && placedOrders.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 40 }}>
          <div className="flex gap-3 justify-center">
            <Link to="/dashboard" className="btn btn-primary">View My Orders</Link>
            <Link to="/browse" className="btn btn-outline">Browse More</Link>
          </div>
        </div>
      )}
    </div>
  );
}
