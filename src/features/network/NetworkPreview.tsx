import NetworkMap from './NetworkMap'
import { phaseView } from './mapView'
import './network.css'

/** Static, non-interactive overview of all phases (homepage and presentation). */
export default function NetworkPreview({ playing = false }: { playing?: boolean }) {
  return (
    <NetworkMap
      mode="map"
      phase={3}
      systems={{ freight: true, passenger: true }}
      playing={playing}
      targetView={phaseView(3, 'map')}
      viewToken={0}
      interactive={false}
      label="Overview map of all three proposed geographic phases: China, Japan and Singapore; India and Europe; Africa and the Americas. Long-term ocean connections are shown dotted."
      className="preview"
    />
  )
}
