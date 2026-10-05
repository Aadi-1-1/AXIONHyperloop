import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { geoMercator, geoPath, type GeoProjection } from 'd3-geo'
import { animatesPods, corridorById, hubById, type CorridorStatus, type SystemId } from '../../data/network'
import { useAnimationFrame, useElementSize, useInView, useReducedMotion } from '../../lib/hooks'
import type { Segment } from '../../lib/trace'
import { borders, land } from './geography'
import { lineToPath, placeLabels, pointAt, samplesById, screenLine, type LonLat, type ScreenLine } from './mapRender'
import './network.css'

type Camera = { lon: number; lat: number; scale: number }

/** Timings, prototyped separately: camera moves are slower than UI feedback, drawing follows the camera. */
export const MAP_TIMING = { cameraMin: 0.7, cameraMax: 1.5, drawMin: 0.7, drawMax: 1.6, settle: 0.45, podLap: 7 }

function circularMeanLon(lons: number[]) {
  const s = lons.reduce((a, l) => a + Math.sin((l * Math.PI) / 180), 0)
  const c = lons.reduce((a, l) => a + Math.cos((l * Math.PI) / 180), 0)
  return (Math.atan2(s, c) * 180) / Math.PI
}

function fitCamera(frame: LonLat[], w: number, h: number, pad: number): Camera {
  const lon0 = circularMeanLon(frame.map((p) => p[0]))
  const p = geoMercator()
    .rotate([-lon0, 0])
    .fitExtent(
      [
        [pad, pad],
        [w - pad, h - pad],
      ],
      { type: 'MultiPoint', coordinates: frame },
    )
  const c = p.invert!([w / 2, h / 2])!
  return { lon: c[0], lat: c[1], scale: p.scale() }
}

function makeProjection(cam: Camera, w: number, h: number): GeoProjection {
  return geoMercator()
    .rotate([-cam.lon, 0])
    .center([0, cam.lat])
    .scale(cam.scale)
    .translate([w / 2, h / 2])
    .clipExtent([
      [-20, -20],
      [w + 20, h + 20],
    ])
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const shortestLon = (from: number, to: number) => ((((to - from) % 360) + 540) % 360) - 180

export type FlatMapProps = {
  frame: LonLat[]
  frameKey: string
  corridorIds: string[]
  /** Emphasised corridors are drawn progressively and carry motion; others are faint context. */
  emphasis?: Set<string>
  hubIds: string[]
  labelHubs?: Set<string>
  endpoints?: Set<string>
  trace?: Segment[]
  systems: Record<SystemId, boolean>
  playing: boolean
  onSelectCorridor?: (id: string) => void
  onSelectHub?: (id: string) => void
  selectedCorridor?: string | null
  selectedHub?: string | null
  compact?: boolean
  label: string
  className?: string
  padding?: number
}

const statusRank: Record<CorridorStatus, number> = { conceptual: 0, expansion: 1, study: 2, lead: 3 }

export default function FlatMap({
  frame,
  frameKey,
  corridorIds,
  emphasis,
  hubIds,
  labelHubs,
  endpoints,
  trace,
  systems,
  playing,
  onSelectCorridor,
  onSelectHub,
  selectedCorridor,
  selectedHub,
  compact = false,
  label,
  className,
  padding,
}: FlatMapProps) {
  const reduced = useReducedMotion()
  const [wrapRef, size] = useElementSize<HTMLDivElement>()
  const inView = useInView(wrapRef, '80px')
  const uid = useId().replace(/:/g, '')
  const { width: w, height: h } = size
  const ready = w > 0 && h > 0
  const pad = padding ?? (compact ? 26 : Math.max(48, Math.min(w, h) * 0.12))

  const target = useMemo(() => (ready ? fitCamera(frame, w, h, pad) : null), [ready, frame, w, h, pad])
  const [cam, setCam] = useState<Camera | null>(null)
  const tween = useRef<{ from: Camera; to: Camera; t: number; dur: number } | null>(null)
  const [moving, setMoving] = useState(false)
  const [drawStart, setDrawStart] = useState(0)
  const [time, setTime] = useState(0)
  const camRef = useRef<Camera | null>(null)
  useEffect(() => {
    camRef.current = cam
  }, [cam])

  // Start a camera move when the frame changes (or snap on first layout / reduced motion).
  const [seenKey, setSeenKey] = useState<string | null>(null)
  if (target && seenKey !== `${frameKey}|${w}x${h}`) {
    const resizeOnly = seenKey?.split('|')[0] === frameKey
    setSeenKey(`${frameKey}|${w}x${h}`)
    if (!cam || reduced || resizeOnly || compact) {
      setCam(target)
      setMoving(false)
    } else {
      setMoving(true)
    }
    setDrawStart(time)
  }
  useEffect(() => {
    if (!moving || !target || !camRef.current) return
    const from = camRef.current
    const zoomRatio = Math.abs(Math.log(target.scale / from.scale))
    const dist = Math.hypot(shortestLon(from.lon, target.lon), target.lat - from.lat)
    const dur = Math.min(MAP_TIMING.cameraMax, Math.max(MAP_TIMING.cameraMin, 0.5 + zoomRatio * 0.35 + dist / 120))
    tween.current = { from, to: target, t: 0, dur }
  }, [moving, target])

  useAnimationFrame(moving, (dt) => {
    const tw = tween.current
    if (!tw) return
    tw.t = Math.min(1, tw.t + dt / tw.dur)
    const k = ease(tw.t)
    setCam({
      lon: tw.from.lon + shortestLon(tw.from.lon, tw.to.lon) * k,
      lat: tw.from.lat + (tw.to.lat - tw.from.lat) * k,
      scale: Math.exp(Math.log(tw.from.scale) + (Math.log(tw.to.scale) - Math.log(tw.from.scale)) * k),
    })
    if (tw.t >= 1) {
      tween.current = null
      setMoving(false)
      setDrawStart(time)
    }
  })

  // Clock drives drawing reveal and pods. It stops when off-screen or paused.
  const animate = !reduced && !compact && inView
  useAnimationFrame(animate && (playing || time - drawStart < 4), (dt) => setTime((t) => t + dt))

  const projection = useMemo(() => (ready && cam ? makeProjection(cam, w, h) : null), [ready, cam, w, h])

  // Zoomed views swap in 1:50m coastlines once the camera has settled.
  const needDetail = !!target && target.scale > 2000
  const [detail, setDetail] = useState<{ land: typeof land; borders: typeof borders } | null>(null)
  useEffect(() => {
    if (!needDetail || detail) return
    let live = true
    import('./geography50').then((m) => live && setDetail({ land: m.land, borders: m.borders }))
    return () => {
      live = false
    }
  }, [needDetail, detail])
  const useDetail = needDetail && !!detail && !moving

  const base = useMemo(() => {
    if (!projection) return null
    const path = geoPath(projection)
    const g = useDetail && detail ? detail : { land, borders }
    return { land: path(g.land) ?? '', borders: path(g.borders) ?? '' }
  }, [projection, useDetail, detail])

  const traceIds = useMemo(() => new Set(trace?.map((s) => s.corridorId) ?? []), [trace])
  const emph = (id: string) => (trace ? traceIds.has(id) : !emphasis || emphasis.has(id))

  const lines = useMemo(() => {
    if (!projection) return []
    const out: { id: string; system: SystemId; status: CorridorStatus; line: ScreenLine; d: string; emphasised: boolean }[] = []
    for (const id of corridorIds) {
      const c = corridorById[id]
      const both = c.systems.includes('freight') && c.systems.includes('passenger') && systems.freight && systems.passenger
      for (const s of c.systems) {
        if (!systems[s]) continue
        const off = both ? (s === 'freight' ? -3 : 3) : 0
        const line = screenLine(samplesById[id], projection, { offset: off, taperPx: compact ? 10 : 22 })
        out.push({ id, system: s, status: c.status, line, d: lineToPath(line), emphasised: emph(id) })
      }
    }
    return out.sort((a, b) => Number(a.emphasised) - Number(b.emphasised) || statusRank[a.status] - statusRank[b.status])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projection, corridorIds, systems, emphasis, traceIds, compact])

  // Draw-reveal timing for emphasised routes (sequential along a traced journey).
  const drawTiming = useMemo(() => {
    const m = new Map<string, { delay: number; dur: number }>()
    let t = 0
    const order = trace ? trace.map((s) => s.corridorId) : lines.filter((l) => l.emphasised).map((l) => l.id)
    for (const id of [...new Set(order)]) {
      const len = Math.max(...lines.filter((l) => l.id === id).map((l) => l.line.length), 0)
      const dur = Math.min(MAP_TIMING.drawMax, Math.max(MAP_TIMING.drawMin, len / 420))
      m.set(id, { delay: trace ? t : 0, dur })
      t += trace ? dur * 0.85 : 0
    }
    return m
  }, [lines, trace])
  const drawEnd = Math.max(0, ...[...drawTiming.values()].map((v) => v.delay + v.dur))
  const elapsed = time - drawStart
  const settled = reduced || compact || (!moving && elapsed > drawEnd + MAP_TIMING.settle)
  const reveal = (id: string) => {
    if (reduced || compact) return 1
    if (moving) return 0
    const tm = drawTiming.get(id)
    if (!tm) return 1
    const k = Math.max(0, Math.min(1, (elapsed - tm.delay) / tm.dur))
    return ease(k)
  }

  const hubPts = useMemo(() => {
    if (!projection) return []
    return hubIds
      .map((id) => {
        const hb = hubById[id]
        const p = projection([hb.lon, hb.lat])
        return p && p[0] > -10 && p[0] < w + 10 && p[1] > -10 && p[1] < h + 10 ? { id, x: p[0], y: p[1] } : null
      })
      .filter((x): x is { id: string; x: number; y: number } => !!x)
  }, [projection, hubIds, w, h])

  const labels = useMemo(() => {
    const cands = hubPts.map((p) => {
      const forced = !!labelHubs?.has(p.id) || !!endpoints?.has(p.id) || p.id === selectedHub
      return { id: p.id, x: p.x, y: p.y, text: hubById[p.id].city, priority: endpoints?.has(p.id) ? 0 : forced ? 1 : 5, force: forced }
    })
    return placeLabels(cands, hubPts.map((p) => ({ x: p.x, y: p.y, r: endpoints?.has(p.id) ? 9 : 5 })), { w, h }, compact ? 6 : 6.7)
  }, [hubPts, labelHubs, endpoints, selectedHub, w, h, compact])

  // Mid-line annotations for emphasised conceptual links, placed clear of labels, other routes and the frame edge.
  const notes = useMemo(() => {
    if (compact) return []
    const others = lines.filter((l) => l.status !== 'conceptual').flatMap((l) => l.line.pts.filter((p, i): p is [number, number] => !!p && i % 2 === 0))
    const seen = new Set<string>()
    const out: { id: string; x: number; y: number; text: string }[] = []
    for (const l of lines) {
      if (!l.emphasised || l.status !== 'conceptual' || seen.has(l.id)) continue
      seen.add(l.id)
      const c = corridorById[l.id]
      const text = c.crossing === 'sea' ? 'Conceptual sea link · engineering unresolved' : c.crossing === 'ocean' ? 'Conceptual ocean link · no feasible alignment' : 'Conceptual link · route not identified'
      const tw = text.length * 6.4
      for (const f of [0.5, 0.42, 0.58, 0.34, 0.66, 0.26, 0.74]) {
        const p = pointAt(l.line, f)
        if (!p) continue
        const box = { x: p[0] - tw / 2, y: p[1] - 22, w: tw, h: 16 }
        if (box.x < 6 || box.x + box.w > w - 6 || box.y < 20 || box.y + box.h > h - 6) continue
        const hitsLabel = labels.some((lb) => box.x < lb.box.x + lb.box.w && box.x + box.w > lb.box.x && box.y < lb.box.y + lb.box.h && box.y + box.h > lb.box.y)
        const hitsLine = others.some((q) => q[0] > box.x - 6 && q[0] < box.x + box.w + 6 && q[1] > box.y - 6 && q[1] < box.y + box.h + 10)
        if (hitsLabel || hitsLine) continue
        out.push({ id: l.id, x: p[0], y: p[1], text })
        break
      }
    }
    return out
  }, [lines, labels, compact, w, h])

  return (
    <div ref={wrapRef} className={`flat-map${compact ? ' compact' : ''}${className ? ` ${className}` : ''}`}>
      {ready && base && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
          <defs>
            <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.2" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <rect width={w} height={h} className="fm-sea" />
          <path d={base.land} className="nm-land" />
          <path d={base.borders} className="nm-borders" />

          <g className="nm-corridors">
            {lines.map((l) => {
              const r = reveal(l.id)
              const len = Math.max(1, l.line.length)
              return (
                <g key={`${l.id}-${l.system}`}>
                  {l.emphasised && l.status === 'lead' && <path d={l.d} className="nm-halo" style={{ opacity: r }} />}
                  <path
                    d={l.d}
                    data-corridor={l.id}
                    data-system={l.system}
                    className={`nm-arc ${l.system} status-${l.status}${l.emphasised ? ' focused' : ' faded'}${l.id === selectedCorridor ? ' selected' : ''}`}
                    style={
                      r < 1
                        ? { strokeDasharray: l.status === 'conceptual' || l.status === 'expansion' ? undefined : `${len} ${len}`, strokeDashoffset: l.status === 'conceptual' || l.status === 'expansion' ? undefined : len * (1 - r), opacity: l.status === 'conceptual' || l.status === 'expansion' ? r : 1 }
                        : undefined
                    }
                  />
                </g>
              )
            })}
          </g>

          {!compact && (playing || reduced) && settled && (
            <g className="nm-pods" filter={`url(#glow-${uid})`}>
              {lines
                .filter((l) => l.emphasised && animatesPods(corridorById[l.id]) && !reduced && playing)
                .flatMap((l, i) =>
                  [0, 0.5].map((phase) => {
                    const lap = MAP_TIMING.podLap * Math.max(0.6, Math.min(2.2, l.line.length / 260))
                    const raw = ((elapsed - drawEnd) / lap + phase + i * 0.17) % 2
                    const f = raw <= 1 ? raw : 2 - raw
                    const p = pointAt(l.line, f)
                    return p ? <circle key={`${l.id}-${l.system}-${phase}`} cx={p[0]} cy={p[1]} r={3} className={`nm-pod ${l.system}`} /> : null
                  }),
                )}
            </g>
          )}

          {!compact && onSelectCorridor && (
            <g className="nm-hits">
              {lines.map((l) => (
                <path key={`hit-${l.id}-${l.system}`} d={l.d} className="nm-hit" onClick={() => onSelectCorridor(l.id)}>
                  <title>{corridorById[l.id].name}</title>
                </path>
              ))}
            </g>
          )}

          <g className="nm-hubs">
            {hubPts.map(({ id, x, y }) => {
              const hb = hubById[id]
              const isEnd = !!endpoints?.has(id)
              const faded = emphasis && !trace ? ![...emphasis].some((cid) => corridorById[cid]?.path.includes(id)) && !labelHubs?.has(id) : trace ? !trace.some((s) => s.from === id || s.to === id) : false
              return (
                <g
                  key={id}
                  data-hub={id}
                  transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}
                  className={`nm-hub role-${hb.role}${isEnd ? ' endpoint' : ''}${id === selectedHub ? ' selected' : ''}${faded ? ' faded' : ''}`}
                  onClick={onSelectHub && !compact ? () => onSelectHub(id) : undefined}
                >
                  {onSelectHub && !compact && <circle r={12} className="nm-hub-hit" />}
                  {(isEnd || id === selectedHub) && <circle r={10} className="nm-hub-ring" />}
                  {hb.role === 'transit' ? (
                    <rect x={-3.2} y={-3.2} width={6.4} height={6.4} transform="rotate(45)" />
                  ) : hb.role === 'future' ? (
                    <circle r={4.2} className="future" />
                  ) : (
                    <circle r={isEnd ? 5 : 3.8} />
                  )}
                  <title>{`${hb.city}, ${hb.country}${hb.role === 'future' ? ' (future hub)' : hb.role === 'transit' ? ' (transit-country node)' : ''}`}</title>
                </g>
              )
            })}
          </g>

          <g className="nm-labels" aria-hidden="true">
            {labels.map((l) => (
              <text key={l.id} x={l.x} y={l.y} textAnchor={l.anchor} className={`${l.strong ? 'strong' : ''}${hubById[l.id].role === 'future' ? ' future' : ''}`}>
                {l.text}
                {hubById[l.id].role === 'future' && !compact ? ' · future hub' : ''}
              </text>
            ))}
          </g>

          <g className="nm-notes" aria-hidden="true">
            {notes.map((n) => (
              <text key={n.id} x={n.x} y={n.y - 8} textAnchor="middle">
                {n.text}
              </text>
            ))}
          </g>
        </svg>
      )}
    </div>
  )
}
