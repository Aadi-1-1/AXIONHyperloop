import { Link } from 'react-router-dom'

/** One site-wide statement of status, so individual sections don't need to repeat the same caveat. */
export default function StatusBanner() {
  return (
    <div className="status-banner" role="note">
      <div className="container status-banner-inner">
        <span className="status-dot" aria-hidden="true" />
        <span>
          <strong>Concept-stage proposal.</strong>{' '}
          <span className="sb-long">
            Not incorporated, funded or operating; no customers or partners. Routes are proposals and all figures are illustrative
            model assumptions.
          </span>
          <span className="sb-short">Figures are illustrative.</span>
        </span>
        <Link to="/evidence" className="status-link">
          <span className="sb-long">Evidence &amp; assumptions</span><span className="sb-short">Evidence</span> →
        </Link>
      </div>
    </div>
  )
}
