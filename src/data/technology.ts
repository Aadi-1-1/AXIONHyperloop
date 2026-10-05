/** Conceptual technology systems shown in the cutaway diagram. Not a validated design. */
export type TechSystem = {
  id: string
  index: number
  name: string
  summary: string
  detail: string
  status: string
}

export const techSystems: TechSystem[] = [
  {
    id: 'pod',
    index: 1,
    name: 'Pods',
    summary: 'Sealed freight vehicles carrying standard parcel containers.',
    detail:
      'A freight pod is a pressurised shell with a container bay, onboard power, braking and monitoring. Freight pods do not need passenger cabins, which simplifies early design.',
    status: 'Concept. Pod size and payload are to be defined against customer shipment data.',
  },
  {
    id: 'propulsion',
    index: 2,
    name: 'Propulsion and guidance',
    summary: 'Electric linear motors move pods; magnetic guidance keeps them centred.',
    detail:
      'Linear motor segments in the guideway accelerate and brake the pod without wheels touching a rail. Levitation and guidance magnets hold the pod in position and allow switching between tubes.',
    status: 'Developers report low-speed test-track demonstrations; not yet proven at commercial scale.',
  },
  {
    id: 'tube',
    index: 3,
    name: 'Low-pressure tubes',
    summary: 'Sealed steel or concrete tubes on supports or in tunnels.',
    detail:
      'Reducing air pressure inside the tube cuts aerodynamic drag, allowing high speeds with less energy. Tubes must stay sealed despite thermal expansion, ground movement and earthquakes.',
    status: 'Concept. Tube material, diameter and support spacing are open design questions.',
  },
  {
    id: 'vacuum',
    index: 4,
    name: 'Vacuum systems',
    summary: 'Pumping stations reduce and maintain low pressure.',
    detail:
      'Pumps along the corridor remove air and compensate for small leaks. Isolation valves divide the tube into sections so a fault can be contained.',
    status: 'Uses established industrial vacuum equipment; long-tube operation is unproven.',
  },
  {
    id: 'power',
    index: 5,
    name: 'Power',
    summary: 'Grid connections and substations feed the propulsion system.',
    detail:
      'Electricity is drawn from the grid along the route. Braking energy can potentially be recovered. Emissions depend on how the electricity is generated.',
    status: 'Conventional grid connection; demand profile to be modelled.',
  },
  {
    id: 'sensors',
    index: 6,
    name: 'Sensors and communications',
    summary: 'Continuous monitoring of pods, tube and environment.',
    detail:
      'Sensors measure position, speed, pressure, temperature, vibration and structural movement. Secure communications link pods, wayside systems and the operations centre.',
    status: 'Built from existing rail and industrial monitoring technology; cybersecurity is a core requirement.',
  },
  {
    id: 'terminal',
    index: 7,
    name: 'Terminal loading and pressure transitions',
    summary: 'Airlocks move pods between normal air pressure and the tube.',
    detail:
      'Containers are loaded at normal pressure. The pod then enters an airlock, which is sealed and pumped down before opening to the tube. The reverse happens on arrival. Airlock cycle time limits how many pods a terminal can dispatch.',
    status: 'Concept. A terminal transfer mock-up is part of the demonstration programme.',
  },
  {
    id: 'inspection',
    index: 8,
    name: 'Inspection and maintenance',
    summary: 'Inspection vehicles, access points and workshops.',
    detail:
      'Scheduled inspection checks tube integrity, seals, guideway alignment and vacuum equipment. Pods return to workshops for maintenance. Access points must allow sections to be repressurised safely.',
    status: 'Maintenance approach to be defined with engineering partners.',
  },
  {
    id: 'safety',
    index: 9,
    name: 'Safety systems',
    summary: 'Isolation, emergency braking, repressurisation and egress.',
    detail:
      'Safety systems detect faults, stop pods, isolate tube sections and repressurise them for access. Freight-only operation removes passenger evacuation from early scope; a passenger system needs additional safety evidence and approvals.',
    status: 'No complete Hyperloop safety standard exists yet; European standards work is in progress.',
  },
]

export type Gate = {
  id: string
  index: number
  name: string
  timing: string
  question: string
  deliverables: string[]
}

export const feasibilityGates: Gate[] = [
  {
    id: 'customer',
    index: 1,
    name: 'Customer validation',
    timing: 'Year 1',
    question: 'Will shippers pay for the time and reliability AXION could offer?',
    deliverables: ['Interviews with logistics decision-makers', 'Route-specific shipment analysis', 'First market estimate using the sizing framework'],
  },
  {
    id: 'route',
    index: 2,
    name: 'Route feasibility',
    timing: 'Years 1–2',
    question: 'Which candidate corridor is technically, legally and environmentally viable?',
    deliverables: ['Comparison of candidate corridors', 'Preferred corridor for detailed study', 'Environmental baseline and lifecycle emissions model'],
  },
  {
    id: 'technical',
    index: 3,
    name: 'Technical demonstration',
    timing: 'Years 2–3',
    question: 'Do pod, propulsion, vacuum and terminal systems work together at test scale?',
    deliverables: ['Short test facility', 'Freight pod demonstrator', 'Terminal loading and pressure-transfer demonstration'],
  },
  {
    id: 'commercial',
    index: 4,
    name: 'Commercial validation',
    timing: 'Year 3',
    question: 'Are customers ready to commit, and do prices cover operating costs?',
    deliverables: ['Conditional capacity commitments', 'Validated pricing range', 'Updated, independently reviewed cost estimate'],
  },
  {
    id: 'construction',
    index: 5,
    name: 'Construction decision',
    timing: 'End of Year 3',
    question: 'Is there a financeable case to build a first corridor — or should the programme stop?',
    deliverables: ['Investment decision package', 'Construction financing plan', 'Go / redesign / stop recommendation'],
  },
]

export const passengerGateNote =
  'Passenger service requires additional safety and approval evidence — including evacuation, cabin pressure and medical response — and a separately funded programme. It is not part of these gates or the $50m budget.'
