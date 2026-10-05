# Completion report: refinement pass 2

Pass 1 (commits `1efa40d`, `7b90b03`) built the site. This pass refined it. Defects found before editing are listed in [`AUDIT.md`](AUDIT.md), split into implementation bugs, data issues, credibility issues and routes that are intentionally unresolved.

## What changed

### Network

- The explorer now has **three views**:
  - **Regional networks**: eight regions, each drawn complete.
  - **Selected corridor**: one corridor in focus, plus journey tracing.
  - **Long-term global vision**: globe or flat map.
- The view, region, corridor and traced journey are kept in the URL.
- **Phases no longer hide anything.** Phase buttons dim other phases instead. A panel on the Network page and the Investors page explains that phases are an order of ambition, not funding stages.
- **Trace this journey:**
  - You choose an origin and a destination.
  - The trace uses proposed corridors first and falls back to conceptual links only when it must, flagging each one.
  - When no chain exists it says so, shows both separate networks, and lists what is reachable.
  - Gaps are never bridged.
- **Specific cases are explicit:**
  - Shanghai–Fukuoka is a dotted conceptual sea link.
  - India reads Delhi → Mumbai → Bengaluru → Chennai.
  - Nairobi and Johannesburg are separate networks.
  - Los Angeles is a labelled future hub.
  - Kuala Lumpur is a hub; Vientiane and Bangkok are transit nodes.
- **Geometry fixes:**
  - Freight and passenger offsets taper to zero, so every line ends on its hub marker.
  - Every endpoint is labelled, and label placement avoids collisions.
  - Conceptual-link notes avoid lines and frame edges.
  - The flat world map shows wrap chevrons.
  - Zoomed views load sharper coastlines.
- **Encoding:** colour shows the system (freight cyan, passenger amber). Line style shows the development status (lead, study, expansion, conceptual). The legend says both.
- **Distance:** each corridor shows its approximate geographic distance and, where assessed, its assumed alignment length (Singapore–KL: about 310 km geographic, 350 km assumed).

### Finance

- **New Singapore–Kuala Lumpur scenario model** at `/business#corridor-model`, labelled "Proposed lead study corridor: feasibility unverified". It has transparent inputs:
  - alignment and complex sections;
  - twin-tube scope, terminals, depot, power, land, fleet, design and contingency;
  - payload, dispatch and hours, giving derived capacity;
  - utilisation, price, and variable and fixed costs;
  - renewals, depreciation, debt service, DSCR and capital recovery.
- It offers conservative, central and optimistic scenarios, four levers, a verdict, required prices per target, and sensitivity to construction cost, price × utilisation and interest rate.
- **The central case is unattractive, and the site says so.** At $0.45/kg it covers operations ($100m surplus) but not renewals (−$24m) or construction. Full recovery needs $2.83/kg, or a construction cost near 9% of base. The site shows what would have to change.
- **Funding ladder** with five rungs:
  1. $50m development;
  2. conditional construction (≈$23.3bn central);
  3. passenger development;
  4. regional expansion;
  5. intercontinental ambitions.
  
  Rungs 3–5 are not costed.
- **Tranches:**
  - The $50m is committed at close and drawn as $12m / $18m / $20m against gates.
  - The undrawn balance reconciles with the cash-flow chart.
- **First-corridor funding structure:**
  - The illustrative split is 30% equity, 50% debt and 20% public support.
  - Public support is marked "Not committed" everywhere.
- The same figures appear on Home, Investors, Business and the presentation, all computed from one model.
- The 100 km example is kept as a teaching reference, with its specified results unchanged.

### Motion

- **Hero:** three acts.
  - Pod in a lit, jointed tunnel: 4.8 s to establish.
  - Pull-back to the SG–KL corridor, with a pod on the line.
  - Ease out to the Phase 1 network, which draws progressively.
  - Act indicator, captions, Pause, Play and Replay are included.
- The coastline layer is cached and land is clipped to the region, so the map acts run at full frame rate. Before this, headless Chromium dropped to about 6 fps, which slowed the sequence.
- **Maps:**
  - The camera eases in log scale over 0.7–1.5 s, depending on distance.
  - Routes draw progressively, then settle for 0.45 s before pods start.
  - Pods follow the drawn path and never run on sea or ocean links.
  - Motion pauses off-screen.
- No scroll hijacking. Reduced motion shows final frames and disables pods and transitions.

### Content and credibility

- A **site-wide status banner** replaces repeated caveats. It shortens on mobile.
- The homepage now covers:
  - what AXION does and who pays;
  - how a shipment moves;
  - why it is useful;
  - where development starts (lead corridor plus eight regional maps);
  - what the investment funds.
  
  Milestones and allocation moved to Investors.
- **Sources refreshed and dated:**
  - Hardt: 85 km/h lane-switch test (Sept 2025); bankruptcy (Mar 2026).
  - Zeleros: insolvency (Apr 2026).
  - Swisspod: 146 km/h (May 2026).
  - Hyperloop One: closure (2023).
  - Peer-reviewed cost benchmarks.
  - Malaysia–Singapore HSR termination and the RTS Link.
- Technology status is dated "as of October 2026" and separates demonstrated components from unresolved integration.
- The "freight-first is unique" claim was removed; HHLA/HyperloopTT is acknowledged.
- All commentary about the research environment was removed from public pages.
- Each prospect states its role, logistics fit, what AXION would ask and what AXION would offer. All are marked "Prospect · not contacted".

### Presentation

- New chapter order:
  1. vision
  2. problem
  3. paying customer
  4. service
  5. lead study corridor
  6. regional and global vision
  7. business model
  8. economic conditions
  9. development programme
  10. funding ask
  11. leadership
  12. close
- Each chapter has one principal message, and pass-1 chapter URLs redirect.
- The funding chapter puts **$50m sought now** beside **≈$23.3bn only if Gate 5 is passed**, above the funding ladder.
- Demo buttons for the lead corridor, regional networks, scenario model, technology and funding ladder all return to the same chapter.
- Fixed a navigation bug: a second arrow press during a chapter transition was being dropped.
- There is no speaker assignment.

### Deployment

- `vercel.json` pins the framework (Vite), `npm ci`, `npm run build` and `dist`.
- It also sets the SPA rewrite, immutable caching for `/assets/*` and no-cache for `index.html`.
- `package.json` pins Node `22.x`.
- The single-file offline build is unchanged.

## Test results

| Check | Result |
| --- | --- |
| `tsc -b` type check | Pass |
| ESLint (React hooks v7 rules) | Pass, 0 warnings |
| Vitest unit tests: 49 in 4 files | Pass |
| `vite build` | Pass. Main JS ≈108 kB gzip; 50m coastlines are a lazy chunk |
| Playwright e2e against the production build, 46 checks | Pass |
| · Direct loads: every route, 404, `/present`, unknown chapter, `/present/financials` alias, traced-journey URL | Pass |
| · All 8 regional views: every corridor end lies within 2.5 px of a hub marker; no label overlaps; India's four cities and Los Angeles labelled | Pass |
| · Trace: Kunming → Singapore proposed via Vientiane, Bangkok and KL; Shanghai → Tokyo conceptual via Fukuoka; Nairobi → Johannesburg none, by form and by URL; Tokyo → LA conceptual; swap | Pass |
| · Corridor view (alignment vs distance, no pods on ocean link) and global view (phase highlight dims, toggles, flat map, zoom, drag) | Pass |
| · Lead corridor model: central verdict and $2.83/kg, optimistic $16.6bn / $0.99/kg, price lever flips verdict; Investors shows $50m, $23.3bn, $38m, "Not committed", salaries included | Pass |
| · Presentation keyboard, menu, notes, exit; demo-and-return for lead corridor (05) and economics (08) | Pass |
| · Every chapter fits without scrolling at 1920×1080, 1280×720 and 1024×768 | Pass |
| · Hero reaches act 2 and act 3; Pause and Replay work | Pass |
| · 100 km operating explorer: 30%, 60% and 85% results, break-even, zero and negative margin, reset | Pass |
| · No horizontal overflow at 1440, 1920, 1280 and 390 px on every page; mobile menu | Pass |
| · Reduced motion; WebGL disabled; keyboard focus | Pass |
| · axe-core WCAG 2.1 AA on all pages and two slides | Pass, 0 violations |

Beyond the tests, I reviewed screenshots of Home, Network, Business, Investors and Evidence at 1440 px and 390 px, all 12 slides at 1280×720 and 390×844, and hero frames across the timeline. Fixes made from that review:

- Business: a truncated sensitivity column, "$1bn" rounding, a capacity box that overflowed and a 576 px mobile overflow.
- Investors: run-together tranche headers.
- Slides: projector overflow on three slides.
- Labels: the hero Tokyo/Osaka overlap.
- Legend: a dashed passenger swatch that conflicted with the legend.

## Assumptions that need validation

**Route**

- The Singapore–KL assumed alignment (350 km, including 40 km of tunnel, strait or urban sections) is a placeholder. No alignment has been surveyed, and the Johor Strait crossing method is open.
- Transit nodes (Vientiane, Bangkok) and the Kunming–KL chain depend on agreements with four countries.
- All conceptual links (Shanghai–Fukuoka, India–Europe, ocean crossings) have no feasible crossing identified.

**Construction**

- $35m/km elevated and $80m/km complex sections are taken from the peer-reviewed EUR 25–76m/km range, not from quotes.
- Systems at 30% of civil cost, terminals at $200m each, the $120m depot, power and land allowances, 12% design and 30% contingency are all unvalidated.

**Operations**

- Inputs: 12 t payload, 12 departures per hour per direction, 20 h × 360 days, 80% load factor and 50% slot utilisation.
- These rest on no demonstrated system. Demonstrated speeds are 85–146 km/h on short tracks; the model sizes the fleet at 500 km/h.

**Revenue and costs**

- The $0.45/kg price has not been tested with any customer.
- The handling cost, 10 kWh per pod-km, $0.20/kWh, 350 staff, the vacuum base load, insurance and maintenance rates are assumptions.
- So are the renewal rates and asset lives.

**Finance**

- These are placeholders, not offers:
  - 6.5% interest over 25 years;
  - 8% cost of capital over 40 years;
  - DSCR target of 1.3;
  - the 30/50/20 equity, debt and public split.
- Public support in particular is hypothetical.

**Development programme**

- The $50m allocation, 30-person team and tranche gates are the brief's figures. They have not been benchmarked against comparable programmes.

## Genuine limitations

1. **Forge Hyperloop was not inspected.** The reference site remains blocked by this environment's network policy, so the design is original.
2. **Some sources are secondary.** Company failures and test results rely partly on trade press, and each entry is labelled. Developer claims are "reported", not verified.
3. **Not deployed.** Deployment needs the repository owner to connect it to Vercel. No credentials are needed or requested here; the steps are in the README. The single-file preview of this pass is at https://claude.ai/artifact/G2HSogeJAY6256uPYTA3tc (hash URLs, for example `#/present/ask`).
4. **Browser coverage.** Testing was headless Chromium only. Safari, Firefox, real projectors and touch devices were not tested.
5. **Map labels at thumbnail size.** On the smallest regional thumbnails (for example the China card on a 720p slide), label placement can drop a crowded label rather than overlap it. Full-size regional views label every endpoint.
6. **The lead-corridor model is a screening model.** It has no tax, ramp-up years, inflation, construction-period interest, residual value or cross-border revenue sharing.
