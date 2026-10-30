import * as THREE from 'three'

// Warm oak floor
export const oakFloor = new THREE.MeshStandardMaterial({
  color: '#c8965a',
  roughness: 0.55,
  metalness: 0.0,
})

// Lighter oak for mezzanine/stairs
export const oakLight = new THREE.MeshStandardMaterial({
  color: '#d4a870',
  roughness: 0.6,
  metalness: 0.0,
})

// Dark oak for trim / railings
export const oakDark = new THREE.MeshStandardMaterial({
  color: '#8b5e3c',
  roughness: 0.65,
  metalness: 0.0,
})

// Off-white plaster wall
export const wall = new THREE.MeshStandardMaterial({
  color: '#f0e8d8',
  roughness: 0.9,
  metalness: 0.0,
})

// Window glass — light teal tint
export const glass = new THREE.MeshStandardMaterial({
  color: '#b8d4e0',
  roughness: 0.05,
  metalness: 0.1,
  transparent: true,
  opacity: 0.25,
  side: THREE.DoubleSide,
})

// Window frame (cream/white)
export const windowFrame = new THREE.MeshStandardMaterial({
  color: '#e8e0d0',
  roughness: 0.7,
  metalness: 0.0,
})

// Fabric sofa (warm sage)
export const fabricSage = new THREE.MeshStandardMaterial({
  color: '#8aaa8a',
  roughness: 0.9,
  metalness: 0.0,
})

// Fabric dusty pink
export const fabricPink = new THREE.MeshStandardMaterial({
  color: '#c8a898',
  roughness: 0.9,
  metalness: 0.0,
})

// Rug — warm rust
export const rug = new THREE.MeshStandardMaterial({
  color: '#c07040',
  roughness: 1.0,
  metalness: 0.0,
})

// Desk surface
export const deskSurface = new THREE.MeshStandardMaterial({
  color: '#b87d50',
  roughness: 0.6,
  metalness: 0.0,
})

// Monitor bezel dark
export const monitorBezel = new THREE.MeshStandardMaterial({
  color: '#2a2a2a',
  roughness: 0.4,
  metalness: 0.3,
})

// Monitor screen (emissive)
export const monitorScreen = new THREE.MeshStandardMaterial({
  color: '#1a2a3a',
  emissive: '#1a4a8a',
  emissiveIntensity: 0.6,
  roughness: 0.1,
  metalness: 0.0,
})

// Plant leaves — two tones
export const leafGreen = new THREE.MeshStandardMaterial({
  color: '#5a8a50',
  roughness: 0.9,
  metalness: 0.0,
})
export const leafDark = new THREE.MeshStandardMaterial({
  color: '#3d6040',
  roughness: 0.9,
  metalness: 0.0,
})

// Terracotta pot
export const pot = new THREE.MeshStandardMaterial({
  color: '#c06040',
  roughness: 0.8,
  metalness: 0.0,
})

// Book spines
export const bookRed   = new THREE.MeshStandardMaterial({ color: '#b04040', roughness: 0.8 })
export const bookBlue  = new THREE.MeshStandardMaterial({ color: '#4060a0', roughness: 0.8 })
export const bookGreen = new THREE.MeshStandardMaterial({ color: '#408050', roughness: 0.8 })
export const bookCream = new THREE.MeshStandardMaterial({ color: '#d8cc9a', roughness: 0.8 })
export const bookOrange= new THREE.MeshStandardMaterial({ color: '#d08040', roughness: 0.8 })

// Shelf wood
export const shelf = new THREE.MeshStandardMaterial({
  color: '#a07040',
  roughness: 0.7,
  metalness: 0.0,
})

// Coffee machine
export const coffeeMetal = new THREE.MeshStandardMaterial({
  color: '#4a3828',
  roughness: 0.4,
  metalness: 0.5,
})

// Stair railing metal
export const railMetal = new THREE.MeshStandardMaterial({
  color: '#5a4a38',
  roughness: 0.5,
  metalness: 0.6,
})

// Chair seat
export const chairSeat = new THREE.MeshStandardMaterial({
  color: '#c0b090',
  roughness: 0.85,
  metalness: 0.0,
})

// Char metal legs
export const chairLeg = new THREE.MeshStandardMaterial({
  color: '#808080',
  roughness: 0.5,
  metalness: 0.7,
})

// Character skin
export const skin = new THREE.MeshStandardMaterial({
  color: '#e8b888',
  roughness: 0.8,
  metalness: 0.0,
})
export const skinDark = new THREE.MeshStandardMaterial({
  color: '#7a4030',
  roughness: 0.8,
  metalness: 0.0,
})

// Character hair
export const hairDark = new THREE.MeshStandardMaterial({ color: '#1a0e08', roughness: 0.9 })
export const hairBrown = new THREE.MeshStandardMaterial({ color: '#5a3018', roughness: 0.9 })

// Character clothing
export const shirtWhite = new THREE.MeshStandardMaterial({ color: '#f0ece4', roughness: 0.9 })
export const pantsBlue  = new THREE.MeshStandardMaterial({ color: '#3a5070', roughness: 0.85 })

// Coffee table
export const coffeeTable = new THREE.MeshStandardMaterial({
  color: '#9a6c40',
  roughness: 0.65,
  metalness: 0.0,
})

// Mug ceramic
export const ceramic = new THREE.MeshStandardMaterial({
  color: '#e8e0d0',
  roughness: 0.7,
  metalness: 0.0,
})
