"use client"

import { useState, useEffect } from "react"
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  ArrowLeft,
  FileText,
  FileImage,
  FileCode,
  FileSpreadsheet,
  File,
  Wand2,
  Eye,
  X,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Group files by type
const groupFilesByType = (selectedFiles: Record<string, boolean>) => {
  // In a real app, you would fetch the actual file data
  // For this demo, we'll generate sample files based on the selected IDs
  const fileTypes = ["doc", "pdf", "jpg", "png", "xlsx", "csv", "txt", "js", "html", "css"]
  const groupedFiles: Record<string, any[]> = {}

  // Initialize groups
  fileTypes.forEach((type) => {
    groupedFiles[type] = []
  })

  // Generate sample files for each selected file ID
  Object.keys(selectedFiles).forEach((fileId, index) => {
    if (selectedFiles[fileId]) {
      const fileType = fileTypes[index % fileTypes.length]
      const file = {
        id: fileId,
        name: `File ${index + 1}.${fileType}`,
        type: fileType,
        size: `${Math.floor(Math.random() * 10000)}KB`,
        lastModified: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
      }

      groupedFiles[fileType].push(file)
    }
  })

  // Remove empty groups
  Object.keys(groupedFiles).forEach((type) => {
    if (groupedFiles[type].length === 0) {
      delete groupedFiles[type]
    }
  })

  return groupedFiles
}

// Get icon based on file type
const getFileIcon = (fileType: string) => {
  switch (fileType) {
    case "doc":
    case "pdf":
    case "txt":
      return <FileText className="h-4 w-4 text-blue-500" />
    case "jpg":
    case "png":
      return <FileImage className="h-4 w-4 text-green-500" />
    case "js":
    case "html":
    case "css":
      return <FileCode className="h-4 w-4 text-yellow-500" />
    case "xlsx":
    case "csv":
      return <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
    default:
      return <File className="h-4 w-4 text-gray-500" />
  }
}

// Get friendly name for file type
const getFileTypeName = (fileType: string) => {
  switch (fileType) {
    case "doc":
      return "Word Documents"
    case "pdf":
      return "PDF Documents"
    case "txt":
      return "Text Files"
    case "jpg":
      return "Images"
    case "png":
      return "Images"
    case "xlsx":
      return "Spreadsheets"
    case "csv":
      return "Spreadsheets"
    case "js":
    case "html":
    case "css":
      return "Code Files"
    default:
      return `${fileType.toUpperCase()} Files`
  }
}

type AddContextProps = {
  selectedFiles: Record<string, boolean>
  onBack: () => void
}

export function AddContext({ selectedFiles, onBack }: AddContextProps) {
  const [groupedFiles, setGroupedFiles] = useState<Record<string, any[]>>({})
  const [selectedFileType, setSelectedFileType] = useState<string | null>(null)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [selectedFile, setSelectedFile] = useState<any | null>(null)
  const [showFileViewer, setShowFileViewer] = useState(false)
  const [isFileViewerExpanded, setIsFileViewerExpanded] = useState(false)
  const [panelSizes, setPanelSizes] = useState<number[]>([30, 70, 0])

  // Count total selected files
  const selectedFileCount = Object.values(selectedFiles).filter(Boolean).length

  useEffect(() => {
    const grouped = groupFilesByType(selectedFiles)
    setGroupedFiles(grouped)

    // Set the first file type as selected by default
    const fileTypes = Object.keys(grouped)
    if (fileTypes.length > 0 && !selectedFileType) {
      setSelectedFileType(fileTypes[0])
    }

    // Initialize all groups as expanded
    const initialExpandedState: Record<string, boolean> = {}
    fileTypes.forEach((type) => {
      initialExpandedState[type] = true
    })
    setExpandedGroups(initialExpandedState)
  }, [selectedFiles])

  const toggleGroup = (fileType: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [fileType]: !prev[fileType],
    }))
  }

  const handleSelectFileType = (fileType: string) => {
    setSelectedFileType(fileType)
  }

  const handleSelectFile = (file: any) => {
    setSelectedFile(file)
    setShowFileViewer(true)

    // Adjust panel sizes when file viewer is shown
    if (!showFileViewer) {
      setPanelSizes([27.5, 27.5, 45])
    }
  }

  const closeFileViewer = () => {
    setShowFileViewer(false)
    setPanelSizes([30, 70, 0])
    setIsFileViewerExpanded(false)
  }

  const toggleFileViewerExpansion = () => {
    if (isFileViewerExpanded) {
      // Collapse back to default size
      setPanelSizes([27.5, 27.5, 45])
      setIsFileViewerExpanded(false)
    } else {
      // Expand to larger size
      setPanelSizes([20, 20, 60])
      setIsFileViewerExpanded(true)
    }
  }

  // Get form fields based on file type
  const renderFormFields = () => {
    if (!selectedFileType) return null

    switch (selectedFileType) {
      case "doc":
      case "pdf":
      case "txt":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-title">Document Title</Label>
              <Input id="document-title" placeholder="Enter document title" />
            </div>
            <div>
              <Label htmlFor="document-author">Author</Label>
              <Input id="document-author" placeholder="Enter author name" />
            </div>
            <div>
              <Label htmlFor="document-summary">Summary</Label>
              <Textarea id="document-summary" placeholder="Enter document summary" rows={4} />
            </div>
            <div>
              <Label htmlFor="document-keywords">Keywords</Label>
              <Input id="document-keywords" placeholder="Enter keywords separated by commas" />
            </div>
          </div>
        )

      case "jpg":
      case "png":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="image-title">Image Title</Label>
              <Input id="image-title" placeholder="Enter image title" />
            </div>
            <div>
              <Label htmlFor="image-alt">Alt Text</Label>
              <Input id="image-alt" placeholder="Enter alternative text" />
            </div>
            <div>
              <Label htmlFor="image-description">Description</Label>
              <Textarea id="image-description" placeholder="Enter image description" rows={4} />
            </div>
            <div>
              <Label htmlFor="image-tags">Tags</Label>
              <Input id="image-tags" placeholder="Enter tags separated by commas" />
            </div>
          </div>
        )

      case "xlsx":
      case "csv":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="spreadsheet-title">Spreadsheet Title</Label>
              <Input id="spreadsheet-title" placeholder="Enter spreadsheet title" />
            </div>
            <div>
              <Label htmlFor="spreadsheet-description">Description</Label>
              <Textarea id="spreadsheet-description" placeholder="Enter spreadsheet description" rows={4} />
            </div>
            <div>
              <Label htmlFor="spreadsheet-columns">Column Descriptions</Label>
              <Textarea id="spreadsheet-columns" placeholder="Enter column descriptions" rows={4} />
            </div>
          </div>
        )

      case "js":
      case "html":
      case "css":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="code-title">Code Title</Label>
              <Input id="code-title" placeholder="Enter code title" />
            </div>
            <div>
              <Label htmlFor="code-language">Language</Label>
              <Input id="code-language" placeholder="Enter programming language" />
            </div>
            <div>
              <Label htmlFor="code-description">Description</Label>
              <Textarea id="code-description" placeholder="Enter code description" rows={4} />
            </div>
            <div>
              <Label htmlFor="code-dependencies">Dependencies</Label>
              <Input id="code-dependencies" placeholder="Enter dependencies" />
            </div>
          </div>
        )

      default:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-title">File Title</Label>
              <Input id="file-title" placeholder="Enter file title" />
            </div>
            <div>
              <Label htmlFor="file-description">Description</Label>
              <Textarea id="file-description" placeholder="Enter file description" rows={4} />
            </div>
          </div>
        )
    }
  }

  // Render file preview based on file type
  const renderFilePreview = () => {
    if (!selectedFile)
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">Select a file to preview</div>
      )

    switch (selectedFile.type) {
      case "jpg":
      case "png":
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium">Image Preview</h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={toggleFileViewerExpansion}>
                  {isFileViewerExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={closeFileViewer}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
              <div className="relative aspect-square w-full max-w-[300px] bg-background rounded-md flex items-center justify-center border">
                <FileImage className="h-16 w-16 text-muted-foreground/50" />
                <div className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm p-2 rounded text-xs truncate">
                  {selectedFile.name}
                </div>
              </div>
            </div>
          </div>
        )

      case "doc":
      case "pdf":
      case "txt":
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium">Document Preview</h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={toggleFileViewerExpansion}>
                  {isFileViewerExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={closeFileViewer}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 flex flex-col p-4 bg-muted/30">
              <div className="bg-background rounded-md border p-4 h-full flex flex-col">
                <div className="flex items-center gap-2 pb-2 border-b mb-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <div className="flex-1 overflow-auto">
                  <div className="space-y-2">
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                    <div className="h-3 bg-muted rounded w-4/6"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-3/6"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                    <div className="h-3 bg-muted rounded w-full"></div>
                    <div className="h-3 bg-muted rounded w-4/6"></div>
                    <div className="h-3 bg-muted rounded w-5/6"></div>
                    <div className="h-3 bg-muted rounded w-3/6"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case "xlsx":
      case "csv":
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium">Spreadsheet Preview</h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={toggleFileViewerExpansion}>
                  {isFileViewerExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={closeFileViewer}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 flex flex-col p-4 bg-muted/30">
              <div className="bg-background rounded-md border p-4 h-full flex flex-col">
                <div className="flex items-center gap-2 pb-2 border-b mb-2">
                  <FileSpreadsheet className="h-5 w-5 text-emerald-500" />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <div className="flex-1 overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="p-2 text-left bg-muted/50">#</th>
                        <th className="p-2 text-left bg-muted/50">Column A</th>
                        <th className="p-2 text-left bg-muted/50">Column B</th>
                        <th className="p-2 text-left bg-muted/50">Column C</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[1, 2, 3, 4, 5].map((row) => (
                        <tr key={row} className="border-b">
                          <td className="p-2 text-muted-foreground">{row}</td>
                          <td className="p-2">Data {row}-A</td>
                          <td className="p-2">Data {row}-B</td>
                          <td className="p-2">Data {row}-C</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )

      case "js":
      case "html":
      case "css":
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium">Code Preview</h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={toggleFileViewerExpansion}>
                  {isFileViewerExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={closeFileViewer}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 flex flex-col p-4 bg-muted/30">
              <div className="bg-background rounded-md border p-4 h-full flex flex-col">
                <div className="flex items-center gap-2 pb-2 border-b mb-2">
                  <FileCode className="h-5 w-5 text-yellow-500" />
                  <span className="font-medium">{selectedFile.name}</span>
                </div>
                <div className="flex-1 overflow-auto font-mono text-sm">
                  <pre className="text-muted-foreground">
                    {`// Sample ${selectedFile.type.toUpperCase()} code
function example() {
  const data = {
    name: "Example",
    value: 42
  };
  
  return data;
}

// More code would appear here
// This is just a preview`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="flex flex-col h-full">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-medium">File Preview</h3>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={toggleFileViewerExpansion}>
                  {isFileViewerExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </Button>
                <Button variant="ghost" size="icon" onClick={closeFileViewer}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center p-4 bg-muted/30">
              <div className="text-center">
                <File className="h-16 w-16 mx-auto text-muted-foreground/50" />
                <p className="mt-2 text-muted-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">Preview not available</p>
              </div>
            </div>
          </div>
        )
    }
  }

  return (
    <>
      <header className="flex h-14 shrink-0 items-center justify-between gap-4 border-b bg-background px-4 lg:h-[60px]">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Add Context</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">
            {selectedFileCount} file{selectedFileCount !== 1 ? "s" : ""} selected
          </span>
        </div>
      </header>

      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1"
        onLayout={(sizes) => {
          // Only update sizes if user is manually resizing
          if (showFileViewer && sizes[2] === 0) {
            return panelSizes
          }
          return sizes
        }}
      >
        <ResizablePanel defaultSize={panelSizes[0]} minSize={20}>
          <div className="h-full flex flex-col overflow-hidden border-r">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-medium">Files by Type</h2>
              <Button variant="outline" size="sm">
                <Wand2 className="h-4 w-4 mr-2" />
                Auto Detect
              </Button>
            </div>
            <div className="flex-1 overflow-auto p-2">
              {Object.keys(groupedFiles).length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No files selected
                </div>
              ) : (
                <div className="space-y-2">
                  {Object.entries(groupedFiles).map(([fileType, files]) => (
                    <Collapsible
                      key={fileType}
                      open={expandedGroups[fileType]}
                      onOpenChange={() => toggleGroup(fileType)}
                      className="border rounded-md overflow-hidden"
                    >
                      <CollapsibleTrigger
                        className={cn(
                          "flex items-center justify-between w-full p-2 hover:bg-muted/50",
                          selectedFileType === fileType && "bg-muted",
                        )}
                        onClick={() => handleSelectFileType(fileType)}
                      >
                        <div className="flex items-center gap-2">
                          {getFileIcon(fileType)}
                          <span>{getFileTypeName(fileType)}</span>
                        </div>
                        <Badge variant="outline">{files.length}</Badge>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="p-2 space-y-1 bg-muted/30">
                          {files.map((file) => (
                            <div
                              key={file.id}
                              className={cn(
                                "flex items-center gap-2 p-1 text-sm rounded hover:bg-muted/50 cursor-pointer",
                                selectedFile?.id === file.id && showFileViewer && "bg-muted",
                              )}
                              onClick={() => handleSelectFile(file)}
                            >
                              {getFileIcon(file.type)}
                              <span className="truncate">{file.name}</span>
                              {selectedFile?.id === file.id && showFileViewer && (
                                <Eye className="h-3.5 w-3.5 ml-auto text-muted-foreground" />
                              )}
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={panelSizes[1]} minSize={20}>
          <div className="h-full flex flex-col overflow-hidden">
            {selectedFileType ? (
              <>
                <div className="p-4 border-b">
                  <h2 className="font-medium">{getFileTypeName(selectedFileType)} Context</h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Add context information for {groupedFiles[selectedFileType]?.length}{" "}
                    {getFileTypeName(selectedFileType).toLowerCase()}
                  </p>
                </div>
                <div className="flex-1 overflow-auto p-6">{renderFormFields()}</div>
                <div className="p-4 border-t flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Load Data</Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a file type to add context
              </div>
            )}
          </div>
        </ResizablePanel>
        {showFileViewer && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={panelSizes[2]} minSize={30}>
              {renderFilePreview()}
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </>
  )
}
