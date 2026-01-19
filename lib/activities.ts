import { supabase } from './supabase'

/**
 * Matches a GPS trace (array of [lat, lng]) to the OSM segments in the database.
 * Uses PostGIS 'ST_DWithin' or 'ST_Intersects' with a small buffer.
 */
export async function matchTraceToSegments(userId: string, activityId: string, trace: [number, number][]) {
    // 1. Convert trace to WKT linestring
    const wkt = `LINESTRING(${trace.map(p => `${p[1]} ${p[0]}`).join(',')})`

    // 2. Call a SQL function in Supabase to find intersecting segments
    // We'll use a raw query or an RPC
    const { data, error } = await supabase.rpc('match_activity_to_segments', {
        p_user_id: userId,
        p_activity_id: activityId,
        p_trace_wkt: wkt,
        p_buffer_meters: 20 // Slightly larger buffer for GPS noise
    })

    if (error) {
        console.error('Error matching segments:', error)
        return null
    }

    return data
}

/**
 * SQL for the 'match_activity_to_segments' function (to be run in Supabase):
 * 
 * CREATE OR REPLACE FUNCTION match_activity_to_segments(
 *   p_user_id UUID,
 *   p_activity_id TEXT,
 *   p_trace_wkt TEXT,
 *   p_buffer_meters DOUBLE PRECISION
 * ) RETURNS TABLE (segment_id BIGINT, length_meters DOUBLE PRECISION) AS $$
 * BEGIN
 *   -- Find segments that intersect with the buffered trace
 *   -- AND haven't been visited by this user yet (or just record the visit)
 *   -- For simplicity, we record every visit and use DISTINCT later for "unique miles"
 *   
 *   RETURN QUERY
 *   INSERT INTO user_segments (user_id, segment_id, activity_id)
 *   SELECT 
 *     p_user_id, 
 *     s.id, 
 *     p_activity_id
 *   FROM segments s
 *   WHERE ST_DWithin(
 *     s.geom, 
 *     ST_GeomFromText(p_trace_wkt, 4326), 
 *     p_buffer_meters / 111320.0 -- Very rough degree conversion, or use geography
 *   )
 *   ON CONFLICT (user_id, segment_id) DO NOTHING
 *   RETURNING segment_id, length_meters; -- Error fix: segments table needs length_meters
 * END;
 * $$ LANGUAGE plpgsql;
 */
