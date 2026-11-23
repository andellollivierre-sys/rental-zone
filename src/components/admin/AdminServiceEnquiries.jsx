import React, { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';

const STATUSES = ['New','Supplier quote requested','Supplier quote received','Customer quote sent','Accepted','Booked','Completed','Cancelled'];
const money = (value) => value === null || value === undefined || value === '' ? '—' : 'TT$' + Number(value).toLocaleString('en-TT',{minimumFractionDigits:2,maximumFractionDigits:2});
const field = { width:'100%', boxSizing:'border-box', padding:'9px 10px', border:'1px solid #cbd5e1', borderRadius:8, fontSize:12, background:'#fff', color:'#0f172a' };
const label = { display:'block', marginBottom:5, color:'#475569', fontSize:10, fontWeight:900, textTransform:'uppercase', letterSpacing:.4 };

export default function AdminServiceEnquiries() {
  const [rows,setRows] = useState([]);
  const [loading,setLoading] = useState(true);
  const [savingId,setSavingId] = useState(null);
  const [message,setMessage] = useState('');
  const [filter,setFilter] = useState('All');
  const [serviceFilter,setServiceFilter] = useState('All services');
  const [drafts,setDrafts] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    const { data,error } = await supabase.from('service_enquiries').select('*').order('created_at',{ascending:false}).limit(200);
    if(error) setMessage('Could not load enquiries: '+error.message);
    else { setRows(data || []); setDrafts(Object.fromEntries((data || []).map(row => [row.id,{status:row.status,supplier_name:row.supplier_name || '',supplier_cost:row.supplier_cost ?? '',customer_quote:row.customer_quote ?? '',internal_notes:row.internal_notes || ''}]))); setMessage(''); }
    setLoading(false);
  },[]);

  useEffect(() => { load(); },[load]);

  const change = (id,key,value) => setDrafts(current => ({...current,[id]:{...current[id],[key]:value}}));
  const save = async (row) => {
    const draft = drafts[row.id] || {};
    setSavingId(row.id); setMessage('');
    const payload = {
      status:draft.status,
      supplier_name:draft.supplier_name.trim() || null,
      supplier_cost:draft.supplier_cost === '' ? null : Number(draft.supplier_cost),
      customer_quote:draft.customer_quote === '' ? null : Number(draft.customer_quote),
      internal_notes:draft.internal_notes.trim() || null,
      quote_sent_at:draft.status === 'Customer quote sent' ? new Date().toISOString() : row.quote_sent_at
    };
    if ((payload.supplier_cost !== null && (!Number.isFinite(payload.supplier_cost) || payload.supplier_cost < 0)) || (payload.customer_quote !== null && (!Number.isFinite(payload.customer_quote) || payload.customer_quote < 0))) {
      setMessage('Enter valid non-negative supplier and customer quote amounts.'); setSavingId(null); return;
    }
    const {error} = await supabase.from('service_enquiries').update(payload).eq('id',row.id);
    if(error) setMessage('Save failed: '+error.message);
    else { setMessage('Enquiry updated.'); await load(); }
    setSavingId(null);
  };

  const visible = rows.filter(row => (filter === 'All' || row.status === filter) && (serviceFilter === 'All services' || row.service_name === serviceFilter));
  const countNew = rows.filter(row => row.status === 'New').length;
  const countQuote = rows.filter(row => ['Supplier quote requested','Supplier quote received','Customer quote sent'].includes(row.status)).length;
  const countEquipment = rows.filter(row => ['pressure-washer','generator'].includes(row.service_key)).length;
  const countWasher = rows.filter(row => row.service_key === 'pressure-washer').length;
  const countGenerator = rows.filter(row => row.service_key === 'generator').length;

  return <section style={{color:'#0f172a'}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap',marginBottom:15}}>
      <div><h2 style={{margin:'0 0 4px',fontSize:22,fontWeight:950}}>Service enquiries</h2><p style={{margin:0,color:'#64748b',fontSize:12}}>Collect customer requirements first. Contact suppliers yourself, then record their cost and your customer quotation.</p></div>
      <button onClick={load} style={{border:0,borderRadius:9,padding:'10px 13px',background:'#0f172a',color:'#fff',fontWeight:800}}>↻ Refresh</button>
    </div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',gap:10,marginBottom:15}}>
      {[['Total enquiries',rows.length],['New enquiries',countNew],['In quotation process',countQuote],['Equipment requests',countEquipment],['Pressure washer',countWasher],['Generator',countGenerator]].map(([title,value])=><div key={title} style={{padding:14,borderRadius:12,border:'1px solid #e2e8f0',background:'#fff'}}><div style={{fontSize:10,color:'#64748b',fontWeight:900,textTransform:'uppercase'}}>{title}</div><div style={{fontSize:25,fontWeight:950,marginTop:4}}>{value}</div></div>)}
    </div>
    <div style={{display:'flex',gap:8,alignItems:'center',marginBottom:14,flexWrap:'wrap'}}>
      <label style={{fontSize:11,fontWeight:900}}>Service</label>
      <select value={serviceFilter} onChange={e=>setServiceFilter(e.target.value)} style={{...field,width:'auto',minWidth:180}}><option>All services</option><option>Pressure Washer Rental</option><option>Generator Rental</option></select>
      <label style={{fontSize:11,fontWeight:900}}>Status</label>
      <select value={filter} onChange={e=>setFilter(e.target.value)} style={{...field,width:'auto',minWidth:180}}><option>All</option>{STATUSES.map(s=><option key={s}>{s}</option>)}</select>
      <span style={{fontSize:11,color:'#64748b'}}>{visible.length} shown · newest first</span>
    </div>
    {message && <p role="status" style={{padding:10,borderRadius:8,background:'#eff6ff',color:'#1e40af',fontSize:12}}>{message}</p>}
    {loading ? <p>Loading service enquiries…</p> : visible.length === 0 ? <div style={{padding:25,textAlign:'center',border:'1px dashed #cbd5e1',borderRadius:12,color:'#64748b'}}>No service enquiries in this view yet.</div> : <div style={{display:'grid',gap:12}}>
      {visible.map(row=>{
        const draft=drafts[row.id] || {};
        return <article key={row.id} style={{background:'#fff',border:'1px solid #e2e8f0',borderRadius:13,padding:14,boxShadow:'0 3px 12px rgba(15,23,42,.04)'}}>
          <div style={{display:'flex',justifyContent:'space-between',gap:10,flexWrap:'wrap',marginBottom:10}}>
            <div><div style={{fontSize:10,color:'#2563eb',fontWeight:900,textTransform:'uppercase'}}>{row.service_name} {row.is_test ? '· TEST' : ''}</div><h3 style={{margin:'4px 0',fontSize:17,fontWeight:950}}>{row.customer_name}</h3><div style={{fontSize:12,color:'#475569'}}>{row.phone}{row.email ? ' · '+row.email : ''}</div></div>
            <div style={{fontSize:10,color:'#64748b',textAlign:'right'}}>{new Date(row.created_at).toLocaleString('en-TT')}<div style={{marginTop:4,fontWeight:800}}>{row.traffic_source || 'direct'}{row.utm_campaign ? ' / '+row.utm_campaign : ''}</div></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:8,background:'#f8fafc',padding:10,borderRadius:9,marginBottom:10}}>
            <div><span style={label}>Rental / event date</span><b style={{fontSize:12}}>{row.event_date || 'Not provided'}</b></div>
            <div><span style={label}>Time</span><b style={{fontSize:12}}>{row.event_start_time || 'Not provided'}</b></div>
            <div><span style={label}>Location</span><b style={{fontSize:12}}>{row.event_location}</b></div>
            <div><span style={label}>Guests</span><b style={{fontSize:12}}>{row.guest_count || 'Not provided'}</b></div>
            <div><span style={label}>Delivery</span><b style={{fontSize:12}}>{row.delivery_required ? 'Requested' : 'Not requested'}</b></div>
            <div><span style={label}>Customer budget</span><b style={{fontSize:12}}>{money(row.budget)}</b></div>
          </div>
          {row.catering_style && <p style={{fontSize:12,margin:'5px 0'}}><b>Catering format:</b> {row.catering_style}</p>}
          {row.dietary_requirements && <p style={{fontSize:12,margin:'5px 0'}}><b>Dietary / food preferences:</b> {row.dietary_requirements}</p>}
          {row.service_details && <p style={{fontSize:12,margin:'5px 0 12px',whiteSpace:'pre-wrap'}}><b>Requirements:</b> {row.service_details}</p>}
          <div style={{borderTop:'1px solid #e2e8f0',paddingTop:12,display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(145px,1fr))',gap:9}}>
            <div><label style={label}>Enquiry status</label><select value={draft.status || row.status} onChange={e=>change(row.id,'status',e.target.value)} style={field}>{STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
            <div><label style={label}>Supplier / provider</label><input value={draft.supplier_name ?? ''} onChange={e=>change(row.id,'supplier_name',e.target.value)} style={field} placeholder="Provider name" /></div>
            <div><label style={label}>Supplier cost (TT$)</label><input type="number" min="0" step="0.01" value={draft.supplier_cost ?? ''} onChange={e=>change(row.id,'supplier_cost',e.target.value)} style={field} placeholder="Cost to you" /></div>
            <div><label style={label}>Customer quote (TT$)</label><input type="number" min="0" step="0.01" value={draft.customer_quote ?? ''} onChange={e=>change(row.id,'customer_quote',e.target.value)} style={field} placeholder="Price quoted" /></div>
            <div style={{gridColumn:'1 / -1'}}><label style={label}>Internal notes (not shown to customer)</label><textarea rows="2" value={draft.internal_notes ?? ''} onChange={e=>change(row.id,'internal_notes',e.target.value)} style={{...field,resize:'vertical'}} placeholder="Supplier response, follow-up, agreed terms..." /></div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:10,flexWrap:'wrap',marginTop:10}}>
            <span style={{fontSize:10,color:'#64748b'}}>No payments are collected or recorded in this enquiry system.</span>
            <button disabled={savingId===row.id} onClick={()=>save(row)} style={{border:0,borderRadius:8,padding:'10px 14px',background:'#0f172a',color:'#fff',fontWeight:900,cursor:'pointer'}}>{savingId===row.id?'Saving…':'Save enquiry'}</button>
          </div>
        </article>;
      })}
    </div>}
  </section>;
}
