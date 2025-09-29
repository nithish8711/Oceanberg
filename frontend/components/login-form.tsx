"use client"

import { useState, type FormEvent } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type Role = "user" | "admin" | "analytics"

function roleLaunchPath(role: Role | undefined) {
  switch (role) {
    case "admin": return "/admin/early-warning"
    case "analytics": return "/analytics/early-warning"
    default: return "/user/early-warning"
  }
}

export default function LoginForm({ className }: { className?: string }) {
  const router = useRouter()
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await signIn("credentials", {
        redirect: false,
        userId,          // ✅ FIXED
        password,
      })

      if (res?.ok) {
        const session = await getSession()
        const role = (session?.user as any)?.role as Role | undefined
        router.replace(roleLaunchPath(role))
      } else {
        setError(res?.error || "Invalid credentials")
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
        <Label htmlFor="userId">User ID</Label>
        <Input
          id="userId"
          type="text"
          placeholder="Enter your User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      {error ? <p className="text-sm text-red-500">{error}</p> : null}

      <Button type="submit" disabled={loading}>
        {loading ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}
