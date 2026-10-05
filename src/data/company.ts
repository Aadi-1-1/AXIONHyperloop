/** Company-level content shared across pages and the presentation. */

export const company = {
  name: 'AXION Hyperloop',
  shortName: 'AXION',
  tagline: 'Move goods. Connect people.',
  oneLiner:
    'AXION proposes to develop, own and operate Hyperloop freight corridors between major logistics hubs — with a separate passenger system planned for selected corridors later.',
  stage: 'Concept and feasibility-stage proposal',
  stageNotice:
    'AXION Hyperloop is a concept-stage business proposal prepared for an investor-style school pitch. It is not incorporated, licensed, funded or operating, and has no customers, partners or agreements.',
  headquarters: 'Singapore (proposed)',
  ownership: 'Privately held company seeking equity investment (proposed)',
  objectives: [
    'Validate whether time-sensitive freight customers would contract for reserved Hyperloop capacity.',
    'Test the Singapore–Kuala Lumpur lead study corridor against comparison corridors, and confirm or replace it.',
    'Demonstrate pod, propulsion, vacuum and terminal-transfer systems at test scale.',
    'Reach an evidence-based construction decision for a first commercial freight corridor.',
  ],
}

export const problem = {
  headline: 'Fast freight is expensive. Affordable freight is slow.',
  points: [
    {
      title: 'A gap between modes',
      body: 'Air freight is fast but costly and capacity-constrained. Road, rail and sea are economical but slower and exposed to congestion and handling delays.',
    },
    {
      title: 'Time is lost at the edges',
      body: 'Complete delivery time includes collection, consolidation, checks, customs and final delivery — not just the line-haul. Faster travel only helps if terminals are fast too.',
    },
    {
      title: 'Reliability is a cost',
      body: 'Unpredictable arrival times force businesses to hold extra stock and pay for urgent alternatives when shipments are late.',
    },
  ],
}

export const products = [
  {
    id: 'freight',
    system: 'freight' as const,
    name: 'AXION Freight',
    status: 'Primary early commercial focus',
    summary:
      'Reserved terminal-to-terminal capacity between major logistics hubs, sold to logistics providers and large shippers through recurring contracts.',
    features: [
      'Reserved capacity under recurring business contracts',
      'Additional shipment capacity when available',
      'Shipment tracking and estimated-arrival visibility',
      'Terminal integration with customers’ logistics networks',
    ],
  },
  {
    id: 'passenger',
    system: 'passenger' as const,
    name: 'AXION Passenger',
    status: 'Later, separate development programme',
    summary:
      'A separate passenger system on selected corridors, with its own infrastructure, costs, safety case and approval milestones.',
    features: [
      'Passenger tickets on selected corridors',
      'Business travel agreements',
      'Separate safety and approval evidence before any service',
      'Outside the current $50m development budget',
    ],
  },
]

export const benefits = [
  {
    title: 'Shorter complete delivery time',
    body: 'Useful reductions in door-to-door time, achieved by combining fast line-haul with quick terminal handling — not by tube speed alone.',
  },
  {
    title: 'Reliable capacity and schedules',
    body: 'Reserved capacity and a dedicated, weather-protected corridor aim to make arrival times predictable.',
  },
  {
    title: 'Competitive economics',
    body: 'Pricing aims to be competitive with premium express options for time-sensitive goods. It is not assumed to be cheaper than every alternative.',
  },
  {
    title: 'Potentially lower lifecycle emissions',
    body: 'Electric operation could reduce emissions, depending on the electricity source, construction impacts, maintenance and utilisation. This must be modelled, not assumed.',
  },
]

export const customerSegments = [
  {
    title: 'E-commerce parcels',
    body: 'High volumes of small, standardised parcels where next-day and same-day promises depend on fast trunk movement between hubs.',
  },
  {
    title: 'Electronics and replacement parts',
    body: 'High value per kilogram, where downtime or delay costs far more than transport.',
  },
  {
    title: 'Urgent business supplies',
    body: 'Documents, samples and production inputs that currently move by premium express services.',
  },
  {
    title: 'Selected medical goods',
    body: 'Only where suitable temperature control, handling and regulatory requirements can be met.',
  },
]

export const focusRationale =
  'Time-sensitive, relatively high-value goods can bear a higher price per kilogram than bulk freight, and they gain most from reliable, faster delivery. They also tend to be compact, which suits pod-sized loads. Bulk commodities remain better served by rail and sea.'

export const marketSizingSteps = [
  {
    id: 'corridor',
    label: 'Relevant corridor freight',
    question: 'How much freight already moves between the two hub regions, by mode?',
    method: 'Public trade and transport statistics, port and airport data, and route-specific shipment data shared by prospective customers.',
  },
  {
    id: 'suitable',
    label: 'Physically suitable goods',
    question: 'Which of those goods fit pod dimensions, weight and handling limits?',
    method: 'Filter by shipment size, weight, packaging and special handling requirements.',
  },
  {
    id: 'switch',
    label: 'Willingness to switch',
    question: 'Which shippers would change mode for the time and reliability AXION could offer, at the proposed price?',
    method: 'Structured interviews with logistics decision-makers and route-specific shipment analysis.',
  },
  {
    id: 'obtainable',
    label: 'Obtainable customer contracts',
    question: 'What volume could realistically be contracted, given competition and sales capacity?',
    method: 'Conditional capacity commitments, then contracts following technical and commercial validation.',
  },
]

export const marketSizingNotice =
  'No market size has been calculated yet. No interviews, surveys or commitments have taken place. This framework defines the research the feasibility programme would carry out.'

export const salesSteps = [
  { label: 'Direct business-to-business outreach', body: 'Identify logistics providers and shippers with flows on candidate corridors.' },
  { label: 'Interviews with logistics decision-makers', body: 'Understand time, reliability, handling and price requirements.' },
  { label: 'Route-specific shipment analysis', body: 'Analyse real shipment patterns to estimate time savings and suitable volume.' },
  { label: 'Commercial proposals', body: 'Offer reserved-capacity terms, integration options and service levels.' },
  { label: 'Conditional capacity commitments', body: 'Non-binding or conditional commitments that strengthen the investment case.' },
  { label: 'Contracts after validation', body: 'Binding contracts only after technical and commercial validation.' },
]

export type CompetitorRow = {
  mode: string
  speed: string
  cost: string
  capacity: string
  flexibility: string
  maturity: string
  takeaway: string
}

export const competition: CompetitorRow[] = [
  {
    mode: 'Air freight',
    speed: 'Fastest over long distances',
    cost: 'High per kg',
    capacity: 'Limited; varies with flights',
    flexibility: 'Global network',
    maturity: 'Mature',
    takeaway: 'AXION would not beat air over long or intercontinental distances; it could compete on regional corridors where airport handling dominates total time.',
  },
  {
    mode: 'Sea freight',
    speed: 'Slowest',
    cost: 'Lowest per kg',
    capacity: 'Very high',
    flexibility: 'Port to port',
    maturity: 'Mature',
    takeaway: 'Sea will remain the right mode for bulk and non-urgent goods. AXION does not target this market.',
  },
  {
    mode: 'Rail freight',
    speed: 'Moderate',
    cost: 'Low per kg',
    capacity: 'High',
    flexibility: 'Fixed network, scheduled',
    maturity: 'Mature',
    takeaway: 'Rail is efficient for heavy flows; AXION would need clear time and reliability advantages for compact, urgent goods.',
  },
  {
    mode: 'Road freight',
    speed: 'Moderate; congestion-sensitive',
    cost: 'Moderate per kg',
    capacity: 'Flexible, small units',
    flexibility: 'Door to door',
    maturity: 'Mature',
    takeaway: 'Trucks remain essential for collection and final delivery — AXION relies on existing road networks at both ends.',
  },
  {
    mode: 'Other Hyperloop concepts',
    speed: 'Proposed high speed',
    cost: 'Unproven',
    capacity: 'Unproven',
    flexibility: 'Fixed corridors',
    maturity: 'Test and development stage',
    takeaway: 'Freight hyperloop concepts already exist (for example HHLA and HyperloopTT’s container concept), and several developers failed in 2023–2026. AXION’s proposed angle is an operator model built on reserved capacity and logistics-partner integration, which still has to be tested.',
  },
]

export const operationsEquipment = [
  { name: 'Tubes and supports', body: 'Sealed low-pressure tube sections on columns or in tunnels.' },
  { name: 'Guideways', body: 'Track elements that keep pods aligned and support levitation.' },
  { name: 'Terminals', body: 'Buildings where freight is received, checked, loaded and unloaded.' },
  { name: 'Pods', body: 'Sealed freight vehicles sized for standard parcel containers.' },
  { name: 'Propulsion', body: 'Electric linear motors that accelerate and brake pods.' },
  { name: 'Vacuum equipment', body: 'Pumping stations that reduce and maintain tube pressure.' },
  { name: 'Power connections', body: 'Grid connections and substations along the corridor.' },
  { name: 'Loading machinery', body: 'Automated handling equipment that moves containers in and out of pods.' },
  { name: 'Sensors', body: 'Monitoring of pressure, position, temperature, vibration and structure.' },
  { name: 'Communications', body: 'Control links between pods, the corridor and the operations centre.' },
  { name: 'Workshops', body: 'Facilities for pod maintenance and repair.' },
  { name: 'Inspection equipment', body: 'Tools and vehicles for inspecting tube, guideway and seals.' },
]

export const humanResources = {
  summary:
    'During the development programme AXION would employ about 30 people, concentrated in engineering, software and safety. Operations, terminal and maintenance teams would be recruited only after a construction decision.',
  later: [
    'Operations control and dispatch',
    'Terminal handling and customer integration',
    'Maintenance, inspection and workshops',
    'Customer service and account management',
    'Safety assurance and compliance',
  ],
}

export const sustainability = {
  summary:
    'Hyperloop systems run on electricity, so operating emissions depend on the grid or renewable supply. Construction of tubes, supports and tunnels uses large amounts of steel and concrete, and utilisation determines how those impacts are shared across freight moved.',
  requirements: [
    'Electricity source and grid emissions intensity on each corridor',
    'Embodied emissions in construction: steel, concrete, tunnelling',
    'Maintenance, component replacement and vacuum-system energy',
    'Utilisation: emissions per tonne-km fall only if the corridor is well used',
    'The emissions of the transport it replaces, including collection and delivery',
  ],
  stance:
    'AXION makes no carbon-saving claim. A lifecycle model covering these factors is a deliverable of the feasibility programme.',
}

export const risks = [
  { category: 'Technical', title: 'Technology readiness', body: 'Hyperloop systems have not operated commercially anywhere. Test results may not scale to long corridors.' },
  { category: 'Technical', title: 'Safety and approvals', body: 'No complete regulatory framework exists. Approval could take longer and cost more than planned — especially for passengers.' },
  { category: 'Commercial', title: 'Demand and pricing', body: 'Customers may not pay a premium over road and rail, or may not commit to reserved capacity.' },
  { category: 'Commercial', title: 'Utilisation', body: 'Results depend heavily on how many departure slots are sold. Low demand leaves large fixed and renewal costs uncovered.' },
  { category: 'Financial', title: 'Capital recovery', body: 'In the central Singapore–Kuala Lumpur scenario, freight revenue covers operations but not renewals or construction. Viability needs much higher prices, far lower costs, public infrastructure funding, or a combination.' },
  { category: 'Financial', title: 'Cost uncertainty', body: 'Unit costs come from published estimates for systems that have never been built. Real costs could be materially higher.' },
  { category: 'Delivery', title: 'Land and permits', body: 'Corridors need land, environmental approval and, across borders, intergovernmental agreements.' },
  { category: 'Delivery', title: 'Sector track record', body: 'Hyperloop One closed in 2023, Hardt was declared bankrupt in March 2026 and Zeleros became insolvent in April 2026. Investors will rightly compare AXION with that history.' },
  { category: 'Delivery', title: 'Cross-border politics', body: 'A government-to-government high-speed rail project on the Singapore–Kuala Lumpur axis was terminated in 2021.' },
]

export const expansion =
  'Expansion would follow geographic phases — China, Japan and Singapore; then India and Europe; then Africa and the Americas — but only after a first corridor proves technical performance, customer demand and financing. These phases are an order of ambition, not a schedule.'
