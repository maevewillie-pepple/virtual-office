import React from 'react'
import { B, RB, WorkDesk, WorkChair, ArmChair, CoffeeTable, TallBookshelf, BookshelfUnit, DeskLamp, PlantMedium, HangingPlant, ArchedWindow, Fireplace, Rug } from '../shared/SharedFurniture'
import type { OfficeConfig, OfficeSceneProps } from '../shared/types'

// ─── Config ──────────────────────────────────────────────────────────────────

export const libraryConfig: OfficeConfig = {
  id: 'library',
  name: 'Cozy Library',
  tagline: 'Dark walnut, amber light & leather',
  emoji: '📚',
  bgColor: '#1e120a',
  fogNear: 16,
  fogFar: 38,
  spawnPosition: [-2, 0.1, 3],
  cameraTarget: [0, 2.5, -0.5],
  cameraZoom: 50,
  desks: [
    { id: 'lib-desk-1', position: [-4.0, 0.68, -1.5], rotation: Math.PI / 2 },
    { id: 'lib-desk-2', position: [-4.0, 0.68, 1.5], rotation: Math.PI / 2 },
    { id: 'lib-desk-3', position: [4.0, 0.68, -1.5], rotation: -Math.PI / 2 },
    { id: 'lib-desk-4', position: [4.0, 0.68, 1.5], rotation: -Math.PI / 2 },
    { id: 'lib-desk-5', position: [-3.5, 3.28, -3.5], rotation: 0 },
    { id: 'lib-desk-6', position: [-1.0, 3.28, -3.5], rotation: 0 },
    { id: 'lib-desk-7', position: [1.5, 3.28, -3.5], rotation: 0 },
    { id: 'lib-desk-8', position: [4.0, 3.28, -3.5], rotation: 0 },
  ],
  walkableBounds: [
    { xMin: -7.5, xMax: 7.5, zMin: -5.5, zMax: 5.5, y: 0.1 },
    { xMin: -7, xMax: 7, zMin: -7, zMax: 4.5, y: 3.2 },
  ],
  lighting: {
    ambientColor: '#6a3810',
    ambientIntensity: 0.45,
    sunColor: '#ffaa44',
    sunIntensity: 1.5,
    sunPosition: [-6, 12, 4],
    shadowMapSize: 1024,
    fillColor: '#ff8822',
    fillIntensity: 0.3,
    hemiSkyColor: '#3a1808',
    hemiGroundColor: '#1a0a04',
    hemiIntensity: 0.3,
    pointLights: [
      { color: '#ff8822', intensity: 2.5, position: [-7, 2.5, 0], distance: 6 },
      { color: '#ffaa44', intensity: 1.5, position: [0, 4, -1], distance: 8 },
      { color: '#ffcc66', intensity: 1.0, position: [0, 1.8, 0], distance: 5 },
    ],
  },
}

// ─── Upper Gallery ────────────────────────────────────────────────────────────

function Gallery() {
  return (
    <group>
      {/* Gallery floor – full ring except where stairs are */}
      <B p={[0, 3.1, -4.5]} s={[16.2, 0.18, 2.2]} c="#3a2010" roughness={0.4} receive={true} />
      <B p={[-6.8, 3.1, -1]} s={[2.6, 0.18, 7.2]} c="#3a2010" roughness={0.4} receive={true} />
      <B p={[6.8, 3.1, -1]} s={[2.6, 0.18, 7.2]} c="#3a2010" roughness={0.4} receive={true} />
      <B p={[0, 3.1, 4.5]} s={[16.2, 0.18, 1.6]} c="#3a2010" roughness={0.4} receive={true} />

      {/* Front railing (lower gallery edge) */}
      {[-6, -4, -2, 0, 2, 4, 6].map((x, i) => (
        <B key={`rp${i}`} p={[x, 3.55, -3.4]} s={[0.06, 0.9, 0.06]} c="#6a4820" roughness={0.4} />
      ))}
      <B p={[0, 3.98, -3.4]} s={[14, 0.05, 0.05]} c="#6a4820" roughness={0.3} metalness={0.2} />

      {/* Stairs on right side */}
      {Array.from({ length: 8 }).map((_, i) => (
        <B key={`st${i}`} p={[6.2, i * 0.4 + 0.2, -3.4 + i * 0.3]} s={[1.4, 0.4, 0.5]} c="#4a2e18" roughness={0.5} />
      ))}
    </group>
  )
}

// ─── Architecture ─────────────────────────────────────────────────────────────

function LibraryArchitecture() {
  const wallColor = '#2a1a0c'
  const floorColor = '#3a2010'
  const ceilColor = '#1a0e06'

  return (
    <group>
      {/* Dark walnut floor */}
      <B p={[0, 0, 0]} s={[18, 0.2, 14]} c={floorColor} roughness={0.35} receive={true} cast={false} />
      {/* Floor boards */}
      {Array.from({ length: 7 }).map((_, i) => (
        <B key={i} p={[0, 0.102, -6 + i * 2]} s={[18, 0.003, 0.04]} c="#2a1408" roughness={0.9} cast={false} receive={false} />
      ))}

      {/* Back wall */}
      <B p={[0, 4.5, -6.9]} s={[18, 9, 0.2]} c={wallColor} cast={false} />
      {/* Left wall */}
      <B p={[-8.9, 4.5, 0]} s={[0.2, 9, 14]} c={wallColor} cast={false} />
      {/* Right wall */}
      <B p={[8.9, 4.5, 0]} s={[0.2, 9, 14]} c={wallColor} cast={false} />
      {/* Front wall (low) */}
      <B p={[0, 0.8, 6.9]} s={[18, 1.8, 0.2]} c={wallColor} cast={false} />
      {/* Ceiling */}
      <B p={[0, 8.9, 0]} s={[18, 0.2, 14]} c={ceilColor} cast={false} receive={false} />

      {/* Decorative wood paneling strips */}
      {Array.from({ length: 4 }).map((_, i) => (
        <B key={`pa${i}`} p={[-8.82, 1.2 + i * 1.8, 0]} s={[0.06, 0.08, 14]} c="#5a3820" roughness={0.3} cast={false} />
      ))}
      {Array.from({ length: 4 }).map((_, i) => (
        <B key={`pb${i}`} p={[8.82, 1.2 + i * 1.8, 0]} s={[0.06, 0.08, 14]} c="#5a3820" roughness={0.3} cast={false} />
      ))}

      {/* Arched windows on back wall */}
      <ArchedWindow position={[-4.5, 0.5, -6.82]} width={1.3} height={3.2} />
      <ArchedWindow position={[0, 0.5, -6.82]} width={1.3} height={3.2} />
      <ArchedWindow position={[4.5, 0.5, -6.82]} width={1.3} height={3.2} />

      {/* Fireplace on left wall */}
      <Fireplace position={[-8.72, 0, 2]} rotation={-Math.PI / 2} />

      {/* Gallery */}
      <Gallery />

      {/* Ceiling coffers */}
      {[[-3, 0], [3, 0], [0, -2.5], [0, 2.5]].map(([x, z], i) => (
        <B key={`cf${i}`} p={[x, 8.75, z]} s={[5, 0.06, 4]} c="#120a04" roughness={0.8} cast={false} receive={false} />
      ))}
      {/* Pendant light */}
      <mesh position={[0, 8.4, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 0.22, 12, 1, true]} />
        <meshStandardMaterial color="#8a6040" roughness={0.4} side={2} />
      </mesh>
      <mesh position={[0, 8.28, 0]}>
        <sphereGeometry args={[0.12, 12, 8]} />
        <meshStandardMaterial color="#ffee88" emissive="#ffdd44" emissiveIntensity={2} />
      </mesh>
    </group>
  )
}

// ─── Reading Central Table ────────────────────────────────────────────────────

function ReadingTable() {
  return (
    <group position={[0, 0, 0.5]}>
      <RB p={[0, 0.74, 0]} s={[3.5, 0.08, 1.2]} r={0.03} c="#4a2e18" roughness={0.25} />
      {([ [-1.5, 0.38, -0.45], [1.5, 0.38, -0.45], [-1.5, 0.38, 0.45], [1.5, 0.38, 0.45] ] as [number,number,number][]).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <boxGeometry args={[0.08, 0.76, 0.08]} />
          <meshStandardMaterial color="#3a2010" roughness={0.4} />
        </mesh>
      ))}
      {/* Green banker lamp on table */}
      <mesh position={[0, 0.84, 0]} castShadow>
        <cylinderGeometry args={[0.025, 0.025, 0.3, 8]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.98, 0]}>
        <cylinderGeometry args={[0.04, 0.1, 0.12, 12, 1, true]} />
        <meshStandardMaterial color="#2a6a2a" roughness={0.4} side={2} />
      </mesh>
      <pointLight color="#ffee88" intensity={0.8} position={[0, 0.92, 0]} distance={2.5} decay={2} />
    </group>
  )
}

// ─── Exported scene ───────────────────────────────────────────────────────────

export default function CozyLibrary({ claimedDesks, onDeskClaim, onFloorClick }: OfficeSceneProps) {
  return (
    <group>
      <LibraryArchitecture />

      {/* All-wall bookshelves — left */}
      <TallBookshelf position={[-8.6, 0.1, -5]} rotation={Math.PI / 2} />
      <TallBookshelf position={[-8.6, 0.1, -1.5]} rotation={Math.PI / 2} />
      <TallBookshelf position={[-8.6, 0.1, 2]} rotation={Math.PI / 2} />
      {/* Back wall bookshelves */}
      <TallBookshelf position={[-6.5, 0.1, -6.7]} rotation={0} />
      <TallBookshelf position={[-2.5, 0.1, -6.7]} rotation={0} />
      <TallBookshelf position={[2.5, 0.1, -6.7]} rotation={0} />
      <TallBookshelf position={[6.5, 0.1, -6.7]} rotation={0} />
      {/* Right wall bookshelves */}
      <TallBookshelf position={[8.6, 0.1, -5]} rotation={-Math.PI / 2} />
      <TallBookshelf position={[8.6, 0.1, -1.5]} rotation={-Math.PI / 2} />
      <TallBookshelf position={[8.6, 0.1, 2]} rotation={-Math.PI / 2} />

      {/* Gallery bookshelves */}
      <BookshelfUnit position={[-7, 3.28, -6.5]} rotation={0} />
      <BookshelfUnit position={[-5, 3.28, -6.5]} rotation={0} />
      <BookshelfUnit position={[5, 3.28, -6.5]} rotation={0} />
      <BookshelfUnit position={[7, 3.28, -6.5]} rotation={0} />

      {/* Reading central table */}
      <ReadingTable />

      {/* Velvet armchairs around reading table */}
      <ArmChair position={[-1.0, 0.1, -0.6]} rotation={0} color="#4a3060" />
      <ArmChair position={[1.0, 0.1, -0.6]} rotation={0} color="#4a3060" />
      <ArmChair position={[-1.0, 0.1, 1.6]} rotation={Math.PI} color="#5a4a30" />
      <ArmChair position={[1.0, 0.1, 1.6]} rotation={Math.PI} color="#5a4a30" />

      {/* Desks with lamps */}
      {libraryConfig.desks.slice(0, 4).map(d => (
        <group key={d.id} onClick={(e) => { e.stopPropagation(); onDeskClaim(d.id) }}>
          <WorkDesk position={d.position} rotation={d.rotation} surfaceColor="#4a2e18" legColor="#555" />
          <WorkChair position={[d.position[0], 0.1, d.position[2]]} rotation={(d.rotation ?? 0) + Math.PI} seatColor="#3a2860" />
          <DeskLamp position={[d.position[0], d.position[1] + 0.26, d.position[2]]} lightColor="#ffdd66" />
          {claimedDesks[d.id] && (
            <mesh position={[d.position[0], d.position[1] + 0.55, d.position[2]]}>
              <sphereGeometry args={[0.08, 8, 6]} />
              <meshStandardMaterial color="#44cc44" emissive="#22aa22" emissiveIntensity={1} />
            </mesh>
          )}
        </group>
      ))}

      {/* Gallery desks */}
      {libraryConfig.desks.slice(4).map(d => (
        <group key={d.id} onClick={(e) => { e.stopPropagation(); onDeskClaim(d.id) }}>
          <WorkDesk position={d.position} rotation={d.rotation} surfaceColor="#4a2e18" legColor="#555" />
          <WorkChair position={[d.position[0], d.position[1] - 0.68, d.position[2] + 0.9]} rotation={d.rotation ?? 0} seatColor="#3a2860" />
          <DeskLamp position={[d.position[0], d.position[1] + 0.26, d.position[2]]} lightColor="#ffdd66" />
        </group>
      ))}

      {/* Rug near fireplace lounge */}
      <Rug position={[-6, 0.11, 2]} size={[3.5, 3]} color="#3a2040" />

      {/* Plants */}
      <PlantMedium position={[-7.5, 0.1, 5]} leafColor="#2a5a20" />
      <PlantMedium position={[7.5, 0.1, 5]} leafColor="#2a5a20" />
      <HangingPlant position={[0, 8.0, 2]} leafColor="#3a6a30" />

      {/* Floor click plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.12, 0]}
        onClick={(e) => { e.stopPropagation(); onFloorClick(e.point.x, e.point.z, 0) }}
      >
        <planeGeometry args={[18, 14]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>

      {/* Gallery click plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 3.22, -1]}
        onClick={(e) => { e.stopPropagation(); onFloorClick(e.point.x, e.point.z, 1) }}
      >
        <planeGeometry args={[16, 12]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}
