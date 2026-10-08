import { getDatasheet } from '@/lib/datasheets'
import type { OfferFact } from '@/lib/supabase/types'
import { LockButton } from './LockButton'

// Offer data sheet: the same sections and fields for every offer of a category (lib/datasheets.ts).
// Locked values render the field's fake `mask` blurred – the real value is never in the HTML before the inquiry.

type Row = { label: string; value: string; locked: boolean; mask?: string; personal?: boolean }

export function Datasheet({
  categorySlug,
  basics,
  publicFacts,
  gatedFacts,
  unlocked,
}: {
  categorySlug: string
  /** Always-public key data from the offer columns (minimum, yield, availability, location) */
  basics: [string, string][]
  publicFacts: OfferFact[]
  /** With values when unlocked, otherwise labels/keys only */
  gatedFacts: OfferFact[]
  unlocked: boolean
}) {
  const sheet = getDatasheet(categorySlug) ?? []
  const used = new Set<string>()
  const sections: { title: string; rows: Row[] }[] = [
    { title: 'Eckdaten', rows: basics.map(([label, value]) => ({ label, value, locked: false })) },
  ]

  for (const s of sheet) {
    const rows: Row[] = []
    for (const f of s.fields) {
      const pub = publicFacts.find((x) => x.key === f.key)
      const gated = gatedFacts.find((x) => x.key === f.key)
      if (pub) rows.push({ label: f.label, value: pub.value, locked: false })
      else if (gated && f.level === 'personal') rows.push({ label: f.label, value: '', locked: false, personal: true })
      else if (gated) rows.push({ label: f.label, value: gated.value, locked: !unlocked, mask: f.mask })
      else continue
      used.add(f.key)
    }
    if (rows.length) sections.push({ title: s.title, rows })
  }

  // Free-form figures (older offers, categories without a sheet)
  const extra: Row[] = [
    ...publicFacts.filter((f) => !f.key || !used.has(f.key)).map((f) => ({ label: f.label, value: f.value, locked: false })),
    ...gatedFacts.filter((f) => !f.key || !used.has(f.key)).map((f) => ({ label: f.label, value: f.value, locked: !unlocked })),
  ]
  if (extra.length) sections.push({ title: sheet.length ? 'Weitere Kennzahlen' : 'Kennzahlen', rows: extra })

  const lockedCount = sections.reduce((n, s) => n + s.rows.filter((r) => r.locked).length, 0)
  if (sections.every((s) => s.rows.length === 0)) return null

  return (
    <div className="mb-6">
      <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-bold text-slate-900">Datenblatt</h2>
        {lockedCount > 0 && (
          <a href="#anfrage" className="text-sm font-semibold text-emerald-700 hover:underline">
            🔒 {lockedCount} Werte mit Ihrer Anfrage freischalten →
          </a>
        )}
      </div>

      {/* One card per section, stacked with space in between */}
      <div className="space-y-4">
        {sections
          .filter((s) => s.rows.length)
          .map((s) => (
            <section key={s.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h3 className="mb-3 border-b border-slate-100 pb-2 text-base font-bold text-slate-900">{s.title}</h3>
              <dl className="space-y-3">
                {s.rows.map((r) => (
                  <div key={r.label}>
                    <dt className="text-xs text-slate-500">{r.label}</dt>
                    <dd className="mt-0.5 wrap-break-word text-sm font-semibold text-slate-900">
                      {r.personal ? (
                        <span className="text-sm font-medium text-slate-500">🤝 im persönlichen Gespräch</span>
                      ) : r.locked ? (
                        <LockButton
                          label={
                            <span className="inline-flex items-center gap-2">
                              <span aria-hidden className="select-none text-slate-500 blur-[5px]">
                                {r.mask ?? '000.000'}
                              </span>
                              <span className="text-xs font-semibold text-emerald-700">🔒 mit Anfrage</span>
                            </span>
                          }
                        />
                      ) : (
                        r.value
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
      </div>
      <p className="mt-3 text-[11px] leading-relaxed text-slate-400">
        Alle Angaben, Prognosen und Renditezahlen stammen vom Anbieter. Werte netto, sofern nicht anders angegeben.
      </p>
    </div>
  )
}
