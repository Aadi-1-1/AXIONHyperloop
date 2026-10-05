/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `npm run build:preview` bundles everything into one JS and one CSS file (fonts inlined) with
// hash routing; scripts/inline-preview.mjs then folds them into a single self-contained HTML file.
const singleFile = process.env.SINGLE_FILE === '1'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: singleFile ? 5000 : 900,
    outDir: singleFile ? 'dist-preview' : 'dist',
    assetsInlineLimit: singleFile ? 100_000_000 : 4096,
    cssCodeSplit: !singleFile,
    rollupOptions: singleFile ? { output: { inlineDynamicImports: true } } : undefined,
  },
  test: { include: ['tests/**/*.test.ts'] },
})
