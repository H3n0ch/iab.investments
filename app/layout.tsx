import type { Metadata } from "next";
import { Figtree } from "next/font/google";
import Script from "next/script";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteModal } from "@/components/SiteModal";
import { FloatingContact } from "@/components/FloatingContact";
import "./globals.css";

// Figtree like PVA-Invest: modern, slightly rounded, reads well in data sheets
const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://iab.investments";
// Plausible (cookieless, EU-hosted) – conversion tracking per page and category. Off when unset.
const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "IAB läuft aus? Passendes Investitionsgut finden | iab.investments",
    template: "%s | iab.investments",
  },
  description:
    "Ihr Investitionsabzugsbetrag läuft aus? Finden Sie in 30 Sekunden passende bewegliche Wirtschaftsgüter von PV über Batteriespeicher bis Tiny House. Kostenlos und unverbindlich.",
  openGraph: { type: "website", locale: "de_DE", siteName: "iab.investments" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="de" className={`${figtree.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <main className="flex-1 pt-(--header-h)">{children}</main>
        <Footer />
        <SiteModal />
        <FloatingContact />
        {PLAUSIBLE_DOMAIN && (
          <>
            {/* Queue events fired before the script has loaded */}
            <Script id="plausible-init" strategy="afterInteractive">
              {"window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}"}
            </Script>
            <Script src="https://plausible.io/js/script.js" data-domain={PLAUSIBLE_DOMAIN} strategy="afterInteractive" />
          </>
        )}
      </body>
    </html>
  );
}
