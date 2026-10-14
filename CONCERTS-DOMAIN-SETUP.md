# summitcountyconcerts.com — launch checklist

Summit County Concerts will be a standalone public website powered by the same GitHub repository, photos, articles, and Pages CMS editor as summitcountysports.com. Do not change the GitHub Pages domain of the sports repository.

## How the websites coexist

- summitcountysports.com stays on the current GitHub Pages deployment. Its sports homepage and galleries are unchanged.
- summitcountyconcerts.com is a NEW Cloudflare Pages project. The existing Concerts design becomes its homepage, while each published show keeps its own gallery URL.
- Both deployments build from the SAME GitHub repository on each push. Concert galleries update from the shared content/events collection; no double uploading is needed.
- The new concerts website links SPORTS and TEAM back to summitcountysports.com.
- Until you purchase and connect the domain, the new custom domain will not resolve.

## Connect after you purchase summitcountyconcerts.com

1. Go to https://dash.cloudflare.com/ and sign in or create a Cloudflare account.
2. Under Workers & Pages, create a new Pages application and connect GitHub.
3. Select the existing repository: kryptyaaaa/summit-county-sports. Give the new project a name such as summit-county-concerts. Do NOT remove or migrate the sports site's existing GitHub Pages setup.
4. Use branch: main; framework preset: None.
5. In the build settings enter:
   - Build command: node build-concerts.mjs
   - Build output directory: _concerts_site
   - Root directory: repository root (/)
6. Deploy and open the new pages.dev preview. The homepage should show Summit County Concerts, live shows should open concert-event.html galleries, and SPORTS should link to summitcountysports.com.
7. In the Cloudflare Pages project go to Custom domains -> Set up a domain; enter summitcountyconcerts.com. Optionally also add www.summitcountyconcerts.com and redirect www to the main address.
8. For an apex (root) domain, Cloudflare Pages requires the domain to be a Cloudflare zone. If you purchased at another registrar, follow Cloudflare's instructions to change the domain's nameservers. Wait for DNS and HTTPS verification.
9. Check both sites after activation, and publish a concert gallery to test that both automatically update.

## Why a second hosting project?

The current sports site is served from GitHub Pages with summitcountysports.com as its only custom domain. Do NOT replace its CNAME or change its GitHub Pages settings. A separate Cloudflare Pages project gives Summit County Concerts an independent homepage and domain while reusing the exact same source content.

## One publishing workflow

Continue using content/events/*.json and assets/uploads/<event-slug>/ for photos. Any published event with category "Concerts" appears on the dedicated domain automatically. Sports events do not appear on the concerts-only deployment.

Build scripts:
- Existing sports site: node build.mjs (output _site)
- New concerts site: node build-concerts.mjs (output _concerts_site)

Cloudflare docs:
- https://developers.cloudflare.com/pages/get-started/git-integration/
- https://developers.cloudflare.com/pages/configuration/build-configuration/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
