import type { Metadata } from 'next'
import { CONSENT_CALL_TEXT, CONSENT_SHARE_TEXT, CONSENT_VERSION, offerShareText } from '@/lib/consent'

export const metadata: Metadata = { title: 'Datenschutz', robots: { index: false } }

// VORLAGE – vor dem Livegang anwaltlich prüfen lassen. Platzhalter in [eckigen Klammern].
export default function DatenschutzPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 text-slate-700">
      <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Datenschutzerklärung</h1>
      <div className="mt-8 space-y-6 leading-relaxed">
        <section>
          <h2 className="font-bold text-slate-900">1. Verantwortlicher</h2>
          <p>[Firmenname, Anschrift, E-Mail: info@iab.investments]</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900">2. Anfrage- und Kontaktformular</h2>
          <p>
            Wenn Sie über unser Formular eine Anfrage senden, verarbeiten wir Name, E-Mail-Adresse, optional Telefonnummer und Firma
            sowie gegebenenfalls Ihre Angaben zum IAB (Betragsspanne, Jahr der Bildung, Ziel), die gewählten Kategorien und Ihre
            Nachricht. Zum Nachweis
            Ihrer Einwilligung speichern wir außerdem Zeitpunkt, Version des Einwilligungstextes und den Browser-Kennzeichner
            (User-Agent).
          </p>
          <p className="mt-2">Rechtsgrundlage: Art. 6 Abs. 1 lit. a DSGVO (Einwilligung) sowie Art. 6 Abs. 1 lit. b DSGVO (vorvertragliche Maßnahmen).</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900">2a. Kundenkonto</h2>
          <p>
            Für den Zugang zu den Angebotsdetails können Sie ein kostenloses Konto anlegen. Wenn Sie ein Angebot anfragen, legen wir das Konto
            automatisch an und senden Ihnen einen Anmeldelink per E-Mail (ohne Passwort). Wir speichern Name, E-Mail-Adresse, Telefonnummer,
            ggf. Passwort (verschlüsselt), optional Firma sowie, welche Angebote Sie angesehen haben. Eine Weitergabe an Anbieter erfolgt
            erst, wenn Sie ein Angebot ausdrücklich anfragen. Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO. Sie können Ihr Konto jederzeit
            per E-Mail löschen lassen.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900">3. Weitergabe an Anbieter</h2>
          <p>
            Nur mit Ihrer ausdrücklichen Einwilligung geben wir Ihre Angaben an Anbieter weiter. Bei einer allgemeinen Anfrage sind das bis zu
            drei Anbieter der von Ihnen gewählten Kategorien, bei der Anfrage zu einem konkreten Angebot nur dessen Anbieter. Der Wortlaut der
            Einwilligungen (Version {CONSENT_VERSION}) lautet:
          </p>
          <blockquote className="mt-2 border-l-4 border-emerald-500 bg-white px-4 py-3 text-sm italic">{CONSENT_SHARE_TEXT}</blockquote>
          <blockquote className="mt-2 border-l-4 border-emerald-500 bg-white px-4 py-3 text-sm italic">
            {offerShareText('[Name des Angebots]', '[Kategorie]')}
          </blockquote>
          <p className="mt-2">Für Rückrufe holen wir eine gesonderte Einwilligung ein:</p>
          <blockquote className="mt-2 border-l-4 border-emerald-500 bg-white px-4 py-3 text-sm italic">{CONSENT_CALL_TEXT}</blockquote>
          <p className="mt-2">Den genauen Wortlaut, dem Sie zugestimmt haben, speichern wir zusammen mit Zeitpunkt und Version als Nachweis.</p>
          <p className="mt-2">
            Die Anbieter verarbeiten Ihre Daten anschließend in eigener Verantwortung. Eine Liste der aktuellen Anbieter je Kategorie
            erhalten Sie auf Anfrage. [Ggf. Liste ergänzen]
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900">4. Widerruf</h2>
          <p>
            Sie können Ihre Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen, z. B. per E-Mail an info@iab.investments.
            Wir informieren in diesem Fall auch die Anbieter, an die wir Ihre Daten weitergegeben haben.
          </p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900">5. Speicherdauer</h2>
          <p>[z. B. Löschung 24 Monate nach der letzten Interaktion, sofern keine gesetzlichen Aufbewahrungspflichten bestehen]</p>
        </section>

        <section>
          <h2 className="font-bold text-slate-900">6. Auftragsverarbeiter</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Hosting: Netlify, Inc. [Standort / Standardvertragsklauseln prüfen]</li>
            <li>Datenbank: Supabase (Region Frankfurt, EU)</li>
            <li>E-Mail-Versand: Resend [Standort / Standardvertragsklauseln prüfen]</li>
          </ul>
        </section>

        <section>
          <h2 className="font-bold text-slate-900">7. Ihre Rechte</h2>
          <p>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung, Datenübertragbarkeit und
            Widerspruch sowie das Recht auf Beschwerde bei einer Datenschutz-Aufsichtsbehörde.
          </p>
        </section>
      </div>
    </div>
  )
}
