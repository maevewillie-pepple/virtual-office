import type { CafeDrink, LatteArt } from '../../types'
import type { CafePhase } from './logic'

export interface StationScene {
  view: 'world' | 'cup' | 'result'
  camera: 'counter' | 'grind' | 'machine' | 'steam' | 'kettle'
  drink: CafeDrink
  phase: CafePhase | 'idle'
  progress: number
  running: boolean
  holding: boolean
  grounds: number
  lock: number
  cup: number
  pitcher: number
  foam: number
  pourX: number
  pouring: boolean
  samples: number[]
  art?: LatteArt
  strength: number
  tea?: string
  topping?: string
  stir: number
  sprinkle: boolean
  tick: number
  reduced: boolean
  stars?: number
}

const W = 256
const H = 160

const INK = '#2A2420'
const WALL = '#E7D3B5'
const WALL2 = '#C4A574'
const WOOD = '#8C6244'
const WOOD2 = '#A68456'
const WOOD3 = '#6B4A32'
const MACHINE = '#2C4034'
const MACHINE2 = '#3E5C48'
const MACHINE3 = '#8AA58A'
const BRASS = '#E3B775'
const CUP = '#F7F1E6'
const CUP2 = '#E4D5C0'
const COFFEE = '#4A2C22'
const CREMA = '#E3C07A'
const MILK = '#FFFEFA'
const STEEL = '#C8C2B8'
const STEEL2 = '#8A8478'
const BEAN = '#6B3A28'

const CAM = {
  counter: { x: 0, y: 0, z: 1 },
  grind: { x: 96, y: 24, z: 2 },
  machine: { x: 0, y: 40, z: 2 },
  steam: { x: 136, y: 24, z: 2 },
  kettle: { x: 148, y: 32, z: 2 },
}

let cam = { x: 0, y: 0, z: 1 }

export function resetCamera() {
  cam = { x: 0, y: 0, z: 1 }
}

export function stationSize() {
  return { w: W, h: H }
}

export function drawStation(ctx: CanvasRenderingContext2D, scene: StationScene) {
  ctx.imageSmoothingEnabled = false
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.fillStyle = WALL
  ctx.fillRect(0, 0, W, H)
  if (scene.view === 'cup') {
    drawTopCup(ctx, scene)
    return
  }
  if (scene.view === 'result') {
    drawResult(ctx, scene)
    return
  }
  const target = CAM[scene.camera]
  if (scene.reduced || target.z !== cam.z) cam = { ...target }
  else {
    cam.x += (target.x - cam.x) * 0.2
    cam.y += (target.y - cam.y) * 0.2
  }
  const z = cam.z
  ctx.setTransform(z, 0, 0, z, -Math.round(cam.x * z), -Math.round(cam.y * z))
  drawWorld(ctx, scene)
  ctx.setTransform(1, 0, 0, 1, 0, 0)
}

export function drawIcon(ctx: CanvasRenderingContext2D, drink: CafeDrink) {
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, 32, 32)
  ctx.fillStyle = '#F3E6D0'
  ctx.fillRect(0, 0, 32, 32)
  if (drink === 'latte' || drink === 'flat_white') {
    disc(ctx, 16, 17, 12, CUP)
    disc(ctx, 16, 17, 9, '#FFFDF8')
    disc(ctx, 16, 16, 7, COFFEE)
    heart(ctx, 16, 14, 2, MILK)
    return
  }
  pix(ctx, 3, 26, 22, 3, '#E4D2B8')
  pix(ctx, 6, 12, 16, 14, CUP)
  pix(ctx, 8, 15, 12, 8, '#FFFDF8')
  pix(ctx, 4, 9, 20, 5, CUP)
  pix(ctx, 22, 15, 3, 2, CUP2)
  pix(ctx, 24, 16, 2, 7, CUP2)
  pix(ctx, 22, 22, 3, 2, CUP2)
  const fill = drink === 'espresso' ? COFFEE : drink === 'cappuccino' ? MILK : drink === 'cocoa' ? '#6B3A28' : '#C4A15A'
  pix(ctx, 6, 10, 16, 3, fill)
  if (drink === 'espresso') pix(ctx, 7, 10, 14, 1, CREMA)
  if (drink === 'cappuccino') {
    pix(ctx, 6, 8, 16, 3, MILK)
    pix(ctx, 10, 8, 2, 2, BEAN)
    pix(ctx, 15, 9, 2, 2, BEAN)
  }
  if (drink === 'cocoa') {
    pix(ctx, 9, 6, 4, 3, MILK)
    pix(ctx, 15, 5, 4, 3, MILK)
  }
  if (drink === 'tea') pix(ctx, 13, 5, 2, 7, '#5C5348')
}

function pix(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

function disc(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color
  for (let y = -r; y <= r; y++) {
    const span = Math.floor(Math.sqrt(r * r - y * y))
    ctx.fillRect(cx - span, cy + y, span * 2 + 1, 1)
  }
}

function drawWorld(ctx: CanvasRenderingContext2D, scene: StationScene) {
  pix(ctx, 0, 0, W, 108, '#F3E6D0')
  pix(ctx, 0, 0, W, 22, '#E7D3B5')
  pix(ctx, 12, 30, 96, 74, '#F7F1E6')
  pix(ctx, 12, 30, 96, 3, WALL2)
  pix(ctx, 0, 24, W, 4, WOOD3)
  shelfCups(ctx)
  pix(ctx, 176, 10, 14, 12, '#7A8F62')
  pix(ctx, 194, 10, 14, 12, '#C4A15A')
  pix(ctx, 212, 10, 14, 12, '#8AA58A')
  pix(ctx, 230, 10, 14, 12, '#6B8F78')
  pix(ctx, 178, 12, 10, 2, '#F7F1E6')
  pix(ctx, 232, 12, 10, 2, '#F7F1E6')

  drawMachine(ctx, scene)
  drawGrinder(ctx, scene)
  drawWand(ctx, scene)
  drawPitcher(ctx, scene)
  drawKettle(ctx, scene)
  drawServiceMug(ctx, scene)

  pix(ctx, 0, 108, W, 6, WOOD3)
  pix(ctx, 0, 114, W, 46, WOOD2)
  for (let x = 0; x < W; x += 12) pix(ctx, x, 114, 1, 46, WOOD)
  pix(ctx, 18, 118, 6, 14, WOOD3)
  pix(ctx, 22, 116, 8, 4, STEEL)

  const portaX = 124 + (48 - 124) * scene.lock
  const portaY = 96 + (84 - 96) * scene.lock
  drawPortafilter(ctx, portaX, portaY, scene.grounds)

  const cupX = 98 + (46 - 98) * scene.cup
  const cupY = 124 + (100 - 124) * scene.cup
  const showCoffee = scene.phase === 'pull' || scene.phase === 'dust'
  drawCounterCup(ctx, cupX, cupY, showCoffee ? Math.max(scene.progress, 0.15) : 0, scene)

  if (scene.running && scene.phase === 'pull') {
    const drip = scene.tick % 6
    pix(ctx, 51, 96, 3, 12 + drip, COFFEE)
    pix(ctx, 63, 96, 3, 10 + drip, CREMA)
  }
  if (scene.phase === 'leaf') {
    const tins = ['#7A8F62', '#C4A15A', '#8AA58A', '#6B8F78']
    tins.forEach((color, index) => {
      const x = 156 + index * 24
      pix(ctx, x, 40, 18, 16, color)
      pix(ctx, x + 2, 42, 14, 3, '#F7F1E6')
    })
  }
  if (scene.sprinkle) {
    for (let i = 0; i < 6; i++) {
      const y = 90 + ((scene.tick * 2 + i * 4) % 16)
      pix(ctx, 56 + i * 3, y, 2, 2, BEAN)
    }
  }
  if (scene.holding && !scene.reduced) {
    for (let i = 0; i < 4; i++) {
      const y = 78 + ((scene.tick * 3 + i * 6) % 18)
      pix(ctx, 132 + (i % 2) * 4, y, 2, 2, BEAN)
    }
  }
  if (scene.running && scene.phase === 'steam' && !scene.reduced) {
    const rise = scene.tick % 10
    pix(ctx, 186, 46 - rise, 2, 2, 'rgba(255,255,255,0.9)')
    pix(ctx, 192, 40 - ((rise + 4) % 10), 2, 2, 'rgba(255,255,255,0.75)')
  }
  if (scene.running && (scene.phase === 'kettle' || scene.phase === 'heat') && !scene.reduced) {
    pix(ctx, 188, 70, 16, 3, scene.phase === 'kettle' ? '#D8E4EA' : '#F4EFE4')
  }
}

function shelfCups(ctx: CanvasRenderingContext2D) {
  miniCup(ctx, 10, 8)
  miniCup(ctx, 24, 8)
  miniCup(ctx, 38, 8)
}

function miniCup(ctx: CanvasRenderingContext2D, x: number, y: number) {
  pix(ctx, x, y + 2, 8, 6, CUP)
  pix(ctx, x - 1, y, 10, 3, CUP)
  pix(ctx, x + 8, y + 3, 2, 3, CUP2)
}

function drawMachine(ctx: CanvasRenderingContext2D, scene: StationScene) {
  pix(ctx, 28, 102, 8, 6, INK)
  pix(ctx, 78, 102, 8, 6, INK)
  pix(ctx, 18, 96, 84, 7, '#1B2822')
  for (let x = 22; x < 96; x += 6) pix(ctx, x, 94, 3, 3, '#31443A')
  pix(ctx, 22, 40, 76, 56, MACHINE)
  pix(ctx, 26, 44, 68, 20, MACHINE2)
  pix(ctx, 34, 26, 48, 16, '#3E5C48')
  pix(ctx, 38, 30, 40, 6, '#8FB59A')
  disc(ctx, 40, 70, 7, BRASS)
  disc(ctx, 40, 70, 3, '#1E2C26')
  pix(ctx, 54, 62, 8, 6, BRASS)
  pix(ctx, 66, 62, 8, 6, scene.running && scene.phase === 'pull' ? '#C45A4A' : MACHINE3)
  pix(ctx, 78, 64, 10, 4, '#1E2C26')
  pix(ctx, 46, 84, 26, 8, '#243830')
  pix(ctx, 50, 90, 6, 6, STEEL)
  pix(ctx, 64, 90, 6, 6, STEEL)
  pix(ctx, 92, 48, 6, 12, BRASS)
}

function drawGrinder(ctx: CanvasRenderingContext2D, scene: StationScene) {
  const shake = scene.holding && !scene.reduced ? (scene.tick % 2) : 0
  pix(ctx, 114, 20, 40, 6, '#3A322C')
  pix(ctx, 118, 26, 32, 12, '#2A2420')
  pix(ctx, 124, 28, 4, 3, BEAN)
  pix(ctx, 132, 30, 4, 3, '#8C4A32')
  pix(ctx, 140, 28, 3, 3, BEAN)
  pix(ctx, 126, 38, 16, 8, '#5C5348')
  pix(ctx, 116 + shake, 46, 36, 42, '#4A4038')
  pix(ctx, 120 + shake, 50, 28, 8, '#6B5E52')
  disc(ctx, 134, 70, 6, BRASS)
  disc(ctx, 134, 70, 2, INK)
  pix(ctx, 128, 86, 14, 8, STEEL)
}

function drawWand(ctx: CanvasRenderingContext2D, scene: StationScene) {
  if (scene.phase === 'leaf' || scene.phase === 'kettle' || scene.phase === 'steep' || scene.phase === 'heat' || scene.phase === 'stir' || scene.phase === 'top') return
  pix(ctx, 168, 32, 8, 28, STEEL2)
  pix(ctx, 160, 56, 18, 5, STEEL)
  pix(ctx, 166, 60, 4, 10, STEEL2)
}

function drawPitcher(ctx: CanvasRenderingContext2D, scene: StationScene) {
  if (scene.phase === 'leaf' || scene.phase === 'kettle' || scene.phase === 'steep' || scene.phase === 'heat' || scene.phase === 'stir' || scene.phase === 'top') return
  const y = 64 + scene.pitcher * 22
  pix(ctx, 176, y + 10, 24, 20, STEEL)
  pix(ctx, 180, y + 4, 16, 10, '#D5D0C8')
  pix(ctx, 182, y, 12, 5, '#EEEAE4')
  pix(ctx, 168, y + 6, 10, 4, STEEL)
  pix(ctx, 164, y + 4, 6, 3, STEEL2)
  pix(ctx, 200, y + 8, 3, 16, STEEL2)
  pix(ctx, 196, y + 8, 6, 3, STEEL2)
  pix(ctx, 196, y + 20, 6, 3, STEEL2)
  pix(ctx, 182, y + 14, 14, 12, scene.foam > 0.55 ? MILK : '#F4EFE4')
  if (scene.foam < 0.45 && scene.running) {
    pix(ctx, 186, y + 16, 3, 3, CUP2)
    pix(ctx, 192, y + 18, 3, 3, CUP2)
  }
}

function drawKettle(ctx: CanvasRenderingContext2D, scene: StationScene) {
  pix(ctx, 214, 58, 26, 16, STEEL)
  pix(ctx, 218, 50, 18, 10, '#D5D0C8')
  pix(ctx, 222, 44, 10, 8, STEEL2)
  pix(ctx, 225, 40, 4, 5, WOOD3)
  pix(ctx, 204, 62, 12, 4, STEEL)
  pix(ctx, 200, 60, 6, 3, STEEL2)
  pix(ctx, 210, 52, 4, 16, WOOD3)
  pix(ctx, 210, 50, 12, 3, WOOD3)
  if (scene.phase === 'heat' && scene.running) pix(ctx, 220, 62, 14, 6, '#F4EFE4')
}

function drawServiceMug(ctx: CanvasRenderingContext2D, scene: StationScene) {
  const tea = scene.phase === 'leaf' || scene.phase === 'kettle' || scene.phase === 'steep'
  const cocoa = scene.phase === 'heat' || scene.phase === 'stir' || scene.phase === 'top'
  if (!tea && !cocoa) return
  const color = cocoa ? mixCocoa(scene.stir) : teaColor(scene.tea, scene.phase === 'kettle' ? scene.progress * 0.2 : scene.progress)
  pix(ctx, 164, 78, 32, 22, CUP)
  pix(ctx, 196, 84, 6, 10, CUP2)
  pix(ctx, 168, 82, 24, 14, color)
  if (tea && scene.phase !== 'leaf') pix(ctx, 176, 74, 4, 16, STEEL2)
  if (cocoa) {
    const angle = scene.stir
    pix(ctx, 174 + Math.cos(angle) * 8, 86 + Math.sin(angle) * 4, 10, 3, WOOD3)
    if (scene.stir < 4) {
      pix(ctx, 172, 88, 4, 3, BEAN)
      pix(ctx, 182, 90, 3, 3, '#8C6244')
    }
  }
  if (scene.phase === 'top' && scene.topping) drawTopping(ctx, 170, 80, 2, scene.topping)
}

function drawPortafilter(ctx: CanvasRenderingContext2D, x: number, y: number, grounds: number) {
  pix(ctx, x, y, 22, 8, INK)
  pix(ctx, x + 4, y + 2, 14, 4, grounds > 0.05 ? BEAN : '#3A322C')
  const pile = Math.floor(grounds * 4)
  if (pile) pix(ctx, x + 6, y + 2 - pile, 10, pile, '#5C3A28')
  pix(ctx, x + 20, y + 2, 12, 3, WOOD3)
}

function drawCounterCup(ctx: CanvasRenderingContext2D, x: number, y: number, fill: number, scene: StationScene) {
  pix(ctx, x - 2, y + 12, 24, 3, CUP2)
  pix(ctx, x + 2, y + 4, 16, 10, CUP)
  pix(ctx, x, y + 2, 20, 4, '#FFFEFA')
  pix(ctx, x + 18, y + 6, 3, 2, CUP2)
  pix(ctx, x + 20, y + 6, 2, 6, CUP2)
  pix(ctx, x + 18, y + 11, 3, 2, CUP2)
  const h = Math.floor(Math.min(1, fill) * 8)
  if (h) {
    pix(ctx, x + 3, y + 12 - h, 14, h, COFFEE)
    if (h > 3) pix(ctx, x + 3, y + 12 - h, 14, 2, CREMA)
  }
  if (scene.sprinkle) {
    pix(ctx, x + 6, y + 4, 2, 2, BEAN)
    pix(ctx, x + 11, y + 5, 2, 2, BEAN)
  }
}

function drawTopCup(ctx: CanvasRenderingContext2D, scene: StationScene) {
  pix(ctx, 0, 0, W, H, WOOD2)
  for (let x = 0; x < W; x += 12) pix(ctx, x, 0, 1, H, WOOD)
  disc(ctx, 128, 82, 52, CUP)
  disc(ctx, 128, 82, 40, CUP2)
  disc(ctx, 128, 82, 34, COFFEE)
  disc(ctx, 128, 80, 34, '#5C3828')
  const art = scene.art
  const grow = art ? 1 : Math.min(1, scene.samples.length / 10)
  if (art === 'heart' || (!art && centered(scene.samples))) heart(ctx, 128, 78, 6 + grow * 2, MILK)
  else if (art === 'tulip') tulip(ctx, 128, 80)
  else if (art === 'rosetta') rosetta(ctx, 128, 82)
  else if (art === 'swirl' || scene.samples.length > 2) swirl(ctx, 128, 82, scene.samples)
  if (scene.pouring) {
    const x = 78 + scene.pourX * 100
    pix(ctx, x, 18, 4, 28, MILK)
    pix(ctx, x - 8, 8, 20, 12, STEEL)
    disc(ctx, x + 2, 78, 4, MILK)
  }
  pix(ctx, 168, 18, 28, 16, STEEL)
}

function drawResult(ctx: CanvasRenderingContext2D, scene: StationScene) {
  pix(ctx, 0, 0, W, 108, '#F3E6D0')
  pix(ctx, 0, 108, W, 52, WOOD2)
  pix(ctx, 0, 108, W, 4, WOOD3)
  for (let x = 0; x < W; x += 14) pix(ctx, x, 112, 1, 48, WOOD)
  const stars = scene.stars ?? 3
  if (scene.drink === 'latte' || scene.drink === 'flat_white') {
    disc(ctx, 128, 58, 44, CUP)
    disc(ctx, 128, 58, 36, '#FFFDF8')
    disc(ctx, 128, 56, 28, COFFEE)
    disc(ctx, 128, 54, 28, '#5C3828')
    if (scene.art === 'heart' || stars >= 4) heart(ctx, 128, 48, stars >= 5 ? 6 : 5, MILK)
    else if (scene.art === 'tulip') tulip(ctx, 128, 66)
    else if (scene.art === 'rosetta') rosetta(ctx, 128, 68)
    else swirl(ctx, 128, 68, [0.28, 0.62, 0.4])
  } else if (scene.drink === 'cappuccino') {
    heroSide(ctx, 72, 22, COFFEE, false, true)
    if (scene.topping === 'cocoa') {
      pix(ctx, 100, 50, 4, 3, BEAN)
      pix(ctx, 116, 52, 3, 3, BEAN)
      pix(ctx, 130, 50, 4, 3, '#8C6244')
    }
  } else if (scene.drink === 'espresso') {
    heroSide(ctx, 72, 22, COFFEE, true, false)
  } else if (scene.drink === 'cocoa') {
    heroSide(ctx, 72, 22, '#6B3A28', false, false)
    drawTopping(ctx, 108, 34, 3, scene.topping)
  } else {
    heroSide(ctx, 72, 22, teaColor(scene.tea, 0.8), false, false)
  }
  if (!scene.reduced) {
    const rise = scene.tick % 14
    pix(ctx, 118, 16 - (rise % 10), 3, 3, 'rgba(255,255,255,0.85)')
    pix(ctx, 140, 12 - ((rise + 6) % 10), 3, 3, 'rgba(255,255,255,0.6)')
  }
}

function heroSide(ctx: CanvasRenderingContext2D, x: number, y: number, fill: string, crema: boolean, foam: boolean) {
  pix(ctx, x - 8, y + 68, 120, 8, '#E4D2B8')
  pix(ctx, x + 4, y + 64, 96, 6, CUP2)
  pix(ctx, x + 10, y + 20, 84, 48, CUP)
  pix(ctx, x + 16, y + 30, 72, 30, fill)
  if (crema) pix(ctx, x + 16, y + 30, 72, 5, CREMA)
  if (foam) pix(ctx, x + 16, y + 28, 72, 12, '#F6E7C1')
  pix(ctx, x + 6, y + 12, 92, 14, CUP)
  pix(ctx, x + 14, y + 16, 76, 6, foam ? '#F6E7C1' : fill)
  if (crema) pix(ctx, x + 18, y + 17, 68, 3, CREMA)
  pix(ctx, x + 96, y + 30, 8, 5, CUP2)
  pix(ctx, x + 102, y + 34, 6, 22, CUP2)
  pix(ctx, x + 96, y + 52, 8, 5, CUP2)
}

function sideCup(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, fill: string, depth: number, crema: boolean) {
  pix(ctx, x, y + 8, 28 * (s / 2), 18 * (s / 2), CUP)
  pix(ctx, x + 24 * (s / 2), y + 12, 6 * (s / 2), 8, CUP2)
  pix(ctx, x + 4, y + 12, 18 * (s / 2), depth, fill)
  if (crema) pix(ctx, x + 4, y + 12, 18 * (s / 2), 4, CREMA)
}

function drawTopping(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, topping?: string) {
  if (topping === 'cream') pix(ctx, x, y, 16, 8, MILK)
  else if (topping === 'marshmallow') {
    pix(ctx, x, y, 6, 5, MILK)
    pix(ctx, x + 8, y + 2, 6, 5, MILK)
  } else if (topping === 'shavings' || topping === 'cocoa') {
    pix(ctx, x, y + 4, 3, 3, BEAN)
    pix(ctx, x + 6, y, 3, 3, '#8C6244')
    pix(ctx, x + 12, y + 3, 3, 3, BEAN)
  }
}

function heart(ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number, color: string) {
  const blocks = [[0, 0], [1, 0], [3, 0], [4, 0], [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [1, 3], [2, 3], [3, 3], [2, 4]]
  ctx.fillStyle = color
  for (const [x, y] of blocks) ctx.fillRect(cx + (x - 2) * s, cy + (y - 1) * s, s, s)
}

function tulip(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  disc(ctx, cx - 12, cy + 4, 8, MILK)
  disc(ctx, cx + 12, cy + 4, 8, MILK)
  disc(ctx, cx, cy - 8, 7, MILK)
}

function rosetta(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.fillStyle = MILK
  for (let i = 0; i < 4; i++) ctx.fillRect(cx - 16 + i * 2, cy - 14 + i * 7, 28 - i * 4, 3)
}

function swirl(ctx: CanvasRenderingContext2D, cx: number, cy: number, samples: number[]) {
  ctx.fillStyle = MILK
  const pts = samples.length ? samples : [0.35, 0.6, 0.45]
  pts.forEach((sample, index) => {
    ctx.fillRect(cx - 20 + sample * 40, cy - 8 + index * 4, 6, 4)
  })
}

function centered(samples: number[]) {
  return samples.length > 2 && samples.every(sample => Math.abs(sample - 0.5) < 0.18)
}

function teaColor(tea: string | undefined, amount: number) {
  const deep = tea === 'Green' ? '#7A8F62' : tea === 'Peppermint' ? '#6E8F78' : tea === 'Earl Grey' ? '#7A5A3A' : '#6B3A1F'
  const pale = tea === 'Green' ? '#E4EBD4' : tea === 'Peppermint' ? '#E7F2EA' : '#F3E6C8'
  return amount > 0.55 ? deep : amount > 0.2 ? WALL2 : pale
}

function mixCocoa(stir: number) {
  if (stir > 5) return '#6B3A28'
  if (stir > 2.5) return '#8C6244'
  return '#E7D3B5'
}
