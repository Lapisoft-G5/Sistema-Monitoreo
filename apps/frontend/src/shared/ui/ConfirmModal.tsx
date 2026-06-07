import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { borderCol, cardBg, textPrimary, textSecondary } from './form-controls';

/* ============================================================
 * Modal de confirmación reutilizable (overlay centrado).
 * Cierra con click en el fondo o tecla Escape.
 * ============================================================ */

interface Props {
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export const ConfirmModal = ({
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  danger = false,
}: Props) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const accent = danger ? '#ef4444' : '#0046c7';

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(15, 23, 42, 0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        style={{
          background: cardBg,
          borderRadius: 16,
          padding: '28px 24px 24px',
          width: '100%',
          maxWidth: 380,
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: danger ? '#fef2f2' : '#eff6ff',
            border: `1px solid ${danger ? '#fee2e2' : '#dbeafe'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>

        <h2 style={{ margin: '0 0 8px', fontSize: '1.15rem', fontWeight: 700, color: textPrimary }}>{title}</h2>
        <p style={{ margin: '0 0 22px', fontSize: '0.85rem', color: textSecondary, lineHeight: 1.55 }}>{message}</p>

        <button
          onClick={onConfirm}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 10,
            border: 'none',
            background: danger ? '#dc2626' : accent,
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            marginBottom: 10,
          }}
        >
          {confirmLabel}
        </button>
        <button
          onClick={onCancel}
          style={{
            width: '100%',
            padding: 12,
            borderRadius: 10,
            border: `1px solid ${borderCol}`,
            background: cardBg,
            color: textPrimary,
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {cancelLabel}
        </button>
      </div>
    </div>
  );
};
