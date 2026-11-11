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
      // The banner still dismisses for this page view if storage is unavailable.
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
        gap: '12px',
        flexWrap: 'wrap',
        position: 'relative',
        padding: '10px 48px 10px 16px',
        background: '#dcfce7',
        color: '#14532d',
        borderBottom: '1px solid #bbf7d0',
        fontFamily: 'system-ui, sans-serif',
        fontSize: '13px',
        lineHeight: 1.4,
        textAlign: 'center',
      }}
    >
      <span>
        <strong>Stay connected with The Rental Zone!</strong>{' '}
        Follow our WhatsApp Channel for new rentals, special offers and updates.
      </span>

      {channelUrl ? (
        <a
          href={channelUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '7px 13px',
            borderRadius: '999px',
            background: '#15803d',
            color: '#ffffff',
            fontWeight: 700,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          Follow our WhatsApp Channel
        </a>
      ) : (
        <button
          type="button"
          disabled
          title="The WhatsApp Channel link will be connected before launch."
          style={{
            padding: '7px 13px',
            border: 0,
            borderRadius: '999px',
            background: '#15803d',
            color: '#ffffff',
            font: 'inherit',
            fontWeight: 700,
            opacity: 0.75,
            cursor: 'not-allowed',
          }}
        >
          Follow our WhatsApp Channel
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
          width: '28px',
          height: '28px',
          border: 0,
          borderRadius: '50%',
          background: 'transparent',
          color: '#14532d',
          fontSize: '21px',
          lineHeight: 1,
          cursor: 'pointer',
        }}
      >
        ×
      </button>
    </aside>
  );
}
