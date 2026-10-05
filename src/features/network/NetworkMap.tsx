import { useCallback, useEffect, useId, useImperativeHandle, useMemo, useRef, useState, type Ref } from 'react'
import { geoDistance, geoEqualEarth, geoOrthographic, geoPath, type GeoProjection } from 'd3-geo'
import { animatesPods, corridors, hubs, type CorridorStatus, type PhaseId, type SystemId } from '../../data/network'
import { useAnimationFrame, useElementSize, useInView, useReducedMotion } from '../../lib/hooks'
import type { MapMode, MapView } from './mapView'
import { borders, graticule, land, sphere } from './geography'
import { lineToPath, placeLabels, pointAt, samplesById, screenLine, type LonLat, type ScreenLine } from './mapRender'

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

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const shortestLon = (from: number, to: number) => ((((to - from) % 360) + 540) % 360) - 180
const statusRank: Record<CorridorStatus, number> = { conceptual: 0, expansion: 1, study: 2, lead: 3 }

export type NetworkMapApi = { zoomBy: (factor: number) => void }

export type NetworkMapProps = {
  mode: MapMode
  /** 0 highlights all phases; otherwise other phases are dimmed (never hidden). */
  phaseHighlight: 0 | PhaseId
  systems: Record<SystemId, boolean>
  playing: boolean
  selectedHub?: string | null
  selectedCorridor?: string | null
  onSelectHub?: (id: string) => void
  onSelectCorridor?: (id: string) => void
  targetView: MapView
  viewToken: number
  interactive?: boolean
  label: string
  className?: string
  apiRef?: Ref<NetworkMapApi>
}

export default function NetworkMap({
  mode,
  phaseHighlight,
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
  const tween = useRef<{ from: MapView; to: MapView; t: number; dur: number } | null>(null)
  const [tweening, setTweening] = useState(false)
  const drag = useRef<{ x: number; y: number; start: MapView; moved: boolean } | null>(null)
  const suppressClick = useRef(false)
  const viewRef = useRef(view)
  useEffect(() => {
    viewRef.current = view
  }, [view])

  const startTween = useCallback(
    (to: MapView, dur = 1.1) => {
      if (reduced) {
        tween.current = null
        setTweening(false)
        setView(to)
        return
      }
      tween.current = { from: viewRef.current, to, t: 0, dur }
      setTweening(true)
    },
    [reduced],
  )

  const [seen, setSeen] = useState({ token: viewToken, mode })
  if (seen.token !== viewToken || seen.mode !== mode) {
    setSeen({ token: viewToken, mode })
    if (reduced) setView(targetView)
    else setTweening(true)
  }
  useEffect(() => {
    if (!reduced) {
      const from = viewRef.current
      const dist = Math.hypot(shortestLon(from.lon, targetView.lon), targetView.lat - from.lat)
      tween.current = { from, to: targetView, t: 0, dur: Math.min(1.6, Math.max(0.8, 0.6 + dist / 150)) }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewToken, mode])

  useImperativeHandle(
    apiRef,
    () => ({
      zoomBy: (factor: number) => {
        const from = viewRef.current
        startTween({ ...from, zoom: Math.max(0.8, Math.min(6, from.zoom * factor)) }, 0.45)
      },
    }),
    [startTween],
  )

  useAnimationFrame(tweening, (dt) => {
    const tw = tween.current
    if (!tw) return setTweening(false)
    tw.t = Math.min(1, tw.t + dt / tw.dur)
    const k = ease(tw.t)
    setView({
      lon: tw.from.lon + shortestLon(tw.from.lon, tw.to.lon) * k,
      lat: tw.from.lat + (tw.to.lat - tw.from.lat) * k,
      zoom: tw.from.zoom * Math.pow(tw.to.zoom / tw.from.zoom, k),
    })
    if (tw.t >= 1) {
      tween.current = null
      setTweening(false)
    }
  })

  useAnimationFrame(playing && !reduced && inView && !tweening, (dt) => setTime((t) => t + dt))

  const { width: w, height: h } = size
  const ready = w > 0 && h > 0
  const projection = useMemo(() => (ready ? makeProjection(mode, view, w, h) : null), [ready, mode, view, w, h])
  const visible = useMemo(
    () => (mode === 'globe' ? (s: LonLat) => geoDistance(s, [view.lon, view.lat]) < Math.PI / 2 - 0.02 : undefined),
    [mode, view.lon, view.lat],
  )

  const base = useMemo(() => {
    if (!projection) return null
    const path = geoPath(projection)
    return { sphere: path(sphere) ?? '', graticule: path(graticule) ?? '', land: path(land) ?? '', borders: path(borders) ?? '' }
  }, [projection])

  const focusSet = useMemo(() => {
    if (selectedCorridor) return new Set([selectedCorridor])
    if (selectedHub) return new Set(corridors.filter((c) => c.path.includes(selectedHub)).map((c) => c.id))
    return null
  }, [selectedCorridor, selectedHub])
  const inPhase = useCallback((phase: PhaseId) => phaseHighlight === 0 || phase === phaseHighlight, [phaseHighlight])

  const lines = useMemo(() => {
    if (!projection) return []
    const out: { id: string; system: SystemId; status: CorridorStatus; phase: PhaseId; line: ScreenLine; d: string }[] = []
    for (const c of corridors) {
      const both = c.systems.includes('freight') && c.systems.includes('passenger') && systems.freight && systems.passenger
      for (const s of c.systems) {
        if (!systems[s]) continue
        const off = both ? (s === 'freight' ? -2.4 : 2.4) : 0
        const line = screenLine(samplesById[c.id], projection, { offset: off, taperPx: 14, visible, wrapWidth: mode === 'map' ? w : undefined })
        out.push({ id: c.id, system: s, status: c.status, phase: c.phase, line, d: lineToPath(line) })
      }
    }
    return out.sort((a, b) => statusRank[a.status] - statusRank[b.status])
  }, [projection, systems, visible, mode, w])

  const hubPoints = useMemo(() => {
    if (!projection) return []
    return hubs
      .map((hb) => {
        if (visible && !visible([hb.lon, hb.lat])) return null
        const p = projection([hb.lon, hb.lat])
        return p ? { hub: hb, x: p[0], y: p[1] } : null
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
  }, [projection, visible])

  const labels = useMemo(() => {
    const sel = selectedCorridor ? corridors.find((c) => c.id === selectedCorridor) : null
    const cands = hubPoints.map((p) => {
      const forced = p.hub.id === selectedHub || !!sel?.path.includes(p.hub.id)
      const pr = forced ? 0 : (inPhase(p.hub.phase) ? 2 : 6) + (p.hub.role === 'transit' ? 1 : 0)
      return { id: p.hub.id, x: p.x, y: p.y, text: p.hub.city, priority: pr, force: forced }
    })
    return placeLabels(cands, hubPoints.map((p) => ({ x: p.x, y: p.y, r: 4 })), { w, h })
  }, [hubPoints, selectedHub, selectedCorridor, inPhase, w, h])

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
      const k = 180 / Math.PI / projection.scale()
      setView({ lon: d.start.lon - dx * k, lat: Math.max(-70, Math.min(70, d.start.lat + dy * k)), zoom: d.start.zoom })
    },
    [projection],
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

  const lineClass = (l: (typeof lines)[number]) => {
    const dim = focusSet ? !focusSet.has(l.id) : !inPhase(l.phase)
    return `nm-arc ${l.system} status-${l.status}${dim ? ' faded' : focusSet ? ' focused' : ''}`
  }

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
          {mode === 'globe' && <circle cx={w / 2} cy={h / 2} r={(projection?.scale() ?? 0) + 6} className="nm-atmosphere" />}
          <path d={base.sphere} fill={`url(#ocean-${uid})`} className="nm-sphere" />
          <path d={base.graticule} className="nm-graticule" />
          <path d={base.land} className="nm-land" />
          <path d={base.borders} className="nm-borders" />

          <g className="nm-corridors">
            {lines.map((l) => (
              <g key={`${l.id}-${l.system}`}>
                {l.status === 'lead' && !(focusSet && !focusSet.has(l.id)) && inPhase(l.phase) && <path d={l.d} className="nm-halo" />}
                <path d={l.d} data-corridor={l.id} className={lineClass(l)} />
              </g>
            ))}
          </g>

          {mode === 'map' && (
            <g className="nm-wraps" aria-hidden="true">
              {lines.flatMap((l) =>
                l.line.wraps.flatMap((i) =>
                  [l.line.pts[i - 1], l.line.pts[i]].map((p, k) =>
                    p ? (
                      <text key={`${l.id}-${l.system}-${i}-${k}`} x={p[0]} y={p[1] - 6} textAnchor="middle">
                        {p[0] < w / 2 ? '◂' : '▸'}
                      </text>
                    ) : null,
                  ),
                ),
              )}
            </g>
          )}

          <g className="nm-pods" filter={`url(#glow-${uid})`}>
            {(playing && !reduced && !tweening ? lines : [])
              .filter((l) => animatesPods(corridors.find((c) => c.id === l.id)!) && (focusSet ? focusSet.has(l.id) : inPhase(l.phase)))
              .flatMap((l, i) =>
                [0, 0.5].map((phase) => {
                  const lap = 8 * Math.max(0.5, Math.min(2, l.line.length / 200))
                  const raw = (time / lap + phase + i * 0.137) % 2
                  const p = pointAt(l.line, raw <= 1 ? raw : 2 - raw)
                  return p ? <circle key={`${l.id}-${l.system}-${phase}`} cx={p[0]} cy={p[1]} r={2.6} className={`nm-pod ${l.system}`} /> : null
                }),
              )}
          </g>

          {interactive && (
            <g className="nm-hits">
              {lines.map((l) => (
                <path key={`hit-${l.id}-${l.system}`} d={l.d} className="nm-hit" onClick={clickGuard(onSelectCorridor, l.id)}>
                  <title>{corridors.find((c) => c.id === l.id)!.name}</title>
                </path>
              ))}
            </g>
          )}

          <g className="nm-hubs">
            {hubPoints.map(({ hub, x, y }) => {
              const sel = hub.id === selectedHub
              const inFocus = focusSet ? corridors.some((c) => focusSet.has(c.id) && c.path.includes(hub.id)) : inPhase(hub.phase)
              return (
                <g
                  key={hub.id}
                  data-hub={hub.id}
                  transform={`translate(${x.toFixed(1)},${y.toFixed(1)})`}
                  className={`nm-hub role-${hub.role}${sel ? ' selected' : ''}${!inFocus && !sel ? ' faded' : ''}`}
                  onClick={interactive ? clickGuard(onSelectHub, hub.id) : undefined}
                >
                  {interactive && <circle r={12} className="nm-hub-hit" />}
                  {sel && <circle r={9} className="nm-hub-ring" />}
                  {hub.role === 'transit' ? (
                    <rect x={-3} y={-3} width={6} height={6} transform="rotate(45)" />
                  ) : hub.role === 'future' ? (
                    <circle r={4} className="future" />
                  ) : (
                    <circle r={3.6} />
                  )}
                  <title>{`${hub.city}, ${hub.country}${hub.role === 'future' ? ' (future hub)' : ''}`}</title>
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
