import React from 'react'
import { B, RB, WorkDesk, WorkChair, LoungeSofa, CoffeeTable, DeskLamp, PlantLarge, PlantMedium, HangingPlant, GlassCeilingPanel, Rug } from '../shared/SharedFurniture'
import type { OfficeConfig, OfficeSceneProps } from '../shared/types'

// ─── Config ──────────────────────────────────────────────────────────────────

export const gardenConfig: OfficeConfig = {
  id: 'garden',
  name: 'Garden Studio',
  tagline: 'Greenhouse glass & living walls',
  emoji: '🌿',
  bgColor: '#c8e8c0',
  fogNear: 18,
  fogFar: 45,
  spawnPosition: [0, 0.1, 4],
  cameraTarget: [0, 2, 0],
  cameraZoom: 50,
  desks: [
    { id: 'gdn-d1', position: [-5, 0.68, -3.5], rotation: 0 },
    { id: 'gdn-d2', position: [-3, 0.68, -3.5], rotation: 0 },
    { id: 'gdn-d3', position: [3, 0.68, -3.5], rotation: 0 },
    { id: 'gdn-d4', position: [5, 0.68, -3.5], rotation: 0 },
    { id: 'gdn-d5', position: [-5, 0.68, 3.5], rotation: Math.PI },
    { id: 'gdn-d6', position: [-3, 0.68, 3.5], rotation: Math.PI },
    { id: 'gdn-d7', position: [3, 0.68, 3.5], rotation: Math.PI },
    { id: 'gdn-d8', position: [5, 0.68, 3.5], rotation: Math.PI },
  ],
  walkableBounds: [
    { xMin: -8, xMax: 8, zMin: -6.5, zMax: 6.5, y: 0.1 },
  ],
  lighting: {
    ambientColor: '#c8e8a0',
    ambientIntensity: 0.65,
    sunColor: '#e8ffb8',
    sunIntensity: 3.2,
    sunPosition: [-5, 20, 8],
    shadowMapSize: 2048,
    fillColor: '#a0d880',
    fillIntensity: 0.6,
    hemiSkyColor: '#c0eea0',
    hemiGroundColor: '#6a9040',
    hemiIntensity: 0.5,
    pointLights: [
      { color: '#aaffaa', intensity: 0.5, position: [0, 4, 0], distance: 8 },
      { color: '#ffe8a0', intensity: 0.6, position: [-6, 2, 0], distance: 5 },
    ],
  },
}

// ─── Glass Ceiling ────────────────────────────────────────────────────────────

function GlassCeiling() {
  const panels: React.ReactNode[] = []
  const cols = 5, rows = 4
  const pw = 18 / cols, ph = 14 / rows
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      panels.push(
        <GlassCeilingPanel
          key={`cp${c}-${r}`}
          position={[-9 + c * pw + pw / 2, 6.4, -7 + r * ph + ph / 2]}
          size={[pw - 0.08, ph - 0.08]}
        />
      )
    }
  }
  return <group>{panels}</group>
}

// ─── Living Wall ──────────────────────────────────────────────────────────────

function LivingWall({ position, rotation = 0, width = 6, height = 3.5 }: { position: [number,number,number]; rotation?: number; width?: number; height?: number }) {
  const [px, py, pz] = position
  const cols = Math.round(width / 0.55)
  const rows = Math.round(height / 0.55)
  const plants: React.ReactNode[] = []
  const leafColors = ['#3a7a28', '#4a9030', '#5aaa38', '#2a6a20', '#6aba48']
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      const lc = leafColors[(c + r * 3) % leafColors.length]
      plants.push(
        <mesh key={`lp${c}-${r}`} position={[-width / 2 + c * 0.55 + 0.28, r * 0.55 + 0.28, 0.05]}>
          <sphereGeometry args={[0.22 + (c * 7 + r * 13) % 3 * 0.04, 6, 5]} />
          <meshStandardMaterial color={lc} roughness={0.9} />
        </mesh>
      )
    }
  }
  return (
    <group position={[px, py, pz]} rotation={[0, rotation, 0]}>
      <B p={[0, height / 2, 0]} s={[width, height, 0.12]} c="#5a4a28" roughness={0.8} cast={false} />
      {plants}
    </group>
  )
}

// ─── Planter Box ──────────────────────────────────────────────────────────────

function PlanterBox({ position, length = 2.0, leafColor = '#3a8030' }: { position: [number,number,number]; length?: number; leafColor?: string }) {
  const [px, py, pz] = position
  return (
    <group position={[px, py, pz]}>
      <B p={[0, 0.2, 0]} s={[length, 0.4, 0.5]} c="#7a5a38" roughness={0.7} />
      <B p={[0, 0.39, 0]} s={[length - 0.1, 0.02, 0.4]} c="#3a5a28" roughness={0.9} cast={false} />
      {Array.from({ length: Math.round(length / 0.6) }).map((_, i) => (
        <mesh key={i} position={[-length / 2 + i * 0.6 + 0.3, 0.6, 0]} castShadow>
          <sphereGeometry args={[0.22, 8, 6]} />
          <meshStandardMaterial color={leafColor} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Architecture ─────────────────────────────────────────────────────────────

function GardenArchitecture() {
  return (
    <group>
      {/* Wood deck floor - central raised */}
      <B p={[0, 0.12, 0]} s={[12, 0.22, 12]} c="#a08050" roughness={0.4} receive={true} cast={false} />
      {/* Deck boards */}
      {Array.from({ length: 6 }).map((_, i) => (
        <B key={i} p={[0, 0.23, -5 + i * 2]} s={[12, 0.005, 0.04]} c="#8a6838" roughness={0.9} cast={false} receive={false} />
      ))}
      {/* Surrounding terracotta tile floor */}
      <B p={[0, 0, 0]} s={[18, 0.2, 14]} c="#c09868" roughness={0.6} receive={true} cast={false} />
      {/* Terracotta tile grid */}
      {Array.from({ length: 9 }).map((_, i) => (
        <B key={`tx${i}`} p={[-8 + i * 2, 0.101, 0]} s={[0.04, 0.003, 14]} c="#a07848" roughness={0.95} cast={false} receive={false} />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <B key={`tz${i}`} p={[0, 0.101, -6 + i * 2]} s={[18, 0.003, 0.04]} c="#a07848" roughness={0.95} cast={false} receive={false} />
      ))}

      {/* Curved/greenhouse walls – whitewashed wood */}
      <B p={[0, 3.5, -6.9]} s={[18, 7.2, 0.18]} c="#e8f0e0" roughness={0.6} cast={false} />
      <B p={[-8.9, 3.5, 0]} s={[0.18, 7.2, 14]} c="#e8f0e0" roughness={0.6} cast={false} />
      <B p={[8.9, 3.5, 0]} s={[0.18, 7.2, 14]} c="#e8f0e0" roughness={0.6} cast={false} />
      <B p={[0, 0.9, 6.9]} s={[18, 2, 0.18]} c="#e8f0e0" roughness={0.6} cast={false} />

      {/* Wood framing strips on walls */}
      {Array.from({ length: 5 }).map((_, i) => (
        <B key={`wf${i}`} p={[-8.82, 1 + i * 1.2, 0]} s={[0.06, 0.06, 14]} c="#a0844a" roughness={0.5} cast={false} />
      ))}
      {Array.from({ length: 5 }).map((_, i) => (
        <B key={`wfr${i}`} p={[8.82, 1 + i * 1.2, 0]} s={[0.06, 0.06, 14]} c="#a0844a" roughness={0.5} cast={false} />
      ))}

      {/* Glass ceiling */}
      <GlassCeiling />
      {/* Ceiling ridge beam */}
      <B p={[0, 6.5, 0]} s={[0.25, 0.25, 14]} c="#a0844a" roughness={0.5} cast={false} />

      {/* Living walls on each wall */}
      <LivingWall position={[0, 1.5, -6.82]} width={9} height={3.5} />
      <LivingWall position={[-8.82, 1.5, -1]} rotation={Math.PI / 2} width={10} height={3.5} />
      <LivingWall position={[8.82, 1.5, -1]} rotation={-Math.PI / 2} width={10} height={3.5} />

      {/* Planters along desk rows */}
      <PlanterBox position={[-4, 0.1, -6.3]} length={2.2} leafColor="#4a9030" />
      <PlanterBox position={[4, 0.1, -6.3]} length={2.2} leafColor="#3a8028" />
      <PlanterBox position={[-4, 0.1, 6.3]} length={2.2} leafColor="#5aaa38" />
      <PlanterBox position={[4, 0.1, 6.3]} length={2.2} leafColor="#4a9030" />
    </group>
  )
}

// ─── Exported scene ───────────────────────────────────────────────────────────

export default function GardenStudio({ claimedDesks, onDeskClaim, onFloorClick }: OfficeSceneProps) {
  return (
    <group>
      <GardenArchitecture />

      {/* Desks */}
      {gardenConfig.desks.map(d => {
        const approachZ = d.rotation === Math.PI ? d.position[2] - 0.9 : d.position[2] + 0.9
        return (
          <group key={d.id} onClick={(e) => { e.stopPropagation(); onDeskClaim(d.id) }}>
            <WorkDesk position={d.position} rotation={d.rotation} surfaceColor="#c8b880" legColor="#a08050" screenGlow="#2a7a4a" />
            <WorkChair
              position={[d.position[0], d.position[1] - 0.68, approachZ]}
              rotation={d.rotation}
              seatColor="#5a8040"
            />
            <DeskLamp position={[d.position[0], d.position[1] + 0.26, d.position[2]]} lightColor="#ddffcc" />
            {claimedDesks[d.id] && (
              <mesh position={[d.position[0], d.position[1] + 0.5, d.position[2]]}>
                <sphereGeometry args={[0.08, 8, 6]} />
                <meshStandardMaterial color="#44ff44" emissive="#22cc22" emissiveIntensity={1} />
              </mesh>
            )}
          </group>
        )
      })}

      {/* Central lounge */}
      <Rug position={[0, 0.24, 0.5]} size={[4, 3]} color="#6a8848" />
      <LoungeSofa position={[0, 0.22, 1.8]} rotation={Math.PI} color="#5a7840" />
      <CoffeeTable position={[0, 0.22, 0.6]} color="#c0a060" />

      {/* Scattered plants */}
      <PlantLarge position={[-7.5, 0.1, 5.5]} leafColor="#5aaa38" />
      <PlantLarge position={[7.5, 0.1, 5.5]} leafColor="#4a9030" />
      <PlantLarge position={[-7.5, 0.1, -5.5]} leafColor="#3a8028" />
      <PlantLarge position={[7.5, 0.1, -5.5]} leafColor="#6aba48" />
      <PlantMedium position={[0, 0.1, -6.5]} leafColor="#5aaa38" />
      <PlantMedium position={[-8.5, 0.1, 0]} leafColor="#3a8028" />
      <PlantMedium position={[8.5, 0.1, 0]} leafColor="#4a9030" />

      {/* Hanging plants from ceiling */}
      <HangingPlant position={[-4, 6, -4]} leafColor="#5aaa38" />
      <HangingPlant position={[4, 6, -4]} leafColor="#4a9030" />
      <HangingPlant position={[-4, 6, 4]} leafColor="#6aba48" />
      <HangingPlant position={[4, 6, 4]} leafColor="#3a8028" />
      <HangingPlant position={[0, 6, 0]} leafColor="#5aaa38" />

      {/* Floor click plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.13, 0]}
        onClick={(e) => { e.stopPropagation(); onFloorClick(e.point.x, e.point.z, 0) }}
      >
        <planeGeometry args={[18, 14]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}
