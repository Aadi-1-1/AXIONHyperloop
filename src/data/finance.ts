/**
 * Illustrative financial model inputs. All amounts are USD.
 *
 * These are classroom model assumptions, not verified supplier estimates.
 * Every page, chart and presentation slide reads from this file, and every
 * derived figure is computed in `src/lib/finance.ts`. Edit values here only.
 */

export type AllocationLine = {
  id: string
  label: string
  amount: number
  /** Portion of this line that is development-team salary cost (already included, never added again). */
  labourIncluded?: number
  detail: string
}

export const developmentProgramme = {
  askUsd: 50_000_000,
  years: 3,
  name: 'Three-year feasibility and demonstration programme',
  allocation: [
    {
      id: 'feasibility',
      label: 'Route, customer and environmental feasibility',
      amount: 4_000_000,
      detail: 'Candidate corridor studies, shipment-data analysis with prospective customers, environmental baselines.',
    },
    {
      id: 'engineering',
      label: 'Engineering design, safety and regulatory work',
      amount: 6_000_000,
      labourIncluded: 4_000_000,
      detail: 'System architecture, safety case foundations, engagement with standards bodies and regulators.',
    },
    {
      id: 'test-facility',
      label: 'Test facility and civil works',
      amount: 14_000_000,
      detail: 'A short demonstration tube, supports, foundations and site works.',
    },
    {
      id: 'prototype',
      label: 'Prototype pods, propulsion and vacuum equipment',
      amount: 8_000_000,
      detail: 'Freight demonstrator pod, propulsion and guidance segment, vacuum pumping equipment.',
    },
    {
      id: 'software',
      label: 'Software, monitoring and terminal demonstration',
      amount: 3_000_000,
      labourIncluded: 2_000_000,
      detail: 'Control and monitoring software, cybersecurity, a terminal loading and pressure-transition mock-up.',
    },
    {
      id: 'employees',
      label: 'Employees and administration',
      amount: 5_000_000,
      labourIncluded: 4_800_000,
      detail: 'Remaining development-team salary cost plus administration.',
    },
    {
      id: 'specialist',
      label: 'Specialist testing and external support',
      amount: 2_000_000,
      detail: 'Independent testing, certification advice and specialist consultants.',
    },
    {
      id: 'contingency',
      label: 'Contingency',
      amount: 8_000_000,
      detail: 'Reserve for technical, schedule and price uncertainty.',
    },
  ] satisfies AllocationLine[],
  staffing: {
    fullyLoadedAnnualCost: 120_000,
    groups: [
      { label: 'Leadership, finance and administration', count: 4 },
      { label: 'Engineering and systems integration', count: 12 },
      { label: 'Software, controls and cybersecurity', count: 5 },
      { label: 'Safety, regulation and environment', count: 4 },
      { label: 'Commercial development and partnerships', count: 3 },
      { label: 'Procurement and project coordination', count: 2 },
    ],
  },
  /** Annual programme spending. No commercial revenue is assumed during the programme. */
  spendingByYear: [12_000_000, 18_000_000, 20_000_000],
} as const

/** Hypothetical freight corridor used only for the construction illustration and operating explorer. */
export const corridorExample = {
  lengthKm: 100,
  infrastructureCostPerKm: 20_000_000,
  terminals: { count: 2, unitCost: 75_000_000 },
  podsWorkshopsLoading: 100_000_000,
  landDesignApprovals: 150_000_000,
  contingencyRate: 0.25,
} as const

export type OperatingInputs = {
  capacityTonnesPerDay: number
  operatingDaysPerYear: number
  /** 0–1 */
  utilisation: number
  pricePerKg: number
  variableCostPerKg: number
  annualFixedCosts: number
}

export const operatingDefaults: OperatingInputs = {
  capacityTonnesPerDay: 2_000,
  operatingDaysPerYear: 350,
  utilisation: 0.6,
  pricePerKg: 0.2,
  variableCostPerKg: 0.08,
  annualFixedCosts: 35_000_000,
}

export const scenarioUtilisations = [0.3, 0.6, 0.85] as const

/** Bounds for the interactive controls. Variable cost may exceed price so negative margins can be explored. */
export const operatingBounds = {
  utilisation: { min: 0, max: 1, step: 0.01 },
  pricePerKg: { min: 0.05, max: 0.6, step: 0.01 },
  variableCostPerKg: { min: 0, max: 0.4, step: 0.01 },
} as const

export const operatingResultLabel = 'Before depreciation, financing, tax and major renewals'
