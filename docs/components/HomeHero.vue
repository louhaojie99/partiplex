<script setup lang="ts">
import { useData, withBase } from 'vitepress'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { type BackgroundEffectId, PartiplexController } from '../../src/index'
import { type DocsLocale, getEffectDoc } from '../data/effects'

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
const isReady = ref(false)
const { isDark } = useData()
let controller: PartiplexController | null = null
let readyFrame = 0

watch(isDark, (dark) => controller?.setTheme(dark ? 'dark' : 'light'))

function showEffect(effectId: BackgroundEffectId) {
  activeEffect.value = effectId
  controller?.setEffect(effectId)
}

onMounted(() => {
  if (!canvas.value) return
  controller = new PartiplexController(canvas.value, {
    theme: isDark.value ? 'dark' : 'light',
    interactive: false,
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
  readyFrame = window.requestAnimationFrame(() => {
    isReady.value = true
  })
})

onBeforeUnmount(() => {
  window.cancelAnimationFrame(readyFrame)
  controller?.destroy()
  controller = null
})
</script>

<template>
  <section
    class="home-hero"
    :class="{ 'is-ready': isReady }"
    aria-labelledby="partiplex-title"
  >
    <canvas ref="canvas" class="home-hero__canvas" aria-hidden="true" />
    <div class="home-hero__shade" aria-hidden="true" />
    <div class="home-hero__grid" aria-hidden="true" />
    <div class="home-hero__noise" aria-hidden="true" />
    <div class="home-hero__frame" aria-hidden="true">
      <span />
      <span />
      <span />
      <span />
    </div>

    <div class="home-hero__content">
      <div class="home-hero__copy">
        <p class="home-hero__eyebrow">
          <span class="home-hero__signal" aria-hidden="true" />
          REAL-TIME GENERATIVE CANVAS
          <span>20 / 20</span>
        </p>
        <h1 id="partiplex-title">
          <span>Parti</span><span>plex</span>
        </h1>
        <p class="home-hero__line">
          {{
            props.locale === 'zh'
              ? '20 个电影级动态背景，一行代码即刻接入。'
              : '20 cinematic backgrounds. One line to make it move.'
          }}
        </p>

        <div class="home-hero__actions">
          <a
            class="px-button px-button--primary"
            :href="withBase(props.locale === 'zh' ? '/guide/start' : '/en/guide/start')"
          >
            <span>{{ props.locale === 'zh' ? '开始创造' : 'Start creating' }}</span>
            <span aria-hidden="true">↗</span>
          </a>
          <a
            class="px-button"
            :href="withBase(props.locale === 'zh' ? '/effects/' : '/en/effects/')"
          >
            <span>{{ props.locale === 'zh' ? '探索全部效果' : 'Explore effects' }}</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
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
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        <span>{{ getEffectDoc(effectId)?.[props.locale].name }}</span>
      </button>
    </div>

    <div class="home-hero__scroll" aria-hidden="true">
      <span>{{ props.locale === 'zh' ? '向下探索' : 'Scroll to explore' }}</span>
      <i />
    </div>
  </section>
</template>
