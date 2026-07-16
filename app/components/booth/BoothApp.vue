<script setup lang="ts">
import { useBoothStore } from '~/stores/booth'

const booth = useBoothStore()
</script>

<template>
  <div class="mx-auto max-w-[480px]">
    <Transition name="step" mode="out-in">
      <BoothIntroScreen v-if="booth.step === 'intro'" key="intro" />
      <BoothCaptureScreen v-else-if="booth.step === 'capture'" key="capture" />
      <BoothFrameScreen v-else-if="booth.step === 'frame'" key="frame" />
      <BoothResultScreen v-else-if="booth.step === 'result'" key="result" />
    </Transition>
  </div>
</template>
