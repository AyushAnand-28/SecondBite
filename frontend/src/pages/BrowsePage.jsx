import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import api from '../services/api';
import { Utensils } from 'lucide-react';

const CATEGORIES = ['ALL', 'BAKERY', 'PRODUCE', 'DAIRY', 'MEAT', 'SEAFOOD', 'PANTRY', 'PREPARED'];
const SORT_OPTIONS = [
  { value: 'discount', label: 'Biggest Discount' },
  { value: 'expiry', label: 'Expiring Soonest' },
  { value: 'price', label: 'Lowest Price' },
  { value: 'newest', label: 'Newest' },
];

const DEMO_PRODUCTS = [
  { _id: '1', name: 'Sourdough Loaf', category: 'BAKERY', price: 45, originalPrice: 130, quantity: 8, status: 'AVAILABLE', store: { name: 'The Artisan Oven', city: 'Mumbai' }, expiryDate: new Date().toISOString() },
  { _id: '2', name: 'Organic Spinach Bunch', category: 'PRODUCE', price: 20, originalPrice: 50, quantity: 15, status: 'AVAILABLE', store: { name: 'Green Leaf Kitchen', city: 'Bengaluru' } },
  { _id: '3', name: 'Croissant Box (6pcs)', category: 'BAKERY', price: 80, originalPrice: 220, quantity: 4, status: 'AVAILABLE', store: { name: 'Le Petit Sucre', city: 'Delhi' }, expiryDate: new Date().toISOString() },
  { _id: '4', name: 'Aged Cheddar Block', category: 'DAIRY', price: 120, originalPrice: 280, quantity: 6, status: 'AVAILABLE', store: { name: 'Desi Dairy Farm', city: 'Pune' } },
  { _id: '5', name: 'Prawn Pack 500g', category: 'SEAFOOD', price: 150, originalPrice: 320, quantity: 3, status: 'AVAILABLE', store: { name: 'Harbor Fresh', city: 'Chennai' } },
  { _id: '6', name: 'Mixed Salad Kit', category: 'PRODUCE', price: 35, originalPrice: 75, quantity: 12, status: 'AVAILABLE', store: { name: 'Urban Harvest', city: 'Hyderabad' } },
  { _id: '7', name: 'Whole Grain Muffins (4)', category: 'BAKERY', price: 60, originalPrice: 140, quantity: 9, status: 'AVAILABLE', store: { name: 'The Artisan Oven', city: 'Mumbai' } },
  { _id: '8', name: 'Ready Daal Makhani', category: 'PREPARED', price: 55, originalPrice: 110, quantity: 7, status: 'AVAILABLE', store: { name: 'Home Kitchen', city: 'Delhi' }, expiryDate: new Date().toISOString() },
];

export default function BrowsePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [city, setCity] = useState('');
  const [sort, setSort] = useState('discount');

  useEffect(() => {
    const params = new URLSearchParams();
    if (category !== 'ALL') params.append('category', category);
    if (city) params.append('city', city);

    api.get(`/products?${params}`)
      .then(r => setProducts(r.data.products || r.data || []))
      .catch(() => setProducts(DEMO_PRODUCTS))
      .finally(() => setLoading(false));
  }, [category, city]);

  const filtered = products
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.store?.name?.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'price') return a.price - b.price;
      if (sort === 'discount') {
        const da = a.originalPrice ? (1 - a.price / a.originalPrice) : 0;
        const db = b.originalPrice ? (1 - b.price / b.originalPrice) : 0;
        return db - da;
      }
      if (sort === 'expiry') return new Date(a.expiryDate || '9999') - new Date(b.expiryDate || '9999');
      return 0;
    });

  return (
    <>
      {/* Editorial Header */}
      <div style={{ background: 'var(--surface-low)', padding: '56px 0', borderBottom: '1px solid var(--primary)' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <span className="section-label-red">Marketplace</span>
          <h1 className="display-md" style={{ marginBottom: 32, marginTop: 8 }}>Browse Deals</h1>
          
          <div className="search-bar" style={{ maxWidth: 800, margin: '0 auto', boxShadow: 'var(--shadow-card)' }}>
            <div className="search-input-wrap flex-1">
              <span style={{ color: 'var(--primary)', fontStyle: 'italic', fontFamily: 'var(--font-display)', paddingRight: 8 }}>Search</span>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Products, stores..."
              />
            </div>
            <div className="search-input-wrap" style={{ minWidth: 160 }}>
               <span style={{ color: 'var(--primary)', fontStyle: 'italic', fontFamily: 'var(--font-display)', paddingRight: 8 }}>City</span>
              <input
                placeholder="Ex. Mumbai"
                value={city}
                onChange={e => setCity(e.target.value)}
              />
            </div>
            <select className="search-select" value={sort} onChange={e => setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '48px 40px' }}>
        {/* Category Editorial Tabs */}
        <div style={{ borderBottom: '1px solid var(--primary)', paddingBottom: 8, marginBottom: 32 }}>
           <div className="flex gap-4 flex-wrap">
             {CATEGORIES.map(c => (
               <button
                 key={c}
                 onClick={() => setCategory(c)}
                 style={{
                   padding: '8px 16px',
                   fontFamily: 'var(--font-ui)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '1px', textTransform: 'uppercase',
                   background: 'transparent',
                   color: category === c ? '#fff' : 'var(--on-surface-variant)',
                   border: '1px solid',
                   borderColor: category === c ? 'var(--primary)' : 'transparent',
                   backgroundColor: category === c ? 'var(--primary)' : 'transparent',
                   borderRadius: '999px',
                   transition: 'var(--transition)',
                   cursor: 'pointer'
                 }}
               >
                 {c === 'ALL' ? 'Everything' : c}
               </button>
             ))}
           </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div className="loading-spinner" />
            <p className="body-md mt-4" style={{ fontStyle: 'italic', color: 'var(--on-surface-variant)' }}>Finding the best deals near you…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon" style={{ color: 'var(--outline-variant)' }}><Utensils size={64} strokeWidth={1} /></div>
            <h3 className="title-md mb-2">No products found</h3>
            <p className="body-md text-muted" style={{ fontStyle: 'italic' }}>Try adjusting your search or filters.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
               <h2 className="title-lg">Available Surplus</h2>
               <p className="label-sm" style={{ color: 'var(--primary)' }}>
                 {filtered.length} items listed
               </p>
            </div>
            {/* Grid matching editorial styling */}
            <div style={{ 
                display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
                gap: 0,
                borderTop: '1px solid var(--primary)',
                borderLeft: '1px solid var(--primary)',
                borderRight: '1px solid var(--primary)'
              }}>
              {filtered.map((p, i) => (
                  <div key={p._id} style={{ 
                     borderRight: (i + 1) % 4 !== 0 ? '1px solid var(--primary)' : 'none', 
                     borderBottom: '1px solid var(--primary)',
                     padding: 0
                  }}>
                    <ProductCard product={p} />
                  </div>
              ))}
            </div>
            {/* Fix borders for responsive grid if needed - simplified for now */}
          </>
        )}
      </div>
      <Footer />
    </>
  );
}
