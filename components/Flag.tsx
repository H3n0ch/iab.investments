import type { ReactNode } from 'react'

// Simplified inline flags: no external requests (privacy) and they render on Windows,
// where flag emojis show up as plain letters.
const tri = (a: string, b: string, c: string, vertical = false) =>
  vertical ? (
    <>
      <rect width="10" height="20" fill={a} />
      <rect x="10" width="10" height="20" fill={b} />
      <rect x="20" width="10" height="20" fill={c} />
    </>
  ) : (
    <>
      <rect width="30" height="6.67" fill={a} />
      <rect y="6.67" width="30" height="6.67" fill={b} />
      <rect y="13.33" width="30" height="6.67" fill={c} />
    </>
  )

/** Nordic cross: background, optional outer cross, inner cross */
const nordic = (bg: string, cross: string, inner?: string) => (
  <>
    <rect width="30" height="20" fill={bg} />
    <rect x="8" width="5" height="20" fill={cross} />
    <rect y="7.5" width="30" height="5" fill={cross} />
    {inner && (
      <>
        <rect x="9.25" width="2.5" height="20" fill={inner} />
        <rect y="8.75" width="30" height="2.5" fill={inner} />
      </>
    )}
  </>
)

const FLAGS: Record<string, ReactNode> = {
  DE: tri('#000000', '#DD0000', '#FFCE00'),
  AT: tri('#ED2939', '#FFFFFF', '#ED2939'),
  NL: tri('#AE1C28', '#FFFFFF', '#21468B'),
  FR: tri('#0055A4', '#FFFFFF', '#EF4135', true),
  IT: tri('#009246', '#FFFFFF', '#CE2B37', true),
  PL: (
    <>
      <rect width="30" height="10" fill="#FFFFFF" />
      <rect y="10" width="30" height="10" fill="#DC143C" />
    </>
  ),
  ES: (
    <>
      <rect width="30" height="20" fill="#AA151B" />
      <rect y="5" width="30" height="10" fill="#F1BF00" />
    </>
  ),
  PT: (
    <>
      <rect width="30" height="20" fill="#FF0000" />
      <rect width="12" height="20" fill="#006600" />
      <circle cx="12" cy="10" r="3.5" fill="#FFCC00" />
    </>
  ),
  CH: (
    <>
      <rect width="30" height="20" fill="#DA291C" />
      <rect x="13" y="4" width="4" height="12" fill="#FFFFFF" />
      <rect x="9" y="8" width="12" height="4" fill="#FFFFFF" />
    </>
  ),
  DK: nordic('#C8102E', '#FFFFFF'),
  SE: nordic('#006AA7', '#FECC02'),
  NO: nordic('#BA0C2F', '#FFFFFF', '#00205B'),
}

export function Flag({ code, className = '' }: { code: string | null | undefined; className?: string }) {
  const flag = FLAGS[code ?? 'DE']
  if (!flag) return null
  return (
    <svg
      viewBox="0 0 30 20"
      aria-hidden
      className={`inline-block h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10 ${className}`}
      preserveAspectRatio="none"
    >
      {flag}
    </svg>
  )
}
