<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { type BackgroundEffectId, PartiplexController } from '../../src/index'
import type { DocsLocale } from '../data/effects'

const props = withDefaults(
  defineProps<{
    locale?: DocsLocale
  }>(),
  {
    locale: 'zh',
  },
)

const heroEffects: BackgroundEffectId[] = [
  'galaxy-vortex',
  'flow-field',
  'topographic',
  'portal-rings',
  'ribbon-wave',
  'moire',
]
const canvas = ref<HTMLCanvasElement | null>(null)
const activeEffect = ref<BackgroundEffectId>(heroEffects[0])
const { isDark } = useData()
let controller: PartiplexController | null = null

watch(isDark, (dark) => controller?.setTheme(dark ? 'dark' : 'light'))

function showEffect(effectId: BackgroundEffectId) {
  activeEffect.value = effectId
  controller?.setEffect(effectId)
}

onMounted(() => {
  if (!canvas.value) return
  controller = new PartiplexController(canvas.value, {
    theme: isDark.value ? 'dark' : 'light',
    intensity: 1.55,
    maxFps: 60,
    onEffectChange: (effectId) => {
      activeEffect.value = effectId
    },
    config: {
      mode: 'rotate',
      fixedEffect: heroEffects[0],
      rotationEffects: heroEffects,
      intervalMs: 10_000,
    },
  }).start()
})

onBeforeUnmount(() => {
  controller?.destroy()
  controller = null
})
</script>

<template>
  <section class="home-hero" aria-labelledby="partiplex-title">
    <canvas ref="canvas" class="home-hero__canvas" aria-hidden="true" />
    <div class="home-hero__shade" aria-hidden="true" />

    <div class="home-hero__content">
      <p class="home-hero__eyebrow">CANVAS BACKGROUNDS / 20</p>
      <h1 id="partiplex-title">Partiplex</h1>
      <p class="home-hero__line">
        {{ props.locale === 'zh' ? '20 个背景。一行接入。' : '20 backgrounds. One line.' }}
      </p>

      <div class="home-hero__actions">
        <a class="px-button px-button--primary" :href="withBase(props.locale === 'zh' ? '/guide/start' : '/en/guide/start')">
          {{ props.locale === 'zh' ? '开始' : 'Start' }}
        </a>
        <a class="px-button" :href="withBase(props.locale === 'zh' ? '/effects/' : '/en/effects/')">
          {{ props.locale === 'zh' ? '效果' : 'Effects' }}
        </a>
      </div>
    </div>

    <div class="home-hero__switcher" :aria-label="props.locale === 'zh' ? '首页效果' : 'Hero effects'">
      <button
        v-for="(effectId, index) in heroEffects"
        :key="effectId"
        type="button"
        :class="{ 'is-active': activeEffect === effectId }"
        :aria-label="`${props.locale === 'zh' ? '显示效果' : 'Show effect'} ${effectId}`"
        :aria-pressed="activeEffect === effectId"
        @click="showEffect(effectId)"
      >
        {{ String(index + 1).padStart(2, '0') }}
      </button>
    </div>
  </section>
</template>
