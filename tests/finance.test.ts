import { describe, expect, it } from 'vitest'
import { developmentProgramme, operatingBounds, operatingDefaults } from '../src/data/finance'
import {
  allocationTotal,
  clampToBounds,
  constructionCost,
  defaultScenarios,
  developmentCashFlow,
  headcount,
  labourIncludedInAllocation,
  operatingBreakEven,
  operatingResult,
  programmeLabourCost,
  usdCompact,
} from '../src/lib/finance'

describe('development programme', () => {
  it('allocation sums to the $50m ask', () => {
    expect(allocationTotal()).toBe(50_000_000)
    expect(allocationTotal()).toBe(developmentProgramme.askUsd)
  })

  it('has 30 employees costing $10.8m over three years', () => {
    expect(headcount()).toBe(30)
    expect(programmeLabourCost()).toBe(10_800_000)
  })

  it('salary cost is fully included in the allocation and never added again', () => {
    expect(labourIncludedInAllocation()).toBeCloseTo(programmeLabourCost(), 6)
    // The ask is the allocation total — labour is not an extra line on top.
    expect(allocationTotal() + 0).toBe(developmentProgramme.askUsd)
    for (const line of developmentProgramme.allocation) {
      if ('labourIncluded' in line) expect(line.labourIncluded).toBeLessThanOrEqual(line.amount)
    }
  })

  it('cash flow closes at $38m, $20m and $0m with no revenue', () => {
    const cf = developmentCashFlow()
    expect(cf.map((y) => y.closingCash)).toEqual([38_000_000, 20_000_000, 0])
    expect(cf.every((y) => y.revenue === 0)).toBe(true)
  })
})

describe('hypothetical 100 km corridor construction', () => {
  it('totals $2.4bn subtotal, $600m contingency and $3bn', () => {
    const c = constructionCost()
    expect(c.lines.find((l) => l.id === 'infrastructure')?.amount).toBe(2_000_000_000)
    expect(c.lines.find((l) => l.id === 'terminals')?.amount).toBe(150_000_000)
    expect(c.subtotal).toBe(2_400_000_000)
    expect(c.contingency).toBe(600_000_000)
    expect(c.total).toBe(3_000_000_000)
  })
})

describe('operating scenarios', () => {
  it('matches the three default scenarios', () => {
    const [low, mid, high] = defaultScenarios()
    expect(low.annualKg).toBeCloseTo(210e6)
    expect(low.revenue).toBeCloseTo(42e6)
    expect(low.operatingResult).toBeCloseTo(-9.8e6)
    expect(mid.annualKg).toBeCloseTo(420e6)
    expect(mid.revenue).toBeCloseTo(84e6)
    expect(mid.operatingResult).toBeCloseTo(15.4e6)
    expect(high.annualKg).toBeCloseTo(595e6)
    expect(high.revenue).toBeCloseTo(119e6)
    expect(high.operatingResult).toBeCloseTo(36.4e6)
  })

  it('breaks even at ~291.7m kg and ~41.7% utilisation', () => {
    const be = operatingBreakEven(operatingDefaults)
    expect(be.kind).toBe('finite')
    if (be.kind === 'finite') {
      expect(be.annualKg / 1e6).toBeCloseTo(291.67, 1)
      expect(be.utilisation * 100).toBeCloseTo(41.67, 1)
      expect(be.withinCapacity).toBe(true)
      const atBreakEven = operatingResult({ ...operatingDefaults, utilisation: be.utilisation })
      expect(Math.abs(atBreakEven.operatingResult)).toBeLessThan(1)
    }
  })

  it('has no finite break-even for zero or negative margins', () => {
    expect(operatingBreakEven({ ...operatingDefaults, pricePerKg: 0.08, variableCostPerKg: 0.08 }).kind).toBe('none')
    expect(operatingBreakEven({ ...operatingDefaults, pricePerKg: 0.05, variableCostPerKg: 0.2 }).kind).toBe('none')
  })

  it('flags break-even beyond capacity', () => {
    const be = operatingBreakEven({ ...operatingDefaults, pricePerKg: 0.1, variableCostPerKg: 0.09 })
    expect(be.kind === 'finite' && !be.withinCapacity).toBe(true)
  })

  it('zero utilisation loses the full fixed cost', () => {
    expect(operatingResult({ ...operatingDefaults, utilisation: 0 }).operatingResult).toBe(-35e6)
  })

  it('clamps and snaps control input', () => {
    expect(clampToBounds(2, operatingBounds.utilisation)).toBe(1)
    expect(clampToBounds(-1, operatingBounds.pricePerKg)).toBe(0.05)
    expect(clampToBounds(Number.NaN, operatingBounds.variableCostPerKg)).toBe(0)
    expect(clampToBounds(0.123, operatingBounds.pricePerKg)).toBe(0.12)
  })
})

describe('formatting', () => {
  it('formats compact USD', () => {
    expect(usdCompact(3e9)).toBe('$3bn')
    expect(usdCompact(-9.8e6)).toBe('−$9.8m')
    expect(usdCompact(50e6)).toBe('$50m')
  })
})
