'use client'

import { openInquiry } from '@/components/InquiryModal'
import { track } from '@/lib/track'

/** „Details freischalten“ on a preview card: opens the inquiry modal with the project's category pre-selected */
export function UnlockButton({ categorySlug, offerTitle }: { categorySlug: string; offerTitle: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        track('Details freischalten', { projekt: offerTitle })
        openInquiry({ categories: [categorySlug] })
      }}
      className="w-full rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
    >
      🔒 Details freischalten
    </button>
  )
}
