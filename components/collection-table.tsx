"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Trash,
  Users,
  Edit,
  ArrowLeft,
  X,
  ChevronDown,
  Eye,
  Download,
  Share,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"

// Mock datasets
const datasets = [
  { id: "customers", name: "Customers" },
  { id: "orders", name: "Orders" },
  { id: "products", name: "Products" },
  { id: "inventory", name: "Inventory" },
  { id: "suppliers", name: "Suppliers" },
  { id: "shipments", name: "Shipments" },
  { id: "returns", name: "Returns" },
  { id: "analytics", name: "Analytics" },
]

// Mock data for demonstration
const locations = ["Houston", "Chicago", "New York", "Phoenix", "Los Angeles", "Miami", "Seattle"]
const statuses = ["Active", "Inactive", "Pending", "Suspended"]

// Filter types and operators
const filterOperators = {
  string: [
    { id: "equals", label: "Equals" },
    { id: "contains", label: "Contains" },
    { id: "startsWith", label: "Starts with" },
    { id: "endsWith", label: "Ends with" },
    { id: "isNull", label: "Is null" },
    { id: "isNotNull", label: "Is not null" },
  ],
  number: [
    { id: "equals", label: "Equals" },
    { id: "greaterThan", label: "Greater than" },
    { id: "lessThan", label: "Less than" },
    { id: "greaterThanOrEqual", label: "Greater than or equal" },
    { id: "lessThanOrEqual", label: "Less than or equal" },
    { id: "isNull", label: "Is null" },
    { id: "isNotNull", label: "Is not null" },
  ],
  date: [
    { id: "equals", label: "Equals" },
    { id: "before", label: "Before" },
    { id: "after", label: "After" },
    { id: "between", label: "Between" },
    { id: "isNull", label: "Is null" },
    { id: "isNotNull", label: "Is not null" },
  ],
}

// Generate sample data for a collection
const generateSampleData = (collectionId: string, count = 100) => {
  const data = []

  // Different schemas based on dataset type
  switch (collectionId) {
    case "customers":
      for (let i = 1; i <= count; i++) {
        data.push({
          id: `${collectionId}-${i}`,
          name: `Customer ${i}`,
          email: `customer${i}@example.com`,
          phone: `+1 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
          address: `${Math.floor(Math.random() * 9999) + 1} ${["Main", "Oak", "Maple", "Cedar", "Pine"][Math.floor(Math.random() * 5)]} ${["St", "Ave", "Rd", "Blvd", "Ln"][Math.floor(Math.random() * 5)]}`,
          city: locations[Math.floor(Math.random() * locations.length)],
          state: ["CA", "NY", "TX", "FL", "IL", "WA"][Math.floor(Math.random() * 6)],
          zipCode: `${Math.floor(Math.random() * 90000) + 10000}`,
          country: "United States",
          status: statuses[Math.floor(Math.random() * statuses.length)],
          accountType: ["Basic", "Premium", "Enterprise", "Trial"][Math.floor(Math.random() * 4)],
          registrationDate: new Date(Date.now() - Math.floor(Math.random() * 31536000000)).toLocaleDateString(),
          lastPurchase: `$${(Math.random() * 1000).toFixed(2)}`,
          totalSpent: `$${(Math.random() * 10000).toFixed(2)}`,
          orderCount: Math.floor(Math.random() * 50),
          lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString(),
        })
      }
      break
    case "orders":
      for (let i = 1; i <= count; i++) {
        data.push({
          id: `${collectionId}-${i}`,
          orderNumber: `ORD-${Math.floor(Math.random() * 10000)}`,
          customer: `Customer ${Math.floor(Math.random() * 100) + 1}`,
          amount: `$${(Math.random() * 10000).toFixed(2)}`,
          status: ["Completed", "Processing", "Refunded", "Cancelled"][Math.floor(Math.random() * 4)],
          date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString(),
        })
      }
      break
    // [Other cases remain the same...]
    default:
      for (let i = 1; i <= count; i++) {
        data.push({
          id: `${collectionId}-${i}`,
          name: `Item ${i}`,
          type: ["Document", "Image", "Spreadsheet", "Code", "Other"][Math.floor(Math.random() * 5)],
          size: `${Math.floor(Math.random() * 10000)}KB`,
          lastUpdated: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toLocaleDateString(),
        })
      }
  }

  return data
}

type CollectionTableProps = {
  selectedCollection: string | null
}

export function CollectionTable({ selectedCollection }: CollectionTableProps) {
  const [data, setData] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [showFilters, setShowFilters] = useState(true)
  const [advancedMode, setAdvancedMode] = useState(false)
  const [parentFilters, setParentFilters] = useState<any[]>([])
  const [childFilters, setChildFilters] = useState<Record<string, any[]>>({})
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  const [date, setDate] = useState<Date>()
  const [activeTab, setActiveTab] = useState("customers")
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const pageSizeOptions = [10, 20, 30, 50, 100]

  useEffect(() => {
    setData(generateSampleData(activeTab))
    setCurrentPage(1)
    setSearchQuery("")
  }, [activeTab])

  useEffect(() => {
    // Apply search filter and other filters
    let filtered = data

    if (searchQuery) {
      filtered = filtered.filter((item) =>
        Object.values(item).some(
          (value) => typeof value === "string" && value.toLowerCase().includes(searchQuery.toLowerCase()),
        ),
      )
    }

    // Apply location filters
    if (selectedLocations.length > 0) {
      filtered = filtered.filter((item) => selectedLocations.includes(item.location))
    }

    // Apply status filters
    if (selectedStatuses.length > 0) {
      filtered = filtered.filter((item) => selectedStatuses.includes(item.status))
    }

    // Apply date filter
    if (date) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.lastUpdated)
        return itemDate >= date
      })
    }

    setFilteredData(filtered)
    setCurrentPage(1)
  }, [searchQuery, data, selectedLocations, selectedStatuses, date])

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = filteredData.slice(startIndex, endIndex)

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // Toggle location selection
  const toggleLocation = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter((l) => l !== location))
    } else {
      setSelectedLocations([...selectedLocations, location])
    }
  }

  // Toggle status selection
  const toggleStatus = (status: string) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status))
    } else {
      setSelectedStatuses([...selectedStatuses, status])
    }
  }

  // Apply filter
  const applyFilter = () => {
    if (activeTab === "customers") {
      // Apply as parent filter
      const newParentFilters = []

      if (selectedLocations.length > 0) {
        newParentFilters.push({
          field: "location",
          operator: "in",
          value: selectedLocations,
          label: `Location: ${selectedLocations.join(", ")}`,
        })
      }

      if (selectedStatuses.length > 0) {
        newParentFilters.push({
          field: "status",
          operator: "in",
          value: selectedStatuses,
          label: `Status: ${selectedStatuses.join(", ")}`,
        })
      }

      if (date) {
        newParentFilters.push({
          field: "date",
          operator: "after",
          value: date,
          label: `Date after: ${format(date, "PP")}`,
        })
      }

      setParentFilters(newParentFilters)
    } else if (selectedCollection) {
      // Apply as child filter
      const newChildFilters = { ...childFilters }
      const tabFilters = []

      if (selectedLocations.length > 0) {
        tabFilters.push({
          field: "location",
          operator: "in",
          value: selectedLocations,
          label: `Location: ${selectedLocations.join(", ")}`,
        })
      }

      if (selectedStatuses.length > 0) {
        tabFilters.push({
          field: "status",
          operator: "in",
          value: selectedStatuses,
          label: `Status: ${selectedStatuses.join(", ")}`,
        })
      }

      if (date) {
        tabFilters.push({
          field: "date",
          operator: "after",
          value: date,
          label: `Date after: ${format(date, "PP")}`,
        })
      }

      newChildFilters[selectedCollection] = tabFilters
      setChildFilters(newChildFilters)
    }

    // Reset selections after applying
    setSelectedLocations([])
    setSelectedStatuses([])
    setDate(undefined)
  }

  // Remove filter
  const removeFilter = (isParent: boolean, index: number, collectionId?: string) => {
    if (isParent) {
      setParentFilters(parentFilters.filter((_, i) => i !== index))
    } else if (collectionId) {
      const newChildFilters = { ...childFilters }
      newChildFilters[collectionId] = childFilters[collectionId].filter((_, i) => i !== index)
      setChildFilters(newChildFilters)
    }
  }

  // Get table headers based on the first item
  const getTableHeaders = () => {
    if (currentItems.length === 0) return []
    return Object.keys(currentItems[0]).filter((key) => key !== "id")
  }

  return (
    <div className="flex flex-1 overflow-hidden h-[calc(100vh-56px)]">
      {/* Filter Panel */}
      {showFilters && (
        <div className="w-64 border-r flex flex-col h-full">
          <div className="p-4 border-b sticky top-0 bg-background z-10">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Filters</h3>
              <div className="flex items-center gap-2">
                <Label htmlFor="advanced-mode" className="text-xs">Advanced</Label>
                <Switch id="advanced-mode" checked={advancedMode} onCheckedChange={setAdvancedMode} />
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-4 space-y-4">
              {!advancedMode ? (
                // Simple filter mode
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                      {locations.map((location) => (
                        <div key={location} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`location-${location}`}
                            checked={selectedLocations.includes(location)}
                            onCheckedChange={() => toggleLocation(location)}
                          />
                          <Label htmlFor={`location-${location}`} className="text-sm font-normal cursor-pointer">
                            {location}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <div className="border rounded-md p-2 max-h-40 overflow-y-auto">
                      {statuses.map((status) => (
                        <div key={status} className="flex items-center space-x-2 py-1">
                          <Checkbox
                            id={`status-${status}`}
                            checked={selectedStatuses.includes(status)}
                            onCheckedChange={() => toggleStatus(status)}
                          />
                          <Label htmlFor={`status-${status}`} className="text-sm font-normal cursor-pointer">
                            {status}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          {date ? format(date, "PPP") : "Pick a date"}
                          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              ) : (
                // Advanced filter mode
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Field</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select field" />
                      </SelectTrigger>
                      <SelectContent>
                        {getTableHeaders().map((header) => (
                          <SelectItem key={header} value={header}>
                            {header.charAt(0).toUpperCase() + header.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Operator</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select operator" />
                      </SelectTrigger>
                      <SelectContent>
                        {filterOperators.string.map((op) => (
                          <SelectItem key={op.id} value={op.id}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Value</Label>
                    <Input placeholder="Enter value" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t bg-background sticky bottom-0">
            <Button onClick={applyFilter} className="w-full">Apply Filter</Button>
          </div>
        </div>
      )}

      {/* Right Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Tabs Container */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <div className="border-b px-2 py-1 bg-background sticky top-0 z-10">
            <TabsList className="h-8">
              {datasets.map((dataset) => (
                <TabsTrigger key={dataset.id} value={dataset.id} className="px-4 relative">
                  {dataset.name}
                  {childFilters[dataset.id]?.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1 absolute -top-1 -right-1">
                      {childFilters[dataset.id].length}
                    </Badge>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {datasets.map((dataset) => (
              <TabsContent
                key={dataset.id}
                value={dataset.id}
                className="flex-1 p-0 data-[state=active]:flex data-[state=active]:flex-col h-full"
              >
                {/* Filter Chips */}
                <div className="px-2 pt-0 pb-2 flex flex-col gap-2 border-b sticky top-0 bg-background z-10">
                  <div className="flex flex-wrap gap-2">
                    {/* Parent filters */}
                    {parentFilters.map((filter, index) => (
                      <Badge key={`parent-${index}`} variant="outline" className="flex items-center gap-1 h-7 py-1">
                        <span className="text-xs font-medium text-muted-foreground mr-1">Parent:</span>
                        {filter.label}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removeFilter(true, index)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}

                    {/* Child filters */}
                    {selectedCollection && childFilters[selectedCollection]?.map((filter, index) => (
                      <Badge key={`child-${index}`} variant="secondary" className="flex items-center gap-1 h-7 py-1">
                        {filter.label}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removeFilter(false, index, selectedCollection)}
                        >
                          <X className="h-3 w-3" />
                          <span className="sr-only">Remove</span>
                        </Button>
                      </Badge>
                    ))}
                  </div>

                  {/* Actions Section */}
                  <div className="flex items-center justify-between">
                    <div className="flex-grow flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add Filter
                      </Button>
                    </div>

                    {/* Actions Section */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center border rounded-md bg-muted/20 p-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Plus className="h-4 w-4" />
                          <span className="sr-only">Add</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-2" />
                            Viewers
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Share className="h-4 w-4 mr-2" />
                            Share View
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>

                {/* Table Container */}
                <div className="flex-1 flex flex-col min-h-0">
                  {/* Table Scroll Area */}
                  <div className="flex-1 overflow-auto">
                    <Table className="min-w-max">
                      <TableHeader className="sticky top-0 bg-background z-10">
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
                            <TableRow key={item.id} className="h-10 transition-none hover:bg-muted/50">
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

                  {/* Footer */}
                  <div className="border-t bg-background sticky bottom-0 z-10">
                    <div className="flex items-center justify-between px-2 py-3">
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">
                          {filteredData.length > 0
                            ? `${startIndex + 1}-${Math.min(endIndex, filteredData.length)} of ${filteredData.length} items`
                            : "No items"}
                        </div>
                        <Select 
                          value={itemsPerPage.toString()} 
                          onValueChange={(value) => {
                            setItemsPerPage(Number(value))
                            setCurrentPage(1)
                          }}
                        >
                          <SelectTrigger className="h-8 w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {pageSizeOptions.map((size) => (
                              <SelectItem key={size} value={size.toString()}>
                                {size} rows
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-3 w-3" />
                          <span className="sr-only">Previous page</span>
                        </Button>
                        <div className="text-xs">Page {currentPage} of {totalPages || 1}</div>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages || totalPages === 0}
                        >
                          <ChevronRight className="h-3 w-3" />
                          <span className="sr-only">Next page</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </div>
        </Tabs>
      </div>
    </div>
  )
}
