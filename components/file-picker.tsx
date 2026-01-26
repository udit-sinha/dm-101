"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Folder, FolderOpen, File, FileText, FileSpreadsheet, Check, ChevronRight, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { getFolderTree, listFiles, type FolderNode, type FileMetadata } from "@/lib/api/files"

/**
 * File context data passed to chat
 */
export interface AttachedFilesContext {
    type: 'attached_files'
    files: {
        name: string
        path: string
        size: number
        fileType: string
    }[]
    count: number
}

interface FilePickerProps {
    onClose: () => void
    onFilesSelected: (context: AttachedFilesContext) => void
    maxFiles?: number
}

// Get icon for file type
function getFileIcon(filename: string) {
    const ext = filename.toLowerCase().split('.').pop() || ''
    switch (ext) {
        case 'las':
            return <FileText className="h-4 w-4 text-blue-500" />
        case 'pdf':
            return <FileText className="h-4 w-4 text-red-500" />
        case 'csv':
        case 'xlsx':
        case 'xls':
            return <FileSpreadsheet className="h-4 w-4 text-green-500" />
        case 'zip':
            return <File className="h-4 w-4 text-amber-500" />
        default:
            return <File className="h-4 w-4 text-muted-foreground" />
    }
}

function detectFileType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop() || ''
    const typeMap: Record<string, string> = {
        'las': 'las', 'pdf': 'pdf', 'csv': 'csv',
        'xlsx': 'excel', 'xls': 'excel', 'zip': 'zip',
        'txt': 'text', 'doc': 'document', 'docx': 'document',
    }
    return typeMap[ext] || 'unknown'
}

interface FolderTreeItemProps {
    node: FolderNode
    level: number
    selectedPath: string | null
    onSelect: (path: string) => void
    expandedPaths: Set<string>
    onToggle: (path: string) => void
}

function FolderTreeItem({ node, level, selectedPath, onSelect, expandedPaths, onToggle }: FolderTreeItemProps) {
    const isExpanded = expandedPaths.has(node.path)
    const isSelected = selectedPath === node.path
    const hasChildren = node.children && node.children.length > 0

    return (
        <div>
            <div
                className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer text-sm",
                    isSelected ? "bg-primary/10 text-primary" : "hover:bg-muted"
                )}
                style={{ paddingLeft: `${level * 12 + 8}px` }}
                onClick={() => {
                    onSelect(node.path)
                    if (hasChildren) onToggle(node.path)
                }}
            >
                {hasChildren ? (
                    isExpanded ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />
                ) : (
                    <span className="w-3.5" />
                )}
                {isExpanded ? (
                    <FolderOpen className="h-4 w-4 text-amber-500" />
                ) : (
                    <Folder className="h-4 w-4 text-amber-500" />
                )}
                <span className="truncate">{node.name}</span>
            </div>
            {isExpanded && hasChildren && (
                <div>
                    {node.children.map(child => (
                        <FolderTreeItem
                            key={child.path}
                            node={child}
                            level={level + 1}
                            selectedPath={selectedPath}
                            onSelect={onSelect}
                            expandedPaths={expandedPaths}
                            onToggle={onToggle}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export function FilePicker({ onClose, onFilesSelected, maxFiles = 10 }: FilePickerProps) {
    const [folders, setFolders] = useState<FolderNode[]>([])
    const [files, setFiles] = useState<FileMetadata[]>([])
    const [selectedPath, setSelectedPath] = useState<string | null>("/")
    const [selectedFiles, setSelectedFiles] = useState<FileMetadata[]>([])
    const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(["/"]))
    const [loading, setLoading] = useState(true)

    // Load folder tree
    useEffect(() => {
        getFolderTree("/").then(setFolders).catch(console.error).finally(() => setLoading(false))
    }, [])

    // Load files when folder changes
    useEffect(() => {
        if (selectedPath) {
            listFiles(selectedPath, 1, 50).then(result => setFiles(result.files.filter(f => !f.isDirectory))).catch(console.error)
        }
    }, [selectedPath])

    const toggleFolder = (path: string) => {
        setExpandedPaths(prev => {
            const next = new Set(prev)
            if (next.has(path)) next.delete(path)
            else next.add(path)
            return next
        })
    }

    const toggleFile = (file: FileMetadata) => {
        setSelectedFiles(prev => {
            const exists = prev.find(f => f.path === file.path)
            if (exists) return prev.filter(f => f.path !== file.path)
            if (prev.length >= maxFiles) return prev
            return [...prev, file]
        })
    }

    const handleConfirm = () => {
        if (selectedFiles.length === 0) return

        const context: AttachedFilesContext = {
            type: 'attached_files',
            files: selectedFiles.map(f => ({
                name: f.name,
                path: f.path,
                size: f.size,
                fileType: detectFileType(f.name)
            })),
            count: selectedFiles.length
        }

        console.log('[FilePicker] Selected files context:', JSON.stringify(context, null, 2))
        onFilesSelected(context)
        onClose()
    }

    const formatSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    }

    // Count selected by type
    const lasCount = selectedFiles.filter(f => detectFileType(f.name) === 'las').length
    const pdfCount = selectedFiles.filter(f => detectFileType(f.name) === 'pdf').length

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full max-w-2xl bg-card rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-5 py-3">
                    <div>
                        <h2 className="text-base font-semibold">Select Files</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Choose files from the file manager
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                {/* Content - Two column layout */}
                <div className="flex h-[400px]">
                    {/* Folder Tree */}
                    <div className="w-1/3 border-r overflow-auto p-2">
                        {loading ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                Loading...
                            </div>
                        ) : (
                            <div>
                                {/* Root */}
                                <div
                                    className={cn(
                                        "flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer text-sm",
                                        selectedPath === "/" ? "bg-primary/10 text-primary" : "hover:bg-muted"
                                    )}
                                    onClick={() => setSelectedPath("/")}
                                >
                                    <FolderOpen className="h-4 w-4 text-amber-500" />
                                    <span>Root</span>
                                </div>
                                {folders.map(node => (
                                    <FolderTreeItem
                                        key={node.path}
                                        node={node}
                                        level={1}
                                        selectedPath={selectedPath}
                                        onSelect={setSelectedPath}
                                        expandedPaths={expandedPaths}
                                        onToggle={toggleFolder}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* File List */}
                    <div className="flex-1 overflow-auto p-3">
                        {files.length === 0 ? (
                            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                                {selectedPath ? "No files in this folder" : "Select a folder"}
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {files.map(file => {
                                    const isSelected = selectedFiles.some(f => f.path === file.path)
                                    return (
                                        <div
                                            key={file.path}
                                            className={cn(
                                                "flex items-center gap-2 p-2 rounded cursor-pointer text-sm",
                                                isSelected ? "bg-primary/10" : "hover:bg-muted"
                                            )}
                                            onClick={() => toggleFile(file)}
                                        >
                                            <div className={cn(
                                                "h-4 w-4 rounded border flex items-center justify-center",
                                                isSelected ? "bg-primary border-primary" : "border-muted-foreground/50"
                                            )}>
                                                {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                                            </div>
                                            {getFileIcon(file.name)}
                                            <span className="flex-1 truncate">{file.name}</span>
                                            <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* Selected Files Summary */}
                {selectedFiles.length > 0 && (
                    <div className="border-t px-5 py-2 bg-muted/30">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="font-medium">{selectedFiles.length} selected</span>
                            {lasCount > 0 && <span>• {lasCount} LAS</span>}
                            {pdfCount > 0 && <span>• {pdfCount} PDF</span>}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 border-t px-5 py-3">
                    <Button variant="outline" size="sm" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button size="sm" onClick={handleConfirm} disabled={selectedFiles.length === 0}>
                        Attach ({selectedFiles.length})
                    </Button>
                </div>
            </div>
        </div>
    )
}
