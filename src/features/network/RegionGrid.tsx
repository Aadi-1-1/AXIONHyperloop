import { Link } from 'react-router-dom'
import FlatMap from './FlatMap'
import type { LonLat } from './mapRender'
import { corridorsForRegion, hubs, regions, statusMeta } from '../../data/network'
import './network.css'

/** Small multiples: every regional network drawn complete, each linking to its focused view. */
export default function RegionGrid({ linkPrefix = '/network?view=regional&region=' }: { linkPrefix?: string }) {
  return (
    <ul className="region-grid">
      {regions.map((r) => {
        const regionHubs = hubs.filter((h) => h.region === r.id)
        const list = corridorsForRegion(r.id).filter((c) => c.regions.includes(r.id))
        const lead = list.find((c) => c.status === 'lead')
        return (
          <li key={r.id}>
            <Link to={`${linkPrefix}${r.id}`} className="region-card" aria-label={`Open the ${r.label} network`}>
              <FlatMap
                compact
                frame={[...r.frame, ...regionHubs.map((h) => [h.lon, h.lat] as LonLat)]}
                frameKey={r.id}
                corridorIds={list.map((c) => c.id)}
                hubIds={regionHubs.map((h) => h.id)}
                labelHubs={new Set(regionHubs.map((h) => h.id))}
                systems={{ freight: true, passenger: false }}
                playing={false}
                label={`${r.label}: ${list.map((c) => c.name).join('; ')}`}
              />
              <span className="region-card-text">
                <span className="label">Phase {r.phase}</span>
                <span className="region-card-title">{r.label}</span>
                {lead && <span className="small freight-text">{statusMeta.lead.short}</span>}
              </span>
            </Link>
          </li>
        )
      })}
    </ul>
  )
}
