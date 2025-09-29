"use client"

import { useMemo, useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ReportFilters } from "@/components/reports/report-filters"
import { ReportForm } from "@/components/reports/report-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, Trash2, Edit } from "lucide-react"
import { ReportCard as ReportCardBase } from "@/components/reports/report-card"

type MediaItem = { type: "image" | "video"; url: string; fileId?: string }

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

const API_BASE = "/api/reports"

// -------------------- FETCH HOOKS --------------------
function useReports(filters: { district?: string; state?: string; date?: string }, search: string) {
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
      const fullUrl = `${API_BASE}${params.toString() ? `?${params.toString()}` : ""}`
      const response = await fetch(fullUrl, { cache: "no-store" })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const result = await response.json()
      setData(Array.isArray(result) ? result : [])
    } catch (err) {
      console.error("Error fetching reports:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch reports")
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchReports() }, [filters.district, filters.state, filters.date, search])

  return { data, isLoading, error, mutate: fetchReports }
}

function useMyReports() {
  const [data, setData] = useState<Report[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMyReports = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await fetch(`${API_BASE}/my`, { cache: "no-store" })
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
      const result = await response.json()
      setData(Array.isArray(result) ? result : [])
    } catch (err) {
      console.error("Error fetching my reports:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch your reports")
      setData([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => { fetchMyReports() }, [])

  return { data, isLoading, error, mutate: fetchMyReports }
}

// -------------------- MAIN PAGE --------------------
export default function ReportsPage() {
  const [mode, setMode] = useState<"all" | "images" | "videos" | "admin">("all")
  const [search, setSearch] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState(search)
  const [filters, setFilters] = useState<{ district?: string; state?: string; date?: string }>({})
  const [activeTab, setActiveTab] = useState("feed")

  const { data, isLoading, error, mutate } = useReports(filters, debouncedSearch)
  const { data: myReportsData, isLoading: myReportsLoading, error: myReportsError, mutate: mutateMyReports } = useMyReports()

  const districts = useMemo(() => Array.from(new Set(data.map(r => r.district).filter(Boolean))), [data])
  const states = useMemo(() => Array.from(new Set(data.map(r => r.state).filter(Boolean))), [data])

  // -------------------- Debounce search --------------------
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 300)
  }, [search])

  // -------------------- Process reports --------------------
  const reports = useMemo(() => {
    return data.map(r => ({
      ...r,
      verified: r.source === "ADMIN" ? true : r.verified,
      _media: r.media || (r.mediaFileIds || []).map(id => ({
        type: id.toLowerCase().match(/\.(jpe?g|png|gif|webp)$/) ? "image" : "video",
        url: `${API_BASE}/media/${id}/stream`,
        fileId: id,
      }))
    })).filter(r => {
      if (mode === "admin") return r.source === "ADMIN"
      if (mode === "images") return r._media.some(m => m.type === "image")
      if (mode === "videos") return r._media.some(m => m.type === "video")
      return true
    })
  }, [data, mode])

  const myReports = useMemo(() => {
    return myReportsData.map(r => ({
      ...r,
      verified: r.source === "ADMIN" ? true : r.verified,
      _media: r.media || (r.mediaFileIds || []).map(id => ({
        type: id.toLowerCase().match(/\.(jpe?g|png|gif|webp)$/) ? "image" : "video",
        url: `${API_BASE}/media/${id}/stream`,
        fileId: id,
      }))
    }))
  }, [myReportsData])

  // -------------------- Handlers --------------------
  const deleteReport = async (id: string) => {
    if (!confirm("Delete this report?")) return
    try {
      const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete report")
      await mutate()
      await mutateMyReports()
    } catch (err) {
      alert("Error deleting report: " + (err instanceof Error ? err.message : "Unknown"))
    }
  }

  const handleReportSubmitted = async () => {
    await mutate()
    await mutateMyReports()
    setActiveTab("feed")
  }

  // -------------------- JSX --------------------
  return (
    <main className="mx-auto w-full max-w-3xl p-4 md:p-6">
      <header className="mb-4 space-y-3">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Community Reports</h1>
          <Button onClick={() => { mutate(); mutateMyReports() }} disabled={isLoading || myReportsLoading} size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${(isLoading || myReportsLoading) ? "animate-spin" : ""}`} /> Refresh
          </Button>
        </div>

        <ReportFilters
          isLoading={isLoading}
          search={search}
          onSearch={setSearch}
          mode={mode}
          onModeChange={setMode}
          filters={filters}
          onFiltersChange={setFilters}
          districts={districts}
          states={states}
        />
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="feed">Feed</TabsTrigger>
          <TabsTrigger value="my-reports">My Reports</TabsTrigger>
          <TabsTrigger value="create">Create</TabsTrigger>
        </TabsList>

        {/* Feed */}
        <TabsContent value="feed" className="mt-4 space-y-3">
          {error && <div className="text-red-600">Error: {error}</div>}
          {isLoading && <div>Loading reports...</div>}
          {!isLoading && !error && reports.map(r => (
            <Card key={r.id}>
              <CardContent>
                <ReportCardBase report={r} showVerifiedBadge />
              </CardContent>
            </Card>
          ))}
          {!isLoading && !error && reports.length === 0 && (
            <div className="text-sm text-muted-foreground">No reports available yet.</div>
          )}
        </TabsContent>

        {/* My Reports */}
        <TabsContent value="my-reports" className="mt-4 space-y-3">
          {myReports.map(r => (
            <Card key={r.id}>
              <CardHeader className="flex justify-between items-center">
                <CardTitle>{r.type} {r.verified && "• Verified"}</CardTitle>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => deleteReport(r.id)} variant="destructive"><Trash2 className="h-4 w-4" /> Delete</Button>
                  <Button size="sm" onClick={() => alert("Edit functionality here")} variant="outline"><Edit className="h-4 w-4" /> Edit</Button>
                </div>
              </CardHeader>
              <CardContent><ReportCardBase report={r} showVerifiedBadge /></CardContent>
            </Card>
          ))}
          {myReports.length === 0 && <div className="text-sm text-muted-foreground">You have not posted any reports yet.</div>}
        </TabsContent>

        {/* Create */}
        <TabsContent value="create" className="mt-4">
          <ReportForm onSubmitted={handleReportSubmitted} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
