"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertTriangle,
  TrendingUp,
  MapPin,
  Clock,
  Send,
  Archive,
  Eye,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Forward,
} from "lucide-react"

type AnalyticsMessage = {
  id: string
  type: "impact_assessment" | "hotspot_alert" | "recommendation"
  title: string
  content: string
  priority: "high" | "medium" | "low"
  area: string
  timestamp: string
  read: boolean
  forwarded: boolean
  data?: {
    threatLevel?: string
    reportCount?: number
    socialMediaPosts?: number
    needs?: string[]
  }
}

// Mock data for analytics messages
const mockMessages: AnalyticsMessage[] = [
  {
    id: "1",
    type: "hotspot_alert",
    title: "Critical Hotspot Alert - T. Nagar Area",
    content:
      "High concentration of emergency reports detected in T. Nagar area. Immediate attention required for rescue operations.",
    priority: "high",
    area: "T. Nagar",
    timestamp: "2024-01-15T10:30:00Z",
    read: false,
    forwarded: false,
    data: {
      threatLevel: "Critical",
      reportCount: 45,
      socialMediaPosts: 128,
      needs: ["Rescue", "Medical Help", "Evacuation"],
    },
  },
  {
    id: "2",
    type: "impact_assessment",
    title: "Impact Assessment - Mylapore District",
    content:
      "Moderate impact detected in Mylapore area with increasing shelter and food requirements. Recommend resource allocation.",
    priority: "medium",
    area: "Mylapore",
    timestamp: "2024-01-15T09:15:00Z",
    read: true,
    forwarded: false,
    data: {
      threatLevel: "Moderate",
      reportCount: 23,
      socialMediaPosts: 67,
      needs: ["Shelter", "Food", "Water"],
    },
  },
  {
    id: "3",
    type: "recommendation",
    title: "Resource Deployment Recommendation",
    content:
      "Analytics suggest deploying additional medical teams to Egmore and Nungambakkam areas based on trending needs.",
    priority: "medium",
    area: "Egmore, Nungambakkam",
    timestamp: "2024-01-15T08:45:00Z",
    read: true,
    forwarded: true,
    data: {
      threatLevel: "Moderate",
      reportCount: 31,
      socialMediaPosts: 89,
      needs: ["Medical Help", "Transportation", "Communication"],
    },
  },
  {
    id: "4",
    type: "hotspot_alert",
    title: "Emerging Hotspot - Triplicane",
    content: "New hotspot emerging in Triplicane area. Early intervention recommended to prevent escalation.",
    priority: "high",
    area: "Triplicane",
    timestamp: "2024-01-15T07:20:00Z",
    read: false,
    forwarded: false,
    data: {
      threatLevel: "High",
      reportCount: 18,
      socialMediaPosts: 42,
      needs: ["Evacuation", "Shelter", "Clean-up & Disinfection"],
    },
  },
]

export default function AdminInboxPage() {
  const [messages, setMessages] = useState<AnalyticsMessage[]>(mockMessages)
  const [selectedMessage, setSelectedMessage] = useState<AnalyticsMessage | null>(null)
  const [filter, setFilter] = useState<"all" | "unread" | "high_priority">("all")
  const [isLoading, setIsLoading] = useState(false)

  const filteredMessages = messages.filter((msg) => {
    if (filter === "unread") return !msg.read
    if (filter === "high_priority") return msg.priority === "high"
    return true
  })

  const unreadCount = messages.filter((msg) => !msg.read).length
  const highPriorityCount = messages.filter((msg) => msg.priority === "high").length

  const markAsRead = (id: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, read: true } : msg)))
  }

  const forwardAsAlert = (id: string) => {
    setMessages((prev) => prev.map((msg) => (msg.id === id ? { ...msg, forwarded: true } : msg)))
    // Here you would typically call an API to forward the message
    alert("Message forwarded as official alert!")
  }

  const archiveMessage = (id: string) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== id))
  }

  const refreshMessages = () => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50"
      case "medium":
        return "text-orange-600 bg-orange-50"
      case "low":
        return "text-green-600 bg-green-50"
      default:
        return "text-gray-600 bg-gray-50"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "hotspot_alert":
        return <AlertTriangle className="h-4 w-4" />
      case "impact_assessment":
        return <TrendingUp className="h-4 w-4" />
      case "recommendation":
        return <MapPin className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  return (
    <main className="mx-auto w-full max-w-7xl p-4 md:p-6 space-y-6">
      <header className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Admin Inbox & Analytics Updates</h1>
            <p className="text-muted-foreground">Receive and manage insights from the Analytics Team</p>
          </div>
          <Button onClick={refreshMessages} disabled={isLoading} size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Unread Messages</p>
                  <p className="text-2xl font-bold">{unreadCount}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                  <p className="text-2xl font-bold">{highPriorityCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Messages</p>
                  <p className="text-2xl font-bold">{messages.length}</p>
                </div>
                <Send className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All Messages
          </Button>
          <Button variant={filter === "unread" ? "default" : "outline"} size="sm" onClick={() => setFilter("unread")}>
            Unread ({unreadCount})
          </Button>
          <Button
            variant={filter === "high_priority" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("high_priority")}
          >
            High Priority ({highPriorityCount})
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Messages List */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Messages</h2>
          {filteredMessages.map((message) => (
            <Card
              key={message.id}
              className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                !message.read ? "border-l-4 border-l-blue-500" : ""
              } ${selectedMessage?.id === message.id ? "ring-2 ring-primary" : ""}`}
              onClick={() => {
                setSelectedMessage(message)
                if (!message.read) markAsRead(message.id)
              }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getTypeIcon(message.type)}
                    <CardTitle className="text-sm font-medium">{message.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(message.priority)}>{message.priority}</Badge>
                    {message.forwarded && (
                      <Badge variant="secondary">
                        <Forward className="h-3 w-3 mr-1" />
                        Forwarded
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground mb-2">{message.content}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {message.area}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(message.timestamp).toLocaleString()}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredMessages.length === 0 && (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No messages found for the selected filter.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Message Details */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Message Details</h2>
          {selectedMessage ? (
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {getTypeIcon(selectedMessage.type)}
                      {selectedMessage.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedMessage.area} • {new Date(selectedMessage.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={getPriorityColor(selectedMessage.priority)}>{selectedMessage.priority}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Content</h4>
                  <p className="text-sm">{selectedMessage.content}</p>
                </div>

                {selectedMessage.data && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Threat Level</h4>
                        <Badge
                          variant={
                            selectedMessage.data.threatLevel === "Critical"
                              ? "destructive"
                              : selectedMessage.data.threatLevel === "High"
                                ? "secondary"
                                : "outline"
                          }
                        >
                          {selectedMessage.data.threatLevel}
                        </Badge>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Reports</h4>
                        <p className="text-sm">{selectedMessage.data.reportCount} reports</p>
                        <p className="text-xs text-muted-foreground">
                          {selectedMessage.data.socialMediaPosts} social media posts
                        </p>
                      </div>
                    </div>

                    {selectedMessage.data.needs && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">Current Needs</h4>
                          <div className="flex flex-wrap gap-2">
                            {selectedMessage.data.needs.map((need) => (
                              <Badge key={need} variant="outline">
                                {need}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </>
                )}

                <Separator />
                <div className="flex gap-2">
                  <Button
                    onClick={() => forwardAsAlert(selectedMessage.id)}
                    disabled={selectedMessage.forwarded}
                    className="flex-1"
                  >
                    <Forward className="mr-2 h-4 w-4" />
                    {selectedMessage.forwarded ? "Already Forwarded" : "Forward as Alert"}
                  </Button>
                  <Button variant="outline" onClick={() => archiveMessage(selectedMessage.id)}>
                    <Archive className="mr-2 h-4 w-4" />
                    Archive
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Select a message to view details
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Communication Log */}
      <Card>
        <CardHeader>
          <CardTitle>Internal Communication Log</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {messages
              .filter((msg) => msg.forwarded)
              .map((msg) => (
                <div key={msg.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{msg.title}</p>
                    <p className="text-xs text-muted-foreground">Forwarded as official alert • {msg.area}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}

            {messages.filter((msg) => msg.forwarded).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No messages have been forwarded yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
