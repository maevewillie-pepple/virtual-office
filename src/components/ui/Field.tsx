import type { InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from 'react'

const control =
  'w-full rounded-[10px] border border-border bg-canvas px-3 text-[16px] text-ink placeholder:text-ink-3 ' +
  'focus:border-olive focus:outline-none focus:ring-2 focus:ring-olive/30 disabled:cursor-not-allowed disabled:bg-muted disabled:text-ink-2'

export function Field({
  label, hint, error, children, htmlFor,
}: {
  label: string
  hint?: string
  error?: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-[14px] font-medium text-ink">{label}</label>
      <div className="mt-1.5">{children}</div>
      {error ? <p className="mt-1.5 text-[14px] text-error" role="alert">{error}</p> : hint ? <p className="mt-1.5 text-[14px] text-ink-2">{hint}</p> : null}
    </div>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${control} h-11 ${props.className ?? ''}`} />
}

export function TextArea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${control} min-h-24 py-2 ${props.className ?? ''}`} />
}
