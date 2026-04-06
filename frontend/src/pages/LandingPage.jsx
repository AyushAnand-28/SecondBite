import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import api from '../services/api';
import { Store, MapPin, CheckCircle, Zap, Croissant, Carrot, Milk, Beef, Fish, ShoppingBag, UtensilsCrossed, Utensils } from 'lucide-react';

/* ── static data ── */
const HOW_STEPS = [
  { num: 'I',  tag: 'Discover',  title: 'Find Surplus Near You',   desc: 'Browse local bakeries, grocers, and restaurants listing today\'s surplus food — sorted by distance, category, and expiry.' },
  { num: 'II', tag: 'Select',    title: 'Pick Deals Up to 70% Off', desc: 'Filter by price, category, or city. Every listing tells you exactly how much food — and money — you\'re saving.' },
  { num: 'III',tag: 'Rescue',    title: 'Save Food & Money',        desc: 'Pick up your order directly from the store. Zero waste, premium taste, real impact on your community.' },
];

const IMPACT_STATS = [
  { value: '12,400+', label: 'Meals Rescued' },
  { value: '8.2t',    label: 'Food Saved' },
  { value: '₹2.1L+',  label: 'Consumer Savings' },
  { value: '180+',    label: 'Partner Stores' },
];

const MARQUEE_ITEMS = [
  'Bakery Surplus Available Now',
  'Up to 70% Off Near-Expiry Food',
  'New Partner Stores Every Week',
  'Zero Waste — Full Flavour',
  'Fresh Produce, Reduced Prices',
  'Support Local, Shop Smart',
];

const CATEGORY_ICON = {
  BAKERY: <Croissant size={28} strokeWidth={1} />, PRODUCE: <Carrot size={28} strokeWidth={1} />, DAIRY: <Milk size={28} strokeWidth={1} />,
  MEAT: <Beef size={28} strokeWidth={1} />, SEAFOOD: <Fish size={28} strokeWidth={1} />, PANTRY: <ShoppingBag size={28} strokeWidth={1} />,
  PREPARED: <UtensilsCrossed size={28} strokeWidth={1} />, OTHER: <Utensils size={28} strokeWidth={1} />,
};

const DEMO_STORES = [
  { _id: '1', name: 'The Artisan Oven',    category: 'BAKERY',  city: 'Mumbai',    isVerified: true,  discount: 65 },
  { _id: '2', name: 'Green Leaf Kitchen',  category: 'PRODUCE', city: 'Bengaluru', isVerified: true,  discount: 50 },
  { _id: '3', name: 'Le Petit Sucre',      category: 'BAKERY',  city: 'Delhi',     isVerified: false, discount: 70 },
  { _id: '4', name: 'Harbor Fresh Market', category: 'SEAFOOD', city: 'Chennai',   isVerified: true,  discount: 45 },
  { _id: '5', name: 'Desi Dairy Farm',     category: 'DAIRY',   city: 'Pune',      isVerified: true,  discount: 40 },
  { _id: '6', name: 'Urban Harvest',       category: 'PRODUCE', city: 'Hyderabad', isVerified: false, discount: 55 },
];

/* ── Scroll reveal hook ── */
function useReveal() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

export default function LandingPage() {
  const [featuredStores, setFeaturedStores] = useState([]);

  useEffect(() => {
    api.get('/stores?limit=6').then(r => setFeaturedStores(r.data.stores || r.data || [])).catch(() => {});
  }, []);

  const displayStores = featuredStores.length > 0 ? featuredStores : DEMO_STORES;

  /* Marquee doubled for seamless loop */
  const allItems = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

  return (
    <>
      {/* ══════════════════════════════════════════════════
          HERO — Editorial newspaper layout
      ══════════════════════════════════════════════════ */}
      <section className="hero-section">
        {/* top thin red line already provided by navbar border-bottom */}

        {/* Massive brand display text */}
        <div style={{ borderBottom: '1px solid var(--primary)', overflow: 'hidden' }}>
          <div className="container" style={{ padding: '20px 40px 0', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <span className="label-sm" style={{ color: 'var(--on-surface-variant)', letterSpacing: 2 }}>Est. 2024</span>
                <span style={{ width: 40, height: 1, background: 'var(--outline-subtle)', display: 'inline-block' }} />
                <span className="label-sm" style={{ color: 'var(--primary)', letterSpacing: 2 }}>Reducing Food Waste</span>
              </div>
              <h1 className="display-xl animate-fade-up" style={{ lineHeight: 0.85 }}>
                SECOND<br />BITE
              </h1>
            </div>

            {/* Right column — subtext + CTA */}
            <div style={{ maxWidth: 320, paddingBottom: 24, paddingLeft: 40, borderLeft: '1px solid var(--outline-subtle)' }}>
              <p className="section-label-red animate-fade-up animate-delay-1">
                Recently featured on India Food Forum
              </p>
              <p className="body-md animate-fade-up animate-delay-2" style={{ color: 'var(--on-surface-variant)', marginTop: 8, lineHeight: 1.65 }}>
                Connecting communities with surplus food from local bakeries, grocers, and restaurants.
                Every rescue prevents food from landfill.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
                <Link to="/browse" className="btn btn-primary btn-sm">Browse Deals</Link>
                <Link to="/auth?mode=register" className="btn btn-outline btn-sm">List Your Store</Link>
              </div>
            </div>
          </div>
        </div>

        {/* Marquee ticker — signature Da Maria element */}
        <div className="marquee-bar">
          <div className="marquee-track">
            {allItems.map((item, i) => (
              <span key={i} className="marquee-item">
                {item}
                {i < allItems.length - 1 && <span className="marquee-dot" style={{ margin: '0 24px' }}>✦</span>}
              </span>
            ))}
          </div>
        </div>

        {/* Hero bottom stats row */}
        <div style={{ borderBottom: '1px solid var(--primary)' }}>
          <div className="container" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
            {IMPACT_STATS.map((s, i) => (
              <div
                key={i}
                className="text-center animate-fade-up"
                style={{
                  padding: '32px 20px',
                  borderRight: i < 3 ? '1px solid var(--outline-subtle)' : 'none',
                  animationDelay: `${i * 0.08}s`,
                }}
              >
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 900, color: 'var(--primary)', lineHeight: 1 }}>{s.value}</div>
                <div className="label-sm" style={{ marginTop: 6, color: 'var(--on-surface-variant)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════
          MISSION — 2-column editorial spread
      ══════════════════════════════════════════════════ */}
      <MissionSection />

      {/* ══════════════════════════════════════════════════
          HOW IT WORKS — Numbered steps editorial
      ══════════════════════════════════════════════════ */}
      <HowItWorksSection />

      {/* ══════════════════════════════════════════════════
          FEATURED STORES — Grid with red borders
      ══════════════════════════════════════════════════ */}
      <StoresSection stores={displayStores} />

      {/* ══════════════════════════════════════════════════
          CTA BANNER — Da Maria "ORDER ONLINE" style
      ══════════════════════════════════════════════════ */}
      <CTASection />

      <Footer />
    </>
  );
}

/* ── Sub-components ── */

function MissionSection() {
  const [ref, visible] = useReveal();
  return (
    <section
      ref={ref}
      className="section"
      style={{ borderBottom: '1px solid var(--primary)', background: 'var(--surface-low)' }}
    >
      <div className="container">
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          border: '1px solid var(--primary)',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.7s ease',
        }}>
          {/* Left */}
          <div style={{ padding: '56px 48px', borderRight: '1px solid var(--primary)' }}>
            <span className="section-label-red">Our Mission</span>
            <h2 className="display-md" style={{ marginTop: 12, marginBottom: 24 }}>
              Food Rescued.<br />
              <em style={{ fontWeight: 400 }}>Community Nourished.</em>
            </h2>
            <p className="body-lg drop-cap" style={{ color: 'var(--on-surface-variant)' }}>
              India wastes over 68 million tonnes of food every year. SecondBite bridges the gap between
              surplus and need — connecting local stores with conscious consumers who refuse to let good
              food go to waste.
            </p>
            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--outline-subtle)' }}>
              <Link to="/browse" className="btn btn-outline">
                Explore Deals →
              </Link>
            </div>
          </div>

          {/* Right — callout box */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              background: 'var(--primary)', color: '#fff',
              padding: '40px 40px 32px',
              flex: 1,
              display: 'flex', flexDirection: 'column', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontStyle: 'italic', letterSpacing: 1, opacity: 0.8 }}>— Why SecondBite?</span>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.8rem,3vw,2.8rem)', fontWeight: 900, color: '#fff', lineHeight: 1.05, marginTop: 12 }}>
                RESCUE.<br />SAVE.<br />REPEAT.
              </h3>
            </div>
            <div style={{ padding: '32px 40px', borderTop: '1px solid var(--primary)', background: 'var(--accent-cream)' }}>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)', lineHeight: 1.7 }}>
                Every order you place rescues real food from landfill, supports a local business, 
                and saves you up to <strong style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>70% on groceries</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const [ref, visible] = useReveal();
  return (
    <section ref={ref} className="section" id="how-it-works" style={{ borderBottom: '1px solid var(--primary)' }}>
      <div className="container">
        <div style={{ marginBottom: 48, display: 'flex', alignItems: 'baseline', gap: 24 }}>
          <span className="section-label">Simple Process</span>
          <span style={{ flex: 1, height: 1, background: 'var(--outline-subtle)', display: 'block', marginBottom: 4 }} />
          <h2 className="display-sm" style={{ color: 'var(--primary)' }}>How It Works</h2>
        </div>

        <div style={{
          border: '1px solid var(--primary)',
          display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
          opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.7s ease',
        }}>
          {HOW_STEPS.map((step, i) => (
            <div key={i} style={{
              padding: '40px 36px',
              borderRight: i < 2 ? '1px solid var(--primary)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <span style={{
                  fontFamily: 'var(--font-display)', fontSize: '2.5rem', fontWeight: 900,
                  color: 'var(--primary)', lineHeight: 1, opacity: 0.25,
                }}>{step.num}</span>
                <span className="section-label-red">{step.tag}</span>
              </div>
              <h3 className="title-lg" style={{ marginBottom: 14, color: 'var(--on-surface)' }}>{step.title}</h3>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function StoresSection({ stores }) {
  const [ref, visible] = useReveal();
  return (
    <section ref={ref} className="section" style={{ background: 'var(--surface-low)', borderBottom: '1px solid var(--primary)' }}>
      <div className="container">
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 40 }}>
          <div>
            <span className="section-label">Nearby Deals</span>
            <h2 className="display-sm" style={{ marginTop: 4 }}>Partner Stores</h2>
          </div>
          <Link to="/browse" className="btn btn-outline btn-sm">View All →</Link>
        </div>

        {/* Store grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          border: '1px solid var(--primary)',
          opacity: visible ? 1 : 0, transition: 'all 0.7s ease',
          transform: visible ? 'none' : 'translateY(20px)',
        }}>
          {stores.map((store, i) => {
            const col = i % 3;
            const row = Math.floor(i / 3);
            const isLastRow = row === Math.floor((stores.length - 1) / 3);
            return (
              <Link
                to={`/browse?store=${store._id}`}
                key={store._id || i}
                style={{
                  textDecoration: 'none',
                  display: 'block',
                  borderRight: col < 2 ? '1px solid var(--primary)' : 'none',
                  borderBottom: !isLastRow ? '1px solid var(--primary)' : 'none',
                  background: 'var(--surface)',
                  transition: 'var(--transition)',
                  padding: '28px 28px',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--surface-low)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--surface)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div style={{
                    width: 52, height: 52,
                    background: 'var(--surface-low)',
                    border: '1px solid var(--outline-subtle)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    {CATEGORY_ICON[store.category] || <Store size={28} strokeWidth={1} />}
                  </div>
                  {store.discount && (
                    <span className="badge badge-discount">{store.discount}% OFF</span>
                  )}
                </div>
                <h3 className="title-md" style={{ marginBottom: 6, color: 'var(--on-surface)' }}>{store.name}</h3>
                <div className="label-sm" style={{ color: 'var(--on-surface-variant)', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {store.city}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {store.isVerified && <span className="badge badge-green" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle size={10} /> Verified</span>}
                  <span className="badge badge-amber">{store.category || 'STORE'}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CTASection() {
  const [ref, visible] = useReveal();
  return (
    <section ref={ref} className="section" style={{ background: 'var(--surface)' }}>
      <div className="container">
        <div style={{
          border: '1px solid var(--primary)',
          display: 'grid', gridTemplateColumns: '1fr 340px',
          opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(30px)',
          transition: 'all 0.7s ease',
        }}>
          {/* Left — giant text */}
          <div style={{ padding: '56px 48px', borderRight: '1px solid var(--primary)' }}>
            <span className="section-label-red">Join the Movement</span>
            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 900,
              fontSize: 'clamp(3rem, 6vw, 5.5rem)',
              lineHeight: 0.9, color: 'var(--primary)',
              textTransform: 'uppercase', marginTop: 16,
            }}>
              START<br />RESCUING<br />TODAY
            </h2>
            <p className="body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: 420, marginTop: 24, lineHeight: 1.7 }}>
              Join thousands of food rescuers across India. Every purchase is an act
              of environmental kindness — and smart spending.
            </p>
          </div>

          {/* Right — action column */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{
              flex: 1, padding: '40px 36px',
              borderBottom: '1px solid var(--primary)',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 16,
            }}>
              <Link to="/browse" className="btn btn-solid-red" style={{ display: 'block', textAlign: 'center' }}>
                Browse Deals Now
              </Link>
              <Link to="/auth?mode=register" className="btn btn-outline" style={{ display: 'block', textAlign: 'center' }}>
                Join as Store Owner
              </Link>
            </div>
            <div style={{ padding: '28px 36px', background: 'var(--surface-low)' }}>
              <p className="label-sm" style={{ color: 'var(--on-surface-variant)', marginBottom: 6 }}>Already a member?</p>
              <Link to="/auth" style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', color: 'var(--primary)', fontSize: '1.05rem', textDecoration: 'underline', textUnderlineOffset: 3 }}>
                Sign in here →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
