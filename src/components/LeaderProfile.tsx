import type { Leader } from '../data/leadership'
import './leader.css'

/** Typographic profile. If a portrait path is supplied in the data it replaces the monogram. */
export default function LeaderProfile({ leader, variant = 'full' }: { leader: Leader; variant?: 'full' | 'compact' }) {
  return (
    <article className={`leader leader-${variant}`} aria-labelledby={`leader-${leader.id}`}>
      <div className="leader-portrait">
        {leader.portrait ? (
          <img src={leader.portrait} alt={`Portrait of ${leader.name}`} loading="lazy" />
        ) : (
          <span className="leader-monogram" aria-hidden="true">
            {leader.initials}
          </span>
        )}
      </div>
      <div className="leader-body">
        <p className="label leader-focus">{leader.focus}</p>
        <h3 className="h3" id={`leader-${leader.id}`}>
          {leader.name}
        </h3>
        <p className="leader-role">{leader.role}</p>
        {variant === 'full' && <p className="body-2 small leader-desc">{leader.description}</p>}
        <ul className="leader-resp" aria-label="Responsibilities">
          {leader.responsibilities.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      </div>
    </article>
  )
}
