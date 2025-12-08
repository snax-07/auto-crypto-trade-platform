"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import axios from "axios"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

export default function OTPVerifyForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const inputRefs = useRef<Array<HTMLInputElement | null>>([])
  const [shake, setShake] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = (value: string, index: number) => {
    if (!/^[0-9]?$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    // Auto-move to next
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when 6 digits complete
    if (newOtp.every((digit) => digit !== "")) {
      verifyOtp(newOtp.join(""))
    }
  }

  const handleKeyDown = (e: any, index: number) => {
    // Backspace → move previous
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const verifyOtp = async (finalOtp: string) => {
    try {
      setLoading(true)

      const response = await axios.post(
        "http://localhost:8080/api/v1/auth/digi-verify",
        {
          email,
          otp: finalOtp,
        },
        { withCredentials: true }
      )

      if (!response.data.ok) {
        // Shake animation
        setShake(true)

        setTimeout(() => {
          setShake(false)
        }, 400)

        // Clear all fields
        setOtp(["", "", "", "", "", ""])
        inputRefs.current[0]?.focus()

        toast.error("Invalid OTP")
        setLoading(false)
        return
      }

      toast.success("Account verified!")
      router.replace("/v1/dashboard")

    } catch (err: any) {
      toast.error(err.response.data.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      <h2 className="text-xl font-semibold">Verify your account</h2>
      <p className="text-muted-foreground text-center">
        Enter the 6-digit code sent to <b>{email}</b>.
      </p>

      <div
        className={cn(
          "flex gap-3 transition-all",
          shake && "animate-shake"
        )}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el
            }}
            value={digit}
            maxLength={1}
            onChange={(e) => handleChange(e.target.value, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="w-12 h-12 text-center text-xl font-semibold border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          />
        ))}
      </div>

      <Button disabled={loading || otp.some((d) => d === "")}
        onClick={() => verifyOtp(otp.join(""))}
      >
        Verify
      </Button>
    </div>
  )
}
