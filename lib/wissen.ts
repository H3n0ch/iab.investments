// Knowledge section (/ratgeber/[slug]). Long-form articles for SEO and for leads who want to understand the IAB
// before they inquire. Paragraph strings support two inline marks, rendered by components/RichText.tsx:
//   [Linktext](/pfad)   internal link (keep every article linked from and to others – no orphan pages)
//   **fett**            emphasis
// General information only: no tax advice, no advice on specific offers (we are a contact broker).

import type { FaqItem } from './faq'

export type ArticleSection = { h: string; p: string[]; list?: string[]; after?: string[] }

export type Article = {
  slug: string
  title: string
  seoTitle: string
  description: string
  teaser: string
  icon: string
  /** 'wissenswertes': broader investing/tax topics, listed separately in the hub and the footer */
  group?: 'wissenswertes'
  /** Served at this root-level URL instead of /ratgeber/<slug> (keyword landing pages); old URL redirects */
  path?: string
  /** Related category slugs – shown as cards and used to link category pages back */
  categories: string[]
  /** Related article slugs (including the static guides 'iab-frist' and 'iab-faq') */
  related: string[]
  intro: string
  sections: ArticleSection[]
  faq: FaqItem[]
}

export const UPDATED = 'Oktober 2026'

export const ARTICLES: Article[] = [
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'investitionsabzugsbetrag',
    title: 'Investitionsabzugsbetrag (IAB) einfach erklärt',
    seoTitle: 'Investitionsabzugsbetrag (IAB) erklärt: So funktioniert § 7g EStG',
    description:
      'Was ist der Investitionsabzugsbetrag, wie hoch darf er sein und wie läuft er ab? Der IAB nach § 7g EStG verständlich erklärt, mit Rechenbeispiel und Fristen.',
    teaser: 'Der Grundlagenartikel: wie der IAB funktioniert, wer ihn nutzen darf und was er wirklich bringt.',
    icon: '📘',
    categories: ['photovoltaik-iab', 'batteriespeicher-iab', 'mietcontainer-iab'],
    related: ['iab-voraussetzungen', 'sonderabschreibung-7g', 'iab-frist', 'bewegliche-wirtschaftsgueter'],
    intro:
      'Der Investitionsabzugsbetrag gehört zu den wirksamsten Steuerinstrumenten für kleine und mittlere Betriebe. Er erlaubt es, Aufwand für eine Investition steuerlich vorzuziehen, bevor auch nur ein Euro ausgegeben wurde. Damit das funktioniert, müssen Sie allerdings ein paar Regeln kennen. Die wichtigste: Ein IAB ist ein Versprechen an das Finanzamt, innerhalb von drei Jahren tatsächlich zu investieren.',
    sections: [
      {
        h: 'Was ist der Investitionsabzugsbetrag?',
        p: [
          'Der Investitionsabzugsbetrag, kurz IAB, ist in **§ 7g des Einkommensteuergesetzes** geregelt. Er erlaubt Betrieben, bis zu 50 % der voraussichtlichen Anschaffungskosten eines künftigen beweglichen Wirtschaftsguts schon vor dem Kauf gewinnmindernd abzuziehen. Der Gewinn sinkt also in einem Jahr, in dem noch gar keine Ausgabe angefallen ist.',
          'Wirtschaftlich ist der IAB eine **Steuerstundung**. Die Steuer wird nicht erlassen, sondern verschoben: Im Jahr der Investition wird der Abzug dem Gewinn wieder hinzugerechnet, und die spätere Abschreibung fällt entsprechend niedriger aus. Der Vorteil liegt in der Liquidität, die Ihnen in der Zwischenzeit zur Verfügung steht, und oft in einem Progressionseffekt, wenn der Gewinn im Jahr der Bildung besonders hoch war.',
          'Der Gesetzgeber verfolgt mit dem IAB ein klares Ziel: Kleine und mittlere Betriebe sollen leichter investieren können. Deshalb ist der IAB an eine Gewinngrenze gebunden und nur für bestimmte Wirtschaftsgüter nutzbar. Welche das sind, erklären wir im Artikel [Bewegliche Wirtschaftsgüter für den IAB](/ratgeber/bewegliche-wirtschaftsgueter).',
        ],
      },
      {
        h: 'Wie hoch darf der IAB sein?',
        p: [
          'Abziehen dürfen Sie bis zu **50 % der voraussichtlichen Anschaffungs- oder Herstellungskosten**. Planen Sie also eine Investition von 100.000 € netto, können Sie bis zu 50.000 € als IAB geltend machen. Für die Planung zählt immer der Nettobetrag, denn die Umsatzsteuer ist für vorsteuerabzugsberechtigte Unternehmer ein durchlaufender Posten.',
          'Daneben gilt ein Höchstbetrag: Alle IAB eines Betriebs, die im laufenden Jahr und in den drei Vorjahren gebildet und noch nicht wieder hinzugerechnet oder rückgängig gemacht wurden, dürfen zusammen **200.000 €** nicht übersteigen. Wer in mehreren Jahren hintereinander IAB bildet, sollte diesen Rahmen im Blick behalten.',
        ],
      },
      {
        h: 'Wer darf einen IAB bilden?',
        p: [
          'Berechtigt sind Betriebe mit Gewinneinkünften: Gewerbetreibende, Freiberufler sowie Land- und Forstwirte, unabhängig von der Rechtsform. Auch eine GmbH oder eine Personengesellschaft kann einen IAB bilden. Seit 2020 gilt für alle Betriebe einheitlich eine **Gewinngrenze von 200.000 €** im Jahr der Bildung. Der Gewinn wird dabei ohne den IAB selbst ermittelt.',
          'Nicht berechtigt sind Privatpersonen, die nur Einkünfte aus Vermietung und Verpachtung oder aus Kapitalvermögen haben. Wer etwa privat eine Ferienwohnung vermietet, kann dafür keinen IAB bilden. Mehr Details zu Gewinngrenze, Nutzung und Verbleib finden Sie im Artikel [IAB-Voraussetzungen](/ratgeber/iab-voraussetzungen). Wie sich der IAB je nach Rechtsform auswirkt, beschreibt der Beitrag [IAB für GmbH, Freiberufler und Einzelunternehmer](/ratgeber/iab-rechtsform-gmbh-freiberufler).',
        ],
      },
      {
        h: 'Der Ablauf in drei Phasen',
        p: [
          'Ein IAB durchläuft drei Phasen. Wer sie kennt, versteht auch, warum die Frist so wichtig ist.',
        ],
        list: [
          '**Bildung:** Sie ziehen den IAB in der Steuererklärung des Jahres ab, in dem Sie Steuern sparen möchten. Die Angaben werden elektronisch nach amtlichem Datensatz übermittelt. Das konkrete Wirtschaftsgut müssen Sie seit 2016 nicht mehr benennen.',
          '**Investition:** Innerhalb von drei Jahren schaffen Sie ein begünstigtes bewegliches Wirtschaftsgut an. Im Jahr der Anschaffung wird der IAB dem Gewinn hinzugerechnet. Gleichzeitig dürfen Sie die Anschaffungskosten um bis zu 50 % kürzen. Hinzurechnung und Kürzung gleichen sich in der Regel aus.',
          '**Abschreibung:** Die reguläre Abschreibung läuft von den gekürzten Anschaffungskosten. Zusätzlich ist eine Sonderabschreibung von bis zu 40 % möglich, siehe [Sonderabschreibung nach § 7g EStG](/ratgeber/sonderabschreibung-7g).',
        ],
        after: [
          'Bleibt die Investition aus, wird der IAB im Jahr seiner Bildung rückgängig gemacht. Die Steuer wird nachgezahlt, zuzüglich Zinsen. Was eine [Auflösung des IAB](/iab-aufloesen) konkret kostet, können Sie berechnen. Wie die Frist genau berechnet wird, zeigt unser Ratgeber [IAB-Frist](/ratgeber/iab-frist).',
        ],
      },
      {
        h: 'Rechenbeispiel: Was bringt der IAB?',
        p: [
          'Ein vereinfachtes Beispiel: Eine Einzelunternehmerin erzielt 2026 einen Gewinn von 150.000 €. Sie plant, 2027 ein bewegliches Wirtschaftsgut für 100.000 € netto anzuschaffen, und bildet für 2026 einen IAB von 50.000 €. Ihr steuerpflichtiger Gewinn sinkt dadurch auf 100.000 €. Bei einem Grenzsteuersatz von rund 42 % ergibt das eine Steuerstundung von etwa 21.000 € zuzüglich Solidaritätszuschlag und gegebenenfalls Kirchensteuer.',
          '2027 schafft sie das Wirtschaftsgut an. Der IAB von 50.000 € wird dem Gewinn hinzugerechnet, gleichzeitig kürzt sie die Anschaffungskosten um 50.000 €. Die Abschreibung läuft nun von 50.000 €. Zusätzlich kann sie bis zu 40 % davon, also 20.000 €, als Sonderabschreibung geltend machen, verteilt über bis zu fünf Jahre.',
          'Das Beispiel zeigt die Logik, ersetzt aber keine Berechnung für Ihren Fall. Wie stark sich der IAB auswirkt, hängt vom persönlichen Steuersatz, von der Gewinnentwicklung in den Folgejahren und von der Rechtsform ab. Das sollten Sie mit Ihrem Steuerberater durchrechnen.',
        ],
      },
      {
        h: 'Steuerstundung oder Steuerersparnis?',
        p: [
          'Formal ist der IAB eine Stundung. In der Praxis kann trotzdem ein echter Vorteil entstehen. Liegt der Gewinn im Jahr der Bildung besonders hoch und fällt er in späteren Jahren niedriger aus, verschiebt der IAB Gewinne aus einer hohen in eine niedrigere Progressionsstufe. Hinzu kommt der Liquiditätsvorteil: Das Geld, das sonst sofort an das Finanzamt gegangen wäre, steht Ihnen bis zur Investition zur Verfügung.',
          'Umgekehrt kann der IAB teuer werden, wenn die Investition ausbleibt. Dann fallen neben der Nachzahlung auch **Nachzahlungszinsen nach § 233a AO** an, derzeit 0,15 % pro Monat. Deshalb lohnt es sich, frühzeitig zu planen und nicht erst im Dezember des letzten Fristjahres nach einem passenden Wirtschaftsgut zu suchen.',
        ],
      },
      {
        h: 'Welche Investitionen eignen sich?',
        p: [
          'Begünstigt sind abnutzbare bewegliche Wirtschaftsgüter des Anlagevermögens, neu oder gebraucht. Viele Unternehmer investieren in Maschinen, Fahrzeuge oder Büroausstattung für den eigenen Betrieb. Steht keine passende Investition an, kommen Sachwerte infrage, die vermietet oder über einen Betreiber genutzt werden, etwa [PV-Module](/photovoltaik-iab), [Batteriespeicher](/batteriespeicher-iab), [Container](/mietcontainer-iab) oder [mobile Tiny Houses](/tiny-house-iab).',
          'Wie solche Modelle funktionieren und welche Fragen Sie einem Anbieter stellen sollten, erklärt der Artikel [IAB-Direktinvestments und Betreibermodelle](/ratgeber/iab-direktinvestment-betreibermodell). Einen schnellen Überblick, welche Kategorie zu Ihrem Betrag und Ihrer Frist passt, gibt Ihnen der [IAB-Rechner](/iab-rechner).',
        ],
      },
    ],
    faq: [
      {
        q: 'Ist der Investitionsabzugsbetrag eine Steuerersparnis?',
        a: 'In erster Linie ist der IAB eine Steuerstundung: Der Abzug wird im Jahr der Investition wieder hinzugerechnet. Ein echter Vorteil kann durch den Liquiditätsgewinn und durch Progressionseffekte entstehen, wenn der Gewinn im Jahr der Bildung höher ist als in späteren Jahren.',
      },
      {
        q: 'Muss ich für den IAB einen Antrag stellen?',
        a: 'Nein, einen gesonderten Antrag gibt es nicht. Der IAB wird in der Steuererklärung bzw. Gewinnermittlung geltend gemacht. Die Beträge sind nach amtlichem Datensatz elektronisch an das Finanzamt zu übermitteln.',
      },
      {
        q: 'Kann ich einen IAB auch nachträglich bilden?',
        a: 'Ein IAB kann grundsätzlich auch nachträglich geltend gemacht werden, solange die Steuerfestsetzung noch änderbar ist. Ob das in Ihrem Fall möglich und sinnvoll ist, klären Sie mit Ihrem Steuerberater.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'iab-voraussetzungen',
    title: 'IAB-Voraussetzungen: Gewinngrenze, Nutzung und Verbleib',
    seoTitle: 'IAB-Voraussetzungen 2026: Gewinngrenze, 90-%-Nutzung, Verbleib',
    description:
      'Welche Voraussetzungen gelten für den Investitionsabzugsbetrag? Gewinngrenze 200.000 €, betriebliche Nutzung von mindestens 90 %, Verbleib und Vermietung im Überblick.',
    teaser: 'Gewinngrenze, 90-%-Nutzung, Verbleibensfrist und Vermietung: alle Bedingungen, an denen ein IAB scheitern kann.',
    icon: '✅',
    categories: ['wohnmobil-iab', 'tiny-house-iab', 'ladeinfrastruktur-iab'],
    related: ['investitionsabzugsbetrag', 'bewegliche-wirtschaftsgueter', 'iab-rechtsform-gmbh-freiberufler', 'iab-faq'],
    intro:
      'Ein IAB ist schnell gebildet, aber er ist an Bedingungen geknüpft, die über Jahre eingehalten werden müssen. Manche gelten im Jahr der Bildung, andere erst nach der Anschaffung. Wer eine davon verletzt, riskiert die rückwirkende Auflösung samt Zinsen. Dieser Artikel ordnet die Voraussetzungen zeitlich, damit Sie wissen, wann worauf zu achten ist.',
    sections: [
      {
        h: 'Voraussetzungen im Jahr der Bildung',
        p: [
          'Im Jahr, in dem Sie den IAB abziehen möchten, müssen zwei Bedingungen erfüllt sein. Erstens muss ein Betrieb mit Gewinneinkünften bestehen: ein Gewerbebetrieb, eine freiberufliche Tätigkeit oder ein land- und forstwirtschaftlicher Betrieb. Zweitens darf der Gewinn dieses Betriebs die **Grenze von 200.000 €** nicht überschreiten.',
          'Die Gewinngrenze gilt seit 2020 einheitlich für alle Gewinnermittlungsarten. Früher gab es unterschiedliche Grenzen nach Betriebsvermögen, Wirtschaftswert oder Gewinn. Diese Unterscheidung ist entfallen. Maßgeblich ist der Gewinn, der ohne den IAB selbst und ohne Hinzurechnungen aus früheren IAB ermittelt wird. Liegt der Gewinn knapp über der Grenze, kann ein IAB also nicht dazu genutzt werden, ihn darunter zu drücken.',
          'Außerdem müssen Sie die Summen der IAB nach amtlich vorgeschriebenem Datensatz elektronisch an das Finanzamt übermitteln. In der Praxis erledigt das die Steuerkanzlei mit der Anlage EÜR oder der Bilanz.',
        ],
      },
      {
        h: 'Die Frist für die Investition',
        p: [
          'Der IAB muss bis zum Ende des **dritten auf das Jahr der Bildung folgenden Wirtschaftsjahres** verwendet werden. Ein IAB für 2024 muss also bis zum 31.12.2027 investiert sein, sofern das Wirtschaftsjahr dem Kalenderjahr entspricht. Bei abweichendem Wirtschaftsjahr verschiebt sich das Fristende entsprechend.',
          'Entscheidend ist der Zeitpunkt der **Anschaffung**, also der Übergang des wirtschaftlichen Eigentums. Eine Bestellung oder Anzahlung allein genügt in der Regel nicht. Eine Tabelle mit allen aktuellen Fristen finden Sie im Ratgeber [IAB-Frist](/ratgeber/iab-frist).',
        ],
      },
      {
        h: 'Begünstigtes Wirtschaftsgut',
        p: [
          'Der IAB kann nur für **abnutzbare bewegliche Wirtschaftsgüter des Anlagevermögens** verwendet werden. Gebrauchte Güter sind seit 2008 ebenfalls begünstigt. Ausgeschlossen sind Gebäude, Grundstücke, fest mit dem Grund verbundene Bauten und immaterielle Wirtschaftsgüter wie Software oder Lizenzen.',
          'Die Abgrenzung ist nicht immer offensichtlich. Ein Tiny House auf einem Trailer ist beweglich, eines auf einem festen Fundament kann als Gebäude gelten. Eine ausführliche Abgrenzung mit Beispielen lesen Sie im Artikel [Bewegliche Wirtschaftsgüter für den IAB](/ratgeber/bewegliche-wirtschaftsgueter).',
        ],
      },
      {
        h: 'Nutzung zu mindestens 90 % und Verbleib',
        p: [
          'Die wohl wichtigste Bedingung gilt nach der Anschaffung: Das Wirtschaftsgut muss im Jahr der Anschaffung und im darauffolgenden Wirtschaftsjahr **vermietet oder in einer inländischen Betriebsstätte des Betriebs ausschließlich oder fast ausschließlich betrieblich genutzt** werden. Fast ausschließlich bedeutet: Die private Nutzung darf höchstens 10 % betragen.',
          'Bei Fahrzeugen ist diese Grenze besonders heikel. Ein Pkw, der auch privat gefahren wird, erreicht die 90 % oft nicht, und der Nachweis gelingt in der Regel nur mit einem ordnungsgemäßen Fahrtenbuch. Bei [Wohnmobilen](/wohnmobil-iab) ist eine eigene Urlaubsnutzung deshalb praktisch ausgeschlossen, wenn der IAB nicht gefährdet werden soll.',
          'Für Standorte im Ausland, zum Beispiel bei Hardware in einem ausländischen Rechenzentrum, sollten Sie die Voraussetzungen besonders sorgfältig mit Ihrem Steuerberater prüfen.',
        ],
      },
      {
        h: 'Vermietung ist ausdrücklich begünstigt',
        p: [
          'Seit dem Jahressteuergesetz 2020 stellt das Gesetz klar, dass auch **vermietete Wirtschaftsgüter** begünstigt sind, und zwar unabhängig von der Dauer der Vermietung. Vorher war umstritten, ob langfristig vermietete Güter die Nutzungsvoraussetzung erfüllen. Diese Klarstellung hat Betreibermodelle für viele Unternehmer interessant gemacht.',
          'Bei einem Betreibermodell kaufen Sie zum Beispiel PV-Module, Container oder ein Tiny House und vermieten es an einen Betreiber, der es nutzt oder weitervermietet. Wie solche Modelle funktionieren und welche Risiken es gibt, erklärt der Artikel [IAB-Direktinvestments und Betreibermodelle](/ratgeber/iab-direktinvestment-betreibermodell).',
        ],
      },
      {
        h: 'Was passiert bei einem Verstoß?',
        p: [
          'Wird eine Voraussetzung verletzt, unterscheidet das Gesetz zwei Fälle. Bleibt die Investition aus oder ist das Wirtschaftsgut nicht begünstigt, wird der IAB im Jahr der Bildung rückgängig gemacht. Wird das Wirtschaftsgut zwar angeschafft, aber nicht lange genug oder nicht überwiegend betrieblich genutzt, werden der IAB, die Kürzung der Anschaffungskosten und eine in Anspruch genommene Sonderabschreibung rückwirkend korrigiert.',
          'In beiden Fällen kommt es zu einer Steuernachzahlung, die mit 0,15 % pro Monat verzinst wird. Wie hoch das ausfällt, zeigt der Rechner auf der Seite [IAB auflösen](/iab-aufloesen). Wer absehen kann, dass eine Investition nicht stattfindet, kann den IAB auch vorzeitig freiwillig rückgängig machen und so den Zinslauf begrenzen.',
        ],
      },
      {
        h: 'Checkliste: Die Voraussetzungen auf einen Blick',
        p: ['Diese Punkte sollten erfüllt sein, damit ein IAB Bestand hat:'],
        list: [
          'Betrieb mit Gewinneinkünften (Gewerbe, freier Beruf, Land- und Forstwirtschaft)',
          'Gewinn im Jahr der Bildung höchstens 200.000 €, ohne IAB gerechnet',
          'IAB höchstens 50 % der geplanten Anschaffungskosten, zusammen höchstens 200.000 € in vier Jahren',
          'Investition bis zum Ende des dritten Folgejahres',
          'abnutzbares bewegliches Wirtschaftsgut des Anlagevermögens',
          'Vermietung oder mindestens 90 % betriebliche Nutzung im Jahr der Anschaffung und im Folgejahr',
        ],
        after: [
          'Wenn Sie wissen möchten, wie Sie die Investition zeitlich vor dem Fristende absichern, hilft unsere [Checkliste für die Investition vor dem Jahresende](/ratgeber/iab-checkliste-jahresende).',
        ],
      },
    ],
    faq: [
      {
        q: 'Gilt die Gewinngrenze von 200.000 € auch für eine GmbH?',
        a: 'Ja. Seit 2020 gilt die Gewinngrenze von 200.000 € einheitlich für alle Betriebe, auch für Kapitalgesellschaften. Maßgeblich ist der Gewinn im Jahr der Bildung, ermittelt ohne den IAB selbst.',
      },
      {
        q: 'Darf ich ein Wirtschaftsgut mit IAB auch privat nutzen?',
        a: 'Nur in sehr geringem Umfang. Im Jahr der Anschaffung und im Folgejahr muss die betriebliche Nutzung mindestens 90 % betragen. Bei Fahrzeugen ist der Nachweis in der Regel nur über ein Fahrtenbuch möglich.',
      },
      {
        q: 'Muss das Wirtschaftsgut nach zwei Jahren im Betrieb bleiben?',
        a: 'Die Nutzungs- und Verbleibensvoraussetzung gilt bis zum Ende des Wirtschaftsjahres, das auf die Anschaffung folgt. Danach führt ein Verkauf nicht mehr zur Rückgängigmachung des IAB. Die steuerlichen Folgen eines Verkaufs sind davon unabhängig zu prüfen.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'sonderabschreibung-7g',
    title: 'Sonderabschreibung nach § 7g EStG: bis zu 40 % zusätzlich',
    seoTitle: 'Sonderabschreibung § 7g Abs. 5 EStG: 40 % zusätzlich zum IAB',
    description:
      'Die Sonderabschreibung nach § 7g Abs. 5 EStG beträgt seit 2024 bis zu 40 %. Voraussetzungen, Verteilung über fünf Jahre und Kombination mit IAB und degressiver AfA.',
    teaser: 'Seit 2024 bis zu 40 % zusätzliche Abschreibung: wie die Sonder-AfA funktioniert und wie sie mit dem IAB zusammenspielt.',
    icon: '📉',
    categories: ['batteriespeicher-iab', 'ladeinfrastruktur-iab', 'werbeflaechen-iab'],
    related: ['investitionsabzugsbetrag', 'degressive-afa-investitionsbooster', 'iab-voraussetzungen', 'iab-faq'],
    intro:
      'Der Investitionsabzugsbetrag wirkt vor der Investition. Die Sonderabschreibung nach § 7g Abs. 5 EStG wirkt danach. Beide zusammen ermöglichen es kleinen und mittleren Betrieben, einen großen Teil der Anschaffungskosten in kurzer Zeit steuerlich geltend zu machen. Seit dem Wachstumschancengesetz ist die Sonderabschreibung deutlich attraktiver geworden.',
    sections: [
      {
        h: 'Was ist die Sonderabschreibung nach § 7g?',
        p: [
          'Neben der regulären Abschreibung, also der Verteilung der Anschaffungskosten über die Nutzungsdauer, dürfen kleine und mittlere Betriebe für bewegliche Wirtschaftsgüter eine zusätzliche Abschreibung vornehmen. Diese **Sonderabschreibung** beträgt für Wirtschaftsgüter, die nach dem 31.12.2023 angeschafft wurden, **bis zu 40 %** der Anschaffungs- oder Herstellungskosten. Vorher lag sie bei 20 %.',
          'Die Sonderabschreibung kann im Jahr der Anschaffung und in den vier folgenden Jahren in Anspruch genommen werden. Wie Sie die 40 % auf diese fünf Jahre verteilen, ist Ihnen überlassen. Sie können alles im ersten Jahr nutzen oder den Abzug strecken, etwa in ein Jahr mit besonders hohem Gewinn.',
        ],
      },
      {
        h: 'Voraussetzungen der Sonderabschreibung',
        p: [
          'Die Bedingungen ähneln denen des IAB, sind aber zeitlich anders verankert. Die **Gewinngrenze von 200.000 €** gilt hier für das Wirtschaftsjahr, das der Anschaffung vorangeht. Das Wirtschaftsgut muss im Jahr der Anschaffung und im Folgejahr vermietet oder in einer inländischen Betriebsstätte zu mindestens 90 % betrieblich genutzt werden.',
          'Wichtig: Für die Sonderabschreibung ist kein vorheriger IAB nötig. Sie können sie auch für eine Investition nutzen, für die Sie keinen IAB gebildet haben. Umgekehrt setzt ein IAB keine Sonderabschreibung voraus. Die beiden Instrumente lassen sich aber gut kombinieren. Alle Voraussetzungen im Detail finden Sie im Artikel [IAB-Voraussetzungen](/ratgeber/iab-voraussetzungen).',
        ],
      },
      {
        h: 'Kombination mit dem IAB: ein Beispiel',
        p: [
          'Angenommen, ein Betrieb schafft einen [Batteriespeicher](/batteriespeicher-iab) für 100.000 € netto an und hat dafür zwei Jahre vorher einen IAB von 50.000 € gebildet. Im Jahr der Anschaffung wird der IAB hinzugerechnet und die Anschaffungskosten um 50.000 € gekürzt. Bemessungsgrundlage für die weiteren Abschreibungen sind damit 50.000 €.',
          'Von diesen 50.000 € darf der Betrieb bis zu 40 %, also 20.000 €, als Sonderabschreibung geltend machen. Hinzu kommt die reguläre Abschreibung. Insgesamt sind so innerhalb weniger Jahre deutlich mehr als 70 % der ursprünglichen Anschaffungskosten steuerlich wirksam, ein großer Teil davon bereits vor der eigentlichen Zahlung über den IAB.',
          'Das Beispiel ist vereinfacht. Der tatsächliche Effekt hängt von Nutzungsdauer, Abschreibungsmethode und Steuersatz ab.',
        ],
      },
      {
        h: 'Sonderabschreibung und degressive AfA',
        p: [
          'Die Sonderabschreibung kann sowohl neben der linearen als auch neben der **degressiven Abschreibung** genutzt werden. Für bewegliche Wirtschaftsgüter, die zwischen dem 1.7.2025 und dem 31.12.2027 angeschafft werden, ist wieder eine degressive Abschreibung von bis zu 30 % möglich. In Kombination mit Sonderabschreibung und IAB kann der Abschreibungseffekt in den ersten Jahren sehr hoch ausfallen.',
          'Was die degressive Abschreibung genau bedeutet und welche Fristen gelten, erklärt der Artikel [Degressive AfA und Investitions-Booster](/degressive-afa-bewegliche-wirtschaftsgueter).',
        ],
      },
      {
        h: 'Wann die Sonderabschreibung korrigiert wird',
        p: [
          'Wird das Wirtschaftsgut im Jahr der Anschaffung oder im Folgejahr nicht mehr überwiegend betrieblich genutzt, nicht mehr vermietet oder aus dem Betrieb entfernt, entfällt die Grundlage. Die Sonderabschreibung wird dann rückwirkend versagt, und ein zugehöriger IAB wird ebenfalls korrigiert. Es entstehen Nachzahlungen mit Zinsen.',
          'Gerade bei Betreibermodellen sollten Sie deshalb darauf achten, dass der Miet- oder Betreibervertrag mindestens die gesamte Bindungsfrist abdeckt. Was dabei zu beachten ist, lesen Sie im Artikel [IAB-Direktinvestments und Betreibermodelle](/ratgeber/iab-direktinvestment-betreibermodell).',
        ],
      },
      {
        h: 'Für welche Investitionen lohnt sich das?',
        p: [
          'Die Sonderabschreibung lohnt sich vor allem bei Wirtschaftsgütern mit längerer Nutzungsdauer. Je länger die reguläre Abschreibung laufen würde, desto größer ist der Vorzieheffekt. Beispiele sind [Ladeinfrastruktur](/ladeinfrastruktur-iab), [digitale Werbeflächen](/werbeflaechen-iab), Batteriespeicher oder PV-Module. Bei Wirtschaftsgütern, die ohnehin schnell abgeschrieben werden, fällt der zusätzliche Effekt kleiner aus.',
          'Welche Kategorie zu Ihrem Budget und Ziel passt, sehen Sie im [IAB-Rechner](/iab-rechner). Wie Sie den Effekt für Ihren Betrieb planen, besprechen Sie am besten mit Ihrem Steuerberater.',
        ],
      },
    ],
    faq: [
      {
        q: 'Wie hoch ist die Sonderabschreibung nach § 7g EStG?',
        a: 'Für bewegliche Wirtschaftsgüter, die nach dem 31.12.2023 angeschafft oder hergestellt wurden, beträgt sie bis zu 40 % der Anschaffungs- oder Herstellungskosten, verteilt nach Wahl auf das Jahr der Anschaffung und die vier Folgejahre. Vorher lag sie bei 20 %.',
      },
      {
        q: 'Brauche ich einen IAB, um die Sonderabschreibung zu nutzen?',
        a: 'Nein. Die Sonderabschreibung ist unabhängig vom IAB. Sie kann auch ohne vorherigen IAB genutzt werden, sofern Gewinngrenze und Nutzungsvoraussetzungen erfüllt sind.',
      },
      {
        q: 'Gilt die Sonderabschreibung auch für gebrauchte Wirtschaftsgüter?',
        a: 'Ja. Wie der IAB ist auch die Sonderabschreibung für neue und gebrauchte bewegliche Wirtschaftsgüter möglich.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'degressive-afa-investitionsbooster',
    path: '/degressive-afa-bewegliche-wirtschaftsgueter',
    title: 'Degressive AfA 2025 und 2026 für bewegliche Wirtschaftsgüter',
    seoTitle: 'Degressive AfA 2025 & 2026: 30 % für bewegliche Wirtschaftsgüter – mit Beispiel',
    description:
      'Degressive AfA 2025 und 2026: Für bewegliche Wirtschaftsgüter, angeschafft vom 1.7.2025 bis 31.12.2027, gilt bis zu 30 %. Beispielrechnung, Abgrenzung zu Gebäuden und Kombination mit IAB und Sonderabschreibung.',
    teaser: 'Bis Ende 2027 gilt eine degressive Abschreibung von bis zu 30 %. Was das für Ihre IAB-Planung bedeutet.',
    icon: '🚀',
    categories: ['photovoltaik-iab', 'batteriespeicher-iab', 'tiny-house-iab'],
    related: ['sonderabschreibung-7g', 'bewegliche-wirtschaftsgueter', 'investitionsabzugsbetrag', 'iab-frist'],
    intro:
      'Mit dem steuerlichen Investitionssofortprogramm, oft „Investitions-Booster“ genannt, hat der Gesetzgeber 2025 die degressive Abschreibung für bewegliche Wirtschaftsgüter zurückgebracht. Sie gilt befristet bis Ende 2027. Für Unternehmer, die einen IAB gebildet haben, ist das ein zusätzlicher Grund, die Investition gut zu planen.',
    sections: [
      {
        h: 'Lineare und degressive Abschreibung',
        p: [
          'Bei der **linearen Abschreibung** werden die Anschaffungskosten gleichmäßig über die betriebsgewöhnliche Nutzungsdauer verteilt. Ein Wirtschaftsgut für 50.000 € mit zehn Jahren Nutzungsdauer wird jedes Jahr mit 5.000 € abgeschrieben.',
          'Bei der **degressiven Abschreibung** wird jedes Jahr ein fester Prozentsatz vom jeweiligen Restbuchwert abgezogen. Dadurch sind die Abschreibungen in den ersten Jahren deutlich höher und sinken danach. Der Gesamtbetrag bleibt gleich, aber der Steuereffekt verlagert sich nach vorne.',
        ],
      },
      {
        h: 'Was der Investitions-Booster regelt',
        p: [
          'Für bewegliche Wirtschaftsgüter des Anlagevermögens, die **nach dem 30.6.2025 und vor dem 1.1.2028** angeschafft oder hergestellt werden, darf degressiv abgeschrieben werden. Der Satz beträgt höchstens das Dreifache des linearen Satzes und **maximal 30 %**. Bei einer Nutzungsdauer von zehn Jahren sind das 30 % im ersten Jahr statt 10 %.',
          'Ein späterer Wechsel von der degressiven zur linearen Abschreibung ist zulässig, und zwar dann, wenn die lineare Abschreibung des Restwerts höher ausfällt. Ein Wechsel in die andere Richtung ist nicht möglich.',
          'Für Elektrofahrzeuge sieht das Programm eine eigene Sonderregel mit einer hohen Abschreibung im Anschaffungsjahr vor. Ob diese für Ihr Fahrzeug infrage kommt und wie sie sich mit anderen Abschreibungen verträgt, sollten Sie mit Ihrem Steuerberater klären.',
        ],
      },
      {
        h: 'Nur bewegliche Wirtschaftsgüter, keine Gebäude',
        p: [
          'Die 30-%-Regel gilt ausschließlich für **bewegliche Wirtschaftsgüter des Anlagevermögens**: Maschinen, Fahrzeuge, PV-Module, Batteriespeicher, mobile Tiny Houses, Container. Für Gebäude und Wohnungsneubau gibt es eine eigene, davon getrennte degressive AfA nach § 7 Abs. 5a EStG mit anderen Sätzen und Voraussetzungen. Um diese geht es hier nicht.',
          'Was als beweglich gilt und wo die Grenze zu Gebäudebestandteilen verläuft, erklärt der Artikel [Bewegliche Wirtschaftsgüter](/ratgeber/bewegliche-wirtschaftsgueter).',
        ],
      },
      {
        h: 'Beispielrechnung: degressive AfA 2026',
        p: [
          'Ein Unternehmer kauft im Januar 2026 PV-Module für **100.000 € netto**, Nutzungsdauer laut AfA-Tabelle 20 Jahre. Linear wären das 5 % bzw. 5.000 € pro Jahr. Degressiv sind höchstens das Dreifache, also **15 %**, zulässig. Die 30-%-Grenze greift erst bei Nutzungsdauern von zehn Jahren und weniger.',
        ],
        list: [
          '2026: 15 % von 100.000 € = **15.000 €** (linear: 5.000 €)',
          '2027: 15 % vom Restwert 85.000 € = **12.750 €**',
          '2028: 15 % vom Restwert 72.250 € = **10.838 €**',
        ],
        after: [
          'In den ersten drei Jahren sind das rund 38.600 € statt 15.000 € Abschreibung. Hat der Unternehmer vorher einen IAB von 50.000 € gebildet, mindern sich die Anschaffungskosten auf 50.000 €, und die Prozentsätze wirken auf diesen Betrag, zusätzlich zur Sonderabschreibung von bis zu 40 %. Bei Anschaffung im Laufe des Jahres wird die AfA im ersten Jahr zeitanteilig gekürzt.',
        ],
      },
      {
        h: 'Kombination mit IAB und Sonderabschreibung',
        p: [
          'Die drei Instrumente greifen nacheinander. Vor der Investition mindert der IAB den Gewinn um bis zu 50 % der geplanten Kosten. Bei der Anschaffung werden die Anschaffungskosten entsprechend gekürzt. Auf die gekürzten Kosten wirken dann die [Sonderabschreibung von bis zu 40 %](/ratgeber/sonderabschreibung-7g) und die reguläre Abschreibung, die bis Ende 2027 degressiv erfolgen kann.',
          'Für ein Wirtschaftsgut mit längerer Nutzungsdauer bedeutet das: Ein sehr großer Teil der Anschaffungskosten kann innerhalb der ersten Jahre steuerlich geltend gemacht werden. Das verbessert die Liquidität, ändert aber nichts daran, dass die Investition sich auch wirtschaftlich tragen sollte.',
        ],
      },
      {
        h: 'Warum der Zeitpunkt jetzt wichtig ist',
        p: [
          'Die degressive Abschreibung ist an das **Anschaffungsdatum** gebunden. Wer erst 2028 anschafft, kann sie nach aktuellem Stand nicht mehr nutzen. Gleichzeitig läuft für viele Unternehmer die Frist eines IAB ab, der in den Jahren 2023 oder 2024 gebildet wurde. Für einen IAB aus 2024 endet die Frist am 31.12.2027, also genau mit dem Ende der degressiven Abschreibung.',
          'Wer seine Investition sauber plant, kann beide Fristen gleichzeitig nutzen. Lieferzeiten spielen dabei eine große Rolle: Maßgeblich ist der Übergang des wirtschaftlichen Eigentums, nicht die Bestellung. Unsere [Checkliste für die Investition vor dem Jahresende](/ratgeber/iab-checkliste-jahresende) hilft bei der Planung. Die Fristen aller IAB-Jahrgänge finden Sie im Ratgeber [IAB-Frist](/ratgeber/iab-frist).',
        ],
      },
      {
        h: 'Für welche Wirtschaftsgüter das besonders relevant ist',
        p: [
          'Je länger die Nutzungsdauer, desto stärker wirkt die degressive Abschreibung. Für [PV-Module](/photovoltaik-iab) oder [Ladeinfrastruktur](/ladeinfrastruktur-iab) mit langen Nutzungsdauern ist der Vorzieheffekt deutlich. Bei Wirtschaftsgütern mit kurzer Nutzungsdauer wie [Mining-Hardware](/krypto-mining-hardware-iab) ist der lineare Satz bereits hoch, sodass die degressive Variante kaum einen Unterschied macht oder gar nicht greift, weil die 30-%-Grenze erreicht ist.',
          'Die passende Kategorie für Ihr Budget finden Sie im [IAB-Rechner](/iab-rechner).',
        ],
      },
    ],
    faq: [
      {
        q: 'Bis wann gilt die degressive AfA von 30 %?',
        a: 'Nach aktuellem Stand für bewegliche Wirtschaftsgüter, die nach dem 30.6.2025 und vor dem 1.1.2028 angeschafft oder hergestellt werden. Maßgeblich ist das Anschaffungsdatum, also der Übergang des wirtschaftlichen Eigentums.',
      },
      {
        q: 'Kann ich degressive AfA und Sonderabschreibung nach § 7g kombinieren?',
        a: 'Ja. Die Sonderabschreibung nach § 7g Abs. 5 EStG kann neben der linearen und neben der degressiven Abschreibung in Anspruch genommen werden. Wie sich die Kombination in Ihrem Fall auswirkt, sollten Sie mit Ihrem Steuerberater durchrechnen.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'bewegliche-wirtschaftsgueter',
    title: 'Bewegliche Wirtschaftsgüter: Was für den IAB zählt',
    seoTitle: 'Bewegliche Wirtschaftsgüter für den IAB: Beispiele und Abgrenzung',
    description:
      'Welche Wirtschaftsgüter sind für den Investitionsabzugsbetrag begünstigt? Bewegliche Wirtschaftsgüter, Betriebsvorrichtungen und Scheinbestandteile erklärt, mit Beispielen von PV bis Tiny House.',
    teaser: 'PV-Module, Container, Tiny House oder Ladesäule: wann ein Wirtschaftsgut beweglich ist und wann nicht.',
    icon: '📦',
    categories: [
      'photovoltaik-iab',
      'batteriespeicher-iab',
      'tiny-house-iab',
      'wohnmobil-iab',
      'ladeinfrastruktur-iab',
      'mietcontainer-iab',
      'werbeflaechen-iab',
      'krypto-mining-hardware-iab',
    ],
    related: ['iab-voraussetzungen', 'iab-direktinvestment-betreibermodell', 'investitionsabzugsbetrag', 'iab-faq'],
    intro:
      'Der IAB gilt nur für abnutzbare bewegliche Wirtschaftsgüter. Das klingt eindeutig, ist es aber nicht immer. Ein Container ist beweglich, ein Bürogebäude nicht. Doch wie sieht es mit einem Tiny House, einer PV-Anlage auf dem Dach oder einer LED-Wand an einer Fassade aus? Dieser Artikel erklärt die Abgrenzung und geht die wichtigsten Kategorien einzeln durch.',
    sections: [
      {
        h: 'Was ein bewegliches Wirtschaftsgut ist',
        p: [
          'Steuerlich sind Wirtschaftsgüter beweglich, wenn sie keine Grundstücke, keine Gebäude und keine Gebäudeteile sind. Dazu zählen Maschinen, Fahrzeuge, Einrichtungsgegenstände und technische Anlagen. Entscheidend ist nicht, ob man das Wirtschaftsgut tatsächlich bewegt, sondern ob es rechtlich und wirtschaftlich eigenständig und nicht fester Bestandteil eines Gebäudes ist.',
          'Für den IAB muss das Wirtschaftsgut außerdem **abnutzbar** sein, also über eine begrenzte Nutzungsdauer abgeschrieben werden, und zum **Anlagevermögen** gehören. Ware, die zum Weiterverkauf bestimmt ist, ist nicht begünstigt. Immaterielle Wirtschaftsgüter wie Software, Lizenzen oder Patente sind ebenfalls ausgeschlossen.',
        ],
      },
      {
        h: 'Betriebsvorrichtungen und Scheinbestandteile',
        p: [
          'Zwei Begriffe helfen bei der Abgrenzung. **Betriebsvorrichtungen** sind Anlagen, die unmittelbar dem Betrieb dienen und nicht dem Gebäude, auch wenn sie fest eingebaut sind. Typische Beispiele sind Maschinen, Lastenaufzüge in Produktionshallen oder bestimmte technische Anlagen. Sie gelten steuerlich als bewegliche Wirtschaftsgüter.',
          '**Scheinbestandteile** sind Sachen, die nur zu einem vorübergehenden Zweck mit einem Grundstück oder Gebäude verbunden werden. Ein Container, der auf einem Grundstück abgestellt wird, oder eine Anlage, die nach Ablauf eines Mietvertrags wieder entfernt werden soll, kann ein Scheinbestandteil sein und bleibt damit beweglich.',
        ],
      },
      {
        h: 'Photovoltaik und Batteriespeicher',
        p: [
          '**Photovoltaikmodule** gelten nach Auffassung der Finanzverwaltung als eigenständige bewegliche Wirtschaftsgüter, auch wenn sie auf einem Dach oder in einem Solarpark montiert sind. Das macht [PV-Direktinvestments](/photovoltaik-iab) für den IAB interessant, bei denen Sie eigene, eindeutig zugeordnete Module in einem Park erwerben.',
          'Für **Batteriespeicher** gilt Ähnliches. Ein Speicher, der als eigenständige technische Einheit betrieben wird, etwa in einem Container-Großspeicher, ist in der Regel ein bewegliches Wirtschaftsgut. Mehr zur Kategorie finden Sie unter [Batteriespeicher mit IAB](/batteriespeicher-iab). Zu beachten ist allerdings: Kleine PV-Anlagen bis 30 kWp sind seit 2022 in vielen Fällen einkommensteuerfrei. Wo kein steuerpflichtiger Gewinn entsteht, ergibt ein IAB keinen Sinn.',
        ],
      },
      {
        h: 'Tiny Houses, Container und Wohnmobile',
        p: [
          'Bei **Tiny Houses** kommt es auf die Bauweise an. Ein Tiny House auf einem zugelassenen Trailer oder auf Kufen, das ohne größeren Aufwand versetzt werden kann, ist beweglich. Ein Haus auf einem festen Fundament mit dauerhaftem Anschluss an Ver- und Entsorgung kann dagegen als Gebäude gelten. Achten Sie bei [Tiny Houses für den IAB](/tiny-house-iab) deshalb auf die Mobilität und auf eine entsprechende Dokumentation.',
          '**Container** wie Büro-, Lager- oder Sanitärcontainer sind transportabel und in der Regel bewegliche Wirtschaftsgüter. Sie werden häufig über Vermietpools betrieben, siehe [Container und Modulräume](/mietcontainer-iab). **Wohnmobile** sind Fahrzeuge und damit klar beweglich. Hier liegt die Hürde nicht in der Abgrenzung, sondern in der 90-%-Nutzung, siehe [vermietete Wohnmobile](/wohnmobil-iab).',
        ],
      },
      {
        h: 'Ladesäulen, Werbeflächen und Mining-Hardware',
        p: [
          '**Ladesäulen und Wallboxen** sind technische Anlagen, die nicht dem Gebäude, sondern dem Laden von Fahrzeugen dienen. Sie gelten in der Regel als bewegliche Wirtschaftsgüter. Mehr dazu unter [Ladeinfrastruktur mit IAB](/ladeinfrastruktur-iab).',
          '**Digitale Werbeflächen** wie LED-Screens oder Stelen sind ebenfalls meist beweglich. Bei großen Anlagen mit eigenem Fundament oder Mast kann die Abgrenzung im Einzelfall schwieriger sein, siehe [digitale Werbeflächen](/werbeflaechen-iab). **Mining-Hardware** wie ASIC-Miner ist klar beweglich. Hier stellen sich eher Fragen zur Nutzungsdauer und zum Standort, siehe [Bitcoin-Miner und Krypto-Hardware](/krypto-mining-hardware-iab).',
        ],
      },
      {
        h: 'Neu oder gebraucht?',
        p: [
          'Seit 2008 sind auch **gebrauchte** bewegliche Wirtschaftsgüter für den IAB begünstigt. Das kann bei kurzen Fristen helfen, weil gebrauchte Güter oft sofort verfügbar sind. Achten Sie aber auf die Restnutzungsdauer und darauf, dass die 90-%-Nutzung im Anschaffungs- und Folgejahr sichergestellt ist.',
          'Bei Investitionen in Betreibermodelle ist außerdem wichtig, dass Sie das Wirtschaftsgut tatsächlich erwerben und es Ihnen eindeutig zugeordnet ist, etwa über Seriennummern. Welche Unterlagen dafür sinnvoll sind, beschreibt der Artikel [IAB-Direktinvestments und Betreibermodelle](/ratgeber/iab-direktinvestment-betreibermodell).',
        ],
      },
    ],
    faq: [
      {
        q: 'Ist Software für den IAB begünstigt?',
        a: 'Nein. Software ist ein immaterielles Wirtschaftsgut und für den IAB nicht begünstigt. Begünstigt sind nur abnutzbare bewegliche Wirtschaftsgüter des Anlagevermögens.',
      },
      {
        q: 'Ist ein Tiny House ein bewegliches Wirtschaftsgut?',
        a: 'Ein Tiny House auf einem Trailer oder auf Kufen, das ohne größeren Aufwand versetzt werden kann, gilt in der Regel als bewegliches Wirtschaftsgut. Ein Tiny House auf festem Fundament kann dagegen als Gebäude eingestuft werden und ist dann nicht begünstigt.',
      },
      {
        q: 'Sind PV-Module in einem Solarpark für den IAB begünstigt?',
        a: 'PV-Module gelten in der Regel als eigenständige bewegliche Wirtschaftsgüter, auch wenn sie in einem Solarpark montiert sind. Wichtig ist, dass Sie die Module tatsächlich erwerben und sie Ihnen eindeutig zugeordnet sind.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'iab-direktinvestment-betreibermodell',
    title: 'IAB-Direktinvestments und Betreibermodelle',
    seoTitle: 'IAB-Direktinvestment & Betreibermodell: So funktioniert es, darauf achten',
    description:
      'Wie funktionieren Direktinvestments und Betreibermodelle für den Investitionsabzugsbetrag? Eigentum, Miet- und Betreiberverträge, Risiken und Fragen, die Sie jedem Anbieter stellen sollten.',
    teaser: 'Kaufen, vermieten, Erträge erhalten: wie Betreibermodelle funktionieren und welche Fragen Sie jedem Anbieter stellen sollten.',
    icon: '🤝',
    categories: ['photovoltaik-iab', 'mietcontainer-iab', 'tiny-house-iab', 'batteriespeicher-iab', 'werbeflaechen-iab'],
    related: ['bewegliche-wirtschaftsgueter', 'iab-voraussetzungen', 'iab-checkliste-jahresende', 'investitionsabzugsbetrag'],
    intro:
      'Nicht jeder Betrieb hat eine passende Investition in der Schublade, wenn die IAB-Frist näher rückt. Für diesen Fall gibt es Direktinvestments: Sie kaufen ein bewegliches Wirtschaftsgut, und ein Betreiber kümmert sich um Nutzung und Vermietung. Das kann eine sinnvolle Lösung sein, setzt aber voraus, dass Sie das Modell verstehen. Dieser Artikel erklärt die Grundzüge und gibt Ihnen Fragen an die Hand, die Sie jedem Anbieter stellen sollten.',
    sections: [
      {
        h: 'Wie ein Betreibermodell funktioniert',
        p: [
          'Bei einem Direktinvestment erwerben Sie ein konkretes Wirtschaftsgut, zum Beispiel ein Paket [PV-Module](/photovoltaik-iab), mehrere [Container](/mietcontainer-iab) oder ein [Tiny House](/tiny-house-iab). Das Wirtschaftsgut gehört anschließend Ihnen und wird in Ihrem Betriebsvermögen aktiviert.',
          'Parallel schließen Sie mit einem Betreiber einen Miet-, Pacht- oder Betreibervertrag. Der Betreiber nutzt das Wirtschaftsgut, vermietet es weiter oder vermarktet seine Leistung, etwa den Strom einer PV-Anlage oder die Kapazität eines [Batteriespeichers](/batteriespeicher-iab). Sie erhalten dafür eine feste Miete oder eine Beteiligung an den Erlösen. Manche Anbieter bieten am Ende der Laufzeit einen Rückkauf an.',
        ],
      },
      {
        h: 'Eigentum muss eindeutig sein',
        p: [
          'Für den IAB ist entscheidend, dass Sie tatsächlich **wirtschaftlicher Eigentümer** eines bestimmten Wirtschaftsguts werden. Eine bloße Beteiligung an einer Gesellschaft, die ihrerseits die Anlagen besitzt, ist kein Erwerb eines beweglichen Wirtschaftsguts und für den IAB nicht geeignet.',
          'Achten Sie deshalb auf eine eindeutige Zuordnung: einen Kaufvertrag über konkret bezeichnete Gegenstände, Seriennummern oder Anlagenlisten und ein Übergabe- oder Lieferprotokoll mit Datum. Das Datum ist wichtig, weil es den Zeitpunkt der Anschaffung und damit die Einhaltung der [IAB-Frist](/ratgeber/iab-frist) dokumentiert.',
        ],
      },
      {
        h: 'Vermietung erfüllt die Nutzungsvoraussetzung',
        p: [
          'Seit 2020 ist gesetzlich klargestellt, dass auch vermietete Wirtschaftsgüter für den IAB begünstigt sind. Der Miet- oder Betreibervertrag sollte mindestens das Jahr der Anschaffung und das gesamte Folgejahr abdecken, denn in diesem Zeitraum muss die Nutzungsvoraussetzung erfüllt sein. Endet die Vermietung früher, droht die rückwirkende Korrektur von IAB und [Sonderabschreibung](/ratgeber/sonderabschreibung-7g).',
          'Klären Sie außerdem mit Ihrem Steuerberater, ob das Wirtschaftsgut zu Ihrem Betrieb passt. Für Freiberufler und Personengesellschaften kann die Vermietung von Wirtschaftsgütern steuerliche Folgen für den gesamten Betrieb haben. Mehr dazu im Artikel [IAB für GmbH, Freiberufler und Einzelunternehmer](/ratgeber/iab-rechtsform-gmbh-freiberufler).',
        ],
      },
      {
        h: 'Risiken realistisch einschätzen',
        p: [
          'Ein Steuervorteil ersetzt keine wirtschaftlich tragfähige Investition. Prüfen Sie jedes Modell so, als gäbe es den IAB nicht. Die wichtigsten Risiken:',
        ],
        list: [
          '**Betreiberrisiko:** Fällt der Betreiber aus, fehlen die Mieteinnahmen. Sie besitzen dann zwar das Wirtschaftsgut, müssen sich aber selbst um Nutzung oder Verwertung kümmern.',
          '**Ertragsrisiko:** Erlöse aus Stromhandel, Vermietung oder Werbung schwanken. Renditeangaben stammen von den Anbietern und sind nicht garantiert.',
          '**Wertrisiko:** Technische Güter verlieren an Wert. Ein Rückkaufversprechen ist nur so viel wert wie die Bonität des Anbieters.',
          '**Liquiditätsrisiko:** Direktinvestments lassen sich oft nicht kurzfristig verkaufen.',
        ],
        after: [
          'Manche Direktinvestments mit festen Miet- oder Rückkaufzusagen können als Vermögensanlage gelten und unterliegen dann besonderen Prospekt- und Informationspflichten. Fragen Sie den Anbieter, wie das Angebot rechtlich eingeordnet ist.',
        ],
      },
      {
        h: 'Fragen, die Sie jedem Anbieter stellen sollten',
        p: ['Diese Fragen helfen Ihnen, Angebote vergleichbar zu machen. Lassen Sie sich die Antworten schriftlich geben:'],
        list: [
          'Welches konkrete Wirtschaftsgut erwerbe ich, und wie ist es mir zugeordnet?',
          'Wann geht das wirtschaftliche Eigentum über, und ist der Termin vertraglich zugesichert?',
          'Wie lange läuft der Miet- oder Betreibervertrag, und wer kann ihn kündigen?',
          'Wie werden die Erträge berechnet, und auf welchen Annahmen beruhen sie?',
          'Wer trägt Versicherung, Wartung und Reparaturen?',
          'Was passiert bei Insolvenz des Betreibers?',
          'Gibt es einen Rückkauf, und zu welchen Bedingungen?',
          'Welche Unterlagen erhalte ich für meine Buchhaltung und meinen Steuerberater?',
        ],
      },
      {
        h: 'Wie iab.investments dabei hilft',
        p: [
          'Wir stellen den Kontakt zu Anbietern von beweglichen Wirtschaftsgütern her und helfen Ihnen, die passende Kategorie für Ihren Betrag, Ihre Frist und Ihr Ziel zu finden. Zu konkreten Angeboten beraten wir nicht, und wir leisten keine Steuerberatung. Wie das im Einzelnen abläuft, lesen Sie auf der Seite [So funktioniert iab.investments](/so-funktionierts).',
          'Einen schnellen Überblick über die Kategorien und ihre Einstiegsbeträge gibt Ihnen der [IAB-Rechner](/iab-rechner). Welche Wirtschaftsgüter grundsätzlich infrage kommen, zeigt der Artikel [Bewegliche Wirtschaftsgüter für den IAB](/ratgeber/bewegliche-wirtschaftsgueter).',
        ],
      },
    ],
    faq: [
      {
        q: 'Kann ich mit einem IAB in einen Fonds investieren?',
        a: 'Nein. Eine Beteiligung an einem Fonds oder einer Gesellschaft ist kein Erwerb eines beweglichen Wirtschaftsguts. Für den IAB müssen Sie selbst wirtschaftlicher Eigentümer eines konkreten Wirtschaftsguts werden.',
      },
      {
        q: 'Wie lange muss ein Betreibervertrag mindestens laufen?',
        a: 'Steuerlich muss das Wirtschaftsgut im Jahr der Anschaffung und im gesamten Folgejahr vermietet oder betrieblich genutzt werden. Der Vertrag sollte diesen Zeitraum mindestens abdecken. Viele Betreibermodelle laufen wirtschaftlich deutlich länger.',
      },
      {
        q: 'Sind die Renditeangaben der Anbieter garantiert?',
        a: 'Nein. Renditeangaben stammen von den Anbietern und beruhen auf Annahmen, etwa zu Auslastung oder Strompreisen. Lassen Sie sich die Annahmen erklären und prüfen Sie, was passiert, wenn sie nicht eintreten.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'iab-rechtsform-gmbh-freiberufler',
    title: 'IAB für GmbH, Freiberufler und Einzelunternehmer',
    seoTitle: 'IAB in GmbH, GbR, für Freiberufler und Einzelunternehmer: Unterschiede',
    description:
      'Wie wirkt der Investitionsabzugsbetrag je nach Rechtsform? IAB in der GmbH, in Personengesellschaften, für Freiberufler und Einzelunternehmer, mit Hinweisen zu Gewerbesteuer und Abfärbung.',
    teaser: 'Einzelunternehmen, GbR, GmbH oder freier Beruf: wie stark der IAB wirkt und wo Fallstricke liegen.',
    icon: '🏢',
    categories: ['wohnmobil-iab', 'ladeinfrastruktur-iab', 'mietcontainer-iab'],
    related: ['iab-voraussetzungen', 'investitionsabzugsbetrag', 'iab-direktinvestment-betreibermodell', 'iab-faq'],
    intro:
      'Der IAB steht allen Betrieben mit Gewinneinkünften offen, unabhängig von der Rechtsform. Wie stark er wirkt und worauf Sie achten müssen, hängt aber sehr wohl davon ab, ob Sie als Einzelunternehmer, als Freiberufler, in einer Personengesellschaft oder über eine GmbH investieren.',
    sections: [
      {
        h: 'Einzelunternehmer: der stärkste Hebel',
        p: [
          'Für Einzelunternehmer wirkt der IAB in der Regel am stärksten. Der Gewinn unterliegt der Einkommensteuer mit einem Grenzsteuersatz von bis zu 42 % bzw. 45 % zuzüglich Solidaritätszuschlag und gegebenenfalls Kirchensteuer. Ein IAB von 50.000 € kann die Steuerlast im Jahr der Bildung entsprechend deutlich senken.',
          'Weil Gewerbetreibende zusätzlich Gewerbesteuer zahlen, mindert der IAB auch den Gewerbeertrag. Die Gewerbesteuer wird zwar zu einem großen Teil auf die Einkommensteuer angerechnet, der Liquiditätseffekt bleibt aber spürbar.',
        ],
      },
      {
        h: 'Freiberufler: Vorsicht bei Vermietung',
        p: [
          'Freiberufler wie Ärzte, Architekten, Berater oder Rechtsanwälte können den IAB ebenso nutzen. Für Investitionen im eigenen Betrieb, etwa in Praxisausstattung oder Fahrzeuge, ist das unproblematisch.',
          'Anders kann es bei Investitionen in Wirtschaftsgüter aussehen, die vermietet werden. Eine gewerbliche Vermietungstätigkeit passt nicht ohne Weiteres zu einer freiberuflichen Praxis. Bei Personengesellschaften von Freiberuflern kann eine gewerbliche Tätigkeit sogar auf die gesamten Einkünfte **abfärben** und diese gewerbesteuerpflichtig machen. Ob und wie ein Betreibermodell für Sie infrage kommt, sollte deshalb unbedingt vorab mit dem Steuerberater geklärt werden. Hintergründe zu Betreibermodellen finden Sie im Artikel [IAB-Direktinvestments und Betreibermodelle](/ratgeber/iab-direktinvestment-betreibermodell).',
        ],
      },
      {
        h: 'Personengesellschaften: GbR, OHG, KG',
        p: [
          'Bei Personengesellschaften wird der IAB auf Ebene der Gesellschaft gebildet und mindert den gemeinsamen Gewinn. Die Gewinngrenze von 200.000 € gilt für den Betrieb der Gesellschaft insgesamt, nicht für jeden Gesellschafter einzeln. Bei Gesellschaften mit mehreren Gesellschaftern ist die Grenze deshalb schneller erreicht.',
          'Ein IAB kann außerdem für Wirtschaftsgüter im Sonderbetriebsvermögen eines Gesellschafters gebildet werden. Die Rechtsprechung stellt hier strenge Anforderungen daran, in welchem Vermögensbereich der IAB gebildet und die Investition vorgenommen wird. Das sollte sorgfältig geplant werden.',
        ],
      },
      {
        h: 'GmbH und UG',
        p: [
          'Auch eine GmbH oder UG kann einen IAB bilden, sofern ihr Gewinn die Grenze von 200.000 € nicht überschreitet. Der Effekt ist geringer als bei Einzelunternehmern, weil die Steuerbelastung einer Kapitalgesellschaft aus Körperschaftsteuer, Solidaritätszuschlag und Gewerbesteuer zusammen meist bei rund 30 % liegt. Ein IAB von 50.000 € stundet also etwa 15.000 €.',
          'Für eine GmbH kann der IAB trotzdem interessant sein, etwa um Liquidität für die Investition zu schaffen oder um Gewinnschwankungen zu glätten. Zu beachten ist, dass der Körperschaftsteuersatz nach aktuellem Stand ab 2028 schrittweise sinken soll. Ein Steueraufschub in Jahre mit niedrigerem Satz kann dann einen zusätzlichen Vorteil bringen.',
        ],
      },
      {
        h: 'Land- und Forstwirte',
        p: [
          'Land- und Forstwirte können den IAB ebenfalls nutzen. Seit 2020 gilt auch für sie die einheitliche Gewinngrenze von 200.000 €. Viele landwirtschaftliche Betriebe nutzen den IAB für Maschinen. Daneben sind Anlagen wie Agri-PV, Batteriespeicher oder Ladeinfrastruktur auf dem Hof denkbar.',
          'Eine Übersicht über geeignete Wirtschaftsgüter finden Sie im Artikel [Bewegliche Wirtschaftsgüter für den IAB](/ratgeber/bewegliche-wirtschaftsgueter).',
        ],
      },
      {
        h: 'Welche Investition zu welcher Rechtsform passt',
        p: [
          'Grundsätzlich gilt: Je näher die Investition am eigenen Betrieb liegt, desto einfacher ist sie steuerlich. Ein [Wohnmobil](/wohnmobil-iab) für eine Vermietstation, [Ladepunkte](/ladeinfrastruktur-iab) für Kunden und Mitarbeiter oder [Container](/mietcontainer-iab) als Lager oder Büro passen zu vielen Betrieben gut.',
          'Wenn keine Investition für den eigenen Betrieb ansteht, kommen Betreibermodelle infrage. Bei Freiberuflern und Personengesellschaften sollte die Wahl hier besonders sorgfältig mit dem Steuerberater abgestimmt werden. Mit dem [IAB-Rechner](/iab-rechner) sehen Sie in 30 Sekunden, welche Kategorien zu Ihrem Betrag passen.',
        ],
      },
    ],
    faq: [
      {
        q: 'Kann eine GmbH einen Investitionsabzugsbetrag bilden?',
        a: 'Ja. Seit 2020 gilt für alle Betriebe einschließlich Kapitalgesellschaften eine einheitliche Gewinngrenze von 200.000 €. Der Effekt ist bei einer GmbH geringer als bei Einzelunternehmern, weil die Steuerbelastung meist bei rund 30 % liegt.',
      },
      {
        q: 'Mindert der IAB auch die Gewerbesteuer?',
        a: 'Ja. Der IAB mindert den Gewinn und damit auch den Gewerbeertrag. Bei Einzelunternehmern und Personengesellschaften wird die Gewerbesteuer zu einem großen Teil auf die Einkommensteuer angerechnet.',
      },
      {
        q: 'Dürfen Freiberufler mit dem IAB in Betreibermodelle investieren?',
        a: 'Grundsätzlich ja, aber eine gewerbliche Vermietungstätigkeit kann steuerliche Folgen für die freiberufliche Tätigkeit haben, bei Personengesellschaften bis hin zur Abfärbung auf alle Einkünfte. Das sollte vorab mit dem Steuerberater geklärt werden.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'iab-checkliste-jahresende',
    title: 'Checkliste: IAB-Investition vor dem Jahresende',
    seoTitle: 'IAB-Checkliste Jahresende: Frist sicher einhalten (Lieferung, Rechnung, Nachweise)',
    description:
      'Die IAB-Frist endet am 31.12.? Mit dieser Checkliste planen Sie Investition, Lieferung, Rechnung und Nachweise rechtzeitig und vermeiden Rückgängigmachung und Zinsen.',
    teaser: 'Schritt für Schritt zur rechtzeitigen Investition: Lieferzeiten, Anschaffungszeitpunkt, Rechnung und Nachweise.',
    icon: '📋',
    categories: ['ladeinfrastruktur-iab', 'mietcontainer-iab', 'krypto-mining-hardware-iab', 'wohnmobil-iab'],
    related: ['iab-frist', 'iab-direktinvestment-betreibermodell', 'degressive-afa-investitionsbooster', 'iab-voraussetzungen'],
    intro:
      'Jedes Jahr im Herbst stellen viele Unternehmer fest, dass ein IAB zum Jahresende ausläuft. Dann wird es oft hektisch. Mit dieser Checkliste gehen Sie Schritt für Schritt vor und vermeiden die typischen Fehler, die zur Rückgängigmachung des IAB führen.',
    sections: [
      {
        h: '1. Frist und Betrag bestimmen',
        p: [
          'Klären Sie zuerst, welcher IAB wann ausläuft. Bei kalendergleichem Wirtschaftsjahr endet die Frist für einen IAB aus 2023 am 31.12.2026, für einen IAB aus 2024 am 31.12.2027. Bei einem abweichenden Wirtschaftsjahr gelten andere Daten. Die aktuelle Fristen-Tabelle finden Sie im Ratgeber [IAB-Frist](/ratgeber/iab-frist).',
          'Prüfen Sie dann den Betrag. Weil der IAB höchstens 50 % der Anschaffungskosten betragen darf, müssen Sie mindestens das **Doppelte des IAB** investieren, um ihn vollständig zu verwenden. Bei einem IAB von 40.000 € sind das 80.000 € netto. Investieren Sie weniger, wird der nicht genutzte Teil rückgängig gemacht.',
        ],
      },
      {
        h: '2. Passende Kategorie wählen',
        p: [
          'Überlegen Sie, ob eine Investition für den eigenen Betrieb ansteht. Das ist steuerlich meist die einfachste Lösung. Wenn nicht, kommen Wirtschaftsgüter infrage, die vermietet oder über einen Betreiber genutzt werden. Kurz vor Fristende zählen vor allem Lieferfähigkeit und ein klarer Anschaffungszeitpunkt.',
          'Kurze Lieferzeiten gibt es oft bei [Ladeinfrastruktur](/ladeinfrastruktur-iab), [Containern](/mietcontainer-iab) und [Mining-Hardware](/krypto-mining-hardware-iab). Bei [Wohnmobilen](/wohnmobil-iab) hängt es davon ab, ob Fahrzeuge auf Lager sind. Einen Überblick nach Budget und Ziel gibt der [IAB-Rechner](/iab-rechner).',
        ],
      },
      {
        h: '3. Lieferzeit und Anschaffungszeitpunkt absichern',
        p: [
          'Für die Frist zählt die **Anschaffung**, also der Zeitpunkt, an dem Sie das wirtschaftliche Eigentum erlangen. Das ist in der Regel die Lieferung bzw. Übergabe, nicht die Bestellung und nicht die Zahlung. Eine Anzahlung im Dezember reicht nicht, wenn die Ware erst im Januar kommt.',
          'Lassen Sie sich den Liefer- oder Übergabetermin deshalb vertraglich zusichern und planen Sie einen Puffer ein. Im Dezember sind Lieferketten und Speditionen oft ausgelastet, und viele Betriebe machen zwischen den Jahren Pause.',
        ],
      },
      {
        h: '4. Unterlagen vollständig sammeln',
        p: ['Für Ihre Buchhaltung und eine mögliche Prüfung durch das Finanzamt sollten Sie folgende Unterlagen haben:'],
        list: [
          'Kaufvertrag oder Auftragsbestätigung mit genauer Bezeichnung des Wirtschaftsguts',
          'Rechnung mit Nettobetrag und ausgewiesener Umsatzsteuer',
          'Liefer- oder Übergabeprotokoll mit Datum',
          'Seriennummern oder Anlagenliste bei Direktinvestments',
          'Miet- oder Betreibervertrag, falls das Wirtschaftsgut vermietet wird',
          'Nachweis über die betriebliche Nutzung, bei Fahrzeugen ein Fahrtenbuch',
        ],
      },
      {
        h: '5. Nutzung für zwei Jahre sicherstellen',
        p: [
          'Mit der Anschaffung ist der IAB noch nicht endgültig gesichert. Im Jahr der Anschaffung und im Folgejahr muss das Wirtschaftsgut vermietet oder zu mindestens 90 % betrieblich genutzt werden. Ein Verkauf, eine Entnahme oder eine überwiegend private Nutzung in diesem Zeitraum führen zur rückwirkenden Korrektur.',
          'Bei Betreibermodellen sollte der Vertrag diese Zeit mindestens abdecken. Mehr dazu im Artikel [IAB-Direktinvestments und Betreibermodelle](/ratgeber/iab-direktinvestment-betreibermodell).',
        ],
      },
      {
        h: '6. Steuerberater frühzeitig einbinden',
        p: [
          'Ihr Steuerberater kennt Ihre Zahlen und kann einschätzen, ob die geplante Investition zu Ihrem Betrieb passt, wie sich IAB, [Sonderabschreibung](/ratgeber/sonderabschreibung-7g) und gegebenenfalls die [degressive Abschreibung](/degressive-afa-bewegliche-wirtschaftsgueter) auswirken und ob eine Teilverwendung oder eine freiwillige Rückgängigmachung sinnvoller ist.',
          'Wer früh plant, hat mehr Auswahl. Wer erst im Dezember sucht, muss oft nehmen, was noch lieferbar ist.',
        ],
      },
      {
        h: 'Und wenn es nicht mehr klappt?',
        p: [
          'Wenn absehbar ist, dass keine passende Investition rechtzeitig erfolgt, können Sie den IAB auch [freiwillig vorzeitig auflösen](/iab-aufloesen). Die Steuernachzahlung fällt dann ebenfalls an, aber der Zinslauf lässt sich unter Umständen begrenzen. Ob das sinnvoll ist, klären Sie mit Ihrem Steuerberater.',
          'Wenn Sie noch Zeit haben, lohnt sich ein Blick auf die verfügbaren Kategorien. Über unser [Anfrageformular](/so-funktionierts#anfrage) melden sich passende Anbieter bei Ihnen, kostenlos und unverbindlich.',
        ],
      },
    ],
    faq: [
      {
        q: 'Reicht eine Bestellung im Dezember, um die IAB-Frist einzuhalten?',
        a: 'In der Regel nicht. Entscheidend ist die Anschaffung, also der Übergang des wirtschaftlichen Eigentums mit Lieferung oder Übergabe. Eine Bestellung oder Anzahlung allein genügt meist nicht.',
      },
      {
        q: 'Wie viel muss ich investieren, um meinen IAB voll zu nutzen?',
        a: 'Mindestens das Doppelte des IAB, weil der IAB höchstens 50 % der Anschaffungskosten betragen darf. Bei einem IAB von 40.000 € sind also mindestens 80.000 € netto nötig.',
      },
      {
        q: 'Kann ich einen IAB freiwillig rückgängig machen?',
        a: 'Ja, ein IAB kann auch vor Ablauf der Frist freiwillig rückgängig gemacht werden. Die Steuer wird dann nachgezahlt, der Zinslauf lässt sich unter Umständen begrenzen. Klären Sie das mit Ihrem Steuerberater.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Wissenswertes: broader topics around investing and taxes
  // ─────────────────────────────────────────────────────────────
  {
    slug: 'photovoltaik-investment',
    group: 'wissenswertes',
    title: 'Photovoltaik-Investment: So funktioniert es',
    seoTitle: 'Photovoltaik-Investment für Unternehmer: Modelle, Erträge, Risiken',
    description:
      'Wie funktioniert ein Photovoltaik-Investment für Unternehmer? Direktinvestment in PV-Module, Einnahmequellen, Kosten, Abschreibung und Risiken verständlich erklärt.',
    teaser: 'Module kaufen, Strom verkaufen lassen: wie PV-Direktinvestments funktionieren und worauf es bei Erträgen und Risiken ankommt.',
    icon: '☀️',
    categories: ['photovoltaik-iab', 'batteriespeicher-iab'],
    related: ['iab-photovoltaik', 'batteriespeicher-investment', 'iab-direktinvestment-betreibermodell', 'degressive-afa-investitionsbooster'],
    intro:
      'Photovoltaik gehört zu den bekanntesten Sachwertinvestitionen für Unternehmer. Statt eine Anlage auf das eigene Dach zu setzen, können Sie auch Module in einem größeren Solarpark oder auf fremden Dächern erwerben und von einem Betreiber bewirtschaften lassen. Dieser Artikel erklärt, wie solche Modelle aufgebaut sind, woher die Erträge kommen und welche Risiken Sie kennen sollten.',
    sections: [
      {
        h: 'Zwei Wege: eigene Anlage oder Direktinvestment',
        p: [
          'Bei einer **eigenen Anlage** installieren Sie Module auf Ihrem Betriebsgebäude und nutzen den Strom selbst oder speisen ihn ein. Sie kümmern sich um Planung, Netzanschluss und Betrieb oder beauftragen einen Installateur.',
          'Bei einem **Direktinvestment** kaufen Sie ein konkret bezeichnetes Paket von [PV-Modulen](/photovoltaik-iab) in einer bestehenden oder geplanten Anlage. Ein Betreiber pachtet oder mietet die Module, verkauft den Strom und zahlt Ihnen eine feste Pacht oder eine Beteiligung an den Erlösen. Sie werden Eigentümer der Module, müssen sich aber nicht um den Betrieb kümmern. Wie solche Betreibermodelle allgemein funktionieren, erklärt der Artikel [IAB-Direktinvestments und Betreibermodelle](/ratgeber/iab-direktinvestment-betreibermodell).',
        ],
      },
      {
        h: 'Woher die Erträge kommen',
        p: ['Eine PV-Anlage verdient Geld mit dem erzeugten Strom. Je nach Modell gibt es unterschiedliche Erlösquellen:'],
        list: [
          '**Einspeisevergütung:** ein gesetzlich festgelegter Preis pro Kilowattstunde, meist für kleinere Anlagen. Seit dem Solarspitzengesetz von 2025 erhalten neue Anlagen in Zeiten negativer Börsenstrompreise keine Vergütung.',
          '**Direktvermarktung:** Der Strom wird an der Börse verkauft. Dazu kommt die Marktprämie, wenn der Börsenpreis unter dem anzulegenden Wert liegt.',
          '**Stromlieferverträge (PPA):** Ein Abnehmer kauft den Strom über viele Jahre zu einem vereinbarten Preis.',
          '**Feste Pacht:** Bei vielen Direktinvestments zahlt der Betreiber eine fixe Pacht, unabhängig vom Stromertrag. Das Ertragsrisiko liegt dann beim Betreiber, Sie tragen dafür sein Ausfallrisiko.',
        ],
      },
      {
        h: 'Kosten und Abschreibung',
        p: [
          'Neben dem Kaufpreis fallen laufende Kosten an: Flächenpacht, Wartung, Versicherung, Direktvermarktung und Verwaltung. Bei Betreibermodellen sind diese Kosten oft in der Pacht verrechnet. Lassen Sie sich genau aufschlüsseln, was enthalten ist. Alle Beträge auf iab.investments sind netto.',
          'PV-Anlagen werden laut amtlicher AfA-Tabelle in der Regel über **20 Jahre** abgeschrieben. Für bewegliche Wirtschaftsgüter, die zwischen Juli 2025 und Ende 2027 angeschafft werden, ist zusätzlich die [degressive Abschreibung von bis zu 30 %](/degressive-afa-bewegliche-wirtschaftsgueter) möglich. Wie sich ein Investitionsabzugsbetrag auf eine PV-Investition auswirkt, lesen Sie im Artikel [IAB für Photovoltaik](/iab-photovoltaik).',
        ],
      },
      {
        h: 'Risiken realistisch einschätzen',
        p: ['Photovoltaik gilt als etablierte Technik, ist aber kein risikoloses Investment:'],
        list: [
          '**Preisrisiko:** Börsenstrompreise schwanken, und zur Mittagszeit sinken sie bei viel Solarstrom immer häufiger stark ab.',
          '**Ertragsrisiko:** Sonnenstunden, Verschattung und die jährliche Leistungsminderung der Module beeinflussen die Strommenge.',
          '**Betreiberrisiko:** Fällt der Betreiber aus, fehlen Pacht oder Erlöse.',
          '**Standortrisiko:** Netzanschluss, Flächenpacht und Genehmigungen müssen für die ganze Laufzeit gesichert sein.',
        ],
        after: [
          'Renditeangaben stammen von den Anbietern und sind nicht garantiert. Prüfen Sie jedes Angebot so, als gäbe es keinen Steuervorteil.',
        ],
      },
      {
        h: 'PV-Angebote finden',
        p: [
          'Unter [Aktuelle Projekte](/angebote) finden Sie Projekte für [PV-Direktinvestments](/photovoltaik-iab) mit Einstiegspreis und Eckdaten. Viele Anbieter kombinieren Module inzwischen mit [Batteriespeichern](/ratgeber/batteriespeicher-investment), um Strom in teure Abendstunden zu verschieben. Wir stellen den Kontakt zu Anbietern her und beraten nicht zu konkreten Angeboten.',
        ],
      },
    ],
    faq: [
      {
        q: 'Werde ich bei einem PV-Direktinvestment Eigentümer der Module?',
        a: 'Bei einem echten Direktinvestment ja: Sie kaufen konkret bezeichnete Module, die Ihnen zugeordnet sind. Bei einer Beteiligung an einer Gesellschaft oder einem Fonds sind Sie dagegen nur Gesellschafter. Lassen Sie sich die Zuordnung im Kaufvertrag zeigen.',
      },
      {
        q: 'Über wie viele Jahre wird eine PV-Anlage abgeschrieben?',
        a: 'Laut amtlicher AfA-Tabelle in der Regel über 20 Jahre linear. Für Anschaffungen von Juli 2025 bis Ende 2027 kommt die degressive Abschreibung von bis zu 30 % in Betracht. Welche Variante für Sie günstiger ist, klären Sie mit Ihrem Steuerberater.',
      },
      {
        q: 'Was passiert bei negativen Strompreisen?',
        a: 'Neue Anlagen erhalten seit 2025 in Stunden mit negativen Börsenpreisen keine Einspeisevergütung. Bei Direktvermarktung wird die Anlage in solchen Zeiten oft abgeregelt. Fragen Sie den Anbieter, wie diese Stunden in der Ertragsprognose berücksichtigt sind.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'batteriespeicher-investment',
    group: 'wissenswertes',
    title: 'Batteriespeicher-Investment: Chancen und Risiken',
    seoTitle: 'Batteriespeicher als Investment: Erlösquellen, Risiken, Abschreibung',
    description:
      'Wie verdienen Batteriespeicher Geld? Stromhandel, Regelenergie und Betreibermodelle für Unternehmer erklärt, mit den wichtigsten Risiken und Fragen an Anbieter.',
    teaser: 'Strom günstig laden, teuer verkaufen: wie Großspeicher Erlöse erzielen und welche Risiken dabei zählen.',
    icon: '🔋',
    categories: ['batteriespeicher-iab', 'photovoltaik-iab'],
    related: ['photovoltaik-investment', 'iab-direktinvestment-betreibermodell', 'bewegliche-wirtschaftsgueter', 'iab-photovoltaik'],
    intro:
      'Je mehr Solar- und Windstrom im Netz ist, desto stärker schwanken die Strompreise im Tagesverlauf. Batteriespeicher nutzen genau diese Schwankungen: Sie laden, wenn Strom günstig ist, und geben ihn ab, wenn er teuer ist. Für Unternehmer gibt es Betreibermodelle, bei denen Sie Speichermodule erwerben und ein Betreiber sie vermarktet. Dieser Artikel erklärt, wie das funktioniert und worauf Sie achten sollten.',
    sections: [
      {
        h: 'Wie ein Speicher-Direktinvestment aufgebaut ist',
        p: [
          'Sie kaufen eine konkret bezeichnete Speichereinheit, zum Beispiel einen Batteriecontainer oder Module in einem größeren Speicherpark. Ein Betreiber übernimmt Netzanschluss, Steuerung und Vermarktung und zahlt Ihnen eine feste Miete oder einen Anteil an den Erlösen. Das Grundprinzip entspricht anderen Betreibermodellen, die wir im Artikel [IAB-Direktinvestments und Betreibermodelle](/ratgeber/iab-direktinvestment-betreibermodell) beschreiben.',
        ],
      },
      {
        h: 'Die wichtigsten Erlösquellen',
        p: ['Großspeicher kombinieren meist mehrere Einnahmequellen, um möglichst viele Stunden des Jahres Geld zu verdienen:'],
        list: [
          '**Stromhandel (Arbitrage):** Laden bei niedrigen, Entladen bei hohen Preisen am Day-Ahead- und Intraday-Markt.',
          '**Regelenergie:** Netzbetreiber bezahlen Speicher dafür, dass sie Leistung bereithalten, um Frequenzschwankungen auszugleichen.',
          '**Kombination mit Photovoltaik:** Ein Speicher am Solarpark verschiebt Mittagsstrom in die teureren Abendstunden. Mehr dazu im Artikel [Photovoltaik-Investment](/ratgeber/photovoltaik-investment).',
        ],
        after: [
          'Speicher, die bis August 2029 in Betrieb gehen, sind nach heutiger Rechtslage (§ 118 Abs. 6 EnWG) für 20 Jahre beim Strombezug von Netzentgelten befreit. Diese Regel ist befristet und ein wichtiger Teil vieler Kalkulationen. Fragen Sie nach, welche Annahmen ein Anbieter dazu trifft.',
        ],
      },
      {
        h: 'Risiken, die Sie kennen sollten',
        p: ['Speicher sind ein junger Markt mit hohem Wachstum. Das bringt Chancen, aber auch Unsicherheiten:'],
        list: [
          '**Marktsättigung:** Je mehr Speicher gebaut werden, desto kleiner werden die Preisunterschiede, von denen sie leben. Erlöse aus Regelenergie sind in den letzten Jahren bereits deutlich gesunken.',
          '**Alterung:** Batterien verlieren mit jedem Ladezyklus Kapazität. Garantien des Herstellers und Rücklagen für den Austausch von Zellen gehören in die Kalkulation.',
          '**Regulierung:** Netzentgelte, Baukostenzuschüsse und Marktregeln können sich ändern.',
          '**Betreiberrisiko:** Die Vermarktung ist anspruchsvoll. Erfahrung und Bonität des Betreibers sind entscheidend.',
        ],
        after: ['Renditeangaben stammen von den Anbietern und sind nicht garantiert.'],
      },
      {
        h: 'Abschreibung und IAB',
        p: [
          'Ein Batteriespeicher ist ein [bewegliches Wirtschaftsgut](/ratgeber/bewegliche-wirtschaftsgueter) und kann damit grundsätzlich für den [Investitionsabzugsbetrag](/ratgeber/investitionsabzugsbetrag) infrage kommen. Für die Nutzungsdauer gibt es keinen eigenen Eintrag in der amtlichen AfA-Tabelle. In der Praxis wird sie oft aus Herstellerangaben und Zyklenzahl abgeleitet. Welche Nutzungsdauer und Abschreibungsmethode für Sie gilt, klären Sie mit Ihrem Steuerberater.',
        ],
      },
      {
        h: 'Fragen an jeden Speicher-Anbieter',
        p: ['Diese Fragen machen Angebote vergleichbar:'],
        list: [
          'Welche Erlösquellen sind in der Prognose enthalten, und mit welchen Preisannahmen?',
          'Wie viele Ladezyklen pro Jahr sind geplant, und welche Kapazitätsgarantie gibt der Hersteller?',
          'Wer trägt Kosten für Austausch, Wartung und Versicherung?',
          'Ist der Netzanschluss bereits zugesagt?',
          'Wie lange läuft der Betreibervertrag, und was passiert bei Insolvenz des Betreibers?',
        ],
        after: [
          'Aktuelle Angebote finden Sie in der Kategorie [Batteriespeicher](/batteriespeicher-iab). Wir stellen den Kontakt zu Anbietern her und beraten nicht zu konkreten Angeboten.',
        ],
      },
    ],
    faq: [
      {
        q: 'Wie verdient ein Batteriespeicher Geld?',
        a: 'Vor allem durch Stromhandel (günstig laden, teuer verkaufen) und durch Regelenergie, für die Netzbetreiber die Bereitstellung von Leistung bezahlen. Bei Betreibermodellen erhalten Sie daraus eine feste Miete oder einen Erlösanteil.',
      },
      {
        q: 'Wie lange hält ein Batteriespeicher?',
        a: 'Das hängt von Zelltechnik und Zyklenzahl ab. Viele Hersteller garantieren eine bestimmte Restkapazität nach zehn bis fünfzehn Jahren. Lassen Sie sich die Garantiebedingungen zeigen.',
      },
      {
        q: 'Kann ich einen Batteriespeicher mit dem IAB finanzieren?',
        a: 'Ein Batteriespeicher ist ein bewegliches Wirtschaftsgut und kommt grundsätzlich für den IAB infrage, wenn Sie Eigentümer werden und die übrigen Voraussetzungen erfüllen. Ob das in Ihrem Fall passt, klären Sie mit Ihrem Steuerberater.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'iab-photovoltaik',
    path: '/iab-photovoltaik',
    group: 'wissenswertes',
    title: 'IAB für Photovoltaik: Was Sie wissen sollten',
    seoTitle: 'IAB für Photovoltaik: Investitionsabzugsbetrag für PV-Anlagen nutzen',
    description:
      'Investitionsabzugsbetrag für Photovoltaik: Wann der IAB für PV-Anlagen und PV-Direktinvestments möglich ist, wann nicht, und wie sich IAB und Sonderabschreibung auswirken.',
    teaser: 'Wann der IAB für PV-Anlagen funktioniert, warum kleine Dachanlagen meist ausscheiden und wie die Rechnung aussieht.',
    icon: '🔆',
    categories: ['photovoltaik-iab'],
    related: ['photovoltaik-investment', 'investitionsabzugsbetrag', 'sonderabschreibung-7g', 'iab-frist'],
    intro:
      'Photovoltaik ist eine der häufigsten Investitionen, für die Unternehmer einen Investitionsabzugsbetrag bilden. Seit 2022 gibt es dabei aber eine wichtige Einschränkung: Kleine Anlagen auf Gebäuden sind steuerfrei und damit für den IAB in der Regel nicht geeignet. Dieser Artikel zeigt, wann der IAB für Photovoltaik funktioniert und wie er sich auswirkt.',
    sections: [
      {
        h: 'Kleine Dachanlagen: steuerfrei, deshalb meist kein IAB',
        p: [
          'Seit 2022 sind Einnahmen aus PV-Anlagen auf, an oder in Gebäuden bis **30 kWp** (bei mehreren Einheiten 15 kWp je Einheit, höchstens 100 kWp je Steuerpflichtigem) einkommensteuerfrei (§ 3 Nr. 72 EStG). Wo kein steuerpflichtiger Gewinn entsteht, kann in der Regel auch kein IAB gebildet werden. Ein IAB, der früher für eine solche Anlage gebildet wurde, kann rückgängig zu machen sein.',
          'Für größere Anlagen, Freiflächenanlagen und PV-Direktinvestments in Solarparks gilt die Steuerbefreiung dagegen nicht. Hier bleibt der IAB grundsätzlich möglich. Klären Sie im Einzelfall mit Ihrem Steuerberater, unter welche Regel Ihre Anlage fällt.',
        ],
      },
      {
        h: 'Voraussetzungen für den IAB bei PV',
        p: ['Es gelten die allgemeinen Regeln des [Investitionsabzugsbetrags](/ratgeber/investitionsabzugsbetrag):'],
        list: [
          'Ihr Betrieb liegt unter der **Gewinngrenze von 200.000 €**.',
          'Sie werden **Eigentümer** einer konkreten Anlage oder konkret bezeichneter Module. Eine Fondsbeteiligung genügt nicht.',
          'Die Anlage wird im Jahr der Anschaffung und im Folgejahr fast ausschließlich betrieblich genutzt oder vermietet.',
          'Sie investieren innerhalb der [IAB-Frist](/ratgeber/iab-frist), also bis zum Ende des dritten Folgejahres.',
        ],
        after: ['Alle Voraussetzungen im Detail finden Sie im Artikel [IAB-Voraussetzungen](/ratgeber/iab-voraussetzungen).'],
      },
      {
        h: 'Rechenbeispiel',
        p: [
          'Ein Unternehmer plant ein PV-Direktinvestment über **100.000 € netto**. Im Jahr 2025 bildet er einen IAB von 50.000 €. Sein Gewinn sinkt um diesen Betrag. Bei einem Grenzsteuersatz von 42 % zuzüglich Solidaritätszuschlag stundet er damit rund 22.000 € Steuern.',
          'Im Jahr der Anschaffung, etwa 2027, wird der IAB dem Gewinn wieder hinzugerechnet. Gleichzeitig dürfen die Anschaffungskosten um bis zu 50.000 € gemindert werden, sodass sich beides ausgleicht. Auf die verbleibenden 50.000 € kommen bis zu **40 % [Sonderabschreibung](/ratgeber/sonderabschreibung-7g)** und die reguläre Abschreibung hinzu. Das Beispiel ist vereinfacht und ersetzt keine Berechnung durch Ihren Steuerberater. Eine eigene Überschlagsrechnung machen Sie im [IAB-Rechner](/iab-rechner).',
        ],
      },
      {
        h: 'Typische Fehler',
        list: [
          'IAB für eine kleine, steuerfreie Dachanlage gebildet.',
          'Anschaffung zu spät: Maßgeblich ist die Lieferung bzw. der Übergang des wirtschaftlichen Eigentums, nicht die Bestellung.',
          'Pachtvertrag zu kurz: Er muss mindestens das Anschaffungsjahr und das gesamte Folgejahr abdecken.',
          'Nur eine Beteiligung statt Eigentum an konkreten Modulen erworben.',
        ],
        p: ['Diese Fehler sehen wir in der Praxis immer wieder:'],
        after: ['Vor dem Jahresende hilft die [IAB-Checkliste](/ratgeber/iab-checkliste-jahresende), nichts zu vergessen.'],
      },
    ],
    faq: [
      {
        q: 'Kann ich für meine PV-Anlage auf dem Hausdach einen IAB bilden?',
        a: 'Bei Anlagen bis 30 kWp auf Gebäuden in der Regel nicht, weil die Einnahmen seit 2022 steuerfrei sind. Für größere Anlagen und PV-Direktinvestments in Solarparks ist der IAB grundsätzlich möglich.',
      },
      {
        q: 'Wann gilt eine PV-Anlage als angeschafft?',
        a: 'Wenn das wirtschaftliche Eigentum auf Sie übergeht, in der Regel mit Lieferung oder Übergabe. Bestellung oder Anzahlung allein reichen nicht. Lassen Sie sich den Termin vertraglich zusichern.',
      },
      {
        q: 'Kann ich IAB und Sonderabschreibung für dieselbe PV-Anlage nutzen?',
        a: 'Ja. Der IAB wirkt vor der Anschaffung, die Sonderabschreibung von bis zu 40 % im Jahr der Anschaffung und in den vier Folgejahren. Beides lässt sich kombinieren.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'abfindung-anlegen',
    group: 'wissenswertes',
    title: 'Abfindung anlegen: Was mit Sachwerten möglich ist',
    seoTitle: 'Abfindung anlegen und Steuern sparen? Fünftelregelung, Sachwerte, IAB',
    description:
      'Abfindung erhalten? Wie die Fünftelregelung funktioniert, ob Sachwertinvestments wie Photovoltaik die Steuerlast senken können und welche Fallstricke es gibt.',
    teaser: 'Fünftelregelung, Sachwertinvestments, Unternehmerrolle: was bei einer Abfindung steuerlich zählt und wo die Grenzen liegen.',
    icon: '💼',
    categories: ['photovoltaik-iab', 'batteriespeicher-iab'],
    related: ['spitzensteuersatz-senken', 'steuern-sparen-gutverdiener', 'iab-voraussetzungen', 'iab-direktinvestment-betreibermodell'],
    intro:
      'Eine Abfindung ist oft der größte Einmalbetrag, den Arbeitnehmer je erhalten. Weil sie in einem Jahr zusätzlich zum Gehalt zufließt, kann sie die Steuerlast deutlich erhöhen. Viele fragen sich deshalb, wie sie die Abfindung sinnvoll anlegen und dabei Steuern sparen können. Dieser Artikel ordnet die gängigen Ansätze ein, auch die Frage, ob Sachwertinvestments mit Investitionsabzugsbetrag dabei helfen.',
    sections: [
      {
        h: 'Die Fünftelregelung',
        p: [
          'Abfindungen gelten als außerordentliche Einkünfte. Mit der **Fünftelregelung** (§ 34 EStG) wird die Steuer so berechnet, als wäre die Abfindung über fünf Jahre verteilt zugeflossen. Das mildert die Progression, wirkt aber vor allem dann, wenn das übrige Einkommen im Jahr der Auszahlung niedrig ist.',
          'Seit 2025 berücksichtigt der Arbeitgeber die Fünftelregelung nicht mehr beim Lohnsteuerabzug. Sie wird erst mit der Einkommensteuererklärung angewendet. Bis dahin ist zunächst mehr Lohnsteuer einbehalten.',
        ],
      },
      {
        h: 'Kann ein IAB die Steuer auf die Abfindung senken?',
        p: [
          'Den [Investitionsabzugsbetrag](/ratgeber/investitionsabzugsbetrag) können nur **Betriebe** nutzen. Als Arbeitnehmer haben Sie keinen Betrieb und damit auch keinen IAB. Manche Abfindungsempfänger werden deshalb selbst unternehmerisch tätig, etwa indem sie ein [PV-Direktinvestment](/ratgeber/photovoltaik-investment) oder einen [Batteriespeicher](/ratgeber/batteriespeicher-investment) erwerben und daraus gewerbliche Einkünfte erzielen.',
          'Ein IAB darf auch zu einem Verlust führen, der grundsätzlich mit anderen Einkünften verrechnet werden kann. Ob und in welcher Höhe das im Gründungsjahr anerkannt wird, hängt von vielen Faktoren ab: Gewinnerzielungsabsicht, Nachweis der Investitionsabsicht, Ausgestaltung des Modells. Diese Fragen sollten Sie vor der Investition mit einem Steuerberater klären.',
        ],
      },
      {
        h: 'Die wichtigsten Fallstricke',
        list: [
          '**§ 15b EStG (Steuerstundungsmodelle):** Bei vorgefertigten Konzepten, die auf Anfangsverluste ausgelegt sind, dürfen Verluste unter Umständen nur mit späteren Gewinnen aus demselben Modell verrechnet werden.',
          '**Wechselwirkung mit der Fünftelregelung:** Sinken die übrigen Einkünfte, ändert sich auch die Wirkung der Fünftelregelung. Beides muss zusammen gerechnet werden.',
          '**Steuerstundung, kein Steuererlass:** Der IAB verschiebt Steuern nur in spätere Jahre. Ein Vorteil entsteht vor allem, wenn Ihr Steuersatz später niedriger ist, etwa im Ruhestand.',
          '**Wirtschaftlichkeit:** Ein Investment muss sich auch ohne Steuervorteil rechnen.',
        ],
        p: ['Wer eine Abfindung in Sachwerte investiert, sollte diese Punkte kennen:'],
      },
      {
        h: 'Die Abfindung breit aufstellen',
        p: [
          'Für die meisten Menschen ist es sinnvoll, eine Abfindung nicht vollständig in eine einzige Anlage zu stecken. Eine Liquiditätsreserve für die Zeit bis zum nächsten Job, die Tilgung teurer Kredite und eine breit gestreute Anlage gehören in den Plan. Sachwertinvestments wie Photovoltaik oder Speicher können einen Teil davon abdecken. Lassen Sie sich zur Gesamtstrategie von einem unabhängigen Finanz- oder Steuerberater beraten.',
          'iab.investments stellt den Kontakt zu Anbietern beweglicher Wirtschaftsgüter her. Wir beraten nicht zu konkreten Angeboten und leisten keine Steuer- oder Anlageberatung. Bei Fragen zur Suche nach der passenden Kategorie helfen wir gern über den Kontakt-Button.',
        ],
      },
    ],
    faq: [
      {
        q: 'Kann ich als Arbeitnehmer einen IAB bilden?',
        a: 'Nein. Der IAB steht nur Betrieben zu, also Gewerbetreibenden, Freiberuflern und Land- und Forstwirten. Wer daneben unternehmerisch tätig ist, kann für diesen Betrieb einen IAB bilden, wenn die Voraussetzungen erfüllt sind.',
      },
      {
        q: 'Wird die Fünftelregelung noch automatisch angewendet?',
        a: 'Seit 2025 nicht mehr beim Lohnsteuerabzug durch den Arbeitgeber. Sie wird erst mit Ihrer Einkommensteuererklärung berücksichtigt.',
      },
      {
        q: 'Ist ein PV-Investment mit Abfindung ein Steuersparmodell?',
        a: 'Es kann steuerliche Effekte haben, ist aber vor allem eine unternehmerische Investition mit eigenen Risiken. Ob und wie Verluste anerkannt werden, hängt von der Ausgestaltung ab. Lassen Sie das vor der Investition prüfen.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'steuern-sparen-gutverdiener',
    group: 'wissenswertes',
    title: 'Steuern sparen für Gutverdiener',
    seoTitle: 'Steuern sparen als Gutverdiener: Möglichkeiten für Angestellte und Unternehmer',
    description:
      'Welche Möglichkeiten haben Gutverdiener, ihre Steuerlast legal zu senken? Altersvorsorge, Werbungskosten, IAB und Sachwertinvestments im Überblick, mit Grenzen und Risiken.',
    teaser: 'Altersvorsorge, Werbungskosten, IAB und Sachwerte: ein Überblick, welche Hebel es gibt und für wen sie passen.',
    icon: '📈',
    categories: ['photovoltaik-iab', 'batteriespeicher-iab', 'mietcontainer-iab'],
    related: ['spitzensteuersatz-senken', 'abfindung-anlegen', 'investitionsabzugsbetrag', 'sonderabschreibung-7g'],
    intro:
      'Wer gut verdient, zahlt auf jeden zusätzlichen Euro schnell 42 % Einkommensteuer plus Solidaritätszuschlag. Entsprechend groß ist das Interesse an legalen Wegen, die Steuerlast zu senken. Welche Möglichkeiten es gibt, hängt vor allem davon ab, ob Sie angestellt oder unternehmerisch tätig sind. Dieser Überblick zeigt die wichtigsten Hebel und ihre Grenzen.',
    sections: [
      {
        h: 'Für Angestellte',
        p: ['Angestellte haben vor allem diese Möglichkeiten:'],
        list: [
          '**Altersvorsorge:** Beiträge zur Basisrente (Rürup) und zur betrieblichen Altersvorsorge mindern innerhalb bestimmter Höchstbeträge das zu versteuernde Einkommen.',
          '**Werbungskosten:** Arbeitszimmer bzw. Homeoffice-Pauschale, Fortbildung, Arbeitsmittel und Fahrtkosten über dem Pauschbetrag.',
          '**Spenden und Sonderausgaben:** Spenden an gemeinnützige Organisationen sind innerhalb der Grenzen abziehbar.',
        ],
        after: [
          'Den Investitionsabzugsbetrag können Angestellte nicht nutzen, solange sie keinen eigenen Betrieb haben. Warum das auch bei Abfindungen eine Rolle spielt, erklärt der Artikel [Abfindung anlegen](/ratgeber/abfindung-anlegen).',
        ],
      },
      {
        h: 'Für Unternehmer und Selbstständige',
        p: [
          'Unternehmer haben deutlich mehr Gestaltungsspielraum, weil sie den Zeitpunkt von Investitionen und damit von Betriebsausgaben steuern können:',
        ],
        list: [
          '**[Investitionsabzugsbetrag](/ratgeber/investitionsabzugsbetrag):** bis zu 50 % einer geplanten Investition vorab abziehen, sofern der Gewinn unter 200.000 € liegt.',
          '**[Sonderabschreibung](/ratgeber/sonderabschreibung-7g):** zusätzlich bis zu 40 % im Jahr der Anschaffung und den vier Folgejahren.',
          '**[Degressive Abschreibung](/degressive-afa-bewegliche-wirtschaftsgueter):** bis zu 30 % pro Jahr für bewegliche Wirtschaftsgüter, die von Juli 2025 bis Ende 2027 angeschafft werden.',
          '**Altersvorsorge:** Basisrente und für GmbH-Geschäftsführer die betriebliche Altersvorsorge.',
        ],
        after: [
          'Wer keine eigene Investition im Betrieb plant, kann [bewegliche Wirtschaftsgüter](/ratgeber/bewegliche-wirtschaftsgueter) wie PV-Module, Speicher oder Container erwerben und über einen Betreiber vermieten. Wie das funktioniert, beschreibt der Artikel [Betreibermodelle](/ratgeber/iab-direktinvestment-betreibermodell).',
        ],
      },
      {
        h: 'Steuerstundung ist kein Steuererlass',
        p: [
          'IAB und Abschreibungen verschieben Steuern in die Zukunft. Spätere Gewinne sind entsprechend höher. Ein echter Vorteil entsteht vor allem durch Liquidität, die Sie heute zur Verfügung haben, und durch Progression: Wenn Ihr Steuersatz in späteren Jahren niedriger ist, sparen Sie dauerhaft. Wie das funktioniert, erklärt der Artikel [Spitzensteuersatz senken](/ratgeber/spitzensteuersatz-senken).',
        ],
      },
      {
        h: 'Vorsicht bei reinen Steuersparmodellen',
        p: [
          'Angebote, die vor allem mit dem Steuereffekt werben, sollten Sie besonders kritisch prüfen. Ein Investment muss sich auch ohne Steuervorteil rechnen. Bei vorgefertigten Konzepten mit hohen Anfangsverlusten kann zudem § 15b EStG die Verlustverrechnung einschränken. Renditeangaben stammen von den Anbietern und sind nicht garantiert.',
          'Welche Kombination für Sie sinnvoll ist, hängt von Einkommen, Rechtsform und Lebensplanung ab. Diese Fragen gehören zu Ihrem Steuerberater. Wir stellen den Kontakt zu Anbietern beweglicher Wirtschaftsgüter her und leisten keine Steuerberatung.',
        ],
      },
    ],
    faq: [
      {
        q: 'Ab wann gilt man steuerlich als Gutverdiener?',
        a: 'Eine feste Grenze gibt es nicht. Ab einem zu versteuernden Einkommen von rund 70.000 € (Ledige, 2026) greift der Spitzensteuersatz von 42 %. Spätestens dann lohnt sich ein genauer Blick auf die eigenen Möglichkeiten.',
      },
      {
        q: 'Können Angestellte in PV investieren und Steuern sparen?',
        a: 'Als Privatperson profitieren Sie nicht vom IAB. Wer ein PV-Direktinvestment erwirbt, wird damit in der Regel gewerblich tätig. Ob und wie sich das steuerlich auswirkt, hängt vom Einzelfall ab und sollte vorher mit einem Steuerberater geklärt werden.',
      },
      {
        q: 'Was bringt mehr: IAB oder Altersvorsorge?',
        a: 'Das lässt sich nicht pauschal sagen. Der IAB stundet Steuern und setzt eine betriebliche Investition voraus, Altersvorsorgebeiträge mindern die Steuer dauerhaft, werden aber später besteuert. Ihr Steuerberater kann beides für Ihre Situation durchrechnen.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'spitzensteuersatz-senken',
    group: 'wissenswertes',
    title: 'Spitzensteuersatz senken: So funktioniert die Progression',
    seoTitle: 'Spitzensteuersatz 2026 senken: Grenzsteuersatz, Progression und IAB',
    description:
      'Ab wann gilt der Spitzensteuersatz 2026, was ist der Unterschied zwischen Grenz- und Durchschnittssteuersatz, und wie können Unternehmer mit IAB und Abschreibungen die Progression nutzen?',
    teaser: 'Grenz- oder Durchschnittssteuersatz? Wie die Progression funktioniert und wie Unternehmer Gewinne zeitlich verlagern.',
    icon: '📉',
    categories: ['photovoltaik-iab', 'batteriespeicher-iab', 'mietcontainer-iab'],
    related: ['steuern-sparen-gutverdiener', 'investitionsabzugsbetrag', 'sonderabschreibung-7g', 'degressive-afa-investitionsbooster'],
    intro:
      'Der Spitzensteuersatz von 42 % greift in Deutschland früher, als viele denken. Wichtig ist aber zu verstehen, dass er nur für den Teil des Einkommens gilt, der über der Grenze liegt. Dieser Artikel erklärt die Progression, zeigt die Werte für 2026 und wie Unternehmer mit Investitionsabzugsbetrag und Abschreibungen Gewinne aus Jahren mit hohem Steuersatz verlagern können.',
    sections: [
      {
        h: 'Die Steuersätze 2026',
        p: ['Der Einkommensteuertarif steigt stufenlos. Für Ledige gelten 2026 diese Eckwerte (bei Zusammenveranlagung jeweils das Doppelte):'],
        list: [
          'Bis **12.348 €** zu versteuerndes Einkommen: keine Einkommensteuer (Grundfreibetrag).',
          'Danach steigt der Grenzsteuersatz von 14 % bis 42 %.',
          'Ab **69.879 €**: Spitzensteuersatz von 42 %.',
          'Ab **277.826 €**: sogenannte Reichensteuer von 45 %.',
        ],
        after: [
          'Hinzu kommt bei höheren Einkommen der Solidaritätszuschlag von 5,5 % der Einkommensteuer und gegebenenfalls Kirchensteuer.',
        ],
      },
      {
        h: 'Grenzsteuersatz und Durchschnittssteuersatz',
        p: [
          'Der **Grenzsteuersatz** gibt an, wie viel Steuer auf den nächsten verdienten Euro fällt. Der **Durchschnittssteuersatz** ist der Anteil der Steuer am gesamten Einkommen. Wer 100.000 € zu versteuern hat, zahlt auf jeden zusätzlichen Euro 42 %, insgesamt aber deutlich weniger, weil die ersten Euro niedriger oder gar nicht besteuert werden.',
          'Für Steuerplanung zählt der Grenzsteuersatz: Jeder Euro Betriebsausgabe, der den Gewinn im Spitzenbereich mindert, spart 42 % plus Solidaritätszuschlag. Im [IAB-Rechner](/iab-rechner) sehen Sie, wie viel das für Ihren Gewinn ausmacht.',
        ],
      },
      {
        h: 'Gewinne verlagern mit IAB und Abschreibungen',
        p: [
          'Unternehmer können die Progression nutzen, indem sie Aufwand in Jahre mit hohem Gewinn legen. Dafür gibt es drei Instrumente, die sich kombinieren lassen:',
        ],
        list: [
          '**[Investitionsabzugsbetrag](/ratgeber/investitionsabzugsbetrag):** bis zu 50 % einer geplanten Investition schon vor dem Kauf abziehen.',
          '**[Sonderabschreibung](/ratgeber/sonderabschreibung-7g):** bis zu 40 % zusätzlich im Jahr der Anschaffung und den Folgejahren.',
          '**[Degressive AfA](/degressive-afa-bewegliche-wirtschaftsgueter):** höhere Abschreibung in den ersten Jahren für Anschaffungen bis Ende 2027.',
        ],
        after: [
          'Der Effekt ist eine Steuerstundung: Die Steuer fällt später an. Dauerhaft sparen Sie, wenn der spätere Steuersatz niedriger ist, etwa weil der Gewinn sinkt oder Sie in den Ruhestand gehen. Bei gleichbleibend hohem Einkommen bleibt vor allem der Liquiditätsvorteil.',
        ],
      },
      {
        h: 'Was nicht funktioniert',
        p: [
          'Ein Investment nur wegen des Steuereffekts lohnt sich selten. Wer 10.000 € ausgibt, um 4.430 € Steuern zu sparen, hat trotzdem 5.570 € weniger, wenn die Investition selbst keinen Ertrag bringt. Entscheidend ist, dass das Wirtschaftsgut wirtschaftlich sinnvoll ist. Welche Güter für den IAB infrage kommen, zeigt der Artikel [Bewegliche Wirtschaftsgüter](/ratgeber/bewegliche-wirtschaftsgueter).',
          'Dieser Artikel dient der allgemeinen Information und ersetzt keine Steuerberatung. Welche Gestaltung für Sie passt, klären Sie mit Ihrem Steuerberater. Einen Überblick über weitere Möglichkeiten gibt der Artikel [Steuern sparen für Gutverdiener](/ratgeber/steuern-sparen-gutverdiener).',
        ],
      },
    ],
    faq: [
      {
        q: 'Ab welchem Einkommen gilt 2026 der Spitzensteuersatz?',
        a: 'Für Ledige ab einem zu versteuernden Einkommen von 69.879 €, bei Zusammenveranlagung ab 139.758 €. Ab 277.826 € (Ledige) gilt der Steuersatz von 45 %.',
      },
      {
        q: 'Zahle ich auf mein ganzes Einkommen 42 % Steuern?',
        a: 'Nein. Die 42 % gelten nur für den Teil des Einkommens über der Grenze. Ihr durchschnittlicher Steuersatz liegt deshalb deutlich darunter.',
      },
      {
        q: 'Spare ich mit dem IAB dauerhaft Steuern?',
        a: 'Der IAB ist zunächst eine Steuerstundung. Dauerhaft sparen Sie, wenn Ihr Steuersatz in dem Jahr, in dem sich der Effekt umkehrt, niedriger ist als im Jahr der Bildung.',
      },
    ],
  },

  // ─────────────────────────────────────────────────────────────
  {
    slug: 'solarpark-anteile-kaufen',
    path: '/solarpark-anteile-kaufen',
    group: 'wissenswertes',
    title: 'Solarpark kaufen oder Anteile erwerben: Direktinvestment, Fonds oder Aktie?',
    seoTitle: 'Solarpark kaufen & Anteile kaufen: Direktinvestment, Fonds oder Aktie im Vergleich',
    description:
      'Solarpark kaufen oder Anteile an einem Solarpark erwerben: Unterschiede zwischen PV-Direktinvestment, Fondsbeteiligung und Solar-Aktie, Kosten, Erträge und wann der IAB möglich ist.',
    teaser: 'Eigene Module im Solarpark, Fondsanteil oder Aktie: Was Sie wirklich besitzen und wann der IAB greift.',
    icon: '🏞️',
    categories: ['photovoltaik-iab', 'batteriespeicher-iab'],
    related: ['iab-photovoltaik', 'photovoltaik-investment', 'iab-direktinvestment-betreibermodell', 'iab-frist'],
    intro:
      'Einen ganzen Solarpark kaufen nur wenige. Wer in Solarparks investieren will, hat drei Wege: eigene PV-Module in einem Park als **Direktinvestment**, eine **Beteiligung** an einer Solarpark-Gesellschaft oder **Aktien** eines Solarpark-Betreibers. Für Unternehmer mit Investitionsabzugsbetrag macht der Unterschied viel aus, denn nur einer der drei Wege führt zu einem eigenen beweglichen Wirtschaftsgut.',
    sections: [
      {
        h: 'Drei Wege, in einen Solarpark zu investieren',
        p: ['Der wichtigste Unterschied ist, was Ihnen am Ende gehört:'],
        list: [
          '**PV-Direktinvestment:** Sie kaufen eine bestimmte Anzahl Module in einem Solarpark und werden Eigentümer. Ein Betreiber übernimmt Betrieb, Wartung und Stromvermarktung, Sie erhalten die Erlöse Ihrer Module abzüglich der Betriebskosten.',
          '**Beteiligung an einer Solarpark-Gesellschaft:** Sie werden Kommanditist oder Anleger eines Fonds. Ihnen gehört ein Anteil an der Gesellschaft, nicht die Module selbst.',
          '**Solar-Aktie:** Sie kaufen Aktien eines börsennotierten Betreibers wie 7C Solarparken. Der Kurs schwankt mit dem Markt, Dividenden sind nicht garantiert.',
        ],
      },
      {
        h: 'Wann der IAB beim Solarpark möglich ist',
        p: [
          'Ein Investitionsabzugsbetrag setzt ein **eigenes bewegliches Wirtschaftsgut** im Betriebsvermögen voraus, das im Jahr der Anschaffung und im Folgejahr fast ausschließlich betrieblich genutzt wird. Das erfüllt das **Direktinvestment in Module**: PV-Module in einem Freiflächenpark sind bewegliche Wirtschaftsgüter, und der Betrieb zur Stromerzeugung ist eine gewerbliche Tätigkeit.',
          'Bei Fondsanteilen und Aktien kaufen Sie dagegen eine Beteiligung bzw. ein Wertpapier. Dafür können Sie selbst **keinen IAB** nutzen. Wie das Betreibermodell aufgesetzt sein muss, erklärt der Artikel [Direktinvestment und Betreibermodell](/ratgeber/iab-direktinvestment-betreibermodell). Die Steuerwirkung für PV im Detail zeigt [IAB für Photovoltaik](/iab-photovoltaik).',
        ],
      },
      {
        h: 'Was ein Solarpark-Anteil kostet',
        p: [
          'PV-Direktinvestments starten bei vielen Anbietern bei etwa **25.000 bis 50.000 € netto** für ein Modulpaket. Größere Tickets ab 200.000 € sind oft individuell verhandelbar, etwa mit eigenem Teilfeld. Fondsbeteiligungen beginnen meist bei 5.000 bis 10.000 €, Aktien schon mit einem Stück.',
          'Für den IAB gilt: Er beträgt höchstens 50 % der Anschaffungskosten. Wer einen IAB von 25.000 € voll nutzen will, braucht ein Modulpaket von mindestens 50.000 € netto.',
        ],
      },
      {
        h: 'Worauf Sie vor dem Kauf achten sollten',
        p: ['Prüfen Sie bei einem Direktinvestment vor allem diese Punkte, idealerweise gemeinsam mit Ihrem Steuerberater:'],
        list: [
          'Eigentum: Werden Ihnen bestimmte Module konkret zugeordnet (Seriennummern, Lageplan)?',
          'Betreibervertrag: Laufzeit, Kosten, Rückkaufoption, Regelung bei Insolvenz des Betreibers',
          'Erlöse: EEG-Vergütung, Direktvermarktung oder Stromabnahmevertrag, und wie realistisch die Ertragsprognose ist',
          'Fläche: gesicherte Pacht für die gesamte Laufzeit',
          'Lieferung: Wann geht das wirtschaftliche Eigentum über? Für die IAB-Frist zählt dieses Datum.',
        ],
      },
    ],
    faq: [
      {
        q: 'Kann ich einen ganzen Solarpark kaufen?',
        a: 'Ja, Bestandsparks und Projektrechte werden gehandelt, meist ab mehreren Millionen Euro. Für die meisten Unternehmer ist ein Modulpaket in einem Park als Direktinvestment der passendere Einstieg.',
      },
      {
        q: 'Solarpark-Direktinvestment oder Aktien kaufen: was ist besser?',
        a: 'Das hängt vom Ziel ab. Aktien sind jederzeit handelbar, schwanken aber und bringen keinen IAB. Das Direktinvestment ist langfristig gebunden, macht Sie zum Eigentümer der Module und kann mit IAB und Sonderabschreibung kombiniert werden.',
      },
      {
        q: 'Welche Rendite bringt ein Solarpark-Anteil?',
        a: 'Anbieter nennen für Direktinvestments häufig 4 bis 7 % pro Jahr vor Steuern. Das sind Prognosen der Anbieter, keine Garantie. Entscheidend sind Strompreis, Vermarktungsvertrag und Betriebskosten.',
      },
    ],
  },
]

/** The two hand-built guides under /ratgeber, listed in the hub and in related links */
export const STATIC_GUIDES: { slug: string; title: string; teaser: string; icon: string }[] = [
  {
    slug: 'iab-frist',
    title: 'IAB-Frist: Bis wann muss investiert werden?',
    teaser: 'Fristen-Tabelle für alle laufenden IAB-Jahrgänge und was passiert, wenn die Frist verstreicht.',
    icon: '⏳',
  },
  {
    slug: 'iab-faq',
    title: 'Häufige Fragen zum Investitionsabzugsbetrag',
    teaser: 'Alle wichtigen Fragen zu Höhe, Frist, Gewinngrenze und begünstigten Investitionen, kurz beantwortet.',
    icon: '❓',
  },
]

export type GuideLink = { slug: string; title: string; teaser: string; icon: string; href: string }

export function articlePath(a: Article): string {
  return a.path ?? `/ratgeber/${a.slug}`
}

function toLink(a: Article): GuideLink {
  return { slug: a.slug, title: a.title, teaser: a.teaser, icon: a.icon, href: articlePath(a) }
}

/** IAB guides (core knowledge) – without the "Wissenswertes" topics */
export function iabGuides(): GuideLink[] {
  return [...ARTICLES.filter((a) => !a.group).map(toLink), ...STATIC_GUIDES.map((g) => ({ ...g, href: `/ratgeber/${g.slug}` }))]
}

/** Broader topics: PV and storage as investments, severance, high earners, top tax rate */
export function wissenswertes(): GuideLink[] {
  return ARTICLES.filter((a) => a.group === 'wissenswertes').map(toLink)
}

export function allGuides(): GuideLink[] {
  return [
    ...ARTICLES.map(toLink),
    ...STATIC_GUIDES.map((g) => ({ ...g, href: `/ratgeber/${g.slug}` })),
  ]
}

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug)
}

export function guidesBySlug(slugs: string[]): GuideLink[] {
  const all = allGuides()
  return slugs.map((s) => all.find((g) => g.slug === s)).filter((g): g is GuideLink => Boolean(g))
}

/** Articles that list this category – shown on the category page */
export function articlesForCategory(slug: string): GuideLink[] {
  return allGuides().filter((g) => ARTICLES.find((a) => a.slug === g.slug)?.categories.includes(slug))
}

export function readingMinutes(a: Article): number {
  const text = [a.intro, ...a.sections.flatMap((s) => [...s.p, ...(s.list ?? []), ...(s.after ?? [])])].join(' ')
  return Math.max(3, Math.round(text.split(/\s+/).length / 200))
}
