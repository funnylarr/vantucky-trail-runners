-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Table for OpenStreetMap road/trail segments in Clark County
CREATE TABLE IF NOT EXISTS segments (
  id BIGINT PRIMARY KEY,
  way_id BIGINT NOT NULL,
  osm_name TEXT,
  highway_type TEXT,
  length_meters DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(LineString, 4326) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for spatial queries
CREATE INDEX IF NOT EXISTS segments_geom_idx ON segments USING GIST (geom);

-- Table for tracking which user has visited which segment
CREATE TABLE IF NOT EXISTS user_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  segment_id BIGINT NOT NULL REFERENCES segments(id) ON DELETE CASCADE,
  activity_id TEXT, -- Strava activity ID that triggered this
  visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, segment_id)
);

-- Table for caching Strava activity metadata
CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY, -- Strava activity ID
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  distance DOUBLE PRECISION,
  moving_time INTEGER,
  start_date TIMESTAMP WITH TIME ZONE,
  summary_polyline TEXT,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for user profiles and Strava tokens
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  strava_athlete_id BIGINT UNIQUE,
  strava_access_token TEXT,
  strava_refresh_token TEXT,
  strava_token_expires_at BIGINT,
  total_unique_miles DOUBLE PRECISION DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
