# Sneak-it-in VSL Call Funnel

A mobile-first React funnel for the Sneak-it-in System by Ari Sokol (Swolekol LLC).

## Routes

| Path | Purpose |
|------|---------|
| `/` | Main funnel — same copy, men + women testimonials |
| `/male` | Same copy as `/`, men-only testimonials |
| `/female` | Same copy as `/`, women-only testimonials |
| `/booking` | Calendly embed for 45-minute strategy call |
| `/post-booking` | Pre-call Loom video, prep checklist, and FAQ |
| `/privacy` | Privacy policy |
| `/terms` | Terms of Service |
| `/disclaimer` | Health and results disclaimer |

All three funnel pages share one hero, VSL, application form, and page structure. The only difference is which testimonials appear in the scrolling banners and client story videos.

## Ad & social deep links

Point Meta ads, Instagram bio, or story links to:

- `https://<your-domain>/` — mixed audience
- `https://<your-domain>/male` — men-only social proof
- `https://<your-domain>/female` — women-only social proof

## Calendly redirect (automatic)

After someone books on `/booking`, the site listens for Calendly's `calendly.event_scheduled` postMessage event (via the official inline embed script) and sends them to `/post-booking` automatically.

**In Calendly event settings:** turn **off** the built-in confirmation page redirect for this event type. If both are enabled, invitees may redirect twice. The embed handles the redirect in-app.

Reference: [Calendly advanced embed for developers](https://help.calendly.com/hc/en-us/articles/223519768-Advanced-Calendly-embed-for-developers)

## Development

```bash
npm install
npm run dev
```

Compress media before committing large assets:

```bash
npm run compress-assets
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`

`vercel.json` is included for SPA routing on all paths.

## Sitemap

`npm run build` generates `public/sitemap.xml` and `public/robots.txt` before the Vite build. Indexed funnel URLs are `/`, `/male`, and `/female`. URLs use, in order:

1. `VITE_SITE_URL` (e.g. `https://www.yourdomain.com`)
2. `VERCEL_URL` on Vercel deploys
3. `https://sneakitinfitness.com` as fallback

Submit `https://<your-domain>/sitemap.xml` in Google Search Console.

## Brand assets

Transformation photos live in `assets/men/` and `assets/women/`. The hosted VSL is `assets/VSL.mp4` (compress from `assets/ARi SOKOL revision.mp4` via `npm run compress-assets`). Copy and voice guidelines are in `BrandDoc.md`. Ad URL reference is in `MetaAds.md`.
