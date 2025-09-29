import { NextRequest, NextResponse } from "next/server"

const BACKEND_BASE = "http://localhost:8080/api/reports"

export async function GET(req: NextRequest) {
  try {
    const search = req.nextUrl.searchParams
    const backendUrl = new URL(BACKEND_BASE)

    search.forEach((v, k) => backendUrl.searchParams.set(k, v))

    const res = await fetch(backendUrl.toString(), { cache: "no-store" })
    const text = await res.text()

    let data
    try {
      data = JSON.parse(text)
    } catch {
      data = { raw: text }
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error("API GET Proxy Error:", err)
    return NextResponse.json(
      { error: "Failed to fetch reports", details: (err as Error).message },
      { status: 500 }
    )
  }
}
