import {
  onBeforeUnmount,
  onMounted,
  shallowRef,
  toValue,
  watch,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'
import { PartiplexController } from '../core/sdk'
import type { BackgroundEffectId, PartiplexPlaybackConfig, BackgroundTheme } from '../core/types'

export interface PartiplexBackgroundOptions {
  config?: Partial<PartiplexPlaybackConfig>
  effect?: BackgroundEffectId
  theme?: BackgroundTheme
  interactive?: boolean
  intensity?: number
  maxFps?: number
  paused?: boolean
  onEffectChange?: (effectId: BackgroundEffectId) => void
}

/** @deprecated Use PartiplexBackgroundOptions. */
export type VueBackgroundEffectsOptions = PartiplexBackgroundOptions

export function usePartiplexBackground(
  canvas: Ref<HTMLCanvasElement | null>,
  options: MaybeRefOrGetter<PartiplexBackgroundOptions> = {},
) {
  const controller = shallowRef<PartiplexController | null>(null)

  function setEffect(effectId: BackgroundEffectId) {
    controller.value?.setEffect(effectId)
  }

  function setPlayback(config: Partial<PartiplexPlaybackConfig>) {
    controller.value?.setPlayback(config)
  }

  function setTheme(theme: BackgroundTheme) {
    controller.value?.setTheme(theme)
  }

  function setIntensity(intensity: number) {
    controller.value?.setIntensity(intensity)
  }

  function setMaxFps(maxFps?: number) {
    controller.value?.setMaxFps(maxFps)
  }

  function setInteractive(interactive: boolean) {
    controller.value?.setInteractive(interactive)
  }

  function pause() {
    controller.value?.pause()
  }

  function resume() {
    controller.value?.resume()
  }

  onMounted(() => {
    if (!canvas.value) return
    const current = toValue(options)
    controller.value = new PartiplexController(canvas.value, {
      config: current.config,
      effect: current.effect,
      theme: current.theme,
      interactive: current.interactive,
      intensity: current.intensity,
      maxFps: current.maxFps,
      onEffectChange: current.onEffectChange,
    }).start()

    if (current.effect) controller.value.setEffect(current.effect)
    if (current.paused) controller.value.pause()
  })

  watch(
    () => toValue(options),
    (current) => {
      if (!controller.value) return
      if (current.config) controller.value.setPlayback(current.config)
      if (current.effect) controller.value.setEffect(current.effect)
      if (current.theme) controller.value.setTheme(current.theme)
      if (current.intensity !== undefined) controller.value.setIntensity(current.intensity)
      controller.value.setMaxFps(current.maxFps)
      controller.value.setInteractive(current.interactive ?? true)
      controller.value.setPaused(current.paused ?? false)
    },
    { deep: true },
  )

  onBeforeUnmount(() => {
    controller.value?.destroy()
    controller.value = null
  })

  return {
    controller,
    /** @deprecated Use controller. */
    sdk: controller,
    setEffect,
    setPlayback,
    setTheme,
    setIntensity,
    setMaxFps,
    setInteractive,
    pause,
    resume,
  }
}

/** @deprecated Use usePartiplexBackground(). */
export const useBackgroundEffects = usePartiplexBackground
