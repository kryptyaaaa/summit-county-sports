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
