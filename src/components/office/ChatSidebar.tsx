import React, { useState, useRef, useEffect } from 'react'
import type { Message, SharedLink, User, OnlineUser } from '../../types'
import { Coffee, Send, ExternalLink, SmilePlus, Timer, X } from 'lucide-react'
import AvatarSprite from '../ui/AvatarSprite'

type DmMsg = { id: string; from: string; text: string; ts: number }

interface ChatSidebarProps {
  messages: Message[]
  sharedLinks: SharedLink[]
  onlineUsers: OnlineUser[]
  currentUser: User
  onSendMessage: (content: string) => void
  onReact: (messageId: string, emoji: string) => void
  isCollapsed: boolean
  dmUser?: OnlineUser | null
  dmThreads?: Record<string, DmMsg[]>
  onOpenDm?: (user: OnlineUser) => void
  onCloseDm?: () => void
  onSendDm?: (text: string) => void
  onHide?: () => void
}

type Tab = 'chat' | 'people' | 'links'

const STATUS_LABEL: Record<string, string> = {
  online: 'Online', focusing: 'Focusing', on_break: 'On Break', away: 'Away', offline: 'Offline',
}
const STATUS_DOT: Record<string, string> = {
  online: 'bg-success', focusing: 'bg-clay', on_break: 'bg-warning', away: 'bg-ink-3', offline: 'bg-border-strong',
}

const QUICK_EMOJI = ['👍', '❤️', '😂', '🎉', '👀', '🔥', '☕', '🙌']

function HideChatButton({ onHide }: { onHide: () => void }) {
  return (
    <button
      type="button"
      onClick={onHide}
      aria-label="Hide chat"
      title="Hide chat"
      className="flex items-center justify-center px-2.5 text-ink-3 hover:bg-muted hover:text-ink transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-focus"
    >
      <X size={15} strokeWidth={1.75} />
    </button>
  )
}

export default function ChatSidebar({
  messages, sharedLinks, onlineUsers, currentUser, onSendMessage, onReact, isCollapsed,
  dmUser, dmThreads = {}, onOpenDm, onCloseDm, onSendDm, onHide,
}: ChatSidebarProps) {
  const [tab, setTab] = useState<Tab>('chat')
  const [input, setInput] = useState('')
  const [dmInput, setDmInput] = useState('')
  const [emojiPickerFor, setEmojiPickerFor] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const dmEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const dmInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (dmUser) {
      dmEndRef.current?.scrollIntoView({ behavior: 'smooth' })
      setTimeout(() => dmInputRef.current?.focus(), 50)
    }
  }, [dmUser, dmThreads])

  const handleSend = () => {
    const text = input.trim()
    if (!text) return
    onSendMessage(text)
    setInput('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
  }

  const handleDmSend = () => {
    const text = dmInput.trim()
    if (!text || !onSendDm) return
    onSendDm(text)
    setDmInput('')
    dmInputRef.current?.focus()
  }

  const handleDmKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleDmSend() }
  }

  const formatTime = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  if (isCollapsed) return null

  // DM view — shown when a dmUser is active
  if (dmUser) {
    const thread = dmThreads[dmUser.user.id] ?? []
    return (
      <aside
        className="flex flex-col h-full border-l border-border bg-surface flex-shrink-0"
        style={{ width: 300 }}
        aria-label="Direct message panel"
      >
        {/* DM Header */}
        <div className="flex items-center gap-2.5 px-3 py-3 border-b border-border flex-shrink-0">
          <button
            onClick={onCloseDm}
            className="text-ink-3 hover:text-ink transition-colors text-[18px] leading-none mr-1"
            aria-label="Back to chat"
          >←</button>
          <AvatarSprite config={dmUser.user.avatar} status={dmUser.user.status} name="" size={28} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-ink leading-tight truncate">{dmUser.user.name}</p>
            <p className="text-[13px] leading-tight text-ink-2">{STATUS_LABEL[dmUser.user.status]}</p>
          </div>
          {onHide && <HideChatButton onHide={onHide} />}
        </div>
        {/* Messages */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-3 py-2">
          {thread.length === 0 && (
            <p className="mt-6 text-center text-[14px] text-ink-2">
              Start a conversation with {dmUser.user.name.split(' ')[0]}
            </p>
          )}
          {thread.map((msg, index) => {
            const mine = msg.from === 'You'
            const continued = index > 0 && thread[index - 1].from === msg.from
            const time = new Date(msg.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            return (
              <div key={msg.id} className={`flex items-start gap-2 ${continued ? 'mt-1.5' : 'mt-3 first:mt-0'} ${mine ? 'justify-end' : ''}`}>
                {!mine && (
                  <span className="flex h-8 w-8 shrink-0 items-start justify-center">
                    {!continued && (
                      <AvatarSprite config={dmUser.user.avatar} status={dmUser.user.status} name="" size={96} style={{ width: 32, height: 32 }} />
                    )}
                  </span>
                )}
                <div className={`flex max-w-[85%] flex-col ${mine ? 'items-end' : 'items-start'}`}>
                  <div className={`relative w-fit max-w-full break-words px-2.5 py-1.5 text-[15px] leading-snug text-ink [overflow-wrap:anywhere] ${bubbleClass(mine)}`}>
                    <BubbleCorner mine={mine} />
                    {msg.text}
                  </div>
                  {mine && <time className="mt-1 text-[12px] text-ink-2">{time}</time>}
                </div>
              </div>
            )
          })}
          <div ref={dmEndRef} />
        </div>
        {/* Input */}
        <div className="p-3 border-t border-border flex-shrink-0">
          <div className="flex gap-2 items-center">
            <input
              ref={dmInputRef}
              value={dmInput}
              onChange={e => setDmInput(e.target.value)}
              onKeyDown={handleDmKeyDown}
              placeholder={`Message ${dmUser.user.name.split(' ')[0]}…`}
              className="flex-1 bg-canvas border border-border rounded-[6px] px-3 py-2 text-[13px] text-ink placeholder-ink-3
                focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/30 transition-colors"
              aria-label="DM input"
            />
            <button
              onClick={handleDmSend}
              disabled={!dmInput.trim()}
              className="w-8 h-8 rounded-[6px] flex items-center justify-center transition-all flex-shrink-0
                border border-border text-ink-3 bg-canvas hover:bg-muted hover:text-ink
                disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              aria-label="Send DM"
            >
              <Send size={14} strokeWidth={1.75} />
            </button>
          </div>
        </div>
      </aside>
    )
  }

  return (
    <aside
      className="flex flex-col h-full border-l border-border bg-surface flex-shrink-0"
      style={{ width: 300 }}
      aria-label="Chat and team panel"
    >
      {/* Tab bar */}
      <div className="flex border-b border-border flex-shrink-0">
        {(['chat', 'people', 'links'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2.5 text-[11px] font-medium uppercase tracking-wider transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-focus
              ${tab === t ? 'text-ink border-b-2 border-olive' : 'text-ink-3 hover:text-ink-2'}`}
            aria-selected={tab === t}
            role="tab"
          >
            {t === 'chat' ? 'Chat' : t === 'people' ? 'People' : 'Links'}
          </button>
        ))}
        {onHide && <HideChatButton onHide={onHide} />}
      </div>

      {/* Chat tab */}
      {tab === 'chat' && (
        <>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden p-3">
            {messages.map((msg, index) => {
              const prev = messages[index - 1]
              const continued = !!prev && prev.type !== 'system' && msg.type !== 'system' && prev.authorId === msg.authorId
              return (
                <MessageItem
                  key={msg.id}
                  msg={msg}
                  isOwn={msg.authorId === currentUser.id}
                  continued={continued}
                  currentUserId={currentUser.id}
                  onReact={emoji => onReact(msg.id, emoji)}
                  showEmojiPicker={emojiPickerFor === msg.id}
                  onToggleEmojiPicker={() => setEmojiPickerFor(v => v === msg.id ? null : msg.id)}
                  formatTime={formatTime}
                />
              )
            })}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t border-border flex-shrink-0">
            <div className="flex gap-2 items-end">
              <textarea
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message the office…"
                rows={1}
                className="flex-1 bg-canvas border border-border rounded-[6px] px-3 py-2 text-[13px] text-ink placeholder-ink-3
                  resize-none focus:outline-none focus:border-olive focus:ring-1 focus:ring-olive/30 transition-colors"
                style={{ maxHeight: 72, overflowY: 'auto' }}
                aria-label="Message input"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="w-8 h-8 rounded-[6px] flex items-center justify-center transition-all flex-shrink-0
                  border border-border text-ink-3 bg-canvas hover:bg-muted hover:text-ink
                  disabled:opacity-30 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                aria-label="Send message"
              >
                <Send size={14} strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* People tab */}
      {tab === 'people' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-0.5 min-h-0">
          <p className="type-small text-ink-3 px-2 pb-2 uppercase tracking-wider">
            {onlineUsers.length} online
          </p>
          {onlineUsers.map(ou => (
            <div
              key={ou.user.id}
              className={`flex items-center gap-2.5 p-2 rounded-lg transition-colors group ${ou.isCurrentUser ? 'cursor-default' : 'cursor-pointer hover:bg-muted'}`}
              onClick={() => !ou.isCurrentUser && onOpenDm && onOpenDm(ou)}
            >
              <div className="relative flex-shrink-0">
                <AvatarSprite config={ou.user.avatar} status={ou.user.status} name={ou.user.name} size={32} />
                <span className={`absolute bottom-0 right-0 w-2 h-2 rounded-full border border-surface ${STATUS_DOT[ou.user.status]}`} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="type-label text-ink truncate text-[13px]">
                  {ou.isCurrentUser ? 'You' : ou.user.name}
                </p>
                <p className="type-small text-ink-2 truncate">
                  {ou.focusSession ? '🎧 Focusing' : ou.coffeeBreak ? 'On break' : STATUS_LABEL[ou.user.status]}
                </p>
              </div>
              {!ou.isCurrentUser && (
                <span className="type-small text-ink-3 opacity-0 group-hover:opacity-100 transition-opacity text-[11px] font-medium border border-border rounded px-1.5 py-0.5 flex-shrink-0">
                  DM
                </span>
              )}
              {ou.isCurrentUser && ou.deskId && (
                <span className="type-small text-ink-3 font-mono flex-shrink-0">
                  {ou.deskId.replace('desk_', 'D')}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Links tab */}
      {tab === 'links' && (
        <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
          <p className="type-small text-ink-3 px-1 pb-1 uppercase tracking-wider">
            {sharedLinks.length} shared links
          </p>
          {sharedLinks.map(link => (
            <div key={link.id} className="rounded-lg border border-border overflow-hidden hover:border-border-strong transition-colors">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 hover:bg-muted transition-colors"
              >
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="type-label text-ink leading-snug mb-0.5 line-clamp-2">{link.title}</p>
                    <p className="type-small text-ink-3">{link.preview?.domain}</p>
                  </div>
                  <ExternalLink size={12} strokeWidth={1.75} className="text-ink-3 mt-0.5 flex-shrink-0" />
                </div>
              </a>
              <div className="px-3 py-1.5 border-t border-border flex items-center justify-between">
                <span className="type-small text-ink-3">Shared by {link.sharedByName}</span>
                <span className="type-small text-ink-3">{new Date(link.timestamp).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  )
}

const bubbleClass = (mine: boolean) =>
  mine
    ? 'rounded-[4px] rounded-br-none border border-[#c5d0bc] bg-olive-soft'
    : 'rounded-[4px] rounded-tl-none border border-border bg-muted'

function BubbleCorner({ mine }: { mine: boolean }) {
  if (mine) {
    return (
      <>
        <span aria-hidden className="pointer-events-none absolute -bottom-px -right-[7px] h-[9px] w-[8px] bg-[#c5d0bc]" style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }} />
        <span aria-hidden className="pointer-events-none absolute bottom-0 -right-[6px] h-[7px] w-[7px] bg-olive-soft" style={{ clipPath: 'polygon(0 0, 100% 100%, 0 100%)' }} />
      </>
    )
  }
  return (
    <>
      <span aria-hidden className="pointer-events-none absolute -left-[7px] -top-px h-[9px] w-[8px] bg-border" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
      <span aria-hidden className="pointer-events-none absolute -left-[6px] top-0 h-[7px] w-[7px] bg-muted" style={{ clipPath: 'polygon(100% 0, 100% 100%, 0 0)' }} />
    </>
  )
}

interface MessageItemProps {
  msg: Message
  isOwn: boolean
  continued: boolean
  currentUserId: string
  onReact: (emoji: string) => void
  showEmojiPicker: boolean
  onToggleEmojiPicker: () => void
  formatTime: (iso: string) => string
}

function MessageItem({ msg, isOwn, continued, currentUserId, onReact, showEmojiPicker, onToggleEmojiPicker, formatTime }: MessageItemProps) {
  const gap = continued ? 'mt-1.5' : 'mt-3 first:mt-0'
  if (msg.type === 'system') return <SystemNote text={msg.content} className={gap} />

  const entries = Object.entries(msg.reactions).filter(([, users]) => users.length > 0)

  const body = (
    <div className={`min-w-0 max-w-full ${isOwn ? 'flex flex-col items-end' : ''}`}>
      <div className={`relative w-fit max-w-full break-words px-2.5 py-1.5 pr-7 text-[15px] leading-snug text-ink [overflow-wrap:anywhere] ${bubbleClass(isOwn)}`}>
        <BubbleCorner mine={isOwn} />
        {msg.content}
        {msg.linkPreview && (
          <a
            href={msg.linkPreview.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block break-words border border-border bg-surface p-2 [overflow-wrap:anywhere] hover:border-border-strong"
          >
            <p className="text-[14px] font-medium leading-snug text-ink">{msg.linkPreview.title}</p>
            {msg.linkPreview.description && (
              <p className="mt-0.5 line-clamp-2 text-[13px] leading-5 text-ink-2">{msg.linkPreview.description}</p>
            )}
            <p className="mt-1 text-[12px] text-ink-2">{msg.linkPreview.domain}</p>
          </a>
        )}
        <button
          type="button"
          aria-label="Add reaction"
          aria-expanded={showEmojiPicker}
          onClick={onToggleEmojiPicker}
          className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center border border-border bg-surface text-ink-2 opacity-0 group-hover:opacity-100 focus:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
        >
          <SmilePlus size={13} />
        </button>
      </div>
      {entries.length > 0 && (
        <div className={`relative z-[1] -mt-1.5 flex flex-wrap gap-1 ${isOwn ? 'justify-end pr-1' : 'pl-1'}`}>
          {entries.map(([emoji, users]) => {
            const mine = users.includes(currentUserId)
            return (
              <button
                key={emoji}
                type="button"
                onClick={() => onReact(emoji)}
                aria-pressed={mine}
                className={`flex items-center gap-1 border px-1.5 py-0.5 text-[12px] focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${
                  mine ? 'border-olive bg-olive-soft text-ink' : 'border-border bg-surface text-ink hover:border-olive/40'
                }`}
              >
                <span>{emoji}</span>
                <span className="text-[12px] text-ink-2">{users.length}</span>
              </button>
            )
          })}
        </div>
      )}
      {showEmojiPicker && (
        <div className="mt-1 flex max-w-full flex-wrap gap-0.5 border border-border bg-surface p-1" role="group" aria-label="Reactions">
          {QUICK_EMOJI.map(emoji => (
            <button
              key={emoji}
              type="button"
              onClick={() => { onReact(emoji); onToggleEmojiPicker() }}
              className="flex h-7 w-7 items-center justify-center text-[14px] hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  )

  if (isOwn) {
    return (
      <div className={`group flex justify-end ${gap}`}>
        <div className="flex max-w-[85%] flex-col items-end">
          {body}
          <time className="mt-1 text-[12px] leading-4 text-ink-2">{formatTime(msg.timestamp)}</time>
        </div>
      </div>
    )
  }

  return (
    <div className={`group grid grid-cols-[32px_minmax(0,1fr)] items-start gap-x-2 ${gap}`}>
      {!continued && (
        <div className="col-start-2 mb-1 flex min-w-0 items-baseline gap-2">
          <span className="truncate text-[14px] font-medium leading-5 text-ink">{msg.authorName}</span>
          <time className="shrink-0 text-[12px] leading-4 text-ink-2">{formatTime(msg.timestamp)}</time>
        </div>
      )}
      <div className={`col-start-1 self-start ${continued ? 'row-start-1' : 'row-start-2'}`}>
        {!continued && (
          <AvatarSprite config={msg.authorAvatar} status="online" name="" size={96} style={{ width: 32, height: 32 }} />
        )}
      </div>
      <div className={`col-start-2 min-w-0 max-w-[92%] ${continued ? 'row-start-1' : 'row-start-2'}`}>
        {body}
      </div>
    </div>
  )
}

function SystemNote({ text, className }: { text: string; className?: string }) {
  const focus = /focus/i.test(text)
  const coffee = /coffee|break/i.test(text)
  return (
    <div className={`flex justify-center ${className ?? ''}`} role="status">
      <p className="inline-flex max-w-[92%] items-center gap-1.5 border border-border bg-muted px-2.5 py-1 text-center text-[13px] leading-5 text-ink-2">
        {focus && <Timer size={13} className="shrink-0 text-olive" aria-hidden />}
        {coffee && !focus && <Coffee size={13} className="shrink-0 text-olive" aria-hidden />}
        <span className="break-words [overflow-wrap:anywhere]">{text}</span>
      </p>
    </div>
  )
}
