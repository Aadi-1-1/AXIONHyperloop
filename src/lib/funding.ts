import { developmentProgramme } from '../data/finance'
import { feasibilityGates } from '../data/technology'
import { centralInputs } from '../data/corridorModel'
import { runCorridorModel } from './corridorModel'
import { developmentCashFlow } from './finance'

/**
 * The $50m is committed at close and drawn in three tranches. Each tranche equals that year's spending,
 * so the undrawn commitment at year end matches the closing cash of the fully-funded view.
 */
export function developmentTranches() {
  const cf = developmentCashFlow()
  const conditions = [
    'Drawn at close',
    `Drawn when Gate ${feasibilityGates[0].index} (${feasibilityGates[0].name.toLowerCase()}) is passed`,
    `Drawn when Gate ${feasibilityGates[1].index} (${feasibilityGates[1].name.toLowerCase()}) is passed`,
  ]
  let undrawn = developmentProgramme.askUsd
  return cf.map((y, i) => {
    undrawn -= y.spending
    return { tranche: i + 1, year: y.year, amount: y.spending, condition: conditions[i] ?? '', undrawnAfter: undrawn, closingCashIfPaidUpfront: y.closingCash }
  })
}

export type LadderRung = { id: string; step: number; title: string; amount: string; status: string; detail: string; costed: boolean }

export function fundingLadder(): LadderRung[] {
  const central = runCorridorModel(centralInputs)
  const bn = (v: number) => `≈$${(v / 1e9).toFixed(1)}bn`
  return [
    {
      id: 'development',
      step: 1,
      title: 'Development funding',
      amount: `$${developmentProgramme.askUsd / 1e6}m`,
      status: 'Sought now',
      detail: 'Three-year feasibility and demonstration programme. Committed at close and drawn in three tranches against gates.',
      costed: true,
    },
    {
      id: 'construction',
      step: 2,
      title: 'First-corridor construction finance',
      amount: bn(central.capex.total),
      status: 'Conditional on Gate 5',
      detail: 'Singapore–Kuala Lumpur central scenario. Equity, debt and any public support would be raised only after a positive construction decision. Illustrative.',
      costed: true,
    },
    {
      id: 'passenger',
      step: 3,
      title: 'Passenger development',
      amount: 'Not costed',
      status: 'Separately funded',
      detail: 'Needs its own safety case, approvals and infrastructure. It is outside both the $50m and the freight corridor budget.',
      costed: false,
    },
    {
      id: 'regional',
      step: 4,
      title: 'Regional expansion',
      amount: 'Not costed',
      status: 'Later',
      detail: 'Each further corridor needs its own feasibility study, business case and finance.',
      costed: false,
    },
    {
      id: 'intercontinental',
      step: 5,
      title: 'Intercontinental connections',
      amount: 'Uncosted ambition',
      status: 'Long term',
      detail: 'Sea and ocean crossings have no feasible alignment identified. They are shown as vision only.',
      costed: false,
    },
  ]
}
