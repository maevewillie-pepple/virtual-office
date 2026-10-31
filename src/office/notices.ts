import { publishNotices } from '../remote/sync'

export type NoticeKind = 'interaction' | 'discussion' | 'jam' | 'board'
export type InteractionAction = 'wave' | 'nudge' | 'coffee' | 'focus' | 'gift' | 'message'

export interface OfficeNotice {
  id: string
  kind: NoticeKind
  action?: InteractionAction
  actorId: string
  actorName: string
  personId?: string
  personName?: string
  title: string
  detail: string
  at: string
  read: boolean
  roomId?: string
  x?: number
  y?: number
}

const EVENT = 'vo-notices'
const MAX = 40

function keyFor(officeId: string) {
  return `vo_notices_${officeId}`
}

function read(officeId: string): OfficeNotice[] {
  try {
    const raw = localStorage.getItem(keyFor(officeId))
    const parsed = raw ? JSON.parse(raw) as OfficeNotice[] : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function write(officeId: string, notices: OfficeNotice[]) {
  const key = keyFor(officeId)
  const next = notices.slice(0, MAX)
  try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* ignore */ }
  publishNotices(officeId, next)
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }))
}

export function loadNotices(officeId: string): OfficeNotice[] {
  return read(officeId)
}

export function pushNotice(officeId: string, notice: Omit<OfficeNotice, 'at' | 'read'> & { at?: string; read?: boolean }) {
  const current = read(officeId)
  if (current.some(item => item.id === notice.id)) return
  const next: OfficeNotice = {
    ...notice,
    at: notice.at ?? new Date().toISOString(),
    read: notice.read ?? false,
  }
  write(officeId, [next, ...current])
}

export function markNoticeRead(officeId: string, id: string) {
  const current = read(officeId)
  if (!current.some(item => item.id === id && !item.read)) return
  write(officeId, current.map(item => item.id === id ? { ...item, read: true } : item))
}

export function markAllNoticesRead(officeId: string) {
  const current = read(officeId)
  if (!current.some(item => !item.read)) return
  write(officeId, current.map(item => item.read ? item : { ...item, read: true }))
}

export function subscribeNotices(officeId: string, onChange: () => void) {
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

export function noticeHeadline(notice: OfficeNotice, userId: string): string {
  const actor = notice.actorId === userId ? 'You' : first(notice.actorName)
  const person = notice.personId === userId ? 'you' : first(notice.personName || 'them')
  if (notice.kind === 'discussion') return `${actor} started “${notice.title}”`
  if (notice.kind === 'jam') return `${actor} started a Spotify Jam`
  if (notice.kind === 'board') return `${actor} added to the whiteboard`
  if (notice.action === 'coffee') return `${actor} invited ${person} for a coffee`
  if (notice.action === 'focus') return `${actor} invited ${person} to focus`
  if (notice.action === 'gift') return `${actor} gave ${person} ${notice.detail || 'something'}`
  if (notice.action === 'message') return `${actor} sent ${person} a message`
  if (notice.action === 'nudge') return `${actor} nudged ${person}`
  return `${actor} waved at ${person}`
}

export function noticeDetail(notice: OfficeNotice): string {
  if (notice.kind === 'discussion') return notice.detail ? `In ${notice.detail}` : 'Meeting room'
  if (notice.kind === 'jam') return 'Open the player to join'
  if (notice.kind === 'board') return notice.detail
  if (notice.action === 'message') return notice.detail
  return ''
}

export function noticeAction(notice: OfficeNotice): string {
  if (notice.kind === 'discussion') return 'Enter'
  if (notice.kind === 'board') return 'Open'
  if (notice.kind === 'jam') return 'Listen'
  return 'See'
}

function first(name: string) {
  return name.trim().split(/\s+/)[0] || name
}

export function noticeAge(iso: string, now = Date.now()): string {
  const seconds = Math.max(0, (now - new Date(iso).getTime()) / 1000)
  if (seconds < 45) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}
