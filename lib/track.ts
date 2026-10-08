// Conversion tracking via Plausible (cookieless). No-op when the script isn't loaded
// (NEXT_PUBLIC_PLAUSIBLE_DOMAIN unset, ad blocker, server).

type Props = Record<string, string | number | boolean>

declare global {
  interface Window {
    plausible?: ((event: string, options?: { props?: Props }) => void) & { q?: unknown[] }
  }
}

export function track(event: string, props?: Props) {
  if (typeof window === 'undefined') return
  try {
    window.plausible?.(event, props ? { props: { page: window.location.pathname, ...props } } : { props: { page: window.location.pathname } })
  } catch {
    // Tracking must never break a form
  }
}
