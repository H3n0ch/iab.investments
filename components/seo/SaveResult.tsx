'use client'

import Link from 'next/link'
import { startTransition, useActionState, useEffect, useRef, useState } from 'react'
import { saveResult, type LeadFormState } from '@/lib/actions/leads'
import { CONSENT_PRIVACY_TEXT } from '@/lib/consent'
import { track } from '@/lib/track'

const [privacyBefore, privacyAfter] = CONSENT_PRIVACY_TEXT.split('Datenschutzerklärung')
const input =
  'w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'

/**
 * „Ergebnis speichern & Frist-Erinnerung erhalten“ – the soft step under a calculator result:
 * only e-mail, no password, no forwarding to providers. Folded until clicked, so the result stays calm.
 */
export function SaveResult({ iabAmount, year, summary }: { iabAmount: number; year: number; summary: string }) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState<LeadFormState, FormData>(saveResult, null)
  const tRef = useRef<HTMLInputElement>(null)
  const pageRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    if (tRef.current) tRef.current.value = String(Date.now())
    if (pageRef.current) pageRef.current.value = window.location.pathname
  }, [open])

  useEffect(() => {
    if (state?.ok) track('Ergebnis gespeichert')
  }, [state])

  if (state?.ok) {
    return <p className="text-sm text-slate-300">✓ Gespeichert. Wir haben Ihnen das Ergebnis per E-Mail geschickt.</p>
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm font-medium text-slate-300 underline underline-offset-2 hover:text-white">
        Ergebnis speichern & Frist-Erinnerung erhalten
      </button>
    )
  }

  const fe = state?.fieldErrors ?? {}
  return (
    <form
      noValidate
      className="space-y-3 rounded-xl bg-white p-4"
      onSubmit={(e) => {
        e.preventDefault()
        const fd = new FormData(e.currentTarget)
        startTransition(() => action(fd))
      }}
    >
      <input type="hidden" name="iab_amount_eur" value={iabAmount} />
      <input type="hidden" name="iab_year" value={year} />
      <input type="hidden" name="summary" value={summary} />
      <input ref={tRef} type="hidden" name="_t" defaultValue="" />
      <input ref={pageRef} type="hidden" name="page" defaultValue="" />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <p className="text-sm font-semibold text-slate-900">Ergebnis per E-Mail speichern, kein Passwort</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <div>
          <input name="email" type="email" placeholder="E-Mail *" autoComplete="email" className={input} />
          {fe.email && <p className="mt-1 text-xs text-red-600">{fe.email}</p>}
        </div>
        <input name="name" placeholder="Name (optional)" autoComplete="name" className={input} />
      </div>
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input type="checkbox" name="reminder" className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
        <span>Erinnern Sie mich per E-Mail vor Fristende (jederzeit abbestellbar).</span>
      </label>
      <label className="flex items-start gap-2 text-xs text-slate-600">
        <input type="checkbox" name="consent_privacy" className="mt-0.5 h-4 w-4 shrink-0 accent-emerald-600" />
        <span>
          {privacyBefore}
          <Link href="/datenschutz" target="_blank" className="underline">Datenschutzerklärung</Link>
          {privacyAfter} *
        </span>
      </label>
      {fe.consent_privacy && <p className="text-xs text-red-600">{fe.consent_privacy}</p>}
      {state?.error && <p className="text-xs text-red-600">{state.error}</p>}
      <button type="submit" disabled={pending} className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
        {pending ? 'Wird gespeichert…' : 'Ergebnis speichern'}
      </button>
    </form>
  )
}
