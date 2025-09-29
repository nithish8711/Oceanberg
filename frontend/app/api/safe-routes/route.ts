import type { NextRequest } from "next/server"

const BASE_URL = "http://localhost:8080/api/safe-routes"

// Get all safe routes
export async function GET() {
  const res = await fetch(BASE_URL, { cache: "no-store" })
  return new Response(await res.text(), { status: res.status })
}

// Create a new safe route
export async function POST(req: NextRequest) {
  const body = await req.text()
  const res = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })
  return new Response(await res.text(), { status: res.status })
}
