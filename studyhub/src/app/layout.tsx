import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import { ThemeProvider, THEME_INIT_SCRIPT } from "@/components/providers/theme-provider";
import { StoreHydrator } from "@/components/providers/store-hydrator";
import { TooltipProvider } from "@/components/ui/tooltip";
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

export const metadata: Metadata = {
  title: {
    default: "StudyHub — Your personal AI study platform",
    template: "%s · StudyHub",
  },
  description:
    "StudyHub organizes your school materials, explains what you don't understand, and gets you ready for every exam — documents, notes, flashcards, quizzes and an AI tutor in one place.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08080a" },
    { media: "(prefers-color-scheme: light)", color: "#f7f7f8" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} suppressHydrationWarning>
      <body className="antialiased bg-bg text-ink">
        <script
          // Applies an explicit override before first paint. Without one it
          // does nothing, leaving the page to follow prefers-color-scheme.
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <ThemeProvider>
          <TooltipProvider delayDuration={200}>
            <StoreHydrator />
            {children}
            <Toaster
              position="bottom-right"
              // Toasts are painted from our own tokens, so let Sonner follow
              // the system rather than pinning it to one appearance.
              theme="system"
              toastOptions={{
                classNames: {
                  toast:
                    "!bg-[var(--surface-overlay)] !border !border-border !text-ink !rounded-xl !shadow-2xl",
                  description: "!text-ink-3",
                },
              }}
            />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
