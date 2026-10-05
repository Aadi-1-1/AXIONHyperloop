import { useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import FlatMap from './FlatMap'
import NetworkMap, { type NetworkMapApi } from './NetworkMap'
import { phaseView, type MapMode, type MapView } from './mapView'
import type { LonLat } from './mapRender'
import {
  animatesPods,
  corridorById,
  corridors,
  corridorsForRegion,
  crossingMeta,
  hubById,
  hubs,
  leadCorridor,
  networkDisclaimer,
  phaseExplainer,
  phases,
  regionById,
  regions,
  statusMeta,
  type Corridor,
  type CorridorStatus,
  type PhaseId,
  type RegionId,
  type SystemId,
} from '../../data/network'
import { corridorStraightLineKm, formatCoord, formatKm } from '../../lib/geo'
import { traceJourney, type TraceResult } from '../../lib/trace'
import { useReducedMotion } from '../../lib/hooks'
import { SystemChip } from '../../components/common'
import './network.css'

type View = 'regional' | 'corridor' | 'global'
const statusOrder: CorridorStatus[] = ['lead', 'study', 'expansion', 'conceptual']

export function StatusGlyph({ status }: { status: CorridorStatus }) {
  return (
    <svg width="28" height="10" viewBox="0 0 28 10" aria-hidden="true" className={`status-glyph status-${status}`}>
      {status === 'lead' && <path d="M1 5h26" className="halo" />}
      <path d="M1 5h26" />
    </svg>
  )
}

function framePoints(ids: string[]): LonLat[] {
  return ids.map((id) => [hubById[id].lon, hubById[id].lat] as LonLat)
}

function regionFrame(id: RegionId): LonLat[] {
  return [...regionById[id].frame, ...framePoints(hubs.filter((h) => h.region === id).map((h) => h.id))]
}

export default function NetworkExplorer() {
  const reduced = useReducedMotion()
  const [params, setParams] = useSearchParams()
  const view = (['regional', 'corridor', 'global'].includes(params.get('view') ?? '') ? params.get('view') : 'regional') as View
  const region = (regions.some((r) => r.id === params.get('region')) ? params.get('region') : 'china-sea') as RegionId
  const corridorId = corridorById[params.get('corridor') ?? ''] ? params.get('corridor')! : leadCorridor.id
  const from = hubById[params.get('from') ?? ''] ? params.get('from')! : null
  const to = hubById[params.get('to') ?? ''] ? params.get('to')! : null

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params)
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) next.delete(k)
      else next.set(k, v)
    }
    setParams(next, { replace: true, preventScrollReset: true })
  }

  const [systems, setSystems] = useState<Record<SystemId, boolean>>({ freight: true, passenger: true })
  const [playing, setPlaying] = useState(!reduced)
  const [selectedHub, setSelectedHub] = useState<string | null>(null)

  // Trace form state (applied to the URL on submit).
  const [draftFrom, setDraftFrom] = useState(from ?? 'kunming')
  const [draftTo, setDraftTo] = useState(to ?? 'singapore')
  const trace: TraceResult | null = from && to ? traceJourney(from, to) : null
  const traceSegs = trace && 'segments' in trace ? trace.segments : undefined

  // Global view state.
  const [mode, setMode] = useState<MapMode>('globe')
  const [phaseHi, setPhaseHi] = useState<0 | PhaseId>(0)
  const [globalSel, setGlobalSel] = useState<{ hub: string | null; corridor: string | null }>({ hub: null, corridor: null })
  const [target, setTarget] = useState<{ view: MapView; token: number }>({ view: phaseView(1, 'globe'), token: 0 })
  const mapApi = useRef<NetworkMapApi>(null)
  const go = (v: MapView) => setTarget((t) => ({ view: v, token: t.token + 1 }))

  const openCorridor = (id: string) => {
    setSelectedHub(null)
    update({ view: 'corridor', corridor: id, from: null, to: null })
  }
  const openRegion = (id: RegionId) => {
    setSelectedHub(null)
    update({ view: 'regional', region: id })
  }

  // ---------- Map configuration per view ----------
  const regionCorridors = useMemo(() => corridorsForRegion(region), [region])
  const corridor = corridorById[corridorId]

  let mapEl: React.ReactNode
  if (view === 'regional') {
    const regionHubIds = hubs.filter((h) => h.region === region).map((h) => h.id)
    const extraHubs = [...new Set(regionCorridors.flatMap((c) => c.path))].filter((id) => !regionHubIds.includes(id))
    mapEl = (
      <FlatMap
        frame={regionFrame(region)}
        frameKey={`region-${region}`}
        corridorIds={regionCorridors.map((c) => c.id)}
        hubIds={[...regionHubIds, ...extraHubs]}
        labelHubs={new Set(regionHubIds)}
        systems={systems}
        playing={playing}
        selectedHub={selectedHub}
        onSelectHub={(id) => setSelectedHub(id === selectedHub ? null : id)}
        onSelectCorridor={openCorridor}
        label={`Map of the ${regionById[region].label} regional network: ${regionCorridors.map((c) => c.name).join('; ')}.`}
      />
    )
  } else if (view === 'corridor') {
    const pathIds = traceSegs ? [traceSegs[0].from, ...traceSegs.map((s) => s.to)] : corridor.path
    const shownCorridors = traceSegs ? [...new Set(traceSegs.map((s) => s.corridorId))] : [corridor.id]
    const contextCorridors = corridors.filter((c) => c.path.some((p) => pathIds.includes(p)) && !shownCorridors.includes(c.id) && c.status !== 'conceptual').map((c) => c.id)
    const ends = traceSegs ? new Set([traceSegs[0].from, traceSegs[traceSegs.length - 1].to]) : new Set([corridor.path[0], corridor.path[corridor.path.length - 1]])
    const contextHubs = [...new Set(corridors.filter((c) => contextCorridors.includes(c.id)).flatMap((c) => c.path))].filter((id) => !pathIds.includes(id))
    const noneFrame = trace?.kind === 'none' && from && to ? framePoints([from, to]) : null
    mapEl = (
      <FlatMap
        frame={noneFrame ?? framePoints(pathIds)}
        frameKey={traceSegs ? `trace-${from}-${to}` : noneFrame ? `none-${from}-${to}` : `corridor-${corridor.id}`}
        corridorIds={noneFrame ? corridors.filter((c) => c.path.includes(from!) || c.path.includes(to!)).map((c) => c.id) : [...contextCorridors, ...shownCorridors]}
        emphasis={
          noneFrame
            ? new Set(corridors.filter((c) => c.status !== 'conceptual' && (c.path.includes(from!) || c.path.includes(to!))).map((c) => c.id))
            : new Set(shownCorridors)
        }
        trace={traceSegs}
        hubIds={noneFrame ? [...new Set(corridors.filter((c) => c.path.includes(from!) || c.path.includes(to!)).flatMap((c) => c.path))] : [...pathIds, ...contextHubs]}
        labelHubs={new Set(pathIds)}
        endpoints={noneFrame ? new Set([from!, to!]) : ends}
        systems={systems}
        playing={playing}
        selectedCorridor={traceSegs ? null : corridor.id}
        onSelectCorridor={openCorridor}
        label={traceSegs ? `Traced journey from ${hubById[from!].city} to ${hubById[to!].city}.` : `Map of the ${corridor.name} corridor.`}
      />
    )
  } else {
    mapEl = (
      <NetworkMap
        mode={mode}
        phaseHighlight={phaseHi}
        systems={systems}
        playing={playing}
        selectedHub={globalSel.hub}
        selectedCorridor={globalSel.corridor}
        onSelectHub={(id) => {
          setGlobalSel({ hub: id, corridor: null })
          go({ lon: hubById[id].lon, lat: hubById[id].lat, zoom: mode === 'globe' ? 1.5 : 2.4 })
        }}
        onSelectCorridor={(id) => setGlobalSel({ hub: null, corridor: id })}
        targetView={target.view}
        viewToken={target.token}
        apiRef={mapApi}
        label="Global vision: every proposed and conceptual connection. Use the regional view for readable detail."
      />
    )
  }

  return (
    <div className="explorer">
      <div className="ex-bar">
        <div className="segmented ex-views" role="group" aria-label="Network view">
          {(
            [
              ['regional', 'Regional networks'],
              ['corridor', 'Selected corridor'],
              ['global', 'Global vision'],
            ] as [View, string][]
          ).map(([v, l]) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => update({ view: v })}>
              {l}
            </button>
          ))}
        </div>
        <div className="cluster ex-common" style={{ ['--gap' as string]: '8px' }}>
          {(['freight', 'passenger'] as SystemId[]).map((s) => (
            <button key={s} type="button" className={`toggle ${s}`} aria-pressed={systems[s]} onClick={() => setSystems((v) => ({ ...v, [s]: !v[s] }))}>
              <span className="swatch" aria-hidden="true" />
              {s === 'freight' ? 'Freight' : 'Passenger'}
            </button>
          ))}
          <button
            type="button"
            className="btn btn-sm ex-play"
            aria-pressed={playing}
            onClick={() => setPlaying((p) => !p)}
            disabled={reduced}
            title={reduced ? 'Motion is off because your system prefers reduced motion' : undefined}
          >
            {playing && !reduced ? 'Pause motion' : 'Play motion'}
          </button>
        </div>
      </div>

      <div className="ex-sub" role="group" aria-label="View controls">
        {view === 'regional' && (
          <div className="region-picker">
            {phases.map((p) => (
              <div key={p.id} className="region-group">
                <span className="label">Phase {p.id}</span>
                <div className="cluster" style={{ ['--gap' as string]: '6px' }}>
                  {regions
                    .filter((r) => r.phase === p.id)
                    .map((r) => (
                      <button key={r.id} type="button" className="region-chip" aria-pressed={region === r.id} onClick={() => openRegion(r.id)}>
                        {r.label}
                      </button>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
        {view === 'corridor' && (
          <div className="corridor-controls">
            <div className="field">
              <label htmlFor="ex-corridor">Corridor</label>
              <select id="ex-corridor" className="select" value={traceSegs || trace ? '' : corridorId} onChange={(e) => e.target.value && openCorridor(e.target.value)}>
                {(traceSegs || trace) && <option value="">Showing a traced journey</option>}
                {statusOrder.map((s) => (
                  <optgroup key={s} label={statusMeta[s].short}>
                    {corridors
                      .filter((c) => c.status === s)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <form
              className="trace-form"
              aria-label="Trace this journey"
              onSubmit={(e) => {
                e.preventDefault()
                update({ view: 'corridor', from: draftFrom, to: draftTo })
              }}
            >
              <span className="label trace-title">Trace this journey</span>
              <div className="field">
                <label htmlFor="ex-from">Origin</label>
                <HubSelect id="ex-from" value={draftFrom} onChange={setDraftFrom} />
              </div>
              <button
                type="button"
                className="btn btn-sm btn-ghost swap"
                aria-label="Swap origin and destination"
                onClick={() => {
                  setDraftFrom(draftTo)
                  setDraftTo(draftFrom)
                }}
              >
                ⇄
              </button>
              <div className="field">
                <label htmlFor="ex-to">Destination</label>
                <HubSelect id="ex-to" value={draftTo} onChange={setDraftTo} />
              </div>
              <button type="submit" className="btn btn-sm btn-primary">
                Trace
              </button>
              {trace && (
                <button type="button" className="btn btn-sm btn-ghost" onClick={() => update({ from: null, to: null })}>
                  Clear
                </button>
              )}
            </form>
          </div>
        )}
        {view === 'global' && (
          <div className="cluster global-controls" style={{ ['--gap' as string]: '18px' }}>
            <div className="segmented" role="group" aria-label="Projection">
              <button type="button" aria-pressed={mode === 'globe'} onClick={() => (setMode('globe'), go(phaseView(phaseHi || 1, 'globe')))}>
                Globe
              </button>
              <button type="button" aria-pressed={mode === 'map'} onClick={() => (setMode('map'), go(phaseView(phaseHi || 3, 'map')))}>
                Flat map
              </button>
            </div>
            <div className="segmented" role="group" aria-label="Highlight phase">
              {([0, 1, 2, 3] as (0 | PhaseId)[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={phaseHi === p}
                  onClick={() => {
                    setPhaseHi(p)
                    setGlobalSel({ hub: null, corridor: null })
                    go(phaseView((p || (mode === 'map' ? 3 : 1)) as PhaseId, mode))
                  }}
                >
                  {p === 0 ? 'All phases' : `Phase ${p}`}
                </button>
              ))}
            </div>
            <div className="cluster" style={{ ['--gap' as string]: '6px' }}>
              <button type="button" className="btn btn-sm" onClick={() => mapApi.current?.zoomBy(1.35)} aria-label="Zoom in">
                +
              </button>
              <button type="button" className="btn btn-sm" onClick={() => mapApi.current?.zoomBy(1 / 1.35)} aria-label="Zoom out">
                −
              </button>
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  setGlobalSel({ hub: null, corridor: null })
                  go(phaseView((phaseHi || (mode === 'map' ? 3 : 1)) as PhaseId, mode))
                }}
              >
                Reset view
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="ex-main">
        <div className={`ex-visual view-${view}`}>
          {mapEl}
          <p className="map-caption mono">
            {view === 'global' ? `Proposed connections · not surveyed alignments · drag to ${mode === 'globe' ? 'rotate' : 'pan'}` : 'Proposed connections · not surveyed alignments'}
          </p>
        </div>
        <aside className="ex-panel" aria-live="polite" aria-label="Details">
          {view === 'regional' && <RegionPanel id={region} selectedHub={selectedHub} onOpenCorridor={openCorridor} onSelectHub={setSelectedHub} />}
          {view === 'corridor' && (trace ? <TracePanel result={trace} from={from!} to={to!} onOpenCorridor={openCorridor} /> : <CorridorDetail c={corridor} onOpenRegion={openRegion} />)}
          {view === 'global' && (
            <GlobalPanel
              phase={phaseHi}
              sel={globalSel}
              onOpenCorridor={openCorridor}
              onOpenRegion={openRegion}
              onClear={() => setGlobalSel({ hub: null, corridor: null })}
            />
          )}
        </aside>
      </div>

      <Legend />
    </div>
  )
}

function HubSelect({ id, value, onChange }: { id: string; value: string; onChange: (v: string) => void }) {
  return (
    <select id={id} className="select" value={value} onChange={(e) => onChange(e.target.value)}>
      {regions.map((r) => (
        <optgroup key={r.id} label={r.label}>
          {hubs
            .filter((h) => h.region === r.id)
            .map((h) => (
              <option key={h.id} value={h.id}>
                {h.city}
                {h.role === 'future' ? ' (future hub)' : ''}
              </option>
            ))}
        </optgroup>
      ))}
    </select>
  )
}

export function Legend() {
  return (
    <div className="ex-legend" aria-label="Legend">
      <div>
        <span className="label">Colour = system</span>
        <ul>
          <li>
            <span className="lg-line freight" aria-hidden="true" /> Freight
          </li>
          <li>
            <span className="lg-line passenger" aria-hidden="true" /> Passenger · separate parallel infrastructure
          </li>
        </ul>
      </div>
      <div>
        <span className="label">Line style = development status</span>
        <ul>
          {statusOrder.map((s) => (
            <li key={s}>
              <StatusGlyph status={s} /> {statusMeta[s].short}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <span className="label">Places</span>
        <ul>
          <li>
            <span className="lg-hub" aria-hidden="true" /> Proposed hub
          </li>
          <li>
            <span className="lg-transit" aria-hidden="true" /> Transit-country node
          </li>
          <li>
            <span className="lg-future" aria-hidden="true" /> Future hub (no corridor proposed)
          </li>
        </ul>
      </div>
    </div>
  )
}

function CorridorRow({ c, onOpen }: { c: Corridor; onOpen: (id: string) => void }) {
  return (
    <li>
      <button type="button" onClick={() => onOpen(c.id)}>
        <StatusGlyph status={c.status} />
        <span className="pick-name">{c.name}</span>
        <span className="pick-meta">
          {c.systems.map((sys) => (
            <span key={sys} className={`sys-dot ${sys}`} title={sys} aria-hidden="true" />
          ))}
          <span className="mono">{formatKm(corridorStraightLineKm(c))}</span>
        </span>
        <span className="visually-hidden">
          {statusMeta[c.status].short}, {c.systems.join(' and ')}
        </span>
      </button>
    </li>
  )
}

function RegionPanel({
  id,
  selectedHub,
  onOpenCorridor,
  onSelectHub,
}: {
  id: RegionId
  selectedHub: string | null
  onOpenCorridor: (id: string) => void
  onSelectHub: (id: string | null) => void
}) {
  const r = regionById[id]
  const list = corridorsForRegion(id)
  const regionHubs = hubs.filter((h) => h.region === id)
  const hub = selectedHub ? hubById[selectedHub] : null
  return (
    <div className="detail">
      <span className="label">Phase {r.phase} region</span>
      <h3 className="h3 detail-title">{r.label}</h3>
      <p className="body-2 small">{r.summary}</p>
      {hub && (
        <div className="hub-card">
          <div className="detail-head">
            <strong>{hub.city}</strong>
            <button type="button" className="btn btn-sm btn-ghost" onClick={() => onSelectHub(null)}>
              Close
            </button>
          </div>
          <p className="small muted">
            {hub.country} · <span className="mono">{formatCoord(hub.lat, hub.lon)}</span> · {hub.role === 'hub' ? 'Proposed hub' : hub.role === 'transit' ? 'Transit-country node' : 'Future hub'}
          </p>
          <p className="small body-2">{hub.note}</p>
        </div>
      )}
      <p className="label list-title">Connections</p>
      <ul className="pick-list">
        {statusOrder.flatMap((s) => list.filter((c) => c.status === s)).map((c) => (
          <CorridorRow key={c.id} c={c} onOpen={onOpenCorridor} />
        ))}
      </ul>
      <p className="label list-title" style={{ marginTop: 18 }}>
        Planning cities
      </p>
      <ul className="hub-chips">
        {regionHubs.map((h) => (
          <li key={h.id}>
            <button type="button" className={`hub-chip role-${h.role}`} aria-pressed={selectedHub === h.id} onClick={() => onSelectHub(selectedHub === h.id ? null : h.id)}>
              {h.city}
              {h.role !== 'hub' && <span className="chip-note">{h.role === 'future' ? 'future hub' : 'transit'}</span>}
            </button>
          </li>
        ))}
      </ul>
      <p className="small muted" style={{ marginTop: 16 }}>
        Lines leaving the frame continue to other regions. Select a corridor to open its detail.
      </p>
    </div>
  )
}

export function CorridorDetail({ c, onOpenRegion }: { c: Corridor; onOpenRegion?: (id: RegionId) => void }) {
  const unresolved = c.crossing === 'sea' || c.crossing === 'ocean' || c.status === 'conceptual'
  return (
    <div className="detail">
      <span className={`label status-label status-${c.status}`}>
        <StatusGlyph status={c.status} /> {statusMeta[c.status].label}
      </span>
      <h3 className="h3 detail-title">{c.name}</h3>
      <div className="cluster" style={{ ['--gap' as string]: '6px', margin: '4px 0 16px' }}>
        {c.systems.map((s) => (
          <SystemChip key={s} system={s} />
        ))}
        <span className="chip">Phase {c.phase}</span>
      </div>
      <dl className="kv">
        <div>
          <dt>Approx. geographic distance</dt>
          <dd>
            <span className="mono">{formatKm(corridorStraightLineKm(c))}</span>
            <span className="small muted"> great-circle, city centres</span>
          </dd>
        </div>
        <div>
          <dt>Assumed alignment length</dt>
          <dd>{c.assumedAlignmentKm ? <><span className="mono">{c.assumedAlignmentKm} km</span><span className="small muted"> modelling assumption, not surveyed</span></> : <span className="muted">Not assessed</span>}</dd>
        </div>
        <div>
          <dt>Crossing</dt>
          <dd>{crossingMeta[c.crossing]}</dd>
        </div>
        <div>
          <dt>Stops</dt>
          <dd>{c.path.map((id) => hubById[id].city).join(' → ')}</dd>
        </div>
        <div>
          <dt>Countries</dt>
          <dd>{c.countries.join(', ')}</dd>
        </div>
      </dl>
      <p className="body-2 small">{c.rationale}</p>
      {c.status === 'lead' && (
        <p className="notice info small">
          <span>
            <strong>Scenario model.</strong> Capacity, construction scope and economics for this corridor are modelled in{' '}
            <Link className="text-link" to="/business#corridor-model">
              the Business Model
            </Link>
            .
          </span>
        </p>
      )}
      <details className="disclosure" open>
        <summary>Assumptions</summary>
        <ul className="bullets">
          {c.assumptions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </details>
      <details className="disclosure" open={c.status !== 'lead'}>
        <summary>Constraints</summary>
        <ul className="bullets">
          {c.constraints.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </details>
      {unresolved && (
        <p className="notice warn small">
          <span>No pods are animated on this connection. No service is implied: the engineering is unresolved and it is not costed.</span>
        </p>
      )}
      {!unresolved && !animatesPods(c) && <p className="small muted">No motion shown.</p>}
      {onOpenRegion && c.regions[0] && (
        <button type="button" className="link-button" onClick={() => onOpenRegion(c.regions[0])}>
          View the {regionById[c.regions[0]].label} network
        </button>
      )}
      <p className="small muted">{networkDisclaimer}</p>
    </div>
  )
}

function TracePanel({ result, from, to, onOpenCorridor }: { result: TraceResult; from: string; to: string; onOpenCorridor: (id: string) => void }) {
  const a = hubById[from]
  const b = hubById[to]
  if (result.kind === 'same') return <p className="body-2">Choose two different cities.</p>
  if (result.kind === 'none')
    return (
      <div className="detail">
        <span className="label trace-kind none">No continuous connection</span>
        <h3 className="h3 detail-title">
          {a.city} → {b.city}
        </h3>
        <p className="body-2 small">
          No chain of proposed or conceptual segments connects these cities. AXION does not propose a corridor between these networks, and the map does not bridge the gap.
        </p>
        <p className="label list-title">Reachable from {a.city} on proposed corridors</p>
        <p className="small">{result.reachableFromOrigin.length ? result.reachableFromOrigin.map((id) => hubById[id].city).join(', ') : 'None'}</p>
      </div>
    )
  const stops = [result.segments[0].from, ...result.segments.map((s) => s.to)]
  return (
    <div className="detail">
      <span className={`label trace-kind ${result.kind}`}>
        {result.kind === 'proposed' ? 'Continuous chain of proposed corridors' : `Only via ${result.conceptualCount} conceptual link${result.conceptualCount > 1 ? 's' : ''}`}
      </span>
      <h3 className="h3 detail-title">
        {a.city} → {b.city}
      </h3>
      <p className="small muted">
        {stops.length - 2} intermediate {stops.length - 2 === 1 ? 'stop' : 'stops'} · {formatKm(result.km)} approx. geographic distance (sum of segments, not an alignment)
      </p>
      {result.kind === 'conceptual' && (
        <p className="notice warn small">
          <span>This journey depends on long-term conceptual links with unresolved engineering. It is not a proposed service.</span>
        </p>
      )}
      <ol className="trace-list">
        {result.segments.map((s, i) => (
          <li key={i} className={`status-${s.status}`}>
            <span className="trace-stop">{hubById[s.from].city}</span>
            <button type="button" className="trace-seg" onClick={() => onOpenCorridor(s.corridorId)}>
              <StatusGlyph status={s.status} />
              <span>
                {statusMeta[s.status].short} · {crossingMeta[s.crossing]}
                <span className="mono muted"> {formatKm(s.km)}</span>
              </span>
            </button>
            {i === result.segments.length - 1 && <span className="trace-stop">{hubById[s.to].city}</span>}
          </li>
        ))}
      </ol>
    </div>
  )
}

function GlobalPanel({
  phase,
  sel,
  onOpenCorridor,
  onOpenRegion,
  onClear,
}: {
  phase: 0 | PhaseId
  sel: { hub: string | null; corridor: string | null }
  onOpenCorridor: (id: string) => void
  onOpenRegion: (id: RegionId) => void
  onClear: () => void
}) {
  if (sel.corridor) {
    return (
      <div>
        <button type="button" className="btn btn-sm btn-ghost" onClick={onClear} style={{ marginBottom: 8 }}>
          ← Back to overview
        </button>
        <CorridorDetail c={corridorById[sel.corridor]} onOpenRegion={onOpenRegion} />
        <button type="button" className="btn btn-sm" onClick={() => onOpenCorridor(sel.corridor!)}>
          Open in corridor view
        </button>
      </div>
    )
  }
  if (sel.hub) {
    const hb = hubById[sel.hub]
    return (
      <div className="detail">
        <span className="label">{hb.role === 'hub' ? 'Proposed hub' : hb.role === 'transit' ? 'Transit-country node' : 'Future hub'}</span>
        <h3 className="h3 detail-title">{hb.city}</h3>
        <p className="small muted">
          {hb.country} · <span className="mono">{formatCoord(hb.lat, hb.lon)}</span>
        </p>
        <p className="body-2 small">{hb.note}</p>
        <button type="button" className="link-button" onClick={() => onOpenRegion(hb.region)}>
          View the {regionById[hb.region].label} network
        </button>
        <button type="button" className="btn btn-sm btn-ghost" onClick={onClear}>
          Clear selection
        </button>
      </div>
    )
  }
  const list = phase === 0 ? corridors : corridors.filter((c) => c.phase === phase)
  return (
    <div className="detail">
      <span className="label">{phase === 0 ? 'Long-term global vision' : `Phase ${phase} · ${phases[phase - 1].regions}`}</span>
      <h3 className="h3 detail-title">Ambition, in order. Not a timetable.</h3>
      <p className="body-2 small">{phaseExplainer}</p>
      <dl className="phase-stats ruled-grid">
        {statusOrder.map((s) => (
          <div key={s}>
            <dt>
              <StatusGlyph status={s} /> {statusMeta[s].short}
            </dt>
            <dd className="mono">{list.filter((c) => c.status === s).length}</dd>
          </div>
        ))}
      </dl>
      <p className="small muted">The globe is for orientation. Use Regional networks for readable detail.</p>
      <Link to="/investors#funding-ladder" className="text-link small">
        How geographic phases differ from funding stages
      </Link>
    </div>
  )
}
