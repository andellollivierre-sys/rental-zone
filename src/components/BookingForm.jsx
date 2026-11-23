import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { trackTrzEvent, createPageTimer } from '../utils/trzTracker';

// Keep your existing Discord webhook URL in this constant.
const DISCORD_WEBHOOK_URL = 'https://discord.com/api/webhooks/1551792830639382571/dxVXhU-U6CJxCGdUfBypOxjy3uOPK1mjismTZgLGNP3kyGPuh0Dn3YAlgmjcFLtHcXpU';

export default function BookingForm() {
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    event_date: '',
    start_time: '',
    package_type: '3_hours',
    address: '',
    notes: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [bookedSlots, setBookedSlots] = useState([]);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const [promotionalOffer, setPromotionalOffer] = useState(null);
  const [loadingPromotion, setLoadingPromotion] = useState(true);

  const pageTimerRef = useRef(null);
  const pageExitTrackedRef = useRef(false);

  const packages = {
    '2_hours': {
      name: '2 Hours',
      hours: 2,
      price: 650,
      deposit: 0
    },
    '3_hours': {
      name: '3 Hours',
      hours: 3,
      price: 900,
      deposit: 0,
      oldPrice: 975,
      savings: 'SAVE TT$75',
      badge: '🔥 Most Popular'
    },
    'full_day': {
      name: 'Full Day / 8 Hours',
      hours: 8,
      price: 1800,
      deposit: 0,
      oldPrice: 2600,
      savings: 'SAVE TT$800'
    }
  };

  // ---------------------------------------------------------------------------
  // TRZ CHECKPOINT
  // ---------------------------------------------------------------------------
  // PROMOTION IMPLEMENTATION
  // -------------------------
  // Admin promotion control: COMPLETE
  // LandingPage promotion display: COMPLETE
  // Dynamic savings: COMPLETE
  // Actual offer expiry countdown: COMPLETE
  // Promotional popup / intent flag: COMPLETE
  // Deposit removed from LandingPage: COMPLETE
  // BookingForm promotional package: COMPLETE
  // BookingForm promotion validation: COMPLETE
  // Promotional booking tagging: COMPLETE
  // Payment-on-delivery messaging: COMPLETE
  //
  // CURRENT STEP:
  // End-to-end ON → LandingPage → BookingForm → booking → admin verification
  //
  // NOT YET VERIFIED:
  // Full production test with an active promotion from Supabase.
  // ---------------------------------------------------------------------------

  const isPromotionActive = (offer) => {
    if (!offer) return false;
    if (offer.offer_active !== true) return false;

    if (!offer.offer_ends_at) return true;

    const expiryTime = new Date(
      offer.offer_ends_at
    ).getTime();

    return (
      Number.isFinite(expiryTime) &&
      expiryTime > Date.now()
    );
  };

  const buildPromotionPackage = (offer) => {
    if (!isPromotionActive(offer)) return null;

    const offerPrice = Number(offer.offer_price);
    const offerHours = Number(offer.offer_hours);

    if (
      !Number.isFinite(offerPrice) ||
      offerPrice <= 0 ||
      !Number.isFinite(offerHours) ||
      offerHours <= 0
    ) {
      return null;
    }

    const regularHourlyRate =
      packages['2_hours'].price / packages['2_hours'].hours;

    const regularValue = regularHourlyRate * offerHours;
    const savings = Math.max(
      0,
      regularValue - offerPrice
    );

    return {
      name: `Promotion - ${offerHours} Hours`,
      hours: offerHours,
      price: offerPrice,
      deposit: 0,
      isPromotional: true,
      offerId: offer.id || null,
      regularValue,
      savings
    };
  };

  const fetchPromotionalOffer = async () => {
    try {
      setLoadingPromotion(true);

      const { data, error } = await supabase
        .from('promotional_offers')
        .select('*')
        .order('id', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error(
          'Error loading promotional offer:',
          error
        );

        setPromotionalOffer(null);
        return null;
      }

      if (!isPromotionActive(data)) {
        setPromotionalOffer(null);
        return null;
      }

      setPromotionalOffer(data);
      return data;
    } catch (err) {
      console.error(
        'Unexpected promotional offer error:',
        err
      );

      setPromotionalOffer(null);
      return null;
    } finally {
      setLoadingPromotion(false);
    }
  };

  const promotionPackage =
    buildPromotionPackage(promotionalOffer);

  const availablePackages = {
    ...packages,
    ...(promotionPackage
      ? { promotion: promotionPackage }
      : {})
  };

  // Load active promotion and consume the LandingPage promo intent.
  useEffect(() => {
    const initializePromotion = async () => {
      const offer = await fetchPromotionalOffer();

      const promoIntent =
        sessionStorage.getItem('trz_promo_intent') ===
        'true';

      if (
        promoIntent &&
        isPromotionActive(offer)
      ) {
        setFormData((prev) => ({
          ...prev,
          package_type: 'promotion'
        }));

        trackTrzEvent('promo_booking_selected', {
          offer_price: Number(offer.offer_price),
          offer_hours: Number(offer.offer_hours)
        });

        sessionStorage.removeItem(
          'trz_promo_intent'
        );
      }
    };

    initializePromotion();
  }, []);

  // Track booking-page view, booking-page duration, and preserve
  // the existing Discord page-view notification.
  useEffect(() => {
    const viewedBookingPage = sessionStorage.getItem(
      'trz_viewed_booking_page'
    );

    if (!viewedBookingPage) {
      sessionStorage.setItem(
        'trz_viewed_booking_page',
        'true'
      );

      trackTrzEvent('viewed_booking_page');
    }

    pageTimerRef.current = createPageTimer();

    const handlePageExit = () => {
      if (pageExitTrackedRef.current) return;

      pageExitTrackedRef.current = true;

      const duration = pageTimerRef.current
        ? pageTimerRef.current.getSeconds()
        : 0;

      trackTrzEvent('page_exit', {
        page_duration_seconds: duration
      });

      if (pageTimerRef.current) {
        pageTimerRef.current.cleanup();
      }
    };

    window.addEventListener(
      'pagehide',
      handlePageExit
    );

    const notifyDiscordOnView = async () => {
      try {
        if (!DISCORD_WEBHOOK_URL) return;

        // Prevent spamming Discord if the same visitor refreshes
        // the page multiple times in the same session.
        const alreadyAlerted = sessionStorage.getItem(
          'discord_booking_view_sent'
        );

        if (alreadyAlerted) return;

        sessionStorage.setItem(
          'discord_booking_view_sent',
          'true'
        );

        const discordMessage = {
          content:
            `👀 **A prospect just opened the Booking Form page!**`
        };

        await fetch(DISCORD_WEBHOOK_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(discordMessage)
        });
      } catch (err) {
        console.error(
          'Discord page-view ping failed:',
          err
        );
      }
    };

    notifyDiscordOnView();

    return () => {
      window.removeEventListener(
        'pagehide',
        handlePageExit
      );

      if (pageTimerRef.current) {
        pageTimerRef.current.cleanup();
      }
    };
  }, []);

  const trackBookingStarted = () => {
    try {
      const alreadyStarted = sessionStorage.getItem(
        'trz_booking_started'
      );

      if (alreadyStarted) return;

      sessionStorage.setItem(
        'trz_booking_started',
        'true'
      );

      trackTrzEvent('booking_started');
    } catch (err) {
      console.warn(
        '[TRZ TRACK] booking_started error:',
        err
      );
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    trackBookingStarted();

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (name === 'event_date' && value) {
      trackTrzEvent('date_selected');
    }
  };

  const handlePackageSelect = (pkgKey) => {
    const selectedPackage =
      availablePackages[pkgKey];

    if (!selectedPackage) return;

    trackBookingStarted();

    setFormData((prev) => ({
      ...prev,
      package_type: pkgKey
    }));

    trackTrzEvent('package_selected', {
      package_type: selectedPackage.name,
      is_promotional:
        selectedPackage.isPromotional || false,
      price: selectedPackage.price,
      hours: selectedPackage.hours
    });

    if (selectedPackage.isPromotional) {
      trackTrzEvent('promo_booking_selected', {
        offer_price: selectedPackage.price,
        offer_hours: selectedPackage.hours
      });
    }
  };

  useEffect(() => {
    if (!formData.event_date) {
      setBookedSlots([]);
      return;
    }

    const fetchConfirmedSlots = async () => {
      setCheckingAvailability(true);

      const { data, error } = await supabase
        .from('bookings')
        .select(
          'start_time, end_time, package_type'
        )
        .eq(
          'event_date',
          formData.event_date
        )
        .eq('status', 'Confirmed');

      if (!error && data) {
        setBookedSlots(data);
      } else {
        setBookedSlots([]);
      }

      setCheckingAvailability(false);
    };

    fetchConfirmedSlots();
  }, [formData.event_date]);

  const calculateEndTime = (
    startTime,
    hours
  ) => {
    if (!startTime) return '';

    const [h, m] = startTime
      .split(':')
      .map(Number);

    const totalMinutes =
      h * 60 +
      m +
      hours * 60;

    if (totalMinutes >= 1440) return null;

    const endH = Math.floor(
      totalMinutes / 60
    );

    const endM = totalMinutes % 60;

    return `${String(endH).padStart(
      2,
      '0'
    )}:${String(endM).padStart(2, '0')}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    trackBookingStarted();

    setSubmitting(true);
    setErrorMessage('');

    let selectedPkg =
      availablePackages[formData.package_type];

    if (!selectedPkg) {
      setErrorMessage(
        '❌ Please select a valid rental package.'
      );

      setSubmitting(false);
      return;
    }

    // Re-validate the promotion directly against Supabase
    // immediately before creating the booking.
    if (
      formData.package_type === 'promotion'
    ) {
      const latestOffer =
        await fetchPromotionalOffer();

      const latestPromotionPackage =
        buildPromotionPackage(
          latestOffer
        );

      if (!latestPromotionPackage) {
        setFormData((prev) => ({
          ...prev,
          package_type: '3_hours'
        }));

        trackTrzEvent(
          'promo_booking_expired',
          {
            attempted_package: 'promotion'
          }
        );

        setErrorMessage(
          '⚠️ This promotional offer has expired or is no longer active. We switched you back to the regular packages.'
        );

        setSubmitting(false);
        return;
      }

      selectedPkg =
        latestPromotionPackage;
    }

    const endTime = calculateEndTime(
      formData.start_time,
      selectedPkg.hours
    );

    if (!endTime) {
      setErrorMessage(
        '❌ This time slot crosses midnight. Please choose an earlier start time.'
      );

      setSubmitting(false);
      return;
    }

    const {
      data: conflictingBookings,
      error: checkError
    } = await supabase
      .from('bookings')
      .select('*')
      .eq(
        'event_date',
        formData.event_date
      )
      .eq('status', 'Confirmed');

    if (
      !checkError &&
      conflictingBookings
    ) {
      const hasConflict =
        conflictingBookings.some((b) => {
          return (
            formData.start_time <
              b.end_time &&
            endTime > b.start_time
          );
        });

      if (hasConflict) {
        setErrorMessage(
          '❌ The selected time slot conflicts with an already confirmed rental. Please choose another time.'
        );

        setSubmitting(false);
        return;
      }
    }

    // All packages are now payment-on-delivery.
    const balanceDue = selectedPkg.price;

    const isAdminOrDev =
      localStorage.getItem(
        'dev_mode'
      ) === 'true' ||
      localStorage.getItem(
        'is_admin'
      ) === 'true' ||
      window.location.hostname ===
        'localhost';

    let storedTracking = {};

    try {
      storedTracking =
        JSON.parse(
          sessionStorage.getItem(
            'trz_tracking'
          )
        ) || {};
    } catch (err) {
      storedTracking = {};
    }

    const urlParams =
      new URLSearchParams(
        window.location.search
      );

    const trafficSource =
      storedTracking.traffic_source ||
      urlParams.get('utm_source') ||
      'direct';

    const utmMedium =
      storedTracking.utm_medium ||
      urlParams.get('utm_medium') ||
      (urlParams.get('fbclid')
        ? 'social_ad'
        : 'none');

    const utmCampaign =
      storedTracking.utm_campaign ||
      urlParams.get('utm_campaign') ||
      'none';

    const clickId =
      storedTracking.click_id ||
      urlParams.get('fbclid') ||
      urlParams.get('gclid') ||
      null;

    const deviceType =
      /Mobi|Android/i.test(
        navigator.userAgent
      )
        ? 'Mobile'
        : 'Desktop';

    try {
      // Generate the booking ID client-side so tracking can attach
      // the exact booking without requiring a follow-up SELECT query.
      const bookingId =
        crypto.randomUUID
          ? crypto.randomUUID()
          : `booking_${Date.now()}_${Math.random()
              .toString(36)
              .substring(2, 10)}`;

      const isPromotional =
        selectedPkg.isPromotional === true;

      let bookingNotes =
        formData.notes || '';

      if (isPromotional) {
        const regularValue =
          selectedPkg.regularValue;

        const savings =
          selectedPkg.savings;

        const promotionNote =
          `[PROMOTIONAL OFFER: ${selectedPkg.hours} Hours for TT$${selectedPkg.price} | Normal value TT$${regularValue} | Savings TT$${savings}]`;

        bookingNotes =
          bookingNotes.trim()
            ? `${promotionNote}\n${bookingNotes.trim()}`
            : promotionNote;
      }

      const { error } =
        await supabase
          .from('bookings')
          .insert([
            {
              id: bookingId,
              customer_name:
                formData.customer_name,
              phone: formData.phone,
              event_date:
                formData.event_date,
              start_time:
                formData.start_time,
              end_time: endTime,
              package_type:
                selectedPkg.name,
              total_price:
                selectedPkg.price,
              deposit_amount: 0,
              balance_due:
                balanceDue,
              address:
                formData.address,
              notes: bookingNotes,
              status: 'Pending',
              traffic_source:
                trafficSource,
              utm_medium: utmMedium,
              utm_campaign:
                utmCampaign,
              click_id: clickId,
              device_type:
                deviceType,
              is_test:
                isAdminOrDev
            }
          ]);

      if (error) throw error;

      // Canonical booking funnel event.
      trackTrzEvent(
        'booking_submitted',
        {
          booking_id: bookingId,
          is_promotional:
            isPromotional,
          package_type:
            selectedPkg.name,
          price:
            selectedPkg.price,
          hours:
            selectedPkg.hours
        }
      );

      if (isPromotional) {
        trackTrzEvent(
          'promo_booking_submitted',
          {
            booking_id: bookingId,
            offer_price:
              selectedPkg.price,
            offer_hours:
              selectedPkg.hours,
            normal_value:
              selectedPkg.regularValue,
            savings:
              selectedPkg.savings
          }
        );
      }

      if (DISCORD_WEBHOOK_URL) {
        const discordMessage = {
          content:
            `🚨 **NEW BOOKING SUBMITTED!** ${
              isAdminOrDev
                ? '(TEST)'
                : ''
            }\n` +
            `👤 **Client:** ${formData.customer_name}\n` +
            `📞 **Phone:** ${formData.phone}\n` +
            `📍 **Address:** ${formData.address}\n` +
            `📅 **Date:** ${formData.event_date} (${formData.start_time} - ${endTime})\n` +
            `📦 **Package:** ${selectedPkg.name} (TT$${selectedPkg.price})\n` +
            `${
              isPromotional
                ? `🔥 **PROMOTION:** Normal value TT$${selectedPkg.regularValue} | Savings TT$${selectedPkg.savings}\n`
                : ''
            }` +
            `💵 **Payment:** Due on Delivery\n` +
            `🌐 **Source:** ${trafficSource}`
        };

        await fetch(
          DISCORD_WEBHOOK_URL,
          {
            method: 'POST',
            headers: {
              'Content-Type':
                'application/json'
            },
            body: JSON.stringify(
              discordMessage
            )
          }
        ).catch((err) =>
          console.error(
            'Discord webhook ping failed:',
            err
          )
        );
      }

      setConfirmedBooking({
        ...formData,
        booking_id: bookingId,
        end_time: endTime,
        packageName:
          selectedPkg.name,
        price:
          selectedPkg.price,
        deposit: 0,
        balance:
          balanceDue,
        isPromotional,
        promotionRegularValue:
          selectedPkg.regularValue ||
          null,
        promotionSavings:
          selectedPkg.savings ||
          null
      });

      setSubmitting(false);
    } catch (error) {
      console.error(
        'Error saving booking:',
        error.message
      );

      setErrorMessage(
        '❌ Failed to submit booking. Please try again.'
      );

      setSubmitting(false);
    }
  };

  const openWhatsApp = () => {
    if (!confirmedBooking) return;

    trackTrzEvent(
      'whatsapp_clicked',
      {
        booking_id:
          confirmedBooking.booking_id ||
          null,
        is_promotional:
          confirmedBooking.isPromotional ||
          false
      }
    );

    const whatsappNumber =
      '18682810670';

    const promotionLine =
      confirmedBooking.isPromotional
        ? `🔥 Promotional Offer: ${confirmedBooking.packageName}\n` +
          `💰 Promo Price: TT$${confirmedBooking.price}\n` +
          `📊 Normal Value: TT$${confirmedBooking.promotionRegularValue}\n` +
          `💸 Savings: TT$${confirmedBooking.promotionSavings}\n`
        : '';

    const textMessage =
      encodeURIComponent(
        `Hi Rental Zone! I just booked the Spider-Man Bouncy Castle.\n\n` +
          `👤 Name: ${confirmedBooking.customer_name}\n` +
          `📞 Phone: ${confirmedBooking.phone}\n` +
          `📅 Date: ${confirmedBooking.event_date}\n` +
          `⏰ Time: ${confirmedBooking.start_time} - ${confirmedBooking.end_time} (${confirmedBooking.packageName})\n` +
          promotionLine +
          `💰 Total: TT$${confirmedBooking.price}\n` +
          `💵 Payment: Due on Delivery\n` +
          `📍 Address: ${confirmedBooking.address}\n` +
          (confirmedBooking.notes
            ? `📝 Notes: ${confirmedBooking.notes}\n\n`
            : '\n') +
          `Please confirm my booking request.`
      );

    window.location.href =
      `https://wa.me/${whatsappNumber}?text=${textMessage}`;
  };

  const currentPkg =
    availablePackages[
      formData.package_type
    ] || packages['3_hours'];

  const computedEnd =
    calculateEndTime(
      formData.start_time,
      currentPkg.hours
    );

  if (confirmedBooking) {
    return (
      <div
        style={{
          padding: '30px 16px',
          maxWidth: '500px',
          margin: '0 auto',
          fontFamily:
            'system-ui, sans-serif'
        }}
      >
        <div
          style={{
            background: '#ffffff',
            padding: '24px',
            borderRadius: '16px',
            border:
              '1px solid #e2e8f0',
            boxShadow:
              '0 4px 6px -1px rgb(0 0 0 / 0.05)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontSize: '40px',
              marginBottom: '8px'
            }}
          >
            🎉
          </div>

          <h2
            style={{
              color: '#0f172a',
              margin:
                '0 0 6px 0',
              fontSize: '22px'
            }}
          >
            Booking Request Received!
          </h2>

          <p
            style={{
              color: '#64748b',
              fontSize: '13px',
              margin:
                '0 0 20px 0'
            }}
          >
            Your order is logged as
            Pending. We'll contact you
            to confirm the booking.
          </p>

          <div
            style={{
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              border:
                '1px solid #e2e8f0',
              textAlign: 'left',
              fontSize: '13px',
              color: '#334155',
              display: 'flex',
              flexDirection:
                'column',
              gap: '8px',
              marginBottom: '20px'
            }}
          >
            <div>
              👤 <b>Name:</b>{' '}
              {confirmedBooking.customer_name}
            </div>

            <div>
              📞 <b>Phone:</b>{' '}
              {confirmedBooking.phone}
            </div>

            <div>
              📅 <b>Date:</b>{' '}
              {confirmedBooking.event_date}
            </div>

            <div>
              ⏰ <b>Time:</b>{' '}
              {confirmedBooking.start_time} -{' '}
              {confirmedBooking.end_time}{' '}
              (
              {
                confirmedBooking.packageName
              }
              )
            </div>

            <div>
              📍 <b>Address:</b>{' '}
              {confirmedBooking.address}
            </div>

            {confirmedBooking.isPromotional && (
              <div
                style={{
                  background:
                    '#fff7ed',
                  border:
                    '1px solid #fed7aa',
                  padding: '10px',
                  borderRadius: '8px',
                  marginTop: '4px'
                }}
              >
                🔥 <b>Promotional Offer</b>
                <br />
                Normal Value: TT$
                {
                  confirmedBooking.promotionRegularValue
                }
                <br />
                Savings: TT$
                {
                  confirmedBooking.promotionSavings
                }
              </div>
            )}

            <div
              style={{
                borderTop:
                  '1px solid #e2e8f0',
                paddingTop: '8px',
                marginTop: '4px'
              }}
            >
              💰 <b>Total Price:</b>{' '}
              TT$
              {
                confirmedBooking.price
              }
              <br />
              💵 <b>Payment:</b>{' '}
              Due on Delivery
            </div>
          </div>

          <button
            onClick={openWhatsApp}
            style={{
              width: '100%',
              background: '#22c55e',
              color: 'white',
              border: 'none',
              padding: '14px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '15px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent:
                'center',
              gap: '8px',
              boxShadow:
                '0 2px 4px rgba(34,197,94,0.2)'
            }}
          >
            💬 Open WhatsApp to Send Booking
          </button>

          <button
            onClick={() =>
              setConfirmedBooking(null)
            }
            style={{
              background:
                'transparent',
              color: '#64748b',
              border: 'none',
              padding: '10px',
              marginTop: '12px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            ← Make another booking
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '30px 16px',
        maxWidth: '520px',
        margin: '0 auto',
        fontFamily:
          'system-ui, sans-serif'
      }}
    >
      <div
        style={{
          background: '#ffffff',
          padding: '24px',
          borderRadius: '16px',
          border:
            '1px solid #e2e8f0',
          boxShadow:
            '0 4px 6px -1px rgb(0 0 0 / 0.05)'
        }}
      >
        <div
          style={{
            textAlign: 'center',
            marginBottom: '20px'
          }}
        >
          <span
            style={{
              background: '#eff6ff',
              color: '#2563eb',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
          >
            Featured Inventory
          </span>

          <h2
            style={{
              color: '#0f172a',
              margin:
                '10px 0 4px 0',
              fontSize: '22px'
            }}
          >
            🕷️ Spider-Man Bouncy Castle
          </h2>

          <p
            style={{
              color: '#64748b',
              fontSize: '13px',
              margin: 0
            }}
          >
            Combination + Slide •
            26x13x13ft • Up to 8 Kids
          </p>
        </div>

        {errorMessage && (
          <div
            style={{
              background: '#fee2e2',
              color: '#991b1b',
              padding: '12px',
              borderRadius: '8px',
              marginBottom: '16px',
              fontSize: '13px'
            }}
          >
            {errorMessage}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection:
              'column',
            gap: '14px'
          }}
        >
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#334155',
                marginBottom: '4px'
              }}
            >
              Full Name
            </label>

            <input
              type="text"
              name="customer_name"
              value={
                formData.customer_name
              }
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border:
                  '1px solid #cbd5e1',
                fontSize: '14px'
              }}
              placeholder="John Doe"
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#334155',
                marginBottom: '4px'
              }}
            >
              WhatsApp Phone Number
            </label>

            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border:
                  '1px solid #cbd5e1',
                fontSize: '14px'
              }}
              placeholder="868-000-0000"
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#334155',
                marginBottom: '8px'
              }}
            >
              Select Rental Package
            </label>

            <div
              style={{
                display: 'flex',
                flexDirection:
                  'column',
                gap: '10px'
              }}
            >
              {promotionPackage && (
                <div
                  onClick={() =>
                    handlePackageSelect(
                      'promotion'
                    )
                  }
                  style={{
                    border:
                      formData.package_type ===
                      'promotion'
                        ? '2px solid #f97316'
                        : '1px solid #fed7aa',
                    background:
                      formData.package_type ===
                      'promotion'
                        ? '#fff7ed'
                        : '#ffffff',
                    padding:
                      '12px 16px',
                    borderRadius:
                      '10px',
                    cursor:
                      'pointer',
                    position:
                      'relative',
                    transition:
                      'all 0.2s'
                  }}
                >
                  <div
                    style={{
                      position:
                        'absolute',
                      top: '-10px',
                      right: '12px',
                      background:
                        '#f97316',
                      color:
                        'white',
                      fontSize:
                        '10px',
                      fontWeight:
                        'bold',
                      padding:
                        '2px 8px',
                      borderRadius:
                        '10px'
                    }}
                  >
                    🔥 LIMITED OFFER
                  </div>

                  <div
                    style={{
                      display:
                        'flex',
                      justifyContent:
                        'space-between',
                      alignItems:
                        'center',
                      gap: '12px'
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontWeight:
                            'bold',
                          color:
                            '#1e293b',
                          fontSize:
                            '14px'
                        }}
                      >
                        {promotionPackage.hours}{' '}
                        Hours Promotion
                      </div>

                      <div
                        style={{
                          fontSize:
                            '12px',
                          color:
                            '#c2410c',
                          fontWeight:
                            '600'
                        }}
                      >
                        SAVE TT$
                        {promotionPackage.savings}
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign:
                          'right'
                      }}
                    >
                      <div
                        style={{
                          fontSize:
                            '12px',
                          color:
                            '#94a3b8',
                          textDecoration:
                            'line-through'
                        }}
                      >
                        TT$
                        {
                          promotionPackage.regularValue
                        }
                      </div>

                      <div
                        style={{
                          fontWeight:
                            'bold',
                          color:
                            '#ea580c',
                          fontSize:
                            '18px'
                        }}
                      >
                        TT$
                        {
                          promotionPackage.price
                        }
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div
                onClick={() =>
                  handlePackageSelect(
                    '2_hours'
                  )
                }
                style={{
                  border:
                    formData.package_type ===
                    '2_hours'
                      ? '2px solid #2563eb'
                      : '1px solid #cbd5e1',
                  background:
                    formData.package_type ===
                    '2_hours'
                      ? '#eff6ff'
                      : '#ffffff',
                  padding:
                    '12px 16px',
                  borderRadius:
                    '10px',
                  cursor:
                    'pointer',
                  display:
                    'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                  transition:
                    'all 0.2s'
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight:
                        'bold',
                      color:
                        '#1e293b',
                      fontSize:
                        '14px'
                    }}
                  >
                    2 Hours Package
                  </div>

                  <div
                    style={{
                      fontSize:
                        '12px',
                      color:
                        '#64748b'
                    }}
                  >
                    Standard short party rental
                  </div>
                </div>

                <div
                  style={{
                    textAlign:
                      'right'
                  }}
                >
                  <div
                    style={{
                      fontWeight:
                        'bold',
                      color:
                        '#0f172a',
                      fontSize:
                        '16px'
                    }}
                  >
                    TT$650
                  </div>
                </div>
              </div>

              <div
                onClick={() =>
                  handlePackageSelect(
                    '3_hours'
                  )
                }
                style={{
                  border:
                    formData.package_type ===
                    '3_hours'
                      ? '2px solid #2563eb'
                      : '1px solid #cbd5e1',
                  background:
                    formData.package_type ===
                    '3_hours'
                      ? '#eff6ff'
                      : '#ffffff',
                  padding:
                    '12px 16px',
                  borderRadius:
                    '10px',
                  cursor:
                    'pointer',
                  position:
                    'relative',
                  transition:
                    'all 0.2s'
                }}
              >
                <div
                  style={{
                    position:
                      'absolute',
                    top: '-10px',
                    right: '12px',
                    background:
                      '#2563eb',
                    color:
                      'white',
                    fontSize:
                      '10px',
                    fontWeight:
                      'bold',
                    padding:
                      '2px 8px',
                    borderRadius:
                      '10px'
                  }}
                >
                  🔥 Most Popular
                </div>

                <div
                  style={{
                    display:
                      'flex',
                    justifyContent:
                      'space-between',
                    alignItems:
                      'center'
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontWeight:
                          'bold',
                        color:
                          '#1e293b',
                        fontSize:
                          '14px'
                      }}
                    >
                      3 Hours Package
                    </div>

                    <div
                      style={{
                        fontSize:
                          '12px',
                        color:
                          '#166534',
                        fontWeight:
                          '600'
                      }}
                    >
                      SAVE TT$75
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign:
                        'right'
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          '12px',
                        color:
                          '#94a3b8',
                        textDecoration:
                          'line-through'
                      }}
                    >
                      TT$975
                    </div>

                    <div
                      style={{
                        fontWeight:
                          'bold',
                        color:
                          '#2563eb',
                        fontSize:
                          '18px'
                      }}
                    >
                      TT$900
                    </div>
                  </div>
                </div>
              </div>

              <div
                onClick={() =>
                  handlePackageSelect(
                    'full_day'
                  )
                }
                style={{
                  border:
                    formData.package_type ===
                    'full_day'
                      ? '2px solid #2563eb'
                      : '1px solid #cbd5e1',
                  background:
                    formData.package_type ===
                    'full_day'
                      ? '#eff6ff'
                      : '#ffffff',
                  padding:
                    '12px 16px',
                  borderRadius:
                    '10px',
                  cursor:
                    'pointer',
                  display:
                    'flex',
                  justifyContent:
                    'space-between',
                  alignItems:
                    'center',
                  transition:
                    'all 0.2s'
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight:
                        'bold',
                      color:
                        '#1e293b',
                      fontSize:
                        '14px'
                    }}
                  >
                    Full Day / 8 Hours
                  </div>

                  <div
                    style={{
                      fontSize:
                        '12px',
                      color:
                        '#166534',
                      fontWeight:
                        '600'
                    }}
                  >
                    SAVE TT$800
                  </div>
                </div>

                <div
                  style={{
                    textAlign:
                      'right'
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        '12px',
                      color:
                        '#94a3b8',
                      textDecoration:
                        'line-through'
                    }}
                  >
                    TT$2,600
                  </div>

                  <div
                    style={{
                      fontWeight:
                        'bold',
                      color:
                        '#0f172a',
                      fontSize:
                        '16px'
                    }}
                  >
                    TT$1,800
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              display:
                'grid',
              gridTemplateColumns:
                '1fr 1fr',
              gap: '10px'
            }}
          >
            <div>
              <label
                style={{
                  display:
                    'block',
                  fontSize:
                    '12px',
                  fontWeight:
                    'bold',
                  color:
                    '#334155',
                  marginBottom:
                    '4px'
                }}
              >
                Event Date
              </label>

              <input
                type="date"
                name="event_date"
                value={
                  formData.event_date
                }
                onChange={
                  handleChange
                }
                required
                style={{
                  width:
                    '100%',
                  padding:
                    '10px',
                  borderRadius:
                    '8px',
                  border:
                    '1px solid #cbd5e1',
                  fontSize:
                    '14px'
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display:
                    'block',
                  fontSize:
                    '12px',
                  fontWeight:
                    'bold',
                  color:
                    '#334155',
                  marginBottom:
                    '4px'
                }}
              >
                Start Time
              </label>

              <input
                type="time"
                name="start_time"
                value={
                  formData.start_time
                }
                onChange={
                  handleChange
                }
                required
                style={{
                  width:
                    '100%',
                  padding:
                    '10px',
                  borderRadius:
                    '8px',
                  border:
                    '1px solid #cbd5e1',
                  fontSize:
                    '14px'
                }}
              />
            </div>
          </div>

          {formData.event_date && (
            <div
              style={{
                background:
                  '#f8fafc',
                padding:
                  '10px 12px',
                borderRadius:
                  '8px',
                border:
                  '1px solid #e2e8f0',
                fontSize:
                  '13px',
                color:
                  '#475569'
              }}
            >
              {checkingAvailability ? (
                <span>
                  Checking date availability...
                </span>
              ) : bookedSlots.length >
                0 ? (
                <div>
                  <span
                    style={{
                      color:
                        '#d97706',
                      fontWeight:
                        'bold'
                    }}
                  >
                    ⚠️ Note for{' '}
                    {
                      formData.event_date
                    }:
                  </span>

                  <div
                    style={{
                      marginTop:
                        '4px',
                      fontSize:
                        '12px'
                    }}
                  >
                    Already booked slots:{' '}
                    {bookedSlots.map(
                      (
                        slot,
                        idx
                      ) => (
                        <span
                          key={idx}
                          style={{
                            display:
                              'inline-block',
                            background:
                              '#fef3c7',
                            color:
                              '#b45309',
                            padding:
                              '2px 6px',
                            borderRadius:
                              '4px',
                            marginRight:
                              '4px',
                            marginTop:
                              '2px'
                          }}
                        >
                          {
                            slot.start_time
                          }{' '}
                          -{' '}
                          {
                            slot.end_time
                          }
                        </span>
                      )
                    )}
                  </div>
                </div>
              ) : (
                <span
                  style={{
                    color:
                      '#166534',
                    fontWeight:
                      'bold'
                  }}
                >
                  ✅ Selected date is
                  fully open! No
                  conflicting
                  bookings.
                </span>
              )}
            </div>
          )}

          {formData.start_time && (
            <div
              style={{
                background:
                  '#f8fafc',
                padding:
                  '10px 12px',
                borderRadius:
                  '8px',
                border:
                  '1px solid #e2e8f0',
                fontSize:
                  '13px',
                color:
                  '#475569',
                display:
                  'flex',
                justifyContent:
                  'space-between'
              }}
            >
              <span>
                Calculated End Time:{' '}
                <strong>
                  {computedEnd ||
                    'Invalid (Crosses Midnight)'}
                </strong>
              </span>

              <span>
                Total:{' '}
                <strong>
                  TT$
                  {
                    currentPkg.price
                  }
                </strong>
              </span>
            </div>
          )}

          <div>
            <label
              style={{
                display:
                  'block',
                fontSize:
                  '12px',
                fontWeight:
                  'bold',
                color:
                  '#334155',
                marginBottom:
                  '4px'
              }}
            >
              Delivery Address / Location
            </label>

            <input
              type="text"
              name="address"
              value={
                formData.address
              }
              onChange={
                handleChange
              }
              required
              style={{
                width:
                  '100%',
                padding:
                  '10px',
                borderRadius:
                  '8px',
                border:
                  '1px solid #cbd5e1',
                fontSize:
                  '14px'
              }}
              placeholder="Street address, area"
            />
          </div>

          <div>
            <label
              style={{
                display:
                  'block',
                fontSize:
                  '12px',
                fontWeight:
                  'bold',
                color:
                  '#334155',
                marginBottom:
                  '4px'
              }}
            >
              Notes (Optional)
            </label>

            <input
              type="text"
              name="notes"
              value={
                formData.notes
              }
              onChange={
                handleChange
              }
              style={{
                width:
                  '100%',
                padding:
                  '10px',
                borderRadius:
                  '8px',
                border:
                  '1px solid #cbd5e1',
                fontSize:
                  '14px'
              }}
              placeholder="Gate code, surface type, etc."
            />
          </div>

          <button
            type="submit"
            disabled={
              submitting ||
              loadingPromotion
            }
            style={{
              background:
                '#22c55e',
              color:
                'white',
              border:
                'none',
              padding:
                '12px',
              borderRadius:
                '8px',
              fontWeight:
                'bold',
              fontSize:
                '15px',
              cursor:
                submitting ||
                loadingPromotion
                  ? 'not-allowed'
                  : 'pointer',
              marginTop:
                '8px',
              display:
                'flex',
              alignItems:
                'center',
              justifyContent:
                'center',
              gap: '8px',
              opacity:
                submitting ||
                loadingPromotion
                  ? 0.7
                  : 1
            }}
          >
            {submitting
              ? 'Processing...'
              : '💬 Generate Booking & Receipt'}
          </button>

          <div
            style={{
              textAlign:
                'center',
              fontSize:
                '12px',
              color:
                '#64748b',
              marginTop:
                '-4px'
            }}
          >
            💵 Payment due on delivery.
          </div>
        </form>
      </div>
    </div>
  );
}
