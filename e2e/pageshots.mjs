// node e2e/pageshots.mjs <path> <prefix> [width] [chunkHeight]
// Full-page screenshots split into chunks, with reduced motion so reveal content is visible.
import { chromium } from 'playwright'
const [, , path = '/', prefix = 'page', w = '1440', chunk = '1600'] = process.argv
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' })
const page = await browser.newPage({ viewport: { width: +w, height: 900 }, reducedMotion: 'reduce' })
page.on('pageerror', (e) => console.log('ERR', String(e)))
page.on('console', (m) => m.type() === 'error' && console.log('CONSOLE', m.text()))
await page.goto(`${process.env.BASE_URL || 'http://localhost:5173'}${path}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
const height = await page.evaluate(() => document.documentElement.scrollHeight)
const n = Math.ceil(height / +chunk)
for (let i = 0; i < n; i++) {
  await page.screenshot({ path: `e2e/output/${prefix}-${i}.png`, fullPage: true, clip: { x: 0, y: i * +chunk, width: +w, height: Math.min(+chunk, height - i * +chunk) } })
}
console.log(`${n} chunks, height ${height}`)
await browser.close()
