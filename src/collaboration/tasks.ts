import { publishTasks } from '../remote/sync'

export type TaskColumn = 'todo' | 'doing' | 'done'

export interface TaskCard {
  id: string
  column: TaskColumn
  title: string
  detail: string
  authorId: string
  authorName: string
  createdAt: string
  updatedAt: string
  order: number
}

export const TASK_COLUMNS: { id: TaskColumn; label: string }[] = [
  { id: 'todo', label: 'To do' },
  { id: 'doing', label: 'Doing' },
  { id: 'done', label: 'Done' },
]

const EVENT = 'vo-tasks'
const MAX = 80

function keyFor(officeId: string) {
  return `vo_tasks_${officeId}`
}

function isColumn(value: unknown): value is TaskColumn {
  return value === 'todo' || value === 'doing' || value === 'done'
}

function read(officeId: string): TaskCard[] {
  try {
    const raw = localStorage.getItem(keyFor(officeId))
    const parsed = raw ? JSON.parse(raw) as { cards?: TaskCard[] } : { cards: [] }
    if (!Array.isArray(parsed.cards)) return []
    return parsed.cards.filter(card => card && typeof card.id === 'string' && isColumn(card.column) && typeof card.title === 'string')
  } catch {
    return []
  }
}

function write(officeId: string, cards: TaskCard[]) {
  const key = keyFor(officeId)
  try {
    const doc = {
      officeId,
      cards: cards.slice(0, MAX),
      updatedAt: new Date().toISOString(),
    }
    localStorage.setItem(key, JSON.stringify(doc))
    publishTasks(officeId, doc)
  } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }))
}

export function loadTasks(officeId: string): TaskCard[] {
  return read(officeId).sort((a, b) => a.order - b.order)
}

export function saveTasks(officeId: string, cards: TaskCard[]) {
  write(officeId, cards)
  return loadTasks(officeId)
}

export function subscribeTasks(officeId: string, onChange: () => void) {
  const key = keyFor(officeId)
  const onStorage = (event: StorageEvent) => { if (event.key === key) onChange() }
  const onLocal = (event: Event) => { if ((event as CustomEvent<string>).detail === key) onChange() }
  window.addEventListener('storage', onStorage)
  window.addEventListener(EVENT, onLocal)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(EVENT, onLocal)
  }
}
