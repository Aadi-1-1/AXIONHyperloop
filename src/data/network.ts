/**
 * Proposed AXION network — planning assumptions only.
 *
 * Cities are representative planning nodes chosen for the proposed countries.
 * They are not selected sites, and no initial commercial corridor has been chosen.
 * Coordinates are city-centre WGS84 [latitude, longitude].
 * Arcs drawn from this data show proposed connections, not surveyed tube alignments.
 */

export type PhaseId = 1 | 2 | 3
export type SystemId = 'freight' | 'passenger'
export type CorridorStatus = 'study' | 'expansion' | 'conceptual'
/** land = overland; strait = short water crossing with existing fixed-link precedent; sea / ocean = unresolved crossing */
export type Crossing = 'land' | 'strait' | 'sea' | 'ocean'

export type Hub = {
  id: string
  city: string
  country: string
  lat: number
  lon: number
  phase: PhaseId
  /** hub = proposed logistics hub; transit = planning node in an intervening country */
  role: 'hub' | 'transit'
  note: string
}

export type Corridor = {
  id: string
  name: string
  /** Ordered hub ids. Multi-point corridors pass through transit nodes. */
  path: string[]
  phase: PhaseId
  status: CorridorStatus
  crossing: Crossing
  systems: SystemId[]
  countries: string[]
  rationale: string
  assumptions: string[]
  constraints: string[]
}

export const phases: { id: PhaseId; label: string; regions: string; focus: { lon: number; lat: number } }[] = [
  { id: 1, label: 'Phase 1', regions: 'China, Japan and Singapore', focus: { lon: 115, lat: 22 } },
  { id: 2, label: 'Phase 2', regions: 'India and Europe', focus: { lon: 50, lat: 32 } },
  { id: 3, label: 'Phase 3', regions: 'Africa and the Americas', focus: { lon: -20, lat: 10 } },
]

export const statusMeta: Record<CorridorStatus, { label: string; short: string; description: string }> = {
  study: {
    label: 'Candidate corridor — initial study',
    short: 'Under study',
    description:
      'One of several candidate corridors to be compared in the feasibility programme. Not a selected or confirmed launch route.',
  },
  expansion: {
    label: 'Proposed regional expansion',
    short: 'Regional expansion',
    description: 'A connection that would only be considered after an initial corridor is validated and operating.',
  },
  conceptual: {
    label: 'Long-term conceptual connection',
    short: 'Conceptual',
    description: 'A long-range idea with unresolved feasibility questions. Shown to explain ambition, not a plan.',
  },
}

export const crossingMeta: Record<Crossing, string> = {
  land: 'Overland',
  strait: 'Short strait crossing',
  sea: 'Sea crossing — unresolved',
  ocean: 'Ocean crossing — no feasible alignment identified',
}

export const networkDisclaimer =
  'Arcs show proposed connections between representative cities, not surveyed tube alignments. Distances are straight-line between city centres, not route lengths.'

export const hubs: Hub[] = [
  // Phase 1 — China
  { id: 'beijing', city: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074, phase: 1, role: 'hub', note: 'Northern China logistics and distribution centre.' },
  { id: 'shanghai', city: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737, phase: 1, role: 'hub', note: 'Yangtze River Delta manufacturing and port region.' },
  { id: 'shenzhen', city: 'Shenzhen', country: 'China', lat: 22.5431, lon: 114.0579, phase: 1, role: 'hub', note: 'Pearl River Delta electronics manufacturing and e-commerce region.' },
  { id: 'kunming', city: 'Kunming', country: 'China', lat: 25.0389, lon: 102.7183, phase: 1, role: 'hub', note: 'South-western gateway towards mainland Southeast Asia.' },
  // Phase 1 — Japan
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, phase: 1, role: 'hub', note: 'Largest Japanese consumer and distribution market.' },
  { id: 'osaka', city: 'Osaka', country: 'Japan', lat: 34.6937, lon: 135.5023, phase: 1, role: 'hub', note: 'Kansai industrial and logistics region.' },
  { id: 'fukuoka', city: 'Fukuoka', country: 'Japan', lat: 33.5904, lon: 130.4017, phase: 1, role: 'hub', note: 'Kyushu gateway, closest major Japanese city to mainland Asia.' },
  // Phase 1 — Singapore and intervening countries
  { id: 'singapore', city: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, phase: 1, role: 'hub', note: 'Proposed AXION headquarters location and regional trade hub.' },
  { id: 'kuala-lumpur', city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lon: 101.6869, phase: 1, role: 'transit', note: 'Intervening-country planning node. Any route requires Malaysian agreement.' },
  { id: 'bangkok', city: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, phase: 1, role: 'transit', note: 'Intervening-country planning node. Any route requires Thai agreement.' },
  { id: 'vientiane', city: 'Vientiane', country: 'Laos', lat: 17.9757, lon: 102.6331, phase: 1, role: 'transit', note: 'Intervening-country planning node. Any route requires Lao agreement.' },
  // Phase 2 — India
  { id: 'delhi', city: 'Delhi', country: 'India', lat: 28.6139, lon: 77.209, phase: 2, role: 'hub', note: 'Northern India distribution centre.' },
  { id: 'mumbai', city: 'Mumbai', country: 'India', lat: 19.076, lon: 72.8777, phase: 2, role: 'hub', note: 'Western India port and commercial centre.' },
  { id: 'bengaluru', city: 'Bengaluru', country: 'India', lat: 12.9716, lon: 77.5946, phase: 2, role: 'hub', note: 'Southern India technology and electronics region.' },
  { id: 'chennai', city: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707, phase: 2, role: 'hub', note: 'South-eastern India port and manufacturing region.' },
  // Phase 2 — Europe
  { id: 'rotterdam', city: 'Rotterdam', country: 'Netherlands', lat: 51.9244, lon: 4.4777, phase: 2, role: 'hub', note: 'Major European port and logistics gateway.' },
  { id: 'paris', city: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, phase: 2, role: 'hub', note: 'Large consumer market and distribution region.' },
  { id: 'frankfurt', city: 'Frankfurt', country: 'Germany', lat: 50.1109, lon: 8.6821, phase: 2, role: 'hub', note: 'Central European air-cargo and distribution hub.' },
  { id: 'milan', city: 'Milan', country: 'Italy', lat: 45.4642, lon: 9.19, phase: 2, role: 'hub', note: 'Northern Italian manufacturing and distribution region.' },
  // Phase 3 — Africa
  { id: 'nairobi', city: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219, phase: 3, role: 'hub', note: 'East African commercial and distribution centre.' },
  { id: 'mombasa', city: 'Mombasa', country: 'Kenya', lat: -4.0435, lon: 39.6682, phase: 3, role: 'hub', note: 'East African port gateway.' },
  { id: 'johannesburg', city: 'Johannesburg', country: 'South Africa', lat: -26.2041, lon: 28.0473, phase: 3, role: 'hub', note: 'Southern African commercial centre.' },
  { id: 'durban', city: 'Durban', country: 'South Africa', lat: -29.8587, lon: 31.0218, phase: 3, role: 'hub', note: 'Southern African port gateway.' },
  // Phase 3 — Americas
  { id: 'new-york', city: 'New York', country: 'United States', lat: 40.7128, lon: -74.006, phase: 3, role: 'hub', note: 'North-eastern US consumer and port region.' },
  { id: 'chicago', city: 'Chicago', country: 'United States', lat: 41.8781, lon: -87.6298, phase: 3, role: 'hub', note: 'Central US rail and distribution hub.' },
  { id: 'los-angeles', city: 'Los Angeles', country: 'United States', lat: 34.0522, lon: -118.2437, phase: 3, role: 'hub', note: 'US Pacific port and distribution region.' },
  { id: 'sao-paulo', city: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, phase: 3, role: 'hub', note: 'Largest South American commercial centre.' },
  { id: 'rio', city: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729, phase: 3, role: 'hub', note: 'South-eastern Brazil port and consumer region.' },
]

const commonCorridorAssumptions = [
  'Representative city centres stand in for terminal sites that have not been chosen.',
  'Freight demand, alignment, land availability and costs are not yet studied.',
]

export const corridors: Corridor[] = [
  // ---------- Phase 1: candidates under study ----------
  {
    id: 'tokyo-osaka',
    name: 'Tokyo — Osaka',
    path: ['tokyo', 'osaka'],
    phase: 1,
    status: 'study',
    crossing: 'land',
    systems: ['freight', 'passenger'],
    countries: ['Japan'],
    rationale: 'Dense, high-value parcel and component flows between Japan’s two largest economic regions.',
    assumptions: [...commonCorridorAssumptions, 'A passenger system would use separate infrastructure and its own approval programme.'],
    constraints: [
      'Mountainous terrain and dense urban land increase tunnelling and land costs.',
      'High seismic activity requires specialist structural and safety design.',
      'Existing high-speed rail and road freight set a demanding benchmark.',
    ],
  },
  {
    id: 'shanghai-shenzhen',
    name: 'Shanghai — Shenzhen',
    path: ['shanghai', 'shenzhen'],
    phase: 1,
    status: 'study',
    crossing: 'land',
    systems: ['freight'],
    countries: ['China'],
    rationale: 'Links two major manufacturing and e-commerce regions with large time-sensitive parcel and electronics flows.',
    assumptions: [...commonCorridorAssumptions, 'Freight-only in the study phase; passenger options not assessed.'],
    constraints: [
      'Long corridor: a much larger capital requirement than the 100 km financial illustration.',
      'Strong competition from express road, rail and domestic air freight.',
      'Requires national and provincial approvals and partnership structures not yet explored.',
    ],
  },
  {
    id: 'singapore-kuala-lumpur',
    name: 'Singapore — Kuala Lumpur',
    path: ['singapore', 'kuala-lumpur'],
    phase: 1,
    status: 'study',
    crossing: 'strait',
    systems: ['freight', 'passenger'],
    countries: ['Singapore', 'Malaysia'],
    rationale: 'Connects the proposed headquarters with Malaysia’s capital region; a first cross-border test of customs integration.',
    assumptions: [...commonCorridorAssumptions, 'Cross-border customs would be designed with both governments.'],
    constraints: [
      'Crosses the Johor Strait and an international border, so two regulatory regimes apply.',
      'Land in Singapore is scarce; terminal siting is a major constraint.',
    ],
  },
  // ---------- Phase 1: regional expansion ----------
  {
    id: 'beijing-shanghai',
    name: 'Beijing — Shanghai',
    path: ['beijing', 'shanghai'],
    phase: 1,
    status: 'expansion',
    crossing: 'land',
    systems: ['freight', 'passenger'],
    countries: ['China'],
    rationale: 'Would connect northern and eastern China logistics regions after an initial corridor is proven.',
    assumptions: commonCorridorAssumptions,
    constraints: ['Very long corridor with high capital cost.', 'Existing high-speed rail serves passengers on this axis.'],
  },
  {
    id: 'shenzhen-kunming',
    name: 'Shenzhen — Kunming',
    path: ['shenzhen', 'kunming'],
    phase: 1,
    status: 'expansion',
    crossing: 'land',
    systems: ['freight'],
    countries: ['China'],
    rationale: 'Would link the Pearl River Delta to the south-western gateway towards Southeast Asia.',
    assumptions: commonCorridorAssumptions,
    constraints: ['Mountainous terrain across Guangxi and Yunnan.', 'Long distance relative to likely early freight volumes.'],
  },
  {
    id: 'china-singapore-overland',
    name: 'Kunming — Vientiane — Bangkok — Kuala Lumpur',
    path: ['kunming', 'vientiane', 'bangkok', 'kuala-lumpur'],
    phase: 1,
    status: 'expansion',
    crossing: 'land',
    systems: ['freight'],
    countries: ['China', 'Laos', 'Thailand', 'Malaysia'],
    rationale:
      'China and Singapore are not adjacent. An overland connection must pass through intervening countries, broadly following the direction of existing rail development in the region.',
    assumptions: [
      ...commonCorridorAssumptions,
      'Intervening countries are planning nodes only; no agreements or discussions exist.',
      'A maritime strategy (port-to-port shipping between AXION terminals) is the alternative to an overland link.',
    ],
    constraints: [
      'Requires agreements with Laos, Thailand and Malaysia as well as China and Singapore.',
      'Multiple customs borders add handling time that could offset in-tube speed.',
      'Mountainous terrain in northern Laos.',
    ],
  },
  {
    id: 'osaka-fukuoka',
    name: 'Osaka — Fukuoka',
    path: ['osaka', 'fukuoka'],
    phase: 1,
    status: 'expansion',
    crossing: 'strait',
    systems: ['freight'],
    countries: ['Japan'],
    rationale: 'Would extend a Japanese corridor to Kyushu, Japan’s gateway towards mainland Asia.',
    assumptions: commonCorridorAssumptions,
    constraints: ['Crosses the Kanmon Strait between Honshu and Kyushu.', 'Mountainous terrain and seismic design requirements.'],
  },
  // ---------- Phase 1: conceptual ----------
  {
    id: 'fukuoka-shanghai',
    name: 'Japan — China (East China Sea)',
    path: ['fukuoka', 'shanghai'],
    phase: 1,
    status: 'conceptual',
    crossing: 'sea',
    systems: ['freight'],
    countries: ['Japan', 'China'],
    rationale: 'Japan is an island nation; any fixed connection to China requires a long sea crossing.',
    assumptions: ['Shown only to illustrate the ambition of linking Phase 1 markets.', 'Until a crossing is proven, freight between Japan and China would use existing shipping and air services.'],
    constraints: [
      'Hundreds of kilometres of open sea — far beyond any existing undersea tunnel.',
      'Deep water, seismic risk and international agreements make this unresolved.',
    ],
  },
  // ---------- Phase 2 ----------
  {
    id: 'mumbai-delhi',
    name: 'Mumbai — Delhi',
    path: ['mumbai', 'delhi'],
    phase: 2,
    status: 'expansion',
    crossing: 'land',
    systems: ['freight', 'passenger'],
    countries: ['India'],
    rationale: 'Connects India’s main western port region with the northern capital region.',
    assumptions: commonCorridorAssumptions,
    constraints: ['Long corridor with significant land-acquisition requirements.', 'Dedicated freight rail development is an important alternative.'],
  },
  {
    id: 'mumbai-bengaluru',
    name: 'Mumbai — Bengaluru',
    path: ['mumbai', 'bengaluru'],
    phase: 2,
    status: 'expansion',
    crossing: 'land',
    systems: ['freight'],
    countries: ['India'],
    rationale: 'Links port activity with southern electronics and technology demand.',
    assumptions: commonCorridorAssumptions,
    constraints: ['Western Ghats terrain.', 'Land acquisition and state-level coordination.'],
  },
  {
    id: 'bengaluru-chennai',
    name: 'Bengaluru — Chennai',
    path: ['bengaluru', 'chennai'],
    phase: 2,
    status: 'expansion',
    crossing: 'land',
    systems: ['freight', 'passenger'],
    countries: ['India'],
    rationale: 'Shorter corridor linking a technology region to an east-coast port.',
    assumptions: commonCorridorAssumptions,
    constraints: ['Dense urban approaches at both ends.'],
  },
  {
    id: 'paris-rotterdam',
    name: 'Paris — Rotterdam',
    path: ['paris', 'rotterdam'],
    phase: 2,
    status: 'expansion',
    crossing: 'land',
    systems: ['freight', 'passenger'],
    countries: ['France', 'Belgium', 'Netherlands'],
    rationale: 'Connects a major port gateway with a large consumer market.',
    assumptions: commonCorridorAssumptions,
    constraints: ['Crosses three countries.', 'Mature high-speed rail and road freight alternatives.'],
  },
  {
    id: 'rotterdam-frankfurt',
    name: 'Rotterdam — Frankfurt',
    path: ['rotterdam', 'frankfurt'],
    phase: 2,
    status: 'expansion',
    crossing: 'land',
    systems: ['freight'],
    countries: ['Netherlands', 'Germany'],
    rationale: 'Links Europe’s largest port region with a central European cargo hub.',
    assumptions: commonCorridorAssumptions,
    constraints: ['Rhine inland shipping and rail freight are low-cost alternatives for bulk goods.'],
  },
  {
    id: 'frankfurt-milan',
    name: 'Frankfurt — Milan',
    path: ['frankfurt', 'milan'],
    phase: 2,
    status: 'expansion',
    crossing: 'land',
    systems: ['freight'],
    countries: ['Germany', 'Switzerland', 'Italy'],
    rationale: 'A north–south European freight axis.',
    assumptions: commonCorridorAssumptions,
    constraints: ['Crossing the Alps would require very long tunnels.', 'Requires Swiss transit agreements.'],
  },
  {
    id: 'india-europe',
    name: 'India — Europe overland',
    path: ['delhi', 'frankfurt'],
    phase: 2,
    status: 'conceptual',
    crossing: 'land',
    systems: ['freight'],
    countries: ['India', 'multiple intervening countries', 'Germany'],
    rationale: 'Illustrates the long-term ambition of linking Phase 2 regions.',
    assumptions: ['No intervening route or partner countries have been identified.'],
    constraints: [
      'Passes through many countries with differing regulation and political conditions.',
      'Major mountain ranges and very long distance.',
    ],
  },
  {
    id: 'chennai-singapore',
    name: 'India — Singapore (Bay of Bengal)',
    path: ['chennai', 'singapore'],
    phase: 2,
    status: 'conceptual',
    crossing: 'ocean',
    systems: ['freight'],
    countries: ['India', 'Singapore'],
    rationale: 'Illustrates linking Phase 1 and Phase 2 markets.',
    assumptions: ['Freight would use existing shipping and air services unless a crossing became feasible.'],
    constraints: ['Open-ocean crossing of thousands of kilometres. No feasible tube alignment identified.'],
  },
  // ---------- Phase 3 ----------
  {
    id: 'nairobi-mombasa',
    name: 'Mombasa — Nairobi',
    path: ['mombasa', 'nairobi'],
    phase: 3,
    status: 'expansion',
    crossing: 'land',
    systems: ['freight'],
    countries: ['Kenya'],
    rationale: 'Connects East Africa’s main port gateway with its inland commercial centre.',
    assumptions: commonCorridorAssumptions,
    constraints: ['Existing standard-gauge rail is a direct alternative.', 'Financing capacity for large infrastructure.'],
  },
  {
    id: 'johannesburg-durban',
    name: 'Durban — Johannesburg',
    path: ['durban', 'johannesburg'],
    phase: 3,
    status: 'expansion',
    crossing: 'land',
    systems: ['freight'],
    countries: ['South Africa'],
    rationale: 'Links a major port with Southern Africa’s commercial centre.',
    assumptions: commonCorridorAssumptions,
    constraints: ['Significant elevation change from coast to the inland plateau.'],
  },
  {
    id: 'new-york-chicago',
    name: 'New York — Chicago',
    path: ['new-york', 'chicago'],
    phase: 3,
    status: 'expansion',
    crossing: 'land',
    systems: ['freight', 'passenger'],
    countries: ['United States'],
    rationale: 'Connects the US north-east consumer market with a central rail and distribution hub.',
    assumptions: commonCorridorAssumptions,
    constraints: ['Appalachian terrain.', 'Mature trucking, rail and air freight competition.'],
  },
  {
    id: 'sao-paulo-rio',
    name: 'São Paulo — Rio de Janeiro',
    path: ['sao-paulo', 'rio'],
    phase: 3,
    status: 'expansion',
    crossing: 'land',
    systems: ['freight', 'passenger'],
    countries: ['Brazil'],
    rationale: 'Connects Brazil’s two largest metropolitan economies.',
    assumptions: commonCorridorAssumptions,
    constraints: ['Coastal mountain range between the two cities.'],
  },
  {
    id: 'europe-americas',
    name: 'Europe — Americas (Atlantic)',
    path: ['rotterdam', 'new-york'],
    phase: 3,
    status: 'conceptual',
    crossing: 'ocean',
    systems: ['freight'],
    countries: ['Netherlands', 'United States'],
    rationale: 'Illustrates the furthest extent of the long-term vision.',
    assumptions: ['Shown as an idea only. Intercontinental freight would continue to use shipping and air.'],
    constraints: ['Transatlantic ocean crossing. No feasible tube alignment identified; major technical and political uncertainty.'],
  },
  {
    id: 'asia-americas',
    name: 'Asia — Americas (Pacific)',
    path: ['tokyo', 'los-angeles'],
    phase: 3,
    status: 'conceptual',
    crossing: 'ocean',
    systems: ['freight'],
    countries: ['Japan', 'United States'],
    rationale: 'Illustrates the furthest extent of the long-term vision.',
    assumptions: ['Shown as an idea only.'],
    constraints: ['Transpacific ocean crossing. No feasible tube alignment identified.'],
  },
  {
    id: 'india-africa',
    name: 'India — East Africa (Arabian Sea)',
    path: ['mumbai', 'mombasa'],
    phase: 3,
    status: 'conceptual',
    crossing: 'ocean',
    systems: ['freight'],
    countries: ['India', 'Kenya'],
    rationale: 'Illustrates linking Phase 2 and Phase 3 regions.',
    assumptions: ['Shown as an idea only.'],
    constraints: ['Open-ocean crossing. No feasible tube alignment identified.'],
  },
]

/** Pods are only animated on corridors that do not depend on an unresolved crossing. */
export function animatesPods(c: Corridor): boolean {
  return c.status !== 'conceptual' && (c.crossing === 'land' || c.crossing === 'strait')
}

export const hubById = Object.fromEntries(hubs.map((h) => [h.id, h])) as Record<string, Hub>
