import type { NextRequest } from "next/server"

const BASE_URL = "http://localhost:8080/api/sos"

// Get all SOS requests
export async function GET() {
  const res = await fetch(BASE_URL, { cache: "no-store" })
  return new Response(await res.text(), { status: res.status })
}

// Create new SOS request
export async function POST(req: NextRequest) {
  const body = await req.text()
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
  return new Response(await res.text(), { status: res.status })
}
