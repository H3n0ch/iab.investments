'use client'

import { openInquiry, type InquiryPrefill } from '@/components/InquiryModal'
import { track } from '@/lib/track'

/** One line of trust right at the button – the same everywhere */
export function TrustLine({ dark = false }: { dark?: boolean }) {
  return (
    <p className={`text-xs ${dark ? 'text-slate-300' : 'text-slate-500'}`}>
      Kostenlos · kein Passwort · persönlicher Rückruf
    </p>
  )
}

/** The one primary action of every page: opens the inquiry modal, pre-filled with what the page already knows */
export function CtaButton({
  prefill,
  label = 'Unterlagen & Kalkulation anfordern',
  where,
  className = '',
}: {
  prefill?: InquiryPrefill
  label?: string
  /** Position on the page, for the funnel analysis */
  where: string
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={() => {
        track('CTA geklickt', { wo: where })
        openInquiry(prefill)
      }}
      className={`rounded-xl bg-emerald-600 px-5 py-3 text-base font-bold text-white shadow-lg shadow-emerald-900/20 transition-colors hover:bg-emerald-500 ${className}`}
    >
      {label} →
    </button>
  )
}

/** CTA card between content sections */
export function CtaCard({ title, text, prefill, where }: { title: string; text?: string; prefill?: InquiryPrefill; where: string }) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <p className="text-lg font-bold text-slate-900">{title}</p>
        {text && <p className="mt-1 text-sm text-slate-600">{text}</p>}
        <div className="mt-2">
          <TrustLine />
        </div>
      </div>
      <CtaButton prefill={prefill} where={where} className="shrink-0" />
    </div>
  )
}
