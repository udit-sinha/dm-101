"use client"
import { Settings, FolderTree, Home, PanelLeft, BarChart3, Database, Layout, FolderOpen, Bot } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
  SidebarLabel,
  useSidebar,
} from "@/components/ui/sidebar"
import { useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"
import { TopNav } from "@/components/top-nav"
import type { ReactNode } from "react"

interface AppSidebarProps {
  children: ReactNode
}

export function AppSidebar({ children }: AppSidebarProps) {
  const { toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const router = useRouter()
  
  // Preserve sidebar state across navigation without any fade effects
  const handleNavigation = useCallback((path: string) => {
    if (path === pathname) return
    
  // Use replace instead of push to avoid adding navigation history entries
  // which may contribute to flickering by having multiple concurrent history states
  router.replace(path, { scroll: false })
  }, [router, pathname])

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}`)
  }

  // By using a key based on pathname, we ensure the sidebar content updates correctly
  // without creating duplicate instances during navigation
  return (
    <div className="flex h-screen w-full overflow-hidden" key="app-sidebar-wrapper">
      <Sidebar className="border-r border-gray-800 bg-black" key="main-sidebar">
        <SidebarHeader className="border-b border-gray-800 p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="gap-3 font-medium text-white hover:bg-gray-800 hover:text-white"
                onClick={() => handleNavigation("/")}
              >
                <FolderTree className="h-5 w-5 text-white flex-shrink-0" />
                <SidebarLabel className="text-white">Data Explorer</SidebarLabel>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`hover:bg-gray-800 group ${isActive("/") && pathname === "/" ? "bg-gray-800" : ""}`}
                onClick={() => handleNavigation("/")}
              >
                <Home className="h-5 w-5 text-white flex-shrink-0" />
                <SidebarLabel className="text-white">Home</SidebarLabel>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`hover:bg-gray-800 group ${isActive("/search") ? "bg-gray-800" : ""}`}
                onClick={() => handleNavigation("/search")}
              >
                <Bot className="h-6 w-6 text-white flex-shrink-0" />
                <SidebarLabel className="text-white">Search</SidebarLabel>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`hover:bg-gray-800 group ${isActive("/dashboards") ? "bg-gray-800" : ""}`}
                onClick={() => handleNavigation("/dashboards")}
              >
                <BarChart3 className="h-5 w-5 text-white flex-shrink-0" />
                <SidebarLabel className="text-white">Dashboards</SidebarLabel>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`hover:bg-gray-800 group ${isActive("/data-collections") ? "bg-gray-800" : ""}`}
                onClick={() => handleNavigation("/data-collections")}
              >
                <Database className="h-5 w-5 text-white flex-shrink-0" />
                <SidebarLabel className="text-white">Data Collections</SidebarLabel>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`hover:bg-gray-800 group ${isActive("/apps") ? "bg-gray-800" : ""}`}
                onClick={() => handleNavigation("/apps")}
              >
                <Layout className="h-5 w-5 text-white flex-shrink-0" />
                <SidebarLabel className="text-white">Apps</SidebarLabel>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`hover:bg-gray-800 group ${isActive("/file-explorer") ? "bg-gray-800" : ""}`}
                onClick={() => handleNavigation("/file-explorer")}
              >
                <FolderOpen className="h-5 w-5 text-white flex-shrink-0" />
                <SidebarLabel className="text-white">File Explorer</SidebarLabel>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t border-gray-800 p-2 mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={toggleSidebar} className="hover:bg-gray-800 hover:text-white">
                <PanelLeft className="h-5 w-5 text-white flex-shrink-0" />
                <SidebarLabel className="text-white">Toggle Sidebar</SidebarLabel>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`hover:bg-gray-800 hover:text-white ${isActive("/settings") ? "bg-gray-800" : ""}`}
                onClick={() => handleNavigation("/settings")}
              >
                <Settings className="h-5 w-5 text-white flex-shrink-0" />
                <SidebarLabel className="text-white">Settings</SidebarLabel>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col overflow-hidden">
        {children}
      </SidebarInset>
    </div>
  )
}
