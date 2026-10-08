# Summit County Sports — red & black website

A photography/media site for Summit County Sports with a real, **no-code gallery editor** once you complete the one-time connection.

## What's inside

- `index.html` — branded home page, plus a featured event (currently Byron Nelson Volleyball Media Day).
- `portfolio.html` — gallery cards, category filters, and cover photos.
- `event.html` — one page per gallery, with full-screen clickable images and optional video links.
- `.pages.yml` — configuration for the Pages CMS editing dashboard.
- `content/events/*.json` — each event's title, captions, gallery images, and links.
- `assets/uploads/` — where uploaded photos go.
- `content/site.json` — social and contact information you can edit in the dashboard.
- `build.mjs` — builds the public website automatically from gallery content; Node 18+.

**CURRENT STATUS:** Byron Nelson Volleyball Media Day has all **122 web-ready JPEGs** committed under `assets/uploads/byron-nelson-volleyball-media-day/`, and its gallery entry points to those files. Netlify is connected and was publishing successfully before this gallery upload. Verify the latest deployment in Netlify. Pages CMS still needs authorization in your GitHub account before browser-based editing can be used.

## Publish once and enable easy photo uploads

1. Create or use a **GitHub** account. Make a new repository named `summit-county-sports` (private is fine if your hosting integrations permit). Upload all files from **this site folder**, including the hidden `.pages.yml` file. The repository's root should contain `index.html`, `netlify.toml`, `.pages.yml`, `content`, and `assets` (not an extra enclosing folder).
2. On **Netlify** (https://app.netlify.com), choose **Add new project → Import an existing project**, connect that GitHub repository. This package includes `netlify.toml` so Netlify can run `node build.mjs` and publish the generated `_site` folder. If asked for settings manually: **Build command:** `node build.mjs`; **Publish directory:** `_site`.
3. Open **Pages CMS** at https://app.pagescms.org, sign in with GitHub, install/authorize its GitHub App to access that repository, and open your `summit-county-sports` project. The included `.pages.yml` will show **Event Galleries** and **Site Info & Contact**. Pages CMS is a separate editor service, not a page on your public website. You can bookmark it.
4. To add photos to **Byron Nelson Volleyball Media Day**, click **Event Galleries → Byron Nelson Volleyball Media Day**, choose a cover photo, then use **Gallery Photos** to select/upload multiple JPG/WebP images. Click **Save**. To publish a new event, click **New** under Event Galleries, enter its title/category, choose photos, keep **Visible on Site** enabled, and save.
5. Pages CMS saves edits and uploaded images to GitHub. Netlify detects repository changes, rebuilds, and updates the published website automatically. Changes may take some time to appear depending on deploy processing.
6. In Pages CMS → **Site Info & Contact**, set the actual Summit County Sports Instagram and outlet email. Right now the site links to Mason's known @masontookem Instagram instead of inventing an outlet address or handle.
7. Optional: buy a domain and connect it in Netlify's domain settings; it is not included and no domain was registered for you.

### Image upload recommendations

- Export sRGB JPGs or WebP, about **2000–3000 pixels on the long edge**, quality ~75–85, typically under ~2–4 MB each for fast-loading galleries. Don't upload full-resolution RAW files.
- Upload several photos at a time and save. Large galleries with hundreds of full-size images will make the Git-backed editor slow; split into events or optimize first.
- Upload a dedicated **Cover Image** for the gallery listing and add the full set in **Gallery Photos**. Only files referenced by *published* events get copied to the public `_site` build folder.
- A gallery without images shows a transparent 'photos coming soon' graphic.

## Preview and check

- On most computers, open the root `index.html` after extracting the ZIP. The initial gallery content is bundled, so it works even when opened as a local file.
- For a full local server, in this folder run `node build.mjs` then `python3 -m http.server 8000 -d _site`. Visit http://localhost:8000 .
- Run `node build.mjs` any time content is edited outside Pages CMS.

## Project status / verification

- Red and black responsive branding: included.
- Byron Nelson media day landing page: included.
- Working client-side portfolio filters and image lightbox: included.
- Gallery editor integration: configured, requires Pages CMS authorization through GitHub.
- Netlify: connected; confirm the most recent deployment is published. A custom domain has not been configured.
- Actual photos: **122 Byron Nelson JPEGs included in GitHub** (`assets/uploads/byron-nelson-volleyball-media-day/`).
- Byron Nelson description references its verified **2025** MaxPreps championship, not an unverified live 2026 ranking. Source: https://www.maxpreps.com/news/HaLCvCcN5EOFQrL4Sm8Vdw/byron-nelson-volleyball-team-presented-with-maxpreps-national-championship-banner-at-pep-rally.htm
