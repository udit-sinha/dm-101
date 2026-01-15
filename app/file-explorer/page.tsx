"use client"

import { useState, useCallback } from "react"
import { TopNav } from "@/components/top-nav"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { DirectoryTree } from "@/components/directory-tree"
import { FileList } from "@/components/file-list"
import { AllFiles } from "@/components/all-files"
import { FileUpload } from "@/components/file-upload"
import { AddContext } from "@/components/add-context"
import { Upload } from "lucide-react"
import { type FileMetadata } from "@/lib/api/files"

export default function FileExplorerPage() {
    const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null)
    const [selectedFiles, setSelectedFiles] = useState<Record<string, boolean>>({})
    const [activeTab, setActiveTab] = useState<"browse" | "all">("browse")
    const [showAddContext, setShowAddContext] = useState(false)
    const [showUpload, setShowUpload] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    const handleSelectDirectory = (directoryPath: string) => {
        setSelectedDirectory(directoryPath)
    }

    const handleSelectFile = (fileId: string, isSelected: boolean) => {
        setSelectedFiles((prev) => ({
            ...prev,
            [fileId]: isSelected,
        }))
    }

    const handleSelectAll = (files: FileMetadata[], isSelected: boolean) => {
        const newSelectedFiles = { ...selectedFiles }
        files.forEach((file) => {
            newSelectedFiles[file.id] = isSelected
        })
        setSelectedFiles(newSelectedFiles)
    }

    const handleFilesChanged = useCallback(() => {
        // Trigger refresh of file list
        setRefreshKey(k => k + 1)
    }, [])

    const selectedFileCount = Object.values(selectedFiles).filter(Boolean).length

    return (
        <>
            {showAddContext ? (
                <AddContext
                    selectedFiles={selectedFiles}
                    onBack={() => setShowAddContext(false)}
                />
            ) : (
                <>
                    <TopNav title="File Explorer" showSearch={false} />

                    <div className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4">
                        <Tabs
                            value={activeTab}
                            onValueChange={(value) => setActiveTab(value as "browse" | "all")}
                            className="w-auto"
                        >
                            <TabsList>
                                <TabsTrigger value="browse">Browse Directories</TabsTrigger>
                                <TabsTrigger value="all">All Files</TabsTrigger>
                            </TabsList>
                        </Tabs>
                        <div className="flex items-center gap-2">
                            {selectedDirectory && (
                                <Button
                                    variant="outline"
                                    onClick={() => setShowUpload(true)}
                                    className="gap-2"
                                >
                                    <Upload className="h-4 w-4" />
                                    Upload
                                </Button>
                            )}
                            <Button
                                variant="default"
                                onClick={() => setShowAddContext(true)}
                                disabled={selectedFileCount === 0}
                            >
                                Add Context ({selectedFileCount})
                            </Button>
                        </div>
                    </div>

                    {activeTab === "browse" ? (
                        <ResizablePanelGroup direction="horizontal" className="flex-1">
                            <ResizablePanel defaultSize={30} minSize={20}>
                                <DirectoryTree onSelectDirectory={handleSelectDirectory} />
                            </ResizablePanel>
                            <ResizableHandle withHandle />
                            <ResizablePanel defaultSize={70} minSize={30}>
                                <FileList
                                    key={refreshKey}
                                    selectedDirectory={selectedDirectory}
                                    selectedFiles={selectedFiles}
                                    onSelectFile={handleSelectFile}
                                    onSelectAll={handleSelectAll}
                                    onFilesChanged={handleFilesChanged}
                                />
                            </ResizablePanel>
                        </ResizablePanelGroup>
                    ) : (
                        <div className="flex-1 overflow-hidden">
                            <AllFiles
                                selectedFiles={selectedFiles}
                                onSelectFile={handleSelectFile}
                                onSelectAll={handleSelectAll}
                            />
                        </div>
                    )}
                </>
            )}

            {/* Upload Modal */}
            {showUpload && selectedDirectory && (
                <FileUpload
                    targetDirectory={selectedDirectory}
                    onClose={() => setShowUpload(false)}
                    onUploadComplete={() => {
                        handleFilesChanged()
                    }}
                />
            )}
        </>
    )
}
