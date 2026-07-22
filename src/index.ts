export {
  BACKGROUND_EFFECT_IDS,
  BACKGROUND_EFFECTS,
  DEFAULT_PARTIPLEX_PLAYBACK,
  getEffectPalette,
  isBackgroundEffectId,
  normalizePartiplexPlaybackConfig,
  rgba,
} from './core/catalog'
export type {
  CreatePartiplexBackgroundOptions,
  PartiplexBackground,
} from './core/mount'
export { createPartiplexBackground } from './core/mount'
export { PartiplexController } from './core/sdk'
export type {
  BackgroundEffectDefinition,
  BackgroundEffectId,
  BackgroundPlaybackMode,
  BackgroundTheme,
  EffectFrame,
  EffectPalette,
  EffectRenderer,
  PartiplexControllerOptions,
  PartiplexPlaybackConfig,
  PartiplexState,
} from './core/types'
