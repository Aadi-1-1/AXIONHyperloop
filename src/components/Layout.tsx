import { Suspense, useEffect } from 'react'
import ScrollLink from './ScrollLink'
import { Outlet, useLocation } from 'react-router-dom'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import ReturnToPresentation from './ReturnToPresentation'
import { rememberPage } from '../lib/presentation'

/** Scrolls to top on page change, or to the hash target once it has rendered. */
function ScrollManager() {
  const { pathname, hash, search } = useLocation()
  useEffect(() => {
    // Demo pages opened from the presentation are not exit targets.
    if (!new URLSearchParams(search).has('present')) rememberPage(pathname + hash)
  }, [pathname, hash, search])
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
      return
    }
    let tries = 0
    let raf = 0
    const tryScroll = () => {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) {
        el.scrollIntoView({ block: 'start' })
        return
      }
      if (tries++ < 60) raf = requestAnimationFrame(tryScroll)
    }
    tryScroll()
    return () => cancelAnimationFrame(raf)
  }, [pathname, hash])
  return null
}

/** Adds .is-visible to .reveal elements as they enter the viewport. */
function RevealObserver() {
  const { pathname } = useLocation()
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible')
            observer.unobserve(e.target)
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )
    const observeAll = () =>
      document.querySelectorAll('.reveal:not(.is-visible)').forEach((el) => observer.observe(el))
    observeAll()
    // Lazy-loaded pages and late content: watch for new nodes.
    const mo = new MutationObserver(observeAll)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      observer.disconnect()
      mo.disconnect()
    }
  }, [pathname])
  return null
}

export default function Layout() {
  return (
    <>
      <ScrollLink target="main" focus className="skip-link">
        Skip to content
      </ScrollLink>
      <ScrollManager />
      <RevealObserver />
      <SiteHeader />
      <main id="main" tabIndex={-1}>
        <Suspense
          fallback={
            <div className="page-loading" role="status">
              <span className="label">Loading</span>
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <SiteFooter />
      <ReturnToPresentation />
    </>
  )
}
