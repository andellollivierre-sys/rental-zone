import React, { useState } from 'react';

const DISMISS_KEY = 'trz-whatsapp-channel-banner-dismissed';

const WhatsAppChannelBar = () => {
  const [isVisible, setIsVisible] = useState(() => {
    try {
      return window.localStorage.getItem(DISMISS_KEY) !== '1';
    } catch {
      return true;
    }
  });

  const whatsappUrl = import.meta.env.VITE_WHATSAPP_CHANNEL_URL || '';

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // The banner still closes for the current page view.
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <>
      <aside aria-label="WhatsApp Channel Announcement" className="rz-wa-banner">
        <div className="rz-wa-container">
          <div className="rz-wa-content">
            <span className="rz-wa-badge">NEW</span>
            <div className="rz-wa-copy">
              <span className="rz-wa-headline">Join our WhatsApp Channel</span>
              <span className="rz-wa-separator" aria-hidden="true">•</span>
              <span className="rz-wa-description">
                Get exclusive rental offers &amp; inventory updates first.
              </span>
            </div>
          </div>

          <div className="rz-wa-actions">
            {whatsappUrl ? (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rz-wa-follow"
              >
                <svg
                  className="rz-wa-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.447-.521.149-.174.198-.298.298-.497.099-.198.05-.372-.025-.521-.075-.149-.669-1.612-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"
                    fill="currentColor"
                  />
                  <path
                    d="M12 2C6.477 2 2 6.477 2 12c0 2.224.726 4.28 1.956 5.945L2.5 21.5l3.655-1.417C7.752 21.282 9.78 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.996 0-3.847-.597-5.394-1.624l-.386-.257-2.67.1.848-2.584-.282-.416C3.293 13.784 2.75 11.95 2.75 10c0-5.109 4.141-9.25 9.25-9.25s9.25 4.141 9.25 9.25-4.141 9.25-9.25 9.25z"
                    fill="currentColor"
                  />
                </svg>
                <span>Follow Channel</span>
              </a>
            ) : (
              <button className="rz-wa-follow rz-wa-disabled" type="button" disabled>
                Follow Channel
              </button>
            )}

            <button
              onClick={handleDismiss}
              className="rz-wa-close"
              aria-label="Dismiss banner"
              type="button"
            >
              &times;
            </button>
          </div>
        </div>
      </aside>

      <style>{`
        .rz-wa-banner {
          background: #0d131f;
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
          color: #f8fafc;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          font-size: 0.85rem;
          line-height: 1.4;
          width: 100%;
          position: relative;
          z-index: 40;
          box-sizing: border-box;
        }
        .rz-wa-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0.45rem 1rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 0.75rem;
        }
        .rz-wa-content {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex: 1 1 auto;
          min-width: 0;
        }
        .rz-wa-badge {
          background: rgba(37, 211, 102, 0.15);
          color: #25d366;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          padding: 0.15rem 0.45rem;
          border-radius: 4px;
          border: 1px solid rgba(37, 211, 102, 0.3);
          text-transform: uppercase;
          flex-shrink: 0;
        }
        .rz-wa-copy {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          flex-wrap: wrap;
          min-width: 0;
        }
        .rz-wa-headline {
          font-weight: 600;
          color: #fff;
        }
        .rz-wa-separator {
          color: #475569;
          font-size: 0.75rem;
        }
        .rz-wa-description {
          color: #94a3b8;
          font-size: 0.8rem;
        }
        .rz-wa-actions {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          flex-shrink: 0;
          margin-left: auto;
        }
        .rz-wa-follow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          background: #25d366;
          color: #0b141a;
          font-weight: 600;
          font-size: 0.78rem;
          padding: 0.42rem 0.8rem;
          min-height: 34px;
          box-sizing: border-box;
          border-radius: 6px;
          text-decoration: none;
          border: none;
          cursor: pointer;
          white-space: nowrap;
        }
        .rz-wa-follow:hover {
          background: #20bd5a;
        }
        .rz-wa-disabled {
          background: #334155;
          color: #94a3b8;
          cursor: not-allowed;
          opacity: 0.8;
        }
        .rz-wa-icon {
          width: 14px;
          height: 14px;
          flex-shrink: 0;
        }
        .rz-wa-close {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 1.35rem;
          line-height: 1;
          padding: 0.2rem 0.3rem;
          cursor: pointer;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rz-wa-close:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.08);
        }
        @media (max-width: 640px) {
          .rz-wa-container {
            align-items: flex-start;
            gap: 0.55rem;
            padding: 0.65rem 0.75rem;
          }
          .rz-wa-content {
            align-items: flex-start;
            gap: 0.45rem;
          }
          .rz-wa-copy {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.12rem;
          }
          .rz-wa-headline {
            font-size: 0.78rem;
            white-space: normal;
          }
          .rz-wa-separator {
            display: none;
          }
          .rz-wa-description {
            font-size: 0.7rem;
            line-height: 1.35;
          }
          .rz-wa-actions {
            gap: 0.3rem;
            padding-top: 0.05rem;
          }
          .rz-wa-follow {
            font-size: 0.7rem;
            padding: 0.4rem 0.55rem;
            min-height: 32px;
          }
          .rz-wa-icon {
            display: none;
          }
          .rz-wa-close {
            padding: 0.15rem;
          }
        }
        @media (max-width: 360px) {
          .rz-wa-badge {
            display: none;
          }
          .rz-wa-description {
            max-width: 175px;
          }
          .rz-wa-follow {
            font-size: 0.66rem;
            padding: 0.38rem 0.45rem;
          }
        }
      `}</style>
    </>
  );
};

export default WhatsAppChannelBar;
