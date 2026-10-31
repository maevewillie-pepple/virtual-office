import { useRef, type KeyboardEvent } from 'react'

export interface TabItem<T extends string> {
  id: T
  label: string
}

export default function Tabs<T extends string>({
  label, value, onChange, tabs,
}: {
  label: string
  value: T
  onChange: (id: T) => void
  tabs: TabItem<T>[]
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const move = (event: KeyboardEvent, index: number) => {
    const direction = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1
      : event.key === 'Home' ? -index
      : event.key === 'End' ? tabs.length - 1 - index
      : 0
    if (!direction && event.key !== 'Home' && event.key !== 'End') return
    event.preventDefault()
    const next = (index + direction + tabs.length) % tabs.length
    onChange(tabs[next].id)
    refs.current[next]?.focus()
  }

  return (
    <div role="tablist" aria-label={label} className="flex gap-1 border-b border-border">
      {tabs.map((tab, index) => {
        const selected = tab.id === value
        return (
          <button
            key={tab.id}
            ref={element => { refs.current[index] = element }}
            role="tab"
            type="button"
            id={`tab-${tab.id}`}
            aria-selected={selected}
            aria-controls={`panel-${tab.id}`}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={event => move(event, index)}
            className={`-mb-px border-b-2 px-3 py-2.5 text-[15px] font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-focus ${selected ? 'border-olive text-ink' : 'border-transparent text-ink-2 hover:text-ink'}`}
          >
            {tab.label}
          </button>
        )
      })}
    </div>
  )
}
