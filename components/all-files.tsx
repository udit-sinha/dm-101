"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, File, FileText, FileImage, FileCode, FileSpreadsheet, Search } from "lucide-react"

// Generate sample files for all directories
const generateAllSampleFiles = (count = 500) => {
  const fileTypes = ["doc", "pdf", "jpg", "png", "xlsx", "csv", "txt", "js", "html", "css"]
  const files = []

  const now = Date.now()
  const oneDay = 24 * 60 * 60 * 1000
  const oneWeek = 7 * oneDay
  const oneMonth = 30 * oneDay

  for (let i = 1; i <= count; i++) {
    const fileType = fileTypes[Math.floor(Math.random() * fileTypes.length)]
    // Random date within the last month
    const randomDate = new Date(now - Math.floor(Math.random() * oneMonth))

    files.push({
      id: `file-${i}`,
      name: `File ${i}.${fileType}`,
      type: fileType,
      size: `${Math.floor(Math.random() * 10000)}KB`,
      lastModified: randomDate,
      directory: `Directory ${Math.floor(Math.random() * 10) + 1}`,
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

type AllFilesProps = {
  selectedFiles: Record<string, boolean>
  onSelectFile: (fileId: string, isSelected: boolean) => void
  onSelectAll: (files: any[], isSelected: boolean) => void
}

export function AllFiles({ selectedFiles, onSelectFile, onSelectAll }: AllFilesProps) {
  const [allFiles, setAllFiles] = useState<any[]>([])
  const [filteredFiles, setFilteredFiles] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [selectAll, setSelectAll] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [timeFilter, setTimeFilter] = useState("all")

  const filesPerPage = 10

  useEffect(() => {
    // In a real app, you would fetch all files
    const files = generateAllSampleFiles()
    setAllFiles(files)
    setFilteredFiles(files)
  }, [])

  useEffect(() => {
    // Apply filters when search query or time filter changes
    let filtered = [...allFiles]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (file) =>
          file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          file.directory.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply time filter
    const now = Date.now()
    if (timeFilter === "1day") {
      filtered = filtered.filter((file) => now - file.lastModified.getTime() <= 24 * 60 * 60 * 1000)
    } else if (timeFilter === "1week") {
      filtered = filtered.filter((file) => now - file.lastModified.getTime() <= 7 * 24 * 60 * 60 * 1000)
    } else if (timeFilter === "1month") {
      filtered = filtered.filter((file) => now - file.lastModified.getTime() <= 30 * 24 * 60 * 60 * 1000)
    }

    setFilteredFiles(filtered)
    setCurrentPage(1)
  }, [searchQuery, timeFilter, allFiles])

  useEffect(() => {
    // Update selectAll checkbox based on whether all current files are selected
    if (currentFiles.length > 0) {
      const allSelected = currentFiles.every((file) => selectedFiles[file.id])
      setSelectAll(allSelected)
    } else {
      setSelectAll(false)
    }
  }, [selectedFiles, currentPage, filteredFiles])

  const totalPages = Math.ceil(filteredFiles.length / filesPerPage)
  const startIndex = (currentPage - 1) * filesPerPage
  const endIndex = startIndex + filesPerPage
  const currentFiles = filteredFiles.slice(startIndex, endIndex)

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked)
    onSelectAll(currentFiles, checked)
  }

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b flex flex-wrap gap-4 items-center shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files or directories..."
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
            <SelectItem value="1day">Last 1 Day</SelectItem>
            <SelectItem value="1week">Last 1 Week</SelectItem>
            <SelectItem value="1month">Last 1 Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              <TableHead className="w-12">
                <Checkbox checked={selectAll} onCheckedChange={handleSelectAll} aria-label="Select all files" />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Directory</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Last Modified</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentFiles.map((file) => (
              <TableRow key={file.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedFiles[file.id] || false}
                    onCheckedChange={(checked) => onSelectFile(file.id, !!checked)}
                    aria-label={`Select ${file.name}`}
                  />
                </TableCell>
                <TableCell className="flex items-center gap-2">
                  {getFileIcon(file.type)}
                  <span>{file.name}</span>
                </TableCell>
                <TableCell>{file.directory}</TableCell>
                <TableCell>{file.type.toUpperCase()}</TableCell>
                <TableCell>{file.size}</TableCell>
                <TableCell>
                  {file.lastModified.toLocaleDateString()}{" "}
                  {file.lastModified.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t flex items-center justify-between shrink-0">
        <div className="text-sm text-muted-foreground">
          {filteredFiles.length > 0
            ? `${startIndex + 1}-${Math.min(endIndex, filteredFiles.length)} of ${filteredFiles.length} files`
            : "No files found"}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            Page {currentPage} of {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="icon"
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

