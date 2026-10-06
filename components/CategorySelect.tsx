'use client'

import { useRef, useState } from 'react'
import { CATEGORIES } from '@/lib/categories'
import { useDismiss } from './useDismiss'

type Props = {
  value: string
  onChange: (slug: string) => void
  className?: string
  buttonClassName?: string
}

/** Dropdown for exactly one investment good – the marketplace never mixes categories */
export function CategorySelect({ value, onChange, className = '', buttonClassName = '' }: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useDismiss(ref, open, () => setOpen(false))

  const current = CATEGORIES.find((c) => c.slug === value)

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex w-full items-center gap-2 text-left text-sm text-slate-900 ${buttonClassName}`}
      >
        <span className="flex-1 truncate">{current ? current.name : 'Investitionsgut wählen'}</span>
        <span className="text-xs text-slate-400">▾</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className="absolute left-0 z-30 mt-1 max-h-80 w-72 max-w-[calc(100vw-2rem)] overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-xl"
        >
          {CATEGORIES.map((c) => (
            <li key={c.slug}>
              <button
                type="button"
                role="option"
                aria-selected={c.slug === value}
                onClick={() => {
                  onChange(c.slug)
                  setOpen(false)
                }}
                className={`flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                  c.slug === value ? 'bg-emerald-50 font-semibold text-emerald-800' : 'text-slate-700'
                }`}
              >
                <span className="flex-1">{c.name}</span>
                {c.slug === value && <span aria-hidden>✓</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
