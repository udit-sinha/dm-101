"use client"

import { useState } from "react"
import { Folder, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

// Sample collections
const sampleCollections = [
  {
    id: "col-1",
    name: "Customer Data",
    description: "Customer information and demographics",
    itemCount: 1245,
  },
  {
    id: "col-2",
    name: "Product Catalog",
    description: "Product information and metadata",
    itemCount: 532,
  },
  {
    id: "col-3",
    name: "Sales Transactions",
    description: "Sales and transaction records",
    itemCount: 8976,
  },
  {
    id: "col-4",
    name: "Marketing Assets",
    description: "Marketing materials and assets",
    itemCount: 342,
  },
  {
    id: "col-5",
    name: "Employee Records",
    description: "Employee information and records",
    itemCount: 187,
  },
  {
    id: "col-6",
    name: "Financial Reports",
    description: "Financial statements and reports",
    itemCount: 98,
  },
  {
    id: "col-7",
    name: "Research Data",
    description: "Research findings and data",
    itemCount: 456,
  },
]

type Collection = {
  id: string
  name: string
  description: string
  itemCount: number
}

type CollectionsListProps = {
  onSelectCollection: (collectionId: string) => void
  selectedCollection: string | null
}

export function CollectionsList({ onSelectCollection, selectedCollection }: CollectionsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [collections, setCollections] = useState<Collection[]>(sampleCollections)

  const filteredCollections = collections.filter(
    (collection) =>
      collection.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      collection.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="h-full flex flex-col overflow-hidden border-r">
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search collections..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2">
        <div className="font-medium py-2 px-2 sticky top-0 bg-background z-10">Collections</div>
        <div className="mt-2 space-y-1">
          {filteredCollections.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No collections found</div>
          ) : (
            filteredCollections.map((collection) => (
              <div
                key={collection.id}
                className={cn(
                  "flex items-center py-2 px-3 rounded cursor-pointer hover:bg-muted/50",
                  selectedCollection === collection.id && "bg-muted",
                )}
                onClick={() => onSelectCollection(collection.id)}
              >
                <Folder className="h-4 w-4 text-muted-foreground mr-2" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{collection.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{collection.description}</div>
                </div>
                <div className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                  {collection.itemCount.toLocaleString()} items
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

