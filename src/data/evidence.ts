import { corridorExample, developmentProgramme, operatingDefaults } from './finance'
import { centralInputs } from './corridorModel'
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
import { runCorridorModel } from '../lib/corridorModel'

export type EvidenceKind = 'sourced' | 'assumption' | 'calculated' | 'ambition'

export const evidenceKinds: Record<EvidenceKind, { label: string; description: string }> = {
  sourced: { label: 'Sourced fact', description: 'Taken from a cited source, with its date. Developer announcements are labelled as reported claims.' },
  assumption: { label: 'Model assumption', description: 'An input chosen for this model. It is not a supplier quote or a validated figure.' },
  calculated: { label: 'Calculated result', description: 'Computed from model assumptions using the formulas shown.' },
  ambition: { label: 'Long-term ambition', description: 'A goal or vision. It is not a plan, forecast or commitment.' },
}

export type EvidenceItem = { kind: EvidenceKind; statement: string; topic: string; sourceId?: string; basis?: string }

const be = operatingBreakEven(operatingDefaults)
const cc = constructionCost()
const cf = developmentCashFlow()
const lead = runCorridorModel(centralInputs)
const bn = (v: number) => `$${(v / 1e9).toFixed(1)}bn`

export const evidenceItems: EvidenceItem[] = [
  // Sourced
  { kind: 'sourced', topic: 'Market', statement: 'Air cargo carries around 35% of world trade by value but under 1% by volume.', sourceId: 'iata-air-cargo' },
  { kind: 'sourced', topic: 'Regulation', statement: 'European standards bodies published a hyperloop standards inventory and roadmap in 2023; a complete framework was not yet in place.', sourceId: 'cen-cenelec-tr17912' },
  { kind: 'sourced', topic: 'Technology', statement: 'Hardt Hyperloop reported an 85 km/h run with a lane switch on a 420 m test track (September 2025).', sourceId: 'hardt-lane-switch-2025' },
  { kind: 'sourced', topic: 'Technology', statement: 'Swisspod reported 146 km/h with a full-scale capsule on its US test track (May 2026).', sourceId: 'swisspod-2026' },
  { kind: 'sourced', topic: 'Sector', statement: 'Hardt Hyperloop was declared bankrupt in March 2026; Zeleros entered insolvency in April 2026; Hyperloop One closed at the end of 2023.', sourceId: 'hardt-bankrupt-2026' },
  { kind: 'sourced', topic: 'Competition', statement: 'Freight-focused hyperloop concepts already exist, such as the container concept from HHLA and HyperloopTT.', sourceId: 'hhla-hyperport' },
  { kind: 'sourced', topic: 'Cost', statement: 'Published hyperloop estimates are about EUR 25–35m per km on pillars and about EUR 70m per km in tunnel (2023 review).', sourceId: 'mdpi-hyperloop-cost' },
  { kind: 'sourced', topic: 'Lead corridor', statement: 'The 350 km KL–Singapore high-speed rail project was terminated in 2021.', sourceId: 'edge-hsr-termination' },
  { kind: 'sourced', topic: 'Geography', statement: 'The longest undersea rail tunnels run about 23–38 km beneath the sea.', sourceId: 'wiki-seikan' },
  { kind: 'sourced', topic: 'Geography', statement: 'A rail line between Kunming and Vientiane opened in December 2021.', sourceId: 'wiki-china-laos-rail' },
  // Assumptions
  { kind: 'assumption', topic: 'Lead corridor', statement: `Singapore–Kuala Lumpur: ${centralInputs.alignmentKm} km assumed alignment, of which ${centralInputs.complexKm} km is tunnel or complex structure. Twin tubes, freight only.` },
  { kind: 'assumption', topic: 'Lead corridor', statement: `Pods of ${centralInputs.podPayloadT} t at ${centralInputs.departuresPerHourPerDirection} departures per hour each way, ${centralInputs.operatingHoursPerDay} h a day, ${centralInputs.operatingDaysPerYear} days a year, ${pct(centralInputs.podLoadFactor)} average load.` },
  { kind: 'assumption', topic: 'Lead corridor', statement: `Central price ${usdPerKg(centralInputs.pricePerKg)} and ${pct(centralInputs.utilisation)} slot utilisation. No verified price benchmark exists.` },
  { kind: 'assumption', topic: 'Lead corridor', statement: `Illustrative funding structure: ${pct(centralInputs.equityShare)} equity, ${pct(1 - centralInputs.equityShare - centralInputs.publicSupportShare)} debt at ${pct(centralInputs.interestRate, 1)}, ${pct(centralInputs.publicSupportShare)} possible public support (not committed).` },
  { kind: 'assumption', topic: 'Funding', statement: `Development ask of ${usdCompact(developmentProgramme.askUsd)} for a ${developmentProgramme.years}-year programme, committed at close and drawn in three tranches.` },
  { kind: 'assumption', topic: 'Funding', statement: `${headcount()} employees at ${usdCompact(developmentProgramme.staffing.fullyLoadedAnnualCost)} fully loaded annual cost.` },
  { kind: 'assumption', topic: 'Teaching example', statement: `Hypothetical ${corridorExample.lengthKm} km corridor at ${usdCompact(corridorExample.infrastructureCostPerKm)}/km, ${operatingDefaults.capacityTonnesPerDay.toLocaleString('en-US')} t/day, ${usdPerKg(operatingDefaults.pricePerKg)} charge.` },
  { kind: 'assumption', topic: 'Network', statement: 'Network cities are representative planning nodes, not selected terminal sites.' },
  // Calculated
  { kind: 'calculated', topic: 'Lead corridor', statement: `Central construction estimate ${bn(lead.capex.total)} (about ${usdCompact(lead.capex.perAlignmentKm)} per km of alignment, including design and contingency).`, basis: 'Sectioned scope × unit costs, + design, + contingency' },
  { kind: 'calculated', topic: 'Lead corridor', statement: `Central practical capacity ${(lead.capacity.capacityT / 1e6).toFixed(2)} Mt a year; ${(lead.capacity.tonnes / 1e6).toFixed(2)} Mt carried at ${pct(centralInputs.utilisation)} utilisation.`, basis: 'Payload × departures × hours × days × load' },
  { kind: 'calculated', topic: 'Lead corridor', statement: `Central operating surplus ${usdCompact(lead.operatingSurplus)} a year against a capital-recovery charge of ${usdCompact(lead.capitalRecoveryCharge)}: the central case does not recover construction cost.`, basis: 'Annuity at cost of capital over recovery period' },
  { kind: 'calculated', topic: 'Lead corridor', statement: `Price needed for full capital recovery in the central case: about ${usdPerKg(lead.requiredPrice.fullCapitalRecovery ?? 0)}.`, basis: '(Variable + fixed + renewals + recovery charge) ÷ kg' },
  { kind: 'calculated', topic: 'Funding', statement: `Development salaries total ${usdCompact(programmeLabourCost())} and sit inside the ${usdCompact(developmentProgramme.askUsd)} allocation.`, basis: '30 × $120k × 3 years' },
  { kind: 'calculated', topic: 'Funding', statement: `Undrawn commitment (or cash, if paid up front): ${cf.map((y) => `Year ${y.year} ${usdCompact(y.closingCash)}`).join(', ')}.`, basis: 'Commitment − annual drawdown' },
  { kind: 'calculated', topic: 'Teaching example', statement: `The 100 km illustration totals ${usdCompact(cc.total)}. Its operating break-even is about ${be.kind === 'finite' ? pct(be.utilisation, 1) : 'n/a'} utilisation.`, basis: 'Construction lines × (1 + contingency); fixed ÷ margin' },
  ...defaultScenarios().map(
    (s): EvidenceItem => ({
      kind: 'calculated',
      topic: 'Teaching example',
      statement: `100 km example at ${pct(s.utilisation)}: ${Math.round(s.annualKg / 1e6)}m kg, ${usdCompact(s.revenue)} revenue, ${usdCompact(s.operatingResult)} operating result.`,
      basis: 'Operating explorer formula',
    }),
  ),
  // Ambition
  { kind: 'ambition', topic: 'Network', statement: 'Expansion from China, Japan and Singapore to India and Europe, then Africa and the Americas.' },
  { kind: 'ambition', topic: 'Product', statement: 'A separate passenger system on selected corridors.' },
  { kind: 'ambition', topic: 'Customer value', statement: 'Useful reductions in complete delivery time and reliable capacity for time-sensitive goods.' },
  { kind: 'ambition', topic: 'Sustainability', statement: 'Potentially lower lifecycle emissions, subject to a full lifecycle model.' },
]

export const technologyStatus = [
  'As of October 2026, no hyperloop system carries commercial freight or passengers anywhere.',
  'Demonstrated so far: short test-track runs. Hardt reported 85 km/h with a lane switch on a 420 m track (September 2025), and Swisspod reported 146 km/h on its test track (May 2026).',
  'Not yet demonstrated: long tubes held at low pressure, airlock throughput at commercial frequency, high-speed operation, multi-year reliability and safety certification.',
  'Several developers have failed: Hyperloop One closed in 2023, Hardt was declared bankrupt in March 2026 and Zeleros became insolvent in April 2026.',
  'AXION owns no proprietary technology. It would license or co-develop with specialist developers and test facilities.',
]

export const plannedMarketResearch = [
  'Map freight flows between Singapore and the Kuala Lumpur region using trade statistics and partner data.',
  'Interview logistics decision-makers about time, reliability, handling and price.',
  'Analyse shipment records to estimate realistic door-to-door time savings.',
  'Test willingness to pay at different price levels, including the prices the model says are needed.',
  'Seek conditional capacity commitments before any construction decision.',
]
