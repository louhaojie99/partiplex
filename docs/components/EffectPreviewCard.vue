<script setup lang="ts">
import { useData } from 'vitepress'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { type BackgroundEffectId, PartiplexController } from '../../src/index'

const props = defineProps<{
  effectId: BackgroundEffectId
}>()

const canvas = ref<HTMLCanvasElement | null>(null)
const { isDark } = useData()
let controller: PartiplexController | null = null
let observer: IntersectionObserver | null = null

watch(isDark, (dark) => controller?.setTheme(dark ? 'dark' : 'light'))
watch(
  () => props.effectId,
  (effectId) => controller?.setEffect(effectId),
)

onMounted(() => {
  if (!canvas.value) return
  controller = new PartiplexController(canvas.value, {
    theme: isDark.value ? 'dark' : 'light',
    interactive: false,
    intensity: 1.5,
    maxFps: 24,
    effect: props.effectId,
  }).start()

  observer = new IntersectionObserver(
    ([entry]) => {
      entry?.isIntersecting ? controller?.resume() : controller?.pause()
    },
    { threshold: 0.01 },
  )
  observer.observe(canvas.value)
})

onBeforeUnmount(() => {
  observer?.disconnect()
  controller?.destroy()
  controller = null
})
</script>

<template>
  <canvas ref="canvas" class="effect-preview-canvas" aria-hidden="true" />
</template>
