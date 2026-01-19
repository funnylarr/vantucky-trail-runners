import { NextResponse } from 'next/server'
import { supabase, supabaseAdmin } from '@/lib/supabase'

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
                const lineString = `LINESTRING(${way.geometry.map((p: any) => `${p.lon} ${p.lat}`).join(',')})`

                segments.push({
                    id: way.id,
                    way_id: way.id,
                    osm_name: way.tags?.name || 'Unnamed Road',
                    highway_type: way.tags?.highway,
                    geom_wkt: lineString,
                })
            }
        }

        // Use a single SQL query via RPC or raw SQL to ingest and calculate lengths
        // For the prototype, we'll use a refined approach:
        for (const segment of segments) {
            const { error: insertError } = await supabaseAdmin.rpc('ingest_osm_segment', {
                p_id: segment.id,
                p_way_id: segment.way_id,
                p_name: segment.osm_name,
                p_highway: segment.highway_type,
                p_wkt: segment.geom_wkt
            })

            if (insertError) console.error('Insert error:', insertError)
        }

        return NextResponse.json({
            message: 'Successfully fetched and ingested OSM data',
            wayCount: segments.length
        })
    } catch (err) {
        console.error('OSM Ingestion Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
