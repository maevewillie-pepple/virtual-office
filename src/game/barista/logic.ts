import type { CafeDrink, LatteArt } from '../../types'
import { publishBarista } from '../../remote/sync'

export interface DrinkRecipe {
  id: CafeDrink
  name: string
  blurb: string
  difficulty: string
  duration: string
  steps: StepKind[]
}

export type StepKind = 'espresso' | 'milk' | 'art' | 'foam' | 'heat' | 'stir' | 'topping' | 'leaf' | 'water' | 'brew'

export type CafePhase =
  | 'grind' | 'dock' | 'place' | 'pull'
  | 'steam' | 'pour' | 'dust'
  | 'heat' | 'stir' | 'top'
  | 'leaf' | 'kettle' | 'steep'

export const DRINKS: DrinkRecipe[] = [
  { id: 'espresso', name: 'Espresso', blurb: 'A short shot with crema.', difficulty: 'Easy', duration: '~25s', steps: ['espresso'] },
  { id: 'latte', name: 'Latte', blurb: 'Silky milk and a poured picture.', difficulty: 'Cosy', duration: '~45s', steps: ['espresso', 'milk', 'art'] },
  { id: 'cappuccino', name: 'Cappuccino', blurb: 'Foam, then a dusting of cocoa.', difficulty: 'Cosy', duration: '~45s', steps: ['espresso', 'milk', 'foam'] },
  { id: 'flat_white', name: 'Flat white', blurb: 'A thin, precise pour.', difficulty: 'Steady', duration: '~45s', steps: ['espresso', 'milk', 'art'] },
  { id: 'cocoa', name: 'Hot chocolate', blurb: 'Warm milk, melted cocoa, a topping.', difficulty: 'Easy', duration: '~35s', steps: ['heat', 'stir', 'topping'] },
  { id: 'tea', name: 'Tea', blurb: 'Leaves, hot water, a short steep.', difficulty: 'Easy', duration: '~25s', steps: ['leaf', 'water', 'brew'] },
]

export function phasesFor(steps: StepKind[]): CafePhase[] {
  const out: CafePhase[] = []
  for (const step of steps) {
    if (step === 'espresso') out.push('grind', 'dock', 'place', 'pull')
    else if (step === 'milk') out.push('steam')
    else if (step === 'art') out.push('pour')
    else if (step === 'foam') out.push('dust')
    else if (step === 'heat') out.push('heat')
    else if (step === 'stir') out.push('stir')
    else if (step === 'topping') out.push('top')
    else if (step === 'leaf') out.push('leaf')
    else if (step === 'water') out.push('kettle')
    else out.push('steep')
  }
  return out
}

export function phaseGroup(phase: CafePhase) {
  if (phase === 'grind') return 'Grind'
  if (phase === 'dock' || phase === 'place' || phase === 'pull') return 'Brew'
  if (phase === 'steam') return 'Steam'
  if (phase === 'pour') return 'Pour'
  if (phase === 'dust') return 'Finish'
  if (phase === 'heat') return 'Heat'
  if (phase === 'stir') return 'Stir'
  if (phase === 'top') return 'Top'
  if (phase === 'leaf') return 'Leaf'
  if (phase === 'kettle') return 'Pour'
  return 'Steep'
}

export function groupsFor(phases: CafePhase[]) {
  const labels: string[] = []
  for (const phase of phases) {
    const label = phaseGroup(phase)
    if (labels[labels.length - 1] !== label) labels.push(label)
  }
  return labels
}

export const STEP_COPY: Record<StepKind, { title: string; help: string }> = {
  espresso: { title: 'Pull the shot', help: 'Press Start. Press Stop while the marker sits in the gold band.' },
  milk: { title: 'Steam the milk', help: 'Heat the pitcher. Stop while the bar is in the gold band.' },
  art: { title: 'Pour the picture', help: 'Tap Pour three times. Where the stream sits decides the picture.' },
  foam: { title: 'Finish the foam', help: 'Dust cocoa across the foam, or leave it plain.' },
  heat: { title: 'Warm the milk', help: 'Heat the pan. Stop while the bar is in the gold band.' },
  stir: { title: 'Stir the cocoa', help: 'Tap Stir four times as the spoon swings through the mug.' },
  topping: { title: 'Add a topping', help: 'Marshmallows or cream. Both are a good idea.' },
  leaf: { title: 'Choose the tea', help: 'Pick a tin. Any of them makes a proper cup.' },
  water: { title: 'Pour the water', help: 'Tip the kettle. The cup fills on its own.' },
  brew: { title: 'Steep', help: 'Lift the infuser while the bar sits in the gold band.' },
}

const ZONE = { start: 0.4, end: 0.7 }

export function bandScore(value: number, start = ZONE.start, end = ZONE.end, relaxed = false) {
  const pad = relaxed ? 0.1 : 0
  const a = Math.max(0, start - pad)
  const b = Math.min(1, end + pad)
  if (value >= a && value <= b) return 5
  const dist = value < a ? a - value : value - b
  if (dist < 0.1) return 4
  if (dist < 0.2) return 3
  if (dist < 0.32) return 2
  return 1
}

export function timingScore(progress: number, relaxed = false) {
  return bandScore(progress, ZONE.start, ZONE.end, relaxed)
}

export function grindScore(amount: number, relaxed = false) {
  return bandScore(amount, 0.55, 0.8, relaxed)
}

export function grindLabel(amount: number) {
  if (amount < 0.45) return 'A little short'
  if (amount < 0.55) return 'Almost enough'
  if (amount <= 0.8) return 'Even grounds'
  return 'Packed a bit full'
}

export function steamBand(drink: CafeDrink) {
  if (drink === 'cappuccino') return { start: 0.18, end: 0.46 }
  if (drink === 'flat_white') return { start: 0.5, end: 0.74 }
  return { start: 0.36, end: 0.64 }
}

export function steamScore(temp: number, inBand: number, total: number, relaxed = false) {
  const heat = timingScore(temp, relaxed)
  const ratio = total > 0 ? inBand / total : 0
  const texture = ratio > 0.62 ? 5 : ratio > 0.45 ? 4 : ratio > 0.28 ? 3 : 2
  return Math.max(1, Math.min(5, Math.round(heat * 0.55 + texture * 0.45)))
}

export function steamLabel(temp: number, ratio: number) {
  if (temp > ZONE.end + 0.12) return 'A little too hot'
  if (temp < ZONE.start - 0.08) return 'Still cool'
  if (ratio > 0.55) return 'Silky milk'
  return 'Big bubbles'
}

export function timingLabel(progress: number, kind: 'shot' | 'milk' | 'brew' | 'heat') {
  const early = progress < ZONE.start
  const perfect = progress >= ZONE.start && progress <= ZONE.end
  if (kind === 'shot') return perfect ? 'Perfect shot' : early ? 'Under-extracted' : 'Over-extracted'
  if (kind === 'milk') return perfect ? 'Perfectly steamed' : early ? 'Too cool' : 'Too hot'
  if (kind === 'heat') return perfect ? 'Nicely warm' : early ? 'Still cool' : 'A little too hot'
  return perfect ? 'Nicely brewed' : early ? 'A little shy' : 'Steeped long'
}

export const TIMING_ZONE = ZONE

export function artFrom(xs: number[], center = 0.16): LatteArt {
  if (xs.length < 3) return 'swirl'
  if (xs.every(x => Math.abs(x - 0.5) < center)) return 'heart'
  const band = (x: number) => x < 0.38 ? -1 : x > 0.62 ? 1 : 0
  const sides = xs.map(band)
  if (sides[0] === -1 && sides[1] === 0 && sides[2] === 1) return 'tulip'
  const spread = xs.map(x => Math.abs(x - 0.5))
  if (spread[0] < spread[1] && spread[1] <= spread[2] + 0.02) return 'rosetta'
  return 'swirl'
}

export function artScore(art: LatteArt) {
  return art === 'swirl' ? 3 : 5
}

export function pourOutcome(xs: number[], drink: CafeDrink) {
  if (xs.length < 3) return { art: 'swirl' as LatteArt, score: 2 }
  const art = artFrom(xs, drink === 'flat_white' ? 0.1 : 0.18)
  const drift = xs.reduce((sum, x) => sum + Math.abs(x - 0.5), 0) / xs.length
  let score = art === 'swirl' ? 3 : 5
  if (drift > 0.32) score = Math.min(score, 2)
  else if (drift > 0.2) score = Math.min(score, art === 'swirl' ? 3 : 4)
  return { art, score }
}

export function artTitle(art: LatteArt) {
  if (art === 'heart') return 'Heart'
  if (art === 'rosetta') return 'Rosetta'
  if (art === 'tulip') return 'Tulip'
  return 'Abstract swirl'
}

export function overallStars(scores: number[]) {
  if (!scores.length) return 3
  const avg = scores.reduce((sum, n) => sum + n, 0) / scores.length
  return Math.max(1, Math.min(5, Math.round(avg)))
}

export function resultTitle(drink: CafeDrink, stars: number) {
  const name = DRINKS.find(entry => entry.id === drink)?.name ?? 'Drink'
  if (stars >= 5) return `Lovely ${name.toLowerCase()}`
  if (stars >= 4) return `Fine ${name.toLowerCase()}`
  return name
}

export function resultLine(drink: CafeDrink, stars: number) {
  if (stars >= 5) {
    if (drink === 'tea') return 'A proper steep. The office café approves.'
    if (drink === 'cocoa') return 'Rich and warm. The office café approves.'
    if (drink === 'espresso') return 'A clean shot. The office café approves.'
    return 'Beautiful foam. The office café approves.'
  }
  if (stars >= 4) return 'A generous cup. Someone will ask for the next one.'
  if (stars >= 3) return 'Warm, honest, and ready for a break.'
  if (stars >= 2) return 'A little uneven, and still worth holding.'
  return 'Ambitious. The mug believes in you.'
}

export interface BaristaStats {
  made: number
  perfect: number
  best: number
  byDrink: Partial<Record<CafeDrink, number>>
  arts: LatteArt[]
  achievements: string[]
}

const STATS_KEY = 'vo_barista_stats'
const ACHIEVEMENTS = [
  { id: 'first', label: 'First Brew', test: (s: BaristaStats) => s.made >= 1 },
  { id: 'connoisseur', label: 'Coffee Connoisseur', test: (s: BaristaStats) => s.made >= 8 },
  { id: 'artist', label: 'Latte Artist', test: (s: BaristaStats) => s.arts.length >= 1 },
  { id: 'tea', label: 'Tea Time', test: (s: BaristaStats) => (s.byDrink.tea ?? 0) >= 1 },
  { id: 'office', label: 'Office Barista', test: (s: BaristaStats) => s.perfect >= 3 },
]

export function loadStats(): BaristaStats {
  try {
    const raw = JSON.parse(localStorage.getItem(STATS_KEY) || '') as BaristaStats
    return {
      made: raw.made || 0,
      perfect: raw.perfect || 0,
      best: raw.best || 0,
      byDrink: raw.byDrink || {},
      arts: raw.arts || [],
      achievements: raw.achievements || [],
    }
  } catch {
    return { made: 0, perfect: 0, best: 0, byDrink: {}, arts: [], achievements: [] }
  }
}

export function recordDrink(drink: CafeDrink, stars: number, art?: LatteArt) {
  const stats = loadStats()
  stats.made += 1
  if (stars >= 5) stats.perfect += 1
  stats.best = Math.max(stats.best, stars)
  stats.byDrink[drink] = (stats.byDrink[drink] ?? 0) + 1
  if (art && !stats.arts.includes(art)) stats.arts.push(art)
  const fresh: string[] = []
  for (const badge of ACHIEVEMENTS) {
    if (!stats.achievements.includes(badge.id) && badge.test(stats)) {
      stats.achievements.push(badge.id)
      fresh.push(badge.label)
    }
  }
  localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  void publishBarista(stats)
  return { stats, fresh }
}

export function favouriteDrink(stats: BaristaStats) {
  let best: CafeDrink | null = null
  let count = 0
  for (const drink of Object.keys(stats.byDrink) as CafeDrink[]) {
    const n = stats.byDrink[drink] ?? 0
    if (n > count) { best = drink; count = n }
  }
  return best
}
