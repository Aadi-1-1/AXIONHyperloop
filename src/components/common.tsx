import type { ReactNode } from 'react'
import { evidenceKinds, type EvidenceKind } from '../data/evidence'
import { sourceById } from '../data/sources'

export function KindTag({ kind }: { kind: EvidenceKind }) {
  return (
    <span className="kind-tag" data-kind={kind} title={evidenceKinds[kind].description}>
      {evidenceKinds[kind].label}
    </span>
  )
}

export function SourceRef({ id }: { id: string }) {
  const s = sourceById[id]
  if (!s) return null
  return (
    <a className="source-ref" href={s.url} target="_blank" rel="noopener noreferrer">
      {s.publisher}
      <span className="visually-hidden"> (opens in a new tab)</span>
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
        <path d="M3 1h6v6M9 1 1 9" fill="none" stroke="currentColor" strokeWidth="1.3" />
      </svg>
    </a>
  )
}

export function Eyebrow({ index, children }: { index?: string; children: ReactNode }) {
  return (
    <p className="eyebrow">
      {index && <span className="idx">{index}</span>}
      <span>{children}</span>
    </p>
  )
}

export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string
  title: ReactNode
  lead?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="page-header tech-grid">
      <div className="container">
        <p className="eyebrow">
          <span>{eyebrow}</span>
        </p>
        <h1 className="h1 page-title">{title}</h1>
        {lead && <p className="lead">{lead}</p>}
        {children}
      </div>
    </header>
  )
}

export function SystemChip({ system }: { system: 'freight' | 'passenger' }) {
  return (
    <span className={`chip ${system}`}>
      <span className="dot" aria-hidden="true" />
      {system === 'freight' ? 'Freight' : 'Passenger'}
    </span>
  )
}
