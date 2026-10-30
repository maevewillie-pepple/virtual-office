import { useEffect, useState } from 'react'
import { nextReset, utcDay, type Mark } from '../../../game/arcade/words'
import { rankWord, readWord, submitWord, tickWord, wordStreak, type ArcadeDoc, type WordView } from '../../../game/arcade/store'

const KEYS = ['qwertyuiop', 'asdfghjkl', 'zxcvbnm']

export default function DailyWord({
  officeId, userId, name, doc, onShare,
}: {
  officeId: string
  userId: string
  name: string
  doc: ArcadeDoc
  onShare: (text: string) => void
}) {
  const [view, setView] = useState<WordView>(() => readWord(officeId, userId))
  const [draft, setDraft] = useState('')
  const [notice, setNotice] = useState('')
  const [clock, setClock] = useState(() => nextReset())
  const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const streak = wordStreak(doc, userId)

  useEffect(() => {
    const refresh = () => setView(readWord(officeId, userId))
    window.addEventListener('vo-arcade', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('vo-arcade', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [officeId, userId])

  useEffect(() => {
    if (view.finished) return
    const id = window.setInterval(() => {
      setView(tickWord(officeId, userId, name, 4000))
    }, 4000)
    return () => window.clearInterval(id)
  }, [view.finished, officeId, userId, name])

  useEffect(() => {
    const id = window.setInterval(() => setClock(nextReset()), 30_000)
    return () => window.clearInterval(id)
  }, [])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      if (event.key === 'Backspace') {
        event.preventDefault()
        event.stopPropagation()
        setDraft(value => value.slice(0, -1))
        return
      }
      if (event.key === 'Enter') {
        event.preventDefault()
        event.stopPropagation()
        commit(draft)
        return
      }
      if (/^[a-zA-Z]$/.test(event.key)) {
        event.preventDefault()
        event.stopPropagation()
        setDraft(value => (value.length >= 5 ? value : value + event.key.toLowerCase()))
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  })

  const commit = (guess: string) => {
    if (view.finished) return
    const next = submitWord(officeId, userId, name, guess)
    setView(next)
    setNotice(next.error ?? '')
    if (!next.error) setDraft('')
  }

  const typed = view.guesses.length < 6 && !view.finished ? draft : ''
  const rows = Array.from({ length: 6 }, (_, row) => {
    const guess = view.guesses[row] ?? (row === view.guesses.length ? typed : '')
    const marks = view.marks[row]
    return { guess, marks }
  })

  const share = () => {
    const lines = view.marks.map(row => row.map(mark => mark === 'correct' ? '🟩' : mark === 'present' ? '🟨' : '⬜').join(''))
    const heading = view.solved ? `Solved in ${view.guesses.length}/6` : 'Not solved'
    onShare(`Daily Word #${view.number}\n${heading}\n${lines.join('\n')}`)
    setNotice('Shared with the office.')
  }

  return (
    <div className="mx-auto flex w-full max-w-[360px] flex-col items-center gap-3">
      <div className="flex w-full items-center justify-between text-[12px] text-ink-2">
        <span>No. {view.number}</span>
        <span>Streak {streak.current}</span>
        <span>Best {streak.best}</span>
      </div>
      <div className="grid gap-1.5" aria-label="Daily Word guesses">
        {rows.map((row, index) => (
          <div key={index} className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: 5 }, (_, cell) => {
              const letter = row.guess[cell] ?? ''
              const mark = row.marks?.[cell]
              return (
                <span
                  key={cell}
                  className={`grid h-12 w-12 place-items-center rounded-md border font-mono text-[18px] uppercase ${tileClass(mark)}`}
                  style={{ transition: reduced ? 'none' : 'background 180ms', transitionDelay: mark && !reduced ? `${cell * 120}ms` : '0ms' }}
                  aria-label={mark ? `${letter} ${mark}` : letter || 'Empty'}
                >
                  {letter}
                  {mark === 'correct' && <span className="sr-only"> correct place</span>}
                  {mark === 'present' && <span className="sr-only"> different place</span>}
                  {mark === 'absent' && <span className="sr-only"> not in the word</span>}
                </span>
              )
            })}
          </div>
        ))}
      </div>
      {notice && <p className="text-[12px] text-ink-2" role="status">{notice}</p>}
      {view.finished ? (
        <div className="w-full rounded-lg border border-border bg-canvas p-3 text-center">
          <p className="text-[15px] font-semibold text-ink">{view.solved ? `Solved in ${view.guesses.length}/6` : 'Not solved today'}</p>
          {view.answer && <p className="mt-1 font-mono text-[13px] uppercase text-ink-2">{view.answer}</p>}
          <p className="mt-1 text-[12px] text-ink-2">{todayRank(doc, userId, view.day)}</p>
          <p className="mt-1 text-[12px] text-ink-3">Next puzzle {clock.toLocaleString()}</p>
          <div className="mt-2 flex justify-center gap-2">
            <button type="button" className="h-8 rounded-md bg-olive-soft px-3 text-[12px] font-medium text-olive" onClick={share}>Share result</button>
          </div>
        </div>
      ) : (
        <div className="flex w-full flex-col items-center gap-1">
          {KEYS.map(row => (
            <div key={row} className="flex gap-1">
              {row.split('').map(letter => (
                <Key key={letter} label={letter} onClick={() => setDraft(value => value.length >= 5 ? value : value + letter)} mark={keyMark(view, letter)} />
              ))}
            </div>
          ))}
          <div className="mt-1 flex gap-1">
            <Key label="Enter" wide onClick={() => commit(draft)} />
            <Key label="Delete" wide onClick={() => setDraft(value => value.slice(0, -1))} />
          </div>
        </div>
      )}
      <p className="text-[11px] text-ink-3">One puzzle for the office today, {utcDay()}. A wrong word does not use a guess.</p>
    </div>
  )
}

function tileClass(mark?: Mark) {
  if (mark === 'correct') return 'border-olive bg-olive text-surface shadow-[inset_0_-3px_0_rgba(255,255,255,0.55)]'
  if (mark === 'present') return 'border-[#C4A15A] bg-[#C4A15A] text-[#30352F] shadow-[inset_0_-3px_0_rgba(48,53,47,0.45)]'
  if (mark === 'absent') return 'border-[#C5C2B8] bg-[#D9D6CD] text-ink'
  return 'border-border bg-surface text-ink'
}

function todayRank(doc: ArcadeDoc, userId: string, day: string) {
  const rows = rankWord(doc.scores, day)
  const index = rows.findIndex(row => row.userId === userId)
  if (index < 0) return 'Not ranked yet'
  let place = 1
  for (let i = 1; i <= index; i++) {
    const prev = rows[i - 1]
    const row = rows[i]
    if (!!prev.solved !== !!row.solved || prev.guesses !== row.guesses || prev.activeMs !== row.activeMs) place = i + 1
  }
  return `Today’s rank ${place}`
}

function keyMark(view: WordView, letter: string): Mark | undefined {
  let found: Mark | undefined
  view.marks.forEach((row, index) => {
    row.forEach((mark, cell) => {
      if (view.guesses[index]?.[cell] !== letter) return
      if (mark === 'correct' || (mark === 'present' && found !== 'correct') || !found) found = mark
    })
  })
  return found
}

function Key({ label, onClick, wide, mark }: { label: string; onClick: () => void; wide?: boolean; mark?: Mark }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 rounded-md border text-[12px] uppercase focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${wide ? 'px-3' : 'w-8'} ${tileClass(mark)}`}
    >
      {label}
    </button>
  )
}
