import { PartiplexController } from './sdk'
import type {
  BackgroundEffectId,
  BackgroundTheme,
  PartiplexControllerOptions,
  PartiplexPlaybackConfig,
  PartiplexState,
} from './types'

/** 创建并挂载背景时使用的选项。 */
export interface CreatePartiplexBackgroundOptions extends PartiplexControllerOptions {
  /** Canvas 挂载目标，默认为 document.body。 */
  target?: HTMLElement | string
  /** 使用该效果并以固定模式启动。 */
  effect?: BackgroundEffectId
  /** 添加到生成 Canvas 上的额外类名。 */
  className?: string
  /** 生成 Canvas 使用的 CSS 定位方式。 */
  position?: 'fixed' | 'absolute'
  /** 生成 Canvas 使用的 CSS 层叠顺序。 */
  zIndex?: number
}

/** 已挂载背景对外提供的控制接口。 */
export interface PartiplexBackground {
  /** 挂载到页面中的 Canvas 元素。 */
  canvas: HTMLCanvasElement
  /** 用于高级操作的完整控制器。 */
  controller: PartiplexController
  /** 切换到指定效果并关闭轮播。 */
  setEffect: (effectId: BackgroundEffectId) => PartiplexBackground
  /** 更新固定或轮播播放配置。 */
  setPlayback: (config: Partial<PartiplexPlaybackConfig>) => PartiplexBackground
  /** 更新背景明暗主题。 */
  setTheme: (theme: BackgroundTheme) => PartiplexBackground
  /** 更新背景效果强度。 */
  setIntensity: (intensity: number) => PartiplexBackground
  /** 更新最大渲染帧率。 */
  setMaxFps: (maxFps?: number) => PartiplexBackground
  /** 开启或关闭指针交互。 */
  setInteractive: (interactive: boolean) => PartiplexBackground
  /** 暂停动画并保留当前画面。 */
  pause: () => PartiplexBackground
  /** 恢复已暂停的动画。 */
  resume: () => PartiplexBackground
  /** 获取当前效果标识。 */
  getCurrentEffect: () => BackgroundEffectId
  /** 获取当前播放配置的副本。 */
  getPlayback: () => PartiplexPlaybackConfig
  /** 判断动画是否已被手动暂停。 */
  isPaused: () => boolean
  /** 获取控制器当前状态的快照。 */
  getState: () => PartiplexState
  /** 销毁控制器并移除 Canvas。 */
  destroy: () => void
}

function resolveTarget(target: HTMLElement | string | undefined) {
  if (!target) return document.body
  if (typeof target !== 'string') return target
  const element = document.querySelector<HTMLElement>(target)
  if (!element) throw new Error(`Partiplex could not find mount target: ${target}`)
  return element
}

/** 一次性创建、挂载并启动 Partiplex 背景。 */
export function createPartiplexBackground(
  options: CreatePartiplexBackgroundOptions = {},
): PartiplexBackground {
  if (typeof document === 'undefined') {
    throw new Error('createPartiplexBackground() can only run in a browser environment.')
  }

  const {
    target: targetOption,
    effect,
    className,
    position,
    zIndex = 0,
    config,
    ...controllerOptions
  } = options
  const target = resolveTarget(targetOption)
  const canvas = document.createElement('canvas')
  canvas.className = ['partiplex', className].filter(Boolean).join(' ')
  canvas.setAttribute('aria-hidden', 'true')
  Object.assign(canvas.style, {
    position: position ?? (target === document.body ? 'fixed' : 'absolute'),
    inset: '0',
    display: 'block',
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    zIndex: String(zIndex),
  })
  target.prepend(canvas)

  const normalizedConfig = effect
    ? {
        ...config,
        mode: 'fixed' as const,
        fixedEffect: effect,
        rotationEffects: [effect],
      }
    : config
  const controller = new PartiplexController(canvas, {
    ...controllerOptions,
    config: normalizedConfig,
  }).start()
  let destroyed = false

  const background: PartiplexBackground = {
    canvas,
    controller,
    setEffect(effectId) {
      controller.setEffect(effectId)
      return background
    },
    setPlayback(playback) {
      controller.setPlayback(playback)
      return background
    },
    setTheme(theme) {
      controller.setTheme(theme)
      return background
    },
    setIntensity(intensity) {
      controller.setIntensity(intensity)
      return background
    },
    setMaxFps(maxFps) {
      controller.setMaxFps(maxFps)
      return background
    },
    setInteractive(interactive) {
      controller.setInteractive(interactive)
      return background
    },
    pause() {
      controller.pause()
      return background
    },
    resume() {
      controller.resume()
      return background
    },
    getCurrentEffect: () => controller.getCurrentEffect(),
    getPlayback: () => controller.getPlayback(),
    isPaused: () => controller.isPaused(),
    getState: () => controller.getState(),
    destroy() {
      if (destroyed) return
      destroyed = true
      controller.destroy()
      canvas.remove()
    },
  }

  return background
}
