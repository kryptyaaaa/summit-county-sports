(()=>{
  'use strict';
  const events=(window.SCS_CONTENT?.events||[]).filter(e=>e.category==='Concerts'&&e.published!==false);
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safePhoto=v=>typeof v==='string'&&(v.startsWith('assets/uploads/')||/^https:\/\//i.test(v))?v:'';
  const fmtDate=v=>{if(!v)return '';const d=new Date(v+'T12:00:00');return Number.isNaN(d.getTime())?'':d.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});};
  const target=document.getElementById('concert-grid');
  const count=document.getElementById('concert-count');
  if(count)count.textContent=events.length?events.length+' '+(events.length===1?'SHOW':'SHOWS')+' IN THE ARCHIVE':'NEW COVERAGE COMING SOON';
  if(!target)return;
  const entries=events.sort((a,b)=>Number(!!b.featured)-Number(!!a.featured)||String(b.event_date||'').localeCompare(String(a.event_date||'')));
  target.innerHTML=entries.length?entries.map(e=>{
    const src=safePhoto(e.cover)||((e.gallery||[]).map(safePhoto).find(Boolean)||'');
    const label=[e.venue||e.location,fmtDate(e.event_date)].filter(Boolean).join(' / ');
    const desc=e.summary||'Live concert coverage from Summit County Concerts.';
    const cover=src?'<img src="'+esc(src)+'" loading="lazy" alt="'+esc(e.title)+' concert cover photo">':'<span class="scc-placeholder">LIVE.</span>';
    return '<a class="scc-card" href="concert-event.html?slug='+encodeURIComponent(e.slug)+'"><div class="scc-cover">'+cover+'<span class="scc-cover-tag">LIVE COVERAGE</span></div><div class="scc-card-body"><div class="scc-card-meta">'+esc(label||'CONCERT PHOTOGRAPHY')+'</div><h3>'+esc(e.title)+'</h3><p>'+esc(desc.length>135?desc.slice(0,132)+'…':desc)+'</p><span class="scc-card-cta">OPEN THE GALLERY ↗</span></div></a>';
  }).join(''):'<div class="scc-empty"><div><span class="scc-eyebrow">THE LIVE ARCHIVE / 001</span><h3>FIRST SET<br>COMING SOON.</h3><p>Our dedicated concert archive is ready. Artist galleries, live-show photography and performance films will appear here as they are published.</p></div><a class="scc-btn" href="#contact">BOOK COVERAGE <span aria-hidden="true">↗</span></a></div>';
  const year=document.getElementById('scc-year');if(year)year.textContent=new Date().getFullYear();
})();
