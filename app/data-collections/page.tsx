"use client"

import { useState, useEffect } from "react"
import { CollectionTable } from "@/components/collection-table"
import { useSearchParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Database, Grid, List, Search, ArrowRight, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { TopNav } from "@/components/top-nav"

// Sample collections
const sampleCollections = [
  {
    id: "col-1",
    name: "Customer Data",
    description: "Customer information and demographics",
    itemCount: 1245,
    lastUpdated: "2 days ago",
    color: "blue",
  },
  {
    id: "col-2",
    name: "Product Catalog",
    description: "Product information and metadata",
    itemCount: 532,
    lastUpdated: "1 week ago",
    color: "green",
  },
  {
    id: "col-3",
    name: "Sales Transactions",
    description: "Sales and transaction records",
    itemCount: 8976,
    lastUpdated: "3 hours ago",
    color: "amber",
  },
  {
    id: "col-4",
    name: "Marketing Assets",
    description: "Marketing materials and assets",
    itemCount: 342,
    lastUpdated: "5 days ago",
    color: "purple",
  },
  {
    id: "col-5",
    name: "Employee Records",
    description: "Employee information and records",
    itemCount: 187,
    lastUpdated: "2 weeks ago",
    color: "rose",
  },
  {
    id: "col-6",
    name: "Financial Reports",
    description: "Financial statements and reports",
    itemCount: 98,
    lastUpdated: "1 day ago",
    color: "emerald",
  },
  {
    id: "col-7",
    name: "Research Data",
    description: "Research findings and data",
    itemCount: 456,
    lastUpdated: "3 days ago",
    color: "indigo",
  },
]

// Get color class based on collection color
const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-100 text-blue-800",
    green: "bg-green-100 text-green-800",
    amber: "bg-amber-100 text-amber-800",
    purple: "bg-purple-100 text-purple-800",
    rose: "bg-rose-100 text-rose-800",
    emerald: "bg-emerald-100 text-emerald-800",
    indigo: "bg-indigo-100 text-indigo-800",
  }
  return colorMap[color] || "bg-gray-100 text-gray-800"
}

// Get icon background color class based on collection color
const getIconBgClass = (color: string) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    amber: "bg-amber-500",
    purple: "bg-purple-500",
    rose: "bg-rose-500",
    emerald: "bg-emerald-500",
    indigo: "bg-indigo-500",
  }
  return colorMap[color] || "bg-gray-500"
}

export default function DataCollectionsPage() {
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get collection from URL query parameter
  useEffect(() => {
    const collection = searchParams.get("collection")
    if (collection) {
      setSelectedCollection(collection)
    }
  }, [searchParams])

  // Filter collections based on search query
  const filteredCollections = sampleCollections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle collection selection
  const handleSelectCollection = (collectionId: string) => {
    setSelectedCollection(collectionId)
    router.push(`/data-collections?collection=${collectionId}`)
  }

  // Get collection name by ID
  const getCollectionName = (collectionId: string | null) => {
    if (!collectionId) return "All Collections"

    const collection = sampleCollections.find((c) => c.id === collectionId)
    return collection ? collection.name : "Unknown Collection"
  }

  return (
    <>
      {selectedCollection ? (
        <>
          <TopNav showSearch={false}>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedCollection(null)} className="mr-2">
                <ArrowRight className="h-4 w-4 rotate-180 mr-1" />
                Back
              </Button>
              <h1 className="text-lg font-semibold">{getCollectionName(selectedCollection)}</h1>
            </div>
          </TopNav>
          
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-auto">
              <CollectionTable selectedCollection={selectedCollection} />
            </div>
          </div>
        </>
      ) : (
        <>
          <TopNav title="Data Collections" showSearch={false}>
            <div className="flex items-center gap-2">
              <Button size="sm" className="gap-1">
                <Plus className="h-4 w-4" />
                New Collection
              </Button>
            </div>
          </TopNav>

          <div className="p-4 border-b flex flex-wrap gap-4 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search collections..."
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
              {filteredCollections.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                  <Database className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No collections found</h3>
                  <p className="text-muted-foreground max-w-md">
                    We couldn't find any collections matching your search. Try adjusting your search terms or create a
                    new collection.
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {filteredCollections.map((collection) => (
                    <Card
                      key={collection.id}
                      className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => handleSelectCollection(collection.id)}
                    >
                      <CardHeader className="pb-2">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-md flex items-center justify-center mb-2",
                            getIconBgClass(collection.color),
                          )}
                        >
                          <Database className="h-5 w-5 text-white" />
                        </div>
                        <CardTitle>{collection.name}</CardTitle>
                        <CardDescription>{collection.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="text-sm text-muted-foreground">
                        <div className="flex justify-between items-center">
                          <span>Last updated: {collection.lastUpdated}</span>
                          <Badge variant="outline">{collection.itemCount.toLocaleString()} items</Badge>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button
                          variant="ghost"
                          className="w-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectCollection(collection.id)
                          }}
                        >
                          View Collection
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredCollections.map((collection) => (
                    <div
                      key={collection.id}
                      className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                      onClick={() => handleSelectCollection(collection.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-10 h-10 rounded-md flex items-center justify-center",
                            getIconBgClass(collection.color),
                          )}
                        >
                          <Database className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">{collection.name}</h3>
                          <p className="text-sm text-muted-foreground">{collection.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <Badge variant="outline">{collection.itemCount.toLocaleString()} items</Badge>
                          <p className="text-xs text-muted-foreground mt-1">Updated {collection.lastUpdated}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectCollection(collection.id)
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
