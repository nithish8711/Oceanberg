"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { signIn, getSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Role = "user" | "admin" | "analytics"

function roleLaunchPath(role: Role | undefined) {
  switch (role) {
    case "admin":
      return "/admin/early-warning"
    case "analytics":
      return "/analytics/early-warning"
    default:
      return "/user/early-warning"
  }
}

export default function RegisterForm({ className }: { className?: string }) {
  const router = useRouter()
  const [name, setName] = useState("")
  const [userId, setUserId] = useState("") // ✅ new field
  const [state, setState] = useState("")
  const [district, setDistrict] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, userId, state, district, email, password }), // ✅ include userId
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || "Registration failed")
      }

      // ✅ auto login with userId instead of email
      const loginRes = await signIn("credentials", { redirect: false, userId, password })
      if (loginRes?.ok) {
        const session = await getSession()
        const role = (session?.user as any)?.role as Role | undefined
        router.replace(roleLaunchPath(role))
      } else {
        throw new Error(loginRes?.error || "Login failed after registration")
      }
    } catch (err: any) {
      setError(err?.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("grid gap-4", className)}>
      <div className="grid gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="userId">User ID</Label>
        <Input
          id="userId"
          placeholder="Choose a unique username"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="state">State</Label>
        <Input id="state" value={state} onChange={(e) => setState(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="district">District</Label>
        <Input id="district" value={district} onChange={(e) => setDistrict(e.target.value)} required />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" disabled={loading}>
        {loading ? "Creating account..." : "Create account"}
      </Button>
    </form>
  )
}
