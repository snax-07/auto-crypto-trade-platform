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
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useRef, useState } from "react"
import { toast } from "sonner"
import axios from "axios"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Ban } from "lucide-react"

export function SignUpForm({
  className,
  ...props
}: React.ComponentProps<"div">) {

  const [isSigning, setIsSigning] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState({
    label: "",
    score: 0,
  })

  const email = useRef<HTMLInputElement>(null)
  const fullname = useRef<HTMLInputElement>(null)
  const password = useRef<HTMLInputElement>(null)

  const router = useRouter()

const checkStrength = (value: string) => {
  if (value.length === 0) {
    setPasswordStrength({ score: 0, label: "" })
    return
  }

  let score = 0

  if (value.length >= 8) score++
  if (value.length >= 12) score++
  if (value.length >= 18) score++

  if (/[a-z]/.test(value)) score++
  if (/[A-Z]/.test(value)) score++
  if (/[0-9]/.test(value)) score++
  if (/[^A-Za-z0-9]/.test(value)) score++

  let label = "Weak"
  if (score >= 5) label = "Strong"
  else if (score >= 3) label = "Medium"

  setPasswordStrength({ score, label })
}


  const handleSubmit = async (e: any) => {
    e.preventDefault()

    try {
      setIsSigning(true)

      if (!email || !password || !fullname) {
        toast.warning("Please fill all fields!")
        setIsSigning(false)
        return
      }

      const res = await axios.post(
        "http://localhost:8080/api/v1/auth/register",
        {
          email: email.current?.value,
          name: fullname.current?.value,
          password: password.current?.value,
        },
        { withCredentials: true }
      )

      if (!res.data.ok) {
        toast.error(res.data.message)
        setIsSigning(false)
        return
      }
      toast.info(res.data.message);
      router.replace(res.data.nextRoute);

    } catch (error: any) {
      setIsSigning(false)
      toast.error(error.response.data.message, {
        action: {
          label: <Ban />,
          onClick: () => toast.dismiss(),
        },
      });

      if(error.response.data.nextRoute != null) router.replace(error.response.data.nextRoute);
    }
  }

  // ---- Strength Bar Colors ----
  const strengthColor = {
    Weak: "bg-red-500",
    Medium: "bg-yellow-500",
    Strong: "bg-green-600",
  }[passwordStrength.label] || "bg-transparent"

  // ---- Bar Width ----
  const strengthWidth = {
    Weak: "w-1/3",
    Medium: "w-2/3",
    Strong: "w-full",
  }[passwordStrength.label] || "w-0"

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>
            Sign up with Google or Apple, or continue with email
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <Button variant="outline" type="button">
                  {/* Apple icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with Apple
                </Button>

                <Button variant="outline" type="button">
                  {/* Google icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <path
                      d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                      fill="currentColor"
                    />
                  </svg>
                  Sign up with Google
                </Button>
              </Field>

              <FieldSeparator className="*:data-[slot=field-separator-content]:bg-card">
                Or continue with
              </FieldSeparator>

              <Field>
                <FieldLabel htmlFor="fullname">Full name</FieldLabel>
                <Input
                  id="fullname"
                  type="text"
                  placeholder="John Doe"
                  required
                  ref={fullname}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  required
                  ref={email}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                  ref={password}
                  onChange={(e) => checkStrength(e.target.value)}
                />

                {/* Strength Bar */}
                <div className="mt-2 h-2 w-full rounded bg-neutral-200">
                  <div
                    className={cn(
                      "h-full rounded transition-all duration-300",
                      strengthColor,
                      strengthWidth
                    )}
                  />
                </div>

                {/* Strength Label */}
                {passwordStrength.label && (
                  <p className="text-sm mt-1 text-muted-foreground">
                    Strength: {passwordStrength.label}
                  </p>
                )}
              </Field>

              <Field>
                <Button disabled={isSigning} type="submit">
                  Sign Up
                </Button>
                <FieldDescription className="text-center">
                  Already have an account? <Link href="/login">Login</Link>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By continuing, you agree to our <a href="#">Terms of Service</a> and{" "}
        <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}
