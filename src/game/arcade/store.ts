import { publishArcade } from '../../remote/sync'
import { answerForDay, isWord, markGuess, puzzleNumber, utcDay, type Mark } from './words'

export type ArcadeGame = 'snake' | 'memory' | 'pool' | 'word'
export type MemoryDifficulty = 'easy' | 'medium' | 'hard'

export interface PlayerScore {
  id: string
  game: ArcadeGame
  userId: string
  name: string
  at: number
  score?: number
  difficulty?: MemoryDifficulty
  ms?: number
  moves?: number
  shots?: number
  day?: string
  guesses?: number
  solved?: boolean
  activeMs?: number
}

export interface WordAttempt {
  day: string
  userId: string
  name: string
  guesses: string[]
  marks: Mark[][]
  startedAt: number
  updatedAt: number
  finishedAt?: number
  solved: boolean
  activeMs: number
  version: number
}

export interface ArcadeDoc {
  version: number
  scores: PlayerScore[]
  words: WordAttempt[]
  leaderboardPublic: boolean
}

const EMPTY: ArcadeDoc = { version: 0, scores: [], words: [], leaderboardPublic: true }

function keyOf(officeId: string) {
  return `vo_arcade_${officeId}`
}

function cleanScore(value: unknown): PlayerScore | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as PlayerScore
  if (typeof raw.id !== 'string' || typeof raw.userId !== 'string' || typeof raw.name !== 'string') return null
  if (raw.game !== 'snake' && raw.game !== 'memory' && raw.game !== 'pool' && raw.game !== 'word') return null
  return {
    id: raw.id.slice(0, 80),
    game: raw.game,
    userId: raw.userId.slice(0, 80),
    name: raw.name.replace(/[<>]/g, '').slice(0, 40) || 'Player',
    at: typeof raw.at === 'number' ? raw.at : Date.now(),
    score: typeof raw.score === 'number' ? raw.score : undefined,
    difficulty: raw.difficulty,
    ms: typeof raw.ms === 'number' ? raw.ms : undefined,
    moves: typeof raw.moves === 'number' ? raw.moves : undefined,
    shots: typeof raw.shots === 'number' ? raw.shots : undefined,
    day: typeof raw.day === 'string' ? raw.day.slice(0, 10) : undefined,
    guesses: typeof raw.guesses === 'number' ? raw.guesses : undefined,
    solved: typeof raw.solved === 'boolean' ? raw.solved : undefined,
    activeMs: typeof raw.activeMs === 'number' ? raw.activeMs : undefined,
  }
}

function repairAttempt(attempt: WordAttempt): WordAttempt {
  const answer = answerForDay(attempt.day)
  const guesses = attempt.guesses.filter(guess => guess.length === 5 && isWord(guess)).slice(0, 6)
  const marks = guesses.map(guess => markGuess(answer, guess))
  const solvedIndex = marks.findIndex(row => row.every(mark => mark === 'correct'))
  const end = solvedIndex >= 0 ? solvedIndex + 1 : guesses.length
  const finished = solvedIndex >= 0 || end >= 6
  return {
    ...attempt,
    guesses: guesses.slice(0, end),
    marks: marks.slice(0, end),
    solved: solvedIndex >= 0,
    finishedAt: finished ? attempt.finishedAt ?? attempt.updatedAt : undefined,
    activeMs: Math.min(Math.max(0, attempt.activeMs), 2 * 60 * 60 * 1000),
  }
}

function withWordScores(doc: ArcadeDoc): ArcadeDoc {
  const scores = doc.scores.filter(item => item.game !== 'word')
  for (const attempt of doc.words) {
    if (!attempt.finishedAt) continue
    scores.push({
      id: `word_${attempt.userId}_${attempt.day}`,
      game: 'word',
      userId: attempt.userId,
      name: attempt.name,
      at: attempt.finishedAt,
      day: attempt.day,
      guesses: attempt.guesses.length,
      solved: attempt.solved,
      activeMs: attempt.activeMs,
    })
  }
  return { ...doc, scores: scores.slice(-400) }
}

function cleanAttempt(value: unknown): WordAttempt | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as WordAttempt
  if (typeof raw.userId !== 'string' || typeof raw.day !== 'string' || !Array.isArray(raw.guesses)) return null
  const guesses = raw.guesses.filter(guess => typeof guess === 'string').map(guess => guess.toLowerCase().slice(0, 5)).slice(0, 6)
  const marks = Array.isArray(raw.marks) ? raw.marks.slice(0, 6) : []
  return {
    day: raw.day.slice(0, 10),
    userId: raw.userId.slice(0, 80),
    name: (raw.name || 'Player').replace(/[<>]/g, '').slice(0, 40),
    guesses,
    marks,
    startedAt: typeof raw.startedAt === 'number' ? raw.startedAt : Date.now(),
    updatedAt: typeof raw.updatedAt === 'number' ? raw.updatedAt : Date.now(),
    finishedAt: typeof raw.finishedAt === 'number' ? raw.finishedAt : undefined,
    solved: !!raw.solved,
    activeMs: typeof raw.activeMs === 'number' ? Math.max(0, raw.activeMs) : 0,
    version: typeof raw.version === 'number' ? raw.version : 0,
  }
}

export function loadArcade(officeId: string): ArcadeDoc {
  try {
    const raw = JSON.parse(localStorage.getItem(keyOf(officeId)) || '') as Partial<ArcadeDoc>
    return withWordScores({
      version: typeof raw.version === 'number' ? raw.version : 0,
      scores: Array.isArray(raw.scores) ? raw.scores.map(cleanScore).filter((item): item is PlayerScore => !!item).slice(0, 400) : [],
      words: Array.isArray(raw.words) ? raw.words.map(cleanAttempt).filter((item): item is WordAttempt => !!item).slice(0, 400).map(repairAttempt) : [],
      leaderboardPublic: raw.leaderboardPublic !== false,
    })
  } catch {
    return { ...EMPTY, scores: [], words: [] }
  }
}

function mergeAttempt(a: WordAttempt, b: WordAttempt): WordAttempt {
  const prefix = (longer: WordAttempt, shorter: WordAttempt) =>
    longer.guesses.slice(0, shorter.guesses.length).join() === shorter.guesses.join()
  if (prefix(a, b) || prefix(b, a)) {
    const longer = a.guesses.length >= b.guesses.length ? a : b
    const other = longer === a ? b : a
    return { ...longer, activeMs: Math.max(a.activeMs, b.activeMs), version: Math.max(a.version, b.version), finishedAt: longer.finishedAt ?? other.finishedAt }
  }
  return a.startedAt <= b.startedAt ? a : b
}

function mergeDocs(a: ArcadeDoc, b: ArcadeDoc): ArcadeDoc {
  const scores = new Map<string, PlayerScore>()
  for (const score of [...a.scores, ...b.scores]) scores.set(score.id, score)
  const words = new Map<string, WordAttempt>()
  for (const attempt of [...a.words, ...b.words]) {
    const id = `${attempt.userId}:${attempt.day}`
    const prev = words.get(id)
    words.set(id, prev ? mergeAttempt(prev, attempt) : attempt)
  }
  return {
    version: Math.max(a.version, b.version),
    scores: [...scores.values()].slice(-400),
    words: [...words.values()].slice(-400),
    leaderboardPublic: a.leaderboardPublic && b.leaderboardPublic,
  }
}

function write(officeId: string, doc: ArcadeDoc) {
  const fresh = loadArcade(officeId)
  const merged = withWordScores({ ...mergeDocs(fresh, doc), words: mergeDocs(fresh, doc).words.map(repairAttempt) })
  merged.leaderboardPublic = doc.leaderboardPublic
  merged.version = Math.max(fresh.version, doc.version) + 1
  try { localStorage.setItem(keyOf(officeId), JSON.stringify(merged)) } catch { /* ignore */ }
  publishArcade(officeId, merged)
  window.dispatchEvent(new CustomEvent('vo-arcade', { detail: officeId }))
  return merged
}

export function setLeaderboardPublic(officeId: string, visible: boolean) {
  const doc = loadArcade(officeId)
  doc.leaderboardPublic = visible
  return write(officeId, doc)
}

export function recordScore(officeId: string, score: PlayerScore) {
  const doc = loadArcade(officeId)
  if (doc.scores.some(item => item.id === score.id)) return doc
  doc.scores.push(score)
  return write(officeId, doc)
}

export function personalBest(doc: ArcadeDoc, userId: string, game: ArcadeGame, difficulty?: MemoryDifficulty) {
  const mine = doc.scores.filter(item => item.userId === userId && item.game === game && (difficulty ? item.difficulty === difficulty : true))
  if (game === 'snake') return mine.reduce((best, item) => Math.max(best, item.score ?? 0), 0)
  if (game === 'memory') {
    const done = mine.filter(item => typeof item.ms === 'number')
    if (!done.length) return null
    return done.reduce((best, item) => (item.ms ?? Infinity) < (best.ms ?? Infinity) ? item : best)
  }
  if (game === 'pool') {
    const done = mine.filter(item => typeof item.shots === 'number')
    if (!done.length) return null
    return done.reduce((best, item) => (item.shots ?? Infinity) < (best.shots ?? Infinity) || ((item.shots === best.shots) && (item.ms ?? Infinity) < (best.ms ?? Infinity)) ? item : best)
  }
  return null
}

export interface WordView {
  day: string
  number: number
  guesses: string[]
  marks: Mark[][]
  solved: boolean
  finished: boolean
  activeMs: number
  answer?: string
  error?: string
}

function viewOf(attempt: WordAttempt | undefined, day: string, reveal: boolean): WordView {
  return {
    day,
    number: puzzleNumber(day),
    guesses: attempt?.guesses ?? [],
    marks: attempt?.marks ?? [],
    solved: !!attempt?.solved,
    finished: !!attempt?.finishedAt,
    activeMs: attempt?.activeMs ?? 0,
    answer: reveal && attempt?.finishedAt ? answerForDay(day) : undefined,
  }
}

export function readWord(officeId: string, userId: string, now = new Date()): WordView {
  const day = utcDay(now)
  const attempt = loadArcade(officeId).words.find(item => item.userId === userId && item.day === day)
  return viewOf(attempt, day, !!attempt?.finishedAt)
}

export function tickWord(officeId: string, userId: string, name: string, delta: number, now = new Date()) {
  const day = utcDay(now)
  const doc = loadArcade(officeId)
  let attempt = doc.words.find(item => item.userId === userId && item.day === day)
  if (attempt?.finishedAt) return viewOf(attempt, day, true)
  if (!attempt) {
    attempt = {
      day, userId, name, guesses: [], marks: [], startedAt: now.getTime(), updatedAt: now.getTime(),
      solved: false, activeMs: 0, version: 1,
    }
    doc.words.push(attempt)
  }
  attempt.activeMs += Math.max(0, Math.min(delta, 12_000))
  attempt.updatedAt = now.getTime()
  attempt.version += 1
  write(officeId, doc)
  return viewOf(attempt, day, false)
}

export function submitWord(officeId: string, userId: string, name: string, raw: string, now = new Date()): WordView {
  const day = utcDay(now)
  const guess = raw.toLowerCase().replace(/[^a-z]/g, '')
  const doc = loadArcade(officeId)
  let attempt = doc.words.find(item => item.userId === userId && item.day === day)
  if (attempt?.finishedAt) return { ...viewOf(attempt, day, true), error: 'This puzzle is already finished.' }
  if (guess.length !== 5 || !isWord(guess)) {
    return { ...viewOf(attempt, day, false), error: 'Enter a five-letter word.' }
  }
  if (!attempt) {
    attempt = {
      day, userId, name, guesses: [], marks: [], startedAt: now.getTime(), updatedAt: now.getTime(),
      solved: false, activeMs: 0, version: 1,
    }
    doc.words.push(attempt)
  }
  if (attempt.guesses.length >= 6) return { ...viewOf(attempt, day, true), error: 'This puzzle is already finished.' }
  const answer = answerForDay(day)
  const marks = markGuess(answer, guess)
  attempt.guesses.push(guess)
  attempt.marks.push(marks)
  attempt.updatedAt = now.getTime()
  attempt.version += 1
  attempt.solved = marks.every(mark => mark === 'correct')
  if (attempt.solved || attempt.guesses.length >= 6) {
    attempt.finishedAt = now.getTime()
    doc.scores.push({
      id: `word_${userId}_${day}`,
      game: 'word',
      userId,
      name,
      at: now.getTime(),
      day,
      guesses: attempt.guesses.length,
      solved: attempt.solved,
      activeMs: attempt.activeMs,
    })
  }
  write(officeId, doc)
  return viewOf(attempt, day, !!attempt.finishedAt)
}

export function wordStreak(doc: ArcadeDoc, userId: string, now = new Date()) {
  const days = new Set(doc.words.filter(item => item.userId === userId && item.solved).map(item => item.day))
  let best = 0
  let run = 0
  const sorted = [...days].sort()
  for (let i = 0; i < sorted.length; i++) {
    if (i === 0) run = 1
    else {
      const prev = Date.parse(`${sorted[i - 1]}T00:00:00Z`)
      const cur = Date.parse(`${sorted[i]}T00:00:00Z`)
      run = cur - prev === 86_400_000 ? run + 1 : 1
    }
    best = Math.max(best, run)
  }
  const today = utcDay(now)
  const yesterday = utcDay(new Date(now.getTime() - 86_400_000))
  let current = 0
  let cursor = days.has(today) ? today : days.has(yesterday) ? yesterday : ''
  while (cursor && days.has(cursor)) {
    current += 1
    cursor = utcDay(new Date(Date.parse(`${cursor}T00:00:00Z`) - 86_400_000))
  }
  return { current, best }
}

export function rankWord(scores: PlayerScore[], day: string) {
  return scores
    .filter(item => item.game === 'word' && item.day === day)
    .sort((a, b) => Number(b.solved) - Number(a.solved) || (a.solved ? (a.guesses ?? 9) - (b.guesses ?? 9) : 0) || (a.activeMs ?? 0) - (b.activeMs ?? 0))
}

export function rankSnake(scores: PlayerScore[]) {
  return scores.filter(item => item.game === 'snake').sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}

export function rankMemory(scores: PlayerScore[], difficulty: MemoryDifficulty) {
  return scores.filter(item => item.game === 'memory' && item.difficulty === difficulty).sort((a, b) => (a.ms ?? Infinity) - (b.ms ?? Infinity) || (a.moves ?? 0) - (b.moves ?? 0))
}

export function rankPool(scores: PlayerScore[]) {
  return scores.filter(item => item.game === 'pool').sort((a, b) => (a.shots ?? Infinity) - (b.shots ?? Infinity) || (a.ms ?? Infinity) - (b.ms ?? Infinity))
}

export function weekStart(now = new Date()) {
  const day = utcDay(now)
  const t = Date.parse(`${day}T00:00:00Z`)
  const offset = (new Date(t).getUTCDay() + 6) % 7
  return utcDay(new Date(t - offset * 86_400_000))
}

export interface WeekRow {
  userId: string
  name: string
  solved: number
  played: number
  average: number
  streak: number
}

export function rankWordWeek(doc: ArcadeDoc, now = new Date()): WeekRow[] {
  const start = weekStart(now)
  const end = utcDay(now)
  const rows = new Map<string, WeekRow>()
  for (const attempt of doc.words) {
    if (!attempt.finishedAt || attempt.day < start || attempt.day > end) continue
    const row = rows.get(attempt.userId) ?? {
      userId: attempt.userId,
      name: attempt.name,
      solved: 0,
      played: 0,
      average: 0,
      streak: wordStreak(doc, attempt.userId, now).current,
    }
    row.played += 1
    if (attempt.solved) {
      row.solved += 1
      row.average += attempt.guesses.length
    }
    rows.set(attempt.userId, row)
  }
  return [...rows.values()]
    .map(row => ({ ...row, average: row.solved ? row.average / row.solved : 99 }))
    .sort((a, b) => b.solved - a.solved || a.average - b.average || b.streak - a.streak)
}
