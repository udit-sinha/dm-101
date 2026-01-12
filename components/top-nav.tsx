"use client"

import { useState, useEffect, type ReactNode } from "react"
import { SearchBar } from "@/components/search-bar"
import { Button } from "@/components/ui/button"
import { Bell, User, Search, X, Menu } from "lucide-react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"

interface TopNavProps {
    title?: string
    children?: ReactNode
    showSearch?: boolean
    showHistoryToggle?: boolean
    onHistoryToggle?: () => void
}

export function TopNav({
    title,
    children,
    showSearch = false,
    showHistoryToggle = false,
    onHistoryToggle
}: TopNavProps) {
    const [isSearchExpanded, setIsSearchExpanded] = useState(false)
    const [isMobile, setIsMobile] = useState(false)
    const router = useRouter()

    // Check if mobile on mount and when window resizes
    useEffect(() => {
        const checkIfMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkIfMobile()
        window.addEventListener("resize", checkIfMobile)

        return () => {
            window.removeEventListener("resize", checkIfMobile)
        }
    }, [])

    // Handle keyboard shortcut for search
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault()
                setIsSearchExpanded(true)
            }

            if (e.key === "Escape" && isSearchExpanded) {
                setIsSearchExpanded(false)
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => {
            window.removeEventListener("keydown", handleKeyDown)
        }
    }, [isSearchExpanded])

    const toggleSearch = () => {
        setIsSearchExpanded(!isSearchExpanded)
    }

    return (
        <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 lg:h-[60px]">
            <div className="flex items-center gap-4">
                {/* History Toggle (Burger Menu) */}
                {showHistoryToggle && onHistoryToggle && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={onHistoryToggle}
                        title="Chat history"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                )}

                {!isSearchExpanded && (
                    <>
                        <h1 className="text-lg font-semibold">{title}</h1>
                        {children}
                    </>
                )}
            </div>

            <div
                className={cn(
                    "flex items-center transition-all duration-200 ease-in-out",
                    isSearchExpanded ? "flex-1 justify-center" : "gap-2",
                )}
            >
                {showSearch && (
                    isMobile ? (
                        <>
                            {isSearchExpanded ? (
                                <div className="flex w-full items-center">
                                    <SearchBar expanded={true} onToggleExpand={toggleSearch} className="flex-1" />
                                    <Button variant="ghost" size="icon" className="ml-2" onClick={toggleSearch}>
                                        <X className="h-5 w-5" />
                                    </Button>
                                </div>
                            ) : (
                                <Button variant="ghost" size="icon" onClick={toggleSearch}>
                                    <Search className="h-5 w-5" />
                                </Button>
                            )}
                        </>
                    ) : (
                        <SearchBar
                            expanded={isSearchExpanded}
                            onToggleExpand={toggleSearch}
                            className={isSearchExpanded ? "flex-1 max-w-2xl" : ""}
                        />
                    )
                )}

            </div>
        </div>
    )
}

