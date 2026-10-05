/**
 * Prospective organisations are outreach targets only.
 * No contact has been made; none has endorsed, invested in or agreed anything with AXION.
 */
export type Prospect = {
  id: string
  name: string
  type: string
  potentialRole: string
  rationale: string
  note?: { text: string; sourceId: string }
}

export const prospectsNotice =
  'Outreach targets only. AXION has not contacted these organisations, and none has endorsed, invested in, or entered any agreement or conversation with AXION.'

export const prospects: Prospect[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    type: 'E-commerce and logistics',
    potentialRole: 'Potential customer and strategic-investment prospect',
    rationale: 'Operates large parcel flows between fulfilment and sortation centres where trunk-haul time matters.',
  },
  {
    id: 'cainiao',
    name: 'Cainiao',
    type: 'E-commerce logistics',
    potentialRole: 'Potential e-commerce logistics customer or partner',
    rationale: 'E-commerce logistics network with significant parcel volumes in Phase 1 markets.',
  },
  {
    id: 'dhl',
    name: 'DHL',
    type: 'Express and logistics',
    potentialRole: 'Potential customer and integration partner',
    rationale: 'Express and contract-logistics operations could integrate AXION terminals into existing collection and delivery networks.',
  },
  {
    id: 'dp-world',
    name: 'DP World',
    type: 'Ports and logistics',
    potentialRole: 'Potential terminal or strategic-investment prospect',
    rationale: 'Port and terminal operations experience relevant to AXION terminal design and operation.',
    note: {
      text: 'Reported as a backer of Hyperloop One, which ceased operations at the end of 2023 — relevant context for any discussion.',
      sourceId: 'fortune-hyperloop-one',
    },
  },
  {
    id: 'hyperloop-developers',
    name: 'Specialist Hyperloop and infrastructure developers',
    type: 'Engineering',
    potentialRole: 'Potential engineering partners',
    rationale: 'AXION would license or co-develop technology with specialists rather than build every system alone.',
  },
  {
    id: 'infrastructure-investors',
    name: 'Infrastructure investors and governments',
    type: 'Finance and public sector',
    potentialRole: 'Possible later financing and coordination participants',
    rationale: 'Construction-scale financing, land and cross-border coordination would require public and institutional participation.',
  },
]

export const investorCategories = [
  { title: 'Strategic logistics investors', body: 'Logistics companies that could also become customers, bringing demand insight.' },
  { title: 'Infrastructure and climate-technology funds', body: 'Investors experienced with long-horizon, milestone-based infrastructure risk.' },
  { title: 'Engineering partners', body: 'Organisations contributing technology, testing capability or in-kind support.' },
  { title: 'Public innovation programmes', body: 'Grant or co-funding programmes for transport innovation, where eligible.' },
]

export const investorPath = [
  { label: 'Review', body: 'Read this site, the evidence register and the financial model.' },
  { label: 'Strategic-fit discussion', body: 'Discuss objectives, corridor interests and investment horizon.' },
  { label: 'Due diligence', body: 'Technical, commercial, legal and financial review.' },
  { label: 'Funding terms', body: 'Negotiate terms for the development round.' },
  { label: 'Milestone programme', body: 'Funds released against feasibility and demonstration gates.' },
  { label: 'Next-stage review', body: 'Decide jointly whether to proceed towards construction financing.' },
]

export type PartnerPathId = 'freight' | 'engineering' | 'investment'

export const partnerPaths: { id: PartnerPathId; label: string; audience: string; steps: string[] }[] = [
  {
    id: 'freight',
    label: 'Freight / customer partnership',
    audience: 'Logistics providers and shippers',
    steps: [
      'Share anonymised shipment patterns on a candidate corridor',
      'Join structured interviews on time, reliability and price',
      'Review a route-specific service proposal',
      'Consider a conditional capacity commitment',
    ],
  },
  {
    id: 'engineering',
    label: 'Engineering / infrastructure partnership',
    audience: 'Technology developers, engineering and construction firms',
    steps: [
      'Review the technical concept and test-programme scope',
      'Identify components for licensing or co-development',
      'Define test-facility and demonstration roles',
      'Agree technical responsibilities for each feasibility gate',
    ],
  },
  {
    id: 'investment',
    label: 'Investment discussion',
    audience: 'Equity investors and funds',
    steps: [
      'Review the $50m development programme and model assumptions',
      'Strategic-fit discussion',
      'Due diligence and funding terms',
      'Milestone-based programme and next-stage review',
    ],
  },
]
