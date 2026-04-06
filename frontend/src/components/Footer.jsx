import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                <span style={{ color: '#fff', display: 'flex' }}><Leaf size={24} strokeWidth={1.5} /></span>
              </div>
              <span className="footer-logo-big" style={{ fontSize: '1.8rem' }}>SECONDBITE</span>
            </div>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: 280, lineHeight: 1.7 }}>
              A vintage approach to a modern problem. Connecting communities with rescued food, reducing waste one bite at a time.
            </p>
          </div>
          <div>
            <h4 className="section-label" style={{ marginBottom: 24 }}>Marketplace</h4>
            <Link to="/browse" className="footer-link">Browse Stores</Link>
            <Link to="/browse" className="footer-link">Flash Deals</Link>
            <a className="footer-link" href="#">Bakery</a>
            <a className="footer-link" href="#">Produce</a>
          </div>
          <div>
            <h4 className="section-label" style={{ marginBottom: 24 }}>Partners</h4>
            <Link to="/auth?mode=register" className="footer-link">List Your Store</Link>
            <a className="footer-link" href="#">Partner Guide</a>
            <a className="footer-link" href="#">Success Stories</a>
          </div>
          <div>
            <h4 className="section-label" style={{ marginBottom: 24 }}>Company</h4>
            <a className="footer-link" href="#">About Us</a>
            <a className="footer-link" href="#">Impact Report</a>
            <a className="footer-link" href="#">Journal</a>
            <a className="footer-link" href="#">Contact</a>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 SecondBite. Roma – Mumbai.</span>
          <div style={{ display: 'flex', gap: 24 }}>
            <a href="#" className="footer-link" style={{ fontSize: '0.85rem' }}>Privacy</a>
            <a href="#" className="footer-link" style={{ fontSize: '0.85rem' }}>Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
