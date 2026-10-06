import Link from 'next/link'
import { formatDeadline, iabYears } from '@/lib/iab'

// The strongest hook: the oldest running IAB vintage expires at the end of this year. Leads to the calculator.
export function DeadlineBanner({ tone = 'dark', className = '' }: { tone?: 'dark' | 'light'; className?: string }) {
  const year = iabYears()[0]
  const style =
    tone === 'dark'
      ? 'bg-amber-400/15 text-amber-300 ring-amber-400/30 hover:bg-amber-400/25'
      : 'bg-amber-50 text-amber-900 ring-amber-300 hover:bg-amber-100'
  return (
    <Link
      href="/iab-rechner"
      className={`inline-flex flex-wrap items-center gap-x-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition-colors ${style} ${className}`}
    >
      <span>Frist für IAB aus dem Wirtschaftsjahr {year} endet am {formatDeadline(year)}.</span>
      <span className="underline underline-offset-2">Ersparnis jetzt berechnen →</span>
    </Link>
  )
}
