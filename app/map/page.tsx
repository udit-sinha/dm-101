"use client"

import { MapView } from "@/components/map-view"
import { TopNav } from "@/components/top-nav"

export default function MapPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNav title="Map View" showSearch={false} />
      <div className="flex-1 overflow-hidden">
        <MapView />
      </div>
    </div>
  )
}

