export {
  BACKGROUND_EFFECT_IDS,
  BACKGROUND_EFFECTS,
  DEFAULT_BACKGROUND_EFFECTS_CONFIG,
  DEFAULT_PARTIPLEX_PLAYBACK,
  getEffectPalette,
  isBackgroundEffectId,
  normalizeBackgroundEffectsConfig,
  normalizePartiplexPlaybackConfig,
  rgba,
} from './core/catalog'
export {
  createPartiplexBackground,
  mountBackgroundEffects,
  partiplex,
} from './core/mount'
export type {
  CreatePartiplexBackgroundOptions,
  MountBackgroundEffectsOptions,
  MountedBackgroundEffects,
  PartiplexBackground,
} from './core/mount'
export { PartiplexController, PartiplexController as BackgroundEffectsSDK } from './core/sdk'
export type {
  BackgroundEffectDefinition,
  BackgroundEffectId,
  BackgroundEffectsConfig,
  BackgroundEffectsSdkOptions,
  PartiplexControllerOptions,
  BackgroundPlaybackMode,
  BackgroundTheme,
  EffectFrame,
  EffectPalette,
  EffectRenderer,
  PartiplexPlaybackConfig,
  PartiplexState,
} from './core/types'
