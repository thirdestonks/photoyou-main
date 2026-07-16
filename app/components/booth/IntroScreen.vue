<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBoothStore } from '~/stores/booth'
import { isInAppBrowser, isAndroid, buildAndroidIntentUrl } from '~/utils/inAppBrowser'

const booth = useBoothStore()
const blockedByInAppBrowser = ref(false)
const canAutoOpen = ref(false)

onMounted(() => {
  blockedByInAppBrowser.value = isInAppBrowser()
  canAutoOpen.value = isAndroid()
})

function openIn(androidPackage: string) {
  window.location.href = buildAndroidIntentUrl(window.location.href, androidPackage)
}
</script>

<template>
  <section
    v-if="blockedByInAppBrowser"
    class="flex min-h-screen flex-col items-center justify-center gap-6 bg-booth-cream p-8 text-center"
  >
    <p class="text-3xl">🚫</p>
    <h1 class="text-2xl font-extrabold leading-tight text-booth-red">Fucc, sa Messenger/Instagram ka pala naka open!</h1>
    <p class="max-w-[320px] font-mono text-sm text-gray-600">
      Kailangan ng camera access na hindi pwede dito. Open muna sa Chrome or Brave para makapag-picture tayo.
    </p>
    <template v-if="canAutoOpen">
      <button
        class="w-full max-w-[320px] rounded-xl bg-booth-teal px-8 py-4 text-lg font-bold text-white transition-transform duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90"
        @click="openIn('com.android.chrome')"
      >
        Open in Chrome →
      </button>
      <button
        class="w-full max-w-[320px] rounded-xl border border-booth-ink bg-white px-8 py-4 text-lg font-bold transition-transform duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90"
        @click="openIn('com.brave.browser')"
      >
        Open in Brave →
      </button>
    </template>
    <p v-else class="max-w-[320px] font-mono text-xs text-gray-500">
      Tap the ⋯ or ⋮ menu sa taas and choose "Open in Browser" (Safari/Chrome).
    </p>
  </section>

  <section v-else class="flex min-h-screen flex-col items-center justify-center gap-6 bg-booth-cream p-8 text-center">
    <p class="self-start text-booth-teal">★</p>
    <h1 class="text-5xl font-extrabold leading-tight text-booth-red">SAY CHEESE!</h1>
    <p class="font-mono text-gray-600">four shots · one strip<br />for the two of us</p>
    <button
      class="rounded-xl bg-booth-teal px-8 py-4 text-lg font-bold text-white transition-transform duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90"
      @click="booth.goTo('capture')"
    >
      TAP TO START →
    </button>
    <p class="font-mono text-sm text-gray-400">INSERT COIN ·</p>
  </section>
</template>
