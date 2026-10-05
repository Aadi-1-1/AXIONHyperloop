import { developmentTranches, fundingLadder } from '../../lib/funding'
import { usdCompact } from '../../lib/finance'
import './finance.css'

/** Five funding stages, from the $50m sought now to uncosted long-term ambitions. */
export default function FundingLadder({ compact = false }: { compact?: boolean }) {
  const rungs = fundingLadder()
  return (
    <ol className={`ladder${compact ? ' compact' : ''}`}>
      {rungs.map((r) => (
        <li key={r.id} className={`rung rung-${r.id}${r.costed ? '' : ' uncosted'}`}>
          <span className="rung-step mono">{r.step}</span>
          <div className="rung-body">
            <p className="rung-status label">{r.status}</p>
            <h3 className="rung-title">{r.title}</h3>
            {!compact && <p className="small body-2 rung-detail">{r.detail}</p>}
          </div>
          <p className="rung-amount figure-num">{r.amount}</p>
        </li>
      ))}
    </ol>
  )
}

export function TrancheTable() {
  const t = developmentTranches()
  return (
    <div className="table-scroll" tabIndex={0}>
      <table className="data-table tranche-table">
        <caption className="visually-hidden">Development funding: committed at close, drawn in tranches</caption>
        <thead>
          <tr>
            <th scope="col">Tranche</th>
            <th scope="col">Condition</th>
            <th scope="col" className="num">Drawn</th>
            <th scope="col" className="num">Spent in year</th>
            <th scope="col" className="num">Undrawn after</th>
          </tr>
        </thead>
        <tbody>
          {t.map((x) => (
            <tr key={x.tranche}>
              <th scope="row">
                {x.tranche} · Year {x.year}
              </th>
              <td className="small">{x.condition}</td>
              <td className="num mono">{usdCompact(x.amount)}</td>
              <td className="num mono">{usdCompact(x.amount)}</td>
              <td className="num mono">{usdCompact(x.undrawnAfter)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td>Committed at close</td>
            <td />
            <td className="num mono">{usdCompact(t.reduce((a, x) => a + x.amount, 0))}</td>
            <td />
            <td />
          </tr>
        </tfoot>
      </table>
      <p className="small muted">
        Each tranche equals that year’s spending, so the undrawn commitment at each year end ($38m, $20m, $0) matches the closing cash
        if the full $50m were paid at close. No revenue is assumed.
      </p>
    </div>
  )
}
