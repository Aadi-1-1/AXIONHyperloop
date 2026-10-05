import { useState } from 'react'
import { Link } from 'react-router-dom'
import ScrollLink from '../components/ScrollLink'
import { Eyebrow, PageHeader, SourceRef } from '../components/common'
import { AllocationChart, CashFlowChart, LabourNote, StaffingChart } from '../features/finance/ProgrammeCharts'
import FundingLadder, { TrancheTable } from '../features/finance/FundingLadder'
import { FundingStructure } from '../features/finance/CorridorModel'
import Gates from '../features/programme/Gates'
import EnquiryForm from '../features/enquiry/EnquiryForm'
import { developmentProgramme } from '../data/finance'
import { centralInputs } from '../data/corridorModel'
import { phaseExplainer } from '../data/network'
import { risks } from '../data/company'
import { investorCategories, investorPath, partnerPaths, prospects, prospectsNotice, type PartnerPathId } from '../data/prospects'
import { runCorridorModel } from '../lib/corridorModel'
import { usdCompact, usdPerKg } from '../lib/finance'
import { usePageTitle } from '../lib/hooks'
import './pages.css'
import './investors.css'

export default function InvestorsPage() {
  usePageTitle('For Investors')
  const [path, setPath] = useState<PartnerPathId>('investment')
  const active = partnerPaths.find((p) => p.id === path)!
  const lead = runCorridorModel(centralInputs)

  return (
    <>
      <PageHeader
        eyebrow="For Investors"
        title={`${usdCompact(developmentProgramme.askUsd)} to reach an evidence-based construction decision.`}
        lead="The development round funds a three-year feasibility and demonstration programme, centred on the Singapore–Kuala Lumpur lead study corridor. It does not fund construction. Money is drawn in tranches against decision gates."
      >
        <div className="cluster" style={{ marginTop: 28 }}>
          <Link to="/present/ask" className="btn btn-primary">
            Presentation: funding ask <span className="arrow" aria-hidden="true">→</span>
          </Link>
          <ScrollLink target="funding-ladder" className="btn">
            Funding ladder
          </ScrollLink>
          <ScrollLink target="enquire" className="btn btn-ghost">
            Partner &amp; investor paths
          </ScrollLink>
        </div>
        <dl className="ask-strip">
          <div>
            <dt className="label">Development round</dt>
            <dd className="figure-num">{usdCompact(developmentProgramme.askUsd)}</dd>
          </div>
          <div>
            <dt className="label">Programme</dt>
            <dd className="figure-num">3 years</dd>
          </div>
          <div>
            <dt className="label">Drawn in</dt>
            <dd className="figure-num">3 tranches</dd>
          </div>
          <div>
            <dt className="label">First corridor, if built</dt>
            <dd className="figure-num">≈${(lead.capex.total / 1e9).toFixed(1)}bn</dd>
          </div>
        </dl>
      </PageHeader>

      <section className="section" id="funding-ladder" aria-labelledby="ladder-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="01">Funding ladder</Eyebrow>
              <h2 className="h2" id="ladder-title">
                $50m now. Construction finance only if the evidence supports it.
              </h2>
            </div>
            <div className="stack">
              <p className="body-2">
                Each rung needs its own decision and its own investors. This round buys the evidence for rung 2; it does not commit
                anyone to fund it.
              </p>
              <p className="small muted">{phaseExplainer}</p>
            </div>
          </div>
          <FundingLadder />
        </div>
      </section>

      <section className="section" id="programme" aria-labelledby="alloc-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="02">The $50m programme</Eyebrow>
              <h2 className="h2" id="alloc-title">
                Where each dollar goes, and when it is drawn.
              </h2>
            </div>
            <LabourNote />
          </div>
          <div className="inv-alloc">
            <AllocationChart showDetail={false} />
            <StaffingChart />
          </div>
          <div className="inv-cash">
            <div>
              <h3 className="h3">Committed at close, drawn in tranches</h3>
              <p className="body-2 small">Investors commit $50m at close. Cash is drawn in three tranches, each released when a gate is passed.</p>
              <TrancheTable />
            </div>
            <div>
              <h3 className="h3">Cash position if paid in full at close</h3>
              <CashFlowChart showTable={false} />
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="gates-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="03">Milestone gates</Eyebrow>
              <h2 className="h2" id="gates-title">
                Five gates. Each one can stop the programme.
              </h2>
            </div>
            <p className="body-2">Gates 1 and 2 release tranches 2 and 3. Gate 5 is the decision on whether to seek construction finance at all.</p>
          </div>
          <Gates />
        </div>
      </section>

      <section className="section" id="first-corridor" aria-labelledby="fc-title">
        <div className="container grid-2">
          <div>
            <Eyebrow index="04">First-corridor construction finance</Eyebrow>
            <h2 className="h2" id="fc-title">
              A much larger, conditional question.
            </h2>
            <p className="body-2" style={{ marginTop: 20 }}>
              In the central Singapore–Kuala Lumpur scenario, construction is about ${(lead.capex.total / 1e9).toFixed(1)}bn. At the
              assumed {usdPerKg(centralInputs.pricePerKg)}, freight revenue covers operations but not construction. Full capital
              recovery would need about {usdPerKg(lead.requiredPrice.fullCapitalRecovery ?? 0)}. Unless costs, prices or public
              infrastructure funding change materially, Gate 5 would not support construction.
            </p>
            <p className="small muted">No valuation, equity offer, investor return or payback date is presented.</p>
            <Link to="/business#corridor-model" className="btn" style={{ marginTop: 12 }}>
              Explore the scenario model
            </Link>
          </div>
          <FundingStructure r={lead} />
        </div>
      </section>

      <section className="section" aria-labelledby="who-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="05">Prospective partners</Eyebrow>
              <h2 className="h2" id="who-title">
                Who we would approach, and why.
              </h2>
            </div>
            <p className="notice warn small">
              <span>{prospectsNotice}</span>
            </p>
          </div>
          <ul className="prospect-list">
            {prospects.map((p) => (
              <li key={p.id} className="prospect">
                <div className="prospect-head">
                  <h3 className="h4">{p.name}</h3>
                  <span className="chip">Prospect · not contacted</span>
                </div>
                <p className="small muted">
                  {p.type} · {p.potentialRole}
                </p>
                <dl className="prospect-dl small">
                  <div>
                    <dt>Logistics fit</dt>
                    <dd>{p.fit}</dd>
                  </div>
                  <div>
                    <dt>AXION would ask</dt>
                    <dd>{p.request}</dd>
                  </div>
                  <div>
                    <dt>AXION would offer</dt>
                    <dd>{p.benefit}</dd>
                  </div>
                </dl>
                {p.note && (
                  <p className="small muted">
                    {p.note.text} <SourceRef id={p.note.sourceId} />
                  </p>
                )}
              </li>
            ))}
          </ul>
          <div className="cat-row">
            {investorCategories.map((c) => (
              <div key={c.title}>
                <h3 className="h4">{c.title}</h3>
                <p className="small body-2">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="risk-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="06">Risks</Eyebrow>
              <h2 className="h2" id="risk-title">
                Commercial and technical risk, stated plainly.
              </h2>
            </div>
            <p className="body-2">
              <Link to="/evidence" className="text-link">
                Evidence &amp; assumptions
              </Link>
            </p>
          </div>
          <div className="risk-grid ruled-grid">
            {risks.map((r) => (
              <article key={r.title} className="risk">
                <span className="label">{r.category}</span>
                <h3 className="h4">{r.title}</h3>
                <p className="small body-2">{r.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="enquire" aria-labelledby="path-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="07">Next steps</Eyebrow>
              <h2 className="h2" id="path-title">
                The investor path.
              </h2>
            </div>
            <p className="body-2">Each step is a decision for both sides. Nothing on this site is an offer to sell securities.</p>
          </div>
          <ol className="inv-path">
            {investorPath.map((s, i) => (
              <li key={s.label}>
                <span className="mono step-idx">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="h4">{s.label}</h3>
                <p className="small body-2">{s.body}</p>
              </li>
            ))}
          </ol>

          <div className="partner-block">
            <div>
              <h3 className="h3" style={{ marginBottom: 16 }}>
                Choose your path
              </h3>
              <div className="segmented partner-tabs" role="group" aria-label="Partner path">
                {partnerPaths.map((p) => (
                  <button key={p.id} type="button" aria-pressed={path === p.id} onClick={() => setPath(p.id)}>
                    {p.label}
                  </button>
                ))}
              </div>
              <div className="partner-detail" aria-live="polite">
                <p className="label">For {active.audience.toLowerCase()}</p>
                <ol className="num-steps">
                  {active.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </div>
            </div>
            <EnquiryForm interest={path} onInterestChange={setPath} />
          </div>
        </div>
      </section>

      <section className="section invite-strip" aria-labelledby="present-title">
        <div className="container cluster" style={{ justifyContent: 'space-between', ['--gap' as string]: '24px' }}>
          <h2 className="h3" id="present-title">
            Presenting AXION? Open the full-screen investor presentation.
          </h2>
          <Link to="/present/problem" className="btn btn-primary">
            Start Investor Presentation <span className="arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  )
}
