import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { trackTrzEvent } from '../utils/trzTracker';

const faqs = [
  {
    category: 'The Bouncer',
    questions: [
      ['What size is the bouncer?', 'The Spider-Man Combo Bouncer is 26 × 13 × 13 ft.'],
      ['How many children can use it?', 'The bouncer can accommodate up to 8 children at a time.'],
      ['Is it wet or dry?', 'This bouncer is for dry use only.'],
    ],
  },
  {
    category: 'Packages & Pricing',
    questions: [
      ['What rental packages are available?', 'We offer 2-hour, 3-hour, and full-day / 8-hour rental packages.'],
      ['Is a deposit required?', 'There is currently no deposit required for the rental.'],
      ['When is payment due?', 'Payment is due on delivery.'],
    ],
  },
  {
    category: 'Booking',
    questions: [
      ['How do I check availability?', 'Start the booking form and enter your event date and time.'],
      ['What information do I need?', 'You will provide your name, WhatsApp number, rental choice, event date and time, delivery address, and any optional notes.'],
      ['Is my booking automatically confirmed?', 'No. Submitting the booking generates a booking request. We review the details and contact you through WhatsApp to confirm.'],
    ],
  },
  {
    category: 'Delivery & Setup',
    questions: [
      ['Do you deliver and set up the bouncer?', 'Yes. The Rental Zone handles delivery and setup for the rental.'],
      ['How much space is needed?', 'You need enough clear space to accommodate the 26 × 13 × 13 ft bouncer and allow for safe setup and use.'],
    ],
  },
];

export default function FAQ() {
  const [offer, setOffer] = useState(null);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    trackTrzEvent('faq_view');

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
      const remaining = new Date(offer.offer_ends_at).getTime() - Date.now();

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

  const goToBooking = (eventName = 'faq_book_click') => {
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
            Frequently Asked Questions
          </h1>

          <p style={{
            margin: 0,
            fontSize: '17px',
            lineHeight: 1.6,
            color: '#475569'
          }}>
            Everything you need to know about renting our Spider-Man Combo Bouncer.
          </p>
        </div>
      </section>

      <section style={{
        padding: '34px 20px',
        background: '#ffffff'
      }}>
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          {faqs.map((group) => (
            <div key={group.category} style={{ marginBottom: '30px' }}>
              <h2 style={{
                margin: '0 0 14px',
                fontSize: '23px',
                fontWeight: '900'
              }}>
                {group.category}
              </h2>

              <div style={{ display: 'grid', gap: '10px' }}>
                {group.questions.map(([question, answer]) => (
                  <details
                    key={question}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      padding: '15px 16px'
                    }}
                  >
                    <summary style={{
                      cursor: 'pointer',
                      fontWeight: '800',
                      color: '#0f172a'
                    }}>
                      {question}
                    </summary>

                    <p style={{
                      margin: '12px 0 0',
                      color: '#64748b',
                      fontSize: '14px',
                      lineHeight: 1.55
                    }}>
                      {answer}
                    </p>
                  </details>
                ))}
              </div>
            </div>
          ))}
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
              onClick={() => goToBooking('faq_special_click')}
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
          Ready to check your date?
        </h2>

        <p style={{
          margin: '0 0 20px',
          color: '#64748b'
        }}>
          Start the booking form and check availability.
        </p>

        <button
          type="button"
          onClick={() => goToBooking()}
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
