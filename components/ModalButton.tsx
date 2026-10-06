'use client'

import type { ReactNode } from 'react'
import { openModal, type ModalKind, type OfferUnlock } from './SiteModal'

export function ModalButton({
  modal,
  offer,
  className,
  children,
}: {
  modal: ModalKind
  /** Register modal about this one offer (detail pages) */
  offer?: OfferUnlock
  className?: string
  children: ReactNode
}) {
  return (
    <button type="button" onClick={() => openModal(modal, offer)} className={className}>
      {children}
    </button>
  )
}
