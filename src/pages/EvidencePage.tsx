import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eyebrow, KindTag, PageHeader, SourceRef } from '../components/common'
import { evidenceItems, evidenceKinds, plannedMarketResearch, technologyStatus, type EvidenceKind } from '../data/evidence'
import { sources } from '../data/sources'
import { corridors, crossingMeta, statusMeta } from '../data/network'
import { sustainability } from '../data/company'
import { corridorExample, developmentProgramme, operatingDefaults, operatingResultLabel } from '../data/finance'
import {
  allocationTotal,
  annualCapacityKg,
  constructionCost,
  developmentCashFlow,
  headcount,
  kgCompact,
  operatingBreakEven,
  pct,
  programmeLabourCost,
  usdCompact,
  usdPerKg,
} from '../lib/finance'
import { corridorStraightLineKm, formatKm } from '../lib/geo'
import { usePageTitle } from '../lib/hooks'
import './pages.css'
import './evidence.css'

const kinds = Object.keys(evidenceKinds) as EvidenceKind[]

export default function EvidencePage() {
  usePageTitle('Evidence & Assumptions')
  const [filter, setFilter] = useState<EvidenceKind | 'all'>('all')
  const items = filter === 'all' ? evidenceItems : evidenceItems.filter((i) => i.kind === filter)
  const be = operatingBreakEven(operatingDefaults)
  const cc = constructionCost()
  const d = operatingDefaults

  return (
    <>
      <PageHeader
        eyebrow="Evidence & Assumptions"
        title="What we know, what we assume, and what we hope."
        lead="Every significant statement on this site is classified. Sources are listed with access dates; model inputs and formulas are shown in full. If a claim could not be verified, it is labelled as an assumption or left out."
      />

      <section className="section-tight" aria-labelledby="kinds-title">
        <div className="container">
          <h2 className="visually-hidden" id="kinds-title">
            Classification key
          </h2>
          <dl className="kind-key ruled-grid">
            {kinds.map((k) => (
              <div key={k}>
                <dt>
                  <KindTag kind={k} />
                </dt>
                <dd className="small body-2">{evidenceKinds[k].description}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="section" id="register" aria-labelledby="register-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="01">Evidence register</Eyebrow>
              <h2 className="h2" id="register-title">
                Significant claims, classified.
              </h2>
            </div>
            <div className="segmented" role="group" aria-label="Filter by classification">
              <button type="button" aria-pressed={filter === 'all'} onClick={() => setFilter('all')}>
                All <span className="mono muted">{evidenceItems.length}</span>
              </button>
              {kinds.map((k) => (
                <button key={k} type="button" aria-pressed={filter === k} onClick={() => setFilter(k)}>
                  {evidenceKinds[k].label} <span className="mono muted">{evidenceItems.filter((i) => i.kind === k).length}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="table-scroll" tabIndex={0}>
            <table className="data-table register">
              <caption className="visually-hidden">Evidence register filtered by {filter === 'all' ? 'all classifications' : evidenceKinds[filter].label}</caption>
              <thead>
                <tr>
                  <th scope="col">Statement</th>
                  <th scope="col">Classification</th>
                  <th scope="col">Topic</th>
                  <th scope="col">Source or basis</th>
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.statement}>
                    <td>{i.statement}</td>
                    <td>
                      <KindTag kind={i.kind} />
                    </td>
                    <td className="small muted">{i.topic}</td>
                    <td className="small">
                      {i.sourceId ? <SourceRef id={i.sourceId} /> : i.basis ? <span className="mono muted">{i.basis}</span> : <span className="muted">AXION model</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" id="formulas" aria-labelledby="formula-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="02">Financial inputs &amp; formulas</Eyebrow>
              <h2 className="h2" id="formula-title">
                Every number, traceable.
              </h2>
            </div>
            <p className="body-2">
              All amounts are USD classroom assumptions — not supplier quotes. The same inputs drive every page and the presentation.{' '}
              <Link to="/business#operating-model" className="text-link">
                Try them in the operating explorer
              </Link>
              .
            </p>
          </div>
          <div className="formula-grid">
            <article className="formula">
              <h3 className="h4">Operating model</h3>
              <pre className="mono small" tabIndex={0}>{`Annual kg       = tonnes/day × 1,000 × operating days × utilisation
                = ${d.capacityTonnesPerDay.toLocaleString('en-US')} × 1,000 × ${d.operatingDaysPerYear} × utilisation
                  (capacity ${kgCompact(annualCapacityKg(d))} at 100%)
Revenue         = annual kg × ${usdPerKg(d.pricePerKg)}
Variable costs  = annual kg × ${usdPerKg(d.variableCostPerKg)}
Operating result = revenue − variable costs − ${usdCompact(d.annualFixedCosts)} fixed`}</pre>
              <p className="small muted">{operatingResultLabel}.</p>
            </article>
            <article className="formula">
              <h3 className="h4">Operating break-even</h3>
              <pre className="mono small" tabIndex={0}>{`Break-even kg   = fixed costs ÷ (price − variable cost)
                = ${usdCompact(d.annualFixedCosts)} ÷ (${usdPerKg(d.pricePerKg)} − ${usdPerKg(d.variableCostPerKg)})
                ≈ ${be.kind === 'finite' ? kgCompact(be.annualKg) : 'none'}
Utilisation     ≈ ${be.kind === 'finite' ? pct(be.utilisation, 1) : 'n/a'}`}</pre>
              <p className="small muted">If price ≤ variable cost there is no finite break-even: more volume only increases the loss.</p>
            </article>
            <article className="formula">
              <h3 className="h4">Construction illustration · {corridorExample.lengthKm} km</h3>
              <pre className="mono small" tabIndex={0}>{cc.lines.map((l) => `${l.label.padEnd(36)} ${usdCompact(l.amount)}`).join('\n')}
{`${'Subtotal'.padEnd(36)} ${usdCompact(cc.subtotal)}
${`Contingency ${pct(cc.contingencyRate)}`.padEnd(36)} ${usdCompact(cc.contingency)}
${'Total'.padEnd(36)} ${usdCompact(cc.total)}`}</pre>
              <p className="small muted">Scope and cost per km are unvalidated; not to be extended to the wider network.</p>
            </article>
            <article className="formula">
              <h3 className="h4">Development programme</h3>
              <pre className="mono small" tabIndex={0}>{`Allocation total = ${usdCompact(allocationTotal())}
Salaries         = ${headcount()} × ${usdCompact(developmentProgramme.staffing.fullyLoadedAnnualCost)} × ${developmentProgramme.years} years = ${usdCompact(programmeLabourCost())}
                   (inside engineering, software and
                    employees & administration lines)
Closing cash     = ${usdCompact(developmentProgramme.askUsd)} − ${developmentProgramme.spendingByYear.map((v) => usdCompact(v)).join(' − ')} = ${usdCompact(developmentCashFlow().at(-1)!.closingCash)}`}</pre>
              <p className="small muted">No revenue during the programme; further financing needed before construction.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section" id="routes" aria-labelledby="routes-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="03">Proposed route limitations</Eyebrow>
              <h2 className="h2" id="routes-title">
                The network is a planning sketch.
              </h2>
            </div>
            <ul className="bullets">
              <li>Cities are representative planning nodes; no terminal sites are chosen.</li>
              <li>No initial commercial corridor has been selected.</li>
              <li>Arcs are proposed connections, not surveyed alignments. Distances are straight-line between city centres.</li>
              <li>Sea and ocean crossings are unresolved; no pods are animated on them.</li>
            </ul>
          </div>
          <div className="table-scroll" tabIndex={0}>
            <table className="data-table">
              <caption className="visually-hidden">All proposed connections with status and crossing type</caption>
              <thead>
                <tr>
                  <th scope="col">Connection</th>
                  <th scope="col">Phase</th>
                  <th scope="col">Status</th>
                  <th scope="col">Crossing</th>
                  <th scope="col" className="num">Straight-line</th>
                </tr>
              </thead>
              <tbody>
                {corridors.map((c) => (
                  <tr key={c.id}>
                    <th scope="row">{c.name}</th>
                    <td className="mono">{c.phase}</td>
                    <td className="small">{statusMeta[c.status].short}</td>
                    <td className="small">{crossingMeta[c.crossing]}</td>
                    <td className="num mono small">{formatKm(corridorStraightLineKm(c))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="research-title">
        <div className="container evidence-cols">
          <div>
            <Eyebrow index="04">Planned market research</Eyebrow>
            <h2 className="h3" id="research-title">
              Not yet done — planned for Gate 1.
            </h2>
            <ol className="num-steps">
              {plannedMarketResearch.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ol>
          </div>
          <div>
            <Eyebrow index="05">Technology status</Eyebrow>
            <h2 className="h3">Test-track scale, not commercial.</h2>
            <ul className="bullets" style={{ marginTop: 16 }}>
              {technologyStatus.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </div>
          <div>
            <Eyebrow index="06">Environmental model</Eyebrow>
            <h2 className="h3">Required before any emissions claim.</h2>
            <ul className="bullets" style={{ marginTop: 16 }}>
              {sustainability.requirements.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="small muted">{sustainability.stance} No carbon-saving percentage is stated anywhere on this site.</p>
          </div>
        </div>
      </section>

      <section className="section" id="sources" aria-labelledby="sources-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="07">Sources</Eyebrow>
              <h2 className="h2" id="sources-title">
                Source register.
              </h2>
            </div>
            <p className="notice small">
              <span>
                Several primary websites — including Forge Hyperloop, Hardt Hyperloop and the European Hyperloop Center — could not be
                opened from our research environment. Where that happened we used reputable secondary reporting and labelled it.
                Developer statements are treated as reported, not independently verified.
              </span>
            </p>
          </div>
          <ol className="source-list">
            {sources.map((s, i) => (
              <li key={s.id} id={`source-${s.id}`}>
                <span className="mono step-idx">[{i + 1}]</span>
                <div>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-link source-title">
                    {s.title}
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                  <p className="small muted source-meta">
                    {s.publisher} · {s.kind}
                    {s.published ? ` · published ${s.published}` : ''} · accessed {s.accessed}
                  </p>
                  <p className="small body-2">{s.supports}</p>
                  {s.note && <p className="small muted source-note">Note: {s.note}</p>}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
