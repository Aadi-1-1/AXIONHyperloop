import { hubById, type Corridor } from '../data/network'

const R = 6371

/** Great-circle distance in km between two [lon, lat] points (haversine). */
export function greatCircleKm(a: [number, number], b: [number, number]): number {
  const toRad = (d: number) => (d * Math.PI) / 180
  const dLat = toRad(b[1] - a[1])
  const dLon = toRad(b[0] - a[0])
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)))
}

/** Sum of straight-line segment distances along a corridor's hub path. */
export function corridorStraightLineKm(c: Corridor): number {
  let total = 0
  for (let i = 1; i < c.path.length; i++) {
    const a = hubById[c.path[i - 1]]
    const b = hubById[c.path[i]]
    total += greatCircleKm([a.lon, a.lat], [b.lon, b.lat])
  }
  return total
}

export function formatKm(km: number): string {
  const rounded = km >= 1000 ? Math.round(km / 10) * 10 : Math.round(km / 5) * 5
  return `≈${rounded.toLocaleString('en-US')} km`
}

export function formatCoord(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S'
  const ew = lon >= 0 ? 'E' : 'W'
  return `${Math.abs(lat).toFixed(2)}°${ns} ${Math.abs(lon).toFixed(2)}°${ew}`
}
