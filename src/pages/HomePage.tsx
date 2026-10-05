import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import ShipmentJourney from '../features/journey/ShipmentJourney'
import LeaderProfile from '../components/LeaderProfile'
import { Eyebrow, KindTag, SourceRef, SystemChip } from '../components/common'
import { benefits, company, problem, products } from '../data/company'
import { leadership } from '../data/leadership'
import { phases } from '../data/network'
import { developmentProgramme, operatingDefaults } from '../data/finance'
import { constructionCost, operatingBreakEven, pct, usdCompact, usdPerKg } from '../lib/finance'
import './home.css'
import { usePageTitle } from '../lib/hooks'
import './pages.css'

const NetworkPreview = lazy(() => import('../features/network/NetworkPreview'))
const HeroVisual = lazy(() => import('../features/hero/HeroVisual'))

export default function HomePage() {
  usePageTitle('')
  const be = operatingBreakEven(operatingDefaults)
  const cc = constructionCost()

  return (
    <>
      {/* ---------- Opening ---------- */}
      <section className="hero tech-grid" aria-labelledby="hero-title">
        <div className="container hero-grid">
          <div className="hero-copy">
            <p className="stage-pill">
              <span className="dot" aria-hidden="true" /> {company.stage}
            </p>
            <h1 className="display" id="hero-title">
              Move goods.
              <br />
              <span className="hero-accent">Connect people.</span>
            </h1>
            <p className="lead hero-lead">
              AXION proposes to build and operate <strong>Hyperloop freight corridors</strong> between major logistics hubs —
              selling reserved, terminal-to-terminal capacity to logistics companies. A separate passenger system would
              follow on selected corridors.
            </p>
            <div className="cluster hero-ctas">
              <Link to="/network" className="btn btn-primary">
                Explore Network <span className="arrow" aria-hidden="true">→</span>
              </Link>
              <Link to="/present/vision" className="btn">
                Start Investor Presentation
              </Link>
            </div>
            <dl className="hero-facts">
              <div>
                <dt className="label">Focus</dt>
                <dd>Freight first</dd>
              </div>
              <div>
                <dt className="label">Proposed HQ</dt>
                <dd>Singapore</dd>
              </div>
              <div>
                <dt className="label">Seeking</dt>
                <dd>{usdCompact(developmentProgramme.askUsd)} development round</dd>
              </div>
            </dl>
          </div>
          <div className="hero-visual-wrap">
            <Suspense fallback={<div className="hv-frame hv-placeholder" aria-hidden="true" />}>
              <HeroVisual />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ---------- What we propose ---------- */}
      <section className="section" aria-labelledby="business-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="01">The proposal</Eyebrow>
              <h2 className="h2" id="business-title">
                We would own the corridor. Partners own the doorstep.
              </h2>
            </div>
            <p className="lead">
              AXION would develop, own and operate Hyperloop networks with specialist engineering partners. Existing logistics
              providers keep doing what they do best — collection and final delivery.
            </p>
          </div>
          <ol className="proposal-steps">
            {[
              { k: 'Develop', b: 'Select corridors, design systems and secure approvals — with specialist technology partners.' },
              { k: 'Own', b: 'Hold the tubes, terminals and pods as long-term infrastructure assets.' },
              { k: 'Operate', b: 'Run terminal-to-terminal freight service with tracking and estimated-arrival visibility.' },
              { k: 'Integrate', b: 'Connect terminals to customers’ logistics networks, so collection and delivery stay with partners.' },
            ].map((s, i) => (
              <li key={s.k} className="reveal">
                <span className="mono step-idx">0{i + 1}</span>
                <h3 className="h3">{s.k}</h3>
                <p className="body-2 small">{s.b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Problem ---------- */}
      <section className="section problem" aria-labelledby="problem-title">
        <div className="container grid-2 problem-grid">
          <div>
            <Eyebrow index="02">The logistics problem</Eyebrow>
            <h2 className="h2" id="problem-title">
              {problem.headline}
            </h2>
            <figure className="stat-figure reveal">
              <p className="stat-row">
                <span className="figure-num stat-big">~35%</span>
                <span className="stat-text">of world trade by value moves by air —</span>
              </p>
              <p className="stat-row">
                <span className="figure-num stat-big muted">&lt;1%</span>
                <span className="stat-text">of it by volume.</span>
              </p>
              <figcaption className="small muted stat-cap">
                <KindTag kind="sourced" /> High-value goods already pay for speed. <SourceRef id="iata-air-cargo" />
              </figcaption>
            </figure>
          </div>
          <div className="problem-points">
            {problem.points.map((p, i) => (
              <div key={p.title} className="problem-point reveal">
                <span className="mono step-idx">0{i + 1}</span>
                <div>
                  <h3 className="h4">{p.title}</h3>
                  <p className="body-2">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Products ---------- */}
      <section className="section" aria-labelledby="products-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="03">Products</Eyebrow>
              <h2 className="h2" id="products-title">
                Two systems. One clear priority.
              </h2>
            </div>
            <p className="body-2">
              Freight is the early commercial focus. Passenger service is a separate system — separate infrastructure, costs,
              safety case and milestones — and sits outside the current development budget.
            </p>
          </div>
          <div className="products">
            {products.map((p) => (
              <article key={p.id} className={`product product-${p.system} reveal`}>
                <div className="product-head">
                  <SystemChip system={p.system} />
                  <span className="label">{p.status}</span>
                </div>
                <h3 className="h2 product-name">{p.name}</h3>
                <p className="body-2">{p.summary}</p>
                <ul className="product-features">
                  {p.features.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Journey ---------- */}
      <section className="section" id="journey" aria-labelledby="journey-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="04">Shipment journey</Eyebrow>
              <h2 className="h2" id="journey-title">
                Follow one shipment, door to door.
              </h2>
            </div>
            <p className="body-2">
              Select a stage or step through the journey. AXION runs terminal to terminal; partners handle the ends. Toggle
              cross-border to see where customs and inspection fit.
            </p>
          </div>
          <ShipmentJourney />
        </div>
      </section>

      {/* ---------- Benefits ---------- */}
      <section className="section" aria-labelledby="benefits-title">
        <div className="container grid-2">
          <div>
            <Eyebrow index="05">Customer benefits</Eyebrow>
            <h2 className="h2" id="benefits-title">
              What customers would buy is time they can rely on.
            </h2>
            <p className="body-2" style={{ marginTop: 20, maxWidth: '46ch' }}>
              These are the outcomes AXION would have to prove with customers. None is assumed — each becomes a test in the
              feasibility programme.
            </p>
          </div>
          <ul className="benefit-list">
            {benefits.map((b) => (
              <li key={b.title} className="reveal">
                <h3 className="h4">{b.title}</h3>
                <p className="body-2 small">{b.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Network preview ---------- */}
      <section className="section" aria-labelledby="network-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="06">Network vision</Eyebrow>
              <h2 className="h2" id="network-title">
                Start regional. Expand only on evidence.
              </h2>
            </div>
            <p className="body-2">
              Three geographic phases set the order of ambition. No launch corridor has been selected, and no route is promised
              a completion date.
            </p>
          </div>
          <div className="network-preview">
            <Suspense fallback={<div className="np-fallback" />}>
              <NetworkPreview />
            </Suspense>
            <ol className="phase-list">
              {phases.map((p) => (
                <li key={p.id}>
                  <span className="mono step-idx">Phase {p.id}</span>
                  <span className="h4">{p.regions}</span>
                </li>
              ))}
              <li className="phase-cta">
                <Link to="/network" className="btn btn-primary">
                  Explore the network <span className="arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* ---------- Commercial model preview ---------- */}
      <section className="section" aria-labelledby="model-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="07">Commercial model</Eyebrow>
              <h2 className="h2" id="model-title">
                Recurring capacity contracts — and an honest financing challenge.
              </h2>
            </div>
            <p className="body-2">
              Revenue would come from reserved capacity under recurring contracts, plus additional shipments when space allows.
              The figures below come from an illustrative 100 km corridor model.
            </p>
          </div>
          <dl className="model-stats">
            <div className="reveal">
              <dt className="label">Assumed average charge</dt>
              <dd className="figure-num">{usdPerKg(operatingDefaults.pricePerKg)}</dd>
              <dd className="small muted">
                <KindTag kind="assumption" />
              </dd>
            </div>
            <div className="reveal">
              <dt className="label">Operating break-even</dt>
              <dd className="figure-num">{be.kind === 'finite' ? `≈${pct(be.utilisation)}` : 'None'}</dd>
              <dd className="small muted">
                <KindTag kind="calculated" /> utilisation
              </dd>
            </div>
            <div className="reveal">
              <dt className="label">Illustrative construction</dt>
              <dd className="figure-num">{usdCompact(cc.total)}</dd>
              <dd className="small muted">
                <KindTag kind="calculated" /> 100 km, incl. contingency
              </dd>
            </div>
          </dl>
          <p className="notice warn" style={{ marginTop: 28 }}>
            <span>
              A positive operating result does not make a corridor investable: the illustrative {usdCompact(cc.total)} construction
              cost is a serious financing challenge, shown openly in the{' '}
              <Link to="/business#financing-challenge" className="text-link">
                business model
              </Link>
              .
            </span>
          </p>
          <div className="cluster" style={{ marginTop: 28 }}>
            <Link to="/business#operating-model" className="btn">
              Try the operating explorer
            </Link>
            <Link to="/business" className="btn btn-ghost">
              Read the business model →
            </Link>
          </div>
        </div>
      </section>

      {/* ---------- Leadership preview ---------- */}
      <section className="section" aria-labelledby="team-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="08">Leadership</Eyebrow>
              <h2 className="h2" id="team-title">
                Four executives, four clear responsibilities.
              </h2>
            </div>
            <p className="body-2">
              <Link to="/leadership" className="text-link">
                Meet the leadership team
              </Link>{' '}
              and see who is accountable for strategy, technology, finance and operations.
            </p>
          </div>
          <div className="leader-grid compact">
            {leadership.map((l) => (
              <LeaderProfile key={l.id} leader={l} variant="compact" />
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Investor invitation ---------- */}
      <section className="section invite" aria-labelledby="invite-title">
        <div className="container invite-grid">
          <div>
            <Eyebrow>For investors</Eyebrow>
            <h2 className="h1 invite-title" id="invite-title">
              {usdCompact(developmentProgramme.askUsd)} to find out, with evidence, whether a first corridor should be built.
            </h2>
          </div>
          <div className="invite-side">
            <p className="lead">
              A three-year feasibility and demonstration programme with five decision gates. No revenue is assumed, and further
              financing would be needed before construction.
            </p>
            <div className="cluster">
              <Link to="/investors" className="btn btn-primary">
                For Investors <span className="arrow" aria-hidden="true">→</span>
              </Link>
              <Link to="/present/vision" className="btn">
                Start Investor Presentation
              </Link>
              <Link to="/evidence" className="btn btn-ghost">
                Evidence &amp; assumptions
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
