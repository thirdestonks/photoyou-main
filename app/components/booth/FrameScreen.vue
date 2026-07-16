<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useBoothStore } from '~/stores/booth'
import { BUILT_IN_FRAMES, resolveFrameSrc } from '~/utils/frames'
import { compositeStrip } from '~/utils/compositeStrip'
import { readFileAsDataUrl } from '~/utils/dataUrl'

const booth = useBoothStore()
const previewUrl = ref<string | null>(null)
const isLoadingPreview = ref(false)
let lastObjectUrl: string | null = null

async function refreshPreview() {
  if (booth.photos.length < 4) return
  isLoadingPreview.value = true
  try {
    const frameSrc = resolveFrameSrc(booth.selectedFrameId, booth.customFrameDataUrl)
    const blob = await compositeStrip(booth.photos, frameSrc)
    if (lastObjectUrl) URL.revokeObjectURL(lastObjectUrl)
    lastObjectUrl = URL.createObjectURL(blob)
    previewUrl.value = lastObjectUrl
  } finally {
    isLoadingPreview.value = false
  }
}

watch(
  () => [booth.photos, booth.selectedFrameId, booth.customFrameDataUrl],
  refreshPreview,
  { immediate: true, deep: true }
)

onBeforeUnmount(() => {
  if (lastObjectUrl) URL.revokeObjectURL(lastObjectUrl)
})

async function onUpload(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file || !file.type.startsWith('image/')) return
  const dataUrl = await readFileAsDataUrl(file)
  booth.setCustomFrame(dataUrl)
}

function useThisFrame() {
  booth.goTo('result')
}
</script>

<template>
  <section class="flex min-h-screen flex-col gap-4 bg-booth-cream p-6">
    <h2 class="text-xl font-bold">Choose a frame</h2>
    <div class="flex gap-4">
      <div class="relative flex-1 overflow-hidden rounded-lg border-2 border-booth-ink bg-white">
        <!-- First-load skeleton: no preview yet at all -->
        <div v-if="!previewUrl" class="flex flex-col gap-2 p-2">
          <div v-for="n in 4" :key="n" class="aspect-4/3 animate-pulse rounded-md bg-booth-ink/10" />
          <p class="pt-1 text-center font-mono text-xs text-gray-500">loading your frame...</p>
        </div>
        <Transition name="fade" mode="out-in">
          <img v-if="previewUrl" :key="previewUrl" :src="previewUrl" alt="Strip preview" class="block w-full" />
        </Transition>
        <!-- Switching frames: dim the current preview instead of hiding it -->
        <div
          v-if="previewUrl && isLoadingPreview"
          class="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/70"
        >
          <div class="h-6 w-6 animate-spin rounded-full border-4 border-booth-ink/20 border-t-booth-red" />
          <p class="font-mono text-xs text-gray-600">loading your frame...</p>
        </div>
      </div>
      <div class="flex flex-1 flex-col gap-2">
        <p class="font-mono text-xs text-gray-500">PRESETS</p>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="frame in BUILT_IN_FRAMES"
            :key="frame.id"
            class="rounded-lg border-2 border-booth-ink bg-white p-4 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90"
            :class="[
              booth.selectedFrameId === frame.id && !booth.customFrameDataUrl
                ? 'scale-105 outline-3 outline-booth-yellow'
                : 'scale-100'
            ]"
            @click="booth.setFrame(frame.id)"
          >
            {{ frame.label }}
          </button>
        </div>
        <p class="font-mono text-xs text-gray-500">YOURS</p>
        <label class="cursor-pointer rounded-lg border-2 border-dashed border-booth-red p-4 text-center text-booth-red">
          + UPLOAD PNG
          <input type="file" accept="image/png,image/*" class="hidden" @change="onUpload" />
        </label>
      </div>
    </div>
    <button
      class="rounded-xl bg-booth-ink py-4 font-bold text-white transition-transform duration-150 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-95 disabled:opacity-50"
      :disabled="!previewUrl"
      @click="useThisFrame"
    >
      USE THIS FRAME
    </button>
  </section>
</template>
