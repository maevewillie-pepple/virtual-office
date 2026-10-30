import { useEffect, useRef, useState } from 'react'
import { ballsMoving, pocketPoints, rackBalls, resetCue, stepPool, TABLE, type PoolBall } from '../../../game/arcade/pool'
import { personalBest, recordScore, type ArcadeDoc } from '../../../game/arcade/store'

type Mode = 'solo' | 'match'

export default function PoolGame({
  officeId, userId, name, doc, onExit, onDirty,
}: {
  officeId: string
  userId: string
  name: string
  doc: ArcadeDoc
  onExit: () => void
  onDirty: (dirty: boolean) => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const balls = useRef<PoolBall[]>(rackBalls())
  const aim = useRef<{ x: number; y: number; power: number } | null>(null)
  const [mode, setMode] = useState<Mode>('solo')
  const [shots, setShots] = useState(0)
  const [scratches, setScratches] = useState(0)
  const [pocketed, setPocketed] = useState(0)
  const [moving, setMoving] = useState(false)
  const [turn, setTurn] = useState(0)
  const [scores, setScores] = useState([0, 0])
  const [winner, setWinner] = useState<number | null>(null)
  const [hint, setHint] = useState(() => localStorage.getItem('vo_pool_hint') !== '1')
  const [power, setPower] = useState(0)
  const started = useRef<number | null>(null)
  const saved = useRef(false)
  const best = personalBest(doc, userId, 'pool') as { shots?: number; ms?: number } | null
  const names = [name, 'Player 2']

  useEffect(() => { onDirty(shots > 0 && pocketed < 6 && winner == null) }, [shots, pocketed, winner, onDirty])

  useEffect(() => {
    let frame = 0
    const draw = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (!ctx || !canvas) return
      const scale = canvas.width / TABLE.w
      ctx.setTransform(scale, 0, 0, scale, 0, 0)
      ctx.fillStyle = '#8C6244'
      ctx.fillRect(0, 0, TABLE.w, TABLE.h)
      ctx.fillStyle = '#3E6B45'
      ctx.fillRect(12, 12, TABLE.w - 24, TABLE.h - 24)
      ctx.fillStyle = '#1E3A28'
      const pockets = pocketPoints()
      for (const { x, y } of pockets) {
        ctx.beginPath()
        ctx.arc(x, y, 11, 0, Math.PI * 2)
        ctx.fill()
      }
      for (const ball of balls.current) {
        if (ball.pocketed) continue
        ctx.beginPath()
        ctx.fillStyle = ball.color
        ctx.arc(ball.x, ball.y, TABLE.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.strokeStyle = 'rgba(48,53,47,0.35)'
        ctx.stroke()
      }
      const cue = balls.current.find(ball => ball.cue && !ball.pocketed)
      const guide = aim.current
      if (cue && guide) {
        const angle = Math.atan2(guide.y - cue.y, guide.x - cue.x)
        ctx.strokeStyle = 'rgba(255,254,250,0.85)'
        ctx.setLineDash([3, 3])
        ctx.beginPath()
        ctx.moveTo(cue.x, cue.y)
        ctx.lineTo(cue.x + Math.cos(angle) * 70, cue.y + Math.sin(angle) * 70)
        ctx.stroke()
        ctx.setLineDash([])
        ctx.strokeStyle = '#E3B775'
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(cue.x - Math.cos(angle) * (12 + guide.power * 28), cue.y - Math.sin(angle) * (12 + guide.power * 28))
        ctx.lineTo(cue.x - Math.cos(angle) * 10, cue.y - Math.sin(angle) * 10)
        ctx.stroke()
        ctx.lineWidth = 1
      }
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (!moving) return
    let frame = 0
    const before = new Set(balls.current.filter(ball => ball.pocketed).map(ball => ball.id))
    const loop = () => {
      balls.current = stepPool(balls.current)
      if (ballsMoving(balls.current)) {
        frame = requestAnimationFrame(loop)
        return
      }
      const cue = balls.current.find(ball => ball.cue)
      const scratched = !!cue?.pocketed
      if (scratched) balls.current = resetCue(balls.current)
      const sunk = balls.current.filter(ball => ball.pocketed && !ball.cue && !before.has(ball.id))
      const total = balls.current.filter(ball => ball.pocketed && !ball.cue).length
      setPocketed(total)
      setScratches(count => count + (scratched ? 1 : 0))
      setMoving(false)
      if (mode === 'match') {
        setScores(current => {
          const next = [...current]
          next[turn] += sunk.length
          if (next[turn] >= 3) setWinner(turn)
          return next
        })
        if (sunk.length === 0 || scratched) setTurn(value => (value + 1) % 2)
      } else if (total >= 6 && started.current && !saved.current) {
        saved.current = true
        recordScore(officeId, {
          id: `pool_${userId}_${Date.now()}`,
          game: 'pool',
          userId,
          name,
          at: Date.now(),
          shots,
          ms: Date.now() - started.current,
        })
      }
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [moving, mode, turn, shots, officeId, userId, name])

  const pointOf = (event: React.PointerEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return null
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * TABLE.w,
      y: ((event.clientY - rect.top) / rect.height) * TABLE.h,
    }
  }

  const pull = (event: React.PointerEvent) => {
    if (moving || winner != null || (mode === 'solo' && pocketed >= 6)) return
    const point = pointOf(event)
    const cue = balls.current.find(ball => ball.cue && !ball.pocketed)
    if (!point || !cue) return
    const dist = Math.hypot(point.x - cue.x, point.y - cue.y)
    const charged = event.buttons === 1 || event.type === 'pointerdown'
    const next = charged ? Math.min(1, Math.max(0, (dist - 16) / 90)) : 0
    aim.current = { x: point.x, y: point.y, power: next }
    setPower(next)
  }

  const shoot = (event: React.PointerEvent) => {
    const guide = aim.current
    aim.current = null
    setPower(0)
    if (!guide || guide.power < 0.08 || moving) return
    const cue = balls.current.find(ball => ball.cue && !ball.pocketed)
    if (!cue) return
    if (!started.current) started.current = Date.now()
    if (hint) {
      localStorage.setItem('vo_pool_hint', '1')
      setHint(false)
    }
    const angle = Math.atan2(guide.y - cue.y, guide.x - cue.x)
    const speed = 1.4 + guide.power * 5.5
    cue.vx = Math.cos(angle) * speed
    cue.vy = Math.sin(angle) * speed
    setShots(count => count + 1)
    setMoving(true)
    try { event.currentTarget.releasePointerCapture(event.pointerId) } catch { /* already released */ }
  }

  const restart = (next = mode) => {
    balls.current = rackBalls()
    aim.current = null
    saved.current = false
    started.current = null
    setMode(next)
    setShots(0)
    setScratches(0)
    setPocketed(0)
    setMoving(false)
    setTurn(0)
    setScores([0, 0])
    setWinner(null)
  }

  const done = mode === 'solo' && pocketed >= 6 && !moving

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-center text-[12px] leading-5 text-ink-2">
        {hint ? 'Aim your cue, pull back to set power, and release to shoot.' : mode === 'match' ? `${names[turn]} to play on this keyboard. A pocket keeps the turn.` : 'Pocket all six balls.'}
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 text-[12px] text-ink-2">
        <span>Shots {shots}</span>
        <span>Pocketed {pocketed}/6</span>
        <span>Scratches {scratches}</span>
        {mode === 'match' && <span>{names[0]} {scores[0]} · {names[1]} {scores[1]}</span>}
        {best?.shots != null && <span>Best {best.shots} shots</span>}
      </div>
      <div className="flex gap-1">
        <button type="button" className={`h-7 rounded-md px-2 text-[12px] ${mode === 'solo' ? 'bg-olive-soft text-olive' : 'text-ink-2'}`} onClick={() => restart('solo')}>Practice</button>
        <button type="button" className={`h-7 rounded-md px-2 text-[12px] ${mode === 'match' ? 'bg-olive-soft text-olive' : 'text-ink-2'}`} onClick={() => restart('match')}>Two players</button>
      </div>
      <canvas
        ref={canvasRef}
        width={680}
        height={380}
        className="w-full max-w-[680px] touch-none rounded-md border border-[#6B4A32]"
        style={{ imageRendering: 'pixelated' }}
        aria-label="Pool table"
        onPointerDown={event => {
          try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* the pointer may already be gone */ }
          pull(event)
        }}
        onPointerMove={pull}
        onPointerUp={shoot}
      />
      <div className="h-2 w-40 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full bg-[#C4A15A]" style={{ width: `${power * 100}%` }} />
      </div>
      {(done || winner != null) && (
        <div className="w-full max-w-sm rounded-lg border border-border bg-canvas p-3 text-center">
          <p className="text-[15px] font-semibold text-ink">{winner != null ? `${names[winner]} wins` : 'Table cleared'}</p>
          <p className="mt-1 text-[13px] text-ink-2">{shots} shots · {scratches} scratches</p>
          <div className="mt-2 flex justify-center gap-2">
            <button type="button" className="h-8 rounded-md bg-olive-soft px-3 text-[12px] font-medium text-olive" onClick={() => restart()}>Play again</button>
            <button type="button" className="h-8 rounded-md border border-border px-3 text-[12px] text-ink" onClick={onExit}>Back to arcade</button>
          </div>
        </div>
      )}
      {mode === 'match' && winner == null && (
        <button type="button" className="text-[12px] text-ink-3" onClick={() => setWinner((turn + 1) % 2)}>Concede</button>
      )}
    </div>
  )
}
