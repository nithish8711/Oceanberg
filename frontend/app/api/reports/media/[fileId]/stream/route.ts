import { NextResponse } from "next/server"

export async function GET(req: Request, { params }: { params: { fileId: string } }) {
  const res = await fetch(`http://localhost:8080/api/reports/media/${params.fileId}/stream`, {
    headers: { Range: req.headers.get("Range") ?? "" },
  })

  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") ?? "application/octet-stream",
      "Content-Range": res.headers.get("Content-Range") ?? "",
      "Accept-Ranges": "bytes",
    },
  })
}
