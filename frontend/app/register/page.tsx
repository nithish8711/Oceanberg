import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RegisterForm from "@/components/register-form"

export default function Page() {
  return (
    <div className="mx-auto max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-balance">Create your account</CardTitle>
          <CardDescription className="text-pretty">
            Register to access your dashboard. New accounts start with the User role.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegisterForm />
          <p className="mt-4 text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
