"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, File, FileText, FileImage, FileCode, FileSpreadsheet } from "lucide-react"
import { cn } from "@/lib/utils"

// Generate sample files for a directory
const generateSampleFiles = (directoryId: string, count = 100) => {
  const fileTypes = ["doc", "pdf", "jpg", "png", "xlsx", "csv", "txt", "js", "html", "css"]
  const files = []

  for (let i = 1; i <= count; i++) {
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)]
    files.push({
      id: `${directoryId}-file-${i}`,
      name: `File ${i}.${fileType}`,
      type: fileType,
      size: `${Math.floor(Math.random() * 10000)}KB`,
      lastModified: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString(),
    })
  }

  return files
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

type FileListProps = {
  selectedDirectory: string | null
  selectedFiles: Record<string, boolean>
  onSelectFile: (fileId: string, isSelected: boolean) => void
  onSelectAll: (files: any[], isSelected: boolean) => void
}

export function FileList({ selectedDirectory, selectedFiles, onSelectFile, onSelectAll }: FileListProps) {
  const [files, setFiles] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectAll, setSelectAll] = useState(false)
  const filesPerPage = 10

  useEffect(() => {
    if (selectedDirectory) {
      // In a real app, you would fetch files for the selected directory
      setFiles(generateSampleFiles(selectedDirectory))
      setCurrentPage(1)
      setSelectAll(false)
    } else {
      setFiles([])
    }
  }, [selectedDirectory])

  useEffect(() => {
    // Update selectAll checkbox based on whether all current files are selected
    if (currentFiles.length > 0) {
      const allSelected = currentFiles.every((file) => selectedFiles[file.id])
      setSelectAll(allSelected)
    } else {
      setSelectAll(false)
    }
  }, [selectedFiles, currentPage, files])

  const totalPages = Math.ceil(files.length / filesPerPage)
  const startIndex = (currentPage - 1) * filesPerPage
  const endIndex = startIndex + filesPerPage
  const currentFiles = files.slice(startIndex, endIndex)

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    onSelectAll(currentFiles, checked)
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  if (!selectedDirectory) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        Select a directory to view files
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b shrink-0">
        <h2 className="text-lg font-medium">Files</h2>
        <p className="text-sm text-muted-foreground">{files.length} files in selected directory</p>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow className="h-10">
              <TableHead className="w-12 py-2 px-3 text-gray-700">
                <div className="flex items-center justify-center h-5 w-5">
                  <Checkbox
                    checked={selectAll}
                    onCheckedChange={handleSelectAll}
                    aria-label="Select all files"
                    className="h-4 w-4 data-[state=checked]:h-4 data-[state=checked]:w-4"
                  />
                </div>
              </TableHead>
              <TableHead className="py-2 px-3 text-gray-700">Name</TableHead>
              <TableHead className="py-2 px-3 text-gray-700">Type</TableHead>
              <TableHead className="py-2 px-3 text-gray-700">Size</TableHead>
              <TableHead className="py-2 px-3 text-gray-700">Last Modified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentFiles.map((file) => (
              <TableRow key={file.id} className={cn("h-10 transition-none")}>
                <TableCell className="py-2 px-3">
                  <div className="flex items-center justify-center h-5 w-5">
                    <Checkbox
                      checked={selectedFiles[file.id] || false}
                      onCheckedChange={(checked) => onSelectFile(file.id, !!checked)}
                      aria-label={`Select ${file.name}`}
                      className="h-4 w-4 data-[state=checked]:h-4 data-[state=checked]:w-4"
                    />
                  </div>
                </TableCell>
                <TableCell className="flex items-center gap-2 py-2 px-3 text-gray-700 h-10">
                  {getFileIcon(file.type)}
                  <span>{file.name}</span>
                </TableCell>
                <TableCell className="py-2 px-3 text-gray-700">{file.type.toUpperCase()}</TableCell>
                <TableCell className="py-2 px-3 text-gray-700">{file.size}</TableCell>
                <TableCell className="py-2 px-3 text-gray-700">{file.lastModified}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t flex items-center justify-between shrink-0">
        <div className="text-sm text-muted-foreground">
          {startIndex + 1}-{Math.min(endIndex, files.length)} of {files.length} files
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

