"use client"

import 'maplibre-gl/dist/maplibre-gl.css'
import { MapView } from "@/components/map-view"
import { TopNav } from "@/components/top-nav"

export default function MapPage() {
    return (
        <div className="flex flex-col h-full overflow-hidden">
            <TopNav title="Map View" showSearch={false} />
            <div className="flex-1 overflow-hidden">
                <MapView
                    center={[150.98, -27.27]}
                    zoom={8}
                />
            </div>
        </div>
    )
}

