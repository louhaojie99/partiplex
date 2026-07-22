<script setup lang="ts">
import { computed, ref } from 'vue'
import type { BackgroundEffectId, BackgroundTheme, PartiplexPlaybackConfig } from '../core/types'
import { usePartiplexBackground } from './usePartiplexBackground'

defineOptions({ name: 'PartiplexBackground' })

const props = withDefaults(
  defineProps<{
    config?: Partial<PartiplexPlaybackConfig>
    effect?: BackgroundEffectId
    theme?: BackgroundTheme
    interactive?: boolean
    intensity?: number
    maxFps?: number
    paused?: boolean
    fullscreen?: boolean
  }>(),
  {
    theme: 'dark',
    interactive: true,
    intensity: 1.16,
    paused: false,
    fullscreen: true,
  },
)

const emit = defineEmits<{
  effectChange: [effectId: BackgroundEffectId]
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const canvasStyle = computed(() => ({
  display: 'block',
  width: '100%',
  height: '100%',
  ...(props.fullscreen
    ? { position: 'fixed' as const, inset: '0', pointerEvents: 'none' as const, zIndex: 0 }
    : {}),
}))
const options = computed(() => ({
  config: props.config,
  effect: props.effect,
  theme: props.theme,
  interactive: props.interactive,
  intensity: props.intensity,
  maxFps: props.maxFps,
  paused: props.paused,
  onEffectChange: (effectId: BackgroundEffectId) => emit('effectChange', effectId),
}))
const controls = usePartiplexBackground(canvas, options)

defineExpose({ canvas, ...controls })
</script>

<template>
  <canvas
    ref="canvas"
    class="partiplex-canvas"
    aria-hidden="true"
    :style="canvasStyle"
  />
</template>
