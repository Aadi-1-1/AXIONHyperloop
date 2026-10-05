import { describe, expect, it } from 'vitest'
import { animatesPods, corridors, hubById, hubs } from '../src/data/network'
import { corridorStraightLineKm, greatCircleKm } from '../src/lib/geo'

describe('network data integrity', () => {
  it('has unique hub and corridor ids', () => {
    expect(new Set(hubs.map((h) => h.id)).size).toBe(hubs.length)
    expect(new Set(corridors.map((c) => c.id)).size).toBe(corridors.length)
  })

  it('has valid coordinates', () => {
    for (const h of hubs) {
      expect(h.lat).toBeGreaterThanOrEqual(-90)
      expect(h.lat).toBeLessThanOrEqual(90)
      expect(h.lon).toBeGreaterThanOrEqual(-180)
      expect(h.lon).toBeLessThanOrEqual(180)
    }
  })

  it('references only existing hubs, with phase no earlier than its endpoints', () => {
    for (const c of corridors) {
      expect(c.path.length).toBeGreaterThanOrEqual(2)
      for (const id of c.path) {
        expect(hubById[id], `${c.id} → ${id}`).toBeDefined()
        expect(hubById[id].phase).toBeLessThanOrEqual(c.phase)
      }
    }
  })

  it('never animates pods across unresolved sea or ocean crossings', () => {
    for (const c of corridors) {
      if (c.crossing === 'sea' || c.crossing === 'ocean' || c.status === 'conceptual') {
        expect(animatesPods(c)).toBe(false)
      }
    }
  })

  it('does not present any corridor as selected for launch', () => {
    const statuses = new Set(corridors.map((c) => c.status))
    expect([...statuses].every((s) => ['study', 'expansion', 'conceptual'].includes(s))).toBe(true)
    // More than one candidate keeps "under study" from implying a chosen route.
    expect(corridors.filter((c) => c.status === 'study').length).toBeGreaterThan(1)
  })

  it('computes plausible great-circle distances', () => {
    // Singapore — Kuala Lumpur is roughly 300 km apart.
    const km = greatCircleKm([103.8198, 1.3521], [101.6869, 3.139])
    expect(km).toBeGreaterThan(280)
    expect(km).toBeLessThan(330)
    const tokyoOsaka = corridorStraightLineKm(corridors.find((c) => c.id === 'tokyo-osaka')!)
    expect(tokyoOsaka).toBeGreaterThan(380)
    expect(tokyoOsaka).toBeLessThan(420)
  })
})
