# Partiplex

[简体中文](./README.zh-CN.md)

[![npm version](https://img.shields.io/npm/v/partiplex.svg)](https://www.npmjs.com/package/partiplex)
[![npm downloads](https://img.shields.io/npm/dm/partiplex.svg)](https://www.npmjs.com/package/partiplex)

20 cinematic Canvas backgrounds for TypeScript, Vue, and React.

[Docs](https://louhaojie99.github.io/partiplex/) · [Effects](https://louhaojie99.github.io/partiplex/en/effects/)

## Install

```bash
pnpm add partiplex
```

## TypeScript

```ts
import { createPartiplexBackground } from 'partiplex'

const background = createPartiplexBackground({ effect: 'galaxy-vortex' })

background.setEffect('portal-rings')
background.pause()
background.resume()
background.destroy()
```

## Vue

```vue
<script setup lang="ts">
import { PartiplexBackground } from 'partiplex/vue'
</script>

<template>
  <PartiplexBackground effect="galaxy-vortex" />
</template>
```

## React

```tsx
import { PartiplexBackground } from 'partiplex/react'

export function Background() {
  return <PartiplexBackground effect="galaxy-vortex" />
}
```

Use `usePartiplexBackground` when you already own the Canvas. Use `PartiplexController` for framework-agnostic low-level control.

## Develop

```bash
pnpm install
pnpm check
pnpm docs:dev
```

Deploy docs:

```bash
pnpm docs:deploy
```

## License

[MIT](./LICENSE)
