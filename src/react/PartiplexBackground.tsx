import { type CanvasHTMLAttributes, forwardRef, useImperativeHandle, useRef } from 'react'
import type { PartiplexController } from '../core/sdk'
import type { BackgroundEffectId, BackgroundTheme, PartiplexPlaybackConfig } from '../core/types'
import { type PartiplexBackgroundOptions, usePartiplexBackground } from './usePartiplexBackground'

export type PartiplexBackgroundProps = PartiplexBackgroundOptions &
  Omit<CanvasHTMLAttributes<HTMLCanvasElement>, 'onChange'> & {
    /** 是否让 Canvas 固定铺满视口。 */
    fullscreen?: boolean
  }

/** React 组件通过 ref 暴露的控制接口。 */
export interface PartiplexBackgroundHandle {
  /** 组件渲染的 Canvas 元素。 */
  canvas: HTMLCanvasElement | null
  /** 当前 Partiplex 控制器。 */
  controller: PartiplexController | null
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

export const PartiplexBackground = forwardRef<PartiplexBackgroundHandle, PartiplexBackgroundProps>(
  function PartiplexBackground(
    {
      config,
      effect,
      theme = 'dark',
      interactive = true,
      intensity = 1.16,
      maxFps,
      paused = false,
      onEffectChange,
      fullscreen = true,
      style,
      ...canvasProps
    },
    forwardedRef,
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const controls = usePartiplexBackground(canvasRef, {
      config,
      effect,
      theme,
      interactive,
      intensity,
      maxFps,
      paused,
      onEffectChange,
    })

    useImperativeHandle(forwardedRef, () => ({
      get canvas() {
        return canvasRef.current
      },
      get controller() {
        return controls.controllerRef.current
      },
      setEffect: controls.setEffect,
      setPlayback: controls.setPlayback,
      setTheme: controls.setTheme,
      setIntensity: controls.setIntensity,
      setMaxFps: controls.setMaxFps,
      setInteractive: controls.setInteractive,
      pause: controls.pause,
      resume: controls.resume,
    }))

    return (
      <canvas
        {...canvasProps}
        ref={canvasRef}
        aria-hidden={canvasProps['aria-label'] ? undefined : true}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          ...(fullscreen ? { position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 } : {}),
          ...style,
        }}
      />
    )
  },
)

/** PartiplexBackground 组件的简短别名。 */
export const Partiplex = PartiplexBackground
