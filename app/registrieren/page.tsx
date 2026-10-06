import type { Metadata } from 'next'
import Link from 'next/link'
import { safeRedirectPath } from '@/lib/auth'
import { RegisterForm } from '@/components/RegisterForm'

export const metadata: Metadata = { title: 'Kostenlos registrieren', robots: { index: false } }

const BENEFITS = [
  'Vollständige Angebotsbeschreibungen',
  'Alle Kennzahlen und Unterlagen',
  'Angebote mit einem Klick anfragen',
]

export default async function RegisterPage({ searchParams }: PageProps<'/registrieren'>) {
  const params = await searchParams
  const redirectTo = safeRedirectPath(params.redirectTo)

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Kostenlos registrieren</h1>
          <p className="mt-1 text-sm text-slate-500">Schalten Sie alle Details zu den Investitionsgütern frei.</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <ul className="mb-5 space-y-1 text-sm text-slate-600">
            {BENEFITS.map((b) => (
              <li key={b}>
                <span className="text-emerald-600">✓</span> {b}
              </li>
            ))}
          </ul>
          <RegisterForm redirectTo={redirectTo} />
          <p className="mt-5 text-center text-sm text-slate-500">
            Bereits registriert?{' '}
            <Link href={`/login?redirectTo=${encodeURIComponent(redirectTo)}`} className="font-semibold text-emerald-700 hover:underline">
              Anmelden
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
