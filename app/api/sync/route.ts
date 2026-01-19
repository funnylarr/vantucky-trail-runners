import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { cookies } from 'next/headers'
import { decodePolyline } from '@/lib/geo'
import { matchTraceToSegments } from '@/lib/activities'

export async function POST() {
    const cookieStore = await cookies()
    const athleteId = cookieStore.get('strava_athlete_id')?.value

    if (!athleteId) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    try {
        // 1. Get tokens from DB
        const { data: profile, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('*')
            .eq('strava_athlete_id', athleteId)
            .single()

        if (profileError || !profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        // 2. PRE-CHECK: Do we have segments in the DB?
        const { count, error: countError } = await supabaseAdmin
            .from('segments')
            .select('*', { count: 'exact', head: true })

        if (countError || count === 0) {
            return NextResponse.json({
                error: 'Map data not loaded yet. Please run the trail ingestion first!',
                details: 'The segments table is empty. Visit .../api/admin/ingest-osm'
            }, { status: 400 })
        }

        // 3. Fetch activities from Strava
        const stravaResponse = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=30`, {
            headers: {
                'Authorization': `Bearer ${profile.strava_access_token}`
            }
        })

        if (!stravaResponse.ok) {
            // Check if token expired
            if (stravaResponse.status === 401) {
                return NextResponse.json({ error: 'Strava token expired. Please re-login.' }, { status: 401 })
            }
            return NextResponse.json({ error: 'Failed to fetch Strava activities' }, { status: 500 })
        }

        const activities = await stravaResponse.json()
        let matchingCount = 0

        // 3. Process each activity
        for (const activity of activities) {
            if (activity.type !== 'Run' && activity.type !== 'TrailRun') continue

            // Check if already processed
            const { data: existing } = await supabaseAdmin
                .from('activities')
                .select('id')
                .eq('id', activity.id.toString())
                .single()

            if (existing) continue

            // Decode polyline
            if (!activity.map?.summary_polyline) continue
            const points = decodePolyline(activity.map.summary_polyline)

            // Save activity metadata
            await supabaseAdmin.from('activities').insert({
                id: activity.id.toString(),
                user_id: profile.id,
                name: activity.name,
                distance: activity.distance,
                moving_time: activity.moving_time,
                start_date: activity.start_date,
                summary_polyline: activity.map.summary_polyline,
                processed: true
            })

            // Run matching
            await matchTraceToSegments(profile.id, activity.id.toString(), points as [number, number][])
            matchingCount++
        }

        // 4. Update total distance
        const { data: stats } = await supabaseAdmin.rpc('get_user_unique_miles', {
            p_user_id: profile.id
        })

        if (stats) {
            await supabaseAdmin
                .from('profiles')
                .update({ total_unique_miles: stats })
                .eq('id', profile.id)
        }

        return NextResponse.json({
            message: 'Sync complete',
            processedCount: matchingCount,
            totalMiles: stats || 0
        })

    } catch (err) {
        console.error('Sync Error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
