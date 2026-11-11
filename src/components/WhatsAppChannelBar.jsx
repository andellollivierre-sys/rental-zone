import React, { useState } from 'react';

const DISMISS_KEY = 'trz-whatsapp-channel-banner-dismissed';

export default function WhatsAppChannelBar() {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return window.localStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  const channelUrl = import.meta.env.VITE_WHATSAPP_CHANNEL_URL;

  const dismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // Dismiss for this page view if storage is unavailable.
    }
  };

  if (dismissed) return null;

  return (
    <aside
      aria-label="Follow The Rental Zone on WhatsApp"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '14px',
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        padding: '11px 52px 11px 18px',
        background: '#ffffff',
        color: '#0f172a',
        borderBottom: '1px solid #e2e8f0',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <span
        aria-hidden="true"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          flex: '0 0 34px',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          background: '#e8f7ee',
          color: '#168344',
          fontSize: '19px',
          fontWeight: 700,
        }}
      >
        ◉
      </span>

      <div style={{ minWidth: 0, flex: '0 1 auto' }}>
        <div style={{ fontSize: '13px', lineHeight: 1.35, fontWeight: 750, letterSpacing: '0.01em' }}>
          Stay in the loop.
        </div>
        <div style={{ marginTop: '2px', color: '#64748b', fontSize: '12px', lineHeight: 1.4 }}>
          Get first access to new rentals, offers and updates.
        </div>
      </div>

      {channelUrl ? (
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open The Rental Zone WhatsApp Channel in a new tab"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flex: '0 0 auto',
            minHeight: '35px',
            padding: '0 14px',
            borderRadius: '7px',
            background: '#176b3a',
            color: '#ffffff',
            fontSize: '12px',
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
            boxShadow: '0 1px 2px rgba(15,23,42,0.12)',
          }}
        >
          Follow Channel
        </a>
      ) : (
        <button
          type="button"
          disabled
          title="The WhatsApp Channel invite link will be connected before launch."
          style={{
            minHeight: '35px',
            padding: '0 14px',
            border: 0,
            borderRadius: '7px',
            background: '#176b3a',
            color: '#ffffff',
            fontFamily: 'inherit',
            fontSize: '12px',
            fontWeight: 700,
            opacity: 0.65,
            cursor: 'not-allowed',
            whiteSpace: 'nowrap',
          }}
        >
          Follow Channel
        </button>
      )}

      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss WhatsApp channel announcement"
        title="Dismiss"
        style={{
          position: 'absolute',
          top: '50%',
          right: '12px',
          transform: 'translateY(-50%)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '28px',
          height: '28px',
          padding: 0,
          border: 0,
          borderRadius: '50%',
          background: 'transparent',
          color: '#64748b',
          fontSize: '20px',
          lineHeight: 1,
          cursor: 'pointer',
        }}
      >
        ×
      </button>

      <style>{`
        @media (max-width: 520px) {
          .trz-whatsapp-banner-copy {
            flex: 1 1 auto;
          }
        }
      `}</style>
    </aside>
  );
}
