import type {ReactNode} from "react";
import type {Metadata, Viewport} from "next";
import {headers} from "next/headers";
import {isLocale} from "@/lib/locales";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "UniScribe",
    template: "%s | UniScribe"
  },
  icons: {
    icon: "/favicon.svg"
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
    <html lang={locale} dir="ltr">
      <body>{children}</body>
    </html>
  );
}
