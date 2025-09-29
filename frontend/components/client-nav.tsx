"use client"

import { usePathname } from "next/navigation"
import SiteNav from "./site-nav"
import AdminNav from "./admin-nav"

export default function ClientNav() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")
  return isAdmin ? <AdminNav /> : <SiteNav />
}
