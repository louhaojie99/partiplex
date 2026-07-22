export type BackgroundEffectId =
  | 'constellation'
  | 'galaxy-vortex'
  | 'data-rain'
  | 'radar'
  | 'flow-field'
  | 'orbit-lines'
  | 'hex-grid'
  | 'wave-ripples'
  | 'meteor-shower'
  | 'topographic'
  | 'circuit-pulse'
  | 'perspective-grid'
  | 'spectrum-bars'
  | 'lissajous'
  | 'portal-rings'
  | 'crystal-cells'
  | 'scanline'
  | 'ribbon-wave'
  | 'clockwork'
  | 'moire'

export type BackgroundPlaybackMode = 'fixed' | 'rotate'
export type BackgroundTheme = 'dark' | 'light'

export interface BackgroundEffectDefinition {
  id: BackgroundEffectId
  name: string
  description: string
}

export interface PartiplexPlaybackConfig {
  mode: BackgroundPlaybackMode
  fixedEffect: BackgroundEffectId
  rotationEffects: BackgroundEffectId[]
  intervalMs: number
}

export interface PartiplexControllerOptions {
  /** Shortcut for fixed playback with one effect. */
  effect?: BackgroundEffectId
  config?: Partial<PartiplexPlaybackConfig>
  theme?: BackgroundTheme
  onEffectChange?: (effectId: BackgroundEffectId) => void
  interactive?: boolean
  intensity?: number
  maxFps?: number
}

/** @deprecated Use PartiplexPlaybackConfig. */
export type BackgroundEffectsConfig = PartiplexPlaybackConfig

/** @deprecated Use PartiplexControllerOptions. */
export type BackgroundEffectsSdkOptions = PartiplexControllerOptions

export interface PartiplexState {
  currentEffect: BackgroundEffectId
  theme: BackgroundTheme
  playback: PartiplexPlaybackConfig
  paused: boolean
  interactive: boolean
  intensity: number
  maxFps?: number
}

export interface EffectPalette {
  primary: [number, number, number]
  secondary: [number, number, number]
  strongOpacity: number
  softOpacity: number
  faintOpacity: number
}

export interface EffectFrame {
  width: number
  height: number
  palette: EffectPalette
  pointer: {
    x: number
    y: number
    active: boolean
  }
  reducedMotion: boolean
}

export interface EffectRenderer {
  reset: (frame: EffectFrame) => void
  update: (deltaSeconds: number, frame: EffectFrame) => void
  draw: (context: CanvasRenderingContext2D, frame: EffectFrame) => void
}
