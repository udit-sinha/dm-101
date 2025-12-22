"use client"

import { createContext, useState, useContext, useRef, useEffect, useCallback, useMemo, useLayoutEffect, type ReactNode, forwardRef } from "react"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

type SidebarContextType = {
  open: boolean
  onOpenChange: (open: boolean) => void
  toggleSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType>({
  open: false,
  onOpenChange: () => {},
  toggleSidebar: () => {},
})

type SidebarProviderProps = {
  children: ReactNode
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function SidebarProvider({
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange: controlledOnOpenChange,
}: SidebarProviderProps) {
  // Create a ref to prevent the flickering during initial hydration
  const initialRender = useRef(true)
  
  // Initialize state from defaultOpen
  const [isOpen, setIsOpen] = useState(defaultOpen)
  
  // Handle state persistence to localStorage, but only after initial hydration
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Get stored value on client-side only
      if (initialRender.current) {
        const stored = localStorage.getItem("sidebarOpen")
        if (stored !== null) {
          setIsOpen(stored === "true")
        }
        initialRender.current = false
      } else {
        // Only save to localStorage after first render
        localStorage.setItem("sidebarOpen", String(isOpen))
      }
    }
  }, [isOpen])

  // Toggle handler
  const toggleSidebar = useCallback(() => {
    setIsOpen(prev => !prev)
  }, [])

  const value = useMemo(() => ({
    open: isOpen,
    onOpenChange: setIsOpen,
    toggleSidebar,
  }), [isOpen, toggleSidebar])

  return <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
}

export const useSidebar = () => useContext(SidebarContext)

type SidebarProps = {
  children: ReactNode
  className?: string
  collapsible?: "icon" | "none"
}

export function Sidebar({ children, className, collapsible }: SidebarProps) {
  const { open } = useSidebar()
  // Use a ref to prevent layout shifts during navigation
  const sidebarRef = useRef<HTMLElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)

  // Prevent layout animations when navigating between pages
  useEffect(() => {
    const sidebar = sidebarRef.current
    if (!sidebar) return

    // This effect runs only once on mount
    // Setting the transition to none initially, then enabling it after a timeout
    // This prevents the width animation on first render which can cause flickering
    sidebar.style.transition = "none"

    // Enable transitions after a small delay to avoid first-render animations
    const transitionTimeout = setTimeout(() => {
      if (sidebar) sidebar.style.transition = "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    }, 100)

    return () => {
      clearTimeout(transitionTimeout)
    }
  }, [])

  return (
    <aside
      ref={sidebarRef}
      className={cn(
        "group relative flex h-full min-h-screen flex-col border-r shadow-md overflow-hidden",
        open ? "w-64" : "w-16",
        className,
      )}
      data-sidebar="root"
      data-state={open ? "open" : "closed"}
      style={{ transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
    >
      {children}
    </aside>
  )
}

type SidebarInsetProps = {
  children: ReactNode
  className?: string
}

export function SidebarInset({ children, className }: SidebarInsetProps) {
  return (
    <div className={cn("flex flex-1 flex-col overflow-hidden", className)} data-sidebar="inset">
      {children}
    </div>
  )
}

type SidebarHeaderProps = {
  children: ReactNode
  className?: string
}

export function SidebarHeader({ children, className }: SidebarHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between py-3 px-4", className)} data-sidebar="header">
      {children}
    </div>
  )
}

type SidebarContentProps = {
  children: ReactNode
  className?: string
}

export function SidebarContent({ children, className }: SidebarContentProps) {
  return (
    <div className={cn("flex-1 overflow-y-auto py-2 px-4", className)} data-sidebar="content">
      {children}
    </div>
  )
}

type SidebarFooterProps = {
  children: ReactNode
  className?: string
}

export function SidebarFooter({ children, className }: SidebarFooterProps) {
  return (
    <div className={cn("flex items-center justify-between py-3 px-4", className)} data-sidebar="footer">
      {children}
    </div>
  )
}

type SidebarMenuProps = {
  children: ReactNode
  className?: string
}

export function SidebarMenu({ children, className }: SidebarMenuProps) {
  return (
    <ul className={cn("space-y-1", className)} data-sidebar="menu">
      {children}
    </ul>
  )
}

type SidebarMenuItemProps = {
  children: ReactNode
  className?: string
}

export function SidebarMenuItem({ children, className }: SidebarMenuItemProps) {
  return (
    <li className={className} data-sidebar="menu-item">
      {children}
    </li>
  )
}

type SidebarMenuButtonProps = {
  children: ReactNode
  className?: string
  tooltip?: string
  onClick?: () => void
  asChild?: boolean
}

export const SidebarMenuButton = forwardRef<HTMLButtonElement, SidebarMenuButtonProps>(
  ({ children, className, tooltip, onClick, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "group relative flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
          className,
        )}
        onClick={onClick}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

type SidebarLabelProps = {
  children: ReactNode
  className?: string
}

export function SidebarLabel({ children, className }: SidebarLabelProps) {
  const { open } = useSidebar()
  return (
    <span
      className={cn(
        "whitespace-nowrap transition-all duration-300 ease-in-out",
        open
          ? "opacity-100 translate-x-0 w-auto"
          : "opacity-0 -translate-x-2 w-0 overflow-hidden",
        className,
      )}
    >
      {children}
    </span>
  )
}

type SidebarMenuSubProps = {
  children: ReactNode
  className?: string
}

export function SidebarMenuSub({ children, className }: SidebarMenuSubProps) {
  return (
    <ul className={cn("space-y-1 pl-4", className)} data-sidebar="menu-sub">
      {children}
    </ul>
  )
}

type SidebarMenuSubItemProps = {
  children: ReactNode
  className?: string
}

export function SidebarMenuSubItem({ children, className }: SidebarMenuSubItemProps) {
  return (
    <li className={className} data-sidebar="menu-sub-item">
      {children}
    </li>
  )
}

type SidebarMenuSubButtonProps = {
  children: ReactNode
  className?: string
  onClick?: () => void
  isActive?: boolean
}

export function SidebarMenuSubButton({ children, className, onClick, isActive }: SidebarMenuSubButtonProps) {
  return (
    <button
      className={cn(
        "group relative flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors focus:outline-none disabled:pointer-events-none disabled:opacity-50",
        isActive && "bg-gray-800",
        className,
      )}
      onClick={onClick}
      data-sidebar="menu-sub-button"
      data-active={isActive}
    >
      {children}
    </button>
  )
}
