"use client"

import { useEffect, useState } from "react"
import useSWR from "swr"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Edit, Trash, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

type Helpline = {
  id: string
  name: string
  number: string
  category: string
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function AdminHelplines() {
  const { data, mutate } = useSWR<Helpline[]>("/api/helplines", fetcher)
  const [editing, setEditing] = useState<Helpline | null>(null)
  const [form, setForm] = useState({ name: "", number: "", category: "" })
  const { toast } = useToast()

  useEffect(() => {
    if (editing) {
      setForm({ name: editing.name, number: editing.number, category: editing.category })
    } else {
      setForm({ name: "", number: "", category: "" })
    }
  }, [editing])

  async function save() {
    try {
      const method = editing ? "PUT" : "POST"
      const url = editing ? `/api/helplines/${editing.id}` : "/api/helplines"
      await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
      toast({ title: `Helpline ${editing ? "updated" : "created"}` })
      setEditing(null)
      mutate()
    } catch {
      toast({ title: "Failed to save helpline", variant: "destructive" })
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this helpline?")) return
    try {
      await fetch(`/api/helplines/${id}`, { method: "DELETE" })
      toast({ title: "Helpline deleted" })
      mutate()
    } catch {
      toast({ title: "Failed to delete helpline", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>{editing ? "Edit Helpline" : "Create Helpline"}</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Input placeholder="Number" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
          <Input placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <div className="flex gap-2">
            <Button onClick={save}>{editing ? "Update" : "Create"}</Button>
            {editing && <Button variant="destructive" onClick={() => setEditing(null)}>Cancel</Button>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>All Helplines</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(data ?? []).map((h) => (
            <div key={h.id} className="flex justify-between items-center border-b py-1">
              <div>{h.name} — {h.number} ({h.category})</div>
              <div className="flex gap-2">
                <Button size="icon" variant="secondary" onClick={() => setEditing(h)}><Edit className="h-4 w-4" /></Button>
                <Button size="icon" variant="destructive" onClick={() => remove(h.id)}><Trash className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
