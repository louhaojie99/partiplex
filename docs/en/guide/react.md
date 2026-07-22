# React

## Component

`PartiplexBackground` manages the Canvas and Controller lifecycle.

```tsx
import { PartiplexBackground } from 'partiplex/react'

export function Background() {
  return (
    <PartiplexBackground
      effect="galaxy-vortex"
      theme="dark"
      intensity={1.4}
      onEffectChange={(effectId) => console.log(effectId)}
    />
  )
}
```

| Prop | Type | Default | Description |
| --- | --- | --- | --- |
| `effect` | `BackgroundEffectId` | `constellation` | Current fixed effect |
| `config` | `Partial<PartiplexPlaybackConfig>` | fixed playback | Fixed or rotating playback |
| `theme` | `dark \| light` | `dark` | Canvas palette |
| `intensity` | `number` | `1.16` | Visual intensity, clamped to `0.5`–`1.9` |
| `interactive` | `boolean` | `true` | Track the pointer |
| `maxFps` | `number` | unlimited | Maximum frame rate |
| `paused` | `boolean` | `false` | Pause rendering |
| `fullscreen` | `boolean` | `true` | Fill the viewport |

Control it with a `ref`:

```tsx
import { useRef } from 'react'
import {
  PartiplexBackground,
  type PartiplexBackgroundHandle,
} from 'partiplex/react'

export function Hero() {
  const backgroundRef = useRef<PartiplexBackgroundHandle>(null)

  return (
    <>
      <PartiplexBackground ref={backgroundRef} effect="galaxy-vortex" />
      <button onClick={() => backgroundRef.current?.setEffect('portal-rings')}>
        Set effect
      </button>
      <button onClick={() => backgroundRef.current?.pause()}>Pause</button>
    </>
  )
}
```

## Hook

Use `usePartiplexBackground` for an existing Canvas or when controls belong to your UI.

```tsx
import { useRef } from 'react'
import { usePartiplexBackground } from 'partiplex/react'

export function CanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { setEffect, setPlayback, pause, resume } = usePartiplexBackground(canvasRef, {
    effect: 'galaxy-vortex',
    theme: 'dark',
  })

  return (
    <>
      <canvas ref={canvasRef} />
      <button onClick={() => setEffect('topographic')}>Set effect</button>
      <button
        onClick={() =>
          setPlayback({
            mode: 'rotate',
            rotationEffects: ['galaxy-vortex', 'ribbon-wave', 'portal-rings'],
            intervalMs: 12000,
          })
        }
      >
        Start rotation
      </button>
      <button onClick={pause}>Pause</button>
      <button onClick={resume}>Resume</button>
    </>
  )
}
```

The Hook destroys its Controller when the component unmounts.
