import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import {
  trackTrzEvent,
  shouldFireSessionStarted,
  createPageTimer
} from '../utils/trzTracker';

/*
 * ============================================================
 * TRZ IMPLEMENTATION CHECKPOINT — PROMOTIONAL OFFERS
 * ============================================================
 *
 * Completed:
 * - Added Supabase promotional_offers admin controls.
 * - Added configurable promotional price, hours, duration,
 *   and visitor countdown settings.
 * - Fixed admin ON/OFF state confusion.
 * - Database state is the source of truth for activation.
 * - Turning the offer ON creates a fresh offer expiry.
 * - Turning the offer OFF restores normal pricing.
 * - LandingPage connects to promotional_offers.
 * - Reads the currently active, non-expired promotion.
 * - Calculates regular value dynamically.
 * - Calculates exact customer savings dynamically.
 * - Displays promotional price, hours, regular value,
 *   and savings on the public page.
 * - Displays actual offer expiry countdown.
 * - Promotional popup opens immediately while a promotion
 *   is active.
 * - Normal welcome popup is temporarily disabled while
 *   a promotion is active.
 * - Normal welcome popup returns when no promotion is active.
 * - Promotional popup uses admin-controlled visitor countdown.
 * - Sends promotional intent into the existing booking route.
 * - Displays promotional offer in pricing modal.
 * - Tracks promotional offer visibility and interactions.
 * - Automatically falls back to normal TT$650 / 2-hour pricing
 *   when promotion is OFF or expired.
 * - Preserves existing booking route, analytics,
 *   gallery, FAQ, WhatsApp links, and existing UI structure.
 * - Removed old browser "New Unique Visitor!" notification.
 *
 * PAYMENT:
 * - No deposit required.
 * - Payment is due on delivery.
 *
 * POPUP BEHAVIOR:
 * - PROMO ACTIVE:
 *   Promotional popup opens immediately.
 *   Initial intent popup is suppressed.
 *
 * - PROMO INACTIVE:
 *   Existing "What would you like to find out?"
 *   popup works normally.
 *
 * CURRENT STATUS:
 * - Admin promotion control: COMPLETE
 * - LandingPage promotion display: COMPLETE
 * - Immediate promotional popup: COMPLETE
 * - Normal popup suppression during promotion: COMPLETE
 * - BookingForm promotion integration: COMPLETE
 * - Promotional booking database tagging: COMPLETE
 * - Payment on delivery: COMPLETE
 *
 * NEXT:
 * - Full end-to-end ON → public offer → booking → admin test.
 * ============================================================
 */

export default function LandingPage() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showSpaceModal, setShowSpaceModal] = useState(false);

  // Promotional offer state
  const [promotionalOffer, setPromotionalOffer] = useState(null);
  const [promoLoading, setPromoLoading] = useState(true);
  const [promoExpirySeconds, setPromoExpirySeconds] = useState(null);

  // Promotional popup state
  const [showPromotionalPopup, setShowPromotionalPopup] = useState(false);
  const [promoPopupSecondsLeft, setPromoPopupSecondsLeft] = useState(null);

  const pageExitSent = useRef(false);

  // Helper function for detailed visitor tracking.
  // Tracking is intentionally fire-and-forget so it never blocks UI/navigation.
  const trackButtonClick = (eventName, additionalData = {}) => {
    trackTrzEvent(eventName, additionalData);
  };

  /*
   * Check whether the promotion returned from Supabase
   * is currently valid for public display.
   */
  const isPromotionActive = (offer) => {
    if (!offer?.offer_active) {
      return false;
    }

    if (!offer.offer_ends_at) {
      return true;
    }

    const expiryTime = new Date(
      offer.offer_ends_at
    ).getTime();

    if (!Number.isFinite(expiryTime)) {
      return false;
    }

    return expiryTime > Date.now();
  };

  const promoIsActive =
    isPromotionActive(promotionalOffer);

  const normalPrice = 650;
  const normalHours = 2;
  const normalHourlyRate =
    normalPrice / normalHours;

  const publicPrice = promoIsActive
    ? Number(
        promotionalOffer.offer_price ??
          normalPrice
      )
    : normalPrice;

  const publicHours = promoIsActive
    ? Number(
        promotionalOffer.offer_hours ??
          normalHours
      )
    : normalHours;

  /*
   * Calculate what the promotional hours would normally cost
   * using the standard 2-hour TT$650 rate.
   *
   * Example:
   * TT$650 / 2 = TT$325 per hour
   * TT$325 x 4 hours = TT$1,300 regular value
   */
  const promotionalRegularValue =
    promoIsActive
      ? normalHourlyRate * publicHours
      : normalPrice;

  const promotionalSavings =
    promoIsActive
      ? Math.max(
          0,
          promotionalRegularValue -
            publicPrice
        )
      : 0;

  const formatMoney = (amount) => {
    const numericAmount = Number(amount);

    if (!Number.isFinite(numericAmount)) {
      return '0';
    }

    return Number.isInteger(numericAmount)
      ? numericAmount.toString()
      : numericAmount.toFixed(2);
  };

  const formatCountdown = (totalSeconds) => {
    if (
      !Number.isFinite(totalSeconds) ||
      totalSeconds < 0
    ) {
      return '00:00:00';
    }

    const hours = Math.floor(
      totalSeconds / 3600
    );

    const minutes = Math.floor(
      (totalSeconds % 3600) / 60
    );

    const seconds =
      totalSeconds % 60;

    return [
      String(hours).padStart(2, '0'),
      String(minutes).padStart(2, '0'),
      String(seconds).padStart(2, '0')
    ].join(':');
  };

  /*
   * Load the promotional offer from Supabase.
   *
   * This is intentionally separate from the existing visitor
   * tracking so a promotion failure can never block the page.
   */
  useEffect(() => {
    let mounted = true;

    const fetchPromotionalOffer =
      async () => {
        try {
          const { data, error } =
            await supabase
              .from('promotional_offers')
              .select('*')
              .order('id', {
                ascending: true
              })
              .limit(1)
              .maybeSingle();

          if (error) {
            console.error(
              'Promotional offer loading error:',
              error
            );

            if (mounted) {
              setPromotionalOffer(
                null
              );
            }

            return;
          }

          if (mounted) {
            setPromotionalOffer(
              data || null
            );
          }
        } catch (err) {
          console.error(
            'Unexpected promotional offer error:',
            err
          );

          if (mounted) {
            setPromotionalOffer(
              null
            );
          }
        } finally {
          if (mounted) {
            setPromoLoading(false);
          }
        }
      };

    fetchPromotionalOffer();

    return () => {
      mounted = false;
    };
  }, []);

  /*
   * ============================================================
   * POPUP CONTROL
   * ============================================================
   *
   * This replaces the old desktop exit-intent/mobile-delay
   * promotional popup behavior.
   *
   * PROMO ACTIVE:
   * - Suppress the normal welcome popup.
   * - Open the promotional popup immediately.
   *
   * PROMO INACTIVE:
   * - Show the normal welcome popup once per session.
   *
   * Waiting for promoLoading to finish is important.
   * It prevents the normal popup from appearing for a moment
   * before Supabase tells us that a promotion is active.
   */
  useEffect(() => {
    if (promoLoading) {
      return;
    }

    /*
     * PROMOTION ACTIVE
     *
     * Temporarily replace the normal welcome popup
     * with the promotional popup.
     */
    if (promoIsActive) {
      setShowBookingPopup(false);

      const promoPopupSeen =
        sessionStorage.getItem(
          'trz_promotional_popup_seen'
        );

      if (!promoPopupSeen) {
        sessionStorage.setItem(
          'trz_promotional_popup_seen',
          'true'
        );

        setShowPromotionalPopup(
          true
        );

        trackTrzEvent(
          'promotional_popup_opened',
          {
            trigger:
              'promo_immediate',
            offer_price:
              publicPrice,
            offer_hours:
              publicHours,
            regular_value:
              promotionalRegularValue,
            savings:
              promotionalSavings
          }
        );
      }

      return;
    }

    /*
     * NO ACTIVE PROMOTION
     *
     * Restore the existing welcome popup behavior.
     */
    const hasSeenPopup =
      sessionStorage.getItem(
        'seen_booking_popup'
      );

    if (!hasSeenPopup) {
      setShowBookingPopup(true);

      sessionStorage.setItem(
        'seen_booking_popup',
        'true'
      );

      trackTrzEvent(
        'popup_opened',
        {
          popup_type:
            'initial_intent'
        }
      );
    }
  }, [
    promoLoading,
    promoIsActive,
    publicPrice,
    publicHours,
    promotionalRegularValue,
    promotionalSavings
  ]);

  /*
   * Maintain the actual promotion expiry countdown.
   *
   * This is NOT the visitor popup countdown.
   * The offer expiry is controlled by offer_ends_at.
   */
  useEffect(() => {
    if (
      !promoIsActive ||
      !promotionalOffer?.offer_ends_at
    ) {
      setPromoExpirySeconds(null);
      return;
    }

    const updateExpiryCountdown =
      () => {
        const expiryTime =
          new Date(
            promotionalOffer.offer_ends_at
          ).getTime();

        if (!Number.isFinite(expiryTime)) {
          setPromoExpirySeconds(
            null
          );
          return;
        }

        const remainingMilliseconds =
          expiryTime - Date.now();

        const remainingSeconds =
          Math.max(
            0,
            Math.ceil(
              remainingMilliseconds /
                1000
            )
          );

        setPromoExpirySeconds(
          remainingSeconds
        );

        if (remainingSeconds <= 0) {
          setPromotionalOffer(
            null
          );

          setShowPromotionalPopup(
            false
          );

          trackTrzEvent(
            'promotional_offer_expired',
            {
              offer_price:
                publicPrice,
              offer_hours:
                publicHours
            }
          );
        }
      };

    updateExpiryCountdown();

    const interval = setInterval(
      updateExpiryCountdown,
      1000
    );

    return () =>
      clearInterval(interval);
  }, [
    promoIsActive,
    promotionalOffer?.offer_ends_at
  ]);

  /*
   * Track that a visitor was shown an active promotion.
   * This fires once per browser session so repeated renders
   * do not inflate the metric.
   */
  useEffect(() => {
    if (
      promoLoading ||
      !promoIsActive
    ) {
      return;
    }

    const promoViewedKey =
      'trz_promotional_offer_viewed';

    if (
      sessionStorage.getItem(
        promoViewedKey
      )
    ) {
      return;
    }

    sessionStorage.setItem(
      promoViewedKey,
      'true'
    );

    trackTrzEvent(
      'promotional_offer_viewed',
      {
        offer_price:
          publicPrice,
        offer_hours:
          publicHours,
        regular_value:
          promotionalRegularValue,
        savings:
          promotionalSavings,
        offer_ends_at:
          promotionalOffer?.offer_ends_at ||
          null
      }
    );
  }, [
    promoLoading,
    promoIsActive,
    publicPrice,
    publicHours,
    promotionalRegularValue,
    promotionalSavings,
    promotionalOffer?.offer_ends_at
  ]);

  /*
   * Visitor countdown inside the promotional popup.
   *
   * This countdown is intentionally separate from the
   * actual promotional offer expiry.
   */
  useEffect(() => {
    if (
      !showPromotionalPopup ||
      !promoIsActive
    ) {
      return;
    }

    const configuredSeconds =
      Number(
        promotionalOffer?.countdown_seconds ??
          10
      );

    const startingSeconds =
      Number.isFinite(
        configuredSeconds
      ) &&
      configuredSeconds > 0
        ? Math.floor(
            configuredSeconds
          )
        : 10;

    setPromoPopupSecondsLeft(
      startingSeconds
    );

    const interval = setInterval(
      () => {
        setPromoPopupSecondsLeft(
          (previous) => {
            if (
              previous === null ||
              previous <= 1
            ) {
              clearInterval(
                interval
              );

              setShowPromotionalPopup(
                false
              );

              trackTrzEvent(
                'promotional_popup_expired',
                {
                  offer_price:
                    publicPrice,
                  offer_hours:
                    publicHours
                }
              );

              return 0;
            }

            return previous - 1;
          }
        );
      },
      1000
    );

    return () => {
      clearInterval(interval);
    };
  }, [
    showPromotionalPopup,
    promoIsActive,
    promotionalOffer?.countdown_seconds,
    publicPrice,
    publicHours
  ]);

  // Visitor Tracking Hook with Unique Page Visit Control
  useEffect(() => {
    let pageTimer = null;
    let pageExitHandler = null;

    const logVisitor = async () => {
      try {
        if (
          localStorage.getItem(
            'ignore_visits'
          ) === 'true'
        ) {
          return;
        }

        const {
          data: { session }
        } =
          await supabase.auth.getSession();

        if (session) {
          return;
        }

        const pageVisitLogged =
          sessionStorage.getItem(
            'page_visit_logged'
          );

        if (!pageVisitLogged) {
          const params =
            new URLSearchParams(
              window.location.search
            );

          const utmSource =
            params.get(
              'utm_source'
            ) ||
            params.get(
              'traffic_source'
            ) ||
            'direct';

          const utmCampaign =
            params.get(
              'utm_campaign'
            ) || 'none';

          const isMobile =
            /iPhone|iPad|iPod|Android/i.test(
              navigator.userAgent
            );

          const deviceType =
            isMobile
              ? 'Mobile'
              : 'Desktop';

          const isTest =
            params.get('test') ===
              'true' ||
            window.location.hostname ===
              'localhost';

          await supabase
            .from('page_visits')
            .insert([
              {
                traffic_source:
                  utmSource.toLowerCase(),
                utm_campaign:
                  utmCampaign,
                device_type:
                  deviceType,
                is_test:
                  isTest,
                landing_page:
                  window.location
                    .pathname
              }
            ]);

          sessionStorage.setItem(
            'page_visit_logged',
            'true'
          );

          /*
           * Browser notification intentionally removed.
           *
           * Visitor tracking still happens through Supabase
           * and the existing TRZ analytics system.
           */
        }
      } catch (err) {
        console.error(
          'Visitor tracking error:',
          err
        );
      }
    };

    logVisitor();

    if (
      shouldFireSessionStarted()
    ) {
      trackTrzEvent(
        'session_started'
      );
    }

    const viewedLandingLogged =
      sessionStorage.getItem(
        'trz_viewed_landing_page'
      );

    if (!viewedLandingLogged) {
      sessionStorage.setItem(
        'trz_viewed_landing_page',
        'true'
      );

      trackTrzEvent(
        'viewed_landing_page'
      );
    }

    pageTimer =
      createPageTimer();

    pageExitHandler = () => {
      if (pageExitSent.current) {
        return;
      }

      pageExitSent.current = true;

      trackTrzEvent(
        'page_exit',
        {
          page_duration_seconds:
            pageTimer.getSeconds()
        }
      );
    };

    window.addEventListener(
      'pagehide',
      pageExitHandler
    );

    return () => {
      if (pageExitHandler) {
        window.removeEventListener(
          'pagehide',
          pageExitHandler
        );
      }

      if (pageTimer) {
        pageTimer.cleanup();
      }
    };
  }, []);

  const handleIntentSelect = (
    intentKey,
    targetDestination
  ) => {
    setShowBookingPopup(false);

    const intentEvents = {
      availability:
        'clicked_check_availability',
      prices:
        'clicked_view_price',
      space:
        'clicked_view_size'
    };

    const eventName =
      intentEvents[intentKey];

    if (eventName) {
      trackButtonClick(
        eventName,
        {
          popup_type:
            'initial_intent'
        }
      );
    }

    if (
      intentKey === 'prices'
    ) {
      setShowSpaceModal(false);
      setShowPriceModal(true);
    } else if (
      intentKey === 'space'
    ) {
      setShowPriceModal(false);
      setShowSpaceModal(true);
    } else if (
      targetDestination
    ) {
      if (
        targetDestination.startsWith(
          '/#'
        )
      ) {
        window.location.hash =
          targetDestination.replace(
            '/#',
            '#'
          );
      } else if (
        targetDestination.startsWith(
          '/'
        )
      ) {
        window.location.href =
          targetDestination;
      } else {
        const el =
          document.querySelector(
            targetDestination
          );

        if (el) {
          el.scrollIntoView({
            behavior:
              'smooth'
          });
        } else {
          window.location.hash =
            targetDestination;
        }
      }
    }
  };

  const handlePromotionalBookClick =
    () => {
      if (!promoIsActive) {
        return;
      }

      /*
       * Tell BookingForm that the visitor came
       * through the promotional offer.
       *
       * BookingForm will still re-check Supabase
       * before accepting promotional pricing.
       */
      sessionStorage.setItem(
        'trz_promo_intent',
        'true'
      );

      trackButtonClick(
        'clicked_promotional_offer',
        {
          offer_price:
            publicPrice,
          offer_hours:
            publicHours,
          regular_value:
            promotionalRegularValue,
          savings:
            promotionalSavings,
          offer_ends_at:
            promotionalOffer?.offer_ends_at ||
            null
        }
      );
    };

  const closePromotionalPopup =
    (reason = 'closed') => {
      setShowPromotionalPopup(
        false
      );

      trackTrzEvent(
        'promotional_popup_closed',
        {
          reason,
          offer_price:
            publicPrice,
          offer_hours:
            publicHours
        }
      );
    };

  const galleryImages = [
    '/image 1.png',
    '/image 2.png',
    '/image 3.jpg',
    '/1000151156.jpg',
    '/1000151155.jpg',
    '/1000151154.jpg',
    '/1000151153.jpg',
    '/1000151152.jpg',
    '/1000151151.jpg',
    '/1000151150.jpg'
  ];

  const featuredImage =
    '/featured image.jpg';

  const faqs = [
    {
      q: "What are the space and clearance requirements?",
      a: "The Spider-Man unit measures 26ft long x 13ft wide x 13ft high. You need a flat, clean surface (grass or smooth pavement) with clear overhead space free of low tree branches or wires."
    },
    {
      q: "What do I need to provide on setup day?",
      a: "A standard household electrical outlet within 100 feet of the setup area to power the blower continuously. If power isn't close to the yard, a reliable generator is required."
    },
    {
      q: "How does payment work?",
      a: "No deposit is required. Your booking request is submitted for confirmation, and payment is due on delivery."
    },
    {
      q: "What is your weather and cancellation policy?",
      a: "Safety comes first. If severe weather (heavy tropical downpours or high wind warnings) makes setup unsafe, we will work with you to reschedule your booking for the next available date."
    }
  ];

  return (
    <div
      style={{
        width: '100%',
        padding: '16px 0',
        fontFamily:
          'system-ui, sans-serif',
        color: '#0f172a',
        boxSizing: 'border-box',
        maxWidth: '800px',
        margin: '0 auto'
      }}
    >
      <div
        style={{
          padding: '0 16px'
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            textAlign: 'center',
            padding:
              '12px 10px 32px 10px'
          }}
        >
          <span
            style={{
              background: '#e0f2fe',
              color: '#0369a1',
              padding: '5px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: 'bold',
              textTransform:
                'uppercase',
              letterSpacing:
                '0.5px'
            }}
          >
            Premier Party Rentals in Trinidad
          </span>

          <h1
            style={{
              fontSize: '28px',
              fontWeight: '800',
              marginTop: '14px',
              marginBottom: '12px',
              color: '#0f172a',
              lineHeight: '1.25'
            }}
          >
            Bring The Ultimate Fun
            <br />
            To Your Next Event!
          </h1>

          <p
            style={{
              color: '#475569',
              fontSize: '14px',
              maxWidth: '100%',
              margin:
                '0 auto 20px auto',
              lineHeight: '1.5',
              padding: '0 10px'
            }}
          >
            Safe, clean, high-energy
            bouncy castles delivered
            straight to your yard.
            Secure your date with
            zero upfront risk.
          </p>

          {/* ACTIVE PROMOTION HERO NOTICE */}
          {promoIsActive && (
            <div
              style={{
                background:
                  '#fff7ed',
                border:
                  '1px solid #fdba74',
                borderRadius: '14px',
                padding:
                  '16px',
                margin:
                  '0 auto 18px auto',
                maxWidth:
                  '380px',
                boxShadow:
                  '0 4px 10px rgba(234, 88, 12, 0.08)'
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  color: '#c2410c',
                  textTransform:
                    'uppercase',
                  letterSpacing:
                    '0.5px',
                  marginBottom:
                    '5px'
                }}
              >
                🔥 Limited-Time Offer
              </div>

              <div
                style={{
                  fontSize: '24px',
                  fontWeight: '900',
                  color: '#9a3412',
                  lineHeight: '1.1'
                }}
              >
                {publicHours} Hours
                {' — '}
                TT$
                {formatMoney(
                  publicPrice
                )}
              </div>

              <div
                style={{
                  marginTop: '8px',
                  fontSize: '13px',
                  color: '#7c2d12'
                }}
              >
                Regular value:{' '}
                <strong>
                  TT$
                  {formatMoney(
                    promotionalRegularValue
                  )}
                </strong>
              </div>

              <div
                style={{
                  marginTop: '3px',
                  fontSize: '16px',
                  fontWeight: '900',
                  color: '#c2410c'
                }}
              >
                YOU SAVE TT$
                {formatMoney(
                  promotionalSavings
                )}
              </div>

              {promoExpirySeconds !==
                null && (
                <div
                  style={{
                    marginTop:
                      '10px',
                    padding:
                      '7px 10px',
                    background:
                      '#ffedd5',
                    borderRadius:
                      '8px',
                    color:
                      '#9a3412',
                    fontSize:
                      '12px',
                    fontWeight:
                      '800'
                  }}
                >
                  ⏳ Offer ends in{' '}
                  {formatCountdown(
                    promoExpirySeconds
                  )}
                </div>
              )}

              <div
                style={{
                  marginTop:
                    '5px',
                  fontSize:
                    '11px',
                  color:
                    '#7c2d12'
                }}
              >
                No deposit required.
                Pay on delivery.
              </div>
            </div>
          )}

          <a
            href="/#booking"
            onClick={() => {
              trackButtonClick(
                'clicked_book_now'
              );

              if (promoIsActive) {
                handlePromotionalBookClick();
              }
            }}
            style={{
              display: 'block',
              width: '100%',
              maxWidth: '320px',
              margin: '0 auto',
              background:
                '#2563eb',
              color: 'white',
              fontWeight: 'bold',
              padding: '14px 0',
              borderRadius: '12px',
              border: 'none',
              textDecoration:
                'none',
              boxShadow:
                '0 4px 12px rgba(37, 99, 235, 0.3)',
              fontSize: '15px',
              textAlign:
                'center',
              cursor: 'pointer'
            }}
          >
            {promoIsActive
              ? '🔥 Claim Offer & Check Availability'
              : 'Check Availability & Book'}
          </a>
        </div>

        {/* Featured Inventory Card */}
        <div
          id="pricing"
          style={{
            background: 'white',
            borderRadius: '16px',
            border:
              '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow:
              '0 4px 12px rgba(0, 0, 0, 0.05)',
            marginBottom: '30px'
          }}
        >
          <div
            style={{
              height: '240px',
              background:
                '#1e293b',
              display: 'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              position:
                'relative',
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                position:
                  'absolute',
                top: '12px',
                left: '12px',
                zIndex: '10'
              }}
            >
              <span
                style={{
                  background:
                    '#2563eb',
                  color: 'white',
                  fontSize: '11px',
                  padding:
                    '5px 10px',
                  borderRadius:
                    '6px',
                  fontWeight:
                    'bold'
                }}
              >
                Featured Inventory
              </span>
            </div>

            {promoIsActive && (
              <div
                style={{
                  position:
                    'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: '10'
                }}
              >
                <span
                  style={{
                    background:
                      '#ea580c',
                    color: 'white',
                    fontSize: '11px',
                    padding:
                      '6px 10px',
                    borderRadius:
                      '6px',
                    fontWeight:
                      '800',
                    boxShadow:
                      '0 3px 8px rgba(0,0,0,0.25)'
                  }}
                >
                  🔥 PROMO
                </span>
              </div>
            )}

            <img
              src={featuredImage}
              alt="Spider-Man Bouncy Castle"
              style={{
                width: '100%',
                height: '100%',
                objectFit:
                  'cover',
                cursor:
                  'pointer'
              }}
              onClick={() => {
                trackButtonClick(
                  'click_featured_image_zoom'
                );

                setSelectedImage(
                  featuredImage
                );
              }}
              title="Click to zoom image"
            />
          </div>

          <div
            style={{
              padding: '20px'
            }}
          >
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#0f172a',
                margin:
                  '0 0 6px 0'
              }}
            >
              🕷️ Spider-Man Bouncy Castle
            </h3>

            <p
              style={{
                color: '#64748b',
                fontSize: '13px',
                margin:
                  '0 0 16px 0',
                lineHeight: '1.4'
              }}
            >
              Combination + Slide •
              26x13x13ft • Up to 8
              Kids. High-durability
              vinyl, fully cleaned and
              sanitized before every
              setup.
            </p>

            {/* PROMOTIONAL PRICE DISPLAY */}
            {promoIsActive ? (
              <div
                style={{
                  background:
                    '#fff7ed',
                  border:
                    '1px solid #fed7aa',
                  borderRadius:
                    '12px',
                  padding:
                    '14px',
                  marginBottom:
                    '14px'
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    color: '#c2410c',
                    fontWeight:
                      '800',
                    textTransform:
                      'uppercase',
                    marginBottom:
                      '4px'
                  }}
                >
                  Limited-Time Promotion
                </div>

                <div
                  style={{
                    display:
                      'flex',
                    alignItems:
                      'baseline',
                    gap: '8px',
                    flexWrap:
                      'wrap'
                  }}
                >
                  <span
                    style={{
                      color:
                        '#9a3412',
                      fontWeight:
                        '900',
                      fontSize:
                        '24px'
                    }}
                  >
                    TT$
                    {formatMoney(
                      publicPrice
                    )}
                  </span>

                  <span
                    style={{
                      color:
                        '#64748b',
                      fontSize:
                        '12px',
                      fontWeight:
                        '600'
                    }}
                  >
                    for{' '}
                    {publicHours}{' '}
                    hours
                  </span>
                </div>

                <div
                  style={{
                    color:
                      '#7c2d12',
                    fontSize:
                      '12px',
                    marginTop:
                      '6px'
                  }}
                >
                  Regular value:{' '}
                  <strong>
                    TT$
                    {formatMoney(
                      promotionalRegularValue
                    )}
                  </strong>
                </div>

                <div
                  style={{
                    color:
                      '#c2410c',
                    fontSize:
                      '14px',
                    fontWeight:
                      '900',
                    marginTop:
                      '3px'
                  }}
                >
                  Save TT$
                  {formatMoney(
                    promotionalSavings
                  )}
                </div>

                <div
                  style={{
                    color:
                      '#7c2d12',
                    fontSize:
                      '11px',
                    marginTop:
                      '5px'
                  }}
                >
                  No deposit required.
                  Pay on delivery.
                </div>
              </div>
            ) : (
              <div
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                  paddingTop:
                    '14px',
                  borderTop:
                    '1px solid #f1f5f9'
                }}
              >
                <div>
                  <span
                    style={{
                      display:
                        'block',
                      fontSize:
                        '11px',
                      color:
                        '#64748b',
                      textTransform:
                        'uppercase',
                      fontWeight:
                        'bold'
                    }}
                  >
                    Starting at
                  </span>

                  <span
                    style={{
                      color:
                        '#2563eb',
                      fontWeight:
                        'bold',
                      fontSize:
                        '17px'
                    }}
                  >
                    TT$650
                  </span>

                  <span
                    style={{
                      display:
                        'block',
                      fontSize:
                        '11px',
                      color:
                        '#64748b',
                      marginTop:
                        '2px'
                    }}
                  >
                    2 Hours
                  </span>
                </div>

                <a
                  href="/#booking"
                  onClick={() =>
                    trackButtonClick(
                      'clicked_book_now'
                    )
                  }
                  style={{
                    background:
                      '#0f172a',
                    color:
                      'white',
                    fontSize:
                      '13px',
                    fontWeight:
                      'bold',
                    padding:
                      '10px 18px',
                    borderRadius:
                      '8px',
                    border:
                      'none',
                    cursor:
                      'pointer',
                    textDecoration:
                      'none',
                    display:
                      'inline-block'
                  }}
                >
                  Select & Book
                </a>
              </div>
            )}

            {/* PROMO BOOKING BUTTON */}
            {promoIsActive && (
              <a
                href="/#booking"
                onClick={
                  handlePromotionalBookClick
                }
                style={{
                  display:
                    'block',
                  width:
                    '100%',
                  background:
                    '#0f172a',
                  color:
                    'white',
                  fontSize:
                    '13px',
                  fontWeight:
                    'bold',
                  padding:
                    '11px 0',
                  borderRadius:
                    '8px',
                  border:
                    'none',
                  cursor:
                    'pointer',
                  textDecoration:
                    'none',
                  textAlign:
                    'center',
                  boxSizing:
                    'border-box'
                }}
              >
                🔥 Get This Promotional Offer
              </a>
            )}
          </div>
        </div>

        {/* Photo Gallery Grid */}
        <div
          style={{
            marginBottom: '30px'
          }}
        >
          <h3
            style={{
              fontSize: '16px',
              fontWeight:
                'bold',
              color:
                '#0f172a',
              marginBottom:
                '12px',
              textAlign:
                'center'
            }}
          >
            📸 Event & Unit Gallery
          </h3>

          <div
            style={{
              display:
                'grid',
              gridTemplateColumns:
                'repeat(2, 1fr)',
              gap: '10px'
            }}
          >
            {galleryImages.map(
              (imgUrl, index) => (
                <div
                  key={index}
                  style={{
                    height:
                      '140px',
                    borderRadius:
                      '12px',
                    overflow:
                      'hidden',
                    border:
                      '1px solid #e2e8f0',
                    background:
                      '#f8fafc',
                    cursor:
                      'pointer'
                  }}
                  onClick={() => {
                    trackButtonClick(
                      `click_gallery_image_${index + 1}`
                    );

                    setSelectedImage(
                      imgUrl
                    );
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={`Rental Zone Gallery ${index + 1}`}
                    style={{
                      width:
                        '100%',
                      height:
                        '100%',
                      objectFit:
                        'cover'
                    }}
                    title="Click to zoom image"
                  />
                </div>
              )
            )}
          </div>
        </div>

        {/* Q&A / Guidelines Section */}
        <div
          id="space-reqs"
          style={{
            background:
              'white',
            borderRadius:
              '16px',
            border:
              '1px solid #e2e8f0',
            padding:
              '20px',
            marginBottom:
              '30px',
            boxShadow:
              '0 4px 12px rgba(0, 0, 0, 0.03)'
          }}
        >
          <h3
            style={{
              fontSize:
                '18px',
              fontWeight:
                'bold',
              color:
                '#0f172a',
              marginBottom:
                '16px',
              textAlign:
                'center'
            }}
          >
            📋 Setup Guidelines & FAQ
          </h3>

          <div
            style={{
              display:
                'flex',
              flexDirection:
                'column',
              gap:
                '14px'
            }}
          >
            {faqs.map(
              (item, idx) => (
                <div
                  key={idx}
                  style={{
                    paddingBottom:
                      '12px',
                    borderBottom:
                      idx <
                      faqs.length - 1
                        ? '1px solid #f1f5f9'
                        : 'none'
                  }}
                >
                  <h4
                    style={{
                      fontSize:
                        '14px',
                      fontWeight:
                        'bold',
                      color:
                        '#1e293b',
                      margin:
                        '0 0 4px 0'
                    }}
                  >
                    {idx + 1}.{' '}
                    {item.q}
                  </h4>

                  <p
                    style={{
                      fontSize:
                        '13px',
                      color:
                        '#64748b',
                      margin: '0',
                      lineHeight:
                        '1.4'
                    }}
                  >
                    {item.a}
                  </p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* EXISTING INTENT SELECTION POPUP MODAL */}
      {showBookingPopup && (
        <div
          style={{
            position:
              'fixed',
            inset: 0,
            zIndex:
              10000,
            background:
              'rgba(0, 0, 0, 0.75)',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            padding:
              '16px'
          }}
          onClick={() => {
            trackButtonClick(
              'dismiss_intent_popup_backdrop'
            );

            setShowBookingPopup(
              false
            );
          }}
        >
          <div
            style={{
              background:
                'white',
              borderRadius:
                '20px',
              padding:
                '28px 24px',
              maxWidth:
                '420px',
              width:
                '100%',
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              textAlign:
                'center',
              position:
                'relative'
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              onClick={() => {
                trackButtonClick(
                  'dismiss_intent_popup_close_btn'
                );

                setShowBookingPopup(
                  false
                );
              }}
              style={{
                position:
                  'absolute',
                top:
                  '14px',
                right:
                  '16px',
                background:
                  '#f1f5f9',
                border:
                  'none',
                borderRadius:
                  '50%',
                width:
                  '32px',
                height:
                  '32px',
                fontSize:
                  '18px',
                fontWeight:
                  'bold',
                color:
                  '#64748b',
                cursor:
                  'pointer',
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center'
              }}
            >
              &times;
            </button>

            <span
              style={{
                background:
                  '#e0f2fe',
                color:
                  '#0369a1',
                padding:
                  '6px 14px',
                borderRadius:
                  '20px',
                fontSize:
                  '11px',
                fontWeight:
                  'bold',
                textTransform:
                  'uppercase',
                letterSpacing:
                  '0.5px'
              }}
            >
              Welcome to The Rental Zone
            </span>

            <h3
              style={{
                fontSize:
                  '20px',
                fontWeight:
                  '800',
                color:
                  '#0f172a',
                margin:
                  '16px 0 8px 0'
              }}
            >
              What would you like to find out?
            </h3>

            <p
              style={{
                fontSize:
                  '13px',
                color:
                  '#64748b',
                lineHeight:
                  '1.4',
                margin:
                  '0 0 20px 0'
              }}
            >
              Select an option below
              so we can guide you to
              the right information:
            </p>

            <div
              style={{
                display:
                  'flex',
                flexDirection:
                  'column',
                gap:
                  '10px'
              }}
            >
              <button
                onClick={() =>
                  handleIntentSelect(
                    'availability',
                    '/#booking'
                  )
                }
                style={{
                  width:
                    '100%',
                  background:
                    '#2563eb',
                  color:
                    'white',
                  fontWeight:
                    'bold',
                  padding:
                    '12px 16px',
                  borderRadius:
                    '10px',
                  border:
                    'none',
                  fontSize:
                    '14px',
                  cursor:
                    'pointer',
                  textAlign:
                    'left',
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'space-between'
                }}
              >
                <span>
                  📅 Check Availability
                  & Book
                </span>

                <span
                  style={{
                    fontSize:
                      '16px'
                  }}
                >
                  →
                </span>
              </button>

              <button
                onClick={() =>
                  handleIntentSelect(
                    'prices'
                  )
                }
                style={{
                  width:
                    '100%',
                  background:
                    '#f8fafc',
                  color:
                    '#0f172a',
                  fontWeight:
                    '600',
                  padding:
                    '12px 16px',
                  borderRadius:
                    '10px',
                  border:
                    '1px solid #e2e8f0',
                  fontSize:
                    '14px',
                  cursor:
                    'pointer',
                  textAlign:
                    'left',
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'space-between'
                }}
              >
                <span>
                  🏷️ See Prices &
                  Packages
                </span>

                <span
                  style={{
                    fontSize:
                      '16px'
                  }}
                >
                  →
                </span>
              </button>

              <button
                onClick={() =>
                  handleIntentSelect(
                    'space'
                  )
                }
                style={{
                  width:
                    '100%',
                  background:
                    '#f8fafc',
                  color:
                    '#0f172a',
                  fontWeight:
                    '600',
                  padding:
                    '12px 16px',
                  borderRadius:
                    '10px',
                  border:
                    '1px solid #e2e8f0',
                  fontSize:
                    '14px',
                  cursor:
                    'pointer',
                  textAlign:
                    'left',
                  display:
                    'flex',
                  alignItems:
                    'center',
                  justifyContent:
                    'space-between'
                }}
              >
                <span>
                  📐 See Size & Space
                  Requirements
                </span>

                <span
                  style={{
                    fontSize:
                      '16px'
                  }}
                >
                  →
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROMOTIONAL POPUP */}
      {showPromotionalPopup &&
        promoIsActive && (
          <div
            style={{
              position:
                'fixed',
              inset: 0,
              zIndex:
                11000,
              background:
                'rgba(0, 0, 0, 0.78)',
              display:
                'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              padding:
                '16px'
            }}
            onClick={() =>
              closePromotionalPopup(
                'backdrop'
              )
            }
          >
            <div
              style={{
                background:
                  'white',
                borderRadius:
                  '20px',
                padding:
                  '28px 22px',
                maxWidth:
                  '430px',
                width:
                  '100%',
                boxShadow:
                  '0 24px 40px rgba(0,0,0,0.35)',
                textAlign:
                  'center',
                position:
                  'relative'
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              <button
                onClick={() =>
                  closePromotionalPopup(
                    'close_button'
                  )
                }
                style={{
                  position:
                    'absolute',
                  top:
                    '12px',
                  right:
                    '14px',
                  background:
                    '#f1f5f9',
                  border:
                    'none',
                  borderRadius:
                    '50%',
                  width:
                    '32px',
                  height:
                    '32px',
                  fontSize:
                    '18px',
                  fontWeight:
                    'bold',
                  color:
                    '#64748b',
                  cursor:
                    'pointer'
                }}
              >
                &times;
              </button>

              <div
                style={{
                  fontSize:
                    '11px',
                  fontWeight:
                    '900',
                  color:
                    '#c2410c',
                  textTransform:
                    'uppercase',
                  letterSpacing:
                    '0.6px',
                  marginBottom:
                    '7px'
                }}
              >
                🔥 Limited-Time Offer
              </div>

              <h2
                style={{
                  fontSize:
                    '25px',
                  lineHeight:
                    '1.15',
                  fontWeight:
                    '900',
                  color:
                    '#0f172a',
                  margin:
                    '0 0 10px 0'
                }}
              >
                {publicHours}{' '}
                Hours for TT$
                {formatMoney(
                  publicPrice
                )}
              </h2>

              <div
                style={{
                  color:
                    '#64748b',
                  fontSize:
                    '13px',
                  marginBottom:
                    '3px'
                }}
              >
                Regular value:{' '}
                <strong>
                  TT$
                  {formatMoney(
                    promotionalRegularValue
                  )}
                </strong>
              </div>

              <div
                style={{
                  color:
                    '#c2410c',
                  fontSize:
                    '18px',
                  fontWeight:
                    '900',
                  marginBottom:
                    '12px'
                }}
              >
                YOU SAVE TT$
                {formatMoney(
                  promotionalSavings
                )}
              </div>

              <div
                style={{
                  background:
                    '#fff7ed',
                  border:
                    '1px solid #fed7aa',
                  borderRadius:
                    '10px',
                  padding:
                    '10px',
                  marginBottom:
                    '12px'
                }}
              >
                <div
                  style={{
                    color:
                      '#9a3412',
                    fontSize:
                      '11px',
                    fontWeight:
                      '800',
                    textTransform:
                      'uppercase'
                  }}
                >
                  Your offer window
                </div>

                <div
                  style={{
                    color:
                      '#c2410c',
                    fontSize:
                      '25px',
                    fontWeight:
                      '900',
                    marginTop:
                      '2px'
                  }}
                >
                  {formatCountdown(
                    promoPopupSecondsLeft
                  )}
                </div>
              </div>

              <p
                style={{
                  fontSize:
                    '13px',
                  color:
                    '#475569',
                  lineHeight:
                    '1.45',
                  margin:
                    '0 0 16px 0'
                }}
              >
                No deposit required.
                <br />
                <strong>
                  Pay on delivery.
                </strong>
              </p>

              <a
                href="/#booking"
                onClick={() => {
                  handlePromotionalBookClick();

                  trackTrzEvent(
                    'promotional_popup_cta_clicked',
                    {
                      offer_price:
                        publicPrice,
                      offer_hours:
                        publicHours,
                      regular_value:
                        promotionalRegularValue,
                      savings:
                        promotionalSavings
                    }
                  );

                  setShowPromotionalPopup(
                    false
                  );
                }}
                style={{
                  display:
                    'block',
                  width:
                    '100%',
                  boxSizing:
                    'border-box',
                  background:
                    '#ea580c',
                  color:
                    'white',
                  fontWeight:
                    '900',
                  padding:
                    '14px 10px',
                  borderRadius:
                    '11px',
                  textDecoration:
                    'none',
                  fontSize:
                    '15px',
                  boxShadow:
                    '0 4px 12px rgba(234, 88, 12, 0.3)'
                }}
              >
                🔥 Claim My TT$
                {formatMoney(
                  publicPrice
                )}{' '}
                Offer
              </a>
            </div>
          </div>
        )}

      {/* PRICE & PACKAGES INFORMATION POPUP */}
      {showPriceModal && (
        <div
          style={{
            position:
              'fixed',
            inset: 0,
            zIndex:
              10000,
            background:
              'rgba(0, 0, 0, 0.75)',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            padding:
              '16px'
          }}
          onClick={() =>
            setShowPriceModal(false)
          }
        >
          <div
            style={{
              background:
                'white',
              borderRadius:
                '20px',
              padding:
                '24px',
              maxWidth:
                '420px',
              width:
                '100%',
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              position:
                'relative'
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              onClick={() =>
                setShowPriceModal(
                  false
                )
              }
              style={{
                position:
                  'absolute',
                top:
                  '14px',
                right:
                  '16px',
                background:
                  '#f1f5f9',
                border:
                  'none',
                borderRadius:
                  '50%',
                width:
                  '32px',
                height:
                  '32px',
                fontSize:
                  '18px',
                fontWeight:
                  'bold',
                color:
                  '#64748b',
                cursor:
                  'pointer',
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center'
              }}
            >
              &times;
            </button>

            <span
              style={{
                background:
                  '#e0f2fe',
                color:
                  '#0369a1',
                padding:
                  '4px 10px',
                borderRadius:
                  '20px',
                fontSize:
                  '11px',
                fontWeight:
                  'bold',
                textTransform:
                  'uppercase'
              }}
            >
              Pricing & Packages
            </span>

            <h3
              style={{
                fontSize:
                  '20px',
                fontWeight:
                  '800',
                color:
                  '#0f172a',
                margin:
                  '12px 0 6px 0'
              }}
            >
              🕷️ Spider-Man Bouncy Castle
            </h3>

            <div
              style={{
                background:
                  promoIsActive
                    ? '#fff7ed'
                    : '#f8fafc',
                borderRadius:
                  '12px',
                padding:
                  '16px',
                border:
                  promoIsActive
                    ? '1px solid #fed7aa'
                    : '1px solid #e2e8f0',
                margin:
                  '14px 0'
              }}
            >
              {promoIsActive && (
                <div
                  style={{
                    fontSize:
                      '11px',
                    color:
                      '#c2410c',
                    fontWeight:
                      '800',
                    textTransform:
                      'uppercase',
                    marginBottom:
                      '6px'
                  }}
                >
                  🔥 Limited-Time Promotion
                </div>
              )}

              <div
                style={{
                  display:
                    'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'baseline',
                  marginBottom:
                    '8px',
                  gap:
                    '10px'
                }}
              >
                <div>
                  <span
                    style={{
                      fontWeight:
                        'bold',
                      color:
                        '#0f172a',
                      fontSize:
                        '15px',
                      display:
                        'block'
                    }}
                  >
                    {promoIsActive
                      ? `${publicHours} Hour Promotional Rate`
                      : 'Starting Rate'}
                  </span>

                  <span
                    style={{
                      fontSize:
                        '11px',
                      color:
                        '#64748b',
                      fontWeight:
                        '600'
                    }}
                  >
                    {promoIsActive
                      ? 'Limited-time promotional pricing'
                      : '(Includes 2 Hours)'}
                  </span>
                </div>

                <span
                  style={{
                    fontSize:
                      '20px',
                    fontWeight:
                      '800',
                    color:
                      promoIsActive
                        ? '#ea580c'
                        : '#2563eb'
                  }}
                >
                  TT$
                  {formatMoney(
                    publicPrice
                  )}
                </span>
              </div>

              {promoIsActive && (
                <>
                  <div
                    style={{
                      fontSize:
                        '12px',
                      color:
                        '#7c2d12',
                      marginBottom:
                        '3px'
                    }}
                  >
                    Regular value:{' '}
                    <strong>
                      TT$
                      {formatMoney(
                        promotionalRegularValue
                      )}
                    </strong>
                  </div>

                  <div
                    style={{
                      fontSize:
                        '14px',
                      color:
                        '#c2410c',
                      fontWeight:
                        '900',
                      marginBottom:
                        '7px'
                    }}
                  >
                    Save TT$
                    {formatMoney(
                      promotionalSavings
                    )}
                  </div>
                </>
              )}

              <ul
                style={{
                  paddingLeft:
                    '18px',
                  margin:
                    '8px 0 0 0',
                  fontSize:
                    '13px',
                  color:
                    '#475569',
                  lineHeight:
                    '1.5'
                }}
              >
                <li>
                  {promoIsActive
                    ? `${publicHours} hours of bounce time`
                    : 'Starting cost for 2 hours of bounce time'}
                </li>

                <li>
                  Fully sanitized &
                  heavy-duty vinyl
                  construction
                </li>

                <li>
                  No deposit required —
                  payment is due on
                  delivery
                </li>
              </ul>
            </div>

            <div
              style={{
                display:
                  'flex',
                flexDirection:
                  'column',
                gap:
                  '10px',
                marginTop:
                  '18px'
              }}
            >
              <a
                href="/#booking"
                onClick={() => {
                  trackButtonClick(
                    'clicked_book_now'
                  );

                  if (promoIsActive) {
                    handlePromotionalBookClick();
                  }

                  setShowPriceModal(
                    false
                  );
                }}
                style={{
                  display:
                    'block',
                  textAlign:
                    'center',
                  background:
                    '#2563eb',
                  color:
                    'white',
                  fontWeight:
                    'bold',
                  padding:
                    '12px 0',
                  borderRadius:
                    '10px',
                  textDecoration:
                    'none',
                  fontSize:
                    '14px'
                }}
              >
                {promoIsActive
                  ? '🔥 Get This Offer & Check Availability'
                  : '📅 Check Availability & Book Now'}
              </a>

              <button
                onClick={() => {
                  trackButtonClick(
                    'click_price_modal_switch_to_space'
                  );

                  handleIntentSelect(
                    'space'
                  );
                }}
                style={{
                  width:
                    '100%',
                  background:
                    '#f8fafc',
                  color:
                    '#0f172a',
                  fontWeight:
                    '600',
                  padding:
                    '10px 0',
                  borderRadius:
                    '10px',
                  border:
                    '1px solid #cbd5e1',
                  fontSize:
                    '13px',
                  cursor:
                    'pointer',
                  textAlign:
                    'center'
                }}
              >
                📐 Check Size & Yard
                Requirements
              </button>

              <a
                href="https://wa.me/18682810670?text=Hi%20Rental%20Zone,%20I%20have%20a%20question%20about%20prices."
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackButtonClick(
                    'whatsapp_clicked'
                  )
                }
                style={{
                  display:
                    'block',
                  textAlign:
                    'center',
                  background:
                    '#25d366',
                  color:
                    'white',
                  fontWeight:
                    'bold',
                  padding:
                    '12px 0',
                  borderRadius:
                    '10px',
                  textDecoration:
                    'none',
                  fontSize:
                    '14px'
                }}
              >
                💬 Have Questions?
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* SIZE & SPACE REQUIREMENTS INFORMATION POPUP */}
      {showSpaceModal && (
        <div
          style={{
            position:
              'fixed',
            inset: 0,
            zIndex:
              10000,
            background:
              'rgba(0, 0, 0, 0.75)',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            padding:
              '16px'
          }}
          onClick={() =>
            setShowSpaceModal(false)
          }
        >
          <div
            style={{
              background:
                'white',
              borderRadius:
                '20px',
              padding:
                '24px',
              maxWidth:
                '420px',
              width:
                '100%',
              boxShadow:
                '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
              position:
                'relative'
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              onClick={() =>
                setShowSpaceModal(
                  false
                )
              }
              style={{
                position:
                  'absolute',
                top:
                  '14px',
                right:
                  '16px',
                background:
                  '#f1f5f9',
                border:
                  'none',
                borderRadius:
                  '50%',
                width:
                  '32px',
                height:
                  '32px',
                fontSize:
                  '18px',
                fontWeight:
                  'bold',
                color:
                  '#64748b',
                cursor:
                  'pointer',
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center'
              }}
            >
              &times;
            </button>

            <span
              style={{
                background:
                  '#e0f2fe',
                color:
                  '#0369a1',
                padding:
                  '4px 10px',
                borderRadius:
                  '20px',
                fontSize:
                  '11px',
                fontWeight:
                  'bold',
                textTransform:
                  'uppercase'
              }}
            >
              Size & Space Specs
            </span>

            <h3
              style={{
                fontSize:
                  '20px',
                fontWeight:
                  '800',
                color:
                  '#0f172a',
                margin:
                  '12px 0 10px 0'
              }}
            >
              📐 Clearance & Dimensions
            </h3>

            <div
              style={{
                position:
                  'relative',
                borderRadius:
                  '12px',
                overflow:
                  'hidden',
                border:
                  '1px solid #cbd5e1',
                marginBottom:
                  '14px'
              }}
            >
              <img
                src={featuredImage}
                alt="Spider-Man Bouncy Castle Specs"
                style={{
                  width:
                    '100%',
                  height:
                    '180px',
                  objectFit:
                    'cover',
                  display:
                    'block'
                }}
              />

              <div
                style={{
                  position:
                    'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background:
                    'rgba(15, 23, 42, 0.85)',
                  color:
                    'white',
                  padding:
                    '8px 12px',
                  textAlign:
                    'center',
                  fontWeight:
                    'bold',
                  fontSize:
                    '14px',
                  letterSpacing:
                    '0.5px'
                }}
              >
                26ft Long × 13ft Wide × 13ft High
              </div>
            </div>

            <div
              style={{
                fontSize:
                  '13px',
                color:
                  '#475569',
                lineHeight:
                  '1.5',
                background:
                  '#f8fafc',
                padding:
                  '12px',
                borderRadius:
                  '10px',
                border:
                  '1px solid #e2e8f0'
              }}
            >
              <p
                style={{
                  margin:
                    '0 0 6px 0'
                }}
              >
                <strong>
                  Requirements:
                </strong>
              </p>

              <ul
                style={{
                  paddingLeft:
                    '18px',
                  margin: 0
                }}
              >
                <li>
                  Flat, clean grass
                  or smooth pavement.
                </li>

                <li>
                  Clear overhead
                  clearance (no low
                  branches or wires).
                </li>

                <li>
                  Standard household
                  outlet within 100ft.
                </li>
              </ul>
            </div>

            <div
              style={{
                display:
                  'flex',
                flexDirection:
                  'column',
                gap:
                  '10px',
                marginTop:
                  '18px'
              }}
            >
              <a
                href="/#booking"
                onClick={() => {
                  trackButtonClick(
                    'clicked_book_now'
                  );

                  if (promoIsActive) {
                    handlePromotionalBookClick();
                  }

                  setShowSpaceModal(
                    false
                  );
                }}
                style={{
                  display:
                    'block',
                  textAlign:
                    'center',
                  background:
                    '#2563eb',
                  color:
                    'white',
                  fontWeight:
                    'bold',
                  padding:
                    '12px 0',
                  borderRadius:
                    '10px',
                  textDecoration:
                    'none',
                  fontSize:
                    '14px'
                }}
              >
                {promoIsActive
                  ? '🔥 Get This Offer – Proceed to Book'
                  : '📅 Fits My Space – Proceed to Book'}
              </a>

              <button
                onClick={() => {
                  trackButtonClick(
                    'click_space_modal_switch_to_price'
                  );

                  handleIntentSelect(
                    'prices'
                  );
                }}
                style={{
                  width:
                    '100%',
                  background:
                    '#f8fafc',
                  color:
                    '#0f172a',
                  fontWeight:
                    '600',
                  padding:
                    '10px 0',
                  borderRadius:
                    '10px',
                  border:
                    '1px solid #cbd5e1',
                  fontSize:
                    '13px',
                  cursor:
                    'pointer',
                  textAlign:
                    'center'
                }}
              >
                🏷️ Check Price &
                Packages
              </button>

              <a
                href="https://wa.me/18682810670?text=Hi%20Rental%20Zone,%20I%20have%20a%20question%20about%20yard%20space%20requirements."
                target="_blank"
                rel="noreferrer"
                onClick={() =>
                  trackButtonClick(
                    'whatsapp_clicked'
                  )
                }
                style={{
                  display:
                    'block',
                  textAlign:
                    'center',
                  background:
                    '#25d366',
                  color:
                    'white',
                  fontWeight:
                    'bold',
                  padding:
                    '12px 0',
                  borderRadius:
                    '10px',
                  textDecoration:
                    'none',
                  fontSize:
                    '14px'
                }}
              >
                💬 Unsure About Space?
                Ask on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Modal Popup for Images */}
      {selectedImage && (
        <div
          style={{
            position:
              'fixed',
            inset: 0,
            zIndex:
              9999,
            background:
              'rgba(0, 0, 0, 0.85)',
            display:
              'flex',
            alignItems:
              'center',
            justifyContent:
              'center',
            padding:
              '16px'
          }}
          onClick={() =>
            setSelectedImage(null)
          }
        >
          <div
            style={{
              position:
                'relative',
              maxWidth:
                '900px',
              width:
                '100%',
              maxHeight:
                '90vh',
              display:
                'flex',
              alignItems:
                'center',
              justifyContent:
                'center'
            }}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <button
              style={{
                position:
                  'absolute',
                top:
                  '-45px',
                right:
                  '0',
                color:
                  'white',
                background:
                  'rgba(255, 255, 255, 0.2)',
                border:
                  'none',
                borderRadius:
                  '50%',
                width:
                  '36px',
                height:
                  '36px',
                fontSize:
                  '20px',
                fontWeight:
                  'bold',
                cursor:
                  'pointer',
                display:
                  'flex',
                alignItems:
                  'center',
                justifyContent:
                  'center'
              }}
              onClick={() =>
                setSelectedImage(
                  null
                )
              }
            >
              &times;
            </button>

            <img
              src={selectedImage}
              alt="Enlarged view"
              style={{
                maxWidth:
                  '100%',
                maxHeight:
                  '85vh',
                objectFit:
                  'contain',
                borderRadius:
                  '8px',
                boxShadow:
                  '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
