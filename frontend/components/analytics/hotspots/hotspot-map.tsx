"use client"

type Report = {
  id: string
  type: string
  description: string
  location: { lat: number; lng: number }
  district: string
  state: string
  observedAt: string
  verified: boolean
  source: string
}

type Social = {
  type: string
  location: { lat: number; lng: number }
  intensity: number
  updatedAt: string
  reportCount: number
  affectedAreas: string[]
  source: string
  description: string
}

// India-ish bounding box for projection
const BOUNDS = {
  minLon: 68,
  maxLon: 97,
  minLat: 6,
  maxLat: 37,
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

export default function HotspotMap({ reports, social }: { reports: Report[]; social: Social[] }) {
  const fallback = project([11.8745, 75.3704])

  return (
    <div
      className="h-full w-full rounded-md overflow-hidden bg-muted/30"
      aria-label="Hotspot map"
      role="img"
      aria-roledescription="Map visualization"
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

        {/* Social intensity layer */}
        {social.map((s, idx) => {
          const { x, y } = project([s.location.lat, s.location.lng])
          const color = s.intensity > 0.75 ? "#ef4444" : s.intensity > 0.4 ? "#f59e0b" : "#10b981"
          const radius = 6 + Math.round(s.intensity * 12)
          const title =
            `${s.type} · intensity ${s.intensity.toFixed(2)}\n` + `Reports: ${s.reportCount}\n` + `${s.description}`
          return (
            <g key={`soc-${idx}`}>
              <circle cx={x} cy={y} r={radius} fill={color} fillOpacity={0.45} stroke={color} strokeOpacity={0.9}>
                <title>{title}</title>
              </circle>
            </g>
          )
        })}

        {/* Citizen reports */}
        {(reports.length
          ? reports
          : [{ location: { lat: 11.8745, lng: 75.3704 }, verified: false } as unknown as Report]
        ).map((r, idx) => {
          const { x, y } = r.location ? project([r.location.lat, r.location.lng]) : fallback
          const color = r.verified ? "#2563eb" : "#64748b"
          const title =
            `${r.type ?? "Report"} · ${r.verified ? "Verified" : "Unverified"}\n` +
            `${r.district ?? ""}${r.state ? ", " + r.state : ""}\n` +
            `${r.description ?? ""}\n` +
            `${r.observedAt ? r.observedAt.slice(0, 10) : ""}`
          return (
            <g key={`rep-${idx}`}>
              <circle cx={x} cy={y} r={6} fill={color} fillOpacity={0.8} stroke={color} strokeOpacity={0.95}>
                <title>{title}</title>
              </circle>
            </g>
          )
        })}

        <g transform={`translate(${WIDTH - 170}, ${HEIGHT - 90})`}>
          <rect width="160" height="80" rx="6" fill="hsl(var(--muted))" opacity="0.8" />
          <g transform="translate(10, 12)">
            <circle cx="8" cy="8" r="6" fill="#2563eb" />
            <text x="22" y="12" fontSize="12" fill="hsl(var(--foreground))">
              Verified report
            </text>
          </g>
          <g transform="translate(10, 32)">
            <circle cx="8" cy="8" r="6" fill="#64748b" />
            <text x="22" y="12" fontSize="12" fill="hsl(var(--foreground))">
              Unverified report
            </text>
          </g>
          <g transform="translate(10, 52)">
            <rect x="2" y="2" width="12" height="12" fill="#ef4444" opacity="0.6" />
            <text x="22" y="12" fontSize="12" fill="hsl(var(--foreground))">
              High intensity (social)
            </text>
          </g>
        </g>
      </svg>
    </div>
  )
}
