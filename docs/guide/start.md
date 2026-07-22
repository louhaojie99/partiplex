# 快速开始

## 安装

```bash
pnpm add partiplex
```

## 创建背景

```ts
import { createPartiplexBackground } from 'partiplex'

const background = createPartiplexBackground({
  effect: 'galaxy-vortex',
})
```

默认会创建一个全屏 Canvas，并自动处理尺寸变化、页面隐藏、减少动效和销毁。

```ts
background.setEffect('portal-rings')
background.setTheme('light')
background.pause()
background.resume()
background.destroy()
```

## 挂载到局部区域

```ts
const background = createPartiplexBackground({
  target: '#hero',
  position: 'absolute',
  effect: 'ribbon-wave',
})
```

目标容器需设置 `position: relative`，并拥有明确高度。

## 按项目选择

- [Vue 组件与 Composable](/guide/vue)
- [React 组件与 Hook](/guide/react)
- [浏览 20 个效果](/effects/)
- [完整 API](/api)
