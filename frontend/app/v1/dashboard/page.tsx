"use client"

import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {Dash} from "@/components/dashBoard"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import { JSX, useState } from "react"
import { Security } from "@/components/security"


export default function Page() {


  const [activeTab , setActiveTab] = useState("dashboard")
  console.log(activeTab)
   const tabContentMap: Record<string, JSX.Element> = {
    dashboard: <Dash />,
    security: <Security />
  }
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        variant="inset"
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">

            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              {tabContentMap[activeTab]}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
