# iab.investments

Ratgeber- und Vermittlungsportal rund um den **Investitionsabzugsbetrag (IAB)** mit Schaufenster für echte Projekte.
Besucher informieren sich, prüfen ihre Frist und fordern Unterlagen an. **Jeder Lead geht an uns**, nicht direkt an den Anbieter.
Wir qualifizieren ihn telefonisch und verkaufen ihn pro Lead oder bei großen Tickets ab ca. 200.000 € gegen Provision.

- **Zielgruppe:** Selbständige, Freiberufler, kleine GmbHs mit IAB-Frist oder Steuerlast vor Jahresende
- **Kategorien live:** PV-Direktinvestment, Batteriespeicher, Mobile Tiny Houses
- **„Bald verfügbar“** (Musterprojekt + Vormerken): Wohnmobile, Ladeinfrastruktur, Container, Werbeflächen, Bitcoin-Miner
- **Kein Marktplatz:** Anbieter bleiben unsichtbar. Den Kontakt stellen wir persönlich her. Der Marktplatz-Code bleibt erhalten, falls wir später umbauen.

Technik: Next.js 16 (App Router), Supabase (Region Frankfurt), Resend (E-Mail), Tailwind 4, Plausible, Hosting Netlify.

---

## Seitenübersicht

### Öffentliche Seiten
| URL | Zweck | Ziel-Keyword (Suchen/Monat · KD) | Status |
|---|---|---|---|
| `/` | Startseite: Suche, Kategorien, neueste Projekte, Frist-Box | – | ✅ |
| `/iab-aufloesen` | Auflösungs-/Zinsrechner, Frist-Übersicht | iab auflösen 390 · 19, auflösung iab 320 · 13 | ✅ → Pilot fürs neue Template |
| `/iab-2023-frist`, `/iab-2024-frist` | Frist-Check mit Countdown je Jahrgang | investitionsabzugsbetrag 2023 320 · 27 / 2024 590 · 24 | ✅ |
| `/iab-rechner` (+ `/iab-rechner/<kategorie>`) | IAB-Rechner mit Beispielrechnung | iab rechner | ✅ |
| `/iab-photovoltaik` | Ratgeber IAB + PV | investitionsabzugsbetrag photovoltaik 210 · 24 | ✅ |
| `/degressive-afa-bewegliche-wirtschaftsgueter` | Degressive AfA 2025/2026 | degressive afa 2025 880 · 15 | ✅ |
| `/solarpark-anteile-kaufen` | Direktinvestment vs. Fonds vs. Aktie | anteile solarpark kaufen 50 | ✅ |
| `/solarpark-flaeche-verpachten` | Eigener Funnel für Landeigentümer | fläche für solarpark verpachten 90 · 8 | ✅ |
| `/<kategorie>` z. B. `/photovoltaik-iab` | Kategorieseite mit Projekten | – | ✅ |
| `/<kategorie>/<id>` | Projektseite mit Datenblatt, Formular als Modal | – | ✅ |
| `/angebote` | Alle Projekte, Filter nach Kategorie/Land/Budget | – | ✅ |
| `/ratgeber`, `/ratgeber/<slug>` | Ratgeber-Hub und Artikel (`lib/wissen.ts`) | diverse | ✅ |
| `/so-funktionierts`, `/steuerberater`, `/anbieter` | Ablauf, Partnerprogramm, Infos für Anbieter + Prüfkriterien | – | ✅ |
| `/empfehlung/<code>` | Landingpage für Steuerberater-Partner (noindex) | – | ✅ |
| `/lp/iab-frist?jahr=2024` | Google-Ads-Landingpage ohne Navigation (noindex) | – | ✅ |
| `/anfrage/bestaetigt` | Danke-Seite nach Double-Opt-in | – | ✅ |
| `/iab-aufloesen-bei-anschaffung` | Buchung & Beispiel bei Anschaffung | auflösung iab bei anschaffung beispiel 320 · 16 | geplant |
| `/iab-2025` | IAB 2025 bilden/Frist | investitionsabzugsbetrag 2025 260 · 24 | geplant |
| `/investitionsabzugsbetrag-beispiel` | 5 Fallbeispiele live berechnet | investitionsabzugsbetrag beispiel 480 · 22 | geplant |
| `/solarpark-kaufen` | Kaufnahe Projektliste mit Marktüberblick | solarpark kaufen 480 · 23 | geplant |
| `/degressive-afa-rechner` | Rechner linear vs. degressiv vs. IAB | degressive afa berechnen 210 · 22 | geplant |
| `/iab-frist-abgelaufen` | Corona-Sonderfristen 2017–2021 | iab 2020 wann auflösen 170 · 12 | geplant |
| `/investitionsabzugsbetrag` | Pillar-Seite (heute `/ratgeber/investitionsabzugsbetrag`) | investitionsabzugsbetrag 3.600 · 40 | geplant |

Vollständiger SEO-Plan mit Keyword-Zuordnung, Lead-Prognose und Reihenfolge: siehe Projektplan (Abschnitt „SEO-Plan“).
Regel: **eine Seite pro Suchabsicht.** Kleine Keyword-Varianten kommen als H2 oder FAQ auf die Hauptseite.

### Admin (`/admin`, nur E-Mails aus `ADMIN_EMAILS`)
| Bereich | Was es kann |
|---|---|
| `/admin` | Dashboard: neue Leads, Wiedervorlagen, Anfragen pro Monat nach Kanal (organisch/Paid/Partner), nach Seite und Kategorie, Partner-Codes, Link zum Google-Ads-CSV |
| `/admin/leads` | CRM: Status, Notizen, Aktivitäten, Wiedervorlage, Filter „Double-Opt-in bestätigt = verkaufbar“, Badge 💰 200k+, **Lead löschen** |
| `/admin/offers` | Projekte anlegen/**bearbeiten** mit Datenblatt je Kategorie, veröffentlichen, löschen |
| `/admin/anbieter` | Eingereichte Anbieter-Produkte sichten und freischalten |
| `/admin/partner` | Steuerberater-Partner freischalten (Empfehlungscode) |
| `/admin/export/ads-conversions` | CSV für den Google-Ads-Offline-Conversion-Import (bestätigte Leads mit gclid) |

---

## Funnel & Leads
**Formular „Unterlagen & Kalkulation anfordern“** (`components/LeadForm.tsx`, auf Ratgeber- und Projektseiten als Modal `components/InquiryModal.tsx`).

**2 Seiten, Fragen zuerst, gespeichert wird nur beim Absenden:**

| Seite | Inhalt |
|---|---|
| 1 · Ihre Situation | Investitionsgut (Mehrfachauswahl), IAB-Betrag + Jahrgang mit Live-Frist (oder „Noch kein IAB gebildet“), Budget mit „passt“-Markierung, Zeitpunkt nur ohne bekannte Frist. „Weiter“ prüft nur, speichert nichts. |
| 2 · Kontakt | Kurz-Zusammenfassung passender Projekte (`getInquirySummary`), Name, Telefon, E-Mail, Rückrufzeit, Firma (optional), Einwilligungen. „Kostenlos anfordern“ ruft `submitInquiry` auf. |

- **Vor dem Absenden wird nichts gespeichert**, auch nicht beim Schließen des Modals.
- **Einwilligungen:** Rückruf und Datenschutz sind Pflicht, die **Weitergabe an Anbieter ist optional** („empfohlen“).
  - **Mit Weitergabe:** Lead vollständig (`completed_at`), Double-Opt-in-Mail, Admin-Mail, Projektdetails freigeschaltet.
  - **Ohne Weitergabe:** Lead „ohne Weitergabe“ (`form_step='kontakt'`, `completed_at` leer), Admin-Mail „📞 Neuer Kontakt (ohne Weitergabe)“. **Anrufen ja, verkaufen nein**, im Gespräch die Einwilligung einholen. Im CRM Badge „⏳ ohne Weitergabe“ und Filter „Ohne Weitergabe (anrufen)“.
- **Bekannte Werte sind vorbelegt**, etwa IAB und Frist aus dem Rechner, Kategorie aus der Projektvorschau oder das Projekt auf Projektseiten.
- **Verkaufbar** ist ein Lead erst mit Weitergabe-Einwilligung **und** bestätigter E-Mail (`doi_confirmed_at`).
- **Doppelte:** Gleiche E-Mail oder Telefonnummer innerhalb von 30 Tagen wird dem bestehenden Lead zugeordnet und als Aktivität „Erneut angefragt“ vermerkt.
- **Lead-Bewertung** 🔥 Heiß / Warm / Kalt (`lib/lead-score.ts`) aus Frist-Nähe, Budget und Zeitpunkt. Im CRM lässt sich danach sortieren.
- **Dashboard:** Kachel „Ohne Weitergabe (7 Tage)“ und die Zeile „mit / ohne Weitergabe“ (30 Tage) zeigen, wie viele Anfragen verkaufbar sind.
- **Einwilligungen:** Kurztext mit ausklappbarem Volltext aus `lib/consent.ts`. Häkchen sind **nie vorangekreuzt**, das wäre unwirksam (EuGH Planet49). Bei jeder Textänderung `CONSENT_VERSION` erhöhen.
- **Lead-Typen:** `investor` (Standard), `flaeche` (Landeigentümer) und weiche Kontakte `source='ergebnis'` (gespeicherte Rechner-Ergebnisse, nicht verkaufbar).
- **Server-Actions** in `lib/actions/leads.ts`: `submitInquiry`, `getInquirySummary`, `submitLandLead`, `saveResult`, `submitCalcReport`, `submitContact`.

## Datenblätter (Projekte)
Jede Kategorie hat ein festes Datenblatt in **`lib/datasheets.ts`**: PV, Batteriespeicher, Tiny House. Jedes Feld hat eine von drei Stufen:

| Stufe | Wo sichtbar | Beispiele (PV) |
|---|---|---|
| `public` | für alle | Art, Leistung, Status, Netzanschluss, Einspeiseart |
| `inquiry` | nach der Anfrage, vorher verschwommen | Kaufpreis, Preis je kWp, Rendite, Ertrag, Pacht |
| `personal` | **nie online**, nur im Gespräch | Betreiber, Hersteller, Park, genauer Standort |

Der Anbietername erscheint nie auf der Seite. Die persönliche Vorstellung beim Anbieter ist das, was wir verkaufen.
Gepflegt wird im Admin unter `/admin/offers` → Bearbeiten. Unterlagen nur **ohne Anbieter-Logo** hochladen.

## Ratgeber-Template (Pilot: `/iab-aufloesen`)
Ruhige Seiten mit festem **Element-Budget**, denn verspielte Seiten lassen Leute abspringen. Höchstens diese Elemente, in dieser Reihenfolge (Bausteine in `components/seo/`):

1. **Hero:** H1, Kurzantwort (`QuickAnswer`), **ein** grüner Button (`CtaButton`) + Vertrauenszeile (`TrustLine`). Kein Werkzeug, keine Kacheln.
2. **„Das Wichtigste in Kürze“** (`KeyFacts`), Inhaltsverzeichnis (`Toc`) nur bei mehr als 5 Abschnitten.
3. **Text-Abschnitte** (`Section`) mit **einer** eigenen Grafik oder Tabelle (z. B. `ZinsTimeline`).
4. **Projektvorschau** (`ProjectPreview`, `#projekte`): 2–3 echte Projekte, darüber eine Zeile mit Marktzahlen. Gesperrte Kennzahlen sind unscharf, die Platzhalter kommen aus den `mask`-Werten. Der Button „Details freischalten“ öffnet das Modal mit der Kategorie.
5. **Werkzeug zugeklappt** (`<details id="rechner">`). Unter dem Ergebnis steht „Ergebnis speichern & Frist-Erinnerung erhalten“ (`SaveResult`): nur E-Mail, kein Passwort. Das ergibt einen weichen Kontakt (`source='ergebnis'`, nicht verkaufbar) mit Ergebnis-E-Mail, und der Link öffnet den Rechner vorbelegt (`?iab=…&jahr=…#rechner`).
6. **FAQ**, Quellen als eine Textzeile (`Sources`), Weiterlesen.
7. Strukturierte Daten aus `lib/seo.ts`: Article, BreadcrumbList, FAQPage.

**Regeln:**
- Nur **ein** grüner Button gleichzeitig im Blick.
- Keine CTA-Karten im Text, keine Pop-ups.
- Kein Block „Über iab.investments“ auf Ratgeber-Seiten (nur Startseite).
- Keine Praxis- oder Prüfer-Boxen.
- Sticky-Button „Aktuelle Projekte ansehen“ erst ab halber Seite, ausgeblendet bei sichtbarer Projektvorschau. Auf Projektseiten heißt er „Unterlagen & Kalkulation anfordern“.

Der Marktüberblick als Kacheln (`MarketSnapshot`) ist für Kaufseiten wie `/solarpark-kaufen` gedacht.

## Design
- **Farben** in `app/globals.css`:
  - Schiefergrau `#1e293b` (`--color-hero`) für Hero und Header
  - Signalgrün `#7bb831` (`--color-emerald-600`) für alle Buttons. Die ganze `emerald-*`-Skala ist darauf umgestellt.
- **Schrift:** Figtree (wie PVA-Invest), über `next/font`.
- **Hero-Muster:** Erste `<section>` einer Seite mit Klasse `hero-under-header`. Der Header liegt dann transparent darüber, sonst bleibt er ein dunkler Balken.
- **Sticky-Button:** `components/FloatingContact.tsx` erscheint automatisch auf Seiten mit Formular (`#anfrage`).

## Tracking & Messen
- **Plausible** (ohne Cookies), aktiv nur mit `NEXT_PUBLIC_PLAUSIBLE_DOMAIN`. Events (`lib/track.ts`):
  - `Frist-Check`, `Rechner genutzt` (Einstiegsfrage beantwortet)
  - `CTA geklickt` (mit Position `wo`, z. B. `hero`, `rechner-ergebnis`), `Details freischalten`, `Ergebnis gespeichert`
  - `Formular geöffnet`
  - `Wizard Schritt`
  - `Lead`
  - `DOI bestätigt`
  - `Sticky CTA`
- **Admin-Dashboard:** Anfragen nach Seite, Kategorie, Kanal und Partner-Code.
- **Google Ads:** Die `gclid` wird je Lead gespeichert. Conversions laufen per CSV-Upload, ohne Cookie-Banner.

---

## Einrichtung

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # Produktions-Build
npm run lint
```

### Umgebungsvariablen (`.env.local`, Vorlage `.env.example`)
| Variable | Wofür |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Supabase-Projekt (öffentlich) |
| `SUPABASE_SECRET_KEY` | Serverseitiger Zugriff (Leads, gesperrte Datenblatt-Werte). **Nie öffentlich machen** |
| `RESEND_API_KEY` | E-Mail-Versand. **Ohne Key gehen keine Bestätigungs-E-Mails raus**, dann wird kein Lead verkaufbar |
| `RESEND_FROM`, `RESEND_TO` | Absender und Empfänger der Lead-Benachrichtigungen |
| `NEXT_PUBLIC_APP_URL` | Basis-URL für Links, Sitemap, E-Mails |
| `ADMIN_EMAILS` | Kommagetrennt. Diese Nutzer dürfen in `/admin` |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | Plausible-Domain, leer = kein Tracking |
| `GOOGLE_ADS_CONVERSION_NAME` | Optional, Name der Conversion im Ads-CSV (Standard „IAB Lead bestätigt“) |

### Datenbank (Supabase)
Das komplette Schema steht in **`supabase/schema.sql`**. Jeder Block ist datiert und kann erneut ausgeführt werden (`if not exists`).
**Neue Blöcke immer im Supabase SQL-Editor ausführen, bevor der Code deployt wird.** Sonst fehlen Spalten, und Seiten zeigen keine Projekte mehr.
Die letzten Blöcke (Oktober 2026) sind „Mehrstufiges Anfrageformular, Double-Opt-in & Flächen-Leads“, „Datenblätter pro Kategorie“ und **„Anfrage: Kontakt zuerst, jeder Schritt wird gespeichert“**.

---

## Wo was liegt
| Pfad | Inhalt |
|---|---|
| `app/` | Seiten und Routen (App Router) |
| `components/` | UI. Wichtig: `LeadForm`, `InquiryModal`, `FristCheck`, `AufloesenRechner`, `IabRechner`, `ArticleView`, `offer/Datasheet`, `TrustBlock`, `FloatingContact`, `Header` |
| `components/admin/` | CRM (`LeadsCRM`), Angebotsformular (`OfferForm`) |
| `lib/categories.ts` | Kategorien inkl. „bald verfügbar“ und Musterprojekte |
| `lib/datasheets.ts` | Datenblatt-Vorlagen und Sichtbarkeitsstufen |
| `lib/wissen.ts` | Ratgeber-Artikel (Inhalt, FAQ, optionale Root-URL über `path`) |
| `lib/iab.ts`, `lib/tax.ts`, `lib/rechner.ts`, `lib/aufloesen.ts` | IAB-Fristen, Steuertarif, Rechner-Logik, Auflösungskosten |
| `lib/actions/` | Server-Actions (Leads, Admin, Anbieter, Partner, Login) |
| `lib/consent.ts`, `lib/email.ts`, `lib/track.ts` | Einwilligungen, E-Mails, Tracking |
| `supabase/schema.sql` | Datenbankschema und Migrationen |
| `next.config.ts` | 308-Weiterleitungen für umgezogene Artikel |

---

## Offen vor dem Livegang
- [ ] **Anwalt:** Tippgeber vs. Anlagevermittlung (§ 34f GewO), Einwilligungstexte, Kundenschutzvereinbarung mit Abnehmern (12–24 Monate)
- [ ] **Demo-Angebote** in der Datenbank löschen bzw. durch echte, freigegebene Projekte ersetzen (Testwerte mit „Muster GmbH“)
- [ ] `RESEND_API_KEY` und `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` in der Produktion setzen
- [ ] `app/farben` (Farbvorschau) löschen
- [ ] Impressum und Datenschutz final prüfen (Platzhalter in eckigen Klammern)
- [ ] Google Search Console einrichten, Sitemap einreichen
