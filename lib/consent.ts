// Bump the version whenever the wording changes – it's stored with every lead as proof of consent.
// Wording of the share and call consents: have it reviewed by a lawyer before selling leads.
export const CONSENT_VERSION = '2026-10-v3'

export const CONSENT_PRIVACY_TEXT =
  'Ich habe die Datenschutzerklärung gelesen und bin mit der Verarbeitung meiner Angaben zur Bearbeitung meiner Anfrage einverstanden.'

/** Shown next to every inquiry form – how the site is paid */
export const FEE_NOTE = 'Für Sie kostenlos und unverbindlich. iab.investments wird von den Anbietern vergütet.'

const SHARED_DATA = 'Name, E-Mail, Telefon, Firma, Rechtsform, IAB-Betrag, Frist, Budget, Zeitpunkt'

/** General inquiry (category pages, deadline check, guides): selected providers of the chosen categories */
export function categoryShareText(categoryNames: string[]): string {
  const cats = categoryNames.length ? `der Kategorie${categoryNames.length > 1 ? 'n' : ''} ${categoryNames.join(', ')}` : 'der von mir gewählten Kategorien'
  return `Ich willige ein, dass iab.investments meine Kontaktdaten und Angaben (${SHARED_DATA}) an ausgewählte Anbieter ${cats} weitergibt, damit diese mich zu passenden Projekten kontaktieren. Die Anbieter verarbeiten meine Daten in eigener Verantwortung. Ich kann die Einwilligung jederzeit mit Wirkung für die Zukunft per E-Mail an info@iab.investments widerrufen.`
}

/** Generic wording for the privacy policy */
export const CONSENT_SHARE_TEXT = categoryShareText([])

/** Offer inquiry: only the provider of this one offer */
export function offerShareText(offerTitle: string, categoryName: string): string {
  return `Ich willige ein, dass iab.investments meine Kontaktdaten und Angaben (${SHARED_DATA}) an den Anbieter des Projekts „${offerTitle}“ (Kategorie ${categoryName}) weitergibt, damit dieser mich zu diesem Projekt kontaktiert. Der Anbieter verarbeitet meine Daten in eigener Verantwortung. Ich kann die Einwilligung jederzeit mit Wirkung für die Zukunft per E-Mail an info@iab.investments widerrufen.`
}

/** Landowner inquiry (/solarpark-flaeche-verpachten): solar park developers */
export const LAND_SHARE_TEXT =
  'Ich willige ein, dass iab.investments meine Kontaktdaten und Angaben zur Fläche (Name, E-Mail, Telefon, Größe, Lage, Flächenart) an ausgewählte Solarpark-Projektierer weitergibt, damit diese mich zu einer möglichen Pacht kontaktieren. Die Projektierer verarbeiten meine Daten in eigener Verantwortung. Ich kann die Einwilligung jederzeit mit Wirkung für die Zukunft per E-Mail an info@iab.investments widerrufen.'

export const CONSENT_CALL_TEXT =
  'Ich bin einverstanden, dass mich iab.investments und die Anbieter, an die meine Angaben weitergegeben werden, zu meiner Anfrage telefonisch kontaktieren. Diese Einwilligung kann ich jederzeit mit Wirkung für die Zukunft widerrufen.'

export const DISCLAIMER =
  'iab.investments hilft bei der Auswahl passender Investitionsgüter für den Investitionsabzugsbetrag und stellt den Kontakt zu Anbietern her. Wir beraten nicht zu konkreten Angeboten, wirken nicht an Vertragsabschlüssen mit und erbringen keine Steuer-, Rechts- oder Anlageberatung. Verträge schließen Sie direkt mit dem Anbieter. Ob ein Wirtschaftsgut steuerlich für Ihren Investitionsabzugsbetrag geeignet ist, klären Sie bitte mit Ihrem Steuerberater. Renditeangaben stammen von den Anbietern und sind nicht garantiert.'
