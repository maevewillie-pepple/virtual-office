import React from 'react'
import * as THREE from 'three'
import { RoundedBox } from '@react-three/drei'
import { B, WorkDesk, WorkChair, LoungeSofa, ArmChair, CoffeeTable, BookshelfUnit, DeskLamp, PlantLarge, PlantMedium, HangingPlant, CoffeeMachine, Counter, Rug } from '../shared/SharedFurniture'
import type { OfficeConfig, OfficeSceneProps } from '../shared/types'

// ─── Config ──────────────────────────────────────────────────────────────────

export const classicConfig: OfficeConfig = {
  id: 'classic',
  name: 'Classic Office',
  tagline: 'Warm oak & afternoon light',
  emoji: '🏢',
  bgColor: '#f0e4cc',
  fogNear: 20,
  fogFar: 50,
  spawnPosition: [-3, 0.1, 3],
  cameraTarget: [0, 2, -1],
  cameraZoom: 52,
  desks: [
    { id: 'desk-l1', position: [-5.5, 0.68, -2.5], rotation: 0 },
    { id: 'desk-l2', position: [-3.0, 0.68, -2.5], rotation: 0 },
    { id: 'desk-l3', position: [-5.5, 0.68, 0.5], rotation: 0 },
    { id: 'desk-l4', position: [-3.0, 0.68, 0.5], rotation: 0 },
    { id: 'desk-m1', position: [3.5, 3.88, -4.5], rotation: 0 },
    { id: 'desk-m2', position: [5.5, 3.88, -4.5], rotation: 0 },
    { id: 'desk-m3', position: [3.5, 3.88, -2.0], rotation: 0 },
    { id: 'desk-m4', position: [5.5, 3.88, -2.0], rotation: 0 },
  ],
  walkableBounds: [
    { xMin: -9, xMax: 1.0, zMin: -6.5, zMax: 5, y: 0.1 },
    { xMin: 1.8, xMax: 9, zMin: -7, zMax: 4.5, y: 3.3 },
  ],
  lighting: {
    ambientColor: '#f5e0c0',
    ambientIntensity: 0.55,
    sunColor: '#ffbb55',
    sunIntensity: 4.0,
    sunPosition: [-10, 18, 8],
    shadowMapSize: 2048,
    fillColor: '#e8c98a',
    fillIntensity: 0.9,
    hemiSkyColor: '#fde8c8',
    hemiGroundColor: '#c8a878',
    hemiIntensity: 0.4,
    pointLights: [
      { color: '#ffaa44', intensity: 1.2, position: [5, 4.8, -3], distance: 7 },
      { color: '#ff9944', intensity: 0.8, position: [-4, 2.5, 3], distance: 5 },
    ],
  },
}

// ─── Windows (left wall) ─────────────────────────────────────────────────────

function ClassicWindows() {
  const COLS = 5, ROWS = 4
  const fw = 0.06, fh = 0.06, cw = 0.88, ch = 0.88
  const totalW = COLS * (cw + fw) + fw
  const totalH = ROWS * (ch + fh) + fh
  const cells: React.ReactNode[] = []
  const frames: React.ReactNode[] = []

  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const gx = -totalW / 2 + fw + c * (cw + fw) + cw / 2
      const gy = 0.5 + fh + r * (ch + fh) + ch / 2
      cells.push(
        <mesh key={`g${r}-${c}`} position={[gx, gy, 0]}>
          <planeGeometry args={[cw, ch]} />
          <meshStandardMaterial color="#b8d8f0" transparent opacity={0.45} roughness={0.05} />
        </mesh>
      )
    }
  }
  for (let c = 0; c <= COLS; c++) {
    const gx = -totalW / 2 + c * (cw + fw) + fw / 2
    frames.push(
      <B key={`vf${c}`} p={[gx, 0.5 + totalH / 2, 0.02]} s={[fw, totalH, 0.08]} c="#d4c8a8" roughness={0.5} cast={true} receive={false} />
    )
  }
  for (let r = 0; r <= ROWS; r++) {
    const gy = 0.5 + r * (ch + fh) + fh / 2
    frames.push(
      <B key={`hf${r}`} p={[0, gy, 0.02]} s={[totalW, fh, 0.08]} c="#d4c8a8" roughness={0.5} cast={true} receive={false} />
    )
  }

  return (
    <group position={[0, 0, -9.88]} rotation={[0, Math.PI / 2, 0]}>
      {cells}
      {frames}
    </group>
  )
}

// ─── Mezzanine ───────────────────────────────────────────────────────────────

function Mezzanine() {
  return (
    <group>
      {/* Platform */}
      <B p={[5, 3.18, -1.5]} s={[8.2, 0.2, 11]} c="#c8a06a" roughness={0.3} receive={true} cast={true} />
      {/* Fascia */}
      <B p={[1.05, 2.42, -1.5]} s={[0.14, 1.6, 11]} c="#a07840" roughness={0.4} />
      {/* Railing posts */}
      {[-6, -4, -2, 0, 2, 4].map((z, i) => (
        <B key={i} p={[1.05, 3.55, z - 1.5]} s={[0.06, 0.78, 0.06]} c="#b8a080" roughness={0.4} metalness={0.3} />
      ))}
      {/* Railing bar */}
      <B p={[1.05, 3.92, -1.5]} s={[0.05, 0.05, 11]} c="#b8a080" roughness={0.3} metalness={0.4} />
      {/* Soffit light strip */}
      <mesh position={[1.2, 3.1, -1.5]}>
        <boxGeometry args={[0.15, 0.03, 10]} />
        <meshStandardMaterial color="#fff8e8" emissive="#fff8e8" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

// ─── Staircase ───────────────────────────────────────────────────────────────

function Staircase() {
  const steps = 10
  const sw = 1.5, sd = 0.42, sh = 0.32
  return (
    <group position={[1.8, 0, -0.5]}>
      {Array.from({ length: steps }).map((_, i) => (
        <B key={i} p={[0, i * sh + sh / 2, -i * sd - sd / 2]} s={[sw, sh, sd]} c="#c8a06a" roughness={0.3} />
      ))}
      <B p={[-sw / 2 - 0.06, steps * sh / 2, -steps * sd / 2]} s={[0.12, steps * sh, steps * sd]} c="#a07840" roughness={0.5} cast={false} />
      <B p={[ sw / 2 + 0.06, steps * sh / 2, -steps * sd / 2]} s={[0.12, steps * sh, steps * sd]} c="#a07840" roughness={0.5} cast={false} />
      {/* Handrail */}
      {[-1, 1].map((side, i) => (
        <mesh key={i} position={[side * (sw / 2 + 0.22), steps * sh * 0.55, -steps * sd * 0.5]}
          rotation={[0, 0, side * -Math.atan2(steps * sh, steps * sd)]}>
          <boxGeometry args={[0.04, Math.sqrt((steps * sh) ** 2 + (steps * sd) ** 2), 0.04]} />
          <meshStandardMaterial color="#b8a080" roughness={0.3} metalness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Architecture ─────────────────────────────────────────────────────────────

function ClassicArchitecture() {
  return (
    <group>
      {/* Floor */}
      <B p={[0, 0, 0]} s={[22, 0.2, 16]} c="#c8a06a" roughness={0.25} metalness={0.05} receive={true} cast={false} />
      {/* Floor boards accent */}
      {Array.from({ length: 8 }).map((_, i) => (
        <B key={i} p={[0, 0.101, -7 + i * 2]} s={[22, 0.002, 0.03]} c="#a07840" roughness={0.9} cast={false} receive={false} />
      ))}

      {/* Back wall */}
      <B p={[0, 4.5, -7.9]} s={[22, 9, 0.2]} c="#f0e8d8" roughness={0.6} cast={false} />
      {/* Left wall */}
      <B p={[-10.9, 4.5, -1.5]} s={[0.2, 9, 13]} c="#ede5d5" roughness={0.6} cast={false} />
      {/* Right wall */}
      <B p={[10.9, 4.5, -1.5]} s={[0.2, 9, 13]} c="#ede5d5" roughness={0.6} cast={false} />
      {/* Front wall (partial, low) */}
      <B p={[0, 0.6, 7.9]} s={[22, 1.4, 0.2]} c="#f0e8d8" roughness={0.6} cast={false} />
      {/* Ceiling */}
      <B p={[0, 8.9, -1.5]} s={[22, 0.2, 13]} c="#f0e8d8" roughness={0.7} cast={false} receive={false} />

      {/* Wainscoting on left wall */}
      <B p={[-10.82, 0.6, -1.5]} s={[0.05, 1.2, 13]} c="#d8c8a0" roughness={0.4} cast={false} />

      {/* Crown moulding on back wall */}
      <B p={[0, 8.75, -7.8]} s={[22, 0.15, 0.15]} c="#e8dcc0" roughness={0.3} cast={false} />
      <B p={[-10.8, 8.75, -1.5]} s={[0.15, 0.15, 13]} c="#e8dcc0" roughness={0.3} cast={false} />

      {/* Column separating lower and mezzanine zones */}
      <B p={[1.15, 1.6, -7.8]} s={[0.28, 3.4, 0.28]} c="#a07840" roughness={0.4} />
      <B p={[1.15, 1.6,  4.8]} s={[0.28, 3.4, 0.28]} c="#a07840" roughness={0.4} />

      {/* Windows */}
      <ClassicWindows />

      {/* Mezzanine & stairs */}
      <Mezzanine />
      <Staircase />
    </group>
  )
}

// ─── Desk interaction wrapper ─────────────────────────────────────────────────

function DeskUnit({ deskId, deskConfig, claimedBy, onClaim, pos, rot }: {
  deskId: string
  deskConfig: { position: [number,number,number]; rotation?: number }
  claimedBy?: string
  onClaim: () => void
  pos: [number,number,number]
  rot: number
}) {
  const [dx, dy, dz] = pos
  const approachZ = rot === 0 ? dz + 0.9 : dz - 0.9
  return (
    <group onClick={(e) => { e.stopPropagation(); onClaim() }}>
      <WorkDesk position={pos} rotation={rot} />
      <WorkChair position={[dx, dy - 0.68, approachZ]} rotation={rot} />
      {claimedBy && (
        <>
          <mesh position={[dx, dy + 0.55, dz]}>
            <boxGeometry args={[0.4, 0.06, 0.22]} />
            <meshStandardMaterial color="#3a6a3a" />
          </mesh>
          <mesh position={[dx, dy + 0.58, dz + 0.12]}>
            <planeGeometry args={[0.36, 0.04]} />
            <meshStandardMaterial color="#88ff88" emissive="#44aa44" emissiveIntensity={0.5} />
          </mesh>
        </>
      )}
    </group>
  )
}

// ─── Exported scene ───────────────────────────────────────────────────────────

export default function ClassicOffice({ claimedDesks, onDeskClaim, onFloorClick }: OfficeSceneProps) {
  return (
    <group>
      <ClassicArchitecture />

      {/* Lower floor desks */}
      {classicConfig.desks.slice(0, 4).map(d => (
        <DeskUnit
          key={d.id}
          deskId={d.id}
          deskConfig={d}
          claimedBy={claimedDesks[d.id]}
          onClaim={() => onDeskClaim(d.id)}
          pos={d.position}
          rot={d.rotation ?? 0}
        />
      ))}

      {/* Mezzanine desks */}
      {classicConfig.desks.slice(4).map(d => (
        <DeskUnit
          key={d.id}
          deskId={d.id}
          deskConfig={d}
          claimedBy={claimedDesks[d.id]}
          onClaim={() => onDeskClaim(d.id)}
          pos={d.position}
          rot={d.rotation ?? 0}
        />
      ))}

      {/* Mezzanine desk lamps */}
      <DeskLamp position={[3.5, 3.94, -4.8]} />
      <DeskLamp position={[5.5, 3.94, -4.8]} />
      <DeskLamp position={[3.5, 3.94, -2.3]} />
      <DeskLamp position={[5.5, 3.94, -2.3]} />

      {/* Lounge area */}
      <Rug position={[-6.5, 0.11, 3.2]} size={[3.2, 2.5]} color="#8a6a50" />
      <LoungeSofa position={[-7, 0.1, 4]} rotation={Math.PI} color="#8a7a6a" />
      <ArmChair position={[-8.5, 0.1, 2.4]} rotation={Math.PI * 0.25} color="#7a6a5a" />
      <ArmChair position={[-5, 0.1, 2.4]} rotation={Math.PI * 0.75} color="#7a6a5a" />
      <CoffeeTable position={[-6.8, 0.1, 2.8]} color="#b08860" />
      <PlantLarge position={[-9.5, 0.1, 4.5]} />
      <PlantMedium position={[-4, 0.1, 4.5]} />

      {/* Coffee corner */}
      <Counter position={[-9, 0.1, -6]} rotation={Math.PI / 2} width={2.2} />
      <CoffeeMachine position={[-9.5, 0.92, -5.5]} />
      <CoffeeMachine position={[-9.5, 0.92, -6.5]} />
      <PlantMedium position={[-8, 0.1, -7]} />

      {/* Bookshelves on back wall */}
      <BookshelfUnit position={[-8.5, 0.1, -7.7]} rotation={0} />
      <BookshelfUnit position={[-6.5, 0.1, -7.7]} rotation={0} />
      <BookshelfUnit position={[-4.0, 0.1, -7.7]} rotation={0} />
      <BookshelfUnit position={[-1.5, 0.1, -7.7]} rotation={0} />

      {/* Mezzanine bookshelf */}
      <BookshelfUnit position={[8.5, 3.28, -7.7]} rotation={0} />

      {/* Hanging vines from ceiling */}
      <HangingPlant position={[-2, 8.8, -6]} />
      <HangingPlant position={[-5, 8.8, -7.5]} />
      <HangingPlant position={[0.5, 8.8, -7]} />

      {/* Atmospheric floor click plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.12, 0]}
        onClick={(e) => {
          e.stopPropagation()
          onFloorClick(e.point.x, e.point.z, 0)
        }}
      >
        <planeGeometry args={[22, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Mezzanine click plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[5, 3.3, -1.5]}
        onClick={(e) => {
          e.stopPropagation()
          onFloorClick(e.point.x, e.point.z, 1)
        }}
      >
        <planeGeometry args={[8, 11]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}
