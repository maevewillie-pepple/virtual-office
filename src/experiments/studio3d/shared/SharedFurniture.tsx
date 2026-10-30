import React from 'react'
import { RoundedBox } from '@react-three/drei'

// ─── Primitives ──────────────────────────────────────────────────────────────

interface BProps {
  p: [number, number, number]
  s: [number, number, number]
  c: string
  roughness?: number
  metalness?: number
  emissive?: string
  emissiveIntensity?: number
  cast?: boolean
  receive?: boolean
}

export function B({ p, s, c, roughness = 0.7, metalness = 0, emissive, emissiveIntensity, cast = true, receive = true }: BProps) {
  return (
    <mesh position={p} castShadow={cast} receiveShadow={receive}>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} roughness={roughness} metalness={metalness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
    </mesh>
  )
}

interface RBProps {
  p: [number, number, number]
  s: [number, number, number]
  r?: number
  c: string
  roughness?: number
  metalness?: number
  emissive?: string
  emissiveIntensity?: number
  cast?: boolean
  receive?: boolean
  rotation?: [number, number, number]
}

export function RB({ p, s, r = 0.04, c, roughness = 0.5, metalness = 0, emissive, emissiveIntensity, cast = true, receive = true, rotation }: RBProps) {
  return (
    <RoundedBox args={s} radius={r} smoothness={3} position={p} rotation={rotation} castShadow={cast} receiveShadow={receive}>
      <meshStandardMaterial color={c} roughness={roughness} metalness={metalness} emissive={emissive} emissiveIntensity={emissiveIntensity} />
    </RoundedBox>
  )
}

// ─── Work Desk ───────────────────────────────────────────────────────────────

interface DeskProps {
  position: [number, number, number]
  rotation?: number
  surfaceColor?: string
  legColor?: string
  screenGlow?: string
}

export function WorkDesk({ position, rotation = 0, surfaceColor = '#c8a06a', legColor = '#888', screenGlow = '#1a4a8a' }: DeskProps) {
  const [px, py, pz] = position
  return (
    <group position={[px, py, pz]} rotation={[0, rotation, 0]}>
      {/* Desktop */}
      <RoundedBox args={[1.5, 0.07, 0.8]} radius={0.025} smoothness={3} position={[0, 0, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={surfaceColor} roughness={0.25} metalness={0.05} />
      </RoundedBox>
      {/* Legs */}
      {([ [-0.65, -0.3, -0.3], [0.65, -0.3, -0.3], [-0.65, -0.3, 0.3], [0.65, -0.3, 0.3] ] as [number,number,number][]).map((lp, i) => (
        <mesh key={i} position={lp} castShadow>
          <boxGeometry args={[0.055, 0.6, 0.055]} />
          <meshStandardMaterial color={legColor} roughness={0.3} metalness={0.7} />
        </mesh>
      ))}
      {/* Monitor bezel */}
      <RoundedBox args={[0.65, 0.42, 0.04]} radius={0.02} smoothness={3} position={[0, 0.29, -0.31]} castShadow>
        <meshStandardMaterial color="#222" roughness={0.3} metalness={0.4} />
      </RoundedBox>
      {/* Monitor screen */}
      <mesh position={[0, 0.29, -0.29]}>
        <planeGeometry args={[0.55, 0.33]} />
        <meshStandardMaterial color={screenGlow} emissive={screenGlow} emissiveIntensity={0.35} roughness={0.05} />
      </mesh>
      {/* Monitor stand */}
      <B p={[0, 0.06, -0.31]} s={[0.06, 0.12, 0.12]} c="#333" roughness={0.4} metalness={0.6} />
      {/* Keyboard */}
      <RoundedBox args={[0.38, 0.018, 0.16]} radius={0.008} smoothness={2} position={[0, 0.044, 0.08]} castShadow>
        <meshStandardMaterial color="#e0dcd8" roughness={0.5} />
      </RoundedBox>
      {/* Mouse */}
      <RoundedBox args={[0.06, 0.022, 0.10]} radius={0.02} smoothness={3} position={[0.28, 0.044, 0.08]}>
        <meshStandardMaterial color="#ddd" roughness={0.4} />
      </RoundedBox>
      {/* Mug */}
      <mesh position={[0.5, 0.075, 0.1]} castShadow>
        <cylinderGeometry args={[0.055, 0.048, 0.1, 12]} />
        <meshStandardMaterial color="#e8c090" roughness={0.6} />
      </mesh>
    </group>
  )
}

// ─── Work Desk (Dark / Tech variant) ─────────────────────────────────────────

export function WorkDeskDark({ position, rotation = 0 }: { position: [number,number,number]; rotation?: number }) {
  return <WorkDesk position={position} rotation={rotation} surfaceColor="#2a3040" legColor="#444" screenGlow="#00aadd" />
}

// ─── Office Chair ────────────────────────────────────────────────────────────

interface ChairProps {
  position: [number, number, number]
  rotation?: number
  seatColor?: string
}

export function WorkChair({ position, rotation = 0, seatColor = '#4a6080' }: ChairProps) {
  const [px, py, pz] = position
  return (
    <group position={[px, py, pz]} rotation={[0, rotation, 0]}>
      {/* Seat cushion */}
      <RoundedBox args={[0.48, 0.1, 0.48]} radius={0.06} smoothness={4} position={[0, 0.45, 0]} castShadow>
        <meshStandardMaterial color={seatColor} roughness={0.8} />
      </RoundedBox>
      {/* Back rest */}
      <RoundedBox args={[0.44, 0.52, 0.08]} radius={0.05} smoothness={4} position={[0, 0.75, -0.2]} castShadow>
        <meshStandardMaterial color={seatColor} roughness={0.8} />
      </RoundedBox>
      {/* Arm rests */}
      <B p={[-0.26, 0.59, 0]} s={[0.05, 0.06, 0.4]} c="#333" roughness={0.6} />
      <B p={[0.26, 0.59, 0]} s={[0.05, 0.06, 0.4]} c="#333" roughness={0.6} />
      {/* Gas cylinder */}
      <mesh position={[0, 0.2, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 0.38, 10]} />
        <meshStandardMaterial color="#555" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Star base */}
      {[0, 72, 144, 216, 288].map((angle, i) => {
        const rad = angle * Math.PI / 180
        return (
          <mesh key={i} position={[Math.sin(rad) * 0.16, 0.04, Math.cos(rad) * 0.16]} rotation={[0, -rad, 0]} castShadow>
            <boxGeometry args={[0.36, 0.04, 0.07]} />
            <meshStandardMaterial color="#333" roughness={0.5} />
          </mesh>
        )
      })}
    </group>
  )
}

// ─── Lounge Sofa ─────────────────────────────────────────────────────────────

export function LoungeSofa({ position, rotation = 0, color = '#8a7a6a' }: { position: [number,number,number]; rotation?: number; color?: string }) {
  const [px, py, pz] = position
  return (
    <group position={[px, py, pz]} rotation={[0, rotation, 0]}>
      {/* Base */}
      <RoundedBox args={[1.8, 0.35, 0.85]} radius={0.06} smoothness={3} position={[0, 0.175, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.85} />
      </RoundedBox>
      {/* Back cushion */}
      <RoundedBox args={[1.8, 0.45, 0.2]} radius={0.07} smoothness={3} position={[0, 0.55, -0.33]} castShadow>
        <meshStandardMaterial color={color} roughness={0.9} />
      </RoundedBox>
      {/* Seat cushions */}
      <RoundedBox args={[0.82, 0.12, 0.65]} radius={0.05} smoothness={3} position={[-0.46, 0.41, 0.08]} castShadow>
        <meshStandardMaterial color={color} roughness={0.9} />
      </RoundedBox>
      <RoundedBox args={[0.82, 0.12, 0.65]} radius={0.05} smoothness={3} position={[0.46, 0.41, 0.08]} castShadow>
        <meshStandardMaterial color={color} roughness={0.9} />
      </RoundedBox>
      {/* Arm rests */}
      <RoundedBox args={[0.14, 0.45, 0.85]} radius={0.05} smoothness={3} position={[-0.97, 0.35, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.14, 0.45, 0.85]} radius={0.05} smoothness={3} position={[0.97, 0.35, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.8} />
      </RoundedBox>
      {/* Legs */}
      {([ [-0.7, -0.18, -0.35], [0.7, -0.18, -0.35], [-0.7, -0.18, 0.35], [0.7, -0.18, 0.35] ] as [number,number,number][]).map((lp, i) => (
        <mesh key={i} position={lp} castShadow>
          <cylinderGeometry args={[0.03, 0.025, 0.14, 8]} />
          <meshStandardMaterial color="#8a6a4a" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Arm Chair ────────────────────────────────────────────────────────────────

export function ArmChair({ position, rotation = 0, color = '#7a6a5a' }: { position: [number,number,number]; rotation?: number; color?: string }) {
  const [px, py, pz] = position
  return (
    <group position={[px, py, pz]} rotation={[0, rotation, 0]}>
      <RoundedBox args={[0.72, 0.3, 0.7]} radius={0.06} smoothness={3} position={[0, 0.15, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.72, 0.42, 0.16]} radius={0.06} smoothness={3} position={[0, 0.48, -0.27]} castShadow>
        <meshStandardMaterial color={color} roughness={0.85} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.36, 0.7]} radius={0.04} smoothness={3} position={[-0.42, 0.38, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.8} />
      </RoundedBox>
      <RoundedBox args={[0.12, 0.36, 0.7]} radius={0.04} smoothness={3} position={[0.42, 0.38, 0]} castShadow>
        <meshStandardMaterial color={color} roughness={0.8} />
      </RoundedBox>
      {/* Seat cushion */}
      <RoundedBox args={[0.6, 0.1, 0.58]} radius={0.04} smoothness={3} position={[0, 0.35, 0.04]} castShadow>
        <meshStandardMaterial color={color} roughness={0.9} />
      </RoundedBox>
      {/* Legs */}
      {([ [-0.28, -0.12, -0.28], [0.28, -0.12, -0.28], [-0.28, -0.12, 0.28], [0.28, -0.12, 0.28] ] as [number,number,number][]).map((lp, i) => (
        <mesh key={i} position={lp} castShadow>
          <cylinderGeometry args={[0.025, 0.02, 0.22, 8]} />
          <meshStandardMaterial color="#8a6a4a" roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Coffee Table ──────────────────────────────────────────────────────────────

export function CoffeeTable({ position, rotation = 0, color = '#b08860' }: { position: [number,number,number]; rotation?: number; color?: string }) {
  const [px, py, pz] = position
  return (
    <group position={[px, py, pz]} rotation={[0, rotation, 0]}>
      <RoundedBox args={[0.9, 0.06, 0.5]} radius={0.03} smoothness={3} position={[0, 0.35, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.05} />
      </RoundedBox>
      {([ [-0.35, 0.17, -0.18], [0.35, 0.17, -0.18], [-0.35, 0.17, 0.18], [0.35, 0.17, 0.18] ] as [number,number,number][]).map((lp, i) => (
        <mesh key={i} position={lp} castShadow>
          <cylinderGeometry args={[0.025, 0.02, 0.34, 8]} />
          <meshStandardMaterial color="#8a6a4a" roughness={0.5} metalness={0.2} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Bookshelf Unit ───────────────────────────────────────────────────────────

const BOOK_COLORS = ['#c03030', '#3050a0', '#208040', '#c09020', '#802080', '#c06020', '#304050']

export function BookshelfUnit({ position, rotation = 0, shelfColor = '#8a6a4a', height = 2.0 }: {
  position: [number,number,number]; rotation?: number; shelfColor?: string; height?: number
}) {
  const [px, py, pz] = position
  const shelves = 4
  const shelfSpacing = (height - 0.3) / shelves
  return (
    <group position={[px, py, pz]} rotation={[0, rotation, 0]}>
      {/* Carcass */}
      <B p={[-0.48, height / 2, 0]} s={[0.04, height, 0.38]} c={shelfColor} />
      <B p={[0.48, height / 2, 0]} s={[0.04, height, 0.38]} c={shelfColor} />
      <B p={[0, height - 0.02, 0]} s={[0.92, 0.04, 0.38]} c={shelfColor} receive={false} />
      <B p={[0, 0.02, 0]} s={[0.92, 0.04, 0.38]} c={shelfColor} />
      <B p={[0, height / 2, -0.17]} s={[0.92, height, 0.04]} c={shelfColor} receive={false} cast={false} />
      {/* Shelves */}
      {Array.from({ length: shelves }).map((_, i) => (
        <B key={i} p={[0, 0.3 + i * shelfSpacing, 0]} s={[0.92, 0.035, 0.38]} c={shelfColor} />
      ))}
      {/* Books */}
      {Array.from({ length: shelves }).map((_, shelf) => {
        const books: React.ReactNode[] = []
        let xPos = -0.42
        for (let b = 0; b < 7; b++) {
          const bw = 0.055 + ((b * 7 + shelf * 13) % 4) * 0.012
          const bh = 0.14 + ((b * 3 + shelf * 5) % 5) * 0.018
          const bc = BOOK_COLORS[(b + shelf * 3) % BOOK_COLORS.length]
          books.push(
            <B key={b}
              p={[xPos + bw / 2, 0.3 + shelf * shelfSpacing + 0.035 + bh / 2, 0.02]}
              s={[bw - 0.005, bh, 0.28]}
              c={bc} roughness={0.6}
            />
          )
          xPos += bw + 0.003
        }
        return books
      })}
    </group>
  )
}

// ─── Tall Bookshelf (library double-height) ──────────────────────────────────

export function TallBookshelf({ position, rotation = 0 }: { position: [number,number,number]; rotation?: number }) {
  return <BookshelfUnit position={position} rotation={rotation} shelfColor="#4a2e18" height={3.6} />
}

// ─── Desk Lamp ────────────────────────────────────────────────────────────────

export function DeskLamp({ position, rotation = 0, lightColor = '#ffdd88' }: { position: [number,number,number]; rotation?: number; lightColor?: string }) {
  const [px, py, pz] = position
  return (
    <group position={[px, py, pz]} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.04, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.09, 0.04, 12]} />
        <meshStandardMaterial color="#888" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.26, 0]} castShadow>
        <cylinderGeometry args={[0.015, 0.015, 0.44, 8]} />
        <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0.08, 0.44, 0]} rotation={[0.4, 0, 0.3]} castShadow>
        <cylinderGeometry args={[0.04, 0.08, 0.14, 12, 1, true]} />
        <meshStandardMaterial color="#ddc060" roughness={0.4} side={2} />
      </mesh>
      <pointLight color={lightColor} intensity={0.8} position={[0.08, 0.42, 0]} distance={3} decay={2} />
    </group>
  )
}

// ─── Plant Medium ─────────────────────────────────────────────────────────────

export function PlantMedium({ position, leafColor = '#3a7a30' }: { position: [number,number,number]; leafColor?: string }) {
  const [px, py, pz] = position
  return (
    <group position={[px, py, pz]}>
      <mesh position={[0, 0.18, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.09, 0.22, 10]} />
        <meshStandardMaterial color="#a08060" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.22, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.06, 8]} />
        <meshStandardMaterial color="#5a4a30" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.5, 0]} castShadow>
        <sphereGeometry args={[0.24, 10, 8]} />
        <meshStandardMaterial color={leafColor} roughness={0.9} />
      </mesh>
      <mesh position={[0.18, 0.42, 0.1]} castShadow>
        <sphereGeometry args={[0.14, 8, 6]} />
        <meshStandardMaterial color={leafColor} roughness={0.9} />
      </mesh>
      <mesh position={[-0.16, 0.44, -0.08]} castShadow>
        <sphereGeometry args={[0.13, 8, 6]} />
        <meshStandardMaterial color={leafColor} roughness={0.9} />
      </mesh>
    </group>
  )
}

// ─── Plant Large ──────────────────────────────────────────────────────────────

export function PlantLarge({ position, leafColor = '#3a7a30' }: { position: [number,number,number]; leafColor?: string }) {
  const [px, py, pz] = position
  return (
    <group position={[px, py, pz]}>
      <mesh position={[0, 0.24, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.14, 0.3, 12]} />
        <meshStandardMaterial color="#a08060" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.06, 0.1, 8]} />
        <meshStandardMaterial color="#5a4a30" roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.75, 0]} castShadow>
        <sphereGeometry args={[0.35, 10, 8]} />
        <meshStandardMaterial color={leafColor} roughness={0.9} />
      </mesh>
      {([[0.26, 0.62, 0.14], [-0.24, 0.65, -0.1], [0.1, 0.58, -0.28], [-0.1, 0.63, 0.28]] as [number,number,number][]).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[0.18 + (i % 2) * 0.04, 8, 6]} />
          <meshStandardMaterial color={leafColor} roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Hanging Plant ────────────────────────────────────────────────────────────

export function HangingPlant({ position, leafColor = '#4a8a3a' }: { position: [number,number,number]; leafColor?: string }) {
  const [px, py, pz] = position
  return (
    <group position={[px, py, pz]}>
      <mesh position={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.07, 0.14, 10]} />
        <meshStandardMaterial color="#b09070" roughness={0.9} />
      </mesh>
      {([[-0.2, -0.35, 0.12], [0.18, -0.42, -0.1], [0, -0.55, 0.2], [-0.15, -0.62, -0.18], [0.22, -0.7, 0.05]] as [number,number,number][]).map((p, i) => (
        <mesh key={i} position={p} castShadow>
          <sphereGeometry args={[0.12 - i * 0.008, 8, 6]} />
          <meshStandardMaterial color={leafColor} roughness={0.85} />
        </mesh>
      ))}
    </group>
  )
}

// ─── Coffee Machine + Counter ─────────────────────────────────────────────────

export function CoffeeMachine({ position }: { position: [number,number,number] }) {
  const [px, py, pz] = position
  return (
    <group position={[px, py, pz]}>
      <RoundedBox args={[0.3, 0.38, 0.28]} radius={0.03} smoothness={3} position={[0, 0.19, 0]} castShadow>
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.5} />
      </RoundedBox>
      <mesh position={[0, 0.22, 0.15]} castShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
        <meshStandardMaterial color="#888" metalness={0.9} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.04, 0.12]}>
        <boxGeometry args={[0.14, 0.03, 0.12]} />
        <meshStandardMaterial color="#333" roughness={0.5} metalness={0.3} />
      </mesh>
      <RoundedBox args={[0.1, 0.06, 0.06]} radius={0.02} smoothness={2} position={[-0.08, 0.3, 0.15]} castShadow>
        <meshStandardMaterial color="#1a1a1a" roughness={0.4} />
      </RoundedBox>
      <pointLight color="#ff8844" intensity={0.3} position={[0, 0.38, 0.12]} distance={0.8} decay={2} />
    </group>
  )
}

export function Counter({ position, rotation = 0, width = 1.2, color = '#d0b888' }: { position: [number,number,number]; rotation?: number; width?: number; color?: string }) {
  const [px, py, pz] = position
  return (
    <group position={[px, py, pz]} rotation={[0, rotation, 0]}>
      <RoundedBox args={[width, 0.82, 0.6]} radius={0.02} smoothness={2} position={[0, 0.41, 0]} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.4} />
      </RoundedBox>
      <B p={[0, 0.86, 0]} s={[width + 0.05, 0.04, 0.64]} c="#c0a070" roughness={0.2} metalness={0.05} />
    </group>
  )
}

// ─── Rug ──────────────────────────────────────────────────────────────────────

export function Rug({ position, size = [2.2, 1.4] as [number,number], color = '#8a6050' }: { position: [number,number,number]; size?: [number,number]; color?: string }) {
  return (
    <mesh position={[position[0], position[1], position[2]]} receiveShadow>
      <boxGeometry args={[size[0], 0.015, size[1]]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  )
}

// ─── Fireplace ────────────────────────────────────────────────────────────────

export function Fireplace({ position, rotation = 0 }: { position: [number,number,number]; rotation?: number }) {
  const [px, py, pz] = position
  return (
    <group position={[px, py, pz]} rotation={[0, rotation, 0]}>
      {/* Surround */}
      <B p={[0, 0.8, 0]} s={[1.4, 1.6, 0.3]} c="#4a3828" roughness={0.7} />
      {/* Opening */}
      <B p={[0, 0.55, 0.08]} s={[0.78, 0.82, 0.2]} c="#1a1a1a" roughness={0.95} cast={false} />
      {/* Mantle */}
      <RoundedBox args={[1.5, 0.1, 0.38]} radius={0.02} smoothness={2} position={[0, 1.65, 0.04]} castShadow>
        <meshStandardMaterial color="#6a4a30" roughness={0.4} />
      </RoundedBox>
      {/* Flames (emissive boxes) */}
      <mesh position={[-0.15, 0.38, 0.06]}>
        <boxGeometry args={[0.12, 0.22, 0.05]} />
        <meshStandardMaterial color="#ff5500" emissive="#ff3300" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.05, 0.42, 0.06]}>
        <boxGeometry args={[0.1, 0.28, 0.05]} />
        <meshStandardMaterial color="#ffaa00" emissive="#ff6600" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.2, 0.36, 0.06]}>
        <boxGeometry args={[0.08, 0.18, 0.05]} />
        <meshStandardMaterial color="#ff3300" emissive="#ff2200" emissiveIntensity={1.5} />
      </mesh>
      <pointLight color="#ff8844" intensity={3} position={[0, 0.5, 0.3]} distance={4} decay={2} />
    </group>
  )
}

// ─── Server Rack ──────────────────────────────────────────────────────────────

export function ServerRack({ position, rotation = 0 }: { position: [number,number,number]; rotation?: number }) {
  const [px, py, pz] = position
  return (
    <group position={[px, py, pz]} rotation={[0, rotation, 0]}>
      <RoundedBox args={[0.55, 1.8, 0.65]} radius={0.02} smoothness={2} position={[0, 0.9, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#1a1e26" roughness={0.3} metalness={0.7} />
      </RoundedBox>
      {Array.from({ length: 6 }).map((_, i) => (
        <group key={i} position={[0, 0.3 + i * 0.26, 0.33]}>
          <B p={[0, 0, 0]} s={[0.48, 0.2, 0.02]} c="#2a2e38" roughness={0.4} metalness={0.6} />
          <mesh position={[-0.18, 0, 0.015]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshStandardMaterial color={i % 2 === 0 ? "#00ff80" : "#00aaff"} emissive={i % 2 === 0 ? "#00ff80" : "#00aaff"} emissiveIntensity={2} />
          </mesh>
          <mesh position={[-0.1, 0, 0.015]}>
            <sphereGeometry args={[0.015, 6, 6]} />
            <meshStandardMaterial color="#ff8800" emissive="#ff8800" emissiveIntensity={1} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ─── Whiteboard ───────────────────────────────────────────────────────────────

export function Whiteboard({ position, rotation = 0, width = 2.0, color = '#f0ece8' }: { position: [number,number,number]; rotation?: number; width?: number; color?: string }) {
  const [px, py, pz] = position
  return (
    <group position={[px, py, pz]} rotation={[0, rotation, 0]}>
      <B p={[0, 0, 0]} s={[width, 1.2, 0.04]} c="#555" roughness={0.5} metalness={0.5} />
      <mesh position={[0, 0, 0.022]}>
        <planeGeometry args={[width - 0.08, 1.1]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
      {/* Tray */}
      <B p={[0, -0.64, 0.02]} s={[width - 0.06, 0.06, 0.08]} c="#666" roughness={0.4} metalness={0.6} />
    </group>
  )
}

// ─── Industrial Window (Loft style) ──────────────────────────────────────────

export function IndustrialWindow({ position, rotation = 0, width = 2.0, height = 3.0 }: { position: [number,number,number]; rotation?: number; width?: number; height?: number }) {
  const [px, py, pz] = position
  const fw = 0.06
  const cols = Math.round(width / 0.7)
  const rows = Math.round(height / 0.8)
  const cw = (width - fw * (cols + 1)) / cols
  const ch = (height - fw * (rows + 1)) / rows
  const cells: React.ReactNode[] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cx = -width / 2 + fw + c * (cw + fw) + cw / 2
      const cy = fw + r * (ch + fw) + ch / 2
      cells.push(
        <mesh key={`c-${r}-${c}`} position={[cx, cy, 0]}>
          <planeGeometry args={[cw, ch]} />
          <meshStandardMaterial color="#a8c8e8" transparent opacity={0.35} roughness={0.05} />
        </mesh>
      )
    }
  }
  return (
    <group position={[px, py, pz]} rotation={[0, rotation, 0]}>
      {cells}
      <B p={[0, height / 2, 0.01]} s={[width, height + fw * 2, fw]} c="#555" roughness={0.4} metalness={0.5} />
      {Array.from({ length: cols + 1 }).map((_, c) => (
        <B key={`vf${c}`} p={[-width / 2 + c * (cw + fw) + fw / 2, height / 2, 0.01]} s={[fw, height, fw + 0.01]} c="#555" roughness={0.4} metalness={0.5} />
      ))}
      {Array.from({ length: rows + 1 }).map((_, r) => (
        <B key={`hf${r}`} p={[0, r * (ch + fw) + fw / 2, 0.01]} s={[width, fw, fw + 0.01]} c="#555" roughness={0.4} metalness={0.5} />
      ))}
    </group>
  )
}

// ─── Arched Window (Library style) ───────────────────────────────────────────

export function ArchedWindow({ position, rotation = 0, width = 0.9, height = 2.2 }: { position: [number,number,number]; rotation?: number; width?: number; height?: number }) {
  const [px, py, pz] = position
  const rectH = height * 0.65
  return (
    <group position={[px, py, pz]} rotation={[0, rotation, 0]}>
      <mesh position={[0, rectH / 2, 0]}>
        <planeGeometry args={[width - 0.08, rectH]} />
        <meshStandardMaterial color="#b8d0e8" transparent opacity={0.4} roughness={0.05} />
      </mesh>
      <B p={[-width / 2 + 0.03, rectH / 2, 0.01]} s={[0.06, rectH + 0.1, 0.06]} c="#6a5040" roughness={0.5} />
      <B p={[width / 2 - 0.03, rectH / 2, 0.01]} s={[0.06, rectH + 0.1, 0.06]} c="#6a5040" roughness={0.5} />
      <B p={[0, 0.02, 0.01]} s={[width, 0.06, 0.06]} c="#6a5040" roughness={0.5} />
      {/* Arch top (approximated with cylinder segment) */}
      <mesh position={[0, rectH + width * 0.25, 0]}>
        <torusGeometry args={[width / 2 - 0.04, 0.04, 8, 20, Math.PI]} />
        <meshStandardMaterial color="#6a5040" roughness={0.5} />
      </mesh>
    </group>
  )
}

// ─── Glass Ceiling Panel ──────────────────────────────────────────────────────

export function GlassCeilingPanel({ position, size = [2, 2] as [number,number] }: { position: [number,number,number]; size?: [number,number] }) {
  return (
    <group position={position}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={size} />
        <meshStandardMaterial color="#c8e8f0" transparent opacity={0.3} roughness={0.05} />
      </mesh>
      <B p={[size[0] / 2, 0, 0]} s={[0.05, 0.05, size[1]]} c="#aaa" roughness={0.3} metalness={0.7} cast={false} receive={false} />
      <B p={[-size[0] / 2, 0, 0]} s={[0.05, 0.05, size[1]]} c="#aaa" roughness={0.3} metalness={0.7} cast={false} receive={false} />
      <B p={[0, 0, size[1] / 2]} s={[size[0], 0.05, 0.05]} c="#aaa" roughness={0.3} metalness={0.7} cast={false} receive={false} />
      <B p={[0, 0, -size[1] / 2]} s={[size[0], 0.05, 0.05]} c="#aaa" roughness={0.3} metalness={0.7} cast={false} receive={false} />
    </group>
  )
}
