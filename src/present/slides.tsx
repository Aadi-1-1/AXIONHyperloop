/* eslint-disable react-refresh/only-export-components -- slide registry maps chapter slugs to local components */
import { lazy, Suspense, type ComponentType } from 'react'
import { LogoMark } from '../components/Logo'
import { KindTag, SourceRef, SystemChip } from '../components/common'
import LeaderProfile from '../components/LeaderProfile'
import { company, customerSegments, focusRationale, problem, products, salesSteps } from '../data/company'
import { journeyStages } from '../data/journey'
import { leadership } from '../data/leadership'
import { corridors, hubById, leadCorridor, phaseExplainer, phases } from '../data/network'
import { feasibilityGates, passengerGateNote } from '../data/technology'
import { technologyStatus } from '../data/evidence'
import { developmentProgramme } from '../data/finance'
import { centralInputs, scenarios, type ScenarioId } from '../data/corridorModel'
import { chapters } from '../data/presentation'
import { headcount, programmeLabourCost, usdCompact, usdPerKg } from '../lib/finance'
import { formatKm } from '../lib/geo'
import { runCorridorModel } from '../lib/corridorModel'
import { RequiredPrices } from '../features/finance/CorridorModel'
import FundingLadder from '../features/finance/FundingLadder'

const FlatMap = lazy(() => import('../features/network/FlatMap'))
const RegionGrid = lazy(() => import('../features/network/RegionGrid'))

const central = runCorridorModel(centralInputs)
const bn = (v: number) => `$${(v / 1e9).toFixed(1)}bn`

function Message({ slug, small = false }: { slug: string; small?: boolean }) {
  return <h2 className={`s-title${small ? ' s-title-sm' : ''}`}>{chapters.find((c) => c.slug === slug)!.message}</h2>
}

function Vision() {
  return (
    <div className="s-vision">
      <div className="s-vision-mark" aria-hidden="true">
        <LogoMark size={88} />
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
          <dt>Lead study corridor</dt>
          <dd>Singapore–Kuala Lumpur</dd>
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
        <Message slug="problem" />
        <div className="s-stat">
          <span className="s-stat-num">~35%</span>
          <span>of world trade by value moves by air, but under 1% by volume.</span>
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

function Customer() {
  return (
    <div className="s-stack">
      <Message slug="customer" />
      <div className="s-two s-top">
        <div className="s-payer">
          <p className="s-muted-label">Who pays</p>
          <p className="s-payer-who">Logistics providers and large shippers</p>
          <p className="s-body">They buy reserved terminal-to-terminal capacity under recurring contracts and keep their own collection and delivery.</p>
          <p className="s-note">{focusRationale}</p>
        </div>
        <ul className="s-segments">
          {customerSegments.map((s) => (
            <li key={s.title}>
              <strong>{s.title}</strong>
              <span>{s.body}</span>
            </li>
          ))}
        </ul>
      </div>
      <p className="s-note">Not yet validated. Customer interviews and shipment analysis are Gate 1.</p>
    </div>
  )
}

function Service() {
  return (
    <div className="s-stack">
      <Message slug="service" />
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
      <div className="s-products">
        {products.map((p) => (
          <div key={p.id} className={`s-product ${p.system}`}>
            <div className="s-row">
              <SystemChip system={p.system} />
              <span className="s-muted-label">{p.status}</span>
            </div>
            <ul>
              {p.features.slice(0, 3).map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p className="s-note">Tube travel is one part of complete shipment time. *Customs applies on cross-border corridors.</p>
    </div>
  )
}

function LeadCorridor() {
  const comparisons = corridors.filter((c) => c.status === 'study')
  return (
    <div className="s-network">
      <div className="s-map">
        <Suspense fallback={<div className="np-fallback" />}>
          <FlatMap
            frame={leadCorridor.path.map((id) => [hubById[id].lon, hubById[id].lat] as [number, number])}
            frameKey="slide-lead"
            corridorIds={corridors.filter((c) => c.path.includes('kuala-lumpur') || c.path.includes('singapore')).filter((c) => c.status !== 'conceptual').map((c) => c.id)}
            emphasis={new Set([leadCorridor.id])}
            hubIds={['singapore', 'kuala-lumpur']}
            endpoints={new Set(leadCorridor.path)}
            systems={{ freight: true, passenger: false }}
            playing
            label="The Singapore–Kuala Lumpur lead study corridor."
          />
        </Suspense>
      </div>
      <div className="s-network-side">
        <p className="s-muted-label freight-text">Proposed lead study corridor · feasibility unverified</p>
        <Message slug="lead-corridor" small />
        <dl className="s-kv">
          <div>
            <dt>Geographic distance</dt>
            <dd>{formatKm(central.geographicKm)}</dd>
          </div>
          <div>
            <dt>Assumed alignment</dt>
            <dd>{centralInputs.alignmentKm} km (not surveyed)</dd>
          </div>
          <div>
            <dt>Scope</dt>
            <dd>Twin tubes, freight first</dd>
          </div>
          <div>
            <dt>Central capacity</dt>
            <dd>{(central.capacity.capacityT / 1e6).toFixed(1)} Mt / year</dd>
          </div>
        </dl>
        <p className="s-note">Comparison corridors: {comparisons.map((c) => c.name).join(' · ')}</p>
      </div>
    </div>
  )
}

function VisionNetwork() {
  return (
    <div className="s-stack">
      <Message slug="vision-network" small />
      <div className="s-regions">
        <Suspense fallback={<div className="np-fallback" />}>
          <RegionGrid />
        </Suspense>
      </div>
      <p className="s-note">
        {phases.map((p) => `Phase ${p.id}: ${p.regions}`).join(' · ')}. {phaseExplainer}
      </p>
    </div>
  )
}

function BusinessModel() {
  return (
    <div className="s-two">
      <div>
        <Message slug="business-model" />
        <ul className="s-list s-list-lg">
          <li>Reserved capacity under recurring contracts</li>
          <li>Additional shipments when capacity allows</li>
          <li>Tracking, arrival estimates and terminal integration</li>
          <li className="passenger">Later: passenger tickets and business travel agreements</li>
        </ul>
      </div>
      <div>
        <dl className="s-kpis">
          <div>
            <dt>Pricing basis</dt>
            <dd className="s-kpi-text">per kg</dd>
          </div>
          <div>
            <dt>Central assumption</dt>
            <dd>{usdPerKg(centralInputs.pricePerKg)}</dd>
          </div>
          <div>
            <dt>Handling cost</dt>
            <dd>{usdPerKg(centralInputs.handlingCostPerKg)}</dd>
          </div>
        </dl>
        <p className="s-note">
          <KindTag kind="assumption" /> To be tested with customers. No verified price benchmark yet.
        </p>
        <p className="s-muted-label" style={{ marginTop: '1.4em' }}>
          Route to revenue
        </p>
        <p className="s-body">{salesSteps.map((s) => s.label).join(' → ')}</p>
      </div>
    </div>
  )
}

function Economics() {
  const ids = Object.keys(scenarios) as ScenarioId[]
  return (
    <div className="s-stack">
      <Message slug="economics" small />
      <div className="s-two s-top">
        <dl className="s-ledger">
          <div>
            <dt>Construction (central)</dt>
            <dd>{bn(central.capex.total)}</dd>
          </div>
          <div>
            <dt>Revenue / year</dt>
            <dd>{usdCompact(central.revenue, 0)}</dd>
          </div>
          <div>
            <dt>Operating surplus</dt>
            <dd className={central.operatingSurplus >= 0 ? 'pos' : 'neg'}>{usdCompact(central.operatingSurplus, 0)}</dd>
          </div>
          <div>
            <dt>After renewals</dt>
            <dd className={central.surplusAfterRenewals >= 0 ? 'pos' : 'neg'}>{usdCompact(central.surplusAfterRenewals, 0)}</dd>
          </div>
          <div>
            <dt>Capital-recovery charge</dt>
            <dd className="neg">{usdCompact(central.capitalRecoveryCharge, 0)}</dd>
          </div>
        </dl>
        <div className="s-req">
          <RequiredPrices r={central} />
        </div>
      </div>
      <table className="s-table">
        <thead>
          <tr>
            <th scope="col">Scenario</th>
            {ids.map((id) => (
              <th key={id} scope="col">
                {scenarios[id].label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Construction</th>
            {ids.map((id) => (
              <td key={id}>{bn(runCorridorModel(scenarios[id].inputs).capex.total)}</td>
            ))}
          </tr>
          <tr>
            <th scope="row">Price for full recovery</th>
            {ids.map((id) => (
              <td key={id}>{usdPerKg(runCorridorModel(scenarios[id].inputs).requiredPrice.fullCapitalRecovery ?? 0)}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function Programme() {
  return (
    <div className="s-two">
      <div>
        <Message slug="programme" small />
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
      <div>
        <p className="s-muted-label">Technology status, October 2026</p>
        <ul className="s-bullets">
          {technologyStatus.slice(1, 4).map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
        <p className="s-note">{passengerGateNote}</p>
      </div>
    </div>
  )
}

function Ask() {
  return (
    <div className="s-stack">
      <Message slug="ask" small />
      <div className="s-contrast">
        <div className="s-contrast-now">
          <p className="s-muted-label">Sought now</p>
          <p className="s-ask-num">{usdCompact(developmentProgramme.askUsd)}</p>
          <p className="s-body">
            Three-year feasibility and demonstration · {headcount()} people · drawn in three tranches · salaries ({usdCompact(programmeLabourCost())}) included
          </p>
        </div>
        <div className="s-contrast-later">
          <p className="s-muted-label">Only if Gate 5 is passed</p>
          <p className="s-ask-num later">≈{bn(central.capex.total)}</p>
          <p className="s-body">First-corridor construction finance. Not part of this ask. At central assumptions it would not yet be financeable.</p>
        </div>
      </div>
      <FundingLadder compact />
    </div>
  )
}

function Leadership() {
  return (
    <div className="s-stack">
      <Message slug="leadership" small />
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
      <Message slug="close" />
      <ol className="s-case">
        <li>
          <strong>A real gap.</strong> Time-sensitive goods choose between fast-and-costly and affordable-and-slow.
        </li>
        <li>
          <strong>A focused start.</strong> One lead study corridor, Singapore–Kuala Lumpur, with partners at both ends.
        </li>
        <li>
          <strong>Honest economics.</strong> Central assumptions do not recover construction cost. We show exactly what would have to change.
        </li>
        <li>
          <strong>Gated spending.</strong> {usdCompact(developmentProgramme.askUsd)} in tranches, with five points at which to stop.
        </li>
      </ol>
      <p className="s-close-ask">
        We are asking for {usdCompact(developmentProgramme.askUsd)} to find out, with evidence, whether a first corridor should be built.
      </p>
      <p className="s-body">Thank you. Evidence, sources and the full model are on the website.</p>
    </div>
  )
}

export const slideBodies: Record<string, ComponentType> = {
  vision: Vision,
  problem: Problem,
  customer: Customer,
  service: Service,
  'lead-corridor': LeadCorridor,
  'vision-network': VisionNetwork,
  'business-model': BusinessModel,
  economics: Economics,
  programme: Programme,
  ask: Ask,
  leadership: Leadership,
  close: Close,
}
