"use client"

import { usePathname } from "next/navigation"
import SiteNav from "./site-nav"
import AdminNav from "./admin-nav"
import AnalyticsNav from "./analytics-nav"
import Link from "next/link"

export default function ClientNav() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")
  const isAnalytics = pathname?.startsWith("/analytics")
  const isAuthPage = pathname === "/login" || pathname === "/register"

  if (isAuthPage) {
    return null
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <Link href="/" className="font-semibold text-foreground">
          Oceanberg
          <span className="sr-only">{" - Home"}</span>
        </Link>

        {isAdmin ? <AdminNav /> : isAnalytics ? <AnalyticsNav /> : <SiteNav />}
      </div>
    </header>
  )
}
