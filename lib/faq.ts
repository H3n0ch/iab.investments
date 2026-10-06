// General IAB questions – written as self-contained answers (direct answer first, concrete
// numbers and § references) so search engines and AI answer engines can quote them.
// Rendered with FAQPage JSON-LD via components/Faq.tsx. Not tax advice; keep legally current.

export type FaqItem = { q: string; a: string }

export const IAB_FAQ: { group: string; items: FaqItem[] }[] = [
  {
    group: 'Grundlagen',
    items: [
      {
        q: 'Was ist ein Investitionsabzugsbetrag (IAB)?',
        a: 'Der Investitionsabzugsbetrag nach § 7g EStG erlaubt kleinen und mittleren Betrieben, bis zu 50 % der voraussichtlichen Anschaffungskosten eines künftigen beweglichen Wirtschaftsguts schon vor dem Kauf gewinnmindernd abzuziehen. So sinkt die Steuerlast im Jahr der Bildung. Im Gegenzug muss innerhalb von drei Jahren investiert werden.',
      },
      {
        q: 'Wer darf einen IAB bilden?',
        a: 'Gewerbetreibende, Freiberufler sowie Land- und Forstwirte, deren Gewinn im Jahr der Bildung 200.000 € nicht übersteigt. Das gilt seit 2020 einheitlich für alle Gewinnermittlungsarten, auch für Kapitalgesellschaften wie die GmbH. Private Vermieter mit Einkünften aus Vermietung und Verpachtung sind nicht berechtigt.',
      },
      {
        q: 'Wie hoch darf der IAB sein?',
        a: 'Bis zu 50 % der voraussichtlichen Anschaffungs- oder Herstellungskosten. Insgesamt dürfen die IAB eines Betriebs im Jahr der Bildung und in den drei Vorjahren zusammen höchstens 200.000 € betragen.',
      },
      {
        q: 'Muss ich das Wirtschaftsgut bei der Bildung des IAB schon benennen?',
        a: 'Nein. Seit 2016 muss das geplante Wirtschaftsgut weder benannt noch seine Funktion beschrieben werden. Sie können den IAB später für jedes begünstigte bewegliche Wirtschaftsgut verwenden.',
      },
    ],
  },
  {
    group: 'Frist und Folgen',
    items: [
      {
        q: 'Bis wann muss ich den IAB investieren?',
        a: 'Bis zum Ende des dritten Wirtschaftsjahres nach dem Jahr der Bildung. Ein IAB für das Wirtschaftsjahr 2023 muss also bis zum 31.12.2026 investiert sein, ein IAB für 2024 bis zum 31.12.2027 (bei kalendergleichem Wirtschaftsjahr).',
      },
      {
        q: 'Was passiert, wenn ich die IAB-Frist verpasse?',
        a: 'Der IAB wird im Jahr seiner Bildung rückgängig gemacht. Der Steuerbescheid dieses Jahres wird geändert, die gesparte Steuer ist nachzuzahlen, und zusätzlich fallen Nachzahlungszinsen nach § 233a AO an (derzeit 0,15 % pro Monat).',
      },
      {
        q: 'Zählt bei der Frist die Bestellung oder die Lieferung?',
        a: 'Entscheidend ist in der Regel die Anschaffung, also der Übergang des wirtschaftlichen Eigentums mit Lieferung. Eine Bestellung oder Anzahlung allein reicht meist nicht. Planen Sie deshalb Lieferzeiten ein, besonders im Dezember.',
      },
      {
        q: 'Was passiert, wenn die Investition günstiger ausfällt als geplant?',
        a: 'Dann wird nur ein Teil des IAB verwendet. Der nicht genutzte Teil wird im Jahr der Bildung rückgängig gemacht, mit Steuernachzahlung und Zinsen. Fällt die Investition teurer aus, ist das unschädlich.',
      },
    ],
  },
  {
    group: 'Begünstigte Investitionen',
    items: [
      {
        q: 'Welche Wirtschaftsgüter sind für den IAB begünstigt?',
        a: 'Abnutzbare bewegliche Wirtschaftsgüter des Anlagevermögens, neu oder gebraucht. Sie müssen im Jahr der Anschaffung und im Folgejahr zu mindestens 90 % betrieblich genutzt werden. Typische Beispiele sind Maschinen, Fahrzeuge, PV-Module, Batteriespeicher, Container, Ladesäulen oder mobile Tiny Houses.',
      },
      {
        q: 'Welche Investitionen sind nicht begünstigt?',
        a: 'Gebäude, Grundstücke und fest mit Grund und Boden verbundene Bauten sowie immaterielle Wirtschaftsgüter wie Software. Auch Wirtschaftsgüter, die überwiegend privat genutzt werden, sind ausgeschlossen.',
      },
      {
        q: 'Darf ich das Wirtschaftsgut vermieten?',
        a: 'Ja. Seit 2020 ist auch die Vermietung ausdrücklich begünstigt, auch die langfristige. Das macht Betreibermodelle möglich, bei denen Sie zum Beispiel PV-Module, Container oder Tiny Houses kaufen und über einen Betreiber vermieten lassen.',
      },
      {
        q: 'Kann ich IAB und Sonderabschreibung kombinieren?',
        a: 'Ja. Nach der Anschaffung kann zusätzlich zur regulären AfA eine Sonderabschreibung nach § 7g Abs. 5 EStG genutzt werden, verteilt auf das Jahr der Anschaffung und die vier Folgejahre. Für Wirtschaftsgüter, die nach dem 31.12.2023 angeschafft wurden, beträgt sie bis zu 40 % (vorher 20 %). Voraussetzung ist ein Gewinn von höchstens 200.000 € im Jahr vor der Anschaffung.',
      },
      {
        q: 'Was passiert mit dem IAB im Jahr der Investition?',
        a: 'Der IAB wird dem Gewinn wieder hinzugerechnet. Gleichzeitig dürfen die Anschaffungskosten um bis zu 50 % gekürzt werden, was die Hinzurechnung ausgleicht. Die Abschreibung läuft dann von den gekürzten Anschaffungskosten.',
      },
    ],
  },
  {
    group: 'Abschreibung und Steuern',
    items: [
      {
        q: 'Gibt es 2026 eine degressive Abschreibung?',
        a: 'Ja. Für bewegliche Wirtschaftsgüter, die nach dem 30.6.2025 und vor dem 1.1.2028 angeschafft werden, ist eine degressive Abschreibung von bis zu dem Dreifachen des linearen Satzes, höchstens 30 %, möglich. Sie kann mit IAB und Sonderabschreibung kombiniert werden.',
      },
      {
        q: 'Mindert der IAB auch die Gewerbesteuer?',
        a: 'Ja. Der IAB mindert den Gewinn und damit auch den Gewerbeertrag. Bei Einzelunternehmern und Personengesellschaften wird die Gewerbesteuer zu einem großen Teil auf die Einkommensteuer angerechnet.',
      },
      {
        q: 'Kann ich einen IAB auf mehrere Investitionen aufteilen?',
        a: 'Ja. Seit 2016 ist der IAB nicht mehr an ein bestimmtes Wirtschaftsgut gebunden. Sie können ihn auf mehrere begünstigte Investitionen verteilen, solange insgesamt höchstens 50 % der jeweiligen Anschaffungskosten hinzugerechnet werden.',
      },
      {
        q: 'Kann ich einen IAB vorzeitig freiwillig auflösen?',
        a: 'Ja. Wenn absehbar ist, dass keine Investition erfolgt, kann der IAB freiwillig rückgängig gemacht werden. Die Steuer wird nachgezahlt, der Zinslauf lässt sich unter Umständen begrenzen. Ob das sinnvoll ist, klären Sie mit Ihrem Steuerberater.',
      },
      {
        q: 'Sind die Preise auf iab.investments netto oder brutto?',
        a: 'Alle Preise und Einstiegsbeträge sind Nettobeträge. Für vorsteuerabzugsberechtigte Unternehmer ist die Umsatzsteuer ein durchlaufender Posten, und auch für die Berechnung des IAB zählen die Nettoanschaffungskosten.',
      },
    ],
  },
  {
    group: 'iab.investments',
    items: [
      {
        q: 'Was kostet mich iab.investments?',
        a: 'Nichts. Die Nutzung ist für Sie kostenlos und unverbindlich. Wir finanzieren uns über die Anbieter, an die wir Anfragen weitergeben.',
      },
      {
        q: 'Werde ich hier beraten?',
        a: 'Wir helfen Ihnen, die passende Kategorie für Ihren Betrag, Ihre Frist und Ihr Ziel zu finden, und stellen den Kontakt zu passenden Anbietern her. Zu konkreten Angeboten beraten wir nicht. Details und Konditionen erhalten Sie direkt vom Anbieter, mit dem Sie auch den Vertrag schließen. Eine Steuerberatung bieten wir nicht an.',
      },
      {
        q: 'Wie wählt iab.investments die Anbieter aus?',
        a: 'Anbieter reichen ihre Produkte bei uns ein. Wir sichten sie auf Vollständigkeit und darauf, ob es sich um bewegliche Wirtschaftsgüter handelt, die grundsätzlich für den IAB infrage kommen. Erst danach schalten wir sie frei. Eine Empfehlung oder eine Prüfung der wirtschaftlichen Qualität ist das nicht.',
      },
      {
        q: 'An wie viele Anbieter werden meine Daten weitergegeben?',
        a: 'An höchstens drei Anbieter der Kategorien, die Sie ausgewählt haben, und nur mit Ihrer ausdrücklichen Einwilligung. Die Einwilligung können Sie jederzeit per E-Mail widerrufen.',
      },
      {
        q: 'Muss ich mich registrieren?',
        a: 'Nein. Für eine Anfrage ist keine Registrierung nötig. Mit einem kostenlosen Konto sehen Sie zusätzlich ausführliche Angebotsdetails, Kennzahlen und Unterlagen der Anbieter.',
      },
      {
        q: 'Wie schnell melden sich Anbieter?',
        a: 'In der Regel innerhalb weniger Werktage. Geben Sie Ihre Telefonnummer an, wenn es wegen einer nahen Frist schnell gehen muss.',
      },
    ],
  },
]

export const ALL_IAB_FAQ: FaqItem[] = IAB_FAQ.flatMap((g) => g.items)

/** Short selection for the home page; the full list lives on /ratgeber/iab-faq */
export const HOME_FAQ: FaqItem[] = [
  'Was ist ein Investitionsabzugsbetrag (IAB)?',
  'Bis wann muss ich den IAB investieren?',
  'Was passiert, wenn ich die IAB-Frist verpasse?',
  'Welche Wirtschaftsgüter sind für den IAB begünstigt?',
  'Darf ich das Wirtschaftsgut vermieten?',
  'Was kostet mich iab.investments?',
].map((q) => ALL_IAB_FAQ.find((f) => f.q === q)!)
