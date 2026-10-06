// Clicking a locked value jumps to the inquiry form – details unlock with the inquiry, no separate sign-up
export function LockButton({ label = 'mit Anfrage' }: { label?: React.ReactNode }) {
  return (
    <a
      href="#anfrage"
      aria-label="Angebot anfragen und Details erhalten"
      className="cursor-pointer rounded text-slate-400 transition-colors hover:text-emerald-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
    >
      {label}
    </a>
  )
}
