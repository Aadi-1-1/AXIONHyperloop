import { useEffect, useRef, useState } from 'react'
import { geoEquirectangular, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { GeometryCollection, Topology } from 'topojson-specification'
import world from 'world-atlas/countries-110m.json'
import { animatesPods, corridors, hubById, hubs } from '../../data/network'
import { useInView, useReducedMotion } from '../../lib/hooks'
import './hero.css'

const topo = world as unknown as Topology<{ land: GeometryCollection }>
const land = feature(topo, topo.objects.land)
const phase1Hubs = hubs.filter((h) => h.phase === 1)
const phase1Corridors = corridors.filter((c) => c.phase === 1)

const TUNNEL_END = 3.4
const TRANSITION_END = 6.2
const IDLE_LIMIT = 40 // seconds of gentle idle motion before settling to a still frame

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (t: number) => Math.max(0, Math.min(1, t))

/**
 * Opening visual: a freight pod travelling inside a low-pressure tube, pulling back to reveal the
 * proposed Phase 1 network. Plays once, idles gently, and can be paused or replayed.
 * With reduced motion it renders the final network frame only.
 */
export default function HeroVisual() {
  const reduced = useReducedMotion()
  const wrapRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inView = useInView(wrapRef)
  const [playing, setPlaying] = useState(!reduced)
  const [runId, setRunId] = useState(0)
  const [finished, setFinished] = useState(false)
  const [stage, setStage] = useState<'tube' | 'network'>(reduced ? 'network' : 'tube')
  const timeRef = useRef(reduced ? TRANSITION_END + 1 : 0)

  useEffect(() => {
    const canvas = canvasRef.current
    const wrap = wrapRef.current
    if (!canvas || !wrap) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let W = 0
    let H = 0
    let dpr = 1
    const resize = () => {
      const r = wrap.getBoundingClientRect()
      dpr = Math.min(2, window.devicePixelRatio || 1)
      W = r.width
      H = r.height
      canvas.width = Math.round(W * dpr)
      canvas.height = Math.round(H * dpr)
      canvas.style.width = `${W}px`
      canvas.style.height = `${H}px`
      draw(timeRef.current)
    }

    const projectionFor = () => {
      const p = geoEquirectangular()
      const pad = Math.min(W, H) * 0.12
      p.fitExtent(
        [
          [pad, pad],
          [W - pad, H - pad * 1.1],
        ],
        {
          type: 'MultiPoint',
          coordinates: [
            [97, -3],
            [143, 44],
          ],
        },
      )
      return p
    }

    function draw(t: number) {
      if (!ctx || !W) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, W, H)
      const proj = projectionFor()
      const anchor = proj([hubById.shanghai.lon, hubById.shanghai.lat]) ?? [W / 2, H / 2]
      const tb = clamp01((t - TUNNEL_END) / (TRANSITION_END - TUNNEL_END)) // 0..1 transition
      const k = ease(tb)

      // ---------- Tunnel ----------
      if (tb < 1) {
        const vp: [number, number] = [W / 2 + (anchor[0] - W / 2) * k, H * 0.47 + (anchor[1] - H * 0.47) * k]
        const R0 = Math.max(W, H) * 0.62 * (1 - 0.94 * k)
        const alpha = 1 - k
        const speed = 2.4 * (1 - 0.7 * k)
        const N = 16
        ctx.save()
        ctx.globalAlpha = alpha
        // tube interior glow
        const g = ctx.createRadialGradient(vp[0], vp[1], 0, vp[0], vp[1], R0 * 1.4)
        g.addColorStop(0, 'rgba(63,216,240,0.16)')
        g.addColorStop(0.25, 'rgba(63,216,240,0.04)')
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.fillRect(0, 0, W, H)
        // rings
        for (let i = 0; i < N; i++) {
          const z = ((i - t * speed) % N + N) % N + 0.35
          const r = R0 / z
          const a = Math.min(1, (N - z) / 6) * Math.min(1, z / 1.2)
          ctx.strokeStyle = `rgba(190, 210, 225, ${0.32 * a})`
          ctx.lineWidth = Math.max(0.6, 2.4 / z)
          ctx.beginPath()
          ctx.arc(vp[0], vp[1], r, 0, Math.PI * 2)
          ctx.stroke()
          ctx.strokeStyle = `rgba(190, 210, 225, ${0.12 * a})`
          ctx.beginPath()
          ctx.arc(vp[0], vp[1], r * 0.965, 0, Math.PI * 2)
          ctx.stroke()
          // sensor ticks on each joint
          ctx.fillStyle = `rgba(63,216,240,${0.7 * a})`
          ctx.beginPath()
          ctx.arc(vp[0], vp[1] - r, Math.max(0.8, 3 / z), 0, Math.PI * 2)
          ctx.fill()
        }
        // guideway rails converging to the vanishing point
        ctx.strokeStyle = 'rgba(140,160,175,0.35)'
        ctx.lineWidth = 1
        for (const ang of [Math.PI * 0.62, Math.PI * 0.38]) {
          ctx.beginPath()
          ctx.moveTo(vp[0], vp[1])
          ctx.lineTo(vp[0] + Math.cos(ang) * R0 * 3, vp[1] + Math.sin(ang) * R0 * 3)
          ctx.stroke()
        }
        // moving stator dashes on the centreline
        for (let i = 0; i < 24; i++) {
          const z = ((i * 0.66 - t * speed) % 16 + 16) % 16 + 0.5
          const z2 = z + 0.25
          const y1 = vp[1] + (R0 * 0.78) / z
          const y2 = vp[1] + (R0 * 0.78) / z2
          ctx.strokeStyle = `rgba(63,216,240,${Math.min(0.8, 1.6 / z)})`
          ctx.lineWidth = Math.max(0.5, 4 / z)
          ctx.beginPath()
          ctx.moveTo(vp[0], y1)
          ctx.lineTo(vp[0], y2)
          ctx.stroke()
        }
        // pod, seen from behind, ahead of the camera
        const pr = (R0 / 3.1) * 0.62
        const bob = Math.sin(t * 2.2) * pr * 0.01
        const px = vp[0]
        const py = vp[1] + pr * 0.32 + bob
        const body = ctx.createLinearGradient(px, py - pr * 0.5, px, py + pr * 0.5)
        body.addColorStop(0, '#eef2f5')
        body.addColorStop(1, '#7d8994')
        ctx.fillStyle = body
        ctx.beginPath()
        ctx.ellipse(px, py, pr * 0.6, pr * 0.46, 0, 0, Math.PI * 2)
        ctx.fill()
        // rear panel
        ctx.fillStyle = '#121820'
        ctx.beginPath()
        ctx.roundRect(px - pr * 0.36, py - pr * 0.16, pr * 0.72, pr * 0.3, pr * 0.08)
        ctx.fill()
        // freight light strip
        ctx.fillStyle = 'rgba(63,216,240,0.95)'
        ctx.shadowColor = 'rgba(63,216,240,0.9)'
        ctx.shadowBlur = pr * 0.25
        ctx.fillRect(px - pr * 0.28, py - pr * 0.03, pr * 0.56, Math.max(1.5, pr * 0.045))
        ctx.shadowBlur = 0
        // skid shadow on guideway
        ctx.fillStyle = 'rgba(0,0,0,0.35)'
        ctx.beginPath()
        ctx.ellipse(px, py + pr * 0.55, pr * 0.5, pr * 0.06, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // ---------- Network ----------
      if (tb > 0) {
        ctx.save()
        const na = ease(clamp01((tb - 0.25) / 0.75))
        ctx.globalAlpha = na
        const path = geoPath(proj, ctx)
        ctx.beginPath()
        path(land)
        ctx.fillStyle = '#151c23'
        ctx.fill()
        ctx.strokeStyle = '#26313c'
        ctx.lineWidth = 0.6
        ctx.stroke()

        const grow = ease(clamp01((tb - 0.35) / 0.65))
        for (const c of phase1Corridors) {
          const pts = c.path.map((id) => proj([hubById[id].lon, hubById[id].lat])!)
          // cumulative length for progressive drawing
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
          ctx.strokeStyle = '#3fd8f0'
          ctx.globalAlpha = na * (c.status === 'study' ? 1 : c.status === 'expansion' ? 0.6 : 0.5)
          ctx.lineWidth = c.status === 'study' ? 2.4 : 1.4
          ctx.setLineDash(c.status === 'conceptual' ? [1, 6] : [])
          ctx.lineCap = 'round'
          ctx.stroke()
          ctx.setLineDash([])

          // gentle pods on land corridors once drawn
          if (grow >= 1 && animatesPods(c) && t > TRANSITION_END && t < TRANSITION_END + IDLE_LIMIT) {
            const f = ((t - TRANSITION_END) * 0.08 * (300 / Math.max(120, total)) + c.id.length * 0.13) % 1
            let d = f * total
            for (let i = 1; i < pts.length; i++) {
              const seg = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1])
              if (d <= seg) {
                const x = pts[i - 1][0] + ((pts[i][0] - pts[i - 1][0]) * d) / seg
                const y = pts[i - 1][1] + ((pts[i][1] - pts[i - 1][1]) * d) / seg
                ctx.globalAlpha = na
                ctx.fillStyle = '#d6f8ff'
                ctx.shadowColor = 'rgba(63,216,240,0.9)'
                ctx.shadowBlur = 8
                ctx.beginPath()
                ctx.arc(x, y, 2.4, 0, Math.PI * 2)
                ctx.fill()
                ctx.shadowBlur = 0
                break
              }
              d -= seg
            }
          }
        }
        ctx.globalAlpha = na
        ctx.font = '11px "IBM Plex Mono", ui-monospace, monospace'
        ctx.textBaseline = 'middle'
        for (const h of phase1Hubs) {
          const p = proj([h.lon, h.lat])
          if (!p) continue
          ctx.fillStyle = h.role === 'hub' ? '#eef1f4' : '#0a0c0f'
          ctx.strokeStyle = '#b6bfca'
          ctx.lineWidth = 1.2
          ctx.beginPath()
          if (h.role === 'hub') ctx.arc(p[0], p[1], 3.4, 0, Math.PI * 2)
          else ctx.rect(p[0] - 2.6, p[1] - 2.6, 5.2, 5.2)
          ctx.fill()
          if (h.role !== 'hub') ctx.stroke()
          if (h.role === 'hub') {
            ctx.fillStyle = 'rgba(182,191,202,0.9)'
            const left = h.id === 'kunming' || h.id === 'fukuoka'
            ctx.textAlign = left ? 'right' : 'left'
            ctx.fillText(h.city.toUpperCase(), p[0] + (left ? -8 : 8), p[1])
          }
        }
        ctx.restore()
      }
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)

    let raf = 0
    let last = performance.now()
    const active = playing && inView && !reduced
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      timeRef.current += dt
      const t = timeRef.current
      draw(t)
      setStage(t < TUNNEL_END + 1 ? 'tube' : 'network')
      if (t < TRANSITION_END + IDLE_LIMIT) raf = requestAnimationFrame(loop)
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
    setStage('tube')
    setFinished(false)
    setPlaying(true)
    setRunId((r) => r + 1)
  }

  return (
    <figure className="hero-visual" aria-label="Animated illustration: a freight pod travels through a low-pressure tube, then the view pulls back to the proposed Phase 1 network.">
      <div className="hv-frame" ref={wrapRef}>
        <canvas ref={canvasRef} aria-hidden="true" />
        <div className="hv-hud hv-tl mono" aria-hidden="true">
          <span>AX-F01</span>
          <span className="muted">Freight pod · concept</span>
        </div>
        <div className="hv-hud hv-tr mono" aria-hidden="true">
          <span>{stage === 'tube' ? 'Low-pressure tube' : 'Phase 1 · proposed'}</span>
        </div>
      </div>
      <figcaption className="hv-bar">
        <span className="small muted hv-caption">
          {stage === 'tube'
            ? 'Inside the tube: pods move terminal to terminal at low air pressure.'
            : 'Proposed Phase 1 connections — candidate corridors, not confirmed routes.'}
        </span>
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
