import type { JamInvitation, OfficeMusicState, SpotifyContent, SpotifyKind, MusicPreferences } from '../types'
import { publishMusic } from '../remote/sync'

const ID = /^[A-Za-z0-9]{22}$/
const KINDS = new Set<SpotifyKind>(['track', 'album', 'playlist'])

function kindOf(value: string): SpotifyKind | null {
  return KINDS.has(value as SpotifyKind) ? value as SpotifyKind : null
}

function contentFrom(kind: SpotifyKind, id: string, title?: string): SpotifyContent {
  return title ? { kind, id, title: cleanTitle(title) } : { kind, id }
}

/** Accept only Spotify track, album, and playlist URLs. The embed address is built from these parts. */
export function parseSpotifyContent(input: string): SpotifyContent | null {
  const raw = input.trim()
  if (!raw || raw.length > 500) return null

  const uri = /^spotify:(track|album|playlist):([A-Za-z0-9]{22})$/.exec(raw)
  if (uri) {
    const kind = kindOf(uri[1])
    return kind ? contentFrom(kind, uri[2]) : null
  }

  let url: URL
  try { url = new URL(raw) } catch { return null }
  if (url.protocol !== 'https:' || url.username || url.password) return null
  if (url.hostname !== 'open.spotify.com') return null

  const parts = url.pathname.split('/').filter(Boolean)
  if (parts[0]?.startsWith('intl-')) parts.shift()
  const kind = kindOf(parts[0] ?? '')
  const id = parts[1] ?? ''
  if (!kind || !ID.test(id) || parts.length > 2) return null
  return contentFrom(kind, id)
}

/** Jam invitations open in Spotify. They are never placed in an iframe. */
export function parseJamInvite(input: string): string | null {
  const raw = input.trim()
  if (!raw || raw.length > 500) return null

  const uri = /^spotify:socialsession:([A-Za-z0-9]{10,32})$/.exec(raw)
  if (uri) return `https://open.spotify.com/socialsession/${uri[1]}`

  let url: URL
  try { url = new URL(raw) } catch { return null }
  if (url.protocol !== 'https:' || url.username || url.password) return null

  if (url.hostname === 'open.spotify.com') {
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts[0]?.startsWith('intl-')) parts.shift()
    if (parts[0] !== 'socialsession' || parts.length !== 2) return null
    if (!/^[A-Za-z0-9]{10,32}$/.test(parts[1])) return null
    return `https://open.spotify.com/socialsession/${parts[1]}`
  }

  if (url.hostname === 'spotify.link' || url.hostname === 'spotify.app.link') {
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length !== 1 || !/^[A-Za-z0-9]{4,32}$/.test(parts[0])) return null
    return `https://${url.hostname}/${parts[0]}`
  }

  return null
}

export function spotifyOpenUrl(content: SpotifyContent): string {
  return `https://open.spotify.com/${content.kind}/${content.id}`
}

export function spotifyEmbedUrl(content: SpotifyContent): string {
  return `https://open.spotify.com/embed/${content.kind}/${content.id}?utm_source=generator`
}

/** Official embed permissions. encrypted-media is required for full tracks; storage-access lets the player see a Spotify login. */
export const SPOTIFY_EMBED_ALLOW = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture; storage-access'

const SESSION_KEY = 'vo_spotify_session'

/** The office remembers that this browser finished Spotify's login window. It never stores a password or token. */
export function loadSpotifyConnected(): boolean {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return false
    const data = JSON.parse(raw) as { at?: unknown }
    return typeof data.at === 'number' && Date.now() - data.at < 1000 * 60 * 60 * 24 * 30
  } catch {
    return false
  }
}

export function saveSpotifyConnected() {
  try { localStorage.setItem(SESSION_KEY, JSON.stringify({ at: Date.now() })) } catch { /* ignore */ }
}

/** Opens Spotify's own login and sends it back to the embedded player. The office never receives the password or a token. */
export function spotifyLoginUrl(returnTo = 'https://open.spotify.com'): string {
  return `https://accounts.spotify.com/login?continue=${encodeURIComponent(returnTo)}`
}

/** A small window over the office. The same name reuses the window instead of opening another tab. */
export function openSpotifyWindow(url: string): Window | null {
  const width = 480
  const height = 740
  const left = Math.max(0, window.screenX + (window.outerWidth - width) / 2)
  const top = Math.max(0, window.screenY + (window.outerHeight - height) / 2)
  const popup = window.open(
    url,
    'vo-spotify',
    `popup=yes,width=${width},height=${height},left=${Math.round(left)},top=${Math.round(top)}`,
  )
  if (!popup) return null
  popup.focus()
  return popup
}

export function spotifyKindLabel(kind: SpotifyKind): string {
  if (kind === 'track') return 'Track'
  if (kind === 'album') return 'Album'
  return 'Playlist'
}

function cleanTitle(value: string): string {
  return value.replace(/[<>]/g, '').trim().slice(0, 140)
}

export async function fetchSpotifyTitle(content: SpotifyContent): Promise<string | null> {
  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(spotifyOpenUrl(content))}`)
    if (!res.ok) return null
    const data = await res.json() as { title?: unknown }
    return typeof data.title === 'string' ? cleanTitle(data.title) : null
  } catch {
    return null
  }
}

const EMPTY: OfficeMusicState = { content: null, jam: null }

export function sanitizeOfficeMusic(value: unknown): OfficeMusicState {
  if (!value || typeof value !== 'object') return EMPTY
  const raw = value as Record<string, unknown>
  const parsed = raw.content ? parseSpotifyContent(
    typeof (raw.content as SpotifyContent).kind === 'string' && typeof (raw.content as SpotifyContent).id === 'string'
      ? `spotify:${(raw.content as SpotifyContent).kind}:${(raw.content as SpotifyContent).id}`
      : ''
  ) : null
  const title = raw.content && typeof (raw.content as SpotifyContent).title === 'string'
    ? cleanTitle((raw.content as SpotifyContent).title as string)
    : undefined
  const content = parsed ? contentFrom(parsed.kind, parsed.id, title) : null

  let jam: JamInvitation | null = null
  if (raw.jam && typeof raw.jam === 'object') {
    const invite = raw.jam as Record<string, unknown>
    const url = typeof invite.url === 'string' ? parseJamInvite(invite.url) : null
    if (url && typeof invite.sharedById === 'string' && typeof invite.sharedByName === 'string' && typeof invite.sharedAt === 'string') {
      jam = {
        url,
        sharedById: invite.sharedById.slice(0, 80),
        sharedByName: cleanTitle(invite.sharedByName).slice(0, 80) || 'Someone',
        sharedAt: invite.sharedAt.slice(0, 40),
      }
    }
  }

  return {
    content,
    updatedById: typeof raw.updatedById === 'string' ? raw.updatedById.slice(0, 80) : undefined,
    updatedByName: typeof raw.updatedByName === 'string' ? cleanTitle(raw.updatedByName).slice(0, 80) : undefined,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt.slice(0, 40) : undefined,
    jam,
  }
}

export function loadOfficeMusic(key: string): OfficeMusicState {
  try {
    const raw = localStorage.getItem(key)
    return raw ? sanitizeOfficeMusic(JSON.parse(raw)) : EMPTY
  } catch {
    return EMPTY
  }
}

export function saveOfficeMusic(key: string, music: OfficeMusicState) {
  const safe = sanitizeOfficeMusic(music)
  try { localStorage.setItem(key, JSON.stringify(safe)) } catch { /* ignore */ }
  publishMusic(key.slice('vo_office_music_'.length), safe)
  window.dispatchEvent(new CustomEvent('vo-music', { detail: key }))
  return safe
}

function playlistPref(value: unknown): SpotifyContent | null {
  if (!value || typeof value !== 'object') return null
  const item = value as { kind?: unknown; id?: unknown; title?: unknown }
  if (typeof item.kind !== 'string' || typeof item.id !== 'string') return null
  const parsed = parseSpotifyContent(`spotify:${item.kind}:${item.id}`)
  if (!parsed) return null
  if (typeof item.title !== 'string') return parsed
  const title = item.title.replace(/[<>]/g, '').trim().slice(0, 140)
  return title ? { ...parsed, title } : parsed
}

export function loadMusicPreferences(): MusicPreferences {
  try {
    const raw = localStorage.getItem('vo_music_prefs')
    const data = raw ? JSON.parse(raw) as Partial<MusicPreferences> : {}
    return {
      hideNotifications: !!data.hideNotifications,
      minimised: !!data.minimised,
      playerOpen: !!data.playerOpen,
      playlist: playlistPref(data.playlist),
    }
  } catch {
    return { hideNotifications: false, minimised: false, playerOpen: false, playlist: null }
  }
}

export function saveMusicPreferences(prefs: MusicPreferences) {
  try { localStorage.setItem('vo_music_prefs', JSON.stringify(prefs)) } catch { /* ignore */ }
}
