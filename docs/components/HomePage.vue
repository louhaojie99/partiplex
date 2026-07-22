<script setup lang="ts">
import type { DocsLocale } from '../data/effects'
import HomeHero from './HomeHero.vue'

withDefaults(
  defineProps<{
    locale?: DocsLocale
  }>(),
  {
    locale: 'zh',
  },
)
</script>

<template>
  <main class="partiplex-home">
    <HomeHero :locale="locale" />
  </main>
</template>
