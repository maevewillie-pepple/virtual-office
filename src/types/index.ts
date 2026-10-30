// ─── Core Domain Types ────────────────────────────────────────────────────────

export type PresenceStatus = 'online' | 'focusing' | 'on_break' | 'away' | 'do_not_disturb' | 'offline'
export type OfficeMembership = 'owner' | 'admin' | 'member'
export type OfficeTheme = 'cosy_studio' | 'creative_loft' | 'quiet_library'

// ─── User & Avatar ────────────────────────────────────────────────────────────

export interface SkinTone {
  id: string
  color: string
  name: string
}

export interface AvatarConfig {
  // EXISTING — preserved for backward compatibility
  skinTone: string        // color hex
  hairStyle: string       // widened: all legacy values still valid
  hairColor: string       // color hex
  outfit: string          // legacy outfit key — used as top fallback
  outfitColor: string     // legacy — used as topColor fallback
  accessory: string       // legacy — 'none'|'glasses'|'headphones'|'hat'|'scarf'

  // FACE — all optional
  eyeColor?: string       // hex; defaults to dark brown
  eyeShape?: 'round' | 'almond' | 'wide'
  browStyle?: 'default' | 'arched' | 'thick'
  freckles?: boolean

  // INDEPENDENT CLOTHING — all optional, fall back to outfit/outfitColor
  top?: string            // 'tshirt'|'hoodie'|'sweater'|'blouse'|'shirt'|'polo'|'turtleneck'
  topColor?: string
  bottom?: string         // 'jeans'|'trousers'|'shorts'|'skirt'|'wide_leg'
  bottomColor?: string
  shoes?: string          // 'sneakers'|'boots'|'loafers'|'flats'
  shoesColor?: string
  outerwear?: string      // 'none'|'blazer'|'jacket'|'vest'
  outerwearColor?: string

  // MULTIPLE ACCESSORY SLOTS — all optional
  glasses?: string        // 'none'|'round'|'rectangular'|'sunglasses'
  headwear?: string       // 'none'|'hat'|'beanie'|'cap'|'headphones'
  neckwear?: string       // 'none'|'scarf'|'tie'
}

export interface AvatarPreset {
  id: string
  name: string
  config: AvatarConfig
  isDefault?: boolean
}

export interface User {
  id: string
  name: string
  email: string
  avatar: AvatarConfig
  status: PresenceStatus
  statusMessage?: string
  joinedAt: string
  isDemo?: boolean
  mutedNudges?: boolean
  mutedSounds?: boolean
  blockedUsers?: string[]
}

// ─── Office ──────────────────────────────────────────────────────────────────

export interface Office {
  id: string
  name: string
  description: string
  theme: OfficeTheme
  ownerId: string
  inviteCode: string
  createdAt: string
  memberCount: number
  onlineCount: number
  coverEmoji?: string
}

export interface Membership {
  userId: string
  officeId: string
  role: OfficeMembership
  joinedAt: string
  deskId?: string
}

// ─── Map & Desks ──────────────────────────────────────────────────────────────

export type OfficeArtTheme = 'classic' | 'library' | 'loft' | 'studio' | 'lab'

export type TileType =
  | 'floor_oak'
  | 'floor_carpet_blue'
  | 'floor_carpet_teal'
  | 'floor_tile'
  | 'floor_stone'
  | 'floor_wood_light'
  | 'floor_grass'
  | 'floor_concrete'
  | 'wall'
  | 'wall_window'
  | 'window_h'
  | 'window_v'
  | 'door'
  | 'desk'
  | 'chair'
  | 'bookshelf'
  | 'plant_small'
  | 'plant_large'
  | 'plant_flowers'
  | 'sofa_h'
  | 'sofa_v'
  | 'coffee_table'
  | 'coffee_machine'
  | 'lamp'
  | 'rug'
  | 'game_table'
  | 'whiteboard'
  | 'meeting_table'
  | 'pool_table'
  | 'arcade_machine'
  | 'fireplace'
  | 'server_rack'
  | 'fridge'
  | 'kettle'
  | 'counter'
  | 'bar_stool'
  | 'focus_pod'
  | 'stairs'
  | 'empty'

export interface Tile {
  type: TileType
  walkable: boolean
  /** Floor hidden underneath a furniture tile, so the room reads continuously. */
  base?: TileType
  /** 's' flips a desk or chair so a pair can sit across one bench. */
  facing?: 'n' | 's'
  deskId?: string
  interactable?: boolean
  interactionId?: string
}

export interface Desk {
  id: string
  label: string
  gridX: number
  gridY: number
  ownerId?: string
  ownerName?: string
  isAvailable: boolean
}

export interface Position {
  x: number
  y: number
  gridX: number
  gridY: number
}

// ─── Chat ─────────────────────────────────────────────────────────────────────

export type MessageType = 'text' | 'link' | 'system' | 'dm'

export interface Message {
  id: string
  officeId: string
  authorId: string
  authorName: string
  authorAvatar: AvatarConfig
  content: string
  type: MessageType
  timestamp: string
  reactions: Record<string, string[]>  // emoji → userId[]
  isDM?: boolean
  dmToUserId?: string
  linkPreview?: LinkPreview
}

export interface LinkPreview {
  url: string
  title: string
  description?: string
  image?: string
  domain: string
}

export interface SharedLink {
  id: string
  url: string
  title: string
  sharedById: string
  sharedByName: string
  timestamp: string
  preview?: LinkPreview
}

// ─── Focus / Presence Features ────────────────────────────────────────────────

export type FocusDuration = number

export interface FocusHistoryEntry {
  id: string
  topic?: string
  duration: number
  startedAt: string
  endedAt: string
  completed: boolean
}

export interface FocusSession {
  userId: string
  duration: FocusDuration
  startedAt: string
  endsAt: string
  paused: boolean
  pausedAt?: string
}

export interface CoffeeBreak {
  userId: string
  startedAt: string
}

export interface MusicTrack {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverArt?: string
}

export interface MusicState {
  connected: boolean
  playing: boolean
  currentTrack?: MusicTrack
  queue: MusicTrack[]
  listeners: string[]  // userIds
  votes: Record<string, string[]>  // trackId → userId[]
}

export type SpotifyKind = 'track' | 'album' | 'playlist'

/** A playlist, album, or track the office has chosen to embed. Playback stays in Spotify. */
export interface SpotifyContent {
  kind: SpotifyKind
  id: string
  title?: string
}

export interface JamInvitation {
  url: string
  sharedById: string
  sharedByName: string
  sharedAt: string
}

export interface OfficeMusicState {
  content: SpotifyContent | null
  updatedById?: string
  updatedByName?: string
  updatedAt?: string
  jam: JamInvitation | null
}

export interface MusicPreferences {
  hideNotifications: boolean
  minimised: boolean
  /** The docked player stays on the office until the listener closes it. */
  playerOpen: boolean
  /** A playlist this listener chose for themselves. It is not the office Jam. */
  playlist: SpotifyContent | null
}

// ─── Social Interactions ──────────────────────────────────────────────────────

export type SocialActionType =
  | 'wave'
  | 'nudge'
  | 'give_coffee'
  | 'dm'
  | 'invite_break'
  | 'invite_game'
  | 'focus_together'

export type WaveEmoji = '👋' | '❤️' | '😄' | '👍' | '🎉'

export interface SocialAction {
  id: string
  type: SocialActionType
  senderId: string
  senderName: string
  recipientId: string
  timestamp: string
  payload?: {
    emoji?: WaveEmoji
    message?: string
    duration?: FocusDuration
    gameName?: string
    location?: string
  }
  status?: 'pending' | 'accepted' | 'declined' | 'expired'
}

export interface SocialNotificationItem {
  id: string
  action: SocialAction
  senderName: string
  senderAvatar: AvatarConfig
  message: string
  dismissedAt?: string
}

// ─── Object Interactions ─────────────────────────────────────────────────────

export type ObjectInteractionType =
  | 'brew_coffee'
  | 'make_tea'
  | 'sit'
  | 'use_whiteboard'
  | 'play_game'
  | 'toggle_fireplace'
  | 'ring_bell'
  | 'view_bookshelf'
  | 'use_arcade'
  | 'secret_nook'
  | 'water_plants'
  | 'feed_cat'
  | 'use_server'
  | 'play_pool'
  | 'grab_drink'
  | 'use_meeting'
  | 'use_table'
  | 'use_desk'

export interface InteractableObject {
  id: string
  type: ObjectInteractionType
  gridX: number
  gridY: number
  label: string
  prompt: string   // "Enter · Brew coffee"
  officeId?: string
  /** Every tile this object occupies. Proximity uses these, not only the anchor. */
  cells?: { x: number; y: number }[]
}

// ─── App State ────────────────────────────────────────────────────────────────

export interface AppState {
  currentUser: User | null
  currentOfficeId: string | null
  offices: Office[]
  memberships: Membership[]
}

// ─── Map Config ───────────────────────────────────────────────────────────────

export interface OfficeMap {
  width: number   // tiles
  height: number  // tiles
  tileSize: number  // pixels
  tiles: Tile[][]
  desks: Desk[]
  spawnPoints: { x: number; y: number }[]
  interactables?: InteractableObject[]
  areaLabels?: { text: string; gridX: number; gridY: number }[]
  theme?: OfficeArtTheme
}

// ─── Carryable Items ─────────────────────────────────────────────────────────

export type CafeDrink = 'espresso' | 'latte' | 'cappuccino' | 'flat_white' | 'cocoa' | 'tea'
export type LatteArt = 'heart' | 'rosetta' | 'tulip' | 'swirl'

export interface FinishedDrink {
  kind: 'drink'
  token: string
  drink: CafeDrink
  stars: number
  art?: LatteArt
  tea?: string
  topping?: string
}

export type CarriedItem = 'coffee_mug' | 'tea_mug' | 'book' | FinishedDrink

// ─── Speech Bubbles ──────────────────────────────────────────────────────────

export interface SpeechBubble {
  id: string
  userId: string
  text: string
  type: 'chat' | 'reaction' | 'status'
  expiresAt: number
}

// ─── Online presence ─────────────────────────────────────────────────────────

export interface OnlineUser {
  user: User
  position: Position
  deskId?: string
  focusSession?: FocusSession
  coffeeBreak?: CoffeeBreak
  isCurrentUser?: boolean
  room?: string
  carriedItem?: CarriedItem
  seated?: boolean
  sipping?: boolean
  brewing?: boolean
  gaming?: boolean
}
