import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { trackTrzEvent } from '../utils/trzTracker';

const PHONE_NUMBER = '+18682810670';
const EMAIL_ADDRESS = 'therentalzonett@gmail.com';
const WHATSAPP_URL = 'https://wa.me/18682810670';
const FACEBOOK_URL = 'https://www.facebook.com/share/1bPtvgiXAw/';
const INSTAGRAM_URL = 'https://www.instagram.com/therentalzonett/';
const TIKTOK_URL = 'https://www.tiktok.com/@therentalzonett?_r=1&_t=ZS-9ALbc2VpOAn';

const contactCardStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '14px',
  padding: '20px',
  borderRadius: '16px',
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  textDecoration: 'none',
  color: '#0f172a'
};

const tapStyle = {
  flexShrink: 0,
  fontSize: '12px',
  fontWeight: '900',
  color: '#0284c7',
  whiteSpace: 'nowrap'
};

export default function Contact() {
  const [offer, setOffer] = useState(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    trackTrzEvent('contact_view');

    const loadOffer = async () => {
      const { data, error } = await supabase
        .from('promotional_offers')
        .select('offer_active, offer_price, offer_hours, offer_ends_at')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error || !data) return;

      const isLive =
        data.offer_active === true &&
        data.offer_ends_at &&
        new Date(data.offer_ends_at).getTime() > Date.now();

      if (isLive) {
        setOffer(data);
      }
    };

    loadOffer();
  }, []);

  useEffect(() => {
    if (!offer?.offer_ends_at) return;

    const updateCountdown = () => {
      const remaining =
        new Date(offer.offer_ends_at).getTime() - Date.now();

      if (remaining <= 0) {
        setCountdown('');
        setOffer(null);
        return;
      }

      const totalSeconds = Math.floor(remaining / 1000);
      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setCountdown(
        `${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
      );
    };

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [offer]);

  const goToBooking = (eventName = 'contact_book_click') => {
    trackTrzEvent(eventName);
    window.location.hash = '#booking';
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div style={{
      width: '100%',
      background: '#f8fafc',
      color: '#0f172a',
      fontFamily: 'system-ui, sans-serif'
    }}>
      <section style={{
        background: 'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 100%)',
        padding: '42px 20px 34px',
        textAlign: 'center',
        borderBottom: '1px solid #e2e8f0'
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: '999px',
            background: '#dbeafe',
            color: '#0369a1',
            fontSize: '12px',
            fontWeight: '800',
            marginBottom: '12px'
          }}>
            THE RENTAL ZONE TT
          </div>

          <h1 style={{
            margin: '0 0 12px',
            fontSize: 'clamp(30px, 7vw, 46px)',
            fontWeight: '900'
          }}>
            Contact Us
          </h1>

          <p style={{
            margin: 0,
            fontSize: '17px',
            lineHeight: 1.6,
            color: '#475569'
          }}>
            Have a question about the bouncer, availability, delivery, or your booking?
          </p>
        </div>
      </section>

      <section style={{ padding: '34px 20px', background: '#ffffff' }}>
        <div style={{
          maxWidth: '680px',
          margin: '0 auto',
          display: 'grid',
          gap: '14px'
        }}>

          <a
            href={`tel:${PHONE_NUMBER}`}
            style={contactCardStyle}
          >
            <div>
              <strong style={{ fontSize: '19px' }}>📞 Call Us</strong>
              <div style={{
                marginTop: '6px',
                color: '#64748b',
                fontSize: '14px'
              }}>
                (868) 281-0670
              </div>
            </div>
            <span style={tapStyle}>👆 Tap to open</span>
          </a>

          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={contactCardStyle}
          >
            <div>
              <strong style={{ fontSize: '19px' }}>💬 WhatsApp</strong>
              <div style={{
                marginTop: '6px',
                color: '#64748b',
                fontSize: '14px'
              }}>
                Best option for booking questions and quick responses.
              </div>
            </div>
            <span style={tapStyle}>👆 Tap to open</span>
          </a>

          <a
            href={`mailto:${EMAIL_ADDRESS}`}
            style={contactCardStyle}
          >
            <div>
              <strong style={{ fontSize: '19px' }}>📧 Email Us</strong>
              <div style={{
                marginTop: '6px',
                color: '#64748b',
                fontSize: '14px'
              }}>
                {EMAIL_ADDRESS}
              </div>
            </div>
            <span style={tapStyle}>👆 Tap to open</span>
          </a>

          <a
            href={FACEBOOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={contactCardStyle}
          >
            <div>
              <strong style={{ fontSize: '19px' }}>Facebook</strong>
              <div style={{
                marginTop: '6px',
                color: '#64748b',
                fontSize: '14px'
              }}>
                Find and connect with The Rental Zone on Facebook.
              </div>
            </div>
            <span style={tapStyle}>👆 Tap to open</span>
          </a>

          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={contactCardStyle}
          >
            <div>
              <strong style={{ fontSize: '19px' }}>Instagram</strong>
              <div style={{
                marginTop: '6px',
                color: '#64748b',
                fontSize: '14px'
              }}>
                Follow or message The Rental Zone on Instagram.
              </div>
            </div>
            <span style={tapStyle}>👆 Tap to open</span>
          </a>

          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={contactCardStyle}
          >
            <div>
              <strong style={{ fontSize: '19px' }}>TikTok</strong>
              <div style={{
                marginTop: '6px',
                color: '#64748b',
                fontSize: '14px'
              }}>
                Follow The Rental Zone on TikTok.
              </div>
            </div>
            <span style={tapStyle}>👆 Tap to open</span>
          </a>

        </div>
      </section>

      {offer && (
        <section style={{
          padding: '28px 20px',
          background: '#fff7ed',
          borderTop: '1px solid #fed7aa',
          borderBottom: '1px solid #fed7aa',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '680px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'inline-block',
              padding: '5px 10px',
              borderRadius: '999px',
              background: '#ea580c',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '900',
              marginBottom: '10px'
            }}>
              LIMITED-TIME OFFER
            </div>

            <h2 style={{
              margin: '0 0 8px',
              fontSize: '26px',
              fontWeight: '900'
            }}>
              {offer.offer_hours}-Hour Rental for TT${offer.offer_price}
            </h2>

            <p style={{
              margin: '0 0 6px',
              color: '#475569',
              fontSize: '15px'
            }}>
              Regular price TT$975 — <strong>SAVE TT$375</strong>
            </p>

            {countdown && (
              <p style={{
                margin: '8px 0 16px',
                fontWeight: '900',
                color: '#c2410c'
              }}>
                Offer ends in {countdown}
              </p>
            )}

            <button
              type="button"
              onClick={() => goToBooking('contact_special_click')}
              style={{
                border: 'none',
                borderRadius: '12px',
                background: '#ea580c',
                color: '#ffffff',
                padding: '13px 22px',
                fontSize: '15px',
                fontWeight: '900',
                cursor: 'pointer'
              }}
            >
              Book Special Offer
            </button>
          </div>
        </section>
      )}

      <section style={{
        padding: '38px 20px 44px',
        background: '#f8fafc',
        borderTop: '1px solid #e2e8f0',
        textAlign: 'center'
      }}>
        <h2 style={{
          margin: '0 0 10px',
          fontSize: '27px',
          fontWeight: '900'
        }}>
          Ready to book?
        </h2>

        <p style={{
          margin: '0 0 20px',
          color: '#64748b'
        }}>
          Check your date and start your booking request.
        </p>

        <button
          type="button"
          onClick={goToBooking}
          style={{
            border: 'none',
            borderRadius: '12px',
            background: '#0284c7',
            color: '#ffffff',
            padding: '14px 24px',
            fontSize: '16px',
            fontWeight: '900',
            cursor: 'pointer'
          }}
        >
          Check Availability & Book
        </button>
      </section>
    </div>
  );
}
