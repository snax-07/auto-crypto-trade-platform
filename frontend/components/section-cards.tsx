"use client"

import { useState } from "react"



interface userData {
  uid : string,
  email : string,
  subscription : string,
  kyc : string,
  number : string,
  refrealCode : string,
  imageURL : string,
  fullName : string
}
export function SectionCards() {
  const [user , setUser] = useState<userData>();

  

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
            <div className="text-lg font-medium">shr****@gmail.com</div>
          </div>

          <div className="flex gap-20">
              <div className="flex justify-between md:flex-col  md:gap-2">
                <span className="text-muted-foreground">UID</span>
                <span className="font-semibold">34712499</span>
              </div>

              <div className="flex justify-between md:flex-col  md:gap-2">
                <span className="text-muted-foreground">VIP status</span>
                <span className="font-semibold">REGULAR USER</span>
              </div>

              <div className="flex justify-between md:flex-col  md:gap-2">
                <span className="text-muted-foreground">KYC</span>
                <span className="px-3 py-1 rounded-md bg-yellow-600/20 text-yellow-400 text-xs">
                  Unverified
                </span>
              </div>

              <div className="flex justify-between md:flex-col  md:gap-2">
                <span className="text-muted-foreground">email address</span>
                <span>shr****@gmail.com</span>
              </div>

              <div className="flex justify-between md:flex-col  md:gap-2">
                <span className="text-muted-foreground">mobile phone number</span>
                <span className="text-blue-400">Set</span>
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
