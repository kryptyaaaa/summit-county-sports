(function () {
  'use strict';
  var $ = function (selector, root) { return (root || document).querySelector(selector); };
  var el = function (tag, className, textValue) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (typeof textValue === 'string') node.textContent = textValue;
    return node;
  };
  var prettyDate = function (value) {
    if (!value) return 'DATE TO BE ANNOUNCED';
    var d = new Date(value + 'T12:00:00');
    return isNaN(d.getTime()) ? value : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase();
  };
  var photoUrl = function (value) { return typeof value === 'string' && /^assets\/uploads\/[a-zA-Z0-9/_ .-]+\.(jpg|jpeg|png|webp|avif)$/i.test(value) && value.indexOf('..') < 0 ? '/' + value : ''; };
  var link = function (event) { return '/live.html?slug=' + encodeURIComponent(event.slug); };
  var currentYear = $('#year'); if (currentYear) currentYear.textContent = String(new Date().getFullYear());
  var type = location.pathname.toLowerCase().endsWith('live.html') ? 'story' : 'home';
  if (type === 'home' && !$('#coverage-grid')) return;
  if (type === 'story' && !$('#story-container')) return;
  fetch('/content.json', { cache: 'no-store' }).then(function (res) {
    if (!res.ok) throw new Error('Archive unavailable');
    return res.json();
  }).then(function (data) {
    var events = Array.isArray(data.events) ? data.events : [];
    if (type === 'home') {
      var grid = $('#coverage-grid');
      grid.textContent = '';
      var count = $('#archive-count');
      if (count) count.textContent = events.length + (events.length === 1 ? ' PUBLISHED STORY' : ' PUBLISHED STORIES') + ' / ORIGINAL COVERAGE';
      if (!events.length) {
        grid.append(el('p', 'empty', 'The archive is being prepared. For upcoming coverage inquiries, contact pass03media@gmail.com.'));
        return;
      }
      var featured = events.find(function (event) { return event.featured && event.cover; }) || events.find(function (event) { return event.cover; }) || events[0];
      var featureTitle = $('#feature-title'), featureKicker = $('#feature-kicker'), featureImg = $('#feature-image'), featureLink = $('#feature-link');
      featureTitle.textContent = featured.article_headline || featured.title;
      featureKicker.textContent = prettyDate(featured.event_date) + ' / ' + (featured.venue || 'LIVE MUSIC');
      featureLink.href = link(featured);
      if (photoUrl(featured.cover)) {
        featureImg.src = photoUrl(featured.cover);
        featureImg.alt = featured.title + ' concert photograph';
        featureImg.hidden = false;
      }
      events.forEach(function (event) {
        var card = el('a', 'entry'); card.href = link(event);
        var picture = el('div', 'photo');
        if (photoUrl(event.cover)) {
          var img = el('img');
          img.src = photoUrl(event.cover); img.loading = 'lazy'; img.alt = event.title + ' concert photography';
          picture.append(img);
        }
        card.append(picture);
        var meta = el('div', 'meta');
        meta.append(el('span', '', prettyDate(event.event_date)));
        meta.append(el('span', '', event.location || event.venue || 'LIVE COVERAGE'));
        card.append(meta);
        card.append(el('h3', '', event.article_headline || event.title));
        card.append(el('p', 'desc', event.article_dek || event.summary || 'View concert coverage and photography.'));
        card.append(el('span', 'arrow', 'READ STORY ↗'));
        grid.append(card);
      });
    } else {
      var slug = new URLSearchParams(location.search).get('slug') || '';
      var event = events.find(function (item) { return item.slug === slug; });
      var container = $('#story-container'); container.textContent = '';
      if (!event) { container.append(el('h1', '', 'STORY NOT FOUND.')); container.append(el('p', 'empty', 'This report is not in the published archive.')); return; }
      document.title = (event.article_headline || event.title) + ' | PASS03';
      var summaryMeta = $('meta[name="description"]'); if (summaryMeta) summaryMeta.content = (event.article_dek || event.summary || '').slice(0, 160);
      var meta = el('div', 'meta');
      [prettyDate(event.event_date), event.venue || event.location || 'LIVE REPORT', event.photographer ? 'PHOTOS: ' + event.photographer : 'PASS03 / EDITORIAL'].forEach(function (value) { meta.append(el('span', '', value)); });
      container.append(meta);
      container.append(el('h1', '', event.article_headline || event.title));
      if (event.article_dek || event.summary) container.append(el('p', 'story-dek', event.article_dek || event.summary));
      if (photoUrl(event.cover)) {
        var cover = el('img', 'story-cover');
        cover.src = photoUrl(event.cover); cover.alt = event.title + ' concert photography'; cover.fetchPriority = 'high';
        container.append(cover);
      }
      var body = el('article', 'story-body');
      (event.article_body || event.summary || '').split(/\n\s*\n/).filter(Boolean).forEach(function (p) { body.append(el('p', '', p.trim())); });
      var credit = el('div', 'story-credit', 'PHOTO CREDIT / ' + (event.photographer || 'PASS03 CONTRIBUTOR') + '  ·  ' + (event.venue || event.location || 'LIVE MUSIC') + '  ·  ' + prettyDate(event.event_date));
      body.append(credit);
      if (typeof event.article_source_url === 'string' && /^https:\/\//.test(event.article_source_url)) {
        var p = el('p');
        var a = el('a', 'textlink', 'EVENT SOURCE ↗');
        a.href = event.article_source_url; a.target = '_blank'; a.rel = 'noopener noreferrer';
        p.append(a); body.append(p);
      }
      container.append(body);
      var gallery = Array.isArray(event.gallery) ? event.gallery : [];
      gallery = gallery.filter(photoUrl);
      if (gallery.length) {
        container.append(el('span', 'eyebrow', 'THE PHOTO ESSAY / ' + gallery.length + ' FRAMES'));
        var galleryGrid = el('div', 'photo-grid');
        var dialog = $('#lightbox'), large = dialog ? $('img', dialog) : null, close = dialog ? $('.close', dialog) : null;
        if (close) close.addEventListener('click', function () { dialog.close(); });
        gallery.forEach(function (photo, index) {
          var button = el('button'); button.type = 'button'; button.title = 'Expand photo ' + (index + 1);
          var img = el('img'); img.src = photoUrl(photo); img.alt = (event.title || 'Concert') + ', image ' + (index + 1); img.loading = 'lazy';
          button.append(img);
          button.addEventListener('click', function () { if (dialog && large) { large.src = img.src; large.alt = img.alt; dialog.showModal(); } });
          galleryGrid.append(button);
        });
        container.append(galleryGrid);
      }
      var end = el('p', 'status', 'FOR PRESS & EDITORIAL INQUIRIES: PASS03MEDIA@GMAIL.COM');
      container.append(end);
    }
  }).catch(function () {
    var target = type === 'story' ? $('#story-container') : $('#coverage-grid');
    if (target) target.textContent = 'The archive could not be loaded. Please contact pass03media@gmail.com.';
  });
}());