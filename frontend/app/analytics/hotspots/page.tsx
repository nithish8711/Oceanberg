"use client"

import dynamic from "next/dynamic"
import processed from "@/data/dummy-processed-social-media.json"
import reports from "@/data/dummy-citizen-reports.json"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useMemo, useState } from "react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from "recharts"

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

const ChennaiHotspotMap = dynamic(() => import("@/components/maps/chennai-hotspot-map"), { ssr: false })

const CHENNAI_AREAS = [
  "Egmore",
  "Nungambakkam",
  "T. Nagar",
  "Mylapore",
  "Triplicane",
  "Royapettah",
  "Anna Salai",
  "Kilpauk",
  "Choolai",
  "Purasawalkam",
]

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

const generateAreaNeeds = (area: string) => {
  const shuffled = [...NEEDS_OPTIONS].sort(() => 0.5 - Math.random())
  const selectedNeeds = shuffled.slice(0, Math.floor(Math.random() * 5) + 3)
  return selectedNeeds.map((need) => ({
    need,
    count: Math.floor(Math.random() * 20) + 5,
    threatLevel: Math.random() > 0.7 ? "High" : Math.random() > 0.4 ? "Medium" : "Low",
  }))
}

export default function Page() {
  const [area, setArea] = useState("all")
  const [type, setType] = useState("all")
  const [timeframe, setTimeframe] = useState("7d")
  const [showReports, setShowReports] = useState(true)
  const [showSocial, setShowSocial] = useState(true)

  const rep = reports as Report[]
  const soc = processed as Social[]

  const types = useMemo(() => Array.from(new Set([...rep.map((r) => r.type), ...soc.map((s) => s.type)])), [rep, soc])

  const filteredReports = useMemo(() => {
    return rep.filter(
      (r) =>
        (area === "all" ||
          soc.some(
            (s) =>
              s.affectedAreas.includes(area) &&
              Math.abs(s.location.lat - r.location.lat) < 0.01 &&
              Math.abs(s.location.lng - r.location.lng) < 0.01,
          )) &&
        (type === "all" || r.type === type),
    )
  }, [rep, area, type])

  const filteredSocial = useMemo(() => {
    return soc.filter((s) => (area === "all" || s.affectedAreas.includes(area)) && (type === "all" || s.type === type))
  }, [soc, area, type])

  const areaImpactData = useMemo(() => {
    return CHENNAI_AREAS.map((areaName) => {
      const socialData = filteredSocial.filter((s) => s.affectedAreas.includes(areaName))
      const reportData = filteredReports.filter((r) =>
        socialData.some(
          (s) => Math.abs(s.location.lat - r.location.lat) < 0.01 && Math.abs(s.location.lng - r.location.lng) < 0.01,
        ),
      )

      const totalReports = reportData.length + socialData.reduce((sum, s) => sum + s.reportCount, 0)
      const avgIntensity =
        socialData.length > 0 ? socialData.reduce((sum, s) => sum + s.intensity, 0) / socialData.length : 0

      const impactLevel = avgIntensity > 0.7 ? "High" : avgIntensity > 0.4 ? "Medium" : "Low"
      const color = impactLevel === "High" ? "#ef4444" : impactLevel === "Medium" ? "#f59e0b" : "#10b981"

      return {
        area: areaName,
        totalReports,
        socialPosts: socialData.reduce((sum, s) => sum + s.reportCount, 0),
        impactLevel,
        color,
        threatLevel:
          avgIntensity > 0.8 ? "Critical" : avgIntensity > 0.6 ? "High" : avgIntensity > 0.3 ? "Medium" : "Low",
        needs: generateAreaNeeds(areaName),
      }
    })
  }, [filteredReports, filteredSocial])

  function download(filename: string, text: string, mime = "application/json") {
    const blob = new Blob([text], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleExportJSON = () => {
    download(
      "chennai-hotspots.json",
      JSON.stringify(
        {
          filters: { area, type, timeframe },
          reports: showReports ? filteredReports : [],
          social: showSocial ? filteredSocial : [],
          areaImpact: areaImpactData,
        },
        null,
        2,
      ),
    )
  }

  const handleExportCSV = () => {
    const rows = [
      ["kind", "type", "lat", "lng", "area", "verified", "count", "intensity", "impact_level"].join(","),
      ...(showReports
        ? filteredReports.map((r) =>
            [
              "report",
              r.type,
              r.location?.lat ?? "",
              r.location?.lng ?? "",
              r.district ?? "",
              r.verified ? "true" : "false",
              "",
              "",
              "",
            ].join(","),
          )
        : []),
      ...(showSocial
        ? filteredSocial.map((s) =>
            [
              "social",
              s.type,
              s.location?.lat ?? "",
              s.location?.lng ?? "",
              s.affectedAreas.join(";"),
              "",
              s.reportCount ?? "",
              s.intensity ?? "",
              s.intensity > 0.7 ? "High" : s.intensity > 0.4 ? "Medium" : "Low",
            ].join(","),
          )
        : []),
    ].join("\n")
    download("chennai-hotspots.csv", rows, "text/csv")
  }

  const byType = useMemo(() => {
    const m = new Map<string, number>()
    filteredReports.forEach((r) => m.set(r.type, (m.get(r.type) || 0) + 1))
    filteredSocial.forEach((s) => m.set(s.type, (m.get(s.type) || 0) + (s.reportCount || 1)))
    return Array.from(m.entries()).map(([type, count]) => ({ type, count }))
  }, [filteredReports, filteredSocial])

  const verifiedSplit = useMemo(() => {
    const verified = filteredReports.filter((r) => r.verified).length
    const unverified = filteredReports.length - verified
    const socialVerified = Math.floor(filteredSocial.reduce((sum, s) => sum + s.reportCount, 0) * 0.7)
    const socialUnverified = filteredSocial.reduce((sum, s) => sum + s.reportCount, 0) - socialVerified

    return [
      { name: "Reports Verified", value: verified, color: "#2563eb" },
      { name: "Reports Unverified", value: unverified, color: "#64748b" },
      { name: "Social Verified", value: socialVerified, color: "#10b981" },
      { name: "Social Unverified", value: socialUnverified, color: "#f59e0b" },
    ]
  }, [filteredReports, filteredSocial])

  const topKeywords = useMemo(() => {
    const emergencyKeywords = [
      { keyword: "evacuation", count: 38, category: "emergency" },
      { keyword: "flooding", count: 35, category: "disaster" },
      { keyword: "emergency", count: 32, category: "emergency" },
      { keyword: "shelter", count: 28, category: "relief" },
      { keyword: "medical", count: 24, category: "health" },
      { keyword: "power", count: 21, category: "infrastructure" },
      { keyword: "transport", count: 18, category: "infrastructure" },
      { keyword: "rescue", count: 16, category: "emergency" },
    ]
    return emergencyKeywords
  }, [])

  const summaryData = useMemo(() => {
    const highImpactAreas = areaImpactData
      .filter((area) => area.impactLevel === "High")
      .sort((a, b) => b.totalReports - a.totalReports)
      .slice(0, 3)

    const allNeeds = areaImpactData.flatMap((area) => area.needs)
    const needsCounts = new Map<string, number>()
    allNeeds.forEach((need) => {
      needsCounts.set(need.need, (needsCounts.get(need.need) || 0) + need.count)
    })

    const topNeed = Array.from(needsCounts.entries()).sort((a, b) => b[1] - a[1])[0]

    return {
      highImpactAreas: highImpactAreas.map((area) => area.area),
      currentHighestNeed: topNeed ? topNeed[0] : "Emergency Evacuation",
      currentHighestNeedCount: topNeed ? topNeed[1] : 0,
      totalReports: filteredReports.length,
      totalSocialPosts: filteredSocial.reduce((sum, s) => sum + s.reportCount, 0),
    }
  }, [areaImpactData, filteredReports, filteredSocial])

  return (
    <main className="space-y-6 px-2 md:px-4 lg:px-6 py-4 md:py-6 lg:py-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-balance">Hotspots</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button onClick={handleExportJSON}>Export JSON</Button>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select value={type} onValueChange={setType}>
              <SelectTrigger aria-label="Filter by type">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {types.map((t) => (
                  <SelectItem key={t} value={t}>
                    {t}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={area} onValueChange={setArea}>
              <SelectTrigger aria-label="Filter by area">
                <SelectValue placeholder="Chennai Area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Areas</SelectItem>
                {CHENNAI_AREAS.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger aria-label="Filter by timeframe">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">Last 24h</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 pt-2">
              <Button
                variant={showReports ? "default" : "outline"}
                onClick={() => setShowReports((v) => !v)}
                aria-pressed={showReports}
              >
                Reports
              </Button>
              <Button
                variant={showSocial ? "default" : "outline"}
                onClick={() => setShowSocial((v) => !v)}
                aria-pressed={showSocial}
              >
                Social
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Chennai Emergency Hotspot Map</CardTitle>
          </CardHeader>
          <CardContent className="h-[420px]">
            <ChennaiHotspotMap />
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <div>
              <strong className="text-foreground">High Impact Areas:</strong>
              <div className="mt-1">
                {summaryData.highImpactAreas.map((area, idx) => (
                  <span
                    key={area}
                    className="inline-block px-2 py-1 mr-1 mb-1 rounded-md bg-red-100 text-red-800 text-xs"
                  >
                    {area}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <strong className="text-foreground">Current Highest Need:</strong> {summaryData.currentHighestNeed} (
              {summaryData.currentHighestNeedCount})
            </div>
            <div>
              Reports: <span className="text-foreground font-medium">{summaryData.totalReports}</span>
            </div>
            <div>
              Social Media Posts: <span className="text-foreground font-medium">{summaryData.totalSocialPosts}</span>
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Top Emergency Keywords</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {topKeywords.map((k) => (
                <div key={k.keyword} className="flex flex-col items-center p-3 rounded-lg border bg-muted/30">
                  <span className="text-lg font-semibold text-foreground">{k.count}</span>
                  <span className="text-sm font-medium text-foreground capitalize">{k.keyword}</span>
                  <span className="text-xs text-muted-foreground capitalize">{k.category}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Area-wise Impact Distribution</CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span>High Impact</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span>Medium Impact</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span>Low Impact</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={areaImpactData.slice(0, 8)}>
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalReports" radius={[4, 4, 0, 0]}>
                  {areaImpactData.slice(0, 8).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Verification Status</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-600"></div>
                <span>Reports Verified</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-slate-600"></div>
                <span>Reports Unverified</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-600"></div>
                <span>Social Verified</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span>Social Unverified</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={verifiedSplit} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {verifiedSplit.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {area !== "all" && (
        <section>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">{area} - Current Needs & Threat Level</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const areaData = areaImpactData.find((a) => a.area === area)
                if (!areaData) return <p>No data available for this area.</p>

                return (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Threat Level:</span>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            areaData.threatLevel === "Critical"
                              ? "bg-red-100 text-red-800"
                              : areaData.threatLevel === "High"
                                ? "bg-orange-100 text-orange-800"
                                : areaData.threatLevel === "Medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                          }`}
                        >
                          {areaData.threatLevel}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Reports: <span className="font-medium text-foreground">{areaData.totalReports}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Social Posts: <span className="font-medium text-foreground">{areaData.socialPosts}</span>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium mb-2">Current Needs:</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {areaData.needs.map((need, idx) => (
                          <div key={idx} className="flex items-center justify-between p-2 rounded border">
                            <span className="text-sm">{need.need}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-medium">{need.count}</span>
                              <span
                                className={`px-1 py-0.5 rounded text-xs ${
                                  need.threatLevel === "High"
                                    ? "bg-red-100 text-red-700"
                                    : need.threatLevel === "Medium"
                                      ? "bg-yellow-100 text-yellow-700"
                                      : "bg-green-100 text-green-700"
                                }`}
                              >
                                {need.threatLevel}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </section>
      )}
    </main>
  )
}
