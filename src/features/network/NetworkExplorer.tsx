import { useMemo, useRef, useState } from 'react'
import NetworkMap, { type NetworkMapApi } from './NetworkMap'
import { phaseView, type MapMode, type MapView } from './mapView'
import {
  animatesPods,
  corridors,
  crossingMeta,
  hubById,
  hubs,
  networkDisclaimer,
  phases,
  statusMeta,
  type Corridor,
  type CorridorStatus,
  type PhaseId,
  type SystemId,
} from '../../data/network'
import { corridorStraightLineKm, formatCoord, formatKm } from '../../lib/geo'
import { useReducedMotion } from '../../lib/hooks'
import { SystemChip } from '../../components/common'
import './network.css'

const statuses: CorridorStatus[] = ['study', 'expansion', 'conceptual']

function StatusGlyph({ status }: { status: CorridorStatus }) {
  return (
    <svg width="26" height="8" viewBox="0 0 26 8" aria-hidden="true" className={`status-glyph status-${status}`}>
      <path d="M1 4h24" />
    </svg>
  )
}

function midpoint(c: Corridor): { lon: number; lat: number } {
  const a = hubById[c.path[0]]
  const b = hubById[c.path[c.path.length - 1]]
  let dLon = b.lon - a.lon
  if (dLon > 180) dLon -= 360
  if (dLon < -180) dLon += 360
  return { lon: a.lon + dLon / 2, lat: (a.lat + b.lat) / 2 }
}

export default function NetworkExplorer() {
  const reduced = useReducedMotion()
  const [phase, setPhase] = useState<PhaseId>(1)
  const [mode, setMode] = useState<MapMode>('globe')
  const [systems, setSystems] = useState<Record<SystemId, boolean>>({ freight: true, passenger: true })
  const [playing, setPlaying] = useState(!reduced)
  const [selectedHub, setSelectedHub] = useState<string | null>(null)
  const [selectedCorridor, setSelectedCorridor] = useState<string | null>(null)
  const [target, setTarget] = useState<{ view: MapView; token: number }>({ view: phaseView(1, 'globe'), token: 0 })
  const mapApi = useRef<NetworkMapApi>(null)

  const go = (view: MapView) => setTarget((t) => ({ view, token: t.token + 1 }))

  const changePhase = (p: PhaseId) => {
    setPhase(p)
    if (selectedHub && hubById[selectedHub].phase > p) setSelectedHub(null)
    if (selectedCorridor && corridors.find((c) => c.id === selectedCorridor)!.phase > p) setSelectedCorridor(null)
    go(phaseView(p, mode))
  }
  const changeMode = (m: MapMode) => {
    setMode(m)
    go(phaseView(phase, m))
  }
  const selectCorridor = (id: string) => {
    const c = corridors.find((x) => x.id === id)!
    if (c.phase > phase) setPhase(c.phase)
    setSelectedCorridor(id)
    setSelectedHub(null)
    const mid = midpoint(c)
    const base = phaseView(Math.max(phase, c.phase) as PhaseId, mode)
    go({ lon: mid.lon, lat: mid.lat, zoom: c.status === 'conceptual' ? Math.min(base.zoom, mode === 'globe' ? 1 : 1.3) : base.zoom })
  }
  const selectHub = (id: string) => {
    const hb = hubById[id]
    if (hb.phase > phase) setPhase(hb.phase)
    setSelectedHub(id)
    setSelectedCorridor(null)
    go({ lon: hb.lon, lat: hb.lat, zoom: phaseView(Math.max(phase, hb.phase) as PhaseId, mode).zoom })
  }
  const reset = () => {
    setSelectedHub(null)
    setSelectedCorridor(null)
    go(phaseView(phase, mode))
  }

  const visibleCorridors = useMemo(() => corridors.filter((c) => c.phase <= phase), [phase])
  const visibleHubs = useMemo(() => hubs.filter((h) => h.phase <= phase), [phase])
  const corridor = selectedCorridor ? corridors.find((c) => c.id === selectedCorridor) ?? null : null
  const hub = selectedHub ? hubById[selectedHub] : null
  const phaseInfo = phases.find((p) => p.id === phase)!

  const mapLabel = `Proposed AXION network map showing ${phases
    .filter((p) => p.id <= phase)
    .map((p) => p.regions)
    .join('; ')}. ${visibleHubs.length} planning cities and ${visibleCorridors.length} proposed connections. Use the lists beside the map to select hubs and corridors.`

  return (
    <div className="explorer">
      <div className="explorer-controls" role="group" aria-label="Network controls">
        <div className="control-block">
          <span className="label" id="phase-label">
            Geographic phase
          </span>
          <div className="segmented" role="group" aria-labelledby="phase-label">
            {phases.map((p) => (
              <button key={p.id} type="button" aria-pressed={phase === p.id} onClick={() => changePhase(p.id)}>
                <span className="mono">{p.id}</span>&nbsp; {p.regions}
              </button>
            ))}
          </div>
        </div>
        <div className="control-row">
          <div className="control-block">
            <span className="label">Systems</span>
            <div className="cluster" style={{ ['--gap' as string]: '8px' }}>
              {(['freight', 'passenger'] as SystemId[]).map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`toggle ${s}`}
                  aria-pressed={systems[s]}
                  onClick={() => setSystems((v) => ({ ...v, [s]: !v[s] }))}
                >
                  <span className="swatch" aria-hidden="true" />
                  {s === 'freight' ? 'Freight' : 'Passenger'}
                </button>
              ))}
            </div>
          </div>
          <div className="control-block">
            <span className="label">View</span>
            <div className="segmented" role="group" aria-label="Map view">
              <button type="button" aria-pressed={mode === 'globe'} onClick={() => changeMode('globe')}>
                Globe
              </button>
              <button type="button" aria-pressed={mode === 'map'} onClick={() => changeMode('map')}>
                Flat map
              </button>
            </div>
          </div>
          <div className="control-block">
            <span className="label">Motion &amp; view</span>
            <div className="cluster" style={{ ['--gap' as string]: '6px' }}>
              <button
                type="button"
                className="btn btn-sm"
                aria-pressed={playing}
                onClick={() => setPlaying((p) => !p)}
                disabled={reduced}
                title={reduced ? 'Motion is off because your system prefers reduced motion' : undefined}
              >
                {playing && !reduced ? (
                  <>
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 2h2v8H3zM7 2h2v8H7z" fill="currentColor" /></svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 1.5v9l7-4.5z" fill="currentColor" /></svg>
                    Play
                  </>
                )}
              </button>
              <button type="button" className="btn btn-sm" onClick={() => mapApi.current?.zoomBy(1.35)} aria-label="Zoom in">
                +
              </button>
              <button type="button" className="btn btn-sm" onClick={() => mapApi.current?.zoomBy(1 / 1.35)} aria-label="Zoom out">
                −
              </button>
              <button type="button" className="btn btn-sm" onClick={reset}>
                Reset view
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="explorer-main">
        <div className="explorer-visual">
          <NetworkMap
            mode={mode}
            phase={phase}
            systems={systems}
            playing={playing}
            selectedHub={selectedHub}
            selectedCorridor={selectedCorridor}
            onSelectHub={selectHub}
            onSelectCorridor={selectCorridor}
            targetView={target.view}
            viewToken={target.token}
            label={mapLabel}
            apiRef={mapApi}
          />
          <p className="map-caption mono">
            Proposed connections · not surveyed alignments · drag to {mode === 'globe' ? 'rotate' : 'pan'}
          </p>
          <ul className="map-legend" aria-label="Legend">
            <li><span className="lg-line freight" aria-hidden="true" /> Freight system</li>
            <li><span className="lg-line passenger" aria-hidden="true" /> Passenger system (separate infrastructure)</li>
            <li><StatusGlyph status="study" /> Under study</li>
            <li><StatusGlyph status="expansion" /> Regional expansion</li>
            <li><StatusGlyph status="conceptual" /> Conceptual</li>
            <li><span className="lg-hub" aria-hidden="true" /> Proposed hub</li>
            <li><span className="lg-transit" aria-hidden="true" /> Transit-country node</li>
          </ul>
        </div>

        <aside className="explorer-panel" aria-live="polite" aria-label="Selection details">
          {corridor ? (
            <CorridorDetail c={corridor} onSelectHub={selectHub} onClose={reset} />
          ) : hub ? (
            <div className="detail">
              <div className="detail-head">
                <span className="label">{hub.role === 'hub' ? 'Proposed hub' : 'Transit-country planning node'}</span>
                <button type="button" className="btn btn-sm btn-ghost" onClick={reset} aria-label="Clear selection">
                  Clear
                </button>
              </div>
              <h3 className="h3">{hub.city}</h3>
              <p className="detail-sub">
                {hub.country} · Phase {hub.phase} · <span className="mono">{formatCoord(hub.lat, hub.lon)}</span>
              </p>
              <p className="body-2">{hub.note}</p>
              <p className="notice small">
                Planning assumption: a representative city for the region, not a selected terminal site.
              </p>
              <p className="label" style={{ marginTop: 20 }}>
                Connections
              </p>
              <ul className="detail-links">
                {corridors
                  .filter((c) => c.path.includes(hub.id))
                  .map((c) => (
                    <li key={c.id}>
                      <button type="button" className="link-button" onClick={() => selectCorridor(c.id)}>
                        <StatusGlyph status={c.status} /> {c.name}
                        <span className="muted small"> · Phase {c.phase}</span>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ) : (
            <div className="detail">
              <span className="label">Phase {phase} overview</span>
              <h3 className="h3" style={{ marginTop: 8 }}>
                {phaseInfo.regions}
              </h3>
              <dl className="phase-stats ruled-grid">
                {statuses.map((s) => (
                  <div key={s}>
                    <dt>
                      <StatusGlyph status={s} /> {statusMeta[s].short}
                    </dt>
                    <dd className="mono">{visibleCorridors.filter((c) => c.status === s).length}</dd>
                  </div>
                ))}
              </dl>
              <p className="notice warn small">
                <span>
                  <strong>No launch corridor has been selected.</strong> Three candidate corridors in Phase 1 would be compared in
                  the feasibility programme.
                </span>
              </p>
              <p className="small muted" style={{ marginTop: 16 }}>
                Select a corridor or hub from the lists or the map to read its assumptions and constraints. Phases are
                cumulative and describe an order of ambition, not a timetable.
              </p>
            </div>
          )}
        </aside>
      </div>

      <div className="explorer-lists">
        <div>
          <h3 className="label list-title">Corridors · {phase > 1 ? `Phases 1–${phase}` : 'Phase 1'}</h3>
          {statuses.map((s) => {
            const list = visibleCorridors.filter((c) => c.status === s)
            if (!list.length) return null
            return (
              <div key={s} className="list-group">
                <p className="list-group-title">
                  <StatusGlyph status={s} /> {statusMeta[s].label}
                </p>
                <ul className="pick-list">
                  {list.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        aria-pressed={selectedCorridor === c.id}
                        onClick={() => (selectedCorridor === c.id ? reset() : selectCorridor(c.id))}
                      >
                        <span className="pick-name">{c.name}</span>
                        <span className="pick-meta">
                          {c.systems.map((sys) => (
                            <span key={sys} className={`sys-dot ${sys}`} title={sys} aria-hidden="true" />
                          ))}
                          <span className="mono">{formatKm(corridorStraightLineKm(c))}</span>
                        </span>
                        <span className="visually-hidden">
                          {c.systems.join(' and ')}, phase {c.phase}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
        <div>
          <h3 className="label list-title">Planning cities</h3>
          {phases
            .filter((p) => p.id <= phase)
            .map((p) => (
              <div key={p.id} className="list-group">
                <p className="list-group-title">
                  Phase {p.id} · {p.regions}
                </p>
                <ul className="hub-chips">
                  {visibleHubs
                    .filter((h) => h.phase === p.id)
                    .map((h) => (
                      <li key={h.id}>
                        <button
                          type="button"
                          aria-pressed={selectedHub === h.id}
                          className={`hub-chip role-${h.role}`}
                          onClick={() => (selectedHub === h.id ? reset() : selectHub(h.id))}
                        >
                          {h.city}
                          {h.role === 'transit' && <span className="visually-hidden"> (transit-country node)</span>}
                        </button>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          <p className="small muted" style={{ marginTop: 16 }}>
            Rendered as vector graphics — no WebGL required. The lists provide full access to the map’s content.
          </p>
        </div>
      </div>
    </div>
  )
}

function CorridorDetail({ c, onSelectHub, onClose }: { c: Corridor; onSelectHub: (id: string) => void; onClose: () => void }) {
  const unresolved = c.crossing === 'sea' || c.crossing === 'ocean'
  return (
    <div className="detail">
      <div className="detail-head">
        <span className={`label status-label status-${c.status}`}>
          <StatusGlyph status={c.status} /> {statusMeta[c.status].label}
        </span>
        <button type="button" className="btn btn-sm btn-ghost" onClick={onClose} aria-label="Clear selection">
          Clear
        </button>
      </div>
      <h3 className="h3">{c.name}</h3>
      <div className="cluster" style={{ ['--gap' as string]: '6px', margin: '12px 0 16px' }}>
        {c.systems.map((s) => (
          <SystemChip key={s} system={s} />
        ))}
        <span className="chip">Phase {c.phase}</span>
      </div>
      <dl className="kv">
        <div>
          <dt>Straight-line distance</dt>
          <dd className="mono">{formatKm(corridorStraightLineKm(c))}</dd>
        </div>
        <div>
          <dt>Crossing</dt>
          <dd>{crossingMeta[c.crossing]}</dd>
        </div>
        <div>
          <dt>Countries</dt>
          <dd>{c.countries.join(', ')}</dd>
        </div>
        <div>
          <dt>Route</dt>
          <dd>
            {c.path.map((id, i) => (
              <span key={id}>
                {i > 0 && <span className="muted"> → </span>}
                <button type="button" className="link-button inline" onClick={() => onSelectHub(id)}>
                  {hubById[id].city}
                </button>
              </span>
            ))}
          </dd>
        </div>
      </dl>
      <p className="body-2">{c.rationale}</p>
      <p className="small muted">{statusMeta[c.status].description}</p>
      <details className="disclosure" open>
        <summary>Assumptions</summary>
        <ul className="bullets">
          {c.assumptions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </details>
      <details className="disclosure" open>
        <summary>Constraints</summary>
        <ul className="bullets">
          {c.constraints.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </details>
      {(!animatesPods(c) || unresolved) && (
        <p className="notice warn small">
          <span>
            No pods are animated on this connection: {unresolved ? 'the crossing is unresolved' : 'it is a long-term concept'}, and
            no infrastructure exists or is planned.
          </span>
        </p>
      )}
      <p className="notice small" style={{ marginTop: 12 }}>
        {networkDisclaimer}
      </p>
    </div>
  )
}
