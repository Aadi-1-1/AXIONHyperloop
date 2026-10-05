import { Link } from 'react-router-dom'
import Logo from './Logo'
import { company } from '../data/company'

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-top">
          <div className="footer-brand">
            <Logo />
            <p className="footer-tagline">{company.tagline}</p>
            <p className="small muted" style={{ maxWidth: '44ch' }}>
              {company.stageNotice}
            </p>
          </div>
          <nav className="footer-cols" aria-label="Footer">
            <div>
              <p className="label">Company</p>
              <ul>
                <li><Link to="/">Overview</Link></li>
                <li><Link to="/leadership">Leadership</Link></li>
                <li><Link to="/evidence">Evidence &amp; Assumptions</Link></li>
              </ul>
            </div>
            <div>
              <p className="label">Explore</p>
              <ul>
                <li><Link to="/network">Network explorer</Link></li>
                <li><Link to="/network#technology">Technology</Link></li>
                <li><Link to="/business">Business Model</Link></li>
                <li><Link to="/business#corridor-model">Lead corridor economics</Link></li>
                <li><Link to="/investors">For Investors</Link></li>
              </ul>
            </div>
            <div>
              <p className="label">Presentation</p>
              <ul>
                <li><Link to="/present/vision">Start from the beginning</Link></li>
                <li><Link to="/present/lead-corridor">Lead study corridor</Link></li>
                <li><Link to="/present/economics">Economic conditions</Link></li>
                <li><Link to="/present/ask">Funding ask</Link></li>
              </ul>
            </div>
          </nav>
        </div>
        <div className="footer-bottom">
          <span className="label">{company.stage}</span>
          <span className="small muted">
            Proposed headquarters: Singapore · All financial figures are illustrative model assumptions in USD
          </span>
        </div>
      </div>
    </footer>
  )
}
