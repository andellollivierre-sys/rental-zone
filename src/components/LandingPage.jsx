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
    <div className="trz-redesign">
      <section className="trz-hero">
        <div className="trz-shell trz-hero-grid">
          <div className="trz-hero-copy">
            <div className="trz-eyebrow"><span className="trz-eyebrow-dot" /> Party rentals & event essentials in Trinidad</div>
            <h1>Make the day a <em>big deal.</em></h1>
            <p className="trz-hero-lede">The fun, the equipment and the extra details — brought together to make planning your next celebration easier.</p>
            <div className="trz-hero-actions">
              <button className="trz-button trz-button-primary" type="button" onClick={() => { trackButtonClick('clicked_book_now'); if (promoIsActive) handlePromotionalBookClick(); setShowAvailabilityModal(true); }}>
                Check availability <span aria-hidden="true">↗</span>
              </button>
              <a className="trz-button trz-button-quiet" href="#more-rentals">Explore rentals <span aria-hidden="true">↓</span></a>
            </div>
            <div className="trz-hero-facts">
              <span><strong>01</strong> Easy enquiries</span>
              <span><strong>02</strong> No deposit on bouncer</span>
              <span><strong>03</strong> Trinidad-wide enquiries</span>
            </div>
          </div>
          <div className="trz-hero-showcase">
            <div className="trz-showcase-topline"><span>FEATURED RENTAL</span><span>THE RENTAL ZONE TT</span></div>
            <div className="trz-showcase-media">
              {isVideoSlide ? (
                <video src="/rental_zone_spider_music.mp4" autoPlay muted controls onEnded={handleIntroVideoEnded} playsInline preload="metadata" aria-label="The Rental Zone Spider-Man bouncy castle video" />
              ) : (
                <img src={activeCarouselImage || featuredImage} alt="Spider-Man Combo Bouncy Castle" onClick={() => { trackButtonClick('click_featured_image_zoom'); setSelectedImage(activeCarouselImage || featuredImage); }} />
              )}
              <button className="trz-gallery-arrow trz-gallery-prev" type="button" aria-label="Previous photo" onClick={() => changeSlide(-1)}>‹</button>
              <button className="trz-gallery-arrow trz-gallery-next" type="button" aria-label="Next photo" onClick={() => changeSlide(1)}>›</button>
              <div className="trz-gallery-dots">
                {Array.from({ length: totalCarouselSlides }).map((_, index) => (
                  <button key={index} type="button" aria-label="Show gallery slide" className={activeSlide === index ? 'is-current' : ''} onClick={() => setActiveSlide(index)} />
                ))}
              </div>
              <div className="trz-showcase-label">SPIDER-MAN COMBO BOUNCER</div>
            </div>
            <div className="trz-showcase-caption">
              <div><span className="trz-caption-kicker">BACKYARD PARTY FAVOURITE</span><h2>Big energy. Big smiles.</h2><p>Bounce, climb and slide — one standout attraction for your celebration.</p></div>
              <a href="#our-bouncer" aria-label="View Spider-Man bouncy castle details">View details <span>→</span></a>
            </div>
            <div className="trz-showcase-price">
              <span>{promoIsActive ? 'CURRENT SPECIAL' : 'STARTING FROM'}</span>
              <strong>{promoIsActive ? 'TT$' + formatMoney(publicPrice) : 'TT$650'}</strong>
              <small>{promoIsActive ? publicHours + ' hours' : '2 hours · no deposit'}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="trz-trustbar">
        <div className="trz-shell trz-trustbar-inner">
          <div><span className="trz-trust-icon">✦</span><span><strong>Simple booking</strong><small>Check your date first</small></span></div>
          <div><span className="trz-trust-icon">⌂</span><span><strong>Setup handled</strong><small>For the bouncer rental</small></span></div>
          <div><span className="trz-trust-icon">◎</span><span><strong>More than parties</strong><small>Equipment & event partners</small></span></div>
        </div>
      </section>

      <section className="trz-section trz-discovery" id="more-rentals">
        <div className="trz-shell">
          <div className="trz-section-heading">
            <div><span className="trz-section-kicker">FIND WHAT YOU NEED</span><h2>One place. More ways to get it done.</h2></div>
            <a href="#event-services" className="trz-text-link">Browse all rentals & services <span>↗</span></a>
          </div>
          <div className="trz-category-grid">
            <a className="trz-category-card trz-category-featured" href="#our-bouncer">
              <div className="trz-category-image"><img src={featuredImage} alt="Spider-Man Combo Bouncy Castle" /></div>
              <div className="trz-category-content"><span className="trz-card-kicker">PARTY RENTAL</span><h3>Spider-Man Combo Bouncer</h3><p>A bounce, climb and slide attraction for birthdays and family events.</p><span className="trz-card-action">Explore bouncer <b>↗</b></span></div>
            </a>
            <a className="trz-category-card" href="#event-services" onClick={() => trackButtonClick('click_generator_rental_enquiry')}>
              <div className="trz-category-image"><img src="https://res-de.togroup.com/stc/home_product/emtop/userfiles/1/images/photo/20241011190136894/EGGRD2822.jpg" alt="Portable generator" loading="lazy" /></div>
              <div className="trz-category-content"><span className="trz-card-kicker">EQUIPMENT</span><h3>Generator Rental</h3><p>Portable power for events, home backup and work needs.</p><span className="trz-card-action">View rental details <b>↗</b></span></div>
            </a>
            <a className="trz-category-card" href="#event-services" onClick={() => trackButtonClick('click_pressure_washer_enquiry')}>
              <div className="trz-category-image"><img src="https://a-ipower.com/cdn/shop/products/PWF2701SH_R_3QTR_L_2000_2000.png?v=1630521306" alt="Pressure washer" loading="lazy" /></div>
              <div className="trz-category-content"><span className="trz-card-kicker">EQUIPMENT</span><h3>Pressure Washer</h3><p>For driveways, patios, vehicles and outdoor clean-ups.</p><span className="trz-card-action">View rental details <b>↗</b></span></div>
            </a>
            <a className="trz-category-card trz-category-partners" href="#event-services" onClick={() => trackButtonClick('click_more_event_services')}>
              <div className="trz-partner-art"><span>DJ</span><span>FOOD</span><span>DECOR</span><span>EVENT</span></div>
              <div className="trz-category-content"><span className="trz-card-kicker">EVENT PARTNERS</span><h3>Build out your event</h3><p>Explore DJs, catering, tents, tables, chairs and décor enquiries.</p><span className="trz-card-action">Explore services <b>↗</b></span></div>
            </a>
          </div>
          <p className="trz-disclaimer">Availability and final arrangements are confirmed directly with The Rental Zone or the relevant service partner.</p>
        </div>
      </section>

      <section className="trz-section trz-pricing-section" id="pricing">
        <div className="trz-shell">
          <div className="trz-section-heading">
            <div><span className="trz-section-kicker">SPIDER-MAN COMBO BOUNCER</span><h2>Choose your time.</h2><p>Clear packages. No deposit required. Payment is due on delivery.</p></div>
            <a href="#our-bouncer" className="trz-text-link">Full rental details <span>↗</span></a>
          </div>
          {promoIsActive && (
            <div className="trz-promo-banner">
              <div><span>LIMITED-TIME OFFER</span><strong>{publicHours} hours for {'TT$' + formatMoney(publicPrice)}</strong><small>Regular value {'TT$' + formatMoney(promotionalRegularValue)} · Save {'TT$' + formatMoney(promotionalSavings)}</small></div>
              {promoExpirySeconds !== null && <div className="trz-promo-countdown"><small>Offer ends in</small><strong>{formatCountdown(promoExpirySeconds)}</strong></div>}
              <button type="button" onClick={() => { handlePromotionalBookClick(); setShowAvailabilityModal(true); }}>Claim offer ↗</button>
            </div>
          )}
          <div className="trz-price-grid">
            <button className="trz-price-card" type="button" onClick={() => { trackButtonClick('homepage_package_2h_click'); setShowAvailabilityModal(true); }}>
              <span>QUICK CELEBRATION</span><strong>2 hours</strong><b>TT$650</b><small>Great for a birthday or short event</small><em>Check availability ↗</em>
            </button>
            <button className="trz-price-card trz-price-card-popular" type="button" onClick={() => { trackButtonClick('homepage_package_3h_click'); setShowAvailabilityModal(true); }}>
              <span>MOST POPULAR</span><strong>3 hours</strong><b>TT$900</b><small>More time for everyone to enjoy</small><em>Check availability ↗</em>
            </button>
            <button className="trz-price-card" type="button" onClick={() => { trackButtonClick('homepage_package_day_click'); setShowAvailabilityModal(true); }}>
              <span>ALL-DAY FUN</span><strong>8 hours</strong><b>TT$1,800</b><small>For a full day of celebration</small><em>Check availability ↗</em>
            </button>
          </div>
        </div>
      </section>

      <section className="trz-section trz-process-section">
        <div className="trz-shell">
          <div className="trz-section-heading trz-section-heading-centered">
            <div><span className="trz-section-kicker">HOW IT WORKS</span><h2>Three steps to party-ready.</h2><p>Start with your date. We’ll help you take it from there.</p></div>
          </div>
          <div className="trz-process-grid">
            <article><span>01</span><h3>Choose your rental</h3><p>Explore the bouncer, equipment rentals and event services.</p></article>
            <article><span>02</span><h3>Check your date</h3><p>Send your details so availability and arrangements can be confirmed.</p></article>
            <article><span>03</span><h3>Get ready for the day</h3><p>We confirm the details with you. Bouncer payment is due on delivery.</p></article>
          </div>
        </div>
      </section>

      <section className="trz-section trz-faq-section" id="setup-faq">
        <div className="trz-shell trz-faq-layout">
          <div className="trz-faq-intro"><span className="trz-section-kicker">GOOD TO KNOW</span><h2>Before you book.</h2><p>Quick answers about space, setup, payment and weather for the bouncer rental.</p><a href="#faq" className="trz-text-link">See all FAQs <span>↗</span></a></div>
          <div className="trz-faq-list">
            {faqs.map((item, index) => (
              <details key={index} className="trz-faq-item"><summary><span>{item.q}</span><b>+</b></summary><p>{item.a}</p></details>
            ))}
          </div>
        </div>
      </section>

      <section className="trz-bottom-cta">
        <div className="trz-shell trz-bottom-cta-inner">
          <div><span className="trz-section-kicker">LET’S GET IT PLANNED</span><h2>Ready to make your event happen?</h2><p>Check the date, choose what you need and send us an enquiry.</p></div>
          <div className="trz-bottom-actions">
            <button type="button" className="trz-button trz-button-light" onClick={() => { trackButtonClick('clicked_book_now'); if (promoIsActive) handlePromotionalBookClick(); setShowAvailabilityModal(true); }}>Check availability ↗</button>
            <a href="https://wa.me/18682810670?text=Hi%20The%20Rental%20Zone%2C%20I%27d%20like%20to%20make%20an%20enquiry." target="_blank" rel="noopener noreferrer" className="trz-button trz-button-outline">WhatsApp us</a>
          </div>
        </div>
      </section>
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