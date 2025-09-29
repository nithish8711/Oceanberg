"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { CheckCircle2, Clock, Send, MessageSquare } from "lucide-react"

const MOCK_ADMIN_MESSAGES = [
  {
    id: "msg-001",
    from: "ADMIN",
    to: "ANALYTICS",
    subject: "Cyclone Update Required",
    message: "Please provide updated impact analysis for Egmore area. Reports indicate escalating situation.",
    timestamp: "2025-09-26T08:30:00Z",
    status: "READ",
    priority: "HIGH",
  },
  {
    id: "msg-002",
    from: "ADMIN",
    to: "ANALYTICS",
    subject: "Resource Allocation Query",
    message: "Need verification on shelter capacity data for T. Nagar and Mylapore areas.",
    timestamp: "2025-09-26T07:15:00Z",
    status: "UNREAD",
    priority: "MEDIUM",
  },
  {
    id: "msg-003",
    from: "ANALYTICS",
    to: "ADMIN",
    subject: "Critical Situation: Chennai Central",
    message:
      "High intensity cyclone impact detected in central Chennai. Recommend immediate evacuation for Egmore and surrounding areas.",
    timestamp: "2025-09-26T06:45:00Z",
    status: "SENT",
    priority: "CRITICAL",
  },
]

const MESSAGE_TEMPLATES = [
  {
    subject: "Critical Cyclone Impact - Chennai",
    summary:
      "Severe cyclone conditions detected across multiple Chennai areas with high-intensity impact in Egmore, T. Nagar, and Mylapore. Widespread infrastructure damage and emergency evacuation requirements identified.",
    action:
      "Immediate evacuation recommended for high-risk areas. Deploy emergency medical teams and establish temporary shelters. Coordinate with local authorities for power restoration and communication services.",
  },
  {
    subject: "Resource Shortage Alert - Chennai Areas",
    summary:
      "Analysis indicates critical shortage of emergency supplies across affected Chennai areas. Food, water, and medical supplies urgently needed in Triplicane, Royapettah, and Anna Salai areas.",
    action:
      "Mobilize emergency supply distribution. Coordinate with NGOs and relief organizations. Establish supply distribution centers in safe zones.",
  },
  {
    subject: "Communication Infrastructure Down",
    summary:
      "Cyclone damage has severely impacted communication infrastructure in Chennai. Multiple areas reporting complete communication blackout affecting coordination efforts.",
    action:
      "Deploy mobile communication units. Establish emergency communication hubs. Coordinate with telecom providers for rapid restoration.",
  },
]

export default function Page() {
  const [activeTab, setActiveTab] = useState<"compose" | "received">("compose")
  const [subject, setSubject] = useState("")
  const [summary, setSummary] = useState("")
  const [action, setAction] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null)
  const [messages, setMessages] = useState(MOCK_ADMIN_MESSAGES)

  const generateMessage = () => {
    const template = MESSAGE_TEMPLATES[Math.floor(Math.random() * MESSAGE_TEMPLATES.length)]
    setSubject(template.subject)
    setSummary(template.summary)
    setAction(template.action)
    setSelectedTemplate(MESSAGE_TEMPLATES.indexOf(template))
  }

  const handleSend = () => {
    console.log("[v0] Admin message", { subject, summary, action })

    const newMessage = {
      id: `msg-${Date.now()}`,
      from: "ANALYTICS" as const,
      to: "ADMIN" as const,
      subject,
      message: `${summary}\n\nRecommended Action:\n${action}`,
      timestamp: new Date().toISOString(),
      status: "SENT" as const,
      priority: "HIGH" as const,
    }

    setMessages((prev) => [newMessage, ...prev])
    alert("Message sent to Admin successfully!")
    setSubject("")
    setSummary("")
    setAction("")
    setSelectedTemplate(null)
  }

  const handleVerifyAndSend = () => {
    if (!subject.trim() || !summary.trim() || !action.trim()) {
      alert("Please fill in all required fields before sending.")
      return
    }

    const confirmed = confirm("Verify message content and send to Admin?")
    if (confirmed) {
      handleSend()
    }
  }

  const markAsRead = (messageId: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === messageId ? { ...msg, status: "READ" as const } : msg)))
  }

  const unreadCount = messages.filter((msg) => msg.from === "ADMIN" && msg.status === "UNREAD").length

  return (
    <main className="space-y-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold text-balance">Admin Communication</h1>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {unreadCount} unread
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "compose" ? "default" : "outline"}
            onClick={() => setActiveTab("compose")}
            className="flex items-center gap-2"
          >
            <Send className="h-4 w-4" />
            Compose
          </Button>
          <Button
            variant={activeTab === "received" ? "default" : "outline"}
            onClick={() => setActiveTab("received")}
            className="flex items-center gap-2"
          >
            <MessageSquare className="h-4 w-4" />
            Messages ({messages.filter((m) => m.from === "ADMIN").length})
          </Button>
        </div>
      </header>

      {activeTab === "compose" && (
        <section className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                Quick Templates
                <Button variant="outline" size="sm" onClick={generateMessage}>
                  Auto-Generate Message
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MESSAGE_TEMPLATES.map((template, idx) => (
                  <Button
                    key={idx}
                    variant={selectedTemplate === idx ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setSubject(template.subject)
                      setSummary(template.summary)
                      setAction(template.action)
                      setSelectedTemplate(idx)
                    }}
                    className="w-full text-left h-auto p-4 justify-start"
                  >
                    <div className="w-full">
                      <div className="font-medium text-sm mb-1">{template.subject}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {template.summary.substring(0, 120)}...
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Compose Message to Admin</CardTitle>
              <p className="text-sm text-muted-foreground">
                Analytics team must verify all content before sending to admin
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <label htmlFor="subject" className="text-sm text-muted-foreground">
                  Subject *
                </label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Critical Situation: Chennai Cyclone Impact"
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="summary" className="text-sm text-muted-foreground">
                  Impact Summary *
                </label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Detailed analysis of current situation, affected areas, severity levels, and immediate concerns..."
                  rows={4}
                />
              </div>
              <div className="space-y-1">
                <label htmlFor="action" className="text-sm text-muted-foreground">
                  Recommended Action *
                </label>
                <Textarea
                  id="action"
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  placeholder="Specific recommendations for immediate response, resource allocation, evacuation procedures..."
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSubject("")
                    setSummary("")
                    setAction("")
                    setSelectedTemplate(null)
                  }}
                >
                  Clear
                </Button>
                <Button onClick={handleVerifyAndSend} className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Verify & Send to Admin
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

      {activeTab === "received" && (
        <section className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Messages from Admin</CardTitle>
              <p className="text-sm text-muted-foreground">Two-way communication with admin team</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No messages yet</p>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`border rounded-lg p-4 ${
                      message.from === "ADMIN" && message.status === "UNREAD"
                        ? "border-blue-200 bg-blue-50"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={message.from === "ADMIN" ? "secondary" : "default"}>{message.from}</Badge>
                        <Badge
                          variant={
                            message.priority === "CRITICAL"
                              ? "destructive"
                              : message.priority === "HIGH"
                                ? "destructive"
                                : "secondary"
                          }
                        >
                          {message.priority}
                        </Badge>
                        {message.from === "ADMIN" && message.status === "UNREAD" && (
                          <Badge variant="outline" className="text-blue-600">
                            NEW
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {message.status === "SENT" && <Send className="h-3 w-3" />}
                        {message.status === "READ" && <CheckCircle2 className="h-3 w-3" />}
                        {message.status === "UNREAD" && <Clock className="h-3 w-3" />}
                        {new Date(message.timestamp).toLocaleString()}
                      </div>
                    </div>

                    <h3 className="font-medium mb-2">{message.subject}</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{message.message}</p>

                    {message.from === "ADMIN" && message.status === "UNREAD" && (
                      <div className="mt-3 pt-3 border-t">
                        <Button size="sm" onClick={() => markAsRead(message.id)} className="flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3" />
                          Mark as Read
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </section>
      )}
    </main>
  )
}
