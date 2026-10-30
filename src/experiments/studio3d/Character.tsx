import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import * as M from './Materials'

interface Props {
  position: THREE.Vector3
  targetPosition: THREE.Vector3 | null
  onArrived: () => void
  skinTone?: 'light' | 'dark'
}

const WALK_SPEED = 2.5

export default function Character({ position, targetPosition, onArrived, skinTone = 'light' }: Props) {
  const groupRef = useRef<THREE.Group>(null!)
  const bobRef = useRef(0)
  const facingRef = useRef(0)
  const skinMat = skinTone === 'dark' ? M.skinDark : M.skin

  useFrame((_, delta) => {
    const g = groupRef.current
    if (!g) return

    if (targetPosition) {
      const dx = targetPosition.x - g.position.x
      const dz = targetPosition.z - g.position.z
      const dist = Math.sqrt(dx * dx + dz * dz)

      if (dist > 0.08) {
        const spd = Math.min(WALK_SPEED * delta, dist)
        g.position.x += (dx / dist) * spd
        g.position.z += (dz / dist) * spd
        // Face direction of travel
        facingRef.current = Math.atan2(dx, dz)
        g.rotation.y = facingRef.current
        bobRef.current += delta * 8
      } else {
        g.position.x = targetPosition.x
        g.position.z = targetPosition.z
        onArrived()
      }
    }

    // Bob torso when moving
    const bob = targetPosition ? Math.sin(bobRef.current) * 0.02 : 0
    // Apply bob to head only
    const head = g.children[2] as THREE.Mesh
    if (head) head.position.y = 1.58 + bob
  })

  return (
    <group ref={groupRef} position={[position.x, 0.1, position.z]}>
      {/* Legs */}
      <mesh position={[-0.09, 0.45, 0]} material={M.pantsBlue}>
        <boxGeometry args={[0.14, 0.72, 0.14]} />
      </mesh>
      <mesh position={[0.09, 0.45, 0]} material={M.pantsBlue}>
        <boxGeometry args={[0.14, 0.72, 0.14]} />
      </mesh>
      {/* Feet */}
      <mesh position={[-0.09, 0.06, 0.05]} material={M.oakDark}>
        <boxGeometry args={[0.13, 0.08, 0.2]} />
      </mesh>
      <mesh position={[0.09, 0.06, 0.05]} material={M.oakDark}>
        <boxGeometry args={[0.13, 0.08, 0.2]} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.98, 0]} material={M.shirtWhite}>
        <boxGeometry args={[0.38, 0.55, 0.24]} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.24, 0.95, 0]} material={skinMat}>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
      </mesh>
      <mesh position={[0.24, 0.95, 0]} material={skinMat}>
        <boxGeometry args={[0.12, 0.5, 0.12]} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.29, 0]} material={skinMat}>
        <cylinderGeometry args={[0.07, 0.07, 0.12, 8]} />
      </mesh>
      {/* Head — large, rounded feel via scale */}
      <group position={[0, 1.58, 0]}>
        <mesh material={skinMat}>
          <boxGeometry args={[0.38, 0.38, 0.34]} />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.1, 0.03, 0.18]} material={M.monitorBezel}>
          <sphereGeometry args={[0.055, 8, 8]} />
        </mesh>
        <mesh position={[0.1, 0.03, 0.18]} material={M.monitorBezel}>
          <sphereGeometry args={[0.055, 8, 8]} />
        </mesh>
        {/* Eye whites */}
        <mesh position={[-0.1, 0.03, 0.205]} material={new THREE.MeshStandardMaterial({ color: 'white' })}>
          <sphereGeometry args={[0.028, 8, 8]} />
        </mesh>
        <mesh position={[0.1, 0.03, 0.205]} material={new THREE.MeshStandardMaterial({ color: 'white' })}>
          <sphereGeometry args={[0.028, 8, 8]} />
        </mesh>
        {/* Smile */}
        <mesh position={[0, -0.06, 0.175]} rotation={[0.3, 0, 0]} material={M.bookRed}>
          <torusGeometry args={[0.06, 0.014, 8, 12, Math.PI]} />
        </mesh>
        {/* Hair */}
        <mesh position={[0, 0.14, -0.02]} material={skinTone === 'dark' ? M.hairBrown : M.hairDark}>
          <boxGeometry args={[0.4, 0.16, 0.36]} />
        </mesh>
        <mesh position={[0, 0.08, -0.175]} material={skinTone === 'dark' ? M.hairBrown : M.hairDark}>
          <boxGeometry args={[0.38, 0.25, 0.04]} />
        </mesh>
      </group>
    </group>
  )
}
