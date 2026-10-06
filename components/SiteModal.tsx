'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ContactForm } from './ContactForm'
import { RegisterForm } from './RegisterForm'

export type ModalKind = 'register' | 'contact'

/** Offer the visitor is about to unlock – makes the register modal about this one offer */
export type OfferUnlock = { title: string; image: string | null; price: string | null; locked: string[] }

type OpenDetail = { kind: ModalKind; offer?: OfferUnlock }

const OPEN_EVENT = 'iab:open-modal'

/** Opens the site-wide modal from anywhere (header, offer pages, floating button, guides) */
export function openModal(kind: ModalKind, offer?: OfferUnlock) {
  window.dispatchEvent(new CustomEvent<OpenDetail>(OPEN_EVENT, { detail: { kind, offer } }))
}

// Old and shareable links that open the register modal on page load
const REGISTER_HASHES = ['#check', '#registrieren']

const BENEFITS = ['Alle Kennzahlen und Unterlagen', 'Vollständige Angebotsbeschreibungen', 'Angebote mit einem Klick anfragen']

export function SiteModal() {
  const ref = useRef<HTMLDialogElement>(null)
  const pathname = usePathname()
  const [kind, setKind] = useState<ModalKind>('register')
  const [offer, setOffer] = useState<OfferUnlock | undefined>()
  // New key per opening, so a form that was already sent starts fresh next time
  const [openCount, setOpenCount] = useState(0)

  const close = useCallback(() => ref.current?.close(), [])
  // Let the user see the success message briefly, then reveal the unlocked page
  const closeSoon = useCallback(() => setTimeout(close, 1500), [close])

  useEffect(() => {
    const open = (k: ModalKind, o?: OfferUnlock) => {
      setKind(k)
      setOffer(o)
      setOpenCount((n) => n + 1)
      if (!ref.current?.open) ref.current?.showModal()
    }
    const onEvent = (e: Event) => {
      const d = (e as CustomEvent<OpenDetail>).detail
      open(d.kind, d.offer)
    }
    window.addEventListener(OPEN_EVENT, onEvent)
    if (REGISTER_HASHES.includes(window.location.hash)) {
      history.replaceState(null, '', window.location.pathname + window.location.search)
      open('register')
    }
    return () => window.removeEventListener(OPEN_EVENT, onEvent)
  }, [])

  const isRegister = kind === 'register'

  return (
    <dialog
      ref={ref}
      aria-labelledby="site-modal-title"
      // Click on the backdrop (outside the content box) closes the modal
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      className="fixed inset-x-0 bottom-0 top-auto m-0 max-h-[92dvh] w-full max-w-full overflow-y-auto rounded-t-2xl bg-white p-0 shadow-2xl sm:inset-0 sm:m-auto sm:h-fit sm:max-w-md sm:rounded-2xl"
    >
      <div className="p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <p id="site-modal-title" className="text-lg font-bold text-slate-900">
              {!isRegister ? 'Fragen? Wir helfen Ihnen weiter' : offer ? 'Dieses Angebot freischalten' : 'Kostenlos registrieren'}
            </p>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
              {!isRegister
                ? 'Wir helfen bei der Suche nach der passenden Kategorie und stellen den Kontakt zu Anbietern her. Keine Anlage- oder Steuerberatung.'
                : offer
                  ? 'Kostenlos und in 30 Sekunden. Danach sehen Sie alle Details direkt auf dieser Seite.'
                  : 'Schalten Sie alle Details zu den Investitionsgütern frei.'}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Schließen"
            className="-mr-1 -mt-1 rounded-lg p-1.5 text-xl leading-none text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        {isRegister ? (
          <>
            {offer ? (
              <div className="mb-4 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/60">
                <div className="flex items-center gap-3 p-3">
                  {offer.image && (
                    // eslint-disable-next-line @next/next/no-img-element -- local or provider URLs, tiny thumbnail
                    <img src={offer.image} alt="" className="h-14 w-20 shrink-0 rounded-lg object-cover" />
                  )}
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Sie schalten frei</p>
                    <p className="truncate text-sm font-bold text-slate-900">{offer.title}</p>
                    {offer.price && <p className="text-xs text-slate-500">ab {offer.price} netto</p>}
                  </div>
                </div>
                <ul className="space-y-1 border-t border-emerald-100 px-3 py-2.5 text-xs text-slate-700">
                  {offer.locked.length > 0 && (
                    <li>
                      {offer.locked.length} Kennzahlen: {offer.locked.slice(0, 4).join(', ')}
                      {offer.locked.length > 4 ? ' …' : ''}
                    </li>
                  )}
                  <li>Vollständige Beschreibung mit Betreibermodell</li>
                  <li>Unterlagen und Anfrage mit einem Klick</li>
                </ul>
              </div>
            ) : (
              <ul className="mb-4 space-y-1 text-sm text-slate-600">
                {BENEFITS.map((b) => (
                  <li key={b}>
                    <span className="text-emerald-600">✓</span> {b}
                  </li>
                ))}
              </ul>
            )}
            <RegisterForm
              key={openCount}
              onDone={closeSoon}
              submitLabel={offer ? 'Angebot jetzt freischalten' : undefined}
              successTitle={offer ? 'Angebot freigeschaltet' : undefined}
            />
            <p className="mt-4 text-center text-sm text-slate-500">
              Bereits registriert?{' '}
              <Link
                href={`/login?redirectTo=${encodeURIComponent(pathname)}`}
                onClick={close}
                className="font-semibold text-emerald-700 hover:underline"
              >
                Anmelden
              </Link>
            </p>
          </>
        ) : (
          <ContactForm key={openCount} />
        )}
      </div>
    </dialog>
  )
}
