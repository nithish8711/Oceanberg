"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { LeafletMap } from "@/components/maps/leaflet-map"
import { SOSPanel } from "@/components/guidepath/sos-panel"
import { MessagingPanel } from "@/components/guidepath/messaging-panel"
import { HelplineList } from "@/components/guidepath/helpline-list"
import { usePersistentSWR } from "@/components/hooks/use-persistent-swr"
import { Button } from "@/components/ui/button"
import { SafeRoute } from "./types"

export default function GuidepathPage() {
  const { data } = usePersistentSWR<SafeRoute[]>("/api/safe-routes", async (url) => {
    const res = await fetch(url)
    const json = await res.json()
    // normalize API shape -> { safePlace: { lat, lng, label } }
    return json.map((r: any) => ({
      ...r,
      safePlace: r.safePlaceLat
        ? { lat: r.safePlaceLat, lng: r.safePlaceLng, label: r.safePlaceLabel }
        : null,
    }))
  }, { localStorageKey: "oceanberg_safe_routes_cache" })

  const routes = data ?? []

  const [current, setCurrent] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [routeLine, setRouteLine] = useState<Array<{ lat: number; lng: number }>>([])

  // Get initial location
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setCurrent({ lat: 20.5937, lng: 78.9629 })
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => setCurrent({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCurrent({ lat: 20.5937, lng: 78.9629 }),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  // Update route when current location or destination changes
  useEffect(() => {
    const dest = routes.find(r => r.id === selectedId)?.safePlace
    if (!current || !dest) return

    ;(async () => {
      try {
        const url = `https://router.project-osrm.org/route/v1/foot/${current.lng},${current.lat};${dest.lng},${dest.lat}?overview=full&geometries=geojson`
        const res = await fetch(url, { cache: "no-store" })
        const json = await res.json()
        const coords: [number, number][] = json?.routes?.[0]?.geometry?.coordinates || []
        if (coords.length) {
          setRouteLine(coords.map(([lng, lat]) => ({ lat, lng })))
        } else {
          setRouteLine([current, dest])
        }
      } catch {
        setRouteLine([current, dest])
      }
    })()
  }, [current, selectedId, routes])

  // Markers
  const markers = useMemo(() => {
    const m: Array<{ id: string; lat: number; lng: number; label?: string; color?: string; popup?: string }> = []
    if (current) m.push({ id: "you", lat: current.lat, lng: current.lng, label: "You", color: "#2563eb" })
    routes.forEach(r => {
      if (!r.safePlace) return
      const isSelected = r.id === selectedId
      m.push({
        id: r.id,
        lat: r.safePlace.lat,
        lng: r.safePlace.lng,
        label: r.safePlace.label,
        color: isSelected ? "#16a34a" : "#94a3b8",
        popup: r.name,
      })
    })
    return m
  }, [routes, current, selectedId])

  return (
    <main className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <header className="mb-4">
        <h1 className="text-balance text-2xl font-semibold tracking-tight md:text-3xl">
          Guidepath, SOS & Helplines
        </h1>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Safe Routes</CardTitle>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={() => {
                  navigator.geolocation.getCurrentPosition(
                    pos => setCurrent({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    () => alert("Unable to get location"),
                    { enableHighAccuracy: true }
                  )
                }}
              >
                Select Current Location
              </Button>

              <label htmlFor="destination" className="text-sm text-muted-foreground">
                Destination
              </label>
              <select
                id="destination"
                className="rounded-md border bg-background px-2 py-1 text-sm"
                value={selectedId ?? ""}
                onChange={e => setSelectedId(e.target.value)}
              >
                <option value="" disabled>
                  {routes.length ? "Select a safe place…" : "Loading…"}
                </option>
                {routes.filter(r => r.safePlace).map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.safePlace!.label}
                  </option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent className="h-[420px]">
            <LeafletMap markers={markers} polylines={routeLine.length ? [routeLine] : []} />
          </CardContent>
        </Card>

        <SOSPanel />
        <Card className="md:col-span-3">
          <CardHeader><CardTitle>Messaging with Admin</CardTitle></CardHeader>
          <CardContent><MessagingPanel /></CardContent>
        </Card>
        <Card className="md:col-span-3">
          <CardHeader><CardTitle>Emergency Helplines</CardTitle></CardHeader>
          <CardContent><HelplineList /></CardContent>
        </Card>
      </section>
      <Separator className="my-6" />
    </main>
  )
}
