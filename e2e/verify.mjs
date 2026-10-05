// End-to-end verification against the production build.
// Usage: npm run build && npx vite preview --port 4173 & node e2e/verify.mjs
import { chromium } from 'playwright'
import AxeBuilder from '@axe-core/playwright'
import { mkdirSync } from 'node:fs'

const BASE = process.env.BASE_URL || 'http://localhost:4173'
const EXEC = process.env.PW_CHROMIUM || '/opt/pw-browsers/chromium'
const OUT = 'e2e/output/verify'
mkdirSync(OUT, { recursive: true })

const results = []
let failed = 0
async function check(name, fn) {
  try {
    await fn()
    results.push(`PASS  ${name}`)
  } catch (e) {
    failed++
    results.push(`FAIL  ${name}\n      ${String(e.message || e).split('\n')[0]}`)
  }
}
const waitPath = (page, re) => page.waitForFunction((src) => new RegExp(src).test(location.pathname + location.search + location.hash), re.source)
function assert(cond, msg) {
  if (!cond) throw new Error(msg)
}

const routes = ['/', '/network', '/business', '/investors', '/evidence', '/leadership', '/present/vision', '/present/financials']

const browser = await chromium.launch({ executablePath: EXEC })

async function newPage(opts = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts })
  const page = await ctx.newPage()
  page.errors = []
  page.on('pageerror', (e) => page.errors.push(String(e)))
  page.on('console', (m) => m.type() === 'error' && page.errors.push(m.text()))
  return page
}

// ---------- Direct loads ----------
for (const r of [...routes, '/not-a-page', '/present', '/present/unknown-slug']) {
  await check(`direct load ${r}`, async () => {
    const page = await newPage()
    const res = await page.goto(BASE + r, { waitUntil: 'networkidle' })
    assert(res.status() === 200, `status ${res.status()}`)
    if (r.startsWith('/present')) {
      await page.waitForSelector('.pr-counter')
      if (r !== '/present/financials') assert(page.url().endsWith('/present/vision'), `redirected to ${page.url()}`)
    } else {
      await page.waitForSelector('h1')
    }
    if (r === '/not-a-page') assert((await page.textContent('h1')).includes('isn’t on the network'), '404 heading')
    assert(page.errors.length === 0, page.errors.join(' | '))
    await page.context().close()
  })
}

// ---------- Navigation ----------
await check('primary navigation and header actions', async () => {
  const page = await newPage()
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  const nav = page.getByRole('navigation', { name: 'Primary' })
  for (const [label, path] of [
    ['Network & Technology', '/network'],
    ['Business Model', '/business'],
    ['Investors', '/investors'],
    ['Evidence', '/evidence'],
  ]) {
    await nav.getByRole('link', { name: label }).click()
    await page.waitForURL(BASE + path)
    await page.waitForSelector('h1')
  }
  await nav.getByRole('button', { name: 'Company' }).click()
  await page.getByRole('link', { name: /Leadership/ }).first().click()
  await page.waitForURL(BASE + '/leadership')
  await page.waitForSelector('.leader')
  assert((await page.locator('.leader').count()) === 4, 'four leaders')
  await page.getByRole('link', { name: 'Explore Network' }).first().click()
  await page.waitForURL(BASE + '/network')
  await page.getByRole('link', { name: /Start Presentation/ }).first().click()
  await page.waitForURL(BASE + '/present/vision')
  assert(page.errors.length === 0, page.errors.join(' | '))
  await page.context().close()
})

await check('every internal link resolves (footer + in-page)', async () => {
  const page = await newPage()
  const hrefs = new Set()
  for (const r of routes.slice(0, 6)) {
    await page.goto(BASE + r, { waitUntil: 'networkidle' })
    for (const h of await page.$$eval('a[href^="/"]', (as) => as.map((a) => a.getAttribute('href')))) hrefs.add(h)
  }
  for (const h of hrefs) {
    await page.goto('about:blank')
    const res = await page.goto(BASE + h, { waitUntil: 'networkidle' })
    assert(res && res.status() === 200, `${h} → ${res && res.status()}`)
    if (!h.startsWith('/present')) await page.waitForSelector('h1')
    const path = h.split('#')[0].split('?')[0]
    if (!path.startsWith('/present')) assert(!(await page.textContent('h1')).includes('isn’t on the network'), `${h} hit 404 page`)
    const hash = h.split('#')[1]
    if (hash) assert((await page.locator(`#${hash}`).count()) === 1, `${h} anchor missing`)
  }
  results.push(`      checked ${hrefs.size} internal links`)
  await page.context().close()
})

await check('external links are well-formed and open safely', async () => {
  const page = await newPage()
  const ext = new Map()
  for (const r of routes.slice(0, 6)) {
    await page.goto(BASE + r, { waitUntil: 'networkidle' })
    for (const a of await page.$$eval('a[href^="http"]', (as) => as.map((a) => ({ href: a.href, target: a.target, rel: a.rel })))) ext.set(a.href, a)
  }
  for (const a of ext.values()) {
    assert(a.href.startsWith('https://'), `not https: ${a.href}`)
    assert(a.target === '_blank' && a.rel.includes('noopener'), `unsafe target: ${a.href}`)
  }
  results.push(`      ${ext.size} unique external links`)
  await page.context().close()
})

// ---------- Presentation ----------
await check('presentation keyboard, menu, notes, exit', async () => {
  const page = await newPage()
  await page.goto(BASE + '/investors', { waitUntil: 'networkidle' })
  await page.goto(BASE + '/present/vision', { waitUntil: 'networkidle' })
  const counter = () => page.textContent('.pr-counter')
  assert((await counter()).includes('01'), 'starts at 01')
  await page.keyboard.press('ArrowRight')
  await waitPath(page, /present\/problem/)
  assert((await counter()).includes('02'), 'next → 02')
  await page.keyboard.press('ArrowLeft')
  await waitPath(page, /present\/vision/)
  await page.keyboard.press('End')
  await waitPath(page, /present\/close/)
  assert((await counter()).includes('12'), 'End → 12')
  await page.keyboard.press('Home')
  await waitPath(page, /present\/vision/)
  assert(await page.locator('#pr-notes').isHidden(), 'notes hidden by default')
  await page.keyboard.press('n')
  assert(await page.locator('#pr-notes').isVisible(), 'N shows notes')
  await page.keyboard.press('n')
  await page.keyboard.press('m')
  assert(await page.getByRole('dialog', { name: 'Chapters' }).isVisible(), 'M opens menu')
  await page.getByRole('dialog').getByRole('button', { name: /Business model/ }).click()
  await waitPath(page, /present\/business-model/)
  assert((await counter()).includes('07'), 'menu jump → 07')
  await page.getByRole('button', { name: /^9\. Development programme/ }).click()
  await waitPath(page, /present\/programme/)
  await page.getByRole('button', { name: 'Next chapter' }).click()
  await waitPath(page, /present\/ask/)
  assert(await page.getByRole('button', { name: /Full screen/ }).isVisible(), 'fullscreen control')
  await page.keyboard.press('m')
  await page.keyboard.press('Escape')
  assert(!(await page.getByRole('dialog').isVisible().catch(() => false)), 'Esc closes menu first')
  await page.keyboard.press('Escape')
  await page.waitForURL(BASE + '/investors')
  assert(page.errors.length === 0, page.errors.join(' | '))
  await page.context().close()
})

await check('presentation demo opens tool and returns to same chapter', async () => {
  const page = await newPage()
  await page.goto(BASE + '/present/network', { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: /Open network explorer/ }).click()
  await waitPath(page, /\/network\?present=network/)
  await page.waitForSelector('.network-map svg')
  const bar = page.getByRole('complementary', { name: 'Presentation in progress' })
  assert(await bar.isVisible(), 'return bar visible')
  await page.getByRole('link', { name: 'Business Model' }).first().click()
  await page.waitForURL(BASE + '/business')
  assert(await bar.isVisible(), 'return bar persists across pages')
  await bar.getByRole('link', { name: 'Return to chapter' }).click()
  await waitPath(page, /present\/network/)
  assert((await page.textContent('.pr-counter')).includes('04'), 'returned to 04')
  await page.goto(BASE + '/present/financials', { waitUntil: 'networkidle' })
  await page.getByRole('link', { name: /Open operating explorer/ }).click()
  await waitPath(page, /business\?present=financials#operating-model/)
  await page.waitForSelector('.opx')
  await page.context().close()
})

// ---------- Network explorer ----------
await check('network explorer controls', async () => {
  const page = await newPage()
  await page.goto(BASE + '/network', { waitUntil: 'networkidle' })
  await page.waitForSelector('.network-map svg .nm-arc')
  const phase2 = page.getByRole('button', { name: /India and Europe/ })
  await phase2.click()
  assert((await phase2.getAttribute('aria-pressed')) === 'true', 'phase 2 pressed')
  assert((await page.locator('.nm-hub').count()) > 11, 'phase 2 hubs added')
  await page.getByRole('button', { name: /Africa and the Americas/ }).click()
  await page.getByRole('button', { name: /Europe — Americas/ }).click()
  const panel = page.getByRole('complementary', { name: 'Selection details' })
  assert((await panel.textContent()).includes('not surveyed tube alignments'), 'alignment disclaimer')
  assert((await panel.textContent()).includes('No pods are animated'), 'no pods on ocean crossing')
  await page.getByRole('button', { name: 'Kunming', exact: true }).click()
  assert((await panel.textContent()).includes('Planning assumption'), 'hub detail')
  await page.getByRole('button', { name: 'Reset view' }).click()
  assert((await panel.textContent()).includes('No launch corridor has been selected'), 'reset clears selection')
  await page.getByRole('button', { name: 'Freight', exact: true }).click()
  assert((await page.locator('.nm-arc.freight').count()) === 0, 'freight hidden')
  assert((await page.locator('.nm-arc.passenger').count()) > 0, 'passenger shown')
  await page.getByRole('button', { name: 'Passenger', exact: true }).click()
  assert((await page.locator('.nm-arc').count()) === 0, 'all hidden')
  await page.getByRole('button', { name: 'Freight', exact: true }).click()
  const play = page.locator('.explorer-controls').getByRole('button', { name: /Pause|Play/ })
  const before = await play.textContent()
  await play.click()
  assert((await play.textContent()) !== before, 'play/pause toggles')
  await page.getByRole('button', { name: 'Flat map' }).click()
  await page.waitForSelector('.network-map.mode-map')
  await page.getByRole('button', { name: 'Zoom in' }).click()
  const box = await page.locator('.network-map').boundingBox()
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await page.mouse.down()
  await page.mouse.move(box.x + box.width / 2 + 120, box.y + box.height / 2, { steps: 6 })
  await page.mouse.up()
  assert(page.errors.length === 0, page.errors.join(' | '))
  await page.context().close()
})

await check('technology cutaway selection', async () => {
  const page = await newPage()
  await page.goto(BASE + '/network#technology', { waitUntil: 'networkidle' })
  await page.locator('.system-list').getByRole('button', { name: /Vacuum systems/ }).click()
  assert((await page.textContent('.system-detail h3')) === 'Vacuum systems', 'detail updates')
  await page.context().close()
})

// ---------- Financial explorer ----------
await check('operating explorer: scenarios, zero margin, reset', async () => {
  const page = await newPage()
  await page.goto(BASE + '/business#operating-model', { waitUntil: 'networkidle' })
  const big = page.locator('.opx-big')
  assert((await big.textContent()).includes('$15.4m'), `default 60% → ${await big.textContent()}`)
  const util = page.getByLabel('Utilisation', { exact: true })
  await util.fill('0.3')
  await page.waitForTimeout(700)
  assert((await big.textContent()).includes('−$9.8m'), `30% → ${await big.textContent()}`)
  await util.fill('0.85')
  await page.waitForTimeout(700)
  assert((await big.textContent()).includes('$36.4m'), `85% → ${await big.textContent()}`)
  assert((await page.textContent('.opx-metrics')).includes('291.7m kg'), 'break-even kg')
  await page.getByLabel('Average customer charge', { exact: true }).fill('0.08')
  await page.waitForTimeout(600)
  assert((await page.textContent('.opx-results')).includes('No finite operating break-even'), 'zero margin handled')
  await page.getByLabel('Variable cost', { exact: true }).fill('0.25')
  await page.waitForTimeout(600)
  assert((await page.textContent('.opx-results')).includes('No finite operating break-even'), 'negative margin handled')
  await page.getByRole('button', { name: 'Reset to defaults' }).click()
  await page.waitForTimeout(700)
  assert((await big.textContent()).includes('$15.4m'), 'reset restores default')
  assert(await page.getByRole('button', { name: 'Reset to defaults' }).isDisabled(), 'reset disabled at defaults')
  await page.getByLabel('Average customer charge', { exact: true }).fill('0.1')
  await page.getByLabel('Variable cost', { exact: true }).fill('0.09')
  await page.waitForTimeout(600)
  assert((await page.textContent('.opx-results')).includes('Break-even exceeds capacity'), 'beyond capacity')
  const text = await page.textContent('main')
  assert(text.includes('$10.8m') && text.includes('not on top of it'), 'salary inclusion note')
  assert(!/\$60\.8m/.test(text), 'no double-counted salaries')
  await page.context().close()
})

// ---------- Journey ----------
await check('shipment journey stages and customs toggle', async () => {
  const page = await newPage()
  await page.goto(BASE + '/#journey', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Stage 4: Tube transport' }).click()
  assert((await page.textContent('.jd-title')) === 'Tube transport', 'stage 4 selected')
  await page.getByRole('button', { name: 'Next stage →' }).click()
  assert((await page.textContent('.jd-title')) === 'Receiving terminal', 'next stage')
  assert((await page.textContent('.journey-detail')).includes('Customs and inspection'), 'customs shown')
  await page.getByRole('button', { name: 'Cross-border shipment' }).click()
  assert((await page.textContent('.journey-detail')).includes('Domestic shipment'), 'customs hidden when domestic')
  await page.context().close()
})

// ---------- Enquiry ----------
await check('demonstration enquiry form validates honestly', async () => {
  const page = await newPage()
  await page.goto(BASE + '/investors#enquire', { waitUntil: 'networkidle' })
  const form = page.locator('form.enquiry')
  assert((await form.textContent()).includes('nothing is sent or stored'), 'demo notice before submit')
  await form.getByRole('button', { name: /Check enquiry/ }).click()
  assert((await form.locator('[aria-invalid="true"]').count()) === 3, 'three invalid fields')
  await form.getByLabel('Name').fill('Test Investor')
  await form.getByLabel('Email').fill('test@example.com')
  await form.getByLabel('Message').fill('Interested in the development programme milestones.')
  await page.getByRole('button', { name: 'Engineering / infrastructure partnership' }).click()
  assert((await form.getByLabel('Enquiry type').inputValue()) === 'engineering', 'path syncs to form')
  await form.getByRole('button', { name: /Check enquiry/ }).click()
  const done = page.locator('.enquiry-done')
  assert((await done.textContent()).includes('has not been sent'), 'honest confirmation')
  await page.context().close()
})

await check('evidence register filter', async () => {
  const page = await newPage()
  await page.goto(BASE + '/evidence', { waitUntil: 'networkidle' })
  const all = await page.locator('.register tbody tr').count()
  await page.getByRole('button', { name: /^Sourced fact/ }).click()
  const sourced = await page.locator('.register tbody tr').count()
  assert(sourced > 0 && sourced < all, `filter ${sourced}/${all}`)
  assert((await page.locator('.register tbody tr .source-ref').count()) === sourced, 'each sourced row cites')
  await page.context().close()
})

// ---------- Layouts & overflow ----------
const viewports = { desktop: [1440, 900], projector: [1920, 1080], laptop: [1280, 720], mobile: [390, 844] }
for (const [name, [w, h]] of Object.entries(viewports)) {
  await check(`no horizontal overflow · ${name} ${w}×${h}`, async () => {
    const page = await newPage({ viewport: { width: w, height: h }, reducedMotion: 'reduce' })
    const bad = []
    for (const r of routes) {
      await page.goto(BASE + r, { waitUntil: 'networkidle' })
      await page.waitForTimeout(250)
      const over = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)
      if (over > 1) bad.push(`${r} +${over}px`)
      if (name === 'mobile' || name === 'projector') {
        const file = `${OUT}/${name}${r.replace(/\//g, '_') || '_home'}.png`
        await page.screenshot({ path: file, fullPage: !r.startsWith('/present') })
      }
    }
    assert(bad.length === 0, bad.join(', '))
    await page.context().close()
  })
}

await check('mobile menu opens and navigates', async () => {
  const page = await newPage({ viewport: { width: 390, height: 844 } })
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.getByRole('button', { name: 'Open menu' }).click()
  const nav = page.getByRole('navigation', { name: 'Mobile' })
  assert(await nav.isVisible(), 'menu visible')
  await nav.getByRole('link', { name: 'Leadership' }).click()
  await page.waitForURL(BASE + '/leadership')
  await page.waitForSelector('#mobile-nav[hidden]', { state: 'attached' })
  await page.context().close()
})

// ---------- Reduced motion ----------
await check('reduced motion: no slide animation, static hero', async () => {
  const page = await newPage({ reducedMotion: 'reduce' })
  await page.goto(BASE + '/present/vision', { waitUntil: 'networkidle' })
  await page.keyboard.press('ArrowRight')
  const cls = await page.getAttribute('.pr-slide', 'class')
  assert(!cls.includes('enter-'), `slide class ${cls}`)
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForSelector('.hero-visual canvas')
  assert((await page.locator('.hero-visual').getByRole('button', { name: 'Pause' }).count()) === 0, 'no autoplay control when reduced')
  assert((await page.textContent('.hv-caption')).includes('Proposed Phase 1'), 'shows final network frame')
  await page.goto(BASE + '/network', { waitUntil: 'networkidle' })
  assert(await page.locator('.explorer-controls').getByRole('button', { name: 'Play' }).isDisabled(), 'motion control disabled')
  await page.context().close()
})

await check('focus indicator visible on keyboard focus', async () => {
  const page = await newPage()
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  const outline = await page.evaluate(() => getComputedStyle(document.activeElement).outlineStyle + ' ' + getComputedStyle(document.activeElement).outlineWidth)
  assert(outline.startsWith('solid') && !outline.endsWith(' 0px'), `outline ${outline}`)
  await page.context().close()
})

// ---------- Accessibility (axe) ----------
for (const r of routes) {
  await check(`axe scan ${r}`, async () => {
    const page = await newPage({ reducedMotion: 'reduce' })
    await page.goto(BASE + r, { waitUntil: 'networkidle' })
    await page.waitForTimeout(300)
    const res = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()
    const v = res.violations.map((x) => `${x.id}(${x.nodes.length}): ${x.nodes[0]?.target}`)
    assert(v.length === 0, v.join(' ; '))
    await page.context().close()
  })
}

await browser.close()

// ---------- WebGL disabled ----------
await check('network renders with WebGL disabled', async () => {
  const b = await chromium.launch({ executablePath: EXEC, args: ['--disable-webgl', '--disable-3d-apis', '--disable-gpu'] })
  const page = await b.newPage()
  const errs = []
  page.on('pageerror', (e) => errs.push(String(e)))
  await page.goto(BASE + '/network', { waitUntil: 'networkidle' })
  const webgl = await page.evaluate(() => !!document.createElement('canvas').getContext('webgl'))
  assert(!webgl, 'WebGL should be unavailable in this check')
  await page.waitForSelector('.network-map svg .nm-land')
  assert((await page.locator('.nm-arc').count()) > 0, 'arcs drawn')
  await page.goto(BASE + '/', { waitUntil: 'networkidle' })
  await page.waitForSelector('.hero-visual canvas')
  assert(errs.length === 0, errs.join(' | '))
  await b.close()
})

console.log(results.join('\n'))
console.log(`\n${results.filter((r) => r.startsWith('PASS')).length} passed, ${failed} failed`)
process.exit(failed ? 1 : 0)
