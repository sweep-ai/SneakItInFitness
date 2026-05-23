# Sneak-it-in VSL Call Funnel

A mobile-first React funnel for the Sneak-it-in System by Ari Sokol (Swolekol LLC).

## Routes

| Path | Purpose |
|------|---------|
| `/` | Gender-neutral VSL page with both testimonial banners |
| `/male` | Redirects to `/male/systems` |
| `/female` | Redirects to `/female/cultural` |
| `/male/cultural` | Men's VSL, cultural/traditions angle |
| `/male/work` | Men's VSL, 9 to 5 / busy lifestyle angle |
| `/male/systems` | Men's VSL, structure and consistency angle |
| `/female/cultural` | Women's VSL, cultural/traditions angle |
| `/female/work` | Women's VSL, 9 to 5 / busy lifestyle angle |
| `/female/systems` | Women's VSL, structure and consistency angle |
| `/booking` | Calendly embed for 45-minute strategy call |
| `/post-booking` | Pre-call Loom video, prep checklist, and FAQ |
| `/privacy` | Privacy policy |
| `/terms` | Terms of Service |
| `/disclaimer` | Health and results disclaimer |

## Instagram deep links

Point bio or story links directly to:

- `https://<your-domain>/` (neutral)
- `https://<your-domain>/male/systems`
- `https://<your-domain>/male/work`
- `https://<your-domain>/male/cultural`
- `https://<your-domain>/female/cultural`
- `https://<your-domain>/female/work`
- `https://<your-domain>/female/systems`

## Calendly redirect (automatic)

After someone books on `/booking`, the site listens for Calendly's `calendly.event_scheduled` postMessage event (via the official inline embed script) and sends them to `/post-booking` automatically.

**In Calendly event settings:** turn **off** the built-in confirmation page redirect for this event type. If both are enabled, invitees may redirect twice. The embed handles the redirect in-app.

Reference: [Calendly advanced embed for developers](https://help.calendly.com/hc/en-us/articles/223519768-Advanced-Calendly-embed-for-developers)

## Development

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Import the project in [Vercel](https://vercel.com).
3. Framework preset: **Vite**
4. Build command: `npm run build`
5. Output directory: `dist`

`vercel.json` is included for SPA routing on all paths.

## Brand assets

Transformation photos live in `assets/men/` and `assets/women/`. Copy and voice guidelines are in `BrandDoc.md`.
