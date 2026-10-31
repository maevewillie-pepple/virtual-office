import React, { useEffect, useRef, useState } from 'react'
import type { CafeDrink, FinishedDrink, LatteArt } from '../../types'
import { drawIcon, drawStation, resetCamera, stationSize, type StationScene } from '../../game/barista/draw'
import {
  DRINKS, TIMING_ZONE, artTitle, grindLabel, grindScore, groupsFor, overallStars, phaseGroup, phasesFor,
  pourOutcome, recordDrink, resultLine, resultTitle, steamBand, steamLabel, steamScore, timingLabel, timingScore,
  loadStats, favouriteDrink, type CafePhase,
} from '../../game/barista/logic'
import { drinkName } from '../../game/barista/carry'
import { Volume2, VolumeX, X } from 'lucide-react'

interface BaristaGameProps {
  onClose: () => void
  onQuick: () => void
  onCollect: (drink: FinishedDrink) => void
}

type Screen = 'choose' | 'menu' | 'play' | 'results'

const SOUND_KEY = 'vo_barista_muted'
const TEAS = ['English breakfast', 'Earl Grey', 'Green', 'Peppermint']
const TOPS: { id: string; label: string }[] = [
  { id: 'marshmallow', label: 'Marshmallows' },
  { id: 'cream', label: 'Cream' },
  { id: 'cocoa', label: 'Cocoa' },
  { id: 'shavings', label: 'Shavings' },
]

const PROMPTS: Record<CafePhase, string> = {
  grind: 'Hold to grind, then release inside the marked zone.',
  dock: 'Lock the portafilter into the group head.',
  place: 'Set the cup under the spout.',
  pull: 'Stop the extraction when it reaches the sweet spot.',
  steam: 'Stop while the milk is silky. Raise the pitcher for more foam.',
  pour: 'Hold to pour. Keep the stream where you want the picture.',
  dust: 'Dust a little cocoa, or leave the foam plain.',
  heat: 'Warm the milk, then stop in the marked zone.',
  stir: 'Stir until the cocoa melts smooth.',
  top: 'Choose a topping.',
  leaf: 'Choose the leaves.',
  kettle: 'Pour the water.',
  steep: 'Lift the infuser while the bar is in the zone.',
}

const STAGE_TITLE: Record<CafePhase, string> = {
  grind: 'Grind the beans',
  dock: 'Lock the portafilter',
  place: 'Set the cup',
  pull: 'Pull the shot',
  steam: 'Steam the milk',
  pour: 'Pour',
  dust: 'Finish the foam',
  heat: 'Warm the milk',
  stir: 'Stir the cocoa',
  top: 'Add a topping',
  leaf: 'Choose the tea',
  kettle: 'Pour the water',
  steep: 'Steep',
}

export default function BaristaGame({ onClose, onQuick, onCollect }: BaristaGameProps) {
  const reduced = useRef(typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches).current
  const [screen, setScreen] = useState<Screen>('choose')
  const [drink, setDrink] = useState<CafeDrink>('latte')
  const [phaseList, setPhaseList] = useState<CafePhase[]>([])
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [notes, setNotes] = useState<string[]>([])
  const [art, setArt] = useState<LatteArt | undefined>()
  const [tea, setTea] = useState(TEAS[0])
  const [topping, setTopping] = useState<string | undefined>()
  const [progress, setProgress] = useState(0)
  const [running, setRunning] = useState(false)
  const [holding, setHolding] = useState(false)
  const [grounds, setGrounds] = useState(0)
  const [lock, setLock] = useState(0)
  const [cup, setCup] = useState(0)
  const [pitcher, setPitcher] = useState(0.45)
  const [foam, setFoam] = useState(0.5)
  const [pourX, setPourX] = useState(0.5)
  const [pouring, setPouring] = useState(false)
  const [samples, setSamples] = useState<number[]>([])
  const [stir, setStir] = useState(0)
  const [sprinkle, setSprinkle] = useState(false)
  const [relaxed, setRelaxed] = useState(false)
  const [muted, setMuted] = useState(() => localStorage.getItem(SOUND_KEY) === '1')
  const [flash, setFlash] = useState('')
  const [badge, setBadge] = useState('')
  const [stats] = useState(loadStats)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ended = useRef(false)
  const collected = useRef(false)
  const recorded = useRef(false)
  const snapping = useRef(false)
  const tick = useRef(0)
  const scoresRef = useRef<number[]>([])
  const artRef = useRef<LatteArt | undefined>(undefined)
  const phaseRef = useRef<CafePhase | 'idle'>('idle')
  const phasesRef = useRef<CafePhase[]>([])
  const phaseIndexRef = useRef(0)
  const drinkRef = useRef<CafeDrink>('latte')
  const holdingRef = useRef(false)
  const runningRef = useRef(false)
  const groundsRef = useRef(0)
  const progressRef = useRef(0)
  const pitcherRef = useRef(0.45)
  const pourRef = useRef(0.5)
  const samplesRef = useRef<number[]>([])
  const goodRef = useRef(0)
  const badRef = useRef(0)
  const stirRef = useRef(0)
  const lastAngle = useRef<number | null>(null)
  const stirring = useRef(false)
  const relaxedRef = useRef(false)
  const mutedRef = useRef(muted)
  const releaseRef = useRef<() => void>(() => {})
  const stopRef = useRef<(value: number) => void>(() => {})
  const endPourRef = useRef<() => void>(() => {})

  const phase: CafePhase | 'idle' = screen === 'play' ? phaseList[phaseIndex] ?? 'grind' : 'idle'
  phaseRef.current = phase
  drinkRef.current = drink
  runningRef.current = running
  progressRef.current = progress
  relaxedRef.current = relaxed
  mutedRef.current = muted

  const prompt = phase === 'idle' ? '' : promptFor(phase, drink)
  const scene: StationScene = {
    view: screen === 'results' ? 'result' : phase === 'pour' ? 'cup' : 'world',
    camera: cameraFor(phase),
    drink,
    phase,
    progress,
    running,
    holding,
    grounds,
    lock,
    cup,
    pitcher,
    foam,
    pourX,
    pouring,
    samples,
    art: screen === 'results' ? art : previewArt(samples, drink),
    strength: art ? 1 : Math.min(1, samples.length / 8),
    tea,
    topping,
    stir,
    sprinkle,
    tick: tick.current,
    reduced,
    stars: screen === 'results' ? overallStars(scores) : undefined,
  }
  const sceneRef = useRef(scene)
  sceneRef.current = scene

  useEffect(() => {
    const active = document.activeElement
    if (active instanceof HTMLElement && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) active.blur()
  }, [])

  useEffect(() => {
    if (!flash) return
    const id = window.setTimeout(() => setFlash(''), 1400)
    return () => window.clearTimeout(id)
  }, [flash])

  useEffect(() => {
    let frame = 0
    const loop = () => {
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (ctx) {
        tick.current += 1
        drawStation(ctx, { ...sceneRef.current, tick: tick.current })
      }
      frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [screen])

  useEffect(() => {
    if (phase !== 'grind' || !holding) return
    let frame = 0
    let last = performance.now()
    const loop = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      groundsRef.current = Math.min(1, groundsRef.current + dt * (relaxedRef.current ? 0.28 : 0.45))
      setGrounds(groundsRef.current)
      if (groundsRef.current >= 1) releaseRef.current()
      else frame = requestAnimationFrame(loop)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [phase, holding])

  useEffect(() => {
    if (!running) return
    const current = phaseRef.current
    if (current !== 'pull' && current !== 'steam' && current !== 'heat' && current !== 'steep' && current !== 'kettle') return
    const duration = current === 'kettle' ? 1100 : current === 'steam' ? (reduced ? 5200 : 4200) : reduced ? 4800 : 3200
    const start = performance.now()
    let frame = 0
    const loop = (now: number) => {
      const next = Math.min(1, (now - start) / duration)
      progressRef.current = next
      setProgress(next)
      if (phaseRef.current === 'steam') {
        const band = steamBand(drinkRef.current)
        const height = pitcherRef.current
        if (height >= band.start && height <= band.end) goodRef.current += 1
        else badRef.current += 1
        const total = goodRef.current + badRef.current
        setFoam(total ? goodRef.current / total : 0)
      }
      if (next < 1) frame = requestAnimationFrame(loop)
      else if (phaseRef.current === 'kettle') gate()
      else stopRef.current(1)
    }
    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [running, phase, reduced])

  useEffect(() => {
    if (!pouring) return
    const id = window.setInterval(() => {
      samplesRef.current = [...samplesRef.current, pourRef.current]
      setSamples(samplesRef.current)
    }, 90)
    const cap = window.setTimeout(() => endPourRef.current(), 2200)
    return () => {
      window.clearInterval(id)
      window.clearTimeout(cap)
    }
  }, [pouring])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement | null)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        onClose()
        return
      }
      if (screen !== 'play') return
      if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'a' || event.key === 'd' || event.key === 'A' || event.key === 'D') {
        event.preventDefault()
        event.stopPropagation()
        nudge(event.key)
        return
      }
      if (/^[1-4]$/.test(event.key) && event.type === 'keydown' && !event.repeat) {
        event.preventDefault()
        const index = Number(event.key) - 1
        if (phaseRef.current === 'leaf') pickLeaf(index)
        if (phaseRef.current === 'top') pickTop(index)
        return
      }
      if (event.key !== ' ' && event.key !== 'Enter') return
      event.preventDefault()
      event.stopPropagation()
      if (event.repeat) return
      if (event.type === 'keydown') pressDown()
      if (event.type === 'keyup' && event.key === ' ') pressUp()
    }
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('keyup', onKey, true)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('keyup', onKey, true)
    }
  }, [onClose, screen])

  const goNext = () => {
    const next = phaseIndexRef.current + 1
    phaseIndexRef.current = next
    setRunning(false)
    setHolding(false)
    setPouring(false)
    holdingRef.current = false
    runningRef.current = false
    if (next >= phasesRef.current.length) {
      const stars = overallStars(scoresRef.current)
      if (!recorded.current) {
        recorded.current = true
        const saved = recordDrink(drinkRef.current, stars, artRef.current)
        if (saved.fresh[0]) setBadge(saved.fresh[0])
      }
      setScreen('results')
      tone(mutedRef.current, 620, 0.16)
      return
    }
    setPhaseIndex(next)
    setProgress(0)
    progressRef.current = 0
    setSprinkle(false)
    goodRef.current = 0
    badRef.current = 0
    ended.current = false
    snapping.current = false
  }

  const scorePhase = (score: number, label: string) => {
    if (ended.current) return
    ended.current = true
    scoresRef.current = [...scoresRef.current, score]
    setScores(scoresRef.current)
    setNotes(prev => [...prev, label])
    setFlash(label)
    tone(mutedRef.current, 420, 0.1)
    goNext()
  }

  const gate = () => {
    if (ended.current) return
    ended.current = true
    tone(mutedRef.current, 280, 0.08)
    goNext()
  }

  const releaseGrind = () => {
    if (phaseRef.current !== 'grind' || !holdingRef.current) return
    holdingRef.current = false
    setHolding(false)
    scorePhase(grindScore(groundsRef.current, relaxedRef.current), grindLabel(groundsRef.current))
  }
  releaseRef.current = releaseGrind

  const stopTimed = (value: number) => {
    const current = phaseRef.current
    if (current === 'steam') {
      const total = goodRef.current + badRef.current
      const ratio = total ? goodRef.current / total : 0
      scorePhase(steamScore(value, goodRef.current, total, relaxedRef.current), steamLabel(value, ratio))
      return
    }
    if (current !== 'pull' && current !== 'heat' && current !== 'steep') return
    const kind = current === 'pull' ? 'shot' : current === 'heat' ? 'heat' : 'brew'
    scorePhase(timingScore(value, relaxedRef.current), timingLabel(value, kind))
  }
  stopRef.current = stopTimed

  const startTimed = () => {
    if (runningRef.current || ended.current) return
    runningRef.current = true
    progressRef.current = 0
    setProgress(0)
    setRunning(true)
    tone(mutedRef.current, 180, 0.08)
  }

  const snap = (apply: (value: number) => void, done: () => void) => {
    if (snapping.current || ended.current) return
    snapping.current = true
    const start = performance.now()
    const run = (now: number) => {
      const t = Math.min(1, (now - start) / (reduced ? 1 : 260))
      apply(t)
      if (t < 1) requestAnimationFrame(run)
      else done()
    }
    requestAnimationFrame(run)
  }

  const snapLock = () => snap(value => setLock(value), () => { setFlash('Locked in'); gate() })
  const snapCup = () => snap(value => setCup(value), () => { setFlash('Cup’s ready'); gate() })

  const beginPour = () => {
    if (phaseRef.current !== 'pour' || pouring) return
    samplesRef.current = []
    setSamples([])
    setPouring(true)
  }

  const endPour = () => {
    if (phaseRef.current !== 'pour' || ended.current) return
    setPouring(false)
    const xs = samplesRef.current
    const picked = xs.length >= 3 ? [xs[0], xs[Math.floor(xs.length / 2)], xs[xs.length - 1]] : xs
    const outcome = pourOutcome(picked, drinkRef.current)
    artRef.current = outcome.art
    setArt(outcome.art)
    const label = outcome.art === 'heart' ? 'Lovely pour' : outcome.art === 'swirl' ? 'A little messy, but made with love' : `${artTitle(outcome.art)} pour`
    scorePhase(outcome.score, label)
  }
  endPourRef.current = endPour

  const finishStir = (score: number) => {
    scorePhase(score, score >= 5 ? 'Stirred smooth' : 'Cocoa melted')
  }

  const addStir = (amount: number, score: number) => {
    if (phaseRef.current !== 'stir' || ended.current) return
    stirRef.current += amount
    setStir(stirRef.current)
    if (stirRef.current >= 6.2) finishStir(score)
  }

  const dust = () => {
    if (phaseRef.current !== 'dust' || ended.current) return
    setTopping('cocoa')
    setSprinkle(true)
    tone(mutedRef.current, 520, 0.08)
    window.setTimeout(() => scorePhase(5, 'Cocoa dusting'), reduced ? 0 : 420)
  }

  const pickLeaf = (index: number) => {
    if (phaseRef.current !== 'leaf') return
    setTea(TEAS[index] ?? TEAS[0])
    gate()
  }

  const pickTop = (index: number) => {
    if (phaseRef.current !== 'top') return
    setTopping(TOPS[index]?.id ?? 'marshmallow')
    gate()
  }

  const nudge = (key: string) => {
    if (phaseRef.current === 'steam' && (key === 'ArrowUp' || key === 'ArrowDown')) {
      const next = Math.min(0.92, Math.max(0.08, pitcherRef.current + (key === 'ArrowUp' ? -0.07 : 0.07)))
      pitcherRef.current = next
      setPitcher(next)
    }
    if (phaseRef.current === 'pour' && (key === 'ArrowLeft' || key === 'ArrowRight')) {
      const next = Math.min(0.92, Math.max(0.08, pourRef.current + (key === 'ArrowLeft' ? -0.07 : 0.07)))
      pourRef.current = next
      setPourX(next)
    }
    if (phaseRef.current === 'stir' && (key === 'ArrowLeft' || key === 'ArrowRight' || key === 'a' || key === 'd' || key === 'A' || key === 'D')) {
      addStir(0.85, 4)
    }
  }

  const pressDown = () => {
    const current = phaseRef.current
    if (current === 'grind') {
      if (holdingRef.current) return
      holdingRef.current = true
      setHolding(true)
    } else if (current === 'dock') snapLock()
    else if (current === 'place') snapCup()
    else if (current === 'pull' || current === 'heat' || current === 'steep') {
      if (runningRef.current) stopTimed(progressRef.current)
      else startTimed()
    } else if (current === 'steam') {
      if (runningRef.current) stopTimed(progressRef.current)
      else startTimed()
    } else if (current === 'pour') beginPour()
    else if (current === 'kettle' && !runningRef.current) startTimed()
    else if (current === 'stir') addStir(0.85, 4)
    else if (current === 'dust') dust()
  }

  const pressUp = () => {
    if (phaseRef.current === 'grind') releaseGrind()
    if (phaseRef.current === 'pour') endPour()
  }

  const begin = (id: CafeDrink) => {
    const recipe = DRINKS.find(entry => entry.id === id) ?? DRINKS[0]
    const list = phasesFor(recipe.steps)
    phasesRef.current = list
    phaseIndexRef.current = 0
    scoresRef.current = []
    artRef.current = undefined
    groundsRef.current = 0
    progressRef.current = 0
    pitcherRef.current = 0.45
    pourRef.current = 0.5
    samplesRef.current = []
    goodRef.current = 0
    badRef.current = 0
    stirRef.current = 0
    holdingRef.current = false
    runningRef.current = false
    ended.current = false
    collected.current = false
    recorded.current = false
    snapping.current = false
    resetCamera()
    setDrink(id)
    setPhaseList(list)
    setPhaseIndex(0)
    setScores([])
    setNotes([])
    setArt(undefined)
    setTopping(undefined)
    setProgress(0)
    setRunning(false)
    setHolding(false)
    setGrounds(0)
    setLock(0)
    setCup(0)
    setPitcher(0.45)
    setFoam(0.5)
    setPourX(0.5)
    setPouring(false)
    setSamples([])
    setStir(0)
    setSprinkle(false)
    setFlash('')
    setBadge('')
    setScreen('play')
    tone(mutedRef.current, 240, 0.08)
  }

  const collect = () => {
    if (collected.current) return
    collected.current = true
    onCollect({
      kind: 'drink',
      token: `cup_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      drink,
      stars: overallStars(scoresRef.current),
      art: artRef.current,
      tea: drink === 'tea' ? tea : undefined,
      topping,
    })
  }

  const point = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
    }
  }

  const pointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* pointer already released */ }
    const p = point(event)
    const current = phaseRef.current
    if (current === 'grind') {
      holdingRef.current = true
      setHolding(true)
    } else if (current === 'dock') snapLock()
    else if (current === 'place') snapCup()
    else if (current === 'steam') {
      pitcherRef.current = Math.min(0.92, Math.max(0.08, p.y))
      setPitcher(pitcherRef.current)
    } else if (current === 'pour') {
      pourRef.current = Math.min(0.92, Math.max(0.08, p.x))
      setPourX(pourRef.current)
      beginPour()
    } else if (current === 'stir') {
      stirring.current = true
      lastAngle.current = Math.atan2(p.y - 0.55, p.x - 0.5)
    } else if (current === 'leaf') pickLeaf(Math.min(3, Math.floor(p.x * 4)))
    else if (current === 'top') pickTop(Math.min(3, Math.floor(p.x * 4)))
    else if (current === 'pull' || current === 'heat' || current === 'steep') {
      if (runningRef.current) stopTimed(progressRef.current)
      else startTimed()
    } else if (current === 'kettle') startTimed()
    else if (current === 'dust') dust()
  }

  const pointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const p = point(event)
    if (phaseRef.current === 'steam' && (event.buttons === 1 || event.pointerType === 'touch')) {
      pitcherRef.current = Math.min(0.92, Math.max(0.08, p.y))
      setPitcher(pitcherRef.current)
    }
    if (phaseRef.current === 'pour' && pouring) {
      pourRef.current = Math.min(0.92, Math.max(0.08, p.x))
      setPourX(pourRef.current)
    }
    if (phaseRef.current === 'stir' && stirring.current) {
      const angle = Math.atan2(p.y - 0.55, p.x - 0.5)
      if (lastAngle.current == null) lastAngle.current = angle
      let delta = angle - lastAngle.current
      if (delta > Math.PI) delta -= Math.PI * 2
      if (delta < -Math.PI) delta += Math.PI * 2
      lastAngle.current = angle
      addStir(Math.abs(delta), 5)
    }
  }

  const pointerUp = () => {
    stirring.current = false
    lastAngle.current = null
    if (phaseRef.current === 'grind') releaseGrind()
    if (phaseRef.current === 'pour') endPour()
  }

  const stars = overallStars(scores)
  const fav = favouriteDrink(stats)
  const { w, h } = stationSize()
  const groups = groupsFor(phaseList)
  const currentGroup = phase === 'idle' ? '' : phaseGroup(phase)
  const tempC = Math.round(55 + (progress - 0.4) * (10 / 0.3))

  const reviewBits = [
    ...notes,
    art ? artTitle(art) : '',
    drink === 'tea' ? tea : '',
    topping ? toppingName(topping) : '',
  ].filter((bit, index, all) => bit && all.indexOf(bit) === index)
  const best = Math.max(stats.best, screen === 'results' ? stars : 0)

  return (
    <div
      className={`absolute left-1/2 top-3 z-50 flex max-h-[calc(100%-0.75rem)] w-[min(800px,calc(100%-1rem))] -translate-x-1/2 flex-col border-2 border-ink bg-surface shadow-[4px_4px_0_#30352F] ${screen === 'menu' ? 'overflow-auto' : 'overflow-hidden'}`}
      role="dialog"
      aria-label="Café Counter"
      onMouseDown={event => event.stopPropagation()}
    >
      <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-3 border-b-2 border-ink bg-surface px-3">
        <h2 className="font-display text-[15px] font-bold uppercase tracking-[0.14em] text-ink">Café Counter</h2>
        {screen !== 'choose' && (
          <span className="truncate text-[14px] text-ink-2">{screen === 'menu' ? 'Choose a drink' : DRINKS.find(entry => entry.id === drink)?.name}</span>
        )}
        <button type="button" className="btn-stamp ml-auto flex h-8 w-8 items-center justify-center border-2 border-ink bg-surface text-ink" style={{ ['--btn-shadow' as string]: '2px 2px 0 #A9AB9F' }} aria-label={muted ? 'Unmute café sounds' : 'Mute café sounds'} onClick={() => { const next = !muted; setMuted(next); localStorage.setItem(SOUND_KEY, next ? '1' : '0') }}>
          {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
        <button type="button" className="btn-stamp flex h-8 w-8 items-center justify-center border-2 border-ink bg-surface text-ink" style={{ ['--btn-shadow' as string]: '2px 2px 0 #A9AB9F' }} aria-label="Close café" onClick={onClose}>
          <X size={15} />
        </button>
      </header>

      {screen === 'menu' ? (
        <div className="p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {DRINKS.map(entry => (
              <button key={entry.id} type="button" onClick={() => begin(entry.id)} className="flex items-start gap-2 border-2 border-ink bg-canvas p-2 text-left hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                <DrinkArt drink={entry.id} />
                <span className="min-w-0">
                  <span className="block text-[15px] font-medium text-ink">{entry.name}</span>
                  <span className="mt-0.5 block text-[14px] leading-5 text-ink-2">{entry.blurb}</span>
                  <span className="mt-1 block text-[13px] text-ink-2">{entry.difficulty} · {entry.duration}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="mt-4">
            <Quiet onClick={() => setScreen('choose')}>Back</Quiet>
          </div>
        </div>
      ) : (
        <>
          <div className="flex shrink-0 justify-center bg-[#E7D3B5]">
          <canvas
            ref={canvasRef}
            width={w}
            height={h}
            className="block max-w-full"
            style={{ imageRendering: 'pixelated', height: 'min(42vh, 360px)', width: 'auto' }}
            aria-label={prompt || 'Café counter'}
            onPointerDown={screen === 'play' ? pointerDown : undefined}
            onPointerMove={screen === 'play' ? pointerMove : undefined}
            onPointerUp={screen === 'play' ? pointerUp : undefined}
            onPointerCancel={screen === 'play' ? pointerUp : undefined}
          />
          </div>
          <section className="shrink-0 border-t-2 border-ink bg-canvas px-4 py-3" aria-live="polite">
            {screen === 'choose' && (
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[16px] leading-6 text-ink">Take a break and make something good.</p>
                  <p className="mt-1 text-[14px] text-ink-2">
                    {stats.made} made · best {stats.best || '–'}
                    {fav ? ` · usual ${drinkName(fav)}` : ''}
                  </p>
                  <label className="mt-2 inline-flex items-center gap-2 text-[14px] text-ink">
                    <input type="checkbox" checked={relaxed} onChange={event => setRelaxed(event.target.checked)} />
                    Relaxed timing
                  </label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Action onClick={() => setScreen('menu')}>Play barista</Action>
                  <Quiet onClick={onQuick}>Quick drink</Quiet>
                </div>
              </div>
            )}
            {screen === 'play' && phase !== 'idle' && (
              <div>
                <p className="font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-olive">{STAGE_TITLE[phase]}</p>
                <p className="mt-1 text-[15px] leading-6 text-ink">{prompt}</p>
                {flash && <p className="mt-1 text-[14px] font-medium text-olive" role="status">{flash}</p>}
                {phase === 'grind' && <Gauge value={grounds} start={0.55} end={0.8} label="Dose" low="Short" high="Full" />}
                {phase === 'pull' && <Gauge value={progress} start={TIMING_ZONE.start} end={TIMING_ZONE.end} label="Extraction" low="Under" high="Over" />}
                {phase === 'heat' && <Gauge value={progress} start={TIMING_ZONE.start} end={TIMING_ZONE.end} label="Heat" low="Cool" high="Hot" />}
                {phase === 'steep' && <Gauge value={progress} start={TIMING_ZONE.start} end={TIMING_ZONE.end} label="Steep" low="Shy" high="Long" />}
                {phase === 'steam' && (
                  <>
                    <Gauge value={progress} start={TIMING_ZONE.start} end={TIMING_ZONE.end} label="Heat" low="Cool" high="Hot" />
                    <p className="mt-1 text-[14px] text-ink-2">{tempC}°C · {foam > 0.55 ? 'Silky' : 'Still bubbling'}</p>
                  </>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  {phase === 'grind' && (
                    <Action onPointerDown={() => { holdingRef.current = true; setHolding(true) }} onPointerUp={releaseGrind} onPointerCancel={releaseGrind}>Hold to grind</Action>
                  )}
                  {phase === 'dock' && <Action onClick={snapLock}>Lock in</Action>}
                  {phase === 'place' && <Action onClick={snapCup}>Place cup</Action>}
                  {(phase === 'pull' || phase === 'heat' || phase === 'steep' || phase === 'steam') && (
                    running
                      ? <Action onClick={() => stopTimed(progressRef.current)}>Stop</Action>
                      : <Action onClick={startTimed}>Start</Action>
                  )}
                  {phase === 'steam' && (
                    <>
                      <Quiet onClick={() => nudge('ArrowUp')}>Raise</Quiet>
                      <Quiet onClick={() => nudge('ArrowDown')}>Lower</Quiet>
                    </>
                  )}
                  {phase === 'pour' && (
                    <>
                      <Quiet onClick={() => nudge('ArrowLeft')}>Left</Quiet>
                      <Action onPointerDown={beginPour} onPointerUp={endPour} onPointerCancel={endPour}>Hold to pour</Action>
                      <Quiet onClick={() => nudge('ArrowRight')}>Right</Quiet>
                    </>
                  )}
                  {phase === 'dust' && (
                    <>
                      <Action onClick={dust}>Dust cocoa</Action>
                      <Quiet onClick={() => scorePhase(4, 'Foam left plain')}>Leave plain</Quiet>
                    </>
                  )}
                  {phase === 'kettle' && <Action onClick={startTimed}>Pour</Action>}
                  {phase === 'stir' && <Action onClick={() => addStir(1.6, 4)}>Stir</Action>}
                  {phase === 'leaf' && TEAS.map((name, index) => <Quiet key={name} onClick={() => pickLeaf(index)}>{name.split(' ')[0]}</Quiet>)}
                  {phase === 'top' && TOPS.map((item, index) => <Quiet key={item.id} onClick={() => pickTop(index)}>{item.label}</Quiet>)}
                </div>
              </div>
            )}
            {screen === 'results' && (
              <div>
                <h3 className="font-display text-[22px] font-bold uppercase tracking-wide text-ink">{cap(resultTitle(drink, stars))}</h3>
                <p className="mt-1 font-mono text-[16px] tracking-wide text-olive" aria-label={`${stars} out of 5 stars`}>{'★'.repeat(stars)}{'☆'.repeat(5 - stars)}</p>
                {reviewBits.length > 0 && <p className="mt-2 text-[15px] leading-6 text-ink">{reviewBits.join(' · ')}</p>}
                <p className="mt-1 text-[15px] leading-6 text-ink-2">“{resultLine(drink, stars)}”</p>
                {best > 0 && <p className="mt-1 text-[14px] text-ink-2">Best cup so far · {best} {best === 1 ? 'star' : 'stars'}</p>}
                {badge && <p className="mt-1 text-[14px] text-olive">{badge}</p>}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Action onClick={collect}>Take drink</Action>
                  <Quiet onClick={() => { setScreen('menu'); setArt(undefined) }}>Make another</Quiet>
                  <Quiet onClick={onClose}>Close</Quiet>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {screen === 'play' && (
        <footer className="flex shrink-0 flex-wrap items-center gap-2 border-t-2 border-ink bg-surface px-3 py-2">
          <ol className="flex flex-wrap items-center gap-2" aria-label="Drink progress">
            {groups.map((group, index) => {
              const current = groups.indexOf(currentGroup)
              const state = index < current ? 'done' : index === current ? 'current' : 'upcoming'
              return (
                <li key={group} className="flex items-center gap-2" aria-current={state === 'current' ? 'step' : undefined}>
                  {index > 0 && <span className="text-[13px] text-ink-3" aria-hidden>→</span>}
                  <span className={`font-mono text-[13px] font-bold uppercase tracking-wide ${
                    state === 'current' ? 'text-olive' : state === 'done' ? 'text-ink' : 'text-ink-3'
                  }`}>{group}</span>
                </li>
              )
            })}
          </ol>
          <span className="ml-auto text-[13px] text-ink-2">Space acts · Arrows nudge</span>
        </footer>
      )}
    </div>
  )
}

function cameraFor(phase: CafePhase | 'idle'): StationScene['camera'] {
  if (phase === 'grind') return 'grind'
  if (phase === 'dock' || phase === 'place' || phase === 'pull' || phase === 'dust') return 'machine'
  if (phase === 'steam') return 'steam'
  if (phase === 'heat' || phase === 'stir' || phase === 'top' || phase === 'leaf' || phase === 'kettle' || phase === 'steep') return 'kettle'
  return 'counter'
}

function promptFor(phase: CafePhase, drink: CafeDrink) {
  if (phase === 'pour' && drink === 'flat_white') return 'A thin stream. Keep it centred.'
  if (phase === 'steam' && drink === 'cappuccino') return 'Raise it for more foam.'
  if (phase === 'steam' && drink === 'flat_white') return 'Keep it low for thin foam.'
  return PROMPTS[phase]
}

function previewArt(samples: number[], drink: CafeDrink): LatteArt | undefined {
  if (samples.length < 3) return undefined
  const picked = [samples[0], samples[Math.floor(samples.length / 2)], samples[samples.length - 1]]
  return pourOutcome(picked, drink).art
}

function toppingName(topping: string) {
  if (topping === 'cocoa') return 'Cocoa dusting'
  if (topping === 'cream') return 'Whipped cream'
  if (topping === 'shavings') return 'Chocolate shavings'
  return 'Marshmallows'
}

function cap(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function DrinkArt({ drink }: { drink: CafeDrink }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!ctx) return
    drawIcon(ctx, drink)
  }, [drink])
  return <canvas ref={ref} width={32} height={32} className="h-16 w-16 shrink-0" style={{ imageRendering: 'pixelated' }} aria-hidden />
}

function Gauge({ value, start, end, label, low, high }: { value: number; start: number; end: number; label: string; low: string; high: string }) {
  return (
    <div className="mt-3 max-w-md">
      <div className="mb-1 flex justify-between text-[13px] text-ink-2">
        <span>{label}</span>
        <span>Ideal</span>
      </div>
      <div className="relative h-3 border-2 border-ink bg-surface" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(value * 100)} aria-label={`${label}. ${low} before the ideal zone, ${high} after it.`}>
        <div className="absolute inset-y-0 bg-olive-soft" style={{ left: `${start * 100}%`, width: `${(end - start) * 100}%` }} />
        <div className="absolute top-[-2px] h-4 w-1 bg-ink" style={{ left: `calc(${Math.min(100, value * 100)}% - 2px)` }} />
      </div>
      <div className="mt-1 flex justify-between text-[12px] text-ink-2">
        <span>{low}</span>
        <span>Ideal</span>
        <span>{high}</span>
      </div>
    </div>
  )
}

function Action({
  children, onClick, onPointerDown, onPointerUp, onPointerCancel,
}: {
  children: React.ReactNode
  onClick?: () => void
  onPointerDown?: () => void
  onPointerUp?: () => void
  onPointerCancel?: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={event => {
        if (!onPointerDown) return
        try { event.currentTarget.setPointerCapture(event.pointerId) } catch { /* already released */ }
        onPointerDown()
      }}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className="btn-stamp inline-flex h-9 items-center border-2 border-ink bg-ink px-3 font-mono text-[13px] font-bold uppercase tracking-wide text-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      style={{ ['--btn-shadow' as string]: '2px 2px 0 #66765C' }}
    >
      {children}
    </button>
  )
}

function Quiet({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-stamp inline-flex h-9 items-center border-2 border-ink bg-surface px-3 font-mono text-[13px] font-bold uppercase tracking-wide text-ink hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      style={{ ['--btn-shadow' as string]: '2px 2px 0 #A9AB9F' }}
    >
      {children}
    </button>
  )
}

function tone(muted: boolean, freq: number, seconds: number) {
  if (muted) return
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const audio = tone.ctx ?? new Ctx()
    tone.ctx = audio
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'triangle'
    osc.frequency.value = freq
    gain.gain.value = 0.02
    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start()
    gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + seconds)
    osc.stop(audio.currentTime + seconds)
  } catch { /* the office stays quiet */ }
}
tone.ctx = null as AudioContext | null
