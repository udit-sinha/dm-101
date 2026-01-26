"use client"

import type React from "react"

import { useState } from "react"
import { Plus, Send, Wand2, MapIcon, Upload, Files, Zap, Sparkles, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { MapContextModal, type MapContextData } from "./map-context-modal"
import { FilePicker, type AttachedFilesContext } from "./file-picker"
import { Badge } from "@/components/ui/badge"

type AgentMode = "auto" | "fast" | "research" | "data-quality"

interface ChatInputProps {
    onSubmit: (data: { message: string; mode: AgentMode; context: any[] }) => void
    isLoading?: boolean
    onCancel?: () => void
}

export function ChatInput({ onSubmit, isLoading, onCancel }: ChatInputProps) {
    const [mode, setMode] = useState<AgentMode>("auto")
    const [message, setMessage] = useState("")
    const [showMapDrawer, setShowMapDrawer] = useState(false)
    const [showFileUpload, setShowFileUpload] = useState(false)
    const [contextItems, setContextItems] = useState<Array<{ type: string; data: any }>>([])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!message.trim() || isLoading) return

        // DEBUG: Log what we're sending
        console.log('[ChatInput] Submitting with contextItems:', JSON.stringify(contextItems, null, 2))

        onSubmit({ message, mode, context: contextItems })
        setMessage("")
        setContextItems([])
    }

    const addMapContext = (contextData: MapContextData) => {
        setContextItems((prev) => [...prev, { type: "map", data: contextData }])
        setShowMapDrawer(false)
    }

    const addFileContext = (fileContext: AttachedFilesContext) => {
        console.log('[ChatInput] Adding file context:', JSON.stringify(fileContext, null, 2))
        setContextItems((prev) => [...prev, { type: "attached_files", data: fileContext }])
        setShowFileUpload(false)
    }

    const removeContext = (index: number) => {
        setContextItems((prev) => prev.filter((_, i) => i !== index))
    }

    const getModeLabel = () => {
        switch (mode) {
            case "auto": return "Auto"
            case "fast": return "Fast"
            case "research": return "Research"
            case "data-quality": return "DQ"
            default: return "Auto"
        }
    }

    return (
        <>
            <div className="border-t border-border p-4 shrink-0">
                <div className="max-w-3xl mx-auto">
                    {/* Context Items */}
                    {contextItems.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-3">
                            {contextItems.map((item, index) => (
                                <Badge key={index} variant="secondary" className="gap-1.5 pr-1">
                                    {item.type === "map" ? (
                                        <>
                                            <MapIcon className="h-3 w-3" />
                                            {item.data.count} {item.data.layerName}
                                        </>
                                    ) : item.type === "uploaded_files" ? (
                                        <>
                                            <Files className="h-3 w-3" />
                                            {item.data.count} files
                                            {item.data.files.filter((f: any) => f.fileType === 'las').length > 0 &&
                                                ` (${item.data.files.filter((f: any) => f.fileType === 'las').length} LAS)`}
                                        </>
                                    ) : (
                                        <>
                                            <Files className="h-3 w-3" />
                                            {item.data.name}
                                        </>
                                    )}
                                    <button onClick={() => removeContext(index)} className="ml-1 hover:bg-background rounded px-1">
                                        ×
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    )}

                    {/* Input Row */}
                    <div className="flex items-center gap-2">
                        {/* Add Context Button */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="rounded-lg flex-shrink-0 h-10 w-10">
                                    <Plus className="h-5 w-5" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuLabel className="text-xs text-muted-foreground">Add Context</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => setShowMapDrawer(true)}>
                                    <MapIcon className="mr-2 h-4 w-4" />
                                    Map Area
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setShowFileUpload(true)}>
                                    <Files className="mr-2 h-4 w-4" />
                                    Attach Files
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Input Field with inline mode button */}
                        <div className="relative flex-1">
                            <Input
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Ask a followup"
                                className="pr-24 h-10 rounded-lg"
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && !e.shiftKey) {
                                        e.preventDefault()
                                        handleSubmit(e)
                                    }
                                }}
                                disabled={isLoading}
                            />
                            <div className="absolute right-1 top-1 flex items-center gap-1">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="sm" className="h-8 text-xs gap-1 px-2">
                                            <Wand2 className="h-3 w-3" />
                                            {getModeLabel()}
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel className="text-xs text-muted-foreground">Agent Mode</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={() => setMode("auto")}>
                                            <Wand2 className="mr-2 h-4 w-4" />
                                            <span>Auto</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setMode("fast")}>
                                            <Zap className="mr-2 h-4 w-4" />
                                            <span>Fast</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setMode("research")}>
                                            <Sparkles className="mr-2 h-4 w-4" />
                                            <span>Research</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => setMode("data-quality")}>
                                            <BarChart3 className="mr-2 h-4 w-4" />
                                            <span>Data Quality</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            size="icon"
                            className="rounded-lg flex-shrink-0 h-10 w-10"
                            onClick={handleSubmit}
                            disabled={!message.trim() || isLoading}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Map Context Modal */}
            {showMapDrawer && <MapContextModal onClose={() => setShowMapDrawer(false)} onAddContext={addMapContext} />}

            {/* File Picker Modal */}
            {showFileUpload && <FilePicker onClose={() => setShowFileUpload(false)} onFilesSelected={addFileContext} />}
        </>
    )
}
