# AXION Hyperloop

Company website, network explorer, lead-corridor economics and a full-screen investor presentation for **AXION Hyperloop**, a concept and feasibility-stage proposal prepared for an investor-style school business pitch.

> AXION is not incorporated, licensed, funded or operating, and has no customers, partners or agreements. Routes are proposals and all financial figures are illustrative model assumptions in USD.

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
| `npm run e2e` | Browser verification suite against `npm run preview` (46 checks) |
| `npm run build:preview` | One self-contained HTML file with hash routing, in `dist-preview/` |

Requirements: Node 22 (`engines` is set to `22.x`). The e2e suite uses Playwright with the Chromium at `/opt/pw-browsers/chromium`; set `PW_CHROMIUM` to point elsewhere.

## Routes

| URL | Page |
| --- | --- |
| `/` | What AXION does, who pays, how a shipment moves (`#journey`), why it is useful, where development starts, what investment funds |
| `/network` | Network explorer, phases vs funding stages, technology cutaway (`#technology`), feasibility gates (`#feasibility`) |
| `/business` | Business plan, with the lead-corridor model (`#corridor-model`) and the 100 km teaching example (`#construction`, `#operating-model`, `#financing-challenge`) |
| `/investors` | Funding ladder (`#funding-ladder`), the $50m programme and tranches (`#programme`), gates, first-corridor finance (`#first-corridor`), prospects, risks, enquiry (`#enquire`) |
| `/evidence` | Evidence register, formulas, route limitations, research plan, technology status, sources |
| `/leadership` | Leadership team |
| `/present/<chapter>` | Full-screen presentation; `/present` starts at chapter 1 |

### Network explorer URLs

The explorer state is in the query string, so any view can be linked or used as a presentation demo.

| Parameter | Values |
| --- | --- |
| `view` | `regional` (default), `corridor`, `global` |
| `region` | `china-sea`, `japan`, `india`, `europe`, `east-africa`, `southern-africa`, `north-america`, `south-america` |
| `corridor` | any corridor id in `src/data/network.ts` (default `singapore-kuala-lumpur`) |
| `from`, `to` | hub ids for a traced journey, for example `?view=corridor&from=nairobi&to=johannesburg` |

## Presenting

Open `/present` (or **Start Presentation** in the header).

- Chapters, in order: `vision`, `problem`, `customer`, `service`, `lead-corridor`, `vision-network`, `business-model`, `economics`, `programme`, `ask`, `leadership`, `close`. Each has one principal message.
- Old pass-1 links still work: `product`, `network`, `technology`, `market` and `financials` redirect to their replacements.
- **← / →**, Page Up / Page Down, Space: previous / next chapter. **Home / End**: first / last.
- **M**: chapter menu. **N**: presenter notes (hidden by default). **F**: browser full screen. **Esc**: close menu or notes, then exit to the page you came from.
- Chapters with a live tool show a button. The tool opens with a **Return to chapter** bar that stays visible while you move around the site and brings you back to the same chapter.
- Nothing advances automatically. With reduced motion enabled, slide transitions and map motion are switched off.
- Every chapter fits without scrolling at 1920×1080, 1280×720 and 1024×768 (checked by the e2e suite).

## Editing content

All business content lives in `src/data/`. Pages, charts and slides read from these files, so a change appears everywhere.

| File | Contents |
| --- | --- |
| `company.ts` | Name, tagline, stage notice, problem, products, benefits, segments, market-sizing framework, sales steps, competition, HR, sustainability, risks |
| `leadership.ts` | The four executives, roles and responsibilities |
| `network.ts` | Regions, phases, hubs, corridors, statuses, crossings, assumed alignment lengths |
| `corridorModel.ts` | Singapore–Kuala Lumpur inputs and the conservative / central / optimistic scenarios, with the basis for each input |
| `finance.ts` | $50m development programme, staffing, spending, and the 100 km teaching example |
| `technology.ts` | Cutaway systems (with dated status) and the five feasibility gates |
| `journey.ts` | The six shipment stages and customs notes |
| `prospects.ts` | Outreach prospects: role, logistics fit, what AXION would ask and offer |
| `sources.ts` | Dated source register |
| `evidence.ts` | Classified evidence register, dated technology status, planned research |
| `presentation.ts` | Chapter order, messages, presenter notes and demo links (layouts are in `src/present/slides.tsx`) |

### Network data

- **Hubs** belong to a `region` and have a `role`: `hub` (proposed logistics hub), `transit` (planning node in an intervening country, such as Vientiane and Bangkok) or `future` (a city shown as a future hub with no proposed corridor yet, such as Los Angeles).
- **Corridors** list an ordered `path` of hub ids, a `status`, a `crossing` (`land`, `strait`, `sea`, `ocean`), the `systems` they carry and, where assessed, an `assumedAlignmentKm`.
- **Status → line style:** `lead` (proposed lead study corridor, thick solid with halo), `study` (solid), `expansion` (dashed), `conceptual` (dotted, engineering unresolved). **System → colour:** freight cyan, passenger amber.
- Pods are animated only where `animatesPods()` allows: never on `conceptual` corridors or `sea` / `ocean` crossings.
- **Journey tracing** (`src/lib/trace.ts`) runs a shortest path over proposed corridors first. Only if none exists does it allow conceptual links, each penalised so the route uses as few as possible. If no chain exists, it says so and lists what is reachable. It never invents a segment.
- `tests/network.test.ts` checks coordinates against region frames, connectivity, transit nodes, the lead corridor and the trace cases (Kunming → Singapore, Delhi → Chennai, Shanghai → Tokyo, Nairobi → Johannesburg, Tokyo → Los Angeles).

### Portraits

No portraits exist yet; profiles show initials. To add one, place an image in `public/team/` and set `portrait: '/team/<file>.jpg'` on that person in `leadership.ts`.

## Financial model

### Lead study corridor: Singapore–Kuala Lumpur

Labelled "Proposed lead study corridor: feasibility unverified". Computed in `src/lib/corridorModel.ts` from `src/data/corridorModel.ts`; `tests/corridorModel.test.ts` checks the identities. It is a fresh model of a twin-tube freight corridor, not a scaled-up 100 km example.

- **Route:** ≈310 km geographic distance; 350 km assumed alignment (not surveyed), of which 40 km is tunnel, strait or urban.
- **Construction:** guideway civil works priced per km (elevated vs complex sections), systems as a share of civil, two throughput-sized terminals, depot, power, land, fleet, then design (12%) and contingency (30%).
- **Capacity:** departures per hour × 2 directions × hours × days × payload × load factor. Utilisation is the share of those slots sold.
- **Results ledger:** revenue → variable and fixed costs → operating surplus → renewals → surplus after renewals; then depreciation, first-year interest, debt service, DSCR, and a capital-recovery charge (construction cost × annuity at the cost of capital over 40 years).

| Scenario | Construction | Carried | Revenue | Operating surplus | After renewals | Price for full recovery |
| --- | --- | --- | --- | --- | --- | --- |
| Conservative | $31.2bn | 0.40 Mt | $141m | −$131m | −$290m | $7.55/kg |
| **Central** | **$23.3bn** | **0.83 Mt** | **$373m** | **$100m** | **−$24m** | **$2.83/kg** |
| Optimistic | $16.6bn | 1.81 Mt | $1.09bn | $782m | $688m | $0.99/kg |

At the central assumed price of $0.45/kg, freight revenue covers day-to-day operations but not renewals or construction. The site says so. It shows the price needed for each target ($0.33 operating, $0.48 after renewals, $1.97 for DSCR 1.3, $2.83 for full recovery, $0.57 if a public body funded the guideway), the construction cost that would be needed (about 9% of base), and sensitivity tables for construction cost, price × utilisation and interest rate.

### Funding ladder

1. **$50m development round** (sought now): three years, committed at close, drawn in three tranches of $12m, $18m and $20m against gates. Undrawn commitment after each year ($38m, $20m, $0) equals the closing cash in the cash-flow chart.
2. **First-corridor construction finance** (only if Gate 5 is passed): ≈$23.3bn central. Illustrative structure: 30% equity, 50% senior debt, 20% possible public support. Public support is hypothetical and never shown as committed.
3. **Passenger development**: separately funded; not costed.
4. **Regional expansion**: each corridor needs its own case; not costed.
5. **Intercontinental connections**: uncosted ambition.

Geographic phases (China, Japan and Singapore → India and Europe → Africa and the Americas) are an order of ambition, not funding stages.

### $50m development programme

The allocation lines sum to $50m. There are 30 employees at $120,000 fully loaded for 3 years, which gives $10.8m. That salary cost is **included** in the allocation ($4m engineering, $2m software, $4.8m employees and administration) and never added on top. Spending of $12m, $18m and $20m leaves closing cash of $38m, $20m and $0. No revenue is assumed.

### 100 km teaching example

Kept as a simple educational reference on `/business#construction`. It is not a mapped route and is not scaled to the lead corridor.

| Item | Amount |
| --- | --- |
| Infrastructure: 100 km × $20m/km | $2.0bn |
| Terminals: 2 × $75m | $150m |
| Pods, workshops and loading | $100m |
| Land, design and approvals | $150m |
| Subtotal | $2.4bn |
| Contingency at 25% | $600m |
| **Total** | **$3.0bn** |

Operating explorer defaults (2,000 t/day, 350 days, $0.20/kg, $0.08/kg, $35m fixed): 30% → −$9.8m, 60% → $15.4m, 85% → $36.4m; operating break-even ≈291.7m kg, or 41.7%.

The site does not present a valuation, equity offer, investor return, agreed terms or payback date.

## Project structure

```
src/
  data/          centralised content and assumptions
  lib/           pure logic: finance, corridor model, funding, trace, geo, hooks
  components/    layout, status banner, header, footer, shared UI
  features/      network (flat map, globe, explorer, regions), hero, journey, technology, finance, enquiry, gates
  pages/         routed pages
  present/       presentation shell and slides
tests/           unit tests (Vitest)
e2e/             browser verification (Playwright) and screenshot helper
scripts/         single-file preview inliner
```

Stack: React 19, TypeScript, Vite, React Router, d3-geo with world-atlas (110m everywhere, 50m lazy-loaded for regional and corridor zoom), and self-hosted Fontsource fonts. There is no backend, database or WebGL dependency.

## Deployment

The site is a static single-page app.

### Vercel (recommended)

Import the GitHub repository in Vercel and keep the settings below. They are also pinned in `vercel.json`, so the defaults should already match.

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Root directory | `./` (repository root) |
| Install command | `npm ci` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Node.js version | 22.x |
| Environment variables | None required. Do not set `VITE_ROUTER` (that switches to hash URLs) |

`vercel.json` adds the SPA rewrite (every unknown path serves `index.html`), long-lived immutable caching for `/assets/*` (hashed filenames) and `no-cache` for `index.html`.

After deploying, open these URLs directly in a new tab to confirm deep links:

- `/network?view=corridor&from=nairobi&to=johannesburg`
- `/business#corridor-model`
- `/investors#funding-ladder`
- `/present/economics` and `/present/financials` (the second should redirect to the first)

### Other hosts

**Netlify:** build command `npm run build`, publish directory `dist`. `public/_redirects` contains the SPA rewrite.

**Offline / hosts without rewrites** (a shared drive, a USB stick for the pitch room): run `npm run build:preview` and use `dist-preview/index.html`. It is one self-contained file with hash URLs (`index.html#/network`) and works from `file://`.

## Honesty guardrails

- The leadership names and roles are tested.
- Prospects are labelled "Prospect · not contacted", with a notice that no organisation has been contacted or has agreed anything.
- Evidence items marked as sourced must cite a registered source, and every source has a date.
- Technology status is dated, separates demonstrated components from unresolved integration, and records the 2023–2026 company failures.
- The enquiry form validates input but states before and after submission that nothing is sent.
