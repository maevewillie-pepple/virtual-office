import type { Desk, InteractableObject, ObjectInteractionType, OfficeArtTheme, Tile, TileType } from '../types'

const CLUSTERED = new Set<TileType>([
  'coffee_machine', 'bookshelf', 'fireplace', 'arcade_machine',
  'pool_table', 'meeting_table', 'game_table', 'server_rack', 'fridge',
])

interface Spec {
  type: ObjectInteractionType
  label: string
  prompt: string
}

const SPECS: Partial<Record<TileType, Spec>> = {
  coffee_machine: { type: 'brew_coffee', label: 'Coffee Machine', prompt: 'Enter · Make coffee' },
  kettle: { type: 'make_tea', label: 'Kettle', prompt: 'Enter · Make tea' },
  fridge: { type: 'grab_drink', label: 'Fridge', prompt: 'Enter · Grab a drink' },
  bookshelf: { type: 'view_bookshelf', label: 'Bookshelf', prompt: 'Enter · Browse books' },
  whiteboard: { type: 'use_whiteboard', label: 'Whiteboard', prompt: 'Enter · Use whiteboard' },
  fireplace: { type: 'toggle_fireplace', label: 'Fireplace', prompt: 'Enter · Turn on fireplace' },
  arcade_machine: { type: 'use_arcade', label: 'Arcade', prompt: 'Enter · Play arcade' },
  pool_table: { type: 'play_pool', label: 'Pool Table', prompt: 'Enter · Play pool' },
  meeting_table: { type: 'use_meeting', label: 'Meeting Table', prompt: 'Enter · Meeting room' },
  game_table: { type: 'play_game', label: 'Game Table', prompt: 'Enter · Play a game' },
  server_rack: { type: 'use_server', label: 'Server Rack', prompt: 'Enter · Inspect servers' },
  chair: { type: 'sit', label: 'Chair', prompt: 'Enter · Sit down' },
  sofa_h: { type: 'sit', label: 'Sofa', prompt: 'Enter · Sit down' },
  sofa_v: { type: 'sit', label: 'Sofa', prompt: 'Enter · Sit down' },
  bar_stool: { type: 'sit', label: 'Stool', prompt: 'Enter · Sit down' },
  focus_pod: { type: 'sit', label: 'Focus Pod', prompt: 'Enter · Sit down' },
  coffee_table: { type: 'use_table', label: 'Coffee Table', prompt: 'Enter · Use table' },
}

function cellsOf(obj: InteractableObject) {
  return obj.cells?.length ? obj.cells : [{ x: obj.gridX, y: obj.gridY }]
}

/** Build interactables from the tiles that are actually drawn, so prompts cannot drift off the sprites. */
export function collectInteractables(
  tiles: Tile[][],
  desks: Desk[],
  theme?: OfficeArtTheme,
): InteractableObject[] {
  const height = tiles.length
  const width = tiles[0]?.length ?? 0
  const seen = new Set<string>()
  const objects: InteractableObject[] = []

  const push = (partial: InteractableObject) => {
    objects.push(partial)
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const type = tiles[y][x].type
      const spec = SPECS[type]
      if (!spec) continue
      if (type === 'plant_large' || type === 'plant_flowers' || type === 'plant_small') continue
      const key = `${x},${y}`
      if (seen.has(key)) continue

      if (CLUSTERED.has(type)) {
        const cells: { x: number; y: number }[] = []
        const stack = [{ x, y }]
        seen.add(key)
        while (stack.length) {
          const cur = stack.pop()!
          cells.push(cur)
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
            const nx = cur.x + dx
            const ny = cur.y + dy
            const nk = `${nx},${ny}`
            if (nx < 0 || ny < 0 || nx >= width || ny >= height || seen.has(nk)) continue
            if (tiles[ny][nx].type !== type) continue
            seen.add(nk)
            stack.push({ x: nx, y: ny })
          }
        }
        cells.sort((a, b) => a.y - b.y || a.x - b.x)
        push({
          id: `${spec.type}_${cells[0].y}_${cells[0].x}`,
          type: spec.type,
          gridX: cells[0].x,
          gridY: cells[0].y,
          label: spec.label,
          prompt: spec.prompt,
          cells,
        })
      } else {
        seen.add(key)
        push({
          id: `${spec.type}_${y}_${x}`,
          type: spec.type,
          gridX: x,
          gridY: y,
          label: spec.label,
          prompt: spec.prompt,
          cells: [{ x, y }],
        })
      }
    }
  }

  if (theme === 'studio') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const type = tiles[y][x].type
        if (type !== 'plant_large' && type !== 'plant_flowers') continue
        objects.push({
          id: `plant_${y}_${x}`,
          type: 'water_plants',
          gridX: x,
          gridY: y,
          label: 'Plant',
          prompt: 'Enter · Water plant',
          cells: [{ x, y }],
        })
      }
    }
  }

  for (const desk of desks) {
    objects.push({
      id: desk.id,
      type: 'use_desk',
      gridX: desk.gridX,
      gridY: desk.gridY,
      label: `Desk ${desk.label}`,
      prompt: desk.isAvailable ? 'Enter · Claim desk' : 'Enter · Use desk',
      cells: [{ x: desk.gridX, y: desk.gridY }],
    })
  }

  return objects
}

export function objectCells(obj: InteractableObject) {
  return cellsOf(obj)
}

/** Chebyshev range of 1, and diagonal contact cannot slip through two walls. */
export function inRange(tiles: Tile[][], obj: InteractableObject, x: number, y: number) {
  for (const cell of cellsOf(obj)) {
    const dx = cell.x - x
    const dy = cell.y - y
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 1) continue
    if (dx !== 0 && dy !== 0) {
      const sideA = tiles[y]?.[x + dx]
      const sideB = tiles[y + dy]?.[x]
      if (sideA?.type === 'wall' && sideB?.type === 'wall') continue
    }
    return true
  }
  return false
}

export function rankNearby(
  tiles: Tile[][],
  objects: InteractableObject[],
  x: number,
  y: number,
  facing: { x: number; y: number },
) {
  const near = objects.filter(obj => inRange(tiles, obj, x, y))
  near.sort((a, b) => score(a) - score(b) || a.label.localeCompare(b.label))
  return near

  function score(obj: InteractableObject) {
    let best = 9
    for (const cell of cellsOf(obj)) {
      const dx = cell.x - x
      const dy = cell.y - y
      const dist = Math.max(Math.abs(dx), Math.abs(dy))
      const faced = (facing.x !== 0 || facing.y !== 0) && Math.sign(dx) === Math.sign(facing.x) && Math.sign(dy) === Math.sign(facing.y)
      // Chairs ring the meeting table, so the table would otherwise lose to the seat underfoot.
      const rank = dist + (faced ? -0.5 : 0) + (obj.type === 'use_meeting' ? -2 : 0)
      if (rank < best) best = rank
    }
    return best
  }
}

export function interactionDestination(
  tiles: Tile[][],
  obj: InteractableObject,
  fromX: number,
  fromY: number,
) {
  const cells = cellsOf(obj)
  if (cells.some(c => c.x === fromX && c.y === fromY && tiles[c.y]?.[c.x]?.walkable)) {
    return { x: fromX, y: fromY }
  }
  const spots: { x: number; y: number }[] = []
  for (const cell of cells) {
    if (tiles[cell.y]?.[cell.x]?.walkable) spots.push(cell)
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cell.x + dx
      const ny = cell.y + dy
      if (tiles[ny]?.[nx]?.walkable) spots.push({ x: nx, y: ny })
    }
  }
  if (!spots.length) return null
  spots.sort((a, b) => Math.abs(a.x - fromX) + Math.abs(a.y - fromY) - (Math.abs(b.x - fromX) + Math.abs(b.y - fromY)))
  return spots[0]
}

/** Chair tucked against a desk, matching the way the desk faces. */
export function seatBesideDesk(tiles: Tile[][], desk: Desk) {
  const facing = tiles[desk.gridY]?.[desk.gridX]?.facing
  const order = facing === 's'
    ? [[0, -1], [0, 1], [-1, 0], [1, 0]]
    : [[0, 1], [0, -1], [-1, 0], [1, 0]]
  for (const [dx, dy] of order) {
    const x = desk.gridX + dx
    const y = desk.gridY + dy
    const tile = tiles[y]?.[x]
    if (tile?.walkable && (tile.type === 'chair' || tile.type === 'floor_oak' || tile.type === 'floor_wood_light' || tile.type === 'floor_concrete' || tile.type === 'floor_stone' || tile.type === 'floor_carpet_blue' || tile.type === 'floor_carpet_teal' || tile.type === 'floor_tile' || tile.type === 'floor_grass')) {
      if (tile.type === 'chair' || dx === 0) return { x, y }
    }
  }
  return null
}
