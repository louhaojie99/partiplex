# React

## 组件

`PartiplexBackground` 自动管理 Canvas 和 Controller 生命周期。

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

使用 `ref` 主动控制：

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
        切换效果
      </button>
      <button onClick={() => backgroundRef.current?.pause()}>暂停</button>
    </>
  )
}
```

## Hook

已有 Canvas，或需要把控制能力交给业务组件时，使用 `usePartiplexBackground`。

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
      <button onClick={() => setEffect('topographic')}>切换效果</button>
      <button
        onClick={() =>
          setPlayback({
            mode: 'rotate',
            rotationEffects: ['galaxy-vortex', 'ribbon-wave', 'portal-rings'],
            intervalMs: 12000,
          })
        }
      >
        开始轮播
      </button>
      <button onClick={pause}>暂停</button>
      <button onClick={resume}>继续</button>
    </>
  )
}
```

Hook 会在组件卸载时自动销毁 Controller。
