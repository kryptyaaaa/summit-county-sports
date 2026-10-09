# Summit County Sports

A red-and-black photography and sports-media portfolio showcasing independent coverage across Ohio and beyond.

## Free hosting: GitHub Pages

This site is published through **GitHub Pages**, using a GitHub Actions workflow in `.github/workflows/pages.yml`. Netlify was the previous hosting provider and is not required for GitHub Pages.

- **Repository:** https://github.com/kryptyaaaa/summit-county-sports
- **GitHub Pages settings:** https://github.com/kryptyaaaa/summit-county-sports/settings/pages
- **Expected GitHub Pages address, once enabled:** https://kryptyaaaa.github.io/summit-county-sports/
- **Deployments:** https://github.com/kryptyaaaa/summit-county-sports/actions

### One-time activation

1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment → Source**, select **GitHub Actions** (not “Deploy from a branch”).
3. On **Actions**, run the **Publish Summit County Sports** workflow if it has not deployed automatically. Wait for the deployment job to show success.
4. Open the published URL shown in the GitHub Pages settings or in the completed workflow.

After activation, every push to the `main` branch will run `node build.mjs` and automatically publish the generated `_site` folder. The workflow checks that all three currently published galleries have their expected photo files before deploying. For a new gallery, update the integrity check counts as needed if those checks are intended to cover it.

**Important:** The old Netlify project may remain connected to the repository and could attempt to deploy future changes when its credits reset. Once the new GitHub Pages site is verified live, disconnect GitHub or disable auto-publishing in the old Netlify project to avoid unwanted credit usage.

## Upload baseball photos without editing anything

**St. Vincent–St. Mary vs GlenOak (2025–26):** [Open the upload folder](https://github.com/kryptyaaaa/summit-county-sports/tree/main/assets/uploads/stvm-vs-glenoak-baseball-2025-26).

1. Open the folder link while signed into GitHub.
2. Click **Add file → Upload files**. Select your edited JPG, JPEG, PNG, WebP or AVIF photos; **do not upload a ZIP**. GitHub's browser upload accepts up to 100 files per batch.
3. Click **Commit changes**. This starts the automatic GitHub Pages build.

The website **automatically discovers every supported image in this folder**, sorts the filenames naturally, displays them in the baseball gallery, and uses the first image as the cover **without editing any gallery JSON**. To change the cover later, specify a `cover` path in the event JSON; otherwise it automatically uses the first uploaded photo. To remove a picture, delete that file from this folder. Other games won't be affected.

**Upload only photos from this game into this folder.** Prefer optimized sRGB JPGs (roughly 2000–3000px on the long edge) so the site loads quickly.

## Published galleries

| Event | Photos | Gallery JSON |
| --- | ---: | --- |
| Byron Nelson Volleyball Media Day | 111 | `content/events/byron-nelson-volleyball-media-day.json` |
| Jackson Volleyball Media Day | 24 | `content/events/jackson-volleyball-media-day.json` |
| Wadsworth Girls Volleyball Media Day | 41 | `content/events/wadsworth-girls-volleyball.json` |

All 176 original gallery website JPEGs are in `assets/uploads/`. The gallery's `cover` image and ordered `gallery` images come from its JSON file. The build copies only the image files actually referenced by published events.

## Editing galleries

Pages CMS editor configuration is in `.pages.yml` and can be authorized at https://app.pagescms.org . Pages CMS is separate from GitHub Pages hosting; it edits the same repository.

- Event details and image order: `content/events/*.json`.
- Site branding and contact details: `content/site.json`.
- Gallery image files: `assets/uploads/<event-slug>/`.
- Main site UI: `index.html`, `portfolio.html`, `event.html`, `app.js`, `styles.css`.

For best performance, export sRGB JPG/WebP photos about 2000–3000 pixels on the long edge. Keep uploads organized in their respective event folders.

## Local development

Run `node build.mjs` (Node 18+), then `python3 -m http.server 8000 -d _site` and open http://localhost:8000 . The output folder `_site/` is generated during the publishing workflow.

## About

This portfolio is independently built for Summit County Sports. Its photography and media credits belong to the original photographers.

## Concert photography and live music

Concerts belong to the **Concerts** portfolio category (not "More"). The homepage has a dedicated Concerts link in "What We Cover," and the main navigation links to [the concert archive](https://kryptyaaaa.github.io/summit-county-sports/portfolio.html?category=Concerts).

For each real show, create one JSON file in `content/events/<artist-or-show>-<venue>-<date>.json`, using `category: "Concerts"`. Give it a clear `title`, `event_date` (YYYY-MM-DD), `location`, optional `artist` and `venue`, `photographer`, `summary`, and `auto_gallery: true`. Use `published: false` until images are ready, then publish. Set `featured: true` only if you want a homepage Spotlight card. Optional `video_url` supports YouTube, Vimeo, and Instagram links.

Create an upload folder at `assets/uploads/<same-event-slug>/` (with a `.gitkeep` if it's empty) and upload edited JPG/WebP/PNG/AVIF photos there. The site build discovers them automatically. To choose a cover, set `cover` to an image path within that folder. The individual artist or venue does **not** need its own website or external hosting.
