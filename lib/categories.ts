export type Goal = 'rendite' | 'eigennutzung' | 'steuer'

export type Category = {
  slug: string
  name: string
  short: string
  icon: string
  /** Typischer Mindestbetrag in Euro */
  minInvestment: number
  yieldProfile: string
  effort: 'gering' | 'mittel' | 'hoch'
  goals: Goal[]
  /** Tailwind-Gradient für die Bildfläche der Karte */
  gradient: string
  /** Free stock photo (Unsplash/Pexels license, commercial use, no attribution required). `source` kept as licence proof. */
  image?: { src: string; alt: string; position?: string; source: string; /** Required by licences like CC BY-SA */ credit?: string }
  /** High demand right now – shown as „Gefragt“ badge */
  popular?: boolean
  /** No buyer for leads yet: shows „Bald verfügbar“ plus the sample project and collects pre-registrations */
  comingSoon?: boolean
  /** Realistic example for comingSoon categories – always labelled „Beispiel“, never presented as a real offer */
  sampleProject?: { title: string; location: string; text: string; facts: [string, string][] }
  /** Prominent risk note on the category page */
  riskNote?: string
  seoTitle: string
  seoDescription: string
  intro: string
  highlights: string[]
  faq: { q: string; a: string }[]
}

export const GOALS: { value: Goal; label: string; hint: string }[] = [
  { value: 'rendite', label: 'Rendite', hint: 'Laufende Einnahmen aus Vermietung oder Einspeisung' },
  { value: 'eigennutzung', label: 'Eigennutzung', hint: 'Wirtschaftsgut im eigenen Betrieb einsetzen' },
  { value: 'steuer', label: 'Steuerwirkung', hint: 'Vor allem Abschreibung und Frist sicher nutzen' },
]

export const CATEGORIES: Category[] = [
  {
    slug: 'batteriespeicher-iab',
    popular: true,
    name: 'Batteriespeicher',
    short: 'Großspeicher-Anteile oder Gewerbespeicher für den eigenen Betrieb',
    icon: '🔋',
    minInvestment: 50000,
    yieldProfile: 'Stromhandel / Netzdienstleistungen / Eigenverbrauch',
    effort: 'gering',
    goals: ['rendite', 'eigennutzung', 'steuer'],
    gradient: 'from-emerald-300 via-teal-300 to-cyan-300',
    image: { src: '/images/categories/batteriespeicher-iab.webp', alt: 'Batteriegroßspeicher mit mehreren Speichercontainern', position: 'center 75%', source: 'vom Betreiber eingefügt – Quelle/Lizenz ergänzen' },
    seoTitle: 'Batteriespeicher mit IAB: Speicher als Investitionsgut nutzen',
    seoDescription:
      'Batteriespeicher als Investitionsgut für Ihren IAB: Gewerbespeicher oder Anteile an Großspeichern. Passende Anbieter finden, kostenlos und unverbindlich.',
    intro:
      'Batteriespeicher lassen sich auf zwei Arten nutzen: als Gewerbespeicher, der im eigenen Betrieb Lastspitzen kappt, oder als Investment in Großspeicher, die Erlöse aus Stromhandel und Netzdienstleistungen erzielen.',
    highlights: [
      'Für Eigennutzung oder als Investment',
      'Wachsender Markt durch die Energiewende',
      'Bewegliches Wirtschaftsgut',
    ],
    faq: [
      {
        q: 'Lohnt sich ein Speicher für meinen Betrieb?',
        a: 'Das hängt von Ihrem Lastprofil ab. Anbieter erstellen dafür meist eine kostenlose Analyse.',
      },
      {
        q: 'Woher kommen die Erlöse beim Speicher-Investment?',
        a: 'Hauptsächlich aus Preisunterschieden am Strommarkt und aus Netzdienstleistungen wie der Regelenergie. Wie hoch die Erlöse ausfallen, hängt vom Markt ab. Prüfen Sie daher die Annahmen des Anbieters.',
      },
      {
        q: 'Ist ein Batteriespeicher für den IAB begünstigt?',
        a: 'Ein Batteriespeicher ist in der Regel ein abnutzbares bewegliches Wirtschaftsgut und damit grundsätzlich begünstigt. Ausnahme: Speicher, die zu einer steuerfreien PV-Anlage bis 30 kWp gehören, fallen meist nicht unter den IAB.',
      },
      {
        q: 'Was ist der Unterschied zwischen Gewerbespeicher und Großspeicher-Investment?',
        a: 'Ein Gewerbespeicher steht in Ihrem Betrieb und senkt dort Stromkosten, etwa durch Lastspitzenkappung. Beim Großspeicher-Investment erwerben Sie Speichereinheiten in einem netzgekoppelten Speicherpark, der Erlöse aus Stromhandel und Netzdienstleistungen erzielt.',
      },
      {
        q: 'Wie lange halten Batteriespeicher?',
        a: 'Moderne Lithium-Eisenphosphat-Speicher sind meist auf 6.000 bis 10.000 Ladezyklen bzw. 10 bis 15 Jahre ausgelegt. Achten Sie auf Garantie und zugesicherte Restkapazität.',
      },
      {
        q: 'Gilt der IAB auch für Anteile an Container-Großspeichern?',
        a: 'Das ist derzeit umstritten. Entscheidend ist, ob Sie ein eigenes, abgrenzbares bewegliches Wirtschaftsgut erwerben und es betrieblich nutzen oder vermieten, oder nur eine Beteiligung. Lassen Sie sich vom Anbieter das Steuerkonzept, idealerweise mit Gutachten, zeigen und von Ihrem Steuerberater prüfen.',
      },
    ],
  },
  {
    slug: 'photovoltaik-iab',
    popular: true,
    name: 'PV-Direktinvestment',
    short: 'Eigene Module in einem professionell betriebenen Solarpark',
    icon: '☀️',
    minInvestment: 25000,
    yieldProfile: 'Einspeisevergütung / Direktvermarktung',
    effort: 'gering',
    goals: ['rendite', 'steuer'],
    gradient: 'from-amber-300 via-orange-300 to-rose-300',
    image: { src: '/images/categories/photovoltaik-iab.jpg', alt: 'Solarpark auf einer Wiese zwischen Feldern', position: 'center', source: 'https://unsplash.com/photos/IwY-27ceRCA' },
    seoTitle: 'Photovoltaik mit IAB: PV-Direktinvestment als Investitionsgut',
    seoDescription:
      'IAB läuft aus? Mit einem PV-Direktinvestment erwerben Sie eigene Solarmodule als bewegliches Wirtschaftsgut. Angebote vergleichen, kostenlos und unverbindlich.',
    intro:
      'Beim PV-Direktinvestment kaufen Sie einzelne Module oder Anlagenteile in einem größeren Solarpark. Der Betreiber kümmert sich um Wartung und Vermarktung, Sie erhalten die anteiligen Erlöse. Die Module sind bewegliche Wirtschaftsgüter in Ihrem Betriebsvermögen.',
    highlights: [
      'Kein eigenes Dach nötig',
      'Laufende Erlöse über Einspeisung bzw. Direktvermarktung',
      'Betrieb und Wartung durch den Anbieter',
    ],
    faq: [
      {
        q: 'Kann ich eine PV-Anlage auf dem eigenen Dach über den IAB finanzieren?',
        a: 'Kleine Anlagen bis 30 kWp sind seit 2022 in der Regel einkommensteuerfrei. Dort greift der IAB meist nicht. Bei Direktinvestments in größere Anlagen kann das anders sein. Klären Sie das im Einzelfall mit Ihrem Steuerberater.',
      },
      {
        q: 'Wie hoch ist der Aufwand?',
        a: 'Gering. Betrieb, Versicherung und Vermarktung übernimmt in der Regel der Anbieter, Sie erhalten Abrechnungen.',
      },
      {
        q: 'Ist ein PV-Direktinvestment ein bewegliches Wirtschaftsgut?',
        a: 'Ja, Photovoltaikmodule gelten steuerlich in der Regel als eigenständige bewegliche Wirtschaftsgüter, auch wenn sie in einem Solarpark stehen. Damit sind sie grundsätzlich für den IAB nach § 7g EStG begünstigt, sofern die übrigen Voraussetzungen erfüllt sind.',
      },
      {
        q: 'Ab welchem Betrag ist ein PV-Direktinvestment möglich?',
        a: 'Viele Anbieter starten bei etwa 25.000 € netto für ein Modulpaket. Größere Pakete ab 50.000 € sind üblich, wenn ein höherer IAB investiert werden soll.',
      },
      {
        q: 'Wie werden die Erträge bei PV-Direktinvestments erzielt?',
        a: 'Über die Einspeisevergütung nach EEG oder über Direktvermarktung bzw. Stromlieferverträge (PPA). Die Erlöse werden anteilig auf Ihre Module abgerechnet, abzüglich der Betriebs- und Pachtkosten des Betreibers.',
      },
    ],
  },
  {
    slug: 'tiny-house-iab',
    name: 'Mobile Tiny Houses',
    short: 'Tiny Houses auf Rädern zur Vermietung an Feriengäste oder Arbeitskräfte',
    icon: '🏡',
    minInvestment: 55000,
    yieldProfile: 'Mieteinnahmen über Betreiber',
    effort: 'mittel',
    goals: ['rendite', 'eigennutzung'],
    gradient: 'from-lime-300 via-emerald-300 to-teal-400',
    image: { src: '/images/categories/tiny-house-iab.webp', alt: 'Mobiles Tiny House auf Anhänger bei Sonnenuntergang', position: 'center 60%', source: 'vom Betreiber eingefügt – Quelle/Lizenz ergänzen' },
    seoTitle: 'Tiny House mit IAB: mobiles Tiny House als Investitionsgut',
    seoDescription:
      'Mobile Tiny Houses auf Trailer als bewegliches Wirtschaftsgut für Ihren IAB. Vermietungsmodelle mit Betreiber vergleichen, kostenlos und unverbindlich.',
    intro:
      'Ein Tiny House auf einem zugelassenen Trailer gilt in vielen Fällen als bewegliches Wirtschaftsgut. Betreiber stellen es zum Beispiel auf Ferienanlagen und vermieten es. Sie als Eigentümer erhalten einen Anteil an den Mieteinnahmen.',
    highlights: [
      'Greifbares Sachgut mit Betreibermodell',
      'Vermietung oder eigene betriebliche Nutzung',
      'Standorte in Deutschland und Europa',
    ],
    faq: [
      {
        q: 'Ist ein Tiny House wirklich ein bewegliches Wirtschaftsgut?',
        a: 'Ein Tiny House ist nur dann ein bewegliches Wirtschaftsgut, wenn es mobil und nicht fest mit dem Grund verbunden ist, etwa auf einem Trailer. Lassen Sie die Einordnung von Ihrem Steuerberater bestätigen.',
      },
      {
        q: 'Wer kümmert sich um die Vermietung?',
        a: 'In den Betreibermodellen übernimmt der Betreiber Vermietung, Reinigung und Instandhaltung gegen eine Provision.',
      },
      {
        q: 'Ab welchem Betrag gibt es Tiny Houses als Investment?',
        a: 'Mobile Tiny Houses für Vermietungsmodelle starten meist bei rund 55.000 € netto. Hochwertige Modelle für Glamping-Resorts liegen häufig zwischen 80.000 € und 120.000 €.',
      },
      {
        q: 'Wie hoch ist die Rendite bei vermieteten Tiny Houses?',
        a: 'Das hängt von Standort, Auslastung und Betreibervertrag ab. Anbieter nennen häufig 4 bis 7 % p.a. Lassen Sie sich Auslastungszahlen bestehender Objekte zeigen und prüfen Sie, wer Instandhaltung und Leerstand trägt.',
      },
      {
        q: 'Darf ich das Tiny House selbst nutzen?',
        a: 'Für den IAB muss das Tiny House im Jahr der Anschaffung und im Folgejahr zu mindestens 90 % betrieblich genutzt werden. Möglich ist etwa die Unterbringung von Mitarbeitern oder die Vermietung. Private Urlaubsnutzung ist nur sehr eingeschränkt möglich.',
      },
    ],
  },
  {
    slug: 'wohnmobil-iab',
    comingSoon: true,
    sampleProject: {
      title: 'Teilintegriertes Wohnmobil in einer Vermietflotte',
      location: 'Musterbeispiel',
      text: 'Sie kaufen ein neues Wohnmobil, eine Vermietstation nimmt es für mehrere Jahre in ihre Flotte auf. Buchung, Übergabe, Reinigung und Versicherung übernimmt die Station, die Mieteinnahmen werden geteilt.',
      facts: [['Kaufpreis', 'ca. 75.000 € netto'], ['Möglicher IAB', 'bis 37.500 €'], ['Vermietung', 'über Vermietstation'], ['Nutzung', 'mind. 90 % betrieblich']],
    },
    name: 'Vermietete Wohnmobile',
    short: 'Wohnmobile und Camper in professionellen Vermietflotten',
    icon: '🚐',
    minInvestment: 60000,
    yieldProfile: 'Mieteinnahmen über Vermietstation',
    effort: 'mittel',
    goals: ['rendite', 'eigennutzung'],
    gradient: 'from-orange-300 via-amber-300 to-yellow-300',
    image: { src: '/images/categories/wohnmobil-iab-2.jpg', alt: 'Wohnmobil an einem See bei Sonnenuntergang', position: 'center 65%', source: 'vom Betreiber eingefügt – Quelle/Lizenz ergänzen' },
    seoTitle: 'Wohnmobil mit IAB: vermietetes Wohnmobil als Investitionsgut',
    seoDescription:
      'Wohnmobile in Vermietflotten als Investitionsgut für Ihren IAB. Betreibermodelle vergleichen, kostenlos und unverbindlich.',
    intro:
      'Sie kaufen ein Wohnmobil, eine Vermietstation nimmt es in ihre Flotte auf und vermietet es an Urlauber. Die Mieteinnahmen werden nach einem vereinbarten Schlüssel geteilt.',
    highlights: ['Starke Nachfrage in der Reisesaison', 'Vermietung über Stationen', 'Fahrzeug bleibt Ihr Eigentum'],
    faq: [
      {
        q: 'Darf ich das Wohnmobil privat nutzen?',
        a: 'Für den IAB muss das Wirtschaftsgut im Jahr der Anschaffung und im Folgejahr zu mindestens 90 % betrieblich genutzt werden. Private Nutzung ist daher stark eingeschränkt.',
      },
      {
        q: 'Ist ein Wohnmobil für den IAB begünstigt?',
        a: 'Ja, ein Wohnmobil ist ein bewegliches Wirtschaftsgut. Begünstigt ist es aber nur bei fast ausschließlich betrieblicher Nutzung von mindestens 90 %, etwa bei Vermietung über eine Vermietstation. Eine private Urlaubsnutzung ist praktisch ausgeschlossen.',
      },
      {
        q: 'Was kostet ein Wohnmobil für die Vermietung?',
        a: 'Kastenwagen und Campervans starten meist bei etwa 60.000 € netto, teilintegrierte und integrierte Wohnmobile liegen häufig bei 75.000 € bis 120.000 €.',
      },
      {
        q: 'Wie werden die Mieteinnahmen aufgeteilt?',
        a: 'Die Vermietstation übernimmt Buchung, Übergabe, Reinigung und meist die Versicherung. Die Mieteinnahmen werden nach einem vereinbarten Schlüssel geteilt. Prüfen Sie, wer Wartung, Schäden und Stillstandzeiten trägt.',
      },
    ],
  },
  {
    slug: 'ladeinfrastruktur-iab',
    comingSoon: true,
    sampleProject: {
      title: 'Zwei Ladepunkte für Firmenflotte und Kunden',
      location: 'Musterbeispiel',
      text: 'Zwei AC-Ladepunkte mit 22 kW am eigenen Betriebsstandort, inklusive Installation und Abrechnungssystem. Kurze Lieferzeit, auch für kleinere IAB-Beträge geeignet.',
      facts: [['Investition', 'ca. 12.000 € netto'], ['Möglicher IAB', 'bis 6.000 €'], ['Lieferung', 'oft in 4–6 Wochen'], ['Nutzung', 'Flotte / Kunden']],
    },
    name: 'Ladeinfrastruktur',
    short: 'Wallboxen und Schnellladesäulen für Flotte, Kunden oder öffentliches Laden',
    icon: '⚡',
    minInvestment: 5000,
    yieldProfile: 'Ladeerlöse / Kostenersparnis Flotte',
    effort: 'mittel',
    goals: ['eigennutzung', 'rendite', 'steuer'],
    gradient: 'from-sky-300 via-blue-300 to-indigo-300',
    image: { src: '/images/categories/ladeinfrastruktur-iab-2.jpg', alt: 'Schnellladepark mit E-Autos an Ladesäulen', position: 'center', source: 'vom Betreiber eingefügt – Quelle/Lizenz ergänzen' },
    seoTitle: 'Ladeinfrastruktur mit IAB: Wallbox & Ladesäule als Investitionsgut',
    seoDescription:
      'Wallboxen und Ladesäulen über den IAB finanzieren: für die eigene Flotte oder öffentliches Laden. Anbieter vergleichen, kostenlos und unverbindlich.',
    intro:
      'Ladepunkte für die eigene Firmenflotte, für Kunden oder öffentlich zugänglich: Ladeinfrastruktur ist ein klassisches betriebliches Investitionsgut und schon mit kleineren IAB-Beträgen umsetzbar.',
    highlights: ['Schon ab kleineren Beträgen', 'Für Flotte, Kunden oder öffentliches Laden', 'Planung und Installation aus einer Hand'],
    faq: [
      {
        q: 'Brauche ich einen eigenen Standort?',
        a: 'Für Eigennutzung ja. Daneben gibt es Modelle, bei denen Sie Ladesäulen an Partnerstandorten besitzen und an den Erlösen beteiligt werden.',
      },
      {
        q: 'Ist eine Wallbox für den IAB begünstigt?',
        a: 'Eine betrieblich genutzte Wallbox oder Ladesäule ist in der Regel ein bewegliches Wirtschaftsgut und damit begünstigt. Fest verbaute Elektroinstallationen im Gebäude können dagegen zum Gebäude zählen. Die Abgrenzung klärt Ihr Steuerberater.',
      },
      {
        q: 'Was kostet Ladeinfrastruktur für Unternehmen?',
        a: 'AC-Wallboxen mit 11 bis 22 kW kosten inklusive Installation meist einige tausend Euro pro Ladepunkt. DC-Schnelllader liegen je nach Leistung und Netzanschluss bei 40.000 € bis über 120.000 € netto.',
      },
      {
        q: 'Kann ich mit Ladesäulen Einnahmen erzielen?',
        a: 'Ja, wenn die Ladepunkte öffentlich oder für Kunden zugänglich sind und über einen Ladetarif abgerechnet werden. Bei Betreibermodellen an Partnerstandorten übernimmt ein Dienstleister Betrieb und Abrechnung.',
      },
    ],
  },
  {
    slug: 'mietcontainer-iab',
    comingSoon: true,
    sampleProject: {
      title: 'Paket aus fünf Bürocontainern im Vermietpool',
      location: 'Musterbeispiel',
      text: 'Sie kaufen fünf Bürocontainer, ein Containervermieter nimmt sie in seinen Vermietpool auf und vermietet sie an Baustellen und Industrie. Leerstand und Wartung regelt der Vertrag.',
      facts: [['Investition', 'ca. 45.000 € netto'], ['Möglicher IAB', 'bis 22.500 €'], ['Vermietung', 'über Betreiber-Pool'], ['Nutzungsdauer', 'oft 15 Jahre+']],
    },
    name: 'Container & Modulräume',
    short: 'Büro-, Lager- und Sanitärcontainer zur Vermietung über Betreiber',
    icon: '📦',
    minInvestment: 25000,
    yieldProfile: 'Mieteinnahmen über Vermietpool',
    effort: 'gering',
    goals: ['rendite', 'eigennutzung', 'steuer'],
    gradient: 'from-slate-300 via-zinc-300 to-stone-400',
    image: { src: '/images/categories/mietcontainer-iab-2.webp', alt: 'Zweistöckige Modulanlage aus Bürocontainern', position: 'center 55%', source: 'vom Betreiber eingefügt – Quelle/Lizenz ergänzen' },
    seoTitle: 'Container mit IAB: Mietcontainer & Modulräume als Investitionsgut',
    seoDescription:
      'Container und Modulräume als bewegliches Wirtschaftsgut für Ihren IAB. Vermietmodelle mit Betreiber vergleichen, kostenlos und unverbindlich.',
    intro:
      'Büro-, Lager- oder Sanitärcontainer werden auf Baustellen, bei Events und in der Industrie ständig gebraucht. Sie kaufen die Container, ein Betreiber vermietet sie weiter und rechnet die Mieten mit Ihnen ab.',
    highlights: ['Robuste, standardisierte Sachwerte', 'Vermietung über erfahrene Betreiber', 'Auch für eigene Nutzung'],
    faq: [
      {
        q: 'Was passiert, wenn ein Container nicht vermietet ist?',
        a: 'Das regelt der jeweilige Vertrag. Manche Betreiber arbeiten mit Mietpools, andere mit Einzelverträgen. Fragen Sie gezielt nach Leerstandsregelungen.',
      },
      {
        q: 'Sind Container bewegliche Wirtschaftsgüter?',
        a: 'Ja. Büro-, Lager- und Sanitärcontainer sind transportabel und nicht fest mit dem Grund verbunden. Sie gelten daher in der Regel als bewegliche Wirtschaftsgüter und sind für den IAB begünstigt.',
      },
      {
        q: 'Wie funktioniert ein Container-Investment mit Vermietung?',
        a: 'Sie kaufen Container, die ein Vermieter in seinen Vermietpool aufnimmt und an Bauunternehmen, Industrie oder Veranstalter vermietet. Sie erhalten die Mieteinnahmen abzüglich einer Verwaltungsgebühr. Die Laufzeit und eine mögliche Rückkaufoption regelt der Vertrag.',
      },
      {
        q: 'Wie lange ist die Nutzungsdauer von Containern?',
        a: 'Stahlcontainer sind robust und halten bei guter Wartung oft 15 Jahre und länger. Steuerlich richtet sich die Abschreibung nach der amtlichen AfA-Tabelle.',
      },
    ],
  },
  {
    slug: 'werbeflaechen-iab',
    comingSoon: true,
    sampleProject: {
      title: 'LED-Screen an einem frequenzstarken Standort',
      location: 'Musterbeispiel',
      text: 'Ein Outdoor-LED-Screen, den ein Vermarkter aufstellt, betreibt und an Werbekunden vermarktet. Sie sind an den Werbeerlösen beteiligt.',
      facts: [['Investition', 'ca. 40.000 € netto'], ['Möglicher IAB', 'bis 20.000 €'], ['Vermarktung', 'durch Betreiber'], ['Erlöse', 'abhängig von Auslastung']],
    },
    name: 'Digitale Werbeflächen',
    short: 'LED-Screens an frequenzstarken Standorten mit Vermarktung durch Betreiber',
    icon: '📺',
    minInvestment: 20000,
    yieldProfile: 'Werbeerlöse über Vermarkter',
    effort: 'gering',
    goals: ['rendite'],
    gradient: 'from-fuchsia-300 via-violet-300 to-indigo-400',
    image: { src: '/images/categories/werbeflaechen-iab.jpg', alt: 'Digitale Werbefläche an einer Straße', position: 'center 35%', source: 'vom Betreiber eingefügt – Quelle/Lizenz ergänzen' },
    seoTitle: 'Digitale Werbeflächen mit IAB: LED-Screens als Investitionsgut',
    seoDescription:
      'Digitale Werbeflächen (LED-Screens) als Investitionsgut für Ihren IAB. Betreibermodelle vergleichen, kostenlos und unverbindlich.',
    intro:
      'Digitale Außenwerbung wächst. Bei diesen Modellen erwerben Sie LED-Screens, die ein Betreiber an Standorten mit hoher Frequenz aufstellt und vermarktet. Sie werden an den Werbeerlösen beteiligt.',
    highlights: ['Wachsender Markt Digital-Out-of-Home', 'Vermarktung durch Betreiber', 'Bewegliches Wirtschaftsgut'],
    faq: [
      {
        q: 'Wovon hängen die Erlöse ab?',
        a: 'Vor allem von Standort, Frequenz und Auslastung durch Werbekunden. Lassen Sie sich Auslastungszahlen bestehender Screens zeigen.',
      },
      {
        q: 'Sind digitale Werbeflächen für den IAB begünstigt?',
        a: 'LED-Screens und digitale Werbeträger sind in der Regel bewegliche Wirtschaftsgüter und damit grundsätzlich begünstigt, auch wenn sie an einem fremden Standort betrieben und vermarktet werden.',
      },
      {
        q: 'Ab welchem Betrag ist eine digitale Werbefläche möglich?',
        a: 'Indoor-Screens gibt es bereits ab wenigen tausend Euro. Großformatige Outdoor-LED-Flächen an frequenzstarken Standorten kosten meist 30.000 € bis 60.000 € netto und mehr.',
      },
      {
        q: 'Wer vermarktet die Werbefläche?',
        a: 'Bei Betreibermodellen übernimmt ein Vermarkter den Verkauf der Werbezeiten, häufig auch programmatisch. Sie werden an den Erlösen beteiligt. Fragen Sie nach Standortfrequenz und Auslastung bestehender Screens.',
      },
    ],
  },
  {
    slug: 'krypto-mining-hardware-iab',
    // Under review: not recommended by check/calculator, not promoted on the home page
    comingSoon: true,
    sampleProject: {
      title: 'ASIC-Miner mit Hosting in einem deutschen Rechenzentrum',
      location: 'Musterbeispiel',
      text: 'Aktuelle ASIC-Miner, die ein Hosting-Anbieter in einem inländischen Rechenzentrum betreibt und wartet. Erträge schwanken mit Bitcoin-Kurs und Netzwerk-Schwierigkeit.',
      facts: [['Investition', 'ca. 20.000 € netto'], ['Möglicher IAB', 'bis 10.000 €'], ['Standort', 'Inland (wichtig für § 7g)'], ['Risiko', 'hoch']],
    },
    riskNote:
      'Bitcoin-Miner sind beim IAB heikel. Das Wirtschaftsgut muss im Jahr der Anschaffung und im Folgejahr vermietet oder in einer inländischen Betriebsstätte (fast) ausschließlich betrieblich genutzt werden (§ 7g Abs. 6 EStG). Bei Hosting im Ausland ist das fraglich. Erträge schwanken stark, die Hardware veraltet schnell. Keine Steuerberatung: Lassen Sie das Modell vor einer Anfrage von Ihrem Steuerberater prüfen.',
    name: 'Bitcoin-Miner & Krypto-Hardware',
    short: 'ASIC-Miner und Mining-Rigs, betrieben in einem professionellen Rechenzentrum',
    icon: '⛏️',
    minInvestment: 10000,
    yieldProfile: 'Mining-Erträge (BTC) / Vermietung von Hashrate',
    effort: 'gering',
    goals: ['rendite', 'steuer'],
    gradient: 'from-amber-400 via-orange-500 to-slate-800',
    image: {
      src: '/images/categories/krypto-mining-hardware-iab.jpg',
      alt: 'Regale mit Mining-Hardware in einem Rechenzentrum',
      position: 'center 75%',
      source: 'https://commons.wikimedia.org/ (Bitcoin-Mining-Farm Island) – Herkunft bitte prüfen',
      credit: 'Foto: Marco Krohn, CC BY-SA 4.0, via Wikimedia Commons',
    },
    seoTitle: 'Bitcoin-Miner mit IAB: Krypto-Mining-Hardware als Investitionsgut?',
    seoDescription:
      'ASIC-Miner und Krypto-Hardware über den Investitionsabzugsbetrag finanzieren? Voraussetzungen, Standortfrage und Risiken. Jetzt für geprüfte Anbieter vormerken.',
    intro:
      'Beim Mining-Investment kaufen Sie ASIC-Miner oder andere Mining-Hardware, die ein Betreiber in einem Rechenzentrum betreibt. Je nach Modell erhalten Sie Mining-Erträge in Bitcoin oder Mieteinnahmen für die bereitgestellte Rechenleistung. Wir prüfen derzeit Anbieter und vermitteln erst, wenn ein Modell steuerlich und wirtschaftlich nachvollziehbar ist.',
    highlights: [
      'Hardware ist ein bewegliches Wirtschaftsgut',
      'Betrieb und Wartung durch Hosting-Anbieter',
      'Kurze Nutzungsdauer, hohes Ertragsrisiko',
    ],
    faq: [
      {
        q: 'Ist ein Bitcoin-Miner für den IAB begünstigt?',
        a: 'Ein ASIC-Miner ist ein abnutzbares bewegliches Wirtschaftsgut und kann grundsätzlich begünstigt sein. Voraussetzung ist, dass er im Jahr der Anschaffung und im Folgejahr vermietet oder in einer inländischen Betriebsstätte fast ausschließlich betrieblich genutzt wird. Bei selbst betriebenen Minern, die im Ausland gehostet werden, ist das fraglich.',
      },
      {
        q: 'Wovon hängt der Ertrag beim Mining ab?',
        a: 'Vom Bitcoin-Kurs, der Netzwerk-Schwierigkeit, den Stromkosten am Standort und der Effizienz der Hardware. Mit jedem Halving, das nächste wird um 2028 erwartet, halbiert sich die Blockbelohnung. Erträge sind daher stark schwankend und nicht planbar.',
      },
      {
        q: 'Wie lange sind Mining-Geräte wirtschaftlich nutzbar?',
        a: 'ASIC-Miner werden durch neue, effizientere Generationen schnell verdrängt und sind oft nach zwei bis drei Jahren kaum noch rentabel. Rechnen Sie mit einem hohen Wertverlust.',
      },
      {
        q: 'Warum gibt es hier noch keine Angebote?',
        a: 'Wir prüfen Anbieter derzeit auf Standort, Vertragsmodell und steuerliches Konzept. Wenn Sie sich vormerken, informieren wir Sie, sobald ein geprüftes Angebot verfügbar ist.',
      },
    ],
  },
]

export function getCategory(slug: string): Category | undefined {
  return CATEGORIES.find((c) => c.slug === slug)
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value)
}
