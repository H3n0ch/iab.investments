import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { NewPasswordForm } from '@/components/PasswordForms'
import { getCurrentUser } from '@/lib/auth'

export const metadata: Metadata = { title: 'Neues Passwort', robots: { index: false } }

// Reached through the reset link: /auth/confirm (or /auth/callback) has signed the user in already
export default async function NewPasswordPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect(`/passwort-vergessen?error=${encodeURIComponent('Der Link ist abgelaufen. Bitte fordern Sie einen neuen an.')}`)
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-slate-900">Neues Passwort festlegen</h1>
          <p className="mt-1 text-sm text-slate-500">für {user.email}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
          <NewPasswordForm />
        </div>
      </div>
    </div>
  )
}
