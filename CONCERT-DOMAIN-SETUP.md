# Summit County Concerts — second domain launch

This repository powers **two separate sites** from one photo/content archive.

- Sports production: `https://summitcountysports.com` — deployed by GitHub Pages using `node build.mjs`.
- Concerts production: `https://summitcountyconcerts.com` — deploy with Cloudflare Pages using `node build-concerts.mjs`.

## Domain purchase (owner action)

1. Register **summitcountyconcerts.com** at https://domains.cloudflare.com/ if available.
2. Keep access to the same Cloudflare account for the Pages project.
3. Verify the registration email if Cloudflare requests it.
4. Do not share account passwords or payment details.

## Cloudflare Pages setup

In **Cloudflare → Workers & Pages → Create → Pages → Connect to Git**, authorize GitHub and connect the existing repo:

`kryptyaaaa/summit-county-sports`

Use these exact build settings:

| Field | Value |
| --- | --- |
| Project name | `summit-county-concerts` (or another available name) |
| Framework preset | None |
| Production branch | `main` |
| Root directory | repository root (leave blank) |
| Build command | `node build-concerts.mjs` |
| Build output directory | `_concerts_site` |
| Node.js | 22 |

After the initial deployment succeeds, the new `*.pages.dev` URL should show **Summit County Concerts**, not Sports. Check gallery links and photos.

In **Pages project → Custom domains → Set up a domain**, add `summitcountyconcerts.com`. Also add `www.summitcountyconcerts.com` if the owner wants the www alias; configure it to redirect to the non-www primary domain.

Cloudflare normally handles DNS for domains registered with Cloudflare. Check SSL/HTTPS and the domain status before telling anyone it's launched.

## Release checklist

- [ ] Domain purchased and verified by the owner
- [ ] Pages project connected to GitHub with correct build configuration
- [ ] Initial deployment succeeded at the `*.pages.dev` preview URL
- [ ] Concert archive contains the expected real event galleries
- [ ] Gallery detail URLs, photos, and back links work on mobile
- [ ] Custom domain resolves over HTTPS
- [ ] Navigation on sports pages is updated to point to `https://summitcountyconcerts.com/`
- [ ] Old `https://summitcountysports.com/concerts.html` URL redirects to the concert domain after launch
- [ ] Submit the concert sitemap to Google Search Console (optional)

**Do not change the existing sports-site CNAME, DNS, GitHub Pages deployment or sports navigation until the new concerts domain works.**

## Build details

`node build-concerts.mjs` builds the existing sports site into `_site`, then generates a standalone `_concerts_site` with the concert homepage, concert gallery detail page, only concert gallery images, its own canonical/meta links, `robots.txt`, `sitemap.xml`, and redirects.

Concert stories and photos are still authored through `content/events/*.json` and the shared uploads folder. The builder filters on `category: "Concerts"`.

The main site currently links to its original `concerts.html` portal. Switch that link **only after** the custom domain is verified live.
