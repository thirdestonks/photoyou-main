// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  // Pure client-side app (camera/canvas/PWA only make sense in-browser) —
  // build as an SPA so `nuxt generate` doesn't try to server-render/prerender it.
  ssr: false,
  modules: ['@pinia/nuxt', '@vite-pwa/nuxt'],
  css: ['~/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()]
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Pocket Booth',
      short_name: 'Pocket Booth',
      description: 'Four shots, one strip, for the two of us.',
      theme_color: '#2f7a71',
      background_color: '#f2e9d8',
      display: 'standalone',
      icons: [
        { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,ico}']
    }
  }
})
