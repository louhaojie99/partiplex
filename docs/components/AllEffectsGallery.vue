<script setup lang="ts">
import { withBase } from 'vitepress'
import { effectDocs, type DocsLocale } from '../data/effects'
import EffectPreviewCard from './EffectPreviewCard.vue'

const props = withDefaults(
  defineProps<{
    locale?: DocsLocale
  }>(),
  {
    locale: 'zh',
  },
)

function effectPath(effectId: string) {
  return withBase(`${props.locale === 'en' ? '/en' : ''}/effects/${effectId}`)
}
</script>

<template>
  <section class="effects-section" aria-labelledby="effects-gallery-title">
    <header class="effects-heading">
      <p class="section-index">01 / 20</p>
      <h1 id="effects-gallery-title">{{ props.locale === 'zh' ? '效果' : 'Effects' }}</h1>
    </header>

    <div class="effects-grid">
      <a
        v-for="(effect, index) in effectDocs"
        :key="effect.id"
        class="effect-card"
        :href="effectPath(effect.id)"
      >
        <div class="effect-visual">
          <EffectPreviewCard :effect-id="effect.id" />
          <span class="effect-index">{{ String(index + 1).padStart(2, '0') }}</span>
        </div>
        <div class="effect-meta">
          <span>{{ effect[props.locale].name }}</span>
          <code>{{ effect.id }}</code>
        </div>
      </a>
    </div>
  </section>
</template>
