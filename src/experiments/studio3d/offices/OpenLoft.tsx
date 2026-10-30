import React from 'react'
import { B, RB, WorkDesk, WorkChair, LoungeSofa, CoffeeTable, BookshelfUnit, DeskLamp, PlantLarge, PlantMedium, HangingPlant, IndustrialWindow, Whiteboard, Rug } from '../shared/SharedFurniture'
import type { OfficeConfig, OfficeSceneProps } from '../shared/types'

// ─── Config ──────────────────────────────────────────────────────────────────

export const loftConfig: OfficeConfig = {
  id: 'loft',
  name: 'Open Loft',
  tagline: 'Industrial warehouse, bright & open',
  emoji: '🏭',
  bgColor: '#d8d0c8',
  fogNear: 24,
  fogFar: 55,
  spawnPosition: [-4, 0.1, 3],
  cameraTarget: [0, 2.5, -1],
  cameraZoom: 48,
  desks: [
    { id: 'loft-d1', position: [-6, 0.68, -2], rotation: 0 },
    { id: 'loft-d2', position: [-4, 0.68, -2], rotation: 0 },
    { id: 'loft-d3', position: [-2, 0.68, -2], rotation: 0 },
    { id: 'loft-d4', position: [0, 0.68, -2], rotation: 0 },
    { id: 'loft-d5', position: [2, 0.68, -2], rotation: 0 },
    { id: 'loft-d6', position: [2, 0.68, 1.5], rotation: Math.PI },
    { id: 'loft-d7', position: [5, 0.68, 1.5], rotation: Math.PI },
    { id: 'loft-d8', position: [8, 0.68, 1.5], rotation: Math.PI },
  ],
  walkableBounds: [
    { xMin: -11, xMax: 11, zMin: -7.5, zMax: 6, y: 0.1 },
  ],
  lighting: {
    ambientColor: '#e8e0d8',
    ambientIntensity: 0.7,
    sunColor: '#fff8f0',
    sunIntensity: 3.8,
    sunPosition: [-8, 22, 10],
    shadowMapSize: 2048,
    fillColor: '#d8e0e8',
    fillIntensity: 0.8,
    hemiSkyColor: '#e0e8f0',
    hemiGroundColor: '#b8b0a8',
    hemiIntensity: 0.5,
    pointLights: [
      { color: '#fff0e0', intensity: 0.8, position: [-5, 6, 0], distance: 10 },
      { color: '#fff0e0', intensity: 0.8, position: [5, 6, 0], distance: 10 },
    ],
  },
}

// ─── Exposed Beams ────────────────────────────────────────────────────────────

function ExposedBeams() {
  const beamZ = [-6, -3, 0, 3, 6]
  return (
    <group>
      {beamZ.map((z, i) => (
        <group key={i}>
          {/* Main horizontal beam */}
          <B p={[0, 7.6, z]} s={[24, 0.28, 0.28]} c="#6a5040" roughness={0.7} />
          {/* Supporting brace L */}
          <B p={[-9.5, 7.0, z]} s={[0.28, 1.4, 0.24]} c="#6a5040" roughness={0.7} />
          {/* Supporting brace R */}
          <B p={[9.5, 7.0, z]} s={[0.28, 1.4, 0.24]} c="#6a5040" roughness={0.7} />
        </group>
      ))}
      {/* Longitudinal beams */}
      <B p={[0, 7.74, 0]} s={[0.2, 0.2, 16]} c="#5a4030" roughness={0.75} />
      <B p={[-5, 7.74, 0]} s={[0.2, 0.2, 16]} c="#5a4030" roughness={0.75} />
      <B p={[5, 7.74, 0]} s={[0.2, 0.2, 16]} c="#5a4030" roughness={0.75} />
    </group>
  )
}

// ─── Inspiration Wall ─────────────────────────────────────────────────────────

function InspirationWall() {
  const COLOR_CARDS = ['#e05050', '#50a0e0', '#50c070', '#e09020', '#c050c0', '#d0c040']
  return (
    <group position={[0, 3, -11.8]}>
      {/* Base board */}
      <B p={[0, 0, 0]} s={[10, 3.6, 0.04]} c="#e8e0d8" roughness={0.5} cast={false} />
      {/* Pin board */}
      <B p={[0, 0, 0.02]} s={[9.6, 3.2, 0.03]} c="#c8b898" roughness={0.9} cast={false} />
      {/* Sticky notes / cards */}
      {Array.from({ length: 15 }).map((_, i) => {
        const cx = -4 + (i % 6) * 1.4 + (Math.sin(i * 7.3) * 0.3)
        const cy = -1.2 + Math.floor(i / 6) * 1.3 + (Math.cos(i * 3.7) * 0.2)
        const col = COLOR_CARDS[i % COLOR_CARDS.length]
        return (
          <B key={i} p={[cx, cy, 0.04]} s={[0.55, 0.55, 0.015]} c={col} roughness={0.6} cast={false} />
        )
      })}
      {/* String lines */}
      <B p={[0, 0.4, 0.06]} s={[9, 0.01, 0.01]} c="#888" roughness={0.5} cast={false} />
      <B p={[0, -0.6, 0.06]} s={[9, 0.01, 0.01]} c="#888" roughness={0.5} cast={false} />
    </group>
  )
}

// ─── Architecture ─────────────────────────────────────────────────────────────

function LoftArchitecture() {
  return (
    <group>
      {/* Concrete floor with polish effect */}
      <B p={[0, 0, 0]} s={[24, 0.2, 16]} c="#c8c0b8" roughness={0.3} metalness={0.08} receive={true} cast={false} />
      {/* Expansion joints */}
      {[-8, -4, 0, 4, 8].map((x, i) => (
        <B key={`jx${i}`} p={[x, 0.101, 0]} s={[0.04, 0.003, 16]} c="#a8a098" cast={false} receive={false} />
      ))}
      {[-6, -2, 2, 6].map((z, i) => (
        <B key={`jz${i}`} p={[0, 0.101, z]} s={[24, 0.003, 0.04]} c="#a8a098" cast={false} receive={false} />
      ))}

      {/* Back wall — exposed brick section */}
      <B p={[0, 4.5, -7.9]} s={[24, 9, 0.2]} c="#b09080" roughness={0.9} cast={false} />
      {/* Brick texture suggestion - horizontal mortar lines */}
      {Array.from({ length: 12 }).map((_, i) => (
        <B key={`bk${i}`} p={[0, 0.3 + i * 0.75, -7.84]} s={[24, 0.04, 0.04]} c="#8a6858" roughness={0.95} cast={false} receive={false} />
      ))}

      {/* Left wall — whitewashed */}
      <B p={[-11.9, 4.5, 0]} s={[0.2, 9, 16]} c="#e8e4e0" roughness={0.55} cast={false} />
      {/* Right wall */}
      <B p={[11.9, 4.5, 0]} s={[0.2, 9, 16]} c="#e8e4e0" roughness={0.55} cast={false} />
      {/* Front wall (low) */}
      <B p={[0, 0.9, 7.9]} s={[24, 2.0, 0.2]} c="#e8e4e0" roughness={0.55} cast={false} />
      {/* Ceiling — whiteboard/concrete */}
      <B p={[0, 8.9, 0]} s={[24, 0.2, 16]} c="#e0dcd8" roughness={0.6} cast={false} receive={false} />

      {/* Large industrial windows on left wall */}
      <IndustrialWindow position={[-11.82, 1.5, -4]} rotation={-Math.PI / 2} width={3.5} height={5.5} />
      <IndustrialWindow position={[-11.82, 1.5, 2]} rotation={-Math.PI / 2} width={3.5} height={5.5} />

      {/* Back wall windows */}
      <IndustrialWindow position={[-5, 2, -7.82]} width={4} height={5} />
      <IndustrialWindow position={[5, 2, -7.82]} width={4} height={5} />

      {/* Exposed beams */}
      <ExposedBeams />

      {/* Inspiration wall */}
      <InspirationWall />

      {/* Whiteboard near desks */}
      <Whiteboard position={[-9, 2.2, -7.75]} width={3.0} />

      {/* Steel pillar columns */}
      {([ [-10.5, 0], [10.5, 0], [-10.5, -5], [10.5, -5] ] as [number,number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 4.5, z]} castShadow>
          <boxGeometry args={[0.3, 9, 0.3]} />
          <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Exported scene ───────────────────────────────────────────────────────────

export default function OpenLoft({ claimedDesks, onDeskClaim, onFloorClick }: OfficeSceneProps) {
  return (
    <group>
      <LoftArchitecture />

      {/* Row of desks */}
      {loftConfig.desks.map(d => (
        <group key={d.id} onClick={(e) => { e.stopPropagation(); onDeskClaim(d.id) }}>
          <WorkDesk position={d.position} rotation={d.rotation} surfaceColor="#d8d0c0" legColor="#888" screenGlow="#2a5a8a" />
          <WorkChair
            position={[d.position[0], d.position[1] - 0.68, d.position[2] + (d.rotation === Math.PI ? -0.9 : 0.9)]}
            rotation={d.rotation}
            seatColor="#708090"
          />
          <DeskLamp position={[d.position[0] + 0.3, d.position[1] + 0.26, d.position[2]]} lightColor="#fff8e8" />
          {claimedDesks[d.id] && (
            <mesh position={[d.position[0], d.position[1] + 0.55, d.position[2]]}>
              <sphereGeometry args={[0.08, 8, 6]} />
              <meshStandardMaterial color="#44cc44" emissive="#22aa22" emissiveIntensity={1} />
            </mesh>
          )}
        </group>
      ))}

      {/* Lounge zone — left corner */}
      <Rug position={[-9, 0.11, 4.5]} size={[3.5, 3]} color="#8090a0" />
      <LoungeSofa position={[-9.5, 0.1, 5.2]} rotation={Math.PI} color="#607080" />
      <CoffeeTable position={[-9, 0.1, 4.0]} color="#c0b8a8" />

      {/* Plants scattered */}
      <PlantLarge position={[-10.5, 0.1, -0.5]} leafColor="#4a8a38" />
      <PlantLarge position={[10.5, 0.1, -0.5]} leafColor="#4a8a38" />
      <PlantMedium position={[-10.5, 0.1, 5.5]} leafColor="#3a7a28" />
      <PlantMedium position={[9, 0.1, -6]} leafColor="#3a7a28" />
      <HangingPlant position={[-2, 7.8, -5.5]} leafColor="#4a8a38" />
      <HangingPlant position={[2, 7.8, -5.5]} leafColor="#4a8a38" />
      <HangingPlant position={[6, 7.8, 1]} leafColor="#3a7a28" />

      {/* Bookshelf area */}
      <BookshelfUnit position={[10.5, 0.1, 3]} rotation={-Math.PI / 2} />
      <BookshelfUnit position={[10.5, 0.1, 1]} rotation={-Math.PI / 2} />

      {/* Floor click plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.12, 0]}
        onClick={(e) => { e.stopPropagation(); onFloorClick(e.point.x, e.point.z, 0) }}
      >
        <planeGeometry args={[24, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}
