"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/top-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Layout,
  Grid,
  List,
  Search,
  Plus,
  ArrowRight,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileImage,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Sample apps
const sampleApps = [
  {
    id: "app-1",
    name: "Document Editor",
    description: "Create and edit text documents",
    lastUpdated: "2 days ago",
    type: "document",
    color: "blue",
  },
  {
    id: "app-2",
    name: "Spreadsheet",
    description: "Work with data in rows and columns",
    lastUpdated: "1 week ago",
    type: "spreadsheet",
    color: "green",
  },
  {
    id: "app-3",
    name: "Image Editor",
    description: "Edit and enhance images",
    lastUpdated: "3 days ago",
    type: "image",
    color: "purple",
  },
  {
    id: "app-4",
    name: "Code Editor",
    description: "Write and debug code",
    lastUpdated: "12 hours ago",
    type: "code",
    color: "amber",
  },
  {
    id: "app-5",
    name: "Data Visualizer",
    description: "Create charts and visualizations",
    lastUpdated: "5 days ago",
    type: "data",
    color: "emerald",
  },
]

// Get color class based on app color
const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    amber: "bg-amber-100 text-amber-800",
    purple: "bg-purple-100 text-purple-800",
    emerald: "bg-emerald-100 text-emerald-800",
  }
  return colorMap[color] || "bg-gray-100 text-gray-800"
}

// Get icon background color class based on app color
const getIconBgClass = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    amber: "bg-amber-500",
    purple: "bg-purple-500",
    emerald: "bg-emerald-500",
  }
  return colorMap[color] || "bg-gray-500"
}

// Get app icon based on app type
const getAppIcon = (type: string) => {
  switch (type) {
    case "document":
      return <FileText className="h-5 w-5 text-white" />
    case "spreadsheet":
      return <FileSpreadsheet className="h-5 w-5 text-white" />
    case "image":
      return <FileImage className="h-5 w-5 text-white" />
    case "code":
      return <FileCode className="h-5 w-5 text-white" />
    default:
      return <Layout className="h-5 w-5 text-white" />
  }
}

export default function AppsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedApp, setSelectedApp] = useState<string | null>(null)

  // Filter apps based on search query
  const filteredApps = sampleApps.filter(
    (app) =>
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle app selection
  const handleSelectApp = (appId: string) => {
    setSelectedApp(appId)
  }

  // Get app name by ID
  const getAppName = (appId: string | null) => {
    if (!appId) return "All Apps"

    const app = sampleApps.find((a) => a.id === appId)
    return app ? app.name : "Unknown App"
  }

  return (
    <>
      {selectedApp ? (
        // Show app when selected
        <>
          <TopNav>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedApp(null)} className="mr-2">
                <ArrowRight className="h-4 w-4 rotate-180 mr-1" />
                Back
              </Button>
              <h1 className="text-lg font-semibold">{getAppName(selectedApp)}</h1>
            </div>
          </TopNav>
          
          <div className="flex-1 overflow-auto p-6">
            <div className="flex items-center justify-center h-full text-muted-foreground">
              App content for {getAppName(selectedApp)} will go here
            </div>
          </div>
        </>
      ) : (
        // Show app cards when no app is selected
        <>
          <TopNav title="Apps">
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                New App
              </Button>
            </div>
          </TopNav>

          <div className="p-4 border-b flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search apps..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 border rounded-md p-1">
              <Button
                variant={viewMode === "grid" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-4">
            {filteredApps.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Layout className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No apps found</h3>
                <p className="text-muted-foreground max-w-md">
                  We couldn't find any apps matching your search. Try adjusting your search terms or create a new
                  app.
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredApps.map((app) => (
                  <Card
                    key={app.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleSelectApp(app.id)}
                  >
                    <CardHeader className="pb-2">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-md flex items-center justify-center mb-2",
                          getIconBgClass(app.color),
                        )}
                      >
                        {getAppIcon(app.type)}
                      </div>
                      <CardTitle>{app.name}</CardTitle>
                      <CardDescription>{app.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      <div className="flex justify-between items-center">
                        <span>Last updated: {app.lastUpdated}</span>
                        <Badge variant="outline">{app.type}</Badge>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="ghost"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectApp(app.id)
                        }}
                      >
                        Open App
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredApps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleSelectApp(app.id)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-md flex items-center justify-center",
                          getIconBgClass(app.color),
                        )}
                      >
                        {getAppIcon(app.type)}
                      </div>
                      <div>
                        <h3 className="font-medium">{app.name}</h3>
                        <p className="text-sm text-muted-foreground">{app.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <Badge variant="outline">{app.type}</Badge>
                        <p className="text-xs text-muted-foreground mt-1">Updated {app.lastUpdated}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSelectApp(app.id)
                        }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </>
  )
}
