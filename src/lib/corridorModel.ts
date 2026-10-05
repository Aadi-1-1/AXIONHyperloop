import type { CorridorInputs } from '../data/corridorModel'
import { leadCorridor } from '../data/network'
import { corridorStraightLineKm } from './geo'

export type CapexClass = 'civil' | 'systems' | 'fleet' | 'land'
export type CapexLine = { id: string; label: string; basis: string; amount: number; cls: CapexClass }

/** Annuity factor: annual payment per $1 borrowed at rate r over n years. */
export function annuityFactor(rate: number, years: number): number {
  if (years <= 0) return Infinity
  if (rate === 0) return 1 / years
  return rate / (1 - Math.pow(1 + rate, -years))
}

export function fleetSize(i: CorridorInputs) {
  const oneWayHours = i.alignmentKm / i.averageSpeedKmh + i.terminalTurnaroundMin / 60
  const roundTripHours = 2 * oneWayHours
  const inService = i.departuresPerHourPerDirection * roundTripHours
  return { roundTripHours, inService, total: Math.ceil(inService * (1 + i.podSpareShare)) }
}

export function constructionCost(i: CorridorInputs) {
  const m = i.constructionMultiplier
  const elevatedKm = Math.max(0, i.alignmentKm - i.complexKm)
  const guidewayElevated = elevatedKm * i.elevatedCostPerKm * m
  const guidewayComplex = i.complexKm * i.complexCostPerKm * m
  const guideway = guidewayElevated + guidewayComplex
  const fleet = fleetSize(i)
  const lines: CapexLine[] = [
    { id: 'guideway-civil', label: 'Guideway structure (twin tube)', basis: `${elevatedKm} km elevated + ${i.complexKm} km tunnel/complex`, amount: guideway * (1 - i.guidewaySystemsShare), cls: 'civil' },
    { id: 'guideway-systems', label: 'Propulsion, vacuum and control systems', basis: `${Math.round(i.guidewaySystemsShare * 100)}% of guideway cost`, amount: guideway * i.guidewaySystemsShare, cls: 'systems' },
    { id: 'terminals', label: 'Freight terminals', basis: `${i.terminalCount} × throughput-sized terminal`, amount: i.terminalCount * i.terminalCost * m, cls: 'systems' },
    { id: 'depot', label: 'Maintenance depot and control centre', basis: 'Lump sum', amount: i.depotCost * m, cls: 'civil' },
    { id: 'power', label: 'Power connections and substations', basis: `${i.alignmentKm} km × per-km allowance`, amount: i.alignmentKm * i.powerCostPerKm * m, cls: 'systems' },
    { id: 'land', label: 'Land and rights of way', basis: 'Urban sections priced higher than rural', amount: (elevatedKm * i.landCostPerKmElevated + i.complexKm * i.landCostPerKmComplex) * m, cls: 'land' },
    { id: 'fleet', label: 'Pod fleet', basis: `${fleet.total} pods (incl. ${Math.round(i.podSpareShare * 100)}% spares) × pod cost`, amount: fleet.total * i.podCost, cls: 'fleet' },
  ]
  const hard = lines.reduce((a, l) => a + l.amount, 0)
  const design = hard * i.designShare
  const contingency = (hard + design) * i.contingencyRate
  const total = hard + design + contingency
  // Design and contingency are spread across asset classes in proportion to hard cost.
  const uplift = total / hard
  const byClass = (cls: CapexClass) => lines.filter((l) => l.cls === cls).reduce((a, l) => a + l.amount, 0) * uplift
  return {
    lines,
    hard,
    design,
    contingency,
    total,
    fleet,
    guideway,
    perAlignmentKm: total / i.alignmentKm,
    classes: { civil: byClass('civil'), systems: byClass('systems'), fleet: byClass('fleet'), land: byClass('land') },
  }
}

export function capacity(i: CorridorInputs) {
  const maxDeparturesPerYear = i.departuresPerHourPerDirection * 2 * i.operatingHoursPerDay * i.operatingDaysPerYear
  const capacityT = maxDeparturesPerYear * i.podPayloadT * i.podLoadFactor
  const departures = maxDeparturesPerYear * i.utilisation
  const tonnes = departures * i.podPayloadT * i.podLoadFactor
  return { maxDeparturesPerYear, capacityT, departures, tonnes, kg: tonnes * 1000, tonnesPerDay: tonnes / i.operatingDaysPerYear }
}

export type CorridorResult = ReturnType<typeof runCorridorModel>

export function runCorridorModel(i: CorridorInputs) {
  const capex = constructionCost(i)
  const cap = capacity(i)
  const revenue = cap.kg * i.pricePerKg
  const handling = cap.kg * i.handlingCostPerKg
  const energy = cap.departures * i.alignmentKm * i.energyKwhPerPodKm * i.electricityPricePerKwh
  const variableCosts = handling + energy
  const staff = i.staff * i.staffCostEach
  const maintenance = (capex.lines.find((l) => l.id === 'guideway-civil')!.amount + capex.lines.find((l) => l.id === 'guideway-systems')!.amount + capex.lines.find((l) => l.id === 'power')!.amount) * i.infrastructureMaintenanceRate
  const fixedCosts = staff + i.vacuumBaseEnergyPerYear + i.insuranceAdminPerYear + maintenance
  const operatingSurplus = revenue - variableCosts - fixedCosts
  const renewals = capex.classes.fleet / i.podLifeYears + capex.classes.systems * i.systemsRenewalRate
  const surplusAfterRenewals = operatingSurplus - renewals
  const depreciation = capex.classes.civil / i.civilLifeYears + capex.classes.systems / i.systemsLifeYears + capex.classes.fleet / i.podLifeYears

  // Illustrative funding structure (public support is hypothetical).
  const debtShare = Math.max(0, 1 - i.equityShare - i.publicSupportShare)
  const funding = {
    equity: capex.total * i.equityShare,
    publicSupport: capex.total * i.publicSupportShare,
    debt: capex.total * debtShare,
    debtShare,
  }
  const debtService = funding.debt * annuityFactor(i.interestRate, i.debtTenorYears)
  const firstYearInterest = funding.debt * i.interestRate
  const dscr = debtService > 0 ? surplusAfterRenewals / debtService : null
  const cashAfterDebtService = surplusAfterRenewals - debtService
  const resultBeforeTax = operatingSurplus - depreciation - firstYearInterest

  // Infrastructure-investment recovery.
  const capitalRecoveryCharge = capex.total * annuityFactor(i.costOfCapital, i.recoveryYears)
  const recoveryGap = surplusAfterRenewals - capitalRecoveryCharge
  const simpleRecoveryYears = surplusAfterRenewals > 0 ? capex.total / surplusAfterRenewals : null
  // If a public body funded the guideway, power and land (like a rail infrastructure manager), the operator
  // would still need to recover terminals, depot and fleet. Hypothetical: no such support exists.
  const operatorAssets = ['terminals', 'depot', 'fleet'].reduce((a, id) => a + capex.lines.find((l) => l.id === id)!.amount, 0) * (capex.total / capex.hard)
  const operatorRecoveryCharge = operatorAssets * annuityFactor(i.costOfCapital, i.recoveryYears)

  const perKg = (extra: number) => (cap.kg > 0 ? (variableCosts + fixedCosts + extra) / cap.kg : null)
  const requiredPrice = {
    operatingBreakEven: perKg(0),
    afterRenewals: perKg(renewals),
    debtServiceAtTarget: perKg(renewals + i.targetDscr * debtService),
    fullCapitalRecovery: perKg(renewals + capitalRecoveryCharge),
    operatorAssetsOnly: perKg(renewals + operatorRecoveryCharge),
  }

  return {
    inputs: i,
    geographicKm: corridorStraightLineKm(leadCorridor),
    capex,
    capacity: cap,
    revenue,
    variableCosts,
    handling,
    energy,
    fixedCosts,
    fixedBreakdown: { staff, maintenance, vacuum: i.vacuumBaseEnergyPerYear, insuranceAdmin: i.insuranceAdminPerYear },
    operatingSurplus,
    renewals,
    surplusAfterRenewals,
    depreciation,
    resultBeforeTax,
    funding,
    debtService,
    firstYearInterest,
    dscr,
    cashAfterDebtService,
    capitalRecoveryCharge,
    recoveryGap,
    simpleRecoveryYears,
    operatorAssets,
    operatorRecoveryCharge,
    requiredPrice,
  }
}

/** Utilisation needed for full capital recovery at the given price (null if not reachable within capacity). */
export function utilisationForRecovery(i: CorridorInputs): number | null {
  const gap = (u: number) => runCorridorModel({ ...i, utilisation: u }).recoveryGap
  if (gap(1) < 0) return null
  if (gap(0) >= 0) return 0
  let lo = 0
  let hi = 1
  for (let k = 0; k < 50; k++) {
    const mid = (lo + hi) / 2
    if (gap(mid) >= 0) hi = mid
    else lo = mid
  }
  return hi
}

/** Construction-cost multiplier at which surplus after renewals equals the capital-recovery charge. */
export function constructionMultiplierForRecovery(i: CorridorInputs): number | null {
  const gap = (m: number) => runCorridorModel({ ...i, constructionMultiplier: m }).recoveryGap
  if (gap(0.0001) < 0) return null
  let lo = 0.0001
  let hi = 1
  while (gap(hi) >= 0 && hi < 64) hi *= 2
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2
    if (gap(mid) >= 0) lo = mid
    else hi = mid
  }
  return lo
}
