import { NextResponse } from "next/server"
import { addUser, getUserByEmail } from "@/lib/auth-store"

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { name, state, district, email, password } = data || {}

    if (!name || !state || !district || !email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    if (getUserByEmail(String(email))) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const user = addUser({ name, state, district, email, password })
    return NextResponse.json({ id: user.id, email: user.email, role: user.role })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Registration failed" }, { status: 500 })
  }
}
