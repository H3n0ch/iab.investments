import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Impressum', robots: { index: false } }

// TODO: Echte Angaben eintragen (§ 5 DDG) – Platzhalter in [eckigen Klammern]
export default function ImpressumPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Impressum</h1>
      <div className="mt-8 space-y-6 leading-relaxed">
        <section>
          <h2 className="font-bold text-slate-900">Angaben gemäß § 5 DDG</h2>
          <p>
            [Firmenname / Vor- und Nachname]
            <br />
            [Straße Hausnummer]
            <br />
            [PLZ Ort]
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900">Kontakt</h2>
          <p>
            E-Mail: info@iab.investments
            <br />
            Telefon: [Telefonnummer]
          </p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900">Umsatzsteuer-ID</h2>
          <p>[USt-IdNr. gemäß § 27a UStG]</p>
        </section>
        <section>
          <h2 className="font-bold text-slate-900">Hinweis zur Tätigkeit</h2>
          <p>
            iab.investments stellt Kontakte zwischen Unternehmern und Anbietern von Investitionsgütern her. Es erfolgt keine Beratung zu
            konkreten Angeboten, keine Mitwirkung an Vertragsabschlüssen und keine Steuer-, Rechts- oder Anlageberatung.
          </p>
        </section>
      </div>
    </div>
  )
}
