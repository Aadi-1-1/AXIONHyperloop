import { useId, useMemo, useState } from 'react'
import { corridorScenarioLabel, inputNotes, scenarios, type CorridorInputs, type ScenarioId } from '../../data/corridorModel'
import { constructionMultiplierForRecovery, runCorridorModel, utilisationForRecovery, type CorridorResult } from '../../lib/corridorModel'
import { pct, usdCompact, usdPerKg } from '../../lib/finance'
import { formatKm } from '../../lib/geo'
import { KindTag, SourceRef } from '../../components/common'
import './finance.css'

const bn = (v: number) => (Math.abs(v) >= 1e9 ? `${v < 0 ? '−' : ''}$${(Math.abs(v) / 1e9).toFixed(1)}bn` : usdCompact(v, 0))
const m0 = (v: number) => usdCompact(v, 0)
const kg = (v: number | null) => (v === null ? 'n/a' : usdPerKg(v))
const mt = (t: number) => `${(t / 1e6).toFixed(2)} Mt`

function Lever({ label, value, min, max, step, format, onChange }: { label: string; value: number; min: number; max: number; step: number; format: (v: number) => string; onChange: (v: number) => void }) {
  const id = useId()
  const fill = ((value - min) / (max - min)) * 100
  return (
    <div className="slider">
      <div className="slider-head">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id} className="mono slider-value">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        style={{ ['--fill' as string]: `${fill}%` }}
        aria-valuetext={format(value)}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}

export default function CorridorModel({ compact = false }: { compact?: boolean }) {
  const [scenario, setScenario] = useState<ScenarioId>('central')
  const [over, setOver] = useState<Partial<CorridorInputs>>({})
  const inputs = useMemo(() => ({ ...scenarios[scenario].inputs, ...over }), [scenario, over])
  const r = useMemo(() => runCorridorModel(inputs), [inputs])
  const multNeeded = useMemo(() => constructionMultiplierForRecovery(inputs), [inputs])
  const utilNeeded = useMemo(() => utilisationForRecovery(inputs), [inputs])
  const adjusted = Object.keys(over).length > 0
  const set = (k: keyof CorridorInputs) => (v: number) => setOver((o) => ({ ...o, [k]: v }))

  return (
    <div className="cmodel">
      <div className="cm-head">
        <div>
          <p className="label freight-text">{corridorScenarioLabel}</p>
          <h3 className="h3">Singapore — Kuala Lumpur freight scenario</h3>
          <p className="small muted cm-dist">
            Approx. geographic distance <span className="mono">{formatKm(r.geographicKm)}</span> · assumed alignment{' '}
            <span className="mono">{inputs.alignmentKm} km</span> (not surveyed) · twin tubes, one per direction · freight only
          </p>
        </div>
        <div className="cm-scenarios">
          <div className="segmented" role="group" aria-label="Scenario">
            {(Object.keys(scenarios) as ScenarioId[]).map((id) => (
              <button
                key={id}
                type="button"
                aria-pressed={scenario === id}
                onClick={() => {
                  setScenario(id)
                  setOver({})
                }}
              >
                {scenarios[id].label}
              </button>
            ))}
          </div>
          <p className="small muted">{scenarios[scenario].summary}</p>
        </div>
      </div>

      <div className="cm-grid">
        <section className="cm-levers" aria-label="Adjust assumptions">
          <div className="opx-controls-head">
            <p className="label">Adjust {scenarios[scenario].label.toLowerCase()} case</p>
            <button type="button" className="btn btn-sm" disabled={!adjusted} onClick={() => setOver({})}>
              Reset
            </button>
          </div>
          <Lever label="Slot utilisation" value={inputs.utilisation} min={0.1} max={1} step={0.01} format={(v) => pct(v)} onChange={set('utilisation')} />
          <Lever label="Average charge" value={inputs.pricePerKg} min={0.1} max={4} step={0.05} format={usdPerKg} onChange={set('pricePerKg')} />
          <Lever label="Construction cost" value={inputs.constructionMultiplier} min={0.25} max={1.75} step={0.05} format={(v) => `${Math.round(v * 100)}% of base`} onChange={set('constructionMultiplier')} />
          <Lever label="Interest rate" value={inputs.interestRate} min={0.02} max={0.12} step={0.0025} format={(v) => pct(v, 2)} onChange={set('interestRate')} />
          <dl className="opx-fixed">
            <div>
              <dt>Pod payload</dt>
              <dd className="mono">{inputs.podPayloadT} t</dd>
            </div>
            <div>
              <dt>Departures / hour / direction</dt>
              <dd className="mono">{inputs.departuresPerHourPerDirection}</dd>
            </div>
            <div>
              <dt>Operating hours × days</dt>
              <dd className="mono">
                {inputs.operatingHoursPerDay} h × {inputs.operatingDaysPerYear}
              </dd>
            </div>
            <div>
              <dt>Average pod load</dt>
              <dd className="mono">{pct(inputs.podLoadFactor)}</dd>
            </div>
            <div>
              <dt>Fleet (sized from round trip)</dt>
              <dd className="mono">{r.capex.fleet.total} pods</dd>
            </div>
          </dl>
          <p className="small muted">
            <KindTag kind="assumption" /> Illustrative inputs, not engineering estimates.
          </p>
        </section>

        <section className="cm-results" aria-live="polite" aria-label="Results">
          <Verdict r={r} multNeeded={multNeeded} utilNeeded={utilNeeded} />
          <RequiredPrices r={r} />
          <Ledger r={r} />
        </section>
      </div>

      {!compact && (
        <>
          <div className="cm-two">
            <Construction r={r} />
            <Capacity r={r} />
          </div>
          <ScenarioTable />
          <Sensitivity inputs={inputs} />
          <FundingStructure r={r} />
          <details className="disclosure cm-notes">
            <summary>Assumption sources and basis</summary>
            <ul className="bullets">
              {inputNotes.map((n) => (
                <li key={n.key}>
                  <strong>{n.label}.</strong> {n.basis} {n.benchmark && <SourceRef id={n.benchmark} />}
                </li>
              ))}
            </ul>
          </details>
        </>
      )}
    </div>
  )
}

export function Verdict({ r, multNeeded, utilNeeded }: { r: CorridorResult; multNeeded: number | null; utilNeeded: number | null }) {
  const recovers = r.recoveryGap >= 0
  const coversOps = r.operatingSurplus >= 0
  const coversRenewals = r.surplusAfterRenewals >= 0
  const headline = recovers
    ? 'At these assumptions, freight revenue would recover construction cost at the stated cost of capital.'
    : coversRenewals
      ? 'Freight revenue covers operations and renewals, but does not recover construction cost.'
      : coversOps
        ? 'Freight revenue covers day-to-day operations, but not renewals or construction cost.'
        : 'Freight revenue does not cover day-to-day operating costs.'
  return (
    <div className={`verdict ${recovers ? 'ok' : 'gap'}`}>
      <p className="label">Model verdict</p>
      <p className="verdict-head">{headline}</p>
      {!recovers && (
        <ul className="verdict-list small">
          <li>
            Price needed for full capital recovery: <strong className="mono">{kg(r.requiredPrice.fullCapitalRecovery)}</strong>, against an assumed{' '}
            <span className="mono">{usdPerKg(r.inputs.pricePerKg)}</span>.
          </li>
          <li>
            Or construction cost would need to fall to{' '}
            <strong className="mono">{multNeeded === null ? 'no achievable level' : `${Math.round(multNeeded * 100)}% of base (${bn(r.capex.total * (multNeeded / r.inputs.constructionMultiplier))})`}</strong>.
          </li>
          <li>Higher utilisation alone {utilNeeded === null ? 'cannot close the gap within capacity' : `would need ${pct(utilNeeded)} of slots`}.</li>
          <li>
            If a public body funded the guideway, power and land, the operator would need about <strong className="mono">{kg(r.requiredPrice.operatorAssetsOnly)}</strong>. This is hypothetical; no such support exists.
          </li>
        </ul>
      )}
      <p className="small muted">These are the prices the model needs, not prices customers have accepted.</p>
    </div>
  )
}

export function RequiredPrices({ r }: { r: CorridorResult }) {
  const rows = [
    { label: 'Operating break-even', v: r.requiredPrice.operatingBreakEven },
    { label: 'Plus renewals', v: r.requiredPrice.afterRenewals },
    { label: 'Operator assets only (if infrastructure publicly funded)', v: r.requiredPrice.operatorAssetsOnly },
    { label: `Debt service at DSCR ${r.inputs.targetDscr}`, v: r.requiredPrice.debtServiceAtTarget },
    { label: 'Full capital recovery', v: r.requiredPrice.fullCapitalRecovery },
  ]
  const max = Math.max(r.inputs.pricePerKg, ...rows.map((x) => x.v ?? 0)) * 1.05
  const pos = (v: number) => `${(v / max) * 100}%`
  return (
    <figure className="req-prices">
      <figcaption className="label">Price required for each target vs assumed price</figcaption>
      <ul>
        {rows.map((row) => (
          <li key={row.label}>
            <span className="small rp-label">{row.label}</span>
            <span className="rp-track">
              {row.v !== null && <span className={`rp-bar${row.v <= r.inputs.pricePerKg ? ' met' : ''}`} style={{ width: pos(row.v) }} />}
              <span className="rp-ref" style={{ left: pos(r.inputs.pricePerKg) }} aria-hidden="true" />
            </span>
            <span className="mono small rp-value">{kg(row.v)}</span>
          </li>
        ))}
      </ul>
      <p className="small muted rp-legend">
        <span className="rp-ref-key" aria-hidden="true" /> Assumed price {usdPerKg(r.inputs.pricePerKg)} · bars in green are met at that price
      </p>
    </figure>
  )
}

function Ledger({ r }: { r: CorridorResult }) {
  const row = (label: string, v: number | string, opts: { strong?: boolean; sub?: string; sign?: boolean } = {}) => (
    <tr className={opts.strong ? 'strong' : undefined}>
      <th scope="row">
        {label}
        {opts.sub && <span className="small muted ledger-sub">{opts.sub}</span>}
      </th>
      <td className={`num mono${opts.sign && typeof v === 'number' ? (v < 0 ? ' neg' : ' pos') : ''}`}>{typeof v === 'number' ? m0(v) : v}</td>
    </tr>
  )
  return (
    <div className="table-scroll" tabIndex={0}>
      <table className="data-table ledger">
        <caption className="label ledger-cap">Annual result at steady state (USD)</caption>
        <tbody>
          {row('Revenue', r.revenue, { sub: `${mt(r.capacity.tonnes)} carried` })}
          {row('− Variable costs', -r.variableCosts, { sub: 'Handling and energy per trip' })}
          {row('− Fixed operating costs', -r.fixedCosts, { sub: 'Staff, maintenance, vacuum base load, insurance' })}
          {row('= Operating surplus', r.operatingSurplus, { strong: true, sign: true, sub: 'Before depreciation, financing, tax and renewals' })}
          {row('− Renewal allowance', -r.renewals, { sub: 'Fleet replacement and systems renewal' })}
          {row('= Surplus after renewals', r.surplusAfterRenewals, { strong: true, sign: true })}
          {row('Depreciation (accounting, non-cash)', -r.depreciation)}
          {row('Interest, first year', -r.firstYearInterest)}
          {row('= Result before tax, first year', r.resultBeforeTax, { strong: true, sign: true })}
          {row('Debt service (interest + principal)', -r.debtService, { sub: `${pct(r.funding.debtShare)} debt, ${pct(r.inputs.interestRate, 1)}, ${r.inputs.debtTenorYears} years` })}
          {row('= Cash after debt service', r.cashAfterDebtService, { strong: true, sign: true })}
          {row('Debt service cover (DSCR)', r.dscr === null ? 'No debt' : r.dscr.toFixed(2))}
          {row('Capital-recovery charge', -r.capitalRecoveryCharge, { sub: `${bn(r.capex.total)} at ${pct(r.inputs.costOfCapital)} over ${r.inputs.recoveryYears} years` })}
          {row('= Infrastructure recovery gap', r.recoveryGap, { strong: true, sign: true, sub: 'Surplus after renewals − recovery charge' })}
        </tbody>
      </table>
      <p className="small muted">
        <KindTag kind="calculated" /> Tax is not modelled. No valuation, equity return or payback date is presented.
      </p>
    </div>
  )
}

function Construction({ r }: { r: CorridorResult }) {
  return (
    <div>
      <h4 className="label">Construction scope</h4>
      <div className="table-scroll" tabIndex={0}>
        <table className="data-table">
          <caption className="visually-hidden">Construction cost by component</caption>
          <thead>
            <tr>
              <th scope="col">Component</th>
              <th scope="col">Basis</th>
              <th scope="col" className="num">Amount</th>
            </tr>
          </thead>
          <tbody>
            {r.capex.lines.map((l) => (
              <tr key={l.id}>
                <th scope="row">{l.label}</th>
                <td className="small muted">{l.basis}</td>
                <td className="num mono">{bn(l.amount)}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">Design, approvals and integration</th>
              <td className="small muted">{pct(r.inputs.designShare)} of hard cost</td>
              <td className="num mono">{bn(r.capex.design)}</td>
            </tr>
            <tr>
              <th scope="row">Contingency</th>
              <td className="small muted">{pct(r.inputs.contingencyRate)}, early-stage uncertainty</td>
              <td className="num mono">{bn(r.capex.contingency)}</td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td>Total</td>
              <td className="small">{usdCompact(r.capex.perAlignmentKm)} per km of alignment</td>
              <td className="num mono">{bn(r.capex.total)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <p className="small muted">Terminals, depot and fleet are sized by throughput, not by length. Urban and strait sections are priced separately from open sections.</p>
    </div>
  )
}

function Capacity({ r }: { r: CorridorResult }) {
  const i = r.inputs
  return (
    <div>
      <h4 className="label">Capacity, derived</h4>
      <pre className="mono small cm-derivation" tabIndex={0}>{`${i.departuresPerHourPerDirection} departures/h × 2 directions
× ${i.operatingHoursPerDay} h × ${i.operatingDaysPerYear} days   = ${r.capacity.maxDeparturesPerYear.toLocaleString('en-US')} departures/yr
× ${i.podPayloadT} t payload × ${pct(i.podLoadFactor)} load      = ${mt(r.capacity.capacityT)} practical capacity
× ${pct(i.utilisation)} slots used                = ${mt(r.capacity.tonnes)} carried
                                ≈ ${Math.round(r.capacity.tonnesPerDay).toLocaleString('en-US')} t per operating day

Fleet: round trip ${r.capex.fleet.roundTripHours.toFixed(2)} h (${i.alignmentKm} km at ${i.averageSpeedKmh} km/h avg
+ ${i.terminalTurnaroundMin} min turnaround, each way)
→ ${r.capex.fleet.inService.toFixed(1)} pods in service + ${pct(i.podSpareShare)} spares = ${r.capex.fleet.total}`}</pre>
      <p className="small muted">Speed is used only to size the fleet. Demonstrated test speeds are far lower.</p>
    </div>
  )
}

function ScenarioTable() {
  const rows = (Object.keys(scenarios) as ScenarioId[]).map((id) => ({ id, r: runCorridorModel(scenarios[id].inputs) }))
  const line = (label: string, f: (r: CorridorResult) => string) => (
    <tr>
      <th scope="row">{label}</th>
      {rows.map(({ id, r }) => (
        <td key={id} className="num mono">
          {f(r)}
        </td>
      ))}
    </tr>
  )
  return (
    <div className="cm-block">
      <h4 className="label">Conservative, central and optimistic scenarios</h4>
      <div className="table-scroll" tabIndex={0}>
        <table className="data-table scenario-compare">
          <caption className="visually-hidden">Scenario comparison</caption>
          <thead>
            <tr>
              <th scope="col">Measure</th>
              {rows.map(({ id }) => (
                <th key={id} scope="col" className="num">
                  {scenarios[id].label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {line('Construction cost', (r) => bn(r.capex.total))}
            {line('Freight carried', (r) => mt(r.capacity.tonnes))}
            {line('Assumed price', (r) => usdPerKg(r.inputs.pricePerKg))}
            {line('Revenue', (r) => m0(r.revenue))}
            {line('Operating surplus', (r) => m0(r.operatingSurplus))}
            {line('Surplus after renewals', (r) => m0(r.surplusAfterRenewals))}
            {line('DSCR', (r) => (r.dscr === null ? '—' : r.dscr.toFixed(2)))}
            {line('Price for full capital recovery', (r) => kg(r.requiredPrice.fullCapitalRecovery))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Sensitivity({ inputs }: { inputs: CorridorInputs }) {
  const mults = [0.5, 0.75, 1, 1.25, 1.5]
  const prices = [0.3, 0.45, 0.75, 1.25, 2, 3]
  const utils = [0.3, 0.5, 0.7, 0.9]
  const rates = [0.04, 0.055, 0.065, 0.08, 0.1]
  const dscrClass = (d: number | null) => (d === null ? '' : d >= inputs.targetDscr ? 'ok' : d >= 1 ? 'warn' : 'bad')
  return (
    <div className="cm-block">
      <h4 className="label">Sensitivity</h4>
      <div className="cm-sens">
        <div className="table-scroll" tabIndex={0}>
          <table className="data-table">
            <caption className="small sens-cap">Construction cost → price required</caption>
            <thead>
              <tr>
                <th scope="col">Cost vs base</th>
                <th scope="col" className="num">Capital cost</th>
                <th scope="col" className="num">For DSCR {inputs.targetDscr}</th>
                <th scope="col" className="num">Full recovery</th>
              </tr>
            </thead>
            <tbody>
              {mults.map((m) => {
                const r = runCorridorModel({ ...inputs, constructionMultiplier: m })
                return (
                  <tr key={m} className={m === inputs.constructionMultiplier ? 'current' : undefined}>
                    <th scope="row" className="mono">{Math.round(m * 100)}%</th>
                    <td className="num mono">{bn(r.capex.total)}</td>
                    <td className="num mono">{kg(r.requiredPrice.debtServiceAtTarget)}</td>
                    <td className="num mono">{kg(r.requiredPrice.fullCapitalRecovery)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="table-scroll" tabIndex={0}>
          <table className="data-table heat">
            <caption className="small sens-cap">Debt service cover (DSCR) by price and utilisation</caption>
            <thead>
              <tr>
                <th scope="col">Price \ slots used</th>
                {utils.map((u) => (
                  <th key={u} scope="col" className="num">
                    {pct(u)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {prices.map((p) => (
                <tr key={p}>
                  <th scope="row" className="mono">{usdPerKg(p)}</th>
                  {utils.map((u) => {
                    const d = runCorridorModel({ ...inputs, pricePerKg: p, utilisation: u }).dscr
                    return (
                      <td key={u} className={`num mono heat-${dscrClass(d)}`}>
                        {d === null ? '—' : d.toFixed(2)}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="small muted heat-key">
            <span className="hk ok" /> ≥ {inputs.targetDscr} <span className="hk warn" /> 1.0–{inputs.targetDscr} <span className="hk bad" /> below 1.0, so debt cannot be serviced
          </p>
        </div>
        <div className="table-scroll" tabIndex={0}>
          <table className="data-table">
            <caption className="small sens-cap">Interest rate → annual debt service</caption>
            <thead>
              <tr>
                <th scope="col">Rate</th>
                <th scope="col" className="num">Debt service</th>
                <th scope="col" className="num">DSCR</th>
              </tr>
            </thead>
            <tbody>
              {rates.map((rate) => {
                const r = runCorridorModel({ ...inputs, interestRate: rate })
                return (
                  <tr key={rate}>
                    <th scope="row" className="mono">{pct(rate, 1)}</th>
                    <td className="num mono">{m0(r.debtService)}</td>
                    <td className="num mono">{r.dscr === null ? '—' : r.dscr.toFixed(2)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function FundingStructure({ r }: { r: CorridorResult }) {
  const parts = [
    { id: 'equity', label: 'Equity', v: r.funding.equity, note: 'AXION shareholders and strategic investors' },
    { id: 'debt', label: 'Senior debt', v: r.funding.debt, note: `Only with contracted revenue; ${pct(r.inputs.interestRate, 1)} over ${r.inputs.debtTenorYears} years` },
    { id: 'public', label: 'Possible public support', v: r.funding.publicSupport, note: 'Hypothetical grant or concessional finance. Not committed.' },
  ]
  return (
    <div className="cm-block" id="corridor-funding">
      <h4 className="label">Illustrative first-corridor funding structure</h4>
      <div className="fs-bar" role="img" aria-label={parts.map((p) => `${p.label} ${bn(p.v)}`).join(', ')}>
        {parts.map((p) => (
          <span key={p.id} className={`fs-seg fs-${p.id}`} style={{ flexGrow: p.v }} />
        ))}
      </div>
      <ul className="fs-legend">
        {parts.map((p) => (
          <li key={p.id}>
            <i className={`fs-key fs-${p.id}`} aria-hidden="true" />
            <span>
              <strong>{p.label}</strong> <span className="mono">{bn(p.v)}</span> ({pct(p.v / r.capex.total)})
              <span className="small muted"> · {p.note}</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="small muted">
        <KindTag kind="assumption" /> A structure for discussion only. No funding terms, lenders or public support are agreed or committed.
      </p>
    </div>
  )
}
