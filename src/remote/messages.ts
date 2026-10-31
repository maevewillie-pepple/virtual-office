import type { AvatarConfig, LinkPreview, Message, MessageType } from '../types'
import { isUuid, supabase } from './client'

export interface DmLine {
  id: string
  from: string
  text: string
  ts: number
}

interface MessageRow {
  id: string
  office_id: string
  author_id: string
  author_name: string
  author_avatar: AvatarConfig
  content: string
  type: string
  dm_to: string | null
  reactions: Record<string, string[]>
  link_preview: LinkPreview | null
  created_at: string
}

const TYPES: MessageType[] = ['text', 'link', 'system', 'dm']

function rowToMessage(row: MessageRow): Message {
  const type = TYPES.includes(row.type as MessageType) ? row.type as MessageType : 'text'
  return {
    id: row.id,
    officeId: row.office_id,
    authorId: row.author_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar,
    content: row.content,
    type: row.dm_to ? 'dm' : type,
    timestamp: row.created_at,
    reactions: row.reactions ?? {},
    isDM: !!row.dm_to,
    dmToUserId: row.dm_to ?? undefined,
    linkPreview: row.link_preview ?? undefined,
  }
}

export function messageThreads(rows: Message[], userId: string) {
  const pub: Message[] = []
  const threads: Record<string, DmLine[]> = {}
  for (const message of rows) {
    if (!message.isDM) {
      pub.push(message)
      continue
    }
    const other = message.authorId === userId ? message.dmToUserId : message.authorId
    if (!other) continue
    const line: DmLine = {
      id: message.id,
      from: message.authorId === userId ? 'You' : message.authorName,
      text: message.content,
      ts: new Date(message.timestamp).getTime(),
    }
    threads[other] = [...(threads[other] ?? []), line]
  }
  return { messages: pub, threads }
}

export async function loadOfficeMessages(officeId: string, userId: string) {
  const client = supabase()
  if (!client || !isUuid(officeId)) return { messages: [] as Message[], threads: {} as Record<string, DmLine[]> }
  const { data, error } = await client.from('messages').select('*').eq('office_id', officeId).order('created_at', { ascending: true }).limit(300)
  if (error) throw new Error(error.message)
  return messageThreads(((data ?? []) as MessageRow[]).map(rowToMessage), userId)
}

export async function sendOfficeMessage(message: Message, dmTo?: string) {
  const client = supabase()
  if (!client || !isUuid(message.officeId) || !isUuid(message.authorId)) return
  const { error } = await client.from('messages').insert({
    id: message.id,
    office_id: message.officeId,
    author_id: message.authorId,
    author_name: message.authorName,
    author_avatar: message.authorAvatar,
    content: message.content,
    type: dmTo ? 'dm' : message.type,
    dm_to: dmTo ?? null,
    reactions: message.reactions,
    link_preview: message.linkPreview ?? null,
    created_at: message.timestamp,
  })
  if (error) throw new Error(error.message)
}

export async function saveReaction(messageId: string, reactions: Record<string, string[]>) {
  const client = supabase()
  if (!client) return
  const { error } = await client.from('messages').update({ reactions }).eq('id', messageId)
  if (error) throw new Error(error.message)
}

export function subscribeOfficeMessages(officeId: string, onChange: (message: Message) => void) {
  const client = supabase()
  if (!client || !isUuid(officeId)) return () => {}
  const channel = client.channel(`messages:${officeId}`)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `office_id=eq.${officeId}` }, payload => {
      const row = payload.new as MessageRow
      if (!row?.id) return
      onChange(rowToMessage(row))
    })
    .subscribe()
  return () => { void client.removeChannel(channel) }
}
