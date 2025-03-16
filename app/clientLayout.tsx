"use client"

import type React from "react"
import { useEffect, useRef } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Store a reference to whether this is the first render
  const isFirstRender = useRef(true)
  
  useEffect(() => {
    // Mark that we're no longer on first render
    isFirstRender.current = false
  }, [])
  
  return (
    <SidebarProvider>
      <AppSidebar>
        {children}
      </AppSidebar>
    </SidebarProvider>
  )
}
