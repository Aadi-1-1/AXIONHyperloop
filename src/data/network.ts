/**
 * Proposed AXION network: planning assumptions only.
 *
 * Cities are representative planning nodes for the proposed countries, not selected terminal sites.
 * Coordinates are city-centre WGS84 latitude / longitude (decimal degrees).
 * Lines drawn from this data are proposed connections, not surveyed alignments.
 * Only the lead study corridor carries an assumed alignment length; every other distance shown
 * is the approximate great-circle distance between city centres.
 */

export type PhaseId = 1 | 2 | 3
export type SystemId = 'freight' | 'passenger'
/** lead = proposed lead study corridor; study = comparison corridor; expansion = later regional; conceptual = unresolved idea */
export type CorridorStatus = 'lead' | 'study' | 'expansion' | 'conceptual'
/** land = overland; strait = short water crossing with existing fixed-link precedent; sea / ocean = unresolved crossing */
export type Crossing = 'land' | 'strait' | 'sea' | 'ocean'
export type RegionId =
  | 'china-sea'
  | 'japan'
  | 'india'
  | 'europe'
  | 'east-africa'
  | 'southern-africa'
  | 'north-america'
  | 'south-america'

export type Hub = {
  id: string
  city: string
  country: string
  lat: number
  lon: number
  phase: PhaseId
  region: RegionId
  /** hub = proposed logistics hub; transit = planning node in an intervening country; future = no regional corridor proposed yet */
  role: 'hub' | 'transit' | 'future'
  note: string
}

export type Corridor = {
  id: string
  name: string
  /** Ordered hub ids. Multi-point corridors pass through intermediate nodes. */
  path: string[]
  phase: PhaseId
  regions: RegionId[]
  status: CorridorStatus
  crossing: Crossing
  systems: SystemId[]
  countries: string[]
  /** Only set where an alignment length has been assumed for modelling. */
  assumedAlignmentKm?: number
  rationale: string
  assumptions: string[]
  constraints: string[]
}

export const phases: { id: PhaseId; label: string; regions: string; focus: { lon: number; lat: number } }[] = [
  { id: 1, label: 'Phase 1', regions: 'China, Japan and Singapore', focus: { lon: 115, lat: 22 } },
  { id: 2, label: 'Phase 2', regions: 'India and Europe', focus: { lon: 50, lat: 32 } },
  { id: 3, label: 'Phase 3', regions: 'Africa and the Americas', focus: { lon: -20, lat: 10 } },
]

export const phaseExplainer =
  'Geographic phases set the order in which regions would be studied. They are not funding stages or timetables: the $50m development round funds feasibility work on the lead study corridor only. Every later phase needs its own evidence and finance.'

export type Region = {
  id: RegionId
  label: string
  short: string
  phase: PhaseId
  summary: string
  /** Extra points that keep the view framed around the regional network. */
  frame: [number, number][]
}

export const regions: Region[] = [
  {
    id: 'china-sea',
    label: 'China and Southeast Asia',
    short: 'China & SE Asia',
    phase: 1,
    summary:
      'Includes the lead study corridor, Singapore–Kuala Lumpur. China–Singapore needs agreements with Laos, Thailand and Malaysia, or a maritime strategy instead.',
    frame: [
      [96, -3],
      [124, 42],
    ],
  },
  {
    id: 'japan',
    label: 'Japan',
    short: 'Japan',
    phase: 1,
    summary: 'Tokyo–Osaka–Fukuoka on land and short straits. Any link to China would need a long sea crossing that remains conceptual.',
    frame: [
      [119, 29],
      [142, 38],
    ],
  },
  {
    id: 'india',
    label: 'India',
    short: 'India',
    phase: 2,
    summary: 'One continuous chain: Delhi → Mumbai → Bengaluru → Chennai.',
    frame: [
      [70, 9],
      [84, 31],
    ],
  },
  {
    id: 'europe',
    label: 'Europe',
    short: 'Europe',
    phase: 2,
    summary: 'Paris → Rotterdam → Frankfurt → Milan, a port gateway linked to central and southern markets.',
    frame: [
      [-1, 43],
      [12, 54],
    ],
  },
  {
    id: 'east-africa',
    label: 'East Africa',
    short: 'East Africa',
    phase: 3,
    summary: 'Mombasa port to Nairobi. A separate regional network, with no corridor to Southern Africa proposed.',
    frame: [
      [34, -6],
      [42, 1],
    ],
  },
  {
    id: 'southern-africa',
    label: 'Southern Africa',
    short: 'Southern Africa',
    phase: 3,
    summary: 'Durban port to Johannesburg. A separate regional network, with no corridor to East Africa proposed.',
    frame: [
      [25, -31.5],
      [34, -24],
    ],
  },
  {
    id: 'north-america',
    label: 'North America',
    short: 'North America',
    phase: 3,
    summary: 'New York–Chicago. Los Angeles is a future hub: no regional corridor is proposed for it.',
    frame: [
      [-121, 30],
      [-70, 45],
    ],
  },
  {
    id: 'south-america',
    label: 'South America',
    short: 'South America',
    phase: 3,
    summary: 'São Paulo–Rio de Janeiro, across the coastal mountain range.',
    frame: [
      [-48, -25],
      [-41.5, -21],
    ],
  },
]

export const regionById = Object.fromEntries(regions.map((r) => [r.id, r])) as Record<RegionId, Region>

export const statusMeta: Record<CorridorStatus, { label: string; short: string; description: string }> = {
  lead: {
    label: 'Proposed lead study corridor: feasibility unverified',
    short: 'Lead study corridor',
    description:
      'The corridor the development programme would study first. It is a study priority, not a decision or commitment to build.',
  },
  study: {
    label: 'Comparison corridor for study',
    short: 'Comparison corridor',
    description: 'Studied alongside the lead corridor to test whether another first corridor would be stronger.',
  },
  expansion: {
    label: 'Proposed regional expansion',
    short: 'Regional expansion',
    description: 'Considered only after a first corridor is validated and operating.',
  },
  conceptual: {
    label: 'Long-term conceptual connection',
    short: 'Conceptual',
    description: 'A long-range idea with unresolved engineering and feasibility. It is uncosted and no service is implied.',
  },
}

export const crossingMeta: Record<Crossing, string> = {
  land: 'Overland',
  strait: 'Short strait crossing',
  sea: 'Sea crossing (engineering unresolved)',
  ocean: 'Ocean crossing (no feasible alignment identified)',
}

export const networkDisclaimer =
  'Lines are proposed connections between representative cities, not surveyed alignments. Distances are approximate great-circle distances between city centres unless an assumed alignment length is stated.'

export const hubs: Hub[] = [
  // Phase 1: China
  { id: 'beijing', city: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074, phase: 1, region: 'china-sea', role: 'hub', note: 'Northern China logistics and distribution centre.' },
  { id: 'shanghai', city: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737, phase: 1, region: 'china-sea', role: 'hub', note: 'Yangtze River Delta manufacturing and port region.' },
  { id: 'shenzhen', city: 'Shenzhen', country: 'China', lat: 22.5431, lon: 114.0579, phase: 1, region: 'china-sea', role: 'hub', note: 'Pearl River Delta electronics manufacturing and e-commerce region.' },
  { id: 'kunming', city: 'Kunming', country: 'China', lat: 25.0389, lon: 102.7183, phase: 1, region: 'china-sea', role: 'hub', note: 'South-western gateway towards mainland Southeast Asia.' },
  // Phase 1: Southeast Asia
  { id: 'singapore', city: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198, phase: 1, region: 'china-sea', role: 'hub', note: 'Proposed AXION headquarters and southern terminus of the lead study corridor.' },
  { id: 'kuala-lumpur', city: 'Kuala Lumpur', country: 'Malaysia', lat: 3.139, lon: 101.6869, phase: 1, region: 'china-sea', role: 'hub', note: 'Northern terminus of the lead study corridor. Any service would need Malaysian government agreement.' },
  { id: 'bangkok', city: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018, phase: 1, region: 'china-sea', role: 'transit', note: 'Intervening-country planning node. Any route would need Thai agreement.' },
  { id: 'vientiane', city: 'Vientiane', country: 'Laos', lat: 17.9757, lon: 102.6331, phase: 1, region: 'china-sea', role: 'transit', note: 'Intervening-country planning node. Any route would need Lao agreement.' },
  // Phase 1: Japan
  { id: 'tokyo', city: 'Tokyo', country: 'Japan', lat: 35.6762, lon: 139.6503, phase: 1, region: 'japan', role: 'hub', note: 'Largest Japanese consumer and distribution market.' },
  { id: 'osaka', city: 'Osaka', country: 'Japan', lat: 34.6937, lon: 135.5023, phase: 1, region: 'japan', role: 'hub', note: 'Kansai industrial and logistics region.' },
  { id: 'fukuoka', city: 'Fukuoka', country: 'Japan', lat: 33.5904, lon: 130.4017, phase: 1, region: 'japan', role: 'hub', note: 'Kyushu gateway and the closest major Japanese city to mainland Asia.' },
  // Phase 2: India
  { id: 'delhi', city: 'Delhi', country: 'India', lat: 28.6139, lon: 77.209, phase: 2, region: 'india', role: 'hub', note: 'Northern India distribution centre.' },
  { id: 'mumbai', city: 'Mumbai', country: 'India', lat: 19.076, lon: 72.8777, phase: 2, region: 'india', role: 'hub', note: 'Western India port and commercial centre.' },
  { id: 'bengaluru', city: 'Bengaluru', country: 'India', lat: 12.9716, lon: 77.5946, phase: 2, region: 'india', role: 'hub', note: 'Southern India technology and electronics region.' },
  { id: 'chennai', city: 'Chennai', country: 'India', lat: 13.0827, lon: 80.2707, phase: 2, region: 'india', role: 'hub', note: 'South-eastern India port and manufacturing region.' },
  // Phase 2: Europe
  { id: 'paris', city: 'Paris', country: 'France', lat: 48.8566, lon: 2.3522, phase: 2, region: 'europe', role: 'hub', note: 'Large consumer market and distribution region.' },
  { id: 'rotterdam', city: 'Rotterdam', country: 'Netherlands', lat: 51.9244, lon: 4.4777, phase: 2, region: 'europe', role: 'hub', note: 'Major European port and logistics gateway.' },
  { id: 'frankfurt', city: 'Frankfurt', country: 'Germany', lat: 50.1109, lon: 8.6821, phase: 2, region: 'europe', role: 'hub', note: 'Central European air-cargo and distribution hub.' },
  { id: 'milan', city: 'Milan', country: 'Italy', lat: 45.4642, lon: 9.19, phase: 2, region: 'europe', role: 'hub', note: 'Northern Italian manufacturing and distribution region.' },
  // Phase 3: Africa
  { id: 'mombasa', city: 'Mombasa', country: 'Kenya', lat: -4.0435, lon: 39.6682, phase: 3, region: 'east-africa', role: 'hub', note: 'East African port gateway.' },
  { id: 'nairobi', city: 'Nairobi', country: 'Kenya', lat: -1.2921, lon: 36.8219, phase: 3, region: 'east-africa', role: 'hub', note: 'East African commercial and distribution centre.' },
  { id: 'durban', city: 'Durban', country: 'South Africa', lat: -29.8587, lon: 31.0218, phase: 3, region: 'southern-africa', role: 'hub', note: 'Southern African port gateway.' },
  { id: 'johannesburg', city: 'Johannesburg', country: 'South Africa', lat: -26.2041, lon: 28.0473, phase: 3, region: 'southern-africa', role: 'hub', note: 'Southern African commercial centre.' },
  // Phase 3: Americas
  { id: 'new-york', city: 'New York', country: 'United States', lat: 40.7128, lon: -74.006, phase: 3, region: 'north-america', role: 'hub', note: 'North-eastern US consumer and port region.' },
  { id: 'chicago', city: 'Chicago', country: 'United States', lat: 41.8781, lon: -87.6298, phase: 3, region: 'north-america', role: 'hub', note: 'Central US rail and distribution hub.' },
  {
    id: 'los-angeles',
    city: 'Los Angeles',
    country: 'United States',
    lat: 34.0522,
    lon: -118.2437,
    phase: 3,
    region: 'north-america',
    role: 'future',
    note: 'Future hub. No regional corridor is proposed. It appears only as the endpoint of the conceptual Pacific connection.',
  },
  { id: 'sao-paulo', city: 'São Paulo', country: 'Brazil', lat: -23.5505, lon: -46.6333, phase: 3, region: 'south-america', role: 'hub', note: 'Largest South American commercial centre.' },
  { id: 'rio', city: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729, phase: 3, region: 'south-america', role: 'hub', note: 'South-eastern Brazil port and consumer region.' },
]

const unstudied = [
  'Representative city centres stand in for terminal sites that have not been chosen.',
  'Demand, alignment, land and cost have not been studied.',
]

export const corridors: Corridor[] = [
  // ---------- Phase 1: lead and comparison corridors ----------
  {
    id: 'singapore-kuala-lumpur',
    name: 'Singapore — Kuala Lumpur',
    path: ['singapore', 'kuala-lumpur'],
    phase: 1,
    regions: ['china-sea'],
    status: 'lead',
    crossing: 'strait',
    systems: ['freight', 'passenger'],
    countries: ['Singapore', 'Malaysia'],
    assumedAlignmentKm: 350,
    rationale:
      'It links the proposed headquarters with Malaysia’s capital region over a short, mostly overland distance. It is also a first test of cross-border customs integration and of a freight-only operating case.',
    assumptions: [
      'An assumed alignment of 350 km, at the scale of the previously proposed KL–Singapore high-speed rail route. Not surveyed.',
      'Freight first, with twin tubes (one per direction). A passenger system would be separate infrastructure with its own approvals.',
      'Terminals near Singapore’s northern logistics zone and Kuala Lumpur’s logistics belt (not selected).',
    ],
    constraints: [
      'Crosses the Johor Strait and an international border, so two regulatory regimes apply.',
      'Land in Singapore is scarce; terminal siting and the urban approach are the costliest sections.',
      'A government-to-government high-speed rail project on this axis was terminated in 2021, which shows the political and financial difficulty.',
    ],
  },
  {
    id: 'tokyo-osaka',
    name: 'Tokyo — Osaka',
    path: ['tokyo', 'osaka'],
    phase: 1,
    regions: ['japan'],
    status: 'study',
    crossing: 'land',
    systems: ['freight', 'passenger'],
    countries: ['Japan'],
    rationale: 'Dense, high-value parcel and component flows between Japan’s two largest economic regions.',
    assumptions: [...unstudied, 'A passenger system would use separate infrastructure and its own approval programme.'],
    constraints: [
      'Mountainous terrain and dense urban land raise tunnelling and land costs.',
      'High seismic activity requires specialist structural and safety design.',
      'Existing high-speed rail and road freight set a demanding benchmark.',
    ],
  },
  {
    id: 'shanghai-shenzhen',
    name: 'Shanghai — Shenzhen',
    path: ['shanghai', 'shenzhen'],
    phase: 1,
    regions: ['china-sea'],
    status: 'study',
    crossing: 'land',
    systems: ['freight'],
    countries: ['China'],
    rationale: 'Links two major manufacturing and e-commerce regions with large time-sensitive parcel and electronics flows.',
    assumptions: [...unstudied, 'Freight only for comparison purposes.'],
    constraints: [
      'About four times the length of the lead corridor, so the capital requirement is far larger.',
      'Strong competition from express road, rail and domestic air freight.',
      'Requires national and provincial approvals and partnership structures not yet explored.',
    ],
  },
  // ---------- Phase 1: regional expansion ----------
  {
    id: 'beijing-shanghai',
    name: 'Beijing — Shanghai',
    path: ['beijing', 'shanghai'],
    phase: 1,
    regions: ['china-sea'],
    status: 'expansion',
    crossing: 'land',
    systems: ['freight', 'passenger'],
    countries: ['China'],
    rationale: 'Would connect the northern and eastern China logistics regions.',
    assumptions: unstudied,
    constraints: ['A very long corridor with high capital cost.', 'Existing high-speed rail already serves passengers on this axis.'],
  },
  {
    id: 'shenzhen-kunming',
    name: 'Shenzhen — Kunming',
    path: ['shenzhen', 'kunming'],
    phase: 1,
    regions: ['china-sea'],
    status: 'expansion',
    crossing: 'land',
    systems: ['freight'],
    countries: ['China'],
    rationale: 'Would link the Pearl River Delta to the south-western gateway towards Southeast Asia.',
    assumptions: unstudied,
    constraints: ['Mountainous terrain across Guangxi and Yunnan.', 'Long distance relative to likely early freight volumes.'],
  },
  {
    id: 'kunming-kuala-lumpur',
    name: 'Kunming — Vientiane — Bangkok — Kuala Lumpur',
    path: ['kunming', 'vientiane', 'bangkok', 'kuala-lumpur'],
    phase: 1,
    regions: ['china-sea'],
    status: 'expansion',
    crossing: 'land',
    systems: ['freight'],
    countries: ['China', 'Laos', 'Thailand', 'Malaysia'],
    rationale:
      'China and Singapore are not adjacent. An overland connection must pass through Laos, Thailand and Malaysia, broadly in the direction of existing rail development in the region. With the lead corridor it would complete China–Singapore.',
    assumptions: [
      ...unstudied,
      'Intervening countries are planning nodes only. No agreements or discussions exist.',
      'The alternative is a maritime strategy: port-to-port shipping between AXION terminals.',
    ],
    constraints: [
      'Requires agreements with Laos, Thailand and Malaysia as well as China.',
      'Several customs borders add handling time that could cancel out in-tube speed.',
      'Mountainous terrain in northern Laos.',
    ],
  },
  {
    id: 'osaka-fukuoka',
    name: 'Osaka — Fukuoka',
    path: ['osaka', 'fukuoka'],
    phase: 1,
    regions: ['japan'],
    status: 'expansion',
    crossing: 'strait',
    systems: ['freight'],
    countries: ['Japan'],
    rationale: 'Would extend a Japanese corridor to Kyushu, Japan’s gateway towards mainland Asia.',
    assumptions: unstudied,
    constraints: ['Crosses the Kanmon Strait between Honshu and Kyushu.', 'Mountainous terrain and seismic design requirements.'],
  },
  // ---------- Phase 1: conceptual ----------
  {
    id: 'shanghai-fukuoka',
    name: 'Shanghai — Fukuoka (East China Sea)',
    path: ['shanghai', 'fukuoka'],
    phase: 1,
    regions: ['japan', 'china-sea'],
    status: 'conceptual',
    crossing: 'sea',
    systems: ['freight'],
    countries: ['China', 'Japan'],
    rationale: 'Japan is an island nation, so any fixed link to China needs a long sea crossing.',
    assumptions: [
      'Shown only to illustrate the ambition of linking Phase 1 markets.',
      'Until a crossing is proven, freight between Japan and China uses existing shipping and air services.',
    ],
    constraints: [
      'Hundreds of kilometres of open sea, far beyond any existing undersea tunnel.',
      'Deep water, seismic risk and international agreements: engineering status unresolved.',
    ],
  },
  // ---------- Phase 2: India chain ----------
  {
    id: 'delhi-mumbai',
    name: 'Delhi — Mumbai',
    path: ['delhi', 'mumbai'],
    phase: 2,
    regions: ['india'],
    status: 'expansion',
    crossing: 'land',
    systems: ['freight', 'passenger'],
    countries: ['India'],
    rationale: 'First link of the India chain: the northern capital region to the main western port.',
    assumptions: unstudied,
    constraints: ['Long corridor with significant land acquisition.', 'Dedicated freight rail development is an important alternative.'],
  },
  {
    id: 'mumbai-bengaluru',
    name: 'Mumbai — Bengaluru',
    path: ['mumbai', 'bengaluru'],
    phase: 2,
    regions: ['india'],
    status: 'expansion',
    crossing: 'land',
    systems: ['freight'],
    countries: ['India'],
    rationale: 'Second link of the India chain: port activity to southern electronics and technology demand.',
    assumptions: unstudied,
    constraints: ['Western Ghats terrain.', 'Land acquisition and state-level coordination.'],
  },
  {
    id: 'bengaluru-chennai',
    name: 'Bengaluru — Chennai',
    path: ['bengaluru', 'chennai'],
    phase: 2,
    regions: ['india'],
    status: 'expansion',
    crossing: 'land',
    systems: ['freight', 'passenger'],
    countries: ['India'],
    rationale: 'Third link of the India chain: a technology region to an east-coast port.',
    assumptions: unstudied,
    constraints: ['Dense urban approaches at both ends.'],
  },
  // ---------- Phase 2: Europe chain ----------
  {
    id: 'paris-rotterdam',
    name: 'Paris — Rotterdam',
    path: ['paris', 'rotterdam'],
    phase: 2,
    regions: ['europe'],
    status: 'expansion',
    crossing: 'land',
    systems: ['freight', 'passenger'],
    countries: ['France', 'Belgium', 'Netherlands'],
    rationale: 'Connects a large consumer market with a major port gateway.',
    assumptions: unstudied,
    constraints: ['Crosses three countries.', 'Mature high-speed rail and road freight alternatives.'],
  },
  {
    id: 'rotterdam-frankfurt',
    name: 'Rotterdam — Frankfurt',
    path: ['rotterdam', 'frankfurt'],
    phase: 2,
    regions: ['europe'],
    status: 'expansion',
    crossing: 'land',
    systems: ['freight'],
    countries: ['Netherlands', 'Germany'],
    rationale: 'Links Europe’s largest port region with a central European cargo hub.',
    assumptions: unstudied,
    constraints: ['Rhine inland shipping and rail freight are low-cost alternatives for bulk goods.'],
  },
  {
    id: 'frankfurt-milan',
    name: 'Frankfurt — Milan',
    path: ['frankfurt', 'milan'],
    phase: 2,
    regions: ['europe'],
    status: 'expansion',
    crossing: 'land',
    systems: ['freight'],
    countries: ['Germany', 'Switzerland', 'Italy'],
    rationale: 'A north–south European freight axis.',
    assumptions: unstudied,
    constraints: ['Crossing the Alps would require very long tunnels.', 'Requires Swiss transit agreements.'],
  },
  // ---------- Phase 2: conceptual ----------
  {
    id: 'india-europe',
    name: 'Delhi — Frankfurt (India–Europe overland)',
    path: ['delhi', 'frankfurt'],
    phase: 2,
    regions: [],
    status: 'conceptual',
    crossing: 'land',
    systems: ['freight'],
    countries: ['India', 'several intervening countries', 'Germany'],
    rationale: 'Illustrates the long-term ambition of linking the Phase 2 regions.',
    assumptions: ['No intervening route or partner countries have been identified.'],
    constraints: ['Passes through many countries with differing regulation and political conditions.', 'Major mountain ranges and very long distance.'],
  },
  {
    id: 'chennai-singapore',
    name: 'Chennai — Singapore (Bay of Bengal)',
    path: ['chennai', 'singapore'],
    phase: 2,
    regions: [],
    status: 'conceptual',
    crossing: 'ocean',
    systems: ['freight'],
    countries: ['India', 'Singapore'],
    rationale: 'Illustrates a link between the Phase 1 and Phase 2 markets.',
    assumptions: ['Freight would use existing shipping and air services unless a crossing became feasible.'],
    constraints: ['Open-ocean crossing of thousands of kilometres. No feasible tube alignment identified.'],
  },
  // ---------- Phase 3 ----------
  {
    id: 'mombasa-nairobi',
    name: 'Mombasa — Nairobi',
    path: ['mombasa', 'nairobi'],
    phase: 3,
    regions: ['east-africa'],
    status: 'expansion',
    crossing: 'land',
    systems: ['freight'],
    countries: ['Kenya'],
    rationale: 'Connects East Africa’s main port gateway with its inland commercial centre.',
    assumptions: unstudied,
    constraints: ['Existing standard-gauge rail is a direct alternative.', 'Financing capacity for large infrastructure.'],
  },
  {
    id: 'durban-johannesburg',
    name: 'Durban — Johannesburg',
    path: ['durban', 'johannesburg'],
    phase: 3,
    regions: ['southern-africa'],
    status: 'expansion',
    crossing: 'land',
    systems: ['freight'],
    countries: ['South Africa'],
    rationale: 'Links a major port with Southern Africa’s commercial centre.',
    assumptions: unstudied,
    constraints: ['A large climb from the coast to the inland plateau.'],
  },
  {
    id: 'new-york-chicago',
    name: 'New York — Chicago',
    path: ['new-york', 'chicago'],
    phase: 3,
    regions: ['north-america'],
    status: 'expansion',
    crossing: 'land',
    systems: ['freight', 'passenger'],
    countries: ['United States'],
    rationale: 'Connects the US north-east consumer market with a central rail and distribution hub.',
    assumptions: unstudied,
    constraints: ['Appalachian terrain.', 'Mature trucking, rail and air freight competition.'],
  },
  {
    id: 'sao-paulo-rio',
    name: 'São Paulo — Rio de Janeiro',
    path: ['sao-paulo', 'rio'],
    phase: 3,
    regions: ['south-america'],
    status: 'expansion',
    crossing: 'land',
    systems: ['freight', 'passenger'],
    countries: ['Brazil'],
    rationale: 'Connects Brazil’s two largest metropolitan economies.',
    assumptions: unstudied,
    constraints: ['Coastal mountain range between the two cities.'],
  },
  {
    id: 'europe-americas',
    name: 'Rotterdam — New York (Atlantic)',
    path: ['rotterdam', 'new-york'],
    phase: 3,
    regions: [],
    status: 'conceptual',
    crossing: 'ocean',
    systems: ['freight'],
    countries: ['Netherlands', 'United States'],
    rationale: 'Illustrates the furthest extent of the long-term vision.',
    assumptions: ['An idea only. Intercontinental freight would continue to use shipping and air.'],
    constraints: ['A transatlantic ocean crossing. No feasible tube alignment identified, with major technical and political uncertainty.'],
  },
  {
    id: 'asia-americas',
    name: 'Tokyo — Los Angeles (Pacific)',
    path: ['tokyo', 'los-angeles'],
    phase: 3,
    regions: [],
    status: 'conceptual',
    crossing: 'ocean',
    systems: ['freight'],
    countries: ['Japan', 'United States'],
    rationale: 'Illustrates the furthest extent of the long-term vision, and is the only line that reaches Los Angeles.',
    assumptions: ['An idea only.'],
    constraints: ['A transpacific ocean crossing. No feasible tube alignment identified.'],
  },
  {
    id: 'mumbai-mombasa',
    name: 'Mumbai — Mombasa (Arabian Sea)',
    path: ['mumbai', 'mombasa'],
    phase: 3,
    regions: [],
    status: 'conceptual',
    crossing: 'ocean',
    systems: ['freight'],
    countries: ['India', 'Kenya'],
    rationale: 'Illustrates a link between the Phase 2 and Phase 3 regions.',
    assumptions: ['An idea only.'],
    constraints: ['An open-ocean crossing. No feasible tube alignment identified.'],
  },
]

/** Pods are only animated on corridors that do not depend on an unresolved crossing. */
export function animatesPods(c: Corridor): boolean {
  return c.status !== 'conceptual' && (c.crossing === 'land' || c.crossing === 'strait')
}

export const hubById = Object.fromEntries(hubs.map((h) => [h.id, h])) as Record<string, Hub>
export const corridorById = Object.fromEntries(corridors.map((c) => [c.id, c])) as Record<string, Corridor>
export const leadCorridor = corridors.find((c) => c.status === 'lead')!

/** Corridors drawn in a regional view: those in the region plus any conceptual line touching its hubs. */
export function corridorsForRegion(id: RegionId): Corridor[] {
  const regionHubs = new Set(hubs.filter((h) => h.region === id).map((h) => h.id))
  return corridors.filter((c) => c.regions.includes(id) || c.path.some((p) => regionHubs.has(p)))
}
