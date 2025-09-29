"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { useState, useCallback } from "react"
import { CheckCircle2, Circle, Star } from "lucide-react"

type MediaItem = { type: "image" | "video"; url: string }

interface ReportCardProps {
  report: any
  showVerifiedBadge?: boolean // optional flag to show verified badge like admin page
}

export function ReportCard({ report, showVerifiedBadge = false }: ReportCardProps) {
  const observed = new Date(report.observedAt)
  const submitted = new Date(report.submittedAt)

  const media: MediaItem[] =
    (report.media as MediaItem[] | undefined) ??
    (Array.isArray(report.mediaFileIds)
      ? report.mediaFileIds.map((id: string) => ({
          type: "image",
          url: `/placeholder.svg?height=480&width=960&query=report media ${id}`,
        }))
      : [])

  const [mediaIndex, setMediaIndex] = useState(0)
  const active = media[mediaIndex]
  const hasMultiple = media.length > 1
  const goPrev = useCallback(() => setMediaIndex(i => (i - 1 + media.length) % media.length), [media.length])
  const goNext = useCallback(() => setMediaIndex(i => (i + 1) % media.length), [media.length])

  const who = report.source === "ADMIN" ? "Official" : "User"
  const verified = !!report.verified
  const highlighted = !!report.highlighted

  return (
    <Card role="article" aria-label={`${report.type} report`}>
      <CardHeader className="pb-2 flex justify-between items-center">
        <CardTitle className="flex items-center gap-2 text-base">
          {report.type}
          {showVerifiedBadge && verified && (
            <span className="flex items-center gap-1 text-green-600">
              <CheckCircle2 className="h-4 w-4" /> Verified
            </span>
          )}
          {!verified && showVerifiedBadge && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Circle className="h-4 w-4" /> Unverified
            </span>
          )}
          {highlighted && (
            <span className="ml-2 inline-flex items-center gap-1 rounded-md bg-yellow-100 px-2 py-0.5 text-[11px] font-medium text-yellow-800">
              <Star className="h-3 w-3" /> Highlighted
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {active && (
          <div
            className="relative w-full h-64 md:h-80 overflow-hidden rounded-md border"
            role="region"
            aria-roledescription="carousel"
            aria-label="Report media carousel"
            tabIndex={0}
            onKeyDown={e => {
              if (e.key === "ArrowLeft") goPrev()
              if (e.key === "ArrowRight") goNext()
            }}
          >
            {active.type === "video" ? (
              <video
                className="h-full w-full object-cover"
                controls
                playsInline
                preload="metadata"
                aria-label="Report video"
                src={active.url}
              />
            ) : (
              <Image
                src={active.url || "/placeholder.svg"}
                alt="Report image"
                fill
                sizes="(max-width: 768px) 100vw, 700px"
                className="object-cover"
                priority
              />
            )}

            {hasMultiple && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous media"
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full border bg-background/70 px-2 py-2 text-foreground shadow backdrop-blur-sm hover:bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {"‹"}
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next media"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-background/70 px-2 py-2 text-foreground shadow backdrop-blur-sm hover:bg-background focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {"›"}
                </button>
                <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-background/70 px-2 py-1 text-xs text-foreground shadow">
                  {mediaIndex + 1} / {media.length}
                </div>
              </>
            )}
          </div>
        )}

        <div className="text-sm text-muted-foreground">
          <div>{report.district && report.state ? `${report.district}, ${report.state}` : report.state || report.district || "Location"}</div>
          <div>by {who} • Observed {observed.toLocaleString()} • Submitted {submitted.toLocaleString()}</div>
          {report?.location?.lat != null && report?.location?.lng != null && (
            <div className="text-xs">{`Lat ${Number(report.location.lat).toFixed(4)}, Lng ${Number(report.location.lng).toFixed(4)}`}</div>
          )}
        </div>

        {report.description && <p className="text-sm leading-relaxed text-foreground">{report.description}</p>}
      </CardContent>
    </Card>
  )
}
