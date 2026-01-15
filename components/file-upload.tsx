"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, Upload, File, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadFiles, type UploadProgress, type UploadResult } from "@/lib/api/files"

interface FileUploadProps {
    targetDirectory: string
    onClose: () => void
    onUploadComplete?: (result: UploadResult) => void
}

interface FileItem {
    file: File
    status: "pending" | "uploading" | "success" | "error"
    error?: string
}

export function FileUpload({ targetDirectory, onClose, onUploadComplete }: FileUploadProps) {
    const [files, setFiles] = useState<FileItem[]>([])
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            addFiles(Array.from(e.target.files))
        }
    }

    const addFiles = (newFiles: File[]) => {
        const fileItems: FileItem[] = newFiles.map(file => ({
            file,
            status: "pending"
        }))
        setFiles(prev => [...prev, ...fileItems])
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
        if (e.dataTransfer.files) {
            addFiles(Array.from(e.dataTransfer.files))
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleUpload = async () => {
        if (files.length === 0) return

        try {
            setUploading(true)

            // Mark all as uploading
            setFiles(prev => prev.map(f => ({ ...f, status: "uploading" as const })))

            const result = await uploadFiles(
                targetDirectory,
                files.map(f => f.file),
                (progress) => setUploadProgress(progress)
            )

            // Update file statuses based on result
            setFiles(prev => prev.map(f => {
                const error = result.errors.find(e => e.filename === f.file.name)
                if (error) {
                    return { ...f, status: "error" as const, error: error.error }
                }
                return { ...f, status: "success" as const }
            }))

            onUploadComplete?.(result)

            // Auto-close after short delay if all succeeded
            if (result.totalErrors === 0) {
                setTimeout(() => onClose(), 1500)
            }
        } catch (err) {
            // Mark all as error
            setFiles(prev => prev.map(f => ({
                ...f,
                status: "error" as const,
                error: err instanceof Error ? err.message : "Upload failed"
            })))
        } finally {
            setUploading(false)
            setUploadProgress(null)
        }
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    const getStatusIcon = (status: FileItem["status"]) => {
        switch (status) {
            case "uploading":
                return <Loader2 className="h-4 w-4 text-primary animate-spin" />
            case "success":
                return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case "error":
                return <XCircle className="h-4 w-4 text-destructive" />
            default:
                return null
        }
    }

    const pendingCount = files.filter(f => f.status === "pending").length
    const canUpload = pendingCount > 0 && !uploading

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <div>
                        <h2 className="text-lg font-semibold">Upload Files</h2>
                        <p className="text-sm text-muted-foreground mt-0.5">
                            Target: <span className="font-mono">{targetDirectory}</span>
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={uploading}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Drop Zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all",
                            isDragging && "border-primary bg-primary/5",
                            uploading && "pointer-events-none opacity-50",
                            !isDragging && "hover:bg-muted/50 hover:border-muted-foreground/50"
                        )}
                    >
                        <Upload className={cn(
                            "h-10 w-10 mx-auto mb-3",
                            isDragging ? "text-primary" : "text-muted-foreground"
                        )} />
                        <p className="text-sm font-medium mb-1">
                            {isDragging ? "Drop files here" : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            CSV, PDF, TXT, images, or other document files
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                    />

                    {/* Upload Progress Bar */}
                    {uploading && uploadProgress && (
                        <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium">{uploadProgress.filename}</span>
                                <span className="text-muted-foreground">{uploadProgress.percent}%</span>
                            </div>
                            <Progress value={uploadProgress.percent} className="h-2" />
                        </div>
                    )}

                    {/* Selected Files List */}
                    {files.length > 0 && (
                        <div className="mt-4 space-y-2 max-h-[240px] overflow-auto">
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                                {files.length} {files.length === 1 ? 'file' : 'files'} selected
                            </p>
                            {files.map((item, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-center justify-between rounded-lg p-3 transition-colors",
                                        item.status === "error" && "bg-destructive/10",
                                        item.status === "success" && "bg-green-500/10",
                                        item.status === "pending" && "bg-muted",
                                        item.status === "uploading" && "bg-primary/10"
                                    )}
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <File className="h-4 w-4 text-muted-foreground shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium truncate">{item.file.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatSize(item.file.size)}
                                                {item.error && <span className="text-destructive ml-2">• {item.error}</span>}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        {getStatusIcon(item.status)}
                                        {item.status === "pending" && !uploading && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => removeFile(index)}
                                            >
                                                <X className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t px-6 py-4 bg-muted/30">
                    <Button variant="outline" onClick={onClose} disabled={uploading}>
                        {files.some(f => f.status === "success") ? "Close" : "Cancel"}
                    </Button>
                    <Button onClick={handleUpload} disabled={!canUpload}>
                        {uploading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        {uploading ? "Uploading..." : `Upload${pendingCount > 0 ? ` (${pendingCount})` : ''}`}
                    </Button>
                </div>
            </div>
        </div>
    )
}
