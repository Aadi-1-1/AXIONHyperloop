import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { chapters } from '../data/presentation'

const KEY = 'axion:return-chapter'

function readStored(): string | null {
  try {
    return sessionStorage.getItem(KEY)
  } catch {
    return null
  }
}
function writeStored(v: string | null) {
  try {
    if (v) sessionStorage.setItem(KEY, v)
    else sessionStorage.removeItem(KEY)
  } catch {
    /* storage unavailable — banner still works from the URL */
  }
}

/** When a presenter opens a demo from a chapter, offer a one-click return to that chapter. */
export default function ReturnToPresentation() {
  const [params] = useSearchParams()
  const fromParam = params.get('present')
  const validParam = fromParam && chapters.some((c) => c.slug === fromParam) ? fromParam : null
  const [remembered, setRemembered] = useState(readStored)
  const [dismissed, setDismissed] = useState<string | null>(null)
  if (validParam && validParam !== remembered) {
    // Keep showing the bar as the presenter moves between pages during a demo.
    setRemembered(validParam)
    setDismissed(null)
  }

  useEffect(() => {
    if (validParam) writeStored(validParam)
  }, [validParam])

  const candidate = validParam ?? remembered
  const slug = candidate && candidate !== dismissed ? candidate : null
  const index = chapters.findIndex((c) => c.slug === slug)
  if (index < 0) return null
  const chapter = chapters[index]

  return (
    <aside className="return-bar" aria-label="Presentation in progress">
      <span className="label">Presentation</span>
      <span className="return-chapter">
        <span className="mono freight-text">{String(index + 1).padStart(2, '0')}</span> {chapter.title}
      </span>
      <Link className="btn btn-sm btn-freight" to={`/present/${chapter.slug}`} onClick={() => writeStored(null)}>
        Return to chapter
      </Link>
      <button
        type="button"
        className="btn btn-sm btn-ghost"
        onClick={() => {
          writeStored(null)
          setDismissed(candidate)
        }}
        aria-label="Dismiss presentation return bar"
      >
        ✕
      </button>
    </aside>
  )
}
