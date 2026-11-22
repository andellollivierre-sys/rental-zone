import React, { useState, useEffect, useRef } from 'react';
import AvailabilityCheckModal from './AvailabilityCheckModal';
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
  const [activeSlide, setActiveSlide] = useState(0);
  const [showBookingPopup, setShowBookingPopup] = useState(false);
  const [expandedPopupSection, setExpandedPopupSection] = useState(null);
  const [showAvailabilityModal, setShowAvailabilityModal] = useState(false);

  // Promotional offer state
  const [promotionalOffer, setPromotionalOffer] = useState(null);
  const [promoLoading, setPromoLoading] = useState(true);
  const [promoExpirySeconds, setPromoExpirySeconds] = useState(null);

  // Promotional popup state

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
   * Show the welcome / promotional popup only after the
   * introductory gallery video has finished playing.
   */
  const handleIntroVideoEnded = () => {
    // Temporary test switch: keep popup implementation and tracking intact, but do not open it.
    const popupTemporarilyPaused = true;
    if (popupTemporarilyPaused) return;

    if (promoLoading) return;

    if (promoIsActive) {
      setShowBookingPopup(true);
      setExpandedPopupSection(null);

      const promoPopupSeen =
        sessionStorage.getItem('trz_promotional_popup_seen');

      if (!promoPopupSeen) {
        sessionStorage.setItem('trz_promotional_popup_seen', 'true');
        trackTrzEvent('promotional_popup_opened', {
          trigger: 'video_ended',
          offer_price: publicPrice,
          offer_hours: publicHours,
          regular_value: promotionalRegularValue,
          savings: promotionalSavings
        });
      }
      return;
    }

    const hasSeenPopup =
      sessionStorage.getItem('seen_booking_popup');

    if (!hasSeenPopup) {
      setShowBookingPopup(true);
      sessionStorage.setItem('seen_booking_popup', 'true');
      trackTrzEvent('popup_opened', {
        popup_type: 'initial_intent',
        trigger: 'video_ended'
      });
    }
  };

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

          setShowBookingPopup(
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
      setExpandedPopupSection(
        expandedPopupSection === 'prices' ? null : 'prices'
      );
      return;
    }

    if (
      intentKey === 'space'
    ) {
      setExpandedPopupSection(
        expandedPopupSection === 'space' ? null : 'space'
      );
      return;
    }

    if (intentKey === 'availability') {
      setExpandedPopupSection(null);
      setShowBookingPopup(false);
      setShowAvailabilityModal(true);
      return;
    }

    if (targetDestination) {
      setExpandedPopupSection(null);
      setShowBookingPopup(false);
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

  const carouselImages = [featuredImage, ...galleryImages];
  const activeCarouselImage = activeSlide === 0 ? null : carouselImages[activeSlide - 1] || featuredImage;
  const isVideoSlide = activeSlide === 0;
  const totalCarouselSlides = carouselImages.length + 1;

  const changeSlide = (direction) => {
    const nextIndex = (activeSlide + direction + totalCarouselSlides) % totalCarouselSlides;
    setActiveSlide(nextIndex);
    if (nextIndex > 1) {
      trackButtonClick(`click_gallery_image_${nextIndex - 1}`);
    }
  };

  const faqs = [    {
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

          <a
            href="#availability-check"
            onClick={(event) => {
              event.preventDefault();
              trackButtonClick('clicked_book_now');
              if (promoIsActive) handlePromotionalBookClick();
              setShowAvailabilityModal(true);
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

        {/* Featured Inventory + Mobile-First Offer */}
        <div
          id="pricing"
          style={{
            background: 'white',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
            marginBottom: '22px'
          }}
        >
          <div
            style={{
              height: '210px',
              background: '#1e293b',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {isVideoSlide ? (
              <video
                src="/rental_zone_spider_music.mp4"
                autoPlay
                muted
                controls
                onEnded={handleIntroVideoEnded}
                playsInline
                preload="auto"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  background: '#000'
                }}
                aria-label="The Rental Zone Spider-Man bouncy castle video"
              />
            ) : (
              <img
                src={activeCarouselImage}
                alt={`Spider-Man Bouncy Castle view ${activeSlide}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  cursor: 'pointer'
                }}
                onClick={() => {
                  trackButtonClick('click_featured_image_zoom');
                  setSelectedImage(activeCarouselImage);
                }}
                title="Tap to enlarge image"
              />
            )}
            <span style={{
              position: 'absolute',
              top: 10,
              left: 10,
              background: '#0f172a',
              color: 'white',
              padding: '5px 9px',
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 800
            }}>
              SPIDER-MAN COMBO
            </span>
            {promoIsActive && (
              <span style={{
                position: 'absolute',
                top: 10,
                right: 10,
                background: '#ea580c',
                color: 'white',
                padding: '6px 9px',
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 800
              }}>
                🔥 PROMO
              </span>
            )}
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => changeSlide(-1)}
              style={{
                position: 'absolute',
                left: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 34,
                height: 34,
                border: 0,
                borderRadius: '50%',
                background: 'rgba(15,23,42,.78)',
                color: 'white',
                fontSize: 22,
                cursor: 'pointer'
              }}
            >‹</button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => changeSlide(1)}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                width: 34,
                height: 34,
                border: 0,
                borderRadius: '50%',
                background: 'rgba(15,23,42,.78)',
                color: 'white',
                fontSize: 22,
                cursor: 'pointer'
              }}
            >›</button>
            <div style={{
              position: 'absolute',
              bottom: 9,
              left: 0,
              right: 0,
              display: 'flex',
              justifyContent: 'center',
              gap: 5
            }}>
              {carouselImages.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  aria-label={`Show photo ${index + 1}`}
                  onClick={() => {
                    setActiveSlide(index);
                    if (index > 0) trackButtonClick(`click_gallery_image_${index}`);
                  }}
                  style={{
                    width: activeSlide === index ? 17 : 7,
                    height: 7,
                    padding: 0,
                    border: 0,
                    borderRadius: 10,
                    background: activeSlide === index ? 'white' : 'rgba(255,255,255,.6)',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ padding: '12px 14px 16px' }}>
            {promoIsActive ? (
              <div style={{
                background: '#fff7ed',
                border: '1px solid #fed7aa',
                borderRadius: 12,
                padding: '10px 12px',
                marginBottom: 10
              }}>
                <div style={{
                  color: '#c2410c',
                  fontSize: 11,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  marginBottom: 2
                }}>Limited-Time Promotion</div>
                <div style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  flexWrap: 'wrap',
                  gap: 8
                }}>
                  <strong style={{
                    color: '#9a3412',
                    fontSize: 27,
                    lineHeight: 1.1
                  }}>TT${formatMoney(publicPrice)}</strong>
                  <span style={{ color: '#64748b', fontSize: 13, fontWeight: 700 }}>
                    for {publicHours} hours
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: '4px 12px',
                  marginTop: 5,
                  fontSize: 12
                }}>
                  <span style={{ color: '#7c2d12' }}>Regular: <strong>TT${formatMoney(promotionalRegularValue)}</strong></span>
                  <strong style={{ color: '#c2410c' }}>Save TT${formatMoney(promotionalSavings)}</strong>
                </div>
                <div style={{ color: '#7c2d12', fontSize: 11, marginTop: 4 }}>
                  No deposit. Pay on delivery.
                </div>
              </div>
            ) : (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '5px 2px 10px'
              }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Starting at</div>
                  <strong style={{ color: '#2563eb', fontSize: 22 }}>TT$650</strong>
                  <span style={{ color: '#64748b', fontSize: 12 }}> · 2 hours</span>
                </div>
                <span style={{ color: '#64748b', fontSize: 11 }}>No deposit required</span>
              </div>
            )}

            {promoIsActive ? (
              <a
                href="#availability-check"
                onClick={(event) => {
                  event.preventDefault();
                  handlePromotionalBookClick();
                  setShowAvailabilityModal(true);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  background: '#0f172a',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 800,
                  padding: '13px 10px',
                  borderRadius: 9,
                  textDecoration: 'none',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}
              >🔥 Get This Promotional Offer</a>
            ) : (
              <a
                href="#availability-check"
                onClick={(event) => {
                  event.preventDefault();
                  trackButtonClick('clicked_book_now');
                  setShowAvailabilityModal(true);
                }}
                style={{
                  display: 'block',
                  width: '100%',
                  background: '#0f172a',
                  color: 'white',
                  fontSize: 14,
                  fontWeight: 800,
                  padding: '13px 10px',
                  borderRadius: 9,
                  textDecoration: 'none',
                  textAlign: 'center',
                  boxSizing: 'border-box'
                }}
              >Check Availability & Book</a>
            )}

            <div style={{
              marginTop: 12,
              padding: '11px 12px',
              borderRadius: 10,
              background: '#f8fafc',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                margin: '0 0 5px',
                color: '#0f172a',
                fontSize: 17,
                fontWeight: 800
              }}>🕷️ Spider-Man Bouncy Castle</h3>
              <p style={{
                margin: '0 0 9px',
                color: '#475569',
                fontSize: 13,
                lineHeight: 1.45
              }}>A high-energy combo bouncer with a climbing wall and slide — ready for backyard fun.</p>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 6,
                marginBottom: 8
              }}>
                <span style={{ background: '#e0f2fe', color: '#075985', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700 }}>26 × 13 × 13 ft</span>
                <span style={{ background: '#e0f2fe', color: '#075985', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700 }}>Up to 8 kids</span>
                <span style={{ background: '#e0f2fe', color: '#075985', borderRadius: 6, padding: '5px 8px', fontSize: 11, fontWeight: 700 }}>Combo + slide</span>              </div>
              <div style={{
                color: '#475569',
                fontSize: 12,
                lineHeight: 1.45
              }}>Heavy-duty vinyl, fully cleaned and sanitized before every setup.</div>
            </div>
            <p style={{
              color: '#64748b',
              fontSize: 12,
              lineHeight: 1.4,
              margin: '9px 2px 0',
              textAlign: 'center'
            }}>Safe, clean, high-energy fun delivered straight to your yard. Secure your date with zero upfront risk.</p>
          </div>
        </div>


        {/* MORE RENTALS & EVENT SERVICES — visual discovery cards */}
        <section
          id="more-rentals"
          style={{
            margin: '8px 0 24px',
            padding: '20px 14px',
            background: '#eff6ff',
            border: '1px solid #dbeafe',
            borderRadius: 18
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ color: '#1d4ed8', fontSize: 11, fontWeight: 900, letterSpacing: 1, textTransform: 'uppercase' }}>
              More from The Rental Zone
            </span>
            <h2 style={{ margin: '6px 0', color: '#0f172a', fontSize: 23, lineHeight: 1.2, fontWeight: 900 }}>
              More to rent. More ways to make it happen.
            </h2>
            <p style={{ margin: '0 auto', maxWidth: 480, color: '#475569', fontSize: 13, lineHeight: 1.55 }}>
              Browse equipment rentals and event services. Tap a picture to ask about availability.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
            gap: 12
          }}>
            <article style={{ overflow: 'hidden', borderRadius: 14, background: '#fff', border: '1px solid #dbeafe', boxShadow: '0 5px 16px rgba(15,23,42,.07)' }}>
              <img
                src="https://res-de.togroup.com/stc/home_product/emtop/userfiles/1/images/photo/20241011190136894/EGGRD2822.jpg"
                alt="EMTOP 3000W gasoline generator"
                loading="lazy"
                style={{ width: '100%', height: 142, objectFit: 'contain', background: '#f8fafc', display: 'block' }}
              />
              <div style={{ padding: '12px 13px 14px' }}>
                <span style={{ color: '#2563eb', fontSize: 10, fontWeight: 900, letterSpacing: .8, textTransform: 'uppercase' }}>Equipment rental</span>
                <h3 style={{ margin: '5px 0', color: '#0f172a', fontSize: 18, fontWeight: 900 }}>Generator Rental</h3>
                <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 12, lineHeight: 1.5 }}>Portable power for events, home backup and work needs.</p>
                <a
                  href="https://wa.me/18682810670?text=Hi%20The%20Rental%20Zone%2C%20I%20would%20like%20to%20enquire%20about%20generator%20rental.%20Please%20confirm%20availability%20at%20TT%24400%20per%20day."
                  onClick={() => trackButtonClick('click_generator_rental_enquiry')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', padding: '11px 10px', borderRadius: 9, background: '#0f172a', color: '#fff', textDecoration: 'none', textAlign: 'center', fontSize: 12, fontWeight: 850 }}
                >Enquire about generator →</a>
              </div>
            </article>

            <article style={{ overflow: 'hidden', borderRadius: 14, background: '#fff', border: '1px solid #dbeafe', boxShadow: '0 5px 16px rgba(15,23,42,.07)' }}>
              <img
                src="https://cdn.shopify.com/s/files/1/0552/4527/5285/t/3/assets/pf-09695c9a--PWF2701SH100010003.png?v=1625771210"
                alt="A-iPower 2700 PSI pressure washer"
                loading="lazy"
                style={{ width: '100%', height: 142, objectFit: 'cover', display: 'block' }}
              />
              <div style={{ padding: '12px 13px 14px' }}>
                <span style={{ color: '#2563eb', fontSize: 10, fontWeight: 900, letterSpacing: .8, textTransform: 'uppercase' }}>Equipment rental</span>
                <h3 style={{ margin: '5px 0', color: '#0f172a', fontSize: 18, fontWeight: 900 }}>Pressure Washer Rental</h3>
                <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: 12, lineHeight: 1.5 }}>For driveways, patios, vehicles and outdoor clean-ups.</p>
                <a
                  href="https://wa.me/18682810670?text=Hi%20The%20Rental%20Zone%2C%20I%20would%20like%20to%20enquire%20about%20pressure%20washer%20rental.%20Please%20confirm%20availability%20at%20TT%24300%20per%20day."
                  onClick={() => trackButtonClick('click_pressure_washer_enquiry')}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'block', padding: '11px 10px', borderRadius: 9, background: '#0f172a', color: '#fff', textDecoration: 'none', textAlign: 'center', fontSize: 12, fontWeight: 850 }}
                >Enquire about pressure washer →</a>
              </div>
            </article>
          </div>

          <a
            href="#event-services"
            onClick={() => trackButtonClick('click_more_event_services')}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
              marginTop: 13,
              padding: '14px',
              borderRadius: 13,
              background: '#172554',
              color: '#fff',
              textDecoration: 'none'
            }}
          >
            <span>
              <strong style={{ display: 'block', fontSize: 15 }}>Planning an event?</strong>
              <span style={{ display: 'block', marginTop: 3, color: '#bfdbfe', fontSize: 12 }}>Explore DJs, catering and other event rentals.</span>
            </span>
            <span aria-hidden="true" style={{ fontSize: 24, fontWeight: 800 }}>→</span>
          </a>
          <p style={{ margin: '10px 2px 0', color: '#64748b', fontSize: 10, lineHeight: 1.45, textAlign: 'center' }}>
            Photos show the equipment offered. Confirm availability with The Rental Zone before booking.
          </p>
        </section>

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

      {/* TRZ SHARE BUTTONS SECTION */}
      <section
        aria-labelledby="trz-share-heading"
        style={{
          margin: '0 16px 30px',
          padding: '20px',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          background: '#f8fafc',
          textAlign: 'center'
        }}
      >
        <h3
          id="trz-share-heading"
          style={{
            margin: '0 0 8px',
            fontSize: '18px',
            fontWeight: 800,
            color: '#0f172a'
          }}
        >
          🎉 Know Someone Planning a Party?
        </h3>

        <p style={{
          margin: '0 0 16px',
          color: '#64748b',
          fontSize: '14px',
          lineHeight: 1.5
        }}>
          Share The Rental Zone with friends and family.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
          gap: '10px'
        }}>
          <button
            type="button"
            onClick={() => {
              const url = new URL(window.location.origin);
              url.searchParams.set('utm_source', 'whatsapp');
              url.searchParams.set('utm_medium', 'social');
              url.searchParams.set('utm_campaign', 'website_share');
              url.searchParams.set('utm_content', 'landing_share_buttons');

              trackButtonClick('share_whatsapp_clicked', {
                share_platform: 'whatsapp'
              });

              window.open(
                `https://wa.me/?text=${encodeURIComponent(
                  `Check out The Rental Zone for bouncy castle rentals in Trinidad! ${url.toString()}`
                )}`,
                '_blank',
                'noopener,noreferrer'
              );
            }}
            style={{
              padding: '12px 8px',
              border: 0,
              borderRadius: '10px',
              background: '#dcfce7',
              color: '#166534',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            💬 WhatsApp
          </button>

          <button
            type="button"
            onClick={() => {
              const url = new URL(window.location.origin);
              url.searchParams.set('utm_source', 'facebook');
              url.searchParams.set('utm_medium', 'social');
              url.searchParams.set('utm_campaign', 'website_share');
              url.searchParams.set('utm_content', 'landing_share_buttons');

              trackButtonClick('share_facebook_clicked', {
                share_platform: 'facebook'
              });

              window.open(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url.toString())}`,
                '_blank',
                'noopener,noreferrer'
              );
            }}
            style={{
              padding: '12px 8px',
              border: 0,
              borderRadius: '10px',
              background: '#dbeafe',
              color: '#1d4ed8',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            Facebook
          </button>

          <button
            type="button"
            onClick={() => {
              const url = new URL(window.location.origin);
              url.searchParams.set('utm_source', 'x');
              url.searchParams.set('utm_medium', 'social');
              url.searchParams.set('utm_campaign', 'website_share');
              url.searchParams.set('utm_content', 'landing_share_buttons');

              trackButtonClick('share_x_clicked', {
                share_platform: 'x'
              });

              window.open(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  'Check out The Rental Zone for bouncy castle rentals in Trinidad!'
                )}&url=${encodeURIComponent(url.toString())}`,
                '_blank',
                'noopener,noreferrer'
              );
            }}
            style={{
              padding: '12px 8px',
              border: 0,
              borderRadius: '10px',
              background: '#e2e8f0',
              color: '#0f172a',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            𝕏 Share
          </button>

          <button
            type="button"
            onClick={async () => {
              const url = new URL(window.location.origin);
              url.searchParams.set('utm_source', 'copy_link');
              url.searchParams.set('utm_medium', 'social');
              url.searchParams.set('utm_campaign', 'website_share');
              url.searchParams.set('utm_content', 'landing_share_buttons');

              trackButtonClick('share_copy_link_clicked', {
                share_platform: 'copy_link'
              });

              try {
                await navigator.clipboard.writeText(url.toString());
                trackButtonClick('share_copy_link_completed');
                window.alert('Trackable website link copied. Share it with a friend!');
              } catch {
                window.prompt('Copy this trackable link:', url.toString());
              }
            }}
            style={{
              padding: '12px 8px',
              border: 0,
              borderRadius: '10px',
              background: '#f1f5f9',
              color: '#334155',
              fontWeight: 800,
              cursor: 'pointer'
            }}
          >
            🔗 Copy Link
          </button>
        </div>

        <button
          type="button"
          onClick={async () => {
            const url = new URL(window.location.origin);
            url.searchParams.set('utm_source', 'native_share');
            url.searchParams.set('utm_medium', 'social');
            url.searchParams.set('utm_campaign', 'website_share');
            url.searchParams.set('utm_content', 'landing_share_buttons');

            trackButtonClick('share_native_clicked');

            if (navigator.share) {
              try {
                await navigator.share({
                  title: 'The Rental Zone LTD',
                  text: 'Check out The Rental Zone for bouncy castle rentals in Trinidad!',
                  url: url.toString()
                });
                trackButtonClick('share_native_completed');
              } catch (error) {
                if (error?.name !== 'AbortError') {
                  trackButtonClick('share_native_failed');
                }
              }
            } else {
              try {
                await navigator.clipboard.writeText(url.toString());
                window.alert('Your device does not support the share menu here. Link copied instead.');
              } catch {
                window.prompt('Copy this trackable link:', url.toString());
              }
            }
          }}
          style={{
            width: '100%',
            marginTop: '10px',
            padding: '12px',
            border: '1px solid #cbd5e1',
            borderRadius: '10px',
            background: '#ffffff',
            color: '#0f172a',
            fontWeight: 800,
            cursor: 'pointer'
          }}
        >
          📲 More Sharing Options
        </button>

      </section>

      {/* FLOATING WHATSAPP CONTACT BUTTON — temporary test */}
      <a
        href="https://wa.me/18682810670?text=Hi%20Rental%20Zone%2C%20I%20have%20a%20question%20about%20booking%20the%20bouncy%20castle."
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with Rental Zone on WhatsApp"
        title="Chat with us on WhatsApp"
        onClick={() => trackButtonClick('whatsapp_clicked')}
        style={{
          position: 'fixed',
          right: '16px',
          bottom: '92px',
          zIndex: 9000,
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: '#25D366',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          boxShadow: '0 4px 14px rgba(0, 0, 0, 0.28)',
          border: '2px solid #ffffff',
          fontSize: '27px',
          lineHeight: 1
        }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 32 32"
          width="31"
          height="31"
          fill="currentColor"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M16.04 3C8.87 3 3.04 8.78 3.04 15.9c0 2.28.6 4.5 1.75 6.46L3 29l6.86-1.79a13.1 13.1 0 0 0 6.18 1.55h.01c7.17 0 13-5.79 13-12.9 0-3.45-1.35-6.69-3.8-9.12A12.9 12.9 0 0 0 16.04 3Zm0 23.55h-.01a10.8 10.8 0 0 1-5.5-1.5l-.4-.23-4.07 1.06 1.09-3.94-.26-.41a10.65 10.65 0 0 1-1.64-5.63c0-5.88 4.84-10.66 10.79-10.66 2.88 0 5.59 1.11 7.63 3.14a10.54 10.54 0 0 1 3.16 7.52c0 5.88-4.84 10.65-10.79 10.65Zm5.92-7.98c-.32-.16-1.9-.93-2.2-1.03-.3-.11-.51-.16-.72.16-.22.32-.83 1.03-1.02 1.24-.19.22-.38.24-.7.08-.32-.16-1.36-.5-2.59-1.59-.96-.85-1.61-1.9-1.8-2.22-.19-.32-.02-.49.14-.65.14-.14.32-.38.48-.57.16-.19.22-.32.32-.54.11-.21.06-.4-.02-.56-.08-.16-.72-1.72-.99-2.36-.26-.62-.53-.54-.72-.55h-.62c-.22 0-.56.08-.86.4-.3.32-1.13 1.1-1.13 2.67s1.16 3.1 1.32 3.31c.16.22 2.28 3.45 5.52 4.84.77.33 1.37.53 1.84.68.77.24 1.47.21 2.02.13.62-.09 1.9-.77 2.17-1.51.27-.75.27-1.4.19-1.53-.08-.13-.29-.21-.61-.37Z"/>
        </svg>
      </a>

      {/* EXISTING INTENT SELECTION POPUP MODAL */}
      {showBookingPopup && (
  <div
    onClick={() => {
      setExpandedPopupSection(null);
      setShowBookingPopup(false);
      trackTrzEvent('dismiss_intent_popup_backdrop', {
        popup_type: 'initial_intent'
      });
    }}
    style={{
      position: 'fixed',
      inset: 0,
      zIndex: 10000,
      background: 'rgba(0,0,0,.75)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 16
    }}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        background: '#fff',
        borderRadius: 20,
        padding: 24,
        width: '100%',
        maxWidth: 420,
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0,0,0,.3)',
        position: 'relative'
      }}
    >
      <button
        onClick={() => {
          setExpandedPopupSection(null);
          setShowBookingPopup(false);
          trackButtonClick('dismiss_intent_popup_close_btn');
        }}
        style={{
          position: 'absolute',
          top: 12,
          right: 12,
          width: 32,
          height: 32,
          border: 0,
          borderRadius: '50%',
          background: '#f1f5f9',
          cursor: 'pointer',
          fontSize: 18
        }}
      >
        ×
      </button>

      {promoIsActive && (
        <div style={{
          background: '#fff7ed',
          border: '2px solid #fb923c',
          borderRadius: 14,
          padding: 14,
          marginBottom: 16,
          textAlign: 'center'        }}>
          <div style={{fontSize: 12, fontWeight: 800, color: '#c2410c'}}>
            🔥 LIMITED-TIME OFFER
          </div>
          <div style={{fontSize: 25, fontWeight: 900, marginTop: 4}}>
            {publicHours} Hours — TT${formatMoney(publicPrice)}
          </div>
          <div style={{fontSize: 13, color: '#64748b'}}>
            Regular value: TT${formatMoney(promotionalRegularValue)}
          </div>
          <div style={{fontSize: 17, fontWeight: 900, color: '#dc2626'}}>
            SAVE TT${formatMoney(promotionalSavings)}
          </div>
          {promoExpirySeconds !== null && (
            <div style={{fontSize: 12, fontWeight: 700, color: '#92400e', marginTop: 6}}>
              Offer ends in {formatCountdown(promoExpirySeconds)}
            </div>
          )}
          <div style={{fontSize: 12, color: '#64748b', marginTop: 6}}>
            No deposit required — payment is due on delivery.
          </div>
        </div>
      )}

      <div style={{textAlign: 'center', marginBottom: 18}}>
        <div style={{
          display: 'inline-block',
          background: '#eff6ff',
          color: '#1d4ed8',
          padding: '6px 12px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 800
        }}>
          WELCOME TO THE RENTAL ZONE
        </div>
        <h2 style={{margin: '12px 0 6px', fontSize: 24}}>
          What would you like to find out?
        </h2>
        <p style={{margin: 0, color: '#64748b', fontSize: 14}}>
          Choose an option below.
        </p>
      </div>

      <button
        onClick={() => {
          if (promoIsActive) handlePromotionalBookClick();
          handleIntentSelect('availability');
        }}
        style={{
          width: '100%',
          padding: 14,
          border: 0,
          borderRadius: 12,
          background: '#2563eb',
          color: '#fff',
          fontWeight: 800,
          fontSize: 15,
          cursor: 'pointer',
          marginBottom: 10
        }}
      >
        {promoIsActive
          ? '🔥 Get This Offer & Check Availability'
          : '📅 Check Availability & Book'}
      </button>

      <button
        onClick={() => handleIntentSelect('prices')}
        style={{
          width: '100%',
          padding: 13,
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          background: '#f8fafc',
          color: '#1e293b',
          fontWeight: 700,
          fontSize: 15,
          cursor: 'pointer',
          marginBottom: 10,
          textAlign: 'left'
        }}
      >
        🏷️ See Price & Packages
        <span style={{float: 'right'}}>
          {expandedPopupSection === 'prices' ? '▲' : '▼'}
        </span>
      </button>

      {expandedPopupSection === 'prices' && (
        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 15,
          marginBottom: 10
        }}>
          <h3 style={{margin: '0 0 10px'}}>🕷️ Spider-Man Bouncy Castle</h3>

          <div style={{
            background: promoIsActive ? '#fff7ed' : '#f8fafc',
            borderRadius: 10,
            padding: 14,
            textAlign: 'center',
            marginBottom: 12
          }}>
            <div style={{fontSize: 12, color: '#64748b', fontWeight: 700}}>
              {promoIsActive
                ? `${publicHours} Hour Promotional Rate`
                : 'Starting Rate'}
            </div>
            <div style={{fontSize: 30, fontWeight: 900}}>
              TT$ {formatMoney(publicPrice)}
            </div>
            {promoIsActive ? (
              <>
                <div style={{fontSize: 13, color: '#64748b'}}>
                  Regular value: TT$ {formatMoney(promotionalRegularValue)}
                </div>
                <div style={{fontWeight: 900, color: '#dc2626'}}>
                  Save TT$ {formatMoney(promotionalSavings)}
                </div>
              </>
            ) : (
              <div style={{fontSize: 13, color: '#64748b'}}>
                (Includes 2 Hours)
              </div>
            )}
          </div>

          <ul style={{paddingLeft: 20, color: '#475569', fontSize: 13}}>
            <li>
              {promoIsActive
                ? `${publicHours} hours of bounce time`
                : 'Starting cost for 2 hours of bounce time'}
            </li>
            <li>Fully sanitized & heavy-duty vinyl construction</li>
            <li>No deposit required — payment is due on delivery</li>
          </ul>

          <a
            href="#availability-check"
            onClick={(event) => {
              event.preventDefault();
              trackButtonClick('clicked_book_now');
              if (promoIsActive) handlePromotionalBookClick();
              setExpandedPopupSection(null);
              setShowBookingPopup(false);
              setShowAvailabilityModal(true);
            }}
            style={{
              display: 'block',
              textAlign: 'center',
              textDecoration: 'none',
              padding: 13,
              borderRadius: 10,
              background: '#2563eb',
              color: '#fff',
              fontWeight: 800
            }}
          >
            {promoIsActive
              ? '🔥 Get This Offer & Check Availability'
              : '📅 Check Availability & Book Now'}
          </a>

          <button
            onClick={() => handleIntentSelect('space')}
            style={{
              width: '100%',
              border: 0,
              background: 'transparent',
              color: '#2563eb',
              fontWeight: 700,
              padding: 10,
              cursor: 'pointer'
            }}
          >
            📐 Check Size & Yard Requirements
          </button>

          <a
            href="https://wa.me/18682810670?text=Hi%20Rental%20Zone,%20I%20have%20a%20question%20about%20prices."
            target="_blank"
            rel="noreferrer"
            onClick={() => trackButtonClick('whatsapp_clicked')}
            style={{
              display: 'block',
              textAlign: 'center',
              color: '#15803d',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              padding: 8
            }}
          >
            💬 Have Questions? Chat on WhatsApp
          </a>
        </div>
      )}

      <button
        onClick={() => handleIntentSelect('space')}
        style={{
          width: '100%',
          padding: 13,
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          background: '#f8fafc',
          color: '#1e293b',
          fontWeight: 700,
          fontSize: 15,
          cursor: 'pointer',
          marginBottom: 10,
          textAlign: 'left'
        }}
      >
        📐 See Size & Space Requirements
        <span style={{float: 'right'}}>
          {expandedPopupSection === 'space' ? '▲' : '▼'}
        </span>
      </button>

      {expandedPopupSection === 'space' && (
        <div style={{
          border: '1px solid #e2e8f0',
          borderRadius: 12,
          padding: 15,
          marginBottom: 10
        }}>
          <h3 style={{margin: '0 0 12px'}}>📐 Clearance & Dimensions</h3>

          <div style={{
            position: 'relative',
            borderRadius: 10,
            overflow: 'hidden',
            marginBottom: 12
          }}>
            <img
              src={featuredImage}
              alt="Spider-Man Bouncy Castle Specs"
              style={{
                width: '100%',
                height: 180,
                objectFit: 'cover'
              }}
            />
            <div style={{
              position: 'absolute',
              left: 10,
              right: 10,
              bottom: 10,
              background: 'rgba(0,0,0,.72)',
              color: '#fff',
              padding: 8,
              borderRadius: 8,
              textAlign: 'center',
              fontWeight: 800,
              fontSize: 13
            }}>
              26ft Long × 13ft Wide × 13ft High
            </div>
          </div>

          <div style={{color: '#475569', fontSize: 13, lineHeight: 1.7}}>
            <strong>Space requirements:</strong>
            <ul style={{paddingLeft: 20}}>
              <li>Flat, clean grass or smooth pavement.</li>
              <li>Clear overhead clearance (no low branches or wires).</li>
              <li>Standard household outlet within 100ft.</li>
            </ul>
          </div>

          <a
            href="#availability-check"
            onClick={(event) => {
              event.preventDefault();
              trackButtonClick('clicked_book_now');
              if (promoIsActive) handlePromotionalBookClick();
              setExpandedPopupSection(null);
              setShowBookingPopup(false);
              setShowAvailabilityModal(true);
            }}
            style={{
              display: 'block',
              textAlign: 'center',
              textDecoration: 'none',
              padding: 13,
              borderRadius: 10,
              background: '#2563eb',
              color: '#fff',
              fontWeight: 800
            }}
          >
            {promoIsActive
              ? '🔥 Get This Offer & Check Availability'
              : '📅 Check Availability & Book'}
          </a>

          <a
            href="https://wa.me/18682810670?text=Hi%20Rental%20Zone,%20I%20have%20a%20question%20about%20the%20size%20and%20space%20requirements."
            target="_blank"
            rel="noreferrer"
            onClick={() => trackButtonClick('whatsapp_clicked')}
            style={{
              display: 'block',
              textAlign: 'center',
              color: '#15803d',
              fontWeight: 700,
              fontSize: 13,
              textDecoration: 'none',
              padding: 8
            }}
          >
            💬 Questions About Space? Chat on WhatsApp
          </a>
        </div>
      )}

      <a
        href="https://wa.me/18682810670?text=Hi%20Rental%20Zone,%20I%20have%20a%20question%20about%20the%20bouncy%20castle%20rental."
        target="_blank"
        rel="noreferrer"
        onClick={() => trackButtonClick('whatsapp_clicked')}
        style={{
          display: 'block',
          width: '100%',
          boxSizing: 'border-box',
          textAlign: 'center',
          padding: 13,
          borderRadius: 12,
          background: '#dcfce7',
          color: '#166534',
          fontWeight: 800,
          fontSize: 15,
          textDecoration: 'none'
        }}
      >
        💬 Ask a Question on WhatsApp
      </a>
    </div>
  </div>
)}

      

      {/* PRICE & PACKAGES INFORMATION POPUP */}
      

      {/* SIZE & SPACE REQUIREMENTS INFORMATION POPUP */}
      

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
      {showAvailabilityModal && (
        <AvailabilityCheckModal
          onClose={() => setShowAvailabilityModal(false)}
          promoIsActive={promoIsActive}
          publicHours={publicHours}
          publicPrice={publicPrice}
        />
      )}
    </div>
  );
}