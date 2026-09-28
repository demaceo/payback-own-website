# Payback Own website

Marketing landing page for the Payback Own app, built with Next.js (App Router) and deployed on Vercel.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint (eslint-config-next)
npm run typecheck  # tsc --noEmit
npm run build      # production build; `/` is prerendered as static HTML
```

Requires Node.js 20.9 or newer.

## Where to change things

| What | Where |
| --- | --- |
| App Store / Google Play URLs | `STORE_LINKS` in `lib/site.ts` |
| Copy lists (pillars, CAMPS steps, value strip, social links) | `lib/site.ts` |
| Page sections | `components/*.tsx`, composed in `app/page.tsx` |
| Styles and brand tokens | `app/globals.css` (`:root` variables) |
| Title, description, Open Graph | `SITE` in `lib/site.ts`, wired in `app/layout.tsx` |
| Tab icon | `app/icon.svg` (brand mark on a `#05060E` tile) and `app/favicon.ico` (16/32/48 px, legacy browsers) |
| iOS home-screen icon | `app/apple-icon.png` (180×180) |
| Android icons / web manifest | `public/icons/icon-192.png`, `public/icons/icon-512.png`, `app/manifest.ts` |
| Social share image | `app/opengraph-image.png` + `app/twitter-image.png` (1200×630) and their `.alt.txt` files |

## How it works

- **Static first.** Every section is a server component, so the page ships as prerendered HTML.
  The only client-side code is `components/PageEffects.tsx` (sticky header shadow, scroll reveal,
  gauge animation, store-badge highlighting, Product Hunt banner).
- **Smart download link.** `/download` redirects iPhones to the App Store and Android phones to
  Google Play. Everyone else, or any platform without a live listing yet, goes to the on-page badges.
  The QR code in the closing card encodes this URL and is generated at build time.
- **Site URL.** Canonical and QR URLs use `NEXT_PUBLIC_SITE_URL` when set. Otherwise they use Vercel's
  production domain (`VERCEL_PROJECT_PRODUCTION_URL`). Set `NEXT_PUBLIC_SITE_URL` when a custom
  domain is attached.

## Deployment

The Vercel project is linked to this repository. Pushes to `main` deploy to production, and pull
requests get preview deployments.
