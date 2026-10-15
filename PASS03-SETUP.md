# PASS03 — independent publication launch

All PASS03 launch work is isolated on the "pass03-launch" branch. The existing live sports and concerts websites remain unchanged.

## Built

- pass03/index.html — editorial homepage, featured coverage, live archive and contact
- pass03/live.html — full concert reports with photo gallery and interactive photo viewer
- pass03/press.html — editorial and credential contact information
- pass03/contribute.html — contributor inquiries and assignment expectations
- pass03/styles.css and pass03/site.js — responsive design and interactive archive
- build-pass03.mjs — generates a standalone site from the shared real concert gallery records and copies ONLY published concert image assets

The output folder is _pass03_site.

New real concert articles can be authored using the existing Pages CMS gallery collection, category Concerts, and uploaded images. Do not publish unverified event details. Retain photographer credits and usage rights.

## Cloudflare Pages setup

After merging the PASS03 feature branch to main, use your EXISTING Cloudflare account:

1. Open Cloudflare Dashboard -> Workers & Pages -> Create -> Pages -> Connect to Git.
2. Authorize GitHub, then choose repository kryptyaaaa/summit-county-sports.
3. Make a NEW Pages project named pass03 (do not change existing Sports or Concerts deployments).
4. Production branch: main.
5. Root directory: repository root (blank).
6. Build command: node build-pass03.mjs
7. Output directory: _pass03_site
8. Node.js runtime: 22 or later.
9. Deploy. Verify gallery, articles, press links, and mobile rendering at the provided pages.dev preview URL.
10. In that PASS03 Pages project, open Custom domains and add the exact purchased domain. Check DNS and HTTPS before publicizing.

If the purchased domain is NOT pass03.com, set PASS03_DOMAIN environment variable to https://YOUR-ACTUAL-DOMAIN, and change the canonical and Open Graph URLs in pass03 HTML files before the launch.

DO NOT modify the sports CNAME, sports GitHub Pages workflow or existing Summit County Concerts Cloudflare Pages configuration.

## Connections / sign-offs

- Verified connected: pass03media@gmail.com.
- Verified GitHub repository access: kryptyaaaa/summit-county-sports.
- Metricool: only Summit County Sports was listed at the last check. Create a distinct PASS03 brand and connect Instagram for post scheduling.
- Confirm actual owned domain and Instagram handle; pass03.com and instagram.com/pass03 are provisional until confirmed.

The site does NOT claim automatic press access, guarantee publication or invent any upcoming shows. Previously credited work retains the original photographer credit. Agree to terms and rights before assigning contributors.
