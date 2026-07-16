<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useBoothStore } from '~/stores/booth'
import { resolveFrameSrc } from '~/utils/frames'
import { compositeStrip } from '~/utils/compositeStrip'

const booth = useBoothStore()
const stripUrl = ref<string | null>(null)
let stripBlob: Blob | null = null

interface Star {
  position: string
  size: string
  delay: number
}

const stars: Star[] = [
  { position: '-top-3 -left-3', size: 'text-2xl', delay: 0.75 },
  { position: '-top-4 right-4', size: 'text-xl', delay: 0.85 },
  { position: 'top-1/4 -right-5', size: 'text-lg', delay: 0.95 },
  { position: 'bottom-1/3 -left-5', size: 'text-lg', delay: 0.9 },
  { position: '-bottom-3 right-6', size: 'text-2xl', delay: 1.05 },
  { position: '-bottom-4 left-8', size: 'text-xl', delay: 1.0 }
]

function starStyle(delay: number) {
  return { animationDelay: `${delay}s, ${delay + 0.6}s` }
}

onMounted(async () => {
  const frameSrc = resolveFrameSrc(booth.selectedFrameId, booth.customFrameDataUrl)
  stripBlob = await compositeStrip(booth.photos, frameSrc)
  stripUrl.value = URL.createObjectURL(stripBlob)
})

onBeforeUnmount(() => {
  if (stripUrl.value) URL.revokeObjectURL(stripUrl.value)
})

function downloadStrip() {
  if (!stripBlob) return
  const url = URL.createObjectURL(stripBlob)
  const a = document.createElement('a')
  a.href = url
  a.download = `pocket-booth-${Date.now()}.png`
  a.click()
  URL.revokeObjectURL(url)
}

async function shareStrip() {
  if (!stripBlob) return
  const file = new File([stripBlob], 'pocket-booth.png', { type: 'image/png' })
  const nav = navigator as Navigator & { canShare?: (data: { files: File[] }) => boolean }
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: 'Pocket Booth' })
      return
    } catch {
      // user cancelled or share failed — fall back to download
    }
  }
  downloadStrip()
}

function retake() {
  booth.retake()
}
</script>

<template>
  <section class="flex min-h-screen flex-col items-center gap-6 bg-booth-cream p-6 text-center">
    <h2 class="text-xl font-bold text-booth-red">
      {{ stripUrl ? 'Your strip is ready ♥' : 'Printing your strip...' }}
    </h2>
    <div class="relative max-w-[260px]">
      <div v-if="!stripUrl" class="flex w-full flex-col gap-2 rounded-lg bg-white p-3">
        <div v-for="n in 4" :key="n" class="aspect-4/3 animate-pulse rounded-md bg-booth-ink/10" />
        <p class="pt-1 font-mono text-xs text-gray-500">printing your strip... hang tight ♥</p>
      </div>
      <Transition name="reveal" appear>
        <img v-if="stripUrl" :src="stripUrl" alt="Your photo strip" class="w-full rounded-lg" />
      </Transition>
      <template v-if="stripUrl">
        <span
          v-for="(star, i) in stars"
          :key="i"
          class="pointer-events-none absolute animate-[star-pop_0.5s_ease-out_forwards,twinkle_1.6s_ease-in-out_infinite] text-booth-yellow opacity-0"
          :class="[star.position, star.size]"
          :style="starStyle(star.delay)"
        >✦</span>
      </template>
    </div>
    <button
      class="w-full max-w-[320px] rounded-xl bg-booth-red py-4 font-bold text-white transition-transform duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 disabled:opacity-50"
      :disabled="!stripUrl"
      @click="downloadStrip"
    >
      ↓ DOWNLOAD STRIP
    </button>
    <div class="flex w-full max-w-[320px] gap-4">
      <button
        class="flex-1 rounded-xl border border-booth-ink bg-white p-3 transition-transform duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95"
        @click="retake"
      >
        ↺ RETAKE
      </button>
      <button
        class="flex-1 rounded-xl border border-booth-ink bg-white p-3 transition-transform duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 disabled:opacity-50"
        :disabled="!stripUrl"
        @click="shareStrip"
      >
        ↗ SHARE
      </button>
    </div>
  </section>
</template>
