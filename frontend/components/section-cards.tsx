"use client"

import { useAuth, UserIn } from "@/hooks/useAuth";
import { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRightIcon, Loader2, WholeWordIcon } from "lucide-react";
import { Input } from "./ui/input";
import { toast } from "sonner";
import axios from "axios";
export function SectionCards() {
  // const [user , setUser] = useState<userData>();

  const {user , setUser} = useAuth()
  const referralCode = useRef<HTMLInputElement>(null);
  const [isUpdating , setIsUpdating] = useState(false);
  const [isOpen , setIsOpen] = useState(false)

  const handleSubmit = async () => {
    try {
      if(!referralCode?.current?.value) return false;
      setIsUpdating(true);
      const response = await axios.post("http://localhost:8080/api/auth/referral", {referralCode : referralCode?.current?.value} , {withCredentials : true});
      setUser((prev) =>{
        if (!prev) return prev;
        return {
          ...prev,
          referralCode : referralCode?.current?.value
        }
      });
      setIsOpen(false);
      setIsUpdating(false);
      toast.success("Referral Code Updated !!!")
    } catch (error : any) {
      toast.error(error.response.data.message)
    }
  }

  return (
    <div className="w-full p-4">

      <div className="
        bg-card rounded-xl shadow-md p-4
        flex flex-col gap-4
        md:flex-row md:items-start md:gap-8
      ">


        <div className="
          w-20 h-20 rounded-full bg-gray-300
          mx-auto md:mx-0
          md:w-28 md:h-28
          flex-shrink-0
        ">
        </div>

        <div className="flex-1 w-full space-y-4">


          <div>
            <div className="text-sm text-muted-foreground">Username</div>
            <div className="text-lg font-medium">{user?.name.split(" ")[0]} </div>
          </div>

          <div className="flex gap-20">
              <div className="flex justify-between md:flex-col  md:gap-2">
                <span className="text-muted-foreground">UID</span>
                <span className="font-semibold">34712499</span>
              </div>

              <div className="flex justify-between md:flex-col  md:gap-2">
                <span className="text-muted-foreground">VIP status</span>
                <span className="font-semibold">{user?.subscription} USER</span>
              </div>

              <div className="flex justify-between md:flex-col  md:gap-2">
                <span className="text-muted-foreground">KYC</span>
                <span className="px-3 py-1 rounded-md bg-yellow-600/20 text-yellow-400 text-xs">
                  {user?.isPanVerified ? "Verified" : "Unverified"}
                </span>
              </div>

              <div className="flex justify-between md:flex-col  md:gap-2">
                <span className="text-muted-foreground">email address</span>
                <span>{user?.email}</span>
              </div>

              <div className="flex justify-between md:flex-col  md:gap-2">
                <span className="text-muted-foreground">Referral Code</span>
              <span>{user?.referralCode ? user?.referralCode : <button className="flex" onClick={() => setIsOpen(true)}>Set <ChevronRightIcon /> </button>}</span>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl">Fill the Referral</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-background-muted">Once the referral code is bound, it cannot be changed again. Please make sure that the referral code you enter is correct.</p>
          <Input type="text" placeholder="eg.. snax10" ref={referralCode} />
          <Button variant={"outline"}className="w-full" disabled={isUpdating} onClick={handleSubmit}>Update {isUpdating ? <Loader2 /> : <ChevronRightIcon /> }</Button>
        </div>
      </DialogContent>
    </Dialog>
              </div>

              <div className="flex justify-between md:flex-col  md:gap-2">
                <span className="text-muted-foreground">Referral code : </span>
                <span className="text-blue-400">Set</span>
              </div>

            </div>
        </div>

      </div>
    </div>
  )
}
