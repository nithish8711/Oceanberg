import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { Suspense } from "react"
import ClientNav from "../components/client-nav"
import SessionProviderWrapper from "./providers/SessionProviderWrapper"
import { PageTransition } from "@/components/page-transition"

export const metadata: Metadata = {
  title: "Oceanberg",
  generator: "v0.app",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:m-2 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>

        <SessionProviderWrapper>
          <Suspense fallback={<div>Loading...</div>}>
            <ClientNav />

            <main id="main" className="min-h-screen">
              <PageTransition>{children}</PageTransition>
            </main>
          </Suspense>

          <Analytics />
        </SessionProviderWrapper>
      </body>
    </html>
  )
}
