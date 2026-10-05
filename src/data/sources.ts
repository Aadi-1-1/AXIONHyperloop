/**
 * Source register. Each entry records what it supports, its type and the access date.
 * Developer announcements are treated as reported claims, not independent verification.
 */
export type Source = {
  id: string
  title: string
  publisher: string
  url: string
  published?: string
  accessed: string
  kind: 'Official / institution' | 'Company material' | 'Peer-reviewed research' | 'News reporting' | 'Reference work' | 'Design reference'
  supports: string
  note?: string
}

const ACCESSED = '2026-10-05'

export const sources: Source[] = [
  {
    id: 'cen-cenelec-tr17912',
    title: 'CEN/CLC/TR 17912: a first step in the standardization of the European hyperloop industry',
    publisher: 'CEN-CENELEC',
    url: 'https://www.cencenelec.eu/news-events/news/2023/eninthespotlight/2023-02-13-a-first-step-in-the-standardization-of-the-european-hyperloop-industry/',
    published: '2023-02-13',
    accessed: ACCESSED,
    kind: 'Official / institution',
    supports:
      'European standards bodies formed a joint committee on hyperloop systems (JTC 20) and published a standards inventory and roadmap in 2023, a first step towards standards rather than a complete regulatory framework.',
  },
  {
    id: 'iata-air-cargo',
    title: 'Air Cargo brochure',
    publisher: 'International Air Transport Association (IATA)',
    url: 'https://www.iata.org/contentassets/4d3961c878894c8a8725278607d8ad52/air-cargo-brochure.pdf',
    accessed: ACCESSED,
    kind: 'Official / institution',
    supports: 'Air cargo carries around 35% of world trade by value but less than 1% by volume.',
    note: 'Industry-association figure; publication year not stated in the document.',
  },
  {
    id: 'hardt-lane-switch-2025',
    title: 'Hardt Hyperloop sets speed record and demonstrates lane switching at European Hyperloop Center',
    publisher: 'Hardt Hyperloop',
    url: 'https://www.hardt.global/press/hardt-hyperloop-sets-speed-record-and-demonstrates-lane-switching-at-european-hyperloop-center',
    published: '2025-09',
    accessed: ACCESSED,
    kind: 'Company material',
    supports:
      'Hardt reported reaching 85 km/h and completing a lane switch on the 420 m European Hyperloop Center track: accelerating over about 140 m, coasting through a 155 m lane switch and stopping in the final 100 m.',
    note: 'Developer announcement. A component demonstration on a short test track.',
  },
  {
    id: 'iet-hardt-2025',
    title: 'Hardt Hyperloop sets speed record and proves lane-switching at European test site',
    publisher: 'E&T (Institution of Engineering and Technology)',
    url: 'https://eandt.theiet.org/2025/09/10/hardt-hyperloop-sets-new-speed-record-and-proves-lane-switching-european-test-site',
    published: '2025-09-10',
    accessed: ACCESSED,
    kind: 'News reporting',
    supports: 'Independent trade-press report of the September 2025 lane-switch demonstration.',
  },
  {
    id: 'hardt-bankrupt-2026',
    title: 'Hyperloop dream hits another wall as Dutch pioneer Hardt goes bankrupt',
    publisher: 'New Mobility News',
    url: 'https://newmobility.news/en/2026/03/06/hyperloop-dream-hits-another-wall-as-dutch-pioneer-hardt-goes-bankrupt/',
    published: '2026-03-06',
    accessed: ACCESSED,
    kind: 'News reporting',
    supports:
      'Hardt Hyperloop was declared bankrupt by the court in The Hague on 4 March 2026 after failing to secure new funding. The European Hyperloop Center test facility is a separate entity and was reported to remain available to other developers.',
  },
  {
    id: 'zeleros-insolvency-2026',
    title: 'Top Spanish hyperloop developer Zeleros files for bankruptcy',
    publisher: 'RailTech',
    url: 'https://www.railtech.com/innovation/2026/04/09/top-spanish-hyperloop-developer-files-for-bankruptcy-assets-set-for-defence-and-energy-use/',
    published: '2026-04-09',
    accessed: ACCESSED,
    kind: 'News reporting',
    supports: 'Zeleros entered insolvency proceedings in April 2026, the second major European hyperloop failure that year.',
  },
  {
    id: 'swisspod-2026',
    title: 'Swisspod hits new hyperloop speed record, begins AERYS 2 development',
    publisher: 'Swisspod',
    url: 'https://www.swisspod.com/press-releases/swisspod-hits-new-hyperloop-speed-record-begins-aerys-2-development',
    published: '2026-05-11',
    accessed: ACCESSED,
    kind: 'Company material',
    supports: 'Swisspod reported 146 km/h with a full-scale capsule on its test track in Pueblo, Colorado, and is raising Series A funding.',
    note: 'Developer announcement.',
  },
  {
    id: 'fortune-hyperloop-one',
    title: 'Hyperloop One shut down (Richard Branson, DP World)',
    publisher: 'Fortune',
    url: 'https://fortune.com/2023/12/21/hyperloop-one-shut-down-richard-branson-dp-world-transportation',
    published: '2023-12-21',
    accessed: ACCESSED,
    kind: 'News reporting',
    supports: 'Hyperloop One ceased operations at the end of 2023 without a contract to build a working system. DP World was reported among its backers.',
  },
  {
    id: 'hhla-hyperport',
    title: 'HHLA and HyperloopTT reveal HyperPort',
    publisher: 'American Journal of Transportation',
    url: 'https://ajot.com/news/hyperlooptt-and-hhla-reveal-hyperport',
    accessed: ACCESSED,
    kind: 'News reporting',
    supports:
      'The port operator HHLA and HyperloopTT presented a container-freight hyperloop concept (HyperPort) after a cooperation agreement signed at the end of 2018, which shows that freight-focused hyperloop concepts already exist.',
  },
  {
    id: 'mdpi-hyperloop-cost',
    title: 'Assessing Hyperloop Transport: Optimizing Cost with Different Designs of Capsule',
    publisher: 'Processes (MDPI), vol. 11',
    url: 'https://doi.org/10.3390/pr11030744',
    published: '2023',
    accessed: ACCESSED,
    kind: 'Peer-reviewed research',
    supports:
      'Reviews published hyperloop cost estimates: about EUR 25–35 million per km for tubes on pillars, about EUR 70 million per km in tunnel, and an average of about EUR 76 million per km for route studies (excluding land).',
    note: 'Compiles earlier estimates. None is based on a built system.',
  },
  {
    id: 'edge-hsr-termination',
    title: 'Singapore says HSR link agreement with Malaysia to be terminated',
    publisher: 'The Edge Malaysia',
    url: 'https://theedgemalaysia.com/article/singapore-says-hsr-link-agreement-malaysia-be-terminated',
    published: '2021-01-01',
    accessed: ACCESSED,
    kind: 'News reporting',
    supports:
      'The 350 km Kuala Lumpur–Singapore high-speed rail project was terminated in 2021 after the two governments could not agree changes. Reported cost estimates ranged from about RM110 billion originally to about RM60 billion.',
  },
  {
    id: 'rts-link',
    title: 'Johor Bahru–Singapore RTS Link',
    publisher: 'Land Transport Guru',
    url: 'https://landtransportguru.net/train/rts-link/',
    accessed: ACCESSED,
    kind: 'Reference work',
    supports:
      'A 4 km cross-strait rail shuttle between Johor Bahru and Singapore, targeted to open from December 2026, shows how costly and complex a short Johor Strait crossing can be.',
  },
  {
    id: 'sp-tariff-2025',
    title: 'Electricity tariff revision for the period 1 October to 31 December 2025',
    publisher: 'SP Group',
    url: 'https://www.spgroup.com.sg/about-us/media-resources/news-and-media-releases/Electricity-Tariff-Revision-for-the-Period-1-October-to-31-December-2025',
    published: '2025',
    accessed: ACCESSED,
    kind: 'Company material',
    supports: 'Singapore’s regulated electricity tariff was around 28 Singapore cents per kWh in 2025.',
    note: 'Regulated tariff; large industrial contracts are priced differently.',
  },
  {
    id: 'wiki-seikan',
    title: 'Seikan Tunnel',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Seikan_Tunnel',
    accessed: ACCESSED,
    kind: 'Reference work',
    supports: 'The Seikan Tunnel (about 23 km beneath the seabed) and the Channel Tunnel (about 38 km undersea) indicate the scale of existing undersea fixed links.',
  },
  {
    id: 'wiki-japan-korea-tunnel',
    title: 'Japan–Korea Undersea Tunnel',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Japan%E2%80%93Korea_Undersea_Tunnel',
    accessed: ACCESSED,
    kind: 'Reference work',
    supports: 'A fixed link from Japan to mainland Asia has been proposed for decades without being built.',
  },
  {
    id: 'wiki-china-laos-rail',
    title: 'Boten–Vientiane railway',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Boten%E2%80%93Vientiane_railway',
    accessed: ACCESSED,
    kind: 'Reference work',
    supports: 'The China–Laos railway between Kunming and Vientiane opened in December 2021.',
  },
  {
    id: 'wiki-hyperloop',
    title: 'Hyperloop',
    publisher: 'Wikipedia',
    url: 'https://en.wikipedia.org/wiki/Hyperloop',
    accessed: ACCESSED,
    kind: 'Reference work',
    supports: 'The modern hyperloop concept was popularised by the “Hyperloop Alpha” white paper published in August 2013.',
  },
  {
    id: 'forge-hyperloop',
    title: 'Forge Hyperloop',
    publisher: 'Forge Hyperloop',
    url: 'https://www.forgehyperloop.com/',
    accessed: ACCESSED,
    kind: 'Design reference',
    supports: 'An independent project used as a design and presentation reference for this website. No facts or claims are drawn from it.',
  },
]

export const sourceById = Object.fromEntries(sources.map((s) => [s.id, s])) as Record<string, Source>
