import React from 'react'
import * as THREE from 'three'
import * as M from './Materials'

function Box({ pos, size, mat, castShadow = true, receiveShadow = true, rot }:
  { pos: [number,number,number]; size: [number,number,number]; mat: THREE.Material
    castShadow?: boolean; receiveShadow?: boolean; rot?: [number,number,number] }) {
  return (
    <mesh position={pos} rotation={rot ?? [0,0,0]} receiveShadow={receiveShadow} castShadow={castShadow} material={mat}>
      <boxGeometry args={size} />
    </mesh>
  )
}

function Cyl({ pos, r, h, mat, castShadow = true }:
  { pos: [number,number,number]; r: number; h: number; mat: THREE.Material; castShadow?: boolean }) {
  return (
    <mesh position={pos} castShadow={castShadow} material={mat}>
      <cylinderGeometry args={[r, r, h, 12]} />
    </mesh>
  )
}

// ─── Computer Desk ──────────────────────────────────────────────────────────
export function Desk({ pos, rot = [0, 0, 0] }: { pos: [number,number,number]; rot?: [number,number,number] }) {
  return (
    <group position={pos} rotation={rot}>
      {/* Desktop */}
      <Box pos={[0, 0.75, 0]} size={[1.4, 0.06, 0.75]} mat={M.deskSurface} />
      {/* Legs */}
      {[[-0.62, -0.28], [0.62, -0.28], [-0.62, 0.28], [0.62, 0.28]].map(([x, z], i) => (
        <Box key={i} pos={[x, 0.37, z]} size={[0.06, 0.75, 0.06]} mat={M.oakDark} />
      ))}
      {/* Monitor */}
      <Box pos={[0, 1.25, -0.2]} size={[0.8, 0.48, 0.04]} mat={M.monitorBezel} />
      <Box pos={[0, 1.25, -0.18]} size={[0.72, 0.4, 0.01]} mat={M.monitorScreen} />
      <Box pos={[0, 0.95, -0.15]} size={[0.08, 0.2, 0.06]} mat={M.monitorBezel} />
      {/* Keyboard */}
      <Box pos={[0, 0.79, 0.1]} size={[0.5, 0.015, 0.18]} mat={M.monitorBezel} />
      {/* Mouse */}
      <Box pos={[0.35, 0.785, 0.1]} size={[0.07, 0.015, 0.12]} mat={M.monitorBezel} />
      {/* Mug */}
      <Cyl pos={[-0.5, 0.83, 0]} r={0.055} h={0.1} mat={M.ceramic} />
      <Cyl pos={[-0.5, 0.83, 0]} r={0.05} h={0.09} mat={M.monitorScreen} />
    </group>
  )
}

// ─── Chair ──────────────────────────────────────────────────────────────────
export function Chair({ pos, rot = [0, 0, 0] }: { pos: [number,number,number]; rot?: [number,number,number] }) {
  return (
    <group position={pos} rotation={rot}>
      {/* Seat */}
      <Box pos={[0, 0.5, 0]} size={[0.5, 0.08, 0.5]} mat={M.chairSeat} />
      {/* Back */}
      <Box pos={[0, 0.82, -0.22]} size={[0.5, 0.55, 0.07]} mat={M.chairSeat} />
      {/* Gas cylinder */}
      <Cyl pos={[0, 0.23, 0]} r={0.04} h={0.44} mat={M.chairLeg} />
      {/* Star base — 5 spokes */}
      {[0, 72, 144, 216, 288].map((deg, i) => {
        const a = (deg * Math.PI) / 180
        return (
          <Box key={i} pos={[Math.sin(a) * 0.22, 0.04, Math.cos(a) * 0.22]}
            size={[0.06, 0.04, 0.44]} rot={[0, a, 0]} mat={M.chairLeg} />
        )
      })}
    </group>
  )
}

// ─── Sofa ───────────────────────────────────────────────────────────────────
export function Sofa({ pos, rot = [0,0,0] }: { pos: [number,number,number]; rot?: [number,number,number] }) {
  return (
    <group position={pos} rotation={rot}>
      {/* Base */}
      <Box pos={[0, 0.22, 0]} size={[2.0, 0.44, 0.8]} mat={M.fabricSage} />
      {/* Back cushion */}
      <Box pos={[0, 0.55, -0.33]} size={[2.0, 0.5, 0.16]} mat={M.fabricSage} />
      {/* Arm rests */}
      <Box pos={[-0.92, 0.5, 0]} size={[0.18, 0.22, 0.8]} mat={M.fabricSage} />
      <Box pos={[ 0.92, 0.5, 0]} size={[0.18, 0.22, 0.8]} mat={M.fabricSage} />
      {/* Cushions */}
      {[-0.48, 0.48].map((x, i) => (
        <Box key={i} pos={[x, 0.52, 0.06]} size={[0.84, 0.12, 0.62]} mat={M.fabricPink} />
      ))}
    </group>
  )
}

// ─── Coffee table ───────────────────────────────────────────────────────────
export function CoffeeTable({ pos }: { pos: [number,number,number] }) {
  return (
    <group position={pos}>
      <Box pos={[0, 0.38, 0]} size={[0.9, 0.06, 0.5]} mat={M.coffeeTable} />
      {[[-0.38, -0.2], [0.38, -0.2], [-0.38, 0.2], [0.38, 0.2]].map(([x, z], i) => (
        <Box key={i} pos={[x, 0.19, z]} size={[0.05, 0.38, 0.05]} mat={M.oakDark} />
      ))}
      {/* Books on table */}
      <Box pos={[-0.2, 0.43, 0]} size={[0.2, 0.04, 0.14]} mat={M.bookBlue} />
      <Box pos={[-0.2, 0.47, 0]} size={[0.22, 0.04, 0.16]} mat={M.bookRed} />
      {/* Small plant pot */}
      <Cyl pos={[0.25, 0.42, 0.05]} r={0.065} h={0.08} mat={M.pot} />
      <mesh position={[0.25, 0.5, 0.05]} material={M.leafGreen}>
        <sphereGeometry args={[0.1, 8, 6]} />
      </mesh>
    </group>
  )
}

// ─── Rug ────────────────────────────────────────────────────────────────────
export function Rug({ pos }: { pos: [number,number,number] }) {
  return (
    <Box pos={pos} size={[2.8, 0.025, 1.8]} mat={M.rug} receiveShadow castShadow={false} />
  )
}

// ─── Bookshelf ──────────────────────────────────────────────────────────────
export function Bookshelf({ pos, rot = [0,0,0] }: { pos: [number,number,number]; rot?: [number,number,number] }) {
  const books = [M.bookRed, M.bookBlue, M.bookGreen, M.bookCream, M.bookOrange]
  return (
    <group position={pos} rotation={rot}>
      {/* Carcass */}
      <Box pos={[0, 1.0, 0]} size={[1.6, 2.0, 0.3]} mat={M.shelf} castShadow />
      {/* Back panel */}
      <Box pos={[0, 1.0, 0.07]} size={[1.52, 1.92, 0.04]} mat={M.wall} />
      {/* Shelves */}
      {[0.25, 0.85, 1.45].map((y, si) => (
        <group key={si}>
          <Box pos={[0, y, 0]} size={[1.52, 0.04, 0.28]} mat={M.shelf} />
          {/* Books */}
          {Array.from({ length: 7 }).map((_, bi) => {
            const bw = 0.12 + (bi % 3) * 0.03
            const bx = -0.6 + bi * 0.19
            return (
              <Box key={bi} pos={[bx, y + 0.17, 0.01]}
                size={[bw, 0.3, 0.22]}
                mat={books[(si * 3 + bi) % books.length]} />
            )
          })}
        </group>
      ))}
      {/* Top shelf decoratives */}
      <mesh position={[0.55, 1.95, 0.02]} material={M.leafGreen}>
        <sphereGeometry args={[0.08, 8, 6]} />
      </mesh>
      <Cyl pos={[-0.55, 1.9, 0.02]} r={0.04} h={0.1} mat={M.pot} />
    </group>
  )
}

// ─── Coffee machine ─────────────────────────────────────────────────────────
export function CoffeeMachine({ pos }: { pos: [number,number,number] }) {
  return (
    <group position={pos}>
      {/* Body */}
      <Box pos={[0, 0.28, 0]} size={[0.32, 0.56, 0.28]} mat={M.coffeeMetal} />
      {/* Spout */}
      <Cyl pos={[0, 0.38, 0.16]} r={0.025} h={0.14} mat={M.oakDark} />
      {/* Drip tray */}
      <Box pos={[0, 0.11, 0.08]} size={[0.22, 0.04, 0.18]} mat={M.coffeeMetal} />
      {/* Button panel */}
      <Box pos={[0, 0.5, 0.15]} size={[0.18, 0.1, 0.02]} mat={M.monitorBezel} />
      <mesh position={[-0.04, 0.5, 0.165]} material={M.monitorScreen}>
        <sphereGeometry args={[0.022, 8, 8]} />
      </mesh>
      <mesh position={[0.04, 0.5, 0.165]} material={M.bookRed}>
        <sphereGeometry args={[0.022, 8, 8]} />
      </mesh>
    </group>
  )
}

// ─── Counter ────────────────────────────────────────────────────────────────
export function Counter({ pos }: { pos: [number,number,number] }) {
  return (
    <group position={pos}>
      <Box pos={[0, 0.45, 0]} size={[1.2, 0.9, 0.5]} mat={M.oakDark} />
      <Box pos={[0, 0.91, 0]} size={[1.24, 0.04, 0.54]} mat={M.deskSurface} />
    </group>
  )
}

// ─── Potted plant (large floor) ─────────────────────────────────────────────
export function PlantLarge({ pos }: { pos: [number,number,number] }) {
  return (
    <group position={pos}>
      <Cyl pos={[0, 0.2, 0]} r={0.18} h={0.4} mat={M.pot} />
      <Cyl pos={[0, 0.55, 0]} r={0.06} h={0.5} mat={M.leafDark} />
      {[0, 90, 180, 270].map((deg, i) => {
        const a = (deg * Math.PI) / 180
        return (
          <mesh key={i}
            position={[Math.sin(a) * 0.22, 0.72, Math.cos(a) * 0.22]}
            rotation={[0.4, a, 0]}
            material={M.leafGreen}>
            <sphereGeometry args={[0.22, 8, 6]} />
          </mesh>
        )
      })}
      <mesh position={[0, 0.95, 0]} material={M.leafGreen}>
        <sphereGeometry args={[0.28, 10, 7]} />
      </mesh>
    </group>
  )
}

// ─── Hanging vines ──────────────────────────────────────────────────────────
export function HangingVine({ pos }: { pos: [number,number,number] }) {
  return (
    <group position={pos}>
      {[0, 0.15, -0.1, 0.08, -0.05].map((xOff, i) => (
        <group key={i} position={[xOff, -i * 0.4, i * 0.05]}>
          <mesh material={M.leafDark}>
            <sphereGeometry args={[0.12 - i * 0.012, 7, 5]} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── Lamp ───────────────────────────────────────────────────────────────────
export function DeskLamp({ pos }: { pos: [number,number,number] }) {
  return (
    <group position={pos}>
      <Cyl pos={[0, 0.06, 0]} r={0.05} h={0.12} mat={M.coffeeMetal} />
      <Box pos={[0.07, 0.2, 0]} size={[0.18, 0.04, 0.04]} rot={[0, 0, -0.3]} mat={M.coffeeMetal} />
      <mesh position={[0.18, 0.3, 0]} material={M.ceramic}>
        <coneGeometry args={[0.1, 0.12, 10]} />
      </mesh>
      <pointLight color="#ffcc44" intensity={0.6} position={[0.18, 0.28, 0]} distance={2} decay={2} />
    </group>
  )
}
