"use client"

import useSWR from "swr"
import { useEffect, useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Phone, ShieldAlert, Flame, Anchor, HeartPulse, Baby, LifeBuoy, Star } from "lucide-react"

type Helpline = {
  id: string
  name: string
  number: string
  category: string
}

const fetcher = (u: string) => fetch(u).then((r) => r.json())

function iconFor(text: string) {
  const t = text.toLowerCase()
  if (t.includes("police")) return ShieldAlert
  if (t.includes("fire")) return Flame
  if (t.includes("coast")) return Anchor
  if (t.includes("medical") || t.includes("health") || t.includes("ambulance")) return HeartPulse
  if (t.includes("child")) return Baby
  if (t.includes("relief") || t.includes("disaster") || t.includes("rescue")) return LifeBuoy
  return Phone
}

export function HelplineList() {
  const { data } = useSWR<Helpline[]>("/api/helplines", fetcher)
  const [q, setQ] = useState("")
  const [favorites, setFavorites] = useState<string[]>([])

  useEffect(() => {
    const f = JSON.parse(localStorage.getItem("oceanberg_helpline_favs") || "[]")
    setFavorites(f)
  }, [])

  function toggleFav(id: string) {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      localStorage.setItem("oceanberg_helpline_favs", JSON.stringify(next))
      return next
    })
  }

  const list = useMemo(() => {
    const src = data ?? []
    return src
      .filter((h) => h.name.toLowerCase().includes(q.toLowerCase()) || h.category.toLowerCase().includes(q.toLowerCase()))
      .sort((a, b) => {
        const aFav = favorites.includes(a.id)
        const bFav = favorites.includes(b.id)
        if (aFav && !bFav) return -1
        if (!aFav && bFav) return 1
        return a.name.localeCompare(b.name)
      })
  }, [data, q, favorites])

  return (
    <div className="space-y-3">
      <Input placeholder="Search helplines…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="divide-y rounded-md border" role="list">
        {list.map((h) => {
          const Icon = iconFor(`${h.name} ${h.category}`)
          const isFav = favorites.includes(h.id)
          return (
            <div key={h.id} className="flex items-center justify-between gap-3 p-3" role="listitem">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                  <Icon className="h-5 w-5" aria-hidden />
                </div>
                <div className="min-w-0">
                  <div className="truncate font-medium">{h.name}</div>
                  <div className="mt-0.5 flex items-center gap-2 text-sm">
                    <span className="truncate font-mono">{h.number}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      {h.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Button variant={isFav ? "default" : "secondary"} size="icon" onClick={() => toggleFav(h.id)}>
                  <Star className="h-4 w-4" />
                </Button>
                <a href={`tel:${h.number}`}>
                  <Button size="icon">
                    <Phone className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
