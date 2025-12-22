"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Sparkles, Files, Layers, Plus, ArrowRight, Upload, MapIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MapDrawer } from "./map-drawer"
import { FileUpload } from "./file-upload"
import { Badge } from "@/components/ui/badge"

interface PromptFormProps {
  onSubmit: (data: { message: string; mode: "fast" | "research"; context: any[] }) => void
}

export function PromptForm({ onSubmit }: PromptFormProps) {
  const [mode, setMode] = useState<"fast" | "research">("research")
  const [message, setMessage] = useState("")
  const [showMapDrawer, setShowMapDrawer] = useState(false)
  const [showFileUpload, setShowFileUpload] = useState(false)
  const [contextItems, setContextItems] = useState<Array<{ type: string; data: any }>>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) return

    onSubmit({ message, mode, context: contextItems })
    setMessage("")
    setContextItems([])
  }

  const addMapContext = (coordinates: any) => {
    setContextItems((prev) => [...prev, { type: "map", data: coordinates }])
    setShowMapDrawer(false)
  }

  const addFileContext = (files: File[]) => {
    files.forEach((file) => {
      setContextItems((prev) => [...prev, { type: "file", data: file }])
    })
    setShowFileUpload(false)
  }

  const removeContext = (index: number) => {
    setContextItems((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <>
      <div className="relative max-w-3xl mx-auto w-full">
        <div className="rounded-2xl border bg-card shadow-lg">
          {/* Context Items */}
          {contextItems.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 pb-0">
              {contextItems.map((item, index) => (
                <Badge key={index} variant="secondary" className="gap-1.5 pr-1">
                  {item.type === "map" ? (
                    <>
                      <MapIcon className="h-3 w-3" />
                      Map Area
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

          {/* Input Area */}
          <div className="p-4">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask or select a template"
              className="min-h-[60px] max-h-[200px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none shadow-none text-base bg-transparent placeholder:text-muted-foreground"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSubmit(e)
                }
              }}
            />
          </div>

          {/* Bottom Bar */}
          <div className="flex items-center justify-between p-4 pt-0">
            <div className="flex items-center gap-2">
              {/* Context Button */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="gap-2">
                    <Layers className="h-4 w-4" />
                    Context
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setShowMapDrawer(true)}>
                    <MapIcon className="mr-2 h-4 w-4" />
                    Map Area
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowFileUpload(true)}>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Templates Button */}

              {/* Mode Selector */}
              <div className="flex items-center gap-1 rounded-lg bg-background border p-0.5">
                <button
                  onClick={() => setMode("fast")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                    mode === "fast" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  Fast
                </button>
                <button
                  onClick={() => setMode("research")}
                  className={`px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-1.5 ${
                    mode === "research" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Research
                </button>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
              <Button size="icon" className="h-8 w-8" onClick={handleSubmit} disabled={!message.trim()}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Drawer Modal */}
      {showMapDrawer && <MapDrawer onClose={() => setShowMapDrawer(false)} onSave={addMapContext} />}

      {/* File Upload Modal */}
      {showFileUpload && <FileUpload onClose={() => setShowFileUpload(false)} onUpload={addFileContext} />}
    </>
  )
}
