"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type NavLink = {
  href: string
  label: string
}

const analyticsLinks: NavLink[] = [
  { href: "/analytics/early-warning", label: "Early Warning" },
  { href: "/analytics/hotspots", label: "Hotspots" },
  { href: "/analytics/impact", label: "Impact" },
  { href: "/analytics/admin-messages", label: "Admin Messages" },
]

export default function AnalyticsNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Analytics" className="flex items-center gap-1 overflow-x-auto">
      {analyticsLinks.map((link) => {
        const isActive = pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            data-active={isActive}
            className="rounded-md px-3 py-2 text-sm text-foreground transition-colors hover:bg-muted data-[active=true]:bg-primary data-[active=true]:text-primary-foreground"
            aria-current={isActive ? "page" : undefined}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
