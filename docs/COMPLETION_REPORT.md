# Completion report: build pass 1

## Delivered

- **Company website** with six routed pages: Company, Network & Technology, Business Model, For Investors, Evidence & Assumptions, Leadership. It also has a 404 page, persistent **Explore Network** and **Start Presentation** actions, Company navigation with Leadership in a dropdown, and a full footer.
- **Investor presentation** at `/present/<chapter>`. It has 12 chapters, keyboard navigation, a clickable progress bar, a chapter menu, presenter notes (hidden by default), browser full screen and Esc to exit. Live-demo buttons open the tools with a return bar that brings the presenter back to the same chapter.
- **Network explorer**: an SVG orthographic globe and a flat Equal Earth map. It covers three cumulative phases, hub and corridor selection from the map or from lists, freight and passenger toggles shown as separate parallel lines, play/pause, zoom, reset and drag. A detail panel shows assumptions, constraints, crossing type, straight-line distance and the "not surveyed alignments" disclaimer. No pods are animated on conceptual, sea or ocean connections. No launch corridor is selected; Phase 1 has three candidates under study.
- **Technology cutaway** covering nine conceptual systems, plus the five feasibility gates and a passenger-safety note.
- **Financial tools**: an operating explorer with utilisation, price and variable-cost sliders, reset, an animated waterfall, a result-by-utilisation chart with hover readout and a scenario table. Zero and negative margins and beyond-capacity break-even are handled. The site also includes the allocation chart (salaries shown inside the lines), the cash-flow chart and table, the construction-cost table, and an explicit financing-challenge comparison.
- **Interactive shipment journey** in six stages, with a cross-border customs toggle and an illustrative "where the time goes" bar that separates tube travel from complete shipment time.
- **Evidence area** with a filterable register in four classes, formulas generated from live inputs, a route limitations table, the research plan, technology status, environmental-model requirements and 14 dated sources.
- **Demonstration enquiry form** with three partner paths. It validates input and says before and after submission that nothing is sent.
- A production build, a single-file preview build, the README and this report.

## Checks performed

| Check | Result |
| --- | --- |
| `tsc -b` type check | Pass |
| ESLint, including React hooks rules | Pass, 0 warnings |
| Vitest: 25 unit tests covering the finance formulas, all specified scenario numbers, break-even, zero and negative margin, salary inclusion ($10.8m equals the included portions), cash flow, construction total, network data integrity, the pod rule, enquiry validation, presentation links and content guardrails | Pass |
| `vite build` production build | Pass. Map data is in a lazy chunk; the main JS is about 109 kB gzip |
| Playwright e2e suite against the production build (`e2e/verify.mjs`), 38 checks | Pass |
| · Direct loads and refreshes of every route, the 404 page, `/present` and an unknown chapter | Pass |
| · Primary navigation, Company dropdown, header actions, mobile menu | Pass |
| · All 16 internal links resolve, including hash anchors | Pass |
| · 14 external links use https and open in a new tab with `noopener` | Pass (see limitations) |
| · Presentation: arrows, Home/End, N, M, menu jump, progress jump, Esc order, exit to the originating page, demo-and-return | Pass |
| · Network: phases, corridor and hub selection, disclaimers, system toggles, play/pause, flat map, zoom, drag, reset | Pass |
| · Operating explorer: 30%, 60% and 85% results, break-even, zero margin, negative margin, beyond capacity, reset, no double-counted salaries | Pass |
| · Journey, technology cutaway, evidence filter, enquiry validation and honest confirmation | Pass |
| · No horizontal overflow at 1440×900, 1920×1080, 1280×720 and 390×844 on every page | Pass |
| · Presentation content fits without scrolling at 1920×1080 and 1024×768; 7 px of scroll on one slide at 1280×720 | Pass |
| · axe-core WCAG 2.1 AA scan on all pages and slides, including colour contrast | Pass, 0 violations |
| · Visible keyboard focus indicator | Pass |
| · Reduced motion: no slide transitions, hero shows a still final frame, map motion disabled | Pass |
| · Rendering with WebGL disabled (`--disable-webgl --disable-3d-apis`) | Pass |
| Hash-routed single-file preview tested from `file://` (navigation, deep links, demo return, scroll links) | Pass |
| Screenshots reviewed at desktop, projector and mobile sizes | Done; layout fixes applied |
| Copy audit for zero-carbon, "cheaper", endorsement, valuation, payback, co-founder and placeholder text | Clean; only negations and disclaimers remain |
| `npm audit` | 0 vulnerabilities |

## Genuine limitations

1. **The reference site was not inspected.** The build environment's network policy blocked `forgehyperloop.com`, `hardt.global` and `hyperloopcenter.eu`. The design is original and built from the brief; nothing is taken from Forge.
2. **Most sources are secondary.** Several primary sites could not be opened, so some sources are news or reference works. Each one is labelled. Developer claims are marked as reported, not verified.
3. **External links were checked for form only.** Each link is a well-formed https URL with safe `target` and `rel` attributes, but egress limits meant the destinations could not be fetched to confirm they are live.
4. **Not deployed.** No hosting credentials are available in this environment. The README has exact Vercel, Netlify and static-host steps. A private preview link was published separately from the single-file build.
5. **Real-device testing.** Tests ran in headless Chromium only. Safari and Firefox were not run here, and there was no test on a real projector or touch device.
6. **Fullscreen** uses the browser Fullscreen API. Some embedded or iframe contexts block it; the control is hidden where the API is missing.
7. **Map detail.** The world map uses 110m-resolution borders, which suits a global overview. Close zoom on small regions (such as the Johor Strait) shows simplified coastlines.
8. **Planned for later passes:** refining motion, the slide visual design and more presenter tooling, such as a speaker-view window and speaker splits.
