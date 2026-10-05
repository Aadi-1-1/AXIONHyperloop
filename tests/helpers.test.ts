import { describe, expect, it } from 'vitest'
import { validateEnquiry } from '../src/lib/enquiry'
import { demoHref } from '../src/lib/presentation'
import { chapters } from '../src/data/presentation'
import { leadership } from '../src/data/leadership'
import { prospects } from '../src/data/prospects'
import { sources } from '../src/data/sources'
import { evidenceItems } from '../src/data/evidence'

describe('enquiry validation', () => {
  const ok = { name: 'Ada Lovelace', organisation: '', email: 'ada@example.com', interest: 'investment' as const, message: 'We would like to discuss the programme.' }
  it('accepts a valid enquiry', () => {
    expect(validateEnquiry(ok)).toEqual({})
  })
  it('rejects missing name, bad email and short message', () => {
    const e = validateEnquiry({ ...ok, name: ' ', email: 'not-an-email', message: 'hi' })
    expect(Object.keys(e).sort()).toEqual(['email', 'message', 'name'])
  })
})

describe('presentation', () => {
  it('has 12 unique chapters with notes', () => {
    expect(chapters).toHaveLength(12)
    expect(new Set(chapters.map((c) => c.slug)).size).toBe(12)
    expect(chapters.every((c) => c.notes.length > 0)).toBe(true)
  })
  it('adds the return parameter before the hash', () => {
    expect(demoHref('/business#operating-model', 'financials')).toBe('/business?present=financials#operating-model')
    expect(demoHref('/network', 'network')).toBe('/network?present=network')
  })
})

describe('content guardrails', () => {
  it('uses the exact leadership names and roles', () => {
    expect(leadership.map((l) => `${l.name} — ${l.role}`)).toEqual([
      'Aadi Kapoor — Founder & Chief Executive Officer',
      'Nigel Gitonga — Chief Technology Officer',
      'Jyan Patel — Chief Financial Officer',
      'Muthoni Kihungi — Chief Operating Officer',
    ])
    expect(leadership.filter((l) => /founder/i.test(l.role))).toHaveLength(1)
  })
  it('presents prospects only as potential roles', () => {
    for (const p of prospects) expect(p.potentialRole).toMatch(/^(Potential|Possible)/)
  })
  it('cites only registered sources with access dates', () => {
    const ids = new Set(sources.map((s) => s.id))
    for (const i of evidenceItems) if (i.sourceId) expect(ids.has(i.sourceId)).toBe(true)
    for (const s of sources) expect(s.accessed).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(evidenceItems.filter((i) => i.kind === 'sourced').every((i) => i.sourceId)).toBe(true)
  })
})
