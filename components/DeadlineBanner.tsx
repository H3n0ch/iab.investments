import Link from 'next/link'
import { formatDeadline, iabYears } from '@/lib/iab'

// The strongest hook: the oldest running IAB vintage expires at the end of this year. Leads to the calculator.
export function DeadlineBanner({ tone = 'dark', className = '' }: { tone?: 'dark' | 'light'; className?: string }) {
  const year = iabYears()[0]
  const style =
    tone === 'dark'
      ? // Neutral dark glass – quiet, readable on the bright hero photo as well as on navy
        'bg-slate-950/45 text-white/90 ring-white/20 backdrop-blur-md hover:bg-slate-950/60'
      : 'bg-white text-slate-700 ring-slate-200 hover:bg-slate-50'
  return (
    <Link
      href="/iab-rechner"
      className={`inline-flex flex-wrap items-center gap-x-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 transition-colors ${style} ${className}`}
    >
      <span>Frist für IAB aus dem Wirtschaftsjahr {year} endet am {formatDeadline(year)}.</span>
      <span className="font-semibold underline underline-offset-2">Ersparnis berechnen</span>
    </Link>
  )
}
