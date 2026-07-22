# Partiplex

[English](./README.md)

[![npm 版本](https://img.shields.io/npm/v/partiplex.svg)](https://www.npmjs.com/package/partiplex)
[![npm 月下载量](https://img.shields.io/npm/dm/partiplex.svg)](https://www.npmjs.com/package/partiplex)

面向 TypeScript、Vue 与 React 的 20 个电影感 Canvas 背景。

[文档](https://louhaojie99.github.io/partiplex/) · [全部效果](https://louhaojie99.github.io/partiplex/effects/)

## 安装

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

已有 Canvas 时使用 `usePartiplexBackground`；需要与框架无关的底层控制时使用 `PartiplexController`。

## 开发

```bash
pnpm install
pnpm check
pnpm docs:dev
```

部署文档：

```bash
pnpm docs:deploy
```

## 许可证

[MIT](./LICENSE)
