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
- One boot-up sequence on load; on scroll the page rises over the hero while the
  picture moves down at half speed, blurs and darkens (plain JS scroll + rAF in
  Hero.astro, so it works in Safari too). A lens-opening effect was tried and dropped.
- Services: "same drone, different sensors" — a pinned control screen shows each
  service through its camera mode (SVG filters: thermal, survey; overlays for mesh,
  detection, cinema, live, grading). Photos from the current site, in src/assets/services.
- Team: real photos, cut out (src/assets/team). Each can get a looping portrait video:
  raw clips in media-src/team/<name>.mp4 (gitignored) → `npm run videos` (ffmpeg-static,
  720×720 square, WebM + MP4, no sound; --boomerang for a forward/back loop) →
  public/team/. Portrait.astro uses them only if the files exist and plays them only
  while on screen. Clips are generated from the avatars with Runware (Kling 2.5 Turbo
  Pro, same image as first and last frame for a seamless loop, ~$0.35 each):
  `node --env-file=.env scripts/generate-team-videos.mjs <name>` (RUNWARE_API_KEY in
  .env). Check frames before encoding; regenerate a take that looks off. Illustrated SVG avatars and WebGL-warped photos were tried and
  rejected by the client. Illustrated or traced avatars were tried
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

- `/formations-drone-a-lyon/`: same deck hero as /prestations/ (components/ui/DeckHero.astro).
  Formations in src/data/formations.ts.
- `/boutique/`: ShopHero = search + mega menu (5 tabs of category tiles, as on the
  current site; SHOP_MENU in data/catalog.ts, each tile is a catalogue filter).
- `/location-drone-et-camera/`: RentalHero = search + category tiles + featured packs.
- Heroes are deliberately different per page; do not reuse one hero everywhere.
- Search: /recherche.json (built), lib/search-client.ts, components/shop/SearchBox.astro.
- Pop (mascot) is everywhere: PopChat (layout, guided assistant, answers in the file,
  contextual per page, opens with [data-pop-open][data-pop-ask]) and PopTip (speech
  bubble with a pose from src/assets/pop/). Regulation advice in data/regulation.ts.
- `/produit/<slug>/` for all 152 products (same URLs as WordPress). Catalogue imported
  from the WooCommerce Store API by `node scripts/import-catalog.mjs` →
  src/data/catalog.json + src/assets/products/ (prices HT; TTC = ×1.2; rentals per day).
  Filters in src/data/catalog.ts. The team's per-product content (docs, rent/buy link,
  "Complétez votre équipement", "Découvrez le" + figures, "Ce qu'il faut savoir", "Pop
  vous conseille", "Pour qui ?", "Quel permis ?") is imported by
  `node scripts/import-product-pages.mjs` → src/data/product-pages.json and shown by
  components/shop/ProductStory.astro. Their "Quel permis ?" wins over the generic
  data/regulation.ts advice. Sale CTA = order request, rental = dates + estimate +
  booking request, both to /contact/ until the Stripe Worker exists.

Next: /contact/ (receives ?commande=, ?location=&du=&au=, ?formation=), Stripe checkout
and booking Worker, the 18 service pages, legal pages, redirect plan.
