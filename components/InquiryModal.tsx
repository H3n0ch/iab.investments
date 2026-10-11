'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { CATEGORIES } from '@/lib/categories'
import { track } from '@/lib/track'
import { LeadForm, type LeadFormProps } from './LeadForm'

/** Values a CTA already knows (e.g. from a calculator) – the form skips these steps */
export type InquiryPrefill = { iabAmount?: number; year?: number; categories?: string[] }

const OPEN_EVENT = 'iab:open-inquiry'
const GLOBAL_EVENT = 'iab:open-inquiry-global'

/** Jakub Żerdzicki, Unsplash License – https://unsplash.com/photos/8wLZi9OhsWU */
const INQUIRY_IMAGE = { src: '/images/anfrage.jpg', position: 'center 72%' }

/** Opens the page's inquiry modal from any client component, optionally pre-filled */
export function openInquiry(prefill: InquiryPrefill = {}) {
  window.dispatchEvent(new CustomEvent<InquiryPrefill>(OPEN_EVENT, { detail: prefill }))
}

/**
 * Header CTA: opens the page's own inquiry modal if there is one (project page, guide pilot), otherwise the
 * site-wide one from the layout.
 */
export function openInquiryAnywhere() {
  if (document.querySelector('dialog[data-inquiry="page"]')) openInquiry()
  else window.dispatchEvent(new CustomEvent<InquiryPrefill>(GLOBAL_EVENT, { detail: {} }))
}

/**
 * The inquiry form as a modal. Opened by every link to `#anfrage` on the page (sidebar button, locked values,
 * sticky CTA), by a URL ending in #anfrage, and by `openInquiry()` – the latter can pass values so the wizard
 * starts further along. Nothing is saved before the visitor submits, so the modal simply closes.
 */
export function InquiryModal({ title, form, global = false }: { title: string; form: LeadFormProps; global?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null)
  const [prefill, setPrefill] = useState<InquiryPrefill>({})

  useEffect(() => {
    const open = (p?: InquiryPrefill) => {
      if (p) setPrefill(p)
      if (ref.current?.open) return
      ref.current?.showModal()
      track('Formular geöffnet', p?.iabAmount ? { vorbelegt: 'ja' } : undefined)
    }
    const onClick = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest('a[href="#anfrage"]')) return
      e.preventDefault()
      open()
    }
    const onOpen = (e: Event) => open((e as CustomEvent<InquiryPrefill>).detail)
    // The site-wide modal only answers the header CTA – #anfrage links belong to the page (inline forms, own modal)
    if (global) {
      window.addEventListener(GLOBAL_EVENT, onOpen)
      return () => window.removeEventListener(GLOBAL_EVENT, onOpen)
    }
    document.addEventListener('click', onClick)
    window.addEventListener(OPEN_EVENT, onOpen)
    if (window.location.hash === '#anfrage') open()
    return () => {
      document.removeEventListener('click', onClick)
      window.removeEventListener(OPEN_EVENT, onOpen)
    }
  }, [global])

  const close = () => ref.current?.close()

  const iabAmount = prefill.iabAmount ?? form.iabAmount
  const year = prefill.year ?? form.year
  // Header photo: the category in question (project, pre-selection), otherwise documents on a desk
  const slug = prefill.categories?.[0] ?? form.offer?.categorySlug ?? form.preselected[0]
  const image = CATEGORIES.find((c) => c.slug === slug)?.image ?? INQUIRY_IMAGE

  return (
    <dialog
      ref={ref}
      // Same id as the inline forms elsewhere: the sticky CTA finds it and links here
      id={global ? 'anfrage-global' : 'anfrage'}
      data-inquiry={global ? 'global' : 'page'}
      aria-labelledby={global ? 'anfrage-global-title' : 'anfrage-title'}
      // Click on the backdrop closes the modal (Esc closes it natively)
      onClick={(e) => e.target === e.currentTarget && close()}
      className="fixed inset-x-0 bottom-0 top-auto m-0 h-fit max-h-[100dvh] w-full max-w-full overflow-y-auto rounded-t-2xl bg-white p-0 shadow-2xl backdrop:bg-slate-900/60 sm:inset-0 sm:m-auto sm:max-h-[96dvh] sm:max-w-lg sm:rounded-2xl"
    >
      {/* Header in the hero style of the pages: navy, photo on the right half fading into it */}
      <div className="relative overflow-hidden bg-hero px-4 py-5 sm:px-6 sm:py-7">
        {image && (
          <div aria-hidden className="absolute inset-y-0 right-0 left-0 sm:left-1/2">
            <Image src={image.src} alt="" fill sizes="(min-width: 640px) 256px, 100vw" className="object-cover" style={{ objectPosition: image.position }} />
            <div className="absolute inset-0 bg-hero/85 sm:bg-transparent sm:bg-linear-to-r sm:from-hero sm:via-hero/50 sm:to-hero/10" />
          </div>
        )}
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <p id={global ? 'anfrage-global-title' : 'anfrage-title'} className="text-lg font-bold text-white">{title}</p>
            <p className="mt-0.5 text-xs text-slate-300">✓ Kalkulation · ✓ Unterlagen · ✓ persönliche Vorstellung beim Anbieter</p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Schließen"
            className="-mr-1 -mt-1 rounded-lg bg-hero/40 p-1.5 text-xl leading-none text-white/80 hover:bg-white/15 hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      <div className="p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6 sm:pt-4">
        {/* New pre-fill → fresh form with those answers filled in */}
        <LeadForm
          key={JSON.stringify(prefill)}
          {...form}
          iabAmount={iabAmount}
          year={iabAmount ? year : undefined}
          preselected={prefill.categories ?? form.preselected}
        />
      </div>
    </dialog>
  )
}
