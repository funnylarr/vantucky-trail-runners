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

        // Use batch ingestion in chunks for high performance and to avoid timeouts
        const chunkSize = 500
        for (let i = 0; i < segments.length; i += chunkSize) {
            const chunk = segments.slice(i, i + chunkSize)
            const { error: insertError } = await supabaseAdmin.rpc('batch_ingest_osm_segments', {
                p_segments: chunk
            })

            if (insertError) {
                console.error(`Error ingesting chunk ${i / chunkSize}:`, insertError)
            }
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
