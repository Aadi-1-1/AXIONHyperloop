import { corridors, hubById, type Corridor, type CorridorStatus, type Crossing } from '../data/network'
import { greatCircleKm } from './geo'

export type Segment = {
  from: string
  to: string
  corridorId: string
  corridorName: string
  status: CorridorStatus
  crossing: Crossing
  km: number
}

export type TraceResult =
  /** Every segment is a proposed (lead, comparison or expansion) corridor. */
  | { kind: 'proposed'; segments: Segment[]; km: number }
  /** A route exists only by using one or more long-term conceptual links. */
  | { kind: 'conceptual'; segments: Segment[]; km: number; conceptualCount: number }
  /** No chain of drawn segments connects the two hubs. */
  | { kind: 'none'; reachableFromOrigin: string[] }
  | { kind: 'same' }

type Edge = Segment

function buildEdges(list: Corridor[]): Map<string, Edge[]> {
  const adj = new Map<string, Edge[]>()
  const add = (e: Edge) => {
    if (!adj.has(e.from)) adj.set(e.from, [])
    adj.get(e.from)!.push(e)
  }
  for (const c of list) {
    for (let i = 1; i < c.path.length; i++) {
      const a = hubById[c.path[i - 1]]
      const b = hubById[c.path[i]]
      const km = greatCircleKm([a.lon, a.lat], [b.lon, b.lat])
      const base = { corridorId: c.id, corridorName: c.name, status: c.status, crossing: c.crossing, km }
      add({ ...base, from: a.id, to: b.id })
      add({ ...base, from: b.id, to: a.id })
    }
  }
  return adj
}

const proposedEdges = buildEdges(corridors.filter((c) => c.status !== 'conceptual'))
const allEdges = buildEdges(corridors)

/** Dijkstra by great-circle km. Conceptual edges carry a large penalty so they are used only when unavoidable. */
function shortest(adj: Map<string, Edge[]>, from: string, to: string): Segment[] | null {
  const dist = new Map<string, number>([[from, 0]])
  const prev = new Map<string, Edge>()
  const done = new Set<string>()
  while (true) {
    let node: string | null = null
    let best = Infinity
    for (const [n, d] of dist) if (!done.has(n) && d < best) ((best = d), (node = n))
    if (node === null) return null
    if (node === to) break
    done.add(node)
    for (const e of adj.get(node) ?? []) {
      const w = e.km + (e.status === 'conceptual' ? 100_000 : 0)
      const nd = best + w
      if (nd < (dist.get(e.to) ?? Infinity)) {
        dist.set(e.to, nd)
        prev.set(e.to, e)
      }
    }
  }
  const segs: Segment[] = []
  let cur = to
  while (cur !== from) {
    const e = prev.get(cur)!
    segs.unshift(e)
    cur = e.from
  }
  return segs
}

function component(adj: Map<string, Edge[]>, start: string): string[] {
  const seen = new Set([start])
  const stack = [start]
  while (stack.length) for (const e of adj.get(stack.pop()!) ?? []) if (!seen.has(e.to)) (seen.add(e.to), stack.push(e.to))
  return [...seen]
}

export function traceJourney(from: string, to: string): TraceResult {
  if (from === to) return { kind: 'same' }
  const proposed = shortest(proposedEdges, from, to)
  if (proposed) return { kind: 'proposed', segments: proposed, km: sumKm(proposed) }
  const any = shortest(allEdges, from, to)
  if (any)
    return {
      kind: 'conceptual',
      segments: any,
      km: sumKm(any),
      conceptualCount: any.filter((s) => s.status === 'conceptual').length,
    }
  return { kind: 'none', reachableFromOrigin: component(proposedEdges, from).filter((id) => id !== from) }
}

function sumKm(s: Segment[]) {
  return s.reduce((a, b) => a + b.km, 0)
}

/** Hubs touched by at least one non-conceptual corridor. */
export function connectedByProposedCorridor(hubId: string): boolean {
  return (proposedEdges.get(hubId) ?? []).length > 0
}
