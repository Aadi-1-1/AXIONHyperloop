import { useState } from 'react'
import ScrollLink from '../components/ScrollLink'
import { Link } from 'react-router-dom'
import { Eyebrow, PageHeader, SourceRef } from '../components/common'
import { AllocationChart, CashFlowChart, FinancingChallenge, LabourNote, StaffingChart } from '../features/finance/ProgrammeCharts'
import Gates from '../features/programme/Gates'
import EnquiryForm from '../features/enquiry/EnquiryForm'
import { developmentProgramme } from '../data/finance'
import { feasibilityGates } from '../data/technology'
import { risks } from '../data/company'
import {
  investorCategories,
  investorPath,
  partnerPaths,
  prospects,
  prospectsNotice,
  type PartnerPathId,
} from '../data/prospects'
import { constructionCost, usdCompact } from '../lib/finance'
import { usePageTitle } from '../lib/hooks'
import './pages.css'
import './investors.css'

export default function InvestorsPage() {
  usePageTitle('For Investors')
  const [path, setPath] = useState<PartnerPathId>('investment')
  const cc = constructionCost()
  const active = partnerPaths.find((p) => p.id === path)!

  return (
    <>
      <PageHeader
        eyebrow="For Investors"
        title={`${usdCompact(developmentProgramme.askUsd)} to reach an evidence-based construction decision.`}
        lead="A three-year feasibility and demonstration programme. Funds are spent against five decision gates, and the programme can be redesigned or stopped if the evidence is weak."
      >
        <div className="cluster" style={{ marginTop: 28 }}>
          <Link to="/present/ask" className="btn btn-primary">
            Start presentation at the funding ask <span className="arrow" aria-hidden="true">→</span>
          </Link>
          <ScrollLink target="enquire" className="btn">
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
            <dt className="label">Team</dt>
            <dd className="figure-num">30</dd>
          </div>
          <div>
            <dt className="label">Revenue assumed</dt>
            <dd className="figure-num">$0</dd>
          </div>
        </dl>
      </PageHeader>

      <section className="section" aria-labelledby="buys-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="01">What the funding buys</Eyebrow>
              <h2 className="h2" id="buys-title">
                Evidence, a demonstrator and a decision.
              </h2>
            </div>
            <p className="body-2">
              The round funds feasibility and demonstration only. It does not fund construction or passenger development.
            </p>
          </div>
          <ol className="buys ruled-grid">
            {feasibilityGates.map((g) => (
              <li key={g.id}>
                <span className="mono step-idx">Gate {g.index} · {g.timing}</span>
                <h3 className="h4">{g.name}</h3>
                <ul className="bullets small">
                  {g.deliverables.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" aria-labelledby="alloc-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="02">Allocation</Eyebrow>
              <h2 className="h2" id="alloc-title">
                Where each dollar goes.
              </h2>
            </div>
            <LabourNote />
          </div>
          <div className="inv-alloc">
            <AllocationChart showDetail={false} />
            <StaffingChart />
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="cf-title">
        <div className="container grid-2">
          <div>
            <Eyebrow index="03">Three-year cash flow</Eyebrow>
            <h2 className="h2" id="cf-title">
              Spending rises as testing begins.
            </h2>
            <p className="body-2" style={{ marginTop: 20 }}>
              Year 1 concentrates on customer and route studies; Years 2 and 3 fund the test facility, prototype equipment and the
              terminal demonstration. Cash reaches zero at the end of Year 3.
            </p>
          </div>
          <CashFlowChart />
        </div>
      </section>

      <section className="section" aria-labelledby="gates-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="04">Milestone gates</Eyebrow>
              <h2 className="h2" id="gates-title">
                Five gates. Each one can stop the programme.
              </h2>
            </div>
            <p className="body-2">Funding could be released in tranches against these gates, to be agreed in funding terms.</p>
          </div>
          <Gates showDeliverables={false} />
        </div>
      </section>

      <section className="section" aria-labelledby="who-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="05">Desired investors &amp; partners</Eyebrow>
              <h2 className="h2" id="who-title">
                Who we would approach.
              </h2>
            </div>
            <p className="notice warn small">
              <span>
                <strong>Outreach targets only.</strong> {prospectsNotice}
              </span>
            </p>
          </div>
          <div className="who-grid">
            <div>
              <h3 className="label" style={{ marginBottom: 12 }}>
                Investor and partner categories
              </h3>
              <ul className="cat-list">
                {investorCategories.map((c) => (
                  <li key={c.title}>
                    <h4 className="h4">{c.title}</h4>
                    <p className="small body-2">{c.body}</p>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="label" style={{ marginBottom: 12 }}>
                Prospective organisations
              </h3>
              <div className="table-scroll" tabIndex={0}>
                <table className="data-table prospects-table">
                  <caption className="visually-hidden">Prospective organisations — outreach targets, not partners</caption>
                  <thead>
                    <tr>
                      <th scope="col">Organisation</th>
                      <th scope="col">Potential role</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prospects.map((p) => (
                      <tr key={p.id}>
                        <th scope="row">
                          {p.name}
                          <span className="small muted prospect-type">{p.type}</span>
                        </th>
                        <td>
                          {p.potentialRole}
                          <span className="small muted prospect-why">{p.rationale}</span>
                          {p.note && (
                            <span className="small muted prospect-why">
                              {p.note.text} <SourceRef id={p.note.sourceId} />
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="chip">Not contacted</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="risk-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="06">Risks</Eyebrow>
              <h2 className="h2" id="risk-title">
                Commercial and technical risk, unhidden.
              </h2>
            </div>
            <p className="body-2">
              <Link to="/business#risks" className="text-link">
                Full risk register
              </Link>{' '}
              ·{' '}
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

      <section className="section" aria-labelledby="fin-title">
        <div className="container grid-2">
          <div>
            <Eyebrow index="07">Future construction financing</Eyebrow>
            <h2 className="h2" id="fin-title">
              After this round, a much larger question.
            </h2>
            <p className="body-2" style={{ marginTop: 20 }}>
              Building even the hypothetical 100 km freight corridor is illustrated at {usdCompact(cc.total)} — {Math.round(cc.total / developmentProgramme.askUsd)} times this round.
              That would require infrastructure investors, lenders and likely public participation. AXION does not present a
              valuation, equity offer, investor return or payback date.
            </p>
            <Link to="/business#construction" className="text-link">
              See the construction illustration
            </Link>
          </div>
          <FinancingChallenge />
        </div>
      </section>

      <section className="section" id="enquire" aria-labelledby="path-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="08">Next steps</Eyebrow>
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
          <Link to="/present/vision" className="btn btn-primary">
            Start Investor Presentation <span className="arrow" aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </>
  )
}
