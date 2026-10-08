import type { Metadata } from 'next'
import Link from 'next/link'
import { GuideCards } from '@/components/GuideCards'
import { guidesBySlug } from '@/lib/wissen'
import { formatDeadline, fristPath, FRIST_PAGE_YEARS, iabYears } from '@/lib/iab'
import { FristCta } from '@/components/FristCta'

// The table follows the calendar year
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'IAB-Frist: Bis wann muss der Investitionsabzugsbetrag investiert werden?',
  description:
    'Frist, Rückgängigmachung und Zinsen: Was Unternehmer zur Investitionsfrist beim Investitionsabzugsbetrag (§ 7g EStG) wissen sollten, mit Fristen-Tabelle.',
  alternates: { canonical: '/ratgeber/iab-frist' },
}

export default function IabFristPage() {
  const years = iabYears()
  return (
    <article className="mx-auto max-w-3xl px-4 py-12">
      <nav className="text-xs text-slate-400">
        <Link href="/" className="hover:text-slate-700">Start</Link> / <Link href="/ratgeber" className="hover:text-slate-700">Wissen</Link>
      </nav>
      <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
        IAB-Frist: Bis wann muss investiert werden?
      </h1>
      <p className="mt-4 text-lg text-slate-600">
        Wer einen Investitionsabzugsbetrag (IAB) nach § 7g EStG bildet, verschiebt Steuerlast in die Zukunft. Das gilt aber nur, wenn
        rechtzeitig investiert wird. Hier finden Sie die wichtigsten Regeln im Überblick.
      </p>

      <div className="mt-10 space-y-8 leading-relaxed text-slate-700">
        <section>
          <h2 className="text-xl font-bold text-slate-900">Die Grundregel: drei Jahre</h2>
          <p className="mt-2">
            Ein IAB muss bis zum Ende des <strong>dritten auf das Jahr der Bildung folgenden Wirtschaftsjahres</strong> für eine
            begünstigte Investition verwendet werden. Bei einem kalendergleichen Wirtschaftsjahr bedeutet das:
          </p>
          <table className="mt-4 w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-2.5 font-medium">IAB gebildet für</th>
                <th className="px-4 py-2.5 font-medium">Investition spätestens bis</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {years.map((y) => (
                <tr key={y}>
                  <td className="px-4 py-2.5">Wirtschaftsjahr {y}</td>
                  <td className="px-4 py-2.5 font-semibold">
                    {(FRIST_PAGE_YEARS as readonly number[]).includes(y) ? (
                      <Link href={fristPath(y)} className="text-emerald-700 underline underline-offset-2">{formatDeadline(y)}</Link>
                    ) : (
                      formatDeadline(y)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-500">Quelle: § 7g Abs. 3 EStG. Bei abweichendem Wirtschaftsjahr verschiebt sich das Datum.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">Was passiert, wenn die Frist verstreicht?</h2>
          <p className="mt-2">
            Wird nicht rechtzeitig investiert, macht das Finanzamt den Abzug im Jahr der Bildung rückgängig. Der Steuerbescheid
            dieses Jahres wird geändert, die Steuer wird nachgezahlt, und es fallen Nachzahlungszinsen nach § 233a AO an.
          </p>
          <Link
            href="/iab-aufloesen"
            className="mt-4 flex items-center justify-between gap-3 rounded-xl border-2 border-amber-300 bg-amber-50 px-4 py-3 text-sm hover:border-amber-400"
          >
            <span>
              <strong className="block text-slate-900">IAB auflösen: Was kostet es Sie?</strong>
              <span className="text-slate-600">Nachzahlung und Zinsen berechnen, Auswege bei knapper Frist.</span>
            </span>
            <span className="shrink-0 font-semibold text-amber-800">Berechnen →</span>
          </Link>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">Welche Investitionen zählen?</h2>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>abnutzbare <strong>bewegliche</strong> Wirtschaftsgüter des Anlagevermögens (neu oder gebraucht)</li>
            <li>Nutzung zu mindestens 90 % betrieblich im Jahr der Anschaffung und im Folgejahr</li>
            <li>auch vermietete Wirtschaftsgüter sind seit 2020 ausdrücklich begünstigt</li>
            <li>nicht begünstigt: Gebäude und Grundstücke sowie immaterielle Wirtschaftsgüter wie Software</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900">Praxistipp: Lieferzeiten einplanen</h2>
          <p className="mt-2">
            Entscheidend ist in der Regel die <strong>Anschaffung</strong>, also der Übergang des wirtschaftlichen Eigentums, nicht die
            Bestellung. Wer erst im Dezember sucht, riskiert, dass die Lieferung nicht mehr rechtzeitig erfolgt.
          </p>
        </section>

        <FristCta />

        <section>
          <h2 className="mb-4 text-xl font-bold text-slate-900">Weiterlesen</h2>
          <GuideCards guides={guidesBySlug(['iab-checkliste-jahresende', 'iab-voraussetzungen', 'degressive-afa-investitionsbooster', 'investitionsabzugsbetrag'])} columns={2} />
        </section>

        <p className="text-xs text-slate-400">
          Dieser Artikel dient der allgemeinen Information und ersetzt keine Steuerberatung. Stand: {new Date().getFullYear()}.
        </p>
      </div>
    </article>
  )
}
