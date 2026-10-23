import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import { SiteHeader } from "@/components/layout/site-header";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ProgressSync } from "@/lib/progress/progress-sync";
import { accentScript } from "@/lib/accent-script";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "LearnWithCybi", template: "%s · LearnWithCybi" },
  description: "Impara la cybersecurity da zero, con Cybi.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="it"
      suppressHydrationWarning
      className={`${jetbrainsMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Script id="accento" strategy="beforeInteractive">
          {accentScript}
        </Script>
        <TooltipProvider>
          <ProgressSync />
          <SiteHeader />
          <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:py-12">
            {children}
          </main>
        </TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
