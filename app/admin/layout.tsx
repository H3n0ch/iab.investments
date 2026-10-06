import type { Metadata } from 'next'
import Link from 'next/link'
import { requireAdmin } from '@/lib/admin-auth'
import { signOut } from '@/lib/actions/auth'

export const metadata: Metadata = { title: 'Admin', robots: { index: false } }

const NAV_ITEMS = [
  { href: '/admin', label: 'Übersicht', icon: '📊' },
  { href: '/admin/leads', label: 'Leads', icon: '📋' },
  { href: '/admin/offers', label: 'Angebote', icon: '🏷' },
  { href: '/admin/anbieter', label: 'Anbieter', icon: '🤝' },
  { href: '/admin/partner', label: 'Steuerberater', icon: '🧾' },
]

export default async function AdminLayout({ children }: LayoutProps<'/admin'>) {
  const email = await requireAdmin()

  return (
    <div className="flex min-h-[calc(100vh-56px)] bg-slate-50">
      <aside className="hidden w-52 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
        <nav className="flex-1 space-y-0.5 p-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <p className="truncate px-3 text-xs text-slate-400">{email}</p>
          <form action={signOut}>
            <button type="submit" className="mt-1 w-full rounded-lg px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-100">
              Abmelden
            </button>
          </form>
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <nav className="flex gap-2 border-b border-slate-200 bg-white px-4 py-2 lg:hidden">
          {NAV_ITEMS.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100">
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  )
}
