import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import type { Desk, OnlineUser, FocusDuration, Message, SpeechBubble, CarriedItem, InteractableObject, OfficeMusicState, SpotifyContent, MusicPreferences } from '../../types'
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
import FocusHistoryPanel from '../office/FocusHistoryPanel'
import BookshelfPanel, { type Book } from '../office/BookshelfPanel'
import MeetingHub from '../office/MeetingHub'
import SharedBoard from '../office/SharedBoard'
import InteractionMenu from '../office/InteractionMenu'
import BaristaGame from '../office/BaristaGame'
import { carriedEmoji, carriedShort, isBook, isHeldDrink, isTeaDrink } from '../../game/barista/carry'
import { readWord } from '../../game/arcade/store'
import { buildRoomIndex, roomIdAt } from '../../collaboration/rooms'
import { findLiveMarker, migrateLegacyBoards, subscribeAny } from '../../collaboration/store'
import { seatBesideDesk } from '../../utils/interactions'
import { PanelRightOpen } from 'lucide-react'
import { ToastContainer, useToasts } from '../ui/Toast'
import type { FocusHistoryEntry } from '../../types'
import { loadMusicPreferences, loadOfficeMusic, parseJamInvite, parseSpotifyContent, saveMusicPreferences, saveOfficeMusic, spotifyKindLabel, spotifyOpenUrl } from '../../utils/spotify'

const STORAGE_KEY = 'vo_office_state'

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveState(state: Record<string, unknown>) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)) } catch {}
}

export default function OfficeScreen() {
  const office = demoOffices[0]
  const currentUser = { ...demoUsers[0] }
  const savedState = loadState()

  const [designId, setDesignId] = useState<OfficeDesignId>(
    (savedState?.designId as OfficeDesignId) ?? 'classic'
  )
  const [showDesignPicker, setShowDesignPicker] = useState(false)

  const officeMap = useMemo(() => {
    const design = OFFICE_DESIGNS.find(d => d.id === designId) ?? OFFICE_DESIGNS[0]
    return design.build()
  }, [designId])
  const rooms = useMemo(() => buildRoomIndex(officeMap.tiles), [officeMap])

  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [messages, setMessages] = useState<Message[]>(demoMessages)
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>(demoOnlineUsers)
  const [desks, setDesks] = useState(() =>
    officeMap.desks.map((d, i) =>
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

  const { toasts, addToast, dismiss } = useToasts()

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === musicKey) setOfficeMusic(loadOfficeMusic(musicKey))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [musicKey])

  const musicRole = memberships.find(m => m.userId === currentUser.id)?.role
  const canEditMusic = musicRole === 'owner' || musicRole === 'admin'
  const canManageJam = canEditMusic || officeMusic.jam?.sharedById === currentUser.id

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
        ? { ...d, ownerId: currentUser.id, ownerName: 'You', isAvailable: false }
        : d.ownerId === currentUser.id ? { ...d, ownerId: undefined, ownerName: undefined, isAvailable: true } : d
    ))
    addToast('Desk claimed! This is your spot 🪑', 'success')
  }, [currentUser.id, addToast])

  const handleReleaseDesk = useCallback((deskId: string) => {
    setDesks(prev => prev.map(d =>
      d.id === deskId ? { ...d, ownerId: undefined, ownerName: undefined, isAvailable: true } : d
    ))
    addToast('Desk released', 'info')
  }, [addToast])

  const handleSendMessage = useCallback((content: string) => {
    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      officeId: office.id,
      authorId: currentUser.id,
      authorName: 'You',
      authorAvatar: currentUser.avatar,
      content,
      type: content.startsWith('http') ? 'link' : 'text',
      timestamp: new Date().toISOString(),
      reactions: {},
    }
    setMessages(prev => [...prev, newMsg])
    addSpeechBubble(currentUser.id, content, 'chat', 5000)
  }, [office.id, currentUser, addSpeechBubble])

  const handleReact = useCallback((messageId: string, emoji: string) => {
    setMessages(prev => prev.map(m => {
      if (m.id !== messageId) return m
      const existing = m.reactions[emoji] || []
      const hasReacted = existing.includes(currentUser.id)
      return {
        ...m,
        reactions: {
          ...m.reactions,
          [emoji]: hasReacted
            ? existing.filter(id => id !== currentUser.id)
            : [...existing, currentUser.id],
        },
      }
    }))
  }, [currentUser.id])

  const saveFocusHistory = useCallback((entries: FocusHistoryEntry[]) => {
    setFocusHistory(entries)
    try { localStorage.setItem('vo_focus_history', JSON.stringify(entries)) } catch {}
  }, [])

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
  }, [onlineUsers, addToast, addSpeechBubble, currentUser.id])

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
  }, [onlineUsers, addToast, addSpeechBubble, currentUser.id])

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
    setFocusSignal(n => n + 1)
  }, [onlineUsers, addToast, addSpeechBubble, currentUser.id])

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
  }

  const handleCoffeeInvite = useCallback((userId: string) => {
    const name = onlineUsers.find(u => u.user.id === userId)?.user.name
    addSpeechBubble(currentUser.id, '☕ Coffee?', 'status', 3000)
    addToast(`Invited ${name?.split(' ')[0] ?? 'them'} for a coffee. They can walk to the kitchen.`, 'success', 2200)
  }, [onlineUsers, addToast, addSpeechBubble, currentUser.id])

  // User's claimed desk position for focus mode
  const userDeskPosition = useMemo(() => {
    const d = desks.find(desk => desk.ownerId === currentUser.id)
    return d ? { gridX: d.gridX, gridY: d.gridY } : null
  }, [desks, currentUser.id])

  // DM handlers
  const handleDmSend = useCallback((text: string) => {
    if (!dmUser || !text.trim()) return
    const uid = dmUser.user.id
    const msg = { id: `dm_${Date.now()}`, from: 'You', text: text.trim(), ts: Date.now() }
    setDmThreads(prev => ({ ...prev, [uid]: [...(prev[uid] ?? []), msg] }))
  }, [dmUser])

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
        if (desk.ownerId === currentUser.id) return { ...obj, prompt: 'Enter · Sit down' }
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
        onToggleSidebar={() => setSidebarOpen(v => !v)}
        sidebarOpen={sidebarOpen}
      />

      {/* Main area */}
      <div className="flex flex-1 min-h-0">
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
            suspendInput={!!(selectedDesk || selectedUser || showBookshelf || boardRoom || meetingTarget || menuObject || showSettings || showInvite || showFocusHistory || baristaOpen)}
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

          {/* Office design picker – floating top-left */}
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


          {!sidebarOpen && (
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="absolute top-2 right-2 z-30 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-border bg-surface text-[12px] font-medium text-ink shadow-sm hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              aria-label="Show chat"
            >
              <PanelRightOpen size={14} strokeWidth={1.75} />
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
              onOpenProfile={() => {}}
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
            sharedLinks={demoSharedLinks}
            onlineUsers={onlineUsers}
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
          } catch { /* ignore */ }
          addSpeechBubble(currentUser.id, '📝 left a note', 'status', 2500)
          addToast('Note left on the desk', 'success', 1800)
        }}
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
        onRename={(name) => { setOfficeName(name); addToast('Office renamed!', 'success') }}
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
                virtualoffice.app/join/{office.inviteCode}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`https://virtualoffice.app/join/${office.inviteCode}`)
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
          onClose={() => setMeetingTarget(null)}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  )
}
