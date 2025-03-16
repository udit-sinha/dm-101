"use client"

import { useState } from "react"
import { TopNav } from "@/components/top-nav"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { DirectoryTree } from "@/components/directory-tree"
import { FileList } from "@/components/file-list"
import { AllFiles } from "@/components/all-files"
import { AddContext } from "@/components/add-context"

export default function FileExplorerPage() {
  const [selectedDirectory, setSelectedDirectory] = useState<string | null>(null)
  const [selectedFiles, setSelectedFiles] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<"browse" | "all">("browse")
  const [showAddContext, setShowAddContext] = useState(false)

  const handleSelectDirectory = (directoryId: string) => {
    setSelectedDirectory(directoryId)
  }

  const handleSelectFile = (fileId: string, isSelected: boolean) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [fileId]: isSelected,
    }))
  }

  const handleSelectAll = (files: any[], isSelected: boolean) => {
    const newSelectedFiles = { ...selectedFiles }

    files.forEach((file) => {
      newSelectedFiles[file.id] = isSelected
    })

    setSelectedFiles(newSelectedFiles)
  }

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
          <TopNav title="File Explorer" />

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
              <Button variant="default" onClick={() => setShowAddContext(true)} disabled={selectedFileCount === 0}>
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
                  selectedDirectory={selectedDirectory}
                  selectedFiles={selectedFiles}
                  onSelectFile={handleSelectFile}
                  onSelectAll={handleSelectAll}
                />
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <div className="flex-1 overflow-hidden">
              <AllFiles selectedFiles={selectedFiles} onSelectFile={handleSelectFile} onSelectAll={handleSelectAll} />
            </div>
          )}
        </>
      )}
    </>
  )
}
