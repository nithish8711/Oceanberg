"use client"

import { usePathname } from "next/navigation"
import SiteNav from "./site-nav"
import AdminNav from "./admin-nav"
import AnalyticsNav from "./analytics-nav"

export default function ClientNav() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")
  const isAnalytics = pathname?.startsWith("/analytics")
  return isAdmin ? <AdminNav /> : isAnalytics ? <AnalyticsNav /> : <SiteNav />
}
