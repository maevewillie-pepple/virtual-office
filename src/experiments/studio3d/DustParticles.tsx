import React, { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT = 80

export default function DustParticles() {
  const meshRef = useRef<THREE.Points>(null!)

  const { positions, velocities, phases } = useMemo(() => {
    const positions = new Float32Array(COUNT * 3)
    const velocities = new Float32Array(COUNT * 3)
    const phases = new Float32Array(COUNT)
    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 12
      positions[i * 3 + 1] = Math.random() * 6 + 0.5
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10
      velocities[i * 3]     = (Math.random() - 0.5) * 0.008
      velocities[i * 3 + 1] = Math.random() * 0.006 + 0.002
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.006
      phases[i] = Math.random() * Math.PI * 2
    }
    return { positions, velocities, phases }
  }, [])

  const posRef = useRef(positions.slice())

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh) return
    const arr = (mesh.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3]     += velocities[i * 3]
      arr[i * 3 + 1] += velocities[i * 3 + 1]
      arr[i * 3 + 2] += velocities[i * 3 + 2]
      // Reset when too high or out of range
      if (arr[i * 3 + 1] > 8) {
        arr[i * 3 + 1] = 0.5
        arr[i * 3]     = (Math.random() - 0.5) * 12
        arr[i * 3 + 2] = (Math.random() - 0.5) * 10
      }
    }
    mesh.geometry.attributes.position.needsUpdate = true
  })

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#ffe8c0"
        size={0.04}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  )
}
