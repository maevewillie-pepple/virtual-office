import React from 'react'
import { useRef } from 'react'
import * as THREE from 'three'
import { useHelper } from '@react-three/drei'

export default function LightingSetup() {
  return (
    <>
      {/* Warm ambient fill */}
      <ambientLight color="#f5e0c0" intensity={0.6} />

      {/* Main golden-hour sun — comes from upper-left through the windows */}
      <directionalLight
        color="#ffbb55"
        intensity={4.2}
        position={[-9, 16, 8]}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={16}
        shadow-camera-bottom={-16}
        shadow-camera-near={0.5}
        shadow-camera-far={60}
        shadow-bias={-0.001}
        shadow-normalBias={0.02}
      />

      {/* Warm fill from the right side */}
      <directionalLight
        color="#e8c98a"
        intensity={0.8}
        position={[10, 8, -4]}
        castShadow={false}
      />

      {/* Cool bounce from below / floor */}
      <hemisphereLight
        color="#fde8c8"
        groundColor="#c8a87a"
        intensity={0.4}
      />

      {/* Mezzanine accent — warm desk lamp feel */}
      <pointLight color="#ffaa44" intensity={1.2} position={[4, 4, -2]} distance={8} decay={2} />

      {/* Lower lounge accent */}
      <pointLight color="#ff9955" intensity={0.8} position={[-3, 2, 3]} distance={6} decay={2} />
    </>
  )
}
