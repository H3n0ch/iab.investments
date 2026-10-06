'use client'

import { useRef, useState } from 'react'
import { COUNTRIES } from '@/lib/countries'
import { Flag } from './Flag'
import { useDismiss } from './useDismiss'

type Props = {
  value: string
  onChange: (code: string) => void
  /** Offer an "Alle Länder" option (value '') */
  allowAll?: boolean
  className?: string
  buttonClassName?: string
}

/** Country dropdown with flags – a custom listbox because native <option>s can't show images */
export function CountrySelect({ value, onChange, allowAll = true, className = '', buttonClassName = '' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useDismiss(ref, open, () => setOpen(false))

  const current = COUNTRIES.find((c) => c.code === value)
  const options = [...(allowAll ? [{ code: '', name: 'Alle Länder' }] : []), ...COUNTRIES]

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center gap-2 text-left text-sm text-slate-900 ${buttonClassName}`}
      >
        {current && <Flag code={current.code} />}
        <span className="flex-1 truncate">{current?.name ?? 'Alle Länder'}</span>
        <span className="text-xs text-slate-400">▾</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1 max-h-72 min-w-48 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
        >
          {options.map((c) => (
            <li key={c.code || 'all'}>
              <button
                type="button"
                role="option"
                aria-selected={c.code === value}
                onClick={() => {
                  onChange(c.code)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                  c.code === value ? 'font-semibold text-slate-900' : 'text-slate-700'
                }`}
              >
                {c.code && <Flag code={c.code} />}
                {c.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
