"use client"
import { Settings, FolderTree, Home, PanelLeft, BarChart3, Database, Layout, FolderOpen, Search } from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarInset,
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
  const { toggleSidebar, open } = useSidebar()
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
                <FolderTree className="h-5 w-5 text-white" />
                {open && <span className="text-white">Data Explorer</span>}
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
                <Home className="h-5 w-5 text-white" />
                {open && <span className="text-white">Home</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`hover:bg-gray-800 group ${isActive("/search") ? "bg-gray-800" : ""}`}
                onClick={() => handleNavigation("/search")}
              >
                <Search className="h-5 w-5 text-white" />
                {open && <span className="text-white">Search</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`hover:bg-gray-800 group ${isActive("/dashboards") ? "bg-gray-800" : ""}`}
                onClick={() => handleNavigation("/dashboards")}
              >
                <BarChart3 className="h-5 w-5 text-white" />
                {open && <span className="text-white">Dashboards</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`hover:bg-gray-800 group ${isActive("/data-collections") ? "bg-gray-800" : ""}`}
                onClick={() => handleNavigation("/data-collections")}
              >
                <Database className="h-5 w-5 text-white" />
                {open && <span className="text-white">Data Collections</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`hover:bg-gray-800 group ${isActive("/apps") ? "bg-gray-800" : ""}`}
                onClick={() => handleNavigation("/apps")}
              >
                <Layout className="h-5 w-5 text-white" />
                {open && <span className="text-white">Apps</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`hover:bg-gray-800 group ${isActive("/file-explorer") ? "bg-gray-800" : ""}`}
                onClick={() => handleNavigation("/file-explorer")}
              >
                <FolderOpen className="h-5 w-5 text-white" />
                {open && <span className="text-white">File Explorer</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="border-t border-gray-800 p-2 mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={toggleSidebar} className="hover:bg-gray-800 hover:text-white">
                <PanelLeft className="h-5 w-5 text-white" />
                {open && <span className="text-white">Toggle Sidebar</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                className={`hover:bg-gray-800 hover:text-white ${isActive("/settings") ? "bg-gray-800" : ""}`}
                onClick={() => handleNavigation("/settings")}
              >
                <Settings className="h-5 w-5 text-white" />
                {open && <span className="text-white">Settings</span>}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </SidebarInset>
    </div>
  )
}
