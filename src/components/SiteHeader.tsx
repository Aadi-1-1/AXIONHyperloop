import { useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo'

const primary = [
  { to: '/network', label: 'Network & Technology' },
  { to: '/business', label: 'Business Model' },
  { to: '/investors', label: 'Investors' },
  { to: '/evidence', label: 'Evidence' },
]

const companyLinks = [
  { to: '/', label: 'Overview', desc: 'What AXION proposes and why' },
  { to: '/leadership', label: 'Leadership', desc: 'The executive team and responsibilities' },
]

function CompanyMenu() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const id = useId()
  const { pathname } = useLocation()
  const active = pathname === '/' || pathname.startsWith('/leadership')

  useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false)
        ref.current?.querySelector('button')?.focus()
      }
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="nav-menu" ref={ref}>
      <button
        type="button"
        className={`nav-link${active ? ' active' : ''}`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        Company
        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true" className={`caret${open ? ' open' : ''}`}>
          <path d="M1.5 3.5 5 7l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      </button>
      <div className="nav-dropdown" id={id} hidden={!open}>
        {companyLinks.map((l) => (
          <NavLink key={l.to} to={l.to} end className="nav-dropdown-item" onClick={() => setOpen(false)}>
            <span>{l.label}</span>
            <span className="small muted">{l.desc}</span>
          </NavLink>
        ))}
      </div>
    </div>
  )
}

export default function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()
  const [prevPath, setPrevPath] = useState(pathname)
  if (pathname !== prevPath) {
    // Close the mobile menu after navigation.
    setPrevPath(pathname)
    setMobileOpen(false)
  }
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMobileOpen(false)
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
      <div className="header-inner">
        <Link to="/" className="logo-link" aria-label="AXION Hyperloop — home">
          <Logo />
        </Link>
        <nav className="primary-nav" aria-label="Primary">
          <CompanyMenu />
          {primary.map((l) => (
            <NavLink key={l.to} to={l.to} className="nav-link">
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          <Link to="/network" className="btn btn-sm header-explore">
            Explore Network
          </Link>
          <Link to="/present/vision" className="btn btn-sm btn-primary">
            <span>
              <span className="hide-xs">Start </span>Presentation
            </span>
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            onClick={() => setMobileOpen((o) => !o)}
          >
            <span className="visually-hidden">{mobileOpen ? 'Close menu' : 'Open menu'}</span>
            <span className={`burger${mobileOpen ? ' open' : ''}`} aria-hidden="true">
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>
      <div id="mobile-nav" className="mobile-nav" hidden={!mobileOpen}>
        <nav aria-label="Mobile">
          <p className="label">Company</p>
          {companyLinks.map((l) => (
            <NavLink key={l.to} to={l.to} end className="mobile-link">
              {l.label}
            </NavLink>
          ))}
          <p className="label" style={{ marginTop: 24 }}>
            Explore
          </p>
          {primary.map((l) => (
            <NavLink key={l.to} to={l.to} className="mobile-link">
              {l.label}
            </NavLink>
          ))}
          <div className="mobile-actions">
            <Link to="/network" className="btn">
              Explore Network
            </Link>
            <Link to="/present/vision" className="btn btn-primary">
              Start Investor Presentation
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
