import React, { useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  children: React.ReactNode
  label: string
  onInteract: (worldPos: THREE.Vector3) => void
  interactPos: [number, number, number]
  enabled?: boolean
}

export default function InteractiveObject({ children, label, onInteract, interactPos, enabled = true }: Props) {
  const [hovered, setHovered] = useState(false)
  const groupRef = useRef<THREE.Group>(null!)

  const handleClick = (e: any) => {
    if (!enabled) return
    e.stopPropagation()
    onInteract(new THREE.Vector3(...interactPos))
  }

  return (
    <group
      ref={groupRef}
      onPointerEnter={() => { if (enabled) { setHovered(true); document.body.style.cursor = 'pointer' } }}
      onPointerLeave={() => { setHovered(false); document.body.style.cursor = 'default' }}
      onClick={handleClick}
    >
      {children}
      {hovered && enabled && (
        <mesh position={[0, 2.2, 0]}>
          <planeGeometry args={[1.4, 0.32]} />
          <meshBasicMaterial color="#1a2530" transparent opacity={0.85} depthTest={false} />
          {/* Label is handled in HTML overlay — this is just the bg pill */}
        </mesh>
      )}
    </group>
  )
}
