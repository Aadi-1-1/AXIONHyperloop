import { useEffect, useState, type ReactNode } from 'react'
import ScrollLink from '../components/ScrollLink'
import { Link } from 'react-router-dom'
import { KindTag, PageHeader, SourceRef, SystemChip } from '../components/common'
import OperatingExplorer from '../features/finance/OperatingExplorer'
import {
  AllocationChart,
  CashFlowChart,
  ConstructionTable,
  FinancingChallenge,
  LabourNote,
  StaffingChart,
} from '../features/finance/ProgrammeCharts'
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
import { corridorExample, developmentProgramme, operatingDefaults } from '../data/finance'
import { usdCompact, usdPerKg } from '../lib/finance'
import { usePageTitle } from '../lib/hooks'
import './pages.css'
import './business.css'

const toc = [
  { id: 'description', label: 'Business description' },
  { id: 'organisation', label: 'Organisation & location' },
  { id: 'products', label: 'Products & services' },
  { id: 'customers', label: 'Target customers' },
  { id: 'market', label: 'Market analysis' },
  { id: 'competition', label: 'Competition' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'sales', label: 'Sales & marketing' },
  { id: 'operations', label: 'Operations & equipment' },
  { id: 'people', label: 'Human resources' },
  { id: 'development-costs', label: 'Development costs' },
  { id: 'construction', label: 'Construction illustration' },
  { id: 'operating-model', label: 'Financial scenarios' },
  { id: 'cash-flow', label: 'Cash flow' },
  { id: 'financing-challenge', label: 'Financing challenge' },
  { id: 'sustainability', label: 'Sustainability' },
  { id: 'risks', label: 'Risks & expansion' },
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
        lead="What AXION would sell, to whom, how it would operate, what it would cost — and where the case is weakest. All figures are illustrative classroom assumptions in USD."
      >
        <div className="cluster" style={{ marginTop: 28 }}>
          <ScrollLink target="operating-model" className="btn btn-primary">
            Operating explorer <span className="arrow" aria-hidden="true">→</span>
          </ScrollLink>
          <ScrollLink target="financing-challenge" className="btn">
            The financing challenge
          </ScrollLink>
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

          <Block id="customers" n={4} title="Time-sensitive, relatively high-value goods.">
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
                <h4 className="h4">Forge Hyperloop</h4>
                <p className="small body-2">
                  An independent Hyperloop project and the principal design reference for this website. Its site could not be
                  reached from our research environment, so we present no facts or claims about it.
                </p>
                <p className="small">
                  <SourceRef id="forge-hyperloop" />
                </p>
              </article>
              <article className="project">
                <h4 className="h4">Hardt Hyperloop</h4>
                <p className="small body-2">
                  A Dutch developer reporting a roughly 420 m test facility with a lane switch in Veendam, the Netherlands, first
                  low-speed vehicle tests in 2024 and cargo-focused concept studies. These are developer statements relayed by media
                  and partners — not independent verification.
                </p>
                <p className="small cluster" style={{ ['--gap' as string]: '10px' }}>
                  <SourceRef id="techeu-ehc-opens" /> <SourceRef id="ap-hardt-test" /> <SourceRef id="freshplaza-hardt-cargo" />
                </p>
              </article>
              <article className="project">
                <h4 className="h4">A sector lesson</h4>
                <p className="small body-2">
                  Hyperloop One, once among the best-funded developers, ceased operations at the end of 2023 without a contract to
                  build a working system. AXION’s gated, freight-first plan is designed around that risk.
                </p>
                <p className="small">
                  <SourceRef id="fortune-hyperloop-one" />
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
                  <dt>Average charge</dt>
                  <dd className="mono">
                    {usdPerKg(operatingDefaults.pricePerKg)} <KindTag kind="assumption" />
                  </dd>
                </div>
                <div>
                  <dt>Variable cost</dt>
                  <dd className="mono">
                    {usdPerKg(operatingDefaults.variableCostPerKg)} <KindTag kind="assumption" />
                  </dd>
                </div>
                <div>
                  <dt>Contribution</dt>
                  <dd className="mono">
                    {usdPerKg(operatingDefaults.pricePerKg - operatingDefaults.variableCostPerKg)} <KindTag kind="calculated" />
                  </dd>
                </div>
                <div>
                  <dt>To be tested</dt>
                  <dd>Willingness to pay by segment, contract length, and premium for guaranteed capacity.</dd>
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
            id="development-costs"
            n={11}
            title={`${usdCompact(developmentProgramme.askUsd)} over three years.`}
            lead="The development round funds feasibility and demonstration — not construction, and not passenger development."
          >
            <AllocationChart />
            <div style={{ marginTop: 20 }}>
              <LabourNote />
            </div>
          </Block>

          <Block id="construction" n={12} title={`A hypothetical ${corridorExample.lengthKm} km freight corridor.`}>
            <p className="notice warn small" style={{ marginBottom: 24 }}>
              <span>
                <strong>Illustration, not an engineering estimate.</strong> The scope and the {usdCompact(corridorExample.infrastructureCostPerKm)}/km
                assumption are unvalidated. This corridor is not one of the routes on the network map, and its cost must not be
                extended to the wider network.
              </span>
            </p>
            <ConstructionTable />
          </Block>

          <Block id="operating-model" n={13} title="Operating scenario explorer.">
            <p className="body-2">
              Adjust utilisation, charge and variable cost for the hypothetical corridor. Annual kg = tonnes/day × 1,000 × operating
              days × utilisation; revenue and variable costs scale with kg; fixed costs do not.
            </p>
            <OperatingExplorer />
          </Block>

          <Block id="cash-flow" n={14} title="Development cash flow.">
            <CashFlowChart />
          </Block>

          <Block id="financing-challenge" n={15} title="The financing challenge, stated plainly.">
            <FinancingChallenge />
          </Block>

          <Block id="sustainability" n={16} title="Lower emissions must be demonstrated, not assumed.">
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

          <Block id="risks" n={17} title="What could stop AXION.">
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
        </div>
      </div>
    </>
  )
}
