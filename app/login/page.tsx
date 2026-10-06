import type { Metadata } from 'next'
import Link from 'next/link'
import { signIn } from '@/lib/actions/auth'
import { safeRedirectPath } from '@/lib/auth'

export const metadata: Metadata = { title: 'Anmelden', robots: { index: false } }

const input =
  'w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600'

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const params = await searchParams
  const error = typeof params.error === 'string' ? params.error : null
  const redirectTo = safeRedirectPath(params.redirectTo)

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Anmelden</h1>
          <p className="mt-1 text-sm text-slate-500">Zugang zu allen Angebotsdetails</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <form action={signIn} className="space-y-4">
            <input type="hidden" name="redirectTo" value={redirectTo} />
            <input type="email" name="email" required autoComplete="email" placeholder="E-Mail" className={input} />
            <input type="password" name="password" required autoComplete="current-password" placeholder="Passwort" className={input} />
            <div className="-mt-2 text-right">
              <Link href="/passwort-vergessen" className="text-xs text-slate-500 hover:text-emerald-700 hover:underline">
                Passwort vergessen?
              </Link>
            </div>
            <button type="submit" className="w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500">
              Anmelden
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Noch kein Konto?{' '}
            <Link href={`/registrieren?redirectTo=${encodeURIComponent(redirectTo)}`} className="font-semibold text-emerald-700 hover:underline">
              Kostenlos registrieren
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
