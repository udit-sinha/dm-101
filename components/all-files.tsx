"use client"

import { useState, useEffect, useCallback } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    ChevronLeft,
    ChevronRight,
    File,
    FileText,
    FileImage,
    FileCode,
    FileSpreadsheet,
    Search,
    Loader2,
    Download,
    Trash2,
    Folder
} from "lucide-react"
import {
    searchFiles,
    listFiles,
    deleteFile,
    downloadFile,
    type FileMetadata
} from "@/lib/api/files"

// Get icon based on file type
const getFileIcon = (file: FileMetadata) => {
    if (file.isDirectory) {
        return <Folder className="h-4 w-4 text-yellow-500" />
    }

    const mimeType = file.mimeType
    const name = file.name

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
    if (bytes === 0) return "-"
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
}

type AllFilesProps = {
    selectedFiles: Record<string, boolean>
    onSelectFile: (fileId: string, isSelected: boolean) => void
    onSelectAll: (files: FileMetadata[], isSelected: boolean) => void
}

export function AllFiles({ selectedFiles, onSelectFile, onSelectAll }: AllFilesProps) {
    const [files, setFiles] = useState<FileMetadata[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalFiles, setTotalFiles] = useState(0)
    const [selectAll, setSelectAll] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const [timeFilter, setTimeFilter] = useState("all")
    const [pageSize, setPageSize] = useState(10)

    const PAGE_SIZE_OPTIONS = [10, 50, 100, 1000]

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedQuery(searchQuery)
            setCurrentPage(1)
        }, 300)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Fetch files
    const fetchFiles = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            // Use search for recursive file listing (empty query returns all files)
            const result = await searchFiles(debouncedQuery, undefined, currentPage, pageSize)

            // Filter out directories - this tab is for files only
            let filtered = result.files.filter(f => !f.isDirectory)

            // Apply time filter
            if (timeFilter !== "all") {
                const now = Date.now()
                const cutoffs: Record<string, number> = {
                    "1day": 24 * 60 * 60 * 1000,
                    "1week": 7 * 24 * 60 * 60 * 1000,
                    "1month": 30 * 24 * 60 * 60 * 1000,
                }
                const cutoff = cutoffs[timeFilter]
                if (cutoff) {
                    filtered = filtered.filter(f => {
                        const modTime = new Date(f.modifiedAt).getTime()
                        return (now - modTime) <= cutoff
                    })
                }
            }

            setFiles(filtered)
            setTotalPages(result.totalPages)
            setTotalFiles(filtered.length)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load files")
            console.error("Failed to fetch files:", err)
        } finally {
            setLoading(false)
        }
    }, [debouncedQuery, currentPage, timeFilter, pageSize])

    useEffect(() => {
        fetchFiles()
    }, [fetchFiles])

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
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete file")
        }
    }

    const handleDownload = async (file: FileMetadata) => {
        if (file.isDirectory) return
        try {
            await downloadFile(file.path)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to download file")
        }
    }

    const startIndex = (currentPage - 1) * pageSize

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {/* Filters */}
            <div className="p-4 border-b flex flex-wrap gap-4 items-center shrink-0">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search files..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by time" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Time</SelectItem>
                        <SelectItem value="1day">Last 24 Hours</SelectItem>
                        <SelectItem value="1week">Last 7 Days</SelectItem>
                        <SelectItem value="1month">Last 30 Days</SelectItem>
                    </SelectContent>
                </Select>
            </div>

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
                        <p>{debouncedQuery ? "No files found matching your search" : "No files yet"}</p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader className="sticky top-0 bg-background">
                            <TableRow>
                                <TableHead className="w-12">
                                    <Checkbox
                                        checked={selectAll}
                                        onCheckedChange={handleSelectAll}
                                        aria-label="Select all files"
                                    />
                                </TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Path</TableHead>
                                <TableHead>Size</TableHead>
                                <TableHead>Modified</TableHead>
                                <TableHead className="w-24">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {files.map((file) => (
                                <TableRow key={file.id} className="group">
                                    <TableCell>
                                        <Checkbox
                                            checked={selectedFiles[file.id] || false}
                                            onCheckedChange={(checked) => onSelectFile(file.id, !!checked)}
                                            aria-label={`Select ${file.name}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            {getFileIcon(file)}
                                            <span className="truncate max-w-[200px]">{file.name}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm font-mono">
                                        {file.parentPath || "/"}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatFileSize(file.size)}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {formatDate(file.modifiedAt)}
                                    </TableCell>
                                    <TableCell>
                                        {!file.isDirectory && (
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
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                        {totalFiles > 0
                            ? `${startIndex + 1}-${Math.min(startIndex + pageSize, totalFiles)} of ${totalFiles} files`
                            : "No files found"}
                    </div>
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
                        Page {currentPage} of {totalPages || 1}
                    </span>
                    <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
