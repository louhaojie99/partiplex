import {
  DEFAULT_PARTIPLEX_PLAYBACK,
  getEffectPalette,
  normalizePartiplexPlaybackConfig,
} from './catalog'
import { createEffectRenderer } from './renderers'
import type {
  BackgroundEffectId,
  BackgroundTheme,
  EffectFrame,
  EffectRenderer,
  PartiplexControllerOptions,
  PartiplexPlaybackConfig,
  PartiplexState,
} from './types'

/** 管理 Canvas 生命周期、播放配置和渲染循环的核心控制器。 */
export class PartiplexController {
  private readonly canvas: HTMLCanvasElement
  private readonly context: CanvasRenderingContext2D
  private config: PartiplexPlaybackConfig
  private theme: BackgroundTheme
  private renderer: EffectRenderer
  private previousRenderer: EffectRenderer | null = null
  private activeEffect: BackgroundEffectId
  private transitionStartedAt = 0
  private readonly transitionDurationMs = 900
  private rotationIndex = 0
  private animationFrame = 0
  private previousFrameAt = 0
  private nextRotationAt = 0
  private started = false
  private destroyed = false
  private visible = !document.hidden
  private reducedMotion = false
  private width = 0
  private height = 0
  private devicePixelRatio = 1
  private motionQuery: MediaQueryList | null = null
  private onEffectChange?: (effectId: BackgroundEffectId) => void
  private interactive: boolean
  private intensity: number
  private minFrameIntervalMs: number
  private manuallyPaused = false
  private pointer = { x: 0, y: 0, active: false }
  private pointerTarget = { x: 0, y: 0, active: false }

  /** 使用目标 Canvas 和可选配置创建控制器，调用 start() 后开始渲染。 */
  constructor(canvas: HTMLCanvasElement, options: PartiplexControllerOptions = {}) {
    const context = canvas.getContext('2d')
    if (!context) throw new Error('PartiplexController requires a 2D canvas context.')

    this.canvas = canvas
    this.context = context
    this.config = normalizePartiplexPlaybackConfig(
      options.effect
        ? {
            ...options.config,
            mode: 'fixed',
            fixedEffect: options.effect,
            rotationEffects: [options.effect],
          }
        : options.config,
    )
    this.theme = options.theme ?? 'dark'
    this.onEffectChange = options.onEffectChange
    this.interactive = options.interactive ?? true
    this.intensity = Math.min(1.9, Math.max(0.5, options.intensity ?? 1.16))
    this.minFrameIntervalMs = options.maxFps && options.maxFps > 0 ? 1000 / options.maxFps : 0
    this.activeEffect = this.getInitialEffect()
    this.renderer = createEffectRenderer(this.activeEffect)
  }

  /** 绑定浏览器事件并启动渲染循环；重复调用不会重复初始化。 */
  start() {
    if (this.started || this.destroyed) return this
    this.started = true
    this.motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    this.reducedMotion = this.motionQuery.matches
    this.motionQuery.addEventListener('change', this.handleMotionPreference)
    window.addEventListener('resize', this.handleResize, { passive: true })
    if (this.interactive) {
      window.addEventListener('pointermove', this.handlePointerMove, { passive: true })
      document.documentElement.addEventListener('mouseleave', this.handlePointerLeave)
    }
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
    this.resize()
    this.nextRotationAt = performance.now() + this.config.intervalMs
    this.renderOnce()
    this.scheduleAnimation()
    return this
  }

  /** 在不重新创建 Canvas 的情况下更新固定或轮播配置。 */
  setPlayback(config: Partial<PartiplexPlaybackConfig>) {
    this.config = normalizePartiplexPlaybackConfig({ ...this.config, ...config })
    const candidates = this.getRotationCandidates()
    const requestedEffect =
      this.config.mode === 'fixed'
        ? this.config.fixedEffect
        : candidates.includes(this.activeEffect)
          ? this.activeEffect
          : (candidates[0] ?? DEFAULT_PARTIPLEX_PLAYBACK.fixedEffect)

    this.rotationIndex = Math.max(0, candidates.indexOf(requestedEffect))
    this.selectEffect(requestedEffect)
    this.nextRotationAt = performance.now() + this.config.intervalMs
    this.scheduleAnimation()
    return this
  }

  /** 暂停或恢复渲染；事件处理函数中优先使用 pause() 和 resume()。 */
  setPaused(paused: boolean) {
    if (this.manuallyPaused === paused) return this
    this.manuallyPaused = paused
    if (paused) {
      window.cancelAnimationFrame(this.animationFrame)
      this.renderOnce()
    } else {
      this.scheduleAnimation()
    }
    return this
  }

  /** 更新背景明暗主题并立即重绘。 */
  setTheme(theme: BackgroundTheme) {
    if (this.theme === theme) return this
    this.theme = theme
    this.renderer.reset(this.getFrame())
    this.renderOnce()
    return this
  }

  /** 更新背景效果强度并立即重绘。 */
  setIntensity(intensity: number) {
    const nextIntensity = Math.min(1.9, Math.max(0.5, intensity))
    if (this.intensity === nextIntensity) return this
    this.intensity = nextIntensity
    this.renderer.reset(this.getFrame())
    this.renderOnce()
    return this
  }

  /** 设置最大渲染帧率；传入 undefined 表示跟随浏览器刷新率。 */
  setMaxFps(maxFps?: number) {
    this.minFrameIntervalMs = maxFps && maxFps > 0 ? 1000 / maxFps : 0
    this.previousFrameAt = 0
    this.scheduleAnimation()
    return this
  }

  /** 开启或关闭指针交互，并同步绑定或移除相关事件。 */
  setInteractive(interactive: boolean) {
    if (this.interactive === interactive) return this
    this.interactive = interactive
    if (this.started) {
      if (interactive) {
        window.addEventListener('pointermove', this.handlePointerMove, { passive: true })
        document.documentElement.addEventListener('mouseleave', this.handlePointerLeave)
      } else {
        window.removeEventListener('pointermove', this.handlePointerMove)
        document.documentElement.removeEventListener('mouseleave', this.handlePointerLeave)
        this.pointerTarget.active = false
        this.pointer.active = false
      }
    }
    return this
  }

  /** 切换到指定效果并关闭轮播。 */
  setEffect(effectId: BackgroundEffectId) {
    this.setPlayback({ mode: 'fixed', fixedEffect: effectId })
    return this
  }

  /** 暂停动画并保留当前画面。 */
  pause() {
    return this.setPaused(true)
  }

  /** 恢复由 pause() 暂停的动画。 */
  resume() {
    return this.setPaused(false)
  }

  /** 获取当前正在展示的效果标识。 */
  getCurrentEffect() {
    return this.activeEffect
  }

  /** 获取当前播放配置的副本，避免外部直接修改内部数组。 */
  getPlayback(): PartiplexPlaybackConfig {
    return {
      ...this.config,
      rotationEffects: [...this.config.rotationEffects],
    }
  }

  /** 判断动画是否已被调用方手动暂停。 */
  isPaused() {
    return this.manuallyPaused
  }

  /** 获取当前控制器状态的只读快照。 */
  getState(): PartiplexState {
    return {
      currentEffect: this.activeEffect,
      theme: this.theme,
      playback: this.getPlayback(),
      paused: this.manuallyPaused,
      interactive: this.interactive,
      intensity: this.intensity,
      maxFps: this.minFrameIntervalMs > 0 ? 1000 / this.minFrameIntervalMs : undefined,
    }
  }

  /** 停止渲染、解绑事件并清空 Canvas。 */
  destroy() {
    if (this.destroyed) return
    this.destroyed = true
    this.started = false
    window.cancelAnimationFrame(this.animationFrame)
    window.removeEventListener('resize', this.handleResize)
    window.removeEventListener('pointermove', this.handlePointerMove)
    document.documentElement.removeEventListener('mouseleave', this.handlePointerLeave)
    document.removeEventListener('visibilitychange', this.handleVisibilityChange)
    this.motionQuery?.removeEventListener('change', this.handleMotionPreference)
    this.context.clearRect(0, 0, this.width, this.height)
  }

  private getInitialEffect() {
    if (this.config.mode === 'fixed') return this.config.fixedEffect
    return this.config.rotationEffects[0] ?? DEFAULT_PARTIPLEX_PLAYBACK.fixedEffect
  }

  private getRotationCandidates() {
    return this.config.rotationEffects.length
      ? this.config.rotationEffects
      : [this.config.fixedEffect]
  }

  private getFrame(): EffectFrame {
    return {
      width: this.width,
      height: this.height,
      palette: this.getScaledPalette(),
      pointer: this.pointer,
      reducedMotion: this.reducedMotion,
    }
  }

  private getScaledPalette() {
    const palette = getEffectPalette(this.theme)
    return {
      ...palette,
      strongOpacity: Math.min(1, palette.strongOpacity * this.intensity),
      softOpacity: Math.min(1, palette.softOpacity * this.intensity),
      faintOpacity: Math.min(1, palette.faintOpacity * this.intensity),
    }
  }

  private selectEffect(effectId: BackgroundEffectId) {
    if (this.activeEffect === effectId && this.width > 0 && this.height > 0) {
      this.renderOnce()
      return
    }

    if (this.started && !this.reducedMotion && this.width > 0 && this.height > 0) {
      this.previousRenderer = this.renderer
      this.transitionStartedAt = performance.now()
    } else {
      this.previousRenderer = null
      this.transitionStartedAt = 0
    }

    this.activeEffect = effectId
    this.renderer = createEffectRenderer(effectId)
    this.renderer.reset(this.getFrame())
    this.onEffectChange?.(effectId)
    this.renderOnce()
  }

  private rotate(now: number) {
    const candidates = this.getRotationCandidates()
    if (this.config.mode !== 'rotate' || candidates.length < 2 || now < this.nextRotationAt) return

    this.rotationIndex =
      (Math.max(0, candidates.indexOf(this.activeEffect)) + 1) % candidates.length
    this.selectEffect(candidates[this.rotationIndex] ?? candidates[0] ?? this.config.fixedEffect)
    this.nextRotationAt = now + this.config.intervalMs
  }

  private resize() {
    const bounds = this.canvas.getBoundingClientRect()
    this.width = Math.max(1, Math.round(bounds.width || window.innerWidth))
    this.height = Math.max(1, Math.round(bounds.height || window.innerHeight))
    this.devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = Math.round(this.width * this.devicePixelRatio)
    this.canvas.height = Math.round(this.height * this.devicePixelRatio)
    this.context.setTransform(this.devicePixelRatio, 0, 0, this.devicePixelRatio, 0, 0)
    this.previousRenderer = null
    this.transitionStartedAt = 0
    this.renderer.reset(this.getFrame())
    this.renderOnce()
  }

  private renderOnce(now = performance.now()) {
    if (!this.width || !this.height || this.destroyed) return
    const frame = this.getFrame()
    this.context.clearRect(0, 0, this.width, this.height)

    if (this.previousRenderer && this.transitionStartedAt > 0 && !this.reducedMotion) {
      const progress = Math.min(
        1,
        Math.max(0, (now - this.transitionStartedAt) / this.transitionDurationMs),
      )
      const easedProgress =
        progress < 0.5 ? 4 * progress * progress * progress : 1 - (-2 * progress + 2) ** 3 / 2

      this.context.save()
      this.context.globalAlpha = 1 - easedProgress
      this.previousRenderer.draw(this.context, frame)
      this.context.restore()

      this.context.save()
      this.context.globalAlpha = easedProgress
      this.renderer.draw(this.context, frame)
      this.context.restore()

      if (progress >= 1) {
        this.previousRenderer = null
        this.transitionStartedAt = 0
      }
      return
    }

    this.renderer.draw(this.context, frame)
  }

  private scheduleAnimation() {
    window.cancelAnimationFrame(this.animationFrame)
    if (
      !this.started ||
      this.destroyed ||
      this.reducedMotion ||
      !this.visible ||
      this.manuallyPaused
    )
      return
    this.previousFrameAt = performance.now()
    this.animationFrame = window.requestAnimationFrame(this.animate)
  }

  private animate = (now: number) => {
    if (this.destroyed || this.reducedMotion || !this.visible || this.manuallyPaused) return
    const elapsedMs = now - this.previousFrameAt
    if (this.minFrameIntervalMs > 0 && elapsedMs < this.minFrameIntervalMs) {
      this.animationFrame = window.requestAnimationFrame(this.animate)
      return
    }
    const deltaSeconds = Math.min(0.05, Math.max(0, elapsedMs / 1000))
    this.previousFrameAt = now
    this.rotate(now)
    const pointerEase = 1 - Math.exp(-deltaSeconds * 8)
    this.pointer.x += (this.pointerTarget.x - this.pointer.x) * pointerEase
    this.pointer.y += (this.pointerTarget.y - this.pointer.y) * pointerEase
    this.pointer.active = this.pointerTarget.active
    const frame = this.getFrame()
    this.previousRenderer?.update(deltaSeconds, frame)
    this.renderer.update(deltaSeconds, frame)
    this.renderOnce(now)
    this.animationFrame = window.requestAnimationFrame(this.animate)
  }

  private handleResize = () => {
    this.resize()
  }

  private handlePointerMove = (event: PointerEvent) => {
    if (event.pointerType === 'touch') return
    const bounds = this.canvas.getBoundingClientRect()
    this.pointerTarget.x = event.clientX - bounds.left
    this.pointerTarget.y = event.clientY - bounds.top
    this.pointerTarget.active =
      this.pointerTarget.x >= 0 &&
      this.pointerTarget.x <= bounds.width &&
      this.pointerTarget.y >= 0 &&
      this.pointerTarget.y <= bounds.height
    if (this.reducedMotion) {
      this.pointer = { ...this.pointerTarget }
      this.renderOnce()
    }
  }

  private handlePointerLeave = () => {
    this.pointerTarget.active = false
    this.pointer.active = false
    if (this.reducedMotion) this.renderOnce()
  }

  private handleVisibilityChange = () => {
    this.visible = !document.hidden
    if (this.visible) {
      this.nextRotationAt = performance.now() + this.config.intervalMs
      this.scheduleAnimation()
    } else {
      window.cancelAnimationFrame(this.animationFrame)
    }
  }

  private handleMotionPreference = (event: MediaQueryListEvent) => {
    this.reducedMotion = event.matches
    if (this.reducedMotion) {
      window.cancelAnimationFrame(this.animationFrame)
      this.previousRenderer = null
      this.transitionStartedAt = 0
      this.renderOnce()
    } else {
      this.scheduleAnimation()
    }
  }
}
