import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  TASK_COLUMNS, loadTasks, saveTasks, subscribeTasks,
  type TaskCard, type TaskColumn,
} from '../../collaboration/tasks'

interface TaskBoardProps {
  officeId: string
  userId: string
  userName: string
  canModerate: boolean
  onClose: () => void
}

export default function TaskBoard({ officeId, userId, userName, canModerate, onClose }: TaskBoardProps) {
  const [cards, setCards] = useState<TaskCard[]>(() => loadTasks(officeId))
  const [drafts, setDrafts] = useState<Record<TaskColumn, string>>({ todo: '', doing: '', done: '' })
  const [openId, setOpenId] = useState<string | null>(null)
  const [dragId, setDragId] = useState<string | null>(null)

  useEffect(() => subscribeTasks(officeId, () => setCards(loadTasks(officeId))), [officeId])
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const commit = (next: TaskCard[]) => setCards(saveTasks(officeId, next))

  const add = (column: TaskColumn) => {
    const title = drafts[column].trim().slice(0, 80)
    if (!title) return
    const stamp = new Date().toISOString()
    const card: TaskCard = {
      id: `task_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      column,
      title,
      detail: '',
      authorId: userId,
      authorName: userName,
      createdAt: stamp,
      updatedAt: stamp,
      order: Date.now(),
    }
    commit([card, ...cards])
    setDrafts(prev => ({ ...prev, [column]: '' }))
  }

  const move = (id: string, column: TaskColumn) => {
    commit(cards.map(card => card.id === id ? { ...card, column, order: Date.now(), updatedAt: new Date().toISOString() } : card))
  }

  const patch = (id: string, changes: Partial<Pick<TaskCard, 'title' | 'detail'>>) => {
    commit(cards.map(card => card.id === id ? { ...card, ...changes, updatedAt: new Date().toISOString() } : card))
  }

  const remove = (id: string) => {
    commit(cards.filter(card => card.id !== id))
    if (openId === id) setOpenId(null)
  }

  return (
    <div className="absolute inset-x-0 bottom-0 top-12 z-50 flex items-start justify-center p-3 md:p-4" style={{ background: 'rgba(48,53,47,0.45)' }} onClick={onClose}>
      <div
        className="flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-xl border border-border bg-canvas shadow-2xl"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-label="Task board"
      >
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-3">
          <div>
            <h2 className="text-[16px] font-semibold text-ink">Task board</h2>
            <p className="text-[12px] text-ink-3">Shared with this office, on this computer.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close task board" className="rounded-md p-1 text-ink-3 hover:bg-muted hover:text-ink">
            <X size={16} />
          </button>
        </header>
        <div className="grid min-h-0 flex-1 gap-3 overflow-auto p-3 md:grid-cols-3">
          {TASK_COLUMNS.map(column => {
            const list = cards.filter(card => card.column === column.id)
            return (
              <section
                key={column.id}
                className={`flex min-h-[220px] flex-col rounded-lg border bg-surface ${dragId ? 'border-olive/40' : 'border-border'}`}
                onDragOver={event => event.preventDefault()}
                onDrop={event => {
                  event.preventDefault()
                  const id = event.dataTransfer.getData('text/plain') || dragId
                  if (id) move(id, column.id)
                  setDragId(null)
                }}
              >
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <h3 className="font-mono text-[11px] font-bold uppercase tracking-wide text-ink">{column.label}</h3>
                  <span className="text-[11px] text-ink-3">{list.length}</span>
                </div>
                <ul className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-2">
                  {list.length === 0 && <li className="px-1 py-3 text-[12px] text-ink-3">Nothing here</li>}
                  {list.map(card => {
                    const mine = card.authorId === userId || canModerate
                    const open = openId === card.id
                    return (
                      <li key={card.id}>
                        <article
                          draggable
                          onDragStart={event => {
                            event.dataTransfer.setData('text/plain', card.id)
                            event.dataTransfer.effectAllowed = 'move'
                            setDragId(card.id)
                          }}
                          onDragEnd={() => setDragId(null)}
                          className="cursor-grab rounded-md border border-border bg-canvas p-2 active:cursor-grabbing"
                        >
                          <button
                            type="button"
                            className="w-full text-left text-[13px] font-medium text-ink"
                            onClick={() => setOpenId(open ? null : card.id)}
                          >
                            {card.title}
                          </button>
                          {card.detail && !open && <p className="mt-1 text-[12px] leading-5 text-ink-2">{card.detail}</p>}
                          <p className="mt-1 text-[11px] text-ink-3">{card.authorName}</p>
                          <div className="mt-2 flex flex-wrap gap-1">
                            {TASK_COLUMNS.map(target => (
                              <button
                                key={target.id}
                                type="button"
                                disabled={target.id === card.column}
                                onClick={() => move(card.id, target.id)}
                                className={`rounded border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${target.id === card.column ? 'border-olive bg-olive-soft text-olive' : 'border-border text-ink-3 hover:text-ink'}`}
                              >
                                {target.label}
                              </button>
                            ))}
                          </div>
                          {open && (
                            <form
                              className="mt-2 space-y-2"
                              onSubmit={event => {
                                event.preventDefault()
                                const data = new FormData(event.currentTarget)
                                const title = String(data.get('title') ?? '').trim().slice(0, 80)
                                if (!title) return
                                patch(card.id, { title, detail: String(data.get('detail') ?? '').trim().slice(0, 240) })
                                setOpenId(null)
                              }}
                            >
                              <input name="title" defaultValue={card.title} maxLength={80} className="w-full rounded-md border border-border bg-surface px-2 py-1 text-[13px] text-ink" />
                              <textarea name="detail" defaultValue={card.detail} maxLength={240} rows={2} placeholder="Note" className="w-full resize-none rounded-md border border-border bg-surface px-2 py-1 text-[12px] text-ink" />
                              <div className="flex gap-2">
                                <button type="submit" className="text-[12px] font-medium text-olive">Save</button>
                                {mine && (
                                  <button type="button" className="text-[12px] text-error" onClick={() => remove(card.id)}>Remove</button>
                                )}
                              </div>
                            </form>
                          )}
                        </article>
                      </li>
                    )
                  })}
                </ul>
                <form
                  className="flex gap-1 border-t border-border p-2"
                  onSubmit={event => { event.preventDefault(); add(column.id) }}
                >
                  <input
                    value={drafts[column.id]}
                    onChange={event => setDrafts(prev => ({ ...prev, [column.id]: event.target.value }))}
                    placeholder="Add a task"
                    maxLength={80}
                    aria-label={`Add a task to ${column.label}`}
                    className="min-w-0 flex-1 rounded-md border border-border bg-canvas px-2 py-1 text-[12px] text-ink placeholder:text-ink-3"
                  />
                  <button type="submit" className="rounded-md border border-olive/40 bg-olive-soft px-2 text-[12px] font-medium text-olive">Add</button>
                </form>
              </section>
            )
          })}
        </div>
      </div>
    </div>
  )
}
