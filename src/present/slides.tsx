/* eslint-disable react-refresh/only-export-components -- slide registry maps chapter slugs to local components */
import { lazy, Suspense, type ComponentType } from 'react'
import { LogoMark } from '../components/Logo'
import { KindTag, SourceRef, SystemChip } from '../components/common'
import LeaderProfile from '../components/LeaderProfile'
import { AllocationChart, CashFlowChart } from '../features/finance/ProgrammeCharts'
import { company, competition, customerSegments, marketSizingSteps, problem, products, salesSteps } from '../data/company'
import { journeyStages } from '../data/journey'
import { leadership } from '../data/leadership'
import { corridors, phases } from '../data/network'
import { feasibilityGates, passengerGateNote, techSystems } from '../data/technology'
import { corridorExample, developmentProgramme, operatingDefaults, operatingResultLabel } from '../data/finance'
import {
  constructionCost,
  defaultScenarios,
  headcount,
  operatingBreakEven,
  pct,
  programmeLabourCost,
  usdCompact,
  usdPerKg,
} from '../lib/finance'

const NetworkPreview = lazy(() => import('../features/network/NetworkPreview'))

function Vision() {
  return (
    <div className="s-vision">
      <div className="s-vision-mark" aria-hidden="true">
        <LogoMark size={96} />
      </div>
      <h1 className="s-hero">
        {company.name}
        <span className="s-hero-sub">{company.tagline}</span>
      </h1>
      <p className="s-lead">{company.oneLiner}</p>
      <dl className="s-facts">
        <div>
          <dt>Focus</dt>
          <dd>Freight first</dd>
        </div>
        <div>
          <dt>Proposed HQ</dt>
          <dd>Singapore</dd>
        </div>
        <div>
          <dt>Seeking</dt>
          <dd>{usdCompact(developmentProgramme.askUsd)} development round</dd>
        </div>
        <div>
          <dt>Stage</dt>
          <dd>Concept &amp; feasibility</dd>
        </div>
      </dl>
    </div>
  )
}

function Problem() {
  return (
    <div className="s-two">
      <div>
        <h2 className="s-title">{problem.headline}</h2>
        <div className="s-stat">
          <span className="s-stat-num">~35%</span>
          <span>of world trade by value moves by air — under 1% by volume.</span>
        </div>
        <p className="s-cite">
          <KindTag kind="sourced" /> <SourceRef id="iata-air-cargo" />
        </p>
      </div>
      <ol className="s-points">
        {problem.points.map((p) => (
          <li key={p.title}>
            <h3>{p.title}</h3>
            <p>{p.body}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}

function Product() {
  return (
    <div className="s-stack">
      <h2 className="s-title">Reserved Hyperloop capacity, terminal to terminal.</h2>
      <div className="s-products">
        {products.map((p) => (
          <div key={p.id} className={`s-product ${p.system}`}>
            <div className="s-row">
              <SystemChip system={p.system} />
              <span className="s-muted-label">{p.status}</span>
            </div>
            <ul>
              {p.features.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <ol className="s-journey" aria-label="Shipment journey">
        {journeyStages.map((s) => (
          <li key={s.id} className={`where-${s.where}`}>
            <span className="s-j-idx mono">{s.index}</span>
            <span className="s-j-name">{s.name}</span>
            <span className="s-j-op">{s.operator === 'AXION' ? 'AXION' : 'Partner'}</span>
            {s.customs && <span className="s-j-customs mono">Customs*</span>}
          </li>
        ))}
      </ol>
      <p className="s-note">
        Tube travel is one part of complete shipment time — terminal handling, checks and delivery matter as much. *On cross-border corridors.
      </p>
    </div>
  )
}

function Network() {
  const study = corridors.filter((c) => c.status === 'study')
  return (
    <div className="s-network">
      <div className="s-network-map">
        <Suspense fallback={<div className="np-fallback" />}>
          <NetworkPreview />
        </Suspense>
      </div>
      <div className="s-network-side">
        <h2 className="s-title s-title-sm">Three phases of ambition. No launch route chosen.</h2>
        <ol className="s-phases">
          {phases.map((p) => (
            <li key={p.id}>
              <span className="mono freight-text">Phase {p.id}</span> {p.regions}
            </li>
          ))}
        </ol>
        <p className="s-muted-label">Candidate corridors under study</p>
        <p className="s-body">{study.map((c) => c.name).join(' · ')}</p>
        <ul className="s-bullets">
          <li>China–Singapore crosses Laos, Thailand and Malaysia — or uses a maritime strategy.</li>
          <li>Japan needs sea crossings; the Americas need ocean crossings.</li>
        </ul>
        <p className="s-note">Arcs are proposed connections, not surveyed alignments.</p>
      </div>
    </div>
  )
}

function Technology() {
  const key = ['pod', 'tube', 'propulsion', 'terminal'].map((id) => techSystems.find((t) => t.id === id)!)
  return (
    <div className="s-stack">
      <h2 className="s-title">Pods in low-pressure tubes — proven at test-track scale only.</h2>
      <ul className="s-tech">
        {key.map((t) => (
          <li key={t.id}>
            <h3>{t.name}</h3>
            <p>{t.summary}</p>
          </li>
        ))}
      </ul>
      <ol className="s-gates">
        {feasibilityGates.map((g) => (
          <li key={g.id}>
            <span className="s-gate-n mono">{g.index}</span>
            <span className="s-gate-name">{g.name}</span>
            <span className="s-gate-t mono">{g.timing}</span>
          </li>
        ))}
      </ol>
      <p className="s-note">{passengerGateNote}</p>
    </div>
  )
}

function Market() {
  return (
    <div className="s-stack">
    <h2 className="s-title s-title-sm">Who would buy — and what they use today.</h2>
    <div className="s-three">
      <div>
        <p className="s-muted-label">Initial customers</p>
        <ul className="s-list">
          {customerSegments.map((s) => (
            <li key={s.title}>{s.title}</li>
          ))}
        </ul>
        <p className="s-body">Time-sensitive, relatively high-value goods gain most from speed and reliability.</p>
      </div>
      <div>
        <p className="s-muted-label">Market sizing framework</p>
        <ol className="s-funnel">
          {marketSizingSteps.map((s, i) => (
            <li key={s.id} style={{ ['--i' as string]: i }}>
              {s.label}
            </li>
          ))}
        </ol>
        <p className="s-note">No market size, interviews or commitments yet — this is the research plan.</p>
      </div>
      <div>
        <p className="s-muted-label">Alternatives</p>
        <ul className="s-comp">
          {competition.map((c) => (
            <li key={c.mode}>
              <strong>{c.mode}</strong>
              <span>
                {c.speed} · {c.cost}
              </span>
            </li>
          ))}
        </ul>
        <p className="s-note">We target the gap between air and road — not every category.</p>
      </div>
    </div>
    </div>
  )
}

function BusinessModel() {
  return (
    <div className="s-two">
      <div>
        <h2 className="s-title">Recurring contracts for reserved capacity.</h2>
        <ul className="s-list s-list-lg">
          <li>Reserved capacity · recurring contracts</li>
          <li>Additional shipments when capacity allows</li>
          <li>Tracking, arrival estimates and terminal integration</li>
          <li className="passenger">Later: passenger tickets and business travel agreements</li>
        </ul>
      </div>
      <div>
        <dl className="s-kpis">
          <div>
            <dt>Average charge</dt>
            <dd>{usdPerKg(operatingDefaults.pricePerKg)}</dd>
          </div>
          <div>
            <dt>Variable cost</dt>
            <dd>{usdPerKg(operatingDefaults.variableCostPerKg)}</dd>
          </div>
          <div>
            <dt>Contribution</dt>
            <dd>{usdPerKg(operatingDefaults.pricePerKg - operatingDefaults.variableCostPerKg)}</dd>
          </div>
        </dl>
        <p className="s-note">
          <KindTag kind="assumption" /> Model inputs to be tested with customers.
        </p>
        <p className="s-muted-label" style={{ marginTop: '1.4em' }}>
          Route to revenue
        </p>
        <p className="s-body">{salesSteps.map((s) => s.label).join(' → ')}</p>
      </div>
    </div>
  )
}

function Financials() {
  const sc = defaultScenarios()
  const be = operatingBreakEven(operatingDefaults)
  const cc = constructionCost()
  return (
    <div className="s-stack">
      <h2 className="s-title">Illustrative {corridorExample.lengthKm} km freight corridor.</h2>
      <div className="s-scenarios">
        {sc.map((s) => (
          <div key={s.utilisation} className="s-scn">
            <p className="s-muted-label">{pct(s.utilisation)} utilisation</p>
            <p className={`s-scn-num ${s.operatingResult >= 0 ? 'pos' : 'neg'}`}>{usdCompact(s.operatingResult)}</p>
            <p className="s-body">
              {Math.round(s.annualKg / 1e6)}m kg · {usdCompact(s.revenue)} revenue
            </p>
          </div>
        ))}
        <div className="s-scn be">
          <p className="s-muted-label">Operating break-even</p>
          <p className="s-scn-num">{be.kind === 'finite' ? `≈${pct(be.utilisation, 1)}` : 'None'}</p>
          <p className="s-body">{be.kind === 'finite' ? `≈${(be.annualKg / 1e6).toFixed(1)}m kg/year` : ''}</p>
        </div>
      </div>
      <p className="s-note">Operating results: {operatingResultLabel.toLowerCase()}.</p>
      <div className="s-challenge">
        <span className="s-muted-label">Illustrative construction cost</span>
        <span className="s-challenge-num">{usdCompact(cc.total)}</span>
        <span className="s-body">
          A serious financing challenge: even at 85% utilisation, annual operating surplus is ~{pct(sc[2].operatingResult / cc.total, 1)} of it.
        </span>
      </div>
    </div>
  )
}

function Programme() {
  return (
    <div className="s-two">
      <div>
        <h2 className="s-title s-title-sm">Three years. Five gates. No revenue assumed.</h2>
        <ol className="s-gates vertical">
          {feasibilityGates.map((g) => (
            <li key={g.id}>
              <span className="s-gate-n mono">{g.index}</span>
              <span className="s-gate-name">{g.name}</span>
              <span className="s-gate-t mono">{g.timing}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="s-chart">
        <CashFlowChart showTable={false} />
      </div>
    </div>
  )
}

function Ask() {
  return (
    <div className="s-two s-ask">
      <div>
        <p className="s-muted-label">Development round</p>
        <p className="s-ask-num">{usdCompact(developmentProgramme.askUsd)}</p>
        <p className="s-body">Three-year feasibility and demonstration programme · {headcount()} people</p>
        <ul className="s-bullets">
          <li>
            Salaries ({usdCompact(programmeLabourCost())}) are included in the allocation — not added on top.
          </li>
          <li>Passenger development is outside this budget.</li>
          <li>Further financing is needed before any construction.</li>
        </ul>
      </div>
      <div className="s-chart">
        <AllocationChart showDetail={false} />
      </div>
    </div>
  )
}

function Leadership() {
  return (
    <div className="s-stack">
      <h2 className="s-title s-title-sm">Leadership</h2>
      <div className="leader-grid compact s-leaders">
        {leadership.map((l) => (
          <LeaderProfile key={l.id} leader={l} variant="compact" />
        ))}
      </div>
    </div>
  )
}

function Close() {
  return (
    <div className="s-close">
      <h2 className="s-title">The investment case.</h2>
      <ol className="s-case">
        <li>
          <strong>A real gap.</strong> Time-sensitive goods choose between fast-and-costly and affordable-and-slow.
        </li>
        <li>
          <strong>A focused model.</strong> Freight first, recurring capacity contracts, partners at both ends.
        </li>
        <li>
          <strong>Honest risks.</strong> Unproven technology and a {usdCompact(constructionCost().total)} construction illustration — stated openly.
        </li>
        <li>
          <strong>Gated spending.</strong> {usdCompact(developmentProgramme.askUsd)} to reach an evidence-based decision, with five points to stop.
        </li>
      </ol>
      <p className="s-close-ask">
        We are asking for {usdCompact(developmentProgramme.askUsd)} to find out — with evidence — whether a first corridor should be built.
      </p>
      <p className="s-body">Thank you. Questions welcome · Evidence, sources and the full model are on the website.</p>
    </div>
  )
}

export const slideBodies: Record<string, ComponentType> = {
  vision: Vision,
  problem: Problem,
  product: Product,
  network: Network,
  technology: Technology,
  market: Market,
  'business-model': BusinessModel,
  financials: Financials,
  programme: Programme,
  ask: Ask,
  leadership: Leadership,
  close: Close,
}
