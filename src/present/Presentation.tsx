import { useCallback, useEffect, useRef, useState } from 'react'
import ScrollLink from '../components/ScrollLink'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { chapterAliases, chapters } from '../data/presentation'
import { LogoMark } from '../components/Logo'
import { useReducedMotion } from '../lib/hooks'
import { slideBodies } from './slides'
import { demoHref, exitTarget } from '../lib/presentation'
import './present.css'

export default function Presentation() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const index = chapters.findIndex((c) => c.slug === slug)
  const [notesOpen, setNotesOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [direction, setDirection] = useState<1 | -1>(1)
  const stageRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const fullscreenSupported = typeof document !== 'undefined' && !!document.documentElement.requestFullscreen

  const go = useCallback(
    (i: number) => {
      if (i < 0 || i >= chapters.length || i === index) return
      setDirection(i > index ? 1 : -1)
      navigate(`/present/${chapters[i].slug}`, { replace: true })
    },
    [index, navigate],
  )

  const exit = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    navigate(exitTarget())
  }, [navigate])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {})
    else document.documentElement.requestFullscreen?.().catch(() => {})
  }, [])

  useEffect(() => {
    const on = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', on)
    return () => document.removeEventListener('fullscreenchange', on)
  }, [])

  useEffect(() => {
    if (index >= 0) document.title = `${String(index + 1).padStart(2, '0')} ${chapters[index].title} — AXION Presentation`
    stageRef.current?.scrollTo({ top: 0 })
  }, [index])

  useEffect(() => {
    if (menuOpen) menuRef.current?.querySelector<HTMLElement>('[aria-current="step"]')?.focus()
  }, [menuOpen])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return
      const onControl = !!target.closest('button, a, summary')
      switch (e.key) {
        case 'ArrowRight':
        case 'PageDown':
          e.preventDefault()
          go(index + 1)
          break
        case ' ':
          if (onControl) return
          e.preventDefault()
          go(index + (e.shiftKey ? -1 : 1))
          break
        case 'ArrowLeft':
        case 'PageUp':
          e.preventDefault()
          go(index - 1)
          break
        case 'Home':
          e.preventDefault()
          go(0)
          break
        case 'End':
          e.preventDefault()
          go(chapters.length - 1)
          break
        case 'n':
        case 'N':
          setNotesOpen((o) => !o)
          break
        case 'm':
        case 'M':
          setMenuOpen((o) => !o)
          break
        case 'f':
        case 'F':
          if (fullscreenSupported) toggleFullscreen()
          break
        case 'Escape':
          if (menuOpen) {
            setMenuOpen(false)
            menuButtonRef.current?.focus()
          } else if (notesOpen) setNotesOpen(false)
          else exit()
          break
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go, index, menuOpen, notesOpen, exit, toggleFullscreen, fullscreenSupported])

  if (index < 0) return <Navigate to={`/present/${chapterAliases[slug ?? ''] ?? chapters[0].slug}`} replace />

  const chapter = chapters[index]
  const Body = slideBodies[chapter.slug]
  const num = (i: number) => String(i + 1).padStart(2, '0')

  return (
    <div className={`present${notesOpen ? ' notes-open' : ''}`}>
      <ScrollLink target="slide" focus className="skip-link">
        Skip to slide
      </ScrollLink>
      <header className="pr-top">
        <button type="button" className="pr-brand" onClick={exit} aria-label="Exit presentation">
          <LogoMark size={24} />
          <span className="pr-brand-word">AXION</span>
        </button>
        <p className="pr-kicker label" aria-hidden="true">
          {chapter.kicker}
        </p>
        <div className="pr-tools">
          <span className="pr-counter mono" aria-label={`Chapter ${index + 1} of ${chapters.length}`}>
            {num(index)} <span className="muted">/ {num(chapters.length - 1)}</span>
          </span>
          <button
            type="button"
            ref={menuButtonRef}
            className="btn btn-sm"
            aria-expanded={menuOpen}
            aria-controls="pr-menu"
            onClick={() => setMenuOpen((o) => !o)}
          >
            Chapters <kbd>M</kbd>
          </button>
          <button type="button" className="btn btn-sm" aria-expanded={notesOpen} aria-controls="pr-notes" onClick={() => setNotesOpen((o) => !o)}>
            Notes <kbd>N</kbd>
          </button>
          {fullscreenSupported && (
            <button type="button" className="btn btn-sm hide-sm" aria-pressed={isFullscreen} onClick={toggleFullscreen}>
              {isFullscreen ? 'Exit full screen' : 'Full screen'} <kbd>F</kbd>
            </button>
          )}
          <button type="button" className="btn btn-sm" onClick={exit}>
            Exit <kbd>Esc</kbd>
          </button>
        </div>
      </header>

      <main className="pr-stage" id="slide" ref={stageRef} tabIndex={-1} aria-roledescription="slide" aria-label={`${chapter.title}, chapter ${index + 1} of ${chapters.length}`}>
        <div key={chapter.slug} className={`pr-slide${reduced ? '' : direction === 1 ? ' enter-next' : ' enter-prev'}`}>
          <p className="pr-chapter-label mono">
            <span className="freight-text">{num(index)}</span> · {chapter.title}
          </p>
          <Body />
          {chapter.demo && (
            <div className="pr-demo">
              <Link to={demoHref(chapter.demo.to, chapter.slug)} className="btn btn-freight">
                {chapter.demo.label} <span className="arrow" aria-hidden="true">↗</span>
              </Link>
              <span className="small muted">Opens the live tool with a button to return here.</span>
            </div>
          )}
        </div>
      </main>

      <p className="visually-hidden" aria-live="polite">
        Chapter {index + 1} of {chapters.length}: {chapter.title}
      </p>

      <footer className="pr-bottom">
        <button type="button" className="btn btn-sm" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous chapter">
          ← <span className="hide-sm">Previous</span>
        </button>
        <nav className="pr-progress" aria-label="Chapters">
          <ol>
            {chapters.map((c, i) => (
              <li key={c.slug}>
                <button
                  type="button"
                  className={`pr-seg${i === index ? ' current' : ''}${i < index ? ' done' : ''}`}
                  aria-current={i === index ? 'step' : undefined}
                  aria-label={`${i + 1}. ${c.title}`}
                  title={`${num(i)} ${c.title}`}
                  onClick={() => go(i)}
                />
              </li>
            ))}
          </ol>
        </nav>
        <button type="button" className="btn btn-sm btn-primary" onClick={() => go(index + 1)} disabled={index === chapters.length - 1} aria-label="Next chapter">
          <span className="hide-sm">Next</span> →
        </button>
      </footer>

      <aside id="pr-notes" className="pr-notes" hidden={!notesOpen} aria-label="Presenter notes">
        <div className="pr-notes-head">
          <p className="label">Presenter notes · {chapter.title}</p>
          <button type="button" className="btn btn-sm btn-ghost" onClick={() => setNotesOpen(false)}>
            Hide notes
          </button>
        </div>
        <ul>
          {chapter.notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <p className="small muted pr-keys">
          <kbd>←</kbd> <kbd>→</kbd> navigate · <kbd>M</kbd> chapters · <kbd>N</kbd> notes · <kbd>F</kbd> full screen · <kbd>Esc</kbd> exit
        </p>
      </aside>

      {menuOpen && (
        <div className="pr-menu-backdrop" onClick={() => setMenuOpen(false)}>
          <div
            id="pr-menu"
            className="pr-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Chapters"
            ref={menuRef}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              // Keep keyboard focus inside the dialog while it is open.
              if (e.key !== 'Tab' || !menuRef.current) return
              const items = menuRef.current.querySelectorAll<HTMLElement>('button')
              const first = items[0]
              const last = items[items.length - 1]
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault()
                last.focus()
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault()
                first.focus()
              }
            }}
          >
            <div className="pr-menu-head">
              <p className="label">Chapters</p>
              <button type="button" className="btn btn-sm btn-ghost" onClick={() => setMenuOpen(false)}>
                Close
              </button>
            </div>
            <ol className="pr-menu-list">
              {chapters.map((c, i) => (
                <li key={c.slug}>
                  <button
                    type="button"
                    aria-current={i === index ? 'step' : undefined}
                    onClick={() => {
                      go(i)
                      setMenuOpen(false)
                    }}
                  >
                    <span className="mono freight-text">{num(i)}</span>
                    <span>{c.title}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  )
}
