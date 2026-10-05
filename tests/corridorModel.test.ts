import { describe, expect, it } from 'vitest'
import { centralInputs, scenarios } from '../src/data/corridorModel'
import {
  annuityFactor,
  capacity,
  constructionCost,
  constructionMultiplierForRecovery,
  fleetSize,
  runCorridorModel,
  utilisationForRecovery,
} from '../src/lib/corridorModel'
import { developmentTranches, fundingLadder } from '../src/lib/funding'
import { developmentProgramme } from '../src/data/finance'

const close = (a: number, b: number, tol = 1e-6) => expect(Math.abs(a - b)).toBeLessThan(tol * Math.max(1, Math.abs(b)))

describe('capacity is derived from payload, dispatch and hours', () => {
  it('matches a hand calculation for the central case', () => {
    const c = capacity(centralInputs)
    // 12 departures/h × 2 directions × 20 h × 360 days
    expect(c.maxDeparturesPerYear).toBe(172_800)
    close(c.capacityT, 172_800 * 12 * 0.8)
    close(c.tonnes, c.capacityT * 0.5)
    close(c.kg, c.tonnes * 1000)
  })
  it('sizes the fleet from round-trip time', () => {
    const f = fleetSize(centralInputs)
    close(f.roundTripHours, 2 * (350 / 500 + 40 / 60))
    expect(f.total).toBe(Math.ceil(12 * f.roundTripHours * 1.15))
  })
})

describe('construction scope', () => {
  it('prices complex sections separately and does not scale terminals with length', () => {
    const a = constructionCost(centralInputs)
    const b = constructionCost({ ...centralInputs, alignmentKm: 700 })
    const t = (x: typeof a) => x.lines.find((l) => l.id === 'terminals')!.amount
    expect(t(a)).toBe(t(b))
    expect(b.guideway).toBeGreaterThan(a.guideway)
    close(a.guideway, 310 * 35e6 + 40 * 80e6)
  })
  it('adds design then contingency on top of hard costs', () => {
    const c = constructionCost(centralInputs)
    close(c.total, c.hard * 1.12 * 1.3)
    close(c.classes.civil + c.classes.systems + c.classes.fleet + c.classes.land, c.total)
  })
})

describe('operating and financing results', () => {
  const r = runCorridorModel(centralInputs)
  it('separates revenue, surplus, renewals, depreciation and financing', () => {
    close(r.operatingSurplus, r.revenue - r.variableCosts - r.fixedCosts)
    close(r.surplusAfterRenewals, r.operatingSurplus - r.renewals)
    close(r.cashAfterDebtService, r.surplusAfterRenewals - r.debtService)
    close(r.funding.equity + r.funding.debt + r.funding.publicSupport, r.capex.total)
  })
  it('computes required prices consistently', () => {
    const p = r.requiredPrice
    const at = (price: number) => runCorridorModel({ ...centralInputs, pricePerKg: price })
    close(at(p.operatingBreakEven!).operatingSurplus, 0, 1e-6)
    close(at(p.fullCapitalRecovery!).recoveryGap, 0, 1e-6)
    close(at(p.debtServiceAtTarget!).dscr!, centralInputs.targetDscr, 1e-6)
    expect(p.operatingBreakEven!).toBeLessThan(p.afterRenewals!)
    expect(p.afterRenewals!).toBeLessThan(p.fullCapitalRecovery!)
    expect(p.operatorAssetsOnly!).toBeLessThan(p.fullCapitalRecovery!)
  })
  it('states that the central case does not recover construction cost', () => {
    expect(r.recoveryGap).toBeLessThan(0)
    expect(r.requiredPrice.fullCapitalRecovery!).toBeGreaterThan(centralInputs.pricePerKg)
  })
  it('finds the construction cost that would allow recovery', () => {
    const m = constructionMultiplierForRecovery(centralInputs)
    if (m !== null) close(runCorridorModel({ ...centralInputs, constructionMultiplier: m }).recoveryGap, 0, 1e-3)
  })
  it('reports utilisation for recovery as unreachable when capacity is insufficient', () => {
    expect(utilisationForRecovery(centralInputs)).toBeNull()
  })
  it('orders scenarios sensibly', () => {
    const c = runCorridorModel(scenarios.conservative.inputs)
    const o = runCorridorModel(scenarios.optimistic.inputs)
    expect(c.capex.total).toBeGreaterThan(r.capex.total)
    expect(o.capex.total).toBeLessThan(r.capex.total)
    expect(o.surplusAfterRenewals).toBeGreaterThan(r.surplusAfterRenewals)
    expect(c.surplusAfterRenewals).toBeLessThan(r.surplusAfterRenewals)
  })
  it('handles zero utilisation and zero debt', () => {
    const z = runCorridorModel({ ...centralInputs, utilisation: 0 })
    expect(z.revenue).toBe(0)
    expect(z.requiredPrice.fullCapitalRecovery).toBeNull()
    const nd = runCorridorModel({ ...centralInputs, equityShare: 0.8, publicSupportShare: 0.2 })
    expect(nd.debtService).toBe(0)
    expect(nd.dscr).toBeNull()
  })
  it('uses a correct annuity factor', () => {
    close(annuityFactor(0, 10), 0.1)
    close(annuityFactor(0.08, 40) * 40, 0.08386 * 40, 1e-3)
  })
})

describe('funding ladder and tranches', () => {
  it('draws the $50m in tranches that reconcile with the cash-flow model', () => {
    const t = developmentTranches()
    expect(t.reduce((a, x) => a + x.amount, 0)).toBe(developmentProgramme.askUsd)
    for (const x of t) expect(x.undrawnAfter).toBe(x.closingCashIfPaidUpfront)
  })
  it('keeps passenger, regional and intercontinental stages uncosted', () => {
    const l = fundingLadder()
    expect(l.map((r) => r.costed)).toEqual([true, true, false, false, false])
  })
})
