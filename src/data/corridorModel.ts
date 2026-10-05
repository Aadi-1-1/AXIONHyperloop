/**
 * Singapore — Kuala Lumpur freight scenario model.
 * "Proposed lead study corridor: feasibility unverified."
 *
 * Every input below is an illustrative assumption for a classroom model, not an engineering or supplier
 * estimate. Where a public benchmark informed an input, `benchmark` names the source id in src/data/sources.ts.
 * All amounts are USD (2026 prices, no inflation).
 */

export type CorridorInputs = {
  // ---- Route and construction scope ----
  alignmentKm: number
  /** Urban approaches and the Johor Strait crossing: tunnel or complex structure. */
  complexKm: number
  /** Twin-tube guideway (one tube per direction) on columns, incl. propulsion and vacuum equipment, per km. */
  elevatedCostPerKm: number
  complexCostPerKm: number
  /** Share of guideway cost that is systems (propulsion, vacuum, controls) rather than civil structure. */
  guidewaySystemsShare: number
  terminalCount: number
  terminalCost: number
  depotCost: number
  powerCostPerKm: number
  landCostPerKmElevated: number
  landCostPerKmComplex: number
  /** Applied to all construction lines except the pod fleet (sensitivity lever). */
  constructionMultiplier: number
  designShare: number
  contingencyRate: number
  // ---- Fleet and capacity ----
  podCost: number
  podPayloadT: number
  podSpareShare: number
  averageSpeedKmh: number
  terminalTurnaroundMin: number
  departuresPerHourPerDirection: number
  operatingHoursPerDay: number
  operatingDaysPerYear: number
  /** Average share of payload filled on a dispatched pod. */
  podLoadFactor: number
  /** Share of available departure slots used. */
  utilisation: number
  // ---- Revenue and operating costs ----
  pricePerKg: number
  handlingCostPerKg: number
  energyKwhPerPodKm: number
  electricityPricePerKwh: number
  staff: number
  staffCostEach: number
  vacuumBaseEnergyPerYear: number
  insuranceAdminPerYear: number
  /** Annual maintenance as share of guideway and power capex. */
  infrastructureMaintenanceRate: number
  // ---- Renewals and depreciation ----
  systemsRenewalRate: number
  podLifeYears: number
  civilLifeYears: number
  systemsLifeYears: number
  // ---- Illustrative funding structure ----
  equityShare: number
  /** Possible public support (grant or concessional). Hypothetical, never committed. */
  publicSupportShare: number
  interestRate: number
  debtTenorYears: number
  /** Cost of capital used for the infrastructure-recovery test. */
  costOfCapital: number
  recoveryYears: number
  targetDscr: number
}

export type ScenarioId = 'conservative' | 'central' | 'optimistic'

export const corridorScenarioLabel = 'Proposed lead study corridor: feasibility unverified'

export const centralInputs: CorridorInputs = {
  alignmentKm: 350,
  complexKm: 40,
  elevatedCostPerKm: 35_000_000,
  complexCostPerKm: 80_000_000,
  guidewaySystemsShare: 0.3,
  terminalCount: 2,
  terminalCost: 200_000_000,
  depotCost: 120_000_000,
  powerCostPerKm: 1_500_000,
  landCostPerKmElevated: 1_500_000,
  landCostPerKmComplex: 8_000_000,
  constructionMultiplier: 1,
  designShare: 0.12,
  contingencyRate: 0.3,
  podCost: 3_000_000,
  podPayloadT: 12,
  podSpareShare: 0.15,
  averageSpeedKmh: 500,
  terminalTurnaroundMin: 40,
  departuresPerHourPerDirection: 12,
  operatingHoursPerDay: 20,
  operatingDaysPerYear: 360,
  podLoadFactor: 0.8,
  utilisation: 0.5,
  pricePerKg: 0.45,
  handlingCostPerKg: 0.05,
  energyKwhPerPodKm: 10,
  electricityPricePerKwh: 0.2,
  staff: 350,
  staffCostEach: 80_000,
  vacuumBaseEnergyPerYear: 12_000_000,
  insuranceAdminPerYear: 15_000_000,
  infrastructureMaintenanceRate: 0.008,
  systemsRenewalRate: 0.015,
  podLifeYears: 15,
  civilLifeYears: 50,
  systemsLifeYears: 25,
  equityShare: 0.3,
  publicSupportShare: 0.2,
  interestRate: 0.065,
  debtTenorYears: 25,
  costOfCapital: 0.08,
  recoveryYears: 40,
  targetDscr: 1.3,
}

export const scenarios: Record<ScenarioId, { label: string; summary: string; inputs: CorridorInputs }> = {
  conservative: {
    label: 'Conservative',
    summary: 'Higher construction costs and contingency, lower demand and price, dearer debt.',
    inputs: {
      ...centralInputs,
      elevatedCostPerKm: 45_000_000,
      complexCostPerKm: 100_000_000,
      contingencyRate: 0.4,
      podPayloadT: 10,
      departuresPerHourPerDirection: 10,
      utilisation: 0.35,
      pricePerKg: 0.35,
      energyKwhPerPodKm: 14,
      interestRate: 0.08,
    },
  },
  central: {
    label: 'Central',
    summary: 'Mid-range benchmark costs, moderate demand and a price above road freight.',
    inputs: centralInputs,
  },
  optimistic: {
    label: 'Optimistic',
    summary: 'Lower costs and contingency, larger pods, more departures, high demand and a premium price.',
    inputs: {
      ...centralInputs,
      elevatedCostPerKm: 25_000_000,
      complexCostPerKm: 65_000_000,
      contingencyRate: 0.2,
      podPayloadT: 15,
      departuresPerHourPerDirection: 15,
      utilisation: 0.7,
      pricePerKg: 0.6,
      energyKwhPerPodKm: 7,
      interestRate: 0.05,
    },
  },
}

/** Which inputs each assumption rests on: benchmark sources or plain assumptions. */
export const inputNotes: { key: string; label: string; basis: string; benchmark?: string }[] = [
  { key: 'alignmentKm', label: 'Assumed alignment', basis: 'Same scale as the previously proposed KL–Singapore high-speed rail route (350 km). Not surveyed.', benchmark: 'edge-hsr-termination' },
  { key: 'complexKm', label: 'Complex sections', basis: 'Urban approaches in both cities plus the Johor Strait crossing. Illustrative.', benchmark: 'rts-link' },
  { key: 'elevatedCostPerKm', label: 'Elevated twin-tube cost', basis: 'Published estimates cluster around EUR 25–35m per km on columns. The source does not state whether that is per tube or per pair, so it is treated here as a twin-tube cost. Illustrative.', benchmark: 'mdpi-hyperloop-cost' },
  { key: 'complexCostPerKm', label: 'Tunnel / complex cost', basis: 'Published estimates of about EUR 70m per km in tunnel. Illustrative.', benchmark: 'mdpi-hyperloop-cost' },
  { key: 'terminalCost', label: 'Terminals', basis: 'Sized by throughput and automation, not by line length. Two terminals at $200m each. Assumption.' },
  { key: 'podPayloadT', label: 'Pod payload', basis: 'A parcel-container pod of about 12 tonnes. No freight pod has operated commercially. Assumption.' },
  { key: 'departuresPerHourPerDirection', label: 'Dispatch rate', basis: 'One departure every 5 minutes per direction, limited by airlock cycle time. Unproven. Assumption.' },
  { key: 'averageSpeedKmh', label: 'Average speed', basis: 'Used only to size the fleet. Demonstrated test speeds are far lower (146 km/h reported in 2026). Assumption.', benchmark: 'swisspod-2026' },
  { key: 'electricityPricePerKwh', label: 'Electricity price', basis: 'Close to Singapore’s regulated tariff (about S$0.28 per kWh in 2025). Large-user contracts may differ.', benchmark: 'sp-tariff-2025' },
  { key: 'energyKwhPerPodKm', label: 'Energy per pod-km', basis: 'No measured value exists for a freight pod at speed. Assumption.' },
  { key: 'pricePerKg', label: 'Average charge', basis: 'No verified Singapore–KL freight price benchmark. To be tested in customer interviews. Assumption.' },
  { key: 'staff', label: 'Operating staff', basis: 'Terminals, control centre, maintenance and commercial teams, about 350 people. Assumption.' },
]
