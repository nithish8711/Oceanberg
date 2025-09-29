export async function GET(req: Request, { params }: { params: { fileId: string } }) {
  const res = await fetch(`http://localhost:8080/api/reports/media/${params.fileId}/download`)

  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Disposition": res.headers.get("Content-Disposition") ?? "attachment",
      "Content-Type": res.headers.get("Content-Type") ?? "application/octet-stream",
    },
  })
}
