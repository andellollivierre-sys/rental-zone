import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { trackTrzEvent } from '../utils/trzTracker';

/*

THE RENTAL ZONE TT — PROJECT STATUS

FILE:
src/components/OurBouncer.jsx

CURRENT STATUS:
Our Bouncer page — hero/media presentation pass completed.
Tracking pass added using existing trzTracker.js.

LATEST CONFIRMED UPDATE:

Hero title remains "Spider-Man Combo Bouncer".

Check Availability remains below the description.

The bouncer representation is one unified full-width visual.

Bounce → Climb → Slide are presented together inside that visual.

"Photos and video coming soon" is incorporated into the same visual.

Existing balloon decorations remain.

Instagram/Reel has been removed.

No separate media/image card sits beside the hero text.


BOOKING BEHAVIOUR:

All booking buttons navigate to #booking.

Package cards do NOT preselect a package.

BookingForm.jsx must NOT be modified for this page update.


TRACKING:

Tracking uses the existing src/utils/trzTracker.js.

No tracker/schema changes were made.

Tracked events:

- our_bouncer_view
- our_bouncer_book_click
- our_bouncer_2h_click
- our_bouncer_3h_click
- our_bouncer_full_day_click
- our_bouncer_special_click
- our_bouncer_bottom_book_click

Tracking uses the existing session ID, TRZ tracking code,
source, UTM data, referrer, device, page, and test/admin data.

Tracking must never block booking navigation.


PROMOTIONAL OFFER:

Promotional offer is loaded from Supabase.

Offer visibility remains controlled by promotional_offers.

Current special logic remains intact.

No deposit is required for the current special.

Existing countdown remains intact.


PRESERVED:

Supabase promotional-offer logic

Rental pricing

What's Included

Size & Space

Dry Use Only

Safety information

Bottom CTA

Footer

Existing section comments/checkpoints


CHANGE CONTROL:

Do not change unrelated functionality.

Do not rewrite or remove existing project history/checkpoints.

Future updates should append/update this status rather than erase prior context.


NEXT:

1. Verify the current Our Bouncer page.

2. Build/test.

3. Confirm tracking events reach visitor_events.

4. Confirm no booking-flow regression.

5. Move to the next unfinished public page.



=========================================================
*/

export default function OurBouncer() {
  const [offer, setOffer] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const loadOffer = async () => {
      const { data, error } = await supabase
        .from('promotional_offers')
        .select('offer_active, offer_price, offer_hours, offer_ends_at')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error loading promotional offer:', error);
        return;
      }

      setOffer(data);
    };

    loadOffer();
  }, []);

  useEffect(() => {
    trackTrzEvent('our_bouncer_view');
  }, []);

  const offerIsLive =
    Boolean(offer?.offer_active) &&
    (!offer?.offer_ends_at ||
      new Date(offer.offer_ends_at).getTime() > Date.now());

  useEffect(() => {
    if (!offerIsLive || !offer?.offer_ends_at) {
      setTimeLeft(null);
      return;
    }

    const updateTimer = () => {
      const difference =
        new Date(offer.offer_ends_at).getTime() - Date.now();

      if (difference <= 0) {
        setTimeLeft(null);
        setOffer((current) =>
          current ? { ...current, offer_active: false } : current
        );
        return;
      }

      const totalSeconds = Math.floor(difference / 1000);

      const days = Math.floor(totalSeconds / 86400);
      const hours = Math.floor((totalSeconds % 86400) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
      });
    };

    updateTimer();

    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [offerIsLive, offer?.offer_ends_at]);

  const goToBooking = () => {
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

  const handleHeroBookingClick = () => {
    trackTrzEvent('our_bouncer_book_click');
    goToBooking();
  };

  const handle2HourClick = () => {
    trackTrzEvent('our_bouncer_2h_click');
    goToBooking();
  };

  const handle3HourClick = () => {
    trackTrzEvent('our_bouncer_3h_click');
    goToBooking();
  };

  const handleFullDayClick = () => {
    trackTrzEvent('our_bouncer_full_day_click');
    goToBooking();
  };

  const handleSpecialClick = () => {
    trackTrzEvent('our_bouncer_special_click');
    goToBooking();
  };

  const handleBottomBookingClick = () => {
    trackTrzEvent('our_bouncer_bottom_book_click');
    goToBooking();
  };

  const formatTime = (value) => String(value).padStart(2, '0');

  const styles = {
    page: {
      width: '100%',
      fontFamily:
        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      color: '#0f172a',
      background: '#ffffff',
      overflowX: 'hidden',
    },

    section: {
      padding: '34px 20px',
    },

    sectionInner: {
      maxWidth: '900px',
      margin: '0 auto',
    },

    /* =========================
       HERO
    ========================= */

    hero: {
      padding: '28px 20px 38px',
      background:
        'linear-gradient(180deg, #f8fcff 0%, #ffffff 100%)',
      borderBottom: '1px solid #e0f2fe',
    },

    heroInner: {
      maxWidth: '900px',
      margin: '0 auto',
    },

    heroLayout: {
      display: 'block',
    },

    heroCopy: {
      minWidth: 0,
    },

    eyebrow: {
      display: 'inline-block',
      marginBottom: '12px',
      padding: '6px 10px',
      borderRadius: '999px',
      background: '#e0f2fe',
      color: '#0369a1',
      fontSize: '12px',
      fontWeight: '900',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
    },

    heroTitle: {
      margin: 0,
      fontSize: 'clamp(34px, 6vw, 52px)',
      lineHeight: '1.02',
      fontWeight: '950',
      letterSpacing: '-0.045em',
      color: '#0f172a',
    },

    heroSubtitle: {
      maxWidth: '600px',
      margin: '16px 0 0',
      fontSize: '17px',
      lineHeight: '1.6',
      color: '#475569',
    },

    heroActionRow: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: '12px',
      marginTop: '22px',
    },

    primaryButton: {
      border: 'none',
      borderRadius: '12px',
      background: '#0284c7',
      color: '#ffffff',
      padding: '14px 20px',
      fontSize: '15px',
      fontWeight: '900',
      cursor: 'pointer',
      boxShadow: '0 6px 14px rgba(2, 132, 199, 0.22)',
    },

    heroSmallText: {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '700',
    },

    heroVisual: {
      position: 'relative',
      width: '100%',
      minHeight: '250px',
      marginTop: '22px',
      borderRadius: '24px',
      background:
        'linear-gradient(145deg, #e0f2fe 0%, #f0f9ff 55%, #ffffff 100%)',
      border: '1px solid #bae6fd',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '30px 24px',
      boxSizing: 'border-box',
      boxShadow: '0 12px 30px rgba(15, 23, 42, 0.08)',
    },

    heroVisualInner: {
      width: '100%',
      textAlign: 'center',
      color: '#0369a1',
    },

    heroVisualIcon: {
      fontSize: '54px',
      lineHeight: 1,
      marginBottom: '12px',
    },

    heroVisualTitle: {
      margin: 0,
      fontSize: '20px',
      fontWeight: '950',
      color: '#0f172a',
    },

    heroVisualText: {
      margin: '8px auto 0',
      maxWidth: '300px',
      fontSize: '13px',
      lineHeight: '1.5',
      color: '#64748b',
      fontWeight: '650',
    },

    balloonOne: {
      position: 'absolute',
      top: '18px',
      right: '28px',
      fontSize: '34px',
      transform: 'rotate(8deg)',
    },

    balloonTwo: {
      position: 'absolute',
      top: '68px',
      right: '7px',
      fontSize: '24px',
      transform: 'rotate(-12deg)',
    },

    balloonThree: {
      position: 'absolute',
      bottom: '20px',
      left: '18px',
      fontSize: '27px',
      transform: 'rotate(-8deg)',
    },

    /* =========================
       SECTION
    ========================= */

    sectionTitle: {
      margin: '0 0 8px',
      fontSize: '28px',
      lineHeight: '1.15',
      fontWeight: '950',
      letterSpacing: '-0.03em',
    },

    sectionIntro: {
      margin: '0 0 20px',
      color: '#64748b',
      fontSize: '15px',
      lineHeight: '1.55',
    },

    /* =========================
       INCLUDED
    ========================= */

    includedGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: '13px',
    },

    includedCard: {
      position: 'relative',
      border: '1px solid #e2e8f0',
      borderRadius: '17px',
      padding: '18px',
      background: '#ffffff',
      boxShadow: '0 3px 12px rgba(15, 23, 42, 0.04)',
      overflow: 'hidden',
    },

    includedIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '12px',
      background: '#eff6ff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '21px',
      marginBottom: '12px',
    },

    includedTitle: {
      margin: '0 0 5px',
      fontSize: '15px',
      fontWeight: '900',
      color: '#0f172a',
    },

    includedText: {
      margin: 0,
      fontSize: '13px',
      lineHeight: '1.45',
      color: '#64748b',
    },

    capacity: {
      marginTop: '14px',
      padding: '14px',
      borderRadius: '13px',
      background: '#eff6ff',
      color: '#1e3a8a',
      fontSize: '13px',
      fontWeight: '800',
      textAlign: 'center',
    },

    /* =========================
       SIZE
    ========================= */

    infoCard: {
      borderRadius: '18px',
      padding: '22px',
      background: '#f8fafc',
      border: '1px solid #e2e8f0',
    },

    sizeGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '10px',
    },

    sizeItem: {
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '14px',
      padding: '15px 10px',
      textAlign: 'center',
    },

    sizeValue: {
      display: 'block',
      fontSize: '21px',
      fontWeight: '950',
      color: '#0284c7',
    },

    sizeLabel: {
      display: 'block',
      marginTop: '4px',
      fontSize: '12px',
      fontWeight: '750',
      color: '#64748b',
    },

    warning: {
      marginTop: '17px',
      padding: '14px',
      borderRadius: '12px',
      background: '#fff7ed',
      border: '1px solid #fed7aa',
      color: '#9a3412',
      fontSize: '13px',
      lineHeight: '1.5',
      fontWeight: '700',
    },

    /* =========================
       DRY USE
    ========================= */

    dryCard: {
      marginTop: '2px',
      borderRadius: '20px',
      padding: '24px',
      background: '#0f172a',
      color: '#ffffff',
    },

    dryPill: {
      display: 'inline-block',
      padding: '6px 10px',
      borderRadius: '999px',
      background: '#0284c7',
      color: '#ffffff',
      fontSize: '11px',
      fontWeight: '950',
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
    },

    dryTitle: {
      margin: '13px 0 8px',
      fontSize: '22px',
      fontWeight: '950',
    },

    dryText: {
      margin: 0,
      color: '#cbd5e1',
      fontSize: '14px',
      lineHeight: '1.6',
    },

    safetyList: {
      margin: '18px 0 0',
      paddingLeft: '20px',
      color: '#cbd5e1',
      fontSize: '13px',
      lineHeight: '1.65',
    },

    /* =========================
       PRICING
    ========================= */

    pricingGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
      gap: '12px',
    },

    packageCard: {
      width: '100%',
      minWidth: 0,
      boxSizing: 'border-box',
      border: '1px solid #dbeafe',
      borderRadius: '17px',
      background: '#ffffff',
      padding: '19px 8px',
      textAlign: 'center',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.06)',
    },

    packageLabel: {
      display: 'block',
      fontSize: '13px',
      fontWeight: '850',
      color: '#64748b',
    },

    packagePrice: {
      display: 'block',
      marginTop: '7px',
      fontSize: 'clamp(20px, 6vw, 28px)',
      fontWeight: '950',
      color: '#0f172a',
      whiteSpace: 'nowrap',
      letterSpacing: '-0.03em',
    },

    packageAction: {
      display: 'block',
      marginTop: '8px',
      fontSize: '11px',
      fontWeight: '850',
      color: '#0284c7',
    },

    specialCard: {
      marginTop: '20px',
      borderRadius: '20px',
      border: '2px solid #7c3aed',
      background: '#ffffff',
      overflow: 'hidden',
      boxShadow: '0 8px 22px rgba(15, 23, 42, 0.10)',
    },

    specialTop: {
      padding: '18px 20px',
      background: '#f5f3ff',
      borderBottom: '1px solid #ddd6fe',
    },

    specialEyebrow: {
      display: 'inline-block',
      padding: '6px 10px',
      borderRadius: '999px',
      background: '#7c3aed',
      color: '#ffffff',
      fontSize: '11px',
      fontWeight: '950',
      textTransform: 'uppercase',
      letterSpacing: '0.04em',
    },

    specialTitle: {
      margin: '12px 0 0',
      fontSize: '23px',
      lineHeight: '1.2',
      fontWeight: '950',
      color: '#312e81',
    },

    specialBody: {
      padding: '20px',
    },

    specialPricingRow: {
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '10px',
    },

    oldPrice: {
      color: '#64748b',
      fontSize: '18px',
      fontWeight: '800',
      textDecoration: 'line-through',
    },

    arrow: {
      color: '#94a3b8',
      fontWeight: '900',
    },

    specialPrice: {
      color: '#7c3aed',
      fontSize: '32px',
      fontWeight: '950',
      letterSpacing: '-0.03em',
    },

    savings: {
      display: 'inline-block',
      marginTop: '9px',
      padding: '6px 9px',
      borderRadius: '8px',
      background: '#ede9fe',
      color: '#6d28d9',
      fontSize: '12px',
      fontWeight: '900',
    },

    specialNote: {
      margin: '12px 0 0',
      color: '#475569',
      fontSize: '13px',
      lineHeight: '1.5',
    },

    countdown: {
      marginTop: '18px',
      padding: '14px',
      borderRadius: '14px',
      background: '#312e81',
      color: '#ffffff',
      textAlign: 'center',
    },

    countdownLabel: {
      display: 'block',
      marginBottom: '7px',
      fontSize: '10px',
      fontWeight: '850',
      textTransform: 'uppercase',
      letterSpacing: '0.06em',
      color: '#c4b5fd',
    },

    countdownValue: {
      display: 'block',
      fontSize: '20px',
      fontWeight: '950',
      letterSpacing: '0.03em',
    },

    specialButton: {
      width: '100%',
      marginTop: '16px',
      border: 'none',
      borderRadius: '12px',
      padding: '14px 18px',
      background: '#7c3aed',
      color: '#ffffff',
      fontSize: '15px',
      fontWeight: '900',
      cursor: 'pointer',
    },

    specialHelper: {
      margin: '9px 0 0',
      textAlign: 'center',
      fontSize: '11px',
      color: '#64748b',
    },

    /* =========================
       BOTTOM CTA / FOOTER
    ========================= */

    bottomCta: {
      marginTop: '10px',
      borderRadius: '20px',
      padding: '28px 20px',
      background: '#0284c7',
      color: '#ffffff',
      textAlign: 'center',
    },

    bottomCtaTitle: {
      margin: 0,
      fontSize: 'clamp(20px, 6vw, 28px)',
      whiteSpace: 'nowrap',
      letterSpacing: '-0.03em',
      fontWeight: '950',
    },

    bottomCtaText: {
      margin: '8px auto 0',
      maxWidth: '500px',
      color: '#e0f2fe',
      fontSize: '14px',
      lineHeight: '1.5',
    },

    bottomButton: {
      marginTop: '17px',
      border: 'none',
      borderRadius: '12px',
      padding: '14px 20px',
      background: '#ffffff',
      color: '#0369a1',
      fontSize: '15px',
      fontWeight: '900',
      cursor: 'pointer',
    },

    footer: {
      padding: '26px 20px 34px',
      textAlign: 'center',
      background: '#ffffff',
      color: '#64748b',
      fontSize: '12px',
      lineHeight: '1.5',
    },

    footerName: {
      display: 'block',
      color: '#0f172a',
      fontWeight: '900',
      fontSize: '14px',
      marginBottom: '4px',
    },
  };

  return (
    <div style={styles.page}>

      {/* =========================
          HERO
      ========================= */}

      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroLayout}>

            <div style={styles.heroCopy}>

              <div style={styles.eyebrow}>
                Our Bouncer
              </div>

              <h1 style={styles.heroTitle}>
                Spider-Man Combo Bouncer
              </h1>

              <p style={styles.heroSubtitle}>
                Bounce, make a short climb to the slide, and keep the kids
                moving with one complete party setup.
              </p>

              <div style={styles.heroActionRow}>
                <button
                  type="button"
                  onClick={handleHeroBookingClick}
                  style={styles.primaryButton}
                >
                  Check Availability
                </button>

                <span style={styles.heroSmallText}>
                  Chaguanas-based • Dry use only
                </span>
              </div>

              {/* UNIFIED BOUNCER / PHOTO PLACEHOLDER */}

              <div style={styles.heroVisual}>

                <span style={styles.balloonOne}>
                  🎈
                </span>

                <span style={styles.balloonTwo}>
                  🎈
                </span>

                <span style={styles.balloonThree}>
                  🎈
                </span>

                <div style={styles.heroVisualInner}>

                  <div style={styles.heroVisualIcon}>
                    🕷️
                  </div>

                  <h2 style={styles.heroVisualTitle}>
                    Spider-Man Combo Bouncer
                  </h2>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      margin: '18px auto 14px',
                      maxWidth: '620px',
                      flexWrap: 'wrap',
                    }}
                  >

                    <span
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1px solid #bae6fd',
                        fontSize: '12px',
                        fontWeight: '900',
                        color: '#0369a1',
                      }}
                    >
                      🏰 Bounce
                    </span>

                    <span
                      style={{
                        color: '#7dd3fc',
                        fontWeight: '950',
                        fontSize: '18px',
                      }}
                    >
                      →
                    </span>

                    <span
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1px solid #bae6fd',
                        fontSize: '12px',
                        fontWeight: '900',
                        color: '#0369a1',
                      }}
                    >
                      🧗 Climb
                    </span>

                    <span
                      style={{
                        color: '#7dd3fc',
                        fontWeight: '950',
                        fontSize: '18px',
                      }}
                    >
                      →
                    </span>

                    <span
                      style={{
                        padding: '10px 14px',
                        borderRadius: '12px',
                        background: '#ffffff',
                        border: '1px solid #bae6fd',
                        fontSize: '12px',
                        fontWeight: '900',
                        color: '#0369a1',
                      }}
                    >
                      🛝 Slide
                    </span>

                  </div>

                  <p style={styles.heroVisualText}>
                    Photos and video coming soon.
                  </p>

                </div>

              </div>

            </div>

          </div>
        </div>
      </section>

      {/* =========================
          WHAT'S INCLUDED
      ========================= */}

      <section style={styles.section}>
        <div style={styles.sectionInner}>

          <h2 style={styles.sectionTitle}>
            What's Included
          </h2>

          <p style={styles.sectionIntro}>
            One complete Spider-Man combo setup for your event.
          </p>

          <div style={styles.includedGrid}>

            <div style={styles.includedCard}>
              <div style={styles.includedIcon}>
                🏰
              </div>

              <h3 style={styles.includedTitle}>
                Bounce Area
              </h3>

              <p style={styles.includedText}>
                A dedicated jumping area for active play.
              </p>
            </div>

            <div style={styles.includedCard}>
              <div style={styles.includedIcon}>
                🧗
              </div>

              <h3 style={styles.includedTitle}>
                Short Climb
              </h3>

              <p style={styles.includedText}>
                Climb from the bounce area toward the slide.
              </p>
            </div>

            <div style={styles.includedCard}>
              <div style={styles.includedIcon}>
                🛝
              </div>

              <h3 style={styles.includedTitle}>
                Dry Slide
              </h3>

              <p style={styles.includedText}>
                Finish the climb with the attached dry slide.
              </p>
            </div>

            <div style={styles.includedCard}>
              <div style={styles.includedIcon}>
                🔧
              </div>

              <h3 style={styles.includedTitle}>
                Setup & Breakdown
              </h3>

              <p style={styles.includedText}>
                We handle the setup and breakdown of the bouncer.
              </p>
            </div>

          </div>

          <div style={styles.capacity}>
            Maximum recommended capacity: up to 8 children at a time.
          </div>

        </div>
      </section>

      {/* =========================
          SIZE & SPACE
      ========================= */}

      <section style={styles.section}>
        <div style={styles.sectionInner}>

          <h2 style={styles.sectionTitle}>
            Size & Space
          </h2>

          <p style={styles.sectionIntro}>
            Make sure you have enough clear space before booking.
          </p>

          <div style={styles.infoCard}>

            <div style={styles.sizeGrid}>

              <div style={styles.sizeItem}>
                <span style={styles.sizeValue}>
                  26 ft
                </span>

                <span style={styles.sizeLabel}>
                  Long
                </span>
              </div>

              <div style={styles.sizeItem}>
                <span style={styles.sizeValue}>
                  13 ft
                </span>

                <span style={styles.sizeLabel}>
                  Wide
                </span>
              </div>

              <div style={styles.sizeItem}>
                <span style={styles.sizeValue}>
                  13 ft
                </span>

                <span style={styles.sizeLabel}>
                  High
                </span>
              </div>

            </div>

            <div style={styles.warning}>
              Allow additional clear space around the bouncer for safe
              setup, access, and operation. Keep the setup area clear of
              overhead and surrounding obstacles.
            </div>

          </div>

        </div>
      </section>

      {/* =========================
          DRY USE ONLY
      ========================= */}

      <section style={styles.section}>
        <div style={styles.sectionInner}>

          <div style={styles.dryCard}>

            <span style={styles.dryPill}>
              Dry Use Only
            </span>

            <h2 style={styles.dryTitle}>
              This bouncer is currently available for dry use only.
            </h2>

            <p style={styles.dryText}>
              This Spider-Man Combo Bouncer is currently available for dry
              use only. It is not advertised or rented as a water slide.
            </p>

            <ul style={styles.safetyList}>
              <li>Adult supervision is required.</li>
              <li>Follow the recommended capacity.</li>
              <li>Remove shoes and unsafe items before entering.</li>
              <li>Keep food, drinks, and sharp objects off the bouncer.</li>
            </ul>

          </div>

        </div>
      </section>

      {/* =========================
          RENTAL PRICING
      ========================= */}

      <section style={styles.section}>
        <div style={styles.sectionInner}>

          <h2 style={styles.sectionTitle}>
            Rental Pricing
          </h2>

          <p style={styles.sectionIntro}>
            Choose the rental time that fits your event.
          </p>

          <div style={styles.pricingGrid}>

            <button
              type="button"
              onClick={handle2HourClick}
              style={styles.packageCard}
            >
              <span style={styles.packageLabel}>
                2 Hours
              </span>

              <span style={styles.packagePrice}>
                TT$650
              </span>

              <span style={styles.packageAction}>
                Choose this →
              </span>
            </button>

            <button
              type="button"
              onClick={handle3HourClick}
              style={styles.packageCard}
            >
              <span style={styles.packageLabel}>
                3 Hours
              </span>

              <span style={styles.packagePrice}>
                TT$900
              </span>

              <span style={styles.packageAction}>
                Choose this →
              </span>
            </button>

            <button
              type="button"
              onClick={handleFullDayClick}
              style={styles.packageCard}
            >
              <span style={styles.packageLabel}>
                Full Day
              </span>

              <span style={styles.packagePrice}>
                TT$1,800
              </span>

              <span style={styles.packageAction}>
                Choose this →
              </span>
            </button>

          </div>

          {/* CURRENT SPECIAL */}

          {offerIsLive && (
            <div style={styles.specialCard}>

              <div style={styles.specialTop}>

                <span style={styles.specialEyebrow}>
                  Limited-Time Offer
                </span>

                <h3 style={styles.specialTitle}>
                  {offer.offer_hours}-Hour Special
                </h3>

              </div>

              <div style={styles.specialBody}>

                <div style={styles.specialPricingRow}>

                  <span style={styles.oldPrice}>
                    TT$975
                  </span>

                  <span style={styles.arrow}>
                    →
                  </span>

                  <span style={styles.specialPrice}>
                    TT${offer.offer_price}
                  </span>

                </div>

                {offer.offer_hours === 3 &&
                  Number(offer.offer_price) === 600 && (
                    <div style={styles.savings}>
                      SAVE TT$375
                    </div>
                  )}

                <p style={styles.specialNote}>
                  Get the special rental price with{' '}
                  <strong>no deposit required</strong>.
                  Payment is due on delivery.
                </p>

                {timeLeft && (
                  <div style={styles.countdown}>

                    <span style={styles.countdownLabel}>
                      Offer ends in
                    </span>

                    <span style={styles.countdownValue}>

                      {timeLeft.days > 0 &&
                        `${timeLeft.days}d `}

                      {formatTime(timeLeft.hours)}:
                      {formatTime(timeLeft.minutes)}:
                      {formatTime(timeLeft.seconds)}

                    </span>

                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSpecialClick}
                  style={styles.specialButton}
                >
                  Get the {offer.offer_hours}-Hour Special
                </button>

                <p style={styles.specialHelper}>
                  Check availability and book your date.
                </p>

              </div>

            </div>
          )}

        </div>
      </section>

      {/* =========================
          BOTTOM CTA
      ========================= */}

      <section
        style={{
          ...styles.section,
          paddingTop: '8px',
        }}
      >
        <div style={styles.sectionInner}>

          <div style={styles.bottomCta}>

            <h2 style={styles.bottomCtaTitle}>
              Ready to book your day?
            </h2>

            <p style={styles.bottomCtaText}>
              Check availability and choose the rental package that works
              for your event.
            </p>

            <button
              type="button"
              onClick={handleBottomBookingClick}
              style={styles.bottomButton}
            >
              Check Availability & Book
            </button>

          </div>

        </div>
      </section>

      {/* =========================
          FOOTER
      ========================= */}

      <footer style={styles.footer}>

        <span style={styles.footerName}>
          The Rental Zone
        </span>

        Chaguanas-based bouncer rentals for parties and events.

      </footer>

    </div>
  );
}
