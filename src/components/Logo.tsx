export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="11.5" fill="none" stroke="var(--freight)" strokeWidth="2.2" />
      <path d="M2 16h28" stroke="var(--text)" strokeWidth="2.2" strokeLinecap="round" />
      <circle cx="20.5" cy="16" r="3" fill="var(--passenger)" />
    </svg>
  )
}

export default function Logo() {
  return (
    <span className="logo">
      <LogoMark />
      <span className="logo-word">AXION</span>
      <span className="logo-sub">Hyperloop</span>
    </span>
  )
}
