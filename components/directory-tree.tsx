"use client"

import { useState, useEffect, useCallback } from "react"
import { Folder, ChevronRight, FolderPlus, MoreHorizontal, Trash2, Pencil, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { getFolderTree, createFolder, deleteFolder, type FolderNode } from "@/lib/api/files"

type DirectoryTreeProps = {
    onSelectDirectory: (directoryPath: string) => void
}

export function DirectoryTree({ onSelectDirectory }: DirectoryTreeProps) {
    const [folders, setFolders] = useState<FolderNode[]>([])
    const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({})
    const [selectedDir, setSelectedDir] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Create folder dialog state
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [newFolderName, setNewFolderName] = useState("")
    const [createParentPath, setCreateParentPath] = useState("/")
    const [creating, setCreating] = useState(false)

    // Delete confirmation state
    const [deleteTarget, setDeleteTarget] = useState<string | null>(null)
    const [deleting, setDeleting] = useState(false)

    // Fetch folder tree from API
    const fetchFolders = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)
            const tree = await getFolderTree("/")
            setFolders(tree)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load folders")
            console.error("Failed to fetch folders:", err)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchFolders()
    }, [fetchFolders])

    const toggleDir = (dirId: string) => {
        setExpandedDirs((prev) => ({
            ...prev,
            [dirId]: !prev[dirId],
        }))
    }

    const selectDirectory = (dirPath: string) => {
        setSelectedDir(dirPath)
        onSelectDirectory(dirPath)
    }

    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return

        const folderPath = createParentPath === "/"
            ? `/${newFolderName.trim()}`
            : `${createParentPath}/${newFolderName.trim()}`

        try {
            setCreating(true)
            await createFolder(folderPath)
            await fetchFolders()
            setShowCreateDialog(false)
            setNewFolderName("")
            // Expand the parent and select the new folder
            if (createParentPath !== "/") {
                setExpandedDirs(prev => ({ ...prev, [createParentPath]: true }))
            }
            selectDirectory(folderPath)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to create folder")
        } finally {
            setCreating(false)
        }
    }

    const handleDeleteFolder = async (path: string) => {
        try {
            setDeleting(true)
            await deleteFolder(path, true)
            await fetchFolders()
            setDeleteTarget(null)
            if (selectedDir === path) {
                setSelectedDir(null)
                onSelectDirectory("")
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to delete folder")
        } finally {
            setDeleting(false)
        }
    }

    const openCreateDialog = (parentPath: string = "/") => {
        setCreateParentPath(parentPath)
        setNewFolderName("")
        setShowCreateDialog(true)
    }

    const renderFolder = (folder: FolderNode, level = 0) => {
        const isExpanded = expandedDirs[folder.path] || false
        const isSelected = selectedDir === folder.path

        return (
            <div key={folder.id} className="select-none">
                <div
                    className={cn(
                        "group flex items-center py-1.5 px-2 hover:bg-muted/50 rounded cursor-pointer text-foreground",
                        isSelected && "bg-primary/10 text-primary",
                    )}
                    style={{ paddingLeft: `${level * 12 + 8}px` }}
                    onClick={() => selectDirectory(folder.path)}
                >
                    <button
                        className="mr-1 p-0.5 hover:bg-muted rounded-sm"
                        onClick={(e) => {
                            e.stopPropagation()
                            toggleDir(folder.path)
                        }}
                    >
                        <ChevronRight
                            className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")}
                        />
                    </button>
                    <Folder className={cn("h-4 w-4 mr-2", isSelected ? "text-primary" : "text-muted-foreground")} />
                    <span className="text-sm truncate flex-1">{folder.name}</span>

                    {/* Actions dropdown - visible on hover */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <MoreHorizontal className="h-3.5 w-3.5" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openCreateDialog(folder.path)}>
                                <FolderPlus className="h-4 w-4 mr-2" />
                                New subfolder
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                className="text-destructive focus:text-destructive"
                                onClick={() => setDeleteTarget(folder.path)}
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {isExpanded && folder.children.length > 0 && (
                    <div>{folder.children.map((child) => renderFolder(child, level + 1))}</div>
                )}
            </div>
        )
    }

    return (
        <div className="h-full overflow-auto border-r">
            {/* Header */}
            <div className="sticky top-0 bg-background z-10 border-b">
                <div className="flex items-center justify-between py-3 px-3">
                    <span className="font-medium text-sm">Directories</span>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => openCreateDialog("/")}
                        title="New folder"
                    >
                        <FolderPlus className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <div className="p-2">
                {loading ? (
                    <div className="flex items-center justify-center py-8 text-muted-foreground">
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        <span className="text-sm">Loading...</span>
                    </div>
                ) : error ? (
                    <div className="text-center py-8 px-4">
                        <p className="text-sm text-destructive mb-2">{error}</p>
                        <Button variant="outline" size="sm" onClick={fetchFolders}>
                            Retry
                        </Button>
                    </div>
                ) : folders.length === 0 ? (
                    <div className="text-center py-8 px-4 text-muted-foreground">
                        <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No folders yet</p>
                        <Button
                            variant="link"
                            size="sm"
                            onClick={() => openCreateDialog("/")}
                            className="mt-1"
                        >
                            Create your first folder
                        </Button>
                    </div>
                ) : (
                    folders.map((folder) => renderFolder(folder))
                )}
            </div>

            {/* Create Folder Dialog */}
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Folder</DialogTitle>
                    </DialogHeader>
                    <div className="py-4">
                        <label className="text-sm text-muted-foreground mb-2 block">
                            Location: <span className="font-mono text-foreground">{createParentPath}</span>
                        </label>
                        <Input
                            placeholder="Folder name"
                            value={newFolderName}
                            onChange={(e) => setNewFolderName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                            autoFocus
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleCreateFolder} disabled={!newFolderName.trim() || creating}>
                            {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Create
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Folder</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-muted-foreground py-4">
                        Are you sure you want to delete <span className="font-mono text-foreground">{deleteTarget}</span> and all its contents?
                        This action cannot be undone.
                    </p>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => deleteTarget && handleDeleteFolder(deleteTarget)}
                            disabled={deleting}
                        >
                            {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
