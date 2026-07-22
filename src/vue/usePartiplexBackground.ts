import {
  type MaybeRefOrGetter,
  onBeforeUnmount,
  onMounted,
  type Ref,
  shallowRef,
  toValue,
  watch,
} from 'vue'
import { PartiplexController } from '../core/sdk'
import type { BackgroundEffectId, BackgroundTheme, PartiplexPlaybackConfig } from '../core/types'

/** Vue 组合式函数和组件共用的背景选项。 */
export interface PartiplexBackgroundOptions {
  /** 覆盖默认播放行为的配置。 */
  config?: Partial<PartiplexPlaybackConfig>
  /** 固定展示单个效果的快捷配置。 */
  effect?: BackgroundEffectId
  /** 当前明暗主题。 */
  theme?: BackgroundTheme
  /** 是否启用指针交互。 */
  interactive?: boolean
  /** 背景效果强度。 */
  intensity?: number
  /** 最大渲染帧率。 */
  maxFps?: number
  /** 是否暂停动画。 */
  paused?: boolean
  /** 效果切换完成时触发的回调。 */
  onEffectChange?: (effectId: BackgroundEffectId) => void
}

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
