import { forwardRef, useImperativeHandle, useRef, type CanvasHTMLAttributes } from 'react'
import type { PartiplexController } from '../core/sdk'
import type { BackgroundEffectId, PartiplexPlaybackConfig, BackgroundTheme } from '../core/types'
import { usePartiplexBackground, type PartiplexBackgroundOptions } from './usePartiplexBackground'

export type PartiplexBackgroundProps = PartiplexBackgroundOptions &
  Omit<CanvasHTMLAttributes<HTMLCanvasElement>, 'onChange'> & {
    fullscreen?: boolean
  }

/** @deprecated Use PartiplexBackgroundProps. */
export type BackgroundEffectsCanvasProps = PartiplexBackgroundProps

export interface PartiplexBackgroundHandle {
  canvas: HTMLCanvasElement | null
  controller: PartiplexController | null
  /** @deprecated Use controller. */
  sdk: PartiplexController | null
  setEffect: (effectId: BackgroundEffectId) => void
  setPlayback: (config: Partial<PartiplexPlaybackConfig>) => void
  setTheme: (theme: BackgroundTheme) => void
  setIntensity: (intensity: number) => void
  setMaxFps: (maxFps?: number) => void
  setInteractive: (interactive: boolean) => void
  pause: () => void
  resume: () => void
}

/** @deprecated Use PartiplexBackgroundHandle. */
export type BackgroundEffectsCanvasHandle = PartiplexBackgroundHandle

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
      get sdk() {
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

/** Short component alias. */
export const Partiplex = PartiplexBackground
/** @deprecated Use PartiplexBackground. */
export const BackgroundEffectsCanvas = PartiplexBackground
