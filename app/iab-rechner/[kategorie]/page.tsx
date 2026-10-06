import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { RechnerPage, rechnerSlug } from '@/components/rechner/RechnerPage'
import { CATEGORIES } from '@/lib/categories'

export const revalidate = 300

export const dynamicParams = false

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ kategorie: rechnerSlug(c) }))
}

function find(kategorie: string) {
  return CATEGORIES.find((c) => rechnerSlug(c) === kategorie)
}

export async function generateMetadata({ params }: PageProps<'/iab-rechner/[kategorie]'>): Promise<Metadata> {
  const c = find((await params).kategorie)
  if (!c) return {}
  return {
    title: `IAB-Rechner ${c.name}: Steuerersparnis mit Investitionsabzugsbetrag berechnen`,
    description: `Wie viel Steuer spart ein Investitionsabzugsbetrag für ${c.name}? Live-Rechner mit Tarif 2023–2026, Grenzsteuersatz-Kurve, Mehrjahres-Vergleich und passenden Angeboten ab ${c.minInvestment.toLocaleString('de-DE')} € netto.`,
    alternates: { canonical: `/iab-rechner/${rechnerSlug(c)}` },
  }
}

export default async function IabRechnerCategoryPage({ params }: PageProps<'/iab-rechner/[kategorie]'>) {
  const c = find((await params).kategorie)
  if (!c) notFound()
  return <RechnerPage category={c} />
}
