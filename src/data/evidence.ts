import { corridorExample, developmentProgramme, operatingDefaults } from './finance'
import {
  constructionCost,
  defaultScenarios,
  developmentCashFlow,
  headcount,
  operatingBreakEven,
  pct,
  programmeLabourCost,
  usdCompact,
  usdPerKg,
} from '../lib/finance'

export type EvidenceKind = 'sourced' | 'assumption' | 'calculated' | 'ambition'

export const evidenceKinds: Record<EvidenceKind, { label: string; description: string }> = {
  sourced: { label: 'Sourced fact', description: 'Taken from a cited external source. Developer claims are labelled as reported, not verified.' },
  assumption: { label: 'Model assumption', description: 'An input chosen for this classroom model. Not a supplier estimate or validated figure.' },
  calculated: { label: 'Calculated result', description: 'Computed from model assumptions using the formulas shown.' },
  ambition: { label: 'Long-term ambition', description: 'A goal or vision. Not a plan, forecast or commitment.' },
}

export type EvidenceItem = { kind: EvidenceKind; statement: string; topic: string; sourceId?: string; basis?: string }

const be = operatingBreakEven(operatingDefaults)
const cc = constructionCost()
const cf = developmentCashFlow()

export const evidenceItems: EvidenceItem[] = [
  // Sourced
  { kind: 'sourced', topic: 'Market', statement: 'Air cargo carries around 35% of world trade by value but under 1% by volume.', sourceId: 'iata-air-cargo' },
  { kind: 'sourced', topic: 'Regulation', statement: 'European standards bodies have a joint committee working on Hyperloop standards; a complete framework does not yet exist.', sourceId: 'cen-cenelec-tr17912' },
  { kind: 'sourced', topic: 'Technology', statement: 'A ~420 m Hyperloop test facility with a lane switch opened in Veendam, the Netherlands, in 2024.', sourceId: 'techeu-ehc-opens' },
  { kind: 'sourced', topic: 'Technology', statement: 'Hardt Hyperloop reported a first low-speed, short-distance levitation and propulsion test there in 2024.', sourceId: 'ap-hardt-test' },
  { kind: 'sourced', topic: 'Technology', statement: 'Hardt reported track-switching progress in 2025; the sector remains at test-track scale.', sourceId: 'ie-hardt-scale' },
  { kind: 'sourced', topic: 'Sector', statement: 'Hyperloop One ceased operations at the end of 2023.', sourceId: 'fortune-hyperloop-one' },
  { kind: 'sourced', topic: 'Geography', statement: 'The longest existing undersea rail tunnels run about 23–38 km beneath the sea.', sourceId: 'wiki-seikan' },
  { kind: 'sourced', topic: 'Geography', statement: 'A rail line between Kunming and Vientiane opened in December 2021.', sourceId: 'wiki-china-laos-rail' },
  { kind: 'sourced', topic: 'Technology', statement: 'The modern Hyperloop concept was popularised by a 2013 white paper.', sourceId: 'wiki-hyperloop' },
  // Assumptions
  { kind: 'assumption', topic: 'Funding', statement: `Development ask of ${usdCompact(developmentProgramme.askUsd)} for a ${developmentProgramme.years}-year feasibility and demonstration programme.` },
  { kind: 'assumption', topic: 'Funding', statement: `${headcount()} employees at ${usdCompact(developmentProgramme.staffing.fullyLoadedAnnualCost)} fully loaded annual cost.` },
  { kind: 'assumption', topic: 'Funding', statement: `Annual spending of ${developmentProgramme.spendingByYear.map((v) => usdCompact(v)).join(', ')}; no commercial revenue during the programme.` },
  { kind: 'assumption', topic: 'Construction', statement: `Hypothetical ${corridorExample.lengthKm} km corridor at ${usdCompact(corridorExample.infrastructureCostPerKm)}/km infrastructure cost (unvalidated).` },
  { kind: 'assumption', topic: 'Construction', statement: `${corridorExample.terminals.count} terminals at ${usdCompact(corridorExample.terminals.unitCost)} each; ${usdCompact(corridorExample.podsWorkshopsLoading)} pods, workshops and loading; ${usdCompact(corridorExample.landDesignApprovals)} land, design and approvals; ${pct(corridorExample.contingencyRate)} contingency.` },
  { kind: 'assumption', topic: 'Operations', statement: `Capacity ${operatingDefaults.capacityTonnesPerDay.toLocaleString('en-US')} tonnes/day over ${operatingDefaults.operatingDaysPerYear} operating days.` },
  { kind: 'assumption', topic: 'Operations', statement: `Average charge ${usdPerKg(operatingDefaults.pricePerKg)}, variable cost ${usdPerKg(operatingDefaults.variableCostPerKg)}, fixed operating costs ${usdCompact(operatingDefaults.annualFixedCosts)}/year.` },
  { kind: 'assumption', topic: 'Network', statement: 'Network cities are representative planning nodes, not selected terminal sites.' },
  { kind: 'assumption', topic: 'Company', statement: 'Proposed headquarters in Singapore; privately held company seeking equity investment.' },
  // Calculated
  { kind: 'calculated', topic: 'Funding', statement: `Development salaries total ${usdCompact(programmeLabourCost())} and are included within the ${usdCompact(developmentProgramme.askUsd)} allocation, not added to it.`, basis: '30 × $120k × 3 years' },
  { kind: 'calculated', topic: 'Funding', statement: `Closing cash: ${cf.map((y) => `Year ${y.year} ${usdCompact(y.closingCash)}`).join(', ')}.`, basis: 'Opening cash − annual spending' },
  { kind: 'calculated', topic: 'Construction', statement: `Illustrative corridor cost ${usdCompact(cc.subtotal)} before contingency; ${usdCompact(cc.total)} including contingency.`, basis: 'Sum of construction lines × (1 + contingency)' },
  ...defaultScenarios().map(
    (s): EvidenceItem => ({
      kind: 'calculated',
      topic: 'Operations',
      statement: `At ${pct(s.utilisation)} utilisation: ${Math.round(s.annualKg / 1e6)}m kg, ${usdCompact(s.revenue)} revenue, ${usdCompact(s.operatingResult)} operating result.`,
      basis: 'Operating explorer formula, default inputs',
    }),
  ),
  {
    kind: 'calculated',
    topic: 'Operations',
    statement:
      be.kind === 'finite'
        ? `Operating break-even ≈ ${(be.annualKg / 1e6).toFixed(1)}m kg/year, ≈ ${pct(be.utilisation, 1)} utilisation.`
        : 'No finite operating break-even at default inputs.',
    basis: 'Fixed costs ÷ (price − variable cost)',
  },
  // Ambition
  { kind: 'ambition', topic: 'Network', statement: 'Expansion from China, Japan and Singapore to India and Europe, then Africa and the Americas.' },
  { kind: 'ambition', topic: 'Product', statement: 'A separate passenger system on selected corridors.' },
  { kind: 'ambition', topic: 'Customer value', statement: 'Useful reductions in complete delivery time and reliable capacity for time-sensitive goods.' },
  { kind: 'ambition', topic: 'Sustainability', statement: 'Potentially lower lifecycle emissions, subject to a full lifecycle model.' },
]

export const technologyStatus = [
  'No Hyperloop system carries commercial freight or passengers anywhere.',
  'Publicly reported developer tests are short-distance and low-speed relative to commercial ambitions.',
  'Track switching, long-tube vacuum operation, terminal airlocks at commercial throughput and safety certification remain open questions.',
  'AXION has no proprietary technology; it would work with specialist developers.',
]

export const plannedMarketResearch = [
  'Map freight flows on each candidate corridor using public statistics and partner data.',
  'Interview logistics decision-makers about time, reliability, handling and price.',
  'Analyse shipment records to estimate realistic door-to-door time savings.',
  'Test willingness to switch at different price levels.',
  'Seek conditional capacity commitments before any construction decision.',
]
