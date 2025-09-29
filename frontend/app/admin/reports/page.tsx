"use client"

import { useMemo, useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ReportCard } from "@/components/reports/report-card"
import { ReportFilters } from "@/components/reports/report-filters"
import { ReportForm } from "@/components/reports/report-form"
import { CheckCircle2, Circle, Star, Trash2, Download, RefreshCw } from "lucide-react"

type MediaItem = { 
  type: "image" | "video" 
  url: string 
  fileId?: string
}

type Report = {
  id: string
  userId?: string
  type: string
  description: string
  location?: { lat: number; lng: number }
  district: string
  state: string
  observedAt: string
  submittedAt: string
  media?: MediaItem[]
  mediaFileIds?: string[]
  verified?: boolean
  highlighted?: boolean
  source: "USER" | "ADMIN" | "MOCK_REPORT"
}

function useAdminReports(filters: { district?: string; state?: string; date?: string }, search: string) {
  const [data, setData] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchReports = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const params = new URLSearchParams()
      if (filters.district) params.append("district", filters.district)
      if (filters.state) params.append("state", filters.state)
      if (filters.date) params.append("date", filters.date)
      if (search.trim()) params.append("q", search.trim())
      
      const fullUrl = `/api/reports${params.toString() ? `?${params.toString()}` : ""}`
      const response = await fetch(fullUrl, { cache: "no-store" })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

      const result = await response.json()
      // Auto-verify admin reports
      const updated = Array.isArray(result)
        ? result.map(r => r.source === "ADMIN" ? { ...r, verified: true } : r)
        : []
      setData(updated)
    } catch (err) {
      console.error("Error fetching reports:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch reports")
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReports()
  }, [filters.district, filters.state, filters.date, search])

  return { data, isLoading, error, mutate: fetchReports }
}

export default function AdminReportsPage() {
  const [mode, setMode] = useState<"all" | "images" | "videos" | "admin">("all")
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState<{ district?: string; state?: string; date?: string }>({})
  const [verifiedOnly, setVerifiedOnly] = useState<undefined | boolean>(undefined)
  const [typeFilter, setTypeFilter] = useState<string | undefined>(undefined)

  const { data, isLoading, error, mutate } = useAdminReports(filters, search)

  const districts = useMemo(() => Array.from(new Set(data.map(r => r.district).filter(Boolean))), [data])
  const states = useMemo(() => Array.from(new Set(data.map(r => r.state).filter(Boolean))), [data])
  const types = useMemo(() => Array.from(new Set(data.map(r => r.type).filter(Boolean))), [data])

  const reports = useMemo(() => {
    let filtered = data.slice()

    filtered = filtered.filter(r => {
      const media = (r.media && r.media.length > 0
        ? r.media
        : (r.mediaFileIds || []).map(id => ({
            type: id.toLowerCase().match(/\.(jpe?g|png|gif|webp)$/) ? "image" : "video",
            url: `/api/reports/media/${id}/stream`,
            fileId: id
          }))) as MediaItem[]

      if (mode === "images") return media.some(m => m.type === "image")
      if (mode === "videos") return media.some(m => m.type === "video")
      return true
    })

    filtered = filtered.filter(r => {
      if (filters.district && r.district !== filters.district) return false
      if (filters.state && r.state !== filters.state) return false
      if (filters.date && new Date(r.observedAt).toDateString() !== new Date(filters.date).toDateString()) return false
      if (verifiedOnly !== undefined && !!r.verified !== verifiedOnly) return false
      if (typeFilter && r.type !== typeFilter) return false
      return true
    })

    // Admin reports on top
    return filtered.sort((a, b) => (b.source === "ADMIN" ? 1 : 0) - (a.source === "ADMIN" ? 1 : 0))
  }, [data, mode, filters, verifiedOnly, typeFilter])

  const total = reports.length
  const verifiedCount = reports.filter(r => r.verified).length
  const percentVerified = total ? Math.round((verifiedCount / total) * 100) : 0
  const districtCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const r of reports) counts[r.district || "Unknown"] = (counts[r.district || "Unknown"] || 0) + 1
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [reports])

  async function patchReport(id: string, changes: Partial<Report>) {
    try {
      const formData = new FormData()
      Object.entries(changes).forEach(([k, v]) => formData.append(k, typeof v === "boolean" ? String(v) : String(v)))
      const res = await fetch(`/api/reports/${id}`, { method: "PUT", body: formData })
      if (!res.ok) throw new Error("Failed to update report")
      await mutate()
    } catch (err) {
      console.error("Error updating report:", err)
      alert("Failed to update report: " + (err instanceof Error ? err.message : "Unknown error"))
    }
  }

  async function deleteReport(id: string) {
    try {
      const res = await fetch(`/api/reports/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete report")
      await mutate()
    } catch (err) {
      console.error("Error deleting report:", err)
      alert("Failed to delete report: " + (err instanceof Error ? err.message : "Unknown error"))
    }
  }

  async function deleteAllReports() {
    try {
      if (!confirm("Delete all reports?")) return
      const res = await fetch(`/api/reports/all`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete all reports")
      await mutate()
      alert("All reports deleted successfully")
    } catch (err) {
      console.error("Error deleting all reports:", err)
      alert("Failed to delete all reports: " + (err instanceof Error ? err.message : "Unknown error"))
    }
  }

  return (
    <main className="mx-auto w-full max-w-4xl p-4 md:p-6">
      <header className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Report Moderation</h1>
          <Button onClick={mutate} disabled={isLoading} size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        <ReportFilters
          isLoading={isLoading}
          search={search}
          onSearch={setSearch}
          mode={mode}
          onModeChange={setMode}
          filters={filters}
          onFiltersChange={f => setFilters(prev => ({ ...prev, ...f }))}
          districts={districts}
          states={states}
        />

        <div className="flex flex-wrap items-center gap-2 mt-2">
          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={verifiedOnly === undefined ? "all" : verifiedOnly ? "verified" : "unverified"}
            onChange={e => setVerifiedOnly(e.target.value === "all" ? undefined : e.target.value === "verified")}
          >
            <option value="all">All statuses</option>
            <option value="verified">Verified only</option>
            <option value="unverified">Unverified only</option>
          </select>

          <select
            className="rounded-md border bg-background px-3 py-2 text-sm"
            value={typeFilter || "all"}
            onChange={e => setTypeFilter(e.target.value === "all" ? undefined : e.target.value)}
          >
            <option value="all">All types</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <Button variant="destructive" size="sm" onClick={deleteAllReports}>Delete All</Button>

          <div className="ml-auto flex items-center gap-2 text-sm">
            <Badge variant="secondary">Total: {total}</Badge>
            <Badge variant="secondary">Verified: {verifiedCount}</Badge>
            <Badge variant="secondary">% Verified: {percentVerified}%</Badge>
          </div>
        </div>
      </header>

      <section className="space-y-3">
        {error && (
          <Card>
            <CardContent className="p-6 text-sm text-red-600">
              Error loading reports: {error}
              <button onClick={mutate} className="ml-2 underline text-blue-600">Try again</button>
            </CardContent>
          </Card>
        )}

        {isLoading && !error && (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Loading reports...</CardContent></Card>
        )}

        {!isLoading && !error && reports.map(r => (
          <Card key={r.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                {r.type}
                {r.verified ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <CheckCircle2 className="h-4 w-4" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Circle className="h-4 w-4" /> Unverified
                  </span>
                )}
                {r.highlighted && (
                  <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-yellow-100 px-2 py-0.5 text-[11px] font-medium text-yellow-800">
                    <Star className="h-3 w-3" /> Highlighted
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ReportCard report={r} />
              <Separator />
              <div className="flex flex-wrap items-center gap-2">
                <Button variant={r.verified ? "secondary" : "default"} size="sm" onClick={() => patchReport(r.id, { verified: !r.verified })}>
                  {r.verified ? "Unverify" : "Verify"}
                </Button>
                <Button variant={r.highlighted ? "secondary" : "default"} size="sm" onClick={() => patchReport(r.id, { highlighted: !r.highlighted })}>
                  <Star className="mr-2 h-4 w-4" />{r.highlighted ? "Unhighlight" : "Highlight"}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => confirm("Delete this report?") && deleteReport(r.id)}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </Button>
                {r.mediaFileIds?.length > 0 && (
                  <Button variant="outline" size="sm" onClick={() => r.mediaFileIds!.forEach(id => window.open(`/api/reports/media/${id}/download`, "_blank"))}>
                    <Download className="mr-2 h-4 w-4" /> Download Media
                  </Button>
                )}
                <div className="ml-auto text-xs text-muted-foreground">ID: {r.id} • {r.source === "ADMIN" ? "Admin" : "User"}</div>
              </div>
            </CardContent>
          </Card>
        ))}

        {!isLoading && !error && reports.length === 0 && (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">No reports found.</CardContent></Card>
        )}
      </section>

      <section className="mt-8 space-y-3">
        <h2 className="text-lg font-semibold">Post Official Admin Report</h2>
        <ReportForm
          source="ADMIN"
          onSubmitted={async () => {
            await mutate()
            window.scrollTo({ top: 0, behavior: "smooth" })
          }}
        />
      </section>
    </main>
  )
}
