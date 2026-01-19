'use client'

import React, { useEffect, useRef } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

interface MapViewProps {
    visitedSegments?: any[] // GeoJSON or array of segment IDs
    allSegments?: any[]     // GeoJSON of the road network
}

export default function MapView({ visitedSegments, allSegments }: MapViewProps) {
    const mapContainer = useRef<HTMLDivElement>(null)
    const map = useRef<mapboxgl.Map | null>(null)

    useEffect(() => {
        if (map.current || !mapContainer.current) return

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/dark-v11',
            center: [-122.671, 45.631], // Vancouver, WA (Clark County)
            zoom: 11,
            pitch: 45,
        })

        map.current.on('load', () => {
            // Add source for all roads (unvisited) - Blue/Red
            map.current?.addSource('all-roads', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] } // Will be filled
            })

            map.current?.addLayer({
                id: 'all-roads-layer',
                type: 'line',
                source: 'all-roads',
                paint: {
                    'line-color': '#1e40af', // Deep Blue
                    'line-width': 1.5,
                    'line-opacity': 0.6
                }
            })

            // Add source for visited roads - Gold
            map.current?.addSource('visited-roads', {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] } // Will be filled
            })

            map.current?.addLayer({
                id: 'visited-roads-layer',
                type: 'line',
                source: 'visited-roads',
                paint: {
                    'line-color': '#fbbf24', // Gold
                    'line-width': 3,
                    'line-opacity': 0.9,
                    'line-blur': 0.5
                }
            })
        })

        return () => map.current?.remove()
    }, [])

    return (
        <div className="w-full h-[600px] rounded-2xl overflow-hidden glass-card relative border border-white/10">
            <div ref={mapContainer} className="absolute inset-0" />
            <div className="absolute bottom-4 left-4 glass-card p-4 text-sm z-10 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-visited rounded-full" />
                    <span>Visited Miles</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-4 bg-unvisited rounded-full" />
                    <span>Unexplored</span>
                </div>
            </div>
        </div>
    )
}
