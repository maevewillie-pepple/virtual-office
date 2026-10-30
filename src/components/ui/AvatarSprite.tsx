import React, { useRef, useEffect } from 'react'
import type { AvatarConfig } from '../../types'
import { drawAvatar } from '../../utils/pixelArt'

interface AvatarSpriteProps {
  config: AvatarConfig
  status?: string
  name?: string
  size?: number
  className?: string
  style?: React.CSSProperties
}

export default function AvatarSprite({
  config, status = 'online', name = '', size = 48, className = '', style
}: AvatarSpriteProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawAvatar(ctx, size / 2, size * 0.6, config, name, status, false, false, false, 0)
  }, [config, status, name, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      className={`pixel-art ${className}`}
      style={{ imageRendering: 'pixelated', ...style }}
      aria-hidden="true"
    />
  )
}
