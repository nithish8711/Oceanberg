"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import impact from "@/data/dummy-impact-summary.json"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

const IMPACT_COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#10b981",
  primary: "#2563eb",
  secondary: "#8b5cf6",
}

export default function Page() {
  const data = impact as any

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
    download("chennai-impact-analysis.json", JSON.stringify(data, null, 2))
  }

  const handleExportCSV = () => {
    const rows = [
      ["area", "report_count", "needs", "need_count", "severity"].join(","),
      ...data.reportCountsByArea.map((item: any) => [item.area, item.count, "", "", ""].join(",")),
      ...data.needsBreakdown.map((item: any) => ["", "", item.need, item.count, ""].join(",")),
    ].join("\n")
    download("chennai-impact-analysis.csv", rows, "text/csv")
  }

  const handleSendToAdmin = () => {
    console.log("[v0] Sending impact analysis to admin:", data)
    alert("Impact analysis sent to Admin (placeholder functionality)")
  }

  return (
    <main className="space-y-6 px-2 md:px-4 lg:px-6 py-4 md:py-6 lg:py-8 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-balance">Impact</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExportJSON}>
            Export JSON
          </Button>
          <Button onClick={handleSendToAdmin}>Send to Admin</Button>
        </div>
      </header>

      {/* Charts Row 1: Area-wise reports and needs breakdown */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Area-wise Report Count</CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-600"></div>
                <span>Report Count</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.reportCountsByArea}>
                <XAxis dataKey="area" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill={IMPACT_COLORS.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Needs Breakdown</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span>Critical</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-orange-500"></div>
                <span>High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-600"></div>
                <span>Low</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.needsBreakdown} dataKey="count" nameKey="need" cx="50%" cy="50%" outerRadius={80}>
                  {data.needsBreakdown.map((entry: any, i: number) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Charts Row 2: Trends and severity */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reports/Social Media Posts per Hour</CardTitle>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-blue-600"></div>
                <span>Reports</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-600"></div>
                <span>Social Media</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendPerHour}>
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="reports" stroke={IMPACT_COLORS.primary} strokeWidth={2} />
                <Line type="monotone" dataKey="social" stroke={IMPACT_COLORS.low} strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Severity Index - Chennai City</CardTitle>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <span>Severity Level</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={data.severityByRegion}>
                <PolarGrid />
                <PolarAngleAxis dataKey="region" />
                <PolarRadiusAxis />
                <Radar dataKey="severity" stroke={IMPACT_COLORS.high} fill={IMPACT_COLORS.high} fillOpacity={0.5} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      {/* Summary and Critical List */}
      <aside className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Highest Risk Exposure - Chennai</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.highestRisk.region}</div>
            <div className="text-sm text-muted-foreground">
              Severity Index: <span className="text-foreground font-medium">{data.highestRisk.severity}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Primary Impact: <span className="text-foreground font-medium">{data.highestRisk.impact}</span>
            </div>
            <div className="mt-3 text-sm">
              <strong>Current Highest Need:</strong> {data.summary.currentHighestNeed}
            </div>
            <div className="text-sm text-muted-foreground">
              Total Reports: <span className="font-medium text-foreground">{data.summary.totalReports}</span> | Social
              Posts: <span className="font-medium text-foreground">{data.summary.totalSocialPosts}</span>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Critical Areas - Chennai</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.criticalList.map((item: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <span>{item.area}</span>
                <span
                  className={`font-medium px-2 py-1 rounded text-xs ${
                    item.severity > 8.5
                      ? "bg-red-100 text-red-800"
                      : item.severity > 7.5
                        ? "bg-orange-100 text-orange-800"
                        : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {item.severity}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </aside>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Data Verification Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.verificationSplit.map((item: any, idx: number) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{item.source}</span>
                  <span className="text-sm text-muted-foreground">Total: {item.total}</span>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500"></div>
                    <span>Verified: {item.verified}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-orange-500"></div>
                    <span>Unverified: {item.unverified}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{ width: `${(item.verified / item.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top Keywords - Cyclone Impact</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {data.topKeywords.map((item: any, idx: number) => (
              <span key={idx} className="px-2 py-1 rounded-md bg-muted text-foreground text-xs">
                {item.keyword} ({item.count})
              </span>
            ))}
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
