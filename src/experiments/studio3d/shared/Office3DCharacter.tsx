import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import * as THREE from 'three'

interface CharacterProps {
  position: [number, number, number]
  targetPosition: THREE.Vector3 | null
  onArrived?: () => void
  skinTone?: 'light' | 'medium' | 'dark'
  shirtColor?: string
  pantsColor?: string
  hairColor?: string
  name?: string
}

const WALK_SPEED = 3.2

export default function Office3DCharacter({
  position,
  targetPosition,
  onArrived,
  skinTone = 'medium',
  shirtColor = '#4a7ab0',
  pantsColor = '#2a3a5a',
  hairColor = '#3a2010',
  name,
}: CharacterProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const posRef = useRef(new THREE.Vector3(...position))
  const walkRef = useRef(0)
  const isMovingRef = useRef(false)
  const leftArmRef = useRef<THREE.Mesh>(null!)
  const rightArmRef = useRef<THREE.Mesh>(null!)
  const leftLegRef = useRef<THREE.Group>(null!)
  const rightLegRef = useRef<THREE.Group>(null!)

  const skinColor = skinTone === 'light' ? '#e8b888' : skinTone === 'dark' ? '#8a5030' : '#c88050'
  const shoeColor = '#2a1a0a'

  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (targetPosition) {
      const target = new THREE.Vector3(targetPosition.x, posRef.current.y, targetPosition.z)
      const dist = posRef.current.distanceTo(target)

      if (dist > 0.06) {
        isMovingRef.current = true
        const step = Math.min(dist, delta * WALK_SPEED)
        const dir = target.clone().sub(posRef.current).normalize()
        posRef.current.add(dir.multiplyScalar(step))
        groupRef.current.position.copy(posRef.current)

        // Face direction of travel
        const angle = Math.atan2(dir.x, dir.z)
        const currentY = groupRef.current.rotation.y
        let diff = angle - currentY
        while (diff > Math.PI) diff -= 2 * Math.PI
        while (diff < -Math.PI) diff += 2 * Math.PI
        groupRef.current.rotation.y += diff * Math.min(1, delta * 10)
      } else {
        posRef.current.copy(target)
        groupRef.current.position.copy(posRef.current)
        isMovingRef.current = false
        onArrived?.()
      }
    } else {
      isMovingRef.current = false
    }

    // Walk animation
    if (isMovingRef.current) {
      walkRef.current += delta * 8
      const swing = Math.sin(walkRef.current) * 0.4
      if (leftArmRef.current) leftArmRef.current.rotation.x = swing
      if (rightArmRef.current) rightArmRef.current.rotation.x = -swing
      if (leftLegRef.current) leftLegRef.current.rotation.x = -swing * 0.8
      if (rightLegRef.current) rightLegRef.current.rotation.x = swing * 0.8
    } else {
      // Return to idle pose
      if (leftArmRef.current) leftArmRef.current.rotation.x *= 0.85
      if (rightArmRef.current) rightArmRef.current.rotation.x *= 0.85
      if (leftLegRef.current) leftLegRef.current.rotation.x *= 0.85
      if (rightLegRef.current) rightLegRef.current.rotation.x *= 0.85
    }
  })

  return (
    <group ref={groupRef} position={[position[0], position[1], position[2]]}>
      {/* Shadow caster */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.2, 12]} />
        <meshBasicMaterial color="#000" transparent opacity={0.15} />
      </mesh>

      {/* Legs */}
      <group ref={leftLegRef} position={[-0.09, 0.35, 0]}>
        <RoundedBox args={[0.13, 0.34, 0.13]} radius={0.04} smoothness={3} position={[0, -0.17, 0]} castShadow>
          <meshStandardMaterial color={pantsColor} roughness={0.8} />
        </RoundedBox>
        <mesh position={[0, -0.37, 0.04]} castShadow>
          <sphereGeometry args={[0.075, 8, 6]} />
          <meshStandardMaterial color={shoeColor} roughness={0.85} />
        </mesh>
      </group>
      <group ref={rightLegRef} position={[0.09, 0.35, 0]}>
        <RoundedBox args={[0.13, 0.34, 0.13]} radius={0.04} smoothness={3} position={[0, -0.17, 0]} castShadow>
          <meshStandardMaterial color={pantsColor} roughness={0.8} />
        </RoundedBox>
        <mesh position={[0, -0.37, 0.04]} castShadow>
          <sphereGeometry args={[0.075, 8, 6]} />
          <meshStandardMaterial color={shoeColor} roughness={0.85} />
        </mesh>
      </group>

      {/* Torso */}
      <RoundedBox args={[0.32, 0.42, 0.22]} radius={0.06} smoothness={4} position={[0, 0.57, 0]} castShadow>
        <meshStandardMaterial color={shirtColor} roughness={0.75} />
      </RoundedBox>

      {/* Arms */}
      <mesh ref={leftArmRef} position={[-0.22, 0.57, 0]} rotation={[0, 0, 0.2]} castShadow>
        <capsuleGeometry args={[0.055, 0.24, 4, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>
      <mesh ref={rightArmRef} position={[0.22, 0.57, 0]} rotation={[0, 0, -0.2]} castShadow>
        <capsuleGeometry args={[0.055, 0.24, 4, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>

      {/* Neck */}
      <mesh position={[0, 0.82, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.08, 8]} />
        <meshStandardMaterial color={skinColor} roughness={0.7} />
      </mesh>

      {/* Head */}
      <group position={[0, 0.95, 0]}>
        <RoundedBox args={[0.27, 0.25, 0.23]} radius={0.07} smoothness={5} castShadow>
          <meshStandardMaterial color={skinColor} roughness={0.65} />
        </RoundedBox>
        {/* Hair */}
        <RoundedBox args={[0.27, 0.11, 0.23]} radius={0.06} smoothness={4} position={[0, 0.1, -0.01]}>
          <meshStandardMaterial color={hairColor} roughness={0.85} />
        </RoundedBox>
        {/* Eyes */}
        <mesh position={[-0.07, 0.02, 0.115]}>
          <sphereGeometry args={[0.027, 8, 6]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        <mesh position={[0.07, 0.02, 0.115]}>
          <sphereGeometry args={[0.027, 8, 6]} />
          <meshStandardMaterial color="#1a1a1a" />
        </mesh>
        {/* Eye whites */}
        <mesh position={[-0.07, 0.02, 0.111]}>
          <sphereGeometry args={[0.035, 8, 6]} />
          <meshStandardMaterial color="#eeeee8" />
        </mesh>
        <mesh position={[0.07, 0.02, 0.111]}>
          <sphereGeometry args={[0.035, 8, 6]} />
          <meshStandardMaterial color="#eeeee8" />
        </mesh>
        {/* Smile */}
        <mesh position={[0, -0.055, 0.115]} rotation={[0, 0, Math.PI]}>
          <torusGeometry args={[0.04, 0.008, 4, 10, Math.PI * 0.65]} />
          <meshStandardMaterial color="#8a4030" />
        </mesh>
      </group>
    </group>
  )
}
