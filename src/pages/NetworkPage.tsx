import { Link } from 'react-router-dom'
import ScrollLink from '../components/ScrollLink'
import NetworkExplorer from '../features/network/NetworkExplorer'
import TechCutaway from '../features/tech/TechCutaway'
import Gates from '../features/programme/Gates'
import { Eyebrow, KindTag, PageHeader, SourceRef } from '../components/common'
import { technologyStatus } from '../data/evidence'
import { corridorExample } from '../data/finance'
import { usePageTitle } from '../lib/hooks'
import './pages.css'

const geography = [
  {
    title: 'China to Singapore crosses other countries',
    body: 'China and Singapore do not share a border. An overland route would need agreements with Laos, Thailand and Malaysia. The alternative is a maritime strategy: AXION terminals at ports, linked by existing shipping.',
    source: 'wiki-china-laos-rail',
    sourceText: 'An existing rail corridor from Kunming to Vientiane shows the overland direction.',
  },
  {
    title: 'Japan requires sea crossings',
    body: 'Japanese corridors would cross short straits between islands. Any link to mainland Asia would need a sea crossing far longer than any existing undersea tunnel, so it remains conceptual.',
    source: 'wiki-seikan',
    sourceText: 'The longest undersea rail tunnels run roughly 23–38 km beneath the sea.',
  },
  {
    title: 'The Americas are separated by oceans',
    body: 'Connections from Europe or Asia to the Americas would require ocean crossings for which no feasible alignment has been identified. Phase 3 corridors are therefore regional; intercontinental links are shown only as ideas.',
    source: 'wiki-japan-korea-tunnel',
    sourceText: 'Even a far shorter Japan–Korea fixed link has been proposed for decades without being built.',
  },
]

export default function NetworkPage() {
  usePageTitle('Network & Technology')
  return (
    <>
      <PageHeader
        eyebrow="Network & Technology"
        title="A network, built one proven corridor at a time."
        lead="Explore the proposed geographic phases, candidate corridors and the separate freight and passenger systems. Every city is a planning assumption and every arc a proposed connection — not a surveyed route."
      >
        <div className="cluster" style={{ marginTop: 28 }}>
          <ScrollLink target="explorer" className="btn btn-primary">
            Open the explorer <span className="arrow" aria-hidden="true">→</span>
          </ScrollLink>
          <ScrollLink target="technology" className="btn">
            How the technology works
          </ScrollLink>
          <ScrollLink target="feasibility" className="btn">
            Feasibility gates
          </ScrollLink>
        </div>
      </PageHeader>

      <section className="section-tight" id="explorer" aria-labelledby="explorer-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="01">Network explorer</Eyebrow>
              <h2 className="h2" id="explorer-title">
                Three phases of ambition. No launch route chosen.
              </h2>
            </div>
            <p className="body-2">
              Phase 1 contains three candidate corridors to be compared during the feasibility programme. Regional expansion
              would only follow a proven first corridor. Dotted connections are long-term concepts with unresolved crossings.
            </p>
          </div>
          <NetworkExplorer />
          <p className="notice info small" style={{ marginTop: 20 }}>
            <span>
              <strong>Separate from the financial example.</strong> The business model uses a hypothetical{' '}
              {corridorExample.lengthKm} km corridor that is not any of the routes shown here.{' '}
              <Link className="text-link" to="/business#construction">
                See the construction illustration
              </Link>
              .
            </span>
          </p>
        </div>
      </section>

      <section className="section" aria-labelledby="geo-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="02">Geography</Eyebrow>
              <h2 className="h2" id="geo-title">
                The map is ambitious. The constraints are real.
              </h2>
            </div>
            <p className="body-2">
              Lines on a globe hide mountains, borders and oceans. These are the geographic facts that shape which corridors
              could ever be studied.
            </p>
          </div>
          <div className="geo-rows">
            {geography.map((g, i) => (
              <article key={g.title} className="geo-row reveal">
                <span className="mono geo-idx">0{i + 1}</span>
                <div>
                  <h3 className="h3">{g.title}</h3>
                  <p className="body-2">{g.body}</p>
                  <p className="small muted geo-source">
                    <KindTag kind="sourced" /> {g.sourceText} <SourceRef id={g.source} />
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="technology" aria-labelledby="tech-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="03">Technology concept</Eyebrow>
              <h2 className="h2" id="tech-title">
                Pods, low-pressure tubes and fast terminals.
              </h2>
            </div>
            <p className="body-2">
              Select a system to see what it does and how mature it is. AXION would work with specialist developers rather
              than invent every component; this cutaway is conceptual, not a validated design.
            </p>
          </div>
          <TechCutaway />
          <div className="tech-status reveal">
            <h3 className="label">Technology status today</h3>
            <ul className="bullets">
              {technologyStatus.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
            <p className="small muted">
              Reported developer tests: <SourceRef id="techeu-ehc-opens" /> <SourceRef id="ap-hardt-test" />{' '}
              <SourceRef id="ie-hardt-scale" /> · Standards work: <SourceRef id="cen-cenelec-tr17912" />
            </p>
          </div>
        </div>
      </section>

      <section className="section" id="feasibility" aria-labelledby="gates-title">
        <div className="container">
          <div className="section-head split">
            <div>
              <Eyebrow index="04">Feasibility gates</Eyebrow>
              <h2 className="h2" id="gates-title">
                Five gates before anything is built.
              </h2>
            </div>
            <p className="body-2">
              Each gate is a decision point. If the evidence is weak, the programme is redesigned or stopped — spending is
              released in stages, not committed up front.
            </p>
          </div>
          <Gates />
          <div className="cluster" style={{ marginTop: 40 }}>
            <Link to="/business" className="btn btn-primary">
              Business model <span className="arrow" aria-hidden="true">→</span>
            </Link>
            <Link to="/investors" className="btn">
              The $50m development programme
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
