import { NextRequest, NextResponse } from "next/server"

export const runtime = "node" // force Node runtime

const BACKEND_BASE = "http://localhost:8080/api/reports/submit"

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || ""
    let backendRes

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData()
      backendRes = await fetch("http://localhost:8080/api/reports/submit", {
        method: "POST",
        body: formData, // Node fetch handles this correctly
      })
    } else {
      const jsonBody = await req.json()
      backendRes = await fetch("http://localhost:8080/api/reports/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonBody),
      })
    }

    const text = await backendRes.text()
    let data
    try { data = JSON.parse(text) } catch { data = { raw: text } }

    return NextResponse.json(data, { status: backendRes.status })
  } catch (err) {
    console.error("Proxy Error:", err)
    return NextResponse.json({ error: "Failed to submit report", details: (err as Error).message }, { status: 500 })
  }
}
