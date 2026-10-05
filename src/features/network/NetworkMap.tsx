import { useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState, type Ref } from 'react'
import {
  geoDistance,
  geoEqualEarth,
  geoGraticule10,
  geoInterpolate,
  geoOrthographic,
  geoPath,
  type GeoProjection,
} from 'd3-geo'
import { feature, mesh } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import world from 'world-atlas/countries-110m.json'
import {
  animatesPods,
  corridors,
  hubById,
  hubs,
  type Corridor,
  type PhaseId,
  type SystemId,
} from '../../data/network'
import { useAnimationFrame, useElementSize, useInView, useReducedMotion } from '../../lib/hooks'
import type { MapMode, MapView } from './mapView'

// ---------- Static geography (computed once) ----------
const topo = world as unknown as Topology<{ countries: GeometryCollection; land: GeometryCollection }>
const land = feature(topo, topo.objects.land)
const borders = mesh(topo, topo.objects.countries, (a, b) => a !== b)
const graticule = geoGraticule10()
const sphere = { type: 'Sphere' } as const

type LonLat = [number, number]
type Pt = [number, number]

const samplesById: Record<string, LonLat[]> = Object.fromEntries(
  corridors.map((c) => {
    const pts: LonLat[] = []
    for (let i = 1; i < c.path.length; i++) {
      const a = hubById[c.path[i - 1]]
      const b = hubById[c.path[i]]
      const A: LonLat = [a.lon, a.lat]
      const B: LonLat = [b.lon, b.lat]
      const interp = geoInterpolate(A, B)
      const deg = (geoDistance(A, B) * 180) / Math.PI
      const n = Math.max(10, Math.ceil(deg / 1.2))
      for (let k = i === 1 ? 0 : 1; k <= n; k++) pts.push(interp(k / n) as LonLat)
    }
    return [c.id, pts]
  }),
)

function makeProjection(mode: MapMode, v: MapView, w: number, h: number): GeoProjection {
  if (mode === 'globe') {
    return geoOrthographic()
      .rotate([-v.lon, -v.lat])
      .scale(Math.min(w, h) * 0.46 * v.zoom)
      .translate([w / 2, h / 2])
      .clipAngle(90)
      .precision(0.6)
  }
  const p = geoEqualEarth().rotate([-v.lon, 0]).precision(0.6)
  p.fitExtent(
    [
      [8, 8],
      [w - 8, h - 8],
    ],
    sphere,
  )
  p.scale(p.scale() * v.zoom)
  const effLat = v.lat * Math.min(1, Math.max(0, v.zoom - 1))
  const c = p([v.lon, effLat])
  if (c) {
    const t = p.translate()
    p.translate([t[0] + w / 2 - c[0], t[1] + h / 2 - c[1]])
  }
  return p
}

type ScreenLine = { pts: (Pt | null)[]; breaks: Set<number> }

function screenLine(
  samples: LonLat[],
  proj: GeoProjection,
  mode: MapMode,
  w: number,
  center: LonLat,
  offset: number,
): ScreenLine {
  const raw: (Pt | null)[] = samples.map((s) => {
    if (mode === 'globe' && geoDistance(s, center) > Math.PI / 2 - 0.03) return null
    const p = proj(s)
    return p ? [p[0], p[1]] : null
  })
  const breaks = new Set<number>()
  for (let i = 1; i < raw.length; i++) {
    const a = raw[i - 1]
    const b = raw[i]
    if (!a || !b || Math.abs(a[0] - b[0]) > w * 0.4) breaks.add(i)
  }
  if (!offset) return { pts: raw, breaks }
  const pts = raw.map((p, i) => {
    if (!p) return null
    const prev = i > 0 && !breaks.has(i) ? raw[i - 1] : null
    const next = i < raw.length - 1 && !breaks.has(i + 1) ? raw[i + 1] : null
    const a = prev ?? p
    const b = next ?? p
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    return [p[0] - (dy / len) * offset, p[1] + (dx / len) * offset] as Pt
  })
  return { pts, breaks }
}

function lineToPath({ pts, breaks }: ScreenLine): string {
  let d = ''
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]
    if (!p) continue
    const cont = i > 0 && pts[i - 1] && !breaks.has(i)
    d += `${cont ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`
  }
  return d
}

function pointAt({ pts, breaks }: ScreenLine, f: number): Pt | null {
  const n = pts.length
  if (n < 2) return null
  const x = f * (n - 1)
  const i = Math.min(n - 2, Math.floor(x))
  const a = pts[i]
  const b = pts[i + 1]
  if (!a || !b || breaks.has(i + 1)) return null
  const t = x - i
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const shortestLon = (from: number, to: number) => {
  let d = to - from
  while (d > 180) d -= 360
  while (d < -180) d += 360
  return d
}

export type NetworkMapProps = {
  mode: MapMode
  phase: PhaseId
  systems: Record<SystemId, boolean>
  playing: boolean
  selectedHub?: string | null
  selectedCorridor?: string | null
  onSelectHub?: (id: string) => void
  onSelectCorridor?: (id: string) => void
  /** Changing this value animates the view to `targetView`. */
  targetView: MapView
  viewToken: number
  interactive?: boolean
  label: string
  className?: string
  apiRef?: Ref<NetworkMapApi>
}

export type NetworkMapApi = { zoomBy: (factor: number) => void }

export default function NetworkMap({
  mode,
  phase,
  systems,
  playing,
  selectedHub,
  selectedCorridor,
  onSelectHub,
  onSelectCorridor,
  targetView,
  viewToken,
  interactive = true,
  label,
  className,
  apiRef,
}: NetworkMapProps) {
  const reduced = useReducedMotion()
  const [wrapRef, size] = useElementSize<HTMLDivElement>()
  const inView = useInView(wrapRef, '100px')
  const uid = useId().replace(/:/g, '')
  const [view, setView] = useState<MapView>(targetView)
  const [time, setTime] = useState(0)
  const tween = useRef<{ from: MapView; to: MapView; t: number } | null>(null)
  const [tweening, setTweening] = useState(false)
  const drag = useRef<{ x: number; y: number; start: MapView; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const viewRef = useRef(view)
  useEffect(() => {
    viewRef.current = view
  }, [view])

  const startTween = useCallback(
    (to: MapView) => {
      if (reduced) {
        tween.current = null
        setTweening(false)
        setView(to)
        return
      }
      tween.current = { from: viewRef.current, to, t: 0 }
      setTweening(true)
    },
    [reduced],
  )

  // Animate towards a new target view whenever the parent issues a new token or switches projection.
  const [seen, setSeen] = useState({ token: viewToken, mode })
  if (seen.token !== viewToken || seen.mode !== mode) {
    setSeen({ token: viewToken, mode })
    if (reduced) setView(targetView)
    else setTweening(true)
  }
  useEffect(() => {
    if (!reduced) tween.current = { from: viewRef.current, to: targetView, t: 0 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewToken, mode])

  useImperativeHandle(
    apiRef,
    () => ({
      zoomBy: (factor: number) => {
        const from = viewRef.current
        startTween({ ...from, zoom: Math.max(0.8, Math.min(6, from.zoom * factor)) })
      },
    }),
    [startTween],
  )

  useAnimationFrame(tweening, (dt) => {
    const tw = tween.current
    if (!tw) return setTweening(false)
    tw.t = Math.min(1, tw.t + dt / 0.9)
    const k = ease(tw.t)
    setView({
      lon: tw.from.lon + shortestLon(tw.from.lon, tw.to.lon) * k,
      lat: tw.from.lat + (tw.to.lat - tw.from.lat) * k,
      zoom: tw.from.zoom + (tw.to.zoom - tw.from.zoom) * k,
    })
    if (tw.t >= 1) {
      tween.current = null
      setTweening(false)
    }
  })

  useAnimationFrame(playing && !reduced && inView, (dt) => setTime((t) => t + dt))

  const { width: w, height: h } = size
  const ready = w > 0 && h > 0

  const projection = useMemo(() => (ready ? makeProjection(mode, view, w, h) : null), [ready, mode, view, w, h])
  const center: LonLat = [view.lon, view.lat]

  const base = useMemo(() => {
    if (!projection) return null
    const path = geoPath(projection)
    return {
      sphere: path(sphere) ?? '',
      graticule: path(graticule) ?? '',
      land: path(land) ?? '',
      borders: path(borders) ?? '',
    }
  }, [projection])

  const visibleCorridors = useMemo(() => corridors.filter((c) => c.phase <= phase), [phase])

  const lines = useMemo(() => {
    if (!projection) return []
    const out: { c: Corridor; system: SystemId; line: ScreenLine; d: string }[] = []
    for (const c of visibleCorridors) {
      const both = c.systems.includes('freight') && c.systems.includes('passenger') && systems.freight && systems.passenger
      for (const s of c.systems) {
        if (!systems[s]) continue
        const off = both ? (s === 'freight' ? -2.4 : 2.4) : 0
        const line = screenLine(samplesById[c.id], projection, mode, w, [view.lon, view.lat], off)
        out.push({ c, system: s, line, d: lineToPath(line) })
      }
    }
    return out
  }, [projection, visibleCorridors, systems, mode, w, view.lon, view.lat])

  const visibleHubs = useMemo(
    () => hubs.filter((hb) => hb.phase <= phase),
    [phase],
  )

  const hubPoints = useMemo(() => {
    if (!projection) return []
    return visibleHubs
      .map((hb) => {
        if (mode === 'globe' && geoDistance([hb.lon, hb.lat], center) > Math.PI / 2 - 0.02) return null
        const p = projection([hb.lon, hb.lat])
        return p ? { hub: hb, x: p[0], y: p[1] } : null
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projection, visibleHubs, mode])

  // Greedy label placement: selected first, then current-phase hubs, then the rest.
  const labels = useMemo(() => {
    const selCorr = selectedCorridor ? corridors.find((c) => c.id === selectedCorridor) : null
    const prio = (id: string, ph: number, role: string) =>
      (id === selectedHub ? 0 : selCorr?.path.includes(id) ? 1 : ph === phase ? 2 : 3) * 10 + (role === 'transit' ? 1 : 0)
    const sorted = [...hubPoints].sort((a, b) => prio(a.hub.id, a.hub.phase, a.hub.role) - prio(b.hub.id, b.hub.phase, b.hub.role))
    const placed: { x: number; y: number; w: number; h: number }[] = []
    const out: { id: string; x: number; y: number; text: string; anchor: 'start' | 'end'; strong: boolean }[] = []
    for (const p of sorted) {
      const text = p.hub.city
      const tw = text.length * 6.6 + 4
      const right = p.x + 8 + tw < w - 4
      const box = { x: right ? p.x + 7 : p.x - 7 - tw, y: p.y - 8, w: tw, h: 15 }
      const hits = placed.some((b) => box.x < b.x + b.w && box.x + box.w > b.x && box.y < b.y + b.h && box.y + box.h > b.y)
      const isStrong = p.hub.id === selectedHub || !!selCorr?.path.includes(p.hub.id)
      if (hits && !isStrong) continue
      placed.push(box)
      out.push({ id: p.hub.id, x: right ? p.x + 8 : p.x - 8, y: p.y + 4, text, anchor: right ? 'start' : 'end', strong: isStrong })
    }
    return out
  }, [hubPoints, selectedHub, selectedCorridor, phase, w])

  // ---------- Pointer interaction ----------
  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!interactive || e.button !== 0) return
      drag.current = { x: e.clientX, y: e.clientY, start: view, moved: false }
      tween.current = null
      setTweening(false)
    },
    [interactive, view],
  )
  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const d = drag.current
      if (!d || !projection) return
      const dx = e.clientX - d.x
      const dy = e.clientY - d.y
      if (!d.moved && Math.hypot(dx, dy) < 5) return
      if (!d.moved) {
        d.moved = true
        ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
      }
      const r = projection.scale()
      const k = 180 / Math.PI / r
      setView({
        lon: d.start.lon - dx * k * (mode === 'globe' ? 1 : 1.1),
        lat: Math.max(-70, Math.min(70, d.start.lat + dy * k)),
        zoom: d.start.zoom,
      })
    },
    [projection, mode],
  )
  const onPointerUp = useCallback(() => {
    if (drag.current?.moved) {
      suppressClick.current = true
      setTimeout(() => (suppressClick.current = false), 0)
    }
    drag.current = null
  }, [])

  const clickGuard = (fn?: (id: string) => void, id?: string) => () => {
    if (suppressClick.current || !fn || !id) return
    fn(id)
  }

  const statusOrder = { conceptual: 0, expansion: 1, study: 2 } as const
  const sortedLines = [...lines].sort((a, b) => statusOrder[a.c.status] - statusOrder[b.c.status])
  const focusSet = useMemo(() => {
    if (selectedCorridor) return new Set([selectedCorridor])
    if (selectedHub) return new Set(corridors.filter((c) => c.path.includes(selectedHub)).map((c) => c.id))
    return null
  }, [selectedCorridor, selectedHub])

  return (
    <div
      ref={wrapRef}
      className={`network-map mode-${mode}${interactive ? ' is-interactive' : ''}${className ? ` ${className}` : ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      {ready && base && (
        <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label={label}>
          <defs>
            <radialGradient id={`ocean-${uid}`} cx="42%" cy="38%" r="70%">
              <stop offset="0%" stopColor="#16202a" />
              <stop offset="70%" stopColor="#0e141b" />
              <stop offset="100%" stopColor="#0a0e13" />
            </radialGradient>
            <filter id={`glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2.4" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {mode === 'globe' && (
            <circle
              cx={w / 2}
              cy={h / 2}
              r={(projection?.scale() ?? 0) + 6}
              className="nm-atmosphere"
            />
          )}
          <path d={base.sphere} fill={`url(#ocean-${uid})`} className="nm-sphere" />
          <path d={base.graticule} className="nm-graticule" />
          <path d={base.land} className="nm-land" />
          <path d={base.borders} className="nm-borders" />

          <g className="nm-corridors">
            {sortedLines.map(({ c, system, d }) => (
              <path
                key={`${c.id}-${system}`}
                d={d}
                className={`nm-arc ${system} status-${c.status}${c.phase < phase ? ' earlier' : ''}${
                  focusSet ? (focusSet.has(c.id) ? ' focused' : ' faded') : ''
                }`}
              />
            ))}
          </g>

          <g className="nm-pods" filter={`url(#glow-${uid})`}>
            {(playing && !reduced ? lines : [])
              .filter(({ c }) => animatesPods(c) && (!focusSet || focusSet.has(c.id)))
              .flatMap(({ c, system, line }, i) => {
                const len = samplesById[c.id].length
                const speed = 0.045 * (60 / Math.max(30, len))
                return [0, 0.5].map((phaseOffset) => {
                  const raw = (time * speed + phaseOffset + i * 0.137) % 2
                  const f = raw <= 1 ? raw : 2 - raw
                  const p = pointAt(line, f)
                  return p ? <circle key={`${c.id}-${system}-${phaseOffset}`} cx={p[0]} cy={p[1]} r={2.6} className={`nm-pod ${system}`} /> : null
                })
              })}
          </g>

          {interactive && (
            <g className="nm-hits">
              {lines.map(({ c, system, d }) => (
                <path
                  key={`hit-${c.id}-${system}`}
                  d={d}
                  className="nm-hit"
                  onClick={clickGuard(onSelectCorridor, c.id)}
                >
                  <title>{c.name}</title>
                </path>
              ))}
            </g>
          )}

          <g className="nm-hubs">
            {hubPoints.map(({ hub, x, y }) => {
              const sel = hub.id === selectedHub
              const inSel = focusSet ? corridors.some((c) => focusSet.has(c.id) && c.path.includes(hub.id)) : true
              return (
                <g
                  key={hub.id}
                  transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}
                  className={`nm-hub role-${hub.role}${sel ? ' selected' : ''}${hub.phase < phase ? ' earlier' : ''}${
                    focusSet && !inSel && !sel ? ' faded' : ''
                  }`}
                  onClick={interactive ? clickGuard(onSelectHub, hub.id) : undefined}
                >
                  {interactive && <circle r={12} className="nm-hub-hit" />}
                  {sel && <circle r={9} className="nm-hub-ring" />}
                  {hub.role === 'transit' ? <rect x={-3} y={-3} width={6} height={6} transform="rotate(45)" /> : <circle r={3.6} />}
                  <title>{`${hub.city}, ${hub.country}`}</title>
                </g>
              )
            })}
          </g>
          <g className="nm-labels" aria-hidden="true">
            {labels.map((l) => (
              <text key={l.id} x={l.x} y={l.y} textAnchor={l.anchor} className={l.strong ? 'strong' : undefined}>
                {l.text}
              </text>
            ))}
          </g>
        </svg>
      )}
    </div>
  )
}
