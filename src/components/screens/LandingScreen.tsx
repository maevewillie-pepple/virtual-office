import { useEffect, useRef, type CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'
import type { AvatarConfig } from '../../types'
import Button from '../ui/Button'
import { demoAvatars } from '../../data/mockData'
import {
  drawArcadeMachine,
  drawAvatar,
  drawBookshelf,
  drawChair,
  drawCoffeeMachine,
  drawDesk,
  drawLamp,
  drawPlantLarge,
  drawPlantSmall,
  drawSofaH,
} from '../../utils/pixelArt'

interface LandingScreenProps {
  onCreateOffice: () => void
  onJoinOffice: () => void
  onSignIn: () => void
}

type DrawFn = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => void

const NATIVE = 48

function FurnitureSprite({
  draw,
  size,
  style,
}: {
  draw: DrawFn
  size: number
  style: CSSProperties
}) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, NATIVE, NATIVE)
    draw(ctx, 0, 0, NATIVE)
  }, [draw])

  return (
    <canvas
      ref={ref}
      width={NATIVE}
      height={NATIVE}
      aria-hidden
      className="pixel-art absolute animate-idle"
      style={{ width: size, height: size, ...style }}
    />
  )
}

function PersonSprite({
  config,
  style,
}: {
  config: AvatarConfig
  style: CSSProperties
}) {
  const width = 64
  const height = 88
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.imageSmoothingEnabled = false
    ctx.clearRect(0, 0, width, height)
    drawAvatar(ctx, width / 2, 46, config, '', 'online')
  }, [config])

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      aria-hidden
      className="pixel-art absolute animate-idle"
      style={{ width: 72, height: 99, ...style }}
    />
  )
}

const PIECES: { draw: DrawFn; size: number; style: CSSProperties }[] = [
  { draw: drawPlantLarge, size: 88, style: { top: '7%', left: '4%', animationDelay: '0s' } },
  { draw: drawLamp, size: 72, style: { top: '2%', left: '36%', animationDelay: '0.4s' } },
  { draw: drawDesk, size: 104, style: { top: '16%', left: '18%', animationDelay: '0.8s' } },
  { draw: drawBookshelf, size: 80, style: { top: '10%', right: '6%', animationDelay: '1.2s' } },
  { draw: drawChair, size: 68, style: { top: '40%', left: '2%', animationDelay: '0.2s' } },
  { draw: drawCoffeeMachine, size: 76, style: { top: '42%', left: '30%', animationDelay: '1s' } },
  { draw: drawSofaH, size: 96, style: { bottom: '12%', left: '12%', animationDelay: '0.6s' } },
  { draw: drawPlantSmall, size: 56, style: { bottom: '8%', left: '46%', animationDelay: '1.4s' } },
  { draw: drawArcadeMachine, size: 72, style: { bottom: '14%', right: '8%', animationDelay: '0.3s' } },
]

export default function LandingScreen({ onCreateOffice, onSignIn }: LandingScreenProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-canvas">
      <header className="absolute top-0 right-0 z-10 px-8 py-6">
        <button
          onClick={onSignIn}
          className="text-[13px] text-ink-2 hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus flex items-center gap-1"
        >
          Sign in <ArrowRight size={14} strokeWidth={1.75} />
        </button>
      </header>

      <div className="grid h-full grid-cols-1 items-center md:grid-cols-[minmax(420px,1.25fr)_minmax(260px,0.75fr)]">
        <section className="px-10 py-16 md:px-16 lg:px-20">
          <p className="type-label text-ink-3 uppercase tracking-widest mb-5">Virtual Office</p>
          <h1 className="type-display-xl font-display text-ink">
            Your own little
            <br />
            corner of the
            <br />
            <span className="text-clay">internet</span>
          </h1>
          <div className="mt-8">
            <Button size="lg" onClick={onCreateOffice}>Create your office</Button>
          </div>
        </section>

        <div className="relative h-[460px] md:h-full" aria-hidden>
          {PIECES.map((piece, i) => (
            <FurnitureSprite key={i} draw={piece.draw} size={piece.size} style={piece.style} />
          ))}
          <PersonSprite config={demoAvatars[1]} style={{ top: '28%', left: '52%', animationDelay: '0.5s' }} />
          <PersonSprite config={demoAvatars[5]} style={{ bottom: '28%', left: '38%', animationDelay: '1.1s' }} />
        </div>
      </div>
    </div>
  )
}
