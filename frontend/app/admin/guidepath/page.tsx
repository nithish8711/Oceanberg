// File: app/admin/guidepath/page.tsx
"use client"

import ClientNav from "@/components/client-nav" // adjust path if needed
import { AdminSafeRoutes } from "@/components/guidepath/adminsaferoutes"
import { AdminHelplines } from "@/components/guidepath/adminhelplines"
import { AdminMessages } from "@/components/guidepath/adminmessages"
import { AdminSOSAlerts } from "@/components/guidepath/adminsosalerts"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

export default function AdminGuidepathPage() {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Optional: get current location for centering map
  useEffect(() => {
    if (!("geolocation" in navigator)) return
    navigator.geolocation.getCurrentPosition(
      (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setCurrentLocation({ lat: 20.5937, lng: 78.9629 }),
      { enableHighAccuracy: true, timeout: 8000 }
    )
  }, [])

  return (
    <main className="mx-auto w-full max-w-7xl p-4 md:p-6 space-y-6">
      {/* Navigation */}
      <header>
        <ClientNav />
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight mt-4">Guidepath Management</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage Safe Routes, Helplines, Messages, and SOS Alerts from the admin panel
        </p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        {/* Safe Routes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Safe Routes</CardTitle>
            <div className="mt-2">
              <Button
                onClick={() => {
                  navigator.geolocation.getCurrentPosition(
                    (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
                    () => alert("Unable to get location"),
                    { enableHighAccuracy: true }
                  )
                }}
              >
                Set Current Location
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AdminSafeRoutes />
          </CardContent>
        </Card>

        {/* Helplines */}
        <Card>
          <CardHeader><CardTitle>Helplines</CardTitle></CardHeader>
          <CardContent><AdminHelplines /></CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader><CardTitle>Messages</CardTitle></CardHeader>
          <CardContent><AdminMessages /></CardContent>
        </Card>

        {/* SOS Alerts */}
        <Card className="md:col-span-2">
          <CardHeader><CardTitle>SOS Alerts</CardTitle></CardHeader>
          <CardContent><AdminSOSAlerts /></CardContent>
        </Card>
      </section>

      <Separator className="my-4" />
    </main>
  )
}
