import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { MotionProvider } from "@/components/ui/MotionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "FLUENT is a personal English operating system for a B2 German speaker aiming for C1–C2: vocabulary in context, listening with real accents, speaking analysis, writing feedback, debate, real-life simulations and an AI tutor.";

export const metadata: Metadata = {
  metadataBase: new URL("https://fluent.app"),
  title: {
    default: "FLUENT — Stop learning English. Start thinking in it.",
    template: "%s · FLUENT",
  },
  description,
  openGraph: {
    title: "FLUENT — Stop learning English. Start thinking in it.",
    description,
    type: "website",
    locale: "en_GB",
    siteName: "FLUENT",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08080b" },
    { media: "(prefers-color-scheme: light)", color: "#f6f4f0" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const THEME_INIT = `
try {
  var t = localStorage.getItem('fluent.theme.v2');
  document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
} catch (e) {}
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="antialiased">
        <StoreProvider>
          <MotionProvider>
            <AppShell>{children}</AppShell>
          </MotionProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
