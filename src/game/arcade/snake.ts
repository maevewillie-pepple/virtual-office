export interface Cell { x: number; y: number }

export interface SnakeState {
  snake: Cell[]
  dir: Cell
  food: Cell
  score: number
  over: boolean
  ate: boolean
}

export const SNAKE_SIZE = 12

export function freshSnake(): SnakeState {
  return {
    snake: [{ x: 3, y: 5 }, { x: 2, y: 5 }, { x: 1, y: 5 }],
    dir: { x: 1, y: 0 },
    food: { x: 8, y: 5 },
    score: 0,
    over: false,
    ate: false,
  }
}

export function stepSnake(state: SnakeState, dir: Cell): SnakeState {
  if (state.over) return state
  const head = { x: state.snake[0].x + dir.x, y: state.snake[0].y + dir.y }
  if (head.x < 0 || head.y < 0 || head.x >= SNAKE_SIZE || head.y >= SNAKE_SIZE) {
    return { ...state, over: true, ate: false, dir }
  }
  const eat = head.x === state.food.x && head.y === state.food.y
  const body = eat ? state.snake : state.snake.slice(0, -1)
  if (body.some(part => part.x === head.x && part.y === head.y)) {
    return { ...state, over: true, ate: false, dir }
  }
  const snake = [head, ...state.snake]
  if (!eat) snake.pop()
  let food = state.food
  if (eat) {
    const open: Cell[] = []
    for (let y = 0; y < SNAKE_SIZE; y++) {
      for (let x = 0; x < SNAKE_SIZE; x++) {
        if (!snake.some(part => part.x === x && part.y === y)) open.push({ x, y })
      }
    }
    food = open[Math.floor(Math.random() * open.length)] ?? food
  }
  return { ...state, snake, food, score: state.score + (eat ? 1 : 0), dir, ate: eat }
}

export function snakePace(base: number, score: number): number {
  return Math.max(70, base - Math.floor(score / 4) * 12)
}
