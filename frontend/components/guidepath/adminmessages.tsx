"use client"

import { useState, useRef, useEffect } from "react"
import useSWR from "swr"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

type Message = {
  id: string
  from: "USER" | "ADMIN"
  text: string
  at: string
}

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function AdminMessages() {
  const { data, mutate } = useSWR<Message[]>("/api/messages", fetcher, { refreshInterval: 5000 })
  const [text, setText] = useState("")
  const listRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const messages = data ?? []

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages])

  async function send() {
    if (!text.trim()) return
    await fetch("/api/messages", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) })
    setText("")
    await mutate()
  }

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return
    await fetch(`/api/messages/${id}`, { method: "DELETE" })
    toast({ title: "Message deleted" })
    mutate()
  }

  return (
    <Card className="space-y-3">
      <CardHeader><CardTitle>Admin Messaging Panel</CardTitle></CardHeader>
      <CardContent className="flex flex-col h-72">
        <div ref={listRef} className="flex-1 space-y-2 overflow-y-auto">
          {messages.map((m) => (
            <div key={m.id} className={m.from === "ADMIN" ? "text-right" : "text-left"}>
              <div className={`inline-block max-w-[75%] rounded-md px-3 py-2 ${m.from === "ADMIN" ? "bg-primary text-primary-foreground" : "bg-secondary"}`}>
                {m.text}
                <div className="text-[10px] opacity-70 mt-1">{new Date(m.at).toLocaleTimeString()}</div>
              </div>
              <Button size="icon" variant="destructive" onClick={() => remove(m.id)}>Delete</Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input placeholder="Type message…" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
          <Button onClick={send}>Send</Button>
        </div>
      </CardContent>
    </Card>
  )
}
