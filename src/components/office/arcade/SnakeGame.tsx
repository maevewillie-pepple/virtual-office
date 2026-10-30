import { useEffect, useRef, useState } from 'react'
import { freshSnake, snakePace, stepSnake, SNAKE_SIZE, type Cell, type SnakeState } from '../../../game/arcade/snake'
import { personalBest, recordScore, type ArcadeDoc } from '../../../game/arcade/store'

const SPEEDS = [
  { id: 'relaxed', label: 'Relaxed', ms: 200 },
  { id: 'classic', label: 'Classic', ms: 140 },
  { id: 'fast', label: 'Fast', ms: 90 },
] as const

export default function SnakeGame({
  officeId, userId, name, doc, onExit, onDirty,
}: {
  officeId: string
  userId: string
  name: string
  doc: ArcadeDoc
  onExit: () => void
  onDirty: (dirty: boolean) => void
}) {
  const [state, setState] = useState<SnakeState>(freshSnake)
  const [paused, setPaused] = useState(false)
  const [speed, setSpeed] = useState<(typeof SPEEDS)[number]['id']>('classic')
  const [best, setBest] = useState(() => personalBest(doc, userId, 'snake') as number)
  const [record, setRecord] = useState(false)
  const committed = useRef<Cell>(state.dir)
  const pending = useRef<Cell>(state.dir)
  const saved = useRef(false)

  useEffect(() => { onDirty(state.score > 0 && !state.over) }, [state.score, state.over, onDirty])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const map: Record<string, Cell> = {
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
        W: { x: 0, y: -1 }, S: { x: 0, y: 1 }, A: { x: -1, y: 0 }, D: { x: 1, y: 0 },
      }
      if (event.key === ' ' || event.key === 'p' || event.key === 'P') {
        event.preventDefault()
        event.stopPropagation()
        if (!state.over) setPaused(value => !value)
        return
      }
      const next = map[event.key]
      if (!next) return
      event.preventDefault()
      event.stopPropagation()
      const current = committed.current
      if (next.x === -current.x && next.y === -current.y) return
      pending.current = next
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [state.over])

  useEffect(() => {
    if (state.over || paused) return
    const base = SPEEDS.find(item => item.id === speed)?.ms ?? 140
    const id = window.setInterval(() => {
      const dir = pending.current
      committed.current = dir
      setState(current => stepSnake(current, dir))
    }, snakePace(base, state.score))
    return () => window.clearInterval(id)
  }, [state.over, state.score, paused, speed])

  useEffect(() => {
    if (!state.over || saved.current) return
    saved.current = true
    const nextBest = Math.max(best, state.score)
    if (state.score > 0 && state.score >= best) setRecord(state.score > best)
    setBest(nextBest)
    if (state.score > 0) {
      recordScore(officeId, {
        id: `snake_${userId}_${Date.now()}`,
        game: 'snake',
        userId,
        name,
        at: Date.now(),
        score: state.score,
      })
    }
  }, [state.over, state.score, best, officeId, userId, name])

  const restart = () => {
    const next = freshSnake()
    committed.current = next.dir
    pending.current = next.dir
    saved.current = false
    setRecord(false)
    setPaused(false)
    setState(next)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-[13px] text-ink">Score {state.score} <span className="text-ink-3">· Best {best || '–'}</span></p>
      <p className="text-[12px] text-ink-2">Arrows or WASD. You cannot reverse into yourself.</p>
      <div className="relative">
        <div
          className="grid gap-px bg-[#30352F]/15 p-1"
          style={{ gridTemplateColumns: `repeat(${SNAKE_SIZE}, 18px)` }}
          aria-label={`Snake board, score ${state.score}`}
        >
          {Array.from({ length: SNAKE_SIZE * SNAKE_SIZE }, (_, index) => {
            const x = index % SNAKE_SIZE
            const y = Math.floor(index / SNAKE_SIZE)
            const on = state.snake.some(part => part.x === x && part.y === y)
            const head = state.snake[0].x === x && state.snake[0].y === y
            const food = state.food.x === x && state.food.y === y
            return (
              <div
                key={index}
                className={`h-[18px] w-[18px] ${on ? (head ? 'bg-[#55664C]' : 'bg-olive') : food ? 'bg-[#C4A15A]' : 'bg-[#F7F5EF]'}`}
              />
            )
          })}
        </div>
        {state.over && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#FFFEFA]/92 p-4 text-center">
            <p className="text-[16px] font-semibold text-ink">Game over</p>
            <p className="font-mono text-[20px] text-olive">{state.score}</p>
            <p className="text-[12px] text-ink-2">Best {best}{record ? ' · New record' : ''}</p>
            <div className="flex gap-2">
              <button type="button" className="h-8 rounded-md bg-olive-soft px-3 text-[12px] font-medium text-olive" onClick={restart}>Play again</button>
              <button type="button" className="h-8 rounded-md border border-border px-3 text-[12px] text-ink" onClick={onExit}>Back to arcade</button>
            </div>
          </div>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <button type="button" className="h-8 rounded-md border border-border px-3 text-[12px] text-ink" onClick={() => setPaused(value => !value)} disabled={state.over}>{paused ? 'Resume' : 'Pause'}</button>
        <button type="button" className="h-8 rounded-md border border-border px-3 text-[12px] text-ink" onClick={restart}>Restart</button>
        {SPEEDS.map(item => (
          <button key={item.id} type="button" className={`h-8 rounded-md px-3 text-[12px] ${speed === item.id ? 'bg-olive-soft text-olive' : 'text-ink-2'}`} onClick={() => setSpeed(item.id)}>{item.label}</button>
        ))}
      </div>
    </div>
  )
}
