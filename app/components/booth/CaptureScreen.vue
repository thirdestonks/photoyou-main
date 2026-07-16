<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useCamera } from '~/composables/useCamera'
import { useBoothStore } from '~/stores/booth'
import { FILTERS, getFilterById } from '~/utils/filters'

const booth = useBoothStore()
// Destructured to top-level bindings so Vue's template auto-unwrap applies
// (nested access like `camera.error` in the template would NOT auto-unwrap
// and `ref="camera.videoRef"` would create a literal-named ref instead of
// binding the DOM element to it).
const { videoRef, error: cameraError, start: startCamera, stop: stopCamera, captureFrame } = useCamera()

const countdown = ref<number | null>(null)
const isRunningAuto = ref(false)
const flash = ref(false)

const currentFilter = computed(() => getFilterById(booth.filterId))
const shotLabel = computed(() => `${String(booth.photos.length + 1).padStart(2, '0')} / 04`)

onMounted(() => {
  startCamera()
})
onBeforeUnmount(() => {
  stopCamera()
})

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function takeShot() {
  const dataUrl = captureFrame(currentFilter.value.cssFilter)
  if (dataUrl) booth.capturePhoto(dataUrl)
  navigator.vibrate?.(50)
  flash.value = true
  setTimeout(() => { flash.value = false }, 300)
}

async function runAutoSequence() {
  if (isRunningAuto.value) return
  isRunningAuto.value = true
  while (booth.photos.length < 4) {
    for (let n = 10; n > 0; n--) {
      countdown.value = n
      await delay(1000)
    }
    countdown.value = null
    takeShot()
    await delay(400)
  }
  isRunningAuto.value = false
}

function onShutter() {
  if (booth.photos.length >= 4) return
  if (booth.mode === 'auto') {
    runAutoSequence()
  } else {
    takeShot()
  }
}
</script>

<template>
  <section class="flex min-h-screen flex-col gap-4 bg-booth-cream p-6">
    <header class="flex items-center justify-between">
      <h2 class="text-xl font-bold">Strike a pose</h2>
      <Transition name="pop">
        <span
          :key="shotLabel"
          class="rounded-full bg-booth-ink px-3 py-1 font-mono text-white"
        >
          {{ shotLabel }}
        </span>
      </Transition>
    </header>

    <div class="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#2b2f31]">
      <video
        ref="videoRef"
        autoplay
        playsinline
        muted
        class="h-full w-full object-cover"
        :style="{ filter: currentFilter.cssFilter, transform: 'scaleX(-1)' }"
      />
      <p
        v-if="cameraError"
        class="absolute inset-0 flex items-center justify-center p-4 text-center font-mono text-white"
      >
        camera unavailable — {{ cameraError }}
      </p>
      <Transition name="pop">
        <div
          v-if="countdown"
          :key="countdown"
          class="absolute inset-0 flex items-center justify-center text-8xl font-extrabold text-white"
        >
          {{ countdown }}
        </div>
      </Transition>
      <div
        v-if="flash"
        class="pointer-events-none absolute inset-0 animate-[shutter-flash_0.3s_ease-out] bg-white"
      />
    </div>

    <div class="flex gap-2 overflow-x-auto">
      <button
        v-for="f in FILTERS"
        :key="f.id"
        class="whitespace-nowrap rounded-full border border-booth-ink px-4 py-2 font-mono"
        :class="f.id === booth.filterId ? 'bg-booth-red text-white' : 'bg-white'"
        @click="booth.setFilter(f.id)"
      >
        {{ f.label.toUpperCase() }}
      </button>
    </div>

    <div class="flex items-center justify-between">
      <div class="flex overflow-hidden rounded-full border border-booth-ink">
        <button
          class="px-4 py-2 font-mono"
          :class="booth.mode === 'auto' ? 'bg-booth-yellow' : 'bg-white'"
          @click="booth.setMode('auto')"
        >
          AUTO
        </button>
        <button
          class="px-4 py-2 font-mono"
          :class="booth.mode === 'manual' ? 'bg-booth-yellow' : 'bg-white'"
          @click="booth.setMode('manual')"
        >
          MANUAL
        </button>
      </div>
      <button
        class="h-16 w-16 rounded-full border-4 border-booth-ink bg-booth-red transition-transform duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 disabled:opacity-50"
        :disabled="isRunningAuto"
        @click="onShutter"
      />
    </div>
  </section>
</template>
