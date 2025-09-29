"use client"

import { useEffect } from "react"
import dynamic from "next/dynamic"

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer as any), { ssr: false })
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer as any), { ssr: false })
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker as any), { ssr: false })
const Polyline = dynamic(() => import("react-leaflet").then((m) => m.Polyline as any), { ssr: false })
import "leaflet/dist/leaflet.css"

type Props = {
  origin: { lat: number; lng: number } | null
  dest: { lat: number; lng: number } | null
  label?: string
}

export function RouteMap({ origin, dest }: Props) {
  const center = origin ?? dest ?? { lat: 12.9716, lng: 77.5946 }

  useEffect(() => {
    window.addEventListener("sos:focus", () => {})
    return () => window.removeEventListener("sos:focus", () => {})
  }, [])

  const path = origin && dest ? [
    [origin.lat, origin.lng],
    [dest.lat, dest.lng]
  ] : []

  return (
    <MapContainer center={[center.lat, center.lng]} zoom={8} scrollWheelZoom style={{ height: "100%", width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap contributors" />
      {origin && <Marker position={[origin.lat, origin.lng]} />}
      {dest && <Marker position={[dest.lat, dest.lng]} />}
      {path.length > 0 && <Polyline positions={path as any} color="#ef4444" />}
    </MapContainer>
  )
}
