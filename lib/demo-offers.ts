import type { GatedOfferData, PublicOffer } from '@/lib/supabase/types'

// Placeholder offers so the listing can be previewed locally before Supabase is set up.
// Only used in development (see lib/offers.ts) – never rendered in production.

type Demo = { title: string; location: string; country?: string; min: number; yield?: string; availability: string; description: string; image?: string }

const DEMO: Record<string, Demo[]> = {
  'photovoltaik-iab': [
    { title: 'Modulpaket Solarpark Brandenburg', location: 'Brandenburg', min: 25000, yield: 'ca. 5–6 % p.a. lt. Anbieter', availability: 'Lieferung bis Dez.', description: 'Eigene Module in einem 12-MWp-Freiflächenpark, Betrieb und Vermarktung durch den Betreiber.', image: '/images/photovoltaik/photovoltaik1.jpg' },
    { title: 'PV-Direktinvestment Agri-PV', location: 'Niedersachsen', min: 35000, yield: 'ca. 5 % p.a. lt. Anbieter', availability: 'sofort verfügbar', description: 'Module auf einer Agri-PV-Anlage mit landwirtschaftlicher Doppelnutzung.', image: '/images/photovoltaik/photovoltaik2.jpg' },
    { title: 'Solarpark-Anteil Bayern', location: 'Bayern', min: 50000, yield: 'ca. 6 % p.a. lt. Anbieter', availability: 'Q4', description: 'Direktinvestment in Module eines Parks mit Direktvermarktungsvertrag.', image: '/images/photovoltaik/photovoltaik3.jpg' },
  ],
  'batteriespeicher-iab': [
    { title: 'Großspeicher-Einheit 250 kWh', location: 'Sachsen-Anhalt', min: 75000, yield: 'Erlöse aus Stromhandel', availability: 'Q4', description: 'Eigene Speichereinheit in einem netzgekoppelten Großspeicher.' },
    { title: 'Gewerbespeicher für Ihren Betrieb', location: 'bundesweit', min: 60000, availability: 'Installation in 6–8 Wochen', description: 'Speicher zur Lastspitzenkappung und Eigenverbrauchsoptimierung, inkl. Analyse.' },
  ],
  'tiny-house-iab': [
    { title: 'Tiny House im Ferienpark Ostsee', location: 'Mecklenburg-Vorpommern', min: 65000, yield: 'ca. 6 % p.a. lt. Betreiber', availability: '3 von 8 frei', description: 'Mobiles Tiny House auf Trailer, Vermietung über den Parkbetreiber.', image: '/images/tinyhouses/tinyhouse4.jpg' },
    { title: 'Tiny House Glamping Allgäu', location: 'Bayern', min: 85000, yield: 'ca. 5,5 % p.a. lt. Betreiber', availability: 'Lieferung bis Dez.', description: 'Hochwertiges Tiny House für ein Glamping-Resort mit ganzjähriger Auslastung.', image: '/images/tinyhouses/tinyhouse2.jpg' },
    { title: 'Mitarbeiter-Tiny-House', location: 'bundesweit', min: 55000, availability: 'sofort verfügbar', description: 'Tiny House zur Unterbringung eigener Mitarbeiter oder Monteure.', image: '/images/tinyhouses/tinyhouse3.jpg' },
  ],
  'ladeinfrastruktur-iab': [
    { title: '2 × 22-kW-Ladepunkte für Ihren Standort', location: 'bundesweit', min: 5000, availability: 'Installation in 4 Wochen', description: 'AC-Ladepunkte für Flotte und Kunden, inkl. Abrechnungssystem.' },
    { title: 'Schnelllader an Partnerstandort', location: 'NRW', min: 75000, yield: 'Ladeerlöse lt. Betreiber', availability: 'Q1', description: 'Eigener DC-Schnelllader an einem Einzelhandelsstandort, Betrieb durch Partner.' },
  ],
  'mietcontainer-iab': [
    { title: 'Bürocontainer-Paket (5 Einheiten)', location: 'Hessen', min: 45000, yield: 'ca. 7 % p.a. lt. Anbieter', availability: 'sofort verfügbar', description: 'Bürocontainer im Vermietpool eines etablierten Containervermieters.' },
    { title: 'Sanitärcontainer für Baustellen', location: 'bundesweit', min: 25000, yield: 'Mieteinnahmen lt. Anbieter', availability: 'Lieferung bis Dez.', description: 'Sanitärcontainer mit hoher Nachfrage auf Baustellen und Events.' },
  ],
  'werbeflaechen-iab': [
    { title: 'LED-Screen Innenstadtlage', location: 'Köln', min: 40000, yield: 'Werbeerlöse lt. Vermarkter', availability: 'Q4', description: 'Digitaler Screen an einem frequenzstarken Standort, Vermarktung durch Betreiber.' },
    { title: 'Screen-Paket Tankstellen', location: 'bundesweit', min: 30000, yield: 'Werbeerlöse lt. Vermarkter', availability: 'Q1', description: 'Mehrere Indoor-Screens an Tankstellen mit Programmatic-Vermarktung.' },
  ],
  'krypto-mining-hardware-iab': [
    { title: 'ASIC-Miner-Paket mit Hosting in Deutschland', location: 'Deutschland', min: 10000, yield: 'Erträge in BTC, schwankend', availability: 'Lieferung in 4–6 Wochen', description: 'ASIC-Miner der aktuellen Generation, betrieben und gewartet in einem deutschen Rechenzentrum.' },
    { title: 'Miner-Vermietung an Rechenzentrumsbetreiber', location: 'Norwegen', country: 'NO', min: 25000, yield: 'Mietertrag lt. Anbieter', availability: 'Q1', description: 'Sie kaufen die Miner und vermieten sie an den Betreiber. Sie erhalten eine Miete statt schwankender Mining-Erträge.' },
  ],
  'wohnmobil-iab': [
    { title: 'Teilintegrierter Camper für Vermietflotte', location: 'Bayern', min: 65000, yield: 'Mieteinnahmen lt. Station', availability: 'Saison 2027', description: 'Neues Wohnmobil, Vermietung über eine Vermietstation mit Saisonauslastung.' },
    { title: 'Campervan Kastenwagen', location: 'Schleswig-Holstein', min: 60000, yield: 'Mieteinnahmen lt. Station', availability: 'sofort verfügbar', description: 'Kompakter Campervan, sehr gefragt bei Kurzurlaubern.' },
  ],
}

const SLUGS = Object.keys(DEMO)

/** Other images of the same folder become the gallery, so detail pages show more than one photo */
function galleryFor(slug: string, own: string | undefined): string[] {
  const all = DEMO[slug].map((d) => d.image).filter((x): x is string => Boolean(x))
  return all.filter((img) => img !== own)
}

function toOffer(slug: string, d: Demo, i: number): PublicOffer & GatedOfferData {
  const catIdx = SLUGS.indexOf(slug)
  return {
    // Stable, unique per category + position
    id: `00000000-0000-4000-8000-${String(catIdx * 100 + i).padStart(12, '0')}`,
    category_id: slug,
    title: d.title,
    description: d.description,
    location: d.location,
    country: d.country ?? 'DE',
    min_investment_cents: d.min * 100,
    expected_yield: d.yield ?? null,
    availability: d.availability,
    image_url: d.image ?? null,
    gallery: galleryFor(slug, d.image),
    is_published: true,
    created_at: new Date(2026, 9, 1 + i).toISOString(),
    details: 'Ausführliche Beschreibung des Anbieters mit Betreibermodell, Ablauf und Konditionen. Platzhaltertext für die lokale Vorschau.',
    // Only what has real value is gated – minimum, yield, availability and location are public columns
    facts: [
      { label: 'Kalkulation (lt. Anbieter)', value: 'Prognoserechnung über die Laufzeit, Platzhalter' },
      { label: 'Vertragslaufzeit', value: 'auf Anfrage' },
      { label: 'Service- und Betreibergebühr', value: 'auf Anfrage' },
    ],
    documents: [],
  }
}

export function getDemoOffers(slug: string): PublicOffer[] {
  return (DEMO[slug] ?? []).map((d, i) => toOffer(slug, d, i))
}

export function getDemoOffer(slug: string, id: string): (PublicOffer & GatedOfferData) | null {
  const i = (DEMO[slug] ?? []).findIndex((d, idx) => toOffer(slug, d, idx).id === id)
  return i === -1 ? null : toOffer(slug, DEMO[slug][i], i)
}

export function getAllDemoOffers(): (PublicOffer & { category_slug: string })[] {
  return Object.keys(DEMO).flatMap((slug) => getDemoOffers(slug).map((o) => ({ ...o, category_slug: slug })))
}
