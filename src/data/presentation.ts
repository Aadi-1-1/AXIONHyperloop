/** Presentation chapter order, principal messages and presenter notes. Slide layouts are in src/present/slides.tsx. */
export type Chapter = {
  slug: string
  title: string
  kicker: string
  /** The one message the audience should remember. */
  message: string
  notes: string[]
  demo?: { label: string; to: string }
}

export const chapters: Chapter[] = [
  {
    slug: 'vision',
    title: 'AXION Hyperloop',
    kicker: 'Concept-stage proposal',
    message: 'A freight-first hyperloop operator, at concept stage.',
    notes: [
      'Say clearly up front that this is a concept and feasibility-stage proposal.',
      'One sentence: we would develop, own and operate hyperloop freight corridors between logistics hubs.',
    ],
  },
  {
    slug: 'problem',
    title: 'The problem',
    kicker: 'Why this matters',
    message: 'Fast freight is expensive; affordable freight is slow.',
    notes: [
      'Air is fast but costly and capacity-constrained; road, rail and sea are cheaper but slower.',
      'IATA: about 35% of world trade by value moves by air but under 1% by volume. High-value goods already pay for speed.',
    ],
  },
  {
    slug: 'customer',
    title: 'Who pays',
    kicker: 'Paying customer',
    message: 'Logistics companies buy reserved capacity for time-sensitive goods.',
    notes: [
      'Customers are logistics providers and large shippers, not the public.',
      'Segments: e-commerce parcels, electronics and parts, urgent supplies, selected medical goods.',
      'Nothing has been validated yet; customer interviews are Gate 1.',
    ],
  },
  {
    slug: 'service',
    title: 'The service',
    kicker: 'How a shipment moves',
    message: 'Terminal to terminal by AXION; partners collect and deliver.',
    notes: [
      'Walk through the six stages, including customs on cross-border corridors.',
      'Tube travel is only part of complete shipment time, so terminals must be fast.',
    ],
    demo: { label: 'Open the shipment journey', to: '/#journey' },
  },
  {
    slug: 'lead-corridor',
    title: 'Lead study corridor',
    kicker: 'Where development starts',
    message: 'Singapore–Kuala Lumpur: the corridor we would study first. Feasibility unverified.',
    notes: [
      'About 310 km apart; we assume a 350 km alignment, the scale of the cancelled high-speed rail route.',
      'It is a study priority, not a decision to build. Tokyo–Osaka and Shanghai–Shenzhen are comparison corridors.',
      'Demo: open the corridor view and show the trace from Kunming to Singapore.',
    ],
    demo: { label: 'Open the corridor view', to: '/network?view=corridor&corridor=singapore-kuala-lumpur' },
  },
  {
    slug: 'vision-network',
    title: 'Regional and global vision',
    kicker: 'Order of ambition',
    message: 'Regions in order of ambition. Phases are not funding stages.',
    notes: [
      'Phase 1: China, Japan, Singapore. Phase 2: India, Europe. Phase 3: Africa, Americas.',
      'Each regional network is separate. Nairobi and Johannesburg are not connected; Los Angeles is a future hub.',
      'Sea and ocean links are dotted, conceptual and uncosted. No service is implied.',
    ],
    demo: { label: 'Open the regional networks', to: '/network?view=regional&region=china-sea' },
  },
  {
    slug: 'business-model',
    title: 'Business model',
    kicker: 'How we would earn',
    message: 'Recurring contracts for reserved capacity, priced per kilogram.',
    notes: [
      'Reserved capacity plus additional shipments; tracking and integration included.',
      'The price is a model input to be tested with customers, not a market price.',
    ],
  },
  {
    slug: 'economics',
    title: 'Economic conditions',
    kicker: 'What would have to be true',
    message: 'At central assumptions, freight revenue does not recover construction cost.',
    notes: [
      'Central case: about $23bn to build; operations are covered, but renewals and capital are not.',
      'Show the prices required for each target, and that public infrastructure funding changes the picture most.',
      'Demo: open the scenario model, switch scenarios and move the price lever.',
    ],
    demo: { label: 'Open the scenario model', to: '/business#corridor-model' },
  },
  {
    slug: 'programme',
    title: 'Development programme',
    kicker: 'Three years, five gates',
    message: 'Five gates turn uncertainty into evidence, and any of them can stop the programme.',
    notes: [
      'Technology status: short test-track demonstrations only, and several developers failed in 2023–2026.',
      'Tranches are drawn as gates are passed; no revenue is assumed.',
    ],
    demo: { label: 'Open the technology cutaway', to: '/network#technology' },
  },
  {
    slug: 'ask',
    title: 'Funding ask',
    kicker: '$50m development round',
    message: '$50m buys a construction decision, not a construction project.',
    notes: [
      'Make the contrast explicit: $50m now versus about $23bn of conditional construction finance later.',
      'Salaries of $10.8m are inside the $50m, not on top of it.',
      'Passenger, regional and intercontinental stages are separate and uncosted.',
    ],
    demo: { label: 'Open the investor page', to: '/investors#funding-ladder' },
  },
  {
    slug: 'leadership',
    title: 'Leadership',
    kicker: 'The team',
    message: 'Four executives, four lines of accountability.',
    notes: ['Introduce each executive and their responsibilities.'],
  },
  {
    slug: 'close',
    title: 'The investment case',
    kicker: 'The decision we are asking for',
    message: 'Fund the evidence, then decide.',
    notes: ['Summarise, restate the ask and invite questions. Point to the Evidence page.'],
  },
]

/** Earlier chapter URLs that now map to the revised narrative. */
export const chapterAliases: Record<string, string> = {
  product: 'service',
  network: 'lead-corridor',
  technology: 'programme',
  market: 'customer',
  financials: 'economics',
}
