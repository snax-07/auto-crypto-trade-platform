"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRef, useState } from "react"
import { toast } from "sonner"
import axios from "axios"
import { useRouter } from "next/navigation"

export function ResetLink({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const email = useRef<HTMLInputElement>(null)
  const [isSending, setIsSending] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    try {
      setIsSending(true)

      if (!email.current?.value) {
        toast.warning("Please enter your email")
        setIsSending(false)
        return
      }

     const response =  await axios.post(
        "http://localhost:8080/api/v1/auth/resetLink",
        { email: email.current.value }
      )
      if(!response.data.ok){
        toast.warning(response.data.message);
        return;
      }

      toast.success("Password reset link sent to your email")

      router.replace("/reset-passwordSend")
    } catch (error: any) {
      setIsSending(false)
      toast.error(error.response?.data?.message || "Something went wrong")
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Reset Your Password</CardTitle>
          <CardDescription>
            Enter your email to receive a reset link
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>

              {/* EMAIL ONLY */}
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="joe@example.com"
                  required
                  ref={email}
                />
              </Field>

              {/* SEND RESET LINK BUTTON */}
              <Field>
                <Button disabled={isSending} type="submit">
                  Send Reset Link
                </Button>
                <FieldDescription className="text-center">
                  Remembered your password? <a href="/login">Go back</a>
                </FieldDescription>
              </Field>

            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
