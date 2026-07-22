# Quick start

## Install

```bash
pnpm add partiplex
```

## Create a background

```ts
import { createPartiplexBackground } from 'partiplex'

const background = createPartiplexBackground({
  effect: 'galaxy-vortex',
})
```

It creates a full-screen Canvas and handles resizing, page visibility, reduced motion, and cleanup.

```ts
background.setEffect('portal-rings')
background.setTheme('light')
background.pause()
background.resume()
background.destroy()
```

## Mount inside a section

```ts
const background = createPartiplexBackground({
  target: '#hero',
  position: 'absolute',
  effect: 'ribbon-wave',
})
```

Give the target `position: relative` and an explicit height.

## Choose your path

- [Vue component and composable](/en/guide/vue)
- [React component and Hook](/en/guide/react)
- [Browse 20 effects](/en/effects/)
- [Complete API](/en/api)
