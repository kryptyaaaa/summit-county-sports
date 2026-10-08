import fs from 'node:fs';
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
const data = { site, events };
const js = `/* Generated from Pages CMS gallery files. Regenerate with node build.mjs. */\nwindow.SCS_CONTENT = ${JSON.stringify(data, null, 2).replace(/</g, '\\u003c')};\n`;
const contentPath = path.join(root, 'assets', 'content-data.js');
fs.writeFileSync(contentPath, js);
fs.rmSync(target, { recursive: true, force: true });
fs.mkdirSync(path.join(target, 'assets', 'uploads'), { recursive: true });
const copy = p => { const destination = path.join(target, p); fs.mkdirSync(path.dirname(destination), { recursive: true }); fs.copyFileSync(path.join(root, p), destination); };
['index.html', 'portfolio.html', 'event.html', 'styles.css', 'app.js', 'assets/logo.svg', 'assets/favicon.svg', 'assets/content-data.js'].forEach(copy);
let count = 0;
for (const event of events) {
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
