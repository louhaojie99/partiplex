import { useCallback, useEffect, useRef, type RefObject } from 'react'
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
export type ReactBackgroundEffectsOptions = PartiplexBackgroundOptions

export interface PartiplexBackgroundControls {
  controllerRef: RefObject<PartiplexController | null>
  setEffect: (effectId: BackgroundEffectId) => void
  setPlayback: (config: Partial<PartiplexPlaybackConfig>) => void
  setTheme: (theme: BackgroundTheme) => void
  setIntensity: (intensity: number) => void
  setMaxFps: (maxFps?: number) => void
  setInteractive: (interactive: boolean) => void
  pause: () => void
  resume: () => void
}

export function usePartiplexBackground(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: PartiplexBackgroundOptions = {},
): PartiplexBackgroundControls {
  const controllerRef = useRef<PartiplexController | null>(null)
  const onEffectChangeRef = useRef(options.onEffectChange)
  onEffectChangeRef.current = options.onEffectChange

  useEffect(() => {
    if (!canvasRef.current) return
    const controller = new PartiplexController(canvasRef.current, {
      config: options.config,
      effect: options.effect,
      theme: options.theme,
      interactive: options.interactive,
      intensity: options.intensity,
      maxFps: options.maxFps,
      onEffectChange: (effectId) => onEffectChangeRef.current?.(effectId),
    }).start()
    controllerRef.current = controller
    if (options.effect) controller.setEffect(options.effect)
    if (options.paused) controller.pause()

    return () => {
      controller.destroy()
      controllerRef.current = null
    }
  }, [canvasRef])

  useEffect(() => {
    if (options.config) controllerRef.current?.setPlayback(options.config)
  }, [options.config])

  useEffect(() => {
    if (options.effect) controllerRef.current?.setEffect(options.effect)
  }, [options.effect])

  useEffect(() => {
    if (options.theme) controllerRef.current?.setTheme(options.theme)
  }, [options.theme])

  useEffect(() => {
    controllerRef.current?.setIntensity(options.intensity ?? 1.16)
  }, [options.intensity])

  useEffect(() => {
    controllerRef.current?.setMaxFps(options.maxFps)
  }, [options.maxFps])

  useEffect(() => {
    controllerRef.current?.setInteractive(options.interactive ?? true)
  }, [options.interactive])

  useEffect(() => {
    controllerRef.current?.setPaused(options.paused ?? false)
  }, [options.paused])

  const setEffect = useCallback((effectId: BackgroundEffectId) => {
    controllerRef.current?.setEffect(effectId)
  }, [])
  const setPlayback = useCallback((config: Partial<PartiplexPlaybackConfig>) => {
    controllerRef.current?.setPlayback(config)
  }, [])
  const setTheme = useCallback((theme: BackgroundTheme) => {
    controllerRef.current?.setTheme(theme)
  }, [])
  const setIntensity = useCallback((intensity: number) => {
    controllerRef.current?.setIntensity(intensity)
  }, [])
  const setMaxFps = useCallback((maxFps?: number) => {
    controllerRef.current?.setMaxFps(maxFps)
  }, [])
  const setInteractive = useCallback((interactive: boolean) => {
    controllerRef.current?.setInteractive(interactive)
  }, [])
  const pause = useCallback(() => controllerRef.current?.pause(), [])
  const resume = useCallback(() => controllerRef.current?.resume(), [])

  return {
    controllerRef,
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
export function useBackgroundEffects(
  canvasRef: RefObject<HTMLCanvasElement | null>,
  options: ReactBackgroundEffectsOptions = {},
) {
  return usePartiplexBackground(canvasRef, options).controllerRef
}
