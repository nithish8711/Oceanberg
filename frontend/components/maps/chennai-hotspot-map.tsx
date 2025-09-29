"use client"

import { useState } from "react"
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

type ChennaiArea = {
  name: string
  lat: number
  lng: number
  impactLevel: "High" | "Medium" | "Low"
  threatLevel: "Critical" | "High" | "Medium" | "Low"
  reportCount: number
  socialPostCount: number
  needs: Array<{
    need: string
    count: number
    threatLevel: "High" | "Medium" | "Low"
  }>
}

const NEEDS_OPTIONS = [
  "Rescue",
  "Evacuation",
  "Medical Help",
  "Shelter",
  "Food",
  "Water",
  "Clothing",
  "Sanitation & Hygiene",
  "Communication",
  "Power / Electricity",
  "Clean-up & Disinfection",
  "Financial Assistance",
  "Livelihood Support",
  "Transportation",
]

// Generate random needs
const generateAreaNeeds = (area: string) => {
  const shuffled = [...NEEDS_OPTIONS].sort(() => 0.5 - Math.random())
  const selectedNeeds = shuffled.slice(0, Math.floor(Math.random() * 5) + 3)
  return selectedNeeds.map((need) => ({
    need,
    count: Math.floor(Math.random() * 20) + 5,
    threatLevel: Math.random() > 0.7 ? "High" : Math.random() > 0.4 ? "Medium" : "Low",
  }))
}

// Static areas
const CHENNAI_AREAS: ChennaiArea[] = [
  { name: "Egmore", lat: 13.0732, lng: 80.2609, impactLevel: "High", threatLevel: "Critical", reportCount: 45, socialPostCount: 128, needs: generateAreaNeeds("Egmore") },
  { name: "Nungambakkam", lat: 13.0627, lng: 80.24, impactLevel: "Medium", threatLevel: "High", reportCount: 32, socialPostCount: 89, needs: generateAreaNeeds("Nungambakkam") },
  { name: "T. Nagar", lat: 13.0418, lng: 80.2341, impactLevel: "High", threatLevel: "High", reportCount: 38, socialPostCount: 156, needs: generateAreaNeeds("T. Nagar") },
  { name: "Mylapore", lat: 13.0339, lng: 80.2619, impactLevel: "Medium", threatLevel: "Medium", reportCount: 28, socialPostCount: 74, needs: generateAreaNeeds("Mylapore") },
  { name: "Triplicane", lat: 13.0569, lng: 80.2707, impactLevel: "Low", threatLevel: "Medium", reportCount: 19, socialPostCount: 52, needs: generateAreaNeeds("Triplicane") },
  { name: "Royapettah", lat: 13.0522, lng: 80.2595, impactLevel: "Medium", threatLevel: "High", reportCount: 35, socialPostCount: 98, needs: generateAreaNeeds("Royapettah") },
  { name: "Anna Salai", lat: 13.0569, lng: 80.25, impactLevel: "High", threatLevel: "Critical", reportCount: 42, socialPostCount: 134, needs: generateAreaNeeds("Anna Salai") },
  { name: "Kilpauk", lat: 13.085, lng: 80.24, impactLevel: "Low", threatLevel: "Low", reportCount: 15, socialPostCount: 41, needs: generateAreaNeeds("Kilpauk") },
  { name: "Choolai", lat: 13.1067, lng: 80.2707, impactLevel: "Medium", threatLevel: "Medium", reportCount: 24, socialPostCount: 67, needs: generateAreaNeeds("Choolai") },
  { name: "Purasawalkam", lat: 13.085, lng: 80.25, impactLevel: "Low", threatLevel: "Low", reportCount: 18, socialPostCount: 48, needs: generateAreaNeeds("Purasawalkam") },
]

function getImpactColor(level: "High" | "Medium" | "Low") {
  switch (level) {
    case "High": return "red"
    case "Medium": return "orange"
    default: return "green"
  }
}

// circle size (radius in meters)
function getImpactRadius(level: "High" | "Medium" | "Low") {
  switch (level) {
    case "High": return 800
    case "Medium": return 500
    default: return 300
  }
}

export default function ChennaiHotspotMap() {
  const [selectedArea, setSelectedArea] = useState<ChennaiArea | null>(null)

  // glowing dot icon
  const createGlowingIcon = (color: string) =>
    L.divIcon({
      className: "custom-icon",
      html: `
        <div style="
          width:18px;
          height:18px;
          background:${color};
          border:2px solid white;
          border-radius:50%;
          box-shadow:0 0 10px ${color}, 0 0 20px ${color};
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    })

  return (
    <div className="h-full w-full rounded-md overflow-hidden relative">
      <MapContainer center={[13.05, 80.25]} zoom={13} className="h-full w-full" scrollWheelZoom={true}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        />

        {CHENNAI_AREAS.map((area, idx) => (
          <>
            {/* Circle around area */}
            <Circle
              key={`circle-${idx}`}
              center={[area.lat, area.lng]}
              radius={getImpactRadius(area.impactLevel)}
              color={getImpactColor(area.impactLevel)}
              fillColor={getImpactColor(area.impactLevel)}
              fillOpacity={0.15}
              weight={2}
            />

            {/* Marker dot */}
            <Marker
              key={`marker-${idx}`}
              position={[area.lat, area.lng]}
              icon={createGlowingIcon(getImpactColor(area.impactLevel))}
              eventHandlers={{ click: () => setSelectedArea(area) }}
            />
          </>
        ))}

        {selectedArea && (
          <Popup
            position={[selectedArea.lat, selectedArea.lng]}
            onClose={() => setSelectedArea(null)}
          >
            <div className="text-sm">
              <h3 className="font-semibold">{selectedArea.name}</h3>
              <p><b>Impact:</b> {selectedArea.impactLevel}</p>
              <p><b>Threat:</b> {selectedArea.threatLevel}</p>
              <p><b>Reports:</b> {selectedArea.reportCount} | <b>Posts:</b> {selectedArea.socialPostCount}</p>
              <div className="mt-2">
                <b>Top Needs:</b>
                <ul className="list-disc pl-4">
                  {selectedArea.needs.slice(0, 4).map((need, i) => (
                    <li key={i}>{need.need} ({need.count})</li>
                  ))}
                </ul>
              </div>
            </div>
          </Popup>
        )}
      </MapContainer>
    </div>
  )
}
