# Payback Own website

Marketing landing page for the Payback Own app, built with Next.js (App Router) and deployed on Vercel.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint (eslint-config-next)
npm run typecheck  # tsc --noEmit
npm run build      # production build; `/` is prerendered as static HTML
npm test           # unit tests (Node's built-in runner)
```

Requires Node.js 20.9 or newer.

## Where to change things

| What | Where |
| --- | --- |
| App Store / Google Play URLs | `STORE_LINKS` in `lib/site.ts` |
| Copy lists (pillars, CAMPS steps, value strip, social links) | `lib/site.ts` |
| Page sections | `components/*.tsx`, composed in `app/page.tsx` inside `SiteShell` (shared header/footer) |
| Contact page and form | `app/contact/page.tsx`, `components/ContactForm.tsx`, logic in `lib/contact.ts` |
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

## Contact form

`/contact` emails each submission to the team through [Resend](https://resend.com). The visitor's address is set as reply-to.

Environment variables (Vercel → Project → Settings → Environment Variables, Production and Preview):

| Key | Example | Notes |
| --- | --- | --- |
| `RESEND_API_KEY` | `re_…` | Secret. Sending-only key scoped to the verified domain. |
| `CONTACT_TO_EMAIL` | `team@paybackdigital.com` | Inbox that receives submissions. |
| `CONTACT_FROM_EMAIL` | `Payback Website <contact@notifications.paybackdigital.com>` | Must use the domain verified in Resend. |

If any of these are missing, the page still renders and the form replies that it's unavailable. Spam protection has no
third-party script:
- a hidden honeypot field
- a signed "form issued at" token, so bots can't post without loading the page, and submissions under 3 seconds are ignored
- server-side validation, including a cap on links

The page renders per request so every visitor gets a fresh token.

## Deployment

The Vercel project is linked to this repository. Pushes to `main` deploy to production, and pull
requests get preview deployments.
