"use client"

import { useEffect, useMemo } from "react"

type Props = {
  origin: { lat: number; lng: number } | null
  dest: { lat: number; lng: number } | null
  label?: string
}

const WIDTH = 800
const HEIGHT = 520

function mercY(lat: number) {
  const rad = (lat * Math.PI) / 180
  return Math.log(Math.tan(Math.PI / 4 + rad / 2))
}

export function GuidePathMap({ origin, dest }: Props) {
  const fallback = { lat: 13.0827, lng: 80.2707 } // Chennai center
  const c = origin ?? dest ?? fallback

  // Dynamically compute bounding box from available points
  const BOUNDS = useMemo(() => {
    const lats = [origin?.lat, dest?.lat, fallback.lat].filter(Boolean) as number[]
    const lngs = [origin?.lng, dest?.lng, fallback.lng].filter(Boolean) as number[]
    const padding = 0.01 // ~1km padding

    return {
      minLat: Math.min(...lats) - padding,
      maxLat: Math.max(...lats) + padding,
      minLon: Math.min(...lngs) - padding,
      maxLon: Math.max(...lngs) + padding,
    }
  }, [origin, dest])

  function project([lat, lon]: [number, number]) {
    const x = ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * WIDTH
    const my = mercY(lat)
    const myMin = mercY(BOUNDS.minLat)
    const myMax = mercY(BOUNDS.maxLat)
    const yNorm = (my - myMin) / (myMax - myMin)
    const y = (1 - yNorm) * HEIGHT
    return { x, y }
  }

  const oP = origin ? project([origin.lat, origin.lng]) : null
  const dP = dest ? project([dest.lat, dest.lng]) : null
  const cP = project([c.lat, c.lng])

  useEffect(() => {
    window.addEventListener("sos:focus", () => {})
    return () => window.removeEventListener("sos:focus", () => {})
  }, [])

  return (
    <div
      style={{ height: "100%", width: "100%" }}
      className="rounded-md overflow-hidden bg-muted/30"
      role="region"
      aria-label="Route map"
    >
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full block" preserveAspectRatio="xMidYMid meet">
        {/* Background */}
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="var(--background)" />

        {/* Grid */}
        <g stroke="hsl(var(--border))" strokeOpacity="0.35" strokeWidth="1">
          {Array.from({ length: 8 }).map((_, i) => {
            const x = (i / 7) * WIDTH
            return <line key={`v-${i}`} x1={x} y1={0} x2={x} y2={HEIGHT} />
          })}
          {Array.from({ length: 6 }).map((_, i) => {
            const y = (i / 5) * HEIGHT
            return <line key={`h-${i}`} x1={0} y1={y} x2={WIDTH} y2={y} />
          })}
        </g>

        {/* Path */}
        {oP && dP && (
          <polyline
            points={`${oP.x},${oP.y} ${dP.x},${dP.y}`}
            fill="none"
            stroke="#ef4444"
            strokeOpacity={0.9}
            strokeWidth={3}
          />
        )}

        {/* Markers */}
        {(oP ? [{ p: oP, label: "Origin", color: "#10b981" }] : [])
          .concat(dP ? [{ p: dP, label: "Destination", color: "#2563eb" }] : [])
          .concat(!oP && !dP ? [{ p: cP, label: "Center", color: "#64748b" }] : [])
          .map((m, idx) => (
            <g key={idx}>
              <circle
                cx={m.p.x}
                cy={m.p.y}
                r={7}
                fill={m.color}
                fillOpacity={0.85}
                stroke={m.color}
                strokeOpacity={0.95}
              >
                <title>{m.label}</title>
              </circle>
            </g>
          ))}
      </svg>
    </div>
  )
}
