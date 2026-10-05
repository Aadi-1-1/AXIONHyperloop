import { Link } from 'react-router-dom'
import LeaderProfile from '../components/LeaderProfile'
import { Eyebrow, PageHeader } from '../components/common'
import { leadership, leadershipNotice } from '../data/leadership'
import { usePageTitle } from '../lib/hooks'
import './pages.css'

export default function LeadershipPage() {
  usePageTitle('Leadership')
  return (
    <>
      <PageHeader
        eyebrow="Company · Leadership"
        title="The leadership team."
        lead="Four executives share accountability for AXION’s strategy, technology, finances and operations. Each role maps to a part of the development programme."
      />
      <section className="section-tight" aria-labelledby="team-title">
        <div className="container">
          <h2 className="visually-hidden" id="team-title">
            Executive profiles
          </h2>
          <div className="leader-grid">
            {leadership.map((l) => (
              <LeaderProfile key={l.id} leader={l} />
            ))}
          </div>
          <p className="small muted" style={{ marginTop: 20 }}>
            {leadershipNotice}
          </p>
        </div>
      </section>
      <section className="section" aria-labelledby="gov-title">
        <div className="container grid-2">
          <div>
            <Eyebrow index="01">How the team works</Eyebrow>
            <h2 className="h2" id="gov-title">
              One programme, four lines of accountability.
            </h2>
          </div>
          <div className="prose">
            <p>
              <strong>Strategy and investment</strong> set the direction and investor relationships. <strong>Technology</strong>{' '}
              owns the technical concept and the test programme. <strong>Finance</strong> owns the model, costs, pricing and funding
              plan. <strong>Operations</strong> owns how the service would run and how customers would use it.
            </p>
            <p>
              Each feasibility gate draws on all four: customer validation is led commercially but tested technically and financially;
              the construction decision needs every part of the evidence.
            </p>
            <div className="cluster" style={{ marginTop: 24 }}>
              <Link to="/investors" className="btn btn-primary">
                For Investors <span className="arrow" aria-hidden="true">→</span>
              </Link>
              <Link to="/present/leadership" className="btn">
                Presentation: leadership chapter
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
