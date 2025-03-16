"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronRight, Search, Database } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Generate sample data for a collection
const generateSampleData = (collectionId: string, count = 100) => {
  const data = []

  // Different schemas based on collection ID
  if (collectionId === "col-1") {
    // Customer Data
    for (let i = 1; i <= count; i++) {
      data.push({
        id: `${collectionId}-item-${i}`,
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        location: ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"][Math.floor(Math.random() * 5)],
        status: ["Active", "Inactive", "Pending"][Math.floor(Math.random() * 3)],
        lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString(),
      })
    }
  } else if (collectionId === "col-2") {
    // Product Catalog
    for (let i = 1; i <= count; i++) {
      data.push({
        id: `${collectionId}-item-${i}`,
        name: `Product ${i}`,
        category: ["Electronics", "Clothing", "Home", "Books", "Food"][Math.floor(Math.random() * 5)],
        price: `$${(Math.random() * 1000).toFixed(2)}`,
        stock: Math.floor(Math.random() * 1000),
        lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString(),
      })
    }
  } else if (collectionId === "col-3") {
    // Sales Transactions
    for (let i = 1; i <= count; i++) {
      data.push({
        id: `${collectionId}-item-${i}`,
        orderNumber: `ORD-${Math.floor(Math.random() * 10000)}`,
        customer: `Customer ${Math.floor(Math.random() * 100) + 1}`,
        amount: `$${(Math.random() * 10000).toFixed(2)}`,
        status: ["Completed", "Processing", "Refunded", "Cancelled"][Math.floor(Math.random() * 4)],
        date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString(),
      })
    }
  } else {
    // Generic data for other collections
    for (let i = 1; i <= count; i++) {
      data.push({
        id: `${collectionId}-item-${i}`,
        name: `Item ${i}`,
        type: ["Document", "Image", "Spreadsheet", "Code", "Other"][Math.floor(Math.random() * 5)],
        size: `${Math.floor(Math.random() * 10000)}KB`,
        lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString(),
      })
    }
  }

  return data
}

// Get collection name by ID
const getCollectionName = (collectionId: string | null) => {
  if (!collectionId) return ""

  const collections = {
    "col-1": "Customer Data",
    "col-2": "Product Catalog",
    "col-3": "Sales Transactions",
    "col-4": "Marketing Assets",
    "col-5": "Employee Records",
    "col-6": "Financial Reports",
    "col-7": "Research Data",
  }

  return collections[collectionId as keyof typeof collections] || "Unknown Collection"
}

type CollectionTableProps = {
  selectedCollection: string | null
}

export function CollectionTable({ selectedCollection }: CollectionTableProps) {
  const [data, setData] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [sortBy, setSortBy] = useState<string>("name")

  const itemsPerPage = 10

  useEffect(() => {
    if (selectedCollection) {
      // In a real app, you would fetch data for the selected collection
      setData(generateSampleData(selectedCollection))
      setCurrentPage(1)
      setSearchQuery("")
    } else {
      setData([])
    }
  }, [selectedCollection])

  useEffect(() => {
    // Apply search filter
    if (searchQuery) {
      const filtered = data.filter((item) =>
        Object.values(item).some(
          (value) => typeof value === "string" && value.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
      setFilteredData(filtered)
    } else {
      setFilteredData(data)
    }

    setCurrentPage(1)
  }, [searchQuery, data])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredData.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Get table headers based on the first item
  const getTableHeaders = () => {
    if (currentItems.length === 0) return []

    // Get all keys except 'id'
    return Object.keys(currentItems[0]).filter((key) => key !== "id")
  }

  if (!selectedCollection) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="text-center py-8">
          <Database className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-xl font-medium mb-2">Select a Collection</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Choose a data collection from the sidebar to view its contents and manage the data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-4 border-b shrink-0">
        <h2 className="text-lg font-medium">{getCollectionName(selectedCollection)}</h2>
        <p className="text-sm text-muted-foreground">{filteredData.length} items in collection</p>
      </div>

      <div className="p-4 border-b flex flex-wrap gap-4 items-center shrink-0">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search items..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            {getTableHeaders().map((header) => (
              <SelectItem key={header} value={header}>
                Sort by {header.charAt(0).toUpperCase() + header.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 bg-background">
            <TableRow>
              {getTableHeaders().map((header) => (
                <TableHead key={header} className="py-2 px-3 text-gray-700">
                  {header.charAt(0).toUpperCase() + header.slice(1)}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={getTableHeaders().length} className="h-32 text-center">
                  No items found
                </TableCell>
              </TableRow>
            ) : (
              currentItems.map((item) => (
                <TableRow key={item.id} className="h-10 transition-none">
                  {getTableHeaders().map((header) => (
                    <TableCell key={`${item.id}-${header}`} className="py-2 px-3 text-gray-700">
                      {item[header]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="p-4 border-t flex items-center justify-between shrink-0">
        <div className="text-sm text-muted-foreground">
          {filteredData.length > 0
            ? `${startIndex + 1}-${Math.min(endIndex, filteredData.length)} of ${filteredData.length} items`
            : "No items found"}
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

