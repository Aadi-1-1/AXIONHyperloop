import NetworkMap from './NetworkMap'
import { phaseView } from './mapView'
import './network.css'

/** Static, non-interactive global overview (presentation). */
export default function NetworkPreview({ playing = false }: { playing?: boolean }) {
  return (
    <NetworkMap
      mode="map"
      phaseHighlight={0}
      systems={{ freight: true, passenger: true }}
      playing={playing}
      targetView={phaseView(3, 'map')}
      viewToken={0}
      interactive={false}
      label="Global overview of all proposed regional networks and long-term conceptual connections."
      className="preview"
    />
  )
}
