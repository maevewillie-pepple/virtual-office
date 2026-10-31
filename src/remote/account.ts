import type { AvatarConfig, Office, OfficeArtTheme, OfficeMembership, OfficeTheme, User } from '../types'
import { isUuid, supabase } from './client'

const THEMES: OfficeTheme[] = ['cosy_studio', 'creative_loft', 'quiet_library']
const LAYOUTS: OfficeArtTheme[] = ['classic', 'library', 'loft', 'studio', 'lab']

export interface OfficeRecord {
  office: Office
  role: OfficeMembership
}

interface ProfileRow {
  id: string
  name: string
  email: string
  avatar: AvatarConfig
  status_message: string | null
  muted_nudges: boolean
  muted_sounds: boolean
  blocked_users: string[] | null
  joined_at: string
}

interface OfficeViewRow {
  id: string
  name: string
  description: string
  theme: string
  layout: string
  owner_id: string
  invite_code: string
  cover_emoji: string | null
  created_at: string
  role: OfficeMembership
  member_count: number
}

function db() {
  const client = supabase()
  if (!client) throw new Error('Add the Supabase URL and anon key to .env.local, then restart.')
  return client
}

export function profileToUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    avatar: row.avatar,
    status: 'online',
    statusMessage: row.status_message ?? undefined,
    joinedAt: row.joined_at,
    mutedNudges: row.muted_nudges,
    mutedSounds: row.muted_sounds,
    blockedUsers: row.blocked_users ?? [],
  }
}

function officeFrom(row: OfficeViewRow): OfficeRecord {
  const theme = THEMES.includes(row.theme as OfficeTheme) ? row.theme as OfficeTheme : 'cosy_studio'
  const layout = LAYOUTS.includes(row.layout as OfficeArtTheme) ? row.layout as OfficeArtTheme : 'classic'
  return {
    role: row.role,
    office: {
      id: row.id,
      name: row.name,
      description: row.description,
      theme,
      layout,
      ownerId: row.owner_id,
      inviteCode: row.invite_code,
      createdAt: row.created_at.slice(0, 10),
      memberCount: row.member_count,
      onlineCount: 0,
      coverEmoji: row.cover_emoji ?? undefined,
    },
  }
}

async function loadProfile(userId: string): Promise<User> {
  const { data, error } = await db().from('profiles').select('*').eq('id', userId).maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error('Your profile is not ready yet. Try signing in again.')
  return profileToUser(data as ProfileRow)
}

export async function loadMyOffices(): Promise<OfficeRecord[]> {
  const { data, error } = await db().from('my_offices').select('*')
  if (error) throw new Error(error.message)
  return ((data ?? []) as OfficeViewRow[]).map(officeFrom)
}

export async function signUp(name: string, email: string, password: string): Promise<User> {
  const { data, error } = await db().auth.signUp({
    email: email.trim(),
    password,
    options: { data: { name: name.trim() || email.split('@')[0] } },
  })
  if (error) throw new Error(error.message)
  if (!data.session || !data.user) {
    throw new Error('Check your email to confirm the account, then sign in. For a free start, turn off Confirm email in Supabase.')
  }
  return loadProfile(data.user.id)
}

export async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await db().auth.signInWithPassword({ email: email.trim(), password })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('Sign in failed.')
  return loadProfile(data.user.id)
}

export async function signOut() {
  const client = supabase()
  if (!client) return
  await client.auth.signOut()
}

export async function restoreSession(): Promise<{ user: User; offices: OfficeRecord[] } | null> {
  const client = supabase()
  if (!client) return null
  const { data, error } = await client.auth.getSession()
  if (error || !data.session?.user) return null
  const user = await loadProfile(data.session.user.id)
  const offices = await loadMyOffices()
  return { user, offices }
}

export function watchSession(onChange: (user: User | null) => void) {
  const client = supabase()
  if (!client) return () => {}
  const { data } = client.auth.onAuthStateChange((event, session) => {
    if (event !== 'SIGNED_OUT' && event !== 'SIGNED_IN') return
    if (!session?.user) {
      onChange(null)
      return
    }
    void loadProfile(session.user.id).then(onChange).catch(() => onChange(null))
  })
  return () => data.subscription.unsubscribe()
}

export async function saveProfile(user: User) {
  if (!isUuid(user.id)) return
  const { error } = await db().from('profiles').update({
    name: user.name,
    avatar: user.avatar,
    status_message: user.statusMessage ?? null,
    muted_nudges: !!user.mutedNudges,
    muted_sounds: !!user.mutedSounds,
    blocked_users: user.blockedUsers ?? [],
  }).eq('id', user.id)
  if (error) throw new Error(error.message)
}

export async function createRemoteOffice(draft: {
  name: string
  description: string
  theme: string
  layout: string
  inviteCode: string
  coverEmoji?: string
}): Promise<OfficeRecord> {
  const { error } = await db().rpc('create_office', {
    p_name: draft.name,
    p_description: draft.description,
    p_theme: draft.theme,
    p_layout: draft.layout,
    p_invite: draft.inviteCode,
    p_emoji: draft.coverEmoji ?? '',
  })
  if (error) throw new Error(error.message)
  const offices = await loadMyOffices()
  const created = offices.find(item => item.office.inviteCode.toUpperCase() === draft.inviteCode.toUpperCase())
  if (!created) throw new Error('The office was created, but it could not be opened.')
  return created
}

export async function joinRemoteOffice(code: string): Promise<OfficeRecord> {
  const { error } = await db().rpc('join_office', { p_code: code })
  if (error) throw new Error(error.message)
  const offices = await loadMyOffices()
  const match = offices.find(item => item.office.inviteCode.toUpperCase() === code.trim().toUpperCase())
  if (!match) throw new Error('No office uses that code.')
  return match
}

export async function renameRemoteOffice(officeId: string, name: string) {
  if (!isUuid(officeId)) return
  const { error } = await db().from('offices').update({ name: name.slice(0, 80) }).eq('id', officeId)
  if (error) throw new Error(error.message)
}

export async function claimRemoteDesk(officeId: string, deskId: string | null) {
  const client = supabase()
  if (!client || !isUuid(officeId)) return
  const { data } = await client.auth.getUser()
  if (!data.user) return
  const { error } = await client.from('memberships').update({ desk_id: deskId }).eq('office_id', officeId).eq('user_id', data.user.id)
  if (error) throw new Error(error.message)
}
