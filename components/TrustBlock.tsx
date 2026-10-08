import Image from 'next/image'
import Link from 'next/link'
import { FEE_NOTE } from '@/lib/consent'

// Expertise instead of size: a real person, real numbers, open about how the site is paid.
// TODO(Robert): replace name, background and photo (public/images/team/robert.jpg) with the real ones before going live.
const PERSON = {
  name: 'Robert',
  role: 'Gründer von iab.investments und TinyInvest',
  photo: null as string | null,
  background:
    'Ich begleite Unternehmer seit Jahren bei Investitionen mit Investitionsabzugsbetrag, vom Tiny House bis zur PV-Anlage. Ich vermittle nur Projekte, deren Anbieter ich kenne, und sage auch, wenn etwas nicht passt.',
}

const FACTS = [
  ['über 115', 'IAB-Anfragen begleitet'],
  ['§ 7g EStG', 'Fristen und Beispiele mit Quelle'],
  ['0 €', 'für Sie: Anbieter vergüten uns'],
]

export function TrustBlock({ className = '' }: { className?: string }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 ${className}`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full bg-slate-200">
          {PERSON.photo ? (
            <Image src={PERSON.photo} alt={PERSON.name} fill sizes="80px" className="object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-2xl font-bold text-slate-500">{PERSON.name[0]}</span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Ihr Ansprechpartner</p>
          <p className="mt-0.5 text-lg font-bold text-slate-900">{PERSON.name}</p>
          <p className="text-sm text-slate-500">{PERSON.role}</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">{PERSON.background}</p>
        </div>
      </div>
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
