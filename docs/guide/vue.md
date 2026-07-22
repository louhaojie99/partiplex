# Vue

## 组件

`PartiplexBackground` 直接负责 Canvas 的创建与销毁，适合绝大多数页面。

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

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `effect` | `BackgroundEffectId` | `constellation` | 当前固定效果 |
| `config` | `Partial<PartiplexPlaybackConfig>` | 固定播放 | 固定或轮播配置 |
| `theme` | `dark \| light` | `dark` | Canvas 配色 |
| `intensity` | `number` | `1.16` | 视觉强度，限制为 `0.5`–`1.9` |
| `interactive` | `boolean` | `true` | 是否响应指针 |
| `maxFps` | `number` | 不限制 | 最大帧率 |
| `paused` | `boolean` | `false` | 是否暂停 |
| `fullscreen` | `boolean` | `true` | 是否固定铺满视口 |

轮播：

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

已有 Canvas，或需要在业务事件里主动控制时，使用名称明确的 `usePartiplexBackground`。

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
  <button @click="setEffect('topographic')">切换效果</button>
  <button @click="startRotation">开始轮播</button>
  <button @click="setTheme('light')">亮色</button>
  <button @click="pause">暂停</button>
  <button @click="resume">继续</button>
</template>
```

Composable 会在组件卸载时自动销毁 Controller。
