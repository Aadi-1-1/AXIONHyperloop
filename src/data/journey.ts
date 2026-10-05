/** The shipment journey shown on the homepage and in the presentation. */
export type JourneyStage = {
  id: string
  index: number
  name: string
  operator: 'Partner' | 'AXION'
  where: 'outside' | 'terminal' | 'tube'
  summary: string
  detail: string
  checks: string[]
  customs?: string
  /** Relative visual weight on the illustrative time bar (not a measured duration). */
  timeWeight: number
}

export const journeyStages: JourneyStage[] = [
  {
    id: 'origin-hub',
    index: 1,
    name: 'Customer logistics hub',
    operator: 'Partner',
    where: 'outside',
    summary: 'The customer’s logistics provider collects and consolidates shipments.',
    detail: 'Existing logistics companies handle collection and sorting. Shipments are booked against reserved AXION capacity and travel by road to the AXION terminal.',
    checks: ['Booking against reserved capacity', 'Shipment data shared with AXION'],
    timeWeight: 3,
  },
  {
    id: 'origin-terminal',
    index: 2,
    name: 'AXION terminal',
    operator: 'AXION',
    where: 'terminal',
    summary: 'Shipments arrive and are consolidated into pod containers.',
    detail: 'The terminal receives road deliveries, scans each consignment and consolidates parcels into standard pod containers. Integration with customer systems avoids re-keying data.',
    checks: ['Arrival scan and tracking start', 'Container consolidation'],
    timeWeight: 2,
  },
  {
    id: 'loading',
    index: 3,
    name: 'Loading and checks',
    operator: 'AXION',
    where: 'terminal',
    summary: 'Security screening, weight checks and pressure transition.',
    detail: 'Containers are screened, weighed and loaded. The sealed pod enters an airlock, which is pumped down to tube pressure before departure.',
    checks: ['Security screening', 'Weight and balance', 'Pod systems check', 'Airlock pressure transition'],
    customs: 'For cross-border corridors, electronic pre-clearance would be submitted before departure, subject to agreement with customs authorities.',
    timeWeight: 2,
  },
  {
    id: 'tube',
    index: 4,
    name: 'Tube transport',
    operator: 'AXION',
    where: 'tube',
    summary: 'The pod travels through the low-pressure tube.',
    detail: 'The pod is accelerated by linear motors and travels terminal to terminal through the low-pressure tube. Position and arrival estimates are shared with the customer in real time.',
    checks: ['Continuous monitoring', 'Live arrival estimate'],
    timeWeight: 1,
  },
  {
    id: 'destination-terminal',
    index: 5,
    name: 'Receiving terminal',
    operator: 'AXION',
    where: 'terminal',
    summary: 'The pod is repressurised, unloaded and sorted.',
    detail: 'The pod passes through the arrival airlock. Containers are unloaded and shipments are released to the delivery partner.',
    checks: ['Arrival airlock', 'Unloading and scan', 'Release to delivery partner'],
    customs: 'Cross-border shipments may be selected for customs inspection at the receiving terminal before release.',
    timeWeight: 2,
  },
  {
    id: 'delivery',
    index: 6,
    name: 'Existing delivery network',
    operator: 'Partner',
    where: 'outside',
    summary: 'The customer’s logistics provider completes final delivery.',
    detail: 'Existing delivery networks take shipments to their final destination. AXION does not run last-mile delivery.',
    checks: ['Hand-over scan', 'Proof of delivery via partner'],
    timeWeight: 3,
  },
]

export const journeyTimeNote =
  'Tube travel can be a small part of complete shipment time. Collection, terminal handling, checks, customs and final delivery often take longer — so AXION’s value depends on fast terminals and tight integration, not tube speed alone. The bar is illustrative, not a measured duration.'
