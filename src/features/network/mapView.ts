import { phases, type PhaseId } from '../../data/network'

export type MapMode = 'globe' | 'map'
export type MapView = { lon: number; lat: number; zoom: number }

const ZOOM = {
  globe: { 1: 1.55, 2: 1.0, 3: 0.95 },
  map: { 1: 3.0, 2: 1.6, 3: 1.0 },
} as const

export function phaseView(phase: PhaseId, mode: MapMode): MapView {
  const p = phases.find((x) => x.id === phase)!
  return { lon: p.focus.lon, lat: mode === 'map' && phase === 3 ? 0 : p.focus.lat, zoom: ZOOM[mode][phase] }
}

