import Link from 'next/link'
import type { OfferDocument } from '@/lib/supabase/types'

// Adapted from TinyMarket's components/ProjectAccessGate.tsx (compact variant).
// Locked: the inquiry is the only step – provider, documents and calculation come with it.
export function UnlockBox({
  unlocked,
  returnPath,
  documents,
  lockedFacts,
}: {
  unlocked: boolean
  returnPath: string
  documents: OfferDocument[]
  /** Labels of the facts that are still locked */
  lockedFacts: string[]
}) {
  if (unlocked) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
          Angebot freigeschaltet
        </p>
        <p className="mt-0.5 text-xs text-emerald-900/70">Alle Kennzahlen und Details zu diesem Angebot sind für Sie sichtbar.</p>
        {documents.length > 0 ? (
          <div className="mt-3 space-y-1.5">
            {documents.map((d) => (
              <a
                key={d.url}
                href={d.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                <span className="flex-1 truncate">{d.label}</span>
              </a>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-xs text-slate-500">Unterlagen erhalten Sie nach Ihrer Anfrage direkt vom Anbieter.</p>
        )}
        <a
          href="#anfrage"
          className="mt-3 block rounded-lg bg-emerald-600 py-2 text-center text-sm font-bold text-white transition-colors hover:bg-emerald-500"
        >
          Unterlagen & Kalkulation anfordern
        </a>
      </div>
    )
  }

  const items = [
    'Kaufpreis, Rendite und Kalkulation',
    'Unterlagen zum Projekt',
    'Persönliche Vorstellung beim Anbieter',
    lockedFacts.length > 0 ? `${lockedFacts.slice(0, 2).join(', ')}${lockedFacts.length > 2 ? ' …' : ''}` : null,
  ].filter((x): x is string => Boolean(x))

  return (
    <div className="rounded-xl border-2 border-emerald-500 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">Dieses Angebot</p>
      <p className="mt-0.5 text-base font-bold leading-snug text-slate-900">Alle Werte freischalten</p>
      <p className="mt-1 text-xs text-slate-500">Mit Ihrer Anfrage erhalten Sie:</p>
      <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
        {items.map((it) => (
          <li key={it} className="flex gap-2">
            <span className="text-emerald-600">✓</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
      <a
        href="#anfrage"
        className="mt-4 block w-full rounded-lg bg-emerald-600 py-2.5 text-center text-sm font-bold text-white transition-colors hover:bg-emerald-500"
      >
        Unterlagen & Kalkulation anfordern
      </a>
      <p className="mt-3 text-center text-[11px] text-slate-400">
        Kostenlos · ohne Passwort · bereits Kunde?{' '}
        <Link href={`/login?redirectTo=${encodeURIComponent(returnPath)}`} className="underline hover:text-slate-600">
          Anmelden
        </Link>
      </p>
    </div>
  )
}
