/**
 * Source register. Each entry was located on the access date below.
 * Several primary websites (including forgehyperloop.com, hardt.global and hyperloopcenter.eu)
 * could not be opened from our research environment; where that happened we relied on
 * reputable secondary reporting and say so in `kind` and `note`.
 */
export type Source = {
  id: string
  title: string
  publisher: string
  url: string
  published?: string
  accessed: string
  kind: 'Official / institution' | 'Company material' | 'News reporting' | 'Reference work' | 'Design reference'
  supports: string
  note?: string
}

const ACCESSED = '2026-10-05'

export const sources: Source[] = [
  {
    id: 'cen-cenelec-tr17912',
    title: 'CEN/CLC/TR 17912 — a first step in the standardization of the European hyperloop industry',
    publisher: 'CEN-CENELEC',
    url: 'https://www.cencenelec.eu/news-events/news/2023/eninthespotlight/2023-02-13-a-first-step-in-the-standardization-of-the-european-hyperloop-industry/',
    published: '2023-02-13',
    accessed: ACCESSED,
    kind: 'Official / institution',
    supports:
      'European standards bodies established a joint technical committee on Hyperloop systems (JTC 20) and published a standards inventory and roadmap — indicating that a full regulatory framework does not yet exist.',
  },
  {
    id: 'iata-air-cargo',
    title: 'Air Cargo brochure',
    publisher: 'International Air Transport Association (IATA)',
    url: 'https://www.iata.org/contentassets/4d3961c878894c8a8725278607d8ad52/air-cargo-brochure.pdf',
    accessed: ACCESSED,
    kind: 'Official / institution',
    supports: 'Air cargo carries a large share of world trade by value (around 35%) but less than 1% by volume — evidence that high-value goods pay for speed.',
    note: 'Industry-association figure; publication year not stated in our record.',
  },
  {
    id: 'innovationquarter-ehc',
    title: 'Hardt Hyperloop secures €12 million for the groundbreaking European Hyperloop Center',
    publisher: 'InnovationQuarter (an investor in the project)',
    url: 'https://www.innovationquarter.nl/hardt-hyperloop-secures-e-12-million-for-the-groundbreaking-european-hyperloop-center/',
    accessed: ACCESSED,
    kind: 'Company material',
    supports: 'Hardt Hyperloop reported funding for the European Hyperloop Center test facility in Veendam, the Netherlands.',
    note: 'Published by a participating investor — promotional, not independent verification.',
  },
  {
    id: 'techeu-ehc-opens',
    title: 'European Hyperloop Center opens its doors for first tests',
    publisher: 'Tech.eu',
    url: 'https://tech.eu/2024/03/27/european-hyperloop-center-opens-its-doors-for-first-tests/',
    published: '2024-03-27',
    accessed: ACCESSED,
    kind: 'News reporting',
    supports: 'The European Hyperloop Center, a test facility of roughly 420 m including a lane switch, opened for testing.',
  },
  {
    id: 'ap-hardt-test',
    title: 'A capsule has been propelled through a hyperloop test tube in a step forward for the transit system',
    publisher: 'Associated Press via KSAT',
    url: 'https://www.ksat.com/business/2024/09/09/a-capsule-has-been-propelled-through-a-hyperloop-test-tube-in-a-step-forward-for-the-transit-system/',
    published: '2024-09-09',
    accessed: ACCESSED,
    kind: 'News reporting',
    supports: 'Reported first test in which a Hardt vehicle levitated and moved a short distance at low speed in the depressurised test tube.',
    note: 'Reports developer-supplied test details; low-speed, short-distance test.',
  },
  {
    id: 'ie-hardt-scale',
    title: 'Why hyperloop still can’t scale beyond test tracks',
    publisher: 'Interesting Engineering',
    url: 'https://interestingengineering.com/transportation/hyperloop-hardt-engineering-transport',
    accessed: ACCESSED,
    kind: 'News reporting',
    supports: 'Reports that Hardt announced track-switching progress in 2025 while the sector remains at test-track scale.',
    note: 'Developer announcement as reported by media; not independently verified.',
  },
  {
    id: 'freshplaza-hardt-cargo',
    title: 'From Amsterdam to Barendrecht in 30 mins',
    publisher: 'FreshPlaza',
    url: 'https://www.freshplaza.com/article/9398197/from-amsterdam-to-barendrecht-in-30-mins/',
    accessed: ACCESSED,
    kind: 'News reporting',
    supports: 'Describes Hardt Hyperloop’s cargo-focused concept studies in the Netherlands and early discussions with logistics stakeholders.',
    note: 'Trade-press reporting of developer statements.',
  },
  {
    id: 'fortune-hyperloop-one',
    title: 'Hyperloop One shut down (Richard Branson, DP World)',
    publisher: 'Fortune',
    url: 'https://fortune.com/2023/12/21/hyperloop-one-shut-down-richard-branson-dp-world-transportation',
    published: '2023-12-21',
    accessed: ACCESSED,
    kind: 'News reporting',
    supports: 'Hyperloop One ceased operations at the end of 2023 after failing to secure a contract to build a working system; DP World was reported among its backers.',
  },
  {
    id: 'cnn-hyperloop-status',
    title: 'Hyperloop is dead. Or is it?',
    publisher: 'CNN',
    url: 'https://www.cnn.com/travel/hyperloop-is-dead-or-is-it',
    accessed: ACCESSED,
    kind: 'News reporting',
    supports: 'Overview of the sector’s setbacks and remaining active developers.',
  },
  {
    id: 'wiki-hyperloop',
    title: 'Hyperloop',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Hyperloop',
    accessed: ACCESSED,
    kind: 'Reference work',
    supports: 'The modern Hyperloop concept was popularised by the “Hyperloop Alpha” white paper published in August 2013.',
    note: 'Secondary reference; the original white paper could not be retrieved from our environment.',
  },
  {
    id: 'wiki-seikan',
    title: 'Seikan Tunnel',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Seikan_Tunnel',
    accessed: ACCESSED,
    kind: 'Reference work',
    supports:
      'The Seikan Tunnel (about 53.9 km, about 23.3 km under the seabed) and the Channel Tunnel (about 37.9 km undersea) indicate the scale of existing undersea fixed links.',
  },
  {
    id: 'wiki-japan-korea-tunnel',
    title: 'Japan–Korea Undersea Tunnel',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Japan%E2%80%93Korea_Undersea_Tunnel',
    accessed: ACCESSED,
    kind: 'Reference work',
    supports: 'A fixed link from Japan to mainland Asia has been proposed for decades without being built, illustrating the difficulty of sea crossings.',
  },
  {
    id: 'wiki-china-laos-rail',
    title: 'Boten–Vientiane railway',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Boten%E2%80%93Vientiane_railway',
    accessed: ACCESSED,
    kind: 'Reference work',
    supports: 'The China–Laos railway between Kunming and Vientiane opened in December 2021, showing an existing overland corridor direction from southern China towards Southeast Asia.',
  },
  {
    id: 'forge-hyperloop',
    title: 'Forge Hyperloop',
    publisher: 'Forge Hyperloop',
    url: 'https://www.forgehyperloop.com/',
    accessed: ACCESSED,
    kind: 'Design reference',
    supports: 'Independent project used as a design and presentation reference for this website.',
    note: 'The site could not be opened from our build environment. No facts, copy or claims are taken from it.',
  },
]

export const sourceById = Object.fromEntries(sources.map((s) => [s.id, s])) as Record<string, Source>
