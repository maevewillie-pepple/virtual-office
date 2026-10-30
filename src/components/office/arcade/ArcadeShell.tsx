import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { loadArcade, personalBest, readWord, setLeaderboardPublic, type ArcadeDoc, type ArcadeGame } from '../../../game/arcade/store'
import SnakeGame from './SnakeGame'
import MemoryGame from './MemoryGame'
import PoolGame from './PoolGame'
import DailyWord from './DailyWord'
import Scoreboard, { type ArcadePlayer } from './Scoreboard'

type View = 'launcher' | ArcadeGame | 'scores'

const GAMES: { id: ArcadeGame; title: string; blurb: string; mode: string }[] = [
  { id: 'snake', title: 'Snake', blurb: 'A quiet grid. Eat, grow, and avoid yourself.', mode: 'Solo' },
  { id: 'memory', title: 'Memory Match', blurb: 'Flip the office emojis and find each pair.', mode: 'Solo' },
  { id: 'pool', title: 'Pool', blurb: 'Aim the cue and pocket the balls.', mode: 'Solo or two players' },
  { id: 'word', title: 'Daily Word', blurb: 'One five-letter word for the whole office.', mode: 'Daily' },
]

export default function ArcadeShell({
  officeId, player, players, isOwner, start, onClose, onShare,
}: {
  officeId: string
  player: ArcadePlayer
  players: ArcadePlayer[]
  isOwner: boolean
  start: 'launcher' | 'pool'
  onClose: () => void
  onShare: (text: string) => void
}) {
  const [view, setView] = useState<View>(start === 'pool' ? 'pool' : 'launcher')
  const [scoreGame, setScoreGame] = useState<ArcadeGame>('word')
  const [doc, setDoc] = useState<ArcadeDoc>(() => loadArcade(officeId))
  const [dirty, setDirty] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const word = readWord(officeId, player.id)

  useEffect(() => {
    const refresh = () => setDoc(loadArcade(officeId))
    window.addEventListener('vo-arcade', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('vo-arcade', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [officeId])

  const leave = () => {
    if (view !== 'launcher' && dirty) {
      setConfirm(true)
      return
    }
    if (view !== 'launcher') {
      setView('launcher')
      setDirty(false)
      return
    }
    onClose()
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      event.preventDefault()
      event.stopImmediatePropagation()
      if (confirm) {
        setConfirm(false)
        return
      }
      leave()
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const best = (id: ArcadeGame) => {
    if (id === 'snake') {
      const score = personalBest(doc, player.id, 'snake') as number
      return score ? `Best ${score}` : ''
    }
    if (id === 'word') return word.finished ? 'Completed today' : 'Today’s puzzle'
    return ''
  }

  const title = view === 'launcher' ? 'Arcade' : view === 'scores' ? 'Arcade scores' : GAMES.find(game => game.id === view)?.title ?? 'Arcade'

  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center p-3 sm:p-6" onMouseDown={event => event.stopPropagation()}>
      <section
        role="dialog"
        aria-label={title}
        className={`flex max-h-[calc(100%-0.5rem)] w-full flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl ${view === 'pool' ? 'max-w-[760px]' : view === 'memory' ? 'max-w-[560px]' : 'max-w-[520px]'}`}
      >
        <header className="flex h-11 shrink-0 items-center gap-2 border-b border-border px-3">
          {view !== 'launcher' && (
            <button type="button" className="text-[12px] text-ink-3 hover:text-ink" onClick={leave}>Arcade</button>
          )}
          <h2 className="text-[14px] font-semibold text-ink">{title}</h2>
          <button type="button" className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-ink-2 hover:bg-muted" aria-label="Close arcade" onClick={leave}>
            <X size={16} />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-auto p-3 sm:p-4">
          {view === 'launcher' && (
            <div className="grid gap-2 sm:grid-cols-2">
              {GAMES.map(game => (
                <button key={game.id} type="button" onClick={() => { setDirty(false); setView(game.id) }} className="rounded-lg border border-border bg-canvas p-3 text-left hover:border-olive/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                  <Preview id={game.id} />
                  <span className="mt-2 block text-[14px] font-medium text-ink">{game.title}</span>
                  <span className="mt-0.5 block text-[12px] leading-4 text-ink-2">{game.blurb}</span>
                  <span className="mt-1 block text-[11px] uppercase tracking-wide text-ink-3">{game.mode}{best(game.id) ? ` · ${best(game.id)}` : ''}</span>
                </button>
              ))}
              <button type="button" onClick={() => setView('scores')} className="rounded-lg border border-border px-3 py-2 text-left text-[13px] text-ink hover:bg-muted sm:col-span-2">Arcade scores</button>
              {isOwner && (
                <label className="flex items-center gap-2 text-[12px] text-ink-2 sm:col-span-2">
                  <input type="checkbox" checked={doc.leaderboardPublic} onChange={event => setDoc(setLeaderboardPublic(officeId, event.target.checked))} />
                  Show office rankings
                </label>
              )}
            </div>
          )}
          {view === 'snake' && <SnakeGame officeId={officeId} userId={player.id} name={player.name} doc={doc} onExit={() => { setDirty(false); setView('launcher') }} onDirty={setDirty} />}
          {view === 'memory' && <MemoryGame officeId={officeId} userId={player.id} name={player.name} doc={doc} onExit={() => { setDirty(false); setView('launcher') }} onDirty={setDirty} />}
          {view === 'pool' && <PoolGame officeId={officeId} userId={player.id} name={player.name} doc={doc} onExit={() => { setDirty(false); setView('launcher') }} onDirty={setDirty} />}
          {view === 'word' && (
            <div className="space-y-3">
              <DailyWord officeId={officeId} userId={player.id} name={player.name} doc={doc} onShare={onShare} />
              <button type="button" className="text-[12px] text-ink-2 underline-offset-2 hover:underline" onClick={() => { setScoreGame('word'); setView('scores') }}>View leaderboard</button>
            </div>
          )}
          {view === 'scores' && <Scoreboard doc={doc} players={players} game={scoreGame} onGame={setScoreGame} mine={player.id} />}
        </div>
        {confirm && (
          <div className="border-t border-border px-3 py-2">
            <p className="text-[13px] text-ink">Leave this game? The current run will not be saved.</p>
            <div className="mt-2 flex justify-end gap-2">
              <button type="button" className="h-8 rounded-md border border-border px-3 text-[12px]" onClick={() => setConfirm(false)}>Keep playing</button>
              <button type="button" className="h-8 rounded-md bg-olive-soft px-3 text-[12px] text-olive" onClick={() => { setConfirm(false); setDirty(false); setView('launcher') }}>Leave</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}

function Preview({ id }: { id: ArcadeGame }) {
  if (id === 'snake') {
    return (
      <span className="grid h-10 w-16 grid-cols-6 gap-px bg-[#30352F]/10 p-1" aria-hidden>
        {Array.from({ length: 12 }, (_, index) => <span key={index} className={index === 4 || index === 5 ? 'bg-olive' : index === 8 ? 'bg-[#C4A15A]' : 'bg-[#F7F5EF]'} />)}
      </span>
    )
  }
  if (id === 'memory') return <span className="grid h-10 w-10 place-items-center rounded-md border border-[#30352F] bg-[#3C4338] text-[#E7D3B5]" aria-hidden>♢</span>
  if (id === 'pool') return <span className="block h-10 w-16 rounded-md border border-[#6B4A32] bg-[#3E6B45]" aria-hidden />
  return <span className="grid grid-cols-5 gap-0.5" aria-hidden>{['bg-olive', 'bg-[#D9D6CD]', 'bg-[#C4A15A]', 'bg-[#D9D6CD]', 'bg-[#D9D6CD]'].map((tone, index) => <span key={index} className={`h-3 w-3 rounded-[2px] ${tone}`} />)}</span>
}
