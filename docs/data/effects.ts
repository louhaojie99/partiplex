import { BACKGROUND_EFFECTS, type BackgroundEffectId } from '../../src/index'

export type DocsLocale = 'zh' | 'en'

export interface EffectDoc {
  id: BackgroundEffectId
  zh: {
    name: string
    description: string
  }
  en: {
    name: string
    description: string
  }
}

const englishEffects: Record<BackgroundEffectId, EffectDoc['en']> = {
  constellation: {
    name: 'Stellar Topology',
    description: 'Pulsing hubs and links form an interstellar network.',
  },
  'galaxy-vortex': {
    name: 'Spiral Galaxy',
    description: 'A vast stellar core and rotating dust bands create deep-space scale.',
  },
  'data-rain': {
    name: 'Neural Data Rain',
    description: 'Diagnostic lanes stream through a futuristic compute chamber.',
  },
  radar: {
    name: 'Deep-space Radar',
    description: 'Sector sweeps and target locks scan the full viewport.',
  },
  'flow-field': {
    name: 'Warp Corridor',
    description: 'Curved trajectories converge on a remote spatial waypoint.',
  },
  'orbit-lines': {
    name: 'Orbital Rings',
    description: 'Layered ellipses and satellites move like a precision instrument.',
  },
  'hex-grid': {
    name: 'Hex Matrix',
    description: 'Perspective honeycomb sectors breathe across a control surface.',
  },
  'wave-ripples': {
    name: 'Wave Interference',
    description: 'Multiple signal sources expand into a spatial wave field.',
  },
  'meteor-shower': {
    name: 'Meteor Array',
    description: 'Long luminous trails sweep across layered distances.',
  },
  topographic: {
    name: 'Holographic Terrain',
    description: 'A three-dimensional survey grid rises along the horizon.',
  },
  'circuit-pulse': {
    name: 'Circuit Pulse',
    description: 'Orthogonal chip paths illuminate in precise energy runs.',
  },
  'perspective-grid': {
    name: 'Perspective Horizon',
    description: 'A spatial grid advances toward a distant vanishing point.',
  },
  'spectrum-bars': {
    name: 'Spectrum Matrix',
    description: 'A full-width signal analyzer responds in rhythmic bands.',
  },
  lissajous: {
    name: 'Oscilloscope Paths',
    description: 'Layered Lissajous curves trace a scientific display.',
  },
  'portal-rings': {
    name: 'Orbital Portal',
    description: 'Counter-rotating segmented rings open a spatial passage.',
  },
  'crystal-cells': {
    name: 'Crystal Slices',
    description: 'Irregular polygon cells reveal a faceted structure.',
  },
  scanline: {
    name: 'Quantum Raster',
    description: 'Diagnostic zones and scanning energy synchronize across the screen.',
  },
  'ribbon-wave': {
    name: 'Event Horizon',
    description: 'A dark core and warped accretion disk bend the scene.',
  },
  clockwork: {
    name: 'Temporal Core',
    description: 'A monumental timing ring synchronizes connected sub-cores.',
  },
  moire: {
    name: 'Hyperdimensional Cubes',
    description: 'Rotating wireframe volumes form a layered spatial array.',
  },
}

export const effectDocs: readonly EffectDoc[] = BACKGROUND_EFFECTS.map((effect) => ({
  id: effect.id,
  zh: {
    name: effect.name,
    description: effect.description,
  },
  en: englishEffects[effect.id],
}))

export function getEffectDoc(effectId: BackgroundEffectId) {
  return effectDocs.find((effect) => effect.id === effectId) ?? effectDocs[0]
}
