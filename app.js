(()=>{
  'use strict';
  const content=window.SCS_CONTENT||{site:{},events:[]};
  const site=content.site||{}, events=Array.isArray(content.events)?content.events:[];
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const url=x=>{if(!x||typeof x!=='string')return '';const s=x.trim();if(/^https:\/\//i.test(s))return s;if(s.startsWith('/assets/uploads/'))return location.protocol==='file:'?s.slice(1):s;if(s.startsWith('assets/uploads/'))return s;return ''};
  const imageSrc=x=>url(x);
  const extURL=x=>/^https:\/\//.test(String(x||''))?x:'';
  const instagramEmbed=x=>{const m=extURL(x).match(/^https:\/\/(?:www\.)?instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)(?:\/|\?|$)/i);return m?'https://www.instagram.com/'+m[1]+'/'+m[2]+'/embed/':''};
  const pageHref=e=>'event.html?slug='+encodeURIComponent(e.slug);
  const preview=e=>imageSrc(e.cover)||e.gallery.map(imageSrc).find(Boolean)||'';
  const eDate=e=>{if(!e.event_date)return '';const dt=new Date(e.event_date+'T12:00:00');return Number.isNaN(dt.getTime())?'':dt.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})};
  const bn=e=>String(e.title||'').toLowerCase().includes('byron nelson');
  const abbreviation=e=>bn(e)?'BN':String(e.category||'SCS').slice(0,2).toUpperCase();
  document.querySelectorAll('.year').forEach(el=>el.textContent=new Date().getFullYear());
  const toggle=document.querySelector('.hamburger'), nav=document.getElementById('primary-nav');
  if(toggle&&nav){toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';toggle.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');toggle.setAttribute('aria-expanded','false')}));}
  const ig=extURL(site.instagram)||'https://www.instagram.com/masontookem/';
  document.querySelectorAll('[data-instagram]').forEach(a=>a.href=ig);
  const mail=site.email&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(site.email)?site.email:'';
  document.querySelectorAll('[data-contact-link]').forEach(a=>a.href=mail?'mailto:'+encodeURIComponent(mail):ig);
  document.querySelectorAll('[data-contact-text]').forEach(el=>el.textContent=mail?'Email: '+mail:'Instagram: '+(site.instagram_label||'@masontookem'));
  // Featured media: native gallery cover or a playable Instagram post.
  if(document.body.dataset.page==='home'){
    const target=document.getElementById('featured-project');const e=events.find(e=>e.featured)||events[0];
    if(target&&e){
      const cover=preview(e),embed=instagramEmbed(e.video_url);
      const artwork=embed
        ?`<div class="feature-artwork feature-video-artwork"><iframe class="ig-embed" src="${esc(embed)}" title="Watch ${esc(e.title)} on Instagram" loading="lazy" allowfullscreen></iframe></div>`
        :`<div class="feature-artwork">${cover?`<img class="feature-photo" src="${esc(cover)}" alt="${esc(e.title)} cover photo" loading="lazy"><div class="feature-overlay"></div>`:`<span class="graphic-large">${esc(abbreviation(e))}</span>`}<div class="graphic-corner">FEATURED COVERAGE / SCS</div><span class="graphic-caption">${esc(e.title)}</span><div class="graphic-credit">${cover?esc(e.photographer||'SUMMIT COUNTY SPORTS'):'PHOTOS BEING ADDED'}</div></div>`;
      target.innerHTML=`${artwork}<div class="feature-description"><span class="tag">FEATURED / ${esc(e.category||'COVERAGE')}</span><h3>${esc(e.title)}</h3><p>${esc(e.summary||'Explore the story, the people, and the moments behind this event.')}</p><a class="arrow-link" href="${pageHref(e)}">${embed?'WATCH THE FEATURE':e.gallery.length?'VIEW THE GALLERY':'VIEW PROJECT DETAILS'} ↗</a>${embed?`<a class="arrow-link video-external-link" href="${esc(extURL(e.video_url))}" target="_blank" rel="noopener noreferrer">WATCH ON INSTAGRAM ↗</a>`:''}</div>`;
    }
  }
  // Portfolio cards and quick category navigation.
  const card=e=>{const cover=preview(e);const count=(e.gallery||[]).filter(imageSrc).length;const video=!!instagramEmbed(e.video_url);
    const bottom=video?'WATCH VIDEO':count?`${count} PHOTOS`:extURL(e.external_url)?'LIGHTROOM ALBUM AVAILABLE':'PHOTOS COMING SOON';
    const artwork=cover?`<img loading="lazy" src="${esc(cover)}" alt="${esc(e.title)}">`:video?'<span class="video-poster-mark" aria-hidden="true">▶</span>':`<span class="placeholder-mark" aria-hidden="true">${esc(abbreviation(e))}</span>`;
    return `<a class="project-card" href="${pageHref(e)}"><div class="project-cover">${artwork}<span class="project-corner">SCS / ${esc(e.category||'COVERAGE')}</span><span class="project-bottom">${bottom} ↗</span></div><div class="project-meta"><b>${esc(e.category||'EVENT')}</b><span>${esc(eDate(e)||e.location||'EVENT COVERAGE')}</span></div><h3>${esc(e.title)}</h3><p>${esc((e.summary||'').length>134?e.summary.slice(0,131)+'...':e.summary||'View this event in the Summit County Sports archive.')}</p></a>`};
  if(document.body.dataset.page==='portfolio'){
    const grid=document.getElementById('project-grid');const buttons=[...document.querySelectorAll('.filter')];
    const special=new Set(['Football','Volleyball','Basketball','Baseball']);
    function filter(val){buttons.forEach(b=>{const active=b.dataset.category===val;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});let filtered=events.filter(e=>val==='All'||(val==='Other'?!special.has(e.category):e.category===val));grid.innerHTML=filtered.length?filtered.map(card).join(''):`<div class="empty-state"><h3>MORE STORIES COMING.</h3><p>Nothing has been published in this category yet. Follow our Instagram for more coverage while galleries are being added.</p><a class="under-link" href="${esc(ig)}" target="_blank" rel="noopener">VIEW MORE WORK ↗</a></div>`;}
    buttons.forEach(b=>b.addEventListener('click',()=>{filter(b.dataset.category);const p=new URL(location.href);if(b.dataset.category==='All')p.searchParams.delete('category');else p.searchParams.set('category',b.dataset.category);history.replaceState(null,'',p)}));
    const p=new URLSearchParams(location.search).get('category');filter(['Football','Basketball','Volleyball','Baseball','Other'].includes(p)?p:'All');
  }
  if(document.body.dataset.page==='event'){
    const slug=new URLSearchParams(location.search).get('slug');const e=events.find(e=>e.slug===slug);const heading=document.getElementById('event-heading'), gallery=document.getElementById('event-gallery'), links=document.getElementById('event-links');
    if(!e){heading.innerHTML='<p class="detail-category">PROJECT NOT FOUND</p><h1>THIS GALLERY ISN\'T PUBLISHED.</h1><a class="under-link" href="portfolio.html">VIEW PUBLISHED WORK ↗</a>';return;}
    document.title=e.title+' — Summit County Sports';
    heading.innerHTML=`<p class="detail-category">${esc(e.category)} / SCS EVENT COVERAGE</p><h1>${esc(e.title)}</h1><div class="detail-info">${e.location?`<span>LOCATION / ${esc(e.location)}</span>`:''}${eDate(e)?`<span>DATE / ${esc(eDate(e))}</span>`:''}<span>MEDIA / ${esc(e.photographer||'Summit County Sports')}</span>${instagramEmbed(e.video_url)?'<span>VIDEO / STUDENT SECTION FILM</span>':''}${e.gallery.length?`<span>PHOTOS / ${e.gallery.length}</span>`:''}</div><p class="detail-summary">${esc(e.summary||'Photography and event coverage by Summit County Sports.')}</p>`;
    const images=(e.gallery||[]).map(imageSrc).filter(Boolean);
    const embeddedVideo=instagramEmbed(e.video_url);
    const videoHtml=embeddedVideo?`<div class="event-video"><iframe class="ig-embed" src="${esc(embeddedVideo)}" title="Watch ${esc(e.title)} on Instagram" loading="lazy" allowfullscreen></iframe><a href="${esc(extURL(e.video_url))}" target="_blank" rel="noopener noreferrer">WATCH ON INSTAGRAM ↗</a></div>`:'';
    const photoHtml=images.length?images.map((src,i)=>`<button class="gallery-item" type="button" data-image="${i}" aria-label="Enlarge photo ${i+1} of ${images.length}"><img src="${esc(src)}" loading="lazy" alt="${esc(e.title)} — photo ${i+1}"></button>`).join(''):embeddedVideo?'':`<div class="gallery-empty"><strong>${extURL(e.external_url)?'VIEW THE LIGHTROOM ALBUM BELOW.':'THE PHOTOS ARE ON THEIR WAY.'}</strong><p>${extURL(e.external_url)?'The shared photo album is linked below. Images will appear directly on Summit County Sports after the web-ready files are imported.':'This project is in the archive, but its full photo gallery hasn\'t been uploaded yet. Check back for new coverage.'}</p></div>`;
    gallery.innerHTML=videoHtml+photoHtml;
    const external=[['WATCH VIDEO ↗',extURL(e.video_url)],[String(e.external_url||'').includes('adobe.ly/')?'VIEW LIGHTROOM ALBUM ↗':'VIEW ADDITIONAL COVERAGE ↗',extURL(e.external_url)]].filter(x=>x[1]);links.innerHTML=external.map(([name,link])=>`<a class="btn" href="${esc(link)}" target="_blank" rel="noopener noreferrer">${name}</a>`).join('');
    const dialog=document.getElementById('lightbox');if(images.length&&dialog){let idx=0;const viewer=dialog.querySelector('img'), counter=dialog.querySelector('.lightbox-count');const show=()=>{viewer.src=images[idx];viewer.alt=e.title+' photo '+(idx+1);counter.textContent=(idx+1)+' / '+images.length};gallery.querySelectorAll('[data-image]').forEach(b=>b.addEventListener('click',()=>{idx=Number(b.dataset.image);show();dialog.showModal()}));dialog.querySelector('.close-lightbox').addEventListener('click',()=>dialog.close());dialog.querySelector('.lightbox-prev').addEventListener('click',()=>{idx=(idx-1+images.length)%images.length;show()});dialog.querySelector('.lightbox-next').addEventListener('click',()=>{idx=(idx+1)%images.length;show()});dialog.addEventListener('click',ev=>{if(ev.target===dialog)dialog.close()});dialog.addEventListener('keydown',ev=>{if(ev.key==='ArrowLeft'){idx=(idx-1+images.length)%images.length;show()}if(ev.key==='ArrowRight'){idx=(idx+1)%images.length;show()}});}
  }
})();
