# API

Partiplex 提供三层能力：

1. `createPartiplexBackground`：自动创建 Canvas，普通项目优先使用。
2. `PartiplexBackground` / `usePartiplexBackground`：Vue、React 接入。
3. `PartiplexController`：已有 Canvas 时使用的底层 Controller。

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

| 选项 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `target` | `HTMLElement \| string` | `document.body` | Canvas 挂载目标 |
| `effect` | `BackgroundEffectId` | `constellation` | 以固定模式显示一个效果 |
| `config` | `Partial<PartiplexPlaybackConfig>` | 固定播放 | 完整播放配置 |
| `theme` | `dark \| light` | `dark` | 亮色或暗色配色 |
| `intensity` | `number` | `1.16` | 视觉强度，限制为 `0.5`–`1.9` |
| `interactive` | `boolean` | `true` | 是否响应指针位置 |
| `maxFps` | `number` | 不限制 | 最大渲染帧率 |
| `onEffectChange` | `(effectId) => void` | — | 效果发生变化时调用 |
| `position` | `fixed \| absolute` | 自动 | Canvas 定位方式 |
| `zIndex` | `number` | `0` | Canvas 层级 |
| `className` | `string` | — | 追加到 Canvas 的类名 |

### 返回值

返回的 `background` 已包含常用控制方法，不需要先理解 Controller。

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

| 成员 | 说明 |
| --- | --- |
| `canvas` | 自动创建的 `HTMLCanvasElement` |
| `controller` | 完整的 `PartiplexController` |
| `setEffect(id)` | 切换到指定效果，并进入固定模式 |
| `setPlayback(config)` | 更新固定播放或轮播配置 |
| `setTheme(theme)` | 切换亮色、暗色配色 |
| `setIntensity(value)` | 调整视觉强度 |
| `setMaxFps(value)` | 设置帧率上限；传 `undefined` 取消限制 |
| `setInteractive(value)` | 开启或关闭指针响应 |
| `pause()` / `resume()` | 暂停或继续动画 |
| `getCurrentEffect()` | 获取当前效果 ID |
| `getPlayback()` | 获取当前播放配置副本 |
| `getState()` | 获取当前完整状态快照 |
| `isPaused()` | 获取主动暂停状态 |
| `destroy()` | 移除监听、停止渲染并删除自动创建的 Canvas |

## 播放配置

### 固定效果

```ts
background.setPlayback({
  mode: 'fixed',
  fixedEffect: 'topographic',
})
```

`setEffect('topographic')` 是上面写法的快捷方式。

### 轮播效果

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

`intervalMs` 会限制在 `10_000`–`120_000ms`，效果切换使用约 `900ms` 交叉淡化。

## `PartiplexController`

已有 Canvas 时，不让 Partiplex 创建 DOM：

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

Controller 不会删除传入的 Canvas。调用方负责 Canvas 的创建和移除。

## 状态

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

## 效果目录

```ts
import {
  BACKGROUND_EFFECT_IDS,
  BACKGROUND_EFFECTS,
  isBackgroundEffectId,
} from 'partiplex'
```

- `BACKGROUND_EFFECT_IDS`：全部效果 ID。
- `BACKGROUND_EFFECTS`：效果名称和说明。
- `isBackgroundEffectId(value)`：校验外部字符串是否为合法效果 ID。

## 兼容别名

为避免已有代码失效，仍保留以下旧名称：

- `partiplex` → `createPartiplexBackground`
- `mountBackgroundEffects` → `createPartiplexBackground`
- `BackgroundEffectsSDK` → `PartiplexController`
- `show` → `setEffect`
- `configure` → `setPlayback`
- `useBackgroundEffects` → `usePartiplexBackground`

新项目建议使用左侧语义更明确的新名称。
