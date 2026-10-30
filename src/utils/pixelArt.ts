import type { AvatarConfig } from '../types'

// ─── Color palette ────────────────────────────────────────────────────────────
export const COLORS = {
  midnight: '#192331',
  slate: '#303D4E',
  oak: '#A67B5B',
  oakDark: '#8B6347',
  oakLight: '#C4956A',
  teal: '#658B86',
  tealDark: '#4A6E6A',
  tealLight: '#7FA8A3',
  dustyPink: '#C48F9A',
  cream: '#F2E8D8',
  amber: '#E3B775',
  amberDark: '#C49955',
  sage: '#9FBA8F',
  sageDark: '#7A9A6F',
  carpetBlue: '#3D5A80',
  carpetBlueDark: '#2C4260',
  carpetBlueLight: '#5070A0',
  carpetTeal: '#3D7A7A',
  carpetTealDark: '#2C5F5F',
  wallColor: '#2A3545',
  wallTop: '#3D5268',
  wallShadow: '#1A2535',
  floorTile: '#E8DCC8',
  floorTileAlt: '#D8CDB8',
  white: '#F2E8D8',
  black: '#0F1821',
  deskTop: '#C49A6C',
  deskFront: '#A67B5B',
  deskShadow: '#8B6347',
  chairBack: '#3D5A80',
  chairSeat: '#2C4260',
  plantGreen: '#9FBA8F',
  plantDark: '#7A9A6F',
  potBrown: '#A67B5B',
  screenBlue: '#4A90D9',
  screenGlow: '#6AB0F9',
  bookRed: '#C44B4B',
  bookBlue: '#4B7BC4',
  bookGreen: '#6B9B4B',
  bookYellow: '#C4A44B',
  sofaBlue: '#4A6FA5',
  sofaDark: '#354F7A',
  coffeeTable: '#A67B5B',
  kitchenTile: '#D8CDB8',
  coffeeMachineBody: '#303D4E',
  coffeeMachineAccent: '#E3B775',
  rugColor: '#9F6B8F',
  lampPost: '#C4956A',
  lampLight: '#F2D49B',
  gamePad: '#2C1810',
  whiteboardBg: '#F2E8D8',
  whiteboardFrame: '#A67B5B',
}

// ─── Tile renderers ───────────────────────────────────────────────────────────

export function drawFloorOak(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  ctx.fillStyle = '#B88860'
  ctx.fillRect(x, y, s, s)
  // Plank divisions
  ctx.fillStyle = '#9A7050'
  ctx.globalAlpha = 0.5
  const planks = Math.floor(s / 16)
  for (let i = 1; i < planks + 1; i++) {
    ctx.fillRect(x, y + i * 16, s, 1)
  }
  ctx.globalAlpha = 1
  // Wood grain (vertical light streaks)
  ctx.fillStyle = '#C8985A'
  ctx.globalAlpha = 0.18
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x + 5 + i * 11, y, 2, s)
  }
  ctx.globalAlpha = 1
  // Top edge highlight
  ctx.fillStyle = '#D4A870'
  ctx.globalAlpha = 0.2
  ctx.fillRect(x, y, s, 2)
  ctx.globalAlpha = 1
}

export function drawCarpetBlue(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  ctx.fillStyle = COLORS.carpetBlue
  ctx.fillRect(x, y, s, s)
  // Subtle loop texture
  ctx.fillStyle = COLORS.carpetBlueDark
  ctx.globalAlpha = 0.28
  for (let i = 0; i < s; i += 8) {
    for (let j = (i / 8) % 2 === 0 ? 0 : 4; j < s; j += 8) {
      ctx.fillRect(x + j, y + i, 4, 4)
    }
  }
  ctx.globalAlpha = 1
  ctx.fillStyle = COLORS.carpetBlueLight
  ctx.globalAlpha = 0.1
  ctx.fillRect(x, y, s, 2)
  ctx.globalAlpha = 1
}

export function drawCarpetTeal(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  ctx.fillStyle = COLORS.carpetTeal
  ctx.fillRect(x, y, s, s)
  ctx.fillStyle = COLORS.carpetTealDark
  ctx.globalAlpha = 0.25
  for (let i = 0; i < s; i += 6) {
    for (let j = (i / 6) % 2 === 0 ? 0 : 3; j < s; j += 6) {
      ctx.fillRect(x + j, y + i, 3, 3)
    }
  }
  ctx.globalAlpha = 1
}

export function drawFloorTile(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  const alt = ((Math.floor(x / s) + Math.floor(y / s)) % 2 === 0)
  ctx.fillStyle = alt ? COLORS.floorTile : COLORS.floorTileAlt
  ctx.fillRect(x, y, s, s)
  ctx.fillStyle = '#B8A890'
  ctx.globalAlpha = 0.4
  ctx.fillRect(x, y, s, 1)
  ctx.fillRect(x, y, 1, s)
  ctx.globalAlpha = 1
}

export function drawWall(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Wall body — painted plaster
  ctx.fillStyle = '#2D3A4E'
  ctx.fillRect(x, y, s, s)
  // Top cap — lighter, gives 3-D depth
  ctx.fillStyle = '#4A6080'
  ctx.fillRect(x, y, s, 5)
  // Top cap highlight
  ctx.fillStyle = '#5A7090'
  ctx.fillRect(x, y, s, 2)
  // Bottom shadow
  ctx.fillStyle = '#1A2535'
  ctx.fillRect(x, y + s - 3, s, 3)
  // Subtle horizontal panel lines (no brick outlines)
  ctx.fillStyle = '#232E3F'
  ctx.globalAlpha = 0.35
  for (let i = 14; i < s; i += 16) {
    ctx.fillRect(x, y + i, s, 1)
  }
  ctx.globalAlpha = 1
  // Left-edge subtle highlight
  ctx.fillStyle = '#3D5268'
  ctx.globalAlpha = 0.3
  ctx.fillRect(x, y + 5, 2, s - 8)
  ctx.globalAlpha = 1
}

export function drawDoor(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Door frame (dark wood surround)
  ctx.fillStyle = '#7A5A38'
  ctx.fillRect(x + 2, y, s - 4, s)
  // Door surface (lighter wood)
  ctx.fillStyle = '#B8905C'
  ctx.fillRect(x + 4, y + 2, s - 8, s - 3)
  // Door top panel
  ctx.fillStyle = '#A07A4A'
  ctx.fillRect(x + 7, y + 4, s - 14, Math.floor(s * 0.38))
  ctx.fillStyle = '#C8A070'
  ctx.fillRect(x + 7, y + 4, s - 14, 2)
  // Door bottom panel
  ctx.fillStyle = '#A07A4A'
  ctx.fillRect(x + 7, y + Math.floor(s * 0.5), s - 14, Math.floor(s * 0.38))
  ctx.fillStyle = '#C8A070'
  ctx.fillRect(x + 7, y + Math.floor(s * 0.5), s - 14, 2)
  // Door knob
  ctx.fillStyle = '#D4A030'
  ctx.beginPath()
  ctx.arc(x + s - 10, y + Math.floor(s / 2) + 2, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#F0C050'
  ctx.beginPath()
  ctx.arc(x + s - 11, y + Math.floor(s / 2) + 1, 2, 0, Math.PI * 2)
  ctx.fill()
  // Frame highlight
  ctx.fillStyle = '#C8A878'
  ctx.globalAlpha = 0.3
  ctx.fillRect(x + 4, y + 2, 2, s - 3)
  ctx.globalAlpha = 1
}

export function drawDesk(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Desk surface
  ctx.fillStyle = '#C8A070'
  ctx.fillRect(x + 2, y + 18, s - 4, 14)
  // Desk surface top edge highlight
  ctx.fillStyle = '#DEB880'
  ctx.fillRect(x + 2, y + 18, s - 4, 2)
  // Desk front face
  ctx.fillStyle = '#A07848'
  ctx.fillRect(x + 2, y + 32, s - 4, 10)
  ctx.fillStyle = '#8A6438'
  ctx.fillRect(x + 2, y + 40, s - 4, 4)

  // Monitor body (bezel)
  const mw = s - 16
  const mh = 18
  const mx = x + 8
  const my = y + 2
  ctx.fillStyle = '#1A2030'
  ctx.fillRect(mx, my, mw, mh)
  // Screen (blue glow)
  ctx.fillStyle = '#2E6AAA'
  ctx.fillRect(mx + 2, my + 2, mw - 4, mh - 5)
  // Screen highlight
  ctx.fillStyle = '#5A9ADF'
  ctx.globalAlpha = 0.35
  ctx.fillRect(mx + 2, my + 2, mw - 4, 4)
  ctx.globalAlpha = 1
  // Screen content lines
  ctx.fillStyle = '#7AB8F8'
  ctx.globalAlpha = 0.5
  ctx.fillRect(mx + 3, my + 7, mw - 14, 2)
  ctx.fillRect(mx + 3, my + 11, mw - 18, 2)
  ctx.globalAlpha = 1
  // Monitor stand
  ctx.fillStyle = '#252E3A'
  ctx.fillRect(x + s / 2 - 2, my + mh, 4, 5)
  ctx.fillRect(x + s / 2 - 5, my + mh + 4, 10, 2)

  // Keyboard (thin strip)
  ctx.fillStyle = '#2A3040'
  ctx.fillRect(x + 5, y + 22, s - 10, 5)
  ctx.fillStyle = '#3A4050'
  ctx.fillRect(x + 5, y + 22, s - 10, 1)
  // Keyboard keys hint
  ctx.fillStyle = '#4A5060'
  ctx.globalAlpha = 0.6
  for (let k = 0; k < 4; k++) {
    ctx.fillRect(x + 6 + k * 8, y + 23, 6, 3)
  }
  ctx.globalAlpha = 1

  // Mouse
  ctx.fillStyle = '#2A3040'
  ctx.beginPath()
  ctx.ellipse(x + s - 8, y + 24, 3, 5, 0, 0, Math.PI * 2)
  ctx.fill()
}

export function drawChair(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Chair back
  ctx.fillStyle = '#3D5A80'
  ctx.fillRect(x + 8, y + 8, s - 16, 22)
  // Chair back highlight
  ctx.fillStyle = '#5070A0'
  ctx.fillRect(x + 8, y + 8, s - 16, 3)
  // Back cushion center panel
  ctx.fillStyle = '#4A6A90'
  ctx.fillRect(x + 10, y + 10, s - 20, 18)
  // Seat
  ctx.fillStyle = '#2C4260'
  ctx.fillRect(x + 6, y + 30, s - 12, 12)
  ctx.fillStyle = '#3A5275'
  ctx.fillRect(x + 6, y + 30, s - 12, 3)
  // Armrests
  ctx.fillStyle = '#253850'
  ctx.fillRect(x + 5, y + 25, 5, 12)
  ctx.fillRect(x + s - 10, y + 25, 5, 12)
  // Chair legs / base
  ctx.fillStyle = '#303848'
  ctx.fillRect(x + 9, y + 42, 3, 6)
  ctx.fillRect(x + s - 12, y + 42, 3, 6)
  // Wheels
  ctx.fillStyle = '#1E2430'
  ctx.fillRect(x + 8, y + 46, 5, 3)
  ctx.fillRect(x + s - 13, y + 46, 5, 3)
}

export function drawBookshelf(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Wood frame
  ctx.fillStyle = '#7A5A38'
  ctx.fillRect(x, y, s, s)
  ctx.fillStyle = '#9A7A58'
  ctx.fillRect(x + 2, y + 2, s - 4, s - 4)
  // Shelves
  const bookColors = [COLORS.bookRed, COLORS.bookBlue, COLORS.bookGreen, COLORS.bookYellow, COLORS.dustyPink, '#8B5CF6']
  const shelfH = Math.floor((s - 6) / 3)
  for (let shelf = 0; shelf < 3; shelf++) {
    const sy = y + 4 + shelf * shelfH
    // Shelf board
    ctx.fillStyle = '#7A5A38'
    ctx.fillRect(x + 2, sy + shelfH - 2, s - 4, 3)
    // Books on shelf
    let bx = x + 4
    while (bx < x + s - 8) {
      const bw = 4 + ((bx * 7 + shelf * 13) % 4)
      const bColor = bookColors[(bx + shelf) % bookColors.length]
      const bh = shelfH - 5 - (((bx + shelf) * 3) % 4)
      ctx.fillStyle = bColor
      ctx.fillRect(bx, sy + 2, bw, bh)
      // Book spine highlight
      ctx.fillStyle = shadeColor(bColor, 22)
      ctx.fillRect(bx, sy + 2, 1, bh)
      bx += bw + 1
    }
  }
}

export function drawPlantSmall(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Terracotta pot
  ctx.fillStyle = '#B86848'
  ctx.fillRect(x + Math.floor(s * 0.3), y + Math.floor(s * 0.62), Math.floor(s * 0.4), Math.floor(s * 0.28))
  ctx.fillStyle = '#C87858'
  ctx.fillRect(x + Math.floor(s * 0.28), y + Math.floor(s * 0.58), Math.floor(s * 0.44), 5)
  ctx.fillStyle = '#985838'
  ctx.fillRect(x + Math.floor(s * 0.3), y + Math.floor(s * 0.85), Math.floor(s * 0.4), 4)
  // Soil
  ctx.fillStyle = '#4A3020'
  ctx.fillRect(x + Math.floor(s * 0.3) + 1, y + Math.floor(s * 0.58), Math.floor(s * 0.4) - 2, 4)

  // Main stem
  ctx.fillStyle = '#5A8040'
  ctx.fillRect(x + Math.floor(s / 2) - 1, y + Math.floor(s * 0.3), 2, Math.floor(s * 0.28))

  // Leaves — pixel-art style rectangles with slight lean
  ctx.fillStyle = '#7AAA60'
  ctx.fillRect(x + Math.floor(s * 0.38), y + Math.floor(s * 0.2), Math.floor(s * 0.24), Math.floor(s * 0.32))
  // Leaf side lobes
  ctx.fillStyle = '#6A9A50'
  ctx.fillRect(x + Math.floor(s * 0.24), y + Math.floor(s * 0.28), Math.floor(s * 0.16), Math.floor(s * 0.18))
  ctx.fillRect(x + Math.floor(s * 0.6), y + Math.floor(s * 0.26), Math.floor(s * 0.16), Math.floor(s * 0.16))
  // Leaf highlight
  ctx.fillStyle = '#9ACA80'
  ctx.fillRect(x + Math.floor(s * 0.42), y + Math.floor(s * 0.22), Math.floor(s * 0.08), Math.floor(s * 0.12))
}

export function drawPlantLarge(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Ceramic pot
  ctx.fillStyle = '#C8A870'
  ctx.fillRect(x + Math.floor(s * 0.18), y + Math.floor(s * 0.55), Math.floor(s * 0.64), Math.floor(s * 0.4))
  ctx.fillStyle = '#B89858'
  ctx.fillRect(x + Math.floor(s * 0.18), y + Math.floor(s * 0.7), Math.floor(s * 0.64), Math.floor(s * 0.25))
  // Pot rim
  ctx.fillStyle = '#DEC090'
  ctx.fillRect(x + Math.floor(s * 0.16), y + Math.floor(s * 0.52), Math.floor(s * 0.68), 5)
  // Soil
  ctx.fillStyle = '#3A2818'
  ctx.fillRect(x + Math.floor(s * 0.19), y + Math.floor(s * 0.52), Math.floor(s * 0.62), 4)

  // Trunk / stem
  ctx.fillStyle = '#6A5030'
  ctx.fillRect(x + Math.floor(s / 2) - 2, y + Math.floor(s * 0.2), 5, Math.floor(s * 0.33))

  // Palm fronds — pixel-art leaf shapes radiating outward
  const frondDefs: Array<[number, number, number, number, number, number]> = [
    // [offsetX, offsetY, w, h, trimX, trimY] - approximate leaf rectangles
    [s / 2 - 4, s * 0.04, 8, s * 0.18, 0, 0], // center top
    [s * 0.1, s * 0.1, s * 0.22, 6, 0, 0],    // top left
    [s * 0.68, s * 0.08, s * 0.22, 6, 0, 0],   // top right
    [s * 0.04, s * 0.24, s * 0.24, 6, 0, 0],   // left
    [s * 0.72, s * 0.22, s * 0.24, 6, 0, 0],   // right
  ]
  const frondColor = '#6A9A50'
  const frondDark = '#4A7A30'
  const frondLight = '#8ABA70'

  ctx.fillStyle = frondDark
  ctx.fillRect(x + Math.floor(s * 0.12), y + Math.floor(s * 0.12), Math.floor(s * 0.22), 5)
  ctx.fillRect(x + Math.floor(s * 0.66), y + Math.floor(s * 0.1), Math.floor(s * 0.22), 5)
  ctx.fillRect(x + Math.floor(s * 0.04), y + Math.floor(s * 0.24), Math.floor(s * 0.26), 5)
  ctx.fillRect(x + Math.floor(s * 0.7), y + Math.floor(s * 0.22), Math.floor(s * 0.26), 5)
  ctx.fillRect(x + Math.floor(s / 2) - 3, y + Math.floor(s * 0.03), 6, Math.floor(s * 0.2))

  ctx.fillStyle = frondColor
  ctx.fillRect(x + Math.floor(s * 0.12), y + Math.floor(s * 0.1), Math.floor(s * 0.22), 5)
  ctx.fillRect(x + Math.floor(s * 0.66), y + Math.floor(s * 0.08), Math.floor(s * 0.22), 5)
  ctx.fillRect(x + Math.floor(s * 0.04), y + Math.floor(s * 0.22), Math.floor(s * 0.26), 5)
  ctx.fillRect(x + Math.floor(s * 0.7), y + Math.floor(s * 0.2), Math.floor(s * 0.26), 5)
  ctx.fillRect(x + Math.floor(s / 2) - 3, y + Math.floor(s * 0.02), 6, Math.floor(s * 0.18))

  ctx.fillStyle = frondLight
  ctx.globalAlpha = 0.5
  ctx.fillRect(x + Math.floor(s * 0.14), y + Math.floor(s * 0.1), Math.floor(s * 0.1), 2)
  ctx.fillRect(x + Math.floor(s * 0.68), y + Math.floor(s * 0.08), Math.floor(s * 0.1), 2)
  ctx.globalAlpha = 1

  // Crown center
  ctx.fillStyle = '#3A6020'
  ctx.fillRect(x + Math.floor(s / 2) - 3, y + Math.floor(s * 0.18), 7, 5)
  void frondDefs // keep unused reference to silence lint
}

export function drawSofaH(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Armrests
  ctx.fillStyle = '#2E4268'
  ctx.fillRect(x + 2, y + Math.floor(s * 0.3), 7, Math.floor(s * 0.55))
  ctx.fillRect(x + s - 9, y + Math.floor(s * 0.3), 7, Math.floor(s * 0.55))
  // Back rest
  ctx.fillStyle = '#354F7A'
  ctx.fillRect(x + 9, y + Math.floor(s * 0.2), s - 18, Math.floor(s * 0.32))
  ctx.fillStyle = '#4A6490'
  ctx.fillRect(x + 9, y + Math.floor(s * 0.2), s - 18, 3)
  // Left cushion
  ctx.fillStyle = '#4A6FA5'
  ctx.fillRect(x + 9, y + Math.floor(s * 0.5), Math.floor((s - 18) / 2) - 1, Math.floor(s * 0.33))
  ctx.fillStyle = '#6088B8'
  ctx.fillRect(x + 9, y + Math.floor(s * 0.5), Math.floor((s - 18) / 2) - 1, 3)
  // Right cushion
  ctx.fillStyle = '#4A6FA5'
  ctx.fillRect(x + 9 + Math.floor((s - 18) / 2) + 1, y + Math.floor(s * 0.5), Math.floor((s - 18) / 2) - 1, Math.floor(s * 0.33))
  ctx.fillStyle = '#6088B8'
  ctx.fillRect(x + 9 + Math.floor((s - 18) / 2) + 1, y + Math.floor(s * 0.5), Math.floor((s - 18) / 2) - 1, 3)
  // Cushion divider
  ctx.fillStyle = '#2E4268'
  ctx.fillRect(x + Math.floor(s / 2) - 1, y + Math.floor(s * 0.5), 2, Math.floor(s * 0.33))
  // Sofa legs
  ctx.fillStyle = '#8A6840'
  ctx.fillRect(x + 8, y + Math.floor(s * 0.83), 4, 5)
  ctx.fillRect(x + s - 12, y + Math.floor(s * 0.83), 4, 5)
}

export function drawSofaV(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Back rest (left side for vertical orientation)
  ctx.fillStyle = '#354F7A'
  ctx.fillRect(x + Math.floor(s * 0.55), y + 9, Math.floor(s * 0.25), s - 18)
  ctx.fillStyle = '#4A6490'
  ctx.fillRect(x + Math.floor(s * 0.55), y + 9, 3, s - 18)
  // Top armrest
  ctx.fillStyle = '#2E4268'
  ctx.fillRect(x + Math.floor(s * 0.25), y + 2, Math.floor(s * 0.5), 7)
  // Bottom armrest
  ctx.fillRect(x + Math.floor(s * 0.25), y + s - 9, Math.floor(s * 0.5), 7)
  // Top cushion
  ctx.fillStyle = '#4A6FA5'
  ctx.fillRect(x + Math.floor(s * 0.25), y + 9, Math.floor(s * 0.32), Math.floor((s - 18) / 2) - 1)
  ctx.fillStyle = '#6088B8'
  ctx.fillRect(x + Math.floor(s * 0.25), y + 9, Math.floor(s * 0.32), 3)
  // Bottom cushion
  ctx.fillStyle = '#4A6FA5'
  ctx.fillRect(x + Math.floor(s * 0.25), y + 9 + Math.floor((s - 18) / 2) + 1, Math.floor(s * 0.32), Math.floor((s - 18) / 2) - 1)
  ctx.fillStyle = '#6088B8'
  ctx.fillRect(x + Math.floor(s * 0.25), y + 9 + Math.floor((s - 18) / 2) + 1, Math.floor(s * 0.32), 3)
  // Cushion divider
  ctx.fillStyle = '#2E4268'
  ctx.fillRect(x + Math.floor(s * 0.25), y + Math.floor(s / 2) - 1, Math.floor(s * 0.32), 2)
}

export function drawCoffeeTable(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Table top
  ctx.fillStyle = '#B88A58'
  ctx.fillRect(x + 4, y + Math.floor(s * 0.3), s - 8, Math.floor(s * 0.35))
  ctx.fillStyle = '#D0A070'
  ctx.fillRect(x + 4, y + Math.floor(s * 0.3), s - 8, 3)
  // Table legs
  ctx.fillStyle = '#8A6840'
  ctx.fillRect(x + 6, y + Math.floor(s * 0.65), 3, Math.floor(s * 0.25))
  ctx.fillRect(x + s - 9, y + Math.floor(s * 0.65), 3, Math.floor(s * 0.25))
  // Mugs on table
  ctx.fillStyle = COLORS.dustyPink
  ctx.fillRect(x + 9, y + Math.floor(s * 0.33), 6, 7)
  ctx.fillStyle = '#E0B0B8'
  ctx.fillRect(x + 9, y + Math.floor(s * 0.33), 6, 2)
  ctx.fillStyle = COLORS.amber
  ctx.fillRect(x + s - 15, y + Math.floor(s * 0.33), 6, 7)
  ctx.fillStyle = '#F0D090'
  ctx.fillRect(x + s - 15, y + Math.floor(s * 0.33), 6, 2)
}

// Espresso machine — fully redesigned to be immediately recognizable
export function drawCoffeeMachine(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  const cx = Math.floor(x + s / 2)

  // Machine body — stainless metal
  ctx.fillStyle = '#2A2E3A'
  ctx.fillRect(x + 5, y + 4, s - 10, s - 10)
  // Body highlight (left edge)
  ctx.fillStyle = '#4A4E5A'
  ctx.fillRect(x + 5, y + 4, 3, s - 10)
  // Body right shadow
  ctx.fillStyle = '#1A1E28'
  ctx.fillRect(x + s - 8, y + 4, 3, s - 10)

  // Control panel top
  ctx.fillStyle = '#1E2230'
  ctx.fillRect(x + 5, y + 4, s - 10, 12)
  ctx.fillStyle = '#30364A'
  ctx.fillRect(x + 5, y + 4, s - 10, 2)

  // Buttons on control panel
  ctx.fillStyle = '#E8A020'  // amber shot button
  ctx.fillRect(cx - 7, y + 6, 5, 7)
  ctx.fillStyle = '#F0B030'
  ctx.fillRect(cx - 7, y + 6, 5, 2)

  ctx.fillStyle = '#4A8A50'  // green steam button
  ctx.fillRect(cx, y + 6, 5, 7)
  ctx.fillStyle = '#5AA060'
  ctx.fillRect(cx, y + 6, 5, 2)

  // Group head / portafilter housing (the distinctive coffee machine element)
  ctx.fillStyle = '#1A1E28'
  ctx.fillRect(cx - 8, y + 18, 16, 8)
  ctx.fillStyle = '#303444'
  ctx.fillRect(cx - 7, y + 18, 14, 3)
  // Portafilter spout
  ctx.fillStyle = '#222630'
  ctx.fillRect(cx - 4, y + 26, 8, 5)
  // Spout openings
  ctx.fillStyle = '#0A0C10'
  ctx.fillRect(cx - 3, y + 29, 3, 2)
  ctx.fillRect(cx + 1, y + 29, 3, 2)

  // Drip tray
  ctx.fillStyle = '#303444'
  ctx.fillRect(x + 6, y + s - 14, s - 12, 4)
  ctx.fillStyle = '#1A1E28'
  ctx.fillRect(x + 7, y + s - 13, s - 14, 2)
  // Drip tray grill
  ctx.fillStyle = '#404454'
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(x + 8 + i * 7, y + s - 12, 4, 1)
  }

  // Coffee cup on tray
  ctx.fillStyle = '#F0EAE0'
  ctx.fillRect(cx - 4, y + s - 16, 8, 5)
  ctx.fillStyle = '#C0A070'
  ctx.fillRect(cx - 3, y + s - 15, 6, 3)  // coffee in cup
  // Cup handle
  ctx.strokeStyle = '#D0C8B8'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.arc(cx + 5, y + s - 13, 3, -Math.PI * 0.4, Math.PI * 0.4)
  ctx.stroke()

  // Steam wand (right side)
  ctx.fillStyle = '#3A3E4A'
  ctx.fillRect(x + s - 9, y + 16, 3, 14)
  ctx.fillRect(x + s - 12, y + 27, 5, 3)
  // Steam wand tip
  ctx.fillStyle = '#505460'
  ctx.beginPath()
  ctx.arc(x + s - 8, y + 29, 3, 0, Math.PI * 2)
  ctx.fill()
}

export function drawLamp(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Light cone
  ctx.fillStyle = COLORS.lampLight
  ctx.globalAlpha = 0.18
  ctx.beginPath()
  ctx.moveTo(x + s / 2, y + s * 0.28)
  ctx.lineTo(x + s * 0.08, y + s)
  ctx.lineTo(x + s * 0.92, y + s)
  ctx.closePath()
  ctx.fill()
  ctx.globalAlpha = 1
  // Lamp shade
  ctx.fillStyle = '#D0A840'
  ctx.fillRect(x + Math.floor(s * 0.2), y + Math.floor(s * 0.12), Math.floor(s * 0.6), Math.floor(s * 0.2))
  ctx.fillStyle = COLORS.lampLight
  ctx.fillRect(x + Math.floor(s * 0.2), y + Math.floor(s * 0.12), Math.floor(s * 0.6), 3)
  ctx.fillStyle = '#A88020'
  ctx.fillRect(x + Math.floor(s * 0.2), y + Math.floor(s * 0.3), Math.floor(s * 0.6), 3)
  // Bulb hint
  ctx.fillStyle = '#FFF0A0'
  ctx.globalAlpha = 0.6
  ctx.fillRect(x + Math.floor(s / 2) - 2, y + Math.floor(s * 0.17), 4, 4)
  ctx.globalAlpha = 1
  // Stand
  ctx.fillStyle = '#B08040'
  ctx.fillRect(x + Math.floor(s / 2) - 2, y + Math.floor(s * 0.33), 4, Math.floor(s * 0.52))
  // Base
  ctx.fillStyle = '#908030'
  ctx.fillRect(x + Math.floor(s * 0.28), y + Math.floor(s * 0.83), Math.floor(s * 0.44), 5)
  ctx.fillStyle = '#B0A040'
  ctx.fillRect(x + Math.floor(s * 0.28), y + Math.floor(s * 0.83), Math.floor(s * 0.44), 2)
}

export function drawRug(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  ctx.fillStyle = COLORS.rugColor
  ctx.globalAlpha = 0.55
  ctx.fillRect(x + 4, y + 4, s - 8, s - 8)
  ctx.globalAlpha = 1
  // Border pattern
  ctx.fillStyle = '#C06080'
  ctx.globalAlpha = 0.35
  ctx.fillRect(x + 5, y + 5, s - 10, 3)
  ctx.fillRect(x + 5, y + s - 8, s - 10, 3)
  ctx.fillRect(x + 5, y + 5, 3, s - 10)
  ctx.fillRect(x + s - 8, y + 5, 3, s - 10)
  ctx.globalAlpha = 1
  // Center diamond hint
  ctx.fillStyle = '#D080A0'
  ctx.globalAlpha = 0.25
  ctx.fillRect(x + s / 2 - 6, y + s / 2 - 2, 12, 4)
  ctx.fillRect(x + s / 2 - 2, y + s / 2 - 6, 4, 12)
  ctx.globalAlpha = 1
}

export function drawGameTable(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Table body
  ctx.fillStyle = '#1E2A3A'
  ctx.fillRect(x + 3, y + 3, s - 6, s - 6)
  // Table surface (dark green felt)
  ctx.fillStyle = '#0E2818'
  ctx.fillRect(x + 5, y + 5, s - 10, s - 10)
  // Screen / display
  ctx.fillStyle = '#1E5A38'
  ctx.globalAlpha = 0.8
  ctx.fillRect(x + 7, y + 7, s - 14, s - 14)
  ctx.globalAlpha = 1
  // Game display elements
  ctx.fillStyle = '#40CC80'
  ctx.globalAlpha = 0.6
  ctx.fillRect(x + 9, y + 9, s - 18, Math.floor((s - 18) * 0.55))
  ctx.globalAlpha = 1
  ctx.fillStyle = '#20A060'
  ctx.globalAlpha = 0.5
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x + 10, y + 11 + i * 4, s - 20 - i * 6, 2)
  }
  ctx.globalAlpha = 1
  // Controllers
  ctx.fillStyle = '#0A1820'
  ctx.fillRect(x + Math.floor(s * 0.12), y + Math.floor(s * 0.72), Math.floor(s * 0.28), Math.floor(s * 0.15))
  ctx.fillRect(x + Math.floor(s * 0.6), y + Math.floor(s * 0.72), Math.floor(s * 0.28), Math.floor(s * 0.15))
}

export function drawWhiteboard(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Frame
  ctx.fillStyle = '#9A7A50'
  ctx.fillRect(x + 2, y + 2, s - 4, s - 4)
  // Board surface
  ctx.fillStyle = '#F2EDE4'
  ctx.fillRect(x + 4, y + 4, s - 8, s - 8)
  // Written lines
  ctx.fillStyle = '#3A5070'
  ctx.fillRect(x + 7, y + 9, s - 14, 2)
  ctx.fillRect(x + 7, y + 15, Math.floor((s - 14) * 0.8), 2)
  ctx.fillRect(x + 7, y + 21, Math.floor((s - 14) * 0.6), 2)
  // Colored marker lines
  ctx.fillStyle = '#C04040'
  ctx.fillRect(x + 7, y + 28, Math.floor((s - 14) * 0.5), 2)
  ctx.fillStyle = '#3A80A0'
  ctx.fillRect(x + 7, y + 33, Math.floor((s - 14) * 0.7), 2)
  // Post-its
  ctx.fillStyle = '#F0D040'
  ctx.fillRect(x + s - 17, y + 6, 10, 10)
  ctx.fillStyle = '#F8D850'
  ctx.fillRect(x + s - 17, y + 6, 10, 2)
  ctx.fillStyle = '#F090A0'
  ctx.fillRect(x + s - 15, y + 20, 8, 8)
  ctx.fillStyle = '#F8A0B0'
  ctx.fillRect(x + s - 15, y + 20, 8, 2)
}

// ─── Avatar renderer ──────────────────────────────────────────────────────────

const LEGACY_TOPS: Record<string, string> = {
  hoodie: 'hoodie',
  formal: 'shirt',
  cosy: 'sweater',
  cozy: 'sweater',
  creative: 'blouse',
  casual: 'tshirt',
}

/** Clothing ids the sprite actually draws. Legacy outfit keys map onto these. */
export function resolveAvatarClothing(config: AvatarConfig) {
  return {
    top: config.top || LEGACY_TOPS[config.outfit] || 'tshirt',
    bottom: config.bottom || 'jeans',
    shoes: config.shoes || 'sneakers',
    outerwear: config.outerwear && config.outerwear !== 'none' ? config.outerwear : 'none',
  }
}

export function drawAvatar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  config: AvatarConfig,
  name: string,
  status: string,
  isCurrentUser: boolean = false,
  isFocusing: boolean = false,
  isOnBreak: boolean = false,
  offsetY: number = 0
) {
  const s = 2.0
  // Integer-snap all positions to prevent sub-pixel arm/leg jitter
  const px = Math.round(cx)
  const py = Math.round(cy + offsetY)

  // Drop shadow
  ctx.fillStyle = '#000'
  ctx.globalAlpha = 0.2
  ctx.beginPath()
  ctx.ellipse(px, py + 17 * s, 9 * s, 3 * s, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1

  // Selection ring for current user
  if (isCurrentUser) {
    ctx.strokeStyle = COLORS.amber
    ctx.lineWidth = 2
    ctx.globalAlpha = 0.45
    ctx.beginPath()
    ctx.ellipse(px, py + 4 * s, 13 * s, 5 * s, 0, 0, Math.PI * 2)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  const skin = config.skinTone || '#D08B5B'
  const skinShadow = shadeColor(skin, -32)
  const skinLight = shadeColor(skin, 18)
  const { top, bottom, shoes, outerwear } = resolveAvatarClothing(config)
  const outfit = config.topColor || config.outfitColor || COLORS.teal
  const outfitDark = shadeColor(outfit, -30)
  const outfitLight = shadeColor(outfit, 22)
  const hair = config.hairColor || '#2C1810'
  const hairLight = shadeColor(hair, 24)

  const bottomCol = config.bottomColor || '#283A50'
  const bottomLight = shadeColor(bottomCol, 18)
  const bottomDark = shadeColor(bottomCol, -24)
  const shoeCol = config.shoesColor || '#111A24'
  const shoeLight = shadeColor(shoeCol, 22)

  // ── Legs ──────────────────────────────
  if (bottom === 'skirt') {
    ctx.fillStyle = bottomCol
    ctx.fillRect(px - 8 * s, py + 8 * s, 16 * s, 6 * s)
    ctx.fillStyle = bottomLight
    ctx.fillRect(px - 8 * s, py + 8 * s, 16 * s, 1 * s)
    ctx.fillStyle = bottomDark
    ctx.fillRect(px - 8 * s, py + 13 * s, 16 * s, 1 * s)
    ctx.fillStyle = skin
    ctx.fillRect(px - 4 * s, py + 14 * s, 3 * s, 2 * s)
    ctx.fillRect(px + 1 * s, py + 14 * s, 3 * s, 2 * s)
  } else if (bottom === 'shorts') {
    ctx.fillStyle = bottomCol
    ctx.fillRect(px - 5 * s, py + 9 * s, 4 * s, 4 * s)
    ctx.fillRect(px + 1 * s, py + 9 * s, 4 * s, 4 * s)
    ctx.fillStyle = bottomLight
    ctx.fillRect(px - 5 * s, py + 9 * s, 4 * s, 1 * s)
    ctx.fillRect(px + 1 * s, py + 9 * s, 4 * s, 1 * s)
    ctx.fillStyle = skin
    ctx.fillRect(px - 4 * s, py + 13 * s, 3 * s, 3 * s)
    ctx.fillRect(px + 1 * s, py + 13 * s, 3 * s, 3 * s)
  } else if (bottom === 'wide_leg') {
    ctx.fillStyle = bottomCol
    ctx.fillRect(px - 8 * s, py + 9 * s, 7 * s, 7 * s)
    ctx.fillRect(px + 1 * s, py + 9 * s, 7 * s, 7 * s)
    ctx.fillStyle = bottomLight
    ctx.fillRect(px - 8 * s, py + 9 * s, 2 * s, 7 * s)
    ctx.fillRect(px + 1 * s, py + 9 * s, 2 * s, 7 * s)
  } else if (bottom === 'trousers') {
    ctx.fillStyle = bottomCol
    ctx.fillRect(px - 4 * s, py + 9 * s, 3 * s, 7 * s)
    ctx.fillRect(px + 1 * s, py + 9 * s, 3 * s, 7 * s)
    ctx.fillStyle = bottomLight
    ctx.fillRect(px - 3 * s, py + 9 * s, 1 * s, 7 * s)
    ctx.fillRect(px + 2 * s, py + 9 * s, 1 * s, 7 * s)
  } else {
    // jeans
    ctx.fillStyle = bottomCol
    ctx.fillRect(px - 5 * s, py + 9 * s, 4 * s, 8 * s)
    ctx.fillRect(px + 1 * s, py + 9 * s, 4 * s, 8 * s)
    ctx.fillStyle = bottomLight
    ctx.fillRect(px - 5 * s, py + 9 * s, 2 * s, 8 * s)
    ctx.fillRect(px + 1 * s, py + 9 * s, 2 * s, 8 * s)
    ctx.fillStyle = bottomDark
    ctx.fillRect(px - 5 * s, py + 10 * s, 2 * s, 2 * s)
    ctx.fillRect(px + 3 * s, py + 10 * s, 2 * s, 2 * s)
  }

  // ── Shoes ─────────────────────────────
  ctx.fillStyle = shoeCol
  if (shoes === 'boots') {
    ctx.fillRect(px - 6 * s, py + 12 * s, 6 * s, 6 * s)
    ctx.fillRect(px + 0 * s, py + 12 * s, 6 * s, 6 * s)
    ctx.fillStyle = shoeLight
    ctx.fillRect(px - 6 * s, py + 12 * s, 6 * s, 1 * s)
    ctx.fillRect(px + 0 * s, py + 12 * s, 6 * s, 1 * s)
  } else if (shoes === 'loafers') {
    ctx.fillRect(px - 6 * s, py + 15 * s, 6 * s, 2 * s)
    ctx.fillRect(px + 0 * s, py + 15 * s, 6 * s, 2 * s)
    ctx.fillStyle = shoeLight
    ctx.fillRect(px - 5 * s, py + 15 * s, 4 * s, 1 * s)
    ctx.fillRect(px + 1 * s, py + 15 * s, 4 * s, 1 * s)
  } else if (shoes === 'flats') {
    ctx.fillRect(px - 5 * s, py + 16 * s, 5 * s, 2 * s)
    ctx.fillRect(px + 0 * s, py + 16 * s, 5 * s, 2 * s)
  } else {
    ctx.fillRect(px - 6 * s, py + 15 * s, 6 * s, 3 * s)
    ctx.fillRect(px + 0 * s, py + 15 * s, 6 * s, 3 * s)
    ctx.fillStyle = '#F2E8D8'
    ctx.fillRect(px - 6 * s, py + 16 * s, 6 * s, 1 * s)
    ctx.fillRect(px + 0 * s, py + 16 * s, 6 * s, 1 * s)
  }

  // ── Bare arms, then the top's sleeves cover what they should ──
  ctx.fillStyle = skin
  ctx.fillRect(px - 9 * s, py - 1 * s, 3 * s, 8 * s)
  ctx.fillRect(px + 6 * s, py - 1 * s, 3 * s, 8 * s)
  ctx.fillStyle = skinShadow
  ctx.fillRect(px - 9 * s, py - 1 * s, 1 * s, 8 * s)
  ctx.fillRect(px + 8 * s, py - 1 * s, 1 * s, 8 * s)

  // ── Top ───────────────────────────────
  ctx.fillStyle = outfit
  if (top === 'crop') {
    ctx.fillRect(px - 6 * s, py - 2 * s, 12 * s, 6 * s)
    ctx.fillStyle = outfitDark
    ctx.fillRect(px - 6 * s, py + 2 * s, 12 * s, 2 * s)
    ctx.fillStyle = skin
    ctx.fillRect(px - 5 * s, py + 4 * s, 10 * s, 5 * s)
    ctx.fillStyle = outfit
    ctx.fillRect(px - 9 * s, py - 2 * s, 3 * s, 4 * s)
    ctx.fillRect(px + 6 * s, py - 2 * s, 3 * s, 4 * s)
  } else if (top === 'blouse') {
    ctx.fillRect(px - 7 * s, py - 2 * s, 14 * s, 11 * s)
    ctx.fillStyle = outfitLight
    ctx.fillRect(px - 4 * s, py - 3 * s, 8 * s, 3 * s)
    ctx.fillStyle = outfitDark
    ctx.fillRect(px - 7 * s, py + 7 * s, 14 * s, 2 * s)
    ctx.fillStyle = outfit
    ctx.fillRect(px - 11 * s, py - 3 * s, 4 * s, 4 * s)
    ctx.fillRect(px + 7 * s, py - 3 * s, 4 * s, 4 * s)
  } else if (top === 'turtleneck' || top === 'sweater' || top === 'hoodie') {
    const wide = top !== 'turtleneck'
    ctx.fillRect(px - (wide ? 7 : 6) * s, py - 2 * s, (wide ? 14 : 12) * s, 12 * s)
    ctx.fillStyle = outfitDark
    ctx.fillRect(px - (wide ? 7 : 6) * s, py + 8 * s, (wide ? 14 : 12) * s, 2 * s)
    if (top === 'hoodie') {
      ctx.fillStyle = outfitDark
      ctx.fillRect(px - 4 * s, py + 2 * s, 8 * s, 4 * s)
      ctx.fillStyle = outfitLight
      ctx.fillRect(px - 4 * s, py + 2 * s, 8 * s, 1 * s)
    } else if (top === 'sweater') {
      ctx.fillStyle = outfitDark
      ctx.fillRect(px - 3 * s, py - 3 * s, 6 * s, 2 * s)
    }
    ctx.fillStyle = outfit
    ctx.fillRect(px - 10 * s, py - 2 * s, 4 * s, 10 * s)
    ctx.fillRect(px + 6 * s, py - 2 * s, 4 * s, 10 * s)
    ctx.fillStyle = outfitDark
    ctx.fillRect(px - 10 * s, py + 6 * s, 4 * s, 2 * s)
    ctx.fillRect(px + 6 * s, py + 6 * s, 4 * s, 2 * s)
  } else if (top === 'shirt' || top === 'polo') {
    ctx.fillRect(px - 6 * s, py - 2 * s, 12 * s, 12 * s)
    ctx.fillStyle = outfitLight
    ctx.fillRect(px - 1 * s, py - 1 * s, 2 * s, 9 * s)
    ctx.fillStyle = outfitDark
    for (let i = 0; i < (top === 'polo' ? 2 : 3); i++) {
      ctx.fillRect(px, py + i * 3 * s, 1 * s, 1 * s)
    }
    ctx.fillStyle = shadeColor(outfit, 16)
    ctx.fillRect(px - 3 * s, py - 3 * s, 2 * s, 3 * s)
    ctx.fillRect(px + 1 * s, py - 3 * s, 2 * s, 3 * s)
    ctx.fillStyle = outfit
    const sleeve = top === 'polo' ? 4 : 8
    ctx.fillRect(px - 9 * s, py - 2 * s, 3 * s, sleeve * s)
    ctx.fillRect(px + 6 * s, py - 2 * s, 3 * s, sleeve * s)
    if (top === 'shirt') {
      ctx.fillStyle = outfitLight
      ctx.fillRect(px - 9 * s, py + 5 * s, 3 * s, 1 * s)
      ctx.fillRect(px + 6 * s, py + 5 * s, 3 * s, 1 * s)
    }
  } else {
    // t-shirt
    ctx.fillRect(px - 6 * s, py - 2 * s, 12 * s, 11 * s)
    ctx.fillStyle = outfitLight
    ctx.fillRect(px - 2 * s, py - 1 * s, 4 * s, 8 * s)
    ctx.fillStyle = outfitDark
    ctx.fillRect(px - 6 * s, py - 2 * s, 2 * s, 11 * s)
    ctx.fillRect(px + 4 * s, py - 2 * s, 2 * s, 11 * s)
    ctx.fillRect(px - 6 * s, py + 7 * s, 12 * s, 2 * s)
    ctx.fillStyle = outfit
    ctx.fillRect(px - 9 * s, py - 2 * s, 3 * s, 5 * s)
    ctx.fillRect(px + 6 * s, py - 2 * s, 3 * s, 5 * s)
  }

  // ── Outerwear, worn over the top ──────
  if (outerwear !== 'none') {
    const coat = config.outerwearColor || '#303D4E'
    const coatDark = shadeColor(coat, -28)
    const coatLight = shadeColor(coat, 18)
    if (outerwear === 'vest') {
      ctx.fillStyle = coat
      ctx.fillRect(px - 7 * s, py - 3 * s, 3 * s, 12 * s)
      ctx.fillRect(px + 4 * s, py - 3 * s, 3 * s, 12 * s)
      ctx.fillStyle = coatDark
      ctx.fillRect(px - 7 * s, py + 7 * s, 3 * s, 2 * s)
      ctx.fillRect(px + 4 * s, py + 7 * s, 3 * s, 2 * s)
    } else if (outerwear === 'blazer') {
      ctx.fillStyle = coat
      ctx.fillRect(px - 7 * s, py - 3 * s, 4 * s, 13 * s)
      ctx.fillRect(px + 3 * s, py - 3 * s, 4 * s, 13 * s)
      ctx.fillStyle = coatLight
      ctx.fillRect(px - 3 * s, py - 3 * s, 2 * s, 6 * s)
      ctx.fillRect(px + 1 * s, py - 3 * s, 2 * s, 6 * s)
      ctx.fillStyle = coat
      ctx.fillRect(px - 10 * s, py - 3 * s, 4 * s, 10 * s)
      ctx.fillRect(px + 6 * s, py - 3 * s, 4 * s, 10 * s)
      ctx.fillStyle = coatDark
      ctx.fillRect(px - 10 * s, py + 5 * s, 4 * s, 2 * s)
      ctx.fillRect(px + 6 * s, py + 5 * s, 4 * s, 2 * s)
    } else {
      ctx.fillStyle = coat
      ctx.fillRect(px - 7 * s, py - 3 * s, 14 * s, 13 * s)
      ctx.fillRect(px - 10 * s, py - 3 * s, 4 * s, 10 * s)
      ctx.fillRect(px + 6 * s, py - 3 * s, 4 * s, 10 * s)
      ctx.fillStyle = coatDark
      ctx.fillRect(px - 1 * s, py - 2 * s, 2 * s, 11 * s)
      ctx.fillRect(px - 7 * s, py - 5 * s, 14 * s, 2 * s)
    }
  }

  // Hands sit in front of sleeves
  ctx.fillStyle = skin
  ctx.fillRect(px - 8 * s, py + 6 * s, 2 * s, 3 * s)
  ctx.fillRect(px + 6 * s, py + 6 * s, 2 * s, 3 * s)

  // Low bun sits at the nape, so the head and neck cover its front.
  if (config.hairStyle === 'low_bun') {
    ctx.fillStyle = hair
    ctx.beginPath()
    ctx.arc(px, py - 1 * s, 4 * s, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = hairLight
    ctx.fillRect(px - 2 * s, py + 1 * s, 3 * s, 1 * s)
  }

  // ── Neck ──────────────────────────────
  ctx.fillStyle = skin
  ctx.fillRect(px - 2 * s, py - 4 * s, 4 * s, 3 * s)
  ctx.fillStyle = skinShadow
  ctx.fillRect(px - 2 * s, py - 4 * s, 1 * s, 3 * s)
  ctx.fillRect(px + 1 * s, py - 4 * s, 1 * s, 3 * s)

  // ── Head ──────────────────────────────
  ctx.fillStyle = skin
  ctx.fillRect(px - 6 * s, py - 15 * s, 12 * s, 12 * s)
  // Side shading
  ctx.fillStyle = skinShadow
  ctx.fillRect(px - 6 * s, py - 15 * s, 2 * s, 12 * s)
  ctx.fillRect(px + 4 * s, py - 15 * s, 2 * s, 12 * s)
  // Chin shading
  ctx.fillStyle = skinShadow
  ctx.fillRect(px - 4 * s, py - 4 * s, 8 * s, 1 * s)
  // Forehead highlight
  ctx.fillStyle = skinLight
  ctx.fillRect(px - 3 * s, py - 15 * s, 6 * s, 2 * s)

  // ── Hair ──────────────────────────────
  ctx.fillStyle = hair
  switch (config.hairStyle) {
    case 'short':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 3 * s)
      ctx.fillRect(px - 7 * s, py - 14 * s, 2 * s, 4 * s)
      ctx.fillRect(px + 5 * s, py - 14 * s, 2 * s, 4 * s)
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 2 * s, py - 16 * s, 4 * s, 1 * s)
      break
    case 'medium':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 4 * s)
      ctx.fillRect(px - 8 * s, py - 14 * s, 3 * s, 8 * s)
      ctx.fillRect(px + 5 * s, py - 14 * s, 3 * s, 8 * s)
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 2 * s, py - 16 * s, 5 * s, 1 * s)
      break
    case 'long':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 4 * s)
      ctx.fillRect(px - 8 * s, py - 14 * s, 3 * s, 18 * s)
      ctx.fillRect(px + 5 * s, py - 14 * s, 3 * s, 18 * s)
      ctx.fillRect(px - 8 * s, py + 2 * s, 16 * s, 2 * s)
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 2 * s, py - 16 * s, 5 * s, 1 * s)
      break
    case 'bun':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 3 * s)
      ctx.fillRect(px - 7 * s, py - 14 * s, 2 * s, 4 * s)
      ctx.fillRect(px + 5 * s, py - 14 * s, 2 * s, 4 * s)
      ctx.beginPath()
      ctx.arc(px, py - 18 * s, 4 * s, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 1 * s, py - 20 * s, 2 * s, 1 * s)
      break
    case 'curly':
      ctx.fillRect(px - 7 * s, py - 17 * s, 14 * s, 5 * s)
      for (let bx = -2; bx <= 2; bx++) {
        ctx.beginPath()
        ctx.arc(px + bx * 4 * s, py - 17 * s, 3 * s, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 1 * s, py - 19 * s, 3 * s, 1 * s)
      break
    case 'ponytail':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 4 * s)
      ctx.fillRect(px - 7 * s, py - 14 * s, 2 * s, 4 * s)
      ctx.fillRect(px + 5 * s, py - 16 * s, 3 * s, 20 * s)
      ctx.fillRect(px + 3 * s, py + 2 * s, 6 * s, 3 * s)
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 1 * s, py - 16 * s, 4 * s, 1 * s)
      break
    case 'buzz':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 2 * s)
      ctx.fillRect(px - 7 * s, py - 15 * s, 2 * s, 2 * s)
      ctx.fillRect(px + 5 * s, py - 15 * s, 2 * s, 2 * s)
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 1 * s, py - 16 * s, 3 * s, 1 * s)
      break
    case 'pixie':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 3 * s)
      ctx.fillRect(px - 7 * s, py - 14 * s, 2 * s, 3 * s)
      ctx.fillRect(px + 5 * s, py - 14 * s, 2 * s, 2 * s)
      // Side-swept fringe
      ctx.fillRect(px - 5 * s, py - 15 * s, 5 * s, 2 * s)
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 3 * s, py - 16 * s, 3 * s, 1 * s)
      break
    case 'fringe':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 4 * s)
      ctx.fillRect(px - 7 * s, py - 14 * s, 2 * s, 5 * s)
      ctx.fillRect(px + 5 * s, py - 14 * s, 2 * s, 5 * s)
      // Fringe strip across forehead
      ctx.fillRect(px - 5 * s, py - 13 * s, 10 * s, 2 * s)
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 2 * s, py - 16 * s, 4 * s, 1 * s)
      break
    case 'wavy':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 4 * s)
      ctx.fillRect(px - 8 * s, py - 14 * s, 3 * s, 12 * s)
      ctx.fillRect(px + 5 * s, py - 14 * s, 3 * s, 12 * s)
      // Wave bumps on sides
      for (let wi = 0; wi < 3; wi++) {
        ctx.fillRect(px - 10 * s, py - 12 * s + wi * 4 * s, 3 * s, 2 * s)
        ctx.fillRect(px + 7 * s, py - 14 * s + wi * 4 * s, 3 * s, 2 * s)
      }
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 2 * s, py - 16 * s, 4 * s, 1 * s)
      break
    case 'low_bun':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 3 * s)
      ctx.fillRect(px - 7 * s, py - 14 * s, 2 * s, 4 * s)
      ctx.fillRect(px + 5 * s, py - 14 * s, 2 * s, 4 * s)
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 2 * s, py - 16 * s, 4 * s, 1 * s)
      break
    case 'half_up':
      // Half-down portion
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 4 * s)
      ctx.fillRect(px - 8 * s, py - 14 * s, 3 * s, 8 * s)
      ctx.fillRect(px + 5 * s, py - 14 * s, 3 * s, 8 * s)
      // Half-up bun
      ctx.beginPath()
      ctx.arc(px, py - 17 * s, 3 * s, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 1 * s, py - 19 * s, 2 * s, 1 * s)
      break
    case 'pigtails':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 4 * s)
      ctx.fillRect(px - 9 * s, py - 14 * s, 3 * s, 14 * s)
      ctx.fillRect(px + 6 * s, py - 14 * s, 3 * s, 14 * s)
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 2 * s, py - 16 * s, 4 * s, 1 * s)
      break
    case 'afro':
      // Large rounded afro
      for (let ax = -3; ax <= 3; ax++) {
        ctx.beginPath()
        ctx.arc(px + ax * 3 * s, py - 17 * s, 4 * s, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillRect(px - 9 * s, py - 17 * s, 18 * s, 5 * s)
      ctx.fillRect(px - 7 * s, py - 13 * s, 14 * s, 3 * s)
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 3 * s, py - 20 * s, 5 * s, 1 * s)
      break
    case 'afro_tapered':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 3 * s)
      ctx.fillRect(px - 7 * s, py - 14 * s, 2 * s, 4 * s)
      ctx.fillRect(px + 5 * s, py - 14 * s, 2 * s, 4 * s)
      // Afro top
      for (let ax = -2; ax <= 2; ax++) {
        ctx.beginPath()
        ctx.arc(px + ax * 3 * s, py - 18 * s, 3 * s, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 2 * s, py - 20 * s, 4 * s, 1 * s)
      break
    case 'twists':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 4 * s)
      ctx.fillRect(px - 7 * s, py - 14 * s, 2 * s, 4 * s)
      ctx.fillRect(px + 5 * s, py - 14 * s, 2 * s, 4 * s)
      // Twist rows (alternating highlight)
      for (let ti = 0; ti < 4; ti++) {
        ctx.fillRect(px - 5 * s, py - 12 * s + ti * 4 * s, 10 * s, 2 * s)
        ctx.fillStyle = hairLight
        ctx.fillRect(px - 4 * s, py - 12 * s + ti * 4 * s, 1 * s, 1 * s)
        ctx.fillRect(px, py - 12 * s + ti * 4 * s, 1 * s, 1 * s)
        ctx.fillStyle = hair
      }
      break
    case 'braids':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 4 * s)
      ctx.fillRect(px - 8 * s, py - 14 * s, 3 * s, 14 * s)
      ctx.fillRect(px + 5 * s, py - 14 * s, 3 * s, 14 * s)
      // Braid texture
      for (let bi = 0; bi < 5; bi++) {
        ctx.fillStyle = hairLight
        ctx.fillRect(px - 8 * s, py - 12 * s + bi * 3 * s, 1 * s, 1 * s)
        ctx.fillRect(px + 7 * s, py - 11 * s + bi * 3 * s, 1 * s, 1 * s)
        ctx.fillStyle = hair
      }
      break
    case 'cornrows':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 3 * s)
      ctx.fillRect(px - 7 * s, py - 14 * s, 2 * s, 4 * s)
      ctx.fillRect(px + 5 * s, py - 14 * s, 2 * s, 4 * s)
      // Cornrow lines front-to-back
      ctx.fillStyle = shadeColor(hair, -20)
      for (let ci = 0; ci < 4; ci++) {
        ctx.fillRect(px - 5 * s + ci * 3 * s, py - 16 * s, 1 * s, 3 * s)
      }
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 2 * s, py - 16 * s, 1 * s, 1 * s)
      break
    case 'locs':
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 4 * s)
      ctx.fillRect(px - 8 * s, py - 14 * s, 3 * s, 16 * s)
      ctx.fillRect(px + 5 * s, py - 14 * s, 3 * s, 16 * s)
      // Loc texture (small bumps)
      for (let li = 0; li < 4; li++) {
        ctx.beginPath()
        ctx.arc(px - 7 * s, py - 10 * s + li * 4 * s, 1.5 * s, 0, Math.PI * 2)
        ctx.fill()
        ctx.beginPath()
        ctx.arc(px + 7 * s, py - 12 * s + li * 4 * s, 1.5 * s, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 2 * s, py - 16 * s, 4 * s, 1 * s)
      break
    case 'coils':
      // Tight coils — small circles across head
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 3 * s)
      for (let cx2 = -2; cx2 <= 2; cx2++) {
        for (let cy2 = 0; cy2 <= 1; cy2++) {
          ctx.beginPath()
          ctx.arc(px + cx2 * 4 * s, py - 19 * s + cy2 * 4 * s, 2.5 * s, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      ctx.fillStyle = hairLight
      ctx.fillRect(px - 2 * s, py - 20 * s, 2 * s, 1 * s)
      break
    default:
      ctx.fillRect(px - 6 * s, py - 16 * s, 12 * s, 3 * s)
  }

  if (top === 'hoodie') {
    ctx.fillStyle = outfit
    ctx.fillRect(px - 8 * s, py - 18 * s, 3 * s, 8 * s)
    ctx.fillRect(px + 5 * s, py - 18 * s, 3 * s, 8 * s)
    ctx.fillRect(px - 6 * s, py - 20 * s, 12 * s, 3 * s)
    ctx.fillStyle = outfitDark
    ctx.fillRect(px - 6 * s, py - 17 * s, 12 * s, 1 * s)
  }
  if (top === 'turtleneck') {
    ctx.fillStyle = outfit
    ctx.fillRect(px - 3 * s, py - 5 * s, 6 * s, 4 * s)
    ctx.fillStyle = outfitDark
    ctx.fillRect(px - 3 * s, py - 5 * s, 6 * s, 1 * s)
  }
  if (outerwear === 'jacket') {
    const coat = config.outerwearColor || '#303D4E'
    ctx.fillStyle = coat
    ctx.fillRect(px - 5 * s, py - 5 * s, 10 * s, 3 * s)
    ctx.fillStyle = shadeColor(coat, -28)
    ctx.fillRect(px - 5 * s, py - 5 * s, 10 * s, 1 * s)
  }

  const eyeIris = config.eyeColor || '#0E1820'
  const eyeShape = config.eyeShape || 'round'
  const brow = config.browStyle || 'default'

  // ── Eyes ──────────────────────────────
  ctx.fillStyle = '#FAFAFA'
  if (eyeShape === 'wide') {
    ctx.fillRect(px - 5 * s, py - 12 * s, 4 * s, 3 * s)
    ctx.fillRect(px + 1 * s, py - 12 * s, 4 * s, 3 * s)
  } else if (eyeShape === 'almond') {
    ctx.fillRect(px - 5 * s, py - 11 * s, 4 * s, 2 * s)
    ctx.fillRect(px + 1 * s, py - 11 * s, 4 * s, 2 * s)
  } else {
    ctx.fillRect(px - 4 * s, py - 11 * s, 3 * s, 3 * s)
    ctx.fillRect(px + 1 * s, py - 11 * s, 3 * s, 3 * s)
  }
  ctx.fillStyle = eyeIris
  ctx.fillRect(px - 3 * s, py - 11 * s, 2 * s, 2 * s)
  ctx.fillRect(px + 1 * s, py - 11 * s, 2 * s, 2 * s)
  ctx.fillStyle = shadeColor(eyeIris, -40)
  ctx.fillRect(px - 3 * s, py - 11 * s, 1 * s, 1 * s)
  ctx.fillRect(px + 1 * s, py - 11 * s, 1 * s, 1 * s)
  ctx.fillStyle = '#FFFFFF'
  ctx.fillRect(px - 3 * s, py - 11 * s, 1 * s, 1 * s)
  ctx.fillRect(px + 1 * s, py - 11 * s, 1 * s, 1 * s)
  ctx.fillStyle = shadeColor(hair, -8)
  if (brow === 'thick') {
    ctx.fillRect(px - 4 * s, py - 14 * s, 3 * s, 2 * s)
    ctx.fillRect(px + 1 * s, py - 14 * s, 3 * s, 2 * s)
  } else if (brow === 'arched') {
    ctx.fillRect(px - 4 * s, py - 13 * s, 2 * s, 1 * s)
    ctx.fillRect(px - 3 * s, py - 14 * s, 2 * s, 1 * s)
    ctx.fillRect(px + 1 * s, py - 14 * s, 2 * s, 1 * s)
    ctx.fillRect(px + 2 * s, py - 13 * s, 2 * s, 1 * s)
  } else {
    ctx.fillRect(px - 4 * s, py - 13 * s, 3 * s, 1 * s)
    ctx.fillRect(px + 1 * s, py - 13 * s, 3 * s, 1 * s)
  }
  // Nose
  ctx.fillStyle = skinShadow
  ctx.fillRect(px - 1 * s, py - 9 * s, 2 * s, 2 * s)
  // Mouth
  ctx.fillStyle = shadeColor(skin, -42)
  ctx.fillRect(px - 2 * s, py - 6 * s, 4 * s, 1 * s)
  // Cheeks
  ctx.fillStyle = shadeColor(skin, -8)
  ctx.globalAlpha = 0.38
  ctx.fillRect(px - 5 * s, py - 8 * s, 2 * s, 2 * s)
  ctx.fillRect(px + 3 * s, py - 8 * s, 2 * s, 2 * s)
  ctx.globalAlpha = 1

  // ── Freckles ──────────────────────────
  if (config.freckles) {
    ctx.fillStyle = shadeColor(skin, -28)
    ctx.globalAlpha = 0.6
    const frecklePositions = [
      [-4, -9], [-2, -8], [1, -8], [3, -9],
      [-3, -7], [2, -7],
    ]
    for (const [fx, fy] of frecklePositions) {
      ctx.fillRect(px + fx * s, py + fy * s, 1 * s, 1 * s)
    }
    ctx.globalAlpha = 1
  }

  // ── Accessories ───────────────────────
  // Resolve multi-slot fields, falling back to legacy accessory key
  const glassesSlot  = config.glasses  || (config.accessory === 'glasses' ? 'round' : 'none')
  const headwearSlot = config.headwear || (config.accessory === 'hat' ? 'hat' : 'none')
  const neckwearSlot = config.neckwear || (config.accessory === 'scarf' ? 'scarf' : 'none')
  const explicitHead = !!config.headwear && config.headwear !== 'none'
  const showHeadphones = headwearSlot === 'headphones' || (!explicitHead && config.accessory === 'headphones') || isFocusing

  // Neckwear (rendered first, behind body)
  if (neckwearSlot === 'scarf') {
    ctx.fillStyle = COLORS.dustyPink
    ctx.fillRect(px - 6 * s, py - 3 * s, 12 * s, 4 * s)
    ctx.fillStyle = shadeColor(COLORS.dustyPink, -20)
    ctx.fillRect(px - 6 * s, py - 3 * s, 12 * s, 1 * s)
    ctx.fillStyle = shadeColor(COLORS.dustyPink, 15)
    ctx.fillRect(px - 1 * s, py - 2 * s, 2 * s, 4 * s)
  } else if (neckwearSlot === 'tie') {
    ctx.fillStyle = COLORS.amber
    ctx.fillRect(px - 1 * s, py - 3 * s, 2 * s, 2 * s)
    ctx.fillRect(px - 1 * s, py - 1 * s, 2 * s, 7 * s)
    ctx.fillStyle = shadeColor(COLORS.amber, -28)
    ctx.fillRect(px, py - 1 * s, 1 * s, 7 * s)
  }

  // Headwear
  if (showHeadphones) {
    ctx.fillStyle = '#1A2535'
    ctx.fillRect(px - 8 * s, py - 16 * s, 16 * s, 2 * s)
    ctx.fillRect(px - 9 * s, py - 16 * s, 2 * s, 8 * s)
    ctx.fillRect(px + 7 * s, py - 16 * s, 2 * s, 8 * s)
    ctx.fillStyle = COLORS.amber
    ctx.fillRect(px - 10 * s, py - 13 * s, 3 * s, 5 * s)
    ctx.fillRect(px + 7 * s, py - 13 * s, 3 * s, 5 * s)
    ctx.fillStyle = shadeColor(COLORS.amber, -30)
    ctx.fillRect(px - 10 * s, py - 13 * s, 1 * s, 5 * s)
    ctx.fillRect(px + 9 * s, py - 13 * s, 1 * s, 5 * s)
  } else if (headwearSlot === 'hat') {
    ctx.fillStyle = COLORS.amber
    ctx.fillRect(px - 7 * s, py - 16 * s, 14 * s, 3 * s)
    ctx.fillRect(px - 5 * s, py - 22 * s, 10 * s, 7 * s)
    ctx.fillStyle = shadeColor(COLORS.amber, 20)
    ctx.fillRect(px - 3 * s, py - 22 * s, 5 * s, 1 * s)
    ctx.fillStyle = shadeColor(COLORS.amber, -30)
    ctx.fillRect(px + 4 * s, py - 22 * s, 1 * s, 7 * s)
  } else if (headwearSlot === 'beanie') {
    ctx.fillStyle = outfit
    ctx.fillRect(px - 6 * s, py - 17 * s, 12 * s, 4 * s)
    ctx.fillStyle = outfitDark
    ctx.fillRect(px - 6 * s, py - 14 * s, 12 * s, 1 * s)
    // Beanie bobble
    ctx.beginPath()
    ctx.arc(px, py - 19 * s, 2 * s, 0, Math.PI * 2)
    ctx.fill()
  } else if (headwearSlot === 'cap') {
    ctx.fillStyle = outfit
    ctx.fillRect(px - 6 * s, py - 17 * s, 12 * s, 3 * s)
    ctx.fillRect(px - 4 * s, py - 20 * s, 8 * s, 3 * s)
    // Bill
    ctx.fillRect(px - 8 * s, py - 16 * s, 4 * s, 2 * s)
    ctx.fillStyle = outfitDark
    ctx.fillRect(px - 6 * s, py - 17 * s, 12 * s, 1 * s)
  }

  // Glasses (rendered on top of face)
  if (glassesSlot === 'round' || glassesSlot === 'rectangular') {
    ctx.strokeStyle = '#253040'
    ctx.lineWidth = 1.5
    if (glassesSlot === 'round') {
      ctx.beginPath()
      ctx.arc(px - 2.5 * s, py - 10 * s, 2.5 * s, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(px + 2.5 * s, py - 10 * s, 2.5 * s, 0, Math.PI * 2)
      ctx.stroke()
    } else {
      ctx.strokeRect(px - 5 * s, py - 12 * s, 4 * s, 3 * s)
      ctx.strokeRect(px + 1 * s, py - 12 * s, 4 * s, 3 * s)
    }
    ctx.beginPath()
    ctx.moveTo(px - 1 * s, py - 10.5 * s)
    ctx.lineTo(px + 0 * s, py - 10.5 * s)
    ctx.moveTo(px - 8 * s, py - 10.5 * s)
    ctx.lineTo(px - 5 * s, py - 10.5 * s)
    ctx.moveTo(px + 5 * s, py - 10.5 * s)
    ctx.lineTo(px + 8 * s, py - 10.5 * s)
    ctx.stroke()
  } else if (glassesSlot === 'sunglasses') {
    ctx.fillStyle = 'rgba(15, 25, 40, 0.85)'
    ctx.fillRect(px - 5 * s, py - 12 * s, 4 * s, 3 * s)
    ctx.fillRect(px + 1 * s, py - 12 * s, 4 * s, 3 * s)
    ctx.fillStyle = '#253040'
    ctx.fillRect(px - 5 * s, py - 12 * s, 4 * s, 1 * s)
    ctx.fillRect(px + 1 * s, py - 12 * s, 4 * s, 1 * s)
    ctx.fillRect(px - 1 * s, py - 12 * s, 2 * s, 1 * s)
  }

  // ── Status dot (only when a name label is shown) ──────────────────────────
  if (name) {
    const dotColors: Record<string, string> = {
      online: COLORS.sage,
      focusing: COLORS.amber,
      on_break: COLORS.dustyPink,
      away: '#888',
      offline: '#555',
    }
    ctx.fillStyle = dotColors[status] || COLORS.sage
    ctx.beginPath()
    ctx.arc(px + 7 * s, py - 15 * s, 3.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.strokeStyle = COLORS.midnight
    ctx.lineWidth = 1.5
    ctx.stroke()
  }

  // ── Coffee steam (on break) ────────────
  if (isOnBreak) {
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = 1.5
    ctx.globalAlpha = 0.5
    for (let i = 0; i < 2; i++) {
      ctx.beginPath()
      ctx.moveTo(px + 10 + i * 5, py - 20)
      ctx.quadraticCurveTo(px + 14 + i * 5, py - 26, px + 10 + i * 5, py - 32)
      ctx.stroke()
    }
    ctx.globalAlpha = 1
  }

  // ── Name label (office map). An empty name must not leave a chip.
  if (name) {
    const labelPad = 5
    const fontSize = 13
    ctx.font = `bold ${fontSize}px monospace`
    ctx.textAlign = 'center'
    const textW = ctx.measureText(name).width
    const lblX = px - textW / 2 - labelPad
    const lblY = py - 26 * s - fontSize - 2
    ctx.fillStyle = 'rgba(25,35,49,0.88)'
    ctx.fillRect(lblX, lblY, textW + labelPad * 2, fontSize + labelPad)
    ctx.fillStyle = isCurrentUser ? COLORS.amber : COLORS.cream
    ctx.fillText(name, px, lblY + fontSize)
  }
}

// ─── New floor types ──────────────────────────────────────────────────────────

export function drawFloorStone(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  const alt = ((Math.floor(x / s) + Math.floor(y / s)) % 2 === 0)
  ctx.fillStyle = alt ? '#484C58' : '#3C4050'
  ctx.fillRect(x, y, s, s)
  // Grout line (1px thin, no full stroke rect)
  ctx.fillStyle = '#2A2E3A'
  ctx.globalAlpha = 0.6
  ctx.fillRect(x, y, s, 1)
  ctx.fillRect(x, y, 1, s)
  ctx.globalAlpha = 1
  // Top highlight
  ctx.fillStyle = '#585C68'
  ctx.globalAlpha = 0.12
  ctx.fillRect(x, y, s, 3)
  ctx.globalAlpha = 1
}

export function drawFloorWoodLight(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  ctx.fillStyle = '#D0B090'
  ctx.fillRect(x, y, s, s)
  // Plank divisions
  ctx.fillStyle = '#B89070'
  ctx.globalAlpha = 0.5
  const planks = Math.floor(s / 16)
  for (let i = 1; i <= planks; i++) {
    ctx.fillRect(x, y + i * 16, s, 1)
  }
  ctx.globalAlpha = 1
  // Grain streaks
  ctx.fillStyle = '#E0C8A8'
  ctx.globalAlpha = 0.15
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x + 6 + i * 14, y, 2, s)
  }
  ctx.globalAlpha = 1
  // Top edge
  ctx.fillStyle = '#E8D0B0'
  ctx.globalAlpha = 0.14
  ctx.fillRect(x, y, s, 2)
  ctx.globalAlpha = 1
}

export function drawFloorGrass(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  ctx.fillStyle = '#558040'
  ctx.fillRect(x, y, s, s)
  const hash = (Math.floor(x / s) * 31 + Math.floor(y / s) * 17) % 100
  ctx.fillStyle = '#406830'
  ctx.globalAlpha = 0.4
  for (let i = 0; i < 8; i++) {
    const gx = x + ((hash * (i + 3)) % s)
    const gy = y + ((hash * (i + 7)) % s)
    ctx.fillRect(gx, gy, 2, 3)
  }
  ctx.fillStyle = '#70A858'
  ctx.globalAlpha = 0.25
  for (let i = 0; i < 5; i++) {
    const gx = x + ((hash * (i + 11)) % s)
    const gy = y + ((hash * (i + 5)) % s)
    ctx.fillRect(gx, gy, 2, 2)
  }
  ctx.globalAlpha = 1
}

export function drawFloorConcrete(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  ctx.fillStyle = '#383C46'
  ctx.fillRect(x, y, s, s)
  // Large slab lines (every 3 tiles)
  ctx.fillStyle = '#282C36'
  ctx.globalAlpha = 0.5
  if (Math.floor(x / s) % 3 === 0) { ctx.fillRect(x, y, 1, s) }
  if (Math.floor(y / s) % 3 === 0) { ctx.fillRect(x, y, s, 1) }
  ctx.globalAlpha = 1
  // Subtle top highlight
  ctx.fillStyle = '#484C56'
  ctx.globalAlpha = 0.1
  ctx.fillRect(x, y, s, 2)
  ctx.globalAlpha = 1
}

// ─── New furniture & objects ──────────────────────────────────────────────────

export function drawMeetingTable(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Table body — dark mahogany
  ctx.fillStyle = '#5A3818'
  ctx.fillRect(x + 3, y + 6, s - 6, s - 10)
  // Top surface lighter
  ctx.fillStyle = '#7A5030'
  ctx.fillRect(x + 3, y + 6, s - 6, 6)
  ctx.fillStyle = '#9A6840'
  ctx.fillRect(x + 3, y + 6, s - 6, 2)
  // Wood grain lines
  ctx.fillStyle = '#4A2810'
  ctx.globalAlpha = 0.3
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x + 3, y + 10 + i * 8, s - 6, 1)
  }
  ctx.globalAlpha = 1
  // Table edge highlight
  ctx.fillStyle = '#8A6040'
  ctx.globalAlpha = 0.45
  ctx.fillRect(x + 3, y + 6, 2, s - 10)
  ctx.globalAlpha = 1
  // Table legs
  ctx.fillStyle = '#4A2810'
  ctx.fillRect(x + 4, y + s - 6, 4, 5)
  ctx.fillRect(x + s - 8, y + s - 6, 4, 5)
}

export function drawPoolTable(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Outer rail (dark wood)
  ctx.fillStyle = '#3A2015'
  ctx.fillRect(x + 1, y + 1, s - 2, s - 2)
  // Rail highlight
  ctx.fillStyle = '#5A3020'
  ctx.fillRect(x + 1, y + 1, s - 2, 4)
  ctx.fillRect(x + 1, y + 1, 4, s - 2)
  // Green felt
  ctx.fillStyle = '#1A6835'
  ctx.fillRect(x + 5, y + 5, s - 10, s - 10)
  // Felt center dot
  ctx.fillStyle = '#1F8040'
  ctx.globalAlpha = 0.5
  ctx.fillRect(x + s / 2 - 1, y + s / 2 - 1, 2, 2)
  ctx.globalAlpha = 1
  // Corner pockets
  ctx.fillStyle = '#080C10'
  const ps = 4
  ctx.fillRect(x + 3, y + 3, ps, ps)
  ctx.fillRect(x + s - 3 - ps, y + 3, ps, ps)
  ctx.fillRect(x + 3, y + s - 3 - ps, ps, ps)
  ctx.fillRect(x + s - 3 - ps, y + s - 3 - ps, ps, ps)
  // Side pockets
  ctx.fillRect(x + s / 2 - 2, y + 3, 4, 3)
  ctx.fillRect(x + s / 2 - 2, y + s - 6, 4, 3)
  // Cue ball
  ctx.fillStyle = '#F0E8D8'
  ctx.beginPath()
  ctx.arc(x + s * 0.34, y + s * 0.5, 3, 0, Math.PI * 2)
  ctx.fill()
  // Ball rack
  const ballColors = ['#E8C020', '#E83020', '#2050C8', '#802080']
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = ballColors[i]
    ctx.beginPath()
    ctx.arc(x + s * 0.64 + (i % 2) * 5 - 2, y + s * 0.46 + Math.floor(i / 2) * 5, 2.5, 0, Math.PI * 2)
    ctx.fill()
    // Ball highlight
    ctx.fillStyle = shadeColor(ballColors[i], 30)
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    ctx.arc(x + s * 0.64 + (i % 2) * 5 - 3, y + s * 0.44 + Math.floor(i / 2) * 5, 1, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
}

export function drawArcadeMachine(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Cabinet body
  ctx.fillStyle = '#18082A'
  ctx.fillRect(x + 4, y + 3, s - 8, s - 4)
  // Top marquee
  ctx.fillStyle = '#280F44'
  ctx.fillRect(x + 4, y + 3, s - 8, 10)
  ctx.fillStyle = '#8040C0'
  ctx.globalAlpha = 0.6
  ctx.fillRect(x + 6, y + 5, s - 12, 6)
  ctx.globalAlpha = 1
  // Screen bezel
  ctx.fillStyle = '#100820'
  ctx.fillRect(x + 7, y + 14, s - 14, s * 0.42)
  // Screen
  ctx.fillStyle = '#000018'
  ctx.fillRect(x + 9, y + 16, s - 18, s * 0.36)
  // Screen content — retro green CRT glow
  ctx.fillStyle = '#00FF80'
  ctx.globalAlpha = 0.65
  ctx.fillRect(x + 10, y + 17, s - 20, s * 0.3)
  ctx.globalAlpha = 1
  ctx.strokeStyle = '#00CC66'
  ctx.lineWidth = 1
  ctx.globalAlpha = 0.5
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo(x + 11, y + 19 + i * 4)
    ctx.lineTo(x + s - 11, y + 19 + i * 4)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  // Control panel
  ctx.fillStyle = '#200C38'
  ctx.fillRect(x + 4, y + Math.floor(s * 0.56), s - 8, Math.floor(s * 0.3))
  // Joystick ball
  ctx.fillStyle = '#606070'
  ctx.beginPath()
  ctx.arc(x + s * 0.3, y + s * 0.7, 4, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#CC2020'
  ctx.beginPath()
  ctx.arc(x + s * 0.29, y + s * 0.68, 3, 0, Math.PI * 2)
  ctx.fill()
  // Buttons
  const btnC = ['#DD2222', '#2222DD', '#22AA22', '#DDDD22']
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = btnC[i]
    ctx.beginPath()
    ctx.arc(x + s * 0.56 + (i % 2) * 8, y + s * 0.67 + Math.floor(i / 2) * 6, 3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = shadeColor(btnC[i], 30)
    ctx.globalAlpha = 0.5
    ctx.beginPath()
    ctx.arc(x + s * 0.56 + (i % 2) * 8 - 1, y + s * 0.66 + Math.floor(i / 2) * 6, 1.5, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
  }
  // Coin slot
  ctx.fillStyle = '#080C14'
  ctx.fillRect(x + s / 2 - 3, y + Math.floor(s * 0.56) + 4, 6, 3)
}

export function drawFireplace(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Stone surround
  ctx.fillStyle = '#585870'
  ctx.fillRect(x + 2, y + 4, s - 4, s - 4)
  // Stone texture
  ctx.fillStyle = '#686880'
  ctx.fillRect(x + 2, y + 4, s - 4, 3)
  ctx.fillStyle = '#484858'
  ctx.fillRect(x + 2, y + s - 6, s - 4, 3)
  // Firebox opening
  ctx.fillStyle = '#181220'
  ctx.fillRect(x + 8, y + 10, s - 16, s - 18)
  // Ember / ash base
  ctx.fillStyle = '#3A1808'
  ctx.fillRect(x + 8, y + s - 14, s - 16, 6)
  // Fire glow
  ctx.fillStyle = '#FF6010'
  ctx.globalAlpha = 0.85
  ctx.beginPath()
  ctx.ellipse(x + s / 2, y + s - 12, s * 0.24, s * 0.16, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#FFCC00'
  ctx.globalAlpha = 0.8
  ctx.beginPath()
  ctx.ellipse(x + s / 2, y + s - 14, s * 0.13, s * 0.1, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = '#FFF8D0'
  ctx.globalAlpha = 0.55
  ctx.beginPath()
  ctx.ellipse(x + s / 2, y + s - 15, s * 0.07, s * 0.06, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.globalAlpha = 1
  // Flames
  ctx.fillStyle = '#FF8020'
  ctx.globalAlpha = 0.75
  for (let i = -1; i <= 1; i++) {
    ctx.beginPath()
    ctx.moveTo(x + s / 2 + i * 7, y + s - 12)
    ctx.quadraticCurveTo(x + s / 2 + i * 9, y + s - 22, x + s / 2 + i * 4, y + s - 27)
    ctx.quadraticCurveTo(x + s / 2 + i * 1, y + s - 19, x + s / 2 + i * 6, y + s - 12)
    ctx.fill()
  }
  ctx.globalAlpha = 1
  // Mantle shelf
  ctx.fillStyle = '#6A6A80'
  ctx.fillRect(x + 1, y + 4, s - 2, 6)
  ctx.fillStyle = '#7A7A90'
  ctx.fillRect(x + 1, y + 4, s - 2, 2)
}

export function drawServerRack(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Rack casing
  ctx.fillStyle = '#181C26'
  ctx.fillRect(x + 3, y + 2, s - 6, s - 3)
  ctx.fillStyle = '#0E1018'
  ctx.fillRect(x + 5, y + 4, s - 10, s - 6)
  // Server units
  const unitLedColors = ['#006655', '#004499', '#880044']
  for (let i = 0; i < 5; i++) {
    const uy = y + 5 + i * 8
    ctx.fillStyle = '#242830'
    ctx.fillRect(x + 5, uy, s - 10, 7)
    ctx.fillStyle = '#1C2028'
    ctx.fillRect(x + 5, uy, s - 10, 1)
    // LED indicators
    for (let j = 0; j < 3; j++) {
      ctx.fillStyle = unitLedColors[j % unitLedColors.length]
      ctx.globalAlpha = 0.9
      ctx.beginPath()
      ctx.arc(x + s - 14 + j * 4, uy + 3.5, 1.5, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.globalAlpha = 1
    // Drive bay
    ctx.fillStyle = '#0088EE'
    ctx.globalAlpha = 0.5
    ctx.fillRect(x + 7, uy + 2, 14, 3)
    ctx.globalAlpha = 1
  }
  // Rail handles
  ctx.fillStyle = '#2A3040'
  ctx.fillRect(x + 3, y + 2, 2, s - 3)
  ctx.fillRect(x + s - 5, y + 2, 2, s - 3)
}

export function drawFridge(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Body
  ctx.fillStyle = '#C0C8D0'
  ctx.fillRect(x + 3, y + 2, s - 6, s - 3)
  ctx.fillStyle = '#D0D8E0'
  ctx.fillRect(x + 3, y + 2, s - 6, 3)
  ctx.fillStyle = '#A8B0B8'
  ctx.fillRect(x + 3, y + s - 6, s - 6, 5)
  // Door line between freezer and main
  ctx.fillStyle = '#909898'
  ctx.fillRect(x + 3, y + Math.floor(s * 0.35), s - 6, 2)
  // Freezer compartment
  ctx.fillStyle = '#D8E0E8'
  ctx.fillRect(x + 4, y + 3, s - 8, Math.floor(s * 0.32))
  // Handles
  ctx.fillStyle = '#787E88'
  ctx.fillRect(x + s - 10, y + 5, 3, 9)
  ctx.fillRect(x + s - 10, y + Math.floor(s * 0.38), 3, 11)
  // Vent grill
  ctx.fillStyle = '#909898'
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(x + 6, y + s - 11 + i * 3, s - 12, 1)
  }
}

export function drawKettle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Kettle body (rounded rectangle pixel-art)
  ctx.fillStyle = '#9A6040'
  ctx.fillRect(x + 9, y + 12, s - 18, s - 18)
  ctx.fillStyle = '#C87850'
  ctx.fillRect(x + 7, y + 14, s - 14, s - 22)
  ctx.fillStyle = '#B06840'
  ctx.fillRect(x + 7, y + s - 10, s - 14, 4)
  // Body highlight
  ctx.fillStyle = '#E09060'
  ctx.globalAlpha = 0.4
  ctx.fillRect(x + 7, y + 14, 4, s - 22)
  ctx.globalAlpha = 1
  // Lid
  ctx.fillStyle = '#7A4828'
  ctx.fillRect(x + 10, y + 10, s - 20, 5)
  ctx.fillStyle = '#A06040'
  ctx.fillRect(x + 10, y + 10, s - 20, 2)
  // Lid knob
  ctx.fillStyle = '#604020'
  ctx.fillRect(x + s / 2 - 2, y + 7, 4, 4)
  // Spout
  ctx.fillStyle = '#7A4828'
  ctx.fillRect(x + s - 12, y + 16, 5, 3)
  ctx.fillRect(x + s - 10, y + 13, 4, 4)
  // Handle
  ctx.fillStyle = '#604020'
  ctx.fillRect(x + 4, y + 16, 4, 3)
  ctx.fillRect(x + 4, y + 22, 4, 3)
  ctx.fillRect(x + 4, y + 16, 3, 9)
  // Steam
  ctx.strokeStyle = '#D8D0C8'
  ctx.lineWidth = 1.5
  ctx.globalAlpha = 0.45
  ctx.beginPath()
  ctx.moveTo(x + s / 2 - 2, y + 10)
  ctx.quadraticCurveTo(x + s / 2 - 6, y + 5, x + s / 2 - 2, y + 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(x + s / 2 + 3, y + 10)
  ctx.quadraticCurveTo(x + s / 2 + 7, y + 5, x + s / 2 + 3, y + 2)
  ctx.stroke()
  ctx.globalAlpha = 1
}

export function drawCounter(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Counter top surface
  ctx.fillStyle = '#E8E0D0'
  ctx.fillRect(x + 1, y + 4, s - 2, Math.floor(s * 0.5))
  ctx.fillStyle = '#F4EDE0'
  ctx.fillRect(x + 1, y + 4, s - 2, 3)
  ctx.fillStyle = '#D0C8B8'
  ctx.globalAlpha = 0.5
  ctx.fillRect(x + s - 3, y + 4, 2, Math.floor(s * 0.5))
  ctx.globalAlpha = 1
  // Counter front face
  ctx.fillStyle = '#C8B898'
  ctx.fillRect(x + 1, y + Math.floor(s * 0.5), s - 2, Math.floor(s * 0.35))
  ctx.fillStyle = '#B0A080'
  ctx.fillRect(x + 1, y + s - 8, s - 2, 5)
  // Cabinet doors
  ctx.fillStyle = '#B8A888'
  ctx.fillRect(x + 2, y + Math.floor(s * 0.52), Math.floor((s - 6) / 2), Math.floor(s * 0.32))
  ctx.fillRect(x + Math.floor((s - 2) / 2) + 2, y + Math.floor(s * 0.52), Math.floor((s - 6) / 2), Math.floor(s * 0.32))
  // Cabinet handles
  ctx.fillStyle = '#888070'
  ctx.fillRect(x + Math.floor((s - 6) / 2) - 2, y + Math.floor(s * 0.62), 4, 2)
  ctx.fillRect(x + Math.floor(s * 0.65), y + Math.floor(s * 0.62), 4, 2)
}

export function drawBarStool(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Seat (leather/vinyl look)
  ctx.fillStyle = '#503828'
  ctx.fillRect(x + Math.floor(s * 0.2), y + Math.floor(s * 0.22), Math.floor(s * 0.6), Math.floor(s * 0.2))
  ctx.fillStyle = '#604838'
  ctx.fillRect(x + Math.floor(s * 0.2), y + Math.floor(s * 0.22), Math.floor(s * 0.6), 4)
  ctx.fillStyle = '#382818'
  ctx.fillRect(x + Math.floor(s * 0.2), y + Math.floor(s * 0.38), Math.floor(s * 0.6), 3)
  // Post
  ctx.fillStyle = '#808890'
  ctx.fillRect(x + Math.floor(s / 2) - 2, y + Math.floor(s * 0.42), 4, Math.floor(s * 0.44))
  // Footrest ring
  ctx.fillStyle = '#707880'
  ctx.fillRect(x + Math.floor(s * 0.28), y + Math.floor(s * 0.62), Math.floor(s * 0.44), 3)
  // Base
  ctx.fillStyle = '#606870'
  ctx.fillRect(x + Math.floor(s * 0.18), y + Math.floor(s * 0.83), Math.floor(s * 0.64), 4)
  ctx.fillStyle = '#404850'
  ctx.fillRect(x + Math.floor(s * 0.18), y + Math.floor(s * 0.86), Math.floor(s * 0.64), 2)
}

export function drawFocusPod(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Pod walls
  ctx.fillStyle = '#384055'
  ctx.fillRect(x + 2, y + 2, s - 4, s - 4)
  // Interior walls
  ctx.fillStyle = '#283040'
  ctx.fillRect(x + 6, y + 6, s - 12, s - 8)
  // Desk inside pod
  ctx.fillStyle = '#C8A878'
  ctx.fillRect(x + 8, y + 10, s - 16, 10)
  ctx.fillStyle = '#DEC090'
  ctx.fillRect(x + 8, y + 10, s - 16, 2)
  // Monitor
  ctx.fillStyle = '#1A2535'
  ctx.fillRect(x + 12, y + 7, s - 24, 7)
  ctx.fillStyle = '#3A78BB'
  ctx.fillRect(x + 13, y + 8, s - 26, 5)
  ctx.fillStyle = '#6AAAE8'
  ctx.globalAlpha = 0.4
  ctx.fillRect(x + 13, y + 8, s - 26, 2)
  ctx.globalAlpha = 1
  // Seat
  ctx.fillStyle = '#485E7A'
  ctx.fillRect(x + 10, y + s - 14, s - 20, 8)
  ctx.fillStyle = '#5A7090'
  ctx.fillRect(x + 10, y + s - 14, s - 20, 2)
  // Privacy panel
  ctx.fillStyle = '#424A60'
  ctx.fillRect(x + 2, y + 2, s - 4, 4)
  ctx.fillStyle = '#525A70'
  ctx.fillRect(x + 2, y + 2, s - 4, 2)
}

export function drawWindowH(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Frame
  ctx.fillStyle = '#344454'
  ctx.fillRect(x, y + 8, s, 4)
  ctx.fillRect(x, y + s - 12, s, 4)
  // Glass
  ctx.fillStyle = '#A8D8F0'
  ctx.globalAlpha = 0.3
  ctx.fillRect(x + 2, y + 12, s - 4, s - 24)
  ctx.globalAlpha = 1
  // Mullion
  ctx.fillStyle = '#344454'
  ctx.fillRect(x + s / 2 - 1, y + 8, 2, s - 20)
  // Sky reflection
  ctx.fillStyle = '#C8EAF8'
  ctx.globalAlpha = 0.25
  ctx.fillRect(x + 4, y + 14, 5, s - 28)
  ctx.globalAlpha = 1
}

export function drawWindowV(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Frame
  ctx.fillStyle = '#344454'
  ctx.fillRect(x + 8, y, 4, s)
  ctx.fillRect(x + s - 12, y, 4, s)
  // Glass
  ctx.fillStyle = '#A8D8F0'
  ctx.globalAlpha = 0.3
  ctx.fillRect(x + 12, y + 2, s - 24, s - 4)
  ctx.globalAlpha = 1
  // Mullion
  ctx.fillStyle = '#344454'
  ctx.fillRect(x + 12, y + s / 2 - 1, s - 24, 2)
  // Reflection
  ctx.fillStyle = '#C8EAF8'
  ctx.globalAlpha = 0.25
  ctx.fillRect(x + 14, y + 4, s - 28, 5)
  ctx.globalAlpha = 1
}

export function drawPlantFlowers(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  // Terracotta pot
  ctx.fillStyle = '#C86848'
  ctx.fillRect(x + Math.floor(s * 0.25), y + Math.floor(s * 0.6), Math.floor(s * 0.5), Math.floor(s * 0.35))
  ctx.fillStyle = '#D87858'
  ctx.fillRect(x + Math.floor(s * 0.23), y + Math.floor(s * 0.57), Math.floor(s * 0.54), 5)
  ctx.fillStyle = '#985838'
  ctx.fillRect(x + Math.floor(s * 0.25), y + Math.floor(s * 0.88), Math.floor(s * 0.5), 4)
  // Soil
  ctx.fillStyle = '#3A2818'
  ctx.fillRect(x + Math.floor(s * 0.25) + 1, y + Math.floor(s * 0.57), Math.floor(s * 0.5) - 2, 4)
  // Stems
  ctx.fillStyle = '#4A8030'
  ctx.fillRect(x + Math.floor(s / 2) - 1, y + Math.floor(s * 0.57), 2, Math.floor(s * 0.2))
  ctx.fillRect(x + Math.floor(s * 0.35), y + Math.floor(s * 0.45), 2, Math.floor(s * 0.14))
  ctx.fillRect(x + Math.floor(s * 0.62), y + Math.floor(s * 0.44), 2, Math.floor(s * 0.14))
  // Leaves
  ctx.fillStyle = '#5A9A40'
  ctx.fillRect(x + Math.floor(s * 0.3), y + Math.floor(s * 0.46), Math.floor(s * 0.14), 5)
  ctx.fillRect(x + Math.floor(s * 0.56), y + Math.floor(s * 0.44), Math.floor(s * 0.14), 5)
  // Flower petals — pixel-art style
  const flowerData: Array<[number, number, string]> = [
    [s / 2, s * 0.2, '#FF6080'],
    [s * 0.3, s * 0.3, '#FF80A0'],
    [s * 0.68, s * 0.28, '#FF90B0'],
  ]
  for (const [fx, fy, fColor] of flowerData) {
    ctx.fillStyle = fColor
    // 5-petal pixel flower
    ctx.fillRect(x + Math.floor(fx) - 2, y + Math.floor(fy) - 5, 4, 3)  // top
    ctx.fillRect(x + Math.floor(fx) - 2, y + Math.floor(fy) + 2, 4, 3)  // bottom
    ctx.fillRect(x + Math.floor(fx) - 5, y + Math.floor(fy) - 2, 3, 4)  // left
    ctx.fillRect(x + Math.floor(fx) + 2, y + Math.floor(fy) - 2, 3, 4)  // right
    // Center
    ctx.fillStyle = '#FFE840'
    ctx.fillRect(x + Math.floor(fx) - 2, y + Math.floor(fy) - 2, 4, 4)
  }
}

export function drawStairs(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  const s = size
  const steps = 5
  for (let i = 0; i < steps; i++) {
    const shade = 72 + i * 18
    ctx.fillStyle = `rgb(${shade},${shade - 8},${shade - 16})`
    ctx.fillRect(x + i * Math.floor(s / steps), y, s - i * Math.floor(s / steps), s)
    // Step top edge highlight
    ctx.fillStyle = `rgba(255,255,255,0.14)`
    ctx.fillRect(x + i * Math.floor(s / steps), y, s - i * Math.floor(s / steps), 2)
    // Step bottom shadow
    ctx.fillStyle = `rgba(0,0,0,0.18)`
    ctx.fillRect(x + i * Math.floor(s / steps), y + s - 2, s - i * Math.floor(s / steps), 2)
  }
}

function shadeColor(color: string, percent: number): string {
  const num = parseInt(color.replace('#', ''), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + percent))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + percent))
  const b = Math.max(0, Math.min(255, (num & 0xff) + percent))
  return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')
}
