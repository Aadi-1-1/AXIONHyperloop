import { useState } from 'react'
import { techSystems } from '../../data/technology'
import './tech.css'

/**
 * Conceptual cutaway: terminal airlock (left) → low-pressure tube with pod → vacuum station, power, sensors,
 * inspection access and safety isolation valve. Each system highlights its part of the drawing.
 */
export default function TechCutaway({ compact = false }: { compact?: boolean }) {
  const [active, setActive] = useState<string>('pod')
  const sys = techSystems.find((s) => s.id === active)!

  const hot = (id: string) => `tc-part${active === id ? ' on' : ''}`
  const marker = (id: string, x: number, y: number) => {
    const s = techSystems.find((t) => t.id === id)!
    return (
      <g
        className={`tc-marker${active === id ? ' on' : ''}`}
        transform={`translate(${x},${y})`}
        onClick={() => setActive(id)}
        aria-hidden="true"
      >
        <circle r="13" />
        <text y="4.5" textAnchor="middle">
          {s.index}
        </text>
      </g>
    )
  }

  return (
    <div className={`cutaway${compact ? ' compact' : ''}`}>
      <div className="cutaway-figure">
        <svg viewBox="0 0 1000 420" role="img" aria-label={`Conceptual cutaway of an AXION freight corridor. Highlighted: ${sys.name}.`}>
          <defs>
            <pattern id="tc-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <path d="M0 0v6" stroke="#2a3440" strokeWidth="1.4" />
            </pattern>
            <linearGradient id="tc-tube" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0" stopColor="#1d252e" />
              <stop offset="0.5" stopColor="#121820" />
              <stop offset="1" stopColor="#1a2129" />
            </linearGradient>
          </defs>

          {/* Ground */}
          <path d="M0 352h1000" stroke="#2a3440" strokeWidth="1.5" />
          <rect x="0" y="353" width="1000" height="67" fill="url(#tc-hatch)" opacity="0.6" />

          {/* Terminal building with airlock */}
          <g className={hot('terminal')}>
            <path d="M24 352V128h220v224" className="tc-structure" />
            <path d="M24 128l110-42 110 42" className="tc-structure" />
            <rect x="44" y="246" width="70" height="46" rx="3" className="tc-cargo" />
            <rect x="52" y="254" width="24" height="30" className="tc-cargo-box" />
            <rect x="82" y="254" width="24" height="30" className="tc-cargo-box" />
            <text x="44" y="314" className="tc-small">Loading at normal pressure</text>
            {/* airlock chamber */}
            <rect x="140" y="222" width="104" height="92" rx="4" className="tc-airlock" />
            <path d="M140 228v80M244 228v80" className="tc-door" />
            <text x="152" y="214" className="tc-small">Airlock</text>
            <rect x="160" y="252" width="64" height="32" rx="14" className="tc-pod-ghost" />
          </g>

          {/* Tube */}
          <g className={hot('tube')}>
            <rect x="244" y="222" width="736" height="92" rx="46" fill="url(#tc-tube)" className="tc-tube" />
            {/* cutaway opening */}
            <path d="M330 228h480" className="tc-tube-cut" />
          </g>

          {/* Supports / columns */}
          <g className="tc-structure-g">
            {[320, 520, 720, 920].map((x) => (
              <path key={x} d={`M${x - 14} 314h28l-6 38h-16z`} className="tc-support" />
            ))}
          </g>

          {/* Guideway + propulsion stator segments */}
          <g className={hot('propulsion')}>
            <path d="M250 300h724" className="tc-guideway" />
            {Array.from({ length: 30 }, (_, i) => (
              <rect key={i} x={262 + i * 24} y={292} width={16} height={6} rx={1} className="tc-stator" />
            ))}
            <path d="M250 236h724" className="tc-guideway thin" />
          </g>

          {/* Pod */}
          <g className={hot('pod')}>
            <g className="tc-pod-move">
              <rect x="430" y="246" width="200" height="44" rx="22" className="tc-pod" />
              <path d="M612 252c14 4 18 12 18 16s-4 12-18 16" className="tc-pod-nose" />
              <rect x="458" y="256" width="40" height="24" rx="2" className="tc-cargo-box" />
              <rect x="504" y="256" width="40" height="24" rx="2" className="tc-cargo-box" />
              <rect x="550" y="256" width="40" height="24" rx="2" className="tc-cargo-box" />
            </g>
          </g>

          {/* Vacuum station */}
          <g className={hot('vacuum')}>
            <rect x="766" y="96" width="92" height="74" rx="4" className="tc-equip" />
            <circle cx="790" cy="133" r="14" className="tc-equip-detail" />
            <circle cx="834" cy="133" r="14" className="tc-equip-detail" />
            <path d="M812 170v52" className="tc-pipe" />
            <path d="M800 196l12 12 12-12" className="tc-flow" />
            <text x="766" y="86" className="tc-small">Vacuum pumps</text>
          </g>

          {/* Power */}
          <g className={hot('power')}>
            <path d="M560 40l-14 34h16l-12 30" className="tc-bolt" />
            <rect x="520" y="104" width="90" height="56" rx="4" className="tc-equip" />
            <path d="M565 160v62" className="tc-cable" />
            <text x="520" y="178" className="tc-small" dx="54">Substation</text>
          </g>

          {/* Sensors & comms */}
          <g className={hot('sensors')}>
            {[300, 420, 660, 900].map((x) => (
              <g key={x}>
                <circle cx={x} cy={222} r={5} className="tc-sensor" />
                <path d={`M${x - 10} ${206} a14 14 0 0 1 20 0`} className="tc-wave" />
                <path d={`M${x - 16} ${199} a22 22 0 0 1 32 0`} className="tc-wave" />
              </g>
            ))}
            <path d="M404 120h56v40h-56z" className="tc-equip" />
            <path d="M432 120V96" className="tc-cable" />
            <circle cx="432" cy="92" r="4" className="tc-sensor" />
            <text x="378" y="176" className="tc-small">Control link</text>
          </g>

          {/* Inspection */}
          <g className={hot('inspection')}>
            <rect x="676" y="314" width="40" height="38" className="tc-access" />
            <path d="M684 322h24M684 330h24M684 338h24" className="tc-ladder" />
            <rect x="868" y="270" width="40" height="22" rx="6" className="tc-robot" />
            <circle cx="876" cy="294" r="4" className="tc-robot-wheel" />
            <circle cx="900" cy="294" r="4" className="tc-robot-wheel" />
            <text x="610" y="378" className="tc-small">Access point & inspection vehicle</text>
          </g>

          {/* Safety: isolation valve + emergency repressurisation */}
          <g className={hot('safety')}>
            <rect x="736" y="214" width="14" height="108" rx="2" className="tc-valve" />
            <path d="M743 206v-18" className="tc-pipe" />
            <circle cx="743" cy="182" r="8" className="tc-valve-head" />
            <text x="690" y="202" className="tc-small" textAnchor="end">Isolation valve</text>
          </g>

          {/* Markers */}
          {marker('pod', 530, 236)}
          {marker('propulsion', 300, 326)}
          {marker('tube', 960, 204)}
          {marker('vacuum', 872, 110)}
          {marker('power', 622, 92)}
          {marker('sensors', 300, 180)}
          {marker('terminal', 192, 112)}
          {marker('inspection', 732, 370)}
          {marker('safety', 762, 168)}

          <text x="20" y="408" className="tc-small muted-text">Conceptual illustration · not to scale · not a validated design</text>
        </svg>
      </div>

      <div className="cutaway-panel">
        <ol className="system-list" aria-label="Technology systems">
          {techSystems.map((s) => (
            <li key={s.id}>
              <button type="button" aria-pressed={active === s.id} onClick={() => setActive(s.id)}>
                <span className="mono idx">{String(s.index).padStart(2, '0')}</span>
                <span>{s.name}</span>
              </button>
            </li>
          ))}
        </ol>
        <div className="system-detail" aria-live="polite">
          <p className="label">
            {String(sys.index).padStart(2, '0')} · Conceptual
          </p>
          <h3 className="h3">{sys.name}</h3>
          <p className="system-summary">{sys.summary}</p>
          <p className="body-2 small">{sys.detail}</p>
          <p className="system-status small">
            <span className="label">Status</span> {sys.status}
          </p>
        </div>
      </div>
    </div>
  )
}
