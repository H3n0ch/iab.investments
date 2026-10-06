// Booking-style gallery, adapted from TinyMarket's components/project/ProjectHero.tsx

/* eslint-disable @next/next/no-img-element -- offer images can be arbitrary provider URLs */

export function OfferGallery({
  images,
  title,
  location,
  fallback,
}: {
  images: string[]
  title: string
  location: string | null
  /** Shown when the offer has no own images (category photo or icon tile) */
  fallback: React.ReactNode
}) {
  const overlay = (
    <>
      <div className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 px-4 pb-4 sm:px-6 sm:pb-6">
        {location && <p className="text-xs font-semibold uppercase tracking-widest text-white/75">{location}</p>}
        <h1 className="mt-1.5 text-xl font-bold text-white drop-shadow-lg sm:text-2xl lg:text-3xl">{title}</h1>
      </div>
    </>
  )

  if (images.length <= 1) {
    return (
      <div className="relative mb-6 h-64 overflow-hidden rounded-2xl bg-slate-100 sm:h-96 lg:h-[30rem]">
        {images[0] ? <img src={images[0]} alt={title} className="h-full w-full object-cover" /> : fallback}
        {overlay}
      </div>
    )
  }

  if (images.length === 2) {
    return (
      <div className="relative mb-6 flex h-64 gap-2 overflow-hidden rounded-2xl sm:h-96 lg:h-[28rem]">
        {images.map((src, i) => (
          <div key={src} className="flex-1 overflow-hidden bg-slate-100">
            <img src={src} alt={i === 0 ? title : ''} className="h-full w-full object-cover" />
          </div>
        ))}
        {overlay}
      </div>
    )
  }

  const [main, second, third, ...rest] = images
  return (
    <div className="mb-6">
      <div className="relative flex h-64 gap-2 overflow-hidden rounded-t-2xl sm:h-96 lg:h-[28rem]">
        <div className="w-[60%] overflow-hidden bg-slate-100">
          <img src={main} alt={title} className="h-full w-full object-cover" />
        </div>
        <div className="flex w-[40%] flex-col gap-2">
          <div className="flex-1 overflow-hidden bg-slate-100">
            <img src={second} alt="" className="h-full w-full object-cover" />
          </div>
          <div className="flex-1 overflow-hidden bg-slate-100">
            <img src={third} alt="" className="h-full w-full object-cover" />
          </div>
        </div>
        {overlay}
      </div>
      {rest.length > 0 && (
        <div className="mt-2 flex gap-2">
          {rest.slice(0, 5).map((src, i) => (
            <div key={src} className="relative h-24 flex-1 overflow-hidden rounded-xl bg-slate-100 first:rounded-bl-2xl last:rounded-br-2xl">
              <img src={src} alt="" className="h-full w-full object-cover" />
              {i === 4 && rest.length > 5 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
                  + {rest.length - 5} Fotos
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
