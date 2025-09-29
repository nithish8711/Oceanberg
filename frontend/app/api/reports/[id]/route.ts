import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const formData = await req.formData()
  const res = await fetch(`http://localhost:8080/api/reports/${params.id}`, {
    method: "PUT",
    body: formData,
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const res = await fetch(`http://localhost:8080/api/reports/${params.id}`, {
    method: "DELETE",
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
