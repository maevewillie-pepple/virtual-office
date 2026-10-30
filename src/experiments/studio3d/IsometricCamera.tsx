import React, { useRef, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface Props {
  resetSignal: number
}

const ISO_ANGLE = Math.PI / 5   // ~36° elevation
const ISO_YAW   = -Math.PI / 4  // 45° azimuth
const DIST      = 22

function isoPosition(): THREE.Vector3 {
  const x = DIST * Math.cos(ISO_ANGLE) * Math.sin(ISO_YAW)
  const y = DIST * Math.sin(ISO_ANGLE)
  const z = DIST * Math.cos(ISO_ANGLE) * Math.cos(ISO_YAW)
  return new THREE.Vector3(x, y, z)
}

export default function IsometricCamera({ resetSignal }: Props) {
  const { camera } = useThree()

  useEffect(() => {
    const pos = isoPosition()
    camera.position.copy(pos)
    camera.lookAt(0, 1, 0)
    camera.updateProjectionMatrix()
  }, [camera, resetSignal])

  return null
}
