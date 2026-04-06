import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sb_cart')) || []; }
    catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem('sb_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.product._id === product._id);
      if (existing) {
        return prev.map(i =>
          i.product._id === product._id
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.quantity) }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeItem = (productId) => {
    setItems(prev => prev.filter(i => i.product._id !== productId));
  };

  const updateQty = (productId, quantity) => {
    if (quantity <= 0) { removeItem(productId); return; }
    setItems(prev => prev.map(i => i.product._id === productId ? { ...i, quantity } : i));
  };

  const clearCart = () => setItems([]);

  const clearStoreCart = (storeId) =>
    setItems(prev => prev.filter(i => {
      const sid = i.product.store?._id || i.product.store;
      return sid?.toString() !== storeId?.toString();
    }));

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const originalTotal = items.reduce((sum, i) => sum + (i.product.originalPrice || i.product.price) * i.quantity, 0);
  const savings = originalTotal - total;
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clearCart, clearStoreCart, total, savings, count }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
