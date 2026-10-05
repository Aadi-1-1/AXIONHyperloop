import type { AnchorHTMLAttributes, MouseEvent } from 'react'
import { HASH_ROUTING } from '../lib/routing'

/**
 * In-page anchor that scrolls to a section without triggering a route change,
 * so it works with both path-based and hash-based routing.
 */
export default function ScrollLink({ target, focus = false, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { target: string; focus?: boolean }) {
  const handle = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    const el = document.getElementById(target)
    if (!el) return
    e.preventDefault()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    if (focus) el.focus({ preventScroll: true })
    if (!HASH_ROUTING) history.replaceState(history.state, '', `#${target}`)
  }
  return <a href={`#${target}`} onClick={handle} {...rest} />
}
