"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"
import "leaflet/dist/leaflet.css"

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer as any), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer as any), { ssr: false })
const CircleMarker = dynamic(() => import("react-leaflet").then(m => m.CircleMarker as any), { ssr: false })
const Popup = dynamic(() => import("react-leaflet").then(m => m.Popup as any), { ssr: false })

type SafeRoute = {
  id: string
  name: string
  path: string
  safePlaceLat: number
  safePlaceLng: number
  safePlaceLabel: string
  highlighted?: boolean
}

const fetcher = (u: string) => fetch(u).then(r => r.json())

export function AdminSafeRoutes() {
  const { data, mutate } = useSWR<SafeRoute[]>("/api/safe-routes", fetcher)
  const [form, setForm] = useState<Partial<SafeRoute>>({})
  const { toast } = useToast()

  const routes = data ?? []

  // Add / update route
  async function saveRoute() {
    if (!form.name || !form.safePlaceLat || !form.safePlaceLng || !form.safePlaceLabel) {
      toast({ title: "Incomplete form", variant: "destructive" })
      return
    }

    // Validate JSON path
    let pathJson: any = []
    if (form.path) {
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
    } catch {
      toast({ title: "Failed to delete route", variant: "destructive" })
    }
  }

  // Map markers
  const markers = useMemo(() => {
    return routes
      .filter(r => r.safePlaceLat && r.safePlaceLng)
      .map(r => ({
        id: r.id,
        position: [r.safePlaceLat, r.safePlaceLng] as [number, number],
        label: r.safePlaceLabel,
        route: r,
      }))
  }, [routes])

  return (
    <Card className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Admin Safe Routes</h2>

      <div className="grid gap-2 md:grid-cols-2">
        <Input
          placeholder="Name"
          value={form.name ?? ""}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
        <Input
          placeholder="Latitude"
          type="number"
          value={form.safePlaceLat ?? ""}
          onChange={e => setForm({ ...form, safePlaceLat: parseFloat(e.target.value) })}
        />
        <Input
          placeholder="Longitude"
          type="number"
          value={form.safePlaceLng ?? ""}
          onChange={e => setForm({ ...form, safePlaceLng: parseFloat(e.target.value) })}
        />
        <Input
          placeholder="Label"
          value={form.safePlaceLabel ?? ""}
          onChange={e => setForm({ ...form, safePlaceLabel: e.target.value })}
        />
        <Input
          placeholder="Path JSON"
          value={form.path ?? ""}
          onChange={e => setForm({ ...form, path: e.target.value })}
        />
        <Button onClick={saveRoute}>{form.id ? "Update" : "Add"} Route</Button>
      </div>

      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "400px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        {markers.map(m => (
          <CircleMarker
            key={m.id}
            center={m.position}
            radius={8}
            pathOptions={{ color: "#2563eb", fillColor: "#2563eb", fillOpacity: 1 }}
          >
            <Popup>
              <div className="space-y-2">
                <div>
                  <strong>{m.route.name}</strong> → {m.route.safePlaceLabel}
                </div>
                <Button size="sm" variant="outline" onClick={() => setForm({ ...m.route })}>
                  Edit
                </Button>
                <Button size="sm" variant="destructive" onClick={() => deleteRoute(m.id)}>
                  Delete
                </Button>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <div className="divide-y">
        {routes.map(r => (
          <div key={r.id} className="flex justify-between items-center py-2">
            <div>{r.name} → {r.safePlaceLabel}</div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setForm({ ...r })}>Edit</Button>
              <Button size="sm" variant="destructive" onClick={() => deleteRoute(r.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
