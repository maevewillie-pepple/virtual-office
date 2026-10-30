import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, ContactShadows } from '@react-three/drei'
import * as THREE from 'three'

import Office3DCharacter from './shared/Office3DCharacter'
import ClassicOffice, { classicConfig } from './offices/ClassicOffice'
import CozyLibrary, { libraryConfig } from './offices/CozyLibrary'
import OpenLoft, { loftConfig } from './offices/OpenLoft'
import GardenStudio, { gardenConfig } from './offices/GardenStudio'
import TechLab, { techLabConfig } from './offices/TechLab'
import type { OfficeConfig, OfficeSceneProps, LightingConfig } from './shared/types'
// OrbitControls ref type — use any to avoid requiring three-stdlib import
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrbitControlsType = any

// ─── Office registry ──────────────────────────────────────────────────────────

const OFFICES: { config: OfficeConfig; Component: React.FC<OfficeSceneProps> }[] = [
  { config: classicConfig, Component: ClassicOffice },
  { config: libraryConfig, Component: CozyLibrary },
  { config: loftConfig, Component: OpenLoft },
  { config: gardenConfig, Component: GardenStudio },
  { config: techLabConfig, Component: TechLab },
]

// ─── Dynamic lighting ──────────────────────────────────────────────────────────

function SceneLighting({ cfg }: { cfg: LightingConfig }) {
  return (
    <>
      <ambientLight color={cfg.ambientColor} intensity={cfg.ambientIntensity} />
      <directionalLight
        color={cfg.sunColor}
        intensity={cfg.sunIntensity}
        position={cfg.sunPosition}
        castShadow
        shadow-mapSize={[cfg.shadowMapSize ?? 2048, cfg.shadowMapSize ?? 2048]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={18}
        shadow-camera-bottom={-18}
        shadow-camera-near={0.5}
        shadow-camera-far={80}
        shadow-bias={-0.001}
        shadow-normalBias={0.02}
      />
      {cfg.fillColor && cfg.fillIntensity !== undefined && (
        <directionalLight color={cfg.fillColor} intensity={cfg.fillIntensity} position={[10, 8, -4]} />
      )}
      {cfg.hemiSkyColor && (
        <hemisphereLight
          color={cfg.hemiSkyColor}
          groundColor={cfg.hemiGroundColor ?? '#808080'}
          intensity={cfg.hemiIntensity ?? 0.4}
        />
      )}
      {(cfg.pointLights ?? []).map((pl, i) => (
        <pointLight
          key={i}
          color={pl.color}
          intensity={pl.intensity}
          position={pl.position}
          distance={pl.distance ?? 8}
          decay={2}
        />
      ))}
    </>
  )
}

// ─── Camera controller ────────────────────────────────────────────────────────

interface CameraProps {
  target: [number, number, number]
  zoom: number
  resetKey: number
  controlsRef: React.RefObject<OrbitControlsType | null>
}

function CameraController({ target, zoom, resetKey, controlsRef }: CameraProps) {
  const { camera, size } = useThree()

  useEffect(() => {
    if (!(camera instanceof THREE.OrthographicCamera)) return
    const aspect = size.width / size.height
    const scaledZoom = zoom * (size.width / 1200)
    camera.zoom = Math.max(30, scaledZoom)
    camera.near = 0.1
    camera.far = 200
    camera.updateProjectionMatrix()

    const [tx, ty, tz] = target
    camera.position.set(tx + 14, ty + 18, tz + 14)
    camera.lookAt(tx, ty, tz)

    if (controlsRef.current) {
      controlsRef.current.target.set(tx, ty, tz)
      controlsRef.current.update()
    }
  }, [target, zoom, resetKey, camera, size, controlsRef])

  return null
}

// ─── Inner scene ──────────────────────────────────────────────────────────────

interface SceneProps {
  officeIndex: number
  charPos: THREE.Vector3
  charTarget: THREE.Vector3 | null
  claimedDesks: Record<string, string>
  onArrived: () => void
  onDeskClaim: (id: string) => void
  onFloorClick: (x: number, z: number, level?: number) => void
  cameraResetKey: number
  controlsRef: React.RefObject<OrbitControlsType | null>
}

function Scene({
  officeIndex, charPos, charTarget, claimedDesks,
  onArrived, onDeskClaim, onFloorClick, cameraResetKey, controlsRef
}: SceneProps) {
  const { config, Component } = OFFICES[officeIndex]

  return (
    <>
      <color attach="background" args={[config.bgColor]} />
      <fog attach="fog" args={[config.bgColor, config.fogNear, config.fogFar]} />

      <SceneLighting cfg={config.lighting} />

      <CameraController
        target={config.cameraTarget}
        zoom={config.cameraZoom}
        resetKey={cameraResetKey}
        controlsRef={controlsRef}
      />

      <ContactShadows
        position={[0, 0.14, 0]}
        width={24}
        height={18}
        far={5}
        blur={1.4}
        opacity={0.4}
        color="#101010"
      />

      <Component
        claimedDesks={claimedDesks}
        onDeskClaim={onDeskClaim}
        onFloorClick={onFloorClick}
      />

      <Office3DCharacter
        key={officeIndex}
        position={[charPos.x, charPos.y, charPos.z]}
        targetPosition={charTarget}
        onArrived={onArrived}
        skinTone="medium"
        shirtColor="#4a7ab0"
      />

      <OrbitControls
        ref={controlsRef as any}
        enablePan={false}
        minZoom={28}
        maxZoom={100}
        minPolarAngle={Math.PI / 5.5}
        maxPolarAngle={Math.PI / 2.4}
        minAzimuthAngle={-Math.PI / 5}
        maxAzimuthAngle={Math.PI / 3.5}
        enableDamping
        dampingFactor={0.06}
      />
    </>
  )
}

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ text }: { text: string }) {
  if (!text) return null
  return (
    <div style={{
      position: 'absolute', bottom: 80, left: '50%', transform: 'translateX(-50%)',
      background: 'rgba(12,18,28,0.9)', color: '#e8f0ff',
      padding: '7px 18px', fontFamily: 'monospace', fontSize: 12,
      fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
      pointerEvents: 'none', border: '1px solid rgba(100,160,255,0.3)',
      backdropFilter: 'blur(8px)', whiteSpace: 'nowrap',
    }}>
      {text}
    </div>
  )
}

// ─── Office Selector Bar ──────────────────────────────────────────────────────

function SelectorBar({ current, onSelect }: { current: number; onSelect: (i: number) => void }) {
  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0,
      background: 'rgba(8,12,20,0.92)',
      borderTop: '1px solid rgba(100,160,255,0.2)',
      display: 'flex', justifyContent: 'center', gap: 4, padding: '8px 16px',
      backdropFilter: 'blur(10px)',
    }}>
      {OFFICES.map(({ config }, i) => (
        <button
          key={config.id}
          onClick={() => onSelect(i)}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            padding: '8px 20px',
            background: i === current ? 'rgba(100,160,255,0.18)' : 'transparent',
            border: i === current ? '1px solid rgba(100,160,255,0.4)' : '1px solid transparent',
            color: i === current ? '#c0d8ff' : 'rgba(180,200,240,0.55)',
            cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'monospace',
            minWidth: 90,
          }}
        >
          <span style={{ fontSize: 22 }}>{config.emoji}</span>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', lineHeight: 1.2 }}>
            {config.name}
          </span>
          <span style={{ fontSize: 9, opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {config.tagline}
          </span>
        </button>
      ))}
    </div>
  )
}

// ─── HUD ──────────────────────────────────────────────────────────────────────

function HUD({ onResetCamera, claimedCount }: { onResetCamera: () => void; claimedCount: number }) {
  return (
    <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <button
        onClick={onResetCamera}
        style={{
          background: 'rgba(8,12,20,0.88)', color: '#c0d8ff',
          border: '1px solid rgba(100,160,255,0.3)', padding: '6px 14px',
          fontFamily: 'monospace', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.08em', textTransform: 'uppercase',
          cursor: 'pointer', backdropFilter: 'blur(6px)',
        }}
      >
        ↩ Reset Camera
      </button>
      <div style={{
        background: 'rgba(8,12,20,0.78)', color: 'rgba(180,210,255,0.55)',
        border: '1px solid rgba(100,160,255,0.15)', padding: '8px 12px',
        fontFamily: 'monospace', fontSize: 10, lineHeight: 1.6,
        backdropFilter: 'blur(6px)',
      }}>
        <div style={{ color: '#80bbff', marginBottom: 4, fontWeight: 700 }}>3D OFFICE SPACES</div>
        <div>Click floor → walk</div>
        <div>Click desk → claim ({claimedCount}/8)</div>
        <div>Drag → orbit · Scroll → zoom</div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Studio3DSelector() {
  const [officeIndex, setOfficeIndex] = useState(0)
  const [charPos, setCharPos] = useState(() => new THREE.Vector3(-3, 0.1, 3))
  const [charTarget, setCharTarget] = useState<THREE.Vector3 | null>(null)
  const [claimedDesks, setClaimedDesks] = useState<Record<string, string>>({})
  const [cameraResetKey, setCameraResetKey] = useState(0)
  const [toast, setToast] = useState('')
  const toastTimerRef = useRef<ReturnType<typeof setTimeout>>()
  const controlsRef = useRef<OrbitControlsType | null>(null)

  const showToast = useCallback((text: string) => {
    setToast(text)
    clearTimeout(toastTimerRef.current)
    toastTimerRef.current = setTimeout(() => setToast(''), 2500)
  }, [])

  const handleOfficeSelect = useCallback((i: number) => {
    if (i === officeIndex) return
    setOfficeIndex(i)
    const spawn = OFFICES[i].config.spawnPosition
    const newPos = new THREE.Vector3(...spawn)
    setCharPos(newPos)
    setCharTarget(null)
    setCameraResetKey(k => k + 1)
    showToast(`Entering ${OFFICES[i].config.name}`)
  }, [officeIndex, showToast])

  const handleFloorClick = useCallback((x: number, z: number, level = 0) => {
    const bounds = OFFICES[officeIndex].config.walkableBounds
    const wb = bounds.find(b => (b.y ?? 0) < 1 === (level < 1)) ?? bounds[0]
    const clamped = new THREE.Vector3(
      Math.max(wb.xMin, Math.min(wb.xMax, x)),
      level > 0 ? (wb.y ?? 3.3) : 0.1,
      Math.max(wb.zMin, Math.min(wb.zMax, z))
    )
    setCharTarget(clamped)
    showToast('🚶 Walking…')
  }, [officeIndex, showToast])

  const handleDeskClaim = useCallback((deskId: string) => {
    const already = claimedDesks[deskId]
    if (already) {
      showToast(`${deskId} already claimed`)
      return
    }
    const desk = OFFICES[officeIndex].config.desks.find(d => d.id === deskId)
    if (desk) {
      setCharTarget(new THREE.Vector3(
        desk.position[0],
        desk.position[1] - 0.68,
        desk.position[2] + ((desk.rotation ?? 0) === Math.PI ? -0.9 : 0.9)
      ))
      setClaimedDesks(prev => ({ ...prev, [deskId]: 'me' }))
      showToast(`💻 Desk claimed — ${deskId}`)
    }
  }, [officeIndex, claimedDesks, showToast])

  const handleArrived = useCallback(() => {
    setCharPos(charTarget?.clone() ?? charPos)
    setCharTarget(null)
  }, [charTarget, charPos])

  const handleResetCamera = useCallback(() => {
    setCameraResetKey(k => k + 1)
  }, [])

  const claimedCount = Object.keys(claimedDesks).length

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: OFFICES[officeIndex].config.bgColor }}>
      <Canvas
        orthographic
        camera={{ zoom: 55, position: [14, 18, 14], near: 0.1, far: 200 }}
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.05,
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene
          officeIndex={officeIndex}
          charPos={charPos}
          charTarget={charTarget}
          claimedDesks={claimedDesks}
          onArrived={handleArrived}
          onDeskClaim={handleDeskClaim}
          onFloorClick={handleFloorClick}
          cameraResetKey={cameraResetKey}
          controlsRef={controlsRef}
        />
      </Canvas>

      <Toast text={toast} />
      <HUD onResetCamera={handleResetCamera} claimedCount={claimedCount} />
      <SelectorBar current={officeIndex} onSelect={handleOfficeSelect} />
    </div>
  )
}
