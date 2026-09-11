import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mesocycle — 8-Wochen Trainingsplan",
  description: "Push/Pull-Split über acht Wochen: Sätze loggen, Progression bekommen, Deload nicht vergessen.",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Mesocycle" },
};

export const viewport: Viewport = {
  themeColor: "#12141a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
