"use client"

import { useState } from "react"
import { Folder, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

// Sample directory structure
const sampleDirectories = [
  {
    id: "dir-1",
    name: "Project Documents",
    children: [
      {
        id: "dir-1-1",
        name: "Technical Specifications",
        children: [],
      },
      {
        id: "dir-1-2",
        name: "User Guides",
        children: [],
      },
    ],
  },
  {
    id: "dir-2",
    name: "Marketing Materials",
    children: [
      {
        id: "dir-2-1",
        name: "Campaign Assets",
        children: [
          {
            id: "dir-2-1-1",
            name: "Q1 Campaign",
            children: [],
          },
          {
            id: "dir-2-1-2",
            name: "Q2 Campaign",
            children: [],
          },
        ],
      },
      {
        id: "dir-2-2",
        name: "Brand Guidelines",
        children: [],
      },
    ],
  },
  {
    id: "dir-3",
    name: "Financial Reports",
    children: [
      {
        id: "dir-3-1",
        name: "2023",
        children: [
          {
            id: "dir-3-1-1",
            name: "Q1",
            children: [],
          },
          {
            id: "dir-3-1-2",
            name: "Q2",
            children: [],
          },
          {
            id: "dir-3-1-3",
            name: "Q3",
            children: [],
          },
          {
            id: "dir-3-1-4",
            name: "Q4",
            children: [],
          },
        ],
      },
      {
        id: "dir-3-2",
        name: "2022",
        children: [],
      },
    ],
  },
  {
    id: "dir-4",
    name: "Human Resources",
    children: [
      {
        id: "dir-4-1",
        name: "Policies",
        children: [],
      },
      {
        id: "dir-4-2",
        name: "Employee Handbooks",
        children: [],
      },
    ],
  },
  {
    id: "dir-5",
    name: "Research and Development",
    children: [
      {
        id: "dir-5-1",
        name: "Prototypes",
        children: [],
      },
      {
        id: "dir-5-2",
        name: "Experiments",
        children: [],
      },
    ],
  },
]

type Directory = {
  id: string
  name: string
  children: Directory[]
}

type DirectoryTreeProps = {
  onSelectDirectory: (directoryId: string) => void
}

export function DirectoryTree({ onSelectDirectory }: DirectoryTreeProps) {
  const [expandedDirs, setExpandedDirs] = useState<Record<string, boolean>>({})
  const [selectedDir, setSelectedDir] = useState<string | null>(null)

  const toggleDir = (dirId: string) => {
    setExpandedDirs((prev) => ({
      ...prev,
      [dirId]: !prev[dirId],
    }))
  }

  const selectDirectory = (dirId: string) => {
    setSelectedDir(dirId)
    onSelectDirectory(dirId)
  }

  const renderDirectory = (directory: Directory, level = 0) => {
    const isExpanded = expandedDirs[directory.id] || false
    const isSelected = selectedDir === directory.id

    return (
      <div key={directory.id} className="select-none">
        <div
          className={cn(
            "flex items-center py-1 px-2 hover:bg-muted/50 rounded cursor-pointer text-foreground",
            isSelected && "bg-muted",
          )}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => selectDirectory(directory.id)}
        >
          <button
            className="mr-1 p-1 hover:bg-muted rounded-sm"
            onClick={(e) => {
              e.stopPropagation()
              toggleDir(directory.id)
            }}
          >
            <ChevronRight
              className={cn("h-4 w-4 text-muted-foreground transition-transform", isExpanded && "rotate-90")}
            />
          </button>
          <Folder className="h-4 w-4 text-muted-foreground mr-2" />
          <span className="text-sm truncate text-foreground">{directory.name}</span>
        </div>

        {isExpanded && directory.children.length > 0 && (
          <div className="pl-2">{directory.children.map((child) => renderDirectory(child, level + 1))}</div>
        )}
      </div>
    )
  }

  return (
    <div className="h-full overflow-auto border-r p-2">
      <div className="font-medium py-2 px-2 sticky top-0 bg-background z-10">Directories</div>
      <div className="mt-2">{sampleDirectories.map((dir) => renderDirectory(dir))}</div>
    </div>
  )
}

