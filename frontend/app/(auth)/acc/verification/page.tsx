import { GalleryVerticalEnd } from "lucide-react"

import OTPVerifyForm from "@/components/otpVerification"
import { Suspense } from "react"

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Snax Quantum
        </a>
       <Suspense fallback={<div>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-12 bg-gray-300 rounded w-full"></div>
          </div>
       </div>}>
         <OTPVerifyForm/>
       </Suspense>
      </div>
    </div>
  )
}
