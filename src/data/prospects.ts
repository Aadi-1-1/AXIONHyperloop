/**
 * Prospective organisations are outreach targets only.
 * No contact has been made; none has endorsed, invested in or agreed anything with AXION.
 */
export type Prospect = {
  id: string
  name: string
  type: string
  potentialRole: string
  /** Why the organisation's logistics activity is relevant. */
  fit: string
  /** What AXION would ask for in a first conversation. */
  request: string
  /** What AXION would aim to offer in return. */
  benefit: string
  note?: { text: string; sourceId: string }
}

export const prospectsNotice =
  'Prospects only. AXION has not contacted these organisations, and none has endorsed, invested in, or entered any agreement or conversation with AXION.'

export const prospects: Prospect[] = [
  {
    id: 'dhl',
    name: 'DHL',
    type: 'Express and logistics',
    potentialRole: 'Potential customer and integration partner',
    fit: 'Runs express and contract-logistics networks in both Singapore and Malaysia, with time-sensitive parcels and parts moving between them.',
    request: 'Anonymised Singapore–KL shipment patterns and an interview on time, reliability and price thresholds.',
    benefit: 'A route-specific analysis of where reserved Hyperloop capacity could shorten complete delivery time on its network.',
  },
  {
    id: 'amazon',
    name: 'Amazon',
    type: 'E-commerce and logistics',
    potentialRole: 'Potential customer and strategic-investment prospect',
    fit: 'Operates large parcel flows between fulfilment and sortation sites, where trunk-haul time and reliability affect delivery promises.',
    request: 'Insight into trunk-haul requirements and the price at which reserved capacity would be considered.',
    benefit: 'Early influence over terminal design and capacity terms, if the programme proceeds.',
  },
  {
    id: 'cainiao',
    name: 'Cainiao',
    type: 'E-commerce logistics',
    potentialRole: 'Potential e-commerce logistics customer or partner',
    fit: 'E-commerce logistics with significant parcel volumes in China and Southeast Asia, which is relevant to the wider Phase 1 vision.',
    request: 'A discussion of cross-border parcel flows and customs-integration needs in Southeast Asia.',
    benefit: 'Shared research on cross-border terminal processes that could apply to future corridors.',
  },
  {
    id: 'dp-world',
    name: 'DP World',
    type: 'Ports and logistics',
    potentialRole: 'Potential terminal or strategic-investment prospect',
    fit: 'Port and terminal operating experience is directly relevant to AXION terminal design, handling and operations.',
    request: 'Expert review of terminal throughput, airlock handling assumptions and terminal costs.',
    benefit: 'Access to a feasibility programme in a market adjacent to its port and logistics interests.',
    note: {
      text: 'DP World was reported as a backer of Hyperloop One, which ceased operations at the end of 2023. That history is relevant to any discussion.',
      sourceId: 'fortune-hyperloop-one',
    },
  },
  {
    id: 'hyperloop-developers',
    name: 'Specialist hyperloop developers and test facilities',
    type: 'Engineering',
    potentialRole: 'Potential technology and testing partners',
    fit: 'AXION would license or co-develop systems rather than build every component; existing test facilities may host trials.',
    request: 'Technical data, test access and licensing terms for pods, propulsion and switching.',
    benefit: 'A freight operator case and customer requirements that test their technology commercially.',
  },
  {
    id: 'infrastructure-investors',
    name: 'Infrastructure investors, lenders and governments',
    type: 'Finance and public sector',
    potentialRole: 'Possible later financing and coordination participants',
    fit: 'First-corridor construction would need institutional capital and, the model suggests, public infrastructure funding.',
    request: 'Early views on the conditions under which construction finance or public support could ever be considered.',
    benefit: 'A transparent, gated evidence base before any construction decision is asked of them.',
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
