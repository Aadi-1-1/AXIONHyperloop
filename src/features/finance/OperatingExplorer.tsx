import { useEffect, useId, useMemo, useRef, useState } from 'react'
import {
  operatingBounds,
  operatingDefaults,
  operatingResultLabel,
  scenarioUtilisations,
  type OperatingInputs,
} from '../../data/finance'
import {
  annualCapacityKg,
  clampToBounds,
  kgCompact,
  operatingBreakEven,
  operatingResult,
  pct,
  usdCompact,
  usdPerKg,
} from '../../lib/finance'
import { useReducedMotion } from '../../lib/hooks'
import { KindTag } from '../../components/common'
import './finance.css'

/** Smoothly animates numeric output so readers can see the direction of a change. */
function useTweened(value: number, ms = 450): number {
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(value)
  const from = useRef(value)
  useEffect(() => {
    if (reduced) {
      from.current = value
      return
    }
    const start = performance.now()
    const a = from.current
    let raf = 0
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms)
      const k = 1 - Math.pow(1 - t, 3)
      const v = a + (value - a) * k
      from.current = v
      setShown(v)
      if (t < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [value, ms, reduced])
  return reduced ? value : shown
}

function Slider({
  label,
  value,
  bounds,
  format,
  onChange,
  hint,
}: {
  label: string
  value: number
  bounds: { min: number; max: number; step: number }
  format: (v: number) => string
  onChange: (v: number) => void
  hint: string
}) {
  const id = useId()
  const fill = ((value - bounds.min) / (bounds.max - bounds.min)) * 100
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
        min={bounds.min}
        max={bounds.max}
        step={bounds.step}
        value={value}
        style={{ ['--fill' as string]: `${fill}%` }}
        aria-valuetext={format(value)}
        onChange={(e) => onChange(clampToBounds(Number(e.target.value), bounds))}
      />
      <div className="slider-scale mono">
        <span>{format(bounds.min)}</span>
        <span className="muted">{hint}</span>
        <span>{format(bounds.max)}</span>
      </div>
    </div>
  )
}

const usdM = (v: number) => usdCompact(v, 1)

export default function OperatingExplorer({ compact = false }: { compact?: boolean }) {
  const [inputs, setInputs] = useState<OperatingInputs>(operatingDefaults)
  const result = useMemo(() => operatingResult(inputs), [inputs])
  const be = useMemo(() => operatingBreakEven(inputs), [inputs])
  const isDefault =
    inputs.utilisation === operatingDefaults.utilisation &&
    inputs.pricePerKg === operatingDefaults.pricePerKg &&
    inputs.variableCostPerKg === operatingDefaults.variableCostPerKg

  const tw = {
    kg: useTweened(result.annualKg),
    revenue: useTweened(result.revenue),
    variable: useTweened(result.variableCosts),
    op: useTweened(result.operatingResult),
  }
  const margin = inputs.pricePerKg - inputs.variableCostPerKg
  const set = (patch: Partial<OperatingInputs>) => setInputs((v) => ({ ...v, ...patch }))

  return (
    <div className={`opx${compact ? ' compact' : ''}`}>
      <div className="opx-controls">
        <div className="opx-controls-head">
          <p className="label">Inputs</p>
          <button type="button" className="btn btn-sm" onClick={() => setInputs(operatingDefaults)} disabled={isDefault}>
            Reset to defaults
          </button>
        </div>
        <Slider
          label="Utilisation"
          value={inputs.utilisation}
          bounds={operatingBounds.utilisation}
          format={(v) => pct(v)}
          onChange={(v) => set({ utilisation: v })}
          hint={`default ${pct(operatingDefaults.utilisation)}`}
        />
        <Slider
          label="Average customer charge"
          value={inputs.pricePerKg}
          bounds={operatingBounds.pricePerKg}
          format={usdPerKg}
          onChange={(v) => set({ pricePerKg: v })}
          hint={`default ${usdPerKg(operatingDefaults.pricePerKg)}`}
        />
        <Slider
          label="Variable cost"
          value={inputs.variableCostPerKg}
          bounds={operatingBounds.variableCostPerKg}
          format={usdPerKg}
          onChange={(v) => set({ variableCostPerKg: v })}
          hint={`default ${usdPerKg(operatingDefaults.variableCostPerKg)}`}
        />
        <dl className="opx-fixed">
          <div>
            <dt>Capacity</dt>
            <dd className="mono">{inputs.capacityTonnesPerDay.toLocaleString('en-US')} t/day</dd>
          </div>
          <div>
            <dt>Operating days</dt>
            <dd className="mono">{inputs.operatingDaysPerYear}/year</dd>
          </div>
          <div>
            <dt>Fixed operating costs</dt>
            <dd className="mono">{usdCompact(inputs.annualFixedCosts)}/year</dd>
          </div>
          <div>
            <dt>Contribution margin</dt>
            <dd className={`mono ${margin > 0 ? '' : 'neg'}`}>{margin >= 0 ? usdPerKg(margin) : `−$${Math.abs(margin).toFixed(2)}/kg`}</dd>
          </div>
        </dl>
        <p className="small muted">
          <KindTag kind="assumption" /> Fixed inputs are model assumptions for a hypothetical 100 km freight corridor.
        </p>
      </div>

      <div className="opx-results" aria-live="polite">
        <div className="opx-headline">
          <p className="label">Annual operating result</p>
          <p className={`figure-num opx-big ${result.operatingResult >= 0 ? 'pos' : 'neg'}`}>
            {usdM(tw.op)}
          </p>
          <p className="small muted opx-qualifier">{operatingResultLabel}.</p>
        </div>

        <Waterfall revenue={tw.revenue} variable={tw.variable} fixed={inputs.annualFixedCosts} op={tw.op} />

        <dl className="opx-metrics ruled-grid">
          <div>
            <dt>Annual freight</dt>
            <dd className="mono">{kgCompact(tw.kg)}</dd>
          </div>
          <div>
            <dt>Revenue</dt>
            <dd className="mono">{usdM(tw.revenue)}</dd>
          </div>
          <div>
            <dt>Variable costs</dt>
            <dd className="mono">{usdM(tw.variable)}</dd>
          </div>
          <div>
            <dt>Operating break-even</dt>
            <dd className="mono">
              {be.kind === 'none'
                ? 'None — charge ≤ variable cost'
                : be.withinCapacity
                  ? `${kgCompact(be.annualKg)} · ${pct(be.utilisation, 1)}`
                  : `${pct(be.utilisation, 0)} — beyond capacity`}
            </dd>
          </div>
        </dl>

        {be.kind === 'none' && (
          <p className="notice warn small">
            <span>
              <strong>No finite operating break-even.</strong> Each kilogram costs at least as much to move as it earns, so higher
              volume only increases the loss.
            </span>
          </p>
        )}
        {be.kind === 'finite' && !be.withinCapacity && (
          <p className="notice warn small">
            <span>
              <strong>Break-even exceeds capacity.</strong> The corridor would need more than 100% utilisation to cover fixed
              operating costs at these prices.
            </span>
          </p>
        )}

        <ResultCurve inputs={inputs} />
        {!compact && <ScenarioTable inputs={inputs} />}
      </div>
    </div>
  )
}

function Waterfall({ revenue, variable, fixed, op }: { revenue: number; variable: number; fixed: number; op: number }) {
  const afterVariable = revenue - variable
  const lo = Math.min(0, afterVariable - fixed, afterVariable)
  const hi = Math.max(revenue, 1)
  const pos = (v: number) => ((v - lo) / (hi - lo)) * 100
  const bar = (a: number, b: number) => ({ left: `${pos(Math.min(a, b))}%`, width: `${Math.abs(pos(b) - pos(a))}%` })
  const rows = [
    { label: 'Revenue', amount: revenue, style: bar(0, revenue), cls: 'rev' },
    { label: '− Variable costs', amount: variable, style: bar(afterVariable, revenue), cls: 'cost' },
    { label: '− Fixed costs', amount: fixed, style: bar(afterVariable - fixed, afterVariable), cls: 'cost' },
  ]
  return (
    <div
      className="waterfall"
      role="img"
      aria-label={`Revenue ${usdM(revenue)}, minus variable costs ${usdM(variable)}, minus fixed costs ${usdM(fixed)}, equals ${usdM(op)}.`}
    >
      {rows.map((r) => (
        <div className="wf-row" key={r.label}>
          <span className="wf-label small">{r.label}</span>
          <span className="wf-track">
            <span className="wf-zero" style={{ left: `${pos(0)}%` }} />
            <span className={`wf-bar ${r.cls}`} style={r.style} />
          </span>
          <span className="wf-value mono small">{usdM(r.amount)}</span>
        </div>
      ))}
      <div className="wf-row total">
        <span className="wf-label small">= Operating result</span>
        <span className="wf-track">
          <span className="wf-zero" style={{ left: `${pos(0)}%` }} />
          <span className={`wf-bar ${op >= 0 ? 'pos' : 'neg'}`} style={bar(0, op)} />
        </span>
        <span className={`wf-value mono small ${op >= 0 ? 'pos' : 'neg'}`}>{usdM(op)}</span>
      </div>
    </div>
  )
}

/** Operating result across utilisation 0–100% at the current prices, with break-even and current point. */
function ResultCurve({ inputs }: { inputs: OperatingInputs }) {
  const W = 560
  const H = 220
  const pad = { l: 56, r: 16, t: 16, b: 34 }
  const [hover, setHover] = useState<number | null>(null)
  const at = (u: number) => operatingResult({ ...inputs, utilisation: u }).operatingResult
  const ys = [at(0), at(1), 0]
  let yMin = Math.min(...ys)
  let yMax = Math.max(...ys)
  const span = Math.max(10e6, yMax - yMin)
  yMin -= span * 0.08
  yMax += span * 0.08
  const x = (u: number) => pad.l + u * (W - pad.l - pad.r)
  const y = (v: number) => pad.t + (1 - (v - yMin) / (yMax - yMin)) * (H - pad.t - pad.b)
  const be = operatingBreakEven(inputs)
  const ticks = niceTicks(yMin, yMax, 4)
  const cur = inputs.utilisation
  const hv = hover ?? null

  const onMove = (e: React.PointerEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - rect.left) / rect.width) * W
    const u = Math.min(1, Math.max(0, (px - pad.l) / (W - pad.l - pad.r)))
    setHover(Math.round(u * 100) / 100)
  }

  return (
    <figure className="curve">
      <figcaption className="label">Operating result by utilisation · at current charge and costs</figcaption>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Line chart: operating result rises from ${usdM(at(0))} at 0% utilisation to ${usdM(at(1))} at 100%. ${
          be.kind === 'finite' && be.withinCapacity ? `Break-even at ${pct(be.utilisation, 1)}.` : 'No break-even within capacity.'
        } Current utilisation ${pct(cur)}.`}
        onPointerMove={onMove}
        onPointerLeave={() => setHover(null)}
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} className={t === 0 ? 'c-zero' : 'c-grid'} />
            <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" className="c-tick">
              {usdCompact(t, 0)}
            </text>
          </g>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((u) => (
          <text key={u} x={x(u)} y={H - 10} textAnchor="middle" className="c-tick">
            {pct(u)}
          </text>
        ))}
        {/* loss / surplus regions along the line */}
        <line x1={x(0)} y1={y(at(0))} x2={x(1)} y2={y(at(1))} className="c-line" />
        {be.kind === 'finite' && be.withinCapacity && (
          <g>
            <line x1={x(be.utilisation)} x2={x(be.utilisation)} y1={pad.t} y2={H - pad.b} className="c-be" />
            <text x={x(be.utilisation) + 6} y={pad.t + 12} className="c-annot">
              break-even {pct(be.utilisation, 1)}
            </text>
          </g>
        )}
        {scenarioUtilisations.map((u) => (
          <circle key={u} cx={x(u)} cy={y(at(u))} r={4} className="c-scn" />
        ))}
        <circle cx={x(cur)} cy={y(at(cur))} r={7} className={`c-cur ${at(cur) >= 0 ? 'pos' : 'neg'}`} />
        {hv !== null && (
          <g className="c-hover" pointerEvents="none">
            <line x1={x(hv)} x2={x(hv)} y1={pad.t} y2={H - pad.b} />
            <circle cx={x(hv)} cy={y(at(hv))} r={4} />
            <g transform={`translate(${Math.min(x(hv) + 10, W - 150)},${Math.max(pad.t, y(at(hv)) - 40)})`}>
              <rect width="140" height="36" rx="4" />
              <text x="10" y="15">{pct(hv)} utilisation</text>
              <text x="10" y="29" className="v">{usdM(at(hv))}</text>
            </g>
          </g>
        )}
      </svg>
      <p className="curve-legend small muted">
        <span><i className="lg-cur" /> Current input</span>
        <span><i className="lg-scn" /> Default scenarios (30%, 60%, 85%)</span>
      </p>
    </figure>
  )
}

function ScenarioTable({ inputs }: { inputs: OperatingInputs }) {
  return (
    <div className="table-scroll" tabIndex={0}>
      <table className="data-table scenario-table">
        <caption className="visually-hidden">Operating scenarios at current charge and cost inputs</caption>
        <thead>
          <tr>
            <th scope="col">Utilisation</th>
            <th scope="col" className="num">Annual freight</th>
            <th scope="col" className="num">Revenue</th>
            <th scope="col" className="num">Variable costs</th>
            <th scope="col" className="num">Fixed costs</th>
            <th scope="col" className="num">Operating result</th>
          </tr>
        </thead>
        <tbody>
          {scenarioUtilisations.map((u) => {
            const r = operatingResult({ ...inputs, utilisation: u })
            return (
              <tr key={u}>
                <th scope="row" className="mono">{pct(u)}</th>
                <td className="num mono">{Math.round(r.annualKg / 1e6)}m kg</td>
                <td className="num mono">{usdM(r.revenue)}</td>
                <td className="num mono">{usdM(r.variableCosts)}</td>
                <td className="num mono">{usdM(r.fixedCosts)}</td>
                <td className={`num mono ${r.operatingResult >= 0 ? 'pos' : 'neg'}`}>{usdM(r.operatingResult)}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="small muted" style={{ marginTop: 10 }}>
        Annual capacity {kgCompact(annualCapacityKg(inputs))} at 100% utilisation. <KindTag kind="calculated" />
      </p>
    </div>
  )
}

function niceTicks(min: number, max: number, count: number): number[] {
  const span = max - min
  const raw = span / count
  const mag = Math.pow(10, Math.floor(Math.log10(raw)))
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? raw
  const out: number[] = []
  for (let v = Math.ceil(min / step) * step; v <= max; v += step) out.push(Math.round(v))
  return out
}
