import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import LoginForm from "@/components/login-form"
import Link from "next/link"

export default function Page() {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Sign in</CardTitle>
          <CardDescription className="text-pretty">
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <p className="mt-4 text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="underline underline-offset-4">
              Register
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
