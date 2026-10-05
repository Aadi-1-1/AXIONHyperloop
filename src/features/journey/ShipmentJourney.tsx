import { useState, type KeyboardEvent } from 'react'
import { journeyStages, journeyTimeNote } from '../../data/journey'
import './journey.css'

export default function ShipmentJourney({ compact = false }: { compact?: boolean }) {
  const [index, setIndex] = useState(0)
  const [crossBorder, setCrossBorder] = useState(true)
  const stage = journeyStages[index]
  const last = journeyStages.length - 1

  const onTrackKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      setIndex((i) => Math.min(last, i + 1))
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      setIndex((i) => Math.max(0, i - 1))
    }
  }

  // Time bar: stage weights + customs blocks on cross-border shipments (illustrative proportions).
  type Segment = { key: string; stageIndex: number; weight: number; kind: string; label: string }
  const segments = journeyStages.flatMap((s): Segment[] => {
    const base: Segment[] = [{ key: s.id, stageIndex: s.index - 1, weight: s.timeWeight, kind: s.where, label: s.name }]
    if (crossBorder && s.customs) base.push({ key: `${s.id}-customs`, stageIndex: s.index - 1, weight: 1.2, kind: 'customs', label: 'Customs' })
    return base
  })
  const total = segments.reduce((a, b) => a + b.weight, 0)
  const pos = (index / last) * 100

  return (
    <div className={`journey${compact ? ' compact' : ''}`}>
      <div className="journey-top">
        <div className="journey-track" role="group" aria-label="Shipment journey stages" onKeyDown={onTrackKey}>
          <div className="jt-line" aria-hidden="true">
            {journeyStages.slice(0, -1).map((s, i) => {
              const next = journeyStages[i + 1]
              const kind = s.where === 'tube' || next.where === 'tube' ? 'tube' : s.where === 'outside' || next.where === 'outside' ? 'road' : 'terminal'
              return <span key={s.id} className={`jt-seg ${kind}${i < index ? ' done' : ''}`} />
            })}
          </div>
          <span className="jt-parcel" style={{ left: `${pos}%` }} aria-hidden="true" />
          <ol className="jt-nodes">
            {journeyStages.map((s, i) => (
              <li key={s.id} style={{ left: `${(i / last) * 100}%` }}>
                <button
                  type="button"
                  className={`jt-node where-${s.where}${i === index ? ' current' : ''}${i < index ? ' done' : ''}`}
                  aria-pressed={i === index}
                  aria-label={`Stage ${s.index}: ${s.name}`}
                  onClick={() => setIndex(i)}
                >
                  <span className="mono">{s.index}</span>
                </button>
                <span className={`jt-label${i === index ? ' current' : ''}`} aria-hidden="true">
                  {s.name}
                </span>
                {crossBorder && s.customs && (
                  <span className="jt-customs mono" aria-hidden="true">
                    Customs
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="journey-body">
        <div className="journey-detail" aria-live="polite">
          <div className="cluster" style={{ ['--gap' as string]: '8px' }}>
            <span className="label">
              Stage {stage.index} of {journeyStages.length}
            </span>
            <span className={`chip${stage.operator === 'AXION' ? ' freight' : ''}`}>
              {stage.operator === 'AXION' ? 'Operated by AXION' : 'Existing logistics partner'}
            </span>
          </div>
          <h3 className="h3 jd-title">{stage.name}</h3>
          <p className="jd-summary">{stage.summary}</p>
          <p className="body-2 small">{stage.detail}</p>
          <ul className="jd-checks">
            {stage.checks.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
          {stage.customs && (
            <p className={`notice small ${crossBorder ? 'warn' : ''}`}>
              <span>
                <strong>{crossBorder ? 'Customs and inspection. ' : 'Domestic shipment — no customs at this stage. '}</strong>
                {crossBorder ? stage.customs : 'Switch to a cross-border shipment to see customs steps.'}
              </span>
            </p>
          )}
          <div className="jd-controls">
            <button type="button" className="btn btn-sm" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
              ← Previous
            </button>
            <button type="button" className="btn btn-sm btn-primary" onClick={() => setIndex((i) => Math.min(last, i + 1))} disabled={index === last}>
              Next stage →
            </button>
            <button type="button" className="toggle" aria-pressed={crossBorder} onClick={() => setCrossBorder((v) => !v)}>
              <span className="swatch" aria-hidden="true" style={{ background: 'var(--passenger)' }} />
              Cross-border shipment
            </button>
          </div>
        </div>

        <div className="journey-time">
          <p className="label">Where the time goes · illustrative</p>
          <div className="jtime-bar" role="img" aria-label="Illustrative breakdown of complete shipment time. Tube travel is one segment among collection, terminal handling, checks, customs and delivery.">
            {segments.map((s) => (
              <span
                key={s.key}
                className={`jtime-seg k-${s.kind}${s.stageIndex === index ? ' current' : ''}`}
                style={{ flexGrow: s.weight, flexBasis: 0 }}
                title={s.label}
              />
            ))}
          </div>
          <div className="jtime-legend small">
            <span><i className="k-outside" /> Partner collection &amp; delivery</span>
            <span><i className="k-terminal" /> Terminal handling &amp; checks</span>
            {crossBorder && <span><i className="k-customs" /> Customs</span>}
            <span><i className="k-tube" /> Inside the tube</span>
          </div>
          <div className="jtime-compare">
            <div>
              <span className="label">In-tube travel</span>
              <span className="jtime-bracket tube" style={{ width: `${(1 / total) * 100}%` }} />
            </div>
            <div>
              <span className="label">Complete shipment time</span>
              <span className="jtime-bracket" style={{ width: '100%' }} />
            </div>
          </div>
          <p className="small muted">{journeyTimeNote}</p>
        </div>
      </div>
    </div>
  )
}
