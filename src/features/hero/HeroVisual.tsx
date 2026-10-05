import { useEffect, useRef, useState } from 'react'
import { geoMercator, geoPath, type GeoProjection } from 'd3-geo'
import { animatesPods, corridors, hubById, hubs, leadCorridor } from '../../data/network'
import { useInView, useReducedMotion } from '../../lib/hooks'
import { land as land110 } from '../network/geography'
import './hero.css'

const phase1Hubs = hubs.filter((h) => h.phase === 1)
const phase1Corridors = corridors.filter((c) => c.phase === 1)
const SG = hubById.singapore
const KL = hubById['kuala-lumpur']

/**
 * Timing (seconds). Each act gets room to establish before the next begins.
 * Act 1: pod inside the tube. Act 2: pull back to the lead corridor. Act 3: ease out to the Phase 1 network.
 */
const T = {
  establish: 4.8,
  toCorridor: 1.9,
  corridorHold: 3.0,
  toNetwork: 2.0,
  drawNetwork: 1.8,
  idle: 30,
}
const T_CORRIDOR = T.establish + T.toCorridor
const T_ZOOM = T_CORRIDOR + T.corridorHold
const T_NETWORK = T_ZOOM + T.toNetwork
const T_SETTLED = T_NETWORK + T.drawNetwork
const T_END = T_SETTLED + T.idle

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (t: number) => Math.max(0, Math.min(1, t))
const lerp = (a: number, b: number, k: number) => a + (b - a) * k

type Cam = { lon: number; lat: number; scale: number }

/** Keep only the land polygons near the Phase 1 network, so each frame projects far fewer vertices. */
type Ring = [number, number][]
function landNear(fc: GeoJSON.FeatureCollection, [w, s, e, n]: [number, number, number, number]): GeoJSON.MultiPolygon {
  const polys: Ring[][] = []
  for (const f of fc.features) {
    const g = f.geometry
    const list = g.type === 'MultiPolygon' ? (g.coordinates as Ring[][]) : g.type === 'Polygon' ? [g.coordinates as Ring[]] : []
    for (const poly of list) {
      if (poly[0].some(([x, y]) => x >= w && x <= e && y >= s && y <= n)) polys.push(poly)
    }
  }
  return { type: 'MultiPolygon', coordinates: polys }
}
const HERO_BOX: [number, number, number, number] = [80, -20, 160, 60]

function fit(points: [number, number][], w: number, h: number, padX: number, padY: number): Cam {
  const p = geoMercator().fitExtent(
    [
      [padX, padY],
      [w - padX, h - padY],
    ],
    { type: 'MultiPoint', coordinates: points },
  )
  const c = p.invert!([w / 2, h / 2])!
  return { lon: c[0], lat: c[1], scale: p.scale() }
}
function proj(cam: Cam, w: number, h: number): GeoProjection {
  return geoMercator().rotate([-cam.lon, 0]).center([0, cam.lat]).scale(cam.scale).translate([w / 2, h / 2])
}

export default function HeroVisual() {
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inView = useInView(wrapRef)
  const [playing, setPlaying] = useState(!reduced)
  const [finished, setFinished] = useState(false)
  const [runId, setRunId] = useState(0)
  const [act, setAct] = useState<1 | 2 | 3>(reduced ? 3 : 1)
  const timeRef = useRef(reduced ? T_SETTLED : 0)
  const landRef = useRef(landNear(land110, HERO_BOX))

  // Sharper coastlines for the corridor close-up, loaded after first paint.
  useEffect(() => {
    let live = true
    import('../network/geography50').then((m) => {
      if (live) landRef.current = landNear(m.land, HERO_BOX)
    })
    return () => {
      live = false
    }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0
    let H = 0
    let dpr = 1
    let corridorCam: Cam = { lon: 0, lat: 0, scale: 1 }
    let networkCam: Cam = { lon: 0, lat: 0, scale: 1 }
    const landCanvas = document.createElement('canvas')
    let landKey = ''

    const resize = () => {
      const r = wrap.getBoundingClientRect()
      dpr = Math.min(2, window.devicePixelRatio || 1)
      W = r.width
      H = r.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      corridorCam = fit([[SG.lon, SG.lat], [KL.lon, KL.lat]], W, H, W * 0.24, H * 0.26)
      networkCam = fit([[96, -3], [142, 42], ...phase1Hubs.map((h) => [h.lon, h.lat] as [number, number])], W, H, W * 0.1, H * 0.12)
      draw(timeRef.current)
    }

    // ---------- Act 1: the tube ----------
    function drawTunnel(t: number, vp: [number, number], R0: number, alpha: number) {
      if (!ctx) return
      const speed = 0.5 + 1.9 * ease(clamp01(t / 2.4)) // the pod accelerates as the scene opens
      const travel = 0.5 * t + 1.9 * Math.max(0, t - 1.2) * clamp01(t / 2.4)
      ctx.save()
      ctx.globalAlpha = alpha
      const bg = ctx.createRadialGradient(vp[0], vp[1], 0, vp[0], vp[1], R0 * 1.6)
      bg.addColorStop(0, 'rgba(120,230,250,0.20)')
      bg.addColorStop(0.18, 'rgba(40,120,140,0.10)')
      bg.addColorStop(0.6, 'rgba(10,16,22,0.0)')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, W, H)
      const N = 18
      for (let i = 0; i < N; i++) {
        const z = ((((i - travel) % N) + N) % N) + 0.3
        const r = R0 / z
        const fog = Math.min(1, (N - z) / 7) * Math.min(1, z / 1.1)
        // ring joint: a lit band with a darker shadow edge
        ctx.lineWidth = Math.max(0.8, 7 / z)
        ctx.strokeStyle = `rgba(30,38,46,${0.9 * fog})`
        ctx.beginPath()
        ctx.arc(vp[0], vp[1], r, 0, Math.PI * 2)
        ctx.stroke()
        ctx.lineWidth = Math.max(0.5, 1.6 / z)
        ctx.strokeStyle = `rgba(200,220,232,${0.34 * fog})`
        ctx.beginPath()
        ctx.arc(vp[0], vp[1], r * 0.985, Math.PI * 1.05, Math.PI * 1.95)
        ctx.stroke()
        // sensor node at the crown of each joint
        ctx.fillStyle = `rgba(63,216,240,${0.75 * fog})`
        ctx.beginPath()
        ctx.arc(vp[0], vp[1] - r * 0.985, Math.max(0.8, 3.2 / z), 0, Math.PI * 2)
        ctx.fill()
      }
      // light strips along the crown, streaking toward the camera
      for (const ang of [-Math.PI / 2, -Math.PI / 2 - 0.55, -Math.PI / 2 + 0.55]) {
        for (let i = 0; i < 26; i++) {
          const z1 = ((((i * 0.7 - travel * 1.15) % 18) + 18) % 18) + 0.4
          const z2 = z1 + 0.18 + speed * 0.06
          const r1 = (R0 * 0.93) / z1
          const r2 = (R0 * 0.93) / z2
          ctx.strokeStyle = `rgba(120,232,250,${Math.min(0.85, 1.5 / z1)})`
          ctx.lineWidth = Math.max(0.6, 3.2 / z1)
          ctx.beginPath()
          ctx.moveTo(vp[0] + Math.cos(ang) * r1, vp[1] + Math.sin(ang) * r1)
          ctx.lineTo(vp[0] + Math.cos(ang) * r2, vp[1] + Math.sin(ang) * r2)
          ctx.stroke()
        }
      }
      // guideway rails and stator segments on the floor
      ctx.strokeStyle = 'rgba(140,160,175,0.32)'
      ctx.lineWidth = 1
      for (const ang of [Math.PI * 0.6, Math.PI * 0.4]) {
        ctx.beginPath()
        ctx.moveTo(vp[0], vp[1])
        ctx.lineTo(vp[0] + Math.cos(ang) * R0 * 4, vp[1] + Math.sin(ang) * R0 * 4)
        ctx.stroke()
      }
      for (let i = 0; i < 30; i++) {
        const z = ((((i * 0.6 - travel) % 18) + 18) % 18) + 0.5
        const y1 = vp[1] + (R0 * 0.8) / z
        const y2 = vp[1] + (R0 * 0.8) / (z + 0.22)
        ctx.strokeStyle = `rgba(63,216,240,${Math.min(0.75, 1.4 / z)})`
        ctx.lineWidth = Math.max(0.5, 5 / z)
        ctx.beginPath()
        ctx.moveTo(vp[0], y1)
        ctx.lineTo(vp[0], y2)
        ctx.stroke()
      }
      // vignette for depth
      const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.25, W / 2, H / 2, Math.max(W, H) * 0.75)
      vg.addColorStop(0, 'rgba(0,0,0,0)')
      vg.addColorStop(1, 'rgba(4,6,8,0.75)')
      ctx.fillStyle = vg
      ctx.fillRect(0, 0, W, H)
      ctx.restore()
    }

    function drawPod(cx: number, cy: number, s: number, alpha: number, t: number) {
      if (!ctx || s < 1) return
      ctx.save()
      ctx.globalAlpha = alpha
      // floor shadow and reflected light
      const sh = ctx.createRadialGradient(cx, cy + s * 0.62, 0, cx, cy + s * 0.62, s * 0.9)
      sh.addColorStop(0, 'rgba(0,0,0,0.55)')
      sh.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = sh
      ctx.beginPath()
      ctx.ellipse(cx, cy + s * 0.62, s * 0.9, s * 0.14, 0, 0, Math.PI * 2)
      ctx.fill()
      // body: rear three-quarter view of a capsule
      const body = ctx.createLinearGradient(cx - s, cy - s * 0.6, cx + s * 0.6, cy + s * 0.6)
      body.addColorStop(0, '#f4f7f9')
      body.addColorStop(0.45, '#c9d2d9')
      body.addColorStop(1, '#5d6973')
      ctx.fillStyle = body
      ctx.beginPath()
      ctx.ellipse(cx, cy, s * 0.82, s * 0.56, 0, 0, Math.PI * 2)
      ctx.fill()
      // specular highlight
      const spec = ctx.createRadialGradient(cx - s * 0.32, cy - s * 0.28, 0, cx - s * 0.32, cy - s * 0.28, s * 0.5)
      spec.addColorStop(0, 'rgba(255,255,255,0.75)')
      spec.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = spec
      ctx.beginPath()
      ctx.ellipse(cx, cy, s * 0.82, s * 0.56, 0, 0, Math.PI * 2)
      ctx.fill()
      // rear panel and seam
      ctx.fillStyle = '#10161c'
      ctx.beginPath()
      ctx.roundRect(cx - s * 0.5, cy - s * 0.2, s, s * 0.38, s * 0.12)
      ctx.fill()
      ctx.strokeStyle = 'rgba(255,255,255,0.18)'
      ctx.lineWidth = Math.max(1, s * 0.012)
      ctx.beginPath()
      ctx.ellipse(cx, cy, s * 0.7, s * 0.47, 0, Math.PI * 1.08, Math.PI * 1.92)
      ctx.stroke()
      // freight tail-light bar, gently pulsing
      const pulse = 0.85 + 0.15 * Math.sin(t * 3)
      ctx.shadowColor = 'rgba(63,216,240,0.95)'
      ctx.shadowBlur = s * 0.35
      ctx.fillStyle = `rgba(110,232,250,${pulse})`
      ctx.fillRect(cx - s * 0.38, cy - s * 0.02, s * 0.76, Math.max(2, s * 0.05))
      ctx.shadowBlur = 0
      // rim light from the tube strips
      ctx.strokeStyle = 'rgba(63,216,240,0.55)'
      ctx.lineWidth = Math.max(1, s * 0.02)
      ctx.beginPath()
      ctx.ellipse(cx, cy, s * 0.82, s * 0.56, 0, Math.PI * 0.1, Math.PI * 0.9)
      ctx.stroke()
      ctx.restore()
    }

    // ---------- Acts 2 and 3: corridor and network ----------
    function drawMap(cam: Cam, alpha: number, t: number) {
      if (!ctx) return
      const p = proj(cam, W, H)
      ctx.save()
      ctx.globalAlpha = alpha
      const key = `${cam.lon.toFixed(4)}|${cam.lat.toFixed(4)}|${cam.scale.toFixed(1)}|${W}|${H}|${dpr}|${landRef.current.coordinates.length}`
      if (landKey !== key) {
        // Render coastlines once per camera position; re-used while the camera holds still.
        landCanvas.width = canvas!.width
        landCanvas.height = canvas!.height
        const lc = landCanvas.getContext('2d')!
        lc.setTransform(dpr, 0, 0, dpr, 0, 0)
        lc.beginPath()
        geoPath(p, lc)(landRef.current)
        lc.fillStyle = '#18212a'
        lc.fill()
        lc.strokeStyle = '#2a3541'
        lc.lineWidth = 0.7
        lc.stroke()
        landKey = key
      }
      ctx.save()
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.drawImage(landCanvas, 0, 0)
      ctx.restore()

      const netK = ease(clamp01((t - T_NETWORK + 0.6) / T.drawNetwork))
      for (const c of phase1Corridors) {
        const isLead = c.id === leadCorridor.id
        const grow = isLead ? ease(clamp01((t - T.establish - 0.4) / 1.2)) : netK
        if (grow <= 0) continue
        const pts = c.path.map((id) => p([hubById[id].lon, hubById[id].lat])!)
        let total = 0
        for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
        let remaining = total * grow
        ctx.beginPath()
        ctx.moveTo(pts[0][0], pts[0][1])
        for (let i = 1; i < pts.length && remaining > 0; i++) {
          const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
          const f = Math.min(1, remaining / seg)
          ctx.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f)
          remaining -= seg
        }
        ctx.lineCap = 'round'
        if (isLead) {
          ctx.strokeStyle = 'rgba(63,216,240,0.22)'
          ctx.lineWidth = 12
          ctx.stroke()
        }
        ctx.strokeStyle = '#3fd8f0'
        ctx.lineWidth = isLead ? 3.2 : c.status === 'study' ? 2.2 : 1.8
        ctx.setLineDash(c.status === 'conceptual' ? [0.1, 6] : c.status === 'expansion' ? [7, 5] : [])
        ctx.globalAlpha = alpha * (isLead || c.status === 'study' ? 1 : 0.75)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.globalAlpha = alpha

        // pods only on land/strait corridors, only once the route has been drawn
        const podsOn = isLead ? t > T.establish + 1.4 && t < T_ZOOM + T.toNetwork * 0.5 : t > T_SETTLED && t < T_END
        if ((isLead || t > T_SETTLED) && podsOn && animatesPods(c) && grow >= 1) {
          const lap = isLead ? 3.2 : 9 * Math.max(0.6, total / 260)
          const f = (((t - T.establish) / lap + c.id.length * 0.13) % 1 + 1) % 1
          let d = f * total
          for (let i = 1; i < pts.length; i++) {
            const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
            if (d <= seg) {
              ctx.fillStyle = '#e6fbff'
              ctx.shadowColor = 'rgba(63,216,240,0.95)'
              ctx.shadowBlur = 10
              ctx.beginPath()
              ctx.arc(pts[i - 1][0] + ((pts[i][0] - pts[i - 1][0]) * d) / seg, pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * d) / seg, isLead && t < T_ZOOM ? 4 : 2.6, 0, Math.PI * 2)
              ctx.fill()
              ctx.shadowBlur = 0
              break
            }
            d -= seg
          }
        }
      }

      // hubs and labels
      ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace'
      ctx.textBaseline = 'middle'
      const corridorMode = t < T_ZOOM + T.toNetwork * 0.5
      for (const h of phase1Hubs) {
        const isLeadEnd = h.id === SG.id || h.id === KL.id
        const a = isLeadEnd ? 1 : netK
        if (a <= 0) continue
        const q = p([h.lon, h.lat])
        if (!q || q[0] < -20 || q[0] > W + 20 || q[1] < -20 || q[1] > H + 20) continue
        ctx.globalAlpha = alpha * a
        if (isLeadEnd && corridorMode) {
          ctx.strokeStyle = '#3fd8f0'
          ctx.lineWidth = 1.6
          ctx.beginPath()
          ctx.arc(q[0], q[1], 9, 0, Math.PI * 2)
          ctx.stroke()
        }
        ctx.fillStyle = h.role === 'transit' ? '#0a0c0f' : '#eef1f4'
        ctx.strokeStyle = '#b6bfca'
        ctx.beginPath()
        if (h.role === 'transit') ctx.rect(q[0] - 2.8, q[1] - 2.8, 5.6, 5.6)
        else ctx.arc(q[0], q[1], isLeadEnd && corridorMode ? 4.5 : 3.4, 0, Math.PI * 2)
        ctx.fill()
        if (h.role === 'transit') ctx.stroke()
        if (h.role !== 'transit') {
          const left = ['kunming', 'kuala-lumpur', 'fukuoka'].includes(h.id)
          ctx.textAlign = left ? 'right' : 'left'
          ctx.fillStyle = 'rgba(214,222,230,0.95)'
          ctx.fillText(h.city.toUpperCase(), q[0] + (left ? -12 : 12), q[1])
        }
      }
      ctx.restore()
    }

    function draw(t: number) {
      if (!ctx || !W) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      const k1 = ease(clamp01((t - T.establish) / T.toCorridor)) // tube → corridor
      const k2 = ease(clamp01((t - T_ZOOM) / T.toNetwork)) // corridor → network
      const cam: Cam = {
        lon: lerp(corridorCam.lon, networkCam.lon, k2),
        lat: lerp(corridorCam.lat, networkCam.lat, k2),
        scale: Math.exp(lerp(Math.log(corridorCam.scale), Math.log(networkCam.scale), k2)),
      }
      // Pod position on the corridor at the moment the camera pulls out of the tube.
      const pc = proj(corridorCam, W, H)
      const sg = pc([SG.lon, SG.lat])!
      const kl = pc([KL.lon, KL.lat])!
      const podMap: [number, number] = [lerp(sg[0], kl[0], 0.12), lerp(sg[1], kl[1], 0.12)]

      if (k1 < 1) {
        const vp: [number, number] = [lerp(W / 2, podMap[0], k1), lerp(H * 0.44, podMap[1], k1)]
        const R0 = Math.max(W, H) * 0.7 * (1 - 0.96 * k1)
        drawTunnel(t, vp, R0, 1 - k1)
        const s = Math.min(W, H) * 0.2 * (1 - 0.92 * k1) * (1 + 0.04 * Math.sin(t * 0.8))
        const bob = Math.sin(t * 2.1) * s * 0.012
        drawPod(vp[0], vp[1] + s * 0.42 * (1 - k1) + bob, s, 1 - k1 * 0.7, t)
      }
      if (k1 > 0) drawMap(cam, ease(clamp01((k1 - 0.15) / 0.85)), t)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    let raf = 0
    let last = performance.now()
    const active = playing && inView && !reduced
    const loop = (now: number) => {
      const dt = Math.min(0.25, (now - last) / 1000)
      last = now
      timeRef.current += dt
      const t = timeRef.current
      draw(t)
      setAct(t < T.establish + T.toCorridor * 0.5 ? 1 : t < T_ZOOM + T.toNetwork * 0.5 ? 2 : 3)
      if (t < T_END) raf = requestAnimationFrame(loop)
      else {
        setPlaying(false)
        setFinished(true)
      }
    }
    if (active) raf = requestAnimationFrame(loop)
    else draw(timeRef.current)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [playing, inView, reduced, runId])

  const replay = () => {
    timeRef.current = 0
    setAct(1)
    setFinished(false)
    setPlaying(true)
    setRunId((r) => r + 1)
  }

  const captions = {
    1: { hud: 'Low-pressure tube', text: 'Inside the tube: a freight pod moves terminal to terminal at low air pressure.' },
    2: { hud: 'Lead study corridor', text: 'Singapore–Kuala Lumpur: the proposed lead study corridor. Feasibility unverified.' },
    3: { hud: 'Phase 1 · proposed', text: 'Phase 1 vision: proposed connections, not confirmed routes.' },
  } as const

  return (
    <figure className="hero-visual" aria-label="Animated illustration: a freight pod in a low-pressure tube, then the Singapore–Kuala Lumpur lead study corridor, then the proposed Phase 1 network.">
      <div className="hv-frame" ref={wrapRef}>
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className="hv-hud hv-tl mono" aria-hidden="true">
          <span>AX-F01</span>
          <span className="muted">Freight pod · concept</span>
        </div>
        <div className="hv-hud hv-tr mono" aria-hidden="true">
          <span>{captions[act].hud}</span>
        </div>
        <ol className="hv-acts" aria-hidden="true">
          {[1, 2, 3].map((n) => (
            <li key={n} className={act === n ? 'on' : act > n ? 'done' : ''} />
          ))}
        </ol>
      </div>
      <figcaption className="hv-bar">
        <span className="small muted hv-caption">{captions[act].text}</span>
        <span className="cluster" style={{ ['--gap' as string]: '6px' }}>
          {!reduced && !finished && (
            <button type="button" className="btn btn-sm" onClick={() => setPlaying((p) => !p)} aria-pressed={!playing}>
              {playing ? 'Pause' : 'Play'}
            </button>
          )}
          {!reduced && (
            <button type="button" className="btn btn-sm" onClick={replay}>
              Replay
            </button>
          )}
        </span>
      </figcaption>
    </figure>
  )
}
