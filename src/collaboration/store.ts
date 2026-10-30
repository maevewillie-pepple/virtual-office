/** Shared boards and discussions for one office layout.
 *  Updates sync across tabs of this browser through localStorage.
 *  There is no separate game server, so people on other computers do not see these changes live.
 *  Image bytes live in IndexedDB. The board document only stores an asset id.
 */

export type NoteColor = 'butter' | 'sage' | 'pink' | 'peach' | 'blue'
export type TopicCategory = 'work' | 'ideas' | 'fun' | 'debate' | 'planning' | 'general'
export type TopicStatus = 'proposed' | 'active' | 'completed'

export interface BoardItem {
  id: string
  type: 'note' | 'photo' | 'link' | 'text' | 'shape' | 'drawing'
  x: number
  y: number
  w: number
  h: number
  rotation?: number
  color?: NoteColor
  text?: string
  caption?: string
  href?: string
  assetId?: string
  shape?: 'rect' | 'ellipse' | 'line' | 'arrow'
  stroke?: number
  points?: { x: number; y: number }[]
  authorId: string
  authorName: string
  createdAt: string
  updatedAt: string
  reactions?: Record<string, string[]>
  reported?: boolean
  deleted?: boolean
}

export interface SharedBoard {
  id: string
  officeId: string
  roomId: string
  title: string
  locked: boolean
  clearedAt?: string
  items: BoardItem[]
  updatedAt: string
}

export interface TopicComment {
  id: string
  topicId: string
  authorId: string
  authorName: string
  content: string
  createdAt: string
  updatedAt: string
  reactions?: Record<string, string[]>
  deleted?: boolean
}

export interface DiscussionTopic {
  id: string
  officeId: string
  roomId: string
  authorId: string
  authorName: string
  title: string
  description: string
  category: TopicCategory
  status: TopicStatus
  createdAt: string
  votes: Record<string, -1 | 1>
}

export interface DiscussionSession {
  id: string
  topicId: string
  officeId: string
  roomId: string
  hostId: string
  hostName: string
  title: string
  startedAt: string
  endsAt: string
  status: 'live' | 'completed'
  participants: { id: string; name: string; seated: boolean }[]
  anchor?: { x: number; y: number }
  summary?: string
  keyPoints?: string
  decision?: string
  followUps?: string
  endedAt?: string
}

export interface DiscussionDoc {
  officeId: string
  roomId: string
  topics: DiscussionTopic[]
  comments: TopicComment[]
  sessions: DiscussionSession[]
  updatedAt: string
}

const BOARD_PREFIX = 'vo_shared_board_'
const DISCUSS_PREFIX = 'vo_discussion_'
const EVENT = 'vo-collab'

export function boardKey(officeId: string, designId: string, roomId: string) {
  return `${BOARD_PREFIX}${officeId}_${designId}_${roomId}`
}

export function discussionKey(officeId: string, designId: string, roomId: string) {
  return `${DISCUSS_PREFIX}${officeId}_${designId}_${roomId}`
}

function now() {
  return new Date().toISOString()
}

function emptyBoard(officeId: string, roomId: string, id: string): SharedBoard {
  return { id, officeId, roomId, title: 'Room board', locked: false, items: [], updatedAt: now() }
}

function emptyDiscussion(officeId: string, roomId: string): DiscussionDoc {
  return { officeId, roomId, topics: [], comments: [], sessions: [], updatedAt: now() }
}

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
  window.dispatchEvent(new CustomEvent(EVENT, { detail: key }))
}

export function loadBoard(officeId: string, designId: string, roomId: string): SharedBoard {
  const key = boardKey(officeId, designId, roomId)
  const id = `${officeId}:${designId}:${roomId}`
  const board = readJson<SharedBoard>(key, emptyBoard(officeId, roomId, id))
  if (!board.items) board.items = []
  if (board.clearedAt) {
    board.items = board.items.filter(item => item.updatedAt > board.clearedAt!)
  }
  return board
}

export function saveBoard(officeId: string, designId: string, roomId: string, board: SharedBoard) {
  const key = boardKey(officeId, designId, roomId)
  const next = { ...board, updatedAt: now() }
  writeJson(key, next)
  return next
}

/** Merge by item id. A newer updatedAt wins, including deletions, so a removed note stays removed. */
export function mergeItems(current: BoardItem[], incoming: BoardItem[]): BoardItem[] {
  const map = new Map<string, BoardItem>()
  for (const item of [...current, ...incoming]) {
    const prev = map.get(item.id)
    if (!prev || item.updatedAt >= prev.updatedAt) map.set(item.id, item)
  }
  return [...map.values()]
}

export function commitItems(
  officeId: string,
  designId: string,
  roomId: string,
  produce: (items: BoardItem[], board: SharedBoard) => BoardItem[],
) {
  const board = loadBoard(officeId, designId, roomId)
  const items = produce(board.items.filter(item => !item.deleted), board)
  return saveBoard(officeId, designId, roomId, { ...board, items: mergeItems(board.items, items) })
}

export function loadDiscussion(officeId: string, designId: string, roomId: string): DiscussionDoc {
  const key = discussionKey(officeId, designId, roomId)
  const doc = readJson<DiscussionDoc>(key, emptyDiscussion(officeId, roomId))
  const live = doc.sessions.find(session => session.status === 'live' && new Date(session.endsAt).getTime() <= Date.now())
  if (live) {
    live.status = 'completed'
    live.endedAt = live.endedAt ?? live.endsAt
    const topic = doc.topics.find(item => item.id === live.topicId)
    if (topic && topic.status === 'active') topic.status = 'completed'
    doc.updatedAt = now()
    writeJson(key, doc)
  }
  return doc
}

export function saveDiscussion(officeId: string, designId: string, roomId: string, doc: DiscussionDoc) {
  const key = discussionKey(officeId, designId, roomId)
  const next = { ...doc, updatedAt: now() }
  writeJson(key, next)
  return next
}

export function subscribeAny(onChange: () => void) {
  const relevant = (key: string | null) => !!key && (key.startsWith(BOARD_PREFIX) || key.startsWith(DISCUSS_PREFIX))
  const onStorage = (event: StorageEvent) => { if (relevant(event.key)) onChange() }
  const onLocal = (event: Event) => { if (relevant((event as CustomEvent<string>).detail)) onChange() }
  window.addEventListener('storage', onStorage)
  window.addEventListener(EVENT, onLocal)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(EVENT, onLocal)
  }
}

export function subscribeCollab(keys: string[], onChange: () => void) {
  const match = (key: string | null) => !!key && keys.includes(key)
  const onStorage = (event: StorageEvent) => {
    if (match(event.key)) onChange()
  }
  const onLocal = (event: Event) => {
    const key = (event as CustomEvent<string>).detail
    if (match(key)) onChange()
  }
  window.addEventListener('storage', onStorage)
  window.addEventListener(EVENT, onLocal)
  return () => {
    window.removeEventListener('storage', onStorage)
    window.removeEventListener(EVENT, onLocal)
  }
}

export function activeSession(doc: DiscussionDoc): DiscussionSession | null {
  return doc.sessions.find(session => session.status === 'live' && new Date(session.endsAt).getTime() > Date.now()) ?? null
}

export function castVote(topic: DiscussionTopic, userId: string, value: -1 | 1): DiscussionTopic {
  const current = topic.votes[userId] ?? 0
  const votes = { ...topic.votes }
  if (current === value) delete votes[userId]
  else votes[userId] = value
  return { ...topic, votes }
}

export function voteCounts(topic: DiscussionTopic) {
  let up = 0
  let down = 0
  for (const value of Object.values(topic.votes)) {
    if (value === 1) up += 1
    if (value === -1) down += 1
  }
  return { up, down, score: up - down }
}

export function findLiveMarker(officeId: string, designId: string): { x: number; y: number; text: string } | null {
  const prefix = `${DISCUSS_PREFIX}${officeId}_${designId}_`
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(prefix)) continue
    try {
      const doc = JSON.parse(localStorage.getItem(key) || '') as DiscussionDoc
      const live = activeSession(doc)
      if (live?.anchor) return { x: live.anchor.x, y: live.anchor.y, text: live.title }
    } catch { /* ignore */ }
  }
  return null
}

/** Pull notes from the old per-object boards into the room board. Nothing is deleted until it is copied. */
export function migrateLegacyBoards(
  officeId: string,
  designId: string,
  roomAt: (x: number, y: number) => string,
) {
  const prefix = `vo_board_${designId}_`
  const groups = new Map<string, { id: string; text: string; kind: 'note' | 'link' }[]>()
  const consumed: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(prefix)) continue
    const match = /use_whiteboard_(\d+)_(\d+)$/.exec(key)
    if (!match) continue
    const roomId = roomAt(Number(match[2]), Number(match[1]))
    let notes: { id: string; text: string; kind?: string }[] = []
    try { notes = JSON.parse(localStorage.getItem(key) || '[]') } catch { notes = [] }
    if (!Array.isArray(notes) || notes.length === 0) {
      consumed.push(key)
      continue
    }
    const bucket = groups.get(roomId) ?? []
    for (const note of notes) {
      if (!note || typeof note.text !== 'string') continue
      bucket.push({ id: String(note.id || `legacy_${bucket.length}`), text: note.text.slice(0, 500), kind: note.kind === 'link' ? 'link' : 'note' })
    }
    groups.set(roomId, bucket)
    consumed.push(key)
  }
  for (const [roomId, notes] of groups) {
    const board = loadBoard(officeId, designId, roomId)
    const existing = new Set(board.items.map(item => item.id))
    const stamp = now()
    const added: BoardItem[] = notes.filter(note => !existing.has(`legacy_${note.id}`)).map((note, index) => ({
      id: `legacy_${note.id}`,
      type: note.kind === 'link' ? 'link' : 'note',
      x: 80 + (index % 4) * 200,
      y: 80 + Math.floor(index / 4) * 160,
      w: note.kind === 'link' ? 220 : 180,
      h: note.kind === 'link' ? 96 : 140,
      color: 'butter',
      text: note.text,
      href: note.kind === 'link' ? note.text : undefined,
      authorId: 'legacy',
      authorName: 'Earlier note',
      createdAt: stamp,
      updatedAt: stamp,
    }))
    if (added.length) saveBoard(officeId, designId, roomId, { ...board, items: mergeItems(board.items, added) })
  }
  for (const key of consumed) localStorage.removeItem(key)
}

const DB_NAME = 'vo_office_assets'
const STORE = 'images'

function openAssets(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE)
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

export async function saveAsset(id: string, blob: Blob) {
  const db = await openAssets()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(blob, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function loadAsset(id: string): Promise<Blob | null> {
  const db = await openAssets()
  const blob = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly')
    const request = tx.objectStore(STORE).get(id)
    request.onsuccess = () => resolve((request.result as Blob) ?? null)
    request.onerror = () => reject(request.error)
  })
  db.close()
  return blob
}

export async function deleteAsset(id: string) {
  const db = await openAssets()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

/** Redrawing the image drops EXIF, including GPS, and shrinks oversized files. */
export async function prepareImage(file: File): Promise<{ full: Blob; thumb: Blob }> {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Use a JPEG, PNG, or WebP image.')
  }
  if (file.size > 8 * 1024 * 1024) {
    throw new Error('Images need to be under 8 MB.')
  }
  const bitmap = await createImageBitmap(file)
  const full = await scaleBlob(bitmap, 1280, 0.82)
  const thumb = await scaleBlob(bitmap, 480, 0.8)
  bitmap.close()
  return { full, thumb }
}

function scaleBlob(bitmap: ImageBitmap, max: number, quality: number): Promise<Blob> {
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(bitmap.width * scale))
  canvas.height = Math.max(1, Math.round(bitmap.height * scale))
  const ctx = canvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Could not prepare that image.'))
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('Could not prepare that image.')), 'image/jpeg', quality)
  })
}
