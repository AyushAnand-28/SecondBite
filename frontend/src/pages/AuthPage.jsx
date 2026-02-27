import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState(searchParams.get('mode') === 'register' ? 'register' : 'login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', role: 'CONSUMER', phone: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.email) e.email = 'Email is required';
    else if (!/\\S+@\\S+\\.\\S+/.test(form.email)) e.email = 'Invalid email format';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (tab === 'register') {
      if (!form.name.trim()) e.name = 'Name is required';
      if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      if (tab === 'login') {
        const user = await login(form.email, form.password);
        const dest = user.role === 'STORE_OWNER' ? '/dashboard/store' : '/dashboard';
        navigate(dest);
      } else {
        const user = await register({ name: form.name, email: form.email, password: form.password, role: form.role, phone: form.phone });
        const dest = user.role === 'STORE_OWNER' ? '/dashboard/store' : '/dashboard';
        navigate(dest);
      }
    } catch (err) {
      setApiError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--surface-low)', padding: '60px 24px' }}>
      
      <div style={{ width: '100%', maxWidth: 480 }}>
        {/* Logo Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{ width: 44, height: 44, background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', color: '#fff' }}>🥦</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: '1.8rem', color: 'var(--primary)', letterSpacing: '-0.5px' }}>SECONDBITE</span>
          </Link>
          <div style={{ marginTop: 12 }}>
             <span className="section-label-red" style={{ fontStyle: 'italic' }}>
               {tab === 'login' ? 'Welcome back' : 'Join our community'}
             </span>
          </div>
        </div>

        {/* Auth Card — Editorial Style */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--primary)', padding: '40px' }}>
          {/* Tabs */}
          <div className="tabs" style={{ marginBottom: 32, display: 'flex', borderBottom: '1px solid var(--primary)' }}>
            <button 
              style={{
                flex: 1, padding: '16px 0', border: 'none', background: 'transparent',
                fontFamily: 'var(--font-ui)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                color: tab === 'login' ? 'var(--primary)' : 'var(--on-surface-variant)',
                borderBottom: tab === 'login' ? '3px solid var(--primary)' : '3px solid transparent',
                cursor: 'pointer', transition: 'var(--transition)'
              }}
              onClick={() => { setTab('login'); setErrors({}); setApiError(''); }}
            >
              Sign In
            </button>
            <button 
               style={{
                flex: 1, padding: '16px 0', border: 'none', background: 'transparent',
                fontFamily: 'var(--font-ui)', fontSize: '0.85rem', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase',
                color: tab === 'register' ? 'var(--primary)' : 'var(--on-surface-variant)',
                borderBottom: tab === 'register' ? '3px solid var(--primary)' : '3px solid transparent',
                cursor: 'pointer', transition: 'var(--transition)'
              }}
              onClick={() => { setTab('register'); setErrors({}); setApiError(''); }}
            >
              Sign Up
            </button>
          </div>

          {apiError && (
            <div style={{ border: '1px solid var(--primary)', background: 'var(--error-container)', padding: '16px', marginBottom: 24, paddingLeft: 20 }}>
               <span style={{ fontFamily: 'var(--font-display)', color: 'var(--primary)', fontWeight: 700, fontStyle: 'italic' }}>Notice:</span>
               <span style={{ marginLeft: 8, fontFamily: 'var(--font-body)', color: 'var(--primary)' }}>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {tab === 'register' && (
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input className={`input ${errors.name ? 'error' : ''}`} placeholder="Priya Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
                {errors.name && <span className="input-error-msg">{errors.name}</span>}
              </div>
            )}

            <div className="input-group">
              <label className="input-label">Email Address</label>
              <input className={`input ${errors.email ? 'error' : ''}`} type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
              {errors.email && <span className="input-error-msg">{errors.email}</span>}
            </div>

            <div className="input-group">
              <label className="input-label">Password</label>
              <input className={`input ${errors.password ? 'error' : ''}`} type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
              {errors.password && <span className="input-error-msg">{errors.password}</span>}
            </div>

            {tab === 'register' && (
              <>
                <div className="input-group">
                  <label className="input-label">Confirm Password</label>
                  <input className={`input ${errors.confirmPassword ? 'error' : ''}`} type="password" placeholder="••••••••" value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
                  {errors.confirmPassword && <span className="input-error-msg">{errors.confirmPassword}</span>}
                </div>

                <div className="input-group">
                  <label className="input-label">Phone (optional)</label>
                  <input className="input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
                </div>

                <div className="input-group mt-2">
                  <label className="input-label" style={{ marginBottom: 8 }}>Account Type</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, border: '1px solid var(--primary)' }}>
                    {[{ value: 'CONSUMER', label: 'Shopper', desc: 'Buy food' }, { value: 'STORE_OWNER', label: 'Merchant', desc: 'Sell food' }].map((r, idx) => (
                      <div
                        key={r.value}
                        onClick={() => set('role', r.value)}
                        style={{
                          padding: '20px 16px', textAlign: 'center', cursor: 'pointer',
                          background: form.role === r.value ? 'var(--primary)' : 'transparent',
                          color: form.role === r.value ? '#fff' : 'var(--on-surface)',
                          borderRight: idx === 0 ? '1px solid var(--primary)' : 'none',
                          transition: 'all 0.2s',
                        }}
                      >
                        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.05rem', marginBottom: 4 }}>{r.label}</div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '1px', opacity: form.role === r.value ? 0.9 : 0.6 }}>{r.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {tab === 'login' && (
              <div style={{ textAlign: 'right', marginTop: -4 }}>
                <a href="#" style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--primary)', fontWeight: 600 }}>Forgot password?</a>
              </div>
            )}

            <button type="submit" className="btn btn-solid-red w-full mt-4" style={{ justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Please wait…' : tab === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--outline-subtle)' }}>
            <p style={{ fontFamily: 'var(--font-body)', fontSize: '1.05rem', color: 'var(--on-surface-variant)' }}>
              {tab === 'login' ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setErrors({}); setApiError(''); }}
                style={{ color: 'var(--primary)', fontWeight: 700, fontStyle: 'italic', fontFamily: 'var(--font-display)', fontSize: '1.1rem', background: 'none', border: 'none', cursor: 'pointer', marginLeft: 4 }}
              >
                {tab === 'login' ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
