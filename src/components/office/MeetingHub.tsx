import { useEffect, useRef, useState } from 'react'
import type { DiscussionDoc, DiscussionTopic, TopicCategory } from '../../collaboration/store'
import {
  activeSession, castVote, discussionKey, loadDiscussion, saveDiscussion, subscribeCollab, voteCounts,
} from '../../collaboration/store'
import { commitItems, loadBoard, saveBoard } from '../../collaboration/store'
import { X } from 'lucide-react'

const CATEGORIES: { id: TopicCategory; label: string }[] = [
  { id: 'work', label: 'Work' },
  { id: 'ideas', label: 'Ideas' },
  { id: 'fun', label: 'Fun' },
  { id: 'debate', label: 'Debate' },
  { id: 'planning', label: 'Planning' },
  { id: 'general', label: 'General' },
]
const DURATIONS = [5, 10, 15, 30]

interface MeetingHubProps {
  officeId: string
  designId: string
  roomId: string
  userId: string
  userName: string
  canModerate: boolean
  anchor: { x: number; y: number }
  onJoinSeat: () => boolean
  onLeaveSeat: () => void
  onClose: () => void
  joinOnOpen?: boolean
}

type Tab = 'topics' | 'live' | 'history'
type Sort = 'popular' | 'newest' | 'discussed'

export default function MeetingHub({
  officeId, designId, roomId, userId, userName, canModerate, anchor, onJoinSeat, onLeaveSeat, onClose, joinOnOpen = false,
}: MeetingHubProps) {
  const [doc, setDoc] = useState<DiscussionDoc>(() => loadDiscussion(officeId, designId, roomId))
  const [tab, setTab] = useState<Tab>(joinOnOpen ? 'live' : 'topics')
  const [sort, setSort] = useState<Sort>('popular')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<TopicCategory>('general')
  const [openTopic, setOpenTopic] = useState<string | null>(null)
  const [comment, setComment] = useState('')
  const [editingComment, setEditingComment] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [duration, setDuration] = useState(10)
  const [outcome, setOutcome] = useState({ summary: '', keyPoints: '', decision: '', followUps: '' })
  const [pin, setPin] = useState(true)
  const [clock, setClock] = useState('')

  const refresh = () => setDoc(loadDiscussion(officeId, designId, roomId))
  const joinSeatRef = useRef(onJoinSeat)
  joinSeatRef.current = onJoinSeat
  useEffect(() => subscribeCollab([discussionKey(officeId, designId, roomId)], refresh), [officeId, designId, roomId])
  useEffect(() => {
    if (!joinOnOpen) return
    const current = activeSession(loadDiscussion(officeId, designId, roomId))
    if (!current || current.participants.some(person => person.id === userId)) return
    const seated = joinSeatRef.current()
    const next = loadDiscussion(officeId, designId, roomId)
    const session = activeSession(next)
    if (!session || session.participants.some(person => person.id === userId)) return
    setDoc(saveDiscussion(officeId, designId, roomId, {
      ...next,
      sessions: next.sessions.map(item => item.id === session.id
        ? { ...item, participants: [...item.participants, { id: userId, name: userName, seated }] }
        : item),
    }))
  }, [joinOnOpen, officeId, designId, roomId, userId, userName])
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const live = activeSession(doc)
  useEffect(() => {
    if (!live) return
    const tick = () => {
      const ms = Math.max(0, new Date(live.endsAt).getTime() - Date.now())
      const m = Math.floor(ms / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      setClock(`${m}:${s.toString().padStart(2, '0')}`)
      if (ms === 0) refresh()
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [live?.id, live?.endsAt])

  const save = (next: DiscussionDoc) => setDoc(saveDiscussion(officeId, designId, roomId, next))

  const propose = () => {
    const trimmed = title.trim()
    if (!trimmed) return
    const stamp = new Date().toISOString()
    const topic: DiscussionTopic = {
      id: `topic_${Date.now()}`,
      officeId, roomId, authorId: userId, authorName: userName,
      title: trimmed.slice(0, 120),
      description: description.trim().slice(0, 500),
      category, status: 'proposed', createdAt: stamp, votes: {},
    }
    save({ ...doc, topics: [topic, ...doc.topics] })
    setTitle('')
    setDescription('')
  }

  const vote = (topicId: string, value: -1 | 1) => {
    save({
      ...doc,
      topics: doc.topics.map(topic => topic.id === topicId ? castVote(topic, userId, value) : topic),
    })
  }

  const addComment = (topicId: string) => {
    const content = comment.trim()
    if (!content) return
    const stamp = new Date().toISOString()
    save({
      ...doc,
      comments: [...doc.comments, {
        id: `c_${Date.now()}`, topicId, authorId: userId, authorName: userName,
        content: content.slice(0, 500), createdAt: stamp, updatedAt: stamp,
      }],
    })
    setComment('')
  }

  const start = (topic: DiscussionTopic) => {
    if (live) return
    const startedAt = new Date()
    const endsAt = new Date(startedAt.getTime() + duration * 60 * 1000).toISOString()
    const seated = onJoinSeat()
    save({
      ...doc,
      topics: doc.topics.map(item => item.id === topic.id ? { ...item, status: 'active' } : item),
      sessions: [...doc.sessions, {
        id: `session_${Date.now()}`,
        topicId: topic.id,
        officeId,
        roomId,
        hostId: userId,
        hostName: userName,
        title: topic.title,
        startedAt: startedAt.toISOString(),
        endsAt,
        status: 'live',
        participants: [{ id: userId, name: userName, seated }],
        anchor,
      }],
    })
    setTab('live')
  }

  const join = () => {
    if (!live || live.participants.some(person => person.id === userId)) return
    const seated = onJoinSeat()
    save({
      ...doc,
      sessions: doc.sessions.map(session => session.id === live.id
        ? { ...session, participants: [...session.participants, { id: userId, name: userName, seated }] }
        : session),
    })
  }

  const leave = () => {
    if (!live) return
    onLeaveSeat()
    const participants = live.participants.filter(person => person.id !== userId)
    save({
      ...doc,
      sessions: doc.sessions.map(session => session.id === live.id ? { ...session, participants } : session),
    })
  }

  const end = () => {
    if (!live) return
    if (live.hostId !== userId && !canModerate) return
    const ended = {
      ...live,
      status: 'completed' as const,
      endedAt: new Date().toISOString(),
      summary: outcome.summary.trim(),
      keyPoints: outcome.keyPoints.trim(),
      decision: outcome.decision.trim(),
      followUps: outcome.followUps.trim(),
    }
    save({
      ...doc,
      topics: doc.topics.map(topic => topic.id === live.topicId ? { ...topic, status: 'completed' } : topic),
      sessions: doc.sessions.map(session => session.id === live.id ? ended : session),
    })
    if (pin && outcome.summary.trim()) {
      const stamp = new Date().toISOString()
      const board = loadBoard(officeId, designId, roomId)
      saveBoard(officeId, designId, roomId, {
        ...board,
        items: [...board.items, {
          id: `summary_${ended.id}`,
          type: 'note',
          color: 'sage',
          text: `${ended.title}\n\n${outcome.summary.trim()}`,
          x: 80,
          y: 280,
          w: 220,
          h: 180,
          authorId: userId,
          authorName: userName,
          createdAt: stamp,
          updatedAt: stamp,
        }],
      })
    }
    onLeaveSeat()
    setOutcome({ summary: '', keyPoints: '', decision: '', followUps: '' })
    setTab('history')
  }

  const commentCount = (topicId: string) => doc.comments.filter(entry => entry.topicId === topicId && !entry.deleted).length
  const topics = [...doc.topics].sort((a, b) => {
    if (sort === 'newest') return b.createdAt.localeCompare(a.createdAt)
    if (sort === 'discussed') return commentCount(b.id) - commentCount(a.id)
    return voteCounts(b).score - voteCounts(a).score
  })
  const joined = live?.participants.some(person => person.id === userId) ?? false
  const canEnd = !!live && (live.hostId === userId || canModerate)

  return (
    <div className="absolute inset-x-0 bottom-0 top-12 z-50 flex items-start justify-center p-4" style={{ background: 'rgba(48,53,47,0.45)' }} onClick={onClose}>
      <div className="flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-2xl" onClick={e => e.stopPropagation()}>
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <div>
            <h2 className="text-[16px] font-semibold text-ink">Meeting room</h2>
            <p className="text-[12px] text-ink-3">Topics, a live discussion, and what you decided</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close meeting room" className="rounded-md p-1 text-ink-3 hover:bg-muted hover:text-ink">
            <X size={16} />
          </button>
        </header>
        <div className="flex border-b border-border">
          {(['topics', 'live', 'history'] as Tab[]).map(id => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`flex-1 py-2 text-[12px] font-medium uppercase tracking-wide ${tab === id ? 'border-b-2 border-olive text-ink' : 'text-ink-3'}`}
            >
              {id === 'topics' ? 'Topics' : id === 'live' ? 'Live discussion' : 'History'}
            </button>
          ))}
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {tab === 'topics' && (
            <>
              <div className="space-y-2 rounded-lg border border-border bg-canvas p-3">
                <input value={title} onChange={e => setTitle(e.target.value)} placeholder="What should we talk about?" maxLength={120} className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-[13px] text-ink" />
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Optional description" maxLength={500} rows={2} className="w-full rounded-md border border-border bg-surface px-2 py-1.5 text-[13px] text-ink" />
                <div className="flex flex-wrap gap-1">
                  {CATEGORIES.map(item => (
                    <button key={item.id} type="button" onClick={() => setCategory(item.id)} className={`rounded-full border px-2 py-0.5 text-[11px] ${category === item.id ? 'border-olive bg-olive-soft text-olive' : 'border-border text-ink-2'}`}>{item.label}</button>
                  ))}
                </div>
                <button type="button" onClick={propose} disabled={!title.trim()} className="rounded-md border border-olive/40 bg-olive-soft px-3 py-1.5 text-[12px] font-medium text-olive disabled:opacity-40">Propose topic</button>
              </div>
              <div className="flex gap-2 text-[12px] text-ink-2">
                {(['popular', 'newest', 'discussed'] as Sort[]).map(id => (
                  <button key={id} type="button" onClick={() => setSort(id)} className={sort === id ? 'text-ink font-medium' : ''}>
                    {id === 'popular' ? 'Most popular' : id === 'newest' ? 'Newest' : 'Most discussed'}
                  </button>
                ))}
              </div>
              {topics.length === 0 && <p className="text-[13px] text-ink-3">No topics yet.</p>}
              {topics.map(topic => {
                const counts = voteCounts(topic)
                const mine = topic.votes[userId] ?? 0
                const notes = doc.comments.filter(entry => entry.topicId === topic.id && !entry.deleted)
                return (
                  <article key={topic.id} className="rounded-lg border border-border p-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[14px] font-medium text-ink">{topic.title}</p>
                        {topic.description && <p className="mt-1 text-[12px] text-ink-2">{topic.description}</p>}
                        <p className="mt-1 text-[11px] text-ink-3">{topic.authorName} · {CATEGORIES.find(c => c.id === topic.category)?.label} · {topic.status}</p>
                      </div>
                      <div className="flex flex-col items-center gap-1">
                        <button type="button" aria-pressed={mine === 1} onClick={() => vote(topic.id, 1)} className={`rounded px-2 text-[12px] ${mine === 1 ? 'bg-olive-soft text-olive' : 'text-ink-2'}`}>▲ {counts.up}</button>
                        <span className="text-[12px] font-semibold text-ink">{counts.score}</span>
                        <button type="button" aria-pressed={mine === -1} onClick={() => vote(topic.id, -1)} className={`rounded px-2 text-[12px] ${mine === -1 ? 'bg-olive-soft text-olive' : 'text-ink-2'}`}>▼ {counts.down}</button>
                      </div>
                    </div>
                    <button type="button" className="mt-2 text-[12px] text-ink-2" onClick={() => setOpenTopic(openTopic === topic.id ? null : topic.id)}>
                      {notes.length} comments
                    </button>
                    {openTopic === topic.id && (
                      <div className="mt-2 space-y-2">
                        {notes.map(entry => (
                          <div key={entry.id} className="rounded-md bg-canvas px-2 py-1.5">
                            {editingComment === entry.id ? (
                              <form className="flex gap-2" onSubmit={e => {
                                e.preventDefault()
                                const content = commentDraft.trim().slice(0, 500)
                                if (!content) return
                                save({ ...doc, comments: doc.comments.map(item => item.id === entry.id ? { ...item, content, updatedAt: new Date().toISOString() } : item) })
                                setEditingComment(null)
                              }}>
                                <input value={commentDraft} onChange={e => setCommentDraft(e.target.value)} className="flex-1 rounded-md border border-border bg-surface px-2 py-1 text-[12px] text-ink" />
                                <button type="submit" className="text-[12px] text-ink">Save</button>
                              </form>
                            ) : (
                              <p className="text-[12px] text-ink">{entry.content}</p>
                            )}
                            <p className="text-[10px] text-ink-3">{entry.authorName} · {new Date(entry.createdAt).toLocaleString()}</p>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {['👍', '❤️'].map(emoji => (
                                <button
                                  key={emoji}
                                  type="button"
                                  className="text-[11px] text-ink-2"
                                  onClick={() => {
                                    const list = entry.reactions?.[emoji] ?? []
                                    const next = list.includes(userId) ? list.filter(id => id !== userId) : [...list, userId]
                                    save({ ...doc, comments: doc.comments.map(item => item.id === entry.id ? { ...item, reactions: { ...item.reactions, [emoji]: next } } : item) })
                                  }}
                                >
                                  {emoji} {entry.reactions?.[emoji]?.length || ''}
                                </button>
                              ))}
                              {entry.authorId === userId && editingComment !== entry.id && (
                                <button type="button" className="text-[11px] text-ink-3" onClick={() => { setEditingComment(entry.id); setCommentDraft(entry.content) }}>Edit</button>
                              )}
                              {(entry.authorId === userId || canModerate) && (
                                <button
                                  type="button"
                                  className="text-[11px] text-ink-3"
                                  onClick={() => save({ ...doc, comments: doc.comments.map(item => item.id === entry.id ? { ...item, deleted: true, updatedAt: new Date().toISOString() } : item) })}
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        <form className="flex gap-2" onSubmit={e => { e.preventDefault(); addComment(topic.id) }}>
                          <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment" className="flex-1 rounded-md border border-border bg-canvas px-2 py-1 text-[12px] text-ink" />
                          <button type="submit" className="text-[12px] text-ink">Post</button>
                        </form>
                      </div>
                    )}
                    {topic.status !== 'completed' && !live && (
                      <div className="mt-2 flex flex-wrap items-center gap-1">
                        {DURATIONS.map(mins => (
                          <button key={mins} type="button" onClick={() => setDuration(mins)} className={`rounded border px-2 py-0.5 text-[11px] ${duration === mins ? 'border-olive bg-olive-soft text-olive' : 'border-border text-ink-2'}`}>{mins}m</button>
                        ))}
                        <button type="button" onClick={() => start(topic)} className="rounded-md border border-olive/40 bg-olive-soft px-2 py-1 text-[12px] text-olive">Start discussion</button>
                      </div>
                    )}
                  </article>
                )
              })}
            </>
          )}
          {tab === 'live' && (
            live ? (
              <div className="space-y-3">
                <div className="rounded-lg border border-olive/30 bg-olive-soft p-3">
                  <p className="text-[12px] text-olive">Current discussion</p>
                  <p className="text-[16px] font-semibold text-ink">{live.title}</p>
                  <p className="mt-1 font-mono text-[14px] text-ink">{clock}</p>
                </div>
                <p className="text-[12px] text-ink-2">{live.participants.length} participating · hosted by {live.hostName}</p>
                <div className="flex flex-wrap gap-1.5">
                  {live.participants.map(person => (
                    <span key={person.id} className="rounded-full border border-border bg-canvas px-2 py-0.5 text-[11px] text-ink-2">
                      {person.name}{person.seated ? ' · seated' : ''}
                    </span>
                  ))}
                </div>
                {joined ? (
                  <button type="button" onClick={leave} className="rounded-md border border-border px-3 py-1.5 text-[12px] text-ink-2">Leave discussion</button>
                ) : (
                  <button type="button" onClick={join} className="rounded-md border border-olive/40 bg-olive-soft px-3 py-1.5 text-[12px] text-olive">Join discussion</button>
                )}
                {canEnd && (
                  <div className="space-y-2 border-t border-border pt-3">
                    <p className="text-[12px] font-medium text-ink">End and record the outcome</p>
                    <input value={outcome.summary} onChange={e => setOutcome(prev => ({ ...prev, summary: e.target.value }))} placeholder="Summary" className="w-full rounded-md border border-border px-2 py-1.5 text-[13px]" />
                    <input value={outcome.keyPoints} onChange={e => setOutcome(prev => ({ ...prev, keyPoints: e.target.value }))} placeholder="Key points" className="w-full rounded-md border border-border px-2 py-1.5 text-[13px]" />
                    <input value={outcome.decision} onChange={e => setOutcome(prev => ({ ...prev, decision: e.target.value }))} placeholder="Decision" className="w-full rounded-md border border-border px-2 py-1.5 text-[13px]" />
                    <input value={outcome.followUps} onChange={e => setOutcome(prev => ({ ...prev, followUps: e.target.value }))} placeholder="Follow-up actions" className="w-full rounded-md border border-border px-2 py-1.5 text-[13px]" />
                    <label className="flex items-center gap-2 text-[12px] text-ink">
                      <input type="checkbox" checked={pin} onChange={e => setPin(e.target.checked)} />
                      Pin the summary on the room board
                    </label>
                    <button type="button" onClick={end} className="rounded-md border border-border px-3 py-1.5 text-[12px] text-ink">End discussion</button>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[13px] text-ink-2">Nothing is live. Propose a topic, then start a discussion.</p>
            )
          )}
          {tab === 'history' && (
            <div className="space-y-3">
              {doc.sessions.filter(session => session.status === 'completed').length === 0 && (
                <p className="text-[13px] text-ink-3">Completed discussions will stay here.</p>
              )}
              {doc.sessions.filter(session => session.status === 'completed').map(session => (
                <article key={session.id} className="rounded-lg border border-border p-3">
                  <p className="text-[14px] font-medium text-ink">{session.title}</p>
                  <p className="text-[11px] text-ink-3">{session.endedAt ? new Date(session.endedAt).toLocaleString() : ''}</p>
                  {session.summary && <p className="mt-2 text-[13px] text-ink">{session.summary}</p>}
                  {session.decision && <p className="mt-1 text-[12px] text-ink-2">Decision · {session.decision}</p>}
                  {session.followUps && <p className="mt-1 text-[12px] text-ink-2">Follow up · {session.followUps}</p>}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
