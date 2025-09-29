import { NextResponse } from "next/server"

// DELETE /api/reports/all?source=user
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url)
  const source = searchParams.get("source")

  const res = await fetch(`http://localhost:8080/api/reports/all?source=${source ?? ""}`, {
    method: "DELETE",
  })

  const data = await res.text()
  return NextResponse.json({ message: data }, { status: res.status })
}
