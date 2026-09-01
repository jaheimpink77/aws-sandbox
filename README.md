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

Deploying is a file copy: upload the repository contents (minus `scripts/`, `contact.json`,
`package.json` and the dotfiles) to any static host — S3 + CloudFront, Netlify, Cloudflare
Pages, nginx. Nothing needs Node at runtime.

## Layout

```
index.html                 the page — one route, no dynamic data
styles/industry.css        the Industry design system, vendored unmodified
styles/site.css            brand ramps, the two colour contexts, page layout, breakpoints
scripts/site.js            the mobile menu; the page's only script
scripts/apply-contact.mjs  rewrites every contact detail from contact.json
contact.json               phone, WhatsApp, email, site URL — the single source of truth
assets/                    logos, favicons, hero photograph
```

---

## Before launch — outstanding placeholders

Every one of these came from the design mock and **must be replaced**. `npm run check` fails
while any of them is still in the page, so it is worth wiring into CI.

| Item | Placeholder | Where |
| --- | --- | --- |
| Phone number | `020 3918 4151` | Header, hero, CTA band, footer, structured data |
| WhatsApp number | `442039184151` | Five `wa.me` links |
| Email | `hello@sidebysidesupport.co.uk` | Footer, structured data |
| Site URL | `https://www.sidebysidesupport.co.uk/` | Canonical, Open Graph, structured data |
| Hero photograph | `assets/hero-*.jpg` | Unsplash stock — see **Assets** |

To swap them, edit `contact.json` and run:

```sh
npm run contact    # rewrites index.html
npm run check      # fails while mock placeholders remain
```

The script matches by shape rather than by current value, so it stays usable after the first
swap, and it is idempotent — running it twice changes nothing.

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
`@import`. Nothing else has to change.
