"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { TopNav } from "@/components/top-nav"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { BarChart3, Grid, List, Search, Plus, ArrowRight, PieChart, LineChart, BarChart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Sample dashboards
const sampleDashboards = [
  {
    id: "dash-1",
    name: "Sales Overview",
    description: "Key sales metrics and performance indicators",
    lastUpdated: "1 day ago",
    type: "bar",
    color: "blue",
  },
  {
    id: "dash-2",
    name: "Customer Analytics",
    description: "Customer behavior and demographic analysis",
    lastUpdated: "3 days ago",
    type: "pie",
    color: "purple",
  },
  {
    id: "dash-3",
    name: "Inventory Status",
    description: "Current inventory levels and stock alerts",
    lastUpdated: "12 hours ago",
    type: "bar",
    color: "amber",
  },
  {
    id: "dash-4",
    name: "Marketing Performance",
    description: "Campaign effectiveness and ROI tracking",
    lastUpdated: "2 days ago",
    type: "line",
    color: "green",
  },
  {
    id: "dash-5",
    name: "Financial Summary",
    description: "Revenue, expenses, and profit analysis",
    lastUpdated: "1 week ago",
    type: "bar",
    color: "emerald",
  },
]

// Get color class based on dashboard color
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

// Get icon background color class based on dashboard color
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

// Get chart icon based on dashboard type
const getChartIcon = (type: string) => {
  switch (type) {
    case "bar":
      return <BarChart className="h-5 w-5 text-white" />
    case "pie":
      return <PieChart className="h-5 w-5 text-white" />
    case "line":
      return <LineChart className="h-5 w-5 text-white" />
    default:
      return <BarChart3 className="h-5 w-5 text-white" />
  }
}

export default function DashboardsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null)

  // Filter dashboards based on search query
  const filteredDashboards = sampleDashboards.filter(
    (dashboard) =>
      dashboard.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dashboard.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle dashboard selection
  const handleSelectDashboard = (dashboardId: string) => {
    setSelectedDashboard(dashboardId)
  }

  // Get dashboard name by ID
  const getDashboardName = (dashboardId: string | null) => {
    if (!dashboardId) return "All Dashboards"

    const dashboard = sampleDashboards.find((d) => d.id === dashboardId)
    return dashboard ? dashboard.name : "Unknown Dashboard"
  }

  return (
    <>
      {selectedDashboard ? (
        <>
          <TopNav>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedDashboard(null)} className="mr-2">
                <ArrowRight className="h-4 w-4 rotate-180 mr-1" />
                Back
              </Button>
              <h1 className="text-lg font-semibold">{getDashboardName(selectedDashboard)}</h1>
            </div>
          </TopNav>
          
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-auto p-6">
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Dashboard content for {getDashboardName(selectedDashboard)} will go here
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <TopNav title="Dashboards">
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                New Dashboard
              </Button>
            </div>
          </TopNav>

          <div className="p-4 border-b flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search dashboards..."
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

          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-auto p-4">
              {filteredDashboards.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No dashboards found</h3>
                  <p className="text-muted-foreground max-w-md">
                    We couldn't find any dashboards matching your search. Try adjusting your search terms or create a
                    new dashboard.
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredDashboards.map((dashboard) => (
                    <Card
                      key={dashboard.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleSelectDashboard(dashboard.id)}
                    >
                      <CardHeader className="pb-2">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-md flex items-center justify-center mb-2",
                            getIconBgClass(dashboard.color),
                          )}
                        >
                          {getChartIcon(dashboard.type)}
                        </div>
                        <CardTitle>{dashboard.name}</CardTitle>
                        <CardDescription>{dashboard.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <div className="flex justify-between items-center">
                          <span>Last updated: {dashboard.lastUpdated}</span>
                          <Badge variant="outline">{dashboard.type} chart</Badge>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectDashboard(dashboard.id)
                          }}
                        >
                          View Dashboard
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredDashboards.map((dashboard) => (
                    <div
                      key={dashboard.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleSelectDashboard(dashboard.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-md flex items-center justify-center",
                            getIconBgClass(dashboard.color),
                          )}
                        >
                          {getChartIcon(dashboard.type)}
                        </div>
                        <div>
                          <h3 className="font-medium">{dashboard.name}</h3>
                          <p className="text-sm text-muted-foreground">{dashboard.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant="outline">{dashboard.type} chart</Badge>
                          <p className="text-xs text-muted-foreground mt-1">Updated {dashboard.lastUpdated}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectDashboard(dashboard.id)
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
          </div>
        </>
      )}
    </>
  )
}
