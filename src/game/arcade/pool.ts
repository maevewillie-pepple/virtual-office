export interface PoolBall {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  color: string
  cue?: boolean
  pocketed: boolean
}

export const TABLE = { w: 340, h: 190, r: 7 }

export function pocketPoints() {
  const i = 10
  return [
    { x: i, y: i },
    { x: TABLE.w / 2, y: 12 },
    { x: TABLE.w - i, y: i },
    { x: i, y: TABLE.h - i },
    { x: TABLE.w / 2, y: TABLE.h - 12 },
    { x: TABLE.w - i, y: TABLE.h - i },
  ]
}

export function rackBalls(): PoolBall[] {
  const colors = ['#E3B775', '#9A4D3C', '#3C4A44', '#66765C', '#C4A574', '#8C6244']
  const balls: PoolBall[] = [
    { id: 'cue', x: 78, y: TABLE.h / 2, vx: 0, vy: 0, color: '#FFFEFA', cue: true, pocketed: false },
  ]
  let n = 0
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col <= row; col++) {
      balls.push({
        id: `b${n}`,
        x: 230 + row * 16,
        y: TABLE.h / 2 + (col - row / 2) * 16,
        vx: 0,
        vy: 0,
        color: colors[n],
        pocketed: false,
      })
      n += 1
    }
  }
  return balls
}

export function ballsMoving(balls: PoolBall[]) {
  return balls.some(ball => !ball.pocketed && Math.hypot(ball.vx, ball.vy) > 0.04)
}

export function stepPool(balls: PoolBall[]): PoolBall[] {
  const next = balls.map(ball => ({ ...ball }))
  const pockets = pocketPoints()
  for (const ball of next) {
    if (ball.pocketed) continue
    ball.x += ball.vx
    ball.y += ball.vy
    ball.vx *= 0.985
    ball.vy *= 0.985
    if (Math.hypot(ball.vx, ball.vy) < 0.04) {
      ball.vx = 0
      ball.vy = 0
    }
    const sunk = pockets.some(pocket => Math.hypot(ball.x - pocket.x, ball.y - pocket.y) < 15)
    if (sunk) {
      ball.pocketed = true
      ball.vx = 0
      ball.vy = 0
      continue
    }
    const min = 16
    const maxX = TABLE.w - 16
    const maxY = TABLE.h - 16
    if (ball.x < min) { ball.x = min; ball.vx = Math.abs(ball.vx) * 0.82 }
    if (ball.x > maxX) { ball.x = maxX; ball.vx = -Math.abs(ball.vx) * 0.82 }
    if (ball.y < min) { ball.y = min; ball.vy = Math.abs(ball.vy) * 0.82 }
    if (ball.y > maxY) { ball.y = maxY; ball.vy = -Math.abs(ball.vy) * 0.82 }
  }
  for (let i = 0; i < next.length; i++) {
    for (let j = i + 1; j < next.length; j++) {
      const a = next[i]
      const b = next[j]
      if (a.pocketed || b.pocketed) continue
      const dx = b.x - a.x
      const dy = b.y - a.y
      const dist = Math.hypot(dx, dy) || 0.01
      const min = TABLE.r * 2
      if (dist >= min) continue
      const nx = dx / dist
      const ny = dy / dist
      const overlap = min - dist
      a.x -= nx * overlap / 2
      a.y -= ny * overlap / 2
      b.x += nx * overlap / 2
      b.y += ny * overlap / 2
      const push = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny
      if (push > 0) {
        a.vx -= push * nx
        a.vy -= push * ny
        b.vx += push * nx
        b.vy += push * ny
      }
    }
  }
  return next
}

export function resetCue(balls: PoolBall[]): PoolBall[] {
  return balls.map(ball => ball.cue
    ? { ...ball, x: 78, y: TABLE.h / 2, vx: 0, vy: 0, pocketed: false }
    : ball)
}
