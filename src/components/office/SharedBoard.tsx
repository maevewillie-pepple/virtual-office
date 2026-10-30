import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { BoardItem, DiscussionDoc, NoteColor } from '../../collaboration/store'
import {
  activeSession, deleteAsset, loadAsset, loadBoard, loadDiscussion,
  prepareImage, saveAsset, saveBoard, subscribeCollab, boardKey, discussionKey,
} from '../../collaboration/store'
import {
  ArrowUpRight, Circle, Clock, Copy, ExternalLink, Flag, Hand, Image as ImageIcon,
  Info, Link2, Lock, Maximize2, Minus, MoreHorizontal, MousePointer2, Pencil, Redo2,
  SmilePlus, Square, StickyNote, Trash2, Type, Undo2, Unlock, X, ZoomIn, ZoomOut,
  BringToFront, SendToBack, PenLine,
} from 'lucide-react'

const COLORS: { id: NoteColor; label: string; bg: string; ink: string }[] = [
  { id: 'butter', label: 'Butter', bg: '#F3E3A8', ink: '#6E5A2E' },
  { id: 'sage', label: 'Sage', bg: '#D5E0C8', ink: '#3E5240' },
  { id: 'pink', label: 'Dusty pink', bg: '#F0D4D4', ink: '#7A4E4E' },
  { id: 'peach', label: 'Warm peach', bg: '#F3D5C4', ink: '#7A4E38' },
  { id: 'blue', label: 'Muted blue', bg: '#D4DDE8', ink: '#3E5168' },
]

const WORLD = { w: 2400, h: 1600 }
const MOD = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl+'

type ToolId = 'select' | 'hand' | 'note' | 'photo' | 'link' | 'text' | 'draw' | 'shape'
type ShapeKind = 'rect' | 'ellipse' | 'line' | 'arrow'

const TOOLS: { id: ToolId; label: string; shortcut: string; icon: React.ReactNode }[] = [
  { id: 'select', label: 'Select', shortcut: 'V', icon: <MousePointer2 size={16} /> },
  { id: 'hand', label: 'Pan', shortcut: 'H', icon: <Hand size={16} /> },
  { id: 'note', label: 'Sticky note', shortcut: 'N', icon: <StickyNote size={16} /> },
  { id: 'photo', label: 'Photo', shortcut: 'P', icon: <ImageIcon size={16} /> },
  { id: 'link', label: 'Link', shortcut: 'L', icon: <Link2 size={16} /> },
  { id: 'text', label: 'Text', shortcut: 'T', icon: <Type size={16} /> },
  { id: 'draw', label: 'Draw', shortcut: 'D', icon: <Pencil size={16} /> },
  { id: 'shape', label: 'Shape', shortcut: 'S', icon: <Square size={16} /> },
]

interface SharedBoardProps {
  officeId: string
  designId: string
  roomId: string
  userId: string
  userName: string
  canModerate: boolean
  onClose: () => void
}

export default function SharedBoard({
  officeId, designId, roomId, userId, userName, canModerate, onClose,
}: SharedBoardProps) {
  const [board, setBoard] = useState(() => loadBoard(officeId, designId, roomId))
  const [discussion, setDiscussion] = useState<DiscussionDoc>(() => loadDiscussion(officeId, designId, roomId))
  const [tool, setTool] = useState<ToolId>('select')
  const [color, setColor] = useState<NoteColor>('butter')
  const [brush, setBrush] = useState(3)
  const [shapeKind, setShapeKind] = useState<ShapeKind>('rect')
  const [selected, setSelected] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 48, y: 48 })
  const [activity, setActivity] = useState(false)
  const [moreOpen, setMoreOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [zoomMenu, setZoomMenu] = useState(false)
  const [conflict, setConflict] = useState('')
  const [confirmClear, setConfirmClear] = useState(false)
  const [hint, setHint] = useState(() => localStorage.getItem('vo_board_hint') !== '1')
  const [upload, setUpload] = useState<{ file: File; url: string; caption: string; error: string; posting: boolean } | null>(null)
  const [linkHref, setLinkHref] = useState('')
  const [linkTitle, setLinkTitle] = useState('')
  const [linkError, setLinkError] = useState('')
  const [editingLink, setEditingLink] = useState<string | null>(null)
  const [clock, setClock] = useState('')
  const [spaceDown, setSpaceDown] = useState(false)
  const [hist, setHist] = useState({ undo: 0, redo: 0 })
  const [draftPos, setDraftPos] = useState<{ id: string; x: number; y: number } | null>(null)
  const [stroke, setStroke] = useState<{ x: number; y: number }[] | null>(null)
  const [shapeDraft, setShapeDraft] = useState<{ x: number; y: number; w: number; h: number; points?: { x: number; y: number }[] } | null>(null)
  const [bar, setBar] = useState<{ x: number; y: number } | null>(null)
  const [reactOpen, setReactOpen] = useState(false)
  const [itemMenu, setItemMenu] = useState(false)

  const undoRef = useRef<BoardItem[][]>([])
  const redoRef = useRef<BoardItem[][]>([])
  const surface = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)
  const railRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const drag = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null)
  const dragPos = useRef<{ id: string; x: number; y: number } | null>(null)
  const draw = useRef<{ x: number; y: number }[] | null>(null)
  const shapeStart = useRef<{ x: number; y: number } | null>(null)
  const editBase = useRef<Record<string, string>>({})
  const scaleRef = useRef(scale)
  const panRef = useRef(pan)
  const toolRef = useRef(tool)
  scaleRef.current = scale
  panRef.current = pan
  toolRef.current = tool

  const refresh = () => {
    setBoard(loadBoard(officeId, designId, roomId))
    setDiscussion(loadDiscussion(officeId, designId, roomId))
  }

  useEffect(() => subscribeCollab(
    [boardKey(officeId, designId, roomId), discussionKey(officeId, designId, roomId)],
    refresh,
  ), [officeId, designId, roomId])

  const items = board.items.filter(item => !item.deleted)
  const live = activeSession(discussion)
  const locked = board.locked && !canModerate
  const selectedItem = items.find(item => item.id === selected) ?? null

  useEffect(() => {
    if (!live) { setClock(''); return }
    const tick = () => {
      const ms = Math.max(0, new Date(live.endsAt).getTime() - Date.now())
      const m = Math.floor(ms / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      setClock(`${m}:${s.toString().padStart(2, '0')}`)
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [live?.id, live?.endsAt])

  const syncHist = () => setHist({ undo: undoRef.current.length, redo: redoRef.current.length })

  const persist = (nextItems: BoardItem[], extra?: { clearedAt?: string | null }) => {
    const current = loadBoard(officeId, designId, roomId)
    const clearedAt = extra ? (extra.clearedAt || undefined) : current.clearedAt
    const next = saveBoard(officeId, designId, roomId, { ...current, clearedAt, items: nextItems })
    setBoard(next)
    return next
  }

  const remember = () => {
    undoRef.current = [...undoRef.current.slice(-19), board.items.map(item => ({ ...item }))]
    redoRef.current = []
    syncHist()
  }

  const write = (produce: (list: BoardItem[]) => BoardItem[]) => {
    remember()
    const current = loadBoard(officeId, designId, roomId)
    const visible = current.items.filter(item => !item.deleted)
    const hidden = current.items.filter(item => item.deleted)
    const produced = produce(visible)
    persist([...produced, ...hidden.filter(item => !produced.some(entry => entry.id === item.id))])
  }

  const undo = () => {
    const prev = undoRef.current.pop()
    if (!prev) return
    redoRef.current.push(board.items.map(item => ({ ...item })))
    persist(prev, { clearedAt: null })
    syncHist()
  }

  const redo = () => {
    const nextItems = redoRef.current.pop()
    if (!nextItems) return
    undoRef.current.push(board.items.map(item => ({ ...item })))
    persist(nextItems, { clearedAt: null })
    syncHist()
  }

  const addItem = (partial: Omit<BoardItem, 'id' | 'authorId' | 'authorName' | 'createdAt' | 'updatedAt'>) => {
    if (locked) return null
    const stamp = new Date().toISOString()
    const item: BoardItem = {
      ...partial,
      id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      authorId: userId,
      authorName: userName,
      createdAt: stamp,
      updatedAt: stamp,
    }
    write(list => [...list, item])
    setSelected(item.id)
    editBase.current[item.id] = stamp
    return item
  }

  const patch = (id: string, changes: Partial<BoardItem>, baseline?: string) => {
    if (locked) return false
    const current = loadBoard(officeId, designId, roomId).items.find(item => item.id === id)
    if (baseline && current && current.updatedAt !== baseline && (changes.text !== undefined || changes.caption !== undefined)) {
      setConflict('Someone else updated that. Your edit is still here. Look again before saving.')
      setBoard(loadBoard(officeId, designId, roomId))
      return false
    }
    const stamp = new Date().toISOString()
    write(list => list.map(item => item.id === id ? { ...item, ...changes, updatedAt: stamp } : item))
    editBase.current[id] = stamp
    setConflict('')
    return true
  }

  const removeItem = async (item: BoardItem) => {
    if (item.authorId !== userId && !canModerate) return
    const stillUsed = board.items.some(entry => entry.id !== item.id && !entry.deleted && entry.assetId === item.assetId)
    write(list => list.map(entry => entry.id === item.id ? { ...entry, deleted: true, updatedAt: new Date().toISOString() } : entry))
    if (item.assetId && !stillUsed) {
      await deleteAsset(item.assetId)
      await deleteAsset(`${item.assetId}_full`)
    }
    setSelected(null)
  }

  const duplicate = (item: BoardItem) => {
    addItem({
      type: item.type, x: item.x + 28, y: item.y + 28, w: item.w, h: item.h,
      rotation: item.rotation, color: item.color, text: item.text, caption: item.caption,
      href: item.href, assetId: item.assetId, shape: item.shape, stroke: item.stroke,
      points: item.points?.map(point => ({ ...point })),
    })
  }

  const moveLayer = (id: string, dir: -1 | 1) => {
    write(list => {
      const index = list.findIndex(item => item.id === id)
      const nextIndex = index + dir
      if (index < 0 || nextIndex < 0 || nextIndex >= list.length) return list
      const next = [...list]
      const [entry] = next.splice(index, 1)
      next.splice(nextIndex, 0, entry)
      return next
    })
  }

  const chooseTool = (next: ToolId) => {
    if (next !== 'photo' && upload) {
      URL.revokeObjectURL(upload.url)
      setUpload(null)
    }
    setTool(next)
    setMoreOpen(false)
    setZoomMenu(false)
    setAboutOpen(false)
    setLinkError('')
    if (next !== 'link') setEditingLink(null)
    if (next === 'photo') fileRef.current?.click()
  }

  const dismissHint = () => {
    localStorage.setItem('vo_board_hint', '1')
    setHint(false)
  }

  const cancelUpload = () => {
    if (upload) URL.revokeObjectURL(upload.url)
    setUpload(null)
    if (tool === 'photo') setTool('select')
  }

  const worldPoint = (clientX: number, clientY: number) => {
    const rect = surface.current?.getBoundingClientRect()
    if (!rect) return { x: 80, y: 80 }
    return {
      x: (clientX - rect.left - panRef.current.x) / scaleRef.current,
      y: (clientY - rect.top - panRef.current.y) / scaleRef.current,
    }
  }

  const placeNote = (point: { x: number; y: number }) => {
    const item = addItem({ type: 'note', text: '', color, x: point.x - 90, y: point.y - 20, w: 180, h: 150 })
    if (!item) return
    setEditingId(item.id)
    setTool('select')
  }

  const placeText = (point: { x: number; y: number }) => {
    const item = addItem({ type: 'text', text: '', color, x: point.x, y: point.y, w: 200, h: 72 })
    if (!item) return
    setEditingId(item.id)
    setTool('select')
  }

  const submitLink = () => {
    const parsed = normalizeUrl(linkHref)
    if ('error' in parsed) {
      setLinkError(parsed.error)
      return
    }
    const title = linkTitle.trim().slice(0, 80)
    if (editingLink) {
      patch(editingLink, { href: parsed.href, text: title })
    } else {
      const view = viewCenter()
      addItem({ type: 'link', href: parsed.href, text: title, x: view.x - 110, y: view.y - 32, w: 220, h: 72 })
    }
    setLinkHref('')
    setLinkTitle('')
    setLinkError('')
    setEditingLink(null)
    setTool('select')
  }

  const viewCenter = () => {
    const rect = surface.current?.getBoundingClientRect()
    const width = rect?.width ?? 800
    const height = rect?.height ?? 500
    return worldPoint((rect?.left ?? 0) + width / 2, (rect?.top ?? 0) + height / 2)
  }

  const postPhoto = async () => {
    if (!upload || upload.posting) return
    setUpload({ ...upload, posting: true, error: '' })
    try {
      const prepared = await prepareImage(upload.file)
      const assetId = `img_${Date.now()}`
      await saveAsset(assetId, prepared.thumb)
      await saveAsset(`${assetId}_full`, prepared.full)
      const center = viewCenter()
      addItem({
        type: 'photo',
        assetId,
        caption: upload.caption.trim().slice(0, 140),
        x: center.x - 100,
        y: center.y - 120,
        w: 200,
        h: 230,
        rotation: Math.round((Math.random() * 4 - 2) * 10) / 10,
      })
      URL.revokeObjectURL(upload.url)
      setUpload(null)
      setTool('select')
    } catch (error) {
      setUpload(current => current ? { ...current, posting: false, error: error instanceof Error ? error.message : 'Upload failed.' } : current)
    }
  }

  const clearBoard = () => {
    remember()
    persist([], { clearedAt: new Date().toISOString() })
    setSelected(null)
    setConfirmClear(false)
  }

  const toggleLock = () => {
    const current = loadBoard(officeId, designId, roomId)
    setBoard(saveBoard(officeId, designId, roomId, { ...current, locked: !current.locked }))
    setMoreOpen(false)
  }

  const fit = () => {
    if (!items.length) {
      setPan({ x: 48, y: 48 })
      setScale(1)
      return
    }
    const minX = Math.min(...items.map(item => item.x))
    const minY = Math.min(...items.map(item => item.y))
    const maxX = Math.max(...items.map(item => item.x + item.w))
    const maxY = Math.max(...items.map(item => item.y + item.h))
    const rect = surface.current?.getBoundingClientRect()
    const viewW = (rect?.width ?? 800) - 120
    const viewH = (rect?.height ?? 500) - 80
    const next = Math.min(1.6, Math.max(0.4, Math.min(viewW / (maxX - minX + 80), viewH / (maxY - minY + 80))))
    setScale(next)
    setPan({ x: 72 - minX * next, y: 36 - minY * next })
    setZoomMenu(false)
  }

  useEffect(() => {
    const el = surface.current
    if (!el) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const rect = el.getBoundingClientRect()
      const px = event.clientX - rect.left
      const py = event.clientY - rect.top
      const prev = scaleRef.current
      const next = Math.min(2, Math.max(0.4, prev * (event.deltaY > 0 ? 0.92 : 1.08)))
      const origin = panRef.current
      const worldX = (px - origin.x) / prev
      const worldY = (py - origin.y) / prev
      setScale(next)
      setPan({ x: px - worldX * next, y: py - worldY * next })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      const target = event.target as HTMLElement
      if (target.closest?.('[data-board-chrome]')) return
      if (popoverRef.current?.contains(target) || railRef.current?.contains(target)) return
      if (menuRef.current?.contains(target)) return
      setMoreOpen(false)
      setZoomMenu(false)
      setAboutOpen(false)
      if (toolRef.current === 'link') {
        setTool('select')
        setEditingLink(null)
        setLinkError('')
      }
    }
    document.addEventListener('pointerdown', onPointer)
    return () => document.removeEventListener('pointerdown', onPointer)
  }, [])

  const keysRef = useRef({
    confirmClear, upload, moreOpen, aboutOpen, zoomMenu, reactOpen, itemMenu, selected,
    undo, redo, chooseTool, cancelUpload,
  })
  keysRef.current = {
    confirmClear, upload, moreOpen, aboutOpen, zoomMenu, reactOpen, itemMenu, selected,
    undo, redo, chooseTool, cancelUpload,
  }

  useEffect(() => {
    const typing = () => {
      const el = document.activeElement as HTMLElement | null
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)
    }
    const onKey = (event: KeyboardEvent) => {
      const keys = keysRef.current
      if (keys.confirmClear) {
        if (event.key === 'Escape') setConfirmClear(false)
        return
      }
      if (typing() && event.key !== 'Escape') return
      if (event.key === 'Escape') {
        if (keys.upload) { keys.cancelUpload(); return }
        if (keys.moreOpen || keys.aboutOpen || keys.zoomMenu || keys.reactOpen || keys.itemMenu) {
          setMoreOpen(false); setAboutOpen(false); setZoomMenu(false); setReactOpen(false); setItemMenu(false)
          return
        }
        if (toolRef.current !== 'select') { setTool('select'); setEditingLink(null); return }
        if (keys.selected) { setSelected(null); setEditingId(null); return }
        return
      }
      if (event.key === ' ') {
        event.preventDefault()
        setSpaceDown(true)
        return
      }
      const meta = event.metaKey || event.ctrlKey
      if (meta && event.key.toLowerCase() === 'z') {
        event.preventDefault()
        if (event.shiftKey) keys.redo()
        else keys.undo()
        return
      }
      if (meta || event.altKey) return
      const shortcuts: Record<string, ToolId> = { v: 'select', h: 'hand', n: 'note', p: 'photo', l: 'link', t: 'text', d: 'draw', s: 'shape' }
      const next = shortcuts[event.key.toLowerCase()]
      if (next) keys.chooseTool(next)
    }
    const onUp = (event: KeyboardEvent) => {
      if (event.key === ' ') setSpaceDown(false)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('keyup', onUp)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('keyup', onUp)
    }
  }, [])

  const beginPan = (event: React.PointerEvent) => {
    const origin = { x: event.clientX, y: event.clientY, pan: panRef.current }
    const move = (ev: PointerEvent) => setPan({ x: origin.pan.x + ev.clientX - origin.x, y: origin.pan.y + ev.clientY - origin.y })
    const up = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  const onBackgroundDown = (event: React.PointerEvent) => {
    if (event.button === 1 || tool === 'hand' || spaceDown) {
      beginPan(event)
      return
    }
    const point = worldPoint(event.clientX, event.clientY)
    if (tool === 'draw' && !locked) {
      draw.current = [point]
      setStroke([point])
      event.currentTarget.setPointerCapture(event.pointerId)
      return
    }
    if (tool === 'shape' && !locked) {
      shapeStart.current = point
      setShapeDraft({ x: point.x, y: point.y, w: 0, h: 0 })
      event.currentTarget.setPointerCapture(event.pointerId)
      return
    }
    if (tool === 'note' && !locked) { placeNote(point); return }
    if (tool === 'text' && !locked) { placeText(point); return }
    setSelected(null)
    setEditingId(null)
    setReactOpen(false)
    setItemMenu(false)
  }

  const onBackgroundMove = (event: React.PointerEvent) => {
    if (draw.current) {
      const point = worldPoint(event.clientX, event.clientY)
      const last = draw.current[draw.current.length - 1]
      if (Math.hypot(point.x - last.x, point.y - last.y) < 3) return
      draw.current = [...draw.current, point].slice(-240)
      setStroke(draw.current)
      return
    }
    if (!shapeStart.current) return
    const point = worldPoint(event.clientX, event.clientY)
    setShapeDraft(boxFromPoints(shapeStart.current, point))
  }

  const onBackgroundUp = () => {
    if (draw.current) {
      if (draw.current.length >= 2) {
        const xs = draw.current.map(p => p.x)
        const ys = draw.current.map(p => p.y)
        const minX = Math.min(...xs)
        const minY = Math.min(...ys)
        addItem({
          type: 'drawing',
          color,
          stroke: brush,
          x: minX,
          y: minY,
          w: Math.max(24, Math.max(...xs) - minX),
          h: Math.max(24, Math.max(...ys) - minY),
          points: draw.current.map(p => ({ x: p.x - minX, y: p.y - minY })),
        })
      }
      draw.current = null
      setStroke(null)
    }
    if (shapeStart.current) {
      const end = shapeDraft
      const start = shapeStart.current
      shapeStart.current = null
      setShapeDraft(null)
      if (!end) return
      const dragged = end.w > 12 || end.h > 12
      if (!dragged && (shapeKind === 'rect' || shapeKind === 'ellipse')) {
        addItem({ type: 'shape', shape: shapeKind, color, x: start.x, y: start.y, w: 160, h: 100 })
        return
      }
      if (!dragged) return
      addItem({
        type: 'shape',
        shape: shapeKind,
        color,
        stroke: Math.max(2, brush),
        x: end.x,
        y: end.y,
        w: end.w,
        h: end.h,
        points: end.points,
      })
    }
  }

  useLayoutEffect(() => {
    if (!selected || !surface.current || !stage.current) { setBar(null); return }
    const el = surface.current.querySelector(`[data-item="${CSS.escape(selected)}"]`)
    if (!el) { setBar(null); return }
    const itemBox = el.getBoundingClientRect()
    const host = stage.current.getBoundingClientRect()
    setBar({ x: itemBox.left - host.left + itemBox.width / 2, y: itemBox.top - host.top })
  }, [selected, scale, pan, draftPos, board, items.length])

  const people = live?.participants ?? []
  const ink = COLORS.find(entry => entry.id === color) ?? COLORS[0]
  const showPopover = tool === 'note' || tool === 'link' || tool === 'draw' || tool === 'shape' || tool === 'photo' || !!upload
  const popoverIndex = Math.max(0, TOOLS.findIndex(entry => entry.id === (upload ? 'photo' : tool)))

  const cursor = spaceDown || tool === 'hand'
    ? 'grab'
    : tool === 'draw' || tool === 'shape' || tool === 'note' || tool === 'text'
      ? 'crosshair'
      : 'default'

  return (
    <div className="absolute inset-x-3 bottom-3 top-12 z-50 flex flex-col overflow-hidden rounded-xl border border-border bg-[#F6EBDA] shadow-2xl" style={{ overscrollBehavior: 'contain' }}>
      <header className="relative z-40 flex h-12 shrink-0 items-center gap-2 border-b border-border bg-surface px-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-semibold text-ink">Room board</h2>
            <span
              className="rounded-full bg-olive-soft px-2 py-0.5 text-[11px] font-medium text-olive"
              title="Every whiteboard in this room opens this board"
            >
              Shared
            </span>
            {board.locked && (
              <span className="inline-flex items-center gap-1 text-[11px] text-ink-3">
                <Lock size={12} /> Locked
              </span>
            )}
          </div>
        </div>
        {conflict && <p className="truncate text-[12px] text-error">{conflict}</p>}
        <div className="ml-auto flex items-center gap-1">
          {people.length > 0 && (
            <div className="mr-1 flex -space-x-1.5" aria-label={`${people.length} in the discussion`}>
              {people.slice(0, 4).map(person => (
                <span key={person.id} title={person.name} className="flex h-6 w-6 items-center justify-center rounded-full border border-surface bg-olive-soft text-[10px] font-medium text-olive">
                  {initials(person.name)}
                </span>
              ))}
            </div>
          )}
          <IconButton label="Activity" pressed={activity} onClick={() => { setActivity(v => !v); setMoreOpen(false) }}>
            <Clock size={16} />
          </IconButton>
          <div className="relative" ref={menuRef}>
            <IconButton label="More options" pressed={moreOpen} onClick={() => { setMoreOpen(v => !v); setAboutOpen(false); setActivity(false) }}>
              <MoreHorizontal size={16} />
            </IconButton>
            {moreOpen && (
              <div className="absolute right-0 top-9 z-40 w-52 rounded-lg border border-border bg-surface py-1 shadow-lg">
                {canModerate && (
                  <MenuRow icon={board.locked ? <Unlock size={14} /> : <Lock size={14} />} label={board.locked ? 'Unlock board' : 'Lock board'} onClick={toggleLock} />
                )}
                {canModerate && (
                  <MenuRow icon={<Trash2 size={14} />} label="Clear board" danger onClick={() => { setMoreOpen(false); setConfirmClear(true) }} />
                )}
                <MenuRow icon={<Clock size={14} />} label="View activity" onClick={() => { setMoreOpen(false); setActivity(true) }} />
                <MenuRow icon={<Info size={14} />} label="About this board" onClick={() => { setMoreOpen(false); setAboutOpen(true) }} />
              </div>
            )}
            {aboutOpen && (
              <div className="absolute right-0 top-9 z-40 w-64 rounded-lg border border-border bg-surface p-3 shadow-lg">
                <p className="text-[13px] font-medium text-ink">One board for this room</p>
                <p className="mt-1 text-[12px] leading-5 text-ink-2">Every whiteboard in this room opens the same board. Notes, photos, and links stay here after everyone leaves.</p>
              </div>
            )}
          </div>
          <IconButton label="Close board" onClick={onClose}>
            <X size={16} />
          </IconButton>
        </div>
      </header>

      {hint && (
        <div className="z-30 flex items-center gap-2 border-b border-border/70 bg-olive-soft/70 px-3 py-1.5">
          <p className="text-[12px] text-ink">Every whiteboard in this room opens this board.</p>
          <button type="button" onClick={dismissHint} className="ml-auto text-[12px] font-medium text-olive">Got it</button>
        </div>
      )}

      <div ref={stage} className="relative min-h-0 flex-1">
        <div
          ref={surface}
          className="absolute inset-0 overflow-hidden"
          style={{ backgroundImage: 'radial-gradient(circle at 18% 0%, rgba(255,255,255,0.45), transparent 42%), linear-gradient(#F7F1E6, #EAD9C2)', cursor, touchAction: 'none' }}
          onPointerDown={onBackgroundDown}
          onPointerMove={onBackgroundMove}
          onPointerUp={onBackgroundUp}
        >
          <div style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`, transformOrigin: '0 0', width: WORLD.w, height: WORLD.h, position: 'relative' }}>
            {live && (
              <article className="pointer-events-none absolute left-[460px] top-6 z-10 w-56 rounded-lg border border-olive/30 bg-olive-soft/95 p-3 shadow-sm">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-olive">Today's discussion</p>
                <p className="mt-1 text-[13px] font-semibold text-ink">{live.title}</p>
                <p className="mt-1 text-[12px] text-ink-2">{clock} remaining · {live.participants.length} participating</p>
              </article>
            )}
            {items.map(item => (
              <BoardCard
                key={item.id}
                item={item}
                fill={COLORS.find(entry => entry.id === item.color)?.bg ?? '#F7F1E6'}
                ink={COLORS.find(entry => entry.id === item.color)?.ink ?? '#30352F'}
                selected={selected === item.id}
                editing={editingId === item.id}
                x={draftPos?.id === item.id ? draftPos.x : item.x}
                y={draftPos?.id === item.id ? draftPos.y : item.y}
                zoom={scale}
                canChange={(item.authorId === userId || canModerate) && !locked}
                onSelect={() => { setSelected(item.id); editBase.current[item.id] = item.updatedAt; setReactOpen(false); setItemMenu(false) }}
                onEdit={() => { if ((item.authorId === userId || canModerate) && !locked) setEditingId(item.id) }}
                onDragStart={event => {
                  if (locked || tool === 'draw' || tool === 'hand') return
                  const point = worldPoint(event.clientX, event.clientY)
                  drag.current = { id: item.id, dx: point.x - item.x, dy: point.y - item.y, moved: false }
                  event.stopPropagation()
                  event.currentTarget.setPointerCapture(event.pointerId)
                }}
                onDragMove={event => {
                  if (drag.current?.id !== item.id) return
                  const point = worldPoint(event.clientX, event.clientY)
                  drag.current.moved = true
                  const next = { id: item.id, x: point.x - drag.current.dx, y: point.y - drag.current.dy }
                  dragPos.current = next
                  setDraftPos(next)
                }}
                onDragEnd={() => {
                  const pos = dragPos.current
                  if (drag.current?.id === item.id && pos?.id === item.id && drag.current.moved) patch(item.id, { x: pos.x, y: pos.y })
                  drag.current = null
                  dragPos.current = null
                  setDraftPos(null)
                }}
                onResize={(w, h) => patch(item.id, { w, h })}
                onText={text => { patch(item.id, { text }, editBase.current[item.id]); setEditingId(null) }}
                onCaption={caption => { patch(item.id, { caption }, editBase.current[item.id]); setEditingId(null) }}
                onCancelEdit={() => setEditingId(null)}
              />
            ))}
            {stroke && stroke.length > 1 && (
              <svg className="pointer-events-none absolute left-0 top-0" width={WORLD.w} height={WORLD.h}>
                <polyline fill="none" stroke={ink.ink} strokeWidth={brush} strokeLinecap="round" strokeLinejoin="round" points={stroke.map(p => `${p.x},${p.y}`).join(' ')} />
              </svg>
            )}
            {shapeDraft && <ShapePreview draft={shapeDraft} kind={shapeKind} fill={ink.bg} ink={ink.ink} />}
          </div>
        </div>

        <div ref={railRef} className="absolute left-3 top-1/2 z-20 -translate-y-1/2">
          <div className="flex flex-col gap-0.5 rounded-xl border border-border bg-surface/95 p-1 shadow-md backdrop-blur-sm" role="toolbar" aria-label="Board tools">
            {TOOLS.map(entry => (
              <RailButton
                key={entry.id}
                label={entry.label}
                shortcut={entry.shortcut}
                pressed={tool === entry.id}
                disabled={locked && entry.id !== 'select' && entry.id !== 'hand'}
                onClick={() => chooseTool(entry.id)}
              >
                {entry.icon}
              </RailButton>
            ))}
          </div>
          {showPopover && (
            <div
              ref={popoverRef}
              className="absolute left-full ml-2 w-60 rounded-xl border border-border bg-surface p-3 shadow-lg"
              style={{ top: popoverIndex * 34 }}
              onPointerDown={event => event.stopPropagation()}
            >
              {tool === 'note' && (
                <PopoverShell title="Sticky note" onCancel={() => setTool('select')}>
                  <ColorRow color={color} onPick={setColor} />
                  <p className="text-[12px] text-ink-2">Click the board to place it, then type.</p>
                </PopoverShell>
              )}
              {tool === 'link' && (
                <form onSubmit={event => { event.preventDefault(); submitLink() }}>
                  <PopoverShell title={editingLink ? 'Edit link' : 'Add a link'} onCancel={() => { setTool('select'); setEditingLink(null); setLinkError('') }}>
                    <label className="block text-[11px] text-ink-3">Address</label>
                    <input
                      autoFocus
                      value={linkHref}
                      onChange={event => { setLinkHref(event.target.value); setLinkError('') }}
                      placeholder="Paste a URL..."
                      className="mt-1 w-full rounded-md border border-border bg-canvas px-2 py-1.5 text-[13px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    />
                    <label className="mt-2 block text-[11px] text-ink-3">Title, optional</label>
                    <input
                      value={linkTitle}
                      onChange={event => setLinkTitle(event.target.value)}
                      placeholder="What should it say?"
                      maxLength={80}
                      className="mt-1 w-full rounded-md border border-border bg-canvas px-2 py-1.5 text-[13px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    />
                    {linkError && <p className="mt-1.5 text-[12px] text-error">{linkError}</p>}
                    <div className="mt-3 flex justify-end gap-2">
                      <GhostButton type="button" onClick={() => { setTool('select'); setEditingLink(null); setLinkError('') }}>Cancel</GhostButton>
                      <SolidButton type="submit">{editingLink ? 'Save' : 'Add link'}</SolidButton>
                    </div>
                  </PopoverShell>
                </form>
              )}
              {tool === 'draw' && (
                <PopoverShell title="Draw" onCancel={() => setTool('select')}>
                  <ColorRow color={color} onPick={setColor} />
                  <div className="flex gap-1">
                    {[2, 4, 8].map(size => (
                      <button key={size} type="button" aria-label={`${size} pixel brush`} aria-pressed={brush === size} onClick={() => setBrush(size)} className={`flex h-8 w-8 items-center justify-center rounded-md border ${brush === size ? 'border-olive bg-olive-soft' : 'border-border'}`}>
                        <span className="rounded-full bg-ink" style={{ width: size + 2, height: size + 2 }} />
                      </button>
                    ))}
                  </div>
                  <p className="text-[12px] text-ink-2">Draw on the board. Esc leaves the pencil.</p>
                </PopoverShell>
              )}
              {tool === 'shape' && (
                <PopoverShell title="Shape" onCancel={() => setTool('select')}>
                  <div className="grid grid-cols-4 gap-1">
                    {([
                      ['rect', 'Rectangle', <Square size={15} />],
                      ['ellipse', 'Circle', <Circle size={15} />],
                      ['line', 'Line', <Minus size={15} />],
                      ['arrow', 'Arrow', <ArrowUpRight size={15} />],
                    ] as const).map(([id, label, icon]) => (
                      <button key={id} type="button" aria-label={label} title={label} aria-pressed={shapeKind === id} onClick={() => setShapeKind(id)} className={`flex h-8 items-center justify-center rounded-md border ${shapeKind === id ? 'border-olive bg-olive-soft text-olive' : 'border-border text-ink-2'}`}>
                        {icon}
                      </button>
                    ))}
                  </div>
                  <ColorRow color={color} onPick={setColor} />
                  <p className="text-[12px] text-ink-2">Drag on the board to draw it.</p>
                </PopoverShell>
              )}
              {(tool === 'photo' || upload) && (
                <PopoverShell title="Add a photo" onCancel={cancelUpload}>
                  {!upload && <p className="text-[12px] text-ink-2">Choose a JPEG, PNG, or WebP from your device.</p>}
                  {upload && <img src={upload.url} alt="" className="max-h-28 w-full rounded-md bg-canvas object-contain" />}
                  {upload && (
                    <input
                      value={upload.caption}
                      onChange={event => setUpload({ ...upload, caption: event.target.value })}
                      placeholder="Caption, optional"
                      maxLength={140}
                      className="w-full rounded-md border border-border bg-canvas px-2 py-1.5 text-[13px] text-ink outline-none focus-visible:ring-2 focus-visible:ring-focus"
                    />
                  )}
                  {upload?.error && <p className="text-[12px] text-error">{upload.error}</p>}
                  {upload?.posting && <p className="text-[12px] text-ink-2">Preparing image…</p>}
                  <div className="flex justify-end gap-2">
                    <GhostButton onClick={cancelUpload}>Cancel</GhostButton>
                    {!upload && <SolidButton onClick={() => fileRef.current?.click()}>Choose image</SolidButton>}
                    {upload && <SolidButton onClick={postPhoto} disabled={upload.posting}>{upload.posting ? 'Posting…' : 'Post'}</SolidButton>}
                  </div>
                </PopoverShell>
              )}
            </div>
          )}
        </div>

        <div data-board-chrome className="absolute bottom-3 left-3 z-20 flex items-center gap-0.5 rounded-xl border border-border bg-surface/95 p-1 shadow-md">
          <RailButton label="Undo" shortcut={`${MOD}Z`} disabled={hist.undo === 0} onClick={undo}><Undo2 size={16} /></RailButton>
          <RailButton label="Redo" shortcut={`${MOD}Shift+Z`} disabled={hist.redo === 0} onClick={redo}><Redo2 size={16} /></RailButton>
        </div>

        <div data-board-chrome className="absolute bottom-3 right-3 z-20 flex items-center gap-0.5 rounded-xl border border-border bg-surface/95 p-1 shadow-md">
          <RailButton label="Zoom out" onClick={() => setScale(s => Math.max(0.4, Math.round((s - 0.1) * 100) / 100))}><ZoomOut size={16} /></RailButton>
          <button
            type="button"
            className="h-8 min-w-12 rounded-md px-1.5 text-[12px] font-medium text-ink hover:bg-muted"
            aria-label="Zoom percentage"
            aria-expanded={zoomMenu}
            onClick={() => setZoomMenu(v => !v)}
          >
            {Math.round(scale * 100)}%
          </button>
          <RailButton label="Zoom in" onClick={() => setScale(s => Math.min(2, Math.round((s + 0.1) * 100) / 100))}><ZoomIn size={16} /></RailButton>
          <RailButton label="Fit content" onClick={fit}><Maximize2 size={16} /></RailButton>
          {zoomMenu && (
            <div className="absolute bottom-12 right-0 w-36 rounded-lg border border-border bg-surface py-1 shadow-lg" onPointerDown={event => event.stopPropagation()}>
              {[50, 100, 150].map(value => (
                <button key={value} type="button" className="block w-full px-3 py-1.5 text-left text-[12px] text-ink hover:bg-muted" onClick={() => { setScale(value / 100); setZoomMenu(false) }}>
                  {value}%
                </button>
              ))}
              <button type="button" className="block w-full px-3 py-1.5 text-left text-[12px] text-ink hover:bg-muted" onClick={fit}>Fit content</button>
            </div>
          )}
        </div>

        {selectedItem && bar && (
          <div
            data-board-chrome
            className="absolute z-30 flex items-center gap-0.5 rounded-xl border border-border bg-surface px-1 py-1 shadow-lg"
            style={{ left: bar.x, top: Math.max(8, bar.y - 44), transform: 'translateX(-50%)' }}
            onPointerDown={event => event.stopPropagation()}
          >
            <RailButton label="React" pressed={reactOpen} onClick={() => { setReactOpen(v => !v); setItemMenu(false) }}><SmilePlus size={15} /></RailButton>
            {(selectedItem.type === 'note' || selectedItem.type === 'text') && (
              <ColorRow color={selectedItem.color ?? 'butter'} compact onPick={next => patch(selectedItem.id, { color: next })} />
            )}
            {(selectedItem.authorId === userId || canModerate) && !locked && selectedItem.type !== 'drawing' && selectedItem.type !== 'shape' && (
              <RailButton label={selectedItem.type === 'link' ? 'Edit link' : 'Edit'} onClick={() => {
                if (selectedItem.type === 'link') {
                  setEditingLink(selectedItem.id)
                  setLinkHref(selectedItem.href ?? '')
                  setLinkTitle(selectedItem.text && selectedItem.text !== selectedItem.href ? selectedItem.text : '')
                  setTool('link')
                  return
                }
                setEditingId(selectedItem.id)
              }}><PenLine size={15} /></RailButton>
            )}
            {selectedItem.type === 'link' && selectedItem.href && (
              <a href={selectedItem.href} target="_blank" rel="noreferrer" aria-label="Open link" title="Open link" className="flex h-7 w-7 items-center justify-center rounded-md text-ink-2 hover:bg-muted hover:text-ink">
                <ExternalLink size={15} />
              </a>
            )}
            {!locked && <RailButton label="Duplicate" onClick={() => duplicate(selectedItem)}><Copy size={15} /></RailButton>}
            {!locked && <RailButton label="Bring forward" onClick={() => moveLayer(selectedItem.id, 1)}><BringToFront size={15} /></RailButton>}
            {!locked && <RailButton label="Send backward" onClick={() => moveLayer(selectedItem.id, -1)}><SendToBack size={15} /></RailButton>}
            {(selectedItem.authorId === userId || canModerate) && !locked && (
              <RailButton label="Delete" onClick={() => removeItem(selectedItem)}><Trash2 size={15} /></RailButton>
            )}
            <RailButton label="More" pressed={itemMenu} onClick={() => { setItemMenu(v => !v); setReactOpen(false) }}><MoreHorizontal size={15} /></RailButton>
            {reactOpen && (
              <div className="absolute bottom-11 left-0 flex gap-1 rounded-lg border border-border bg-surface p-1 shadow-md">
                {['👍', '❤️', '😂'].map(emoji => {
                  const count = selectedItem.reactions?.[emoji]?.length ?? 0
                  const mine = selectedItem.reactions?.[emoji]?.includes(userId)
                  return (
                    <button key={emoji} type="button" aria-pressed={!!mine} className={`rounded-md px-1.5 py-0.5 text-[13px] ${mine ? 'bg-olive-soft' : 'hover:bg-muted'}`} onClick={() => {
                      const list = selectedItem.reactions?.[emoji] ?? []
                      const next = list.includes(userId) ? list.filter(id => id !== userId) : [...list, userId]
                      patch(selectedItem.id, { reactions: { ...selectedItem.reactions, [emoji]: next } })
                    }}>
                      {emoji}{count ? ` ${count}` : ''}
                    </button>
                  )
                })}
              </div>
            )}
            {itemMenu && (
              <div className="absolute bottom-11 right-0 w-40 rounded-lg border border-border bg-surface py-1 shadow-md">
                <MenuRow icon={<Flag size={14} />} label={selectedItem.reported ? 'Reported' : 'Report'} onClick={() => { patch(selectedItem.id, { reported: true }); setItemMenu(false) }} />
              </div>
            )}
          </div>
        )}

        {activity && (
          <aside className="absolute right-3 top-3 z-20 w-60 rounded-xl border border-border bg-surface p-3 shadow-lg">
            <p className="text-[12px] font-semibold text-ink">Recent</p>
            <ul className="mt-2 space-y-1.5">
              {[...items].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8).map(item => (
                <li key={item.id} className="text-[11px] leading-4 text-ink-2">
                  {item.authorName} · {labelFor(item)} · {new Date(item.updatedAt).toLocaleString()}
                </li>
              ))}
              {items.length === 0 && <li className="text-[11px] text-ink-3">Nothing on the board yet.</li>}
            </ul>
          </aside>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={event => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (!file) return
          if (upload) URL.revokeObjectURL(upload.url)
          setUpload({ file, url: URL.createObjectURL(file), caption: '', error: '', posting: false })
          setTool('photo')
        }}
      />

      {confirmClear && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-ink/25 p-4" onPointerDown={event => event.stopPropagation()}>
          <div role="dialog" aria-modal="true" aria-labelledby="clear-board-title" className="w-full max-w-[320px] rounded-xl border border-border bg-surface p-4 shadow-lg">
            <h2 id="clear-board-title" className="text-[15px] font-semibold text-ink">Clear this board?</h2>
            <p className="mt-1.5 text-[13px] leading-5 text-ink-2">This will remove all notes, photos and drawings from this room's shared board. Undo can bring them back until you reload.</p>
            <div className="mt-4 flex justify-end gap-2">
              <GhostButton autoFocus onClick={() => setConfirmClear(false)}>Cancel</GhostButton>
              <button type="button" onClick={clearBoard} className="h-8 rounded-md bg-[#9A4D3C] px-3 text-[12px] font-medium text-white hover:bg-[#833F32] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
                Clear board
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function BoardCard({
  item, fill, ink, selected, editing, x, y, zoom, canChange,
  onSelect, onEdit, onDragStart, onDragMove, onDragEnd, onResize, onText, onCaption, onCancelEdit,
}: {
  item: BoardItem
  fill: string
  ink: string
  selected: boolean
  editing: boolean
  x: number
  y: number
  zoom: number
  canChange: boolean
  onSelect: () => void
  onEdit: () => void
  onDragStart: (event: React.PointerEvent) => void
  onDragMove: (event: React.PointerEvent) => void
  onDragEnd: () => void
  onResize: (w: number, h: number) => void
  onText: (text: string) => void
  onCaption: (caption: string) => void
  onCancelEdit: () => void
}) {
  const [draft, setDraft] = useState(item.text ?? '')
  const [caption, setCaption] = useState(item.caption ?? '')
  const [preview, setPreview] = useState(false)
  const [liveSize, setLiveSize] = useState<{ w: number; h: number } | null>(null)
  const width = liveSize?.w ?? item.w
  const height = liveSize?.h ?? item.h
  const reactions = Object.entries(item.reactions ?? {}).filter(([, ids]) => ids.length > 0)

  useEffect(() => { if (editing) setDraft(item.text ?? '') }, [editing, item.text])

  const startResize = (event: React.PointerEvent) => {
    event.stopPropagation()
    const start = { x: event.clientX, y: event.clientY, w: item.w, h: item.h, zoom }
    const resizeTo = (clientX: number, clientY: number) => ({
      w: Math.max(minSize(item.type).w, start.w + (clientX - start.x) / start.zoom),
      h: Math.max(minSize(item.type).h, start.h + (clientY - start.y) / start.zoom),
    })
    const move = (ev: PointerEvent) => setLiveSize(resizeTo(ev.clientX, ev.clientY))
    const up = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      const next = resizeTo(ev.clientX, ev.clientY)
      onResize(next.w, next.h)
      setLiveSize(null)
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
  }

  return (
    <article
      data-item={item.id}
      title={item.authorName}
      className="absolute"
      style={{ left: x, top: y, width, height, zIndex: selected ? 5 : 1 }}
      onPointerDown={event => { onSelect(); onDragStart(event) }}
      onPointerMove={onDragMove}
      onPointerUp={onDragEnd}
      onDoubleClick={event => { event.stopPropagation(); if (canChange && item.type !== 'drawing' && item.type !== 'shape') onEdit() }}
    >
      <div
        className={`relative h-full w-full overflow-hidden shadow-sm ${selected ? 'ring-2 ring-olive' : 'hover:ring-1 hover:ring-olive/40'} ${item.type === 'photo' ? 'bg-white p-1.5 pb-7' : item.type === 'link' ? 'bg-surface' : item.type === 'note' || item.type === 'text' ? 'flex flex-col p-2.5' : ''}`}
        style={{
          background: item.type === 'photo' || item.type === 'link' || item.type === 'text' || item.type === 'shape' || item.type === 'drawing' ? undefined : fill,
          borderRadius: item.type === 'photo' ? 2 : 10,
          transform: `rotate(${item.rotation ?? 0}deg)`,
        }}
      >
        {item.type === 'photo' && item.assetId && (
          <Photo assetId={item.assetId} onOpen={() => setPreview(true)} />
        )}
        {item.type === 'shape' && <ShapeBody item={{ ...item, w: width, h: height }} fill={fill} ink={ink} />}
        {item.type === 'drawing' && item.points && (
          <svg viewBox={`0 0 ${item.w} ${item.h}`} className="h-full w-full overflow-visible">
            <polyline fill="none" stroke={ink} strokeWidth={item.stroke ?? 2} strokeLinecap="round" strokeLinejoin="round" points={item.points.map(p => `${p.x},${p.y}`).join(' ')} />
          </svg>
        )}
        {item.type === 'link' && <LinkCard href={item.href ?? ''} title={item.text} />}
        {(item.type === 'note' || item.type === 'text') && (
          editing ? (
            <textarea
              autoFocus
              value={draft}
              onChange={event => setDraft(event.target.value)}
              onBlur={() => onText(draft.slice(0, 400))}
              onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onCancelEdit() } }}
              onPointerDown={event => event.stopPropagation()}
              placeholder={item.type === 'note' ? 'Write a note' : 'Write something'}
              className="h-[calc(100%-16px)] w-full resize-none bg-transparent text-[13px] leading-5 text-ink outline-none"
              style={{ color: item.type === 'text' ? ink : undefined }}
            />
          ) : (
            <p className="whitespace-pre-wrap text-[13px] leading-5 text-ink" style={{ color: item.type === 'text' ? ink : undefined }}>
              {item.text || (item.type === 'note' ? 'Empty note' : 'Text')}
            </p>
          )
        )}
        {item.type === 'photo' && (
          editing ? (
            <input
              autoFocus
              value={caption}
              onChange={event => setCaption(event.target.value)}
              onBlur={() => onCaption(caption.slice(0, 140))}
              onKeyDown={event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onCancelEdit() } }}
              onPointerDown={event => event.stopPropagation()}
              placeholder="Caption"
              className="absolute bottom-1 left-2 right-2 bg-transparent text-[12px] text-ink outline-none"
            />
          ) : (
            <p className="absolute bottom-1 left-2 right-8 truncate text-[12px] text-ink">{item.caption}</p>
          )
        )}
        {item.type !== 'drawing' && item.type !== 'shape' && item.type !== 'link' && (
          <p className={`truncate text-[10px] text-ink-3 ${item.type === 'photo' || item.type === 'link' ? 'absolute bottom-1 right-2 max-w-[40%]' : 'mt-auto'}`}>
            {item.authorName}
          </p>
        )}
        {reactions.length > 0 && (
          <div className="absolute bottom-1 left-2 flex gap-1">
            {reactions.map(([emoji, ids]) => (
              <span key={emoji} className="rounded-full bg-surface/90 px-1 text-[10px] shadow-sm">{emoji} {ids.length}</span>
            ))}
          </div>
        )}
      </div>
      {selected && canChange && item.type !== 'drawing' && (
        <button
          type="button"
          aria-label="Resize"
          className="absolute bottom-0 right-0 h-3 w-3 cursor-nwse-resize rounded-sm border border-olive bg-surface"
          onPointerDown={startResize}
        />
      )}
      {preview && item.assetId && <FullPhoto assetId={`${item.assetId}_full`} onClose={() => setPreview(false)} />}
    </article>
  )
}

function LinkCard({ href, title }: { href: string; title?: string }) {
  const domain = domainOf(href)
  const custom = title && title !== href ? title : ''
  return (
    <div className="flex h-full items-center gap-2 px-2.5">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-olive">
        <Link2 size={15} />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-[13px] font-medium text-ink">{custom || domain}</span>
        <span className="block truncate text-[11px] text-ink-3">{domain}</span>
      </span>
    </div>
  )
}

function ShapeBody({ item, fill, ink }: { item: BoardItem; fill: string; ink: string }) {
  if (item.shape === 'line' || item.shape === 'arrow') {
    const a = item.points?.[0] ?? { x: 8, y: item.h / 2 }
    const b = item.points?.[1] ?? { x: item.w - 8, y: item.h / 2 }
    const id = `arrow-${item.id}`
    return (
      <svg className="h-full w-full overflow-visible">
        <defs>
          <marker id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
            <path d="M0,0 L7,3 L0,6 Z" fill={ink} />
          </marker>
        </defs>
        <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={ink} strokeWidth={item.stroke ?? 3} strokeLinecap="round" markerEnd={item.shape === 'arrow' ? `url(#${id})` : undefined} />
      </svg>
    )
  }
  return (
    <div className="h-full w-full border-2" style={{ borderColor: ink, background: fill, borderRadius: item.shape === 'ellipse' ? 999 : 10, opacity: 0.9 }} />
  )
}

function ShapePreview({ draft, kind, fill, ink }: { draft: { x: number; y: number; w: number; h: number; points?: { x: number; y: number }[] }; kind: ShapeKind; fill: string; ink: string }) {
  return (
    <div className="pointer-events-none absolute" style={{ left: draft.x, top: draft.y, width: Math.max(draft.w, 2), height: Math.max(draft.h, 2) }}>
      <ShapeBody item={{ id: 'preview', type: 'shape', shape: kind, x: 0, y: 0, w: draft.w, h: draft.h, points: draft.points, stroke: 3, authorId: '', authorName: '', createdAt: '', updatedAt: '' }} fill={fill} ink={ink} />
    </div>
  )
}

function Photo({ assetId, onOpen }: { assetId: string; onOpen: () => void }) {
  const url = useAssetUrl(assetId)
  if (!url) return <div className="h-[78%] animate-pulse rounded-sm bg-muted" />
  return <img src={url} alt="" className="h-[78%] w-full rounded-[1px] object-cover" onDoubleClick={event => { event.stopPropagation(); onOpen() }} />
}

function FullPhoto({ assetId, onClose }: { assetId: string; onClose: () => void }) {
  const url = useAssetUrl(assetId)
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/60 p-6" onPointerDown={event => { event.stopPropagation(); onClose() }}>
      {url && <img src={url} alt="" className="max-h-full max-w-full rounded-md" />}
    </div>
  )
}

function useAssetUrl(id: string) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    let created = ''
    loadAsset(id).then(blob => {
      if (!active || !blob) return
      created = URL.createObjectURL(blob)
      setUrl(created)
    }).catch(() => setUrl(null))
    return () => {
      active = false
      if (created) URL.revokeObjectURL(created)
    }
  }, [id])
  return url
}

function RailButton({
  children, label, shortcut, pressed, disabled, onClick,
}: {
  children: React.ReactNode
  label: string
  shortcut?: string
  pressed?: boolean
  disabled?: boolean
  onClick?: () => void
}) {
  return (
    <button
      type="button"
      aria-label={shortcut ? `${label} (${shortcut})` : label}
      aria-pressed={pressed}
      disabled={disabled}
      title={shortcut ? `${label} (${shortcut})` : label}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-focus disabled:opacity-30 ${pressed ? 'bg-olive-soft text-olive' : 'text-ink-2 hover:bg-muted hover:text-ink'}`}
    >
      {children}
    </button>
  )
}

function IconButton({ children, label, pressed, onClick }: { children: React.ReactNode; label: string; pressed?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={`flex h-8 w-8 items-center justify-center rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${pressed ? 'bg-muted text-ink' : 'text-ink-2 hover:bg-muted hover:text-ink'}`}
    >
      {children}
    </button>
  )
}

function MenuRow({ icon, label, onClick, danger }: { icon: React.ReactNode; label: string; onClick: () => void; danger?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] hover:bg-muted ${danger ? 'text-error' : 'text-ink'}`}>
      {icon} {label}
    </button>
  )
}

function PopoverShell({ title, onCancel, children }: { title: string; onCancel: () => void; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center">
        <p className="text-[13px] font-semibold text-ink">{title}</p>
        <button type="button" aria-label="Cancel" onClick={onCancel} className="ml-auto rounded-md p-0.5 text-ink-3 hover:bg-muted hover:text-ink">
          <X size={14} />
        </button>
      </div>
      {children}
    </div>
  )
}

function ColorRow({ color, onPick, compact }: { color: NoteColor; onPick: (color: NoteColor) => void; compact?: boolean }) {
  return (
    <div className={`flex items-center gap-1 ${compact ? '' : ''}`}>
      {COLORS.map(swatch => (
        <button
          key={swatch.id}
          type="button"
          aria-label={swatch.label}
          aria-pressed={color === swatch.id}
          title={swatch.label}
          onClick={() => onPick(swatch.id)}
          onPointerDown={event => event.stopPropagation()}
          className="h-5 w-5 rounded-full border border-black/10"
          style={{ background: swatch.bg, outline: color === swatch.id ? '2px solid #66765C' : undefined, outlineOffset: 1 }}
        />
      ))}
    </div>
  )
}

function GhostButton({ children, onClick, type = 'button', autoFocus }: { children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit'; autoFocus?: boolean }) {
  return (
    <button type={type} autoFocus={autoFocus} onClick={onClick} className="h-8 rounded-md border border-border bg-canvas px-2.5 text-[12px] font-medium text-ink hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
      {children}
    </button>
  )
}

function SolidButton({ children, onClick, type = 'button', disabled }: { children: React.ReactNode; onClick?: () => void; type?: 'button' | 'submit'; disabled?: boolean }) {
  return (
    <button type={type} disabled={disabled} onClick={onClick} className="h-8 rounded-md border border-olive/30 bg-olive-soft px-2.5 text-[12px] font-medium text-olive hover:border-olive/50 disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus">
      {children}
    </button>
  )
}

function normalizeUrl(raw: string): { href: string } | { error: string } {
  const trimmed = raw.trim()
  if (!trimmed) return { error: 'Paste a web address.' }
  const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  let url: URL
  try { url = new URL(withProto) } catch { return { error: 'That address does not look right.' } }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return { error: 'Use an http or https link.' }
  if (url.hostname !== 'localhost' && !url.hostname.includes('.')) return { error: 'Include a domain, like example.com.' }
  return { href: url.toString() }
}

function domainOf(href: string) {
  try { return new URL(href).hostname.replace(/^www\./, '') } catch { return 'Link' }
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  return parts.map(part => part[0]?.toUpperCase() ?? '').join('') || '•'
}

function labelFor(item: BoardItem) {
  if (item.type === 'link') return domainOf(item.href ?? '')
  if (item.type === 'note') return item.text?.slice(0, 32) || 'Note'
  if (item.type === 'photo') return item.caption || 'Photo'
  return item.type
}

function minSize(type: BoardItem['type']) {
  if (type === 'link') return { w: 180, h: 64 }
  if (type === 'photo') return { w: 120, h: 140 }
  if (type === 'text') return { w: 80, h: 40 }
  return { w: 96, h: 72 }
}

function boxFromPoints(a: { x: number; y: number }, b: { x: number; y: number }) {
  const pad = 10
  const x = Math.min(a.x, b.x) - pad
  const y = Math.min(a.y, b.y) - pad
  const w = Math.max(24, Math.abs(a.x - b.x) + pad * 2)
  const h = Math.max(24, Math.abs(a.y - b.y) + pad * 2)
  return {
    x, y, w, h,
    points: [{ x: a.x - x, y: a.y - y }, { x: b.x - x, y: b.y - y }],
  }
}
