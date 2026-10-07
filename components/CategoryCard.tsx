import Image from 'next/image'
import Link from 'next/link'
import { formatEuro, type Category } from '@/lib/categories'

export function CategoryCard({ category: c }: { category: Category }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
      <Link href={`/${c.slug}`} className={`relative flex h-40 items-center justify-center overflow-hidden bg-linear-to-br ${c.gradient}`}>
        {c.image ? (
          <>
            <Image
              src={c.image.src}
              alt={c.image.alt}
              fill
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              style={{ objectPosition: c.image.position }}
            />
            <span className="absolute inset-x-0 bottom-0 h-16 bg-linear-to-t from-slate-900/50 to-transparent" />
            {c.image.credit && (
              <span className="absolute bottom-0.5 right-1.5 text-[8px] text-white/70">{c.image.credit}</span>
            )}
          </>
        ) : null}
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 shadow-sm">
          Bewegliches WG
        </span>
        {c.popular && (
          <span className="absolute bottom-3 right-3 rounded-full bg-amber-400 px-2 py-0.5 text-[11px] font-bold text-amber-950 shadow-sm">
            Gefragt
          </span>
        )}
        {c.comingSoon && (
          <span className="absolute right-3 top-3 rounded-full bg-slate-900/80 px-2 py-0.5 text-[11px] font-semibold text-white">
            Anbieter in Prüfung
          </span>
        )}
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="font-bold text-slate-900">
          <Link href={`/${c.slug}`} className="hover:underline">
            {c.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">{c.short}</p>
        <dl className="mt-3 grid gap-y-1.5 text-xs">
          <div>
            <dt className="text-slate-400">Einstieg</dt>
            <dd className="font-semibold text-slate-900">ab {formatEuro(c.minInvestment)} netto</dd>
          </div>
          <div>
            <dt className="text-slate-400">Ertrag</dt>
            <dd className="font-medium text-slate-700">{c.yieldProfile}</dd>
          </div>
        </dl>
        <div className="mt-auto pt-4">
          <Link
            href={`/${c.slug}`}
            className="block rounded-lg bg-emerald-600 px-3 py-2 text-center text-sm font-semibold text-white transition-colors hover:bg-emerald-500"
          >
            {c.comingSoon ? 'Jetzt vormerken →' : 'Angebote ansehen →'}
          </Link>
        </div>
      </div>
    </article>
  )
}
