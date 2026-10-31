import type {
  User, Office, Membership, Message, OnlineUser,
  AvatarConfig, Desk, MusicState, MusicTrack, SharedLink, CoffeeBreak
} from '../types'

// ─── Avatar Configs ──────────────────────────────────────────────────────────

export const SKIN_TONES = [
  { id: 't1',  color: '#FDEBD0', name: 'Porcelain' },
  { id: 't2',  color: '#FDDBB4', name: 'Ivory' },
  { id: 't3',  color: '#F5CBA7', name: 'Cream' },
  { id: 't4',  color: '#EDB98A', name: 'Peach' },
  { id: 't5',  color: '#E6A87C', name: 'Sand' },
  { id: 't6',  color: '#D4905A', name: 'Golden' },
  { id: 't7',  color: '#C8804A', name: 'Honey' },
  { id: 't8',  color: '#BD6E3A', name: 'Caramel' },
  { id: 't9',  color: '#A05C2E', name: 'Toffee' },
  { id: 't10', color: '#8A4520', name: 'Chestnut' },
  { id: 't11', color: '#733018', name: 'Mahogany' },
  { id: 't12', color: '#5C2510', name: 'Umber' },
  { id: 't13', color: '#472010', name: 'Espresso' },
  { id: 't14', color: '#321508', name: 'Ebony' },
]

export const HAIR_COLORS = [
  // Naturals
  '#1A0A00', '#2C1810', '#4A3728', '#6B4A30', '#8B5E3C',
  '#A87040', '#C4956A', '#D4B08A', '#E8C99A', '#F0DDB8',
  '#F5F0E8', '#C8A040',
  // Creative
  '#C44B4B', '#E87050', '#E3B775', '#8BC455', '#4BC488',
  '#4BA8C4', '#7088C4', '#9B6AC4', '#C46AB0', '#C46080',
]

export const OUTFIT_COLORS = [
  '#658B86', '#303D4E', '#C48F9A', '#E3B775', '#9FBA8F',
  '#A67B5B', '#192331', '#F2E8D8', '#5B7FA6', '#8B4513',
  '#7A5C8A', '#4A7A4A', '#C4444A', '#E87050', '#486090',
]

export const EYE_COLORS = [
  '#3D2B1A', '#4A3520', '#5C4030', '#6B5040',
  '#3D5A80', '#4A7088', '#658BA0', '#7BA8B0',
  '#4A6840', '#5C8050', '#7A9A60', '#90B078',
  '#8B6B40', '#A08050', '#B89860',
  '#404050', '#505868',
]

export const HAIRSTYLES_V2 = [
  { id: 'buzz',        label: 'Buzz',         group: 'short' },
  { id: 'short',       label: 'Short',        group: 'short' },
  { id: 'pixie',       label: 'Pixie',        group: 'short' },
  { id: 'fringe',      label: 'Fringe',       group: 'medium' },
  { id: 'medium',      label: 'Medium',       group: 'medium' },
  { id: 'wavy',        label: 'Wavy',         group: 'medium' },
  { id: 'long',        label: 'Long',         group: 'long' },
  { id: 'bun',         label: 'High Bun',     group: 'up' },
  { id: 'low_bun',     label: 'Low Bun',      group: 'up' },
  { id: 'ponytail',    label: 'Ponytail',     group: 'up' },
  { id: 'half_up',     label: 'Half-up',      group: 'up' },
  { id: 'pigtails',    label: 'Pigtails',     group: 'up' },
  { id: 'curly',       label: 'Curly',        group: 'curly' },
  { id: 'afro',        label: 'Afro',         group: 'curly' },
  { id: 'afro_tapered',label: 'Tapered Afro', group: 'curly' },
  { id: 'twists',      label: 'Twists',       group: 'textured' },
  { id: 'braids',      label: 'Braids',       group: 'textured' },
  { id: 'cornrows',    label: 'Cornrows',     group: 'textured' },
  { id: 'locs',        label: 'Locs',         group: 'textured' },
  { id: 'coils',       label: 'Coils',        group: 'textured' },
]

export const CLOTHING_TOPS = [
  { id: 'tshirt',     label: 'T-Shirt' },
  { id: 'shirt',      label: 'Shirt' },
  { id: 'hoodie',     label: 'Hoodie' },
  { id: 'sweater',    label: 'Sweater' },
  { id: 'blouse',     label: 'Blouse' },
  { id: 'polo',       label: 'Polo' },
  { id: 'turtleneck', label: 'Turtleneck' },
  { id: 'crop',       label: 'Crop Top' },
]

export const CLOTHING_BOTTOMS = [
  { id: 'jeans',     label: 'Jeans' },
  { id: 'trousers',  label: 'Trousers' },
  { id: 'shorts',    label: 'Shorts' },
  { id: 'skirt',     label: 'Skirt' },
  { id: 'wide_leg',  label: 'Wide Leg' },
]

export const CLOTHING_SHOES = [
  { id: 'sneakers', label: 'Sneakers' },
  { id: 'boots',    label: 'Boots' },
  { id: 'loafers',  label: 'Loafers' },
  { id: 'flats',    label: 'Flats' },
]

export const CLOTHING_OUTERWEAR = [
  { id: 'none',    label: 'None' },
  { id: 'blazer',  label: 'Blazer' },
  { id: 'jacket',  label: 'Jacket' },
  { id: 'vest',    label: 'Vest' },
]

export const ACCESSORY_GLASSES = [
  { id: 'none',        label: 'None' },
  { id: 'round',       label: 'Round' },
  { id: 'rectangular', label: 'Rectangular' },
  { id: 'sunglasses',  label: 'Sunnies' },
]

export const ACCESSORY_HEADWEAR = [
  { id: 'none',        label: 'None' },
  { id: 'hat',         label: 'Hat' },
  { id: 'beanie',      label: 'Beanie' },
  { id: 'cap',         label: 'Cap' },
  { id: 'headphones',  label: 'Headphones' },
]

export const ACCESSORY_NECKWEAR = [
  { id: 'none',  label: 'None' },
  { id: 'scarf', label: 'Scarf' },
  { id: 'tie',   label: 'Tie' },
]

// ─── Demo Users ───────────────────────────────────────────────────────────────

export const demoAvatars: AvatarConfig[] = [
  { skinTone: '#D08B5B', hairStyle: 'bun', hairColor: '#2C1810', outfit: 'tshirt', outfitColor: '#658B86', accessory: 'none', top: 'tshirt', bottom: 'jeans', shoes: 'sneakers' },
  { skinTone: '#FDDBB4', hairStyle: 'short', hairColor: '#F2D49B', outfit: 'hoodie', outfitColor: '#303D4E', accessory: 'glasses', top: 'hoodie', bottom: 'trousers', shoes: 'boots', glasses: 'round' },
  { skinTone: '#AE5D29', hairStyle: 'curly', hairColor: '#4A3728', outfit: 'blouse', outfitColor: '#C48F9A', accessory: 'headphones', top: 'blouse', bottom: 'skirt', shoes: 'flats' },
  { skinTone: '#EDB98A', hairStyle: 'long', hairColor: '#8B5E3C', outfit: 'shirt', outfitColor: '#192331', accessory: 'none', top: 'shirt', bottom: 'trousers', shoes: 'loafers', outerwear: 'blazer', outerwearColor: '#303D4E', neckwear: 'tie' },
  { skinTone: '#694d3d', hairStyle: 'ponytail', hairColor: '#303D4E', outfit: 'sweater', outfitColor: '#E3B775', accessory: 'scarf', top: 'sweater', bottom: 'wide_leg', shoes: 'boots', neckwear: 'scarf' },
  { skinTone: '#FDDBB4', hairStyle: 'medium', hairColor: '#C4956A', outfit: 'polo', outfitColor: '#9FBA8F', accessory: 'hat', top: 'polo', bottom: 'shorts', shoes: 'sneakers', headwear: 'hat' },
]

export const demoUsers: User[] = [
  { id: 'demo_current', name: 'You', email: 'you@example.com', avatar: demoAvatars[0], status: 'online', joinedAt: '2024-01-15', isDemo: false },
  { id: 'demo_1', name: 'Mia Chen', email: 'mia@example.com', avatar: demoAvatars[1], status: 'focusing', statusMessage: 'Deep work – back at 3pm', joinedAt: '2024-01-10', isDemo: true },
  { id: 'demo_2', name: 'Rowan Ellis', email: 'rowan@example.com', avatar: demoAvatars[2], status: 'on_break', statusMessage: 'Coffee run ☕', joinedAt: '2024-01-12', isDemo: true },
  { id: 'demo_3', name: 'Priya Nair', email: 'priya@example.com', avatar: demoAvatars[3], status: 'online', joinedAt: '2024-01-08', isDemo: true },
  { id: 'demo_4', name: 'Sam Torres', email: 'sam@example.com', avatar: demoAvatars[4], status: 'away', statusMessage: 'Lunch break', joinedAt: '2024-01-11', isDemo: true },
  { id: 'demo_5', name: 'Jordan Blake', email: 'jordan@example.com', avatar: demoAvatars[5], status: 'online', joinedAt: '2024-01-14', isDemo: true },
]

// ─── Offices ─────────────────────────────────────────────────────────────────

export const demoOffices: Office[] = [
  {
    id: 'office_main',
    name: 'Studio Moth',
    description: 'Our cosy little corner for making things',
    theme: 'cosy_studio',
    layout: 'classic',
    ownerId: 'demo_current',
    inviteCode: 'MOTH-7X2K',
    createdAt: '2024-01-10',
    memberCount: 6,
    onlineCount: 4,
    coverEmoji: '🦋',
  },
  {
    id: 'office_2',
    name: 'Quiet Library',
    description: 'Focused reading and research sessions',
    theme: 'quiet_library',
    layout: 'library',
    ownerId: 'demo_3',
    inviteCode: 'LIB-9P3M',
    createdAt: '2024-01-05',
    memberCount: 3,
    onlineCount: 1,
    coverEmoji: '📚',
  },
]

export const demoMemberships: Membership[] = [
  { userId: 'demo_current', officeId: 'office_main', role: 'owner', joinedAt: '2024-01-10', deskId: 'desk_1' },
  { userId: 'demo_1', officeId: 'office_main', role: 'member', joinedAt: '2024-01-10', deskId: 'desk_2' },
  { userId: 'demo_2', officeId: 'office_main', role: 'member', joinedAt: '2024-01-12', deskId: 'desk_3' },
  { userId: 'demo_3', officeId: 'office_main', role: 'admin', joinedAt: '2024-01-08', deskId: 'desk_4' },
  { userId: 'demo_4', officeId: 'office_main', role: 'member', joinedAt: '2024-01-11' },
  { userId: 'demo_5', officeId: 'office_main', role: 'member', joinedAt: '2024-01-14', deskId: 'desk_5' },
]

// ─── Desks ───────────────────────────────────────────────────────────────────

export const demoDesks: Desk[] = [
  { id: 'desk_1', label: 'A1', gridX: 3, gridY: 3, ownerId: 'demo_current', ownerName: 'You', isAvailable: false },
  { id: 'desk_2', label: 'A2', gridX: 5, gridY: 3, ownerId: 'demo_1', ownerName: 'Mia Chen', isAvailable: false },
  { id: 'desk_3', label: 'B1', gridX: 7, gridY: 3, ownerId: 'demo_2', ownerName: 'Rowan Ellis', isAvailable: false },
  { id: 'desk_4', label: 'B2', gridX: 3, gridY: 6, ownerId: 'demo_3', ownerName: 'Priya Nair', isAvailable: false },
  { id: 'desk_5', label: 'C1', gridX: 5, gridY: 6, ownerId: 'demo_5', ownerName: 'Jordan Blake', isAvailable: false },
  { id: 'desk_6', label: 'C2', gridX: 7, gridY: 6, isAvailable: true },
]

// ─── Messages ────────────────────────────────────────────────────────────────

const ts = (minsAgo: number) => {
  const d = new Date()
  d.setMinutes(d.getMinutes() - minsAgo)
  return d.toISOString()
}

export const demoMessages: Message[] = [
  {
    id: 'msg_1', officeId: 'office_main', authorId: 'demo_3', authorName: 'Priya Nair',
    authorAvatar: demoAvatars[3], content: 'Morning everyone! Ready for another productive session 🌅',
    type: 'text', timestamp: ts(62), reactions: { '☀️': ['demo_1', 'demo_5'] },
  },
  {
    id: 'msg_2', officeId: 'office_main', authorId: 'demo_1', authorName: 'Mia Chen',
    authorAvatar: demoAvatars[1], content: 'Morning! Already got my coffee, starting on the landing page redesign',
    type: 'text', timestamp: ts(58), reactions: {},
  },
  {
    id: 'msg_3', officeId: 'office_main', authorId: 'demo_2', authorName: 'Rowan Ellis',
    authorAvatar: demoAvatars[2], content: 'Check out this article on pixel art techniques – really useful for the game assets',
    type: 'link', timestamp: ts(45), reactions: { '👀': ['demo_3', 'demo_current'] },
    linkPreview: {
      url: 'https://lospec.com/pixel-art-tutorials',
      title: 'Pixel Art Tutorials – Lospec',
      description: 'Free pixel art tutorials for beginners and advanced artists.',
      domain: 'lospec.com',
    },
  },
  {
    id: 'msg_4', officeId: 'office_main', authorId: 'demo_current', authorName: 'You',
    authorAvatar: demoAvatars[0], content: 'That\'s perfect timing, I was just looking for palette references',
    type: 'text', timestamp: ts(42), reactions: {},
  },
  {
    id: 'msg_5', officeId: 'office_main', authorId: 'demo_5', authorName: 'Jordan Blake',
    authorAvatar: demoAvatars[5], content: 'Heads up – having a 30 min focus session now, DM me if urgent',
    type: 'system', timestamp: ts(30), reactions: {},
  },
  {
    id: 'msg_6', officeId: 'office_main', authorId: 'demo_3', authorName: 'Priya Nair',
    authorAvatar: demoAvatars[3], content: 'Anyone want to grab a virtual coffee? I\'m heading to the lounge',
    type: 'text', timestamp: ts(15), reactions: { '☕': ['demo_2'] },
  },
  {
    id: 'msg_7', officeId: 'office_main', authorId: 'demo_2', authorName: 'Rowan Ellis',
    authorAvatar: demoAvatars[2], content: 'On my way! Need a break from these wireframes',
    type: 'text', timestamp: ts(14), reactions: {},
  },
  {
    id: 'msg_8', officeId: 'office_main', authorId: 'demo_1', authorName: 'Mia Chen',
    authorAvatar: demoAvatars[1], content: 'Still in focus mode, catch you later!',
    type: 'text', timestamp: ts(10), reactions: {},
  },
]

// ─── Shared Links ────────────────────────────────────────────────────────────

export const demoSharedLinks: SharedLink[] = [
  {
    id: 'link_1', url: 'https://lospec.com/pixel-art-tutorials',
    title: 'Pixel Art Tutorials – Lospec',
    sharedById: 'demo_2', sharedByName: 'Rowan Ellis', timestamp: ts(45),
    preview: { url: 'https://lospec.com', title: 'Pixel Art Tutorials – Lospec', description: 'Free tutorials', domain: 'lospec.com' },
  },
  {
    id: 'link_2', url: 'https://www.figma.com/community',
    title: 'Figma Community – Free Design Resources',
    sharedById: 'demo_3', sharedByName: 'Priya Nair', timestamp: ts(120),
    preview: { url: 'https://figma.com', title: 'Figma Community', description: 'Explore free resources', domain: 'figma.com' },
  },
  {
    id: 'link_3', url: 'https://fonts.google.com/specimen/Press+Start+2P',
    title: 'Press Start 2P – Google Fonts',
    sharedById: 'demo_1', sharedByName: 'Mia Chen', timestamp: ts(240),
    preview: { url: 'https://fonts.google.com', title: 'Press Start 2P – Google Fonts', domain: 'fonts.google.com' },
  },
]

// ─── Music ───────────────────────────────────────────────────────────────────

export const demoTracks: MusicTrack[] = [
  { id: 't1', title: 'Lo-fi Study Beats', artist: 'ChilledCow', album: 'Focus Essentials', duration: 245 },
  { id: 't2', title: 'Rainy Day Jazz', artist: 'Cafe Paradiso', album: 'Quiet Hours', duration: 198 },
  { id: 't3', title: 'Forest Morning', artist: 'AmbientWorks', album: 'Nature Sounds', duration: 312 },
  { id: 't4', title: 'Tokyo Groove', artist: 'City Sounds', album: 'Urban Chill', duration: 180 },
]

export const demoMusicState: MusicState = {
  connected: true,
  playing: true,
  currentTrack: demoTracks[0],
  queue: demoTracks.slice(1),
  listeners: ['demo_1', 'demo_3', 'demo_current'],
  votes: { t2: ['demo_1', 'demo_3'] },
}

// ─── Coffee breaks ───────────────────────────────────────────────────────────

export const demoCoffeeBreaks: CoffeeBreak[] = [
  { userId: 'demo_2', startedAt: ts(14) },
  { userId: 'demo_3', startedAt: ts(12) },
]

// ─── Online users in office ───────────────────────────────────────────────────

export const demoOnlineUsers: OnlineUser[] = [
  {
    user: demoUsers[0], // current user
    position: { x: 2 * 48 + 24, y: 3 * 48 + 24, gridX: 2, gridY: 3 },
    deskId: 'desk_1',
    isCurrentUser: true,
  },
  {
    user: demoUsers[1], // Mia – focusing
    position: { x: 3 * 48 + 24, y: 3 * 48 + 24, gridX: 3, gridY: 3 },
    deskId: 'desk_2',
    focusSession: {
      userId: 'demo_1', duration: 25,
      startedAt: ts(20), endsAt: new Date(Date.now() + 5 * 60000).toISOString(),
      paused: false,
    },
  },
  {
    user: demoUsers[2], // Rowan – coffee break, in lounge
    position: { x: 16 * 48 + 24, y: 16 * 48 + 24, gridX: 16, gridY: 16 },
    coffeeBreak: { userId: 'demo_2', startedAt: ts(14) },
  },
  {
    user: demoUsers[3], // Priya – at desk
    position: { x: 3 * 48 + 24, y: 6 * 48 + 24, gridX: 3, gridY: 6 },
    deskId: 'desk_4',
  },
  {
    user: demoUsers[5], // Jordan – at desk
    position: { x: 6 * 48 + 24, y: 3 * 48 + 24, gridX: 6, gridY: 3 },
    deskId: 'desk_5',
  },
]
