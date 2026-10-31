import { demoOffices } from '../data/mockData'
import { loadAsset } from '../collaboration/store'
import type { Office } from '../types'
import type { BoardItem } from '../collaboration/store'
import { createRemoteOffice, loadMyOffices, type OfficeRecord } from './account'
import { isRemoteConfigured, supabase } from './client'

const FLAG = 'vo_remote_import_done'
const MAP = 'vo_import_map'
const CREATED = 'vo_created_offices'
const LAYOUTS = ['classic', 'library', 'loft', 'studio', 'lab'] as const

function readMap(): Record<string, string> {
  try {
    const parsed = JSON.parse(localStorage.getItem(MAP) || '{}') as Record<string, string>
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function createdOffices(): Office[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(CREATED) || '[]') as Office[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function officeHasRoomData(officeId: string) {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i) || ''
    if (!key.includes(officeId)) continue
    if (
      key.startsWith('vo_shared_board_') ||
      key.startsWith('vo_discussion_') ||
      key.startsWith('vo_tasks_') ||
      key.startsWith('vo_arcade_') ||
      key.startsWith('vo_notices_') ||
      key.startsWith('vo_office_music_')
    ) return true
  }
  return false
}

export function officesWaitingToImport(): Office[] {
  if (!isRemoteConfigured() || localStorage.getItem(FLAG) === '1') return []
  const seen = new Set<string>()
  const list: Office[] = []
  for (const office of [...createdOffices(), ...demoOffices]) {
    if (seen.has(office.id)) continue
    const created = createdOffices().some(item => item.id === office.id)
    if (!created && !officeHasRoomData(office.id)) continue
    seen.add(office.id)
    list.push(office)
  }
  return list
}

function freshCode() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const chunk = () => Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('')
  return `${chunk()}-${chunk()}`
}

async function ensureOffice(office: Office, mapped: Record<string, string>): Promise<OfficeRecord> {
  if (mapped[office.id]) {
    const offices = await loadMyOffices()
    const existing = offices.find(item => item.office.id === mapped[office.id])
    if (existing) return existing
  }
  const draft = {
    name: office.name,
    description: office.description,
    theme: office.theme,
    layout: office.layout ?? 'classic',
    inviteCode: office.inviteCode || freshCode(),
    coverEmoji: office.coverEmoji,
  }
  try {
    return await createRemoteOffice(draft)
  } catch {
    return createRemoteOffice({ ...draft, inviteCode: freshCode() })
  }
}

function keysFor(prefix: string, officeId: string) {
  const keys: string[] = []
  const head = `${prefix}${officeId}`
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key?.startsWith(head)) continue
    if (key.length === head.length || key[head.length] === '_') keys.push(key)
  }
  return keys
}

async function copyJson(table: string, row: Record<string, unknown>) {
  const db = supabase()
  if (!db) return
  const { error } = await db.from(table).upsert({ ...row, updated_at: new Date().toISOString() })
  if (error) throw new Error(error.message)
}

async function copyAssets(officeId: string, doc: { items?: BoardItem[] }) {
  for (const item of doc.items ?? []) {
    if (!item.assetId) continue
    for (const assetId of [item.assetId, `${item.assetId}_full`]) {
      const blob = await loadAsset(assetId)
      if (!blob) continue
      const db = supabase()
      if (!db) return
      await db.storage.from('board-assets').upload(`${officeId}/${assetId}`, blob, {
        upsert: true,
        contentType: blob.type || 'image/jpeg',
      })
    }
  }
}

export async function importLocalOffices(): Promise<OfficeRecord[]> {
  const waiting = officesWaitingToImport()
  const mapped = readMap()
  const imported: OfficeRecord[] = []
  for (const office of waiting) {
    const record = await ensureOffice(office, mapped)
    mapped[office.id] = record.office.id
    localStorage.setItem(MAP, JSON.stringify(mapped))
    const next = record.office.id
    const layout = office.layout && LAYOUTS.includes(office.layout as typeof LAYOUTS[number]) ? office.layout : 'classic'

    for (const key of keysFor('vo_shared_board_', office.id)) {
      const match = key.match(/_(classic|library|loft|studio|lab)_(.+)$/)
      if (!match) continue
      const doc = JSON.parse(localStorage.getItem(key) || '{}')
      await copyJson('boards', { office_id: next, design_id: match[1], room_id: match[2], doc })
      await copyAssets(next, doc)
    }
    for (const key of keysFor('vo_discussion_', office.id)) {
      const match = key.match(/_(classic|library|loft|studio|lab)_(.+)$/)
      if (!match) continue
      await copyJson('discussions', {
        office_id: next,
        design_id: match[1],
        room_id: match[2],
        doc: JSON.parse(localStorage.getItem(key) || '{}'),
      })
    }
    const tasks = localStorage.getItem(`vo_tasks_${office.id}`)
    if (tasks) await copyJson('task_boards', { office_id: next, doc: JSON.parse(tasks) })
    const arcade = localStorage.getItem(`vo_arcade_${office.id}`)
    if (arcade) await copyJson('arcade_docs', { office_id: next, doc: JSON.parse(arcade) })
    const music = localStorage.getItem(`vo_office_music_${office.id}`)
    if (music) await copyJson('office_music', { office_id: next, doc: JSON.parse(music) })
    const notices = localStorage.getItem(`vo_notices_${office.id}`)
    if (notices) await copyJson('notice_docs', { office_id: next, doc: JSON.parse(notices) })
    const notes = localStorage.getItem(`vo_notes_${layout}`)
    if (notes) await copyJson('desk_notes', { office_id: next, design_id: layout, doc: JSON.parse(notes) })
    const plants = localStorage.getItem(`vo_plants_${layout}`)
    if (plants) await copyJson('plants', { office_id: next, design_id: layout, doc: JSON.parse(plants) })
    imported.push(record)
  }
  localStorage.setItem(FLAG, '1')
  return imported
}
