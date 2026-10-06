const ITEMS = [
  { title: 'Kostenlos & unverbindlich', text: 'Für Sie entstehen keine Kosten' },
  { title: 'Geprüfte Anbieter', text: 'Nur Anbieter mit nachvollziehbarem Modell' },
  { title: 'Frist im Blick', text: 'Ihre Deadline direkt im Ergebnis' },
  { title: 'Persönlicher Kontakt', text: 'Hilfe bei der Kategorie, Angebote direkt vom Anbieter' },
]

export function TrustBar() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-4 px-4 py-6 lg:grid-cols-4">
        {ITEMS.map((i) => (
          <li key={i.title} className="border-l-2 border-emerald-600 pl-3">
            <div>
              <p className="text-sm font-semibold text-slate-900">{i.title}</p>
              <p className="text-xs text-slate-500">{i.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
