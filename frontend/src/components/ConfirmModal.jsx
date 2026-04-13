import { AlertTriangle } from 'lucide-react';

/**
 * Usage:
 *   const [confirm, setConfirm] = useState(null);
 *
 *   // open:
 *   setConfirm({ message: 'Are you sure?', onConfirm: () => doSomething() });
 *
 *   // render:
 *   {confirm && <ConfirmModal {...confirm} onCancel={() => setConfirm(null)} />}
 */
export default function ConfirmModal({
  message      = 'Are you sure?',
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  danger       = true,
  onConfirm,
  onCancel,
}) {
  const handleConfirm = () => { onConfirm?.(); onCancel?.(); };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 8000,
        background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn 0.18s ease',
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: 'var(--surface-container, #1e1e1e)',
          border: '1px solid var(--outline-variant, #333)',
          borderRadius: 16,
          padding: '32px 28px',
          maxWidth: 380,
          width: '100%',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
          animation: 'modalPop 0.25s cubic-bezier(0.34,1.56,0.64,1)',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Icon */}
        <div style={{
          width: 52, height: 52, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: danger ? 'rgba(239,68,68,0.12)' : 'rgba(234,179,8,0.12)',
          border: `1px solid ${danger ? 'rgba(239,68,68,0.3)' : 'rgba(234,179,8,0.3)'}`,
          marginBottom: 20,
        }}>
          <AlertTriangle size={24} color={danger ? '#ef4444' : '#eab308'} />
        </div>

        {/* Message */}
        <p style={{
          fontFamily: 'var(--font-ui, sans-serif)',
          fontSize: '0.9375rem',
          color: 'var(--on-surface, #e0e0e0)',
          lineHeight: 1.6,
          marginBottom: 28,
        }}>
          {message}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onCancel}
            className="btn btn-ghost flex-1"
            style={{ justifyContent: 'center' }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className="btn flex-1"
            style={{
              justifyContent: 'center',
              background: danger ? '#ef4444' : 'var(--primary)',
              color: '#fff',
              border: 'none',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes modalPop {
          from { opacity: 0; transform: scale(0.92) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </div>
  );
}
