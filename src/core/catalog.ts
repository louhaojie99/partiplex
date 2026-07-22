import type {
  BackgroundEffectDefinition,
  BackgroundEffectId,
  BackgroundTheme,
  EffectPalette,
  PartiplexPlaybackConfig,
} from './types'

/** Partiplex 内置效果的完整元数据目录。 */
export const BACKGROUND_EFFECTS: readonly BackgroundEffectDefinition[] = [
  {
    id: 'constellation',
    name: '星链拓扑',
    description: '星点、拓扑连线与脉冲枢纽覆盖全屏，形成未来星际通信网络。',
  },
  {
    id: 'galaxy-vortex',
    name: '银河旋臂',
    description: '巨型旋涡星系横贯全屏，旋臂、星核与尘埃带形成深空纵深。',
  },
  {
    id: 'data-rain',
    name: '神经数据雨',
    description: '分区数据列、状态标签与诊断信号持续下落，像神经计算舱的数据洪流。',
  },
  {
    id: 'radar',
    name: '深空雷达',
    description: '巨型扇区扫描、目标锁定框与全屏刻度组成深空舰桥监测界面。',
  },
  {
    id: 'flow-field',
    name: '曲速航道',
    description: '弧形光轨从屏幕边缘汇入远端航点，营造高速穿越的空间纵深。',
  },
  {
    id: 'orbit-lines',
    name: '轨道星环',
    description: '多层椭圆轨道与卫星节点缓慢运行，形成精密仪器感。',
  },
  {
    id: 'hex-grid',
    name: '蜂巢矩阵',
    description: '透视六边网格分区呼吸，呈现克制的未来控制台氛围。',
  },
  {
    id: 'wave-ripples',
    name: '波纹干涉',
    description: '多个信号源持续扩散并交叠，构成柔和的空间波场。',
  },
  {
    id: 'meteor-shower',
    name: '流星阵列',
    description: '细长光迹从远处掠过，速度鲜明但保持内容可读。',
  },
  {
    id: 'topographic',
    name: '全息山脉',
    description: '三维地形网格在全屏地平线上起伏，像未来勘测舱的全息沙盘。',
  },
  {
    id: 'circuit-pulse',
    name: '电路脉冲',
    description: '正交电路路径分段点亮，呈现芯片与控制板的精密感。',
  },
  {
    id: 'perspective-grid',
    name: '透视地平线',
    description: '汇聚到远端的空间网格持续推进，建立强烈纵深。',
  },
  {
    id: 'spectrum-bars',
    name: '频谱矩阵',
    description: '多段频谱柱以不同节奏起伏，像实时信号监测界面。',
  },
  {
    id: 'lissajous',
    name: '示波轨迹',
    description: '多组李萨如曲线交错运行，形成精密的示波器图形。',
  },
  {
    id: 'portal-rings',
    name: '环形门户',
    description: '分段同心圆弧错速旋转，构成深层空间入口。',
  },
  {
    id: 'crystal-cells',
    name: '晶格切片',
    description: '不规则晶格分区依次显现，拥有低多边形切面质感。',
  },
  {
    id: 'scanline',
    name: '量子光栅',
    description: '全屏光栅、分区诊断框与能量扫描带同步运行，呈现量子舱检测界面。',
  },
  {
    id: 'ribbon-wave',
    name: '事件视界',
    description: '巨型暗核与弯曲吸积盘横穿画布，呈现黑洞引力透镜般的压迫感。',
  },
  {
    id: 'clockwork',
    name: '时序核心',
    description: '巨型分段时序环连接多个子核心，像未来引擎的时间同步装置。',
  },
  {
    id: 'moire',
    name: '超维方阵',
    description: '多组透视线框立方体错层旋转，组成覆盖全屏的未来空间阵列。',
  },
]

/** 按目录顺序排列的全部内置效果标识。 */
export const BACKGROUND_EFFECT_IDS = BACKGROUND_EFFECTS.map(({ id }) => id)

/** 未传入配置时使用的默认播放行为。 */
export const DEFAULT_PARTIPLEX_PLAYBACK: PartiplexPlaybackConfig = {
  mode: 'fixed',
  fixedEffect: 'constellation',
  rotationEffects: [...BACKGROUND_EFFECT_IDS],
  intervalMs: 20_000,
}

const effectIdSet = new Set<BackgroundEffectId>(BACKGROUND_EFFECT_IDS)
const MIN_INTERVAL_MS = 10_000
const MAX_INTERVAL_MS = 120_000

/** 判断未知值是否为有效的内置效果标识。 */
export function isBackgroundEffectId(value: unknown): value is BackgroundEffectId {
  return typeof value === 'string' && effectIdSet.has(value as BackgroundEffectId)
}

/** 校验并补全外部传入的播放配置。 */
export function normalizePartiplexPlaybackConfig(
  input: Partial<PartiplexPlaybackConfig> | null | undefined,
): PartiplexPlaybackConfig {
  const fixedEffect = isBackgroundEffectId(input?.fixedEffect)
    ? input.fixedEffect
    : DEFAULT_PARTIPLEX_PLAYBACK.fixedEffect
  const rotationEffects = Array.isArray(input?.rotationEffects)
    ? [...new Set(input.rotationEffects.filter(isBackgroundEffectId))]
    : [...DEFAULT_PARTIPLEX_PLAYBACK.rotationEffects]
  const requestedInterval = Number(input?.intervalMs)

  return {
    mode: input?.mode === 'rotate' ? 'rotate' : 'fixed',
    fixedEffect,
    rotationEffects: rotationEffects.length ? rotationEffects : [fixedEffect],
    intervalMs: Number.isFinite(requestedInterval)
      ? Math.min(MAX_INTERVAL_MS, Math.max(MIN_INTERVAL_MS, requestedInterval))
      : DEFAULT_PARTIPLEX_PLAYBACK.intervalMs,
  }
}

/** 根据明暗主题生成效果渲染器使用的调色板。 */
export function getEffectPalette(theme: BackgroundTheme): EffectPalette {
  if (theme === 'light') {
    return {
      primary: [31, 70, 178],
      secondary: [54, 83, 154],
      strongOpacity: 0.82,
      softOpacity: 0.42,
      faintOpacity: 0.18,
    }
  }

  return {
    primary: [159, 199, 255],
    secondary: [126, 158, 210],
    strongOpacity: 0.92,
    softOpacity: 0.5,
    faintOpacity: 0.2,
  }
}

/** 将 RGB 三元组和透明度转换为 CSS rgba() 颜色字符串。 */
export function rgba(color: [number, number, number], opacity: number): string {
  return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity})`
}
