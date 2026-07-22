<script setup lang="ts">
import { useData } from 'vitepress'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { type BackgroundEffectId, type BackgroundTheme, PartiplexController } from '../../src/index'
import type { DocsLocale } from '../data/effects'

const props = withDefaults(
  defineProps<{
    effectId: BackgroundEffectId
    locale?: DocsLocale
  }>(),
  {
    locale: 'zh',
  },
)

const { isDark } = useData()
const canvas = ref<HTMLCanvasElement | null>(null)
const theme = ref<BackgroundTheme>(isDark.value ? 'dark' : 'light')
const intensity = ref(1.4)
const maxFps = ref(60)
const paused = ref(false)
const pointerX = ref(0.5)
const pointerY = ref(0.5)
const copied = ref(false)
let controller: PartiplexController | null = null
let copyTimer = 0

const labels = computed(() =>
  props.locale === 'zh'
    ? {
        theme: '主题',
        dark: '暗色',
        light: '亮色',
        intensity: '强度',
        fps: '帧率',
        pause: '暂停',
        resume: '继续',
        pointer: '指针',
        pointerHelp: '拖动，或使用方向键',
        reset: '居中',
        copy: '复制',
        copied: '已复制',
      }
    : {
        theme: 'Theme',
        dark: 'Dark',
        light: 'Light',
        intensity: 'Intensity',
        fps: 'FPS',
        pause: 'Pause',
        resume: 'Resume',
        pointer: 'Pointer',
        pointerHelp: 'Drag or use arrow keys',
        reset: 'Center',
        copy: 'Copy',
        copied: 'Copied',
      },
)

const code = computed(
  () => `import { createPartiplexBackground } from 'partiplex'

createPartiplexBackground({
  effect: '${props.effectId}',
  theme: '${theme.value}',
  intensity: ${intensity.value.toFixed(1)},
})`,
)

function createController() {
  controller?.destroy()
  if (!canvas.value) return
  controller = new PartiplexController(canvas.value, {
    theme: theme.value,
    intensity: intensity.value,
    maxFps: maxFps.value,
    interactive: true,
    effect: props.effectId,
  }).start()
  paused.value ? controller.pause() : controller.resume()
  nextTick(sendPointer)
}

function sendPointer() {
  if (!canvas.value || typeof PointerEvent === 'undefined') return
  const bounds = canvas.value.getBoundingClientRect()
  window.dispatchEvent(
    new PointerEvent('pointermove', {
      clientX: bounds.left + pointerX.value * bounds.width,
      clientY: bounds.top + pointerY.value * bounds.height,
      pointerType: 'mouse',
    }),
  )
}

function updatePointer(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement
  const bounds = target.getBoundingClientRect()
  pointerX.value = Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width))
  pointerY.value = Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height))
  sendPointer()
}

function handlePointerDown(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement
  target.setPointerCapture(event.pointerId)
  updatePointer(event)
}

function handlePointerMove(event: PointerEvent) {
  if ((event.currentTarget as HTMLElement).hasPointerCapture(event.pointerId)) updatePointer(event)
}

function handlePointerKeydown(event: KeyboardEvent) {
  const step = event.shiftKey ? 0.1 : 0.03
  if (event.key === 'ArrowLeft') pointerX.value -= step
  else if (event.key === 'ArrowRight') pointerX.value += step
  else if (event.key === 'ArrowUp') pointerY.value -= step
  else if (event.key === 'ArrowDown') pointerY.value += step
  else if (event.key === 'Home') {
    pointerX.value = 0.5
    pointerY.value = 0.5
  } else return

  event.preventDefault()
  pointerX.value = Math.min(1, Math.max(0, pointerX.value))
  pointerY.value = Math.min(1, Math.max(0, pointerY.value))
  sendPointer()
}

function resetPointer() {
  pointerX.value = 0.5
  pointerY.value = 0.5
  sendPointer()
}

async function copyCode() {
  if (!navigator.clipboard) return
  await navigator.clipboard.writeText(code.value)
  copied.value = true
  window.clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => {
    copied.value = false
  }, 1600)
}

watch(theme, (value) => controller?.setTheme(value))
watch(paused, (value) => (value ? controller?.pause() : controller?.resume()))
watch(intensity, (value) => controller?.setIntensity(value))
watch(maxFps, (value) => controller?.setMaxFps(value))
watch(
  () => props.effectId,
  (effectId) => controller?.setEffect(effectId),
)

onMounted(createController)

onBeforeUnmount(() => {
  window.clearTimeout(copyTimer)
  controller?.destroy()
  controller = null
})
</script>

<template>
  <section class="effect-playground" :class="`is-${theme}`">
    <div class="effect-stage">
      <canvas ref="canvas" class="effect-stage__canvas" aria-hidden="true" />
      <div class="effect-stage__status">
        <span>{{ effectId }}</span>
        <span>{{ maxFps }} FPS</span>
      </div>
      <button
        class="effect-stage__pause"
        type="button"
        :aria-pressed="paused"
        @click="paused = !paused"
      >
        {{ paused ? labels.resume : labels.pause }}
      </button>
    </div>

    <div class="effect-controls">
      <fieldset class="control-block">
        <legend>{{ labels.theme }}</legend>
        <div class="segmented-control">
          <button type="button" :aria-pressed="theme === 'dark'" @click="theme = 'dark'">
            {{ labels.dark }}
          </button>
          <button type="button" :aria-pressed="theme === 'light'" @click="theme = 'light'">
            {{ labels.light }}
          </button>
        </div>
      </fieldset>

      <label class="control-block control-range">
        <span>{{ labels.intensity }} <output>{{ intensity.toFixed(1) }}</output></span>
        <input v-model.number="intensity" type="range" min="0.5" max="1.9" step="0.1" />
      </label>

      <fieldset class="control-block">
        <legend>{{ labels.fps }}</legend>
        <div class="segmented-control">
          <button
            v-for="value in [24, 30, 60]"
            :key="value"
            type="button"
            :aria-pressed="maxFps === value"
            @click="maxFps = value"
          >
            {{ value }}
          </button>
        </div>
      </fieldset>

      <div class="control-block pointer-control">
        <div class="pointer-control__head">
          <span>{{ labels.pointer }}</span>
          <button type="button" @click="resetPointer">{{ labels.reset }}</button>
        </div>
        <button
          class="pointer-pad"
          type="button"
          :aria-label="`${labels.pointer}. ${labels.pointerHelp}`"
          @pointerdown="handlePointerDown"
          @pointermove="handlePointerMove"
          @keydown="handlePointerKeydown"
        >
          <span class="pointer-pad__axis pointer-pad__axis--x" aria-hidden="true" />
          <span class="pointer-pad__axis pointer-pad__axis--y" aria-hidden="true" />
          <span
            class="pointer-pad__thumb"
            :style="{ left: `${pointerX * 100}%`, top: `${pointerY * 100}%` }"
            aria-hidden="true"
          />
        </button>
        <small>{{ labels.pointerHelp }}</small>
      </div>
    </div>

    <div class="effect-code">
      <div class="effect-code__head">
        <span>TypeScript</span>
        <button type="button" @click="copyCode">{{ copied ? labels.copied : labels.copy }}</button>
      </div>
      <pre><code>{{ code }}</code></pre>
    </div>
  </section>
</template>
