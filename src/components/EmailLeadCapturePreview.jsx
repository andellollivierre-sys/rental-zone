import React, { useState } from 'react';

export default function EmailLeadCapturePreview() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [showPreviewNotice, setShowPreviewNotice] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowPreviewNotice(true);
  };

  return (
    <div className="trz-offer-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=Manrope:wght@500;600;700;800;900&display=swap');
        * { box-sizing: border-box; }
        .trz-offer-page {
          min-height: 100vh;
          padding: 0 0 28px;
          color: #17243a;
          background:
            radial-gradient(ellipse at 8% 4%, rgba(255, 174, 89, .18), transparent 32%),
            #f3f5f8;
          font-family: 'DM Sans', Arial, sans-serif;
        }
        .trz-offer-topline {
          height: 7px;
          background: linear-gradient(90deg, #f47721 0%, #ffb04f 52%, #f47721 100%);
        }
        .trz-offer-header {
          width: min(1180px, calc(100% - 48px));
          height: 86px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .trz-offer-logo { width: 184px; max-height: 62px; object-fit: contain; }
        .trz-offer-header-note {
          color: #59677d;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .12em;
          text-transform: uppercase;
        }
        .trz-offer-shell {
          width: min(1180px, calc(100% - 48px));
          min-height: 650px;
          margin: 12px auto 0;
          display: grid;
          grid-template-columns: 1.02fr .98fr;
          overflow: hidden;
          border-radius: 25px;
          background: #fff;
          box-shadow: 0 28px 75px rgba(25, 42, 68, .13);
          border: 1px solid rgba(255,255,255,.9);
        }
        .trz-offer-content {
          position: relative;
          padding: 54px 52px 42px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          background: linear-gradient(145deg, #fff 0%, #fffaf5 100%);
        }
        .trz-offer-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          width: fit-content;
          padding: 9px 13px;
          color: #9a4b13;
          background: #fff0e2;
          border: 1px solid #ffdec1;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: .1em;
          text-transform: uppercase;
        }
        .trz-offer-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f47721;
          box-shadow: 0 0 0 4px rgba(244,119,33,.13);
        }
        .trz-offer-title {
          margin: 24px 0 15px;
          max-width: 590px;
          color: #14223a;
          font-family: 'Manrope', 'DM Sans', sans-serif;
          font-size: clamp(39px, 4.4vw, 58px);
          line-height: 1.04;
          letter-spacing: -.055em;
          font-weight: 900;
        }
        .trz-offer-title em {
          color: #ed721d;
          font-style: normal;
          white-space: nowrap;
        }
        .trz-offer-description {
          max-width: 490px;
          margin: 0;
          color: #5d6b80;
          font-size: 16px;
          line-height: 1.7;
        }
        .trz-offer-pricebox {
          display: flex;
          align-items: center;
          gap: 19px;
          width: fit-content;
          margin: 27px 0 25px;
          padding: 17px 21px;
          border: 1px solid #f3e3d5;
          border-radius: 14px;
          background: #fff;
          box-shadow: 0 8px 22px rgba(70, 48, 26, .045);
        }
        .trz-offer-regular {
          color: #7c8798;
          font-size: 11px;
          font-weight: 700;
          line-height: 1.5;
          text-transform: uppercase;
          letter-spacing: .06em;
        }
        .trz-offer-regular s {
          display: block;
          color: #7a8493;
          font-size: 19px;
          font-weight: 700;
          text-decoration-thickness: 2px;
        }
        .trz-offer-divider { width: 1px; height: 42px; background: #e8eaf0; }
        .trz-offer-special small {
          display: block;
          color: #637086;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .07em;
          text-transform: uppercase;
        }
        .trz-offer-special strong {
          display: block;
          margin-top: 1px;
          color: #14223a;
          font-family: 'Manrope', sans-serif;
          font-size: 35px;
          font-weight: 900;
          letter-spacing: -.06em;
          line-height: 1.1;
        }
        .trz-offer-save {
          align-self: center;
          padding: 8px 10px;
          color: #17623c;
          background: #e8f7ed;
          border: 1px solid #d1efdc;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 900;
          white-space: nowrap;
        }
        .trz-offer-form {
          max-width: 520px;
          padding-top: 2px;
        }
        .trz-offer-form h2 {
          margin: 0 0 5px;
          color: #17243a;
          font-family: 'Manrope', sans-serif;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: -.03em;
        }
        .trz-offer-form-intro {
          margin: 0 0 16px;
          color: #748095;
          font-size: 13px;
          line-height: 1.5;
        }
        .trz-offer-label {
          display: block;
          margin: 0 0 7px;
          color: #344158;
          font-size: 12px;
          font-weight: 800;
        }
        .trz-offer-input {
          display: block;
          width: 100%;
          height: 54px;
          padding: 0 16px;
          border: 1px solid #d5dce6;
          border-radius: 9px;
          outline: none;
          background: #fff;
          color: #17243a;
          font-family: inherit;
          font-size: 15px;
          transition: border-color .15s, box-shadow .15s;
        }
        .trz-offer-input::placeholder { color: #a0a9b7; }
        .trz-offer-input:focus {
          border-color: #ed721d;
          box-shadow: 0 0 0 4px rgba(237,114,29,.12);
        }
        .trz-offer-consent {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 14px 0 17px;
          color: #657187;
          font-size: 11px;
          line-height: 1.55;
          cursor: pointer;
        }
        .trz-offer-consent input {
          flex: 0 0 auto;
          width: 17px;
          height: 17px;
          margin: 1px 0 0;
          accent-color: #e96f1c;
        }
        .trz-offer-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 100%;
          min-height: 57px;
          padding: 12px 16px;
          border: 0;
          border-radius: 9px;
          color: #fff;
          background: linear-gradient(105deg, #f47721, #e96117);
          box-shadow: 0 7px 17px rgba(224, 93, 20, .22);
          font-family: 'Manrope', sans-serif;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: .045em;
          cursor: pointer;
          transition: transform .16s, box-shadow .16s, opacity .16s;
        }
        .trz-offer-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 21px rgba(224, 93, 20, .28);
        }
        .trz-offer-button:disabled { opacity: .48; cursor: not-allowed; box-shadow: none; }
        .trz-offer-arrow { font-size: 19px; line-height: 1; }
        .trz-offer-terms {
          margin: 13px 0 0;
          color: #8791a1;
          font-size: 10px;
          line-height: 1.6;
        }
        .trz-offer-visual {
          position: relative;
          min-height: 650px;
          overflow: hidden;
          background: #15243d;
        }
        .trz-offer-visual::after {
          position: absolute;
          inset: 0;
          content: '';
          background: linear-gradient(180deg, rgba(12,25,46,.02) 35%, rgba(12,25,46,.78) 100%);
          pointer-events: none;
        }
        .trz-offer-visual img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
        }
        .trz-offer-visual-caption {
          position: absolute;
          z-index: 1;
          left: 35px;
          right: 35px;
          bottom: 34px;
          color: #fff;
        }
        .trz-offer-visual-caption span {
          display: inline-block;
          margin-bottom: 10px;
          padding: 7px 10px;
          border: 1px solid rgba(255,255,255,.3);
          border-radius: 999px;
          background: rgba(255,255,255,.13);
          backdrop-filter: blur(8px);
          font-size: 10px;
          font-weight: 900;
          letter-spacing: .13em;
          text-transform: uppercase;
        }
        .trz-offer-visual-caption strong {
          display: block;
          max-width: 430px;
          font-family: 'Manrope', sans-serif;
          font-size: clamp(26px, 3vw, 38px);
          font-weight: 900;
          line-height: 1.12;
          letter-spacing: -.04em;
        }
        .trz-offer-foot {
          width: min(1180px, calc(100% - 48px));
          margin: 19px auto 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          color: #8791a1;
          font-size: 11px;
        }
        .trz-offer-foot strong { color: #5e6a7d; font-weight: 700; }
        .trz-offer-preview-note {
          margin-top: 12px;
          padding: 11px 13px;
          border: 1px solid #f0d9ad;
          border-radius: 8px;
          color: #80520f;
          background: #fff8e9;
          font-size: 11px;
          line-height: 1.5;
        }
        @media (max-width: 850px) {
          .trz-offer-shell { grid-template-columns: 1fr .82fr; }
          .trz-offer-content { padding: 38px 30px; }
          .trz-offer-pricebox { gap: 12px; padding: 14px; }
          .trz-offer-save { font-size: 10px; }
          .trz-offer-visual { min-height: 680px; }
        }
        @media (max-width: 680px) {
          .trz-offer-page { padding-bottom: 18px; }
          .trz-offer-header {
            width: calc(100% - 32px);
            height: 70px;
          }
          .trz-offer-logo { width: 155px; max-height: 52px; }
          .trz-offer-header-note { font-size: 9px; letter-spacing: .08em; }
          .trz-offer-shell {
            width: calc(100% - 24px);
            margin-top: 5px;
            display: flex;
            flex-direction: column;
            border-radius: 18px;
          }
          .trz-offer-content { padding: 28px 21px 25px; }
          .trz-offer-title {
            margin: 18px 0 12px;
            font-size: clamp(37px, 10.5vw, 49px);
          }
          .trz-offer-description { font-size: 14px; line-height: 1.6; }
          .trz-offer-pricebox {
            width: 100%;
            justify-content: space-between;
            gap: 8px;
            margin: 20px 0 21px;
            padding: 13px 12px;
          }
          .trz-offer-regular s { font-size: 16px; }
          .trz-offer-special strong { font-size: 30px; }
          .trz-offer-save { padding: 7px 8px; font-size: 9px; }
          .trz-offer-form h2 { font-size: 19px; }
          .trz-offer-input { height: 52px; }
          .trz-offer-button { min-height: 55px; font-size: 12px; }
          .trz-offer-visual { min-height: 330px; order: 2; }
          .trz-offer-visual-caption { left: 22px; right: 22px; bottom: 22px; }
          .trz-offer-visual-caption strong { font-size: 28px; }
          .trz-offer-foot {
            width: calc(100% - 32px);
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 5px;
            line-height: 1.5;
          }
        }
      `}</style>

      <div className="trz-offer-topline" />
      <header className="trz-offer-header">
        <img className="trz-offer-logo" src="/logo-full.png" alt="The Rental Zone TT" />
        <div className="trz-offer-header-note">Trinidad &amp; Tobago</div>
      </header>

      <main className="trz-offer-shell">
        <section className="trz-offer-content">
          <div className="trz-offer-eyebrow"><span className="trz-offer-dot" /> Special email reward</div>
          <h1 className="trz-offer-title">Get <em>TT$500 OFF</em> your next 4-hour rental.</h1>
          <p className="trz-offer-description">
            Join The Rental Zone TT email list and receive a TT$500 reward toward our qualifying
            four-hour bouncy castle rental promotion.
          </p>

          <div className="trz-offer-pricebox" aria-label="Four-hour rental price and discount">
            <div className="trz-offer-regular">Regular price<s>TT$1,300</s></div>
            <div className="trz-offer-divider" />
            <div className="trz-offer-special"><small>Your price with reward</small><strong>TT$800</strong></div>
            <div className="trz-offer-save">SAVE $500</div>
          </div>

          <form className="trz-offer-form" onSubmit={handleSubmit}>
            <h2>Get your reward by email</h2>
            <p className="trz-offer-form-intro">Enter your email address to join. We’ll send a verification email.</p>
            <label className="trz-offer-label" htmlFor="trz-preview-email">Email address</label>
            <input
              id="trz-preview-email"
              className="trz-offer-input"
              type="email"
              autoComplete="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(event) => { setEmail(event.target.value); setShowPreviewNotice(false); }}
              required
            />
            <label className="trz-offer-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => { setConsent(event.target.checked); setShowPreviewNotice(false); }}
                required
              />
              <span>I agree to receive promotional emails from The Rental Zone TT, up to two emails per week. I can unsubscribe at any time.</span>
            </label>
            <button className="trz-offer-button" type="submit" disabled={!email.trim() || !consent}>
              JOIN &amp; GET MY TT$500 REWARD <span className="trz-offer-arrow">→</span>
            </button>
            <p className="trz-offer-terms">
              Your reward is issued after you verify your email. It does not expire, but can only be
              redeemed while the qualifying four-hour promotion is active. Delivery fees may apply
              depending on your area.
            </p>
            {showPreviewNotice && (
              <div className="trz-offer-preview-note" role="status">
                Preview only: this form is not connected to email collection or reward issuing.
                No information has been sent or saved.
              </div>
            )}
          </form>
        </section>

        <aside className="trz-offer-visual" aria-label="The Rental Zone TT bouncy castle">
          <img src="/featured%20image.jpg" alt="Bouncy castle available from The Rental Zone TT" />
          <div className="trz-offer-visual-caption">
            <span>Big fun starts here</span>
            <strong>Make their next celebration one to remember.</strong>
          </div>
        </aside>
      </main>

      <footer className="trz-offer-foot">
        <span>© {new Date().getFullYear()} The Rental Zone TT</span>
        <strong>More fun. Better value.</strong>
      </footer>
    </div>
  );
}
