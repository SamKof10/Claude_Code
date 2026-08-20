import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import { CartProvider } from "@/lib/cart";
import { ToastProvider } from "@/components/ui/Toast";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SkipLink } from "@/components/layout/SkipLink";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { FlyToCart } from "@/components/cart/FlyToCart";
import "./globals.css";

const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const description =
  "MUDROOM ONE is an automatic bike wash box: ride in, press one button, ride out clean. Fits MTB, enduro, downhill, gravel, road, e-bike and BMX. Buy the box, or rent it for your event.";

export const metadata: Metadata = {
  metadataBase: new URL("https://mudroom.bike"),
  title: {
    default: "MUDROOM — Your bike. One click. Clean.",
    template: "%s · MUDROOM",
  },
  description,
  openGraph: {
    title: "MUDROOM — Your bike. One click. Clean.",
    description,
    type: "website",
    siteName: "MUDROOM",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#0d0f11",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${archivo.variable} ${mono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <MotionProvider>
          <CartProvider>
            <ToastProvider>
              <SkipLink />
              <Navbar />
              <main id="main">{children}</main>
              <Footer />
              <CartDrawer />
              <FlyToCart />
            </ToastProvider>
          </CartProvider>
        </MotionProvider>
      </body>
    </html>
  );
}
