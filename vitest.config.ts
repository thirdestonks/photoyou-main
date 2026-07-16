import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'happy-dom',
    include: ['app/**/*.test.ts'],
    passWithNoTests: true
  }
})
