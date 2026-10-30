import type { Tile, TileType } from '../types'

const BARRIER = new Set<TileType>(['wall', 'window_h', 'window_v', 'door'])

/** Rooms are floor regions that do not cross walls or doors. */
export function buildRoomIndex(tiles: Tile[][]): Map<string, string> {
  const height = tiles.length
  const width = tiles[0]?.length ?? 0
  const index = new Map<string, string>()
  const seen = new Set<string>()

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const start = `${x},${y}`
      if (seen.has(start) || BARRIER.has(tiles[y][x].type)) continue
      const cells: { x: number; y: number }[] = []
      const stack = [{ x, y }]
      seen.add(start)
      while (stack.length) {
        const cur = stack.pop()!
        cells.push(cur)
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          const nx = cur.x + dx
          const ny = cur.y + dy
          const key = `${nx},${ny}`
          if (nx < 0 || ny < 0 || nx >= width || ny >= height || seen.has(key)) continue
          if (BARRIER.has(tiles[ny][nx].type)) continue
          seen.add(key)
          stack.push({ x: nx, y: ny })
        }
      }
      let minX = cells[0].x
      let minY = cells[0].y
      for (const cell of cells) {
        if (cell.y < minY || (cell.y === minY && cell.x < minX)) {
          minX = cell.x
          minY = cell.y
        }
      }
      const roomId = `r${minY}x${minX}`
      for (const cell of cells) index.set(`${cell.x},${cell.y}`, roomId)
    }
  }
  return index
}

export function roomIdAt(index: Map<string, string>, x: number, y: number): string {
  return index.get(`${x},${y}`) ?? `r${y}x${x}`
}
