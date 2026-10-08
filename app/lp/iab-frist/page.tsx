import type { Metadata } from 'next'
import { FristJahrgangPage } from '@/components/FristJahrgangPage'
import { formatDeadline, iabYears } from '@/lib/iab'

// Google Ads landing page for the „IAB auflösen“ cluster: /lp/iab-frist?jahr=2023.
// Same content as the deadline pages, but noindex (no duplicate content) and without navigation (see Header).

export const metadata: Metadata = {
  title: 'IAB-Frist prüfen: Bis wann müssen Sie investieren?',
  robots: { index: false, follow: false },
}

export default async function AdLandingPage({ searchParams }: PageProps<'/lp/iab-frist'>) {
  const { jahr } = await searchParams
  const years = iabYears()
  const requested = Number(jahr)
  // Unknown or expired years fall back to the most urgent running vintage
  const year = years.includes(requested) ? requested : years[0]
  return (
    <>
      <p className="sr-only">Frist für IAB aus {year}: {formatDeadline(year)}</p>
      <FristJahrgangPage year={year} />
    </>
  )
}
