import { useEffect, useState, type ReactNode } from 'react'
import ScrollLink from '../components/ScrollLink'
import { Link } from 'react-router-dom'
import { KindTag, PageHeader, SourceRef, SystemChip } from '../components/common'
import OperatingExplorer from '../features/finance/OperatingExplorer'
import { ConstructionTable, FinancingChallenge, StaffingChart } from '../features/finance/ProgrammeCharts'
import CorridorModel from '../features/finance/CorridorModel'
import { centralInputs } from '../data/corridorModel'
import { runCorridorModel } from '../lib/corridorModel'
import {
  company,
  competition,
  customerSegments,
  expansion,
  focusRationale,
  humanResources,
  marketSizingNotice,
  marketSizingSteps,
  operationsEquipment,
  products,
  risks,
  salesSteps,
  sustainability,
} from '../data/company'
import { corridorExample } from '../data/finance'
import { usdPerKg } from '../lib/finance'

const leadCentral = runCorridorModel(centralInputs)
import { usePageTitle } from '../lib/hooks'
import './pages.css'
import './business.css'

const toc = [
  { id: 'description', label: 'Business description' },
  { id: 'organisation', label: 'Organisation & location' },
  { id: 'products', label: 'Products & services' },
  { id: 'customers', label: 'Who pays' },
  { id: 'market', label: 'Market analysis' },
  { id: 'competition', label: 'Competition' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'sales', label: 'Sales & marketing' },
  { id: 'operations', label: 'Operations & equipment' },
  { id: 'people', label: 'Human resources' },
  { id: 'corridor-model', label: 'Lead corridor economics' },
  { id: 'sustainability', label: 'Sustainability' },
  { id: 'risks', label: 'Risks & expansion' },
  { id: 'teaching-example', label: 'Reference: 100 km example' },
]

function Block({ id, n, title, children, lead }: { id: string; n: number; title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} className="bp-block" aria-labelledby={`${id}-h`}>
      <p className="eyebrow">
        <span className="idx">{String(n).padStart(2, '0')}</span>
        <span>{toc[n - 1].label}</span>
      </p>
      <h2 className="h2 bp-title" id={`${id}-h`}>
        {title}
      </h2>
      {lead && <p className="lead bp-lead">{lead}</p>}
      {children}
    </section>
  )
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [ids])
  return active
}

const tocIds = toc.map((t) => t.id)

export default function BusinessPage() {
  usePageTitle('Business Model')
  const active = useActiveSection(tocIds)

  return (
    <>
      <PageHeader
        eyebrow="Business Model"
        title="The business plan, in the open."
        lead="What AXION would sell, who would pay, how a corridor would operate, what it would cost and where the case is weakest. Figures are illustrative assumptions in USD."
      >
        <div className="cluster" style={{ marginTop: 28 }}>
          <ScrollLink target="corridor-model" className="btn btn-primary">
            Lead corridor economics <span className="arrow" aria-hidden="true">→</span>
          </ScrollLink>
          <Link to="/investors#funding-ladder" className="btn">
            Funding ladder
          </Link>
          <Link to="/evidence" className="btn btn-ghost">
            Evidence &amp; assumptions
          </Link>
        </div>
      </PageHeader>

      <div className="container bp-layout">
        <nav className="bp-toc" aria-label="Business plan sections">
          <p className="label">Contents</p>
          <ol>
            {toc.map((t, i) => (
              <li key={t.id}>
                <ScrollLink target={t.id} aria-current={active === t.id ? 'true' : undefined}>
                  <span className="mono">{String(i + 1).padStart(2, '0')}</span> {t.label}
                </ScrollLink>
              </li>
            ))}
          </ol>
        </nav>

        <div className="bp-content">
          <Block id="description" n={1} title="A freight-first Hyperloop operator." lead={company.oneLiner}>
            <h3 className="label bp-sub">Objectives of the development programme</h3>
            <ol className="num-list">
              {company.objectives.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ol>
          </Block>

          <Block id="organisation" n={2} title="A private company headquartered in Singapore — proposed.">
            <dl className="kv-table">
              <div>
                <dt>Legal form</dt>
                <dd>{company.ownership}</dd>
              </div>
              <div>
                <dt>Headquarters</dt>
                <dd>{company.headquarters} — a regional trade and logistics hub within Phase 1 markets</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{company.stageNotice}</dd>
              </div>
              <div>
                <dt>Delivery model</dt>
                <dd>AXION would lead the programme and own assets, with specialist engineering partners for technology and construction.</dd>
              </div>
            </dl>
          </Block>

          <Block id="products" n={3} title="Capacity, visibility and integration.">
            <div className="bp-products">
              {products.map((p) => (
                <div key={p.id} className={`bp-product ${p.system}`}>
                  <div className="cluster" style={{ ['--gap' as string]: '10px' }}>
                    <SystemChip system={p.system} />
                    <span className="label">{p.status}</span>
                  </div>
                  <h3 className="h3">{p.name}</h3>
                  <p className="body-2 small">{p.summary}</p>
                  <ul className="bullets">
                    {p.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </Block>

          <Block id="customers" n={4} title="Logistics companies pay for reserved capacity.">
            <p className="body-2">
              AXION’s customers would be logistics providers and large shippers. They would buy reserved terminal-to-terminal capacity and keep their own collection and delivery. The goods inside are time-sensitive and relatively high-value:
            </p>
            <div className="segment-grid">
              {customerSegments.map((s, i) => (
                <div key={s.title} className="segment">
                  <span className="mono step-idx">0{i + 1}</span>
                  <h3 className="h4">{s.title}</h3>
                  <p className="body-2 small">{s.body}</p>
                </div>
              ))}
            </div>
            <p className="notice info" style={{ marginTop: 24 }}>
              <span>
                <strong>Why this focus?</strong> {focusRationale}
              </span>
            </p>
          </Block>

          <Block id="market" n={5} title="A sizing framework — not a market-size claim.">
            <ol className="funnel">
              {marketSizingSteps.map((s, i) => (
                <li key={s.id} style={{ ['--i' as string]: i }}>
                  <div className="funnel-bar" aria-hidden="true" />
                  <div className="funnel-text">
                    <h3 className="h4">{s.label}</h3>
                    <p className="small body-2">{s.question}</p>
                    <p className="small muted">
                      <span className="label">Method</span> {s.method}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="notice warn small" style={{ marginTop: 20 }}>
              <span>{marketSizingNotice}</span>
            </p>
          </Block>

          <Block id="competition" n={6} title="Trade-offs, not a scoreboard.">
            <p className="body-2">
              AXION does not need to win every category. The question is whether there is a corridor where faster, reliable
              terminal-to-terminal movement is worth paying for, compared with what shippers use today.
            </p>
            <div className="table-scroll" tabIndex={0}>
              <table className="data-table comp-table">
                <caption className="visually-hidden">Comparison of freight alternatives</caption>
                <thead>
                  <tr>
                    <th scope="col">Mode</th>
                    <th scope="col">Speed</th>
                    <th scope="col">Cost</th>
                    <th scope="col">Capacity</th>
                    <th scope="col">Reach</th>
                    <th scope="col">Maturity</th>
                  </tr>
                </thead>
                <tbody>
                  {competition.map((c) => (
                    <tr key={c.mode}>
                      <th scope="row">{c.mode}</th>
                      <td>{c.speed}</td>
                      <td>{c.cost}</td>
                      <td>{c.capacity}</td>
                      <td>{c.flexibility}</td>
                      <td>{c.maturity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ul className="takeaways">
              {competition.map((c) => (
                <li key={c.mode}>
                  <strong>{c.mode}.</strong> {c.takeaway}
                </li>
              ))}
            </ul>
            <h3 className="label bp-sub">Existing Hyperloop projects</h3>
            <div className="projects">
              <article className="project">
                <h4 className="h4">Hardt Hyperloop</h4>
                <p className="small body-2">
                  Reported an 85 km/h run with a lane switch on the 420 m European Hyperloop Center track in September 2025, and
                  studied cargo applications. It was declared bankrupt in March 2026; the test centre is a separate entity.
                </p>
                <p className="small cluster" style={{ ['--gap' as string]: '10px' }}>
                  <SourceRef id="hardt-lane-switch-2025" /> <SourceRef id="hardt-bankrupt-2026" />
                </p>
              </article>
              <article className="project">
                <h4 className="h4">Swisspod</h4>
                <p className="small body-2">Reported 146 km/h with a full-scale capsule on its Colorado test track in May 2026, and is raising Series A funding.</p>
                <p className="small">
                  <SourceRef id="swisspod-2026" />
                </p>
              </article>
              <article className="project">
                <h4 className="h4">Freight concepts and failures</h4>
                <p className="small body-2">
                  HHLA and HyperloopTT presented a container-freight concept. Hyperloop One closed in 2023 and Zeleros became insolvent
                  in 2026. AXION’s gated plan is built around that record.
                </p>
                <p className="small cluster" style={{ ['--gap' as string]: '10px' }}>
                  <SourceRef id="hhla-hyperport" /> <SourceRef id="fortune-hyperloop-one" /> <SourceRef id="zeleros-insolvency-2026" />
                </p>
              </article>
              <article className="project">
                <h4 className="h4">Forge Hyperloop</h4>
                <p className="small body-2">An independent hyperloop project used as a design reference for this website. No facts or claims are drawn from it.</p>
                <p className="small">
                  <SourceRef id="forge-hyperloop" />
                </p>
              </article>
            </div>
          </Block>

          <Block id="pricing" n={7} title="Reserved capacity, priced per kilogram.">
            <div className="grid-2">
              <div className="prose">
                <p>
                  <strong>Reserved capacity contracts</strong> would give customers a guaranteed share of daily capacity on a corridor
                  for a contract term — the recurring core of revenue.
                </p>
                <p>
                  <strong>Additional capacity</strong> would be sold shipment-by-shipment when space is available.
                </p>
                <p>
                  <strong>Tracking and integration</strong> would be included to make AXION easy to plug into existing logistics
                  operations.
                </p>
              </div>
              <dl className="kv-table">
                <div>
                  <dt>Pricing basis</dt>
                  <dd>Per kilogram, terminal to terminal, averaged across reserved and additional capacity</dd>
                </div>
                <div>
                  <dt>Central assumption</dt>
                  <dd className="mono">
                    {usdPerKg(centralInputs.pricePerKg)} <KindTag kind="assumption" />
                  </dd>
                </div>
                <div>
                  <dt>Needed to recover capital</dt>
                  <dd className="mono">
                    {usdPerKg(leadCentral.requiredPrice.fullCapitalRecovery ?? 0)} <KindTag kind="calculated" />
                  </dd>
                </div>
                <div>
                  <dt>To be tested</dt>
                  <dd>Willingness to pay by segment, contract length and the premium for guaranteed capacity. No verified price benchmark exists yet.</dd>
                </div>
              </dl>
            </div>
          </Block>

          <Block id="sales" n={8} title="Evidence first, contracts last.">
            <ol className="sales-steps">
              {salesSteps.map((s, i) => (
                <li key={s.label}>
                  <span className="mono step-idx">{String(i + 1).padStart(2, '0')}</span>
                  <h3 className="h4">{s.label}</h3>
                  <p className="small body-2">{s.body}</p>
                </li>
              ))}
            </ol>
          </Block>

          <Block id="operations" n={9} title="The equipment of a freight corridor.">
            <p className="body-2">
              Daily operation would centre on terminals, a corridor control centre and maintenance workshops.{' '}
              <Link to="/network#technology" className="text-link">
                See the technology cutaway
              </Link>
              .
            </p>
            <ul className="equipment ruled-grid">
              {operationsEquipment.map((e) => (
                <li key={e.name}>
                  <h3 className="h4">{e.name}</h3>
                  <p className="small muted">{e.body}</p>
                </li>
              ))}
            </ul>
          </Block>

          <Block id="people" n={10} title="A focused development team.">
            <div className="grid-2">
              <div>
                <p className="body-2">{humanResources.summary}</p>
                <h3 className="label bp-sub">Recruited after a construction decision</h3>
                <ul className="bullets">
                  {humanResources.later.map((r) => (
                    <li key={r}>{r}</li>
                  ))}
                </ul>
              </div>
              <StaffingChart />
            </div>
          </Block>

          <Block
            id="corridor-model"
            n={11}
            title="Singapore–Kuala Lumpur: what a first corridor would need."
            lead="A working scenario built from capacity, construction scope, operating costs, renewals and financing. Choose a scenario, then adjust the main levers."
          >
            <CorridorModel />
            <p className="notice info small" style={{ marginTop: 24 }}>
              <span>
                The $50m development round is separate from construction finance.{' '}
                <Link to="/investors#funding-ladder" className="text-link">
                  See the funding ladder, tranches and allocation
                </Link>
                .
              </span>
            </p>
          </Block>

          <Block id="sustainability" n={12} title="Lower emissions must be demonstrated, not assumed.">
            <p className="body-2">{sustainability.summary}</p>
            <h3 className="label bp-sub">A lifecycle model must account for</h3>
            <ul className="bullets">
              {sustainability.requirements.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
            <p className="notice info small">
              <span>{sustainability.stance}</span>
            </p>
          </Block>

          <Block id="risks" n={13} title="What could stop AXION.">
            <div className="risk-grid ruled-grid">
              {risks.map((r) => (
                <article key={r.title} className="risk">
                  <span className="label">{r.category}</span>
                  <h3 className="h4">{r.title}</h3>
                  <p className="small body-2">{r.body}</p>
                </article>
              ))}
            </div>
            <h3 className="label bp-sub">Expansion</h3>
            <p className="body-2">{expansion}</p>
            <div className="cluster" style={{ marginTop: 28 }}>
              <Link to="/investors" className="btn btn-primary">
                For Investors <span className="arrow" aria-hidden="true">→</span>
              </Link>
              <Link to="/present/financials" className="btn">
                Presentation: financial chapter
              </Link>
            </div>
          </Block>

          <Block
            id="teaching-example"
            n={14}
            title={`Reference: a hypothetical ${corridorExample.lengthKm} km corridor.`}
            lead="A simple teaching model kept from the first version. It is not a mapped route and not the commercial case; its unit costs are not scaled to the lead corridor."
          >
            <section id="construction" aria-label="100 km construction illustration">
              <ConstructionTable />
            </section>
            <section id="operating-model" aria-label="100 km operating explorer" style={{ marginTop: 32 }}>
              <p className="body-2">
                Annual kg = tonnes/day × 1,000 × operating days × utilisation. Revenue and variable costs scale with kg; fixed costs do
                not.
              </p>
              <OperatingExplorer />
            </section>
            <section id="financing-challenge" aria-label="100 km financing challenge" style={{ marginTop: 32 }}>
              <FinancingChallenge />
            </section>
        </Block>
        </div>
      </div>
    </>
  )
}
