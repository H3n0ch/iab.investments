import type { Metadata } from 'next'
import { RechnerPage } from '@/components/rechner/RechnerPage'

export const revalidate = 300

export const metadata: Metadata = {
  title: 'IAB-Rechner 2026: Investitionsabzugsbetrag Rechner mit Mehrjahres-Vergleich',
  description:
    'IAB-Rechner: Steuerersparnis durch den Investitionsabzugsbetrag live berechnen. Tarif 2023–2026, Soli, Kirchensteuer, Grenzsteuersatz-Kurve und Verteilung auf mehrere Jahre. Kostenlos.',
  alternates: { canonical: '/iab-rechner' },
}

export default function IabRechnerPage() {
  return <RechnerPage />
}
