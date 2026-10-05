import { describe, expect, it } from 'vitest'
import { animatesPods, corridors, corridorsForRegion, hubById, hubs, regions } from '../src/data/network'
import { corridorStraightLineKm, greatCircleKm } from '../src/lib/geo'
import { connectedByProposedCorridor, traceJourney } from '../src/lib/trace'

describe('network data integrity', () => {
  it('has unique hub and corridor ids', () => {
    expect(new Set(hubs.map((h) => h.id)).size).toBe(hubs.length)
    expect(new Set(corridors.map((c) => c.id)).size).toBe(corridors.length)
  })

  it('places every hub inside its region frame', () => {
    for (const h of hubs) {
      const r = regions.find((x) => x.id === h.region)!
      const [[lon0, lat0], [lon1, lat1]] = r.frame
      expect(h.lon, h.id).toBeGreaterThanOrEqual(lon0)
      expect(h.lon, h.id).toBeLessThanOrEqual(lon1)
      expect(h.lat, h.id).toBeGreaterThanOrEqual(lat0)
      expect(h.lat, h.id).toBeLessThanOrEqual(lat1)
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

  it('connects every active hub by a proposed corridor; unconnected cities are marked future', () => {
    for (const h of hubs) {
      if (h.role === 'future') expect(connectedByProposedCorridor(h.id), h.id).toBe(false)
      else expect(connectedByProposedCorridor(h.id), h.id).toBe(true)
    }
    expect(hubById['los-angeles'].role).toBe('future')
  })

  it('keeps transit nodes as intermediate points of a corridor', () => {
    for (const h of hubs.filter((x) => x.role === 'transit')) {
      expect(corridors.some((c) => c.path.indexOf(h.id) > 0 && c.path.indexOf(h.id) < c.path.length - 1)).toBe(true)
    }
  })

  it('has exactly one lead study corridor, Singapore — Kuala Lumpur, with an assumed alignment', () => {
    const lead = corridors.filter((c) => c.status === 'lead')
    expect(lead.map((c) => c.id)).toEqual(['singapore-kuala-lumpur'])
    const km = corridorStraightLineKm(lead[0])
    expect(lead[0].assumedAlignmentKm).toBeGreaterThan(km)
    // Only the lead corridor carries an alignment assumption.
    expect(corridors.filter((c) => c.assumedAlignmentKm).length).toBe(1)
  })

  it('never animates pods across unresolved sea or ocean crossings', () => {
    for (const c of corridors) {
      if (c.crossing === 'sea' || c.crossing === 'ocean' || c.status === 'conceptual') expect(animatesPods(c)).toBe(false)
    }
  })

  it('gives every region at least one proposed corridor', () => {
    for (const r of regions) expect(corridorsForRegion(r.id).some((c) => c.status !== 'conceptual'), r.id).toBe(true)
  })

  it('computes plausible great-circle distances', () => {
    const km = greatCircleKm([103.8198, 1.3521], [101.6869, 3.139])
    expect(km).toBeGreaterThan(280)
    expect(km).toBeLessThan(330)
  })
})

describe('trace this journey', () => {
  const via = (r: ReturnType<typeof traceJourney>) =>
    'segments' in r ? [r.segments[0].from, ...r.segments.map((s) => s.to)] : []

  it('traces the lead corridor directly', () => {
    const r = traceJourney('singapore', 'kuala-lumpur')
    expect(r.kind).toBe('proposed')
    expect(via(r)).toEqual(['singapore', 'kuala-lumpur'])
  })

  it('follows intermediate nodes from Kunming to Singapore', () => {
    const r = traceJourney('kunming', 'singapore')
    expect(r.kind).toBe('proposed')
    expect(via(r)).toEqual(['kunming', 'vientiane', 'bangkok', 'kuala-lumpur', 'singapore'])
  })

  it('follows the India chain from Delhi to Chennai', () => {
    expect(via(traceJourney('delhi', 'chennai'))).toEqual(['delhi', 'mumbai', 'bengaluru', 'chennai'])
  })

  it('reaches Japan from China only through the conceptual sea link, and says so', () => {
    const r = traceJourney('shanghai', 'tokyo')
    expect(r.kind).toBe('conceptual')
    if (r.kind === 'conceptual') {
      expect(r.conceptualCount).toBe(1)
      expect(r.segments.find((s) => s.status === 'conceptual')?.corridorId).toBe('shanghai-fukuoka')
      expect(via(r)).toEqual(['shanghai', 'fukuoka', 'osaka', 'tokyo'])
    }
  })

  it('reports no continuous connection between Nairobi and Johannesburg', () => {
    const r = traceJourney('nairobi', 'johannesburg')
    expect(r.kind).toBe('none')
    if (r.kind === 'none') expect(r.reachableFromOrigin).toEqual(['mombasa'])
  })

  it('reaches Los Angeles only through conceptual links', () => {
    const r = traceJourney('tokyo', 'los-angeles')
    expect(r.kind).toBe('conceptual')
  })

  it('never invents a segment that is not in the data', () => {
    const ids = new Set(corridors.map((c) => c.id))
    for (const [a, b] of [
      ['beijing', 'singapore'],
      ['paris', 'milan'],
      ['delhi', 'singapore'],
    ]) {
      const r = traceJourney(a, b)
      if ('segments' in r) for (const s of r.segments) {
        expect(ids.has(s.corridorId)).toBe(true)
        const c = corridors.find((x) => x.id === s.corridorId)!
        const i = c.path.indexOf(s.from)
        const j = c.path.indexOf(s.to)
        expect(Math.abs(i - j)).toBe(1)
      }
    }
  })
})
