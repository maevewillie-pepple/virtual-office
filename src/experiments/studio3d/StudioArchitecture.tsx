import React from 'react'
import * as THREE from 'three'
import * as M from './Materials'

// ─── Helpers ───────────────────────────────────────────────────────────────
function Box({ pos, size, mat, receiveShadow = true, castShadow = false }:
  { pos: [number,number,number]; size: [number,number,number]; mat: THREE.Material; receiveShadow?: boolean; castShadow?: boolean }) {
  return (
    <mesh position={pos} receiveShadow={receiveShadow} castShadow={castShadow} material={mat}>
      <boxGeometry args={size} />
    </mesh>
  )
}

// ─── Large gridded windows (back-left wall) ─────────────────────────────────
function Windows() {
  const COLS = 5, ROWS = 4
  const fw = 0.06, fh = 0.06  // frame thickness
  const cw = 0.9, ch = 0.9    // cell inner size
  const totalW = COLS * (cw + fw) + fw
  const totalH = ROWS * (ch + fh) + fh
  const cells: React.ReactNode[] = []

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const px = -totalW / 2 + fw + c * (cw + fw) + cw / 2
      const py = 0.3 + fh + r * (ch + fh) + ch / 2
      cells.push(
        <mesh key={`g${r}-${c}`} position={[px, py, 0]} material={M.glass}>
          <planeGeometry args={[cw, ch]} />
        </mesh>
      )
    }
  }

  const frames: React.ReactNode[] = []
  // vertical mullions — castShadow true so sunlight makes grid on floor
  for (let c = 0; c <= COLS; c++) {
    const px = -totalW / 2 + c * (cw + fw) + fw / 2
    frames.push(
      <Box key={`vf${c}`} pos={[px, 0.3 + totalH / 2, 0.01]} size={[fw, totalH, 0.08]} mat={M.windowFrame} castShadow />
    )
  }
  // horizontal mullions
  for (let r = 0; r <= ROWS; r++) {
    const py = 0.3 + r * (ch + fh) + fh / 2
    frames.push(
      <Box key={`hf${r}`} pos={[0, py, 0.01]} size={[totalW, fh, 0.08]} mat={M.windowFrame} castShadow />
    )
  }

  return (
    <group position={[-5.5, 0, -7]} rotation={[0, 0, 0]}>
      {cells}
      {frames}
    </group>
  )
}

// ─── Mezzanine ──────────────────────────────────────────────────────────────
function Mezzanine() {
  return (
    <group>
      {/* Platform floor */}
      <Box pos={[4.5, 3.0, -3]} size={[7, 0.18, 6]} mat={M.oakLight} receiveShadow castShadow />
      {/* Front fascia */}
      <Box pos={[1.05, 2.3, -3]} size={[0.15, 1.5, 6]} mat={M.oakDark} castShadow />
      {/* Railing posts */}
      {[-0.5, 1, 2.5, 4].map((z, i) => (
        <Box key={i} pos={[1.05, 2.95, z - 3]} size={[0.06, 0.9, 0.06]} mat={M.railMetal} castShadow />
      ))}
      {/* Railing bar */}
      <Box pos={[1.05, 3.45, -3]} size={[0.05, 0.05, 6]} mat={M.railMetal} castShadow />
    </group>
  )
}

// ─── Staircase ──────────────────────────────────────────────────────────────
function Staircase() {
  const steps = 10
  const sw = 1.6, sd = 0.4, sh = 0.3
  return (
    <group position={[1.8, 0, -1]}>
      {Array.from({ length: steps }).map((_, i) => (
        <Box
          key={i}
          pos={[0, i * sh + sh / 2, -i * sd - sd / 2]}
          size={[sw, sh, sd]}
          mat={M.oakLight}
          castShadow
          receiveShadow
        />
      ))}
      {/* Side cheek walls */}
      <Box pos={[-sw / 2 - 0.05, steps * sh / 2, -steps * sd / 2]} size={[0.1, steps * sh, steps * sd]} mat={M.oakDark} />
      <Box pos={[ sw / 2 + 0.05, steps * sh / 2, -steps * sd / 2]} size={[0.1, steps * sh, steps * sd]} mat={M.oakDark} />
      {/* Handrail */}
      {[-1, 1].map((side, i) => (
        <group key={i}>
          {Array.from({ length: steps }).map((_, s) => (
            <Box
              key={s}
              pos={[side * (sw / 2 + 0.18), s * sh + sh * 0.9, -s * sd - sd / 2]}
              size={[0.04, 0.04, 0.04]}
              mat={M.railMetal}
              castShadow={false}
            />
          ))}
        </group>
      ))}
    </group>
  )
}

// ─── Main architecture ──────────────────────────────────────────────────────
export default function StudioArchitecture() {
  return (
    <group>
      {/* ── FLOOR ── */}
      <Box pos={[0, 0, 0]} size={[22, 0.2, 16]} mat={M.oakFloor} receiveShadow />

      {/* ── BACK WALL (behind windows) ── */}
      <Box pos={[-5.5, 4, -7.95]} size={[11, 10, 0.2]} mat={M.wall} />

      {/* ── LEFT WALL ── */}
      <Box pos={[-10.95, 4, -2]} size={[0.2, 10, 12]} mat={M.wall} />

      {/* ── RIGHT WALL ── */}
      <Box pos={[7.95, 3, -3]} size={[0.2, 8, 10]} mat={M.wall} />

      {/* ── BACK RIGHT WALL (behind mezzanine) ── */}
      <Box pos={[4.5, 4, -7.95]} size={[7, 10, 0.2]} mat={M.wall} />

      {/* ── CEILING (partial — keeps the cutaway look) ── */}
      <Box pos={[0, 9.1, -2]} size={[22, 0.2, 12]} mat={M.wall} receiveShadow={false} />

      {/* ── WINDOWS ── */}
      <Windows />

      {/* ── MEZZANINE + STAIRCASE ── */}
      <Mezzanine />
      <Staircase />

      {/* ── MEZZANINE SUPPORT COLUMN ── */}
      <Box pos={[1.2, 1.5, -6.9]} size={[0.25, 3.2, 0.25]} mat={M.oakDark} castShadow />
      <Box pos={[1.2, 1.5,  0.1]} size={[0.25, 3.2, 0.25]} mat={M.oakDark} castShadow />
    </group>
  )
}
