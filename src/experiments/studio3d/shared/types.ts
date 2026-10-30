import type * as THREE from 'three'

export interface DeskConfig {
  id: string
  position: [number, number, number]
  rotation?: number
}

export interface WalkableBounds {
  xMin: number
  xMax: number
  zMin: number
  zMax: number
  y?: number
}

export interface PointLightConfig {
  color: string
  intensity: number
  position: [number, number, number]
  distance?: number
}

export interface LightingConfig {
  ambientColor: string
  ambientIntensity: number
  sunColor: string
  sunIntensity: number
  sunPosition: [number, number, number]
  shadowMapSize?: number
  fillColor?: string
  fillIntensity?: number
  hemiSkyColor?: string
  hemiGroundColor?: string
  hemiIntensity?: number
  pointLights?: PointLightConfig[]
}

export interface OfficeConfig {
  id: string
  name: string
  tagline: string
  emoji: string
  bgColor: string
  fogNear: number
  fogFar: number
  spawnPosition: [number, number, number]
  cameraTarget: [number, number, number]
  cameraZoom: number
  desks: DeskConfig[]
  walkableBounds: WalkableBounds[]
  lighting: LightingConfig
}

export interface OfficeSceneProps {
  claimedDesks: Record<string, string>
  onDeskClaim: (deskId: string) => void
  onFloorClick: (x: number, z: number, y?: number) => void
}
