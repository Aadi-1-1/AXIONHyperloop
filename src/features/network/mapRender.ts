import { geoDistance, geoInterpolate, type GeoProjection } from 'd3-geo'
import { corridors, hubById } from '../../data/network'

export type LonLat = [number, number]
export type Pt = [number, number]
export type ScreenLine = { pts: (Pt | null)[]; breaks: Set<number>; wraps: number[]; cum: number[]; length: number }

/** Great-circle samples for every corridor, passing exactly through each hub on its path. */
export const samplesById: Record<string, LonLat[]> = Object.fromEntries(
  corridors.map((c) => {
    const pts: LonLat[] = []
    for (let i = 1; i < c.path.length; i++) {
      const a = hubById[c.path[i - 1]]
      const b = hubById[c.path[i]]
      const A: LonLat = [a.lon, a.lat]
      const B: LonLat = [b.lon, b.lat]
      const interp = geoInterpolate(A, B)
      const deg = (geoDistance(A, B) * 180) / Math.PI
      const n = Math.max(12, Math.ceil(deg / 0.6))
      for (let k = i === 1 ? 0 : 1; k <= n; k++) pts.push(interp(k / n) as LonLat)
    }
    return [c.id, pts]
  }),
)

/**
 * Projects samples to screen space. Optional parallel offset tapers to zero at both ends so freight and
 * passenger lines meet exactly at the hub markers instead of ending as detached stubs.
 */
export function screenLine(
  samples: LonLat[],
  proj: GeoProjection,
  opts: { offset?: number; taperPx?: number; visible?: (s: LonLat) => boolean; wrapWidth?: number } = {},
): ScreenLine {
  const { offset = 0, taperPx = 18, visible, wrapWidth } = opts
  const raw: (Pt | null)[] = samples.map((s) => {
    if (visible && !visible(s)) return null
    const p = proj(s)
    return p ? [p[0], p[1]] : null
  })
  const breaks = new Set<number>()
  const wraps: number[] = []
  for (let i = 1; i < raw.length; i++) {
    const a = raw[i - 1]
    const b = raw[i]
    if (!a || !b) breaks.add(i)
    else if (wrapWidth && Math.abs(a[0] - b[0]) > wrapWidth * 0.4) {
      breaks.add(i)
      wraps.push(i)
    }
  }
  // Cumulative screen length (continuous parts only) for tapering and uniform motion.
  const cum: number[] = [0]
  for (let i = 1; i < raw.length; i++) {
    const a = raw[i - 1]
    const b = raw[i]
    cum.push(cum[i - 1] + (a && b && !breaks.has(i) ? Math.hypot(b[0] - a[0], b[1] - a[1]) : 0))
  }
  const length = cum[cum.length - 1]
  if (!offset) return { pts: raw, breaks, wraps, cum, length }
  const pts = raw.map((p, i) => {
    if (!p) return null
    const prev = i > 0 && !breaks.has(i) ? raw[i - 1] : null
    const next = i < raw.length - 1 && !breaks.has(i + 1) ? raw[i + 1] : null
    const a = prev ?? p
    const b = next ?? p
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy) || 1
    const fromEnd = Math.min(cum[i], length - cum[i])
    const k = Math.min(1, fromEnd / taperPx)
    const t = k * k * (3 - 2 * k) // smoothstep
    return [p[0] - (dy / len) * offset * t, p[1] + (dx / len) * offset * t] as Pt
  })
  return { pts, breaks, wraps, cum, length }
}

export function lineToPath({ pts, breaks }: ScreenLine): string {
  let d = ''
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i]
    if (!p) continue
    const cont = i > 0 && pts[i - 1] && !breaks.has(i)
    d += `${cont ? 'L' : 'M'}${p[0].toFixed(1)},${p[1].toFixed(1)}`
  }
  return d
}

/** Point at fraction f of the drawn length (uniform speed along the rendered path). */
export function pointAt(line: ScreenLine, f: number): Pt | null {
  const { pts, cum, length, breaks } = line
  if (length <= 0) return null
  const target = Math.max(0, Math.min(1, f)) * length
  for (let i = 1; i < pts.length; i++) {
    if (cum[i] >= target && !breaks.has(i)) {
      const a = pts[i - 1]
      const b = pts[i]
      if (!a || !b) return null
      const segLen = cum[i] - cum[i - 1] || 1
      const t = (target - cum[i - 1]) / segLen
      return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
    }
  }
  return null
}

export type LabelCandidate = { id: string; x: number; y: number; text: string; priority: number; force?: boolean }
export type PlacedLabel = { id: string; x: number; y: number; anchor: 'start' | 'middle' | 'end'; text: string; strong: boolean; box: Box }
type Box = { x: number; y: number; w: number; h: number }

const overlaps = (a: Box, b: Box) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y

/**
 * Places labels around their markers, trying eight positions per label in priority order.
 * Forced labels (selected hubs, endpoints) are always placed in the least-colliding position.
 */
export function placeLabels(
  cands: LabelCandidate[],
  markers: { x: number; y: number; r: number }[],
  bounds: { w: number; h: number },
  charW = 6.7,
): PlacedLabel[] {
  const sorted = [...cands].sort((a, b) => a.priority - b.priority)
  const placed: PlacedLabel[] = []
  const markerBoxes: Box[] = markers.map((m) => ({ x: m.x - m.r, y: m.y - m.r, w: m.r * 2, h: m.r * 2 }))
  for (const c of sorted) {
    const tw = c.text.length * charW + 6
    const th = 15
    const options: { box: Box; x: number; y: number; anchor: 'start' | 'middle' | 'end' }[] = [
      { box: { x: c.x + 8, y: c.y - th / 2, w: tw, h: th }, x: c.x + 10, y: c.y + 4, anchor: 'start' },
      { box: { x: c.x - 8 - tw, y: c.y - th / 2, w: tw, h: th }, x: c.x - 10, y: c.y + 4, anchor: 'end' },
      { box: { x: c.x - tw / 2, y: c.y - 10 - th, w: tw, h: th }, x: c.x, y: c.y - 13, anchor: 'middle' },
      { box: { x: c.x - tw / 2, y: c.y + 10, w: tw, h: th }, x: c.x, y: c.y + 22, anchor: 'middle' },
      { box: { x: c.x + 6, y: c.y - 6 - th, w: tw, h: th }, x: c.x + 8, y: c.y - 9, anchor: 'start' },
      { box: { x: c.x + 6, y: c.y + 6, w: tw, h: th }, x: c.x + 8, y: c.y + 18, anchor: 'start' },
      { box: { x: c.x - 6 - tw, y: c.y - 6 - th, w: tw, h: th }, x: c.x - 8, y: c.y - 9, anchor: 'end' },
      { box: { x: c.x - 6 - tw, y: c.y + 6, w: tw, h: th }, x: c.x - 8, y: c.y + 18, anchor: 'end' },
    ]
    const score = (o: (typeof options)[number]) => {
      let s = 0
      if (o.box.x < 2 || o.box.y < 2 || o.box.x + o.box.w > bounds.w - 2 || o.box.y + o.box.h > bounds.h - 2) s += 100
      for (const p of placed) if (overlaps(o.box, p.box)) s += 10
      for (const m of markerBoxes) if (overlaps(o.box, m)) s += 3
      return s
    }
    let best = options[0]
    let bestScore = Infinity
    for (const o of options) {
      const s = score(o)
      if (s < bestScore) ((bestScore = s), (best = o))
      if (s === 0) break
    }
    if (bestScore >= 10 && !c.force) continue
    placed.push({ id: c.id, x: best.x, y: best.y, anchor: best.anchor, text: c.text, strong: !!c.force, box: best.box })
  }
  return placed
}
