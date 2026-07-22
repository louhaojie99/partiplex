<script setup lang="ts">
import { withBase } from 'vitepress'
import { computed } from 'vue'
import type { BackgroundEffectId } from '../../src/index'
import { type DocsLocale, effectDocs, getEffectDoc } from '../data/effects'
import EffectPlayground from './EffectPlayground.vue'

const props = withDefaults(
  defineProps<{
    effectId: BackgroundEffectId
    locale?: DocsLocale
  }>(),
  {
    locale: 'zh',
  },
)

const effect = computed(() => getEffectDoc(props.effectId) ?? effectDocs[0])
const effectIndex = computed(() => effectDocs.findIndex((item) => item.id === props.effectId))
const previous = computed(
  () => effectDocs[(effectIndex.value - 1 + effectDocs.length) % effectDocs.length],
)
const next = computed(() => effectDocs[(effectIndex.value + 1) % effectDocs.length])

function href(effectId: string) {
  return withBase(`${props.locale === 'en' ? '/en' : ''}/effects/${effectId}`)
}
</script>

<template>
  <article class="effect-page">
    <header class="effect-page__header">
      <p>{{ String(effectIndex + 1).padStart(2, '0') }} / {{ effectDocs.length }}</p>
      <h1>{{ effect[locale].name }}</h1>
      <code>{{ effect.id }}</code>
      <span>{{ effect[locale].description }}</span>
    </header>

    <EffectPlayground :effect-id="effectId" :locale="locale" />

    <nav class="effect-page__nav" :aria-label="locale === 'zh' ? '效果导航' : 'Effect navigation'">
      <a :href="href(previous.id)">
        <small>{{ locale === 'zh' ? '上一个' : 'Previous' }}</small>
        <span>{{ previous[locale].name }}</span>
      </a>
      <a :href="href(next.id)">
        <small>{{ locale === 'zh' ? '下一个' : 'Next' }}</small>
        <span>{{ next[locale].name }}</span>
      </a>
    </nav>
  </article>
</template>
