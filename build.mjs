import fs from 'node:fs';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.dirname(fileURLToPath(import.meta.url));
const eventsDir = path.join(root, 'content', 'events');
const target = path.join(root, '_site');
const toSlug = v => String(v).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const site = JSON.parse(fs.readFileSync(path.join(root, 'content', 'site.json'), 'utf8'));
const events = fs.readdirSync(eventsDir).filter(f => f.endsWith('.json')).map(file => {
  const raw = JSON.parse(fs.readFileSync(path.join(eventsDir, file), 'utf8'));
  return {
    ...raw,
    slug: toSlug(path.basename(file, '.json')),
    gallery: Array.isArray(raw.gallery) ? raw.gallery : (raw.gallery ? [raw.gallery] : []),
    published: raw.published !== false,
  };
}).filter(e => e.published).sort((a, b) => Number(!!b.featured) - Number(!!a.featured) || String(b.event_date || '').localeCompare(String(a.event_date || '')) || a.title.localeCompare(b.title));
const photoIsAvailable = value => {
  if (typeof value !== 'string' || !value) return false;
  if (/^https?:\/\//i.test(value)) return true;
  const clean = value.replace(/^\/+/, '');
  return clean.startsWith('assets/uploads/') && !clean.includes('..') && fs.existsSync(path.join(root, clean));
};
// Galleries with auto_gallery enabled discover image files uploaded directly to
// assets/uploads/<event-slug>/ on every build. Other galleries retain curated order.
const automaticGalleryImages = event => {
  if (event.auto_gallery !== true) return [];
  const directory = `assets/uploads/${event.slug}`;
  const absolute = path.join(root, directory);
  if (!fs.existsSync(absolute) || !fs.statSync(absolute).isDirectory()) return [];
  return fs.readdirSync(absolute, { withFileTypes: true })
    .filter(file => file.isFile() && /\.(jpe?g|png|webp|avif)$/i.test(file.name))
    .map(file => `${directory}/${file.name}`)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));
};
const publicEvents = events.map(event => {
  const curated = event.gallery.filter(photoIsAvailable);
  const gallery = [...new Set([...curated, ...automaticGalleryImages(event)])];
  return {
    ...event,
    cover: photoIsAvailable(event.cover) ? event.cover : (gallery[0] || ''),
    gallery,
  };
});
const data = { site, events: publicEvents };
const js = `/* Generated from Pages CMS gallery files. Regenerate with node build.mjs. */\nwindow.SCS_CONTENT = ${JSON.stringify(data, null, 2).replace(/</g, '\\u003c')};\n`;
const contentPath = path.join(root, 'assets', 'content-data.js');
fs.writeFileSync(contentPath, js);
fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(path.join(target, 'assets', 'uploads'), { recursive: true });
// Bake fresh gallery data into each HTML page, rather than relying on a
// separately cached content-data.js file that can show an outdated portfolio.
const inlineGalleryData = `<script>${js}</script>`;
const assetVersion = file => crypto.createHash('sha256').update(fs.readFileSync(path.join(root, file))).digest('hex').slice(0,12);
const copy = p => {
  const destination = path.join(target, p);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (p.endsWith('.html')) {
    const html = fs.readFileSync(path.join(root, p), 'utf8');
    const externalDataScript = /<script defer src="assets\/content-data\.js[^"]*"><\/script>/;
    if (!externalDataScript.test(html)) throw new Error(`Gallery data script missing from ${p}`);
    const current = html.replace(externalDataScript, inlineGalleryData)
      .replace(/app\.js\?v=[^"]+/g, `app.js?v=${assetVersion('app.js')}`)
      .replace(/styles\.css\?v=[^"]+/g, `styles.css?v=${assetVersion('styles.css')}`);
    fs.writeFileSync(destination, current);
  } else {
    fs.copyFileSync(path.join(root, p), destination);
  }
};
['index.html', 'portfolio.html', 'event.html', 'styles.css', 'app.js', 'assets/logo.svg', 'assets/favicon.svg', 'assets/content-data.js'].forEach(copy);
let count = 0;
for (const event of publicEvents) {
  for (const image of [event.cover, ...event.gallery]) {
    if (typeof image !== 'string' || !image) continue;
    const clean = image.replace(/^\//, '');
    if (!clean.startsWith('assets/uploads/') || clean.includes('..')) continue;
    const imagePath = path.join(root, clean);
    if (fs.existsSync(imagePath)) { copy(clean); count++; }
    else console.warn('Uploaded image not found:', clean);
  }
}
console.log(`Site build successful: ${events.length} published galleries, ${count} photo references. Public output: _site/`);
