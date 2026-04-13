import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}

// ─── Icons & colours per type ────────────────────────────────────────────────
const CONFIG = {
  success: { icon: CheckCircle,    bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.35)',  color: '#22c55e' },
  error:   { icon: XCircle,        bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  color: '#ef4444' },
  warning: { icon: AlertTriangle,  bg: 'rgba(234,179,8,0.12)',  border: 'rgba(234,179,8,0.35)',  color: '#eab308' },
  info:    { icon: Info,           bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)', color: '#3b82f6' },
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const counter = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts(ts => ts.map(t => t.id === id ? { ...t, leaving: true } : t));
    setTimeout(() => setToasts(ts => ts.filter(t => t.id !== id)), 320);
  }, []);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++counter.current;
    setToasts(ts => [...ts, { id, message, type, leaving: false }]);
    if (duration > 0) setTimeout(() => dismiss(id), duration);
    return id;
  }, [dismiss]);

  // Shorthand helpers
  toast.success = (msg, dur) => toast(msg, 'success', dur);
  toast.error   = (msg, dur) => toast(msg, 'error',   dur ?? 5000);
  toast.warning = (msg, dur) => toast(msg, 'warning', dur);
  toast.info    = (msg, dur) => toast(msg, 'info',    dur);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ─── Container ────────────────────────────────────────────────────────────────
function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => <ToastItem key={t.id} toast={t} onDismiss={onDismiss} />)}
    </div>
  );
}

function ToastItem({ toast: t, onDismiss }) {
  const { icon: Icon, bg, border, color } = CONFIG[t.type] || CONFIG.info;
  return (
    <div
      style={{
        pointerEvents: 'auto',
        display: 'flex', alignItems: 'flex-start', gap: 12,
        minWidth: 280, maxWidth: 380,
        padding: '14px 16px',
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 12,
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
        fontFamily: 'var(--font-ui, sans-serif)',
        fontSize: '0.875rem',
        color: 'var(--on-surface, #e0e0e0)',
        animation: t.leaving
          ? 'toastOut 0.3s ease forwards'
          : 'toastIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
      }}
    >
      <Icon size={18} style={{ color, flexShrink: 0, marginTop: 1 }} />
      <span style={{ flex: 1, lineHeight: 1.5 }}>{t.message}</span>
      <button
        onClick={() => onDismiss(t.id)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: 'var(--on-surface-variant)', padding: 0, flexShrink: 0,
          display: 'flex', alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes toastOut {
          from { opacity: 1; transform: translateY(0) scale(1); }
          to   { opacity: 0; transform: translateY(8px) scale(0.95); }
        }
      `}</style>
    </div>
  );
}
