import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { trackTrzEvent } from '../utils/trzTracker';

/*
  THE RENTAL ZONE TT — HOW IT WORKS
  ------------------------------------------------------------
  STATUS: PUBLIC PAGE
  PURPOSE:
  - Show the customer the actual booking-form process.
  - Mirror the real BookingForm.jsx flow.
  - Show the existing promotional offer when enabled in Admin.

  TRACKING:
  - how_it_works_view
  - how_it_works_book_click
  - how_it_works_special_click

  CHANGE CONTROL:
  - No BookingForm changes.
  - No booking logic changes.
  - No database/schema changes.
  - Promo is controlled by promotional_offers.
*/

const steps = [
  {
    number: '1',
    title: 'Enter your contact details',
    text: 'Provide your name and WhatsApp number so we know who the booking request is for and how to contact you.',
    details: ['Name', 'WhatsApp number'],
  },
  {
    number: '2',
    title: 'Select your rental',
    text: 'Choose the rental package you want for your event.',
    details: ['2 Hours', '3 Hours', 'Full Day / 8 Hours'],
  },
  {
    number: '3',
    title: 'Check availability',
    text: 'Choose the date and time for your event and check whether the requested slot is available.',
    details: ['Event date', 'Event time'],
  },
  {
    number: '4',
    title: 'Enter your delivery address',
    text: 'Tell us where the bouncer needs to be delivered and set up.',
    details: ['Delivery address'],
  },
  {
    number: '5',
    title: 'Add optional information',
    text: 'If there is anything else we should know about your event or location, you can add it here.',
    details: ['Optional notes'],
  },
  {
    number: '6',
    title: 'Generate your booking',
    text: 'Submit the completed form to generate your booking request. We then review the details and contact you through WhatsApp to confirm.',
    details: ['Submit booking request', 'Review and confirmation'],
  },
];

export default function HowItWorks() {
  const [offer, setOffer] = useState(null);
  const [secondsLeft, setSecondsLeft] = useState(null);

  useEffect(() => {
    trackTrzEvent('how_it_works_view');

    const loadOffer = async () => {
      const { data, error } = await supabase
        .from('promotional_offers')
        .select(
          'offer_active, offer_price, offer_hours, offer_ends_at'
        )
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('How It Works promo load failed:', error);
        return;
      }

      if (!data?.offer_active || !data?.offer_ends_at) {
        setOffer(null);
        return;
      }

      const endTime = new Date(data.offer_ends_at).getTime();

      if (endTime <= Date.now()) {
        setOffer(null);
        return;
      }

      setOffer(data);
      setSecondsLeft(
        Math.max(0, Math.floor((endTime - Date.now()) / 1000))
      );
    };

    loadOffer();
  }, []);

  useEffect(() => {
    if (!offer?.offer_ends_at) return;

    const timer = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor(
          (new Date(offer.offer_ends_at).getTime() - Date.now()) / 1000
        )
      );

      setSecondsLeft(remaining);

      if (remaining <= 0) {
        setOffer(null);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [offer]);

  const goToBooking = (eventName = 'how_it_works_book_click') => {
    trackTrzEvent(eventName);

    window.location.hash = '#booking';

    window.scrollTo({
      top: 0,
      behavior: 'instant',
    });

    setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'instant',
      });
    }, 100);
  };

  const formatCountdown = (seconds) => {
    if (seconds === null) return '';

    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return `${String(hours).padStart(2, '0')}:${String(
      minutes
    ).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div
      style={{
        width: '100%',
        background: '#f8fafc',
        color: '#0f172a',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* HERO */}
      <section
        style={{
          background:
            'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 100%)',
          padding: '42px 20px 34px',
          textAlign: 'center',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 12px',
              borderRadius: '999px',
              background: '#dbeafe',
              color: '#0369a1',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '0.04em',
              marginBottom: '12px',
            }}
          >
            THE RENTAL ZONE TT
          </div>

          <h1
            style={{
              margin: '0 0 12px',
              fontSize: 'clamp(30px, 7vw, 46px)',
              lineHeight: 1.08,
              fontWeight: '900',
            }}
          >
            How It Works
          </h1>

          <p
            style={{
              margin: 0,
              fontSize: '17px',
              lineHeight: 1.6,
              color: '#475569',
            }}
          >
            Simple booking. Clear process. Here is exactly what happens
            when you book with The Rental Zone.
          </p>
        </div>
      </section>

      {/* BOOKING PROCESS */}
      <section
        style={{
          padding: '34px 20px',
          background: '#ffffff',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2
            style={{
              margin: '0 0 8px',
              fontSize: '26px',
              fontWeight: '900',
              textAlign: 'center',
            }}
          >
            Your booking process
          </h2>

          <p
            style={{
              margin: '0 0 28px',
              textAlign: 'center',
              color: '#64748b',
              fontSize: '14px',
            }}
          >
            The booking form takes you through these steps.
          </p>

          <div style={{ display: 'grid', gap: '16px' }}>
            {steps.map((step) => (
              <div
                key={step.number}
                style={{
                  display: 'flex',
                  gap: '16px',
                  alignItems: 'flex-start',
                  padding: '19px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  background: '#f8fafc',
                  boxShadow:
                    '0 2px 8px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    minWidth: '40px',
                    borderRadius: '50%',
                    background: '#0ea5e9',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '900',
                    fontSize: '17px',
                  }}
                >
                  {step.number}
                </div>

                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      margin: '1px 0 7px',
                      fontSize: '18px',
                      fontWeight: '800',
                    }}
                  >
                    {step.title}
                  </h3>

                  <p
                    style={{
                      margin: '0 0 12px',
                      fontSize: '14px',
                      lineHeight: 1.55,
                      color: '#64748b',
                    }}
                  >
                    {step.text}
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '7px',
                    }}
                  >
                    {step.details.map((detail) => (
                      <span
                        key={detail}
                        style={{
                          padding: '5px 9px',
                          borderRadius: '999px',
                          background: '#e0f2fe',
                          color: '#0369a1',
                          fontSize: '12px',
                          fontWeight: '700',
                        }}
                      >
                        {detail}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FLOW SUMMARY */}
      <section
        style={{
          padding: '34px 20px',
          background: '#f1f5f9',
          borderTop: '1px solid #e2e8f0',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2
            style={{
              margin: '0 0 20px',
              textAlign: 'center',
              fontSize: '25px',
              fontWeight: '900',
            }}
          >
            At a glance
          </h2>

          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              border: '1px solid #e2e8f0',
              padding: '20px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: '800',
              }}
            >
              {[
                'Your Details',
                'Select Rental',
                'Check Availability',
                'Address',
                'Optional Notes',
                'Generate Booking',
              ].map((item, index, array) => (
                <React.Fragment key={item}>
                  <span
                    style={{
                      padding: '8px 10px',
                      borderRadius: '9px',
                      background: '#e0f2fe',
                      color: '#0369a1',
                    }}
                  >
                    {item}
                  </span>

                  {index < array.length - 1 && (
                    <span style={{ color: '#94a3b8' }}>→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* BEFORE YOU BOOK */}
      <section
        style={{
          padding: '34px 20px',
          background: '#ffffff',
        }}
      >
        <div style={{ maxWidth: '680px', margin: '0 auto' }}>
          <h2
            style={{
              margin: '0 0 18px',
              textAlign: 'center',
              fontSize: '25px',
              fontWeight: '900',
            }}
          >
            Before You Book
          </h2>

          <div style={{ display: 'grid', gap: '10px' }}>
            <div
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '15px 16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <strong>Size:</strong> 26 × 13 × 13 ft
            </div>

            <div
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '15px 16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <strong>Capacity:</strong> Up to 8 children at a time
            </div>

            <div
              style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '15px 16px',
                border: '1px solid #e2e8f0',
              }}
            >
              <strong>Use:</strong> Dry use only
            </div>
          </div>
        </div>
      </section>

      {/* CTA + PROMO */}
      <section
        style={{
          padding: '38px 20px 44px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: '620px', margin: '0 auto' }}>
          <h2
            style={{
              margin: '0 0 10px',
              fontSize: '27px',
              fontWeight: '900',
            }}
          >
            Ready to check your date?
          </h2>

          <p
            style={{
              margin: '0 0 20px',
              color: '#64748b',
              fontSize: '15px',
            }}
          >
            Start the booking form and follow the steps above.
          </p>

          {offer && secondsLeft > 0 && (
            <div
              style={{
                margin: '0 auto 18px',
                padding: '18px',
                borderRadius: '16px',
                background:
                  'linear-gradient(135deg, #fff7ed 0%, #ffffff 100%)',
                border: '2px solid #f97316',
                boxShadow:
                  '0 5px 16px rgba(249, 115, 22, 0.12)',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  padding: '5px 9px',
                  borderRadius: '999px',
                  background: '#ffedd5',
                  color: '#c2410c',
                  fontSize: '11px',
                  fontWeight: '900',
                  marginBottom: '8px',
                }}
              >
                SPECIAL OFFER
              </div>

              <div
                style={{
                  fontSize: '22px',
                  fontWeight: '900',
                  color: '#0f172a',
                }}
              >
                {offer.offer_hours}-Hour Rental — TT$
                {offer.offer_price}
              </div>

              <div
                style={{
                  marginTop: '5px',
                  fontSize: '13px',
                  color: '#64748b',
                }}
              >
                Limited-time offer
              </div>

              <div
                style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  fontWeight: '800',
                  color: '#c2410c',
                }}
              >
                Ends in {formatCountdown(secondsLeft)}
              </div>

              <button
                type="button"
                onClick={() =>
                  goToBooking('how_it_works_special_click')
                }
                style={{
                  width: '100%',
                  marginTop: '14px',
                  border: 'none',
                  borderRadius: '10px',
                  background: '#ea580c',
                  color: '#ffffff',
                  padding: '12px 18px',
                  fontSize: '15px',
                  fontWeight: '900',
                  cursor: 'pointer',
                }}
              >
                Check Availability & Book
              </button>
            </div>
          )}

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
              cursor: 'pointer',
              boxShadow:
                '0 4px 12px rgba(2, 132, 199, 0.25)',
            }}
          >
            Check Availability & Book
          </button>
        </div>
      </section>
    </div>
  );
}
