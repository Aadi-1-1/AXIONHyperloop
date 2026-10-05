import { developmentProgramme, operatingDefaults, operatingResultLabel, type AllocationLine } from '../../data/finance'
import {
  allocationTotal,
  constructionCost,
  developmentCashFlow,
  headcount,
  labourIncludedInAllocation,
  operatingResult,
  pct,
  programmeLabourCost,
  usdCompact,
} from '../../lib/finance'
import { KindTag } from '../../components/common'
import './finance.css'

/** $50m allocation as horizontal bars, with the included salary share hatched inside each bar. */
export function AllocationChart({ showDetail = true }: { showDetail?: boolean }) {
  const lines: readonly AllocationLine[] = developmentProgramme.allocation
  const max = Math.max(...lines.map((l) => l.amount))
  return (
    <figure className="alloc">
      <figcaption className="visually-hidden">Allocation of the {usdCompact(developmentProgramme.askUsd)} development round</figcaption>
      <ul className="alloc-list">
        {lines.map((l) => (
          <li key={l.id} className="alloc-row">
            <div className="alloc-text">
              <span className="alloc-label">{l.label}</span>
              {showDetail && <span className="small muted alloc-detail">{l.detail}</span>}
            </div>
            <div className="alloc-bar-wrap" aria-hidden="true">
              <span className="alloc-bar" style={{ width: `${(l.amount / max) * 100}%` }}>
                {l.labourIncluded ? (
                  <span className="alloc-labour" style={{ width: `${(l.labourIncluded / l.amount) * 100}%` }} />
                ) : null}
              </span>
            </div>
            <span className="alloc-value mono">
              {usdCompact(l.amount)}
              {l.labourIncluded ? <span className="alloc-incl muted">incl. {usdCompact(l.labourIncluded)} salaries</span> : null}
            </span>
          </li>
        ))}
        <li className="alloc-row alloc-total">
          <div className="alloc-text">
            <span className="alloc-label">Total development round</span>
          </div>
          <div />
          <span className="alloc-value mono">{usdCompact(allocationTotal())}</span>
        </li>
      </ul>
      <p className="alloc-legend small">
        <span>
          <i className="lg-alloc" /> Allocation
        </span>
        <span>
          <i className="lg-labour" /> Of which development salaries — already included
        </span>
      </p>
    </figure>
  )
}

export function LabourNote() {
  const s = developmentProgramme.staffing
  const carriers = (developmentProgramme.allocation as readonly AllocationLine[]).filter((l) => l.labourIncluded)
  return (
    <p className="notice info small">
      <span>
        <strong>Salaries are inside the {usdCompact(developmentProgramme.askUsd)}, not on top of it.</strong> {headcount()} employees ×{' '}
        {usdCompact(s.fullyLoadedAnnualCost)} fully loaded × {developmentProgramme.years} years = {usdCompact(programmeLabourCost())},
        carried within{' '}
        {carriers.map((l, i) => (
          <span key={l.id}>
            {i > 0 && (i === carriers.length - 1 ? ' and ' : ', ')}
            {l.label.toLowerCase()} ({usdCompact(l.labourIncluded!)})
          </span>
        ))}{' '}
        — together {usdCompact(labourIncludedInAllocation())}.
      </span>
    </p>
  )
}

export function StaffingChart() {
  const groups = developmentProgramme.staffing.groups
  const max = Math.max(...groups.map((g) => g.count))
  return (
    <figure className="staffing">
      <figcaption className="label">Development team · {headcount()} people</figcaption>
      <ul className="staff-list">
        {groups.map((g) => (
          <li key={g.label}>
            <span className="small">{g.label}</span>
            <span className="staff-dots" aria-hidden="true">
              {Array.from({ length: g.count }, (_, i) => (
                <i key={i} />
              ))}
            </span>
            <span className="mono staff-count" style={{ ['--w' as string]: `${(g.count / max) * 100}%` }}>
              {g.count}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  )
}

/** Cash balance through the programme: one series, start and end of each year. */
export function CashFlowChart({ showTable = true }: { showTable?: boolean }) {
  const years = developmentCashFlow()
  const points = [{ label: 'Funding', cash: developmentProgramme.askUsd }, ...years.map((y) => ({ label: `End Y${y.year}`, cash: y.closingCash }))]
  const max = developmentProgramme.askUsd
  return (
    <div className="cashflow">
      <div className="cf-bars" role="img" aria-label={`Cash balance: ${points.map((p) => `${p.label} ${usdCompact(p.cash)}`).join(', ')}.`}>
        {points.map((p, i) => (
          <div key={p.label} className="cf-col">
            <span className="cf-value mono">{usdCompact(p.cash)}</span>
            <span className="cf-bar-wrap">
              <span className={`cf-bar${i === 0 ? ' start' : ''}`} style={{ height: `${Math.max(0.6, (p.cash / max) * 100)}%` }} />
            </span>
            <span className="cf-label small">{p.label}</span>
            {i > 0 && <span className="cf-spend mono small">−{usdCompact(years[i - 1].spending)}</span>}
          </div>
        ))}
      </div>
      {showTable && (
      <div className="table-scroll" tabIndex={0}>
        <table className="data-table">
          <caption className="visually-hidden">Development programme cash flow</caption>
          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col" className="num">Opening cash</th>
              <th scope="col" className="num">Revenue</th>
              <th scope="col" className="num">Spending</th>
              <th scope="col" className="num">Closing cash</th>
            </tr>
          </thead>
          <tbody>
            {years.map((y) => (
              <tr key={y.year}>
                <th scope="row">Year {y.year}</th>
                <td className="num mono">{usdCompact(y.openingCash)}</td>
                <td className="num mono">{usdCompact(y.revenue)}</td>
                <td className="num mono">{usdCompact(y.spending)}</td>
                <td className="num mono">{usdCompact(y.closingCash)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
      <p className="small muted" style={{ marginTop: 10 }}>
        <KindTag kind="assumption" /> No commercial revenue during the programme. Passenger development is outside this budget.
        Further financing is needed before commercial construction.
      </p>
    </div>
  )
}

export function ConstructionTable() {
  const c = constructionCost()
  const max = c.total
  return (
    <div className="construction">
      <div className="cc-stack" role="img" aria-label={`Construction cost composition totalling ${usdCompact(c.total)}.`}>
        {c.lines.map((l) => (
          <span key={l.id} className={`cc-seg cc-${l.id}`} style={{ flexGrow: l.amount / max }} title={`${l.label} ${usdCompact(l.amount)}`} />
        ))}
        <span className="cc-seg cc-contingency" style={{ flexGrow: c.contingency / max }} title={`Contingency ${usdCompact(c.contingency)}`} />
      </div>
      <div className="table-scroll" tabIndex={0}>
        <table className="data-table">
          <caption className="visually-hidden">Illustrative construction cost for a hypothetical 100 km freight corridor</caption>
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Basis</th>
              <th scope="col" className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {c.lines.map((l) => (
              <tr key={l.id}>
                <th scope="row">
                  <i className={`cc-key cc-${l.id}`} aria-hidden="true" /> {l.label}
                </th>
                <td className="mono small">{l.basis}</td>
                <td className="num mono">{usdCompact(l.amount)}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">Subtotal</th>
              <td />
              <td className="num mono">{usdCompact(c.subtotal)}</td>
            </tr>
            <tr>
              <th scope="row">
                <i className="cc-key cc-contingency" aria-hidden="true" /> Contingency
              </th>
              <td className="mono small">{pct(c.contingencyRate)} of subtotal</td>
              <td className="num mono">{usdCompact(c.contingency)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td />
              <td className="num mono">{usdCompact(c.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}

/** Shows openly how small operating surplus is relative to construction cost. Not a payback estimate. */
export function FinancingChallenge() {
  const c = constructionCost()
  const high = operatingResult({ ...operatingDefaults, utilisation: 0.85 })
  const mid = operatingResult({ ...operatingDefaults, utilisation: 0.6 })
  const ratio = c.total / high.operatingResult
  return (
    <div className="challenge">
      <div className="challenge-compare" role="img" aria-label={`Construction cost ${usdCompact(c.total)} compared with annual operating result of ${usdCompact(high.operatingResult)} at 85% utilisation.`}>
        <div className="ch-row">
          <span className="label">Illustrative construction cost</span>
          <span className="ch-bar big" style={{ width: '100%' }} />
          <span className="figure-num ch-num">{usdCompact(c.total)}</span>
        </div>
        <div className="ch-row">
          <span className="label">Annual operating result · 85% utilisation</span>
          <span className="ch-bar" style={{ width: `${Math.max(0.4, (high.operatingResult / c.total) * 100)}%` }} />
          <span className="figure-num ch-num small-num">{usdCompact(high.operatingResult)}</span>
        </div>
        <div className="ch-row">
          <span className="label">Annual operating result · 60% utilisation</span>
          <span className="ch-bar" style={{ width: `${Math.max(0.4, (mid.operatingResult / c.total) * 100)}%` }} />
          <span className="figure-num ch-num small-num">{usdCompact(mid.operatingResult)}</span>
        </div>
      </div>
      <p className="body-2">
        Even in the 85% scenario, the annual operating result is about <strong>{pct(high.operatingResult / c.total, 1)}</strong> of the
        illustrative construction cost — roughly {Math.round(ratio)} years of surplus to equal it, before any financing cost,
        depreciation, tax or major renewals. This is not a payback estimate. It shows that, at these assumptions, a corridor could not
        be funded from operating surplus alone.
      </p>
      <p className="small muted">
        Operating results are {operatingResultLabel.toLowerCase()}. A financeable case would need some combination of lower
        construction cost, higher-value freight, public co-funding, longer asset life or additional revenue — each to be tested,
        none assumed.
      </p>
    </div>
  )
}
