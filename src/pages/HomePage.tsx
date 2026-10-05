import { lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import ShipmentJourney from '../features/journey/ShipmentJourney'
import FundingLadder from '../features/finance/FundingLadder'
import { Eyebrow, KindTag, SourceRef, SystemChip } from '../components/common'
import { benefits, company, customerSegments, problem, products } from '../data/company'
import { leadership } from '../data/leadership'
import { corridors, hubById, leadCorridor } from '../data/network'
import { developmentProgramme } from '../data/finance'
import { centralInputs } from '../data/corridorModel'
import { runCorridorModel } from '../lib/corridorModel'
import { usdCompact } from '../lib/finance'
import { formatKm } from '../lib/geo'
import { usePageTitle } from '../lib/hooks'
import './home.css'
import './pages.css'

const HeroVisual = lazy(() => import('../features/hero/HeroVisual'))
const FlatMap = lazy(() => import('../features/network/FlatMap'))
const RegionGrid = lazy(() => import('../features/network/RegionGrid'))

const lead = runCorridorModel(centralInputs)

export default function HomePage() {
  usePageTitle('')

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
              AXION proposes to build and operate <strong>hyperloop freight corridors</strong> between major logistics hubs,
              selling reserved terminal-to-terminal capacity to logistics companies. Development would start with one lead study
              corridor: <strong>Singapore–Kuala Lumpur</strong>.
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
                <dt className="label">Customers</dt>
                <dd>Logistics companies</dd>
              </div>
              <div>
                <dt className="label">Lead study corridor</dt>
                <dd>Singapore–KL</dd>
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

      {/* ---------- What AXION does / who pays ---------- */}
      <section className="section" aria-labelledby="does-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="01">What AXION does</Eyebrow>
              <h2 className="h2" id="does-title">
                We would sell reserved capacity. Logistics companies would pay for it.
              </h2>
            </div>
            <p className="lead">
              AXION would develop, own and operate the corridor with specialist engineering partners. Logistics providers and large
              shippers would book capacity and keep collection and final delivery.
            </p>
          </div>
          <div className="does-grid">
            <div className="products-compact">
              {products.map((p) => (
                <article key={p.id} className={`product-mini product-${p.system}`}>
                  <div className="cluster" style={{ ['--gap' as string]: '10px' }}>
                    <SystemChip system={p.system} />
                    <span className="label">{p.status}</span>
                  </div>
                  <h3 className="h3">{p.name}</h3>
                  <p className="small body-2">{p.summary}</p>
                </article>
              ))}
            </div>
            <div>
              <p className="label" style={{ marginBottom: 10 }}>
                Who pays: freight that values time
              </p>
              <ul className="payer-list">
                {customerSegments.map((s) => (
                  <li key={s.title}>
                    <strong>{s.title}</strong>
                    <span className="small muted">{s.body}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Journey ---------- */}
      <section className="section" id="journey" aria-labelledby="journey-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="02">How a shipment moves</Eyebrow>
              <h2 className="h2" id="journey-title">
                Follow one shipment, door to door.
              </h2>
            </div>
            <p className="body-2">
              AXION runs terminal to terminal; partners handle both ends. Step through the stages, and switch on cross-border to see
              where customs fits.
            </p>
          </div>
          <ShipmentJourney />
        </div>
      </section>

      {/* ---------- Why useful ---------- */}
      <section className="section" aria-labelledby="why-title">
        <div className="container grid-2 problem-grid">
          <div>
            <Eyebrow index="03">Why it could be useful</Eyebrow>
            <h2 className="h2" id="why-title">
              {problem.headline}
            </h2>
            <figure className="stat-figure">
              <p className="stat-row">
                <span className="figure-num stat-big">~35%</span>
                <span className="stat-text">of world trade by value moves by air,</span>
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
          <ul className="benefit-list">
            {benefits.map((b) => (
              <li key={b.title}>
                <h3 className="h4">{b.title}</h3>
                <p className="body-2 small">{b.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Where development starts ---------- */}
      <section className="section" aria-labelledby="start-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="04">Where development starts</Eyebrow>
              <h2 className="h2" id="start-title">
                One lead corridor first. Regional networks only on evidence.
              </h2>
            </div>
            <p className="body-2">
              Singapore–Kuala Lumpur is the proposed lead study corridor; its feasibility is unverified. Every regional network below is
              drawn complete. Separate networks stay separate.
            </p>
          </div>
          <div className="lead-card">
            <div className="lead-map">
              <Suspense fallback={<div className="np-fallback" />}>
                <FlatMap
                  frame={leadCorridor.path.map((id) => [hubById[id].lon, hubById[id].lat] as [number, number])}
                  frameKey="home-lead"
                  corridorIds={corridors.filter((c) => c.status !== 'conceptual' && (c.path.includes('singapore') || c.path.includes('kuala-lumpur'))).map((c) => c.id)}
                  emphasis={new Set([leadCorridor.id])}
                  hubIds={['singapore', 'kuala-lumpur']}
                  endpoints={new Set(leadCorridor.path)}
                  systems={{ freight: true, passenger: false }}
                  playing
                  label="Map of the Singapore–Kuala Lumpur lead study corridor."
                />
              </Suspense>
            </div>
            <div className="lead-facts">
              <p className="label freight-text">Proposed lead study corridor · feasibility unverified</p>
              <h3 className="h3">Singapore — Kuala Lumpur</h3>
              <dl className="kv">
                <div>
                  <dt>Geographic distance</dt>
                  <dd className="mono">{formatKm(lead.geographicKm)}</dd>
                </div>
                <div>
                  <dt>Assumed alignment</dt>
                  <dd className="mono">{centralInputs.alignmentKm} km, not surveyed</dd>
                </div>
                <div>
                  <dt>Scope</dt>
                  <dd>Twin tubes, freight first</dd>
                </div>
                <div>
                  <dt>Central capacity</dt>
                  <dd className="mono">{(lead.capacity.capacityT / 1e6).toFixed(1)} Mt a year</dd>
                </div>
                <div>
                  <dt>Central construction</dt>
                  <dd className="mono">≈${(lead.capex.total / 1e9).toFixed(1)}bn</dd>
                </div>
              </dl>
              <div className="cluster">
                <Link to="/network?view=corridor&corridor=singapore-kuala-lumpur" className="btn btn-sm">
                  Corridor view
                </Link>
                <Link to="/business#corridor-model" className="btn btn-sm btn-ghost">
                  Economics →
                </Link>
              </div>
            </div>
          </div>
          <div style={{ marginTop: 24 }}>
            <Suspense fallback={<div className="np-fallback" />}>
              <RegionGrid />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ---------- What investment funds ---------- */}
      <section className="section invite" aria-labelledby="invite-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="05">What investment funds</Eyebrow>
              <h2 className="h1 invite-title" id="invite-title">
                {usdCompact(developmentProgramme.askUsd)} to find out, with evidence, whether a first corridor should be built.
              </h2>
            </div>
            <div className="stack">
              <p className="lead">
                The development round funds three years of feasibility and demonstration, drawn in tranches against five decision
                gates. Construction finance would be a separate, conditional decision.
              </p>
              <div className="cluster">
                <Link to="/investors" className="btn btn-primary">
                  For Investors <span className="arrow" aria-hidden="true">→</span>
                </Link>
                <Link to="/present/vision" className="btn">
                  Start Investor Presentation
                </Link>
              </div>
            </div>
          </div>
          <FundingLadder compact />
          <p className="team-line small muted">
            Leadership:{' '}
            {leadership.map((l, i) => (
              <span key={l.id}>
                {i > 0 && ' · '}
                <strong className="team-name">{l.name}</strong>, {l.role}
              </span>
            ))}{' '}
            ·{' '}
            <Link to="/leadership" className="text-link">
              Meet the team
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
