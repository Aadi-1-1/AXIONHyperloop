# AXION Hyperloop

Company website, interactive network explorer, financial model and full-screen investor presentation for **AXION Hyperloop** — a concept and feasibility-stage proposal prepared for an investor-style school business pitch.

> AXION is not incorporated, licensed, funded or operating, and has no customers, partners or agreements. All financial figures are illustrative classroom assumptions in USD.

## Quick start

```bash
npm install
npm run dev            # http://localhost:5173
```

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload |
| `npm run verify` | Type check, lint, unit tests and production build |
| `npm run build` | Production build into `dist/` (path-based routing) |
| `npm run preview` | Serve the production build at http://localhost:4173 |
| `npm run e2e` | Browser verification suite against `npm run preview` (38 checks) |
| `npm run build:preview` | One self-contained HTML file with hash routing, in `dist-preview/` |

Requirements: Node 20+ (built with Node 22). The e2e suite uses Playwright with the Chromium at `/opt/pw-browsers/chromium`; set `PW_CHROMIUM` to point elsewhere.

## Routes

| URL | Page |
| --- | --- |
| `/` | Company homepage: opening, proposal, problem, products, shipment journey, benefits, network/commercial/leadership previews, investor invitation |
| `/network` | Network explorer, geography constraints, technology cutaway (`#technology`), feasibility gates (`#feasibility`) |
| `/business` | Business plan in 17 sections, including the operating explorer (`#operating-model`) and financing challenge |
| `/investors` | $50m ask, allocation, cash flow, gates, prospects, risks, construction financing, partner paths and demo enquiry form |
| `/evidence` | Evidence register, formulas, route limitations, research plan, technology status, sources |
| `/leadership` | Leadership team |
| `/present/<chapter>` | Full-screen presentation; `/present` starts at chapter 1 |

Presentation chapter slugs: `vision`, `problem`, `product`, `network`, `technology`, `market`, `business-model`, `financials`, `programme`, `ask`, `leadership`, `close`.

## Presenting

Open `/present` (or **Start Presentation** in the header).

- **← / →**, Page Up / Page Down, Space: previous / next chapter. **Home / End**: first / last.
- **M**: chapter menu. **N**: presenter notes (hidden by default). **F**: browser full screen. **Esc**: close menu or notes, then exit to the page you came from.
- The progress bar at the bottom is clickable; every chapter has its own URL.
- Chapters with a live tool show a button (for example **Open network explorer**). The tool opens with a **Return to chapter** bar that stays visible while you move around the site.
- Nothing advances automatically. With reduced motion enabled, slide transitions and map motion are switched off.

## Editing content

All business content lives in `src/data/`. Pages, charts and slides read from these files, so a change appears everywhere.

| File | Contents |
| --- | --- |
| `company.ts` | Name, tagline, stage notice, problem, products, benefits, segments, market-sizing framework, sales steps, competition table, equipment, HR, sustainability, risks |
| `leadership.ts` | The four executives, roles and responsibilities |
| `network.ts` | Phases, hubs (WGS84 city coordinates), corridors, statuses, crossings, assumptions and constraints |
| `finance.ts` | Development programme, staffing, spending, hypothetical 100 km corridor, operating defaults and control bounds |
| `technology.ts` | Cutaway systems and the five feasibility gates |
| `journey.ts` | The six shipment stages and customs notes |
| `prospects.ts` | Outreach targets, investor categories, investor path and partner paths |
| `sources.ts` | Source register with access dates |
| `evidence.ts` | Classified evidence register (sourced / assumption / calculated / ambition) |
| `presentation.ts` | Chapter order, titles and presenter notes (slide layouts are in `src/present/slides.tsx`) |

### Network data

- **Hubs** have `role: 'hub'` (proposed logistics hub) or `'transit'` (planning node in an intervening country).
- **Corridors** list an ordered `path` of hub ids, a `status` (`study`, `expansion`, `conceptual`), a `crossing` (`land`, `strait`, `sea`, `ocean`) and the `systems` they carry (`freight`, `passenger`).
- Pods are animated only where `animatesPods()` allows: never on `conceptual` corridors or `sea` / `ocean` crossings.
- Unit tests in `tests/network.test.ts` check ids, coordinates, references and the pod rule.

### Portraits

No portraits exist yet; profiles show initials. To add one, place an image in `public/team/` and set `portrait: '/team/<file>.jpg'` on that person in `leadership.ts`.

## Financial model

Every number is computed in `src/lib/finance.ts` from `src/data/finance.ts`. `tests/finance.test.ts` locks the specified results.

**Development programme:** a $50m ask over three years. The allocation lines sum to $50m. There are 30 employees at $120,000 fully loaded for 3 years, which gives $10.8m. That salary cost is **included** in the allocation: $4m in engineering, $2m in software and $4.8m in employees & administration. It is never added on top. Spending of $12m, $18m and $20m leaves closing cash of $38m, $20m and $0. No revenue is assumed.

**Hypothetical 100 km freight corridor (construction illustration):**

| Item | Amount |
| --- | --- |
| Infrastructure: 100 km × $20m/km | $2.0bn |
| Terminals: 2 × $75m | $150m |
| Pods, workshops and loading | $100m |
| Land, design and approvals | $150m |
| Subtotal | $2.4bn |
| Contingency at 25% | $600m |
| **Total** | **$3.0bn** |

**Operating explorer:**

```
Annual kg        = tonnes/day × 1,000 × operating days × utilisation
Revenue          = annual kg × price per kg
Variable costs   = annual kg × variable cost per kg
Operating result = revenue − variable costs − fixed operating costs
Break-even kg    = fixed costs ÷ (price − variable cost)   (none if price ≤ variable cost)
```

With the defaults (2,000 t/day, 350 days, $0.20/kg, $0.08/kg, $35m fixed):

| Utilisation | Freight | Revenue | Operating result |
| --- | --- | --- | --- |
| 30% | 210m kg | $42m | −$9.8m |
| 60% | 420m kg | $84m | $15.4m |
| 85% | 595m kg | $119m | $36.4m |

Operating break-even is about 291.7m kg, or 41.7% utilisation. Results are stated before depreciation, financing, tax and major renewals. The site does not present a valuation, equity offer, investor return or payback date.

## Project structure

```
src/
  data/          centralised content and assumptions
  lib/           pure logic: finance, geo, routing, enquiry validation, hooks
  components/    layout, header, footer, shared UI
  features/      network map, hero visual, journey, technology cutaway, finance charts, enquiry form, gates
  pages/         routed pages
  present/       presentation shell and slides
tests/           unit tests (Vitest)
e2e/             browser verification (Playwright) and screenshot helper
scripts/         preview inliner
```

Stack: React 19, TypeScript, Vite, React Router, d3-geo with world-atlas (110m) for the vector globe and map, and self-hosted Fontsource fonts (Archivo, Inter, IBM Plex Mono). There is no backend, database or WebGL dependency. The network globe is SVG, so it renders without WebGL.

## Deployment

The site is a static single-page app. Any host that rewrites unknown paths to `index.html` can serve `dist/` directly.

**Vercel:** import the repository. Framework preset is Vite, build command `npm run build`, output directory `dist`. `vercel.json` already contains the SPA rewrite.

**Netlify:** build command `npm run build`, publish directory `dist`. `public/_redirects` already contains the SPA rewrite.

**Hosts without rewrites** (GitHub Pages, a shared drive, a USB stick for the pitch room): run `npm run build:preview` and use `dist-preview/index.html`. This is one self-contained file with hash URLs (`index.html#/network`). It works offline and even from `file://`.

After deploying, open `/network`, `/business#operating-model` and `/present/financials` directly to confirm that deep links load.

## Honesty guardrails

- The leadership names, roles and the single "Founder" title are tested.
- Prospects are always labelled as potential roles, with a "Not contacted" status and a notice.
- Evidence items marked as sourced must cite a registered source, and every source has an access date.
- The enquiry form validates input but states before and after submission that nothing is sent.
