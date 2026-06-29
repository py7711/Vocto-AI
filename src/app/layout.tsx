import type {ReactNode} from "react";
import type {Metadata} from "next";
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

export default function RootLayout({children}: {children: ReactNode}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
