"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { X, Upload, File, CheckCircle2, Loader2, FileText, FileSpreadsheet } from "lucide-react"
import { cn } from "@/lib/utils"
import { uploadFiles, type UploadProgress, type UploadResult, type FileMetadata } from "@/lib/api/files"

/**
 * File context data passed to chat as context
 */
export interface FileContextData {
    type: 'uploaded_files'
    directory: string
    files: {
        name: string
        path: string
        size: number
        fileType: string  // 'las', 'pdf', 'csv', etc.
    }[]
    count: number
}

interface FileUploadChatProps {
    onClose: () => void
    onFilesUploaded: (context: FileContextData) => void
    sessionId?: string
}

interface FileItem {
    file: File
    status: "pending" | "uploading" | "success" | "error"
    serverPath?: string
    error?: string
}

// Detect file type from extension
function detectFileType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop() || ''
    const typeMap: Record<string, string> = {
        'las': 'las',
        'pdf': 'pdf',
        'csv': 'csv',
        'xlsx': 'excel',
        'xls': 'excel',
        'zip': 'zip',
        'txt': 'text',
        'doc': 'document',
        'docx': 'document',
    }
    return typeMap[ext] || 'unknown'
}

// Get icon for file type
function getFileIcon(fileType: string) {
    switch (fileType) {
        case 'las':
            return <FileText className="h-4 w-4 text-blue-500" />
        case 'pdf':
            return <FileText className="h-4 w-4 text-red-500" />
        case 'csv':
        case 'excel':
            return <FileSpreadsheet className="h-4 w-4 text-green-500" />
        default:
            return <File className="h-4 w-4 text-muted-foreground" />
    }
}

export function FileUploadChat({ onClose, onFilesUploaded, sessionId }: FileUploadChatProps) {
    const [files, setFiles] = useState<FileItem[]>([])
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Generate session-specific upload directory
    const uploadDirectory = `/uploads/${sessionId || `session_${Date.now()}`}`

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

    const handleUploadAndAddContext = async () => {
        if (files.length === 0) return

        try {
            setUploading(true)
            setFiles(prev => prev.map(f => ({ ...f, status: "uploading" as const })))

            const result = await uploadFiles(
                uploadDirectory,
                files.map(f => f.file),
                (progress) => setUploadProgress(progress)
            )

            // Update file statuses and store server paths
            const updatedFiles = files.map(f => {
                const uploaded = result.uploaded.find(u => u.name === f.file.name)
                const error = result.errors.find(e => e.filename === f.file.name)

                if (error) {
                    return { ...f, status: "error" as const, error: error.error }
                }
                if (uploaded) {
                    return { ...f, status: "success" as const, serverPath: uploaded.path }
                }
                return f
            })
            setFiles(updatedFiles)

            // Build context from successfully uploaded files
            const successfulFiles = updatedFiles.filter(f => f.status === "success" && f.serverPath)

            if (successfulFiles.length > 0) {
                const fileContext: FileContextData = {
                    type: 'uploaded_files',
                    directory: uploadDirectory,
                    files: successfulFiles.map(f => ({
                        name: f.file.name,
                        path: f.serverPath!,
                        size: f.file.size,
                        fileType: detectFileType(f.file.name)
                    })),
                    count: successfulFiles.length
                }

                // DEBUG: Log the context being created
                console.log('[FileUploadChat] Creating file context:', JSON.stringify(fileContext, null, 2))

                // Add to chat context and close
                onFilesUploaded(fileContext)
                onClose()
            }
        } catch (err) {
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

    // Count files by type
    const lasCounts = files.filter(f => detectFileType(f.file.name) === 'las').length
    const pdfCount = files.filter(f => detectFileType(f.file.name) === 'pdf').length
    const zipCount = files.filter(f => detectFileType(f.file.name) === 'zip').length

    const canUpload = files.length > 0 && !uploading

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-lg bg-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-5 py-3">
                    <div>
                        <h2 className="text-base font-semibold">Upload Well Data</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            LAS, PDF, or ZIP files
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} disabled={uploading}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content */}
                <div className="p-5">
                    {/* Drop Zone */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => !uploading && fileInputRef.current?.click()}
                        className={cn(
                            "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all",
                            isDragging && "border-primary bg-primary/5",
                            uploading && "pointer-events-none opacity-50",
                            !isDragging && "hover:bg-muted/50 hover:border-muted-foreground/50"
                        )}
                    >
                        <Upload className={cn(
                            "h-8 w-8 mx-auto mb-2",
                            isDragging ? "text-primary" : "text-muted-foreground"
                        )} />
                        <p className="text-sm font-medium mb-1">
                            {isDragging ? "Drop files here" : "Click or drag files"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                            LAS, PDF, CSV, or ZIP packages
                        </p>
                    </div>

                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".las,.pdf,.csv,.xlsx,.xls,.zip,.txt"
                        onChange={handleFileSelect}
                        className="hidden"
                        disabled={uploading}
                    />

                    {/* Upload Progress */}
                    {uploading && uploadProgress && (
                        <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-medium">{uploadProgress.filename}</span>
                                <span className="text-muted-foreground">{uploadProgress.percent}%</span>
                            </div>
                            <Progress value={uploadProgress.percent} className="h-1.5" />
                        </div>
                    )}

                    {/* File List */}
                    {files.length > 0 && (
                        <div className="mt-4 space-y-1.5 max-h-[200px] overflow-auto">
                            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                                <span>{files.length} files selected</span>
                                <span>
                                    {lasCounts > 0 && `${lasCounts} LAS`}
                                    {pdfCount > 0 && ` • ${pdfCount} PDF`}
                                    {zipCount > 0 && ` • ${zipCount} ZIP`}
                                </span>
                            </div>
                            {files.map((item, index) => (
                                <div
                                    key={index}
                                    className={cn(
                                        "flex items-center justify-between rounded-md p-2 text-sm",
                                        item.status === "error" && "bg-destructive/10",
                                        item.status === "success" && "bg-green-500/10",
                                        item.status === "pending" && "bg-muted/50",
                                        item.status === "uploading" && "bg-primary/10"
                                    )}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        {getFileIcon(detectFileType(item.file.name))}
                                        <span className="truncate">{item.file.name}</span>
                                        <span className="text-xs text-muted-foreground shrink-0">
                                            {formatSize(item.file.size)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        {item.status === "uploading" && <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />}
                                        {item.status === "success" && <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />}
                                        {item.status === "pending" && !uploading && (
                                            <button onClick={() => removeFile(index)} className="text-muted-foreground hover:text-foreground">
                                                <X className="h-3.5 w-3.5" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t px-5 py-3 bg-muted/30">
                    <Button variant="outline" size="sm" onClick={onClose} disabled={uploading}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleUploadAndAddContext} disabled={!canUpload}>
                        {uploading && <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />}
                        {uploading ? "Uploading..." : `Add to Chat (${files.length})`}
                    </Button>
                </div>
            </div>
        </div>
    )
}
