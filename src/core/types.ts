/** Partiplex 内置背景效果的唯一标识。 */
export type BackgroundEffectId =
  | 'constellation'
  | 'galaxy-vortex'
  | 'data-rain'
  | 'radar'
  | 'flow-field'
  | 'orbit-lines'
  | 'hex-grid'
  | 'wave-ripples'
  | 'meteor-shower'
  | 'topographic'
  | 'circuit-pulse'
  | 'perspective-grid'
  | 'spectrum-bars'
  | 'lissajous'
  | 'portal-rings'
  | 'crystal-cells'
  | 'scanline'
  | 'ribbon-wave'
  | 'clockwork'
  | 'moire'

/** 背景效果的播放模式：固定展示或定时轮播。 */
export type BackgroundPlaybackMode = 'fixed' | 'rotate'
/** 背景效果的明暗主题。 */
export type BackgroundTheme = 'dark' | 'light'

/** 单个背景效果的元数据。 */
export interface BackgroundEffectDefinition {
  /** 效果唯一标识。 */
  id: BackgroundEffectId
  /** 对外展示的效果名称。 */
  name: string
  /** 对外展示的效果说明。 */
  description: string
}

/** 背景效果的播放配置。 */
export interface PartiplexPlaybackConfig {
  /** 当前播放模式。 */
  mode: BackgroundPlaybackMode
  /** 固定模式下展示的效果。 */
  fixedEffect: BackgroundEffectId
  /** 轮播模式下按顺序展示的效果列表。 */
  rotationEffects: BackgroundEffectId[]
  /** 每个轮播效果的停留时间，单位为毫秒。 */
  intervalMs: number
}

/** Partiplex 控制器的初始化选项。 */
export interface PartiplexControllerOptions {
  /** 固定展示单个效果的快捷配置。 */
  effect?: BackgroundEffectId
  /** 覆盖默认播放行为的配置。 */
  config?: Partial<PartiplexPlaybackConfig>
  /** 初始明暗主题。 */
  theme?: BackgroundTheme
  /** 效果切换完成时触发的回调。 */
  onEffectChange?: (effectId: BackgroundEffectId) => void
  /** 是否启用指针交互，默认为启用。 */
  interactive?: boolean
  /** 效果强度，控制调色板透明度。 */
  intensity?: number
  /** 最大渲染帧率；未设置时跟随浏览器刷新率。 */
  maxFps?: number
}

/** 控制器当前状态的只读快照。 */
export interface PartiplexState {
  /** 当前正在展示的效果。 */
  currentEffect: BackgroundEffectId
  /** 当前明暗主题。 */
  theme: BackgroundTheme
  /** 当前播放配置的副本。 */
  playback: PartiplexPlaybackConfig
  /** 是否已被调用方手动暂停。 */
  paused: boolean
  /** 是否启用了指针交互。 */
  interactive: boolean
  /** 当前效果强度。 */
  intensity: number
  /** 当前最大渲染帧率。 */
  maxFps?: number
}

/** 渲染器使用的颜色和透明度。 */
export interface EffectPalette {
  /** 主色的 RGB 三元组。 */
  primary: [number, number, number]
  /** 辅色的 RGB 三元组。 */
  secondary: [number, number, number]
  /** 强调元素的透明度。 */
  strongOpacity: number
  /** 次要元素的透明度。 */
  softOpacity: number
  /** 背景元素的透明度。 */
  faintOpacity: number
}

/** 每一帧传递给效果渲染器的环境数据。 */
export interface EffectFrame {
  /** Canvas 的 CSS 像素宽度。 */
  width: number
  /** Canvas 的 CSS 像素高度。 */
  height: number
  /** 已按主题和强度计算的调色板。 */
  palette: EffectPalette
  /** 归一化后的指针位置及激活状态。 */
  pointer: {
    /** 指针在水平方向上的比例位置。 */
    x: number
    /** 指针在垂直方向上的比例位置。 */
    y: number
    /** 指针当前是否位于页面交互区域内。 */
    active: boolean
  }
  /** 用户是否启用了减少动态效果的系统偏好。 */
  reducedMotion: boolean
}

/** 所有背景效果渲染器必须实现的生命周期接口。 */
export interface EffectRenderer {
  /** 在尺寸、主题或强度变化后重建内部状态。 */
  reset: (frame: EffectFrame) => void
  /** 根据两帧间隔更新动画状态。 */
  update: (deltaSeconds: number, frame: EffectFrame) => void
  /** 将当前动画状态绘制到 Canvas 2D 上下文。 */
  draw: (context: CanvasRenderingContext2D, frame: EffectFrame) => void
}
