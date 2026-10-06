import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { SiteModal } from "@/components/SiteModal";
import { FloatingContact } from "@/components/FloatingContact";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://iab.investments";

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
    <html lang="de" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <SiteModal />
        <FloatingContact />
      </body>
    </html>
  );
}
