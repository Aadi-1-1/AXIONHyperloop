/** Presentation chapter order, titles and presenter notes. Slide bodies live in src/present/slides.tsx. */
export type Chapter = {
  slug: string
  title: string
  kicker: string
  notes: string[]
  demo?: { label: string; to: string }
}

export const chapters: Chapter[] = [
  {
    slug: 'vision',
    title: 'Company and vision',
    kicker: 'AXION Hyperloop',
    notes: [
      'Introduce AXION as a concept and feasibility-stage proposal — say this clearly up front.',
      'One sentence on the business: we would develop, own and operate Hyperloop freight corridors between logistics hubs.',
      'Freight first; passengers later on separate infrastructure.',
    ],
  },
  {
    slug: 'problem',
    title: 'Customer problem',
    kicker: 'Why this matters',
    notes: [
      'Air is fast but expensive; road, rail and sea are economical but slower.',
      'Use the IATA figure: high-value goods already pay for speed.',
      'Stress that complete delivery time includes handling at both ends.',
    ],
  },
  {
    slug: 'product',
    title: 'Product and shipment journey',
    kicker: 'What we sell',
    notes: [
      'We sell reserved capacity under recurring contracts, plus spare capacity, tracking and terminal integration.',
      'Walk through the six journey stages. Partners collect and deliver; AXION runs terminal to terminal.',
      'Point out customs at loading and at the receiving terminal for cross-border routes.',
    ],
    demo: { label: 'Open shipment journey', to: '/#journey' },
  },
  {
    slug: 'network',
    title: 'Proposed network',
    kicker: 'Where',
    notes: [
      'Three geographic phases: China, Japan and Singapore; India and Europe; Africa and the Americas.',
      'No launch corridor is selected — three candidates are under study.',
      'Be explicit: China–Singapore crosses other countries; Japan and the Americas need sea or ocean crossings.',
      'Optional demo: open the network explorer, select Phase 1 and a candidate corridor.',
    ],
    demo: { label: 'Open network explorer', to: '/network' },
  },
  {
    slug: 'technology',
    title: 'Technical concept and feasibility',
    kicker: 'How it works',
    notes: [
      'Pods in low-pressure tubes, moved by linear motors, with airlocks at terminals.',
      'Technology is not commercially proven — test tracks exist, commercial systems do not.',
      'Five gates from customer validation to a construction decision. Passengers need extra safety evidence.',
    ],
    demo: { label: 'Open technology cutaway', to: '/network#technology' },
  },
  {
    slug: 'market',
    title: 'Customer and competitor analysis',
    kicker: 'Who and against what',
    notes: [
      'Initial segments: e-commerce parcels, electronics and parts, urgent supplies, selected medical goods.',
      'Market sizing framework — no market size claimed yet.',
      'We do not beat every mode on every measure; we target the gap between air and road.',
    ],
  },
  {
    slug: 'business-model',
    title: 'Business model',
    kicker: 'How we earn',
    notes: [
      'Recurring reserved-capacity contracts are the core revenue.',
      'Pricing assumption: $0.20/kg average charge — a model input to be tested in customer interviews, not a market price.',
      'Sales route: interviews → shipment analysis → proposals → conditional commitments → contracts.',
    ],
  },
  {
    slug: 'financials',
    title: 'Financial scenarios',
    kicker: 'Illustrative 100 km corridor',
    notes: [
      'Three utilisation scenarios. Break-even at about 42% utilisation.',
      'These are operating results before depreciation, financing, tax and renewals.',
      'Be direct: the $3bn construction illustration is a serious financing challenge — operating surplus alone does not justify it.',
      'Optional demo: open the operating explorer and move utilisation.',
    ],
    demo: { label: 'Open operating explorer', to: '/business#operating-model' },
  },
  {
    slug: 'programme',
    title: 'Development programme',
    kicker: 'Three years, five gates',
    notes: [
      'Year-by-year spending and closing cash. No revenue assumed.',
      'Each gate is a decision point — the programme can stop if evidence is weak.',
    ],
  },
  {
    slug: 'ask',
    title: 'Funding ask',
    kicker: '$50m development round',
    notes: [
      'Walk through the allocation. Salaries ($10.8m) are inside these lines, not on top.',
      '30 people across engineering, software, safety, commercial and administration.',
      'Further financing is needed before construction; passengers are outside this budget.',
    ],
    demo: { label: 'Open investor page', to: '/investors' },
  },
  {
    slug: 'leadership',
    title: 'Leadership',
    kicker: 'The team',
    notes: ['Introduce each executive and their responsibilities.'],
  },
  {
    slug: 'close',
    title: 'Closing investment case',
    kicker: 'The decision we are asking for',
    notes: [
      'Summarise: a real logistics gap, a freight-first model, an honest risk picture and gated spending.',
      'The ask: $50m to find out — with evidence — whether a first corridor should be built.',
      'Invite questions and point to the Evidence page.',
    ],
  },
]
