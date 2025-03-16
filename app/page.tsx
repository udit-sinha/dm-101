"use client"

import { useState } from "react"
import { TopNav } from "@/components/top-nav"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Database,
  Layout,
  ArrowRight,
  Star,
  Clock,
  Bell,
  FileText,
  PieChart,
  FileSpreadsheet,
  Pin,
  ChevronRight,
  BarChart,
  FileImage,
  Activity,
  FolderOpen,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Sample favorites data
const favoritesData = [
  {
    id: "dash-1",
    name: "Sales Overview",
    type: "dashboard",
    icon: <BarChart className="h-4 w-4" />,
    color: "blue",
    lastAccessed: "2 hours ago",
  },
  {
    id: "col-3",
    name: "Sales Transactions",
    type: "collection",
    icon: <Database className="h-4 w-4" />,
    color: "amber",
    lastAccessed: "Yesterday",
  },
  {
    id: "app-2",
    name: "Spreadsheet",
    type: "app",
    icon: <FileSpreadsheet className="h-4 w-4" />,
    color: "green",
    lastAccessed: "3 days ago",
  },
  {
    id: "dash-2",
    name: "Customer Analytics",
    type: "dashboard",
    icon: <PieChart className="h-4 w-4" />,
    color: "purple",
    lastAccessed: "1 week ago",
  },
  {
    id: "app-3",
    name: "Image Editor",
    type: "app",
    icon: <FileImage className="h-4 w-4" />,
    color: "purple",
    lastAccessed: "2 days ago",
  },
]

// Sample recent activity data
const recentActivityData = [
  {
    id: "activity-1",
    type: "update",
    item: "Customer Data",
    itemType: "collection",
    user: "Alex Johnson",
    userAvatar: "/placeholder.svg?height=32&width=32",
    time: "10 minutes ago",
    description: "Updated 15 customer records",
  },
  {
    id: "activity-2",
    type: "create",
    item: "Q1 Financial Report",
    itemType: "dashboard",
    user: "Maria Garcia",
    userAvatar: "/placeholder.svg?height=32&width=32",
    time: "2 hours ago",
    description: "Created a new dashboard",
  },
  {
    id: "activity-3",
    type: "share",
    item: "Marketing Assets",
    itemType: "collection",
    user: "John Smith",
    userAvatar: "/placeholder.svg?height=32&width=32",
    time: "Yesterday",
    description: "Shared with Marketing team",
  },
  {
    id: "activity-4",
    type: "comment",
    item: "Product Catalog",
    itemType: "collection",
    user: "Sarah Lee",
    userAvatar: "/placeholder.svg?height=32&width=32",
    time: "2 days ago",
    description: "Added a comment on product data",
  },
  {
    id: "activity-5",
    type: "delete",
    item: "Outdated Reports",
    itemType: "dashboard",
    user: "David Wilson",
    userAvatar: "/placeholder.svg?height=32&width=32",
    time: "3 days ago",
    description: "Removed 3 outdated reports",
  },
]

// Get color class based on item color
const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500 text-white",
    green: "bg-green-500 text-white",
    amber: "bg-amber-500 text-white",
    purple: "bg-purple-500 text-white",
    emerald: "bg-emerald-500 text-white",
  }
  return colorMap[color] || "bg-gray-500 text-white"
}

// Get icon for activity type
const getActivityIcon = (type: string) => {
  switch (type) {
    case "update":
      return <Activity className="h-4 w-4" />
    case "create":
      return <FileText className="h-4 w-4" />
    case "share":
      return <ArrowRight className="h-4 w-4" />
    case "comment":
      return <Bell className="h-4 w-4" />
    case "delete":
      return <Database className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

export default function HomePage() {
  const router = useRouter()

  const navigateTo = (path: string) => {
    router.push(path, { scroll: false })
  }

  const getItemPath = (item: (typeof favoritesData)[0]) => {
    switch (item.type) {
      case "dashboard":
        return `/dashboards?dashboard=${item.id}`
      case "collection":
        return `/data-collections?collection=${item.id}`
      case "app":
        return `/apps?app=${item.id}`
      default:
        return "/"
    }
  }

  return (
    <>
      <TopNav title="Home" />

      <div className="flex-1 overflow-auto p-6">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            {/* Favorites Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Star className="h-5 w-5 mr-2 text-amber-500" />
                  Favorites
                </h2>
                <Button variant="ghost" size="sm" className="text-sm">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {favoritesData.map((item) => (
                  <Card
                    key={item.id}
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigateTo(getItemPath(item))}
                  >
                    <CardHeader className="p-4 pb-2">
                      <div className="flex justify-between items-start">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center",
                            getColorClass(item.color),
                          )}
                        >
                          {item.icon}
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Pin className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <h3 className="font-medium truncate">{item.name}</h3>
                      <div className="flex justify-between items-center mt-1">
                        <Badge variant="outline" className="text-xs">
                          {item.type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.lastAccessed}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Quick Access Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Quick Access</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-4">
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="bg-primary/10 w-10 h-10 rounded-md flex items-center justify-center mb-2">
                      <BarChart3 className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Dashboards</CardTitle>
                    <CardDescription>View and analyze your data</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigateTo("/dashboards")}>
                      View Dashboards
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="bg-primary/10 w-10 h-10 rounded-md flex items-center justify-center mb-2">
                      <Database className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Data Collections</CardTitle>
                    <CardDescription>Browse your data collections</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigateTo("/data-collections")}>
                      Browse Collections
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="bg-primary/10 w-10 h-10 rounded-md flex items-center justify-center mb-2">
                      <Layout className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>Apps</CardTitle>
                    <CardDescription>Access your applications</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigateTo("/apps")}>
                      Open Apps
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>

                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="bg-primary/10 w-10 h-10 rounded-md flex items-center justify-center mb-2">
                      <FolderOpen className="h-5 w-5 text-primary" />
                    </div>
                    <CardTitle>File Explorer</CardTitle>
                    <CardDescription>Browse and manage files</CardDescription>
                  </CardHeader>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => navigateTo("/file-explorer")}>
                      Open Explorer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>
          </div>

          {/* Recent Activity Section */}
          <div className="md:col-span-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Recent Activity
              </h2>
              <Button variant="ghost" size="sm" className="text-sm">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <Tabs defaultValue="all" className="w-full">
                  <div className="px-4 pt-4">
                    <TabsList className="w-full">
                      <TabsTrigger value="all" className="flex-1">
                        All
                      </TabsTrigger>
                      <TabsTrigger value="mentions" className="flex-1">
                        Mentions
                      </TabsTrigger>
                      <TabsTrigger value="updates" className="flex-1">
                        Updates
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="all" className="mt-0">
                    <div className="divide-y">
                      {recentActivityData.map((activity) => (
                        <div key={activity.id} className="p-4 hover:bg-muted/50 cursor-pointer">
                          <div className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={activity.userAvatar} alt={activity.user} />
                              <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-1">
                              <p className="text-sm">
                                <span className="font-medium">{activity.user}</span> {activity.description} in{" "}
                                <span className="font-medium">{activity.item}</span>
                              </p>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <span>{activity.time}</span>
                                <span className="mx-1">•</span>
                                <Badge variant="outline" className="text-xs">
                                  {activity.itemType}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="mentions" className="mt-0">
                    <div className="p-8 text-center text-muted-foreground">No mentions to display</div>
                  </TabsContent>

                  <TabsContent value="updates" className="mt-0">
                    <div className="p-8 text-center text-muted-foreground">No updates to display</div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  )
}
