import React, { useMemo, useState } from 'react';

const money = (value) => `TT$${Number(value).toLocaleString('en-TT')}`;

export default function EmailMembershipPreview() {
  const [view, setView] = useState('customer');
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [stage, setStage] = useState('form');
  const [demoEmail, setDemoEmail] = useState('');
  const [campaignActive, setCampaignActive] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const verified = stage === 'verified';
  const sampleRows = useMemo(() => (verified ? [{
    email: demoEmail,
    status: 'Verified',
    consent: 'Yes',
    reward: 'Available',
    amount: 500,
    expiry: 'No expiry'
  }] : [{
    email: 'sample@example.com',
    status: 'Verified',
    consent: 'Yes',
    reward: 'Available',
    amount: 500,
    expiry: 'No expiry'
  }]), [verified, demoEmail]);

  const submitSignup = (event) => {
    event.preventDefault();
    if (!email.trim() || !consent) return;
    setDemoEmail(email.trim().toLowerCase());
    setStage('pending');
  };

  const resetDemo = () => {
    setEmail('');
    setConsent(false);
    setDemoEmail('');
    setStage('form');
  };

  const styles = {
    page: { minHeight: '100vh', background: '#f1f5f9', color: '#0f172a', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif', padding: '20px 14px 48px' },
    wrap: { maxWidth: 1040, margin: '0 auto' },
    top: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 16 },
    brand: { display: 'flex', alignItems: 'center', gap: 10, fontWeight: 900, letterSpacing: '.02em' },
    logo: { width: 42, height: 42, objectFit: 'contain', borderRadius: 10, background: '#fff' },
    switch: { display: 'flex', gap: 6, background: '#e2e8f0', borderRadius: 12, padding: 4 },
    switchBtn: (active) => ({ border: 0, borderRadius: 9, padding: '10px 13px', fontWeight: 800, background: active ? '#0f172a' : 'transparent', color: active ? '#fff' : '#475569', cursor: 'pointer' }),
    notice: { background: '#fff7ed', border: '1px solid #fed7aa', color: '#9a3412', padding: '11px 14px', borderRadius: 12, fontSize: 13, fontWeight: 700, marginBottom: 16 },
    card: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 20, overflow: 'hidden', boxShadow: '0 12px 32px rgba(15,23,42,.06)' },
    hero: { background: 'linear-gradient(135deg,#0f172a,#172554 70%,#1e40af)', color: '#fff', padding: '28px 24px' },
    eyebrow: { display: 'inline-block', background: '#dbeafe', color: '#1d4ed8', padding: '6px 10px', borderRadius: 99, fontSize: 11, fontWeight: 900, letterSpacing: '.07em' },
    h1: { fontSize: 'clamp(30px,5vw,48px)', lineHeight: 1.04, letterSpacing: '-.04em', margin: '14px 0 10px', fontWeight: 950 },
    sub: { color: '#dbeafe', fontSize: 16, lineHeight: 1.6, maxWidth: 650, margin: 0 },
    priceBox: { marginTop: 22, background: '#fff', color: '#0f172a', borderRadius: 16, padding: 18, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: 12 },
    priceLabel: { color: '#64748b', fontSize: 12, fontWeight: 700 },
    priceValue: { fontSize: 25, fontWeight: 950, marginTop: 4 },
    body: { padding: 22, display: 'grid', gridTemplateColumns: 'minmax(0,1.1fr) minmax(260px,.9fr)', gap: 22 },
    panel: { background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 16, padding: 18 },
    label: { display: 'block', fontWeight: 800, fontSize: 13, marginBottom: 8 },
    input: { width: '100%', boxSizing: 'border-box', border: '1px solid #cbd5e1', borderRadius: 10, padding: '14px 12px', fontSize: 16, background: '#fff', color: '#0f172a' },
    button: { border: 0, borderRadius: 11, background: '#0284c7', color: '#fff', padding: '14px 16px', fontWeight: 900, fontSize: 15, width: '100%', cursor: 'pointer' },
    muted: { color: '#64748b', fontSize: 12, lineHeight: 1.55 },
    section: { padding: '20px 22px', borderTop: '1px solid #e2e8f0' },
    row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' },
    pill: { display: 'inline-flex', padding: '5px 9px', borderRadius: 99, background: '#dcfce7', color: '#166534', fontSize: 11, fontWeight: 900 },
    tableWrap: { overflowX: 'auto', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14 },
    table: { width: '100%', borderCollapse: 'collapse', minWidth: 650, fontSize: 13 },
    th: { textAlign: 'left', color: '#64748b', background: '#f8fafc', padding: 12, borderBottom: '1px solid #e2e8f0', fontSize: 11, textTransform: 'uppercase', letterSpacing: '.05em' },
    td: { padding: 13, borderBottom: '1px solid #f1f5f9', fontWeight: 650 },
    metric: { background: '#fff', border: '1px solid #e2e8f0', borderRadius: 14, padding: 15 },
    metricNum: { fontSize: 27, fontWeight: 950, marginTop: 5 },
    smallButton: { border: '1px solid #cbd5e1', background: '#fff', color: '#0f172a', borderRadius: 9, padding: '9px 12px', fontWeight: 800, cursor: 'pointer' }
  };

  const heading = view === 'customer' ? 'Customer landing page' : 'TRZ back-office preview';

  return (
    <div style={styles.page}>
      <div style={styles.wrap}>
        <div style={styles.top}>
          <div style={styles.brand}>
            <img src="/logo-full.png" alt="The Rental Zone TT" style={styles.logo} />
            <div><div>THE RENTAL ZONE TT</div><div style={{fontSize:11,color:'#64748b',fontWeight:700}}>EMAIL MEMBERSHIP PREVIEW</div></div>
          </div>
          <div style={styles.switch}>
            <button type="button" style={styles.switchBtn(view === 'customer')} onClick={() => setView('customer')}>Customer view</button>
            <button type="button" style={styles.switchBtn(view === 'office')} onClick={() => setView('office')}>Back office view</button>
          </div>
        </div>

        <div style={styles.notice}>PREVIEW ONLY — this page does not send email, save addresses, create rewards, or connect to Supabase. Signup and verification are simulated in this browser session.</div>

        {view === 'customer' ? (
          <div style={styles.card}>
            <div style={styles.hero}>
              <span style={styles.eyebrow}>EMAIL MEMBER SPECIAL</span>
              <h1 style={styles.h1}>Get TT$500 OFF your 4-hour bouncy castle rental.</h1>
              <p style={styles.sub}>Join The Rental Zone TT email list. Verify your email and we'll attach your TT$500 reward to it, ready for an eligible four-hour special when one is running.</p>
              <div style={styles.priceBox}>
                <div><div style={styles.priceLabel}>Regular 4-hour value</div><div style={{...styles.priceValue,textDecoration:'line-through',color:'#64748b'}}>{money(1300)}</div></div>
                <div><div style={styles.priceLabel}>Your member discount</div><div style={{...styles.priceValue,color:'#15803d'}}>−{money(500)}</div></div>
                <div><div style={styles.priceLabel}>Special price</div><div style={{...styles.priceValue,color:'#1d4ed8'}}>{money(800)}</div></div>
              </div>
              <div style={{fontSize:12,color:'#bfdbfe',marginTop:10}}>TT$325/hour regular value · TT$200/hour during this special</div>
            </div>

            <div style={styles.body}>
              <div>
                <h2 style={{fontSize:22,margin:'0 0 8px'}}>Get your reward</h2>
                <p style={{color:'#475569',fontSize:14,lineHeight:1.6,marginTop:0}}>Only your email address is requested. We send a verification link to make sure the address belongs to you.</p>

                {stage === 'form' && (
                  <form onSubmit={submitSignup} style={styles.panel}>
                    <label htmlFor="trz-preview-email" style={styles.label}>Email address</label>
                    <input id="trz-preview-email" type="email" required autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={styles.input} />
                    <label style={{display:'flex',gap:10,alignItems:'flex-start',margin:'15px 0',fontSize:13,lineHeight:1.5,color:'#334155'}}>
                      <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} required style={{marginTop:3,width:17,height:17,flexShrink:0}} />
                      <span>I agree to receive promotional emails, offers and updates from The Rental Zone TT, up to two promotional emails per week. I can unsubscribe at any time.</span>
                    </label>
                    <button type="submit" style={styles.button}>SEND MY VERIFICATION EMAIL</button>
                    <p style={{...styles.muted,textAlign:'center',marginBottom:0}}>Your reward is issued only after you verify your email.</p>
                  </form>
                )}

                {stage === 'pending' && (
                  <div style={{...styles.panel,borderColor:'#93c5fd',background:'#eff6ff'}}>
                    <div style={{fontSize:24}}>✉️</div>
                    <h3 style={{margin:'8px 0'}}>Check your inbox</h3>
                    <p style={{fontSize:14,lineHeight:1.6}}>A verification message would be sent to <strong>{demoEmail}</strong>. In the real system, the reward is not issued until the verification link is opened.</p>
                    <button type="button" style={styles.button} onClick={() => setStage('verified')}>SIMULATE EMAIL VERIFICATION</button>
                    <p style={styles.muted}>Demo control only. No email was actually sent.</p>
                  </div>
                )}

                {stage === 'verified' && (
                  <div style={{...styles.panel,borderColor:'#86efac',background:'#f0fdf4'}}>
                    <span style={styles.pill}>EMAIL VERIFIED</span>
                    <h3 style={{margin:'12px 0 6px'}}>Your reward is recorded.</h3>
                    <p style={{fontSize:14,lineHeight:1.6}}>The demo account <strong>{demoEmail}</strong> now has a TT$500 reward. It has no expiry date and can be redeemed when the qualifying four-hour special is active.</p>
                    <div style={{fontSize:26,fontWeight:950,color:'#15803d'}}>{money(500)} reward</div>
                    <button type="button" style={{...styles.smallButton,marginTop:14}} onClick={resetDemo}>Reset demo</button>
                  </div>
                )}
              </div>

              <div style={{display:'flex',flexDirection:'column',gap:12}}>
                <img src="/1795604636353.jpg" alt="The Rental Zone bouncy castle" style={{width:'100%',height:205,objectFit:'cover',borderRadius:15,background:'#e2e8f0'}} />
                <div style={styles.panel}>
                  <h3 style={{margin:'0 0 10px'}}>How it works</h3>
                  <ol style={{paddingLeft:20,margin:0,color:'#475569',fontSize:13,lineHeight:1.9}}>
                    <li>Enter your email and agree to updates.</li>
                    <li>Verify the email we send you.</li>
                    <li>Your TT$500 reward is attached to that email.</li>
                    <li>Use it when the four-hour special is active.</li>
                  </ol>
                </div>
              </div>
            </div>

            <div style={styles.section}>
              <h3 style={{margin:'0 0 10px'}}>Clear pricing. No surprises.</h3>
              <p style={{fontSize:13,color:'#475569',lineHeight:1.65,margin:0}}>The TT$800 special package price is before delivery. A delivery fee may apply depending on your area. TRZ will confirm the delivery charge and the full amount before you commit to the booking.</p>
              <p style={{...styles.muted,marginBottom:0}}>The TT$500 reward is for the qualifying four-hour package only. It does not expire, but it can only be redeemed while the relevant special is active. Promotional emails are limited to two per week. Unsubscribe at any time.</p>
            </div>
          </div>
        ) : (
          <div style={{display:'grid',gap:16}}>
            <div style={styles.row}>
              <div><h1 style={{fontSize:28,margin:'0 0 4px'}}>Email membership</h1><div style={{fontSize:13,color:'#64748b'}}>Proposed back-office controls · demonstration data only</div></div>
              <span style={styles.pill}>NO DATABASE CONNECTED</span>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:10}}>
              {[['Verified subscribers',verified?'1':'0'],['Pending verification',stage==='pending'?'1':'0'],['Rewards issued',verified?'1':'0'],['Rewards redeemed','0']].map(([label,value])=>(
                <div key={label} style={styles.metric}><div style={styles.priceLabel}>{label}</div><div style={styles.metricNum}>{value}</div></div>
              ))}
            </div>
            <div style={styles.card}>
              <div style={{padding:18,borderBottom:'1px solid #e2e8f0'}}>
                <div style={styles.row}><div><h2 style={{fontSize:19,margin:0}}>Subscriber records</h2><div style={styles.muted}>Only the email address and operational membership fields are shown.</div></div><button type="button" style={styles.smallButton} onClick={() => setShowDetails(!showDetails)}>{showDetails?'Hide':'Show'} data fields</button></div>
              </div>
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead><tr>{['Email address','Verification','Marketing consent','Reward','Value','Expiry'].map(x=><th key={x} style={styles.th}>{x}</th>)}</tr></thead>
                  <tbody>
                    {verified ? sampleRows.map((row)=><tr key={row.email}><td style={styles.td}>{row.email}</td><td style={styles.td}><span style={styles.pill}>{row.status}</span></td><td style={styles.td}>{row.consent}</td><td style={styles.td}>{row.reward}</td><td style={styles.td}>{money(row.amount)}</td><td style={styles.td}>{row.expiry}</td></tr>) : <tr><td colSpan="6" style={{...styles.td,color:'#64748b',textAlign:'center',padding:28}}>No real subscriber records. Complete the customer demo to populate a temporary example here.</td></tr>}
                  </tbody>
                </table>
              </div>
              {showDetails && <div style={{padding:16,fontSize:13,color:'#475569',lineHeight:1.8}}><strong>Proposed stored fields:</strong> email, verification status, verification timestamp, consent status, consent text/version, consent timestamp, signup timestamp, reward status, reward amount, issued timestamp, redeemed timestamp, related booking reference. No name, phone, address, birthday or profile fields.</div>}
            </div>

            <div style={styles.card}>
              <div style={{padding:18}}>
                <h2 style={{fontSize:19,margin:'0 0 4px'}}>Promotion controls</h2>
                <p style={styles.muted}>Controls whether the four-hour offer can currently accept this reward. The reward itself does not expire.</p>
                <div style={{...styles.panel,display:'flex',justifyContent:'space-between',alignItems:'center',gap:14,flexWrap:'wrap'}}>
                  <div><div style={{fontWeight:900}}>Four-hour member special</div><div style={{fontSize:13,color:'#64748b'}}>Regular value {money(1300)} · member price {money(800)}</div></div>
                  <button type="button" onClick={()=>setCampaignActive(!campaignActive)} style={{...styles.smallButton,background:campaignActive?'#dcfce7':'#fff7ed',borderColor:campaignActive?'#86efac':'#fed7aa',color:campaignActive?'#166534':'#9a3412'}}>{campaignActive?'ACTIVE — turn off':'INACTIVE — turn on'}</button>
                </div>
                <p style={{...styles.muted,marginBottom:0}}>Demo toggle only. In production, this would be an admin-controlled campaign setting with an audit trail.</p>
              </div>
            </div>

            <div style={styles.card}>
              <div style={{padding:18}}>
                <h2 style={{fontSize:19,margin:'0 0 12px'}}>Email and privacy rules</h2>
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:10}}>
                  {[
                    ['Double opt-in','No reward until the verification link is confirmed.'],
                    ['Minimal data','Store email only, plus consent and reward records needed to operate the service.'],
                    ['Marketing limit','Maximum two promotional emails per subscriber per week.'],
                    ['Unsubscribe','Unsubscribe immediately suppresses future marketing sends.'],
                    ['Access control','Subscriber records visible only to authorized TRZ administrators and required email services.'],
                    ['Reward safety','Unique reward record; server validates eligibility and redemption before booking confirmation.']
                  ].map(([title,desc])=><div key={title} style={{background:'#f8fafc',border:'1px solid #e2e8f0',borderRadius:12,padding:13}}><div style={{fontWeight:900,fontSize:13,marginBottom:5}}>{title}</div><div style={{fontSize:12,color:'#64748b',lineHeight:1.55}}>{desc}</div></div>)}
                </div>
              </div>
            </div>

            <div style={styles.card}>
              <div style={{padding:18}}>
                <h2 style={{fontSize:19,margin:'0 0 8px'}}>Proposed event trail</h2>
                <ol style={{margin:0,paddingLeft:20,color:'#475569',fontSize:13,lineHeight:2}}>
                  <li>Signup submitted — email and consent recorded as pending.</li>
                  <li>Verification link requested — token stored securely, not exposed in the dashboard.</li>
                  <li>Email verified — verification timestamp recorded.</li>
                  <li>Reward issued — TT$500, no expiry, eligible four-hour campaign.</li>
                  <li>Reward redeemed — linked to the confirmed booking; never mark redeemed before successful booking confirmation.</li>
                  <li>Unsubscribe — marketing consent withdrawn and future campaigns suppressed.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        <div style={{textAlign:'center',color:'#94a3b8',fontSize:11,marginTop:18}}>TRZ isolated preview branch · demonstration only · no subscriber data is transmitted or stored</div>
      </div>
      <style>{`@media(max-width:700px){.trz-preview-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
