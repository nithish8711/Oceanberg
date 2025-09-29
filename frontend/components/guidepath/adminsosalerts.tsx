"use client"

import { useState } from "react"
import useSWR from "swr"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type SosAlert = {
  id: string
  location: string
  transcript?: string
  status: "PENDING" | "RESOLVED"
  at: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AdminSOSAlerts() {
  const { data, mutate } = useSWR<SosAlert[]>("/api/sos", fetcher, { refreshInterval: 5000 })
  const { toast } = useToast()

  async function resolveAlert(id: string) {
    await fetch(`/api/sos/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "RESOLVED" }) })
    toast({ title: "Alert resolved" })
    mutate()
  }

  async function remove(id: string) {
    if (!confirm("Delete this alert?")) return
    await fetch(`/api/sos/${id}`, { method: "DELETE" })
    toast({ title: "Alert deleted" })
    mutate()
  }

  return (
    <Card className="space-y-3">
      <CardHeader><CardTitle>All SOS Alerts</CardTitle></CardHeader>
      <CardContent className="space-y-2 max-h-80 overflow-y-auto">
        {(data ?? []).map((a) => (
          <div key={a.id} className="flex justify-between items-center border-b py-1">
            <div>
              {a.location} — {a.transcript || "No transcript"} ({a.status})
              <div className="text-xs opacity-70">{new Date(a.at).toLocaleString()}</div>
            </div>
            <div className="flex gap-2">
              {a.status === "PENDING" && <Button size="sm" onClick={() => resolveAlert(a.id)}>Resolve</Button>}
              <Button size="sm" variant="destructive" onClick={() => remove(a.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
