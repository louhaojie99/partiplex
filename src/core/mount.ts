import { PartiplexController } from './sdk'
import type {
  BackgroundEffectId,
  PartiplexPlaybackConfig,
  PartiplexControllerOptions,
  BackgroundTheme,
  PartiplexState,
} from './types'

export interface CreatePartiplexBackgroundOptions extends PartiplexControllerOptions {
  /** Canvas mount target. Defaults to document.body. */
  target?: HTMLElement | string
  /** Starts in fixed mode with this effect. */
  effect?: BackgroundEffectId
  /** Additional class name applied to the generated Canvas. */
  className?: string
  /** CSS position used by the generated Canvas. */
  position?: 'fixed' | 'absolute'
  /** CSS z-index used by the generated Canvas. */
  zIndex?: number
}

/** @deprecated Use CreatePartiplexBackgroundOptions. */
export type MountBackgroundEffectsOptions = CreatePartiplexBackgroundOptions

export interface PartiplexBackground {
  canvas: HTMLCanvasElement
  /** Full controller for advanced use. */
  controller: PartiplexController
  /** @deprecated Use controller. */
  sdk: PartiplexController
  setEffect: (effectId: BackgroundEffectId) => PartiplexBackground
  setPlayback: (config: Partial<PartiplexPlaybackConfig>) => PartiplexBackground
  setTheme: (theme: BackgroundTheme) => PartiplexBackground
  setIntensity: (intensity: number) => PartiplexBackground
  setMaxFps: (maxFps?: number) => PartiplexBackground
  setInteractive: (interactive: boolean) => PartiplexBackground
  pause: () => PartiplexBackground
  resume: () => PartiplexBackground
  getCurrentEffect: () => BackgroundEffectId
  getPlayback: () => PartiplexPlaybackConfig
  isPaused: () => boolean
  getState: () => PartiplexState
  destroy: () => void
}

/** @deprecated Use PartiplexBackground. */
export type MountedBackgroundEffects = PartiplexBackground

function resolveTarget(target: HTMLElement | string | undefined) {
  if (!target) return document.body
  if (typeof target !== 'string') return target
  const element = document.querySelector<HTMLElement>(target)
  if (!element) throw new Error(`Partiplex could not find mount target: ${target}`)
  return element
}

/** Creates, mounts, and starts a Partiplex background in one call. */
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
    sdk: controller,
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

/** @deprecated Use createPartiplexBackground(). */
export const mountBackgroundEffects = createPartiplexBackground

/** Short alias for createPartiplexBackground(). */
export const partiplex = createPartiplexBackground
