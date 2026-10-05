export const LAST_PAGE_KEY = 'axion:last-page'

/** Adds ?present=<slug> before any hash so the target page can offer a return link. */
export function demoHref(to: string, slug: string): string {
  const [path, hash] = to.split('#')
  const sep = path.includes('?') ? '&' : '?'
  return `${path}${sep}present=${slug}${hash ? `#${hash}` : ''}`
}

export function rememberPage(path: string) {
  try {
    sessionStorage.setItem(LAST_PAGE_KEY, path)
  } catch {
    /* storage unavailable */
  }
}

export function exitTarget(): string {
  try {
    const v = sessionStorage.getItem(LAST_PAGE_KEY)
    if (v && v.startsWith('/') && !v.startsWith('/present')) return v
  } catch {
    /* storage unavailable */
  }
  return '/'
}
