import {
  corridorExample,
  developmentProgramme,
  operatingDefaults,
  scenarioUtilisations,
  type AllocationLine,
  type OperatingInputs,
} from '../data/finance'

export function sum(values: readonly number[]): number {
  return values.reduce((a, b) => a + b, 0)
}

// ---------- Development programme ----------

export function allocationTotal(): number {
  return sum(developmentProgramme.allocation.map((l) => l.amount))
}

export function headcount(): number {
  return sum(developmentProgramme.staffing.groups.map((g) => g.count))
}

/** Salary cost over the programme: headcount × fully loaded cost × years. */
export function programmeLabourCost(): number {
  return headcount() * developmentProgramme.staffing.fullyLoadedAnnualCost * developmentProgramme.years
}

/** Labour cost already embedded in allocation lines. Should equal programmeLabourCost(). */
export function labourIncludedInAllocation(): number {
  return sum(developmentProgramme.allocation.map((l: AllocationLine) => l.labourIncluded ?? 0))
}

export type CashFlowYear = { year: number; openingCash: number; spending: number; revenue: number; closingCash: number }

export function developmentCashFlow(): CashFlowYear[] {
  let cash = developmentProgramme.askUsd
  return developmentProgramme.spendingByYear.map((spending, i) => {
    const openingCash = cash
    cash = openingCash - spending
    return { year: i + 1, openingCash, spending, revenue: 0, closingCash: cash }
  })
}

// ---------- Hypothetical corridor construction ----------

export type ConstructionLine = { id: string; label: string; basis: string; amount: number }

export function constructionCost() {
  const c = corridorExample
  const lines: ConstructionLine[] = [
    {
      id: 'infrastructure',
      label: 'Tube infrastructure',
      basis: `${c.lengthKm} km × ${usdCompact(c.infrastructureCostPerKm)}/km`,
      amount: c.lengthKm * c.infrastructureCostPerKm,
    },
    {
      id: 'terminals',
      label: 'Terminals',
      basis: `${c.terminals.count} × ${usdCompact(c.terminals.unitCost)}`,
      amount: c.terminals.count * c.terminals.unitCost,
    },
    {
      id: 'pods',
      label: 'Pods, workshops and loading systems',
      basis: 'Lump-sum assumption',
      amount: c.podsWorkshopsLoading,
    },
    {
      id: 'land',
      label: 'Land, design and approvals',
      basis: 'Lump-sum assumption',
      amount: c.landDesignApprovals,
    },
  ]
  const subtotal = sum(lines.map((l) => l.amount))
  const contingency = subtotal * c.contingencyRate
  return { lines, subtotal, contingency, contingencyRate: c.contingencyRate, total: subtotal + contingency }
}

// ---------- Operating scenario explorer ----------

export type OperatingResult = {
  annualKg: number
  revenue: number
  variableCosts: number
  fixedCosts: number
  contribution: number
  operatingResult: number
}

export function annualCapacityKg(inputs: OperatingInputs): number {
  return inputs.capacityTonnesPerDay * 1_000 * inputs.operatingDaysPerYear
}

export function operatingResult(inputs: OperatingInputs): OperatingResult {
  const annualKg = annualCapacityKg(inputs) * inputs.utilisation
  const revenue = annualKg * inputs.pricePerKg
  const variableCosts = annualKg * inputs.variableCostPerKg
  const contribution = revenue - variableCosts
  return {
    annualKg,
    revenue,
    variableCosts,
    fixedCosts: inputs.annualFixedCosts,
    contribution,
    operatingResult: contribution - inputs.annualFixedCosts,
  }
}

export type BreakEven =
  | { kind: 'finite'; annualKg: number; utilisation: number; withinCapacity: boolean }
  | { kind: 'none'; reason: 'non-positive-margin' }

/** Operating break-even volume. Undefined (no finite value) when price does not exceed variable cost. */
export function operatingBreakEven(inputs: OperatingInputs): BreakEven {
  const margin = inputs.pricePerKg - inputs.variableCostPerKg
  if (!(margin > 1e-12)) return { kind: 'none', reason: 'non-positive-margin' }
  const annualKg = inputs.annualFixedCosts / margin
  const capacity = annualCapacityKg(inputs)
  const utilisation = capacity > 0 ? annualKg / capacity : Infinity
  return { kind: 'finite', annualKg, utilisation, withinCapacity: utilisation <= 1 }
}

export function defaultScenarios() {
  return scenarioUtilisations.map((u) => ({
    utilisation: u,
    ...operatingResult({ ...operatingDefaults, utilisation: u }),
  }))
}

/** Clamp to bounds and snap to step, guarding against NaN from form input. */
export function clampToBounds(value: number, b: { min: number; max: number; step: number }): number {
  if (!Number.isFinite(value)) return b.min
  const clamped = Math.min(b.max, Math.max(b.min, value))
  const snapped = Math.round((clamped - b.min) / b.step) * b.step + b.min
  return Number(snapped.toFixed(6))
}

// ---------- Formatting ----------

export function usdCompact(value: number, digits?: number): string {
  const sign = value < 0 ? '−' : ''
  const v = Math.abs(value)
  if (v >= 1e9) return `${sign}$${trim(v / 1e9, digits ?? 2)}bn`
  if (v >= 1e6) return `${sign}$${trim(v / 1e6, digits ?? 1)}m`
  if (v >= 1e3) return `${sign}$${trim(v / 1e3, digits ?? 0)}k`
  return `${sign}$${trim(v, digits ?? 2)}`
}

export function kgCompact(value: number): string {
  const v = Math.abs(value)
  if (v >= 1e9) return `${trim(value / 1e9, 2)}bn kg`
  if (v >= 1e6) return `${trim(value / 1e6, 1)}m kg`
  return `${Math.round(value).toLocaleString('en-US')} kg`
}

export function pct(value: number, digits = 0): string {
  return `${(value * 100).toFixed(digits)}%`
}

export function usdPerKg(value: number): string {
  return `$${value.toFixed(2)}/kg`
}

function trim(n: number, digits: number): string {
  return Number(n.toFixed(digits)).toLocaleString('en-US', { maximumFractionDigits: digits })
}
