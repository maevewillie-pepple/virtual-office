/**
 * Shared office art direction
 * ---------------------------
 * Tile: 48px. Perspective: top-down with a short front face.
 * Light: upper-left. Shadow: lower-right. Outline: 1px ink.
 * Furniture is drawn on the room's real floor (tile.base).
 * Nearest-neighbour scaling is set by the map renderer.
 * Motion is driven by `tick`; pass 0 when reduced-motion is on.
 */
import type { OfficeArtTheme, Tile, TileType } from '../types'

type Theme = OfficeArtTheme

function R(n: number) { return Math.round(n) }

function wallPalette(theme: Theme) {
  switch (theme) {
    case 'library': return { body: '#4A3428', cap: '#6B4C36', skirt: '#2A1C14', line: '#5C4030' }
    case 'loft':    return { body: '#E7E1D6', cap: '#F6F2EA', skirt: '#C9C1B4', line: '#D5CEC3' }
    case 'studio':  return { body: '#D9CDB6', cap: '#EADFCB', skirt: '#8A6844', line: '#C9B89A' }
    case 'lab':     return { body: '#2A3140', cap: '#3A4456', skirt: '#161C28', line: '#3E6E74' }
    default:        return { body: '#CDBFA6', cap: '#E6D9C6', skirt: '#6E5844', line: '#B7A68C' }
  }
}

function wood(theme: Theme) {
  switch (theme) {
    case 'library': return { top: '#6E4E34', front: '#543C28', edge: '#8A6240', dark: '#3E2C1C' }
    case 'loft':    return { top: '#E6D3B4', front: '#CDB892', edge: '#F3E6D0', dark: '#A89070' }
    case 'studio':  return { top: '#C9A36E', front: '#A68452', edge: '#E0C088', dark: '#7A5A34' }
    case 'lab':     return { top: '#3A4454', front: '#2A3342', edge: '#4A5668', dark: '#1C2430' }
    default:        return { top: '#D2A86C', front: '#8C623C', edge: '#E6C48C', dark: '#6E4C30' }
  }
}

export function drawWall(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme) {
  const w = wallPalette(theme)
  ctx.fillStyle = w.body
  ctx.fillRect(x, y, s, s)
  ctx.fillStyle = w.cap
  ctx.fillRect(x, y, s, 4)
  ctx.fillStyle = w.skirt
  ctx.fillRect(x, y + s - 5, s, 5)
  ctx.fillStyle = w.line
  if (theme === 'loft') {
    ctx.globalAlpha = 0.7
    for (let i = 10; i < s - 6; i += 8) ctx.fillRect(x, y + i, s, 1)
  } else if (theme === 'library') {
    ctx.globalAlpha = 0.55
    ctx.fillRect(x, y + 6, 2, s - 12)
    ctx.fillRect(x + 6, y + Math.floor(s * 0.42), s - 8, 1)
  } else if (theme === 'lab') {
    ctx.globalAlpha = 0.85
    ctx.fillRect(x + 4, y + 10, s - 8, 1)
    ctx.fillRect(x + 4, y + 11, 1, s - 18)
  } else if (theme === 'studio') {
    ctx.globalAlpha = 0.45
    ctx.fillRect(x, y + Math.floor(s * 0.5), s, 2)
  } else {
    ctx.globalAlpha = 0.4
    ctx.fillRect(x, y + Math.floor(s * 0.46), s, 1)
  }
  ctx.globalAlpha = 1
}

export function drawDoor(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme) {
  const frame = theme === 'lab' ? '#3A4454' : theme === 'loft' ? '#2E343C' : theme === 'library' ? '#3A2818' : '#7A5A38'
  const leaf = theme === 'library' ? '#6A4830' : theme === 'lab' ? '#4A5668' : '#C4A06C'
  ctx.fillStyle = theme === 'library' ? '#5C4030' : '#C4A574'
  ctx.fillRect(x, y, s, s)
  ctx.fillStyle = frame
  ctx.fillRect(x, y, 4, s)
  ctx.fillRect(x + s - 4, y, 4, s)
  ctx.fillRect(x, y, s, 4)
  ctx.fillStyle = leaf
  ctx.fillRect(x + 6, y + 6, s - 16, s - 10)
  ctx.fillStyle = frame
  ctx.globalAlpha = 0.35
  ctx.fillRect(x + 8, y + 8, s - 20, 2)
  ctx.fillRect(x + 8, y + Math.floor(s * 0.48), s - 20, 2)
  ctx.globalAlpha = 1
  ctx.fillStyle = '#E0B84A'
  ctx.fillRect(x + s - 14, y + Math.floor(s * 0.55), 3, 3)
}

function glass(theme: Theme) {
  switch (theme) {
    case 'library': return { glass: '#8AA4B0', frame: '#3A2818' }
    case 'loft':    return { glass: '#C5D6E2', frame: '#2A3038' }
    case 'studio':  return { glass: '#C5DDD0', frame: '#8A6844' }
    case 'lab':     return { glass: '#1C4E58', frame: '#1A222C' }
    default:        return { glass: '#B7D0E2', frame: '#F3EEE6' }
  }
}

export function drawWindowH(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme, tick: number) {
  const g = glass(theme)
  const gy = 8
  const gh = s - 18
  ctx.fillStyle = g.glass
  ctx.fillRect(x + 4, y + gy, s - 8, gh)
  if (tick) {
    ctx.fillStyle = '#fff'
    ctx.globalAlpha = 0.16
    ctx.fillRect(x + 6 + ((tick / 10) % (s - 16)), y + gy + 2, 3, gh - 4)
    ctx.globalAlpha = 1
  }
  ctx.fillStyle = g.frame
  ctx.fillRect(x + 3, y + gy - 2, s - 6, 2)
  ctx.fillRect(x + 3, y + gy + gh, s - 6, 3)
  ctx.fillRect(x + 3, y + gy, 2, gh)
  ctx.fillRect(x + s - 5, y + gy, 2, gh)
  ctx.fillRect(x + Math.floor(s / 2) - 1, y + gy, 2, gh)
  if (theme === 'studio') {
    ctx.fillRect(x + 4, y + gy + Math.floor(gh / 2), s - 8, 1)
    ctx.fillRect(x + Math.floor(s / 4), y + gy, 1, gh)
  }
  if (theme === 'library') ctx.fillRect(x + 10, y + gy - 5, s - 20, 3)
}

export function drawWindowV(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme, tick: number) {
  const g = glass(theme)
  const gx = 8
  const gw = s - 18
  ctx.fillStyle = g.glass
  ctx.fillRect(x + gx, y + 4, gw, s - 8)
  if (tick) {
    ctx.fillStyle = '#fff'
    ctx.globalAlpha = 0.16
    ctx.fillRect(x + gx + 2, y + 6 + ((tick / 10) % (s - 16)), gw - 4, 3)
    ctx.globalAlpha = 1
  }
  ctx.fillStyle = g.frame
  ctx.fillRect(x + gx - 2, y + 3, 2, s - 6)
  ctx.fillRect(x + gx + gw, y + 3, 3, s - 6)
  ctx.fillRect(x + gx, y + 3, gw, 2)
  ctx.fillRect(x + gx, y + s - 5, gw, 2)
  ctx.fillRect(x + gx, y + Math.floor(s / 2) - 1, gw, 2)
  if (theme === 'studio') ctx.fillRect(x + gx + Math.floor(gw / 2), y + 4, 1, s - 8)
}

function plankFloor(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, colors: string[], seam: string) {
  const col = Math.floor(x / s)
  const row = Math.floor(y / s)
  ctx.fillStyle = colors[(row + Math.floor(col / 4)) % colors.length]
  ctx.fillRect(x, y, s, s)
  ctx.fillStyle = seam
  ctx.globalAlpha = 0.22
  ctx.fillRect(x, y, s, 1)
  if ((row + col) % 2 === 0) ctx.fillRect(x + Math.floor(s * 0.42), y, 1, s)
  ctx.globalAlpha = 1
  ctx.fillStyle = '#fff'
  ctx.globalAlpha = 0.05
  ctx.fillRect(x + 5 + (col % 4) * 4, y + 2, 2, s - 4)
  ctx.globalAlpha = 1
}

function drawFloor(ctx: CanvasRenderingContext2D, type: TileType, x: number, y: number, s: number, theme: Theme) {
  const col = Math.floor(x / s)
  const row = Math.floor(y / s)
  if (type === 'floor_oak' || type === 'floor_wood_light') {
    const pale = type === 'floor_wood_light' || theme === 'loft'
    const dark = theme === 'library'
    plankFloor(ctx, x, y, s,
      pale ? ['#E6D3B4', '#DCC6A2', '#F0E0C4', '#CDB892']
        : dark ? ['#6A4A30', '#5C3E28', '#7A5638', '#4E3422']
        : theme === 'lab' ? ['#3A4250', '#323844', '#464E5E', '#2C3340']
        : ['#C4A06A', '#B8925C', '#D2B078', '#A88450'],
      dark || theme === 'lab' ? '#1A140E' : '#6A4A2C',
    )
    return
  }
  if (type === 'floor_stone') {
    if (theme === 'library') {
      plankFloor(ctx, x, y, s, ['#5A3C28', '#4C3220', '#684832', '#3E2818'], '#1A100C')
      return
    }
    const alt = (col + row) % 2 === 0
    ctx.fillStyle = alt ? '#5C615C' : '#4E5450'
    ctx.fillRect(x, y, s, s)
    ctx.fillStyle = '#2E3330'
    ctx.globalAlpha = 0.45
    ctx.fillRect(x, y, s, 1)
    ctx.fillRect(x, y, 1, s)
    ctx.globalAlpha = 1
    return
  }
  if (type === 'floor_concrete') {
    ctx.fillStyle = theme === 'lab' ? '#323844' : '#C8C4BC'
    ctx.fillRect(x, y, s, s)
    ctx.fillStyle = theme === 'lab' ? '#3E4654' : '#D8D4CC'
    ctx.globalAlpha = 0.5
    ctx.fillRect(x + (col % 3) * 6, y + (row % 2) * 4, 10, 2)
    ctx.globalAlpha = 1
    ctx.fillStyle = '#000'
    ctx.globalAlpha = 0.08
    ctx.fillRect(x, y + s - 1, s, 1)
    ctx.globalAlpha = 1
    return
  }
  if (type === 'floor_tile') {
    const terracotta = theme === 'classic' || theme === 'studio'
    const a = terracotta ? '#D2A078' : '#E4D8C4'
    const b = terracotta ? '#C48E68' : '#D8CBB4'
    ctx.fillStyle = (col + row) % 2 === 0 ? a : b
    ctx.fillRect(x, y, s, s)
    ctx.fillStyle = terracotta ? '#A87450' : '#C8BBA4'
    ctx.globalAlpha = 0.45
    ctx.fillRect(x, y, s, 1)
    ctx.fillRect(x, y, 1, s)
    ctx.globalAlpha = 1
    return
  }
  if (type === 'floor_carpet_blue' || type === 'floor_carpet_teal') {
    const teal = type === 'floor_carpet_teal'
    const base = theme === 'library' ? '#6E3E46'
      : theme === 'studio' ? '#8E9A78'
      : theme === 'lab' ? '#243044'
      : teal ? '#2F5C58' : '#3E5270'
    const fleck = theme === 'library' ? '#8A5058' : teal ? '#3A7068' : '#4A6284'
    ctx.fillStyle = base
    ctx.fillRect(x, y, s, s)
    ctx.fillStyle = fleck
    ctx.globalAlpha = 0.35
    for (let i = 2; i < s; i += 6) {
      for (let j = ((i / 6 + col) % 2 === 0 ? 2 : 5); j < s; j += 6) ctx.fillRect(x + j, y + i, 2, 2)
    }
    ctx.globalAlpha = 1
    return
  }
  if (type === 'floor_grass') {
    ctx.fillStyle = '#6A9450'
    ctx.fillRect(x, y, s, s)
    ctx.fillStyle = '#588040'
    for (let i = 0; i < 7; i++) {
      const gx = x + ((col * 13 + i * 17) % (s - 2))
      const gy = y + ((row * 11 + i * 19) % (s - 3))
      ctx.fillRect(gx, gy, 2, 3)
    }
    ctx.fillStyle = '#8CB86A'
    ctx.fillRect(x + ((col * 7) % (s - 4)), y + ((row * 5) % (s - 4)), 2, 2)
    return
  }
  plankFloor(ctx, x, y, s, ['#C4A06A', '#B8925C', '#D2B078', '#A88450'], '#6A4A2C')
}

function shadow(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.fillStyle = 'rgba(24,18,12,0.22)'
  ctx.fillRect(x + R(s * 0.1), y + s - R(s * 0.08), R(s * 0.8), R(s * 0.05))
}

function drawDesk(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme, tick: number) {
  const wd = wood(theme)
  shadow(ctx, x, y, s)
  ctx.fillStyle = wd.front
  ctx.fillRect(x + R(s * 0.06), y + R(s * 0.62), R(s * 0.88), R(s * 0.26))
  ctx.fillStyle = wd.edge
  ctx.fillRect(x + R(s * 0.06), y + R(s * 0.62), R(s * 0.88), R(s * 0.04))
  ctx.fillStyle = wd.dark
  ctx.fillRect(x + R(s * 0.12), y + R(s * 0.74), R(s * 0.3), R(s * 0.08))
  ctx.fillRect(x + R(s * 0.5), y + R(s * 0.74), R(s * 0.36), R(s * 0.08))
  ctx.fillStyle = '#E2C56A'
  ctx.fillRect(x + R(s * 0.24), y + R(s * 0.76), 2, 2)
  ctx.fillStyle = wd.top
  ctx.fillRect(x + R(s * 0.04), y + R(s * 0.4), R(s * 0.92), R(s * 0.24))
  ctx.fillStyle = wd.edge
  ctx.fillRect(x + R(s * 0.04), y + R(s * 0.4), R(s * 0.92), 2)
  const screen = theme === 'lab' ? '#1FA8A0' : theme === 'library' ? '#C4A15A' : '#3A7EC4'
  ctx.fillStyle = '#1A2030'
  ctx.fillRect(x + R(s * 0.24), y + R(s * 0.06), R(s * 0.48), R(s * 0.3))
  ctx.fillStyle = screen
  ctx.globalAlpha = tick ? 0.78 + Math.sin(tick * 0.07) * 0.12 : 0.9
  ctx.fillRect(x + R(s * 0.28), y + R(s * 0.1), R(s * 0.4), R(s * 0.2))
  ctx.globalAlpha = 1
  ctx.fillStyle = '#EAF4FF'
  ctx.globalAlpha = 0.4
  ctx.fillRect(x + R(s * 0.3), y + R(s * 0.12) + (tick ? Math.floor((tick / 8) % 4) * 2 : 2), R(s * 0.24), 2)
  ctx.globalAlpha = 1
  ctx.fillStyle = '#2A3038'
  ctx.fillRect(x + R(s * 0.44), y + R(s * 0.34), R(s * 0.08), R(s * 0.07))
  ctx.fillRect(x + R(s * 0.38), y + R(s * 0.4), R(s * 0.2), 2)
  ctx.fillStyle = '#2C3340'
  ctx.fillRect(x + R(s * 0.16), y + R(s * 0.48), R(s * 0.36), R(s * 0.07))
  ctx.fillStyle = theme === 'library' ? '#F2E4C4' : '#F4EFE6'
  ctx.fillRect(x + R(s * 0.78), y + R(s * 0.44), R(s * 0.1), R(s * 0.12))
  ctx.fillStyle = theme === 'lab' ? '#3E6E74' : '#C46A4A'
  ctx.fillRect(x + R(s * 0.78), y + R(s * 0.44), R(s * 0.1), 3)
}

function drawChair(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme) {
  const back = theme === 'library' ? '#6E3E46' : theme === 'studio' ? '#7A9A72' : theme === 'lab' ? '#2E4A58' : theme === 'loft' ? '#5C6168' : '#3E5A80'
  const seat = theme === 'library' ? '#4E2C32' : theme === 'loft' ? '#3E4348' : '#2A4058'
  shadow(ctx, x, y, s)
  ctx.fillStyle = back
  ctx.fillRect(x + R(s * 0.22), y + R(s * 0.12), R(s * 0.56), R(s * 0.36))
  ctx.fillStyle = '#fff'
  ctx.globalAlpha = 0.18
  ctx.fillRect(x + R(s * 0.22), y + R(s * 0.12), R(s * 0.56), 2)
  ctx.globalAlpha = 1
  ctx.fillStyle = seat
  ctx.fillRect(x + R(s * 0.16), y + R(s * 0.46), R(s * 0.68), R(s * 0.22))
  ctx.fillStyle = back
  ctx.fillRect(x + R(s * 0.12), y + R(s * 0.42), R(s * 0.1), R(s * 0.2))
  ctx.fillRect(x + R(s * 0.78), y + R(s * 0.42), R(s * 0.1), R(s * 0.2))
  ctx.fillStyle = '#1E242C'
  ctx.fillRect(x + R(s * 0.28), y + R(s * 0.7), 3, R(s * 0.16))
  ctx.fillRect(x + R(s * 0.64), y + R(s * 0.7), 3, R(s * 0.16))
  ctx.fillRect(x + R(s * 0.24), y + R(s * 0.84), 8, 3)
  ctx.fillRect(x + R(s * 0.6), y + R(s * 0.84), 8, 3)
}

function drawBookshelf(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme) {
  const frame = theme === 'loft' ? '#CDB892' : theme === 'lab' ? '#2A3342' : '#6A4A30'
  const back = theme === 'library' ? '#3A2818' : '#8A6848'
  ctx.fillStyle = frame
  ctx.fillRect(x + 1, y + 1, s - 2, s - 2)
  ctx.fillStyle = back
  ctx.fillRect(x + 3, y + 3, s - 6, s - 6)
  const books = ['#8C3A3A', '#3A5A8C', '#3E6A40', '#C4A24A', '#6A4A78', '#C47A58', '#2E4A44']
  const shelfH = Math.floor((s - 8) / 3)
  for (let shelf = 0; shelf < 3; shelf++) {
    const sy = y + 4 + shelf * shelfH
    let bx = x + 5
    let i = 0
    while (bx < x + s - 7) {
      const bw = 3 + ((bx + shelf) % 3)
      ctx.fillStyle = books[(i + shelf * 2) % books.length]
      ctx.fillRect(bx, sy + 1, bw, shelfH - 4)
      ctx.fillStyle = '#fff'
      ctx.globalAlpha = 0.25
      ctx.fillRect(bx, sy + 1, 1, shelfH - 4)
      ctx.globalAlpha = 1
      bx += bw + 1
      i++
    }
    ctx.fillStyle = frame
    ctx.fillRect(x + 3, sy + shelfH - 3, s - 6, 3)
  }
}

function drawPlantLarge(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme, tick: number) {
  const sway = tick ? (Math.sin(tick * 0.04 + x * 0.01) > 0.4 ? 1 : 0) : 0
  const pot = theme === 'studio' ? '#C46A4A' : theme === 'library' ? '#6A5038' : '#C4A06A'
  ctx.fillStyle = pot
  ctx.fillRect(x + R(s * 0.28), y + R(s * 0.62), R(s * 0.44), R(s * 0.28))
  ctx.fillStyle = '#E6D2A4'
  ctx.fillRect(x + R(s * 0.24), y + R(s * 0.58), R(s * 0.52), 3)
  ctx.fillStyle = '#5A4030'
  ctx.fillRect(x + R(s * 0.46), y + R(s * 0.4), 3, R(s * 0.2))
  const leaf = theme === 'library' ? '#2E5A38' : theme === 'studio' ? '#3E8A48' : '#4E8A42'
  const leaf2 = theme === 'studio' ? '#6AAA58' : '#6AAA50'
  const leaves: [number, number, number, number][] = [
    [0.12, 0.22, 0.28, 0.2],
    [0.52, 0.12, 0.3, 0.22],
    [0.3, 0.32, 0.26, 0.16],
    [0.18, 0.08, 0.18, 0.14],
  ]
  leaves.forEach(([lx, ly, lw, lh], i) => {
    ctx.fillStyle = i % 2 ? leaf2 : leaf
    ctx.fillRect(x + R(s * lx) + sway, y + R(s * ly), R(s * lw), R(s * lh))
    ctx.fillStyle = '#1E3A22'
    ctx.globalAlpha = 0.35
    ctx.fillRect(x + R(s * lx) + R(s * lw * 0.4) + sway, y + R(s * ly), 1, R(s * lh))
    ctx.globalAlpha = 1
  })
}

function drawPlantSmall(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, tick: number) {
  const sway = tick ? (Math.sin(tick * 0.05 + y) > 0 ? 1 : 0) : 0
  ctx.fillStyle = '#C46A4A'
  ctx.fillRect(x + R(s * 0.32), y + R(s * 0.62), R(s * 0.36), R(s * 0.26))
  ctx.fillStyle = '#E8C8A0'
  ctx.fillRect(x + R(s * 0.28), y + R(s * 0.58), R(s * 0.44), 3)
  ctx.fillStyle = '#3E7A40'
  ctx.fillRect(x + R(s * 0.34) + sway, y + R(s * 0.28), R(s * 0.32), R(s * 0.32))
  ctx.fillStyle = '#6AAA58'
  ctx.fillRect(x + R(s * 0.22) + sway, y + R(s * 0.36), R(s * 0.18), R(s * 0.16))
  ctx.fillRect(x + R(s * 0.6) + sway, y + R(s * 0.34), R(s * 0.16), R(s * 0.14))
}

function drawPlantFlowers(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, tick: number) {
  drawPlantSmall(ctx, x, y, s, tick)
  const colors = ['#E07070', '#E0C060', '#E8E4F0', '#D07098']
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = colors[i]
    ctx.fillRect(x + R(s * 0.28) + i * R(s * 0.12), y + R(s * 0.22) + (i % 2) * 3, 4, 4)
  }
}

function sofaColors(theme: Theme) {
  switch (theme) {
    case 'library': return { body: '#7A3A44', arm: '#5C2C34', cushion: '#8E4A54' }
    case 'loft':    return { body: '#5C6168', arm: '#3E444A', cushion: '#727880' }
    case 'studio':  return { body: '#C4A46A', arm: '#8A6844', cushion: '#7A9A72' }
    case 'lab':     return { body: '#2E3E58', arm: '#1E2A3C', cushion: '#3A5270' }
    default:        return { body: '#4A6A9A', arm: '#2E4468', cushion: '#5C7CB0' }
  }
}

function drawSofaH(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme) {
  const c = sofaColors(theme)
  shadow(ctx, x, y, s)
  ctx.fillStyle = c.arm
  ctx.fillRect(x + 2, y + R(s * 0.28), 6, R(s * 0.5))
  ctx.fillRect(x + s - 8, y + R(s * 0.28), 6, R(s * 0.5))
  ctx.fillStyle = c.body
  ctx.fillRect(x + 8, y + R(s * 0.22), s - 16, R(s * 0.28))
  ctx.fillStyle = '#fff'
  ctx.globalAlpha = 0.15
  ctx.fillRect(x + 8, y + R(s * 0.22), s - 16, 2)
  ctx.globalAlpha = 1
  ctx.fillStyle = c.cushion
  ctx.fillRect(x + 9, y + R(s * 0.5), R((s - 20) / 2), R(s * 0.26))
  ctx.fillRect(x + 11 + R((s - 20) / 2), y + R(s * 0.5), R((s - 20) / 2), R(s * 0.26))
  ctx.fillStyle = theme === 'library' ? '#C4A15A' : '#F2E4C8'
  ctx.fillRect(x + R(s * 0.22), y + R(s * 0.54), R(s * 0.12), R(s * 0.12))
  ctx.fillStyle = '#3A2A1C'
  ctx.fillRect(x + 10, y + s - 5, 4, 3)
  ctx.fillRect(x + s - 14, y + s - 5, 4, 3)
}

function drawSofaV(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme) {
  const c = sofaColors(theme)
  shadow(ctx, x, y, s)
  ctx.fillStyle = c.arm
  ctx.fillRect(x + R(s * 0.28), y + 2, R(s * 0.5), 6)
  ctx.fillRect(x + R(s * 0.28), y + s - 8, R(s * 0.5), 6)
  ctx.fillStyle = c.body
  ctx.fillRect(x + R(s * 0.18), y + 8, R(s * 0.28), s - 16)
  ctx.fillStyle = c.cushion
  ctx.fillRect(x + R(s * 0.46), y + 10, R(s * 0.28), R((s - 22) / 2))
  ctx.fillRect(x + R(s * 0.46), y + 14 + R((s - 22) / 2), R(s * 0.28), R((s - 22) / 2))
}

function drawCoffeeMachine(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme, tick: number) {
  const body = theme === 'loft' || theme === 'classic' ? '#E8E4DC' : theme === 'lab' ? '#2A3342' : '#4A4038'
  const accent = theme === 'lab' ? '#3E9A94' : '#C45A3A'
  shadow(ctx, x, y, s)
  ctx.fillStyle = body
  ctx.fillRect(x + R(s * 0.18), y + R(s * 0.22), R(s * 0.64), R(s * 0.62))
  ctx.fillStyle = '#fff'
  ctx.globalAlpha = 0.2
  ctx.fillRect(x + R(s * 0.18), y + R(s * 0.22), 2, R(s * 0.62))
  ctx.globalAlpha = 1
  ctx.fillStyle = '#2A241C'
  ctx.fillRect(x + R(s * 0.28), y + R(s * 0.1), R(s * 0.44), R(s * 0.14))
  ctx.fillStyle = accent
  ctx.fillRect(x + R(s * 0.34), y + R(s * 0.34), R(s * 0.18), R(s * 0.1))
  ctx.fillStyle = '#1A1A1A'
  ctx.fillRect(x + R(s * 0.38), y + R(s * 0.44), 3, R(s * 0.12))
  ctx.fillStyle = '#F4EFE6'
  ctx.fillRect(x + R(s * 0.32), y + R(s * 0.56), R(s * 0.16), R(s * 0.12))
  ctx.fillStyle = accent
  ctx.fillRect(x + R(s * 0.58), y + R(s * 0.4), 2, R(s * 0.22))
  if (tick) {
    ctx.strokeStyle = '#fff'
    ctx.globalAlpha = 0.45
    ctx.lineWidth = 1
    const bob = Math.sin(tick * 0.12) * 2
    ctx.beginPath()
    ctx.moveTo(x + R(s * 0.4), y + R(s * 0.5))
    ctx.quadraticCurveTo(x + R(s * 0.48), y + R(s * 0.38) + bob, x + R(s * 0.4), y + R(s * 0.28))
    ctx.stroke()
    ctx.globalAlpha = 1
  }
}

function drawLamp(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, tick: number) {
  const glow = tick ? 0.14 + Math.sin(tick * 0.06) * 0.05 : 0.16
  ctx.fillStyle = '#F2D48A'
  ctx.globalAlpha = glow
  ctx.beginPath()
  ctx.moveTo(x + s / 2, y + s * 0.28)
  ctx.lineTo(x + s * 0.12, y + s * 0.95)
  ctx.lineTo(x + s * 0.88, y + s * 0.95)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1
  ctx.fillStyle = '#E2B84A'
  ctx.fillRect(x + R(s * 0.22), y + R(s * 0.16), R(s * 0.56), R(s * 0.16))
  ctx.fillStyle = '#F6E2A0'
  ctx.fillRect(x + R(s * 0.22), y + R(s * 0.16), R(s * 0.56), 2)
  ctx.fillStyle = '#8A7040'
  ctx.fillRect(x + R(s * 0.48), y + R(s * 0.32), 3, R(s * 0.4))
  ctx.fillStyle = '#6A5430'
  ctx.fillRect(x + R(s * 0.36), y + R(s * 0.7), R(s * 0.28), 3)
}

function drawRug(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme) {
  const fill = theme === 'library' ? '#6E3040' : theme === 'studio' ? '#C4A06A' : theme === 'loft' ? '#C46A4A' : '#8A6078'
  ctx.fillStyle = fill
  ctx.globalAlpha = 0.72
  ctx.fillRect(x + 5, y + 5, s - 10, s - 10)
  ctx.globalAlpha = 1
  ctx.fillStyle = '#F2E4C8'
  ctx.globalAlpha = 0.45
  ctx.fillRect(x + 7, y + 7, s - 14, 2)
  ctx.fillRect(x + 7, y + s - 9, s - 14, 2)
  ctx.fillRect(x + 7, y + 7, 2, s - 14)
  ctx.fillRect(x + s - 9, y + 7, 2, s - 14)
  ctx.globalAlpha = 1
}

function drawFireplace(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme, tick: number, lit = true) {
  const stone = theme === 'library' ? '#5C4638' : '#6A6560'
  ctx.fillStyle = stone
  ctx.fillRect(x + 2, y + 2, s - 4, s - 4)
  ctx.fillStyle = lit ? '#3A342E' : '#1A1614'
  ctx.fillRect(x + 8, y + 10, s - 16, s - 18)
  if (!lit) {
    ctx.fillStyle = '#4A4038'
    ctx.fillRect(x + R(s * 0.34), y + R(s * 0.62), R(s * 0.32), R(s * 0.1))
    ctx.fillStyle = '#6A4030'
    ctx.fillRect(x + 4, y + s - 8, s - 8, 4)
    return
  }
  const flick = tick ? Math.sin(tick * 0.2) * 2 : 0
  ctx.fillStyle = '#E25822'
  ctx.fillRect(x + R(s * 0.32), y + R(s * 0.48) + flick, R(s * 0.36), R(s * 0.28))
  ctx.fillStyle = '#F2C14A'
  ctx.fillRect(x + R(s * 0.4), y + R(s * 0.58), R(s * 0.2), R(s * 0.16))
  ctx.fillStyle = '#6A4030'
  ctx.fillRect(x + 4, y + s - 8, s - 8, 4)
}

function drawServer(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, tick: number) {
  ctx.fillStyle = '#1A2030'
  ctx.fillRect(x + 4, y + 2, s - 8, s - 4)
  const leds = ['#3E9A94', '#E2B84A', '#7A6AC4']
  for (let i = 0; i < 5; i++) {
    const uy = y + 5 + i * R(s * 0.16)
    ctx.fillStyle = '#2A3344'
    ctx.fillRect(x + 7, uy, s - 14, R(s * 0.12))
    const on = !tick || ((tick + i * 9) % 28) > 8
    ctx.fillStyle = on ? leds[i % 3] : '#1A2030'
    ctx.fillRect(x + s - 16, uy + 2, 3, 3)
    ctx.fillStyle = on && (i + Math.floor(tick / 10)) % 2 === 0 ? '#E8F6F4' : '#245E58'
    ctx.fillRect(x + 10, uy + 3, R(s * 0.28), 2)
  }
}

function drawCounter(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme) {
  const wd = wood(theme)
  ctx.fillStyle = wd.front
  ctx.fillRect(x + 1, y + R(s * 0.35), s - 2, R(s * 0.6))
  ctx.fillStyle = wd.top
  ctx.fillRect(x, y + R(s * 0.22), s, R(s * 0.16))
  ctx.fillStyle = wd.edge
  ctx.fillRect(x, y + R(s * 0.22), s, 2)
}

function drawFridge(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.fillStyle = '#E8EEF2'
  ctx.fillRect(x + R(s * 0.16), y + 2, R(s * 0.68), s - 4)
  ctx.fillStyle = '#C5D0D8'
  ctx.fillRect(x + R(s * 0.16), y + R(s * 0.42), R(s * 0.68), 2)
  ctx.fillStyle = '#8AA0AE'
  ctx.fillRect(x + R(s * 0.7), y + R(s * 0.16), 2, R(s * 0.16))
  ctx.fillRect(x + R(s * 0.7), y + R(s * 0.55), 2, R(s * 0.16))
}

function drawKettle(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, tick: number) {
  ctx.fillStyle = '#D8DEE4'
  ctx.fillRect(x + R(s * 0.28), y + R(s * 0.32), R(s * 0.4), R(s * 0.4))
  ctx.fillStyle = '#1A1A1A'
  ctx.fillRect(x + R(s * 0.36), y + R(s * 0.22), R(s * 0.24), R(s * 0.12))
  ctx.fillStyle = '#8AA0AE'
  ctx.fillRect(x + R(s * 0.66), y + R(s * 0.4), R(s * 0.12), 3)
  if (tick) {
    ctx.strokeStyle = '#fff'
    ctx.globalAlpha = 0.4
    ctx.beginPath()
    ctx.moveTo(x + s / 2, y + R(s * 0.28))
    ctx.quadraticCurveTo(x + s / 2 + 4, y + R(s * 0.16), x + s / 2, y + R(s * 0.08))
    ctx.stroke()
    ctx.globalAlpha = 1
  }
}

function drawStool(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.fillStyle = '#C4A06C'
  ctx.fillRect(x + R(s * 0.28), y + R(s * 0.28), R(s * 0.44), R(s * 0.16))
  ctx.fillStyle = '#6A4A30'
  ctx.fillRect(x + R(s * 0.46), y + R(s * 0.44), 3, R(s * 0.36))
  ctx.fillRect(x + R(s * 0.32), y + R(s * 0.76), R(s * 0.36), 3)
}

function drawCoffeeTable(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme) {
  const wd = wood(theme)
  shadow(ctx, x, y, s)
  ctx.fillStyle = wd.top
  ctx.fillRect(x + R(s * 0.1), y + R(s * 0.28), R(s * 0.8), R(s * 0.36))
  ctx.fillStyle = wd.front
  ctx.fillRect(x + R(s * 0.1), y + R(s * 0.58), R(s * 0.8), R(s * 0.1))
  ctx.fillStyle = '#F4EFE6'
  ctx.fillRect(x + R(s * 0.2), y + R(s * 0.36), R(s * 0.12), R(s * 0.1))
  ctx.fillStyle = '#3A5A8C'
  ctx.fillRect(x + R(s * 0.4), y + R(s * 0.34), R(s * 0.22), R(s * 0.14))
}

function drawMeeting(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme) {
  const wd = wood(theme)
  ctx.fillStyle = wd.top
  ctx.fillRect(x + 2, y + R(s * 0.18), s - 4, R(s * 0.64))
  ctx.fillStyle = wd.front
  ctx.fillRect(x + 2, y + R(s * 0.7), s - 4, R(s * 0.12))
  ctx.fillStyle = '#F4EFE6'
  ctx.fillRect(x + R(s * 0.15), y + R(s * 0.32), R(s * 0.2), R(s * 0.12))
  ctx.fillStyle = '#3A7EC4'
  ctx.globalAlpha = 0.7
  ctx.fillRect(x + R(s * 0.5), y + R(s * 0.3), R(s * 0.28), R(s * 0.18))
  ctx.globalAlpha = 1
}

function drawFocus(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme, tick: number) {
  ctx.fillStyle = theme === 'library' ? '#5C4030' : '#CDBFA6'
  ctx.globalAlpha = 0.9
  ctx.fillRect(x + 1, y + 2, s - 2, 5)
  ctx.globalAlpha = 1
  drawDesk(ctx, x, y + 4, s - 4, theme, tick)
}

function drawPool(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.fillStyle = '#6A4A30'
  ctx.fillRect(x + 2, y + 4, s - 4, s - 8)
  ctx.fillStyle = '#1E6A44'
  ctx.fillRect(x + 6, y + 8, s - 12, s - 16)
  ctx.fillStyle = '#F4EFE6'
  ctx.fillRect(x + R(s * 0.3), y + R(s * 0.4), 4, 4)
  ctx.fillStyle = '#C45A3A'
  ctx.fillRect(x + R(s * 0.5), y + R(s * 0.48), 4, 4)
  ctx.fillStyle = '#1A1A1A'
  ctx.fillRect(x + 4, y + 6, 4, 4)
  ctx.fillRect(x + s - 8, y + 6, 4, 4)
  ctx.fillRect(x + 4, y + s - 10, 4, 4)
  ctx.fillRect(x + s - 8, y + s - 10, 4, 4)
}

function drawArcade(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, tick: number) {
  ctx.fillStyle = '#2A2040'
  ctx.fillRect(x + R(s * 0.16), y + 2, R(s * 0.68), s - 4)
  ctx.fillStyle = '#E2B84A'
  ctx.fillRect(x + R(s * 0.2), y + 4, R(s * 0.6), R(s * 0.12))
  ctx.fillStyle = '#102818'
  ctx.fillRect(x + R(s * 0.24), y + R(s * 0.22), R(s * 0.52), R(s * 0.32))
  ctx.fillStyle = '#3ECA7A'
  ctx.globalAlpha = tick ? 0.55 + Math.sin(tick * 0.15) * 0.2 : 0.7
  ctx.fillRect(x + R(s * 0.3), y + R(s * 0.28), R(s * 0.36), R(s * 0.16))
  ctx.globalAlpha = 1
  ctx.fillStyle = '#C45A3A'
  ctx.fillRect(x + R(s * 0.3), y + R(s * 0.64), 5, 5)
  ctx.fillStyle = '#3A7EC4'
  ctx.fillRect(x + R(s * 0.5), y + R(s * 0.64), 5, 5)
}

function drawWhiteboard(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, theme: Theme) {
  const frame = theme === 'lab' ? '#3A4454' : '#6A4A30'
  ctx.fillStyle = frame
  ctx.fillRect(x + 3, y + 4, s - 6, s - 10)
  ctx.fillStyle = '#F7F4EE'
  ctx.fillRect(x + 6, y + 7, s - 12, s - 16)
  ctx.fillStyle = '#3A7EC4'
  ctx.fillRect(x + 10, y + 12, R(s * 0.4), 2)
  ctx.fillStyle = '#C45A3A'
  ctx.fillRect(x + 10, y + 18, R(s * 0.25), 2)
  ctx.fillStyle = '#3E8A48'
  ctx.fillRect(x + 12, y + 24, 8, 8)
}

function drawGameTable(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.fillStyle = '#2A3342'
  ctx.fillRect(x + 3, y + 6, s - 6, s - 12)
  ctx.fillStyle = '#1E6A44'
  ctx.fillRect(x + 6, y + 10, s - 12, s - 20)
  ctx.fillStyle = '#F2E4C8'
  ctx.fillRect(x + R(s * 0.2), y + R(s * 0.35), 5, 7)
  ctx.fillStyle = '#C45A3A'
  ctx.fillRect(x + R(s * 0.55), y + R(s * 0.4), 5, 7)
}

function drawStairs(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  ctx.fillStyle = '#A89070'
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x + 4, y + 6 + i * R(s * 0.18), s - 8, R(s * 0.12))
    ctx.fillStyle = i % 2 ? '#C4A880' : '#8A7050'
  }
}

const FURNITURE = new Set<TileType>([
  'desk', 'chair', 'bookshelf', 'plant_small', 'plant_large', 'plant_flowers',
  'sofa_h', 'sofa_v', 'coffee_table', 'coffee_machine', 'lamp', 'rug',
  'game_table', 'whiteboard', 'meeting_table', 'pool_table', 'arcade_machine',
  'fridge', 'kettle', 'counter', 'bar_stool', 'focus_pod', 'stairs',
])

/** Vertical flip so a desk and its chair can face the bench across from them. */
function paintFacing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  s: number,
  facing: 'n' | 's' | undefined,
  draw: () => void,
) {
  if (facing !== 's') {
    draw()
    return
  }
  ctx.save()
  ctx.translate(x + s / 2, y + s / 2)
  ctx.scale(1, -1)
  ctx.translate(-(x + s / 2), -(y + s / 2))
  draw()
  ctx.restore()
}

export function drawEnvTile(
  ctx: CanvasRenderingContext2D,
  tile: Tile,
  x: number,
  y: number,
  s: number,
  theme: Theme,
  tick: number,
  fireplaceLit = true,
) {
  const floor = tile.base
  if (floor) drawFloor(ctx, floor, x, y, s, theme)

  switch (tile.type) {
    case 'floor_oak':
    case 'floor_carpet_blue':
    case 'floor_carpet_teal':
    case 'floor_tile':
    case 'floor_stone':
    case 'floor_wood_light':
    case 'floor_grass':
    case 'floor_concrete':
      if (!floor) drawFloor(ctx, tile.type, x, y, s, theme)
      break
    case 'wall':
    case 'wall_window':
      drawWall(ctx, x, y, s, theme)
      break
    case 'door':
      drawDoor(ctx, x, y, s, theme)
      break
    case 'window_h':
      drawWall(ctx, x, y, s, theme)
      drawWindowH(ctx, x, y, s, theme, tick)
      break
    case 'window_v':
      drawWall(ctx, x, y, s, theme)
      drawWindowV(ctx, x, y, s, theme, tick)
      break
    case 'desk':
      if (!floor) drawFloor(ctx, 'floor_oak', x, y, s, theme)
      paintFacing(ctx, x, y, s, tile.facing, () => drawDesk(ctx, x, y, s, theme, tick))
      break
    case 'chair':
      if (!floor) drawFloor(ctx, 'floor_oak', x, y, s, theme)
      paintFacing(ctx, x, y, s, tile.facing, () => drawChair(ctx, x, y, s, theme))
      break
    case 'bookshelf':
      drawBookshelf(ctx, x, y, s, theme)
      break
    case 'plant_large':
      if (!floor) drawFloor(ctx, 'floor_oak', x, y, s, theme)
      drawPlantLarge(ctx, x, y, s, theme, tick)
      break
    case 'plant_small':
      if (!floor) drawFloor(ctx, 'floor_oak', x, y, s, theme)
      drawPlantSmall(ctx, x, y, s, tick)
      break
    case 'plant_flowers':
      if (!floor) drawFloor(ctx, 'floor_oak', x, y, s, theme)
      drawPlantFlowers(ctx, x, y, s, tick)
      break
    case 'sofa_h':
      if (!floor) drawFloor(ctx, 'floor_carpet_blue', x, y, s, theme)
      drawSofaH(ctx, x, y, s, theme)
      break
    case 'sofa_v':
      if (!floor) drawFloor(ctx, 'floor_carpet_blue', x, y, s, theme)
      drawSofaV(ctx, x, y, s, theme)
      break
    case 'coffee_table':
      if (!floor) drawFloor(ctx, 'floor_carpet_blue', x, y, s, theme)
      drawCoffeeTable(ctx, x, y, s, theme)
      break
    case 'coffee_machine':
      if (!floor) drawFloor(ctx, 'floor_tile', x, y, s, theme)
      drawCoffeeMachine(ctx, x, y, s, theme, tick)
      break
    case 'lamp':
      if (!floor) drawFloor(ctx, 'floor_oak', x, y, s, theme)
      drawLamp(ctx, x, y, s, tick)
      break
    case 'rug':
      if (!floor) drawFloor(ctx, 'floor_carpet_blue', x, y, s, theme)
      drawRug(ctx, x, y, s, theme)
      break
    case 'fireplace':
      drawWall(ctx, x, y, s, theme)
      drawFireplace(ctx, x, y, s, theme, tick, fireplaceLit)
      break
    case 'server_rack':
      if (!floor) drawFloor(ctx, 'floor_concrete', x, y, s, theme)
      drawServer(ctx, x, y, s, tick)
      break
    case 'counter':
      if (!floor) drawFloor(ctx, 'floor_tile', x, y, s, theme)
      drawCounter(ctx, x, y, s, theme)
      break
    case 'fridge':
      if (!floor) drawFloor(ctx, 'floor_tile', x, y, s, theme)
      drawFridge(ctx, x, y, s)
      break
    case 'kettle':
      if (!floor) drawFloor(ctx, 'floor_tile', x, y, s, theme)
      drawKettle(ctx, x, y, s, tick)
      break
    case 'bar_stool':
      if (!floor) drawFloor(ctx, 'floor_tile', x, y, s, theme)
      drawStool(ctx, x, y, s)
      break
    case 'whiteboard':
      if (!floor) drawFloor(ctx, 'floor_oak', x, y, s, theme)
      drawWhiteboard(ctx, x, y, s, theme)
      break
    case 'meeting_table':
      if (!floor) drawFloor(ctx, 'floor_oak', x, y, s, theme)
      drawMeeting(ctx, x, y, s, theme)
      break
    case 'focus_pod':
      if (!floor) drawFloor(ctx, 'floor_oak', x, y, s, theme)
      drawFocus(ctx, x, y, s, theme, tick)
      break
    case 'game_table':
      if (!floor) drawFloor(ctx, 'floor_carpet_teal', x, y, s, theme)
      drawGameTable(ctx, x, y, s)
      break
    case 'pool_table':
      if (!floor) drawFloor(ctx, 'floor_carpet_teal', x, y, s, theme)
      drawPool(ctx, x, y, s)
      break
    case 'arcade_machine':
      if (!floor) drawFloor(ctx, 'floor_carpet_teal', x, y, s, theme)
      drawArcade(ctx, x, y, s, tick)
      break
    case 'stairs':
      if (!floor) drawFloor(ctx, 'floor_oak', x, y, s, theme)
      drawStairs(ctx, x, y, s)
      break
    default:
      if (!floor && !FURNITURE.has(tile.type)) drawFloor(ctx, 'floor_oak', x, y, s, theme)
  }
}

export function drawAtmosphere(
  ctx: CanvasRenderingContext2D,
  theme: Theme,
  width: number,
  height: number,
  tile: number,
  tick: number,
) {
  if (!tick) return
  if (theme === 'library') {
    ctx.fillStyle = '#F2E4C8'
    for (let i = 0; i < 10; i++) {
      const px = ((i * 97 + tick * 0.15) % (width * tile))
      const py = ((i * 53 + Math.sin(tick * 0.02 + i) * 20) % (height * tile))
      ctx.globalAlpha = 0.15 + (i % 3) * 0.05
      ctx.fillRect(px, py, 2, 2)
    }
    ctx.globalAlpha = 1
  }
  if (theme === 'studio') {
    for (let i = 0; i < 2; i++) {
      const bx = (width * tile * 0.3) + Math.sin(tick * 0.02 + i) * 80 + i * 140
      const by = (height * tile * 0.25) + Math.cos(tick * 0.018 + i) * 50
      ctx.fillStyle = i === 0 ? '#F2E4A8' : '#F2C8D8'
      ctx.fillRect(bx, by, 3, 2)
      ctx.fillRect(bx - 2, by + 1, 2, 1)
      ctx.fillRect(bx + 3, by + 1, 2, 1)
    }
  }
}
