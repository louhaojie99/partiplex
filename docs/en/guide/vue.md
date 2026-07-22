# Vue

## Component

`PartiplexBackground` owns the Canvas lifecycle and fits most pages.

```vue
<script setup lang="ts">
import { PartiplexBackground } from 'partiplex/vue'
</script>

<template>
  <PartiplexBackground
    effect="galaxy-vortex"
    theme="dark"
    :intensity="1.4"
    @effect-change="(effectId) => console.log(effectId)"
  />
</template>
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

Rotation:

```vue
<PartiplexBackground
  :config="{
    mode: 'rotate',
    rotationEffects: ['galaxy-vortex', 'portal-rings', 'topographic'],
    intervalMs: 12000,
  }"
/>
```

## Composable

Use the explicit `usePartiplexBackground` name for an existing Canvas or event-driven control.

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { usePartiplexBackground } from 'partiplex/vue'

const canvas = ref<HTMLCanvasElement | null>(null)
const { setEffect, setPlayback, setTheme, pause, resume } = usePartiplexBackground(canvas, {
  effect: 'galaxy-vortex',
  theme: 'dark',
})

function startRotation() {
  setPlayback({
    mode: 'rotate',
    rotationEffects: ['galaxy-vortex', 'ribbon-wave', 'portal-rings'],
    intervalMs: 12000,
  })
}
</script>

<template>
  <canvas ref="canvas" />
  <button @click="setEffect('topographic')">Set effect</button>
  <button @click="startRotation">Start rotation</button>
  <button @click="setTheme('light')">Light</button>
  <button @click="pause">Pause</button>
  <button @click="resume">Resume</button>
</template>
```

The composable destroys its Controller when the component unmounts.
