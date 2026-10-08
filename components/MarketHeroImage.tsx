'use client'

// Background photo of the /angebote hero. Follows the category picked in the marketplace: Marketplace writes
// ?kategorie= via history.replaceState, which Next.js syncs into useSearchParams.

import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { CATEGORIES } from '@/lib/categories'

export function MarketHeroImage({ defaultSlug }: { defaultSlug: string }) {
  const k = useSearchParams().get('kategorie')
  const active = k && CATEGORIES.some((c) => c.slug === k) ? k : defaultSlug
  // Only mount photos that have been shown, so switching crossfades without preloading every category
  const [seen, setSeen] = useState<string[]>([active])
  if (!seen.includes(active)) setSeen([...seen, active])

  return <Layers slugs={seen} active={active} />
}

export function MarketHeroImageFallback({ defaultSlug }: { defaultSlug: string }) {
  return <Layers slugs={[defaultSlug]} active={defaultSlug} />
}

function Layers({ slugs, active }: { slugs: string[]; active: string }) {
  return (
    // Mobile: full width under the navy overlay. md+: right half only, fading into the navy behind the text.
    <div aria-hidden className="absolute inset-y-0 right-0 left-0 overflow-hidden md:left-1/2">
      {slugs.map((slug) => {
        const img = CATEGORIES.find((c) => c.slug === slug)?.image
        if (!img) return null
        return (
          <Image
            key={slug}
            src={img.src}
            alt=""
            fill
            loading="eager"
            sizes="(min-width: 768px) 50vw, 100vw"
            className={`object-cover transition-opacity duration-500 ${slug === active ? 'opacity-100' : 'opacity-0'}`}
            style={{ objectPosition: img.position }}
          />
        )
      })}
      <div className="absolute inset-0 bg-hero/85 md:bg-transparent md:bg-linear-to-r md:from-hero md:via-hero/50 md:to-hero/10" />
    </div>
  )
}
