import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    // Query for trails in Clark County, WA (Relation ID: 1790432)
    const query = `
    [out:json][timeout:180];
    area(3601790432)->.searchArea;
    (
      way["highway"~"path|footway|track|bridleway"]["access"!~"no"]["private"!~"yes"](area.searchArea);
    );
    out geom;
  `

    const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`

    try {
        const response = await fetch(overpassUrl)
        const data = await response.json()

        if (!data.elements) {
            return NextResponse.json({ error: 'No elements found in OSM data' }, { status: 400 })
        }

        const segments = []

        for (const way of data.elements) {
            if (way.type === 'way' && way.geometry) {
                // Simple segmentation: Each way is a segment for now
                // In a more advanced version, we'd split at intersections
                const coords = way.geometry.map((p: any) => `[${p.lon}, ${p.lat}]`).join(',')
                const lineString = `LINESTRING(${way.geometry.map((p: any) => `${p.lon} ${p.lat}`).join(',')})`

                // Calculate length using a simple sphere distance or let PostGIS do it
                // We'll store it as a WKT for PostGIS to ingest
                segments.push({
                    id: way.id,
                    way_id: way.id,
                    osm_name: way.tags?.name || 'Unnamed Road',
                    highway_type: way.tags?.highway,
                    geom_wkt: lineString,
                })
            }
        }

        // Batch insert into Supabase
        // We'll use a stored procedure or multiple inserts because of the WKT
        // For simplicity in this script, we'll use a raw SQL approach via a RPC if available
        // or just transform to a format Supabase likes.

        // Let's assume we have an RPC 'ingest_segments' that takes a JSON array
        // Or we can try to use the 'segments' table directly if it accepts WKT strings as geom (it doesn't usually via JS client)

        // Better: Send to a server action or separate script that uses the service role and raw pg

        return NextResponse.json({
            message: 'Successfully fetched OSM data',
            wayCount: segments.length,
            sample: segments.slice(0, 5)
        })
    } catch (err) {
        console.error('OSM Ingestion Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
