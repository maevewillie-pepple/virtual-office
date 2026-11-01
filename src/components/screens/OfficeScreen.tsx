import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import type { Desk, OnlineUser, FocusDuration, Message, SpeechBubble, CarriedItem, InteractableObject, OfficeMusicState, SpotifyContent, MusicPreferences, Office, User, OfficeMembership } from '../../types'
import { OFFICE_DESIGNS, type OfficeDesignId } from '../../data/officeMap'
import {
  demoUsers, demoOffices, demoMemberships, demoMessages,
  demoSharedLinks, demoOnlineUsers
} from '../../data/mockData'
import GameMap from '../office/GameMap'
import ChatSidebar from '../office/ChatSidebar'
import OfficeTopNav from '../office/OfficeTopNav'
import BottomToolbar from '../office/BottomToolbar'
import DeskModal from '../office/DeskModal'
import AvatarPopover from '../office/AvatarPopover'
import MusicPanel from '../office/MusicPanel'
import OfficeSettings from '../office/OfficeSettings'
import TaskBoard from '../office/TaskBoard'
import FocusHistoryPanel from '../office/FocusHistoryPanel'
import BookshelfPanel, { type Book } from '../office/BookshelfPanel'
import MeetingHub from '../office/MeetingHub'
import SharedBoard from '../office/SharedBoard'
import InteractionMenu from '../office/InteractionMenu'
import BaristaGame from '../office/BaristaGame'
import { carriedEmoji, carriedShort, isBook, isHeldDrink, isTeaDrink } from '../../game/barista/carry'
import { readWord } from '../../game/arcade/store'
import { buildRoomIndex, roomIdAt } from '../../collaboration/rooms'
import { activeSession, findLiveMarker, migrateLegacyBoards, readOfficeBoards, readOfficeDiscussions, subscribeAny, type BoardItem } from '../../collaboration/store'
import NotificationCentre from '../office/NotificationCentre'
import { loadNotices, markAllNoticesRead, markNoticeRead, pushNotice, subscribeNotices, type InteractionAction, type OfficeNotice } from '../../office/notices'
import { seatBesideDesk } from '../../utils/interactions'
import { MessageSquare } from 'lucide-react'
import { ToastContainer, useToasts } from '../ui/Toast'
import type { FocusHistoryEntry } from '../../types'
import { loadMusicPreferences, loadOfficeMusic, parseJamInvite, parseSpotifyContent, saveMusicPreferences, saveOfficeMusic, spotifyKindLabel, spotifyOpenUrl } from '../../utils/spotify'
import { isRemoteConfigured, isUuid } from '../../remote/client'
import { inviteLabel, inviteLink } from '../../utils/invite'
import { claimRemoteDesk, loadOfficeMembers, renameRemoteOffice } from '../../remote/account'
import { loadOfficeMessages, saveReaction, sendOfficeMessage, subscribeOfficeMessages } from '../../remote/messages'
import { joinPresence, presenceToOnline, type PresencePayload } from '../../remote/presence'
import { hydrateOffice, hydratePersonal, publishFocus, publishNotes, publishPlants, subscribeOfficeDocs } from '../../remote/sync'

const STORAGE_KEY = 'vo_office_state'

function demoRoomMembers(officeId: string, currentUser: User): User[] {
  const memberIds = new Set(
    demoMemberships.filter(membership => membership.officeId === officeId).map(membership => membership.userId)
  )
  const people = demoUsers
    .filter(user => memberIds.has(user.id))
    .map(user => user.id === currentUser.id ? currentUser : user)
  if (!people.some(user => user.id === currentUser.id)) people.unshift(currentUser)
  return people
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveState(state: Record<string, unknown>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

const ROOM_IDS = ['classic', 'library', 'loft', 'studio', 'lab'] as const

function isRoomId(value: unknown): value is OfficeDesignId {
  return typeof value === 'string' && (ROOM_IDS as readonly string[]).includes(value)
}

/** The room is fixed when the office is created. Older offices keep the classic room unless their theme already names one. */
function roomForOffice(office: Office): OfficeDesignId {
  if (isRoomId(office.layout)) return office.layout
  if (office.theme === 'quiet_library') return 'library'
  if (office.theme === 'creative_loft') return 'loft'
  return 'classic'
}

function boardSnippet(item: BoardItem, place: string): string {
  const text = (item.text || item.caption || '').replace(/\s+/g, ' ').trim().slice(0, 80)
  let what = text
  if (item.type === 'photo') what = text ? `Photo · ${text}` : 'A photo'
  else if (item.type === 'link') what = text || item.href || 'A link'
  else if (item.type === 'drawing') what = 'A drawing'
  else if (item.type === 'shape') what = 'A shape'
  else if (!what) what = 'A note'
  return place ? `${what} · ${place}` : what
}

interface OfficeScreenProps {
  office?: Office
  account?: User
  membershipRole?: OfficeMembership
  onOpenDashboard?: () => void
  onOfficeUpdated?: (office: Office) => void
}

export default function OfficeScreen({ office: officeProp, account, membershipRole = 'member', onOpenDashboard, onOfficeUpdated }: OfficeScreenProps = {}) {
  const office = officeProp ?? demoOffices[0]
  const live = isRemoteConfigured() && isUuid(office.id) && !!account && isUuid(account.id)
  const currentUser: User = live && account
    ? account
    : {
      ...demoUsers[0],
      ...(account ?? {}),
      id: demoUsers[0].id,
    }
  const savedState = loadState()
  const onsetRoom = roomForOffice(office)
  const designAdmin = demoOffices.some(item => item.id === office.id)

  const [designId, setDesignId] = useState<OfficeDesignId>(() => {
    if (!designAdmin) return onsetRoom
    return isRoomId(savedState?.designId) ? savedState.designId : onsetRoom
  })
  const [showDesignPicker, setShowDesignPicker] = useState(false)

  const officeMap = useMemo(() => {
    const design = OFFICE_DESIGNS.find(d => d.id === designId) ?? OFFICE_DESIGNS[0]
    return design.build()
  }, [designId])
  const rooms = useMemo(() => buildRoomIndex(officeMap.tiles), [officeMap])

  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia('(min-width: 768px)').matches)

  useEffect(() => {
    const query = window.matchMedia('(max-width: 767px)')
    const closeOnPhone = () => {
      if (query.matches) setSidebarOpen(false)
    }
    closeOnPhone()
    query.addEventListener('change', closeOnPhone)
    return () => query.removeEventListener('change', closeOnPhone)
  }, [])
  const [messages, setMessages] = useState<Message[]>(live ? [] : demoMessages)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>(() =>
    live
      ? [{
        user: currentUser,
        position: { gridX: savedState?.currentPos?.gridX ?? 2, gridY: savedState?.currentPos?.gridY ?? 3, x: 0, y: 0 },
        isCurrentUser: true,
      }]
      : demoOnlineUsers.map(ou => ou.isCurrentUser ? { ...ou, user: currentUser } : ou)
  )

  useEffect(() => {
    setOnlineUsers(prev => prev.map(ou => ou.isCurrentUser ? {
      ...ou,
      user: { ...ou.user, name: currentUser.name, email: currentUser.email, avatar: currentUser.avatar },
    } : ou))
  }, [currentUser.name, currentUser.email, currentUser.avatar])
  const [desks, setDesks] = useState(() =>
    live
      ? officeMap.desks
      : officeMap.desks.map((d, i) =>
        i === 0 ? { ...d, ownerId: currentUser.id, ownerName: 'You', isAvailable: false } : d
      )
  )
  const [currentPos, setCurrentPos] = useState(
    savedState?.currentPos ?? { gridX: 2, gridY: 3 }
  )
  const [focusSession, setFocusSession] = useState<{
    duration: FocusDuration; topic?: string; endsAt: string; paused: boolean; pausedAt?: string
  } | null>(null)
  const [focusHistory, setFocusHistory] = useState<FocusHistoryEntry[]>(() => {
    try {
      const raw = localStorage.getItem('vo_focus_history')
      return raw ? JSON.parse(raw) : []
    } catch { return [] }
  })
  const [showFocusHistory, setShowFocusHistory] = useState(false)
  const focusStartRef = useRef<{ startedAt: string; duration: number; topic?: string } | null>(null)
  const [onBreak, setOnBreak] = useState(false)
  const musicKey = `vo_office_music_${office.id}`
  const [officeMusic, setOfficeMusic] = useState<OfficeMusicState>(() => loadOfficeMusic(musicKey))
  const [musicPrefs, setMusicPrefs] = useState<MusicPreferences>(() => loadMusicPreferences())
  const [memberships] = useState(demoMemberships)
  const [roomMembers, setRoomMembers] = useState<User[]>(() => demoRoomMembers(office.id, currentUser))

  useEffect(() => {
    if (!live) {
      setRoomMembers(demoRoomMembers(office.id, currentUser))
      return
    }
    let cancel = false
    void loadOfficeMembers(office.id).then(people => {
      if (cancel) return
      const next = people.some(person => person.id === currentUser.id) ? people : [currentUser, ...people]
      setRoomMembers(next)
    }).catch(() => {
      if (!cancel) setRoomMembers([currentUser])
    })
    return () => { cancel = true }
  }, [live, office.id, currentUser.id, currentUser.name, currentUser.avatar])
  const [officeName, setOfficeName] = useState(office.name)

  // Carryable item state
  const [carriedItem, setCarriedItem] = useState<CarriedItem | null>(null)
  const [baristaOpen, setBaristaOpen] = useState(false)
  const [giftOffer, setGiftOffer] = useState<{ userId: string; name: string; item: CarriedItem } | null>(null)
  const sipLock = useRef(false)
  const [heldBook, setHeldBook] = useState<Book | null>(null)
  const [seatedSeatId, setSeatedSeatId] = useState<string | null>(null)
  const [fireplaceLit, setFireplaceLit] = useState(true)
  const [menuObject, setMenuObject] = useState<InteractableObject | null>(null)
  const [arcadeRev, setArcadeRev] = useState(0)
  const [focusSignal, setFocusSignal] = useState(0)
  const [debateMarker, setDebateMarker] = useState<{ x: number; y: number; text: string } | null>(null)
  const nudgeAt = useRef<Record<string, number>>({})
  const [showBookshelf, setShowBookshelf] = useState(false)
  const [bookshelfLabel, setBookshelfLabel] = useState('Bookshelf')
  const [boardRoom, setBoardRoom] = useState<string | null>(null)
  const [meetingTarget, setMeetingTarget] = useState<InteractableObject | null>(null)

  // Speech bubbles above avatars
  const [speechBubbles, setSpeechBubbles] = useState<SpeechBubble[]>([])

  const addSpeechBubble = useCallback((userId: string, text: string, type: SpeechBubble['type'], ttl = 4000) => {
    const bubble: SpeechBubble = {
      id: `sb_${Date.now()}_${Math.random()}`,
      userId,
      text,
      type,
      expiresAt: Date.now() + ttl,
    }
    setSpeechBubbles(prev => {
      // Keep only one bubble per user (latest wins)
      const filtered = prev.filter(b => b.userId !== userId)
      return [...filtered, bubble]
    })
  }, [])

  // Clean up expired bubbles
  useEffect(() => {
    const id = setInterval(() => {
      const now = Date.now()
      setSpeechBubbles(prev => prev.filter(b => b.expiresAt > now))
    }, 500)
    return () => clearInterval(id)
  }, [])

  // DM chat state
  const [dmUser, setDmUser] = useState<OnlineUser | null>(null)
  type DmMsg = { id: string; from: string; text: string; ts: number }
  const [dmThreads, setDmThreads] = useState<Record<string, DmMsg[]>>({})
  const dmInputRef = useRef<HTMLInputElement>(null)

  // Modals
  const [selectedDesk, setSelectedDesk] = useState<Desk | null>(null)
  const [selectedUser, setSelectedUser] = useState<OnlineUser | null>(null)
  const [showMusic, setShowMusic] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [showTasks, setShowTasks] = useState(false)
  const [notices, setNotices] = useState<OfficeNotice[]>(() => loadNotices(office.id))
  const [noticesOpen, setNoticesOpen] = useState(false)
  const [enterDiscussion, setEnterDiscussion] = useState(false)

  const { toasts, addToast, dismiss } = useToasts()

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === musicKey) setOfficeMusic(loadOfficeMusic(musicKey))
    }
    const onMusic = (event: Event) => {
      if ((event as CustomEvent<string>).detail === musicKey) setOfficeMusic(loadOfficeMusic(musicKey))
    }
    window.addEventListener('storage', onStorage)
    window.addEventListener('vo-music', onMusic)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('vo-music', onMusic)
    }
  }, [musicKey])

  const musicRole = live ? membershipRole : memberships.find(m => m.userId === currentUser.id)?.role
  const canEditMusic = musicRole === 'owner' || musicRole === 'admin'
  const canManageJam = canEditMusic || officeMusic.jam?.sharedById === currentUser.id

  useEffect(() => {
    setNotices(loadNotices(office.id))
    setNoticesOpen(false)
    return subscribeNotices(office.id, () => setNotices(loadNotices(office.id)))
  }, [office.id])

  const presenceRef = useRef<ReturnType<typeof joinPresence> | null>(null)
  const presencePayload = useCallback((): PresencePayload => ({
    user: currentUser,
    gridX: currentPos.gridX,
    gridY: currentPos.gridY,
    status: onBreak ? 'on_break' : focusSession ? 'focusing' : 'online',
    seated: !!seatedSeatId,
    onBreak,
    carried: carriedItem,
    focusEndsAt: focusSession?.endsAt ?? null,
    focusTopic: focusSession?.topic ?? null,
    focusPaused: !!focusSession?.paused,
  }), [currentUser, currentPos.gridX, currentPos.gridY, onBreak, focusSession, seatedSeatId, carriedItem])

  useEffect(() => {
    if (!live) return
    let stopMessages = () => {}
    let stopDocs = () => {}
    const room = joinPresence(office.id, presencePayload(), people => {
      const mine = currentUser.id
      const next = people.map(person => presenceToOnline(person, person.user.id === mine))
      setOnlineUsers(next.some(person => person.isCurrentUser) ? next : [...next, presenceToOnline(presencePayload(), true)])
    })
    presenceRef.current = room
    void loadOfficeMessages(office.id, currentUser.id).then(loaded => {
      setMessages(loaded.messages)
      setDmThreads(loaded.threads)
    }).catch(() => {})
    stopMessages = subscribeOfficeMessages(office.id, message => {
      if (message.isDM && message.authorId !== currentUser.id && message.dmToUserId !== currentUser.id) return
      if (message.isDM) {
        const other = message.authorId === currentUser.id ? message.dmToUserId : message.authorId
        if (!other) return
        const line = {
          id: message.id,
          from: message.authorId === currentUser.id ? 'You' : message.authorName,
          text: message.content,
          ts: new Date(message.timestamp).getTime(),
        }
        setDmThreads(prev => {
          const list = prev[other] ?? []
          if (list.some(item => item.id === line.id)) return prev
          return { ...prev, [other]: [...list, line] }
        })
        return
      }
      setMessages(prev => {
        const index = prev.findIndex(item => item.id === message.id)
        if (index === -1) return [...prev, message]
        const next = [...prev]
        next[index] = message
        return next
      })
    })
    const reloadShared = () => {
      setOfficeMusic(loadOfficeMusic(musicKey))
      setNotices(loadNotices(office.id))
      try {
        const raw = localStorage.getItem('vo_focus_history')
        if (raw) setFocusHistory(JSON.parse(raw) as FocusHistoryEntry[])
      } catch { /* ignore */ }
    }
    void hydrateOffice(office.id).then(reloadShared).catch(() => {})
    void hydratePersonal(currentUser.id).then(reloadShared).catch(() => {})
    stopDocs = subscribeOfficeDocs(office.id, reloadShared)
    return () => {
      room.leave()
      presenceRef.current = null
      stopMessages()
      stopDocs()
    }
  }, [live, office.id, currentUser.id, musicKey])

  useEffect(() => {
    presenceRef.current?.update(presencePayload())
  }, [presencePayload])

  const recordInteraction = useCallback((action: InteractionAction, personId: string, personName: string, detail = '') => {
    pushNotice(office.id, {
      id: `act_${action}_${personId}_${Date.now()}`,
      kind: 'interaction',
      action,
      actorId: currentUser.id,
      actorName: currentUser.name,
      personId,
      personName,
      title: action,
      detail,
    })
  }, [office.id, currentUser.id, currentUser.name])

  const notifyMusic = useCallback((message: string) => {
    if (focusSession || musicPrefs.hideNotifications) return
    addToast(message, 'info', 2200)
  }, [focusSession, musicPrefs.hideNotifications, addToast])

  const updateMusicPrefs = useCallback((patch: Partial<MusicPreferences>) => {
    setMusicPrefs(prev => {
      const next = { ...prev, ...patch }
      saveMusicPreferences(next)
      return next
    })
  }, [])

  const postMusicNote = useCallback((content: string, url: string, title: string) => {
    const message: Message = {
      id: `msg_${Date.now()}`,
      officeId: office.id,
      authorId: currentUser.id,
      authorName: currentUser.name,
      authorAvatar: currentUser.avatar,
      content,
      type: 'link',
      timestamp: new Date().toISOString(),
      reactions: {},
      linkPreview: { url, title, domain: (() => { try { return new URL(url).hostname } catch { return 'spotify.com' } })() },
    }
    setMessages(prev => [...prev, message])
    addSpeechBubble(currentUser.id, '🎵', 'reaction', 2500)
  }, [office.id, currentUser.id, currentUser.name, currentUser.avatar, addSpeechBubble])

  const saveSharedContent = useCallback((content: SpotifyContent) => {
    setOfficeMusic(prev => saveOfficeMusic(musicKey, {
      ...prev,
      content,
      updatedById: currentUser.id,
      updatedByName: currentUser.name,
      updatedAt: new Date().toISOString(),
    }))
    notifyMusic(`${currentUser.name} shared a ${spotifyKindLabel(content.kind).toLowerCase()} with the office`)
  }, [musicKey, currentUser.id, currentUser.name, notifyMusic])

  const saveJamInvite = useCallback((url: string) => {
    setOfficeMusic(prev => saveOfficeMusic(musicKey, {
      ...prev,
      jam: { url, sharedById: currentUser.id, sharedByName: currentUser.name, sharedAt: new Date().toISOString() },
    }))
    notifyMusic(`${currentUser.name} shared a Spotify Jam invitation`)
  }, [musicKey, currentUser.id, currentUser.name, notifyMusic])

  const removeJamInvite = useCallback(() => {
    setOfficeMusic(prev => saveOfficeMusic(musicKey, { ...prev, jam: null }))
    notifyMusic('The Jam invitation was taken off the office board')
  }, [musicKey, notifyMusic])

  const requestJam = useCallback(() => {
    postMusicNote('Could someone share a fresh Spotify Jam link?', 'https://open.spotify.com', 'Spotify')
    notifyMusic('Asked the office for a new Jam invitation')
  }, [postMusicNote, notifyMusic])

  const handleShareMusic = useCallback((userId: string, kind: 'playlist' | 'jam' | 'link', link?: string) => {
    const person = onlineUsers.find(u => u.user.id === userId)
    const name = person?.user.name.split(' ')[0] ?? 'them'
    if (kind === 'playlist' && officeMusic.content) {
      postMusicNote(`Shared the office ${spotifyKindLabel(officeMusic.content.kind).toLowerCase()} with ${name}.`, spotifyOpenUrl(officeMusic.content), officeMusic.content.title ?? 'Spotify')
      notifyMusic(`Shared music with ${name}`)
      return null
    }
    if (kind === 'jam' && officeMusic.jam) {
      postMusicNote(`Sent the Jam invitation to ${name}.`, officeMusic.jam.url, 'Spotify Jam')
      notifyMusic(`Sent the Jam invitation to ${name}`)
      return null
    }
    const shared = link ? parseSpotifyContent(link) : null
    if (shared) {
      postMusicNote(`Shared a Spotify ${spotifyKindLabel(shared.kind).toLowerCase()} with ${name}.`, spotifyOpenUrl(shared), shared.title ?? spotifyKindLabel(shared.kind))
      notifyMusic(`Shared music with ${name}`)
      return null
    }
    const jamUrl = link ? parseJamInvite(link) : null
    if (jamUrl) {
      postMusicNote(`Sent a Jam invitation to ${name}.`, jamUrl, 'Spotify Jam')
      notifyMusic(`Sent a Jam invitation to ${name}`)
      return null
    }
    return 'Paste a Spotify track, album, playlist, or Jam link.'
  }, [onlineUsers, officeMusic, postMusicNote, notifyMusic])

  const setCarried = useCallback((item: CarriedItem | null) => {
    setCarriedItem(item)
    if (item !== 'book') setHeldBook(null)
    setOnlineUsers(prev => prev.map(u => u.isCurrentUser ? { ...u, carriedItem: item ?? undefined, sipping: item ? u.sipping : false } : u))
  }, [])

  const handleInteract = useCallback((obj: InteractableObject) => {
    if (obj.type === 'brew_coffee') {
      if (isHeldDrink(carriedItem)) {
        setCarried(null)
        addToast('You returned your mug', 'info', 2000)
      } else if (carriedItem) {
        addToast('Your hands are full', 'info', 1800)
      } else {
        setBaristaOpen(true)
      }
    } else if (obj.type === 'make_tea') {
      if (isTeaDrink(carriedItem)) {
        setCarried(null)
        addToast('You returned your mug', 'info', 2000)
      } else if (carriedItem) {
        addToast('Your hands are full', 'info', 1800)
      } else {
        setCarried('tea_mug')
        addSpeechBubble(currentUser.id, '🍵 Tea time!', 'status', 3000)
        addToast('You made some tea', 'success', 2000)
      }
    } else if (obj.type === 'grab_drink') {
      addSpeechBubble(currentUser.id, '🧃 Cold drink', 'status', 2500)
      addToast('You grabbed a cold drink', 'success', 2000)
    } else if (obj.type === 'view_bookshelf') {
      setBookshelfLabel(obj.label)
      setShowBookshelf(true)
    } else if (obj.type === 'use_desk') {
      const desk = desks.find(d => d.id === obj.id)
      if (desk) setSelectedDesk(desk)
    } else if (obj.type === 'sit') {
      if (seatedSeatId === obj.id) {
        setSeatedSeatId(null)
        setOnlineUsers(prev => prev.map(u => u.isCurrentUser ? { ...u, seated: false } : u))
        return
      }
      const cell = obj.cells?.[0]
      if (!cell) return
      const taken = onlineUsers.some(u => !u.isCurrentUser && u.position.gridX === cell.x && u.position.gridY === cell.y)
      if (taken) {
        addToast('That seat is taken', 'info', 1800)
        return
      }
      setSeatedSeatId(obj.id)
      setCurrentPos({ gridX: cell.x, gridY: cell.y })
      setOnlineUsers(prev => prev.map(u => u.isCurrentUser ? {
        ...u,
        seated: true,
        position: { ...u.position, gridX: cell.x, gridY: cell.y, x: cell.x * 48, y: cell.y * 48 },
      } : u))
      saveState({ currentPos: { gridX: cell.x, gridY: cell.y }, designId })
    } else if (obj.type === 'toggle_fireplace') {
      setFireplaceLit(prev => {
        const next = !prev
        addToast(next ? 'The fire is lit' : 'The fire is out', 'info', 1800)
        return next
      })
    } else if (obj.type === 'water_plants') {
      const key = `vo_plants_${designId}`
      let stage = 1
      try {
        const all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, number>
        stage = Math.min(3, (all[obj.id] ?? 0) + 1)
        all[obj.id] = stage
        localStorage.setItem(key, JSON.stringify(all))
        if (live) publishPlants(office.id, designId, all)
      } catch { /* ignore */ }
      const names = ['a sprout', 'growing', 'leafy', 'flourishing']
      addSpeechBubble(currentUser.id, '💧', 'status', 2000)
      addToast(`Watered · ${names[stage]}`, 'success', 2000)
    } else if (obj.type === 'use_table') {
      if (isHeldDrink(carriedItem) || isBook(carriedItem)) {
        setCarried(null)
        addToast('You set it down', 'info', 1800)
      } else {
        addToast('Nothing to put down', 'info', 1500)
      }
    } else if (obj.type === 'use_whiteboard') {
      setBoardRoom(roomIdAt(rooms, obj.gridX, obj.gridY))
    } else if (obj.type === 'use_meeting') {
      setMeetingTarget(obj)
    } else if (obj.type === 'use_arcade' || obj.type === 'play_pool' || obj.type === 'play_game' || obj.type === 'use_server') {
      setMenuObject(obj)
    } else {
      addToast(`${obj.label}: ${obj.prompt}`, 'info', 2000)
    }
  }, [carriedItem, addToast, addSpeechBubble, currentUser.id, setCarried, desks, seatedSeatId, onlineUsers, designId, rooms])

  const handleDropItem = useCallback(() => {
    setCarried(null)
    addToast('Item dropped', 'info', 1500)
  }, [addToast, setCarried])

  const handleUserMove = useCallback((gridX: number, gridY: number) => {
    setCurrentPos({ gridX, gridY })
    setOnlineUsers(prev => prev.map(u =>
      u.isCurrentUser ? { ...u, position: { ...u.position, gridX, gridY, x: gridX * 48, y: gridY * 48 } } : u
    ))
    saveState({ currentPos: { gridX, gridY }, designId })
  }, [])

  const handleDeskClick = useCallback((desk: Desk) => {
    setSelectedDesk(desk)
  }, [])

  const handleClaimDesk = useCallback((deskId: string) => {
    setDesks(prev => prev.map(d =>
      d.id === deskId
        ? { ...d, ownerId: currentUser.id, ownerName: currentUser.name, isAvailable: false }
        : d.ownerId === currentUser.id ? { ...d, ownerId: undefined, ownerName: undefined, isAvailable: true } : d
    ))
    if (live) void claimRemoteDesk(office.id, deskId)
    addToast('Desk claimed! This is your spot 🪑', 'success')
  }, [currentUser.id, currentUser.name, addToast, live, office.id])

  const handleReleaseDesk = useCallback((deskId: string) => {
    setDesks(prev => prev.map(d =>
      d.id === deskId ? { ...d, ownerId: undefined, ownerName: undefined, isAvailable: true } : d
    ))
    if (live) void claimRemoteDesk(office.id, null)
    addToast('Desk released', 'info')
  }, [addToast, live, office.id])

  const handleSendMessage = useCallback((content: string) => {
    const newMsg: Message = {
      id: crypto.randomUUID(),
      officeId: office.id,
      authorId: currentUser.id,
      authorName: live ? currentUser.name : 'You',
      authorAvatar: currentUser.avatar,
      content,
      type: content.startsWith('http') ? 'link' : 'text',
      timestamp: new Date().toISOString(),
      reactions: {},
    }
    setMessages(prev => [...prev, newMsg])
    if (live) void sendOfficeMessage(newMsg)
    addSpeechBubble(currentUser.id, content, 'chat', 5000)
  }, [office.id, currentUser, addSpeechBubble, live])

  const handleReact = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m
      const existing = m.reactions[emoji] || []
      const hasReacted = existing.includes(currentUser.id)
      const reactions = {
        ...m.reactions,
        [emoji]: hasReacted
          ? existing.filter(id => id !== currentUser.id)
          : [...existing, currentUser.id],
      }
      if (live) void saveReaction(messageId, reactions)
      return { ...m, reactions }
    }))
  }, [currentUser.id, live])

  const handleStartFocus = useCallback((duration: FocusDuration, topic?: string, shareTopic = true) => {
    if (onBreak) {
      addToast('End your break before starting a focus session', 'warning', 2500)
      return
    }
    const startedAt = new Date().toISOString()
    const endsAt = new Date(Date.now() + duration * 60 * 1000).toISOString()
    setFocusSession({ duration, topic, endsAt, paused: false })
    focusStartRef.current = { startedAt, duration, topic }
    const myDesk = desks.find(d => d.ownerId === currentUser.id)
    const seat = myDesk ? seatBesideDesk(officeMap.tiles, myDesk) : null
    if (seat) {
      setCurrentPos(seat)
      setOnlineUsers(prev => prev.map(u =>
        u.isCurrentUser ? {
          ...u,
          seated: true,
          user: { ...u.user, status: 'focusing' },
          position: { ...u.position, gridX: seat.x, gridY: seat.y, x: seat.x * 48, y: seat.y * 48 },
        } : u
      ))
      const chair = (officeMap.interactables ?? []).find(obj => obj.type === 'sit' && obj.cells?.some(c => c.x === seat.x && c.y === seat.y))
      if (chair) setSeatedSeatId(chair.id)
      saveState({ currentPos: { gridX: seat.x, gridY: seat.y }, designId })
      addToast('Focus mode · Sat down at your desk', 'success')
    } else {
      setOnlineUsers(prev => prev.map(u =>
        u.isCurrentUser ? { ...u, user: { ...u.user, status: 'focusing' } } : u
      ))
      addToast(`Focus session started · ${duration} minutes 🎧`, 'success')
    }
    const label = shareTopic && topic ? `🎧 ${topic}` : `🎧 Focusing · ${duration}m`
    // Pinned bubble — expiresAt = MAX so it never auto-dismisses; cleared in handleEndFocus
    setSpeechBubbles(prev => {
      const filtered = prev.filter(b => b.userId !== currentUser.id)
      return [...filtered, { id: `sb_focus_${currentUser.id}`, userId: currentUser.id, text: label, type: 'status' as const, expiresAt: Number.MAX_SAFE_INTEGER }]
    })
  }, [onBreak, addToast, desks, currentUser.id, setSpeechBubbles, officeMap, designId])

  const handleEndFocus = useCallback((completed = false) => {
    setFocusSession(sess => {
      if (sess && focusStartRef.current) {
        const entry: FocusHistoryEntry = {
          id: `fh_${Date.now()}`,
          topic: focusStartRef.current.topic,
          duration: focusStartRef.current.duration,
          startedAt: focusStartRef.current.startedAt,
          endedAt: new Date().toISOString(),
          completed: completed || (new Date(sess.endsAt).getTime() - Date.now() <= 2000),
        }
        setFocusHistory(prev => {
          const next = [...prev, entry]
          try { localStorage.setItem('vo_focus_history', JSON.stringify(next)) } catch {}
          if (live) void publishFocus(currentUser.id, next)
          return next
        })
        focusStartRef.current = null
      }
      return null
    })
    setOnlineUsers(prev => prev.map(u =>
      u.isCurrentUser ? { ...u, user: { ...u.user, status: 'online' } } : u
    ))
    // Remove the pinned focus bubble
    setSpeechBubbles(prev => prev.filter(b => b.id !== `sb_focus_${currentUser.id}`))
    addToast('Focus session ended. Great work!', 'success')
  }, [addToast, currentUser.id])

  const handlePauseFocus = useCallback(() => {
    setFocusSession(prev => prev ? { ...prev, paused: true, pausedAt: new Date().toISOString() } : null)
    addToast('Focus paused', 'info', 1500)
  }, [addToast])

  const handleResumeFocus = useCallback(() => {
    setFocusSession(prev => {
      if (!prev || !prev.pausedAt) return prev
      const remaining = new Date(prev.endsAt).getTime() - new Date(prev.pausedAt).getTime()
      return { ...prev, paused: false, pausedAt: undefined, endsAt: new Date(Date.now() + remaining).toISOString() }
    })
    addToast('Focus resumed', 'info', 1500)
  }, [addToast])

  const handleToggleBreak = useCallback(() => {
    setOnBreak(prev => {
      const next = !prev
      if (next && focusSession) {
        addToast('End your focus session before taking a break', 'warning', 2500)
        return prev
      }
      setOnlineUsers(ou => ou.map(u =>
        u.isCurrentUser ? { ...u, user: { ...u.user, status: next ? 'on_break' : 'online' } } : u
      ))
      addToast(next ? '☕ Taking a break – head to the lounge!' : 'Back to work!', 'info')
      if (next) addSpeechBubble(currentUser.id, '☕ Taking a break', 'status', 5000)
      return next
    })
  }, [focusSession, addToast, addSpeechBubble, currentUser.id])

  const handleReaction = useCallback((emoji: string) => {
    addToast(`You reacted with ${emoji}`, 'info', 1500)
    addSpeechBubble(currentUser.id, emoji, 'reaction', 3000)
  }, [addToast, addSpeechBubble, currentUser.id])

  const handleAvatarChat = useCallback((userId: string) => {
    const user = onlineUsers.find(u => u.user.id === userId)
    if (user) {
      setDmUser(user)
      setSidebarOpen(true)  // ensure sidebar is open
      setSelectedUser(null)
    }
  }, [onlineUsers])

  const handleWave = useCallback((userId: string) => {
    const name = onlineUsers.find(u => u.user.id === userId)?.user.name
    addToast(`You waved at ${name}`, 'success', 2000)
    addSpeechBubble(currentUser.id, `👋 ${name?.split(' ')[0] ?? ''}`, 'reaction', 3000)
    if (name) recordInteraction('wave', userId, name)
  }, [onlineUsers, addToast, addSpeechBubble, currentUser.id, recordInteraction])

  const handleNudge = useCallback((userId: string) => {
    const person = onlineUsers.find(u => u.user.id === userId)
    if (!person) return
    if (person.user.status === 'focusing') {
      addToast(`${person.user.name.split(' ')[0]} is focusing`, 'info', 1800)
      return
    }
    const last = nudgeAt.current[userId] ?? 0
    if (Date.now() - last < 20000) {
      addToast('Give them a moment before nudging again', 'info', 1800)
      return
    }
    nudgeAt.current[userId] = Date.now()
    addSpeechBubble(currentUser.id, `👋 nudge`, 'reaction', 2500)
    addToast(`You nudged ${person.user.name.split(' ')[0]}`, 'success', 1800)
    recordInteraction('nudge', userId, person.user.name)
  }, [onlineUsers, addToast, addSpeechBubble, currentUser.id, recordInteraction])

  const handleGiveItem = useCallback((userId: string) => {
    const person = onlineUsers.find(u => u.user.id === userId)
    if (!person || !carriedItem) return
    if (person.user.status === 'focusing') {
      addToast(`${person.user.name.split(' ')[0]} is focusing`, 'info', 1800)
      return
    }
    if (person.carriedItem) {
      addToast(`${person.user.name.split(' ')[0]}'s hands are full`, 'info', 1800)
      return
    }
    setGiftOffer({ userId, name: person.user.name.split(' ')[0], item: carriedItem })
  }, [onlineUsers, carriedItem, addToast])

  const handleFocusInvite = useCallback((userId: string) => {
    const person = onlineUsers.find(u => u.user.id === userId)
    if (!person) return
    if (person.user.status === 'focusing') {
      addToast(`${person.user.name.split(' ')[0]} is already focusing`, 'info', 1800)
      return
    }
    addSpeechBubble(currentUser.id, '🎧 Focus together?', 'status', 3000)
    addToast(`Invited ${person.user.name.split(' ')[0]} to focus`, 'success', 2000)
    recordInteraction('focus', userId, person.user.name)
    setFocusSignal(n => n + 1)
  }, [onlineUsers, addToast, addSpeechBubble, currentUser.id, recordInteraction])

  useEffect(() => {
    setOnlineUsers(prev => prev.map(u => u.isCurrentUser ? { ...u, brewing: baristaOpen } : u))
  }, [baristaOpen])

  useEffect(() => {
    const gaming = !!menuObject && (menuObject.type === 'use_arcade' || menuObject.type === 'play_pool' || menuObject.type === 'play_game')
    setOnlineUsers(prev => prev.map(u => u.isCurrentUser ? { ...u, gaming } : u))
  }, [menuObject])

  useEffect(() => {
    const bump = () => setArcadeRev(value => value + 1)
    window.addEventListener('vo-arcade', bump)
    window.addEventListener('storage', bump)
    return () => {
      window.removeEventListener('vo-arcade', bump)
      window.removeEventListener('storage', bump)
    }
  }, [])

  const acceptGift = () => {
    if (!giftOffer) return
    const offer = giftOffer
    setGiftOffer(null)
    setCarriedItem(null)
    setOnlineUsers(prev => prev.map(u => {
      if (u.user.id === offer.userId) return { ...u, carriedItem: offer.item }
      if (u.isCurrentUser) return { ...u, carriedItem: undefined, sipping: false }
      return u
    }))
    addSpeechBubble(currentUser.id, `🎁`, 'status', 2500)
    addSpeechBubble(offer.userId, carriedEmoji(offer.item), 'status', 2500)
    addToast(`${offer.name} took ${carriedShort(offer.item)}`, 'success', 2200)
    recordInteraction('gift', offer.userId, offer.name, carriedShort(offer.item))
  }

  const handleCoffeeInvite = useCallback((userId: string) => {
    const name = onlineUsers.find(u => u.user.id === userId)?.user.name
    addSpeechBubble(currentUser.id, '☕ Coffee?', 'status', 3000)
    addToast(`Invited ${name?.split(' ')[0] ?? 'them'} for a coffee. They can walk to the kitchen.`, 'success', 2200)
    if (name) recordInteraction('coffee', userId, name)
  }, [onlineUsers, addToast, addSpeechBubble, currentUser.id, recordInteraction])

  // User's claimed desk position for focus mode
  const userDeskPosition = useMemo(() => {
    const d = desks.find(desk => desk.ownerId === currentUser.id)
    return d ? { gridX: d.gridX, gridY: d.gridY } : null
  }, [desks, currentUser.id])

  // DM handlers
  const handleDmSend = useCallback((text: string) => {
    if (!dmUser || !text.trim()) return
    const uid = dmUser.user.id
    const msg = { id: crypto.randomUUID(), from: 'You', text: text.trim(), ts: Date.now() }
    setDmThreads(prev => ({ ...prev, [uid]: [...(prev[uid] ?? []), msg] }))
    if (live) {
      void sendOfficeMessage({
        id: msg.id,
        officeId: office.id,
        authorId: currentUser.id,
        authorName: currentUser.name,
        authorAvatar: currentUser.avatar,
        content: msg.text,
        type: 'dm',
        timestamp: new Date(msg.ts).toISOString(),
        reactions: {},
        isDM: true,
        dmToUserId: uid,
      }, uid)
    }
    recordInteraction('message', uid, dmUser.user.name, text.trim().slice(0, 80))
  }, [dmUser, recordInteraction, live, office.id, currentUser])

  const handleOpenDm = useCallback((user: OnlineUser) => {
    setDmUser(user)
  }, [])

  // Merge desk state into map and refresh prompts from what you are carrying or sitting on
  const mapWithDesks = useMemo(() => {
    const interactables = (officeMap.interactables ?? []).map(obj => {
      if (obj.type === 'brew_coffee') {
        if (isHeldDrink(carriedItem)) return { ...obj, prompt: 'Enter · Return mug' }
        if (carriedItem) return { ...obj, prompt: 'Hands are full' }
      }
      if (obj.type === 'make_tea') {
        if (isTeaDrink(carriedItem)) return { ...obj, prompt: 'Enter · Return mug' }
        if (carriedItem) return { ...obj, prompt: 'Hands are full' }
      }
      if (obj.type === 'toggle_fireplace') {
        const next = fireplaceLit ? 'Turn off' : 'Turn on'
        return { ...obj, prompt: `Enter · ${next}` }
      }
      if (obj.type === 'sit') {
        if (seatedSeatId === obj.id) return { ...obj, prompt: 'Enter · Stand up' }
        const taken = onlineUsers.some(u => !u.isCurrentUser && obj.cells?.some(c => c.x === u.position.gridX && c.y === u.position.gridY))
        if (taken) return { ...obj, prompt: 'Seat taken' }
      }
      if (obj.type === 'use_table') {
        if (isHeldDrink(carriedItem) || isBook(carriedItem)) {
          return { ...obj, prompt: 'Enter · Put it down' }
        }
        return { ...obj, prompt: 'Nothing to put down' }
      }
      if (obj.type === 'use_arcade' || obj.type === 'play_game') {
        const done = readWord(office.id, currentUser.id).finished
        return { ...obj, prompt: done ? 'Enter · Daily Word · Completed today' : 'Enter · Daily Word · Today’s puzzle' }
      }
      if (obj.type === 'use_meeting') {
        return { ...obj, prompt: 'Enter · Meeting room' }
      }
      if (obj.type === 'use_desk') {
        const desk = desks.find(d => d.id === obj.id)
        if (!desk) return obj
        if (desk.isAvailable) return { ...obj, prompt: 'Enter · Claim desk' }
        if (desk.ownerId === currentUser.id) return { ...obj, prompt: 'Enter · Laptop' }
        const owner = desk.ownerName?.split(' ')[0] ?? 'Their'
        return { ...obj, prompt: `Enter · ${owner}'s desk` }
      }
      return obj
    })
    return { ...officeMap, desks, interactables }
  }, [officeMap, desks, carriedItem, fireplaceLit, seatedSeatId, currentUser.id, onlineUsers, office.id, arcadeRev])

  useEffect(() => {
    setOnlineUsers(prev => prev.map(u => u.isCurrentUser ? {
      ...u,
      position: { ...u.position, gridX: currentPos.gridX, gridY: currentPos.gridY, x: currentPos.gridX * 48, y: currentPos.gridY * 48 },
    } : u))
    // The sprite must start where movement and Enter think you are.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    migrateLegacyBoards(office.id, designId, (x, y) => roomIdAt(rooms, x, y))
  }, [office.id, designId, rooms])

  useEffect(() => {
    const sync = () => setDebateMarker(findLiveMarker(office.id, designId))
    sync()
    return subscribeAny(sync)
  }, [office.id, designId])

  const boardRoomRef = useRef(boardRoom)
  boardRoomRef.current = boardRoom
  useEffect(() => {
    const sessionsSeen = new Set<string>()
    const itemsSeen = new Set<string>()
    let primed = false
    const placeName = (roomId: string) => {
      const label = (officeMap.areaLabels ?? []).find(item => roomIdAt(rooms, item.gridX, item.gridY) === roomId)
      return label ? label.text.toLowerCase().replace(/\b\w/g, char => char.toUpperCase()) : ''
    }
    const scan = () => {
      const sessions = readOfficeDiscussions(office.id, designId).flatMap(({ doc }) => {
        const live = activeSession(doc)
        return live ? [live] : []
      })
      const items = readOfficeBoards(office.id, designId).flatMap(({ roomId, board }) =>
        board.items.filter(item => !item.deleted).map(item => ({ item, roomId }))
      )
      if (!primed) {
        sessions.forEach(session => sessionsSeen.add(session.id))
        items.forEach(({ item }) => itemsSeen.add(item.id))
        primed = true
        return
      }
      for (const session of sessions) {
        if (sessionsSeen.has(session.id)) continue
        sessionsSeen.add(session.id)
        const place = placeName(session.roomId)
        pushNotice(office.id, {
          id: `discuss_${session.id}`,
          kind: 'discussion',
          actorId: session.hostId,
          actorName: session.hostName,
          title: session.title,
          detail: place,
          roomId: session.roomId,
          x: session.anchor?.x,
          y: session.anchor?.y,
        })
      }
      for (const { item, roomId } of items) {
        if (itemsSeen.has(item.id)) continue
        itemsSeen.add(item.id)
        const place = placeName(roomId)
        pushNotice(office.id, {
          id: `board_${item.id}`,
          kind: 'board',
          actorId: item.authorId,
          actorName: item.authorName,
          title: 'Whiteboard',
          detail: boardSnippet(item, place),
          roomId,
          read: item.authorId === currentUser.id && boardRoomRef.current === roomId,
        })
      }
    }
    scan()
    return subscribeAny(scan)
  }, [office.id, designId, officeMap, rooms, currentUser.id])

  const jamWatch = useRef<{ officeId: string; stamp: string | null }>({ officeId: '', stamp: null })
  useEffect(() => {
    const stamp = officeMusic.jam?.sharedAt ?? ''
    if (jamWatch.current.officeId !== office.id || jamWatch.current.stamp === null) {
      jamWatch.current = { officeId: office.id, stamp }
      return
    }
    if (!stamp || stamp === jamWatch.current.stamp) return
    jamWatch.current = { officeId: office.id, stamp }
    const jam = officeMusic.jam
    if (!jam) return
    pushNotice(office.id, {
      id: `jam_${jam.sharedAt}`,
      kind: 'jam',
      actorId: jam.sharedById,
      actorName: jam.sharedByName,
      title: 'Spotify Jam',
      detail: '',
    })
  }, [office.id, officeMusic.jam])

  useEffect(() => {
    if (!seatedSeatId) return
    const seat = mapWithDesks.interactables.find(obj => obj.id === seatedSeatId)
    const still = seat?.cells?.some(c => c.x === currentPos.gridX && c.y === currentPos.gridY)
    if (!still) {
      setSeatedSeatId(null)
      setOnlineUsers(prev => prev.map(u => u.isCurrentUser ? { ...u, seated: false } : u))
    }
  }, [currentPos, seatedSeatId, mapWithDesks.interactables])

  return (
    <div className="flex flex-col overflow-hidden bg-canvas" style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      <OfficeTopNav
        office={{ ...office, name: officeName }}
        onlineUsers={onlineUsers}
        currentUser={currentUser}
        onInvite={() => setShowInvite(true)}
        onSettings={() => setShowSettings(true)}
        onDashboard={onOpenDashboard}
        onOpenTasks={() => setShowTasks(true)}
        onToggleNotices={() => setNoticesOpen(open => !open)}
        noticesOpen={noticesOpen}
        unreadCount={notices.filter(notice => !notice.read).length}
        onToggleSidebar={() => setSidebarOpen(v => !v)}
        sidebarOpen={sidebarOpen}
      />

      {noticesOpen && (
        <NotificationCentre
          notices={notices}
          userId={currentUser.id}
          onMarkAll={() => markAllNoticesRead(office.id)}
          onClose={() => setNoticesOpen(false)}
          onOpen={notice => {
            markNoticeRead(office.id, notice.id)
            setNoticesOpen(false)
            if (notice.kind === 'discussion') {
              const table = (officeMap.interactables ?? []).find(obj =>
                obj.type === 'use_meeting' && (
                  roomIdAt(rooms, obj.gridX, obj.gridY) === notice.roomId
                  || (notice.x != null && obj.gridX === notice.x && obj.gridY === notice.y)
                )
              )
              setEnterDiscussion(true)
              setMeetingTarget(table ?? {
                id: `notice_meeting_${notice.roomId ?? 'room'}`,
                type: 'use_meeting',
                gridX: notice.x ?? 0,
                gridY: notice.y ?? 0,
                label: 'Meeting Table',
                prompt: 'Enter · Meeting room',
              })
              return
            }
            if (notice.kind === 'board' && notice.roomId) {
              setBoardRoom(notice.roomId)
              return
            }
            if (notice.kind === 'jam') {
              setShowMusic(true)
              return
            }
            const personId = notice.actorId === currentUser.id ? notice.personId : notice.actorId
            const person = onlineUsers.find(user => user.user.id === personId)
            if (person) setSelectedUser(person)
          }}
        />
      )}

      {/* Main area */}
      <div className="relative flex min-h-0 flex-1">
        {/* Game map */}
        <div className="flex-1 relative min-w-0" style={{ position: 'relative' }}>
          <GameMap
            map={mapWithDesks}
            onlineUsers={onlineUsers}
            currentUserId={currentUser.id}
            onDeskClick={handleDeskClick}
            onAvatarClick={setSelectedUser}
            onUserMove={handleUserMove}
            currentUserPosition={currentPos}
            focusSession={focusSession}
            userDeskPosition={userDeskPosition}
            speechBubbles={speechBubbles}
            onInteract={handleInteract}
            suspendInput={!!(selectedDesk || selectedUser || showBookshelf || boardRoom || meetingTarget || menuObject || showSettings || showInvite || showFocusHistory || baristaOpen || noticesOpen || showTasks)}
            fireplaceLit={fireplaceLit}
            debateMarker={debateMarker}
          />
          {baristaOpen && (
            <BaristaGame
              onClose={() => setBaristaOpen(false)}
              onQuick={() => {
                setCarried('coffee_mug')
                setBaristaOpen(false)
                addSpeechBubble(currentUser.id, '☕', 'status', 2200)
                addToast('You took a quick coffee', 'success', 1800)
              }}
              onCollect={drink => {
                setCarried(drink)
                setBaristaOpen(false)
                addSpeechBubble(currentUser.id, carriedEmoji(drink), 'status', 2500)
                addToast(`You picked up ${carriedShort(drink)}`, 'success', 2000)
              }}
            />
          )}
          {giftOffer && (
            <div className="absolute bottom-16 left-1/2 z-50 w-[min(320px,calc(100%-1.5rem))] -translate-x-1/2 rounded-xl border border-border bg-surface p-3 shadow-lg" role="dialog" aria-label="Drink offer">
              <p className="text-[14px] font-medium text-ink">Offer {giftOffer.name} a drink?</p>
              <p className="mt-1 text-[13px] text-ink-2">{carriedShort(giftOffer.item)}</p>
              <div className="mt-3 flex justify-end gap-2">
                <button type="button" className="h-8 rounded-md border border-border px-3 text-[12px] text-ink" onClick={() => { setGiftOffer(null); addToast(`${giftOffer.name} left it with you`, 'info', 1800) }}>Not now</button>
                <button type="button" className="h-8 rounded-md border border-olive/30 bg-olive-soft px-3 text-[12px] font-medium text-olive" onClick={acceptGift}>They take it</button>
              </div>
            </div>
          )}
          {menuObject && (
            <InteractionMenu
              object={menuObject}
              designId={designId}
              officeId={office.id}
              player={{ id: currentUser.id, name: currentUser.name, avatar: currentUser.avatar }}
              players={onlineUsers.map(person => ({ id: person.user.id, name: person.user.name, avatar: person.user.avatar }))}
              isOwner={canEditMusic}
              onClose={() => setMenuObject(null)}
              onShare={handleSendMessage}
              onStartDebate={() => {
                setMeetingTarget(menuObject)
                setMenuObject(null)
              }}
            />
          )}

          {designAdmin && (
            <div className="absolute top-2 left-2 z-30">
              <button
                onClick={() => setShowDesignPicker(v => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wide hover:opacity-90 transition-opacity"
                style={{ background: 'rgba(25,35,49,0.85)', border: '1px solid rgba(242,232,216,0.2)', color: '#F2E8D8', backdropFilter: 'blur(6px)' }}
              >
                {OFFICE_DESIGNS.find(d => d.id === designId)?.emoji} Design
              </button>
              {showDesignPicker && (
                <div className="mt-1 min-w-[220px] shadow-2xl" style={{ background: '#192331', border: '1px solid rgba(242,232,216,0.2)' }}>
                  {OFFICE_DESIGNS.map(d => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setDesignId(d.id)
                        setDesks(d.build().desks.map((desk, i) =>
                          i === 0 ? { ...desk, ownerId: currentUser.id, ownerName: 'You', isAvailable: false } : desk
                        ))
                        setCurrentPos({ gridX: 4, gridY: 4 })
                        setShowDesignPicker(false)
                        saveState({ currentPos: { gridX: 4, gridY: 4 }, designId: d.id })
                        addToast(`Switched to ${d.name}`, 'success', 2000)
                      }}
                      className="w-full flex items-start gap-2.5 px-3 py-2.5 text-left transition-colors"
                      style={{ color: d.id === designId ? '#E3B775' : '#F2E8D8', background: d.id === designId ? 'rgba(242,232,216,0.1)' : 'transparent' }}
                    >
                      <span className="text-base mt-0.5">{d.emoji}</span>
                      <div>
                        <div className="font-mono text-[11px] font-bold uppercase tracking-wide">{d.name}</div>
                        <div className="text-[10px] opacity-60 mt-0.5">{d.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}


          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="absolute right-2 top-2 z-30 hidden items-center gap-1.5 rounded-lg border border-border bg-surface px-2.5 py-1.5 text-[12px] font-medium text-ink shadow-sm hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-focus md:flex"
              aria-label="Show chat"
            >
              <MessageSquare size={14} strokeWidth={1.75} />
              Chat
            </button>
          )}

          {/* Bottom toolbar – floating over map */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
            <BottomToolbar
              currentUser={currentUser}
              focusSession={focusSession}
              onBreak={onBreak}
              onStartFocus={handleStartFocus}
              onEndFocus={() => handleEndFocus(false)}
              onPauseFocus={handlePauseFocus}
              onResumeFocus={handleResumeFocus}
              onToggleBreak={handleToggleBreak}
              musicOpen={showMusic}
              onOpenMusic={() => {
                if (showMusic) {
                  setShowMusic(false)
                  return
                }
                if (musicPrefs.minimised) updateMusicPrefs({ minimised: false })
                setShowMusic(true)
              }}
              onOpenProfile={() => onOpenDashboard?.()}
              onReaction={handleReaction}
              onOpenFocusHistory={() => setShowFocusHistory(true)}
              carriedItem={carriedItem}
              onDropItem={handleDropItem}
              focusSignal={focusSignal}
              onUseItem={(action) => {
                if (action === 'read' && heldBook) {
                  addSpeechBubble(currentUser.id, `📖 ${heldBook.quote.slice(0, 48)}`, 'status', 5000)
                  addToast(heldBook.quote, 'info', 4000)
                } else if (action === 'drink') {
                  if (!carriedItem || isBook(carriedItem) || sipLock.current) return
                  sipLock.current = true
                  setOnlineUsers(prev => prev.map(u => u.isCurrentUser ? { ...u, sipping: true } : u))
                  addSpeechBubble(currentUser.id, carriedEmoji(carriedItem), 'status', 1800)
                  window.setTimeout(() => {
                    setCarried(null)
                    sipLock.current = false
                  }, 700)
                  addToast('You finished your drink', 'success', 1600)
                }
              }}
            />
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <ChatSidebar
            messages={messages}
            sharedLinks={live ? [] : demoSharedLinks}
            onlineUsers={onlineUsers}
            members={roomMembers}
            currentUser={currentUser}
            onSendMessage={handleSendMessage}
            onReact={handleReact}
            isCollapsed={false}
            dmUser={dmUser}
            dmThreads={dmThreads}
            onOpenDm={handleOpenDm}
            onCloseDm={() => setDmUser(null)}
            onSendDm={handleDmSend}
            onHide={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* Modals */}
      <DeskModal
        desk={selectedDesk}
        currentUser={currentUser}
        isOpen={!!selectedDesk}
        onClose={() => setSelectedDesk(null)}
        onClaim={handleClaimDesk}
        onRelease={handleReleaseDesk}
        onStartFocus={() => { setSelectedDesk(null); setFocusSignal(n => n + 1) }}
        onSit={() => {
          if (!selectedDesk) return
          const seat = seatBesideDesk(officeMap.tiles, selectedDesk)
          const chair = seat && mapWithDesks.interactables.find(obj => obj.type === 'sit' && obj.gridX === seat.x && obj.gridY === seat.y)
          if (chair) handleInteract(chair)
          setSelectedDesk(null)
        }}
        onKnock={() => {
          if (!selectedDesk) return
          const owner = onlineUsers.find(u => u.deskId === selectedDesk.id || u.user.id === selectedDesk.ownerId)
          if (owner?.user.status === 'focusing' || owner?.focusSession) {
            addToast(`${selectedDesk.ownerName ?? 'They'} are focusing`, 'info', 1800)
            return
          }
          const last = nudgeAt.current[selectedDesk.id] ?? 0
          if (Date.now() - last < 20000) {
            addToast('You just knocked', 'info', 1500)
            return
          }
          nudgeAt.current[selectedDesk.id] = Date.now()
          addSpeechBubble(currentUser.id, '✊ knock knock', 'reaction', 2500)
          addToast(`You knocked on ${selectedDesk.ownerName ?? 'the'} desk`, 'success', 1800)
        }}
        onLeaveNote={(text) => {
          if (!selectedDesk) return
          try {
            const key = `vo_notes_${designId}`
            const all = JSON.parse(localStorage.getItem(key) || '{}') as Record<string, string>
            all[selectedDesk.id] = text
            localStorage.setItem(key, JSON.stringify(all))
            if (live) publishNotes(office.id, designId, all)
          } catch { /* ignore */ }
          addSpeechBubble(currentUser.id, '📝 left a note', 'status', 2500)
          addToast('Note left on the desk', 'success', 1800)
        }}
        onOpenTasks={() => { setSelectedDesk(null); setShowTasks(true) }}
        note={selectedDesk ? (() => {
          try { return (JSON.parse(localStorage.getItem(`vo_notes_${designId}`) || '{}') as Record<string, string>)[selectedDesk.id] } catch { return undefined }
        })() : undefined}
      />

      <AvatarPopover
        user={selectedUser}
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        onChat={handleAvatarChat}
        onWave={handleWave}
        onCoffeeInvite={handleCoffeeInvite}
        onNudge={handleNudge}
        onGiveItem={handleGiveItem}
        onFocusInvite={handleFocusInvite}
        onShareMusic={handleShareMusic}
        canGive={!!carriedItem}
        canSharePlaylist={!!officeMusic.content}
        canShareJam={!!officeMusic.jam}
      />

      <MusicPanel
        isOpen={showMusic}
        minimised={musicPrefs.minimised}
        onMinimisedChange={minimised => updateMusicPrefs({ minimised })}
        onOpen={() => setShowMusic(true)}
        onClose={() => setShowMusic(false)}
        playerOpen={!!musicPrefs.playerOpen}
        onPlayerOpenChange={playerOpen => updateMusicPrefs({ playerOpen })}
        personalPlaylist={musicPrefs.playlist ?? null}
        onPersonalPlaylistChange={playlist => updateMusicPrefs({ playlist })}
        music={officeMusic}
        canEdit={canEditMusic}
        canManageJam={canManageJam}
        hideNotifications={musicPrefs.hideNotifications}
        onHideNotificationsChange={hideNotifications => updateMusicPrefs({ hideNotifications })}
        focusing={!!focusSession}
        onSaveContent={saveSharedContent}
        onSaveJam={saveJamInvite}
        onRemoveJam={removeJamInvite}
        onRequestJam={requestJam}
      />

      <OfficeSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        office={{ ...office, name: officeName }}
        memberships={memberships}
        currentUser={currentUser}
        onRename={(name) => {
          setOfficeName(name)
          if (live) {
            void renameRemoteOffice(office.id, name).then(() => onOfficeUpdated?.({ ...office, name })).catch(() => {})
          }
          addToast('Office renamed!', 'success')
        }}
        onLeave={() => addToast('Left the office', 'info')}
      />

      {/* Invite modal */}
      {showInvite && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(48,53,47,0.5)' }}
          onClick={() => setShowInvite(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-xl p-5 fade-in"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="type-h3 text-ink mb-4">Invite to {officeName}</h2>
            <div className="flex gap-2 mb-4">
              <div className="flex-1 bg-muted border border-border px-3 py-2 type-small text-ink-2 font-mono truncate">
                {inviteLabel(office.inviteCode)}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(inviteLink(office.inviteCode))
                  addToast('Invite link copied!', 'success')
                  setShowInvite(false)
                }}
                className="px-3 border border-border text-ink-2 text-[13px] hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Copy
              </button>
            </div>
            <p className="type-small text-ink-2">Anyone with this link can join your private office.</p>
          </div>
        </div>
      )}

      {showTasks && (
        <TaskBoard
          officeId={office.id}
          userId={currentUser.id}
          userName={currentUser.name}
          canModerate={canEditMusic}
          onClose={() => setShowTasks(false)}
        />
      )}

      <FocusHistoryPanel
        isOpen={showFocusHistory}
        onClose={() => setShowFocusHistory(false)}
        history={focusHistory}
      />

      <BookshelfPanel
        isOpen={showBookshelf}
        shelfLabel={bookshelfLabel}
        carriedBook={carriedItem === 'book'}
        onPickUp={(book: Book) => {
          if (carriedItem && carriedItem !== 'book') {
            addToast('Your hands are full', 'info', 1800)
            return
          }
          setHeldBook(book)
          setCarried('book')
          addSpeechBubble(currentUser.id, `📚 Reading "${book.title}"`, 'status', 4000)
          addToast(`Picked up ${book.title}`, 'success', 2000)
          setShowBookshelf(false)
        }}
        onReturn={() => {
          setCarried(null)
          addToast('Book returned to shelf', 'info', 2000)
        }}
        onClose={() => setShowBookshelf(false)}
      />

      {boardRoom && (
        <SharedBoard
          officeId={office.id}
          designId={designId}
          roomId={boardRoom}
          userId={currentUser.id}
          userName={currentUser.name}
          canModerate={canEditMusic}
          onClose={() => setBoardRoom(null)}
        />
      )}

      {meetingTarget && (
        <MeetingHub
          officeId={office.id}
          designId={designId}
          roomId={roomIdAt(rooms, meetingTarget.gridX, meetingTarget.gridY)}
          userId={currentUser.id}
          userName={currentUser.name}
          canModerate={canEditMusic}
          anchor={{ x: meetingTarget.gridX, y: meetingTarget.gridY }}
          onJoinSeat={() => {
            const cells = meetingTarget.cells ?? [{ x: meetingTarget.gridX, y: meetingTarget.gridY }]
            const seats = mapWithDesks.interactables.filter(obj => obj.type === 'sit' && (obj.cells ?? []).some(seat =>
              cells.some(cell => Math.max(Math.abs(seat.x - cell.x), Math.abs(seat.y - cell.y)) <= 1)
            ))
            const open = seats.filter(seat => {
              const cell = seat.cells?.[0]
              if (!cell) return false
              if (Math.max(Math.abs(cell.x - currentPos.gridX), Math.abs(cell.y - currentPos.gridY)) > 3) return false
              return !onlineUsers.some(user => !user.isCurrentUser && user.position.gridX === cell.x && user.position.gridY === cell.y)
            }).sort((a, b) => {
              const da = Math.abs((a.cells?.[0].x ?? 0) - currentPos.gridX) + Math.abs((a.cells?.[0].y ?? 0) - currentPos.gridY)
              const db = Math.abs((b.cells?.[0].x ?? 0) - currentPos.gridX) + Math.abs((b.cells?.[0].y ?? 0) - currentPos.gridY)
              return da - db
            })
            const chosen = open[0]
            const cell = chosen?.cells?.[0]
            if (!cell) {
              addToast('The seats at this table are taken', 'info', 1800)
              return false
            }
            setSeatedSeatId(chosen.id)
            setCurrentPos({ gridX: cell.x, gridY: cell.y })
            setOnlineUsers(prev => prev.map(user => user.isCurrentUser ? {
              ...user,
              seated: true,
              position: { ...user.position, gridX: cell.x, gridY: cell.y, x: cell.x * 48, y: cell.y * 48 },
            } : user))
            saveState({ currentPos: { gridX: cell.x, gridY: cell.y }, designId })
            addSpeechBubble(currentUser.id, '🪑 In the meeting', 'status', 4000)
            return true
          }}
          onLeaveSeat={() => {
            setSeatedSeatId(null)
            setOnlineUsers(prev => prev.map(user => user.isCurrentUser ? { ...user, seated: false } : user))
          }}
          joinOnOpen={enterDiscussion}
          onClose={() => { setMeetingTarget(null); setEnterDiscussion(false) }}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
