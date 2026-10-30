import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react'
import type { OfficeMap, OnlineUser, Desk, SpeechBubble, InteractableObject } from '../../types'
import { findPath } from '../../data/officeMap'
import { drawAvatar } from '../../utils/pixelArt'
import { drawAtmosphere, drawEnvTile } from '../../utils/envArt'
import { inRange, interactionDestination, objectCells, rankNearby } from '../../utils/interactions'
import { drawBrewingMark, drawHeldItem } from '../../game/barista/carry'

interface GameMapProps {
  map: OfficeMap
  onlineUsers: OnlineUser[]
  currentUserId: string
  onDeskClick: (desk: Desk) => void
  onAvatarClick: (user: OnlineUser) => void
  onUserMove: (gridX: number, gridY: number) => void
  currentUserPosition: { gridX: number; gridY: number }
  focusSession?: { duration: number; endsAt: string; paused: boolean } | null
  userDeskPosition?: { gridX: number; gridY: number } | null
  speechBubbles?: SpeechBubble[]
  onInteract?: (interactable: InteractableObject) => void
  /** Scenery only: no walking, prompts, or keyboard control. */
  decorative?: boolean
  /** Pause movement while a menu is open. */
  suspendInput?: boolean
  fireplaceLit?: boolean
  debateMarker?: { x: number; y: number; text: string } | null
}

const TILE_SIZE = 48

export default function GameMap({
  map, onlineUsers, currentUserId, onAvatarClick,
  onUserMove, currentUserPosition, focusSession, userDeskPosition, speechBubbles = [], onInteract,
  decorative = false, suspendInput = false, fireplaceLit = true, debateMarker = null,
}: GameMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 })
  const [cameraX, setCameraX] = useState(0)
  const [cameraY, setCameraY] = useState(0)
  const [hoveredTile, setHoveredTile] = useState<{ x: number; y: number } | null>(null)
  const [cycle, setCycle] = useState(0)
  const [facing, setFacing] = useState({ x: 0, y: 1 })
  const avatarOffsetsRef = useRef<Record<string, number>>({})
  const walkTimers = useRef<number[]>([])
  const prevPos = useRef(currentUserPosition)

  const interactables = map.interactables ?? []
  const nearby = useMemo(
    () => decorative ? [] : rankNearby(map.tiles, interactables, currentUserPosition.gridX, currentUserPosition.gridY, facing),
    [decorative, map.tiles, interactables, currentUserPosition.gridX, currentUserPosition.gridY, facing],
  )
  const nearbyKey = nearby.map(obj => obj.id).join('|')
  useEffect(() => { setCycle(0) }, [nearbyKey])
  const nearbyInteractable = nearby.length ? nearby[cycle % nearby.length] : null

  useEffect(() => {
    const dx = currentUserPosition.gridX - prevPos.current.gridX
    const dy = currentUserPosition.gridY - prevPos.current.gridY
    if (dx || dy) setFacing({ x: Math.sign(dx), y: dy === 0 ? 0 : Math.sign(dy) })
    prevPos.current = currentUserPosition
  }, [currentUserPosition])

  const cancelWalk = useCallback(() => {
    walkTimers.current.forEach(id => window.clearTimeout(id))
    walkTimers.current = []
  }, [])

  const walkTo = useCallback((obj: InteractableObject) => {
    const dest = interactionDestination(map.tiles, obj, currentUserPosition.gridX, currentUserPosition.gridY)
    if (!dest) return
    if (inRange(map.tiles, obj, currentUserPosition.gridX, currentUserPosition.gridY) && dest.x === currentUserPosition.gridX && dest.y === currentUserPosition.gridY) {
      onInteract?.(obj)
      return
    }
    if (inRange(map.tiles, obj, currentUserPosition.gridX, currentUserPosition.gridY)) {
      onInteract?.(obj)
      return
    }
    const path = findPath(map.tiles, currentUserPosition.gridX, currentUserPosition.gridY, dest.x, dest.y)
    if (path.length < 2) return
    cancelWalk()
    const last = path[path.length - 1]
    path.slice(1).forEach((step, i) => {
      const timer = window.setTimeout(() => {
        onUserMove(step.x, step.y)
        if (step.x === last.x && step.y === last.y) onInteract?.(obj)
      }, i * 120)
      walkTimers.current.push(timer)
    })
  }, [map.tiles, currentUserPosition, onInteract, onUserMove, cancelWalk])

  // Scale factor so the map always covers the entire canvas (like CSS background-size: cover).
  // Uses max of both ratios so the map is never smaller than the canvas in either dimension.
  const mapScale = useMemo(() => {
    const mapW = map.width * TILE_SIZE
    const mapH = map.height * TILE_SIZE
    const scale = Math.max(containerSize.w / mapW, containerSize.h / mapH)
    return Math.max(0.25, Math.min(scale, 3.0))
  }, [containerSize, map.width, map.height])

  // Find the closest non-current user within 2 tiles (for Enter-to-interact)
  // Suppressed during focus mode — no one can disturb you
  const nearbyUser = useMemo(() => {
    if (focusSession) return null
    let closest: OnlineUser | null = null
    let closestDist = Infinity
    for (const u of onlineUsers) {
      if (u.isCurrentUser) continue
      const dx = u.position.gridX - currentUserPosition.gridX
      const dy = u.position.gridY - currentUserPosition.gridY
      const dist = Math.sqrt(dx * dx + dy * dy)
      if (dist <= 2 && dist < closestDist) {
        closest = u
        closestDist = dist
      }
    }
    return closest
  }, [onlineUsers, currentUserPosition, focusSession])

  const animFrameRef = useRef<number>(0)
  const tickRef = useRef(0)
  const renderRef = useRef<() => void>(() => {})

  // Track container size with ResizeObserver so canvas always fills it
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setContainerSize({ w: Math.round(width), h: Math.round(height) })
      }
    })
    ro.observe(el)
    const rect = el.getBoundingClientRect()
    setContainerSize({ w: Math.round(rect.width), h: Math.round(rect.height) })
    return () => ro.disconnect()
  }, [])

  // Animation + render loop: update avatar bob offsets and redraw every frame
  useEffect(() => {
    const animate = () => {
      tickRef.current++
      const offsets: Record<string, number> = {}
      onlineUsers.forEach(u => {
        offsets[u.user.id] = Math.sin(tickRef.current * 0.08 + u.user.id.charCodeAt(0) * 0.5) * 1.5
      })
      avatarOffsetsRef.current = offsets
      renderRef.current()
      animFrameRef.current = requestAnimationFrame(animate)
    }
    animFrameRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animFrameRef.current)
  }, [onlineUsers])

  // Center camera on current user in world-pixel coordinates.
  // The effective viewport in world pixels = canvas pixels / mapScale.
  // When map fits inside effective viewport, center it (negative camera offset).
  useEffect(() => {
    const { w, h } = containerSize
    const cx = currentUserPosition.gridX * TILE_SIZE + TILE_SIZE / 2
    const cy = currentUserPosition.gridY * TILE_SIZE + TILE_SIZE / 2
    const mapW = map.width * TILE_SIZE
    const mapH = map.height * TILE_SIZE
    const viewW = w / mapScale  // visible world pixels
    const viewH = h / mapScale
    if (mapW <= viewW) {
      setCameraX(-Math.round((viewW - mapW) / 2))
    } else {
      setCameraX(Math.max(0, Math.min(cx - viewW / 2, mapW - viewW)))
    }
    if (mapH <= viewH) {
      setCameraY(-Math.round((viewH - mapH) / 2))
    } else {
      setCameraY(Math.max(0, Math.min(cy - viewH / 2, mapH - viewH)))
    }
  }, [currentUserPosition, map.width, map.height, containerSize, mapScale])

  // Render — canvas sized to container, ctx translated for camera
  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const avatarOffsets = avatarOffsetsRef.current
    const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const tick = motion ? tickRef.current : 0
    const theme = map.theme ?? 'classic'
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#0F1821'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    ctx.scale(mapScale, mapScale)
    ctx.translate(-cameraX, -cameraY)

    // Draw tiles
    for (let row = 0; row < map.height; row++) {
      for (let col = 0; col < map.width; col++) {
        const tile = map.tiles[row][col]
        const x = col * TILE_SIZE
        const y = row * TILE_SIZE
        drawEnvTile(ctx, tile, x, y, TILE_SIZE, theme, tick, fireplaceLit)
      }
    }
    drawAtmosphere(ctx, theme, map.width, map.height, TILE_SIZE, tick)

    if (hoveredTile) {
      const hovered = interactables.find(obj => objectCells(obj).some(c => c.x === hoveredTile.x && c.y === hoveredTile.y))
      if (!hovered) {
        const hx = hoveredTile.x * TILE_SIZE
        const hy = hoveredTile.y * TILE_SIZE
        ctx.fillStyle = 'rgba(101, 139, 134, 0.18)'
        ctx.fillRect(hx, hy, TILE_SIZE, TILE_SIZE)
      }
    }

    // Desk highlights
    for (const desk of map.desks) {
      const dx = desk.gridX * TILE_SIZE
      const dy = desk.gridY * TILE_SIZE
      if (desk.isAvailable) {
        ctx.fillStyle = 'rgba(227, 183, 117, 0.2)'
        ctx.fillRect(dx, dy, TILE_SIZE, TILE_SIZE)
        ctx.strokeStyle = 'rgba(227, 183, 117, 0.5)'
        ctx.lineWidth = 1.5
        ctx.setLineDash([4, 3])
        ctx.strokeRect(dx + 1, dy + 1, TILE_SIZE - 2, TILE_SIZE - 2)
        ctx.setLineDash([])
      }
      // Nameplate
      if (!desk.isAvailable && desk.ownerName) {
        const shortName = desk.ownerName.split(' ')[0].slice(0, 8)
        ctx.font = '10px monospace'
        const nameW = ctx.measureText(shortName).width
        const lblW = nameW + 8, lblH = 14
        const lblX = dx + (TILE_SIZE - lblW) / 2
        const lblY = dy + (TILE_SIZE - lblH) / 2
        ctx.fillStyle = 'rgba(25,35,49,0.9)'
        ctx.fillRect(lblX, lblY, lblW, lblH)
        ctx.strokeStyle = desk.ownerId === currentUserId ? 'rgba(227,183,117,0.8)' : 'rgba(101,139,134,0.6)'
        ctx.lineWidth = 1
        ctx.strokeRect(lblX, lblY, lblW, lblH)
        ctx.fillStyle = desk.ownerId === currentUserId ? '#E3B775' : '#F2E8D8'
        ctx.textAlign = 'center'
        ctx.fillText(shortName, dx + TILE_SIZE / 2, lblY + lblH - 3)
        ctx.textAlign = 'left'
      }
    }

    // Focus mode forcefield — draw before avatars so it renders underneath
    if (focusSession) {
      const focUser = onlineUsers.find(u => u.isCurrentUser)
      if (focUser) {
        const fx = focUser.position.gridX * TILE_SIZE + TILE_SIZE / 2
        const fy = focUser.position.gridY * TILE_SIZE + TILE_SIZE / 2
        const tick = tickRef.current
        const pulse = 0.6 + Math.sin(tick * 0.04) * 0.4
        // Outer pulsing rings
        for (let ring = 0; ring < 3; ring++) {
          const r = TILE_SIZE * (0.72 + ring * 0.22) + Math.sin(tick * 0.03 + ring) * 3
          ctx.beginPath()
          ctx.arc(fx, fy, r, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(101,190,160,${pulse * (0.75 - ring * 0.2)})`
          ctx.lineWidth = 2 - ring * 0.4
          ctx.stroke()
        }
        // Inner glow fill
        const grd = ctx.createRadialGradient(fx, fy, 0, fx, fy, TILE_SIZE * 0.9)
        grd.addColorStop(0, `rgba(101,190,160,${pulse * 0.18})`)
        grd.addColorStop(1, 'rgba(101,190,160,0)')
        ctx.beginPath()
        ctx.arc(fx, fy, TILE_SIZE * 0.9, 0, Math.PI * 2)
        ctx.fillStyle = grd
        ctx.fill()
        // Claimed desk highlight
        if (userDeskPosition) {
          const ddx = userDeskPosition.gridX * TILE_SIZE
          const ddy = userDeskPosition.gridY * TILE_SIZE
          ctx.strokeStyle = `rgba(101,139,134,${pulse * 0.5})`
          ctx.lineWidth = 1.5
          ctx.setLineDash([3, 3])
          ctx.strokeRect(ddx + 2, ddy + 2, TILE_SIZE - 4, TILE_SIZE - 4)
          ctx.setLineDash([])
          ctx.fillStyle = `rgba(101,139,134,${pulse * 0.08})`
          ctx.fillRect(ddx + 2, ddy + 2, TILE_SIZE - 4, TILE_SIZE - 4)
        }
      }
    }

    // Draw avatars + carried items
    for (const ou of onlineUsers) {
      const px = ou.position.gridX * TILE_SIZE + TILE_SIZE / 2
      const py = ou.position.gridY * TILE_SIZE + TILE_SIZE / 2
      const bobOffset = ou.seated ? 6 : (avatarOffsets[ou.user.id] || 0)
      drawAvatar(
        ctx, px, py, ou.user.avatar,
        ou.isCurrentUser ? 'You' : ou.user.name.split(' ')[0],
        ou.user.status,
        ou.isCurrentUser,
        !!ou.focusSession,
        !!ou.coffeeBreak,
        bobOffset
      )
      // Draw carried item next to avatar's right hand
      if (ou.brewing) drawBrewingMark(ctx, px - 2, py + bobOffset - 36, tick)
      if (ou.gaming) {
        ctx.fillStyle = '#66765C'
        ctx.fillRect(px - 6, py + bobOffset - 30, 12, 5)
        ctx.fillStyle = '#F7F5EF'
        ctx.fillRect(px - 4, py + bobOffset - 29, 2, 2)
        ctx.fillRect(px + 2, py + bobOffset - 29, 2, 2)
      }
      if (ou.carriedItem) {
        const ix = Math.round(px + 12)
        const iy = Math.round(py + bobOffset + 10)
        drawHeldItem(ctx, ou.carriedItem, ix, iy, !!ou.sipping)
      }
    }

    // Speech bubbles above avatars
    if (speechBubbles.length > 0) {
      const now = Date.now()
      for (const ou of onlineUsers) {
        const bubble = speechBubbles.find(b => b.userId === ou.user.id && b.expiresAt > now)
        if (!bubble) continue

        const px = ou.position.gridX * TILE_SIZE + TILE_SIZE / 2
        const py = ou.position.gridY * TILE_SIZE + TILE_SIZE / 2
        const bob = avatarOffsets[ou.user.id] || 0
        const remaining = bubble.expiresAt - now
        const alpha = remaining > 1000 ? 1 : Math.max(0, remaining / 1000)

        if (bubble.type === 'reaction') {
          // Large emoji floating and bobbing
          ctx.globalAlpha = alpha
          ctx.font = '20px serif'
          ctx.textAlign = 'center'
          const floatY = py + bob - 58 - Math.sin(tickRef.current * 0.12) * 3
          ctx.fillText(bubble.text, Math.round(px), Math.round(floatY))
          ctx.globalAlpha = 1
          ctx.textAlign = 'left'
        } else {
          const maxLen = 30
          const display = bubble.text.length > maxLen ? bubble.text.slice(0, maxLen) + '…' : bubble.text
          ctx.font = 'bold 12px monospace'
          const textW = ctx.measureText(display).width
          const pad = 7
          const bw = Math.max(textW + pad * 2, 50)
          const bh = 22
          const bx = Math.round(px - bw / 2)
          // Place bubble above the avatar name label (~28px above center)
          const by = Math.round(py + bob - 28 - bh - 12)
          const tailX = Math.round(px)
          const tailY = by + bh

          const isFocus = bubble.type === 'status' && bubble.text.includes('🎧')
          const isBreak = bubble.type === 'status' && bubble.text.includes('☕')
          const bgColor = isFocus ? 'rgba(101,190,160,0.92)' : isBreak ? 'rgba(184,107,79,0.92)' : 'rgba(25,35,49,0.92)'
          const borderColor = isFocus ? 'rgba(101,190,160,0.6)' : isBreak ? 'rgba(184,107,79,0.6)' : 'rgba(242,232,216,0.3)'

          ctx.globalAlpha = alpha

          // Bubble body
          ctx.fillStyle = bgColor
          ctx.beginPath()
          if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 3)
          else ctx.rect(bx, by, bw, bh)
          ctx.fill()

          // Border
          ctx.strokeStyle = borderColor
          ctx.lineWidth = 0.75
          ctx.beginPath()
          if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 3)
          else ctx.rect(bx, by, bw, bh)
          ctx.stroke()

          // Tail triangle
          ctx.fillStyle = bgColor
          ctx.beginPath()
          ctx.moveTo(tailX - 3, tailY)
          ctx.lineTo(tailX + 3, tailY)
          ctx.lineTo(tailX, tailY + 4)
          ctx.closePath()
          ctx.fill()

          // Text
          ctx.fillStyle = '#F2E8D8'
          ctx.font = 'bold 12px monospace'
          ctx.textAlign = 'center'
          ctx.fillText(display, Math.round(px), by + bh - 5)
          ctx.textAlign = 'left'

          ctx.globalAlpha = 1
        }
      }
    }

    // Outline the object Enter will use. The wording sits in a DOM prompt so it
    // does not cover avatar names.
    if (!decorative && nearbyInteractable) {
      ctx.save()
      ctx.strokeStyle = 'rgba(101,190,160,0.85)'
      ctx.lineWidth = 2
      for (const cell of objectCells(nearbyInteractable)) {
        ctx.strokeRect(cell.x * TILE_SIZE + 3, cell.y * TILE_SIZE + 3, TILE_SIZE - 6, TILE_SIZE - 6)
      }
      ctx.restore()
    }

    // Interaction bubble over nearby user's head
    if (!decorative && nearbyUser) {
      const npx = nearbyUser.position.gridX * TILE_SIZE + TILE_SIZE / 2
      const npy = nearbyUser.position.gridY * TILE_SIZE - 4
      const name = nearbyUser.user.name.split(' ')[0]
      const label = `↑ Enter · ${name}`
      ctx.font = 'bold 12px monospace'
      const textW = ctx.measureText(label).width
      const pad = 7
      const bw = textW + pad * 2
      const bh = 20
      const bx = npx - bw / 2
      const by = npy - bh - 6
      // pulse the border alpha
      const pulse = 0.7 + Math.sin(tickRef.current * 0.06) * 0.3
      ctx.fillStyle = 'rgba(25,35,49,0.92)'
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 4)
      else ctx.rect(bx, by, bw, bh)
      ctx.fill()
      ctx.strokeStyle = `rgba(227,183,117,${pulse})`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      if (ctx.roundRect) ctx.roundRect(bx, by, bw, bh, 4)
      else ctx.rect(bx, by, bw, bh)
      ctx.stroke()
      ctx.fillStyle = '#E3B775'
      ctx.textAlign = 'center'
      ctx.fillText(label, npx, by + bh - 5)
      ctx.textAlign = 'left'
    }

    // Area labels — driven by map.areaLabels when present, fallback hardcoded
    ctx.font = 'bold 10px monospace'
    ctx.fillStyle = 'rgba(242,232,216,0.35)'
    ctx.textAlign = 'center'
    if (map.areaLabels && map.areaLabels.length > 0) {
      for (const lbl of map.areaLabels) {
        ctx.fillText(lbl.text, lbl.gridX * TILE_SIZE, lbl.gridY * TILE_SIZE + TILE_SIZE * 0.5)
      }
    } else {
      ctx.fillText('WORKSPACE', 6 * TILE_SIZE, 0.5 * TILE_SIZE)
      ctx.fillText('GAMES ROOM', 19 * TILE_SIZE, 0.5 * TILE_SIZE)
      ctx.fillText('LOUNGE', 6 * TILE_SIZE, 13 * TILE_SIZE)
      ctx.fillText('KITCHEN', 18 * TILE_SIZE, 13 * TILE_SIZE)
    }
    ctx.textAlign = 'left'

    if (debateMarker) {
      ctx.font = 'bold 10px monospace'
      ctx.fillStyle = '#F2E8D8'
      ctx.textAlign = 'center'
      const text = debateMarker.text.slice(0, 28)
      ctx.fillText(text, debateMarker.x * TILE_SIZE + TILE_SIZE / 2, debateMarker.y * TILE_SIZE - 8)
      ctx.textAlign = 'left'
    }

    ctx.restore()
  }, [map, onlineUsers, cameraX, cameraY, hoveredTile, currentUserId, focusSession, userDeskPosition, nearbyUser, mapScale, speechBubbles, nearbyInteractable, nearby, decorative, interactables, fireplaceLit, debateMarker])

  // Keep renderRef current so the RAF loop always calls the latest render
  useEffect(() => { renderRef.current = render }, [render])

  // Keyboard movement + Enter-to-interact
  useEffect(() => {
    if (decorative) return
    const handler = (e: KeyboardEvent) => {
      // Ignore keyboard shortcuts when typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable) return

      if (e.key === 'Tab') {
        if (tag === 'BUTTON' || tag === 'A' || tag === 'SELECT') return
        if (nearby.length > 1) {
          e.preventDefault()
          setCycle(c => c + 1)
        }
        return
      }
      if (e.key === 'Escape') {
        cancelWalk()
        return
      }

      if (e.key === 'Enter') {
        if (tag === 'BUTTON' || tag === 'A') return
        if (suspendInput) return
        if (nearbyInteractable && onInteract) {
          e.preventDefault()
          onInteract(nearbyInteractable)
          return
        }
        if (nearbyUser) {
          e.preventDefault()
          onAvatarClick(nearbyUser)
          return
        }
      }
      if (!['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return
      e.preventDefault()
      if (focusSession || suspendInput) return
      cancelWalk()
      const { gridX, gridY } = currentUserPosition
      const moves: Record<string, [number,number]> = {
        ArrowUp: [gridX, gridY - 1], ArrowDown: [gridX, gridY + 1],
        ArrowLeft: [gridX - 1, gridY], ArrowRight: [gridX + 1, gridY],
      }
      const [nx, ny] = moves[e.key]
      if (nx >= 0 && nx < map.width && ny >= 0 && ny < map.height) {
        if (map.tiles[ny][nx].walkable) onUserMove(nx, ny)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [currentUserPosition, map, onUserMove, nearbyUser, onAvatarClick, nearbyInteractable, nearby.length, onInteract, focusSession, decorative, suspendInput, cancelWalk])

  const getGridPos = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    // Divide by mapScale to convert from canvas pixels to world pixels
    const worldX = (clientX - rect.left) / mapScale + cameraX
    const worldY = (clientY - rect.top) / mapScale + cameraY
    return {
      gridX: Math.floor(worldX / TILE_SIZE),
      gridY: Math.floor(worldY / TILE_SIZE),
    }
  }, [cameraX, cameraY, mapScale])

  const handleClick = useCallback((e: React.MouseEvent) => {
    const pos = getGridPos(e.clientX, e.clientY)
    if (!pos) return
    const { gridX, gridY } = pos

    // Check avatar click — blocked during focus mode
    if (!focusSession && !suspendInput) {
      for (const ou of onlineUsers) {
        if (ou.position.gridX === gridX && ou.position.gridY === gridY && !ou.isCurrentUser) {
          onAvatarClick(ou)
          return
        }
      }
    }

    const clicked = interactables.find(obj => objectCells(obj).some(c => c.x === gridX && c.y === gridY))
    if (clicked && !focusSession && !suspendInput) {
      walkTo(clicked)
      return
    }

    // Walk to tile — blocked during focus mode
    if (!focusSession && !suspendInput && gridX >= 0 && gridX < map.width && gridY >= 0 && gridY < map.height) {
      if (map.tiles[gridY][gridX].walkable) {
        cancelWalk()
        const path = findPath(map.tiles, currentUserPosition.gridX, currentUserPosition.gridY, gridX, gridY)
        if (path.length > 1) {
          path.slice(1).forEach((step, i) => {
            const timer = window.setTimeout(() => onUserMove(step.x, step.y), i * 120)
            walkTimers.current.push(timer)
          })
        }
      }
    }
  }, [getGridPos, onlineUsers, map, onAvatarClick, onUserMove, currentUserPosition, focusSession, interactables, walkTo, cancelWalk, suspendInput])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pos = getGridPos(e.clientX, e.clientY)
    if (!pos) { setHoveredTile(null); return }
    if (pos.gridY < 0 || pos.gridX < 0 || pos.gridY >= map.height || pos.gridX >= map.width) {
      setHoveredTile(null)
      return
    }
    setHoveredTile({ x: pos.gridX, y: pos.gridY })
  }, [getGridPos, map])


  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden w-full h-full"
    >
      <canvas
        ref={canvasRef}
        width={containerSize.w}
        height={containerSize.h}
        onClick={handleClick}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredTile(null)}
        className={decorative ? 'pixel-art' : 'pixel-art canvas-walkable'}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated',
        }}
        tabIndex={decorative ? -1 : 0}
        aria-hidden={decorative || undefined}
        aria-label={decorative ? undefined : 'Office map. Click an object to walk over and use it. Arrow keys move. Enter uses what is in front of you.'}
      />
      {!decorative && nearbyInteractable && (
        <div className="absolute top-14 left-1/2 z-20 -translate-x-1/2 pointer-events-none rounded-md border border-[#65BE98]/70 bg-[#192331]/92 px-3 py-1.5 font-mono text-[13px] text-[#65BE98]">
          {nearby.length > 1 ? `${nearbyInteractable.prompt}  ·  Tab for more` : nearbyInteractable.prompt}
        </div>
      )}
      {!decorative && (
        <p className="sr-only" aria-live="polite">
          {nearbyInteractable ? `${nearbyInteractable.label}. ${nearbyInteractable.prompt}` : 'Nothing in reach.'}
        </p>
      )}
    </div>
  )
}
