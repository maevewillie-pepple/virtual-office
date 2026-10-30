import React, { useEffect, useState } from 'react'
import { X, BookOpen, ArrowLeft } from 'lucide-react'

interface Book {
  id: string
  title: string
  author: string
  year: number
  quote: string
}

const BOOKS: Book[] = [
  {
    id: 'b1',
    title: 'Meditations',
    author: 'Marcus Aurelius',
    year: 180,
    quote: 'You have power over your mind — not outside events. Realize this, and you will find strength.',
  },
  {
    id: 'b2',
    title: 'The Republic',
    author: 'Plato',
    year: -380,
    quote: 'The measure of a man is what he does with power.',
  },
  {
    id: 'b3',
    title: 'Thus Spoke Zarathustra',
    author: 'Friedrich Nietzsche',
    year: 1883,
    quote: 'One must have chaos within oneself, to give birth to a dancing star.',
  },
  {
    id: 'b4',
    title: 'Walden',
    author: 'Henry David Thoreau',
    year: 1854,
    quote: 'Go confidently in the direction of your dreams. Live the life you have imagined.',
  },
  {
    id: 'b5',
    title: 'The Art of War',
    author: 'Sun Tzu',
    year: -500,
    quote: 'Opportunities multiply as they are seized.',
  },
  {
    id: 'b6',
    title: 'Hamlet',
    author: 'William Shakespeare',
    year: 1603,
    quote: 'To thine own self be true.',
  },
  {
    id: 'b7',
    title: 'Jane Eyre',
    author: 'Charlotte Brontë',
    year: 1847,
    quote: 'I am no bird; and no net ensnares me. I am a free human being with an independent will.',
  },
  {
    id: 'b8',
    title: 'Frankenstein',
    author: 'Mary Shelley',
    year: 1818,
    quote: 'Nothing is so painful to the human mind as a great and sudden change.',
  },
  {
    id: 'b9',
    title: 'On the Origin of Species',
    author: 'Charles Darwin',
    year: 1859,
    quote: 'It is not the strongest of the species that survives, but the one most responsive to change.',
  },
  {
    id: 'b10',
    title: 'The Prince',
    author: 'Niccolò Machiavelli',
    year: 1532,
    quote: 'The lion cannot protect himself from traps, and the fox cannot defend himself from wolves.',
  },
  {
    id: 'b11',
    title: 'Pride and Prejudice',
    author: 'Jane Austen',
    year: 1813,
    quote: 'I declare after all there is no enjoyment like reading!',
  },
  {
    id: 'b12',
    title: 'Don Quixote',
    author: 'Miguel de Cervantes',
    year: 1605,
    quote: 'The pen is the tongue of the mind.',
  },
]

interface BookshelfPanelProps {
  isOpen: boolean
  shelfLabel: string
  carriedBook: boolean
  onPickUp: (book: Book) => void
  onReturn: () => void
  onClose: () => void
}

export default function BookshelfPanel({
  isOpen, shelfLabel, carriedBook, onPickUp, onReturn, onClose,
}: BookshelfPanelProps) {
  const [selected, setSelected] = useState<Book | null>(null)

  useEffect(() => {
    if (!isOpen) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(48,53,47,0.5)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-xl border border-border bg-surface shadow-2xl fade-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border">
          <div className="flex items-center gap-2">
            {selected && (
              <button
                onClick={() => setSelected(null)}
                className="p-1 rounded hover:bg-muted text-ink-3 hover:text-ink transition-colors"
              >
                <ArrowLeft size={14} />
              </button>
            )}
            <div>
              <h2 className="type-h3 text-ink">{selected ? selected.title : shelfLabel}</h2>
              {!selected && <p className="type-small text-ink-3 mt-0.5">Browse the collection</p>}
              {selected && <p className="type-small text-ink-3 mt-0.5">{selected.author} · {Math.abs(selected.year)}{selected.year < 0 ? ' BC' : ''}</p>}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted text-ink-3 hover:text-ink transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {selected ? (
          /* Book detail view */
          <div className="px-5 py-5">
            <div className="rounded-lg border border-border bg-canvas p-4 mb-4">
              <BookOpen size={18} className="text-ink-3 mb-2" />
              <blockquote className="type-body text-ink italic leading-relaxed">
                "{selected.quote}"
              </blockquote>
              <p className="type-small text-ink-3 mt-3">— {selected.author}</p>
            </div>
            {carriedBook ? (
              <button
                onClick={() => { onReturn(); onClose(); }}
                className="w-full py-2.5 rounded-lg border border-border bg-canvas text-[13px] font-medium text-ink
                  hover:bg-muted transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Return book to shelf
              </button>
            ) : (
              <button
                onClick={() => { onPickUp(selected); onClose(); }}
                className="w-full py-2.5 rounded-lg border border-olive/40 bg-olive-soft text-[13px] font-medium text-olive
                  hover:bg-olive/20 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
              >
                Pick up this book 📚
              </button>
            )}
          </div>
        ) : (
          /* Book list */
          <div className="px-3 py-3 max-h-72 overflow-y-auto">
            {carriedBook && (
              <div className="px-2 pb-2">
                <button
                  onClick={() => { onReturn(); onClose(); }}
                  className="w-full py-2 px-3 rounded-lg border border-border bg-canvas text-[12px] text-ink-2
                    hover:bg-muted transition-colors text-left"
                >
                  📚 Return book to shelf
                </button>
              </div>
            )}
            <div className="space-y-0.5">
              {BOOKS.map(book => (
                <button
                  key={book.id}
                  onClick={() => setSelected(book)}
                  className="w-full flex items-start gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors text-left
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-focus"
                >
                  <span className="text-[16px] mt-0.5">📖</span>
                  <div className="min-w-0">
                    <p className="type-small font-medium text-ink truncate">{book.title}</p>
                    <p className="text-[11px] text-ink-3">{book.author}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export type { Book }
