"use client"
import { useRef, useState } from "react"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { FieldGroup, Field, FieldLabel, FieldDescription } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useSearchParams, useRouter, useParams } from "next/navigation"
import axios from "axios"
import { toast } from "sonner"
import { GalleryVerticalEnd } from "lucide-react"



export default function LoginPage() {

   const password = useRef<HTMLInputElement>(null)
  const confirmPassword = useRef<HTMLInputElement>(null)

  const [isLoading, setIsLoading] = useState(false)

  const para = useParams()
  const router = useRouter()
  const token = para.token
  console.log(token)

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)

    const pass = password.current?.value
    const confirm = confirmPassword.current?.value

    if (pass !== confirm) {
      toast.error("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const res = await axios.post("http://localhost:8080/api/v1/auth/reset-password", {
        token,
        newPassword: pass
      })

      toast.success(res.data.message)
      router.replace("/login")
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Snax Quantum
        </a>




      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel>New Password</FieldLabel>
                <Input ref={password} type="password" required />
              </Field>

              <Field>
                <FieldLabel>Confirm Password</FieldLabel>
                <Input ref={confirmPassword} type="password" required />
              </Field>

              <Field>
                <Button disabled={isLoading} type="submit">
                  Reset Password
                </Button>
                <FieldDescription className="text-center">
                  Go back to <a href="/login">Login</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      </div>
    </div>
  )
}
