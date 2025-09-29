import type { NextRequest } from "next/server"

const BASE_URL = "http://localhost:8080/api/safe-routes"

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const res = await fetch(`${BASE_URL}/${params.id}`, { cache: "no-store" })
  return new Response(await res.text(), { status: res.status })
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.text()
  const res = await fetch(`${BASE_URL}/${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body,
  })
  return new Response(await res.text(), { status: res.status })
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const res = await fetch(`${BASE_URL}/${params.id}`, { method: "DELETE" })
  return new Response(null, { status: res.status })
}
