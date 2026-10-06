import type { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/PasswordForms'

export const metadata: Metadata = { title: 'Passwort vergessen', robots: { index: false } }

export default async function ForgotPasswordPage({ searchParams }: PageProps<'/passwort-vergessen'>) {
  const params = await searchParams
  const error = typeof params.error === 'string' ? params.error : null

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Passwort vergessen?</h1>
          <p className="mt-1 text-sm text-slate-500">Wir senden Ihnen einen Link, mit dem Sie ein neues Passwort festlegen.</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <ForgotPasswordForm initialError={error} />
          <p className="mt-6 text-center text-sm text-slate-500">
            <Link href="/login" className="font-semibold text-emerald-700 hover:underline">
              Zurück zur Anmeldung
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
