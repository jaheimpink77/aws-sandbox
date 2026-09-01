# Side by Side Support Services — marketing site

A single-page marketing site for Side by Side Support Services Company: commercial and domestic
cleaning and clearance across London, Essex and the Home Counties. Eight services, an
accountability story, coverage areas, and a call/WhatsApp conversion band.

Conversion is by **phone and WhatsApp only**. There is no form, no online booking and no pricing
on the page — that is a deliberate decision in the design, not an omission.

Built from the `Vantage_Clean_website_design` handoff (the "Side by Side Site" design reference)
on the **Industry** design system.

---

## Running it

There is no build step. The site is static HTML, CSS and one small script — open `index.html`,
or serve the folder:

```sh
npm run serve      # http://localhost:8080  (any static server will do)
```

Nothing needs Node at runtime. Deployment is configured for **Vercel** (see below), but the
site is just files — S3 + CloudFront, Netlify, Cloudflare Pages or nginx would serve it equally
well, given the same headers.

## Layout

```
index.html                 the page — one route, no dynamic data
styles/industry.css        the Industry design system, vendored unmodified
styles/site.css            brand ramps, the two colour contexts, page layout, breakpoints
scripts/site.js            the mobile menu; the page's only script
scripts/apply-contact.mjs  rewrites every contact detail from contact.json
scripts/csp.mjs            keeps the CSP hashes in vercel.json matching index.html
contact.json               phone, WhatsApp, email, site URL — the single source of truth
vercel.json                hosting: headers, caching, the apex redirect
.vercelignore              repository files that are not part of the site
assets/                    logos, favicons, hero photograph
```

---

## Deploying to Vercel

`vercel.json` configures the project; there is no build step, so Vercel uploads the repository
and serves it. `.vercelignore` keeps the files that are not part of the site — this README,
`contact.json`, `package.json` and the two maintenance scripts — out of the deployment.

### First-time setup

Connecting the GitHub repository is the better of the two routes: every push to the default
branch deploys, and every pull request gets its own preview URL.

1. At [vercel.com/new](https://vercel.com/new), import `jaheimpink77/aws-sandbox`.
2. Framework preset **Other**. Leave the build command and output directory alone —
   `vercel.json` sets them.
3. Deploy, then add the domains under **Settings → Domains**: `www.sidebysidesupportservice.com`
   as the primary, and the apex `sidebysidesupportservice.com` alongside it. The apex redirect
   is already declared in `vercel.json`, so do **not** also configure a redirect in the
   dashboard — one or the other, not both.
4. Point DNS at Vercel with the records the dashboard shows for each domain.

Or, from a machine logged in to the right Vercel account:

```sh
npx vercel link          # once, to attach this directory to a project
npx vercel --prod        # deploy
```

### Verify the first deploy

The config is worth confirming once against the live URL, since some of it cannot be tested
locally:

```sh
curl -sI https://www.sidebysidesupportservice.com/ | grep -i 'content-security\|cache-control'
curl -sI https://sidebysidesupportservice.com/     | grep -i 'location'   # expect the www URL, 308
curl -sI https://www.sidebysidesupportservice.com/README.md               # expect 404
```

Then load the page and check the console is clean — a CSP mistake shows up there and nowhere
else.

### What the headers do

- **Caching.** `assets/`, `styles/` and `scripts/` get a day in the browser and a week of
  `stale-while-revalidate`; `/` is always revalidated so copy changes go live immediately.
  The filenames are *not* content-hashed, which is why none of them is `immutable` — a replaced
  hero photograph would otherwise stay cached. If you add fingerprinted filenames later, raise
  that to a year.
- **Content-Security-Policy.** `default-src 'self'` with Google Fonts allowed, no inline styles,
  no framing, no forms. The two inline `<script>` blocks — the `no-js` line and the JSON-LD —
  are allowed by SHA-256 hash, because Chrome applies `script-src` to JSON-LD too and drops it
  silently otherwise.

  > The hashes are generated, never hand-edited. `apply-contact.mjs` rewrites the JSON-LD, which
  > changes its hash, so `npm run contact` regenerates them and `npm run check` fails if
  > `vercel.json` and `index.html` have drifted apart. **If you edit either inline script, run
  > `npm run contact`.**

- The rest are the standard set: `nosniff`, `DENY` framing, a conservative `Referrer-Policy`,
  and a `Permissions-Policy` switching off features the page does not use.

HSTS is not set here — Vercel manages it for custom domains.

---

## Before launch — outstanding placeholders

The hero photograph is the last thing from the mock still in the page. `npm run check` fails if
any mock contact detail reappears, so it is worth wiring into CI.

| Item | Placeholder | Where |
| --- | --- | --- |
| Hero photograph | `assets/hero-*.jpg` | Unsplash stock — see **Assets** |

Every contact detail is now the client's real one:

- **Phone** `07337 211695` — a UK mobile, so WhatsApp carries it as `447337211695` and the
  structured data as `+447337211695`. Header, hero, CTA band, footer, structured data, and four
  `wa.me` links.
- **Email** `info@sidebysidesupportservice.com` — footer and structured data.
- **Site URL** `https://www.sidebysidesupportservice.com/` — canonical, Open Graph, structured
  data. Point the apex at the `www` host with a 301 rather than serving both, or the canonical
  and the served URL will disagree.

Change any of them in `contact.json` and re-run:

```sh
npm run contact    # rewrites index.html
npm run check      # fails while mock placeholders remain
```

Never hand-edit a contact detail in `index.html` — it appears in thirteen places. The script
matches by shape rather than by current value, so it stays usable after each swap, and it is
idempotent: running it twice changes nothing.

### Claims policy — read before editing copy

Earlier drafts of this design carried invented figures: insurance cover amounts, working hours,
guarantee windows, response times, reach heights. **They were deliberately removed.** Do not
reintroduce numeric claims — insurance values, response times, guarantee periods, staff counts,
years trading, review scores — unless the client supplies and approves them in writing. The
current copy makes qualitative commitments only. This is legal/ASA exposure, not a style
preference.

---

## How the styling works

Two stylesheets, loaded in order. **`styles/industry.css` is vendored and should not be
edited** — it is the design system as shipped, so it can be replaced wholesale when the system
is updated. Everything specific to this site lives in `styles/site.css`, which does three
things:

1. **Re-tones the accent ramps.** The system ships steel blue; the brand is navy `#17386e` and
   green `#3aa845`, regenerated as full 100–900 ramps.

2. **Defines the two colour contexts.** `.dark` (the page) and `.lightbar` (the header) each
   redefine the *same* set of custom properties, so components read `var(--color-*)` and
   re-tone automatically. There is one set of components, not two.

   > Any rule that assumes a context must be scoped to `.dark` or `.lightbar`. Without that
   > scoping the dark button treatment leaks into the light header and the header actions lose
   > contrast — the single easiest thing to break in this page.

3. **Lays out the sections** against those tokens.

### House rules, restated because they are easy to break

- **Radius is 0 everywhere.** Nothing is rounded. This is a defining rule of the system, and
  the vendored stylesheet enforces it for the shared components.
- Borders are 1px hairlines; there are no shadows anywhere on this page.
- Cards, figures and the primary button are **blueprint objects** — square, hairline-framed,
  with a `+` registration mark at each corner. Never drop the marks from a framed element.
- No decorative colour beyond navy and green. If icons are ever introduced, they are Lucide at
  stroke-width 1.5.

### One deliberate deviation

The design system draws the corner marks with four `<i class="corner">` children inside every
framed element. `site.css` draws the identical geometry — an 11px cross centred on each corner
of the border box — from a single `.blueprint::before` pseudo-element instead, so eight service
cards do not need thirty-two empty elements. The system's own `.blueprint > .corner` rules are
untouched and still work if you prefer the markup form.

---

## Responsive behaviour

The design is specified at 1280px desktop only; the breakpoints are this implementation's.

| Width | Behaviour |
| --- | --- |
| ≤ 1080px | Hero H1 steps down to 56px |
| ≤ 960px | Services, why-us and areas grids go 4 → 2 columns; footer 4 → 2 |
| ≤ 900px | Nav collapses behind a menu button; gutters 32 → 20px; smaller hero image |
| ≤ 720px | Everything single column; hero H1 40px; section padding tightens |
| ≤ 430px | Wordmark and the phone number inside the Call button drop; hero buttons go full width |

**The Call and WhatsApp buttons stay visible at every width.** They are the entire conversion
path and most of this traffic will be mobile — do not move them behind the menu toggle.

When the four-column grids stack, the 1px vertical rules between cells become horizontal ones.
That is handled generically with `:nth-child` rules that strip the trailing edge of each row and
column, so the same markup re-flows at any column count.

Still worth proposing to the client: a sticky bottom call/WhatsApp bar on mobile.

## Accessibility

- Skip link to `#main`; the mobile menu is a real `<button>` with `aria-expanded` and
  `aria-controls`, closes on link click and on Escape, and returns focus to the toggle.
- Focus is styled with the system's 2px accent `:focus-visible` ring — the browser default is
  never shipped.
- Anchor targets carry `scroll-margin-top` so headings clear the 82px sticky header.
- `scroll-behavior: smooth` and all transitions are disabled under
  `prefers-reduced-motion: reduce`.
- Without JavaScript the nav links stay inline rather than hiding behind a dead toggle
  (`.no-js`); the whole page works with scripting off.

---

## Assets

| File | Notes |
| --- | --- |
| `assets/logo-mark.png`, `logo-word.png` | Derived from the client's raster logo, white keyed out |
| `assets/logo-lockup.png` | Footer. The artwork is navy, so it sits on a white plate — on the navy ground it would disappear |
| `assets/favicon-32.png`, `favicon-180.png` | The roundel |
| `assets/hero-2000.jpg`, `hero-1200.jpg` | **Unsplash stock, placeholder** (Priscilla Du Preez) |

Two things to chase with the client:

1. **Vector artwork (SVG/AI/EPS).** The supplied logo was a navy-on-white raster; the PNGs here
   were derived from it. Raster will not hold up at retina sizes, in the favicon, or in print.
2. **Real photography of the team on site**, to replace the stock hero. If the stock image does
   ship, confirm the licence and credit.

The hero was resampled from the 5472px original to 2000px and 1200px and served by media query;
the source is in the design handoff if larger crops are ever needed.

## Fonts

Barlow and Barlow Condensed load from Google Fonts. The link is in `index.html` (with
`preconnect`) so the request starts early — the vendored stylesheet also `@import`s the same
URL, which the browser dedupes.

If the client wants to avoid a third-party request — a fair ask for a UK business on GDPR
grounds — self-host the two families in `assets/fonts/` and drop both the `<link>` and the
`@import`. The CSP already allows `'self'` for styles and fonts, so nothing there has to change
either; you can then drop the two `fonts.g*.com` entries from it.
