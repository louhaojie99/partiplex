import { type RefObject, useCallback, useEffect, useRef } from 'react'
import { PartiplexController } from '../core/sdk'
import type { BackgroundEffectId, BackgroundTheme, PartiplexPlaybackConfig } from '../core/types'

/** React Hook 和组件共用的背景选项。 */
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

/** React Hook 返回的背景控制方法。 */
export interface PartiplexBackgroundControls {
  /** 当前控制器引用，在组件挂载完成前为 null。 */
  controllerRef: RefObject<PartiplexController | null>
  /** 切换到指定效果并关闭轮播。 */
  setEffect: (effectId: BackgroundEffectId) => void
  /** 更新固定或轮播播放配置。 */
  setPlayback: (config: Partial<PartiplexPlaybackConfig>) => void
  /** 更新背景明暗主题。 */
  setTheme: (theme: BackgroundTheme) => void
  /** 更新背景效果强度。 */
  setIntensity: (intensity: number) => void
  /** 更新最大渲染帧率。 */
  setMaxFps: (maxFps?: number) => void
  /** 开启或关闭指针交互。 */
  setInteractive: (interactive: boolean) => void
  /** 暂停动画并保留当前画面。 */
  pause: () => void
  /** 恢复已暂停的动画。 */
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
      onEffectChange: (effectId) => onEffectChangeRef.current?.(effectId),
    }).start()
    controllerRef.current = controller

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
