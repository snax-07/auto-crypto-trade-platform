import { GalleryVerticalEnd } from "lucide-react"


import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"


export default function Page() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Snax Quantum
        </a>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Check Your Email</CardTitle>
          <CardDescription>
            A password reset link has been sent to your email address.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center gap-4">
          <p className="text-center text-sm text-muted-foreground">
            If you don’t see the email, check your spam or try again.
          </p>

          <Link href="/login" className="w-full">
            <Button className="w-full">Back to Login</Button>
          </Link>
        </CardContent>
      </Card>


      </div>
    </div>
  )
}
