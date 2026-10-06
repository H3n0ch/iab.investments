import { Resend } from 'resend'

const FROM = process.env.RESEND_FROM ?? 'noreply@iab.investments'
const ADMIN_TO = process.env.RESEND_TO ?? 'info@iab.investments'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

function getResend(): Resend | null {
  return process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
}

function esc(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)
}

function layout(content: string): string {
  const year = new Date().getFullYear()
  return `<!DOCTYPE html>
<html lang="de">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;">
  <div style="max-width:600px;margin:24px auto 24px;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">

    <div style="background:#0f172a;padding:20px 32px;">
      <a href="${APP_URL}" style="text-decoration:none;display:inline-block;">
        <span style="font-size:22px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1;">iab<span style="color:#10b981;">.investments</span></span>
      </a>
      <p style="margin:4px 0 0;font-size:11px;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Investitionsgüter für Ihren IAB</p>
    </div>

    <div style="padding:32px;">
      ${content}
    </div>

    <div style="background:#f1f5f9;padding:16px 32px;text-align:center;border-top:1px solid #e2e8f0;">
      <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">
        © ${year} iab.investments · Keine Steuerberatung<br>
        <span style="font-size:10px;">Diese E-Mail wurde automatisch generiert.</span>
      </p>
    </div>

  </div>
</body>
</html>`
}

function row(label: string, value: string) {
  return `<tr><td style="padding:6px 0;color:#64748b;font-size:13px;width:140px;">${label}</td><td style="padding:6px 0;color:#0f172a;font-size:13px;font-weight:600;">${value}</td></tr>`
}

export type LeadMailData = {
  id: string
  name: string
  email: string
  phone: string | null
  company: string | null
  amountLabel: string | null
  deadline: string | null
  goalLabel: string | null
  categoryNames: string[]
  source: string
  /** Free text from the contact form */
  message?: string | null
  /** Further labelled values (offer, legal form, investment, timing, call consent) */
  extra?: [string, string][]
}

const SOURCE_LABELS: Record<string, string> = {
  registrierung: 'Registrierung',
  kontakt: 'Kontaktanfrage',
  rechner: 'IAB-Rechner',
  frist: 'Frist-Lead (IAB auflösen)',
  angebot: 'Angebotsanfrage',
}

export async function sendLeadAdminNotification(lead: LeadMailData) {
  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: [ADMIN_TO],
    replyTo: lead.email,
    subject: `Neuer IAB-Lead: ${lead.name} · ${lead.categoryNames.join(', ') || SOURCE_LABELS[lead.source] || lead.source}`,
    html: layout(`
      <p style="color:#10b981;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 6px;">Neuer Lead</p>
      <h1 style="color:#0f172a;font-size:20px;margin:0 0 20px;line-height:1.3;">${esc(lead.name)}</h1>
      <table style="width:100%;border-collapse:collapse;">
        ${row('E-Mail', esc(lead.email))}
        ${lead.phone ? row('Telefon', esc(lead.phone)) : ''}
        ${lead.company ? row('Firma', esc(lead.company)) : ''}
        ${lead.amountLabel ? row('IAB-Betrag', esc(lead.amountLabel)) : ''}
        ${lead.deadline ? row('Frist', esc(lead.deadline)) : ''}
        ${lead.goalLabel ? row('Ziel', esc(lead.goalLabel)) : ''}
        ${lead.categoryNames.length ? row('Kategorien', esc(lead.categoryNames.join(', '))) : ''}
        ${(lead.extra ?? []).map(([k, v]) => row(esc(k), esc(v))).join('')}
        ${row('Quelle', esc(SOURCE_LABELS[lead.source] ?? lead.source))}
        ${lead.message ? row('Nachricht', esc(lead.message).replace(/\n/g, '<br>')) : ''}
      </table>
      <a href="${APP_URL}/admin/leads?id=${lead.id}" style="display:inline-block;margin-top:24px;background:#059669;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">Im CRM öffnen →</a>
    `),
  })
}

export async function sendLeadConfirmation(lead: LeadMailData) {
  const resend = getResend()
  if (!resend) return
  const firstName = lead.name.split(' ')[0]
  await resend.emails.send({
    from: FROM,
    to: [lead.email],
    replyTo: ADMIN_TO,
    subject: 'Ihre IAB-Anfrage ist eingegangen',
    html: layout(`
      <h1 style="color:#0f172a;font-size:20px;margin:0 0 12px;line-height:1.3;">Danke, ${esc(firstName)}!</h1>
      <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Wir haben Ihre Anfrage erhalten. Passende Anbieter aus den Bereichen <strong>${esc(lead.categoryNames.join(', '))}</strong> melden sich in Kürze bei Ihnen. Das ist für Sie kostenlos und unverbindlich.
      </p>
      ${lead.deadline ? `<p style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;color:#92400e;font-size:13px;margin:0 0 16px;">Ihre Investitionsfrist läuft voraussichtlich bis zum <strong>${esc(lead.deadline)}</strong>. Planen Sie Lieferzeiten ein.</p>` : ''}
      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;">
        Hinweis: Wir stellen den Kontakt zu Anbietern her und beraten nicht zu konkreten Angeboten oder in Steuerfragen. Verträge schließen Sie direkt mit dem Anbieter. Ob ein Wirtschaftsgut steuerlich für Ihren IAB geeignet ist, klären Sie bitte mit Ihrem Steuerberater. Ihre Einwilligung zur Weitergabe können Sie jederzeit per Antwort auf diese E-Mail widerrufen.
      </p>
    `),
  })
}

export type OfferInquiryMail = {
  name: string
  email: string
  offerTitle: string
  offerUrl: string
  /** Magic link that signs the lead in and opens the offer with all details; null when signed in already */
  accessLink: string | null
  deadline: string | null
}

/** Confirmation of an offer inquiry, carrying the magic link to the unlocked offer. Returns false without Resend. */
export async function sendOfferInquiryConfirmation(m: OfferInquiryMail): Promise<boolean> {
  const resend = getResend()
  if (!resend) return false
  const link = m.accessLink ?? m.offerUrl
  await resend.emails.send({
    from: FROM,
    to: [m.email],
    replyTo: ADMIN_TO,
    subject: `Ihre Anfrage: ${m.offerTitle}`,
    html: layout(`
      <h1 style="color:#0f172a;font-size:20px;margin:0 0 12px;line-height:1.3;">Danke, ${esc(m.name.split(' ')[0])}!</h1>
      <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Ihre Anfrage zu <strong>${esc(m.offerTitle)}</strong> ist eingegangen. Der Anbieter meldet sich in Kürze bei Ihnen, kostenlos und unverbindlich.
      </p>
      <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Über diesen Link sehen Sie alle Details, Kennzahlen und Unterlagen zum Angebot${m.accessLink ? '. Ein Passwort brauchen Sie dafür nicht' : ''}:
      </p>
      <a href="${link}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">Angebotsdetails ansehen →</a>
      ${m.accessLink ? '<p style="color:#64748b;font-size:12px;line-height:1.6;margin:8px 0 0;">Der Link ist aus Sicherheitsgründen nur begrenzt gültig. Später legen Sie über „Passwort vergessen“ auf der Anmeldeseite jederzeit ein Passwort für Ihr Konto fest.</p>' : ''}
      ${m.deadline ? `<p style="background:#fffbeb;border:1px solid #fde68a;border-radius:8px;padding:12px 16px;color:#92400e;font-size:13px;margin:16px 0 0;">Ihre Investitionsfrist läuft voraussichtlich bis zum <strong>${esc(m.deadline)}</strong>. Planen Sie Lieferzeiten ein.</p>` : ''}
      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:16px 0 0;">
        Hinweis: Wir stellen den Kontakt zum Anbieter her und beraten nicht zu konkreten Angeboten oder in Steuerfragen. Verträge schließen Sie direkt mit dem Anbieter. Ihre Einwilligungen zur Weitergabe und zum Anruf können Sie jederzeit per Antwort auf diese E-Mail widerrufen.
      </p>
    `),
  })
  return true
}

export type ProviderMailData = {
  id: string
  company: string
  contactName: string
  email: string
  phone: string | null
  website: string | null
  categoryName: string
  title: string
  minInvestment: string | null
}

export async function sendProviderAdminNotification(p: ProviderMailData) {
  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: [ADMIN_TO],
    replyTo: p.email,
    subject: `Neue Anbieter-Einreichung: ${p.company} · ${p.title}`,
    html: layout(`
      <p style="color:#10b981;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 6px;">Neue Einreichung</p>
      <h1 style="color:#0f172a;font-size:20px;margin:0 0 20px;line-height:1.3;">${esc(p.title)}</h1>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Firma', esc(p.company))}
        ${row('Ansprechpartner', esc(p.contactName))}
        ${row('E-Mail', esc(p.email))}
        ${p.phone ? row('Telefon', esc(p.phone)) : ''}
        ${p.website ? row('Website', esc(p.website)) : ''}
        ${row('Kategorie', esc(p.categoryName))}
        ${p.minInvestment ? row('Einstieg', esc(p.minInvestment)) : ''}
      </table>
      <a href="${APP_URL}/admin/anbieter" style="display:inline-block;margin-top:24px;background:#059669;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">Prüfen und freischalten →</a>
    `),
  })
}

export async function sendProviderConfirmation(p: ProviderMailData) {
  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: [p.email],
    replyTo: ADMIN_TO,
    subject: 'Ihre Produktvorstellung bei iab.investments',
    html: layout(`
      <h1 style="color:#0f172a;font-size:20px;margin:0 0 12px;line-height:1.3;">Danke, ${esc(p.contactName.split(' ')[0])}!</h1>
      <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Wir haben Ihre Einreichung <strong>${esc(p.title)}</strong> erhalten. Wir sichten das Produkt und melden uns in den nächsten Werktagen bei Ihnen, um Details und Konditionen zu besprechen. Nach der Freischaltung ist Ihr Angebot für Unternehmer mit Investitionsabzugsbetrag sichtbar.
      </p>
      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;">
        Rückfragen? Antworten Sie einfach auf diese E-Mail.
      </p>
    `),
  })
}

export type PartnerMailData = { firm: string; contactName: string; email: string; phone: string | null; city: string | null }

export async function sendPartnerAdminNotification(p: PartnerMailData) {
  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: [ADMIN_TO],
    replyTo: p.email,
    subject: `Neue Partner-Anmeldung: ${p.firm}`,
    html: layout(`
      <p style="color:#10b981;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 6px;">Partnerprogramm Steuerberater</p>
      <h1 style="color:#0f172a;font-size:20px;margin:0 0 20px;line-height:1.3;">${esc(p.firm)}</h1>
      <table style="width:100%;border-collapse:collapse;">
        ${row('Ansprechpartner', esc(p.contactName))}
        ${row('E-Mail', esc(p.email))}
        ${p.phone ? row('Telefon', esc(p.phone)) : ''}
        ${p.city ? row('Ort', esc(p.city)) : ''}
      </table>
      <a href="${APP_URL}/admin/partner" style="display:inline-block;margin-top:24px;background:#059669;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">Prüfen und freischalten →</a>
    `),
  })
}

export async function sendPartnerConfirmation(p: PartnerMailData) {
  const resend = getResend()
  if (!resend) return
  await resend.emails.send({
    from: FROM,
    to: [p.email],
    replyTo: ADMIN_TO,
    subject: 'Ihre Anmeldung zum Partnerprogramm von iab.investments',
    html: layout(`
      <h1 style="color:#0f172a;font-size:20px;margin:0 0 12px;line-height:1.3;">Vielen Dank, ${esc(p.contactName)}!</h1>
      <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Wir haben die Anmeldung von <strong>${esc(p.firm)}</strong> erhalten und melden uns in den nächsten Werktagen persönlich. Nach der Freischaltung erhalten Sie Ihren persönlichen Empfehlungslink für Ihre Mandanten.
      </p>
      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;">Rückfragen? Antworten Sie einfach auf diese E-Mail.</p>
    `),
  })
}

export async function sendPartnerActivation(p: { firm: string; contactName: string; email: string; code: string }) {
  const resend = getResend()
  if (!resend) return
  const link = `${APP_URL}/empfehlung/${p.code}`
  await resend.emails.send({
    from: FROM,
    to: [p.email],
    replyTo: ADMIN_TO,
    subject: 'Ihr Empfehlungslink für iab.investments',
    html: layout(`
      <h1 style="color:#0f172a;font-size:20px;margin:0 0 12px;line-height:1.3;">Willkommen im Partnerprogramm, ${esc(p.contactName)}!</h1>
      <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 16px;">
        ${esc(p.firm)} ist freigeschaltet. Geben Sie diesen Link an Mandanten weiter, deren Investitionsabzugsbetrag ausläuft. Anfragen über diesen Link ordnen wir Ihrer Kanzlei zu.
      </p>
      <p style="background:#f1f5f9;border-radius:8px;padding:12px 16px;font-size:14px;margin:0 0 16px;"><a href="${link}" style="color:#047857;font-weight:600;">${link}</a></p>
      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:0;">
        Wir stellen nur den Kontakt zu Anbietern her und beraten Ihre Mandanten weder steuerlich noch zu konkreten Angeboten. Die steuerliche Beurteilung bleibt bei Ihnen.
      </p>
    `),
  })
}

export async function sendPasswordReset(p: { email: string; link: string }): Promise<boolean> {
  const resend = getResend()
  if (!resend) return false
  await resend.emails.send({
    from: FROM,
    to: [p.email],
    replyTo: ADMIN_TO,
    subject: 'Passwort zurücksetzen – iab.investments',
    html: layout(`
      <h1 style="color:#0f172a;font-size:20px;margin:0 0 12px;line-height:1.3;">Neues Passwort festlegen</h1>
      <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 16px;">
        Sie haben angefordert, Ihr Passwort zurückzusetzen. Klicken Sie auf den Button, um ein neues Passwort festzulegen. Der Link ist eine Stunde gültig.
      </p>
      <a href="${p.link}" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">Neues Passwort festlegen →</a>
      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:16px 0 0;">
        Sie haben das nicht angefordert? Dann ignorieren Sie diese E-Mail einfach. Ihr Passwort bleibt unverändert.
      </p>
    `),
  })
  return true
}

export type CalcReportMail = {
  name: string
  email: string
  rows: [string, string][]
  saving: string
  hint: string
}

/** Calculator result for the lead; returns false when Resend isn't configured */
export async function sendCalcReport(r: CalcReportMail): Promise<boolean> {
  const resend = getResend()
  if (!resend) return false
  await resend.emails.send({
    from: FROM,
    to: [r.email],
    replyTo: ADMIN_TO,
    subject: `Ihr IAB-Bericht: ${r.saving} Steuerersparnis`,
    html: layout(`
      <p style="color:#10b981;font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;margin:0 0 6px;">IAB-Rechner</p>
      <h1 style="color:#0f172a;font-size:20px;margin:0 0 6px;line-height:1.3;">Hallo ${esc(r.name.split(' ')[0])}, Ihre Steuerersparnis: ${esc(r.saving)}</h1>
      <p style="color:#334155;font-size:14px;line-height:1.6;margin:0 0 16px;">Hier ist Ihr Ergebnis aus dem IAB-Rechner im Überblick.</p>
      <table style="width:100%;border-collapse:collapse;">
        ${r.rows.map(([k, v]) => row(esc(k), esc(v))).join('')}
      </table>
      <p style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:12px 16px;color:#065f46;font-size:13px;line-height:1.6;margin:16px 0;">${esc(r.hint)}</p>
      <a href="${APP_URL}/angebote" style="display:inline-block;background:#059669;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">Passende Angebote ansehen →</a>
      <p style="color:#64748b;font-size:12px;line-height:1.6;margin:16px 0 0;">
        Rechenhilfe, keine Steuerberatung. Der IAB ist eine Steuerstundung: Im Jahr der Investition wird er dem Gewinn wieder hinzugerechnet. Lassen Sie Ihre Situation von Ihrem Steuerberater prüfen.
      </p>
    `),
  })
  return true
}
