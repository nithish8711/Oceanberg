"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { MapContainer, TileLayer, Polyline, useMap, CircleMarker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

type SafeRoute = {
  id: string
  name: string
  path: { lat: number; lon: number }[]
  safePlaceLat: number
  safePlaceLng: number
  safePlaceLabel: string
  highlighted?: boolean
}

const fetcher = (u: string) => fetch(u).then((r) => r.json())

// Auto-fit helper
function FitBounds({ routes }: { routes: SafeRoute[] }) {
  const map = useMap()

  useEffect(() => {
    if (!routes.length) return

    const points: [number, number][] = []
    routes.forEach((r) => {
      if (r.safePlaceLat && r.safePlaceLng) {
        points.push([r.safePlaceLat, r.safePlaceLng])
      }
      if (Array.isArray(r.path)) {
        r.path.forEach((p) => points.push([p.lat, p.lon]))
      }
    })

    if (points.length > 0) {
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [40, 40] })
    }
  }, [routes, map])

  return null
}

export function AdminSafeRoutes() {
  const { data, mutate } = useSWR<SafeRoute[]>("/api/safe-routes", fetcher)
  const [form, setForm] = useState<Partial<SafeRoute>>({})
  const { toast } = useToast()

  const routes = data ?? []

  async function saveRoute() {
    if (!form.name || !form.safePlaceLat || !form.safePlaceLng || !form.safePlaceLabel) {
      toast({ title: "Incomplete form", variant: "destructive" })
      return
    }

    let pathJson: any = []
    if (form.path && typeof form.path === "string") {
      try {
        pathJson = JSON.parse(form.path)
        if (!Array.isArray(pathJson)) throw new Error("Path must be an array")
      } catch (e: any) {
        toast({ title: "Invalid path JSON", description: e.message, variant: "destructive" })
        return
      }
    }

    try {
      const method = form.id ? "PUT" : "POST"
      const url = form.id ? `/api/safe-routes/${form.id}` : "/api/safe-routes"
      await fetch(url, {
        method,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, path: pathJson }),
      })
      setForm({})
      await mutate()
      toast({ title: `Route ${form.id ? "updated" : "created"}` })
    } catch {
      toast({ title: "Failed to save route", variant: "destructive" })
    }
  }

  async function deleteRoute(id: string) {
    try {
      await fetch(`/api/safe-routes/${id}`, { method: "DELETE" })
      await mutate()
      toast({ title: "Route deleted" })
      if (form.id === id) setForm({})
    } catch {
      toast({ title: "Failed to delete route", variant: "destructive" })
    }
  }

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Admin Safe Routes</h2>

      {/* Form */}
      <div className="grid gap-2 md:grid-cols-2">
        <Input
          placeholder="Name"
          value={form.name ?? ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Latitude"
          type="number"
          value={form.safePlaceLat ?? ""}
          onChange={(e) => setForm({ ...form, safePlaceLat: Number.parseFloat(e.target.value) })}
        />
        <Input
          placeholder="Longitude"
          type="number"
          value={form.safePlaceLng ?? ""}
          onChange={(e) => setForm({ ...form, safePlaceLng: Number.parseFloat(e.target.value) })}
        />
        <Input
          placeholder="Label"
          value={form.safePlaceLabel ?? ""}
          onChange={(e) => setForm({ ...form, safePlaceLabel: e.target.value })}
        />
        <Input
          placeholder='Path JSON (e.g. [{"lat":12.9,"lon":80.2}])'
          value={typeof form.path === "string" ? form.path : ""}
          onChange={(e) => setForm({ ...form, path: e.target.value })}
        />
        <Button onClick={saveRoute}>{form.id ? "Update" : "Add"} Route</Button>
      </div>

      {/* Map */}
      <div className="w-full rounded-md overflow-hidden" style={{ height: 400 }}>
        <MapContainer
          center={[12.9, 80.2]} // fallback center (Chennai)
          zoom={12}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          {routes.map((r) => (
            <div key={r.id}>
              <CircleMarker
                center={[r.safePlaceLat, r.safePlaceLng]}
                radius={8}
                color="blue"
                fillColor="blue"
                fillOpacity={0.8}
                eventHandlers={{ click: () => setForm({ ...r }) }}
              />
              {Array.isArray(r.path) && r.path.length > 0 && (
                <Polyline
                  positions={r.path.map((p) => [p.lat, p.lon] as [number, number])}
                  color="blue"
                />
              )}
            </div>
          ))}

          <FitBounds routes={routes} />
        </MapContainer>
      </div>

      {/* List of routes */}
      <div className="divide-y">
        {routes.map((r) => (
          <div key={r.id} className="flex justify-between items-center py-2">
            <div>
              {r.name} → {r.safePlaceLabel}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setForm({ ...r })}>
                Edit
              </Button>
              <Button size="sm" variant="destructive" onClick={() => deleteRoute(r.id)}>
                Delete
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
