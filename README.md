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
