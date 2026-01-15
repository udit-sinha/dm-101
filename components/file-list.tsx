"use client"

import { useState, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    ChevronLeft,
    ChevronRight,
    File,
    FileText,
    FileImage,
    FileCode,
    FileSpreadsheet,
    Download,
    Trash2,
    Upload,
    Loader2,
    FolderOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    listFiles,
    deleteFile,
    downloadFile,
    uploadFiles,
    type FileMetadata,
    type UploadProgress
} from "@/lib/api/files"

// Get icon based on file type
const getFileIcon = (mimeType: string, name: string) => {
    if (mimeType.startsWith("image/")) {
        return <FileImage className="h-4 w-4 text-green-500" />
    }
    if (mimeType.startsWith("text/") || mimeType.includes("pdf") || mimeType.includes("document")) {
        return <FileText className="h-4 w-4 text-blue-500" />
    }
    if (mimeType.includes("spreadsheet") || name.endsWith(".csv") || name.endsWith(".xlsx")) {
        return <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
    }
    if (mimeType.includes("javascript") || mimeType.includes("html") || mimeType.includes("css") || name.match(/\.(js|ts|tsx|jsx|py|html|css)$/)) {
        return <FileCode className="h-4 w-4 text-yellow-500" />
    }
    return <File className="h-4 w-4 text-gray-500" />
}

const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    })
}

type FileListProps = {
    selectedDirectory: string | null
    selectedFiles: Record<string, boolean>
    onSelectFile: (fileId: string, isSelected: boolean) => void
    onSelectAll: (files: FileMetadata[], isSelected: boolean) => void
    onFilesChanged?: () => void
}

export function FileList({
    selectedDirectory,
    selectedFiles,
    onSelectFile,
    onSelectAll,
    onFilesChanged
}: FileListProps) {
    const [files, setFiles] = useState<FileMetadata[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalFiles, setTotalFiles] = useState(0)
    const [selectAll, setSelectAll] = useState(false)
    const [pageSize, setPageSize] = useState(10)
    const PAGE_SIZE_OPTIONS = [10, 50, 100, 1000]

    // Drag-drop upload state
    const [isDragging, setIsDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)

    // Fetch files from API
    const fetchFiles = useCallback(async () => {
        if (!selectedDirectory) {
            setFiles([])
            return
        }

        try {
            setLoading(true)
            setError(null)
            const result = await listFiles(selectedDirectory, currentPage, pageSize)
            // Filter out directories - they're shown in the tree on the left
            const filesOnly = result.files.filter(f => !f.isDirectory)
            setFiles(filesOnly)
            setTotalPages(result.totalPages)
            setTotalFiles(result.total)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load files")
            console.error("Failed to fetch files:", err)
        } finally {
            setLoading(false)
        }
    }, [selectedDirectory, currentPage, pageSize])

    useEffect(() => {
        fetchFiles()
    }, [fetchFiles])

    useEffect(() => {
        // Reset page when directory changes
        setCurrentPage(1)
    }, [selectedDirectory])

    useEffect(() => {
        // Update selectAll checkbox based on whether all current files are selected
        if (files.length > 0) {
            const allSelected = files.every((file) => selectedFiles[file.id])
            setSelectAll(allSelected)
        } else {
            setSelectAll(false)
        }
    }, [selectedFiles, files])

    const handleSelectAll = (checked: boolean) => {
        setSelectAll(checked)
        onSelectAll(files, checked)
    }

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page)
        }
    }

    const handleDelete = async (file: FileMetadata) => {
        if (!confirm(`Delete "${file.name}"?`)) return

        try {
            await deleteFile(file.path)
            await fetchFiles()
            onFilesChanged?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete file")
        }
    }

    const handleDownload = async (file: FileMetadata) => {
        try {
            await downloadFile(file.path)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to download file")
        }
    }

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)
    }

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(false)

        if (!selectedDirectory) return

        const droppedFiles = Array.from(e.dataTransfer.files)
        if (droppedFiles.length === 0) return

        try {
            setUploading(true)
            setUploadProgress({ filename: "", loaded: 0, total: 0, percent: 0 })

            await uploadFiles(selectedDirectory, droppedFiles, (progress) => {
                setUploadProgress(progress)
            })

            await fetchFiles()
            onFilesChanged?.()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to upload files")
        } finally {
            setUploading(false)
            setUploadProgress(null)
        }
    }

    if (!selectedDirectory) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
                <FolderOpen className="h-12 w-12 opacity-30" />
                <p>Select a directory to view files</p>
            </div>
        )
    }

    const startIndex = (currentPage - 1) * pageSize

    return (
        <div
            className={cn(
                "h-full flex flex-col overflow-hidden relative",
                isDragging && "ring-2 ring-primary ring-inset"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Header */}
            <div className="p-4 border-b shrink-0">
                <h2 className="text-lg font-medium">Files</h2>
                <p className="text-sm text-muted-foreground">
                    {totalFiles} {totalFiles === 1 ? 'file' : 'files'} in selected directory
                </p>
            </div>

            {/* Upload Progress */}
            {uploading && uploadProgress && (
                <div className="px-4 py-3 border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                        <Upload className="h-4 w-4 text-primary animate-pulse" />
                        <div className="flex-1">
                            <div className="flex justify-between text-sm mb-1">
                                <span className="truncate">{uploadProgress.filename}</span>
                                <span className="text-muted-foreground">{uploadProgress.percent}%</span>
                            </div>
                            <Progress value={uploadProgress.percent} className="h-1.5" />
                        </div>
                    </div>
                </div>
            )}

            {/* Drag overlay */}
            {isDragging && (
                <div className="absolute inset-0 z-10 bg-primary/5 border-2 border-dashed border-primary rounded-lg flex items-center justify-center">
                    <div className="text-center">
                        <Upload className="h-12 w-12 mx-auto mb-2 text-primary" />
                        <p className="font-medium text-primary">Drop files to upload</p>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="flex-1 overflow-auto">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2">
                        <p className="text-destructive text-sm">{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchFiles}>
                            Retry
                        </Button>
                    </div>
                ) : files.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground gap-2">
                        <File className="h-12 w-12 opacity-30" />
                        <p>No files in this directory</p>
                        <p className="text-xs">Drag and drop files here to upload</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="sticky top-0 bg-background">
                            <TableRow className="h-10">
                                <TableHead className="w-12 py-2 px-3">
                                    <div className="flex items-center justify-center h-5 w-5">
                                        <Checkbox
                                            checked={selectAll}
                                            onCheckedChange={handleSelectAll}
                                            aria-label="Select all files"
                                            className="h-4 w-4"
                                        />
                                    </div>
                                </TableHead>
                                <TableHead className="py-2 px-3">Name</TableHead>
                                <TableHead className="py-2 px-3">Size</TableHead>
                                <TableHead className="py-2 px-3">Modified</TableHead>
                                <TableHead className="py-2 px-3 w-24">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {files.map((file) => (
                                <TableRow key={file.id} className="h-10 group">
                                    <TableCell className="py-2 px-3">
                                        <div className="flex items-center justify-center h-5 w-5">
                                            <Checkbox
                                                checked={selectedFiles[file.id] || false}
                                                onCheckedChange={(checked) => onSelectFile(file.id, !!checked)}
                                                aria-label={`Select ${file.name}`}
                                                className="h-4 w-4"
                                            />
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2 px-3">
                                        <div className="flex items-center gap-2">
                                            {getFileIcon(file.mimeType, file.name)}
                                            <span className="truncate max-w-[200px]">{file.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-2 px-3 text-muted-foreground">
                                        {formatFileSize(file.size)}
                                    </TableCell>
                                    <TableCell className="py-2 px-3 text-muted-foreground">
                                        {formatDate(file.modifiedAt)}
                                    </TableCell>
                                    <TableCell className="py-2 px-3">
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7"
                                                onClick={() => handleDownload(file)}
                                                title="Download"
                                            >
                                                <Download className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-7 w-7 text-destructive hover:text-destructive"
                                                onClick={() => handleDelete(file)}
                                                title="Delete"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Footer with pagination */}
            {files.length > 0 && (
                <div className="p-4 border-t flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">
                            {startIndex + 1}-{Math.min(startIndex + pageSize, totalFiles)} of {totalFiles}
                        </span>
                        <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setCurrentPage(1); }}>
                            <SelectTrigger className="w-[100px] h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PAGE_SIZE_OPTIONS.map(size => (
                                    <SelectItem key={size} value={size.toString()}>{size}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm min-w-[80px] text-center">
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}
