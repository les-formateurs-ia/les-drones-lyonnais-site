# Les Drones Lyonnais — Website

Public website for **Les Drones Lyonnais**, drone operators based in Lyon working across
France: drone services (aerial filming, inspection, 3D/topography, audiovisual),
training, equipment sales (shop) and equipment rental.

Current production site: https://www.lesdroneslyonnais.com/ (WordPress + Elementor +
WooCommerce, WooCommerce Bookings for rental, WooPayments). No orders or bookings have
been recorded on it, so there is no customer data to migrate.

The goal is to replace it with a code-based site that is faster, better designed and
easier to evolve. Treat the current site as a content, business and SEO reference — not
as a technical or visual constraint.

## Stack

- Astro (static), TypeScript, Tailwind CSS 4
- Cloudflare for hosting
- Stripe for payments (test keys during development), via Stripe Checkout
- Cloudflare Worker + D1 later, only for dynamic data (orders, bookings, availability)
- Playwright for visual QA

No React by default. Minimal client JavaScript — the homepage ships none.

## Commerce decisions (agreed)

- Shop and rental use **different devices**: two independent systems, no shared stock.
- Shop: catalogue in the repo, cart + Stripe Checkout session created by a Worker,
  prices checked server side.
- Rental, v1: availability shown on the site, booking *request* (dates + pilot
  certificate), manual validation, then a Stripe payment link with deposit.
  Card authorisations expire after ~7 days: save the card (SetupIntent) and place the
  hold or charge just before / after the rental.
- No Shopify, no Booqable.

## SEO migration

- Keep indexed URLs (trailing slash, as on WordPress). The sitemaps list ~25 pages,
  10 posts, 153 products (`/produit/...`), 42 product categories, 10 brands.
- Clean up with 301 redirects: duplicate pages (`*-2/`, two wedding pages), technical
  pages (`rent-grid`, `rent-list`, `modele`, `thank-you`), messy categories.
- Never silently break an indexed URL.

## Structure

src/
  pages/           routes
  layouts/         BaseLayout
  components/      layout/, home/, seo/, ui/
  data/            typed business data (site.ts = single source of truth)
  assets/          images optimised by astro:assets
  styles/          global.css (design tokens)
public/            fonts, favicon, robots.txt

## Homepage motion (client request: a "wow" effect)

- First screen = only the choice between the activities, full screen (client request):
  a live "drone camera" view (feed + on-screen flight data). The four activities are
  its flight modes: pointing at one switches the feed; modes cycle until the first
  interaction. Feeds are photos from the current site until the client provides short
  aerial videos (one per activity, muted loop, ≤ 3 MB each).
  The h1 is the small caption above the modes.
- One boot-up sequence on load; on scroll the camera zooms to the reticle, which opens
  like a lens (registered --lens radius + radial mask on .hero) and reveals the page
  behind. The page is held still during the opening (index.astro: .dive track of
  200svh, .after-dive pulled up by 100svh with a scroll-driven translate).
- Services: "same drone, different sensors" — a pinned control screen shows each
  service through its camera mode (SVG filters: thermal, survey; overlays for mesh,
  detection, cinema, live, grading). Photos from the current site, in src/assets/services.
- Team: real photos, cut out (src/assets/team), shown by components/ui/Portrait.astro
  in black and white, colour when in focus. Illustrated or traced avatars were tried
  and rejected by the client: keep real photos.
- Coverage: pinned map of France (src/data/france-map.ts, IGN Admin Express, Licence
  ouverte — keep the credit) zooming to Lyon on scroll; "Toute la France" overrides.
- Reveals fire once (`data-reveal` + `src/lib/reveal.ts`, the only client script).
- Scroll-linked effects are native CSS scroll-driven animations inside
  `@supports (animation-timeline: …)`, always written with longhands
  (`animation-name`, `animation-timeline`…): the minifier folds a timeline into the
  `animation` shorthand, which browsers reject.
- Everything has a still version under `prefers-reduced-motion: reduce`.

## Working method

Inspect before changing. Small focused components. Reuse `data/site.ts`.
For any UI work: build, run locally, review desktop / tablet / mobile with Playwright,
check hover, focus, overflow and reduced motion, fix, review again.

Skills: `ldl-art-direction` (identity), `seo-production`, `visual-qa`,
`astro-cloudflare`, plus the design-engineering skills (`emil-design-eng`, `animate`,
`review-animations`, `frontend-design`…).

## Pages built

- `/` homepage (proof of concept).
- `/prestations/` services hub: technical / artistic choice (hero with Dylan's cut-out),
  both catalogues (identical 16:10 cards, black and white until pointed at), five-step
  method, quote request. Services live in src/data/services.ts (single source for the
  homepage screen and this page); photos are cropped by lib/service-photo.ts.

Next: the 18 service pages (URLs listed in data/services.ts), then training, shop,
rental, and the redirect plan.
