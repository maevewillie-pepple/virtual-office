import React, { useState, useRef, useCallback } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei'
import * as THREE from 'three'

import LightingSetup from './LightingSetup'
import IsometricCamera from './IsometricCamera'
import StudioArchitecture from './StudioArchitecture'
import Character from './Character'
import DustParticles from './DustParticles'
import {
  Desk, Chair, Sofa, CoffeeTable, Rug,
  Bookshelf, CoffeeMachine, Counter,
  PlantLarge, HangingVine, DeskLamp
} from './Furniture'

// ─── Floor click plane ───────────────────────────────────────────────────────
function FloorClickPlane({ onFloorClick }: { onFloorClick: (p: THREE.Vector3) => void }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.11, 0]}
      visible={false}
      onClick={(e) => {
        e.stopPropagation()
        onFloorClick(e.point)
      }}
    >
      <planeGeometry args={[22, 16]} />
      <meshBasicMaterial />
    </mesh>
  )
}

// ─── Tooltip overlay ─────────────────────────────────────────────────────────
function Tooltip({ text, visible }: { text: string; visible: boolean }) {
  if (!visible) return null
  return (
    <div style={{
      position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(20,28,38,0.88)', color: '#F2E8D8',
      padding: '6px 16px', fontFamily: 'monospace', fontSize: 13,
      fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
      pointerEvents: 'none', border: '1px solid rgba(242,232,216,0.2)',
      backdropFilter: 'blur(6px)', whiteSpace: 'nowrap',
    }}>
      {text}
    </div>
  )
}

// ─── Inner scene (needs canvas context) ──────────────────────────────────────
function SceneContents({
  charPos, charTarget, onArrived, onFloorClick, onInteract, tooltip,
}: {
  charPos: THREE.Vector3
  charTarget: THREE.Vector3 | null
  onArrived: () => void
  onFloorClick: (p: THREE.Vector3) => void
  onInteract: (label: string, pos: THREE.Vector3) => void
  tooltip: string
}) {
  const interactBtn = (label: string, pos: [number,number,number]) =>
    (pt: THREE.Vector3) => onInteract(label, new THREE.Vector3(...pos))

  return (
    <>
      <LightingSetup />
      <IsometricCamera resetSignal={0} />

      {/* Contact shadows on floor */}
      <ContactShadows
        position={[0, 0.12, 0]}
        width={22} height={16}
        far={6} blur={1.5}
        opacity={0.45}
        color="#3a2810"
      />

      {/* Click floor */}
      <FloorClickPlane onFloorClick={onFloorClick} />

      {/* Architecture */}
      <StudioArchitecture />

      {/* ── LOWER FLOOR FURNITURE ── */}

      {/* Lounge area */}
      <Rug pos={[-5, 0.12, 2]} />
      <Sofa pos={[-5, 0.1, 3.2]} rot={[0, Math.PI, 0]} />
      <CoffeeTable pos={[-5, 0.1, 1.6]} />
      <PlantLarge pos={[-7.5, 0.1, 1]} />
      <PlantLarge pos={[-7.5, 0.1, 3.5]} />

      {/* Lower desks */}
      <group onClick={(e) => { e.stopPropagation(); onInteract('💻 Desk · Lower Left', new THREE.Vector3(-2.5, 0.1, -3)) }}>
        <Desk pos={[-2.5, 0.78, -3.5]} />
        <Chair pos={[-2.5, 0.1, -2.5]} />
      </group>
      <group onClick={(e) => { e.stopPropagation(); onInteract('💻 Desk · Lower Right', new THREE.Vector3(0.5, 0.1, -3)) }}>
        <Desk pos={[0.5, 0.78, -3.5]} />
        <Chair pos={[0.5, 0.1, -2.5]} />
      </group>

      {/* Coffee corner */}
      <Counter pos={[-9.5, 0.1, -4.5]} />
      <group onClick={(e) => { e.stopPropagation(); onInteract('☕ Coffee Machine · grab a cup', new THREE.Vector3(-9, 0.1, -3.5)) }}>
        <CoffeeMachine pos={[-9.5, 0.94, -4.5]} />
      </group>
      <PlantLarge pos={[-8.3, 0.1, -5.5]} />

      {/* Bookshelves — back wall */}
      <Bookshelf pos={[-8.5, 0.1, -7.6]} rot={[0, 0, 0]} />
      <Bookshelf pos={[-6.5, 0.1, -7.6]} rot={[0, 0, 0]} />
      <Bookshelf pos={[-4.0, 0.1, -7.6]} rot={[0, 0, 0]} />

      {/* ── MEZZANINE FURNITURE ── */}
      <group onClick={(e) => { e.stopPropagation(); onInteract('💻 Desk · Mezzanine Left', new THREE.Vector3(3, 3.1, -3.5)) }}>
        <Desk pos={[3, 3.78, -3.8]} rot={[0, 0, 0]} />
        <Chair pos={[3, 3.1, -2.9]} />
      </group>
      <group onClick={(e) => { e.stopPropagation(); onInteract('💻 Desk · Mezzanine Right', new THREE.Vector3(6, 3.1, -3.5)) }}>
        <Desk pos={[6, 3.78, -3.8]} rot={[0, 0, 0]} />
        <Chair pos={[6, 3.1, -2.9]} />
      </group>
      <DeskLamp pos={[3, 3.84, -4.1]} />
      <DeskLamp pos={[6, 3.84, -4.1]} />

      {/* Mezzanine bookshelf */}
      <Bookshelf pos={[7, 3.1, -7.6]} />

      {/* Hanging vines */}
      <HangingVine pos={[-2, 8.8, -6.5]} />
      <HangingVine pos={[1, 8.8, -7.2]} />
      <HangingVine pos={[-4.5, 8.8, -5.8]} />

      {/* Dust particles in sunbeam zone */}
      <DustParticles />

      {/* Character */}
      <Character
        position={charPos}
        targetPosition={charTarget}
        onArrived={onArrived}
        skinTone="light"
      />

      {/* Second static character on mezzanine */}
      <Character
        position={new THREE.Vector3(4.5, 3.1, -4.2)}
        targetPosition={null}
        onArrived={() => {}}
        skinTone="dark"
      />

      {/* Fog for depth */}
      <fog attach="fog" args={['#f5e8d0', 18, 45]} />
    </>
  )
}

// ─── Main exported screen ─────────────────────────────────────────────────────
export default function StudioScene() {
  const [charPos]   = useState(() => new THREE.Vector3(-1, 0.1, 1))
  const [charTarget, setCharTarget] = useState<THREE.Vector3 | null>(null)
  const [resetCam, setResetCam] = useState(0)
  const [tooltip, setTooltip] = useState('')
  const [tooltipVisible, setTooltipVisible] = useState(false)
  const tooltipTimerRef = useRef<ReturnType<typeof setTimeout>>()

  const showTooltip = (text: string) => {
    setTooltip(text)
    setTooltipVisible(true)
    clearTimeout(tooltipTimerRef.current)
    tooltipTimerRef.current = setTimeout(() => setTooltipVisible(false), 2800)
  }

  const handleFloorClick = useCallback((p: THREE.Vector3) => {
    // Clamp to lower floor bounds (mezzanine click handled by objects)
    if (p.y < 1.5) {
      setCharTarget(new THREE.Vector3(
        Math.max(-9.5, Math.min(6.5, p.x)),
        0.1,
        Math.max(-6.5, Math.min(5, p.z))
      ))
      showTooltip('🚶 Walking…')
    }
  }, [])

  const handleInteract = useCallback((label: string, pos: THREE.Vector3) => {
    setCharTarget(pos.clone())
    showTooltip(label)
  }, [])

  const handleArrived = useCallback(() => {
    setCharTarget(null)
  }, [])

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#f5e8d0' }}>
      <Canvas
        shadows
        camera={{ fov: 42, near: 0.1, far: 80 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.1 }}
        style={{ width: '100%', height: '100%' }}
      >
        <SceneContents
          charPos={charPos}
          charTarget={charTarget}
          onArrived={handleArrived}
          onFloorClick={handleFloorClick}
          onInteract={handleInteract}
          tooltip={tooltip}
        />
        <OrbitControls
          enablePan={false}
          enableZoom
          minDistance={8}
          maxDistance={35}
          minPolarAngle={Math.PI / 8}
          maxPolarAngle={Math.PI / 2.6}
          enableDamping
          dampingFactor={0.08}
        />
      </Canvas>

      {/* HUD */}
      <Tooltip text={tooltip} visible={tooltipVisible} />

      <div style={{
        position: 'absolute', top: 16, right: 16, display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <button
          onClick={() => setResetCam(r => r + 1)}
          style={{
            background: 'rgba(20,28,38,0.82)', color: '#F2E8D8',
            border: '1px solid rgba(242,232,216,0.25)', padding: '6px 14px',
            fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            cursor: 'pointer', backdropFilter: 'blur(6px)',
          }}
        >
          ↩ Reset Camera
        </button>
        <div style={{
          background: 'rgba(20,28,38,0.72)', color: 'rgba(242,232,216,0.5)',
          border: '1px solid rgba(242,232,216,0.15)', padding: '8px 12px',
          fontFamily: 'monospace', fontSize: 10, lineHeight: 1.6,
          backdropFilter: 'blur(6px)',
        }}>
          <div style={{ color: '#E3B775', marginBottom: 4, fontWeight: 700 }}>3D STUDIO · EXPERIMENT</div>
          <div>Click floor → walk</div>
          <div>Click desk / coffee → interact</div>
          <div>Drag → orbit · Scroll → zoom</div>
        </div>
      </div>
    </div>
  )
}
