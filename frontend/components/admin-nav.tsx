"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

type NavLink = {
  href: string
  label: string
}

const adminLinks: NavLink[] = [
  { href: "/admin/early-warning", label: "Early Warning" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/guidepath", label: "Guidepath" },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <nav aria-label="Admin" className="flex items-center gap-1 overflow-x-auto">
      {adminLinks.map((link) => {
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
