import { useState } from 'react'
import type { AvatarConfig } from '../../../types'
import AvatarSprite from '../../ui/AvatarSprite'
import { rankMemory, rankPool, rankSnake, rankWord, rankWordWeek, wordStreak, type ArcadeDoc, type ArcadeGame, type MemoryDifficulty, type PlayerScore } from '../../../game/arcade/store'
import { utcDay } from '../../../game/arcade/words'

export interface ArcadePlayer {
  id: string
  name: string
  avatar: AvatarConfig
}

const TABS: { id: ArcadeGame; label: string }[] = [
  { id: 'word', label: 'Daily Word' },
  { id: 'snake', label: 'Snake' },
  { id: 'memory', label: 'Memory' },
  { id: 'pool', label: 'Pool' },
]

export default function Scoreboard({
  doc, players, game, onGame, mine,
}: {
  doc: ArcadeDoc
  players: ArcadePlayer[]
  game: ArcadeGame
  onGame: (game: ArcadeGame) => void
  mine: string
}) {
  const day = utcDay()
  const [memory, setMemory] = useState<MemoryDifficulty>('medium')
  const rows = game === 'word'
    ? rankWord(doc.scores, day)
    : game === 'snake'
      ? rankSnake(doc.scores)
      : game === 'pool'
        ? rankPool(doc.scores)
        : rankMemory(doc.scores, memory)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1">
        {TABS.map(tab => (
          <button key={tab.id} type="button" className={`h-8 rounded-md px-2 text-[12px] ${game === tab.id ? 'bg-olive-soft text-olive' : 'text-ink-2'}`} onClick={() => onGame(tab.id)}>{tab.label}</button>
        ))}
      </div>
      {game === 'memory' && (
        <div className="flex gap-1">
          {(['easy', 'medium', 'hard'] as const).map(level => (
            <button key={level} type="button" className={`h-7 rounded-md px-2 text-[12px] capitalize ${memory === level ? 'bg-olive-soft text-olive' : 'text-ink-2'}`} onClick={() => setMemory(level)}>{level}</button>
          ))}
        </div>
      )}
      {!doc.leaderboardPublic && <p className="text-[12px] text-ink-2">The office owner has hidden rankings. Your own results stay here.</p>}
      <p className="text-[11px] text-ink-3">Saved in this office on this browser. Snake, memory, and pool scores are not checked by a server.</p>
      <ol className="space-y-1.5">
        {placed(visible(rows, doc.leaderboardPublic, mine)).map(({ row, place }) => (
          <li key={row.id} className="flex items-center gap-2 rounded-md border border-border bg-canvas px-2 py-1.5">
            <span className="w-5 font-mono text-[12px] text-ink-3">{place}</span>
            <Face player={players.find(person => person.id === row.userId)} name={row.name} />
            <span className="min-w-0 flex-1 truncate text-[13px] text-ink">{row.name}</span>
            <span className="text-[12px] text-ink-2">{line(row)}</span>
          </li>
        ))}
        {visible(rows, doc.leaderboardPublic, mine).length === 0 && <li className="text-[12px] text-ink-3">No scores yet.</li>}
      </ol>
      {game === 'word' && <Week doc={doc} userId={mine} players={players} />}
    </div>
  )
}

function visible(rows: PlayerScore[], pub: boolean, mine: string) {
  return pub ? rows.slice(0, 10) : rows.filter(row => row.userId === mine).slice(0, 10)
}

function placed(rows: PlayerScore[]) {
  let place = 1
  return rows.map((row, index) => {
    if (index > 0 && !same(rows[index - 1], row)) place = index + 1
    return { row, place }
  })
}

function same(a: PlayerScore, b: PlayerScore) {
  if (a.game === 'snake') return (a.score ?? 0) === (b.score ?? 0)
  if (a.game === 'memory') return a.ms === b.ms && a.moves === b.moves
  if (a.game === 'pool') return a.shots === b.shots && a.ms === b.ms
  return !!a.solved === !!b.solved && a.guesses === b.guesses && a.activeMs === b.activeMs
}

function line(row: PlayerScore) {
  if (row.game === 'snake') return String(row.score ?? 0)
  if (row.game === 'memory') return `${format(row.ms ?? 0)} · ${row.moves ?? 0} moves`
  if (row.game === 'pool') return `${row.shots ?? 0} shots`
  return row.solved ? `${row.guesses}/6` : 'Miss'
}

function Week({ doc, userId, players }: { doc: ArcadeDoc; userId: string; players: ArcadePlayer[] }) {
  const streak = wordStreak(doc, userId)
  const solved = doc.words.filter(item => item.userId === userId && item.solved)
  const played = doc.words.filter(item => item.userId === userId && item.finishedAt)
  const average = solved.length ? (solved.reduce((sum, item) => sum + item.guesses.length, 0) / solved.length).toFixed(1) : '–'
  const buckets = [1, 2, 3, 4, 5, 6].map(count => solved.filter(item => item.guesses.length === count).length)
  const week = rankWordWeek(doc).filter(row => doc.leaderboardPublic || row.userId === userId)
  return (
    <div className="space-y-2">
      <p className="text-[12px] leading-5 text-ink-2">
        Played {played.length} · Solved {played.length ? Math.round((solved.length / played.length) * 100) : 0}% · Average {average} · Streak {streak.current} · Best streak {streak.best}
      </p>
      <p className="font-mono text-[11px] text-ink-3">Guesses 1–6: {buckets.join(' ')}</p>
      <p className="text-[12px] font-medium text-ink">This week</p>
      <ol className="space-y-1">
        {week.map((row, index) => (
          <li key={row.userId} className="flex items-center gap-2 text-[12px] text-ink-2">
            <span className="w-4 font-mono text-ink-3">{index + 1}</span>
            <Face player={players.find(person => person.id === row.userId)} name={row.name} />
            <span className="min-w-0 flex-1 truncate text-ink">{row.name}</span>
            <span>{row.solved} solved · {row.solved ? row.average.toFixed(1) : '–'} avg</span>
          </li>
        ))}
        {week.length === 0 && <li className="text-[12px] text-ink-3">No finished puzzles this week.</li>}
      </ol>
    </div>
  )
}

function Face({ player, name }: { player?: ArcadePlayer; name: string }) {
  if (player) return <AvatarSprite config={player.avatar} name={name} size={28} />
  return <span className="grid h-7 w-7 place-items-center rounded-full bg-olive-soft text-[11px] text-olive">{name.slice(0, 1)}</span>
}

function format(ms: number) {
  const seconds = Math.floor(ms / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}
