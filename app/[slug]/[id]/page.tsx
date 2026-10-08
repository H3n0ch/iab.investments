import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { countryName } from '@/lib/countries'
import { DeadlineBanner } from '@/components/DeadlineBanner'
import { LockButton } from '@/components/offer/LockButton'
import { OfferGallery } from '@/components/offer/OfferGallery'
import { InquiryModal } from '@/components/InquiryModal'
import { LeadForm } from '@/components/LeadForm'
import { Datasheet } from '@/components/offer/Datasheet'
import { UnlockBox } from '@/components/offer/UnlockBox'
import { getCurrentUser } from '@/lib/auth'
import { formatEuro, getCategory, GOALS } from '@/lib/categories'
import { getGatedOffer, getOfferFactLabels, getPublicOffer, recordOfferView, useDemo } from '@/lib/offers'
import type { GatedOfferData, OfferFact } from '@/lib/supabase/types'
import { UNLOCK_COOKIE } from '@/lib/unlock'

// Layout adapted from TinyMarket's app/projects/[id]/page.tsx:
// sidebar (price, inquiry box) left, gallery + detail sections right.
// Locked are only provider, documents and calculation; everything shown elsewhere on the page stays open.

export async function generateMetadata({ params }: PageProps<'/[slug]/[id]'>): Promise<Metadata> {
  const { slug, id } = await params
  const [c, offer] = [getCategory(slug), await getPublicOffer(slug, id)]
  if (!c || !offer) return {}
  const title = `${offer.title} – ${c.name} mit IAB`
  const description = offer.description ?? c.seoDescription
  return { title, description, alternates: { canonical: `/${slug}/${id}` }, openGraph: { title, description } }
}

export default async function OfferDetailPage({ params, searchParams }: PageProps<'/[slug]/[id]'>) {
  const { slug, id } = await params
  const sp = await searchParams
  const c = getCategory(slug)
  const offer = c ? await getPublicOffer(slug, id) : null
  if (!c || !offer) notFound()

  const user = await getCurrentUser()
  // Local preview without Supabase: ?vorschau=freigeschaltet shows the unlocked view (dev only)
  const demoUnlocked = useDemo && sp.vorschau === 'freigeschaltet'
  // Signed in, or sent an inquiry from this browser (cookie set by the inquiry actions)
  const inquired = (await cookies()).get(UNLOCK_COOKIE)?.value === '1'
  const unlocked = Boolean(user) || demoUnlocked || inquired

  const [gated, factLabels] = await Promise.all([
    unlocked ? getGatedOffer(slug, id) : Promise.resolve<GatedOfferData | null>(null),
    unlocked ? Promise.resolve<OfferFact[]>([]) : getOfferFactLabels(slug, id),
  ])
  if (user) await recordOfferView(user.id, offer.id).catch(() => {})

  const path = `/${slug}/${id}`
  const images = [offer.image_url, ...(offer.gallery ?? [])].filter((x): x is string => Boolean(x))
  const price = offer.min_investment_cents != null ? formatEuro(offer.min_investment_cents / 100) : null
  const location = [offer.location, countryName(offer.country)].filter(Boolean).join(', ')
  // Open key data – locking values that are visible elsewhere on the page costs trust
  const publicFacts = (
    [
      ['Mindestinvestition', price ? `${price} netto` : null, /mindest|einstieg/i],
      ['Ertrag (lt. Anbieter)', offer.expected_yield, /ertrag|rendite/i],
      ['Verfügbarkeit', offer.availability, /verfügbar|liefer/i],
      ['Standort', location, /standort|lage|land/i],
    ] as const
  ).filter(([, v]) => v)
  const isPublic = (label: string) => publicFacts.some(([, , re]) => re.test(label))
  // Data sheet facts (with key) always count; free-form facts that repeat a public column are dropped
  const gatedFacts = (unlocked ? (gated?.facts ?? []) : factLabels).filter((f) => f.key || !isPublic(f.label))
  const abroad = offer.country !== 'DE'

  const fallback = c.image ? (
    <>
      <Image src={c.image.src} alt={c.image.alt} fill sizes="(min-width: 1024px) 900px, 100vw" className="object-cover" style={{ objectPosition: c.image.position }} />
      {c.image.credit && <span className="absolute right-2 top-1.5 z-10 text-[10px] text-white/70">{c.image.credit}</span>}
    </>
  ) : (
    <div className={`h-full bg-linear-to-br ${c.gradient}`} />
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {useDemo && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-xs text-amber-900">
          <span>Lokale Vorschau ohne Supabase: Anfragen werden noch nicht gespeichert.</span>
          <Link href={demoUnlocked ? path : `${path}?vorschau=freigeschaltet`} className="font-semibold underline">
            {demoUnlocked ? 'Gesperrte Ansicht zeigen' : 'Freigeschaltete Ansicht zeigen'}
          </Link>
        </div>
      )}

      <DeadlineBanner tone="light" className="mb-4" />

      <nav className="mb-5 text-sm text-slate-500">
        <Link href="/" className="hover:text-slate-800">Start</Link>
        <span className="mx-2">›</span>
        <Link href={`/${c.slug}`} className="hover:text-slate-800">{c.name}</Link>
        <span className="mx-2">›</span>
        <span className="text-slate-800">{offer.title}</span>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* ── Sidebar ───────────────────────────── */}
        <aside className="order-2 w-full space-y-4 lg:order-1 lg:w-72 lg:shrink-0">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Einstieg</p>
            <p className="text-2xl font-bold text-[#003580]">{price ? `ab ${price} netto` : 'auf Anfrage'}</p>
            {offer.expected_yield && <p className="mt-1 text-sm font-bold text-emerald-600">{offer.expected_yield}</p>}
            {offer.availability && (
              <p className="mt-3 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">{offer.availability}</p>
            )}
          </div>

          <div id="unlock-section" className="hidden rounded-xl transition-all duration-300 lg:block">
            <UnlockBox unlocked={unlocked} returnPath={path} documents={gated?.documents ?? []} lockedFacts={gatedFacts.map((f) => f.label)} />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-xs text-slate-400">Angebots-ID</p>
            <p className="mt-0.5 break-all font-mono text-xs text-slate-600">{offer.id.slice(0, 13)}…</p>
          </div>

          <div className="space-y-1.5 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-500">
            <p><span className="text-emerald-500">✓</span> Kostenlos & unverbindlich</p>
            <p><span className="text-emerald-500">✓</span> Bewegliches Wirtschaftsgut (§ 7g EStG)</p>
            <p><span className="text-emerald-500">✓</span> Anbieter meldet sich direkt bei Ihnen</p>
          </div>
        </aside>

        {/* ── Main ──────────────────────────────── */}
        <div className="order-1 min-w-0 flex-1 lg:order-2">
          <OfferGallery images={images} title={offer.title} location={offer.location} fallback={fallback} />

          <div id="unlock-section-mobile" className="mb-6 block rounded-xl transition-all duration-300 lg:hidden">
            <UnlockBox unlocked={unlocked} returnPath={path} documents={gated?.documents ?? []} lockedFacts={gatedFacts.map((f) => f.label)} />
          </div>

          {/* Specs bar */}
          <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-4">
            {[
              ['Kategorie', c.name],
              ['Standort', location],
              ['Aufwand', c.effort],
              ['Geeignet für', c.goals.map((g) => GOALS.find((x) => x.value === g)!.label).join(', ')],
            ].map(([k, v]) => (
              <div key={k}>
                <p className="text-xs text-slate-400">{k}</p>
                <p className="text-sm font-semibold capitalize text-slate-900">{v}</p>
              </div>
            ))}
          </div>

          <Section title="Beschreibung">
            <div className="space-y-3 px-4 py-4 text-sm leading-relaxed text-slate-700">
              {offer.description && <p>{offer.description}</p>}
              {unlocked ? (
                gated?.details && <p className="whitespace-pre-line">{gated.details}</p>
              ) : (
                <div className="relative">
                  <div aria-hidden className="select-none space-y-2 blur-sm">
                    <p>Kalkulation des Anbieters mit Betreibermodell, Vertragsdetails und Ablauf der Investition.</p>
                    <p>Laufzeit, Kosten und Konditionen sowie die Unterlagen des Anbieters zum Angebot.</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LockButton
                      label={
                        <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-md ring-1 ring-emerald-200">
                          Kalkulation und Unterlagen mit Ihrer Anfrage
                        </span>
                      }
                    />
                  </div>
                </div>
              )}
            </div>
          </Section>

          <Datasheet
            categorySlug={c.slug}
            basics={publicFacts.map(([label, value]) => [label, value as string])}
            publicFacts={offer.public_facts ?? []}
            gatedFacts={gatedFacts}
            unlocked={unlocked}
          />

          {/* The provider is never named on the page – the personal introduction is what the lead buys from us */}
          <Section title="Anbieter">
            <div className="flex items-center gap-3 px-4 py-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-xl">🤝</div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900">Persönliche Vorstellung beim Anbieter</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Wir sprechen kurz mit Ihnen, klären Budget und Frist und stellen Sie dann dem Anbieter vor. Betreiber und genauen Standort
                  erfahren Sie im persönlichen Gespräch.
                </p>
                {!unlocked && (
                  <LockButton label={<span className="mt-1 inline-block text-xs font-semibold text-emerald-700">Jetzt Unterlagen anfordern →</span>} />
                )}
              </div>
            </div>
          </Section>

          {(c.riskNote || abroad) && (
            <div className="mb-6 space-y-2 rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm leading-relaxed text-amber-900">
              {c.riskNote && <p>{c.riskNote}</p>}
              {abroad && (
                <p>
                  <strong>Standort außerhalb Deutschlands:</strong> Für den IAB muss das Wirtschaftsgut im Jahr der Anschaffung und im Folgejahr vermietet
                  oder in einer inländischen Betriebsstätte (fast) ausschließlich betrieblich genutzt werden (§ 7g Abs. 6 EStG). Klären Sie bitte
                  mit Ihrem Steuerberater, ob das hier erfüllt ist.
                </p>
              )}
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-xs leading-relaxed text-slate-500">
            <p className="mb-2 font-semibold text-slate-700">Hinweis</p>
            <p>
              Alle Angaben, Prognosen und Ertragszahlen stammen vom jeweiligen Anbieter. iab.investments stellt lediglich den Kontakt her,
              prüft die Angaben nicht abschließend und übernimmt keine Haftung für deren Richtigkeit. Ob das Wirtschaftsgut steuerlich für
              Ihren Investitionsabzugsbetrag geeignet ist, klären Sie bitte mit Ihrem Steuerberater.
            </p>
          </div>
        </div>
      </div>
      {/* Inquiry as a modal – opened by every link to #anfrage (sidebar, locked values, sticky CTA) */}
      <InquiryModal
        title="Unterlagen & Kalkulation anfordern"
        subtitle={
          unlocked
            ? 'Wir melden uns persönlich und stellen den Kontakt zum Anbieter her, kostenlos und unverbindlich.'
            : 'Alle Werte sehen Sie sofort nach Ihrer Anfrage, ohne Passwort. Wir melden uns persönlich.'
        }
      >
        <LeadForm
          preselected={[c.slug]}
          source="angebot"
          offer={{ id: offer.id, title: offer.title, categorySlug: c.slug, categoryName: c.name }}
          submitLabel="Unterlagen & Kalkulation anfordern"
          defaults={{
            name: user?.profile?.full_name,
            email: user?.email,
            phone: user?.profile?.phone,
            company: user?.profile?.company,
          }}
        />
      </InquiryModal>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h2 className="text-sm font-semibold text-slate-800">{title}</h2>
      </div>
      {children}
    </div>
  )
}
