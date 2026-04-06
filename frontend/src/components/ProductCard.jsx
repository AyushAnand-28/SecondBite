import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Croissant, Carrot, Milk, Beef, Fish, ShoppingBag, UtensilsCrossed, Utensils, Zap, Clock, X, ShoppingCart, Check } from 'lucide-react';

const CATEGORY_ICON = {
  BAKERY: <Croissant size={40} strokeWidth={1} />,
  PRODUCE: <Carrot size={40} strokeWidth={1} />,
  DAIRY: <Milk size={40} strokeWidth={1} />,
  MEAT: <Beef size={40} strokeWidth={1} />,
  SEAFOOD: <Fish size={40} strokeWidth={1} />,
  PANTRY: <ShoppingBag size={40} strokeWidth={1} />,
  PREPARED: <UtensilsCrossed size={40} strokeWidth={1} />,
  OTHER: <Utensils size={40} strokeWidth={1} />
};

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const { user } = useAuth();

  const discount = product.originalPrice && product.originalPrice > product.price
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;

  const expiresIsToday = () => {
    if (!product.expiryDate) return false;
    const exp = new Date(product.expiryDate);
    const now = new Date();
    return exp.toDateString() === now.toDateString();
  };

  const expiresIsSoon = () => {
    if (!product.expiryDate) return false;
    const exp = new Date(product.expiryDate);
    const now = new Date();
    const diff = (exp - now) / (1000 * 60 * 60 * 24);
    return diff <= 3 && diff > 0;
  };

  const alreadyInCart = items.some(i => i.product._id === product._id);
  const isSoldOut = product.status === 'SOLD_OUT' || product.quantity <= 0;

  const stockPct = product.quantity && product.originalQuantity
    ? Math.min(100, Math.round((product.quantity / product.originalQuantity) * 100))
    : 60;

  return (
    <div className="product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="product-card-img-placeholder" style={{ color: 'var(--primary)', padding: product.imageUrl ? 0 : undefined, overflow: 'hidden' }}>
        {product.imageUrl ? (
           <img src={`http://localhost:5000${product.imageUrl}`} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          CATEGORY_ICON[product.category] || CATEGORY_ICON.OTHER
        )}
      </div>
      
      {discount > 0 && (
        <div className="product-discount-badge">{discount}% OFF</div>
      )}
      
      {expiresIsToday() && (
        <div className="product-expiry-badge" style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={14} /> Expires Today</div>
      )}
      {!expiresIsToday() && expiresIsSoon() && (
        <div className="product-expiry-badge" style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'var(--surface-high)', color: 'var(--on-surface)', border: '1px solid var(--outline-variant)' }}><Clock size={14} /> Expires Soon</div>
      )}

      <div className="product-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="product-name truncate">{product.name}</div>
        <div className="product-store">
          {product.store?.name || product.storeName || 'Local Store'}
        </div>

        <div className="product-price-row mt-2">
          <span className="product-price">₹{product.price.toFixed(2)}</span>
          {product.originalPrice && product.originalPrice > product.price && (
            <span className="product-original-price">₹{product.originalPrice.toFixed(2)}</span>
          )}
        </div>

        <div style={{ flex: 1 }}></div>

        <div className="product-stock mt-4">
          <div className="product-stock-label">
            <span>Stock remaining</span>
            <span><span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.8rem' }}>{product.quantity} {product.unit || 'item'}{(product.quantity !== 1 && (!product.unit || product.unit === 'item')) ? 's' : ''}</span> left</span>
          </div>
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${stockPct}%` }} />
          </div>
        </div>

        {user?.role === 'STORE_OWNER' ? (
          <p className="body-sm text-center text-muted mt-4" style={{ padding: '8px 0', borderTop: '1px solid var(--outline-subtle)', fontStyle: 'italic', fontSize: '0.8125rem' }}>
            Store owners cannot buy items.
          </p>
        ) : (
          <button
            className={`btn w-full mt-4 ${isSoldOut ? 'btn-ghost' : alreadyInCart ? 'btn-outline' : 'btn-primary'}`}
            style={{ justifyContent: 'center' }}
            onClick={() => !isSoldOut && addItem(product)}
            disabled={isSoldOut}
          >
            {isSoldOut ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><X size={16} /> Sold Out</span>
            ) : alreadyInCart ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Check size={16} /> In Cart</span>
            ) : (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><ShoppingCart size={16} /> Add to Cart</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
