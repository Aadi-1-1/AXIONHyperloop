import { feasibilityGates, passengerGateNote } from '../../data/technology'
import './gates.css'

export default function Gates({ showDeliverables = true }: { showDeliverables?: boolean }) {
  return (
    <div className="gates">
      <ol className="gate-track">
        {feasibilityGates.map((g) => (
          <li key={g.id} className="gate">
            <div className="gate-marker" aria-hidden="true">
              <span className="mono">{g.index}</span>
            </div>
            <p className="label gate-timing">{g.timing}</p>
            <h3 className="h4">{g.name}</h3>
            <p className="small body-2 gate-question">{g.question}</p>
            {showDeliverables && (
              <ul className="gate-deliverables small">
                {g.deliverables.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ol>
      <p className="notice warn small gate-passenger">
        <span>
          <strong>Passenger development.</strong> {passengerGateNote}
        </span>
      </p>
    </div>
  )
}
