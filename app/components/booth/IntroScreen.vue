<script setup lang="ts">
import { useBoothStore } from '~/stores/booth'

const booth = useBoothStore()
</script>

<template>
  <section class="flex min-h-screen flex-col items-center justify-center gap-6 bg-booth-cream p-8 text-center">
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
