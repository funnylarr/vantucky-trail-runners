-- 1. CLEANUP / SETUP TABLES
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE IF NOT EXISTS segments (
  id BIGINT PRIMARY KEY,
  way_id BIGINT NOT NULL,
  osm_name TEXT,
  highway_type TEXT,
  length_meters DOUBLE PRECISION DEFAULT 0,
  geom GEOMETRY(LineString, 4326) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS segments_geom_idx ON segments USING GIST (geom);

CREATE TABLE IF NOT EXISTS user_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  segment_id BIGINT NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  activity_id TEXT,
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, segment_id)
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  distance DOUBLE PRECISION,
  moving_time INTEGER,
  start_date TIMESTAMP WITH TIME ZONE,
  summary_polyline TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. HELPER TO INGEST OSM SEGMENTS (Calculates Length)
CREATE OR REPLACE FUNCTION ingest_osm_segment(
  p_id BIGINT,
  p_way_id BIGINT,
  p_name TEXT,
  p_highway TEXT,
  p_wkt TEXT
) RETURNS VOID AS $$
BEGIN
  INSERT INTO segments (id, way_id, osm_name, highway_type, geom, length_meters)
  VALUES (
    p_id, 
    p_way_id, 
    p_name, 
    p_highway, 
    ST_GeomFromText(p_wkt, 4326),
    ST_Length(ST_GeomFromText(p_wkt, 4326)::geography)
  )
  ON CONFLICT (id) DO UPDATE SET
    osm_name = EXCLUDED.osm_name,
    highway_type = EXCLUDED.highway_type;
END;
$$ LANGUAGE plpgsql;

-- 3. CORE LOGIC: MATCH GPS TRACE TO TRAILS
CREATE OR REPLACE FUNCTION match_activity_to_segments(
  p_user_id UUID,
  p_activity_id TEXT,
  p_trace_wkt TEXT,
  p_buffer_meters DOUBLE PRECISION DEFAULT 15
) RETURNS TABLE (segment_id BIGINT) AS $$
BEGIN
  RETURN QUERY
  INSERT INTO user_segments (user_id, segment_id, activity_id)
  SELECT 
    p_user_id, 
    s.id, 
    p_activity_id
  FROM segments s
  WHERE ST_DWithin(
    s.geom::geography, 
    ST_GeomFromText(p_trace_wkt, 4326)::geography, 
    p_buffer_meters
  )
  ON CONFLICT (user_id, segment_id) DO NOTHING
  RETURNING user_segments.segment_id;
END;
$$ LANGUAGE plpgsql;

-- 4. UTILITY: CALCULATE TOTAL UNIQUE MILES FOR A USER
CREATE OR REPLACE FUNCTION get_user_unique_miles(p_user_id UUID)
RETURNS DOUBLE PRECISION AS $$
DECLARE
  total_meters DOUBLE PRECISION;
BEGIN
  SELECT SUM(s.length_meters)
  INTO total_meters
  FROM segments s
  JOIN (
    SELECT DISTINCT segment_id 
    FROM user_segments 
    WHERE user_id = p_user_id
  ) us ON us.segment_id = s.id;
  
  -- Convert to miles and return
  RETURN COALESCE(total_meters, 0) * 0.000621371;
END;
$$ LANGUAGE plpgsql;
