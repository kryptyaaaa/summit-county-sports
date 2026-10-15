/**
 * PASS03 independent music publication build.
 * Cloudflare Pages: command "node build-pass03.mjs"; output "_pass03_site".
 * Reuses ONLY published real concert records and licensed photo assets from
 * this repository, without changing Summit County Sports or Concerts output.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const output = path.join(root, '_pass03_site');
const domain = (process.env.PASS03_DOMAIN || 'https://pass03.com').replace(/\/+$/, '');
const source = path.join(root, 'pass03');
const eventsDir = path.join(root, 'content', 'events');
const uploadPrefix = 'assets/uploads/';
const toSlug = str => String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const isImage = value => typeof value === 'string' && /^assets\/uploads\/[a-zA-Z0-9/_ .-]+\.(?:jpe?g|png|webp|avif)$/i.test(value) && !value.includes('..') && !value.includes('\\') && fs.existsSync(path.join(root, value)) && fs.statSync(path.join(root, value)).isFile();
const dateSort = (a, b) => String(b.event_date || '').localeCompare(String(a.event_date || ''));
const events = fs.readdirSync(eventsDir).filter(name => name.endsWith('.json')).map(filename => {
  const event = JSON.parse(fs.readFileSync(path.join(eventsDir, filename), 'utf8'));
  if (event.category !== 'Concerts' || event.published === false) return null;
  const slug = toSlug(filename.replace(/\.json$/, ''));
  const selected = Array.isArray(event.gallery) ? event.gallery : (event.gallery ? [event.gallery] : []);
  const automatic = [];
  if (event.auto_gallery === true) {
    const folder = path.join(root, uploadPrefix, slug);
    if (fs.existsSync(folder) && fs.statSync(folder).isDirectory()) {
      for (const file of fs.readdirSync(folder).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))) {
        const relative = uploadPrefix + slug + '/' + file;
        if (isImage(relative)) automatic.push(relative);
      }
    }
  }
  const gallery = [...new Set([...selected, ...automatic].filter(isImage))];
  const cover = isImage(event.cover) ? event.cover : (gallery[0] || '');
  const allPhotos = [...new Set([cover, ...gallery].filter(Boolean))];
  return {
    slug,
    title: String(event.title || ''),
    category: 'Concerts',
    event_date: event.event_date || '',
    location: event.location || '',
    artist: event.artist || '',
    venue: event.venue || '',
    short_label: event.short_label || '',
    summary: event.summary || '',
    photographer: event.photographer || '',
    article_headline: event.article_headline || '',
    article_dek: event.article_dek || '',
    article_body: event.article_body || '',
    article_source_url: event.article_source_url || '',
    featured: event.featured === true,
    cover,
    gallery: allPhotos,
  };
}).filter(Boolean).sort((a, b) => Number(b.featured) - Number(a.featured) || dateSort(a, b));

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
for (const name of ['index.html', 'live.html', 'press.html', 'contribute.html', 'site.js', 'styles.css']) {
  fs.copyFileSync(path.join(source, name), path.join(output, name));
}
const images = new Set();
for (const event of events) {
  for (const photo of event.gallery) images.add(photo);
}
for (const photo of images) {
  const dest = path.join(output, photo);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(path.join(root, photo), dest);
}
fs.writeFileSync(path.join(output, 'content.json'), JSON.stringify({
  publication: 'PASS03',
  contact_email: 'pass03media@gmail.com',
  events,
}, null, 2));

const xml = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const urls = [domain + '/', domain + '/press.html', domain + '/contribute.html']
  .concat(events.map(event => domain + '/live.html?slug=' + encodeURIComponent(event.slug)));
fs.writeFileSync(path.join(output, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(url => '  <url><loc>' + xml(url) + '</loc></url>').join('\n') + '\n</urlset>\n');
fs.writeFileSync(path.join(output, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: ' + domain + '/sitemap.xml\n');
fs.writeFileSync(path.join(output, 'favicon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#0b0b0b"/><text x="100" y="118" fill="#f6f4ef" font-size="75" text-anchor="middle" font-family="Arial,sans-serif" font-weight="900" letter-spacing="-7">P03</text></svg>');
fs.writeFileSync(path.join(output, '_headers'), '/*\n  X-Content-Type-Options: nosniff\n  X-Frame-Options: DENY\n  Referrer-Policy: strict-origin-when-cross-origin\n');
console.log('PASS03 built:', events.length, 'published concert stories;', images.size, 'original photos. Output:', output);



// Generate crawlable, fully rendered article pages, not JavaScript-dependent
// "Loading concert story" shells. The homepage links directly to these pages.
const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const articleUrl = event => '/stories/' + event.slug + '/';
const niceDate = value => {
  if (!value) return 'DATE UNAVAILABLE';
  const d = new Date(String(value) + 'T12:00:00');
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString('en-US', {month:'short',day:'numeric',year:'numeric'}).toUpperCase();
};
const cleanSource = value => /^https:\/\/[^<>"'\s]+$/i.test(value || '') ? value : '';
const heading = event => escapeHTML(event.article_headline || event.title);
const cards = events.map(event => {
  const image = event.cover ? '<img loading="lazy" src="/' + escapeHTML(event.cover) + '" alt="' + escapeHTML(event.title) + ' — concert photography">' : '';
  const desc = event.article_dek || event.summary || 'Original PASS03 live-music photo coverage';
  return '<a class="entry" href="' + articleUrl(event) + '">' +
    '<div class="photo">' + image + '</div>' +
    '<div class="meta"><span>' + escapeHTML(niceDate(event.event_date)) + '</span><span>' + escapeHTML(event.venue || event.location || 'LIVE REPORT') + '</span></div>' +
    '<h3>' + heading(event) + '</h3><p class="desc">' + escapeHTML(desc) + '</p><span class="arrow">READ STORY ↗</span></a>';
}).join('\n');
let home = fs.readFileSync(path.join(source, 'index.html'), 'utf8');
const placeholder = '<div id="coverage-grid" class="grid" aria-live="polite"><p class="empty">Loading the live archive.</p></div>';
if (!home.includes(placeholder)) throw Error('PASS03 homepage archive placeholder changed; aborting build.');
home = home.replace(placeholder, '<div id="coverage-grid" class="grid" aria-live="polite">' +
  (cards || '<p class="empty">Original music stories coming soon.</p>') + '</div>');
home = home.replace('ORIGINAL PHOTOGRAPHY / LIVE DOCUMENTATION</p>', events.length + (events.length === 1 ? ' PUBLISHED STORY' : ' PUBLISHED STORIES') + ' / ORIGINAL COVERAGE</p>');
const featured = events.find(event => event.featured && event.cover) || events.find(event => event.cover) || events[0];
if (featured) {
  home = home.replace('class="hero-art" href="#coverage"', 'class="hero-art" href="' + articleUrl(featured) + '"');
  home = home.replace('id="feature-kicker">FROM THE LIVE ARCHIVE', 'id="feature-kicker">' +
    escapeHTML(niceDate(featured.event_date) + ' / ' + (featured.venue || 'LIVE REPORT')));
  home = home.replace('id="feature-title" class="feature-title">MUSIC IN REAL TIME.', 'id="feature-title" class="feature-title">' + heading(featured));
  if (featured.cover) home = home.replace('<img id="feature-image" alt="" hidden>',
    '<img id="feature-image" src="/' + escapeHTML(featured.cover) + '" alt="' + escapeHTML(featured.title) + ' concert photo">');
}
// No client-side fetch is necessary for the homepage or the article cards.
home = home.replace('<script src="/site.js" defer></script>', '');
fs.writeFileSync(path.join(output, 'index.html'), home);

const articleTemplate = fs.readFileSync(path.join(source, 'live.html'), 'utf8');
const storyPlaceholder = '<div id="story-container" aria-live="polite"><p class="empty">Loading concert story…</p></div>';
if (!articleTemplate.includes(storyPlaceholder)) throw Error('PASS03 story template placeholder changed; aborting build.');
for (const event of events) {
  const slug = articleUrl(event);
  const articleDir = path.join(output, 'stories', event.slug);
  fs.mkdirSync(articleDir, {recursive:true});
  const lead = event.article_dek || event.summary || '';
  const body = String(event.article_body || event.summary || '').split(/\n\s*\n/).filter(Boolean)
    .map(paragraph => '<p>' + escapeHTML(paragraph.trim()).replace(/\n/g, '<br>') + '</p>').join('\n');
  const gallery = event.gallery.map((photo, i) => '<a href="/' + escapeHTML(photo) +
    '" target="_blank" rel="noopener" aria-label="Open concert photo ' + (i + 1) + '">' +
    '<img loading="lazy" src="/' + escapeHTML(photo) + '" alt="' + escapeHTML(event.title) +
    ' photo ' + (i + 1) + '"></a>').join('\n');
  const originalSource = cleanSource(event.article_source_url);
  const sourceLink = originalSource ? '<p><a class="textlink" href="' + escapeHTML(originalSource) +
    '" target="_blank" rel="noopener noreferrer">EVENT SOURCE ↗</a></p>' : '';
  const article = '<div class="meta"><span>' + escapeHTML(niceDate(event.event_date)) +
    '</span><span>' + escapeHTML(event.venue || event.location || 'LIVE REPORT') +
    '</span><span>PHOTOS: ' + escapeHTML(event.photographer || 'PASS03 CONTRIBUTOR') + '</span></div>' +
    '<h1>' + heading(event) + '</h1>' +
    '<p class="story-dek">' + escapeHTML(lead) + '</p>' +
    (event.cover ? '<img class="story-cover" src="/' + escapeHTML(event.cover) + '" alt="' +
      escapeHTML(event.title) + ' concert photo">' : '') +
    '<article class="story-body">' + body + '<div class="story-credit">PHOTO CREDIT / ' +
      escapeHTML(event.photographer || 'PASS03 CONTRIBUTOR') + ' · ' +
      escapeHTML(event.venue || event.location || 'LIVE MUSIC') + ' · ' +
      escapeHTML(niceDate(event.event_date)) + '</div>' + sourceLink + '</article>' +
    (gallery ? '<span class="eyebrow">THE PHOTO ESSAY / ' + event.gallery.length +
      ' FRAMES</span><div class="photo-grid">' + gallery + '</div>' : '') +
    '<p class="status">EDITORIAL INQUIRIES: PASS03MEDIA@GMAIL.COM</p>';
  let page = articleTemplate.replace(storyPlaceholder, '<div id="story-container">' + article + '</div>');
  page = page.replace('<script src="/site.js" defer></script>', '');
  page = page.replace('<title>Live Coverage | PASS03</title>',
    '<title>' + heading(event) + ' | PASS03</title>');
  page = page.replace('<link rel="canonical" href="https://pass03.com/live.html">',
    '<link rel="canonical" href="' + domain + slug + '">');
  page = page.replace('<meta property="og:url" content="https://pass03.com/live.html">',
    '<meta property="og:url" content="' + domain + slug + '">');
  page = page.replace('<meta property="og:title" content="Live Coverage | PASS03">',
    '<meta property="og:title" content="' + heading(event) + ' | PASS03">');
  page = page.replace(/<meta name="description" content="[^"]*">/,
    '<meta name="description" content="' + escapeHTML(lead).slice(0, 155) + '">');
  page = page.replace('<meta property="og:type" content="website">',
    '<meta property="og:type" content="article">');
  fs.writeFileSync(path.join(articleDir, 'index.html'), page);
}
// Preserve old ?slug= bookmarks by routing to the permanent, static article URL.
let legacy = articleTemplate.replace('<script src="/site.js" defer></script>',
  '<script>const slug=new URLSearchParams(location.search).get("slug");if(slug&&/^[a-z0-9-]+$/.test(slug)){location.replace("/stories/"+slug+"/");}</script>');
legacy = legacy.replace(storyPlaceholder,
  '<div id="story-container"><p class="empty">This article has moved to its permanent page. <a class="textlink" href="/#coverage">BROWSE STORIES ↗</a></p></div>');
fs.writeFileSync(path.join(output, 'live.html'), legacy);
fs.writeFileSync(path.join(output, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  [domain + '/', domain + '/press.html', domain + '/contribute.html',
    ...events.map(e => domain + articleUrl(e))].map(url => '  <url><loc>' + xml(url) + '</loc></url>').join('\n') +
  '\n</urlset>\n');
console.log('PASS03 rendered static story pages:', events.map(e => articleUrl(e)).join(', '));
