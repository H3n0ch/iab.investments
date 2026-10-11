import Link from 'next/link'
import { FEE_NOTE } from '@/lib/consent'

// Trust without a person: real numbers and openness about how the site is paid.

const FACTS = [
  ['persönlich', 'Rückruf statt Callcenter'],
  ['§ 7g EStG', 'Fristen und Beispiele mit Quelle'],
  ['0 €', 'für Sie: Anbieter vergüten uns'],
]

export function TrustBlock({ className = '' }: { className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Über iab.investments</p>
      <p className="mt-1 text-sm leading-relaxed text-slate-700">
        Wir begleiten Unternehmer bei Investitionen mit Investitionsabzugsbetrag, vom Tiny House bis zur PV-Anlage.
      </p>
      <dl className="mt-5 grid gap-3 sm:grid-cols-3">
        {FACTS.map(([v, l]) => (
          <div key={l} className="rounded-xl bg-slate-50 px-3 py-2.5">
            <dt className="text-lg font-extrabold text-slate-900">{v}</dt>
            <dd className="text-xs text-slate-500">{l}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs text-slate-500">
        {FEE_NOTE} <Link href="/anbieter#pruefkriterien" className="underline">So prüfen wir Anbieter</Link>.
      </p>
    </section>
  )
}
