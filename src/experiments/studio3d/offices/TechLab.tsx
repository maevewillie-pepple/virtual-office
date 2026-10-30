import React from 'react'
import { B, RB, WorkDeskDark, WorkChair, LoungeSofa, CoffeeTable, DeskLamp, ServerRack, Whiteboard } from '../shared/SharedFurniture'
import type { OfficeConfig, OfficeSceneProps } from '../shared/types'

// ─── Config ──────────────────────────────────────────────────────────────────

export const techLabConfig: OfficeConfig = {
  id: 'techlab',
  name: 'Tech Lab',
  tagline: 'Dark slate, teal glow & data streams',
  emoji: '💻',
  bgColor: '#0a1020',
  fogNear: 16,
  fogFar: 40,
  spawnPosition: [-3, 0.1, 3],
  cameraTarget: [0, 2, -1],
  cameraZoom: 52,
  desks: [
    { id: 'lab-d1', position: [-5, 0.68, -3], rotation: 0 },
    { id: 'lab-d2', position: [-3, 0.68, -3], rotation: 0 },
    { id: 'lab-d3', position: [-1, 0.68, -3], rotation: 0 },
    { id: 'lab-d4', position: [1, 0.68, -3], rotation: 0 },
    { id: 'lab-d5', position: [-5, 0.68, 0.5], rotation: 0 },
    { id: 'lab-d6', position: [-3, 0.68, 0.5], rotation: 0 },
    { id: 'lab-d7', position: [-1, 0.68, 0.5], rotation: 0 },
    { id: 'lab-d8', position: [1, 0.68, 0.5], rotation: 0 },
  ],
  walkableBounds: [
    { xMin: -9, xMax: 9, zMin: -7, zMax: 5.5, y: 0.1 },
  ],
  lighting: {
    ambientColor: '#0a1828',
    ambientIntensity: 0.4,
    sunColor: '#6080a0',
    sunIntensity: 1.2,
    sunPosition: [-8, 16, 5],
    shadowMapSize: 1024,
    fillColor: '#002040',
    fillIntensity: 0.3,
    hemiSkyColor: '#102030',
    hemiGroundColor: '#050810',
    hemiIntensity: 0.3,
    pointLights: [
      { color: '#00aaff', intensity: 2.0, position: [8, 3, -3], distance: 8 },
      { color: '#8844ff', intensity: 1.5, position: [8, 3, 2], distance: 6 },
      { color: '#00ffaa', intensity: 0.8, position: [-8, 3, 0], distance: 6 },
      { color: '#4488ff', intensity: 1.0, position: [0, 4, -6], distance: 9 },
    ],
  },
}

// ─── Server Wall ──────────────────────────────────────────────────────────────

function ServerWall() {
  return (
    <group>
      {/* Raised floor platform for server zone */}
      <B p={[7.5, 0.12, -1]} s={[3.5, 0.22, 10]} c="#1a1e28" roughness={0.3} metalness={0.2} />
      {/* Server racks */}
      <ServerRack position={[6.5, 0.34, -4]} />
      <ServerRack position={[8.0, 0.34, -4]} />
      <ServerRack position={[6.5, 0.34, -1.5]} />
      <ServerRack position={[8.0, 0.34, -1.5]} />
      <ServerRack position={[6.5, 0.34, 1]} />
      <ServerRack position={[8.0, 0.34, 1]} />
      {/* Server zone ambient glow */}
      <pointLight color="#00aaff" intensity={2.5} position={[7.5, 2, -2]} distance={6} decay={2} />
      <pointLight color="#8844ff" intensity={1.5} position={[7.5, 2, 2]} distance={5} decay={2} />
      {/* Cable management strip */}
      <B p={[5.4, 1, -1]} s={[0.08, 2, 10]} c="#1a1e28" roughness={0.4} metalness={0.3} />
      {/* Cable bundle suggestions */}
      {[-4, -2, 0, 2].map((z, i) => (
        <mesh key={i} position={[5.5, 0.9 + (i % 2) * 0.15, z]}>
          <torusGeometry args={[0.04, 0.025, 6, 10, Math.PI * 1.5]} />
          <meshStandardMaterial color="#333" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ─── LED Strip Lights ─────────────────────────────────────────────────────────

function LEDStrips() {
  return (
    <group>
      {/* Desk cluster strip lights */}
      <mesh position={[-3, 0.76, -3]}>
        <boxGeometry args={[6, 0.02, 0.04]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-3, 0.76, 0.5]}>
        <boxGeometry args={[6, 0.02, 0.04]} />
        <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={2} />
      </mesh>
      {/* Ceiling strip */}
      <mesh position={[0, 6.35, -3]}>
        <boxGeometry args={[10, 0.04, 0.06]} />
        <meshStandardMaterial color="#4488ff" emissive="#2266ff" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[0, 6.35, 0.5]}>
        <boxGeometry args={[10, 0.04, 0.06]} />
        <meshStandardMaterial color="#4488ff" emissive="#2266ff" emissiveIntensity={1.2} />
      </mesh>
      {/* Floor accent glow */}
      <mesh position={[-3, 0.14, -1.5]}>
        <boxGeometry args={[6.5, 0.02, 3.5]} />
        <meshStandardMaterial color="#00aaff" emissive="#004488" emissiveIntensity={0.8} transparent opacity={0.3} />
      </mesh>
    </group>
  )
}

// ─── Architecture ─────────────────────────────────────────────────────────────

function TechLabArchitecture() {
  return (
    <group>
      {/* Dark slate floor */}
      <B p={[0, 0, 0]} s={[20, 0.2, 14]} c="#1a1e2a" roughness={0.2} metalness={0.15} receive={true} cast={false} />
      {/* Floor grid lines */}
      {Array.from({ length: 10 }).map((_, i) => (
        <B key={`fx${i}`} p={[-9 + i * 2, 0.101, 0]} s={[0.04, 0.003, 14]} c="#004466" roughness={0.9} cast={false} receive={false} />
      ))}
      {Array.from({ length: 7 }).map((_, i) => (
        <B key={`fz${i}`} p={[0, 0.101, -6 + i * 2]} s={[20, 0.003, 0.04]} c="#004466" roughness={0.9} cast={false} receive={false} />
      ))}

      {/* Dark walls */}
      <B p={[0, 4.5, -6.9]} s={[20, 9, 0.2]} c="#0e1220" roughness={0.35} metalness={0.1} cast={false} />
      <B p={[-9.9, 4.5, 0]} s={[0.2, 9, 14]} c="#0e1220" roughness={0.35} metalness={0.1} cast={false} />
      <B p={[9.9, 4.5, 0]} s={[0.2, 9, 14]} c="#0e1220" roughness={0.35} metalness={0.1} cast={false} />
      <B p={[0, 1.0, 6.9]} s={[20, 2.2, 0.2]} c="#0e1220" roughness={0.35} cast={false} />
      {/* Ceiling */}
      <B p={[0, 6.4, 0]} s={[20, 0.2, 14]} c="#080c14" roughness={0.4} cast={false} receive={false} />

      {/* Narrow slitted windows on left wall */}
      {[-4, -1, 2].map((z, i) => (
        <group key={i}>
          <mesh position={[-9.82, 3.5, z]}>
            <planeGeometry args={[0.6, 2.0]} />
            <meshStandardMaterial color="#88aacc" transparent opacity={0.4} roughness={0.05} />
          </mesh>
          <B p={[-9.82, 3.5, z]} s={[0.04, 2.1, 0.65]} c="#333" roughness={0.4} metalness={0.5} cast={false} />
        </group>
      ))}

      {/* Wall data visualization panel (back wall) */}
      <B p={[-4, 3.5, -6.82]} s={[5, 2.5, 0.06]} c="#0a1428" roughness={0.2} cast={false} />
      <mesh position={[-4, 3.5, -6.79]}>
        <planeGeometry args={[4.8, 2.3]} />
        <meshStandardMaterial color="#001428" emissive="#002244" emissiveIntensity={0.8} roughness={0.05} />
      </mesh>
      {/* Data display lines */}
      {Array.from({ length: 6 }).map((_, i) => (
        <mesh key={i} position={[-5.8 + (i % 3) * 1.9, 3.5 - 0.4 + Math.floor(i / 3) * 1.0, -6.78]}>
          <boxGeometry args={[1.4, 0.04, 0.01]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#00aaff' : '#8844ff'} emissive={i % 2 === 0 ? '#00aaff' : '#8844ff'} emissiveIntensity={1.5} />
        </mesh>
      ))}

      {/* Whiteboard */}
      <Whiteboard position={[3, 3, -6.8]} width={4.5} color="#1a2a3a" />

      {/* Server wall partition */}
      <B p={[5.2, 3.5, -1]} s={[0.12, 7, 10]} c="#141822" roughness={0.3} metalness={0.3} />

      {/* LED strips */}
      <LEDStrips />

      {/* Server zone */}
      <ServerWall />
    </group>
  )
}

// ─── Exported scene ───────────────────────────────────────────────────────────

export default function TechLab({ claimedDesks, onDeskClaim, onFloorClick }: OfficeSceneProps) {
  return (
    <group>
      <TechLabArchitecture />

      {/* Desks in two rows */}
      {techLabConfig.desks.map(d => {
        const approachZ = d.position[2] + 0.9
        return (
          <group key={d.id} onClick={(e) => { e.stopPropagation(); onDeskClaim(d.id) }}>
            <WorkDeskDark position={d.position} rotation={d.rotation} />
            <WorkChair
              position={[d.position[0], d.position[1] - 0.68, approachZ]}
              rotation={d.rotation}
              seatColor="#1a2a4a"
            />
            <DeskLamp position={[d.position[0], d.position[1] + 0.26, d.position[2]]} lightColor="#80ccff" />
            {claimedDesks[d.id] && (
              <mesh position={[d.position[0], d.position[1] + 0.55, d.position[2]]}>
                <sphereGeometry args={[0.08, 8, 6]} />
                <meshStandardMaterial color="#00aaff" emissive="#0066cc" emissiveIntensity={2} />
              </mesh>
            )}
          </group>
        )
      })}

      {/* Lounge area */}
      <B p={[-7, 0.11, 3.5]} s={[4, 0.02, 3.5]} c="#1a2438" roughness={0.9} cast={false} />
      <LoungeSofa position={[-7.5, 0.1, 4.5]} rotation={Math.PI} color="#1a2a3a" />
      <CoffeeTable position={[-7, 0.1, 3.3]} color="#2a3a4a" />

      {/* Accent plants (minimal) */}
      <mesh position={[-8.5, 0.6, 5.5]} castShadow>
        <cylinderGeometry args={[0.15, 0.12, 0.6, 10]} />
        <meshStandardMaterial color="#1a1e2a" roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[-8.5, 1.1, 5.5]} castShadow>
        <sphereGeometry args={[0.2, 8, 6]} />
        <meshStandardMaterial color="#1a3a20" roughness={0.9} />
      </mesh>

      {/* Floor click plane */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.12, 0]}
        onClick={(e) => { e.stopPropagation(); onFloorClick(e.point.x, e.point.z, 0) }}
      >
        <planeGeometry args={[20, 14]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  )
}
