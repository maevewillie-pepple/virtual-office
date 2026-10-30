import { useEffect, useState } from 'react'
import { personalBest, recordScore, type ArcadeDoc, type MemoryDifficulty } from '../../../game/arcade/store'

const FACES = ['🎧', '☕', '📚', '🌿', '💻', '🐱', '🎮', '💡', '🪴', '🎲', '✏️', '🎹']
const COUNTS: Record<MemoryDifficulty, number> = { easy: 4, medium: 8, hard: 12 }

interface Card { id: number; face: string; matched: boolean }

function deal(difficulty: MemoryDifficulty): Card[] {
  const faces = FACES.slice(0, COUNTS[difficulty])
  const deck = [...faces, ...faces]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck.map((face, id) => ({ id, face, matched: false }))
}

export default function MemoryGame({
  officeId, userId, name, doc, onExit, onDirty,
}: {
  officeId: string
  userId: string
  name: string
  doc: ArcadeDoc
  onExit: () => void
  onDirty: (dirty: boolean) => void
}) {
  const [difficulty, setDifficulty] = useState<MemoryDifficulty>('medium')
  const [cards, setCards] = useState(() => deal('medium'))
  const [open, setOpen] = useState<number[]>([])
  const [lock, setLock] = useState(false)
  const [moves, setMoves] = useState(0)
  const [started, setStarted] = useState<number | null>(null)
  const [now, setNow] = useState(Date.now())
  const [finishedAt, setFinishedAt] = useState<number | null>(null)
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const pairs = COUNTS[difficulty]
  const matched = cards.filter(card => card.matched).length / 2
  const done = matched === pairs
  const elapsed = finishedAt && started ? finishedAt - started : started ? now - started : 0
  const best = personalBest(doc, userId, 'memory', difficulty) as { ms?: number; moves?: number } | null

  useEffect(() => { onDirty(moves > 0 && !done) }, [moves, done, onDirty])

  useEffect(() => {
    if (!started || done) return
    const id = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [started, done])

  useEffect(() => {
    if (!done || !started || finishedAt) return
    const ended = Date.now()
    setFinishedAt(ended)
    recordScore(officeId, {
      id: `memory_${userId}_${ended}`,
      game: 'memory',
      userId,
      name,
      at: ended,
      difficulty,
      ms: ended - started,
      moves,
    })
  }, [done, started, finishedAt, officeId, userId, name, difficulty, moves])

  const restart = (next = difficulty) => {
    setDifficulty(next)
    setCards(deal(next))
    setOpen([])
    setLock(false)
    setMoves(0)
    setStarted(null)
    setFinishedAt(null)
  }

  const flip = (index: number) => {
    if (lock || done || cards[index].matched || open.includes(index) || open.length === 2) return
    if (!started) setStarted(Date.now())
    const next = [...open, index]
    setOpen(next)
    if (next.length < 2) return
    setMoves(count => count + 1)
    const [a, b] = next
    if (cards[a].face === cards[b].face) {
      setCards(prev => prev.map((card, i) => i === a || i === b ? { ...card, matched: true } : card))
      setOpen([])
    } else {
      setLock(true)
      window.setTimeout(() => { setOpen([]); setLock(false) }, reduced ? 200 : 700)
    }
  }

  const columns = difficulty === 'hard' ? 6 : 4

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex flex-wrap items-center justify-center gap-2 text-[12px] text-ink-2">
        <span>Moves {moves}</span>
        <span>Time {formatMs(elapsed)}</span>
        <span>Pairs {matched}/{pairs}</span>
        {best?.ms != null && <span>Best {formatMs(best.ms)}</span>}
      </div>
      <div className="flex gap-1">
        {(['easy', 'medium', 'hard'] as const).map(level => (
          <button key={level} type="button" className={`h-7 rounded-md px-2 text-[12px] capitalize ${difficulty === level ? 'bg-olive-soft text-olive' : 'text-ink-2'}`} onClick={() => restart(level)}>{level}</button>
        ))}
      </div>
      <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${columns}, 64px)` }}>
        {cards.map((card, index) => {
          const show = card.matched || open.includes(index)
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => flip(index)}
              className="relative h-16 w-16 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              style={{ perspective: '500px' }}
              aria-label={show ? card.face : 'Hidden card'}
            >
              <span
                className="absolute inset-0 grid place-items-center rounded-lg border border-[#30352F] bg-[#3C4338] text-[14px] text-[#E7D3B5] shadow-sm"
                style={{ backfaceVisibility: 'hidden', transform: show ? 'rotateY(180deg)' : 'none', transition: reduced ? 'none' : 'transform 280ms' }}
              >
                ♢
              </span>
              <span
                className={`absolute inset-0 grid place-items-center rounded-lg border text-[28px] shadow-sm ${card.matched ? 'border-olive bg-[#E5EADD]' : 'border-[#D9D6CD] bg-[#FFFEFA]'}`}
                style={{ backfaceVisibility: 'hidden', transform: show ? 'none' : 'rotateY(-180deg)', transition: reduced ? 'none' : 'transform 280ms' }}
              >
                {card.face}
              </span>
            </button>
          )
        })}
      </div>
      {done && (
        <div className="w-full max-w-sm rounded-lg border border-border bg-canvas p-3 text-center">
          <p className="text-[15px] font-semibold text-ink">All matched</p>
          <p className="mt-1 text-[13px] text-ink-2">{formatMs(elapsed)} · {moves} moves · {Math.round((pairs / Math.max(moves, 1)) * 100)}% efficient</p>
          {best?.ms != null && elapsed <= best.ms && <p className="text-[12px] text-olive">New personal best</p>}
          <div className="mt-2 flex justify-center gap-2">
            <button type="button" className="h-8 rounded-md bg-olive-soft px-3 text-[12px] font-medium text-olive" onClick={() => restart()}>Play again</button>
            <button type="button" className="h-8 rounded-md border border-border px-3 text-[12px] text-ink" onClick={onExit}>Back to arcade</button>
          </div>
        </div>
      )}
    </div>
  )
}

function formatMs(ms: number) {
  const seconds = Math.floor(ms / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
