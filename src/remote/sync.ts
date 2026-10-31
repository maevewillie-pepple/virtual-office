import type { FocusHistoryEntry } from '../types'
import type { BaristaStats } from '../game/barista/logic'
import { isRemoteConfigured, isUuid, supabase } from './client'

const BOARD_PREFIX = 'vo_shared_board_'
const DISCUSS_PREFIX = 'vo_discussion_'
const COLLAB = 'vo-collab'

let applying = false
const echoes = new Map<string, string>()
const timers = new Map<string, number>()

function client() {
  return isRemoteConfigured() ? supabase() : null
}

function queue(table: string, stampKey: string, row: Record<string, unknown>) {
  const db = client()
  const officeId = typeof row.office_id === 'string' ? row.office_id : ''
  if (!db || applying || (officeId && !isUuid(officeId))) return
  const stamp = new Date().toISOString()
  row.updated_at = stamp
  echoes.set(stampKey, stamp)
  const previous = timers.get(stampKey)
  if (previous) window.clearTimeout(previous)
  timers.set(stampKey, window.setTimeout(() => {
    timers.delete(stampKey)
    void db.from(table).upsert(row)
  }, 280))
}

function echoed(stampKey: string, updatedAt: string) {
  return echoes.get(stampKey) === updatedAt
}

function put(key: string, value: unknown, event: string, detail: string) {
  applying = true
  try {
    localStorage.setItem(key, JSON.stringify(value))
    window.dispatchEvent(new CustomEvent(event, { detail }))
  } catch { /* ignore */ }
  finally { applying = false }
}

export function publishBoard(officeId: string, designId: string, roomId: string, doc: unknown) {
  queue('boards', `board:${officeId}:${designId}:${roomId}`, {
    office_id: officeId, design_id: designId, room_id: roomId, doc,
  })
}

export function publishDiscussion(officeId: string, designId: string, roomId: string, doc: unknown) {
  queue('discussions', `discussion:${officeId}:${designId}:${roomId}`, {
    office_id: officeId, design_id: designId, room_id: roomId, doc,
  })
}

export function publishTasks(officeId: string, doc: unknown) {
  queue('task_boards', `tasks:${officeId}`, { office_id: officeId, doc })
}

export function publishArcade(officeId: string, doc: unknown) {
  queue('arcade_docs', `arcade:${officeId}`, { office_id: officeId, doc })
}

export function publishMusic(officeId: string, doc: unknown) {
  queue('office_music', `music:${officeId}`, { office_id: officeId, doc })
}

export function publishNotices(officeId: string, doc: unknown) {
  queue('notice_docs', `notices:${officeId}`, { office_id: officeId, doc })
}

export function publishNotes(officeId: string, designId: string, doc: unknown) {
  queue('desk_notes', `notes:${officeId}:${designId}`, { office_id: officeId, design_id: designId, doc })
}

export function publishPlants(officeId: string, designId: string, doc: unknown) {
  queue('plants', `plants:${officeId}:${designId}`, { office_id: officeId, design_id: designId, doc })
}

export async function publishFocus(userId: string, entries: FocusHistoryEntry[]) {
  const db = client()
  if (!db || applying || !isUuid(userId)) return
  const rows = entries.slice(-200).map(entry => ({
    id: entry.id,
    user_id: userId,
    topic: entry.topic ?? null,
    duration: entry.duration,
    started_at: entry.startedAt,
    ended_at: entry.endedAt,
    completed: entry.completed,
  }))
  if (rows.length === 0) return
  await db.from('focus_sessions').upsert(rows)
}

export async function publishBarista(stats: BaristaStats) {
  const db = client()
  if (!db || applying) return
  const { data } = await db.auth.getSession()
  const userId = data.session?.user.id
  if (!userId) return
  await db.from('barista_stats').upsert({ user_id: userId, stats, updated_at: new Date().toISOString() })
}

interface RoomRow { office_id: string; design_id: string; room_id: string; doc: unknown; updated_at: string }
interface OfficeRow { office_id: string; doc: unknown; updated_at: string }
interface ScopedRow { office_id: string; design_id: string; doc: unknown; updated_at: string }

function applyRoom(table: 'boards' | 'discussions', row: RoomRow) {
  const prefix = table === 'boards' ? BOARD_PREFIX : DISCUSS_PREFIX
  const stampKey = `${table === 'boards' ? 'board' : 'discussion'}:${row.office_id}:${row.design_id}:${row.room_id}`
  if (echoed(stampKey, row.updated_at)) return
  put(`${prefix}${row.office_id}_${row.design_id}_${row.room_id}`, row.doc, COLLAB, `${prefix}${row.office_id}_${row.design_id}_${row.room_id}`)
}

export async function hydrateOffice(officeId: string) {
  const db = client()
  if (!db || !isUuid(officeId)) return
  const [boards, discussions, tasks, arcade, music, notices, notes, plants] = await Promise.all([
    db.from('boards').select('*').eq('office_id', officeId),
    db.from('discussions').select('*').eq('office_id', officeId),
    db.from('task_boards').select('*').eq('office_id', officeId).maybeSingle(),
    db.from('arcade_docs').select('*').eq('office_id', officeId).maybeSingle(),
    db.from('office_music').select('*').eq('office_id', officeId).maybeSingle(),
    db.from('notice_docs').select('*').eq('office_id', officeId).maybeSingle(),
    db.from('desk_notes').select('*').eq('office_id', officeId),
    db.from('plants').select('*').eq('office_id', officeId),
  ])
  for (const row of (boards.data ?? []) as RoomRow[]) applyRoom('boards', row)
  for (const row of (discussions.data ?? []) as RoomRow[]) applyRoom('discussions', row)
  if (tasks.data) {
    const row = tasks.data as OfficeRow
    if (!echoed(`tasks:${officeId}`, row.updated_at)) put(`vo_tasks_${officeId}`, row.doc, 'vo-tasks', officeId)
  }
  if (arcade.data) {
    const row = arcade.data as OfficeRow
    if (!echoed(`arcade:${officeId}`, row.updated_at)) put(`vo_arcade_${officeId}`, row.doc, 'vo-arcade', officeId)
  }
  if (music.data) {
    const row = music.data as OfficeRow
    if (!echoed(`music:${officeId}`, row.updated_at)) put(`vo_office_music_${officeId}`, row.doc, 'vo-music', officeId)
  }
  if (notices.data) {
    const row = notices.data as OfficeRow
    if (!echoed(`notices:${officeId}`, row.updated_at)) put(`vo_notices_${officeId}`, row.doc, 'vo-notices', officeId)
  }
  for (const row of (notes.data ?? []) as ScopedRow[]) {
    if (!echoed(`notes:${officeId}:${row.design_id}`, row.updated_at)) put(`vo_notes_${row.design_id}`, row.doc, 'vo-notes', row.design_id)
  }
  for (const row of (plants.data ?? []) as ScopedRow[]) {
    if (!echoed(`plants:${officeId}:${row.design_id}`, row.updated_at)) put(`vo_plants_${row.design_id}`, row.doc, 'vo-plants', row.design_id)
  }
}

export async function hydratePersonal(userId: string) {
  const db = client()
  if (!db || !isUuid(userId)) return
  const { data: focus } = await db.from('focus_sessions').select('*').eq('user_id', userId).order('ended_at', { ascending: true })
  if (focus && focus.length > 0) {
    const entries: FocusHistoryEntry[] = focus.map(row => ({
      id: String(row.id),
      topic: row.topic ?? undefined,
      duration: row.duration,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      completed: row.completed,
    }))
    put('vo_focus_history', entries, 'vo-focus', userId)
  } else {
    try {
      const local = JSON.parse(localStorage.getItem('vo_focus_history') || '[]') as FocusHistoryEntry[]
      if (Array.isArray(local) && local.length) await publishFocus(userId, local)
    } catch { /* ignore */ }
  }
  const { data: barista } = await db.from('barista_stats').select('stats').eq('user_id', userId).maybeSingle()
  if (barista?.stats) {
    put('vo_barista_stats', barista.stats, 'vo-barista', userId)
  } else {
    try {
      const local = JSON.parse(localStorage.getItem('vo_barista_stats') || '') as BaristaStats
      if (local && typeof local.made === 'number') await publishBarista(local)
    } catch { /* ignore */ }
  }
}

export function subscribeOfficeDocs(officeId: string, onApply: () => void) {
  const db = client()
  if (!db || !isUuid(officeId)) return () => {}
  const filter = `office_id=eq.${officeId}`
  const channel = db.channel(`docs:${officeId}`)
  const listen = (table: string, apply: (row: Record<string, unknown>) => void) => {
    channel.on('postgres_changes', { event: '*', schema: 'public', table, filter }, payload => {
      const row = payload.new as Record<string, unknown>
      if (!row || typeof row !== 'object') return
      apply(row)
      onApply()
    })
  }
  listen('boards', row => applyRoom('boards', row as unknown as RoomRow))
  listen('discussions', row => applyRoom('discussions', row as unknown as RoomRow))
  listen('task_boards', row => {
    const item = row as unknown as OfficeRow
    if (!echoed(`tasks:${officeId}`, item.updated_at)) put(`vo_tasks_${officeId}`, item.doc, 'vo-tasks', officeId)
  })
  listen('arcade_docs', row => {
    const item = row as unknown as OfficeRow
    if (!echoed(`arcade:${officeId}`, item.updated_at)) put(`vo_arcade_${officeId}`, item.doc, 'vo-arcade', officeId)
  })
  listen('office_music', row => {
    const item = row as unknown as OfficeRow
    if (!echoed(`music:${officeId}`, item.updated_at)) put(`vo_office_music_${officeId}`, item.doc, 'vo-music', officeId)
  })
  listen('notice_docs', row => {
    const item = row as unknown as OfficeRow
    if (!echoed(`notices:${officeId}`, item.updated_at)) put(`vo_notices_${officeId}`, item.doc, 'vo-notices', officeId)
  })
  listen('desk_notes', row => {
    const item = row as unknown as ScopedRow
    if (!echoed(`notes:${officeId}:${item.design_id}`, item.updated_at)) put(`vo_notes_${item.design_id}`, item.doc, 'vo-notes', item.design_id)
  })
  listen('plants', row => {
    const item = row as unknown as ScopedRow
    if (!echoed(`plants:${officeId}:${item.design_id}`, item.updated_at)) put(`vo_plants_${item.design_id}`, item.doc, 'vo-plants', item.design_id)
  })
  channel.subscribe()
  return () => { void db.removeChannel(channel) }
}

export async function uploadBoardAsset(officeId: string, assetId: string, blob: Blob) {
  const db = client()
  if (!db || !isUuid(officeId)) return
  const { error } = await db.storage.from('board-assets').upload(`${officeId}/${assetId}`, blob, {
    upsert: true,
    contentType: blob.type || 'image/jpeg',
  })
  if (error) throw new Error(error.message)
}

export async function downloadBoardAsset(officeId: string, assetId: string): Promise<Blob | null> {
  const db = client()
  if (!db || !isUuid(officeId)) return null
  const { data, error } = await db.storage.from('board-assets').download(`${officeId}/${assetId}`)
  if (error || !data) return null
  return data
}

export async function removeBoardAsset(officeId: string, assetId: string) {
  const db = client()
  if (!db || !isUuid(officeId)) return
  await db.storage.from('board-assets').remove([`${officeId}/${assetId}`])
}
