# Refinement audit: pass 2

Audit of build pass 1 (commit `7b90b03`). I rendered the network explorer, homepage, business model and presentation in Chromium and read the data and source registers alongside them. Passing tests were not taken as proof that the story or map is clear.

## A. Implementation bugs (fixed in this pass)

| # | Area | Defect | Evidence |
| --- | --- | --- | --- |
| A1 | Map labels | Greedy label placement silently drops labels. With 19 hubs visible in Phase 2, only 12 get labels. Kunming, Kuala Lumpur, Chennai, Frankfurt, Paris, Fukuoka and Osaka appear as anonymous dots, so they read as disconnected cities. | Flat map, Phase 2 |
| A2 | Map labels | Tokyo and Osaka labels overlap when a Japanese corridor is selected. | Flat map, Tokyo–Osaka selected |
| A3 | Corridor geometry | Freight and passenger lines are offset by a fixed ±2.4 px along their whole length. Neither reaches the hub marker, so short corridors look like detached stubs. | Tokyo–Osaka, Singapore–KL |
| A4 | Corridor geometry | The India–Europe conceptual line ends at an unlabelled Frankfurt dot beside the Rotterdam label, so it appears to terminate at Rotterdam. | Flat map, Phase 2 |
| A5 | Map wrapping | On the flat world map the Pacific (Tokyo–Los Angeles) arc is split at the map edge, with no indication that it continues. | Flat map, all phases |
| A6 | Phase behaviour | Phase buttons both filter content cumulatively and move the camera. On the globe, Phase 3 rotates to the Atlantic and hides Phases 1–2, so Asia disappears exactly when "all phases" are shown. | Globe, Phase 3 |
| A7 | Zoom | Zoom buttons scale around the phase centre rather than the selection. Selecting a short corridor at world scale leaves it a few pixels long. | Flat map, Tokyo–Osaka + zoom |
| A8 | Line encoding | Passenger lines use a dash pattern, and dashes also signal development status. Style therefore encodes two different things. | Legend |
| A9 | Motion | One 0.9 s ease is used for every camera move. The hero cuts from tunnel to network after 3.4 s, before the scene establishes. Pods start before routes are drawn. | Hero, explorer |

## B. Data and modelling issues (fixed in this pass)

| # | Issue |
| --- | --- |
| B1 | Kuala Lumpur is marked as a "transit node", although it is the terminus of a candidate corridor. |
| B2 | Los Angeles is connected only by the conceptual Pacific link. This was never stated, so it looks like a data error. |
| B3 | The India chain is stored as "Mumbai — Delhi", "Mumbai — Bengaluru" and "Bengaluru — Chennai", which hides the Delhi → Chennai sequence. |
| B4 | There are no regional groupings, so a reader cannot inspect one network without rotating or zooming the globe. |
| B5 | Only great-circle distance is shown. It is easy to read as a route length, and no assumed alignment length exists anywhere. |
| B6 | The only commercial case is a hypothetical 100 km corridor with an unexplained 2,000 t/day capacity, single-scope construction and no depreciation, financing or renewals. It is not linked to any mapped corridor. |
| B7 | The $50m is presented as received at close. There is no distinction between committed funding and cash drawn in tranches, and no view of later funding stages. |
| B8 | Geographic phases and funding stages are never distinguished. |

## C. Content and credibility issues (fixed in this pass)

| # | Issue |
| --- | --- |
| C1 | Technology status is out of date. Hardt reported an 85 km/h lane-switch demonstration in September 2025, was declared bankrupt in March 2026, and Zeleros became insolvent in April 2026. Swisspod reported 146 km/h in May 2026. |
| C2 | The claim that AXION's difference is "its freight-first operating model" ignores earlier freight-focused concepts, such as the HHLA and HyperloopTT container concept. |
| C3 | The public pages describe the research environment ("could not be reached from our research environment"). |
| C4 | Caveats are repeated, often several to a section, and the homepage repeats Investors and Business content (staffing, 100 km figures, milestones). |
| C5 | Prospect entries state a role but not the logistics fit, what AXION would ask for, or what AXION would offer. |
| C6 | "No launch corridor has been selected" is now replaced by a declared lead study corridor (Singapore–Kuala Lumpur), which is explicitly unverified. |

## D. Intentionally unresolved (kept, made explicit)

- **Shanghai–Fukuoka:** a long-term conceptual sea connection. No feasible crossing is identified.
- **Nairobi and Johannesburg:** separate regional networks. No connecting corridor is proposed.
- **Intercontinental ocean links** (Atlantic, Pacific, Arabian Sea, Bay of Bengal): uncosted ambitions. No service is implied.
- **Los Angeles:** a future hub with no regional corridor proposed.
- **Corridor alignments:** none is surveyed. Only the lead study corridor carries an assumed alignment length, and it is labelled as an assumption.
