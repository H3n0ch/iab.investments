import Link from 'next/link'
import { formatDeadline, fristPath, iabYears } from '@/lib/iab'

/**
 * Call to action for pages without their own form: the deadline check of the oldest running vintage.
 * One message across the site: free inquiry, no password – no account needed.
 */
export function FristCta({ className = '' }: { className?: string }) {
  const year = iabYears()[0]
  return (
    <div className={`grid gap-4 rounded-3xl bg-slate-900 p-6 text-white sm:grid-cols-[1fr_auto] sm:items-center sm:p-8 ${className}`}>
      <div>
        <p className="text-lg font-bold">Ihr IAB aus {year} läuft am {formatDeadline(year)} ab?</p>
        <p className="mt-1 text-sm text-slate-300">
          Frist prüfen, Kosten der Auflösung sehen und Unterlagen zu passenden Projekten anfordern. Kostenlos, kein Passwort nötig.
        </p>
      </div>
      <Link href={fristPath(year)} className="justify-self-start rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold hover:bg-emerald-500">
        Frist-Check starten →
      </Link>
    </div>
  )
}
