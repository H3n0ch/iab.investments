import type { Metadata } from 'next'
import Link from 'next/link'
import { TrackOnMount } from '@/components/TrackOnMount'

export const metadata: Metadata = {
  title: 'Anfrage bestätigt',
  robots: { index: false },
}

export default async function ConfirmedPage({ searchParams }: PageProps<'/anfrage/bestaetigt'>) {
  const sp = await searchParams
  const status = typeof sp.status === 'string' ? sp.status : 'ok'
  const land = sp.typ === 'flaeche'

  if (status !== 'ok') {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-slate-900">
          {status === 'fehler' ? 'Das hat gerade nicht geklappt' : 'Link ungültig oder bereits bestätigt'}
        </h1>
        <p className="mt-3 text-slate-600">
          {status === 'fehler'
            ? 'Bitte versuchen Sie es in ein paar Minuten erneut oder antworten Sie einfach auf unsere E-Mail.'
            : 'Wenn Sie den Link schon einmal geklickt haben, ist Ihre Anfrage bereits bestätigt. Andernfalls antworten Sie einfach auf unsere E-Mail.'}
        </p>
        <Link href="/" className="mt-6 inline-block font-semibold text-emerald-700 hover:underline">Zur Startseite</Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center">
      <TrackOnMount event="DOI bestätigt" props={{ typ: land ? 'flaeche' : 'investor' }} />
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-3xl text-white">✓</div>
      <h1 className="mt-4 text-2xl font-bold text-slate-900">Danke, Ihre Anfrage ist bestätigt</h1>
      <p className="mt-3 text-slate-600">
        {land
          ? 'Wir prüfen Ihre Flächenangaben und melden uns telefonisch, bevor wir sie passenden Solarpark-Projektierern vorstellen.'
          : 'Wir melden uns in Kürze telefonisch und senden Ihnen Unterlagen und Kalkulation passender Projekte. Für Sie ist das kostenlos und unverbindlich.'}
      </p>
      {!land && (
        <Link href="/angebote" className="mt-6 inline-block rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-500">
          Projekte ansehen
        </Link>
      )}
    </div>
  )
}
