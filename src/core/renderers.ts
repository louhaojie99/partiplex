import { rgba } from './catalog'
import type { BackgroundEffectId, EffectFrame, EffectRenderer } from './types'

function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min)
}

function wrap(value: number, min: number, max: number) {
  const range = max - min
  if (value < min) return max - ((min - value) % range)
  if (value > max) return min + ((value - max) % range)
  return value
}

type ConstellationPoint = {
  x: number
  y: number
  velocityX: number
  velocityY: number
  radius: number
  phase: number
  hub: boolean
}

function createConstellationRenderer(): EffectRenderer {
  let elapsed = 0
  let points: ConstellationPoint[] = []
  const linkDistance = 168
  const pointerDistance = 220

  function reset(frame: EffectFrame) {
    const areaCount = Math.round((frame.width * frame.height) / 12_000)
    const desktopCount = Math.min(118, Math.max(42, areaCount))
    const count = frame.width <= 700 ? Math.min(44, desktopCount) : desktopCount

    points = Array.from({ length: count }, (_, index) => {
      const speed = randomBetween(0.12, 0.34)
      const angle = Math.random() * Math.PI * 2
      return {
        x: Math.random() * frame.width,
        y: Math.random() * frame.height,
        velocityX: Math.cos(angle) * speed,
        velocityY: Math.sin(angle) * speed,
        radius: randomBetween(0.8, 1.8),
        phase: Math.random() * Math.PI * 2,
        hub: index % (frame.width <= 700 ? 13 : 17) === 0,
      }
    })
    elapsed = 0
  }

  function update(deltaSeconds: number, frame: EffectFrame) {
    const multiplier = deltaSeconds * 60
    elapsed += deltaSeconds
    points.forEach((point) => {
      point.x = wrap(
        point.x + point.velocityX * multiplier,
        -linkDistance,
        frame.width + linkDistance,
      )
      point.y = wrap(
        point.y + point.velocityY * multiplier,
        -linkDistance,
        frame.height + linkDistance,
      )
    })
  }

  function drawLink(
    context: CanvasRenderingContext2D,
    frame: EffectFrame,
    firstX: number,
    firstY: number,
    secondX: number,
    secondY: number,
    maxDistance: number,
    multiplier = 1,
  ) {
    const deltaX = firstX - secondX
    const deltaY = firstY - secondY
    const distanceSquared = deltaX * deltaX + deltaY * deltaY
    const maxDistanceSquared = maxDistance * maxDistance
    if (distanceSquared >= maxDistanceSquared) return

    const opacity =
      (1 - distanceSquared / maxDistanceSquared) * frame.palette.softOpacity * multiplier
    context.beginPath()
    context.moveTo(firstX, firstY)
    context.lineTo(secondX, secondY)
    context.strokeStyle = rgba(frame.palette.primary, opacity)
    context.lineWidth = multiplier > 1.4 ? 1.1 : 0.72
    context.stroke()
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    const hubs = points.filter((point) => point.hub)

    if (hubs.length > 2) {
      context.beginPath()
      hubs.forEach((hub, index) => {
        if (index === 0) context.moveTo(hub.x, hub.y)
        else context.lineTo(hub.x, hub.y)
      })
      context.strokeStyle = rgba(frame.palette.secondary, frame.palette.faintOpacity * 0.55)
      context.setLineDash([2, 12])
      context.stroke()
      context.setLineDash([])
    }

    points.forEach((point, index) => {
      const pulse = 0.72 + Math.sin(elapsed * 0.8 + point.phase) * 0.28
      context.beginPath()
      context.arc(point.x, point.y, point.radius * (point.hub ? 1.4 : 1), 0, Math.PI * 2)
      context.fillStyle = rgba(frame.palette.primary, frame.palette.strongOpacity * pulse)
      context.fill()

      for (let comparedIndex = index + 1; comparedIndex < points.length; comparedIndex += 1) {
        const comparedPoint = points[comparedIndex]
        if (!comparedPoint) continue
        drawLink(
          context,
          frame,
          point.x,
          point.y,
          comparedPoint.x,
          comparedPoint.y,
          linkDistance,
          point.hub || comparedPoint.hub ? 1.55 : 0.92,
        )
      }

      if (point.hub) {
        const radius = 12 + pulse * 7
        context.beginPath()
        context.arc(point.x, point.y, radius, -Math.PI * 0.2, Math.PI * 0.55)
        context.arc(point.x, point.y, radius, Math.PI * 0.8, Math.PI * 1.55)
        context.strokeStyle = rgba(frame.palette.primary, frame.palette.softOpacity * 0.9)
        context.lineWidth = 1
        context.stroke()
        context.beginPath()
        context.moveTo(point.x - radius - 5, point.y)
        context.lineTo(point.x - radius + 2, point.y)
        context.moveTo(point.x + radius - 2, point.y)
        context.lineTo(point.x + radius + 5, point.y)
        context.strokeStyle = rgba(frame.palette.secondary, frame.palette.softOpacity)
        context.stroke()
      }

      if (frame.pointer.active) {
        drawLink(
          context,
          frame,
          point.x,
          point.y,
          frame.pointer.x,
          frame.pointer.y,
          pointerDistance,
          1.7,
        )
      }
    })
  }

  return { reset, update, draw }
}

type GalaxySpark = {
  arm: number
  progress: number
  offset: number
  size: number
  strength: number
  twinkle: number
}

function createGalaxyVortexRenderer(): EffectRenderer {
  let elapsed = 0
  let sparks: GalaxySpark[] = []

  function reset(frame: EffectFrame) {
    const count = frame.width <= 700 ? 150 : 360
    sparks = Array.from({ length: count }, () => ({
      arm: Math.floor(Math.random() * 5),
      progress: Math.random() ** 0.72,
      offset: randomBetween(-0.12, 0.12),
      size: randomBetween(0.35, 1.7),
      strength: randomBetween(0.42, 1),
      twinkle: Math.random() * Math.PI * 2,
    }))
    elapsed = 0
  }

  function update(deltaSeconds: number) {
    elapsed += deltaSeconds
  }

  function spiralPoint(arm: number, progress: number, offset: number, frame: EffectFrame) {
    const angle = (arm / 5) * Math.PI * 2 + progress * Math.PI * 3.45 + elapsed * 0.032
    const radius = progress ** 0.82
    const longRadius = Math.max(frame.width, frame.height * 1.35) * 0.63
    return {
      x: Math.cos(angle) * longRadius * radius,
      y: Math.sin(angle) * longRadius * radius * 0.31 + offset * frame.height,
    }
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    const centerX = frame.width * (frame.width <= 700 ? 0.5 : 0.58)
    const centerY = frame.height * 0.5
    const rotation = -0.24

    context.save()
    context.translate(centerX, centerY)
    context.rotate(rotation)

    for (let arm = 0; arm < 5; arm += 1) {
      for (let layer = 0; layer < 3; layer += 1) {
        context.beginPath()
        for (let sample = 0; sample <= 110; sample += 1) {
          const progress = sample / 110
          const point = spiralPoint(arm, progress, (layer - 1) * 0.025, frame)
          if (sample === 0) context.moveTo(point.x, point.y)
          else context.lineTo(point.x, point.y)
        }
        context.strokeStyle = rgba(
          layer === 1 ? frame.palette.primary : frame.palette.secondary,
          frame.palette.faintOpacity * (layer === 1 ? 0.82 : 0.38),
        )
        context.lineWidth =
          layer === 1 ? Math.max(1.1, frame.height * 0.012) : Math.max(0.55, frame.height * 0.004)
        context.stroke()
      }
    }

    context.globalCompositeOperation = 'lighter'
    sparks.forEach((spark) => {
      const driftedProgress = (spark.progress + elapsed * 0.0018 * spark.strength) % 1
      const point = spiralPoint(spark.arm, driftedProgress, spark.offset, frame)
      const pulse = 0.72 + Math.sin(elapsed * 0.75 + spark.twinkle) * 0.28
      const size = spark.size * (0.72 + driftedProgress * 0.72)
      context.beginPath()
      context.arc(point.x, point.y, size, 0, Math.PI * 2)
      context.fillStyle = rgba(
        frame.palette.primary,
        frame.palette.strongOpacity * spark.strength * pulse,
      )
      context.fill()
    })

    const coreRadius = Math.max(18, Math.min(frame.width, frame.height) * 0.1)
    const core = context.createRadialGradient(0, 0, 0, 0, 0, coreRadius * 2.8)
    core.addColorStop(0, rgba(frame.palette.primary, frame.palette.strongOpacity * 0.95))
    core.addColorStop(0.12, rgba(frame.palette.primary, frame.palette.softOpacity * 0.88))
    core.addColorStop(0.5, rgba(frame.palette.secondary, frame.palette.faintOpacity * 0.42))
    core.addColorStop(1, rgba(frame.palette.primary, 0))
    context.fillStyle = core
    context.beginPath()
    context.arc(0, 0, coreRadius * 2.8, 0, Math.PI * 2)
    context.fill()

    context.restore()
  }

  return { reset, update, draw }
}

type RainColumn = {
  x: number
  y: number
  speed: number
  length: number
  phase: number
  fontSize: number
  lane: number
}

function createDataRainRenderer(): EffectRenderer {
  let elapsed = 0
  let columns: RainColumn[] = []
  const glyphs = ['0', '1', '7', 'A', 'E', 'H', 'L', 'S', 'X', '∆', '◆', ':']
  const labels = ['SYS/07', 'RX-2048', 'NODE.A', 'SYNC', 'ARCHIVE', 'SECTOR']

  function reset(frame: EffectFrame) {
    const spacing = frame.width <= 700 ? 42 : 34
    const laneCount = frame.width <= 700 ? 3 : 6
    const count = Math.ceil(frame.width / spacing) + 2
    columns = Array.from({ length: count }, (_, index) => ({
      x: (index + 0.5) * spacing + randomBetween(-9, 9),
      y: randomBetween(-frame.height, frame.height),
      speed: randomBetween(34, 86),
      length: Math.floor(randomBetween(10, 25)),
      phase: Math.floor(Math.random() * glyphs.length),
      fontSize: index % 8 === 0 ? randomBetween(16, 20) : randomBetween(10, 14),
      lane: index % laneCount,
    }))
    elapsed = 0
  }

  function update(deltaSeconds: number, frame: EffectFrame) {
    elapsed += deltaSeconds
    columns.forEach((column) => {
      column.y += column.speed * deltaSeconds
      if (column.y - column.length * 22 > frame.height) {
        column.y = randomBetween(-frame.height * 0.9, -80)
        column.speed = randomBetween(34, 86)
      }
    })
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    const laneCount = frame.width <= 700 ? 3 : 6
    const laneWidth = frame.width / laneCount

    for (let lane = 0; lane < laneCount; lane += 1) {
      const x = lane * laneWidth
      if (lane % 2 === 0) {
        context.fillStyle = rgba(frame.palette.secondary, frame.palette.faintOpacity * 0.09)
        context.fillRect(x, 0, laneWidth, frame.height)
      }

      if (lane > 0) {
        context.beginPath()
        context.moveTo(x, 0)
        context.lineTo(x, frame.height)
        context.strokeStyle = rgba(frame.palette.secondary, frame.palette.faintOpacity * 0.62)
        context.setLineDash([2, 10])
        context.stroke()
      }

      const bracketWidth = Math.min(82, laneWidth * 0.58)
      context.setLineDash([])
      context.strokeStyle = rgba(frame.palette.primary, frame.palette.faintOpacity * 0.9)
      context.beginPath()
      context.moveTo(x + 10, 56)
      context.lineTo(x + 10 + bracketWidth, 56)
      context.moveTo(x + laneWidth - 10 - bracketWidth * 0.45, frame.height - 38)
      context.lineTo(x + laneWidth - 10, frame.height - 38)
      context.stroke()
    }
    context.setLineDash([])

    const scannerY = wrap(elapsed * 74, -90, frame.height + 90)
    const scannerGradient = context.createLinearGradient(0, scannerY - 78, 0, scannerY + 78)
    scannerGradient.addColorStop(0, rgba(frame.palette.primary, 0))
    scannerGradient.addColorStop(
      0.5,
      rgba(frame.palette.primary, frame.palette.faintOpacity * 0.26),
    )
    scannerGradient.addColorStop(1, rgba(frame.palette.primary, 0))
    context.fillStyle = scannerGradient
    context.fillRect(0, scannerY - 78, frame.width, 156)
    context.fillStyle = rgba(frame.palette.primary, frame.palette.softOpacity * 0.76)
    context.fillRect(0, scannerY, frame.width, 1)

    columns.forEach((column, columnIndex) => {
      const x = column.x + Math.sin(elapsed * 0.42 + column.phase) * 2.5
      const step = column.fontSize + 6
      context.font = `${columnIndex % 8 === 0 ? 600 : 450} ${column.fontSize}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
      context.textAlign = 'center'
      for (let index = 0; index < column.length; index += 1) {
        const y = column.y - index * step
        if (y < -28 || y > frame.height + 28) continue
        const strength = 1 - index / column.length
        const opacity = Math.min(
          0.96,
          frame.palette.faintOpacity * 1.28 + strength * frame.palette.softOpacity * 1.32,
        )
        const glyph = glyphs[(column.phase + index) % glyphs.length] ?? '0'
        context.fillStyle = rgba(
          index === 0 ? frame.palette.primary : frame.palette.secondary,
          opacity,
        )
        if (index === 0) {
          context.save()
          context.shadowBlur = 13
          context.shadowColor = rgba(frame.palette.primary, frame.palette.softOpacity * 0.9)
          context.fillText(glyph, x, y)
          context.restore()
        } else {
          context.fillText(glyph, x, y)
        }
      }

      if (columnIndex % 5 === 0) {
        const blockY = wrap(column.y * 0.5 + column.phase * 61, -50, frame.height + 50)
        context.fillStyle = rgba(frame.palette.primary, frame.palette.softOpacity * 0.9)
        context.fillRect(x - 23, blockY, 46, 2)
        context.fillStyle = rgba(frame.palette.secondary, frame.palette.faintOpacity * 1.25)
        context.fillRect(x - 23, blockY + 7, 31, 1)
        context.fillRect(x + 12, blockY + 7, 11, 1)
      }
    })

    context.textAlign = 'left'
    context.font = '600 10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    labels.slice(0, laneCount).forEach((label, index) => {
      const x = index * laneWidth + 12
      const pulse = 0.72 + Math.sin(elapsed * 0.9 + index) * 0.2
      context.fillStyle = rgba(frame.palette.primary, frame.palette.softOpacity * pulse)
      context.fillText(label, x, 22 + (index % 2) * 16)
      context.fillRect(x, 29 + (index % 2) * 16, Math.min(72, laneWidth - 24), 1)
    })

    context.textAlign = 'right'
    context.font = '9px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    context.fillStyle = rgba(frame.palette.secondary, frame.palette.softOpacity * 0.72)
    context.fillText(
      `NEURAL STREAM // ${String(Math.floor(wrap(elapsed * 19, 0, 100))).padStart(2, '0')}%`,
      frame.width - 14,
      frame.height - 16,
    )
  }

  return { reset, update, draw }
}

type RadarBlip = {
  angle: number
  distance: number
  size: number
  strength: number
}

function createRadarRenderer(): EffectRenderer {
  let sweepAngle = -Math.PI * 0.35
  let centerX = 0
  let centerY = 0
  let radius = 0
  let blips: RadarBlip[] = []

  function reset(frame: EffectFrame) {
    centerX = frame.width * (frame.width <= 700 ? 0.58 : 0.72)
    centerY = frame.height * 0.54
    radius = Math.max(frame.width * 0.62, frame.height * 0.88)
    blips = Array.from({ length: frame.width <= 700 ? 7 : 13 }, () => ({
      angle: Math.random() * Math.PI * 2,
      distance: randomBetween(0.16, 0.92),
      size: randomBetween(1.4, 3.1),
      strength: randomBetween(0.62, 1),
    }))
  }

  function update(deltaSeconds: number) {
    sweepAngle = (sweepAngle + deltaSeconds * 0.34) % (Math.PI * 2)
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    context.save()
    context.translate(centerX, centerY)

    for (let trail = 14; trail >= 0; trail -= 1) {
      const angle = sweepAngle - trail * 0.025
      const alpha = (1 - trail / 15) * frame.palette.faintOpacity * 0.72
      context.beginPath()
      context.moveTo(0, 0)
      context.arc(0, 0, radius, angle - 0.028, angle)
      context.closePath()
      context.fillStyle = rgba(frame.palette.primary, alpha)
      context.fill()
    }

    for (let ring = 1; ring <= 6; ring += 1) {
      context.beginPath()
      context.arc(0, 0, (radius * ring) / 6, 0, Math.PI * 2)
      context.strokeStyle = rgba(
        ring === 4 || ring === 6 ? frame.palette.primary : frame.palette.secondary,
        frame.palette.faintOpacity * (ring === 6 ? 1.15 : 0.78),
      )
      context.lineWidth = ring === 6 ? 1.1 : 0.68
      context.stroke()
    }

    for (let spoke = 0; spoke < 12; spoke += 1) {
      const angle = (spoke * Math.PI) / 6
      context.beginPath()
      context.moveTo(Math.cos(angle) * radius * 0.08, Math.sin(angle) * radius * 0.08)
      context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
      context.strokeStyle = rgba(frame.palette.secondary, frame.palette.faintOpacity * 0.58)
      context.stroke()
    }

    for (let tick = 0; tick < 72; tick += 1) {
      const angle = (tick / 72) * Math.PI * 2
      const major = tick % 6 === 0
      context.beginPath()
      context.moveTo(
        Math.cos(angle) * radius * (major ? 0.972 : 0.985),
        Math.sin(angle) * radius * (major ? 0.972 : 0.985),
      )
      context.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius)
      context.strokeStyle = rgba(
        frame.palette.primary,
        frame.palette.softOpacity * (major ? 0.82 : 0.38),
      )
      context.lineWidth = major ? 1.1 : 0.55
      context.stroke()
    }

    context.beginPath()
    context.moveTo(0, 0)
    context.lineTo(Math.cos(sweepAngle) * radius, Math.sin(sweepAngle) * radius)
    context.strokeStyle = rgba(frame.palette.primary, frame.palette.strongOpacity * 0.92)
    context.lineWidth = 1.35
    context.stroke()

    blips.forEach((blip, index) => {
      const angleDistance = Math.abs(
        Math.atan2(Math.sin(sweepAngle - blip.angle), Math.cos(sweepAngle - blip.angle)),
      )
      const sweepStrength = Math.max(0.28, 1 - angleDistance / 1.4)
      const x = Math.cos(blip.angle) * radius * blip.distance
      const y = Math.sin(blip.angle) * radius * blip.distance
      const bracket = 7 + blip.size * 1.8
      context.strokeStyle = rgba(
        frame.palette.primary,
        frame.palette.strongOpacity * blip.strength * sweepStrength,
      )
      context.lineWidth = 1
      context.strokeRect(x - bracket / 2, y - bracket / 2, bracket, bracket)
      context.beginPath()
      context.arc(x, y, blip.size, 0, Math.PI * 2)
      context.fillStyle = rgba(frame.palette.primary, frame.palette.strongOpacity * blip.strength)
      context.fill()
      if (index % 3 === 0) {
        context.beginPath()
        context.arc(x, y, bracket * (1.25 + sweepStrength * 0.35), 0, Math.PI * 2)
        context.strokeStyle = rgba(
          frame.palette.secondary,
          frame.palette.softOpacity * sweepStrength * 0.7,
        )
        context.stroke()
      }
    })

    context.beginPath()
    context.arc(0, 0, 5, 0, Math.PI * 2)
    context.fillStyle = rgba(frame.palette.primary, frame.palette.strongOpacity)
    context.fill()
    context.restore()
  }

  return { reset, update, draw }
}

type WarpLane = {
  side: -1 | 1
  offset: number
  bend: number
  speed: number
  width: number
  dash: number
}

function createFlowFieldRenderer(): EffectRenderer {
  let elapsed = 0
  let lanes: WarpLane[] = []

  function reset(frame: EffectFrame) {
    const count = frame.width <= 700 ? 18 : 36
    lanes = Array.from({ length: count }, (_, index) => ({
      side: index % 2 === 0 ? -1 : 1,
      offset: randomBetween(-0.58, 0.58),
      bend: randomBetween(0.16, 0.54),
      speed: randomBetween(34, 82),
      width: randomBetween(0.7, 1.8),
      dash: randomBetween(20, 96),
    }))
    elapsed = 0
  }

  function update(deltaSeconds: number) {
    elapsed += deltaSeconds
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    const targetX = frame.width * (0.56 + Math.sin(elapsed * 0.07) * 0.025)
    const targetY = frame.height * (0.46 + Math.cos(elapsed * 0.09) * 0.035)
    const glowRadius = Math.min(frame.width, frame.height) * 0.42
    const glow = context.createRadialGradient(targetX, targetY, 0, targetX, targetY, glowRadius)
    glow.addColorStop(0, rgba(frame.palette.primary, frame.palette.faintOpacity * 0.72))
    glow.addColorStop(0.18, rgba(frame.palette.secondary, frame.palette.faintOpacity * 0.28))
    glow.addColorStop(1, rgba(frame.palette.primary, 0))
    context.fillStyle = glow
    context.fillRect(targetX - glowRadius, targetY - glowRadius, glowRadius * 2, glowRadius * 2)

    context.save()
    context.lineCap = 'round'

    for (let gate = 0; gate < (frame.width <= 700 ? 6 : 9); gate += 1) {
      const progress = wrap(gate / 9 + elapsed * 0.11, 0, 1)
      const depth = progress ** 1.72
      const halfWidth = 16 + depth * frame.width * 0.68
      const halfHeight = 10 + depth * frame.height * 0.64
      const shoulder = halfWidth * 0.72
      const opacity =
        (1 - progress) * frame.palette.softOpacity * 0.72 + frame.palette.faintOpacity * 0.24

      context.beginPath()
      context.moveTo(targetX - halfWidth, targetY)
      context.lineTo(targetX - shoulder, targetY - halfHeight)
      context.lineTo(targetX + shoulder, targetY - halfHeight)
      context.lineTo(targetX + halfWidth, targetY)
      context.lineTo(targetX + shoulder, targetY + halfHeight)
      context.lineTo(targetX - shoulder, targetY + halfHeight)
      context.closePath()
      context.strokeStyle = rgba(
        gate % 3 === 0 ? frame.palette.primary : frame.palette.secondary,
        opacity,
      )
      context.lineWidth = gate % 3 === 0 ? 1.15 : 0.7
      context.stroke()
    }

    lanes.forEach((lane, index) => {
      const startX = lane.side < 0 ? -frame.width * 0.12 : frame.width * 1.12
      const startY = frame.height * (0.5 + lane.offset)
      const controlX = lane.side < 0 ? frame.width * lane.bend : frame.width * (1 - lane.bend)
      const controlY = targetY + lane.offset * frame.height * 0.24

      context.beginPath()
      context.moveTo(startX, startY)
      context.quadraticCurveTo(controlX, controlY, targetX, targetY)
      context.setLineDash([])
      context.strokeStyle = rgba(frame.palette.secondary, frame.palette.faintOpacity * 0.72)
      context.lineWidth = lane.width * 0.76
      context.stroke()

      context.beginPath()
      context.moveTo(startX, startY)
      context.quadraticCurveTo(controlX, controlY, targetX, targetY)
      context.setLineDash([Math.max(10, lane.dash * 0.24), lane.dash])
      context.lineDashOffset = -elapsed * lane.speed
      context.strokeStyle = rgba(
        index % 5 === 0 ? frame.palette.primary : frame.palette.secondary,
        frame.palette.softOpacity * (index % 5 === 0 ? 1.18 : 0.78),
      )
      context.lineWidth = lane.width
      context.stroke()
    })
    context.setLineDash([])

    const pulse = 17 + Math.sin(elapsed * 0.86) * 4
    context.translate(targetX, targetY)
    context.rotate(Math.PI / 4 + elapsed * 0.045)
    context.shadowBlur = 22
    context.shadowColor = rgba(frame.palette.primary, frame.palette.softOpacity * 0.86)
    context.strokeStyle = rgba(frame.palette.primary, frame.palette.strongOpacity)
    context.lineWidth = 1.35
    context.strokeRect(-pulse / 2, -pulse / 2, pulse, pulse)
    context.shadowBlur = 0
    context.strokeStyle = rgba(frame.palette.secondary, frame.palette.softOpacity * 0.92)
    context.strokeRect(-pulse * 1.18, -pulse * 1.18, pulse * 2.36, pulse * 2.36)
    context.beginPath()
    context.arc(0, 0, pulse * 1.85, 0, Math.PI * 2)
    context.strokeStyle = rgba(frame.palette.primary, frame.palette.faintOpacity * 1.3)
    context.stroke()
    context.restore()
  }

  return { reset, update, draw }
}

type OrbitRing = {
  radiusX: number
  radiusY: number
  rotation: number
  speed: number
  nodeAngle: number
  nodeSize: number
}

function createOrbitLinesRenderer(): EffectRenderer {
  let elapsed = 0
  let centerX = 0
  let centerY = 0
  let planetRadius = 0
  let rings: OrbitRing[] = []

  function reset(frame: EffectFrame) {
    centerX = frame.width * (frame.width <= 700 ? 0.54 : 0.68)
    centerY = frame.height * 0.5
    planetRadius = Math.min(frame.width, frame.height) * (frame.width <= 700 ? 0.18 : 0.22)
    const maxRadiusX = frame.width * (frame.width <= 700 ? 0.58 : 0.52)
    const maxRadiusY = frame.height * 0.46
    rings = Array.from({ length: frame.width <= 700 ? 6 : 9 }, (_, index) => ({
      radiusX: maxRadiusX * (0.34 + index * (frame.width <= 700 ? 0.13 : 0.082)),
      radiusY: maxRadiusY * (0.28 + index * (frame.width <= 700 ? 0.14 : 0.085)),
      rotation: -0.82 + index * 0.18,
      speed: (index % 2 === 0 ? 1 : -1) * randomBetween(0.04, 0.11),
      nodeAngle: Math.random() * Math.PI * 2,
      nodeSize: randomBetween(1.3, 3),
    }))
    elapsed = 0
  }

  function update(deltaSeconds: number) {
    elapsed += deltaSeconds
  }

  function drawGlobe(context: CanvasRenderingContext2D, frame: EffectFrame) {
    const isDark = frame.palette.primary[0] > 100
    const gradient = context.createRadialGradient(
      -planetRadius * 0.32,
      -planetRadius * 0.35,
      planetRadius * 0.08,
      0,
      0,
      planetRadius,
    )
    gradient.addColorStop(0, rgba(frame.palette.primary, isDark ? 0.2 : 0.12))
    gradient.addColorStop(0.62, rgba(frame.palette.secondary, isDark ? 0.1 : 0.07))
    gradient.addColorStop(1, rgba(frame.palette.primary, isDark ? 0.02 : 0.035))
    context.beginPath()
    context.arc(0, 0, planetRadius, 0, Math.PI * 2)
    context.fillStyle = gradient
    context.fill()
    context.strokeStyle = rgba(frame.palette.primary, frame.palette.softOpacity * 1.1)
    context.lineWidth = 1.25
    context.stroke()

    context.save()
    context.beginPath()
    context.arc(0, 0, planetRadius - 1, 0, Math.PI * 2)
    context.clip()
    for (let latitude = -2; latitude <= 2; latitude += 1) {
      context.beginPath()
      context.ellipse(
        0,
        latitude * planetRadius * 0.29,
        planetRadius,
        planetRadius * (0.16 + Math.abs(latitude) * 0.025),
        0,
        0,
        Math.PI * 2,
      )
      context.strokeStyle = rgba(frame.palette.secondary, frame.palette.faintOpacity * 0.82)
      context.stroke()
    }
    for (let longitude = -2; longitude <= 2; longitude += 1) {
      context.beginPath()
      context.ellipse(
        0,
        0,
        planetRadius * (0.2 + Math.abs(longitude) * 0.16),
        planetRadius,
        elapsed * 0.025 + longitude * 0.12,
        0,
        Math.PI * 2,
      )
      context.strokeStyle = rgba(frame.palette.secondary, frame.palette.faintOpacity * 0.75)
      context.stroke()
    }
    context.restore()

    context.beginPath()
    context.arc(
      0,
      0,
      planetRadius * (1.08 + Math.sin(elapsed * 0.45) * 0.012),
      -Math.PI * 0.18,
      Math.PI * 1.1,
    )
    context.strokeStyle = rgba(frame.palette.primary, frame.palette.softOpacity * 0.72)
    context.lineWidth = 2
    context.stroke()
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    context.save()
    context.translate(centerX, centerY)

    rings.forEach((ring, index) => {
      context.save()
      context.rotate(ring.rotation)
      context.beginPath()
      context.ellipse(0, 0, ring.radiusX, ring.radiusY, 0, 0, Math.PI * 2)
      context.strokeStyle = rgba(
        index % 3 === 0 ? frame.palette.primary : frame.palette.secondary,
        frame.palette.faintOpacity * (index % 3 === 0 ? 1.18 : 0.72),
      )
      context.lineWidth = index % 3 === 0 ? 1.15 : 0.62
      context.stroke()

      const angle = ring.nodeAngle + elapsed * ring.speed
      const x = Math.cos(angle) * ring.radiusX
      const y = Math.sin(angle) * ring.radiusY
      context.beginPath()
      context.arc(x, y, ring.nodeSize, 0, Math.PI * 2)
      context.fillStyle = rgba(frame.palette.primary, frame.palette.strongOpacity * 0.94)
      context.fill()
      context.beginPath()
      context.arc(x, y, ring.nodeSize * 3.4, 0, Math.PI * 2)
      context.strokeStyle = rgba(frame.palette.primary, frame.palette.softOpacity * 0.62)
      context.stroke()
      context.restore()
    })

    drawGlobe(context, frame)
    context.restore()
  }

  return { reset, update, draw }
}

type HexCell = {
  x: number
  y: number
  phase: number
  distance: number
}

function createHexGridRenderer(): EffectRenderer {
  let elapsed = 0
  let size = 32
  let cells: HexCell[] = []

  function reset(frame: EffectFrame) {
    size = frame.width <= 700 ? 27 : 34
    const horizontal = size * Math.sqrt(3)
    const vertical = size * 1.5
    const centerX = frame.width * 0.5
    const centerY = frame.height * 0.5
    cells = []

    for (let row = -1; row <= Math.ceil(frame.height / vertical) + 1; row += 1) {
      for (let column = -1; column <= Math.ceil(frame.width / horizontal) + 1; column += 1) {
        const x = column * horizontal + (row % 2 ? horizontal / 2 : 0)
        const y = row * vertical
        const normalizedDistance =
          Math.hypot(x - centerX, y - centerY) / Math.max(frame.width, frame.height)
        cells.push({
          x,
          y,
          phase: Math.random() * Math.PI * 2,
          distance: normalizedDistance,
        })
      }
    }
    elapsed = 0
  }

  function update(deltaSeconds: number) {
    elapsed += deltaSeconds
  }

  function drawHexagon(context: CanvasRenderingContext2D, x: number, y: number, radius: number) {
    context.beginPath()
    for (let side = 0; side < 6; side += 1) {
      const angle = (Math.PI / 3) * side - Math.PI / 6
      const pointX = x + Math.cos(angle) * radius
      const pointY = y + Math.sin(angle) * radius
      if (side === 0) context.moveTo(pointX, pointY)
      else context.lineTo(pointX, pointY)
    }
    context.closePath()
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    cells.forEach((cell) => {
      const pulse = frame.reducedMotion
        ? 0.45
        : (Math.sin(elapsed * 0.72 - cell.distance * 12 + cell.phase * 0.14) + 1) / 2
      const opacity = frame.palette.faintOpacity * (0.48 + pulse * 0.82)
      drawHexagon(context, cell.x, cell.y, size * 0.94)
      context.strokeStyle = rgba(frame.palette.secondary, opacity)
      context.lineWidth = pulse > 0.82 ? 0.9 : 0.52
      context.stroke()

      if (pulse > 0.88 && cell.distance < 0.7) {
        context.beginPath()
        context.arc(cell.x, cell.y, 1.1, 0, Math.PI * 2)
        context.fillStyle = rgba(frame.palette.primary, frame.palette.softOpacity * pulse)
        context.fill()
      }
    })
  }

  return { reset, update, draw }
}

type RippleSource = {
  x: number
  y: number
  phase: number
  speed: number
}

function createWaveRipplesRenderer(): EffectRenderer {
  let elapsed = 0
  let maxRadius = 0
  let sources: RippleSource[] = []

  function reset(frame: EffectFrame) {
    maxRadius = Math.hypot(frame.width, frame.height) * 0.42
    sources =
      frame.width <= 700
        ? [
            { x: frame.width * 0.25, y: frame.height * 0.38, phase: 0, speed: 23 },
            { x: frame.width * 0.78, y: frame.height * 0.67, phase: 0.46, speed: 19 },
          ]
        : [
            { x: frame.width * 0.18, y: frame.height * 0.34, phase: 0, speed: 24 },
            { x: frame.width * 0.56, y: frame.height * 0.72, phase: 0.35, speed: 20 },
            { x: frame.width * 0.88, y: frame.height * 0.25, phase: 0.68, speed: 22 },
          ]
    elapsed = 0
  }

  function update(deltaSeconds: number) {
    elapsed += deltaSeconds
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    context.save()
    context.lineWidth = 0.7

    sources.forEach((source, sourceIndex) => {
      for (let ring = 0; ring < 8; ring += 1) {
        const progress =
          ((elapsed * source.speed + source.phase * maxRadius + (ring * maxRadius) / 8) %
            maxRadius) /
          maxRadius
        const radius = progress * maxRadius
        const opacity = Math.sin(progress * Math.PI) * frame.palette.softOpacity * 0.75
        context.beginPath()
        context.arc(source.x, source.y, radius, 0, Math.PI * 2)
        context.strokeStyle = rgba(
          sourceIndex % 2 === 0 ? frame.palette.primary : frame.palette.secondary,
          opacity,
        )
        context.stroke()
      }

      context.beginPath()
      context.arc(source.x, source.y, 2.2, 0, Math.PI * 2)
      context.fillStyle = rgba(frame.palette.primary, frame.palette.strongOpacity * 0.8)
      context.fill()
    })

    context.beginPath()
    sources.forEach((source, index) => {
      if (index === 0) context.moveTo(source.x, source.y)
      else context.lineTo(source.x, source.y)
    })
    context.strokeStyle = rgba(frame.palette.secondary, frame.palette.faintOpacity * 0.65)
    context.setLineDash([3, 8])
    context.stroke()
    context.restore()
  }

  return { reset, update, draw }
}

type Meteor = {
  x: number
  y: number
  speed: number
  length: number
  width: number
  delay: number
  depth: number
  drift: number
}

function createMeteorShowerRenderer(): EffectRenderer {
  let meteors: Meteor[] = []

  function createMeteor(frame: EffectFrame, initial = false, hero = false): Meteor {
    return {
      x: initial
        ? randomBetween(-frame.width * 0.3, frame.width * 1.05)
        : randomBetween(-frame.width * 0.55, -80),
      y: initial
        ? randomBetween(-frame.height * 0.35, frame.height * 0.9)
        : randomBetween(-frame.height * 0.42, frame.height * 0.48),
      speed: hero ? randomBetween(150, 230) : randomBetween(78, 180),
      length: hero ? randomBetween(180, 320) : randomBetween(72, 190),
      width: hero ? randomBetween(1.8, 2.8) : randomBetween(0.7, 1.8),
      delay: initial ? 0 : randomBetween(0, 1.4),
      depth: hero ? randomBetween(0.82, 1) : randomBetween(0.38, 0.92),
      drift: randomBetween(0.38, 0.54),
    }
  }

  function reset(frame: EffectFrame) {
    const count = frame.width <= 700 ? 18 : 34
    meteors = Array.from({ length: count }, (_, index) =>
      createMeteor(frame, true, index < (frame.width <= 700 ? 2 : 4)),
    )
  }

  function update(deltaSeconds: number, frame: EffectFrame) {
    meteors.forEach((meteor, index) => {
      if (meteor.delay > 0) {
        meteor.delay -= deltaSeconds
        return
      }
      meteor.x += meteor.speed * deltaSeconds
      meteor.y += meteor.speed * meteor.drift * deltaSeconds
      if (
        meteor.x - meteor.length > frame.width ||
        meteor.y - meteor.length * meteor.drift > frame.height
      ) {
        meteors[index] = createMeteor(frame, false, index < (frame.width <= 700 ? 2 : 4))
      }
    })
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    meteors.forEach((meteor) => {
      if (meteor.delay > 0) return
      const tailX = meteor.x - meteor.length
      const tailY = meteor.y - meteor.length * meteor.drift
      const normalX = -meteor.drift
      const normalY = 1
      const flare = meteor.width * (2.4 + meteor.depth * 2.8)

      if (meteor.depth > 0.78) {
        const gradient = context.createLinearGradient(tailX, tailY, meteor.x, meteor.y)
        gradient.addColorStop(0, rgba(frame.palette.primary, 0))
        gradient.addColorStop(
          0.72,
          rgba(frame.palette.secondary, frame.palette.faintOpacity * meteor.depth),
        )
        gradient.addColorStop(
          1,
          rgba(frame.palette.primary, frame.palette.softOpacity * meteor.depth),
        )
        context.beginPath()
        context.moveTo(tailX, tailY)
        context.lineTo(meteor.x + normalX * flare, meteor.y + normalY * flare)
        context.lineTo(meteor.x - normalX * flare, meteor.y - normalY * flare)
        context.closePath()
        context.fillStyle = gradient
        context.fill()
      }

      const gradient = context.createLinearGradient(tailX, tailY, meteor.x, meteor.y)
      gradient.addColorStop(0, rgba(frame.palette.primary, 0))
      gradient.addColorStop(
        0.58,
        rgba(frame.palette.secondary, frame.palette.softOpacity * meteor.depth),
      )
      gradient.addColorStop(
        1,
        rgba(frame.palette.primary, frame.palette.strongOpacity * meteor.depth),
      )
      context.beginPath()
      context.moveTo(tailX, tailY)
      context.lineTo(meteor.x, meteor.y)
      context.strokeStyle = gradient
      context.lineWidth = meteor.width
      context.stroke()

      context.beginPath()
      context.arc(meteor.x, meteor.y, meteor.width * 1.8, 0, Math.PI * 2)
      context.fillStyle = rgba(frame.palette.primary, frame.palette.strongOpacity * meteor.depth)
      context.fill()
      context.beginPath()
      context.arc(meteor.x, meteor.y, meteor.width * 5.2, 0, Math.PI * 2)
      context.strokeStyle = rgba(
        frame.palette.primary,
        frame.palette.softOpacity * meteor.depth * 0.5,
      )
      context.stroke()
    })
  }

  return { reset, update, draw }
}

function createTopographicRenderer(): EffectRenderer {
  let elapsed = 0
  let columns = 0
  let rows = 0

  function reset(frame: EffectFrame) {
    columns = frame.width <= 700 ? 18 : 34
    rows = frame.width <= 700 ? 18 : 28
    elapsed = 0
  }

  function update(deltaSeconds: number) {
    elapsed += deltaSeconds
  }

  function terrainHeight(nx: number, depth: number) {
    const ridge = Math.exp(-(((nx + 0.18) / 0.28) ** 2)) * 0.72
    const secondRidge = Math.exp(-(((nx - 0.36) / 0.2) ** 2)) * 0.48
    const waves =
      Math.sin(nx * 8.5 + depth * 4.2 + elapsed * 0.12) * 0.12 +
      Math.cos(nx * 15 - depth * 6.5 - elapsed * 0.08) * 0.055
    return (ridge + secondRidge + waves) * Math.sin(depth * Math.PI) * (0.5 + depth * 0.5)
  }

  function project(nx: number, depth: number, frame: EffectFrame) {
    const horizonY = frame.height * 0.24
    const spread = 0.16 + depth ** 0.9 * 0.72
    const height = terrainHeight(nx, depth)
    return {
      x: frame.width * 0.5 + nx * frame.width * spread,
      y: horizonY + depth ** 1.36 * frame.height * 0.86 - height * frame.height * 0.34,
    }
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    context.save()
    context.lineJoin = 'round'

    for (let row = 0; row <= rows; row += 1) {
      const depth = row / rows
      context.beginPath()
      for (let column = 0; column <= columns; column += 1) {
        const nx = (column / columns) * 2 - 1
        const point = project(nx, depth, frame)
        if (column === 0) context.moveTo(point.x, point.y)
        else context.lineTo(point.x, point.y)
      }
      context.strokeStyle = rgba(
        row % 5 === 0 ? frame.palette.primary : frame.palette.secondary,
        frame.palette.faintOpacity * (0.42 + depth * 0.9),
      )
      context.lineWidth = row % 5 === 0 ? 0.95 : 0.52
      context.stroke()
    }

    for (let column = 0; column <= columns; column += 2) {
      const nx = (column / columns) * 2 - 1
      context.beginPath()
      for (let row = 0; row <= rows; row += 1) {
        const depth = row / rows
        const point = project(nx, depth, frame)
        if (row === 0) context.moveTo(point.x, point.y)
        else context.lineTo(point.x, point.y)
      }
      context.strokeStyle = rgba(frame.palette.secondary, frame.palette.faintOpacity * 0.52)
      context.lineWidth = 0.5
      context.stroke()
    }

    const horizon = context.createLinearGradient(0, 0, frame.width, 0)
    horizon.addColorStop(0, rgba(frame.palette.primary, 0))
    horizon.addColorStop(0.5, rgba(frame.palette.primary, frame.palette.softOpacity * 0.75))
    horizon.addColorStop(1, rgba(frame.palette.primary, 0))
    context.beginPath()
    context.moveTo(0, frame.height * 0.24)
    context.lineTo(frame.width, frame.height * 0.24)
    context.strokeStyle = horizon
    context.lineWidth = 1
    context.stroke()
    context.restore()
  }

  return { reset, update, draw }
}

type CircuitTrace = {
  points: Array<{ x: number; y: number }>
  dashOffset: number
  speed: number
  emphasis: number
}

function createCircuitPulseRenderer(): EffectRenderer {
  let traces: CircuitTrace[] = []

  function reset(frame: EffectFrame) {
    const count = frame.width <= 700 ? 18 : 34
    traces = Array.from({ length: count }, (_, index) => {
      const fromLeft = index % 2 === 0
      const startX = fromLeft
        ? randomBetween(-60, frame.width * 0.2)
        : randomBetween(frame.width * 0.8, frame.width + 60)
      const direction = fromLeft ? 1 : -1
      const y = randomBetween(24, frame.height - 24)
      const firstRun = randomBetween(60, frame.width * 0.28)
      const vertical = randomBetween(-90, 90)
      const secondRun = randomBetween(70, frame.width * 0.34)
      return {
        points: [
          { x: startX, y },
          { x: startX + firstRun * direction, y },
          { x: startX + firstRun * direction, y: y + vertical },
          { x: startX + (firstRun + secondRun) * direction, y: y + vertical },
        ],
        dashOffset: Math.random() * 86,
        speed: randomBetween(8, 20) * direction,
        emphasis: randomBetween(0.65, 1),
      }
    })
  }

  function update(deltaSeconds: number) {
    traces.forEach((trace) => {
      trace.dashOffset += trace.speed * deltaSeconds
    })
  }

  function tracePath(context: CanvasRenderingContext2D, trace: CircuitTrace) {
    context.beginPath()
    trace.points.forEach((point, index) => {
      if (index === 0) context.moveTo(point.x, point.y)
      else context.lineTo(point.x, point.y)
    })
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    context.save()
    context.lineJoin = 'round'
    traces.forEach((trace, index) => {
      tracePath(context, trace)
      context.setLineDash([])
      context.strokeStyle = rgba(frame.palette.secondary, frame.palette.faintOpacity * 0.78)
      context.lineWidth = 0.7
      context.stroke()

      tracePath(context, trace)
      context.setLineDash([14, 72])
      context.lineDashOffset = -trace.dashOffset
      context.strokeStyle = rgba(frame.palette.primary, frame.palette.softOpacity * trace.emphasis)
      context.lineWidth = index % 4 === 0 ? 1.25 : 0.9
      context.stroke()

      trace.points.slice(1, -1).forEach((point) => {
        context.beginPath()
        context.rect(point.x - 1.4, point.y - 1.4, 2.8, 2.8)
        context.fillStyle = rgba(frame.palette.primary, frame.palette.softOpacity * 0.9)
        context.fill()
      })
    })
    context.restore()
  }

  return { reset, update, draw }
}

function createPerspectiveGridRenderer(): EffectRenderer {
  let elapsed = 0

  function reset() {
    elapsed = 0
  }

  function update(deltaSeconds: number) {
    elapsed += deltaSeconds
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    const horizonY = frame.height * 0.36
    const vanishX = frame.width * 0.5
    const bottomY = frame.height + 20
    const columns = frame.width <= 700 ? 10 : 18

    for (let index = -columns; index <= columns; index += 1) {
      const bottomX = vanishX + ((index * frame.width) / columns) * 0.72
      context.beginPath()
      context.moveTo(vanishX, horizonY)
      context.lineTo(bottomX, bottomY)
      context.strokeStyle = rgba(
        frame.palette.secondary,
        frame.palette.faintOpacity * (index % 4 === 0 ? 1.1 : 0.72),
      )
      context.lineWidth = index % 4 === 0 ? 0.9 : 0.55
      context.stroke()
    }

    const rows = 22
    for (let row = 0; row < rows; row += 1) {
      const progress = (row / rows + elapsed * 0.035) % 1
      const eased = progress * progress
      const y = horizonY + eased * (bottomY - horizonY)
      const opacity = frame.palette.faintOpacity * (0.35 + progress * 0.9)
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(frame.width, y)
      context.strokeStyle = rgba(frame.palette.primary, opacity)
      context.lineWidth = progress > 0.78 ? 0.9 : 0.55
      context.stroke()
    }

    context.beginPath()
    context.moveTo(0, horizonY)
    context.lineTo(frame.width, horizonY)
    context.strokeStyle = rgba(frame.palette.primary, frame.palette.softOpacity * 0.55)
    context.lineWidth = 1
    context.stroke()
  }

  return { reset, update, draw }
}

type SpectrumBar = {
  phase: number
  speed: number
  amplitude: number
}

function createSpectrumBarsRenderer(): EffectRenderer {
  let elapsed = 0
  let bars: SpectrumBar[] = []

  function reset(frame: EffectFrame) {
    const count = frame.width <= 700 ? 42 : 86
    bars = Array.from({ length: count }, (_, index) => ({
      phase: index * 0.31 + Math.random() * 0.8,
      speed: randomBetween(0.35, 0.9),
      amplitude: randomBetween(0.35, 1),
    }))
    elapsed = 0
  }

  function update(deltaSeconds: number) {
    elapsed += deltaSeconds
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    const gutter = frame.width <= 700 ? 2 : 3
    const barWidth = frame.width / bars.length
    const centerY = frame.height * 0.56
    const maxHeight = frame.height * 0.38

    bars.forEach((bar, index) => {
      const primaryWave = (Math.sin(elapsed * bar.speed + bar.phase) + 1) / 2
      const secondaryWave = (Math.sin(elapsed * 0.23 - index * 0.18) + 1) / 2
      const height = Math.max(
        2,
        maxHeight * bar.amplitude * (0.18 + primaryWave * 0.55 + secondaryWave * 0.27),
      )
      const x = index * barWidth + gutter / 2
      const opacity = frame.palette.faintOpacity + primaryWave * frame.palette.softOpacity * 0.62
      context.fillStyle = rgba(
        index % 7 === 0 ? frame.palette.primary : frame.palette.secondary,
        opacity,
      )
      context.fillRect(x, centerY - height / 2, Math.max(1, barWidth - gutter), height)
    })
  }

  return { reset, update, draw }
}

function createLissajousRenderer(): EffectRenderer {
  let elapsed = 0

  function reset() {
    elapsed = 0
  }

  function update(deltaSeconds: number) {
    elapsed += deltaSeconds
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    const centerX = frame.width * 0.5
    const centerY = frame.height * 0.52
    const radiusX = frame.width * (frame.width <= 700 ? 0.43 : 0.34)
    const radiusY = frame.height * 0.36

    for (let curve = 0; curve < 4; curve += 1) {
      context.beginPath()
      const phase = elapsed * (0.08 + curve * 0.018) + (curve * Math.PI) / 5
      for (let sample = 0; sample <= 280; sample += 1) {
        const t = (sample / 280) * Math.PI * 2
        const x = centerX + Math.sin((3 + (curve % 2)) * t + phase) * radiusX * (1 - curve * 0.08)
        const y = centerY + Math.sin((2 + ((curve + 1) % 2)) * t) * radiusY * (1 - curve * 0.07)
        if (sample === 0) context.moveTo(x, y)
        else context.lineTo(x, y)
      }
      context.strokeStyle = rgba(
        curve === 0 ? frame.palette.primary : frame.palette.secondary,
        frame.palette.faintOpacity + (3 - curve) * 0.028,
      )
      context.lineWidth = curve === 0 ? 1.05 : 0.62
      context.stroke()
    }
  }

  return { reset, update, draw }
}

type PortalRing = {
  radiusX: number
  radiusY: number
  rotation: number
  speed: number
  dash: number[]
  width: number
}

function createPortalRingsRenderer(): EffectRenderer {
  let elapsed = 0
  let centerX = 0
  let centerY = 0
  let maxRadiusX = 0
  let maxRadiusY = 0
  let rings: PortalRing[] = []

  function reset(frame: EffectFrame) {
    centerX = frame.width * (frame.width <= 700 ? 0.52 : 0.7)
    centerY = frame.height * 0.5
    maxRadiusX = frame.width * (frame.width <= 700 ? 0.58 : 0.52)
    maxRadiusY = frame.height * 0.56
    rings = Array.from({ length: 15 }, (_, index) => {
      const progress = (index + 1) / 15
      const perspective = progress ** 1.55
      return {
        radiusX: maxRadiusX * (0.08 + perspective * 0.92),
        radiusY: maxRadiusY * (0.06 + perspective * 0.94),
        rotation: randomBetween(-0.08, 0.08),
        speed: (index % 2 ? -1 : 1) * randomBetween(0.025, 0.13),
        dash: index % 4 === 0 ? [24, 8, 3, 8] : [5 + index * 0.8, 10 + index * 0.55],
        width: index % 5 === 0 ? 1.55 : 0.72,
      }
    })
    elapsed = 0
  }

  function update(deltaSeconds: number) {
    elapsed += deltaSeconds
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    const isDark = frame.palette.primary[0] > 100
    context.save()
    context.translate(centerX, centerY)

    const apertureX = maxRadiusX * 0.14
    const apertureY = maxRadiusY * 0.12
    const aperture = context.createRadialGradient(0, 0, 0, 0, 0, apertureX)
    aperture.addColorStop(0, isDark ? 'rgba(0, 3, 10, 0.78)' : 'rgba(28, 43, 82, 0.2)')
    aperture.addColorStop(0.72, isDark ? 'rgba(2, 8, 20, 0.46)' : 'rgba(31, 70, 178, 0.08)')
    aperture.addColorStop(1, rgba(frame.palette.primary, 0))
    context.save()
    context.scale(1, apertureY / apertureX)
    context.beginPath()
    context.arc(0, 0, apertureX, 0, Math.PI * 2)
    context.fillStyle = aperture
    context.fill()
    context.restore()

    for (let spoke = 0; spoke < 28; spoke += 1) {
      const angle = (spoke / 28) * Math.PI * 2 + elapsed * 0.025
      const innerX = Math.cos(angle) * apertureX * 0.92
      const innerY = Math.sin(angle) * apertureY * 0.92
      const outerX = Math.cos(angle) * maxRadiusX
      const outerY = Math.sin(angle) * maxRadiusY
      context.beginPath()
      context.moveTo(innerX, innerY)
      context.lineTo(outerX, outerY)
      context.strokeStyle = rgba(
        spoke % 4 === 0 ? frame.palette.primary : frame.palette.secondary,
        frame.palette.faintOpacity * (spoke % 4 === 0 ? 0.82 : 0.36),
      )
      context.lineWidth = spoke % 4 === 0 ? 0.9 : 0.5
      context.stroke()
    }

    rings.forEach((ring, index) => {
      const compression = 1 + Math.sin(elapsed * 0.34 + index * 0.58) * 0.012
      context.save()
      context.rotate(ring.rotation + elapsed * ring.speed)
      context.beginPath()
      context.ellipse(
        0,
        0,
        ring.radiusX * compression,
        ring.radiusY * compression,
        0,
        0,
        Math.PI * 2,
      )
      context.setLineDash(ring.dash)
      context.lineDashOffset = elapsed * ring.speed * 44
      context.strokeStyle = rgba(
        index % 4 === 0 ? frame.palette.primary : frame.palette.secondary,
        frame.palette.faintOpacity * 0.9 + (rings.length - index) * 0.014,
      )
      context.lineWidth = ring.width
      context.stroke()
      context.restore()
    })
    context.setLineDash([])

    context.beginPath()
    context.ellipse(0, 0, apertureX * 1.12, apertureY * 1.12, 0, 0, Math.PI * 2)
    context.strokeStyle = rgba(frame.palette.primary, frame.palette.strongOpacity * 0.9)
    context.lineWidth = 1.6
    context.stroke()
    context.beginPath()
    context.ellipse(0, 0, apertureX * 1.42, apertureY * 1.42, 0, -Math.PI * 0.15, Math.PI * 0.92)
    context.strokeStyle = rgba(frame.palette.primary, frame.palette.softOpacity * 0.92)
    context.lineWidth = 3
    context.stroke()
    context.restore()
  }

  return { reset, update, draw }
}

type CrystalCell = {
  points: Array<{ x: number; y: number }>
  phase: number
}

function createCrystalCellsRenderer(): EffectRenderer {
  let elapsed = 0
  let cells: CrystalCell[] = []

  function reset(frame: EffectFrame) {
    const size = frame.width <= 700 ? 72 : 96
    const columns = Math.ceil(frame.width / size) + 1
    const rows = Math.ceil(frame.height / size) + 1
    const points: Array<Array<{ x: number; y: number }>> = []

    for (let row = 0; row <= rows; row += 1) {
      const rowPoints: Array<{ x: number; y: number }> = []
      points[row] = rowPoints
      for (let column = 0; column <= columns; column += 1) {
        rowPoints[column] = {
          x: column * size + randomBetween(-size * 0.22, size * 0.22),
          y: row * size + randomBetween(-size * 0.22, size * 0.22),
        }
      }
    }

    cells = []
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        const topLeft = points[row]?.[column]
        const topRight = points[row]?.[column + 1]
        const bottomRight = points[row + 1]?.[column + 1]
        const bottomLeft = points[row + 1]?.[column]
        if (!topLeft || !topRight || !bottomRight || !bottomLeft) continue
        cells.push({
          points: [topLeft, topRight, bottomRight, bottomLeft],
          phase: Math.random() * Math.PI * 2,
        })
      }
    }
    elapsed = 0
  }

  function update(deltaSeconds: number) {
    elapsed += deltaSeconds
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    cells.forEach((cell, index) => {
      const pulse = (Math.sin(elapsed * 0.22 + cell.phase) + 1) / 2
      context.beginPath()
      cell.points.forEach((point, pointIndex) => {
        if (pointIndex === 0) context.moveTo(point.x, point.y)
        else context.lineTo(point.x, point.y)
      })
      context.closePath()
      context.fillStyle = rgba(frame.palette.primary, frame.palette.faintOpacity * pulse * 0.24)
      context.fill()
      context.strokeStyle = rgba(
        index % 5 === 0 ? frame.palette.primary : frame.palette.secondary,
        frame.palette.faintOpacity * (0.55 + pulse * 0.45),
      )
      context.lineWidth = index % 5 === 0 ? 0.9 : 0.55
      context.stroke()
    })
  }

  return { reset, update, draw }
}

function createScanlineRenderer(): EffectRenderer {
  let elapsed = 0

  function reset() {
    elapsed = 0
  }

  function update(deltaSeconds: number) {
    elapsed += deltaSeconds
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    const spacing = frame.width <= 700 ? 9 : 8
    const columns = frame.width <= 700 ? 4 : 8
    const columnWidth = frame.width / columns

    for (let y = 0; y <= frame.height; y += spacing) {
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(frame.width, y)
      context.strokeStyle = rgba(
        frame.palette.secondary,
        frame.palette.faintOpacity * (y % (spacing * 5) === 0 ? 0.82 : 0.28),
      )
      context.lineWidth = y % (spacing * 5) === 0 ? 0.7 : 0.45
      context.stroke()
    }

    for (let column = 1; column < columns; column += 1) {
      const x = column * columnWidth
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, frame.height)
      context.strokeStyle = rgba(
        frame.palette.primary,
        frame.palette.faintOpacity * (column % 2 ? 0.5 : 0.78),
      )
      context.setLineDash(column % 2 ? [2, 13] : [])
      context.stroke()
    }
    context.setLineDash([])

    const scannerY = ((elapsed * 68) % (frame.height + 240)) - 120
    const gradient = context.createLinearGradient(0, scannerY - 120, 0, scannerY + 120)
    gradient.addColorStop(0, rgba(frame.palette.primary, 0))
    gradient.addColorStop(0.36, rgba(frame.palette.primary, frame.palette.faintOpacity * 0.62))
    gradient.addColorStop(0.5, rgba(frame.palette.primary, frame.palette.softOpacity * 0.78))
    gradient.addColorStop(0.64, rgba(frame.palette.primary, frame.palette.faintOpacity * 0.62))
    gradient.addColorStop(1, rgba(frame.palette.primary, 0))
    context.fillStyle = gradient
    context.fillRect(0, scannerY - 120, frame.width, 240)

    context.beginPath()
    context.moveTo(0, scannerY)
    context.lineTo(frame.width, scannerY)
    context.strokeStyle = rgba(frame.palette.primary, frame.palette.strongOpacity * 0.9)
    context.lineWidth = 1.4
    context.stroke()

    for (let column = 0; column < columns; column += 1) {
      const phase = elapsed * (0.42 + column * 0.035) + column * 1.7
      const blockY = (Math.sin(phase) * 0.38 + 0.5) * frame.height
      const blockWidth = columnWidth * (0.32 + (column % 3) * 0.12)
      const x = column * columnWidth + 10
      context.fillStyle = rgba(
        frame.palette.primary,
        frame.palette.faintOpacity * (0.7 + (column % 2) * 0.3),
      )
      context.fillRect(x, blockY, blockWidth, 2)
      context.fillRect(x, blockY + 7, blockWidth * 0.58, 1)
      if (column % 2 === 0) {
        context.strokeStyle = rgba(frame.palette.secondary, frame.palette.softOpacity * 0.55)
        context.strokeRect(x, blockY - 18, Math.min(columnWidth - 20, blockWidth * 1.25), 34)
      }
    }

    context.font = '10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    context.textAlign = 'left'
    const labels = ['SCAN // ACTIVE', 'DEPTH 07', 'VECTOR LOCK', 'SYNC 99.8']
    labels.forEach((label, index) => {
      const x = 14 + (index % 2) * Math.max(150, frame.width * 0.42)
      const y = 28 + Math.floor(index / 2) * 24
      if (x < frame.width - 100) {
        context.fillStyle = rgba(frame.palette.primary, frame.palette.softOpacity * 0.78)
        context.fillText(label, x, y)
      }
    })
  }

  return { reset, update, draw }
}

function createRibbonWaveRenderer(): EffectRenderer {
  let elapsed = 0

  function reset() {
    elapsed = 0
  }

  function update(deltaSeconds: number) {
    elapsed += deltaSeconds
  }

  function drawDisc(
    context: CanvasRenderingContext2D,
    frame: EffectFrame,
    radiusX: number,
    radiusY: number,
    rotation: number,
    offset: number,
    opacity: number,
  ) {
    context.save()
    context.rotate(rotation)
    context.beginPath()
    context.ellipse(0, offset, radiusX, radiusY, 0, Math.PI * 0.08, Math.PI * 1.92)
    context.strokeStyle = rgba(frame.palette.primary, opacity)
    context.lineWidth = Math.max(1, radiusY * 0.12)
    context.stroke()
    context.restore()
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    const centerX = frame.width * (frame.width <= 700 ? 0.52 : 0.61)
    const centerY = frame.height * 0.5
    const radiusX = Math.max(frame.width * 0.44, frame.height * 0.7)
    const radiusY = Math.max(24, frame.height * 0.13)
    const rotation = -0.13 + Math.sin(elapsed * 0.055) * 0.025

    context.save()
    context.translate(centerX, centerY)
    context.globalCompositeOperation = 'lighter'

    for (let layer = 5; layer >= 0; layer -= 1) {
      const scale = 1 + layer * 0.1
      drawDisc(
        context,
        frame,
        radiusX * scale,
        radiusY * scale,
        rotation,
        Math.sin(elapsed * 0.12 + layer) * radiusY * 0.06,
        frame.palette.faintOpacity * (0.25 + (5 - layer) * 0.12),
      )
    }

    context.globalCompositeOperation = 'source-over'
    const coreGradient = context.createRadialGradient(0, 0, radiusY * 0.12, 0, 0, radiusY * 2.15)
    coreGradient.addColorStop(0, 'rgba(0, 0, 0, 0.98)')
    coreGradient.addColorStop(0.68, 'rgba(0, 0, 0, 0.94)')
    coreGradient.addColorStop(0.82, rgba(frame.palette.primary, frame.palette.softOpacity * 0.5))
    coreGradient.addColorStop(1, rgba(frame.palette.primary, 0))
    context.fillStyle = coreGradient
    context.beginPath()
    context.arc(0, 0, radiusY * 2.25, 0, Math.PI * 2)
    context.fill()

    context.beginPath()
    context.ellipse(0, 0, radiusX * 0.64, radiusY * 0.62, rotation, 0, Math.PI * 2)
    context.strokeStyle = rgba(frame.palette.primary, frame.palette.strongOpacity * 0.82)
    context.lineWidth = Math.max(1.2, radiusY * 0.07)
    context.stroke()

    const lensRadius = radiusY * 2.4
    context.beginPath()
    context.arc(0, 0, lensRadius, Math.PI * 1.08, Math.PI * 1.92)
    context.strokeStyle = rgba(frame.palette.secondary, frame.palette.softOpacity * 0.72)
    context.lineWidth = 1
    context.stroke()
    context.beginPath()
    context.arc(0, 0, lensRadius, Math.PI * 0.08, Math.PI * 0.92)
    context.strokeStyle = rgba(frame.palette.primary, frame.palette.faintOpacity * 0.9)
    context.stroke()

    context.restore()
  }

  return { reset, update, draw }
}

type ClockRing = {
  radius: number
  ticks: number
  speed: number
  rotation: number
  majorEvery: number
}

function createClockworkRenderer(): EffectRenderer {
  let elapsed = 0
  let centerX = 0
  let centerY = 0
  let baseRadius = 0
  let rings: ClockRing[] = []

  function reset(frame: EffectFrame) {
    centerX = frame.width * (frame.width <= 700 ? 0.68 : 0.79)
    centerY = frame.height * 0.5
    baseRadius = Math.max(frame.width * 0.46, frame.height * 0.62)
    rings = Array.from({ length: 7 }, (_, index) => ({
      radius: baseRadius * (0.22 + index * 0.125),
      ticks: 30 + index * 10,
      speed: (index % 2 === 0 ? 1 : -1) * randomBetween(0.025, 0.085),
      rotation: Math.random() * Math.PI * 2,
      majorEvery: index % 2 === 0 ? 5 : 8,
    }))
    elapsed = 0
  }

  function update(deltaSeconds: number) {
    elapsed += deltaSeconds
  }

  function drawCore(
    context: CanvasRenderingContext2D,
    frame: EffectFrame,
    x: number,
    y: number,
    scale: number,
    opacity: number,
  ) {
    context.save()
    context.translate(x, y)
    context.scale(scale, scale)

    rings.forEach((ring, ringIndex) => {
      const rotation = ring.rotation + elapsed * ring.speed
      const segmentCount = 4 + ringIndex
      for (let segment = 0; segment < segmentCount; segment += 1) {
        const start = rotation + (segment / segmentCount) * Math.PI * 2
        const span = ((Math.PI * 2) / segmentCount) * (ringIndex % 2 === 0 ? 0.58 : 0.34)
        context.beginPath()
        context.arc(0, 0, ring.radius, start, start + span)
        context.strokeStyle = rgba(
          ringIndex % 3 === 0 ? frame.palette.primary : frame.palette.secondary,
          (ringIndex % 3 === 0 ? frame.palette.softOpacity : frame.palette.faintOpacity) * opacity,
        )
        context.lineWidth = (ringIndex % 3 === 0 ? 1.5 : 0.72) / scale
        context.stroke()
      }

      for (let tick = 0; tick < ring.ticks; tick += 1) {
        const angle = rotation + (tick / ring.ticks) * Math.PI * 2
        const major = tick % ring.majorEvery === 0
        const length = major ? 14 : 5
        context.beginPath()
        context.moveTo(
          Math.cos(angle) * (ring.radius - length),
          Math.sin(angle) * (ring.radius - length),
        )
        context.lineTo(Math.cos(angle) * ring.radius, Math.sin(angle) * ring.radius)
        context.strokeStyle = rgba(
          major ? frame.palette.primary : frame.palette.secondary,
          (major ? frame.palette.softOpacity * 1.1 : frame.palette.faintOpacity * 0.78) * opacity,
        )
        context.lineWidth = (major ? 1.2 : 0.52) / scale
        context.stroke()
      }
    })

    const coreRadius = baseRadius * 0.14
    context.beginPath()
    context.arc(0, 0, coreRadius, 0, Math.PI * 2)
    context.fillStyle = rgba(frame.palette.secondary, frame.palette.faintOpacity * 0.75 * opacity)
    context.fill()
    context.strokeStyle = rgba(frame.palette.primary, frame.palette.strongOpacity * 0.88 * opacity)
    context.lineWidth = 1.4 / scale
    context.stroke()

    const handAngle = elapsed * 0.11
    const handAngleFast = -elapsed * 0.27 + Math.PI * 0.46
    ;[handAngle, handAngleFast].forEach((angle, index) => {
      context.beginPath()
      context.moveTo(
        Math.cos(angle + Math.PI) * coreRadius * 0.35,
        Math.sin(angle + Math.PI) * coreRadius * 0.35,
      )
      context.lineTo(
        Math.cos(angle) * baseRadius * (index === 0 ? 0.64 : 0.42),
        Math.sin(angle) * baseRadius * (index === 0 ? 0.64 : 0.42),
      )
      context.strokeStyle = rgba(
        index === 0 ? frame.palette.primary : frame.palette.secondary,
        frame.palette.softOpacity * opacity,
      )
      context.lineWidth = (index === 0 ? 1.25 : 0.8) / scale
      context.stroke()
    })

    context.restore()
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    drawCore(context, frame, centerX, centerY, 1, 1)
    drawCore(context, frame, frame.width * 0.08, frame.height * 0.22, 0.32, 0.8)
    drawCore(context, frame, frame.width * 0.22, frame.height * 0.82, 0.22, 0.62)

    context.beginPath()
    context.moveTo(frame.width * 0.08, frame.height * 0.22)
    context.lineTo(centerX, centerY)
    context.lineTo(frame.width * 0.22, frame.height * 0.82)
    context.strokeStyle = rgba(frame.palette.secondary, frame.palette.faintOpacity * 0.65)
    context.setLineDash([3, 10])
    context.stroke()
    context.setLineDash([])

    context.font = '10px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace'
    context.fillStyle = rgba(frame.palette.primary, frame.palette.softOpacity * 0.82)
    context.fillText('TEMPORAL CORE / 07', 16, frame.height - 20)
  }

  return { reset, update, draw }
}

type HyperCube = {
  xRatio: number
  yRatio: number
  size: number
  phase: number
  speed: number
  depth: number
}

function createMoireRenderer(): EffectRenderer {
  let elapsed = 0
  let cubes: HyperCube[] = []

  function reset(frame: EffectFrame) {
    const columns = frame.width <= 700 ? 3 : 5
    const rows = frame.width <= 700 ? 4 : 3
    const baseSize = Math.min(frame.width / columns, frame.height / rows)
    cubes = []
    for (let row = 0; row < rows; row += 1) {
      for (let column = 0; column < columns; column += 1) {
        cubes.push({
          xRatio: (column + 0.5 + (row % 2) * 0.18) / columns,
          yRatio: (row + 0.5) / rows,
          size: baseSize * randomBetween(0.48, 0.78),
          phase: Math.random() * Math.PI * 2,
          speed: randomBetween(0.045, 0.12) * ((row + column) % 2 === 0 ? 1 : -1),
          depth: randomBetween(0.45, 1),
        })
      }
    }
    elapsed = 0
  }

  function update(deltaSeconds: number) {
    elapsed += deltaSeconds
  }

  function rotatePoint(x: number, y: number, z: number, angleX: number, angleY: number) {
    const cosY = Math.cos(angleY)
    const sinY = Math.sin(angleY)
    const x1 = x * cosY - z * sinY
    const z1 = x * sinY + z * cosY
    const cosX = Math.cos(angleX)
    const sinX = Math.sin(angleX)
    return {
      x: x1,
      y: y * cosX - z1 * sinX,
      z: y * sinX + z1 * cosX,
    }
  }

  function draw(context: CanvasRenderingContext2D, frame: EffectFrame) {
    const vertices = [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, -1],
      [-1, -1, 1],
      [1, -1, 1],
      [1, 1, 1],
      [-1, 1, 1],
    ]
    const edges = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 0],
      [4, 5],
      [5, 6],
      [6, 7],
      [7, 4],
      [0, 4],
      [1, 5],
      [2, 6],
      [3, 7],
    ]

    cubes.forEach((cube, cubeIndex) => {
      const angle = cube.phase + elapsed * cube.speed
      const projected = vertices.map(([x = 0, y = 0, z = 0]) => {
        const point = rotatePoint(x, y, z, angle * 0.72, angle)
        const perspective = 1 / (1.8 - point.z * 0.18)
        return {
          x: frame.width * cube.xRatio + point.x * cube.size * perspective,
          y: frame.height * cube.yRatio + point.y * cube.size * perspective,
          z: point.z,
        }
      })

      edges.forEach(([fromIndex = 0, toIndex = 0], edgeIndex) => {
        const from = projected[fromIndex]
        const to = projected[toIndex]
        if (!from || !to) return
        const depth = ((from.z + to.z) / 2 + 1.8) / 3.6
        context.beginPath()
        context.moveTo(from.x, from.y)
        context.lineTo(to.x, to.y)
        context.strokeStyle = rgba(
          edgeIndex % 4 === 0 ? frame.palette.primary : frame.palette.secondary,
          frame.palette.faintOpacity * cube.depth * (0.82 + depth * 1.25),
        )
        context.lineWidth = edgeIndex % 4 === 0 ? 1 : 0.58
        context.stroke()
      })

      if (cubeIndex % 3 === 0) {
        const centerPulse = 1.2 + Math.sin(elapsed * 0.6 + cube.phase) * 0.5
        context.beginPath()
        context.arc(
          frame.width * cube.xRatio,
          frame.height * cube.yRatio,
          centerPulse,
          0,
          Math.PI * 2,
        )
        context.fillStyle = rgba(frame.palette.primary, frame.palette.strongOpacity * 0.72)
        context.fill()
      }
    })
  }

  return { reset, update, draw }
}

/** 根据效果标识创建对应的独立渲染器实例。 */
export function createEffectRenderer(effectId: BackgroundEffectId): EffectRenderer {
  switch (effectId) {
    case 'constellation':
      return createConstellationRenderer()
    case 'galaxy-vortex':
      return createGalaxyVortexRenderer()
    case 'data-rain':
      return createDataRainRenderer()
    case 'radar':
      return createRadarRenderer()
    case 'flow-field':
      return createFlowFieldRenderer()
    case 'orbit-lines':
      return createOrbitLinesRenderer()
    case 'hex-grid':
      return createHexGridRenderer()
    case 'wave-ripples':
      return createWaveRipplesRenderer()
    case 'meteor-shower':
      return createMeteorShowerRenderer()
    case 'topographic':
      return createTopographicRenderer()
    case 'circuit-pulse':
      return createCircuitPulseRenderer()
    case 'perspective-grid':
      return createPerspectiveGridRenderer()
    case 'spectrum-bars':
      return createSpectrumBarsRenderer()
    case 'lissajous':
      return createLissajousRenderer()
    case 'portal-rings':
      return createPortalRingsRenderer()
    case 'crystal-cells':
      return createCrystalCellsRenderer()
    case 'scanline':
      return createScanlineRenderer()
    case 'ribbon-wave':
      return createRibbonWaveRenderer()
    case 'clockwork':
      return createClockworkRenderer()
    case 'moire':
      return createMoireRenderer()
  }
}
