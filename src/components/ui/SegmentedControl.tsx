import { useRef, type KeyboardEvent } from 'react'

export default function SegmentedControl<T extends string>({
  label, value, onChange, options,
}: {
  label: string
  value: T
  onChange: (id: T) => void
  options: { id: T; label: string }[]
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const move = (event: KeyboardEvent, index: number) => {
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
    if (!direction) return
    event.preventDefault()
    const next = (index + direction + options.length) % options.length
    onChange(options[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-[10px] border border-border bg-muted p-1">
      {options.map((option, index) => {
        const selected = option.id === value
        return (
          <button
            key={option.id}
            ref={element => { refs.current[index] = element }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(option.id)}
            onKeyDown={event => move(event, index)}
            className={`h-9 rounded-[8px] px-3 text-[14px] font-medium capitalize focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${selected ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(48,53,47,0.08)]' : 'text-ink-2 hover:text-ink'}`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
