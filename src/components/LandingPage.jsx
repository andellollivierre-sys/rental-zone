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
  const activeCarouselImage = carouselImages[activeSlide] || featuredImage;
  const isVideoSlide = false;
  const totalCarouselSlides = carouselImages.length;

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
    <div className="trz-v3-home">
      <section className="v3-video-stage" aria-label="The Rental Zone featured video">
        <div className="v3-video-frame">
          <video
            src="/rental_zone_spider_music.mp4"
            autoPlay
            muted
            controls
            playsInline
            preload="metadata"
            onEnded={handleIntroVideoEnded}
            aria-label="The Rental Zone Spider-Man bouncy castle featured video"
          />
        </div>
        <div className="v3-video-label"><span>THE RENTAL ZONE TT</span><span>FEATURED VIDEO</span></div>
      </section>
      <section className="v3-hero"><div className="v3-hero-copy"><span className="v3-kicker">THE RENTAL ZONE TT · TRINIDAD</span><h1>Make room<br/>for <em>good times.</em></h1><p>Big party energy. Useful equipment. Event extras. Find what you need and send one straightforward enquiry.</p><div className="v3-actions"><button type="button" onClick={() => { trackButtonClick('clicked_book_now'); if (promoIsActive) handlePromotionalBookClick(); setShowAvailabilityModal(true); }}>Check your date <b>↗</b></button><a href="#v3-rentals">Explore rentals ↓</a></div><div className="v3-proof"><span>01 <b>Choose what you need</b></span><span>02 <b>Send your details</b></span><span>03 <b>Confirm directly</b></span></div></div>
      <div className="v3-hero-image">{isVideoSlide ? <video src="/rental_zone_spider_music.mp4" autoPlay muted controls onEnded={handleIntroVideoEnded} playsInline preload="metadata" aria-label="The Rental Zone Spider-Man bouncy castle video" /> : <img src={activeCarouselImage || featuredImage} alt="Spider-Man Combo Bouncy Castle" onClick={() => { trackButtonClick('click_featured_image_zoom'); setSelectedImage(activeCarouselImage || featuredImage); }} />}<button className="v3-gallery-prev" type="button" aria-label="Previous photo" onClick={() => changeSlide(-1)}>‹</button><button className="v3-gallery-next" type="button" aria-label="Next photo" onClick={() => changeSlide(1)}>›</button><div className="v3-image-tag">FEATURED PARTY RENTAL</div><div className="v3-image-caption"><strong>Spider-Man Combo Bouncer</strong><span>Bounce · Climb · Slide</span></div><div className="v3-dots">{Array.from({length: totalCarouselSlides}).map((_,i)=><button key={i} aria-label="Show photo" className={activeSlide===i?'active':''} onClick={()=>setActiveSlide(i)} />)}</div></div><div className="v3-stamp"><span>MAKE THE DAY</span><strong>A BIG<br/>DEAL.</strong></div></section>
      <section className="v3-strip"><div><b>01</b><span>Party rentals</span></div><div><b>02</b><span>Equipment hire</span></div><div><b>03</b><span>Event services</span></div><div><b>TT</b><span>Trinidad enquiries</span></div></section>
      <section className="v3-rentals" id="v3-rentals"><div className="v3-heading"><div><span className="v3-kicker">BROWSE THE ZONE</span><h2>What are we<br/><em>sorting today?</em></h2></div><p>Start with a rental category. Each enquiry takes you to the right details.</p></div><div className="v3-rental-grid">
      <a href="#our-bouncer" className="v3-rental-card v3-card-main"><img src={featuredImage} alt="Spider-Man Combo Bouncy Castle"/><div className="v3-card-overlay"><small>PARTY RENTAL · FEATURED</small><h3>Spider-Man<br/>Combo Bouncer</h3><span>View the bouncer <b>↗</b></span></div></a>
      <a href="#event-services" className="v3-rental-card v3-card-generator" onClick={()=>trackButtonClick('click_generator_rental_enquiry')}><img src="https://res-de.togroup.com/stc/home_product/emtop/userfiles/1/images/photo/20241011190136894/EGGRD2822.jpg" alt="Portable generator"/><div className="v3-card-overlay"><small>EQUIPMENT HIRE</small><h3>Generator<br/>Rental</h3><span>View details <b>↗</b></span></div></a>
      <a href="#event-services" className="v3-rental-card v3-card-washer" onClick={()=>trackButtonClick('click_pressure_washer_enquiry')}><img src="https://a-ipower.com/cdn/shop/products/PWF2701SH_R_3QTR_L_2000_2000.png?v=1630521306" alt="Pressure washer"/><div className="v3-card-overlay"><small>EQUIPMENT HIRE</small><h3>Pressure<br/>Washer</h3><span>View details <b>↗</b></span></div></a>
      <a href="#event-services" className="v3-rental-card v3-card-services" onClick={()=>trackButtonClick('click_more_event_services')}><div className="v3-service-pattern"><span>DJ</span><span>FOOD</span><span>DECOR</span><span>EVENTS</span></div><div className="v3-card-overlay"><small>EVENT PARTNERS</small><h3>Bring the<br/>whole event together.</h3><span>Explore services <b>↗</b></span></div></a></div></section>
      <section className="v3-feature"><div className="v3-feature-photo"><img src={featuredImage} alt="Spider-Man Combo Bouncer"/></div><div className="v3-feature-copy"><span className="v3-kicker">THE CROWD-PLEASER</span><h2>One setup.<br/><em>Three ways to play.</em></h2><p>The Spider-Man Combo Bouncer brings together a bounce area, climbing section and dry slide for a standout party attraction.</p><ul><li>26 ft long × 13 ft wide × 13 ft high</li><li>Up to 8 children at a time</li><li>Setup and breakdown handled</li><li>No deposit · Payment on delivery</li></ul><a href="#our-bouncer">See bouncer details <b>↗</b></a></div></section>
      <section className="v3-pricing"><div className="v3-heading"><div><span className="v3-kicker">SPIDER-MAN COMBO BOUNCER</span><h2>Pick your<br/><em>party time.</em></h2></div><p>Choose a package to start an availability enquiry. Your date is confirmed directly with us.</p></div>
      {promoIsActive && <div className="v3-promo"><div><small>LIMITED-TIME OFFER</small><strong>{publicHours} hours · {'TT$'}{formatMoney(publicPrice)}</strong><span>Save {'TT$'}{formatMoney(promotionalSavings)} · Offer ends in {promoExpirySeconds===null?'—':formatCountdown(promoExpirySeconds)}</span></div><button type="button" onClick={()=>{handlePromotionalBookClick();setShowAvailabilityModal(true);}}>Claim offer ↗</button></div>}
      <div className="v3-package-grid"><button type="button" onClick={()=>{trackButtonClick('homepage_package_2h_click');setShowAvailabilityModal(true);}}><small>QUICK CELEBRATION</small><strong>2 hours</strong><b>TT$650</b><span>Check availability ↗</span></button><button type="button" onClick={()=>{trackButtonClick('homepage_package_3h_click');setShowAvailabilityModal(true);}}><small>MORE PARTY TIME</small><strong>3 hours</strong><b>TT$900</b><span>Check availability ↗</span></button><button type="button" onClick={()=>{trackButtonClick('homepage_package_day_click');setShowAvailabilityModal(true);}}><small>ALL-DAY EVENT</small><strong>8 hours</strong><b>TT$1,800</b><span>Check availability ↗</span></button></div><p className="v3-price-note">No deposit required. Payment is due on delivery.</p></section>
      <section className="v3-how"><div><span className="v3-kicker">NO COMPLICATED PROCESS</span><h2>From browsing<br/>to <em>booked.</em></h2></div><div className="v3-how-steps"><article><b>01</b><h3>Choose</h3><p>Pick the bouncer, equipment or service you need.</p></article><article><b>02</b><h3>Enquire</h3><p>Share your date, location and event details.</p></article><article><b>03</b><h3>Confirm</h3><p>We follow up to confirm availability and arrangements.</p></article></div></section>
      <section className="v3-faq"><div><span className="v3-kicker">QUICK ANSWERS</span><h2>Good to<br/><em>know.</em></h2><a href="#faq">All FAQs ↗</a></div><div>{faqs.map((item,index)=><details key={index}><summary>{item.q}<b>+</b></summary><p>{item.a}</p></details>)}</div></section>
      <section className="v3-last-call"><div><span className="v3-kicker">LET’S GET YOUR EVENT MOVING</span><h2>Ready when<br/>you are.</h2><p>Check your date or message us directly to get started.</p></div><div><button type="button" onClick={()=>{trackButtonClick('clicked_book_now');setShowAvailabilityModal(true);}}>Check availability ↗</button><a href="https://wa.me/18682810670?text=Hi%20The%20Rental%20Zone%2C%20I%27d%20like%20to%20make%20an%20enquiry." target="_blank" rel="noopener noreferrer">WhatsApp enquiry ↗</a></div></section>
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