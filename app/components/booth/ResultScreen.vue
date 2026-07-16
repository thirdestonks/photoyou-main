<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useBoothStore } from '~/stores/booth'
import { resolveFrameSrc } from '~/utils/frames'
import { compositeStrip } from '~/utils/compositeStrip'
import { isInAppBrowser } from '~/utils/inAppBrowser'

const booth = useBoothStore()
const stripUrl = ref<string | null>(null)
let stripBlob: Blob | null = null
const showOpenInBrowserHint = ref(false)

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

const thanksStars: Star[] = [
  { position: '-top-4 -left-4', size: 'text-2xl', delay: 0.1 },
  { position: '-top-5 right-2', size: 'text-xl', delay: 0.2 },
  { position: 'top-1/3 -right-6', size: 'text-lg', delay: 0.3 },
  { position: 'bottom-1/3 -left-6', size: 'text-lg', delay: 0.25 },
  { position: '-bottom-4 right-8', size: 'text-2xl', delay: 0.35 },
  { position: '-bottom-5 left-10', size: 'text-xl', delay: 0.15 }
]

function starStyle(delay: number) {
  return { animationDelay: `${delay}s, ${delay + 0.6}s` }
}

onMounted(async () => {
  showOpenInBrowserHint.value = isInAppBrowser()
  const frameSrc = resolveFrameSrc(booth.selectedFrameId, booth.customFrameDataUrl)
  stripBlob = await compositeStrip(booth.photos, frameSrc)
  stripUrl.value = URL.createObjectURL(stripBlob)
})

let thanksInterval: ReturnType<typeof setInterval> | undefined

onBeforeUnmount(() => {
  if (stripUrl.value) URL.revokeObjectURL(stripUrl.value)
  clearInterval(thanksInterval)
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

const { public: { feedbackEndpoint } } = useRuntimeConfig()
const feedbackOpen = ref(false)
const feedbackText = ref('')
const feedbackStatus = ref<'idle' | 'sending' | 'sent' | 'error'>('idle')
const thanksSecondsLeft = ref(2)

async function sendFeedback() {
  if (!feedbackText.value.trim()) return
  feedbackStatus.value = 'sending'
  try {
    const response = await fetch(feedbackEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ message: feedbackText.value })
    })
    if (!response.ok) throw new Error('Feedback request failed')
    feedbackStatus.value = 'sent'
    thanksSecondsLeft.value = 2
    clearInterval(thanksInterval)
    thanksInterval = setInterval(() => {
      thanksSecondsLeft.value -= 1
      if (thanksSecondsLeft.value <= 0) {
        clearInterval(thanksInterval)
        feedbackOpen.value = false
        feedbackStatus.value = 'idle'
        feedbackText.value = ''
      }
    }, 1000)
  } catch {
    feedbackStatus.value = 'error'
  }
}

function dismissThanks() {
  clearInterval(thanksInterval)
  feedbackOpen.value = false
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
        <p class="pt-1 font-mono text-xs text-gray-500">piniprint pa... wait lang</p>
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
    <p
      v-if="showOpenInBrowserHint"
      class="w-full max-w-[320px] rounded-lg bg-booth-yellow/20 p-3 font-mono text-xs text-booth-ink"
    >
      ⚠️ Naka-open ka sa Messenger/Instagram nohh?, di gagana download dito. Tap mo ⋯ o ⋮ menu sa taas and choose "Open in Browser" (Safari/Chrome) para ma-download. Pasensya waley pa kong update ditey.
    </p>
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

    <div class="w-full max-w-[320px]">
      <button
        v-if="!feedbackOpen"
        class="font-mono text-sm text-booth-teal underline"
        @click="feedbackOpen = true"
      >
        💬 May mali ba sa app ko? sabihin mo na oh!
      </button>

      <div v-else class="flex flex-col gap-2 text-left">
        <template v-if="feedbackStatus !== 'sent'">
          <textarea
            v-model="feedbackText"
            rows="3"
            placeholder="loved it, hated it, found something weird — tell me!"
            class="w-full rounded-lg border border-booth-ink p-2 font-mono text-sm"
          />
          <button
            class="rounded-xl bg-booth-teal py-2 font-bold text-white transition-transform duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 disabled:opacity-50"
            :disabled="!feedbackText.trim() || feedbackStatus === 'sending'"
            @click="sendFeedback"
          >
            {{ feedbackStatus === 'sending' ? 'sending...' : 'send feedback ♥' }}
          </button>
          <p v-if="feedbackStatus === 'error'" class="font-mono text-xs text-booth-red">
            hmmmm? di ata nagsend. try mo ulit.
          </p>
        </template>
      </div>
    </div>

    <Transition name="pop">
      <div
        v-if="feedbackStatus === 'sent'"
        class="fixed inset-0 z-50 flex items-center justify-center bg-booth-ink/50 p-6"
        @click="dismissThanks"
      >
        <div class="relative rounded-2xl bg-booth-red px-10 py-8 shadow-xl">
          <span
            v-for="(star, i) in thanksStars"
            :key="i"
            class="pointer-events-none absolute animate-[star-pop_0.5s_ease-out_forwards,twinkle_1.6s_ease-in-out_infinite] text-booth-yellow opacity-0"
            :class="[star.position, star.size]"
            :style="starStyle(star.delay)"
          >✦</span>
          <p class="font-mono text-2xl font-bold text-booth-yellow">salamat bitch.</p>
          <p class="mt-1 font-mono text-xs text-booth-yellow/70">me close {{ thanksSecondsLeft }}...</p>
        </div>
      </div>
    </Transition>
  </section>
</template>
