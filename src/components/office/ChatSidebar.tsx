import React, { useState, useRef, useEffect } from 'react'
import type { Message, SharedLink, User, OnlineUser } from '../../types'
import { Send, ExternalLink, X } from 'lucide-react'
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
          <AvatarSprite config={dmUser.user.avatar} status={dmUser.user.status} name={dmUser.user.name} size={28} />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-ink leading-tight truncate">{dmUser.user.name}</p>
            <p className="text-[11px] text-ink-3 leading-tight">{STATUS_LABEL[dmUser.user.status]}</p>
          </div>
          {onHide && <HideChatButton onHide={onHide} />}
        </div>
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-2 flex flex-col gap-2 min-h-0">
          {thread.length === 0 && (
            <p className="text-center text-[12px] text-ink-3 mt-6">
              Start a conversation with {dmUser.user.name.split(' ')[0]}
            </p>
          )}
          {thread.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.from === 'You' ? 'items-end' : 'items-start'}`}>
              <div className={`px-3 py-2 text-[13px] leading-relaxed rounded-xl max-w-[85%] ${
                msg.from === 'You'
                  ? 'rounded-br-sm bg-olive-soft text-ink border border-olive/20'
                  : 'rounded-bl-sm bg-muted text-ink border border-border'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
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
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
            {messages.map(msg => (
              <MessageItem
                key={msg.id}
                msg={msg}
                isOwn={msg.authorId === currentUser.id}
                onReact={emoji => onReact(msg.id, emoji)}
                showEmojiPicker={emojiPickerFor === msg.id}
                onToggleEmojiPicker={() => setEmojiPickerFor(v => v === msg.id ? null : msg.id)}
                formatTime={formatTime}
              />
            ))}
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

interface MessageItemProps {
  msg: Message
  isOwn: boolean
  onReact: (emoji: string) => void
  showEmojiPicker: boolean
  onToggleEmojiPicker: () => void
  formatTime: (iso: string) => string
}

function MessageItem({ msg, isOwn, onReact, showEmojiPicker, onToggleEmojiPicker, formatTime }: MessageItemProps) {
  const hasReactions = Object.keys(msg.reactions).length > 0

  return (
    <div className={`group relative ${isOwn ? 'items-end' : 'items-start'} flex flex-col`}>
      {!isOwn && (
        <div className="flex items-center gap-1.5 mb-1">
          <AvatarSprite config={msg.authorAvatar} status="online" name={msg.authorName} size={18} />
          <span className="type-small font-medium text-ink">{msg.authorName}</span>
          <span className="type-small text-ink-3">{formatTime(msg.timestamp)}</span>
        </div>
      )}

      <div className={`relative max-w-[85%] ${isOwn ? 'self-end' : 'self-start'}`}>
        <div className={`
          rounded-xl px-3 py-2 text-[13px] leading-relaxed
          ${isOwn
            ? 'rounded-br-sm bg-olive-soft text-ink border border-olive/20'
            : 'rounded-bl-sm bg-muted text-ink border border-border'}
          ${msg.type === 'system' ? 'bg-clay-soft border border-clay/20 text-clay text-[12px] italic text-center' : ''}
        `}>
          {msg.content}
          {msg.linkPreview && (
            <a
              href={msg.linkPreview.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 rounded-lg border border-border p-2 hover:border-border-strong transition-colors bg-surface"
            >
              <p className="type-label text-ink leading-snug">{msg.linkPreview.title}</p>
              {msg.linkPreview.description && (
                <p className="type-small text-ink-2 mt-0.5 line-clamp-2">{msg.linkPreview.description}</p>
              )}
              <p className="type-small text-ink-3 mt-1">{msg.linkPreview.domain}</p>
            </a>
          )}
        </div>
        {isOwn && <p className="type-small text-ink-3 text-right mt-0.5">{formatTime(msg.timestamp)}</p>}
      </div>

      {hasReactions && (
        <div className="flex flex-wrap gap-1 mt-1 px-1">
          {Object.entries(msg.reactions).map(([emoji, users]) => (
            <button
              key={emoji}
              onClick={() => onReact(emoji)}
              className="text-[12px] bg-muted border border-border rounded-full px-2 py-0.5 hover:bg-olive-soft hover:border-olive/30 transition-colors flex items-center gap-1"
            >
              <span>{emoji}</span>
              <span className="text-ink-3 text-[10px]">{users.length}</span>
            </button>
          ))}
        </div>
      )}

      {/* Hover emoji picker */}
      <div className="absolute -top-8 right-0 hidden group-hover:flex items-center gap-1 bg-surface border border-border rounded-lg px-2 py-1 z-10 shadow-md">
        {QUICK_EMOJI.map(e => (
          <button
            key={e}
            onClick={() => { onReact(e); onToggleEmojiPicker() }}
            className="text-[13px] hover:scale-125 transition-transform"
            aria-label={`React with ${e}`}
          >
            {e}
          </button>
        ))}
      </div>
    </div>
  )
}
