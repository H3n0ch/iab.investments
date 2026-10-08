'use client'

import { useEffect, useRef, type ReactNode } from 'react'
import { track } from '@/lib/track'

/**
 * The inquiry form as a modal instead of a section below the content.
 * Every link to `#anfrage` on the page opens it (sidebar button, locked values, sticky CTA),
 * as does a URL ending in #anfrage.
 */
export function InquiryModal({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const open = () => {
      if (ref.current?.open) return
      ref.current?.showModal()
      track('Formular geöffnet')
    }
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest('a[href="#anfrage"]')) return
      e.preventDefault()
      open()
    }
    document.addEventListener('click', onClick)
    if (window.location.hash === '#anfrage') open()
    return () => document.removeEventListener('click', onClick)
  }, [])

  return (
    <dialog
      ref={ref}
      // Same id as the inline forms elsewhere: the sticky CTA finds it and links here
      id="anfrage"
      aria-labelledby="anfrage-title"
      // Click on the backdrop closes the modal
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[92dvh] w-full max-w-full overflow-y-auto rounded-t-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-900/60 sm:inset-0 sm:m-auto sm:h-fit sm:max-w-lg sm:rounded-2xl"
    >
      <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p id="anfrage-title" className="text-lg font-bold text-slate-900">{title}</p>
            {subtitle && <p className="mt-0.5 text-sm leading-relaxed text-slate-500">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={() => ref.current?.close()}
            aria-label="Schließen"
            className="-mr-1 -mt-1 rounded-lg p-1.5 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
