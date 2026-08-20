import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import { I18nProvider } from "@/lib/i18n";
import { ToastProvider } from "@/components/ui/Toast";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SkipLink } from "@/components/layout/SkipLink";
import { ClickSparkArea } from "@/components/ui/reactbits";
import { FlyToCart } from "@/components/cart/FlyToCart";
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
  "Die AUREL ARC ist eine zirkadiane Schreibtischleuchte: 1800 bis 6500 Kelvin, CRI 97, flimmerfrei. Sie folgt der Sonne, damit Ihr Abend nicht auf Mittag beleuchtet ist.";

export const metadata: Metadata = {
  metadataBase: new URL("https://aurel.light"),
  title: {
    default: "AUREL — Licht, das weiß, wie spät es ist",
    template: "%s · AUREL",
  },
  description,
  openGraph: {
    title: "AUREL — Licht, das weiß, wie spät es ist",
    description,
    type: "website",
    locale: "de_DE",
    siteName: "AUREL",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f4f0" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0c" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="antialiased">
        <MotionProvider>
          <I18nProvider>
            <CartProvider>
              <ToastProvider>
                <SkipLink />
                <Navbar />
                <ClickSparkArea>
                  <main id="inhalt">{children}</main>
                </ClickSparkArea>
                <Footer />
                <CartDrawer />
                <FlyToCart />
              </ToastProvider>
            </CartProvider>
          </I18nProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
