// Fixed data sheet per category: every offer of a category shows the same fields in the same order,
// so visitors can compare – and see exactly what they get with the free inquiry.
//   public:   shown to everyone (makes the project tangible, never enough to identify the provider)
//   inquiry:  value only after the inquiry; before that the label shows with a blurred fake `mask`
//   personal: never on the page – everything that identifies the provider (operator, manufacturer,
//             exact site). Robert passes it on in the personal call, so leads can't bypass the sale.
// Return figures are always the provider's statement and stay gated (§ 34f GewO question, see plan).

import type { OfferFact } from '@/lib/supabase/types'

export type DatasheetLevel = 'public' | 'inquiry' | 'personal'

export type DatasheetField = {
  key: string
  label: string
  level: DatasheetLevel
  /** Example value for the admin form */
  placeholder: string
  /** Fake value shape shown blurred while locked – never the real value */
  mask?: string
  /** Shown on the offer card in listings (public fields only, max. 3 per sheet) */
  card?: boolean
}

export type DatasheetSection = { title: string; fields: DatasheetField[] }

const pv: DatasheetSection[] = [
  {
    title: 'Anlage',
    fields: [
      { key: 'art', label: 'Art', level: 'public', placeholder: 'Freiland mit Batteriespeicher', card: true },
      { key: 'leistung', label: 'Leistung', level: 'public', placeholder: '4.955 kWp', card: true },
      { key: 'status', label: 'Status', level: 'public', placeholder: 'Inbetriebnahme geplant Q4 2026', card: true },
      { key: 'netzanschluss', label: 'Netzanschluss', level: 'public', placeholder: 'voraussichtlich Q4 2026' },
      { key: 'einspeisung', label: 'Einspeiseart', level: 'public', placeholder: 'EEG gem. Solarpaket 1' },
      { key: 'ertrag', label: 'Spez. Jahresertrag', level: 'inquiry', placeholder: '1.048 kWh/kWp', mask: '0.000 kWh/kWp' },
      { key: 'dc_fertig', label: 'DC-Fertigstellung (lt. Exposé)', level: 'inquiry', placeholder: '09/2026', mask: '00/0000' },
      { key: 'standort_exakt', label: 'Genauer Standort', level: 'personal', placeholder: '92275 Hirschbach', mask: '00000 Musterort' },
    ],
  },
  {
    title: 'Kauf',
    fields: [
      { key: 'paket', label: 'Kleinstes Paket', level: 'public', placeholder: 'ab 100 kWp bzw. Gesamtpark' },
      { key: 'kaufpreis', label: 'Kaufpreis netto (gesamt)', level: 'inquiry', placeholder: '5.946.048 €', mask: '0.000.000 €' },
      { key: 'preis_kwp', label: 'Preis je kWp', level: 'inquiry', placeholder: '1.200 € je kWp', mask: '0.000 € je kWp' },
      { key: 'gesamtkaufpreis', label: 'Gesamtkaufpreis inkl. Nebenkosten', level: 'inquiry', placeholder: '7.075.797 €', mask: '0.000.000 €' },
      { key: 'rendite', label: 'Nachkostenrendite 1. Jahr (lt. Anbieter)', level: 'inquiry', placeholder: '8,5 %', mask: '0,0 %' },
    ],
  },
  {
    title: 'Betrieb & Erlöse',
    fields: [
      { key: 'verguetung', label: 'EEG-Vergütung / Strompreis', level: 'inquiry', placeholder: '6,98 ct/kWh', mask: '0,00 ct/kWh' },
      { key: 'betriebskosten', label: 'Betriebskosten', level: 'inquiry', placeholder: '21,58 € je kWp p.a.', mask: '00,00 € je kWp' },
      { key: 'betreiber', label: 'Betreiber / Direktvermarkter', level: 'personal', placeholder: 'Muster Energie GmbH', mask: 'Musterbetreiber GmbH' },
    ],
  },
  {
    title: 'Fläche & Pacht',
    fields: [
      { key: 'pachtart', label: 'Pachtart', level: 'inquiry', placeholder: 'laufend', mask: 'laufend' },
      { key: 'pacht', label: 'Pacht', level: 'inquiry', placeholder: '4,5 % oder 3.300 €/ha, ab Jahr 21 5,5 %', mask: '0,0 % bzw. 0.000 €/ha' },
      { key: 'pacht_laufzeit', label: 'Laufzeit', level: 'inquiry', placeholder: '23 Jahre', mask: '00 Jahre' },
      { key: 'pacht_verlaengerung', label: 'Verlängerung', level: 'inquiry', placeholder: '1 × 5 Jahre', mask: '0 × 0 Jahre' },
    ],
  },
]

const speicher: DatasheetSection[] = [
  {
    title: 'Anlage',
    fields: [
      { key: 'art', label: 'Art', level: 'public', placeholder: 'Stand-alone-Großspeicher', card: true },
      { key: 'kapazitaet', label: 'Kapazität', level: 'public', placeholder: '10 MWh', card: true },
      { key: 'leistung', label: 'Leistung', level: 'public', placeholder: '5 MW' },
      { key: 'status', label: 'Status', level: 'public', placeholder: 'Inbetriebnahme geplant Q1 2027', card: true },
      { key: 'netzanschluss', label: 'Netzanschluss', level: 'public', placeholder: 'Mittelspannung, gesichert' },
      { key: 'technik', label: 'Technik / Zellchemie', level: 'inquiry', placeholder: 'LFP, Hersteller XY', mask: 'LFP, Hersteller Muster' },
      { key: 'garantie', label: 'Garantie / Zyklen', level: 'inquiry', placeholder: '10 Jahre / 6.000 Zyklen', mask: '00 Jahre / 0.000 Zyklen' },
      { key: 'standort_exakt', label: 'Genauer Standort', level: 'personal', placeholder: '06xxx Musterstadt', mask: '00000 Musterort' },
    ],
  },
  {
    title: 'Kauf',
    fields: [
      { key: 'paket', label: 'Kleinstes Paket', level: 'public', placeholder: 'ab 250 kWh' },
      { key: 'kaufpreis', label: 'Kaufpreis netto (gesamt)', level: 'inquiry', placeholder: '3.200.000 €', mask: '0.000.000 €' },
      { key: 'preis_kwh', label: 'Preis je kWh', level: 'inquiry', placeholder: '320 € je kWh', mask: '000 € je kWh' },
      { key: 'rendite', label: 'Rendite 1. Jahr (lt. Anbieter)', level: 'inquiry', placeholder: '9 %', mask: '0,0 %' },
    ],
  },
  {
    title: 'Vermarktung & Betrieb',
    fields: [
      { key: 'vermarktung', label: 'Vermarktungsmodell', level: 'public', placeholder: 'Arbitrage + Regelenergie' },
      { key: 'vermarkter', label: 'Vermarkter', level: 'personal', placeholder: 'Muster Trading GmbH', mask: 'Mustervermarkter GmbH' },
      { key: 'erloesabsicherung', label: 'Erlösabsicherung (Tolling / Floor)', level: 'inquiry', placeholder: 'Tolling 7 Jahre', mask: 'Tolling 0 Jahre' },
      { key: 'betriebskosten', label: 'Betriebskosten', level: 'inquiry', placeholder: '8 € je kWh p.a.', mask: '00 € je kWh' },
    ],
  },
  {
    title: 'Fläche & Pacht',
    fields: [
      { key: 'pacht', label: 'Pacht', level: 'inquiry', placeholder: '6.000 € p.a.', mask: '0.000 € p.a.' },
      { key: 'pacht_laufzeit', label: 'Laufzeit', level: 'inquiry', placeholder: '20 Jahre', mask: '00 Jahre' },
    ],
  },
]

const tinyHouse: DatasheetSection[] = [
  {
    title: 'Objekt',
    fields: [
      { key: 'modell', label: 'Typ / Modell', level: 'public', placeholder: 'Tiny House auf Trailer, 2 Ebenen', card: true },
      { key: 'flaeche', label: 'Wohnfläche', level: 'public', placeholder: '28 m²', card: true },
      { key: 'schlafplaetze', label: 'Schlafplätze', level: 'public', placeholder: '4' },
      { key: 'mobil', label: 'Mobil (bewegliches WG)', level: 'public', placeholder: 'ja, auf Trailer mit Zulassung' },
      { key: 'hersteller', label: 'Hersteller', level: 'personal', placeholder: 'Muster Tiny Houses GmbH', mask: 'Musterhersteller GmbH' },
    ],
  },
  {
    title: 'Kauf',
    fields: [
      { key: 'kaufpreis', label: 'Kaufpreis netto inkl. Ausstattung', level: 'inquiry', placeholder: '79.000 €', mask: '00.000 €' },
      { key: 'nebenkosten', label: 'Nebenkosten (Transport, Anschluss)', level: 'inquiry', placeholder: '4.500 €', mask: '0.000 €' },
      { key: 'rendite', label: 'Mietrendite (lt. Betreiber)', level: 'inquiry', placeholder: '6 % p.a.', mask: '0,0 % p.a.' },
    ],
  },
  {
    title: 'Vermietung',
    fields: [
      { key: 'mietmodell', label: 'Mietmodell', level: 'public', placeholder: 'Ferienvermietung über Parkbetreiber', card: true },
      { key: 'park', label: 'Park / Standort', level: 'personal', placeholder: 'Ferienpark Musterort an der Ostsee', mask: 'Ferienpark Musterort' },
      { key: 'betreiber', label: 'Betreiber', level: 'personal', placeholder: 'Muster Resorts GmbH', mask: 'Musterbetreiber GmbH' },
      { key: 'auslastung', label: 'Auslastung bisher', level: 'inquiry', placeholder: '68 % (2025)', mask: '00 %' },
      { key: 'kosten_betreiber', label: 'Kosten Betreiber / Stellplatz', level: 'inquiry', placeholder: '25 % der Mieteinnahmen', mask: '00 % der Einnahmen' },
      { key: 'vertrag', label: 'Laufzeit Betreibervertrag', level: 'inquiry', placeholder: '10 Jahre, Rückkaufoption', mask: '00 Jahre' },
    ],
  },
]

const SHEETS: Record<string, DatasheetSection[]> = {
  'photovoltaik-iab': pv,
  'batteriespeicher-iab': speicher,
  'tiny-house-iab': tinyHouse,
}

/** Data sheet of a category; categories without one keep the free-form key figures only */
export function getDatasheet(categorySlug: string): DatasheetSection[] | null {
  return SHEETS[categorySlug] ?? null
}

export function datasheetFields(categorySlug: string): DatasheetField[] {
  return (SHEETS[categorySlug] ?? []).flatMap((s) => s.fields)
}

/** Admin form → { public_facts, facts } for the offers table. Fields are posted as `ds_<key>`. */
export function splitDatasheet(categorySlug: string, read: (name: string) => string): { publicFacts: OfferFact[]; gatedFacts: OfferFact[] } {
  const publicFacts: OfferFact[] = []
  const gatedFacts: OfferFact[] = []
  for (const f of datasheetFields(categorySlug)) {
    const value = read(`ds_${f.key}`).trim()
    if (!value) continue
    ;(f.level === 'public' ? publicFacts : gatedFacts).push({ key: f.key, label: f.label, value })
  }
  return { publicFacts, gatedFacts }
}

/** Keys whose values never leave the server (see `personal` above) */
export function personalKeys(categorySlug: string): Set<string> {
  return new Set(datasheetFields(categorySlug).filter((f) => f.level === 'personal').map((f) => f.key))
}

/** Up to three public card facts for listings */
export function cardFacts(categorySlug: string, publicFacts: OfferFact[]): OfferFact[] {
  const keys = datasheetFields(categorySlug).filter((f) => f.card).map((f) => f.key)
  return keys.map((k) => publicFacts.find((f) => f.key === k)).filter((f): f is OfferFact => Boolean(f)).slice(0, 3)
}
