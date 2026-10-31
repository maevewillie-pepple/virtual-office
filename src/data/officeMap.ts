import type { OfficeMap, OfficeArtTheme, OfficeTheme, Tile, TileType, InteractableObject } from '../types'
import { collectInteractables } from '../utils/interactions'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isWalkable(type: TileType): boolean {
  return type !== 'wall' && type !== 'bookshelf' && type !== 'desk' &&
    type !== 'sofa_h' && type !== 'sofa_v' && type !== 'coffee_machine' &&
    type !== 'plant_small' && type !== 'plant_large' && type !== 'plant_flowers' &&
    type !== 'whiteboard' && type !== 'game_table' && type !== 'meeting_table' &&
    type !== 'pool_table' && type !== 'arcade_machine' && type !== 'fireplace' &&
    type !== 'server_rack' && type !== 'fridge' && type !== 'kettle' &&
    type !== 'counter' && type !== 'focus_pod' && type !== 'stairs' &&
    type !== 'window_h' && type !== 'window_v'
}

type FurnitureEntry = [number, number, TileType, boolean, ('n' | 's')?]

const FLOOR_TYPES = new Set<TileType>([
  'floor_oak', 'floor_carpet_blue', 'floor_carpet_teal', 'floor_tile',
  'floor_stone', 'floor_wood_light', 'floor_grass', 'floor_concrete',
])

function applyFurniture(grid: Tile[][], furniture: FurnitureEntry[]) {
  const rows = grid.length, cols = grid[0].length
  for (const [row, col, type, walkable, facing] of furniture) {
    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      const prev = grid[row][col]
      const base = FLOOR_TYPES.has(prev.type) ? prev.type : prev.base
      grid[row][col] = {
        type,
        walkable,
        ...(base ? { base } : {}),
        ...(facing ? { facing } : {}),
      }
    }
  }
}

/** Exterior windows only. Interior walls, doors and furniture stay put. */
function addExteriorWindows(grid: Tile[][], theme: OfficeArtTheme) {
  const rows = grid.length, cols = grid[0].length
  const step = theme === 'loft' || theme === 'studio' ? 1 : theme === 'lab' ? 3 : 2
  for (let c = 1; c < cols - 1; c += step) {
    if (grid[0][c].type === 'wall') grid[0][c] = { type: 'window_h', walkable: false }
    if (grid[rows - 1][c].type === 'wall') grid[rows - 1][c] = { type: 'window_h', walkable: false }
  }
  for (let r = 1; r < rows - 1; r += step) {
    if (grid[r][0].type === 'wall') grid[r][0] = { type: 'window_v', walkable: false }
    if (grid[r][cols - 1].type === 'wall') grid[r][cols - 1] = { type: 'window_v', walkable: false }
  }
}

function makeGrid(h: number, w: number, fill: TileType = 'wall'): Tile[][] {
  return Array.from({ length: h }, () =>
    Array.from({ length: w }, () => ({ type: fill, walkable: fill !== 'wall' }))
  )
}

function fillRect(grid: Tile[][], r1: number, c1: number, r2: number, c2: number, type: TileType) {
  const walkable = isWalkable(type)
  const rows = grid.length, cols = grid[0].length
  for (let r = r1; r <= r2; r++) {
    for (let c = c1; c <= c2; c++) {
      if (r >= 0 && r < rows && c >= 0 && c < cols) {
        grid[r][c] = { type, walkable }
      }
    }
  }
}

function setTile(grid: Tile[][], r: number, c: number, type: TileType, walkable?: boolean) {
  const rows = grid.length, cols = grid[0].length
  if (r >= 0 && r < rows && c >= 0 && c < cols) {
    grid[r][c] = { type, walkable: walkable ?? isWalkable(type) }
  }
}

// ─── Office design presets ────────────────────────────────────────────────────

export type OfficeDesignId = 'classic' | 'library' | 'loft' | 'studio' | 'lab'

export interface OfficeDesign {
  id: OfficeDesignId
  name: string
  emoji: string
  desc: string
  build: () => OfficeMap
}

// ── Design 1: Classic Office ─────────────────────────────────────────────────
// 6 rooms: Workspace · Meeting Room · Focus Room · Lounge · Kitchen · Games Room
function buildClassic(): OfficeMap {
  const H = 24, W = 32
  const grid = makeGrid(H, W, 'wall')

  // ── Room floors ──
  fillRect(grid, 1, 1, 10, 15, 'floor_oak')    // Workspace
  fillRect(grid, 1, 17, 10, 24, 'floor_oak')   // Meeting Room
  fillRect(grid, 1, 26, 10, 30, 'floor_oak')   // Focus Room
  fillRect(grid, 12, 1, 22, 10, 'floor_carpet_blue')  // Lounge
  fillRect(grid, 12, 12, 22, 21, 'floor_tile') // Kitchen
  fillRect(grid, 12, 23, 22, 30, 'floor_carpet_teal') // Games Room

  // ── Doors ──
  // Workspace ↔ Meeting (col 16, rows 5–6)
  setTile(grid, 5, 16, 'door'); setTile(grid, 6, 16, 'door')
  // Meeting ↔ Focus (col 25, rows 5–6)
  setTile(grid, 5, 25, 'door'); setTile(grid, 6, 25, 'door')
  // Workspace ↔ Lounge (row 11, cols 6–7)
  setTile(grid, 11, 6, 'door'); setTile(grid, 11, 7, 'door')
  // Meeting ↔ Kitchen (row 11, cols 18–19)
  setTile(grid, 11, 18, 'door'); setTile(grid, 11, 19, 'door')
  // Focus ↔ Games (row 11, cols 27–28)
  setTile(grid, 11, 27, 'door'); setTile(grid, 11, 28, 'door')
  // Lounge ↔ Kitchen (col 11, rows 16–17)
  setTile(grid, 16, 11, 'door'); setTile(grid, 17, 11, 'door')
  // Kitchen ↔ Games (col 22, rows 16–17)
  setTile(grid, 16, 22, 'door'); setTile(grid, 17, 22, 'door')

  // ── Furniture overlays ──
  applyFurniture(grid, [
    // Workspace: two face-to-face benches, plus one shared pair
    [1, 1, 'bookshelf', false], [1, 2, 'bookshelf', false], [1, 3, 'bookshelf', false], [1, 4, 'bookshelf', false],
    [3, 2, 'chair', true, 's'], [3, 3, 'chair', true, 's'],
    [4, 2, 'desk', false, 's'], [4, 3, 'desk', false, 's'],
    [5, 2, 'desk', false], [5, 3, 'desk', false],
    [6, 2, 'chair', true], [6, 3, 'chair', true],
    [3, 6, 'chair', true, 's'], [3, 7, 'chair', true, 's'],
    [4, 6, 'desk', false, 's'], [4, 7, 'desk', false, 's'],
    [5, 6, 'desk', false], [5, 7, 'desk', false],
    [6, 6, 'chair', true], [6, 7, 'chair', true],
    [3, 11, 'chair', true, 's'],
    [4, 11, 'desk', false, 's'],
    [1, 13, 'plant_large', false], [10, 14, 'plant_small', false],
    [4, 13, 'lamp', false], [7, 13, 'lamp', false],
    [10, 1, 'whiteboard', false], [10, 2, 'whiteboard', false],

    // Meeting Room: big table with chairs around
    [2, 18, 'meeting_table', false], [2, 19, 'meeting_table', false], [2, 20, 'meeting_table', false],
    [3, 18, 'meeting_table', false], [3, 19, 'meeting_table', false], [3, 20, 'meeting_table', false],
    [4, 18, 'meeting_table', false], [4, 19, 'meeting_table', false], [4, 20, 'meeting_table', false],
    [2, 17, 'chair', true], [3, 17, 'chair', true], [4, 17, 'chair', true], // Left chairs
    [2, 21, 'chair', true], [3, 21, 'chair', true], [4, 21, 'chair', true], // Right chairs
    [1, 18, 'chair', true], [1, 19, 'chair', true], [1, 20, 'chair', true], // Top chairs
    [5, 18, 'chair', true], [5, 19, 'chair', true], [5, 20, 'chair', true], // Bottom chairs
    [6, 22, 'whiteboard', false], [7, 22, 'whiteboard', false], [8, 22, 'whiteboard', false],
    [9, 17, 'plant_large', false],
    [1, 22, 'window_v', false], [1, 23, 'window_v', false],
    [9, 23, 'window_v', false],

    // Focus Room: individual focus pods (col 26 rows 5-6 left clear for door at col 25)
    [2, 26, 'focus_pod', false], [2, 27, 'focus_pod', false],
    [5, 28, 'focus_pod', false], [5, 29, 'focus_pod', false],
    [8, 26, 'focus_pod', false], [8, 27, 'focus_pod', false],
    [1, 28, 'plant_flowers', false], [1, 29, 'plant_flowers', false],
    [9, 29, 'plant_small', false],

    // Lounge: sofas, coffee table, fireplace
    [12, 1, 'plant_large', false],
    [13, 2, 'sofa_h', false], [13, 3, 'sofa_h', false], [13, 4, 'sofa_h', false],
    [16, 2, 'sofa_v', false], [17, 2, 'sofa_v', false],
    [15, 3, 'coffee_table', true], [15, 4, 'coffee_table', true],
    [15, 6, 'rug', true], [16, 6, 'rug', true],
    [18, 1, 'fireplace', false], [18, 2, 'fireplace', false],
    [20, 1, 'plant_small', false], [22, 8, 'plant_small', false],
    [14, 8, 'sofa_h', false], [14, 9, 'sofa_h', false], [14, 10, 'sofa_h', false],
    [15, 10, 'coffee_table', true],

    // Kitchen: counter, coffee machine, fridge, kettle
    // cols 18-19 left clear (door approach from row 11 door)
    [12, 12, 'counter', false], [12, 13, 'counter', false], [12, 14, 'counter', false],
    [12, 15, 'counter', false], [12, 16, 'counter', false], [12, 17, 'counter', false],
    [12, 20, 'coffee_machine', false],
    [12, 21, 'fridge', false],
    [13, 12, 'bar_stool', true], [13, 14, 'bar_stool', true], [13, 16, 'bar_stool', true],
    [15, 14, 'kettle', true],
    [19, 13, 'sofa_h', false], [19, 14, 'sofa_h', false],
    [21, 13, 'coffee_table', true], [21, 14, 'coffee_table', true],
    [22, 12, 'plant_flowers', false], [22, 21, 'plant_flowers', false],
    [17, 19, 'lamp', false],

    // Games Room: game table, pool table, arcade
    [12, 23, 'bookshelf', false], [12, 24, 'bookshelf', false],
    [13, 24, 'game_table', false], [13, 25, 'game_table', false],
    [13, 26, 'game_table', false], [13, 27, 'game_table', false],
    [16, 24, 'pool_table', false], [16, 25, 'pool_table', false],
    [17, 24, 'pool_table', false], [17, 25, 'pool_table', false],
    [19, 27, 'arcade_machine', false], [20, 27, 'arcade_machine', false],
    [13, 28, 'sofa_h', false], [13, 29, 'sofa_h', false],
    [12, 30, 'plant_large', false], [22, 23, 'plant_small', false],
    [21, 29, 'lamp', false],
    [1, 30, 'window_v', false],
  ])

  const desks = [
    { id: 'desk_1', label: 'A1', gridX: 2, gridY: 4, ownerId: 'demo_current', ownerName: 'You', isAvailable: false },
    { id: 'desk_2', label: 'A2', gridX: 3, gridY: 4, ownerId: 'demo_1', ownerName: 'Mia Chen', isAvailable: false },
    { id: 'desk_3', label: 'A3', gridX: 2, gridY: 5, ownerId: 'demo_2', ownerName: 'Rowan Ellis', isAvailable: false },
    { id: 'desk_4', label: 'A4', gridX: 3, gridY: 5, ownerId: 'demo_3', ownerName: 'Priya Nair', isAvailable: false },
    { id: 'desk_5', label: 'B1', gridX: 6, gridY: 4, ownerId: 'demo_5', ownerName: 'Jordan Blake', isAvailable: false },
    { id: 'desk_6', label: 'B2', gridX: 7, gridY: 4, isAvailable: true },
    { id: 'desk_7', label: 'B3', gridX: 6, gridY: 5, isAvailable: true },
    { id: 'desk_8', label: 'B4', gridX: 7, gridY: 5, isAvailable: true },
    { id: 'desk_9', label: 'C1', gridX: 11, gridY: 4, isAvailable: true },
  ]

  const interactables: InteractableObject[] = collectInteractables(grid, desks, 'classic')

  addExteriorWindows(grid, 'classic')
  return {
    theme: 'classic',
    width: W, height: H, tileSize: 48, tiles: grid, desks,
    spawnPoints: [{ x: 8, y: 3 }, { x: 10, y: 6 }, { x: 5, y: 10 }],
    interactables,
    areaLabels: [
      { text: 'WORKSPACE', gridX: 7, gridY: 1 },
      { text: 'MEETING', gridX: 20, gridY: 1 },
      { text: 'FOCUS', gridX: 28, gridY: 1 },
      { text: 'LOUNGE', gridX: 5, gridY: 12 },
      { text: 'KITCHEN', gridX: 16, gridY: 12 },
      { text: 'GAMES ROOM', gridX: 26, gridY: 12 },
    ],
  }
}

// ── Design 2: Cozy Library ────────────────────────────────────────────────────
// 6 rooms: Reading Hall · Study Alcoves · Tea Corner · Reading Nook · Rare Books · Gallery
function buildLibrary(): OfficeMap {
  const H = 22, W = 26
  const grid = makeGrid(H, W, 'wall')

  // ── Room floors (stone base) ──
  fillRect(grid, 1, 1, 11, 15, 'floor_stone')  // Reading Hall
  fillRect(grid, 1, 17, 11, 24, 'floor_stone') // Study Alcoves
  fillRect(grid, 13, 1, 20, 8, 'floor_carpet_blue')   // Tea Corner
  fillRect(grid, 13, 10, 20, 17, 'floor_stone') // Reading Nook
  fillRect(grid, 13, 19, 20, 24, 'floor_stone') // Rare Books

  // ── Doors ──
  setTile(grid, 5, 16, 'door'); setTile(grid, 6, 16, 'door')   // Reading Hall ↔ Study
  setTile(grid, 12, 5, 'door'); setTile(grid, 12, 6, 'door')   // Reading Hall → Tea Corner
  setTile(grid, 12, 12, 'door'); setTile(grid, 12, 13, 'door') // Study → Reading Nook
  setTile(grid, 12, 21, 'door'); setTile(grid, 12, 22, 'door') // Study → Rare Books
  setTile(grid, 16, 9, 'door'); setTile(grid, 17, 9, 'door')   // Tea Corner ↔ Reading Nook
  setTile(grid, 16, 18, 'door'); setTile(grid, 17, 18, 'door') // Reading Nook ↔ Rare Books

  // ── Furniture ──
  applyFurniture(grid, [
    // Reading Hall: wall-to-wall bookshelves + reading tables
    [1, 1, 'bookshelf', false], [1, 2, 'bookshelf', false], [1, 3, 'bookshelf', false],
    [1, 4, 'bookshelf', false], [1, 5, 'bookshelf', false], [1, 6, 'bookshelf', false],
    [1, 7, 'bookshelf', false], [1, 8, 'bookshelf', false], [1, 9, 'bookshelf', false],
    [1, 10, 'bookshelf', false], [1, 11, 'bookshelf', false], [1, 12, 'bookshelf', false],
    [1, 14, 'bookshelf', false],
    [2, 1, 'bookshelf', false], [3, 1, 'bookshelf', false], [4, 1, 'bookshelf', false],
    [5, 1, 'bookshelf', false], [6, 1, 'bookshelf', false], [7, 1, 'bookshelf', false],
    [8, 1, 'bookshelf', false], [9, 1, 'bookshelf', false], [10, 1, 'bookshelf', false],
    [2, 14, 'bookshelf', false], [3, 14, 'bookshelf', false], [4, 14, 'bookshelf', false],
    [5, 14, 'bookshelf', false], [6, 14, 'bookshelf', false],
    // Reading tables — shared benches down the hall
    [3, 5, 'chair', true, 's'], [3, 6, 'chair', true, 's'],
    [4, 5, 'desk', false, 's'], [4, 6, 'desk', false, 's'],
    [5, 5, 'desk', false], [5, 6, 'desk', false],
    [6, 5, 'chair', true], [6, 6, 'chair', true],
    [3, 9, 'chair', true, 's'],
    [4, 9, 'desk', false, 's'],
    [5, 9, 'desk', false],
    [6, 9, 'chair', true],
    [10, 12, 'plant_large', false],
    [7, 12, 'lamp', false], [4, 12, 'lamp', false],
    [10, 4, 'rug', true], [10, 7, 'rug', true],

    // Study Alcoves: individual desks
    // NOTE: col-17 bookshelves stop at row 4 to keep door (5,16)-(6,16) approach clear
    [1, 17, 'bookshelf', false], [1, 18, 'bookshelf', false], [1, 19, 'bookshelf', false],
    [1, 20, 'bookshelf', false], [1, 21, 'bookshelf', false], [1, 22, 'bookshelf', false], [1, 24, 'bookshelf', false],
    [2, 17, 'bookshelf', false], [3, 17, 'bookshelf', false], [4, 17, 'bookshelf', false],
    // rows 5-6 at col 17 left clear (door approach)
    [7, 17, 'bookshelf', false],
    [2, 24, 'bookshelf', false], [3, 24, 'bookshelf', false], [4, 24, 'bookshelf', false],
    [5, 24, 'bookshelf', false], [6, 24, 'bookshelf', false], [7, 24, 'bookshelf', false],
    [3, 19, 'chair', true, 's'], [3, 20, 'chair', true, 's'],
    [4, 19, 'desk', false, 's'], [4, 20, 'desk', false, 's'],
    [10, 19, 'plant_small', false], [10, 22, 'plant_small', false],
    [7, 23, 'lamp', false],

    // Tea Corner: fireplace + arm chairs
    [13, 1, 'plant_large', false], [20, 1, 'plant_large', false],
    [14, 2, 'sofa_h', false], [14, 3, 'sofa_h', false], [14, 4, 'sofa_h', false],
    [17, 2, 'sofa_v', false], [18, 2, 'sofa_v', false],
    [16, 3, 'coffee_table', true], [16, 4, 'coffee_table', true],
    [16, 6, 'rug', true], [17, 6, 'rug', true],
    [19, 6, 'fireplace', false], [19, 7, 'fireplace', false],
    [13, 6, 'kettle', true],
    [20, 8, 'plant_flowers', false],

    // Reading Nook: cosy seating
    // (13,12) left clear — exit for door at (12,12)-(12,13))
    [13, 10, 'bookshelf', false], [13, 11, 'bookshelf', false],
    [14, 10, 'sofa_h', false], [14, 11, 'sofa_h', false], [14, 12, 'sofa_h', false],
    [17, 10, 'sofa_v', false], [18, 10, 'sofa_v', false],
    [16, 12, 'coffee_table', true], [16, 13, 'coffee_table', true],
    [16, 15, 'rug', true], [17, 15, 'rug', true],
    [19, 15, 'plant_flowers', false], [20, 17, 'plant_small', false],
    [14, 15, 'lamp', false],

    // Rare Books: dark corner with special shelves
    // (13,21)-(13,22) clear — exit for door at (12,21)-(12,22)
    // (16,19)-(17,19) clear — approach to door at (16,18)-(17,18)
    [13, 19, 'bookshelf', false], [13, 20, 'bookshelf', false],
    [13, 23, 'bookshelf', false], [13, 24, 'bookshelf', false],
    [14, 24, 'bookshelf', false], [15, 24, 'bookshelf', false], [16, 24, 'bookshelf', false],
    [17, 24, 'bookshelf', false], [18, 24, 'bookshelf', false], [19, 24, 'bookshelf', false],
    [14, 19, 'bookshelf', false], [15, 19, 'bookshelf', false],
    [18, 19, 'bookshelf', false],
    [15, 21, 'chair', true, 's'],
    [16, 21, 'desk', false, 's'],
    [20, 22, 'lamp', false], [20, 24, 'plant_small', false],
  ])

  const desks = [
    { id: 'desk_1', label: 'A1', gridX: 5, gridY: 4, ownerId: 'demo_current', ownerName: 'You', isAvailable: false },
    { id: 'desk_2', label: 'A2', gridX: 6, gridY: 4, ownerId: 'demo_1', ownerName: 'Mia Chen', isAvailable: false },
    { id: 'desk_3', label: 'A3', gridX: 5, gridY: 5, ownerId: 'demo_2', ownerName: 'Rowan Ellis', isAvailable: false },
    { id: 'desk_4', label: 'B1', gridX: 6, gridY: 5, ownerId: 'demo_3', ownerName: 'Priya Nair', isAvailable: false },
    { id: 'desk_5', label: 'B2', gridX: 9, gridY: 4, ownerId: 'demo_5', ownerName: 'Jordan Blake', isAvailable: false },
    { id: 'desk_6', label: 'B3', gridX: 9, gridY: 5, isAvailable: true },
    { id: 'desk_7', label: 'C1', gridX: 19, gridY: 4, isAvailable: true },
    { id: 'desk_8', label: 'C2', gridX: 20, gridY: 4, isAvailable: true },
    { id: 'desk_9', label: 'C3', gridX: 21, gridY: 16, isAvailable: true },
  ]

  const interactables: InteractableObject[] = collectInteractables(grid, desks, 'library')

  addExteriorWindows(grid, 'library')
  return {
    theme: 'library',
    width: W, height: H, tileSize: 48, tiles: grid, desks,
    spawnPoints: [{ x: 7, y: 4 }, { x: 11, y: 7 }, { x: 20, y: 4 }],
    interactables,
    areaLabels: [
      { text: 'READING HALL', gridX: 7, gridY: 1 },
      { text: 'STUDY ALCOVES', gridX: 20, gridY: 1 },
      { text: 'TEA CORNER', gridX: 4, gridY: 13 },
      { text: 'READING NOOK', gridX: 13, gridY: 13 },
      { text: 'RARE BOOKS', gridX: 21, gridY: 13 },
    ],
  }
}

// ── Design 3: Open Loft ───────────────────────────────────────────────────────
// 5 zones on light wood: Desks · Creative · Collab Nook · Kitchen Corner · Lounge
function buildLoft(): OfficeMap {
  const H = 20, W = 28
  const grid = makeGrid(H, W, 'wall')

  // ── Room floors ──
  fillRect(grid, 1, 1, 10, 16, 'floor_wood_light')  // Main workspace
  fillRect(grid, 1, 18, 10, 26, 'floor_wood_light') // Creative area
  fillRect(grid, 12, 1, 18, 10, 'floor_wood_light') // Lounge nook
  fillRect(grid, 12, 12, 18, 19, 'floor_carpet_blue')  // Kitchen corner
  fillRect(grid, 12, 21, 18, 26, 'floor_carpet_teal')  // Games + meeting

  // ── Doors ──
  setTile(grid, 5, 17, 'door'); setTile(grid, 6, 17, 'door')   // Main ↔ Creative
  setTile(grid, 11, 5, 'door'); setTile(grid, 11, 6, 'door')   // Main → Lounge
  setTile(grid, 11, 14, 'door'); setTile(grid, 11, 15, 'door') // Main → Kitchen
  setTile(grid, 11, 23, 'door'); setTile(grid, 11, 24, 'door') // Creative → Games
  setTile(grid, 15, 11, 'door'); setTile(grid, 16, 11, 'door') // Lounge ↔ Kitchen
  setTile(grid, 15, 20, 'door'); setTile(grid, 16, 20, 'door') // Kitchen ↔ Games

  // ── Furniture ──
  applyFurniture(grid, [
    // Main Workspace: face-to-face benches
    [1, 1, 'window_h', false], [1, 5, 'window_h', false], [1, 9, 'window_h', false], [1, 13, 'window_h', false],
    [3, 2, 'chair', true, 's'], [3, 3, 'chair', true, 's'],
    [4, 2, 'desk', false, 's'], [4, 3, 'desk', false, 's'],
    [5, 2, 'desk', false], [5, 3, 'desk', false],
    [6, 2, 'chair', true], [6, 3, 'chair', true],
    [3, 11, 'chair', true, 's'],
    [4, 11, 'desk', false, 's'],
    [5, 11, 'desk', false],
    [6, 11, 'chair', true],
    // (10,14) moved away — it blocked approach to door at (11,14)-(11,15)
    [10, 1, 'plant_large', false], [10, 12, 'plant_large', false],
    [4, 15, 'lamp', false], [7, 15, 'lamp', false],

    // Creative Area: whiteboard + collab seating
    [1, 18, 'window_v', false], [1, 19, 'window_v', false], [1, 20, 'window_v', false],
    [2, 18, 'whiteboard', false], [2, 19, 'whiteboard', false], [2, 20, 'whiteboard', false],
    [3, 18, 'whiteboard', false], [3, 19, 'whiteboard', false],
    [4, 20, 'sofa_h', false], [4, 21, 'sofa_h', false], [4, 22, 'sofa_h', false],
    [7, 20, 'sofa_v', false], [8, 20, 'sofa_v', false],
    [6, 21, 'coffee_table', true], [6, 22, 'coffee_table', true],
    [6, 23, 'rug', true], [7, 23, 'rug', true],
    [2, 24, 'chair', true, 's'], [2, 25, 'chair', true, 's'],
    [3, 24, 'desk', false, 's'], [3, 25, 'desk', false, 's'],
    [9, 24, 'plant_large', false], [9, 26, 'plant_flowers', false],
    [1, 25, 'bookshelf', false], [1, 26, 'bookshelf', false],
    [10, 18, 'plant_small', false],

    // Lounge Nook: exposed industrial feel
    [12, 1, 'plant_large', false], [18, 10, 'plant_small', false],
    [13, 2, 'sofa_h', false], [13, 3, 'sofa_h', false], [13, 4, 'sofa_h', false],
    [16, 2, 'sofa_v', false], [17, 2, 'sofa_v', false],
    [15, 4, 'coffee_table', true], [15, 5, 'coffee_table', true],
    [15, 7, 'rug', true], [16, 7, 'rug', true],
    [13, 8, 'game_table', false], [13, 9, 'game_table', false],
    [14, 8, 'game_table', false], [14, 9, 'game_table', false],
    [17, 7, 'lamp', false],

    // Kitchen Corner: counter + stools
    // (12,14)-(12,15) left clear — exit for door at (11,14)-(11,15)
    [12, 12, 'counter', false], [12, 13, 'counter', false],
    [12, 16, 'counter', false],
    [12, 17, 'coffee_machine', false], [12, 18, 'coffee_machine', false],
    [13, 12, 'bar_stool', true], [13, 14, 'bar_stool', true], [13, 16, 'bar_stool', true],
    [14, 13, 'fridge', false], [14, 14, 'fridge', false],
    [16, 13, 'kettle', true],
    [18, 12, 'plant_flowers', false], [18, 19, 'plant_small', false],
    [17, 17, 'lamp', false],

    // Games / Meeting zone
    [12, 21, 'bookshelf', false], [12, 22, 'bookshelf', false],
    [13, 22, 'game_table', false], [13, 23, 'game_table', false],
    [13, 24, 'game_table', false], [13, 25, 'game_table', false],
    [16, 22, 'pool_table', false], [16, 23, 'pool_table', false],
    [17, 22, 'pool_table', false], [17, 23, 'pool_table', false],
    [14, 25, 'sofa_h', false], [14, 26, 'sofa_h', false],
    [18, 24, 'plant_small', false], [12, 26, 'plant_large', false],
    [18, 26, 'lamp', false],
  ])

  const desks = [
    { id: 'desk_1', label: 'A1', gridX: 2, gridY: 4, ownerId: 'demo_current', ownerName: 'You', isAvailable: false },
    { id: 'desk_2', label: 'A2', gridX: 3, gridY: 4, ownerId: 'demo_1', ownerName: 'Mia Chen', isAvailable: false },
    { id: 'desk_3', label: 'A3', gridX: 2, gridY: 5, ownerId: 'demo_2', ownerName: 'Rowan Ellis', isAvailable: false },
    { id: 'desk_4', label: 'B1', gridX: 11, gridY: 4, ownerId: 'demo_3', ownerName: 'Priya Nair', isAvailable: false },
    { id: 'desk_5', label: 'B2', gridX: 11, gridY: 5, ownerId: 'demo_5', ownerName: 'Jordan Blake', isAvailable: false },
    { id: 'desk_6', label: 'B3', gridX: 3, gridY: 5, isAvailable: true },
    { id: 'desk_7', label: 'C1', gridX: 24, gridY: 3, isAvailable: true },
    { id: 'desk_8', label: 'C2', gridX: 25, gridY: 3, isAvailable: true },
  ]

  const interactables: InteractableObject[] = collectInteractables(grid, desks, 'loft')

  addExteriorWindows(grid, 'loft')
  return {
    theme: 'loft',
    width: W, height: H, tileSize: 48, tiles: grid, desks,
    spawnPoints: [{ x: 8, y: 4 }, { x: 3, y: 8 }, { x: 22, y: 5 }],
    interactables,
    areaLabels: [
      { text: 'WORKSPACE', gridX: 7, gridY: 1 },
      { text: 'CREATIVE', gridX: 22, gridY: 1 },
      { text: 'LOUNGE', gridX: 5, gridY: 12 },
      { text: 'KITCHEN', gridX: 15, gridY: 12 },
      { text: 'GAMES', gridX: 23, gridY: 12 },
    ],
  }
}

// ── Design 4: Garden Studio ───────────────────────────────────────────────────
// 6 rooms on grass/oak: Upper Garden · Workshop · Focus · Collab Deck · Greenhouse · Break Room
function buildStudio(): OfficeMap {
  const H = 22, W = 28
  const grid = makeGrid(H, W, 'wall')

  // ── Room floors ──
  fillRect(grid, 1, 1, 9, 14, 'floor_grass')       // Upper Garden (collaborative)
  fillRect(grid, 1, 16, 9, 26, 'floor_grass')       // Greenhouse
  fillRect(grid, 11, 1, 20, 12, 'floor_oak')         // Focus Workspace
  fillRect(grid, 11, 14, 20, 20, 'floor_oak')        // Workshop
  fillRect(grid, 11, 22, 20, 26, 'floor_carpet_blue') // Break Room

  // ── Doors ──
  setTile(grid, 5, 15, 'door'); setTile(grid, 6, 15, 'door')    // Garden ↔ Greenhouse
  setTile(grid, 10, 5, 'door'); setTile(grid, 10, 6, 'door')    // Garden → Focus
  setTile(grid, 10, 17, 'door'); setTile(grid, 10, 18, 'door')  // Greenhouse → Workshop
  setTile(grid, 10, 23, 'door'); setTile(grid, 10, 24, 'door')  // Greenhouse → Break Room
  setTile(grid, 15, 13, 'door'); setTile(grid, 16, 13, 'door')  // Focus ↔ Workshop
  setTile(grid, 15, 21, 'door'); setTile(grid, 16, 21, 'door')  // Workshop ↔ Break Room

  // ── Furniture ──
  applyFurniture(grid, [
    // Upper Garden: collab seating, plants everywhere
    [1, 1, 'plant_large', false], [1, 5, 'plant_flowers', false], [1, 9, 'plant_flowers', false],
    [1, 13, 'plant_large', false], [4, 1, 'plant_flowers', false], [8, 1, 'plant_large', false],
    [8, 13, 'plant_small', false],
    [2, 3, 'sofa_h', false], [2, 4, 'sofa_h', false], [2, 5, 'sofa_h', false],
    [5, 3, 'sofa_v', false], [6, 3, 'sofa_v', false],
    [4, 5, 'coffee_table', true], [4, 6, 'coffee_table', true],
    [4, 8, 'rug', true], [5, 8, 'rug', true],
    [2, 8, 'whiteboard', false], [2, 9, 'whiteboard', false], [2, 10, 'whiteboard', false],
    [7, 7, 'sofa_h', false], [7, 8, 'sofa_h', false],
    [4, 11, 'game_table', false], [4, 12, 'game_table', false],
    [5, 11, 'game_table', false], [5, 12, 'game_table', false],
    [6, 10, 'plant_large', false],

    // Greenhouse: lush plants, few desks
    [1, 16, 'plant_large', false], [1, 18, 'plant_flowers', false], [1, 20, 'plant_large', false],
    [1, 22, 'plant_flowers', false], [1, 24, 'plant_large', false], [1, 26, 'plant_flowers', false],
    [3, 16, 'plant_small', false], [3, 20, 'plant_flowers', false], [3, 24, 'plant_small', false],
    // (6,16) moved — blocked door approach at (5,15)-(6,15) from Greenhouse side
    [6, 17, 'plant_large', false], [6, 20, 'plant_flowers', false], [6, 24, 'plant_large', false],
    [8, 16, 'plant_small', false], [8, 22, 'plant_flowers', false], [8, 26, 'plant_large', false],
    [3, 18, 'chair', true, 's'],
    [4, 18, 'desk', false, 's'],
    [5, 18, 'desk', false],
    [6, 18, 'chair', true],
    [5, 25, 'sofa_h', false], [5, 26, 'sofa_h', false],
    [6, 25, 'lamp', false],

    // Focus Workspace: shared benches
    [11, 1, 'plant_large', false], [20, 1, 'plant_small', false],
    [11, 11, 'plant_small', false],
    [13, 2, 'chair', true, 's'], [13, 3, 'chair', true, 's'],
    [14, 2, 'desk', false, 's'], [14, 3, 'desk', false, 's'],
    [15, 2, 'desk', false], [15, 3, 'desk', false],
    [16, 2, 'chair', true], [16, 3, 'chair', true],
    [13, 6, 'chair', true, 's'],
    [14, 6, 'desk', false, 's'],
    [15, 6, 'desk', false],
    [16, 6, 'chair', true],
    [18, 4, 'lamp', false], [18, 8, 'lamp', false],
    [20, 10, 'rug', true], [20, 11, 'rug', true],

    // Workshop: whiteboard + tables
    // (11,18) plant removed — blocked door exit at (10,17)-(10,18) into Workshop
    [11, 14, 'whiteboard', false], [11, 15, 'whiteboard', false], [11, 16, 'whiteboard', false],
    [12, 14, 'meeting_table', false], [12, 15, 'meeting_table', false], [12, 16, 'meeting_table', false],
    [13, 14, 'meeting_table', false], [13, 15, 'meeting_table', false], [13, 16, 'meeting_table', false],
    [12, 17, 'chair', true], [13, 17, 'chair', true], [14, 17, 'chair', true],
    [14, 14, 'chair', true], [15, 14, 'chair', true], [16, 14, 'chair', true],
    [15, 16, 'chair', true, 's'], [15, 17, 'chair', true, 's'],
    [16, 16, 'desk', false, 's'], [16, 17, 'desk', false, 's'],
    [17, 16, 'desk', false], [17, 17, 'desk', false],
    [18, 16, 'chair', true], [18, 17, 'chair', true],
    [20, 14, 'plant_large', false],
    [19, 18, 'lamp', false],

    // Break Room: cosy corner
    [11, 22, 'plant_large', false], [11, 26, 'plant_large', false],
    [12, 22, 'counter', false], [12, 23, 'counter', false], [12, 24, 'counter', false],
    [12, 25, 'coffee_machine', false], [12, 26, 'fridge', false],
    [13, 22, 'bar_stool', true], [13, 24, 'bar_stool', true],
    [15, 23, 'sofa_h', false], [15, 24, 'sofa_h', false], [15, 25, 'sofa_h', false],
    [18, 23, 'sofa_v', false], [19, 23, 'sofa_v', false],
    [17, 24, 'coffee_table', true], [17, 25, 'coffee_table', true],
    [17, 23, 'rug', true], [18, 23, 'rug', true],
    [20, 26, 'plant_flowers', false],
    [19, 26, 'lamp', false],
  ])

  const desks = [
    { id: 'desk_1', label: 'A1', gridX: 2, gridY: 14, ownerId: 'demo_current', ownerName: 'You', isAvailable: false },
    { id: 'desk_2', label: 'A2', gridX: 3, gridY: 14, ownerId: 'demo_1', ownerName: 'Mia Chen', isAvailable: false },
    { id: 'desk_3', label: 'A3', gridX: 2, gridY: 15, ownerId: 'demo_2', ownerName: 'Rowan Ellis', isAvailable: false },
    { id: 'desk_4', label: 'B1', gridX: 3, gridY: 15, ownerId: 'demo_3', ownerName: 'Priya Nair', isAvailable: false },
    { id: 'desk_5', label: 'B2', gridX: 6, gridY: 14, ownerId: 'demo_5', ownerName: 'Jordan Blake', isAvailable: false },
    { id: 'desk_6', label: 'B3', gridX: 6, gridY: 15, isAvailable: true },
    { id: 'desk_7', label: 'G1', gridX: 18, gridY: 4, isAvailable: true },
    { id: 'desk_8', label: 'G2', gridX: 18, gridY: 5, isAvailable: true },
  ]

  const interactables: InteractableObject[] = collectInteractables(grid, desks, 'studio')

  addExteriorWindows(grid, 'studio')
  return {
    theme: 'studio',
    width: W, height: H, tileSize: 48, tiles: grid, desks,
    spawnPoints: [{ x: 6, y: 3 }, { x: 7, y: 13 }, { x: 20, y: 5 }],
    interactables,
    areaLabels: [
      { text: 'GARDEN COLLAB', gridX: 6, gridY: 1 },
      { text: 'GREENHOUSE', gridX: 21, gridY: 1 },
      { text: 'FOCUS WORKSPACE', gridX: 5, gridY: 11 },
      { text: 'WORKSHOP', gridX: 17, gridY: 11 },
      { text: 'BREAK ROOM', gridX: 24, gridY: 11 },
    ],
  }
}

// ── Design 5: Tech Lab ────────────────────────────────────────────────────────
// 6 rooms on concrete: Main Lab · Server Room · Meeting Pod · Breakout · Hack Zone · Lounge
function buildLab(): OfficeMap {
  const H = 22, W = 30
  const grid = makeGrid(H, W, 'wall')

  // ── Room floors ──
  fillRect(grid, 1, 1, 10, 16, 'floor_concrete')    // Main Lab
  fillRect(grid, 1, 18, 10, 22, 'floor_concrete')   // Server Room
  fillRect(grid, 1, 24, 10, 28, 'floor_concrete')   // Meeting Pod
  fillRect(grid, 12, 1, 20, 10, 'floor_concrete')   // Hack Zone
  fillRect(grid, 12, 12, 20, 22, 'floor_carpet_teal') // Breakout
  fillRect(grid, 12, 24, 20, 28, 'floor_carpet_blue') // Lounge

  // ── Doors ──
  setTile(grid, 5, 17, 'door'); setTile(grid, 6, 17, 'door')   // Lab ↔ Server
  setTile(grid, 5, 23, 'door'); setTile(grid, 6, 23, 'door')   // Server ↔ Meeting Pod
  setTile(grid, 11, 5, 'door'); setTile(grid, 11, 6, 'door')   // Lab → Hack Zone
  setTile(grid, 11, 15, 'door'); setTile(grid, 11, 16, 'door') // Lab → Breakout
  setTile(grid, 11, 25, 'door'); setTile(grid, 11, 26, 'door') // Meeting Pod → Lounge
  setTile(grid, 15, 11, 'door'); setTile(grid, 16, 11, 'door') // Hack ↔ Breakout
  setTile(grid, 15, 23, 'door'); setTile(grid, 16, 23, 'door') // Breakout ↔ Lounge

  // ── Furniture ──
  applyFurniture(grid, [
    // Main Lab: face-to-face benches
    [1, 1, 'whiteboard', false], [1, 2, 'whiteboard', false], [1, 3, 'whiteboard', false],
    [1, 4, 'whiteboard', false], [1, 5, 'whiteboard', false], [1, 6, 'whiteboard', false],
    [2, 2, 'chair', true, 's'], [2, 3, 'chair', true, 's'],
    [3, 2, 'desk', false, 's'], [3, 3, 'desk', false, 's'],
    [4, 2, 'desk', false], [4, 3, 'desk', false],
    [5, 2, 'chair', true], [5, 3, 'chair', true],
    [2, 6, 'chair', true, 's'],
    [3, 6, 'desk', false, 's'],
    [4, 6, 'desk', false],
    [5, 6, 'chair', true],
    [10, 14, 'plant_small', false], [1, 15, 'plant_small', false],
    [4, 15, 'lamp', false], [7, 15, 'lamp', false],
    [1, 8, 'window_h', false], [1, 12, 'window_h', false],

    // Server Room: racks + glow
    // (5,18)-(6,18) clear — approach to door at (5,17)-(6,17) from Server side
    // (5,22)-(6,22) clear — approach to door at (5,23)-(6,23) from Server side
    [2, 18, 'server_rack', false], [3, 18, 'server_rack', false],
    [4, 18, 'server_rack', false],
    [7, 18, 'server_rack', false],
    [2, 20, 'server_rack', false], [3, 20, 'server_rack', false],
    [4, 20, 'server_rack', false], [5, 20, 'server_rack', false],
    [6, 20, 'server_rack', false], [7, 20, 'server_rack', false],
    [2, 22, 'server_rack', false], [3, 22, 'server_rack', false],
    [4, 22, 'server_rack', false],
    [8, 19, 'chair', true, 's'], [8, 20, 'chair', true, 's'],
    [9, 19, 'desk', false, 's'], [9, 20, 'desk', false, 's'],
    [1, 19, 'window_v', false], [1, 21, 'window_v', false],

    // Meeting Pod: circular table style
    [2, 24, 'meeting_table', false], [2, 25, 'meeting_table', false], [2, 26, 'meeting_table', false],
    [3, 24, 'meeting_table', false], [3, 25, 'meeting_table', false], [3, 26, 'meeting_table', false],
    [4, 24, 'meeting_table', false], [4, 25, 'meeting_table', false], [4, 26, 'meeting_table', false],
    [2, 27, 'chair', true], [3, 27, 'chair', true], [4, 27, 'chair', true],
    [5, 25, 'chair', true], [5, 26, 'chair', true],
    [1, 25, 'chair', true], [1, 26, 'chair', true],
    [6, 24, 'whiteboard', false], [7, 24, 'whiteboard', false], [8, 24, 'whiteboard', false],
    [6, 27, 'plant_small', false], [9, 26, 'plant_small', false],
    [1, 24, 'window_v', false], [1, 27, 'window_v', false],

    // Hack Zone: game tables + hackathon desks
    [12, 1, 'plant_small', false], [20, 1, 'plant_small', false],
    [13, 2, 'game_table', false], [13, 3, 'game_table', false],
    [14, 2, 'game_table', false], [14, 3, 'game_table', false],
    [13, 5, 'game_table', false], [13, 6, 'game_table', false],
    [14, 5, 'game_table', false], [14, 6, 'game_table', false],
    [15, 2, 'chair', true, 's'], [15, 3, 'chair', true, 's'],
    [16, 2, 'desk', false, 's'], [16, 3, 'desk', false, 's'],
    [17, 2, 'desk', false], [17, 3, 'desk', false],
    [18, 2, 'chair', true], [18, 3, 'chair', true],
    [15, 6, 'chair', true, 's'],
    [16, 6, 'desk', false, 's'],
    [17, 6, 'desk', false],
    [18, 6, 'chair', true],
    [18, 9, 'lamp', false],
    [15, 8, 'whiteboard', false], [15, 9, 'whiteboard', false],

    // Breakout: arcade + lounge
    [12, 12, 'bookshelf', false], [12, 13, 'bookshelf', false], [12, 14, 'bookshelf', false],
    [12, 20, 'bookshelf', false], [12, 21, 'bookshelf', false], [12, 22, 'bookshelf', false],
    [13, 14, 'arcade_machine', false], [14, 14, 'arcade_machine', false],
    [13, 17, 'arcade_machine', false], [14, 17, 'arcade_machine', false],
    [16, 13, 'pool_table', false], [16, 14, 'pool_table', false],
    [17, 13, 'pool_table', false], [17, 14, 'pool_table', false],
    [16, 18, 'sofa_h', false], [16, 19, 'sofa_h', false], [16, 20, 'sofa_h', false],
    [19, 18, 'sofa_v', false], [20, 18, 'sofa_v', false],
    [18, 20, 'coffee_table', true], [18, 21, 'coffee_table', true],
    [18, 17, 'rug', true], [19, 17, 'rug', true],
    [20, 22, 'plant_small', false], [12, 16, 'plant_small', false],
    [15, 21, 'lamp', false],

    // Lounge: comfy break space
    [12, 24, 'plant_large', false], [12, 28, 'plant_large', false],
    [13, 24, 'counter', false], [13, 25, 'counter', false], [13, 26, 'counter', false],
    [13, 27, 'coffee_machine', false], [13, 28, 'fridge', false],
    [14, 24, 'bar_stool', true], [14, 26, 'bar_stool', true],
    [16, 25, 'sofa_h', false], [16, 26, 'sofa_h', false], [16, 27, 'sofa_h', false],
    [19, 25, 'sofa_v', false], [20, 25, 'sofa_v', false],
    [18, 26, 'coffee_table', true], [18, 27, 'coffee_table', true],
    [18, 24, 'rug', true], [19, 24, 'rug', true],
    [20, 28, 'plant_flowers', false],
    [15, 28, 'lamp', false],
  ])

  const desks = [
    { id: 'desk_1', label: 'A1', gridX: 2, gridY: 3, ownerId: 'demo_current', ownerName: 'You', isAvailable: false },
    { id: 'desk_2', label: 'A2', gridX: 3, gridY: 3, ownerId: 'demo_1', ownerName: 'Mia Chen', isAvailable: false },
    { id: 'desk_3', label: 'A3', gridX: 2, gridY: 4, ownerId: 'demo_2', ownerName: 'Rowan Ellis', isAvailable: false },
    { id: 'desk_4', label: 'B1', gridX: 6, gridY: 3, ownerId: 'demo_3', ownerName: 'Priya Nair', isAvailable: false },
    { id: 'desk_5', label: 'B2', gridX: 6, gridY: 4, ownerId: 'demo_5', ownerName: 'Jordan Blake', isAvailable: false },
    { id: 'desk_6', label: 'B3', gridX: 3, gridY: 4, isAvailable: true },
    { id: 'desk_7', label: 'C1', gridX: 19, gridY: 9, isAvailable: true },
    { id: 'desk_8', label: 'C2', gridX: 20, gridY: 9, isAvailable: true },
    { id: 'desk_9', label: 'H1', gridX: 2, gridY: 16, isAvailable: true },
  ]

  const interactables: InteractableObject[] = collectInteractables(grid, desks, 'lab')

  addExteriorWindows(grid, 'lab')
  return {
    theme: 'lab',
    width: W, height: H, tileSize: 48, tiles: grid, desks,
    spawnPoints: [{ x: 8, y: 4 }, { x: 5, y: 14 }, { x: 17, y: 14 }],
    interactables,
    areaLabels: [
      { text: 'MAIN LAB', gridX: 8, gridY: 1 },
      { text: 'SERVER ROOM', gridX: 19, gridY: 1 },
      { text: 'MEETING POD', gridX: 26, gridY: 1 },
      { text: 'HACK ZONE', gridX: 5, gridY: 12 },
      { text: 'BREAKOUT', gridX: 16, gridY: 12 },
      { text: 'LOUNGE', gridX: 26, gridY: 12 },
    ],
  }
}

// ── Legacy alias (used by some screens) ──────────────────────────────────────
export function buildOfficeMap(): OfficeMap {
  return buildClassic()
}

export const OFFICE_DESIGNS: OfficeDesign[] = [
  {
    id: 'classic',
    name: 'Classic Office',
    emoji: '🏢',
    desc: 'Workspace, meeting room, focus pods, lounge, kitchen & games room.',
    build: buildClassic,
  },
  {
    id: 'library',
    name: 'Cozy Library',
    emoji: '📚',
    desc: 'Reading hall, study alcoves, tea corner, reading nook & rare books.',
    build: buildLibrary,
  },
  {
    id: 'loft',
    name: 'Open Loft',
    emoji: '🪟',
    desc: 'Light wood floors, creative zone, collab nook, kitchen & games.',
    build: buildLoft,
  },
  {
    id: 'studio',
    name: 'Garden Studio',
    emoji: '🌿',
    desc: 'Garden collab deck, greenhouse, focus workspace & break room.',
    build: buildStudio,
  },
  {
    id: 'lab',
    name: 'Tech Lab',
    emoji: '⚗️',
    desc: 'Main lab, server room, meeting pod, hack zone & breakout space.',
    build: buildLab,
  },
]

export function layoutOfOffice(office: { layout?: string; theme?: OfficeTheme }): OfficeDesignId {
  if (office.layout && OFFICE_DESIGNS.some(design => design.id === office.layout)) {
    return office.layout as OfficeDesignId
  }
  if (office.theme === 'quiet_library') return 'library'
  if (office.theme === 'creative_loft') return 'loft'
  return 'classic'
}

// ─── BFS pathfinding ──────────────────────────────────────────────────────────

export function findPath(
  grid: Tile[][],
  startX: number, startY: number,
  endX: number, endY: number
): { x: number; y: number }[] {
  const rows = grid.length
  const cols = grid[0].length

  if (endX < 0 || endX >= cols || endY < 0 || endY >= rows) return []
  if (!grid[endY][endX].walkable) return []

  type Node = { x: number; y: number; parent: Node | null }
  const queue: Node[] = [{ x: startX, y: startY, parent: null }]
  const visited = new Set<string>()
  visited.add(`${startX},${startY}`)

  const DIRS = [[0,1],[0,-1],[1,0],[-1,0]]

  while (queue.length) {
    const node = queue.shift()!
    if (node.x === endX && node.y === endY) {
      const path: { x: number; y: number }[] = []
      let cur: Node | null = node
      while (cur) { path.unshift({ x: cur.x, y: cur.y }); cur = cur.parent }
      return path
    }
    for (const [dx, dy] of DIRS) {
      const nx = node.x + dx
      const ny = node.y + dy
      const key = `${nx},${ny}`
      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue
      if (visited.has(key)) continue
      if (!grid[ny][nx].walkable) continue
      visited.add(key)
      queue.push({ x: nx, y: ny, parent: node })
    }
  }
  return []
}
