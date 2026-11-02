import { publishNotices } from '../remote/sync'
import { isUuid, supabase } from '../remote/client'

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

function readsKey(officeId: string, userId: string) {
  return `vo_notice_reads_${officeId}_${userId}`
}

function readIds(officeId: string, userId: string): Set<string> {
  if (!userId) return new Set()
  try {
    const raw = localStorage.getItem(readsKey(officeId, userId))
    const parsed = raw ? JSON.parse(raw) as string[] : []
    return new Set(Array.isArray(parsed) ? parsed : [])
  } catch {
    return new Set()
  }
}

function saveIds(officeId: string, userId: string, ids: Set<string>) {
  if (!userId) return
  try { localStorage.setItem(readsKey(officeId, userId), JSON.stringify([...ids].slice(-200))) } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: keyFor(officeId) }))
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

function store(officeId: string, notices: OfficeNotice[], publish: boolean) {
  const key = keyFor(officeId)
  const next = notices.slice(0, MAX).map(notice => ({ ...notice, read: false }))
  try { localStorage.setItem(key, JSON.stringify(next)) } catch { /* ignore */ }
  if (publish) publishNotices(officeId, next)
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }))
}

function broadcastNotice(officeId: string, notice: OfficeNotice) {
  const client = supabase()
  if (!client || !isUuid(officeId)) return
  const channel = client.channel(`office-notices:${officeId}`, {
    config: { broadcast: { self: false } },
  })
  void channel.send({
    type: 'broadcast',
    event: 'notice',
    payload: { ...notice, read: false },
  })
}

export function loadNotices(officeId: string, userId = ''): OfficeNotice[] {
  const reads = readIds(officeId, userId)
  return read(officeId).map(notice => ({
    ...notice,
    read: reads.has(notice.id) || (!!userId && notice.actorId === userId),
  }))
}

export function pushNotice(officeId: string, notice: Omit<OfficeNotice, 'at' | 'read'> & { at?: string; read?: boolean }) {
  const current = read(officeId)
  if (current.some(item => item.id === notice.id)) return
  const next: OfficeNotice = {
    ...notice,
    at: notice.at ?? new Date().toISOString(),
    read: false,
  }
  store(officeId, [next, ...current], true)
  broadcastNotice(officeId, next)
}

export function receiveNotice(officeId: string, notice: OfficeNotice) {
  if (!notice?.id) return
  const current = read(officeId)
  if (current.some(item => item.id === notice.id)) return
  const next: OfficeNotice = {
    ...notice,
    at: notice.at ?? new Date().toISOString(),
    read: false,
  }
  store(officeId, [next, ...current], false)
}

export function applyRemoteNoticeDoc(officeId: string, doc: unknown) {
  if (!Array.isArray(doc)) return
  const incoming = doc as OfficeNotice[]
  const byId = new Map<string, OfficeNotice>()
  for (const notice of [...incoming, ...read(officeId)]) {
    if (!notice?.id || byId.has(notice.id)) continue
    byId.set(notice.id, { ...notice, at: notice.at ?? new Date().toISOString(), read: false })
  }
  const merged = [...byId.values()].sort((a, b) => String(b.at).localeCompare(String(a.at)))
  store(officeId, merged, false)
}

export function listenForSharedNotices(officeId: string, onChange: () => void) {
  const client = supabase()
  if (!client || !isUuid(officeId)) return () => {}
  const channel = client.channel(`office-notices:${officeId}`, {
    config: { broadcast: { self: false } },
  })
  channel.on('broadcast', { event: 'notice' }, ({ payload }: { payload?: OfficeNotice }) => {
    if (!payload?.id) return
    receiveNotice(officeId, payload)
    onChange()
  })
  channel.subscribe()
  return () => { void client.removeChannel(channel) }
}

export function markNoticeRead(officeId: string, userId: string, id: string) {
  const ids = readIds(officeId, userId)
  if (ids.has(id)) return
  ids.add(id)
  saveIds(officeId, userId, ids)
}

export function markAllNoticesRead(officeId: string, userId: string) {
  const ids = readIds(officeId, userId)
  let changed = false
  for (const notice of read(officeId)) {
    if (ids.has(notice.id)) continue
    ids.add(notice.id)
    changed = true
  }
  if (changed) saveIds(officeId, userId, ids)
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
  if (notice.action === 'message' && notice.personId) return `${actor} sent ${person} a message`
  if (notice.action === 'message') return `${actor} sent a message`
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
