"use client"

import { ReportCard } from "@/components/reports/report-card"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useState } from "react"

type MediaItem = { type: "image" | "video"; url: string }
type Report = {
  id: string
  type: string
  description: string
  district: string
  state: string
  observedAt: string
  submittedAt: string
  location?: { lat: number; lng: number } | null
  media?: MediaItem[]
  mediaFileIds?: string[]
  verified?: boolean
  source: "USER" | "ADMIN" | "MOCK_REPORT"
  highlighted?: boolean
}

export function AdminReportCard({
  report,
  onChanged,
}: {
  report: Report
  onChanged?: () => void
}) {
  const [busy, setBusy] = useState<null | "verify" | "highlight" | "delete">(null)

  async function toggleVerify() {
    setBusy("verify")
    try {
      await fetch(`/api/reports?id=${encodeURIComponent(report.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ verified: !report.verified }),
      })
      onChanged?.()
    } finally {
      setBusy(null)
    }
  }

  async function toggleHighlight() {
    setBusy("highlight")
    try {
      await fetch(`/api/reports?id=${encodeURIComponent(report.id)}`, {
        method: "PATCH",
        body: JSON.stringify({ highlighted: !report.highlighted }),
      })
      onChanged?.()
    } finally {
      setBusy(null)
    }
  }

  async function remove() {
    setBusy("delete")
    try {
      await fetch(`/api/reports?id=${encodeURIComponent(report.id)}`, { method: "DELETE" })
      onChanged?.()
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="space-y-2">
      <ReportCard report={report} />
      <Card className="flex items-center justify-end gap-2 p-2">
        <Button
          variant={report.verified ? "secondary" : "default"}
          size="sm"
          onClick={toggleVerify}
          disabled={busy === "verify"}
        >
          {busy === "verify" ? "Saving…" : report.verified ? "Unverify" : "Verify"}
        </Button>
        <Button
          variant={report.highlighted ? "secondary" : "default"}
          size="sm"
          onClick={toggleHighlight}
          disabled={busy === "highlight"}
        >
          {busy === "highlight" ? "Saving…" : report.highlighted ? "Unhighlight" : "Highlight"}
        </Button>
        <Button variant="destructive" size="sm" onClick={remove} disabled={busy === "delete"}>
          {busy === "delete" ? "Deleting…" : "Delete"}
        </Button>
      </Card>
    </div>
  )
}
