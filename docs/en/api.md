# API

Partiplex has three layers:

1. `createPartiplexBackground`: creates the Canvas for most projects.
2. `PartiplexBackground` / `usePartiplexBackground`: Vue and React integration.
3. `PartiplexController`: low-level control for an existing Canvas.

## `createPartiplexBackground(options)`

```ts
import { createPartiplexBackground } from 'partiplex'

const background = createPartiplexBackground({
  target: document.body,
  effect: 'galaxy-vortex',
  theme: 'dark',
  intensity: 1.4,
  maxFps: 60,
  interactive: true,
})
```

### Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `target` | `HTMLElement \| string` | `document.body` | Canvas mount target |
| `effect` | `BackgroundEffectId` | `constellation` | Show one effect in fixed mode |
| `config` | `Partial<PartiplexPlaybackConfig>` | fixed playback | Complete playback config |
| `theme` | `dark \| light` | `dark` | Dark or light palette |
| `intensity` | `number` | `1.16` | Visual intensity, clamped to `0.5`–`1.9` |
| `interactive` | `boolean` | `true` | Track pointer position |
| `maxFps` | `number` | unlimited | Maximum render frame rate |
| `onEffectChange` | `(effectId) => void` | — | Runs after the active effect changes |
| `position` | `fixed \| absolute` | automatic | Canvas positioning |
| `zIndex` | `number` | `0` | Canvas layer |
| `className` | `string` | — | Additional Canvas class name |

### Return value

The returned `background` exposes common controls directly, so beginners do not need the Controller first.

```ts
background.setEffect('portal-rings')
background.setTheme('light')
background.setIntensity(1.6)
background.setMaxFps(30)
background.setInteractive(false)
background.pause()
background.resume()

console.log(background.getCurrentEffect())
console.log(background.getPlayback())
console.log(background.getState())

background.destroy()
```

| Member | Description |
| --- | --- |
| `canvas` | Created `HTMLCanvasElement` |
| `controller` | Full `PartiplexController` |
| `setEffect(id)` | Switch effect and enter fixed mode |
| `setPlayback(config)` | Update fixed or rotating playback |
| `setTheme(theme)` | Switch dark or light palette |
| `setIntensity(value)` | Change visual intensity |
| `setMaxFps(value)` | Set a frame limit; pass `undefined` to remove it |
| `setInteractive(value)` | Enable or disable pointer response |
| `pause()` / `resume()` | Pause or continue animation |
| `getCurrentEffect()` | Read the active effect ID |
| `getPlayback()` | Read a copy of the playback config |
| `getState()` | Read a complete state snapshot |
| `isPaused()` | Read the manual pause state |
| `destroy()` | Remove listeners, stop rendering, and remove the created Canvas |

## Playback

### Fixed effect

```ts
background.setPlayback({
  mode: 'fixed',
  fixedEffect: 'topographic',
})
```

`setEffect('topographic')` is the shortcut.

### Rotation

```ts
background.setPlayback({
  mode: 'rotate',
  rotationEffects: [
    'galaxy-vortex',
    'portal-rings',
    'ribbon-wave',
  ],
  intervalMs: 12000,
})
```

```ts
interface PartiplexPlaybackConfig {
  mode: 'fixed' | 'rotate'
  fixedEffect: BackgroundEffectId
  rotationEffects: BackgroundEffectId[]
  intervalMs: number
}
```

`intervalMs` is clamped to `10_000`–`120_000ms`. Effect changes use an approximately `900ms` crossfade.

## `PartiplexController`

Use an existing Canvas without DOM creation:

```ts
import { PartiplexController } from 'partiplex'

const canvas = document.querySelector<HTMLCanvasElement>('#background')!
const controller = new PartiplexController(canvas, {
  effect: 'galaxy-vortex',
  theme: 'dark',
}).start()

controller.setEffect('portal-rings')
controller.setPlayback({ mode: 'rotate' })
controller.setIntensity(1.4)
controller.setMaxFps(30)
controller.setInteractive(true)
controller.pause()
controller.resume()
controller.destroy()
```

The Controller does not remove the provided Canvas. Its owner remains responsible for the element.

## State

```ts
interface PartiplexState {
  currentEffect: BackgroundEffectId
  theme: 'dark' | 'light'
  playback: PartiplexPlaybackConfig
  paused: boolean
  interactive: boolean
  intensity: number
  maxFps?: number
}
```

```ts
const state = background.getState()
```

## Effect catalog

```ts
import {
  BACKGROUND_EFFECT_IDS,
  BACKGROUND_EFFECTS,
  isBackgroundEffectId,
} from 'partiplex'
```

- `BACKGROUND_EFFECT_IDS`: all effect IDs.
- `BACKGROUND_EFFECTS`: effect names and descriptions.
- `isBackgroundEffectId(value)`: validate an external string.
