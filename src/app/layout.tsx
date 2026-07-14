import type {ReactNode} from "react";
import type {Metadata, Viewport} from "next";
import {headers} from "next/headers";
import {isLocale} from "@/lib/locales";
import {DEFAULT_OG_IMAGE, SITE_ORIGIN} from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_ORIGIN),
  title: {
    default: "Votxt",
    template: "%s | Votxt"
  },
  icons: {
    icon: "/favicon.svg"
  },
  openGraph: {
    siteName: "Votxt",
    images: [{url: DEFAULT_OG_IMAGE, width: 1200, height: 630, alt: "Votxt AI transcription workspace"}]
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({children}: {children: ReactNode}) {
  const localeCandidate = headers().get("X-NEXT-INTL-LOCALE") ?? undefined;
  const locale = isLocale(localeCandidate) ? localeCandidate : "en";

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"}>
      <body>{children}</body>
    </html>
  );
}
