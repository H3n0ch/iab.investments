'use client'

// Adapted from TinyMarket's components/admin/LeadsCRM.tsx – one row per lead
// instead of investor groups; claims/recycling removed.

import { useState, useTransition } from 'react'
import { addLeadActivity, deleteLead, updateLeadCRM, updateLeadStatus } from '@/lib/actions/admin'
import { formatEuro, GOALS } from '@/lib/categories'
import { AMOUNTS, BUDGETS, investTimings, LAND_TYPES, LEGAL_FORMS } from '@/lib/iab'
import type { Lead, LeadActivity, LeadStatus } from '@/lib/supabase/types'

const PAGE_SIZE = 25

const STATUS: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'neu', label: 'Neu', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'kontaktiert', label: 'Kontaktiert', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'qualifiziert', label: 'Qualifiziert', color: 'bg-violet-100 text-violet-700 border-violet-200' },
  { value: 'weitergegeben', label: 'Weitergegeben', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { value: 'abgeschlossen', label: 'Abgeschlossen', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'abgelehnt', label: 'Abgelehnt', color: 'bg-red-100 text-red-700 border-red-200' },
]

// Leads without an IAB request: new accounts and contact-button messages
const SOURCE_BADGES: Record<string, { label: string; color: string }> = {
  registrierung: { label: 'Registriert', color: 'border-sky-200 bg-sky-50 text-sky-700' },
  kontakt: { label: 'Kontaktanfrage', color: 'border-amber-200 bg-amber-50 text-amber-700' },
  rechner: { label: 'IAB-Rechner', color: 'border-violet-200 bg-violet-50 text-violet-700' },
  frist: { label: '🔥 Frist-Lead', color: 'border-red-200 bg-red-50 text-red-700' },
  angebot: { label: '🎯 Angebotsanfrage', color: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
  ratgeber: { label: 'Ratgeber', color: 'border-teal-200 bg-teal-50 text-teal-700' },
  flaeche: { label: '🌾 Fläche', color: 'border-lime-300 bg-lime-50 text-lime-800' },
}

type DoiFilter = '' | 'bestaetigt' | 'offen'
/** Leads from the inquiry forms carry a DOI token; registrations, contact and calculator leads don't need one */
const needsDoi = (l: Lead) => l.consent_share
const doiOk = (l: Lead) => Boolean(l.doi_confirmed_at)

const CHANNELS = [
  { value: 'anruf', label: '📞 Anruf' },
  { value: 'email', label: '📧 E-Mail' },
  { value: 'whatsapp', label: '💬 WhatsApp' },
  { value: 'notiz', label: '📝 Notiz' },
]

const OUTCOMES = [
  { value: 'erreicht', label: 'Erreicht' },
  { value: 'nicht_erreicht', label: 'Nicht erreicht' },
  { value: 'rueckruf', label: 'Rückruf vereinbart' },
  { value: 'interessiert', label: 'Sehr interessiert' },
  { value: 'kein_interesse', label: 'Kein Interesse' },
  { value: 'konvertiert', label: '✅ Konvertiert' },
]

const OUTCOME_COLORS: Record<string, string> = {
  erreicht: 'bg-blue-50 text-blue-700',
  nicht_erreicht: 'bg-slate-100 text-slate-500',
  rueckruf: 'bg-amber-50 text-amber-700',
  interessiert: 'bg-violet-50 text-violet-700',
  kein_interesse: 'bg-red-50 text-red-600',
  konvertiert: 'bg-emerald-50 text-emerald-700',
}

export type LeadRow = Lead & {
  lead_categories: { categories: { slug: string; name: string } | null }[] | null
}

/** Offer a registered user looked at (offer_views) – the best opener for a sales call */
export type OfferView = { offer_id: string; title: string; slug: string; view_count: number; last_viewed_at: string }

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleString('de-DE', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function catNames(l: LeadRow): string[] {
  return (l.lead_categories ?? []).map((lc) => lc.categories?.name).filter((n): n is string => Boolean(n))
}

/** Days until the lead's IAB deadline, if it ends within 120 days – the hottest leads */
function deadlineDays(l: LeadRow): number | null {
  if (!l.iab_deadline) return null
  const days = Math.ceil((new Date(l.iab_deadline).getTime() - Date.now()) / 86400000)
  return days >= 0 && days < 120 ? days : null
}

function followUpState(l: LeadRow): 'overdue' | 'today' | null {
  if (!l.follow_up_at) return null
  const d = new Date(l.follow_up_at)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today.getTime() + 86400000)
  if (d < today) return 'overdue'
  if (d < tomorrow) return 'today'
  return null
}

export function LeadsCRM({
  leads,
  activities,
  stats,
  views,
  initialId,
}: {
  leads: LeadRow[]
  activities: LeadActivity[]
  /** Viewed offers per user_id */
  views: Record<string, OfferView[]>
  stats: { label: string; value: number; color: string }[]
  initialId?: string
}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialId ?? leads[0]?.id ?? null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<LeadStatus | ''>('')
  const [doiFilter, setDoiFilter] = useState<DoiFilter>('')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const filtered = leads.filter((l) => {
    if (statusFilter && l.status !== statusFilter) return false
    // „Verkaufbar“ = consent to share + confirmed e-mail
    if (doiFilter === 'bestaetigt' && !(needsDoi(l) && doiOk(l))) return false
    if (doiFilter === 'offen' && !(needsDoi(l) && !doiOk(l))) return false
    if (search) {
      const s = search.toLowerCase()
      return (
        l.name.toLowerCase().includes(s) ||
        l.email.toLowerCase().includes(s) ||
        (l.phone ?? '').includes(s) ||
        (l.company ?? '').toLowerCase().includes(s) ||
        catNames(l).some((n) => n.toLowerCase().includes(s))
      )
    }
    return true
  })

  const shown = filtered.slice(0, visible)
  const remaining = filtered.length - visible
  const selected = leads.find((l) => l.id === selectedId) ?? null
  const selectedActivities = activities.filter((a) => a.lead_id === selectedId)

  return (
    <div className="flex h-[calc(100vh-56px)] flex-col overflow-hidden">
      <div className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="mb-3 text-lg font-bold text-slate-900">CRM · Leads</h1>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="mt-0.5 text-xs text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* ── LEFT: lead list ─────────────────────────── */}
        <div className="flex w-64 shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white">
          <div className="shrink-0 space-y-2 border-b border-slate-100 p-3">
            <input
              type="search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setVisible(PAGE_SIZE)
              }}
              placeholder="Suchen…"
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs outline-none focus:border-slate-500"
            />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as LeadStatus | '')
                setVisible(PAGE_SIZE)
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none"
            >
              <option value="">Alle Status</option>
              {STATUS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <select
              value={doiFilter}
              onChange={(e) => {
                setDoiFilter(e.target.value as DoiFilter)
                setVisible(PAGE_SIZE)
              }}
              className="w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none"
            >
              <option value="">Alle (Double-Opt-in)</option>
              <option value="bestaetigt">✓ Bestätigt = verkaufbar</option>
              <option value="offen">Bestätigung offen</option>
            </select>
          </div>

          <div className="flex-1 divide-y divide-slate-100 overflow-y-auto">
            {shown.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">Keine Leads</p>
            ) : (
              shown.map((l) => {
                const st = STATUS.find((s) => s.value === l.status)
                const fu = followUpState(l)
                const isSel = selectedId === l.id
                return (
                  <button
                    key={l.id}
                    onClick={() => setSelectedId(l.id)}
                    className={`w-full px-3 py-2.5 text-left transition-colors ${isSel ? 'border-r-2 border-r-slate-900 bg-slate-100' : 'hover:bg-slate-50'}`}
                  >
                    <p className="truncate text-xs font-semibold text-slate-800">{l.name}</p>
                    <p className="truncate text-[10px] text-slate-500">{catNames(l).join(', ') || '–'}</p>
                    <div className="mt-1 flex items-center gap-1">
                      {st && <span className={`rounded-full border px-1.5 py-px text-[9px] font-medium ${st.color}`}>{st.label}</span>}
                      {l.source && SOURCE_BADGES[l.source] && (
                        <span className={`rounded-full border px-1.5 py-px text-[9px] font-medium ${SOURCE_BADGES[l.source].color}`}>
                          {SOURCE_BADGES[l.source].label}
                        </span>
                      )}
                      {needsDoi(l) &&
                        (doiOk(l) ? (
                          <span className="text-[9px] font-semibold text-emerald-600" title="E-Mail bestätigt">✓ DOI</span>
                        ) : (
                          <span className="text-[9px] font-medium text-slate-400" title="E-Mail noch nicht bestätigt">DOI offen</span>
                        ))}
                      {l.budget === 'gt200' && (
                        <span className="rounded-full bg-amber-400 px-1.5 py-px text-[9px] font-bold text-amber-950" title="Budget über 200.000 €: Provisionspartner">
                          💰 200k+
                        </span>
                      )}
                      {l.user_id && views[l.user_id]?.length > 0 && (
                        <span className="text-[9px] font-medium text-slate-500" title="Angesehene Angebote">👁 {views[l.user_id].length}</span>
                      )}
                      {deadlineDays(l) != null && (
                        <span className="rounded-full bg-red-600 px-1.5 py-px text-[9px] font-semibold text-white" title="IAB-Frist läuft bald ab">
                          🔥 {deadlineDays(l)} T
                        </span>
                      )}
                      {fu === 'overdue' && <span className="text-[9px] font-medium text-red-500">⚠ WV</span>}
                      {fu === 'today' && <span className="text-[9px] font-medium text-amber-500">📅 Heute</span>}
                      <span className="ml-auto text-[9px] text-slate-400">{fmtDate(l.created_at)}</span>
                    </div>
                  </button>
                )
              })
            )}
            {remaining > 0 && (
              <button onClick={() => setVisible((v) => v + PAGE_SIZE)} className="w-full py-2.5 text-center text-xs text-slate-500 hover:bg-slate-50">
                + {remaining} weitere laden
              </button>
            )}
          </div>
          <div className="shrink-0 border-t border-slate-100 px-3 py-2">
            <p className="text-[10px] text-slate-400">
              {shown.length} / {filtered.length}
            </p>
          </div>
        </div>

        {/* ── DETAIL ─────────────────────── */}
        <div className="min-w-0 flex-1 overflow-y-auto">
          {selected ? (
            <LeadDetail key={selected.id} lead={selected} activities={selectedActivities} views={selected.user_id ? views[selected.user_id] ?? [] : []} />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-sm text-slate-400">← Lead auswählen</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function LeadDetail({ lead, activities, views }: { lead: LeadRow; activities: LeadActivity[]; views: OfferView[] }) {
  const [isPending, startTransition] = useTransition()
  const [notesValue, setNotesValue] = useState(lead.notes ?? '')
  const [followUpValue, setFollowUpValue] = useState(lead.follow_up_at?.slice(0, 10) ?? '')
  const [commentText, setCommentText] = useState('')
  const [commentChannel, setCommentChannel] = useState('notiz')
  const [commentOutcome, setCommentOutcome] = useState('erreicht')

  function submitComment() {
    if (!commentText.trim()) return
    const fd = new FormData()
    fd.set('channel', commentChannel)
    fd.set('outcome', commentOutcome)
    fd.set('notes', commentText.trim())
    if (followUpValue) fd.set('follow_up_at', followUpValue)
    startTransition(async () => {
      await addLeadActivity(lead.id, fd)
      setCommentText('')
    })
  }

  const facts: [string, string | null][] = [
    ['Firma', lead.company],
    ['Rechtsform', LEGAL_FORMS.find((f) => f.value === lead.legal_form)?.label ?? null],
    ['Investition', lead.investment_cents != null ? `${formatEuro(lead.investment_cents / 100)} netto` : null],
    ['Zeitpunkt', investTimings(new Date(lead.created_at)).find((t) => t.value === lead.invest_timing)?.label ?? null],
    [
      'IAB-Betrag',
      lead.iab_amount_eur != null
        ? lead.iab_amount_eur > 0
          ? formatEuro(lead.iab_amount_eur)
          : 'noch kein IAB'
        : AMOUNTS.find((a) => a.value === lead.iab_amount)?.label ?? null,
    ],
    ['Budget', BUDGETS.find((b) => b.value === lead.budget)?.label ?? null],
    ['Gebildet für', lead.iab_year ? `WJ ${lead.iab_year}` : null],
    ['Frist', lead.iab_deadline ? new Date(lead.iab_deadline).toLocaleDateString('de-DE') : null],
    ['Ziel', GOALS.find((g) => g.value === lead.goal)?.label ?? null],
    ['Kategorien', catNames(lead).join(', ') || null],
    ['Fläche', lead.lead_type === 'flaeche' ? [lead.land_area_ha != null ? `${lead.land_area_ha.toLocaleString('de-DE')} ha` : null, lead.land_plz, LAND_TYPES.find((t) => t.value === lead.land_type)?.label].filter(Boolean).join(' · ') : null],
    ['Kampagne', [lead.utm_medium, lead.utm_campaign, lead.gclid ? 'Google Ads' : null].filter(Boolean).join(' · ') || null],
    ['Quelle', [SOURCE_BADGES[lead.source ?? '']?.label ?? lead.source, lead.landing_path, lead.utm_source].filter(Boolean).join(' · ') || null],
    ['Einwilligung', lead.consent_at ? `${fmtDateTime(lead.consent_at)} · ${lead.consent_text_version}` : null],
    ['Anruf', lead.consent_call ? 'Einwilligung erteilt' : 'keine Einwilligung'],
    ['Double-Opt-in', needsDoi(lead) ? (lead.doi_confirmed_at ? `bestätigt ${fmtDateTime(lead.doi_confirmed_at)}` : 'noch nicht bestätigt – nicht weitergeben') : null],
  ]

  return (
    <div className="space-y-4 p-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900">{lead.name}</h2>
              <a href={`mailto:${lead.email}`} className="block truncate text-sm text-blue-600 hover:underline">
                {lead.email}
              </a>
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className="text-sm font-medium text-slate-700 hover:underline">
                  {lead.phone}
                </a>
              )}
              <p className="mt-1 text-xs text-slate-400">Eingegangen {fmtDateTime(lead.created_at)}</p>
            </div>
            <select
              value={lead.status}
              disabled={isPending}
              onChange={(e) => startTransition(() => updateLeadStatus(lead.id, e.target.value as LeadStatus))}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold outline-none ${STATUS.find((s) => s.value === lead.status)?.color ?? ''}`}
            >
              {STATUS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <a href={`mailto:${lead.email}`} className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">📧 E-Mail</a>
            {lead.phone && (
              <>
                <a href={`tel:${lead.phone}`} className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">📞 Anrufen</a>
                <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50">💬 WhatsApp</a>
              </>
            )}
            <button
              type="button"
              disabled={isPending}
              onClick={() => {
                if (!window.confirm(`Lead „${lead.name}“ endgültig löschen? Notizen und Aktivitäten werden mitgelöscht. Das lässt sich nicht rückgängig machen.`)) return
                startTransition(() => deleteLead(lead.id))
              }}
              className="ml-auto rounded-lg border border-red-200 bg-white px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
            >
              🗑 Lead löschen
            </button>
          </div>
        </div>
        {lead.message && (
          <div className="border-b border-slate-100 px-5 py-4">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">Nachricht</p>
            <p className="whitespace-pre-wrap text-sm text-slate-800">{lead.message}</p>
          </div>
        )}
        {!lead.consent_share && (
          <p className="border-b border-amber-100 bg-amber-50 px-5 py-2 text-xs text-amber-800">
            Keine Einwilligung zur Weitergabe an Anbieter. Erst weitergeben, wenn der Kontakt ein Angebot ausdrücklich anfragt.
          </p>
        )}
        {lead.consent_share_text && (
          <details className="border-b border-slate-100 px-5 py-2 text-xs text-slate-500">
            <summary className="cursor-pointer">Wortlaut der Weitergabe-Einwilligung</summary>
            <p className="mt-1 italic">{lead.consent_share_text}</p>
          </details>
        )}
        <dl className="grid gap-x-6 gap-y-2 p-5 text-sm sm:grid-cols-2">
          {facts.map(([k, v]) => (
            <div key={k} className="flex gap-2">
              <dt className="w-24 shrink-0 text-slate-400">{k}</dt>
              <dd className="min-w-0 break-words font-medium text-slate-800">{v ?? '–'}</dd>
            </div>
          ))}
        </dl>
      </div>

      {/* Viewed offers (registered users only) */}
      {lead.user_id && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="px-5 py-4">
            <p className="mb-3 text-sm font-semibold text-slate-900">👁 Angesehene Angebote</p>
            {views.length === 0 ? (
              <p className="text-xs text-slate-400">Noch keine Angebote im Detail angesehen.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {views.map((v) => (
                  <li key={v.offer_id} className="flex items-center gap-3 py-2 text-sm">
                    <a href={`/${v.slug}/${v.offer_id}`} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate font-medium text-blue-600 hover:underline">
                      {v.title}
                    </a>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">{v.view_count}×</span>
                    <span className="w-28 shrink-0 text-right text-xs text-slate-400">zuletzt {fmtDate(v.last_viewed_at)}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Activity log */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <p className="mb-3 text-sm font-semibold text-slate-900">Gesprächsprotokoll</p>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              <select value={commentChannel} onChange={(e) => setCommentChannel(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none">
                {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
              <select value={commentOutcome} onChange={(e) => setCommentOutcome(e.target.value)} className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs outline-none">
                {OUTCOMES.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <input type="date" value={followUpValue} onChange={(e) => setFollowUpValue(e.target.value)} title="Wiedervorlage" className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-1.5 text-xs outline-none" />
            </div>
            <div className="flex gap-2">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) submitComment() }}
                rows={2}
                placeholder="Kommentar… (Strg+Enter)"
                className="flex-1 resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              />
              <button type="button" onClick={submitComment} disabled={isPending || !commentText.trim()} className="self-end rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-40">
                Eintragen
              </button>
            </div>
          </div>
        </div>
        {activities.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-slate-400">Noch keine Einträge.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {activities.map((act) => {
              const ch = CHANNELS.find((c) => c.value === act.channel)
              const oc = OUTCOMES.find((o) => o.value === act.outcome)
              return (
                <div key={act.id} className="flex gap-3 px-5 py-3">
                  <div className="mt-0.5 shrink-0">{ch?.label.split(' ')[0] ?? '📌'}</div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex flex-wrap items-center gap-1.5">
                      <span className="text-xs font-semibold text-slate-700">{ch?.label.split(' ').slice(1).join(' ') ?? act.channel}</span>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${OUTCOME_COLORS[act.outcome] ?? 'bg-slate-100 text-slate-500'}`}>{oc?.label ?? act.outcome}</span>
                    </div>
                    {act.notes && <p className="text-sm leading-snug text-slate-600">{act.notes}</p>}
                    <p className="mt-0.5 text-xs text-slate-400">{fmtDateTime(act.created_at)} · {act.admin_email}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Internal notes */}
      <form
        action={(fd) => startTransition(() => updateLeadCRM(lead.id, fd))}
        className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
      >
        <p className="text-sm font-semibold text-slate-900">Interne Notizen</p>
        <textarea name="notes" rows={3} value={notesValue} onChange={(e) => setNotesValue(e.target.value)} placeholder="Interne Notizen…" className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500" />
        <input type="hidden" name="follow_up_at" value={followUpValue} />
        <button type="submit" disabled={isPending} className="rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-semibold text-white hover:bg-slate-700 disabled:opacity-60">
          Speichern
        </button>
      </form>
    </div>
  )
}
