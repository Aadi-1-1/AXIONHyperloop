/**
 * Leadership team (proposed roles). Descriptions are responsibility-based only.
 * To add a portrait later, place an image in /public/team/ and set `portrait: '/team/name.jpg'`.
 */
export type Leader = {
  id: string
  name: string
  initials: string
  role: string
  focus: string
  responsibilities: string[]
  description: string
  portrait?: string
}

export const leadership: Leader[] = [
  {
    id: 'aadi-kapoor',
    name: 'Aadi Kapoor',
    initials: 'AK',
    role: 'Founder & Chief Executive Officer',
    focus: 'Vision and strategy',
    responsibilities: ['Vision', 'Strategy', 'Partnerships', 'Investment'],
    description:
      'Sets AXION’s direction and strategy, leads relationships with prospective partners and investors, and is accountable for the overall investment case.',
  },
  {
    id: 'nigel-gitonga',
    name: 'Nigel Gitonga',
    initials: 'NG',
    role: 'Chief Technology Officer',
    focus: 'Technical concept and feasibility',
    responsibilities: ['Transport systems', 'Technical concept', 'Feasibility'],
    description:
      'Leads the technical concept — pods, propulsion, tubes, vacuum and terminal systems — and the feasibility work that tests whether it can be built safely.',
  },
  {
    id: 'jyan-patel',
    name: 'Jyan Patel',
    initials: 'JP',
    role: 'Chief Financial Officer',
    focus: 'Financial model and funding',
    responsibilities: ['Financial modelling', 'Costs', 'Pricing', 'Funding'],
    description:
      'Owns the financial model, cost assumptions and pricing, and plans how the development programme and any later construction could be funded.',
  },
  {
    id: 'muthoni-kihungi',
    name: 'Muthoni Kihungi',
    initials: 'MK',
    role: 'Chief Operating Officer',
    focus: 'Operations and customers',
    responsibilities: ['Operations', 'Logistics', 'Customer experience', 'Market development'],
    description:
      'Designs how AXION would operate — terminals, logistics integration and customer experience — and leads market development with prospective customers.',
  },
]

export const leadershipNotice =
  'Roles are proposed for this concept-stage venture. Portraits will be added when available.'
