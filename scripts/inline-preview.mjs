// Folds dist-preview/assets/*.js and *.css into dist-preview/index.html so the preview is one file.
import { readFileSync, writeFileSync, rmSync } from 'node:fs'
import { join } from 'node:path'

const dir = 'dist-preview'
let html = readFileSync(join(dir, 'index.html'), 'utf8')
const read = (src) => readFileSync(join(dir, src.replace(/^\//, '')), 'utf8')

html = html.replace(/<script type="module" crossorigin src="([^"]+)"><\/script>/g, (_, src) => {
  const code = read(src).replace(/<\/script/gi, '<\\/script')
  return `<script type="module">${code}</script>`
})
html = html.replace(/<link rel="stylesheet" crossorigin href="([^"]+)">/g, (_, href) => `<style>${read(href)}</style>`)
html = html.replace(/<link rel="modulepreload"[^>]*>/g, '')
html = html.replace('href="/favicon.svg"', `href="data:image/svg+xml,${encodeURIComponent(readFileSync(join(dir, 'favicon.svg'), 'utf8'))}"`)

if (/src="\/assets|href="\/assets/.test(html)) throw new Error('Unresolved asset reference left in preview HTML')
writeFileSync(join(dir, 'index.html'), html)
rmSync(join(dir, 'assets'), { recursive: true, force: true })
console.log(`Preview written: ${dir}/index.html (${(html.length / 1024).toFixed(0)} kB)`)
