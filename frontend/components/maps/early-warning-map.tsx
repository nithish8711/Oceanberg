"use client"

import { useMemo } from "react"

type AlertItem = {
  type: string
  district: string
  state: string
  color: "Green" | "Yellow" | "Orange" | "Red"
  message: string
  source: "INCOIS" | "IMD"
  issueDate: string
  latitude?: number
  longitude?: number
}

// Chennai-focused bounding box for projection
const BOUNDS = {
  minLon: 80.1,
  maxLon: 80.3,
  minLat: 12.8,
  maxLat: 13.2,
}
const WIDTH = 800
const HEIGHT = 520

function mercY(lat: number) {
  const rad = (lat * Math.PI) / 180
  return Math.log(Math.tan(Math.PI / 4 + rad / 2))
}

function project([lat, lon]: [number, number]) {
  const x = ((lon - BOUNDS.minLon) / (BOUNDS.maxLon - BOUNDS.minLon)) * WIDTH
  const my = mercY(lat)
  const myMin = mercY(BOUNDS.minLat)
  const myMax = mercY(BOUNDS.maxLat)
  const yNorm = (my - myMin) / (myMax - myMin)
  const y = (1 - yNorm) * HEIGHT
  return { x, y }
}

function colorToFill(c: AlertItem["color"]) {
  switch (c) {
    case "Red":
      return "#ef4444"
    case "Orange":
      return "#f97316"
    case "Yellow":
      return "#f59e0b"
    default:
      return "#10b981"
  }
}

export default function EarlyWarningMap({ alerts }: { alerts: AlertItem[] }) {
  const points = useMemo(
    () => alerts.filter((a) => a.latitude != null && a.longitude != null),
    [alerts],
  ) as Required<AlertItem>[]

  // Fallback center marker if no points (Chennai center)
  const fallbackPt = project([13.0827, 80.2707])

  return (
    <div
      className="h-full w-full rounded-md overflow-hidden bg-muted/30"
      aria-label="Early warning map"
      role="img"
      aria-roledescription="Map visualization"
    >
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="h-full w-full block" preserveAspectRatio="xMidYMid meet">
        {/* Background */}
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="var(--background)" />

        {/* Grid for spatial context */}
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

        {/* Alert points */}
        {points.length === 0 ? (
          <g>
            <circle cx={fallbackPt.x} cy={fallbackPt.y} r={6} fill="#64748b">
              <title>{"No geocoded alerts available"}</title>
            </circle>
          </g>
        ) : (
          points.map((p, idx) => {
            const { x, y } = project([p.latitude, p.longitude])
            const color = colorToFill(p.color)
            const title =
              `${p.type} · ${p.color}\n` +
              `${p.district}, ${p.state}\n` +
              `${p.message}\n` +
              `${p.source} · ${p.issueDate.slice(0, 10)}`
            return (
              <g key={idx}>
                <circle cx={x} cy={y} r={8} fill={color} fillOpacity={0.65} stroke={color} strokeOpacity={0.9}>
                  <title>{title}</title>
                </circle>
              </g>
            )
          })
        )}

        {/* Legend */}
        <g transform={`translate(${WIDTH - 170}, ${HEIGHT - 110})`}>
          <rect width="160" height="100" rx="6" fill="hsl(var(--muted))" opacity="0.9" />
          <g transform="translate(10, 12)">
            <circle cx="8" cy="8" r="6" fill="#ef4444" />
            <text x="22" y="12" fontSize="12" fill="hsl(var(--foreground))">
              Red Alert
            </text>
          </g>
          <g transform="translate(10, 32)">
            <circle cx="8" cy="8" r="6" fill="#f97316" />
            <text x="22" y="12" fontSize="12" fill="hsl(var(--foreground))">
              Orange Alert
            </text>
          </g>
          <g transform="translate(10, 52)">
            <circle cx="8" cy="8" r="6" fill="#f59e0b" />
            <text x="22" y="12" fontSize="12" fill="hsl(var(--foreground))">
              Yellow Alert
            </text>
          </g>
          <g transform="translate(10, 72)">
            <circle cx="8" cy="8" r="6" fill="#10b981" />
            <text x="22" y="12" fontSize="12" fill="hsl(var(--foreground))">
              Green Alert
            </text>
          </g>
        </g>
      </svg>
    </div>
  )
}
