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
    <div className="trz-email-page">
      <style>{`
        .trz-email-page {
          min-height: 100vh;
          background: #f5f7fb;
          color: #101d35;
          font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }
        .trz-email-header {
          height: 78px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 10px 22px;
          background: #fff;
          border-bottom: 1px solid #e7ebf2;
        }
        .trz-email-header img { width: 190px; max-height: 58px; object-fit: contain; }
        .trz-email-main {
          width: min(1120px, calc(100% - 40px));
          margin: 42px auto;
          display: grid;
          grid-template-columns: 1.04fr .96fr;
          align-items: center;
          gap: 54px;
        }
        .trz-email-copy { padding: 16px 0; }
        .trz-email-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #174c91;
          background: #e8f1ff;
          border: 1px solid #d6e6ff;
          border-radius: 999px;
          padding: 8px 13px;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: .07em;
          text-transform: uppercase;
        }
        .trz-email-copy h1 {
          max-width: 610px;
          margin: 20px 0 15px;
          color: #101d35;
          font-size: clamp(36px, 5vw, 57px);
          line-height: 1.04;
          letter-spacing: -.045em;
          font-weight: 900;
        }
        .trz-email-copy h1 span { color: #e87522; }
        .trz-email-lead {
          max-width: 530px;
          color: #526078;
          font-size: 18px;
          line-height: 1.65;
          margin: 0 0 25px;
        }
        .trz-email-price {
          display: flex;
          align-items: center;
          gap: 17px;
          flex-wrap: wrap;
          margin: 0 0 25px;
        }
        .trz-email-old { color: #7d8798; font-size: 17px; }
        .trz-email-old s { text-decoration-thickness: 2px; }
        .trz-email-new { color: #101d35; font-size: 37px; line-height: 1; font-weight: 900; }
        .trz-email-save {
          color: #17623c;
          background: #e5f6eb;
          border-radius: 7px;
          padding: 7px 10px;
          font-size: 13px;
          font-weight: 850;
        }
        .trz-email-form-card {
          background: #fff;
          border: 1px solid #e2e7ef;
          border-radius: 15px;
          padding: 23px;
          box-shadow: 0 14px 38px rgba(16, 29, 53, .08);
          max-width: 540px;
        }
        .trz-email-form-card h2 { margin: 0 0 7px; font-size: 21px; letter-spacing: -.02em; }
        .trz-email-form-card > p { margin: 0 0 17px; color: #68758a; font-size: 14px; line-height: 1.5; }
        .trz-email-label { display: block; margin: 0 0 7px; font-size: 13px; font-weight: 800; color: #273650; }
        .trz-email-input {
          width: 100%; height: 51px; box-sizing: border-box; border: 1px solid #cbd3df;
          border-radius: 8px; padding: 0 14px; color: #15233c; background: #fff; font-size: 16px;
          outline: none; margin-bottom: 14px;
        }
        .trz-email-input:focus { border-color: #2765b5; box-shadow: 0 0 0 3px rgba(39,101,181,.12); }
        .trz-email-consent { display: flex; gap: 10px; align-items: flex-start; color: #526078; font-size: 12px; line-height: 1.55; margin: 2px 0 17px; }
        .trz-email-consent input { width: 17px; height: 17px; margin: 1px 0 0; accent-color: #174c91; flex: 0 0 auto; }
        .trz-email-submit {
          width: 100%; min-height: 54px; border: 0; border-radius: 8px; background: #e87522;
          color: #fff; font-size: 15px; font-weight: 900; letter-spacing: .015em; cursor: pointer;
          box-shadow: 0 5px 0 #c65c13; transition: transform .15s ease, box-shadow .15s ease;
        }
        .trz-email-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 0 #c65c13; }
        .trz-email-submit:disabled { opacity: .48; cursor: not-allowed; transform: none; }
        .trz-email-fineprint { color: #7b8799; font-size: 11px; line-height: 1.55; margin: 14px 0 0; text-align: center; }
        .trz-email-photo {
          position: relative; min-height: 520px; overflow: hidden; border-radius: 18px;
          background: #dce5f1; box-shadow: 0 18px 46px rgba(16,29,53,.15);
        }
        .trz-email-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
        .trz-email-photo-tag {
          position: absolute; left: 18px; bottom: 18px; background: rgba(13,27,49,.9); color: #fff;
          border-radius: 9px; padding: 12px 15px; font-size: 13px; font-weight: 750;
        }
        .trz-email-footer { text-align: center; color: #7b8799; font-size: 12px; padding: 4px 20px 26px; }
        .trz-email-preview-note { margin-top: 12px; border-radius: 8px; padding: 10px 12px; background: #fff7e8; color: #83510c; font-size: 12px; line-height: 1.45; }
        @media (max-width: 760px) {
          .trz-email-header { height: 66px; }
          .trz-email-header img { width: 165px; max-height: 50px; }
          .trz-email-main { width: min(100% - 28px, 540px); margin: 20px auto 26px; grid-template-columns: 1fr; gap: 22px; }
          .trz-email-copy { padding: 5px 0 0; }
          .trz-email-copy h1 { font-size: clamp(34px, 10vw, 47px); margin-top: 15px; }
          .trz-email-lead { font-size: 16px; margin-bottom: 18px; }
          .trz-email-price { margin-bottom: 20px; }
          .trz-email-photo { min-height: 300px; grid-row: 1; }
          .trz-email-form-card { padding: 19px; }
        }
      `}</style>

      <header className="trz-email-header">
        <img src="/logo-full.png" alt="The Rental Zone TT" />
      </header>

      <main className="trz-email-main">
        <section className="trz-email-copy">
          <div className="trz-email-kicker">The Rental Zone TT · Email Updates</div>
          <h1>Get updates.<br /><span>Get TT$500 off.</span></h1>
          <p className="trz-email-lead">
            Sign up for updates from The Rental Zone TT and receive a TT$500 reward
            toward a qualifying four-hour bouncy castle rental.
          </p>

          <div className="trz-email-price" aria-label="Four-hour rental promotional price">
            <div className="trz-email-old">Regular price<br /><s>TT$1,300</s></div>
            <div className="trz-email-new">TT$800</div>
            <div className="trz-email-save">YOU SAVE TT$500</div>
          </div>

          <form className="trz-email-form-card" onSubmit={handleSubmit}>
            <h2>Get your TT$500 reward</h2>
            <p>Enter your email and agree to receive TRZ promotional updates.</p>
            <label className="trz-email-label" htmlFor="trz-preview-email">Email address</label>
            <input
              id="trz-preview-email"
              className="trz-email-input"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => { setEmail(event.target.value); setShowPreviewNotice(false); }}
              required
            />
            <label className="trz-email-consent">
              <input
                type="checkbox"
                checked={consent}
                onChange={(event) => { setConsent(event.target.checked); setShowPreviewNotice(false); }}
                required
              />
              <span>I agree to receive promotional emails from The Rental Zone TT, up to two emails per week. I can unsubscribe at any time.</span>
            </label>
            <button className="trz-email-submit" type="submit" disabled={!email.trim() || !consent}>
              SIGN UP FOR UPDATES &amp; GET TT$500 OFF
            </button>
            <p className="trz-email-fineprint">
              Your reward is issued after you verify your email address. It does not expire,
              but can only be redeemed while the qualifying four-hour promotion is active.
              Delivery fees may apply depending on your area.
            </p>
            {showPreviewNotice && (
              <div className="trz-email-preview-note" role="status">
                Preview only: this form is not connected to email collection or reward issuing.
                No information has been sent or saved.
              </div>
            )}
          </form>
        </section>

        <div className="trz-email-photo">
          <img src="/featured image.jpg" alt="The Rental Zone TT bouncy castle rental" />
          <div className="trz-email-photo-tag">Make room for more fun.</div>
        </div>
      </main>

      <footer className="trz-email-footer">
        © {new Date().getFullYear()} The Rental Zone TT · Trinidad &amp; Tobago
      </footer>
    </div>
  );
}
