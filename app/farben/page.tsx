import type { Metadata } from 'next'

// Temporary colour preview to choose the site palette – delete once a variant is chosen.

export const metadata: Metadata = { title: 'Farbvorschläge', robots: { index: false, follow: false } }

type Palette = {
  name: string
  note: string
  header: string
  headerText: string
  hero: string
  heroText: string
  heroSub: string
  accent: string
  cta: string
  ctaText: string
  page: string
  card: string
  border: string
}

const PALETTES: Palette[] = [
  {
    name: 'A · Milk-the-Sun-Blau',
    note: 'Hellblau #3299be → Petrol #15779b, weiße Schrift. Nah an Milk the Sun, frisch und freundlich.',
    header: '#15779b', headerText: '#ffffff',
    hero: 'linear-gradient(135deg,#3299be,#15779b)', heroText: '#ffffff', heroSub: '#e3f3f9',
    accent: '#15779b', cta: '#7bb831', ctaText: '#ffffff', page: '#f4f9fb', card: '#ffffff', border: '#d6e9f1',
  },
  {
    name: 'B · Helles Himmelblau',
    note: 'Heller Hero mit dunkler Schrift, weißer Header. Am leichtesten und modernsten, wirkt wie PVA-Invest.',
    header: '#ffffff', headerText: '#0f2b46',
    hero: 'linear-gradient(135deg,#eaf6fb,#d3ebf6)', heroText: '#0f2b46', heroSub: '#3d5a73',
    accent: '#1f7fa8', cta: '#237653', ctaText: '#ffffff', page: '#f7fbfd', card: '#ffffff', border: '#dbe9f0',
  },
  {
    name: 'C · Ozeanblau',
    note: 'Kräftiges, mittleres Blau. Seriöser als A, heller als das jetzige Navy.',
    header: '#1d4f7a', headerText: '#ffffff',
    hero: 'linear-gradient(135deg,#2b78ad,#1d4f7a)', heroText: '#ffffff', heroSub: '#dbe9f5',
    accent: '#1d6aa0', cta: '#237653', ctaText: '#ffffff', page: '#f3f7fb', card: '#ffffff', border: '#d9e4ee',
  },
  {
    name: 'D · Aktuell (Stahlblau)',
    note: 'Zum Vergleich: der Stand von eben.',
    header: '#0f172a', headerText: '#ffffff',
    hero: 'linear-gradient(135deg,#24405e,#33597f)', heroText: '#ffffff', heroSub: '#cbd5e1',
    accent: '#1d5f44', cta: '#237653', ctaText: '#ffffff', page: '#f8fafc', card: '#ffffff', border: '#e2e8f0',
  },
]

function Mockup({ p }: { p: Palette }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm" style={{ background: p.page }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ background: p.header, color: p.headerText, borderBottom: `1px solid ${p.border}` }}>
        <span className="font-extrabold">iab<span style={{ color: p.cta === '#7bb831' ? '#b9e27a' : '#52aa80' }}>.investments</span></span>
        <span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ border: `1.5px solid ${p.headerText}55` }}>Frist prüfen</span>
      </div>
      <div className="px-5 py-8" style={{ background: p.hero }}>
        <p className="text-xs" style={{ color: p.heroSub }}>Start / IAB auflösen</p>
        <p className="mt-2 text-2xl font-extrabold leading-tight" style={{ color: p.heroText }}>IAB 2023 auflösen: Frist 31.12.2026</p>
        <p className="mt-2 text-sm" style={{ color: p.heroSub }}>Prüfen Sie Ihre Frist und was das Versäumen kostet.</p>
        <span className="mt-4 inline-block rounded-lg px-4 py-2 text-sm font-bold" style={{ background: p.cta, color: p.ctaText }}>
          Unterlagen & Kalkulation anfordern
        </span>
      </div>
      <div className="space-y-3 p-5">
        <div className="rounded-xl p-4" style={{ background: p.card, border: `1px solid ${p.border}` }}>
          <p className="text-base font-bold" style={{ color: p.accent }}>PV-Direktinvestment Agri-PV</p>
          <p className="mt-1 text-xs text-slate-500">Leistung: <b className="text-slate-800">4.955 kWp</b> · Status: <b className="text-slate-800">Q4 2026</b></p>
          <div className="mt-3 border-t pt-3" style={{ borderColor: p.border }}>
            <p className="text-xs text-slate-500">Nachkostenrendite 1. Jahr</p>
            <p className="text-sm font-semibold" style={{ color: p.accent }}>🔒 mit Anfrage</p>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          Fließtext mit <span className="font-semibold underline" style={{ color: p.accent }}>Link zum Ratgeber</span>.
        </p>
      </div>
    </div>
  )
}

export default function FarbenPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900">Farbvorschläge</h1>
      <p className="mt-1 text-slate-500">Header, Hero, Button, Projektkarte und Link je Variante. Die Startseite mit Foto bleibt in allen Varianten gleich.</p>
      <div className="mt-8 grid gap-8 md:grid-cols-2">
        {PALETTES.map((p) => (
          <section key={p.name}>
            <h2 className="font-bold text-slate-900">{p.name}</h2>
            <p className="mb-3 text-sm text-slate-500">{p.note}</p>
            <Mockup p={p} />
          </section>
        ))}
      </div>
    </div>
  )
}
