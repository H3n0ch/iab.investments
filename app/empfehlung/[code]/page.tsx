import type { Metadata } from 'next'
import Link from 'next/link'
import { LeadForm } from '@/components/LeadForm'
import { CATEGORIES, formatEuro } from '@/lib/categories'
import { formatDeadline, iabYears } from '@/lib/iab'
import { getSupabaseAdmin } from '@/lib/supabase/admin'
import { isSupabaseConfigured } from '@/lib/supabase/server'

// Landing page for clients referred by a tax advisor partner. The referral code lives in the URL only (no cookies).
export const metadata: Metadata = {
  title: 'Investitionsgut für Ihren IAB finden',
  robots: { index: false, follow: false },
}

async function getActivePartner(code: string): Promise<{ firm: string; code: string } | null> {
  if (!isSupabaseConfigured || !/^[a-z0-9-]{3,40}$/.test(code)) return null
  try {
    const { data } = await getSupabaseAdmin()
      .from('tax_advisor_partners')
      .select('firm, code')
      .eq('code', code)
      .eq('status', 'aktiv')
      .maybeSingle()
    return data ?? null
  } catch {
    return null
  }
}

export default async function EmpfehlungPage({ params }: PageProps<'/empfehlung/[code]'>) {
  const { code } = await params
  // Unknown or deactivated code: the page still works, just without the partner attribution
  const partner = await getActivePartner(code)
  const years = iabYears()
  const minEntry = Math.min(...CATEGORIES.map((c) => c.minInvestment))

  return (
    <>
      <section className="hero-under-header bg-slate-900">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:py-14">
          {partner && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-emerald-400/30">
              Empfohlen von {partner.firm}
            </span>
          )}
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Ihr IAB läuft aus? Finden Sie das passende Investitionsgut.</h1>
          <p className="mt-4 text-lg text-slate-300">
            Für einen IAB aus dem Wirtschaftsjahr {years[0]} endet die Frist am {formatDeadline(years[0])}. Wählen Sie die
            Investitionsgüter, die Sie interessieren, und passende Anbieter melden sich bei Ihnen. Kostenlos und unverbindlich, ab{' '}
            {formatEuro(minEntry)} netto.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-lg font-bold text-slate-900">Kostenlos Angebote erhalten</h2>
          <p className="mb-4 mt-1 text-sm text-slate-500">Passende Anbieter melden sich direkt bei Ihnen.</p>
          <LeadForm preselected={[]} source="landing" partner={partner?.code} />
        </div>

        <div className="grid gap-3 text-sm sm:grid-cols-3">
          <Link href="/angebote" className="rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-500">
            <span className="font-semibold text-slate-900">Projekte ansehen</span>
            <span className="mt-1 block text-slate-500">Alle aktuellen Projekte nach Investitionsgut.</span>
          </Link>
          <Link href="/iab-rechner" className="rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-500">
            <span className="font-semibold text-slate-900">IAB-Rechner</span>
            <span className="mt-1 block text-slate-500">Wie viel müssen Sie investieren?</span>
          </Link>
          <Link href="/so-funktionierts" className="rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-500">
            <span className="font-semibold text-slate-900">So funktioniert&apos;s</span>
            <span className="mt-1 block text-slate-500">Ablauf, Kosten und Datenschutz.</span>
          </Link>
        </div>

        <p className="text-xs leading-relaxed text-slate-400">
          iab.investments stellt den Kontakt zu Anbietern her und berät weder steuerlich noch zu konkreten Angeboten. Ob ein
          Wirtschaftsgut für Ihren IAB geeignet ist, klären Sie bitte mit Ihrem Steuerberater.
          {partner && ' Ihre Kanzlei erhält von uns keine Daten zu Ihrer Anfrage, solange Sie dem nicht ausdrücklich zustimmen.'}
        </p>
      </div>
    </>
  )
}
