import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { fileId: string } }) {
  const res = await fetch(`http://localhost:8080/api/reports/media/${params.fileId}/info`)
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
