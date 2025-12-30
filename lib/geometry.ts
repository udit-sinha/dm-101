// Geometry utilities for spatial selection (no external dependencies)

export interface LngLat {
    lng: number
    lat: number
}

export interface BBox {
    minLng: number
    minLat: number
    maxLng: number
    maxLat: number
}

// Check if a point is inside a bounding box (rectangle)
export function pointInBBox(point: LngLat, bbox: BBox): boolean {
    return (
        point.lng >= bbox.minLng &&
        point.lng <= bbox.maxLng &&
        point.lat >= bbox.minLat &&
        point.lat <= bbox.maxLat
    )
}

// Check if a point is inside a circle
export function pointInCircle(point: LngLat, center: LngLat, radiusKm: number): boolean {
    const distance = haversineDistance(point, center)
    return distance <= radiusKm
}

// Haversine formula to calculate distance between two points in km
export function haversineDistance(p1: LngLat, p2: LngLat): number {
    const R = 6371 // Earth's radius in km
    const dLat = toRad(p2.lat - p1.lat)
    const dLng = toRad(p2.lng - p1.lng)
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(p1.lat)) * Math.cos(toRad(p2.lat)) * Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180)
}

// Check if a point is inside a polygon using ray casting algorithm
export function pointInPolygon(point: LngLat, polygon: LngLat[]): boolean {
    if (polygon.length < 3) return false

    let inside = false
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].lng
        const yi = polygon[i].lat
        const xj = polygon[j].lng
        const yj = polygon[j].lat

        if (
            yi > point.lat !== yj > point.lat &&
            point.lng < ((xj - xi) * (point.lat - yi)) / (yj - yi) + xi
        ) {
            inside = !inside
        }
    }
    return inside
}

// Generate circle polygon for visualization
export function createCirclePolygon(center: LngLat, radiusKm: number, segments: number = 64): LngLat[] {
    const points: LngLat[] = []
    for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * 2 * Math.PI
        // Approximate: 1 degree lat ≈ 111km, 1 degree lng varies with latitude
        const latOffset = (radiusKm / 111) * Math.cos(angle)
        const lngOffset = (radiusKm / (111 * Math.cos(toRad(center.lat)))) * Math.sin(angle)
        points.push({
            lat: center.lat + latOffset,
            lng: center.lng + lngOffset,
        })
    }
    points.push(points[0]) // Close the polygon
    return points
}

// Convert polygon to GeoJSON
export function polygonToGeoJSON(polygon: LngLat[]): GeoJSON.Feature<GeoJSON.Polygon> {
    return {
        type: 'Feature',
        properties: {},
        geometry: {
            type: 'Polygon',
            coordinates: [polygon.map((p) => [p.lng, p.lat])],
        },
    }
}

// Convert bbox to polygon
export function bboxToPolygon(bbox: BBox): LngLat[] {
    return [
        { lng: bbox.minLng, lat: bbox.minLat },
        { lng: bbox.maxLng, lat: bbox.minLat },
        { lng: bbox.maxLng, lat: bbox.maxLat },
        { lng: bbox.minLng, lat: bbox.maxLat },
        { lng: bbox.minLng, lat: bbox.minLat }, // Close
    ]
}
