/**
 * Build the standalone Summit County Concerts website from the SAME gallery
 * files as Summit County Sports. This build does not change the sports site.
 *
 * Cloudflare Pages: build command "node build-concerts.mjs"
 *                   output directory "_concerts_site"
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const source = path.join(root, '_site');
const output = path.join(root, '_concerts_site');
const domain = 'https://summitcountyconcerts.com';

// Run the same production gallery builder as the existing sports website.
// That guarantees the two sites share the same published photos and articles.
execFileSync(process.execPath, [path.join(root, 'build.mjs')], {
  cwd: root,
  stdio: 'inherit',
});

const dataJS = fs.readFileSync(path.join(source, 'assets/content-data.js'), 'utf8');
const match = dataJS.match(/window\.SCS_CONTENT\s*=\s*([\s\S]*);\s*$/);
if (!match) throw new Error('Cannot read generated gallery data.');
const allData = JSON.parse(match[1]);
const concertEvents = allData.events.filter(e => e.category === 'Concerts' && e.published !== false);
const concertData = { ...allData, events: concertEvents };
const inlineScript = '<script>window.SCS_CONTENT = ' +
  JSON.stringify(concertData).replace(/</g, '\\u003c') + ';</script>';

fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });

function copy(relativePath) {
  const from = path.join(source, relativePath);
  const to = path.join(output, relativePath);
  if (!fs.existsSync(from)) throw new Error('Required published file missing: ' + relativePath);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
}

function writePage(sourceName, outputName) {
  let html = fs.readFileSync(path.join(source, sourceName), 'utf8');
  const embeddedContent = /<script>\/\* Generated from Pages CMS gallery files\.[\s\S]*?<\/script>/;
  if (!embeddedContent.test(html)) throw new Error('Concert page is missing its gallery data: ' + sourceName);
  html = html.replace(embeddedContent, inlineScript);

  // In the concerts-only deployment, the music archive is its homepage.
  // Sports and the shared team page always link to their original domain.
  html = html
    .replace(/href="concerts\.html(?=[#"])/g, 'href="/')
    .replace(/href="index\.html(?=[#"])/g, 'href="https://summitcountysports.com/')
    .replace(/href="team\.html"/g, 'href="https://summitcountysports.com/team.html"')
    .replace(/href="portfolio\.html"/g, 'href="https://summitcountysports.com/portfolio.html"');

  if (sourceName === 'concerts.html') {
    html = html
      .replace('https://summitcountysports.com/concerts.html', domain + '/')
      .replace('https://summitcountysports.com/concerts.html', domain + '/');
  }
  if (sourceName === 'concert-event.html') {
    html = html.replace('SUMMIT COUNTY SPORTS</small>', 'SUMMIT COUNTY CONCERTS</small>');
    // Gallery details have query-based URLs: generate their canonical on load.
    const canonical = '<script>const concertSlug=new URLSearchParams(location.search).get("slug");' +
      'if(concertSlug){const link=document.createElement("link");link.rel="canonical";' +
      'link.href="' + domain + '/concert-event.html?slug="+encodeURIComponent(concertSlug);' +
      'document.head.appendChild(link);}</script>';
    html = html.replace('</head>', canonical + '</head>');
  }
  fs.writeFileSync(path.join(output, outputName), html);
}

writePage('concerts.html', 'index.html');
writePage('concert-event.html', 'concert-event.html');

for (const asset of [
  'styles.css', 'app.js', 'concerts.css', 'concerts.js',
  'assets/logo.svg', 'assets/favicon.svg'
]) copy(asset);

// Copy only concert photos, not the thousands of sports-only pictures.
let imageCount = 0;
const copied = new Set();
for (const event of concertEvents) {
  for (const image of [event.cover, ...(event.gallery || [])]) {
    if (typeof image !== 'string') continue;
    const clean = image.replace(/^\/+/, '');
    if (!clean.startsWith('assets/uploads/') || clean.includes('..') || clean.includes('\\')) continue;
    if (copied.has(clean)) continue;
    copy(clean);
    copied.add(clean);
    imageCount++;
  }
}

fs.mkdirSync(path.join(output, 'assets'), { recursive: true });
fs.writeFileSync(path.join(output, 'assets/content-data.js'),
  'window.SCS_CONTENT = ' + JSON.stringify(concertData).replace(/</g, '\\u003c') + ';\n');

const escapeXML = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const urls = [domain + '/', ...concertEvents.map(e => domain + '/concert-event.html?slug=' + encodeURIComponent(e.slug))];
fs.writeFileSync(path.join(output, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  urls.map(url => '  <url><loc>' + escapeXML(url) + '</loc></url>').join('\n') +
  '\n</urlset>\n');
fs.writeFileSync(path.join(output, 'robots.txt'),
  'User-agent: *\nAllow: /\n\nSitemap: ' + domain + '/sitemap.xml\n');
fs.writeFileSync(path.join(output, '_redirects'),
  '/concerts.html / 301\n/team.html https://summitcountysports.com/team.html 302\n');
console.log('Concerts website ready: ' + concertEvents.length + ' shows, ' +
  imageCount + ' images. Output: _concerts_site/');
